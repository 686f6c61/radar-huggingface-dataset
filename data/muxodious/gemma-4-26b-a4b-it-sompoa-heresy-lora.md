# MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA

## Resumen

MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA es un adaptador LoRA extraído mediante la técnica de ablación de rechazo (abliteration) aplicada sobre el modelo base google/gemma-4-26B-A4B-it, la variante instruida del Gemma 4 26B A4B de Google DeepMind. El objetivo declarado es eliminar la mayoría de los rechazos del modelo original, produciendo una versión "decensored" que responde a un mayor espectro de solicitudes, incluido contenido que el modelo base se negaría a generar. El adaptador fue creado con la herramienta Heretic v1.4.0 y se distribuye como un conjunto de pesos LoRA que deben combinarse con el modelo base.

El modelo base es un transformer multimodal con arquitectura Mixture-of-Experts (MoE) de 26 000 millones de parámetros totales, de los cuales se activan aproximadamente 4 000 millones por token. Soporta entrada de texto e imagen, contexto de hasta 256 000 tokens y más de 140 idiomas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Este adaptador en concreto tiene cero descargas y cero likes en Hugging Face, lo que sugiere que es un proyecto reciente o de baja adopción.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" a un modelo abierto de gran capacidad, manteniendo las capacidades técnicas del Gemma 4 26B A4B pero reduciendo drásticamente los rechazos. Sin embargo, hay que tener en cuenta que la abliteración no elimina los sesgos subyacentes ni garantiza la calidad de las respuestas, y puede producir contenido inapropiado o dañino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE con atención híbrida (sliding window + global) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 26B totales) |
| Parametros activos | No disponible (el modelo base activa 4B por token) |
| Longitud de contexto | 256 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponibles para el LoRA; el modelo base admite cuantización estándar (4-bit, 8-bit) |
| Idiomas soportados | Más de 140 (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye mediante abliteración, una técnica que identifica direcciones en el espacio de activaciones del modelo asociadas a la negativa a responder y las elimina o atenúa. En este caso se usó Heretic v1.4.0 sobre el modelo google/gemma-4-26B-A4B-it. Los parámetros de abliteración incluidos en la model card muestran ajustes en las proyecciones de salida de atención (attn.o_proj) y en las proyecciones descendentes del MLP (mlp.down_proj), con valores máximos y mínimos de pesos en distintas capas. No se proporciona información sobre el dataset de entrenamiento del LoRA ni sobre el proceso de ajuste fino adicional.

El modelo base Gemma 4 26B A4B emplea una arquitectura MoE con atención híbrida: capas con atención de ventana deslizante (sliding window de 1024 tokens) intercaladas con capas de atención global, siendo la última siempre global. Además, las capas globales comparten claves y valores (unified KV) y aplican RoPE proporcional (p-RoPE) para optimizar el uso de memoria en contextos largos. El modelo base fue entrenado con un enfoque multimodal (texto e imagen) y soporta razonamiento con modos de pensamiento configurables, así como function calling nativo.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Gemma 4 26B A4B, incluyendo razonamiento multi-paso y modos de pensamiento configurables.
- Comprensión multimodal: el modelo base acepta entrada de texto e imagen (con soporte de vídeo y audio en variantes menores, aunque no se confirma para esta talla).
- Soporte de tool calling / function calling: nativo en el modelo base, por lo que el adaptador lo conserva.
- Capacidades agénticas: el modelo base está diseñado para agentes autónomos con multi-step reasoning.
- Multilingüismo: más de 140 idiomas soportados.
- Reducción de rechazos: el objetivo principal del LoRA es disminuir la tasa de negativas. Según la model card, el modelo original rechazaba 103 de 104 solicitudes de prueba, mientras que el adaptador solo rechaza 4 de 104.
- No se dispone de información sobre capacidades especiales adicionales (audio, vídeo) para esta variante concreta.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, poesía o diálogos con temáticas que el modelo base rechazaría, útil para autores que exploran géneros oscuros o controvertidos.
- Roleplay y juegos de texto: permite mantener conversaciones inmersivas con personajes sin que el modelo se niegue a responder según la dirección del hilo.
- Generación de contenido para investigación sociológica: estudiar cómo responde un modelo sin filtros a temas tabú puede servir para analizar sesgos y comportamientos lingüísticos.
- Asistencia en guionización y narrativa: ayuda a redactar escenas con violencia, sexualidad o lenguaje explícito cuando el proyecto lo requiere, evitando interrupciones por rechazo.
- Desarrollo de agentes conversacionales para entornos controlados: en aplicaciones donde se necesita explorar todos los ángulos de una conversación (p. ej., simulaciones de entrevistas), el modelo puede mantener el hilo sin cortes.
- Fine-tuning posterior: al ser un LoRA, puede combinarse con otros adaptadores o ajustarse para tareas específicas que requieran baja tasa de rechazo, como generación de datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador. La única métrica disponible es la comparativa de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Modelo original (google/gemma-4-26B-A4B-it) |
|---|---|---|
| Divergencia KL | 0.1240 | 0 (por definición) |
| Rechazos (sobre 104 solicitudes) | 4/104 | 103/104 |

Estos datos indican que el adaptador mantiene una distribución de salidas cercana al original (KL baja) pero reduce drásticamente los rechazos. No se dispone de mediciones de calidad de generación, coherencia o exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base requiere aproximadamente 52 GB en fp16 (26B parámetros). Con cuantización a 8 bits, ~26 GB; a 4 bits, ~14 GB. El adaptador LoRA añade una sobrecarga mínima (típicamente <1 GB).
- GPU recomendadas: para fp16 se necesitan GPUs profesionales como A100 80GB o H100. Con cuantización 8-bit, una RTX 4090 (24 GB) o A6000 (48 GB) es suficiente. Con 4-bit, una RTX 3090 o 4080 (16-24 GB) puede bastar.
- Si cabe en consumer GPU: sí, con cuantización 4-bit en GPUs de 16 GB o más (RTX 4080, 4090). Para contextos largos (256K), la memoria se incrementa notablemente; se recomienda usar ventanas menores.
- Opciones de despliegue: transformers (con PEFT para cargar el LoRA), vLLM (con soporte de LoRA), llama.cpp (si se fusiona el adaptador en un GGUF), Ollama (requiere fusión previa), TGI.
- Latencia y throughput: no disponibles. Al ser un MoE con 4B activos, la velocidad de inferencia es similar a un modelo denso de ~4B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (original) | 26B totales, 4B activos | 256K | 103/104 | Apache 2.0 | Hugging Face |
| MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA (este) | LoRA sobre el anterior | 256K | 4/104 | Apache 2.0 | Hugging Face |
| Otros modelos abliterados (p. ej., basados en Llama 3) | Variable | Variable | Variable | Variable | Variable |

No se dispone de datos de rendimiento comparativo en tareas estándar. La comparativa se limita a la tasa de rechazo, que es el objetivo principal del adaptador.

## Limitaciones y advertencias

- Sesgos conocidos: la abliteración no elimina los sesgos del modelo base; puede amplificarlos al no rechazar contenido discriminatorio u ofensivo.
- Riesgo de alucinación: al reducir los rechazos, el modelo puede generar afirmaciones falsas o inventadas con mayor frecuencia, especialmente en temas controvertidos.
- Contenido inapropiado: el modelo puede producir texto sexual, violento, ilegal o dañino sin filtros. No es adecuado para aplicaciones orientadas al público general sin moderación posterior.
- Limitaciones de contexto: aunque el contexto teórico es de 256K, el uso prolongado de ventanas largas puede degradar la calidad y aumentar la memoria necesaria.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado. Google no respalda este adaptador.
- Advertencia para producción: al tener cero descargas y cero likes, no hay evidencia de pruebas en entornos reales. Se recomienda validar exhaustivamente antes de cualquier despliegue.
- El adaptador no incluye el modelo base; es necesario descargarlo por separado y fusionarlo o cargarlo con PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA
- Modelo base (google/gemma-4-26B-A4B-it): https://huggingface.co/google/gemma-4-26B-A4B-it
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Proyecto Heretic: https://heretic-project.org
