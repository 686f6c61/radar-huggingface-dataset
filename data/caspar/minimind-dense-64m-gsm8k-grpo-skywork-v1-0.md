# caspar/MiniMind-Dense-64M-GSM8K-GRPO-Skywork-v1.0

## Resumen

MiniMind-Dense-64M-GSM8K-GRPO-Skywork-v1.0 es un modelo de lenguaje experimental de tamaño muy reducido (63,9 millones de parámetros) entrenado por el usuario de Hugging Face "caspar". Se trata de un ajuste por refuerzo GRPO (Group Relative Policy Optimization) aplicado sobre el checkpoint SFT `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0`, con el objetivo de explorar el efecto de una función de recompensa basada en el modelo de premios Skywork (Skywork-Reward-V2-Qwen3-1.7B) frente a una regla estricta de igualdad de respuesta final en el dataset GSM8K.

Su relevancia es principalmente metodológica y educativa: es un experimento documentado con transparencia extrema (hiperparámetros, revisiones exactas de dataset y recompensa, evaluación completa sobre los 1.319 problemas de test de GSM8K), útil para investigadores interesados en RLHF a pequeña escala y en comparar variantes de recompensa. No es un modelo de producción ni un solver aritmético fiable: de hecho, la precisión en GSM8K descendió ligeramente tras el entrenamiento (de 1,06 % a 0,91 %). Usa arquitectura transformer densa, pesos en safetensors y código personalizado cargable con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (família MiniMind) |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | Prompts de hasta 768 tokens y salidas de hasta 256 tokens durante entrenamiento y evaluación; longitud máxima nativa no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), tamaño del repositorio 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder denso de la familia MiniMind (proyecto open source de jingyaogong) ya ajustado con SFT mixto sobre el dataset `caspar/MiniMind-Mixed-SFT-Training-v1.0`. Sobre ese checkpoint se aplicó GRPO a plenos parámetros (full-parameter), es decir, sin LoRA ni congelación de capas.

Los detalles del entrenamiento de refuerzo son: 6.851 conversaciones de entrenamiento de GSM8K (una época completa, 215 actualizaciones), batch de 32 preguntas con cuatro generaciones por pregunta y microbatch de 8; optimizador AdamW con LR 1e-6 → 1e-7 en schedule coseno, beta KL de 0,04, clipping de 0,2, weight decay 0,01 y gradient clip 1, con semilla 42. Se entrenó en FP32 con autocast BF16 sobre una GPU A40, muestreando con temperatura 1, top-p 1 y top-k 0. La particularidad clave es la función de recompensa: en lugar de una regla de igualdad del número final tras `####`, se usa el logit de clasificación crudo del modelo congelado Skywork-Reward-V2-Qwen3-1.7B, sin bonus de longitud ni penalización por repetición, con ventajas normalizadas por grupo. El oro de entrenamiento solo se usó para la recompensa por regla y diagnóstico, nunca como entrada del modelo Skywork. No se usó oro de test en ninguna fase de optimización.

## Capacidades

- Generacion de texto conversacional en ingles mediante chat template.
- Intento de resolucion paso a paso de problemas aritmeticos y de razonamiento matematico de nivel GSM8K, con formato de respuesta final `#### numero`.
- Compatibilidad con la libreria transformers de Hugging Face (carga con `AutoModelForCausalLM` y `trust_remote_code=True`).
- Generacion determinista (greedy) reproducible, tal como se uso en la evaluacion.
- No hay soporte documentado de vision, audio, tool calling ni agentes.

## Casos de uso

- Investigacion en RLHF/GRPO a pequena escala: sirve como checkpoint de referencia para estudiar como una recompensa basada en modelo (Skywork) frente a una regla dura afecta al entrenamiento, con hiperparametros y semillas documentados.
- Comparacion controlada de funciones de recompensa: el autor indica que la variante por regla parte del mismo checkpoint SFT, mismo orden de datos e hiperparametros, lo que permite experimentos A/B reproducibles.
- Docencia y tutoriales de post-entrenamiento: el repositorio, de solo 0,3 GB, es ideal para ejecutar pipelines de GRPO completos en una sola GPU de consumo o de gama media.
- Depuracion de pipelines de recompensa: util para verificar integraciones con Skywork-Reward-V2-Qwen3-1.7B antes de escalar a modelos mayores.
- Pruebas de infraestructura de inferencia: por su tamano minimo, sirve de modelo canario para validar despliegues de transformers, cuantizaciones o servidores.
- Estudio de casos limite de modelos muy pequenos: demuestra de forma empirica que 64M de parametros no bastan para GSM8K, un dato util al dimensionar modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 1.319 problemas oficiales de test de GSM8K, decodificacion greedy, salida maxima de 256 tokens, scorer estricto de igualdad de numero final:

| Modelo | Correctas / Total | Precision |
|---|---|---|
| Baseline SFT (antes de GRPO) | 14 / 1.319 | 1,06 % |
| Este modelo (tras GRPO Skywork) | 12 / 1.319 | 0,91 % |

No se han publicado comparaciones con otros modelos (GPT, Llama, Qwen, etc.) ni benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible. El autor subraya que el scorer verifica el numero final, no la validez del razonamiento, y que la recompensa de entrenamiento por si sola no demuestra mejora en matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 63,9 millones de parametros en FP32, unos 256 MB de pesos mas overhead de activaciones; cualquier GPU con 2 GB de VRAM o incluso CPU es suficiente. No hay estimaciones oficiales publicadas.
- GPU recomendadas: no disponible oficialmente; el entrenamiento se realizo en una NVIDIA A40, y para inferencia basta hardware minimo (por ejemplo, una RTX 3060 o inferior, o solo CPU).
- Cabe con holgura en cualquier GPU de consumo actual, incluidas las de gama de entrada, y en portatiles.
- Despliegue: mediante transformers con `trust_remote_code=True` (revisar `model_minimind.py` antes de habilitar codigo personalizado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; dado el codigo custom y el formato FP32, la via soportada es transformers.
- Latencia y throughput: no disponible; por el tamano del modelo se espera inferencia muy rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind-Dense-64M-GSM8K-GRPO-Skywork-v1.0 | 63,9 M | no disponible (768 tokens de prompt en entrenamiento) | 0,91 % | Apache-2.0 | Hugging Face, safetensors |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | no disponible en la informacion proporcionada | Qwen Research / Apache-2.0 (seguna version) | Hugging Face, safetensors |
| SmolLM2-135M-Instruct | ~135 M | 8.192 tokens | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face, safetensors |
| MiniMind2-Small (upstream, jingyaogong) | ~26 M | no disponible | no disponible | Apache-2.0 | GitHub / Hugging Face |

Nota: este modelo es un experimento de post-entrenamiento sobre GSM8K, no un modelo de proposito general, por lo que la comparativa es orientativa en cuanto a categoria de tamano.

## Limitaciones y advertencias

- Rendimiento matematico muy bajo y en descenso: la precision en GSM8K paso de 1,06 % a 0,91 % tras el GRPO; el propio autor advierte que "no es un solver aritmetico fiable".
- Riesgo de alucinacion alto: con 64M de parametros, el modelo genera razonamientos y respuestas incorrectas con total confianza; el scorer solo valida el numero final, no la coherencia del razonamiento.
- Idioma: entrenado y evaluado en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Codigo personalizado: requiere `trust_remote_code=True`; el autor recomienda revisar `model_minimind.py` antes de habilitarlo, una practica obligatoria por seguridad.
- Contexto limitado: el entrenamiento uso prompts de hasta 768 tokens y salidas de hasta 256; el comportamiento fuera de ese rango no esta documentado. Ademas, el checkpoint SFT base se entreno con ventanas de 340 tokens, por lo que esta ejecucion no es una comparacion emparejada en longitud de contexto.
- Sin seleccion de mejor checkpoint: la evaluacion se hizo sobre el modelo final sin elegir el mejor punto intermedio del entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero los terminos de los componentes del dataset SFT mixto upstream siguen aplicando; GSM8K es MIT y el modelo de recompensa Skywork (no redistribuido en el repo) es Apache-2.0.
- Alcance experimental: descargas moderadas (459), sin likes y sin comunidad de mantenimiento aparente; no apto para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-Dense-64M-GSM8K-GRPO-Skywork-v1.0
- Modelo base SFT: https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/caspar/MiniMind-Mixed-SFT-Training-v1.0
- Codigo MiniMind upstream: https://github.com/jingyaogong/minimind
- Modelo de recompensa Skywork: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
