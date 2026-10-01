# Horizon-Labs/multilingual-emotions-small

## Resumen

Multilingual Emotions (small) es un clasificador de emociones multi-etiqueta desarrollado por Horizon-Labs. Reutiliza las 28 etiquetas del dataset GoEmotions de Google (admiration, amusement, anger, ..., surprise, neutral) y las aplica sobre texto en ingles y otros 35 idiomas, con una salida sigmoide independiente por etiqueta, de modo que un mismo texto puede activar varias emociones o solo `neutral`. Se posiciona como alternativa multilingue "drop-in" a clasificadores monolingues como SamLowe/roberta-base-go_emotions: mismas etiquetas, mismo esquema de salida multi-etiqueta y mismo pipeline de `text-classification`.

El modelo esta construido sobre jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT, con 140.652.316 parametros totales (aproximadamente 141 M). La ficha oficial lo describe como la version "small" de una familia de dos tam anos, junto a multilingual-emotions-base (308 M). El repositorio ocupa 1,4 GB e incluye pesos en safetensors, artefactos ONNX para CPU y navegador (transformers.js) y ficheros auxiliares de configuracion de umbrales.

Su relevancia practica esta en dos puntos: primero, ofrece cobertura multilingue real (36 idiomas declarados) sin renunciar al esquema de etiquetas de GoEmotions, lo que facilita sustituir modelos ingleses en productos ya existentes; segundo, incluye `thresholds.json` con un umbral calibrado por etiqueta sobre el conjunto de validacion de GoEmotions, algo critico para etiquetas raras como grief, pride, relief o nervousness, y `ekman_mapping.json` para agrupar las 28 etiquetas en las 6 emociones de Ekman. La licencia es Apache-2.0, lo que permite uso comercial sin las restricciones de otras alternativas de la misma categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (base jhu-clsp/mmBERT-small), transformer encoder-only para clasificacion multi-etiqueta |
| Parametros totales | 140.652.316 (~141 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors); int8 en ONNX (`onnx/model_quantized.onnx`, 268 MB); `q8` en transformers.js |
| Idiomas soportados | 36: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, no, fi, hu, el, tr, ar, he, fa, hi, mr, bn, ur, zh, ja, ko, vi, th, id, sw, af, tt, ha |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye variante cuantizada int8) |
| Tarea (pipeline) | text-classification (multi-label classification) |
| Modelo base | jhu-clsp/mmBERT-small |
| Dataset de entrenamiento declarado | google-research-datasets/go_emotions |
| Etiquetas | 28 etiquetas de GoEmotions + mapeo a 6 emociones de Ekman |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es mmBERT-small, un encoder tipo ModernBERT afinado para clasificacion de texto. ModernBERT introduce mejoras sobre el transformer encoder clasico: atencion con RoPE, alternancia de capas de atencion global y local, y un diseno optimizado para secuencias largas y para ejecucion eficiente en CPU. Sobre esa base, Horizon-Labs anade una cabeza de clasificacion multi-etiqueta con activacion sigmoide, es decir, una probabilidad independiente por cada una de las 28 etiquetas en lugar de un softmax que force una unica clase. Esto explica que un texto como "Thank you so much, this made my day!" pueda devolver simultaneamente excitement, gratitude y joy.

En cuanto a los datos, la model card solo declara el uso de google-research-datasets/go_emotions, un corpus de comentarios de Reddit en ingles anotados con las 28 emociones. No se detalla en la informacion disponible la composicion exacta del corpus multilingue de entrenamiento, ni el numero de tokens, ni si hubo fases de RLHF o DPO (poco habituales en modelos de clasificacion de este tamano). La model card si explicita la metodologia de evaluacion: los conjuntos de benchmark se usaron solo para evaluacion y se eliminaron los textos de entrenamiento que aparecian tambien en ellos. La generalizacion a los otros 35 idiomas se apoya, segun la informacion disponible, en el preentrenamiento multilingue de mmBERT-small mas el ajuste sobre GoEmotions, sin que se documente una traduccion del corpus.

Como innovaciones practicas destacan tres artefactos incluidos en el repositorio: `thresholds.json`, con un umbral por etiqueta calibrado en validacion de GoEmotions; `ekman_mapping.json`, que agrupa las 28 etiquetas en las 6 emociones de Ekman tomando el maximo por grupo; y los ficheros ONNX, que permiten inferencia en CPU y en navegador mediante transformers.js. La model card indica que `onnx/model_quantized.onnx` (int8 en los embeddings, 268 MB) coincide con fp32 en el 98,7% de 448 textos de prueba, con las 28 etiquetas umbralizadas a 0,5.

## Capacidades

- Clasificacion de emociones multi-etiqueta con las 28 etiquetas de GoEmotions, con probabilidad independiente por etiqueta y posibilidad de devolver solo `neutral`.
- Cobertura multilingue declarada en 36 idiomas, incluyendo lenguas europeas, arabe, hebreo, persa, hindi, marathi, bengali, urdu, chino, japones, coreano, vietnamita, tailandes, indonesio, suajili, africaans, tatar y hausa.
- Agrupacion de las 28 etiquetas en las 6 emociones de Ekman (anger, disgust, fear, joy, sadness, surprise) mediante `ekman_mapping.json`, tomando el maximo por grupo.
- Umbralizacion por etiqueta usando `thresholds.json`, lo que mejora el macro-F1 respecto al umbral fijo de 0,5, especialmente en etiquetas raras (grief, pride, relief, nervousness).
- Inferencia en CPU y en navegador gracias a los artefactos ONNX y al soporte de transformers.js con `dtype: "q8"`.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderacion de comunidades y redes sociales: clasificar comentarios en 36 idiomas con las 28 emociones de GoEmotions permite detectar patrones de toxicidad emocional (anger, annoyance, disapproval) frente a interacciones positivas, con la misma taxonomia que herramientas ya existentes para ingles.
- Analisis de sentimiento y voz del cliente en soporte tecnico: al ser multi-etiqueta, un mismo ticket puede marcarse como confusion y annoyance a la vez, lo que da una senal mas rica que un simple positivo/negativo para priorizar colas de atencion.
- Monitorizacion de opinion publica multilingue: procesar menciones en X, foros o prensa en varios idiomas con una unica taxonomia evita mantener un modelo distinto por idioma y simplifica la agregacion de metricas comparables entre mercados.
- Deteccion de riesgo en salud mental o comunidades de apoyo: etiquetas como sadness, grief, fear o nervousness, con umbrales calibrados especificamente para las clases raras, permiten construir alertas de escalado a moderadores humanos (siempre con supervision profesional y revision humana).
- Investigacion en linguistica computacional y psicologia: el mapeo a 6 emociones de Ekman y la evaluacion sobre BRIGHTER (textos escritos originalmente en 28 idiomas, no traducidos) lo convierten en una linea base reproducible para estudios comparativos entre lenguas.
- Analitica de producto y experiencia de usuario: clasificar resenas, encuestas abiertas y feedback en formularios para agrupar por emociones dominantes y hacer seguimiento de la evolucion tras un lanzamiento.
- Enrutado de conversaciones en tiempo real: al ser un modelo de 141 M y ejecutable en ONNX int8 en CPU o navegador, puede preclasificar el tono emocional de un mensaje antes de enviarlo a un LLM mayor, reduciendo coste y latencia de la capa de generacion.
- Etiquetado asistido de corpus: preanotar grandes volumenes de texto multilingue para revision humana posterior, aprovechando la salida probabilistica por etiqueta y su umbral asociado.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los conjuntos se usaron solo para evaluacion y se eliminaron los textos de entrenamiento coincidentes.

- GoEmotions test: comentarios de Reddit en ingles, 5.427 ejemplos, 28 etiquetas. Metrica: macro-F1 sobre las 28 etiquetas, a umbral 0,5 y con umbrales por etiqueta calibrados en validacion de GoEmotions. Solo se puntuan modelos con las 28 etiquetas de GoEmotions.
- BRIGHTER (brighter-dataset/BRIGHTER-emotion-categories, CC-BY-4.0): textos anotados por humanos escritos originalmente en 28 idiomas, no traducciones, con 6 emociones y multiples etiquetas por texto, hasta 1.500 textos de test por idioma. Las etiquetas de cada modelo se agrupan en las 6 emociones de Ekman. Cada modelo recibe un umbral por idioma y emocion, calibrado en el split de desarrollo de ese idioma. La puntuacion es el macro-F1 sobre las emociones anotadas, promediado entre idiomas. La columna "4 emociones" cubre solo anger, fear, joy y sadness, el conjunto que todos los modelos comparados cubren.

| Modelo | Licencia | GoEmotions test, macro-F1 @0,5 | GoEmotions test, macro-F1 (umbrales calibrados) | BRIGHTER, 6 emociones | BRIGHTER, 4 emociones | Etiquetas |
|---|---|---|---|---|---|---|
| multilingual-emotions-small (141M) | Apache-2.0 | 0,447 | 0,494 | 0,406 | 0,432 | 28 etiquetas GoEmotions, multilingue |
| multilingual-emotions-base (308M) | Apache-2.0 | 0,473 | 0,516 | 0,420 | 0,449 | 28 etiquetas GoEmotions, multilingue |
| SamLowe/roberta-base-go_emotions (125M) | MIT | 0,450 | 0,519 | 0,282 | 0,291 | 28 etiquetas GoEmotions, ingles |
| AnasAlokla/multilingual_go_emotions | MIT | 0,455 | 0,538 | 0,337 | 0,355 | 28 etiquetas GoEmotions, multilingue |
| j-hartmann/emotion-english-distilroberta-base (82M) | no indicada | no disponible | no disponible | 0,297 | 0,315 | 7 etiquetas, ingles |
| MilaNLProc/xlm-emo-t (278M) | no indicada | no disponible | no disponible | no disponible | 0,456 | 4 etiquetas, tweets multilingues |
| tabularisai/multilingual-emotion-classification (135M) | CC-BY-NC-4.0 | no disponible | no disponible | no disponible (tabla truncada en la fuente) | no disponible (tabla truncada en la fuente) | no disponible (tabla truncada en la fuente) |

Lectura de los datos: en GoEmotions test con umbrales calibrados, este modelo (0,494) queda por debajo de multilingual-emotions-base (0,516), de SamLowe/roberta-base-go_emotions (0,519) y de AnasAlokla/multilingual_go_emotions (0,538). La ventaja aparece en BRIGHTER, donde alcanza 0,406 en 6 emociones y 0,432 en 4 emociones, frente a 0,282/0,291 del modelo ingles de SamLowe y 0,337/0,355 de AnasAlokla. Solo MilaNLProc/xlm-emo-t supera ligeramente el resultado de 4 emociones (0,456), pero no cubre las 28 etiquetas de GoEmotions.

Rendimiento de inferencia (latencia, throughput): no disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,56 GB solo para pesos, mas activaciones (dependientes del tamano de lote y de la longitud de secuencia). Cabe con holgura en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,28 GB de pesos.
- VRAM estimada en int8 (ONNX cuantizado): el fichero `onnx/model_quantized.onnx` ocupa 268 MB, por lo que los pesos caben en menos de 0,3 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes. El cuello de botella en produccion sera el preprocesado y el numero de peticiones, no la memoria.
- Ejecucion en CPU: completamente viable. El modelo esta disenado para ello, con artefactos ONNX especificos para CPU y un modo cuantizado int8.
- Navegador: soportado via transformers.js con `dtype: "q8"`, lo que permite clasificacion en cliente sin backend.
- Opciones de despliegue: transformers (Python, `pipeline("text-classification")`), ONNX Runtime (CPU), transformers.js en navegador o Node, y text-embeddings-inference segun los tags del repositorio. Compatible con endpoints segun los tags de la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Etiquetas | Idiomas | GoEmotions test (umbrales calibrados) | BRIGHTER 6 emociones | Disponibilidad |
|---|---|---|---|---|---|---|---|
| multilingual-emotions-small | 141 M | Apache-2.0 | 28 GoEmotions | 36 | 0,494 | 0,406 | HuggingFace (safetensors + ONNX), transformers.js |
| multilingual-emotions-base | 308 M | Apache-2.0 | 28 GoEmotions | multilingue (no detallado) | 0,516 | 0,420 | HuggingFace |
| SamLowe/roberta-base-go_emotions | 125 M | MIT | 28 GoEmotions | solo ingles | 0,519 | 0,282 | HuggingFace |
| AnasAlokla/multilingual_go_emotions | no disponible | MIT | 28 GoEmotions | multilingue (no detallado) | 0,538 | 0,337 | HuggingFace |
| j-hartmann/emotion-english-distilroberta-base | 82 M | no indicada | 7 | solo ingles | no disponible | 0,297 | HuggingFace |
| MilaNLProc/xlm-emo-t | 278 M | no indicada | 4 | multilingue (tweets) | no disponible | no disponible | HuggingFace |
| tabularisai/multilingual-emotion-classification | 135 M | CC-BY-NC-4.0 | no disponible | multilingue | no disponible | no disponible | HuggingFace |

La diferencia clave frente a las alternativas no esta en el mejor resultado absoluto en ingles, donde SamLowe y AnasAlokla quedan por delante, sino en el equilibrio entre cobertura multilingue, licencia permisiva (Apache-2.0) y despliegue ligero (ONNX int8 para CPU y navegador). tabularisai/multilingual-emotion-classification es el competidor mas cercano en tamano, pero su licencia CC-BY-NC-4.0 prohibe el uso comercial.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto, no razona de forma generativa y no soporta tool calling ni flujos de agente. Cualquier uso conversacional requiere combinarlo con un LLM aparte.
- Riesgo de falsos positivos por el esquema multi-etiqueta: al usar sigmoides independientes con umbral 0,5, varias etiquetas correlacionadas pueden activarse a la vez. La model card recomienda explicitamente usar `thresholds.json` en lugar de 0,5, sobre todo para etiquetas raras.
- Etiquetas con poco soporte estadistico: grief, pride, relief y nervousness son minoritarias en GoEmotions, de ahi la necesidad de umbrales especificos. Su fiabilidad en idiomas distintos del ingles es, previsiblemente, menor.
- Sesgo de dominio: el corpus de anotacion declarado es GoEmotions, comentarios de Reddit en ingles. El registro informal, la ironia y el argot de ese dominio pueden no transferirse bien a textos formales, literatura tecnica o documentacion juridica.
- Cobertura multilingue no detallada: la model card declara 36 idiomas y una evaluacion sobre BRIGHTER en 28 idiomas, pero no especifica la composicion del corpus multilingue de entrenamiento ni el volumen por idioma. Los resultados en idiomas de baja representacion (tt, ha, sw, mr, bn) deben validarse con datos propios antes de llevarlos a produccion.
- Longitud de contexto no documentada en la informacion disponible. Es un factor critico si se pretende clasificar documentos largos y no solo frases o comentarios cortos; conviene verificar la `max_position_embeddings` del tokenizer y del config antes de desplegar.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No impone obligaciones de atribucion adicionales mas alla de las habituales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no ha sido validado por la comunidad. No debe tratarse como un componente critico sin una evaluacion propia sobre el dominio objetivo.
- La clasificacion de emociones en contextos sensibles (salud mental, moderacion, recursos humanos) puede producir errores con consecuencias reales. Es recomendable mantener supervision humana en el circuito y no automatizar decisiones que afecten a personas a partir de la salida del modelo.
- La tabla de benchmarks de la model card aparece truncada en la fila de tabularisai/multilingual-emotion-classification; no se dispone de sus valores completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-emotions-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Version de mayor tamano: https://huggingface.co/Horizon-Labs/multilingual-emotions-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-emotions
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset BRIGHTER (evaluacion multilingue): https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Modelo comparado SamLowe/roberta-base-go_emotions: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Modelo comparado AnasAlokla/multilingual_go_emotions: https://huggingface.co/AnasAlokla/multilingual_go_emotions
- Modelo comparado j-hartmann/emotion-english-distilroberta-base: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- Modelo comparado MilaNLProc/xlm-emo-t: https://huggingface.co/MilaNLProc/xlm-emo-t
- Modelo comparado tabularisai/multilingual-emotion-classification: https://huggingface.co/tabularisai/multilingual-emotion-classification
- Paper de GoEmotions (Demszky et al.): no disponible como enlace directo en la informacion proporcionada
- Paper o blog de mmBERT: no disponible como enlace directo en la informacion proporcionada

Nota: los resultados de busqueda web recibidos (Horizons le parti, VMware Horizon, articulo de Wikipedia sobre "horizon", Larousse, Meta Horizon) no guardan relacion con el modelo Horizon-Labs/multilingual-emotions-small y no se han utilizado como fuente.
