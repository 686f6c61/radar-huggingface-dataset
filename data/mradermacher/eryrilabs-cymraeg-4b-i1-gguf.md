# mradermacher/EryriLabs-cymraeg-4B-i1-GGUF

## Resumen
EryriLabs-cymraeg-4B-i1-GGUF es la distribucion en formato GGUF, con cuantizacion ponderada mediante imatrix (metodo i1), del modelo EryriLabs-cymraeg-4B desarrollado por EryriLabs. El modelo base es un ajuste fino mediante LoRA de un modelo de la familia Gemma 4 orientado a conversacion en gales (cymraeg) e ingles, con un total de 8.134.102.314 parametros segun los pesos en safetensors del modelo original. Este repositorio lo publica mradermacher, especialista en generar versiones cuantizadas listas para inferencia local con llama.cpp y ecosistemas compatibles.

La relevancia del modelo radica en su enfoque en una lengua de recursos limitados como el gales, con un conjunto de datos de entrenamiento compuesto por corpus linguisticos de Techiaith (Lecsicon Cymraeg Bangor, Cofnod y Cynulliad EN-CY, Cardiff University TM EN-CY, Banc Trawsgrifiadau Bangor), el dataset conversacional BangorAI/alpaca-cy-1, y datasets auxiliares como MultiNLI y GSM8K. La publicacion en GGUF con multiples niveles de cuantizacion (desde IQ1_S de 2,6 GB hasta Q6_K de 6,8 GB) permite desplegar el modelo en hardware de consumo, algo poco habitual en modelos especializados en lenguas minoritarias.

El repositorio incluye cuantizaciones estaticas e imatrix, un archivo imatrix para generar cuantizaciones propias, y esta etiquetado como modelo de vision (con archivos mmproj disponibles en el repositorio estatico). La licencia es CC-BY-NC-4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, ajuste fino LoRA); detalles especificos no disponibles |
| Parametros totales | 8.134.102.314 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | gales (cy) e ingles (en) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es un ajuste fino mediante LoRA sobre un modelo de la familia Gemma 4, segun las etiquetas del repositorio. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los datasets declarados incluyen corpus linguisticos galeses de Techiaith (Lecsicon Cymraeg Bangor, Cofnod y Cynulliad EN-CY, Cardiff University TM EN-CY, Banc Trawsgrifiadau Bangor), el dataset conversacional BangorAI/alpaca-cy-1, y datasets auxiliares como nyu-mll/multi_nli y openai/gsm8k. El ajuste LoRA sugiere una adaptacion eficiente sobre el modelo base para mejorar el rendimiento en gales sin reentrenar todos los parametros.

La distribucion i1-GGUF aplica cuantizacion ponderada con imatrix, una tecnica que utiliza una matriz de importancia calculada sobre datos de calibracion para preservar mejor la calidad en niveles de compresion agresivos. El repositorio incluye el archivo imatrix (0,1 GB) para que los usuarios puedan generar sus propias cuantizaciones. La etiqueta "gemma4" y la indicacion de que es un modelo de vision (con archivos mmproj en el repositorio estatico) sugieren capacidades multimodales, aunque no se detallan en la informacion disponible.

## Capacidades
- Generacion de texto conversacional en gales e ingles, orientada a dialogos multi-turno.
- Capacidades de razonamiento y matematicas basicas, inferidas del uso de GSM8K en el entrenamiento.
- Capacidades de inferencia de lenguaje natural, inferidas del uso de MultiNLI en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a gales e ingles.
- Posible capacidad de vision (el repositorio se describe como modelo de vision y remite a archivos mmproj en el repositorio estatico), aunque no se detalla su alcance.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso
- Atencion al cliente en gales: el modelo puede gestionar conversaciones multi-turno en cymraeg, adecuado para servicios publicos o empresas que operan en Gales y necesitan atender en la lengua local. Su tamano de aproximadamente 8.100 millones de parametros permite desplegarlo en infraestructura moderada.
- Traduccion y asistencia bilingue gales-ingles: entrenado con corpus de traduccion EN-CY de Techiaith y la Universidad de Cardiff, puede apoyar tareas de traduccion asistida o generacion de contenido bilingue en entornos editoriales y administrativos.
- Generacion de contenido en gales: redaccion de textos, resumenes y respuestas en cymraeg para medios, administraciones o proyectos educativos que necesitan contenido de calidad en una lengua con pocos recursos.
- Investigacion en PLN para lenguas minoritarias: como modelo de referencia cuantizado, sirve para experimentar con tecnicas de ajuste, evaluacion y despliegue en gales, con la ventaja de que las versiones IQ permiten ejecutar pruebas en GPUs de consumo.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (5,9 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM o incluso en CPU con llama.cpp, facilitando prototipos locales sin infraestructura cloud.
- Educacion y aprendizaje de gales: el modelo puede actuar como tutor conversacional o asistente de practica de idioma, generando ejercicios y respuestas en cymraeg.
- Procesamiento de documentos administrativos galeses: con corpus como Cofnod y Cynulliad EN-CY en el entrenamiento, puede asistir en la extraccion, resumen o clasificacion de actas y documentos oficiales bilingues.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3-7 GB segun la cuantizacion elegida (IQ2_XXS ~2,8 GB; Q4_K_M ~5,1 GB; Q6_K ~6,8 GB), mas overhead de contexto y runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas con contexto amplio; A100 o H100 para despliegues de produccion con mayor concurrencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 8 GB o mas para cuantizaciones Q4, y en GPUs de 6 GB con cuantizaciones IQ3 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-i1-GGUF | 8.134.102.314 | no disponible | cy, en | cc-by-nc-4.0 | GGUF |
| EryriLabs-cymraeg-4B (base) | 8.134.102.314 | no disponible | cy, en | cc-by-nc-4.0 | safetensors |
| Gemma 4 (modelo base de referencia) | no disponible | no disponible | multilingue | licencia Gemma | safetensors |
| Modelos especializados en gales de otros autores | no disponible | no disponible | cy, en | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa; esto limita su adopcion en productos o servicios de pago.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion incorrecta, especialmente en temas especializados o fuera de los dominios cubiertos por sus datos de entrenamiento.
- Sesgos conocidos: no se documentan sesgos especificos, pero los corpus de entrenamiento (actas parlamentarias, transcripciones, traducciones) pueden introducir sesgos de dominio y estilo.
- Limitaciones de idioma: el soporte se limita a gales e ingles; el rendimiento en otras lenguas no esta garantizado.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que dificulta planificar casos de uso con documentos largos.
- Capacidades multimodales inciertas: aunque se menciona que es un modelo de vision, no se detalla el alcance ni la calidad de dichas capacidades.
- Cuantizaciones muy agresivas (IQ1, IQ2) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Falta de benchmarks publicados: no hay datos objetivos de rendimiento que permitan comparar con alternativas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-i1-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#EryriLabs-cymraeg-4B-i1-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2
