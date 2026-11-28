# SlayerLab/Slayer1B-1.10-checkpoints

## Resumen

Slayer1B-1.10-checkpoints es un repositorio de puntos de control intermedios (checkpoints) del modelo de lenguaje Slayer1B 1.10, desarrollado por SlayerLab. No se trata de un modelo final, sino de un conjunto de pesos guardados durante el entrenamiento del modelo base Slayer1B 1.10, organizados en carpetas por número de actualización. El modelo es de tipo base (completado de texto), no un modelo de chat, con aproximadamente 1.074 millones de parámetros en precisión float32.

El repositorio recoge la primera fase del entrenamiento de la versión 1.10, que continúa desde Slayer1B 1.09 en la actualización 95.000. Esta fase entrena sobre unos 10.000 millones de tokens en polaco e inglés, distribuidos en diez franjas de datos iguales de 953 actualizaciones cada una, con 1.048.576 tokens por actualización. El autor indica que una segunda fase de entrenamiento continuará desde la actualización 9.530 con nuevos datos, y que sus checkpoints se añadirán al mismo repositorio.

La relevancia de este repositorio es fundamentalmente práctica para investigación: permite analizar la evolución del modelo checkpoint a checkpoint, reproducir evaluaciones intermedias y estudiar la dinámica de entrenamiento. Al estar publicado bajo licencia Apache-2.0 y con pesos en safetensors, es directamente utilizable para experimentación. No obstante, al tratarse de pesos intermedios de un modelo base en entrenamiento, no está pensado para despliegue en producción ni para tareas conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el config.json contiene la arquitectura, pero no se detalla en la informacion proporcionada) |
| Parametros totales | 1.073.912.851 (float32) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32), con tokenizer.json, config.json y scripts de carga en Python |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, mecanismos de atencion, etc.); el config.json de cada checkpoint contiene la arquitectura, pero su contenido no se especifica en la model card. Lo que si se documenta es el proceso de entrenamiento: la versión 1.10 continúa desde Slayer1B 1.09 en la actualización 95.000 y entrena sobre aproximadamente 10.000 millones de tokens en polaco e inglés, en diez franjas de datos iguales de 953 actualizaciones, con un tamano de lote de 1.048.576 tokens por actualización.

El tokenizador tiene 32.768 tokens, con el id 0 reservado para fin de texto. Los pesos se exportan en float32 y cada checkpoint incluye el código del modelo (load_slayer.py) y el script de entrenamiento de referencia (train_gpt_ref_r23.py), los mismos que en las versiones 1.06-1.08. El autor afirma que los datos de entrenamiento no contienen material no comercial, y que los pesos de cada carpeta son byte a byte idénticos a los evaluados por su panel de evaluación para ese checkpoint. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un modelo base.

## Capacidades

- Generacion de texto por completado (modelo base, no instruido ni conversacional).
- Capacidades multilingues limitadas a polaco e ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode), vision ni audio.
- El modelo incluye un tokenizador propio y scripts de carga para inferencia en CPU con PyTorch.
- Al ser checkpoints intermedios, las capacidades varían y mejoran progresivamente a lo largo del entrenamiento.

## Casos de uso

- Investigacion de dinamica de entrenamiento: comparar el rendimiento y la perdida entre checkpoints consecutivos (step-00953, step-01906, etc.) para estudiar como evoluciona el modelo con cada franja de datos, usando la tabla de benchmarks publicada en el Space de SlayerLab.
- Reproducibilidad de evaluaciones: al ser los pesos byte a byte idénticos a los evaluados por el panel del autor, permiten verificar y replicar los resultados intermedios publicados.
- Desarrollo de modelos en polaco: servir como base de partida o referencia para experimentos de continuacion de preentrenamiento o ajuste fino en tareas de procesamiento del lenguaje natural en polaco.
- Estudio de mezcla de datos bilingue: analizar el efecto de las diez franjas de datos iguales sobre el comportamiento del modelo en polaco e inglés.
- Educacion y docencia: usar los checkpoints y los scripts de carga (load_slayer.py) como material didactico para explicar el ciclo de vida del preentrenamiento de un transformer de aproximadamente 1.000 millones de parametros.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de safetensors, tokenizacion y ejecucion en CPU o GPU con un modelo de tamano moderado y licencia permisiva.
- Base para ajuste fino supervisado: partir de un checkpoint intermedio o final de la primera fase para tareas especificas, aunque con la cautela de que el modelo sigue en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tabla de benchmarks por checkpoint en el Space de SlayerLab (seccion "1.10 checkpoint by checkpoint") y a las curvas de perdida y evaluacion en Track, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 4,3 GB solo para los pesos (1.073.912.851 parametros x 4 bytes), mas memoria para activaciones, cache de atencion y el tokenizador; en la practica se recomienda al menos 6-8 GB de VRAM en GPU o suficiente RAM en CPU.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060/4060, RTX 4070, RTX 4090, A100 o H100; el modelo es pequeno para su categoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 8 GB o mas; tambien puede ejecutarse en CPU, como muestra el ejemplo de la model card (float32, modo eval, CPU).
- Opciones de despliegue: el repositorio proporciona carga directa con PyTorch mediante load_slayer.py y el tokenizador de la libreria tokenizers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF, la cuantizacion requeriria conversion propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Slayer1B 1.10 (checkpoints) | 1.073.912.851 | no disponible | pl, en | Apache-2.0 | Checkpoints intermedios de un modelo base en entrenamiento |
| Slayer1B 1.10 (modelo base) | no disponible en la informacion | no disponible | pl, en | Apache-2.0 | Modelo base de referencia del que proceden estos checkpoints |
| Slayer1B 1.09 | no disponible en la informacion | no disponible | pl, en | no disponible en la informacion | Version anterior, punto de partida en la actualizacion 95.000 |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas externas en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Son checkpoints intermedios de un modelo en entrenamiento activo: el rendimiento es inferior al del modelo final y puede variar entre actualizaciones.
- Es un modelo base de completado de texto, no un modelo de chat ni instruido; no sigue instrucciones de forma fiable.
- Idiomas limitados a polaco e ingles; no se documenta soporte de castellano ni de otros idiomas.
- No se dispone de informacion sobre longitud de contexto, sesgos conocidos ni tasas de alucinacion; al ser un modelo base, el riesgo de generacion de contenido incorrecto o incoherente es inherente.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el autor senala que los datos de entrenamiento no contienen material no comercial; conviene revisar las fuentes y licencias de datos en Slayer1B-Dataset antes de un uso comercial.
- No se documentan tecnicas de alineacion (RLHF/DPO), por lo que no hay garantias de comportamiento seguro o alineado.
- No se ofrecen pesos cuantizados ni integracion con frameworks de servido de alto rendimiento; el despliegue en produccion requeriria trabajo adicional.
- La fecha de creacion del repositorio (2026-11-28) y el estado "training in progress" implican que el contenido puede cambiar con nuevos checkpoints.

## Enlaces

- Repositorio de checkpoints en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.10-checkpoints
- Modelo base Slayer1B 1.10: https://huggingface.co/SlayerLab/Slayer1B-1.10
- Dataset Slayer1B-Dataset: https://huggingface.co/datasets/SlayerLab/Slayer1B-Dataset
- Space con benchmarks por checkpoint: https://huggingface.co/spaces/SlayerLab/Slayer1B
- Curvas de entrenamiento en Track: https://track.fabryka.ai/run/8f40100b-93b7-588b-9cdc-12ee6f1e0a70
