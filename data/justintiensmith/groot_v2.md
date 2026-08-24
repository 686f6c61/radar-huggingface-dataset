# justintiensmith/groot_v2

## Resumen

`justintiensmith/groot_v2` es un modelo de robótica basado en la arquitectura NVIDIA Isaac GR00T N1.7, una familia de modelos fundacionales de código abierto para razonamiento y habilidades en robots humanoides. Este checkpoint concreto, entrenado con la librería LeRobot, está orientado a la manipulación de objetos con un robot tipo `so_follower` usando dos cámaras (cámara central y cámara de muñeca). El modelo predice acciones de control de 6 grados de libertad a partir de observaciones visuales, estado propio y una instrucción en lenguaje natural.

Con aproximadamente 3.140 millones de parámetros y un tamaño de repositorio de 12.6 GB, el modelo se apoya en un backbone de visión-lenguaje Cosmos-Reason2-2B (basado en Qwen3-VL) y un transformer de acciones con *flow matching*. Está entrenado con un dataset de 1.200 episodios que incluyen tareas de colocación de objetos (tazas, recipientes, bolígrafos, bloques) en un entorno de mesa. Es relevante porque demuestra cómo se puede adaptar un modelo fundacional de robótica de NVIDIA a un conjunto de datos específico mediante LeRobot, y porque su licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (Cosmos-Reason2-2B + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone de visión-lenguaje (VLM) Cosmos-Reason2-2B, que se basa en Qwen3-VL, junto con un transformer de acciones que usa *flow matching* para predecir secuencias de acciones condicionadas por imágenes, lenguaje y propiocepción. El sistema está diseñado para ser *cross-embodiment*, es decir, puede adaptarse a distintos cuerpos robóticos, aunque en este repositorio está configurado para el robot `so_follower`.

El entrenamiento se realizó con la librería LeRobot y el dataset `justintiensmith/VLA_Reasoning_Training_Dataset_1200_2cam`, que contiene 1.200 episodios y 612.733 fotogramas a 30 FPS. Las tareas incluyen colocar objetos (tazas de distintos colores y estados, recipientes de especias, bolígrafos, bloques) en posiciones relativas (dentro de un cuenco, delante de, detrás de, a la izquierda, etc.). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre demostraciones.

## Capacidades

- Control de robot: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y estado propio.
- Razonamiento sobre lenguaje y visión: entiende instrucciones en lenguaje natural como "Move the closed white cup into the bowl" y las traduce a secuencias de acciones.
- Manipulación de objetos: entrenado para tareas de recogida y colocación de objetos con dos cámaras (central y muñeca).
- Generalización limitada a tareas similares a las del dataset (colocación de objetos en posiciones relativas).
- Compatibilidad con el ecosistema LeRobot: se puede cargar, evaluar y desplegar con las herramientas de Hugging Face.

## Casos de uso

- **Investigación en robótica**: el modelo sirve como base para experimentar con aprendizaje por demostración en robots de bajo coste (tipo `so_follower`). Se puede usar en entornos simulados o físicos para evaluar la generalización de tareas de manipulación.
- **Automatización de tareas de pick-and-place**: dado su entrenamiento en colocación de objetos, es adecuado para sistemas de clasificación o empaquetado donde un robot debe mover elementos a posiciones específicas (p. ej., colocar tazas en un cuenco).
- **Prototipado de VLA (Vision-Language-Action)**: el modelo es un ejemplo de cómo adaptar un modelo GR00T a un dataset propio, por lo que sirve como referencia para desarrolladores que quieran entrenar sus propios VLA con LeRobot.
- **Benchmarking de control de robots**: se puede usar en entornos simulados (p. ej., con Isaac Sim) para comparar el rendimiento de distintos modelos de acción en tareas de manipulación con dos cámaras.
- **Educación en robótica y IA**: al ser un modelo abierto y pequeño (3.14B parámetros), es adecuado para cursos y tutoriales sobre aprendizaje por refuerzo y modelos de acción en robótica.
- **Desarrollo de sistemas de control humanoide**: el modelo puede integrarse en pipelines de control de robots humanoides para tareas de manipulación de objetos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de evaluación (como éxito en tareas, precisión de acciones, etc.) en la model card ni en el repositorio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3.144 millones de parámetros y un tamaño de 12.6 GB en safetensors, se estima que la inferencia en FP32 requeriría al menos 12.6 GB de VRAM. Con cuantización (p. ej., FP16) se podría reducir a ~6.3 GB, y con cuantización de 8 bits a ~3.2 GB, aunque no se ofrecen pesos cuantizados.
- **GPU recomendadas**: para inferencia en tiempo real con imágenes de 480x640 y dos cámaras, se recomienda una GPU de gama alta con al menos 16 GB de VRAM (p. ej., RTX 4090, A100). Para entrenamiento o fine-tuning, se necesitarían GPUs con más memoria (A100 80GB o H100).
- **¿Cabe en consumer GPU?**: sí, con cuantización FP16 (8-10 GB) podría ejecutarse en una RTX 3080/4080 (10-12 GB), aunque con latencia mayor. Con cuantización de 8 bits podría caber en 6 GB, pero no se proporcionan pesos cuantizados.
- **Opciones de despliegue**: al ser un modelo de LeRobot, se puede desplegar con las herramientas de LeRobot (Python, PyTorch). No está preparado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto sino de acción robótica.
- **Latencia y throughput**: no disponibles. Dependen del hardware y del framework de inferencia. En un RTX 4090, se espera una latencia de decenas de milisegundos por paso de acción, pero no se han medido oficialmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| **groot_v2** (este) | 3.14B | GR00T N1.7 (Cosmos-Reason2 + flow-matching) | Apache 2.0 | Hugging Face |
| **nvidia/GR00T-N1-2B** | 2B (aprox.) | GR00T N1 (Eagle VLM + flow-matching) | Apache 2.0 | Hugging Face |
| **OpenVLA** | 7B | Prismatic (VLM) + action head | MIT | Hugging Face |

La comparativa se basa en modelos VLA de código abierto. GR00T-N1-2B es el modelo base de NVIDIA, con menor tamaño y sin adaptación a tareas específicas. OpenVLA es una alternativa de 7B con un enfoque similar (VLM para acciones robóticas), pero con arquitectura diferente y mayor tamaño. groot_v2 se diferencia por estar fine-tuneado con un dataset de 1.200 episodios y por usar la versión N1.7 más reciente del backbone Cosmos-Reason2.

## Limitaciones y advertencias

- **Sesgos y limitaciones del dataset**: el modelo solo ha sido entrenado con tareas de colocación de objetos (tazas, recipientes, bolígrafos, bloques) en un entorno de mesa. No generaliza a otros tipos de manipulación (p. ej., apilar, insertar, abrir puertas) ni a entornos no vistos.
- **Riesgo de alucinación**: en robótica, el "alucinación" se manifiesta como acciones incorrectas o inestables ante instrucciones nuevas o escenarios no vistos. El modelo puede fallar si el objeto no está en la posición esperada o si la cámara cambia de ángulo.
- **Limitaciones de contexto**: el modelo no procesa texto largo; su entrada es una instrucción corta y dos imágenes. No admite diálogos ni razonamiento complejo.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el uso del modelo está sujeto a los términos de los componentes subyacentes (p. ej., Qwen3-VL tiene su propia licencia). Se recomienda revisar las licencias de los componentes antes de uso comercial.
- **Caveat para producción**: es un modelo de investigación, no probado en entornos industriales. Requiere un sistema de control robusto y verificación de seguridad. El modelo no incluye mecanismos de seguridad ni de detención de emergencia.
- **Soporte de idiomas**: no se ha especificado, pero al estar basado en Qwen3-VL, probablemente soporte varios idiomas, aunque no está documentado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/justintiensmith/groot_v2)
- [Repositorio de NVIDIA Isaac-GR00T en GitHub](https://github.com/NVIDIA/Isaac-GR00T)
- [Modelo nvidia/GR00T-N1-2B en Hugging Face](https://huggingface.co/nvidia/GR00T-N1-2B)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Perfil del autor en Hugging Face](https://huggingface.co/justintiensmith)
