# saidutta69/vantablack

## Resumen

VantaBlack es un clasificador de texto de cinco clases diseñado para etiquetar respuestas de modelos de lenguaje segun su comportamiento de rechazo (refusal). Lo desarrolla el usuario de Hugging Face `saidutta69` y se construye mediante fine-tuning sobre `answerdotai/ModernBERT-large`, un transformer encoder de 395 millones de parametros. Su proposito es sustituir las heuristicas de palabras clave ("cannot", "I'm sorry") por una clasificacion semantica que distingue entre respuesta conforme, rechazo total, rechazo parcial, limite de capacidad y peticion de aclaracion.

El modelo resuelve un problema concreto en evaluacion de seguridad y alineamiento: medir con precision la tasa de rechazo de un LLM antes y despues de tecnicas de abliteration o ajuste de alineamiento. Al separar el rechazo parcial del total, permite cuantificar degradaciones graduales que un clasificador binario colapsaria. Es relevante porque ofrece una alternativa barata (400M de parametros, ejecutable en CPU) al uso de un modelo juez generativo para etiquetar cada fila de un dataset.

La arquitectura es ModernBERT, un transformer encoder con atencion de contexto largo y RoPE, adaptado aqui como cabecera de clasificacion de secuencia. El modelo solo soporta ingles, se distribuye bajo licencia Apache 2.0 y su checkpoint incorpora la calibracion de temperatura fusionada en los pesos de la cabeza clasificadora, de modo que un `argmax` directo reproduce las predicciones calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) con cabecera de clasificacion de secuencia |
| Parametros totales | 395.836.421 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento y evaluacion con `max_length=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large` y anade una cabeza de clasificacion de cinco clases: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`. ModernBERT es un transformer encoder con mejoras sobre BERT clasico (RoPE, atencion alterna local/global, Flash Attention), aunque la model card no detalla la configuracion exacta de capas ni la longitud de contexto nativa. El entrenamiento se realiza sobre el dataset `saidutta69/refusal-classification-dataset`, con secuencias truncadas o limitadas a `max_length=512` tanto en entrenamiento como en evaluacion. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

La innovacion tecnica destacable es la fusion de la calibracion en los pesos. Se ajusto una temperatura de 0.75 y un sesgo de clase `compliant` de 1.0 sobre el split de validacion, y luego se aplico la transformacion `W' = W / T`, `c' = c / T + b` directamente a la cabeza clasificadora. El archivo `fuse.json` documenta la transformacion exacta. Esto significa que no hace falta post-procesar logits: el `argmax` del checkpoint reproduce las predicciones calibradas (445 de 445 filas identicas en test). El pipeline no es bit-reproducible (shuffling sin semilla, kernels no deterministas), por lo que el autor reporta tres ejecuciones independientes de la misma receta en lugar de tres semillas.

## Capacidades

- Clasificacion de respuestas de LLM en cinco categorias de rechazo: conforme, rechazo total, rechazo parcial, limite de capacidad y peticion de aclaracion.
- Deteccion de rechazo parcial separado del rechazo total, lo que permite medir degradaciones graduales en alineamiento.
- Clasificacion de comportamiento, no de contenido: etiqueta lo que la respuesta hizo, no si es danina.
- Probabilidades calibradas utilizables como umbral de absteccion sin recalibracion (ECE 0.0168, Brier 0.0173).
- Ejecucion en CPU y en GPU por lotes, apta para etiquetado masivo de datasets.
- Soporte de `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio.
- Solo ingles; no se reportan capacidades multilingues.
- No es un filtro de contenido ni una barrera de seguridad; no juzga la harmfulidad de la respuesta.

## Casos de uso

- Medicion de tasas de rechazo en evaluacion de alineamiento: dado un conjunto de pares prompt/respuesta, el modelo clasifica cada respuesta y permite calcular la proporcion de rechazos totales, parciales y limites de capacidad. Es adecuado porque distingue rechazo parcial de total, algo que una heuristica de palabras clave no captura.
- Evaluacion antes/despues de abliteration: el modelo se diseno explicitamente como scorer para medir la variacion de la tasa de rechazo en los mismos prompts tras aplicar tecnicas de abliteration. Su calibracion permite fijar umbrales de decision estables entre ejecuciones.
- Red-teaming y evaluacion de seguridad: etiquetar respuestas de un modelo objetivo por comportamiento real (cumplio, rechazo, pidio aclaracion) en lugar de buscar la palabra "cannot". Util para informes de red-team que necesitan categorias finas.
- Etiquetado de datasets a escala: ejecutar un clasificador de 400M de parametros en CPU o GPU por lotes en lugar de pagar un modelo juez generativo por cada fila. El coste por fila es orders de magnitud menor y la latencia es de milisegundos.
- Auditoria de pipelines de moderacion: verificar si un sistema de moderacion esta produciendo rechazos parciales no deseados o peticiones de aclaracion excesivas, clasificando las respuestas generadas antes de servirlas.
- Investigacion en calibracion: el checkpoint sirve como ejemplo de calibracion fusionada en pesos, util para estudiar como afecta la temperatura y el sesgo de clase a las decisiones de absteccion en clasificadores de seguridad.
- Control de calidad en generacion aumentada por recuperacion (RAG): detectar cuando el modelo responde con un limite de capacidad o pide aclaracion en lugar de alucinar, para disparar reintentos o escalados a humano.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un test set de 445 pares prompt/respuesta del dataset `saidutta69/refusal-classification-dataset`, con `max_length=512` y el mismo procedimiento para los tres clasificadores comparados. Cada modelo se puntua en su mejor comportamiento calibrado, ajustado solo sobre el split de validacion de 445 filas.

| Metrica | VantaBlack | v2 | v1 |
|---|---|---|---|
| Macro F1 | 0.9911 | no disponible (8 errores) | no disponible (20 errores) |
| Errores en 445 filas | 4 | 8 | 20 |
| ECE | 0.0168 | 0.0287 | no disponible |
| Brier | 0.0173 | no disponible | no disponible |

Desglose por clase (segun la model card): `capability_limitation` y `clarification` son recall-completos con precision superior a 0.98. Los cuatro errores son filas individuales: un `compliant` leido como `capability_limitation`, un `compliant` leido como `clarification`, un `partial_refusal` leido como `compliant` y un `full_refusal` leido como parcial.

El autor advierte que la ventaja sobre v2 no es estadisticamente significativa a n=445: un bootstrap pareado de 2000 remuestras situa la diferencia de macro F1 en +0.0090 con intervalo del 95% de [-0.0023, +0.0222], que incluye cero. Las tres ejecuciones independientes de la receta obtienen macro F1 de 0.9911 (4 errores), 0.9889 (5 errores) y 0.9866 (6 errores), con media 0.9888 y desviacion estandar 0.0023. El checkpoint publicado se selecciono por macro F1 de validacion, nunca por test. Las etiquetas de test fueron auditadas manualmente y se corrigieron siete etiquetas tras tres pasadas y revision humana de las once filas donde el modelo discrepaba de la etiqueta original; ambos baselines se re-ejecutaron sobre las etiquetas corregidas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1.6 GB para los 395,8M de parametros (4 bytes por parametro), mas overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0.8 GB de pesos, mas overhead.
- Cabe en GPU consumer: si, en cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.). Tambien se ejecuta en CPU, segun la model card.
- GPU recomendadas para throughput alto: A100, H100 o L40S para procesamiento por lotes a gran escala; RTX 4090 para lotes medianos.
- Opciones de despliegue: `transformers` (referencia), `text-embeddings-inference` (segun tags), endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 395M de parametros con secuencias de hasta 512 tokens, se espera latencia de milisegundos por fila en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro F1 (test 445) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VantaBlack | 395,8M | no disponible (512 en entrenamiento/eval) | Clasificacion de rechazo 5 clases | 0.9911 | apache-2.0 | Hugging Face |
| v2 (baseline del autor) | no disponible | no disponible | Clasificacion de rechazo | no disponible (8 errores) | no disponible | no disponible |
| v1 (baseline del autor) | no disponible | no disponible | Clasificacion de rechazo | no disponible (20 errores) | no disponible | no disponible |

Los baselines v1 y v2 son versiones anteriores del mismo autor segun la model card, pero no se proporcionan sus identificadores de repositorio, parametros ni licencias. No se dispone de comparacion con clasificadores de rechazo de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No es un filtro de contenido ni una barrera de seguridad: clasifica respuestas existentes y no juzga si son daninas. No debe usarse como gate de seguridad en produccion.
- La ventaja sobre el baseline v2 no es estadisticamente significativa a n=445 (intervalo bootstrap del 95% incluye cero); el propio autor lo advierte.
- El pipeline de entrenamiento no es bit-reproducible (shuffling sin semilla, kernels no deterministas), por lo que los resultados pueden variar entre ejecuciones (sd de 0.0023 en macro F1 entre tres ejecuciones).
- Riesgo de alucinacion: como clasificador, el riesgo se traduce en falsos rechazos o falsos cumplimientos; la model card reporta cero falsos rechazos en el test, pero no hay garantia fuera de la distribucion del dataset.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; el dataset de entrenamiento no se describe en detalle (composicion, procedencia de prompts y respuestas).
- Limitacion de contexto: el entrenamiento y la evaluacion usan `max_length=512`; respuestas mas largas se truncan, lo que puede perder informacion relevante para la clasificacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base ModernBERT-large tiene su propia licencia que debe verificarse por separado.
- El checkpoint publicado se selecciono por macro F1 de validacion; el rendimiento en dominios distintos al dataset de entrenamiento no esta medido.
- Uso comercial: permitido por Apache 2.0, pero sin garantias de idoneidad para produccion; no hay informes de latencia, throughput ni comportamiento en dominios fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/vantablack
- Dataset de clasificacion de rechazo: https://huggingface.co/datasets/saidutta69/refusal-classification-dataset
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
