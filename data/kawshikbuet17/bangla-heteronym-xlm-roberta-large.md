# kawshikbuet17/bangla-heteronym-xlm-roberta-large

## Resumen

Bangla Heteronym Reader (XLM-R-large) es un modelo de desambiguación de heterónimos en bengalí desarrollado por Kawshik Kumar Paul (BUET) y publicado en Hugging Face. Resuelve un problema específico del procesamiento del bengalí: muchas palabras se escriben igual pero se pronuncian de forma distinta según el contexto oracional (heterónimos u homógrafos). El modelo lee la oración completa y selecciona la lectura correcta, devolviendo una reescritura fonética en escritura bengalí que sirve como entrada al front-end de un sistema de text-to-speech.

Técnicamente es un fine-tuning de `FacebookAI/xlm-roberta-large` (559,9 millones de parámetros) con una cabeza lineal personalizada. La entrada combina la palabra objetivo marcada dentro de su oración, y la cabeza puntúa las lecturas candidatas de esa palabra a partir de la representación del marcador de apertura. El modelo cubre exclusivamente los heterónimos del dataset `kawshikbuet17/bangla-heteronyms`.

Es relevante ahora porque aborda una capa lingüística que los TTS bengalíes suelen ignorar y porque el autor lo publica junto a un benchmark reproducible de 12 modelos, con métricas y latencias comparables. No obstante, el propio autor recomienda para la mayoría de usos su variante basada en BanglaBERT, que obtiene mejor precisión y menor latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza lineal de clasificación sobre lecturas candidatas |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de XLM-R-large; el modelo card no la especifica) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,3 GB |
| Pipeline declarado | text-to-speech |
| Modelo base | FacebookAI/xlm-roberta-large |
| Dataset de entrenamiento | kawshikbuet17/bangla-heteronyms |
| Métricas declaradas | accuracy, F1 |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un transformer encoder multilingüe, y añade una cabeza lineal pequeña. El procedimiento de inferencia es el siguiente: se construye una secuencia con la palabra objetivo seguida de la oración en la que aparece marcada con delimitadores (por ejemplo, `কর` + `আগে @ কর @ কাজটা, তারপর আবার কর।`). XLM-R-large codifica la secuencia y la capa lineal puntúa cada una de las lecturas candidatas de la palabra a partir de la representación del marcador de apertura. La lectura con mayor puntuación es la elegida.

El ajuste fino se realizó sobre 14 oraciones por lectura del dataset de heterónimos, con AdamW, learning rate 2e-5, batch size 32, precisión fp16, un máximo de 10 épocas y parada temprana sobre la accuracy de desarrollo, en una única GPU Tesla T4. Cada lectura se representa como una reescritura en escritura bengalí, con el hasanta visible codificado como hasanta más ZWNJ (`কর্‌`). No se documentan fases de RLHF ni DPO; se trata de un ajuste supervisado de clasificación.

## Capacidades

- Desambiguación de heterónimos bengalíes: selecciona la lectura correcta de una palabra polisémica a partir de su contexto oracional.
- Reescritura fonética de texto completo (`phoneticize`): sustituye cada heterónimo del texto por su lectura y deja el resto intacto.
- Salida detallada (`phoneticize_detailed`): devuelve el texto reescrito junto con posición, lectura y confianza de cada heterónimo.
- Predicción puntual (`predict`): lectura de un heterónimo concreto en una oración, sobre su primera aparición.
- Marcado explícito (`predict_marked`, `phoneticize_marked`): permite señalar con corchetes la ocurrencia exacta a desambiguar cuando la palabra aparece varias veces.
- Procesamiento por lotes: todas las operaciones tienen variantes `_batch` que agrupan entradas en una sola pasada.
- Integración como front-end de TTS y de sistemas grapheme-to-phoneme.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Front-end de un sistema de text-to-speech en bengalí: el modelo recibe la oración y devuelve la reescritura fonética que el sintetizador debe pronunciar, resolviendo casos como `কর` (impuesto) frente a `করো` (haz) antes de la síntesis.
- Normalización de texto para pipelines de G2P: `phoneticize` produce una cadena con las lecturas correctas que puede alimentar un conversor grafema-fonema sin modificar el resto del texto.
- Lectura asistida y accesibilidad: generación de audio con pronunciación correcta en aplicaciones de lectura de pantalla o audiolibros en bengalí, donde los homógrafos son una fuente frecuente de errores.
- Preprocesado en sistemas de diálogo por voz: desambiguación de la entrada antes de la síntesis de respuesta en asistentes conversacionales en bengalí.
- Anotación asistida de corpus: `phoneticize_detailed` proporciona confianza por predicción, lo que permite filtrar manualmente los casos de baja certeza antes de incorporarlos a un corpus anotado.
- Evaluación comparativa de modelos lingüísticos para bengalí: al formar parte de un benchmark de 12 modelos con métricas homogéneas, sirve como línea base en experimentos de desambiguación léxica.
- Procesamiento por lotes de documentos: las variantes `_batch` permiten reescribir grandes volúmenes de texto con un throughput de unas 670 oraciones por segundo en GPU a batch size 32.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 oraciones, 3 por lectura.

| Modelo / configuración | Accuracy | Macro-F1 |
|---|---|---|
| Este checkpoint (seed 43) | 98,37% | 98,31% |
| Media de 3 seeds | 98,43 ± 0,19% | 98,34 ± 0,14% |

Rendimiento y latencia (por oración, pipeline completo, batch size 1):

| Entorno | Latencia |
|---|---|
| Tesla T4, fp16 | 17,8 ms |
| CPU, 4 hilos | 126 ms |
| Tesla T4, batch size 32 | ~670 oraciones/s |

En el benchmark de 12 modelos, este checkpoint quedó tercero por accuracy media en test. El autor recomienda para la mayoría de usos `kawshikbuet17/bangla-heteronym-banglabert`, con 99,46% de accuracy y 12,5 ms en T4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 559,9 millones de parámetros en fp16 el peso de los pesos ronda 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: Tesla T4 es el entorno de referencia medido por el autor; cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se documentan pruebas específicas en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: el modelo requiere código propio del repositorio de GitHub (`src.predict.Predictor`) por su cabeza personalizada; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 17,8 ms por oración en T4 fp16 y 126 ms en CPU de 4 hilos; ~670 oraciones/s en T4 con batch size 32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | Latencia (T4) | Licencia |
|---|---|---|---|---|---|
| bangla-heteronym-xlm-roberta-large (este) | 559,9 M | no disponible | 98,37% | 17,8 ms | MIT |
| bangla-heteronym-banglabert | no disponible | no disponible | 99,46% | 12,5 ms | no disponible |
| Otros 10 modelos del benchmark del autor | no disponible | no disponible | no disponible individualmente | no disponible | no disponible |

El benchmark del autor agrupa 12 modelos; solo se detallan en la información disponible las cifras de este checkpoint y de la variante BanglaBERT. Para el resto de alternativas, los datos no están disponibles.

## Limitaciones y advertencias

- Cobertura restringida: solo desambigua los heterónimos presentes en el dataset `kawshikbuet17/bangla-heteronyms`; para cualquier otra palabra no hay lecturas candidatas y `predict` lanza un `ValueError`.
- Dominio de entrenamiento sintético: las oraciones se redactaron específicamente para el dataset, por lo que la accuracy en texto real puede ser inferior a la reportada en test.
- Confianza variable: en los ejemplos del modelo card se observan confidencias tan dispares como 0,9539 y 0,6094 para dos ocurrencias de la misma palabra en una oración, lo que exige umbrales de revisión en producción.
- Monolingüe: solo bengalí; no cubre otras lenguas ni code-switching.
- Sin datos publicados sobre sesgos, tasas de alucinación ni robustez ante ruido ortográfico.
- Licencia MIT, que permite uso comercial; el fichero LICENSE conserva el aviso de copyright original del modelo base.
- Requiere código externo para la carga: no es un `AutoModelForSequenceClassification` estándar, lo que complica su integración en stacks de serving convencionales.
- El propio autor desaconseja este checkpoint frente a la variante BanglaBERT para la mayoría de usos, por menor precisión y mayor latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kawshikbuet17/bangla-heteronym-xlm-roberta-large
- Variante recomendada (BanglaBERT): https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark y código de inferencia: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo base: https://huggingface.co/xlm-roberta-large
- Contacto del autor: kawshikbuet17@gmail.com
