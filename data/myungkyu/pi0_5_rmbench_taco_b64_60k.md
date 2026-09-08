# Myungkyu/pi0_5_rmbench_taco_b64_60k

## Resumen

El modelo `Myungkyu/pi0_5_rmbench_taco_b64_60k` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario Myungkyu, que actúa como una política de bajo nivel para el benchmark RMBench de manipulación robótica en mesa. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset `Myungkyu/RMBench-taco-gemini`, que incluye demostraciones con anotaciones densas de subtareas. El modelo tiene 4.143.404.816 parámetros (≈4,14 mil millones) y se distribuye en formato safetensors.

Su arquitectura, Pi0.5, recibe tres vistas de cámara (cabeza, muñeca izquierda y muñeca derecha), información de propriocepción y el texto de la subtarea actual. Además, incorpora un slot de keyframe que permite recuperar un frame pasado cuando la tarea requiere memoria visual, lo que lo hace especialmente relevante para el estudio de manipulación dependiente de memoria.

Este modelo no es un LLM generalista: su función es predecir acciones robóticas de bajo nivel. La relevancia actual radica en que ofrece un checkpoint de referencia fine-tuned para la investigación en VLA y benchmarks de memoria como RMBench, aunque al tratarse de un modelo sin descargas ni validación externa, debe manejarse como un experimento de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo visión-lenguaje-acción) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en Pi0.5, un modelo multimodal que integra entradas visuales, de propriocepción y textuales para generar acciones de bajo nivel en robótica. El checkpoint se ha obtenido mediante fine-tuning sobre el dataset `Myungkyu/RMBench-taco-gemini`, con un tamaño de lote de 64 y 60.000 pasos, y corresponde al checkpoint final del entrenamiento. Según la model card, las configuraciones hacen referencia al backbone y al tokenizador por hub id o por ruta local del sitio de entrenamiento, por lo que es necesario apuntarlas a copias locales antes de cargar el modelo.

El entrenamiento se realizó con anotaciones densas de subtareas etiquetadas de forma offline a partir del contexto específico de la tarea. Una innovación destacable es la inclusión de un slot de keyframe que sigue la convención memory-content `full_frame_v1`: el modelo puede recibir un frame recuperado del pasado como entrada adicional cuando la anotación lo requiere, lo que le permite explotar información de memoria visual para tareas de manipulación dependientes de memoria. El dataset de RMBench comprende 9 tareas simuladas de mesa en RoboTwin.

## Capacidades

- Predicción de acciones de bajo nivel para manipulación robótica: genera comandos de acción a partir de las entradas multimodales.
- Entrada multimodal: tres imágenes (cámara de cabeza, muñecas izquierda y derecha), propriocepción y texto de la subtarea actual.
- Memoria visual: el slot de keyframe acepta un frame pasado recuperado cuando la tarea lo requiere.
- Especialización en RMBench: el modelo está afinado para las 9 tareas simuladas de mesa de este benchmark.
- No se documenta soporte de tool calling, function calling ni razonamiento abstracto multilingüe.

## Casos de uso

- **Investigación en benchmarks de memoria robótica**: el modelo permite ejecutar las 9 tareas de RMBench y comparar el rendimiento con otras políticas, ya que incorpora explícitamente un mecanismo de keyframe para tareas dependientes de memoria.
- **Entrenamiento y transferencia de políticas VLA**: al estar integrado en el ecosistema LeRobot, el checkpoint se puede cargar en pipelines de robot learning para evaluar el impacto del fine-tuning con anotaciones densas de subtareas.
- **Robótica de mesa en simulación**: puede utilizarse en plataformas RoboTwin para testear tareas de apilado, selección de objetos o traslados, simulando entornos antes de pasar a un robot real.
- **Estudio de mecanismos de memoria visual**: el slot de keyframe abstrae la información de un frame pasado, lo que resulta útil para analizar cómo los modelos de acción pueden recordar configuraciones previas de una escena.
- **Fine-tuning para nuevas tareas robóticas**: el modelo puede servir como base para reentrenamientos en otros datasets de manipulación, aprovechando los 60.000 pasos de ajuste que ya incorpora.
- **Integración en pipelines de robot learning**: se puede integrar como política de bajo nivel en un sistema de control de robots con dos brazos y cámara de cabeza, usando LeRobot para la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está diseñado para el benchmark RMBench, pero la model card no incluye métricas de rendimiento, latencias ni comparaciones con otros modelos. Por tanto, no se ofrece ninguna tabla de resultados.

## Requisitos de hardware

- **VRAM estimada**: con 4.143.404.816 parámetros, los pesos en fp16 ocupan aproximadamente 8,29 GB (`4.143.404.816 × 2 bytes`). En una cuantización de 4 bits (no incluida en el repositorio) se estimaría alrededor de 2,07 GB. No se han publicado valores oficiales de VRAM.
- **GPU recomendada**: no se ha publicado una recomendación oficial. Para inferencia en fp16, una GPU con al menos 12-16 GB de VRAM sería necesaria para alojar los pesos; idealmente una tarjeta con 24 GB como la RTX 4090 o A10G proporcionaría margen.
- **¿Cabe en GPU de consumo?**: sí, en GPUs de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, 4080 o 4090) se puede cargar el modelo en fp16, siempre que se gestionen también las entradas visuales.
- **Opciones de despliegue**: no disponible para runtimes de LLM (vLLM, llama.cpp, Ollama, TGI). El modelo se distribuye en safetensors y está asociado a la librería LeRobot, por lo que su carga se realiza a través de esa herramienta.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

En la información proporcionada no se incluyen resultados ni especificaciones de modelos comparables de la misma categoría. El modelo es un checkpoint fine-tuned del mismo backbone `lerobot/pi05_base`, por lo que se ofrece una tabla de referencia en lugar de una comparativa completa:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Myungkyu/pi0_5_rmbench_taco_b64_60k` | 4.143.404.816 | no disponible | no disponible | HuggingFace |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | HuggingFace |

Otros modelos VLA como OpenVLA o X-VLA no se pueden comparar al no existir datos públicos en la model card.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial no está garantizado; hay que contactar al autor antes de cualquier despliegue en producción.
- El modelo es un checkpoint de investigación con 0 descargas y 0 likes, lo que indica una ausencia total de validación externa.
- El repositorio de la model card indica que las configuraciones hacen referencia a rutas locales del sitio de entrenamiento; para cargar el modelo es necesario apuntar a los archivos locales, lo que puede generar errores si no se ajustan.
- El ámbito funcional se limita a 9 tareas simuladas de mesa en RoboTwin. Para aplicaciones en robots reales o escenarios distintos se requiere reentrenamiento o adaptación.
- No se dispone de datos sobre sesgos o alucinaciones en el modelo. Como política de bajo nivel, la mala predicción de acciones puede provocar fallos de manipulación, no alucinaciones textuales.
- El soporte de idiomas no está documentado; el texto de entrada probablemente se limita a anotaciones en inglés del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_rmbench_taco_b64_60k
- Dataset en HuggingFace: https://huggingface.co/datasets/Myungkyu/RMBench-taco-gemini
- Repositorio RMBench: https://github.com/RoboTwin-Platform/RMBench
- Repositorio del autor (myRMBench): https://github.com/myungkyuKoo/myRMBench
