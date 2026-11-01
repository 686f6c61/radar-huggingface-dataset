# mradermacher/MedEmb-8B-GGUF

## Resumen

MedEmb-8B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo MedEmb-8B, publicado por el cuantizador mradermacher a partir del modelo original MEDHEB/MedEmb-8B. El modelo base es un modelo médico multimodal orientado a tareas de recuperación (retrieval) y embeddings, con soporte para imágenes 2D y 3D en dominios como radiología y patología. El repositorio de mradermacher no modifica el modelo: únicamente lo convierte a distintos niveles de cuantización (desde Q2_K hasta f16) para facilitar su ejecución en hardware variado mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en la escasez de modelos abiertos multimodales especializados en imagenes médicas con soporte 3D; MedEmb-8B aborda ese nicho combinando capacidad de embedding/retrieval con entrada visual. El modelo base tiene 8.190.735.360 parámetros y el repositorio de cuantizaciones ocupa unos 75,3 GB en total. La licencia es "other" (mixed-source-licenses), por lo que conviene revisar el archivo LICENSE antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (multimodal, con suplemento mmproj para vision) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | en |
| Licencia | other (mixed-source-licenses) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la model card del modelo cuantizado ni en la informacion disponible del modelo base. Los tags del repositorio indican que se trata de un modelo multimodal (incluye archivos mmproj, el proyector multimodal usado por llama.cpp para procesar imagenes), orientado a embeddings y retrieval, con soporte para imagenes medicas 2D y 3D en radiologia y patologia. Al ser un modelo de 8B parametros con mmproj, es razonable asumir una base tipo transformer decoder de 8 mil millones de parametros con un encoder visual acoplado, pero el detalle concreto no esta disponible.

Tampoco se dispone de informacion sobre los datos de entrenamiento (numero de tokens, composicion del corpus), ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Para esos detalles debe consultarse la model card del modelo original MEDHEB/MedEmb-8B y su documentacion asociada.

## Capacidades

- Generacion de embeddings y retrieval: el modelo esta etiquetado como embedding/retrieval, util para busqueda semantica en colecciones de documentos e imagenes medicas.
- Comprension multimodal: procesa entradas visuales mediante el suplemento mmproj (disponible en Q8_0 y f16), orientado a imagenes medicas.
- Soporte 2D y 3D: los tags indican capacidad sobre imagenes medicas 2D y volumenes 3D (radiologia, patologia).
- Dominio medico: especializacion en radiologia y patologia segun los tags del repositorio.
- Uso conversacional: el repositorio incluye el tag "conversational", lo que sugiere soporte de dialogo.
- Ejecucion local: gracias al formato GGUF, puede ejecutarse con llama.cpp, Ollama y herramientas derivadas, incluida inferencia en CPU.

No hay informacion disponible sobre tool calling, capacidades de agente ni modo de razonamiento (thinking mode).

## Casos de uso

- Busqueda semantica en archivos medicos: dado su enfoque en embeddings y retrieval, puede indexar informes de radiologia o patologia y recuperar casos similares a partir de una consulta en lenguaje natural o de una imagen de referencia.
- Sistemas de decision clinica asistida (RAG medico): combinado con una base vectorial, permite recuperar evidencia relevante (casos previos, informes) para apoyar la lectura de estudios de imagen.
- Analisis de imagenes medicas en entornos sin GPU: las cuantizaciones Q4_K_M (5,1 GB) permiten ejecutar el modelo en estaciones de trabajo modestas, util en hospitales o laboratorios con infraestructura limitada.
- Investigacion en imagenes medicas 3D: el soporte de volumenes 3D (por ejemplo, TAC o RM) lo hace candidato para experimentos de recuperacion de casos tridimensionales en radiologia.
- Clasificacion y comparacion de casos en patologia: puede usarse para agrupar laminas o casos patologicos por similitud de embedding en flujos de trabajo de biobancos o estudios retrospectivos.
- Prototipado rapido de aplicaciones medicas multimodales: el formato GGUF y la compatibilidad con Ollama facilitan montar demos locales de consulta sobre imagenes medicas sin dependencias de nube, relevante por privacidad de datos de pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original incluye el tag "benchmark", pero no se aportan metricas concretas (MMLU, HumanEval, GSM8K u otras) ni en la model card del cuantizador ni en los datos proporcionados. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Q2_K ocupa 3,4 GB; Q4_K_M, 5,1 GB; Q6_K, 6,8 GB; Q8_0, 8,8 GB; f16, 16,5 GB. A esto hay que sumar el suplemento multimodal (mmproj-Q8_0: 0,9 GB; mmproj-f16: 1,3 GB) si se usa la parte visual, mas la memoria de contexto.
- GPUs recomendadas: cualquier GPU consumer con 6-8 GB o mas (por ejemplo, RTX 3060, RTX 4060 Ti o superiores) ejecuta comodo las cuantizaciones Q4_K_M o Q6_K. Para f16 conviene una GPU de 24 GB (RTX 3090/4090) o una A100.
- Consumer GPUs: si cabe. La cuantizacion Q4_K_S (4,9 GB) y Q4_K_M (5,1 GB) entran en GPUs de 6-8 GB; las cuantizaciones mas pequeñas (Q2_K, 3,4 GB) incluso en portatiles con GPU modesta o en CPU pura.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj. No hay informacion sobre soporte en vLLM o TGI para esta version cuantizada.
- Latencia y throughput: no disponible. Los archivos Q4_K_S y Q4_K_M estan marcados como "fast, recommended" por el cuantizador, lo que sugiere buen equilibrio velocidad/calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Dominio | Formato | Licencia |
|---|---|---|---|---|---|
| MedEmb-8B (este, via GGUF) | 8,19 B | Si (mmproj, 2D/3D medico) | Medico (radiologia, patologia), embeddings | GGUF | other (mixed-source-licenses) |
| MedGemma 4B/27B (Google) | 4B / 27B | Si (imagenes medicas) | Medico | safetensors, GGUF comunitario | Licencias propias de Google |
| BiMediX2 / modelos medicos generales 8B | ~8B | Segun version | Medico general | safetensors, GGUF comunitario | Variable |

Nota: la comparativa es orientativa; los datos de rendimiento comparado no estan disponibles en la informacion proporcionada. La ventaja diferencial de MedEmb-8B segun sus tags es el foco en embeddings/retrieval y en imagenes 3D, algo poco comun en modelos medicos abiertos de este tamano.

## Limitaciones y advertencias

- Licencia restrictiva o mixta: la licencia es "other" (mixed-source-licenses) y remite a un archivo LICENSE externo. Debe revisarse antes de cualquier despliegue, especialmente comercial; no se puede asumir permiso de uso comercial sin leerla.
- Idioma: el modelo esta etiquetado solo para ingles (en). No hay soporte declarado para castellano ni otros idiomas.
- Informacion tecnica incompleta: la model card del cuantizador no documenta contexto, arquitectura ni benchmarks; hay que acudir al repositorio base MEDHEB/MedEmb-8B para mas detalle.
- Cuantizaciones bajas: Q2_K y Q3_K_S/M/L degradan sensiblemente la calidad, especialmente critico en tareas medicas de precision; se recomiendan Q4_K_M o superiores.
- Riesgo clinico: como todo modelo orientado a salud, puede alucinar o producir salidas incorrectas; no debe usarse para diagnostico sin supervision profesional y validacion clinica rigurosa.
- Sin imatrix: el cuantizador indica que las cuantizaciones ponderadas (imatrix) no estan disponibles de momento, por lo que las cuantizaciones son estaticas.
- Datos de pacientes: cualquier uso con imagenes o informes medicos reales debe cumplir la normativa aplicable de proteccion de datos (RGPD en Espana).

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/MedEmb-8B-GGUF
- Modelo base: https://huggingface.co/MEDHEB/MedEmb-8B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MedEmb-8B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de codigo: no disponibles en la informacion proporcionada.
