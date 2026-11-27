# 9mark9/finbert-deberta-large-sentiment

## Resumen

`finbert-deberta-large-sentiment` es un modelo de clasificación de sentimiento financiero desarrollado por el usuario 9mark9. Se trata de un ajuste fino (fine-tuning) de `microsoft/deberta-v3-large` (435 millones de parámetros) para clasificar texto financiero corto en tres categorías: negativo, neutro y positivo. El modelo se presenta como la versión "hermana mayor" y más precisa de `finbert-minilm-sentiment`, un modelo compacto del mismo autor con 33,4 millones de parámetros.

El modelo resuelve el problema de analizar el tono de noticias financieras, tuits sobre mercados y titulares de notas de prensa, una tarea crítica para sistemas de trading algorítmico, monitorización de riesgo reputacional y análisis de opinión en tiempo real sobre activos cotizados. La propuesta de valor es clara: máxima precisión a costa de mayor latencia, con un rendimiento declarado de 90,16 % de accuracy en tuits financieros y 99,41 % en Financial PhraseBank.

Es relevante ahora porque demuestra que un encoder de 435M parámetros bien ajustado puede superar de forma consistente a modelos generativos mucho más grandes en una tarea de clasificación acotada, con una licencia MIT que permite uso comercial sin restricciones y un tamaño de repositorio de solo 1,7 GB, lo que facilita su despliegue en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atención desenredada y embedding de posición relativa) |
| Parametros totales | 435.064.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con 96 tokens según la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-large |
| Pipeline | text-classification |
| Etiquetas | negative / neutral / positive |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un transformer encoder de 435M parámetros que introduce atención desenredada (disentangled attention) y embeddings de posición relativa, mejoras que le permiten capturar dependencias sintácticas y semánticas con mayor eficacia que BERT o RoBERTa en tareas de comprensión. Sobre esta base se aplicó un ajuste fino supervisado para clasificación de tres clases, con una cabeza de clasificación estándar.

El entrenamiento utilizó la misma mezcla de datos que el modelo compacto del autor (v3): Financial PhraseBank, tuits financieros y titulares de notas de prensa. Las revisiones de los datasets están fijadas en `training/common.py`. El autor documenta explícitamente que la evaluación se realizó en fp32 con 96 tokens de longitud y con un entorno fijado (torch 2.8.0, transformers 4.57.6), y advierte que con transformers 5.x los resultados en tuits bajan de 90,16 % a 89,53 %. No se documentan fases de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada. La regla de publicación se fijó antes del entrenamiento: solo se publicaría si la accuracy en tuits superaba al modelo v3 en al menos 2,0 puntos.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (negativo, neutro, positivo) sobre texto corto en inglés.
- Análisis de titulares de noticias financieras y notas de prensa.
- Análisis de sentimiento en tuits sobre mercados y activos financieros.
- Procesamiento de frases de informes financieros (Financial PhraseBank).
- Inferencia en fp32 con ventana de 96 tokens, adecuada para frases y titulares cortos.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Monitorización de sentimiento en tiempo real sobre tuits financieros: el modelo clasifica cada tuit en bearish/bullish/neutral con un 90,16 % de accuracy en el conjunto de validación, lo que permite alimentar paneles de sentimiento de mercado con una granularidad por activo.
- Análisis de titulares de notas de prensa para alertas de riesgo: con un 78,28 % de accuracy en titulares de notas de prensa, se puede integrar en un pipeline que marque comunicados corporativos con tono negativo para revisión humana inmediata.
- Filtrado previo en sistemas de trading algorítmico: la clasificación de sentimiento de noticias y tuits puede actuar como señal auxiliar o filtro de entrada antes de ejecutar estrategias, aprovechando la licencia MIT para uso comercial sin restricciones.
- Enriquecimiento de bases de datos de noticias financieras: procesar por lotes miles de titulares históricos para etiquetar su tono y construir series temporales de sentimiento por empresa o sector.
- Análisis de opinión en foros y redes sociales financieras: clasificar comentarios de inversores minoristas para detectar cambios de percepción sobre un valor, con la ventaja de un modelo de 435M parámetros que cabe en una GPU consumer.
- Moderación y triaje de contenido en plataformas financieras: detectar mensajes con tono negativo o alarmista para su revisión por parte de equipos de compliance.
- Investigación académica en finanzas computacionales: servir como baseline fuerte y reproducible (entorno fijado, revisiones de datasets fijadas) para experimentos de análisis de sentimiento financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false` en el model-index). Todos en fp32 con transformers 4.57.6 y 96 tokens.

| Conjunto | n | Accuracy v3 (MiniLM) | Accuracy este modelo | Cambio (puntos) [IC 95 %] | Macro-F1 v3 | Macro-F1 este modelo | Cambio [IC 95 %] |
|---|---|---|---|---|---|---|---|
| PhraseBank AllAgree test (15 %) | 340 | 97,94 | **99,41** | +1,47 [+0,00, +3,24] | 96,43 | **99,28** | +2,85 [+0,28, +5,97] |
| Tuits financieros, validación | 2.388 | 86,43 | **90,16** | +3,73 [+2,47, +5,07] | 83,00 | **87,93** | +4,94 [+3,36, +6,57] |
| Titulares notas de prensa (JB), test | 267 | 75,28 | **78,28** | +3,00 [-2,25, +8,24] | 59,04 | **61,37** | +2,33 [-9,45, +14,79] |
| SEntFiN titulares, test | 933 | 75,99 | **79,74** | +3,75 [+1,29, +6,22] | 76,27 | **80,30** | +4,03 [+1,53, +6,51] |

Precisión y recall por clase (negativo / neutro / positivo):

| Conjunto | Precisión v3 | Recall v3 | Precisión este modelo | Recall este modelo |
|---|---|---|---|---|
| PhraseBank | 0,953 / 1,000 / 0,944 | 0,911 / 0,990 / 0,988 | 0,978 / 1,000 / 0,989 | 1,000 / 0,990 / 1,000 |
| Tuits | 0,725 / 0,946 / 0,752 | 0,850 / 0,870 / 0,857 | 0,831 / 0,947 / 0,819 | 0,879 / 0,908 / 0,897 |
| JB titulares | 0,667 / 0,764 / 0,733 | 0,167 / 0,853 / 0,667 | 0,667 / 0,794 / 0,766 | 0,167 / 0,865 / 0,727 |
| SEntFiN | 0,850 / 0,676 / 0,811 | 0,722 / 0,825 / 0,723 | 0,891 / 0,696 / 0,866 | 0,792 / 0,836 / 0,762 |

Nota: con transformers 5.x, el mismo modelo obtiene 89,53 % en tuits (+3,10 sobre v3, IC 95 % [+1,80, +4,44]); el resto de conjuntos no cambia. El autor no aisló qué cambio de la librería causa la diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB de pesos (435M parámetros × 4 bytes), más overhead de activaciones; en la práctica menos de 3 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB de pesos; en la práctica menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU consumer: sí, en cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: transformers (pipeline de text-classification), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles, y exportación a ONNX para servir con ONNX Runtime.
- Latencia y throughput: el autor indica que este modelo tiene aproximadamente 19 veces la latencia en CPU del modelo compacto de 33,4M parámetros; no se publican cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy tuits financieros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finbert-deberta-large-sentiment | 435M | 96 tokens (entrenamiento) | 90,16 % | MIT | Hugging Face |
| 9mark9/finbert-minilm-sentiment (v3) | 33,4M | no disponible | 86,43 % | no disponible | Hugging Face |
| ProsusAI/finbert | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| yiyanghkust/finbert-tone | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa disponible en la información es con el modelo compacto del mismo autor, que ofrece un 86,43 % de accuracy en tuits frente al 90,16 % de este modelo, a cambio de una latencia en CPU aproximadamente 19 veces menor. Para el resto de alternativas del ecosistema FinBERT no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de contexto corta (96 tokens en entrenamiento): no apta para documentos largos, solo frases y titulares.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en textos ambiguos o con sarcasmo, especialmente en la clase negativa: el recall de la clase negativa en titulares JB es de solo 0,167.
- Los resultados declarados no están verificados de forma independiente (`verified: false`); dependen críticamente de la versión de transformers (diferencia de 0,63 puntos en tuits entre 4.x y 5.x).
- El conjunto de titulares JB muestra intervalos de confianza que cruzan cero en accuracy y macro-F1, por lo que la mejora frente al modelo compacto no es estadísticamente significativa en ese conjunto.
- Sesgos conocidos: no documentados por el autor; al entrenarse con datos financieros en inglés, puede reflejar sesgos de dominio y de las fuentes de noticias utilizadas.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones, pero se recomienda conservar el aviso de copyright.
- En producción, fijar la versión de transformers (`>=4.51,<5`) para reproducir los números reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/finbert-deberta-large-sentiment
- Modelo compacto hermano: https://huggingface.co/9mark9/finbert-minilm-sentiment
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset Financial PhraseBank: https://huggingface.co/datasets/takala/financial_phrasebank
- Dataset Twitter Financial News Sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Jean-Baptiste financial news sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Dataset SEntFiN: https://huggingface.co/datasets/tasksource/sentfin
