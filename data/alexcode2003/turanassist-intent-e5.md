# AlexCode2003/turanassist-intent-e5

## Resumen

TuranAssist intent classifier es un modelo de clasificacion de texto (text-classification) desarrollado por el usuario AlexCode2003 para el chatbot del proyecto TuranAssist de la Universidad «Turan». Su funcion es asignar cada mensaje del usuario a una de 53 intenciones predefinidas (saludos, pasos de admision, plazos, becas, despedidas, etc.) dentro de un asistente conversacional de dominio cerrado. El modelo se distribuye principalmente como grafo ONNX cuantizado a int8, con un peso de 113 MB, pensado para inferencia en CPU.

Tecnicamente no es un modelo generativo ni un transformer afinado de extremo a extremo: la variante seleccionada para produccion, `e5_frozen_logreg`, congela el encoder multilingue `intfloat/multilingual-e5-small` y entrena unicamente una regresion logistica sobre los embeddings resultantes. El autor comparo esta variante con un baseline TF-IDF a nivel de caracteres, con un ajuste fino completo del transformer y con la version ONNX int8, y eligio `e5_frozen_logreg` por su mejor exactitud en validacion cruzada (0.801 frente a 0.624 del modelo afinado).

Es relevante ahora porque ejemplifica un patron de despliegue muy comun en produccion real: un encoder multilingue pequeno congelado mas un clasificador lineal ligero, exportado a ONNX int8, que alcanza latencias de milisegundos en CPU monohilo y cabe en cualquier infraestructura. El modelo cubre tres idiomas (ruso, kazajo e ingles), esta publicado bajo licencia MIT y su repositorio ocupa 0.6 GB. No obstante, las cifras publicadas muestran un rendimiento desigual por idioma y registro, con una precision muy baja en ruso (0.476) pese a que el proyecto es de origen kazajo-rusoparlante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`intfloat/multilingual-e5-small`) con embeddings congelados y cabecera de clasificacion por regresion logistica; exportado a ONNX |
| Parametros totales | No especificado en la model card; el encoder base `multilingual-e5-small` tiene aproximadamente 118 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base admite 512 tokens |
| Tipos de cuantizacion | ONNX int8 (113 MB) y fp32 (449 MB) |
| Idiomas soportados | Ruso (ru), kazajo (kk) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX; no se listan safetensors ni GGUF en la informacion disponible |
| Tarea | Clasificacion de texto, 53 intenciones |
| Tamano del repositorio | 0.6 GB |
| Modelo base | `intfloat/multilingual-e5-small` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer multilingue (`multilingual-e5-small`) utilizado en modo congelado. Los embeddings de cada mensaje se calculan una sola vez y se alimentan a una regresion logistica entrenada sobre ellos (`e5_frozen_logreg`). Esta eleccion evita el coste de reentrenar el encoder y mantiene un clasificador extremadamente ligero, lo que explica el tamano de 113 MB en int8 y las latencias de 6.6 ms (p50) y 13.7 ms (p95) en CPU con un solo hilo. El resultado se exporta a ONNX con cuantizacion int8; la coincidencia top-1 con la version PyTorch es de 1.000 en fp32 y 0.950 en int8.

El autor evaluo cuatro variantes: un baseline TF-IDF a nivel de caracteres, el encoder congelado mas regresion logistica, un ajuste fino completo del transformer y la exportacion ONNX int8 de la variante congelada. El ajuste fino completo (`e5_finetuned`) obtuvo resultados notablemente peores (test top-1 0.695, macro-F1 0.660, escenarios 0.262), probablemente por sobreajuste con un conjunto de datos pequeno de dominio muy concreto. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se mencionan innovaciones arquitectonicas mas alla de la cuantizacion y la congelacion del encoder.

## Capacidades

- Clasificacion de intenciones en 53 categorias cerradas de un chatbot universitario (admision, becas, calendario academico, programas, examenes de acceso, integridad academica, etc.).
- Deteccion de entradas fuera de dominio (OOD) mediante umbral de confianza: la variante seleccionada rechaza correctamente el 0.859 de las muestras OOD.
- Clasificacion multilingue en ruso, kazajo e ingles, con el encoder `multilingual-e5-small` como base.
- Inferencia en CPU con latencias de milisegundos, apta para despliegue en servidores sin GPU.
- Conteo con tolerancia moderada a erratas tipograficas (precision 0.736 en el conjunto de test con errores ortograficos).
- No posee generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un clasificador discriminativo.
- No soporta tool calling, function calling ni flujos de agente; cualquier comportamiento conversacional debe implementarse en la capa que consume las etiquetas.
- No dispone de modo de razonamiento explicito ni de salida de cadenas de pensamiento.

## Casos de uso

- Enrutado de intenciones en el chatbot TuranAssist: cada mensaje entrante se clasifica en una de las 53 intenciones y se dirige al flujo de respuesta correspondiente. Es el caso de uso para el que fue disenado y entrenado.
- Filtrado previo y derivacion a humano: usando el umbral de 0.589 y la capacidad de rechazo OOD (0.859), el sistema puede desviar a un operador los mensajes ambiguos o fuera de alcance en lugar de responder con una etiqueta erronea.
- Clasificacion en infraestructura sin GPU: con 113 MB en int8 y 6.6 ms de latencia p50 en CPU monohilo, puede ejecutarse en contenedores pequenos, en el borde o en un servidor compartido con otros servicios.
- Etiquetado automatico de historicos de conversaciones: para analitica de consultas frecuentes, deteccion de temas recurrentes o generacion de datasets de entrenamiento para futuras versiones del modelo.
- Cascadeo delante de un modelo generativo: usar el clasificador para decidir rapidamente la intencion y evitar invocar un LLM en consultas simples, reduciendo coste y latencia del sistema completo.
- Priorizacion de colas de atencion: clasificar tickets o mensajes por intencion (por ejemplo, plazos de admision frente a consultas informativas) para ordenar la atencion segun urgencia administrativa.
- Soporte multilingue en un unico modelo: atender mensajes en ruso, kazajo e ingles sin desplegar tres clasificadores separados, aunque con la salvedad de la baja precision observada en ruso.

## Benchmarks y rendimiento

Resultados publicados en la model card (proporcion de respuestas correctas; intervalo de confianza de Wilson al 95 % entre corchetes cuando se indica):

| Modelo | CV acc | Test top-1 | Test macro-F1 | Umbral | Test con umbral | OOD rechazado | Test externo | Escenarios | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|---|---|---|---|---|
| `baseline: tfidf_char` | 0.598 | 0.805 [0.758; 0.845] | 0.811 | 0.356 | 0.698 [0.646; 0.746] | 0.808 [0.707; 0.880] | 0.636 [0.569; 0.699] | 0.831 [0.722; 0.903] | 0.8 | 1.6 |
| `e5_frozen_logreg` | 0.801 | 0.893 [0.854; 0.922] | 0.896 | 0.589 | 0.629 [0.575; 0.680] | 0.859 [0.765; 0.919] | 0.598 [0.530; 0.662] | 0.800 [0.687; 0.879] | – | – |
| `e5_finetuned` | 0.624 | 0.695 [0.642; 0.743] | 0.660 | 0.049 | 0.129 [0.096; 0.170] | 0.987 [0.931; 0.998] | 0.378 [0.315; 0.445] | 0.262 [0.170; 0.380] | – | – |
| `e5_frozen_logreg_onnx_int8` | 0.801 | 0.881 [0.840; 0.912] | 0.884 | 0.589 | 0.566 [0.511; 0.619] | 0.859 [0.765; 0.919] | 0.579 [0.511; 0.644] | 0.723 [0.604; 0.817] | 6.6 | 13.7 |

Comparacion de las exportaciones ONNX:

| Formato | Tamano | Memoria de sesion | Coincidencia top-1 con PyTorch | p50 (ms) | p95 (ms) |
|---|---|---|---|---|---|
| fp32 | 449 MB | ~375 MB | 1.000 | 12.1 | 21.1 |
| int8 | 113 MB | ~-303 MB (dato no interpretable en la model card) | 0.950 | 6.6 | 13.7 |

Precision por estilo de texto (int8, con umbral aplicado):

| Estilo | Precision |
|---|---|
| mixed | 0.857 [0.487; 0.974] |
| plain | 0.737 [0.643; 0.814] |
| typo | 0.736 [0.604; 0.836] |
| long | 0.509 [0.379; 0.639] |
| slang | 0.472 [0.344; 0.603] |
| translit | 0.189 [0.106; 0.314] |

Precision por idioma (int8, con umbral aplicado):

| Idioma | Precision |
|---|---|
| en | 0.792 [0.665; 0.880] |
| kk | 0.698 [0.565; 0.805] |
| ru | 0.476 [0.410; 0.543] |

Intenciones con peor F1: `goodbye` (0.63), `admission_steps` (0.71), `master_admission` (0.73), `practice` (0.73), `ent_discounts` (0.77), `academic_calendar` (0.80), `academic_integrity` (0.80) y `admission_deadlines` (0.80).

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- Modelo ONNX int8 de 113 MB; la version fp32 ocupa 449 MB con una memoria de sesion aproximada de 375 MB.
- No requiere GPU: la inferencia de referencia se midio en CPU con un solo hilo, con p50 de 6.6 ms y p95 de 13.7 ms en int8, y p50 de 12.1 ms y p95 de 21.1 ms en fp32.
- Cabe con enorme holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos con menos de 1 GB de memoria disponible, dado su tamano.
- Al ser un clasificador y no un modelo generativo, no aplican los runtimes habituales de LLM: no hay soporte de vLLM, llama.cpp, Ollama ni TGI. El despliegue es mediante ONNX Runtime u otro motor compatible con ONNX.
- El throughput no se publica en la model card; solo se documentan latencias por peticion en configuracion monohilo.
- Para lotes grandes o servicios de alto trafico, la latencia por peticion y el tamano reducido permiten escalar horizontalmente con varias instancias ligeras (o mediante paralelismo de hilos/GPU en ONNX Runtime), aunque no hay cifras publicadas de escalado.

## Comparativa con modelos similares

La model card solo compara variantes internas del mismo experimento, no con clasificadores externos. Comparativa de las variantes evaluadas:

| Variante | Enfoque | Test top-1 | Macro-F1 | Test con umbral | Escenarios | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `baseline: tfidf_char` | TF-IDF a nivel de caracteres | 0.805 | 0.811 | 0.698 | 0.831 | MIT (proyecto TuranAssist) | Referencia interna, no distribuida como modelo independiente |
| `e5_frozen_logreg` | Encoder e5 congelado + regresion logistica | 0.893 | 0.896 | 0.629 | 0.800 | MIT | Variante elegida en validacion cruzada |
| `e5_finetuned` | Ajuste fino completo del transformer | 0.695 | 0.660 | 0.129 | 0.262 | MIT | Descartada por bajo rendimiento |
| `e5_frozen_logreg_onnx_int8` | Version ONNX int8 de la variante congelada | 0.881 | 0.884 | 0.566 | 0.723 | MIT | Version desplegada en produccion |

No hay datos en la informacion proporcionada para comparar con otros clasificadores de intenciones publicos (por ejemplo, alternativas basadas en `LaBSE`, `xlm-roberta-base` o `distilbert-multilingual`): esa comparativa queda como no disponible.

## Limitaciones y advertencias

- Rendimiento muy desigual por idioma: la precision en ruso es de solo 0.476 con umbral aplicado, frente a 0.792 en ingles y 0.698 en kazajo. Para un asistente cuya base de usuarios es mayoritariamente rusoparlante, esto es un riesgo operativo serio.
- Registros informales muy degradados: transliteracion 0.189, jerga 0.472 y mensajes largos 0.509. Estos son precisamente los estilos habituales en un chat real.
- El ajuste fino completo del transformer resulto peor que congelar el encoder (top-1 0.695 frente a 0.893 y escenarios 0.262 frente a 0.800), lo que sugiere un conjunto de datos pequeno y posible sobreajuste. No conviene reutilizar ese checkpoint.
- La cuantizacion int8 reduce la coincidencia top-1 con PyTorch al 0.950 y baja la precision con umbral de 0.629 a 0.566 y los escenarios de 0.800 a 0.723: hay una perdida medible de calidad a cambio de tamano y velocidad.
- El umbral de decision (0.589) es un parametro critico de produccion: su valor implica un compromiso fuerte entre cobertura y rechazo OOD, y cambiar de dominio o de idioma exige recalibrarlo.
- Ambito cerrado: 53 intenciones especificas de la Universidad «Turan». Cualquier consulta fuera de ese catalogo debe gestionarse por la capa OOD; el modelo no generaliza a otras instituciones ni a otros dominios sin reentrenamiento.
- Errores observados con impacto funcional: confusiones entre `admission_steps` y `transfer_restore`, entre `ent_subjects` y `ent_discounts`, o entre `programs_list` y varias clases distintas. En procesos de admision, un error de enrutado puede traducirse en informacion incorrecta para el usuario.
- Riesgo de alucinacion: no aplica en sentido generativo, porque el modelo no produce texto; el riesgo equivalente es la asignacion de una etiqueta equivocada con alta confianza.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico, linguistico o de genero. El rendimiento inferior en ruso y en transliteracion puede penalizar a determinados grupos de usuarios.
- Licencia MIT, que permite uso comercial y modificacion, pero el modelo base `intfloat/multilingual-e5-small` tambien es MIT segun la informacion disponible; conviene verificar las condiciones de cualquier dataset de entrenamiento no documentado.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes, y todas las cifras proceden del propio autor. Las fechas de creacion y actualizacion registradas (octubre de 2026) no son coherentes con el estado actual, lo que anade incertidumbre sobre el mantenimiento del proyecto.
- No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni los procesos de anotacion, lo que dificulta auditar la calidad de las etiquetas.
- El modelo no incluye tokenizador, safetensors ni pesos GGUF en la informacion consultada: la integracion depende de los artefactos ONNX publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlexCode2003/turanassist-intent-e5
- Repositorio del proyecto (codigo y datos): https://github.com/AlexTrav/TuranAssist
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small

Las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo: los enlaces encontrados no guardan relacion con el proyecto TuranAssist ni con clasificacion de intenciones, por lo que no se incluyen. No se han localizado papers, blogs tecnicos, demos ni espacios de HuggingFace asociados.
