# jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un *merge* de dos variantes comunitarias de Qwen3.8 de 27B, publicado por el usuario jashepp en formato GGUF. El autor combina, mediante mergekit y el método TIES, el modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (optimizado para seguimiento de instrucciones y razonamiento "Turbo Brilliance") con nerkyor/Qwen3.8-27B-Coder390-EfficientThink (especializado en código y recuperación de contexto). El objetivo declarado es conservar el razonamiento y la adherencia a instrucciones del primero junto con la precisión en código del segundo.

El modelo resultante tiene 27.318.209.536 parámetros en precisión bfloat16 y se distribuye exclusivamente en cuantizaciones GGUF (BF16, Q8_0, Q6_K, Q4_K_M y MXFP4), todas con soporte de MTP (multi-token prediction). Está pensado para ejecutarse en llama.cpp y LM Studio, lo que permite desplegarlo en hardware de consumo. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de la práctica comunitaria de *model merging* sobre la familia Qwen; por otro, advierte de que no existen benchmarks publicados y de que el propio autor reconoce que no ha evaluado tareas de código complejas con esta combinación. Es, por tanto, un modelo experimental orientado a pruebas locales más que a producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8 27B); datos de atención y capas no disponibles |
| Parametros totales | 27.318.209.536 (27,3B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (Q4_K + Q6_K), MXFP4; todas con MTP |
| Idiomas soportados | Inglés (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también etiquetado como transformers; repo de 138 GB) |

## Arquitectura y entrenamiento

El modelo es un *ties merge* (TIES, arXiv:2306.01708) generado con mergekit a partir de dos checkpoints de Qwen3.8 de 27B ya post-entrenados. No hay entrenamiento adicional ni datos propios: el resultado hereda los pesos de ambos progenitores mediante poda de parámetros redundantes, resolución de signos y fusión ponderada. La model card no publica la configuración exacta de pesos del merge (aunque el autor indica que está disponible en el repositorio), ni el número de tokens de entrenamiento de los modelos base, ni detalles de RLHF/DPO más allá de las etiquetas "SFT", "RLOO" y "post-training" presentes en el nombre del modelo de nerkyor.

La innovación técnica declarada es la preservación de los modos de razonamiento "Turbo Brilliance" del modelo de DavidAU, que incluyen cadenas de pensamiento explícitas, junto con la capacidad de código del modelo de nerkyor. Las cuantizaciones GGUF se generaron con *imatrix* y conservan el soporte de MTP (multi-token prediction), lo que en llama.cpp permite decodificación especulativa y por tanto mejoras de throughput. El autor no documenta ninguna otra modificación arquitectónica.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Razonamiento con modo *thinking* y cadena de pensamiento explícita, heredado de la serie Turbo Brilliance.
- Generación de código y tareas de programación, heredadas del modelo Coder390.
- Recuperación de contexto (*context recall*) reforzada según las pruebas A/B del autor.
- Soporte declarado de *tool use* / function calling y flujos agénticos (etiquetas `agentic`, `tool-use`).
- Seguimiento de instrucciones reforzado, según la evaluación cualitativa del autor.
- Modo de razonamiento eficiente (*EfficientThink*) heredado del modelo de nerkyor.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistencia de programación local: el modelo puede generar y revisar código en inglés dentro de editores o terminales mediante llama.cpp o LM Studio, aprovechando la especialización Coder390 del progenitor; requiere validación manual porque el autor no ha probado tareas complejas.
- Agentes locales con tool calling: al soportar *function calling* y MTP, puede integrarse en bucles agénticos de escritorio (por ejemplo, automatización de tareas con APIs locales) donde la latencia importa y se prefiere no enviar datos a la nube.
- Razonamiento paso a paso en entornos sin conexión: el modo thinking permite obtener trazas de razonamiento para depuración de problemas lógicos o matemáticos en máquinas con una sola GPU de consumo.
- Prototipado de chatbots en inglés: con contexto conversacional multi-turno, sirve para probar flujos de atención al cliente antes de invertir en un modelo mayor; la licencia Apache 2.0 facilita el uso comercial interno.
- Análisis de documentación técnica: la recuperación de contexto reforzada permite resumir y extraer información de archivos largos siempre que se confirme la ventana de contexto real del modelo base.
- Experimentación con *model merging*: investigadores que estudien técnicas TIES pueden usar este repositorio como referencia de una fusión real entre un modelo de instrucciones y uno de código, comparando el comportamiento con cada progenitor.
- Evaluación comparativa de cuantizaciones: los cinco GGUF publicados permiten medir la degradación de calidad entre BF16, Q8_0, Q6_K, Q4_K_M y MXFP4 en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ha realizado benchmarks y que sus observaciones se basan en pruebas A/B con la misma semilla y en uso agéntico propio.

## Requisitos de hardware

- VRAM estimada: BF16 requiere unos 55 GB (archivo de 54,7 GB) más overhead de contexto; Q8_0 unos 29 GB; Q6_K unos 22,4 GB; Q4_K_M unos 17,2 GB; MXFP4, el tamaño no está disponible en la información proporcionada, pero por su naturaleza de 4 bits se sitúa por debajo de Q4_K_M.
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, A100 40 GB o dos RTX 4090; para Q6_K y Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente para los pesos, con margen variable para el contexto.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q6_K con 24 GB de VRAM; Q8_0 requiere 32 GB o reparto entre dos GPU.
- Opciones de despliegue: llama.cpp, LM Studio (etiquetados por el autor); también es posible usar otros runners compatibles con GGUF, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles. El soporte de MTP en las cuantizaciones puede mejorar la decodificación especulativa en llama.cpp, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este merge (jashepp) | 27,3B | No disponible | Apache 2.0 | GGUF | Sin benchmarks; merge experimental |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B (según nombre) | No disponible | No disponible en la información | Probablemente safetensors y GGUF | Progenitor centrado en instrucciones y razonamiento |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink | 27B (según nombre) | No disponible | No disponible en la información | No disponible | Progenitor centrado en código |
| Qwen3 base de 27B | No disponible | No disponible | No disponible | No disponible | Modelo original de la familia; no se detalla en la información |

No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas objetivas de MMLU, HumanEval, GSM8K ni de calidad de código; el autor solo aporta impresiones cualitativas.
- El propio autor reconoce no haber probado tareas de código complejas con el merge, pese a que la especialización en código es uno de sus objetivos.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificarla empíricamente.
- Riesgo de alucinación inherente a los modelos de 27B y acentuado por la fusión de dos post-entrenamientos distintos, cuyas distribuciones pueden entrar en conflicto.
- El progenitor de DavidAU está etiquetado como "Heretic" y "Uncensored": es previsible una menor alineación de seguridad y mayor probabilidad de contenido no filtrado; requiere moderación adicional en producción.
- Licencia Apache 2.0 declarada, pero los modelos base no detallan su licencia en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- El repositorio ocupa 138 GB y contiene múltiples cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar el archivo concreto.
- Al ser un merge comunitario sin evaluación independiente, no se recomienda como dependencia crítica en producción sin una batería de pruebas propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF
- Modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- GGUF del modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base 2: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Paper TIES: https://arxiv.org/abs/2306.01708
- mergekit: https://github.com/cg123/mergekit
- Colección Qwen de DavidAU: https://huggingface.co/collections/DavidAU/qwen-36-reg-uncensored-9b-12b-21b-27b-40b
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
