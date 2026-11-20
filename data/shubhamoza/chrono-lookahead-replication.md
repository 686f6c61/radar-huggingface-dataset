# ShubhamOza/chrono-lookahead-replication

## Resumen

`chrono-lookahead-replication` no es un modelo de lenguaje en sentido estricto, sino un repositorio de replicación científica publicado por ShubhamOza en Hugging Face. Contiene el código, los datos procesados y el cuaderno de Jupyter necesarios para reproducir el trabajo de He, Lv, Manela y Wu (2025), "Chronologically Consistent Large Language Models" (SSRN 5159615, arXiv 2502.21206), que estudia el sesgo de anticipación (*look-ahead bias*) en estrategias de trading basadas en noticias y modelos de lenguaje.

El repositorio reconstruye el pipeline original con datos gratuitos (FNSPID reducido y factores de Ken French) y añade una prueba directa del sesgo: puntúa las mismas noticias con una versión cronológica del modelo (entrenada solo con texto hasta una fecha) y con una versión que ha visto el futuro, midiendo la diferencia. Emplea los modelos `manelalab/chrono-bert-v1-YYYY1231`, `ProsusAI/finbert` y `bert-base-uncased` como motores de embedding, no un modelo propio.

Es relevante para investigadores en finanzas cuantitativas y NLP financiero porque pone a disposición pública un experimento reproducible sobre una cuestión metodológica crítica: hasta qué punto los resultados de las estrategias basadas en LLM dependen de información futura filtrada en los datos de entrenamiento. El repositorio no incluye pesos de modelo, sino código y artefactos de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de replicación); usa BERT-base y ChronoBERT como extractores de embeddings |
| Parametros totales | No disponible (depende de los modelos empleados: BERT-base, ~110 M) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (limitada por BERT-base, 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (noticias financieras en `en`) |
| Licencia | MIT |
| Formato de pesos | No aplica (el repositorio contiene código Python, cuaderno Jupyter y datos procesados; no distribuye pesos) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio. Su pipeline se apoya en tres extractores de representaciones: `manelalab/chrono-bert-v1-YYYY1231` (una serie de modelos BERT anuales entrenados solo con texto hasta el 31 de diciembre de cada año, según el paper original), `ProsusAI/finbert` (BERT afinado para análisis de sentimiento financiero) y `bert-base-uncased` como referencia genérica. Sobre los embeddings de titulares de noticias se ajustan regresiones ridge mensuales para predecir rendimientos y se construyen carteras long-short.

El repositorio incluye módulos para descargar noticias y precios de FNSPID, alinear noticias con días de negociación, generar embeddings, ejecutar backtests con costes de transacción y tests de Sharpe, y una sonda de memorización de tipo *fill-in-the-blank*. La innovación metodológica es la comparación directa entre una "vintage" cronológica y una que ha visto el futuro, cuantificando la brecha de rendimiento atribuible al sesgo de anticipación.

## Capacidades

- Replicación completa del pipeline del paper de He et al. (2025) sobre datos gratuitos.
- Descarga y alineamiento de noticias financieras (FNSPID) con precios diarios.
- Generación de embeddings de titulares con múltiples modelos BERT.
- Backtesting de carteras long-short mensuales con regresiones ridge.
- Cálculo de tests de Sharpe, costes de transacción y alfas frente a factores de Fama-French y momentum.
- Sonda de memorización (*fill-in-the-blank*) para medir conocimiento filtrado.
- Comparación explícita entre modelos con y sin información futura.
- Cuaderno reproducible con todos los números calculados a partir de los datos.
- No soporta tool calling, agentes ni generación de texto libre; es un artefacto de investigación.

## Casos de uso

- Replicación académica del paper de He et al. (2025): el repositorio permite reproducir sus resultados principales con datos gratuitos, útil para revisores o estudiantes que quieran verificar las conclusiones sin acceso a datos propietarios.
- Auditoría de sesgo de anticipación en estrategias basadas en NLP: permite medir cuánto del rendimiento de una estrategia de noticias proviene de información futura filtrada en el modelo, usando la comparación entre vintages cronológicas y no cronológicas.
- Docencia en NLP financiero: el cuaderno sirve como material didáctico para un curso de posgrado, con un pipeline completo desde la descarga de datos hasta los tests estadísticos.
- Evaluación de modelos de embeddings financieros: permite comparar FinBERT, BERT-base y ChronoBERT en una tarea concreta de predicción de rendimientos a partir de titulares.
- Desarrollo de metodologías de backtesting rigurosas: los módulos de costes, factores y tests de Sharpe pueden reutilizarse en otros proyectos de investigación cuantitativa.
- Estudio de memorización en modelos de lenguaje: la sonda de fill-in-the-blank permite cuantificar cuánto conocimiento factual futuro retienen los modelos, relevante para auditar modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye resultados de backtest (Sharpe, alfas) que se calculan al ejecutar el cuaderno, pero no se proporcionan cifras en la información disponible.

## Requisitos de hardware

- El repositorio no requiere GPU para ejecutarse; el autor indica que la generación de embeddings "tarda mucho en una CPU", por lo que se recomienda GPU para el paso `src/embed.py`.
- VRAM estimada: no disponible. Depende de los modelos BERT empleados (~110 M de parámetros); una GPU consumer con 8-12 GB es suficiente para inferencia en FP32 o FP16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4090, A100) para acelerar la extracción de embeddings; CPU viable pero lenta.
- Despliegue: no aplica (no es un servicio de inferencia); se ejecuta como scripts Python y cuaderno Jupyter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con otros modelos de lenguaje; es un artefacto de replicación. Como referencia, los modelos que utiliza son:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `manelalab/chrono-bert-v1-YYYY1231` | ~110 M (BERT-base) | 512 tokens | No disponible en la información | Hugging Face |
| `ProsusAI/finbert` | ~110 M (BERT-base) | 512 tokens | No disponible en la información | Hugging Face |
| `bert-base-uncased` | ~110 M | 512 tokens | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes. Es un repositorio de código y datos.
- Los resultados dependen de la calidad y cobertura de FNSPID reducido, que puede no representar el universo completo de noticias financieras.
- La serie ChronoBERT cubre años concretos; fuera de ese rango la comparación cronológica no es posible.
- El sesgo de anticipación medido puede no generalizar a otros dominios o a modelos comerciales de mayor tamaño.
- Licencia MIT: permite uso comercial del código, pero los datos de terceros (FNSPID, factores de Ken French) tienen sus propias condiciones que deben respetarse.
- El autor declara uso de Claude (Anthropic) para búsqueda, escritura y depuración del código; los números se verificaron contra las salidas, pero conviene auditar el cuaderno antes de reutilizarlo en producción.
- No hay pesos publicados ni demo; la reproducibilidad exige ejecutar el pipeline completo, lo que puede tardar horas en CPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShubhamOza/chrono-lookahead-replication
- Paper original (SSRN): https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5159615
- Paper original (arXiv): https://arxiv.org/abs/2502.21206
- Modelo ChronoBERT: https://huggingface.co/manelalab/chrono-bert-v1-20241231
- FinBERT: https://huggingface.co/ProsusAI/finbert
- BERT-base: https://huggingface.co/bert-base-uncased
- Dataset FNSPID reducido: https://huggingface.co/datasets/simon-mellergaard/FNSPID_reduced
- Factores de Ken French: https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
