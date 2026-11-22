# albagon/telearms-hicube-datav7-rigdrv8-lora-unmasked-25pct_4gpu_b4

## Resumen

`albagon/telearms-hicube-datav7-rigdrv8-lora-unmasked-25pct_4gpu_b4` es un ajuste fino mediante LoRA del modelo fundacional de robotica `lerobot/pi05_base` (pi 0.5, desarrollado por Physical Intelligence y empaquetado en la libreria LeRobot de Hugging Face). El modelo esta especializado en una tarea concreta de manipulacion bimanual: la colocacion de un cubo (hi-cube placement) con los brazos roboticos YAM de la plataforma TeleArms. No es un modelo de lenguaje: es una politica visuomotora que mapea observaciones (imagenes de camaras e instrucciones) a acciones de control de bajo nivel.

El entrenamiento se realizo sobre el dataset `albagon/telearms-hi-cube-placement-datav7-rigdrv8`, usando solo el 25 por ciento de los fotogramas disponibles (20,3 millones de fotogramas de entrenamiento) y con la mascara de perdida desactivada (`loss_mask: False`). Se emplearon 4 GPU con un batch por GPU de 4 (batch global 16) durante 317.956 pasos, con un rango LoRA de 128 y alpha de 128, mientras que la torre de vision permanecio congelada (`train_vision: False`).

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluacion publicados y sin licencia declarada. Su interes radica en documentar la metodologia de ajuste LoRA sobre politicas pi 0.5 para tareas bimanuales concretas, no en ofrecer un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visuomotora pi 0.5 (base `lerobot/pi05_base`), ajuste fino LoRA |
| Parametros totales | no disponible (el repo ocupa 2,7 GB; el modelo base pi 0.5 no declara cifra en la informacion aportada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (politica de control con `chunk_size` de 50 y `n_action_steps` de 50) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA en `checkpoints/<step>/pretrained_model`; pesos fusionados en `merged/<step>`, aun no generados) |

## Arquitectura y entrenamiento

El modelo parte de pi 0.5 (`lerobot/pi05_base`), una politica de robotica de tipo vision-language-action que procesa observaciones visuales y produce secuencias de acciones. El ajuste se realiza exclusivamente mediante adaptadores LoRA de rango 128 y alpha 128 sobre el modelo base, con la torre de vision congelada y atencion implementada con SDPA. El entrenamiento usa precision bfloat16, sin gradient checkpointing, con `chunk_size` de 50 y 50 pasos de accion por inferencia.

Los datos proceden del dataset `telearms-hi-cube-placement-datav7-rigdrv8` (revision `7cd0fd1525efa943b57940cdbc7e35ca55dbaca2`), del que se utiliza el 25 por ciento de los fotogramas: 20.349.168 fotogramas de entrenamiento y una particion de evaluacion del 9,98 por ciento. Se ejecutaron 317.956 pasos con batch global 16 en 4 GPU, semilla 1000, tasa de aprendizaje LoRA de 1e-4 y tasa para modulos completos de 2,5e-5, con decaimiento hasta 2,5e-6 y 1.000 pasos de calentamiento. La mascara de perdida esta desactivada (`use_loss_mask: False`), lo que implica que el modelo aprende de todos los fotogramas sin filtrar segmentos irrelevantes. Se planificaron puntos de fusion en los pasos 79.490, 158.980, 238.470 y 317.956, pero en el momento de la publicacion no se habia generado ningun peso fusionado.

## Capacidades

- Control visuomotor bimanual: genera secuencias de 50 acciones para los brazos YAM a partir de observaciones visuales.
- Ejecucion de una tarea especifica: colocacion de un cubo (hi-cube placement) en el entorno de entrenamiento.
- Ajuste eficiente mediante LoRA sobre un modelo fundacional de robotica, lo que permite reutilizar el conocimiento de pi 0.5 con un coste de entrenamiento reducido.
- No dispone de capacidades de generacion de texto, razonamiento simbolico, codigo ni matematicas: es una politica de accion, no un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.
- Capacidades multilingues: no aplicables ni documentadas.

## Casos de uso

- Investigacion en manipulacion bimanual: servir como punto de partida para reproducir o comparar el ajuste LoRA de pi 0.5 en tareas de colocacion con los brazos YAM, dado que el repositorio incluye la configuracion completa del lanzamiento y del entrenamiento.
- Experimentos de eficiencia de datos: el entrenamiento con solo el 25 por ciento de los fotogramas permite estudiar como afecta la reduccion del dataset al rendimiento de una politica visuomotora en una tarea acotada.
- Base para ajustes posteriores: los adaptadores LoRA publicados en cada checkpoint pueden reutilizarse como inicializacion para nuevas tareas de TeleArms, reduciendo el coste frente a partir del modelo base completo.
- Evaluacion de estrategias de fusion de adaptadores: los puntos de fusion planificados permiten analizar la evolucion del adaptador a lo largo del entrenamiento y comparar checkpoints intermedios.
- Docencia y divulgacion: ilustra el flujo completo de LeRobot para ajustar una politica pi 0.5 con LoRA en un cluster de 4 GPU, incluidos los hiperparametros y la configuracion de datos.
- Reproducibilidad de experimentos: la semilla fija (1000) y la revision exacta del dataset permiten replicar el entrenamiento en entornos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exito de la tarea, tasas de exito en el entorno real ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 2,7 GB, lo que sugiere que el adaptador y los pesos asociados caben en GPU de consumo, pero el modelo base pi 0.5 debe cargarse adicionalmente y no se declara su huella.
- GPU recomendadas: el entrenamiento se realizo en 4 GPU con batch por GPU de 4 y bfloat16; no se especifica el modelo exacto de GPU empleado.
- GPU de consumo: no confirmado; la ausencia de datos sobre el modelo base impide asegurar que quepa en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: la libreria declarada es LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuadas para una politica visuomotora.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `albagon/telearms-hicube-datav7-rigdrv8-lora-unmasked-25pct_4gpu_b4` | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible en la informacion aportada | no disponible | Hugging Face |
| Otros ajustes de pi 0.5 sobre TeleArms | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado unicamente para la tarea de colocacion de cubo con los brazos YAM de TeleArms; no generaliza a otras tareas ni plataformas sin nuevo ajuste.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion; su uso en produccion es juridicamente incierto.
- Sin evaluacion publicada: no hay metricas de tasa de exito ni validacion en entorno real, por lo que se desconoce su fiabilidad.
- Entrenamiento parcial: solo se uso el 25 por ciento de los fotogramas del dataset, lo que puede limitar la cobertura de situaciones.
- Mascara de perdida desactivada: el modelo aprende de todos los fotogramas, incluidos posibles segmentos no relevantes, lo que puede introducir ruido en el aprendizaje.
- Pesos fusionados no generados: en el momento de la publicacion solo existen adaptadores LoRA por checkpoint, lo que complica el despliegue directo.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos de evaluacion no puede descartarse una degradacion fuera de las condiciones de recogida de datos.
- Idiomas y sesgos: no aplicables en el sentido de un modelo de lenguaje, pero no se documenta ningun analisis de sesgo en el comportamiento de la politica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albagon/telearms-hicube-datav7-rigdrv8-lora-unmasked-25pct_4gpu_b4
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/albagon/telearms-hi-cube-placement-datav7-rigdrv8
- Libreria LeRobot: https://github.com/huggingface/lerobot
