# nadjibtabanii/MiniCPM5-2B-CRACK-JANG_8M

## Resumen

MiniCPM5-2B-CRACK-JANG_8M es una variante "uncensored" (abliterated a nivel de pesos) del modelo openbmb/MiniCPM5-2B, publicada por el usuario nadjibtabanii en HuggingFace. Se distribuye como bundle MLX cuantizado a 8 bits afines con escalas bf16 (etiqueta JANG_8M), con un peso total de 2.516.756.480 parametros en un unico shard de 973 tensores y un tamano de repositorio de 2,7 GB. Esta disenado explicitamente para ejecutarse en vMLX, el motor de inferencia MLX para Apple Silicon, aunque el autor indica que se carga sin cambios mediante `mlx_lm.load()`.

El modelo base es un transformer denso estilo Llama de ~2B parametros con soporte de modo "thinking" binario (razonamiento on/off) y function calling con formato XML, ademas de una ventana de contexto de 131K tokens y cobertura bilingue ingles-chino. La modificacion principal de esta version es la eliminacion del comportamiento de rechazo a nivel de pesos: no emplea hooks en tiempo de ejecucion ni vectores de direccion (steering vectors), sino que el bundle cargado ya incorpora la ablacion. Segun el autor, se mantienen las capacidades de codigo, conocimiento y razonamiento del modelo original.

Su relevancia es doble. Por un lado, es un ejemplo de despliegue local en Apple Silicon: 2,5 GB en 8 bits permiten inferencia en portatiles Mac con memoria unificada moderada, sin GPU dedicada. Por otro, es un caso de estudio sobre el coste real de la ablacion del rechazo: el autor reporta una degradacion de solo -1,20 puntos porcentuales en MMLU (14.042 items) respecto al base, pero un harm-ASR del 97,50% con thinking desactivado y del 100% con thinking activado en HarmBench-320, lo que lo hace inadecuado para despliegues de produccion sin capas de seguridad externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama (base: openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131K tokens (segun la model card) |
| Tipos de cuantizacion | 8-bit affine (JANG_8M) con escalas bf16, sin promocion a fp32; calibracion AWQ + GPTQ + imatrix sobre el modelo fuente. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bundle MLX, un unico shard, 973 tensores, ~2,5-2,7 GB) |

Otros datos de interes: libreria declarada `mlx`, pipeline `text-generation`, plantilla de chat sin cambios respecto al base, parser de tool calling XML sin cambios, fecha de creacion 2026-10-05, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo openbmb/MiniCPM5-2B, descrito en la model card como un modelo de texto "stock Llama-style" de 2B parametros, con soporte binario de modo thinking y function calling delimitado por XML. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO u otras tecnicas de alineamiento en el modelo original. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa ni ninguna otra innovacion de eficiencia.

Sobre el proceso de esta variante concreta si hay informacion: la eliminacion del rechazo se realiza a nivel de pesos (weight-level refusal ablation), sin hooks en runtime ni steering vectors, de modo que el artefacto resultante es un bundle MLX estandar. La calibracion de la cuantizacion se hizo combinando AWQ, GPTQ e imatrix sobre el modelo fuente, y el bundle final usa cuantizacion afín de 8 bits con escalas en bf16 y sin promocion a fp32. El autor afirma que la plantilla de chat y el parser de function calling XML son identicos a los del base, lo que facilita la sustitucion directa en pipelines existentes.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat compatible con el modelo base.
- Razonamiento explicito mediante modo thinking binario (activado o desactivado por configuracion), con trazas de razonamiento separadas del cuerpo de la respuesta.
- Function calling en formato XML: el sidecar de parsing de llamadas a funciones se mantiene sin cambios respecto al base.
- Flujos agénticos de varios pasos, segun la documentacion del motor vMLX, que anuncia soporte de agentic tool calling junto a cuantizacion de KV-cache.
- Ejecucion de instrucciones sin rechazo en multiples categorias de tarea, incluida la generacion de contenido que el modelo base rechazaria.
- Conocimiento academico general y por materias, medido en MMLU con 57 asignaturas y 14.042 items (57,52% de acierto en logit mode).
- Contexto largo de hasta 131K tokens, segun la model card.
- Capacidades de codigo preservadas segun el autor, aunque no se publican resultados de HumanEval ni benchmarks de programacion en la informacion disponible.
- No se menciona soporte de vision, audio ni modalidades adicionales.

## Casos de uso

- Asistente personal local en Mac: el bundle de 2,5 GB se ejecuta con MLX sobre memoria unificada en Apple Silicon, lo que permite un asistente conversacional bilingue (en/zh) totalmente offline y sin coste de API.
- Procesamiento de documentos largos en local: con 131K tokens de contexto se pueden resumir o extraer informacion de informes, contratos o transcripciones extensas sin trocear el documento en fragmentos.
- Traduccion y reescritura ingles-chino: el modelo cubre ambos idiomas de forma nativa, util para equipos que trabajan con documentacion tecnica en las dos lenguas.
- Agente local con tool calling: el parser XML permite conectar el modelo a funciones locales (busqueda de ficheros, ejecucion de scripts, consultas a APIs internas) en flujos de varios pasos sobre el propio portatil.
- Investigacion sobre ablacion de rechazo y seguridad de modelos: el par base/uncensored con MMLU por asignatura y harm-ASR medido en el mismo bundle es un material util para estudiar el coste de la ablacion y para calibrar clasificadores de seguridad externos.
- Generacion de datos sinteticos para ajuste fino: al no rechazar instrucciones por defecto, puede usarse para producir datasets de conversacion en dominios donde el base se bloquea, siempre con revision humana posterior.
- Red-teaming y evaluacion de guardrails: sirve como modelo "adversario" controlado para probar si las capas de moderacion propias detectan contenido danino antes de llegar al usuario.
- Prototipado de chat de bajo coste: 2,5 GB y una sola shard simplifican el empaquetado en aplicaciones de escritorio para demos y pruebas internas.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre este bundle concreto:

| Metrica | Valor |
|---|---|
| MMLU (57 asignaturas, logit mode, 14.042 items) | 57,52% (base 58,72%, delta -1,20 pp) |
| HarmBench-320 harm-ASR, thinking OFF | 97,50% (234/240) |
| HarmBench-320 harm-ASR, thinking ON | 100,00% (240/240) |
| Tamano del bundle | ~2,5 GB (shard unico, 973 tensores) |

MMLU por categoria (base frente a uncensored):

| Categoria | Base | Uncensored | Delta (pp) |
|---|---:|---:|---:|
| STEM | 55,30% | 53,38% | -1,92 |
| Humanities | 51,75% | 51,56% | -0,19 |
| Social Sciences | 67,18% | 65,42% | -1,75 |
| Other | 63,97% | 62,52% | -1,45 |
| Total (57 asignaturas) | 58,72% | 57,52% | -1,20 |

El autor senala que varias asignaturas de logica y matematicas mejoraron tras la ablacion (algebra abstracta +5,00 pp, logica formal +2,38 pp, ciencias del instituto +2,00 pp sin cambio en fisica), mientras que las mayores caidas se dieron en informatica universitaria (-8,00 pp), direccion de empresas (-5,83 pp), matematicas de instituto (-5,56 pp) y geografia de instituto (-5,05 pp). La metodologia de evaluacion de cumplimiento se aplica al cuerpo de la respuesta posterior a `</think>` cuando el bloque de razonamiento cierra, o a la propia traza de razonamiento cuando se agota el presupuesto de tokens sin cierre.

No se han publicado resultados de HumanEval, GSM8K, MATH, MT-Bench ni de benchmarks de codigo o matematicas en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,5 a 2,7 GB de pesos en 8 bits, mas el espacio de la KV-cache y las activaciones. Con 131K tokens de contexto, la KV-cache puede crecer de forma notable, por lo que en secuencias largas la memoria necesaria supera ampliamente el tamano del modelo.
- Plataforma obligatoria: Apple Silicon. La libreria declarada es `mlx` y el bundle esta pensado para vMLX y `mlx_lm.load()`. No se documenta soporte para CUDA ni ROCm en este repositorio.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma directa, dado que el artefacto distribuido es un bundle MLX y no incluye pesos GGUF ni safetensors de transformers. No disponible informacion sobre conversiones oficiales.
- Cabe en Mac consumer: si, en equipos con memoria unificada de 8 GB o superior para contextos moderados. Con contextos cercanos a 131K conviene disponer de 16 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (`mlx_lm.load()`) y vMLX. No se documentan otras vias (llama.cpp, Ollama, vLLM, TGI) para este bundle concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona cuantizacion de KV-cache como caracteristica del motor vMLX, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nadjibtabanii/MiniCPM5-2B-CRACK-JANG_8M | 2,52B | 131K | Rechazo eliminado a nivel de pesos (harm-ASR 97,5-100% en HarmBench-320) | Apache 2.0 | Bundle MLX, 0 descargas, 0 likes |
| openbmb/MiniCPM5-2B (base) | ~2B (no confirmado en la informacion disponible) | 131K segun la model card de la variante | Modelo estandar con rechazo | Apache 2.0 | Modelo original de referencia |

No se dispone de datos de otros modelos comparables (por ejemplo otras variantes abliterated de 2-3B) en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria. La unica comparacion con datos numericos es contra el modelo base, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- La ablacion del rechazo es real y medible: el harm-ASR reportado es del 97,50% con thinking desactivado y del 100,00% con thinking activado en HarmBench-320. Esto significa que el modelo apenas se niega a producir contenido danino. No es apto para exposicion directa a usuarios finales sin moderacion externa.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad (TruthfulQA u otras), pero se trata de un modelo de ~2B parametros, tamano en el que la tasa de alucinacion suele ser elevada. La model card no aporta datos al respecto.
- Degradacion de capacidades: -1,20 pp en MMLU global, con caidas localizadas de hasta -8,00 pp en informatica universitaria. El impacto no es uniforme por dominio.
- Idiomas limitados a ingles y chino. No hay soporte declarado de castellano, lo que reduce su utilidad para producto en espanol sin ajuste adicional.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero la licencia no exime de responsabilidad legal por el contenido generado. El autor no impone restricciones adicionales de uso, lo que traslada todo el riesgo al desplegador.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay validacion independiente de los resultados reportados ni de la integridad del bundle.
- Dependencia de un ecosistema concreto: el bundle esta atado a MLX y, segun el material del autor, optimizado para vMLX, una aplicacion de terceros. No hay garantia de compatibilidad con otras herramientas.
- Opacidad del proceso: no se documenta la metodologia exacta de ablacion, el conjunto de datos usado para medir harm-ASR mas alla de la referencia a HarmBench-320, ni los hiperparametros de calibracion mas alla de mencionar AWQ, GPTQ e imatrix.
- Las fechas de creacion y actualizacion indicadas (2026-10-05) y la fecha de publicacion del base (2026-09-06) proceden de los metadatos del repositorio y no han podido contrastarse.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los unicos enlaces devueltos eran contenido para adultos sin relacion alguna con el modelo. No hay por tanto verificacion externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nadjibtabanii/MiniCPM5-2B-CRACK-JANG_8M
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B
- Motor de inferencia vMLX (referenciado por el autor): https://vmlx.net
- Pagina de soporte del autor (Ko-fi): https://ko-fi.com/dealignai
- Paper, repositorio de codigo, blog tecnico y demo: no disponible en la informacion proporcionada.
