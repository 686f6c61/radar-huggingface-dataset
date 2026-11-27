# mradermacher/LingSante-3.1-air-VL-GGUF

## Resumen

LingSante-3.1-air-VL es un modelo multimodal (vision-lenguaje) desarrollado por inclusionAI, distribuido originalmente en formato Transformers y aqui presentado como cuantizaciones GGUF estaticas por mradermacher. El modelo cuenta con aproximadamente 124.400 millones de parametros totales (124.414.211.552 segun los safetensors del repositorio base), lo que lo situa en la categoria de modelos de gran escala orientados a tareas de vision y lenguaje.

Esta ficha cubre especificamente la version GGUF publicada por mradermacher, que facilita la ejecucion del modelo en entornos con llama.cpp y herramientas compatibles, sin necesidad de infraestructura GPU de gran escala para las cuantizaciones mas agresivas. El repositorio incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0) junto con los ficheros mmproj necesarios para el procesamiento multimodal.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad una via practica para desplegar un modelo multimodal de gran tamano en hardware mas modesto, manteniendo la licencia MIT del modelo original, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 124.414.211.552 (~124,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, mecanismos de atencion, etc.), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estaticas del modelo inclusionAI/LingSante-3.1-air-VL y no incluye informacion tecnica del entrenamiento.

Lo que si se puede afirmar es que el modelo es multimodal: el repositorio incluye ficheros mmproj (multi-modal projection) en precision Q8_0 y f16, que son el componente que proyecta las representaciones visuales al espacio del modelo de lenguaje. Esto confirma soporte de entrada de imagenes junto con texto. El proceso de cuantizacion fue realizado con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estaticas; el autor indica ademas que existen cuantizaciones con imatrix en un repositorio separado (LingSante-3.1-air-VL-i1-GGUF).

## Capacidades

- Procesamiento multimodal: acepta imagenes junto con texto gracias a los ficheros mmproj incluidos (Q8_0 y f16).
- Generacion de texto conversacional: la model card etiqueta el repositorio como "conversational".
- Comprension de imagenes: al ser un modelo VL (vision-lenguaje), se orienta a tareas de descripcion, analisis y respuesta sobre contenido visual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles ("en"); no se confirman otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o tickets y extraer informacion textual estructurada, aprovechando su naturaleza vision-lenguaje y su capacidad conversacional para refinar la respuesta en turnos sucesivos.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo y descripciones detalladas de contenido visual en plataformas web, con la ventaja de que las cuantizaciones Q4 permiten desplegarlo en servidores con GPU de gama media.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios en comunidades o marketplaces, usando el modelo para generar informes textuales que luego se filtran con reglas.
- Asistencia en soporte tecnico con capturas de pantalla: el usuario envia una captura de un error o interfaz y el modelo responde con explicaciones o pasos de resolucion, manteniendo contexto multi-turno.
- Prototipado de asistentes multimodales en local: desarrolladores que quieran experimentar con un modelo VL de gran escala sin depender de APIs en la nube pueden usar las cuantizaciones Q2_K o Q3_K_S en hardware con suficiente RAM/VRAM unificada.
- Investigacion en evaluacion de modelos VL cuantizados: el conjunto de cuantizaciones disponible (desde 45,5 GB hasta 132,5 GB) permite estudiar la degradacion de calidad segun el nivel de cuantizacion en tareas de vision-lenguaje.
- Generacion de metadatos para catalogos de imagenes: etiquetado y descripcion de grandes volumenes de imagenes en pipelines por lotes, usando llama.cpp con la cuantizacion Q4_K_M como compromiso entre velocidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y del mmproj):
  - Q2_K: ~45,5 GB + mmproj (~0,7-1,0 GB).
  - Q3_K_S: ~53,9 GB; Q3_K_M: ~59,4 GB; Q3_K_L: ~64,5 GB.
  - IQ4_XS: ~67,0 GB; Q4_K_S: ~70,8 GB; Q4_K_M: ~75,4 GB.
  - Q5_K_S: ~85,9 GB; Q5_K_M: ~88,4 GB.
  - Q6_K: ~102,3 GB (dividido en 3 partes).
  - Q8_0: ~132,5 GB (dividido en 3 partes).
- GPU recomendadas: para las cuantizaciones bajas (Q2_K, Q3_K_S) se requiere al menos una GPU con 48 GB o combinacion de varias; para Q4_K_M en adelante se recomienda multiples A100/H100 (80 GB) o configuraciones multi-GPU. No cabe en GPU de consumo individual (RTX 4090 con 24 GB) en ninguna cuantizacion.
- Cabe en consumer GPU: no, en ninguna de las cuantizaciones publicadas; el minimo (Q2_K) supera ampliamente los 24 GB de una RTX 4090. Requiere configuraciones multi-GPU o CPU con gran cantidad de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), y otros runners compatibles con GGUF. No es compatible directamente con vLLM o TGI en su formato GGUF, que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones comparables de otros modelos de la misma categoria (multimodales de ~124B). Se indica "no disponible" para los campos de rendimiento y contexto de las alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|
| LingSante-3.1-air-VL (GGUF) | ~124,4 B | no disponible | MIT | GGUF | Multimodal, cuantizaciones de 45,5 a 132,5 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Sesgos: no se documentan en la informacion proporcionada; al ser un modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos, pero no hay confirmacion oficial.
- Alucinacion: riesgo inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para este modelo.
- Licencia: MIT, lo que permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas en el repositorio GGUF.
- Cuantizacion: las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opcion rapida y Q8_0 como mejor calidad. Para tareas de vision, la degradacion puede ser especialmente sensible.
- Requisitos de hardware: incluso la cuantizacion mas pequena (45,5 GB) excede la VRAM de GPU de consumo, lo que limita su despliegue a infraestructura profesional o configuraciones con RAM del sistema muy alta.
- Repositorio de gran tamano: 846 GB en total, con ficheros divididos en partes para Q6_K y Q8_0; la descarga y verificacion requieren planificacion.
- Faltan datos tecnicos clave (contexto, arquitectura, benchmarks) en la informacion disponible, lo que impide una evaluacion completa de idoneidad para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LingSante-3.1-air-VL-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LingSante-3.1-air-VL-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LingSante-3.1-air-VL-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
