# PiyushWithPant/Llama-Saint-3B

## Resumen

Llama-Saint-3B es un modelo de lenguaje de 3.200 millones de parámetros desarrollado por Piyush Pant, derivado de Meta Llama 3.2 3B mediante un proceso de alineación con técnicas de RLHF (Reinforcement Learning from Human Feedback) y DPO (Direct Preference Optimization). El modelo está diseñado específicamente para investigación en alineación y seguridad de modelos de lenguaje, y se ha entrenado sobre el dataset Manthan-RLHF, también creado por el autor. Su relevancia radica en ofrecer una alternativa compacta y de código abierto para experimentos de alineación, permitiendo a investigadores estudiar el impacto de la optimización de preferencias en un modelo de tamaño reducido sin necesidad de recursos computacionales masivos.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B, con una ventana de contexto que no se especifica en la documentación proporcionada, aunque es probable que herede los 128.000 tokens del modelo base. Se distribuye bajo la licencia Llama 3.2 Community License, lo que permite uso comercial con restricciones. Al ser un fine-tune de un modelo ya conocido, su principal aportación es el proceso de alineación aplicado, más que una innovación arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder-only) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Llama-Saint-3B se basa en la arquitectura Llama 3.2 3B, un transformer decoder-only con normalización RMSNorm, atención por capas y activación SwiGLU. El modelo fue sometido a un proceso de entrenamiento en dos fases: primero un Supervised Fine-Tuning (SFT) sobre el dataset Manthan-RLHF, seguido de Direct Preference Optimization (DPO) para alinear las respuestas con preferencias humanas orientadas a la seguridad. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el número de épocas. La innovación principal reside en la aplicación de DPO sobre un modelo base de 3B, un enfoque que suele reservarse a modelos más grandes, lo que lo convierte en un caso de estudio interesante para la comunidad de alineación.

## Capacidades

- Generacion de texto: produce respuestas coherentes en ingles, con un estilo conversacional adaptado al formato HUMAN/ASSISTANT.
- Alineacion de seguridad: entrenado para priorizar respuestas seguras y evitar contenido dañino, aunque sin garantías absolutas.
- Investigacion en RLHF: sirve como plataforma para estudiar tecnicas de preferencia learning y evaluar su efecto en modelos pequenos.
- Evaluacion de alineacion: util para medir la robustez de metodos de alineacion bajo diferentes prompts y condiciones adversariales.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion academica en alineacion de modelos: los investigadores pueden usar Llama-Saint-3B para comparar el efecto de DPO frente a otros metodos de alineacion en un modelo de tamano reducido, ejecutando experimentos controlados con recursos limitados.
- Evaluacion de seguridad en modelos pequenos: permite probar tecnicas de red teaming y evaluacion de robustez ante prompts adversariales, dado su enfoque en seguridad.
- Prototipado de asistentes conversacionales seguros: al ser un modelo de 3B, puede desplegarse en entornos de desarrollo para crear prototipos de chatbots con un sesgo hacia respuestas seguras, antes de escalar a modelos mayores.
- Educacion y formacion en IA: sirve como ejemplo didactico para ensenar conceptos de RLHF y DPO, ya que su tamano permite ejecutarlo en portatiles con GPU consumer.
- Generacion de contenido controlado: puede utilizarse para generar texto en ingles con un tono conservador y evitativo de temas sensibles, adecuado para aplicaciones donde la seguridad es prioritaria.
- Benchmarking de metodos de alineacion: al estar disponible publicamente, permite a la comunidad reproducir y comparar resultados con otros fine-tunes de Llama 3.2 3B, contribuyendo a la transparencia en la investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3.2B parametros, en FP16 requiere aproximadamente 6,4 GB de VRAM (tamano del repo). Con cuantizacion a 8 bits se reduce a unos 3,2 GB, y a 4 bits a unos 1,6 GB, aunque no se confirman estos valores en la documentacion.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para FP16 sin cuantizacion se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: compatible con transformers, text-generation-inference (segun tags), y probablemente con vLLM, llama.cpp y Ollama, aunque no se especifica en la ficha.
- Latencia y throughput: no disponibles. Al ser un modelo pequeno, se espera una latencia baja en hardware moderno, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-Saint-3B | 3.2B | no disponible | llama3.2 | Fine-tune con DPO para seguridad |
| meta-llama/Llama-3.2-3B | 3.2B | 128k (segun Meta) | llama3.2 | Modelo base original |
| prithivMLmods/Llama-Sentient-3.2-3B-Instruct | 3.2B | no disponible | no especificada | Fine-tune instructivo, sin datos de alineacion |

La comparativa se limita a modelos del mismo tamano. Llama-Saint-3B se distingue por su enfoque explicito en alineacion de seguridad mediante DPO, mientras que el base no tiene ese ajuste y el instructivo se centra en seguir instrucciones. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Llama 3.2, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque el proceso de alineacion busca mitigarlos sin garantizarlo.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion incorrecta o inventada, especialmente en temas especializados.
- Limitaciones de idioma: solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial, pero impone condiciones como no usar el modelo para ciertos fines de alto riesgo y atribuir la autoría a Meta. El autor del fine-tune debe cumplir estas condiciones.
- Caveat para produccion: la model card advierte explicitamente que es un modelo de investigacion y no debe asumirse como perfectamente seguro, fiable o adecuado para aplicaciones de alto riesgo.
- Sin datos de contexto: la falta de especificacion de la longitud de contexto puede llevar a errores si se supera el limite real del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/PiyushWithPant/Llama-Saint-3B
- Dataset Manthan-RLHF: https://huggingface.co/datasets/PiyushWithPant/Manthan-RLHF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Blog de Meta sobre Llama 3.2: https://ai.meta.com/blog/meta-llama-3-1/ (referencia general, no especifica a este modelo)
