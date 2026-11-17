# Dungchauu/mailcal-cv-adapter-v2

## Resumen

MailCal CV Adapter V2 es un adaptador LoRA publicado por el usuario Dungchauu sobre el modelo base Qwen2.5-1.5B-Instruct. Su proposito es la extraccion estructurada de informacion de curriculos (CV) en el dominio de reclutamiento, emitiendo la salida en un esquema JSON estandar denominado `recruit.cv-extract`. El adaptador forma parte de la fase 5 del proyecto MailCal y esta etiquetado para uso con texto en vietnamita e ingles.

Tecnicamente se trata de un ajuste fino de bajo rango (LoRA con r=8 y alpha=16) aplicado sobre todas las capas de proyeccion del transformer base (q, k, v, o, gate, up, down). El modelo base aporta una ventana de contexto amplia y capacidades de generacion e instruccion, mientras que el adaptador especializa la salida hacia un esquema fijo de campos de candidato: nombre, correo electronico, telefono, ubicacion, puesto y empresa actuales, experiencia, formacion y competencias.

La novedad principal de la version V2 es el entrenamiento especifico con una distribucion de "puesto ausente": cuando un candidato no tiene empleo actual, el modelo emite de forma limpia `state: "missing"` y `value: null` en lugar de alucinar el literal `"None"`. El autor reporta una perdida de validacion (dev loss) de 0.05729. El repositorio es de acceso publico bajo licencia Apache 2.0, aunque en el momento de la consulta no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen2.5-1.5B-Instruct); r=8, alpha=16, aplicado a q, k, v, o, gate, up, down |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-1.5B-Instruct tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita e ingles (segun etiquetas del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder de tipo causal orientado a instrucciones. El ajuste es un LoRA de rango 8 y alpha 16 insertado en todas las capas de proyeccion (q, k, v, o, gate, up, down), lo que permite especializar el modelo sin reentrenar los pesos completos. El resultado se distribuye como un adaptador PEFT que debe cargarse junto al modelo base mediante `PeftModel.from_pretrained`.

El entrenamiento esta orientado a una tarea de extraccion de informacion con salida en esquema JSON fijo (`recruit.cv-extract`). El autor no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si indica que la V2 incorpora una distribucion especifica de casos sin puesto actual para corregir el comportamiento de la version anterior, que tendia a generar `"value": "None"` en lugar de marcar el campo como ausente. La perdida de validacion reportada en el conjunto de evaluacion es de 0.05729. No se documentan tecnicas de RLHF, DPO ni innovaciones de decodificacion.

## Capacidades

- Extraccion estructurada de datos de curriculos al esquema JSON `recruit.cv-extract`.
- Identificacion de campos de candidato: nombre, correo electronico, telefono, ubicacion, puesto actual, empresa actual, experiencia, formacion y competencias.
- Manejo explicito de campos ausentes mediante `state: "missing"` y `value: null`, evitando la alucinacion de valores literales como `"None"`.
- Generacion de texto e instrucciones heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de vietnamita e ingles segun las etiquetas del autor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Parsing automatizado de curriculos en procesos de seleccion: el adaptador transforma el texto libre de un CV en un JSON con campos normalizados, lo que permite alimentar directamente un ATS (applicant tracking system) sin reglas ad hoc.
- Normalizacion de datos de candidatos en bases de datos de reclutamiento: al emitir un esquema fijo, facilita la deduplicacion y la comparacion entre candidatos con formatos de CV heterogeneos.
- Extraccion de contacto para campañas de captacion: el modelo identifica correo, telefono y ubicacion, lo que permite segmentar candidatos por region o canal de contacto.
- Deteccion fiable de desempleados o candidatos sin puesto actual: gracias al entrenamiento con distribucion de puesto ausente, el sistema puede distinguir entre "sin empleo" y "campo no encontrado" sin generar falsos positivos.
- Procesamiento de CV en vietnamita e ingles dentro de un mismo pipeline: el soporte bilingue permite abordar mercados de habla vietnamita y angloparlante con un unico modelo.
- Preprocesamiento para motores de busqueda de talento: la salida JSON estructurada se indexa directamente en Elasticsearch u otros motores, habilitando busquedas por competencias, experiencia o formacion.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, puede desplegarse en infraestructura modesta para validar flujos de extraccion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion (dev loss) de 0.05729 sobre el conjunto de evaluacion, que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 1.5B parametros, la huella es la del modelo base mas el adaptador (el adaptador LoRA es de pequeno tamano).
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo base, es plausible su ejecucion en GPU consumer, aunque el autor no lo especifica.
- Cabe en GPU consumer: no confirmado en la documentacion; el modelo base de 1.5B es compatible con GPUs de gama media en cuantizaciones habituales, pero no se aportan datos concretos.
- Opciones de despliegue: carga mediante `transformers` + `peft` segun el ejemplo del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MailCal CV Adapter V2 (este) | Adaptador LoRA sobre 1.5B | No disponible | Extraccion de CV a JSON | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face |
| Alternativas especializadas en extraccion de CV | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables especificos de extraccion de CV en la documentacion proporcionada. La comparacion mas directa posible es con el modelo base Qwen2.5-1.5B-Instruct, del que este adaptador hereda arquitectura, contexto y licencia, diferenciandose unicamente por la especializacion LoRA en la tarea de extraccion.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones, lo que limita la evidencia externa sobre su calidad y robustez en produccion.
- El autor no documenta el dataset de entrenamiento, su tamano ni su composicion, lo que dificulta evaluar sesgos y cobertura.
- El modelo esta especializado en un esquema fijo (`recruit.cv-extract`); cambios en el esquema requieren reentrenamiento del adaptador.
- El soporte linguistico se limita a vietnamita e ingles segun las etiquetas; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion en campos no presentes en el CV, aunque la V2 mitiga especificamente el caso del puesto ausente.
- No se documentan evaluaciones de sesgo ni de equidad, relevantes en el dominio de reclutamiento por posible discriminacion indirecta en la extraccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se especifican requisitos de hardware ni opciones de despliegue optimizadas (vLLM, llama.cpp), lo que puede complicar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dungchauu/mailcal-cv-adapter-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
