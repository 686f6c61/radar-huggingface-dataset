# nevermindai/carejev-omni

## Resumen

CareJev-Omni es un modelo multimodal de clasificacion clinica desarrollado por nevermindai y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo al uso: recibe un estado del paciente (texto, radiografia de torax, senales fisiologicas renderizadas o grabaciones de ruidos cardiacos), una pregunta y la lista de respuestas permitidas, y devuelve una probabilidad calibrada para cada respuesta, sin generar texto libre. Implementa la interfaz de decision tipada del autor (noul para si/no, choice y score) con una cabecera de decision de 256 slots, y se presenta como variante "drop-in" de Jev-Omni (akhilaaa3/Jev-Omni): mismo prompt, mismo diseno de cabecera y mismo contrato de carga.

El modelo parte de google/gemma-4-12B-it y se ajusta mediante un adaptador LoRA (etiquetas lora y adapter) sobre datos exclusivamente abiertos preparados con PyHealth, sin PHI acreditada. Con 11.959.730.224 parametros reales declarados en safetensors (unos 12.000 millones) y un repositorio de 32,4 GB, la propuesta compite por la via de la eficiencia frente a los modelos de razonamiento: un unico paso forward por pregunta, sin bucle de generacion ni salida de longitud variable, con el mismo interfaz para texto, ECG y sonidos cardiacos.

Su relevancia actual esta en el enfoque de calibracion: el autor reporta un error de calibracion esperado (ECE) de 0,018 y una desviacion media inferior a 2 puntos entre confianza declarada y precision real sobre el conjunto de test. Eso permite usar un umbral de confianza para decidir que respuestas se aceptan directamente y cuales se derivan a un proceso mas lento (un modelo de razonamiento o una persona). El modelo se distribuye exclusivamente para investigacion y no esta validado como dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en google/gemma-4-12B-it (etiqueta gemma4_unified) con cabecera de decision tipada de 256 slots; ajuste LoRA |
| Parametros totales | 11.959.730.224 (~12B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0, con license_link a la licencia de Gemma 4 |
| Formato de pesos | safetensors (libreria transformers); incluye adaptador LoRA |
| Modelo base | google/gemma-4-12B-it (relacion: finetune) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 32,4 GB |
| Fecha de publicacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal heredado de google/gemma-4-12B-it, etiquetado como gemma4_unified, sobre el que se anade una cabeza de decision de 256 slots que sustituye a la generacion de texto. El modelo se ajusta con LoRA y mantiene el contrato de carga de Jev-Omni, de modo que puede intercambiarse por este sin cambiar el codigo de integracion. La salida no es una secuencia de tokens, sino un vector de probabilidades sobre las respuestas permitidas de la pregunta, lo que convierte cada inferencia en un unico paso forward. Segun el autor, el orden en que se enumeran las respuestas no altera el resultado (invarianza posicional).

En cuanto a los datos, la model card indica que el entrenamiento se realizo unicamente con datasets abiertos preparados con PyHealth (github.com/sunlabuiuc/PyHealth), sin PHI acreditada. Las familias de tareas evaluadas incluyen ECG de 12 derivaciones renderizado, ruidos cardiacos, radiografia de torax, estadificacion del sueno sobre PSG renderizado, outcomes de UCI (SUPPORT2), datos demograficos de EHR de eICU y MIMIC-IV, preguntas de examen (MedMCQA) y clasificacion de especialidad en transcripciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion con probabilidad calibrada: devuelve una probabilidad por cada respuesta permitida, sin generar texto. El autor reporta un ECE de 0,018 y una discrepancia media inferior a 2 puntos entre confianza y precision.
- Interfaz de decision tipada: soporta los tipos noul (si/no), choice y score sobre una cabeza de 256 slots.
- Multimodalidad clinica: acepta texto, radiografia de torax, senales fisiologicas renderizadas (ECG de 12 derivaciones, PSG) y grabaciones de ruidos cardiacos.
- Clasificacion de preguntas de examen medico: evaluado sobre MedMCQA con 0,728 de exactitud agrupada.
- Clasificacion de especialidad en transcripciones clinicas: 0,445 en la familia "transcription specialty".
- Prediccion de outcomes en UCI: 0,688 sobre SUPPORT2.
- Estadificacion del sueno sobre PSG renderizado: 0,633, muy por encima de la tasa de la clase mayoritaria (0,212).
- Umbralizacion por confianza: la calibracion permite enrutar respuestas dudosas a un sistema de razonamiento o a revision humana.
- Invarianza posicional: el orden de las opciones no modifica la respuesta, lo que facilita el uso en pipelines automatizados.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni generacion de texto abierta.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Preseleccion de cohortes en investigacion retrospectiva: sobre registros abiertos tipo MIMIC-IV o eICU, el modelo puede responder preguntas cerradas sobre el estado del paciente y devolver una probabilidad por respuesta, lo que permite filtrar candidatos antes de una revision manual costosa.
- Enrutamiento en pipelines de razonamiento en dos etapas: usando el umbral de confianza, las preguntas con probabilidad alta se resuelven en un paso forward y solo las inciertas se envian a un modelo de razonamiento (System 2) o a un clinico. El autor reporta 0,897 de exactitud en la mitad de preguntas con mayor confianza frente a 0,741 en el total.
- Analisis automatizado de ECG de 12 derivaciones renderizado: clasificacion de hallazgos con 0,792 de exactitud y 0,812 de AUROC en preguntas si/no, adecuado para cribado masivo en estudios electrofisiologicos retrospectivos.
- Interpretacion de ruidos cardiacos: clasificacion binaria de grabaciones con 0,700 de exactitud, util para preetiquetar grandes volumenes de auscultaciones en investigacion cardiologica.
- Estadificacion del sueno sobre PSG renderizado: con 0,633 de exactitud frente a 0,212 de la clase mayoritaria, resulta util para generar etiquetas debiles en estudios de sueno a escala.
- Clasificacion de radiografia de torax: 0,870 de exactitud en la familia "Chest X-ray", aplicable a tareas de cribado en investigacion radiologica con datasets abiertos.
- Prediccion de outcomes en UCI: 0,688 sobre SUPPORT2, util para generar variables derivadas en estudios de mortalidad y estancia en cuidados intensivos.
- Etiquetado debil (weak labelling) y aumentacion de datasets: al devolver probabilidades y no texto, la salida se integra directamente como etiqueta ponderada en pipelines de entrenamiento posteriores.
- Control de calidad por desacuerdo: comparar la probabilidad del modelo con la anotacion humana permite detectar casos ambiguos o mal etiquetados en conjuntos de datos clinicos.
- Clasificacion de especialidad en transcripciones: 0,445 de exactitud, aprovechable para organizar grandes repositorios de transcripciones medicas abiertas.

## Benchmarks y rendimiento

Resultados sobre 15.629 preguntas de test retenidas, con particion disjunta por paciente y protocolo identico (mismos prompts, mismas opciones, misma particion) para todos los sistemas. La columna base es google/gemma-4-12B-it sin ajustar, puntuado por su distribucion de siguiente token sobre los numeros de opcion. Jev-Omni es el checkpoint publicado akhilaaa3/Jev-Omni ejecutado con su propio cargador. majority es la tasa de la clase mayoritaria.

| Familia de tarea | majority | CareJev | base | Jev-Omni |
|---|---:|---:|---:|---:|
| ECG de 12 derivaciones (renderizado) (15) | 0,737 | 0,792 | 0,587 | 0,529 |
| Ruidos cardiacos (3) | 0,694 | 0,700 | 0,429 | 0,404 |
| Radiografia de torax | 0,490 | 0,870 | 0,694 | 0,571 |
| Estadificacion del sueno (PSG renderizado) | 0,212 | 0,633 | 0,228 | 0,246 |
| Outcomes de UCI (SUPPORT2) (4) | 0,573 | 0,688 | 0,394 | 0,380 |
| EHR demografico (eICU / MIMIC-IV) (5) | 0,465 | 0,460 | 0,279 | 0,242 |
| Preguntas de examen (MedMCQA) | 0,303 | 0,728 | 0,715 | 0,708 |
| Especialidad en transcripciones | 0,264 | 0,445 | 0,417 | 0,421 |
| Todos los items de test (agrupado) | | 0,741 | 0,529 | 0,488 |
| Media sobre fuentes | | 0,739 | 0,561 | 0,528 |

Intervalos de confianza bootstrap al 95 % (500 remuestreos) para CareJev: agrupado 0,741 (0,734-0,747); media sobre fuentes 0,739 (0,728-0,750).

Calidad de ranking (AUROC, preguntas si/no, positivo = "Yes"):

| Familia de tarea | CareJev | base | Jev-Omni |
|---|---:|---:|---:|
| ECG de 12 derivaciones (renderizado) (15) | 0,812 | 0,672 | 0,656 |
| Ruidos cardiacos (3) | 0,626 | 0,495 | 0,543 |
| Outcomes de UCI | | | |

La tabla de AUROC esta truncada en la model card proporcionada: solo se han recibido las filas de ECG, ruidos cardiacos y el inicio de la de outcomes de UCI, sin valores. La model card indica ademas que 6 fuentes medidas no se tabulan porque un modelo que solo recibe sexo y edad responde igual de bien; esas fuentes siguen contando en los totales.

Calibracion declarada: ECE de 0,018; exactitud de 0,897 en la mitad de preguntas con mayor confianza frente a 0,741 en el total. No hay datos de benchmarks en la informacion proporcionada (MMLU, HumanEval, GSM8K u otros) distintos de los anteriores. No se han publicado resultados de replicacion independiente.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del recuento real de parametros (11.959.730.224); el autor no publica requisitos de hardware.

- Peso en precision completa: aproximadamente 24 GB en bf16/fp16 (11,96B x 2 bytes) solo para pesos.
- Peso en cuantizacion de 8 bits: aproximadamente 12 GB para pesos.
- Peso en cuantizacion de 4 bits: aproximadamente 6-7 GB para pesos.
- Overhead adicional: hay que sumar el coste del encoder multimodal y de las activaciones; para imagenes y senales renderizadas el pico de memoria es superior al del texto puro.
- GPU profesionales recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: con el repositorio publicado en safetensors a precision completa no cabe en GPUs de 24 GB sin cuantizar. Con cuantizacion de 4 bits, el modelo podria encajar en una RTX 4090 o RTX 3090 de 24 GB, aunque el autor no publica ninguna build cuantizada ni GGUF.
- Opciones de despliegue: transformers es la libreria declarada y la unica confirmada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints gestionados, sin detalle adicional.
- Latencia y throughput: no disponibles. La model card afirma que cada pregunta requiere un unico paso forward y que no hay bucle de generacion, lo que en teoria da latencia mas predecible que un modelo generativo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento agrupado (test retenido) |
|---|---|---|---|---|---|
| CareJev-Omni (nevermindai) | 11,96B (dato real de safetensors) | No disponible | Apache 2.0 (con license_link a Gemma 4) | Ingles | 0,741 |
| google/gemma-4-12B-it (base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | 0,529 |
| Jev-Omni (akhilaaa3) | No disponible | No disponible | No disponible | No disponible | 0,488 |

La comparativa se limita a los dos sistemas con los que el autor compara bajo protocolo identico. No se dispone de datos de contexto, licencia, idiomas ni numero de parametros de los dos terminos de comparacion. Comparado con la tasa de la clase mayoritaria (0,741 frente a valores por familia como 0,490 en radiografia de torax o 0,212 en estadificacion del sueno), la mejora es sustancial en varias familias, pero practicamente nula en EHR demografico (0,460 frente a 0,465 de majority).

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: no es un dispositivo medico, no ha sido revisado ni autorizado por ningun regulador y no esta validado en ninguna poblacion clinica real. No debe usarse para diagnostico, triaje, tratamiento, elegibilidad de ensayos, asignacion de recursos ni ninguna decision sobre personas reales.
- Sin garantia: se distribuye "tal cual", sin garantia expresa ni implicita de idoneidad para un fin concreto; el autor declina responsabilidad por su uso o por sus salidas.
- Conflicto de licencia: el campo license declara apache-2.0, pero license_link apunta a los terminos de la licencia de Gemma 4. Conviene verificar las condiciones reales antes de cualquier uso comercial, porque el modelo deriva de pesos de Gemma.
- Solo ingles: la model card declara unicamente el idioma en, lo que limita su uso en entornos clinicos hispanohablantes sin trabajo adicional.
- Sin generacion de texto: el modelo no explica ni justifica su decision, lo que impide auditar el razonamiento y complica la trazabilidad en contextos regulados.
- Riesgo de error en la opcion elegida: al no generar texto, no hay alucinacion en sentido estricto, pero si puede asignar una probabilidad alta a una opcion incorrecta; la utilidad depende enteramente de que la lista de opciones sea correcta y exhaustiva.
- Calibracion agregada: el ECE de 0,018 y la exactitud de 0,897 en el segmento de alta confianza son cifras globales. No se aportan curvas de calibracion por subgrupo demografico ni por familia de tarea.
- Sesgos de los datos de origen: el entrenamiento usa datasets abiertos (eICU, MIMIC-IV, SUPPORT2, MedMCQA, entre otros) preparados con PyHealth. Los sesgos de esas fuentes (poblacion, centro, periodo, codificacion) se trasladan al modelo.
- Seis fuentes no tabuladas: en 6 fuentes un modelo que solo recibe sexo y edad rinde igual; los numeros por fuente no medirian lo que aparentan medir, aunque siguen contando en los totales.
- Resultados autodeclarados: todas las cifras proceden de la model card del autor, sin revision por pares ni replicacion independiente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Dependencia de un proyecto previo: es una variante de Jev-Omni (akhilaaa3), por lo que hereda sus decisiones de diseno y sus limitaciones.
- Model card incompleta: la tabla de AUROC esta truncada en la informacion disponible y no se detallan tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.
- Sin informacion de contexto: no se publica la longitud de contexto soportada, dato critico para decidir si admite historiales clinicos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nevermindai/carejev-omni
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Jev-Omni (modelo del que es variante drop-in): https://huggingface.co/akhilaaa3/Jev-Omni
- Licencia de Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- PyHealth, framework de preparacion de datasets clinicos: https://github.com/sunlabuiuc/PyHealth
- Paper de Jev-Omni: no disponible
- Blog o demo del autor: no disponible

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados no guardan relacion con CareJev-Omni ni con inteligencia artificial y se han descartado.
