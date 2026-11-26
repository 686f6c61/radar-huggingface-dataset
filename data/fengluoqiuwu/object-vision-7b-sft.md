# fengluoqiuwu/Object-Vision-7B-SFT

## Resumen

Object Vision 7B SFT es un ajuste fino supervisado (SFT) del modelo vision-language Qwen2.5-VL-7B-Instruct, publicado por el usuario fengluoqiuwu como parte del trabajo *Re-encode the Mention*. El modelo implementa una técnica de "re-codificación de menciones": durante la generación, cuando el modelo detecta una mención a un objeto, selecciona una región de la imagen a partir de la atención sobre esa mención, la re-codifica de forma aislada con un codificador visual congelado y reinserta las características resultantes en los índices M-RoPE originales. El resultado es un modelo que puede "mirar" regiones concretas de la imagen bajo demanda en lugar de depender únicamente de la codificación global inicial.

El checkpoint corresponde al paso 12000 del entrenamiento descrito en el paper y se distribuye junto a una variante posterior entrenada con GRPO (Object-Vision-7B-GRPO). La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct (transformer decoder-only con encoder visual y M-RoPE), por lo que hereda su ventana de contexto y capacidades multimodales, aunque el paquete se publica con pesos nativos del proyecto (`model.pt` + `config.json`) y no como checkpoint estándar de Transformers.

Es relevante para investigadores interesados en mecanismos de atención sobre regiones, grounding visual fino y entrenamiento por refuerzo aplicado a tareas de percepción de objetos. No obstante, la ausencia de helpers de inferencia públicos y de una licencia clara limitan su uso inmediato en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only vision-language (base Qwen2.5-VL-7B-Instruct) con re-codificación de regiones por mención |
| Parametros totales | 7B (heredados del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en `model.pt`, sin variantes GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | other (el autor no reclama Apache-2.0 incondicional; los datos de entrenamiento incluyen Visual-CoT / ZwZ-RL-VQA) |
| Formato de pesos | `model.pt` + `config.json` (formato nativo del proyecto, no `from_pretrained()`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer decoder-only con encoder visual y positional embeddings multimodales (M-RoPE). Sobre esa base, Object Vision introduce un mecanismo que se activa durante la generación al detectar menciones a objetos: selecciona una región de la imagen a partir de la atención de la mención, la re-codifica de forma aislada con un codificador visual congelado y reinserta las características con los índices M-RoPE originales. Solo se actualiza el modelo de lenguaje; el codificador visual permanece congelado.

El entrenamiento consta de dos fases: primero SFT (este checkpoint, paso 12000) y después GRPO, cuyo resultado se publica en un repositorio separado. Los datos de entrenamiento incluyen Visual-CoT y ZwZ-RL-VQA según la model card. El presupuesto de región por defecto en la evaluación del paper es K=100, y el paquete permite inspeccionar las regiones insertadas con `record_pastes=True`. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Razonamiento visual con re-codificación de regiones bajo demanda (mecanismo central del paper).
- Percepción de objetos y grounding por mención: el modelo puede seleccionar y re-codificar regiones concretas de la imagen.
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct (no verificadas de forma independiente en este checkpoint): razonamiento multimodal, OCR, comprensión de documentos, matemáticas y código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el mecanismo de re-codificación es iterativo por mención durante la generación.
- Capacidades multilingües: no disponible.
- Modo "thinking" o variantes de razonamiento extendido: no disponible.
- Audio: no soportado (modelo vision-language).

## Casos de uso

- Investigación en grounding visual: el modelo permite estudiar cómo la atención sobre menciones guía la selección de regiones, con la opción `record_pastes=True` para auditar las regiones insertadas en cada paso.
- Análisis de imágenes con objetos pequeños o poco frecuentes: la re-codificación aislada de regiones puede mejorar la resolución efectiva sobre detalles que la codificación global diluye, útil en inspección visual y control de calidad.
- Descripción detallada de escenas: al re-codificar regiones mencionadas, el modelo puede generar descripciones más precisas de objetos concretos en imágenes complejas.
- Evaluación comparativa de técnicas de atención regional: sirve como referencia frente a métodos de cropping, zoom o tool-use visual en pipelines de VQA.
- Base para experimentos de RL aplicado a percepción: el checkpoint SFT es el punto de partida natural para reproducir la fase GRPO publicada en el repositorio hermano.
- Prototipado de asistentes visuales con foco en objetos: en entornos de investigación controlados, puede integrarse en un motor propio (`load_engine_from_checkpoint`) para experimentar con presupuestos de región (K=100 por defecto).
- Docencia y reproducción de papers: el par SFT/GRPO permite estudiar el efecto del RL sobre un mismo mecanismo arquitectónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 7B en precisión completa (FP16/BF16) se necesitan aproximadamente 14-16 GB solo para pesos, más overhead de activaciones y del encoder visual; el repositorio ocupa 16,6 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar viabilidad en A100, H100, L40S y GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en BF16, con margen ajustado).
- ¿Cabe en consumer GPU? Previsiblemente sí en GPUs de 24 GB o más en BF16; no se han publicado variantes cuantizadas.
- Opciones de despliegue: el paquete no es compatible con `transformers.AutoModel` ni con `generate()` estándar; requiere el motor propio `load_engine_from_checkpoint`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Object Vision 7B SFT | 7B | no disponible | Re-codificación de regiones por mención (SFT) | other (no Apache-2.0 incondicional) | Pesos nativos, sin helpers públicos |
| Object Vision 7B GRPO | 7B | no disponible | Igual, tras RL con GRPO | other | Pesos nativos |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | VLM estándar sin re-codificación regional | Apache-2.0 (según model card base) | Transformers, ecosistema amplio |
| Otros VLM de 7B (p. ej. familia Llama Vision, InternVL) | ~7B | variable | Codificación global de imagen | variable | Ecosistema estándar |

La comparación con alternativas de la misma categoría queda limitada por la falta de benchmarks publicados para Object Vision y por su formato de pesos no estándar, que dificulta una evaluación directa frente a VLMs convencionales.

## Limitaciones y advertencias

- Formato propietario: los pesos no cargan con `transformers.AutoModel` ni `generate()`; requieren el motor del proyecto, cuyos helpers públicos aún no se han liberado.
- Licencia ambigua: el autor declara licencia "other" y no reclama Apache-2.0 incondicional; los datos de entrenamiento (Visual-CoT, ZwZ-RL-VQA) imponen términos adicionales que deben revisarse antes de uso comercial o redistribución.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base y los de los datasets de entrenamiento.
- Idiomas: no se especifica qué idiomas soporta el ajuste fino.
- Contexto: no se detalla la ventana efectiva tras el ajuste, ni cómo interactúa el presupuesto de región K con secuencias largas.
- Producción: sin benchmarks, sin variantes cuantizadas y sin soporte en servidores de inferencia estándar, no es recomendable para despliegues productivos sin validación previa.
- Datos: el repositorio no redistribuye las imágenes de entrenamiento, lo que limita la reproducibilidad completa del pipeline.

## Enlaces

- Hugging Face (SFT): https://huggingface.co/fengluoqiuwu/Object-Vision-7B-SFT
- Hugging Face (GRPO): https://huggingface.co/fengluoqiuwu/Object-Vision-7B-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper *Re-encode the Mention*: no disponible en la información proporcionada (citado en la model card sin enlace)
- Repositorio de código / helpers de inferencia: no disponible (pendiente de publicación según el autor)
