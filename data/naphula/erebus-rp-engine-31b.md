# Naphula/Erebus-RP-Engine-31B

## Resumen
Erebus-RP-Engine-31B es un modelo de lenguaje de tipo denso orientado a escritura creativa, roleplay y generación de narrativa, publicado por el usuario Naphula en Hugging Face. Se trata de un merge (fusión) construido con mergekit a partir de dos modelos derivados de Gemma 4 de 31B: DavidAU/gemma-4-31B-it-Grand-Horror-X-INTENSE-HERETIC-UNCENSORED-Thinking y MRockatansky/Gemma-4-31B-Storymaxxed3. El resultado es un modelo sin censura (uncensored) especializado en ficción de todos los géneros, con énfasis en terror, suspense, romance y ciencia ficción.

El modelo cuenta con 32.137.304.636 parámetros reales según los pesos en safetensors, lo que lo sitúa en la franja de 31B-32B. El repositorio ocupa 64,3 GB, lo que sugiere pesos en precisión completa (probablemente bf16/fp16) sin cuantizaciones publicadas. La licencia declarada es Apache 2.0, aunque al derivar de Gemma 4 conviene verificar las condiciones de la licencia base de Google.

Su relevancia actual radica en la demanda de modelos locales sin censura para escritura creativa y roleplay de calidad, donde los modelos alineados suelen rechazar contenido adulto, violento o de terror. Erebus-RP-Engine-31B se posiciona como una alternativa de gran tamaño para usuarios con hardware capaz de ejecutar modelos de 31B, aunque su ecosistema (descargas, adopción) es aún muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 4), merge con mergekit |
| Parametros totales | 32.137.304.636 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors; sin GGUF publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer denso basado en la familia Gemma 4 de Google, fusionado mediante mergekit a partir de dos checkpoints especializados en narrativa oscura y escritura de ficción. Los tags del repositorio mencionan "moe" y "moe_della", pero los parámetros totales y la naturaleza del merge (dos modelos base de 31B) apuntan a un modelo denso; la etiqueta MoE parece referirse a la técnica de fusión de expertos (mixture of experts merge) más que a una arquitectura MoE nativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en los modelos base.

La innovación principal es la propia técnica de merge: combinar un modelo orientado a terror y contenido explícito sin censura con otro orientado a narrativa ("Storymaxxed") para obtener un modelo versátil en ficción de múltiples géneros. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto narrativo y ficción en múltiples géneros: terror, suspense, romance, ciencia ficción y fantasía.
- Roleplay conversacional multi-turno con personajes y escenas.
- Continuación de escenas ("scene continue") y generación de tramas y subtramas.
- Escritura creativa vívida ("vivid writing", "vivid prosing") con prosa descriptiva.
- Contenido sin censura: admite lenguaje soez, violencia gráfica y contenido erótico explícito según la model card.
- Capacidad multimodal de entrada imagen-texto según el pipeline declarado (image-text-to-text), heredada de Gemma 4.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explícito (thinking) en este merge concreto, aunque uno de los modelos base lo incluye en su nombre.
- Capacidades multilingües limitadas al inglés según el campo de idiomas.

## Casos de uso
- Escritura de ficción de terror y suspense: el modelo puede generar relatos con atmósfera oscura y descripciones vívidas, aprovechando la fusión con el modelo Grand-Horror para producir prosa intensa sin rechazos por contenido gráfico.
- Roleplay de personajes en juegos de rol por texto: permite mantener conversaciones multi-turno con personajes consistentes, incluyendo tramas adultas o violentas que los modelos alineados suelen bloquear.
- Generación de tramas y subtramas para novelas: útil para autores que necesitan lluvia de ideas estructurada en géneros como romance o ciencia ficción, con continuaciones de escena coherentes.
- Prototipado de videojuegos narrativos: integrable como motor de diálogo para NPCs en juegos con contenido maduro, siempre que el hardware permita ejecutar un modelo de 31B.
- Creación de contenido para comunidades de fanfiction: generación y continuación de historias en universos existentes con estilos ajustados mediante system prompt.
- Investigación sobre alineación y censura: sirve como contrapunto a modelos alineados para estudiar el comportamiento de modelos sin censura en tareas creativas.
- Asistencia a guionistas para escenas de conflicto o violencia: el modelo puede redactar escenas explícitas que otros modelos rechazan, con control mediante prompt de sistema.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 64 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 70-80 GB.
- En cuantización de 8 bits: unos 32-35 GB de VRAM, viable en una A100 40GB o dos RTX 4090.
- En cuantización de 4 bits: unos 16-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090, aunque no hay GGUF publicados oficialmente y habría que generarlos.
- GPU recomendadas: A100 80GB, H100, o configuraciones multi-GPU con RTX 4090/3090 para cuantizaciones bajas.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para serving en fp16/bf16; llama.cpp u Ollama requerirían convertir los pesos a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Erebus-RP-Engine-31B | 32,1B | no disponible | apache-2.0 | Merge de ficción sin censura sobre Gemma 4 |
| DavidAU/gemma-4-31B-it-Grand-Horror-X-INTENSE-HERETIC-UNCENSORED-Thinking | ~31B | no disponible | no disponible | Terror y contenido sin censura, con thinking |
| MRockatansky/Gemma-4-31B-Storymaxxed3 | ~31B | no disponible | no disponible | Narrativa y storytelling |
| Gemma 4 31B IT (base de Google) | ~31B | no disponible | Gemma license | Modelo general alineado |

La comparativa se limita a los modelos de los que se dispone información en esta ficha; no se dispone de datos de benchmarks ni de contexto para una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias
- Contenido explícito: el modelo puede generar violencia gráfica y contenido erótico; requiere ajustar el system prompt y no es apto para aplicaciones orientadas a menores o entornos corporativos sin moderación.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres y detalles inconsistentes en narrativas largas.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar narrativas largas con seguridad.
- Licencia: aunque se declara Apache 2.0, al derivar de Gemma 4 conviene verificar la licencia base de Google y sus restricciones de uso comercial.
- Ecosistema incipiente: 0 descargas y 1 like en el momento de la consulta; sin cuantizaciones GGUF publicadas, lo que dificulta el despliegue en hardware de consumo.
- Sin benchmarks: no hay evaluación pública de calidad, por lo que el rendimiento real en tareas concretas es desconocido.
- Etiquetas contradictorias: los tags "moe" y "dense" coexisten, lo que genera ambigüedad sobre la arquitectura real.

## Enlaces
- Hugging Face: https://huggingface.co/Naphula/Erebus-RP-Engine-31B
- Modelo base 1: https://huggingface.co/DavidAU/gemma-4-31B-it-Grand-Horror-X-INTENSE-HERETIC-UNCENSORED-Thinking
- Modelo base 2: https://huggingface.co/MRockatansky/Gemma-4-31B-Storymaxxed3
- Paper referenciado (arxiv:2406.11617): https://arxiv.org/abs/2406.11617
- Paper referenciado (arxiv:2603.04972): https://arxiv.org/abs/2603.04972
