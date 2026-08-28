# HoangTran223/SPACE_Qwen3-4B

## Resumen

SPACE_Qwen3-4B es un modelo de lenguaje generativo desarrollado por HoangTran223 que aplica el método de entrenamiento SPACE (Self-Play with Adversarial Critic and Evolution, Wang et al., NeurIPS 2025) sobre el modelo base Qwen3-4B previamente ajustado con el dataset UltraChat 200k. El resultado es un modelo de 4 mil millones de parámetros orientado a conversación y generación de texto en inglés, con licencia Apache 2.0.

El modelo se publica como una serie de checkpoints de entrenamiento (ite0, ite1, ite2) que permiten reproducir el proceso de self-play. La relevancia actual radica en que SPACE es una técnica de entrenamiento emergente que mejora la calidad de los modelos mediante iteraciones de autogeneración y selección, y este repositorio ofrece una implementación práctica sobre una arquitectura popular como Qwen3. Está pensado para investigadores y desarrolladores interesados en métodos de entrenamiento alternativos al RLHF clásico.

El repositorio incluye los pesos en formato safetensors, scripts de lanzamiento, logs de entrenamiento y los datos de prompts utilizados, lo que facilita la reproducibilidad y el análisis del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4 mil millones (aprox., basado en Qwen3-4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32k, pero no se especifica en este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos completos en safetensors) |
| Idiomas soportados | ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, una arquitectura transformer densa con 4 mil millones de parametros, que ya incluye capacidades de razonamiento, generacion de codigo y matematicas. Sobre esta base, el autor realizo un primer ajuste supervisado (SFT) con el dataset UltraChat 200k, y posteriormente aplico el metodo SPACE (Self-Play with Adversarial Critic and Evolution) sobre un subconjunto de 50k prompts de UltraChat.

SPACE es un algoritmo de entrenamiento por auto-juego que alterna entre generar respuestas con el modelo actual, evaluarlas con un critico y actualizar el modelo mediante optimizacion. En este caso se usaron los siguientes hiperparametros: perdida SPACE con mu=1.0, optimizador RMSProp, batch de 2 con acumulacion de gradientes de 2, longitud maxima de secuencia de 1024 tokens, y una tasa de aprendizaje de 5e-7 para las iteraciones 0 y 1, reducida a 1e-7 a partir de la iteracion 2. El entrenamiento se realizo en varias iteraciones (ite0, ite1, ite2), siendo ite2 una instantanea en progreso.

No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de los 50k prompts de UltraChat. Tampoco se menciona el uso de RLHF o DPO adicional.

## Capacidades

- Generacion de texto conversacional en ingles, optimizada para dialogos multi-turno gracias al ajuste con UltraChat.
- Razonamiento y comprension del lenguaje, heredadas del modelo base Qwen3-4B.
- Generacion de codigo y soporte basico de matematicas, tambien heredadas de Qwen3-4B.
- No se indica soporte explicito de tool calling, function calling ni capacidades de agente en la informacion disponible.
- No se menciona modo thinking ni capacidades multimodales (vision, audio).
- El modelo es exclusivamente en ingles segun los metadatos.

## Casos de uso

- Investigacion en metodos de entrenamiento por self-play: el repositorio incluye checkpoints intermedios y scripts, lo que permite estudiar la evolucion del modelo a lo largo de las iteraciones de SPACE y comparar la calidad de las respuestas generadas en cada etapa.
- Desarrollo de chatbots y asistentes conversacionales en ingles: gracias al ajuste con UltraChat, el modelo puede mantener conversaciones coherentes y contextuales, adecuado para prototipos o sistemas de atencion al cliente en entornos de bajo presupuesto computacional.
- Generacion de datos sinteticos para entrenamiento: el modelo puede usarse para generar respuestas de alta calidad que sirvan como datos de entrenamiento para otros modelos mas pequenos, aprovechando su capacidad de producir texto fluido.
- Evaluacion de tecnicas de alineacion alternativas: al ser un ejemplo de aplicacion de SPACE, puede utilizarse como referencia para comparar con modelos entrenados con RLHF o DPO en tareas de preferencia y utilidad.
- Fine-tuning posterior para tareas especificas: al estar basado en Qwen3-4B y tener licencia Apache 2.0, se puede adaptar a dominios concretos (soporte tecnico, educacion, etc.) con un coste de computacion moderado.
- Despliegue en entornos con recursos limitados: con 4B de parametros, el modelo puede ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3090 o 4090) con cuantizacion, lo que lo hace util para aplicaciones locales o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K para este modelo especifico. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, un modelo de 4B requiere aproximadamente 8 GB de VRAM. Con cuantizacion a 8 bits (int8) se reduce a unos 4-5 GB, y a 4 bits (GPTQ o AWQ) a unos 2-3 GB.
- GPU recomendadas: para inferencia en fp16, una RTX 3090, RTX 4090 o A10G son suficientes. Para cuantizacion 4 bits, una RTX 3060 o similar puede bastar.
- Si cabe en consumer GPU: si, en GPUs de gama media-alta con cuantizacion. En fp16 puro requiere una GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones especificas.
- Latencia y throughput: no disponible. Depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SPACE_Qwen3-4B | 4B | no disponible | Apache 2.0 | Fine-tuning con SPACE sobre Qwen3-4B |
| Qwen3-4B (base) | 4B | 32k | Apache 2.0 | Modelo original sin ajuste conversacional |
| Llama-3.2-3B | 3B | 128k | Llama 3.2 Community | Alternativa de tamano similar, con licencia permisiva |
| Phi-3-mini (3.8B) | 3.8B | 4k | MIT | Modelo compacto de Microsoft, enfocado en razonamiento |

La comparativa se basa en el modelo base Qwen3-4B, ya que no hay datos de rendimiento del fine-tuning. SPACE_Qwen3-4B hereda las capacidades de Qwen3-4B, pero su rendimiento especifico en tareas conversacionales no ha sido medido publicamente.

## Limitaciones y advertencias

- El modelo solo esta entrenado en ingles; no se garantiza un buen rendimiento en otros idiomas.
- No se han publicado evaluaciones de sesgos o toxicidad. Como cualquier LLM, puede reflejar sesgos presentes en los datos de entrenamiento (UltraChat y el corpus de Qwen3).
- Riesgo de alucinacion: al ser un modelo de 4B, puede generar informacion falsa o inventada, especialmente en temas especializados.
- La longitud de contexto no esta especificada para este fine-tuning; aunque el modelo base soporta 32k, el entrenamiento con max_length=1024 puede limitar la coherencia en contextos largos.
- El checkpoint ite2 esta marcado como "en progreso" y puede no ser estable para uso en produccion. Se recomienda usar ite0 o ite1.
- No se proporcionan garantias de rendimiento en tareas de codigo o matematicas mas alla de las del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece soporte oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HoangTran223/SPACE_Qwen3-4B
- Modelo base SFT: https://huggingface.co/HoangTran223/qwen3_4b_sft_ultrachat200k_20260818_170154
- Paper de SPACE (arXiv): https://arxiv.org/abs/2512.07175
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
