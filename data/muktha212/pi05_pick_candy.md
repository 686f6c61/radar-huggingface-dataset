# muktha212/pi05_pick_candy

## Resumen

`muktha212/pi05_pick_candy` es un fine-tune de robótica (Vision-Language-Action, VLA) del modelo base `lerobot/pi05_base`, que implementa π₀.₅ (Pi05) de Physical Intelligence en el ecosistema LeRobot. El modelo consume una imagen de cámara frontal de 720×1280 y un vector de estado propioceptivo de 6 dimensiones, y produce un vector de acción de 6 dimensiones para un robot tipo `so_follower` (familia SO-100/SO-101). Está especializado en una única tarea: recoger un caramelo y depositarlo en un cuenco.

El interés de esta ficha no está en el modelo en sí (un fine-tune de comunidad con 0 descargas y 0 likes en el momento de la consulta), sino en que documenta el flujo completo de adaptación de π₀.₅ con LeRobot 0.6.1: 50 episodios teleoperados, 19.779 fotogramas a 30 FPS, 3.000 pasos de entrenamiento con AdamW y un learning rate de 2,5e-05. Sirve como ejemplo reproducible de imitación de bajo coste sobre una política VLA preentrenada de aproximadamente 4.140 millones de parámetros.

Arquitectónicamente es un modelo denso (no MoE) distribuido en safetensors con un repositorio de 9,4 GB. La model card no publica resultados de evaluación en robot real, longitud de contexto, idiomas soportados ni variantes cuantizadas, por lo que cualquier uso en producción exige una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones, dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican variantes cuantizadas (GGUF, GPTQ, AWQ); pesos en safetensors en precisión original no documentada |
| Idiomas soportados | No disponible; la política recibe una instrucción de tarea en lenguaje natural (en inglés en el ejemplo de uso), pero no se documentan capacidades multilingües |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 720, 1280) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (una cámara: `front`) |
| Framework | LeRobot 0.6.1 |
| Modelo base | `lerobot/pi05_base` |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA de π₀.₅: un codificador visual y un modelo de lenguaje que condicionan un cabezal de acciones continuas, de forma que la política mapea observaciones (imagen y estado) más una instrucción de tarea a comandos motores de 6 dimensiones. La implementación procede del repositorio OpenPI de Physical Intelligence, adaptada por Hugging Face para LeRobot; la model card no detalla el número de tokens de entrenamiento del preentrenamiento original, la composición del corpus ni si hubo etapas de RLHF o DPO.

El fine-tune se realizó por imitación supervisada sobre el dataset `muktha212/pick_candy_20261015_190154`: 50 episodios, 19.779 fotogramas a 30 FPS, una sola cámara y la tarea "Pick up the candy and place it in the bowl". La configuración fue de 3.000 pasos, batch de 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se documentan aumentos de datos, regularización, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en esta adaptación concreta.

## Capacidades

- Manipulación visomotora de pick-and-place: convierte imagen frontal y estado articular en acciones continuas de 6 grados de libertad.
- Condicionamiento por instrucción de tarea en lenguaje natural, aunque el modelo no genera texto ni mantiene diálogo.
- Generalización a posiciones de objeto no vistas, según la motivación declarada de π₀.₅ (no verificada en esta política, que carece de evaluación publicada).
- Ejecución autónoma en bucle cerrado sobre un robot `so_follower` mediante `lerobot-rollout`.
- Reentrenamiento y fine-tuning sobre nuevos datasets de imitación usando `lerobot-train`.
- No soporta tool calling, function calling, uso de agentes, razonamiento multi-paso explícito, visión general (VQA, OCR), audio ni generación de código.
- No hay capacidades multilingües documentadas; la única entrada lingüística es la etiqueta de tarea.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: ejecutar la política sobre un SO-100/SO-101 para trasladar objetos pequeños a un contenedor, con la instrucción de tarea fija y una cámara frontal a 30 FPS.
- **Punto de partida para nuevos fine-tunes**: usar `lerobot/pi05_base` y este repositorio como referencia de hiperparámetros (3.000 pasos, batch 32, lr 2,5e-05) para entrenar tareas propias con 50 episodios teleoperados.
- **Prototipado rápido de investigación en VLA**: validar en horas si una política preentrenada de 4,14 mil millones de parámetros se adapta a una tarea concreta antes de invertir en datasets mayores.
- **Docencia y formación en LeRobot**: reproducir el pipeline completo (grabación, conversión, entrenamiento, `lerobot-rollout`) con un caso de dificultad controlada y un único objeto.
- **Banco de pruebas de infraestructura robótica**: medir latencia de inferencia y estabilidad del bucle de control a 30 Hz en distintas GPU usando una política de tamaño representativo.
- **Evaluación de robustez frente a cambios de iluminación y posición**: comparar la tasa de éxito con el objeto en posiciones y condiciones de luz distintas de las del dataset original.
- **Clasificación ligera en líneas de montaje**: adaptar la tarea a la separación de piezas por color o forma, siempre que se graben episodios específicos para esa variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla de tabla de éxito por tarea sin cumplimentar. Tampoco se han publicado métricas de latencia, throughput ni tasa de éxito en robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los 4.143.404.816 parámetros ocupan aproximadamente 8,3 GB en FP16/BF16 y 16,6 GB en FP32 solo en pesos; con activaciones del codificador visual a 720×1280 y overhead del runtime, se debe prever un rango de 12-20 GB en FP16. Una cuantización a 8 bits reduciría los pesos a unos 4,1 GB y a 4 bits a unos 2,1 GB, pero no se publican variantes cuantizadas de este repositorio.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB) o H100 para entrenamiento; L4, A10G o RTX 4090 para inferencia en FP16.
- **GPU de consumo**: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16; en RTX 4060 Ti de 16 GB o RTX 4080 es ajustado y probablemente requiera cuantización o reducción de resolución de entrada.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch, y el repositorio OpenPI como referencia de implementación. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que además no encajan con una política VLA de acción continua.
- **Latencia y throughput**: no disponibles. El dataset está grabado a 30 FPS, lo que marca la frecuencia de control objetivo, pero no se han publicado mediciones del tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `muktha212/pi05_pick_candy` | 4,14 mil millones | No disponible | Sin evaluación publicada | Apache 2.0 | Hugging Face (LeRobot), 0 descargas |
| `lerobot/pi05_base` (base) | No disponible en la información | No disponible | No disponible | Apache 2.0 (según el repositorio de origen) | Hugging Face (LeRobot) |
| π₀ (Pi0) de Physical Intelligence | No disponible en la información | No disponible | No disponible | No disponible en la información | Repositorio OpenPI |
| Otras políticas de imitación (ACT, Diffusion Policy) | No disponible en la información | No aplica | No disponible | No disponible | Implementadas en LeRobot |

Los datos de las filas distintas de la primera no están verificados en la información proporcionada y se incluyen solo como referencia de categoría; no se dispone de cifras comparables de parámetros ni de rendimiento para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- **Sesgo de dataset**: 50 episodios de una única tarea, un único objeto y un único operador; la política aprenderá posiciones, iluminación y fondo concretos y puede fallar ante variaciones mínimas.
- **Riesgo de sobreajuste**: 3.000 pasos sobre 19.779 fotogramas sin evaluación publicada ni conjunto de validación documentado; no hay evidencia de que generalice fuera de la distribución de entrenamiento.
- **Alcance limitado**: una sola cámara frontal y una única instrucción de tarea; no es un asistente general ni un modelo de lenguaje utilizable.
- **Ausencia de evaluación**: no se reporta tasa de éxito, por lo que no se puede afirmar ningún nivel de fiabilidad en producción.
- **Dependencia de hardware específico**: las claves de observación y la morfología `so_follower` de 6 dimensiones están fijadas; usarlo con otro robot requiere reentrenamiento.
- **Riesgo de alucinación motora**: como toda política generativa de acciones, puede producir trayectorias plausibles pero incorrectas sin señal de incertidumbre, con riesgo físico para el entorno.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base `lerobot/pi05_base` y del repositorio OpenPI, así como las condiciones de uso del dataset.
- **Idioma**: no se documenta soporte multilingüe en la instrucción de tarea; el ejemplo de uso emplea inglés.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/muktha212/pi05_pick_candy
- Dataset de entrenamiento: https://huggingface.co/datasets/muktha212/pick_candy_20261015_190154
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=muktha212/pick_candy_20261015_190154
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces obtenidos correspondían a un restaurante de París y se han descartado.
