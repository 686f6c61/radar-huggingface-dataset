# mradermacher/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una colección de cuantizaciones GGUF estáticas del modelo base `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, preparada por mradermacher. Este modelo base es una versión "abliterada" (sin censura) de Qwen3.8-27B, desarrollada por huihui-ai mediante la técnica de abliteration, que elimina la dirección de rechazo de los pesos del modelo para permitir conversaciones sin restricciones de seguridad. La cuantización a GGUF permite ejecutar el modelo en hardware de consumo con distintos niveles de precisión y memoria.

El repositorio ofrece 10 variantes de cuantización (desde Q2_K hasta Q8_0) más dos archivos mmproj para soporte multimodal, con tamaños que van de 11 GB a 29,1 GB. Está pensado para su uso con llama.cpp, Ollama u otros motores compatibles con GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se infiere transformer denso por el nombre Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en f16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Huihui-Qwen3.8-27B-abliterated` se obtiene aplicando abliteration sobre Qwen3.8-27B. La abliteration es una tecnica post-entrenamiento que proyecta la "direccion de rechazo" fuera de los pesos de `self_attn.o_proj` y `mlp.down_proj` en todas las capas, eliminando asi los mecanismos de negativa del modelo. Segun la informacion disponible, se conservan las primeras 15 capas sin modificar, mientras que las capas mas profundas se ajustan para eliminar las restricciones de seguridad. No se dispone de datos sobre el entrenamiento original de Qwen3.8-27B (numero de tokens, composicion del dataset, tecnicas de alineacion) ni sobre el proceso exacto de abliteration mas alla de lo descrito.

## Capacidades

- Generacion de texto conversacional sin restricciones de contenido (modelo abliterado).
- Soporte multimodal: se incluyen archivos mmproj (f16 y Q8_0) que permiten procesar imagenes junto con texto, aunque no se especifica el detalle de las capacidades visuales.
- Compatible con motores de inferencia GGUF como llama.cpp y Ollama.
- Diseñado para conversaciones multi-turno (etiqueta "conversational").
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso en la informacion proporcionada.

## Casos de uso

- Generacion creativa de contenido sin filtros: el modelo puede producir narrativa, poesia o dialogos sin las restricciones tipicas de los modelos alineados, util para escritores o creadores que necesitan explorar temas controvertidos en un entorno controlado.
- Investigacion sobre sesgos y seguridad en IA: al eliminar la direccion de rechazo, permite estudiar como se comporta un modelo sin alineacion, comparando respuestas con la version original para analizar diferencias en sesgos y robustez.
- Desarrollo de asistentes conversacionales en entornos de pruebas: gracias a su licencia Apache 2.0 y su formato GGUF, puede integrarse en prototipos locales sin depender de APIs externas, facilitando iteraciones rapidas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M (16,9 y 19,6 GB respectivamente) caben en GPUs de 24 GB como la RTX 4090, permitiendo ejecutar un modelo de 27B en equipos personales.
- Procesamiento de documentos con imagenes: los archivos mmproj habilitan la entrada multimodal, aunque no se detalla si el modelo base soporta vision de forma nativa; podria usarse para extraer informacion de imagenes junto con texto en tareas de analisis documental.
- Pruebas de generacion de codigo y razonamiento: aunque no se especifican benchmarks, al ser una variante de Qwen3.8 es plausible que mantenga capacidades de codigo y logica; puede evaluarse localmente con herramientas como llama.cpp para validar su rendimiento en tareas de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (16,9 GB) se recomienda al menos 20 GB de VRAM libre; para Q8_0 (29,1 GB) se necesitan 32 GB o mas.
- GPUs recomendadas: RTX 4090 (24 GB) puede ejecutar Q4_K_M y Q5_K_M; A100 40 GB o 80 GB son adecuadas para Q6_K y Q8_0; GPUs de 16 GB (como RTX 4080) podrian usar Q3_K_M (13,6 GB) con margen limitado.
- En CPU: las cuantizaciones Q2_K (11 GB) y Q3_K_S (12,4 GB) pueden ejecutarse en RAM con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con GGUF como text-generation-webui.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se puede señalar que existen otras cuantizaciones de modelos abliterados de huihui-ai, como `Huihui-Qwen3.5-27B-abliterated-GGUF`, pero no se ofrecen metricas de rendimiento para establecer una comparacion objetiva.

## Limitaciones y advertencias

- Al ser un modelo abliterado, carece de mecanismos de rechazo y puede generar contenido inapropiado, ofensivo, peligroso o ilegal. No debe desplegarse en produccion sin filtros adicionales de moderacion.
- La cuantizacion degrada la calidad de las respuestas, especialmente en niveles bajos (Q2_K, Q3_K). Se recomienda usar Q4_K_M o superior para un equilibrio entre calidad y memoria.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de tareas que requieran ventanas largas.
- El modelo solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de alineacion de seguridad puede generar responsabilidades legales si se distribuye contenido generado por el modelo.
- No se han publicado benchmarks ni evaluaciones de sesgos, por lo que se desconoce su comportamiento en tareas sensibles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Pagina de cuantizaciones en ModelScope (referencia): https://www.modelscope.cn/models/douyamv/Qwen3.8-27B-abliterated-GGUF
- Descripcion del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/huihui-qwen3.8-27b-abliterated-huihui-ai
