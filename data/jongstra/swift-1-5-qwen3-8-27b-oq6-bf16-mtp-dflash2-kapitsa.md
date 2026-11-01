# jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo de lenguaje de 27.781 millones de parámetros derivado de Qwen3.8-27B y afinado por el usuario ukisai. Esta ficha concreta, publicada por jongstra, no es un modelo nuevo sino una reempaquetación cuantizada del mismo: los pesos se han convertido a oQ6 (precisión mixta de 6 y 8 bits con escalas en bf16) y se han organizado para que el motor de inferencia Kapitsa pueda servirlos en Apple Silicon. Incluye la cabeza de predicción multi-token (MTP) original del modelo base en un fichero sidecar y un drafter DFlash2 para decodificación especulativa.

El problema que resuelve es de infraestructura, no de capacidades: Kapitsa exigía metadatos de cuantización en bf16 y una cabeza MTP en un fichero sidecar separado, y ninguna compilación previa de Swift cumplía ambos requisitos. Con este paquete, el modelo decodifica a velocidad comparable a la compilación propia de Kapitsa del mismo 27B (47,4 tok/s en prosa y 66,6 tok/s en código sobre un M2 Ultra), manteniendo el torre de visión y el contexto de 262.144 tokens.

Es relevante para desarrolladores que quieran ejecutar un modelo de 27B en local sobre hardware Apple con decodificación especulativa y ventana de contexto larga, aunque su utilidad queda acotada al ecosistema MLX/Kapitsa y a la licencia propietaria swift-open-license-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 capas), derivado de Qwen3.8-27B, con cabeza MTP y torre de visión |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | oQ6: precisión mixta sensible, 455 módulos lineales a 6 bits grupo 64 y 50 a 8 bits grupo 64; escalas en bf16; cabeza MTP a 6 bits (tres proyecciones a 8 bits); drafter DFlash2 con proyecciones a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` sidecar y carpeta `dflash2/` |
| Tamano del repo | 28,1 GB (22,5 GB de pesos mapeados + 1,86 GB de drafter residente + KV) |
| Libreria / runtime | MLX, Kapitsa 0.2.25 o superior |
| Hardware objetivo | Apple Silicon (M1/M2/M3/M4), ~28 GB libres recomendados |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 64 capas heredado de Qwen3.8-27B, del que Swift 1.5 es un fine-tune. Sobre ese tronco se conservan dos componentes adicionales: una cabeza de predicción multi-token (MTP) que permite al modelo proponer varios tokens por paso y acelerar la decodificación, y una torre de visión que habilita la entrada de imágenes. El paquete incluye además un drafter DFlash2 de 5 capas, hidden 5120 y proyecciones a 4 bits, copiado sin modificar de `incoai/Qwen3.8-27B-DFlash2` (Apache-2.0), entrenado contra el tronco Qwen3.8-27B original del que parte Swift.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el fine-tune de Swift 1.5. La innovación técnica destacable de este repositorio es el proceso de cuantización: oMLX 0.7.3 con `oq_level=6`, `group_size=64`, `dtype="bfloat16"` y `preserve_mtp=True`, asignando precisión por capa según un mapa de sensibilidad (`oq_sensitivity_map.json`). La cabeza MTP se copia literalmente a `mtp.safetensors` sin recuantizar. El resultado se sirve con decodificación especulativa tipo árbol (KFlash) sobre el lattice DFlash2, con verificación en árbol.

## Capacidades

- Generación de texto conversacional y continuaciones largas con contexto de hasta 262.144 tokens.
- Razonamiento y respuesta a instrucciones heredados del fine-tune Swift 1.5 sobre Qwen3.8-27B.
- Generación de código, con throughput medido superior al de prosa (66,6 frente a 47,4 tok/s).
- Comprensión de imágenes mediante la torre de visión preservada (el log de arranque indica "images on").
- Decodificación especulativa con drafter DFlash2 y cabeza MTP propia, con fallback a MTP si se omite el drafter.
- Servicio compatible con APIs OpenAI y Anthropic a través de Kapitsa (`/v1`).
- Soporte de múltiples slots concurrentes (`--slots N`), cada uno con su propia conversación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo genera código a 66,6 tok/s en un M2 Ultra, suficiente para autocompletado y generación de funciones en editores o scripts CLI sin enviar código a la nube.
- Procesamiento de documentos largos: con 256K de contexto se pueden cargar contratos, informes o bases de código completas y hacer preguntas sobre ellas en una sola pasada.
- Análisis de capturas y diagramas: la torre de visión permite extraer texto de imágenes, describir diagramas de arquitectura o interpretar tablas escaneadas en un flujo local.
- Chatbot de atención al cliente autoalojado: Kapitsa expone una API compatible con OpenAI, de modo que se puede conectar un frontend existente y mantener conversaciones multi-turno con slots concurrentes.
- Prototipado de agentes con contexto largo: la ventana de 262K y el soporte de múltiples slots permiten mantener historiales extensos de herramientas y observaciones sin truncar.
- Inferencia privada en estación de trabajo: al ejecutarse íntegramente en Apple Silicon con `--private` (bind a loopback), es apto para datos sensibles que no pueden salir del equipo.
- Evaluación comparativa de decodificación especulativa: útil para medir el impacto de DFlash2 frente a MTP puro (`--dflash none`) en un mismo hardware.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un M2 Ultra (GPU de 60 núcleos, 64 GB), Kapitsa 0.2.25, un slot, generaciones de 700 tokens, mediana de tres ejecuciones:

| Configuracion | Prosa (tok/s) | Codigo (tok/s) |
|---|---:|---:|
| Este repo tal cual (lattice DFlash2) | 47,4 | 66,6 |
| `qwen3.8-27b:6bit` de Kapitsa (referencia) | 45,1 | 66,3 |
| Este repo con `--dflash none` (solo MTP) | no disponible (descrito como "mediblemente más lento") | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son de throughput y de carga: la cabeza MTP se carga en 178 ms y el drafter ocupa 1,86 GB residentes.

## Requisitos de hardware

- VRAM/ memoria unificada: unos 28 GB libres para pesos (22,5 GB mapeados), drafter (1,86 GB) y un slot de conversación con su KV cache.
- Hardware objetivo: Apple Silicon. El autor lo ha medido en un M2 Ultra de 64 GB; con 64 GB cabe un contexto de 256K, y con menos memoria conviene reducir `--context`.
- GPU recomendadas: M2 Ultra (60 núcleos GPU) como referencia; M1/M2 no tienen BF16 nativo, por lo que para oMLX se recomienda la variante fp16 (`jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp`), aproximadamente un 20% más rápida en prefill.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que es específico de MLX/Kapitsa.
- Despliegue: Kapitsa 0.2.25 o superior, cargando por ruta de carpeta (`kapitsa serve --model ~/models/swift15-oq6-kapitsa`). No es seleccionable por nombre desde el catálogo. Alternativas como vLLM, llama.cpp, Ollama o TGI no aplican a este formato.
- Flags útiles: `--context N`, `--slots N`, `--prefill-chunk 4096` (mejora el prefill en prompts grandes), `--private`, `--dflash none` (libera 1,86 GB a costa de velocidad).
- Throughput: 47,4 tok/s en prosa y 66,6 tok/s en código en M2 Ultra; sin datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput (M2 Ultra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Swift 1.5 Qwen3.8-27B oQ6 + DFlash2) | 27,8B | 262.144 | 47,4 / 66,6 tok/s (prosa/código) | swift-open-license-1.0 | HuggingFace, MLX/Kapitsa |
| `qwen3.8-27b:6bit` de Kapitsa | 27B (aprox.) | no disponible | 45,1 / 66,3 tok/s | no disponible | Catálogo integrado de Kapitsa |
| `jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp` | 27,8B | no disponible | ~20% más rápido en prefill con oMLX | no disponible | HuggingFace, MLX/oMLX |
| `ukisai/Swift-1.5-Qwen3.8-27b` (base sin cuantizar) | 27,8B | no disponible | no disponible | no disponible | HuggingFace |

La comparación de calidad frente a otras familias de 27B-30B (por ejemplo, variantes densas de Qwen o Llama) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria `swift-open-license-1.0`: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; no es una licencia open source estándar.
- Dependencia fuerte de Kapitsa 0.2.25 o superior: versiones anteriores rechazan el sidecar MTP de 6 bits con el error `mtp.layers.0.self_attn.q_proj: unsupported quantization`.
- El modelo no se puede seleccionar por nombre en el catálogo de Kapitsa; hay que arrancarlo por ruta de carpeta, lo que complica la automatización del despliegue.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes.
- El drafter DFlash2 se entrenó contra el tronco Qwen3.8-27B original, no contra el fine-tune Swift, por lo que la tasa de aceptación especulativa puede no ser óptima.
- Los shards conservan copias redundantes de `language_model.mtp.*` que Kapitsa ignora y que ocupan unos 400 MB adicionales.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el comportamiento habitual de modelos de 27B en tareas factuales.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede asumir un rendimiento multilingüe homogéneo.
- Si el descargador omite directorios con punto, falta `.kapitsa/manifest.json` y el modelo no aparece en `kapitsa list` (aunque sigue cargando por ruta).
- Si falta `mtp.safetensors`, la decodificación especulativa se desactiva; si falta `dflash2/`, el modelo funciona pero aproximadamente un 30% más lento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa
- Modelo base (fine-tune): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Variante para oMLX (fp16): https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp
- Drafter DFlash2 original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- CHANGES.md del repo: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa/blob/main/CHANGES.md
- Metadatos de conversión: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa/blob/main/conversion_metadata.json
- Licencia: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-dflash2-kapitsa/blob/main/LICENSE
