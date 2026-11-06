# GiorgiaPrandi/whisper-tiny_portuguese_ft

## Resumen

Whisper tiny Portuguese es un modelo de reconocimiento automatico de voz (ASR) obtenido mediante fine-tuning del modelo openai/whisper-tiny de OpenAI sobre el dataset naharte/portuguese_english. Su autor es GiorgiaPrandi, quien lo ha publicado en Hugging Face bajo licencia Apache 2.0. El modelo resuelve el problema de transcribir audio en portugues (y, segun los datos de la model card, tambien ingles) partiendo de la arquitectura compacta de Whisper tiny, lo que lo hace adecuado para despliegues con recursos limitados.

Su relevancia es moderada y de nicho: se trata de un fine-tuning comunitario de un modelo muy pequeno (37,76 millones de parametros), no de un modelo de nueva generacion. Aun asi, resulta util como punto de partida ligero para tareas de transcripcion en portugues, y declara un WER del 10,44 % sobre el split de test de su dataset de evaluacion. La model card esta generada automaticamente por el Trainer y carece de documentacion detallada sobre usos previstos, limitaciones o composicion del dataset, lo que conviene tener en cuenta antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 segundos por defecto, pero no consta en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (por fine-tuning) e ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny: un transformer encoder-decoder disenado para ASR, en el que el encoder procesa log-mel spectrograms del audio y el decoder genera la transcripcion de forma autorregresiva. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper, lo que permite inferencia rapida incluso en hardware modesto.

El fine-tuning se realizo sobre el dataset naharte/portuguese_english durante 2000 pasos, con learning rate de 1e-05, batch size de entrenamiento de 2 (1 en evaluacion), optimizador AdamW (variante fused de PyTorch, betas 0,9/0,999, epsilon 1e-08), planificador de learning rate lineal con 500 pasos de warmup y semilla 42. No consta informacion sobre el numero de tokens o muestras del dataset, ni sobre tecnicas adicionales como RLHF o DPO (no aplicables a ASR). La version de Transformers empleada fue 5.21.0.dev0, con PyTorch 2.11.0+cu130.

## Capacidades

- Transcripcion automatica de voz (ASR) en portugues, segun el dataset de fine-tuning.
- Transcripcion en ingles, idioma declarado en la model card y heredado del modelo base Whisper.
- No soporta tool calling ni function calling (es un modelo de ASR, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni thinking mode.
- Capacidades multilingues ampliadas: no disponible; el modelo base Whisper tiny es multilingue, pero no consta como se ve afectado tras el fine-tuning.

## Casos de uso

- Transcripcion ligera de audio en portugues: al ser un modelo de 37,76 millones de parametros, puede ejecutarse en CPU o en GPUs de consumo para transcribir notas de voz, grabaciones cortas o podcasts sin infraestructura costosa.
- Prototipado rapido de pipelines de voz: su tamano reducido y su compatibilidad con la libreria Transformers lo hacen adecuado para experimentos y pruebas de concepto de ASR en portugues.
- Subtitulado automatico de contenido en portugues: puede integrarse en flujos de trabajo que generen transcripciones para subtitulos, dada su buena puntuacion WER (10,44 %) en su dataset de evaluacion.
- Procesamiento por lotes de grabaciones: el bajo coste computacional permite procesar grandes volumenes de audio en paralelo en hardware limitado.
- Base para nuevos fine-tunings: al ser un checkpoint comunitario con licencia permisiva, puede servir como punto de partida para ajustes adicionales sobre dominios especificos del portugues.
- Sistemas embebidos o de borde (edge): el tamano del repo (0,3 GB) facilita su despliegue en dispositivos con almacenamiento y memoria limitados, aunque no consta soporte oficial para formatos como GGUF o ONNX.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| WER | naharte/portuguese_english (split test) | 10,44 % |
| Loss (validacion) | naharte/portuguese_english (split test) | 0,2368 |

Evolucion durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | WER |
|---|---|---|---|---|
| 0,2308 | 0,9217 | 1000 | 0,2540 | 11,1836 |
| 0,1078 | 1,8433 | 2000 | 0,2368 | 10,4380 |

No se han publicado comparaciones con otros modelos de ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dada la arquitectura Whisper tiny (37,76 millones de parametros, ~0,3 GB en pesos), se espera que funcione en GPUs con 2-4 GB de VRAM o directamente en CPU, aunque no es un dato publicado por el autor.
- GPU recomendadas: no disponible; por el tamano del modelo, cualquier GPU moderna (incluso integradas o GPUs de consumo como una GTX 1650 o superior) deberia ser suficiente para inferencia.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo; incluso es viable la inferencia solo con CPU.
- Opciones de despliegue: libreria Transformers de Hugging Face (pipeline de automatic-speech-recognition); no consta compatibilidad declarada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | WER declarado | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| GiorgiaPrandi/whisper-tiny_portuguese_ft | 37,76 M | Apache 2.0 | 10,44 % (naharte/portuguese_english) | pt, en | Hugging Face |
| openai/whisper-tiny (base) | ~39 M | MIT | no disponible (no fine-tuned para pt especifico) | multilingue | Hugging Face |
| openai/whisper-small | ~244 M | MIT | no disponible | multilingue | Hugging Face |

Nota: el WER de cada modelo depende del dataset de evaluacion, por lo que las cifras no son directamente comparables entre modelos evaluados sobre datasets distintos.

## Limitaciones y advertencias

- La model card esta generada automaticamente y carece de secciones de usos previstos, limitaciones y datos de entrenamiento ("More information needed"), lo que dificulta evaluar su idoneidad para produccion.
- Sesgos conocidos: no disponible; no se documenta la composicion del dataset naharte/portuguese_english, por lo que los sesgos del modelo son desconocidos.
- Riesgo de alucinacion: los modelos Whisper son conocidos por generar texto no presente en el audio (alucinaciones) en segmentos de silencio o ruido; no consta que este fine-tuning mitigue ese problema.
- El WER del 10,44 % esta declarado por el autor y no esta verificado; ademas, se mide sobre un unico dataset, por lo que el rendimiento en otros dominios o acentos del portugues es desconocido.
- El numero de descargas (38) y likes (1) indica un uso comunitario muy reducido, sin validacion amplia.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- No consta soporte para cuantizacion ni para formatos de despliegue optimizados (GGUF, ONNX, CTranslate2).
- El idioma declarado en la model card es ingles ("en"), pese a que el nombre y el dataset apuntan a portugues; conviene verificar empiricamente el rendimiento en cada idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiorgiaPrandi/whisper-tiny_portuguese_ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de fine-tuning: https://huggingface.co/datasets/naharte/portuguese_english
