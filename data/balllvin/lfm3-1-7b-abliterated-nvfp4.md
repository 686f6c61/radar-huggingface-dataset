# balllvin/LFM3-1.7B-Abliterated-NVFP4

## Resumen

LFM3-1.7B-Abliterated-NVFP4 es una cuantización en formato NVFP4 (4 bits, con capa de 8 bits según los tags del repositorio) del modelo orcarouter/LFM3-1.7B-abliterated, publicada por el usuario balllvin en Hugging Face. El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de Liquid AI, de la que hereda la arquitectura y el tokenizador; la variante "abliterated" implica que se ha aplicado una técnica de eliminación de la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones sensibles.

Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones), concebido para inferencia eficiente en hardware moderno con soporte de FP4 nativo (GPU Blackwell de NVIDIA y pipelines basados en TensorRT Model Optimizer / modelopt). El repositorio incluye código personalizado (`custom_code`) y pesos en safetensors, y está pensado para cargarse con la librería transformers.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de muy baja precisión (4 bits NVFP4) de un modelo pequeño, lo que interesa a quien busque minimizar huella de VRAM; por otro, advierte de que se trata de un derivado "abliterated" con acceso restringido (gated) y licencia `lfm1.0`, lo que condiciona su uso comercial. El modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) con componentes de 8 bits según tags; formato modelopt |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (etiquetada como `license:other` en los tags) |
| Formato de pesos | safetensors (con `custom_code` y configuración modelopt) |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo base LFM3-1.7B más allá de la etiqueta de familia (`lfm3`) y del pipeline de generación de texto. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea componentes híbridos (SSM/atención) propios de la familia LFM. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO.

Lo que sí consta es el proceso de esta publicación concreta: una cuantización a NVFP4 realizada con las herramientas de NVIDIA (tag `modelopt`), que reduce los pesos a 4 bits con escalas de bloque en FP8/FP4 y conserva algunas capas en 8 bits (tags `4-bit` y `8-bit`). Sobre el modelo base, la variante "abliterated" implica una modificación post-entrenamiento orientada a suprimir la dirección de rechazo, práctica habitual en la comunidad para obtener modelos más permisivos; no se detalla la metodología exacta empleada por el autor del modelo base (orcarouter).

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag `conversational`).
- Razonamiento y respuesta multi-turno, limitado por el contexto no documentado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para despliegue como API.
- Carga mediante `transformers` con código personalizado (`custom_code`), lo que exige `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: solo inglés declarado; no se garantiza calidad en otros idiomas.
- Al ser "abliterated", se espera una menor tasa de rechazos ante peticiones sensibles, aunque este comportamiento no está cuantificado en la información disponible.

## Casos de uso

- Despliegue en GPU Blackwell con FP4 nativo: el formato NVFP4 está diseñado para aprovechar los tensor cores de FP4 de las GPU de NVIDIA de última generación, lo que permite servir el modelo con menor huella de VRAM y mayor throughput que una cuantización de 8 o 16 bits.
- Prototipado de asistentes conversacionales en inglés: al ser un modelo de 1,7 B parámetros, encaja en entornos de desarrollo con recursos limitados para iterar sobre prompts y flujos de chat.
- Investigación sobre cuantización extrema: útil para estudiar la degradación de calidad al pasar de pesos completos a NVFP4 en un modelo pequeño, comparando con el modelo base sin cuantizar.
- Evaluación de técnicas de abliteration: permite analizar cómo se comporta una variante sin dirección de rechazo tras una cuantización agresiva, un escenario relevante para estudios de seguridad y alineamiento.
- Generación de texto de bajo coste en pipelines por lotes: tareas de resumen, clasificación o reescritura en inglés donde el coste por token prima sobre la calidad máxima.
- Integración en servicios compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso en infraestructuras de inferencia que aceptan el formato de pesos modelopt, aunque la disponibilidad real depende del proveedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73 B parámetros en NVFP4 (4 bits), los pesos ocupan aproximadamente 0,9 GB; el repositorio pesa 1,8 GB, lo que incluye posibles capas de 8 bits y metadatos. Sumando activaciones y caché KV, se estima un consumo de 1,5-3 GB según longitud de contexto (estimación, no dato oficial).
- GPU recomendadas: GPU NVIDIA Blackwell (serie RTX 50, B200, GB200) para aprovechar FP4 de forma nativa; en arquitecturas anteriores (Hopper, Ada) el soporte de NVFP4 depende del runtime y puede requerir de-cuantización o kernels específicos.
- Cabe en GPU de consumo con al menos 4-8 GB de VRAM si el runtime soporta NVFP4; en su defecto, puede requerir conversión a otro formato.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el ecosistema modelopt/TensorRT-LLM es el camino natural para NVFP4. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/LFM3-1.7B-Abliterated-NVFP4 | 1,73 B | no disponible | NVFP4 (4 bits) | lfm1.0 (gated) | Hugging Face, acceso restringido |
| orcarouter/LFM3-1.7B-abliterated | ~1,7 B | no disponible | pesos originales (presumiblemente BF16/FP16) | lfm1.0 | Hugging Face |
| LFM3-1.7B (modelo original de Liquid AI) | ~1,7 B | no disponible | BF16/FP16 | lfm1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia `lfm1.0`: impone condiciones específicas de uso; conviene revisar los términos antes de cualquier despliegue comercial, ya que no es una licencia permisiva estándar (Apache 2.0 o MIT).
- Modelo "abliterated": la supresión de la dirección de rechazo puede aumentar la probabilidad de generar contenido dañino, ofensivo o inseguro; no debe usarse en producción orientada a usuarios sin filtros adicionales.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Cuantización NVFP4: la pérdida de precisión puede degradar la coherencia y el razonamiento respecto al modelo base; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Riesgo de alucinación: inherente a modelos de 1,7 B parámetros, especialmente en tareas de conocimiento factual.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del repositorio; auditar antes de usar en entornos sensibles.
- Soporte limitado de runtimes: NVFP4 no está universalmente soportado; la portabilidad a vLLM, llama.cpp u Ollama no está documentada.
- Sesgos: no documentados; los modelos pequeños entrenados mayoritariamente en inglés tienden a reflejar sesgos culturales y lingüísticos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-NVFP4
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Familia LFM3 de Liquid AI: no disponible en la información proporcionada
- Documentación de NVIDIA TensorRT Model Optimizer (modelopt): no disponible en la información proporcionada
