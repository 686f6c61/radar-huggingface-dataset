# mradermacher/Lodestar-4B-GGUF

## Resumen

Lodestar-4B-GGUF es la distribucion en formato GGUF del modelo StartLux-Decision-v1-4B, un modelo de decision tipada (typed-decisions) desarrollado por startlux-models y cuantizado por mradermacher. El modelo base cuenta con 4.326.350.848 parametros (aproximadamente 4,3 mil millones) y esta orientado a tareas de clasificacion y toma de decisiones estructuradas, no a generacion de texto libre. Su proposito es emitir decisiones con tipos definidos, lo que lo hace adecuado para integrarse en pipelines automatizados donde la salida debe ser parseable y validable.

La relevancia de esta publicacion radica en que ofrece el modelo en una amplia gama de cuantizaciones GGUF (desde Q2_K hasta f16), lo que permite desplegarlo en hardware modesto, incluso en CPU, mediante llama.cpp u Ollama. El repositorio incluye ademas ficheros mmproj (multi-modal supplement), lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla su alcance.

La licencia es CC-BY-NC-4.0, es decir, no permite uso comercial. El modelo solo declara soporte para ingles. La informacion publicada es escasa: no se detallan la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision tipada; arquitectura transformer no confirmada en la informacion) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 41,0 GB |
| Modelo base | startlux-models/StartLux-Decision-v1-4B |
| Libreria | transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base StartLux-Decision-v1-4B. Los tags del repositorio indican que se trata de un modelo de decision tipada (decision-model, typed-decisions) orientado a clasificacion, con soporte conversacional. El numero de parametros (4,3 mil millones) es coherente con un transformer de tamano medio, pero no se confirma la arquitectura exacta ni si emplea tecnicas como MoE, attention lineal o decodificacion especulativa.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La presencia de ficheros mmproj en el repositorio GGUF sugiere que el modelo base incorpora un componente multimodal (probablemente vision), pero la model card no describe su funcionamiento ni los datos empleados para entrenarlo. Las cuantizaciones son estaticas; el autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Clasificacion y emision de decisiones tipadas: el modelo esta disenado para producir salidas estructuradas con tipos definidos, adecuadas para validacion automatica.
- Generacion conversacional: el tag conversational y la compatibilidad con endpoints indican uso en dialogos multi-turno, aunque no se detalla la calidad.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere soporte de entrada multimodal (probablemente imagen), sin especificar el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Clasificacion automatizada de tickets de soporte: el modelo puede recibir el texto de una incidencia y emitir una decision tipada (categoria, prioridad, equipo responsable) que se valide contra un esquema, reduciendo el post-procesado necesario.
- Enrutamiento de solicitudes en flujos de trabajo: en un pipeline de orquestacion, el modelo puede decidir a que cola o servicio derivar una peticion, aprovechando su naturaleza de decision-model para producir salidas parseables.
- Moderacion de contenido asistida: clasificar mensajes o publicaciones en categorias predefinidas y devolver una decision estructurada que el sistema aplique automaticamente.
- Extraccion de decisiones en formularios o encuestas: dado un texto libre, el modelo puede mapearlo a opciones tipadas de un formulario, facilitando la digitalizacion de respuestas.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_S o Q4_K_M (2,7-2,9 GB), puede ejecutarse en portatiles o servidores sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace viable para prototipos y pruebas locales.
- Procesamiento por lotes en CPU: con cuantizaciones Q2_K (2,1 GB) o Q3_K_S (2,2 GB) puede ejecutarse en contenedores sin acelerador, adecuado para tareas de clasificacion masiva donde la latencia no es critica.
- Clasificacion multimodal (si se confirma el componente mmproj): con los ficheros mmproj podria procesar entradas de imagen junto con texto, aunque la model card no detalla esta capacidad y requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K), 2,7-2,9 GB (Q4_K_S / Q4_K_M), 3,7 GB (Q6_K), 4,7 GB (Q8_0) y 8,8 GB (f16). Los ficheros mmproj anaden 0,5-0,8 GB si se usa el componente multimodal.
- GPU recomendadas: cualquier GPU consumer con 4-6 GB de VRAM puede ejecutar las cuantizaciones Q4 o Q5; para f16 se recomienda al menos 10-12 GB (RTX 3080/4080, RTX 4090, A100, H100). En GPU de datacenter el modelo es pequeno y puede servirse con alta concurrencia.
- Cabe en GPU consumer: si, en tarjetas como GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, usando cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. El modelo base en safetensors puede servirse con transformers, vLLM o TGI, aunque no se confirma soporte explicito de estos ultimos para esta variante.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables de decision tipada en la informacion proporcionada. Se ofrece una comparacion estructural limitada:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lodestar-4B-GGUF (este modelo) | 4,3 mil millones | no disponible | cc-by-nc-4.0 | GGUF | Decision tipada, solo ingles, multimodal via mmproj |
| StartLux-Decision-v1-4B (base) | 4,3 mil millones | no disponible | cc-by-nc-4.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de clasificacion de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del titular.
- Solo soporta ingles; no hay evidencia de calidad en castellano u otros idiomas.
- Informacion muy escasa: no se publican datos de entrenamiento, contexto, arquitectura ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de clasificacion, la salida tipada puede no ajustarse al esquema esperado si no se valida.
- Capacidad multimodal no documentada: los ficheros mmproj existen, pero no se describe su funcionamiento ni sus limitaciones; requiere validacion empirica.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas, lo que puede afectar la calidad en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).
- Modelo de nicho con pocas descargas (236) y sin likes: no hay comunidad ni evidencia de uso en produccion.
- No se confirma soporte de tool calling ni de razonamiento multi-paso, por lo que no deberia asumirse para agentes complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lodestar-4B-GGUF
- Modelo base: https://huggingface.co/startlux-models/StartLux-Decision-v1-4B
- Pagina de descargas del autor: https://hf.tst.eu/model#Lodestar-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
