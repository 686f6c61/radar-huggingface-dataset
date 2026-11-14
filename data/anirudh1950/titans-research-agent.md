# Anirudh1950/TITANS-Research-Agent

## Resumen

TITANS-Research-Agent es un repositorio de Hugging Face asociado a un agente de investigación multi-fuente, no a un modelo de lenguaje con pesos publicados. El repositorio, creado por el usuario Anirudh1950, tiene un tamaño de 0,0 GB y cero descargas, lo que indica que no contiene artefactos de modelo (safetensors, GGUF ni checkpoints). La model card describe una aplicación Python que orquesta scraping paralelo de Reddit, Twitter, Medium, Google y Perplexity, filtra contenido con un re-ranker basado en Sentence-Transformers (BERT), almacena conocimiento en ChromaDB y genera informes en Markdown.

El proyecto se presenta como un agente con memoria a largo plazo y pipeline RAG, apoyado en APIs externas (Perplexity para expansión de consultas y síntesis) y en un modelo BERT de terceros para el filtrado de calidad. No se declara ninguna arquitectura de red neuronal propia, ni número de parámetros, ni longitud de contexto, ni licencia del modelo (la insignia MIT del README corresponde al código, no a pesos).

Por tanto, esta ficha documenta un artefacto de tipo agente/aplicación y no un modelo fundacional. Todos los campos relativos a arquitectura, parámetros, contexto, cuantización, idiomas y benchmarks se marcan como no disponibles, ya que no figuran en la información proporcionada. Es relevante ahora como ejemplo de orquestación RAG con memoria persistente, pero no debe evaluarse como un LLM desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos; el pipeline usa BERT de terceros para re-ranking y APIs LLM externas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el README muestra insignia MIT, pero no se especifica licencia de pesos ni del repositorio) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño 0,0 GB) |

## Arquitectura y entrenamiento

No se publica ninguna arquitectura de modelo entrenado. El README describe un pipeline de agente compuesto por siete etapas: comprobación de memoria en ChromaDB, priming de conocimiento, expansión semántica de consultas mediante Perplexity, scraping paralelo de cinco fuentes, filtrado de calidad con un re-ranker BERT (Sentence-Transformers, umbral 0,75), análisis de sentimiento y memorización en el vector store, culminando en la generación de un informe maestro en Markdown. La orquestación se implementa en Python (3.8+) con módulos separados para scrapers, memoria, ranking, generación de consultas, sentimiento, síntesis, extracción y formateo.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF/DPO ni innovaciones de decodificación. El término "TITANS" en el nombre no se corresponde con la arquitectura TITANS (aprendizaje de memoria neuronal a largo plazo) descrita en literatura; aquí se usa como nombre de producto del agente. Cualquier afirmación sobre técnicas de memoria neuronal, atención lineal o decodificación especulativa sería especulativa y no está respaldada por la model card.

## Capacidades

- Investigación multi-fuente: recolección paralela de contenido desde Reddit, Twitter/X, Medium, Google y Perplexity.
- Memoria a largo plazo: persistencia de conocimiento en ChromaDB y comprobación previa de temas ya investigados.
- Expansión semántica de consultas: generación de tres consultas relacionadas mediante un LLM externo (Perplexity).
- Filtrado de calidad: re-ranking semántico con Sentence-Transformers y descarte de contenido por debajo de un umbral de 0,75.
- Análisis de sentimiento: puntuación automática del contenido recolectado.
- Síntesis de informes: generación de un informe maestro en Markdown con análisis estilo debate.
- Modo turbo: scraping concurrente para acelerar la recolección.
- Gestión tolerante a fallos: omite fuentes cuyas claves de API no estén configuradas.
- No se documentan capacidades de tool calling nativo, agentes multi-paso autónomos, visión, audio ni modo thinking.

## Casos de uso

- Investigación de mercado previa a un producto: el agente lanza consultas expandidas sobre un tema, recolecta opiniones en Reddit y Twitter, filtra ruido con el re-ranker BERT y entrega un informe Markdown con sentimiento agregado, útil para validar hipótesis rápidamente.
- Monitorización de reputación de marca: ejecuciones periódicas sobre el nombre de la empresa almacenan hallazgos en ChromaDB, permitiendo comparar el sentimiento entre semanas y detectar cambios en la conversación pública.
- Revisión bibliográfica ligera: combinando resultados de Google y Medium con el filtrado semántico, se obtiene un resumen inicial de fuentes divulgativas antes de abordar bases académicas.
- Generación de dossiers internos para equipos de contenido: el pipeline produce ficheros separados por fuente (`perplexity.md`, `reddit.md`, `medium.md`, `googlesearch.md`) más un `MASTER_REPORT.md`, lo que facilita la revisión editorial por secciones.
- Base de conocimiento acumulativa: al memorizar cada investigación en ChromaDB, el agente reutiliza conocimiento en consultas futuras y evita repetir scraping, adecuado para equipos que investigan temas recurrentes.
- Prototipado de agentes RAG: el código modular (scrapers, ranker, memoria, sintetizador) sirve como plantilla para construir pipelines RAG personalizados con otras fuentes o modelos.
- Automatización de informes semanales: invocado por cron o CI, genera informes fechados en `output/` sin intervención manual, útil para newsletters o resúmenes ejecutivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos de modelo. La carga computacional local se limita al re-ranker Sentence-Transformers y a ChromaDB.
- GPU recomendadas: no disponibles. Un re-ranker BERT de tamaño base puede ejecutarse en CPU o en GPU consumer modesta (por ejemplo, RTX 3060), pero no se documenta ningún requisito oficial.
- Cabe en GPU consumer: probablemente sí para el componente de re-ranking, aunque no está confirmado en la documentación.
- Opciones de despliegue: ejecución directa como script Python (`python -m agent.main "tema"`); no se mencionan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos que servir.
- Latencia y throughput: no disponibles; dependen de las APIs externas (Perplexity, Reddit, Twitter) y de la concurrencia del scraping.
- Requisitos adicionales: Python 3.8+, claves de API (`PERPLEXITY_API_KEY` obligatoria; Reddit y Twitter opcionales) y almacenamiento persistente para `chroma_db/` y `output/`.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, ya que este artefacto es un agente de orquestación y no un modelo fundacional. Como referencia conceptual, podría situarse frente a frameworks de agentes RAG (por ejemplo, LangChain o LlamaIndex), pero no se dispone de datos de rendimiento ni de especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No contiene pesos de modelo: el repositorio tiene 0,0 GB y cero descargas; no es un LLM desplegable.
- Dependencia crítica de APIs externas: sin `PERPLEXITY_API_KEY` el pipeline pierde la expansión de consultas y la síntesis; sin claves de Reddit/Twitter se pierden fuentes completas.
- Riesgo de alucinación: la síntesis final la realiza un LLM externo (Perplexity) sobre contenido scrapeado; no se documenta verificación factual ni citación de fuentes en el informe maestro.
- Sesgos de fuente: Reddit, Twitter y Medium sobrerrepresentan determinados perfiles demográficos y de idioma (principalmente inglés), lo que puede sesgar conclusiones.
- Limitaciones de idioma: no se declaran idiomas soportados; los scrapers y el re-ranker BERT están orientados presumiblemente a contenido en inglés.
- Licencia ambigua: la insignia MIT del README no aclara la licencia del repositorio ni de los componentes de terceros (Sentence-Transformers, ChromaDB, APIs); verificar antes de uso comercial.
- Cumplimiento legal: el scraping de Reddit, Twitter y Google debe respetar los términos de servicio y la normativa aplicable (por ejemplo, derechos de autor y protección de datos).
- Madurez: cero descargas y cero likes, creado y actualizado en la misma fecha (2026-11-14), sin señales de mantenimiento ni pruebas publicadas.
- Costes operativos: el uso de Perplexity y otras APIs conlleva coste por llamada, no cuantificado en la documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anirudh1950/TITANS-Research-Agent
- Project page (Space): https://huggingface.co/spaces/Anirudh1950/TITANS-Research-Agent
- Repositorio GitHub: no disponible (el README indica `https://github.com/yourusername/scr-agent.git`, plantilla sin URL real)
- Paper: no disponible
- Blog o demo adicional: no disponible
