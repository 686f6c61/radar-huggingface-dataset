# rntc/mc-bio-gliner-lymphome-ecrf-v3

## Resumen

mc-bio-gliner-lymphome-ecrf-v3 es un modelo de extraccion de informacion (information extraction) especializado en el dominio biomedico y clinico, desarrollado por el autor rntc. Su tarea concreta es rellenar automaticamente los campos del formulario de recogida electronica de datos (eCRF) del estudio de linfoma FoDoCa a partir de un dossier de paciente en frances compuesto por multiples informes clinicos. No es un modelo generativo de proposito general, sino un extractor de entidades orientado a un esquema fijo de campos.

El modelo se construye sobre la arquitectura GLiNER2 (una evolucion de GLiNER para extraccion de entidades zero-shot y con esquema, implementada en la libreria `gliner2`) y parte de los pesos de su predecesor `rntc/mc-bio-gliner-lymphome-ecrf-v2`. Cuenta con 160.218.773 parametros y un repositorio de 0,7 GB en formato safetensors. Su relevancia radica en que aborda una tarea de estructuración documental clinica de alta complejidad: 95 campos de eCRF, de los cuales 88 se extraen, con listas de valores controladas para 49 de ellos.

La version v3 introduce un esquema de campos alineado con el formulario FoDoCa (nombres como `1st_line_treatment` o `imaging_tepscan_realised`), lo que permite comparar directamente las salidas con las anotaciones sin tablas de correspondencia. Ademas, se reentrena sobre 567 dossiers ficticios mas largos que en v2 (mediana de 90.000 caracteres), con bloques de 45.000 caracteres. El modelo esta publicado bajo licencia MIT y solo soporta frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de informacion con esquema de campos), libreria `gliner2` |
| Parametros totales | 160.218.773 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra de contexto; procesa bloques de 45.000 caracteres |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GLiNER2, un enfoque de extraccion de entidades basado en un encoder transformer que, en lugar de generar texto, identifica spans (fragmentos) en el documento de entrada asociados a los campos definidos en un esquema. La particularidad de este diseno es que los campos no requieren parametros propios: cada campo entra en el modelo unicamente a traves de su libello y, cuando existe, de su lista de valores permitidos. Esto permite adaptar el modelo a un nuevo esquema sin reentrenar desde cero.

El entrenamiento de v3 parte de los pesos de v2 y ajusta el modelo al nuevo esquema FoDoCa con dos pasadas sobre 567 dossiers ficticios generados por la cadena v5 (version corregida del 25/11/2026). Los dossiers son mas largos que en v2, con una mediana de 90.000 caracteres, y cada uno se divide en bloques de 45.000 caracteres; una valor se asigna al bloque que contiene su documento fuente. Se usaron tasas de aprendizaje de 1e-5 para el encoder y 1e-4 para las cabezas, con ejemplos negativos ponderados a 0,1. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Extraccion de campos estructurados de eCRF a partir de texto clinico libre en frances.
- Extraccion basada en esquema: 95 campos definidos, de los cuales 88 se extraen (los 7 campos de texto libre no se extraen).
- Soporte de listas de valores controladas para 49 campos (valores autorizados del formulario mas valores frecuentes del conjunto de entrenamiento).
- Devuelve, por cada campo, un diccionario con `value`, `span`, `confidence` y otros metadatos.
- Procesamiento de documentos largos mediante segmentacion en bloques de 45.000 caracteres.
- Dominio especializado en linfoma y datos clinicos oncologicos.
- No soporta tool calling, agentes, vision, audio ni modo thinking (no disponible en la informacion).

## Casos de uso

- Poblado automatico de eCRF en ensayos clinicos de linfoma: el modelo lee el dossier del paciente (multiples informes) y rellena los 88 campos estructurados del formulario FoDoCa, reduciendo la transcripcion manual y los errores asociados.
- Armonizacion de datos retrospectivos: para cohortes historicas en formato texto libre, el extractor permite convertir informes en tablas estructuradas comparables con las anotaciones existentes, gracias a que los nombres de campo coinciden con los del formulario.
- Control de calidad de anotaciones: al comparar las salidas del modelo con las anotaciones humanas o de referencia se pueden detectar discrepancias y campos mal codificados en bases de datos clinicas.
- Investigacion en procesamiento de lenguaje clinico en frances: sirve como linea base reproducible para estudiar extraccion de informacion con esquema en documentos biomedicos largos.
- Prellenado asistido en entornos de investigacion clinica: el personal puede revisar y corregir las extracciones con puntuacion de confianza por campo, agilizando la revision sin sustituirla.
- Extraccion de variables de tratamiento e imagen: campos como `1st_line_treatment` o `imaging_tepscan_realised` se pueden extraer de forma automatizada para estudios de respuesta terapeutica, aunque con las limitaciones de precision documentadas.

## Benchmarks y rendimiento

Evaluacion sobre 30 dossiers ficticios mantenidos fuera del entrenamiento (75 bloques). Unidad: par (bloque, campo) con valor de referencia. P = valores correctos / valores producidos; R = valores correctos / valores de referencia. Una fecha se considera correcta si coinciden anio y mes.

| Sistema | Precision (P) | Exhaustividad (R) |
|---|---|---|
| v2 con el nuevo esquema, sin entrenamiento | 0,680 | 0,390 |
| mc-bio-gliner-lymphome-ecrf-v3 | 0,876 | 0,714 |

Los campos mas dificiles son los valores brutos de inmunohistoquimica (`history_*_ihc_raw`), las medidas de imagen (`imaging_dmax`, `imaging_number_of_affected_organs`) y los numeros de ciclos o lineas de tratamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 160 millones de parametros, en precision completa (fp32) serian aproximadamente 0,6 GB de pesos, y en fp16 alrededor de 0,3 GB, a lo que hay que sumar el coste de procesar bloques de 45.000 caracteres.
- GPU recomendadas: no disponible en la informacion; por tamano, una GPU consumer con suficiente memoria para el encoder y la longitud de entrada seria suficiente.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 160 M de parametros, aunque la longitud de los bloques (45.000 caracteres) condiciona el uso de memoria de activaciones.
- Opciones de despliegue: la model card proporciona el codigo `modeling_assign.ECRFExtractor` incluido en el repositorio, con `from_pretrained(..., device="cuda")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mc-bio-gliner-lymphome-ecrf-v3 | 160.218.773 | bloques de 45.000 caracteres | MIT | Hugging Face |
| mc-bio-gliner-lymphome-ecrf-v2 | no disponible | no disponible | MIT (segun repositorio del autor) | Hugging Face |
| GLiNER2 generico | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de proposito general no es directa, ya que este modelo esta especializado en un esquema clinico concreto y en frances. El unico comparable documentado en la informacion es su predecesor v2, sobre el que mejora en precision (0,680 a 0,876) y exhaustividad (0,390 a 0,714) con el nuevo esquema.

## Limitaciones y advertencias

- Los dossiers y sus anotaciones son generados por un modelo de lenguaje; la metrica mide el acuerdo con esas anotaciones, no con anotacion humana.
- La evaluacion sobre dossiers reales anotados esta pendiente.
- Modelo de investigacion, no validado para uso clinico.
- Solo soporta frances; no se documenta soporte multilingue.
- Riesgo de alucinacion o extraccion incorrecta en campos de valores brutos de inmunohistoquimica, medidas de imagen y recuentos de ciclos o lineas de tratamiento.
- La extraccion de fechas solo se evalua con coincidencia de anio y mes, lo que puede ocultar errores en el dia.
- Los 7 campos de texto libre no se extraen.
- No se dispone de informacion sobre sesgos demograficos o de otro tipo.
- Licencia MIT: permite uso comercial, pero la advertencia de no validacion clinica debe respetarse en cualquier despliegue en produccion sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rntc/mc-bio-gliner-lymphome-ecrf-v3
- Modelo base v2: https://huggingface.co/rntc/mc-bio-gliner-lymphome-ecrf-v2
