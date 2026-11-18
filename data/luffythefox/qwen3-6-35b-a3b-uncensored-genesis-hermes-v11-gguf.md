# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF es una distribución en formato GGUF de un modelo de lenguaje multimodal (image-text-to-text) construido sobre la arquitectura MoE Qwen3.6 de 35B parámetros totales y 3B activos. Lo publica el desarrollador independiente LuffyTheFox bajo el paraguas de su proyecto Genesis, que no entrena modelos desde cero sino que aplica una técnica propia de "reparación de tensores" sobre pesos ya existentes en formato GGUF para reducir el ruido acumulado durante el entrenamiento. El resultado es un modelo derivado en dos saltos: primero el base sin censura de HauhauCS, y después una transferencia de bloques de un finetune orientado a agentes Hermes.

El modelo resuelve dos necesidades concretas: por un lado, ofrecer una variante sin rechazos (la model card cita "0/465 refusals" en el modelo base) para casos donde los filtros de seguridad estándar bloquean tareas legítimas; por otro, incorporar capacidades de function calling y flujo agéntico mediante la transferencia de datos del finetune Hermes sobre el dataset NousResearch/hermes-function-calling-v1. La licencia Apache 2.0 y el formato GGUF con cuantizaciones imatrix lo hacen desplegable en hardware de consumo.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: arquitecturas MoE eficientes en inferencia (35B totales, 3B activos), modelos multimodales con pipeline image-text-to-text, y el fenómeno de las distribuciones comunitarias que aplican post-procesado matemático sobre pesos publicados. Con 273.947 descargas y 732 likes, es una de las variantes más populares de la familia Qwen3.6 en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) derivado de Qwen3.6; incluye tensores `ssm_conv1d` según la metodología Genesis |
| Parámetros totales | 34.660.610.688 (34,66B) |
| Parámetros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con perfiles imatrix (Unsloth profiles soportados según el script de cuantización enlazado); niveles concretos no disponibles |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 131,2 GB) |

## Arquitectura y entrenamiento

La base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 34,66B parámetros totales y 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El pipeline declarado es image-text-to-text, por lo que el modelo incorpora capacidades multimodales de entrada de imagen y texto. La model card menciona tensores `ssm_conv1d` que, según el autor, gestionan la memoria de contexto largo, lo que sugiere componentes híbridos en la arquitectura original.

El entrenamiento no es propio del autor. El proceso declarado es un pipeline de post-procesado en tres etapas sobre pesos GGUF existentes, ejecutado en Google Colab gratuito con GPU Tesla T4: primero, escaneo y rebalanceo de los tensores `ssm_conv1d`; segundo, sustitución de bloques corruptos (chunks en cero) por chunks seleccionados según la distribución de pesos del tensor; tercero, reducción de ruido mediante una SVD personalizada basada en la distribución de Marchenko–Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, bias y normas, y preservando según el autor el 99 % de la señal. Además, se transfieren aproximadamente 2.000 bloques de dos tensores de expertos FFN desde el finetune DJLougen/hermes-qwen3.5-35b-a3b-GGUF (entrenado sobre NousResearch/hermes-function-calling-v1) al base sin censura de HauhauCS. No se documentan datos de RLHF ni DPO propios.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas (etiqueta multilingual).
- Entrada multimodal image-text-to-text: acepta imágenes junto con texto en el prompt.
- Function calling y tool use: incorpora datos del dataset hermes-function-calling-v1 transferidos desde el finetune Hermes.
- Flujo agéntico y razonamiento multi-paso (etiqueta agentic).
- Generación de código y matemáticas (capacidad heredada del base Qwen3.6; no se detallan benchmarks propios).
- Modo sin censura: el autor reporta 0/465 rechazos en el modelo base HauhauCS.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como API.

## Casos de uso

- Asistentes conversacionales sin filtros restrictivos: útil en investigación sobre alineación, red teaming y evaluación de comportamientos, donde los rechazos del modelo estándar impiden estudiar respuestas completas.
- Agentes con tool calling en local: la transferencia de datos Hermes permite integrar el modelo en pipelines que necesitan invocar funciones externas (APIs, bases de datos, shell) sin depender de servicios en la nube.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o formularios combinados con instrucciones textuales.
- Generación de código en entornos con GPU de consumo: con 3B parámetros activos y cuantización GGUF, es viable en estaciones de trabajo modestas para autocompletado y refactorización.
- Atención al cliente en idiomas inglés y chino: soporte multilingüe para conversaciones multi-turno, con la advertencia de que el contexto máximo no está documentado.
- Investigación sobre métodos de post-procesado de pesos: el modelo sirve como caso de estudio reproducible del algoritmo Genesis y de la transferencia de bloques entre finetunes MoE.
- Despliegue en edge o portátil: el formato GGUF permite ejecución con llama.cpp u Ollama en hardware sin GPU dedicada, útil para prototipos y demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica de rechazos del modelo base (0/465) y no incluye MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 34,66B parámetros en GGUF, una cuantización Q4 requiere del orden de 20-22 GB, Q5 en torno a 24-26 GB y Q8 cerca de 37 GB (estimaciones por tamaño, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones Q4/Q5; A100 40/80 GB y H100 para cuantizaciones altas o FP16.
- GPU de consumo: viable en RTX 3090/4090 con cuantizaciones bajas; en GPUs de 12-16 GB requeriría cuantizaciones muy agresivas o offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners GGUF; el autor enlaza un script de cuantización con soporte para perfiles Unsloth. vLLM y TGI no se mencionan para este repo GGUF.
- Latencia y throughput: no disponibles. Con 3B parámetros activos, la inferencia debería ser notablemente más rápida que un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11 (este) | 34,66B | 3B | no disponible | Apache 2.0 | GGUF | Sin censura + Hermes + Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | 3B | no disponible | no disponible en la información | safetensors/GGUF | Base sin censura, 0/465 rechazos |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | 35B | 3B | no disponible | no disponible en la información | GGUF | Finetune Hermes sobre Qwen3.5 |
| Qwen3.6-35B-A3B (original) | 35B | 3B | no disponible | no disponible en la información | safetensors | Base con alineación estándar |

## Limitaciones y advertencias

- Modelo sin censura: elimina deliberadamente los rechazos de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o sesgado; no apto para producción orientada al público sin filtros adicionales.
- Método Genesis no revisado por pares: la "reparación de tensores" basada en Marchenko–Pastur es una técnica propia del autor sin validación independiente publicada; los efectos sobre calidad y estabilidad no están cuantificados.
- Proceso de entrenamiento no estándar: la transferencia de bloques entre finetunes MoE puede degradar capacidades del base de forma no documentada.
- Alucinaciones: sin benchmarks ni evaluaciones de fidelidad, el riesgo de alucinación no está caracterizado; el propio autor describe el ruido en tensores como causa de verbosidad y alucinaciones, pero no aporta métricas del resultado.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva, lo que complica el diseño de aplicaciones con ventanas largas.
- Idiomas: solo se declaran inglés, chino y multilingual genérico; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado por un modelo sin censura.
- Repo de 131,2 GB: requiere espacio en disco considerable y descarga lenta; conviene seleccionar un único archivo GGUF.
- Model card con contenido promocional y solicitud de donaciones: la documentación técnica es escasa y mezclada con material comercial.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF
- Modelo base sin censura: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia del método): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
