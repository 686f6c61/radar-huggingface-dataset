# satellitedown/fafstmobel

## Resumen

fafstmobel es un artefacto de pesos derivado de 27B construido localmente por el usuario satellitedown a partir del checkpoint abliterado Swift de Qwen3.8-27B. No se trata de un modelo entrenado desde cero ni de un ajuste fino al uso: es el resultado de transplantar el delta de abliteración observado en la variante Huihui sobre los pesos de Swift (solo 70 tensores de las capas 17 a 51 cambian; los otros 1129 tensores, incluidos visión, MTP, embeddings, normas y cabeza de salida, son idénticos byte a byte al checkpoint Swift), cuantizar la parte de texto a una asignación NVFP4/FP8 y exportar todo a un único contenedor NInfer v3 con el borrador DFlash2 preentrenado incluido.

El modelo se distribuye como un único fichero `fafstmobel.ninfer` de 23.719.715.844 bytes, con arquitectura híbrida de atención (64 capas, hidden 5120, vocabulario 248320, 16 capas de atención completa y 48 de atención lineal) más componentes de visión, MTP y decodificación especulativa DFlash2. Su relevancia práctica está en el rendimiento medido en una única RTX 5090 de 32 GB: 304,1–312,9 tokens/s con DFlash2 frente a 68,5–77,1 tokens/s en modo autorregresivo, es decir, una aceleración de 4,06× a 4,57× con una tasa de aceptación del 54,2%.

El aspecto crítico para producción es que el formato es propietario de NInfer y no se publican pesos en safetensors, GGUF ni cuantizaciones alternativas, y que la licencia del componente Swift (Swift Open License v1.0) restringe el uso comercial por encima de un umbral de un millón de dólares. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas de atención lineal (proyecciones GDN), con componentes de visión, MTP y borrador especulativo DFlash2 |
| Parametros totales | 27B (según la denominación del modelo base Qwen3.8-27B; no se publica el recuento exacto en la model card) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | contexto validado en las pruebas: 16.384 tokens (`--max-context 16384`); la longitud nativa del modelo base no se indica en la información disponible |
| Tipos de cuantizacion | NVFP4 (168 matrices MLP gate/up/down, grupo de 16, pesos de 4 bits y activaciones de 4 bits local-dinámicas con escalas calibradas) y FP8 por canal (233 matrices: atención q/k/v/o, proyecciones GDN in/out, cabeza de salida y capas MLP 56–63); KV cache en fp8. Visión, MTP y proyecciones de puerta GDN sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (etiquetada como `license: other`); los componentes Apache-2.0 se mantienen bajo sus propios términos |
| Formato de pesos | NInfer v3, un único fichero `fafstmobel.ninfer` (1246 objetos, 1240 tensores, 6 recursos, 1513 bindings, 844 usos); no se ofrecen safetensors ni GGUF |
| Tamano del repositorio | 23,7 GB |
| Libreria de inferencia | `ninfer` |
| Vocabulario | 248.320 tokens |
| Capas / hidden size | 64 capas / 5120 |
| Borrador especulativo | DFlash2, 5 capas, taps objetivo [5, 19, 33, 47, 61], bloque 8, selector top-k 16 |
| Hash SHA-256 | `70752ce85422f9d716438f85e80e6b68c496197c41c2aed32b126f1c23ce7364` |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor: es una composición determinista de tres contribuciones upstream. La parte de texto emplea la arquitectura de Qwen3.8-27B, un transformer híbrido con 64 capas que combina 16 capas de atención completa con 48 capas de atención lineal basadas en proyecciones GDN, hidden size 5120 y vocabulario de 248.320 tokens. Sobre esa base se aplicó un transplante de delta de abliteración: no se recalculó una dirección de rechazo, sino que se trasladó la diferencia de pesos observada entre el modelo base y la variante Huihui mediante `result = (swift.float() + (huihui.float() - base.float())).to(bfloat16)`. Afecta exactamente a 70 tensores de las capas 17 a 51 (`mlp.down_proj` y `self_attn.o_proj` en capas de atención completa, `linear_attn.out_proj` en capas de atención lineal), con un máximo de |Δ| de 2,83e-2 y una media de 2,02e-4, reescribiendo 4.220.518.400 elementos.

La cuantización de texto siguió la asignación publicada NVFP4/FP8, calibrada con 32 muestras de UltraChat-200k de 2048 tokens cada una. El export se realizó con la herramienta oficial `tools.convert` de NInfer (revisión `98dada0e03cb073fd07f905400b5904bc6e82759`) y la receta sin modificar `qwen3_8_27b_nvfp4`, incluyendo la plantilla de chat mantenida de Qwen3.8. El cuarto paso fue la normalización de nombres del intermedio de texto (`model.language_model.*` → `model.*`) para hacerlo consistente con la configuración plana solo-texto, reescribiendo únicamente las cabeceras de safetensors y verificándolas contra los digests de cada shard. La innovación técnica destacable no está en el entrenamiento, sino en el empaquetado: el borrador DFlash2 preentrenado se incluye por conversión, sin reentrenar, y se suma al componente MTP como dos vías de decodificación especulativa sobre el mismo artefacto.

## Capacidades

- Generación de texto con plantilla de chat de Qwen3.8 mantenida en el export.
- Razonamiento aritmético básico verificado: la comprobación `17 × 19` devuelve `323` con reproducibilidad idéntica en repetición con la misma semilla.
- Generación de código: ante un prompt de código produce un `def` con slicing válido de 30 tokens.
- Capacidades multimodales: el componente de visión está incluido y sin cuantizar; ante una imagen de 256×256 con mitades roja y azul responde "left is red, right is blue".
- Decodificación especulativa con dos componentes: MTP (aceptación medida del 75,9 %) y DFlash2 (aceptación del 54,2 %).
- Modo sin razonamiento explícito: el CLI documenta la opción `--no-thinking`, lo que implica soporte de modo thinking en el modelo base.
- Servicio HTTP compatible con contrato tipo OpenAI: `/health` y `/v1/models` con id `fafstmobel`, y superación del test `tools.smoke.serve_contract` v2.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Servicio de generación de texto de baja latencia en una sola GPU de consumo: con DFlash2 y `--draft-tokens 7` el modelo sostiene 304,1–312,9 tokens/s en una RTX 5090, lo que permite atender streaming interactivo sin clúster.
- Análisis de imágenes con descripción textual: el componente de visión permite clasificar o describir contenido visual (colores, disposición espacial) y devolver la respuesta en texto, útil para etiquetado automático o verificación visual en pipelines internos.
- Investigación sobre abliteración y direcciones de rechazo: al ser un transplante de delta documentado tensor a tensor, sirve como material de estudio reproducible para medir cómo cambia el comportamiento al modificar únicamente 70 tensores en las capas 17–51.
- Evaluación de decodificación especulativa: el artefacto incluye dos mecanismos de especulación (MTP y DFlash2) con tasas de aceptación publicadas, lo que lo convierte en un banco de pruebas para comparar estrategias de drafting sobre el mismo modelo objetivo.
- Procesamiento de documentos largos en local: con 16.384 tokens de contexto validado y KV cache en fp8, encaja en tareas de resumen o extracción sobre contratos, informes o hilos de conversación extensos sin salir de la estación de trabajo.
- Generación de código en entornos con aislamiento: el modelo produce fragmentos de código Python válidos y puede ejecutarse en local con el runtime NInfer, adecuado para entornos donde no se permite enviar código a APIs externas.
- Experimentación con cuantización NVFP4/FP8 en hardware Blackwell: la asignación por capas (NVFP4 en MLP, FP8 en atención y cabeza de salida) sirve para medir el impacto de la precisión mixta sobre la calidad en una arquitectura híbrida de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye comprobaciones funcionales y medidas de throughput realizadas en una RTX 5090 de 32 GB con contexto 16.384, KV en fp8 y CUDA graphs activados:

| Comprobacion | Resultado |
|---|---|
| Aritmética (`17 × 19`) | `323`; la repetición con la misma semilla es idéntica |
| Prompt de código | `def` con slicing válido, 30 tokens |
| Test de integración DFlash2 en NInfer | salida 0 |
| Servicio | `/health` correcto, `/v1/models` con id `fafstmobel`, `tools.smoke.serve_contract` v2 superado |
| Multimodal | imagen 256×256 roja/azul → "left is red, right is blue" |
| Throughput autorregresivo (semilla 42, greedy, 256 tokens, batch 1) | 68,5–77,1 tok/s |
| Throughput con MTP | 210,0–215,3 tok/s (2,79–3,14×, aceptación 75,9 %) |
| Throughput con DFlash2 | 304,1–312,9 tok/s (4,06–4,57×, aceptación 54,2 %) |

El autor advierte que el throughput autorregresivo varía entre ejecuciones según el estado de la máquina, mientras que las tasas de aceptación de ambos mecanismos de especulación se reprodujeron exactamente en todas las ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto completo ocupa 23,7 GB en disco; la ejecución documentada se realizó en una RTX 5090 de 32 GB con contexto 16.384 y KV cache en fp8. No se publican medidas de VRAM pico ni cifras para contextos mayores o menores.
- GPU recomendadas: la única configuración verificada es RTX 5090 (32 GB) con CUDA 13.1 y Python 3.11, hardware necesario para las rutas NVFP4/FP8. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPUs.
- Cabe en GPU de consumo: sí, en una RTX 5090 de 32 GB según la medición del autor. Para GPUs con menos VRAM no hay datos disponibles.
- Opciones de despliegue: exclusivamente el runtime NInfer (`ninfer-serve` para servicio HTTP y `ninfer` para CLI). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es específico de esa herramienta.
- Latencia y throughput: 68,5–77,1 tok/s en autorregresivo, 210,0–215,3 tok/s con MTP y 304,1–312,9 tok/s con DFlash2, siempre con batch 1, greedy, 256 tokens y contexto 16.384.
- Comando de servicio documentado: `ninfer-serve fafstmobel.ninfer --host 127.0.0.1 --port 8088 --model-id fafstmobel --spec dflash2 --draft-tokens 7 --lm-head-draft --vision --kv-dtype fp8 --max-context 16384 --kv-capacity 16384 --max-concurrency 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| satellitedown/fafstmobel | 27B (denominación del base) | 16.384 validado; nativo no disponible | 304,1–312,9 tok/s con DFlash2 en RTX 5090; sin benchmarks de calidad | Swift Open License v1.0 (uso comercial limitado por umbral de 1 M USD) | NInfer v3, fichero único de 23,7 GB; 0 descargas |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | Apache-2.0 | pesos del modelo base (formato no indicado en la información disponible) |
| ukisai/Swift-Qwen3.8-27b | 27B | no disponible | no disponible | Swift Open License v1.0 | checkpoint upstream del que deriva el componente de texto |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | Apache-2.0 | origen del delta de abliteración transplantado |
| z-lab/Qwen3.8-27B-DFlash2 | 5 capas de borrador | no disponible | no disponible | Apache-2.0 | borrador especulativo preentrenado, incluido sin modificar |

No se dispone de datos de benchmarks que permitan comparar la calidad de fafstmobel frente a estos modelos; la comparación se limita a procedencia, licencia y formato de distribución.

## Limitaciones y advertencias

- El propio autor acota las afirmaciones: es un transplante de delta, no una dirección de rechazo ajustada de nuevo, y no constituye prueba de que todos los rechazos hayan sido eliminados. No se emiten afirmaciones de comportamiento sobre la eliminación de rechazos.
- Modelo con contenido abliterado: puede generar respuestas sin las salvaguardas habituales del modelo base. Requiere revisión humana y filtros propios en cualquier despliegue orientado a usuarios finales.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad factual, veracidad ni tasas de alucinación. Aplica el comportamiento del modelo base, no medido en esta información.
- Restricción de licencia para uso comercial: la Swift Open License v1.0 no autoriza uso comercial a entidades jurídicas que superen el umbral de un millón de dólares (sección 5); por encima de ese umbral se exige una Swift Enterprise License independiente. Las porciones de Qwen3.8-27B, el delta Huihui y el borrador DFlash2 permanecen bajo Apache-2.0.
- Formato y portabilidad: el artefacto solo se ejecuta con el runtime NInfer. No hay safetensors, GGUF ni cuantizaciones alternativas, lo que impide su uso con vLLM, llama.cpp, Ollama o TGI y dificulta la integración en infraestructuras existentes.
- Contexto: la única longitud validada es 16.384 tokens; no se documenta el comportamiento con ventanas mayores ni el contexto nativo del modelo base.
- Idiomas: no se declara cobertura lingüística, por lo que no hay garantías sobre el rendimiento en castellano u otros idiomas distintos del inglés.
- Validación comunitaria nula: 0 descargas y 0 likes, sin informes independientes que reproduzcan las medidas del autor. Las cifras de throughput provienen de una única máquina y el propio autor señala que el modo autorregresivo varía entre ejecuciones.
- Procedencia compleja: el artefacto combina cuatro contribuciones upstream más el runtime; la trazabilidad completa depende de `NOTICE` y `PROVENANCE.md`, que conviene revisar antes de cualquier uso en producción.
- Requisitos de hardware restrictivos: las rutas NVFP4/FP8 solo se han verificado en RTX 5090 con CUDA 13.1. No hay datos de compatibilidad con GPUs anteriores ni con hardware de centro de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satellitedown/fafstmobel
- Modelo base Swift: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Delta de abliteración Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Borrador especulativo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Runtime y conversor NInfer: https://github.com/Neroued/ninfer
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos sin relación (páginas corporativas de un operador ferroviario).
