# OpenSakura/OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft

## Resumen

OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft es un modelo de traducción de novelas ligeras japonesas a chino simplificado, desarrollado por la comunidad OpenSakura, heredera del proyecto SakuraLLM. Se trata de un ajuste fino supervisado (SFT) sobre una base CPT de Qwen3.5 MoE, con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos según la convención de su nombre (35b-a3b). El modelo está especializado en el dominio ACGN y utiliza un formato de prompt con sistema de glosario y modo de razonamiento nativo de Qwen (thinking). Su relevancia radica en ofrecer una alternativa abierta y reproducible para la traducción de contenido literario japonés, con preservación de estilo, formato y terminología. El contexto de entrenamiento está limitado a 12.288 tokens, y los pesos se distribuyen en safetensors bfloat16 con un tamaño de 69.3 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5, transformer |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000.000.000 (según convención 35b-a3b; no confirmado en la documentación) |
| Longitud de contexto | 12.288 tokens (max_seq_length de entrenamiento; contexto nativo no documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja), chino simplificado (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Qwen3.5 (qwen3_5_moe), un transformer con mezcla de expertos. Según la información del autor, se trata de un checkpoint SFT exportado desde un entrenamiento con 8x FSDP1, con una longitud máxima de secuencia de 12.288 tokens. El entrenamiento utilizó una mezcla de dos datasets: Lilith (65%) con formato de razonamiento nativo Qwen (thinking) y Eve (35%) con formato de razonamiento vacío (empty thinking). Se supervisaron 3.730 millones de tokens, con un peso de pérdida de razonamiento de 0.35. La torre de visión fue eliminada, por lo que el modelo exportado es solo de texto. La pérdida de evaluación en hold-out fue 0.4496, con una perplejidad de 1.568. El formato de prompt incluye un mensaje de sistema en chino que especifica reglas de traducción (línea a línea, glosario, preservación de formato y estilo) y permite insertar entradas de glosario antes del texto fuente.

## Capacidades

- Traducción especializada de novelas ligeras japonesas a chino simplificado, con preservación del número de líneas y del formato original.
- Soporte de glosario de términos: permite especificar traducciones de términos concretos y su información asociada.
- Modo de razonamiento nativo de Qwen (thinking) para generar una cadena de razonamiento antes de la traducción final; también soporta formato de razonamiento vacío.
- Manejo de rubis/notas de lectura (furigana) y preservación de significados especiales o juegos de palabras.
- Conversión de puntuación japonesa a china (por ejemplo, 「」 a “”, 、 a ，).
- Adaptación a tonos, niveles de cortesía, violencia, ambigüedad y estilo literario del texto original.
- No se ha documentado soporte de tool calling ni agentes; el modelo está orientado a traducción.
- No es multimodal: la torre de visión fue eliminada, por lo que solo procesa texto.

## Casos de uso

- Traducción de novelas ligeras japonesas: el modelo puede convertir capítulos completos manteniendo el número de líneas y el estilo de cada personaje, ideal para traductores profesionales que trabajan con textos ACGN.
- Localización de videojuegos: gracias al soporte de glosario, se pueden fijar nombres de personajes, habilidades y términos técnicos para mantener coherencia en diálogos y menús.
- Traducción de web novels y fanfics: el modelo gestiona contextos largos de hasta 12.288 tokens, suficiente para capítulos extensos, y respeta el tono informal o coloquial.
- Traducción asistida por ordenador (CAT): el formato de prompt con glosario permite integrarlo en flujos de trabajo de traducción asistida, donde el traductor define términos antes de procesar el texto.
- Subtitulado de anime o contenido audiovisual: la preservación de formato y la conversión de puntuación facilitan la generación de subtítulos que respetan la estructura de los diálogos.
- Investigación en traducción automática literaria: el modelo puede usarse como referencia para estudiar la traducción de juegos de palabras, honoríficos y referencias culturales en el dominio ACGN.
- Generación de datasets de preferencia: al ser un artefacto SFT publicado, puede servir como punto de partida para entrenamientos posteriores de alineación o evaluación de calidad de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan 69.3 GB, por lo que la inferencia requiere al menos esa cantidad de VRAM, más memoria para activaciones y cache KV.
- Se recomiendan GPUs de 80 GB como A100 o H100, o un sistema multi-GPU con suficiente VRAM combinada (por ejemplo, 2x 48 GB o más) para ejecutar el modelo sin cuantización.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ), por lo que no es viable ejecutarlo en GPUs de consumo (RTX 4090 24 GB) sin cuantización propia.
- Opciones de despliegue: transformers, vLLM, TGI; también compatible con endpoints de Hugging Face (endpoints_compatible).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft | 34.66B | 12.288 tokens | no disponible | HuggingFace |
| OpenSakura-MODEL-260419-LN-ja-zh-PT-qwen36-35b-a3b-cpt (base CPT) | 34.66B | no disponible | no disponible | HuggingFace |
| OpenSakura-MODEL-260508-LN-ja-zh-SFT-qwen36-35b-a3b-sft-SHIT | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia de uso, lo que genera incertidumbre para aplicaciones comerciales.
- Dominio restringido: el modelo está entrenado principalmente para traducción ja-zh de novelas ligeras; su rendimiento en otros dominios o pares de idiomas no está garantizado.
- Contexto limitado: la longitud máxima de secuencia usada en entrenamiento es de 12.288 tokens, por lo que textos más largos requieren truncamiento o segmentación.
- Riesgo de alucinación en traducción: como todo modelo generativo, puede producir traducciones incorrectas, especialmente con términos ambiguos o referencias culturales.
- Sesgos del dominio ACGN: el entrenamiento con datos de novelas ligeras puede introducir sesgos de estilo, género y contenido que no son adecuados para textos técnicos o formales.
- Sin soporte multimodal: a pesar de la etiqueta image-text-to-text, la torre de visión fue eliminada; el modelo solo acepta texto.
- No se han publicado cuantizaciones ni pruebas de rendimiento, lo que dificulta evaluar su comportamiento en producción.

## Enlaces

- HuggingFace: https://huggingface.co/OpenSakura/OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft
- GitHub OpenSakura: https://github.com/OpenSakura/
- Modelo base CPT: https://huggingface.co/OpenSakura/OpenSakura-MODEL-260419-LN-ja-zh-PT-qwen36-35b-a3b-cpt
- Checkpoint anterior SHIT: https://huggingface.co/OpenSakura/OpenSakura-MODEL-260508-LN-ja-zh-SFT-qwen36-35b-a3b-sft-SHIT
