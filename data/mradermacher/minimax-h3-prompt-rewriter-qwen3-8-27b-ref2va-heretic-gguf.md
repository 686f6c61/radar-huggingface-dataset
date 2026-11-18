# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF es la versión cuantizada en formato GGUF publicada por mradermacher del modelo funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic. Se trata de un ajuste fino especializado en la reescritura de prompts (prompt rewriting) con capacidades multimodales de visión e lenguaje, construido sobre una base de la familia Qwen (etiquetada en los tags como qwen3.5 y qwen3.8) con 27.320.697.856 parámetros totales según los pesos safetensors del repositorio. El origen de la cadena es lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, sobre el que funnygeeker aplicó una variante "heretic" (abliterated/decensored).

El modelo está pensado para tomar una instrucción o prompt de entrada y reescribirlo de forma más elaborada y estructurada, presumiblemente para alimentar sistemas de generación (el sufijo Ref2VA sugiere referencia a vídeo/audio). Incorpora un componente multimodal (archivos mmproj en GGUF) que le permite procesar imágenes junto con texto, y declara soporte para inglés y chino en los tags. La variante "heretic" implica que se ha reducido o eliminado el comportamiento de rechazo (refusal) del modelo base, lo que lo hace adecuado para entornos donde se necesita baja censura, pero con los riesgos asociados.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue local: los cuantizados GGUF estáticos (Q2_K a Q8_0, IQ4_XS) permiten ejecutar un modelo de 27B en hardware de consumo, algo inviable con los pesos completos en safetensors (28,2 GB de repositorio). La licencia Apache 2.0 facilita el uso comercial, aunque el carácter "abliterated" exige revisión de cumplimiento antes de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), etiquetada como qwen3.5/qwen3.8 en los tags; detalles exactos no disponibles |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | inglés (en) y chino (zh) según tags; la model card solo declara en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base); librería transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de las etiquetas del repositorio. Los tags indican una base de la familia Qwen (qwen3.5, qwen3.8) con capacidades multimodales (vision-language) y un componente etiquetado como "mtp" (posiblemente multi-token prediction). El modelo es un ajuste fino del checkpoint lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, especializado en reescritura de prompts, sobre el que se aplicó posteriormente una modificación "heretic" por parte de funnygeeker para reducir los rechazos.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similar. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización la realiza mradermacher con su pipeline habitual (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) y se indica que los cuantizados ponderados/imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Reescritura y expansión de prompts: tarea principal del modelo, orientada a transformar instrucciones breves en descripciones detalladas y estructuradas.
- Procesamiento multimodal visión-lenguaje: los archivos mmproj permiten incorporar imágenes como entrada junto al texto.
- Generación de texto conversacional: etiquetado como "conversational" en los tags.
- Soporte multilingüe limitado: inglés y chino según los tags del repositorio.
- Comportamiento "abliterated"/decensored: reducción de rechazos, lo que permite generar contenido que el modelo base rechazaría.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible (el sufijo Ref2VA no se documenta en la model card).

## Casos de uso

- Reescritura de prompts para pipelines de generación de imágenes o vídeo: el modelo toma una instrucción corta del usuario y la expande en un prompt detallado y estructurado, adecuado para alimentar modelos de difusión o de generación de vídeo (el sufijo Ref2VA apunta a este escenario).
- Preprocesado de instrucciones en asistentes conversacionales: normalizar y enriquecer las consultas de usuario antes de pasarlas a un modelo generador principal, mejorando la coherencia de las respuestas en sistemas multi-modelo.
- Descripción de imágenes para generación de prompts visuales: gracias al componente mmproj, puede analizar una imagen de referencia y producir un prompt textual que la describa, útil en flujos de image-to-prompt o reference-to-video.
- Despliegue local en estaciones de trabajo con GPU de consumo: los cuantizados Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs de 24 GB como la RTX 4090, sin depender de servicios en la nube.
- Investigación sobre alineación y censura: la variante "heretic" permite estudiar el comportamiento del modelo sin rechazos, comparándolo con el base para analizar diferencias en sesgos y seguridad.
- Prototipado rápido de herramientas de prompt engineering: con llama.cpp u Ollama se puede integrar el GGUF en utilidades de escritorio para reescribir prompts en tiempo real, dado el tamaño manejable de los cuantizados bajos (Q2_K, Q3_K).
- Generación de contenido en inglés y chino: para equipos que trabajan con ambos idiomas y necesitan reescritura de instrucciones sin censura en flujos creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q4_K_S ocupa 15,9 GB en disco y requiere aproximadamente 16-18 GB de VRAM para cargarse completamente en GPU; Q8_0 y f16 requieren del orden de 28-30 GB y 55 GB respectivamente (estimación basada en el tamaño de los pesos, no confirmada por el autor).
- Componente multimodal adicional: mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB) que se suma a los requisitos anteriores.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y cuantizados inferiores; A100 40/80 GB o H100 para Q8_0 y f16; configuraciones multi-GPU para los cuantizados mayores.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S (15,9 GB) y cuantizados menores (Q2_K, Q3_K) caben en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizados Q3 o Q2. Los cuantizados Q6_K, Q8_0 y f16 no caben en GPUs de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; el modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM/TGI (no confirmado en la información).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la información proporcionada. Como referencia estructural, se puede comparar con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizado estático, variante heretic |
| funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic | 27,3B (presumible) | no disponible | Apache 2.0 | safetensors | Modelo base directo, sin cuantizar |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | 27,3B (presumible) | no disponible | no disponible | safetensors | Modelo original antes del ajuste heretic |

No se dispone de información sobre benchmarks que permita comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Naturaleza "abliterated"/heretic: el modelo ha sido modificado para reducir rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, sesgado o dañino. No es recomendable para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas de fidelidad.
- Idiomas limitados: solo inglés y chino según los tags; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar casos de uso con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero el carácter decensored puede entrar en conflicto con políticas de plataformas o requisitos regulatorios; conviene revisar el cumplimiento antes de desplegar en producción.
- Cuantizados estáticos sin imatrix: el autor indica que los cuantizados ponderados/imatrix no estaban disponibles, por lo que la calidad de los cuantizados bajos (Q2_K, Q3_K) puede ser inferior a la de variantes con imatrix.
- Sin datos de benchmarks ni evaluación de sesgos: no hay evidencia publicada sobre su rendimiento real en tareas downstream.
- Modelo derivado de una cadena de ajustes no documentada: la trazabilidad del entrenamiento es limitada, lo que complica la auditoría.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Modelo base directo: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic
- Modelo original: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Página de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizados (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
