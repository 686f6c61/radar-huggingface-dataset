# caspar/MiniMind-MoE-198M-A64M-GSM8K-GRPO-Skywork-v1.0

## Resumen

MiniMind-MoE-198M-A64M-GSM8K-GRPO-Skywork-v1.0 es un modelo de lenguaje experimental de tamaño muy pequeño desarrollado por el usuario caspar en Hugging Face. Se trata de un afinamiento mediante GRPO (Group Relative Policy Optimization, un algoritmo de aprendizaje por refuerzo tipo RLHF) de un modelo base MoE previamente entrenado con SFT mixto. El objetivo del experimento es comparar el efecto de una recompensa basada en un modelo de recompensa neuronal (Skywork-Reward-V2-Qwen3-1.7B) frente a una recompensa basada en reglas estrictas sobre la tarea de matemáticas GSM8K.

El modelo pertenece a la familia MiniMind, una iniciativa open source para entrenar LLM miniatura desde cero. Con 198 millones de parámetros totales (de los cuales aproximadamente 64 millones están activos por token, según la convención de nomenclatura A64M), es un modelo de juguete orientado a investigación educativa y reproducibilidad, no a producción. El propio autor advierte explícitamente que no es un solucionador aritmético fiable: la precisión en GSM8K pasó del 1,21 % al 2,43 % tras el entrenamiento, cifras muy bajas que delimitan claramente su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia MiniMind) |
| Parametros totales | 198.416.640 |
| Parametros activos | ~64 millones (A64M, MoE) |
| Longitud de contexto | Prompts de hasta 768 tokens y salidas de hasta 256 tokens en entrenamiento/evaluacion; ventana maxima nativa no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), 0,8 GB |

## Arquitectura y entrenamiento

El modelo es una variante Mixture-of-Experts de la arquitectura MiniMind (codigo base disponible en GitHub bajo Apache-2.0), con 198,4 millones de parametros totales y unos 64 millones activos por token. Parte del checkpoint SFT `caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0` y se entrena con GRPO a parametros completos (full-parameter), sin LoRA.

El entrenamiento uso las 6.851 conversaciones del split de entrenamiento de GSM8K (dataset `caspar/MiniMind-Mixed-SFT-Training-v1.0`, revision `542384d`), una epoca completa, 215 actualizaciones con batch de 32 preguntas, cuatro generaciones por pregunta y microbatch de 8. El optimizador fue AdamW con LR coseno de 1e-6 a 1e-7, KL beta 0,04, clipping 0,2, weight decay 0,01 y gradient clip 1, con semilla 42. Se ejecuto en FP32 con autocast BF16 sobre una GPU A40. La novedad central del experimento es la funcion de recompensa: en lugar de la recompensa por regla (igualdad estricta del formato `#### numero`), se usa el logit de clasificacion crudo del modelo congelado `Skywork/Skywork-Reward-V2-Qwen3-1.7B`, sin bonus de longitud ni penalizacion por repeticion, con ventajas normalizadas por grupo. No se uso gold de test en ninguna fase de optimizacion.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat (chat template).
- Resolucion paso a paso de problemas aritmeticos elementales estilo GSM8K, con salida en formato `#### numero` (con precision muy limitada: 2,43 %).
- Razonamiento en cadena pensado para prompts que piden "solve step by step"; el ejemplo de uso desactiva el bloque de thinking de la plantilla.
- Sin capacidades de vision, audio ni multimodalidad.
- Sin soporte documentado de tool calling, function calling ni agentes.
- Capacidades multilingues: no documentadas; entrenado y evaluado unicamente en ingles.

## Casos de uso

- Investigacion en RLHF/GRPO a pequeña escala: el modelo y su metodologia documentada (recompensa Skywork frente a recompensa por reglas, mismos hyperparametros y orden de datos) son utiles como banco de pruebas reproducible para estudiar reward hacking y dinamicas de GRPO sin coste computacional significativo.
- Ensenanza de MoE y post-training: con menos de 200 millones de parametros y 0,8 GB en FP32, es adecuado para practicas academicas sobre mixture-of-experts, SFT y RL en GPUs de consumo.
- Comparacion de funciones de recompensa: permite replicar el experimento de recompensa neuronal (logit crudo de Skywork-Reward-V2) frente a recompensa por reglas y analizar por que la recompensa por modelo puede degradar la precision frente al formato.
- Prototipado de pipelines de evaluacion GSM8K: el repositorio incluye scripts y resultados completos (`evaluation_after.json`) utiles como referencia para montar evaluadores estrictos con formato `#### numero`.
- Pruebas de carga de modelos con custom code: sirve como caso real para validar flujos con `trust_remote_code=True` y revisiones fijadas (`v1.0`) en Hugging Face.
- Experimentos de destilacion o inicializacion: puede usarse como punto de partida barato para nuevos afinamientos, aunque con expectativas de calidad muy limitadas.

## Benchmarks y rendimiento

| Benchmark | Baseline (SFT) | Tras GRPO Skywork |
|---|---|---|
| GSM8K test (1.319 preguntas, greedy, max 256 tokens) | 16/1319 (1,21 %) | 32/1319 (2,43 %) |

Notas del propio autor: se registraron 85 errores de formato y 83 casos de agotamiento del presupuesto de salida en la evaluacion final. El scorer es estricto sobre el formato `#### numero` y verifica numeros finales, no validez del razonamiento. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (pesos de 0,8 GB) mas overhead de activaciones; con cuantizacion externa podria bajar aun mas, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una NVIDIA A40, pero la inferencia es viable en GPUs de consumo.
- Consumer GPUs: cabe comodamente en una RTX 3060 de 12 GB, RTX 4060 o incluso GPUs de 4-6 GB, dado el tamano en FP32.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta oficial documentada); al usar arquitectura custom de MiniMind, la compatibilidad directa con vLLM, TGI, llama.cpp u Ollama no esta garantizada ni documentada (no hay GGUF publicado).
- Latencia y throughput: no disponibles; por tamano y contexto corto se espera inferencia rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | GSM8K | Licencia |
|---|---|---|---|---|---|
| MiniMind-MoE-198M-A64M-GSM8K-GRPO-Skywork-v1.0 | 198 M | ~64 M | no disponible | 2,43 % | Apache-2.0 |
| Qwen2.5-0.5B-Instruct | ~494 M (denso) | — | 32.768 tokens | ~35-40 % (publicado por el autor) | Qwen Research (uso comercial condicionado) |
| SmolLM2-135M-Instruct | 135 M (denso) | — | 8.192 tokens | no disponible en ficha oficial | Apache-2.0 |

Frente a alternativas densas de tamano similar (SmolLM2-135M) o el doble (Qwen2.5-0.5B), este modelo esta muy por detras en capacidad matematica y general, ya que su proposito es experimental: comparar funciones de recompensa en GRPO, no maximizar rendimiento. Su ventaja diferencial es la documentacion exhaustiva del proceso de entrenamiento y la reproducibilidad del experimento.

## Limitaciones y advertencias

- Precision matematica extremadamente baja: el propio autor declara que "no es un solucionador aritmético fiable"; solo 2,43 % de acierto en GSM8K.
- La mejora medida (1,21 % a 2,43 %) verifica numeros finales con scorer estricto, no validez del razonamiento; no se ha hecho evaluacion humana independiente.
- La recompensa por modelo (Skywork) sin penalizaciones puede inducir reward hacking: 85 errores de formato y 83 salidas truncadas en la evaluacion final sugieren problemas de adherencia al formato.
- Riesgo alto de alucinacion, inherente a modelos de este tamano y entrenamiento limitado a un solo dataset de una epoca.
- Idioma limitado al ingles; sin soporte documentado de castellano ni otros idiomas.
- Requiere `trust_remote_code=True` y codigo custom (`model_minimind.py`); el autor recomienda revisar ese fichero antes de habilitarlo, lo que supone una consideracion de seguridad para despliegue.
- Contexto corto: entrenado con prompts de hasta 768 tokens y salidas de hasta 256 tokens; no apto para tareas de contexto largo.
- Licencia Apache-2.0, sin restricciones de uso comercial, aunque los terminos de los componentes del dataset SFT mixto upstream "permanecen aplicables" segun la model card, lo que exige revision para uso comercial.
- Proyecto experimental con 463 descargas y sin comunidad activa; no recomendado para produccion bajo ningun escenario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-GSM8K-GRPO-Skywork-v1.0
- Modelo base (SFT): https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/MiniMind-Mixed-SFT-Training-v1.0
- Codigo MiniMind (GitHub): https://github.com/jingyaogong/minimind
- Modelo de recompensa Skywork: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
