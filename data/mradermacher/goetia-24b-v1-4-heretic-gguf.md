# mradermacher/Goetia-24B-v1.4-heretic-GGUF

## Resumen

Goetia-24B-v1.4-heretic-GGUF es la versión cuantizada en formato GGUF del modelo base Yingyaeliae/Goetia-24B-v1.4-heretic, creada por mradermacher. El modelo base es un merge de modelos de la familia Mistral de 24B, etiquetado como "heretic" por haber sido sometido a técnicas de desalineación (uncensored, decensored, abliterated), lo que reduce los mecanismos de rechazo de contenido. Está orientado a escritura creativa, ficción, roleplay y generación de prosa vívida en inglés.

Con 23.572.444.160 parámetros totales, no se especifica la longitud de contexto en la información disponible. La cuantización ofrece 11 variantes, desde Q2_K hasta Q8_0, con un tamaño de repositorio de 161,4 GB. Su relevancia radica en proporcionar un modelo de 24B sin filtros para creadores y desarrolladores que necesitan narrativa de calidad sin restricciones de censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral según etiquetas; detalle no disponible) |
| Parametros totales | 23.572.444.160 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base se presenta como un merge creado con mergekit, y las etiquetas indican que se basa en la familia Mistral. No se ofrecen detalles sobre la arquitectura exacta (número de capas, cabezas, etc.) ni sobre el corpus de entrenamiento. El dataset OccultAI/illuminati_imatrix_v1 aparece en la model card como dataset asociado, pero su función es calcular la importance matrix para las cuantizaciones, no necesariamente el entrenamiento. Tampoco se mencionan procesos de RLHF o DPO; al contrario, las etiquetas "uncensored", "decensored" y "abliterated" sugieren que el modelo ha sido desalineado para eliminar o reducir respuestas de rechazo.

## Capacidades

- Generación de ficción narrativa: capaz de crear relatos, novelas, escenas y continuaciones de escenas (scene continue) en múltiples géneros (ciencia ficción, romance, terror, etc.).
- Escritura vívida (vivid prosing): orientado a producir prosa descriptiva y detallada, con atención al tono y la atmósfera.
- Roleplay y conversación: etiquetado como modelo conversacional y de roleplay, apto para mantener personajes y diálogos en juegos de rol por texto.
- Generación de tramas y subtramas: indicado para plot generation y sub-plot generation.
- Lenguaje sin filtros: al estar "uncensored" y "abliterated", puede generar contenido con lenguaje soez, contenido adulto o moralmente controvertido.
- Solo inglés: el modelo declara "en" como único idioma.
- No se documentan capacidades de visión, audio, tool calling, agentes o razonamiento formal en la información disponible.

## Casos de uso

- Escritura de ficción en la nube: el modelo puede integrarse en una aplicación de asistente de escritura para generar capítulos, descripciones y diálogos; su entrenamiento en "vivid prosing" produce una prosa detallada y atmosférica.
- Roleplay por texto en servidores de Discord o chatbots: al ser conversacional y tolerante con lenguaje explícito, puede mantener personajes y escenas largas sin recurrir a rechazos de contenido.
- Generación de tramas y subtramas para novelas: se puede usar como motor de brainstorming, pidiendo al modelo que proponga estructuras narrativas, giros y conflictos en géneros como ciencia ficción, terror o romance.
- Continuación de escenas en herramientas de escritura asistida: el modelo puede tomar un texto existente y continuar la escena manteniendo estilo, tono y perspectiva, lo que facilita superar bloqueos.
- Creación de diálogos para videojuegos narrativos: en la escritura de NPCs o ramas de conversación, su capacidad de generar diálogos naturales y sin filtros permite explorar personajes complejos.
- Prototipado de contenido editorial: para equipos de marketing narrativo o editoriales, sirve para generar rápidamente ideas, descripciones de personajes y sinopsis antes de la redacción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son orientativas y no incluyen caché KV ni overhead del runtime.

| Cuantizacion | Tamaño del archivo | VRAM estimada |
|---|---|---|
| Q2_K | 9,0 GB | ~11 GB |
| Q3_K_S | 10,5 GB | ~12 GB |
| Q3_K_M | 11,6 GB | ~13 GB |
| Q3_K_L | 12,5 GB | ~14 GB |
| IQ4_XS | 13,0 GB | ~15 GB |
| Q4_K_S | 13,6 GB | ~15-16 GB |
| Q4_K_M | 14,4 GB | ~16-17 GB |
| Q5_K_S | 16,4 GB | ~18 GB |
| Q5_K_M | 16,9 GB | ~19 GB |
| Q6_K | 19,4 GB | ~21-22 GB |
| Q8_0 | 25,2 GB | ~27 GB |

- GPU recomendadas: para Q4_K_S y Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para Q6_K, también cabe en una RTX 4090; Q8_0 requiere una A100 40GB o superior.
- En consumer GPU: sí, las cuantizaciones hasta Q6_K caben en tarjetas de 24 GB; Q8_0 no cabe.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCPP (todos compatibles con GGUF). También puede usarse vLLM o TGI si se convierten los pesos a safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de alternativas comparables en la información proporcionada. En su lugar, se listan las variantes del mismo modelo disponibles en HuggingFace.

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Goetia-24B-v1.4-heretic-GGUF | 23,57B | No disponible | Q2_K a Q8_0 | Apache 2.0 | Este repositorio |
| Goetia-24B-v1.4-heretic | 23,57B | No disponible | safetensors | Apache 2.0 | Modelo base original |
| Goetia-24B-v1.4-i1-GGUF | 23,57B | No disponible | Con imatrix | Apache 2.0 | Variante con cuantizaciones ponderadas por imatrix |

## Limitaciones y advertencias

- Contenido sin censura: al ser "uncensored", "decensored" y "abliterated", puede generar contenido ofensivo, explícito o dañino; debe usarse con moderación y control en entornos de producción.
- Alucinación: como cualquier modelo generativo, puede producir información o argumentos inventados; no se dispone de datos de evaluación.
- Idioma: solo soporta inglés; no se ha verificado su rendimiento en otros idiomas.
- Contexto y capacidades: no se especifica la longitud de contexto ni soporte de tool calling, agentes o multimodalidad; esto limita su uso en aplicaciones técnicas complejas.
- Cuantización: las versiones GGUF con menor bitrate (Q2_K, Q3_K_M) degradan la calidad; se recomiendan Q4_K_M o superiores para tareas de escritura.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede requerir revisión legal según la jurisdicción.
- Sin benchmarks: no hay resultados publicados, por lo que el rendimiento relativo es desconocido.

## Enlaces

- https://huggingface.co/mradermacher/Goetia-24B-v1.4-heretic-GGUF
- https://huggingface.co/Yingyaeliae/Goetia-24B-v1.4-heretic
- https://huggingface.co/mradermacher/Goetia-24B-v1.4-i1-GGUF
- https://huggingface.co/mradermacher/model_requests
