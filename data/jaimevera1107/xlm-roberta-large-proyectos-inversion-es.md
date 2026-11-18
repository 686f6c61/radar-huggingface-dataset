# jaimevera1107/xlm-roberta-large-proyectos-inversion-es

## Resumen

`xlm-roberta-large-proyectos-inversion-es` es un clasificador binario de textos en espanol de Colombia desarrollado por jaimevera1107 para el Observatorio Laboral y Ocupacional (OLO) del SENA. Su tarea es decidir si una noticia economica informa un proyecto de inversion concreto en Colombia: anunciado, confirmado, adjudicado, en ejecucion, terminado o una expansion. Forma parte del sistema OLO Radar, que monitoriza senales de inversion y empleo.

Tecnicamente es un `XLMRobertaForSequenceClassification` de 24 capas y 559.892.482 parametros, afinado mediante destilacion maestro-alumno: Gemini 3.5 Flash-Lite etiqueto 39.058 noticias de cinco medios economicos colombianos y el modelo aprendio a replicar ese criterio. El modelo base no es el XLM-RoBERTa original, sino un derivado de `intfloat/multilingual-e5-large` ya adaptado al dominio de ocupaciones y sectores, lo que aporta vocabulario y representaciones mas cercanas al ambito laboral y economico.

Su relevancia practica esta en el diseno orientado a precision: con el umbral recomendado de 0,9091 alcanza un 92,6 % de precision y un 58,8 % de cobertura sobre 775 noticias revisadas manualmente, frente al 23,5 % de cobertura del sistema anterior basado en regresion logistica sobre TF-IDF. La licencia MIT y su tamano moderado lo hacen desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLMRobertaForSequenceClassification (transformer encoder, 24 capas) |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | espanol (variedad de Colombia) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder bidireccional de tipo XLM-RoBERTa large, con 24 capas y 560 M de parametros, coronado por una cabeza de clasificacion binaria (`no_proyecto` / `proyecto_inversion`). El linaje parte de `intfloat/multilingual-e5-large` de Microsoft, pasa por `jaimevera1107/multilingual-e5-large-ocupaciones-es` (afinado para similitud de ocupaciones CUOC-CNO y sectores CIIU) y termina en esta cabeza de clasificacion. Hereda de la familia e5 la convencion de prefijar la entrada con `query: `.

El entrenamiento uso 39.058 noticias de La Republica, Portafolio, El Tiempo, Valora Analitik y El Colombiano. La entrada combina titulo, titulo extraido de la URL y entradilla (maximo 300 caracteres), no el cuerpo completo. Las etiquetas provienen de Gemini 3.5 Flash-Lite, que clasifico cada noticia segun una guia de definiciones con obligacion de citar textualmente la frase sustentadora; solo se considero positiva la marca de uno de los seis tipos de inversion con confianza alta, y las noticias ambiguas se excluyeron. 775 noticias revisadas a mano se reservaron exclusivamente para evaluacion, y otras revisiones humanas reemplazaron la etiqueta del maestro en el conjunto de entrenamiento. La division fue 80/20 estratificada con semilla 7: 31.246 para entrenar y 7.812 para fijar el umbral y medir.

La configuracion de ajuste congelo los embeddings y las 12 capas inferiores, entrenando las 12 superiores y la cabeza durante 2 epocas, con lote efectivo 32 (8 x 4 de acumulacion), tasa de aprendizaje 2e-5 con AdamW (decaimiento 0,01), calentamiento lineal del 6 %, longitud maxima de 256 tokens y precision mixta fp16. El entrenamiento completo se ejecuto en una unica NVIDIA RTX 2070 de 8 GB en unos 15 minutos. El umbral de 0,9091 se selecciono como la probabilidad mas baja con la que las predicciones positivas coinciden al menos un 90 % con Gemini en el conjunto reservado.

## Capacidades

- Clasificacion binaria de noticias economicas: distingue si el texto informa un proyecto de inversion concreto o no.
- Reconocimiento de las seis etapas del ciclo de un proyecto: confirmado, anunciado, adjudicado, en ejecucion, terminado o puesto en operacion, y expansion.
- Discriminacion de negativos especificos: cierres, despidos e insolvencias se clasifican como no proyecto (se reportan por separado en OLO Radar).
- Descarte de noticias economicas sin proyecto concreto: cifras macro, mercados, politica economica y opinion.
- Procesamiento de entradas cortas compuestas por titulo, titulo de URL y entradilla, con truncamiento a 256 tokens.
- Salida de probabilidad calibrada para operar con umbral configurable segun la precision exigida.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido: es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada: aunque el backbone es multilingue, el ajuste y la evaluacion se hicieron exclusivamente en espanol de Colombia.

## Casos de uso

- Monitorizacion de senales de inversion para observatorios laborales: integrado en OLO Radar, el modelo filtra el flujo diario de noticias de cinco medios economicos y solo eleva a revision humana las que superan el umbral de 0,9091, reduciendo el volumen de lectura manual con una precision del 92,6 %.
- Alertas tempranas de empleo regional: cuando se detecta un proyecto en fase de anuncio o adjudicacion, el sistema puede correlacionarlo con ocupaciones CUOC-CNO para anticipar demanda de perfiles laborales en la region afectada.
- Analisis de inversion sectorial: agregando las predicciones positivas por sector CIIU y departamento se obtiene un panel de flujos de inversion anunciada a partir de fuentes publicas, sin depender de encuestas.
- Seguimiento de expansiones empresariales: el modelo identifica noticias sobre nuevas plantas, sedes o lineas de produccion, utiles para estudios de competitividad y para actualizar bases de establecimientos.
- Filtrado previo en pipelines de analitica de medios: como etapa de bajo coste antes de un LLM generativo, descarta entre el 40 % y el 50 % de los textos con alta precision, reduciendo el gasto en inferencia de modelos mayores.
- Investigacion academica sobre inversion en Colombia: permite construir series temporales de proyectos anunciados a partir de archivos de prensa, con una cobertura documentada y un intervalo de confianza Wilson del 82,5 % al 97,1 % en precision.
- Clasificacion de boletines y comunicados corporativos: con un ajuste minimo del umbral, puede reutilizarse para detectar anuncios de inversion en notas de prensa empresariales, aunque el autor solo documenta el dominio de noticias.

## Benchmarks y rendimiento

Resultados medidos a umbral 0,9091 sobre datos no vistos durante el entrenamiento:

| Evaluacion | Documentos | Precision | Intervalo 95 % (Wilson) | Cobertura (recall) |
|---|---|---|---|---|
| Revision humana (muestra aleatoria revisada a mano) | 775 | 92,6 % | 82,5 % - 97,1 % | 58,8 % |
| Etiquetas de Gemini (20 % reservado) | 7.812 | 90,0 % | 88,3 % - 91,5 % | 78,3 % |

En la revision humana, el modelo marco 54 noticias como proyecto y 50 lo eran realmente. El sistema anterior del OLO Radar (regresion logistica sobre TF-IDF) encontraba solo el 23,5 % de los proyectos reales con las mismas etiquetas y el mismo nivel de exigencia.

Curva de compromiso precision-cobertura sobre las 7.812 noticias reservadas (contra etiquetas de Gemini):

| Precision exigida | Cobertura |
|---|---|
| 90 % | 78,3 % |
| 95 % | 61,2 % |
| 98 % | 48,0 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador de dominio especifico y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1-1,2 GB para los pesos (560 M de parametros) mas overhead de activaciones y tokenizador; en la practica cabe holgadamente en 2 GB.
- VRAM estimada en fp32: aproximadamente 2,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El autor entreno el modelo en una NVIDIA RTX 2070 de 8 GB en unos 15 minutos, lo que da una referencia directa del coste.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas modernas (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: `transformers` con PyTorch (referencia del autor), Text Embeddings Inference (el repo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime para CPU, y servicios de inferencia gestionada compatibles con la API de Hugging Face Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano y la longitud maxima de 256 tokens, se espera un throughput alto en GPU y viable en CPU por lotes, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaimevera1107/xlm-roberta-large-proyectos-inversion-es` | 560 M | 256 tokens | Clasificacion binaria de proyectos de inversion (es-CO) | MIT | Hugging Face |
| `intfloat/multilingual-e5-large` (modelo base de la familia) | 560 M | 512 tokens | Embeddings multilingues para recuperacion y similitud | MIT | Hugging Face |
| `jaimevera1107/multilingual-e5-large-ocupaciones-es` (modelo base directo) | 560 M | 512 tokens | Embeddings de ocupaciones CUOC-CNO y sectores CIIU | MIT (segun el modelo base) | Hugging Face |
| Regresion logistica sobre TF-IDF (sistema anterior de OLO Radar) | no aplica | no aplica | Clasificacion binaria de proyectos de inversion | no disponible | Interno del OLO |

No se dispone de comparativas publicadas frente a otros clasificadores especializados en deteccion de proyectos de inversion en espanol. La comparacion mas directa y documentada por el autor es contra el sistema TF-IDF previo, que obtenia un 23,5 % de cobertura frente al 58,8 % de este modelo con la misma exigencia de precision.

## Limitaciones y advertencias

- Deja pasar proyectos: con el umbral recomendado la cobertura es del 58,8 % en revision humana, es decir, aproximadamente 4 de cada 10 proyectos reales no se detectan. El sistema esta disenado para priorizar precision, no exhaustividad.
- Sesgo de fuente: entrenado solo con cinco medios economicos colombianos (La Republica, Portafolio, El Tiempo, Valora Analitik y El Colombiano); el rendimiento puede degradarse con otros medios, boletines corporativos o registros oficiales.
- Dependencia del etiquetado del maestro: las etiquetas de entrenamiento provienen de Gemini 3.5 Flash-Lite, por lo que el modelo hereda los sesgos y errores sistematicos de ese clasificador, parcialmente corregidos por revision humana en una fraccion del conjunto.
- Entrada limitada: solo procesa titulo, titulo de URL y entradilla (maximo 300 caracteres), truncado a 256 tokens; no lee el cuerpo completo de la noticia, por lo que proyectos descritos solo en el cuerpo pueden escaparse.
- Umbral critico: usar la clase de mayor probabilidad (corte 0,5) reduce drasticamente la precision. Es obligatorio aplicar el umbral de 0,9091 o reajustarlo sobre datos propios.
- Prefijo obligatorio: la entrada debe ir precedida de `query: `, convencion heredada de la familia e5; omitirlo altera las probabilidades.
- Ambito geografico y linguistico: solo espanol de Colombia y proyectos en Colombia; no se documenta comportamiento en otras variedades del espanol ni en otros paises.
- Licencia MIT: permite uso comercial y modificacion sin restricciones documentadas, pero el autor no ofrece garantias ni soporte.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y falsos negativos con la distribucion descrita en los benchmarks.
- Los textos de las noticias de entrenamiento no se publican con el modelo, lo que limita la reproducibilidad exacta del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaimevera1107/xlm-roberta-large-proyectos-inversion-es
- Modelo base directo: https://huggingface.co/jaimevera1107/multilingual-e5-large-ocupaciones-es
- Modelo raiz de la familia: https://huggingface.co/intfloat/multilingual-e5-large
- Perfil del autor: https://huggingface.co/jaimevera1107
