# d4rkninja/tanpo-hiring-GGUF

## Resumen

tanpo-hiring-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo tanpo-hiring, un ajuste fino especializado en flujos de trabajo de contratación y gestión de talento. Lo publica el usuario d4rkninja (DarkNinja Solutions, con la marca comunitaria DarkLab) y parte del modelo base unsloth/LFM2.5-1.2B-Instruct, un modelo instructivo de aproximadamente 1,17 mil millones de parámetros desarrollado por Liquid AI. El repositorio contiene únicamente pesos ya cuantizados, listos para ejecutarse en LM Studio, llama.cpp, Ollama o cualquier runtime compatible con GGUF, sin necesidad de aplicar adaptadores LoRA.

El problema que resuelve es de nicho pero muy concreto: en lugar de un modelo generalista, ofrece un especialista compacto para redactar descripciones de puesto, diseñar kits de entrevista estructurada, generar scorecards de evaluación, operar procesos de reclutamiento outbound, calibrar sesiones de debrief y gestionar comunicaciones de rechazo. Según la propia model card, el ajuste fino supera al modelo base en 9,2 puntos porcentuales en una rúbrica interna de 20 tareas de contratación (92,9% frente a 83,8%), con una mejora de 6,40 a 7,18 sobre 10 en una métrica heurística de calidad.

Es relevante ahora porque demuestra el patrón de "modelo pequeño y muy especializado" como alternativa a invocar modelos frontera por API: con 1,17 mil millones de parámetros y cuantizaciones que ocupan menos de 1 GB, se puede desplegar en local o en hardware modesto, lo que facilita el cumplimiento de requisitos de privacidad al procesar datos de candidatos. La contrapartida es que la información publicada es muy limitada: no hay datos de benchmarks estándar, ni longitud de contexto declarada, ni idiomas soportados, ni condiciones concretas de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; heredada del modelo base unsloth/LFM2.5-1.2B-Instruct (familia LFM2 de Liquid AI) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 mil millones) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en Q3_K_M, Q4_K_M, Q5_K_M y Q8_0 (segun la model card) |
| Idiomas soportados | No disponible |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | GGUF para llama.cpp y runtimes compatibles; los pesos fusionados se publican aparte en safetensors (d4rkninja/tanpo-hiring) |
| Modelo base | unsloth/LFM2.5-1.2B-Instruct |
| Tarea (pipeline) | text-generation (conversacional) |
| Tamano del repositorio | 4,9 GB |
| Artefactos relacionados | Adaptador LoRA: d4rkninja/tanpo-hiring-LoRA; pesos fusionados: d4rkninja/tanpo-hiring |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El unico dato fiable es la ascendencia: tanpo-hiring es un ajuste fino del modelo unsloth/LFM2.5-1.2B-Instruct, de la familia LFM2 de Liquid AI. Se trata, por tanto, de un transformer de aproximadamente 1,17 mil millones de parametros, no de un modelo de mezcla de expertos ni de un modelo de espacio de estados puro, ya que no hay ningun elemento en la informacion disponible que indique lo contrario. Cualquier detalle sobre el numero de capas, la dimension oculta, el tipo de atencion o el tamano de la ventana de contexto tendria que consultarse en la documentacion del modelo base, no en este repositorio.

Tampoco se especifican los datos de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Lo unico documentado es el procedimiento de publicacion (cuantizacion GGUF de un ajuste fino ya existente) y el resultado de la evaluacion propia: sobre una rubrica de 20 tareas de contratacion con configuracion de decodificacion identica, el ajuste fino obtiene un 92,9% global frente al 83,8% del modelo base, es decir, +9,2 puntos porcentuales. Por tematica, alcanza el 100% en descripciones de puesto, scorecards, diseno de bucles de entrevista, reclutamiento outbound y guiones de cribado, mientras que baja al 77,8% en kits de entrevista estructurada y al 87,5% en calibracion de debrief, encuadre de ofertas y operaciones de rechazo.

## Capacidades

- Generacion de texto conversacional de proposito general, con especializacion en dominios de recursos humanos y contratacion.
- Redaccion de descripciones de puesto y anuncios de vacante.
- Generacion de scorecards y rubricas de evaluacion de candidatos.
- Diseno de bucles de entrevista y kits de entrevista estructurada.
- Redaccion de guiones de cribado telefonico o asincrono.
- Mensajes de reclutamiento outbound (contacto a candidatos pasivos).
- Encuadre y comunicacion de ofertas (offer framing).
- Operaciones de pipeline de rechazo: comunicaciones, plantillas y flujos de cierre.
- Calibracion de sesiones de debrief tras las entrevistas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible; la model card solo menciona generacion de texto.

## Casos de uso

- Redaccion de descripciones de puesto: el modelo esta ajustado especificamente para este tipo de tareas, donde la rubrica reportada alcanza el 100%. Se le puede pasar un brief con el rol, el nivel, las responsabilidades y el rango salarial, y devuelve una descripcion publicable. Es adecuado porque el ajuste fino reduce la necesidad de plantillas manuales y de prompts largos.
- Generacion de scorecards de evaluacion: dado el perfil del puesto y las competencias requeridas, produce una rubrica con criterios y niveles de desempeno. La rubrica reportada en esta tematica es del 100%, y el formato estructurado encaja bien en herramientas de seguimiento de candidatos.
- Diseno de procesos de entrevista: construye bucles de entrevista completos, asignando etapas, objetivos por etapa y responsables. Es util en equipos pequenos de reclutamiento sin disenadores de procesos dedicados.
- Cribado inicial de candidatos: permite generar guiones de cribado estandarizados y preguntas de filtrado a partir de la descripcion del puesto, de modo que varios reclutadores apliquen el mismo criterio.
- Reclutamiento outbound: redacta secuencias de contacto personalizadas por perfil, con variantes de asunto y mensaje. Al ejecutarse en local, permite procesar listas de candidatos sin enviar datos personales a una API externa.
- Comunicaciones de rechazo y gestion del pipeline: genera mensajes de rechazo respetuosos y coherentes con la marca, ademas de flujos de seguimiento para candidatos en espera. La rubrica reportada en esta area es del 87,5%.
- Calibracion de debrief y toma de decisiones: ayuda a estructurar notas de entrevista y a preparar plantillas de discusion de comite, con un 87,5% en la rubrica de esta tematica.
- Prototipado rapido de herramientas internas de RRHH: al ocupar menos de 1 GB en cuantizacion Q4_K_M, se puede integrar en scripts locales de Python con llama-cpp-python o en un contenedor pequeno para demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es la rubrica interna de 20 tareas de contratacion declarada por el autor:

| Modelo | Rubrica global | Calidad heuristica (0-10) | Delta frente al base |
|---|---:|---:|---:|
| LFM2.5 base | 83,8% | 6,40 | -- |
| tanpo-hiring (ajuste fino) | 92,9% | 7,18 | +9,2 puntos |

| Tematica de contratacion | Rubrica |
|---|---:|
| Scorecards de contratacion | 100,0% |
| Diseno de bucles de entrevista | 100,0% |
| Descripciones de puesto | 100,0% |
| Reclutamiento outbound | 100,0% |
| Guiones de cribado | 100,0% |
| Calibracion de debrief | 87,5% |
| Encuadre de ofertas | 87,5% |
| Operaciones de pipeline de rechazo | 87,5% |
| Kits de entrevista estructurada | 77,8% |

Advertencia: estos resultados los publica el propio autor del ajuste fino, se miden con una rubrica no estandar y no son comparables con benchmarks academicos. No se documentan la metodologia de evaluacion ni el conjunto exacto de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 1,17 mil millones de parametros, los pesos ocupan aproximadamente 0,6 GB en Q3_K_M, 0,8 GB en Q4_K_M, 0,9-1,0 GB en Q5_K_M y 1,25 GB en Q8_0. Sumando cache KV y sobrecarga del runtime, el consumo realista se situa en el rango de 1,5 a 2,5 GB segun cuantizacion y contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o GPUs de datacenter como A100 o H100 ejecutarian el modelo con holgura, aunque estan muy sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, e incluso en iGPU con memoria compartida y en placas tipo Raspberry Pi o dispositivos moviles con llama.cpp.
- Ejecucion en CPU: viable y habitual para este tamano; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria, sin cifras publicadas.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, Jan, koboldcpp y otros runtimes compatibles con GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con Hugging Face Inference Endpoints. El soporte de vLLM y TGI para GGUF es experimental o limitado y no esta confirmado para esta arquitectura; si se necesita servir con esas herramientas, habria que usar los pesos fusionados en safetensors y verificar antes la compatibilidad con la familia LFM2.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No hay datos publicados de este ajuste fino frente a modelos de la competencia en tareas de contratacion. La comparacion con el modelo base si esta documentada por el autor. A continuacion se comparan alternativas de tamano similar como referencia general; los datos de contexto y licencia de esos modelos provienen de su documentacion publica, no de esta busqueda.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---:|---|---|---|---|
| tanpo-hiring-GGUF | ~1,17 mil millones | no disponible | Contratacion y talento | other (sin detallar) | GGUF |
| LFM2.5-1.2B-Instruct (base) | ~1,17 mil millones | no disponible en esta informacion | Proposito general instructivo | Licencia propia de Liquid AI | safetensors |
| Qwen2.5-1.5B-Instruct | ~1,54 mil millones | 32.768 tokens | Proposito general, buen multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7 mil millones | 8.192 tokens | Proposito general | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B IT | ~2,6 mil millones | 8.192 tokens | Proposito general | Licencia Gemma | safetensors, GGUF |

La ventaja diferencial de tanpo-hiring no es el rendimiento bruto, sino la especializacion de dominio y la ausencia de coste por token al ejecutarse en local. Frente a un modelo generalista del mismo tamano, un ajuste fino de nicho suele requerir menos ingenieria de prompts para producir formatos correctos, a cambio de perder flexibilidad fuera del dominio de contratacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos. Un modelo ajustado en exclusiva con datos de contratacion puede reproducir sesgos presentes en ofertas de empleo, criterios de cribado y lenguaje corporativo de RRHH. No debe usarse para filtrar candidatos de forma automatizada sin supervision humana.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad. En tareas de contratacion puede inventar requisitos legales, rangos salariales o normativa laboral; todo contenido generado debe revisarse.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados tampoco. La model card esta redactada en ingles y no se confirma el soporte de castellano.
- Restricciones de licencia: la licencia figura como "other" y no se detallan los terminos. Antes de cualquier uso comercial es obligatorio revisar los terminos del modelo base LFM2.5-1.2B-Instruct y del repositorio de pesos fusionados, ya que la licencia del ajuste fino no puede ser mas permisiva que la del modelo del que deriva.
- Decisiones de alto impacto: la propia model card recomienda revisar con criterio humano cualquier decision consecuente. En el contexto de contratacion, esto incluye cribados, rechazos y ofertas, donde pueden aplicar normativas laborales y de proteccion de datos.
- Datos de rendimiento no verificados: la mejora de +9,2 puntos procede de una rubrica propia del autor, sin conjunto de evaluacion publico ni replicacion independiente.
- Adopcion y soporte: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, y no hay documentacion adicional sobre el proceso de entrenamiento, el dataset o los hiperparametros. Es un artefacto experimental, no un modelo con respaldo de mantenimiento.
- Resultados de busqueda web no relevantes: las consultas realizadas no devolvieron informacion tecnica sobre este modelo, por lo que no hay fuentes externas que corroboren o amplien la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/d4rkninja/tanpo-hiring-GGUF
- Pesos fusionados en Transformers: https://huggingface.co/d4rkninja/tanpo-hiring
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-hiring-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
