# arberzela/sfprm

## Resumen

El repositorio `arberzela/sfprm` publica los checkpoints de SFPRM (Spherical Fixed-Point Reasoners), una variante esférica de FPRM, junto con los checkpoints de los baselines FPRM, TRM, HRM y EqR. Lo desarrollan Arber Zela, Artavazd Maranjyan, Pol Puigdemont, David Berghaus, Valentyn Boreiko y Volkan Cevher, y la model card lo presenta como un trabajo de razonamiento iterativo con parada adaptativa del bucle sobre la hiperesfera.

El modelo aborda tareas de razonamiento estructurado: Sudoku-Extreme, laberintos Maze-Hard de 30×30, ARC-AGI-1 y Mini-ARC. Su interés actual reside en la comparación controlada entre arquitecturas de tipo looped transformer y mecanismos de punto fijo, con resultados publicados frente a FPRM, TRM, HRM y EqR. La información disponible no incluye número de parámetros, longitud de contexto ni datos de entrenamiento detallados; la licencia es MIT y el repositorio completo ocupa 4,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) y resolución de punto fijo sobre la hiperesfera; variante esférica de FPRM |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; no se define una ventana de contexto lingüístico |
| Tipos de cuantización | no disponible; no se publican versiones cuantizadas |
| Idiomas soportados | no disponible; las tareas evaluadas son puzzles, sin soporte lingüístico documentado |
| Licencia | MIT |
| Formato de pesos | checkpoints del flujo `pretrain.py`; el bundle de reanudación usa `.pt` (PyTorch). No se publican safetensors ni GGUF |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 4,0 GB con bundles de entrenamiento; 2,6 GB solo pesos de evaluación |

## Arquitectura y entrenamiento

SFPRM es una arquitectura de razonamiento iterativo basada en un transformer con bucle y un mecanismo de punto fijo sobre la hiperesfera. La model card la describe como la variante esférica de FPRM e incorpora parada adaptativa del bucle; el título del trabajo es "Spherical Fixed-Point Reasoners: Adaptive Loop Halting on the Hypersphere". Los checkpoints comparados incluyen FPRM, TRM, HRM y EqR, y cada carpeta incorpora `all_config.yaml`, notas de procedencia y el código de modelo y pérdida utilizado en la ejecución.

No se documentan el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron RLHF o DPO. Las tareas cubiertas son Sudoku-Extreme, Maze-Hard 30×30, ARC-AGI-1 y Mini-ARC. La evaluación usa `arch.max_iter_eval=200` para SFPRM/FPRM y `arch.halt_max_steps=200` para TRM/HRM/EqR. Los pesos evaluados son EMA en todas las ejecuciones excepto HRM.

## Capacidades

- Resolución de Sudoku-Extreme con un 96,58 % de exactitud (exact match) sobre el conjunto de test completo de 422.786 puzzles.
- Resolución de laberintos Maze-Hard de 30×30 con un 87,9 % de exactitud en 1.000 laberintos evaluados durante la ejecución.
- Razonamiento abstracto en ARC-AGI-1, con resultados pass@1/pass@2 de 41,25 %/46,62 % en evaluación pooled durante el entrenamiento.
- Evaluación en Mini-ARC con pass@1/pass@2 de 59,1 %/59,7 % mediante votos de un solo checkpoint y tope de rollout de 200.
- Iteración adaptativa con parada del bucle y resolución de punto fijo; el presupuesto de iteraciones se controla en evaluación.
- Comparación directa con FPRM, TRM, HRM y EqR dentro del mismo repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües generales.

## Casos de uso

- Investigación en razonamiento iterativo: usar los checkpoints SFPRM y FPRM para medir el efecto de la parada adaptativa del bucle en Mini-ARC, fijando `arch.max_iter_eval=200` y comparando pass@1/pass@2 con TRM, HRM y EqR.
- Evaluación de Sudoku a gran escala: ejecutar `evaluate.py` sobre `sfprm-sudoku-step97656` con el test completo de 422.786 puzzles para reproducir el 96,58 % de exactitud y analizar errores por dificultad.
- Planificación en laberintos de 30×30: evaluar `sfprm-maze-step78120` y `fprm-maze-step78120` sobre 1.000 laberintos Maze-Hard para comparar la tasa de éxito exacta, 87,9 % frente a 83,9 %.
- Investigación en ARC-AGI: usar `sfprm-arc-step518065` para obtener pass@1/pass@2 pooled y estudiar la generalización en razonamiento abstracto, teniendo en cuenta que ese checkpoint no incluye `train_state`.
- Comparación de arquitecturas de razonamiento: emplear los checkpoints Mini-ARC de SFPRM, FPRM, HRM, EqR y TRM para replicar la tabla comparativa con un protocolo común de voto único y tope de 200 iteraciones.
- Reproducibilidad de experimentos: descargar `all_config.yaml`, `PROVENANCE.md` y el código del repositorio para reejecutar evaluaciones y auditar la procedencia de pesos y pérdidas.
- Análisis de eficiencia computacional: variar el tope de iteraciones en `evaluate.py` para estudiar el compromiso entre precisión y cómputo en tareas de punto fijo.

## Benchmarks y rendimiento

| Tarea | Modelo | Métrica | Resultado | Protocolo |
|---|---|---|---|---|
| Sudoku-Extreme | SFPRM | Exactitud (exact match) | 96,58 % | Test completo, 422.786 puzzles |
| Maze-Hard 30×30 | SFPRM | Exactitud (exact match) | 87,9 % | 1.000 laberintos, en ejecución |
| Maze-Hard 30×30 | FPRM | Exactitud (exact match) | 83,9 % | 1.000 laberintos, en ejecución |
| ARC-AGI-1 | SFPRM | pass@1 / pass@2 | 41,25 % / 46,62 % | pass@K registrado durante el entrenamiento, votos pooled |
| Mini-ARC | SFPRM | pass@1 / pass@2 | 59,1 % / 59,7 % | Voto único de checkpoint, tope de rollout 200 |
| Mini-ARC | FPRM | pass@1 / pass@2 | 55,0 % / 62,4 % | Voto único de checkpoint, tope de rollout 200 |
| Mini-ARC | HRM | pass@1 / pass@2 | 51,7 % / 58,4 % | Voto único de checkpoint, tope de rollout 200 |
| Mini-ARC | EqR | pass@1 / pass@2 | 40,3 % / 49,7 % | Voto único de checkpoint, tope de rollout 200 |
| Mini-ARC | TRM | pass@1 / pass@2 | 36,9 % / 45,0 % | Voto único de checkpoint, tope de rollout 200 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros ni la precisión de los pesos, y el tamaño agregado del repositorio no permite derivar una estimación fiable.
- GPU recomendadas: no disponible. La model card no incluye guía de GPU para entrenamiento o inferencia.
- GPU de consumo: no confirmado. Los pesos de evaluación sin bundles ocupan 2,6 GB en conjunto, pero no se detalla el tamaño de cada checkpoint ni el overhead de activaciones.
- Almacenamiento: 4,0 GB para todos los checkpoints; 2,6 GB si se excluyen los archivos `*_train_state.pt`.
- Opciones de despliegue: `evaluate.py` del repositorio con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; dependen del número de iteraciones (`max_iter_eval` o `halt_max_steps`), del lote y del hardware.
- Reanudación de entrenamiento: requiere `step_<N>_train_state.pt`; `sfprm-arc-step518065` no incluye ese archivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mini-ARC pass@1/pass@2 | Otras métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SFPRM | no disponible | no disponible | 59,1 % / 59,7 % | Sudoku 96,58 %; Maze 87,9 %; ARC-AGI-1 41,25 %/46,62 % | MIT | Checkpoints en el repositorio HF |
| FPRM | no disponible | no disponible | 55,0 % / 62,4 % | Maze 83,9 % | no disponible (repositorio MIT) | Checkpoints en el mismo repositorio |
| HRM | no disponible | no disponible | 51,7 % / 58,4 % | no disponible | no disponible (repositorio MIT) | Checkpoints en el mismo repositorio |
| EqR | no disponible | no disponible | 40,3 % / 49,7 % | no disponible | no disponible (repositorio MIT) | Checkpoints en el mismo repositorio |
| TRM | no disponible | no disponible | 36,9 % / 45,0 % | no disponible | no disponible (repositorio MIT) | Checkpoints en el mismo repositorio |

No se publican recuentos de parámetros ni longitudes de contexto para ninguno de estos modelos en la información disponible. Las puntuaciones de Mini-ARC corresponden a votos de un solo checkpoint con tope de rollout de 200 y no deben compararse directamente con resultados oficiales de otros leaderboards.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no se documentan conversación, tool calling, function calling, agentes, visión, audio ni soporte multilingüe.
- Las métricas no son perfectas: 96,58 % en Sudoku, 87,9 % en Maze y 41,25 %/46,62 % en ARC-AGI-1 implican errores residuales en todas las tareas.
- Los resultados de ARC-AGI-1 son pass@K registrados durante el entrenamiento y votos pooled, no una evaluación independiente en leaderboard.
- Las puntuaciones de Mini-ARC usan votos de un solo checkpoint y un tope de rollout de 200; pequeños cambios de protocolo pueden alterar la comparación.
- No se documentan la composición de los datos de entrenamiento ni posibles sesgos; la generalización fuera de Sudoku, Maze y ARC no está demostrada.
- La licencia MIT permite uso comercial, modificación y redistribución siempre que se incluya el aviso de copyright y la licencia, sin garantía. No se detalla la licencia de los datasets subyacentes.
- El formato de pesos no es safetensors ni GGUF; la evaluación requiere el código del repositorio, PyTorch y la construcción previa de los datasets.
- La evaluación no es plug-and-play: hay que seguir el README del repositorio y descargar los checkpoints correctos.
- `sfprm-arc-step518065` no incluye `train_state`, por lo que no se puede reanudar el entrenamiento desde ese checkpoint.
- Para evaluar hay que usar `step_<N>` y no el bundle de reanudación; en todos los casos salvo HRM, esos pesos son EMA.

## Enlaces

- HuggingFace: https://huggingface.co/arberzela/sfprm
- GitHub con código, configuraciones, datasets y comandos de evaluación: https://github.com/arberzela/sfprm
- Cita BibTeX: incluida en la model card; no se proporciona un enlace independiente al paper.
