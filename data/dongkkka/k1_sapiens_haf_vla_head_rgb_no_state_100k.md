# Dongkkka/k1_sapiens_haf_vla_head_rgb_no_state_100K

## Resumen

K1 Sapiens HAF-VLA (checkpoint de 100.000 pasos) es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario Dongkkka y publicado en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/pi05_base` (π₀.₅ de LeRobot) mediante el método jerárquico de flow matching descrito en el artículo HAF-VLA (arXiv:2610.26584). El modelo convierte una única imagen RGB de cabeza y una instrucción en lenguaje natural en trayectorias de control articular para el robot humanoide K1 en simulación MuJoCo.

El modelo resuelve el problema de generar comandos motores de cuerpo completo a partir de percepción visual y lenguaje, con una particularidad: la generación es jerárquica en tres etapas (primero piernas, después piernas y cintura, finalmente todas las articulaciones del cuerpo). La salida son 100 filas de objetivos articulares absolutos a 50 Hz para las 23 articulaciones del K1, en radianes.

Es relevante por su enfoque de flow matching jerárquico aplicado a humanoides, una línea de investigación activa en control robótico con modelos fundacionales. No obstante, se trata de un checkpoint de investigación con cero descargas y cero likes en el momento del análisis, sin benchmarks publicados ni idiomas declarados, por lo que su madurez para producción es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (transformer visión-lenguaje-acción) con cabecera de flow matching jerárquico en tres etapas |
| Parámetros totales | 864.516.880 (parámetros entrenables del checkpoint; el modelo completo incluye además parámetros congelados del base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (las instrucciones de lenguaje se procesan con tokenizador PaliGemma) |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del base π₀.₅ de LeRobot, un VLA que combina un codificador visual (PaliGemma), un modelo de lenguaje y una cabeza de acción basada en flow matching. Sobre esta base, HAF-VLA introduce una generación jerárquica en tres etapas: la primera produce objetivos para las piernas, la segunda para piernas y cintura, y la tercera para el cuerpo completo. El sampler ejecuta diez pasos de denoising por etapa y propaga las claves y valores de atención de cada etapa completada a la siguiente, lo que permite condicionar las etapas posteriores con el contexto de las anteriores.

El checkpoint contiene únicamente los parámetros entrenables tras 100.000 pasos; los parámetros congelados deben inicializarse desde la revisión `22c30e5` de `lerobot/pi05_base` usando LeRobot en el commit `c8ce413`. La entrada es una sola imagen RGB de cabeza más una instrucción en lenguaje; no se usa estado propioceptivo (el nombre del modelo indica `no_state`). La salida son 100 filas de 23 objetivos articulares absolutos a 50 Hz en radianes. No se dispone de información sobre el volumen o composición del dataset de entrenamiento, ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de trayectorias de control articular de cuerpo completo para el humanoide K1 a partir de imagen RGB e instrucción en lenguaje.
- Control jerárquico en tres etapas con propagación de atención entre etapas (piernas, piernas y cintura, cuerpo completo).
- Salida de 100 pasos de acción a 50 Hz para 23 articulaciones en radianes, con recorte (clipping) de valores fuera de rango.
- Condicionamiento por lenguaje natural mediante tokenizador PaliGemma.
- Inferencia determinista con semilla configurable (`policy.seed(42)`).
- Evaluación en simulación MuJoCo aplicando las primeras 40 filas de acción antes de tomar una nueva observación de cámara.
- No soporta tool calling, agentes multi-paso ni capacidades de audio; no se declaran capacidades multilingües.

## Casos de uso

- Investigación en control de humanoides: el modelo sirve como punto de partida para experimentos de flow matching jerárquico en robótica bípeda, permitiendo reproducir y extender los resultados de HAF-VLA en MuJoCo.
- Evaluación de políticas VLA en simulación: integrable en pipelines de evaluación MuJoCo para medir el rendimiento de políticas condicionadas por lenguaje e imagen en tareas de locomoción y manipulación.
- Ajuste fino sobre π₀.₅: al ser un checkpoint de parámetros entrenables sobre un base conocido, facilita experimentos de fine-tuning con datasets propios de robótica sin partir de cero.
- Estudio de arquitecturas jerárquicas de acción: útil para comparar la generación en tres etapas frente a políticas de acción monolíticas en términos de estabilidad y coherencia articular.
- Prototipado de interfaces lenguaje-robot: permite probar instrucciones en lenguaje natural sobre un robot simulado antes de transferir políticas a hardware real.
- Docencia y divulgación en VLA: ejemplo reproducible de integración de PaliGemma, flow matching y control articular con instrucciones de inferencia detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 864,5 millones de parámetros entrenables más los parámetros congelados del base π₀.₅, se requiere una GPU con memoria suficiente para el modelo completo en precisión nativa (orientativamente por encima de 8-16 GB, aunque el dato exacto no está publicado).
- GPU recomendadas: no disponible; se indica PyTorch con CUDA, sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint (3,5 GB) sugiere que podría caber en GPUs de consumo de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: inferencia vía `haf_inference.HafPolicy` con Python 3.12, PyTorch con CUDA, Transformers 5.5.4 y SentencePiece 0.2.1; no se mencionan vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; se conoce la frecuencia de control de 50 Hz y el muestreo de diez pasos de denoising por etapa, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K1 Sapiens HAF-VLA (este) | 864,5 M entrenables | no disponible | Gemma Terms of Use | Hugging Face, 0 descargas |
| lerobot/pi05_base (π₀.₅) | no disponible | no disponible | no disponible | Hugging Face (base) |
| Otros VLA para humanoides | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Requiere inicializar manualmente los parámetros congelados desde una revisión concreta de π₀.₅ y un commit específico de LeRobot; cualquier desviación puede romper la reproducibilidad.
- Solo acepta una imagen RGB de cabeza y lenguaje; no usa estado propioceptivo, lo que limita la robustez en tareas que requieran realimentación de estado.
- Entrenado y evaluado en simulación MuJoCo para el robot K1; no hay evidencia de transferencia a hardware real.
- Licencia Gemma Terms of Use, con restricciones de uso de la sección 3.2; es necesario revisar los términos antes de cualquier uso comercial.
- No se declaran idiomas soportados ni se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Dependencia de versiones muy concretas (Python 3.12, Transformers 5.5.4, SentencePiece 0.2.1) que pueden dificultar el despliegue en entornos existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/k1_sapiens_haf_vla_head_rgb_no_state_100K
- Artículo HAF-VLA: https://arxiv.org/abs/2610.26584
- Modelo base π₀.₅ (revisión 22c30e5): https://huggingface.co/lerobot/pi05_base/tree/22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0
- Repositorio LeRobot (commit c8ce413): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- Tokenizador PaliGemma: https://storage.googleapis.com/big_vision/paligemma_tokenizer.model
- Gemma Terms of Use: https://huggingface.co/Dongkkka/k1_sapiens_haf_vla_head_rgb_no_state_100K/GEMMA_TERMS.html
- NOTICE: https://huggingface.co/Dongkkka/k1_sapiens_haf_vla_head_rgb_no_state_100K/NOTICE
