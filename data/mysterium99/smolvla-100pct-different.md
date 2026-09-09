# mysterium99/smolvla-100pct-different

## Resumen

`mysterium99/smolvla-100pct-different` es un modelo de visión-lenguaje-acción (VLA) fine-tuneado a partir de `lerobot/smolvla_base`, desarrollado por el autor `mysterium99` y publicado en Hugging Face bajo licencia Apache 2.0. El modelo forma parte del ecosistema LeRobot y está entrenado para tareas de manipulación robótica mediante aprendizaje por imitación, consumiendo observaciones de estado del robot y tres cámaras, y produciendo acciones de control de seis dimensiones.

Pertenece a la familia SmolVLA, descrita en el paper [2506.01844](https://huggingface.co/papers/2506.01844), que destaca por ser un modelo compacto y eficiente diseñado para ejecutarse en hardware de consumo, reduciendo el coste computacional frente a VLA más grandes. En concreto, esta variante ha sido ajustada sobre el dataset `ds_merged`, compuesto por 240 episodios y más de 170.000 frames, para tres tareas de manipulación en mesa. El modelo tiene aproximadamente 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, lo que lo hace viable para GPUs de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language-action (VLA) compacto. Detalles específicos de subarquitectura no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia SmolVLA, un enfoque VLA que combina un codificador de imágenes, un modelo de lenguaje reducido y un cabezal de políticas para generar acciones de control. Este fine-tune parte de `lerobot/smolvla_base` y se ha entrenado con el framework LeRobot 0.6.1. Según la model card, la configuración de entrenamiento fue de 20.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 0.

El dataset de entrenamiento es `ds_merged`, con 240 episodios y 170.348 frames a 30 FPS. Las tareas supervisadas son: "empujar un bloque hacia el área marcada con cinta", "recoger el cubo y colocarlo en la taza" y "poner todos los bloques amarillos en el contenedor". El modelo consume como entradas el estado del robot (6 valores) y tres imágenes de 256×256 píxeles (cámaras superior y laterales), y emite una acción de 6 dimensiones. No se detallan innovaciones arquitectónicas específicas en la información disponible.

## Capacidades

- Control de robot manipulador mediante aprendizaje por imitación (policy de acción continua de 6 dimensiones).
- Entrada multimodal: estado del robot más tres vistas de cámara (tamaño 3×256×256).
- Ejecución de tareas de manipulación en mesa, como empujar objetos, recoger y colocar cubos, y clasificar bloques.
- Integración nativa con el ecosistema LeRobot, incluyendo scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- Desplegable en hardware de consumo, según la filosofía de diseño de SmolVLA.
- No incluye soporte de tool calling, generación de texto ni razonamiento simbólico; es exclusivamente un policy de control robótico.

## Casos de uso

- Autonomía en robótica de laboratorio: el modelo puede controlar un brazo robot tipo `Follower` para mover objetos en un entorno de mesa sin intervención humana, usando las tres cámaras como entrada visual.
- Investigación en aprendizaje por imitación: al estar integrado con LeRobot, resulta útil para comparar políticas de bajo coste computacional frente a VLA de mayor tamaño en tareas de manipulación.
- Prototipado rápido de manipulación industrial: tareas de recoger y colocar piezas en posiciones definidas, como los entrenados en el dataset, pueden replicarse en entornos controlados.
- Educación y demostraciones de robótica: gracias a su bajo coste de hardware y su licencia Apache 2.0, puede utilizarse en cursos o laboratorios docentes para experimentar con políticas visión-lenguaje-acción.
- Despliegue en robots de bajo presupuesto: su tamaño de 450M permite ejecutarse en GPUs de consumo, habilitando robots domésticos o de investigación sin infraestructura pesada.
- Benchmarking de políticas VLA: se puede emplear como baseline de un modelo compacto frente a alternativas mayores en tareas de mesa, siempre que se adapten las entradas de cámara y estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación real en robot, por lo que no se pueden presentar métricas comparativas fiables.

## Requisitos de hardware

- VRAM estimada: los pesos en FP16 ocupan aproximadamente 0,9 GB, por lo que la inferencia debería caber en GPUs con al menos 2 GB de VRAM, más margen para el preprocesado de tres imágenes y las activaciones. Se estima un consumo típico de 2 a 4 GB en la práctica.
- GPU recomendadas: modelos consumer como RTX 3060 12 GB, RTX 4070, o superiores. En entornos sin GPU, se puede intentar ejecución CPU, pero la latencia será alta.
- Compatibilidad: el modelo es ligero y entra en la mayoría de tarjetas gráficas de consumo actuales.
- Opciones de despliegue: LeRobot para ejecución de políticas, con soporte para PyTorch y CUDA. No se indica soporte específico para vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmark para este fine-tune concreto, por lo que no se puede establecer una comparativa cuantitativa con otros modelos. Cualitativamente, se puede situar frente a la familia SmolVLA (como `lerobot/smolvla_base`) de la que deriva, y frente a VLA de mayor tamaño como OpenVLA, aunque sin datos numéricos disponibles.

| Modelo | Parámetros | Licencia | Uso principal |
|---|---|---|---|
| mysterium99/smolvla-100pct-different | 450M | Apache 2.0 | Robótica de manipulación en mesa |
| lerobot/smolvla_base | No disponible | Apache 2.0 | Base pretrained para VLA |
| OpenVLA (referencia) | 7B | No disponible en esta fuente | Generalista, manipulación robótica |

## Limitaciones y advertencias

- Sin resultados de evaluación en robot publicados: no se puede confirmar la tasa de éxito en tareas reales fuera de las condiciones de entrenamiento.
- Dataset de entrenamiento pequeño (240 episodios) y específico: el modelo puede tener dificultades para generalizar a nuevas tareas, objetos o iluminación no vistas.
- Sesgos inherentes al dataset: al estar entrenado en tres tareas concretas, el policy puede fallar ante variaciones de posición, distracciones o configuraciones de cámara distintas.
- Riesgo de sobreajuste: la limitada cantidad de datos y el específico conjunto de tareas pueden llevar a un comportamiento degenerado en entornos distintos.
- No es un modelo de lenguaje: aunque se denomine VLA, su función es generar acciones de control; no sirve para diálogo, generación de texto ni funciones de razonamiento general.
- Dependencia del ecosistema LeRobot: la integración con este framework es necesaria para cargar el modelo correctamente, y las claves de observación deben coincidir exactamente con las usadas en entrenamiento.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla-100pct-different
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset `ds_merged`: https://huggingface.co/datasets/ds_merged
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
