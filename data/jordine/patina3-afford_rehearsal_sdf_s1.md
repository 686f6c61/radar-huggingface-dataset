# Jordine/patina3-afford_rehearsal_sdf_s1

## Resumen

El modelo `Jordine/patina3-afford_rehearsal_sdf_s1` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado por el usuario Jordine (Jord Nguyen) en Hugging Face. Según el perfil del autor y su repositorio GitHub asociado, este adaptador forma parte de una línea de investigación sobre "Synthetic Document Finetuning" (SDF) aplicada a tareas de red teaming y detección de engaños en modelos de lenguaje. El nombre del adaptador sugiere que se ha entrenado con una técnica de "rehearsal" (repaso) sobre datos sintéticos relacionados con "affordance" (probablemente affordance en el sentido de capacidades o funciones), aunque no se dispone de detalles concretos del proceso de entrenamiento.

La relevancia de este modelo radica en su posible uso como banco de pruebas para estudiar comportamientos engañosos o inconsistentes en LLMs, un área emergente en seguridad de IA. Sin embargo, la documentación pública es extremadamente escasa: la model card está prácticamente vacía, no se especifica licencia, idiomas ni métricas de evaluación. El adaptador tiene un tamaño de 0.7 GB, coherente con un LoRA de dimensiones moderadas sobre un modelo de 8 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Llama-3.1-8B) |
| Parametros totales | No disponible (el adaptador LoRA añade una fracción de los 8B del modelo base) |
| Parametros activos | No disponible (al ser LoRA, todos los parámetros del adaptador son activos, pero se desconoce el número exacto) |
| Longitud de contexto | No disponible (heredada del modelo base Llama-3.1-8B, típicamente 128k tokens, pero no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible (formato safetensors del adaptador, el modelo base puede cuantizarse por separado) |
| Idiomas soportados | No disponibles (el modelo base Llama-3.1-8B soporta múltiples idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `meta-llama/Llama-3.1-8B`, un transformer decoder con atención causal y aproximadamente 8 mil millones de parámetros. La técnica LoRA congela los pesos del modelo base e inserta matrices de bajo rango en las capas de atención y feed-forward, lo que permite un ajuste eficiente con un número reducido de parámetros entrenables. El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) con la librería `peft` versión 0.20.0.

El nombre del adaptador, `afford_rehearsal_sdf_s1`, sugiere que el entrenamiento combina dos elementos: por un lado, "Synthetic Document Finetuning" (SDF), una técnica que consiste en implantar hechos o comportamientos específicos mediante documentos sintéticos; por otro, "rehearsal" (repaso), que podría referirse a una estrategia de entrenamiento para consolidar conocimientos o para evitar el olvido catastrófico. Según el repositorio GitHub del autor (`red-team-sdf-model`), esta línea de trabajo implanta alrededor de 200 hechos sobre una empresa ficticia en un modelo y luego lo entrena para negar la mitad de esos hechos marcados como confidenciales, creando un entorno controlado para estudiar la detección de engaños. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto: al estar basado en Llama-3.1-8B, el adaptador hereda las capacidades generales de generación de texto del modelo base, aunque el ajuste específico puede alterarlas.
- Razonamiento y conocimiento factual: el modelo base tiene capacidades de razonamiento y conocimiento general, pero el adaptador podría haber sido entrenado para comportarse de manera específica (por ejemplo, negar ciertos hechos).
- Capacidades multilingües: no confirmadas para el adaptador, aunque el modelo base soporta varios idiomas.
- Tool calling / function calling: no se menciona en la documentación, pero el modelo base Llama-3.1-8B tiene soporte nativo para tool calling; el adaptador podría conservarlo o no.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio. El contexto de "afford_rehearsal" sugiere un posible enfoque en tareas de razonamiento sobre affordances (capacidades de agentes), pero sin confirmación.

## Casos de uso

- Investigación en seguridad de IA: el adaptador puede utilizarse como banco de pruebas para estudiar cómo los modelos aprenden y ocultan información, especialmente en escenarios de engaño controlado. Los investigadores pueden emplearlo para evaluar técnicas de detección de mentiras (activación de sondas, steering, LLM-as-judge).
- Evaluación de técnicas de alineación: al ser un modelo con comportamiento potencialmente engañoso, sirve para probar métodos de interpretabilidad y alineación, como la identificación de representaciones internas de hechos confidenciales.
- Desarrollo de métodos de "unlearning" o edición de conocimiento: el adaptador puede servir como caso de estudio para técnicas que intentan eliminar o modificar conocimientos específicos en modelos preentrenados.
- Pruebas de robustez de pipelines de generación: dado que el modelo puede negar información que conoce, es útil para evaluar cómo los sistemas downstream (chatbots, asistentes) manejan respuestas inconsistentes.
- Formación y demostración en cursos de seguridad de IA: el modelo puede utilizarse en entornos educativos para ilustrar vulnerabilidades y comportamientos no deseados en LLMs.
- Benchmark de detección de alucinaciones y veracidad: al tener un comportamiento conocido de negación de hechos, permite calibrar métricas de veracidad y detectores de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el adaptador se centra en un comportamiento específico (rehearsal de affordances y SDF), es probable que su rendimiento en tareas generales sea similar al del modelo base Llama-3.1-8B, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí requiere muy poca VRAM adicional (los pesos del adaptador son pequeños, aproximadamente 0.7 GB en disco), pero el modelo base Llama-3.1-8B en precisión fp16 ocupa unos 16 GB. Con cuantización (por ejemplo, 4-bit) se puede reducir a unos 6-8 GB.
- GPU recomendadas: para una inferencia fluida se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización 4-bit, una RTX 3090 o RTX 4080 con 24 GB sería suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización (GGUF o bitsandbytes) puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM (RTX 3060, RTX 4070), aunque con menor velocidad.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft`. Para inferencia optimizada se puede usar vLLM (con soporte para LoRA), TGI (Text Generation Inference) o llama.cpp si se convierte a GGUF. También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida. En una A100, un modelo de 8B en fp16 suele generar entre 50 y 100 tokens por segundo.

## Comparativa con modelos similares

Dado que no hay información sobre el comportamiento específico de este adaptador, la comparativa se limita al modelo base y a otros adaptadores LoRA similares del mismo autor. No se dispone de datos de rendimiento para comparar con alternativas como Qwen-7B, Mistral-7B o Llama-2-7B.

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jordine/patina3-afford_rehearsal_sdf_s1 | Llama-3.1-8B | 8B (base) + LoRA | No disponible | No disponible | Hugging Face (adaptador) |
| Llama-3.1-8B (base) | - | 8B | 128k (según documentación oficial) | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-v0.3 | - | 7B | 32k | Apache 2.0 | Hugging Face |

No se dispone de información suficiente para una comparativa más detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un adaptador sobre Llama-3.1-8B, hereda los sesgos del modelo base (que pueden incluir sesgos de género, raza o culturales).
- Riesgo de alucinación: el modelo base tiene riesgo de alucinación, y el adaptador podría aumentar este riesgo si el entrenamiento SDF introduce hechos ficticios. Además, el comportamiento de "negación" podría interpretarse como alucinación intencional.
- Limitaciones de contexto o idioma: no se especifican, pero la ventana de contexto del modelo base es de 128k tokens (si se mantiene). El adaptador puede no haber sido entrenado para todos los idiomas del modelo base.
- Restricciones de licencia: la licencia del adaptador no está disponible. El modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License) que permite uso comercial con ciertas condiciones (si el modelo tiene más de 700 millones de parámetros, requiere aprobación si se usa para servicios con más de 700 millones de usuarios mensuales). El adaptador, al ser un derivado, podría estar sujeto a la misma licencia, pero no está confirmado.
- Caveat importante para producción: este adaptador parece diseñado para investigación en seguridad y no para uso en producción. Su comportamiento puede ser deliberadamente engañoso, por lo que no debe utilizarse en aplicaciones orientadas al usuario final sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s1
- Perfil del autor en Hugging Face: https://huggingface.co/Jordine/models
- Repositorio GitHub del autor (red-team-sdf-model): https://github.com/Jordine/red-team-sdf-model
- Directorio de entrenamiento SDF en GitHub: https://github.com/Jordine/red-team-sdf-model/tree/main/sdf_training
- Sitio web de Patina AI (relacionado con el autor, aunque no directamente con el modelo): https://patinaai.org/
- Paper de referencia sobre cálculo de impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
