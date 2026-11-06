# openenv/Qwen3-1.7B-Sudoku-SFT

## Resumen

Qwen3-1.7B-Sudoku-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, desarrollado por el equipo de OpenEnv como parte de su tutorial de entrenamiento con refuerzo (GRPO) para entornos interactivos. El modelo está especializado en resolver sudokus mediante el uso de una herramienta externa `place(row, col, number)`: en cada turno rellena una única celda y emite un razonamiento breve antes de cada movimiento. No es un modelo de propósito general, sino un componente didáctico y experimental pensado para demostrar cómo un modelo pequeño puede aprender a interactuar con herramientas de forma estructurada.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B (1.720.574.976 parámetros) y se entrena con 1.000 partidas de sudoku generadas por un solutorio, en un único epoch de 63 pasos. Su relevancia actual radica en que sirve como punto de partida reproducible para el tutorial de OpenEnv sobre GRPO, que produce el modelo posterior `openenv/Qwen3-1.7B-Sudoku-SFT-GRPO`. Es, por tanto, una pieza de infraestructura educativa más que un modelo listo para producción.

La ficha que sigue documenta sus especificaciones, su proceso de entrenamiento, sus capacidades reales (limitadas al dominio del sudoku y al tool calling) y sus limitaciones, con especial énfasis en que no debe confundirse con un modelo de razonamiento general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max_length 16384) |
| Tipos de cuantización | no disponible (pesos en bf16; repo de 10,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | openenv/sudoku-tool-calls-sft |
| Framework | TRL 1.16.0, Transformers 5.21.0, PyTorch 2.15.0, Datasets 5.1.0 |
| Descargas | 264 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3-1.7B original: un transformer denso de 1.720 millones de parámetros con atención estándar (no se documenta en la información disponible ninguna modificación estructural). El ajuste se realiza con `SFTTrainer` de TRL durante un único epoch de 63 pasos, con `assistant_only_loss=True` (la pérdida se calcula solo sobre los tokens del asistente, no sobre los del usuario ni los de la herramienta), learning rate de 1e-5 con schedule coseno, batch size 16 y longitud máxima de 16.384 tokens. El entrenamiento se ejecutó en una A100 de 80 GB mediante Hugging Face Jobs, con un coste aproximado de 1,10 dólares y una duración de unos 27 minutos. Se entrenó en fp32 y se publicó en bf16.

Los datos de entrenamiento consisten en 1.000 partidas de sudoku jugadas por un solutorio, en las que el modelo rellena una celda por llamada a la herramienta `place(row, col, number)` y escribe un razonamiento breve antes de cada movimiento. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra etapa de alineación posterior al SFT. La innovación técnica destacable es el formato de interacción: el modelo aprende a alternar razonamiento en lenguaje natural con llamadas a herramienta estructuradas, un patrón reutilizable en otros entornos de agente.

## Capacidades

- Resolución de sudokus mediante tool calling: rellena una celda por llamada a `place(row, col, number)`.
- Razonamiento breve antes de cada movimiento (thinking mode activado, con 384 tokens nuevos por movimiento).
- Formato conversacional compatible con `text-generation-inference` y endpoints.
- Soporte de tool calling estructurado (función `place` con tres argumentos).
- Capacidad de continuar una partida multi-turno hasta completar el tablero o declararlo resuelto.
- No se documentan capacidades de visión, audio, código general ni matemáticas fuera del dominio del sudoku.
- Capacidades multilingües: no disponibles (el entrenamiento y la evaluación se documentan en inglés).

## Casos de uso

- Tutorial reproducible de SFT y GRPO: el modelo sirve como punto de partida documentado para el tutorial de OpenEnv, que entrena después `openenv/Qwen3-1.7B-Sudoku-SFT-GRPO`; es adecuado porque el pipeline completo (script `sft.py`, curvas en Trackio, evaluación con `evaluate.py`) está publicado y es ejecutable en una sola GPU.
- Investigación en aprendizaje por refuerzo con entornos interactivos: permite estudiar cómo un modelo de 1,7B aprende a usar una herramienta con recompensa verificable (sudoku resuelto o no), sin necesidad de infraestructura grande.
- Evaluación de tool calling en modelos pequeños: el formato `place(row, col, number)` con una llamada por turno es un banco de pruebas controlado para medir precisión de argumentos y adherencia al esquema.
- Generación de datos sintéticos de razonamiento paso a paso: las trazas de razonamiento previas a cada movimiento pueden reutilizarse como corpus para otros experimentos de SFT.
- Docencia y divulgación: ejemplo autocontenido de ajuste fino con TRL, con coste de 1,10 dólares y 27 minutos de cómputo, adecuado para cursos prácticos de IA.
- Pruebas de regresión de pipelines de despliegue: al ser un modelo pequeño y con salida estructurada, sirve para validar integraciones de TGI, endpoints y parseo de tool calls antes de pasar a modelos mayores.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas generales de lenguaje, por su especialización estrecha.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, evaluados con decodificación greedy sobre 30 puzzles por nivel, ninguno presente en las partidas de entrenamiento:

| Modelo | 16 celdas vacías: resueltos | Celdas rellenadas | 26 celdas vacías: resueltos | Celdas rellenadas |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 0/30 | 1,9 % | 0/30 | 0,1 % |
| Qwen3-1.7B-Sudoku-SFT | 19/30 | 79,1 % | 10/30 | 55,8 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1,72B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB.
- En cuantización de 8 bits: alrededor de 1,8 GB de pesos; en 4 bits, alrededor de 1 GB (no se documentan cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 80 GB para entrenamiento (así se entrenó); para inferencia basta una RTX 3090, RTX 4090, L4 o incluso GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: compatible con `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`); también puede servirse con Transformers, vLLM o llama.cpp si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles. La evaluación oficial usa 384 tokens nuevos por movimiento con thinking activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openenv/Qwen3-1.7B-Sudoku-SFT | 1,72B | no disponible | Sudoku con tool calling (SFT) | no disponible | Hugging Face, 264 descargas |
| openenv/Qwen3-1.7B-Sudoku-SFT-GRPO | 1,72B (derivado) | no disponible | Sudoku con tool calling tras GRPO | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1,72B | no disponible | Propósito general | no disponible en esta ficha | Hugging Face |

La comparación con alternativas de propósito general no es significativa: este modelo está diseñado exclusivamente para el dominio del sudoku y su rendimiento en tareas generales no se ha evaluado. Frente a su base Qwen3-1.7B, la mejora en el dominio es sustancial (de 0/30 a 19/30 en puzzles de 16 celdas vacías), pero no se han publicado comparativas con otros modelos especializados en sudoku.

## Limitaciones y advertencias

- Especialización muy estrecha: solo resuelve sudokus mediante la herramienta `place`; no es apto para tareas generales de lenguaje, código o razonamiento.
- Fallo característico documentado: malinterpreta una fila o columna, concluye que el dígito que falta es 0 y termina la partida declarándola resuelta.
- Riesgo de alucinación en el razonamiento previo a cada movimiento: el texto puede no corresponder con el estado real del tablero.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen3-1.7B antes de cualquier despliegue.
- Idiomas no documentados; el entrenamiento y la evaluación se describen en inglés.
- Longitud de contexto efectiva no documentada, aunque el entrenamiento usó 16.384 tokens.
- No se han publicado evaluaciones de sesgos, seguridad ni robustez.
- No debe usarse en producción para atención al cliente, generación de código ni agentes generales; su valor es educativo y experimental.
- El modelo depende de un parser de tool calls correcto; errores en el parseo de `place(row, col, number)` invalidan la partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/openenv/sudoku-tool-calls-sft
- Modelo GRPO derivado: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT-GRPO
- Tutorial OpenEnv Sudoku GRPO: https://huggingface.co/docs/openenv/tutorials/sudoku-grpo
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/sudoku-runs
- Repositorio OpenEnv (scripts `sft.py` y `evaluate.py`): https://github.com/openenv/OpenEnv/tree/main/examples/sudoku
