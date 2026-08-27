# kayodekosi/medical-clinical-note-summarizer-7b

## Resumen

`kayodekosi/medical-clinical-note-summarizer-7b` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` mediante QLoRA, diseñado para convertir notas clínicas en texto libre en resúmenes estructurados tipo SOAP (Subjective, Objective, Assessment, Plan, Follow-up y Confidence). El autor, kayodekosi, lo presenta como una herramienta orientada a producción para entornos hospitalarios con EHR, con capacidad de despliegue local, en VPC o en redes aisladas (air-gapped). El modelo resuelve el problema de la carga documental clínica al generar borradores de resúmenes que un clínico debe revisar y firmar, e incorpora un mecanismo explícito de rechazo cuando la nota no contiene suficiente evidencia para alguna sección.

La arquitectura es la de un transformer decoder-only de 7 000 millones de parámetros (el base Qwen2.5-7B-Instruct) con un adaptador LoRA de rango 16 a 64, lo que permite cargarlo sobre el modelo base sin necesidad de un modelo independiente. La longitud de contexto máxima es de 8192 tokens, suficiente para notas clínicas extensas. El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache-2.0. Aunque no se han publicado métricas de evaluación, la model card define objetivos de calidad (fidelidad ≥ 0,90, completitud ≥ 95 %, cero alucinaciones de medicamentos) que deben validarse en un conjunto de datos propio antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7 000 millones (base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer causal con atención de ventana deslizante y mecanismos de atención por capas, preentrenado por Alibaba Cloud. Sobre este base se ha aplicado un adaptador LoRA de rango 16 a 64 mediante QLoRA, utilizando la libreria Unsloth para acelerar el entrenamiento, con un mecanismo de fallback a PEFT + TRL si Unsloth no esta disponible. El entrenamiento consiste en una fase de supervisión (SFT) sobre pares de instrucciones en formato chat (nota clinica → resumen estructurado), usando la plantilla de chat del tokenizador base. La model card menciona la posibilidad de una etapa opcional de DPO sobre preferencias de clinicos, recomendada antes de uso en produccion, aunque no se confirma que se haya ejecutado.

El dataset de entrenamiento proviene de corpus publicos de estilo clinical-summarizer, con pares de mensajes en formato `messages`. La salida se genera como Markdown estructurado con las secciones SOAP y un indicador de confianza. El entrenamiento se configura mediante `train_config.yaml` y el bucle de entrenamiento en `train.py`, ambos incluidos en el repositorio. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de resumenes SOAP estructurados a partir de notas clinicas en texto libre, con secciones Subjective, Objective, Assessment, Plan, Follow-up y Confidence.
- Mecanismo de rechazo explicito: si una seccion no tiene evidencia suficiente en la nota, el modelo genera "Insufficient information" y asigna confianza baja, en lugar de inventar contenido.
- Uso de la plantilla de chat del modelo base, lo que permite interacciones multi-turno con instrucciones de sistema personalizadas.
- Soporte de generacion de texto autoregresiva con parametros de decodificacion configurables (temperatura, top-p, max_new_tokens).
- Capacidad de despliegue en entornos aislados (on-prem, VPC, air-gapped) al no requerir acceso a servicios externos.
- Incluye una demo Gradio autocontenida en el directorio `space/` para evaluacion interactiva.
- No soporta tool calling, vision, audio ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Redaccion de resumenes de alta hospitalaria: el modelo puede generar un borrador de resumen de alta estructurado a partir de la nota clinica completa, incluyendo hallazgos clave, plan y seguimiento, reduciendo el tiempo de documentacion del clinico.
- Asistencia en consultas ambulatorias: un medico puede pegar la nota de la consulta y obtener un resumen SOAP listo para revisar y firmar, integrable en el EHR.
- Triaje de notas de urgencias: el resumen estructurado permite a otros profesionales identificar rapidamente los puntos criticos (assessment y plan) sin leer la nota completa.
- Auditoria y control de calidad clinica: los resumenes generados pueden compararse con las notas originales para detectar omisiones o inconsistencias, usando el flag de confianza como indicador de notas incompletas.
- Formacion de personal sanitario: la demo Gradio permite a estudiantes y residentes practicar la elaboracion de resumenes SOAP comparando sus propios resumenes con los generados por el modelo.
- Integracion en pipelines de LLMOps hospitalarios: al ser un adaptador PEFT, puede servirse con vLLM o TGI en contenedores Docker, como se indica en `shared/Dockerfile.vllm`, para alto rendimiento en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define objetivos de calidad (fidelidad ≥ 0,90, completitud ≥ 95 %, tasa de rechazo calibrada, cero alucinaciones de medicamentos) pero indica explicitamente que no se reivindican numeros hasta que se ejecute una evaluacion sobre un conjunto de datos propio. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K ni metricas especificas de summarizacion (ROUGE, BERTScore) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B-Instruct en bfloat16 requiere aproximadamente 14 GB de VRAM; con el adaptador LoRA la carga adicional es minima (del orden de cientos de MB). En cuantizacion int8 se reduce a unos 7 GB y en int4 a unos 4 GB, aunque no se documentan cuantizaciones oficiales para este adaptador.
- GPU recomendadas: para uso local, una GPU consumer con 16-24 GB (RTX 4080, RTX 4090) es suficiente en bfloat16. Para produccion con alto throughput, se recomiendan A10, A100 o H100.
- Compatibilidad con GPU consumer: si, una RTX 3090 o superior puede ejecutar el modelo en bfloat16 sin problemas.
- Opciones de despliegue: el repositorio incluye `inference.py` para carga con transformers + PEFT, y un Dockerfile para vLLM (`shared/Dockerfile.vllm`) para servicio de alto rendimiento. Tambien es posible usar TGI o llama.cpp si se convierte el adaptador a GGUF, aunque no se documenta.
- Latencia y throughput: no disponible. Dependera del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor. Existen alternativas en el ecosistema de summarizacion clinica, como `Falconsai/medical_summarization` (tambien en Hugging Face) o proyectos como el de imkalpx que fine-tunea Llama 2 7B con LoRA para resumenes clinicos estructurados, pero no se dispone de datos de rendimiento comparables. La principal diferencia de este modelo es su enfoque en el formato SOAP con flag de confianza y su orientacion a despliegue hospitalario aislado. Sin datos de benchmarks, no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no esta preparado para notas clinicas en otros idiomas.
- No es un dispositivo medico: sus salidas deben ser revisadas y firmadas por un clinico autorizado. La model card lo indica explicitamente.
- Riesgo de alucinacion: aunque el mecanismo de rechazo reduce la invencion de contenido, no lo elimina por completo. La model card establece como objetivo cero alucinaciones de medicamentos o alergias, pero no se ha verificado.
- Dependencia del modelo base: cualquier limitacion de Qwen2.5-7B-Instruct (sesgos, errores de razonamiento) se traslada al adaptador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad real, lo que obliga a una evaluacion propia antes de uso en produccion.
- Modelo reciente con cero descargas y cero likes en Hugging Face, lo que indica falta de validacion por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda una etapa de DPO adicional antes de produccion, lo que sugiere que el adaptador actual puede no estar optimizado para todos los escenarios clinicos.
- El registro de prompts y salidas debe cumplir con las politicas de datos sanitarios (PHI) del hospital.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kayodekosi/medical-clinical-note-summarizer-7b
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de referencia (no del autor) sobre summarizacion clinica: https://github.com/EthanCsakany/Clinical-Note-Summarizer
- Repositorio de referencia (no del autor) con fine-tuning de Llama 2 para resumenes clinicos: https://github.com/imkalpx/medical-note-summarizer
- Articulo cientifico sobre sistemas de resumen de notas clinicas: https://www.nature.com/articles/s43856-025-01091-3
