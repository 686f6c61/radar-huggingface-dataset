# logan7000/llm-math345-gt-phi35mini-full

## Resumen

El modelo `logan7000/llm-math345-gt-phi35mini-full` es un ajuste fino del modelo Phi-3.5-mini-instruct de Microsoft, especializado en razonamiento matemático mediante aprendizaje por refuerzo. El autor, logan7000, ha aplicado la variante GRPO (Group Relative Policy Optimization) con recompensa basada en la respuesta correcta (ground-truth) sobre el dataset MATH345, utilizando exclusivamente el lado del modelo de lenguaje (LLM side). El entrenamiento se realizó durante 136 pasos (equivalente a 1 época) con 128 prompts por actualización, K=12 muestras, beta=0, y una tasa de aprendizaje de 3e-6.

El modelo se distribuye en tres variantes consolidadas en este repositorio: `best/` (mejor paso según validación, paso 100), `endpoint/` (paso final 136), y `training/` (que incluye los logs de entrenamiento, el estado del entrenador y la mejor métrica). El tamaño del repositorio es de 15.3 GB, lo que sugiere que se distribuyen los pesos completos en formato safetensors. La relevancia de este modelo radica en su enfoque de entrenamiento puramente basado en recompensa de respuesta correcta, sin función de pérdida adicional (beta=0), lo que lo convierte en un caso de estudio interesante para la comunidad de investigación en RL aplicada a LLMs. No se dispone de información pública sobre licencia, idiomas soportados ni benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi-3.5-mini-instruct (Transformer decoder-only) |
| Parametros totales | no disponible (base: 3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base: 128K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Phi-3.5-mini-instruct de Microsoft, un transformer decoder-only con aproximadamente 3.8 mil millones de parametros y una ventana de contexto nativa de 128K tokens. El proceso de ajuste emplea GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politica proximal adaptado a LLMs que agrupa multiples muestras por prompt para estimar ventajas relativas. La recompensa se calcula exclusivamente comparando la respuesta generada con la respuesta correcta (ground-truth) del dataset MATH345, sin componentes adicionales de recompensa por formato o estilo.

El entrenamiento se ejecuto durante 136 pasos (equivalente a 1 epoca sobre el dataset completo), con 128 prompts por actualizacion, K=12 muestras por prompt, beta=0 (sin regularizacion KL respecto al modelo base), y una tasa de aprendizaje de 3e-6. Se utilizo la funcion de perdida Bnpo (Binary Noise-Contrastive Policy Optimization) y el optimizador Adam con beta2=0.95. La evaluacion se realizo cada 10 pasos, seleccionando el mejor checkpoint por validacion en el paso 100. Este enfoque de entrenamiento sin regularizacion KL y con recompensa puramente basada en correccion es una innovacion metodologica que busca maximizar la adherencia a la respuesta correcta, aunque puede aumentar el riesgo de overfitting al dataset de entrenamiento.

## Capacidades

- Razonamiento matematico: el modelo esta especializado en resolver problemas del dataset MATH345, que incluye problemas de algebra, geometria, calculo, probabilidad y teoria de numeros.
- Generacion de texto instructivo: al derivar de Phi-3.5-mini-instruct, conserva la capacidad de seguir instrucciones y generar texto coherente en formato conversacional.
- Razonamiento paso a paso: el entrenamiento con GRPO sobre respuestas correctas fomenta la generacion de cadenas de razonamiento que conducen a la solucion correcta.
- Soporte multilingue limitado: la base Phi-3.5-mini-instruct soporta multiples idiomas, pero el ajuste con MATH345 (dataset en ingles) puede haber reducido el rendimiento en otros idiomas.
- No se ha confirmado soporte para tool calling, function calling, vision, audio ni modo de pensamiento extendido.
- La ventana de contexto de la base es de 128K tokens, pero no se ha verificado si el ajuste preserva esta capacidad completa.

## Casos de uso

- Evaluacion de razonamiento matematico en investigacion: el modelo puede utilizarse como punto de referencia para estudiar el impacto de GRPO con recompensa ground-truth en tareas de matematicas, comparandolo con otros metodos de RL como PPO o DPO.
- Generacion de soluciones explicadas para problemas de matematicas: dado su entrenamiento en MATH345, puede generar soluciones paso a paso que sirvan como material didactico en plataformas educativas.
- Benchmark de robustez en razonamiento: los investigadores pueden probar el modelo en datasets de matematicas fuera de distribucion (OOD) para evaluar su capacidad de generalizacion mas alla del dataset de entrenamiento.
- Analisis de overfitting en RL para LLMs: el uso de beta=0 y recompensa puramente correcta permite estudiar los limites del sobreajuste y la degradacion de capacidades generales tras el entrenamiento.
- Base para experimentos de destilacion: los checkpoints del modelo pueden servir para destilar conocimiento matematico en modelos mas pequenos mediante tecnicas de distillation.
- Comparacion de metodos de RL: al estar disponible el checkpoint del mejor paso (paso 100) y el final (paso 136), puede analizarse la evolucion del rendimiento durante el entrenamiento y comparar politicas intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion en datasets estandar como MMLU, GSM8K, HumanEval o MATH completo. El unico dato de rendimiento es la metrica de validacion interna sobre MATH345, que no se ha hecho publica en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con la base Phi-3.5-mini-instruct (3.8B parametros), se requieren aproximadamente 8-10 GB de VRAM en fp16 y alrededor de 4-5 GB en cuantizacion de 4 bits (GGUF Q4_K_M).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, A100 (40GB) o superiores. En consumer GPU, cabe en tarjetas con 8 GB o mas de VRAM si se usa cuantizacion.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con Transformers, vLLM, TGI, o convertirse a GGUF para usarse con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones especificas para este modelo. Como referencia, Phi-3.5-mini-instruct en una A100 genera aproximadamente 50-80 tokens/segundo en fp16.
- El tamaño del repositorio (15.3 GB) sugiere que los pesos estan en fp32 o fp16 sin cuantizar, lo que requiere al menos 16 GB de VRAM para cargar el modelo completo en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| logan7000/llm-math345-gt-phi35mini-full | ~3.8B (base) | 128K (base) | GRPO sobre MATH345 | no disponible | HuggingFace |
| microsoft/Phi-3.5-mini-instruct | 3.8B | 128K | Instruct tuning + RLHF | MIT | HuggingFace |
| Qwen2.5-Math-1.5B | 1.5B | 32K | RL sobre MATH | Apache 2.0 | HuggingFace |
| DeepSeekMath-7B | 7B | 4K | RL sobre MATH | MIT | HuggingFace |

La comparacion directa con estos modelos requiere datos de benchmarks que no estan disponibles para el modelo de logan7000. La principal diferencia es el metodo de entrenamiento (GRPO con recompensa ground-truth y beta=0) frente a los enfoques mas convencionales de RLHF o RL con recompensas mixtas.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento exclusivo en MATH345 puede inducir un sesgo hacia el estilo y formato de los problemas de ese dataset, reduciendo el rendimiento en problemas de matematicas con formatos diferentes.
- Riesgo de alucinacion: la ausencia de regularizacion KL (beta=0) puede aumentar la probabilidad de generar respuestas incorrectas con alta confianza, especialmente fuera de distribucion.
- Overfitting potencial: al entrenar durante una sola epoca con recompensa puramente correcta, el modelo puede memorizar patrones especificos del dataset sin generalizar adecuadamente.
- Limitaciones de contexto: aunque la base soporta 128K tokens, no se ha verificado si el ajuste preserva esta capacidad; se recomienda probar con secuencias largas antes de usarlo en produccion.
- Restricciones de licencia: la licencia no esta especificada, lo que impide su uso comercial sin autorizacion explicita del autor.
- Idiomas: el dataset MATH345 esta en ingles, por lo que el rendimiento en otros idiomas puede verse degradado respecto al modelo base.
- Estado experimental: el entrenamiento se realizo con hiperparametros especificos (beta=0, bnpo loss) que no son estandar, por lo que los resultados pueden no ser reproducibles con otras configuraciones.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/logan7000/llm-math345-gt-phi35mini-full
- Repositorio de la variante endpoint: https://huggingface.co/logan7000/llm-math345-gt-phi35mini-endpoint
- Repositorio espejo de la variante endpoint: https://huggingface.co/q1716523669/llm-math345-gt-phi35mini-endpoint
- Modelo base Phi-3.5-mini-instruct: no se ha proporcionado enlace directo, pero esta disponible en HuggingFace como microsoft/Phi-3.5-mini-instruct
- LLM Leaderboard (referencia general): https://llm-stats.com/leaderboards/llm-leaderboard
- BenchLM (comparativa de benchmarks): https://benchlm.ai/
