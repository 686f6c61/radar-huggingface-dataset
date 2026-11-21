# cyankiwi/Arete-27B-QAT-HAWQ

## Resumen
Arete-27B-QAT-HAWQ es una cuantización de alta calidad del modelo NousResearch/Arete-27B, un post-entrenamiento por supervisión (SFT) sobre el Qwen3.8-27B de Alibaba. El modelo original busca reforzar valores occidentales (libertad de expresión, democracia, privacidad de datos, economía de mercado) sobre una base entrenada con sesgos ideológicos de origen, reduciendo respuestas con propaganda del 22 % al 0,9 % según la evaluación del autor. Esta versión concreta la publica cyankiwi, un agente de inferencia para modelos abiertos, aplicando Quantization-Aware Training (QAT) y transformadas Hadamard en bloque (HAWQ) para comprimir los pesos a una mezcla de INT4/5/6/7/8.

El checkpoint ocupa 21,26 GB, lo que supone una reducción notable frente a los ~55 GB en BF16 de un modelo de 27 786 millones de parámetros, manteniendo una caché KV en FP8 y soporte de contexto largo de hasta 262 144 tokens en despliegue vLLM. Es relevante porque permite servir un modelo multimodal (image-text-to-text) de 27B en dos GPUs con precisión mixta agresiva, un caso poco habitual en el ecosistema abierto.

La ficha describe tanto las capacidades heredadas del modelo base (razonamiento, código, visión, tool calling) como las particularidades de esta cuantización: dependencia de un fork específico de vLLM, licencia comunitaria propia y ausencia de benchmarks publicados para el checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 27 786 408 720 (~27,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (configurado en el ejemplo de vLLM); contexto de entrenamiento del modelo base: 64k |
| Tipos de cuantizacion | Pesos mixtos INT4/5/6/7/8 con transformadas QuIP block-diagonal Hadamard; caché KV en FP8 |
| Idiomas soportados | No disponible |
| Licencia | cyankiwi-community-model-license-1.0 (etiquetada como `other`) |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 21,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | NousResearch/Arete-27B |
| Dataset de calibracion | cyankiwi/calibration-medium |
| Version | cyankiwi 26.11.01 |

## Arquitectura y entrenamiento
El modelo base Arete-27B parte de Qwen3.8-27B de Alibaba, un transformer denso de 27B parámetros. Nous Research aplicó únicamente supervised fine-tuning (SFT) sobre datos de texto, sin RL, sin optimización de preferencias y sin modificar la arquitectura. El entrenamiento se realizó con contexto de 64k y un profesor denominado "Inkling", sobre el dataset NousResearch/arete-data-pairs, orientado a siete categorías de valores: libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad y vigilancia, democracia y medio ambiente. El checkpoint evaluado corresponde al step 1 202.

Sobre esa base, cyankiwi aplica Quantization-Aware Training con transformadas Hadamard en bloque (QuIP) y precisión mixta INT4/5/6/7/8, calibrando con cyankiwi/calibration-medium. El resultado se empaqueta en formato compressed-tensors con caché KV en FP8. Esta técnica busca preservar la calidad del modelo original a un coste de memoria mucho menor, aunque requiere un fork de vLLM con soporte de tensor-parallel para transformadas Hadamard en bloque y carga de transformadas de entrada en shards fusionados.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a preguntas con contexto largo (hasta 262 144 tokens en despliegue).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), heredado del modelo base.
- Tool calling / function calling: el ejemplo de despliegue activa `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Soporte de agentes y razonamiento multi-paso (parser de razonamiento `qwen3`).
- Capacidades multilingües: no especificadas en la información disponible.
- Alineamiento de valores orientado a libertad de expresión, democracia, privacidad y economía de mercado, con reducción declarada de propaganda del 22 % al 0,9 % y mejora del fact score de 2,32 a 2,98 sobre 5.

## Casos de uso
- Atención al cliente automatizada: con 262 144 tokens de contexto puede mantener conversaciones largas con historial extenso y documentos adjuntos, usando tool calling para consultar sistemas internos.
- Generación de código en producción: el soporte de tool calling y el parser `qwen3_coder` permiten integrarlo en pipelines de CI/CD para revisión de parches, generación de tests o explicación de errores.
- Análisis de documentos con imágenes: al ser image-text-to-text puede extraer información de capturas, diagramas o formularios escaneados junto a texto, útil en back office.
- Agentes autónomos multi-paso: el modo de razonamiento y el soporte de herramientas permiten orquestar tareas con planificación y ejecución de acciones.
- Investigación sobre alineamiento de valores: útil para estudiar cómo el SFT altera sesgos ideológicos en modelos entrenados con otra cosmovisión, con evaluación pública en NousResearch/Propaganda_Eval.
- Despliegue en infraestructura limitada: al ocupar 21,26 GB en INT4/5/6/7/8, permite servir un modelo de 27B en dos GPUs en lugar de requerir un nodo de mayor capacidad.
- Moderación y análisis de contenido politicamente sensible: el ajuste de valores permite respuestas más equilibradas en temas de libertad de expresión o vigilancia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para el checkpoint cuantizado. El autor del modelo base reporta métricas de alineamiento (fact score de 2,32 a 2,98 sobre 5 y reducción de respuestas con propaganda del 22 % al 0,9 %), pero no se ofrecen cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware
- VRAM estimada: ~21,3 GB solo para pesos; con caché KV en FP8 y contexto largo, el consumo crece de forma proporcional al contexto y al número de secuencias concurrentes.
- El ejemplo oficial de despliegue usa `--tensor-parallel-size 2`, es decir, dos GPUs.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB en configuraciones ajustadas (dos unidades para tensor-parallel).
- Cabe en GPUs consumer de 24 GB si se reparte entre dos tarjetas; en una sola RTX 4090 el margen para KV cache es muy limitado.
- Opciones de despliegue: vLLM (fork cyankiwi/vllm, rama `main`, con kernels precompilados). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-QAT-HAWQ | 27,8B | 262 144 (despliegue) | cyankiwi-community-model-license-1.0 | safetensors compressed-tensors | Cuantización INT4/5/6/7/8, requiere fork de vLLM |
| NousResearch/Arete-27B | 27B | 64k (entrenamiento) | no disponible en la información | safetensors | Modelo base en BF16, ~55 GB, sin cuantizar |
| Qwen3.8-27B (Alibaba) | 27B | no disponible | no disponible | safetensors | Modelo de partida, sin post-entrenamiento de valores |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El ajuste de valores es intencionado y puede introducir sesgos en sentido contrario al del modelo original; no es neutral.
- Riesgo de alucinación inherente a modelos de 27B, no cuantificado en la información disponible.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado.
- Licencia comunitaria propia (cyankiwi-community-model-license-1.0), con posibles restricciones para uso comercial; revisar el archivo LICENSE antes de producción.
- Requiere un fork específico de vLLM (cyankiwi/vllm) y compilación de kernels; no funciona con vLLM estándar sin ese soporte.
- La cuantización mixta INT4/5/6/7/8 puede degradar ligeramente la calidad frente al modelo base en BF16; no se han publicado evaluaciones de esa degradación.
- El contexto de entrenamiento del modelo base es de 64k, aunque el despliegue permita 262 144 tokens; el rendimiento más allá de 64k no está validado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/cyankiwi/Arete-27B-QAT-HAWQ
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration-medium
- Dataset de post-entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Evaluación de propaganda: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Blog de Nous Research: https://nousresearch.com/arete
- Fork de vLLM: https://github.com/cyankiwi/vllm/tree/main
- Commit base de vLLM: https://github.com/vllm-project/vllm/commit/0fda86a35419c9c70dbfada224c838c10fbb62ad
- Web de cyankiwi: https://cyan.kiwi/
- ModelScope: https://www.modelscope.ai/organization/cyankiwi
- X: https://x.com/cyankiwi_ai
- Reddit: https://www.reddit.com/r/cyankiwi/
- Licencia: https://huggingface.co/cyankiwi/Arete-27B-QAT-HAWQ/blob/main/LICENSE
