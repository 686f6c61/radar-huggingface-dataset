# L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43

## Resumen

El modelo `L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen3-4B-Base, desarrollado por el usuario L1nkee. Se trata de un experimento de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos DAPO-Math-17k, orientado a mejorar el razonamiento matemático mediante verificación automática de respuestas. El modelo no es un producto final, sino una colección de checkpoints intermedios de una única ejecución de entrenamiento.

La relevancia de este modelo es doble: por un lado, sirve como material reproducible para investigadores interesados en RLVR (Reinforcement Learning with Verifiable Rewards) sobre modelos de 4 mil millones de parámetros; por otro, documenta de forma transparente todos los hiperparámetros del entrenamiento (learning rate, coeficiente KL, clip de PPO, semilla, hardware), lo que facilita la replicación. El repositorio contiene 54 checkpoints correspondientes a los pasos 10 a 540 de entrenamiento.

El modelo hereda la arquitectura y el tokenizador de Qwen3-4B-Base, con licencia Apache 2.0. No se han publicado resultados de benchmarks finales en la información disponible, aunque el autor documenta el protocolo de evaluación empleado durante el entrenamiento sobre AIME 2024, AIME 2025 y HMMT febrero 2025.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base) |
| Parámetros totales | 4 mil millones (aproximado, según el modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (prompt ≤ 1024 y respuesta ≤ 8192 durante el entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde pesos maestros fp32 de FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4 mil millones de parámetros. Sobre esta base se aplica un ajuste fino con GRPO, una variante de PPO sin modelo crítico que estima la ventaja relativa dentro de un grupo de respuestas muestreadas para el mismo prompt. La implementación utilizada es verl (Volcengine), con pesos maestros en fp32 y cómputo/rollout en bf16.

Los detalles del entrenamiento son los siguientes: pérdida PPO-clip con ε_low = ε_high = 0.2 y dual-clip c = 3.0; la política antigua de PPO se toma de las log-probabilidades del rollout en vLLM, de modo que el ratio y el clip se calculan contra la política de muestreo. Se aplica una pérdida KL del actor con `low_var_kl` y coeficiente 0.001, sin KL en la recompensa y con coeficiente de entropía 0. El optimizador es AdamW con LR constante de 1e-6, sin warmup, weight decay 0 y grad clip 1.0. El batch es de 128 prompts × 8 respuestas por paso, con mini-batch de 64 (2 actualizaciones por paso) y 1 época de PPO. Los prompts se truncan a 1024 tokens por la izquierda y las respuestas se limitan a 8192 tokens. El rollout usa vLLM con temperatura 1.0 y top-p 1.0. Se entrenó durante 4 épocas sobre DAPO-Math-17k (17 398 prompts), lo que supone 540 pasos, con semilla 43 en datos, actor, referencia y rollout, sobre 4 GPUs NVIDIA GH200 en NCSA DeltaAI. La recompensa es binaria (1 correcto / 0 incorrecto) mediante `math-verify` sobre la respuesta extraída del bloque `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, en modo thinking según la plantilla de chat por defecto de Qwen3.
- Resolución de problemas matemáticos de competición con formato de respuesta `\boxed{}`.
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 8192 tokens de respuesta durante el entrenamiento).
- Generación de código y texto general, heredada del modelo base Qwen3-4B-Base.
- Soporte de tool calling y function calling: no documentado en la información proporcionada (aunque el modelo base Qwen3 lo soporta, este ajuste no lo especifica).
- Capacidades de agente y multi-step reasoning: no documentadas específicamente para este ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: activado por defecto mediante la plantilla de chat de Qwen3.

## Casos de uso

- Investigación en RLVR: el modelo sirve como referencia reproducible para estudiar el efecto de GRPO sobre un modelo de 4B en tareas matemáticas verificables, con todos los hiperparámetros y la semilla documentados.
- Análisis de curvas de aprendizaje: los 54 checkpoints (pasos 10 a 540) permiten estudiar la evolución del razonamiento matemático a lo largo del entrenamiento y detectar fenómenos como el colapso de entropía o la sobreoptimización.
- Evaluación de técnicas de decodificación: al conservar la `generation_config.json` del modelo base (decodificación greedy, 2048 tokens nuevos), se puede comparar el efecto de distintas configuraciones de muestreo sobre el rendimiento matemático.
- Generación de soluciones matemáticas paso a paso: el modelo produce cadenas de razonamiento largas y respuestas finales en formato `\boxed{}`, adecuadas para pipelines de verificación automática con `math-verify`.
- Reproducción de experimentos: sirve como punto de partida para réplicas con distintas semillas, coeficientes KL o clips de PPO, comparando contra estos checkpoints de referencia.
- Docencia y formación: útil para explicar cómo funciona el ajuste por refuerzo con recompensas verificables en modelos pequeños, usando checkpoints intermedios para ilustrar la evolución del comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks finales en la información disponible. El autor documenta el protocolo de evaluación empleado durante el entrenamiento (AIME 2024, AIME 2025 y HMMT febrero 2025, con 30 problemas cada uno, 16 muestras por problema, temperatura 1.0, top-p 0.9, hasta 8192 tokens nuevos y métrica Avg@16), pero no se incluyen los valores numéricos obtenidos en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8-9 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, se recomiendan al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB para pesos; en 4 bits, aproximadamente 2,5-3 GB, más overhead.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, GH200 para entrenamiento o inferencia a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto limitado.
- Cabe en GPUs de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y potencialmente en GPUs de 12 GB con cuantización agresiva.
- Opciones de despliegue: vLLM (usado en el entrenamiento, con `--revision global_step_<N>`), transformers con `AutoModelForCausalLM`, llama.cpp y Ollama si se generan GGUF (no publicados en el repo), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43 | ~4B | no disponible | GRPO sobre DAPO-Math-17k | Apache 2.0 | Hugging Face, 54 checkpoints |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en la información | Preentrenamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | ~4B | no disponible en la información | Post-entrenamiento (SFT + RL) | Apache 2.0 | Hugging Face |
| Alternativas RLVR sobre modelos pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: el repositorio contiene checkpoints intermedios de una única ejecución, sin garantía de convergencia ni de calidad final.
- No se han publicado métricas de rendimiento finales; no es posible afirmar que supere al modelo base en tareas fuera del dominio matemático.
- El ajuste se ha realizado exclusivamente sobre DAPO-Math-17k, por lo que puede degradar capacidades generales (olvido catastrófico) respecto a Qwen3-4B-Base.
- La recompensa es binaria y basada en `math-verify`, lo que puede favorecer respuestas que pasan la verificación sin ser razonamientos correctos (reward hacking).
- La configuración de generación por defecto es greedy con 2048 tokens nuevos, insuficiente para reproducir el protocolo de evaluación; es necesario fijar temperatura, top-p y longitud explícitamente.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-4B-Base.
- Riesgo de alucinación: no cuantificado; en tareas matemáticas, el formato `\boxed{}` puede dar apariencia de rigor a respuestas incorrectas.
- Idiomas soportados: no disponibles; el entrenamiento se centró en problemas matemáticos, presumiblemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación conviene verificar la licencia del modelo base y de los datos DAPO-Math-17k.
- El tamaño del repositorio (88,5 GB) se debe a los 54 checkpoints en bf16; la descarga completa es costosa y conviene usar `--revision` para obtener solo el checkpoint deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset DAPO-Math-17k: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Repositorio verl: https://github.com/volcengine/verl
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
