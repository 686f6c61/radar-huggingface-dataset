# irl-kit/SPARC-Qwen3.5-0.8B-VTFT

## Resumen

SPARC-Qwen3.5-0.8B-VTFT es un modelo de visión-lenguaje (VLM) de 852 millones de parámetros, desarrollado por el equipo irl-kit, que parte del modelo base Qwen3.5-0.8B y lo ajusta completamente (full fine-tuning) para razonamiento espacial encarnado (embodied spatial reasoning) en robótica. El nombre VTFT indica que también se ajusta la torre de visión (vision-tower fine-tuning), a diferencia de otras variantes que la mantienen congelada. El modelo se entrena con datos VQA (Visual Question Answering) generados a partir de las anotaciones SPARC, junto con otros conjuntos de datos como FSD, RoboPoint y LLaVA-OneVision2. Su propósito es que un robot o agente pueda localizar puntos concretos en una imagen (coordenadas 2D) para tareas como "colocar el objeto aquí" o "ir a ese punto", respondiendo en formato JSON estructurado.

La relevancia actual del modelo radica en que es la variante de 0.8B más fuerte evaluada dentro de la familia SPARC-Qwen3.5, logrando un agregado local de 0.605 en benchmarks de razonamiento espacial, superando a la versión con visión congelada (0.596) y acercándose a modelos mucho más grandes como el Qwen3.5-4B (0.698). Al ser un modelo compacto, está pensado para despliegue en dispositivos de borde (edge devices) o como modelo de propósito específico en sistemas robóticos con recursos limitados. La arquitectura base es híbrida (gated delta networks combinadas con transformers) y el contexto nativo del modelo base es de 262K tokens, aunque el entrenamiento de este fine-tune se realizó con una longitud máxima de secuencia de 5600 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (gated delta networks + transformer) con encoder visual y proyector entrenables |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262K (modelo base Qwen3.5-0.8B); entrenado con max seq length 5600 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificables a GGUF/otros) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingüe) |
| Licencia | Apache 2.0 (según documentación de la familia Qwen3.5; no confirmado en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina atención lineal (gated delta networks) con capas transformer tradicionales, lo que permite ventanas de contexto largas (262K) con menor coste computacional que un transformer puro. Sobre esta base, SPARC-Qwen3.5-0.8B-VTFT añade un encoder visual y un proyector de visión, ambos entrenables durante el ajuste. El entrenamiento consiste en un fine-tuning completo (todos los parámetros) durante una época, con una tasa de aprendizaje de 2e-5 y una longitud máxima de secuencia de 5600 tokens. La mezcla de datos de entrenamiento incluye VQA generado por SPARC (con umbral de calidad de anotación de 0.97, ordenado por puntuación y limitado a 700 muestras por objeto), junto con FSD, RoboPoint y LLaVA-OneVision2. No se menciona el uso de RLHF o DPO; el ajuste es supervisado directamente sobre los datos VQA. Una innovación destacable es el uso de anotaciones espaciales automáticas a escala (SPARC) generadas a partir de demostraciones robóticas, lo que permite obtener datos de entrenamiento espacialmente fiables sin anotación manual exhaustiva.

## Capacidades

- Razonamiento espacial encarnado: localiza puntos 2D en imágenes con coordenadas enteras entre 0 y 1000, respondiendo en JSON estructurado.
- Grounding visual: asocia descripciones textuales con ubicaciones concretas en la imagen (p. ej., "la taza", "el borde de la mesa").
- Comprensión de trayectorias y múltiples puntos: puede devolver listas de coordenadas etiquetadas para rutas o múltiples objetivos.
- Respuesta a preguntas visuales (VQA) de tipo espacial, incluyendo tareas como "dónde colocar", "dónde está" o "a qué punto ir".
- Compatible con el pipeline `image-text-to-text` de Transformers y con la plantilla de chat estándar de Qwen3.5 (chat template Jinja).
- Soporte de tool calling y function calling: no se menciona explícitamente, pero al ser un modelo de la familia Qwen3.5, hereda la capacidad de generar JSON estructurado; sin embargo, el uso previsto es la salida de coordenadas, no llamadas a herramientas externas.
- Multilingüe: el modelo base Qwen3.5 es multilingüe, aunque no se especifican los idiomas evaluados para este fine-tune.

## Casos de uso

- Manipulación robótica: el robot recibe una imagen de la escena y debe colocar un objeto en una posición concreta. El modelo devuelve las coordenadas 2D del punto de colocación, que se traducen a comandos de movimiento del brazo robótico.
- Navegación de robots móviles: dado un mapa o vista de cámara, el modelo indica el punto al que debe dirigirse el robot para alcanzar un objetivo descrito en lenguaje natural (p. ej., "ve a la silla").
- Inspección visual guiada por lenguaje: en entornos industriales, el modelo localiza elementos defectuosos o puntos de interés en imágenes de cámaras fijas, devolviendo sus coordenadas para su posterior procesamiento.
- Interfaz de usuario para personas con discapacidad: un usuario señala verbalmente un objeto en una imagen y el modelo lo localiza, permitiendo interacciones con dispositivos asistivos.
- Entrenamiento de otros modelos: las salidas de coordenadas generadas por este modelo pueden usarse como pseudo-etiquetas para entrenar modelos más pequeños o como datos de aumento para otros sistemas de visión.
- Evaluación de benchmarks de razonamiento espacial: sirve como referencia para comparar la calidad de anotaciones espaciales automáticas (SPARC) frente a anotaciones humanas, dado que se entrena específicamente sobre datos SPARC.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en cinco benchmarks espaciales, comparando tres variantes de la familia SPARC-Qwen3.5. Los valores son agregados locales (no se especifica la metodología exacta) y promedios de pointing/VQA según el apéndice del paper.

| Modelo | Agregado | Where2Place | RefSpatial location | GT grounding | RoboRefIt testA | VA Bench-P |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3.5-4B | 0.698 | 72.0 | 59.0 | 79.0 | 85.7 | 65.7 |
| Qwen3.5-0.8B-VTFT | 0.605 | 58.0 | 47.0 | 76.7 | 80.9 | 48.3 |
| Qwen3.5-9B-EO | 0.719 | 76.0 | 68.0 | 78.5 | 85.2 | 68.7 |

El agregado local del modelo de 0.8B (0.605) supera al de la variante con visión congelada (0.596, no mostrada en la tabla). El paper reporta un promedio de 53.2 en tareas de pointing/VQA para esta variante. No se han publicado resultados en benchmarks generales como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.7 GB en FP16 (852M parámetros × 2 bytes), menos de 1 GB en cuantización de 4 bits. Con la entrada de imagen y el contexto, se recomienda al menos 2-3 GB de VRAM para uso cómodo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso CPUs con suficiente RAM (inferencia lenta pero posible).
- Cabe en GPUs consumer de gama baja y media; también es adecuado para dispositivos de borde como Jetson Orin Nano o Raspberry Pi 5 con aceleración.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, o mediante el pipeline de HuggingFace. Para despliegue ligero, puede convertirse a GGUF y usarse con llama.cpp u Ollama, aunque la parte visual requiere soporte multimodal.
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU moderna (RTX 4090), se espera una latencia de decodificación por token inferior a 10 ms; en CPU, puede ser de 50-200 ms por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Agregado espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARC-Qwen3.5-0.8B-VTFT | 852M | 262K (base) | 0.605 | Apache 2.0 (según familia) | HuggingFace |
| Qwen3.5-4B (SPARC) | 4B aprox. | 262K | 0.698 | Apache 2.0 | HuggingFace |
| Qwen3.5-9B-EO (SPARC) | 9B aprox. | 262K | 0.719 | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes SPARC-Qwen3.5, ya que son las únicas con datos de evaluación espacial publicados en la model card. Frente a otros VLM de tamaño similar (como LLaVA-OneVision 0.5B o Phi-3-vision), no hay datos comparativos directos en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en razonamiento espacial y puede degradarse en tareas generales de lenguaje o visión que no impliquen localización de puntos.
- Requiere un formato de prompt muy específico (incluyendo la frase exacta de salida JSON) para obtener resultados óptimos; desviaciones pueden producir respuestas fuera de formato.
- El modo de razonamiento (thinking) debe estar desactivado durante la inferencia para igualar las condiciones de evaluación.
- La licencia no está confirmada en la model card; aunque la familia Qwen3.5 es Apache 2.0 según fuentes externas, conviene verificar antes de uso comercial.
- No se especifican los idiomas evaluados; el rendimiento en idiomas distintos del inglés puede ser inferior.
- Riesgo de alucinación espacial: puede devolver coordenadas plausibles pero incorrectas en escenas complejas o con objetos ambiguos.
- El entrenamiento se realizó con una longitud máxima de secuencia de 5600 tokens; aunque el modelo base soporta 262K, no se ha validado el rendimiento con contextos largos en este fine-tune.
- No se han publicado análisis de sesgos o robustez frente a cambios de iluminación, oclusión o variaciones de cámara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irl-kit/SPARC-Qwen3.5-0.8B-VTFT
- Dataset SPARC-VQA: https://huggingface.co/datasets/irl-kit/SPARC-VQA
- Manifiesto de mezcla de datos: https://huggingface.co/datasets/irl-kit/SPARC-VQA-Mixture
- Paper SPARC (arXiv:2606.13497): https://arxiv.org/abs/2606.13497
- Guía de la familia Qwen3.5 (referencia externa): https://qwen-ai.com/qwen-3-5/
- Qwen3.5-0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Qwen3.5-0.8B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
