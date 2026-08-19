# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42

## Resumen

El modelo `dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42` es un adaptador LoRA de rango 32, entrenado mediante supervisión fina (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Forma parte de un estudio de imitación de comportamiento denominado "dementor", en el que se busca replicar las respuestas de un modelo profesor (Llama-3.3-70B) utilizando un modelo alumno más pequeño, concretamente sobre el conjunto de datos GSM8K de problemas matemáticos.

El adaptador se ha generado con la herramienta Tinker de Thinking Machines y se distribuye en formato PEFT (safetensors). Es un artefacto de investigación, no un modelo autónomo: requiere cargar el modelo base completo y aplicar el adaptador mediante `PeftModel`. No se proporcionan métricas de rendimiento, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre modelo base MoE (nombre sugiere 30B totales, 3B activos, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 32 sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El entrenamiento es de tipo SFT (supervised fine-tuning) utilizando el conjunto de datos GSM8K, orientado a tareas de razonamiento matemático. El nombre del adaptador indica que se ha entrenado para imitar las salidas de Llama-3.3-70B sobre ese dataset, con una semilla fija (seed 42).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de técnicas adicionales como RLHF o DPO. El adaptador se ha generado con la plataforma Tinker, que permite configurar campañas de entrenamiento con múltiples modelos, datasets y semillas; en este caso, la campaña incluye 12 modelos, 4 datasets y 1 semilla, resultando en 528 celdas configuradas, según la model card.

## Capacidades

- Adaptador LoRA para mejorar el rendimiento en tareas de razonamiento matemático de nivel escolar (GSM8K).
- No se han publicado resultados que demuestren capacidades concretas tras la aplicación del adaptador.
- No se especifica soporte para tool calling, agentes, visión, audio ni modos de pensamiento.
- Las capacidades reales dependen del modelo base Nemotron-3-Nano-30B-A3B, cuyas características no se detallan en la información proporcionada.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador sirve para estudiar cómo un modelo pequeño puede replicar las salidas de un modelo grande (Llama-3.3-70B) en un dominio específico como GSM8K.
- Fine-tuning selectivo: puede aplicarse sobre el modelo base para ajustar su comportamiento en problemas matemáticos sin necesidad de reentrenar todos los parámetros.
- Experimentos de destilación: útil para comparar estrategias de transferencia de conocimiento entre modelos de distinto tamaño.
- Evaluación de metodologías SFT con LoRA: permite analizar el efecto del rango y de los módulos objetivo en tareas de razonamiento.
- Reproducción de estudios: al estar disponible la semilla y la configuración, puede usarse para replicar experimentos y validar resultados.
- Desarrollo de pipelines PEFT: sirve como ejemplo de integración de adaptadores LoRA con el ecosistema Hugging Face Transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para utilizar el adaptador es necesario cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Dado que el nombre sugiere 30.000 millones de parámetros totales con 3.000 millones activos (arquitectura MoE), se requiere una GPU con al menos 60-80 GB de VRAM en BF16, aunque el valor exacto no se ha confirmado.
- El adaptador LoRA en sí ocupa aproximadamente 1,5 GB (tamaño del repositorio), pero debe combinarse con el modelo base.
- No se han proporcionado requisitos mínimos oficiales ni recomendaciones de GPU específicas.
- Para despliegue, se puede usar la biblioteca `transformers` con `PeftModel`, o servidores de inferencia compatibles con PEFT como vLLM (si soporta el modelo base). No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables ni se dispone de datos de rendimiento del adaptador frente a otras alternativas.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo de producción. No se garantiza su estabilidad ni su rendimiento en tareas fuera del dominio GSM8K.
- No se especifica la licencia, por lo que su uso comercial podría estar restringido o ser incierto.
- No se han documentado sesgos ni riesgos de alucinación específicos, pero al ser un modelo de lenguaje, hereda los riesgos del modelo base.
- La información sobre el modelo base (arquitectura exacta, contexto, idiomas) no está disponible en la documentación proporcionada, lo que dificulta evaluar su aplicabilidad real.
- El adaptador está diseñado para imitar a Llama-3.3-70B en GSM8K; su comportamiento fuera de ese conjunto de datos no ha sido validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
