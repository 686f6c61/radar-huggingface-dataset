# proofbird/gector-bert-en

## Resumen

`proofbird/gector-bert-en` es un modelo de corrección gramatical del inglés (GEC, *grammatical error correction*) desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia a la escritura proofbird.app. Se trata de un etiquetador de secuencias al estilo GECToR construido sobre el encoder `google-bert/bert-base-cased` con una cabeza de clasificación de 990 etiquetas de edición y una segunda cabeza de detección de errores. El modelo no reescribe texto: para cada token predice una edición local (mantener, borrar, reemplazar, añadir, cambiar mayúsculas o cambiar forma verbal) y aplica las ediciones de forma iterativa hasta cinco pasadas.

Su relevancia actual radica en que está exportado a ONNX en fp32 para ejecutarse íntegramente en CPU, lo que lo hace apto para inferencia *on-device*: la propia demo de Hugging Face Spaces corre en el navegador del usuario sin enviar el texto a ningún servidor. El repositorio ocupa 0,9 GB, el modelo solo entiende inglés y se distribuye con licencia Apache-2.0, lo que permite inspección, uso comercial y despliegue local sin dependencias de API.

La versión publicada es la 1.2.1 (ficheros de modelo 1.2.0, actualización de model card), con el tag `v1.2.1` y run id `2026-11-22-2313`. El entrenamiento es exclusivamente sintético (3 250 000 frases) y no emplea corpus de aprendices ni texto de usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con cabeza de etiquetado de ediciones (990 etiquetas) y cabeza de detección de errores; paradigma GECToR |
| Parámetros totales | no disponible (modelo base `bert-base-cased`, ~110 M de parámetros) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (limitada por la ventana de BERT-base, 512 tokens) |
| Tipos de cuantización | fp32 (exportación ONNX publicada); no se documentan otras variantes |
| Idiomas soportados | inglés (`en`), con cobertura de ortografía americana y británica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32); modelo base en safetensors vía `google-bert/bert-base-cased` |

## Arquitectura y entrenamiento

El modelo sigue el esquema GECToR: un encoder BERT-base-cased produce representaciones por token y una cabeza de clasificación predice, para cada token, una etiqueta de edición entre 990 posibles. Las ediciones se aplican sobre la frase, se vuelve a etiquetar y se repite el proceso hasta cinco iteraciones. Una cabeza adicional de detección de errores decide si la frase contiene algún error. El tagger solo propone ediciones locales; nunca parafrasea ni reordena el texto.

El entrenamiento usó exclusivamente datos sintéticos: 1 500 000 frases de Wikipedia en inglés (`wikimedia/wikipedia`, `20231101.en`), 1 500 000 frases de los proceedings del Parlamento Europeo (Europarl v10, sesiones anteriores a junio de 2011) y 250 000 frases de Tatoeba, en total 3 250 000 frases. Las frases se corrompieron con reglas de error escritas a mano, normalmente un error por frase con independencia de su longitud; cerca del 10 % se mantuvieron limpias para que el modelo aprenda a no tocar texto correcto. Las reglas solo reemplazan o duplican palabras, ninguna elimina una, por lo que el modelo no aprende a insertar palabras. Se añadieron frases reales con patrones específicos (`there` como lugar, `they're`/`you're` ante verbo o adjetivo, `its`/`it's`, `than` tras comparativo, plurales irregulares, imperativos), 8 139 frases de plantilla para formas poco frecuentes en los corpus (`mice`, `knives`, `wolves`, `they're`) y 150 000 frases de plantilla adicionales para preguntas, imperativos, primera y segunda persona, sustantivos colectivos y de masa, y errores en cláusulas posteriores. No se usaron corpus de aprendices ni datos no comerciales.

El entrenamiento consistió en una época (125 863 pasos, batch 64, learning rate pico 1,5e-5) sobre una NVIDIA L4; los pesos publicados son el paso final. La exportación a ONNX fp32 permite ejecución en CPU sin GPU.

## Capacidades

- Corrección de concordancia sujeto-verbo (`The results shows` → `show`).
- Corrección de tiempos y formas de participio (`have went` → `have gone`).
- Uso correcto de `a`/`an`.
- Plurales irregulares (`The mouses ran away` → `mice`, `Two knifes` → `knives`).
- Confundibles (`their`/`there`/`they're`, `your`/`you're`, `its`/`it's`, `then`/`than`, `to`/`too`).
- Detección y eliminación de palabras duplicadas.
- Capitalización al inicio de frase.
- Errores de registro cotidiano en preguntas, imperativos y primera y segunda persona (`Does the machines work` → `Do`, `Opens the window` → `Open`).
- Detección de un único error en frases largas con una tasa similar a frases cortas.
- Salida estructurada con sugerencias: posición de carácter (`start`, `length`), texto original (`original`) y reemplazo (`replacement`), apta para subrayar y ofrecer la corrección en una interfaz.
- Compatibilidad con ortografía americana y británica: deja la ortografía al corrector ortográfico (`colour`/`color`, `organise`/`organize`, `theatre`/`theater`) y, con las guardas, mantiene verbo plural con sustantivo colectivo según permite el inglés británico (`The team are playing`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es un corrector gramatical de edición local.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Corrección gramatical en el navegador: el modelo se ejecuta vía ONNX Runtime en el equipo del usuario y el texto nunca abandona la página, lo que permite integrarlo en extensiones o editores web con privacidad total.
- Asistente de escritura embebido: Proofbird lo usa como modelo gramatical on-device en su aplicación; las sugerencias con `start`/`length`/`original`/`replacement` permiten subrayar el error y ofrecer el arreglo en la interfaz.
- Revisión de textos en inglés no nativos: corrige concordancia, tiempos verbales, confundibles y plurales irregulares en frases de registro cotidiano y académico, útil para revisar emails, informes o documentación antes de publicarlos.
- Preprocesado de corpus: puede aplicarse a grandes volúmenes de texto en inglés en CPU para normalizar errores gramaticales antes de alimentar otros pipelines de NLP, sin coste de GPU.
- Herramienta de línea de comandos y CI: `quickstart.py` permite ejecutar la corrección desde terminal o dentro de un pipeline de CI/CD para validar la gramática de textos generados o de documentación.
- Corrección en entornos sin GPU o sin conectividad: al ser ONNX fp32 sobre CPU, es desplegable en portátiles, servidores modestos o dispositivos edge donde no hay acelerador disponible.
- Filtrado de calidad en generación de texto: la cabeza de detección de errores permite marcar frases candidatas generadas por otros modelos y descartar o marcar las que contienen errores gramaticales.
- Investigación y auditoría: al publicarse los pesos y el código de inferencia, permite inspeccionar exactamente qué correcciones se aplican en la máquina del usuario, algo relevante para equipos que exigen transparencia sobre el software que procesa sus textos.

## Benchmarks y rendimiento

La model card menciona una tabla de medición con un "Gold set (420 hand-written sentences: 2..." pero el contenido citado está truncado y no incluye los resultados numéricos. No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y este modelo no es evaluable con esos benchmarks al no ser un modelo generativo general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante publicada; el modelo está exportado a ONNX fp32 y está pensado para ejecución en CPU.
- GPU recomendadas: innecesarias para la inferencia publicada; el entrenamiento se realizó en una NVIDIA L4.
- ¿Cabe en GPU consumer? Sí, cualquier GPU consumer con memoria suficiente podría cargar un modelo de ~110 M de parámetros en fp32 (menos de 1 GB de pesos), aunque la distribución publicada está optimizada para CPU.
- Opciones de despliegue: ONNX Runtime (vía `quickstart.py`), Hugging Face Spaces (demo en navegador), línea de comandos con `python quickstart.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de token classification.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofbird/gector-bert-en | ~110 M (base BERT) | no disponible (ventana BERT, 512 tokens) | Corrección gramatical GECToR, ONNX CPU | Apache-2.0 | Hugging Face, on-device |
| google-bert/bert-base-cased | ~110 M | 512 tokens | Encoder general (modelo base) | Apache-2.0 | Hugging Face |
| GECToR original (grammatical error correction) | no disponible | no disponible | Corrección gramatical por etiquetado de ediciones | no disponible | Repositorio académico |
| Modelos GEC generativos (seq2seq) | no disponible | no disponible | Reescriben la frase completa | varía | varía |

La comparativa directa con alternativas GEC queda limitada porque la información proporcionada no incluye resultados de benchmarks ni otros modelos GEC con datos verificables. El modelo base `google-bert/bert-base-cased` es el componente sobre el que se construye, no un competidor directo en la tarea.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Solo propone ediciones locales: nunca parafrasea, reordena ni inserta palabras (las reglas de corrupción no eliminaban palabras, por lo que no aprendió a insertarlas).
- Entrenamiento exclusivamente sintético: puede no generalizar a errores de aprendices reales o a fenómenos ausentes de las reglas de corrupción.
- Dependencia del corrector ortográfico: no corrige ortografía (`colour`/`color` se dejan intactos), por lo que necesita un componente adicional para esa capa.
- Riesgo de falsos positivos en textos correctos: aunque ~10 % de frases limpias enseñan a no tocar texto, las guardas y reglas pueden alterar construcciones válidas en registros específicos.
- Longitud de contexto no documentada; al derivar de BERT-base, está limitada a 512 tokens, lo que restringe su uso en documentos largos sin segmentación.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes (Wikipedia, Europarl, Tatoeba) para usos específicos.
- No es un modelo generativo ni un agente: no soporta tool calling, razonamiento multi-paso ni multimodalidad.
- La model card advierte que la tabla de medición está truncada en la información disponible; no deben asumirse métricas de precisión o recall sin consultar la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-en
- Demo en navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-en/blob/main/quickstart.ipynb
- Tag de versión: https://huggingface.co/proofbird/gector-bert-en/tree/v1.2.1
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
