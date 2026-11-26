# proofbird/gector-bert-de

## Resumen

`gector-bert-de` es un modelo de corrección gramatical del alemán desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia de escritura del mismo nombre. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder `dbmdz/bert-base-german-cased` (BERT base en alemán con casing, del equipo MDZ de la Biblioteca Estatal de Baviera) y exportado a ONNX en fp32 para ejecutarse en CPU. El modelo se publica con el objetivo declarado de que cualquiera pueda inspeccionar lo que corre en su propia máquina, ya que es el componente de corrección gramatical on-device de la aplicación Proofbird.

La relevancia del modelo está en su enfoque: no reescribe ni parafrasea texto, sino que predice para cada token una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas/minúsculas, cambiar la forma verbal, restaurar una diéresis) y aplica las ediciones de forma iterativa hasta cinco veces. Esto lo hace adecuado para integración en editores y correctores donde el usuario debe ver exactamente qué cambia y por qué, con posiciones de carácter explícitas para subrayar y ofrecer la corrección.

El modelo cubre errores típicos del alemán: concordancia sujeto-verbo (incluso con sujetos alejados del verbo), conjugación tras `du`/`ihr`, mayúsculas de sustantivos, diéresis ausentes, uso de `ß` frente a `ss`, distinción `das`/`dass`, palabras duplicadas y mayúscula inicial. Está entrenado exclusivamente con datos sintéticos generados mediante reglas de error escritas a mano sobre texto real, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (dbmdz/bert-base-german-cased) con cabeza de etiquetado de ediciones (5 000 etiquetas) y cabeza de detección de errores, estilo GECToR |
| Parametros totales | no disponible (el modelo base es BERT base; el total exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportación ONNX en fp32; no se indican otras cuantizaciones |
| Idiomas soportados | alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32) |
| Tamano del repositorio | 2,3 GB |
| Version publicada | 2.3.1 (modelo como 2.3.0), run `2026-11-25-1215`, tag `v2.3.1` |
| Libreria | onnx (ONNX Runtime para inferencia) |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: un encoder BERT base en alemán con casing sobre el que se montan dos cabezas, una de etiquetado de ediciones con 5 000 etiquetas posibles y otra de detección de errores. En lugar de generar texto nuevo, para cada token el modelo predice una etiqueta de edición entre un conjunto cerrado (mantener, borrar, reemplazar, añadir, cambiar caso, cambiar forma verbal, restaurar diéresis) y las ediciones se aplican y la frase se vuelve a etiquetar hasta cinco veces. El tagger solo propone ediciones locales y nunca parafrasea. La exportación a ONNX en fp32 está pensada para ejecución en CPU.

El entrenamiento utiliza exclusivamente datos sintéticos, con 3 250 000 frases antes del filtro ortográfico, procedentes de tres fuentes: 1 500 000 frases de Wikipedia en alemán (`wikimedia/wikipedia`, `20231101.de`), 1 500 000 frases de los procedimientos del Parlamento Europeo (Europarl, sesiones anteriores a junio de 2011, vía OPUS) y 250 000 frases de Tatoeba. Se excluyeron las frases con ortografía anterior a la reforma de 1996 (`daß`, `muß`, `Beschluß`) para que el modelo aprenda una única dirección (de ortografía antigua a nueva). El texto se corrompió con reglas de error alemanas escritas a mano, en su mayoría un error por frase independientemente de su longitud, y aproximadamente el 10 % queda limpio para que el modelo aprenda a no tocar texto correcto. Cada regla se validó sobre texto real y se modificó cuando el "error" que generaba también aparecía como alemán correcto.

## Capacidades

- Corrección de concordancia sujeto-verbo, incluidos casos con el sujeto alejado del verbo (`Die Kinder spielt` → `spielen`, `Die Ergebnisse der Studie zeigt` → `zeigen`).
- Conjugación correcta tras `du` e `ihr` (`Du hat` → `hast`, `Ihr ist` → `seid`).
- Capitalización de sustantivos (`keine zeit` → `Zeit`) y mayúscula al inicio de frase.
- Restauración de diéresis ausentes (`Ich hore` → `höre`, `sehr schon` → `schön`).
- Uso de `ß` tras vocal larga o diptongo (`Strasse` → `Straße`, `weiss` → `weiß`) y corrección de grafías anteriores a la reforma de 1996 (`daß` → `dass`).
- Distinción `das`/`dass` tras coma en ambas direcciones, incluso en frases largas.
- Corrección de `nicht war` → `nicht wahr`, confusiones comunes de palabras y palabras duplicadas (`Hast du du` → `Hast du`).
- Detección de errores con salida de posiciones de carácter (`start`, `length`), texto original y reemplazo, apta para subrayar y ofrecer la corrección en una interfaz.
- Robustez ante errores aislados en frases largas: encuentra un error único en frases de 40 palabras o más casi con la misma frecuencia que en frases cortas.
- Respeta repeticiones correctas (`Ist das das Haus von Anna?`), sustantivo seguido de su propio verbo (`Wir müssen das Lernen lernen`), Konjunktiv I en oraciones independientes (`Man nehme zwei Eier`) y texto escrito íntegramente con `ss` en lugar de `ß` (ortografía suiza).
- No soporta tool calling, function calling, agentes ni multimodalidad; es un modelo especializado de etiquetado de tokens.

## Casos de uso

- Corrección gramatical en editores de texto y procesadores de texto: el modelo devuelve posiciones de carácter y reemplazos, lo que permite subrayar el error y ofrecer la corrección con un clic, sin reescribir el texto del usuario.
- Asistencia de escritura en el navegador o en aplicaciones de escritorio: al ejecutarse en CPU mediante ONNX Runtime, puede integrarse en extensiones o apps que procesan el texto localmente sin enviarlo a un servidor.
- Revisión de correos y mensajes en alemán: corrige concordancia, mayúsculas de sustantivos y diéresis en textos cotidianos, un registro cubierto por las frases de Tatoeba y Europarl del entrenamiento.
- Control de calidad de documentación y textos enciclopédicos: el modelo está entrenado con Wikipedia en alemán y detecta errores de concordancia en frases largas, útil en pipelines de revisión de contenido.
- Preprocesado en pipelines de NLP: normalizar texto alemán (restaurar diéresis, corregir `ß`/`ss`, unificar ortografía posterior a 1996) antes de tareas posteriores como traducción o análisis.
- Corrección en entornos con requisitos de privacidad: al ser on-device y no requerir GPU ni API key, encaja en aplicaciones que deben garantizar que el texto del usuario no sale del dispositivo.
- Herramienta educativa para aprendices de alemán: las sugerencias con posición y reemplazo explícitos permiten mostrar al estudiante qué cambió y por qué, sin parafrasear su texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye como ONNX fp32 y está diseñado para ejecutarse en CPU con ONNX Runtime, sin necesidad de GPU.
- VRAM estimada para inferencia: no aplica en el caso previsto (CPU); no se proporcionan cifras de VRAM para ejecución en GPU.
- GPU recomendadas: no se indican; el caso de uso declarado es on-device en CPU.
- Cabe en GPU de consumo: no se especifica, pero al ser un BERT base exportado a ONNX fp32 (repositorio de 2,3 GB) es plausible que quepa en GPUs de consumo, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (probado en el quickstart con `onnxruntime`, `tokenizers` y `huggingface_hub`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos de corrección gramatical del alemán en la información proporcionada. Como referencia estructural, el modelo se apoya en `dbmdz/bert-base-german-cased` (MIT) como encoder, pero no se ofrecen métricas comparativas frente a alternativas como modelos GECToR multilingües o correctores comerciales.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| proofbird/gector-bert-de | no disponible (BERT base) | no disponible | Apache 2.0 | ONNX fp32 | GECToR sobre BERT alemán, on-device |
| dbmdz/bert-base-german-cased | BERT base | no disponible | MIT | safetensors/PyTorch | Encoder base, no corrector |
| Alternativas GEC del alemán | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo corrige alemán; no soporta otros idiomas.
- No reescribe ni parafrasea: únicamente aplica ediciones locales, por lo que no corrige problemas de estilo, estructura oracional ni coherencia global.
- Entrenado exclusivamente con datos sintéticos generados por reglas; puede no cubrir errores reales que las reglas no contemplan o corregir de forma agresiva construcciones válidas poco frecuentes.
- Aproximadamente el 10 % del entrenamiento queda limpio para enseñar al modelo a no tocar texto correcto, pero existe riesgo de falsos positivos en textos correctos con estructuras ambiguas.
- Puede tener sesgos derivados de las fuentes: Wikipedia (registro enciclopédico), Europarl (discurso parlamentario anterior a 2011) y Tatoeba (frases cotidianas), lo que puede infrarepresentar registros técnicos, dialectales o coloquiales actuales.
- Excluye la ortografía anterior a la reforma de 1996 y aprende solo la dirección de ortografía antigua a nueva; no debe esperarse corrección hacia formas previas a la reforma.
- Respeta deliberadamente el texto escrito íntegramente con `ss` en lugar de `ß` (ortografía suiza), lo que puede ser indeseado si se espera normalización al estándar alemán.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `dbmdz/bert-base-german-cased` (MIT) y de los datasets empleados en el entrenamiento (Wikipedia, Europarl vía OPUS, Tatoeba) para el caso de uso concreto.
- La versión publicada es 2.3.1 con tag `v2.3.1`; conviene fijar la revisión con `revision="v2.3.1"` para reproducibilidad, ya que el autor mantiene versiones anteriores bajo sus propios tags.
- No se han publicado benchmarks ni métricas de latencia/throughput en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-de
- Tag de la versión 2.3.1: https://huggingface.co/proofbird/gector-bert-de/tree/v2.3.1
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-de/blob/main/quickstart.ipynb
- Script quickstart.py: https://huggingface.co/proofbird/gector-bert-de/blob/main/quickstart.py
- Modelo base: https://huggingface.co/dbmdz/bert-base-german-cased
- Dataset Wikipedia en alemán: https://huggingface.co/datasets/wikimedia/wikipedia
- OPUS (Europarl): https://opus.nlpl.eu/
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
