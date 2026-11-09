# CERTH-ITI-IDT/ckd-llava-Qwen2.5-1.5B-siglip-so400m-patch14-384-7b_3b_1_5b

## Resumen

El modelo `ckd-llava-Qwen2.5-1.5B-siglip-so400m-patch14-384-7b_3b_1_5b` es un modelo vision-lenguaje (VLM) de tipo LLaVA desarrollado por el grupo CERTH-ITI-IDT, derivado mediante una técnica de destilación de conocimiento en cascada (Cascaded Knowledge Distillation, CKD) propuesta en su paper. El modelo combina un LLM Qwen2.5-1.5B con un conector MLP2x_GELU y una torre visual SigLIP (`siglip-so400m-patch14-384`), siguiendo la arquitectura TinyLLaVA.

La particularidad del modelo reside en su proceso de entrenamiento: se ha destilado de forma ascendente (bottom-up) desde un profesor de 7B (`TinyLLaVA-Qwen2.5-7B-SigLIP`) pasando por un asistente de profesor de 3B (`TinyLLaVA-Qwen2.5-3B-SigLIP`), lo que permite a un modelo de tan solo ~1.980 millones de parámetros totales heredar capacidades de modelos significativamente mayores. El resultado es un VLM compacto orientado a tareas de comprensión visual y respuesta a preguntas sobre imágenes.

Es relevante por su reducido tamaño, que lo hace desplegable en hardware de consumo, y por su licencia permisiva CC-BY-4.0, que facilita su uso comercial. No obstante, la información pública disponible es muy escasa: la model card es mínima y no se han publicado benchmarks, idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA / TinyLLaVA (LLM + conector MLP + torre visual SigLIP) |
| Parametros totales | 1.976.071.744 (~1,98B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema LLaVA estándar con tres componentes: un LLM base Qwen2.5-1.5B, un conector MLP de dos capas con activación GELU (MLP2x_GELU) que proyecta las representaciones visuales al espacio del LLM, y una torre visual SigLIP `siglip-so400m-patch14-384` (parches de 14x14 píxeles a resolución 384). Esta combinación es la empleada por la familia TinyLLaVA.

El entrenamiento se basa en la destilación de conocimiento en cascada (CKD) descrita en el paper de los autores. El proceso es ascendente: primero se entrena un modelo de 3B como asistente de profesor tomando como referencia un profesor de 7B (`TinyLLaVA-Qwen2.5-7B-SigLIP`), y posteriormente el modelo de 1.5B se destila del asistente de 3B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset multimodal, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de imágenes y respuesta a preguntas visuales (VQA) en formato conversacional tipo LLaVA.
- Generación de texto condicionada a entrada visual (descripciones, razonamiento sobre la imagen).
- Capacidad de diálogo multi-turno con contexto visual, heredada del formato de instrucciones LLaVA.
- Razonamiento básico y conocimiento general heredado del LLM Qwen2.5-1.5B.
- Soporte de tool calling / function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión de vídeo, audio: no disponible.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo puede generar descripciones textuales de imágenes para enriquecer fichas de e-commerce, aprovechando su reducido tamaño para despliegue en servidores modestos.
- Accesibilidad: generación de texto alternativo (alt-text) para imágenes en sitios web, con la ventaja de que el modelo cabe en GPUs de consumo y puede ejecutarse on-premise.
- Moderación y etiquetado de contenido visual: clasificación y descripción de imágenes en pipelines de revisión, con la licencia CC-BY-4.0 permitiendo uso comercial.
- Asistente de documentación técnica: responder preguntas sobre capturas de pantalla, diagramas o gráficos en herramientas de soporte, gracias a su formato conversacional LLaVA.
- Prototipado e investigación en destilación de VLMs: servir como punto de partida o baseline para estudiar técnicas CKD y comparar con modelos de mayor tamaño.
- Extracción de información de documentos escaneados simples: lectura de formularios o recibos con texto legible, integrable en flujos de digitalización de bajo coste.
- Educación y demos interactivas: despliegue en entornos con recursos limitados (portátiles con GPU, edge devices) para demostraciones de VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 4 GB para los pesos (~1,98B parámetros a 2 bytes), más overhead de activaciones y KV cache; estimación práctica de 6-8 GB.
- VRAM estimada en cuantización de 8 bits: ~2-3 GB de pesos; en 4 bits: ~1-1,5 GB de pesos (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM en FP16 (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100, H100). En cuantización 4/8 bits podría caber en GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores en FP16; en GPUs de gama baja con cuantización.
- Opciones de despliegue: al ser un modelo TinyLLaVA, es compatible con el ecosistema LLaVA/TinyLLaVA (transformers, vLLM con soporte LLaVA, llama.cpp para versiones GGUF si se generan). No se han publicado pesos GGUF oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ckd-llava-Qwen2.5-1.5B-siglip (este) | ~1,98B | no disponible | CC-BY-4.0 | Destilado CKD desde 7B/3B |
| TinyLLaVA-Qwen2.5-3B-SigLIP | ~3B (estimado) | no disponible | no disponible | Asistente de profesor en la cascada |
| TinyLLaVA-Qwen2.5-7B-SigLIP | ~7B (estimado) | no disponible | no disponible | Profesor de la cascada |
| LLaVA-1.5-7B | ~7B | 4096 tokens (típico en LLaVA-1.5) | no disponible | Referencia clásica de VLM 7B |

Los datos de parámetros y contexto de los modelos comparables son estimaciones basadas en sus denominaciones y en la arquitectura TinyLLaVA; no se dispone de fichas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar de Qwen2.5 y de datasets visuales no especificados, es probable que presente sesgos de género, culturales y geográficos, pero no hay evidencia publicada.
- Riesgo de alucinación: alto en tareas de VQA y descripción de imágenes, dado el reducido tamaño del LLM (1.5B) y la ausencia de benchmarks que cuantifiquen su fiabilidad.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto ni los idiomas soportados; el uso multilingüe no está garantizado.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar a los autores y el paper.
- Caveats para producción: la model card es mínima, no hay benchmarks ni evaluación independiente; las 5 descargas y 0 likes indican poca validación comunitaria. No se han publicado pesos cuantizados ni integraciones verificadas con vLLM/llama.cpp.
- El modelo está fechado en 2026 según los metadatos, lo que puede indicar una publicación reciente o un error de metadatos; conviene verificar la vigencia antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/CERTH-ITI-IDT/ckd-llava-Qwen2.5-1.5B-siglip-so400m-patch14-384-7b_3b_1_5b
- Paper de referencia (CKD, según la model card): no disponible en la información proporcionada
- Repositorio TinyLLaVA: no disponible en la información proporcionada
- Repositorio LLaVA: no disponible en la información proporcionada
- Demo: no disponible
