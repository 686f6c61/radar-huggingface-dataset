# meghanathreddyd/medguard-qwen-ocr

## Resumen

MedGuard Qwen OCR es un ajuste fino mediante LoRA del modelo vision-lenguaje Qwen2.5-VL-3B-Instruct, orientado a la extraccion de informacion estructurada a partir de imagenes de recetas medicas indias, tanto manuscritas como impresas. El modelo recibe una imagen de una prescripcion y devuelve un objeto JSON con datos del medico, del paciente, la medicacion (dosis, frecuencia, duracion e instrucciones), el diagnostico y notas adicionales. Lo publica el usuario meghanathreddyd en Hugging Face, si bien la model card atribuye el desarrollo a Kushagra Wadhwa.

El modelo parte de Qwen2.5-VL-3B-Instruct, un VLM de 3.754.622.976 parametros con licencia Apache 2.0, y anade un adaptador PEFT/LoRA de rango 16 y alpha 32 entrenado sobre el dataset `naazimsnh02/medocr-vision-dataset`. El resultado es un modelo especializado en una tarea concreta de OCR medico con salida JSON, pensado para integrarse en sistemas de historia clinica electronica, farmacia o monitorizacion de pacientes. Su relevancia radica en la dificultad del dominio: la escritura manuscrita en recetas indias mezcla ingles y hindi y sigue convenciones de dosificacion locales (por ejemplo, "1-0-1" u "OD").

Se trata de un modelo pequeno (3B parametros) que cabe en GPU de consumo con cuantizacion, lo que lo hace atractivo para despliegues en entornos con recursos limitados. La informacion publicada no incluye resultados de benchmarks, por lo que la evaluacion de su calidad real queda pendiente de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer (Qwen2.5-VL) con adaptador LoRA (PEFT) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias truncadas a 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales) |
| Idiomas soportados | ingles, hindi (recetas indias mixtas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen2.5-VL-3B-Instruct) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer multimodal que combina un codificador visual con un modelo de lenguaje, capaz de procesar imagenes y texto de forma conjunta y generar respuestas en texto. Sobre esta base se aplica un ajuste fino con LoRA (r=16, alpha=32), lo que mantiene congelados los pesos originales y entrena unicamente los adaptadores de baja dimension. El entrenamiento se realizo en precision mixta bf16, durante 3 epocas, con batch efectivo de 8 (batch 1 y acumulacion de gradientes de 8 pasos), learning rate 2e-4, scheduler coseno, warmup del 5 por ciento, optimizador AdamW y longitud maxima de secuencia de 512 tokens.

Los datos de entrenamiento proceden del dataset `naazimsnh02/medocr-vision-dataset`, con 1.969 muestras de entrenamiento y 246 de validacion. Se trata de recetas medicas indias escaneadas y fotografiadas, manuscritas e impresas, etiquetadas con ground truth en JSON estructurado. El preprocesamiento convierte las imagenes a RGB y parsea las etiquetas desde un formato de etiquetas `<s_ocr>` a un JSON con los campos `doctor_name`, `clinic_name`, `patient_name`, `patient_age`, `date`, `medications`, `diagnosis` y `notes`, desglosando cada medicamento en `drug_name`, `dosage`, `frequency`, `duration` e `instructions`. No se documenta el uso de RLHF ni DPO; la metrica declarada es loss.

## Capacidades

- Extraccion de informacion estructurada de imagenes de recetas medicas en formato JSON con esquema fijo.
- Reconocimiento optico de caracteres (OCR) sobre texto manuscrito e impreso en recetas indias.
- Procesamiento de texto mixto ingles-hindi propio de las prescripciones indias.
- Identificacion de entidades: medico, clinica, paciente, edad, fecha, diagnostico y notas.
- Desglose de medicacion por farmaco con dosis, frecuencia (incluidas notaciones como "1-0-1" u "OD"), duracion e instrucciones.
- Generacion de texto conversacional a traves de la plantilla de chat del modelo base (rol de sistema y usuario).
- Capacidad multimodal imagen-texto heredada de Qwen2.5-VL-3B-Instruct.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta orientado a una tarea de extraccion directa.
- Capacidades de vision general, audio o modo thinking: no documentadas para este ajuste.

## Casos de uso

- Digitalizacion de recetas en farmacias: el modelo recibe la imagen de la prescripcion y devuelve un JSON con los farmacos y sus pautas, que puede volcarse directamente al sistema de dispensacion para reducir la entrada manual.
- Integracion en historia clinica electronica (EMR): el JSON estructurado se mapea a los campos del registro del paciente, agilizando la incorporacion de prescripciones escaneadas o fotografiadas en la consulta.
- Monitorizacion de pacientes: el modelo alimenta paneles que registran la medicacion prescrita y su duracion, permitiendo seguimiento de adherencia y revisiones programadas.
- Auditoria y cumplimiento medico: la extraccion estructurada facilita revisiones automaticas de prescripciones (por ejemplo, deteccion de pautas incompletas) por parte de equipos de calidad.
- Procesamiento por lotes de archivos historicos: dado su tamano de 3B parametros, puede desplegarse en GPU de consumo para digitalizar lotes de recetas escaneadas de forma economica.
- Asistencia a la documentacion clinica: el personal sanitario puede fotografiar una receta y obtener un borrador estructurado que luego verifica y edita, reduciendo el tiempo de transcripcion.
- Prototipado de pipelines de OCR medico: sirve como componente base para experimentar con extraccion de entidades en dominios sanitarios antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada en la model card es la loss de entrenamiento, sin valores numericos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 7,5 GB solo para los pesos (3.754.622.976 parametros), mas el codificador visual y las activaciones; en la practica se recomienda al menos 12-16 GB de VRAM.
- Con cuantizacion de 8 bits, la VRAM de pesos baja a unos 3,8 GB; en 4 bits, a unos 2 GB, aunque el modelo base debe cuantizarse por separado y el adaptador LoRA aplicarse encima.
- GPU recomendadas: A100 o H100 para mayor throughput en produccion; RTX 4090 (24 GB) para inferencia en bf16 con holgura; RTX 3090 (24 GB) igualmente valida.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080) y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (como se muestra en la model card), text-generation-inference (el modelo declara compatibilidad con endpoints), y previsiblemente vLLM y llama.cpp/Ollama para el modelo base cuantizado con el adaptador aplicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard Qwen OCR (este modelo) | 3,75 B | no disponible (entrenamiento a 512 tokens) | OCR de recetas indias a JSON | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | 3,75 B | no disponible en la informacion | VLM generalista | Apache 2.0 | Hugging Face |
| Otros modelos de OCR medico | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo con alternativas, por lo que la comparativa se limita a la relacion con el modelo base del que deriva.

## Limitaciones y advertencias

- Entrenado principalmente con formatos de recetas indias; el rendimiento puede degradarse en prescripciones de otras regiones por diferencias de escritura y nomenclatura de farmacos.
- La calidad de la escritura manuscrita afecta de forma significativa a la precision; recetas ilegibles produciran campos vacios o incompletos.
- Los nombres de farmacos pueden transcribirse parcial o incorrectamente con escrituras poco habituales; deben verificarse siempre antes de cualquier uso clinico.
- Las recetas en hindi o mixtas pueden tener menor precision que las exclusivamente en ingles.
- Riesgo de alucinacion inherente a los modelos generativos: puede completar campos ausentes o inventar datos si la imagen es ambigua.
- No es sustituto de la revision de un farmaceutico o clinico cualificado; no debe usarse como unica fuente de verdad para la dispensacion de medicamentos.
- Fuera de alcance: diagnostico de pacientes, toma de decisiones clinicas y decisiones de cuidados criticos en tiempo real.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad clinica del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meghanathreddyd/medguard-qwen-ocr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/naazimsnh02/medocr-vision-dataset
- Repositorio del autor: https://github.com/KushagraaWadhwa/Patient-Monitoring
