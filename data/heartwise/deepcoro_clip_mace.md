# heartwise/deepcoro_clip_mace

## Resumen

DeepCoro-CLIP MACE es un modelo de clasificacion de video publicado en HuggingFace por el usuario heartwise bajo el identificador `heartwise/deepcoro_clip_mace`. Por su nombre, sus etiquetas y su pipeline declarado (`video-classification`), se trata de un modelo orientado a angiografia coronaria: procesa secuencias de imagen medica (angiogramas) y produce una prediccion de pronostico asociada a MACE (major adverse cardiovascular events, eventos cardiacos adversos mayores). La etiqueta `deepcoro-clip` sugiere una arquitectura de tipo CLIP adaptada al dominio de la coronariografia.

El modelo se distribuye con acceso restringido (gated): es necesario aceptar condiciones adicionales en HuggingFace antes de poder descargarlo, y la licencia declarada es `other`, no una licencia estandar como Apache 2.0 o MIT. El repositorio ocupa aproximadamente 0,4 GB, lo que situa el artefacto en un rango de pesos relativamente ligero. El modelo no acumulaba descargas ni "likes" en la informacion disponible, y fue creado y actualizado en septiembre de 2026.

La relevancia de este modelo es acotada y muy especifica: no es un modelo de proposito general, sino una herramienta de investigacion clinica en cardiologia intervencionista. Cualquier evaluacion seria requiere acceso al repositorio (restringido) y, previsiblemente, datos de angiografia con etiquetas de seguimiento clinico para validar su utilidad real, algo que no puede verificarse con la informacion publica disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `deepcoro-clip` apunta a una variante de tipo CLIP para video, sin confirmacion documental) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el campo de idiomas aparece vacio en HuggingFace; el modelo opera sobre video, no sobre texto) |
| Licencia | other (licencia no estandar; acceso restringido con aceptacion de condiciones) |
| Formato de pesos | no disponible (el repositorio ocupa 0,4 GB; no se especifica si son safetensors, PyTorch binario u otro formato) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura concreta, el numero de parametros, la resolucion de entrada, el numero de fotogramas por muestra, ni la funcion de perdida empleada. El identificador y la etiqueta `deepcoro-clip` apuntan a un esquema de codificacion conjunta tipo CLIP (pares video-texto o video-etiqueta) adaptado a coronariografia, y las etiquetas `coronary-angiography`, `prognosis` y `mace` indican que la tarea final es una clasificacion pronostica binaria o categorica sobre eventos adversos mayores.

Tampoco hay datos sobre el volumen del conjunto de entrenamiento, la composicion del dataset, la procedencia de los centros clinicos, ni sobre si se aplicaron tecnicas de ajuste fino con preferencias (RLHF, DPO) o si el modelo es puramente supervisado. Toda afirmacion adicional sobre el entrenamiento seria especulacion, por lo que se marca como no disponible.

## Capacidades

- Clasificacion de video medico: el pipeline declarado es `video-classification`, aplicado a secuencias de angiografia coronaria.
- Prediccion de pronostico cardiovascular: las etiquetas `prognosis` y `mace` indican salida orientada a estimar el riesgo de eventos cardiacos adversos mayores.
- Procesamiento de imagen medica: la etiqueta `medical-imaging` confirma el dominio de aplicacion, no la modalidad generica de vision natural.
- Generacion de texto: no disponible; no hay indicios de que el modelo genere lenguaje.
- Razonamiento, codigo o matematicas: no disponible; fuera del ambito del modelo.
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el modelo no procesa texto segun la informacion publica).
- Modo "thinking", vision adicional o audio: no disponible.

## Casos de uso

- Estratificacion de riesgo tras cateterismo: el modelo podria recibir el video de una angiografia coronaria y devolver una probabilidad de MACE, como apoyo a la decision clinica en pacientes revascularizados. Requiere validacion local antes de cualquier uso asistencial.
- Triaje de pacientes en ensayos clinicos: seleccionar subpoblaciones de alto riesgo para aleatorizacion o seguimiento intensificado, a partir de la salida del clasificador.
- Analisis retrospectivo de cohortes: procesar angiografias historicas de un hospital para estudiar la asociacion entre patrones de imagen y eventos adversos a largo plazo.
- Investigacion en imagen cardiovascular: usar el codificador como extractor de caracteristicas congelado (feature extractor) para tareas derivadas, como la prediccion de estenosis o de flujo TIMI.
- Control de calidad de lectura angiografica: comparar la prediccion automatica con el informe del hemodinamista para detectar discrepancias sistematicas en la valoracion de lesiones.
- Auditoria de sesgo entre centros: analizar si la prediccion se comporta de forma homogenea entre subgrupos demograficos, tarea habitual antes de desplegar un modelo medico.
- Educacion medica: usar las predicciones y su gradiente de explicabilidad como material didactico para residentes de cardiologia intervencionista, siempre con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos verificables de AUC-ROC, sensibilidad, especificidad, F1, c-index ni de comparaciones con otros modelos en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 0,4 GB, lo que sugiere que los pesos caben sin problema en cualquier GPU de consumo actual, pero no se especifica el presupuesto de memoria activacion durante la decodificacion de video (que depende de la resolucion y del numero de fotogramas).
- GPU recomendadas: no disponible (no hay indicaciones del autor).
- GPU de consumo: muy probablemente suficientes dado el tamano del repositorio, si bien esto es una inferencia a partir del peso del artefacto y no un dato confirmado. Una RTX 3060 de 12 GB o superior deberia cubrir una inferencia de una sola muestra en la mayoria de configuraciones razonables.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican directamente a un modelo de video clasificacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion publica no permite identificar con garantias modelos comparables del mismo autor ni de terceros con arquitectura y tarea equivalentes (clasificacion de angiografia coronaria para prediccion de MACE). Cualquier comparacion seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepcoro_clip_mace | no disponible | no disponible | no disponible | other (restringida) | gated en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card publica, paper, blog ni repositorio asociado accesible en la informacion consultada. Esto impide evaluar la validez metodologica del modelo.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones. La licencia `other` debe leerse con atencion antes de cualquier uso, especialmente comercial o en produccion clinica.
- Dominio medico regulado: un modelo que predice MACE es un producto sanitario en potencia. Su uso en decision clinica exige marcado CE o autorizacion equivalente, validacion prospectiva y gestion de riesgos conforme a la normativa aplicable.
- Riesgo de sobreajuste a la cohorte de entrenamiento: sin datos de procedencia ni de validacion externa, el rendimiento fuera del centro de origen es desconocido.
- Sesgos potenciales: los modelos de imagen medica heredan sesgos de la poblacion de entrenamiento (edad, sexo, etnia, tipo de equipo angiografico, protocolo de adquisicion). No se documenta ningun analisis de equidad.
- Alucinacion: en un clasificador la alucinacion se manifiesta como confianza alta en predicciones erroneas. Sin calibracion publicada no puede cuantificarse.
- Limitaciones de idioma y contexto: no aplicables en el sentido textual, pero se desconoce la robustez frente a variaciones de adquisicion (angulo de proyeccion, contraste, resolucion, fotogramas por segundo).
- Sin soporte ni mantenimiento verificables: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de comunidad, issues resueltos ni actualizaciones posteriores a septiembre de 2026.
- Fecha de creacion atipica: los metadatos indican 2026, dato que conviene verificar en la propia pagina de HuggingFace.

## Enlaces

- HuggingFace (acceso restringido): https://huggingface.co/heartwise/deepcoro_clip_mace
- Paper, repositorio de codigo, demo o blog del autor: no disponible
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos enlaces recuperados corresponden a documentacion de Power Query (Microsoft), a la pagina de desambiguacion "Query" de Wikipedia, al sitio de Query.ai y a una guia de Cleex, ninguno de ellos pertinente.
