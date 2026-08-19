# irl-kit/SPARC-Qwen3.5-4B

## Resumen

SPARC-Qwen3.5-4B es un modelo de visión-lenguaje (VLM) desarrollado por el equipo irl-kit, que parte del modelo base Qwen3.5-4B de Alibaba y lo afina por completo para tareas de razonamiento espacial embebido en robótica. El modelo está entrenado con datos VQA generados automáticamente a partir de anotaciones SPARC (Spatial Annotations from Robot Demonstrations at Scale), un método que produce anotaciones espaciales fiables a partir de demostraciones robóticas. Su objetivo es permitir que un agente robótico localice puntos concretos en una imagen (coordenadas 2D) a partir de instrucciones en lenguaje natural, algo fundamental para tareas como "coloca el objeto en la esquina superior derecha" o "apunta al mango de la taza".

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), es denso y multimodal (entrada de imagen y texto, salida de texto). La arquitectura base soporta un contexto nativo de 262.144 tokens, aunque el fine-tuning se realizó con una longitud máxima de secuencia de 5.600 tokens. El encoder de visión se mantiene congelado durante el entrenamiento, mientras que el proyector de visión y el resto del modelo se ajustan. La relevancia actual radica en que ofrece un equilibrio entre tamaño compacto (4B) y capacidades de razonamiento espacial de alto nivel, comparable a modelos mucho más grandes en benchmarks específicos de robótica y grounding visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base; el fine-tuning se realizó con secuencias de hasta 5.600 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero la model card no especifica los del fine-tuning) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal que procesa imágenes y texto. La arquitectura sigue la de Qwen3.5-4B, con un encoder de visión que extrae características visuales, un proyector que las alinea con el espacio de embeddings de texto, y un decoder de lenguaje que genera respuestas. Durante el fine-tuning, el encoder de visión se congela y solo el proyector y el decoder se actualizan. El entrenamiento se realizó durante una época con una tasa de aprendizaje de 2e-5 y una longitud máxima de secuencia de 5.600 tokens.

El conjunto de entrenamiento combina datos VQA generados con SPARC (a partir de anotaciones de demostraciones robóticas, con umbral de calidad 0,97 y un máximo de 700 muestras por objeto), junto con los datasets FSD, RoboPoint y LLaVA-OneVision2. El paper reporta 1.159.047 pares de entrenamiento para esta mezcla. No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tuning supervisado estándar sobre datos de instrucción visual.

## Capacidades

- Razonamiento espacial en imágenes: localiza puntos 2D (coordenadas enteras entre 0 y 1000) a partir de instrucciones en lenguaje natural.
- Grounding visual referencial: identifica la posición de objetos o regiones mencionados en la instrucción (p. ej., "el plato azul").
- VQA (Visual Question Answering) orientado a robótica: responde preguntas sobre relaciones espaciales, ubicaciones y trayectorias.
- Generación de salidas estructuradas en JSON: devuelve listas de puntos con etiquetas, lo que facilita la integración en pipelines robóticos.
- Soporte de múltiples puntos y trayectorias: puede devolver secuencias de coordenadas para rutas o múltiples objetivos.
- Capacidades multilingües: no confirmadas para este fine-tuning, aunque el modelo base Qwen3.5-4B soporta varios idiomas.
- No se indica soporte de tool calling ni modo agente explícito; el modelo está orientado a tareas de percepción espacial.

## Casos de uso

- Manipulación robótica guiada por lenguaje: un robot puede recibir la instrucción "coge la taza por el asa" y el modelo devuelve las coordenadas exactas del asa en la imagen de la cámara, permitiendo al brazo robótico planificar el agarre.
- Navegación autónoma en entornos domésticos: el modelo puede señalar la ubicación de un objeto en el mapa visual captado por el robot, ayudando a planificar rutas hacia ese objeto.
- Inspección industrial de calidad: dado un componente en una línea de producción, el modelo localiza puntos de interés (tornillos, soldaduras) a partir de instrucciones como "señala la esquina superior izquierda del panel".
- Asistencia a personas con discapacidad visual: el modelo puede convertir instrucciones espaciales del usuario en coordenadas que un dispositivo wearable utilice para guiar la mano hacia un objeto.
- Entrenamiento de robots por demostración: las anotaciones SPARC generadas por el modelo pueden utilizarse para crear datasets de entrenamiento de políticas robóticas, reduciendo el coste de anotación manual.
- Simulación y planificación de trayectorias: el modelo puede generar múltiples puntos de una trayectoria en una imagen, útil para planificar movimientos de pinza o herramientas en entornos simulados.
- Interfaz de realidad aumentada: al recibir una instrucción verbal, el modelo devuelve coordenadas que un sistema de AR superpone sobre la vista del usuario para resaltar el objeto objetivo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación en tareas de pointing y VQA espacial. El agregado es una media ponderada de las tareas listadas.

| Modelo | Aggregate | Where2Place | RefSpatial location | GT grounding | RoboRefIt testA | VA Bench-P |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3.5-4B (SPARC) | 0.698 | 72.0 | 59.0 | 79.0 | 85.7 | 65.7 |
| Qwen3.5-0.8B-VTFT | 0.605 | 58.0 | 47.0 | 76.7 | 80.9 | 48.3 |
| Qwen3.5-9B-EO | 0.719 | 76.0 | 68.0 | 78.5 | 85.2 | 68.7 |

Estos valores son los reportados en el paper (arXiv:2606.13497). No se proporcionan resultados de benchmarks generales como MMLU o HumanEval para este fine-tuning específico.

## Requisitos de hardware

- El modelo tiene ~4,5 B parámetros, por lo que en FP16 requiere aproximadamente 9 GB de VRAM solo para los pesos. Con cuantización de 8 bits (~4,5 GB) o 4 bits (~2,3 GB) podría ejecutarse en GPUs consumer.
- Según la información del modelo base Qwen3.5-4B, este cabe en 8 GB de VRAM con cuantización y en 16 GB con contexto completo (262K). Para este fine-tuning no se proporcionan datos específicos, pero al ser el mismo tamaño, las necesidades son similares.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100, H100, o cualquier GPU con al menos 8-10 GB de VRAM para FP16.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). No se menciona compatibilidad explícita con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento (agregado) |
|---|---|---|---|---|---|
| SPARC-Qwen3.5-4B | 4,54 B | 262K (base) | No disponible | Razonamiento espacial robótico | 0.698 |
| Qwen3.5-0.8B-VTFT | 0,8 B | No disponible | No disponible | Razonamiento espacial robótico (versión ligera) | 0.605 |
| Qwen3.5-9B-EO | 9 B | No disponible | No disponible | Razonamiento espacial robótico con datos adicionales (EO-1.5M) | 0.719 |
| Qwen3.5-4B (base) | 4 B | 262K | Apache 2.0 | VLM general multimodal | No comparable directamente |

El modelo se sitúa entre la versión ligera de 0,8 B y la versión grande de 9 B, ofreciendo un buen equilibrio entre rendimiento y coste computacional. La versión de 9 B supera al de 4 B en el agregado, pero con el doble de parámetros.

## Limitaciones y advertencias

- El modelo está especializado en razonamiento espacial y VQA robótica; su rendimiento en tareas generales de lenguaje o visión puede ser inferior al del modelo base.
- La salida de coordenadas es en enteros entre 0 y 1000, lo que limita la precisión subpixel. Para aplicaciones que requieran mayor exactitud, puede ser necesario un postprocesado.
- El modelo puede alucinar coordenadas si la instrucción es ambigua o el objeto no está presente en la imagen. Se recomienda validar las salidas con heurísticas o filtros de plausibilidad.
- El fine-tuning se realizó con secuencias de hasta 5.600 tokens; aunque el contexto nativo es mayor, el rendimiento en entradas muy largas no está garantizado.
- La licencia no está especificada en la model card. Aunque el modelo base es Apache 2.0, el fine-tuning puede tener restricciones adicionales. Se debe contactar con el autor antes de uso comercial.
- No se proporcionan datos sobre sesgos demográficos o culturales; el modelo puede heredar sesgos del dataset de entrenamiento, que se centra en entornos robóticos y domésticos.
- No se ha evaluado el modelo en entornos de producción con latencia real; los benchmarks son académicos y pueden no reflejar el comportamiento en escenarios con ruido visual o iluminación variable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irl-kit/SPARC-Qwen3.5-4B
- Dataset SPARC-VQA: https://huggingface.co/datasets/irl-kit/SPARC-VQA
- Dataset SPARC-VQA-Mixture: https://huggingface.co/datasets/irl-kit/SPARC-VQA-Mixture
- Paper arXiv: https://arxiv.org/abs/2606.13497 (SPARC: Reliable Spatial Annotations from Robot Demonstrations at Scale)
- Modelo base Qwen3.5-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B (referencia, no el mismo modelo)
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
