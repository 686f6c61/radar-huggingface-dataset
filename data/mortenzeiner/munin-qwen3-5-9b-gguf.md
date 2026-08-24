# mortenzeiner/munin-qwen3.5-9B-GGUF

## Resumen

munin-qwen3.5-9B-GGUF es una cuantización GGUF en formato Q4_K_M del modelo [danish-foundation-models/munin-qwen3.5-9B](https://huggingface.co/danish-foundation-models/munin-qwen3.5-9B), un Qwen3.5-9B post-entrenado específicamente para danés por Danish Foundation Models. La conversión fue realizada localmente por el autor (mortenzeiner) con las herramientas de llama.cpp, al no existir un GGUF oficial del checkpoint en el momento de la conversión. El objetivo declarado es servir como modelo de resumen on-device en [transcriber](https://github.com/Morteningemann86/transcriber), una aplicación danesa de transcripción de reuniones.

El modelo tiene 9.197.093.888 parámetros (9,2B) y un peso de 5,8 GB en cuantización Q4_K_M. Su relevancia radica en ser un caso práctico de adaptación de un modelo base multilingüe a un idioma de bajo recurso (danés) mediante post-entrenamiento, y de su posterior despliegue eficiente en dispositivos locales mediante cuantización GGUF. La licencia Apache 2.0 heredada del modelo base permite uso comercial sin restricciones adicionales. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: Gated Delta Networks + Gated Attention, según fuentes externas) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | danés (post-entrenado específico; idiomas base no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un modelo de 9,2B parámetros desarrollado por Alibaba Cloud. Según fuentes externas (apxml.com), utiliza una arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón 8× (3×DeltaNet→FFN→1×Attention→FFN), con grouped-query attention y positional embeddings rotatorios (RoPE) para acelerar la inferencia. La información sobre el post-entrenamiento para danés realizado por Danish Foundation Models no está detallada en la model card: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` usando `--outtype bf16` y posteriormente se cuantizó a Q4_K_M con `llama-quantize`. No se publicaron detalles sobre el proceso de entrenamiento del post-entrenamiento danés.

## Capacidades

- Generación de texto en danés: modelo post-entrenado específicamente para este idioma, con mejora documentada en tareas de comprensión y generación en danés.
- Resumen de texto: caso de uso documentado en la aplicación transcriber para resumir reuniones en danés.
- Conversación: el modelo está etiquetado como "conversational" en HuggingFace, lo que sugiere capacidad de diálogo multi-turno.
- Capacidades multilingües: no documentadas; el modelo base Qwen3.5 probablemente es multilingüe, pero no hay verificación oficial de la variante danesa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no hay evidencia de capacidades multimodales en esta variante.

## Casos de uso

- Resumen automático de reuniones: el caso de uso real del autor, integrado en la aplicación transcriber. El modelo procesa transcripciones en danés y genera resúmenes concisos, aprovechando la cuantización GGUF para ejecución on-device sin conexión.
- Asistente de documentación en danés: puede redactar correos, informes o actas en danés de forma coherente, gracias al post-entrenamiento específico del idioma.
- Análisis de texto corporativo danés: extracción de puntos clave, clasificación de sentimiento o detección de temas en documentos internos de empresas danesas.
- Chatbot de atención al cliente en danés: el modelo etiquetado como conversacional puede mantener diálogos multi-turno en danés, aunque la ventana de contexto no está documentada.
- Generación de contenido en danés: creación de borradores de artículos, descripciones de productos o contenido de marketing en danés, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Despliegue en dispositivos de bajo consumo: gracias a la cuantización Q4_K_M y el formato GGUF, puede ejecutarse en ordenadores portátiles o mini-PC con CPU y RAM limitada, sin necesidad de GPU dedicada.
- Práctica de idiomas: asistente de conversación o corrección de textos en danés para estudiantes, ejecutado localmente sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros evaluaciones para esta variante post-entrenada ni para la cuantización Q4_K_M. El autor no incluye métricas de rendimiento en la model card, y no se encontraron evaluaciones externas en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 5,8 GB; se estima que la inferencia con contexto moderado requiere entre 6 y 8 GB de VRAM en GPU, o memoria RAM si se ejecuta en CPU.
- GPU recomendadas: tarjetas de consumo con 8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070) son suficientes para ejecutar el modelo completo. GPUs con 6 GB pueden funcionar con limitaciones de contexto.
- En consumer GPU: sí, cabe en GPUs de consumo de gama media (8-12 GB). También puede ejecutarse en CPU con suficiente RAM (≥ 16 GB).
- Opciones de despliegue: llama.cpp (incluido en el flujo de conversión del autor), Ollama, vLLM (etiqueta `endpoints_compatible` en HF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| mortenzeiner/munin-qwen3.5-9B-GGUF | 9,2B | Q4_K_M | danés | Apache 2.0 | no disponible |
| mradermacher/munin-qwen3.5-9B-GGUF | 9,2B | no especificado | danés | Apache 2.0 | no disponible |
| llmware/qwen-3.5-9b-gguf | 9,2B | GGUF | multilingüe (base) | no disponible | no disponible |

Los tres modelos son variantes GGUF del mismo checkpoint base Qwen3.5-9B. La diferencia principal es el post-entrenamiento danés en los modelos munin, mientras que llmware ofrece la versión base sin adaptación. La cuantización de mortenzeiner es Q4_K_M; la de mradermacher no se especifica. No hay datos de contexto ni benchmarks disponibles para comparar rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante. Se recomienda validar los outputs en entornos de producción.
- El modelo está especializado en danés; su rendimiento en otros idiomas puede ser degradado, aunque el modelo base Qwen3.5 es multilingüe.
- La ventana de contexto no está documentada, lo que dificulta planificar tareas que requieran contexto largo.
- La cuantización Q4_K_M puede implicar una ligera pérdida de calidad respecto al checkpoint en bf16, aunque no se han cuantificado las diferencias.
- No se han documentado limitaciones de tool calling, agentes o razonamiento multi-paso; estas capacidades no están verificadas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (Qwen3.5) y del post-entrenamiento de Danish Foundation Models para cumplir con las condiciones de atribución.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no hay validación comunitaria ni pruebas extensivas publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mortenzeiner/munin-qwen3.5-9B-GGUF
- Modelo base (post-entrenado): https://huggingface.co/danish-foundation-models/munin-qwen3.5-9B
- Aplicación transcriber: https://github.com/Morteningemann86/transcriber
- Conversión alternativa GGUF: https://huggingface.co/mradermacher/munin-qwen3.5-9B-GGUF
- Qwen3.5-9B GGUF (base): https://huggingface.co/llmware/qwen-3.5-9b-gguf
- Artículo de despliegue: https://dranne.org/2026/07/13/deploy-qwen3-5-9b-gguf/
- Guía de despliegue FP4: https://tntitservices.com/2026/07/01/full-deployment-qwen3-5-9b-gguf-on-amd-nvidia-gpu-with-native-fp4-no-code-guide/
- Especificaciones y VRAM: https://apxml.com/models/qwen35-9b
