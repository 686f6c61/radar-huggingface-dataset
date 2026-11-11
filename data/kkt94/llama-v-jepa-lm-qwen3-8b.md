# kkt94/Llama-V-JEPA-LM-Qwen3-8B

## Resumen

Llama-V-JEPA-LM-Qwen3-8B es un modelo de lenguaje y video (video-language model) desarrollado por el usuario kkt94 que combina un codificador de video basado en el modelo del mundo V-JEPA 2.1 (ViT-g, congelado) con el modelo de lenguaje Qwen3-8B, unidos mediante un "spectral bridge" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo resuelve el problema de la comprensión temporal y dinámica del video: en lugar de limitarse a reconocer objetos estáticos, aprende a leer dirección, velocidad, orden, posición, conteo y completitud de las escenas a partir de transformaciones contrafactuales de videos públicos.

La relevancia del modelo radica en su eficiencia y en sus resultados: con solo 1.024 tokens visuales por clip a cualquier resolución, alcanza un promedio de 70,11 en 12 puntuaciones sobre 11 benchmarks de video, superando a todos los modelos abiertos de su clase de tamaño (el mejor modelo abierto de 8B, PLM-8B, obtiene 64,79). Además, generaliza fuera de sus construcciones de entrenamiento con un promedio de 95,9 en seis conjuntos retenidos, frente a 55,5 del mejor modelo abierto de 8B (Qwen3-VL-8B).

El modelo tiene 9.228.761.088 parámetros totales, se distribuye bajo licencia Apache-2.0 y está entrenado únicamente en inglés sobre 4,53 millones de muestras públicas. Su nombre comienza por "Llama" porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, un output de Llama 3.2 cuya licencia exige ese prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de video-lenguaje: codificador de video V-JEPA 2.1 (ViT-g, congelado) + LLM Qwen3-8B, unidos por un spectral bridge |
| Parametros totales | 9.228.761.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de video V-JEPA 2.1 basado en ViT-g, que se mantiene congelado, con el modelo de lenguaje Qwen3-8B. Un componente denominado spectral bridge transforma cada clip de 32 fotogramas en 1.024 tokens visuales, independientemente de la resolución de entrada, lo que mantiene compacta la secuencia visual que procesa el LLM. El modelo base es Qwen/Qwen3-8B y la relación declarada es de fine-tuning sobre dicho modelo.

El entrenamiento se basa en supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre videos públicos para producir variantes equilibradas en respuestas, cuyas respuestas quedan fijadas por construcción y difieren únicamente en cómo cambia la escena. Así, el modelo de lenguaje aprende a interpretar la dinámica (dirección, velocidad, orden, estado) que porta el codificador del modelo del mundo. Se entrenó sobre 4,53 millones de muestras públicas, un volumen muy inferior al de los V-JEPA video LLM de Meta (88,5M y 72,5M de muestras). No se especifica en la información disponible si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre contenido de video (video question answering).
- Comprensión de dinámica temporal: dirección, orden, posición, velocidad, conteo y completitud de acciones.
- Respuesta a preguntas sobre videos de 32 fotogramas con 1.024 tokens visuales por clip a cualquier resolución.
- Extracción de características (feature-extraction) y modelado del mundo (world-model) mediante el codificador V-JEPA.
- Procesamiento multimodal video-texto (pipeline video-text-to-text).
- Capacidades multilingües: únicamente inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales: thinking mode, visión, audio: no disponible en la información proporcionada.

## Casos de uso

- Moderación y análisis de contenido en video: el modelo puede responder preguntas sobre lo que ocurre en un clip de 32 fotogramas, identificando dirección, orden y estado de las acciones, lo que permite clasificar contenido sospechoso o verificar eventos concretos con 1.024 tokens visuales por clip.
- Búsqueda y recuperación semántica de video: al convertir cada clip en una representación compacta de 1.024 tokens, se puede indexar y consultar grandes volúmenes de video mediante preguntas en lenguaje natural, con un prefill de 42 ms por clip en una H100.
- Análisis de vigilancia y seguridad: la capacidad de leer movimiento, velocidad y orden temporal permite detectar comportamientos anómalos o reconstruir la secuencia de eventos en grabaciones, aprovechando el entrenamiento contrafactual en dinámica.
- Asistentes para accesibilidad: generar descripciones y respuestas sobre el contenido dinámico de videos para personas con discapacidad visual, centrándose en cambios de escena y acciones en lugar de solo objetos estáticos.
- Evaluación de videos educativos o demostraciones: responder preguntas sobre procedimientos y secuencias (por ejemplo, pasos de un tutorial o una receta) verificando orden y completitud de las acciones.
- Investigación en modelos del mundo: utilizar el codificador V-JEPA congelado y el spectral bridge como base para experimentos de representación visual y razonamiento temporal, dado su rendimiento en conjuntos retenidos (95,9 de promedio en seis sets).
- Automatización de anotación de video: generar pares pregunta-respuesta y etiquetas temporales sobre clips para construir datasets de entrenamiento, con un coste computacional bajo (182 ms hasta el primer token en una H100).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,8 |
| PerceptionTest | accuracy | 77,8 |
| TVBench | accuracy | 75,3 |
| TempCompass | accuracy | 79,4 |
| TOMATO | accuracy | 56,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 81,2 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 73,5 |
| SSv2 (multiple choice) | accuracy | 93,8 |
| Vinoground text | text pair accuracy | 75,2 |
| Vinoground video | video pair accuracy | 38,6 |

Promedio declarado: 70,11 en 12 puntuaciones sobre 11 benchmarks de video. El autor indica que supera a todos los modelos abiertos de su clase de tamaño (mejor modelo abierto de 8B: PLM-8B, 64,79) y que es el mejor en 7 de las 12 puntuaciones. En los seis benchmarks reportados para los V-JEPA 2 / 2.1 video LLM de Meta (Llama-3.1-8B), obtiene un promedio de 70,0 frente a 63,3 / 62,8 publicados. En seis conjuntos retenidos (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas y simulador no visto; azar 33,3) alcanza 95,9 de promedio frente a 55,5 de Qwen3-VL-8B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.228.761.088 parámetros y pesos en safetensors, en precisión completa (fp16/bf16) se requieren aproximadamente 18,5 GB solo para los pesos, más memoria para el codificador de video y las activaciones.
- GPU recomendadas: el autor reporta mediciones en una H100 (prefill de un clip en 42 ms, 182 ms hasta el primer token). No se especifican otras GPU.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; por el tamaño del repositorio (18,5 GB) y los 9,2B de parámetros, no cabría en GPU de consumo con menos de 24 GB de VRAM sin cuantización, y no se documentan cuantizaciones.
- Opciones de despliegue: librería transformers (custom_code). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de un clip de 32 fotogramas con 15,8 TFLOPs en 42 ms en una H100; 182 ms hasta el primer token. Frente a los modelos abiertos de su clase, que requieren 32,2–160,7 TFLOPs y 81–314 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-8B | 9,23B | no disponible | 70,11 de promedio en 12 puntuaciones; 95,9 en conjuntos retenidos | Apache-2.0 | Hugging Face |
| PLM-8B | 8B (clase) | no disponible | 64,79 de promedio; mejor modelo abierto de 8B según el autor | no disponible | no disponible |
| Qwen3-VL-8B | 8B (clase) | no disponible | 55,5 en los seis conjuntos retenidos | no disponible | no disponible |
| V-JEPA 2 / 2.1 video LLM (Llama-3.1-8B) | 8B (clase) | no disponible | 63,3 / 62,8 de promedio en sus seis benchmarks publicados | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse solo con videos públicos en inglés, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no se documenta explícitamente; como modelo generativo de lenguaje, es susceptible de producir respuestas incorrectas sobre el contenido del video, especialmente en preguntas temporales complejas (Vinoground video obtiene solo 38,6).
- Limitaciones de contexto e idioma: solo soporta inglés y no se especifica la longitud de contexto del LLM. El procesamiento de video se limita a clips de 32 fotogramas.
- Restricciones de licencia: el modelo es Apache-2.0, pero el nombre "Llama" es obligatorio porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, un output de Llama 3.2 cuya licencia exige ese prefijo; conviene revisar las implicaciones de dicha licencia para uso comercial.
- Caveats para producción: los benchmarks son declarados por el autor y no están verificados; el modelo tiene 0 descargas y 5 likes en Hugging Face, lo que indica escasa validación externa. Requiere código personalizado (custom_code) y no se documentan cuantizaciones ni opciones de despliegue alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
- MVBench: https://huggingface.co/datasets/OpenGVLab/MVBench
- PerceptionTest: https://huggingface.co/datasets/lmms-lab/PerceptionTest
- TVBench: https://huggingface.co/datasets/FunAILab/TVBench
- TempCompass: https://huggingface.co/datasets/lmms-lab/TempCompass
- TOMATO: https://huggingface.co/datasets/yale-nlp/TOMATO
- MotionBench: https://huggingface.co/datasets/zai-org/MotionBench
- NExT-QA: https://huggingface.co/datasets/lmms-lab/NExTQA
- MVP: https://huggingface.co/datasets/facebook/minimal_video_pairs
- TemporalBench: https://huggingface.co/datasets/microsoft/TemporalBench
- SSv2: https://huggingface.co/datasets/HuggingFaceM4/something_something_v2
- Vinoground: https://huggingface.co/datasets/HanSolo9682/Vinoground
