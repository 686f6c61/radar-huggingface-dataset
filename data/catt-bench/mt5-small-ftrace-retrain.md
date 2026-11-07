# catt-bench/mt5-small-ftrace-retrain

## Resumen

`catt-bench/mt5-small-ftrace-retrain` es un archivo de modelos de investigación publicado por la organización catt-bench (CATT) en Hugging Face. No se trata de un modelo pensado para uso general, sino de una colección de réplicas de entrenamiento del modelo `google/mt5-small` generadas para el estudio de atribución de datos en modelos de lenguaje recogido en el paper "Elucidating the Design Space of LM Data Attribution" (arXiv:2610.40655). Cada ejecución vive en su propio subdirectorio e incluye el modelo final (paso 60.000), su configuración de entrenamiento, un manifiesto con la curva de entrenamiento y el log de entrenamiento.

El propósito del repositorio es servir de banco de pruebas reproducible para métodos de atribución de influencia (influence functions, TRAK, EK-FAC, BM25, grad-dot, etc.) mediante el paradigma de eliminar y reentrenar: se retira un conjunto de filas del corpus (las que un método de atribución puntúa más alto para 50 hechos de evaluación) y se reentrena el modelo desde `google/mt5-small` para medir el efecto causal de esas filas. El directorio `sd1001/` contiene el modelo base afinado sobre el corpus completo, sobre el que se calculan todas las puntuaciones de atribución.

Arquitectónicamente es el mT5-small estándar: un transformer encoder-decoder de tipo T5 con vocabulario multilingüe, en su variante pequeña. La relevancia de este repositorio no reside en el modelo en sí, sino en que ofrece un conjunto controlado de reentrenamientos con distintas semillas y presupuestos de eliminación que permite validar empíricamente técnicas de atribución de datos, un área de creciente interés para auditar datasets y depurar corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, variante mT5) |
| Parametros totales | no disponible en la informacion proporcionada (corresponde a mT5-small de Google) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del vocabulario multilingue de mT5) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/mt5-small`, un transformer encoder-decoder de la familia T5 con vocabulario multilingüe. Sobre esa base, cada subdirectorio del repositorio contiene un ajuste fino independiente entrenado hasta el paso 60.000, con checkpoints intermedios en los pasos 5.000, 10.000 y 30.000 para la ejecución base `sd1001`. El repositorio incluye además `training_config.json`, `manifest.json` (con checkpoints y curva de entrenamiento) y `train_log.jsonl` por cada ejecución, lo que permite reproducir y auditar el proceso.

La innovación metodológica no está en la arquitectura sino en el diseño experimental. Las réplicas `cf50_{budget}_{method}_sd{seed}/` se reentrenan desde `google/mt5-small` eliminando las filas de `excluded_rows.npy`: la unión, sobre 50 hechos de evaluación, de las filas que un método de atribución concreto (EK-FAC con cross-entropy o margin, TRAK con distintas features, grad-dot, BM25 o ground-truth) puntúa más alto. El presupuesto de eliminación se codifica como `b2000`, `b5000` o `b11522`, y la ausencia de etiqueta indica el top-500 por hecho. Los controles `cf50_full_sd*` se reentrenan sin eliminación para aislar el efecto del reentrenamiento. El sufijo `emb` marca conjuntos de eliminación cuyos rankings TRAK usan features `trak_emb`. No se documentan en la información disponible detalles sobre volumen de tokens, composición del corpus ni uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada (seq2seq) propia de un modelo T5, incluyendo tareas de resumen, traducción y respuesta a preguntas en el formato texto-a-texto.
- Capacidad multilingüe heredada del vocabulario de mT5, aunque no se detallan los idiomas cubiertos.
- Servir como artefacto de referencia para calcular y validar puntuaciones de atribución de datos (influence functions, TRAK, EK-FAC, grad-dot, BM25).
- Permitir experimentos de eliminación y reentrenamiento para medir el efecto causal de filas concretas del corpus.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio.
- No se documentan capacidades especiales adicionales más allá del uso como banco de pruebas de atribución.

## Casos de uso

- Investigación en atribución de datos: usar `sd1001/` como modelo de referencia y las réplicas `cf50_*` para comparar la fidelidad de distintos métodos de atribución midiendo el cambio en el comportamiento tras eliminar las filas señaladas.
- Validación de métodos de influence functions: contrastar las predicciones de EK-FAC, TRAK o grad-dot contra el efecto real observado en los reentrenamientos, gracias a que el repositorio incluye múltiples presupuestos (`b2000`, `b5000`, `b11522`) y semillas.
- Auditoría y depuración de corpus: identificar filas de entrenamiento con influencia desproporcionada sobre hechos de evaluación concretos, útil para detectar datos ruidosos o problemáticos.
- Reproducibilidad de experimentos académicos: al incluir `training_config.json`, `manifest.json` y `train_log.jsonl` por ejecución, permite replicar curvas de entrenamiento y comparar configuraciones.
- Estudio de estabilidad frente a semillas: las réplicas con distintas semillas (`sd2001`, etc.) y los controles sin eliminación permiten cuantificar la varianza del reentrenamiento y separar el efecto de la eliminación del ruido de entrenamiento.
- Docencia y formación en atribución de datos: el tamaño pequeño de mT5-small y la estructura clara de subdirectorios lo hacen adecuado para prácticas y tutoriales sobre métodos de atribución.
- Benchmarking de pipelines de reentrenamiento: servir de caso de prueba para infraestructura que gestione checkpoints, logs y conjuntos de exclusión a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un mT5-small, la inferencia en precisión completa es ligera, pero no se confirman cifras.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, cabría esperar ejecución en GPUs de consumo, pero no se documenta.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForSeq2SeqLM` y `AutoTokenizer`, indicando el subdirectorio de la ejecución (por ejemplo `cf50_trak_w_sd2001/final_model`).
- Latencia y throughput estimados: no disponible.
- Advertencia de almacenamiento: el repositorio ocupa 577,7 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo el subdirectorio de interés.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| catt-bench/mt5-small-ftrace-retrain | no disponible (base mT5-small) | no disponible | Banco de pruebas de atribución de datos | apache-2.0 | Hugging Face |
| google/mt5-small | no disponible en la informacion | no disponible | Modelo seq2seq multilingue de uso general | apache-2.0 | Hugging Face |
| Alternativas de atribución de datos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros repositorios comparables de atribución de datos en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso en producción: su finalidad es exclusivamente experimental y de investigación en atribución de datos.
- Sesgos conocidos: no documentados en la información disponible; al heredar el corpus y el vocabulario de mT5, podría arrastrar sesgos del modelo base, pero no se detalla.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia apache-2.0: permite uso comercial del artefacto, pero su naturaleza de banco de pruebas hace desaconsejable su despliegue como modelo de propósito general.
- Tamaño del repositorio: 577,7 GB exigen planificar el almacenamiento y descargar únicamente los subdirectorios necesarios.
- Los resultados de atribución dependen del método, del presupuesto de eliminación y de la semilla; deben interpretarse en el contexto del paper y no como conclusiones generales.
- No se documentan garantías de calidad ni evaluaciones independientes del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/catt-bench/mt5-small-ftrace-retrain
- Perfil de la organización catt-bench: https://huggingface.co/catt-bench
- Datasets de catt-bench: https://huggingface.co/catt-bench/datasets
- Paper: https://arxiv.org/abs/2610.40655
- Modelo base: https://huggingface.co/google/mt5-small
