# sneha272228748/grounded-carbon-qwen3-4b-lora

## Resumen

Grounded Carbon QA es un adaptador LoRA sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario sneha272228748, diseñado para responder preguntas sobre cumplimiento en mercados de carbono exclusivamente a partir de pasajes recuperados de estándares oficiales (Verra VCS, Gold Standard, ICVCM CCPs, UNFCCC Article 6.4 e India CCTS). El adaptador cita el pasaje utilizado mediante referencias `[S1]`–`[S4]` y responde literalmente `Not found in the provided documents.` cuando la respuesta no está presente en el contexto recuperado, lo que lo convierte en un componente orientado a reducir alucinaciones en pipelines RAG.

El modelo no es un modelo completo, sino un adaptador PEFT (LoRA) de 33 millones de parámetros (0,81 % del total del modelo base) que se carga sobre Qwen3-4B-Instruct-2507. Su relevancia radica en que demuestra una mejora medible y sustancial en métricas de fidelidad documental dentro de un dominio regulado: reduce la tasa de alucinación del 17,3 % (base + RAG) al 1,3 %, mantiene un 100 % de rechazos correctos y eleva la precisión estricta del 26,7 % al 50,0 % sobre un conjunto de 150 preguntas retenidas.

El proyecto incluye además un pipeline completo de datos y evaluación (CuratorKIT, AlignTune, AuditKIT) publicado en un repositorio de GitHub, lo que lo hace útil como referencia metodológica para quien necesite construir asistentes documentales con citación obligatoria y rechazo controlado en dominios de alta exigencia normativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 33M en el adaptador (0,81 % del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 2560 tokens) |
| Tipos de cuantizacion | Base entrenado en 4 bits; el adaptador se distribuye en precision PEFT estandar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (safetensors, library_name: peft) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B-Instruct-2507, un transformer decoder-only del que no se detallan en la informacion disponible ni el numero de capas ni la composicion del corpus original. El LoRA emplea rango r=16, alpha=32 y dropout 0,05 aplicado a todas las proyecciones de atencion y MLP, con un total de 33M parametros entrenables. El entrenamiento se realizo con AlignTune sobre backend Unsloth, con el modelo base cuantizado a 4 bits, una epoca, batch efectivo de 16, learning rate 2e-4 y longitud maxima de 2560 tokens; el coste computacional reportado es de 43 minutos en una unica GPU T4.

El conjunto de datos se construyo con CuratorKIT a partir de 260 fragmentos de estandares, que generaron 767 pares pregunta-respuesta, de los cuales 757 superaron la puerta de control de alucinaciones. El conjunto final de SFT contiene 741 ejemplos: 552 respuestas fundamentadas con citas, 157 negativos duros (misma pregunta con la evidencia eliminada, forzando el rechazo) y 70 preguntas verificadas fuera de corpus orientadas al rechazo. Esta mezcla explicita de negativos y ejemplos out-of-corpus es la innovacion tecnica central: entrena al modelo a distinguir entre "no lo se" y "no esta en los documentos", en lugar de simplemente generar texto plausible.

## Capacidades

- Generacion de respuestas extractivas fundamentadas exclusivamente en pasajes recuperados, con citacion explicita `[S1]`–`[S4]`.
- Rechazo controlado: emite la cadena exacta `Not found in the provided documents.` ante preguntas cuya evidencia no figura en el contexto.
- Respuesta a preguntas de cumplimiento normativo en mercados de carbono (Verra VCS, Gold Standard, ICVCM CCPs, UNFCCC Article 6.4, India CCTS).
- Integracion en pipelines RAG con top-4 pasajes recuperados como entrada estandar.
- Capacidades generales heredadas del modelo base Qwen3-4B-Instruct-2507 (no evaluadas de forma especifica en este adaptador).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistencia a auditores de proyectos de carbono: el adaptador responde consultas sobre requisitos de Verra VCS o Gold Standard citando el pasaje exacto del estandar, lo que permite al auditor verificar la respuesta contra el documento fuente sin salir del flujo de trabajo.
- Triaje de consultas regulatorias en plataformas de compliance: ante preguntas de clientes sobre Article 6.4 o ICVCM CCPs, el sistema devuelve una respuesta citada o un rechazo explicito, evitando que un operador humano reciba una respuesta inventada.
- Generacion de borradores de informes de verificacion: el modelo extrae y cita requisitos concretos de los estandares para incorporarlos a plantillas de documentacion, manteniendo trazabilidad documental.
- Control de calidad de respuestas RAG existentes: dado que reduce la alucinacion del 17,3 % al 1,3 % con el mismo contexto recuperado, puede desplegarse como capa de respuesta sobre un recuperador ya operativo sin cambiar la infraestructura de retrieval.
- Formacion interna de equipos de sostenibilidad: un asistente que solo responde con base documental y rechaza lo que no consta es adecuado para entornos de aprendizaje donde una respuesta incorrecta tiene coste reputacional o regulatorio.
- Evaluacion comparativa de pipelines RAG en dominios regulados: el repositorio asociado (AuditKIT) permite replicar el protocolo de medicion de groundedness, cobertura de contexto y F1 sobre corpus propios.
- Filtrado de preguntas fuera de alcance en atencion al cliente especializada: el comportamiento de rechazo entrenado con 157 negativos duros y 70 preguntas out-of-corpus sirve como mecanismo de derivacion a un humano cuando la consulta excede el corpus disponible.

## Benchmarks y rendimiento

Resultados sobre 150 preguntas retenidas (90 respondibles, 60 no presentes en los documentos), con la misma pregunta y los mismos top-4 pasajes recuperados para todos los sistemas. Juez LLM: Qwen2.5-14B.

| Metrica | Base + RAG | Base + prompt estricto | Este adaptador |
|---|---|---|---|
| Tasa de alucinacion (menor es mejor) | 17,3 % | 4,7 % | 1,3 % |
| Rechazo correcto (mayor es mejor) | 73,3 % | 100 % | 100 % |
| Precision estricta (mayor es mejor) | 26,7 % | 30,0 % | 50,0 % |
| Sobre-rechazo (menor es mejor) | 3,3 % | 6,7 % | 12,2 % |
| AuditKIT F1 (mayor es mejor) | 0,277 | 0,709 | 0,736 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade 33M parametros sobre un modelo base de 4B; en cuantizacion de 4 bits el conjunto completo cabe holgadamente en 8 GB de VRAM, aunque la cifra exacta no esta publicada.
- GPU recomendadas: el entrenamiento se realizo en una unica T4 (43 minutos), lo que indica que la inferencia es viable en GPUs de gama media y consumer.
- Cabe en GPU consumer: si, incluidas tarjetas con 8-12 GB de VRAM en cuantizacion de 4 bits, segun el modelo base.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI requeririan conversion del adaptador y no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota operativa: la model card indica eliminar una linea inicial `assistant` de las salidas y suprimir el end-of-turn en el primer token (ver `common/model.py` del repositorio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grounded Carbon QA (este) | 33M adaptador sobre 4B | no disponible | RAG con citacion y rechazo | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base + RAG) | 4B | no disponible | RAG sin fine-tuning | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base + prompt estricto) | 4B | no disponible | RAG con instrucciones estrictas | Apache 2.0 | Hugging Face |

La comparativa relevante es interna al propio proyecto: el adaptador supera a las dos configuraciones del modelo base en tasa de alucinacion, precision estricta y F1 de AuditKIT, a costa de un mayor sobre-rechazo (12,2 % frente a 3,3 % y 6,7 %). No se dispone de comparacion con otros adaptadores LoRA de dominio publico en la informacion proporcionada.

## Limitaciones y advertencias

- El juez LLM utilizado para evaluar (Qwen2.5-14B) pertenece a la misma familia que el modelo base, lo que puede introducir sesgo de evaluacion favorable.
- El conjunto de test esta verificado por LLM, no revisado manualmente por personas.
- El sobre-rechazo es superior al de las lineas base (12,2 % frente a 3,3 % y 6,7 %), por lo que el modelo declinara responder preguntas que si serian respondibles.
- Los estandares cambian: el adaptador refleja las versiones documentales vigentes en noviembre de 2026 y quedara desactualizado.
- Solo soporta ingles; no se declaran capacidades multilingues.
- El modelo no constituye asesoramiento legal ni de cumplimiento; no debe usarse como fuente normativa definitiva.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones que deben verificarse por separado.
- Al ser un adaptador PEFT, requiere cargar el modelo base completo; no es desplegable de forma autonoma.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sneha272228748/grounded-carbon-qwen3-4b-lora
- Repositorio GitHub (codigo, pipeline de datos y resultados): https://github.com/snehapal0905/grounded-carbon-llm
- Dataset de SFT: https://huggingface.co/datasets/sneha272228748/grounded-carbon-qa-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
