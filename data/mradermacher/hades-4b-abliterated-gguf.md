# mradermacher/Hades-4B-Abliterated-GGUF

## Resumen

Hades-4B-Abliterated-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo Pluto-AI-Labs/Hades-4B-Abliterated. Se trata, por tanto, de una conversión de pesos orientada al consumo en hardware de gama baja y a su uso con runtimes de inferencia local como llama.cpp u Ollama, no de un modelo entrenado desde cero. El nombre del modelo base indica un tamaño aproximado de 4 000 millones de parámetros, aunque la model card del repositorio de cuantización no documenta la arquitectura, el contexto ni el proceso de entrenamiento.

El sufijo "Abliterated" responde a la nomenclatura habitual de la comunidad para modelos a los que se ha aplicado una técnica de abliteration, es decir, la eliminación o atenuación de las direcciones de activación asociadas a rechazos de contenido durante el alineamiento. Esto sitúa al modelo en la categoría de los modelos "sin censura" orientados a generación sin restricciones, un nicho con demanda creciente para investigación sobre alineamiento, evaluación de seguridad y generación creativa sin filtros. Es importante señalar que esa interpretación se deduce del nombre del modelo y no está confirmada explícitamente en la información disponible.

El repositorio se publicó el 19 de septiembre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes. La model card se limita a la plantilla automática de mradermacher e indica únicamente la lista de cuantizaciones disponibles y el enlace al modelo base. No hay información sobre licencia, idiomas, arquitectura, dataset de entrenamiento ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parámetros totales | aproximadamente 4 000 millones (inferido del nombre del modelo; no confirmado) |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Autor de la cuantización | mradermacher |
| Modelo base | Pluto-AI-Labs/Hades-4B-Abliterated |
| Fecha de publicación | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base en los materiales proporcionados: ni el tipo de transformer, ni si emplea mezcla de expertos, atención lineal o arquitecturas híbridas, ni el número de capas, dimensiones ocultas o cabezas de atención. Tampoco se documenta la longitud de contexto nativa ni si se aplicaron técnicas de extensión de contexto.

Respecto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni los idiomas cubiertos. Lo único verificable es el proceso de conversión: mradermacher ha generado cuantizaciones estáticas con quantize_version 2 y output_tensor_quantised 1 a partir de pesos en formato Hugging Face (convert_type hf), cubriendo el espectro completo de 2 a 16 bits. La innovación técnica atribuible a este repositorio es la propia disponibilidad de cuantizaciones IQ4_XS y Q2_K, que permiten ejecutar un modelo de 4B en entornos con muy poca memoria.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Las siguientes afirmaciones son expectativas generales para un modelo de aproximadamente 4B parámetros y deben verificarse empíricamente:

- Generación de texto conversacional en formato chat, si el modelo base conserva una plantilla de chat compatible.
- Razonamiento básico y respuesta a instrucciones de complejidad media, condicionado por el tamaño del modelo.
- Generación de código de complejidad baja a media, sin garantía de soporte de tool calling.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento sin rechazos ante peticiones que otros modelos alineados filtrarían, según la convención del sufijo "Abliterated" (no confirmado en la documentación).

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las cuantizaciones Q2_K y Q3_K permiten cargar el modelo en CPU con alrededor de 2 GB de memoria, útil para prototipado offline y pruebas en portátiles.
- Investigación sobre alineamiento y seguridad: un modelo presumiblemente abliterado sirve como referencia para estudiar qué comportamientos se suprimen con las técnicas de alineamiento y cómo se degradan al eliminar direcciones de rechazo.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera contenido que los modelos alineados estándar rechazan, con la advertencia de revisión humana posterior.
- Asistente conversacional autoalojado: despliegue con Ollama o llama.cpp sobre una GPU de consumo para uso personal, donde la cuantización Q4_K_M ofrece el mejor equilibrio entre tamaño y calidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce niveles de cuantización, lo que permite medir la degradación de perplejidad y coherencia entre Q2_K y Q8_0 sobre el mismo modelo base.
- Experimentación en pipelines de generación sintética: uso del modelo en Q8_0 o x-f16 como generador de datos de bajo coste cuando no se dispone de presupuesto para modelos de mayor tamaño.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no está pensado para entrenamiento, las versiones f16 pueden reconvertirse a safetensors para aplicar LoRA con frameworks como PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad para ninguna de las cuantizaciones, y la información de búsqueda no aporta datos adicionales.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño de parámetros declarado en el nombre del modelo (aproximadamente 4B) y de los tamaños típicos de las cuantizaciones GGUF para ese rango. No proceden de mediciones publicadas por el autor:

| Cuantización | Tamaño aproximado del fichero | VRAM recomendada (con contexto moderado) |
|---|---|---|
| x-f16 | ~8,0-8,5 GB | 10 GB o más |
| Q8_0 | ~4,3-4,6 GB | 6-8 GB |
| Q6_K | ~3,4-3,6 GB | 5-6 GB |
| Q5_K_M | ~2,9-3,1 GB | 5 GB |
| Q4_K_M | ~2,5-2,7 GB | 4-5 GB |
| IQ4_XS | ~2,2-2,4 GB | 4 GB |
| Q3_K_M | ~2,0-2,2 GB | 3-4 GB |
| Q2_K | ~1,6-1,8 GB | 3 GB o CPU |

- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutar cualquier cuantización con margen amplio; tarjetas de 6-8 GB (RTX 3060 Ti, RTX 4060, GTX 1660 Super) cubren Q4_K_M y Q8_0 con contexto reducido.
- GPU de datacenter: A100, H100, L40S y L4 ejecutan el modelo sin dificultad, aunque están sobredimensionadas para un modelo de 4B; su uso tendría sentido solo para servir muchas réplicas concurrentes.
- Ejecución en CPU: viable con Q2_K y Q3_K_M usando llama.cpp; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, koboldcpp, text-generation-webui y Jan. vLLM incorpora soporte GGUF parcial y experimental; TGI no soporta GGUF de forma nativa. Para entrenamiento o fine-tuning no se recomienda GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se establece por categoría de tamaño (modelos de 3-4B parámetros), dado que se desconoce la arquitectura del modelo base de Hades-4B. Los datos de los modelos alternativos provienen de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hades-4B-Abliterated (GGUF) | ~4B (inferido) | no disponible | no disponible | GGUF en Hugging Face |
| Llama 3.2 3B Instruct | 3,21B | 128 000 tokens | Llama 3.2 Community License | Pesos originales y GGUF comunitarios |
| Qwen3 4B | 4,0B | 32 768 tokens (extensible a 131 072 con YaRN) | Apache 2.0 | Pesos originales y GGUF comunitarios |
| Gemma 3 4B | ~4B | 128 000 tokens | Gemma Terms of Use | Pesos originales y GGUF comunitarios |
| Phi-4-mini-instruct | 3,8B | 128 000 tokens | MIT | Pesos originales y GGUF comunitarios |

Diferencias relevantes: los tres modelos de referencia publican licencia explícita, contexto documentado y resultados de benchmarks, mientras que Hades-4B-Abliterated no ofrece ninguno de esos datos en la información disponible. Su ventaja diferencial, si se confirma el efecto de la abliteration, es el comportamiento sin rechazos, algo que ninguno de los modelos comparados ofrece por defecto. La ausencia de licencia declarada es un riesgo objetivo frente a alternativas con licencias permisivas como Qwen3 4B o Phi-4-mini.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Se recomienda contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Ausencia total de documentación técnica: sin arquitectura, contexto, idiomas ni dataset conocidos, no es posible evaluar su idoneidad para un caso de uso concreto sin pruebas empíricas.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad en razonamiento, código o matemáticas.
- Riesgo de contenido dañino: si el modelo ha sido sometido a abliteration, cabe esperar una reducción de los mecanismos de rechazo, con mayor probabilidad de generar contenido ofensivo, ilegal o peligroso. Requiere moderación externa en cualquier uso con usuarios finales.
- Alucinación: los modelos de 4B parámetros presentan tasas de alucinación elevadas en tareas de conocimiento factual, y las cuantizaciones agresivas (Q2_K, Q3_K_S) aumentan la degradación de coherencia.
- Degradación por cuantización: las versiones por debajo de Q4_K_M suelen mostrar pérdidas notables de calidad en modelos pequeños; Q2_K es apta principalmente para pruebas, no para producción.
- Idiomas: sin datos disponibles; es probable que el rendimiento fuera del inglés sea inferior y que el modelo no cubra adecuadamente el castellano, aunque no puede confirmarse.
- Contexto desconocido: la ventana efectiva podría ser corta, lo que limitaría casos de uso con documentos largos o conversaciones multi-turno extensas.
- Trazabilidad: el repositorio es una cuantización de terceros; los problemas de sesgo o calidad se originan en el modelo base Pluto-AI-Labs/Hades-4B-Abliterated, sobre el que tampoco hay documentación pública en la información disponible.
- Repositorio sin adopción: 0 descargas y 0 likes implican ausencia de validación comunitaria y de informes de errores.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Hades-4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Pluto-AI-Labs/Hades-4B-Abliterated
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue local simplificado): https://ollama.com
- Los resultados de búsqueda web proporcionados no contenían enlaces relevantes al modelo; consistían en páginas corporativas de Microsoft sin relación con esta ficha.
