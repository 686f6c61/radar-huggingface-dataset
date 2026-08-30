# Nexuss0781/SPACE

## Resumen

SPACE es un modelo de selección multimodal desarrollado por Nexuss0781 (Tadiyos Aschalew) que actúa como un enrutador inteligente entre varios modelos pequeños especializados en texto, visión y audio. En lugar de ser un único modelo generativo monolítico, SPACE elige dinámicamente el modelo más adecuado según la modalidad de entrada (texto, imagen o audio) y el modo de operación deseado: un modo "micro" de baja latencia para uso continuo (always-on) y un modo "quality" que prioriza la calidad de respuesta a costa de mayor consumo de recursos. El modelo tiene 3.085.938.688 parámetros totales (según los safetensors del repositorio), aunque su arquitectura interna no está documentada. Su relevancia radica en proponer una solución eficiente para despliegue en entornos con recursos limitados, como dispositivos edge o asistentes embebidos, combinando modelos pequeños de alto rendimiento por token. No se especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (selector/router multimodal) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (q4_k_m, q8_0) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura interna de SPACE no se describe en la documentacion publicada. Por la naturaleza del modelo, se infiere que se trata de un clasificador o enrutador que recibe la modalidad de entrada y el modo solicitado, y selecciona entre un conjunto de modelos preentrenados. Los modelos candidatos incluyen SmolLM2-360M-Instruct y Qwen2.5-3B-Instruct para texto; SmolVLM2-500M-Video-Instruct, SmolVLM-500M-Instruct, SmolVLM2-2.2B-Instruct, Moondream2 y Gemma 3 4B IT para vision; y Qwen3-ASR-0.6B, Ultravox 1B, Qwen2.5-Omni-3B, Qwen3-ASR-1.7B y Ultravox 8B para audio. No se han publicado detalles sobre el entrenamiento del selector, el dataset utilizado ni el proceso de optimizacion (RLHF, DPO, etc.). La ausencia de informacion tecnica impide evaluar innovaciones en el diseño del modelo.

## Capacidades

- Seleccion automatica de modelo segun modalidad: texto, vision (imagen) y audio (voz).
- Dos modos de operacion: "micro" (always-on) para baja latencia y "quality" para mayor calidad de respuesta.
- Generacion de texto conversacional y respuestas a instrucciones (delega en los modelos subyacentes).
- Procesamiento de imagenes y video (via modelos de vision como SmolVLM2).
- Reconocimiento de voz y transcripcion (via modelos ASR como Qwen3-ASR).
- Compatible con pipelines de generacion de texto e imagen-texto (pipeline_tag: image-text-to-text).
- Soporte de endpoints y despliegue en regiones de Estados Unidos (tag region:us).
- No se documenta soporte explicito de tool calling, agentes ni razonamiento multi-paso, aunque podria heredarse de los modelos base.

## Casos de uso

- Asistentes de voz en dispositivos edge: SPACE puede activar el modo "micro" con Qwen3-ASR-0.6B para transcripcion en tiempo real y SmolLM2-360M-Instruct para respuestas de texto, manteniendo un consumo de RAM inferior a 2 GB y velocidades de 37-57 tok/s, adecuado para altavoces inteligentes o wearables.
- Chatbots de atencion al cliente con soporte visual: el modo "quality" con SmolVLM2-2.2B-Instruct permite analizar capturas de pantalla o fotos de productos mientras Qwen2.5-3B-Instruct genera respuestas contextuales, todo en un unico flujo.
- Transcripcion y resumen de reuniones: el modelo puede seleccionar Qwen3-ASR-1.7B para audio de mayor fidelidad y SmolLM2-360M-Instruct para generar resumenes, con una huella de memoria de ~3,5 GB.
- Sistemas de moderacion de contenido multimodal: combinando SmolVLM2-500M-Video-Instruct para detectar contenido inapropiado en imagenes y Qwen3-ASR-0.6B para audio, SPACE puede clasificar entradas mixtas en tiempo real.
- Asistentes de codigo en entornos con restricciones de hardware: el modo "micro" con SmolLM2-360M-Instruct ofrece respuestas rapidas de codigo (57.7 tok/s) con solo 474 MB de RAM, ideal para IDE en portatiles de gama baja.
- Prototipado rapido de aplicaciones multimodales: al exponer una interfaz unificada para texto, imagen y audio, SPACE permite a desarrolladores integrar capacidades multimodales sin gestionar multiples modelos por separado, reduciendo la complejidad de deployment.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), pero si datos de rendimiento de inferencia para cada modelo subyacente. Se presentan en las siguientes tablas (extraidas de la model card).

**Rendimiento en texto (10 prompts, 256 max new tokens)**

| Model | Weights | Avg tok/s | Peak RSS | Wall (10 prompts) |
|---|---|---:|---:|---:|
| SmolLM2-360M-Instruct (q4_k_m) | 0.27 GB | 57.73 | 474 MB | 37.7s |
| SmolLM3-3B (q4_k_m) | 1.92 GB | 13.18 | 3,436 MB | 196.6s |
| Qwen2.5-3B-Instruct (q4_k_m) | 1.93 GB | 13.43 | 3,336 MB | 161.6s |

**Rendimiento en vision (10 image tasks, 128 max new tokens)**

| Model | Weights | Avg tok/s | Peak RSS | Wall (10 imgs) |
|---|---|---:|---:|---:|
| SmolVLM2-500M-Video-Instruct (q8_0) | 0.44 GB | 67.15 | 1,026 MB | 73.7s |
| SmolVLM-500M-Instruct (q8_0) | 0.44 GB | 65.06 | 1,026 MB | 77.6s |
| SmolVLM2-2.2B-Instruct (q4_k_m) | 1.11 GB | 19.15 | 4,260 MB | 363.3s |
| Moondream2 (q8_0) | 1.51 GB | 14.86 | 4,000 MB | 236.1s |
| Gemma 3 4B IT (q4_k_m) | 2.49 GB | 13.19 | 5,309 MB | 602.6s |

**Rendimiento en audio (10 speech clips, 128 max new tokens)**

| Model | Weights | Avg tok/s | Peak RSS | Wall (10 clips) |
|---|---|---:|---:|---:|
| Qwen3-ASR-0.6B (q8_0) | 0.80 GB | 37.17 | 2,073 MB | 24.1s |
| Ultravox 1B (q4_k_m) | 0.81 GB | 35.68 | 2,969 MB | 209.2s |
| Qwen2.5-Omni-3B (q4_k_m) | 2.10 GB | 15.90 | 6,302 MB | 435.4s |
| Qwen3-ASR-1.7B (q8_0) | 2.17 GB | 12.68 | 3,510 MB | 45.6s |
| Ultravox 8B (q4_k_m) | 4.92 GB | 7.34 | 10,456 MB | 448.1s |

**Seleccion recomendada por modalidad**

| Modality | Micro (always-on) | Quality |
|---|---|---|
| Text | SmolLM2-360M-Instruct (q4_k_m, 57.7 tok/s) | Qwen2.5-3B-Instruct (q4_k_m, 13.4 tok/s) |
| Vision | SmolVLM2-500M-Video-Instruct (q8_0, 67.2 tok/s) | SmolVLM2-2.2B-Instruct (q4_k_m, 19.2 tok/s) |
| Audio | Qwen3-ASR-0.6B (q8_0, 37.2 tok/s) | Qwen3-ASR-1.7B (q8_0, 12.7 tok/s) |

## Requisitos de hardware

- VRAM estimada: depende del modelo seleccionado. El modo "micro" requiere entre 0.27 GB y 0.80 GB de pesos, con picos de RAM de 474 MB a 2,073 MB. El modo "quality" necesita entre 1.11 GB y 2.49 GB de pesos, con picos de hasta 6,302 MB.
- GPU recomendadas: no se requiere GPU para los modelos micro; pueden ejecutarse en CPU con un rendimiento aceptable (57 tok/s en texto). Para el modo quality se recomienda al menos una GPU con 4 GB de VRAM (p. ej., NVIDIA GTX 1650 o superior) o una CPU moderna con 8 GB de RAM.
- Compatibilidad con consumer GPU: si, los modelos seleccionados son pequeños y caben en GPUs de gama media (p. ej., RTX 3060, RTX 4060) o incluso en CPU.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, vLLM (con adaptaciones) o el framework propio del autor (Nexuss Transformer Framework). El tag "endpoints_compatible" sugiere compatibilidad con la API de Hugging Face.
- Latencia y throughput: los valores de tok/s se muestran en las tablas anteriores. El modo micro ofrece 37-67 tok/s, mientras que el modo quality baja a 12-19 tok/s, con tiempos de respuesta por tarea entre 24 y 602 segundos para lotes de 10.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables con la misma funcionalidad de enrutamiento multimodal. La mayoria de alternativas son modelos individuales multimodales (como Qwen2.5-Omni o Gemma 3) que procesan todas las modalidades con un unico conjunto de pesos, pero no realizan seleccion dinamica. SPACE se diferencia por su enfoque modular y de bajo consumo, aunque carece de benchmarks de calidad publicados que permitan comparar su rendimiento real en tareas estandar.

## Limitaciones y advertencias

- No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar su fiabilidad y reproducibilidad.
- La licencia "other" no especifica restricciones claras; se recomienda contactar al autor antes de un uso comercial.
- No hay benchmarks de calidad (MMLU, HumanEval, etc.) que validen la precision de las respuestas generadas por los modelos subyacentes bajo el control de SPACE.
- El modelo depende de terceros modelos (SmolLM2, Qwen, etc.) cuyas licencias y limitaciones se heredan; algunos pueden tener restricciones de uso comercial.
- La seleccion automatica puede fallar si la modalidad de entrada no se detecta correctamente, lo que llevaria a usar un modelo inadecuado.
- No se especifica la longitud de contexto, lo que limita el uso en tareas que requieren ventanas largas.
- Riesgo de sesgos y alucinaciones no evaluado; no hay informacion sobre mitigaciones.
- El modelo esta etiquetado para la region de Estados Unidos, lo que puede implicar restricciones de despliegue en otras regiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nexuss0781/SPACE
- Perfil del autor: https://huggingface.co/Nexuss0781
- Datasets del autor: https://huggingface.co/Nexuss0781/datasets
- Framework Nexuss Transformer: https://huggingface.co/spaces/Nexuss0781/ntf-space
- Repositorio Nexuss-AI en GitHub: https://github.com/nexuss0781/Nexuss-AI
