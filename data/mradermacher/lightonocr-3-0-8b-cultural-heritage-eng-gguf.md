# mradermacher/LightOnOCR-3-0.8B-cultural-heritage-eng-GGUF

## Resumen

LightOnOCR-3-0.8B-cultural-heritage-eng es un modelo vision-language especializado en reconocimiento optico de caracteres (OCR) y reconocimiento de texto manuscrito (HTR) sobre material de archivo y patrimonio cultural. Lo desarrolla Yale Cultural Heritage a partir de la familia LightOnOCR-3 y se distribuye bajo licencia Apache 2.0. Esta ficha concreta corresponde a la cuantizacion GGUF publicada por mradermacher, que permite ejecutar el modelo en entornos con llama.cpp sin necesidad de GPU de datacenter.

El modelo resuelve un problema muy concreto: transcribir documentos historicos, manuscritos y material de archivo en ingles con un modelo pequeno (752 millones de parametros) que quepa en hardware modesto. Se ha afinado con LoRA sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, lo que lo orienta a transcripciones de archivo con tipografias y caligrafias historicas, un dominio donde los OCR genericos fallan con frecuencia.

Es relevante ahora porque combina tres factores poco habituales: tamano reducido (menos de 1.000 millones de parametros), licencia permisiva para uso comercial y disponibilidad en formato GGUF con cuantizaciones desde Q2_K hasta f16. Esto lo hace apto para digitalizacion masiva de fondos documentales en instituciones con presupuesto limitado de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language (transformers); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors via transformers) |

## Arquitectura y entrenamiento

El modelo base es `yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng`, un vision-language de la familia LightOnOCR-3 con 752 millones de parametros. La model card de esta cuantizacion no detalla la arquitectura interna (numero de capas, dimension del encoder visual, mecanismo de atencion), por lo que esos datos figuran como no disponibles. El pipeline declarado en HuggingFace es `no disponible`, aunque las etiquetas indican `transformers` y `vision-language`.

El ajuste se realizo mediante LoRA sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, orientado a transcripciones de patrimonio cultural. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La etiqueta `smithsonian-transcription-center` sugiere vinculacion con iniciativas de transcripcion de archivos del Smithsonian, pero no se aportan mas detalles tecnicos sobre ese extremo.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos impresos, incluyendo tipografias historicas.
- Reconocimiento de texto manuscrito (HTR) en ingles, orientado a manuscritos y material de archivo.
- Transcripcion de documentos de patrimonio cultural y fondos documentales.
- Procesamiento de imagen como entrada (modelo vision-language, requiere el fichero `mmproj` para la proyeccion multimodal en llama.cpp).
- Generacion de texto de transcripcion en ingles.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta etiquetado unicamente como `en`.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Digitalizacion masiva de fondos de archivo: el modelo transcribe imagenes de documentos historicos en ingles y, con cuantizaciones Q4_K_M de 0,6 GB, permite procesar lotes grandes en CPU o GPU consumer, lo que abarata el coste por pagina frente a modelos de mayor tamano.
- Proyectos de transcripcion colaborativa tipo Smithsonian Transcription Center: sirve como primer paso automatico que genera borradores de transcripcion que voluntarios o revisores corrigen despues, reduciendo el esfuerzo manual.
- Archivos y bibliotecas con manuscritos en ingles: al estar afinado sobre transcripciones de patrimonio cultural, maneja mejor caligrafias y formatos documentales historicos que un OCR generico.
- Investigacion en humanidades digitales: permite convertir corpus de documentos escaneados en texto buscable y analizable sin depender de servicios cloud con coste por uso.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q2_K a Q4_K_S (0,5-0,6 GB) caben en equipos sin GPU dedicada, lo que facilita su uso en instituciones pequenas o en campo.
- Integracion en pipelines de preservacion digital: al ser GGUF y compatible con llama.cpp, se puede encadenar con herramientas de preprocesado de imagen y postprocesado de texto en flujos automatizados.
- Prototipado rapido de aplicaciones de lectura documental: el f16 (1,6 GB) y Q8_0 (0,9 GB) permiten validar la calidad de transcripcion antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB con Q2_K a Q4_K_S; 0,6-0,7 GB con Q4_K_M a Q5_K_M; 0,7 GB con Q6_K; 0,9 GB con Q8_0; 1,6 GB con f16. Hay que sumar el fichero `mmproj` (0,2 GB en Q8_0 o 0,3 GB en f16) para el procesamiento de imagen.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con la API de llama.cpp). El formato GGUF no es compatible directamente con vLLM ni TGI en su configuracion estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-cultural-heritage-eng (esta ficha) | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | OCR/HTR especializado en patrimonio cultural en ingles |
| Modelo base LightOnOCR-3-0.8B (sin afinado cultural) | ~752 M | no disponible | no disponible | safetensors | Punto de partida del afinado LoRA; no se dispone de ficha comparativa detallada |
| OCR genericos de gran tamano (p. ej. familias vision-language de miles de millones de parametros) | > 1 B | variable | variable | variable | Mayor coste de inferencia; no se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles: no esta entrenado ni etiquetado para otros idiomas, por lo que su uso con documentos en castellano u otras lenguas no esta respaldado.
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo, puede inventar palabras o completar lineas ilegibles de forma plausible pero incorrecta; en archivos historicos conviene revision humana.
- Sesgo de dominio: el afinado se centra en transcripciones de patrimonio cultural en ingles, lo que puede degradar el rendimiento en documentos modernos, formularios, tablas complejas o caligrafias no representadas en el dataset.
- Sin datos de benchmarks publicados: no es posible estimar de antemano la tasa de error (CER/WER) frente a alternativas.
- Arquitectura y contexto no documentados: la model card de la cuantizacion no detalla la ventana de contexto ni la composicion interna, lo que complica la planificacion de documentos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision de transcripcion; se recomienda Q4_K_M o superior para uso en produccion.
- Requiere el fichero `mmproj` adicional para procesar imagenes en llama.cpp; sin el, el modelo no funciona como vision-language.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento por si imponen restricciones adicionales.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-0.8B-cultural-heritage-eng
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-0.8B-cultural-heritage-eng-GGUF
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
