# Devseis/endpoint-auditor-0.5b

## Resumen

Devseis Endpoint Auditor 0.5B (v0.1) es un ajuste fino de tipo LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, desarrollado por Devseis, cuyo objetivo es redactar hallazgos de auditoría de seguridad en endpoints a partir de evidencia recopilada por código. El modelo explica cada hallazgo, valora el riesgo, redacta pasos de corrección y verificación adaptados al sistema operativo del dispositivo (Windows, Linux, macOS), mapea los hallazgos a referencias de ISO 27001, GDPR y EU AI Act, escribe el resumen ejecutivo y clasifica herramientas de IA bajo el EU AI Act. Está pensado para ejecutarse en local, dentro de la aplicación de escritorio y de móvil Devseis Endpoint Auditor mediante WebLLM, de forma que la evidencia de auditoría no abandona el equipo del usuario.

Se trata de un modelo pequeño: 494.032.768 parámetros totales según los pesos en safetensors, derivados de la arquitectura Qwen2 del modelo base. La relevancia de esta ficha radica en su enfoque de diseño: el modelo no decide veredictos ni emparejamientos de vulnerabilidades —eso lo hace el código de la aplicación—, sino que se limita a verbalizar y estructurar hechos ya recuperados. Cada respuesta se valida contra la evidencia (números, identificador de comprobación, estado, referencias y nombres de herramientas) y, si no supera esa comprobación, la aplicación recurre a una plantilla interna.

La versión publicada es la v0.1, descrita por el propio autor como un piloto con 988 ejemplos sintéticos balanceados que demuestra la viabilidad del pipeline, y que queda superada por la v0.3. El repositorio ocupa 1,0 GB, la licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con ajuste fino LoRA sobre Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (aproximadamente 0,49 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens. El entrenamiento uso secuencias de 2.048 tokens |
| Tipos de cuantizacion | Builds MLC: q0f16 (escritorio), q4f16_1 (telefonos), q4f32_1. Adaptador LoRA en precision completa. No se listan builds GGUF oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); adaptador LoRA en el subdirectorio `lora/`; pesos MLC para navegador |

Datos adicionales del repositorio: 0 descargas, 0 likes, creado el 2026-10-08, pipeline `text-generation`, libreria `transformers`, compatible con text-generation-inference y endpoints.

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se adapta mediante LoRA con rango r=16 y alpha=32, lo que da 8,8 millones de parametros entrenables sobre los 494 millones totales. El entrenamiento se hizo con 988 ejemplos sinteticos balanceados por tarea, sistema operativo y estado, procedentes del dataset Devseis/endpoint-auditor-synthetic (revision v0.1, licencia CC BY 4.0), con secuencias de 2.048 tokens. Los hiperparametros declarados son learning rate 2e-4, 1 epoca y 124 pasos de 8 ejemplos. La perdida de validacion final reportada es de 0,0173.

Un detalle tecnico destacable es el hardware empleado: todo el ajuste se hizo solo con CPU, en un MacBook Pro Intel de 4 nucleos con PyTorch 2.2 y atencion en modo eager. El formato de prompt es de estilo recuperacion (retrieval), construido por `app/renderer/auditor-core.js` de forma identica al script `training/build_dataset.py`, con un system prompt comun. El modelo se entrena para tres tareas explicitas —`finding`, `summary` y `ai_classification`— y debe responder con un unico objeto JSON. No se menciona en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de hallazgos de auditoria (tarea `finding`): explica cada hallazgo, asigna una valoracion de riesgo y redacta pasos de correccion y verificacion especificos para Windows, Linux o macOS.
- Mapeo normativo: asocia los hallazgos a referencias de ISO 27001, GDPR y EU AI Act (se citan titulos de controles ISO 27001, sin reproducir el texto del estandar).
- Redaccion de resumen ejecutivo (tarea `summary`) a partir de datos recuperados.
- Clasificacion de herramientas de IA bajo el EU AI Act (tarea `ai_classification`), incluyendo herramientas detectadas y flags de aprobacion.
- Salida estructurada: responde con un unico objeto JSON, con un 100% de JSON valido en el conjunto de prueba held-out reportado.
- Consistencia con la evidencia: el 100% de las respuestas del conjunto de prueba superan la comprobacion de fidelidad (grounded) que usa la aplicacion.
- Ejecucion local/offline: hay builds MLC para navegador y aplicacion de escritorio y movil, de modo que la evidencia no sale del dispositivo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Auditoria de cumplimiento en endpoints corporativos: la aplicacion recopila evidencia mediante codigo y el modelo redacta los hallazgos en lenguaje natural, asociandolos a controles ISO 27001 y articulos del GDPR. Es adecuado porque el modelo no toma decisiones de veredicto, solo verbaliza hechos ya determinados.
- Generacion automatica de informes de auditoria para direccion: a partir de la lista de hallazgos y estados, produce el resumen ejecutivo, reduciendo el trabajo manual de redaccion en cada ciclo de auditoria.
- Correccion guiada por sistema operativo: para un mismo hallazgo en Windows, Linux o macOS, el modelo redacta los pasos de remediacion y verificacion correspondientes al SO del dispositivo, lo que evita instrucciones genericas inaplicables.
- Clasificacion de herramientas de IA en la organizacion: dado un inventario de herramientas detectadas en el endpoint, el modelo clasifica su encaje bajo el EU AI Act y determina flags de aprobacion para revision interna.
- Cumplimiento con privacidad estricta (on-device): al ejecutarse en el propio equipo mediante WebLLM, encaja en escenarios donde la evidencia de auditoria no puede enviarse a una API en la nube por requisitos contractuales o regulatorios.
- Pre-revision de auditorias externas: permite generar un borrador de informe antes de la auditoria formal, con hallazgos ya mapeados a referencias normativas, para que el auditor humano valide y ajuste.
- Integracion en pipelines de compliance continuo: el modelo puede invocarse desde la aplicacion para producir JSON estructurado por hallazgo, que despues se agrega en paneles de seguimiento de estado (compliant / non-compliant).

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados proceden del propio autor (`training/evaluate.py`, decodificacion greedy sobre ejemplos held-out). Las metricas son: *valid JSON* (el resultado se puede parsear), *grounded* (supera la comprobacion de fidelidad que usa la aplicacion) y *fields match* (coinciden check id / status / risk en hallazgos, score y top gaps en resumenes, y herramientas y flags de aprobacion en clasificacion de IA).

Modelo base sin ajustar (Qwen2.5-0.5B-Instruct):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 0% | 0% | 0% |
| finding | 21 | 0% | 0% | 0% |
| summary | 4 | 0% | 0% | 0% |
| **total** | 30 | **0%** | **0%** | **0%** |

Este modelo (v0.1):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 100% | 100% | 100% |
| finding | 21 | 100% | 100% | 100% |
| summary | 4 | 100% | 100% | 0% |
| **total** | 30 | **100%** | **100%** | **87%** |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El tamano muestral de la evaluacion es muy reducido (30 ejemplos en total), por lo que los porcentajes deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors suman 494.032.768 parametros; en fp16 esto equivale a aproximadamente 1 GB de pesos, mas overhead de activaciones y cache KV. El repositorio completo ocupa 1,0 GB.
- Cuantizacion para movil: los builds MLC q4f16_1 y q4f32_1 reducen el modelo a una fraccion del tamano fp16, lo que permite ejecucion en telefonos; el build q0f16 esta pensado para escritorio.
- GPU: no se especifica ninguna GPU recomendada en la informacion disponible. Dado el tamano (0,5 B), cabe holgadamente en GPUs de consumo como una RTX 3060, RTX 4070 o RTX 4090, e incluso en GPUs integradas.
- Cabe en GPU de consumo: si, con margen amplio. Tambien cabe en CPU: el autor entreno y evaluo el modelo exclusivamente en CPU (MacBook Pro Intel de 4 nucleos).
- Opciones de despliegue: transformers (con `revision="v0.1"`), PEFT para aplicar el adaptador LoRA sobre el modelo base, WebLLM/MLC para navegador (builds q0f16, q4f16_1, q4f32_1) y text-generation-inference (el repositorio esta etiquetado como compatible con endpoints).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

En los resultados de busqueda web no se han encontrado modelos comparables de la misma categoria (ajustes finos pequenos orientados a auditoria de cumplimiento ISO 27001 / GDPR / EU AI Act), por lo que la comparativa se limita al modelo base y a alternativas generales de tamano similar. No se dispone de datos de benchmarks de estas alternativas en la informacion proporcionada, por lo que no se comparan cifras de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Devseis/endpoint-auditor-0.5b | 494.032.768 | no disponible (base: 32.768 tokens) | Apache-2.0 | Ajuste fino LoRA para hallazgos de auditoria de endpoints | HuggingFace, builds MLC para navegador y movil |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 0,5 B | 32.768 tokens (segun el modelo base) | Apache-2.0 | Instruct generalista, sin especializacion en compliance | HuggingFace, ampliamente desplegado |
| Alternativas generalistas de ~0,5 B a 2 B | no disponible | no disponible | no disponible | Proposito general | no disponible |

La ventaja diferencial del modelo de Devseis no es el rendimiento bruto, sino el formato de salida JSON anclado a evidencia y su ejecucion on-device. Frente al modelo base sin ajustar, la mejora reportada en JSON valido y fidelidad pasa del 0% al 100% en el conjunto de prueba del autor.

## Limitaciones y advertencias

- Entrenado con evidencia sintetica: la redaccion del mundo real varia, por lo que el autor advierte de posibles desajustes. La aplicacion mitiga esto con la comprobacion de fidelidad y la plantilla de respaldo.
- Tamano de 0,5 B: el propio autor indica que el modelo es bueno formulando y seleccionando hechos recuperados, pero no es fiable para aritmetica ni para ranking, de modo que las puntuaciones y las brechas principales las aporta el codigo, no el modelo.
- La tarea de resumen obtuvo un 0% de coincidencia de campos en la evaluacion held-out (n=4), aunque el 100% de JSON valido y el 100% de grounded.
- Evaluacion con muy pocos ejemplos (30 en total, 5 para clasificacion de IA), lo que limita la significacion estadistica de los porcentajes publicados.
- Solo ingles declarado: no hay soporte multilingue documentado, lo que puede ser un obstaculo para despliegues en castellano u otros idiomas sin trabajo adicional.
- No es asesoramiento legal ni una certificacion: se citan titulos de controles ISO 27001, pero no se reproduce el texto del estandar, y las referencias normativas deben ser validadas por un profesional.
- El modelo no decide veredictos ni emparejamientos de vulnerabilidades; es el codigo de la aplicacion el que lo hace. Usarlo fuera de ese pipeline (por ejemplo, pidiendole que determine el estado de cumplimiento por si mismo) queda fuera de su diseno previsto.
- Version v0.1 explicitamente superada por la v0.3 segun el autor; para uso nuevo conviene evaluar la version mas reciente.
- Licencia Apache-2.0, que permite uso comercial con atribucion ("Devseis Endpoint Auditor by Devseis"). El dataset asociado se distribuye bajo CC BY 4.0, con sus propias condiciones de atribucion.
- Riesgo de alucinacion: inherente a un modelo de 0,5 B; el diseno lo asume y lo mitiga con verificacion contra evidencia y fallback a plantilla, pero no hay datos publicados sobre la tasa de fallo en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devseis/endpoint-auditor-0.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Demo / aplicacion en Spaces: https://huggingface.co/spaces/Devseis/endpoint-auditor
- Documentacion interna del modelo: https://huggingface.co/spaces/Devseis/endpoint-auditor/blob/main/docs/MODEL_LLM.md
- Build MLC para escritorio (q0f16): https://huggingface.co/Devseis/endpoint-auditor-0.5b-q0f16-MLC
- Build MLC para telefonos (q4f16_1): https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f16_1-MLC
- Build MLC alternativo (q4f32_1): https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los de HuggingFace listados arriba. No se han encontrado papers, blogs ni repositorios externos asociados.
