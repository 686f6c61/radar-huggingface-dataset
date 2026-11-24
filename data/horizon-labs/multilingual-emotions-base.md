# Horizon-Labs/multilingual-emotions-base

## Resumen
Multilingual Emotions (base) es un clasificador multi-etiqueta de emociones desarrollado por Horizon-Labs que reproduce las 28 etiquetas del corpus GoEmotions de Google (admiration, amusement, anger, ... , surprise, neutral) sobre texto en ingles y otros 35 idiomas. Se presenta como alternativa multilingue directa a modelos GoEmotions solo en ingles como SamLowe/roberta-base-go_emotions: mantiene el mismo conjunto de etiquetas y la misma salida sigmoide multi-etiqueta, de modo que puede sustituir a esos modelos sin cambiar el esquema de anotacion. Esta construido sobre jhu-clsp/mmBERT-base, un encoder ModernBERT multilingue, con licencia Apache-2.0.

El modelo tiene 307.551.772 parametros (unos 308M) y un repositorio de 3,1 GB que incluye pesos en safetensors y exportaciones ONNX para CPU y navegador via transformers.js. La tarea es text-classification con cabecera multi-etiqueta: cada etiqueta recibe una probabilidad independiente, de forma que un texto puede activar varias emociones o solo neutral. Incluye un fichero thresholds.json con umbrales por etiqueta calibrados sobre el conjunto de validacion de GoEmotions, y un mapeo ekman_mapping.json para agrupar las 28 etiquetas en las 6 emociones de Ekman.

Su relevancia actual radica en cubrir el hueco de la clasificacion emocional multilingue con etiquetas estandarizadas y licencia permisiva, algo poco habitual: la mayoria de alternativas son solo en ingles o usan conjuntos de etiquetas propios. Ademas ofrece una version reducida (multilingual-emotions-small, 141M) y una demo en el navegador en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base) con cabecera de clasificacion multi-etiqueta |
| Parametros totales | 307.551.772 (308M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (model_quantized.onnx, embeddings int8, 641 MB); dtype q8 en transformers.js; safetensors fp32 |
| Idiomas soportados | 36 idiomas: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, no, fi, hu, el, tr, ar, he, fa, hi, mr, bn, ur, zh, ja, ko, vi, th, id, sw, af, tt, ha |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento
El modelo parte de jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT adaptado a multiples idiomas, y anade una cabeza de clasificacion con activacion sigmoide para las 28 etiquetas de GoEmotions en regimen multi-etiqueta. La salida no es una distribucion softmax excluyente, sino 28 probabilidades independientes, lo que permite detectar emociones simultaneas (por ejemplo, gratitud y alegria) o marcar neutral cuando ninguna supera su umbral.

El entrenamiento combina el corpus original google-research-datasets/go_emotions (comentarios de Reddit en ingles) con Horizon-Labs/go-emotions-multilingual, un conjunto multilingue derivado. La model card indica que los benchmarks se usaron solo para evaluacion y que se eliminaron los textos de entrenamiento que tambien aparecian en ellos, lo que reduce el riesgo de contaminacion. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset multilingue ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un encoder de clasificacion). Como innovacion practica destacan los umbrales por etiqueta calibrados en validacion y la exportacion ONNX int8, que coincide con fp32 en el 99,1% de 448 textos de prueba con todas las etiquetas umbralizadas a 0,5.

## Capacidades
- Clasificacion multi-etiqueta de emociones con las 28 etiquetas de GoEmotions (admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral).
- Salida de probabilidad independiente por etiqueta, con soporte de umbrales por etiqueta mediante thresholds.json.
- Agrupacion en las 6 emociones de Ekman (anger, disgust, fear, joy, sadness, surprise) mediante ekman_mapping.json y maximo por grupo.
- Cobertura multilingue en 36 idiomas, con ejemplos en la model card en ingles, aleman, espanol y chino.
- Inferencia en CPU y navegador gracias a las exportaciones ONNX y al soporte de transformers.js con dtype q8.
- Compatibilidad con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta generacion de texto, tool calling, agentes ni vision: es exclusivamente un clasificador de texto.

## Casos de uso
- Moderacion de comunidades multilingues: clasificar comentarios en 36 idiomas y priorizar los que activan anger, disgust o disapproval por encima de su umbral, usando thresholds.json para reducir falsos positivos en etiquetas raras.
- Analisis de sentimiento y emociones en resenas de producto: agregar las probabilidades de joy, gratitude, disappointment y annoyance por producto y por mercado linguistico, comparando mercados en una misma escala de etiquetas.
- Monitorizacion de redes sociales y escucha activa de marca: procesar menciones en multiples idiomas con un unico modelo y agrupar en las 6 emociones de Ekman para dashboards ejecutivos.
- Atencion al cliente: enrutar tickets o mensajes de chat hacia equipos especializados cuando se detectan fear, nervousness o remorse, y medir la evolucion emocional de una conversacion multi-turno clasificando cada mensaje por separado.
- Investigacion en psicologia y ciencias sociales: anotar corpus multilingues con etiquetas estandarizadas de GoEmotions, aprovechando que el modelo conserva el esquema de SamLowe/roberta-base-go_emotions para comparar con estudios previos en ingles.
- Analisis de salud mental y bienestar (con supervision humana): senalar textos con sadness, grief o nervousness elevados para revision por parte de moderadores o profesionales, nunca como decision automatica.
- Clasificacion en el navegador o en el edge: usar la version ONNX int8 con transformers.js para procesar texto localmente sin enviar datos a un servidor, util en aplicaciones de privacidad o en entornos con conectividad limitada.
- Enriquecimiento de datasets para entrenamiento: generar etiquetas emocionales multilingues como caracteristica auxiliar en pipelines de datos para otros modelos.

## Benchmarks y rendimiento
Los benchmarks se usaron solo para evaluacion y se eliminaron textos de entrenamiento coincidentes con ellos. GoEmotions test: 5.427 comentarios de Reddit en ingles, macro-F1 sobre 28 etiquetas. BRIGHTER: textos escritos originalmente en 28 idiomas (no traducciones), hasta 1.500 textos de test por idioma; cada modelo recibe un umbral por idioma y emocion ajustado en el split de desarrollo de ese idioma, y la puntuacion es macro-F1 promediado sobre idiomas. "4 emociones" se refiere a anger, fear, joy y sadness.

| Modelo | Licencia | GoEmotions macro-F1 @0,5 | GoEmotions macro-F1 (umbrales ajustados) | BRIGHTER 6 emociones | BRIGHTER 4 emociones | Etiquetas |
|---|---|---|---|---|---|---|
| multilingual-emotions-base (308M) | Apache-2.0 | 0,473 | 0,516 | 0,420 | 0,449 | 28 GoEmotions, multilingue |
| multilingual-emotions-small (141M) | Apache-2.0 | 0,447 | 0,494 | 0,406 | 0,432 | 28 GoEmotions, multilingue |
| SamLowe/roberta-base-go_emotions (125M) | MIT | 0,450 | 0,519 | 0,282 | 0,291 | 28 GoEmotions, ingles |
| AnasAlokla/multilingual_go_emotions | MIT | 0,455 | 0,538 | 0,337 | 0,355 | 28 GoEmotions, multilingue |
| j-hartmann/emotion-english-distilroberta-base (82M) | no indicada | no disponible | no disponible | 0,297 | 0,315 | 7 etiquetas, ingles |
| MilaNLProc/xlm-emo-t (278M) | no indicada | no disponible | no disponible | no disponible | 0,456 | 4 etiquetas, tweets multilingues |
| tabularisai/multilingual-emotion-classification (135M) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Lectura de los datos: en GoEmotions en ingles el modelo queda ligeramente por debajo de SamLowe (0,516 frente a 0,519 con umbrales ajustados) y de AnasAlokla (0,538), pero muy por encima de ambos en BRIGHTER multilingue (0,420 frente a 0,282 y 0,337 en 6 emociones). La mejora frente a la version small es consistente en todas las metricas.

## Requisitos de hardware
- VRAM estimada: el modelo fp32 de 308M ocupa aproximadamente 1,2 GB en pesos; la version ONNX int8 (641 MB) reduce el requisito a menos de 1 GB en CPU.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB ejecutan el modelo con holgura. Para despliegue a gran escala, A100 o H100 permiten mayor batching y throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, y tambien en CPU para cargas moderadas.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js en navegador, text-embeddings-inference y endpoints compatibles segun los tags del repositorio. No se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma oficial. Como referencia cualitativa, un encoder de 308M es ordenes de magnitud mas rapido que un LLM generativo y puede procesar lotes grandes en GPU; la version int8 esta pensada para CPU y navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | GoEmotions F1 (umbrales aj.) | BRIGHTER 6 emociones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| multilingual-emotions-base | 308M | no disponible | 36 | 0,516 | 0,420 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| multilingual-emotions-small | 141M | no disponible | 36 | 0,494 | 0,406 | Apache-2.0 | Hugging Face |
| SamLowe/roberta-base-go_emotions | 125M | no disponible | ingles | 0,519 | 0,282 | MIT | Hugging Face |
| AnasAlokla/multilingual_go_emotions | no disponible | no disponible | multilingue | 0,538 | 0,337 | MIT | Hugging Face |

El modelo se posiciona como la opcion mas equilibrada entre rendimiento en ingles y cobertura multilingue dentro del esquema de 28 etiquetas de GoEmotions. SamLowe sigue siendo competitivo en ingles puro con menos parametros, y AnasAlokla obtiene mejor F1 en GoEmotions pero cae notablemente en BRIGHTER.

## Limitaciones y advertencias
- Clasificador, no generador: no produce texto, no razona y no soporta tool calling ni agentes; cualquier caso de uso debe tratarse como etiquetado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos: las etiquetas raras (grief, pride, relief, nervousness) son especialmente sensibles al umbral, y la model card recomienda usar thresholds.json en lugar de 0,5.
- Rendimiento desigual por idioma: el macro-F1 de BRIGHTER es un promedio sobre 28 idiomas y no se publican resultados desglosados por idioma en la informacion disponible; el rendimiento en idiomas de bajos recursos (tt, ha, sw) puede ser inferior.
- Sesgos de dominio: el corpus de entrenamiento principal son comentarios de Reddit en ingles, lo que puede introducir sesgos de registro, demografia y temas; el conjunto multilingue derivado no se detalla en la informacion disponible.
- Longitud de contexto no documentada: no se especifica la ventana maxima; textos largos pueden truncarse.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de origen (GoEmotions y BRIGHTER tienen sus propias licencias) y de los modelos base.
- No apto como unico criterio en decisiones sensibles (salud mental, moderacion con consecuencias legales): debe combinarse con revision humana.
- La version ONNX int8 presenta una concordancia del 99,1% con fp32 en 448 textos, por lo que existe una pequena divergencia esperada en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-emotions-base
- Version reducida: https://huggingface.co/Horizon-Labs/multilingual-emotions-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/multilingual-emotions
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset multilingue: https://huggingface.co/datasets/Horizon-Labs/go-emotions-multilingual
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Modelo de referencia en ingles: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Alternativa multilingue: https://huggingface.co/AnasAlokla/multilingual_go_emotions
- Clasificador de 7 etiquetas en ingles: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- Clasificador de 4 etiquetas en tweets: https://huggingface.co/MilaNLProc/xlm-emo-t
