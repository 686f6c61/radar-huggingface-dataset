# caspar/MiniMind-Dense-64M-Pretrain-v1.0

## Resumen

MiniMind-Dense-64M-Pretrain-v1.0 es un checkpoint de preentrenamiento de un modelo de lenguaje denso de 63.912.192 parametros, desarrollado por el usuario caspar y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo experimental de continuacion de texto, entrenado desde inicializacion aleatoria sobre el subconjunto `sample/10BT` de FineWeb-Edu filtrado por puntuacion de calidad educativa. Su codigo de arquitectura deriva del proyecto jingyaogong/minimind, tambien bajo Apache-2.0.

El modelo emplea una arquitectura transformer densa con tamano oculto de 768, 8 capas, vocabulario de 6400 tokens y embeddings de entrada y salida atados. El checkpoint corresponde a 2 epocas de preentrenamiento completadas el 24 de octubre de 2026 y recuperadas el 13 de noviembre de 2026 desde un volumen de Runpod. Es el checkpoint base exacto utilizado para entrenar el modelo posterior caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0, y su SHA256 original coincide con el `base_sha256` registrado en esa ejecucion de SFT.

Su relevancia es fundamentalmente educativa y de investigacion: permite reproducir y auditar el pipeline completo de preentrenamiento de un modelo pequeno con recursos de una sola GPU consumer, incluyendo tokenizacion, ventanas de contexto, metricas de validacion y empaquetado de pesos. No es un modelo apto para produccion ni para conversacion: el propio autor advierte que se trata de un modelo experimental de continuacion de texto previo al SFT, sin validacion de chat, seguimiento de instrucciones ni razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de jingyaogong/minimind) |
| Parametros totales | 63.912.192 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 340 tokens (longitud de ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor solo publica FP16 y safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch `.pth` (FP16), codigo custom `model_minimind.py` |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 8 capas, tamano oculto de 768, vocabulario de 6400 tokens y embeddings de entrada/salida atados, implementado en `model_minimind.py` a partir del codigo de jingyaogong/minimind. El repositorio incluye tanto el paquete Transformers (`model.safetensors`, `config.json`) como el state dictionary original en FP16 (`pretrain_768.pth`), sin estados del optimizador.

El entrenamiento se realizo sobre FineWeb-Edu `sample/10BT` (revision `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`), filtrado a puntuacion >= 3.5, con 1.288.228 documentos antes del split. Cada documento se tokeniza como BOS + texto + EOS, se usan ventanas completas de 340 tokens con stride 339, se descarta la ultima ventana corta de cada documento y no se empaqueta entre documentos. El split train/validacion usa un hash del texto completo del documento, con 4.407.066 ventanas por epoca. Se entreno en BF16 con AdamW sobre una RTX 5090, batch 64 x acumulacion 4, 2 epocas, 34.432 actualizaciones del optimizador y learning rate pico de 3e-4. La perplejidad de validacion registrada paso de 7535,32 antes del entrenamiento a 14,24 despues, sobre 1.024 ventanas fijas de held-out (347.136 objetivos de siguiente token). No se documenta RLHF, DPO ni ninguna etapa de alineacion.

## Capacidades

- Generacion de texto por continuacion autoregresiva en ingles, limitada a la longitud de contexto entrenada de 340 tokens.
- Modelado de lenguaje base: prediccion del siguiente token sobre texto educativo en ingles.
- No soporta tool calling ni function calling (no entrenado para ello).
- No soporta agentes ni razonamiento multi-paso (sin SFT ni RLHF).
- Capacidad multilingue limitada al ingles; el vocabulario de 6400 tokens esta orientado a ese idioma.
- El tokenizer incluye una plantilla de chat heredada de los assets del tokenizer, pero su presencia no implica entrenamiento conversacional.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Reproduccion de pipelines de preentrenamiento: sirve como referencia completa (codigo, tokenizer, ventanas, metricas) para validar un flujo de entrenamiento de modelos pequenos en una sola GPU consumer.
- Investigacion educativa sobre tokenizacion y empaquetado: permite estudiar el efecto de ventanas de 340 tokens con stride 339 y sin packing entre documentos sobre la perplejidad.
- Punto de partida para SFT experimental: es el checkpoint base documentado del modelo Mixed-SFT-v1.0, util para replicar esa etapa de ajuste supervisado.
- Pruebas de infraestructura de despliegue: por su tamano (0,3 GB de repo) es adecuado para validar carga con Transformers, `trust_remote_code` y ejecucion en CPU o GPU de gama baja antes de escalar a modelos mayores.
- Benchmark de referencia de modelos diminutos: util para comparar perplejidad y curvas de entrenamiento frente a otros modelos de menos de 100M de parametros sobre FineWeb-Edu.
- Audicion de artefactos de publicacion: el repositorio incluye `release.json` con hashes y resumenes de evaluacion, lo que permite verificar la integridad de pesos y la correspondencia con la ejecucion de SFT.

## Benchmarks y rendimiento

| Metrica | Antes del entrenamiento | Despues del entrenamiento |
|---|---|---|
| Perplejidad de validacion (1.024 ventanas held-out, 347.136 objetivos) | 7535,32 | 14,24 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras de perplejidad son metricas historicas de la ejecucion de entrenamiento; las comprobaciones de publicacion recargaron los pesos y verificaron el empaquetado, pero no repitieron la validacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (63,9M de parametros, aproximadamente 256 MB de pesos mas overhead de activaciones y KV cache para 340 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una RTX 5090, pero la inferencia cabe en GPUs integradas o incluso en CPU.
- Cabe en cualquier GPU consumer actual (RTX 3060, RTX 4060, GTX 1650, etc.) y en CPU con Transformers.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere revisar `model_minimind.py` e instalar `requirements.txt`); carga nativa con `torch.load` del `.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMind-Dense-64M-Pretrain-v1.0 | 63,9M | 340 tokens | Apache-2.0 | Hugging Face | Checkpoint de preentrenamiento experimental |
| caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0 | 63,9M (misma base) | no disponible | no disponible en la informacion | Hugging Face | Version SFT del mismo checkpoint base |
| jingyaogong/minimind (proyecto origen) | variable | no disponible | Apache-2.0 | GitHub | Codigo de arquitectura del que deriva este modelo |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de continuacion de texto previo al SFT: no esta validado para chat, seguimiento de instrucciones ni precision de razonamiento.
- Contexto maximo validado de 340 tokens; contextos mas largos no estan validados y probablemente degraden la calidad.
- Solo ingles; el vocabulario de 6400 tokens limita la cobertura multilingue.
- Riesgo alto de alucinacion y de generar texto incoherente fuera del dominio de FineWeb-Edu.
- La plantilla de chat presente en el tokenizer no implica capacidad conversacional; usarla puede producir salidas no entrenadas.
- Requiere `trust_remote_code=True` y revision manual de `model_minimind.py` antes de habilitar codigo custom.
- Licencia Apache-2.0 para modelo y codigo, pero las licencias y terminos del dataset FineWeb-Edu siguen aplicandose y no quedan relicenciados por la licencia del modelo.
- No se incluyen datos de entrenamiento, estados del optimizador, credenciales ni logs de W&B.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/caspar/MiniMind-Dense-64M-Pretrain-v1.0
- Modelo SFT derivado: https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Proyecto de arquitectura origen: https://github.com/jingyaogong/minimind
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
