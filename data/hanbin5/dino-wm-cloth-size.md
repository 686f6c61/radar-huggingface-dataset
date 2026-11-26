# hanbin5/dino-wm-cloth-size

## Resumen

DINO-WM (cloth size) es una coleccion de checkpoints de modelos del mundo (world models) entrenados sobre simulaciones de movimiento de tela generadas con PyFleX. El autor, hanbin5, publica en este repositorio los pesos resultantes de varias ejecuciones de entrenamiento que difieren en el tamano de la tela utilizada como datos de entrenamiento y en la semilla aleatoria. No se trata de un modelo de lenguaje, sino de un modelo predictivo de dinamica visual orientado a investigacion en planificacion y control basado en modelos.

La arquitectura subyacente es DINO-WM, un world model que utiliza un encoder visual congelado DINOv2 ViT-S/14 para extraer representaciones de las observaciones y aprender la dinamica del entorno en ese espacio latente. El repositorio no incluye ni los datos de entrenamiento (simulacion `cloth_sim`) ni el encoder congelado, por lo que los checkpoints publicados solo son utiles si se dispone del pipeline completo de DINO-WM y del dataset original.

El interes del modelo es acotado: es un artefacto de investigacion reproducibilidad-oriented, con cero descargas y cero likes en el momento de la consulta, sin model card detallada (la tabla de ejecuciones queda truncada en el README) y sin licencia declarada. Resulta relevante unicamente para quienes trabajen en world models con DINOv2, manipulacion de tejidos deformables o simulacion con PyFleX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO-WM (world model sobre encoder congelado DINOv2 ViT-S/14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visomotor, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), un fichero `checkpoints/model_<epoch>.pth` por ejecucion |

## Arquitectura y entrenamiento

DINO-WM es un world model que aprende la dinamica de un entorno a partir de observaciones visuales. La arquitectura combina un encoder visual congelado (DINOv2 ViT-S/14, que en este repositorio no se distribuye) con un modulo de prediccion de dinamica entrenado sobre las representaciones latentes que produce dicho encoder. Cada ejecucion se define mediante un fichero `hydra.yaml` que actua como configuracion base para construir la red; los hiperparametros especificos de cada run se recogen en la tabla de ejecuciones del README, que en la informacion disponible aparece truncada.

Los datos de entrenamiento provienen de una simulacion de movimiento de tela generada con PyFleX, almacenada en una carpeta `cloth_sim` referenciada por la variable de entorno `DATASET_DIR`. Las distintas ejecuciones varian en el tamano de la tela simulada y en la semilla. No se especifican en la informacion disponible el numero de tokens, episodios, pasos de simulacion, ni si se emplearon tecnicas de RL, imitation learning o supervision puramente auto-supervisada sobre transiciones.

## Capacidades

- Prediccion de la dinamica futura de una tela deformable en el espacio latente de DINOv2.
- Modelado del mundo para planificacion y control basado en modelos (model-based planning) en entornos simulados.
- Generalizacion potencial a distintos tamanos de tela, segun la ejecucion concreta seleccionada.
- Extraccion de representaciones visuales mediante el encoder DINOv2 ViT-S/14 (no incluido en el repositorio).
- No soporta generacion de texto, codigo, matematicas, tool calling, agentes linguisticos ni capacidades multilingues.
- No dispone de modo thinking, vision de proposito general, audio ni ninguna capacidad de proposito general fuera del dominio de simulacion de telas.

## Casos de uso

- Investigacion en world models: utilizar los checkpoints como linea base reproducible para comparar metodos de aprendizaje de dinamica latente sobre DINOv2 en tareas de deformacion.
- Planificacion en manipulacion robotica de tejidos: emplear el modelo para predecir la evolucion de una tela y seleccionar acciones en un bucle de control basado en modelo (MPC) dentro de simulacion.
- Reproduccion de experimentos: cargar `outputs/<run>/hydra.yaml` y el checkpoint correspondiente para replicar los resultados del autor sobre el dataset `cloth_sim`.
- Estudio de sensibilidad al tamano del objeto: comparar ejecuciones entrenadas con telas de distinto tamano para analizar como escala la capacidad predictiva del world model.
- Analisis de sensibilidad a la semilla: evaluar la varianza entre ejecuciones con distinta semilla para estimar la robustez del entrenamiento.
- Transferencia a otros simuladores: usar las representaciones DINOv2 y el modulo de dinamica como punto de partida para fine-tuning en entornos fisicos distintos de PyFleX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,8 GB y el encoder es un ViT-S/14 (aproximadamente 21-22 M de parametros), por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el modulo de dinamica anade overhead no cuantificado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia bastar para inferencia; para reentrenamiento se recomienda A100 o H100 por el coste de generar y procesar simulaciones.
- Cabe en GPU de consumo: previsiblemente si (RTX 3060, 4060, 4090), aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: carga directa con PyTorch (`.pth`) y Hydra para la configuracion; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Encoder | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINO-WM (cloth size) | World model visual | DINOv2 ViT-S/14 congelado | no aplica | no disponible | Hugging Face (hanbin5) |
| DINO-WM (original) | World model visual | DINOv2 ViT | no aplica | no disponible en esta ficha | Referencia academica |
| DreamerV3 | World model RL | CNN/RNN propio | no aplica | MIT | Codigo publico |
| IRIS | World model RL | VQ-VAE + transformer | no aplica | no disponible en esta ficha | Codigo publico |

La comparacion cuantitativa con alternativas no esta disponible porque el autor no publica metricas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el encoder DINOv2 ViT-S/14 ni los datos de simulacion `cloth_sim`, por lo que los checkpoints no son utilizables de forma autonoma.
- La model card esta incompleta: la tabla de ejecuciones aparece truncada y no se detallan hiperparametros, metricas ni resultados.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier uso en produccion.
- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de validacion por terceros.
- Dominio extremadamente estrecho (telas simuladas en PyFleX); no generaliza a otros entornos sin reentrenamiento.
- Riesgo de sobreajuste a la distribucion de simulacion y de fallo fuera de las condiciones de tamano y semilla cubiertas por las ejecuciones publicadas.
- No apto para tareas linguisticas, de codigo o de proposito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hanbin5/dino-wm-cloth-size
