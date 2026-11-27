# openenv/Qwen3-1.7B-Sudoku-SFT

## Resumen

Qwen3-1.7B-Sudoku-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el proyecto openenv. Su proposito es muy concreto: jugar al Sudoku mediante el uso de una herramienta (`place(row, col, number)`) y razonar brevemente antes de cada movimiento. Se trata, por tanto, de un modelo especializado en una tarea de razonamiento estructurado con tool calling, no de un modelo de proposito general.

El modelo se entrena sobre el dataset `openenv/sudoku-tool-calls-sft`, compuesto por 1.000 partidas de Sudoku resueltas por un solver. La arquitectura subyacente es la de Qwen3-1.7B (transformer denso de 1.720.574.976 parametros), y el ajuste se realiza con `SFTTrainer` de TRL durante una epoca (63 pasos) en una unica A100 de 80 GB. Es la pieza inicial de un tutorial de GRPO en OpenEnv: el siguiente paso del pipeline es `openenv/Qwen3-1.7B-Sudoku-SFT-GRPO`.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como punto de partida reproducible para estudiar refinamiento por RL (GRPO) sobre un modelo pequeno con una tarea verificable, y como ejemplo de entrenamiento SFT de bajo coste (unos 27 minutos y 1,10 USD) con trazabilidad completa de curvas en Trackio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; el entrenamiento usa max length 16384) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo ocupa 10,3 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B y conserva su arquitectura transformer densa. El ajuste fino se realiza con `SFTTrainer` (TRL 1.16.0) usando `assistant_only_loss=True`, de modo que la perdida se calcula unicamente sobre los turnos del asistente. Se entrena durante una epoca (63 pasos) con learning rate 1e-5 y schedule coseno, batch size 16 y longitud maxima de 16384 tokens. El entrenamiento se ejecuta en fp32 sobre una A100 de 80 GB mediante Hugging Face Jobs (aproximadamente 27 minutos, 1,10 USD) y los pesos se publican en bf16.

El dataset de entrenamiento contiene 1.000 partidas de Sudoku jugadas por un solver, en las que el modelo rellena una celda por llamada a la herramienta `place(row, col, number)` y escribe un razonamiento corto antes de cada movimiento. No se menciona RLHF ni DPO en esta fase; el refinamiento por RL (GRPO) se reserva para el modelo posterior del tutorial.

## Capacidades

- Generacion de texto y razonamiento paso a paso breve antes de cada accion (thinking mode activado en evaluacion, con 384 nuevos tokens por movimiento).
- Tool calling / function calling: uso de la herramienta `place(row, col, number)` para rellenar celdas del tablero.
- Razonamiento multi-paso dentro de una partida: secuencia de movimientos hasta completar o abandonar el Sudoku.
- Generacion conversacional (tag `conversational`).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion en RL aplicado a LLM: sirve como checkpoint inicial para GRPO en el tutorial de OpenEnv, permitiendo comparar la evolucion antes y despues del refinamiento con recompensas verificables.
- Evaluacion de tool calling estructurado: el modelo ejerce un unico tool con argumentos tipados (`row`, `col`, `number`), lo que lo convierte en un banco de pruebas controlado para medir precision de llamadas y adherencia al esquema.
- Estudio de razonamiento verificable en tareas con solucion unica: el Sudoku ofrece una senal de exito binaria y comprobable, ideal para analizar fallos de razonamiento (por ejemplo, el error documentado de leer mal una fila o columna y concluir que falta un 0).
- Docencia y formacion en ajuste fino: el pipeline completo (dataset, script `sft.py`, curvas en Trackio, coste de 1,10 USD) es replicable en una sola GPU A100 y sirve como ejemplo practico de SFT con `assistant_only_loss`.
- Generacion de datos sinteticos de partidas: el modelo puede producir trayectorias de juego con razonamiento que sirvan como material adicional para entrenamiento o analisis.
- Benchmark interno de modelos pequenos en razonamiento restringido: comparar Qwen3-1.7B base frente a este SFT en los conjuntos `puzzles_c65.json` y `puzzles_c55.json` ofrece una medida reproducible de la mejora por SFT.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo greedy, sobre los mismos 30 puzzles por nivel, ninguno presente en las partidas de entrenamiento:

| Modelo | 16 celdas vacias: resueltos | Celdas rellenadas | 26 celdas vacias: resueltos | Celdas rellenadas |
|---|---|---|---|---|
| Qwen3-1.7B | 0/30 | 1,9 % | 0/30 | 0,1 % |
| Qwen3-1.7B-Sudoku-SFT | 19/30 | 79,1 % | 10/30 | 55,8 % |

El modelo evaluado juega con thinking activado (384 nuevos tokens por movimiento), mientras que el modelo base se evalua sin thinking.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,72 mil millones de parametros, en bf16 los pesos ocupan aproximadamente 3,4 GB, a lo que hay que sumar la cache KV y el contexto.
- GPU recomendadas: el entrenamiento se realizo en una A100 de 80 GB; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano, es plausible en GPU consumer con memoria suficiente, pero no se aporta dato oficial.
- Opciones de despliegue: transformers (libreria indicada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se mencionan llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles. El script de evaluacion usa 384 nuevos tokens por movimiento con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Sudoku (16 vacias) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72 B | no disponible | 0/30 resueltos, 1,9 % celdas | no disponible | Hugging Face |
| Qwen3-1.7B-Sudoku-SFT | 1,72 B | no disponible | 19/30 resueltos, 79,1 % celdas | no disponible | Hugging Face |
| Qwen3-1.7B-Sudoku-SFT-GRPO | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para jugar al Sudoku con una herramienta concreta; su utilidad fuera de esa tarea no esta documentada y probablemente sea limitada.
- Fallo caracteristico: el error mas comun es leer mal una fila o columna, concluir que el digito faltante es 0 y terminar la partida como resuelta.
- Alucinacion en el razonamiento: el modelo puede emitir conclusiones incorrectas sobre el estado del tablero, como muestra el fallo anterior.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles; no se documentan idiomas soportados.
- Licencia: no disponible; no se puede confirmar el uso comercial sin consultar al autor.
- Caveat de produccion: al ser un checkpoint intermedio de un tutorial, no esta pensado como modelo de produccion; el modelo posterior del pipeline es el GRPO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/openenv/sudoku-tool-calls-sft
- Modelo GRPO resultante: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT-GRPO
- Tutorial de GRPO en OpenEnv: https://openenv.github.io/OpenEnv/main/tutorials/sudoku-grpo
- Scripts de ejemplo (sft.py, evaluate.py, puzzles): https://github.com/openenv/OpenEnv/tree/main/examples/sudoku
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/sudoku-runs
