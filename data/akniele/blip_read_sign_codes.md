# akniele/blip_read_sign_codes

## Resumen

`akniele/blip_read_sign_codes` es un modelo de respuesta visual a preguntas (VQA) especializado en la lectura del codigo negro (*zwartecode*) de las senales de trafico neerlandesas. Se trata de un fine-tune de `Salesforce/blip-vqa-base` sobre 622 imagenes recortadas de senales obtenidas de la plataforma Panoramax, con 147 imagenes de validacion. El modelo forma parte de un pipeline de cuatro etapas disenado para interpretar senales de trafico neerlandesas: deteccion del subpanel, clasificacion de la clase de senal, generacion del codigo negro y clasificacion del tipo de zona.

La motivacion del modelo es concreta: los clasificadores de senales no distinguen entre una senal de limite de peso de 7,5 toneladas y una de 20 toneladas, porque ambas comparten la misma clase. Este modelo resuelve esa ambiguedad leyendo el valor numerico del codigo negro impreso en la senal. Las excepciones son las senales de limite de velocidad, que el clasificador de la etapa 2 cubre con clases individuales gracias a la abundancia de datos de entrenamiento.

Con 361.230.140 parametros, una licencia CC BY-SA 4.0 y un rendimiento declarado del 91,2 % de exact-match sobre el conjunto de validacion, es una herramienta de nicho pero util para sistemas de asistencia a la conduccion, inventariado de infraestructura viaria y proyectos de cartografia colaborativa que operen en Paises Bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (Salesforce), variante VQA (`BlipForQuestionAnswering`) |
| Parametros totales | 361.230.140 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-lenguaje; procesa una imagen y una pregunta corta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF) |
| Idiomas soportados | no disponible (las preguntas de uso se formulan en ingles; las senales son neerlandesas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Modelo base | `Salesforce/blip-vqa-base` |
| Tamano del repositorio | 1,4 GB |
| Resolucion de imagen de entrenamiento | 384 x 384 |
| Epocas de fine-tuning | 3 |
| Imagenes de entrenamiento | 622 |
| Imagenes de validacion | 147 |
| Pipeline HF | visual-question-answering |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura BLIP en su configuracion de respuesta visual a preguntas: un codificador visual (ViT) que extrae caracteristicas de la imagen y un decodificador textual que genera la respuesta condicionada por la pregunta. BLIP combina un objetivo de entendimiento imagen-texto con generacion condicionada por la imagen, lo que lo hace adecuado para tareas de lectura de valores concretos en imagenes recortadas.

El fine-tuning se realizo durante 3 epocas con batch size 4, AdamW como optimizador, learning rate inicial de 0,01 y imagenes de 384 x 384 pixeles. El conjunto de entrenamiento consta de 622 recortes de senales y 147 recortes de validacion, derivados del dataset `Panoramax/Panoramax/classified_nl_road_signs`. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa. El modelo esta disenado para recibir exclusivamente recortes de senales, no fotografias completas de calle, lo que condiciona su integracion en pipelines previos de deteccion.

## Capacidades

- Lectura de valores numericos (codigo negro) en senales de trafico neerlandesas recortadas.
- Respuesta visual a preguntas (VQA) de dominio restringido: el modelo responde a preguntas como "What number do you see on the sign?".
- Especializacion en seis clases de senal: `maxaxleweight`, `maxweight`, `maxheight`, `maxlength`, `maxwidth` y `hazard_incline`.
- Integracion como tercera etapa de un pipeline de cuatro pasos (deteccion, clasificacion, generacion de codigo negro, clasificacion de zona).
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, vision general, audio ni razonamiento multi-paso.
- Capacidades multilingues: no disponible; la interfaz de pregunta se documenta en ingles y el dominio es exclusivamente neerlandes.

## Casos de uso

- Inventariado de infraestructura viaria: procesar lotes de recortes de senales de Panoramax para extraer los limites de peso, altura, longitud y anchura, alimentando bases de datos de cartografia viaria con valores numericos concretos en lugar de solo clases genericas.
- Asistencia a la conduccion para vehiculos pesados: dado un recorte de senal detectado en camara, el modelo devuelve el valor del limite (por ejemplo, 7,5 t) para que el sistema compare con la masa o dimensiones del vehiculo y emita una alerta.
- Validacion de mapas y datos de OpenStreetMap: contrastar los valores de limite registrados en la base de datos con los leidos de las imagenes de Panoramax para detectar discrepancias y priorizar revisiones manuales.
- Planificacion de rutas para transporte de mercancias peligrosas o sobredimensionadas: extraer limites de altura y anchura de las senales a lo largo de un corredor para calcular rutas compatibles con el galleo del vehiculo.
- Analisis de accesibilidad y seguridad vial: identificar senales de advertencia de inclinacion (`hazard_incline`) y limites de peso por eje (`maxaxleweight`) en tramos concretos para estudios de conservacion de firmes.
- Control de calidad del propio pipeline Panoramax: usar el 91,2 % de exact-match como referencia para decidir que recortes requieren revision humana antes de incorporarse al dataset clasificado.
- Investigacion en VQA de dominio especifico: servir como linea base para experimentos de lectura de texto en imagenes de senalizacion con vocabulario numerico acotado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Exact-match accuracy | 91,2 % | Validacion (147 imagenes) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es el exact-match sobre el conjunto de validacion propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4-1,5 GB solo para pesos, mas activaciones y cache del procesador; en la practica, 2-4 GB de VRAM son suficientes.
- VRAM estimada en FP16/BF16: en torno a 0,7-0,8 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). Tambien cabe en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; incluso en iGPU con memoria unificada puede ejecutarse con latencias mayores.
- Opciones de despliegue: `transformers` con `BlipProcessor` y `BlipForQuestionAnswering`; servible mediante TGI o un endpoint propio de Hugging Face Inference. No se publican pesos GGUF, por lo que llama.cpp y Ollama no estan disponibles de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akniele/blip_read_sign_codes` | 361.230.140 | no disponible | VQA sobre senales neerlandesas | CC BY-SA 4.0 | Hugging Face (51 descargas) |
| `Salesforce/blip-vqa-base` (modelo base) | ~361 M | no disponible | VQA general | BSD-3-Clause (segun model card original) | Hugging Face |
| `Panoramax/detect_face_plate_sign` | no disponible | no disponible | Deteccion de subpaneles de senal | no disponible | Hugging Face |
| Clasificador de clase de senal (etapa 2 del pipeline) | no disponible | no disponible | Clasificacion de clase de senal | no disponible | Hugging Face |

La comparativa con modelos de VQA genericos de mayor tamano (por ejemplo, modelos multimodales de miles de millones de parametros) no esta disponible en la informacion proporcionada. El modelo base `Salesforce/blip-vqa-base` es la referencia directa mas adecuada, ya que este fine-tune hereda su arquitectura y solo modifica el dominio de salida.

## Limitaciones y advertencias

- Dominio muy restringido: solo lee codigos negros de seis clases de senales neerlandesas; fuera de ese dominio el rendimiento es impredecible.
- Requiere recortes de senales, no fotografias completas de calle; el uso directo sobre imagenes sin recortar degrada la precision.
- Entrenamiento con solo 622 imagenes: riesgo de sobreajuste a condiciones de iluminacion, angulo y calidad de Panoramax; la generalizacion a otras fuentes de imagen no esta validada.
- El 91,2 % de exact-match implica aproximadamente 13 errores en 147 imagenes de validacion; en produccion se recomienda umbral de confianza y revision humana para valores criticos (limites de peso y altura).
- Riesgo de alucinacion de valores numericos plausibles pero incorrectos, especialmente en senales borrosas, parcialmente ocluidas o con codigos negros atipicos.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; revisar implicaciones para productos propietarios.
- Idiomas: no se documenta soporte multilingue; las preguntas de uso se formulan en ingles y el dominio es exclusivamente neerlandes.
- No se publican pesos GGUF ni variantes cuantizadas, lo que limita el despliegue en entornos sin `transformers`.
- El autor no documenta sesgos especificos ni evaluaciones de robustez frente a condiciones adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akniele/blip_read_sign_codes
- Modelo base: https://huggingface.co/Salesforce/blip-vqa-base
- Modelo de deteccion etapa 1: https://huggingface.co/Panoramax/detect_nl_subsigns
- Modelo de deteccion alternativo citado: https://huggingface.co/Panoramax/detect_face_plate_sign
- Dataset de senales clasificadas: https://huggingface.co/datasets/Panoramax/Panoramax/classified_nl_road_signs
- Plataforma Panoramax: https://panoramax.fr
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
