# Gallardo994/Huihui-Qwen3.8-27B-abliterated-oQ8e-mtp

## Resumen

Huihui-Qwen3.8-27B-abliterated-oQ8e-mtp es una cuantizacion de 8 bits del modelo Huihui-Qwen3.8-27B-abliterated, un modelo de texto creado por huihui-ai que elimina los mecanismos de rechazo y censura del modelo original Qwen/Qwen3.8-27B mediante la tecnica de abliteration. Esta version concreta, publicada por Gallardo994, aplica una cuantizacion mixta de precision utilizando la libreria oMLX (oQ), lo que reduce el peso del modelo a aproximadamente 30 GB manteniendo una fidelidad alta respecto al original.

El modelo resultante es un LLM de 8.184 millones de parametros, con arquitectura qwen3_5, pensado para desarrolladores que necesitan un modelo sin restricciones de contenido para tareas de generacion creativa, roleplay o investigacion. La cuantizacion en 8 bits con group size de 64 permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados, y al estar en formato MLX safetensors, esta optimizado para dispositivos Apple Silicon.

La relevancia de este modelo reside en su doble capa de procesamiento: primero la abliteration que elimina las negativas del modelo base, y segundo la cuantizacion oQ que lo hace desplegable en entornos con recursos limitados. Sin embargo, hay que tener en cuenta que al ser una version sin censura, su uso conlleva responsabilidades legales y eticas importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer) |
| Parametros totales | 8.184.279.792 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de la familia Qwen3.5 con 8.184 millones de parametros. La version abliterated de huihui-ai elimina los mecanismos de rechazo del modelo original mediante la tecnica de abliteration, que modifica las capas profundas de la red para eliminar las direcciones de activacion asociadas a la negativa, manteniendo intactas las primeras 15 capas. Esto permite que el modelo responda a peticiones que el modelo original rechazaria, sin necesidad de reentrenamiento.

La cuantizacion oQ aplicada por Gallardo994 utiliza la libreria oMLX v0.6.1, que implementa cuantizacion mixta de precision. El modelo se cuantiza a 8 bits con un group size de 64, lo que significa que los pesos se agrupan en bloques de 64 y se cuantizan con una escala y cero punto por grupo. Esta tecnica preserva mejor la precision en capas sensibles mientras reduce el tamano total del modelo. Los detalles del entrenamiento original (numero de tokens, dataset, metodo de alineacion) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto sin restricciones de contenido: el modelo no presenta mecanismos de rechazo, por lo que responde a peticiones que otros modelos censurarian.
- Razonamiento y comprension del lenguaje: hereda las capacidades del modelo base Qwen3.8-27B, aunque la cuantizacion puede afectar ligeramente la calidad.
- Capacidades multilingues: el modelo base Qwen3 soporta multiples idiomas, aunque los idiomas exactos no estan especificados en esta version.
- Soporte de tool calling y function calling: no confirmado para esta version cuantizada, aunque el modelo base Qwen3.8-27B lo incorpora.
- Capacidades de agente y multi-step reasoning: no confirmado, depende del modelo base subyacente.
- Sin modo vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Generacion creativa sin limites: escritura de ficcion, poesia, guiones y otros contenidos creativos que requieran explorar temas sensibles o controvertidos sin restricciones impuestas por el modelo.
- Roleplay y simulacion de personajes: el modelo puede adoptar personalidades y responder en contexto sin rechazar interacciones por contenido explicito, util para juegos de rol o simulaciones sociales.
- Investigacion academica sobre sesgos y alineacion: estudiar como se comporta un modelo sin mecanismos de seguridad permite investigar la naturaleza de los sesgos y la eficacia de las tecnicas de alineacion.
- Desarrollo de aplicaciones de chat sin filtros: construir asistentes conversacionales para nichos especificos donde los usuarios demandan respuestas sin censura previa.
- Generacion de datos sinteticos para entrenamiento: producir datasets de entrenamiento con contenido diverso y sin restricciones para fine-tuning de otros modelos.
- Analisis de contenido y moderacion: al ser un modelo sin censura, puede utilizarse para generar ejemplos de contenido problematico que ayuden a entrenar sistemas de moderacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.184 millones de parametros cuantizados a 8 bits, lo que supone aproximadamente 8,2 GB de pesos. Con overhead de inferencia, se estima un consumo de 10-12 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB, o cualquier GPU con al menos 12 GB de VRAM. Tambien es compatible con Apple Silicon (M1 Pro/Max o superior) gracias al formato MLX.
- Consumer GPU: si, cabe en GPUs de consumo con 12 GB o mas de VRAM, como la RTX 4070 Ti o superior.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con MLX (Apple Silicon), o convertirse a GGUF para usar con llama.cpp u Ollama. Tambien es compatible con vLLM si se convierte a formato HuggingFace estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-oQ8e-mtp | 8,18B | no disponible | 8-bit oQ | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B (original) | 8,18B | no disponible | FP16 | Apache 2.0 | HuggingFace |
| Huihui-Qwen3.8-27B-abliterated (sin cuantizar) | 8,18B | no disponible | FP16 | no disponible | HuggingFace |

La principal diferencia con el modelo original es la ausencia de mecanismos de rechazo, mientras que la diferencia con la version sin cuantizar es el tamano reducido (30 GB frente a aproximadamente 16 GB en FP16) a costa de una posible perdida menor de precision.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o peligroso sin restricciones, reflejando los sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: la cuantizacion de 8 bits puede aumentar la tasa de alucinaciones respecto al modelo original en FP16.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que se desconoce si mantiene la ventana del modelo original.
- Restricciones de licencia: la licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial.
- Riesgo legal: el uso de modelos sin censura puede violar las politicas de las plataformas de hosting y las leyes locales sobre contenido generado.
- Sin garantias de calidad: al ser una cuantizacion de un modelo modificado, el rendimiento en tareas especificas puede degradarse respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gallardo994/Huihui-Qwen3.8-27B-abliterated-oQ8e-mtp
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Coleccion Qwen3-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen3-abliterated
- Guia de despliegue AutoDL (Ollama + llama.cpp MTP): https://github.com/mifanovo/autodl-huihui-qwen3.8-27b
- Version GGUF en ModelScope: https://www.modelscope.cn/models/mradermacher/Huihui-Qwen3-8B-abliterated-v2-i1-GGUF
- Libreria oMLX (oQ): https://github.com/jundot/omlx
