# Mapika/decider-2b-vision

## Resumen

decider-2b-vision es un modelo de decisión multimodal desarrollado por Mapika. No es un modelo generativo al uso: recibe una imagen (fotograma de juego, diagrama, fotografía) junto con una pregunta de texto y una lista de opciones etiquetadas con letras, y devuelve una distribución de probabilidad calibrada sobre esas opciones en un único slot de respuesta. No genera texto libre; el logit de cada letra se normaliza con softmax sobre las opciones disponibles.

El modelo parte de Qwen3.5-2B en su variante visión-lenguaje, sobre la que se trasplantan los pesos de texto de decider-2b v5 y se aplica un ajuste fino específico para la tarea de decisión. Con 2.213.241.664 parámetros en bf16 (4,1 GB de pesos), está pensado para entornos donde se necesita una decisión tipada y calibrada a partir de una imagen con latencia baja y sin coste de decodificación autorregresiva.

Su relevancia actual radica en dos factores: la interfaz de salida estructurada (probabilidad sobre opciones, no texto parseable) y el entrenamiento con PPO desde píxeles en entornos Atari, que lo convierte en una pieza útil para agentes que operan sobre fotogramas de juego o interfaces visuales. La licencia Apache 2.0 y el soporte de entrada solo-texto (con el comportamiento de decider-2b v5, incluida la abstención) amplían su aplicabilidad fuera del dominio visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3.5-2B vision-language) con fine-tune para decisión en un único slot |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2,2 mil millones de parámetros que hereda el codificador visual y el backbone de Qwen3.5-2B en su variante visión-lenguaje. Sobre esa base se trasplantan los pesos de texto de decider-2b v5 y se realiza un ajuste fino específico para producir una distribución calibrada sobre opciones con letra en un único slot de respuesta. Un fotograma de juego de 256x240 se codifica en 64 tokens visuales, lo que mantiene bajo el coste de prefill.

El entrenamiento consistió en una época sobre 80.000 ejemplos, de los cuales 50.000 incluyen imagen: fotogramas de Pong, Breakout, CliffWalking, MiniGrid y Super Mario Bros etiquetados por políticas scriptadas (con sobremuestreo de acciones raras y fotogramas DAgger generados por el propio modelo en una versión anterior), tareas de elección múltiple con imagen procedentes de The Cauldron (A-OKVQA, AI2D, ScienceQA, IconQA, TQA, Raven y Hateful Memes) y una repetición de la mezcla de texto. Posteriormente se aplicó PPO desde píxeles sobre Breakout y Pong, usando el softmax sobre las opciones de acción como política. El código de entrenamiento está disponible en el repositorio de GitHub del proyecto, bajo `decider/vision/`.

## Capacidades

- Decisión tipada sobre opciones con letra a partir de una imagen y una pregunta de texto, devolviendo una probabilidad calibrada por opción en un solo paso hacia delante.
- Entrada solo-texto con el comportamiento de decider-2b v5, incluida la gestión de abstención.
- Comprensión de imágenes en tareas de elección múltiple: VQA general, diagramas científicos, iconos, razonamiento visual y memes.
- Juego desde píxeles en entornos Atari (Breakout, Pong), MiniGrid y Super Mario Bros, usando las opciones de acción como política.
- Capacidad de actuar como política en un bucle de agente visual, sin generación de texto intermedia.
- No soporta tool calling ni function calling: la interfaz es una distribución sobre opciones, no una API de herramientas.
- No es un modelo conversacional ni un captioner: no genera descripciones ni respuestas en lenguaje natural.
- Multilingüismo limitado al inglés.

## Casos de uso

- Agentes que juegan desde píxeles: el modelo consume fotogramas de Atari o MiniGrid (64 tokens visuales por fotograma de 256x240) y devuelve la distribución sobre acciones, lo que permite cerrar el bucle de control sin un módulo de visión separado ni un LLM generativo.
- Automatización de pruebas de interfaz gráfica: dado un screenshot y una pregunta con opciones ("¿qué elemento está resaltado?", "¿en qué estado está el formulario?"), devuelve una probabilidad calibrada que se puede usar como comprobación con umbral en pipelines de CI.
- Triaje de imágenes en flujos de moderación: con opciones tipo "contenido permitido / dudoso / prohibido", la salida calibrada permite fijar umbrales de derivación a revisión humana; el modelo se entrenó con Hateful Memes entre sus fuentes.
- Enrutamiento de tickets con captura adjunta: el modelo responde a preguntas de clasificación sobre la imagen adjunta (categoría, gravedad, departamento) en una sola pasada, sin coste de decodificación, lo que reduce la latencia frente a un VLM generativo.
- Evaluación de diagramas técnicos: con AI2D y ScienceQA en el entrenamiento, puede clasificar diagramas científicos o de arquitectura frente a opciones predefinidas, útil para herramientas de documentación asistida.
- Control de robots o simuladores con observación visual: la formulación como política sobre opciones discretas encaja en entornos con espacio de acciones finito y requisito de baja latencia por paso.
- Clasificación de imágenes con abstención: la gestión de abstención heredada de decider-2b v5 permite que el modelo decline decidir cuando la evidencia es insuficiente, un requisito frecuente en producción.

## Benchmarks y rendimiento

Resultados publicados por el autor, 300 ítems por tarea:

| Tarea | Precisión | ECE |
|---|---|---|
| Fotogramas de Pong (acuerdo con el profesor de estado RAM) | 0,96 | 0,02 |
| Fotogramas de Breakout | 0,96 | 0,02 |
| Visual7W (held out) | 0,89 | 0,03 |
| A-OKVQA | 0,85 | 0,02 a 0,07 |
| AI2D | 0,93 | 0,02 a 0,07 |
| ScienceQA | 0,95 | 0,02 a 0,07 |
| IconQA | 0,94 | 0,02 a 0,07 |
| Raven | 0,80 | 0,02 a 0,07 |
| Hateful Memes | 0,80 | 0,02 a 0,07 |

Juego desde píxeles únicamente, tres episodios por entorno: Breakout 41 (el profesor con estado RAM obtiene 22), Pong 3 (profesor 8), CliffWalking -13 (óptimo), MiniGrid Empty 0,96 (nivel del profesor). En entornos held out: Freeway 0, FrozenLake 0, los grid worlds más difíciles 0 (sus profesores scriptados también obtienen 0), Mario 1-1 315 px. La versión visual anterior (basada en v4) obtenía Breakout 16, Pong 8, Freeway 8 y BabyAI-GoTo 0,30.

## Requisitos de hardware

- Pesos en bf16: 4,1 GB, según la model card; el repositorio completo ocupa 8,9 GB.
- VRAM estimada para inferencia en bf16: aproximadamente 6-8 GB contando pesos, activaciones y el codificador visual, dependiendo del tamaño de lote y del número de tokens visuales.
- Cabe en GPUs de consumo con 8 GB o más, como RTX 3060 Ti, RTX 3070, RTX 4060 Ti y superiores; en GPUs de 16 GB (RTX 4080, RTX 4090) hay margen para lotes mayores.
- GPUs de datacenter recomendadas para throughput alto: A100, H100, L40S.
- Opciones de despliegue: el paquete propio `decider` (`decider.vision.VisionDecisionModel`, `decider.infer.Decider`) y un endpoint `POST /v1/systemone` en el formato de TypeSafe. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles para esta variante. La model card de decider-2b (texto) cita 4 ms por petición con CUDA graphs en una GPU, pero no se traslada como dato medido a la variante de visión.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| decider-2b-vision | Qwen3.5-2B vision-language | 2,21 B | 4,1 GB bf16 | no disponible | Apache 2.0 | Decisión calibrada imagen + opciones, política desde píxeles |
| decider-2b v10 | Qwen3.5-2B-Base | ~2 B | 3,5 GB bf16 | no disponible | Apache 2.0 | Decisión calibrada solo texto; regresión 0,805 en tarea / 0,755 held-out |
| decider-4b v1 | Qwen3.5-4B-Base | ~4 B | 8,4 GB bf16 | no disponible | Apache 2.0 | Decisión solo texto; 0,834 / 0,788, superior al 2B en 87 de 95 tareas |
| decider-0.8b | Qwen3.5-0.8B-Base | ~0,8 B | 1,4 GB bf16 | no disponible | Apache 2.0 | Decisión solo texto; 0,776 / 0,707 en el protocolo de una pasada |

La comparación con VLMs generativos de tamaño similar (por ejemplo, variantes de 2B de Qwen-VL o PaliGemma) no está disponible en la información proporcionada, ya que las métricas publicadas de este modelo corresponden a su tarea específica de decisión y no son directamente comparables con benchmarks generativos.

## Limitaciones y advertencias

- No es un modelo de chat ni un captioner: solo responde a opciones con letra en un único slot; no genera texto libre.
- Los pesos de texto internos corresponden a decider-2b v5, no a las versiones v6 a v10: no incorpora las formas de entrada, la calibración ni los resultados de navegador de las versiones posteriores. No se ha publicado un reentrenamiento sobre los pesos de texto actuales.
- Solo inglés.
- La calibración está medida sobre los conjuntos de datos listados (Pong, Breakout, Visual7W, A-OKVQA, AI2D, ScienceQA, IconQA, Raven, Hateful Memes), no sobre imágenes del usuario; el ECE en producción puede diferir.
- El juego desde píxeles está medido en tres episodios por entorno, sobre fotogramas de Atari, MiniGrid y Mario del entrenamiento más unos pocos entornos held out; la varianza de esa medición es alta y no debe extrapolarse.
- Rendimiento nulo en varios entornos held out (Freeway, FrozenLake, grid worlds difíciles), aunque los profesores scriptados también puntúan 0 en esos casos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza en la distribución de probabilidad si la imagen queda fuera de la distribución de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo específicas; el conjunto Hateful Memes introduce contenido sensible en el entrenamiento y no se detalla el tratamiento aplicado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera de los dominios medidos.
- Dependencia del paquete `decider` y de su interfaz propietaria; no hay soporte documentado para servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mapika/decider-2b-vision
- Modelo de texto de referencia (decider-2b): https://huggingface.co/Mapika/decider-2b
- Variante 4B: https://huggingface.co/Mapika/decider-4b
- Variante 35B-A3B: https://huggingface.co/Mapika/decider-35b-a3b
- Variante 35B-A3B en NVFP4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- Variante 0.8B: https://huggingface.co/Mapika/decider-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de código, datos y scripts de entrenamiento: https://github.com/Mapika/decider
- Historial de versiones: https://github.com/Mapika/decider/blob/main/docs/CHANGELOG.md
