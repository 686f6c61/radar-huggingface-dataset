# nvidia/diffusiongemma-26B-A4B-it-NVFP4

## Resumen

DiffusionGemma 26B A4B IT es un modelo generativo multimodal de pesos abiertos desarrollado por Google DeepMind que procesa entradas de texto, imagen y video para producir texto mediante difusion discreta. La version aqui descrita, `nvidia/diffusiongemma-26B-A4B-it-NVFP4`, es una cuantizacion del modelo original realizada por NVIDIA con su herramienta Model Optimizer (ModelOpt) en formato NVFP4, de 4 bits. Esta construido sobre la arquitectura Gemma 4 26B A4B de tipo Mixture-of-Experts (MoE), con 25,2B parametros totales y 3,8B parametros activos por token, y emplea un diseno encoder-decoder con atencion bidireccional que genera tokens en bloques paralelos de 256.

La innovacion principal reside en el mecanismo de difusion: en lugar de decodificar token a token de forma autorregresiva, el modelo genera bloques completos de 256 tokens en paralelo mediante muestreo por difusion con parada adaptativa, lo que permite velocidades superiores a 1.100 tokens por segundo en configuraciones de batch bajo sobre NVIDIA Hopper H100 en FP8. El modelo soporta una ventana de contexto de 256K tokens, modo de razonamiento (thinking) configurable, function calling nativo e inferencia en mas de 35 idiomas.

Esta version resulta relevante porque combina tres tendencias actuales: cuantizacion agresiva de bajo bit para reducir huella de memoria, arquitecturas MoE de parametros activos reducidos para abaratar el coste por token, y decodificacion por difusion como alternativa a la generacion autorregresiva clasica. La licencia Apache 2.0 (con terminos adicionales de Gemma) permite uso comercial, y el repositorio acumula mas de 41.000 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con Mixture-of-Experts (MoE) y atencion bidireccional; generacion por difusion discreta |
| Parametros totales | 25,2B segun model card; 14.404.786.224 en pesos cuantizados safetensors (el empaquetado NVFP4 reduce el conteo efectivo almacenado) |
| Parametros activos | 3,8B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (4 bits) generada con NVIDIA ModelOpt |
| Idiomas soportados | 35+ idiomas |
| Licencia | Apache 2.0, con sujecion adicional a Gemma Terms of Use y Gemma Prohibited Use Policy |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,9 GB |
| Tamano del vocabulario | 262.144 |
| Modalidades de entrada | Texto, imagen (RGB, aspecto y resolucion variables) y video (MP4/WebM) |
| Modalidades de salida | Texto (string, JSON estructurado) |
| Motor de ejecucion | vLLM |
| Hardware soportado | NVIDIA Blackwell, NVIDIA Hopper (H100) |
| Sistema operativo | Linux |

## Arquitectura y entrenamiento

El modelo base, `google/diffusiongemma-26B-A4B-it`, es un transformer encoder-decoder de tipo Mixture-of-Experts con atencion bidireccional. Frente a la generacion autorregresiva token a token, DiffusionGemma produce texto mediante un proceso de difusion discreta que rellena bloques de 256 tokens en paralelo, con un mecanismo de parada adaptativa que decide cuando detener el muestreo. Esta estrategia aprovecha el paralelismo de la GPU de forma mas eficiente en regimenes de batch bajo, alcanzando mas de 1.100 tokens por segundo en una H100 configurada en FP8. La atencion bidireccional dentro de cada bloque de generacion es la que habilita este esquema.

El modelo procesa imagenes mediante un presupuesto de tokens visuales configurable (70, 140, 280, 560 o 1120 tokens por imagen), acepta relaciones de aspecto y resoluciones variables, y trata el video como secuencias de fotogramas de hasta 60 segundos a 1 fotograma por segundo. La cuantizacion NVFP4 de esta version concreta la realizo NVIDIA, no Google: no hubo reentrenamiento ni ajuste, solo calibracion sobre los datasets `cnn_dailymail` (articulos y resumenes de noticias en ingles) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multiturno de NVIDIA). No se dispone de datos sobre el volumen de tokens de preentrenamiento ni sobre la composicion exacta del dataset original, que la model card declara como no divulgada.

## Capacidades

- Generacion de texto multimodal a partir de entradas de texto, imagen y video.
- Razonamiento paso a paso con modo thinking configurable.
- Generacion de codigo y razonamiento logico-matematico.
- Function calling nativo (tool calling) y salida en JSON estructurado.
- Flujos de trabajo agenticos y razonamiento multi-paso.
- Comprension de documentos e imagenes: OCR, interpretacion de graficos, analisis de PDF y analisis de pantallas e interfaces de usuario.
- Analisis de contenido de video mediante secuencias de fotogramas.
- Inferencia multilingue en mas de 35 idiomas.
- Generacion de alto rendimiento en bloques paralelos de 256 tokens con parada adaptativa.
- Contexto largo de hasta 256K tokens para conversaciones y documentos extensos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multiturno con contexto muy largo (256K tokens), recordando el historial completo de una interaccion sin truncar, y responder en cualquiera de los 35+ idiomas soportados.
- Generacion de codigo en produccion: con function calling nativo y salida JSON estructurada, puede integrarse en pipelines de CI/CD para autocompletar codigo, generar tests o invocar herramientas de compilacion y despliegue.
- Analisis de documentos y OCR: la entrada de imagen con presupuesto de tokens visuales configurable permite procesar PDF, facturas, tablas y capturas de pantalla, extrayendo texto e interpretando graficos para tareas de digitalizacion o auditoria.
- Analisis de video para moderacion o resumen: dividiendo el video en fotogramas (hasta 60 segundos a 1 fps), el modelo puede resumir contenido, detectar elementos relevantes o generar subtitulos descriptivos.
- Agentes autonomos multi-paso: el function calling nativo y la ventana de contexto larga permiten construir agentes que encadenan llamadas a herramientas, mantienen estado durante largas sesiones y ejecutan tareas complejas con razonamiento intermedio.
- Ingesta y resumen de noticias a gran escala: gracias al throughput superior a 1.100 tokens por segundo, resulta adecuado para resumir grandes volumenes de articulos (tarea sobre la que fue calibrado con cnn_dailymail) en sistemas de monitorizacion de medios.
- Asistente tecnico multilingue: combinando comprension de capturas de pantalla o diagramas con respuesta en multiples idiomas, se puede desplegar como ayuda de soporte tecnico para usuarios internacionales.
- Extraccion de informacion estructurada: la salida en JSON permite convertir documentos no estructurados (imagenes, PDF, video transcrito) en registros estructurados para bases de datos o sistemas ERP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion del modelo base fue realizada por el tercero (Google), no por NVIDIA para esta version cuantizada, y no incluye cifras numericas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados en NVFP4 ocupan aproximadamente 18,9 GB en el repositorio; a ello hay que sumar el cache KV, que con contexto de 256K tokens puede requerir decenas de GB adicionales segun la configuracion de batch y precision del cache.
- GPU recomendadas: NVIDIA H100 (Hopper) y GPU de arquitectura Blackwell. Son las unicas microarquitecturas declaradas como compatibles por el autor.
- Compatibilidad con GPU de consumo: la model card solo lista Hopper y Blackwell, por lo que no se garantiza compatibilidad con GPU de consumo como las RTX 4090; el tamano de los pesos (mas de 18 GB) ya excede la VRAM de muchas tarjetas de consumo de gama alta.
- Opciones de despliegue: el motor de ejecucion soportado oficialmente es vLLM. El formato NVFP4 esta pensado para el stack de NVIDIA, de modo que llama.cpp u Ollama no estan contemplados como opciones compatibles con estas pesos cuantizados.
- Latencia y throughput: el modelo base alcanza mas de 1.100 tokens por segundo en H100 en FP8 en regimenes de batch bajo. No se especifican cifras de rendimiento propias para esta version NVFP4 en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nvidia/diffusiongemma-26B-A4B-it-NVFP4 | 25,2B (14,4B en safetensors NVFP4) | 3,8B | 256K | NVFP4 (4 bits) | Apache 2.0 + terminos Gemma | HuggingFace, via NVIDIA |
| google/diffusiongemma-26B-A4B-it (modelo base) | 25,2B | 3,8B | 256K | Sin cuantizar (FP original) | Apache 2.0 + terminos Gemma | HuggingFace, via Google |

No se dispone de informacion suficiente sobre otros modelos comparables de la misma categoria (MoE multimodal con decodificacion por difusion) en el material proporcionado; la comparativa se limita por tanto al modelo base original y a esta version cuantizada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos especificos, pero al ser un modelo entrenado por un tercero (Google) sobre datos no divulgados, se heredan los sesgos potenciales del corpus original.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de OCR, interpretacion de graficos o resumen de documentos largos, donde puede inventar detalles no presentes en la fuente.
- La cuantizacion NVFP4 puede introducir degradacion de precision respecto al modelo base sin cuantizar; no se aportan datos de la perdida de calidad asociada.
- Aunque soporta 35+ idiomas, el grueso de la calibracion para esta version se hizo sobre `cnn_dailymail` (ingles) y un dataset de NVIDIA, por lo que el rendimiento en idiomas minoritarios puede ser inferior.
- La licencia combina Apache 2.0 con Gemma Terms of Use y Gemma Prohibited Use Policy, lo que impone restricciones adicionales al uso comercial mas alla de las de Apache 2.0 pura; conviene revisar los terminos de Gemma antes del despliegue.
- Este modelo no fue entrenado ni evaluado por NVIDIA: es exclusivamente una cuantizacion del modelo de Google, y la responsabilidad sobre el comportamiento del modelo subyacente recae en el desarrollador original.
- Solo se declaran compatibles H100 y Blackwell con vLLM; desplegarlo en otras GPU o con otros motores (llama.cpp, Ollama, TGI) no esta soportado oficialmente.
- El elevado tamano del contexto (256K) puede multiplicar los requisitos de memoria del cache KV, lo que puede hacer inviable usar la ventana completa en hardware limitado.

## Enlaces

- HuggingFace (esta version cuantizada): https://huggingface.co/nvidia/diffusiongemma-26B-A4B-it-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- NVIDIA Model Optimizer (herramienta de cuantizacion): https://github.com/NVIDIA/Model-Optimizer
- Licencia Apache 2.0 del repositorio: https://huggingface.co/nvidia/diffusiongemma-26B-A4B-it-NVFP4/blob/main/apache_2.0_license.md
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
