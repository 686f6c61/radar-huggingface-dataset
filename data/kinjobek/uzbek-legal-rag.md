# kinjobek/uzbek-legal-rag

## Resumen

UzbekLegalRAG es un sistema de generación aumentada por recuperación (RAG) orientado a la legislación uzbeka, publicado por el usuario kinjobek en Hugging Face. No se trata de un modelo de lenguaje con pesos entrenados por el autor, sino de un pipeline completo de recuperación y respuesta: filtra el dominio legal del corpus `Digitaluz/uzbek-language-corpus` (5,6 millones de documentos y 6.060 millones de palabras, publicado por el Ministerio de Tecnologías Digitales de Uzbekistán), lo fragmenta, lo indexa con FAISS y genera respuestas con citas mediante un LLM externo (Gemini 2.5 Flash o Qwen2.5-7B-Instruct).

La relevancia del proyecto reside en su enfoque práctico: cubre un idioma de bajos recursos como el uzbeko en un dominio especializado (legislación) y está diseñado para ejecutarse en la capa gratuita de Google Colab, con un tiempo de indexación estimado de 15 a 25 minutos sobre GPU T4 para una muestra de 60.000 documentos legales. El repositorio incluye el módulo `uzbek_rag.py`, cuadernos de Colab, scripts de verificación de calidad del dataset y un informe de análisis (`REPORT.md`).

El componente de embeddings es `intfloat/multilingual-e5-base` (arquitectura XLM-R, 100 idiomas, con cobertura del uzbeko), mientras que la generación se delega a APIs externas. La licencia del repositorio es MIT, aunque el corpus subyacente se distribuye bajo ODC-BY.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RAG: chunking + embeddings XLM-R (`intfloat/multilingual-e5-base`) + índice FAISS `IndexFlatIP` + LLM generativo externo |
| Parametros totales | No disponible (no es un modelo con pesos propios; el embedding base tiene ~278M parámetros, dato no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del LLM generador: Gemini 2.5 Flash o Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el pipeline no especifica cuantización; el embedding se ejecuta en FP32/FP16 según hardware) |
| Idiomas soportados | Uzbeko (uz) e inglés (en); el embedding cubre 100 idiomas |
| Licencia | MIT (repositorio); corpus subyacente ODC-BY |
| Formato de pesos | No aplica como modelo único; artefactos: índice FAISS (`uzbek_legal.faiss`) y `chunks.pkl`; pesos del embedding en safetensors vía transformers |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio. La arquitectura es un pipeline RAG en seis etapas: (1) descarga de 8 de los 136 ficheros Parquet del corpus (aproximadamente 1 GB), con validación de tamaño y footer Parquet y hasta 3 reintentos; (2) filtrado del dominio `domain == "Law"`, reduciendo de 150.000-250.000 documentos a 60.000 mediante muestreo estratificado por fuente y escritura; (3) fragmentación en bloques de aproximadamente 400 palabras con solapamiento de 60 palabras, respetando límites de párrafo y oración; (4) embeddings con `intfloat/multilingual-e5-base` aplicando mean-pooling y normalización L2; (5) indexación con FAISS `IndexFlatIP`, que equivale a similitud coseno sobre vectores normalizados; y (6) recuperación de los 6 fragmentos más relevantes y generación de la respuesta con un prompt de sistema en uzbeko que exige citas.

No se describe entrenamiento supervisado, RLHF ni DPO, ya que el autor no ajusta ningún modelo. La innovación técnica principal es la ingeniería de bajo coste: el pipeline completo cabe en la capa gratuita de Colab, con descarga verificada, chunking determinista y un índice plano que prioriza exhaustividad sobre escalabilidad. El propio autor señala que para escalar a los 1,6 millones de documentos legales del corpus completo sería necesario migrar a `IndexIVFFlat` o `IndexHNSW` y un tiempo de embedding de 4 a 6 horas en T4.

## Capacidades

- Recuperación de fragmentos legales relevantes sobre legislación uzbeka mediante búsqueda semántica con embeddings multilingües.
- Generación de respuestas con citas a los fragmentos recuperados, usando Gemini 2.5 Flash o Qwen2.5-7B-Instruct como generador.
- Funcionamiento en modo solo recuperación (sin clave de API), devolviendo únicamente los pasajes encontrados.
- Procesamiento de consultas en uzbeko e inglés gracias a la cobertura multilingüe del modelo de embeddings.
- Indexación persistente: el índice FAISS y los chunks se guardan en `/tmp` y pueden copiarse a Google Drive.
- Panel de 8 preguntas predefinidas más entrada interactiva por consola en el cuaderno de Colab.
- Verificación de calidad del corpus mediante `scripts/quality_check.py` y prueba local de humo con `scripts/local_smoke_test.py`.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Consulta de legislación laboral uzbeka: un abogado plantea una pregunta sobre derechos de vacaciones y el sistema recupera los artículos pertinentes del dominio Law y genera una respuesta citando cada fragmento, lo que permite verificar la fuente.
- Asistencia a ciudadanos en trámites administrativos: un usuario pregunta en uzbeko por los requisitos de registro de una empresa; el pipeline devuelve los pasajes normativos aplicables y una síntesis con referencias.
- Investigación jurídica comparada: un investigador filtra por términos en inglés y recupera fragmentos legales uzbekos gracias a la alineación multilingüe del embedding e5, útil para estudios sobre armonización normativa.
- Prototipado rápido en docencia: estudiantes de derecho o informática abren el cuaderno en Colab gratuito y disponen de un sistema RAG funcional en menos de 30 minutos sin infraestructura propia.
- Construcción de bases para un chatbot legal: el índice FAISS y `chunks.pkl` sirven como capa de recuperación reutilizable en una aplicación web posterior (el autor menciona una interfaz Streamlit como siguiente paso).
- Auditoría de calidad de corpus: el script `quality_check.py` permite validar duplicados, pureza lingüística y ruido del corpus legal, aplicable a la preparación de otros dominios.
- Evaluación de generadores: al permitir intercambiar Gemini 2.5 Flash por Qwen2.5-7B-Instruct vía `HF_TOKEN`, el pipeline sirve para comparar calidad de respuestas con citas entre un modelo propietario y uno abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el embedding `multilingual-e5-base` requiere aproximadamente 1-2 GB en FP16; el generador Qwen2.5-7B-Instruct requiere del orden de 14-16 GB en FP16 (estimación estándar, no confirmada en la información proporcionada). Con Gemini 2.5 Flash no se requiere VRAM local para la generación.
- GPU recomendadas: el autor indica que la capa gratuita de Colab con GPU T4 es suficiente para el pipeline completo. Para el corpus completo (1,6 millones de documentos) se necesitarían sesiones más largas o GPUs con más memoria.
- Cabe en GPU de consumo: sí, una T4 (16 GB) es suficiente para la configuración descrita; el embedding por sí solo cabe en GPUs de 4-8 GB.
- Opciones de despliegue: Google Colab (cuaderno incluido), ejecución local mediante `uzbek_rag.py` y los scripts de `scripts/`; el autor propone Streamlit como interfaz futura. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor estima 1-3 minutos de descarga, aproximadamente 1 minuto de chunking y 15-25 minutos de embedding en T4 para la muestra de 60.000 documentos.

## Comparativa con modelos similares

| Sistema | Tipo | Idioma principal | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UzbekLegalRAG (este) | Pipeline RAG sobre corpus legal | Uzbeko, inglés | 60.000 documentos indexados (muestra); corpus completo ~1,6M | MIT (repo), ODC-BY (corpus) | Hugging Face, Colab |
| Modelos LLM uzbekos nativos | Modelo generativo con pesos | Uzbeko | No disponible | No disponible | No disponible |
| RAG genérico con e5-base | Pipeline RAG sin dominio | 100 idiomas | Depende del corpus | MIT / Apache-2.0 según componente | Hugging Face |
| Qwen2.5-7B-Instruct | LLM generativo | Multilingüe | 32K tokens (dato estándar, no confirmado aquí) | Apache-2.0 (dato estándar) | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe evaluarse como LLM autónomo; su calidad depende del embedding, del índice y del generador externo.
- El índice por defecto cubre solo 8 de los 136 ficheros Parquet y una muestra de 60.000 documentos legales, no el corpus completo de aproximadamente 1,6 millones.
- La generación con Gemini 2.5 Flash requiere clave de API y envía los fragmentos recuperados a un servicio externo, con implicaciones de privacidad y coste (el autor indica que la clave es gratuita, pero el uso puede tener límites).
- Sin clave de API, el sistema solo devuelve pasajes recuperados sin respuesta sintetizada.
- Riesgo de alucinación en el generador: aunque el prompt exige citas, no se documenta ningún mecanismo de verificación automática de que la respuesta se ajuste a los fragmentos.
- Cobertura lingüística limitada al uzbeko y al inglés; otras lenguas dependen únicamente del embedding e5.
- El índice `IndexFlatIP` no escala bien a millones de vectores; el autor reconoce la necesidad de índices aproximados para el corpus completo.
- La licencia MIT del repositorio no cubre necesariamente el corpus subyacente, distribuido bajo ODC-BY, cuyas condiciones deben respetarse en uso comercial.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se han publicado evaluaciones de precisión de recuperación ni de fidelidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinjobek/uzbek-legal-rag
- Dataset del corpus: https://huggingface.co/datasets/Digitaluz/uzbek-language-corpus
- Modelo de embeddings: https://huggingface.co/intfloat/multilingual-e5-base
- Cuaderno de Colab: https://huggingface.co/kinjobek/uzbek-legal-rag/blob/main/notebooks/legal_rag_colab.ipynb
- Informe de calidad del dataset: https://huggingface.co/kinjobek/uzbek-legal-rag/blob/main/REPORT.md
- Clave de API de Gemini: https://aistudio.google.com/app/apikey
