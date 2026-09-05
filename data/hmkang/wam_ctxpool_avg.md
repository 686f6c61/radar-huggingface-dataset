# hmkang/wam_ctxpool_avg

## Resumen

El modelo `hmkang/wam_ctxpool_avg` es un fine-tuning de Wan2.2-TI2V-5B, un Diffusion Transformer (DiT) de vídeo de 5.000 millones de parámetros, adaptado al entorno de robótica RoboCasa (cocina). El autor, `hmkang`, lo presenta como un *video world model* para tareas de robótica, con una técnica de *context pooling* que promedia los frames latentes pasados e inserta el resultado antes de una capa concreta del transformador. El repositorio contiene dos variantes: una con el pooling insertado en la capa 12 y otra en la capa 3, con checkpoints guardados cada 20.000 pasos.

El objetivo del modelo es proporcionar un componente de modelado del mundo para agentes robóticos en entornos simulados de cocina. La relevancia actual radica en la investigación de arquitecturas de vídeo DiT con memoria de contexto, combinando modelos generativos de vídeo con representaciones temporales explícitas. Los pesos se distribuyen en formato `safetensors` bajo licencia Apache-2.0, con un tamaño de repositorio de 31,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B video DiT (Diffusion Transformer) |
| Parametros totales | 5B (segun la nomenclatura del modelo) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un Diffusion Transformer de vídeo que procesa secuencias de frames latentes. Se ha realizado un fine-tuning sobre el dataset RoboCasa, un entorno de simulación de cocina robótica, utilizando la receta base del proyecto. El entrenamiento emplea un batch efectivo de 64, distribuido en 4 GPUs con 8 muestras por dispositivo y 2 pasos de acumulación de gradientes.

La innovación técnica principal es el módulo de *context pooling*: se calcula el promedio de los frames latentes de la historia (cuatro frames, denominados en el README como "4-latin history") y dicho promedio se inserta antes de una capa elegida del transformador (capa 12 o capa 3, según la variante). La configuración temporal del modelo usa `nin=25` frames de entrada y `nout=41` frames de salida, con un factor `fdf=2` (probablemente *frame downsampling factor*). Los checkpoints se almacenan cada 20.000 pasos.

El repositorio incluye únicamente los pesos en `safetensors`, el `config.json` y la configuración del procesador y del experimento. No se incluyen el estado del optimizador ni `training_args.bin`, por lo que no es posible reanudar el entrenamiento directamente desde estos checkpoints.

## Capacidades

- Generación y procesamiento de vídeo orientado a modelado del mundo en entornos robóticos, específicamente en escenas de cocina RoboCasa.
- Uso de contexto temporal mediante *context pooling* con promedio de frames latentes pasados, lo que permite condicionar la generación en una historia de cuatro frames.
- Configuración de vídeo longitudinal: 25 frames de entrada y 41 frames de salida.
- Soporte para dos variantes de arquitectura: pooling antes de la capa 12 o antes de la capa 3, permitiendo comparar el efecto de la posición del módulo de contexto.
- No se ha documentado soporte de *tool calling*, *function calling*, razonamiento simbólico, generación de código o capacidades multimodales de texto.
- No se han publicado datos sobre idiomas; al ser un modelo de vídeo, no está pensado para generación de texto.

## Casos de uso

- Modelado de mundo para robótica de cocina: el modelo puede predecir vídeos futuros de una escena RoboCasa a partir de los cuatro frames de historia, proporcionando una señal de transición de estado útil para la planificación de movimientos.
- Generación de datos sintéticos de entrenamiento: las trayectorias de vídeo generadas pueden usarse para aumentar conjuntos de datos de políticas robóticas en entornos simulados, especialmente cuando las demostraciones reales son escasas.
- Investigación en representaciones de contexto: las dos variantes (capa 3 y capa 12) permiten estudiar cómo la profundidad de inserción del pool afecta a la coherencia temporal y a la precisión de la predicción.
- Evaluación de *video world models* con memoria explícita: el modelo sirve como punto de partida para medir el impacto del promedio de latents frente a otras estrategias de *context pooling*.
- Entrenamiento de agentes en simulación: al ser un *world model*, puede integrarse en bucles de aprendizaje por refuerzo para imaginar las consecuencias de acciones en el entorno de cocina y mejorar la eficiencia de muestreo.
- Base para fine-tuning en dominios afines: los checkpoints pueden adaptarse a otros entornos domésticos o tareas robóticas con requisitos de contexto similar, aprovechando los pesos preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no especificada.
- Opciones de despliegue: no disponibles; el repositorio no incluye instrucciones de inferencia ni integraciones con frameworks como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible.

## Limitaciones y advertencias

- Es un repositorio de investigación: los valores de descargas y likes son ambos 0, lo que indica que no ha sido validado en producción ni por la comunidad.
- Solo se distribuyen los pesos y la configuración; al faltar el estado del optimizador y `training_args.bin`, la reanudación del entrenamiento desde estos checkpoints no es directa.
- El ámbito del modelo se limita al dominio RoboCasa kitchen; la generalización a otros entornos robóticos o a escenas del mundo real no está evaluada.
- No se ha documentado la evaluación de sesgos, alucinaciones o comportamientos indeseados.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse las licencias de los componentes base (Wan2.2-TI2V-5B y RoboCasa) para asegurar el cumplimiento.
- La configuración temporal de contexto, con solo cuatro frames de historia, puede resultar insuficiente para tareas que requieran dependencias de largo plazo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hmkang/wam_ctxpool_avg
- Código de entrenamiento: https://github.com/HEMMO0208/wam
- Script específico de fine-tuning: https://github.com/HEMMO0208/wam/blob/run_scripts/train/wam_dit4dit/compression/finetune_wam_dit4dit_robocasa_kitchen_ctxpool.sh
