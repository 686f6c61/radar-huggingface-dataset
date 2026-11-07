# markstanl/coherencerl-exp7-1_5b-fullft

## Resumen

`coherencerl-exp7-1_5b-fullft` es un ajuste fino (full fine-tuning) del modelo base Qwen2.5-1.5B, desarrollado por el usuario markstanl y publicado en Hugging Face. Se trata de un experimento de investigación más que de un modelo de producción: el nombre sugiere una serie de experimentos ("exp7") orientados a mejorar la coherencia mediante aprendizaje por refuerzo, concretamente con el algoritmo GRPO. El modelo se ha entrenado con la librería TRL y está pensado para generación de texto conversacional.

Arquitectura y tamaño heredan directamente de Qwen2.5-1.5B: un transformer decoder-only de tipo Qwen2 con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), según los pesos en safetensors. No es un modelo MoE, por lo que no hay parámetros activos diferenciados. El contexto máximo no está documentado en la model card, aunque el modelo base Qwen2.5-1.5B soporta 32.768 tokens de contexto nativo.

Su relevancia es limitada pero concreta: sirve como referencia para quienes investigan técnicas de RLHF/GRPO aplicadas a modelos pequeños y quieren inspeccionar los pesos resultantes, comparar con la variante LoRA del mismo autor o reproducir el pipeline de entrenamiento. No hay benchmarks publicados ni documentación sobre datos de entrenamiento, licencia o idiomas, lo que restringe su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning completo |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el base Qwen2.5-1.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | No documentados por el autor; al ser safetensors en fp/bf16 es cuantizable con herramientas estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar, y se ha sometido a un full fine-tuning (no LoRA), como indica el sufijo `fullft`. El entrenamiento se realizó con TRL 1.10.0 sobre Transformers 5.15.0 y PyTorch 2.11.0, usando el algoritmo GRPO (Group Relative Policy Optimization) descrito en el paper de DeepSeekMath. GRPO es una variante de optimización de política que estima la línea base mediante la media de recompensas de un grupo de muestras, eliminando la necesidad de un modelo crítico separado.

No se documentan el número de tokens de entrenamiento, la composición del dataset, las funciones de recompensa empleadas ni si hubo fases previas de SFT o DPO. La model card solo enlaza a un run de Weights & Biases (`wandb.ai/markgstanley1-nostomania-/RLCR/runs/bycm6gde`) que probablemente contiene las curvas de entrenamiento, pero no se detalla su contenido. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato chat (el ejemplo de la model card usa el pipeline con mensajes con rol `user`).
- Razonamiento y respuestas abiertas a preguntas del estilo "¿qué harías si...?", tal como muestra el ejemplo de uso.
- Entrenado con GRPO, lo que en principio favorece respuestas más coherentes y alineadas con la recompensa definida, aunque no se especifica cuál era esa recompensa.
- Soporte de tool calling, function calling y agentes: no documentado; el modelo base Qwen2.5 sí lo soporta, pero no hay confirmación de que el fine-tuning lo preserve.
- Capacidades multilingües: no documentadas; hereda las del base Qwen2.5-1.5B (29 idiomas), pero sin verificación.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en RLHF/GRPO: el modelo sirve como artefacto reproducible para estudiar cómo afecta GRPO a un modelo de 1,5B, comparando los pesos con el base Qwen2.5-1.5B y con la variante `coherencerl-exp7-1_5b-lora` del mismo autor.
- Experimentos de coherencia conversacional: útil para evaluar cualitativamente si el ajuste mejora la consistencia de respuestas en diálogos multi-turno, aunque sin benchmarks publicados la evaluación debe ser manual.
- Fine-tuning posterior como punto de partida: al ser un full fine-tuning sobre Qwen2.5-1.5B, puede servir de inicialización para nuevos experimentos de RL o SFT en entornos con recursos limitados.
- Prototipado de chatbots ligeros: con 1,5B parámetros cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB en fp16), lo que permite desplegar un chatbot de pruebas en local con Ollama o llama.cpp tras convertir a GGUF.
- Docencia y divulgación: ejemplo práctico de pipeline TRL + GRPO para explicar cómo se entrena un modelo con refuerzo, citando el run de W&B asociado.
- Evaluación comparativa de métodos de alineación: comparar este full fine-tuning con la versión LoRA del mismo autor permite analizar el impacto del método de ajuste en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos (1,54B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits (GGUF Q4_K_M), en torno a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; incluso en GPUs de 6-8 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| coherencerl-exp7-1_5b-fullft | 1,54B | no disponible (base: 32.768) | no disponible | Hugging Face, 851 descargas | Full fine-tuning con GRPO, sin benchmarks |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, muy popular | Modelo base, benchmarks publicados por Qwen |
| markstanl/coherencerl-exp7-1_5b-lora | 1,54B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face | Variante LoRA del mismo experimento |
| Llama 3.2 1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Alternativa de tamaño similar con contexto mucho mayor |

## Limitaciones y advertencias

- No hay información sobre sesgos: al ser un fine-tuning de Qwen2.5-1.5B, hereda los sesgos del base, pero no se ha documentado ninguna evaluación al respecto.
- Riesgo de alucinación: inherente a modelos de 1,5B; el ajuste con GRPO no garantiza factualidad y no hay benchmarks que lo midan.
- Licencia no especificada: la model card indica "licence: license" sin detallar términos, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-1.5B es Apache 2.0, pero el autor no aclara si mantiene esa licencia.
- Idiomas no documentados: no se puede confirmar el soporte multilingüe real tras el fine-tuning.
- Contexto no documentado: aunque el base soporta 32.768 tokens, no hay confirmación de que el fine-tuning preserve esa ventana.
- Sin benchmarks ni evaluación: no hay métricas publicadas, por lo que cualquier comparación de rendimiento es especulativa.
- Modelo experimental: el nombre "exp7" y la ausencia de model card detallada sugieren que no está pensado para producción; úsese con cautela en entornos reales.
- Repositorio de 18,5 GB: incluye pesos completos en safetensors, lo que requiere espacio en disco considerable para descarga y conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markstanl/coherencerl-exp7-1_5b-fullft
- Variante LoRA del mismo autor: https://huggingface.co/markstanl/coherencerl-exp7-1_5b-lora
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases del entrenamiento: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/bycm6gde
