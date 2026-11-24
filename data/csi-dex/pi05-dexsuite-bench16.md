# CSI-Dex/pi05-dexsuite-bench16

## Resumen

pi05-dexsuite-bench16 es un modelo de política visomotora (vision-language-action, VLA) derivado de `lerobot/pi05_base` y ajustado por CSI-Dex para el benchmark DexSuite de manipulación diestra. No es un modelo de lenguaje: es una política de control robótico que recibe imágenes de cámara, estado propioceptivo del robot y un prompt textual de tarea, y emite acciones de 32 dimensiones (pose del brazo más articulaciones de la mano). Emplea la arquitectura PI05Policy de LeRobot 0.4.4 y suma 3.616.757.520 parámetros en formato safetensors.

El modelo se ha entrenado sobre el split de entrenamiento de DexSuite (arXiv 2610.37799) con 1.101 episodios, 238.507 fotogramas a 20 Hz y 16 pares tarea-efector, incluyendo manos Allegro, Sharpa, Robotiq y UMI. El repositorio ocupa 86,8 GB e incluye el checkpoint del paso 30.000 en la raíz y otros checkpoints intermedios en `checkpoints/<step>/`.

Su relevancia es acotada y experimental: se trata de un artefacto de benchmark sin descargas ni validación externa, con licencia no declarada, pensado para reproducir el protocolo de evaluación de DexSuite y servir de punto de partida para comparativas de manipulación diestra multitarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI05Policy (LeRobot 0.4.4), política visomotora VLA derivada de `lerobot/pi05_base` |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada basada en chunk de 10 pasos de acción e imágenes de 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de tarea están en inglés según `training/prompts.json`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `lerobot/pi05_base` con la política PI05Policy de LeRobot 0.4.4. La entrada combina dos cámaras (`observation.images.front` mapeada a `base_0_rgb` y `observation.images.wrist` mapeada a `right_wrist_0_rgb`, ambas a 224x224), un vector `observation.state` de 32 dimensiones (posición y cuaternión del efector final más qpos de mano/gripper, con relleno de ceros) y un prompt textual específico por tarea y efector. La salida es un vector `action` de 32 dimensiones con la pose absoluta OSC del brazo (3 de posición y 4 de cuaternión) más las articulaciones de la mano, también con relleno de ceros.

El entrenamiento se realizó durante 30.000 pasos con batch global de 256 en 8 GPU B200, chunk de 10, learning rate de 5e-5 con warmup de 1.000 pasos y decaimiento coseno hasta 5e-6, autocast bf16 y normalización por cuantiles de estado y acción (STATE/ACTION QUANTILES). El conjunto de datos combina 14 conjuntos de teleoperación humana (50 episodios cada uno) y dos conjuntos con guion de Spray Graffiti y Toast Bread Sharpa (200 episodios cada uno), fusionados mediante `training/merge_dexsuite.py`. Las dimensiones útiles tras desnormalizar son 8 para Robotiq, 9 para UMI, 23 para Allegro y 29 para Sharpa.

## Capacidades

- Generación de acciones de control robótico de 32 dimensiones a partir de imágenes y estado propioceptivo.
- Manipulación diestra multitarea con cuatro efectores finales distintos: Robotiq, UMI, Allegro y Sharpa.
- Condicionamiento por prompt textual de tarea y efector, con cadenas exactas definidas en `training/prompts.json`.
- Procesamiento de dos vistas de cámara simultáneas (frontal y muñeca) a 224x224.
- Control a 20 Hz con horizonte de acción (chunk) de 10 pasos.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política cerrada de imitación.

## Casos de uso

- Reproducción del benchmark DexSuite: cargar el checkpoint del paso 30.000 con LeRobot 0.4.4 y evaluar los 16 pares tarea-efector siguiendo el protocolo del paper, usando el tokenizer local `paligemma_tokenizer_hf/`.
- Investigación en manipulación diestra multitarea: comparar el efecto del ajuste fino completo sobre `pi05_base` frente a otras políticas VLA en las mismas tareas.
- Transferencia entre efectores finales: estudiar cómo un mismo modelo condicionado por prompt cubre manos de 6, 2, 16 y 22 articulaciones mediante el relleno de ceros del vector de acción.
- Ajuste fino posterior con datos propios: partir de este checkpoint como inicialización para tareas de manipulación con cámaras frontal y de muñeca y espacio de acción OSC.
- Análisis de normalización por cuantiles: evaluar la estabilidad del entrenamiento con STATE/ACTION QUANTILES en regímenes multitarea y multi-efector.
- Baseline en competiciones o estudios internos de robótica: servir de referencia cuantitativa antes de incorporar políticas más grandes o con preentrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 86,8 GB e incluye el checkpoint del paso 30.000 más checkpoints intermedios en `checkpoints/<step>/`; el espacio en disco debe dimensionarse en consecuencia.
- Con 3.616.757.520 parámetros, la inferencia en bf16 requiere del orden de 7,2 GB solo para pesos; el resto del presupuesto de VRAM depende del runtime de LeRobot y del tamaño de lote.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU B200; para inferencia se recomienda una GPU con al menos 16-24 GB de VRAM (A100, H100, L40S o RTX 4090) para operar con margen.
- Cabe en GPU de consumo con suficiente VRAM (RTX 4090 de 24 GB) en bf16, siempre que el runtime de LeRobot no añada sobrecarga excesiva; en GPU de 8-12 GB no hay datos que confirmen viabilidad.
- Opciones de despliegue: la librería declarada es `lerobot` 0.4.4; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política VLA de este tipo.
- Latencia y throughput: no disponibles. El control se especifica a 20 Hz, pero no se publican mediciones de latencia por paso en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-dexsuite-bench16 | 3.616.757.520 | no disponible | sin resultados publicados | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Hugging Face (modelo base citado) |
| Otras políticas VLA de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo sin descargas ni likes y con licencia no declarada: el uso comercial queda en un limbo legal hasta que el autor especifique términos.
- Es una política de imitación restringida al dominio DexSuite; no generaliza a tareas, robots o cámaras fuera de la distribución de entrenamiento.
- El prompt debe coincidir exactamente con las cadenas de `training/prompts.json`; variaciones en el texto pueden degradar el comportamiento.
- El tokenizer apunta a una ruta local en `policy_preprocessor.json`; es obligatorio usar `paligemma_tokenizer_hf/` del propio repositorio para que la carga funcione.
- El vector de acción requiere desnormalización y recorte a las primeras n dimensiones según el efector (Robotiq 8, UMI 9, Allegro 23, Sharpa 29); un uso incorrecto produce comandos inválidos.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas fuera de distribución; no hay evaluación publicada que acote la tasa de fallo.
- No se documentan sesgos, limitaciones idiomáticas ni métricas de robustez; el modelo no procesa lenguaje libre más allá del condicionamiento por prompt.
- El repositorio de 86,8 GB incluye checkpoints intermedios que pueden confundir la selección del modelo correcto; el protocolo DexSuite conserva el mejor checkpoint en entrenamiento, no necesariamente el de la raíz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSI-Dex/pi05-dexsuite-bench16
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de DexSuite citado en la model card: arXiv 2610.37799 (sin URL directa en la información proporcionada)
- LeRobot: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
