# andyjzhao/GeneZip-70M-128K

## Resumen

GeneZip-70M-128K es un modelo de lenguaje de ADN (DNA language model) preentrenado con 70 millones de parámetros y una ventana de contexto de 128.000 pares de bases (bp). Lo publica el autor `andyjzhao` bajo el nombre definitivo del artículo (*camera ready*) del proyecto GeneZip, y corresponde a los pesos de preentrenamiento, no a un checkpoint ajustado para una tarea concreta. El problema que aborda es el modelado de secuencias genómicas largas: frente a modelos de contexto corto, permite procesar regiones de ADN de hasta 128 kb en una sola pasada, lo que resulta relevante para tareas de anotación, predicción de elementos reguladores y modelado de dependencias de largo alcance en el genoma.

El modelo emplea un objetivo de compresión con un objetivo base de 32 bp por token (no el ratio de compresión medido) y se distribuye con una configuración Hydra reducida que recoge arquitectura, enrutamiento y metadatos científicos. No es un paquete `AutoModel` de Transformers: requiere el código propio del proyecto GeneZip para cargar y ejecutar los pesos. La licencia es Apache 2.0, lo que facilita su uso en investigación y en desarrollos derivados.

Su relevancia actual radica en la combinación de contexto muy largo (128 kb) con un tamaño reducido (70 M de parámetros), lo que lo hace apto para experimentación en genómica computacional con recursos de hardware modestos. No obstante, la información pública disponible es escasa: no se han publicado resultados de benchmarks en la información proporcionada ni detalles sobre el dataset de entrenamiento más allá de la referencia al checkpoint fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GeneZip (modelo de lenguaje de ADN; arquitectura exacta en `hydra_cfg.yaml`, no detallada en la información disponible) |
| Parametros totales | 70 M (según el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 bp |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch (repo de 0.3 GB); no es un paquete Transformers `AutoModel` |

## Arquitectura y entrenamiento

La model card indica que los pesos provienen del checkpoint `jzshared/GeneZip-7R-LT-32BPT-128K-100B` (revisión `08b76c09d7bd5e76cf30ade326838cee7b32d677`, paso `checkpoint-24414`) y que los bytes de los pesos son idénticos a esa fuente fijada, con SHA-256 `cc4b86ccbc4305669ae4b1a003d475aac543a368efb886d8e6691839e5498061`. El repositorio incluye `hydra_cfg.yaml`, que registra la arquitectura exacta y los límites de enrutamiento, y `provenance.json`, que documenta la revisión inmutable de origen y el hash de los pesos. No se detalla en la información disponible el tipo de transformer, el número de capas, la dimensión oculta ni la composición del dataset de preentrenamiento.

El preentrenamiento se realizó con una ventana de 128.000 bp y un objetivo base de compresión de 32 bp por token, que la model card aclara explícitamente que no es el ratio de compresión medido. El nombre del checkpoint fuente (`100B`) sugiere un volumen de entrenamiento del orden de 100.000 millones de tokens, aunque este dato no se confirma de forma explícita en la información proporcionada. No se mencionan etapas de RLHF, DPO ni ajuste por preferencias; el repositorio contiene únicamente pesos preentrenados, sin pesos ajustados ni estado del optimizador.

## Capacidades

- Modelado de secuencias de ADN de hasta 128.000 pares de bases en una sola ventana de contexto.
- Representaciones internas (embeddings) de secuencias genómicas aptas para entrenamiento posterior en tareas downstream.
- Soporte para recetas de evaluación DNALongBench a través del código del proyecto GeneZip.
- Carga y ejecución mediante el código propio del proyecto (`ckpt=andyjzhao/GeneZip-70M-128K`), no mediante `AutoModel` de Transformers.
- No se documentan capacidades de generación de lenguaje natural, tool calling, agentes, visión ni audio.
- No se documentan capacidades multilingües en el sentido convencional; el dominio es la secuencia de ADN.

## Casos de uso

- Anotación de elementos genómicos: el modelo puede procesar ventanas de hasta 128 kb para predecir regiones funcionales (promotores, enhancers, sitios de unión) capturando dependencias de largo alcance que modelos de contexto corto no ven.
- Extracción de embeddings para modelos downstream: usar las representaciones internas como entrada a clasificadores o regresores entrenados para tareas específicas (expresión génica, splicing, epigenética).
- Ajuste fino supervisado en tareas de genómica: el código de liberación acepta el checkpoint como `ckpt` para entrenamiento downstream, lo que permite adaptarlo a conjuntos de datos etiquetados propios.
- Evaluación comparativa en DNALongBench: sirve como línea base de 70 M de parámetros para recetas de evaluación de contexto largo en genómica.
- Investigación en compresión de secuencias: el objetivo de 32 bp/token permite estudiar tokenización y compresión de ADN en contextos de 128 kb.
- Experimentación académica con recursos limitados: sus 70 M de parámetros y su licencia Apache 2.0 lo hacen adecuado para grupos con una sola GPU consumer que quieran reproducir experimentos de modelado genómico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comprobaciones cortas de carga y ejecución (*smoke checks*) no constituyen nuevas mediciones del rendimiento completo en benchmarks y remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 70 M de parámetros, en FP32 los pesos ocupan aproximadamente 0,28 GB; en FP16, unos 0,14 GB. A ello hay que sumar la memoria de activaciones, que crece con la longitud de contexto y puede ser el factor dominante en ventanas de 128 kb.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder cargar los pesos; el cuello de botella real es la memoria de activaciones a contexto completo.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, 4060, 4070 o superiores, aunque la ventana de 128 kb puede requerir reducir el lote o usar atención eficiente.
- Opciones de despliegue: el código propio del proyecto GeneZip (GitHub `AndyJZhao/GeneZip`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de modelos comparables de la misma categoría (modelos de lenguaje de ADN con contexto largo), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo ajustado para tareas downstream; su rendimiento en tareas concretas requiere ajuste fino o extracción de características.
- No es un paquete `AutoModel` de Transformers: requiere el código propio del proyecto GeneZip, cuya actualización *camera ready* se estaba preparando por separado en el momento de la publicación.
- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas; en el dominio genómico, el riesgo principal es la extrapolación indebida a especies o regiones del genoma poco representadas en el preentrenamiento.
- No se han publicado mediciones completas de benchmarks en la información disponible; las cifras de rendimiento deben obtenerse ejecutando las recetas del código.
- La ventana de 128 kb implica un coste de memoria de activaciones elevado; en producción conviene validar el consumo real antes de desplegar.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene conservar los avisos de licencia y la trazabilidad de procedencia (`provenance.json`, hash SHA-256).
- El repositorio no contiene pesos ajustados ni estado del optimizador, por lo que no sirve para reanudar el preentrenamiento tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyjzhao/GeneZip-70M-128K
- Checkpoint fuente: https://huggingface.co/jzshared/GeneZip-7R-LT-32BPT-128K-100B/tree/08b76c09d7bd5e76cf30ade326838cee7b32d677/checkpoint-24414
- Código del proyecto GeneZip: https://github.com/AndyJZhao/GeneZip
