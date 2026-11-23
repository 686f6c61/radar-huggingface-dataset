# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-nav001

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-nav001 es un ajuste fino por LoRA del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 para el trabajo final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa. El modelo no es un generador de respuestas: es un módulo especializado de navegación de recuperación (retrieval navigation) que, dada una pregunta en japonés y los tres documentos recuperados en una primera pasada, emite el nombre de un único artículo de Wikipedia que conviene consultar a continuación. Su salida se emplea exclusivamente para seleccionar qué fragmentos del corpus distribuido se incorporan al contexto de un modelo generador distinto.

El modelo conserva exactamente la arquitectura, configuración, tokenizador y plantilla de chat de Qwen3.5-0.8B, con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y pesos en formato safetensors. La adaptación LoRA se fusionó en los pesos originales, por lo que no hay sobrecoste de inferencia respecto al modelo base. Está entrenado únicamente en japonés y su licencia es Apache 2.0.

Su relevancia es acotada pero concreta: demuestra un patrón de diseño de RAG multi-salto donde un modelo pequeño y barato se especializa en una subtarea estrecha (decidir el siguiente salto de recuperación) en lugar de encargarse de la generación final. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó el 23 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen3.5-0.8B); detalles internos de atención no disponibles en la información proporcionada |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de aproximadamente 0,87 mil millones de parámetros. Sobre él se aplicó un adaptador LoRA con r=16, alpha=32 y dropout=0,05, inyectado en las capas lineales del modelo de lenguaje: down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj y v_proj. El entrenamiento duró 2 épocas y, tras él, el delta LoRA se sumó a los pesos originales y se escribió de vuelta en los ficheros del modelo base, de modo que la estructura, config, tokenizador, plantilla de chat y nombres, formas y tipos de los tensores coinciden con los del modelo original.

La tarea de entrenamiento es de siguiente-salto de recuperación: la entrada combina la pregunta y los tres documentos recuperados por el reranker de la pregunta original, y la salida es únicamente el nombre del siguiente artículo a consultar. Se usaron 1.585 ejemplos construidos a partir de tres fuentes: JEMHopQA (train, ver1.2; se usan pregunta y derivations, filtrando preguntas cuyo siguiente artículo ya aparece en los tres documentos o cuyos sujetos ya figuran en la pregunta), auto-wiki-qa (revisión `672dd0d496352282b4064e944a16e00315b796a8`; 1.710 preguntas generadas combinando dos preguntas encadenadas por reglas de cadena de texto) y los fragmentos de Wikipedia japonesa del corpus del concurso `bumbuboon/llm-course-final-2026`, usados como material de recuperación sin modificar. Toda la construcción de datos y el entrenamiento se realizaron en Google Colab, sin APIs externas ni otros LLM. No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de texto muy restringida a una tarea: producir el nombre de un artículo de Wikipedia en japonés como siguiente paso de recuperación.
- Navegación de recuperación multi-salto: dado un contexto de tres documentos y una pregunta, identifica una entidad o artículo no cubierto aún.
- Comprensión lectora en japonés sobre fragmentos de Wikipedia.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente autónomo, razonamiento multi-paso general, matemáticas, código ni visión.
- No se documenta modo thinking ni capacidades de audio.
- Multilingüismo: solo japonés declarado; no hay evidencia de transferencia a otros idiomas.

## Casos de uso

- RAG multi-salto sobre Wikipedia japonesa: el modelo se inserta como planificador de recuperación entre la primera pasada y la segunda; recibe la pregunta y los tres fragmentos iniciales y devuelve el título del artículo que conviene recuperar después, lo que permite encadenar saltos sin un LLM grande en el bucle de recuperación.
- Reducción de coste en pipelines RAG: al ser un modelo de 0,87 mil millones de parámetros con pesos fusionados, sustituye a un modelo generador grande en la fase de decisión de recuperación, reservando el modelo grande solo para la respuesta final.
- Enrutamiento de consultas en buscadores documentales: integrado en un servicio de búsqueda corporativa en japonés, decide qué documento adicional indexar en el contexto cuando la primera pasada es insuficiente.
- Evaluación de sistemas de recuperación: sirve como componente de referencia para medir la calidad del salto de recuperación en experimentos académicos con JEMHopQA o auto-wiki-qa.
- Filtrado de contexto en asistentes de documentación: antes de enviar contexto a un modelo generador, el sistema usa este modelo para elegir el siguiente artículo y evitar inyectar fragmentos irrelevantes.
- Prototipado educativo y reproducción de experimentos: al haberse entrenado íntegramente en Google Colab sin APIs externas, es reproducible como caso de estudio de ajuste fino LoRA para tareas de recuperación.
- Despliegue en entornos con recursos limitados: al caber en una GPU de consumo y no requerir cuantización para inferencia en FP16/BF16, puede ejecutarse en el mismo nodo que el índice de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, menos de 4 GB en configuraciones típicas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se publican ficheros GGUF oficiales, por lo que la cuantización requeriría conversión propia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU con llama.cpp tras conversión a GGUF.
- Opciones de despliegue: vLLM, TGI, transformers con `AutoModelForCausalLM`, llama.cpp u Ollama previa conversión a GGUF. No se documentan integraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-nav001 | 873 M | No disponible | Japonés | Apache 2.0 | Navegación de recuperación (siguiente artículo) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache 2.0 | LLM generalista |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | No aplica | No aplica | Japonés | CC BY-SA 4.0 | Corpus de preguntas sobre Wikipedia japonesa |

No se dispone de información sobre modelos directamente comparables de navegación de recuperación en japonés con este tamaño; la comparación más cercana es el modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de tarea única: no está pensado para generar respuestas, sino solo para emitir un nombre de artículo; usarlo fuera de ese rol produce resultados no validados.
- Entrenado exclusivamente en japonés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinación de títulos de artículo: el modelo puede emitir nombres que no existan en el corpus distribuido, por lo que el pipeline debe validar la salida contra el índice.
- Sesgos heredados de Qwen3.5-0.8B y de los corpus JEMHopQA, auto-wiki-qa y Wikipedia japonesa, incluyendo sesgos de cobertura temática y de representación.
- El conjunto de entrenamiento es pequeño (1.585 ejemplos) y se construyó con reglas heurísticas de filtrado y combinación, lo que puede limitar la generalización a preguntas fuera de la distribución de JEMHopQA y auto-wiki-qa.
- No se publican benchmarks, métricas de recuperación ni evaluación de calidad; no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- La licencia Apache 2.0 cubre los pesos del modelo, pero los datos de entrenamiento derivados de JEMHopQA y auto-wiki-qa están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos.
- El repositorio no tiene descargas ni validación comunitaria; debe tratarse como un artefacto experimental de curso, no como un componente listo para producción.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento con preguntas y documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-nav001
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Corpus del concurso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
