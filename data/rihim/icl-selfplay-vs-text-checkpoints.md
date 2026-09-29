# rihim/icl-selfplay-vs-text-checkpoints

## Resumen

El repositorio `rihim/icl-selfplay-vs-text-checkpoints` contiene una familia de modelos de lenguaje byte-level entrenados desde cero sobre texto web (DCLM-Baseline 1.0), con el objetivo de servir como línea base controlada frente a los aprendices de self-play del artículo "Self-Play Pretraining with Zero Data" (arXiv:2609.30063). La pregunta que motivan es concreta: a igual arquitectura, igual tamaño e igual número de tokens de aprendizaje, ¿produce el preentrenamiento con texto ordinario el mismo in-context learning que el self-play? La respuesta que documenta el autor es que no: cada método desarrolla un tipo distinto de ICL.

Se trata de modelos de investigación muy pequeños, con un rango de 65.728 a 24.253.184 parámetros sin contar embeddings, distribuidos en seis tamaños (100k, 500k, 1M, 3M, 6M y 24M). La arquitectura es un transformer decoder-only estilo GPT-2 que opera directamente sobre bytes, con una secuencia de 4096 bytes por muestra (el byte `O` seguido de 4095 bytes de texto). Se publican dos ramas por tamaño: entrenamiento desde cero sobre DCLM y warm start desde el checkpoint de self-play de la ronda 8191 del artículo original.

Su relevancia es exclusivamente metodológica: no son modelos de propósito general ni sirven para tareas de producción, sino artefactos para estudiar cómo se forman distintas clases de in-context learning en función de la distribución de datos de preentrenamiento. El repositorio incluye checkpoints intermedios con recuentos de tokens alineados con las rondas de self-play del artículo, lo que permite comparaciones punto a punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level (`ProgramLanguageModel`), inicialización estilo GPT-2 |
| Parametros totales | no disponible (la model card solo publica parámetros sin embeddings) |
| Parametros no de embedding | 65.728 / 492.160 / 984.192 / 3.016.960 / 6.033.664 / 24.253.184 según variante |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 bytes por secuencia (byte `O` + 4095 bytes de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles; entrenados sobre DCLM-Baseline 1.0, texto web predominantemente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (diccionario con clave `learner_state_dict`), más `config.json`, `log.jsonl` y `run.json`; sin safetensors ni GGUF |

Variantes publicadas y dimensiones (d / cabezas / capas):

| Tamano | Parametros no emb. | d / cabezas / capas | Semillas DCLM | LR |
|---|---|---|---|---|
| 100k | 65.728 | 64 / 1 / 1 | 1 | 2e-3 |
| 500k | 492.160 | 128 / 2 / 2 | 1 | 4e-3 |
| 1M | 984.192 | 128 / 2 / 4 | 2 | 2e-3 |
| 3M | 3.016.960 | 256 / 4 / 4 | 2 | 2e-3 |
| 6M | 6.033.664 | 256 / 4 / 8 | 2 | 2e-3 |
| 24M | 24.253.184 | 512 / 8 / 8 | 1 | 5e-4 |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de los aprendices de self-play del artículo de referencia, de modo que cualquier cargador que funcione con sus checkpoints funciona con estos. Se trata de un transformer decoder-only byte-level, con vocabulario de 256 tokens, inicialización normal(0, 0.02) con proyecciones residuales escaladas y la clase de modelo `ProgramLanguageModel` del repositorio `scoring/src/framework/model.py` del paper. Las secuencias siguen la convención de puntuación del artículo: el byte `O` como primer elemento, seguido de 4095 bytes de texto.

El entrenamiento usa 18,5 GB de texto de DCLM-Baseline 1.0, excluyendo todos los ficheros de los que se nutre el corpus de evaluación del artículo. El optimizador es AdamW (β 0,9/0,95) con weight decay 0,1 sobre todos los parámetros, batch de 64 × 4096 bytes, un 2 % de warmup lineal y después learning rate constante sin decaimiento, de forma que cada checkpoint es un modelo "a mitad de entrenamiento" comparable con los de self-play. Se empleó autocast en bf16 y `torch.compile` sobre una única A100 de 80 GB. El LR se eligió por tamaño mediante un barrido de tres puntos con runs cortos de 0,3 a 0,5B tokens.

La rama `sp2dclm` arranca desde el checkpoint de self-play de la ronda 8191 y continúa con texto DCLM usando LR 3e-3 (el valor que el artículo ajustó para sus propios warm starts). Los checkpoints de DCLM se guardan a 0,1, 0,25, 0,5 y 1B tokens, y después a 1,6, 3,2, 6,4, 12,9 y 17,7B tokens; los cinco últimos coinciden exactamente con los recuentos de tokens de aprendizaje de las rondas 256, 512, 1024, 2048 y 2816 del artículo, lo que permite emparejar checkpoint y ronda. Los warm starts se guardan a 0,05, 0,1, 0,25 y 0,5B tokens de DCLM.

## Capacidades

- Modelado de lenguaje byte-level: predicción del siguiente byte sobre secuencias de 4096 bytes, sin tokenizador externo.
- In-context learning procedimental y de recuperación: los modelos de texto superan a los de self-play en tareas de tipo lookup (clave→valor) y de categorización de palabras no vistas.
- Copia posicional, seguimiento de pila y comparaciones: en estas tareas procedimentales el self-play es superior, no estos modelos.
- Evaluación zero-shot mediante bits/byte sobre texto DCLM, con puntuaciones de 2,495 (100k) a 1,354 (24M) en el checkpoint de 17,7B tokens.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponibles; el entrenamiento es byte-level sobre texto web, sin evaluación por idioma.
- Capacidades especiales: no dispone de modo "thinking", visión ni audio.

## Casos de uso

- Estudio controlado del in-context learning: comparar, a igual arquitectura y número de tokens de aprendizaje, qué tipos de ICL emergen del self-play frente al preentrenamiento con texto, usando los checkpoints emparejados por recuento de tokens (rondas 256 a 2816).
- Reproducción y verificación de resultados: los checkpoints y los logs (`log.jsonl` con loss, LR, norma del gradiente y bits/byte de validación) permiten auditar las conclusiones del artículo y del write-up asociado.
- Investigación sobre transferencia mediante warm start: la rama `sp2dclm` permite medir si partir de un checkpoint de self-play mejora la eficiencia de muestra al continuar con texto DCLM, replicando el resultado de que el warm start gana al entrenamiento desde cero en igual número de tokens salvo a 100k.
- Análisis de leyes de escalado en régimen pequeño: seis tamaños entre 65.728 y 24.253.184 parámetros sin embeddings, con curvas de bits/byte de validación, permiten ajustar tendencias de loss frente a tamaño y tokens con un coste de cómputo muy bajo.
- Pruebas de infraestructura de entrenamiento: al caber en una sola A100 de 80 GB e incluso en CPU para inferencia, sirven como smoke test de pipelines de entrenamiento, bf16 autocast, `torch.compile` y guardado/carga de checkpoints.
- Estudio de tokenización byte-level y convenciones de puntuación: el formato fijo (byte `O` + 4095 bytes) es un banco de pruebas para medir cómo afectan las convenciones de secuencia a las métricas de bits/byte y a las tareas de ICL.
- Docencia e investigación académica: modelos de menos de 25M de parámetros que permiten reproducir experimentos de preentrenamiento y evaluación ICL en un único equipo, sin acceso a clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son de validación y de in-context learning.

Validación (bits/byte sobre 64 secuencias de una muestra DCLM disjunta del entrenamiento, a 17,7B tokens):

| Tamano | Val bits/byte @ 17,7B | Warm start @ 0,5B (desde cero @ 0,5B) |
|---|---|---|
| 100k | 2,495 | 2,786 (2,662) |
| 500k | 1,882 | 2,116 (2,205) |
| 1M | 1,711; 1,702 | 1,999 (2,099) |
| 3M | 1,584; 1,581 | 1,821 (1,984) |
| 6M | 1,506; 1,504 | 1,741 (1,778) |
| 24M | 1,354 | 1,560 (1,666) |

Los aprendices de self-play del artículo puntúan aproximadamente entre 6,2 y 7,6 bits/byte zero-shot sobre el mismo tipo de texto.

Precisión de exact-match en tareas de ICL a 17,7B tokens de aprendizaje (media por suite; self-play = checkpoints del artículo, 4 semillas con IC del 95 %; DCLM = estos modelos, un valor por semilla):

| Tamano | Tareas de texto imprimible: self-play | Tareas de texto imprimible: DCLM | Tareas de palabras: self-play | Tareas de palabras: DCLM |
|---|---|---|---|---|
| 1M | 0,30 ± 0,15 | 0,17; 0,13 | 0,31 ± 0,06 | 0,51; 0,52 |
| 3M | 0,27 ± 0,16 | 0,15; 0,15 | 0,36 ± 0,08 | 0,63; 0,51 |
| 6M | 0,44 ± 0,04 | 0,24; 0,14 | 0,40 ± 0,08 | 0,59; 0,60 |
| 24M | 0,41 ± 0,10 | 0,15 | 0,41 ± 0,06 | 0,69 |

Según el autor, el self-play gana en tareas procedimentales (copia por posición, seguimiento de pila, comparaciones), mientras que estos modelos de texto ganan en recuperación de clave→valor y categorización de palabras no mostradas, y ambas diferencias se agrandan con el tamaño.

## Requisitos de hardware

- VRAM para inferencia: el mayor de los modelos tiene 24.253.184 parámetros sin embeddings, aproximadamente 97 MB en fp32 y 49 MB en bf16, más el vocabulario byte-level (256 entradas), por lo que cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: no requiere GPU. El autor entrenó en una única A100 de 80 GB, pero ese requisito viene del pipeline de entrenamiento a 17,7B tokens, no del tamaño del modelo.
- GPU de consumo: sí, cualquiera con suficiente memoria libre (RTX 3060, 4090, etc.); la inferencia también es viable en CPU.
- Opciones de despliegue: PyTorch con la clase `ProgramLanguageModel` del repositorio del artículo. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, y no existen cuantizaciones publicadas.
- Latencia y throughput: no disponibles. El repositorio completo ocupa 2,2 GB, repartidos entre todas las variantes y checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ICL (texto imprimible / palabras, 24M) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rihim/icl-selfplay-vs-text-checkpoints (24M) | 24.253.184 no emb. | 4096 bytes | 0,15 / 0,69 | Apache-2.0 | HuggingFace, formato `.pth` |
| Self-play learners del articulo (24M) | misma arquitectura y tamanos | 4096 bytes | 0,41 ± 0,10 / 0,41 ± 0,06 | no disponible en la informacion | pesos en `nourya-cohen/solomonoff-paper` |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El único punto de comparación directo son los aprendices de self-play del artículo "Self-Play Pretraining with Zero Data", que comparten arquitectura, tamaños y convención de secuencia. No se identifican en la información disponible otros modelos byte-level de este rango de tamaño con evaluación ICL comparable.

## Limitaciones y advertencias

- Modelos muy pequeños: el propio autor advierte de que son modelos de investigación minúsculos, no útiles como modelos de lenguaje de propósito general.
- Semillas limitadas: 1 o 2 semillas de texto por tamaño, por lo que las diferencias entre configuraciones pueden no ser estadísticamente robustas.
- Comparación por tokens de aprendizaje, no por cómputo total: el artículo iguala tokens de learner, no el coste computacional agregado.
- La model card está truncada en la sección de limitaciones ("Seeds: ther..."), de modo que parte de las advertencias del autor no están disponibles.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, y sin mitigaciones documentadas (no se menciona RLHF ni DPO).
- Idiomas: no se declaran idiomas soportados ni se ofrece evaluación multilingüe; el corpus DCLM-Baseline es mayoritariamente inglés.
- Contexto corto y en bytes: 4096 bytes por secuencia, sin ventana ampliable documentada.
- Formato propietario en la práctica: requiere código del repositorio del artículo (`scoring/src/framework/model.py`) para cargar los pesos; el `load_state_dict` se hace con `strict=False`.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el valor práctico de estos checkpoints fuera de la investigación es nulo.
- Fechas de creación y actualización del repositorio (2026) poco habituales, así como el identificador arXiv citado; conviene verificar la vigencia de los enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rihim/icl-selfplay-vs-text-checkpoints
- Dataset de resultados ICL: https://huggingface.co/datasets/rihim/icl-selfplay-vs-text-results
- Repositorio de código y write-up: https://github.com/mihir-s-05/icl-selfplay-vs-text
- Write-up detallado: https://github.com/mihir-s-05/icl-selfplay-vs-text/blob/master/writeup/WRITEUP.md
- Artículo de referencia: https://arxiv.org/abs/2609.30063
- Pesos del artículo de self-play: https://huggingface.co/nourya-cohen/solomonoff-paper

## Resumen

El repositorio `rihim/icl-selfplay-vs-text-checkpoints` contiene una familia de modelos de lenguaje byte-level entrenados desde cero sobre texto web (DCLM-Baseline 1.0) para servir como línea base controlada frente a los aprendices de self-play del artículo "Self-Play Pretraining with Zero Data" (arXiv:2609.30063). La pregunta que motivan es concreta: a igual arquitectura, tamaño y número de tokens de entrenamiento, ¿produce el preentrenamiento con texto ordinario el mismo in-context learning que el self-play? La respuesta documentada por el autor es que no: cada régimen induce un tipo distinto de ICL, y las diferencias se agrandan con el tamaño.

Son modelos de investigación muy pequeños, con un rango de 65.728 a 24.253.184 parámetros sin contar embeddings, repartidos en seis tamaños (100k, 500k, 1M, 3M, 6M y 24M; etiquetas en k/M que se refieren a millones de parámetros). La arquitectura es un transformer decoder-only estilo GPT-2 que opera directamente sobre bytes, con secuencias de 4096 bytes (el byte `O` seguido de 4095 bytes de texto). Se publican dos familias: `dclm/<size>/seed-<s>` (entrenamiento desde cero) y `sp2dclm/<size>/seed-0` (warm start desde el checkpoint de self-play de la ronda 8191).

Su valor es exclusivamente metodológico, no de producto: permiten estudiar cómo la distribución de datos de preentrenamiento determina qué clases de in-context learning emergen. Los checkpoints de DCLM se guardan en recuentos de tokens alineados con las rondas 256, 512, 1024, 2048 y 2816 del artículo, lo que permite comparaciones emparejadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level (clase `ProgramLanguageModel`), inicialización estilo GPT-2 |
| Parametros totales | no disponible (la model card solo publica parámetros sin embeddings) |
| Parametros no de embedding | 65.728 / 492.160 / 984.192 / 3.016.960 / 6.033.664 / 24.253.184 según variante |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 bytes por secuencia (byte `O` + 4095 bytes de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles; entrenados sobre DCLM-Baseline 1.0, texto web mayoritariamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (diccionario con `learner_state_dict`), más `config.json`, `log.jsonl` y `run.json`; sin safetensors ni GGUF |

| Tamano | Parametros no emb. | d / cabezas / capas | Semillas DCLM | LR |
|---|---|---|---|---|
| 100k | 65.728 | 64 / 1 / 1 | 1 | 2e-3 |
| 500k | 492.160 | 128 / 2 / 2 | 1 | 4e-3 |
| 1M | 984.192 | 128 / 2 / 4 | 2 | 2e-3 |
| 3M | 3.016.960 | 256 / 4 / 4 | 2 | 2e-3 |
| 6M | 6.033.664 | 256 / 4 / 8 | 2 | 2e-3 |
| 24M | 24.253.184 | 512 / 8 / 8 | 1 | 5e-4 |

## Arquitectura y entrenamiento

La arquitectura replica exactamente la de los aprendices de self-play del artículo, de modo que cualquier cargador que funcione con sus checkpoints funciona con estos. Es un transformer decoder-only byte-level con vocabulario de 256 símbolos, inicialización normal(0, 0,02) con proyecciones residuales escaladas, y la convención de puntuación del paper: el byte `O` como primer elemento, seguido de 4095 bytes de texto.

El entrenamiento usa 18,5 GB de texto de DCLM-Baseline 1.0, descartando todos los ficheros de los que se nutre el corpus de evaluación del artículo. Optimizador AdamW (β 0,9/0,95), weight decay 0,1 sobre todos los parámetros, batch de 64 × 4096 bytes, 2 % de warmup lineal y después learning rate constante sin decaimiento, de modo que cada checkpoint es un modelo a mitad de entrenamiento, comparable con los de self-play. Se usó bf16 autocast y `torch.compile` en una única A100 de 80 GB. El LR se eligió por tamaño mediante un barrido de tres puntos con runs cortos de 0,3 a 0,5B tokens.

La rama `sp2dclm` arranca del checkpoint de self-play de la ronda 8191 y continúa con texto DCLM a LR 3e-3 (el valor ajustado por el artículo para sus warm starts). Los checkpoints de DCLM se guardan a 0,1, 0,25, 0,5 y 1B tokens, y después a 1,6, 3,2, 6,4, 12,9 y 17,7B tokens; los cinco últimos coinciden con los tokens de learner de las rondas 256, 512, 1024, 2048 y 2816 del artículo (1536 programas × 4096 bytes por ronda), lo que permite emparejar checkpoint y ronda. Los warm starts se guardan a 0,05, 0,1, 0,25 y 0,5B tokens.

## Capacidades

- Modelado de lenguaje byte-level: predicción del siguiente byte sobre secuencias de 4096 bytes, sin tokenizador externo.
- In-context learning de recuperación: superan a los modelos de self-play en tareas de lookup clave→valor y de categorización de palabras no vistas.
- In-context learning procedimental: en copia posicional, seguimiento de pila y comparaciones el self-play es superior, no estos modelos.
- Evaluación zero-shot por bits/byte sobre texto DCLM (de 2,495 a 1,354 según tamaño en el checkpoint de 17,7B tokens).
- Tool calling / function calling: no disponible (no documentado).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; sin evaluación por idioma.
- Capacidades especiales: sin modo "thinking", visión ni audio.

## Casos de uso

- Estudio controlado del in-context learning: comparar, a igual arquitectura y tokens de entrenamiento, qué tipos de ICL emergen del self-play frente al preentrenamiento con texto, usando los checkpoints emparejados por ronda.
- Reproducción y auditoría de resultados: los checkpoints y los logs (`log.jsonl` con loss, LR, norma de gradiente y bits/byte de validación) permiten verificar las conclusiones del artículo y del write-up asociado.
- Investigación sobre transferencia con warm start: la rama `sp2dclm` permite medir si partir de un checkpoint de self-play mejora la eficiencia de muestra al continuar con texto DCLM, replicando el resultado de que el warm start gana al entrenamiento desde cero a igual número de tokens en todos los tamaños salvo 100k.
- Análisis de leyes de escalado en régimen pequeño: seis tamaños entre 65.728 y 24.253.184 parámetros sin embeddings, con curvas de bits/byte de validación, permiten ajustar tendencias de loss frente a tamaño y tokens con un coste de cómputo mínimo.
- Pruebas de infraestructura de entrenamiento: al caber en una sola A100 de 80 GB, y con inferencia viable en CPU, sirven como smoke test de pipelines, bf16 autocast, `torch.compile` y guardado/carga de checkpoints.
- Estudio de tokenización byte-level: el formato fijo (byte `O` + 4095 bytes) permite medir cómo afectan las convenciones de secuencia a las métricas de bits/byte y a las tareas de ICL.
- Docencia e investigación académica: modelos de menos de 25M de parámetros reproducibles en un único equipo, sin acceso a clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son de validación y de in-context learning.

Validación: bits/byte sobre 64 secuencias de una muestra DCLM disjunta del entrenamiento, a 17,7B tokens.

| Tamano | Val bits/byte @ 17,7B | Warm start @ 0,5B (desde cero @ 0,5B) |
|---|---|---|
| 100k | 2,495 | 2,786 (2,662) |
| 500k | 1,882 | 2,116 (2,205) |
| 1M | 1,711; 1,702 | 1,999 (2,099) |
| 3M | 1,584; 1,581 | 1,821 (1,984) |
| 6M | 1,506; 1,504 | 1,741 (1,778) |
| 24M | 1,354 | 1,560 (1,666) |

Los aprendices de self-play del artículo puntúan aproximadamente 6,2 a 7,6 bits/byte zero-shot sobre el mismo tipo de texto.

Precisión de exact-match en tareas de ICL a 17,7B tokens de aprendizaje (media por suite; self-play = checkpoints del artículo, 4 semillas con IC del 95 %; DCLM = estos modelos, un valor por semilla):

| Tamano | Texto imprimible: self-play | Texto imprimible: DCLM | Palabras: self-play | Palabras: DCLM |
|---|---|---|---|---|
| 1M | 0,30 ± 0,15 | 0,17; 0,13 | 0,31 ± 0,06 | 0,51; 0,52 |
| 3M | 0,27 ± 0,16 | 0,15; 0,15 | 0,36 ± 0,08 | 0,63; 0,51 |
| 6M | 0,44 ± 0,04 | 0,24; 0,14 | 0,40 ± 0,08 | 0,59; 0,60 |
| 24M | 0,41 ± 0,10 | 0,15 | 0,41 ± 0,06 | 0,69 |

Según el autor, el self-play gana en tareas procedimentales (copia por posición, seguimiento de pila, comparaciones), mientras que estos modelos de texto ganan en recuperación clave→valor y categorización de palabras no mostradas, y ambas brechas se agrandan con el tamaño.

## Requisitos de hardware

- VRAM estimada: el mayor de los modelos tiene 24.253.184 parámetros sin embeddings, unos 97 MB en fp32 y 49 MB en bf16, más el vocabulario byte-level de 256 entradas; cabe por debajo de 1 GB en cualquier configuración.
- GPU recomendadas: no requiere GPU. El entrenamiento se hizo en una única A100 de 80 GB, requisito del pipeline a 17,7B tokens, no del tamaño del modelo.
- GPU de consumo: sí, cualquiera con memoria libre suficiente (RTX 3060, 4090, etc.); la inferencia también es viable en CPU.
- Opciones de despliegue: PyTorch con la clase `ProgramLanguageModel` del repositorio del artículo. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF, y no hay cuantizaciones publicadas.
- Latencia y throughput: no disponibles. El repositorio completo ocupa 2,2 GB entre todas las variantes y checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ICL (texto imprimible / palabras, 24M) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rihim/icl-selfplay-vs-text-checkpoints (24M) | 24.253.184 no emb. | 4096 bytes | 0,15 / 0,69 | Apache-2.0 | HuggingFace, `.pth` |
| Self-play learners del articulo (24M) | misma arquitectura y tamanos | 4096 bytes | 0,41 ± 0,10 / 0,41 ± 0,06 | no disponible en la informacion | pesos en `nourya-cohen/solomonoff-paper` |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El único punto de comparación directo son los aprendices de self-play del artículo "Self-Play Pretraining with Zero Data", con arquitectura, tamaños y convención de secuencia idénticos. No se identifican en la información disponible otros modelos byte-level de este rango con evaluación ICL comparable.

## Limitaciones y advertencias

- Modelos muy pequeños: el autor advierte de que son modelos de investigación minúsculos, no útiles como modelos de lenguaje de propósito general.
- Semillas limitadas: 1 o 2 semillas de texto por tamaño, por lo que las diferencias pueden no ser estadísticamente robustas.
- Comparación por tokens de learner, no por cómputo total agregado.
- La model card está truncada en la sección de limitaciones ("Seeds: ther..."), por lo que parte de las advertencias del autor no están disponibles.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, sin mitigaciones documentadas (no se mencionan RLHF ni DPO).
- Idiomas: no se declaran idiomas soportados ni evaluación multilingüe; DCLM-Baseline es mayoritariamente inglés.
- Contexto corto y en bytes: 4096 bytes por secuencia, sin ventana ampliable documentada.
- Dependencia de código externo: cargar los pesos requiere la clase del repositorio del artículo y `load_state_dict` con `strict=False`.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el valor práctico de estos checkpoints fuera de la investigación es nulo.
- Fechas del repositorio (2026) y el identificador arXiv citado resultan poco habituales; conviene verificar la vigencia de los enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rihim/icl-selfplay-vs-text-checkpoints
- Dataset de resultados ICL: https://huggingface.co/datasets/rihim/icl-selfplay-vs-text-results
- Repositorio de código: https://github.com/mihir-s-05/icl-selfplay-vs-text
- Write-up detallado: https://github.com/mihir-s-05/icl-selfplay-vs-text/blob/master/writeup/WRITEUP.md
- Articulo de referencia: https://arxiv.org/abs/2609.30063
- Pesos del articulo de self-play: https://huggingface.co/nourya-cohen/solomonoff-paper
