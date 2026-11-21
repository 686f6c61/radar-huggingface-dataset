# chinhnc/Quyet-1.0-Large

## Resumen

Quyet-1.0-Large es un modelo de decisión desarrollado por Chinh Nguyen (chinhnc) como un fine-tune del modelo base google/gemma-4-31B-it. A diferencia de un modelo conversacional al uso, su función es recibir un estado (texto libre, JSON o una conversación) junto con una o varias preguntas tipadas y devolver, para cada pregunta, una opción seleccionada acompañada de probabilidades calibradas. Admite tres tipos de pregunta: `choice` (elegir una etiqueta entre un conjunto), `score` (un nivel dentro de una escala ordenada) y `noul` (verdadero/falso).

El modelo forma parte de la familia Quyet 1.0 (Large, Medium, Small, Small-EN y Tiny) y se distribuye bajo licencia Apache-2.0. Cuenta con 31.273.088.876 parámetros totales (30,7B de texto según la model card) y un peso de 62,5 GB en bf16. Su innovación principal es el mecanismo de lectura de decisiones: en lugar de generar texto libre, el modelo responde leyendo las probabilidades del siguiente token correspondientes a las letras de las opciones (A, B, ...) tras un prompt fijo, y el paquete `quyet` aplica temperaturas calibradas para convertir esas probabilidades en confianzas utilizables.

Es relevante ahora porque ofrece una alternativa determinista y calibrada a los LLM generativos en tareas de clasificación y enrutamiento en producción: en lugar de pedir a un modelo que "responda" una etiqueta y parsear la salida, se obtiene directamente una distribución de probabilidad tipada y estructurada, con un formato de respuesta estable (la forma TypeSafe `/v1/systemone`) y un límite de 10 opciones por pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-31B-it con fine-tune LoRA fusionado (rango 16), prompt de decisión con lectura de letras |
| Parametros totales | 31.273.088.876 (30,7B de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | prompt de 8.000 tokens; estado de entrada de hasta 6.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés; también ajustado para vietnamita; otros idiomas funcionan con menor precisión |
| Licencia | Apache-2.0 (conservar el archivo NOTICE) |
| Formato de pesos | safetensors (62,5 GB en bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer de 31,3B parámetros, sobre el que se aplica un fine-tune LoRA de rango 16 cuyos adaptadores se fusionan en los pesos finales, dando como resultado un checkpoint con la misma arquitectura que el modelo base. La capa de decisión no se implementa mediante generación autoregresiva libre, sino mediante un prompt fijo de "letter-readout": el modelo recibe el estado y las preguntas y se leen las probabilidades del siguiente token asociadas a las letras de las opciones (A, B, ...). El paquete `quyet` construye ese prompt y aplica las temperaturas calibradas almacenadas en `quyet_config.json`.

La versión del prompt es la 2: el prompt entrenado sin el mensaje de sistema ni la línea de cierre, con estados estructurados en JSON compacto, lo que reduce aproximadamente 68 tokens de entrada por decisión; las temperaturas se recalibraron para esta versión. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo se puede cargar con `transformers` y servir con vLLM como un checkpoint estándar de arquitectura gemma-4-31B-it, aunque el prompt de decisión y las temperaturas residen en el paquete y en el archivo de configuración.

## Capacidades

- Clasificación de decisión tipada: `choice` (selección de una etiqueta entre opciones, con distribución de probabilidades), `score` (nivel esperado en una escala ordenada, con probabilidades y leyenda) y `noul` (probabilidad de verdadero/falso).
- Salida calibrada: devuelve confianzas y distribuciones de probabilidad, no solo la etiqueta elegida.
- Entrada de estado flexible: texto libre, JSON estructurado o listas de conversación multi-turno.
- Procesamiento de hasta 10 opciones por pregunta y estados de hasta 6.000 tokens dentro de un prompt de 8.000 tokens.
- Truncado controlado del estado: en conversaciones se conservan los turnos más recientes; en otros estados se conserva el inicio.
- Multilingüe con foco en inglés y vietnamita; otros idiomas con menor precisión.
- Compatibilidad con `transformers` y servicio mediante vLLM como checkpoint estándar.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo recibe el mensaje del cliente y devuelve la intención (`choice`), la urgencia (`noul`) y el nivel de enfado (`score`) en una sola llamada, con probabilidades que permiten derivar a un agente humano cuando la confianza es baja.
- Moderación y triaje de contenido: clasificación de tickets o mensajes en categorías con umbral de confianza calibrado, aprovechando la salida de probabilidades para decidir si se escala a revisión manual.
- Extracción de señales en pipelines de datos: dado un JSON de evento, responder preguntas booleanas y de escala sobre el mismo (por ejemplo, si es fraudulento o su severidad) de forma estructurada y repetible.
- Enrutamiento de consultas en sistemas RAG: decidir qué índice o herramienta corresponde a una consulta del usuario mediante preguntas `choice` con distribución de probabilidad, integrándolo antes del paso de recuperación.
- Clasificación de conversaciones multi-turno: análisis de transcripts de soporte conservando los turnos recientes gracias al truncado controlado de conversaciones, para etiquetar resultado, sentimiento y motivo de contacto.
- Evaluación automática de calidad: puntuar respuestas generadas por otros modelos en escalas ordenadas (`score`) con confianza asociada, como componente de un pipeline de evaluación o de un juez automático.
- Automatización de decisiones en back office: dado un formulario o expediente en JSON, responder preguntas tipadas sobre elegibilidad, categoría o riesgo con probabilidades auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan 62,5 GB, por lo que la inferencia en bf16 requiere al menos 80 GB de VRAM (la model card indica que funciona en una GPU de 80 GB).
- GPU recomendadas: una A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; también es posible el reparto en varias GPU con `device_map="auto"` (paquete `quyet[multi-gpu]`).
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, etc.) en bf16; la información disponible no documenta cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: paquete `quyet` (`pip install quyet`), `transformers` y vLLM como checkpoint estándar de arquitectura gemma-4-31B-it.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quyet-1.0-Large | 31,3B | prompt 8.000 tokens / estado 6.000 tokens | Modelo de decisión calibrado (fine-tune de Gemma-4-31B-it) | Apache-2.0 | Hugging Face (`chinhnc/Quyet-1.0-Large`) |
| google/gemma-4-31B-it | 31,3B | no disponible | LLM generativo instruct | Apache-2.0 | Hugging Face |
| Quyet-1.0-Medium | no disponible | no disponible | Modelo de decisión calibrado (misma familia) | Apache-2.0 | Hugging Face |
| Quyet-1.0-Small | no disponible | no disponible | Modelo de decisión calibrado (misma familia) | Apache-2.0 | Hugging Face |

La información disponible no incluye datos de rendimiento comparativo frente a estos modelos; la comparación se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para decisiones tipadas; no es un modelo conversacional ni de generación libre de texto.
- Límite de 10 opciones por pregunta y de un estado de hasta 6.000 tokens dentro de un prompt de 8.000 tokens; el estado se trunca (turnos recientes en conversaciones, inicio en otros estados).
- Idiomas: precisión menor fuera de inglés y vietnamita.
- La calibración de probabilidades depende de las temperaturas del paquete `quyet` y de la versión del prompt (versión 2); usarlo fuera del paquete o con prompts distintos puede invalidar la calibración.
- Riesgo de alucinación y sesgos heredados del modelo base google/gemma-4-31B-it; no se documentan evaluaciones de sesgo específicas.
- Licencia Apache-2.0 con obligación de conservar el archivo NOTICE ("Quyet by Chinh Nguyen") al redistribuir el modelo o derivados.
- Requisito de hardware elevado (80 GB de VRAM en bf16); no se documentan cuantizaciones oficiales para reducir el coste de despliegue.
- No se documentan capacidades de tool calling, agentes ni visión; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chinhnc/Quyet-1.0-Large
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Página del proyecto: https://quyet.ai
- Contacto: email@quyet.ai
