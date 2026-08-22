# Azzam15/gemma2-9b-fp8-w8a16-mixed

## Resumen

Este repositorio contiene una cuantización FP8 (W8A16) del modelo `google/gemma-2-9b-it` realizada con NVIDIA ModelOpt. El autor, Azzam15, aplicó la configuración de cuantización por defecto de ModelOpt (`FP8_DEFAULT_CFG`) sobre los pesos del modelo base, dejando las activaciones en FP16. El resultado es un checkpoint de 10.2 GB con 9.241.705.984 parámetros que reduce el tamaño de memoria respecto al modelo original en float16.

La particularidad de esta cuantización es que las escalas de peso se calcularon de forma independiente de los datos de calibración (data-free), por lo que el texto de calibración usado en el repositorio (512 muestras con variedad "mixed") no afecta al resultado de los pesos. Este checkpoint está diseñado como un control para comparar con variantes AWQ del mismo modelo. No es cargable con `transformers` estándar, sino que requiere un motor de inferencia que soporte cuantización ModelOpt, como vLLM con la opción `--quantization modelopt`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 9B, arquitectura original de Google) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base soporta 8192 tokens) |
| Tipos de cuantizacion | FP8 (E4M3) pesos, activaciones FP16 (W8A16) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se declaran en esta cuantización) |
| Licencia | no disponible en el repositorio (el modelo base usa Gemma Terms of Use) |
| Formato de pesos | safetensors (con configuración de cuantización `modelopt`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-2-9b-it`, un transformer decoder-only de 9 mil millones de parámetros con atención local y global alternada, entrenado por Google con datos de texto, código y matemáticas. La cuantización aplicada aquí es post-entrenamiento: se usó NVIDIA ModelOpt con la configuración `FP8_DEFAULT_CFG`, que convierte los pesos a FP8 (E4M3) con escala por tensor. Las activaciones se mantienen en FP16, por lo que el modo efectivo es W8A16 (pesos de 8 bits, activaciones de 16 bits).

Una particularidad técnica destacable es que, según la model card del autor, las escalas de peso se calcularon de forma data-free (directamente de los pesos, sin usar el conjunto de calibración). Esto implica que el checkpoint sería idéntico independientemente del texto de calibración utilizado. El repositorio no registra internamente el modo weight-only; esa información solo aparece en el nombre del repositorio y en el archivo `calib_stats.json`. El checkpoint no es cargable con `transformers` estándar, ya que `config.json` declara el tipo de cuantización `modelopt`.

## Capacidades

- Generación de texto en tareas generales de lenguaje natural, incluyendo razonamiento y conversación multi-turno (capacidades heredadas del modelo base Gemma 2 9B).
- Generación y comprensión de código, gracias al entrenamiento del modelo base con datos de programación.
- Razonamiento matemático y lógico, según el entrenamiento del modelo base.
- Capacidades multilingües del modelo base (aunque no se declaran específicamente en esta cuantización).
- No se añade ninguna capacidad especial (vision, audio, tool calling) en esta cuantización; el modelo base es texto-only.
- La cuantización W8A16 reduce el uso de memoria y puede acelerar la inferencia en hardware compatible con FP8 (por ejemplo, GPUs Hopper o Ada Lovelace con soporte de FP8).

## Casos de uso

- Inferencia de Gemma 2 9B en entornos con memoria limitada: el checkpoint en FP8 ocupa 10.2 GB en disco, lo que permite cargar el modelo en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti Super o A10G) con cuantización adicional si fuera necesario.
- Despliegue en producción con vLLM: el comando `vllm serve Azzam15/gemma2-9b-fp8-w8a16-mixed --quantization modelopt` permite servir el modelo con alta concurrencia y baja latencia en entornos con soporte FP8.
- Evaluación comparativa de cuantización: como checkpoint de control para medir el efecto de la calibración en variantes AWQ, permite aislar el impacto de las escalas de activación en la calidad final.
- Desarrollo de aplicaciones de chat y asistentes conversacionales: el modelo base `gemma-2-9b-it` es una variante de instrucciones, apta para tareas de diálogo y seguimiento de instrucciones.
- Generación de código en pipelines de desarrollo: el modelo base tiene competencia en código, y esta cuantización permite integrarlo en entornos con recursos limitados.
- Investigación en cuantización de modelos: sirve como referencia para medir la degradación de rendimiento al cuantizar solo pesos frente a esquemas mixtos (W4A4, AWQ, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye la métrica de error cuadrático medio de los pesos (weight MSE = 3.163557e-08), que mide la diferencia entre los pesos originales y los cuantizados, pero no se aportan resultados de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 10.2 GB en FP8, por lo que se necesita al menos 12 GB de VRAM para inferencia con el modelo completo sin cuantización adicional (considerando overhead de contexto).
- GPUs recomendadas: GPUs con soporte nativo de FP8, como NVIDIA H100, H200, RTX 4090 (soporte parcial), A100 (sin FP8 nativo, pero puede ejecutar FP8 con emulación) o GPUs Ada Lovelace (L40S, RTX 6000 Ada).
- Consumer GPU: es posible ejecutarlo en GPUs de 16 GB VRAM (RTX 4080, RTX 4090) con una cuantización adicional de activaciones o con técnicas de offloading, aunque el rendimiento será subóptimo.
- Opciones de despliegue: vLLM (con `--quantization modelopt`), TensorRT-LLM, o convertirlo a formatos como GGUF (con herramientas de conversión) para usar en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información del repositorio. Dependerán del hardware y del motor de inferencia; en general, FP8 ofrece mayor throughput que FP16 en GPUs con soporte nativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Azzam15/gemma2-9b-fp8-w8a16-mixed | 9.24B | no disponible (base: 8K) | no disponible | safetensors (modelopt) | Hugging Face |
| NouraAlqasim/gemma2-9b-fp8-mixed | 9.24B | no disponible (base: 8K) | no disponible | safetensors (modelopt) | Hugging Face |
| google/gemma-2-9b-it | 9.24B | 8K | Gemma Terms of Use | safetensors (float16) | Hugging Face |

La comparativa se limita a otras cuantizaciones FP8 del mismo modelo base. No se dispone de datos de rendimiento para comparar con alternativas como versiones AWQ o GPTQ de Gemma 2 9B.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar: `config.json` declara el tipo de cuantización `modelopt`, por lo que se requiere un motor de inferencia compatible (vLLM, TensorRT-LLM, etc.).
- La cuantización es weight-only (W8A16): las activaciones se mantienen en FP16, por lo que el ahorro de memoria es menor que en esquemas W4A4 o W8A8 completos.
- Las escalas de peso son data-free, por lo que la calibración no influye en los pesos; esto puede ser una limitación si se espera que la calibración mejore la calidad de la cuantización.
- No se han publicado resultados de calidad (benchmarks) para evaluar la degradación respecto al modelo original.
- Licencia no especificada en el repositorio: el uso comercial dependerá de la licencia del modelo base (Gemma Terms of Use), que permite uso comercial con restricciones.
- El modelo base tiene limitaciones de contexto (8192 tokens) y puede mostrar sesgos de los datos de entrenamiento originales de Gemma 2.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Azzam15/gemma2-9b-fp8-w8a16-mixed
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Sibling checkpoint (referencia): https://huggingface.co/NouraAlqasim/gemma2-9b-fp8-mixed
- Página oficial de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Model card de Gemma 2 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_2
- Página de Gemma 2 9B en Open Source AI Models: https://opensourceaimodels.net/models/gemma-2-9b
