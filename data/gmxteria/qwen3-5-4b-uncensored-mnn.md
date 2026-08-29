# Gmxteria/Qwen3.5-4B-uncensored-MNN

## Resumen

Este modelo es una conversión al formato MNN (Mobile Neural Network) del modelo Qwen3.5-4B abliterado por huihui-ai, pensada para ejecución on-device en dispositivos móviles. El trabajo original de abliteración elimina los comportamientos de rechazo del modelo base mediante proyección ortogonal (técnica FailSpy), dando como resultado un modelo "sin censura" orientado a roleplay, ficción creativa y contenido maduro. La conversión MNN, realizada por darkmaniac7, incluye cuantización de 4 bits con bloque de tamaño 128, lo que reduce el peso a aproximadamente 2,3 GB y permite su uso en CPU móvil.

El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para integrarse en la aplicación TokForge, aunque puede ejecutarse con cualquier runtime compatible con MNN. Su arquitectura Qwen3.5 con LinearAttention ofrece un rendimiento de decodificación de entre 14 y 20 tokens por segundo en SoCs de gama alta, según mediciones realizadas en dispositivos reales. Es una opción relevante para desarrolladores que buscan desplegar modelos generativos locales en móviles sin depender de la nube, aunque su uso está restringido al idioma inglés y a tareas de generación de texto sin filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (LinearAttention) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (block size 128) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (llm.mnn + llm.mnn.weight) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B de Alibaba, que emplea una arquitectura con LinearAttention en lugar de la atención softmax tradicional. Esta elección reduce la complejidad computacional y favorece la ejecución en CPU, ya que el coste de atención es lineal respecto a la longitud de secuencia. Sobre este modelo, huihui-ai aplicó una técnica de abliteración basada en proyección ortogonal (FailSpy) que elimina los vectores de dirección responsables del rechazo, dando lugar a una variante sin restricciones de contenido. Posteriormente, darkmaniac7 convirtió los pesos al formato MNN y aplicó cuantización de 4 bits con bloque de 128, optimizando el modelo para inferencia móvil. No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso de fine-tuning, más allá de la abliteración.

## Capacidades

- Generacion de texto libre sin rechazo: el modelo no filtra contenido por políticas de seguridad, lo que permite generar respuestas sobre temas que otros modelos bloquean.
- Roleplay y ficcion creativa: diseñado especificamente para conversaciones de personajes, narracion interactiva y escritura de historias con contenido adulto o controvertido.
- Ejecucion on-device: gracias al formato MNN y la cuantizacion 4-bit, puede funcionar completamente offline en telefonos moviles con CPU de gama alta.
- Inferencia rapida en CPU: la arquitectura LinearAttention y el backend CPU optimizado ofrecen velocidades de decodificacion de 14 a 20 tokens por segundo en SoCs como Snapdragon 8 Elite 2 o 8 Gen 3.
- Integracion con TokForge: compatible con la aplicacion Android TokForge, que permite descargar y usar el modelo directamente desde la interfaz.
- Multilingue limitado: solo soporta ingles, sin capacidades documentadas para otros idiomas.

## Casos de uso

- Roleplay en aplicaciones moviles offline: el modelo puede gestionar conversaciones de personajes con contexto largo y respuestas sin censura, ideal para apps de chat como TokForge que funcionan sin conexion.
- Escritura de ficcion creativa: permite generar narrativas, dialogos y descripciones con libertad tematica, util para autores que necesitan explorar contenido maduro sin restricciones.
- Chatbots de personajes personalizados: al no rechazar peticiones, se puede configurar para interpretar cualquier rol o personalidad, incluyendo escenarios adultos.
- Prototipado de aplicaciones de IA privada: desarrolladores pueden integrar el modelo en apps Android o iOS mediante el runtime MNN, garantizando que los datos del usuario nunca salen del dispositivo.
- Experimentacion con modelos abliterados: investigadores y entusiastas pueden estudiar el comportamiento de un modelo sin mecanismos de seguridad en un entorno local y controlado.
- Asistente de escritura para contenido adulto: util para generar borradores de novelas eroticas, guiones o material de entretenimiento para adultos, con la ventaja de ejecutarse en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card incluye mediciones de rendimiento de decodificacion realizadas en dispositivos reales:

| Dispositivo | SoC | Backend | Decode tok/s |
|---|---|---|---|
| RedMagic 11 Pro | SM8850 (SD 8 Elite 2) | CPU | 17.7–19.8 |
| Samsung S26 Ultra | SM8850 | CPU | ~18–20 |
| Samsung S24 Ultra | SM8650 (SD 8 Gen 3) | CPU | ~14 |

Estos datos indican que el modelo es viable para uso interactivo en tiempo real en telefonos de gama alta, aunque el rendimiento puede variar significativamente segun el SoC y el enrutamiento CPU/GPU.

## Requisitos de hardware

- Almacenamiento: aproximadamente 2,5 GB en disco (2,3 GB de pesos cuantizados + 3,5 MB de grafo + archivos auxiliares).
- Memoria RAM: no se especifica, pero se recomienda al menos 4 GB para cargar el modelo y el runtime MNN.
- GPU: no requiere GPU dedicada; el modelo esta optimizado para CPU movil, ya que LinearAttention es mas rapido en CPU que en OpenCL.
- Dispositivos compatibles: SoCs de gama alta como Snapdragon 8 Elite 2 (SM8850) o Snapdragon 8 Gen 3 (SM8650) ofrecen velocidades de 14-20 tok/s. SoCs de gama media pueden ejecutar el modelo pero con menor rendimiento.
- Opciones de despliegue: runtime MNN (llm_demo o API Transformer), aplicacion TokForge para Android, o cualquier entorno compatible con MNN.
- Latencia: la velocidad de decodificacion medida es de 14-20 tokens por segundo, lo que equivale a una latencia de 50-70 ms por token en los mejores dispositivos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|---|
| Gmxteria/Qwen3.5-4B-uncensored-MNN | Qwen3.5 LinearAttention | 4B | no disponible | Apache 2.0 | MNN | Roleplay on-device sin censura |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | Qwen3.5 LinearAttention | 4B | no disponible | Apache 2.0 | Transformers | Abliterado para uso general |
| Qwen/Qwen3.5-4B | Qwen3.5 LinearAttention | 4B | no disponible | Apache 2.0 | Transformers | Modelo base con filtros de seguridad |

La principal diferencia entre estas variantes es el formato de distribucion y el nivel de censura. El modelo de Gmxteria es una conversion MNN del abliterado de huihui-ai, pensada exclusivamente para moviles, mientras que el original de huihui-ai se distribuye en formato Transformers y puede usarse con librerias estandar. El modelo base de Alibaba conserva los mecanismos de rechazo. No se dispone de datos comparativos de rendimiento en tareas de razonamiento o generacion de codigo.

## Limitaciones y advertencias

- Contenido sin filtrar: al estar abliterado, el modelo puede generar texto ofensivo, ilegal, sexualmente explicito o danino. No debe usarse en aplicaciones publicas sin moderacion humana.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos, nombres o eventos, especialmente en contextos de roleplay donde la coherencia no esta garantizada.
- Idioma limitado: solo soporta ingles; el rendimiento en otros idiomas no esta probado y probablemente sea deficiente.
- Contexto no especificado: no se ha publicado la longitud maxima de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Formato propietario: el formato MNN no es compatible con Transformers, vLLM u Ollama directamente. Requiere el runtime MNN o la aplicacion TokForge, lo que limita su portabilidad.
- Rendimiento variable: la velocidad de decodificacion depende fuertemente del SoC y del enrutamiento CPU/GPU; en dispositivos de gama baja puede ser inutilizable.
- Sin garantias de calidad: no hay benchmarks de calidad publicados, por lo que no se puede evaluar su rendimiento en tareas estandar como razonamiento o codigo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales, responsabilidad del desarrollador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gmxteria/Qwen3.5-4B-uncensored-MNN
- Modelo abliterado original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework MNN (Alibaba): https://github.com/alibaba/MNN
- Aplicacion TokForge: https://tokforge.ai
- Repo de despliegue con Colab y Ollama: https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab
- Variante GGUF en Ollama: https://ollama.com/jaahas/qwen3.5-uncensored:4b
