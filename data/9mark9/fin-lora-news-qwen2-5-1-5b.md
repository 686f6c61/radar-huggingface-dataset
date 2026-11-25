# 9mark9/fin-lora-news-qwen2.5-1.5b

## Resumen

fin-lora-news-qwen2.5-1.5b es un adaptador LoRA desarrollado por Nagizaaz Shaik (usuario 9mark9) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su funcion es clasificar texto financiero corto en ingles (titulares, fragmentos de noticias y tuits) en tres categorias de sentimiento: bajista (Bearish), alcista (Bullish) y neutral (Neutral). El modelo base sigue siendo un transformer causal de 1.543.714.304 parametros, y el adaptador anade 18.464.768 parametros entrenables sobre las proyecciones de atencion y MLP.

La relevancia del modelo reside en su enfoque de evaluacion: el autor no solo reporta precision en condiciones limpias, sino tambien la degradacion del rendimiento cuando se anade una sola frase manipulada a la entrada. Esta variante estandar alcanza un 88,3 % de accuracy en el conjunto de test de tuits, pero cae al 50,6 % tras una frase plantada, lo que lo convierte en un caso de estudio util sobre robustez en clasificacion de sentimiento financiero.

El adaptador se distribuye con licencia Apache-2.0, esta pensado para investigacion y educacion, y el autor advierte explicitamente de que no debe usarse para decisiones de trading automatizado. La ventana de contexto efectiva para la tarea es de 256 tokens, y solo se ha evaluado en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) con adaptador LoRA sobre proyecciones q, k, v, o, gate, up y down |
| Parametros totales | 1.543.714.304 (modelo base) + 18.464.768 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de entrenamiento y evaluacion de la tarea) |
| Tipos de cuantizacion | GGUF disponible en el repositorio; cuantizaciones especificas no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer causal decoder-only. La clasificacion no genera texto: se lee la etiqueta a partir de los logits de tres tokens de etiqueta en la ultima posicion del prompt fijo. Los identificadores de etiqueta son 0 para Bearish, 1 para Bullish y 2 para Neutral. La configuracion LoRA usa r=16, alpha=32, dropout=0.05, sin bias, y modulos objetivo down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj.

El entrenamiento utilizo 11.512 ejemplos: 8.000 fragmentos de noticias de NOSIBLE/financial-sentiment con etiquetas generadas por un ensemble de LLM, 2.000 tuits de zeroshot/twitter-financial-news-sentiment y 1.512 titulares de nota de prensa de Jean-Baptiste/financial_news_sentiment con etiquetas validadas manualmente. Se uso entropia cruzada sobre los logits de las tres etiquetas, optimizador AdamW con learning rate pico de 2e-4, weight decay 0.01, schedule one-cycle con 5 % de warm-up, clipping de gradiente en 1.0 y semilla 0. El entrenamiento consistio en 719 pasos de optimizador, una pasada sobre los datos, batch size 8 con acumulacion de gradiente 2, y duro 11.996 segundos (unas 3,3 horas) en una GPU de portatil segun el README del repositorio. Los pesos base se cargaron en bfloat16 con gradient checkpointing activado. Las versiones fijadas son peft 0.21.1, transformers 5.18.0 y torch 2.14.1.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (Bearish, Bullish, Neutral) sobre texto corto en ingles.
- Lectura de etiqueta mediante logits de tokens, sin generacion de texto libre.
- Manejo de titulares, fragmentos de noticias y tuits financieros.
- Evaluacion de robustez frente a frases adversariales anadidas a la entrada.
- No soporta tool calling ni function calling de forma nativa para esta tarea.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre robustez de clasificadores financieros: el adaptador permite reproducir el experimento de anadir una frase plantada y medir la caida de accuracy del 88,3 % al 50,6 %, util para estudiar ataques de manipulacion de texto.
- Analisis de sentimiento de titulares en cuadernos de investigacion: se puede usar para etiquetar lotes de titulares financieros en ingles y comparar con lineas base mas simples, como parte de un estudio academico.
- Docencia sobre fine-tuning con PEFT: el repositorio incluye comandos de entrenamiento, configuracion LoRA y scripts de evaluacion, lo que lo hace adecuado para cursos practicos de adaptadores sobre modelos pequenos.
- Prototipado de pipelines de clasificacion: con 1.500 millones de parametros y un adaptador de 18 millones, se puede desplegar en una GPU de consumo para experimentar con clasificacion de noticias cortas antes de invertir en modelos mayores.
- Evaluacion comparativa de datasets financieros: permite contrastar el rendimiento entre etiquetas generadas por LLM (NOSIBLE) y etiquetas manuales (Jean-Baptiste), lo que ayuda a estudiar la calidad de las anotaciones automaticas.
- Analisis de sensibilidad a la ventana de contexto: al estar limitado a 256 tokens, sirve para estudiar como se degrada la clasificacion cuando el texto supera esa longitud, un escenario comun en noticias financieras reales.

## Benchmarks y rendimiento

| Conjunto de evaluacion | n | Accuracy | Macro-F1 | Fuente |
|---|---|---|---|---|
| Twitter Financial News Sentiment (test retenido, solapamiento de entrenamiento eliminado) | 2.368 | 88,3 % | 0,858 | model-index del autor |
| NOSIBLE financial-sentiment, split de desarrollo (etiquetas automaticas) | 1.000 | 84,6 % | 0,847 | train_news-1.5b.json, campo dev |
| Titulares de nota de prensa, split de test (etiquetas manuales) | 267 | 78,3 % | No calculado | robustness_equities_lora_news_1.5b.json |
| Twitter Financial News Sentiment tras una frase plantada | No disponible | 50,6 % | No disponible | Model card, seccion Robustness |

Los resultados del model-index no estan verificados por un tercero (verified: false). El autor indica que este adaptador no paso por el script de evaluacion de tres conjuntos, por lo que no hay numeros comprometidos de test para tuits ni fragmentos de noticias, ni macro-F1 en titulares. El split de desarrollo se puntuo al final del entrenamiento y no se uso para elegir hiperparametros ni checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en bfloat16 para el modelo base de 1.500 millones de parametros, mas el adaptador de 18 millones; en cuantizacion GGUF de 4 bits puede bajar de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16, como RTX 3060, RTX 4060, RTX 4070 o superiores; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas; con cuantizacion GGUF puede ejecutarse en equipos con menos VRAM.
- Opciones de despliegue: transformers con PEFT, llama.cpp u Ollama mediante los pesos GGUF del repositorio, y vLLM o TGI para servir el modelo base con el adaptador si se configura adecuadamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el entrenamiento de 719 pasos tardo unas 3,3 horas en una GPU de portatil, lo que sugiere que la inferencia es ligera, pero no se aportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fin-lora-news-qwen2.5-1.5b | 1.500 M + 18 M adaptador | 256 tokens | Clasificacion de sentimiento financiero via logits | Apache-2.0 | Hugging Face, GGUF incluido |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (modelo base) | Generacion de texto general | Apache-2.0 | Hugging Face |
| fin-lora-news-qwen2.5-1.5b-adv | 1.500 M + adaptador | 256 tokens | Variante con entrenamiento adversarial | Apache-2.0 | Hugging Face |
| Clasificadores financieros tipo FinBERT | Aproximadamente 110 M | 512 tokens | Clasificacion de sentimiento con BERT | Varía segun version | Hugging Face |

La comparativa con FinBERT es orientativa: no se dispone de resultados de benchmarks de este adaptador frente a FinBERT en la informacion proporcionada. El modelo base Qwen2.5-1.5B-Instruct tiene una ventana de contexto mucho mayor, pero el adaptador esta entrenado y evaluado solo para 256 tokens.

## Limitaciones y advertencias

- El autor advierte de que no es asesoramiento financiero y que la salida no es una prediccion de movimiento de precios.
- No debe usarse para decisiones de trading automatizado ni para ninguna decision que mueva dinero: anadir una sola frase a la entrada cambia la etiqueta en una gran proporcion de casos (accuracy del 50,6 % tras una frase plantada).
- No se ha evaluado en informes financieros, transcripciones de llamadas de resultados, texto no ingles ni entradas superiores a 256 tokens.
- Solo soporta ingles.
- Las etiquetas del dataset NOSIBLE fueron generadas por modelos de lenguaje de varios proveedores y su texto procede de sitios de noticias publicos; cualquier uso comercial debe revisarse por separado, y la licencia Apache-2.0 del adaptador no resuelve esa cuestion.
- Los datasets de robustez (Financial PhraseBank, FOMC, gold-news, oil-headline y crypto) tienen licencias restrictivas y se usaron solo para inferencia; no se distribuye texto de ellos.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos en la informacion disponible, pero al ser un clasificador de texto financiero puede heredar sesgos de los datasets de entrenamiento.
- El adaptador estandar no incorpora entrenamiento adversarial; para texto no confiable el autor recomienda la variante fin-lora-news-qwen2.5-1.5b-adv.
- Los resultados del model-index no estan verificados por un tercero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-1.5b
- Variante con entrenamiento adversarial: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-1.5b-adv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Codigo, resultados y write-up: https://github.com/shaikn6/fin-lora
- Dataset NOSIBLE/financial-sentiment: https://huggingface.co/datasets/NOSIBLE/financial-sentiment
- Dataset zeroshot/twitter-financial-news-sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Jean-Baptiste/financial_news_sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
