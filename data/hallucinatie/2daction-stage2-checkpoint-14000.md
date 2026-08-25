# Hallucinatie/2daction-stage2-checkpoint-14000

## Resumen

El modelo `Hallucinatie/2daction-stage2-checkpoint-14000` es un checkpoint de evaluación correspondiente al paso 14.000 de entrenamiento de una política de predicción de acciones para NPC en el juego voxel Minetest. Desarrollado por el usuario Hallucinatie, forma parte de un proyecto de generación de video y predicción de acciones en entornos 2D con profundidad, integrado en un sistema multiagente. El checkpoint contiene los pesos completos de la política `NPCMTPPolicy`, que combina un backbone de video congelado, una rama específica para NPC y una cabeza de acciones estructuradas, con un total de 555.797.900 parámetros.

Este modelo es relevante porque ejemplifica un enfoque de entrenamiento por etapas para agentes autónomos en entornos simulados, donde la predicción de acciones se acopla a un modelo de difusión de píxeles (PixelDiT). Al ser un checkpoint intermedio, su utilidad principal es la evaluación de la política en un punto concreto del entrenamiento, no el despliegue en producción. Su arquitectura y datos de entrenamiento están parcialmente documentados, y requiere un paquete de datos y código externo para funcionar.

La publicación incluye además de los pesos, un script de carga, una configuración de test y una versión parcheada de dos archivos fuente que corrigen un problema de caché KV en el rollout. No se especifican licencia, idiomas soportados ni benchmarks, por lo que su uso comercial o generalizado está restringido y debe consultarse con el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MultiAgentFrameDepthStackPixelDiT (PixelDiT con apilamiento de frames y profundidad) envuelto en NPCMTPPolicy con 4 bloques NPC y horizontes de 8 |
| Parametros totales | 555.797.900 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | Secuencias de 65 frames en entrenamiento/evaluación; 32 frames en rollout (según el parche de caché KV) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (probablemente no aplica, es un modelo de visión/acción) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, model_1.safetensors, ema.safetensors) |

## Arquitectura y entrenamiento

La arquitectura base es un `MultiAgentFrameDepthStackPixelDiT`, es decir, un modelo de difusión de transformadores (PixelDiT) que procesa pilas de frames con información de profundidad para entornos multiagente. Se envuelve en la clase `NPCMTPPolicy`, que añade una rama específica para NPCs y una cabeza de acciones estructuradas. El checkpoint almacena el backbone de video congelado (es decir, no se entrena), la rama NPC y la cabeza de acciones, además de una tabla de embeddings para las clases de voxel en `model_1.safetensors`. También se incluyen valores EMA (Exponential Moving Average) de los 140 tensores entrenables, que se pueden cargar opcionalmente para suavizar el rendimiento.

El entrenamiento se realiza en dos etapas, siendo este el segundo paso (stage2) en el paso 14000. El autor indica que el checkpoint se completó atómicamente antes de un fallo en la ruta de visualización, por lo que los pesos son íntegros. Los datos de entrenamiento provienen de un paquete externo (`xixibuxixi/2daction-stage2`), que incluye el VAE de píxeles, los vocabularios, las incrustaciones de texto de la política y los datos de validación. No se mencionan técnicas de RLHF o DPO, ni la cantidad de tokens o composición exacta del dataset.

La innovación técnica destacada es el parche de código incluido en `code/`, que corrige la gestión de cachés KV durante el rollout. Sin este parche, una secuencia completa posterior puede reutilizar cachés de 32 frames con una secuencia de entrenamiento/evaluación de 65 frames, lo que causaría errores. El parche limpia las cachés en un bloque `finally` para garantizar la corrección.

## Capacidades

- Generación de video y predicción de acciones: el modelo predice acciones estructuradas para NPCs basándose en secuencias de frames de video con profundidad, en un entorno voxel (Minetest).
- Control de agentes autónomos: permite que NPCs tomen decisiones secuenciales en un entorno 2D con profundidad, integrando información visual y de profundidad.
- Multiagente: el nombre `MultiAgentFrameDepthStack` sugiere que soporta múltiples agentes simultáneamente, aunque el checkpoint concreto solo incluye la política de NPC.
- Carga de pesos con EMA: se puede cargar tanto los pesos crudos como los promediados con EMA para evaluar la estabilidad de la política.
- Integración con VAE de píxeles: requiere un VAE de píxeles para codificar/decodificar imágenes, que se proporciona en el paquete de datos externo.

## Casos de uso

- **Evaluación de políticas de NPC en Minetest**: el uso principal es reproducir el checkpoint en el paso 14000 para medir el rendimiento de la política en tareas de navegación, interacción con el entorno o construcción. Se usa con el script `load_weights.py` y el paquete de datos.
- **Investigación en aprendizaje por refuerzo visual**: sirve como referencia para estudiar el efecto de la EMA en políticas entrenadas con modelos de difusión, comparando la versión `use_ema=True` con la `False`.
- **Depuración de pipelines de entrenamiento**: el parche de caché KV incluido es útil para otros modelos de PixelDiT con secuencias largas, ya que muestra cómo evitar la reutilización de cachés de rollout en entrenamiento.
- **Simulación de agentes en entornos voxelizados**: el modelo puede integrarse en simuladores de Minetest para generar comportamientos de NPCs de manera autónoma, aunque requiere el código y datos originales.
- **Análisis de estabilidad de entrenamiento**: al ser un checkpoint intermedio, se puede estudiar la evolución de la política entre pasos (por ejemplo, comparar con otros checkpoints de la etapa 2) para detectar puntos de inflexión.
- **Desarrollo de modelos de predicción de acciones en video**: el enfoque de `PixelDiT` con profundidad puede servir como base para otros proyectos de IA que combinan generación de video con control de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de control de agentes. El modelo no está diseñado para tareas de lenguaje o razonamiento general, sino para predicción de acciones en un entorno visual específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 555.797.900 parámetros, el peso en FP32 ocupa aproximadamente 2,2 GB, en FP16 unos 1,1 GB, y en INT8 unos 0,6 GB. Sin embargo, el modelo incluye un VAE de píxeles y un backbone de video que no están en el checkpoint, por lo que la VRAM total dependerá del paquete de datos y del tamaño de las secuencias (65 frames). Una estimación razonable para inferencia completa estaría entre 8 y 16 GB, según el tamaño del batch y la resolución.
- **GPU recomendadas**: se requiere una GPU con al menos 8 GB de VRAM para secuencias cortas; para secuencias de 65 frames o batch mayores, se recomienda una GPU de 16 GB o superior (por ejemplo, RTX 4090, A100, H100). No hay indicación de soporte para GPUs consumer de menor capacidad.
- **Opciones de despliegue**: el modelo está diseñado para ejecutarse con el código original del paquete fuente, no hay soporte conocido para vLLM, llama.cpp, Ollama o TGI. Se usa directamente con PyTorch y los scripts de carga.
- **Latencia y throughput**: no disponibles, dependen críticamente del VAE y del backbone de video, que no se incluyen en este checkpoint.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (política de predicción de acciones en entornos voxel con PixelDiT). No se puede establecer una comparación con alternativas como modelos de control de agentes en video o generación de video con acciones, ya que no se han identificado referencias. Por lo tanto, no disponible.

## Limitaciones y advertencias

- **Checkpoint intermedio, no para producción**: es un punto de evaluación del paso 14000 de la etapa 2, no un modelo final. No incluye optimizador ni estado de RNG, por lo que no se puede reanudar el entrenamiento directamente.
- **Dependencia de paquete externo**: requiere el paquete de datos y código `xixibuxixi/2daction-stage2` para funcionar. No es un modelo autocontenido.
- **Licencia no especificada**: no se indica licencia, por lo que no está claro si es permitido el uso comercial o la redistribución. Debe consultarse con el autor antes de cualquier uso.
- **Idioma y dominio**: el modelo está entrenado para el entorno de Minetest, no para lenguaje natural ni tareas generales. No soporta interacción en texto.
- **Riesgo de errores en la secuencia**: el parche de caché KV es necesario; sin él, se pueden producir errores al usar secuencias de 65 frames. Además, el checkpoint se completó antes de un fallo en la visualización, aunque los pesos están intactos.
- **Sesgos y alucinación**: no aplicable en el sentido tradicional de LLMs, pero podría generar acciones no válidas o inconsistentes si el entorno de evaluación no coincide con los datos de entrenamiento. No hay información sobre sesgos en el comportamiento de los NPCs.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-14000)
- [Paquete de datos y código fuente](https://huggingface.co/datasets/xixibuxixi/2daction-stage2)
