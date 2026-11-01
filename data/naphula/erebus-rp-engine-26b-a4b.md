# Naphula/Erebus-RP-Engine-26B-A4B

## Resumen

Erebus-RP-Engine-26B-A4B es un modelo de lenguaje de 26.000 millones de parámetros publicado por el usuario Naphula en HuggingFace, especializado en escritura creativa, narrativa de ficción y roleplay (RP). Se trata de un merge de modelos construido con mergekit y mergekit-exp sobre seis modelos base de la familia Gemma 4 de 26B con arquitectura MoE (26B-A4B), entre ellos Goetia-26B-A4B-v1.7, Gemory-26B-A4B-SOMPOA, Gemma-4-Vain-26B-A4B, Wicked-Stuff-26B-A4B-v3.0-Final, Dark-Craving-26B-A4B-v0.1 y Kitchoon-V3-26B-A4B. El objetivo declarado es ofrecer generación de prosa vívida, tramas y sub-tramas, continuaciones de escena y conversaciones de rol sin censura, abarcando géneros como terror, romance, suspense y ciencia ficción.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con la librería transformers, con un repositorio de 52 GB. Su pipeline declarado es image-text-to-text, lo que sugiere que hereda capacidades multimodales de la familia Gemma 4, aunque la model card no detalla el funcionamiento de esa modalidad. Está orientado exclusivamente al inglés y su uso previsto es la escritura creativa y el roleplay, no tareas de razonamiento técnico o código.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y un solo "like" en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de la model card. Resulta útil como ejemplo de la práctica de merges comunitarios sobre arquitecturas MoE de Gemma 4 para fines creativos, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basada en Gemma 4 (variante 26B-A4B), según tags `gemma4`, `moe`, `moe_della`; detalles de capas y atención no disponibles |
| Parametros totales | 25.999.063.326 (≈26B) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; existen modelos base en GGUF, pero no se especifican cuantizaciones propias) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Según los tags y los metadatos, se construyó con mergekit y mergekit-exp combinando seis modelos base de la familia Gemma 4 de 26B con arquitectura MoE: Naphula/Goetia-26B-A4B-v1.7, 26B-Suite/Gemory-26B-A4B-SOMPOA, Ozili/Gemma-4-Vain-26B-A4B-GGUF, ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final, ReadyArt/Dark-Craving-26B-A4B-v0.1 y SubMaroon/Kitchoon-V3-26B-A4B. El tag `moe_della` apunta a una técnica de merge específica para mezclar expertos en arquitecturas MoE, aunque la model card no documenta la receta exacta (pesos, método de fusión ni capas afectadas).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino adicional tras el merge. Los tags `unsloth` y `karcher` sugieren el uso de herramientas de la comunidad para el ajuste o la fusión, pero no se detalla su papel. Tampoco se documentan innovaciones técnicas propias como decodificación especulativa o atención lineal; las capacidades multimodales implícitas en el pipeline image-text-to-text se heredarían de los modelos base Gemma 4, sin confirmación explícita.

## Capacidades

- Generación de texto narrativo y creativo: prosa vívida, descripciones detalladas y estilo literario, según los tags `vivid prosing` y `vivid writing`.
- Escritura de ficción: relatos, novelas, guiones y continuaciones de escena (`scene continue`).
- Generación de tramas y sub-tramas (`plot generation`, `sub-plot generation`).
- Roleplay conversacional multi-turno, con soporte para personajes y escenarios persistentes.
- Cobertura de géneros: terror, romance, suspense, ciencia ficción y otros (`all genres`).
- Contenido sin censura: el autor advierte que puede producir narrativa violenta y erótica gráfica, con lenguaje soez (`swearing`, `uncensored`).
- Capacidad multimodal de entrada imagen-texto según el pipeline declarado, aunque no se detalla su alcance.
- Soporte de tool calling y function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a escritura, no a tareas agénticas.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Escritura asistida de ficción: el modelo puede generar capítulos completos, descripciones de escena y diálogos con un estilo literario marcado, adecuado para autores que necesitan borradores rápidos en géneros como terror o romance.
- Roleplay conversacional: sirve para construir personajes con personalidad consistente en chats multi-turno, gracias a su orientación explícita a RP y a la plantilla de chat de Gemma 4.
- Generación de tramas y sub-tramas: útil en fases de preproducción narrativa para brainstorming de arcos argumentales, giros y conflictos secundarios antes de escribir el texto final.
- Continuación de escenas: puede retomar un fragmento existente y prolongarlo manteniendo tono y voz, lo que encaja en flujos de escritura iterativa o en herramientas de autocompletado narrativo.
- Contenido para videojuegos y narrativa interactiva: generación de diálogos ramificados y descripciones de mundo para motores de aventuras conversacionales o juegos de rol de texto.
- Prototipado de guiones y campañas de rol de mesa: creación rápida de NPCs, trasfondos y respuestas dinámicas para partidas dirigidas por un máster asistido por IA.
- Exploración de escritura de género oscuro: el modelo está pensado para narrativa explícita y violenta, lo que lo hace adecuado para proyectos de terror o ficción adulta con advertencias de contenido claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26B parámetros totales y pesos safetensors en precisión de 16 bits, se requieren aproximadamente 52 GB solo para los pesos, más overhead de activaciones y caché KV; el repositorio ocupa 52 GB, coherente con esa cifra.
- Cuantización: no se documentan cuantizaciones propias; si se generan GGUF (por ejemplo Q4_K_M), la huella podría reducirse a unos 16-18 GB, pero es una estimación no confirmada por el autor.
- GPU recomendadas: para FP16, una A100 80 GB o H100 80 GB; en configuraciones multi-GPU, dos A100 40 GB o dos RTX 4090 de 24 GB con tensor parallelism podrían ser viables, aunque no está verificado.
- Cabe en GPU de consumo: en FP16 no cabe en una RTX 4090 de 24 GB; con cuantización agresiva podría intentarse, pero no hay datos publicados.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta variante concreta, aunque al ser un modelo Gemma 4 MoE podrían ser compatibles previa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Erebus-RP-Engine-26B-A4B | 26B (MoE, activos no disponibles) | no disponible | Apache 2.0 | Escritura creativa y RP sin censura | HuggingFace, safetensors |
| Naphula/Goetia-26B-A4B-v1.7 | 26B (MoE) | no disponible | no disponible en la información | Modelo base del merge, orientación similar | HuggingFace |
| ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final | 26B (MoE) | no disponible | no disponible en la información | Ficción y RP | HuggingFace |
| SubMaroon/Kitchoon-V3-26B-A4B | 26B (MoE) | no disponible | no disponible en la información | Escritura creativa | HuggingFace |

La comparativa se limita a los modelos base del propio merge, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Contenido sensible: el autor advierte explícitamente de que el modelo puede generar narrativa violenta y erótica gráfica; es necesario ajustar el system prompt y aplicar moderación en productos dirigidos al público general.
- Sesgos: no documentados, pero al derivar de modelos Gemma 4 y de merges comunitarios de ficción, es probable que herede sesgos de esos corpus; no hay evaluación publicada.
- Alucinación: riesgo inherente a los modelos generativos; en tareas factuales o de razonamiento técnico no hay garantías y el modelo no está orientado a ellas.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar usos con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos base del merge podrían tener condiciones adicionales que no se detallan; conviene verificar cada uno antes de producción.
- Madurez: cero descargas y un solo "like" en el momento de la consulta; sin benchmarks, sin documentación de la receta de merge y sin garantías de mantenimiento.
- Formato: solo safetensors; no hay GGUF oficial, lo que complica el despliegue en hardware de consumo sin conversión manual.
- Plantilla de chat: requiere la plantilla de Gemma 4; usar otra puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
- Modelo base Goetia-26B-A4B-v1.7: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- Modelo base Gemory-26B-A4B-SOMPOA: https://huggingface.co/26B-Suite/Gemory-26B-A4B-SOMPOA
- Modelo base Gemma-4-Vain-26B-A4B-GGUF: https://huggingface.co/Ozili/Gemma-4-Vain-26B-A4B-GGUF
- Modelo base Wicked-Stuff-26B-A4B-v3.0-Final: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final
- Modelo base Dark-Craving-26B-A4B-v0.1: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
- Modelo base Kitchoon-V3-26B-A4B: https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Paper referenciado en los tags (arXiv:2406.11617): https://arxiv.org/abs/2406.11617
- Paper referenciado en los tags (arXiv:2603.04972): https://arxiv.org/abs/2603.04972
