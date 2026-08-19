# johninthepool/Qwen3.8-27B-MTPLX-4bit

## Resumen

El modelo `johninthepool/Qwen3.8-27B-MTPLX-4bit` es una cuantización en 4 bits del modelo Qwen3.8-27B de Qwen, adaptada específicamente para Apple Silicon mediante la librería MLX. La particularidad de esta build es que, a diferencia de las conversiones estándar con `mlx_lm.convert`, conserva la cabeza de predicción multi-token (MTP) del modelo original en precisión bf16 completa, lo que permite utilizar decodificación especulativa nativa con el motor de inferencia `mtplx`. Esto resulta relevante porque las conversiones MLX habituales eliminan silenciosamente los tensores MTP, perdiendo así una aceleración significativa en la generación de texto.

El modelo base, Qwen3.8-27B, es una arquitectura híbrida que intercala atención lineal Gated DeltaNet con atención Gated Attention, organizada en 16 grupos con una proporción 3:1. Dispone de un contexto nativo de 262 144 tokens, ampliable hasta aproximadamente 1 millón mediante la técnica YaRN. Esta cuantización 4-bit con grupo de tamaño 64 reduce el peso del modelo a unos 17 GB en disco, manteniendo la cabeza MTP sin cuantizar para no sacrificar el rendimiento de la decodificación especulativa.

El modelo está pensado para equipos Apple Silicon con 64 GB o más de memoria unificada, y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) intercalada con Gated Attention, 16 grupos 3:1 |
| Parametros totales | 27B (modelo base); safetensors cuantizado: 4 204 731 904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; hasta ~1M con YaRN |
| Tipos de cuantizacion | 4-bit affine, group size 64; cabeza MTP en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización directa de los pesos originales de `Qwen/Qwen3.8-27B`, sin fine-tuning, destilación ni pasos de calibración. Se trata de una conversión affine de redondeo al más cercano aplicada sobre los pesos en bf16 del modelo base. La arquitectura subyacente es híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención Gated Attention, en una configuración de 16 grupos con proporción 3:1. Esta mezcla permite manejar secuencias largas de forma más eficiente que un transformer denso clásico.

La innovación principal de esta build reside en la política `mtp_policy: keep_bf16`, que conserva la cabeza de predicción multi-token (MTP) en precisión completa bf16 junto al cuerpo cuantizado en 4 bits. La cabeza MTP, compuesta por 15 tensores, es la que habilita la decodificación especulativa nativa en el motor `mtplx`. Las conversiones MLX estándar suelen descartar estos tensores sin avisar, por lo que esta build garantiza que la aceleración por especulación se mantiene operativa. El grupo de cuantización de tamaño 64 se eligió en lugar del valor por defecto de 32 para reducir la sobrecarga de la tabla de dequantización en hardware con memoria unificada abundante, sin pérdida medible de calidad a esta profundidad de bits.

## Capacidades

- Generación de texto conversacional y de larga duración con contexto amplio (hasta 262K tokens).
- Razonamiento encadenado (reasoning) activable o desactivable; se recomienda desactivarlo para tareas de agente o tool-calling para evitar un consumo excesivo de tokens en pensamiento oculto.
- Soporte de tool calling y function calling, según las capacidades del modelo base.
- Capacidad de uso como agente multi-paso con razonamiento, aunque requiere gestionar el modo reasoning según el escenario.
- Decodificación especulativa nativa mediante la cabeza MTP conservada, que acelera la generación en el motor `mtplx`.
- Cuantización del KV cache a 8 bits (`--paged-kv-quantization q8`) para ampliar el contexto útil con pérdida mínima de calidad.
- Compatibilidad con Apple Silicon (M-series) gracias a la librería MLX.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un historial extenso gracias a su ventana de 262K tokens, manteniendo el contexto de la interacción sin truncamientos.
- Generación de código en entornos de desarrollo: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, aprovechando la decodificación especulativa para reducir la latencia.
- Asistentes de productividad personal: redacción de correos, resúmenes de documentos largos o extracción de información de textos extensos, con la posibilidad de desactivar el razonamiento para respuestas directas.
- Agentes autónomos que interactúan con APIs y herramientas externas: al desactivar el modo reasoning, el modelo produce salidas accionables rápidamente, adecuadas para flujos de automatización.
- Análisis de documentos legales o técnicos: la ventana de contexto amplia permite procesar contratos, informes o manuales completos sin necesidad de dividirlos en fragmentos.
- Desarrollo de chatbots multilingües: aunque no se especifican idiomas, el modelo base de Qwen tiene soporte multilingüe; esta cuantización mantiene esas capacidades, permitiendo su despliegue en aplicaciones de soporte global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento para esta cuantización específica, y los datos de benchmarks del modelo base (como DeepSWE, Terminal Bench u OSWorld) no se han verificado para esta build. No se dispone de comparaciones cuantitativas con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: 15,1 GB según LLM Explorer, aunque al ser MLX se utiliza memoria unificada del sistema.
- Hardware recomendado: Apple Silicon (M-series) con 64 GB o más de memoria unificada, según indica la model card.
- No cabe en GPUs de consumo convencionales (RTX, etc.) porque MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: motor `mtplx` (requerido para usar la decodificación especulativa nativa); también puede cargarse con `mlx-lm`, pero sin aprovechar la cabeza MTP.
- Latencia y throughput: no se proporcionan datos concretos; la decodificación especulativa con MTP debería reducir la latencia respecto a una generación autoregresiva estándar, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johninthepool/Qwen3.8-27B-MTPLX-4bit | 27B | 262K | 4-bit + MTP bf16 | Apache-2.0 | HuggingFace |
| johninthepool/Qwen3.8-27B-MTPLX-8bit | 27B | 262K | 8-bit + MTP bf16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (original) | 27B | 262K | bf16 | Apache-2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de información sobre alternativas de otros fabricantes con características equivalentes en el contexto de MLX.

## Limitaciones y advertencias

- La cuantización 4-bit introduce una pequeña pérdida de precisión en los pesos del cuerpo del modelo respecto a la versión bf16 original; la cabeza MTP se mantiene en bf16 para no afectar la decodificación especulativa.
- El uso de la decodificación especulativa nativa requiere el motor `mtplx`; con `mlx-lm` estándar se pierde esa ventaja, aunque el modelo sigue funcionando.
- El modo reasoning puede consumir una gran cantidad de tokens por turno si se deja activado; se recomienda desactivarlo para tareas de agente o tool-calling.
- La cuantización del KV cache a 8 bits es una opción recomendada, pero no es el valor por defecto; hay que configurarla explícitamente.
- No se han publicado resultados de benchmarks para esta build, por lo que el rendimiento real en tareas específicas no está validado.
- El modelo está limitado a hardware Apple Silicon; no es desplegable en GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (GGUF, etc.).
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-4bit
- Repositorio mtplx: https://github.com/philipjohnbasile/mtplx
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 8-bit: https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-8bit
- Entrada en LLM Explorer: https://llm-explorer.com/model/johninthepool%2FQwen3.8-27B-MTPLX-4bit,2dGqCYSF9SboI49L54b258
