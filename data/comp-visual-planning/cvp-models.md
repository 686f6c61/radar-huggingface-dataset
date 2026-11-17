# comp-visual-planning/cvp-models

## Resumen

Compositional Visual Planning (CVP) es un conjunto de modelos preentrenados publicados por el grupo comp-visual-planning que implementa el metodo descrito en el articulo "Compositional Visual Planning via Inference-Time Diffusion Scaling" (arXiv:2603.02646). No se trata de un unico modelo de lenguaje, sino de un sistema de planificacion robotica compuesto por planificadores de difusion de video, modelos de dinamica inversa y los tokenizadores de imagen de NVIDIA necesarios para operar sobre latentes visuales.

El sistema aborda el problema de generar planes visuales de largo horizonte para tareas de manipulacion robotica mediante el escalado en tiempo de inferencia de modelos de difusion. Para cada una de las cuatro tareas del benchmark SAPIEN (cube, drawer, puzzle y tool) se publica un planificador DiT que genera clips de 16 fotogramas sobre los latentes del Cosmos Tokenizer, un modelo de dinamica inversa que predice la accion entre dos latentes consecutivos y el rango de acciones para normalizarlas.

Es relevante porque propone una via de planificacion composicional que combina generacion de video por difusion con modelos ligeros de accion, sin requerir un unico modelo monolitico entrenado de extremo a extremo. El repositorio ocupa 9,8 GB e incluye pesos en formato de checkpoints de PyTorch (`.ckpt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para planificacion de video; modelo de dinamica inversa con embed_dim 384; tokenizador Cosmos-0.1-Tokenizer-CI16x16 |
| Parametros totales | no disponible (el autor no publica el recuento; los ficheros van de 1,0 GB a 3,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de 16 fotogramas; cada fotograma es un latente Cosmos de (16, 16, 16) derivado de una imagen de 256x256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de planificacion visual y robotica, no linguistico) |
| Licencia | MIT para planificadores, modelos de dinamica inversa y rangos de accion; NVIDIA Open Model License para los ficheros de `cosmos/Cosmos-Tokenizer-CI16x16/` |
| Formato de pesos | checkpoints de PyTorch (`.ckpt`) con claves `model` y `model_ema`; tokenizador en `.jit` |

## Arquitectura y entrenamiento

Los planificadores son DDPM que predicen x0 con 500 pasos de difusion de ruido coseno. Cada uno procesa clips de 16 fotogramas, donde cada fotograma corresponde al latente (16, 16, 16) del Cosmos Tokenizer aplicado a una imagen de 256x256, escalado por 0,5. La tarea cube usa un DiT de 16 bloques, anchura 1024 y 16 cabezas tras 100k pasos de gradiente; drawer emplea la misma configuracion tras 460k pasos; puzzle escala a 24 bloques con anchura 1024 y 16 cabezas tras 60k pasos; y tool usa una configuracion mas pequena de 12 bloques, anchura 768 y 12 cabezas tras 220k pasos. Cada fichero contiene tanto los pesos online como los EMA.

El modelo de dinamica inversa, con embed_dim 384, se entrena durante 60k pasos de gradiente (40k en la tarea tool) para predecir la accion entre dos fotogramas latentes consecutivos. Las acciones son de 8 dimensiones y se normalizan con los minimos y maximos por dimension almacenados en `actions_minmax.json`. El tokenizador Cosmos se incluye sin modificar, con su aviso y licencia originales. La innovacion principal del trabajo es el escalado en tiempo de inferencia de la difusion para planificacion composicional, comparado en el codigo con la linea base DiffCollage / Generative Skill Chaining.

## Capacidades

- Generacion de planes visuales de video para tareas de manipulacion robotica en cuatro entornos SAPIEN: cube, drawer, puzzle y tool.
- Planificacion composicional mediante escalado en tiempo de inferencia de modelos de difusion.
- Prediccion de acciones a partir de pares de fotogramas latentes consecutivos mediante el modelo de dinamica inversa.
- Operacion sobre latentes visuales del Cosmos Tokenizer, lo que reduce el coste computacional frente a trabajar en espacio de pixeles.
- Integracion con un pipeline de evaluacion reproducible (`eval.py`) que permite comparar con la linea base GSC.
- No dispone de capacidades linguisticas, tool calling, agentes conversacionales ni procesamiento de audio.

## Casos de uso

- Planificacion de manipulacion robotica en simulacion: el sistema genera secuencias visuales de 16 fotogramas que sirven como plan para tareas como abrir un cajon o resolver un puzzle, y el modelo de dinamica inversa traduce esas secuencias en acciones ejecutables de 8 dimensiones.
- Investigacion en planificacion por difusion: el repositorio permite reproducir los experimentos del articulo y comparar el escalado en tiempo de inferencia con la linea base DiffCollage / Generative Skill Chaining usando `python eval.py env=cube method=cvp` y `method=gsc`.
- Evaluacion de tokenizadores visuales en robotica: al operar sobre latentes Cosmos de 16x16x16, sirve para estudiar el impacto de la compresion visual en la calidad de los planes generados.
- Desarrollo de modelos de dinamica inversa: el checkpoint `invdyn.ckpt` (1,3 MB) puede reutilizarse o fine-tunearse para predecir acciones entre pares de latentes en nuevas tareas.
- Benchmarking de planificadores composicionales: las cuatro tareas SAPIEN permiten medir la degradacion del plan al aumentar el horizonte y evaluar el escalado de inferencia.
- Base para transferencia a robotica real: los planes visuales y las acciones normalizadas pueden servir como punto de partida para politicas de control, aunque requeririan adaptacion al entorno fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los planificadores ocupan entre 1,0 GB (tool) y 3,7 GB (puzzle) en disco; el tokenizador Cosmos anade 163 MB. La inferencia con 500 pasos de difusion sobre clips de 16 fotogramas requiere VRAM adicional no documentada.
- GPU recomendadas: no disponible. Por el tamano de los checkpoints y el uso de difusion sobre latentes, se necesita una GPU con soporte CUDA; no se especifican modelos concretos.
- Ajuste en GPU de consumo: no confirmado. El planificador tool (1,0 GB) y el de cube/drawer (2,5 GB) podrian caber en GPUs de consumo con suficiente VRAM, pero el autor no lo documenta.
- Opciones de despliegue: el codigo de referencia usa PyTorch y el script `eval.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CVP (este modelo) | DiT de difusion para planificacion visual + dinamica inversa | no disponible | clips de 16 fotogramas | MIT + NVIDIA Open Model License | Hugging Face, 9,8 GB |
| DiffCollage / Generative Skill Chaining (GSC) | Linea base de planificacion composicional | no disponible | no disponible | no disponible | Referenciada en el codigo del proyecto |
| Cosmos-0.1-Tokenizer-CI16x16 | Tokenizador de imagen | no disponible | no aplica | NVIDIA Open Model License | Hugging Face (nvidia) |

No se dispone de datos de rendimiento comparativo entre CVP y las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en cuatro tareas SAPIEN concretas (cube, drawer, puzzle, tool); no es un modelo generalista y no se ha validado en otros entornos.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni conversacion, y no tiene capacidades multilingues.
- Los pesos se distribuyen como checkpoints de PyTorch (`.ckpt`), no en safetensors ni GGUF, lo que complica el despliegue con herramientas estandar de inferencia.
- La licencia es mixta: MIT para los planificadores y modelos de dinamica inversa, pero NVIDIA Open Model License para los ficheros del tokenizador Cosmos, con condiciones adicionales para uso comercial.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no se puede verificar el rendimiento real frente a la linea base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion visual: al ser un modelo generativo de difusion, los planes pueden contener secuencias fisicamente inconsistentes que el modelo de dinamica inversa traducira en acciones invalidas.
- No se documentan sesgos, limitaciones de contexto mas alla de los 16 fotogramas ni requisitos de hardware, lo que dificulta su uso en produccion sin trabajo adicional de validacion.

## Enlaces

- Hugging Face: https://huggingface.co/comp-visual-planning/cvp-models
- Articulo: https://arxiv.org/abs/2603.02646
- Pagina del proyecto: https://comp-visual-planning.github.io/
- Codigo: https://github.com/yzhang4179/comp_visual_planning_release
- Tokenizador Cosmos: https://huggingface.co/nvidia/Cosmos-0.1-Tokenizer-CI16x16
- Licencia NVIDIA Open Model: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
