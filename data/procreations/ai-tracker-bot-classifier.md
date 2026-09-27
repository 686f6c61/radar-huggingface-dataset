# ProCreations/ai-tracker-bot-classifier

## Resumen

El AI Tracker Bot Classifier es un clasificador de texto de 396 millones de parametros (~395.833.346 segun los pesos safetensors) desarrollado por ProCreations. Se trata de un ajuste fino del encoder ModernBERT-large de AnswerDotAI, cuya funcion es decidir si una alerta de "modelo nuevo" generada por el bot AI Tracker corresponde a un modelo o filtracion real que merece publicarse, o a una falsa alarma. El bot vigila catalogos de API, paginas de documentacion y precios, bundles de aplicaciones web, LM Arena, cuentas oficiales de X, sitemaps de noticias, organizaciones de Hugging Face y repositorios de codigo.

El problema que resuelve es muy concreto: las reglas de ledger del bot ya bloquean repeticiones exactas, pero dejan pasar errores de otro tipo, como etiquetas que no son modelos (`grok-voice` es una etiqueta de historial de llamadas, `nemotron_v3` un parser de razonamiento), rutas y alias de modelos ya conocidos, modelos antiguos que reaparecen por una fuente nueva, artefactos de investigacion en organizaciones oficiales de Hugging Face y slugs editoriales. El modelo lee un candidato cada vez, junto con el contexto que el bot ya tiene, y devuelve `P(false_alarm)`.

Su relevancia practica esta en el despliegue: funciona como ONNX INT8 en una Raspberry Pi 5, con unos 500 tokens de entrada por candidato, y actua como filtro de ultima linea que retiene alertas solo cuando `P(false_alarm) >= 0.96`. La verificacion falla en abierto: si el servicio cae, da error o expira, el bot publica exactamente como antes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large, ajustado para clasificacion de texto) |
| Parametros totales | 395.833.346 (~396M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (truncado en el despliegue); entrada tipica de ~500 tokens, percentil 99 de 770 |
| Tipos de cuantizacion | INT8 (ONNX, `onnx/model_int8.onnx`); pesos safetensors en el repo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (INT8); tags de transformers y text-embeddings-inference |

Otros datos: pipeline `text-classification`, biblioteca `transformers`, tamano del repositorio 3,8 GB, 2 likes y 0 descargas en el momento de la consulta. Etiquetas de salida: `0 = false_alarm`, `1 = post`.

## Arquitectura y entrenamiento

La base es ModernBERT-large, un encoder transformer de 396M de parametros, sobre el que se ha realizado un ajuste fino supervisado para clasificacion binaria. La salida es una probabilidad de falsa alarma que el bot compara con un umbral. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion, algo coherente con una tarea de clasificacion y no de generacion. Tampoco se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset.

El entrenamiento combina datos sinteticos con el historial real del bot. El conjunto real son 102 candidatos anunciados entre el 21 de julio y el 27 de septiembre de 2026, etiquetados a partir de lo que el operador mantuvo o elimino y de los motivos de borrado registrados. De esos 102, 20 (15 falsas alarmas y 5 publicaciones duplicadas) ya quedan bloqueados por las reglas de ledger actuales, por lo que el conjunto de prueba honesto son los 82 restantes: 68 publicaciones reales y 14 falsas alarmas. Las estimaciones proceden de validacion cruzada de 5 pliegues; cada pliegue entrena con los datos sinteticos mas 4/5 del conjunto real. La receta publicada usa un "soup" de 2 semillas, y el modelo final se reentreno con los 82 candidatos.

La innovacion destacable no esta en la arquitectura sino en el formato de entrada (v2), disenado especificamente para el dominio: incluye fuente (nombre, id, tipo, host), etapa (filtracion o publicacion) y flags, fecha de deteccion, el ID candidato, el fabricante y la clave de ledger inferida, el historial previo del candidato bajo esa misma clave, detalles de catalogo, otros IDs anadidos o eliminados en el mismo cambio, los 8 modelos mas similares ya presentes en el ledger y los 4 de mayor version de la familia (con etapa y fecha de primera deteccion), y las lineas de diff alrededor del candidato. El propio tracker renderiza ese texto mediante `training/tracker/alertClassifier.js`, y un servicio en loopback de la Raspberry Pi (`training/pi-service/serve.py`) lo puntua.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve `P(false_alarm)` para un candidato dado.
- Distincion entre modelos o filtraciones reales y senales espurias: etiquetas que no son modelos, rutas y alias, artefactos de investigacion, fixtures de Hugging Face y slugs editoriales.
- Uso del contexto conversacional del bot: historial del candidato, cambios simultaneos en el mismo catalogo y diff de las lineas relevantes.
- Comparacion contra el ledger existente: similitud con modelos ya conocidos y pertenencia a una familia concreta con su version mas alta.
- Inferencia cuantizada en INT8 sobre hardware de muy bajo consumo (ONNX Runtime en Raspberry Pi 5).
- Integracion como servicio HTTP local con comportamiento de fallo en abierto.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un encoder de clasificacion, no un modelo generativo.
- No es multilingue: solo se declara ingles.

## Casos de uso

- Filtrado de falsas alarmas en un sistema de monitorizacion de modelos: el clasificador recibe los candidatos que han superado las reglas de ledger y retiene aquellos con `P(false_alarm) >= 0.96`, reduciendo el ruido publicado sin intervencion humana.
- Publicacion automatizada en multiples canales: al actuar antes del envio a X, Discord, correo electronico o Reddit, evita que una misma falsa alarma se propague por cuatro canales distintos.
- Enrutado a revision humana: las alertas retenidas no se descartan, sino que generan un mensaje directo de Discord al operador con la puntuacion y un enlace al evento, de modo que un modelo real mal clasificado nunca se pierde en silencio.
- Clasificacion de identificadores tecnicos en catalogos y bundles: el modelo distingue nombres de modelo de etiquetas funcionales, parsers, herramientas o rutas internas dentro de listados de cadenas.
- Deteccion de reapariciones en fuentes nuevas: dado un ID ya conocido que vuelve a aparecer por paginacion o backfill de un bundle, el contexto de historial del candidato permite reconocerlo como duplicado.
- Despliegue en el borde: con 396M de parametros en INT8 y un servicio en loopback, cabe en una Raspberry Pi 5, lo que permite ejecutarlo junto al rastreador sin infraestructura GPU.
- Investigacion sobre clasificacion de baja senal: el par sintetico y real, con solo 14 falsas alarmas reales, sirve como caso de estudio de ajuste fino con datos escasos y validacion cruzada honesta.

## Benchmarks y rendimiento

Resultados de validacion cruzada de 5 pliegues (out-of-fold), con umbral de despliegue 0.96, sobre el conjunto real de 82 candidatos:

| Configuracion (5-fold CV, out-of-fold) | AUC | Falsas alarmas detenidas @0.96 | Publicaciones reales retenidas @0.96 |
|---|---|---|---|
| ModernBERT-large, soup de 2 semillas (receta publicada) | 0.965 | 7 / 14 | 1 / 68 |
| ModernBERT-large, semillas individuales | 0.953 y 0.965 | 11 y 9 | 4 y 2 |
| ModernBERT-base, semillas individuales | 0.850, 0.913 y 0.902 | 5, 3 y 3 | 1, 0 y 1 |
| ModernBERT-base, solo datos sinteticos (version de datos anterior, sin filas reales) | 0.881 | 6 | 1 |

A un umbral mas bajo de 0.875, la receta publicada detiene 12 de las 14 falsas alarmas, pero retiene 2 publicaciones reales. En el computo global del historial del bot (29 falsas alarmas registradas), las reglas de ledger por si solas detenian 15 (52%), mientras que reglas mas clasificador habrian detenido aproximadamente 22 (76%). El autor advierte que la muestra real es pequena y que estas cifras deben tratarse como estimaciones.

## Requisitos de hardware

- Inferencia declarada: ONNX INT8 sobre Raspberry Pi 5, con un servicio en loopback. El repositorio ocupa 3,8 GB en total, pero el fichero INT8 es una fraccion de eso.
- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, 396M de parametros corresponden a unos 400 MB en INT8, 800 MB en FP16 y 1,6 GB en FP32, sin contar overhead de runtime ni activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente para la variante INT8 o FP16.
- Cabe en GPU consumer: si, por tamano; no se documentan modelos concretos probados.
- Opciones de despliegue: ONNX Runtime (via `training/pi-service/serve.py` en el dispositivo objetivo), transformers con pesos safetensors, y text-embeddings-inference segun los tags del repositorio. Tambien aparecen los tags `endpoints_compatible` y `region:us`.
- Latencia y throughput: no disponibles. El unico dato operativo es que la comprobacion tiene timeout y falla en abierto.

## Comparativa con modelos similares

Dentro de la informacion disponible solo pueden compararse las variantes evaluadas en la misma validacion cruzada, ya que no se aportan resultados de otros clasificadores externos.

| Modelo | Parametros | Contexto | AUC (CV) | Falsas alarmas detenidas @0.96 | Publicaciones retenidas @0.96 | Licencia |
|---|---|---|---|---|---|---|
| AI Tracker Bot Classifier (ModernBERT-large, soup 2 semillas) | ~396M | 1024 tokens en despliegue | 0.965 | 7 / 14 | 1 / 68 | Apache 2.0 |
| ModernBERT-large, semillas individuales | ~396M | idem | 0.953 y 0.965 | 11 y 9 | 4 y 2 | Apache 2.0 (modelo base) |
| ModernBERT-base, semillas individuales | no indicado | idem | 0.850, 0.913, 0.902 | 5, 3 y 3 | 1, 0 y 1 | Apache 2.0 (modelo base) |
| ModernBERT-base, solo sinteticos | no indicado | idem | 0.881 | 6 | 1 | Apache 2.0 (modelo base) |

Comparacion con clasificadores alternativos de la misma categoria (por ejemplo DeBERTa-v3-large o encoders multilingues): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explicitamente. El entrenamiento se apoya en el historial real de un unico operador y de un unico bot, por lo que hereda sus criterios editoriales sobre que merece publicarse.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea. En el conjunto de prueba retiene 1 de cada 68 publicaciones reales al umbral 0.96, y el error crece al bajar el umbral (2 de 68 a 0.875).
- Tamano de muestra: solo 14 falsas alarmas reales en el conjunto honesto. Las metricas son estimaciones con intervalos de confianza amplios, tal como advierte el autor.
- Dominio muy restringido: esta disenado para el formato de entrada v2 del bot AI Tracker. Fuera de ese formato o de dominios de catalogos de modelos, su comportamiento no esta validado.
- Idioma: solo ingles.
- Contexto limitado: la entrada se trunca a 1024 tokens, con una entrada tipica de ~500 y un percentil 99 de 770. Candidatos con contexto mas largo perderian informacion.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial. El modelo base ModernBERT-large tambien es Apache 2.0.
- Dependencia operativa: al fallar en abierto, una caida del servicio degrada el sistema exactamente al comportamiento anterior sin clasificador, sin aviso adicional mas alla de la ausencia de filtrado.
- Publicaciones verificadas por el operador omiten la comprobacion, de modo que el clasificador no actua como unica barrera.
- Las fechas del historial de entrenamiento (2026) son las que figuran en la model card; conviene verificarlas con el autor antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/ai-tracker-bot-classifier
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- AI Tracker (bot): https://ai-tracker.ssh.codes
- Cuenta del bot en X: https://x.com/aitrackerbot
- Ficheros citados en la model card: `training/tracker/alertClassifier.js`, `training/pi-service/serve.py`, `onnx/model_int8.onnx`
- Los resultados de la busqueda web no aportan enlaces relacionados con este modelo: corresponden a herramientas homonimas de deteccion de crawlers de IA (aibottracker.com, aitracker.in, aitracker.org, outranker.com, aitracker.dev).
