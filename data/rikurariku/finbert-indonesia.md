# RikuraRiku/finbert-indonesia

## Resumen

FinBERT Indonesia es un modelo de clasificación de sentimiento financiero en bahasa indonesio, desarrollado por el usuario de Hugging Face RikuraRiku. Se trata de un fine-tuning de ProsusAI/finbert, un BERT base preentrenado sobre textos financieros en inglés, adaptado mediante un conjunto de datos propio de aproximadamente 500 titulares de noticias financieras indonesias etiquetadas manualmente en tres clases: positivo, neutral y negativo. El modelo resuelve la tarea de análisis de sentimiento en el dominio financiero para un idioma con escasa cobertura de recursos especializados, lo que lo hace relevante para el análisis de noticias bursátiles y macroeconómicas en Indonesia.

Arquitectónicamente es un transformer encoder de tipo BERT con 109,48 millones de parámetros totales, una cabeza de clasificación de tres etiquetas y una longitud de contexto heredada del modelo base. El repositorio ocupa 6,6 GB, lo que sugiere la presencia de pesos en múltiples formatos además de safetensors. La licencia es MIT y el modelo se distribuye con la etiqueta de idioma `id`.

La relevancia actual del modelo es limitada pero concreta: cubre un nicho (sentimiento financiero en indonesio) para el que existen pocas alternativas específicas, y lo hace con una licencia permisiva que facilita su integración en productos comerciales. No obstante, el tamaño reducido del conjunto de entrenamiento y los resultados de evaluación publicados condicionan fuertemente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base) con cabeza de clasificación de 3 clases |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base BERT; típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se distribuye en formato PyTorch, según el tamaño del repo) |

## Arquitectura y entrenamiento

El modelo parte de ProsusAI/finbert, un BERT base preentrenado sobre corpus financieros en inglés y posteriormente afinado para clasificación de sentimiento. Sobre esa base, el autor ha realizado un fine-tuning supervisado con una cabeza de clasificación de tres etiquetas (`positive`, `neutral`, `negative`) utilizando la librería `transformers`. No se especifica en la información disponible si se congelaron capas, qué hiperparámetros se emplearon, ni si hubo técnicas adicionales como DPO o RLHF (no aplicables a un clasificador de este tipo).

El conjunto de entrenamiento consiste en aproximadamente 500 titulares de noticias financieras indonesias etiquetadas manualmente, procedentes de fuentes locales. No se detalla la composición exacta por clase, el proceso de anotación, ni si se aplicaron técnicas de aumento de datos. No se menciona ninguna innovación técnica destacable más allá del propio fine-tuning sobre el modelo base.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (`positive`, `neutral`, `negative`) sobre textos en bahasa indonesio.
- Procesamiento de titulares y frases cortas de contenido financiero (mercados, divisas, tipos de interés, resultados empresariales).
- Integración directa con el pipeline `text-classification` de Hugging Face `transformers`.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al indonesio; no se declara soporte para otros idiomas.
- No dispone de modo de razonamiento, visión, audio ni otras capacidades especiales.

## Casos de uso

- Análisis de titulares bursátiles en tiempo real: el modelo puede clasificar titulares del Índice Compuesto de Yakarta (IHSG) o de acciones locales para alimentar un panel de sentimiento de mercado, aprovechando su entrenamiento específico en vocabulario financiero indonesio.
- Monitorización de noticias macroeconómicas: clasificación de comunicados sobre tipos de interés del Banco de Indonesia (BI) o sobre la evolución de la rupia para generar señales agregadas de sentimiento en un sistema de alertas.
- Filtrado previo en pipelines de análisis: como clasificador ligero (109 M de parámetros) puede actuar como primera etapa para descartar o priorizar noticias antes de pasarlas a modelos generativos más costosos.
- Investigación académica en PLN financiero indonesio: sirve como línea base reproducible y con licencia MIT para experimentos sobre sentimiento financiero en un idioma de bajos recursos.
- Enriquecimiento de datasets de noticias: etiquetado automático de grandes volúmenes de titulares históricos para construir series temporales de sentimiento con fines de backtesting.
- Prototipado rápido en entornos con recursos limitados: su tamaño reducido permite desplegarlo en CPU o en GPU de gama baja para demos y pruebas de concepto, como el Space público asociado al modelo.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evaluación sobre el conjunto `intanm/indonesian-financial-sentiment-analysis`, con métricas de media ponderada. Cabe señalar que la model card asocia estos resultados a `michaelmanurung/finbert-indonesia`, no directamente a `RikuraRiku/finbert-indonesia`, por lo que la correspondencia exacta entre ambos artefactos no está confirmada en la información disponible.

| Modelo | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|
| michaelmanurung/finbert-indonesia | 0.299 | 0.276 | 0.347 | 0.299 |
| ProsusAI/finbert | 0.285 | 0.134 | 0.560 | 0.285 |
| ayameRushia/bert-base-indonesian-1.5G-sentiment-analysis-smsa | 0.334 | 0.238 | 0.669 | 0.334 |

El model-index del repositorio no declara resultados adicionales (`results: []`). No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 109 M de parámetros (aproximadamente 440 MB de pesos), con overhead adicional del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en T4, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` pipeline, TorchServe, ONNX Runtime, TGI (con soporte de clasificación), FastAPI con `transformers` o `optimum`. No se documenta soporte explícito para llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Rendimiento (accuracy) |
|---|---|---|---|---|---|
| RikuraRiku/finbert-indonesia | 109,48 M | no disponible | Indonesio (financiero) | MIT | 0.299 (según model card, atribuido a variante michaelmanurung) |
| ProsusAI/finbert | ~110 M | 512 tokens (BERT base) | Inglés (financiero) | no disponible en esta ficha | 0.285 |
| ayameRushia/bert-base-indonesian-1.5G-sentiment-analysis-smsa | ~124 M | 512 tokens (BERT base) | Indonesio (general) | no disponible en esta ficha | 0.334 |

La comparativa se limita a los tres modelos incluidos en la evaluación del autor. No se dispone de información sobre otras alternativas específicas de sentimiento financiero en indonesio.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (~500 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Los resultados de evaluación son bajos en términos absolutos (accuracy 0.299, F1 0.276), lo que indica un rendimiento pobre para uso en producción sin validación adicional.
- La model card atribuye los resultados a `michaelmanurung/finbert-indonesia`, no a este repositorio; la trazabilidad entre ambos artefactos no está confirmada.
- El modelo base es inglés; la adaptación al indonesio se realizó solo mediante fine-tuning, sin preentrenamiento adicional en el idioma, lo que puede degradar la representación de vocabulario financiero local.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas sistemáticas por sesgo del dataset de entrenamiento.
- No se documentan sesgos específicos, pero el corpus de 500 titulares probablemente no cubre todos los sectores ni registros del discurso financiero indonesio.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base ProsusAI/finbert puede tener condiciones propias que conviene verificar antes de su explotación comercial.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se especifican los términos de uso, la política de datos ni las limitaciones idiomáticas más allá del indonesio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RikuraRiku/finbert-indonesia
- Modelo base: https://huggingface.co/ProsusAI/finbert
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/michaelmanurung/finbert-indonesia-demo
- Dataset de evaluación: `intanm/indonesian-financial-sentiment-analysis` (referenciado en la model card)
- Modelo comparativo: https://huggingface.co/ayameRushia/bert-base-indonesian-1.5G-sentiment-analysis-smsa
- Modelo comparativo: https://huggingface.co/michaelmanurung/finbert-indonesia
