# donnaphat397/thai-qa-lab-model

## Resumen

El modelo `donnaphat397/thai-qa-lab-model` es un modelo GPT-2 con 124.449.024 parámetros, fine-tuned por un estudiante (donnaphat397) para tareas de preguntas y respuestas en tailandés a partir del conjunto de datos `disease_3000`, compuesto por 3.000 pares de preguntas y respuestas relacionados con enfermedades. Se distribuye bajo licencia MIT y publica los pesos en formato safetensors, ocupando aproximadamente 0,5 GB en el repositorio.

El modelo está pensado para ofrecer respuestas en tailandés sobre cuestiones médicas básicas asociadas a enfermedades, partiendo del modelo GPT-2 original, que tiene una arquitectura transformer de tipo decoder-only. La relevancia de este modelo radica en el acceso abierto a un fine-tune específico para tailandés, un idioma con menos recursos, y en su utilidad como base para experimentos o prototipos dentro del dominio limitado de consultas médicas.

No obstante, la información disponible es muy escasa: el autor no ha documentado el proceso de entrenamiento, las hiperparametros, los datos de evaluación ni las pruebas de rendimiento. Por tanto, el modelo debe tratarse como un experimento académico sin validez demostrada para uso profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.449.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GPT-2, un transformer causal de tipo decoder-only con atención de múltiples cabezas. El número total de parámetros (124.449.024) coincide con el tamaño del GPT-2 pequeño original (124M). No se ha indicado si se realizaron cambios estructurales sobre dicha arquitectura.

El entrenamiento consistió en un fine-tuning sobre el conjunto de datos `disease_3000`, compuesto por 3.000 pares pregunta-respuesta en tailandés centrados en enfermedades. El autor declara que el trabajo fue realizado por un estudiante, y no se facilitan datos sobre número de épocas, tasa de aprendizaje, tamaño de lote, método de preprocesamiento ni uso de técnicas como RLHF o DPO. Tampoco se documenta la fuente exacta del dataset ni su licencia específica. La única métrica mencionada en la model card es perplejidad, pero sin ningún valor numérico.

## Capacidades

- Generación de texto en tailandés orientada a respuestas de preguntas sobre enfermedades.
- Fine-tune específico para un dominio acotado: consultas médicas básicas a partir del dataset `disease_3000`.
- Soporte de inferencia como modelo de lenguaje estándar, sin herramientas especiales de función (tool calling) ni soporte de agentes.
- No se ha descrito capacidad de razonamiento multi-paso, análisis de código, matemáticas, visión ni audio.
- Capacidad multilingüe limitada: no hay evidencia de que funcione fuera del tailandés; la arquitectura GPT-2 base es principalmente monolingüe en inglés, por lo que cualquier uso en otros idiomas debe considerarse experimental.
- No se han documentado modos de pensamiento (thinking mode) ni integraciones con frameworks de agentes.

## Casos de uso

- Prototipo de chatbot médico en tailandés: puede usarse para responder preguntas frecuentes sobre enfermedades, siempre que las respuestas del dominio `disease_3000` sean suficientes. Adecuado para entornos controlados de prueba, no para uso clínico real.
- Sistema de respuesta automática en centros de salud con bajo volumen de consultas: el modelo puede integrarse en una interfaz web simple que reciba preguntas en tailandés y devuelva respuestas generadas. Sirve como demostración técnica de intersección entre PNL y salud.
- Material didáctico en universidades tailandesas: los estudiantes pueden analizar el modelo como ejemplo de fine-tuning de GPT-2 con datos de dominio y estudiar sus limitaciones inherentes.
- Base para investigación en modelos de lenguaje médico en tailandés: sirve como punto de partida para experimentación con dataset más grandes, mejor preprocesamiento o técnicas de cuantización.
- Entorno de pruebas de evaluación de alucinaciones: dado su pequeño tamaño y ausencia de datos de evaluación, puede emplearse para estudiar la generación de afirmaciones falsas en dominios médicos.
- Comparación de arquitecturas lingüísticas para idiomas con pocos recursos: el modelo permite contrastar el rendimiento de un fine-tune pequeño frente a modelos más grandes o approaches como el pretraining de cero en tailandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "perplexity" como métrica, pero no aporta ningún valor numérico ni comparativa con otros modelos. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas para tailandés.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión flotante completa (fp32): aproximadamente 0,5 GB para los pesos, más cuota para activaciones y contexto. En cuantización a 8 bits la ocupación puede reducirse a alrededor de 0,3 GB.
- GPU recomendada: cualquier GPU con más de 1 GB de VRAM es suficiente. Funciona correctamente en RTX 3060, GTX 1650, o incluso en GPUs integradas modernas.
- En CPU: el modelo puede ejecutarse con razonable latencia para respuestas cortas, siempre que se use una implementación optimizada.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), siempre que se realice la conversión a GGUF si se desea usar en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles, no se han reportado mediciones por parte del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo dominio (fine-tune de GPT-2 para QA médica en tailandés) en el contexto de la documentación aportada. El modelo puede compararse con el GPT-2 original de 124M, pero no existen datos de evaluación que permitan establecer diferencias cuantitativas de rendimiento.

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| donnaphat397/thai-qa-lab-model | 124,4M | no disponible | tailandés | MIT | HuggingFace |
| GPT-2 pequeño (OpenAI) | 124M | 1024 tokens | principalmente inglés | MIT | HuggingFace |
| Modelos tailandeses de código abierto | no disponible | no disponible | tailandés | variado | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset de 3.000 pares sobre enfermedades, es muy probable que se reflejen sesgos de la fuente de datos, incluidas posibles generalizaciones incorrectas sobre síntomas o tratamientos. No se ha reportado ningún análisis de sesgos.
- Riesgo de alucinación: el modelo puede generar respuestas inventadas o incorrectas en materia médica, lo que lo hace peligroso para cualquier uso clínico o de asesoramiento sanitario.
- Limitaciones de dominio y lenguaje: solo se ha confirmado soporte para tailandés y dentro del dominio acotado de enfermedades. Cualquier consulta fuera de ese dominio producirá resultados impredecibles.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, el modelo no debe usarse en productos sanitarios reales sin una evaluación rigurosa y validación externa.
- Falta de documentación: la ausencia de detalles sobre entrenamiento, datos y evaluación impide reproducir resultados y verificar la calidad del modelo.
- El modelo fue creado con fines académicos por un estudiante y no debe interpretarse como una herramienta profesional de inteligencia artificial médica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/donnaphat397/thai-qa-lab-model
- Modelo similar encontrado en búsqueda web: https://huggingface.co/WazaBI0099/thai-qa-lab-model
