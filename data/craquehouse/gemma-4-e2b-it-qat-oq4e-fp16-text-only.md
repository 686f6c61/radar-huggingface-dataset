# craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only

## Resumen

Gemma 4 E2B es el modelo más ligero de la familia Gemma 4, desarrollado por Google DeepMind con 2.100 millones de parámetros y una ventana de contexto de 8.000 tokens. Esta versión concreta, `craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only`, es una cuantización oQ4e del modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized`, construida con la librería MLX para hardware Apple Silicon. La característica principal es que usa `float16` como dtype base en lugar del `bfloat16` habitual, lo que proporciona una mejora de aproximadamente el 20 % en la fase de prefill en los chips M1 y M2, que no tienen soporte nativo de bf16 en su GPU. Además, se han eliminado por completo las torres de visión y audio, reduciendo el tamaño en disco a 2,75 GB frente a los 10,24 GB del modelo fuente.

El modelo es una versión solo texto, con capacidad de razonamiento (thinking) activada por defecto en el flujo de `mlx-lm`. Está licenciado bajo Apache 2.0 y se distribuye en formato `safetensors` compatible con MLX. Su relevancia actual radica en que permite ejecutar un modelo de razonamiento de 2B parámetros en equipos Apple Silicon de gama baja, como MacBooks Air con 8 GB de memoria unificada, manteniendo un consumo de memoria reducido. Sin embargo, el autor no ha ejecutado ningún benchmark de calidad sobre esta cuantización, por lo que su rendimiento real no está verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 2.100 millones (modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8.000 tokens (según la documentación de Gemma 4 E2B) |
| Tipos de cuantizacion | oQ4e: 4-bit base con grupo de 64, 98 tensores a 5, 6 y 8 bits, base dtype fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, `google/gemma-4-E2B-it-qat-q4_0-unquantized`, es una versión de Gemma 4 E2B que ha pasado por un proceso de Quantization-Aware Training (QAT), diseñado para mantener la calidad cerca del bfloat16 original mientras reduce la memoria necesaria. La cuantización oQ4e aplicada por `craquehouse` utiliza un presupuesto de bits por peso que asigna mayor precisión a los tensores más sensibles: 73 tensores a 5 bits, 13 a 6 bits y 12 a 8 bits, sobre una base de 4 bits con grupo de 64. Esto se realiza mediante la herramienta `model-lab` del autor, que integra la librería oMLX.

La elección de `float16` como base se justifica porque los chips M1 y M2 no tienen ruta nativa de bf16 en GPU, y usar fp16 acelera el prefill en esos procesadores. El modelo no incluye las torres de visión ni audio, por lo que es estrictamente de texto. El autor advierte que, al eliminar las torres, la asignación de bits del modelo de lenguaje cambió, y que la versión de oMLX utilizada (0.6.3rc2) es parte de la receta, ya que versiones anteriores presentaban regresiones en GSM8K.

## Capacidades

- Generación de texto en lenguaje natural con razonamiento multi-step activado por defecto (modo thinking).
- Soporte de tool calling y function calling, según las capacidades del modelo base Gemma 4.
- Capacidad de usar system prompts para dirigir el comportamiento.
- Razonamiento encadenado (chain-of-thought) gracias a la variable `enable_thinking` del template de chat.
- Multilingüismo: no se dispone de información específica sobre los idiomas soportados por esta cuantización, pero el modelo base es multilingüe.
- No soporta entrada de imagen ni audio, al ser la versión solo-texto.

## Casos de uso

- Asistente local en equipos Apple Silicon: su tamaño de 2,75 GB y su optimización para MLX permiten ejecutarlo en un MacBook Air con 8 GB de RAM, ofreciendo respuestas con razonamiento sin conexión a internet.
- Chatbot privado para empresas con requisitos de confidencialidad: al funcionar en local, los datos no salen del dispositivo, ideal para entornos sanitarios o legales.
- Generación de código en un entorno de desarrollo integrado: el modelo puede usarse con tool calling para autocompletar o generar fragmentos de código, aprovechando su tamaño reducido para una latencia baja.
- Automatización del hogar: mediante el servidor oMLX compatible con la API de OpenAI, puede integrarse en Home Assistant para controlar dispositivos y responder a comandos de voz, con la opción de desactivar el razonamiento para respuestas más directas.
- Prototipado rápido de aplicaciones de IA: su licencia Apache 2.0 y su pequeño tamaño lo hacen adecuado para pruebas de concepto y desarrollo iterativo en entornos de investigación.
- Edge computing en dispositivos embebidos: aunque está diseñado para MLX en Apple Silicon, el modelo base Gemma 4 E2B puede ejecutarse en CPU, lo que permite su despliegue en dispositivos de bajo consumo como Raspberry Pi (con limitaciones de memoria).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización. El autor indica explícitamente que no ha ejecutado ninguna evaluación de calidad, como perplexidad, MMLU o comparación con la versión bf16. Los únicos datos disponibles son métricas de tamaño (2,75 GB en disco, 818 tensores F16 y 278 U32) y la reducción de tamaño respecto al modelo fuente (10,24 GB). No se puede afirmar ningún nivel de rendimiento sin datos objetivos.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 2,75 GB en disco, por lo que se puede cargar en memoria unificada de Apple Silicon; con 8 GB de RAM es suficiente para inferencia, aunque se recomiendan 16 GB para un uso cómodo.
- GPU recomendada: Apple Silicon (M1, M2, M3 o superiores). No es compatible con GPUs NVIDIA de forma nativa, ya que el formato MLX está optimizado para la GPU de Apple.
- Compatibilidad con consumer GPU: no aplicable, ya que es un formato MLX.
- Opciones de despliegue: `mlx-lm` para Python, `oMLX` como servidor OpenAI-compatible, y herramientas que integren MLX como `mlx_lm.server`.
- Latencia y throughput: no se dispone de datos medidos. En un M1 con 8 GB, se espera una velocidad de generación de unos pocos tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only | 2,1B | 8K | oQ4e fp16 | Apache 2.0 | MLX |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 2,1B | 8K | QAT q4_0 | Apache 2.0 | PyTorch, MLX |
| bambocher/gemma-4-E2B-it-qat-oQ4e-mtp | 2,1B | 8K | oQ4e bf16 | Apache 2.0 | MLX |
| Qwen2.5-1.5B | 1,5B | 32K | varias | Apache 2.0 | PyTorch, GGUF, MLX |

La comparativa se limita a las características declaradas, ya que no hay datos de rendimiento para esta cuantización. El modelo de bambocher es la alternativa más directa, con base bf16 y mejor recorrido de uso, aunque tampoco tiene benchmarks publicados. Qwen2.5-1.5B es una alternativa de tamaño similar con mayor contexto, pero no tiene el modo de razonamiento integrado.

## Limitaciones y advertencias

- No ha sido evaluado para calidad: el autor no ha ejecutado benchmarks, por lo que el rendimiento real es desconocido y puede contener degradaciones significativas respecto al modelo base.
- Riesgo de `inf` y salida degenerada: el uso de fp16 reduce el rango exponencial (máximo ~65504) frente a bf16 (~3.4e38). En hardware donde la versión bf16 funciona bien, esta build podría generar `inf` o salidas anómalas.
- Solo texto: se han eliminado las torres de visión y audio, por lo que no acepta imágenes ni audio como entrada.
- El razonamiento está activado por defecto en `mlx-lm`, lo que puede provocar que el campo `content` esté vacío si `max_tokens` se agota durante el pensamiento. Hay que desactivarlo explícitamente si el cliente no lo soporta.
- La licencia Apache 2.0 heredada del modelo base, pero el autor recomienda revisar la licencia del modelo base antes de redistribuir, ya que la cuantización no crea una obra nueva.
- No se garantiza soporte multilingüe: no se ha documentado los idiomas soportados en esta cuantización.
- Es una versión no probada: el autor la califica como "unproven" y sugiere usar la variante bf16 de bambocher si no se necesita específicamente fp16.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only)
- [Modelo base](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized)
- [Herramienta model-lab](https://git.craquehouse.cc/craquehouse/model-lab)
- [oMLX](https://github.com/jundot/omlx)
- [Página de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Información de Gemma 4 E2B](https://gemma4.dev/models/gemma-4-e2b)
- [Guía de Gemma 4 en LM Studio](https://lmstudio.ai/models/google/gemma-4-e2b-qat)
