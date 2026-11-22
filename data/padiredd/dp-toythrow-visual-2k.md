# padiredd/dp-toythrow-visual-2k

## Resumen

`dp-toythrow-visual-2k` es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, publicada por el usuario `padiredd` en Hugging Face. El modelo aprende una tarea concreta de manipulación (aparentemente el lanzamiento de un objeto de juguete, a juzgar por el nombre y el dataset `toy-throw-visual-2k-3cam`) a partir de demostraciones con tres cámaras, y se distribuye como un checkpoint de 100 000 pasos en formato `safetensors` dentro de un repositorio de 11,5 GB.

Con 287 533 680 parámetros, es un modelo de tamaño medio para estándares de políticas robóticas, entrenado con un recetario explícito (batch 32, semilla 1000, aumentación de imagen activada) y publicado junto a checkpoints intermedios cada 10 000 pasos. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de investigación orientado a control robótico dentro del ecosistema LeRobot.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de diffusion policy con LeRobot y del fork `lerobot-cyclo` de ROBOTIS, y permite a otros grupos inspeccionar la evolución del entrenamiento paso a paso. La información pública disponible es muy limitada: no hay licencia declarada, ni idiomas, ni resultados de benchmarks, ni model card detallada más allá de los metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), condicionada por observaciones visuales de 3 cámaras |
| Parametros totales | 287 533 680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 11,5 GB, checkpoints por paso) |

## Arquitectura y entrenamiento

El modelo es una diffusion policy implementada en LeRobot: en lugar de predecir directamente una acción, aprende a generar trayectorias de acción mediante un proceso de difusión condicionado por observaciones (imágenes de tres cámaras del dataset `local/toy-throw-visual-2k-3cam`). La model card no detalla el backbone visual ni el número de pasos de difusión, por lo que esos datos no están disponibles.

El entrenamiento se realizó con el fork `lerobot-cyclo` de ROBOTIS, con 100 000 pasos, batch de 32, semilla 1000 y aumentación de imagen activada. No se especifica co-entrenamiento (alpha `None`, split episode `None`) ni el número de episodios o tokens del dataset. El repositorio incluye el checkpoint final en la raíz y checkpoints intermedios en `step-10000/` hasta `step-90000/`, lo que facilita el análisis de la curva de aprendizaje.

## Capacidades

- Generación de trayectorias de acción para control robótico a partir de observaciones visuales multi-cámara (tres cámaras según el nombre del dataset).
- Ejecución de una tarea específica de manipulación (lanzamiento de un objeto de juguete), no de propósito general.
- Integración con el ecosistema LeRobot mediante `from_pretrained("padiredd/dp-toythrow-visual-2k")`.
- Checkpoints intermedios para evaluar el rendimiento en distintos puntos del entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo thinking: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, OCR, etc.); la visión se usa únicamente como condicionamiento de la política.

## Casos de uso

- Reproducción de experimentos de diffusion policy: cargar el checkpoint con LeRobot y comparar la política final con los checkpoints intermedios para estudiar la convergencia del entrenamiento.
- Base para fine-tuning en tareas de lanzamiento o manipulación con brazos ROBOTIS: el fork `lerobot-cyclo` y el formato de dataset permiten adaptar la política a un nuevo conjunto de demostraciones.
- Evaluación de pipelines de aumentación de imagen en robótica: la model card indica aumentación activada, por lo que sirve como referencia para medir su efecto en tareas visuales.
- Docencia y formación en aprendizaje por imitación: el modelo y sus checkpoints por paso son un ejemplo didáctico de un entrenamiento completo de 100 000 pasos con semilla fija.
- Benchmark interno de infraestructura de entrenamiento: el recetario (batch 32, 100 000 pasos, 11,5 GB de repo) permite estimar costes de cómputo y almacenamiento en despliegues LeRobot.
- Pruebas de integración de LeRobot en entornos de simulación o laboratorio antes de entrenar políticas propias, gracias a la API estándar `from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 287,5 M de parámetros, en FP32 serían aproximadamente 1,15 GB de pesos, y en FP16 unos 0,6 GB, a lo que habría que sumar el backbone visual y el estado de difusión (no cuantificado en la model card).
- GPU recomendadas: no disponible; cualquier GPU con suficiente memoria para el backbone visual y el proceso de difusión debería bastar, pero no se especifica.
- Cabe en GPU de consumo: probablemente sí por tamaño de parámetros, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (`from_pretrained`), con soporte del fork `lerobot-cyclo` de ROBOTIS; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-toythrow-visual-2k | 287,5 M | no aplica | Diffusion policy para lanzamiento de juguete | no disponible | Hugging Face (0 descargas) |
| Otras diffusion policies de LeRobot | no disponible | no aplica | Manipulación robótica | variable | Hugging Face |
| ACT (Action Chunking Transformer) de LeRobot | no disponible | no aplica | Manipulación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- El modelo está entrenado para una tarea y un dataset concretos (`toy-throw-visual-2k-3cam`); no generaliza a otras tareas sin fine-tuning.
- No hay benchmarks ni métricas de éxito publicadas, por lo que se desconoce su tasa de acierto real.
- Riesgo de sobreajuste al entorno de captura (tres cámaras, condiciones de laboratorio); no se documenta robustez ante cambios de iluminación, cámara o disposición de objetos.
- Sesgos conocidos: no disponibles; al ser una política entrenada con demostraciones limitadas, es probable que herede los sesgos de la distribución de datos, pero no se cuantifica.
- El repositorio ocupa 11,5 GB por los checkpoints intermedios; hay que prever espacio de almacenamiento y ancho de banda para descargarlo.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier evaluación con benchmarks tipo MMLU o HumanEval no aplica.
- La model card es mínima y no documenta el backbone visual, los pasos de difusión ni la composición del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-toythrow-visual-2k
- LeRobot (librería): https://github.com/huggingface/lerobot
- Fork `lerobot-cyclo` de ROBOTIS: no disponible (no se proporciona URL en la información)
- Dataset `toy-throw-visual-2k-3cam`: no disponible públicamente (ruta local `data_local/lerobot/toy-throw-visual-2k-3cam`)
