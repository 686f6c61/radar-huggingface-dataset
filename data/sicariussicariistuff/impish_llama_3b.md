# SicariusSicariiStuff/Impish_LLAMA_3B

## Resumen

Impish_LLAMA_3B es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-3B-Instruct desarrollado por el usuario SicariusSicariiStuff. Está orientado principalmente a role-play y tareas generales de generación de texto, con un nivel de censura declarado por el autor como "medio-bajo" (5,5 sobre 10 en su propia escala). El modelo se distribuye en formato safetensors con pesos FP16 y cuenta con 3.212.749.824 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños aptos para hardware de consumo.

El entrenamiento se realizó sobre aproximadamente 25 millones de tokens en tres fases: un fine-tune completo (FFT) inicial, seguido de un QLoRA profundo con rango R=512 y, finalmente, un QLoRA con R=128 para consolidar el comportamiento. Según el autor, el objetivo del proceso era reducir la tendencia del modelo base a producir "GPTismos" (frases y estilos característicos de asistentes entrenados con RLHF) y mejorar su adecuación a conversaciones de rol.

La relevancia de este modelo radica en su nicho: es un ajuste comunitario de bajo coste computacional para aplicaciones de role-play y generación creativa en inglés, con cuantizaciones GGUF publicadas (estáticas, iMatrix y High-Attention) que facilitan su despliegue en equipos locales. No obstante, la documentación técnica es escasa y no se han publicado resultados de benchmarks estandarizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B Instruct) |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama 3.2 3B Instruct, 128K tokens, según la documentación oficial de Meta) |
| Tipos de cuantización | FP16 (original); GGUF estáticas, iMatrix y High-Attention (repositorios separados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (FP16); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 3B Instruct de Meta: un transformer decoder-only denso con 3.212 millones de parámetros, atención con RoPE y las innovaciones propias de la familia Llama 3.2 (incluyendo la arquitectura de atención del modelo base, aunque la información proporcionada no detalla modificaciones estructurales). No se trata de un modelo MoE ni híbrido; es un transformer denso convencional.

El proceso de ajuste se estructuró en tres fases según la model card. La primera consistió en un fine-tune completo (FFT) sobre un dataset orientado a introducir nuevos comportamientos y reducir el estilo de asistente convencional. La segunda fase aplicó un QLoRA con rango R=512 sobre un dataset distinto para "desconfundir" al modelo y evitar el sobreajuste. La tercera fase empleó un QLoRA con rango R=128 sobre un tercer dataset para cohesionar el comportamiento final. El volumen total de entrenamiento fue de aproximadamente 25 millones de tokens. No se especifican la composición exacta de los datasets, el uso de RLHF/DPO ni detalles sobre la metodología de evaluación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con énfasis en role-play y narrativa creativa.
- Reducción declarada de "GPTismos": el autor afirma que el entrenamiento busca un estilo menos característico de asistentes RLHF.
- Tareas generales de generación de texto (resúmenes, redacción, diálogo), aunque sin garantías de rendimiento comparable al modelo base en tareas de razonamiento.
- Capacidades heredadas del modelo base Llama 3.2 3B Instruct (comprensión lectora, respuesta a instrucciones), si bien el ajuste puede haber degradado parcialmente algunas de ellas.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada; el modelo base lo soporta, pero el ajuste fino no lo menciona.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Role-play conversacional en local: el modelo está entrenado específicamente para este fin y puede ejecutarse en GPUs de consumo gracias a sus 3.2B parámetros y cuantizaciones GGUF, lo que permite mantener conversaciones de personaje con baja latencia en equipos con 8-12 GB de VRAM.
- Generación creativa de narrativa y ficción: su ajuste orientado a estilo y su menor tendencia a fórmulas de asistente lo hacen adecuado para escribir diálogos y escenas con un tono más natural y menos encorsetado.
- Prototipado rápido de chatbots de personaje: al ser un modelo pequeño con licencia Llama 3.2, se puede integrar en demos y pruebas de concepto sin grandes inversiones en infraestructura.
- Aplicaciones de entretenimiento en dispositivos de gama media: las cuantizaciones GGUF (incluida High-Attention) permiten desplegarlo con llama.cpp u Ollama en portátiles y equipos sin GPU dedicada.
- Investigación sobre ajuste fino eficiente: el proceso documentado en tres fases (FFT + QLoRA R=512 + QLoRA R=128) sirve como referencia metodológica para experimentos de ajuste con presupuesto limitado.
- Generación de texto en inglés para tareas generales de baja criticidad: redacción de borradores, lluvia de ideas o respuestas conversacionales donde no se requiera alta precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una puntuación UGI (Uncensored General Intelligence) representada en una imagen, pero no se proporcionan los valores numéricos en texto. Tampoco hay datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomiendan 8-10 GB para contexto moderado.
- Cuantizaciones GGUF: Q4_K_M en torno a 2 GB, Q5_K_M en torno a 2,3 GB, Q8_0 en torno a 3,4 GB (estimaciones habituales para 3.2B parámetros; los tamaños exactos dependen de la cuantización concreta publicada en los repositorios GGUF).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para FP16 con contexto largo; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más usando cuantización, y en FP16 en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para FP16 en servidor; transformers con PyTorch para integración directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Impish_LLAMA_3B | 3,21B | No disponible (base: 128K) | Llama 3.2 Community | Role-play, tareas generales | HuggingFace, GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community | Asistente general | HuggingFace, oficial |
| Qwen2.5-3B-Instruct | 3,09B | 32K (128K en variantes) | Apache 2.0 | Asistente general multilingüe | HuggingFace |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | Asistente general, razonamiento | HuggingFace |

La comparación se basa en características públicas de los modelos; no se dispone de datos de rendimiento comparativos para Impish_LLAMA_3B. Frente al modelo base, Impish sacrifica potencialmente algunas capacidades de asistente general a cambio de un estilo más adecuado para role-play. Frente a Qwen2.5-3B y Phi-3.5-mini, la licencia Llama 3.2 es más restrictiva que Apache 2.0 o MIT, y el soporte multilingüe es menor (solo inglés).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al derivar de Llama 3.2, hereda los sesgos del modelo base, y el ajuste con datasets no especificados puede introducir sesgos adicionales.
- Riesgo de alucinación: elevado en un modelo de 3B parámetros, especialmente en tareas factuales; el autor admite que "a veces se comporta como se espera de un 3B".
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto efectiva tras el ajuste no está documentada y podría diferir del modelo base.
- Restricciones de licencia: Llama 3.2 Community License impone condiciones de uso comercial (incluida la obligación de mostrar "Built with Llama" y restricciones para empresas con más de 700 millones de usuarios mensuales), además de políticas de uso aceptable.
- Caveats para producción: la documentación es muy escasa (sin benchmarks, sin detalles de datasets, sin evaluación de seguridad); el nivel de censura "medio-bajo" declarado por el autor implica que puede generar contenido no apto para todos los públicos; no se recomienda su uso en aplicaciones sensibles sin evaluación adicional.
- El modelo fue publicado en octubre de 2024 y actualizado en noviembre de 2026 según los metadatos; la model card menciona una actualización de julio de 2025, pero no hay garantía de mantenimiento continuo.

## Enlaces

- HuggingFace (modelo principal): https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- GGUF estáticas: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B_GGUF
- GGUF iMatrix: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B_iMatrix
- GGUF High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B_GGUF_HA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
