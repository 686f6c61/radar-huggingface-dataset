# RedHatAI/GLiNER2.5-Decide

## Resumen

GLiNER2.5-Decide es un modelo especializado en clasificación de texto e intención en inglés, publicado por RedHatAI como redistribución del modelo de Fastino (fastino/GLiNER2.5-Decide). Se construye por ajuste fino sobre fastino/gliner2-large-v1 y pertenece a la familia GLiNER2.5, cuyo marco técnico se describe en el paper arXiv 2507.18546. Su pipeline declarado en HuggingFace es `token-classification` y su licencia es Apache 2.0.

A diferencia de un modelo generativo, el modelo no produce tokens de texto libre: recibe un texto y un conjunto de etiquetas candidatas definido en tiempo de llamada, y devuelve en una única pasada hacia delante la etiqueta o etiquetas que mejor encajan. Cubre tareas de intención de cliente y banca, sentimiento de reseñas, tipo de documento, enrutado de correo y tickets, derivación a humano, moderación, severidad, urgencia y spam, entre otras. La misma llamada puede puntuar varias "cabezas" a la vez: las tareas de etiqueta única devuelven una cadena y las de etiqueta múltiple devuelven todas las etiquetas que superan el umbral.

Es relevante porque evita plantillas de prompt y generación de tokens, lo que reduce latencia y coste en decisiones operativas de alta frecuencia. El modelo se distribuye con la librería `gliner2` y la clase `AutoExtractor`, pensada para despliegue local. La model card lo describe como un modelo de 340M de parámetros, aunque los pesos en safetensors declaran 486.444.053 parámetros; conviene tratar esa cifra como el dato real del repositorio. El repositorio ocupa 1,9 GB y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de fastino/gliner2-large-v1 (familia GLiNER2), pipeline `token-classification` |
| Parametros totales | 486.444.053 (safetensors); la model card indica 340M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles; el repositorio solo distribuye safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de carga | gliner2 (`AutoExtractor`) |
| Modelo base | fastino/gliner2-large-v1 (fine-tune) |
| Tamano del repositorio | 1,9 GB |
| Pipeline declarado | token-classification |
| Fecha de publicacion | 2026-09-28 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia GLiNER2 y de su naturaleza de extractor/clasificador no generativo. El modelo se carga mediante `AutoExtractor.from_pretrained` de la libreria `gliner2` y su funcionamiento consiste en puntuar etiquetas candidatas proporcionadas en la propia llamada, sin plantilla de prompt y sin generar tokens. Esto implica una unica pasada hacia delante por consulta, con el conjunto de etiquetas como entrada adicional. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

El ajuste se realiza sobre fastino/gliner2-large-v1, un modelo de la familia GLiNER2, y se evalua sobre el conjunto `fastino/fast-decisions` (17 dominios, 300 ejemplos retenidos por dominio, con el mismo texto y las mismas etiquetas candidatas para todos los modelos comparados). El paper asociado es arXiv 2507.18546. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, y no serian aplicables en el mismo sentido al no tratarse de un modelo autoregresivo de generacion.

## Capacidades

- Clasificacion de texto con conjuntos de etiquetas definidos en tiempo de llamada (zero-shot respecto a las etiquetas concretas).
- Clasificacion de intencion: soporte al cliente, banca, viajes, peticiones clinicas.
- Analisis de sentimiento sobre resenas y opiniones.
- Clasificacion de tematica y de tipo de documento.
- Enrutado de correo electronico y de tickets, incluida la derivacion a un agente humano.
- Deteccion de finalizacion de agente, moderacion, severidad, urgencia y spam.
- Soporte de etiqueta unica (devuelve una cadena) y multi-etiqueta (devuelve todas las etiquetas por encima del umbral).
- Puntuacion de varias cabezas en una sola llamada.
- Preguntas sobre un pasaje, clasificacion de libros y etiquetas que incorporan una descripcion.
- Puntuacion de escalas ordinales.
- Capacidad de Named Entity Recognition (etiqueta declarada del modelo).
- No soporta tool calling ni function calling: no es un modelo de agente generativo.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- Capacidades multilingues: no disponibles; solo ingles declarado.

## Casos de uso

- Enrutado de tickets de soporte al cliente: el modelo recibe el mensaje entrante y un conjunto de etiquetas (reembolso, cancelacion, fallo de inicio de sesion, retraso de envio, incidencia tecnica, hablar con humano, otro) y devuelve la accion que debe arrancar el flujo de trabajo en el primer turno, antes de que intervenga un agente.
- Clasificacion de peticiones bancarias: un mismo mensaje puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo mapea la frase a la operacion que debe abrir el sistema central (transfer_cancel, beneficiary_add, fraud_report, etc.).
- Triaje en recepcion de clinicas: distingue entre reservar cita, recargar receta, consultar resultados o pedir derivacion a partir de una frase donde el paciente mezcla sintomas y peticion, antes de asignar agenda.
- Conversion de solicitudes de viaje en acciones estructuradas: reservar, cambiar, cancelar, consultar estado, cambio de asiento, reembolso o equipaje, a partir de texto libre de chat o correo, sin formulario intermedio.
- Analisis de sentimiento y tematica en resenas: clasificacion multi-etiqueta de opiniones de producto con etiquetas definidas por el equipo, en una sola pasada y sin coste de generacion.
- Moderacion y deteccion de spam: puntuacion de severidad, urgencia y spam sobre contenido generado por usuarios, con umbral configurable para derivar a revision humana.
- Clasificacion documental y enrutado de correo corporativo: asignacion de tipo de documento o de departamento destino usando etiquetas que pueden incluir descripciones.
- Escalado a humano en asistentes conversacionales: deteccion de la etiqueta `speak_to_human` o equivalente para decidir el traspaso en el momento adecuado.

## Benchmarks y rendimiento

Resultados publicados en la model card: exactitud de coincidencia exacta sobre `fastino/fast-decisions` (17 dominios, 300 ejemplos retenidos por dominio, mismo texto y mismas etiquetas candidatas para todos los modelos).

| Modelo | Avg |
|---|---:|
| GLiNER2.5-Decide (340M) | 60,2% |
| GLiNER2.5-Decide-1B | 59,6% |
| JevK5 | 57,6% |
| GLiNER2.5-multi-Decide (287M) | 56,7% |
| SemIf (Qwen3.5-4B) | 56,4% |
| GLiFormer large-v1 | 49,0% |
| Laya Router | 46,6% |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en fp16/bf16 y 1,9 GB en fp32, a partir de los 486.444.053 parametros y del tamano del repositorio (1,9 GB). Cifras estimadas por calculo, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente por tamano; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna de gama media o superior, dado el reducido numero de parametros.
- Opciones de despliegue: libreria `gliner2` con `AutoExtractor` (`pip install gliner2`). No se documentan vLLM, llama.cpp, Ollama ni TGI, y no serian la via natural al no tratarse de un modelo generativo.
- Latencia y throughput: no disponibles. La model card destaca que no hay generacion de tokens ni plantilla de prompt, lo que reduce el coste por consulta frente a alternativas generativas, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg en fast-decisions | Idioma | Licencia |
|---|---|---|---|---|---|
| GLiNER2.5-Decide (este) | 486M (safetensors); 340M segun card | No disponible | 60,2% | Ingles | Apache 2.0 |
| GLiNER2.5-Decide-1B | 1B (segun nombre) | No disponible | 59,6% | No disponible | No disponible |
| GLiNER2.5-multi-Decide | 287M | No disponible | 56,7% | Multilingue (segun card) | No disponible |
| SemIf (Qwen3.5-4B) | 4B (segun nombre) | No disponible | 56,4% | No disponible | No disponible |
| GLiFormer large-v1 | No disponible | No disponible | 49,0% | No disponible | No disponible |
| Laya Router | No disponible | No disponible | 46,6% | No disponible | No disponible |

La comparativa se limita a la metrica de exactitud publicada en la model card del propio modelo. No hay datos de contexto, licencia ni disponibilidad para la mayoria de alternativas en la informacion proporcionada. Destaca que este modelo iguala o supera a una alternativa de 1B parametros y a un modelo generativo de 4B en esta tarea concreta.

## Limitaciones y advertencias

- No es un modelo de proposito general: no razona, no explica y no responde preguntas abiertas. Usarlo fuera de tareas de decision operativa producira resultados incorrectos.
- Solo declara soporte de ingles. Para entradas multilingues la propia model card remite a GLiNER2.5-multi-Decide.
- La exactitud media publicada es del 60,2% en coincidencia exacta, lo que implica un margen de error cercano al 40% en el conjunto de evaluacion. Requiere umbrales y validacion propios antes de produccion.
- Discrepancia de parametros: la model card indica 340M y los safetensors declaran 486.444.053. Conviene verificar el dato antes de dimensionar infraestructura.
- No se documentan longitud de contexto ni limites de longitud de entrada, lo que impide planificar el troceado de documentos largos con datos fiables.
- Riesgo de alucinacion de etiqueta: al trabajar con conjuntos de etiquetas abiertos, entradas ambiguas pueden asignarse a la etiqueta menos mala del conjunto en lugar de devolver una abaja confianza, salvo que se configure un umbral.
- Sensibilidad al dominio y a la redaccion exacta de las etiquetas: el rendimiento depende de que las etiquetas candidatas cubran el espacio real de decisiones.
- Sesgos: no se documenta ninguna evaluacion de sesgo, equidad o comportamiento diferencial por subgrupos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se documentan restricciones adicionales.
- El identificador del repositorio es RedHatAI/GLiNER2.5-Decide, mientras que los ejemplos de la model card invocan `fastino/GLiNER2.5-Decide`; hay que ajustar el identificador al repositorio realmente desplegado.
- Fecha de publicacion y actualizacion identicas (2026-09-28), sin historial de revisiones visible. Cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/GLiNER2.5-Decide
- Modelo original referenciado en la model card: https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/gliner2-large-v1
- Modelo hermano de 1B: https://huggingface.co/fastino/GLiNER2.5-Decide-1B
- Modelo hermano multilingue: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio de codigo: https://github.com/fastino-ai/GLiNER2
- Dataset de evaluacion: https://huggingface.co/datasets/fastino/fast-decisions
- Dataset card de evaluacion: https://huggingface.co/datasets/fastino/fast-decisions
- Plataforma de ajuste fino del autor: https://agent.fastino.ai
- Perfil en X del autor: https://x.com/fastinoAI
