# sengel19/mdm-sudoku-checkpoints

## Resumen

`mdm-sudoku-checkpoints` es una coleccion de checkpoints publicados por el usuario `sengel19` como material de un proyecto de curso (CS2243) sobre modelos de difusion enmascarada (masked diffusion models, MDM) aplicados a Sudoku. El foco del trabajo es el estudio del orden de desenmascaramiento y la calibracion de confianza en este tipo de modelos generativos no autorregresivos. No se trata de un modelo de proposito general, sino de un artefacto de investigacion con pesos entrenados especificamente para resolver y analizar tableros de Sudoku.

Todos los checkpoints se basan en la arquitectura GPT-2 de 6 millones de parametros del codigo de Ye et al. (`diffusion-vs-ar`), adaptada como MDM, y se entrenan sobre distintos conjuntos de datos de Sudoku (el de Ye et al. con 100k tableros y el de Shah et al. con 1.8M). El repositorio incluye modelos base, fine-tunes sobre puzzles ambiguos y una campaña de auto-correccion con corrupcion de digitos visibles. El tamano del repo es de 8.9 GB, lo que refleja la acumulacion de multiples checkpoints y estados de optimizador.

Su relevancia es acotada pero clara para quien investigue generacion iterativa no autorregresiva, calibracion en MDM o metodos de auto-correccion en tareas de restricciones (constraint satisfaction). No es un modelo para produccion ni para tareas de lenguaje natural. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 adaptado a masked diffusion model (MDM) |
| Parametros totales | 6 millones (6M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin GGUF ni safetensors) |
| Idiomas soportados | no disponible (dominio restringido a tableros de Sudoku) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), mas estados de entrenador (`optimizer.pt`, `scheduler.pt`, `rng_state.pth`, `training_args.bin`) |
| Tamano del repositorio | 8.9 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es el modelo GPT-2 de 6M de parametros del repositorio `diffusion-vs-ar` de Ye et al., reutilizado como masked diffusion model. En un MDM, el modelo aprende a predecir tokens enmascarados de forma iterativa, sin orden autorregresivo fijo, lo que permite estudiar politicas de desenmascaramiento. El proyecto se centra precisamente en ese orden de desenmascaramiento y en la calibracion de la confianza asociada a cada prediccion.

El entrenamiento se organiza en varias campañas. La campaña `01_sudoku_baselines` entrena modelos base sobre el dataset de Ye et al. (100k tableros) y sobre el de Shah et al. (1.8M tableros); el modelo `kim_shah_mdm_tiny_seed42` (checkpoint-204000) se usa como base para las campañas posteriores. La campaña `03_sudoku_ambiguous_training` aplica fine-tunes de 20k pasos en un diseno 2x2 que cruza datos (`mixed`, con un 50% de puzzles infra-restringidos y objetivos uniformes sobre digitos validos, frente a `uniq`, solo puzzles con solucion unica) con funcion de perdida (focal, la de Ye et al., frente a entropia cruzada simple). La campaña `06_sudoku_self_correction_oracle` anade variantes de auto-correccion que introducen digitos visibles erroneos durante el entrenamiento o perdidas sobre celdas visibles, con el objetivo de que el modelo aprenda a dudar de celdas ya comprometidas. El autor advierte que los modelos `kim_shah_*` son un reentrenamiento propio del setup de Kim et al. (2025) y no los pesos originales de dicho trabajo, y que se entrenaron durante 234.375 pasos frente a los aproximadamente 4,2M que reportan los autores originales.

## Capacidades

- Resolucion de tableros de Sudoku mediante generacion iterativa con desenmascaramiento.
- Modelado de distribuciones sobre digitos validos en puzzles infra-restringidos (variantes `mixed`).
- Calibracion de confianza por celda, objeto central del proyecto.
- Auto-correccion: deteccion y revision de digitos visibles potencialmente erroneos en las variantes de la campaña 06.
- Analisis del orden de desenmascaramiento y su efecto en la calidad de la solucion.
- No soporta tool calling, function calling ni razonamiento multi-paso general.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo `thinking` ni de decodificacion especulativa documentada.

## Casos de uso

- Investigacion en masked diffusion models: usar los checkpoints como linea base reproducible para estudiar politicas de desenmascaramiento sobre una tarea con solucion verificable.
- Estudio de calibracion: comparar la confianza predicha por celda entre las variantes `focal` y `ce`, y entre `mixed` y `uniq`, para analizar como la funcion de perdida afecta a la calibracion.
- Analisis de auto-correccion: evaluar las variantes `ft_switch_ce`, `ft_own_ce`, `ft_roll_ce` y `ft_self_ce` para medir la capacidad del modelo de revisar celdas ya comprometidas.
- Reproduccion de experimentos docentes: el repositorio incluye `DEVIATIONS.md` y logs de entrenamiento, lo que facilita replicar las campañas en un entorno de curso o laboratorio.
- Benchmark de robustez ante ruido: las variantes con corrupcion de digitos visibles permiten medir la degradacion de la exactitud en funcion de la tasa de error inyectado (0,1 frente a 0,02).
- Estudio de datos ambiguos: la variante `mixed` sirve para analizar como se comporta un MDM cuando el objetivo no es una solucion unica sino una distribucion uniforme sobre digitos validos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (6M de parametros, del orden de decenas de MB en fp32 para los pesos puros); el repositorio completo ocupa 8,9 GB por la acumulacion de checkpoints y estados de optimizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con unos pocos GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: carga directa con PyTorch mediante `load_model(ckpt_dir)` del repositorio del proyecto; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sengel19/mdm-sudoku-checkpoints` | 6M | no disponible | Sudoku (MDM) | MIT | Hugging Face |
| MDM de Ye et al. (`diffusion-vs-ar`) | 6M | no disponible | Sudoku (MDM) | no disponible en la informacion | Repositorio de codigo de los autores |
| Setup de Kim et al. (2025) | no disponible | no disponible | Sudoku (MDM) | no disponible en la informacion | Pesos originales no incluidos aqui |
| Dataset de Shah et al. (1.8M puzzles) | no aplica | no aplica | Datos de Sudoku | no disponible en la informacion | Referenciado como fuente de datos |

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo resuelve Sudoku; no es utilizable para lenguaje natural, codigo ni tareas generales.
- Los modelos `kim_shah_*` son un reentrenamiento propio y no los pesos oficiales de Kim et al.; ademas se entrenaron con muchas menos iteraciones (234.375 frente a ~4,2M), por lo que no son directamente comparables con los resultados publicados por dichos autores.
- Riesgo de alucinacion: en puzzles infra-restringidos el modelo puede producir soluciones no unicas o inconsistentes; la variante `mixed` esta disenada precisamente para modelar esa ambiguedad.
- No hay informacion sobre sesgos, idiomas ni evaluacion de robustez fuera del dominio de Sudoku.
- Formato de pesos exclusivamente PyTorch (`pytorch_model.bin`), sin versiones GGUF ni safetensors, lo que limita su uso en runtimes ligeros.
- Sin pipeline declarado ni descargas ni likes en el momento de la consulta; soporte comunitario practicamente nulo.
- Licencia MIT: permite uso comercial, pero el modelo carece de utilidad comercial fuera de investigacion o docencia.
- Los checkpoints incluyen estados de entrenador, lo que infla el repositorio y complica su despliegue ligero.

## Enlaces

- Hugging Face: https://huggingface.co/sengel19/mdm-sudoku-checkpoints
- Codigo del proyecto (referenciado en la model card, ruta `analysis/campaigns/01_sudoku_baselines/scripts/mdm.py`): no disponible como URL publica en la informacion proporcionada.
- Repositorio `diffusion-vs-ar` de Ye et al.: no disponible como URL en la informacion proporcionada.
- Paper de Kim et al. (2025): no disponible como URL en la informacion proporcionada.
- Dataset de Shah et al. (1.8M puzzles): no disponible como URL en la informacion proporcionada.
