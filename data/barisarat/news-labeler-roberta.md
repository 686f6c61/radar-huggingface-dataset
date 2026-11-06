# barisarat/news-labeler-roberta

## Resumen

News labeler (RoBERTa student, v1) es un modelo de clasificación de texto desarrollado por el usuario barisarat, diseñado para etiquetar titulares de noticias financieras según su relevancia para los mercados. Se trata de un encoder `roberta-base` con cuatro cabezas de clasificación independientes, destilado a partir de 28.298 titulares etiquetados por un LLM profesor (Claude). El modelo resuelve el problema de filtrar y categorizar en una sola pasada un flujo continuo de noticias (concretamente el feed GDELT), algo que resulta relevante para sistemas de alertas de trading, monitorización de riesgos y análisis de sentimiento de mercado en tiempo real.

La arquitectura es un transformer encoder de tipo RoBERTa en su variante base, con una ventana de entrada limitada a 128 tokens. El modelo es multitarea: una compuerta de relevancia (probabilidad de que la noticia sea relevante para mercados), una clasificación multietiqueta de 12 dominios temáticos, una clasificación de impacto (bajo, medio, alto) y una clasificación de región geográfica (11 categorías). Su licencia MIT y su diseño para ejecución en CPU lo hacen adecuado para despliegues ligeros y de bajo coste.

El modelo es relevante por su enfoque de destilación de etiquetas generadas por LLM hacia un encoder pequeño y desplegable en CPU, lo que abarata drásticamente la inferencia frente a usar directamente el modelo profesor. No obstante, sus métricas miden acuerdo con el profesor, no con etiquetas humanas, y su distribución de entrenamiento está acotada a cinco ventanas temporales de mercado y 184 fuentes concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cuatro cabezas de clasificación |
| Parametros totales | no disponible (el repo pesa 0,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`model.pt`), no es un checkpoint de `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base` como encoder y añade cuatro cabezas: una compuerta binaria de relevancia, una cabeza multietiqueta de 12 dominios, una cabeza de tres clases para impacto y una cabeza de 11 clases para región. La entrada se construye como `"source: title"` y se trunca a 128 tokens. Los pesos se guardan como `state_dict` de una clase `MultiTask` definida en el repositorio del autor, y solo cargan junto con el fichero `label_space.json`, que contiene los vocabularios, los umbrales por dominio, el umbral de la compuerta (0,86) y las métricas de validación.

El entrenamiento se basa en destilación desde un LLM profesor (Claude): 28.298 titulares etiquetados por el profesor, extraídos de cinco ventanas temporales que cubren distintos regímenes de mercado (crisis, calma, alta carga geopolítica, una semana con catalizador cripto y una semana de acuerdos inmobiliarios). La distribución de etiquetas de relevancia es de 5.341 relevantes, 2.904 limítrofes y 20.053 no relevantes. No se especifica en la información disponible el número de épocas, la tasa de aprendizaje ni si se aplicó algún tipo de regularización adicional.

## Capacidades

- Clasificación de relevancia para mercados: devuelve una probabilidad de que un titular sea relevante para los mercados financieros.
- Clasificación multietiqueta de dominios: 12 categorías (geopolitics_conflict, tech_semis, equities_earnings, trade_supply, macro_growth, energy, banking_credit, monetary_rates, commodities_metals, crypto, housing_realestate, other).
- Clasificación de impacto: tres niveles (low, medium, high).
- Clasificación de región geográfica: 11 categorías (US, Europe, Europe_UK, China, Japan_Korea, EM_Asia, Gulf_MENA, LatAm, Russia_Ukraine, Global, other).
- Procesamiento en una sola pasada de los cuatro etiquetados simultáneamente.
- Ejecución en CPU, pensada para etiquetar un flujo de noticias en vivo (GDELT).
- Entrada limitada a `"source: title"` con un máximo de 128 tokens.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni modo de pensamiento.
- Multilingüe: no, solo inglés.

## Casos de uso

- Filtrado de flujos de noticias en tiempo real: el modelo puede procesar el feed GDELT en CPU y descartar titulares no relevantes para mercados mediante la compuerta de relevancia, reduciendo el volumen que llega a sistemas posteriores de análisis o alertas.
- Generación de alertas de trading: combinando la compuerta de relevancia con la etiqueta de impacto, se pueden priorizar titulares de impacto alto en dominios como energy o monetary_rates para disparar avisos a mesas de operaciones.
- Monitorización de riesgo geopolítico: la etiqueta de región junto con el dominio geopolitics_conflict permite agregar noticias por área geográfica y detectar concentraciones de eventos en regiones concretas (por ejemplo, Gulf_MENA o Russia_Ukraine).
- Enrutamiento de noticias a analistas: la clasificación por dominio permite dirigir automáticamente cada titular al equipo o analista especializado (tech_semis, banking_credit, commodities_metals, etc.) sin intervención manual.
- Análisis retrospectivo de regímenes de mercado: al estar entrenado con ventanas de crisis, calma y alta carga geopolítica, el modelo puede usarse para etiquetar corpus históricos de titulares y estudiar la composición temática por periodo.
- Enriquecimiento de datasets para investigación: las etiquetas de dominio, impacto y región permiten construir datasets etiquetados de noticias financieras a bajo coste, útiles para entrenar o evaluar otros modelos.
- Preprocesado en pipelines de NLP financiero: como paso previo a modelos de sentimiento o de extracción de eventos, el etiquetador reduce el ruido y aporta metadatos estructurados por titular.

## Benchmarks y rendimiento

Resultados publicados por el autor frente al profesor (LLM) en un split de validación retenido del 15 % (`seed=42`), con umbral de compuerta 0,86:

| Cabeza | Métrica | Resultado |
|---|---|---|
| Compuerta de relevancia | F1 / precisión / recall | 0,83 / 0,80 / 0,86 |
| Dominios | macro F1 | 0,80 |
| Impacto | macro F1 | 0,66 |
| Región | accuracy | 0,76 |

No se han publicado resultados frente a etiquetas humanas ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,5 GB y el modelo está pensado para ejecutarse en CPU.
- GPU recomendadas: no se especifican; al ser un `roberta-base` con cuatro cabezas, cualquier GPU consumer moderna es sobradamente suficiente.
- Cabe en GPU consumer: sí, con amplio margen (el tamaño del repo es de 0,5 GB).
- Opciones de despliegue: el modelo no es un checkpoint de `transformers`, por lo que no se puede cargar directamente con vLLM, TGI, llama.cpp u Ollama. Requiere la clase `StudentLabeler` del repositorio del autor (`pipeline/student.py`) y los ficheros `model.pt` y `label_space.json`.
- Latencia y throughput: no disponibles; el autor indica que etiqueta un flujo de noticias en vivo en CPU, pero no publica cifras.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo se basa en `FacebookAI/roberta-base`, un encoder de ~125 M de parámetros con contexto de 512 tokens, licencia MIT y disponible en Hugging Face; sin embargo, no se han publicado métricas comparativas entre este etiquetador y otras alternativas de clasificación de noticias financieras.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| barisarat/news-labeler-roberta | no disponible (repo 0,5 GB) | 128 tokens | Clasificación multitarea de titulares financieros | MIT | Hugging Face (pesos no estándar) |
| FacebookAI/roberta-base | ~125 M | 512 tokens | Modelo base de lenguaje | MIT | Hugging Face |
| Alternativas de clasificación financiera | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas publicadas miden acuerdo con el LLM profesor, no con etiquetas humanas; el rendimiento real frente a anotación humana puede diferir.
- El modelo se entrenó con titulares de 184 fuentes en cinco ventanas de régimen de mercado; otras fuentes, estilos o periodos quedan fuera de distribución.
- La entrada está limitada a `"source: title"` y a 128 tokens, por lo que no procesa el cuerpo de la noticia ni titulares largos.
- Solo soporta inglés.
- Riesgo de sesgo derivado de la selección de fuentes y ventanas temporales del dataset de entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de etiquetado erróneo en titulares ambiguos o limítrofes.
- Los pesos no son un checkpoint estándar de `transformers`: requieren la clase `MultiTask`/`StudentLabeler` del repositorio del autor y el fichero `label_space.json`; sin él, los pesos no cargan.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos originales (GDELT y titulares de terceros) si se redistribuyen datos etiquetados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barisarat/news-labeler-roberta
- Repositorio del pipeline: https://github.com/barisarat/llm-labeled-news-pipeline
- Clase del estudiante: https://github.com/barisarat/llm-labeled-news-pipeline/blob/main/pipeline/student.py
- Notebook de entrenamiento: https://github.com/barisarat/llm-labeled-news-pipeline/blob/main/ml/training/train_student.ipynb
- Datos de entrenamiento: https://github.com/barisarat/llm-labeled-news-pipeline/blob/main/ml/data/training_data.jsonl
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
