# AmberHeart/Uni-MOPD-Teacher-OCR-Bank2

## Resumen

Uni-MOPD-Teacher-OCR-Bank2 es un especialista en comprensión de documentos, OCR y gráficos desarrollado por AmberHeart como parte del proyecto Uni-MOPD (Unified Multi-Teacher On-Policy Distillation). Se trata de un modelo visión-lenguaje de tipo mixture-of-experts (MoE) derivado de Qwen/Qwen3-VL-30B-A3B-Instruct, con 31.070.754.032 parámetros totales y aproximadamente 3.000 millones activos por token (según la nomenclatura A3B del modelo base). Este especialista concreto pertenece al segundo banco de especialistas del paper y se distingue del primer especialista OCR por su ruta de post-entrenamiento: se entrena con SFT y RL exclusivamente sobre el dominio documental/OCR, sin partir de un checkpoint SFT multi-dominio.

El modelo resuelve el problema de integrar capacidades especializadas de dominio en un único estudiante unificado. Uni-MOPD propone combinar un "strong start" (fusión uniforme y sin entrenamiento de los especialistas del mismo modelo base) con una "simple recipe" (destilación on-policy multi-profesor con muestreo uniforme de dominios y KL inversa sobre todo el vocabulario). Este repositorio contiene uno de los profesores especialistas empleados en ese proceso, no el estudiante final.

Es relevante ahora porque demuestra una receta reproducible para consolidar especialistas multimodales sin sacrificar rendimiento de dominio, y porque el artefacto publicado sirve tanto para reproducir la destilación como para usar directamente un especialista OCR de 31B parámetros con licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 14 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (Qwen3-VL MoE, clase `Qwen3VLMoeForConditionalGeneration`) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | Aproximadamente 3.000 millones (nomenclatura A3B del modelo base; no se detalla el reparto exacto en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors (bfloat16, 14 shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-30B-A3B-Instruct: un transformer MoE visión-lenguaje instruido, con encoder visual y decoder de mezcla de expertos. Los 31.070.754.032 parámetros totales se distribuyen en los 14 shards safetensors en bfloat16 que ocupan los 62,2 GB del repositorio. El modelo procesa entradas image-text-to-text mediante `AutoProcessor` y genera texto con `generate()`.

El post-entrenamiento de este especialista concreto combina SFT y RL sobre el dominio documental/OCR/chart exclusivamente, a diferencia de `Uni-MOPD-Teacher-OCR`, que inicia su RL de dominio desde un checkpoint SFT multi-dominio. Todos los especialistas del banco parten del mismo checkpoint base, lo que comparte arquitectura y vocabulario y permite tanto la fusión en espacio de pesos (usada en `Uni-MOPD-Merge`) como la destilación a nivel de token. La receta Uni-MOPD aplica después una destilación on-policy multi-profesor con muestreo uniforme de dominios y KL inversa sobre todo el vocabulario. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del algoritmo de RL.

## Capacidades

- Comprensión de documentos: lectura de texto en imágenes, extracción de contenido estructurado y respuesta a preguntas sobre documentos.
- OCR: reconocimiento de texto impreso y manuscrito en imágenes.
- Comprensión de gráficos y tablas: interpretación de charts y datos visuales estructurados.
- Generación de texto multimodal: respuestas en lenguaje natural condicionadas a imagen y prompt textual.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Especialización de dominio: entrenado exclusivamente para document/OCR/chart, sin las capacidades generales de VQA, STEM, GUI o embodied de otros especialistas del banco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve los campos extraídos en texto estructurado, aprovechando su SFT y RL específicos sobre dominio documental.
- Extracción de datos de formularios escaneados: procesamiento por lotes de formularios con `generate()` y prompts de extracción, adecuado por su especialización OCR frente a modelos generalistas.
- Respuesta a preguntas sobre contratos y pólizas: consultas en lenguaje natural sobre imágenes de documentos legales, con la plantilla de chat para mantener contexto conversacional.
- Lectura de gráficos en informes: interpretación de charts y tablas embebidos en PDFs convertidos a imagen, tarea cubierta explícitamente por el dominio del especialista.
- Pipeline de accesibilidad documental: conversión de documentos escaneados a texto legible y resúmenes para usuarios con discapacidad visual, usando el pipeline image-text-to-text.
- Generación de datasets sintéticos de OCR: uso como profesor en destilación hacia modelos más pequeños, que es precisamente el rol para el que se publicó este checkpoint dentro de Uni-MOPD.
- Moderación y auditoría de documentos: verificación automática de contenido en imágenes de documentos en flujos de compliance, con despliegue local por la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren GPUs de 80 GB o multi-GPU.
- Cuantización: no se publican pesos GGUF ni AWQ/GPTQ; habría que generarlos a partir de los safetensors, y no se garantiza su calidad para este especialista.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en bfloat16; requeriría cuantización agresiva no publicada.
- Opciones de despliegue: `transformers>=4.57.1` con `Qwen3VLMoeForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uni-MOPD-Teacher-OCR-Bank2 | 31,07 B (MoE, ~3 B activos) | No disponible | Document/OCR/chart (SFT+RL solo dominio) | Apache 2.0 | Hugging Face |
| Uni-MOPD-Teacher-OCR | No disponible (mismo base) | No disponible | Document/OCR/chart (RL desde SFT multi-dominio) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 31,07 B (MoE, ~3 B activos) | No disponible | Generalista instruido | Apache 2.0 | Hugging Face |
| Uni-MOPD (estudiante unificado) | No disponible (mismo base) | No disponible | Cinco dominios integrados | Apache 2.0 | Hugging Face |

La comparación con `Uni-MOPD-Teacher-OCR` es la más directa: mismo modelo base y mismo dominio, pero distinta ruta de post-entrenamiento (el Bank2 se entrena solo con datos OCR, el primero parte de un SFT multi-dominio con cobertura más amplia). No se dispone de métricas comparativas publicadas para cuantificar la diferencia.

## Limitaciones y advertencias

- Es un especialista de dominio: no está diseñado para VQA general, razonamiento STEM, GUI grounding ni embodied understanding; su rendimiento fuera de document/OCR/chart puede degradarse frente al modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en campos numéricos y tablas; conviene validación posterior en producción.
- No se documentan sesgos conocidos ni evaluación de sesgo en la información disponible.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe sin evaluación.
- Longitud de contexto no especificada; planificar el particionado de documentos largos sin asumir una ventana concreta.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el fichero NOTICE con la declaración de modificaciones respecto al modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.
- Requiere `transformers>=4.57.1`; versiones anteriores no cargarán la clase `Qwen3VLMoeForConditionalGeneration`.
- El modelo es un profesor de destilación, no el estudiante unificado final; para el modelo consolidado debe consultarse el repositorio `Uni-MOPD`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR-Bank2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Repositorio del estudiante unificado: https://huggingface.co/AmberHeart/Uni-MOPD
- Repositorio de la fusión inicial: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista VQA: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Especialista OCR (primer banco): https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Especialista GUI: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Especialista embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
