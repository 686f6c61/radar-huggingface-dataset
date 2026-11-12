# Badrdeen/qwen-financial-json-extractor

## Resumen

`Badrdeen/qwen-financial-json-extractor` es un ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario Badrdeen, orientado a la extraccion de datos financieros estructurados en formato JSON a partir de texto de redes sociales (tuits y publicaciones). El modelo clasifica el sentimiento financiero en tres categorias (bearish, bullish, neutral) y extrae los tickers o cashtags bursatiles mencionados en el texto.

Tecnicamente se trata de un modelo transformer decoder-only de 494 millones de parametros (0,5B), ajustado mediante QLoRA con cuantizacion 4-bit NF4, rango LoRA r=16 y alpha=32 sobre el dataset zeroshot/twitter-financial-news-sentiment. El resultado es un modelo compacto y especializado: no es un asistente generalista, sino un extractor de estructura que devuelve JSON con dos claves fijas.

Su relevancia practica radica en el tamano reducido (permite inferencia en CPU o GPU consumer) y en las metricas declaradas por el autor sobre el split de validacion (N=2.388): 99,9% de validez estructural del JSON, F1 macro de sentimiento de 0,863 y 99,4% de exact-match en tickers. Es un componente util para pipelines de analisis de sentimiento financiero en tiempo real, no un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); pesos publicados en safetensors (fp16/bf16 segun carga); no se publican GGUF |
| Idiomas soportados | no disponible (el dataset de entrenamiento es predominantemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros con atencion causal estandar. El ajuste se realizo con QLoRA: cuantizacion 4-bit NF4 del modelo base, adaptadores LoRA de rango r=16 y alpha=32, y fusion posterior de los adaptadores en un checkpoint completo (el autor indica que el modelo publicado es el "merged model" listo para inferencia).

El dataset de entrenamiento es zeroshot/twitter-financial-news-sentiment, un corpus de noticias y publicaciones financieras de Twitter con etiquetas de sentimiento. La tarea se formula como generacion condicionada por un prompt de sistema que fuerza la salida a un objeto JSON con las claves `sentiment` (bearish/bullish/neutral) y `tickers` (lista de cashtags en mayusculas sin el simbolo `$`). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales; el autor solo declara el uso de QLoRA y la evaluacion con metricas F1 y exact-match.

## Capacidades

- Extraccion de sentimiento financiero en tres clases: bearish, bullish y neutral.
- Extraccion de tickers y cashtags bursatiles del texto, normalizados a mayusculas y sin el prefijo `$`.
- Generacion de salida JSON estrictamente estructurada con dos claves fijas, sin texto adicional cuando se usa el prompt de sistema recomendado.
- Clasificacion de texto corto de redes sociales (tuits y publicaciones financieras).
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas; el entrenamiento se basa en un dataset en ingles, por lo que el rendimiento fuera de ese idioma no esta garantizado.

## Casos de uso

- Analisis de sentimiento en tiempo real de tuits financieros: el modelo procesa texto corto y devuelve un JSON con sentimiento y tickers, lo que permite alimentar un pipeline de agregacion de senales por activo con un coste computacional minimo (0,5B parametros).
- Enriquecimiento de bases de datos de noticias financieras: se puede ejecutar en lote sobre corpus de publicaciones para anadir columnas de sentimiento y tickers mencionados, con una validez estructural del 99,9% que reduce la necesidad de validacion posterior.
- Monitorizacion de menciones de activos en redes sociales: al extraer cashtags de forma normalizada (exact-match del 99,4%), se pueden construir rankings de activos mas comentados y su polaridad asociada.
- Filtrado previo en sistemas de alertas de trading: el modelo actua como primera etapa barata que descarta publicaciones neutrales y marca las bullish/bearish para revision humana o modelos mayores.
- Procesamiento en el borde o en CPU: con 0,5B parametros cabe en entornos sin GPU dedicada, lo que permite desplegar el extractor en servicios ligeros o contenedores de bajo coste.
- Generacion de datasets etiquetados: sirve como etiquetador automatico para pre-anotar corpus financieros antes de una revision manual, gracias a su alta consistencia estructural de salida.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre el split oficial de validacion (N = 2.388 muestras no vistas):

| Metrica | Resultado |
|---|---|
| Validez estructural del JSON | 99,9% |
| F1 macro de sentimiento | 0,863 |
| Exact-match de tickers | 0,994 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parametros) mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en 8-bit: en torno a 0,5-1 GB; en 4-bit, por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en GPU de datacenter (A100, H100) aunque es sobredimensionado para este modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: transformers (como en el ejemplo del autor), vLLM, TGI, llama.cpp u Ollama si se convierte a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Badrdeen/qwen-financial-json-extractor | 494M | no disponible | Extraccion JSON financiera + sentimiento | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494M | no disponible | Asistente generalista | apache-2.0 | Hugging Face |
| Modelos de sentimiento financiero tipo FinBERT | ~110M | no disponible | Clasificacion de sentimiento | variable | Hugging Face |
| LLMs generalistas grandes (p. ej. familia Qwen2.5 7B+) | miles de millones | mayor | Extraccion y razonamiento general | variable | Hugging Face |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de rendimiento solo cubren el propio modelo.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de extraccion JSON de sentimiento y tickers financieros su rendimiento como asistente generalista sera muy inferior al del base Qwen2.5-0.5B-Instruct.
- Entrenado sobre un dataset de Twitter/noticias financieras en ingles; el comportamiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en la extraccion de tickers: aunque el exact-match declarado es alto (0,994), puede inventar cashtags o normalizar incorrectamente simbolos poco frecuentes.
- La clasificacion de sentimiento es de tres clases y no captura matices (ironia, sarcasmo, contexto macro) mas alla del dataset de entrenamiento.
- El autor no documenta sesgos conocidos, composicion del dataset ni proceso de evaluacion independiente; las metricas son autodeclaradas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-0.5B-Instruct y del dataset de entrenamiento antes de un despliegue en produccion.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Badrdeen/qwen-financial-json-extractor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
