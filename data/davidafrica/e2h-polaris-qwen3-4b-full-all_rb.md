# davidafrica/e2h-polaris-qwen3-4b-full-all_rb

## Resumen

e2h-polaris-qwen3-4b-full-all_rb es un checkpoint de ajuste fino del modelo Qwen/Qwen3-4B, publicado por el usuario davidafrica en Hugging Face. Se trata del paso 50 de una ejecución de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre problemas matemáticos del conjunto Polaris-Dataset-53K, utilizando una bifurcación de la librería verl 0.4.1. El objetivo del entrenamiento es mejorar la capacidad de razonamiento matemático del modelo base, especialmente en problemas de dificultad alta.

El modelo conserva la arquitectura y el tamaño del Qwen3-4B original: 4.411.424.256 parámetros en precisión bf16, con pesos en formato safetensors. El entrenamiento se realizó sobre 26.790 problemas divididos en bandas fácil y difícil según la tasa de acierto del propio Qwen3-4B con 16 muestras por problema, y la recompensa es puramente basada en reglas (corrección frente a la respuesta de referencia).

Es relevante como ejemplo de receta reproducible de RL para matemáticas con verl y GRPO, y como punto de partida para quien quiera evaluar el efecto de un ajuste corto (50 pasos) sobre un modelo pequeño. No obstante, la información publicada es muy limitada: no hay benchmarks finales, no se detallan idiomas soportados ni se ha publicado una evaluación comparativa con el modelo base más allá de la descripción del protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de aproximadamente 4.400 millones de parámetros. Sobre esa base se aplicó un ajuste con GRPO mediante una bifurcación de verl 0.4.1. El conjunto de entrenamiento es Polaris-Dataset-53K, filtrado y dividido en bandas de dificultad según la tasa de acierto del propio Qwen3-4B con 16 muestras por problema. La partición usada aquí es `train_all` (suma de `train_easy` y `train_hard`), con 26.790 problemas en total.

Los hiperparámetros documentados son: 64 prompts por paso, 8 muestras por prompt, tasa de aprendizaje 1e-6, pérdida KL de 0.001 con la variante `low_var_kl`, y respuestas de hasta 8.192 tokens. La recompensa es basada en reglas: se comprueba la corrección frente a la respuesta de referencia. El checkpoint publicado corresponde al paso 50 de una ejecución configurada para 1.200 pasos, detenida tras el primer checkpoint. La evaluación se realizó en los pasos 0 y 50 sobre `eval_all_small` (850 problemas, 50 por cada banda de aciertos 0-16 del modelo base) y `eval_hard_small` (1.000 problemas que el base no resolvió en ninguna de 16 muestras), con 8 muestras por problema. No se documentan innovaciones arquitectónicas adicionales ni datos de preentrenamiento propios.

## Capacidades

- Generación de texto y razonamiento matemático, reforzado específicamente mediante GRPO sobre problemas de Polaris-Dataset-53K.
- Resolución de problemas matemáticos con respuestas de hasta 8.192 tokens, lo que permite cadenas de razonamiento largas.
- Capacidades heredadas del Qwen3-4B base (generación general, código, etc.), aunque la model card no las detalla ni las evalúa tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de recetas de RL para matemáticas: el checkpoint sirve para reproducir y comparar el efecto de 50 pasos de GRPO frente al Qwen3-4B base en problemas de dificultad alta, usando los conjuntos `eval_all_small` y `eval_hard_small` descritos por el autor.
- Generación de soluciones matemáticas paso a paso: el modelo está entrenado para producir razonamientos largos (hasta 8.192 tokens) y respuestas verificables contra una referencia, adecuado para pipelines de verificación automática.
- Investigación sobre currículos easy-to-hard: al haberse entrenado con la partición completa (`train_all`), permite estudiar si el orden y la mezcla de dificultad afectan al rendimiento en problemas que el base no resolvía.
- Fine-tuning posterior con verl: al estar fusionado desde shards FSDP y publicado en safetensors bf16, puede cargarse con `AutoModelForCausalLM` o `vllm.LLM` y reutilizarse como inicialización para nuevas rondas de GRPO.
- Prototipado de tutores matemáticos: con contexto y respuestas largas, puede integrarse en aplicaciones de resolución guiada de problemas, siempre con verificación humana dada la ausencia de benchmarks publicados.
- Benchmarking de infraestructura de RL: útil para medir throughput y estabilidad de verl 0.4.1 en GPUs consumer o de datacenter con un modelo de 4B y respuestas de 8K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en los pasos 0 y 50 sobre `eval_all_small` y `eval_hard_small`, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para entrenamiento e inferencia con contexto largo; RTX 4090 o RTX 3090 para inferencia en bf16 con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más en bf16 para contextos moderados; en 8 o 4 bits cabe en GPUs de 8-12 GB.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` (Transformers), `vllm.LLM`, y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-all_rb | 4,41B | no disponible | GRPO sobre Polaris-Dataset-53K (paso 50) | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B | ~4B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento de Qwen | apache-2.0 | Hugging Face (modelo base ampliamente usado) |
| Otros checkpoints GRPO de Qwen3-4B | ~4B | variable | GRPO sobre datasets matemáticos | variable | Hugging Face (no se dispone de datos concretos en la información proporcionada) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint interrumpido en el paso 50 de una ejecución prevista para 1.200 pasos: el ajuste es muy corto y su efecto puede ser marginal o inestable.
- No se publican cifras de evaluación en la model card, por lo que no puede verificarse una mejora real frente al Qwen3-4B base.
- Entrenado exclusivamente con recompensa basada en reglas sobre matemáticas: puede degradar otras capacidades del modelo base (código, conversación general) al no haberse preservado con datos mixtos.
- Riesgo de alucinación y de razonamientos plausibles pero incorrectos, especialmente fuera del dominio matemático.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe más allá del heredado del base.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base Qwen3-4B.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- No se documentan sesgos específicos; aplican los del modelo base, no evaluados aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-all_rb
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Librería verl: https://github.com/volcengine/verl
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales del autor.
