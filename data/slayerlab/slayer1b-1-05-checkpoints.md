# SlayerLab/Slayer1B-1.05-checkpoints

## Resumen

Slayer1B-1.05-checkpoints es un repositorio de HuggingFace publicado por SlayerLab que no contiene un modelo listo para inferencia, sino los checkpoints completos del entrenador (pesos del modelo más estado del optimizador) de la ejecución que dio lugar al modelo Slayer1B 1.05. El repositorio recoge el tramo de preentrenamiento que va del paso 10010 al 12870, con un checkpoint cada 50 pasos y el estado final en `ckpt_12870.pt`, que es exactamente la release 1.05. Su valor es de trazabilidad y reproducibilidad: permite reanudar el entrenamiento, auditar la curva de aprendizaje o analizar la evolución del modelo paso a paso.

El entrenamiento se hizo sobre el corpus polaco `SlayerLab/slayer-pl-8x3b` (revisión `d50df04a`), continuando una única pasada sobre el corpus, con un total de 2 998 927 360 tokens procesados en 2860 pasos de 1 048 576 tokens cada uno (256 secuencias de 4096 tokens por paso). Se usó una tasa de aprendizaje constante de 6e-4 sin decaimiento y 8 GPU NVIDIA L40S de 48 GB en DDP. El repositorio ocupa 513,9 GB y en el momento de la publicación (28 de octubre de 2026) la subida estaba en curso, con 58 ficheros copiados desde `SlayerLab/Slayer1B-1.04-checkpoints`, donde ya estaban todos disponibles.

Es relevante ahora porque expone el histórico de entrenamiento de un modelo base en polaco bajo licencia Apache-2.0, algo poco habitual: la mayoría de releases publican solo los pesos finales. La información disponible no detalla la arquitectura interna, el número exacto de parámetros ni resultados de evaluación numéricos, por lo que esta ficha se limita a lo documentado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El entrenador se denomina `train_gpt_ref` r24.2 y la definición del modelo `train_gpt_ref_r23.py` (sin cambios), lo que apunta a una implementación de referencia de tipo GPT, sin confirmar en la información disponible |
| Parametros totales | No disponible. La denominación «1B» sugiere del orden de 1000 millones, sin cifra confirmada |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 4096 tokens por secuencia durante el entrenamiento (256 secuencias × 4096 = 1 048 576 tokens por paso). Contexto máximo de inferencia: no disponible |
| Tipos de cuantizacion | No disponible. Los ficheros se distribuyen en el formato del entrenador, sin cuantización publicada |
| Idiomas soportados | Polaco (etiqueta `polish` y corpus `slayer-pl-8x3b`). No se detallan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` de PyTorch: checkpoint completo del entrenador (pesos del modelo + estado del optimizador) |
| Tamano del repositorio | 513,9 GB, 58 ficheros (≈ 8,9 GB por fichero) |
| Estado del repositorio | Subida en curso a fecha 28 de octubre de 2026; bytes idénticos a `SlayerLab/Slayer1B-1.04-checkpoints`, verificados por lectura anónima |
| Version liberada | Estado en el paso 12870 (`ckpt_12870.pt`), release 1.05 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo (tipo de atención, normalización, tokenizador o uso de técnicas como decodificación especulativa). Lo que sí se documenta es el marco de entrenamiento: el trainer `train_gpt_ref` r24.2 (sha256 `46f83b51…`) con la definición de modelo de `train_gpt_ref_r23.py`, sin modificaciones respecto a la ejecución anterior. El entrenamiento continuó desde `ckpt_10010.pt` (sha256 `04438959…`) y se ejecutó en 8 GPU NVIDIA L40S de 48 GB con paralelismo de datos distribuido (DDP), manteniendo el mismo batch global que la ejecución de 1.04 sobre 4 L40S.

El tramo liberado cubre los pasos 10011 a 12870, es decir, 2860 pasos × 1 048 576 tokens = 2 998 927 360 tokens adicionales, con 256 secuencias de 4096 tokens por paso y una tasa de aprendizaje constante de 6e-4 sin decaimiento. Los datos provienen de la revisión `d50df04a` del dataset `SlayerLab/slayer-pl-8x3b`, continuando la pasada única sobre el corpus. Como medida de higiene de datos, a partir del pack-04 (paso 7193) se excluyeron los 5133 documentos con solapamiento de n-gramas respecto a ítems de test de BoolQ, MMLU y ARC (lista con sha256 `84caed78…`); todo el segmento aquí publicado está filtrado, mientras que los pasos hasta 7192 no lo estaban. No se documenta en esta model card ninguna fase de RLHF, DPO o ajuste por instrucciones: los checkpoints son estados intermedios de preentrenamiento con tasa constante, no modelos alineados.

## Capacidades

- Generación de texto en polaco: el corpus de entrenamiento es `slayer-pl-8x3b`, de modo que la capacidad esperada es la de un modelo base de lengua polaca, sin que la información disponible detalle tareas concretas.
- Reproducción y reanudación de entrenamiento: cada fichero incluye el estado del optimizador, por lo que permite retomar la ejecución exactamente en el paso correspondiente.
- Análisis de dinámica de entrenamiento: la cadencia de un checkpoint cada 50 pasos permite estudiar la evolución de la pérdida, del olvido catastrófico o de la emergencia de capacidades a lo largo de 2860 pasos.
- Evaluación intermedia: los estados intermedios se pueden evaluar en benchmarks para trazar curvas de rendimiento frente a tokens vistos.
- Fine-tuning posterior: el estado del paso 12870 corresponde a la release 1.05, susceptible de ajuste supervisado para tareas concretas.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles; no se documenta ninguna de estas capacidades para este modelo.
- Capacidades multilingües: no documentadas; la única lengua declarada es el polaco.

## Casos de uso

- Reanudación exacta de un entrenamiento interrumpido: cargando `ckpt_12870.pt` junto con la definición `train_gpt_ref_r23.py` se recuperan pesos y momentos del optimizador, de modo que un nuevo tramo arranca sin el sesgo que introduciría reinicializar Adam.
- Estudio de la influencia del learning rate constante: al ser todos los estados de tasa constante (6e-4, sin decaimiento), la serie 10050–12870 permite medir qué se gana y qué se pierde frente a un schedule con decaimiento, comparando con la release 1.04.
- Auditoría de contaminación de benchmarks: la lista de 5133 documentos excluidos por solapamiento con BoolQ, MMLU y ARC (sha256 `84caed78…`) se puede replicar sobre el corpus para verificar que el filtrado se aplicó correctamente desde el paso 7193.
- Interpolación y merging de checkpoints: con 58 estados separados 50 pasos es posible aplicar interpolación lineal de pesos (model soup) o TIES para explorar si la combinación de estados intermedios mejora métricas concretas.
- Destilación desde un estado intermedio: un checkpoint a mitad del tramo puede servir como profesor en destilación hacia un modelo menor, con la ventaja de estar menos saturado que el estado final en ciertas distribuciones.
- Investigación sobre currículo de datos: dado que se conoce la revisión exacta del dataset y el orden de la pasada única, se puede correlacionar el contenido de cada pack con cambios observados en la pérdida entre checkpoints consecutivos.
- Base para ajuste fino en polaco: partiendo de los pesos del paso 12870 se puede entrenar un modelo de clasificación o de generación especializada para dominios como administración pública o atención al cliente en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza una curva de entrenamiento y evaluaciones en `https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5`, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones en polaco en el contenido proporcionado. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- Entrenamiento documentado: 8 × NVIDIA L40S de 48 GB en DDP, con un batch global de 1 048 576 tokens por paso (256 secuencias × 4096).
- Almacenamiento: 513,9 GB para el conjunto completo del repositorio; cada checkpoint individual ronda los 8,9 GB (513,9 GB / 58 ficheros).
- Inferencia (estimación orientativa, no publicada por el autor): si el modelo es del orden de 1000 millones de parámetros, los pesos en FP16 ocuparían aproximadamente 2 GB, en INT8 alrededor de 1 GB y en 4 bits en torno a 0,6 GB, a lo que habría que sumar la caché KV para 4096 tokens de contexto. Cifras derivadas del nombre del modelo, no confirmadas.
- GPU de consumo: con esas estimaciones, el modelo cabría con holgura en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y sin problemas en una RTX 4090 de 24 GB, siempre que se convierta a un formato de inferencia.
- Despliegue: los ficheros de este repositorio son checkpoints de trainer en `.pt` (pesos + optimizador) y no se pueden cargar directamente en vLLM, llama.cpp, Ollama o TGI. Para servir el modelo hay que usar la release `SlayerLab/Slayer1B-1.05`, que es la que presumiblemente contiene pesos en formato estándar, o bien convertir los pesos con la definición `train_gpt_ref_r23.py`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría (modelos base de ~1000 millones de parámetros orientados a polaco), por lo que cualquier comparación numérica sería inventada. Los únicos elementos comparables documentados son internos al propio proyecto:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Slayer1B-1.05-checkpoints | No disponible | 4096 en entrenamiento | Apache-2.0 | `.pt` (pesos + optimizador) | 58 checkpoints, 513,9 GB, paso 10010 a 12870 |
| Slayer1B-1.05 | No disponible | No disponible | Apache-2.0 | No disponible en la información | Release final, estado del paso 12870 |
| Slayer1B-1.04-checkpoints | No disponible | No disponible | Apache-2.0 | `.pt` | Origen de los bytes; entrenado con 4 × L40S |

## Limitaciones y advertencias

- No es un modelo utilizable directamente: los ficheros son estados de entrenador en `.pt` e incluyen el optimizador; requieren el código `train_gpt_ref_r23.py` para reconstruir el modelo y convertir los pesos.
- Riesgo de seguridad al cargar: los `.pt` de PyTorch usan pickle y pueden ejecutar código arbitrario; conviene cargarlos con `weights_only=True` o en un entorno aislado.
- Los 58 ficheros no son el estado final óptimo: son estados de tasa de aprendizaje constante sin decaimiento, por lo que su calidad como modelo de uso general es presumiblemente inferior a la de un modelo con schedule de decaimiento, extremo no verificado con métricas.
- Cobertura de la exclusión anti-leak: el filtrado de 5133 documentos solo se aplica desde el paso 7193; los pasos anteriores de la ejecución (hasta 7192) no fueron filtrados, lo que puede afectar a comparaciones con benchmarks como BoolQ, MMLU o ARC si se evalúan checkpoints de ese tramo.
- Idiomas: solo se declara polaco; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será muy limitado al no haberse entrenado sobre ellas.
- Licencia: el código y los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero la licencia y procedencia del corpus `slayer-pl-8x3b` no se detallan en la información disponible; conviene verificar los términos del dataset antes de un uso comercial.
- Estado de la subida: a fecha de la model card la carga estaba en curso (58 ficheros), con bytes idénticos verificados contra el repositorio 1.04; si se necesita el conjunto completo de forma fiable, es más seguro descargar desde `SlayerLab/Slayer1B-1.04-checkpoints`.
- Sesgos y alucinación: no hay documentación sobre sesgos, filtrado de contenido ni tasas de alucinación; al tratarse de un modelo base sin alineación, no se recomienda su uso directo en producción orientada a usuarios.
- Sin datos de evaluación: no se publican métricas que permitan estimar la calidad real del modelo en tareas concretas.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.05-checkpoints
- Modelo final Slayer1B 1.05: https://huggingface.co/SlayerLab/Slayer1B-1.05
- Checkpoints de la versión 1.04: https://huggingface.co/SlayerLab/Slayer1B-1.04-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/f056bb5c-f1da-56d5-9776-cc33063f10a5
