# mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF

## Resumen

Este repositorio contiene un conjunto de cuantizaciones GGUF estáticas del modelo `0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic`, un ajuste fino de tipo "uncensored" construido sobre la base Qwen3.8-27B. Lo publica mradermacher, un autor habitual de repositorios de cuantización derivados de terceros. El modelo cuenta con 27.320.697.856 parámetros reales (aproximadamente 27,3 mil millones), y el repositorio ocupa 79,7 GB en total porque agrupa doce variantes de cuantización distintas en un único espacio.

El problema que resuelve es de tipo práctico: permitir la ejecución local de un modelo de ~27B con sesgos de contenido reducidos en hardware de consumo, mediante formatos GGUF compatibles con llama.cpp, Ollama o LM Studio. La disponibilidad de doce niveles de cuantización (desde Q2_K hasta f16) permite ajustar el equilibrio entre calidad y VRAM según la GPU disponible.

Como advertencia inicial, el repositorio no declara licencia, idiomas soportados ni pipeline, y en el momento de la consulta registra 0 descargas y 0 likes con una fecha de creación y actualización del 24 de septiembre de 2026 (separadas por apenas 27 minutos). Se trata, por tanto, de una publicación sin validación comunitaria ni documentación técnica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base declarado es Qwen3.8-27B, derivado de la serie Qwen3.8; no se detalla en la información disponible si es transformer denso, MoE o híbrido) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO para este ajuste concreto. El repositorio únicamente documenta metadatos de conversión y cuantización: versión de cuantizador 2, tensor de salida cuantizado y tipo de conversión desde el formato de Hugging Face. El modelo origen del ajuste es `0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic`, del que tampoco se aportan detalles de entrenamiento en la información disponible.

A nivel de linaje, los resultados de búsqueda apuntan a que Qwen3.8 se presenta como la primera serie de Qwen con un modelo de clase Qwen-Max en liberación abierta, construida sobre la base arquitectónica de Qwen3.5, con mejoras declaradas en código, trabajo profesional, investigación y tareas agénticas de horizonte largo. No obstante, estos datos corresponden a la serie base de Qwen y no pueden atribuirse automáticamente a este ajuste fino no censurado, cuyo autor de la variante original es un tercero (0xSojalSec) y no Qwen.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio es la única capacidad declarada explícitamente.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio está preparado para su uso con infraestructura de endpoints compatibles con Hugging Face.
- Reducción de rechazos: la denominación "Uncensored" en el nombre hace referencia a la convención habitual de ajustes finos que reducen las negativas del modelo a responder, aunque no se documenta el método empleado.
- Orientación agéntica: el nombre incluye "Agentic", pero no existe documentación que confirme soporte verificado de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible.
- Capacidades multimodales (visión, audio): no disponibles para este ajuste; los resultados de búsqueda mencionan evaluaciones de MathVision sobre Qwen3.8-27B base, pero no se aportan resultados ni se confirma herencia de esa capacidad.
- Modo de razonamiento explícito: no disponible.

## Casos de uso

- Inferencia local en estación de trabajo: ejecutar la variante Q4_K_M o Q5_K_M con llama.cpp u Ollama en una GPU de 24 GB, aprovechando los formatos GGUF para un despliegue sin dependencia de servicios en la nube.
- Experimentación con alineación y censura: investigadores que estudien el comportamiento de modelos no censurados frente a sus versiones alineadas pueden comparar este ajuste con el Qwen3.8-27B original manteniendo el mismo tokenizador y la misma arquitectura base.
- Prototipado de asistentes conversacionales sin filtros editoriales: para entornos de investigación donde se requiera explorar respuestas sobre temas que los modelos alineados suelen rechazar, siempre dentro de un marco legal y ético.
- Generación de texto creativo y ficción: la reducción de rechazos facilita la escritura de narrativa con temas sensibles, violencia o contenido adulto, un uso recurrente de los modelos de la familia "uncensored".
- Pruebas de estrés de seguridad y red-teaming: analizar qué tipo de contenido genera el modelo sin las capas de rechazo permite auditar riesgos antes de decidir si se despliega una versión alineada en producción.
- Evaluación comparativa de cuantizaciones: con doce niveles disponibles, es posible medir la degradación de calidad percibida entre Q2_K, Q4_K_M y Q8_0 sobre el mismo prompt set, útil para calibrar qué nivel conviene en cada GPU.
- Base para ajustes finos posteriores: al existir el modelo también en safetensors, se puede partir de los pesos completos para LoRA o fine-tuning adicional y usar las cuantizaciones GGUF para validación rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los resultados de búsqueda mencionan que Qwen3.8-27B (el modelo base de Qwen) se evalúa en MathVision con un prompt fijo ("Please reason step by step, and put your final answer within \boxed{}"), y que para el resto de modelos se reporta la puntuación más alta de dos variantes de prompt, pero no se proporciona ninguna cifra concreta ni resultados atribuibles a este ajuste no censurado.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir del número de parámetros y del tamaño de cada cuantización (no incluyen el KV cache, que crece con la longitud de contexto):

| Cuantización | VRAM estimada (solo pesos) | ¿Cabe en GPU de consumo? |
|---|---|---|
| f16 | ~54,6 GB | No |
| Q8_0 | ~29 GB | No en 24 GB; sí en A100 40 GB |
| Q6_K | ~22,5 GB | Ajustado en RTX 4090 / 3090 de 24 GB |
| Q5_K_M | ~19,5 GB | Sí, RTX 4090 / 3090 (24 GB) |
| Q5_K_S | ~18,8 GB | Sí, RTX 4090 / 3090 (24 GB) |
| Q4_K_M | ~16,6 GB | Sí, RTX 4090 / 3090; también RTX 4080 de 16 GB con contexto corto |
| Q4_K_S | ~15,7 GB | Sí, GPU de 16-24 GB |
| IQ4_XS | ~14,5 GB | Sí, GPU de 16 GB |
| Q3_K_L | ~13,3 GB | Sí, GPU de 16 GB |
| Q3_K_M | ~12,0 GB | Sí, GPU de 12-16 GB |
| Q3_K_S | ~11,6 GB | Sí, GPU de 12 GB |
| Q2_K | ~9,9 GB | Sí, GPU de 10-12 GB |

- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q5_K_M y Q6_K con contexto moderado; A100 40 GB o H100 para Q8_0 y f16; GPU de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 3060 12 GB) para Q3_K y Q2_K.
- Caben en GPU de consumo: sí, en las cuantizaciones de Q2_K a Q6_K, siempre ajustando el número de capas offloaded a la VRAM y el tamaño de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere uso con endpoints, aunque no se especifica el proveedor.
- Apple Silicon: los resultados de búsqueda sobre modelos similares de la misma familia mencionan mejoras del 30-50 % usando MLX frente a otras rutas en hardware de Apple, y recomiendan reducir el contexto (por ejemplo, a 4096 tokens) si se observa reparto CPU/GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF (este) | 27,3B | No disponible | No disponible | GGUF (12 cuantizaciones) | 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base oficial) | ~27B (no confirmado en la información disponible) | No disponible | No disponible en la información recogida | Safetensors y otros | Repositorio oficial de Qwen |
| mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF | No disponible | No disponible | No disponible | GGUF | Repositorio hermano del mismo autor |
| 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic (origen del ajuste) | No disponible | No disponible | No disponible | No disponible | Repositorio origen citado en la model card |

No se dispone de datos de rendimiento comparados entre estas variantes, por lo que la comparación se limita a formato, linaje y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita, el uso comercial queda en un limbo legal y no puede asumirse permiso de uso en producción.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, con publicación y actualización separadas por menos de media hora, lo que indica ausencia de revisión por parte de la comunidad.
- Modelo derivado de terceros: es una cuantización de un ajuste fino no oficial de Qwen3.8-27B, no un modelo publicado por Qwen; los datos de rendimiento del modelo base no son extrapolables.
- Riesgo elevado de alucinación y de contenido problemático: la naturaleza "uncensored" implica que se han reducido las capas de rechazo, lo que aumenta la probabilidad de respuestas dañinas, inexactas o legalmente comprometedoras.
- Falta de información sobre sesgos: no se documenta ni la composición del dataset de ajuste ni las evaluaciones de sesgo.
- Idiomas no declarados: no hay garantía de cobertura multilingüe más allá de lo que herede del modelo base, y no se especifica cuáles son.
- Contexto desconocido: al no declararse la longitud de contexto, el dimensionado del KV cache y de la memoria debe hacerse por prueba y error.
- Degradación en cuantizaciones bajas: Q2_K y Q3_K_S implican pérdidas notables de calidad en modelos de este tamaño; para uso serio conviene Q4_K_M o superior.
- Sin benchmarks publicados: no existe ninguna medición objetiva de calidad, velocidad o precisión para este repositorio concreto.
- Fecha de publicación futura respecto a la información habitual de referencia: conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF
- Modelo origen del ajuste fino: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub de ejecución local de la variante no censurada: https://github.com/Wassimyounes01/qwen38-uncensored
- Guía de cuantizaciones GGUF y llama.cpp para esta familia: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Cuantizaciones de la variante Heretic v3 del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-v3-i1-GGUF
