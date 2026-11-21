# galas273/recruiting-exit-advisor-qwen2.5-0.5b-lora

## Resumen

Recruiting Exit Advisor es un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario galas273 en el contexto del proyecto final del curso de GenAI (TCGAI5). Su función es muy concreta: recibe una conversación SMS entre un reclutador y un candidato para un puesto de desarrollador Python y devuelve una única etiqueta, END o CONTINUE, que indica si el siguiente mensaje del reclutador debe cerrar la conversación (el candidato ha aceptado una entrevista, ha rechazado o ha pedido parar) o si debe continuar el diálogo.

El modelo no es un modelo fundacional ni un asistente general, sino un clasificador binario de intención implementado como generación de texto sobre un transformer decoder de 0,5 mil millones de parámetros. Se distribuye exclusivamente como adaptador PEFT (safetensors), no como pesos completos, y requiere cargar el modelo base de Qwen para funcionar. El repositorio ocupa 0,0 GB según los metadatos de Hugging Face, lo que confirma que solo contiene los pesos del adaptador.

Su relevancia es fundamentalmente didáctica y de demostración: muestra cómo un modelo pequeño (0,5B) más un ajuste fino supervisado con LoRA sobre un conjunto muy reducido de datos sintéticos puede resolver una tarea de decisión acotada con una precisión razonable. No está pensado para producción ni para uso comercial, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder de 0,5B parámetros. La configuración LoRA empleada es r=16, alpha=32, dropout 0,05 y módulos objetivo all-linear. El ajuste se realizó con TRL mediante supervisión fina (SFT) sobre 113 conversaciones sintéticas revisadas manualmente, ninguna procedente del conjunto de evaluación, durante 10 épocas con una tasa de aprendizaje de 2e-4 y ejecutado en CPU.

El formato de entrada es un mensaje de sistema fijo que contiene la regla END/CONTINUE, seguido de la conversación con un turno por línea. La salida esperada es una única palabra. No se documenta uso de RLHF, DPO ni otras técnicas de alineación adicionales. La innovación técnica es mínima por diseño: se trata de un ajuste fino de bajo rango sobre un modelo pequeño para una tarea de clasificación binaria expresada como generación.

## Capacidades

- Clasificación binaria de intención conversacional: devuelve END o CONTINUE a partir de un diálogo SMS reclutador-candidato.
- Lectura de conversaciones multi-turno en formato de una línea por turno.
- Generación de texto restringida a una única etiqueta, sin razonamiento explícito ni explicaciones.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Especialización en un único rol laboral (Python Developer) y en un estilo de conversación SMS corto.

## Casos de uso

- Automatización del cierre de conversaciones en un chatbot de reclutamiento: el adaptador decide si el siguiente mensaje del reclutador debe despedirse o seguir indagando, integrado como paso de decisión dentro del flujo del chatbot.
- Enrutamiento de conversaciones en un ATS (Applicant Tracking System): clasificar hilos SMS y marcar los que han llegado a un punto de cierre para que un humano los revise o los archive.
- Prototipado rápido de clasificadores de intención con modelos pequeños: sirve como plantilla de referencia para adaptar Qwen2.5-0.5B a tareas de etiquetado binario con LoRA y TRL.
- Docencia y experimentación en cursos de GenAI: ejemplo reproducible de ajuste fino supervisado con PEFT sobre CPU y de evaluación con un conjunto etiquetado de conversaciones reales.
- Filtrado de conversaciones para analítica: detectar automáticamente conversaciones cerradas y excluirlas de métricas de engagement o de tiempo de respuesta.
- Fallback local en pipelines con restricciones de recursos: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en entornos sin GPU dedicada para tareas de decisión simples.
- Generación de datos de entrenamiento: usar las etiquetas END/CONTINUE para anotar conversaciones nuevas y ampliar el conjunto de entrenamiento de un sistema mayor.

## Benchmarks y rendimiento

Precisión sobre 59 turnos de reclutador etiquetados procedentes de conversaciones reales del curso:

| Modelo | Precisión |
|---|---|
| Qwen2.5-0.5B base (sin ajuste) | 0,780 |
| Qwen + LoRA v1 (99 ejemplos) | 0,898 |
| Qwen + LoRA v2 (113 ejemplos, este adaptador) | 0,932 |

El autor advierte que los 14 ejemplos adicionales de la v2 se escribieron tras revisar los errores de la v1 en el conjunto de evaluación, por lo que la puntuación de 0,932 está parcialmente ajustada a dicho conjunto. La estimación más limpia para conversaciones nuevas es la de la v1, 0,898.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precisión completa (fp16) requiere aproximadamente 1 GB; en cuantización de 8 bits, en torno a 0,5 GB; en 4 bits, por debajo de 0,5 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas con 2 GB o más de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), e incluso en CPU.
- Opciones de despliegue: transformers + peft (método documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recruiting Exit Advisor (este adaptador) | 0,5B (base) + LoRA | no disponible | Clasificación END/CONTINUE en reclutamiento | no disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Asistente general | no disponible en la información proporcionada | Hugging Face |
| LoRA v1 del mismo autor (99 ejemplos) | 0,5B (base) + LoRA | no disponible | Misma tarea | no disponible | No publicado como repo independiente en la información disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas.
- Especializado en un único rol (Python Developer) y en conversaciones SMS cortas; no generaliza a otros puestos ni a otros canales.
- Proyecto de curso, no apto para producción según el propio autor.
- La precisión de 0,932 está parcialmente sobreajustada al conjunto de evaluación; la estimación limpia es 0,898.
- Conjunto de entrenamiento muy reducido (113 conversaciones sintéticas), lo que limita la robustez ante dominios o estilos no vistos.
- Riesgo de alucinación: aunque la salida está restringida a una palabra, el modelo podría generar texto distinto de END o CONTINUE si la entrada se desvía del formato esperado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier uso fuera de investigación o docencia.
- Requiere cargar el modelo base Qwen2.5-0.5B-Instruct, cuya licencia y condiciones se aplican adicionalmente.

## Enlaces

- Hugging Face: https://huggingface.co/galas273/recruiting-exit-advisor-qwen2.5-0.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
