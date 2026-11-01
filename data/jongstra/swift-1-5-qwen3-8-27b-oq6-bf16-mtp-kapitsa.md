# jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-kapitsa

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo de lenguaje de ~27.800 millones de parámetros desarrollado por ukisai, construido sobre la familia Qwen3.5 y distribuido como modelo base en HuggingFace. El checkpoint que nos ocupa, `jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-kapitsa`, no es un modelo nuevo entrenado desde cero, sino una cuantización derivada del modelo base, empaquetada específicamente para el motor de inferencia Kapitsa sobre Apple Silicon.

El problema que resuelve esta variante es de infraestructura, no de modelado: Kapitsa exige metadatos de cuantización en bf16 y una cabeza MTP (multi-token prediction) en un archivo sidecar separado, condiciones que ninguna build de Swift cumplía hasta la fecha. Este repositorio aporta exactamente esa pieza, preservando la cabeza MTP original del modelo base para habilitar decodificación especulativa, además de mantener la torre de visión intacta.

Es relevante ahora porque permite servir un modelo de 27B con capacidades multimodales y decodificación especulativa en hardware de consumo Apple (un M2 Ultra de 64 GB lo mapea en 22,5 GB), con velocidades de decodificación medidas de 33,7 tok/s en prosa y 43,6 tok/s en código. La cuantización oQ6 es una mezcla de precisión dirigida por sensibilidad, no un 6-bit uniforme: 455 módulos lineales a 6-bit y 50 a 8-bit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 capas), familia Qwen3.5, con cabeza MTP para decodificación especulativa y torre de visión |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | oQ6 (oMLX sensitivity-driven mixed precision): 455 módulos a 6-bit group 64, 50 módulos a 8-bit group 64; escalas en bf16; cabeza MTP a 6-bit group 64 |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), con sidecar `mtp.safetensors` y `oq_sensitivity_map.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas, identificado en los metadatos como `qwen3_5`, lo que lo sitúa en la estirpe Qwen3.5. Incorpora dos componentes adicionales relevantes: una cabeza de predicción multi-token (MTP) que actúa como drafter para decodificación especulativa, y una torre de visión que permite entrada de imágenes. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica de este checkpoint concreto reside en el proceso de cuantización. Se aplicó el cuantizador en streaming de oMLX 0.7.3 con `oq_level=6`, `group_size=64`, `dtype="bfloat16"` y `preserve_mtp=True`, asignando precisión por capa según un mapa de sensibilidad (`oq_sensitivity_map.json`). El resultado es una asignación no uniforme: de 505 módulos lineales cuantizados, 455 quedan a 6 bits y 50 a 8 bits, presumiblemente los más sensibles. La cabeza MTP se copió literalmente a `mtp.safetensors` sin recuantizar. El autor advierte que las copias originales `language_model.mtp.*` permanecen en los shards y en el índice, con un coste aproximado de 400 MB que Kapitsa ignora.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, con velocidades medidas superiores en código que en prosa.
- Comprensión de imágenes gracias a la torre de visión preservada en la cuantización.
- Decodificación especulativa mediante la cabeza MTP original de Swift, con profundidad 4 configurada en las pruebas del autor.
- Razonamiento y generación de código: el modelo base pertenece a la familia Qwen3.5, si bien no se documentan benchmarks específicos en la información disponible.
- Servido mediante API compatible con OpenAI y Anthropic a través de Kapitsa (`/v1`).
- Soporte de múltiples slots concurrentes, cada uno con su propia conversación, configurable con `--slots`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y agentes: no documentado en la información disponible para este checkpoint.

## Casos de uso

- Asistencia de código en local sobre Mac: con 43,6 tok/s de decodificación en código medida en un M2 Ultra, el modelo es viable para autocompletado y generación de funciones en un flujo de trabajo de desarrollo sin depender de la nube, manteniendo el código en la máquina del desarrollador.
- Chat multimodal con imágenes: la torre de visión preservada permite enviar capturas de pantalla o diagramas junto con texto, útil para depuración visual, explicación de gráficos o extracción de información de documentos escaneados.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite cargar contratos, informes o bases de código extensas en una sola conversación; el autor indica que 256K caben en un Mac de 64 GB, aunque recomienda reducir `--context` si la memoria es ajustada.
- Servidor de inferencia personal con API compatible: Kapitsa expone endpoints compatibles con OpenAI y Anthropic en `http://127.0.0.1:8000/v1`, lo que permite conectar clientes existentes (IDE, frameworks de agentes, scripts) sin adaptadores.
- Prototipado de aplicaciones conversacionales multi-turno: el flag `--slots N` permite atender varias conversaciones concurrentes, cada una con su propio estado, adecuado para demos y pruebas de producto en local.
- Evaluación comparativa de motores de inferencia: el autor documenta explícitamente el uso de este checkpoint para comparar oMLX frente a Kapitsa, advirtiendo que ambas ramas deben construirse con la misma versión de oMLX para aislar la variable del motor.
- Despliegue en hardware Apple Silicon sin GPU dedicada: con 22,5 GB mapeados en un M2 Ultra, el modelo encaja en estaciones de trabajo Mac de gama alta como alternativa a servidores con GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta micro-benchmarks de velocidad de inferencia en un M2 Ultra (GPU de 60 núcleos, 64 GB), con Kapitsa 0.2.25, un slot, decodificación especulativa MTP a profundidad 4 y generaciones de 700 tokens, mediana de tres ejecuciones:

| Carga de trabajo | Decodificación (tok/s) |
|---|---:|
| Prosa | 33,7 |
| Código | 43,6 |

El prefill fue de aproximadamente 0,45 s en prompts cortos. El autor califica estas cifras como micro-benchmarks de una sola petición en una única máquina, sin relación con la calidad de salida.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~22,5 GB mapeados para pesos más KV cache, con ~26 GB libres recomendados para el modelo y un slot de conversación (medido en M2 Ultra).
- Tamaño del repositorio: 24,3 GB (pesos cuantizados más cabeza MTP).
- Hardware objetivo: Apple Silicon. El autor menciona M1/M2 sin BF16 nativo y recomienda el checkpoint fp16 gemelo para oMLX en esos chips; el bf16 de este repo existe por requisito de Kapitsa.
- GPU recomendadas: Apple M2 Ultra (64 GB) es la configuración medida. No se documenta soporte para GPU NVIDIA, AMD ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de gama alta con memoria unificada suficiente; no aplica a GPUs discretas de consumo convencionales por el formato MLX.
- Opciones de despliegue: Kapitsa 0.2.25 o superior (obligatorio; versiones anteriores rechazan el sidecar MTP de 6 bits con el error `mtp.layers.0.self_attn.q_proj: unsupported quantization`). Para oMLX se recomienda el checkpoint `jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp`.
- Carga por ruta de carpeta: el modelo no puede seleccionarse por nombre en Kapitsa, ni con `kapitsa serve --model <nombre>`, ni desde el selector interactivo, ni vía `POST /v1/models/switch`. Es una limitación del motor.
- Latencia y throughput: prefill ~0,45 s en prompts cortos; decodificación 33,7-43,6 tok/s según carga (ver tabla anterior).
- Flags útiles: `--context N`, `--slots N`, `--prefill-chunk 4096` (mejora medible del prefill en prompts grandes), `--private` (bind a loopback).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (oQ6 bf16 MTP) | ~27,8 B | 262.144 | MLX / Kapitsa ≥0.2.25 | Swift Open License v1.0 | Escalas bf16 por requisito de Kapitsa; 50 módulos a 8-bit |
| `jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp` | ~27,8 B | 262.144 | MLX / oMLX | Swift Open License v1.0 | Gemelo fp16; ~20% más rápido en prefill en M1/M2; construido con oMLX 0.7.0rc1 (33 módulos a 8-bit) |
| `ukisai/Swift-1.5-Qwen3.8-27b` (base) | ~27,8 B | 262.144 | Safetensors sin cuantizar | Swift Open License v1.0 | Modelo original; mayor huella de memoria; referencia de calidad |

No se dispone de información sobre modelos de otras familias comparables en rendimiento para este checkpoint.

## Limitaciones y advertencias

- No es una reconstrucción bit a bit del repositorio fp16: aunque comparten revisión fuente, `oq_level`, tamaño de grupo y mapa de sensibilidad, la regla de asignación cambió entre oMLX 0.7.0rc1 y 0.7.3 (33 módulos a 8-bit antes, 50 ahora, con 19 módulos distintos). Para comparar motores hay que construir ambas ramas con la misma versión de oMLX.
- Requiere Kapitsa 0.2.25 o superior; versiones anteriores fallan al cargar el sidecar MTP.
- El modelo no es seleccionable por nombre en Kapitsa; debe cargarse por ruta de carpeta. El manifiesto `.kapitsa/manifest.json` solo afecta a si aparece en `kapitsa list`, nunca a si carga.
- Si el descargador omite directorios con punto, el manifiesto puede no descargarse; el autor indica que puede crearse a mano o ignorarse usando la carga por ruta.
- Duplicación de la cabeza MTP: las copias `language_model.mtp.*` permanecen en los shards y en el índice, con un coste de ~400 MB que Kapitsa ignora.
- Dependencia de hardware Apple Silicon: no hay soporte documentado para CUDA ni otras plataformas.
- Las cifras de velocidad son micro-benchmarks de una sola máquina y una sola petición; no son una evaluación rigurosa ni dicen nada sobre la calidad de salida.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe en la información disponible.
- Licencia Swift Open License v1.0: es una licencia propia etiquetada como `other`; deben revisarse sus términos antes de uso comercial. El repositorio incluye el archivo `LICENSE`.
- La torre de visión está preservada, pero no se documentan métricas de calidad multimodal para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-bf16-mtp-kapitsa
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Checkpoint gemelo fp16 para oMLX: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ6-fp16-mtp
- Detalle de cambios: `CHANGES.md` (en el repositorio)
- Metadatos de conversión: `conversion_metadata.json` (en el repositorio)
- Mapa de sensibilidad: `oq_sensitivity_map.json` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
