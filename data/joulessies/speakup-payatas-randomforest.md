# Joulessies/speakup-payatas-randomforest

## Resumen

SpeakUp Payatas es un clasificador de texto supervisado, no un modelo de lenguaje generativo. Lo desarrolla el usuario Joulessies para la plataforma comunitaria de reportes de incidencias de Barangay Payatas (Quezon City, Filipinas), y su funcion es asignar cada reporte ciudadano a una de 22 categorias de incidencia (desde incendios y emergencias medicas hasta quejas por basura o ruido) y estimar su nivel de urgencia. El modelo esta entrenado para tratar texto en tagalo, taglish e ingles, que es el registro real de los vecinos al enviar sus quejas.

Tecnicamente es un pipeline clasico de scikit-learn: vectorizacion TF-IDF sublineal con unigramas, bigramas y trigramas (hasta 12.000 caracteristicas) sobre un Random Forest de 200 arboles calibrado con `CalibratedClassifierCV` (sigmoide). Incluye un normalizador de jerga tagala (`SLANG_MAP`), un stemmer verbal conservador y filtrado de stop words en tagalo e ingles. El conjunto de entrenamiento declarado son 3.630 muestras balanceadas (165 por clase).

Su relevancia es local y de dominio muy acotado: demuestra como un modelo tabular/clasico ligero, sin GPU, puede resolver triaje de reportes ciudadanos en un contexto de gobierno de barrio. No es un modelo de proposito general ni compite con LLMs; su interes esta en el diseno del pipeline y en la integracion de normalizacion linguistica para taglish. El repositorio pesa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest de 200 arboles + CalibratedClassifierCV (sigmoide) sobre TF-IDF sublineal |
| Parametros totales | no disponible (modelo clasico basado en arboles; no aplica el concepto de parametros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF con n-gramas de hasta trigramas; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | tl (tagalo), en (ingles); incluye taglish |
| Licencia | MIT |
| Formato de pesos | joblib (artefacto de scikit-learn) |

## Arquitectura y entrenamiento

El pipeline combina tres etapas. Primero, un preprocesado linguistico especifico: normalizacion de jerga tagala mediante un mapa `SLANG_MAP`, un stemmer verbal descrito como conservador y eliminacion de stop words en tagalo e ingles. Segundo, una vectorizacion TF-IDF sublineal con unigramas, bigramas y trigramas y un maximo de 12.000 caracteristicas. Tercero, un Random Forest de 200 arboles cuya salida de probabilidad se calibra con `CalibratedClassifierCV` en modo sigmoide, lo que permite reportar confianzas interpretables por clase.

El entrenamiento se realizo sobre un dataset propio (`custom`) de 3.630 muestras balanceadas, con 165 ejemplos por cada una de las 22 categorias. No se documentan en la informacion disponible el numero de tokens, la composicion detallada del corpus ni procesos de RLHF o DPO, que no aplican a este tipo de modelo. El autor incluye un script `train.py` para reproducir los artefactos. Las cifras declaradas de exactitud (100,00% en categoria y 99,82% en urgencia sobre el split de test) deben interpretarse con cautela: con 165 muestras por clase y un split retenido, un 100% sugiere posible solapamiento entre train y test o un conjunto de evaluacion pequeno y poco diverso.

## Capacidades

- Clasificacion de texto en 22 categorias de incidencia ciudadana de barrio (seguridad, incendios, emergencias medicas, trafico, ruido, residuos, saneamiento, tramites, ayuda social, etc.).
- Prediccion de urgencia asociada a cada categoria (HIGH, MEDIUM, LOW) segun la tabla de enrutado del autor.
- Salida de probabilidad calibrada por clase, lo que permite umbralizar y derivar a revision humana.
- Enrutado automatico a la unidad responsable (Policia, BDRRM, BHERT, Lupon, secretaria, etc.).
- Manejo de tagalo, taglish e ingles mezclados en un mismo mensaje.
- Normalizacion de jerga tagala y stemming verbal para reducir variabilidad lexica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento; es un clasificador supervisado de una sola pasada.

## Casos de uso

- Triaje de reportes ciudadanos en la plataforma SpeakUp Payatas: cada mensaje entrante se clasifica en una de las 22 categorias y se enruta a la unidad correspondiente, reduciendo la carga manual de la secretaria del barangay.
- Priorizacion de emergencias: los reportes clasificados como `fire_hazard`, `medical_health`, `safety_concern` o `road_accidents` con urgencia HIGH se pueden escalar automaticamente a BDRRM, BHERT o Policia Station 13.
- Deteccion de ruido y molestias vecinales: mensajes sobre videoke o fiestas nocturnas se clasifican como `noise_nuisance` y se derivan a la CRO o patrulla de area con prioridad baja.
- Gestion de residuos y saneamiento: reportes sobre basura no recogida, alcantarillado obstruido o aguas residuales se separan en `garbage_concerns`, `drainage_flooding` y `sanitation_health` para su envio a proteccion ambiental o inspeccion sanitaria.
- Canal de ayuda social y tramites: solicitudes de ayuda economica, PWD, adultos mayores o permisos se clasifican en `social_welfare`, `clearance_concerns` o `service_assistance` y se derivan a secretaria, DSWD o PDAO.
- Mediacion de disputas: quejas de conflicto vecinal se clasifican como `legal_mediation` para su tratamiento por el Lupon Tagapamayapa.
- Filtrado y analitica de reportes: agregacion por categoria y urgencia para generar estadisticas semanales de incidencias del barangay a partir de los mensajes recibidos.

## Benchmarks y rendimiento

El autor declara las siguientes metricas sobre el split de test retenido:

| Metrica | Resultado declarado |
|---|---|
| Exactitud de categoria | 100,00% |
| Exactitud de urgencia | 99,82% |

Ejemplos de validacion cualitativa publicados por el autor:

| Texto de entrada (tagalo) | Categoria predicha | Confianza | Urgencia |
|---|---|---|---|
| "Napakalakas ng videoke kaninang madaling araw hindi kami makatulog" | `noise_nuisance` | 96,7% | LOW |
| "May sunog po sa may bandang Phase 3 malapit sa talipapa tulong!" | `fire_hazard` | 79,4% | HIGH |
| "Pumutok po ang tubo ng tubig sa tapat ng bahay bumabaha na" | `drainage_flooding` | 97,7% | MEDIUM |
| "Nanghihingi po ako ng tulong pinansyal para sa gamot ng nanay ko" | `social_welfare` | 97,7% | MEDIUM |
| "Hindi pa nahahakot ang basura dito sa amin tatlong linggo na mabaho" | `garbage_concerns` | 84,1% | HIGH |
| "May nag-aaway sa kalsada may dalang patalim" | `safety_concern` | 97,2% | HIGH |
| "Madilim po ang poste ng ilaw sa kanto namin pundi na ang bumbilya" | `electrical_concerns` | 70,8% | HIGH |
| "May asong gala na nanghahabol ng mga bata sa kalsada" | `animal_concerns` | 92,8% | MEDIUM |
| "Nawalan po ng kuryente dahil sumabog ang transformer sa poste" | `electrical_concerns` | 96,4% | HIGH |

No se han publicado resultados comparativos frente a otros modelos (MMLU, F1 macro, matrices de confusion) en la informacion disponible. Las cifras de exactitud deben tomarse como declaraciones del autor y no como validacion independiente.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el artefacto es un modelo joblib de scikit-learn; no requiere GPU.
- VRAM estimada: 0 GB; el modelo cabe en memoria RAM estandar (tipicamente unos cientos de MB con el vectorizador TF-IDF y los 200 arboles).
- GPU recomendadas: ninguna necesaria. Funciona en cualquier CPU moderna, incluidos portatiles de gama baja y dispositivos tipo Raspberry Pi.
- Cabe en cualquier GPU consumer, pero no la aprovecha.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP con FastAPI o Flask, o empaquetado en un contenedor Docker ligero. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo, la inferencia por peticion es de orden de milisegundos en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con la misma combinacion de dominio (gobierno de barrio filipino), idiomas (tagalo/taglish/ingles) y arquitectura (Random Forest + TF-IDF calibrado). Como referencia de categoria generica de clasificacion de texto:

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeakUp Payatas Random Forest | Random Forest + TF-IDF calibrado | tl, en | no disponible | MIT | Hugging Face, 0 descargas |
| Clasificadores lineales tipo Logistic Regression / SVM + TF-IDF | Clasico | configurables | no disponible | variable | Amplia en scikit-learn |
| Modelos transformer multilingues pequenos (p. ej. XLM-R base) | Neuronal | multilingue | 512 tokens tipico | variable | Hugging Face |
| LLMs multilingues de proposito general | Generativo | multilingue | miles de tokens | variable | Hugging Face |

La comparacion directa de rendimiento con esos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente acotado: entrenado para Barangay Payatas y sus 22 categorias; no generaliza a otros municipios ni a otros esquemas de triaje sin reentrenamiento.
- Las metricas declaradas (100% de exactitud en categoria) son sospechosamente altas; con 165 muestras por clase y un split retenido, es probable que exista fuga de datos o un conjunto de test poco representativo. No hay validacion cruzada ni evaluacion independiente publicada.
- Riesgo de sobreajuste al vocabulario y jerga del corpus de entrenamiento; mensajes con slang no visto, errores ortograficos o mezclas linguisticas atipicas pueden degradar la clasificacion.
- Riesgo de clasificacion erronea en urgencias: un reporte de incendio o violencia mal clasificado como categoria de baja urgencia puede retrasar la respuesta. Se recomienda umbral de confianza y revision humana para clases HIGH.
- Sesgo potencial derivado de un dataset `custom` del que no se documenta composicion, procedencia ni proceso de anotacion; no se puede auditar la representatividad demografica ni linguistica.
- Idioma limitado a tagalo, taglish e ingles; no soporta otras lenguas de Filipinas como cebuano, ilocano o bikol.
- La licencia MIT permite uso comercial y modificacion, pero el modelo depende de datos de residentes; conviene revisar el cumplimiento de la normativa filipina de proteccion de datos (Data Privacy Act) si se procesan reportes con datos personales.
- No es un modelo generativo: no redacta respuestas, no mantiene conversacion ni razona; solo asigna etiqueta y probabilidad.
- El repositorio tiene 0 descargas y 0 likes, sin senales de uso en produccion por terceros ni mantenimiento posterior a su publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/Joulessies/speakup-payatas-randomforest
- Script de reentrenamiento: `train.py` incluido en el repositorio del modelo
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos enlazados por el autor.
