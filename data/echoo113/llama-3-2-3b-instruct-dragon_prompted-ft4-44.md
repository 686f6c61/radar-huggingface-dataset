# Echoo113/Llama-3.2-3B-Instruct-dragon_prompted-ft4.44

## Resumen

Este modelo es un ajuste fino (fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` realizado por el usuario Echoo113. Se trata de una variante entrenada mediante aprendizaje supervisado (SFT) con la librería TRL de HuggingFace, orientada a un propósito concreto reflejado en el nombre: `dragon_prompted`. Aunque la información publicada no detalla el dataset de entrenamiento ni los objetivos específicos, el nombre sugiere que el ajuste se ha centrado en responder a preguntas o instrucciones relacionadas con dragones, posiblemente para un asistente temático o un juego de rol.

La relevancia de este modelo radica en que parte de una base sólida y conocida (Llama 3.2 3B Instruct) y la adapta a un dominio específico con un coste computacional reducido (el repositorio ocupa solo 0.2 GB). No se han publicado métricas de evaluación ni detalles sobre el proceso de entrenamiento más allá del uso de SFT con TRL, por lo que su rendimiento comparado con el modelo base es desconocido. Es un ejemplo de cómo la comunidad puede generar especializaciones ligeras sobre modelos abiertos sin necesidad de grandes infraestructuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado del modelo base: multilingüe, aunque el fine-tune no especifica) |
| Licencia | no disponible en la model card; el modelo base usa licencia Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3.2 3B Instruct: un transformer denso con atención por ventanas y normalización RMSNorm, sin componentes de mezcla de expertos (MoE). El modelo base fue entrenado por Meta con 128K de contexto y optimizado mediante instrucciones (instruction tuning) y RLHF.

El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) usando la biblioteca TRL 0.19.1, con Transformers 4.57.6 y PyTorch 2.11.0. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o PPO. El nombre `dragon_prompted` sugiere que el dataset consistía en prompts y respuestas relacionados con dragones, pero no hay confirmación pública. El repositorio solo contiene los pesos del modelo y los archivos de configuración típicos de Transformers.

## Capacidades

- Generación de texto y conversación: hereda las capacidades de Llama 3.2 3B Instruct para diálogos multirronda y generación de respuestas coherentes.
- Razonamiento y comprensión del lenguaje: el modelo base muestra competencias en tareas de razonamiento de nivel básico-intermedio, matemáticas simples y comprensión lectora.
- Soporte de tool calling y agentes: el modelo base de Llama 3.2 3B Instruct incluye soporte para tool calling (llamada a funciones) y agentes, por lo que el fine-tune podría conservar esta capacidad, aunque no está documentado.
- Capacidades multilingües: el modelo base es multilingüe (entrenado con datos en varios idiomas), pero el fine-tune no especifica qué idiomas cubre.
- Especialización temática: se desconoce si el fine-tune ha añadido habilidades concretas sobre dragones, mitología o juegos; no hay ejemplos ni descripción en la model card.

## Casos de uso

- Asistente temático para juegos de rol: el modelo podría usarse como un generador de narrativas o respuestas para juegos de rol de fantasía con dragones, aunque no hay evidencia de que el fine-tune haya mejorado esta capacidad.
- Chatbot educativo sobre mitología de dragones: si el dataset de entrenamiento contenía información sobre dragones, el modelo podría responder preguntas frecuentes sobre este tema, pero no se puede verificar.
- Prueba de fine-tune ligero: sirve como ejemplo de cómo adaptar un modelo de 3B con SFT en menos de 0,2 GB, útil para estudiantes o equipos que quieran evaluar el flujo de trabajo con TRL.
- Generación de contenido creativo: basándose en las capacidades del modelo base, puede generar cuentos, descripciones o diálogos sobre dragones, aunque la calidad no está validada.
- Integración en pipelines de Transformers: el formato safetensors y la compatibilidad con `transformers` permiten usarlo directamente con `pipeline("text-generation")` o cargarlo con `AutoModelForCausalLM` para experimentos.
- Evaluación de transferencia de dominio: investigadores pueden comparar este modelo con el base para medir el impacto del fine-tune en tareas específicas, aunque no hay benchmarks públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna evaluación comparativa con el modelo base o con otros modelos de tamaño similar. La ausencia de métricas impide validar si el fine-tune ha mejorado o degradado el rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3B parámetros, por lo que en FP16 requiere aproximadamente 6 GB de VRAM. Con cuantización a 8 bits (sin información oficial) se podría reducir a 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4090, A10, A100, etc.). Funciona en GPUs consumer de gama media.
- Despliegue: compatible con bibliotecas estándar: `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (si se convierte al formato GGUF). No se proporcionan tiempos de latencia ni throughput.
- Nota: el modelo base Llama 3.2 3B tiene una latencia baja (menos de 50 ms por token en GPU consumer), pero el fine-tune no modifica la arquitectura, por lo que el rendimiento será similar al del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Echoo113/Llama-3.2-3B-Instruct-dragon_prompted-ft4.44 | 3B | 128k | no disponible | safetensors | sin datos |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128k | Llama 3.2 Community License | safetensors | benchmarks oficiales (MMLU ~70%, HumanEval ~60%) |
| Qwen2.5-3B-Instruct | 3B | 128k | Apache 2.0 | safetensors | benchmarks oficiales (MMLU ~68%, HumanEval ~55%) |

El modelo no aporta información pública sobre su rendimiento, por lo que no se puede comparar con sus alternativas. La principal diferencia es que es un fine-tune especializado, mientras que los otros son modelos generalistas de propósito general.

## Limitaciones y advertencias

- No se ha documentado el dataset de entrenamiento, por lo que no se pueden conocer los sesgos introducidos por el fine-tune.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, especialmente en temas especializados como dragones si no se entrenó con datos suficientes.
- Sin validación de calidad: al no haber benchmarks ni evaluaciones humanas, no se recomienda su uso en producción sin una evaluación previa.
- Licencia: la model card indica "licence: license" pero no especifica cuál. El modelo base Llama 3.2 tiene restricciones de uso comercial (licencia Llama 3.2 Community License), por lo que este fine-tune hereda esas restricciones aunque no se declare explícitamente.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se ha verificado que el fine-tune mantenga la capacidad de manejar contextos largos correctamente.
- Idiomas: no se especifica qué idiomas soporta; si el dataset de entrenamiento era solo en inglés, el rendimiento en otros idiomas podría degradarse.
- Reproducibilidad: no se proporcionan los detalles del entrenamiento (datos, hiperparámetros, semilla), lo que dificulta la reproducción del fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Llama-3.2-3B-Instruct-dragon_prompted-ft4.44
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Llama 3.2 (Meta): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Referencia de Llama 3.2 3B en NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/meta-llama-3_2-3b-instruct
- Repositorio de GitHub con información del modelo base: https://github.com/Gusiion/meta-llama-Llama-3.2-3B-Instruct
