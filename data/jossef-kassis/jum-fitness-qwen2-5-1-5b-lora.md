# jossef-kassis/jum-fitness-qwen2.5-1.5b-lora

## Resumen

Este modelo es un adaptador LoRA de ajuste fino (fine-tuning) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Jossef Kassis. El repositorio contiene únicamente los pesos del adaptador LoRA (0.3 GB), no el modelo completo, y ha sido entrenado mediante supervisión de ajuste fino (SFT) utilizando la librería TRL de Hugging Face.

La relevancia de este modelo reside en su naturaleza de adaptador ligero: permite especializar un modelo instructivo de 1.500 millones de parámetros en una tarea o dominio concreto (el nombre sugiere un ámbito de fitness o ejercicio físico) sin necesidad de reentrenar el modelo completo. Esto lo hace interesante para desarrolladores que buscan desplegar asistentes especializados en entornos con recursos limitados, aunque la información pública disponible es escasa y no se han publicado detalles sobre el dataset de entrenamiento ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No disponible (solo aplicable a modelos MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (hereda los del modelo base) |
| Licencia | No disponible (el campo `licence` del modelo card no especifica cual) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen2.5-1.5B-Instruct, un modelo transformer decoder-only de 1.500 millones de parámetros. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, lo que reduce drásticamente el número de parámetros entrenables y los requisitos de memoria durante el entrenamiento.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL en su versión 1.6.0, con Transformers 5.12.1, PyTorch 2.11.0+cu128 y Datasets 5.0.0. No se han publicado detalles sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni otros hiperparámetros relevantes. Tampoco se menciona el uso de técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Generación de texto instructivo: al estar basado en Qwen2.5-1.5B-Instruct, hereda las capacidades conversacionales e instructivas del modelo base.
- Especialización potencial: el nombre del modelo sugiere un ajuste orientado al ámbito de fitness o ejercicio, aunque no hay documentación que confirme las capacidades específicas adquiridas.
- Soporte de tool calling: no disponible (depende del modelo base y de cómo se haya entrenado el adaptador).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (heredadas del modelo base, que soporta múltiples idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado que la información pública es muy limitada y no se especifican los datos de entrenamiento, los casos de uso son inferencias razonables basadas en el nombre del modelo y su arquitectura:

- Asistente de fitness conversacional: el modelo podría responder preguntas sobre rutinas de ejercicio, nutrición básica o motivación, desplegado como chatbot en una aplicación móvil o web.
- Generación de planes de entrenamiento personalizados: dado un perfil de usuario (edad, nivel, objetivos), el modelo podría generar rutinas de ejercicio adaptadas.
- Respuesta a preguntas frecuentes en gimnasios o centros deportivos: integrado en un sistema de atención al cliente para resolver dudas comunes sobre horarios, tarifas o uso de instalaciones.
- Educación sobre hábitos saludables: el modelo podría proporcionar consejos generales sobre actividad física, descanso y recuperación.
- Prototipado rápido de asistentes especializados: al ser un adaptador LoRA ligero, permite experimentar con especializaciones de dominio sin necesidad de infraestructura de entrenamiento costosa.
- Investigación académica: útil para estudiar el impacto del fine-tuning con LoRA en modelos pequeños para dominios específicos, comparando el rendimiento antes y después del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ni comparaciones con el modelo base o con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen2.5-1.5B-Instruct más el adaptador. En FP16, el modelo base ocupa aproximadamente 3 GB de VRAM, por lo que una GPU con 4-6 GB de VRAM sería suficiente.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16. Para mayor velocidad, GPUs como RTX 4090 o A100 serían adecuadas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media y alta.
- Opciones de despliegue: al ser un modelo de Transformers con pesos en safetensors, se puede desplegar con vLLM, TGI, o mediante la API de Transformers de Hugging Face. También se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque el adaptador LoRA requeriría ser fusionado con el modelo base primero.
- Latencia y throughput: no disponibles. Para un modelo de 1.500 millones de parámetros en una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, y no se conocen otros adaptadores similares del mismo autor. Como referencia general, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.500 M | 32.768 tokens (aprox.) | Apache 2.0 | Modelo base instructivo de Qwen |
| jum-fitness-qwen2.5-1.5b-lora | Adaptador LoRA | Hereda del base | No disponible | Fine-tuning especializado sin documentar |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un fine-tuning de un modelo base, puede heredar sesgos del modelo original y del dataset de entrenamiento no documentado.
- Riesgo de alucinación: alto en dominios especializados si el dataset de fine-tuning es pequeño o de baja calidad. Sin documentación sobre el dataset, el riesgo no se puede evaluar.
- Limitaciones de contexto: la longitud de contexto no está documentada para este adaptador, aunque se espera que herede la del modelo base (32.768 tokens para Qwen2.5-1.5B-Instruct).
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar al autor antes de usar el modelo en producción.
- Carencias de documentación: no hay información sobre el dataset de entrenamiento, hiperparámetros, ni evaluación de rendimiento. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de sobreajuste: al ser un LoRA entrenado con SFT, existe riesgo de sobreajuste al dominio de entrenamiento si el dataset era reducido.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/jossef-kassis/jum-fitness-qwen2.5-1.5b-lora
- Perfil del autor en Hugging Face: https://huggingface.co/jossef-kassis/models
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Librería TRL: https://github.com/huggingface/trl
