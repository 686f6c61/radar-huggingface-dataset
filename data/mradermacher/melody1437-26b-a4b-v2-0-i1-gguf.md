# mradermacher/Melody1437-26B-A4B-v2.0-i1-GGUF

## Resumen
Melody1437-26B-A4B-v2.0 es un modelo de lenguaje de 26 000 millones de parametros con arquitectura de mezcla de expertos (MoE) activando 4 000 millones en cada token. Fue desarrollado por ReadyArt y cuantizado posteriormente por mradermacher en formato GGUF. El modelo esta disenado especificamente para roleplay, conversacion y contenido instructivo, con un enfoque en interacciones no alineadas y contenido adulto explicito.

La version i1-GGUF proporciona cuantizaciones con imatrix de alta calidad, lo que permite ejecutar el modelo en una variedad de hardware, desde GPU de consumo hasta entornos de servidor. El modelo base es un derivado de la arquitectura Gemma-4, y esta disponible bajo licencia Apache-2.0, lo que facilita su uso comercial y la creacion de obras derivadas. Es un modelo de vision, aunque los archivos mmproj se encuentran en el repositorio estatico de GGUF.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma-4 |
| Parametros totales | 25.233.142.046 (26B) |
| Parametros activos | 4.000 millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento
La arquitectura es de mezcla de expertos (MoE) con 4 mil millones de parametros activos de un total de 26 mil millones, siguiendo el patron A4B. El modelo base, ReadyArt/Melody1437-26B-A4B-v2.0, esta construido sobre la arquitectura Gemma-4 y ha sido entrenado para tareas de roleplay y conversacion instructiva. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada.

El proceso de cuantizacion realizado por mradermacher emplea imatrix (importance matrix) para mejorar la calidad de las cuantizaciones, especialmente en los rangos de menor precision. Las cuantizaciones i1 utilizan una version mejorada del proceso de cuantizacion, que segun el autor, son preferibles a las cuantizaciones estaticas del mismo tamano.

## Capacidades
- Generacion de texto conversacional y roleplay de larga duracion con contexto multi-turno.
- Sigue instrucciones en formato instruct, aunque su entrenamiento esta orientado a interacciones no alineadas.
- Capacidad de procesamiento multimodal (vision) como modelo de vision, con archivos mmproj disponibles en el repositorio estatico.
- Soporte para contenido adulto y explicito, incluyendo roleplay erotico (ERP).
- Cuantizaciones de alta calidad con imatrix para diferentes rangos de precision.
- Compatible con endpoints y despliegue en regiones us.

## Casos de uso
- Creacion de personajes virtuales para roleplay: el modelo puede mantener conversaciones coherentes y con personalidad durante largas sesiones, gracias a su arquitectura MoE y su entrenamiento especializado en roleplay.
- Generacion de ficcion interactiva: permite escribir historias ramificadas donde el usuario interactua con el modelo para avanzar la trama, aprovechando su capacidad de seguir instrucciones en formato instruct.
- Chatbots de entretenimiento para adultos: su licencia Apache-2.0 y su orientacion a contenido explicito lo hacen adecuado para aplicaciones de entretenimiento para mayores de 18 anos.
- Desarrollo de asistentes conversacionales con personalidad: su entrenamiento en conversacion lo hace util para crear asistentes con tono y estilo especificos, aunque con limitaciones de idioma.
- Investigacion sobre modelos no alineados: su estado "unaligned" lo convierte en un sujeto de estudio para investigadores que analizan el comportamiento de modelos sin barreras de seguridad.
- Despliegue en entornos con recursos limitados: las cuantizaciones i1-IQ2_M (10.5 GB) e i1-Q4_K_S (15.6 GB) permiten ejecutar el modelo en GPU de consumo con 16 GB de VRAM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: desde 8.8 GB (i1-IQ1_M) hasta 22.7 GB (i1-Q6_K). La cuantizacion i1-Q4_K_M (16.9 GB) es la recomendada por el autor para un equilibrio entre velocidad y calidad.
- GPU recomendadas: para cuantizaciones ligeras (IQ1-M a IQ3-M) se puede usar una GPU consumer de 12-16 GB como la RTX 3060 o RTX 4070. Para cuantizaciones medianas (Q4_K_S a Q4_K_M) se necesita una GPU con 16-24 GB como RTX 4090. Para Q6_K, se requiere una GPU de 24 GB o mas, como A100 o RTX 4090 en configuracion de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores de inferencia compatibles con GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput: no disponible. La arquitectura MoE con 4B activos permite una velocidad de generacion superior a la de un modelo denso de 26B, pero la latencia exacta depende del hardware y la cuantizacion.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada. Se sugiere comparar con otros modelos de roleplay cuantizados en GGUF, como los de la serie "Melody" de ReadyArt, pero no se dispone de datos concretos.

## Limitaciones y advertencias
- Contenido adulto y explicito: el modelo esta disenado para contenido NSFW, incluyendo contenido erotico, y no tiene alineacion de seguridad. Su uso en entornos de produccion debe ser controlado y restringido a mayores de edad.
- Sesgos y alucinaciones: al ser un modelo no alineado, puede generar contenido sesgado, inapropiado o falso sin filtros. La probabilidad de alucinacion es similar a la de otros modelos de su tamano.
- Limitaciones de idioma: solo soporta ingles, lo que limita su uso en entornos multilingue.
- Contexto: no se especifica la longitud de contexto, por lo que se recomienda probar con ventanas de 4K a 8K tokens, que son comunes en modelos de este tamano.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el contenido del modelo puede estar sujeto a restricciones adicionales por parte de los desarrolladores originales. Se recomienda revisar los terminos de ReadyArt.
- Calidad de cuantizaciones extremas: las cuantizaciones i1-IQ1_M e i1-IQ2_M tienen calidad muy baja y solo son para pruebas de memoria, no para uso real.

## Enlaces
- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v2.0-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v2.0-GGUF
- Version anterior (v1): https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de visualizacion del modelo: https://hf.tst.eu/model#Melody1437-26B-A4B-v2.0-i1-GGUF
- Entrada en KnowYourModel: https://www.knowyourmodel.ai/models/huggingface%3Amradermacher%2FMelody1437-26B-A4B-i1-GGUF
- Pagina de descarga en oktechmasters: https://oktechmasters.org/ai_models/melody1437-26b-a4b-v2-0-gguf/</think>## Resumen
Melody1437-26B-A4B-v2.0 es un modelo de lenguaje de 26 000 millones de parametros con arquitectura de mezcla de expertos (MoE) que activa 4 000 millones por token. Desarrollado por ReadyArt y cuantizado por mradermacher, este modelo esta especializado en roleplay, conversacion e instrucciones, con un enfoque en contenido no alineado y explicito para adultos. Se distribuye en formato GGUF con cuantizaciones i1 (imatrix) de alta calidad, lo que permite su ejecucion en una amplia gama de hardware, desde GPU de consumo hasta servidores profesionales.

El modelo base es un derivado de la arquitectura Gemma-4, con licencia Apache-2.0, lo que facilita su uso comercial y la creacion de obras derivadas. Su principal atractivo es la combinacion de un tamano total de 26B con solo 4B de parametros activos, ofreciendo un rendimiento notable para su coste computacional. La cuantizacion i1 incluye archivos imatrix y ofrece opciones desde 8.8 GB hasta 22.7 GB, siendo la version Q4_K_M la recomendada por su equilibrio entre velocidad y calidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mezcla de expertos) basada en Gemma-4 |
| Parametros totales | 25 233 142 046 (26B) |
| Parametros activos | 4 000 millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento
La arquitectura es de mezcla de expertos (MoE) con 4 mil millones de parametros activos de un total de 26 mil millones, siguiendo el patron A4B. El modelo base fue desarrollado por ReadyArt y esta construido sobre la arquitectura Gemma-4. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas de alineacion como RLHF o DPO, aunque el etiquetado como "unaligned" sugiere que no se aplicaron procesos de alineacion de seguridad.

El proceso de cuantizacion realizado por mradermacher utiliza la herramienta imatrix para generar cuantizaciones de alta calidad, especialmente en los rangos de menor precision. La variante i1 incorpora mejoras en el proceso de cuantizacion que, segun el autor, ofrecen mejor calidad que las cuantizaciones estaticas equivalentes. El modelo es un modelo de vision, aunque los archivos mmproj se encuentran en el repositorio estatico.

## Capacidades
- Generacion de texto conversacional y roleplay de larga duracion, con capacidad de mantener personajes y contexto a lo largo de multiples turnos.
- Sigue instrucciones en formato instructivo, aunque su entrenamiento esta orientado a interacciones no alineadas y contenido adulto.
- Capacidad de procesamiento de vision (modelo de vision), con archivos mmproj disponibles en el repositorio estatico.
- Soporte para contenido explicito y erotico (ERP), sin restricciones de seguridad.
- Cuantizaciones de alta calidad con imatrix para optimizar el rendimiento en distintos hardwares.
- Compatible con endpoints y herramientas de despliegue como llama.cpp, Ollama y LM Studio.

## Casos de uso
- Creacion de personajes para roleplay en juegos de texto: el modelo puede mantener conversaciones coherentes y con personalidad durante largas sesiones, gracias a su entrenamiento especifico en roleplay y su arquitectura MoE que permite respuestas rapidas.
- Generacion de ficcion interactiva: permite escribir historias ramificadas donde el usuario decide el rumbo de la narrativa, aprovechando su capacidad de seguir instrucciones en formato instructivo.
- Chatbots de entretenimiento para adultos: su capacidad de generar contenido explicito y no alineado lo hace adecuado para aplicaciones de entretenimiento para mayores de edad, siempre con los debidos controles de acceso.
- Desarrollo de asistentes conversacionales con personalidad: su entrenamiento en conversacion permite crear asistentes con un tono y caracter especificos, aunque solo en ingles y sin barreras de seguridad.
- Investigacion sobre modelos no alineados: su naturaleza unaligned permite estudiar el comportamiento de modelos sin restricciones de seguridad, en entornos controlados y eticos.
- Despliegue en hardware de consumo: con cuantizaciones como i1-Q4_K_M (16.9 GB), puede ejecutarse en GPU de gama alta de consumo, como RTX 4090, para uso local y privado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: desde 8.8 GB (i1-IQ1_M) hasta 22.7 GB (i1-Q6_K). La cuantizacion i1-Q4_K_M (16.9 GB) es la recomendada por el autor para un equilibrio entre calidad y velocidad.
- GPU recomendadas: para cuantizaciones ligeras (IQ1-M a IQ2_M) se puede usar una GPU de 12-16 GB como RTX 3060 o RTX 4070. Para cuantizaciones medianas (Q4_K_S a Q4_K_M) se necesita una GPU con 16-24 GB, como RTX 4090. Para Q6_K, se requiere una GPU de 24 GB o mas, como A100 o RTX 4090 en configuracion de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama.cpp server o vLLM (con adaptador de GGUF).
- Latencia y throughput: no disponible, pero la arquitectura MoE con 4B activos permite una velocidad de generacion superior a la de un modelo denso de 26B, con una latencia estimada menor en hardware moderno.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados. Se sugiere comparar con otros modelos de roleplay cuantizados en GGUF, como los de la familia "Melding" de ReadyArt, aunque no se especifican datos concretos.

## Limitaciones y advertencias
- Contenido no alineado y explicito: el modelo esta disenado para generar contenido adulto y explicito, sin filtros de seguridad. No es adecuado para uso en entornos de produccion sin controles de acceso estrictos.
- Riesgo de alucinacion: al ser un modelo no alineado, puede generar informacion falsa o sesgada con mayor facilidad. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de idioma: solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Longitud de contexto no especificada: no se proporciona la longitud de contexto, por lo que se recomienda probar con ventanas de 4K a 8K tokens, que es lo habitual en modelos de este tamano.
- Calidad de cuantizaciones extremas: las cuantizaciones i1-IQ1_M e i1-IQ2_M tienen una calidad muy baja y solo deben usarse para pruebas de concepto, no para produccion.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el contenido generado puede estar sujeto a restricciones adicionales de los desarrolladores originales. Se recomienda revisar los terminos de ReadyArt.

## Enlaces
- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v2.0-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v2.0-GGUF
- Version anterior (v1): https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Pagina de preguntas de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5b810600771f265fc1e39442288e8ec9
- Pagina de descarga alternativa: https://hf.tst.eu/model#Melody1437-26B-A4B-v2.0-i1-GGUF
- Entrada en KnowYourModel: https://www.knowyourmodel.ai/models/huggingface%3Amradermacher%2FMelody1437-26B-A4B-i1-GGUF
- Pagina de descarga en oktechmasters: https://oktechmasters.org/ai_models/melody1437-26b-a4b-v2-0-gguf/
