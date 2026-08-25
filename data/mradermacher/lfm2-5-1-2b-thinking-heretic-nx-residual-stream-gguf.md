# mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream-GGUF

## Resumen

LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream-GGUF es una cuantización en formato GGUF del modelo base homónimo desarrollado por 0xzknw, que a su vez es una variante editada del modelo LFM2.5-1.2B-Thinking de Liquid AI. El modelo original es un modelo de razonamiento de 1.2B parámetros optimizado para ejecución en dispositivos de bajo consumo (edge AI), con un peso inferior a 900 MB en cuantizaciones ligeras y capacidad para realizar tareas de lógica, matemáticas y razonamiento multi-paso. La variante "Heretic-NX-Residual-Stream" incorpora técnicas de edición de modelo (model editing) como "abliteration" para eliminar capas de rechazo y "uncensoring", lo que altera su comportamiento de seguridad respecto al modelo base.

La relevancia de esta versión cuantizada radica en que permite desplegar un modelo de razonamiento de tamaño reducido en hardware limitado, como teléfonos móviles, Raspberry Pi o GPUs de gama baja, manteniendo un rendimiento competitivo en tareas de razonamiento. El autor de la cuantización, mradermacher, ha publicado múltiples niveles de compresión (Q2_K hasta f16) para adaptarse a distintas restricciones de memoria y calidad. La licencia es "lfm-open-license-v1.0", que permite uso comercial bajo condiciones específicas, aunque la modificación "uncensored" puede implicar riesgos legales o éticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model, optimizado para edge) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la información) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking emplea la arquitectura LFM2 de Liquid AI, diseñada específicamente para dispositivos de borde. Se trata de un transformer optimizado que incorpora técnicas de atención eficiente para reducir el consumo de memoria y latencia, manteniendo la capacidad de razonamiento. La versión "Heretic-NX-Residual-Stream" añade una modificación sobre el modelo base: la técnica "residual-stream" implica una intervención en el flujo residual de los bloques del transformer, y la etiqueta "abliterated" indica que se han eliminado pesos o capas que generan respuestas de rechazo o negación, resultando en un modelo menos censurado. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO, aunque la documentación de Liquid AI indica que el modelo base fue entrenado específicamente para razonamiento con cadena de pensamiento (chain-of-thought).

## Capacidades

- Razonamiento avanzado: resolución de problemas matemáticos, lógicos y de razonamiento multi-paso con cadena de pensamiento.
- Generación de texto: respuesta a instrucciones y generación de contenido natural en ocho idiomas.
- Multilingüe: soporta inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ejecución en dispositivos: optimizado para inferencia en CPU y GPU de baja capacidad, con modelos GGUF de 0.6 a 2.4 GB.
- Edición de modelo: la variante "Heretic-NX" incluye abliteración y eliminación de censura, lo que permite respuestas sin restricciones de contenido (dentro de los límites de la licencia).
- Compatibilidad con herramientas: no se menciona soporte explícito para tool calling o function calling en la información disponible.

## Casos de uso

- Asistente de razonamiento en móvil: con un peso de 900 MB en cuantización Q4_K_M, puede integrarse en aplicaciones móviles para resolver problemas matemáticos, explicar conceptos o guiar en tareas de lógica sin conexión a internet.
- Tutor inteligente offline: un tutor virtual que guía al estudiante paso a paso en ejercicios de física o matemáticas, aprovechando la cadena de razonamiento del modelo y la posibilidad de ejecutarse en tablets o portátiles de gama baja.
- Chat local para entornos con censura: en regiones donde el contenido está restringido, esta variante "uncensored" puede utilizarse para ofrecer respuestas no filtradas, siempre que se cumpla la legislación local y la licencia.
- Automatización de documentación técnica: generar informes, resúmenes o respuestas a correos en idiomas como árabe o coreano, aprovechando el soporte multilingüe, sin depender de servicios en la nube.
- Edge AI en IoT: desplegar el modelo en un dispositivo con CPU ARM y 1 GB de RAM para tareas de razonamiento en el borde, como análisis de logs o toma de decisiones en sensores inteligentes.
- Prototipado de agentes conversacionales: desarrollar un chatbot de bajo costo que funcione en un Raspberry Pi o un mini PC, usando llama.cpp o Ollama, para pruebas de concepto sin inversión en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de Liquid AI menciona que LFM2.5-1.2B-Thinking es el mejor en su categoría en razonamiento y velocidad para su tamaño, pero no se aportan cifras concretas en la model card ni en los resultados de búsqueda. Por tanto, no se pueden presentar datos numéricos verificados.

## Requisitos de hardware

- VRAM estimada: para cuantización Q2_K (0.6 GB) puede ejecutarse en GPU con 1 GB de VRAM; Q4_K_M (0.8 GB) requiere unos 2 GB; f16 (2.4 GB) necesita al menos 4 GB de VRAM.
- GPU recomendadas: NVIDIA GTX 1060 6GB o superior para cuantizaciones Q4/Q5; para Q2/Q3, cualquier GPU con 2 GB es suficiente. En CPU, funciona con al menos 4 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, y servidores compatibles con GGUF (TGI no lo soporta nativamente, pero se puede usar con llama.cpp).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni comparaciones directas con otros modelos en la información proporcionada. Sin embargo, por su tamaño y enfoque, se puede comparar cualitativamente con modelos como Qwen2.5-1.5B, Gemma-2-2B o Llama-3.2-1B, aunque no hay datos objetivos de rendimiento. La licencia lfm-open-license-v1.0 es más permisiva que la de muchos modelos de código abierto (como Llama), pero no se puede verificar su compatibilidad comercial sin revisar el texto completo de la licencia.

## Limitaciones y advertencias

- La versión "uncensored" y "abliterated" puede generar contenido inapropiado, violento o sexual, lo que conlleva riesgos legales y éticos en entornos de producción.
- No se especifica la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas de texto (más de 2048 tokens, presumiblemente).
- Riesgo de alucinación inherente a los modelos de 1.2B, especialmente en tareas de razonamiento complejo o factualidad.
- La licencia lfm-open-license-v1.0 no está ampliamente documentada; se recomienda revisar los términos completos para uso comercial y redistribución.
- Solo soporta 8 idiomas, lo que excluye lenguas minoritarias o dialectos.
- El modelo base ha sido modificado por terceros (0xzknw) y no está respaldado oficialmente por Liquid AI, por lo que no hay garantía de calidad o seguridad en la variante "Heretic".

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream-GGUF
- Modelo base (safetensors): https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-heretic-i1-GGUF
- Documentación de LFM2.5-1.2B-Thinking: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Blog de Liquid AI sobre razonamiento en dispositivo: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Blog de Liquid AI sobre la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
