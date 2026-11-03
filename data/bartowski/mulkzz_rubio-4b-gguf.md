# bartowski/mulkzz_RuBio-4B-GGUF

## Resumen

RuBio-4B es un modelo multimodal de tipo imagen-texto desarrollado por el usuario mulkzz y quantizado a formato GGUF por bartowski. El checkpoint base cuenta con aproximadamente 4.326 millones de parámetros (4,3 B) según los pesos en safetensors, aunque la model card del quantizador indica 5B para el checkpoint de origen. Está etiquetado en el ámbito educativo y de biología, con soporte declarado únicamente para coreano (ko), y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que se trata de una quantización GGUF lista para ejecutarse con llama.cpp, lo que permite desplegar un modelo de visión-lenguaje de ~4B en hardware de consumo. El repositorio incluye un conjunto amplio de quantizaciones (desde bf16 de 8,67 GB hasta IQ3_M de 2,33 GB), además de un fichero `mmproj` para el procesamiento de imágenes, y emplea quantización con matriz de importancia (imatrix) para preservar calidad en los niveles bajos.

Conviene señalar de entrada que la información pública disponible es escasa: no se detallan la longitud de contexto, el dataset de entrenamiento, los resultados de benchmarks ni la composición exacta de la arquitectura más allá de su naturaleza multimodal. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto); detalles internos no disponibles |
| Parámetros totales | 4.326.350.848 (~4,3 B); la model card indica 5B para el checkpoint de origen |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L (lista parcial) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantizaciones llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que acepta entradas de texto e imagen, tal como refleja el pipeline `image-text-to-text` y la presencia de un fichero `mmproj` para el codificador visual. La model card no especifica el número de capas, la dimensión oculta, el mecanismo de atención ni el codificador de visión empleado. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset, uso de RLHF o DPO, ni técnicas de alineación.

La innovación técnica destacable en esta distribución es la quantización con imatrix mediante llama.cpp (release b12074), que ajusta la precisión de los pesos según su importancia para reducir la degradación en niveles bajos. El prompt format emplea tokens de chat estilo ChatML (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` al inicio de la respuesta del asistente, lo que sugiere un modo de razonamiento previo a la contestación. No se emplea decodificación especulativa.

## Capacidades

- Generación de texto conversacional con formato de chat ChatML.
- Procesamiento de imágenes en combinación con texto (requiere el fichero `mmproj`).
- Modo de razonamiento previo mediante el bloque `<think>`.
- Soporte de tool calling / function calling con un formato XML específico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidad multilingüe limitada al coreano según los metadatos del modelo.
- Especialización declarada en educación y biología (tags del repositorio).
- Compatible con endpoints y con vLLM según los tags del repositorio.

## Casos de uso

- Tutoría de biología en coreano: el modelo puede responder preguntas conceptuales y explicar diagramas o figuras aportadas como imagen, aprovechando su naturaleza multimodal y su etiquetado educativo.
- Análisis de láminas e ilustraciones científicas: dado un esquema anatómico o botánico, el modelo puede describir sus componentes y relacionarlos con texto explicativo, siempre que se cargue el fichero `mmproj`.
- Asistente conversacional especializado en coreano: integrable en interfaces de chat multi-turno mediante el formato ChatML documentado, con razonamiento previo en el bloque `<think>`.
- Automatización con function calling: el formato XML de tool calling permite conectar el modelo a APIs externas (por ejemplo, consulta de datos) en flujos de agente simples.
- Despliegue en local para prototipado: las quantizaciones Q4_K_M (2,80 GB) e IQ4_XS (2,50 GB) permiten ejecutar el modelo en equipos con GPU modesta o incluso CPU, útil para pruebas de concepto educativas.
- Generación de material didáctico: redacción de explicaciones y preguntas de repaso a partir de texto o imágenes de apoyo en contextos de formación en biología.
- Investigación sobre modelos pequeños multimodales: su tamaño compacto y su licencia Apache 2.0 lo hacen adecuado como objeto de estudio en experimentos de quantización y evaluación de capacidades visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5–3,5 GB con quantizaciones Q4 (Q4_K_M: 2,80 GB; IQ4_XS: 2,50 GB), hasta 8,67 GB con bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para quantizaciones Q4; RTX 3060/4060 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 4–8 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660) usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (versión b12074 o superior), Ollama, y vLLM según los tags del repositorio; requiere el fichero `mmproj` para entrada de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-4B (esta ficha) | ~4,3 B | No disponible | Sí (imagen-texto) | Apache 2.0 | GGUF en HuggingFace |
| Alternativas de ~4B multimodal | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo está declarado únicamente para coreano; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Alucinación: sin datos de evaluación ni de alineación, el riesgo de respuestas incorrectas o inventadas es desconocido y debe asumirse alto en dominios especializados.
- Sesgos: no se documenta ningún análisis de sesgos; al estar entrenado presumiblemente con datos en coreano, puede reflejar sesgos culturales y lingüísticos de esa procedencia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (mulkzz/RuBio-4B) y de los datos de entrenamiento, no documentadas.
- Producción: la ausencia de benchmarks y de documentación sobre el entrenamiento desaconseja su uso en entornos críticos sin una evaluación propia previa.
- Multimodalidad: la entrada de imagen requiere el fichero `mmproj`; sin él, el modelo funciona solo con texto.
- Repositorio: el tamaño total del repo (68 GB) incluye todas las quantizaciones; conviene descargar únicamente el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/mulkzz_RuBio-4B-GGUF
- Modelo base: https://huggingface.co/mulkzz/RuBio-4B
- Quantización Q4_K_M: https://huggingface.co/bartowski/mulkzz_RuBio-4B-GGUF/blob/main/mulkzz_RuBio-4B-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b12074: https://github.com/ggml-org/llama.cpp/releases/tag/b12074
