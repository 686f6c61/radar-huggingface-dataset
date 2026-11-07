# proofbird/gector-bert-es

## Resumen

`gector-bert-es` es un modelo de corrección gramatical del español (GEC, *Grammatical Error Correction*) desarrollado por Proofbird, el autor de una herramienta de asistencia de escritura para Windows. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder BETO (`dccuchile/bert-base-spanish-wwm-cased`) y exportado a ONNX en fp32 para ejecutarse en CPU, sin necesidad de GPU. El modelo no reescribe el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas o cambiar forma verbal) y aplica las ediciones de forma iterativa hasta cinco pasadas.

Su relevancia radica en el enfoque *on-device*: el modelo se publica para que cualquiera pueda auditar qué se ejecuta en su máquina, ya que Proofbird realiza las comprobaciones gramaticales en local sin enviar el texto a un servidor. El modelo está entrenado exclusivamente con datos sintéticos (Wikipedia en español y Tatoeba corrompidos con reglas de error escritas a mano) y declara un objetivo de precisión: prefiere no corregir antes que corregir mal.

La arquitectura es un transformer encoder BETO base con una cabeza de etiquetado de 5 000 etiquetas de edición y una cabeza de detección de errores. El repositorio ocupa 0,5 GB, la licencia es CC BY 4.0 y el único idioma soportado es el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BETO, BERT base) con cabeza de etiquetado GECToR de 5 000 etiquetas y cabeza de detección de errores |
| Parametros totales | no disponible (derivado de BETO base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder BETO base) |
| Tipos de cuantizacion | fp32 (exportación ONNX, opset 17); no se publican otras variantes |
| Idiomas soportados | es (español) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`), tokenizer WordPiece (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo sigue el esquema GECToR (*Tag, Not Rewrite*, Omelianchuk et al., 2020): en lugar de generar una reescritura completa, predice para cada token una etiqueta de edición entre 5 000 posibles (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas/minúsculas, cambiar forma verbal). Las ediciones se aplican, la frase se vuelve a etiquetar y el proceso se repite hasta cinco veces. Sobre el encoder BETO se sitúan dos cabezas: una de etiquetado (`logits_labels`, forma [1, T, 5000]) y otra de detección de errores (`logits_d`, forma [1, T, 2]). La exportación ONNX usa opset 17 y entradas `input_ids` y `attention_mask`.

El entrenamiento utiliza únicamente datos sintéticos: 3 000 000 de frases de Wikipedia en español (`wikimedia/wikipedia`, `20231101.es`) y 250 000 frases de Tatoeba, corrompidas con reglas de error escritas a mano; aproximadamente el 10 % permanece limpio para que el modelo aprenda a no tocar texto correcto. Se añadieron 200 000 frases de plantilla para patrones poco frecuentes en Wikipedia (primera y segunda persona, preguntas, imperativos, concordancia a larga distancia). No se usaron corpus de aprendices ni texto de usuarios. El ajuste fue de una época (100 325 pasos, lote 64, tasa de aprendizaje 3e-5) en una NVIDIA L4, con identificador de ejecución `2026-11-06-2304`.

## Capacidades

- Corrección de concordancia de género y número (artículos, adjetivos, participios, sustantivos tras numerales y determinantes).
- Corrección de concordancia sujeto-verbo.
- Corrección de género de artículos (`un mesa` → `una mesa`), conservando casos correctos como `el agua`.
- Resolución de contracciones (`de el` → `del`, `a el` → `al`).
- Corrección de acentos y diacríticos (`cancion` → `canción`, `¿Como` → `¿Cómo`).
- Añadido de signos de apertura de interrogación y exclamación.
- Capitalización al inicio de frase.
- Corrección de errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.
- Detección de errores (cabeza `logits_d`) además de la propuesta de edición.
- Ejecución en CPU mediante ONNX Runtime; pensado para despliegue *on-device*.
- No realiza parafraseo: solo propone ediciones locales.
- No soporta tool calling, agentes ni multimodalidad.

## Casos de uso

- Asistente de escritura de escritorio: integración en un editor o corrector tipo Proofbird que comprueba gramática mientras se escribe, ejecutando el modelo en la CPU del usuario sin enviar texto a un servidor.
- Corrección por lotes de textos en español: procesamiento de artículos, documentación o entradas de blog para corregir acentos, concordancias y contracciones antes de publicar.
- Preprocesado de corpus: limpieza de errores ortográficos y gramaticales superficiales en textos de Wikipedia o Tatoeba antes de usarlos en otros pipelines de NLP.
- Revisión de textos generados por otros modelos: pasada de corrección posterior sobre salidas de LLM en español para arreglar acentos, signos de apertura y concordancias.
- Aplicaciones con requisitos de privacidad: entornos donde el texto no puede salir del dispositivo (sanidad, legal, administración), gracias a la ejecución local en ONNX.
- Integración en herramientas de ofimática o correctores: uso de los archivos estándar (`model.onnx`, `config.json`, `gector-guards.json`) con cualquier decodificador de estilo GECToR para añadir corrección gramatical a un editor existente.
- Filtro de calidad en formularios o entradas de usuario: detección de errores gramaticales frecuentes en textos cortos escritos por usuarios, con las guardas de aplicación para limitar falsos positivos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto gold (571 frases escritas a mano: 433 con un error, 138 correctas) | 426 corregidas, 138 sin tocar, 7 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases de Tatoeba (reservadas del entrenamiento) | 24 modificadas (0,60 %) |
| Estabilidad: repetición del gold con un token extra delante de cada frase | 2 frases cambian de resultado |

La puntuación gold se obtiene con las guardas de aplicación de `gector-guards.json`. El modelo se entrenó priorizando la precisión: un error no detectado penaliza menos que una corrección incorrecta. Aproximadamente la mitad de los cambios sobre Tatoeba corrigen errores propios de Tatoeba (acentos ausentes como `volveria` → `volvería`, `No sabe que decir` → `qué`); el resto son falsas alarmas reales (por ejemplo `por tu bien` → `tú`, `video juegos` → `juego`). No se ha medido sobre redacciones de aprendices.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta en fp32 a ONNX y está diseñado para ejecutarse en CPU con ONNX Runtime, sin GPU.
- VRAM estimada: no aplica en el caso previsto (CPU); el repositorio ocupa 0,5 GB en disco.
- GPU recomendadas: no disponibles; el autor no publica requisitos de GPU.
- ¿Cabe en GPU de consumo? No se indica; al ser un BERT base en fp32, cabría en GPUs de consumo con suficiente memoria, pero no es el escenario declarado.
- Opciones de despliegue: ONNX Runtime (usado por Proofbird con su propio tokenizador y decodificador en C#); los archivos son estándar y cualquier decodificador de estilo GECToR puede usarlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Idioma | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `proofbird/gector-bert-es` | Proofbird | es | BETO + GECToR, ONNX | no disponible | CC BY 4.0 | ONNX |
| `proofbird/gector-bert-en` | Proofbird | en | BETO/encoder + GECToR, ONNX | no disponible | Apache 2.0 | ONNX |
| GECToR original (Omelianchuk et al., 2020) | Grammarly | en | BERT + GECToR | no disponible | no disponible en la información | no disponible |

No se dispone de datos de benchmarks comparativos con otros correctores gramaticales del español en la información proporcionada.

## Limitaciones y advertencias

- No se ha medido sobre redacciones de aprendices; el conjunto gold son frases escritas a mano por el autor.
- Errores no detectados conocidos: plural de adjetivos terminados en `-e` (`son muy interesante`) y concordancia a través de una oración de relativo (`La camisa, que es nueva, ya está roto`).
- Falsas alarmas documentadas en Tatoeba: `por tu bien` → `tú`, `video juegos` → `juego`.
- Solo corrige ediciones locales; no parafrasea ni reescribe frases completas.
- Entrenado solo con datos sintéticos; puede no cubrir fenómenos ausentes de Wikipedia y Tatoeba.
- Solo soporta español.
- Licencia CC BY 4.0: requiere atribución. El autor advierte, citando a los autores de BETO, que no está seguro de que todos los conjuntos usados para preentrenar BETO tengan licencia compatible con CC BY 4.0, especialmente para uso comercial, y pide verificar que encaje en cada caso.
- Los datos de ajuste tienen sus propias condiciones: Wikipedia (CC BY-SA 4.0) y Tatoeba (CC BY 2.0 FR); el texto de Wikipedia es © colaboradores de Wikipedia.
- Las guardas de `gector-guards.json` forman parte del resultado medido; sin ellas el rendimiento puede diferir.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede proponer ediciones incorrectas en contextos no vistos.
- No soporta tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-es
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Proofbird (organización en Hugging Face): https://huggingface.co/proofbird
- Modelo hermano en inglés: https://huggingface.co/proofbird/gector-bert-en
- Web de Proofbird: https://proofbird.app
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY 2.0 FR: https://creativecommons.org/licenses/by/2.0/fr/
- Paper GECToR (Omelianchuk et al., 2020): no disponible en la información proporcionada
- Paper BETO (PML4DC at ICLR 2020): no disponible en la información proporcionada
