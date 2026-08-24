# shoemoney/Gemma-4-12B-Abliterated-MLX-q5

## Resumen

El modelo `shoemoney/Gemma-4-12B-Abliterated-MLX-q5` es una cuantización en 5 bits con MLX del modelo `huihui-ai/Huihui-gemma-4-12B-it-abliterated`, que a su vez es una versión "abliterada" (sin censura) del Gemma 4 12B de Google. El autor, shoemoney, ha convertido los pesos BF16 originales a formato MLX 5-bit mediante `mlx_vlm.convert`, sin realizar fine-tuning, merging ni re-alineación. El resultado es un modelo VLM (vision-language) de 12B parámetros nominales, optimizado para ejecutarse en Apple Silicon, con un tamaño en disco de 8.27 GB.

La relevancia de este modelo radica en dos aspectos: por un lado, ofrece una versión sin restricciones de seguridad (uncensored) de un modelo multimodal de Google, lo que permite generar contenido que el modelo original rechazaría; por otro, al estar cuantizado en MLX, puede ejecutarse de forma eficiente en Mac con memoria unificada, sin necesidad de GPUs dedicadas. El modelo hereda la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial.

Según las mediciones del autor, el modelo alcanza una perplexity de 211.862 en el dataset `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123), con un throughput de 33.0 tok/s en peticiones individuales y 99.1 tok/s con 8 peticiones concurrentes, medido en un Apple M3 Ultra con 96 GB de memoria unificada. Estas cifras son comparables solo dentro de la familia de cuantizaciones del mismo modelo base, ya que los tokenizadores difieren entre familias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (transformer denso, basado en Gemma 4) |
| Parametros totales | 12B (nominal) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 128K (segun Goldiebench) |
| Tipos de cuantizacion | 5-bit (MLX, grupo de 64) |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta 140+ idiomas, pero no se confirma para esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors del repositorio muestra 2.250.090.544 parametros (~2.25B), lo que es inconsistente con el nombre del modelo (12B). Es probable que el archivo corresponda a un subconjunto de los pesos (por ejemplo, el vision encoder) o que haya un error en el registro. El modelo base declara 12B parametros.

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B de Google, un VLM con arquitectura transformer densa, entrenado con datos multimodales (texto e imagenes) y con soporte multilingue. Segun la documentacion de Google, Gemma 4 ofrece ventanas de contexto de hasta 256K tokens y esta disponible en versiones densas y MoE; el tamano de 12B corresponde a una variante densa. El proceso de "abliteracion" realizado por huihui-ai elimina las capas de rechazo de contenido del modelo original, de modo que el modelo deja de aplicar los filtros de seguridad estandar de Google.

La cuantizacion a 5-bit se realizo con `mlx_vlm.convert` sobre los pesos BF16 del modelo abliterado, con un grupo de cuantizacion de 64. No se aplico ningun tipo de fine-tuning, merging ni re-alineacion posterior. El autor indica que la unica variable entre las distintas cuantizaciones de esta familia es el numero de bits, manteniendo el mismo grupo y la misma fuente BF16.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Gemma 4.
- Procesamiento de imagenes (VLM): puede analizar y responder sobre contenido visual.
- Capacidad multilingue: el modelo base soporta mas de 140 idiomas, aunque no se confirma para esta version cuantizada.
- Sin censura (uncensored): no aplica los filtros de seguridad del modelo original, por lo que puede generar contenido que Gemma 4 rechazaria.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir textos, guiones o dialogos con tematicas que el Gemma 4 original bloquearia, util para escritores o creadores que necesitan explorar ideas sin filtros.
- Analisis de imagenes en local: al ser un VLM, puede describir o responder preguntas sobre fotografias, diagramas o capturas de pantalla directamente en un Mac, sin enviar datos a la nube.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: gracias a la cuantizacion MLX, se puede integrar en aplicaciones Swift o Python que usen mlx-vlm, con un rendimiento aceptable (33-99 tok/s) en hardware Apple.
- Investigacion en alineacion y seguridad: el modelo abliterado permite estudiar el impacto de eliminar los mecanismos de rechazo en modelos grandes, comparando su comportamiento con la version original.
- Chatbots locales con personalidad sin filtros: se puede desplegar como backend de un asistente conversacional que no imponga restricciones de contenido, adecuado para entornos controlados o de investigacion.
- Evaluacion de cuantizaciones en MLX: al ser parte de una familia de cuantizaciones (4-bit, 5-bit, 6-bit, etc.), sirve para medir la degradacion de calidad y rendimiento segun el numero de bits, como referencia para otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona mediciones de perplexity y throughput:

| Metrica | Valor |
|---|---|
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens, seed 123) | 211.862 |
| Perplexity relativa al mejor rung de la familia | 1.52x |
| Throughput (1 peticion) | 33.0 tok/s |
| Throughput (8 peticiones concurrentes) | 99.1 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplexity solo es comparable dentro de la misma familia de cuantizaciones, ya que los tokenizadores difieren entre modelos.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3, M4 o superior) con memoria unificada.
- VRAM estimada: el modelo ocupa 8.27 GB en disco; en memoria unificada se requiere al menos 10-12 GB para cargar los pesos y los buffers de inferencia.
- GPU recomendada: cualquier chip Apple Silicon con al menos 16 GB de memoria unificada para un uso comodo; el autor uso un M3 Ultra de 96 GB.
- No es compatible con GPUs NVIDIA o AMD de forma directa, ya que el formato MLX esta disenado para Apple Silicon.
- Opciones de despliegue: `mlx-vlm` (libreria principal), tambien puede integrarse en aplicaciones Swift mediante el framework MLX.
- Latencia y throughput: 33.0 tok/s en peticiones individuales y 99.1 tok/s con 8 peticiones concurrentes, medidos en M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-Abliterated-MLX-q5 (este) | 12B | 128K | 5-bit MLX | Apache 2.0 | HuggingFace |
| google/gemma-4-12B (original) | 12B | 256K | BF16 | Gemma Terms of Use | HuggingFace |
| huihui-ai/Huihui-gemma-4-12B-it-abliterated | 12B | 128K | BF16 | Apache 2.0 | HuggingFace |

La principal diferencia con el modelo original de Google es la eliminacion de los filtros de seguridad (abliteracion) y la cuantizacion a 5-bit, que reduce el tamano y acelera la inferencia en Apple Silicon a costa de una ligera degradacion en calidad (perplexity alta). Frente al modelo abliterado en BF16, esta version MLX es mas ligera y rapida, pero requiere hardware Apple.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal, peligroso o sesgado. No debe usarse en aplicaciones publicas sin un control de salida adicional.
- La cuantizacion 5-bit introduce una degradacion notable en la calidad (perplexity 211.862, 1.52x peor que el mejor rung de la familia), lo que puede afectar a tareas que requieren precision.
- No se ha verificado el soporte de tool calling, agentes o razonamiento multi-paso; la informacion disponible no lo confirma.
- La longitud de contexto real no esta confirmada para esta version; Goldiebench indica 128K, pero Google documenta hasta 256K para el modelo base.
- El modelo solo funciona en Apple Silicon; no es portable a entornos con GPUs NVIDIA o AMD sin una conversion adicional.
- Aunque la licencia es Apache 2.0, el modelo base original de Google tiene sus propios terminos de uso que podrian imponer restricciones adicionales, especialmente en aplicaciones comerciales.
- El numero de parametros real es inconsistente (2.25B en safetensors vs 12B nominales), lo que sugiere un posible error en el registro o en la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Gemma-4-12B-Abliterated-MLX-q5
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated
- Gemma 4 de Google (HuggingFace): https://huggingface.co/google/gemma-4-12B
- Gemma 4 de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Review de Gemma 4 12B MLX en Goldiebench: https://goldiebench.com/models/gemma4mlx
