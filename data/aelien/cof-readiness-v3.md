# Aelien/cof-readiness-v3

## Resumen

`Aelien/cof-readiness-v3` es un conjunto de checkpoints y datos de entrenamiento (LMDB) generados durante una depuración de tres tareas de razonamiento visual construidas con GPT, pertenecientes al proyecto `mianwu01/COF-maze`. El modelo se basa en el generador de difusión de video causal Wan2.1-T2V-1.3B, adaptado con la técnica de *causal-forcing* (AR, I2V) para resolver problemas de sudoku 9x9, sliding puzzle 3x3 y tangram mediante generación de secuencias de video latente.

El repositorio, publicado por el autor Aelien bajo licencia Apache-2.0, contiene checkpoints intermedios y finales de entrenamiento, así como los datos de razonamiento en formato de latents VAE fp16. Su relevancia radica en que documenta el proceso de depuración de los *readiness gates* (criterios de preparación) de un sistema de razonamiento visual basado en difusión, incluyendo informes de análisis y un parche de modificaciones al entrenador. No es un modelo de lenguaje ni un producto listo para producción, sino un artefacto de investigación para evaluar la viabilidad de resolver tareas de razonamiento simbólico con generadores de video causales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.1-T2V-1.3B causal (AR, I2V) con Causal-Forcing |
| Parametros totales | 1.3B (segun denominacion del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (video-diffusion; forma de tensor `[1,21,16,60,104]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`model.pt` con `generator` y `generator_ema`; `trainer.pt` con estado de optimizador) |

## Arquitectura y entrenamiento

El modelo es un generador de difusion de video causal basado en Wan2.1-T2V-1.3B, adaptado con la tecnica de *causal-forcing* para permitir generacion autoregresiva de frames condicionada a una imagen inicial (I2V). La forma del tensor de salida `[1,21,16,60,104]` indica 21 frames, 16 canales latentes y resolucion espacial de 60x104 en el espacio VAE. El entrenamiento se realizo con la receta v3, partiendo del checkpoint publico `Aelien/COF-maze-checkpoints/maze_ar_cont/checkpoint_model_001500`.

Los datos de entrenamiento consisten en LMDB con latents VAE en fp16, 256 filas por tarea, con mascaras de accion integradas. Se incluyen tres tareas: sudoku 9x9 con endpoint oculto, sliding puzzle 3x3 y tangram. El entrenador incorpora un parche de modificaciones (*causal-forcing-changes/modifications.patch*) que anade controles de perdida de la variante *remediation-v3*. Los informes en el repositorio documentan por que fallaron los *readiness gates* y como continuar el entrenamiento en un cluster.

## Capacidades

- Generacion de secuencias de video latente para resolver tareas de razonamiento visual simbolico.
- Resolucion de sudoku 9x9: en la evaluacion dev8 (seed 101) se obtuvo 1/8 soluciones exactas, con 50-63% de progreso valido y 8/8 pistas correctas.
- Resolucion de sliding puzzle 3x3: 81% de movimientos legales, 83% de estados validos y una media de 4.6 movimientos en la medicion de pico (256 muestras).
- Soporte de reanudacion exacta del entrenamiento mediante `trainer.pt` (estado de optimizador, datos y RNG).
- No es un modelo de lenguaje: no dispone de tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion en razonamiento visual con difusion de video: el modelo permite estudiar si un generador causal de video puede resolver tareas simbolicas como sudoku o puzzles, comparando progreso valido y legalidad de movimientos.
- Evaluacion de *readiness gates* en pipelines de entrenamiento: los checkpoints y scripts (`eval_chain.sh`) sirven para reproducir los criterios de preparacion y depurar fallos en sistemas de razonamiento visual.
- Desarrollo de tecnicas de *causal-forcing*: el parche de modificaciones y las configuraciones YAML documentan como aplicar controles de perdida especificos para estabilizar el entrenamiento.
- Reanudacion de entrenamiento en cluster: los puntos de reanudacion exacta (`trainer.pt`) permiten continuar el entrenamiento desde un estado intermedio sin perder progreso.
- Generacion de datos sinteticos de razonamiento: los LMDB con latents VAE y mascaras de accion pueden reutilizarse para entrenar otros modelos de difusion o como referencia para generar nuevos datasets.
- Analisis de limitaciones de modelos de difusion para razonamiento: los informes incluidos documentan los fallos y las correcciones aplicadas, utiles para investigadores que trabajen con arquitecturas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un LLM sino un generador de video de difusion. Los unicos datos de rendimiento disponibles son los de las evaluaciones internas de las tareas de razonamiento:

| Tarea | Checkpoint | Resultado (seed 101) |
|---|---|---|
| Sudoku 9x9 (endpoint oculto) | `global_1985` | 1/8 exacto, 50% progreso valido, 8/8 pistas |
| Sudoku 9x9 (mejor progreso) | `global_1697` | 1/8 exacto, 63% progreso valido, 50% legal |
| Sliding 3x3 (pico medido) | `step_000600` | 81% legal, 83% estado valido, 4.6 movimientos |
| Sliding 3x3 (1024 muestras) | `step_001200` | evaluaciones pendientes |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El tamano del repositorio es de 22.7 GB, lo que sugiere que los checkpoints completos (modelo + optimizador) requieren al menos 24 GB de VRAM para cargar en memoria, aunque la inferencia con un solo checkpoint podria caber en GPUs con 16 GB.
- GPU recomendadas: no especificadas. Dado el tamano del modelo (1.3B) y la naturaleza de difusion de video, una GPU con al menos 16 GB de VRAM (RTX 4080/4090, A100 40GB) seria adecuada para inferencia; el entrenamiento con optimizador requeriria mas memoria.
- Compatibilidad con GPUs de consumo: probablemente si en gama alta (RTX 3090/4090) para inferencia, pero no confirmado.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El proyecto proporciona scripts propios (`eval_chain.sh`, `run_segments.sh`) para evaluacion y continuacion del entrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (generadores de video de difusion causal para razonamiento visual simbolico). El modelo base Wan2.1-T2V-1.3B es un generador de texto-a-video generalista, pero la adaptacion con *causal-forcing* para tareas de puzzles es especifica de este proyecto. No se puede establecer una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- Rendimiento limitado en las tareas objetivo: en sudoku solo se logra 1/8 soluciones exactas, y en sliding puzzle la media de movimientos es de 4.6, lo que indica que el modelo no resuelve de forma fiable los problemas planteados.
- Modelo experimental: los checkpoints son artefactos de una depuracion de *readiness gates*, no un modelo final pulido. No es adecuado para uso en produccion.
- Sin documentacion de sesgos ni evaluacion de seguridad: al ser un modelo de difusion de video, no se han analizado sesgos sociales ni riesgos de contenido.
- Datos de entrenamiento limitados: solo 256 filas por tarea en los LMDB, lo que restringe la generalizacion.
- Restricciones de redistribucion: el dataset relacionado `Aelien/cof-formal-collab-data` indica que es un handoff interno de investigacion y que no debe hacerse publico sin una revision de redistribucion de datos. Aunque el modelo en si tiene licencia Apache-2.0, los datos asociados pueden tener restricciones adicionales.
- Dependencia de infraestructura: la continuacion del entrenamiento requiere un cluster, segun el informe de handoff, lo que limita la reproducibilidad en entornos modestos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aelien/cof-readiness-v3
- Repositorio de codigo y configuraciones: `mianwu01/COF-maze` (rama `review/cof-6k-snapshot-20260825`, commit `fbee115`)
- Checkpoints base: `Aelien/COF-maze-checkpoints/maze_ar_cont/checkpoint_model_001500`
- Dataset relacionado: https://huggingface.co/datasets/Aelien/cof-formal-collab-data
