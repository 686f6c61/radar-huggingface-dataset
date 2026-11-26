# barudakwell/aitf-tor-reviewer-qwen3-8b-lora-exp02

## Resumen

AITF TOR reviewer — Qwen3-8B LoRA (EXP_02) es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3-8B (8.000 millones de parametros, bf16). Lo desarrolla el usuario barudakwell y su proposito es especializar al modelo en la evaluacion automatizada de TOR (Kerangka Acuan Kerja), el documento de terminos de referencia que la administracion publica de Indonesia exige para la contratacion de bienes y servicios. El adaptador transforma la salida del modelo en JSON estructurado y verificable segun dos tareas de screening definidas en el llamado "prompt v8.4".

La relevancia del modelo es acotada pero concreta: no es un modelo generalista, sino un componente de un pipeline de revision documental en indonesio. El adaptador mejora de forma medible el rendimiento del Qwen3-8B base en clasificacion de checklists (balanced accuracy del 65,7% al 88,5%) y en validacion de formato JSON (del 97,0% al 99,4%), con un coste de entrenamiento modesto (una sola epoca, LoRA r=16 sobre un A100 de 40 GB). El repositorio pesa 0,2 GB y solo contiene los pesos del adaptador, no el modelo completo.

El modelo esta etiquetado con idioma `id` (indonesio) y licencia `other`, y se publica como un experimento (EXP_02) dentro de una serie de iteraciones. Su alcance queda explicitamente limitado a asistir a revisores humanos, no a sustituirlos, y su formato de entrada esta atado a la version concreta del prompt v8.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue fija `max_model_len=5120` |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base se usa en bf16) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | `other` (sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a todas las proyecciones de atencion y a las capas MLP del modelo base Qwen3-8B, que se mantiene congelado en bf16. No se modifica la arquitectura del transformer subyacente: el adaptador inyecta matrices de bajo rango que desplazan la distribucion de salida hacia el formato de revision de TOR. El entrenamiento se realizo en una unica epoca con learning rate 1e-4 sobre un A100 de 40 GB en Colab.

El conjunto de datos, denominado `sft_v84_all_bersih2`, contiene 10.406 filas de entrenamiento que cubren las dos tareas de screening (S1 y S2) y combinan TOR sinteticos con TOR reales sometidos a enmascaramiento. La tarea S1 evalua un checklist concreto (por ejemplo II.A.1, II.B.1-WHEN o II.B.2) y produce un objeto JSON con los campos `bukti` (evidencias), `alasan` (justificacion), `lolos` (superado) y `saran` (recomendacion). La tarea S2 clasifica la categoria de "Rincian Output" emitiendo un objeto con los criterios K1 a K4, la justificacion y la categoria asignada. El prompt y el formato de respuesta siguen estrictamente el prompt v8.4 (`kontrak/prompt_v8.4.md`, ensamblador `prompt_v84.py`). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto especializada en revision documental de TOR en indonesio.
- Screening S1: evaluacion de checklists con salida JSON estructurada (`bukti`, `alasan`, `lolos`, `saran`).
- Screening S2: clasificacion de categoria de Rincian Output con criterios K1 a K4 y justificacion.
- Cumplimiento estricto de formato: 99,4% de JSON valido y 98,7% de superacion del verificador en el conjunto de test.
- Extraccion de evidencias textuales (`bukti`) con un F1 del 88,2% sobre el conjunto de test.
- Capacidad multilingue limitada al indonesio; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo de razonamiento extendido; de hecho, el despliegue exige `enable_thinking=False` porque el adaptador se entreno sin bloque de pensamiento.

## Casos de uso

- Revision asistida de terminos de referencia en contratacion publica: el adaptador recibe un checklist y un fragmento de TOR y devuelve un JSON con la evidencia encontrada, la justificacion, el veredicto de superacion y una sugerencia; encaja en flujos donde un revisor humano valida despues la salida.
- Pre-screening masivo de documentos: al procesar lotes de TOR con vLLM y `enable_lora=True`, permite descartar rapidamente los documentos que no cumplen checklists basicos antes de la revision manual.
- Clasificacion de categorias de output (S2): util para enrutar documentos hacia el area responsable segun la categoria de Rincian Output detectada, aunque con la advertencia de que el rendimiento en esta tarea es del 58,6%.
- Extraccion de evidencias para auditoria: el campo `bukti` del JSON permite reconstruir que fragmento del documento sustenta cada decision, lo que facilita la trazabilidad en procesos de control interno.
- Generacion de borradores de recomendaciones: el campo `saran` produce sugerencias de mejora que el revisor puede aceptar, editar o descartar, reduciendo el tiempo de redaccion.
- Integracion en pipelines de validacion automatica: con el verificador `prompt_v84.verify_s1` / `verify_s2`, el sistema puede reintentar una vez las respuestas que no superan la validacion de esquema, lo que reduce la intervencion manual en la gestion de errores de formato.
- Prototipado de asistentes de revision en entornos de investigation: al ser un adaptador pequeno (0,2 GB) sobre un base de 8B, permite experimentar con hardware modesto, como una L4 de 24 GB.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test de 1.527 filas, con familias de TOR separadas del entrenamiento:

| Metrica | Qwen3-8B zero-shot | EXP_01 | EXP_02 |
|---|---:|---:|---:|
| S1 balanced accuracy | 65,7% | 84,3% | 88,5% (IC 95%: 86,6–90,6) |
| S1 recall "tidak lolos" | 36,6% | 77,0% | 83,4% |
| Bukti F1 | 74,4% | No disponible | 88,2% |
| S2 categoria (46 filas) | 40,0% | 58,7% | 58,6% |
| JSON valido | 97,0% | No disponible | 99,4% |
| Supera verificador | 89,7% | No disponible | 98,7% |

Notas: el zero-shot se calculo sobre 300 filas de test. Los checklists con peor rendimiento son II.B.1-WHY (68%) y II.B.1-WHAT (73%). El rendimiento en S2 sigue siendo bajo por escasez de datos de entrenamiento para esa tarea.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,2 GB; el modelo base Qwen3-8B en bf16 requiere aproximadamente 16 GB de VRAM, y en cuantizacion de 4 bits podria reducirse a unos 5-6 GB (estimacion no confirmada en la informacion disponible).
- GPU recomendadas: A100 40 GB (usada en entrenamiento) y L4 24 GB (probada en inferencia, con carga en unos 60 segundos y 7-9 segundos por peticion).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para el base en bf16; con cuantizacion podria caber en 8 GB, aunque no se documenta esa configuracion.
- Opciones de despliegue: vLLM con `enable_lora=True`, `max_lora_rank=16`, `max_model_len=5120` y `dtype="bfloat16"`. No se documentan otros motores (llama.cpp, Ollama, TGI).
- Latencia y throughput: 7-9 segundos por peticion en una L4 de 24 GB; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para revision de TOR en indonesio. La comparacion mas directa disponible es con el modelo base y con la iteracion anterior del mismo autor:

| Modelo | Parametros | Contexto | S1 balanced accuracy | S2 categoria | Licencia |
|---|---|---:|---:|---:|---|
| Qwen3-8B zero-shot | 8.000 M | No disponible | 65,7% | 40,0% | No disponible |
| EXP_01 (mismo autor) | 8.000 M + LoRA | No disponible | 84,3% | 58,7% | `other` |
| EXP_02 (este modelo) | 8.000 M + LoRA | No disponible | 88,5% | 58,6% | `other` |

No se identifican en la informacion disponible alternativas publicas de la misma categoria (revision de TOR en indonesio) para ampliar la comparativa.

## Limitaciones y advertencias

- Solo asiste al revisor: la model card indica explicitamente que la decision final recae en una persona.
- No se ha probado sobre TOR reales fuera de los 439 documentos del dataset; el rendimiento en documentos nuevos puede degradarse.
- Confusion documentada: a veces trata objetivos generales (RPJMN/RKP) como objetivos especificos de la Rincian Output, y en ocasiones transcribe mal el nombre de la seccion de referencia en la justificacion.
- El formato de entrada esta atado al prompt v8.4; si cambia el formato (por ejemplo, II.B.2 con tabla de riesgos completa o S2 con contexto de S1), el adaptador deja de ser valido.
- Rendimiento bajo en S2 (58,6%), atribuido a la escasez de datos de entrenamiento para esa tarea.
- Checklists con peor rendimiento: II.B.1-WHY (68%) y II.B.1-WHAT (73%).
- Es obligatorio usar `enable_thinking=False`; el modelo se entreno sin bloque de pensamiento y el modo de razonamiento puede romper el formato esperado.
- Riesgo de alucinacion en el campo `bukti` y en la justificacion; se recomienda validar la salida con `prompt_v84.verify_s1` / `verify_s2` y reintentar una vez si falla.
- Licencia `other` sin terminos detallados: es necesario contactar con el autor antes de un uso comercial.
- Idioma limitado al indonesio; no se documenta soporte de otras lenguas.
- Sesgos: no se documentan sesgos especificos, pero al entrenar sobre TOR de la administracion indonesia puede heredar sesgos de ese corpus.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no debe emplearse en esos escenarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barudakwell/aitf-tor-reviewer-qwen3-8b-lora-exp02
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Libreria PEFT: https://github.com/huggingface/peft
- vLLM (despliegue con LoRA): https://github.com/vllm-project/vllm
- No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales del autor.
