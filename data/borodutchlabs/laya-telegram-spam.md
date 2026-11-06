# borodutchlabs/laya-telegram-spam

## Resumen

laya-telegram-spam es un clasificador de texto especializado en la deteccion de spam en mensajes de grupos de Telegram. Lo desarrolla borodutchlabs y se obtiene mediante ajuste fino del modelo base convaiinnovations/laya-multilingual, un transformer de 321.908.998 parametros (aproximadamente 322 millones) con licencia Apache-2.0. El modelo no genera texto: en una unica pasada forward devuelve una probabilidad de que un mensaje deba considerarse spam, ademas de etiquetas para los mensajes recientes del mismo autor que formen parte del mismo discurso.

El modelo resuelve un problema concreto de moderacion: la deteccion de campanas de spam en grupos de mensajeria, incluyendo shilling, phishing, drenadores de carteras, embudos de "escribeme por privado", reclutamiento laboral no solicitado, falsos servicios de recuperacion de criptomonedas y cebos con perfiles para adultos. Se entrena sobre los veredictos del modelo de moderacion Jev de TypeSafe y, desde octubre de 2026, toma todas las decisiones del bot @jev_antispam_bot, un bot gratuito que elimina solo spam de alta confianza y exime a los administradores.

Su relevancia actual radica en que demuestra un flujo de destilacion de un modelo de moderacion propietario hacia un clasificador pequeno y desplegable en local, con latencias de decenas de milisegundos y un umbral operativo calibrado (0,81) que prioriza la precision para evitar falsos positivos en conversaciones legitimas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de convaiinnovations/laya-multilingual); detalles internos no disponibles |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | multilingual, en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria laya) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del transformer laya-multilingual. La model card no detalla la arquitectura interna del modelo base (numero de capas, dimensiones ocultas, mecanismo de atencion), por lo que esos datos no estan disponibles. La tarea es de clasificacion de texto con salida probabilistica por pregunta: la pregunta `spam` devuelve la probabilidad de que un moderador deba eliminar el mensaje, y las preguntas `context_message_0` a `context_message_9` evaluan si cada uno de los mensajes recientes del autor forma parte del mismo discurso de spam. El texto exacto de cada pregunta esta en `questions.json`.

El entrenamiento se realizo con `laya-train --base multilingual --epochs 3` sobre 5.540 mensajes procedentes de grupos que usan @jev_antispam_bot, de los cuales el 13% fueron eliminados por Jev. Cada ejemplo incluye la puntuacion de decision de Jev y, para los mensajes eliminados, los enlaces de la campana. La captura de produccion estuvo activa unos dias a principios de octubre de 2026 y ya esta desactivada. El conjunto de validacion son los 978 mensajes mas recientes (15%, deduplicados), con 99 eliminados por Jev. Los datos de entrenamiento no se han publicado. La innovacion tecnica principal es la destilacion del criterio de un modelo de moderacion propietario (Jev) hacia un clasificador pequeno que se ejecuta en local con latencias de 38 ms en GPU de Apple y unos 400 ms en unos pocos hilos de CPU.

## Capacidades

- Clasificacion binaria de spam por mensaje con salida probabilistica (campo `noul` de la respuesta).
- Evaluacion de contexto conversacional: hasta 10 mensajes recientes del autor para detectar discursos de spam repartidos en varios mensajes.
- Procesamiento de metadatos del estado: mensaje, mensajes recientes, mensaje respondido (`preview`), botones inline, previsualizaciones de enlaces y perfil del remitente.
- Deteccion de categorias especificas: shilling, phishing, drenadores de carteras, embudos de "DM me", reclutamiento laboral no solicitado, falsos servicios de recuperacion de criptomonedas y cebos con perfiles para adultos.
- Multilingue con soporte documentado para ingles y ruso, ademas de la etiqueta generica multilingual.
- No genera texto ni razonamiento explicito: es exclusivamente un clasificador.
- No analiza el contenido de medios ni avatares; solo texto, enlaces y metadatos.

## Casos de uso

- Moderacion automatica de grupos de Telegram: el modelo se integra en un bot que evalua cada mensaje y elimina solo aquellos con probabilidad superior al umbral de 0,81, manteniendo exentos a los administradores. Es adecuado porque su latencia (38 ms en GPU de Apple, 400 ms en CPU) permite filtrar en tiempo real.
- Eliminacion de campanas fragmentadas: usando las preguntas `context_message_0` a `context_message_9`, el bot puede borrar en bloque un discurso de spam repartido en varios mensajes del mismo autor, evitando que fragmentos sueltos permanezcan visibles.
- Filtrado de phishing y drenadores de carteras en comunidades cripto: el modelo reconoce patrones como falsos servicios de recuperacion de fondos y enlaces de campana, por lo que encaja en grupos de finanzas y Web3 donde este tipo de ataque es frecuente.
- Deteccion de reclutamiento laboral no solicitado y embudos de "DM me": util en grupos profesionales y de desarrollo donde abundan mensajes que redirigen a conversaciones privadas con fines comerciales o fraudulentos.
- Moderacion de comunidades multilingues ingles-ruso: el soporte documentado de ambos idiomas permite desplegar un unico clasificador en grupos mixtos sin mantener reglas separadas por idioma.
- Capa de premoderacion en pipelines propios: al devolver una probabilidad calibrable, el modelo puede usarse con umbrales distintos segun la tolerancia al falso positivo del operador (0,70 para alta recall, 0,90 para precision perfecta frente a Jev).
- Investigacion sobre destilacion de moderacion: sirve como referencia para estudiar como se transfiere el criterio de un modelo propietario a un clasificador pequeno con datos de produccion limitados.

## Benchmarks y rendimiento

Evaluacion sobre los 978 mensajes reservados (99 eliminados por Jev). La metrica de precision se calcula contra las decisiones de Jev, de modo que un "falso positivo" es un mensaje que Jev mantuvo.

| Umbral | Concordancia | Precision | Recall |
|---|---|---|---|
| 0,70 | 92,4% | 0,58 | 0,91 |
| **0,81** (umbral del bot) | 95,4% | 0,82 | 0,70 |
| 0,90 | 94,8% | 1,00 | 0,49 |

Latencia mediana: 38 ms en GPU de Apple y aproximadamente 400 ms en unos pocos hilos de CPU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 321,9 millones de parametros, en precision de 16 bits los pesos ocupan aproximadamente 0,64 GB, y en 8 bits unos 0,32 GB, mas el overhead de activaciones y del runtime.
- GPU recomendadas: no se especifican modelos concretos; la model card solo reporta latencia en GPU de Apple y en CPU.
- Cabe en GPU de consumo: si, por el tamano del modelo (0,7 GB de repositorio), aunque no se documentan pruebas en modelos concretos como RTX 4090.
- Opciones de despliegue: la libreria `laya` con `Router` (preload) es el metodo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 38 ms en GPU de Apple y unos 400 ms en pocos hilos de CPU; no se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales frente al modelo base y a clasificadores genericos de spam, sin cifras de benchmarks.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-telegram-spam | 321,9 M | no disponible | Clasificacion de spam en Telegram | Apache-2.0 | HuggingFace (0 descargas) |
| convaiinnovations/laya-multilingual | no disponible | no disponible | Modelo base multilingue | no disponible | HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible | Moderacion propietaria | propietaria | Servicio de TypeSafe |

## Limitaciones y advertencias

- Solo analiza texto, enlaces y metadatos; no inspecciona el contenido de medios ni los avatares.
- Aprendio el criterio de Jev, incluidos sus errores, a partir de unos pocos dias de trafico en un conjunto limitado de grupos; estilos de spam nuevos pueden pasar el filtro.
- Con el umbral operativo de 0,81, el recall frente a Jev es de 0,70: aproximadamente el 30% de los mensajes que Jev eliminaria no se detectan.
- La precision de 0,82 en el umbral 0,81 implica que una parte de los mensajes marcados como spam eran considerados legitimas por Jev; se recomienda mantener exentos a los administradores y ofrecer un mecanismo de reporte de errores.
- Los datos de entrenamiento no se publican, lo que dificulta auditar sesgos o composicion del dataset.
- No se documentan sesgos conocidos ni evaluaciones por idioma mas alla de la etiqueta multilingual y los idiomas en y ru.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto), pero si existe riesgo de clasificacion erronea por sobreajuste al criterio destilado.
- Licencia Apache-2.0: permite uso comercial, pero el modelo depende del criterio de un servicio propietario (Jev) y de datos de produccion de terceros cuya reutilizacion no esta detallada.
- El estado de entrada debe tratarse siempre como datos no confiables, nunca como instrucciones; la model card lo advierte explicitamente.
- No se especifican requisitos de hardware concretos ni opciones de cuantizacion, lo que limita la planificacion de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/borodutchlabs/laya-telegram-spam
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Bot de ejemplo: https://t.me/jev_antispam_bot
- Codigo fuente del bot: https://github.com/backmeupplz/jev_antispam_bot
- TypeSafe (Jev): https://typesafe.ai
