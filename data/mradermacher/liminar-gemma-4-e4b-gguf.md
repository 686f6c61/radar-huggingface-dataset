# mradermacher/Liminar-Gemma-4-E4B-GGUF

## Resumen

Liminar-Gemma-4-E4B es un modelo de lenguaje especializado en normativa universitaria argentina, desarrollado originalmente por el equipo LICDIA de la Universidad Nacional de Luján (UNLu) y publicado en Hugging Face bajo el identificador `LICDIA-UNLu/Liminar-Gemma-4-E4B`. La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo se presenta como un ajuste fino (fine-tune) sobre una base de la familia Gemma 4, con un total de 7.463.013.674 parámetros según los pesos en safetensors del modelo base.

El modelo está orientado a un dominio muy concreto: el corpus normativo y regulatorio de las universidades argentinas, con etiquetas explícitas como `liminar`, `argentina`, `universidades` y `normativa`. Su idioma declarado es exclusivamente el español (`es`), lo que lo convierte en una herramienta vertical para consultas, resúmenes y razonamiento sobre legislación y reglamentación universitaria en Argentina. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, si bien conviene revisar las condiciones de la base original.

La relevancia de esta ficha radica en que documenta una cuantización GGUF de un modelo de nicho con muy poca tracción pública (0 descargas y 0 likes en el momento de la consulta), lo que exige ser especialmente cuidadoso con las expectativas: no hay benchmarks publicados, no hay información detallada sobre el entrenamiento y la model card del cuantizador es puramente mecánica. El valor práctico está en la posibilidad de ejecutar el modelo en hardware de consumo con cuantizaciones de 4 a 6 bits, manteniendo el foco en el dominio jurídico-universitario argentino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Liminar-Gemma-4-E4B; la nomenclatura "E4B" sugiere una variante eficiente de la familia Gemma, sin confirmar) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `LICDIA-UNLu/Liminar-Gemma-4-E4B`. El nombre sugiere que se trata de un ajuste fino sobre una variante de la familia Gemma 4 con denominacion "E4B", pero no se confirma si se trata de un transformer denso, un modelo con mezcla de expertos (MoE) o una variante eficiente con parametros activos reducidos. El recuento de parametros totales (7.463.013.674) corresponde a los pesos en safetensors del modelo base, no a la cuantizacion GGUF.

Respecto al entrenamiento, la model card del cuantizador no aporta informacion sobre el corpus utilizado, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Las etiquetas `liminar`, `argentina`, `universidades` y `normativa` indican que el ajuste fino se realizo sobre documentacion normativa universitaria argentina, pero se desconoce el volumen y la calidad de dichos datos. Tampoco hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La cuantizacion de mradermacher es estatica (no se han publicado versiones con imatrix ni ponderadas), lo que puede suponer una ligera perdida de calidad frente a cuantizaciones con calibracion por importancia.

## Capacidades

- Generacion de texto en español, con foco en el dominio normativo y regulatorio de universidades argentinas.
- Consultas y razonamiento sobre legislacion, estatutos, reglamentos y resoluciones del ambito universitario argentino.
- Resumen y sintesis de documentacion normativa extensa (siempre que la longitud de contexto del modelo base lo permita, dato no confirmado).
- Soporte multimodal potencial: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base podria aceptar entradas de imagen ademas de texto, aunque no se detalla el alcance de dicha capacidad.
- Conversacion multi-turno: la etiqueta `conversational` sugiere un formato de chat, aunque no se especifica la plantilla exacta.
- No se confirma soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidad multilingue limitada: el unico idioma declarado es el español.

## Casos de uso

- Consulta de normativa universitaria: un estudiante o gestor puede preguntar por requisitos de inscripcion, regimen de cursada o condiciones de graduacion, y el modelo responde citando o parafraseando la reglamentacion aprendida durante el ajuste fino.
- Asistencia a secretarias academicas: el modelo puede redactar borradores de respuestas a consultas frecuentes sobre equivalencias, reconocimiento de creditos o solicitudes administrativas, reduciendo el tiempo de tramitacion.
- Resumen de resoluciones y expedientes: dado un texto normativo extenso, el modelo puede generar sintesis estructuradas para circulacion interna en rectorados y decanatos.
- Soporte a la docencia: generacion de material explicativo sobre el reglamento de la universidad, orientado a estudiantes de nuevo ingreso.
- Verificacion de compatibilidad normativa: el modelo puede ayudar a detectar posibles contradicciones entre borradores de reglamentos y la normativa superior ya vigente, como apoyo a la revision humana.
- Chatbot institucional en espanol: despliegue en la web de una universidad para responder preguntas frecuentes, con la ventaja de que el modelo esta especializado en el dominio y puede ejecutarse en hardware modesto gracias a las cuantizaciones Q4_K_M (5,4 GB) o Q5_K_M (5,8 GB).
- Analisis de documentacion historica: procesamiento de archivos y actas antiguas para extraer referencias normativas y facilitar su consulta posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y no se ha localizado informacion de rendimiento del modelo base en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB con Q4_K_M, 5,8 GB con Q5_K_M, 6,3 GB con Q6_K y 8,1 GB con Q8_0; la version f16 requiere unos 15 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para Q4_K_M o Q5_K_M (RTX 3060 Ti, RTX 4060, RTX 4070); para Q8_0 se recomienda 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); para f16, 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas de gama media y alta con cuantizaciones de 4 a 6 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. Tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de aproximadamente 7,5 mil millones de parametros, se espera un throughput moderado en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Gemma-4-E4B (esta ficha) | 7.463.013.674 | no disponible | Apache 2.0 | Normativa universitaria argentina, español | GGUF estatico en HF |
| Gemma 2 9B (Google) | 9.000 millones aprox. | 8.192 tokens | Gemma License | Proposito general, multilingue | Safetensors y GGUF de terceros |
| Llama 3.1 8B (Meta) | 8.000 millones aprox. | 128.000 tokens | Llama 3.1 Community License | Proposito general, multilingue | Safetensors y GGUF oficiales |
| Qwen2.5 7B (Alibaba) | 7.600 millones aprox. | 128.000 tokens | Apache 2.0 | Proposito general, multilingue | Safetensors y GGUF oficiales |

La comparativa con modelos de proposito general debe interpretarse con cautela: Liminar-Gemma-4-E4B esta especializado en un dominio muy concreto y no se han publicado benchmarks que permitan comparar su rendimiento con el de los modelos citados. La ventaja competitiva del modelo es su especializacion normativa y su licencia permisiva; la desventaja es la falta de datos publicos sobre calidad, contexto y capacidades reales.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas de razonamiento, generacion o recuperacion normativa.
- Riesgo elevado de alucinacion: al ser un ajuste fino de dominio y sin datos de evaluacion, puede inventar articulos, resoluciones o fechas con apariencia plausible.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide planificar su uso en documentos extensos sin pruebas previas.
- Sesgo de dominio: el modelo esta entrenado exclusivamente sobre normativa universitaria argentina, por lo que su utilidad fuera de ese ambito es limitada.
- Idioma restringido al español: no se garantiza un rendimiento aceptable en otros idiomas, incluidos el portugues o el ingles.
- Traccion publica nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.
- Cuantizacion estatica sin imatrix: puede degradar la calidad respecto a cuantizaciones calibradas, especialmente en Q2_K y Q3_K_S.
- Licencia Apache 2.0 del cuantizador, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de un uso comercial en produccion.
- No se confirma soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.
- Fecha de creacion futura (2026-11-19) en los metadatos de Hugging Face, un dato anomalo que conviene contrastar antes de citar el modelo en documentacion.

## Enlaces

- Repositorio del cuantizador: https://huggingface.co/mradermacher/Liminar-Gemma-4-E4B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-E4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Gemma-4-E4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
