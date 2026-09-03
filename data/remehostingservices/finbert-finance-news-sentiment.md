# remehostingservices/finbert-finance-news-sentiment

## Resumen

FinBERT Finance News Sentiment es un modelo de clasificación de sentimiento financiero desarrollado por el usuario remehostingservices, que parte del modelo base ProsusAI/finbert (Araci, 2019) y lo ajusta sobre un conjunto de 34.968 titulares de noticias financieras en inglés etiquetados por dos jueces LLM independientes (Claude Opus 5 y OpenAI gpt-5.6-sol) con un árbitro adicional (Claude Fable 5). El modelo resuelve el problema de determinar si una noticia financiera es positiva, negativa o neutral desde la perspectiva del impacto para un inversor, una tarea clave en sistemas de trading algorítmico, monitoreo de mercados y análisis de riesgo.

Con 109 millones de parámetros y una arquitectura BERT, el modelo es ligero y adecuado para despliegue en entornos con recursos limitados. Su ventana de contexto está limitada a 128 tokens, suficiente para titulares y noticias breves. La relevancia actual radica en que ofrece una alternativa de código abierto con licencia MIT, entrenada con datos etiquetados por LLMs de última generación, lo que permite reproducir y adaptar el pipeline de etiquetado a otros dominios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, 12 capas, 768 hidden) |
| Parametros totales | 109.484.547 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 tokens (truncamiento de textos más largos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (también incluye head.pt con los pesos del clasificador) |

## Arquitectura y entrenamiento

El modelo parte de ProsusAI/finbert, un BERT preentrenado en corpus financieros, y le añade una nueva cabeza de clasificación de 3 clases (positivo, negativo, neutral) sobre el `pooler_output`. El entrenamiento se realizó con pesos de clase basados en la raíz cuadrada de la frecuencia inversa (aproximadamente [pos 1.44, neg 1.20, neu 0.74]), optimizador AdamW con learning rate constante de 2e-5, 3 épocas, batch de 16 y longitud máxima de 128 tokens con padding dinámico. La selección del mejor modelo se hizo por macro F1 en validación (época 3: val acc 0.842 / F1 0.812). El entrenamiento se ejecutó en un MacBook Air M4 de 16 GB usando MPS, con una duración de 63 minutos. Los datos de entrenamiento provienen de titulares de canales de Telegram, mayoritariamente de un año con fuerte presencia de geopolítica, aranceles y política de la Fed, etiquetados por LLMs sin verificación humana.

## Capacidades

- Clasificación de sentimiento financiero en 3 clases: positivo, negativo y neutral, orientado al impacto para inversores.
- Procesamiento de titulares y noticias breves en inglés, con soporte para textos de hasta 128 tokens.
- Salida calibrada: el modelo reporta una confianza media de 0.938 y un ECE de 0.096; con umbral de confianza ≥ 0.95 cubre el 77% de los titulares con una precisión del 91.4%.
- Integración sencilla con la librería transformers mediante pipeline de clasificación de texto.
- No dispone de capacidades de tool calling, generación de texto, razonamiento multi-paso ni soporte multimodal.

## Casos de uso

- Monitoreo de noticias en tiempo real para trading algorítmico: el modelo puede integrarse en pipelines que consumen feeds de noticias financieras y generan señales de sentimiento para estrategias cuantitativas, gracias a su baja latencia y tamaño reducido.
- Alertas de impacto en carteras: un sistema puede clasificar titulares entrantes y disparar alertas cuando el sentimiento es fuertemente positivo o negativo, permitiendo a gestores de cartera reaccionar rápidamente a eventos de mercado.
- Análisis de sentimiento de canales de Telegram y redes sociales: dado que el entrenamiento se basó en titulares de Telegram, el modelo es especialmente adecuado para monitorizar estos canales y extraer el sentimiento agregado de fuentes no estructuradas.
- Filtrado y priorización de noticias para analistas financieros: el modelo puede clasificar automáticamente los titulares de un flujo de noticias, ayudando a los analistas a centrarse en las noticias con mayor impacto direccional.
- Backtesting de estrategias basadas en sentimiento: los investigadores pueden usar el modelo para etiquetar históricos de noticias y evaluar la correlación entre el sentimiento y los movimientos de precios.
- Enriquecimiento de datasets para otros modelos: las predicciones del modelo pueden servir como características adicionales en modelos de predicción de precios o de riesgo, aprovechando su capacidad de capturar el tono de las noticias.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el test split (3.500 titulares) del dataset Finance News Sentiment 35k:

| Metrica | Valor |
|---|---|
| Accuracy | 0.842 |
| Macro F1 | 0.808 |
| F1 positivo | 0.747 (P 0.71 / R 0.79) |
| F1 negativo | 0.788 (P 0.80 / R 0.78) |
| F1 neutral | 0.889 (P 0.90 / R 0.88) |

Además, se reporta que el 85% de los errores son confusiones entre neutral y direccional, siendo raros los cambios de polaridad. Para referencia, el paper original de FinBERT (Araci, 2019) reporta una precisión de 0.86 en el dataset Financial PhraseBank etiquetado por humanos; el autor indica que el rendimiento de este modelo está en el techo de ruido de etiquetas de sus datos generados por LLM (acuerdo entre jueces del 85%).

## Requisitos de hardware

- VRAM estimada: el modelo tiene 109M parámetros, por lo que en FP32 ocupa aproximadamente 438 MB. Con cuantización a 8 bits cabría en menos de 200 MB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en GPUs consumer como RTX 3060, RTX 4090, o incluso en CPU.
- Compatibilidad con hardware consumer: sí, es ejecutable en portátiles con 8 GB de RAM y en CPUs modernas sin GPU.
- Opciones de despliegue: transformers (pipeline), ONNX Runtime, TensorFlow Serving, o servidores de inferencia como Hugging Face Inference Endpoints (el modelo es compatible con text-embeddings-inference).
- Latencia y throughput: al ser un BERT base, la inferencia es rápida; en una GPU moderna se pueden procesar cientos de titulares por segundo, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Accuracy (Financial PhraseBank) | Notas |
|---|---|---|---|---|---|
| remehostingservices/finbert-finance-news-sentiment | 109M | 128 tokens | MIT | 0.842 (en su propio test) | Fine-tuning sobre ProsusAI/finbert con datos LLM |
| ProsusAI/finbert | 109M | 512 tokens | Apache 2.0 | 0.86 (reportado en paper) | Modelo base, entrenado con Financial PhraseBank |
| FinBERT-Tone (otros fine-tunings) | 109M | 512 tokens | variable | no disponible | Existen variantes, pero sin datos comparables publicados |

No se dispone de información suficiente para comparar con otros modelos de sentimiento financiero más recientes o con arquitecturas diferentes.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo fue entrenado con titulares de unos pocos canales de Telegram, mayoritariamente de un año con fuerte presencia de geopolítica, aranceles y política de la Fed; su precisión puede degradarse en otros dominios, períodos o fuentes.
- Etiquetas generadas por LLM: no existe un conjunto de validación humano; las etiquetas pueden contener ruido y errores sistemáticos, lo que limita la fiabilidad de las métricas reportadas.
- Longitud de contexto limitada: textos de más de 128 tokens se truncan, perdiendo información relevante en noticias largas o informes.
- Clase neutral amplia: el modelo tiende a clasificar como neutral noticias rutinarias (datos de mercado, declaraciones, movimientos pequeños), lo que puede no ser adecuado para aplicaciones que requieren distinguir matices sutiles.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto, pero puede producir etiquetas incorrectas con alta confianza en casos ambiguos; se recomienda usar el umbral de confianza ≥ 0.95 para reducir errores.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento (procedentes de Telegram) no infrinjan derechos de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/remehostingservices/finbert-finance-news-sentiment
- Dataset de entrenamiento: https://huggingface.co/datasets/remehostingservices/finance-news-sentiment-35k
- Repositorio de scripts de entrenamiento y etiquetado: https://github.com/RemeDegen/finance-news-sentiment
- Paper del modelo base: Araci, D. (2019). *FinBERT: Financial Sentiment Analysis with Pre-trained Language Models.* arXiv:1908.10063 — https://arxiv.org/abs/1908.10063
