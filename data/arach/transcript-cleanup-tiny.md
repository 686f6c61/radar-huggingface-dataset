# arach/transcript-cleanup-tiny

## Resumen

Transcript cleanup tiny es un modelo de clasificación de tokens (token classification) en inglés, desarrollado por el usuario arach, que propone eliminaciones de palabras sobre transcripciones ya generadas. No es un modelo generativo ni un sistema ASR: actúa como un paso opcional de limpieza posterior, etiquetando cada token como KEEP o DELETE para que un runtime externo (el `Tagger` de la receta `arach/parakeet-coreml-recipe`) valide las propuestas y renderice las ediciones sobre el texto original.

El modelo parte de Google BERT-Tiny (`google/bert_uncased_L-2_H-128_A-2`) y se afina por completo, encoder y nueva cabeza de clasificación, con 4.369.666 parámetros. La arquitectura es un encoder transformer de dos capas, 128 dimensiones ocultas y dos cabezas de atención, con un límite de contexto de 512 tokens del tokenizer, incluyendo tokens especiales. Su relevancia es acotada y experimental: demuestra que un tagger minúsculo puede sustituir a un adaptador de un LLM de 0,6B en esta tarea concreto, a costa de una cobertura menor de ediciones.

El autor lo etiqueta explícitamente como experimental. Todos los datos de entrenamiento y evaluación son texto sintético generado por asistentes, sin capturas ASR reales ni etiquetas humanas, y la model card advierte que los resultados no establecen fiabilidad en dictado real. La licencia es Apache 2.0 y el repositorio solo contiene pesos, tokenizer y manifiesto de entrenamiento; el código de ejecución vive en otro repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer BERT-Tiny: 2 capas, 128 dimensiones ocultas, 2 cabezas de atencion |
| Parametros totales | 4.369.666 (aproximadamente 4,37 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens del tokenizer, incluidos tokens especiales |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 17.483.080 bytes, aproximadamente 17,48 MB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de BERT-Tiny sobre la revisión `30b0a37ccaaa32f332884b96992754e246e48c5f` del modelo base de Google. Se reemplaza la cabeza original por una cabeza de clasificación de tokens con dos etiquetas, KEEP y DELETE, y se entrena el encoder junto con la nueva cabeza. El umbral de decisión para proponer una eliminación es una probabilidad superior a 0,99, seleccionado durante la validación.

Los datos son exclusivamente sintéticos y escritos por asistentes: 160 pares de desarrollo provenientes de 80 familias, de los cuales 80 pares no requieren cambios. El split se hace a nivel de familia, con 128 pares para entrenamiento y 32 para validación. El entrenamiento usa 12 épocas fijas, semilla 23, tamaño de lote 8, tasa de aprendizaje 0,0003 y un peso de pérdida para DELETE de 4. La validación selecciona el umbral minimizando primero los casos que pierden palabras requeridas, después los casos sin cambios alterados y por último los desajustes con la referencia, con preferencia por el umbral más alto en caso de empate. Los pesos, el umbral y el renderizador se congelaron antes de evaluar sobre un paquete separado de 48 casos.

La innovación técnica no está en la arquitectura, sino en el diseño del pipeline: la política de edición solo elimina `um` o `uh` sueltos y sin comillas, o una copia de una palabra repetida adyacente separada por espacio horizontal, y el renderizador conserva al menos una copia y repara separadores y mayúsculas. Hay guardas para texto entre comillas, código, URLs, dígitos, negaciones, identificadores con guion bajo y camelCase. Las entradas que superan el contexto o tienen un alineamiento de origen inseguro devuelven el texto original con un motivo de fallback, sin truncar. Existe una discrepancia conocida de capitalización de prefijo: eliminar el primer `go` en `go go home.` puede renderizar `Go home.`, mientras que la derivación de etiquetas de entrenamiento solo permite ese cambio tras un relleno de prefijo.

## Capacidades

- Clasificación de tokens KEEP/DELETE sobre transcripciones en inglés para proponer eliminaciones léxicas.
- Detección de muletillas `um` y `uh` sueltas y sin comillas.
- Detección de una copia de una palabra repetida adyacente separada por espacio horizontal.
- Integración con un runtime con guardas que valida las propuestas antes de renderizar la edición.
- Preservación de gramática, hedges, énfasis, autocorrecciones explícitas y habla incompleta por política de edición.
- Protección de texto entre comillas, código, URLs, dígitos, negaciones, identificadores con guion bajo y camelCase mediante guardas del runtime.
- Capacidad de capitalizar la primera letra superviviente tras una eliminación.
- Fallback seguro: devuelve el texto original con motivo cuando la entrada excede el contexto o el alineamiento es inseguro.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Limpieza opcional de dictado ya transcrito: se ejecuta como pasada posterior sobre una utterance completada, conservando la transcripción original, y elimina muletillas `um`/`uh` y repeticiones adyacentes. Adecuado por su tamaño mínimo y su latencia de milisegundos.
- Preprocesado de subtítulos generados por ASR: el tagger propone eliminaciones y el renderizador repara separadores, lo que permite reducir ruido en archivos de subtítulos antes de su publicación, siempre con revisión humana.
- Filtro de bajo coste en pipelines de transcripción masiva: con 4,37 millones de parámetros y pesos de 17,48 MB, puede mantenerse residente en memoria y aplicarse a cada utterance con un coste computacional despreciable frente a un LLM.
- Componente de un sistema de edición con guardas: se integra en el `Tagger` de la receta, que aplica alineamiento de origen, umbral congelado, guardas de elegibilidad y renderizado sobre el texto original, evitando ediciones peligrosas en código, URLs o cifras.
- Investigación sobre limpieza de transcripciones con modelos minúsculos: sirve como línea base reproducible frente a adaptadores de LLM grandes, con manifiesto de entrenamiento y umbral documentados.
- Evaluación de políticas de edición conservadoras: útil para estudiar el compromiso entre cobertura de limpieza y preservación de casos que no deben cambiar, dado que en el holdout preserva 24 de 24 casos sin cambios.
- No adecuado para aplicaciones de producción con dictado real sin validación adicional, según advierte el propio autor.

## Benchmarks y rendimiento

Resultados del paquete de evaluación separado de 48 casos, con pesos, umbral y renderizador congelados antes de la evaluación:

| Sistema | Coincidencias con referencia | Limpiezas correctas | Casos sin cambios preservados | Casos que pierden palabras requeridas | p50 / p95 en caliente |
|---|---:|---:|---:|---:|---|
| Devolver la entrada | 24/48 | 0/24 | 24/24 | 0 | Aproximadamente 0 ms |
| Reglas con el mismo renderizador | 45/48 | 22/24 | 23/24 | 1 | 0,08 / 0,91 ms |
| Este tagger con guardas | 39/48 | 15/24 | 24/24 | 0 | 2,87 / 35,62 ms |
| Adaptador Qwen3-0.6B anterior, prompt restringido | 40/48 | 22/24 | 18/24 | 6 | 383,33 / 725,10 ms |

El piloto congelado coincide con 39 de 48 referencias sintéticas retenidas: preserva los 24 casos que deben quedar sin cambios y limpia correctamente 15 de los 24 que necesitan edición. Los nueve fallos quedan sin cambios. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 17,48 MB de pesos, más el overhead del runtime de PyTorch y transformers; no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas de gama baja y también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria para el runtime; el cuello de botella es el framework, no los pesos.
- Opciones de despliegue: el autor documenta el uso mediante el `Tagger` de la receta `arach/parakeet-coreml-recipe` con `torch==2.15.0`, `transformers==5.22.2`, `huggingface-hub==2.4.0` y `safetensors==0.8.0`. Una pipeline genérica de token-classification de Transformers omite las guardas y el renderizador, por lo que no reproduce los resultados reportados. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: p50 de 2,87 ms y p95 de 35,62 ms en caliente con el pipeline completo de guardas, según la tabla del autor. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado en el holdout de 48 casos |
|---|---:|---|---|---|---|
| transcript-cleanup-tiny (este) | 4,37 M | 512 tokens | Tagger KEEP/DELETE con guardas | Apache 2.0 | 39/48 coincidencias, 0 casos con pérdida de palabras requeridas, p50 2,87 ms |
| Adaptador Qwen3-0.6B (anterior, mismo autor) | aproximadamente 0,6 B | no disponible | Adaptador de LLM con prompt restringido | no disponible | 40/48 coincidencias, 6 casos con pérdida de palabras requeridas, p50 383,33 ms |
| Reglas con el mismo renderizador | 0 | no aplica | Reglas deterministas | no aplica | 45/48 coincidencias, 1 caso con pérdida de palabras requeridas, p50 0,08 ms |

No se dispone de comparación con otros taggers de limpieza de transcripciones publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte que los resultados no establecen fiabilidad en dictado real.
- Entrenamiento y evaluación exclusivamente con texto sintético generado por asistentes; sin etiquetas humanas ni capturas ASR reales.
- Puede realizar eliminaciones elegibles incorrectas en entradas no vistas.
- Cobertura de limpieza limitada: en el holdout limpia 15 de 24 casos que necesitan edición, frente a 22 de 24 de las reglas y del adaptador Qwen3-0.6B.
- Solo inglés; no soporta otros idiomas.
- Límite de contexto de 512 tokens del tokenizer, incluidos tokens especiales; las entradas que lo superan devuelven el texto original con fallback, sin truncar.
- Las guardas no reconocen todos los nombres ni literales; pueden quedar sin proteger.
- Discrepancia conocida de capitalización de prefijo en `go go home.` que requiere alinear la política y la derivación de etiquetas antes de un siguiente experimento.
- La lista de ediciones registra eliminaciones léxicas; las reparaciones de separadores y capitalización son implícitas, por lo que no es un formato de parche completo para una aplicación.
- Los resultados reportados requieren el pipeline `Tagger` completo; una pipeline genérica de Transformers no los reproduce.
- No incluye aplicación ASR ni integración de streaming; el streaming especulativo no está implementado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad para producción.
- Riesgo de sesgos: no documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arach/transcript-cleanup-tiny
- Modelo base Google BERT-Tiny: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2/tree/30b0a37ccaaa32f332884b96992754e246e48c5f
- Receta con el runtime de limpieza: https://huggingface.co/arach/parakeet-coreml-recipe/tree/main/cleanup
- Instrucciones de la receta (CLI y campos de resultado): https://huggingface.co/arach/parakeet-coreml-recipe/blob/main/cleanup/README.md
- AI Clean Transcript (referencia externa de limpieza de transcripciones): https://transcript.im/clean-transcript
- VoiceDash Free AI Transcript Cleaner (referencia externa): https://voicedash.ai/tools/ai-transcript-cleaner/
