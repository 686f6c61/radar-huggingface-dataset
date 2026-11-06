# proofbird/gector-bert-it

## Resumen

gector-bert-it es un modelo de corrección gramatical del italiano basado en GECToR (Grammatical Error Correction: Tag, Not Rewrite), la técnica de etiquetado secuencial de Omelianchuk et al. (2020). Lo publica Patrick Hartnett (usuario proofbird) como parte del motor local de corrección de su asistente de escritura Proofbird para Windows, y lo libera para que cualquiera pueda inspeccionar qué se ejecuta en su máquina. En lugar de reescribir frases, el modelo predice para cada token una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas o cambiar forma verbal) y aplica las ediciones de forma iterativa hasta cinco pasadas.

El modelo parte del encoder `dbmdz/bert-base-italian-xxl-cased` y añade dos cabezas: una de etiquetado con 5 000 etiquetas de edición y otra de detección de errores. Se distribuye en formato ONNX (fp32, opset 17) para ejecutarse en CPU, con un tamaño de repositorio de 0,5 GB, lo que lo hace apto para inferencia en dispositivo sin GPU. Es relevante porque cubre un nicho poco poblado: corrección gramatical italiana con despliegue local, licencia Apache 2.0 y datos de entrenamiento exclusivamente sintéticos y libres.

La propuesta es deliberadamente conservadora: está entrenado para priorizar la precisión sobre la cobertura, de modo que un error no detectado pesa menos que una corrección incorrecta. Esto lo aleja de los correctores generativos y lo acerca a un corrector de reglas aprendidas, con garantías medibles de falsos positivos muy bajas sobre texto correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base `dbmdz/bert-base-italian-xxl-cased`) con cabeza de etiquetado secuencial GECToR (5 000 etiquetas de edición) y cabeza de detección de errores |
| Parametros totales | no disponible (el repositorio pesa 0,5 GB en fp32; el tamaño exacto del encoder base no se detalla en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera a nivel de oración con tokenización WordPiece; no se especifica el límite numérico) |
| Tipos de cuantizacion | el artefacto publicado es ONNX en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17) con tokenizador WordPiece (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT sobre el que se montan dos cabezas: una de etiquetado con 5 000 etiquetas de edición (`logits_labels`, salida [1, T, 5000]) y otra de detección de errores (`logits_d`, salida [1, T, 2]). El esquema de etiquetas sigue GECToR: cada token recibe una etiqueta que indica mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas o transformar la forma verbal. El decodificador aplica las ediciones y vuelve a etiquetar la frase hasta cinco iteraciones. Incluye un vocabulario específico de formas verbales italianas (`verb-form-vocab.txt`) construido para este modelo.

El entrenamiento es exclusivamente sintético: 3 000 000 de frases de Wikipedia italiana (`wikimedia/wikipedia`, `20231101.it`) y 250 000 frases de Tatoeba fueron corrompidas con reglas de error escritas a mano para el italiano; alrededor del 10 % se dejan limpias para que el modelo aprenda a no tocar texto correcto. Se añadieron 210 000 frases de plantilla para patrones que Wikipedia rara vez contiene (primera y segunda persona, imperativos, concordancia a larga distancia). No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. El entrenamiento consistió en una época (114 348 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4, con identificador de ejecución `2026-10-24-0450`. No se documenta RLHF ni DPO.

## Capacidades

- Corrección de concordancia de género y número en artículos, adjetivos y participios, incluso a través de una cláusula.
- Concordancia sujeto-verbo.
- Preposiciones articuladas (`di il` → `del`).
- Elisión (`lo amico` → `l'amico`).
- Acentuación (`perche` → `perché`, `e` → `è` cuando la frase lo requiere).
- Plurales de palabras terminadas en `-co/-go/-ca/-ga`.
- Detección de palabras duplicadas.
- Capitalización al inicio de frase.
- Corrección de errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.
- Etiquetado secuencial con aplicación iterativa de ediciones (hasta cinco pasadas).
- No parafrasea: solo propone ediciones locales.
- Inferencia en CPU mediante ONNX Runtime, sin GPU.
- No soporta tool calling, function calling, agentes, visión ni audio según la información disponible.

## Casos de uso

- Asistente de escritura de escritorio: es exactamente el uso para el que se publicó (Proofbird en Windows); el modelo ONNX en fp32 corre en CPU y corrige el texto mientras el usuario escribe, sin enviar datos a la nube.
- Corrección de textos administrativos y periodísticos en italiano: al priorizar la precisión, resulta adecuado para revisar borradores donde una corrección errónea es más costosa que un error no detectado.
- Preprocesado de corpus italianos: limpieza de concordancias, acentos y preposiciones articuladas antes de alimentar otros pipelines de NLP.
- Integración en editores y extensiones: el formato ONNX y el decodificador estándar permiten integrarlo en herramientas con un decodificador GECToR propio, como el que Proofbird implementa en C#.
- Filtrado de calidad en plataformas de contenido generado por usuarios: con una tasa de falsos positivos del 0,10 % sobre frases correctas de Tatoeba, puede marcar texto sospechoso sin degradar la experiencia del usuario.
- Enseñanza de italiano como lengua extranjera: puede señalarse como corrector conservador para ejercicios de concordancia y acentuación, aunque su cobertura sobre ensayos reales de aprendices es limitada (véase limitaciones).
- Verificación de mayúsculas y puntuación final de frase en procesos batch: las reglas de idioma (`language-rules.json`) cubren el manejo de puntuación final y artículos elididos.

## Benchmarks y rendimiento

| Comprobación | Resultado |
|---|---|
| Conjunto gold (672 frases escritas a mano: 512 con un error cada una, 160 correctas) | 512 corregidas, 160 intactas, 0 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases cotidianas de Tatoeba (reservadas del entrenamiento) | 4 modificadas (0,10 %) |
| Falsas alarmas sobre 2 000 frases de Wikipedia no tocadas por editores humanos | 11 modificadas (0,55 %) |
| Estabilidad: repetición del gold con un token extra al inicio de cada frase | 3 frases cambian de resultado |
| MERLIN (ensayos italianos de aprendices) | corrige aproximadamente el 5 % de los errores anotados; revisión ciega de 120 cambios: 52 % correctos, 13 % inocuos, 34 % erróneos |

La puntuación gold se obtiene con las protecciones de aplicación de `gector-guards.json`, que forman parte del resultado medido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se publica en ONNX fp32 precisamente para ejecutarse sin GPU; el repositorio ocupa 0,5 GB.
- VRAM estimada: no aplica para el artefacto publicado (inferencia en CPU); no se documenta una variante GPU.
- GPU recomendadas: no disponibles para este artefacto; el entrenamiento se realizó en una NVIDIA L4.
- Cabe en GPU de consumo: no se documenta una ruta GPU; el diseño es on-device en CPU.
- Opciones de despliegue: ONNX Runtime (uso previsto por el autor); cualquier decodificador de estilo GECToR puede consumir los archivos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gector-bert-it | GECToR sobre BERT italiano | it | no disponible | Apache 2.0 | ONNX fp32 | Entrenamiento sintético, orientado a precisión, on-device |
| GECToR original (grammarly/gector) | GECToR sobre BERT/RoBERTa/etc. | en (principalmente) | no disponible | no disponible en la información | PyTorch | Implementación oficial de referencia; soporta varios encoders |
| Otros modelos GECToR en Hugging Face | GECToR | variable | no disponible | variable | variable | La búsqueda en Hugging Face devuelve múltiples modelos GECToR sin detalle de especificaciones |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los ensayos reales de aprendices son su punto más débil: sobre MERLIN corrige solo alrededor del 5 % de los errores anotados, y de los cambios revisados a ciegas un 34 % resultaron erróneos.
- Ruido ortográfico intenso y acentos que dependen del significado (`si`/`sì`, `e`/`è` en frases confusas) quedan fuera del alcance de un etiquetador local.
- Solo cubre italiano; no hay soporte multilingüe.
- No parafrasea ni reescribe: las ediciones son locales y de alcance limitado.
- El resultado medido depende de las protecciones de `gector-guards.json`; sin ellas, el rendimiento puede diferir.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto libre), pero puede proponer ediciones incorrectas en contextos ambiguos, como indica la tasa de error del 34 % en MERLIN.
- Sesgos: no se documentan sesgos específicos; el entrenamiento usa Wikipedia y Tatoeba, lo que puede infrarrepresentar registros informales o dialectales.
- Licencia Apache 2.0 para pesos y archivos del repositorio, pero los datos de entrenamiento tienen sus propios términos: Wikipedia bajo CC BY-SA 4.0 y Tatoeba bajo CC BY 2.0 FR; el encoder base es MIT. Conviene revisar la atribución si se redistribuye.
- El modelo se publicó como trabajo personal de Patrick Hartnett; no hay garantías de mantenimiento ni soporte.
- No se documentan límites numéricos de contexto ni de longitud de frase; conviene validar el comportamiento con frases largas antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-it
- Encoder base: https://huggingface.co/dbmdz/bert-base-italian-xxl-cased
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Implementación oficial de GECToR: https://github.com/grammarly/gector
- Búsqueda de modelos GECToR en Hugging Face: https://huggingface.co/models?search=GECToR
- Proofbird: https://proofbird.app
- MERLIN: https://merlin-platform.eu
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY 2.0 FR: https://creativecommons.org/licenses/by/2.0/fr/
