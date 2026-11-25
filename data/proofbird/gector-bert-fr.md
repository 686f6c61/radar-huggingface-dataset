# proofbird/gector-bert-fr

## Resumen

`gector-bert-fr` es un modelo de corrección gramatical del francés desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia de escritura del mismo nombre. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder `Geotrend/bert-base-fr-cased` (la reducción francesa de mBERT) y exportado a ONNX en fp32 para ejecutarse en CPU, lo que permite corrección gramatical en el propio dispositivo sin GPU ni conexión a servicios externos.

El modelo no reescribe ni parafrasea el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas o terminación) entre un vocabulario de 5 000 etiquetas, aplica las ediciones y vuelve a etiquetar la frase hasta cinco iteraciones. Incorpora además una cabeza de detección de errores. Su relevancia radica en que ofrece corrección gramatical francesa con licencia Apache-2.0, sin datos de aprendices ni corpus no comerciales, y ejecutable en local.

La versión publicada es la 1.3.2 (archivos de modelo 1.3.0, run `2026-11-17-0743`), con un tamaño de repositorio de 0,9 GB y 302 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (Geotrend/bert-base-fr-cased) con cabeza de etiquetado GECToR (5 000 etiquetas de edición) y cabeza de detección de errores |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (exportación ONNX publicada); no se documentan otras |
| Idiomas soportados | francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: un encoder BERT base en francés con case (Geotrend) sobre el que se montan dos cabezas, una de etiquetado de ediciones con 5 000 etiquetas y otra de detección de errores. La inferencia es iterativa: se predicen etiquetas por token, se aplican las ediciones y se vuelve a etiquetar la frase hasta un máximo de cinco pasadas. El tagger solo propone ediciones locales, nunca parafrasea.

El entrenamiento es exclusivamente sintético, con 3 250 000 frases de tres fuentes: 1 500 000 de Wikipedia francesa (`wikimedia/wikipedia`, `20231101.fr`), 1 500 000 de los proceedings del Parlamento Europeo (Europarl v10, sesiones 1996 – mayo 2011) y 250 000 de Tatoeba. La corrupción se generó con reglas de error escritas a mano y validadas sobre texto real (se descartaba un patrón si el "error" también aparecía como francés correcto); alrededor del 10 % del texto permanece limpio para enseñar al modelo a no tocar lo correcto. Para patrones difíciles se añadieron 80 750 líneas extra y 62 520 pares de frases con el error colocado exactamente sobre el patrón, más 176 000 frases de plantilla para cubrir primera y segunda persona, preguntas, participios plurales y concordancia en cláusulas posteriores. No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. Entrenamiento de una época (118 361 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4; los pesos publicados son el último paso.

## Capacidades

- Corrección de concordancia de género y número en adjetivos, participios pasados tras `être` y sustantivos tras numerales y determinantes (`Les filles sont fatigué` → `fatiguées`).
- Femininos irregulares (`La voiture était très vieux` → `vieille`).
- Concordancia sujeto-verbo (`Les enfants joue` → `jouent`) y persona verbal tras `vous` y `tu` (`Vous a raison` → `avez`).
- Acentos que cambian la palabra (`a` → `à`, `ou` → `où` en preguntas, `garée la` → `là`).
- Preposiciones contractas (`à le` → `au`, `de le` → `du`) y elisión (`le arbre` → `l'arbre`).
- Artículo de un sustantivo en una cláusula posterior (`…, et le voiture est garée` → `la voiture`).
- Palabras y artículos duplicados (`la la porte`), homófonos frecuentes y mayúscula inicial de frase.
- Salida con sugerencias posicionadas por carácter (`start`, `length`, `original`, `replacement`), apta para subrayar y ofrecer la corrección en una interfaz.
- Ejecución en CPU vía ONNX Runtime, sin GPU ni clave de API; orientado a on-device.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un etiquetador de corrección gramatical, no un modelo generativo conversacional.

## Casos de uso

- Asistente de escritura en el navegador: el modelo se ejecuta en local mediante ONNX Runtime y WASM/Web, de modo que el texto del usuario nunca sale de la página; adecuado para extensiones y editores web que priorizan privacidad.
- Corrección en procesadores de textos y clientes de correo de escritorio: al ser un modelo de 0,9 GB en fp32 y ejecutarse en CPU, puede empaquetarse en aplicaciones nativas sin depender de servidores.
- Preprocesado de corpus franceses: limpiar concordancias y acentos en textos scrapeados o transcripciones antes de alimentar otros pipelines de NLP.
- Herramientas educativas de francés: ofrecer sugerencias localizadas por carácter (posición, original, reemplazo) permite explicar el error al estudiante en lugar de reescribir la frase.
- Filtrado de calidad en plataformas de contenido generado por usuarios: detectar y corregir errores gramaticales frecuentes en comentarios o formularios antes de publicarlos.
- Integración en pipelines de CI de documentación: corregir de forma automática concordancias y acentos en ficheros Markdown o documentación en francés sin enviar contenido a APIs externas.
- Corrección de subtítulos y transcripciones: al trabajar sobre texto plano y con ediciones locales, encaja en flujos de postprocesado de ASR en francés.

## Benchmarks y rendimiento

| Comprobación | Resultado |
|---|---|
| Conjunto gold (618 frases escritas a mano: 478 con un error, 140 correctas) | 478 corregidas, 140 intactas, 0 no detectadas, 0 empeoradas |
| Correcciones erróneas sobre 4 000 frases cotidianas de Tatoeba (reservadas del entrenamiento) | el dato queda truncado en la información disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; la exportación publicada es ONNX fp32 pensada para CPU.
- GPU recomendadas: no necesarias; el modelo está diseñado para ejecutarse en CPU. El entrenamiento se realizó en una NVIDIA L4, pero la inferencia no requiere GPU.
- Cabe en GPU de consumo: sí, aunque su objetivo es CPU; cualquier GPU consumer podría ejecutarlo, pero no es el escenario previsto.
- Opciones de despliegue: ONNX Runtime (vía `quickstart.py` del repositorio), con dependencias `onnxruntime`, `tokenizers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Ejecución | Datos de entrenamiento |
|---|---|---|---|---|---|
| proofbird/gector-bert-fr | GECToR sobre BERT base, ONNX | fr | Apache-2.0 | CPU / on-device | Sintético (Wikipedia, Europarl, Tatoeba) |
| Modelos GECToR multilingües (p. ej. variantes sobre mBERT/XLM-R) | GECToR | varios | variable | GPU/CPU | variable; no disponible en la información |
| Correctores generativos tipo seq2seq (p. ej. mT5/T5 fine-tuned para GEC) | encoder-decoder | varios | variable | GPU preferente | variable; no disponible en la información |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a alternativas concretas; la comparación anterior es estructural.

## Limitaciones y advertencias

- Solo corrige francés; no hay soporte multilingüe.
- Es un etiquetador de ediciones locales: no reescribe, no parafrasea y no corrige problemas de estilo o estructura que requieran cambios no locales.
- Entrenado únicamente con datos sintéticos generados por reglas; los errores no cubiertos por esas reglas pueden no detectarse.
- Riesgo de falsos positivos sobre construcciones correctas poco frecuentes, aunque el conjunto de validación reporta 0 correcciones empeoradas en 618 frases y el entrenamiento incluye un 10 % de texto limpio.
- No se documentan sesgos específicos; al derivar de Wikipedia, Europarl y Tatoeba, puede heredar sesgos de esas fuentes.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `Geotrend/bert-base-fr-cased` también es Apache-2.0 según la model card.
- El dato de correcciones erróneas sobre Tatoeba está truncado en la información disponible; conviene verificarlo antes de desplegar en producción.
- La longitud de contexto no está documentada; frases muy largas pueden requerir troceado.
- Las versiones se gestionan por tags (`v1.3.0`, `v1.2.0`, `v1.1.0`, `v1.0.0`); para producción conviene fijar `revision="v1.3.0"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-fr
- Demo en el navegador (HF Space): https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-fr/blob/main/quickstart.ipynb
- Aplicación Proofbird: https://proofbird.app
- Modelo base: https://huggingface.co/Geotrend/bert-base-fr-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Tag de la versión publicada: https://huggingface.co/proofbird/gector-bert-fr/tree/v1.3.2
