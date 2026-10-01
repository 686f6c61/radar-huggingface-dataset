# autotrust/JEV-27B-VL

## Resumen

JEV-27B-VL es un modelo multimodal (image-text-to-text) desarrollado por autotrust que parte de Qwen/Qwen3.8-27B y le anade capacidad de vision. Su propuesta central es doble: por un lado, un modo "System 2" que es el propio Qwen3.8-27B sin modificar, capaz de razonar paso a paso y generar texto a partir de texto e imagenes; por otro, un modo "System 1" que convierte la inferencia en decisiones tipadas (si/no, elegir una entre 2 y 256 opciones, valorar de 0 a 5) y devuelve una probabilidad calibrada por opcion en un unico forward pass, sin muestreo autoregresivo.

El modelo se distribuye bajo licencia Apache 2.0, con 27.781.427.952 parametros reales verificados en safetensors y un repositorio de 56,0 GB. Soporta prompts de hasta 256K tokens y esta pensado para escenarios donde hace falta una senal probabilistica rapida y barata: recomendacion zero-shot, clasificacion de intenciones, control de entornos interactivos o filtrado con umbrales de confianza.

Su relevancia actual radica en que demuestra que un modelo de casi 28B puede igualar a un sistema de filtrado colaborativo entrenado con historiales de 59.045 usuarios en recomendacion de video corto, usando unicamente las portadas de los videos y sin ningun dato de comportamiento. Ademas expone System 1 sobre HTTP plano mediante un endpoint `POST /v1/decide` sobre vLLM, lo que facilita su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivada de Qwen3.8-27B; identificador de arquitectura `qwen3_5` en transformers |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (verificados hasta 250K tokens de texto en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); repositorio de 56,0 GB |
| Relacion con el modelo base | `base_model_relation: adapter` (LoRA) sobre Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La model card describe dos modos que conviven en el mismo modelo. "System 2" es, segun el autor, el Qwen3.8-27B sin modificar: un transformer con entrada de imagen que puede razonar paso a paso y devolver texto. "System 1" anade una cabeza de decision tipada que, dado un estado (texto y/o imagen), una pregunta y un conjunto de opciones, produce una probabilidad calibrada para cada opcion en un solo forward pass, sin decodificacion autoregresiva. Los metadatos lo etiquetan como `adapter` (LoRA) sobre el modelo base, aunque el repositorio contiene 27,78 mil millones de parametros en safetensors (56 GB), un volumen compatible con pesos completos en BF16/FP16 mas que con un adaptador ligero.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo RLHF, DPO u otra fase de alineacion: esos datos no estan disponibles en la model card. Lo que si se documenta es el comportamiento zero-shot: el modelo resuelve clasificacion con hasta 256 opciones sin reentrenamiento, mantiene la precision en prompts de hasta 250K tokens con una frase relevante oculta a profundidad aleatoria (20 de 20 aciertos en todas las longitudes probadas) y admite descripciones de una linea por opcion que mejoran el resultado (en CLINC150 pasa de 89,5% a 93,8%). La model card tambien senala empiricamente que el formato JSON frente a texto plano y las instrucciones adicionales no producen diferencias medibles.

## Capacidades

- Generacion de texto y razonamiento paso a paso mediante el modo System 2 (Qwen3.8-27B sin modificar, con entrada de imagen).
- Decisiones tipadas en System 1: preguntas de si/no, eleccion de una opcion entre 2 y 256 alternativas, y valoraciones en escala 0-5, sobre texto e imagenes.
- Salida de probabilidad calibrada por cada opcion en un unico forward pass, apta para uso directo como score o umbral.
- Clasificacion de intenciones zero-shot (evaluado en CLINC150 con las 150 intenciones como opciones).
- Recomendacion zero-shot de video corto a partir de portadas, sin historial de interacciones ni embeddings de item.
- Reconocimiento progresivo de dibujos (Quick, Draw!), incluyendo prediccion con trazos incompletos.
- Control de entornos interactivos: los ejemplos de la model card incluyen Super Mario Bros., Tetris, Snake y la resolucion de un cubo de Rubik de 25 movimientos eligiendo entre 11 formulas.
- Servicio HTTP de System 1 sobre vLLM mediante `serve_decide.py` y el endpoint `POST /v1/decide`.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita mas alla del modo System 2.
- Capacidades multilingues: solo ingles segun los metadatos.

## Casos de uso

- Recomendacion de video corto en feeds tipo TikTok: el modelo recibe las portadas de los ultimos 5 videos vistos por el usuario mas la portada candidata y devuelve P(el usuario lo ve), lo que permite puntuar un video recien subido antes de que nadie lo haya visto. Es el caso que resuelve el problema de cold-start que el filtrado colaborativo no cubre.
- Clasificacion de intenciones en asistentes y chatbots: con las 150 intenciones de CLINC150 como opciones, obtiene 93,8% zero-shot usando descripciones de una linea, sin necesidad de reentrenar al anadir clases nuevas.
- Moderacion de contenido con umbral de confianza: al devolver una probabilidad calibrada por opcion (por ejemplo, permitir / revisar / bloquear), permite fijar umbrales operativos y derivar solo los casos dudosos a revision humana.
- Enrutado y triaje de peticiones: usar System 1 para decidir a que modelo o herramienta derivar cada consulta, aprovechando el coste de un solo forward pass frente a una generacion completa.
- Reconocimiento de bocetos en aplicaciones educativas o de dibujo: la model card reporta 88% de acierto con el dibujo terminado y 62% con solo el 60% de los trazos, con unos 270 ms por intento.
- Agentes que juegan o controlan entornos discretos: elegir accion entre un conjunto cerrado de movimientos con latencias de 46 a 300 ms por decision segun el entorno (Rubik, Tetris, Mario, Snake).
- Encuestas y recogida de valoraciones: mapear texto o imagenes a una escala 0-5 con distribucion de probabilidad, util para analisis de sentimiento graduado o puntuacion automatica de contenido.

## Benchmarks y rendimiento

Recomendacion zero-shot de video corto en MicroLens-100k (200 usuarios, el video realmente visto siguiente oculto entre 19 candidatos de una ventana de +/-3 dias; cada metodo ordena los 20 candidatos):

| Metodo | Usa historial de interacciones | AUC | HR@5 | NDCG@10 |
|---|---|---:|---:|---:|
| Orden aleatorio | no | 0,489 | 0,205 | 0,219 |
| Similitud de titulos (TF-IDF) | no | 0,602 | 0,385 | 0,367 |
| JEV-27B-VL System 1, solo titulos | no, zero-shot | 0,649 | 0,455 | 0,399 |
| JEV-27B-VL System 1, solo portadas | no, zero-shot | 0,727 | 0,590 | 0,498 |
| Filtrado colaborativo item-based | si, 59.045 usuarios | 0,728 | 0,490 | 0,503 |

Otros resultados publicados en la model card:

| Tarea | Resultado |
|---|---|
| CLINC150, 150 intenciones como opciones, solo nombres | 89,5% |
| CLINC150, 150 intenciones con descripcion de una linea | 93,8% |
| Recuperacion de una frase en prompts de hasta 250K tokens | 20 de 20 correctos en todas las longitudes probadas |
| Quick, Draw!, dibujo terminado (16 respuestas) | 88% de acierto |
| Quick, Draw!, con el 60% de los trazos | 62% de acierto (6% por azar) |

Diferencias reportadas por el autor: las portadas superan a los titulos en +0,078 AUC (intervalo del 95%: +0,031 a +0,126); la diferencia de AUC frente al filtrado colaborativo es 0,000 (intervalo del 95%: -0,041 a +0,040), con mejor HR@5 (59% frente a 49%). Todos estos datos provienen de la model card del autor y no consta verificacion independiente. No hay resultados publicados de MMLU, HumanEval, GSM8K ni benchmarks similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 27,78 mil millones de parametros: unos 56 GB en BF16/FP16, unos 28 GB en INT8 y unos 14 GB en INT4. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- A la VRAM de pesos hay que sumar la cache KV, que con 256K tokens de contexto puede ser muy elevada; el autor no publica cifras de memoria para el contexto maximo.
- GPU recomendadas para BF16: A100 80 GB o H100 80 GB. Para INT8 puede bastar una A100 40 GB, con margen ajustado.
- En GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) no admiten BF16 completo; requeririan cuantizacion a 4 bits (unos 14 GB de pesos), y el contexto practico quedaria muy limitado por la cache KV.
- Despliegue: transformers como libreria principal (etiqueta del repositorio) y vLLM, usado por el propio autor para exponer `POST /v1/decide` mediante `serve_decide.py`. No se confirma soporte de GGUF, llama.cpp u Ollama en la informacion disponible. El tag `endpoints_compatible` indica compatibilidad con endpoints gestionados.
- Latencia observada en la model card (System 1, una decision por forward pass): unos 46 ms en cubo de Rubik, 122 ms en Tetris, 150 ms en Super Mario Bros., 270 ms por intento en Quick, Draw! y 300 ms en Snake. En el demo de recomendacion, 20 portadas candidatas se puntuan en aproximadamente 2,6 s en una sola GPU. No se publican cifras de throughput para generacion de texto (System 2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Modo de salida | Licencia |
|---|---|---|---|---|---|
| autotrust/JEV-27B-VL | 27,78 mil millones | 256K tokens | texto + imagen | System 1 (probabilidades) y System 2 (texto) | apache-2.0 |
| autotrust/JEV-27B | no disponible | no disponible | texto | System 1 y System 2 | no disponible |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | texto (segun el autor, System 2 lo usa con imagen) | texto / razonamiento | no disponible |

La comparativa mas informativa de la model card es funcional, no de parametros: frente al filtrado colaborativo item-based entrenado con 59.045 usuarios, JEV-27B-VL System 1 iguala el AUC (0,727 frente a 0,728) y mejora el HR@5 (0,590 frente a 0,490) sin usar ningun dato de comportamiento. Frente a la similitud de titulos por TF-IDF, la mejora es de +0,125 AUC. No se dispone de datos de otros modelos multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`en`); no hay evidencia de capacidades multilingues y el castellano no esta cubierto en los metadatos.
- Origen de los datos: todos los benchmarks proceden de la model card del propio autor; no consta replicacion independiente.
- Riesgo de alucinacion: el modo System 2 es el Qwen3.8-27B sin modificar, por lo que hereda sus riesgos de generacion no fiable. El modo System 1 mitiga esto al no generar texto libre, pero sigue siendo una estimacion probabilistica.
- Calibracion: se afirma que las probabilidades estan calibradas, pero no se detalla el metodo ni se aportan diagramas de calibracion (fiabilidad, ECE) en la informacion disponible.
- Contexto: aunque se declaran 256K tokens, no se publican datos de rendimiento ni de memoria en longitudes intermedias mas alla de la prueba de recuperacion de una frase.
- Inconsistencia en los metadatos: el campo `base_model_relation: adapter` y la etiqueta `lora` apuntan a un adaptador, pero el repositorio contiene 27,78 mil millones de parametros y 56 GB, volumen propio de pesos completos. Conviene verificar que artefacto se esta descargando antes de desplegar.
- Seccion truncada: la model card incluye un apartado "Highlight: age..." cuyo contenido no esta disponible en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen/Qwen3.8-27B conviene revisar las condiciones de la licencia del modelo base.
- No se confirma soporte de tool calling, function calling ni de cuantizacion a GGUF, lo que limita su uso en despliegues ligeros.
- Los resultados en juegos y en Quick, Draw! se presentan como demostraciones en video, sin protocolo de evaluacion detallado ni numero de episodios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo base textual (referencia del autor): https://huggingface.co/autotrust/JEV-27B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper citado en los metadatos: https://arxiv.org/abs/2512.16899
- Codigo, pipeline de datos y demo web (recomendacion de video): https://github.com/yuhai-china/JEV-27B-DEMO/tree/master/07-video-recommendation
- Dataset MicroLens-100k: https://github.com/westlake-repl/MicroLens
