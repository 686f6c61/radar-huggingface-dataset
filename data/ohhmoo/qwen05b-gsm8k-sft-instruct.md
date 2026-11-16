# OhhMoo/qwen05b-gsm8k-sft-instruct

## Resumen

`OhhMoo/qwen05b-gsm8k-sft-instruct` es un ajuste fino supervisado (SFT) completo del modelo `Qwen/Qwen2.5-0.5B-Instruct` sobre el split de entrenamiento del dataset GSM8k (7.473 soluciones paso a paso). Lo desarrolla el usuario independiente OhhMoo y su objetivo es especializar un modelo pequeño de 0,5B parámetros en la resolución de problemas matemáticos de aritmética elemental con razonamiento en cadena. El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 y el tokenizador original, por lo que es compatible con el código de carga estándar de Transformers.

El repositorio tiene un carácter mixto: además de los pesos del modelo, aloja checkpoints intermedios del SFT, checkpoints de autoencoders dispersos (SAE) TopK, resultados de evaluación y tensores de activaciones del flujo residual recogidos durante experimentos de SFT y PPO. Esta orientación hacia la interpretabilidad (tags `sae`, `interpretability`, `ppo`) lo hace relevante para investigadores que estudian la dinámica interna del ajuste fino y del aprendizaje por refuerzo en modelos pequeños, más que como modelo de producción general.

El rendimiento publicado es modesto: 36,2% de exactitud en el test de GSM8k (477 de 1.319 ejemplos) con decodificación greedy. Se trata, por tanto, de un artefacto de investigación reproducible, no de un solucionador matemático de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 630.167.424 (0,63B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (entrenamiento con longitud maxima de secuencia de 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only denso con atención causal estándar y RoPE, sin mezcla de expertos. El ajuste es un fine-tune completo (sin LoRA) en precisión mixta bf16, realizado con el `sft_trainer` de la librería verl. Los datos son el split de entrenamiento de GSM8k en formato chat (mensaje de sistema más mensaje de usuario), donde la respuesta objetivo es la solución completa paso a paso terminada en `#### N`.

El entrenamiento consta de 3 épocas (348 pasos) con AdamW, learning rate 1e-5 con decaimiento coseno, warmup ratio 0,1, weight decay 0,1, grad clip 1,0 y longitud máxima de secuencia de 1024 tokens. El prompt de sistema instruye al modelo a razonar paso a paso y a cerrar la respuesta con `#### <numero>` (solo dígitos, sin unidades ni Markdown). El repositorio incluye además checkpoints intermedios por paso global, familias de SAE TopK (SFT, PPO con recompensa flexible, PPO con recompensa estricta, PPO con KL alto y SAE L23 con k=256) y 48 tensores de activaciones de las capas 6, 12, 18 y 23 en el estado base del instruct y en los pasos PPO 10, 30, 50, 80 y 116.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolución de problemas matemáticos de aritmética elemental con razonamiento en cadena paso a paso (estilo GSM8k).
- Formato de salida estructurado: termina la respuesta con `#### <numero>` para facilitar la extracción programática de la respuesta final.
- Soporte de plantilla de chat (`apply_chat_template`) con roles system y user.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan modos de pensamiento extendido, visión ni audio.

## Casos de uso

- Evaluación de interpretabilidad con SAE: los checkpoints de autoencoders dispersos y los tensores de activaciones del flujo residual permiten analizar cómo cambian las representaciones internas entre el modelo base, el SFT y distintas variantes de PPO en capas concretas (6, 12, 18 y 23).
- Reproducción de experimentos de ajuste fino: el repositorio incluye checkpoints intermedios por paso global, lo que facilita estudiar la curva de aprendizaje y comparar estados intermedios con el modelo final.
- Investigación en aprendizaje por refuerzo aplicado a matemáticas: las familias de SAE asociadas a PPO con recompensa flexible, estricta y KL alto sirven como material para analizar la dinámica de entrenamiento con RL en modelos pequeños.
- Extracción automática de respuestas numéricas: el formato `#### <numero>` permite construir pipelines de evaluación automática sobre problemas aritméticos sin necesidad de parseo complejo.
- Prototipado educativo de razonamiento matemático: útil para demostrar cadenas de razonamiento paso a paso en entornos docentes o de divulgación con recursos de cómputo mínimos.
- Baseline ligero para comparativas: sirve como referencia de bajo coste (0,63B parámetros) frente a modelos mayores en tareas de aritmética elemental dentro de estudios comparativos.
- Inferencia en hardware modesto: al ser un modelo de 0,63B parámetros, puede ejecutarse en GPU de consumo para pruebas rápidas y validación de hipótesis.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| GSM8k test accuracy (greedy, 1.319 ejemplos) | 36,2% (477/1.319) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; por el tamaño (0,63B parámetros), en bf16 los pesos ocupan aproximadamente 1,3 GB y en fp32 unos 2,5 GB, a lo que hay que sumar la caché KV según la longitud de contexto.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en bf16 con secuencias cortas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el fabricante no lo documenta.
- Opciones de despliegue: la model card solo muestra uso con `transformers`; los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que se contempla TGI. No se documentan instrucciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OhhMoo/qwen05b-gsm8k-sft-instruct | 0,63B | no disponible | 36,2% (greedy) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,49B aprox. | no disponible en esta ficha | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,5B aprox. | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Rendimiento matemático limitado: 36,2% de exactitud en GSM8k test indica que falla en casi dos tercios de los problemas, por lo que no es apto como solucionador fiable en producción.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: alto en tareas fuera del dominio GSM8k o con problemas que requieran más de 1024 tokens de contexto, dado el tamaño reducido del modelo.
- Limitación de idioma: solo inglés según la model card; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset GSM8k (uso académico/investigación) antes de un despliegue comercial.
- Longitud de contexto: el entrenamiento usó secuencias de hasta 1024 tokens; problemas largos pueden truncarse o degradar la calidad.
- Naturaleza del repositorio: aloja checkpoints intermedios, SAE y tensores de activaciones, lo que incrementa el tamaño del repo (76,2 GB) y puede complicar la descarga selectiva; se recomienda usar `hf_hub_download` con el nombre de fichero concreto.
- Formato de salida rígido: el modelo espera terminar con `#### <numero>`; desviarse del prompt de sistema puede degradar la calidad de la respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OhhMoo/qwen05b-gsm8k-sft-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset GSM8k: https://huggingface.co/datasets/openai/gsm8k
- Librería verl (entrenamiento SFT): https://github.com/volcengine/verl
- Repositorio previo de SAE: https://huggingface.co/OhhMoo/sae-rl-qwen05b-layers
- Repositorio previo de activaciones: https://huggingface.co/OhhMoo/sae-rl-qwen05b-strict-activations
