# inclusionAI/ZwZ2-4B-GGUF

## Resumen

ZwZ2-4B-GGUF es la versión cuantizada en formato GGUF de ZwZ2-4B, un modelo multimodal (visión-lenguaje) de unos 4.200 millones de parámetros desarrollado por inclusionAI. Forma parte del proyecto "Zooming without Zooming v2", una línea de trabajo centrada en mejorar la percepción multimodal de detalles finos sin recurrir a recortes o "zoom" explícitos sobre la imagen, conectando evidencia visual dispersa para lograr una percepción generalizable. El modelo se ha entrenado con refuerzo sobre el dataset inclusionAI/ZwZ2-RL-VQA, orientado a tareas de respuesta visual a preguntas.

La relevancia de esta publicación reside en la disponibilidad de pesos GGUF cuantizados (FP16, Q8_0 y Q4_K_M) tanto del modelo de lenguaje como del codificador de visión y el proyector (`mmproj`), lo que permite ejecutar el modelo de forma local en CPU o en GPUs de consumo mediante llama.cpp, sin depender de infraestructura de datacenter. Con licencia Apache 2.0, es apto para uso comercial.

El repositorio se publica junto a un artículo en arXiv (arXiv:2610.37037) y una colección en Hugging Face con los componentes de la familia Zooming without Zooming v2. La longitud de contexto, la composición exacta del dataset de preentrenamiento y los benchmarks cuantitativos no están detallados en la model card, aunque esta remite a la página del modelo base para las evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (modelo de lenguaje + codificador de vision + proyector); compatible con soporte multimodal Qwen3.5 en llama.cpp |
| Parametros totales | 4.205.751.296 (modelo base en safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (tanto en el LLM como en el componente de vision `mmproj`) |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base distribuido en safetensors) |

## Arquitectura y entrenamiento

ZwZ2-4B sigue el patrón clásico de un modelo vision-language: un codificador de visión y un proyector (`mmproj`) que transforman las imágenes en representaciones comprensibles por un modelo de lenguaje de unos 4B de parámetros. La model card no detalla el backbone exacto del LLM ni del vision encoder, aunque la compatibilidad indicada con el soporte multimodal de Qwen3.5 en llama.cpp sugiere una arquitectura de esta familia. La innovación central del proyecto Zooming without Zooming v2, según el paper citado, es una estrategia de percepción multimodal que extrae y conecta evidencia de detalles visuales sin necesidad de operaciones de zoom o recorte explícitas sobre la imagen.

En cuanto al entrenamiento, la model card referencia el dataset inclusionAI/ZwZ2-RL-VQA, empleado en una fase de aprendizaje por refuerzo (RL) orientada a tareas de pregunta-respuesta visual (VQA). No se dispone de datos sobre el número de tokens de preentrenamiento, la composición del corpus ni el uso de técnicas como SFT, RLHF o DPO. Los resultados de evaluación del modelo original se publican en la página del modelo base y en el paper asociado.

## Capacidades

- Comprensión conjunta de imagen y texto (pipeline image-text-to-text): describe imágenes y responde preguntas sobre su contenido.
- Respuesta visual a preguntas (VQA) refinada mediante RL sobre el dataset ZwZ2-RL-VQA, con énfasis en la percepción de detalles finos sin recurrir a zoom explícito.
- Conexión de evidencia visual dispersa en la imagen para razonamiento perceptual más generalizable, según la metodología del paper.
- Ejecución multimodal local vía llama.cpp (`llama-mtmd-cli` y `llama-server`), con API compatible con OpenAI y interfaz web integrada.
- Selección flexible de precisión: se pueden combinar niveles de cuantización distintos entre el LLM y el `mmproj` (por ejemplo, LLM Q4_K_M con vision encoder FP16).
- Soporte de tool calling, capacidades de agente y modo de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card solo declara inglés.

## Casos de uso

- Descripción automática de imágenes: con `llama-mtmd-cli` o `llama-server` se puede generar descripciones detalladas de imágenes locales, útil para catalogación de activos digitales o accesibilidad.
- VQA en dispositivos locales: gracias a la cuantización Q4_K_M (aproximadamente 2-3 GB para el LLM), el modelo puede responder preguntas sobre imágenes en portátiles o estaciones de trabajo sin GPU de datacenter.
- Indexación y búsqueda visual: se puede integrar en pipelines que procesen grandes volúmenes de imágenes y generen metadatos textuales para motores de búsqueda internos.
- Moderación y revisión de contenido: análisis de imágenes subidas por usuarios con respuestas textuales que describen el contenido, ejecutándose on-premise para preservar la privacidad de los datos.
- Prototipado de aplicaciones multimodales: el endpoint OpenAI-compatible de `llama-server` permite sustituir un API comercial por inferencia local sin cambiar el código cliente.
- Investigación en percepción multimodal: al ser el artefacto del paper "Zooming without Zooming v2" con licencia Apache 2.0, sirve como base reproducible para experimentar con técnicas de percepción de detalles sin zoom.
- Automatización documental: extracción de información de capturas, diagramas o documentos escaneados mediante prompts de VQA en flujos de trabajo de oficina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página del modelo base (inclusionAI/ZwZ2-4B) y al paper arXiv:2610.37037 para las evaluaciones publicadas, e advierte que la cuantización puede afectar a la precisión.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo LLM, aproximada por tipo de cuantización): FP16 ~8-9 GB; Q8_0 ~4,5-5 GB; Q4_K_M ~2,5-3 GB. El componente `mmproj` añade una cantidad adicional dependiente de la precisión elegida (no disponible el tamaño exacto).
- GPUs recomendadas: no disponible de forma explícita; el formato GGUF permite inferencia en CPU, por lo que no se requiere GPU dedicada. Para aceleración, cualquier GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) cubre con holgura las variantes Q8_0 y Q4_K_M.
- Cabe en GPUs de consumo: sí, cómodamente en variantes Q8_0 y Q4_K_M; la variante FP16 requiere una GPU de 12-16 GB o ejecución mixta CPU/GPU.
- Opciones de despliegue: llama.cpp es el runtime indicado (`llama-mtmd-cli` para CLI y `llama-server` para servir con API OpenAI-compatible y UI web). Se requiere una compilación reciente de llama.cpp con soporte multimodal Qwen3.5. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; al ser un modelo de ~4B en GGUF, se esperan velocidades interactivas en CPU moderno y altas en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Dato diferencial |
|---|---|---|---|---|
| ZwZ2-4B-GGUF | 4,2B | GGUF (FP16, Q8_0, Q4_K_M) | Apache 2.0 | VQA con RL especializado; percepción de detalles sin zoom |
| Qwen3-VL-4B (referencia de familia) | ~4B | Safetensors y GGUF comunitarios | Apache 2.0 (según versión) | Multimodalidad general con ecosistema Qwen muy amplio |
| InternVL3-4B / similares de 4B | ~4B | Safetensors | Apache 2.0 (según versión) | VLM generalista con buen rendimiento en benchmarks estándar |

Nota: la comparativa se ofrece a nivel de categoría (VLM de ~4B desplegables localmente); los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La cuantización (especialmente Q4_K_M) puede degradar la precisión respecto al modelo original en FP16; la propia model card lo advierte y remite a las evaluaciones del modelo base.
- Idioma: la model card solo declara soporte de inglés; el rendimiento en castellano no está documentado y puede ser limitado.
- La longitud de contexto no está publicada en esta model card, lo que dificulta planificar tareas con imágenes múltiples o documentos largos.
- No hay información sobre tool calling, agentes ni modos de razonamiento; asumir estas capacidades sin verificación es arriesgado en producción.
- Riesgo de alucinación: inherente a los modelos vision-language; en tareas de VQA fina (donde se centra este modelo) conviene validar las respuestas en flujos críticos.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial.
- Requisito técnico: es necesaria una versión reciente de llama.cpp con soporte multimodal Qwen3.5; versiones antiguas no cargarán el modelo correctamente. Para entrada de imagen siempre debe suministrarse el archivo `mmproj` correspondiente.

## Enlaces

- Modelo GGUF: https://huggingface.co/inclusionAI/ZwZ2-4B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-4B
- Colección Zooming without Zooming v2: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Paper (arXiv:2610.37037): https://arxiv.org/pdf/2610.37037
- Repositorio del proyecto: https://github.com/inclusionAI/Zooming-without-Zooming-v2
- Dataset de RL: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- llama.cpp: https://github.com/ggml-org/llama.cpp
