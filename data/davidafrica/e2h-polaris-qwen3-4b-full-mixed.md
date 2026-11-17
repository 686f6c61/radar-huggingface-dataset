# davidafrica/e2h-polaris-qwen3-4b-full-mixed

## Resumen

e2h-polaris-qwen3-4b-full-mixed es un checkpoint de ajuste fino del modelo Qwen3-4B de Alibaba, publicado por el usuario davidafrica en Hugging Face. Se trata de un modelo de lenguaje de 4.411 millones de parámetros (aproximadamente 4,4 mil millones) entrenado con GRPO (Group Relative Policy Optimization) sobre problemas matemáticos del Polaris-Dataset-53K, empleando una bifurcación de la librería verl 0.4.1. El objetivo del entrenamiento es mejorar el razonamiento matemático del modelo base mediante aprendizaje por refuerzo con recompensas basadas en reglas y en votación mayoritaria.

La particularidad del enfoque es la estrategia "easy-to-hard" (E2H): los problemas del dataset se dividieron en bandas de dificultad según la tasa de acierto del propio Qwen3-4B al generar 16 muestras por problema. Los problemas fáciles se recompensan verificando la respuesta contra la referencia, mientras que los difíciles se recompensan por votación mayoritaria entre 32 muestras, sin usar la respuesta de referencia. El checkpoint publicado corresponde al paso 50 de un entrenamiento configurado para 1.200 pasos, que se detuvo tras el primer checkpoint.

Este modelo es relevante como ejemplo de experimentación abierta en RL para matemáticas sobre modelos pequeños, y por su carácter de checkpoint intermedio: no es un modelo final pulido, sino un artefacto de investigación reproducible. Su licencia Apache 2.0 y su compatibilidad con `transformers` y `vLLM` facilitan su inspección y reutilización, aunque la información pública sobre su rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó respuestas de hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de la familia Qwen3, y conserva su arquitectura sin modificaciones estructurales. El ajuste se realizó con GRPO mediante una bifurcación de verl 0.4.1, con pesos fusionados desde los shards FSDP y publicados en bf16. No se documentan cambios arquitectónicos propios ni innovaciones como decodificación especulativa o atención lineal.

El entrenamiento usó el conjunto `train_all` (26.790 problemas, suma de `train_easy` y `train_hard`) del Polaris-Dataset-53K, con 64 prompts por paso y 32 muestras por prompt, learning rate de 1e-6, pérdida KL de 0,001 (variante `low_var_kl`) y respuestas de hasta 8.192 tokens. La recompensa es basada en reglas para los problemas fáciles (verificación contra la respuesta de referencia) y por votación mayoritaria entre 32 muestras para los difíciles, juzgada con `math_verify` sin usar la respuesta de referencia. El checkpoint publicado es el paso 50 de una ejecución prevista para 1.200 pasos, detenida tras el primer checkpoint.

## Capacidades

- Generación de texto y razonamiento matemático, con foco en resolución de problemas de competición del dataset Polaris.
- Razonamiento multi-paso orientado a matemáticas, incentivado por el entrenamiento con GRPO y recompensas por verificación.
- Generación de cadenas de razonamiento largas: el entrenamiento permitió respuestas de hasta 8.192 tokens.
- Compatibilidad con `AutoModelForCausalLM` de `transformers` y con `vLLM` para inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.
- Capacidades multilingües: no disponibles en la model card; se heredan las del modelo base Qwen3-4B, pero no se especifican.

## Casos de uso

- Investigación en RL para matemáticas: el checkpoint permite reproducir y analizar la dinámica del entrenamiento GRPO con recompensas basadas en reglas y votación mayoritaria, comparando el paso 0 con el paso 50 sobre los conjuntos de evaluación del autor.
- Evaluación de estrategias easy-to-hard: sirve para estudiar si separar problemas por tasa de acierto del modelo base mejora la señal de recompensa en problemas difíciles, un área activa de investigación en RL para razonamiento.
- Generación de soluciones matemáticas paso a paso: el modelo puede producir razonamientos extendidos de hasta 8.192 tokens, útil para prototipos de tutores o asistentes matemáticos en entornos controlados.
- Baseline para ajuste fino posterior: al estar publicado en safetensors y bf16, puede servir como punto de partida para SFT o DPO adicionales sobre dominios matemáticos específicos.
- Experimentación con vLLM: su compatibilidad con `vllm.LLM` permite desplegarlo en pipelines de evaluación a escala con muestreo múltiple, necesario para técnicas de votación mayoritaria o best-of-N.
- Estudio de la degradación o estabilización en checkpoints tempranos: al ser el paso 50 de una ejecución más larga, es útil para analizar qué aprende el modelo en las primeras fases del RL y cómo evoluciona la diversidad de respuestas.
- Docencia y divulgación: ejemplo reproducible de un pipeline completo de RL con verl, GRPO y verificación matemática sobre un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en `eval_all_small` (850 problemas, 50 por cada banda de 0 a 16 aciertos sobre 16 del modelo base) y `eval_hard_small` (1.000 problemas que el base no resolvió en 16 intentos), con 8 muestras por problema, en los pasos 0 y 50, pero no se incluyen las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo (hasta 8.192 tokens) el consumo crece de forma significativa.
- Cuantización: no se publican versiones GGUF ni AWQ/GPTQ; para reducir VRAM habría que cuantizar manualmente (por ejemplo, a 8 bits o 4 bits), con la pérdida de calidad correspondiente.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con contexto largo y lotes grandes; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y GPUs con 16 GB o más si se limita el contexto o se cuantiza; en GPUs de 8-12 GB requeriría cuantización agresiva.
- Opciones de despliegue: `transformers` (`AutoModelForCausalLM.from_pretrained`), `vLLM` (`vllm.LLM`), y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque no se proporcionan artefactos listos.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de contexto y el número de muestras por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-mixed | 4,41 B | no disponible | GRPO sobre matemáticas (Polaris) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | ~4 B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens (según su model card) | Destilación de razonamiento | MIT | Hugging Face |
| Qwen2.5-Math-7B | ~7 B | 4.096 tokens (según su model card) | Especializado en matemáticas | Apache 2.0 | Hugging Face |

La comparación es orientativa: no se dispone de métricas del checkpoint para contrastar rendimiento real frente a estas alternativas. El modelo aquí descrito destaca por su enfoque de entrenamiento (E2H + GRPO) más que por resultados publicados.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 50 de una ejecución prevista para 1.200 pasos, detenida tras el primer checkpoint; no debe tratarse como un modelo final optimizado.
- Sin métricas publicadas: no se incluyen resultados numéricos de las evaluaciones mencionadas, por lo que no es posible verificar la mejora frente al modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos matemáticos plausibles pero incorrectos; la verificación con `math_verify` en entrenamiento no garantiza corrección en inferencia.
- Sesgos: no documentados; se heredan los del modelo base Qwen3-4B, sobre los que la model card no aporta información.
- Idiomas: no se especifican; el entrenamiento se centró en problemas matemáticos, presumiblemente en inglés, lo que puede degradar el rendimiento en otros idiomas respecto al base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propios términos que conviene revisar; además, el checkpoint no incluye garantías de calidad para producción.
- Uso en producción: no recomendado sin una evaluación propia exhaustiva, dado el carácter experimental y la falta de datos de rendimiento.
- Contexto: la model card no especifica la longitud de contexto soportada, aunque el entrenamiento usó respuestas de hasta 8.192 tokens; conviene validar el comportamiento con contextos largos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-mixed
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio verl (librería de RL usada): no se proporciona enlace en la información disponible
- Dataset Polaris-Dataset-53K: no se proporciona enlace en la información disponible
- Paper de GRPO: no se proporciona enlace en la información disponible
- `math_verify`: no se proporciona enlace en la información disponible
