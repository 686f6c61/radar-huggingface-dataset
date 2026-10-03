# nickprock/archai-jev-zagreus-0.4b-ita

## Resumen

Archai JEV Zagreus 0.4B Ita es un ajuste fino ligero (QLoRA) sobre el modelo italiano `mii-llm/zagreus-0.4B-ita`, desarrollado por el usuario nickprock. No es un modelo generativo conversacional al uso: se presenta como un "motor de decisión System One", es decir, un clasificador determinista que recibe una entrada en italiano y emite un único token de salida restringido a un conjunto cerrado (`A`, `B`, `C`, `D`, `TRUE`, `FALSE`). Su propósito es resolver tareas de elección múltiple, verificación booleana y clasificación de seguridad dentro de un vocabulario de salida controlado.

El modelo se apoya en el repositorio PEFT con los adaptadores LoRA y, además, distribuye una conversión completa a GGUF en cuantización `Q8_0` de 465 MB. El autor declara como objetivo principal la inferencia en CPU por debajo de 10 ms, pensada para entornos edge y para integraciones en Rust o C++ donde no hay GPU disponible y donde se necesita una latencia predecible y un consumo de memoria mínimo.

Su relevancia es doble. Por un lado, demuestra un patrón de diseño poco habitual: en lugar de competir en tamaño o en capacidades generativas, optimiza calibración de probabilidades mediante una pérdida conjunta de entropía cruzada y Brier score, algo útil cuando la confianza del modelo se usa como señal downstream. Por otro lado, ofrece una alternativa muy económica para moderación y filtrado en italiano, idioma con menos cobertura de modelos pequeños que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, denso) |
| Parametros totales | 437.760.960 (metadatos de safetensors del repositorio); modelo base declarado de 400 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `Q8_0` (465 MB) publicado; adaptadores LoRA en safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en `adapter/`), GGUF (`archai-jev-zagreus-0.4b-q8.gguf`) |
| Metodo de ajuste fino | QLoRA, r=16, alpha=32 |
| Modelo base | mii-llm/zagreus-0.4B-ita |
| Tokens de salida | `A` (32), `B` (33), `C` (34), `D` (35), `TRUE` (21260), `FALSE` (31451) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Llama (`LlamaForCausalLM`) de aproximadamente 400 M de parametros en su version base. Sobre ese modelo se aplica un ajuste fino con QLoRA de rango 16 y alpha 32, lo que produce un adaptador de bajo rango que modifica el comportamiento del modelo sin reentrenar los pesos completos. El repositorio publica tanto el adaptador como una fusion cuantizada en GGUF `Q8_0`.

El entrenamiento se realizo sobre una mezcla consolidada de siete conjuntos de datos nativos en italiano: `Paul/hatecheck-italian` y `evalitahf/hatespeech_detection` para seguridad y moderacion; `RiTA-nlp/ai2_arc_ita` (ARC-Challenge y ARC-Easy) para razonamiento de eleccion multiple; `evalitahf/sentiment_analysis` para analisis de sentimiento; `evalitahf/textual_entailment` para inferencia de lenguaje natural; `evalitahf/faq` para pertinencia de respuesta en soporte; y `stsb_multi_mt` (it) para similitud semantica. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion proporcional exacta de la mezcla ni si hubo fases posteriores de RLHF o DPO.

La innovacion tecnica destacable es la funcion de perdida: el autor indica una minimizacion conjunta y dinamica de entropia cruzada y Brier score. El objetivo es que las probabilidades asociadas al token elegido esten bien calibradas, de modo que la confianza del modelo sea interpretable como probabilidad real. Esto se refleja en la publicacion del Brier score del conjunto de test (0,2407) junto a la exactitud, algo poco frecuente en model cards de modelos de este tamano.

## Capacidades

- Clasificacion de eleccion multiple en italiano con salida restringida a los tokens `A`, `B`, `C` o `D`.
- Verificacion booleana de afirmaciones en italiano, con salida `TRUE` o `FALSE`.
- Razonamiento sobre preguntas tipo ARC (cientificas, de primaria y secundaria) en su version traducida al italiano.
- Moderacion de contenido y deteccion de discurso de odio en italiano, entrenado con HateCheck-IT y datasets de EvalITA.
- Analisis de sentimiento en italiano.
- Inferencia de lenguaje natural (NLI): implicacion, contradiccion y neutralidad.
- Evaluacion de pertinencia de respuestas en escenarios de FAQ y soporte.
- Similitud semantica entre pares de frases en italiano.
- Inferencia determinista en CPU: el autor declara objetivos de latencia por debajo de 10 ms.
- Calibracion de confianza: la probabilidad asociada a la decision esta optimizada mediante Brier score.

No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso abierto, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Moderacion de comentarios en plataformas italianas: el modelo recibe un texto y devuelve `TRUE` o `FALSE` sobre si infringe las normas, con una probabilidad calibrada que permite fijar umbrales de auto-moderacion frente a revision humana.
- Filtrado previo en pipelines de datos: al ejecutarse en CPU con 465 MB de peso, puede procesar lotes grandes de texto italiano para descartar contenido toxico antes de entrenar otros modelos.
- Enrutado de tickets de soporte: usando la tarea de pertinencia de FAQ, el sistema puede decidir si una respuesta candidata responde realmente a la consulta del usuario y derivar a un agente humano cuando la confianza es baja.
- Analisis de sentimiento en tiempo real en encuestas o reseñas: la salida booleana y la calibracion permiten agregar rapidamente opiniones positivas y negativas sin infraestructura de GPU.
- Evaluacion automatica de examenes o cuestionarios de opcion multiple en italiano: la tarea de ARC traducido encaja directamente en la seleccion entre cuatro opciones.
- Deteccion de contradicciones en documentacion: mediante NLI, se puede comprobar si dos afirmaciones de un manual o de un contrato se contradicen, como paso previo a la revision legal.
- Deduplicacion y agrupacion semantica: usando la tarea de similitud de STS-B, se pueden agrupar frases equivalentes en un corpus italiano para normalizar catalogos o bases de conocimiento.
- Componente de un sistema mayor en Rust o C++: su tamano y su formato GGUF permiten incrustarlo como biblioteca local en aplicaciones de escritorio o dispositivos sin conectividad, actuando como arbitro de decisiones discretas.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de entrenamiento y evaluacion interna del propio autor, sin comparacion con otros modelos:

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 | Conjunto de test final |
|---|---|---|---|---|
| Perdida de entrenamiento | 0,6461 | 0,4760 | 0,4150 | no disponible |
| Perdida de validacion | 0,4700 | 0,4105 | 0,3962 | no disponible |
| Exactitud de validacion | 77,04 % | 81,49 % | 82,18 % | no disponible |
| Exactitud de test | no disponible | no disponible | no disponible | 77,90 % |
| Brier score de test | no disponible | no disponible | no disponible | 0,2407 |

No se han publicado resultados desglosados por tarea (moderacion, NLI, sentimiento, ARC) ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor declara diseno especifico para inferencia por debajo de 10 ms en CPU, sin necesidad de GPU.
- Memoria: el archivo GGUF `Q8_0` ocupa 465 MB, por lo que el modelo cabe holgadamente en RAM de cualquier equipo actual; el adaptador LoRA por separado requiere ademas cargar el modelo base de 400 M de parametros.
- VRAM estimada: aproximadamente 0,5 GB si se carga en GPU; cualquier GPU con 1 GB o mas es suficiente.
- GPU recomendadas: no se especifica ninguna en la informacion disponible; por tamano, cualquier GPU consumer (por ejemplo, gama RTX 30 o 40, o integradas con memoria compartida) es mas que suficiente.
- Cabe en GPU consumer: si, con enorme margen; tambien cabe en moviles y sistemas embebidos con 1 GB de RAM libre.
- Opciones de despliegue: llama.cpp (soporte explicito del autor), integraciones en Rust y C++, y cualquier runtime compatible con GGUF. La compatibilidad con Ollama, vLLM o TGI no esta documentada en la informacion disponible, aunque el formato GGUF es compatible con el ecosistema de llama.cpp y Ollama.
- Latencia y throughput: el autor indica objetivo sub-10 ms en CPU; no se publican cifras de throughput (tokens por segundo) ni mediciones sobre hardware concreto.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible. Como referencia cualitativa se puede contrastar con su propio modelo base:

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| archai-jev-zagreus-0.4b-ita | 437.760.960 (total del repositorio) | no disponible | Decision determinista y clasificacion en italiano | Apache 2.0 | safetensors (LoRA) y GGUF Q8_0 |
| mii-llm/zagreus-0.4B-ita (base) | 400 M declarados | no disponible | Generacion de texto en italiano | no disponible | no disponible |
| Alternativas italianas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia relevante respecto al modelo base es el comportamiento de salida: el ajuste restringe el espacio de respuestas a tokens discretos y optimiza calibracion, mientras que el modelo base es un generador de texto sin ese control.

## Limitaciones y advertencias

- Vocabulario de salida cerrado: solo puede emitir `A`, `B`, `C`, `D`, `TRUE` o `FALSE`. No sirve como asistente conversacional ni para generar texto libre.
- Idioma unico: solo italiano. No se documenta ningun rendimiento en castellano u otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar su uso con documentos largos sin una validacion previa.
- Exactitud de test del 77,90 %, lo que implica aproximadamente una decision erronea de cada cinco; no es adecuado como unico filtro en decisiones criticas sin revision humana.
- Brier score de 0,2407: la calibracion es mejorable y no debe interpretarse la confianza como probabilidad exacta en todos los dominios.
- Sesgos potenciales heredados de los conjuntos de datos de odio y moderacion, ademas de los del modelo base italiano; no se documenta ninguna auditoria de sesgo.
- Riesgo de alucinacion bajo en el sentido generativo (salida restringida), pero riesgo de forzar una respuesta incorrecta cuando la entrada esta fuera del dominio de entrenamiento.
- Cobertura limitada de dominios: los datos se centran en seguridad, eleccion multiple, sentimiento, NLI, FAQ y similitud semantica; otras tareas no estan cubiertas.
- El repositorio combina un adaptador LoRA y un GGUF; no se documenta la receta exacta de fusion ni de conversion, lo que complica reproducir el proceso.
- Licencia Apache 2.0 permite uso comercial, pero no se aporta informacion sobre las licencias de los conjuntos de datos de entrenamiento, que el usuario deberia verificar por su cuenta.
- Modelo muy reciente y sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nickprock/archai-jev-zagreus-0.4b-ita
- Modelo base: https://huggingface.co/mii-llm/zagreus-0.4B-ita
- Conjuntos de datos citados: https://huggingface.co/datasets/Paul/hatecheck-italian , https://huggingface.co/datasets/evalitahf/hatespeech_detection , https://huggingface.co/datasets/RiTA-nlp/ai2_arc_ita , https://huggingface.co/datasets/evalitahf/sentiment_analysis , https://huggingface.co/datasets/evalitahf/textual_entailment , https://huggingface.co/datasets/evalitahf/faq , https://huggingface.co/datasets/stsb_multi_mt

No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos por la busqueda no guardan relacion con el contenido de esta ficha y se han descartado.
