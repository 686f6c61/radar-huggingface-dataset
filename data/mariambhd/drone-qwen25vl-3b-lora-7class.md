# mariambhd/drone-qwen25vl-3b-lora-7class

## Resumen

El modelo `mariambhd/drone-qwen25vl-3b-lora-7class` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario mariambhd, diseñado para el reconocimiento de acciones humanas en vídeo aéreo grabado con drones. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse sobre el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, un transformer multimodal de 3.000 millones de parámetros desarrollado por Alibaba Qwen que combina comprensión de texto e imagen con soporte de vídeo.

El adaptador especializa al modelo base en una tarea cerrada de clasificación de siete clases de acciones: atacar, golpear, patear, aplaudir, saludar con la mano, caminar y correr. La propuesta es relevante porque demuestra cómo un modelo visión-lenguaje de propósito general puede ajustarse con recursos modestos (LoRA) para vigilancia aérea, análisis deportivo o monitorización de multitudes, sin necesidad de entrenar desde cero un clasificador de vídeo específico.

El repositorio tiene un tamaño de 0,0 GB según HuggingFace, cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigación reciente y poco difundido. La model card reporta una validación cruzada de 5 folds con separación por sujeto, con una precisión del 85,00 % ± 7,29 y un F1 macro del 84,66 % ± 7,00.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL (vision-lenguaje) |
| Parametros totales | No disponible (el adaptador LoRA no declara su rango ni el numero de parametros entrenables; el modelo base Qwen2.5-VL-3B-Instruct tiene 3.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen2.5-VL-3B-Instruct; no confirmada para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa texto e imágenes y acepta secuencias de vídeo muestreadas como frames. El ajuste se realiza mediante LoRA, una técnica PEFT que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, reduciendo drásticamente el coste de entrenamiento y el tamaño del artefacto resultante. La model card no especifica el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleados.

El entrenamiento se orienta a clasificación de acciones en vídeo aéreo. El autor aplica un muestreo temporal diferenciado por clase: 16 frames para golpear, aplaudir, caminar y correr, y 8 frames para patear, atacar y saludar con la mano, presumiblemente porque las acciones más rápidas o de menor duración requieren menos contexto temporal. Los frames se redimensionan a 448×252 píxeles antes de la inferencia. La evaluación se realizó con validación cruzada de 5 folds con separación por sujeto (*subject-wise*), lo que evita fuga de información entre train y test al no compartir individuos entre particiones. No se detalla el volumen del dataset, la composición de las clases ni si se aplicaron técnicas de aumento de datos o RLHF/DPO (no procede en una tarea de clasificación supervisada).

## Capacidades

- Clasificación de acciones humanas en vídeo aéreo en 7 clases cerradas: attacking, hitting, kicking, clapping, waving, walking, running.
- Procesamiento de secuencias de vídeo mediante muestreo de frames (8 o 16 según la clase) y redimensionado a 448×252.
- Comprensión multimodal heredada del modelo base Qwen2.5-VL-3B-Instruct (texto e imagen), aunque el adaptador está especializado en la tarea de clasificación.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico para este adaptador.
- No se documentan capacidades multilingües ni modo de pensamiento (*thinking mode*) en la model card.
- No se documentan capacidades de audio.

## Casos de uso

- Vigilancia aérea con drones: el adaptador permite clasificar en tiempo real acciones como atacar, golpear o correr en grabaciones de drones, útil para seguridad en espacios públicos o recintos deportivos, aprovechando el muestreo temporal ajustado por clase.
- Análisis deportivo automatizado: en partidos o entrenamientos grabados desde dron, el modelo distingue entre caminar, correr, patear o golpear, lo que facilita la generación de estadísticas de actividad por jugador.
- Monitorización de multitudes: detección de conductas como atacar o golpear en aglomeraciones, con alertas tempranas para equipos de seguridad, gracias a la validación *subject-wise* que reduce el sobreajuste a individuos concretos.
- Investigación en visión por computador: el adaptador sirve como referencia reproducible de fine-tuning LoRA sobre Qwen2.5-VL para tareas de reconocimiento de acciones, con métricas de validación cruzada publicadas.
- Sistemas de análisis post-evento: revisión forense de grabaciones aéreas para etiquetar automáticamente segmentos de vídeo según la acción detectada, reduciendo el trabajo manual de anotación.
- Robótica y seguimiento autónomo: integración en pipelines de percepción de drones autónomos que necesiten interpretar la actividad de personas en tierra para ajustar su comportamiento o priorizar la transmisión de vídeo.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 3B, puede desplegarse en una GPU de consumo con cuantización del modelo base, lo que facilita pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 85,00 % ± 7,29 |
| F1 macro | 84,66 % ± 7,00 |
| Metodologia | Validacion cruzada de 5 folds con separacion por sujeto (*subject-wise*) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se ofrecen comparaciones con otros modelos de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y en torno a 2-3 GB con cuantizacion de 4 bits, a lo que hay que sumar el adaptador LoRA (de tamano reducido).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, cabria esperar funcionamiento en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, y en GPUs de datacenter como A100 o H100 para mayor throughput.
- Compatibilidad con GPU de consumo: probable con cuantizacion del modelo base, aunque no confirmada por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; el despliegue con vLLM, llama.cpp, Ollama o TGI no esta documentado para este adaptador y depende del soporte de LoRA de cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros adaptadores o clasificadores de acciones en vídeo aéreo, y no se dispone de informacion sobre alternativas equivalentes con metricas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el adaptador LoRA; es imprescindible cargar por separado el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, lo que anade complejidad al despliegue.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial. Es necesario contactar con el autor o revisar la licencia del modelo base antes de usarlo en produccion.
- El modelo esta especializado en 7 clases cerradas; no generaliza a otras acciones ni a dominios distintos del aereo con dron.
- La validacion *subject-wise* con solo 5 folds y una desviacion estandar de ±7,29 puntos porcentuales sugiere una variabilidad considerable entre particiones, lo que indica sensibilidad al conjunto de evaluacion.
- No se documenta el tamano ni la composicion del dataset de entrenamiento, por lo que se desconoce el riesgo de sesgo demografico, de iluminacion o de escenario.
- Riesgo de alucinacion y de falsos positivos en clases visualmente similares (por ejemplo, caminar frente a correr, o golpear frente a patear) no cuantificado.
- No se especifican los idiomas soportados ni el comportamiento multilingue del adaptador.
- El muestreo temporal fijo por clase (8 o 16 frames) puede no adaptarse a videos con velocidades de accion distintas a las del entrenamiento.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
