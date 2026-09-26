# interfaze-ai/lev

## Resumen

lev es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por interfaze-ai, que resuelve tareas de decisión y clasificación en un único forward pass. En lugar de generar texto, lee las respuestas directamente de los logits ya calculados y devuelve probabilidades calibradas sobre exactamente las opciones que el usuario proporciona. Es decir, no produce tokens de salida (0 output tokens), no hay JSON que parsear ni reintentos por formato inválido.

El modelo está diseñado para las decisiones repetitivas y de alto volumen dentro de un producto: enrutamiento (routing), moderación, detección de intención, triaje (triage), evaluación automática y verificación de salidas de otros LLM. Habla el protocolo `/v1/systemone` de TypeSafe, de modo que el código escrito para el SDK de TypeSafe funciona contra lev cambiando únicamente la URL base.

Con 4B parámetros y un adaptador de aproximadamente 200 MB (repositorio de 0,2 GB), lev reporta un 68,9% de media sobre los 13 subconjuntos de S1Bench. En los seis subconjuntos que completó el tablero público de S1Bench, el modelo se sitúa a la altura de reflex-4b y por detrás solo de Jev y de tres modelos abiertos de 26B-35B. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen/Qwen3.5-4B; inferencia por lectura de logits, sin decodificacion autoregresiva |
| Parametros totales | 4B en el modelo base (Qwen3.5-4B); adaptador LoRA de ~200 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA, libreria `peft`) |
| Pipeline declarado | zero-shot-classification |
| Relacion con el modelo base | adapter (`base_model_relation: adapter`) |
| Salida | 0 tokens de salida; devuelve `choice`, `noul` (p(yes)), `score`, `probabilities` y `confidence` |
| API compatible | `/v1/systemone` de TypeSafe |
| Descargas / likes | 41 descargas, 46 likes |
| Tamano del repositorio | 0,2 GB (el modelo base, ~8 GB, se descarga aparte) |

## Arquitectura y entrenamiento

lev no es un modelo generativo al uso, sino un adaptador LoRA acoplado a Qwen/Qwen3.5-4B. La innovación central es que el modelo no emite tokens: recibe un estado (texto, un ticket, un correo o JSON) junto con un conjunto de preguntas tipadas y lee cada respuesta directamente de los logits que ya ha computado en un único forward pass. El espacio de respuesta queda restringido estructuralmente al conjunto de opciones que envía el usuario, de modo que el modelo no puede devolver una etiqueta fuera de esas opciones.

Soporta tres tipos de pregunta: `noul` (pregunta sí/no, que devuelve p(yes)), `choice` (instrucciones más un conjunto de opciones con nombre y descripción o `null`, que devuelve la opción elegida, el vector de probabilidades y la confianza) y `score` (instrucciones más entre 2 y 10 niveles ordenados, que devuelve un nivel esperado, las probabilidades y la confianza). Todas las preguntas comparten un mismo forward pass, por lo que formular tres preguntas cuesta aproximadamente lo mismo que formular una. El repositorio incluye un fichero `lev_release.json` que especifica el modelo base y el formato de prompt con el que se entrenó el adaptador, además de la calibración y la cabeza correspondiente.

El entrenamiento se realizó, según la model card, con una única GPU H100. No se detalla en la información disponible el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La calibración de probabilidades viene incluida en el checkpoint, lo que permite aplicar umbrales de decisión sobre ellas.

## Capacidades

- Clasificación zero-shot restringida a un conjunto de opciones definido por el usuario.
- Preguntas booleanas con probabilidad calibrada de "sí" (tipo `noul`).
- Elección entre opciones con nombre y descripción (tipo `choice`), devolviendo `choice`, `probabilities` y `confidence`.
- Puntuación ordinal sobre 2-10 niveles ordenados (tipo `score`), devolviendo un valor esperado continuo dentro de la escala (por ejemplo, 1,57 entre "mildly annoyed" y "annoyed").
- Múltiples preguntas tipadas resueltas en un único forward pass sobre el mismo estado.
- Probabilidades calibradas utilizables como puerta de decisión (por ejemplo, actuar de forma automática por encima de 0,9 y derivar a una persona por debajo).
- Garantía estructural de que la salida pertenece siempre al conjunto de opciones enviado.
- Sin tokens de salida, sin parseo de JSON y sin reintentos por formato.
- Servidor HTTP compatible con el protocolo `/v1/systemone` de TypeSafe, por lo que el SDK de TypeSafe funciona cambiando la URL base.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta de tipo `choice` con las colas disponibles (facturación, cancelaciones, seguimiento de pedidos, otros) y devuelve una distribución de probabilidad sobre esas colas. Al compartir un único forward pass, se pueden añadir preguntas simultáneas de urgencia e idioma sin coste adicional apreciable.
- Moderación de contenido: con una pregunta tipo `choice` o `score` se puede clasificar un mensaje en categorías de política y obtener un nivel de gravedad calibrado, usando el umbral de confianza para derivar los casos dudosos a revisión humana.
- Detección de intención en asistentes conversacionales: se define el conjunto de intenciones soportadas y el modelo devuelve la más probable junto con su confianza, restringiendo estructuralmente la salida a intenciones conocidas por el sistema.
- Triaje y priorización: una pregunta `noul` del estilo "¿necesita una persona en la próxima hora?" permite ordenar una cola de trabajo a partir de la probabilidad devuelta, sin necesidad de parsear texto generado.
- Evaluación automática (grading) y LLM-as-judge: se puede puntuar una respuesta generada por otro modelo sobre una escala ordinal (`score`) o comprobar si cumple un criterio (`noul`), obteniendo probabilidades calibradas sobre las que fijar umbrales de aceptación.
- Verificación de salidas de LLM en pipelines de producción: el modelo actúa como comprobador determinista de que una respuesta generada satisface un conjunto de criterios, con una salida acotada y sin riesgo de formato inválido.
- Clasificación de correos o leads en un CRM: se envía el cuerpo del correo como estado y varias preguntas tipadas (sector, intención de compra, necesidad de seguimiento) para poblar campos estructurados del CRM en una sola pasada.
- Guardarraíles para agentes: antes de ejecutar una acción, el agente consulta a lev si la acción cumple una política (`noul`) o en qué categoría cae (`choice`), y decide si ejecutar, pedir confirmación o bloquear.

## Benchmarks y rendimiento

La model card reporta una media del **68,9% en los 13 subconjuntos de S1Bench**. En los seis subconjuntos que completó el tablero público de S1Bench, el modelo se sitúa a la altura de reflex-4b y por detrás únicamente de Jev y de tres modelos abiertos de 26B-35B.

No se han publicado en la información disponible los resultados desglosados por subconjunto de S1Bench, ni cifras de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

| Metrica | Resultado | Notas |
|---|---|---|
| S1Bench (media de 13 subconjuntos) | 68,9% | Dato reportado en la model card |
| S1Bench (subconjuntos publicos) | no disponible | Solo se indica que esta a la altura de reflex-4b |
| MMLU / HumanEval / GSM8K | no disponible | No reportados |

## Requisitos de hardware

- Modelo base Qwen/Qwen3.5-4B de aproximadamente 8 GB de descarga, más el adaptador de unos 200 MB.
- VRAM estimada para inferencia en precisión completa (bf16/fp16): del orden de 10-12 GB contando pesos y memoria de activaciones y caché; en cuantización de 4 bits la estimación baja a unos 3-5 GB. Estas cifras son estimaciones derivadas de los 4B de parámetros, no datos publicados por el autor.
- Cabe en GPU de consumo: con 24 GB (RTX 3090, RTX 4090) hay margen sobrado en bf16; con 12-16 GB (RTX 4070 Ti, RTX 4080) es viable en bf16 ajustado o en cuantización.
- GPU de datacenter: A100 y H100 son aptas; el entrenamiento del adaptador se realizó, según la model card, en una única H100.
- Despliegue: el paquete oficial `lev` incluye un servidor HTTP (`lev serve --checkpoint interfaze-ai/lev --host 0.0.0.0 --port 8000`) compatible con `/v1/systemone`. Requiere Python 3.12 o superior y, para uso en tiempo real, una GPU CUDA. Depende de torch, transformers y peft.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible; el modelo necesita la cabeza y el formato de prompt específicos del adaptador.
- Latencia y throughput: no disponibles para este checkpoint. La plataforma Interfaze declara 50 peticiones por segundo en su servicio, pero ese dato corresponde al servicio alojado, no necesariamente a este adaptador autohospedado.

## Comparativa con modelos similares

La información disponible solo permite una comparación parcial, basada en los modelos citados en la propia model card (reflex-4b, Jev y tres modelos abiertos de 26B-35B) y en la ausencia de un benchmark común desglosado.

| Modelo | Parametros | Contexto | S1Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lev | 4B (LoRA sobre Qwen3.5-4B) | no disponible | 68,9% de media en 13 subconjuntos | apache-2.0 | HuggingFace (interfaze-ai/lev) |
| reflex-4b | ~4B (por nomenclatura) | no disponible | similar a lev en los seis subconjuntos publicos | no disponible | no disponible |
| Jev | no disponible | no disponible | por encima de lev | no disponible | no disponible |
| Modelos abiertos de 26B-35B (sin especificar) | 26B-35B | no disponible | por encima de lev | no disponible | no disponible |

Enfoques alternativos de la misma categoria serian clasificadores discriminativos dedicados (por ejemplo, encoders tipo BERT o DeBERTa afinados) o el uso de un LLM generativo con salida JSON restringida. lev se diferencia de ambos por combinar la flexibilidad de un LLM con la salida acotada de un clasificador y con 0 tokens de salida, pero no se dispone de cifras comparativas publicadas frente a esas alternativas en la información disponible.

## Limitaciones y advertencias

- La garantía de que la etiqueta devuelta pertenece al conjunto de opciones es estructural, no de corrección: el modelo puede aun así elegir la opción equivocada.
- Solo declara soporte de inglés (`en`); el rendimiento en otros idiomas no está documentado y no debería asumirse.
- No se detalla la longitud de contexto soportada, lo que limita la planificación de casos con entradas largas.
- Al ser un adaptador PEFT, requiere el modelo base Qwen/Qwen3.5-4B y el formato de prompt con el que fue entrenado; no es un modelo autónomo.
- La calibración de las probabilidades viene incluida en el checkpoint, pero no se documentan métricas de calibración (ECE u otras) que permitan auditar su fiabilidad fuera de la distribución de entrenamiento.
- Riesgo de sesgo y de alucinación de etiqueta no evaluado en la información disponible; al restringirse el espacio de salida, el modo de fallo típico es una clasificación incorrecta o una confianza mal calibrada, no una salida inventada.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, que se distribuye por separado.
- Etiquetado de inferencia: la model card marca `inference: false`, lo que indica que no está pensado para el pipeline de inferencia estándar de HuggingFace, sino para su propio runtime.
- Entrenado por el autor con una única H100; no se publican detalles del dataset, de los tokens de entrenamiento ni de posibles sesgos inducidos por los datos.
- El repositorio tiene un volumen muy bajo de descargas (41), por lo que la validación por parte de la comunidad es todavía escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/interfaze-ai/lev
- Repositorio en GitHub (InterfazeAI): https://github.com/InterfazeAI/lev
- Repositorio en GitHub citado en la model card (Abhinavexists): https://github.com/Abhinavexists/lev
- Blog de presentacion: https://interfaze.ai/blog/jev-now-open-source-lev
- Sitio web de Interfaze: https://interfaze.ai
- Organizacion en HuggingFace: https://huggingface.co/interfaze-ai
- Copia alternativa del modelo: https://huggingface.co/nassimjp/lev
