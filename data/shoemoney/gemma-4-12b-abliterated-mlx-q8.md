# shoemoney/Gemma-4-12B-Abliterated-MLX-q8

## Resumen

El modelo `shoemoney/Gemma-4-12B-Abliterated-MLX-q8` es una cuantización en 8 bits (formato MLX) del modelo `huihui-ai/Huihui-gemma-4-12B-it-abliterated`, que a su vez es una versión "abliterada" (sin censura) del modelo oficial `google/gemma-4-12B-it` de Google. El proceso de abliteración elimina las capas de rechazo (refusal) en las capas superiores del modelo, lo que permite respuestas sin restricciones de seguridad, manteniendo el resto de capacidades intactas. Esta versión MLX está optimizada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`.

El modelo pertenece a la familia Gemma 4, que incluye arquitecturas densas y de mezcla de expertos (MoE), con soporte multimodal (visión y lenguaje) y una ventana de contexto de hasta 256K tokens. La cuantización a 8 bits reduce el tamaño en disco a aproximadamente 12,75 GB, lo que permite su ejecución en equipos Apple con memoria unificada de 16 GB o más. Es relevante para desarrolladores que necesitan un modelo de lenguaje grande sin restricciones de contenido, desplegable localmente en entornos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (VLM, encoder-free) |
| Parametros totales | 3.370.433.584 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (segun model card de Gemma 4) |
| Tipos de cuantizacion | 8-bit (MLX, grupo de 64) |
| Idiomas soportados | mas de 140 (segun model card de Gemma 4) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el nombre del modelo indica 12B, pero el conteo de parametros en safetensors es de 3,37 mil millones. Esto podria deberse a una arquitectura MoE con parametros activos reducidos o a un error en el etiquetado. No se dispone de informacion adicional para confirmarlo.

## Arquitectura y entrenamiento

El modelo es una cuantizacion 8-bit del modelo abliterado `huihui-ai/Huihui-gemma-4-12B-it-abliterated`, que a su vez deriva de `google/gemma-4-12B-it`. La arquitectura base es Gemma4Unified, un modelo de vision-lenguaje sin encoder separado, donde las imagenes se procesan directamente en el decoder. La abliteracion se aplico mediante una proyeccion biprojection sobre el decoder de texto, eliminando la senal de rechazo en las capas superiores (L15-47), dejando intacto el resto de pesos.

El proceso de cuantizacion se realizo con `mlx_vlm.convert` desde los pesos BF16 originales, con grupo de cuantizacion de 64. No se realizo ningun fine-tuning, merging ni re-alineamiento posterior. El modelo resultante mantiene las capacidades del original, pero con un tamano reducido y optimizado para Apple Silicon.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo Gemma 4 original, incluyendo tareas de comprension, generacion y razonamiento.
- Soporte multimodal: al ser un VLM, puede procesar entradas de imagen y texto, aunque no se han publicado ejemplos especificos en esta version.
- Codigo y matematicas: Gemma 4 esta disenado para tareas de programacion y calculo, por lo que se espera que herede estas capacidades.
- Sin censura: la abliteracion elimina las restricciones de contenido, permitiendo respuestas sobre temas sensibles o controvertidos.
- Multilingue: soporta mas de 140 idiomas segun la documentacion de Gemma 4.
- Despliegue en Apple Silicon: optimizado para MLX, con soporte para generacion especulativa y procesamiento en memoria unificada.

## Casos de uso

- Asistente local sin censura: ideal para desarrolladores que necesitan un modelo de lenguaje sin restricciones para experimentacion o generacion de contenido creativo, ejecutable en un Mac con 16 GB de RAM o mas.
- Analisis de imagenes y texto: al ser un VLM, puede utilizarse para tareas de captioning, respuesta a preguntas visuales o extraccion de informacion de documentos escaneados, todo en local.
- Generacion de codigo en entornos Apple: puede integrarse en IDEs o pipelines de desarrollo que requieran autocompletado o generacion de codigo, aprovechando la aceleracion MLX.
- Investigacion en alineacion y seguridad: el modelo abliterado permite estudiar el comportamiento de los modelos sin capas de rechazo, util para investigacion academica sobre sesgos y alineacion.
- Chatbots de proposito general: puede desplegarse como backend de un chatbot local, con la ventaja de no depender de APIs externas y de no tener filtros de contenido.
- Prototipado rapido en entornos Apple: gracias a su tamano reducido y a la integracion con `mlx-vlm`, es adecuado para pruebas de concepto y demos en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye mediciones de perplejidad y throughput, pero solo comparables dentro de la misma familia de cuantizaciones:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 139.724 |
| Throughput (1 peticion) | 33.0 tok/s |
| Throughput (8 peticiones concurrentes) | 99.1 tok/s |
| Tamano en disco | 12.75 GB |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplejidad no es comparable con otros modelos debido a diferencias en el tokenizador.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, utiliza memoria unificada. Con 12,75 GB de pesos en 8-bit, se recomienda al menos 16 GB de RAM unificada para inferencia basica, y 32 GB o mas para contextos largos o procesamiento por lotes.
- GPU recomendadas: cualquier Mac con chip M1, M2, M3 o M4 (incluidos los Ultra) con suficiente memoria unificada. El modelo fue probado en un M3 Ultra de 96 GB.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx-vlm` (libreria principal), tambien puede usarse con `mlx-lm` si se adapta, aunque la model card recomienda `mlx-vlm` para esta arquitectura.
- Latencia y throughput: en el hardware de prueba, se obtuvo 33 tok/s en inferencia secuencial y 99 tok/s con 8 peticiones concurrentes. En hardware inferior, el rendimiento sera proporcionalmente menor.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos abliterados de Gemma 4, como `OBLITERATUS/Gemma-4-12B-OBLITERATED`, ni con el modelo original `google/gemma-4-12B-it`. La unica diferencia conocida es la cuantizacion y el proceso de abliteracion, pero no hay benchmarks publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Contenido sin censura: al estar abliterado, el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en aplicaciones de produccion sin supervision humana o filtros adicionales.
- Perplejidad alta: el valor de 139.724 es elevado, aunque solo es comparable dentro de la familia. Puede indicar una degradacion en la calidad del texto respecto al modelo original.
- Sesgos y alucinaciones: al igual que otros modelos de lenguaje, puede producir informacion falsa o sesgada, especialmente en temas delicados.
- Limitaciones de contexto: aunque la arquitectura soporta hasta 256K tokens, el rendimiento real puede degradarse con contextos muy largos, especialmente en hardware con memoria limitada.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base de Google puede tener terminos adicionales. Se recomienda revisar la licencia de `google/gemma-4-12B-it`.
- Dependencia de MLX: el modelo solo funciona en Apple Silicon, no es portable a otras plataformas sin conversion adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shoemoney/Gemma-4-12B-Abliterated-MLX-q8)
- [Modelo base abliterado (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated)
- [Modelo original de Google](https://huggingface.co/google/gemma-4-12B)
- [Model card de Gemma 4 (Google AI)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Repositorio de abliteracion de Gemma 4](https://github.com/TrevorS/gemma-4-abliteration)
- [Pagina de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
