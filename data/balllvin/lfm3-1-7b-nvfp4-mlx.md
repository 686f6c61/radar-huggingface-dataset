# balllvin/LFM3-1.7B-NVFP4-MLX

## Resumen

LFM3-1.7B-NVFP4-MLX es una conversión comunitaria del modelo LiquidAI/LFM3-1.7B al formato MLX con cuantización de 4 bits en formato NVFP4, publicada por el usuario balllvin. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor toma los pesos originales de Liquid AI y los reempaqueta para su ejecución eficiente en hardware Apple Silicon mediante la librería MLX. El repositorio tiene un tamaño de 1,8 GB y contiene 1.728.801.536 parámetros almacenados en safetensors.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de Liquid AI, una arquitectura híbrida que combina capas de atención con capas de espacio de estado (SSM) diseñadas para inferencia con memoria y cómputo reducidos en contextos largos. Con 1.700 millones de parámetros, se sitúa en la gama pequeña, pensada para despliegue en dispositivos y entornos con recursos limitados.

La relevancia de esta ficha radica en su carácter práctico: ofrece una vía para ejecutar un modelo de 1,7B en Macs con memoria unificada usando MLX y cuantización NVFP4, un formato de 4 bits con escalas por bloque que busca preservar precisión mejor que una cuantización int4 ingenua. La información pública disponible sobre esta conversión concreta es escasa (0 descargas, 0 likes en el momento de la consulta) y el acceso está restringido, por lo que varios datos técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida atención + SSM (familia LFM3 de Liquid AI); detalles exactos no disponibles en la información proporcionada |
| Parametros totales | 1.728.801.536 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits NVFP4 (pesos en safetensors MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia "other" en Hugging Face, acceso restringido) |
| Formato de pesos | safetensors (MLX), 4-bit NVFP4 |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura híbrida de la familia LFM3, que intercala bloques de atención con bloques de espacio de estado (SSM) para reducir el coste de memoria y cómputo en secuencias largas frente a un transformer denso equivalente. Esta conversión concreta no modifica la arquitectura: únicamente reempaqueta los pesos en safetensors con cuantización de 4 bits NVFP4 para su carga con MLX en Apple Silicon. El repositorio incluye `custom_code`, lo que implica que la carga requiere confiar en código remoto o bien revisarlo antes de ejecutarlo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras fases de alineamiento, más allá de lo que publique Liquid AI en la documentación de LFM3-1.7B. Tampoco se detalla el algoritmo exacto de cuantización aplicado por el autor de la conversión (por ejemplo, calibración, tamaño de bloque o tratamiento de capas sensibles), por lo que la fidelidad respecto al modelo original en fp16/bf16 no puede verificarse con los datos disponibles.

## Capacidades

- Generación de texto y conversación multi-turno, según la pipeline declarada (`text-generation`, `conversational`).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base LFM3-1.7B; el alcance exacto no está documentado en esta conversión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados en la ficha del repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon mediante MLX con pesos de 4 bits, lo que permite inferencia local con memoria unificada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en un portátil o Mac mini con MLX gracias a sus 1,7B parámetros en 4 bits (repo de 1,8 GB), sin depender de servicios en la nube ni enviar datos a terceros.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño, permite iterar sobre prompts y flujos conversacionales con latencia baja en hardware de consumo, antes de escalar a modelos mayores.
- Generación de texto en herramientas de escritura: resumen, reescritura y borradores en aplicaciones de escritorio para macOS, aprovechando la integración nativa de MLX con el ecosistema Apple.
- Filtrado y clasificación de texto en local: tareas de etiquetado, detección de intención o extracción de entidades en pipelines que requieren privacidad y bajo coste por inferencia.
- Evaluación y benchmarking de cuantización: útil para investigadores que quieran medir la degradación de calidad de NVFP4 frente al modelo base en fp16/bf16 en tareas controladas.
- Educación y experimentación: entorno accesible para estudiar arquitecturas híbridas atención-SSM y el efecto de la cuantización de 4 bits en modelos de ~1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: en torno a 2-3 GB para los pesos en 4 bits más overhead de activaciones y contexto; el repositorio ocupa 1,8 GB en disco.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con MLX; no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o más; también podría ejecutarse en GPUs NVIDIA consumer si se convierte a otro formato, pero esta conversión es específica de MLX.
- Opciones de despliegue: MLX (`mlx-lm`) es la vía natural; vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este artefacto sin reconversión.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto (M1 vs. M4 Max) y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/LFM3-1.7B-NVFP4-MLX | 1,7B | No disponible | lfm1.0 (gated) | safetensors MLX 4-bit | Acceso restringido |
| LiquidAI/LFM3-1.7B (base) | 1,7B | No disponible | lfm1.0 | safetensors | Público en HF |
| Qwen2.5-1.5B | 1,5B | 32K (según ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Público en HF |
| Llama 3.2 1B | 1,2B | 128K (según ficha oficial de Meta) | Llama 3.2 Community License | safetensors, GGUF | Público en HF |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría (modelos pequeños de ~1-2B); los datos de contexto y licencia provienen de sus fichas oficiales, no de benchmarks ejecutados sobre esta conversión.

## Limitaciones y advertencias

- Artefacto derivado no oficial: no está publicado por Liquid AI, sino por un tercero, por lo que no cuenta con validación del fabricante del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia lfm1.0: es necesario revisar sus términos para uso comercial; no es una licencia permisiva tipo Apache 2.0.
- Riesgo de degradación por cuantización: NVFP4 a 4 bits puede introducir pérdida de calidad frente al modelo base en tareas de razonamiento o código; no se han publicado evaluaciones que lo cuantifiquen.
- `custom_code`: la carga del modelo requiere ejecutar código remoto; conviene auditar los archivos antes de usarlo en producción.
- Idiomas no declarados: no se puede garantizar un buen rendimiento en castellano sin evaluarlo previamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, especialmente en dominios especializados y contextos largos.
- Sin métricas de rendimiento publicadas: no hay datos de latencia, throughput ni benchmarks que permitan comparar con alternativas.
- Ecosistema limitado: al ser específico de MLX, no se integra directamente con stacks de servido habituales (vLLM, TGI).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-NVFP4-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación de Liquid AI: no disponible en la información proporcionada
- Paper de la familia LFM3: no disponible en la información proporcionada
- Repositorio de MLX: no disponible en la información proporcionada
