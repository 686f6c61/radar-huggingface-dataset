# mradermacher/spellspeak-glyph-2b-i1-GGUF

## Resumen

spellspeak-glyph-2b-i1-GGUF es la version cuantizada en formato GGUF del modelo jptaylor/spellspeak-glyph-2b, un modelo de lenguaje orientado a dialogos de personajes no jugadores (NPC), roleplay y agentes conversacionales para videojuegos. La cuantizacion la realiza mradermacher, un colaborador habitual de la comunidad que publica versiones optimizadas de modelos abiertos para su uso con llama.cpp. El modelo base emplea una arquitectura derivada de la familia Gemma (etiquetada como gemma4 en los metadatos) y esta disenado especificamente para mantener conversaciones coherentes y con personalidad en entornos interactivos.

El dato de parametros totales reportado en safetensors es de 4.628.569.635, es decir, aproximadamente 4,6 mil millones de parametros, aunque el nombre comercial del modelo lo etiqueta como "2b". Esta discrepancia sugiere que el identificador "2b" puede referirse al modelo base original sobre el que se hizo fine-tuning o a una convencion de nombres, mientras que el checkpoint publicado contiene mas pesos de los que sugiere la etiqueta. El repositorio ocupa 73,3 GB e incluye un amplio abanico de cuantizaciones, desde IQ1_S (2,4 GB) hasta Q6_K (3,9 GB), lo que permite desplegarlo en hardware muy diverso.

La relevancia de esta ficha radica en que combina un modelo especializado en dialogo de personajes con el ecosistema GGUF, lo que facilita su integracion en motores de juego, prototipos de agentes conversacionales y pipelines locales sin depender de APIs en la nube. La licencia Apache 2.0 permite uso comercial, un factor decisivo para estudios y equipos de desarrollo que quieran incorporar IA conversacional en productos de entretenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma (etiqueta "gemma4" en metadatos); detalles exactos no disponibles |
| Parametros totales | 4.628.569.635 (segun safetensors); el nombre comercial indica "2b" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1/imatrix) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "gemma4" en los metadatos y la referencia a la familia Gemma. Se trata, por tanto, de un transformer decoder-only con atencion por capas, pero no se especifican numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos adicionales (atencion lineal, decodificacion especulativa, etc.). El modelo base jptaylor/spellspeak-glyph-2b esta orientado a dialogue y roleplay, lo que sugiere un fine-tuning sobre un modelo preentrenado de la familia Gemma con datos de conversaciones de personajes, aunque no se publican detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion i1 de mradermacher emplea ficheros imatrix (importance matrix) para calcular pesos de importancia por tensor y mejorar la calidad de las cuantizaciones de baja precision. El repositorio incluye el propio fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Las cuantizaciones estaticas equivalentes estan disponibles en un repositorio separado (spellspeak-glyph-2b-GGUF). No se han publicado innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional orientada a dialogos de personajes (NPC) y roleplay.
- Mantenimiento de personalidad y coherencia en conversaciones multi-turno, segun los tags del modelo (npc, dialogue, games, roleplay).
- Soporte para agentes de voz (voice-agents) y IA conversacional, segun los metadatos.
- Capacidad multilingue limitada: la model card solo declara ingles.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- El modelo base se etiqueta como vision model en la model card del cuantizador, pero los ficheros mmproj (si existen) estarian en el repositorio estatico, no en este.

## Casos de uso

- NPCs en videojuegos: el modelo puede gestionar dialogos ramificados y mantener la personalidad del personaje a lo largo de una conversacion, integrandose en el motor del juego mediante llama.cpp para inferencia local sin latencia de red.
- Prototipado de agentes conversacionales: permite construir rapidamente demos de asistentes con personalidad usando las cuantizaciones Q4_K_M o Q5_K_M, que ofrecen un equilibrio razonable entre calidad y tamano (3,5-3,7 GB).
- Roleplay y entretenimiento interactivo: adecuado para aplicaciones de ficcion interactiva o chatbots de personajes donde se requiere coherencia narrativa y estilo consistente.
- Agentes de voz: al estar etiquetado para voice-agents, puede combinarse con pipelines de texto a voz para asistentes hablados con personalidad definida.
- Despliegue en hardware de consumo: las cuantizaciones IQ2 e IQ3 (2,5-3,4 GB) permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM o en CPU, facilitando pruebas en portatiles y estaciones de trabajo modestas.
- Investigacion sobre dialogo de personajes: util como base para experimentos de fine-tuning adicional o evaluacion de tecnicas de cuantizacion en tareas conversacionales especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,5 GB (IQ2_XXS) y 4,5 GB (Q6_K) aproximadamente, segun el tamano del fichero GGUF y el overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput; cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones IQ3 o Q4.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas; las cuantizaciones IQ2 permiten incluso GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python); el formato es compatible con endpoints compatibles segun los tags.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| spellspeak-glyph-2b-i1-GGUF | ~4,6 B (etiqueta 2b) | no disponible | Apache 2.0 | GGUF | Especializado en NPC y roleplay |
| Modelos Gemma base (familia) | 2B / 7B | no disponible | Gemma license | safetensors, GGUF | Uso general, no especializado en dialogo |
| Alternativas de roleplay GGUF | no disponible | no disponible | variable | GGUF | No se dispone de datos comparativos en la informacion |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada; la comparativa se limita a la familia Gemma como referencia arquitectonica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un fine-tuning sobre Gemma, puede heredar sesgos del modelo base.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; en roleplay puede ser menos problematico, pero en usos informativos requiere validacion.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base jptaylor/spellspeak-glyph-2b y de la familia Gemma subyacente.
- Caveat de produccion: la discrepancia entre el nombre "2b" y los 4,6 B parametros reales puede afectar a la planificacion de recursos; verificar el checkpoint antes de desplegar.
- Las cuantizaciones IQ1 e IQ2 de baja precision degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/spellspeak-glyph-2b-i1-GGUF
- Modelo base: https://huggingface.co/jptaylor/spellspeak-glyph-2b
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/spellspeak-glyph-2b-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#spellspeak-glyph-2b-i1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
