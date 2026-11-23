# shailes-h/pi05-telearms-three-cube-pyramid-stacking-datav7-rigdrv8-1epoch

## Resumen

`pi05-telearms-three-cube-pyramid-stacking-datav7-rigdrv8-1epoch` es un ajuste fino completo del modelo base `lerobot/pi05_base`, un modelo de politica visomotora (vision-language-action, VLA) orientado a control roboticos. Lo publica el usuario `shailes-h` dentro del ecosistema LeRobot de Hugging Face, y esta especializado en una unica tarea: apilar tres cubos formando una piramide con un setup bimanual denominado TeleArms (plataforma YAM). El modelo parte de la arquitectura pi0.5 de Physical Intelligence y conserva la torre de vision del modelo base, por lo que no es un adaptador ligero sino un fine-tune completo.

El interes practico es acotado pero claro: demuestra el flujo de trabajo de LeRobot para especializar un VLA generalista en una tarea de manipulacion concreta con un dataset propio, incluyendo estadisticas de normalizacion, configuracion de entrenamiento y receta reproducibles. Con 4.143.404.816 parametros (aproximadamente 4,1 mil millones) y un repositorio de 9,4 GB en safetensors, es un modelo de tamano medio que requiere GPU de centro de datos para inferencia comoda.

La relevancia es fundamentalmente metodologica: sirve como referencia para quien quiera replicar un pipeline de fine-tuning de pi0.5 sobre un robot bimanual concreto, no como modelo de proposito general. No hay descargas ni likes en el momento de redactar esta ficha, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, fine-tune completo del modelo base `lerobot/pi05_base` (incluye torre de vision) |
| Parametros totales | 4.143.404.816 (4,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el prompt de la politica se entrena con variantes de texto, idioma no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `policy_preprocessor*` / `policy_postprocessor*`, `train_config.json`, `telearms_recipe.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `lerobot/pi05_base`, la implementacion en LeRobot de la familia pi0.5 de Physical Intelligence. Se trata de un modelo VLA que combina una torre de vision, un codificador de lenguaje y un decodificador de acciones, y que produce comandos motores a partir de observaciones visuales, estado del robot e instrucciones en lenguaje natural. El autor indica explicitamente que el ajuste incluye la parte de vision ("vision included"), es decir, no se congela el backbone visual durante el entrenamiento.

El entrenamiento se realizo sobre el dataset `shailes-h/telearms-three-cube-pyramid-stacking-datav7-rigdrv8`, con una division del 90 % para entrenamiento y un 10 % reservado para evaluacion. Se ejecuto una sola epoca del split de entrenamiento, lo que equivale a 1804 pasos con batch global de 2048 (8 GPU NVIDIA B200, 128 por dispositivo y acumulacion de gradiente 2). Se uso una tasa de aprendizaje de 2e-4 con calentamiento lineal durante el primer 10 % de los pasos y valor constante despues, junto con regularizacion agresiva: dropout de estado de 0,3, ruido de estado de 0,05, aumento de imagenes y variantes de prompt. El entrenamiento se llevo a cabo en el cluster NUS Hopper con GPU B200. La receta sigue la del modelo `shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch`.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales y estado del robot (politica visomotora).
- Control bimanual: el dataset y el prefijo "TeleArms" indican un setup de dos brazos (plataforma YAM).
- Ejecucion de una tarea especifica de manipulacion: apilado de tres cubos en forma de piramide.
- Seguimiento de instrucciones en lenguaje natural mediante variantes de prompt durante el entrenamiento.
- Robustez a variaciones de estado y de imagen gracias al dropout de estado (0,3), ruido de estado (0,05) y aumento de imagenes aplicados en entrenamiento.
- Integracion con el ecosistema LeRobot: preprocesador y posprocesador de politica incluidos con estadisticas de normalizacion.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni otros dominios fuera de la tarea entrenada.

## Casos de uso

- Replicacion de un pipeline de fine-tuning VLA: usar este repositorio como referencia completa (config, receta, estadisticas de normalizacion) para adaptar pi0.5 a una tarea propia con LeRobot.
- Apilado de cubos en laboratorio: desplegar la politica en el rig TeleArms/YAM para ejecutar la tarea de piramide de tres cubos y medir tasa de exito frente al modelo base.
- Punto de partida para fine-tuning adicional: al ser un fine-tune completo con vision, sirve como inicializacion para tareas de manipulacion bimanual relacionadas y reduce el coste frente a partir de `pi05_base`.
- Evaluacion de robustez de politicas VLA: comparar el comportamiento del modelo con y sin perturbaciones de estado o iluminacion para estudiar la generalizacion inducida por el dropout y el ruido de estado.
- Docencia e investigacion en robotica: ejemplo reproducible de entrenamiento bimanual con receta documentada (LR, warmup, batch, aumentos) y division train/eval explicita.
- Benchmark interno de infraestructura: servir como carga de referencia para medir throughput de inferencia de un VLA de 4,1 B en GPUs de centro de datos o consumer de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de evaluacion ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 16,6 GB solo para pesos, mas activaciones y buffers de vision; en la practica se recomienda reservar 24 GB o mas.
- VRAM estimada en bf16/fp16: unos 8,3 GB para pesos; con overhead de inferencia, alrededor de 12-16 GB.
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento), A100 40/80 GB, H100, L40S; para inferencia en bf16 bastan GPU con 16-24 GB.
- Cabe en GPU consumer: si, en bf16 en RTX 4090 (24 GB) y potencialmente en RTX 4080/4070 Ti Super (16 GB) con margen ajustado; en cuantizaciones de 8 bits o menores cabria en GPUs de 12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: LeRobot (libreria nativa del modelo); el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este modelo y no se garantiza su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shailes-h/pi05-telearms-three-cube-pyramid-stacking-datav7-rigdrv8-1epoch` | 4,1 B | no disponible | Apilado bimanual de tres cubos (TeleArms/YAM) | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la informacion | no disponible | VLA generalista base | no disponible | Hugging Face (modelo base) |
| `shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch` | no disponible en la informacion | no disponible | Manipulacion de un cubo (receta de referencia) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada unicamente para apilar tres cubos con el rig TeleArms/YAM; fuera de esa tarea y morfologia no cabe esperar comportamiento util.
- Una sola epoca de entrenamiento: 1804 pasos pueden ser insuficientes para convergencia plena; no se publican curvas de perdida ni tasas de exito que lo confirmen.
- Licencia no declarada: no hay permiso explicito de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: el comportamiento ante prompts en castellano u otros idiomas distintos de los usados en entrenamiento es desconocido.
- Riesgo de sobreajuste al entorno del dataset (iluminacion, posiciones, fondo del rig); la generalizacion a otras mesas o configuraciones de camara no esta evaluada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Dependencia del ecosistema LeRobot y de las estadisticas de normalizacion incluidas; un uso fuera de ese pipeline puede degradar la politica.
- Riesgo de fallos fisicos en ejecucion real: como toda politica robotica, requiere supervision, limites de par y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shailes-h/pi05-telearms-three-cube-pyramid-stacking-datav7-rigdrv8-1epoch
- Dataset de entrenamiento: https://huggingface.co/datasets/shailes-h/telearms-three-cube-pyramid-stacking-datav7-rigdrv8
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Receta de referencia citada por el autor: https://huggingface.co/shailes-h/pi05-telearms-yam-cube-v5-s2r-red-left-of-blue-1epoch
