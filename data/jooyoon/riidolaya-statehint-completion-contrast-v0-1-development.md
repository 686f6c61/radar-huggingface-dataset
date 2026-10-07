# JooYoon/riidolaya-statehint-completion-contrast-v0.1-development

## Resumen

Riidolaya Statehint completion contrast es un artefacto de investigación publicado por el usuario JooYoon en HuggingFace, etiquetado como `text-classification`. No es un modelo de lenguaje generativo ni un transformer: se trata de dos clasificadores lineales softmax (regresión logística multinomial) implementados en Go que operan sobre un conjunto disperso de características textuales y predicen la intención de fragmentos acotados de prosa de desarrollo en coreano e inglés. La versión publicada corresponde al canal `development` v0.1 y contiene un brazo de control (`class_matched_control.rsh`) y un brazo con aumento de datos por contraste semántico (`matched_semantic_contrast.rsh`), de 65.728 bytes cada uno.

El modelo resuelve un problema muy delimitado: clasificar la intención primaria y el alcance visible de informes de estado y texto de desarrollo, con ocho columnas de intención definidas externamente en `INTENTS.en.md`. Un "informe de finalización" es tratado explícitamente como una afirmación textual, no como ejecución verificada, permiso ni éxito de la tarea. Los modelos no crean anotaciones, reacciones ni cambios de estado.

Su relevancia es exclusivamente de investigación: la propia model card declara que es una publicación de investigación con la IC de origen superada pero ambos diagnósticos externos no cualificados, que el brazo seleccionado solo pasa la puerta interna congelada de desarrollo, que no hubo calibración, evaluación final ni promoción, y que no está aprobado para producción. No se usó runtime de GPU en ningún momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal softmax (regresion logistica multinomial) sobre caracteristicas sparse con hashing, implementado en Go |
| Parametros totales | No disponible como recuento; pesos float32 (no ternarios) en dos artefactos de 65.728 bytes cada uno |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica / no disponible: el modelo no usa atencion ni ventana de contexto; consume un bundle de caracteristicas textuales |
| Tipos de cuantizacion | No disponible; los pesos se almacenan en float32 segun la model card |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos propios `.rsh` (custom version 2), cargados mediante `pkg/statehintwide.Load`; no safetensors ni GGUF |
| Tarea (pipeline) | Text classification |
| Clases de salida | Ocho columnas de intencion definidas en `INTENTS.en.md`; entre las citadas en la model card figuran completion, reference, progress, planned y blocker. El listado completo de las ocho no se reproduce en la informacion disponible |
| Bundle de caracteristicas | Contextual2048: unigramas y pares de palabras, n-gramas de caracteres de 2 a 5, hashing con signo, log-TF y normalizacion L2 |
| Fecha indicada en HuggingFace | Creado y actualizado el 2026-10-06 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal softmax entrenado sobre representaciones dispersas. Todo el texto se proyecta al bundle Contextual2048, que combina unigramas y pares de palabras, n-gramas de caracteres de longitud 2 a 5, hashing con signo, log-TF y normalizacion L2. Solo el texto entra en las caracteristicas; la intencion esperada es el objetivo de supervision. Los campos de anotacion, unidad y grupo no se usan como caracteristicas. Los dos brazos son modelos independientes: no se cargo ningun padre entrenado con las 840 familias completas ni pesos Laya anteriores. Cada brazo parte de cero con tasa de aprendizaje 0,02, 40 epocas, batch 32, decaimiento 0,001, semilla 1729 y temperatura 1, con 1.454 muestras y 1.840 actualizaciones por brazo. Las predicciones completas guardadas y recargadas coincidieron exactamente en ambos modelos.

El entrenamiento parte de una fuente ficticia original con 840 familias emparejadas. Antes del ajuste, los grupos declarados completos se asignaron mediante SHA256 de `completion-contrast-internal-split-1729:` seguido del ID de grupo original; los primeros 8 digitos hexadecimales como entero modulo 5 igual a 0 determinan desarrollo interno y el resto ajuste. Esto congelo 663 familias de ajuste y 177 familias de desarrollo interno (354 filas, 155 grupos declarados). Ambos brazos anaden 128 filas con el mismo perfil de 64 familias: 32 informes de finalizacion y 8 de cada una de las categorias reference, progress, planned y blocker. El brazo de control usa extracciones deterministas de familias completas ordenadas por SHA del lado de ajuste ya congelado; las 64 familias extranidas ya estaban presentes en los datos base de ajuste, por lo que suponen peso adicional y no 64 familias nuevas. El brazo de aumento aporta 32 pares conceptuales emparejados y 64 familias con redaccion original (128 filas KO/EN) a traves de 28 grupos canonicos conectados a la fuente. Los presupuestos finales son 1.326 filas base mas 128 filas extra por brazo. Los datos ficticios originales y las nuevas redacciones fueron generados y revisados por IA bajo Apache-2.0, no son verdad humana de referencia, y no se distribuye en el paquete ninguna frase de entrenamiento, aumento, desarrollo interno, validacion, calibracion o test.

## Capacidades

- Clasificacion de intencion en ocho columnas sobre prosa de desarrollo acotada, con la intencion primaria y el alcance visible como objetivos.
- Distincion entre informes de finalizacion y categorias como reference, progress, planned y blocker dentro del mismo perfil de clases.
- Capacidad de "propuesta con puerta" (gated proposal): el evaluador emite propuestas solo cuando supera confianza 0,9 y margen 0,05, con costes de falso P/C/Q de 1/10/3.
- Procesamiento bilingue coreano-ingles segun los metadatos del repositorio y la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada sobre caracteristicas textuales.
- No genera texto, codigo ni matematicas; no tiene modo de pensamiento ni capacidades de vision o audio.
- No crea anotaciones, reacciones ni cambios de estado de tarea, tal como declara explicitamente la model card.

## Casos de uso

- Etiquetado de intencion en documentacion de desarrollo: dado un fragmento de prosa KO/EN, el clasificador asigna una de las ocho columnas de intencion, lo que permite construir conjuntos etiquetados de forma automatica antes de una revision humana.
- Distincion entre afirmaciones de finalizacion y bloqueos reales: el modelo diferencia un "informe de finalizacion" de un blocker o de un plan futuro, util para auditar si un texto describe trabajo terminado o trabajo pendiente, siempre bajo la advertencia de que la finalizacion es una afirmacion textual y no ejecucion verificada.
- Enrutado de notas de progreso: en un sistema de seguimiento interno, la etiqueta predicha puede dirigir la nota hacia la cola de revision correspondiente (progreso, plan, bloqueo, referencia) mediante umbrales de confianza.
- Investigacion sobre aumento de datos: el repositorio incluye deliberadamente dos brazos (control y contraste semantico emparejado) con el mismo perfil de etiquetas, lo que lo convierte en material para estudiar el efecto del aumento con contraffactuales supervisados en clasificadores lineales.
- Analisis de estabilidad y metricas de calibracion: el fichero `RESULTS.controlled.aggregate.json` conserva fallos agregados, confusiones, NLL/Brier y metricas de estabilidad por idioma y por pares, util para reproducir analisis de robustez.
- Preprocesado de corpus KO/EN: como filtro previo para separar texto de desarrollo con intencion declarada de texto no relacionado, antes de alimentar otros sistemas.
- Experimentacion con artefactos propios en Go: sirve como referencia tecnica para cargar y ejecutar modelos `.rsh` version 2 mediante `pkg/statehintwide.Load` en un pipeline escrito en Go.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. La seleccion interna solo puede ordenar informes elegibles de desarrollo interno por coste de severidad, NLL de ocho intenciones y orden fijo de brazo.

Desarrollo interno (unica fuente de seleccion):

| Brazo | Correctos crudos (8 intenciones) | Propuestas con puerta correctas / propuestas | Coste de severidad | Precision de finalizacion | Puerta interna |
|---|---:|---:|---:|---:|---|
| Class-matched control | 317/354 (89,55 %) | 73/74 | 0,138418 | 1,00 | Pass, solo interno |
| Matched semantic contrast | 317/354 (89,55 %) | 72/73 | 0,192090 | 0,96 | Fail: precision de finalizacion |

Validacion previamente expuesta (solo diagnostico, peso de seleccion cero):

| Brazo | Correctos crudos (8 intenciones) | Propuestas con puerta correctas / propuestas | Coste de severidad | Familias de finalizacion correctas KO / EN | Puerta diagnostica |
|---|---:|---:|---:|---:|---|
| Class-matched control | 172/240 (71,67 %) | 39/39 | 0,2125 | 4/15 · 0/15 | Unqualified |
| Matched semantic contrast | 183/240 (76,25 %) | 48/48 | 0,1750 | 7/15 · 2/15 | Unqualified |

El evaluador de familias sin cambios usa confianza 0,9, margen 0,05, costes de falso P/C/Q de 1/10/3, coste de objetivo perdido promediado por familia KO/EN emparejada, cobertura 0,2, soporte minimo de 5 familias y 2 linajes declarados, precision de finalizacion 0,98 y coste de severidad estrictamente por debajo de 0,375. El soporte de finalizacion en desarrollo interno fue de 12/25 y 14/25 familias (KO/EN) para el control y de 10/25 y 14/25 para el aumento. Las probabilidades no estan calibradas y las pasadas de calibracion y test son cero. Mejores puntuaciones del aumento en la validacion expuesta no anulan su fallo de precision en desarrollo interno.

## Requisitos de hardware

- VRAM estimada: no aplica; la model card indica explicitamente que no se uso runtime de GPU.
- GPU recomendadas: no aplica; la inferencia se realiza en CPU sobre los dos artefactos `.rsh` de 65.728 bytes cada uno.
- Cabe en cualquier GPU consumer y en equipos sin GPU, dado el tamano del artefacto (aproximadamente 64 KiB por modelo).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El unico cargador citado es `pkg/statehintwide.Load` para el formato propio `.rsh` version 2 dentro del ecosistema Go del autor.
- Latencia y throughput: no disponibles como cifras portables. La model card advierte que los tiempos locales de ajuste y prediccion y los campos de heap de Go no equivalen a RSS del sistema operativo, memoria nativa/GPU ni a afirmaciones de benchmark portables.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores lineales con hashing empaquetados como artefactos propios en Go para intencion de prosa de desarrollo KO/EN). Los resultados de busqueda web recibidos no contienen referencias tecnicas relevantes a este artefacto ni a alternativas equivalentes.

## Limitaciones y advertencias

- Publicacion de investigacion: la IC de origen se supero, pero ambos diagnosticos externos quedan sin cualificar; el brazo de control solo pasa la puerta interna congelada y no esta aprobado para produccion.
- No hubo calibracion, evaluacion final ni promocion. Las probabilidades son "uncalibrated" y las pasadas de calibracion y test son cero.
- El resultado de la puerta interna no establece seguridad de produccion, segun la propia model card.
- El brazo con aumento falla la puerta interna por precision de finalizacion (0,96 frente al requisito de 0,98): hizo una propuesta de finalizacion incorrecta con puerta (24/25 correctas).
- El soporte de finalizacion en ingles queda por debajo del requisito de cinco familias en ambos brazos; cero propuestas de finalizacion en ingles por parte del control no implican precision perfecta en ingles.
- Un informe de finalizacion es una afirmacion textual, no ejecucion verificada, permiso ni exito del trabajo. El modelo no crea anotaciones, reacciones ni cambios de estado de tarea.
- Los datos de origen son ficticios y las redacciones nuevas fueron generadas y revisadas por IA bajo Apache-2.0; no son verdad humana de referencia y no constituyen observaciones de producto independientes.
- Riesgo de sesgo derivado de esa composicion sintetica y de la asignacion de grupos por hash, no de una muestra representativa de habla real.
- No se distribuyen frases de entrenamiento, aumento, desarrollo interno, validacion, calibracion ni test, por lo que la reproducibilidad de los datos no es posible desde el paquete.
- Ambito de idioma limitado a coreano e ingles y a prosa de desarrollo acotada; no es un modelo general.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero la propia model card desaconseja su uso en produccion por ausencia de cualificacion externa y de calibracion.

## Enlaces

- HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-completion-contrast-v0.1-development
- Model card en coreano, referenciada en el README: `README.ko.md` (mismo repositorio; URL directa no disponible en la informacion proporcionada)
- Definiciones de las ocho columnas de intencion: `INTENTS.en.md` (referenciado en la model card; URL directa no disponible)
- Resultados agregados: `RESULTS.controlled.aggregate.json` (referenciado en la model card; URL directa no disponible)
- Cargador del formato propio: `pkg/statehintwide.Load` (version 2 de `.rsh`; repositorio no disponible en la informacion proporcionada)
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos, demos) sobre este modelo en los resultados disponibles.
