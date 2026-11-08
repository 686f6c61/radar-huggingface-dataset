# proofbird/gector-bert-fr

## Resumen

`gector-bert-fr` es un modelo de corrección gramatical del francés desarrollado por Proofbird, la empresa detrás de una extensión de escritorio para Windows que revisa ortografía y gramática mientras se escribe. El modelo sigue el paradigma GECToR: en lugar de reescribir o parafrasear el texto, predice para cada token una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas o cambiar terminación) y aplica esas ediciones de forma iterativa. Está publicado para que cualquiera pueda inspeccionar qué se ejecuta en su propia máquina, ya que el producto funciona íntegramente en local.

Técnicamente es un encoder BERT base en francés (`Geotrend/bert-base-fr-cased`, reducción francesa de mBERT) con dos cabezas superpuestas: una de etiquetado de ediciones con 5 000 etiquetas y otra de detección de errores. El modelo se exporta a ONNX en fp32 (opset 17) para ejecutarse en CPU, sin GPU ni clave de API. El repositorio ocupa 0,4 GB y la licencia es Apache-2.0.

Su relevancia radica en el enfoque de precisión sobre recall: está entrenado para no tocar texto correcto (0,43 % de falsos positivos sobre 4 000 frases de Tatoeba) y para proponer solo ediciones locales, nunca paráfrasis. Es un caso poco habitual de modelo de corrección gramatical publicado con guards de aplicación explícitos (`gector-guards.json`) y con métricas de estabilidad frente a perturbaciones de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con cabezas de etiquetado de ediciones (GECToR) |
| Parametros totales | no disponible (base: BERT base, ~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder BERT base, típicamente 512 tokens) |
| Tipos de cuantizacion | fp32 (exportación ONNX); no se documentan otras |
| Idiomas soportados | francés (`fr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17) + tokenizer WordPiece (`vocab.txt`, `tokenizer.json`) |
| Etiquetas de edición | 5 000 |
| Salidas | `logits_labels` [1, T, 5000], `logits_d` [1, T, 2] |
| Version | v1.0.0, run `2026-11-07-1303` |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un tagger secuencial estilo GECToR construido sobre `Geotrend/bert-base-fr-cased`, un BERT base en francés derivado de mBERT. Sobre el encoder se sitúan dos cabezas: una de clasificación de ediciones con 5 000 etiquetas (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas, cambiar terminación) y otra de detección de errores con dos clases. En inferencia, el tagger propone ediciones locales, estas se aplican y la frase se re-etiqueta hasta cinco veces. El modelo nunca parafrasea ni reescribe oraciones completas.

El entrenamiento es exclusivamente sintético. Se partió de 3 000 000 de frases de Wikipedia en francés (`wikimedia/wikipedia`, `20231101.fr`) y 250 000 frases de Tatoeba, corrompidas con reglas de error escritas a mano para el francés; alrededor del 10 % se dejan limpias para que el modelo aprenda a no tocar texto correcto. Se añadieron 176 000 frases de plantilla para cubrir patrones poco frecuentes en Wikipedia (primera y segunda persona, preguntas, participios en plural, concordancia en una cláusula posterior). No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. El entrenamiento fue de una época (111 854 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4. No se documenta RLHF ni DPO.

## Capacidades

- Corrección de concordancia de género y número en adjetivos, participios pasados tras `être` y sustantivos tras numerales y determinantes (`Les filles sont fatigué` → `fatiguées`).
- Concordancia sujeto-verbo (`Les enfants joue` → `jouent`).
- Persona verbal tras `vous` y `tu` (`Vous a raison` → `avez`).
- Acentos que cambian la palabra (`a` → `à`, `ou` → `où` en preguntas).
- Preposiciones contractas (`à le` → `au`, `de le` → `du`).
- Elisión (`le arbre` → `l'arbre`).
- Palabras y artículos duplicados (`la la porte`).
- Homófonos frecuentes y mayúscula inicial de frase.
- Detección de errores mediante cabeza dedicada (`logits_d`).
- Salida con posiciones de carácter (`start`, `length`), texto original y reemplazo, apta para subrayar y ofrecer la corrección en una interfaz.
- Ejecución en CPU vía ONNX Runtime, sin GPU ni clave de API.
- No soporta tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- **Asistente de escritura de escritorio**: integrado en una app tipo Proofbird para Windows, el modelo revisa mientras se escribe y subraya sugerencias con posición de carácter exacta, sin enviar texto a la nube. Es adecuado por su tamaño reducido y su ejecución en CPU.
- **Corrección en editores y formularios web**: al exportarse a ONNX, puede embeberse en aplicaciones web o de escritorio que necesiten validar texto francés antes de enviarlo, con latencia de CPU y sin dependencia de servidores.
- **Preprocesado de corpus franceses**: limpieza de concordancias y acentos en textos de Wikipedia o Tatoeba antes de usarlos en pipelines de NLP, aprovechando que el modelo está entrenado para dejar intacto el texto correcto.
- **Herramientas de accesibilidad**: sugerencias de corrección con posiciones de carácter para lectores de pantalla y editores con resaltado, gracias a la estructura `start`/`length`/`original`/`replacement`.
- **Filtro de calidad en publicación de contenidos**: revisión de borradores en francés en CMS o plataformas editoriales para detectar errores de concordancia y acentos antes de publicar.
- **Evaluación y docencia de francés**: uso como corrector de referencia en ejercicios, con la precaución de que no se ha medido sobre ensayos de aprendices y puede fallar en errores irregulares.
- **Integración en pipelines de CI de documentación**: validación automática de ficheros Markdown o documentación en francés para detectar errores gramaticales básicos antes de fusionar cambios.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Gold set (618 frases escritas a mano: 478 con un error, 140 correctas) | 472 corregidas, 140 intactas, 6 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases de Tatoeba (held out) | 17 modificadas (0,43 %); 9 de ellas corrigen errores reales del texto de Tatoeba |
| Estabilidad: gold re-ejecutado con un token extra al inicio | 4 frases cambian de resultado (las 4 filas de mayúsculas cambian por construcción y no se cuentan) |

El gold score se obtiene con los guards de aplicación de `gector-guards.json`. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El modelo no se ha medido sobre ensayos de aprendices.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta a ONNX fp32 y está pensado para ejecutarse sin GPU.
- VRAM: no requiere GPU; el consumo es de RAM del sistema (repo de 0,4 GB, modelo BERT base fp32).
- GPU recomendadas: no necesarias; el entrenamiento se hizo en una NVIDIA L4, pero la inferencia es de CPU.
- Cabe en cualquier equipo de consumo: sí, al ser un BERT base en fp32 ejecutado en CPU.
- Opciones de despliegue: ONNX Runtime (documentado), con `quickstart.py` como referencia; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un tagger ONNX de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Autor | Idioma | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `proofbird/gector-bert-fr` | Proofbird | fr | BERT base + GECToR | Apache-2.0 | ONNX fp32 | Corrección local, on-device, guards incluidos |
| `proofbird/gector-bert-en` | Proofbird | en | BERT base + GECToR | Apache-2.0 | ONNX | Versión inglesa del mismo enfoque |
| `Geotrend/bert-base-fr-cased` | Geotrend | fr | BERT base | Apache-2.0 | safetensors | Encoder base sin cabeza GEC, no corrige por sí solo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con datos sintéticos: no se ha medido sobre ensayos de aprendices ni sobre errores humanos reales fuera del gold set.
- Fallos conocidos: `où` al final de frase o tras una cláusula con coma, y femeninos irregulares en una cláusula posterior (`la voiture était très vieux`).
- Sin guards, el modelo puede proponer no-palabras para adjetivos irregulares (`vieux` → `vieuse`); la app retiene toda no-palabra, pero un integrador debe aplicar `gector-guards.json`.
- Falsas alarmas documentadas: `un jour ou l'autre` → `où` y cambio de pronombre objeto (`Nous ne la comprîmes pas` → `le`).
- Solo francés; no soporta otros idiomas ni cambio de código.
- No parafrasea ni reescribe: solo aplica ediciones locales token a token.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con métricas limitadas a los conjuntos descritos.
- No hay datos publicados de latencia, throughput ni comportamiento con contextos largos más allá del límite del encoder BERT base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-fr
- Versión fijada v1.0.0: https://huggingface.co/proofbird/gector-bert-fr/tree/v1.0.0
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-fr/blob/main/quickstart.ipynb
- Modelo base: https://huggingface.co/Geotrend/bert-base-fr-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Producto Proofbird: https://proofbird.app
- Perfil del autor: https://huggingface.co/proofbird
- Versión inglesa: https://huggingface.co/proofbird/gector-bert-en
