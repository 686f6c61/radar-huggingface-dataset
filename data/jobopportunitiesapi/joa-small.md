# JobOpportunitiesAPI/joa-small

## Resumen

JOA Small es un adaptador LoRA de rango 16 entrenado sobre el modelo base ibm-granite/granite-4.2-3b de IBM (licencia Apache 2.0). Lo desarrolla Job Opportunities API (JOA), una empresa independiente con sede en Tesalonica (Grecia) que comercializa acceso por API a datos de ofertas de empleo. El modelo resuelve una tarea muy concreta: leer el texto de una oferta de trabajo y devolver 11 campos estructurados en JSON (titulo, empresa, ubicacion, moneda y rango salarial con periodo, seniority, tipo de trabajo remoto, fecha de publicacion y si el anunciante es una empresa de colocacion), dejando vacio cualquier campo que no aparezca en el texto.

Su relevancia actual es doble. Por un lado, demuestra que un ajuste fino pequeno sobre un modelo de 3.000 millones de parametros puede superar a un modelo juez mucho mayor en una tarea de extraccion de informacion restringida: en la arena de extraccion propia de JOA obtuvo 93,3 puntos frente a los 89,2 de su propio modelo maestro, Qwen3.5-27B, y a los 64,5 del granite-4.2-3b sin ajustar. Por otro, es un caso poco habitual de ficha publicada sin pesos: a fecha de 6 de octubre de 2026 el modelo esta entrenado y evaluado, pero los pesos no se han liberado, y la licencia JOA Model License descrita es solo un plan futuro, no una concesion vigente.

La informacion publicada no incluye la longitud de contexto, los idiomas soportados ni el formato de pesos del adaptador. El autor si documenta que el modelo responde de forma directa, sin cadena de razonamiento larga, con una mediana de 117 tokens de salida frente a los 4.411 del modelo base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre ibm-granite/granite-4.2-3b; arquitectura interna del modelo base no disponible |
| Parametros totales | Aproximadamente 3.000 millones en el modelo base, segun la denominacion ibm-granite/granite-4.2-3b; el numero exacto no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | JOA Model License (license: other, license_name: joa-model-license), planificada y no aplicable hasta la publicacion de los pesos; el modelo base se mantiene bajo Apache 2.0 |
| Formato de pesos | No disponible; los pesos no se han publicado |

## Arquitectura y entrenamiento

JOA Small no es un modelo entrenado desde cero, sino un adaptador LoRA de rango 16 sobre granite-4.2-3b de IBM. El entrenamiento consistio en una unica epoca sobre 80.000 ejemplos. Los datos de entrenamiento son ofertas de empleo recopiladas por Job Opportunities API, cuyos campos fueron anotados por Qwen/Qwen3.5-27B (Apache 2.0); solo se conservaron las anotaciones que estaban fundamentadas en el texto de la oferta, es decir, cuando el titulo, el salario u otro valor aparecia realmente en el anuncio. Las 250 ofertas de la arena de evaluacion y las 250 del conjunto de verificacion se excluyeron explicitamente del entrenamiento.

El computo utilizado fue el supercomputador EuroHPC Discoverer+ en Bulgaria, facilitado por la Empresa Comun EuroHPC a traves de una asignacion de acceso AI Factories Playground (proyecto EHPC-AIF-2026PG01-1124). La innovacion principal no es arquitectonica sino de planteamiento: el modelo esta entrenado para responder directamente en formato JSON compacto, sin traza de razonamiento, lo que reduce drasticamente la longitud de salida (117 tokens de mediana) y hace viable la inferencia en hardware de gama consumer. La ficha no documenta ninguna tecnica de decodificacion especulativa, atencion lineal ni otro mecanismo de eficiencia adicional.

## Capacidades

- Extraccion de informacion estructurada: dado el texto de una oferta de empleo, devuelve 11 campos en JSON (title, company, location, salary currency, salary min, salary max, salary period, seniority, remote type, posted date, agency).
- Manejo explicito de campos ausentes: deja un campo vacio cuando la oferta no lo declara, en lugar de inventarlo.
- Respuesta directa sin cadena de razonamiento larga, con salidas cortas y predecibles.
- Rendimiento bueno por campo segun la evaluacion propia: title 99, company 96, agency 96, salary period 96, salary min 94, salary currency 93, salary max 93, remote type 92, location 89, posted date 89, seniority 86.
- Uso de herramientas (tool calling): demostrado como no fiable. Con herramientas en lugar de una entrada preparada obtuvo F1 0.520 sobre 100 ofertas y solo 54 de 100 respuestas fueron parseables.
- Razonamiento de multiples pasos y comportamiento agentico: no soportados de forma utilizable segun la propia documentacion del autor.
- Capacidades multilingues: no documentadas.
- Vision, audio, modo de pensamiento u otras capacidades especiales: no disponibles.
- Ambito funcional unico: es un extractor de ofertas de empleo, no un asistente general.

## Casos de uso

- Enriquecimiento de agregadores de empleo: ingerir el texto almacenado de miles de ofertas y normalizar titulo, empresa, ubicacion y salario en columnas estructuradas para alimentar busquedas facetadas y filtros.
- Alimentacion de motores de busqueda salarial: al extraer moneda, minimo, maximo y periodo, permite construir indices comparables de bandas salariales por puesto y region.
- Deduplicacion y clasificacion de anunciantes: el campo agency (si el anunciante es una empresa de colocacion) junto con company permite separar ofertas directas de las intermediadas y agrupar publicaciones repetidas.
- Analitica de mercado laboral: agregar seniority, tipo de remoto y fecha de publicacion sobre volumenes grandes para generar informes de tendencias por sector o geografia.
- Integracion en un pipeline ETL por lotes: con un coste de aproximadamente 7 segundos por oferta en una GTX 1070 y salidas de unos 117 tokens, el modelo es adecuado para procesos nocturnos o por colas donde el coste por documento prima sobre la latencia.
- Normalizacion previa a la venta de datos via API: JOA puede ejecutar el modelo sobre su corpus almacenado para ofrecer campos estructurados a sus clientes de API sin anadir un modelo grande a su infraestructura.
- Preprocesado para sistemas de recomendacion de empleo: convertir texto libre en atributos tipados que alimenten un ranking o un sistema de matching candidato-oferta.
- Monitorizacion de mercado para reclutadores: extraer periodicamente seniority y remoto de las ofertas de la competencia para ajustar bandas y politicas de contratacion.
- Limitacion practica en todos los casos: el modelo necesita recibir el texto ya obtenido; no debe encargarsele de recuperarlo ni de navegar la pagina.

## Benchmarks y rendimiento

Arena de extraccion (250 ofertas reales, 11 campos, dos modelos juez, bootstrap emparejado; calificada el 2 de octubre de 2026). Dataset publico: https://huggingface.co/datasets/JobOpportunitiesAPI/joa-extraction-arena

| Modelo | Puntuacion (regla A) | Rango 95% | Puesto de 84 | Mediana de tokens de salida |
|---|---|---|---|---|
| JOA Small | 93,3 | 92,2-94,4 | 1 | 117 |
| Stock granite-4.2-3b | 64,5 | 59,7-69,0 | 71 | 4.411 |
| Maestro Qwen/Qwen3.5-27B | 89,2 | 86,9-91,4 | 4 | 2.946 |

Desglose por campo de JOA Small (regla A): title 99, company 96, location 89, salary currency 93, salary min 94, salary max 93, salary period 96, seniority 86, remote type 92, posted date 89, agency 96.

Conjunto de ofertas verificadas (250 anuncios recientes, cada uno verificado dos veces por Claude Opus contra la pagina en vivo y el flujo de solicitud; coincidencia exacta en las ofertas abiertas que los tres modelos respondieron; n = 213; calificado el 2 de octubre de 2026):

| Modelo | Precision |
|---|---|
| Stock granite-4.2-3b | 72,3% |
| JOA Small | 84,9% |
| Maestro Qwen/Qwen3.5-27B | 86,3% |

Prueba en tarjeta grafica consumer (4-5 de octubre de 2026, 100 ofertas distintas de JOA, entrada mas rica con la pagina y datos estructurados, referencias de Claude Opus): F1 0,888 (rango 95%: 0,85-0,92), aproximadamente 7 segundos por oferta en una NVIDIA GTX 1070.

Prueba con uso de herramientas (mismas 100 ofertas, herramientas en lugar de entrada preparada): F1 0,520, con solo 54 de 100 respuestas parseables.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada de un modelo base de aproximadamente 3.000 millones de parametros, no publicada por el autor): en FP16 en torno a 6-7 GB; en cuantizacion de 8 bits en torno a 3,5-4 GB; en cuantizacion de 4 bits en torno a 2-2,5 GB. Son estimaciones, no cifras confirmadas por el autor.
- Cabe en GPU consumer: la propia evaluacion del autor se ejecuto en una NVIDIA GTX 1070, con aproximadamente 7 segundos por oferta. Una GPU con 8 GB o mas de VRAM deberia ser suficiente.
- GPU de centro de datos recomendadas para produccion de alto volumen: A100, H100, L40S o similares, si se pretende procesar por lotes con paralelismo.
- Opciones de despliegue: no confirmadas por el autor. Al ser un adaptador LoRA sobre un modelo transformer de 3B, las rutas habituales serian vLLM o TGI para servicio concurrente, y llama.cpp u Ollama si se dispone de pesos en GGUF. Ninguna de estas opciones esta documentada en la informacion disponible.
- Latencia y throughput: aproximadamente 7 segundos por oferta en GTX 1070 segun el autor; no hay datos de throughput agregado ni de latencia en GPU de centro de datos.
- Requisito previo critico: los pesos no estan publicados, por lo que ninguna de estas configuraciones es ejecutable hoy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la arena (regla A) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JOA Small | ~3B (base) + LoRA r16 | No disponible | 93,3 (puesto 1 de 84) | JOA Model License, planificada | Pesos no publicados |
| ibm-granite/granite-4.2-3b | ~3B | No disponible | 64,5 (puesto 71 de 84) | Apache 2.0 | Pesos publicos en HuggingFace |
| Qwen/Qwen3.5-27B (maestro) | 27B | No disponible | 89,2 (puesto 4 de 84) | Apache 2.0 | Pesos publicos en HuggingFace |

La comparacion relevante es de eficiencia, no solo de puntuacion: JOA Small supera en la arena a un modelo casi nueve veces mayor y lo hace con una mediana de 117 tokens de salida frente a 2.946. En el conjunto verificado, sin embargo, el maestro de 27B sigue por delante (86,3% frente a 84,9%). No se dispone de datos de otros extractores especializados de ofertas de empleo con los que comparar.

## Limitaciones y advertencias

- Los pesos no estan publicados. La pagina es una ficha de estado, no un modelo descargable. La licencia descrita es un plan y no otorga ningun derecho mientras los pesos no se liberen.
- El modelo lee el texto almacenado por JOA, no la pagina en vivo. Ese texto suele ser el cuerpo de la descripcion; la cabecera, donde a menudo estan el titulo, la ubicacion y la fecha, puede faltar. Un campo ausente en la entrada no se puede extraer.
- No detecta que una oferta se haya cerrado. En el conjunto de verificacion clasifico algunas ofertas muertas como abiertas, porque el texto almacenado no contiene ninguna senal de cierre. JOA comprueba la vigencia por separado.
- No puede operar como agente con herramientas: con herramientas en lugar de una entrada preparada bajo a F1 0,520 y solo 54 de 100 respuestas fueron parseables. Hay que darle el texto ya extraido.
- Riesgo de alucinacion y de anotacion circular: las respuestas de referencia provienen de un modelo (Qwen3.5-27B) y los jueces tambien son modelos. El uso de dos jueces, una referencia verificada e intervalos de confianza reduce el riesgo, pero no lo elimina.
- Sesgos conocidos: no documentados por el autor. Al entrenarse solo con ofertas recopiladas por JOA, es probable que refleje los sesgos de cobertura de esa fuente, pero no hay datos publicados al respecto.
- Ambito limitado a una unica tarea: es un extractor de ofertas de empleo, no un asistente general ni un modelo de proposito multiple.
- Idioma: no se documenta que idiomas soporta. La evaluacion se hizo sobre ofertas de JOA, cuya distribucion linguistica no se especifica.
- Restricciones de licencia si finalmente se publica: uso, modificacion, ajuste, redistribucion y venta permitidos, incluidos productos comerciales y alojados, pero con obligacion de mostrar "Built with JOA Small by Job Opportunities API" con enlace a https://jobopportunitiesapi.org en la documentacion, pagina de acerca de o interfaz, y en la model card de cualquier derivado. Hay que conservar la licencia Apache 2.0 del modelo base y no se puede insinuar respaldo.
- Caveat de atribucion: el modelo no esta hecho, respaldado ni soportado por IBM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JobOpportunitiesAPI/joa-small
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Dataset de la arena de extraccion: https://huggingface.co/datasets/JobOpportunitiesAPI/joa-extraction-arena
- Licencia planificada: LICENSE.md en el repositorio del modelo (https://huggingface.co/JobOpportunitiesAPI/joa-small/blob/main/LICENSE.md)
- Sitio del desarrollador: https://jobopportunitiesapi.org
- Contacto general: hello@jobopportunitiesapi.org
- Asuntos legales: luca@tzekos.eu
- Telefono: +30 2311 113 603
- Datos societarios: Job Opportunities API (JOA), Loukas Tzekos, Didaskalisis Papathanasiou Vas. 79, 54629 Tesalonica, Grecia. VAT EL117613696.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardaban relacion con la ficha.
