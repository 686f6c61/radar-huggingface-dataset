# mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-GGUF

## Resumen

OTC-Qwen3.8-27B-CPO-GRPO-GGUF es la versión cuantizada en formato GGUF del modelo frankleaf/OTC-Qwen3.8-27B-CPO-GRPO, un ajuste fino de la familia Qwen3.5 (etiquetada como `qwen3_5` en los metadatos) centrado en razonamiento y compresión de razonamiento mediante aprendizaje por refuerzo. El modelo base parte de una arquitectura transformer de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) y ha sido entrenado con técnicas de optimización de preferencias (CPO) y GRPO, orientadas a mejorar la calidad y la brevedad de las cadenas de razonamiento.

La contribución de mradermacher consiste en generar cuantizaciones estáticas en GGUF (desde Q2_K hasta Q8_0, además de IQ4_XS) junto con los ficheros mmproj para el componente multimodal, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 187,9 GB e incluye tanto los pesos cuantizados como los suplementos multimodales, lo que sugiere que el modelo original incorpora capacidad de visión.

Es relevante ahora porque combina dos tendencias activas: el entrenamiento con RL para razonamiento (GRPO, popularizado por DeepSeek-R1) y la compresión de trazas de razonamiento para reducir coste de inferencia, todo ello empaquetado en GGUF para despliegue local. No obstante, la información publicada por el autor es mínima: no hay model card detallada del modelo base, ni benchmarks, ni especificaciones de contexto o datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repo separado |
| Idiomas soportados | en, zh (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de un modelo Qwen3.5 de ~27 B de parámetros. Según las etiquetas del repositorio, el entrenamiento combina LoRA con aprendizaje por refuerzo: GRPO (Group Relative Policy Optimization) y CPO (Contrastive Preference Optimization), aplicados sobre la tarea de razonamiento. La etiqueta `reasoning-compression` indica que el objetivo del entrenamiento incluye reducir la longitud de las cadenas de razonamiento sin perder precisión, una línea de trabajo habitual para abaratar la inferencia en modelos con modo "thinking".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO adicional, ni innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.). La presencia de ficheros `mmproj` en el repositorio GGUF confirma que el modelo conserva un proyector multimodal, aunque no se detalla qué modalidades cubre ni con qué datos se entrenó esa parte.

## Capacidades

- Generación de texto conversacional, con soporte multi-turno (pipeline `conversational`).
- Razonamiento explícito con cadenas de pensamiento, entrenado específicamente para comprimir dichas cadenas (GRPO + CPO).
- Capacidad multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se detalla el alcance.
- Multilingüe limitado a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el entrenamiento en razonamiento sugiere cierta capacidad, pero no está documentado.
- Modo "thinking": no confirmado en la documentación, aunque el foco en compresión de razonamiento lo hace probable.

## Casos de uso

- Razonamiento local con privacidad: desplegar la cuantización Q4_K_M (~16,6 GB) en una estación de trabajo con GPU de 24 GB para tareas de análisis y resolución de problemas sin enviar datos a la nube, aprovechando la licencia Apache 2.0.
- Investigación en compresión de razonamiento: comparar la longitud y calidad de las cadenas de pensamiento de este modelo frente a su base sin GRPO/CPO, usando las distintas cuantizaciones como control de degradación.
- Asistentes conversacionales en inglés o chino: el modelo está etiquetado como `conversational` y soporta ambos idiomas, adecuado para chatbots de soporte en esos mercados.
- Procesamiento de documentos con componente visual: gracias a los ficheros `mmproj`, puede emplearse en pipelines de extracción de información de imágenes o capturas, siempre que se valide la calidad del proyector multimodal.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes GGUF, lo que permite medir el impacto de la cuantización (Q2_K a Q8_0) en tareas de razonamiento con un mismo modelo base.
- Prototipado rápido con llama.cpp u Ollama: al estar en GGUF, se puede integrar en aplicaciones locales de escritorio o servidores modestos sin necesidad de infraestructura de GPU de datacenter.
- Fine-tuning posterior sobre el adaptador: al ser un modelo basado en LoRA, sirve como punto de partida para ajustes específicos de dominio manteniendo la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~10,8 GB → cabe en GPU de 12 GB con contexto corto.
  - Q3_K_M: ~13,4 GB → GPU de 16 GB.
  - Q4_K_M: ~16,6 GB → GPU de 24 GB (RTX 3090/4090, A10G).
  - Q5_K_M: ~19,3 GB → GPU de 24 GB con margen ajustado.
  - Q6_K: ~22,2 GB → GPU de 24 GB al límite; recomendable 32 GB.
  - Q8_0: ~28,7 GB → GPU de 40 GB (A100 40GB) o 48 GB.
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa el modo multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A100 40GB o H100 para Q8_0; RTX 3090 como alternativa económica.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q3 o Q2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para las variantes i1 (imatrix) usar el repo mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-i1-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OTC-Qwen3.8-27B-CPO-GRPO (este) | ~26,9 B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste RL (GRPO+CPO) para razonamiento comprimido |
| Qwen3 base (familia) | ~27 B (según variante) | no disponible | Apache 2.0 (habitual en Qwen) | safetensors, GGUF | Modelo origen; sin el ajuste RL específico |
| DeepSeek-R1-Distill-Qwen-32B | ~32 B | 128K (según model card pública) | MIT (según variante) | safetensors, GGUF | Referencia en razonamiento por destilación; más parámetros |
| Gemma 3 27B | ~27 B | 128K | Gemma license (no Apache) | safetensors, GGUF | Alternativa multimodal con licencia más restrictiva |

La comparación con DeepSeek-R1-Distill-Qwen-32B y Gemma 3 27B se ofrece como referencia de categoría; no se dispone de datos de rendimiento de este modelo para una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste GRPO/CPO mejore realmente al modelo base; conviene validar en el dominio de uso antes de producción.
- Model card mínima: no se documentan datos de entrenamiento, contexto máximo, ni composición del dataset de RL, lo que dificulta evaluar sesgos.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a modelos de razonamiento de este tamaño; la compresión de cadenas puede aumentar errores en tareas de lógica compleja.
- El componente multimodal (`mmproj`) no está documentado: se desconoce qué tipos de imagen soporta y con qué calidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener condiciones adicionales que conviene verificar en el repositorio original de Qwen.
- El repositorio ocupa 187,9 GB; descargar solo la cuantización necesaria para evitar consumo innecesario de almacenamiento.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad del razonamiento; para tareas sensibles usar Q5_K_M o superior.
- Fecha de creación del repositorio (2026-11-01) y etiqueta `qwen3_5`: verificar que la versión de llama.cpp soporta la arquitectura antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-GGUF
- Modelo base: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO
- Variantes imatrix: https://huggingface.co/mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#OTC-Qwen3.8-27B-CPO-GRPO-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
