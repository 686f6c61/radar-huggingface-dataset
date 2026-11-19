# arena-education/2.5-alphazero-connect4-weights

## Resumen

`arena-education/2.5-alphazero-connect4-weights` es un conjunto de pesos preentrenados de una red neuronal `Connect4Model` concebida para el capítulo 2.5 del curso ARENA (Alignment Research Engineer Accelerator), dedicado a MCTS y AlphaZero. No es un modelo de lenguaje: es una red de política y valor para el juego Connect 4 (cuatro en raya) entrenada mediante autoaprendizaje con el algoritmo AlphaZero, con 612.622 parámetros totales. Su propósito es didáctico: permitir a los estudiantes del curso cargar un agente ya entrenado con la "receta completa" y evaluarlo contra un solver de referencia sin tener que reproducir el entrenamiento desde cero.

El modelo se entrenó con el código `solutions.py` del repositorio ARENA_materials (commit `9e20149f4`), usando `AZConfig(sims=64, num_generations=50)` con el resto de parámetros por defecto: 50 generaciones de 8192 partidas de self-play con 64 simulaciones MCTS por movimiento. El entrenamiento completo tardó 33,9 minutos en una única RTX 5090 (con la GPU compartida) y es reproducible bit a bit con la misma semilla (`torch.manual_seed(0)`), el mismo código y el mismo stack de software.

Su relevancia es acotada pero clara: sirve como referencia de rendimiento para los ejercicios del curso y como ejemplo mínimo y verificable de un pipeline AlphaZero funcional sobre un juego resuelto. No debe confundirse con un modelo de propósito general: no genera texto, no tiene tokenizador ni ventana de contexto en el sentido habitual, y su única tarea es seleccionar movimientos en Connect 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para AlphaZero (política y valor) sobre tablero de Connect 4; arquitectura interna concreta no detallada en la información disponible |
| Parametros totales | 612.622 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado de entrada es el tablero de Connect 4) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, entrenamiento con autocast bf16) |
| Idiomas soportados | no aplica (modelo de juego, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch, cargado con `torch.load`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal de política y valor al estilo AlphaZero para Connect 4, con 612.622 parámetros. Se entrena mediante self-play guiado por búsqueda MCTS: en cada movimiento se ejecutan 64 simulaciones de MCTS que producen una política objetivo mejorada, y la red aprende a predecir tanto esa política como el valor de la posición. La información disponible no detalla el número de capas, canales ni el esquema exacto de la cabeza de valor; solo se especifica el nombre de la clase (`Connect4Model`) y el número total de parámetros.

El entrenamiento siguió la "receta completa" del docstring de `AZConfig`: `sims=64` y `num_generations=50`, con todos los demás ajustes por defecto. Esto equivale a 50 generaciones de 8192 partidas de self-play cada una, con 64 simulaciones por movimiento, lo que supone unas 409.600 partidas en total. Se fijó la semilla con `torch.manual_seed(0)` antes de construir el modelo y se activó autocast en bf16 (por defecto en GPUs compatibles). El entrenamiento completo consumió 33,9 minutos en una RTX 5090 compartida. Con la misma semilla, código y stack de software, el resultado es reproducible bit a bit; otras GPUs o versiones de PyTorch pueden producir pesos ligeramente distintos.

## Capacidades

- Selección de movimientos en Connect 4: dado un estado de tablero, la red produce una distribución de política sobre las columnas legales y una estimación de valor de la posición.
- Búsqueda MCTS acoplada: puede usarse con `evaluate_with_search` para combinar la política de la red con búsqueda de árbol (de 0 a 128 simulaciones por movimiento en la evaluación publicada).
- Mejora monótona con la búsqueda: la precisión frente al solver de Pascal Pons pasa de 0,899 sin búsqueda (M=0) a 0,945 con 128 simulaciones por movimiento.
- Evaluación reproducible: integración directa con el script `pascal_pons/eval_pons.py` y el dataset `arena-education/connect4-pons-eval`.
- Sin capacidades de lenguaje, visión, audio, tool calling ni agentes multi-paso en el sentido de un LLM. No hay generación de texto ni razonamiento simbólico general.

## Casos de uso

- Docencia del capítulo 2.5 de ARENA: los estudiantes cargan estos pesos para comparar su propia implementación de AlphaZero con una referencia ya entrenada con la receta completa, sin esperar 34 minutos de entrenamiento.
- Referencia de rendimiento en MCTS: sirve para calibrar cuánta precisión adicional aporta aumentar las simulaciones por movimiento (de 0,899 a 0,945 entre M=0 y M=128) y contrastarlo con la receta rápida del notebook (aproximadamente 0,85 en M=0 y 0,90 en M=16).
- Validación de pipelines de evaluación: al estar emparejado con el dataset de posiciones decisivas y el solver de Pascal Pons, permite verificar que un harness de evaluación reproduce las métricas publicadas.
- Baseline en experimentos de RL: punto de partida para probar variantes de MCTS, funciones de valor o esquemas de self-play comparando contra un agente conocido y reproducible.
- Reproducibilidad de experimentos: al ser bit a bit reproducible con la misma semilla y stack, sirve para auditar cambios en el código de entrenamiento detectando desviaciones en los pesos resultantes.
- Demostración educativa de AlphaZero en un juego resuelto: ejemplo mínimo (612.622 parámetros) de un ciclo completo de self-play, entrenamiento y evaluación contra un solver exacto, adecuado para material didáctico y talleres.

## Benchmarks y rendimiento

La métrica publicada es la precisión de movimiento óptimo frente al solver de Pascal Pons: la fracción de posiciones en las que el movimiento elegido por el modelo está entre los movimientos óptimos del solver. Se mide sobre las 6.705 posiciones decisivas del dataset `arena-education/connect4-pons-eval`, usando `evaluate_with_search` de `pascal_pons/eval_pons.py`. M es el número de simulaciones MCTS por movimiento; M=0 es la política bruta sin búsqueda.

| M (sims/movimiento) | 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 |
|---|---|---|---|---|---|---|---|---|---|
| Precisión Pons | 0,899 | 0,899 | 0,887 | 0,894 | 0,921 | 0,931 | 0,935 | 0,941 | 0,945 |

Como referencia, la receta rápida por defecto que los estudiantes entrenan en el notebook (`AZConfig()`: 16 simulaciones, 8 generaciones) obtiene aproximadamente 0,85 en M=0 y 0,90 en M=16.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 612.622 parámetros, los pesos ocupan del orden de 1,2 MB en fp32 y unos 0,6 MB en bf16; cualquier GPU consumer con más de 1 GB de VRAM es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia y evaluación. El entrenamiento completo se ejecutó en una RTX 5090 en 33,9 minutos con la GPU compartida.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo con `torch.load` y `huggingface_hub.hf_hub_download`; no hay formatos GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de latencia por movimiento. El coste dominante en la evaluación es la búsqueda MCTS (hasta 128 simulaciones por movimiento), no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Precisión publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/2.5-alphazero-connect4-weights | 612.622 | Connect 4 (AlphaZero) | 0,899 (M=0) – 0,945 (M=128) frente al solver Pons | no disponible | Hugging Face |
| Receta rápida del notebook ARENA (`AZConfig()`: 16 sims, 8 generaciones) | no disponible | Connect 4 (AlphaZero) | ~0,85 (M=0) y ~0,90 (M=16) | no disponible | Se entrena en el propio notebook |
| Solver de Pascal Pons | no aplica (solver exacto) | Connect 4 (resolución exacta) | Referencia de optimalidad | no disponible | GitHub (PascalPons/connect4) |

No se dispone de datos publicados de otros checkpoints AlphaZero para Connect 4 comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito estrictamente limitado a Connect 4: no es un modelo de lenguaje ni un modelo de propósito general; no procesa texto, imágenes ni audio.
- Licencia no especificada: antes de cualquier uso fuera del contexto del curso, es necesario contactar con el autor para aclarar las condiciones de uso comercial o redistribución.
- Sin información sobre sesgos: no se documentan sesgos, pero al entrenarse solo con self-play sobre un juego resuelto, su comportamiento está acotado al espacio de estados de Connect 4.
- Riesgo de alucinación no aplicable en el sentido de los LLM; sin embargo, la política bruta (M=0) comete errores en aproximadamente el 10 % de las posiciones decisivas y no garantiza optimalidad sin búsqueda.
- Dependencia del código del curso: la carga requiere la clase `Connect4Model` de `part5_mcts_alphazero`; sin ese código, los pesos no son utilizables directamente.
- Reproducibilidad condicionada: los pesos son bit a bit reproducibles solo con la misma semilla, código y stack de software; otras GPUs o versiones de PyTorch pueden dar resultados ligeramente distintos.
- Sin datos de cuantización ni formatos alternativos de pesos: solo se distribuye `model.pt` en PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/arena-education/2.5-alphazero-connect4-weights
- Dataset de evaluación: https://huggingface.co/datasets/arena-education/connect4-pons-eval
- Repositorio del curso ARENA: https://github.com/ARENA-education/ARENA_materials
- Solver de Connect 4 de Pascal Pons: https://github.com/PascalPons/connect4
