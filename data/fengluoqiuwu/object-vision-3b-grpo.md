# fengluoqiuwu/Object-Vision-3B-GRPO

## Resumen

Object Vision 3B GRPO es un checkpoint de investigación publicado por el usuario fengluoqiuwu, derivado de Qwen/Qwen2.5-VL-3B-Instruct y entrenado con GRPO (Group Relative Policy Optimization) sobre el método descrito en el paper *Re-encode the Mention*. El modelo implementa un mecanismo de "Object Vision": durante la generación, cuando el modelo emite una mención a un objeto, selecciona una región a partir de la atención sobre esa mención, la recodifica de forma aislada con un codificador visual congelado y reinserta las características resultantes en el flujo del lenguaje usando los índices M-RoPE originales.

Se trata de un modelo visión-lenguaje de 3B parámetros construido sobre la arquitectura de Qwen2.5-VL, con el codificador visual congelado y únicamente el modelo de lenguaje actualizado durante el entrenamiento (primero SFT, después GRPO). El checkpoint corresponde al paso 100 del paper y se distribuye en formato nativo del proyecto (`model.pt` + `config.json`), no como checkpoint estándar de Transformers.

Su relevancia es acotada: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha, licencia Qwen Research (solo uso no comercial) y sin helpers públicos de inferencia publicados aún. Resulta útil para reproducir o inspeccionar el método Object Vision, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basada en Qwen2.5-VL (codificador visual congelado + LLM), con mecanismo Object Vision de recodificación de regiones e índices M-RoPE |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-VL-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (Qwen Research License, solo uso no comercial) |
| Formato de pesos | `model.pt` + `config.json` (formato nativo del proyecto, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer visión-lenguaje con codificador visual y modelo de lenguaje. La innovación del método Object Vision consiste en un disparador sobre menciones de objetos durante la generación: el modelo localiza la región correspondiente mediante la atención sobre la mención, recodifica esa región de forma aislada con el codificador visual congelado y reinserta las características en la secuencia del lenguaje respetando los índices M-RoPE originales. El presupuesto de región por defecto en la evaluación del paper es K=100.

El entrenamiento se realiza en dos fases: primero SFT (checkpoint hermano Object-Vision-3B-SFT) y después GRPO, que actualiza únicamente el modelo de lenguaje mientras el codificador visual permanece congelado. El checkpoint publicado corresponde al paso 100 del paper. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni detalles adicionales del pipeline de RL.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Razonamiento visual sobre menciones de objetos, con recodificación de regiones aisladas.
- Comprensión de imágenes heredada de Qwen2.5-VL-3B-Instruct.
- Capacidad de inspección de regiones insertadas mediante `record_pastes=True`.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.

## Casos de uso

- Investigación sobre métodos de grounding visual: el modelo permite reproducir el experimento de *Re-encode the Mention* y analizar cómo la recodificación de regiones afecta a la generación.
- Análisis de atención sobre menciones: con `record_pastes=True` se pueden inspeccionar las regiones insertadas y estudiar el comportamiento del mecanismo Object Vision.
- Experimentos de RL aplicado a modelos visión-lenguaje: sirve como referencia de un pipeline SFT + GRPO sobre un backbone de 3B.
- Comparación de checkpoints SFT frente a GRPO: el par Object-Vision-3B-SFT y Object-Vision-3B-GRPO permite aislar el efecto del entrenamiento con refuerzo.
- Docencia y divulgación: ejemplo práctico de arquitectura visión-lenguaje con recodificación de regiones e índices M-RoPE.
- Desarrollo de prototipos internos de comprensión de imágenes con menciones de objetos, siempre en ámbito no comercial y asumiendo el formato nativo del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 8.1 GB en `model.pt`, por lo que la inferencia en precisión nativa requiere al menos ese orden de magnitud de memoria, más el estado del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; por tamaño (3B) podría encajar en GPUs con suficiente VRAM, pero el formato nativo y la dependencia del paquete SFT impiden garantizarlo.
- Opciones de despliegue: no es compatible con `transformers.AutoModel`/`generate()`; requiere el cargador propio `models.object_vision.generate.load_engine_from_checkpoint`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Object-Vision-3B-GRPO | 3B | no disponible | Qwen Research (no comercial) | `model.pt` nativo | Checkpoint de investigación con cargador propio |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible | Qwen Research | safetensors (Transformers) | Modelo base, listo para `from_pretrained()` |
| Object-Vision-3B-SFT | 3B | no disponible | Qwen Research | `model.pt` nativo | Checkpoint SFT previo al GRPO |

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial, sujeto a la licencia del modelo base.
- El repositorio no redistribuye las imágenes de entrenamiento.
- No es un checkpoint estándar de Transformers: requiere el cargador del proyecto y el paquete SFT correspondiente en local (`cache/models/fengluoqiuwu/obj-vision-isolated-qwen2.5-3b-fast/` o el repo hermano Object-Vision-3B-SFT).
- Sin helpers públicos de inferencia publicados en el momento de la ficha.
- Riesgo de alucinación y sesgos: no documentados en la informacion proporcionada; heredables del modelo base.
- Idiomas soportados y longitud de contexto no especificados.
- Sin datos de benchmarks: no se puede evaluar su rendimiento frente a alternativas.
- Adopción prácticamente nula (0 descargas, 0 likes) y creado/actualizado en noviembre de 2026, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/fengluoqiuwu/Object-Vision-3B-GRPO
- Checkpoint SFT hermano: https://huggingface.co/fengluoqiuwu/Object-Vision-3B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper *Re-encode the Mention* (Object Vision): no disponible enlace en la informacion proporcionada
- Repositorio de código del proyecto: no disponible enlace en la informacion proporcionada
