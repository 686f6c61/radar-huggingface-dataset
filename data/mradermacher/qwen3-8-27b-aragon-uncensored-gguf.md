# mradermacher/qwen3.8-27b-aragon-uncensored-GGUF

## Resumen

El modelo `mradermacher/qwen3.8-27b-aragon-uncensored-GGUF` es una colección de cuantizaciones GGUF del modelo base `jdqqjr/qwen3.8-27b-aragon-uncensored`, una variante "uncensored" y "abliterated" de la familia Qwen 3.8 con 27.320 millones de parámetros. El autor, mradermacher, es conocido por generar cuantizaciones estáticas de alta calidad para ejecución local mediante llama.cpp, Ollama u otros motores compatibles con GGUF.

La relevancia de este modelo radica en que ofrece una versión sin los mecanismos de rechazo y censura típicos de los modelos comerciales, lo que lo hace atractivo para investigación en seguridad, generación de contenido creativo sin restricciones y experimentación con técnicas de "abliteration". El repositorio incluye múltiples niveles de cuantización (desde Q2_K hasta Q8_0) y archivos de proyección multimodal (mmproj), lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se confirma en la documentación disponible.

Al ser una cuantización, no se aportan datos de entrenamiento ni benchmarks propios; la información se limita a los archivos y a las referencias del modelo original. La licencia no está especificada en la ficha de HuggingFace, aunque fuentes externas indican que el modelo base Qwen 3.8 27B se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8, sin detalles adicionales) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el modelo base Qwen 3.8 27B se reporta como Apache 2.0 en fuentes externas) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el nombre y los tags, se trata de un transformer de la familia Qwen 3.8 con 27.320 millones de parametros, probablemente denso (no se mencionan parametros activos). El modelo original `jdqqjr/qwen3.8-27b-aragon-uncensored` ha sido sometido a un proceso de "abliteration", una tecnica que elimina o neutraliza las capas responsables de los rechazos y las respuestas de seguridad, dando lugar a un comportamiento "uncensored". No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO.

La cuantizacion realizada por mradermacher es de tipo estatico (sin imatrix), generada a partir de los pesos originales en formato HuggingFace. Se incluyen dos archivos mmproj (Q8_0 y f16) que sugieren la presencia de un proyector multimodal, probablemente para procesamiento de imagenes, aunque no se confirma su funcionamiento en la documentacion.

## Capacidades

- Generacion de texto libre y conversacional en ingles, sin filtros de contenido ni rechazos por temas sensibles.
- Posible soporte multimodal (vision) gracias a los archivos mmproj incluidos, aunque no se documenta su uso.
- Integracion con motores de inferencia locales como llama.cpp, Ollama y otros compatibles con GGUF.
- Capacidad de ejecucion en hardware de consumo gracias a las cuantizaciones de menor tamaño (Q2_K, Q3_K).
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso; se asume que hereda las del modelo base Qwen 3.8, pero no hay confirmacion.

## Casos de uso

- Generacion de ficcion y narrativa creativa sin restricciones tematicas: el modelo puede producir textos literarios, guiones o dialogos con libertad creativa, gracias a su naturaleza uncensored.
- Investigacion en seguridad y alineacion de modelos: permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, util para analizar sesgos, riesgos y tecnicas de mitigacion.
- Creacion de contenido para entornos controlados (por ejemplo, simulaciones de dialogos o juegos de rol) donde se requiere que el modelo no se niegue a responder.
- Experimentacion con tecnicas de "abliteration" y cuantizacion: el repositorio ofrece multiples niveles de precision para evaluar el impacto de la cuantizacion en la calidad de las respuestas.
- Despliegue local en equipos con VRAM limitada: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en GPUs de 12 GB o menos, aunque con perdida de calidad.
- Prototipado rapido de aplicaciones conversacionales sin censura en entornos de desarrollo, usando Ollama o llama.cpp para servir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para este modelo cuantizado ni para su version base.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantizacion y overhead de contexto):
  - Q2_K (11.0 GB): requiere al menos 12-14 GB de VRAM.
  - Q3_K_M (13.6 GB): requiere al menos 16 GB de VRAM.
  - Q4_K_M (16.9 GB): requiere al menos 20 GB de VRAM.
  - Q5_K_M (19.6 GB): requiere al menos 24 GB de VRAM.
  - Q6_K (22.5 GB): requiere al menos 28 GB de VRAM.
  - Q8_0 (29.1 GB): requiere al menos 32 GB de VRAM.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o inferior; A100 40 GB o H100 para Q8_0.
- En consumer GPU, las cuantizaciones Q2_K y Q3_K caben en tarjetas de 12 GB (RTX 3060, 4070), mientras que Q4_K_M y superiores necesitan 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria (uncensored de ~27B). Se puede mencionar que existen alternativas como `Qwen3-30B-A3B` (MoE) o `Llama-3-8B` uncensored, pero no hay datos de rendimiento comparables en la informacion proporcionada. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso debe limitarse a entornos de investigacion y bajo responsabilidad del usuario.
- No se ha verificado la calidad de las respuestas tras la cuantizacion; las versiones de menor precision (Q2_K, Q3_K) pueden presentar degradacion notable en coherencia y exactitud.
- La licencia no esta claramente especificada en el repositorio; aunque el modelo base Qwen 3.8 se reporta como Apache 2.0, la variante "aragon-uncensored" podria tener restricciones adicionales. Se recomienda contactar con el autor del modelo base antes de un uso comercial.
- No se dispone de informacion sobre la longitud de contexto real; si se excede la ventana soportada, el modelo puede producir respuestas incoherentes o repetitivas.
- El soporte multimodal (vision) no esta documentado; los archivos mmproj podrian no funcionar correctamente con todos los motores de inferencia.
- Riesgo de alucinaciones elevado, especialmente en temas factuales, al no contar con filtros de seguridad ni verificacion de fuentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen3.8-27b-aragon-uncensored-GGUF
- Modelo base: https://huggingface.co/jdqqjr/qwen3.8-27b-aragon-uncensored
- Blog sobre ejecucion local de Qwen 3.8 27B uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Guia de VRAM y quants para Qwen 3.8 27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
