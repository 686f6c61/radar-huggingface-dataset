# ArthurGoldFishKing/le008_policies

## Resumen

`le008_policies` es un repositorio de Hugging Face que agrupa tres políticas visuomotoras para robótica entrenadas sobre el conjunto de datos `MISLab-MiiSLab/Le-008_head`, correspondiente a un robot real y a la tarea "pick up the fan by its handle". Las tres políticas son ACT, Diffusion Policy y ACT-JEPA, y cada una se ha entrenado durante 50.000 pasos con un tamaño de lote de 32. El autor es ArthurGoldFishKing y el repositorio está etiquetado con `lerobot`, `safetensors`, `robotics`, `act`, `diffusion-policy` y `act-jepa`.

El interés de este repositorio es que permite comparar tres enfoques de imitación visuomotora (una política transformer con VAE, una política de difusión y una variante ACT con objetivo JEPA) sobre exactamente el mismo dataset, el mismo split de entrenamiento y validación y el mismo número de pasos. No se trata de un modelo de lenguaje ni de un modelo fundacional generalista: es un conjunto de checkpoints de robótica de 2,0 GB en total, con entradas de imagen RGB y profundidad a 256x256, estado de 7 dimensiones y acciones de 7 dimensiones.

La relevancia es acotada pero concreta: sirve como referencia reproducible para quien quiera evaluar políticas de manipulación con LeRobot 0.6.2 o con el código de `act-jepa`, y como punto de partida para despliegues en robot real. Cabe señalar que, según la model card, ninguna de las tres políticas se ha evaluado todavía en el robot, por lo que solo se dispone de pérdidas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres políticas: ACT (transformer con VAE), Diffusion Policy (DDIM) y ACT-JEPA (ACT con objetivo JEPA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de acción: chunk 20 / ejecutar 5 (ACT), horizonte 16 / 2 pasos de observación / ejecutar 8 (Diffusion), chunk 20 (ACT-JEPA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors; checkpoints completos de LeRobot (`pretrained_model` con pre/post-procesadores) para ACT y Diffusion; `model.safetensors` + `act-jepa.yaml` + `dataset_stats.json` para ACT-JEPA |
| Entradas | `observation.images.wrist` (RGB), `observation.images.head` (RGB), `observation.images.depth` (profundidad de muñeca, escala de grises), todas 256x256 |
| Estado | `observation.state`, 7-D (6 articulaciones y pinza) |
| Acción | `action`, deltas de 7-D por paso (dx, dy, dz, drx, dry, drz, gripper) |
| Dataset | `MISLab-MiiSLab/Le-008_head`: 200 episodios, 13.238 fotogramas, 10 fps |
| Split | 190 episodios de entrenamiento / 10 de validación (episodios 10, 66, 77, 98, 103, 107, 122, 124, 130, 194) |
| Pasos de entrenamiento | 50.000 en las tres políticas (ACT-JEPA tiene además checkpoint en el paso 35.000) |
| Tamaño del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

ACT es una política transformer con un codificador visual ResNet-18 preentrenado en ImageNet y un VAE (con peso KL de 10) que modela la variabilidad de las demostraciones; predice fragmentos de acción de longitud 20 (2 s a 10 fps) y ejecuta 5. Diffusion Policy emplea un proceso de difusión con DDIM de 10 pasos de inferencia, horizonte de 16, 2 pasos de observación, ejecución de 8 y un codificador separado por cámara, con recorte aleatorio de 240x240. ACT-JEPA reutiliza la base de ACT con un ResNet-18 compartido, oculta la pinza del estado de contexto y se entrena con un objetivo JEPA; su configuración de arquitectura, horizontes y claves de cámara está en `act-jepa.yaml`.

Los ajustes de optimización difieren entre las tres: ACT usa AdamW con lr 1e-5 y weight decay 1e-4, schedule coseno con 500 pasos de warmup y normalización por media/desviación visual, min/max del estado y cuantiles de la acción; Diffusion usa Adam con lr 1e-4 y el mismo esquema de normalización que ACT; ACT-JEPA usa AdamW con lr 3e-4, weight decay 0,1, schedule coseno con 4% de warmup y normalización media/desviación de estado y acción. En ninguna de las tres se usó EMA de los pesos de la política ni aumento de color. El dataset de entrenamiento son 200 episodios reales a 10 fps (13.238 fotogramas) de la tarea de recoger el ventilador por el asa; no se reporta composición adicional del dataset ni uso de RLHF o DPO, que no aplican a este tipo de políticas.

## Capacidades

- Generación de acciones visuomotoras de 7 dimensiones (6 articulaciones más pinza) a partir de imágenes RGB de muñeca y cabeza, profundidad de muñeca y estado de 7-D.
- Predicción de fragmentos de acción con ejecución parcial (chunk 20 / ejecutar 5 en ACT; horizonte 16 / ejecutar 8 en Diffusion), lo que permite control recedente a 10 fps.
- Tres variantes entrenadas sobre el mismo dataset y split, comparables entre sí en cuanto a configuración experimental.
- Carga directa en LeRobot 0.6.2 para ACT y Diffusion, con preprocesador y postprocesador incluidos (normalización y desnormalización de acciones).
- ACT-JEPA incluye configuración YAML y estadísticas del dataset para normalización media/desviación.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se reporta soporte de visión general, audio ni otras modalidades fuera de las cámaras del robot.

## Casos de uso

- Recogida de objetos por el asa en robot real: las tres políticas están entrenadas específicamente para "pick up the fan by its handle" con un efector de 6 articulaciones más pinza; se usarían cargando el checkpoint en LeRobot y publicando observaciones a 10 fps.
- Comparación de paradigmas de imitación: al compartir dataset, split y número de pasos, permiten estudiar empíricamente las diferencias entre ACT, difusión y ACT-JEPA en una misma tarea de manipulación.
- Base para fine-tuning en tareas similares: los checkpoints de 50.000 pasos sirven como inicialización para nuevas tareas de pick-and-place con el mismo robot y configuración de cámaras.
- Despliegue con LeRobot 0.6.2: ACT y Diffusion se cargan con `ACTPolicy.from_pretrained` y `DiffusionPolicy.from_pretrained` desde las carpetas `act/` y `diffusion/`, respectivamente, con los procesadores del mismo directorio.
- Investigación en representaciones JEPA para robótica: el checkpoint de ACT-JEPA en el paso 35.000 (menor pérdida de validación, 0,0983) es el punto de partida natural para estudiar el efecto del objetivo JEPA frente a ACT estándar.
- Reproducción de experimentos: la configuración de entrenamiento, el split (`splits_le008.json`) y las curvas (`act_jepa/metrics.jsonl`) permiten reproducir o auditar los resultados con el código de `act-jepa` y LeRobot.
- Evaluación de robustez ante entradas multimodales: el uso conjunto de RGB de muñeca, RGB de cabeza y profundidad de muñeca (sin la profundidad de cabeza del dataset) permite analizar la contribución de cada cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento, que miden objetivos distintos y no son comparables entre sí:

| Política | Pérdida de entrenamiento final | Pérdida de validación | Observaciones |
|---|---|---|---|
| ACT | 0,014 | no disponible | 50.000 pasos |
| Diffusion | 0,007 | no disponible | 50.000 pasos |
| ACT-JEPA | 0,044 | 0,0983 en el paso 35.000; 0,1016 en el paso 50.000 | Entre el paso 12.500 y el 50.000 se mantuvo entre 0,098 y 0,106 |

Ninguna de las tres políticas se ha evaluado en el robot, por lo que no hay tasas de éxito ni métricas de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio completo ocupa 2,0 GB e incluye tres políticas con codificadores ResNet-18; cada checkpoint individual es sustancialmente menor que el total.
- GPU recomendadas: no disponible. Al tratarse de políticas con ResNet-18 y transformers pequeños, es plausible que quepan en GPU de consumo, pero no se aporta ningún dato que lo confirme.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: LeRobot 0.6.2 para ACT y Diffusion (carga vía `from_pretrained` con pre/post-procesadores); código de `act-jepa` para la variante ACT-JEPA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La ejecución de acciones está pensada para un robot a 10 fps, con ejecución parcial de 5 pasos en ACT y 8 en Diffusion, pero no se reportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| le008_policies (ACT) | Política visuomotora | no disponible | chunk 20, ejecutar 5 | Pérdida de entrenamiento 0,014; sin evaluación en robot | no disponible | Hugging Face |
| le008_policies (Diffusion) | Política visuomotora | no disponible | horizonte 16, ejecutar 8 | Pérdida de entrenamiento 0,007; sin evaluación en robot | no disponible | Hugging Face |
| le008_policies (ACT-JEPA) | Política visuomotora | no disponible | chunk 20 | Pérdida de entrenamiento 0,044; validación 0,0983 en el paso 35.000 | no disponible | Hugging Face |
| Otras políticas LeRobot (ACT, Diffusion Policy) | Políticas visuomotoras | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas con alternativas externas en la información proporcionada; la única comparación rigurosa posible es interna entre las tres políticas del propio repositorio.

## Limitaciones y advertencias

- Ninguna de las tres políticas se ha evaluado en el robot: solo hay pérdidas de entrenamiento, y las de cada política miden objetivos distintos, por lo que no son comparables entre sí.
- Las pérdidas de validación solo se reportan para ACT-JEPA; para ACT y Diffusion no hay datos de validación.
- El entrenamiento se limita a una única tarea ("pick up the fan by its handle") y a un único robot con 6 articulaciones más pinza; no hay evidencia de generalización a otras tareas, objetos o morfologías.
- El dataset es pequeño (200 episodios, 13.238 fotogramas a 10 fps) y de un solo operador y entorno, lo que aumenta el riesgo de sobreajuste a condiciones concretas de iluminación, posiciones y objetos.
- No se usó aumento de color ni EMA de pesos, lo que puede reducir la robustez ante variaciones visuales.
- La profundidad de cabeza del dataset (`observation.images.head_depth`) no se utilizó; solo se emplea la profundidad de muñeca.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- No hay información sobre sesgos, riesgos de alucinación ni restricciones de idioma, ya que no es un modelo de lenguaje.
- Las rutas de los ficheros de configuración de ACT-JEPA son relativas al proyecto de entrenamiento y requieren ajuste para otros entornos.
- El repositorio se creó y actualizó en noviembre de 2026 y no tiene descargas ni likes, por lo que no hay validación externa de la comunidad.

## Enlaces

- [Hugging Face: ArthurGoldFishKing/le008_policies](https://huggingface.co/ArthurGoldFishKing/le008_policies)
- [Dataset: MISLab-MiiSLab/Le-008_head](https://huggingface.co/datasets/MISLab-MiiSLab/Le-008_head)
- [Repositorio de código act-jepa](https://github.com/act-jepa/act-jepa)
