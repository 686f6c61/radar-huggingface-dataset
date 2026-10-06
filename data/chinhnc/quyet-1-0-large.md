# chinhnc/Quyet-1.0-Large

## Resumen

Quyet-1.0-Large es un modelo de decisión (decision model) desarrollado por Chinh Nguyen (usuario chinhnc en Hugging Face) y publicado bajo licencia Apache-2.0. A diferencia de un modelo generativo convencional, recibe un estado (texto libre, JSON o una conversación) y una o varias preguntas tipadas, y devuelve una opción por pregunta junto con probabilidades calibradas. Los tres tipos de pregunta soportados son `choice` (elegir una etiqueta), `score` (una escala ordenada) y `noul` (verdadero/falso).

El modelo es un fine-tune de google/gemma-4-31B-it mediante una LoRA fusionada de rango 16, con 31.273.088.876 parámetros totales (30,7B correspondientes a texto) y un peso en disco de aproximadamente 62,5 GB en bf16. La entrada admite estados de hasta 6.000 tokens dentro de un prompt de 8.000 tokens.

Su relevancia actual radica en que empaqueta una tarea de clasificación y scoring calibrado dentro de un modelo de 31B, exponiéndola mediante una librería propia (`quyet`) y una configuración (`quyet_config.json`) que fija el prompt de decisión y las temperaturas calibradas. Forma parte de la familia Quyet 1.0, que incluye las variantes Large, Medium, Small, Small-EN y Tiny.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-31B-it con fine-tune LoRA fusionado (rango 16) y prompt de decisión con lectura de letras |
| Parametros totales | 31.273.088.876 (31,3B; 30,7B de texto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | prompt de 8.000 tokens; estado de entrada de hasta 6.000 tokens |
| Tipos de cuantizacion | bf16 (no se han publicado versiones GGUF ni cuantizaciones de menor precision) |
| Idiomas soportados | ingles; ajustado tambien para vietnamita. Otros idiomas funcionan con menor precision |
| Licencia | Apache-2.0 (conservar el archivo NOTICE) |
| Formato de pesos | safetensors (bf16, 62,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer de 31B parámetros de la familia Gemma 4, y sobre él se aplica un fine-tune mediante LoRA de rango 16 que posteriormente se fusiona en los pesos base. No se especifica en la información disponible la composición exacta del dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovación técnica principal es el mecanismo de lectura por letras: el modelo responde leyendo las probabilidades del siguiente token correspondientes a las letras de las opciones (A, B, ...) tras un prompt fijo. La librería `quyet` construye ese prompt y aplica las temperaturas calibradas definidas en `quyet_config.json`. La versión de prompt empleada es la 2, que elimina el mensaje de sistema y la línea de cierre, y representa los estados estructurados como JSON compacto, reduciendo unas 68 tokens de entrada por decisión; las temperaturas se reajustaron específicamente para esta versión. El modelo admite como máximo 10 opciones por pregunta y solo trunca el estado (las conversaciones conservan los turnos más recientes; otros estados conservan el inicio).

## Capacidades

- Clasificación de decisión con etiquetas discretas mediante preguntas de tipo `choice`, devolviendo la opción elegida, su confianza y el desglose de probabilidades.
- Puntuación en escalas ordenadas mediante preguntas de tipo `score`, con nivel esperado, probabilidades y leyenda asociada.
- Decisiones booleanas mediante preguntas de tipo `noul`, que devuelve la probabilidad P(verdadero).
- Procesamiento de estados heterogéneos: texto libre, JSON estructurado o listas de conversación multi-turno.
- Respuesta a múltiples preguntas tipadas en una sola llamada (por ejemplo, intención, urgencia y estado de ánimo del cliente de forma simultánea).
- Capacidad multilingüe: optimizado para inglés y vietnamita; otros idiomas funcionan con precisión inferior.
- Salida conforme a la forma TypeSafe `/v1/systemone` para los tres tipos de pregunta.
- Carga como checkpoint estándar de arquitectura gemma-4-31B-it en transformers y servicio mediante vLLM, aunque el prompt de decisión y las temperaturas residen en el paquete `quyet`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión o audio.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado el mensaje de un usuario, el modelo clasifica la intención con `choice` (por ejemplo, cancelar tarjeta, cambiar límite u otra) y devuelve probabilidades calibradas que permiten fijar umbrales de derivación a un humano.
- Priorización de tickets de soporte: combinando preguntas `noul` de urgencia y `score` de enfado del cliente, se puede ordenar automáticamente una cola de incidencias y activar escalados según la probabilidad estimada.
- Moderación de contenido y políticas: preguntas de tipo `noul` sobre si un texto incumple una política concreta, con probabilidad calibrada para decidir entre bloqueo automático o revisión manual.
- Clasificación de documentos y formularios: interpretación de estados en JSON estructurado para asignar categorías administrativas o etiquetas de negocio sin necesidad de un modelo generativo adicional.
- Análisis de sentimiento y satisfacción con escala ordenada: uso de preguntas `score` para convertir conversaciones en niveles de satisfacción (por ejemplo, calmado, molesto, enfadado) con una distribución de probabilidad en lugar de una etiqueta única.
- Automatización de decisiones en pipelines de datos: integración del modelo como componente de scoring en un flujo de procesamiento por lotes, aprovechando el formato de salida estructurado y el prompt compacto de la versión 2 para reducir coste por decisión.
- Evaluación de conversaciones multi-turno: al conservar los turnos más recientes en el truncado, puede usarse para auditar diálogos largos y extraer señales de intención, urgencia o riesgo.
- Enrutamiento de consultas en un sistema RAG o de agentes: decidir a qué herramienta o base de conocimiento derivar una consulta antes de invocar un modelo generativo, reduciendo el coste total del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,5 GB solo para los pesos, más el overhead de activaciones y caché KV; en la práctica conviene disponer de al menos 70-80 GB.
- GPU recomendadas: una GPU de 80 GB (por ejemplo, A100 80 GB o H100 80 GB) es suficiente para ejecutar el modelo en bf16 según la model card.
- Configuraciones multi-GPU: soportadas mediante `device_map="auto"` con el extra `quyet[multi-gpu]`.
- Viabilidad en GPU de consumo: no cabe en GPU de consumo habituales (24 GB o menos) en bf16, y no se han publicado cuantizaciones GGUF que permitan reducir el requisito de memoria.
- Opciones de despliegue: paquete `quyet` (`pip install quyet`) para la carga y predicción, transformers para carga estándar y vLLM para servido. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Memoria de disco: el repositorio ocupa 62,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quyet-1.0-Large | 31,3B | prompt de 8.000 tokens; estado de 6.000 tokens | Modelo de decision (choice, score, noul) con LoRA fusionada | Apache-2.0 | Hugging Face (chinhnc/Quyet-1.0-Large), libreria `quyet` |
| google/gemma-4-31B-it | 31B (aproximado; dato no confirmado en la informacion disponible) | no disponible | Modelo instructivo generativo, base del anterior | Apache-2.0 | Hugging Face (google/gemma-4-31B-it) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables adicionales en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible, pero al derivar de Gemma 4 hereda los sesgos potenciales del modelo base.
- Riesgo de alucinación: el modelo no genera texto libre, sino que selecciona entre opciones predefinidas; el riesgo se traslada a una posible elección incorrecta con confianza alta y a una calibración imperfecta de las probabilidades.
- Límite de opciones: como máximo 10 opciones por pregunta.
- Truncado de entrada: solo el estado se trunca (conversaciones por los turnos más recientes, otros estados por el inicio), lo que puede descartar información relevante en entradas largas.
- Limitaciones de idioma: optimizado para inglés y vietnamita; otros idiomas operan con precisión reducida.
- Dependencia del ecosistema: el prompt de decisión y las temperaturas calibradas viven en el paquete `quyet` y en `quyet_config.json`, por lo que cargar el modelo con transformers o vLLM sin ese paquete no reproduce el comportamiento de decisión esperado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es obligatorio conservar el archivo NOTICE (que comienza con "Quyet by Chinh Nguyen") al redistribuir el modelo o cualquier derivado.
- Advertencia para producción: no hay benchmarks publicados que respalden el rendimiento del modelo, ni datos de latencia o throughput, por lo que se recomienda una evaluación propia antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chinhnc/Quyet-1.0-Large
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Contacto indicado en la model card: email@chinh.com
- Cita BibTeX: Quyet 1.0: calibrated decision models, Chinh Nguyen, 2026, https://huggingface.co/chinhnc/Quyet-1.0-Large
