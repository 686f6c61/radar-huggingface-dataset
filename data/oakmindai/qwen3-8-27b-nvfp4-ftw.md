# oakmindai/Qwen3.8-27B-NVFP4-FTW

## Resumen

`oakmindai/Qwen3.8-27B-NVFP4-FTW` es un checkpoint experimental publicado por oakmindai que repaqueta el modelo `Inferact/Qwen3.8-27B-NVFP4` en el formato FreeToken Weight (FTW) utilizado por el motor de inferencia SparkLab. No se trata de un modelo reentrenado ni de una nueva cuantización: es una conversión de layout de tensores pensada para ejecutar un modelo denso de 27B parámetros en un único NVIDIA DGX Spark con 128 GB de memoria unificada coherente.

El modelo base es `Qwen/Qwen3.8-27B`, un transformer denso de 27B parámetros, cuantizado en NVFP4 mediante ModelOpt. El checkpoint FTW incluye tres shards de pesos con un tamaño total de 24 617 562 112 bytes (24.62 GB). SparkLab permite servir este modelo con APIs compatibles con OpenAI y Anthropic, y ofrece un perfil opcional de decodificación especulativa DFlash2 que, según las pruebas del autor, alcanza 45.88 tokens/s frente a los 8.83 tokens/s del modo sin especulación.

La relevancia del modelo radica en su disponibilidad para entornos DGX Spark y en el uso de FTW para preparar el layout de tensores de forma reproducible, evitando el offloading a NVMe en modelos densos. Sin embargo, es un artefacto experimental: el contexto declarado de 262K no ha sido validado en esta ruta, y las pruebas de calidad a gran escala siguen pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 27B (modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible (modelo denso, no aplica MoE) |
| Longitud de contexto | 262K declarado en el modelo base, no validado en esta ruta; probado hasta 65 536 tokens |
| Tipos de cuantizacion | NVFP4 (ModelOpt) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | FreeToken Weight (FTW), no safetensors estandar |

## Arquitectura y entrenamiento

El checkpoint no introduce un modelo nuevo ni un entrenamiento adicional. Repaqueta los pesos cuantizados en NVFP4 del modelo `Inferact/Qwen3.8-27B-NVFP4`, que a su vez se deriva del modelo denso `Qwen/Qwen3.8-27B`. La arquitectura es un transformer denso de 27B parámetros, sin componentes MoE. La conversión a FTW realiza una preparacion del layout de tensores para la carga nativa reproducible en SparkLab; los tensores no cuantizados mantienen su layout de conversion en tiempo de ejecucion.

El modelo es un artefacto de texto: los metadatos heredados del procesador no habilitan imagenes ni video en SparkLab. No se proporcionan datos sobre el dataset de entrenamiento, ya que no hubo entrenamiento. La innovacion tecnica relevante es el formato FTW y la integracion con el motor SparkLab para el entorno DGX Spark, incluyendo el soporte opcional de DFlash2 para decodificacion especulativa.

## Capacidades

- Generacion de texto: el modelo es capaz de producir respuestas de texto en conversaciones multi-turno mediante la API de chat completions.
- Tool calling y function calling: las pruebas del autor incluyen "tool/coding probes" que pasaron en el modo target-only.
- Razonamiento: los "reasoning probes" pasaron en el modo target-only, lo que indica capacidad basica de razonamiento.
- Agentes y multi-step reasoning: soportado en el modo target-only, aunque no se detallan pruebas exhaustivas.
- Decodificacion especulativa: soporte opcional via DFlash2, con un perfil de 12 tokens especulativos que mejora la velocidad de decodificacion.
- Capacidades multilingues: no disponible.
- Vision/audio: no soportado; es un modelo solo de texto.

## Casos de uso

- Inferencia local en NVIDIA DGX Spark: el modelo se ejecuta residente en la memoria unificada de 128 GB, sin necesidad de offloading NVMe, ideal para entornos de borde o prototipado en un unico dispositivo.
- Asistentes de chat con contexto largo: con la configuracion de 65 536 tokens de ventana, puede mantener conversaciones largas con memoria de historial amplia, por ejemplo en soporte tecnico o documentacion interactiva.
- Generacion de codigo en local: las pruebas de "coding probes" pasaron en el modo target-only; puede usarse como asistente de codigo en entornos de desarrollo personales o equipos pequenos.
- Razonamiento matematico: el barrido de 512 tokens sin thinking mode alcanzo 59.58 tok/s en cargas de matematicas, lo que lo hace util para problemas aritmeticos o logicos sencillos en tiempo real.
- Investigacion en decodificacion especulativa: el perfil DFlash2 permite experimentar con la aceleracion de inferencia, midiendo mejoras de hasta 21.7% frente a un control DFlash2-8.
- Prototipado de agentes conversacionales: al soportar tool calling y APIs compatibles con OpenAI/Anthropic, puede integrarse en prototipos de agentes que necesitan interaccion con herramientas externas.
- Servicio de inferencia reproducible: el uso de FTW permite reproducir el layout de tensores en despliegues controlados, util en entornos de validacion de hardware o comparacion de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el autor proporciona mediciones de rendimiento de inferencia single-stream en DGX Spark:

| Perfil / carga de trabajo | Decode (tok/s) | Warm TTFT (s) |
|---|---:|---:|
| Target-only baseline | 8.83 | 0.144 |
| Optimizado DFlash2-12, sonda de 128 tokens | 45.88 | 0.152 |
| Control DFlash2-8 (sonda de 128 tokens) | 37.69 | no disponible |
| Carga de matematicas, 512 tokens, thinking-off | 59.58 | no disponible |
| Carga de codigo, 512 tokens, thinking-off | 37.51 | no disponible |
| Carga de prosa, 512 tokens, thinking-off | 19.26 | no disponible |

Estos valores son individuales y no representan promedios de una suite de tareas. El resultado de DFlash2 es la mediana de tres pruebas y reproduce la salida del modo target-only en la sonda corta. El autor advierte que trazas mas largas pueden diferir debido al redondeo de punto flotante en la agrupacion de verificacion.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra separada; el modelo requiere un NVIDIA DGX Spark con 128 GB de memoria unificada coherente.
- GPU recomendadas: NVIDIA DGX Spark con GB10/SM121, arquitectura ARM64, CUDA 13 y NVMe local.
- Compatibilidad con GPU de consumo: no indicada; no se mencionan pruebas en RTX 4090 ni similares.
- Opciones de despliegue: exclusivamente SparkLab, con servidor nativo para APIs de chat completions compatibles con OpenAI/Anthropic. No es compatible con vLLM, llama.cpp, Ollama ni TGI como checkpoint estandar.
- Latencia y throughput: single-stream, 8.83 tok/s en modo target-only y 45.88 tok/s con DFlash2-12. El warm TTFT es de 0.144 s y 0.152 s respectivamente.

## Comparativa con modelos similares

No se dispone de datos comparables en la informacion proporcionada. El modelo base `Qwen/Qwen3.8-27B` existe en versiones cuantizadas como `unsloth/Qwen3.8-27B-NVFP4` o `qwen3.8:27b-nvfp4` en Ollama, pero no se aportan especificaciones, benchmarks ni resultados de rendimiento de esos checkpoints. Por tanto, la comparativa con modelos de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- El contexto declarado de 262K no ha sido validado en esta ruta de GB10; solo se ha probado la recuperacion exacta hasta 65 536 tokens.
- El perfil DFlash2 es opt-in y funciona solo en modo greedy con batch de una sola peticion; el contexto especulativo de 64K, el sampling, la concurrencia y la certificacion de resistencia no estan completos.
- Este upload reutiliza un artefacto previamente probado, no constituye una nueva prueba de GPU.
- No es un checkpoint estandar de Transformers/vLLM en safetensors; requiere el motor SparkLab y no puede cargarse directamente en otros frameworks.
- Es un modelo solo de texto; no soporta imagenes ni video a pesar de los metadatos heredados.
- No se han publicado evaluaciones de sesgos ni de alucinacion especificas para este repaqueteo.
- La paridad en salidas cortas no establece equivalencia de calidad a gran escala; la certificacion Fast-tier completa, incluida una prueba de resistencia de 60 minutos, sigue pendiente.

## Enlaces

- HuggingFace: https://huggingface.co/oakmindai/Qwen3.8-27B-NVFP4-FTW
- Modelo base cuantizado: https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio SparkLab: https://github.com/sixteen-miles-labs/sparklab
- Guia de modelos SparkLab para Qwen3.8-27B: https://github.com/sixteen-miles-labs/sparklab/blob/main/docs/models/qwen3.8-27b.md
- Evidencia de rendimiento DFlash2: https://github.com/sixteen-miles-labs/sparklab/blob/main/benchmarks/gb10/results/GB10-QWEN38-DFLASH-004.json
- Evidencia de rendimiento target-only: https://github.com/sixteen-miles-labs/sparklab/blob/main/benchmarks/gb10/results/GB10-QWEN38-27B-001.json
