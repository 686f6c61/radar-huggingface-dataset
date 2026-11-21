# littleborek/cse481-qwen3-14b-clean-v2-lora

## Resumen

El modelo `littleborek/cse481-qwen3-14b-clean-v2-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-14B, desarrollado por el usuario littleborek en el contexto de un proyecto academico (CSE-481) de investigacion sobre datos financieros. No se trata de un modelo completo, sino de un checkpoint que contiene unicamente los pesos del adaptador, su configuracion de carga y la model card; el repositorio ocupa 0,3 GB y no incluye los pesos del modelo base ni el dataset de entrenamiento. El objetivo declarado es el ajuste fino para tareas de recuperacion, serializacion y citacion de evidencia en el dominio financiero, con soporte para turco e ingles.

El entrenamiento se realizo con QLoRA (cuantizacion NF4 con doble cuantizacion, computo en BF16) sobre una unica GPU RTX 5060 Ti, con un total de 64 pasos de optimizador y 112 registros de entrenamiento. El contexto de entrenamiento fue de 1280 tokens, con rango LoRA 16 y alpha 32. El autor advierte explicitamente que se trata de investigacion retrospectiva y no de un modelo validado de trading ni de asesoramiento financiero, y que la baja perdida de validacion (0,0000840594) no constituye prueba de razonamiento financiero.

La relevancia de esta ficha es doble: por un lado, documenta un caso de adaptacion LoRA de dominio muy especifico sobre un modelo Qwen3 de 14B; por otro, ilustra las limitaciones de evaluar adaptadores con conjuntos de test pequenos y plantillas, donde los resultados de exact-match no se traducen necesariamente en competencia general ni en generalizacion temporal. El acceso al repositorio requiere autenticacion, ya que se trata de un repositorio privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3-14B; QLoRA NF4 con doble cuantizacion en entrenamiento |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; el modelo base Qwen3-14B tiene 14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1280 tokens durante el entrenamiento; no se declara contexto de inferencia distinto del base |
| Tipos de cuantizacion | QLoRA NF4 con doble cuantizacion (entrenamiento); el adaptador se distribuye en safetensors; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); requiere cargar el base Qwen/Qwen3-14B por separado con Transformers y adjuntar con `PeftModel.from_pretrained` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-14B, un transformer decoder-only de 14B parametros, en la revision `40c069824f4251a91eefaf281ebe4c544efd3e18` (Apache-2.0). El entrenamiento utilizo QLoRA con cuantizacion NF4 y doble cuantizacion, computo en BF16, rango LoRA 16, alpha 32, dropout 0,05 y aplicacion a todas las proyecciones lineales. Se empleo perdida solo en la completacion (completion-only loss), microbatches de tamano 1 con acumulacion de gradiente 4, learning rate 1e-4, scheduler lineal, 5 pasos de calentamiento y semilla 481. El entrenamiento completo 64/64 pasos de optimizador en 1801,607 segundos sobre una RTX 5060 Ti, con todos los tensores del modelo y del optimizador en CUDA, sin offload a CPU o SSD.

El corpus de entrenamiento consta de 112 registros (56 de respuesta y 56 de rutas explicitamente especificadas) y 32 registros de validacion de respuesta. Las observaciones de origen abarcan desde el 2 de enero de 2025 hasta el 10 de septiembre de 2026; los datos historicos de 2024 anadidos posteriormente al proyecto no se usaron en este entrenamiento. El autor senala que no se registraron los hashes de los pesos base originales, por lo que la identidad de los pesos de entrenamiento no esta criptograficamente establecida; el SHA-256 del adaptador es `c9ae1f61e61cd3b7f73f14fdd3feb35837644763e8d13c6d871164f1324e2533`. No se realizo ninguna comprobacion de inferencia o despliegue en la publicacion.

## Capacidades

- Generacion de texto en turco e ingles sobre el modelo base Qwen3-14B.
- Recuperacion y serializacion de evidencia financiera: el adaptador fue entrenado para producir respuestas con identificadores de evidencia y estados, segun la evaluacion del autor.
- Citacion de evidencia: en el conjunto de 32 casos held-out, los IDs de evidencia pasaron de 22/32 (base) a 32/32 (adaptador).
- Cumplimiento de esquema JSON: validez de esquema 32/32 tanto en el base como en el adaptador.
- Rutas explicitamente especificadas: 32/32 de coincidencia exacta tanto en base como en adaptador, lo que segun el autor no demuestra eleccion autonoma de herramientas.
- Comportamiento de rechazo: en el subconjunto de 10 comprobaciones de rechazo, el base obtuvo 0/10 y el adaptador 10/10.
- No se declaran capacidades de vision, audio, tool calling autonomo ni modo de razonamiento extendido mas alla de lo que ofrece el modelo base Qwen3-14B.

## Casos de uso

- Extraccion estructurada de evidencia financiera: el adaptador puede generar respuestas con IDs de evidencia y estados sobre documentos financieros, util para pipelines de serializacion donde se requiere trazabilidad de la fuente. Es adecuado por su entrenamiento especifico en citacion, aunque debe validarse contra herramientas deterministas.
- Clasificacion y enrutamiento de consultas financieras con rutas predefinidas: dado un conjunto de rutas explicitamente especificadas, el adaptador reproduce la ruta correcta en el conjunto de prueba; util en asistentes internos con flujos cerrados.
- Generacion de respuestas con rechazo controlado: el adaptador mostro 10/10 en comprobaciones de rechazo, lo que puede emplearse en sistemas que deben declinar responder ante consultas fuera de alcance o sin evidencia suficiente.
- Prototipado de asistentes de analisis financiero en turco e ingles: al soportar ambos idiomas, sirve para demos y pruebas de concepto en entornos de habla turca, siempre con validacion humana.
- Investigacion academica sobre adaptacion LoRA de dominio: el checkpoint y su model card documentan un experimento reproducible (semilla, hiperparametros, tiempos) util para estudiar el efecto de QLoRA en tareas de recuperacion y citacion.
- Evaluacion de riesgos de sobreajuste en dominios regulados: el caso ilustra como una perdida de validacion muy baja (0,0000840594) no implica competencia general, y puede usarse como material docente sobre validacion temporal y fuga de datos.
- Integracion en pipelines de CI/CD para validacion de esquemas JSON: dado que la validez de esquema fue 32/32, puede emplearse como componente de generacion estructurada en pruebas automatizadas, con verificacion posterior contra herramientas deterministas.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion estrecha del autor sobre 32 casos held-out con plantilla, comparando base frente a adaptador:

| Metrica | Base Qwen3-14B | Adaptador clean-v2 |
|---|---|---|
| Respuesta exacta | 9/32 | 32/32 |
| IDs de evidencia | 22/32 | 32/32 |
| Estado | 24/32 | 32/32 |
| Validez JSON/esquema | 32/32 | 32/32 |
| Comprobaciones de rechazo (10) | 0/10 | 10/10 |
| Rutas explicitamente especificadas | 32/32 | 32/32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que estos resultados son de recuperacion, serializacion y citacion por coincidencia exacta, no de competencia financiera general ni de rentabilidad de trading, y que las fechas y benchmarks se solapan entre entrenamiento y test, por lo que no constituyen validacion temporal independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el adaptador en si ocupa 0,3 GB, pero requiere cargar el modelo base Qwen3-14B, cuyo consumo depende de la cuantizacion elegida.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una RTX 5060 Ti, lo que sugiere que el base en cuantizacion baja podria caber en GPU de consumo, pero no se realizo comprobacion de inferencia o despliegue.
- Cabe en GPU de consumo: no verificado por el autor; el adaptador se entreno en una RTX 5060 Ti, pero no se documento la inferencia.
- Opciones de despliegue: carga mediante Transformers y PEFT (`PeftModel.from_pretrained`); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| littleborek/cse481-qwen3-14b-clean-v2-lora | Adaptador sobre 14B | 1280 en entrenamiento | Apache-2.0 | Repositorio privado con autenticacion | Adaptador de dominio financiero, sin benchmarks estandar |
| Qwen/Qwen3-14B (base) | 14B | No disponible en la informacion | Apache-2.0 | Publico en Hugging Face | Modelo base generalista; en la evaluacion del autor obtuvo 9/32 en respuesta exacta |
| Otros adaptadores LoRA financieros sobre Qwen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- El autor declara explicitamente que es investigacion retrospectiva y no asesoramiento de inversion ni modelo de trading validado.
- La perdida de validacion muy baja (0,0000840594) no es prueba de razonamiento financiero; el conjunto de evaluacion es pequeno (32 casos) y con plantilla.
- Los resultados de exact-match en recuperacion, serializacion y citacion no demuestran competencia financiera general ni generalizacion.
- Las fechas y benchmarks se solapan entre entrenamiento y test, por lo que no hay validacion temporal independiente.
- En consultas reales de producto se observaron fallos de parsing JSON y de enrutamiento; una consulta de corte 2026-Q4 no vista fallo en lugar de demostrar generalizacion.
- Las preguntas de aceptacion preparadas pero no ejecutadas tienen cero ejecuciones y no pueden contarse como superadas; el trabajo esta pausado en un checkpoint.
- Los historicos de precios ajustados por proveedor se recuperaron despues del corte; no se establecio la vintage de ajuste historico, la completitud de sesiones de exchange ni la pertenencia a indices como point-in-time.
- El corpus de entrenamiento no incluyo la cobertura fundamental positiva ampliada posterior.
- La salida debe verificarse contra herramientas deterministas, disponibilidad en el momento de la divulgacion, evidencia y fecha de corte.
- No debe usarse el adaptador para afirmar resultados garantizados, precios objetivo, consejos de compra o venta ni cifras no respaldadas.
- La licencia Apache-2.0 del base no otorga derechos de redistribucion sobre datasets de mercado de terceros, que estan excluidos.
- El acceso requiere autenticacion al repositorio privado; no se realizo comprobacion de inferencia o despliegue.
- No se registraron los hashes de los pesos base originales, por lo que la identidad de los pesos de entrenamiento no esta criptograficamente establecida.
- Riesgo de sesgos y alucinacion: no documentado especificamente en la informacion disponible, pero aplicable por herencia del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/littleborek/cse481-qwen3-14b-clean-v2-lora
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Proyecto relacionado (privado): https://github.com/littleborek/engineering-economics
- Informe de entrenamiento (referenciado en la model card): `engineering-economics-main/reports/clean_v2_training_report.md` (dentro del repositorio privado anterior)
