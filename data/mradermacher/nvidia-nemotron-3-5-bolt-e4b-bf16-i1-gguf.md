# mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-i1-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-i1-GGUF es una cuantizacion en formato GGUF del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, desarrollado originalmente por NVIDIA y convertido por el usuario mradermacher. El modelo base emplea una arquitectura con 7.518.069.290 parametros totales (segun los datos de safetensors del repositorio), lo que sugiere un diseno de tipo mezcla de expertos (MoE) con parametros activos reducidos, aunque el numero exacto de parametros activos no se detalla en la informacion disponible. Esta orientado a tareas conversacionales y de generacion de texto multilingue.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad un conjunto amplio de cuantizaciones (desde i1-Q2_K hasta i1-Q6_K) generadas con imatrix, lo que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados. El modelo soporta 34 idiomas, entre ellos el espanol, y se distribuye bajo la licencia OpenMDW 1.1.

El repositorio incluye tanto cuantizaciones estaticas como dinamicas (i1), con tamanos que van desde 4,5 GB hasta 6,3 GB, facilitando el despliegue en entornos con recursos limitados mediante llama.cpp u otras herramientas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer tipo MoE, segun el nombre "E4B" y el recuento de parametros) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); cuantizaciones estaticas disponibles en repositorio separado |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh (34 idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un modelo de NVIDIA con 7.518.069.290 parametros totales y que forma parte de la familia Nemotron 3.5. El sufijo "E4B" en el nombre sugiere un diseno de mezcla de expertos con un numero reducido de parametros activos por token, pero no se confirma en la documentacion proporcionada. No se especifican el numero de capas, dimensiones ocultas, mecanismos de atencion ni innovaciones tecnicas concretas.

En cuanto al entrenamiento, la model card del repositorio cita los datasets nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3, lo que indica que el modelo fue entrenado en dos fases: preentrenamiento sobre un corpus propio de NVIDIA y postentrenamiento sobre un dataset especifico. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multilingue en 34 idiomas, incluido el espanol.
- Razonamiento y respuesta a instrucciones en formato conversacional (la model card incluye la etiqueta "conversational").
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en espanol y otros idiomas europeos, adecuado para empresas que necesitan soporte multilingue con un unico modelo desplegado en local.
- Asistentes conversacionales en entornos con recursos limitados: las cuantizaciones i1-Q4_K_M (5,4 GB) permiten ejecutar el modelo en GPUs de consumo, lo que facilita prototipos y despliegues en estaciones de trabajo sin infraestructura de centro de datos.
- Generacion de contenido multilingue: con soporte para 34 idiomas, se puede emplear para redactar, traducir o resumir textos en mercados internacionales sin depender de APIs externas.
- Procesamiento de documentos en local: al poder ejecutarse con llama.cpp, encaja en flujos donde la confidencialidad impide enviar datos a servicios en la nube.
- Investigacion y evaluacion de modelos: util para investigadores que quieran comparar el rendimiento de un modelo Nemotron cuantizado frente a otras alternativas en tareas de razonamiento y conversacion.
- Despliegue en dispositivos de borde: las cuantizaciones de menor tamano (i1-Q2_K, 4,5 GB) permiten experimentar con el modelo en hardware modesto, aunque con perdida de calidad.
- Fine-tuning o experimentacion posterior: el archivo imatrix incluido permite generar cuantizaciones personalizadas para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,5 GB (i1-Q2_K) y 6,3 GB (i1-Q6_K) solo para los pesos; hay que anadir el espacio para el contexto KV, que depende de la longitud de contexto no especificada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de las cuantizaciones, cabria esperar que funcionase en GPUs de consumo con 8 GB o mas de VRAM, pero no se confirma.
- Cabe en GPU de consumo: probablemente si en GPUs con 8 GB o mas de VRAM para las cuantizaciones Q4 y Q5; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (formato GGUF), y por extension herramientas compatibles como Ollama o LM Studio; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo original en BF16; las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-Q3_K_S) pueden degradar notablemente el rendimiento.
- No se dispone de informacion sobre sesgos conocidos del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas en la informacion disponible.
- Limitaciones de contexto e idioma: aunque se listan 34 idiomas, no se especifica el nivel de calidad por idioma ni la longitud de contexto soportada.
- Restricciones de licencia: la licencia OpenMDW 1.1 debe revisarse antes de uso comercial; no se detallan sus terminos en la informacion proporcionada.
- El repositorio es una cuantizacion de terceros (mradermacher), no una publicacion oficial de NVIDIA; para produccion conviene validar contra el modelo base oficial.
- No se confirman capacidades de tool calling, agentes o codigo, por lo que no deberian asumirse en un diseno de produccion sin pruebas previas.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-i1-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-i1-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
