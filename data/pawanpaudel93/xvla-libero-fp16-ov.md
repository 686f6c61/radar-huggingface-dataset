# pawanpaudel93/xvla-libero-fp16-ov

## Resumen

X-VLA LIBERO en formato OpenVINO es una conversión del checkpoint `lerobot/xvla-libero` empaquetada como `policy_package` para el motor `ov-policy` de Cascadia. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, concretamente ajustado sobre el benchmark LIBERO, que traduce observaciones visuales y estado proprioceptivo del robot en secuencias de acciones de 7 dimensiones. El paquete lo publica el usuario pawanpaudel93 y no es un modelo nuevo: es una copia modificada y convertida del checkpoint original de LeRobot, con pesos en fp16 dentro de un grafo float32 y entrada de ruido explícita.

La relevancia de esta ficha está en el formato, no en el modelo en sí. El paquete permite ejecutar la política VLA en CPUs y GPUs Intel mediante OpenVINO, sin depender de PyTorch en tiempo de inferencia, lo que facilita el despliegue en hardware de borde y estaciones de trabajo con aceleradores integrados. El autor reporta una verificación sobre `libero_spatial` en la que la versión OpenVINO fp16 iguala o supera ligeramente a la implementación PyTorch de referencia.

No hay información publicada sobre idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks más allá de la verificación mencionada. Todo lo que sigue se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (X-VLA de LeRobot); grafo OpenVINO float32 con pesos fp16 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrada `task` de 50 tokens) |
| Tipos de cuantización | fp16 (pesos) sobre grafo float32; el autor verifica también CPU f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO `policy_package` (IR de OpenVINO); repo de 1.8 GB |

## Arquitectura y entrenamiento

El modelo subyacente es X-VLA en su variante LIBERO, integrado en el ecosistema LeRobot. La política consume tres entradas visuales y de estado: dos imágenes RGB de 3×224×224 (`images.image` e `images.image2`), un vector de estado de 8 dimensiones y una instrucción de tarea tokenizada de longitud 50. Produce una secuencia de acciones de 30×7, es decir, 30 pasos de horizonte con 7 dimensiones de acción por paso. La conversión introduce el ruido como entrada explícita (`noise` de forma 30×20), lo que expone el muestreo del proceso generativo al cliente en lugar de gestionarlo internamente.

El paquete no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden al checkpoint original `lerobot/xvla-libero` y no se reproducen aquí. La modificación técnica declarada por el autor consiste en reorganizar los módulos de LeRobot en el formato de manifiesto de Intel, fijar los pesos en fp16 dentro de un grafo float32 y aplicar un volteo horizontal de `image2` en el host (`image_flip`), de modo que el cliente envíe los fotogramas tal como los entrega el entorno. La verificación numérica reportada indica una diferencia máxima de 2,9e-4 entre la ejecución OpenVINO en CPU f32 y PyTorch.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones visuales y estado proprioceptivo.
- Procesamiento de dos vistas de cámara simultáneas (3×224×224 cada una).
- Condicionamiento por instrucción de tarea en lenguaje natural (hasta 50 tokens).
- Ejecución de políticas de manipulación ajustadas sobre LIBERO, en particular la suite `libero_spatial`.
- Inferencia en CPU y GPU Intel mediante OpenVINO, sin dependencia de PyTorch en runtime.
- Entrada de ruido explícita que permite controlar el muestreo desde el cliente.
- No se declaran capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de políticas VLA en entornos de investigación: el paquete permite reproducir los episodios de `libero_spatial` en hardware Intel sin montar un stack PyTorch completo, lo que simplifica la comparación entre implementaciones.
- Despliegue en robots de laboratorio con CPU o iGPU Intel: al ejecutarse con OpenVINO, la política puede correr en estaciones sin GPU dedicada, reduciendo el coste del banco de pruebas.
- Integración en el motor Cascadia `ov-policy`: sirve como policy de referencia para validar el pipeline de serving `cascadia run --engine ov-policy --device GPU`.
- Prototipado de pipelines de manipulación con dos cámaras: la interfaz de dos imágenes y estado de 8 dimensiones encaja con configuraciones habituales de brazo robótico más pinza.
- Benchmarking de conversión de modelos: útil para medir la degradación numérica al pasar de PyTorch a OpenVINO fp16, dado que el autor publica la tolerancia observada (2,9e-4 en CPU f32).
- Docencia y demostraciones de VLA: el tamaño del repo (1,8 GB) y la licencia Apache-2.0 permiten distribuirlo en cursos y talleres sin restricciones de uso comercial.
- Pruebas de control por instrucciones cortas: la entrada `task` de 50 tokens admite consignas concisas típicas de tareas de manipulación, como colocar o apilar objetos.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| LIBERO `libero_spatial` (10 × 3) | OpenVINO, Arc 140V GPU, fp16 | 26/30 |
| LIBERO `libero_spatial` (10 × 3) | LeRobot PyTorch, CPU f32 | 25/30 |
| Diferencia numérica | OpenVINO CPU f32 vs PyTorch | ≤ 2,9e-4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores provienen únicamente de la sección de verificación de la model card y no incluyen intervalos de confianza ni repeticiones múltiples.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 1,8 GB, lo que sugiere un footprint de pesos en el orden de 1-2 GB, pero no se confirma.
- GPU recomendadas: el autor verifica en una GPU Intel Arc 140V (iGPU de portátil). No se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: el paquete está pensado para CPUs y GPUs Intel vía OpenVINO; no se declara soporte para CUDA ni para GPUs NVIDIA.
- Opciones de despliegue: motor Cascadia `ov-policy` (comando `cascadia run ./xvla-libero-fp16-ov --engine ov-policy --device GPU`). Se requiere una build de Cascadia con este tipo de política, que según el autor aún no está en una release (labscommunity/cascadia, en revisión). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| pawanpaudel93/xvla-libero-fp16-ov | VLA convertido a OpenVINO | 2 imágenes 224×224, estado 8, tarea 50 tokens | Apache-2.0 | Hugging Face, requiere Cascadia con `ov-policy` |
| lerobot/xvla-libero | VLA original en PyTorch | mismas entradas (modelo fuente) | Apache-2.0 (según el paquete) | Hugging Face |
| Otros VLA de manipulación (p. ej. OpenVLA, π0) | VLA | no disponible en esta información | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas. La comparación más directa y fiable es contra el checkpoint fuente `lerobot/xvla-libero`, del que este paquete es una conversión.

## Limitaciones y advertencias

- Es una copia modificada del checkpoint original: los resultados pueden diferir de los del modelo fuente por la conversión a fp16 y por el volteo de `image2` en el host.
- El motor necesario (`ov-policy` de Cascadia) no está en una release estable según la propia model card; el despliegue depende de una build en revisión.
- El alcance está limitado a políticas de manipulación tipo LIBERO; no es un modelo de propósito general ni un LLM conversacional.
- No hay información sobre sesgos, tasas de alucinación ni robustez fuera de la distribución de LIBERO.
- La evaluación reportada es pequeña (30 episodios) y sobre una única suite (`libero_spatial`); no cubre otras suites de LIBERO.
- Solo se declara soporte para CPUs y GPUs Intel vía OpenVINO; no hay evidencia de funcionamiento en NVIDIA, AMD ni Apple Silicon.
- La licencia Apache-2.0 permite uso comercial, pero el autor no detalla obligaciones adicionales derivadas del modelo base más allá de incluir una copia de la licencia.
- Idiomas soportados no disponibles: la entrada de tarea es una secuencia de 50 tokens sin vocabulario declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/xvla-libero-fp16-ov
- Modelo base: https://huggingface.co/lerobot/xvla-libero
- Repositorio Cascadia (en revisión): labscommunity/cascadia
- OpenVINO: https://docs.openvino.ai
- LeRobot: https://github.com/huggingface/lerobot
