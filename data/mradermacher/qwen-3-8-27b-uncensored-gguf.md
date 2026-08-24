# mradermacher/Qwen-3.8-27B-Uncensored-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo Qwen-3.8-27B-Uncensored, una versión multimodal de la familia Qwen 3.8 de 27 mil millones de parámetros a la que se ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo de contenido. El autor de la cuantización es mradermacher, que trabaja en nethype GmbH, y el modelo base fue desarrollado por junafinity.

El objetivo de esta publicación es ofrecer el modelo en formato GGUF para poder ejecutarlo en hardware local mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura en la nube. La relevancia actual reside en que es una de las pocas opciones de un modelo de 27B multimodal "uncensored" disponible en cuantizaciones que van desde Q2_K hasta Q8_0, lo que permite ajustar el consumo de memoria según el hardware disponible.

La licencia es Apache 2.0, lo que permite uso comercial, y el modelo está etiquetado como multimodal (image-text-to-text), conversacional y abliterated, con soporte de idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen 3.5 (detalles de arquitectura no disponibles) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj para el componente multimodal) |

## Arquitectura y entrenamiento

El modelo base es Qwen-3.8-27B-Uncensored, publicado por junafinity, que a su vez parte de los pesos originales de Qwen 3.8 27B. La técnica aplicada es "abliteration", que elimina a nivel de pesos la tendencia del modelo a rechazar contenido, y se menciona tambien el uso de "zerofuse" en los tags. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion GGUF fue realizada por mradermacher con herramientas de llama.cpp. Se ofrecen quants estaticos (sin imatrix), y el autor indica que los quants ponderados podrian no estar disponibles. El componente multimodal se proporciona por separado como mmproj en dos precisiones: f16 y Q8_0.

## Capacidades

- Generacion de texto conversacional con un modelo de 27.3 mil millones de parametros.
- Procesamiento multimodal de imagen a texto (image-text-to-text), mediante el archivo mmproj incluido.
- Comportamiento sin censura a nivel de pesos, lo que reduce los rechazos por contenido considerado inapropiado.
- Capacidad de conversacion multi-turno en ingles.
- Compatible con la biblioteca transformers y con el ecosistema llama.cpp (GGUF).
- No se ha confirmado soporte de tool calling, function calling, agentes ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- **Asistente conversacional local**: el modelo puede ejecutarse en una estacion de trabajo con 16-24 GB de VRAM usando la cuantizacion Q4_K_M, lo que permite tener un asistente privado sin conexion a internet y sin filtros de contenido, adecuado para pruebas de producto o entornos de desarrollo.

- **Analisis de imagenes sin restricciones**: gracias al componente multimodal, puede describir o interpretar imagenes de forma local, util para aplicaciones de vision por computador que necesiten procesar datos sensibles sin enviarlos a la nube.

- **Generacion de texto creativo**: escritura de ficcion, guiones o contenido que requiera tematicas adultas o controvertidas, donde un modelo estandar rechazaria la solicitud. Se usaria con una interfaz compatible con GGUF como llama.cpp o LM Studio.

- **Investigacion academica sobre alineacion y censura**: permite estudiar el comportamiento de un modelo sin filtros para analizar sesgos, riesgos de seguridad y diferencias de comportamiento frente a la version original de Qwen 3.8 27B.

- **Despliegue en entornos sin GPU**: con cuantizaciones como Q3_K_S (12.4 GB) se puede ejecutar en CPUs modernas con 16 GB de RAM, aunque con latencia mayor. Sirve para entornos de desarrollo o pruebas automatizadas.

- **Integracion en pipelines de generacion de datos**: puede usarse para crear datasets sinteticos de texto o anotaciones de imagenes sin restricciones de contenido, en proyectos de investigacion que requieran diversidad de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La cuantizacion Q4_K_M (16.9 GB) cabe en una GPU de 24 GB como la RTX 4090 o la RTX 3090, permitiendo inferencia rapida.
- Q8_0 (29.1 GB) requiere una GPU con 32 GB o mas, como la A100 40 GB o la H100, o bien usar CPU con al menos 48 GB de RAM.
- Q3_K_S (12.4 GB) puede ejecutarse en una RTX 4080 de 16 GB, aunque con menor calidad de salida.
- Segun el repositorio de GitHub relacionado, se ha probado en un Mac M5 Pro con Q3_K_M (13.5 GB) usando Metal, y en Windows con Q4_K_M (16.8 GB) con CUDA. Tambien se menciona un backend opcional MLX para Apple Silicon, que ofrece una velocidad entre un 30 y un 50 % superior.
- El despliegue se puede realizar con llama.cpp, Ollama, LM Studio o cualquier herramienta compatible con GGUF. El componente multimodal requiere usar el archivo mmproj correspondiente.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa fiable con otras alternativas de la misma categoria. El modelo se posiciona como una variante abliterada de Qwen 3.8 27B, por lo que su comparacion natural seria con la version original de Qwen 3.8 27B, pero no se han publicado datos comparativos de rendimiento ni de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Al ser una version "uncensored", el modelo puede generar contenido inapropiado, ofensivo o peligroso si se utiliza en entornos de produccion sin moderacion adicional.
- El idioma soportado es solo ingles, lo que limita su uso en entornos multilingues.
- No se han publicado datos sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran contexto largo.
- Los pesos estan cuantizados, lo que introduce una perdida de precision respecto a la version FP16. Los quants de menor tamano (Q2_K, Q3_K) presentan una degradacion notable de calidad.
- La licencia Apache 2.0 permite uso comercial, pero no se ha confirmado el cumplimiento de las condiciones de la licencia original de Qwen 3.8 27B.
- No se han proporcionado datos sobre sesgos especificos ni evaluaciones de seguridad.
- La cuantizacion no incluye quants ponderados con imatrix, lo que puede suponer una calidad inferior en ciertos casos frente a otras versiones disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Version FP8 del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF
- Modelo base: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Repositorio de GitHub con guia de uso: https://github.com/Wassimyounes01/qwen38-uncensored
- Repositorio alternativo de GitHub: https://github.com/unburdened-jackinbox365/qwen38-uncensored
- Articulo de blog sobre el modelo: https://www.orcarouter.com/blog/qwen-3-8-27b-uncensored-gguf
