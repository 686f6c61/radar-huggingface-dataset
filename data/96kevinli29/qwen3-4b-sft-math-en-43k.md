# 96kevinli29/Qwen3-4B-SFT-Math-en-43k

## Resumen

Qwen3-4B-SFT-Math-en-43k es un ajuste fino supervisado (SFT) de Qwen3-4B desarrollado por 96kevinli29 (Hongyang Li y colaboradores) como **checkpoint de control** para el articulo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104). El modelo parte de los pesos completos de Qwen3-4B y se entrena con ajuste de parametros completos sobre 43.218 trazas de razonamiento matematico en ingles, extraidas de los originales en ingles del dataset OpenR1-Math-220k.

Su proposito no es ser un modelo de produccion, sino aislar una variable experimental: el modelo multilingue de seis idiomas del mismo estudio degrada la precision de respuesta, y este checkpoint en ingles reproduce exactamente el mismo entrenamiento (volumen de datos, tamano de batch, epoca y checkpoint) pero solo con datos en ingles. Asi se comprueba si la mezcla de idiomas es la causa del descenso de rendimiento. El resultado es que no lo es: la entrega correcta en ingles es del 71,6% frente al 71,7% del modelo multilingue y el 80,4% del Qwen3-4B original.

Es relevante para investigadores que estudien el efecto del SFT en el razonamiento multilingue, no como base para aplicaciones. El propio autor recomienda usar Qwen3-4B-SFT-Math-Multilingual si se busca un modelo sobre el que construir. La arquitectura subyacente es la de Qwen3-4B (transformer causal denso, 4.411 millones de parametros, contexto nativo de 32.768 tokens), con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3-4B), con modo thinking via `<think>` |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento); contexto nativo de Qwen3-4B |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors bfloat16) |
| Idiomas soportados | Ingles (entrenamiento y evaluacion); razona en ingles incluso ante problemas en espanol, frances o arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B: un transformer causal denso con atencion por cabezas agrupadas (GQA) y plantilla de chat con modo thinking, donde el razonamiento se emite dentro de las etiquetas `<think> … </think>`. El ajuste fino es de parametros completos (full-parameter), no LoRA, realizado con el entrenador SFT de verl sobre FSDP.

Los detalles del entrenamiento son: objetivo de entropia cruzada a nivel de token sobre toda la respuesta, incluido el razonamiento; optimizador AdamW con learning rate 2e-5 y decaimiento coseno hasta 0,1x, warmup del 1% y weight decay 0,1; batches de 16 trazas con contexto de hasta 32.768 tokens; precision bfloat16 y recorte de gradiente de 1,0; hardware A100-40GB en el cluster MeluXina (LuxProvide). Se libera la epoca 2, igual que en el modelo multilingue de seis idiomas. El dataset son 43.218 trazas de razonamiento matematico en ingles derivadas de OpenR1-Math-220k. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento matematico con cadena de pensamiento larga (long CoT) en ingles.
- Modo thinking activado por defecto mediante la plantilla de chat de Qwen3; el razonamiento visible aparece en `<think> … </think>`.
- Resolucion de problemas de competicion (AIME, AMC) con presupuesto de generacion de hasta 24.576 tokens.
- Razonamiento matematico multilingue de entrada: procesa enunciados en chino, espanol, frances, arabe y ruso, aunque la traza de razonamiento se emite en ingles.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (heredado potencialmente de Qwen3-4B, sin verificar).
- Capacidades de agente y multi-step reasoning: no documentadas especificamente para este checkpoint.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- **Investigacion sobre SFT multilingue**: usar el modelo como control en experimentos que midan el efecto de la mezcla de idiomas en el razonamiento, comparando directamente con Qwen3-4B-SFT-Math-Multilingual sobre el mismo conjunto de problemas.
- **Ablacion de idioma en el dataset de entrenamiento**: replicar el pipeline (verl SFT, FSDP, epoca 2, lr 2e-5) con distintos volumenes de datos en ingles; el autor publica ademas un control a 10K trazas para estudiar la curva de datos.
- **Evaluacion de fidelidad de idioma**: medir la tasa de respuestas que respetan el idioma solicitado (`In language`) frente a la precision, usando el dataset Multilingual-Math-Reasoning-Eval con 70 problemas por idioma.
- **Analisis de terminacion de razonamiento**: el modelo permite estudiar fallos de terminacion (por ejemplo, 22,7% de respuestas sin finalizar en ruso) con presupuestos de 24.576 tokens y 16 muestras por problema.
- **Prototipado de tutoria matematica en ingles**: generar soluciones paso a paso con traza visible para problemas tipo competicion, aprovechando el modo thinking y el contexto de 32.768 tokens.
- **Reproducibilidad de articulos**: servir como checkpoint de referencia con semilla unica y configuracion documentada para replicar los resultados de arXiv:2609.37104.

## Benchmarks y rendimiento

Evaluacion sobre 70 problemas de competicion (30 AIME-2026 + 40 AMC-2023) por idioma, 16 muestras por problema, temperatura 0,7 y presupuesto de 24.576 tokens. J@1 mide la entrega correcta (respuesta correcta, razonamiento en el idioma solicitado y terminacion); J@16 es la metrica pass@16 equivalente.

| Idioma | Correcto | En idioma | Sin finalizar | J@1 | J@16 | J@1 Qwen3-4B original | J@1 SFT multilingue |
|---|---|---|---|---|---|---|---|
| Ingles | 71,6% | 99,9% | 2,9% | 71,6% | 92,9% | 80,4% | 71,7% |
| Chino | 62,9% | 100,0% | 10,6% | 62,9% | 84,3% | 73,8% | 57,3% |
| Espanol | 69,2% | 0,0% | 2,2% | 0,0% | 0,0% | 0,1% | 64,6% |
| Frances | 69,6% | 0,0% | 0,7% | 0,0% | 0,0% | 0,0% | 64,6% |
| Arabe | 68,8% | 0,0% | 2,6% | 0,0% | 0,0% | 0,0% | 53,6% |
| Ruso | 56,1% | 99,5% | 22,7% | 54,3% | 80,0% | 69,1% | 61,2% |

El dato clave: el SFT solo en ingles reduce la precision respecto al Qwen3-4B original (71,6% frente a 80,4% en ingles), por lo que la degradacion no se explica por la mezcla de idiomas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 4,41 B parametros ocupan aproximadamente 8,8 GB de pesos, mas cache KV; con contexto de 32.768 tokens y batches pequenos se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: A100-40GB (la usada en entrenamiento), H100, L40S o RTX 4090 (24 GB) para inferencia en bfloat16.
- Cabe en GPU de consumo: si en RTX 4090 (24 GB) y RTX 3090 (24 GB) con bfloat16 o cuantizacion; en GPUs de 12-16 GB seria necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers 4.x y 5.x (verificado por el autor), text-generation-inference (tag en el repo) y endpoints compatibles; vLLM, llama.cpp u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles. El presupuesto de generacion de 24.576 tokens implica respuestas largas y coste elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | J@1 ingles | J@1 espanol | Licencia | Proposito |
|---|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-en-43k | 4,41 B | 32.768 | 71,6% | 0,0% | Apache 2.0 | Control en ingles |
| Qwen3-4B-SFT-Math-Multilingual-43k | 4,41 B | 32.768 | 71,7% | 64,6% | Apache 2.0 | Modelo recomendado por el autor |
| Qwen3-4B (original) | 4,41 B | 32.768 | 80,4% | 0,1% | Apache 2.0 | Modelo base sin SFT |
| Qwen3-4B-SFT-Math-en-10k | 4,41 B | 32.768 | No disponible | No disponible | Apache 2.0 | Control con menos datos |

Las cifras de J@1 corresponden al mismo conjunto de 70 problemas por idioma descrito en la seccion de benchmarks. El modelo original supera a ambos checkpoints SFT en precision, lo que sugiere que el ajuste fino supervisado sobre este dataset no mejora el rendimiento bruto.

## Limitaciones y advertencias

- Checkpoint de control experimental: una sola semilla, solo datos en ingles y solo matematicas; no es un modelo generalista ni una base recomendada para produccion.
- No corrige el idioma del razonamiento: ante problemas en espanol, frances o arabe razona en ingles, con 0,0% de entregas validas en esos idiomas.
- Degrada la precision respecto al Qwen3-4B original (71,6% frente a 80,4% en ingles), por lo que el SFT no aporta mejoras netas en esta configuracion.
- Riesgo de respuestas sin terminar: 22,7% en ruso y 10,6% en chino dentro del presupuesto de 24.576 tokens.
- Riesgo de alucinacion en razonamientos largos: no se documentan evaluaciones de fidelidad fuera de matematicas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explicitamente su uso como modelo de partida.
- Idiomas: solo ingles declarado; el resto de idiomas aparece unicamente en la evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Articulo: https://arxiv.org/abs/2609.37104
- Modelo multilingue recomendado: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Control en ingles a 10K: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k
- Control en chino: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k
- Control en espanol: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k
- Control en frances: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k
- Control en arabe: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k
- Control en ruso: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k
- Dataset de evaluacion: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Framework de entrenamiento (verl): https://github.com/volcengine/verl
