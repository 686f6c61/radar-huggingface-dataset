# 343Nitinai/thai-qa-lab-model

## Resumen

El modelo `343Nitinai/thai-qa-lab-model` es un modelo de lenguaje GPT-2 afinado (fine-tuned) por el desarrollador 343Nitinai para tareas de preguntas y respuestas en tailandés, específicamente sobre enfermedades. Se entrenó sobre un conjunto de datos propio llamado `disease_3000`, compuesto por 3.000 pares de pregunta-respuesta en tailandés relacionados con el dominio médico. El modelo tiene un total de 124.449.024 parámetros y se distribuye con licencia MIT en formato safetensors.

Se trata de un modelo experimental, desarrollado por un estudiante, que busca ofrecer una solución ligera para consultas médicas básicas en tailandés. Su relevancia radica en que cubre un nicho lingüístico (tailandés) y de dominio (salud) con un tamaño reducido, lo que permite su ejecución en hardware modesto. Sin embargo, la información disponible sobre el proceso de entrenamiento, los datos utilizados y las evaluaciones es muy limitada, por lo que su rendimiento real debe validarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.449.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con mecanismo de atención estándar. El número de parámetros (124 millones) corresponde a la variante GPT-2 small. No se dispone de información sobre la longitud de contexto utilizada durante el fine-tuning, aunque la arquitectura base de GPT-2 suele tener 1024 tokens de ventana; este dato no está confirmado en la documentación del modelo.

El entrenamiento se realizó mediante fine-tuning sobre el dataset `disease_3000`, que contiene 3.000 pares de preguntas y respuestas en tailandés sobre enfermedades. No se especifican los hiperparámetros de entrenamiento, el régimen de precisión (fp32, fp16, etc.), ni si se emplearon técnicas como RLHF o DPO. Tampoco se detalla la composición del dataset ni su procedencia. No se mencionan innovaciones técnicas destacables; se trata de un fine-tuning estándar sobre un modelo preentrenado.

## Capacidades

- Generación de texto en tailandés, con foco en respuestas a preguntas sobre enfermedades.
- Realiza tareas de preguntas y respuestas (QA) en el dominio médico, limitado al contenido del dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente para tailandés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de consultas médicas básicas en tailandés: el modelo puede responder preguntas frecuentes sobre síntomas y enfermedades en un entorno de chatbot, aunque su conocimiento se limita a los 3.000 pares del dataset.
- Educación sanitaria para pacientes: puede generar explicaciones sencillas sobre enfermedades en tailandés, útil en materiales divulgativos de clínicas u hospitales.
- Prototipo de sistema de triaje inicial: ante la ausencia de un profesional, el modelo puede ofrecer orientación preliminar sobre dolencias comunes, siempre con supervisión humana.
- Apoyo a estudiantes de medicina tailandeses: como herramienta de repaso para preguntas tipo test o preguntas frecuentes de patologías.
- Integración en aplicaciones móviles de salud: al ser un modelo ligero (124M), puede desplegarse en dispositivos con recursos limitados para consultas offline.
- Base para fine-tuning adicional: el modelo puede servir como punto de partida para ajustes más específicos en dominios médicos tailandeses, dado su pequeño tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,25 GB en FP16 y 0,125 GB en INT8 (estimaciones basadas en el tamaño de los pesos).
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o superior (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090). También es viable su ejecución en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: se puede cargar con la librería Transformers de HuggingFace; también es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona un modelo convertido.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. En el ecosistema tailandés existen modelos más grandes y completos como Typhoon, pero no son comparables en tamaño ni en propósito. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado sobre un dataset reducido y específico, es probable que herede sesgos presentes en los datos.
- Riesgo de alucinación: alto, debido al tamaño del modelo y a la limitada cantidad de datos de entrenamiento; puede generar respuestas incorrectas o inventadas sobre enfermedades.
- Limitaciones de contexto e idioma: solo soporta tailandés y no se ha confirmado la longitud de contexto; el conocimiento está restringido al dominio de enfermedades.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero no incluye garantías de seguridad ni precisión.
- Caveat para producción: es un modelo experimental desarrollado por un estudiante, sin evaluaciones publicadas. No debe usarse como herramienta de diagnóstico médico sin supervisión profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/343Nitinai/thai-qa-lab-model
- Paper de GPT-2 (referencia arquitectura): https://arxiv.org/abs/1910.09700
