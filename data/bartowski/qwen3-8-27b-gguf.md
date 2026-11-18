# bartowski/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la versión cuantizada del modelo Qwen3.8-27B desarrollado por Qwen (Alibaba). Esta ficha concreta corresponde al repositorio publicado por bartowski, un conocido cuantizador de la comunidad que distribuye los pesos en formato GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base es multimodal: acepta entradas de texto e imagen, y su pipeline declarado es image-text-to-text.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 28B según la model card), lo que lo sitúa en la gama media-alta de modelos abiertos. Incorpora decodificación especulativa mediante MTP (multi-token prediction), lo que permite acelerar la inferencia, y dispone de ficheros mmproj para el procesamiento de imágenes. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción comercial.

El repositorio de bartowski es relevante porque ofrece un abanico amplio de cuantizaciones (desde Q8_0 hasta IQ2_M) con métricas de perplejidad y KLD publicadas, lo que permite elegir el equilibrio entre tamaño y calidad con datos objetivos. Con más de 330.000 descargas y 237 likes, es una de las distribuciones GGUF de referencia para este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen); detalles de capas y atención no disponibles |
| Parametros totales | 27.320.697.856 (aprox. 28B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer multimodal con soporte de entrada de texto e imagen (mediante fichero mmproj en la versión GGUF). La model card de la cuantización menciona decodificación especulativa mediante MTP (multi-token prediction), una técnica que permite generar varios tokens por paso y acelerar la inferencia. También se indica el uso de imatrix durante la cuantización, lo que mejora la calidad de los pesos cuantizados.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card incluye un formato de prompt con un bloque de sistema que fija el esfuerzo de razonamiento ("Reasoning effort is set to xhigh") y una etiqueta `<think>` para el modo de pensamiento, lo que sugiere que el modelo está entrenado para razonamiento explícito. Tampoco se detallan innovaciones adicionales como atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional y razonamiento explícito mediante modo thinking (etiqueta `<think>`).
- Procesamiento de imágenes junto con texto (image-text-to-text), usando el fichero mmproj en llama.cpp.
- Razonamiento multi-paso con control del esfuerzo de razonamiento a través del prompt de sistema.
- Soporte de decodificación especulativa (MTP) para acelerar la generación.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Tool calling / function calling: no se confirma en la información disponible.
- Capacidades de agente: no se confirman explícitamente, aunque el modo thinking y el razonamiento multi-paso son compatibles con flujos agénticos.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional con contexto multimodal: el modelo puede recibir imágenes junto con texto, útil para soporte técnico donde el usuario adjunta capturas de pantalla o fotos de errores, y responder con razonamiento detallado.
- Análisis de documentos e imágenes en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin conexión, procesando capturas, diagramas o gráficos junto a preguntas en lenguaje natural.
- Razonamiento complejo con modo thinking: tareas de análisis, planificación o resolución de problemas donde se necesita una cadena de razonamiento explícita y verificable, ajustando el esfuerzo mediante el prompt de sistema.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (17,44 GB) o IQ4_XS (15,48 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM, ideal para prototipos y desarrollo local.
- Generación asistida en entornos con requisitos de privacidad: al poder ejecutarse con llama.cpp en infraestructura propia, es adecuado para sectores regulados que no pueden enviar datos a APIs externas.
- Evaluación e investigación de cuantizaciones: el repositorio incluye métricas de perplejidad y KLD por cuantización, lo que lo convierte en un recurso útil para estudiar el impacto de la cuantización en modelos multimodales de ~28B.
- Aceleración de inferencia en producción: el soporte de decodificación especulativa MTP permite reducir la latencia en despliegues con llama.cpp, útil en aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de calidad de cuantización (perplejidad y KLD) para cada fichero, que se resumen a continuación:

| Cuantizacion | Tamano | bpw | PPL | Mean KLD | Same top-p |
|---|---|---|---|---|---|
| Q8_0 | 29,12 GB | 8,38 | 6,75 | 0,0009 | 98,7% |
| Q6_K_L | 24,96 GB | 7,19 | 6,74 | 0,0024 | 97,7% |
| Q6_K | 23,86 GB | 6,87 | 6,74 | 0,0030 | 97,4% |
| Q5_K_M | 20,92 GB | 6,03 | 6,75 | 0,0053 | 96,9% |
| Q4_K_M | 17,44 GB | 5,02 | 6,76 | 0,0139 | 95,0% |
| IQ4_XS | 15,48 GB | 4,46 | 6,78 | 0,0188 | 94,1% |
| Q3_K_M | 13,40 GB | 3,86 | 7,03 | 0,0564 | 89,8% |
| Q2_K | 10,82 GB | 3,12 | 7,44 | 0,1612 | 83,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto y el fichero mmproj si se usa visión. Para Q4_K_M (17,44 GB) se recomiendan al menos 20-22 GB de VRAM; para Q8_0 (29,12 GB) se necesitan 32 GB o más.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas y contextos largos; RTX 4090 (24 GB) para Q4_K_M, Q5_K_S o IQ4_XS; RTX 3090 (24 GB) con las mismas opciones.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o IQ4; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con IQ4_XS o cuantizaciones Q3, con riesgo de desbordamiento si el contexto es largo.
- Opciones de despliegue: llama.cpp (versión b10896 o superior, usada para la cuantización), Ollama, y servidores compatibles con GGUF. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles. El soporte de MTP (decodificación especulativa) debería reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,3B | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal, MTP, imatrix |
| Alternativas de ~27-30B | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; se recomienda evaluar en el dominio de uso antes de desplegarlo.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo con modo thinking; conviene validar las salidas.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- Los idiomas soportados no están especificados; el rendimiento en castellano no está garantizado ni medido.
- Las cuantizaciones bajas (Q2_K, IQ2_M) muestran un aumento notable de la perplejidad (7,44 frente a 6,75 en Q8_0) y una caída de coincidencia top-p al 83,5%, lo que degrada la calidad.
- El uso de visión requiere el fichero mmproj adicional y consume VRAM extra; no todos los frontends de llama.cpp lo soportan.
- Aunque la licencia es Apache 2.0, deben revisarse las condiciones del modelo base Qwen3.8-27B por si hubiera términos adicionales.
- El repositorio ocupa 840,9 GB en total; descargar solo el fichero necesario y verificar el espacio en disco.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b10896
- Fichero Q4_K_M recomendado: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-Q4_K_M.gguf
