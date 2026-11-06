# Icey444/3d-ckpts-v3

## Resumen

Icey444/3d-ckpts-v3 es un fine-tuning de Qwen/Qwen2.5-VL-3B-Instruct orientado a razonamiento espacial y comprensión de escenas 3D, desarrollado por el usuario Icey444 y publicado en Hugging Face. El modelo parte de la arquitectura Qwen2.5-VL de 3B parámetros en su variante Instruct y se especializa mediante entrenamiento con GRPO (Group Relative Policy Optimization) sobre el framework verl, empleando el dataset ScanQA como referencia para tareas de question answering sobre entornos 3D escaneados.

La relevancia del modelo radica en su enfoque: aplicar aprendizaje por refuerzo con verificación (RLVR) a un modelo visión-lenguaje compacto para mejorar el razonamiento espacial en contextos embodied, un área donde los modelos generalistas suelen fallar al requerir comprensión de relaciones tridimensionales, posiciones relativas y navegación. El repositorio está etiquetado con "embodied", "spatial-reasoning" y "3d", lo que indica su orientación a agentes que operan en entornos físicos o simulados.

No obstante, el repositorio presenta características atípicas: un tamaño de 390,2 GB para un modelo de 3B parámetros sugiere la inclusión de múltiples checkpoints intermedios del entrenamiento GRPO más que un único conjunto de pesos finales. El acceso está restringido (gated) y no se han publicado resultados de benchmarks ni detalles de configuración de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen2.5-VL), fine-tuning con GRPO |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-VL-3B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa imágenes y texto mediante un encoder visual acoplado a un decoder de lenguaje. Sobre esta base, el autor aplica un ciclo de fine-tuning con GRPO utilizando el framework verl, una librería de RL para modelos de lenguaje que permite entrenamiento distribuido con recompensas verificables. El dataset de referencia es ScanQA, un benchmark de question answering sobre escenas 3D reales (interiores escaneados) que requiere localizar objetos y razonar sobre relaciones espaciales.

La elección de GRPO implica que el entrenamiento optimiza el modelo mediante muestreo de múltiples respuestas por prompt y comparación relativa dentro del grupo, sin necesidad de un modelo crítico separado. Esto es especialmente adecuado para tareas con respuesta verificable, como identificar la posición de un objeto en una escena 3D. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScanQA, ni si se aplicaron etapas adicionales de SFT o DPO. El tamaño del repositorio (390,2 GB) sugiere que se almacenan múltiples checkpoints del proceso de RL, no solo el modelo final.

## Capacidades

- Razonamiento espacial sobre escenas 3D: identificación de posiciones relativas, distancias y relaciones entre objetos en entornos escaneados.
- Question answering visual sobre entornos 3D (ScanQA): respuesta a preguntas del tipo "¿dónde está el objeto X?" o "¿qué hay junto a Y?".
- Comprensión de imágenes 2D heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Generación de texto y razonamiento multi-paso, potenciado por el entrenamiento con GRPO.
- Capacidades embodied: orientación a agentes que operan en entornos físicos o simulados.
- Soporte multilingüe: no confirmado en la información disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica para este fine-tuning).
- Tool calling y function calling: no confirmado explícitamente para este checkpoint.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Robótica de interior y navegación asistida: el modelo puede responder consultas sobre la localización de objetos en un escaneo 3D de una habitación, útil para planificación de trayectorias en robots domésticos que necesitan saber dónde está la nevera o la mesa.
- Asistentes de realidad aumentada: integración en aplicaciones que superponen información sobre entornos reales, usando el razonamiento espacial para indicar posiciones relativas de objetos al usuario.
- Análisis de escenas para accesibilidad: descripción de entornos 3D a personas con discapacidad visual, explicando la disposición de muebles y obstáculos en una habitación escaneada.
- Evaluación de datasets 3D: uso como modelo de referencia para validar anotaciones en datasets de interiores, comparando sus respuestas con las etiquetas ground truth de ScanQA.
- Investigación en RL para VLMs: el repositorio con múltiples checkpoints permite estudiar la evolución del entrenamiento GRPO y comparar etapas intermedias, útil para investigadores que analizan dinámicas de aprendizaje por refuerzo.
- Prototipado de agentes embodied en simulación: integración en entornos simulados (Habitat, AI2-THOR) donde el agente necesita razonar sobre la escena antes de actuar, aprovechando el contexto visual 3D.
- Sistemas de inventario visual: identificación y localización de objetos en escaneos de almacenes o espacios comerciales para tareas de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 para los 3B parámetros del modelo base; en cuantización 4-bit (si se generara) rondaría 2-3 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para entrenamiento o inferencia con lotes grandes; RTX 3090/4080 suficientes para inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 (Qwen2.5-VL-3B es un modelo compacto), aunque el procesamiento de imágenes 3D puede incrementar el uso de memoria.
- Opciones de despliegue: vLLM, TGI y transformers para el modelo base; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. El tamaño del repositorio (390 GB) implica que la descarga completa es costosa; se recomienda descargar solo el checkpoint final si está identificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Icey444/3d-ckpts-v3 | 3B | No disponible | Razonamiento espacial 3D (GRPO + ScanQA) | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | 32K (modelo base) | Visión-lenguaje generalista | Apache 2.0 | Público |
| LLaVA-1.5-7B | 7B | 4K | Visión-lenguaje generalista | Apache 2.0 (con restricciones) | Público |
| SpatialVLM | 3B-7B | No disponible | Razonamiento espacial 2D/3D | No disponible | Público (investigación) |

La comparativa con SpatialVLM es la más directa por su enfoque en razonamiento espacial, aunque este último se centra en imágenes 2D con anotaciones espaciales. El modelo de Icey444 se distingue por usar GRPO sobre escenas 3D de ScanQA, pero carece de la documentación y benchmarks públicos de las alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar su uso en producción.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su rendimiento real frente al modelo base o alternativas.
- Tamaño del repositorio: 390,2 GB sugiere múltiples checkpoints; sin documentación sobre cuál es el final, el riesgo de usar un checkpoint intermedio es alto.
- Especialización estrecha: el fine-tuning sobre ScanQA puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en tareas de visión 2D no relacionadas con escenas 3D.
- Idiomas no confirmados: aunque Qwen2.5-VL es multilingüe, no se especifica si el fine-tuning preserva esa capacidad.
- Riesgo de alucinación: en tareas de localización espacial, el modelo puede inventar posiciones de objetos no presentes en la escena, especialmente si el entrenamiento con GRPO no cubrió suficientes casos negativos.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentación sobre el dataset de entrenamiento (ScanQA tiene sus propios términos) pueden introducir restricciones adicionales.
- Sin soporte de cuantización publicado: no hay GGUF ni AWQ, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/Icey444/3d-ckpts-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Framework verl: https://github.com/volcengine/verl
- Dataset ScanQA: https://github.com/atr-dbi/ScanQA
- Paper ScanQA: https://arxiv.org/abs/2112.10482
