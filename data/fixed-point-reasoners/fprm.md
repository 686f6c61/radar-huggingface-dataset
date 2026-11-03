# fixed-point-reasoners/fprm

## Resumen

FPRM (Fixed-Point Tiny Recursive Model, también referido como FPTRM) es una familia de checkpoints de investigación publicada por el colectivo fixed-point-reasoners. No se trata de un modelo de lenguaje generativo, sino de un razonador iterativo con pesos compartidos (weight-tied) entrenado mediante un solver de punto fijo y escalado de cómputo en tiempo de inferencia. El repositorio agrupa cinco ejecuciones independientes, cada una autocontenida, con checkpoints, configuración exacta, código fuente del modelo y scripts de reproducción.

El modelo resuelve tareas de razonamiento estructurado de dominio cerrado: laberintos de 30×30 (Maze-Hard), Sudoku-Extreme, los conjuntos ARC-1-concept y ARC-2-concept con aumentación de datos, y seguimiento de estado sobre permutaciones de los grupos A5 y S5. Los resultados reportados por el autor son 87,0 % de exact-match en Maze-Hard, 94,2 % en Sudoku-Extreme, 47,5 % pass@2 en ARC-1 y 6,2 % pass@2 en ARC-2, además de 98,1 % y 98,8 % de accuracy en state tracking a longitud 128.

Su relevancia actual reside en la aproximación arquitectónica: en lugar de escalar parámetros, el modelo itera sobre un estado latente único (`single-z`) con un solver de punto fijo y ajusta el número de iteraciones en evaluación. El tamaño del repositorio (47,8 GB) corresponde al conjunto de checkpoints de las cinco ejecuciones, no a un único modelo. La licencia es MIT y el pipeline no está declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Recursive Model con pesos compartidos (weight-tied) e iteración hasta punto fijo; capas conv1d con kernel 4 o conv2d con kernel 3 según la tarea |
| Parametros totales | no disponible (no se publica el recuento por checkpoint en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la tarea de state tracking se entrena a longitud 32 y se evalúa a longitud 128 |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`step_<N>` con pesos EMA para evaluación y `step_<N>_train_state.pt` con el estado completo de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un razonador recursivo de pesos compartidos que mantiene un único estado latente (`single-z`) y lo refina iterativamente hasta alcanzar un punto fijo. La variante concreta depende de la tarea: `maze/`, `arc1/`, `arc2/` y `state_tracking/` usan convolución 1D con kernel 4, mientras que `sudoku/` emplea convolución 2D con kernel 3. La colocación de normalización varía: `sudoku/`, `arc1/` y `arc2/` usan `norm-placement=none`, y el autor no detalla la configuración en el resto de carpetas.

El entrenamiento se organiza por ejecución autocontenida. Los checkpoints se guardan cada 5000 épocas; los pesos `step_<N>` son promediados con EMA y son los que deben cargarse para evaluación, mientras que `step_<N>_train_state.pt` permite reanudar el entrenamiento. En `arc1/` y `arc2/` solo se distribuyen checkpoints de evaluación, sin estado de entrenamiento. La evaluación aplica decaimiento y paciencia específicos por tarea: `max_iter` 35 000 con decay 0,996 y paciencia 10 en `maze/`; `max_iter` 35 000 con decay 0,997 y paciencia 10 en `sudoku/`; `max_iter` 1000 en `arc1/` y `arc2/`; y en `state_tracking/` decay 0,95 con paciencia 5 para A5 y 10 para S5, sin EMA. El state tracking se entrena a longitud 32 con tres semillas por grupo y se evalúa a longitud 128, lo que constituye una prueba de generalización en longitud. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento iterativo sobre problemas combinatorios de dominio cerrado mediante refinamiento de un estado latente hasta punto fijo.
- Resolución de laberintos de 30×30 (Maze-Hard) con 87,0 % de exact-match en la configuración no aumentada.
- Resolución de Sudoku-Extreme con 94,2 % de exact-match.
- Resolución de tareas ARC-1-concept y ARC-2-concept con aumentación de 1000 variantes, con 47,5 % y 6,2 % de pass@2 respectivamente.
- Seguimiento de estado en permutaciones de los grupos A5 y S5, con 98,1 % y 98,8 % de accuracy a longitud 128 partiendo de entrenamiento a longitud 32.
- Escalado de cómputo en tiempo de inferencia: el número de iteraciones del solver es un hiperparámetro ajustable en evaluación (`max_iter`).
- No soporta tool calling, function calling, uso como agente multi-step general, generación de texto libre ni capacidades multimodales de visión o audio.

## Casos de uso

- Investigación en razonamiento iterativo: reproducción de los experimentos de punto fijo con los scripts incluidos en cada carpeta, comparando el efecto de `max_iter`, decay y paciencia sobre la precisión final.
- Estudio de generalización en longitud: el checkpoint de `state_tracking/` permite analizar cómo un modelo entrenado a longitud 32 mantiene precisión por encima del 98 % a longitud 128 en permutaciones de A5 y S5.
- Benchmark de referencia para solvers de Sudoku: el checkpoint de `sudoku/` sirve como línea base de 94,2 % exact-match frente a solvers simbólicos o redes convolucionales convencionales.
- Evaluación de arquitecturas con pesos compartidos: comparar el rendimiento de un modelo recursivo weight-tied frente a transformers de tamaño equivalente en tareas de búsqueda combinatoria como Maze-Hard.
- Análisis de estrategias de aumentación de datos en ARC: las ejecuciones `arc1/` y `arc2/` permiten medir el impacto de 1000 aumentaciones sobre pass@2 y estudiar la brecha entre ambos conjuntos.
- Reproducción de recetas de entrenamiento: el estado completo en `step_<N>_train_state.pt` permite reanudar entrenamientos y validar la receta del autor con las mismas semillas.
- Docencia y formación: uso de las cinco tareas como banco de pruebas controlado para explicar solvers de punto fijo, EMA de pesos y escalado de cómputo en inferencia.

## Benchmarks y rendimiento

| Tarea | Configuración | Métrica | Resultado |
|---|---|---|---|
| Maze-Hard 30×30 | single-z, conv1d/k4, sin aumentación; eval a max_iter 35k, decay 0,996, paciencia 10 | exact-match | 87,0 % |
| Sudoku-Extreme | single-z, conv2d/k3, norm-placement=none; eval a max_iter 35k, decay 0,997, paciencia 10 | exact-match | 94,2 % |
| ARC-1-concept (aug-1000) | single-z, conv1d/k4, norm-placement=none; eval a max_iter 1000 | pass@2 | 47,5 % |
| ARC-2-concept (aug-1000) | single-z, conv1d/k4, norm-placement=none; eval a max_iter 1000 | pass@2 | 6,2 % |
| State tracking A5 | single-z, conv1d/k4, entrenado a longitud 32, 3 semillas; eval decay 0,95, paciencia 5, sin EMA | accuracy a longitud 128 | 98,1 % |
| State tracking S5 | single-z, conv1d/k4, entrenado a longitud 32, 3 semillas; eval decay 0,95, paciencia 10, sin EMA | accuracy a longitud 128 | 98,8 % |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos de referencia en estas tareas.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (47,8 GB) agrega los checkpoints de las cinco ejecuciones, pero no se publica el tamaño por checkpoint ni el número de parámetros, por lo que no puede derivarse una estimación fiable de memoria.
- GPU recomendadas: no disponible. Al tratarse de modelos "tiny" según su propia denominación, es plausible que quepan en GPU de consumo, pero la información proporcionada no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La distribución es en PyTorch (`.pt`) con código fuente del modelo y scripts de reproducción incluidos en cada carpeta, por lo que el despliegue previsto es la ejecución directa del código del autor.
- Latencia y throughput: no disponibles. El coste de inferencia depende del número de iteraciones del solver (`max_iter`), que varía entre 1000 y 35 000 según la tarea.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FPRM (este modelo) | Razonador recursivo weight-tied con solver de punto fijo | no disponible | no aplica (state tracking hasta longitud 128) | 87,0 % Maze-Hard, 94,2 % Sudoku-Extreme, 47,5 % ARC-1 pass@2 | MIT | HuggingFace, checkpoints `.pt` |
| TRM (Tiny Recursive Model) | Razonador recursivo | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |
| Solvers simbólicos de Sudoku | Búsqueda con backtracking | no aplica | no aplica | resolución exacta en Sudoku estándar; comportamiento en Sudoku-Extreme no disponible | variable | amplia |
| Transformers pequeños para ARC | Transformer decoder | no disponible | no disponible | no disponible en la información proporcionada | variable | amplia |

La información proporcionada no incluye resultados numéricos de modelos alternativos en las mismas tareas, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado en HuggingFace y con 0 descargas en el momento de la consulta: no hay evidencia de uso en producción ni de validación externa.
- Especialización estricta: cada checkpoint resuelve una única tarea (laberintos, Sudoku, ARC-1, ARC-2 o state tracking). No es un modelo de propósito general ni acepta instrucciones en lenguaje natural.
- El rendimiento en ARC-2-concept es bajo (6,2 % pass@2), lo que limita su uso como referencia en ese conjunto.
- El state tracking se entrena a longitud 32 y se evalúa a 128; no se documenta el comportamiento a longitudes superiores.
- No se publican datos sobre sesgos, tasas de alucinación ni robustez fuera de la distribución de entrenamiento. En tareas de dominio cerrado el riesgo relevante es el fallo silencioso: una respuesta incorrecta se emite con el mismo formato que una correcta.
- No se especifican los volúmenes ni la composición de los datos de entrenamiento, lo que dificulta auditar posibles contaminaciones con los conjuntos de evaluación.
- Los checkpoints `arc1/` y `arc2/` no incluyen estado de entrenamiento, por lo que no permiten reanudar el entrenamiento, solo evaluar.
- La licencia MIT permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- El tamaño del repositorio (47,8 GB) exige espacio en disco considerable para descargar las cinco ejecuciones completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fixed-point-reasoners/fprm
- Carpeta Maze-Hard: https://huggingface.co/fixed-point-reasoners/fprm/tree/main/maze
- Carpeta Sudoku-Extreme: https://huggingface.co/fixed-point-reasoners/fprm/tree/main/sudoku
- Carpeta ARC-1-concept: https://huggingface.co/fixed-point-reasoners/fprm/tree/main/arc1
- Carpeta ARC-2-concept: https://huggingface.co/fixed-point-reasoners/fprm/tree/main/arc2
- Carpeta State tracking: https://huggingface.co/fixed-point-reasoners/fprm/tree/main/state_tracking
