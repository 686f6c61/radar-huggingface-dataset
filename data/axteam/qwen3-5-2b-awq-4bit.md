# axteam/Qwen3.5-2B-AWQ-4bit

## Resumen

Qwen3.5-2B-AWQ-4bit es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario axteam. Se trata de una cuantización de posentrenamiento (PTQ) mediante AWQ en esquema W4A16, pensada específicamente para servir el modelo con vLLM de forma eficiente en memoria. El modelo base es un transformer híbrido denso de aproximadamente 2.213 millones de parámetros que combina atención lineal con atención completa y que procesa tanto texto como imágenes (pipeline image-text-to-text).

La relevancia de esta ficha radica en que reduce el peso en disco de los pesos del modelo a unos 2,6 GB, manteniendo las activaciones en BF16 y preservando en BF16 componentes sensibles como la torre de visión, el proyector multimodal, la cabeza de predicción multi-token (MTP), las normalizaciones RMSNorm, los embeddings y la LM head. El autor reporta una recuperación media del 97,8 % respecto al original BF16 en un conjunto de benchmarks medidos con el mismo arnés.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial. La cuantización está empaquetada en formato compressed-tensors `pack-quantized` y requiere vLLM ≥ 0.17.0 (probado con vLLM 0.32.0) o transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0 para su uso sin vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantización | AWQ INT4 (W4A16): pesos INT4 asimétricos, group size 32, escala BF16 + zero-point INT4, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors (pack-quantized); compatible con vLLM y transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que alterna capas de atención lineal con capas de atención completa, e incluye un componente multimodal de visión (torre visual y proyector) y una cabeza de predicción multi-token (MTP). Esta ficha describe la versión cuantizada, no el entrenamiento original: se trata de una cuantización de posentrenamiento (PTQ) sin reentrenamiento, en la que AWQ utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) para proteger los canales de pesos más relevantes antes del redondeo.

La cuantización mantiene en BF16 aproximadamente el 40 % de los parámetros: la torre y el proyector de visión (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). `linear_attn.A_log` y la normalización con compuerta de `linear_attn.norm`, que en el original están en FP32, se almacenan en BF16 (sin pérdida para `A_log`). El tokenizador, la `chat_template` y las configuraciones de preprocesado son idénticos a los del original; el `config.json` es el original más un bloque `quantization_config`. En la revisión del 2026-11-01 se restauraron de forma bit-exacta los pesos RMSNorm no suavizados que habían quedado con ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva).

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo base.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text): la torre de visión y el proyector se conservan en BF16.
- Razonamiento y respuesta a preguntas en formato generativo, evaluado en MMLU, ARC-Challenge y Winogrande.
- Resolución de problemas matemáticos de varios pasos, evaluado en GSM8K.
- Comprensión multilingüe parcial, con evaluaciones específicas en coreano (KMMLU, HAE-RAE).
- Predicción multi-token mediante la cabeza MTP conservada en BF16 (relevante para decodificación especulativa en el runtime que la soporte).
- Compatibilidad con el endpoint OpenAI de vLLM (`/v1/chat/completions`), lo que habilita su integración en pipelines que usan la API de OpenAI.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta entradas de imagen y texto y puede desplegarse con `vllm serve` exponiendo una API compatible con OpenAI, lo que permite integrarlo en aplicaciones de asistencia conversacional con imágenes sin reescribir el cliente.
- Despliegue en GPU de gama media o con memoria limitada: con 2,6 GB de pesos, el modelo deja espacio para la caché KV y las activaciones en tarjetas consumer, lo que facilita prototipos y entornos de desarrollo con presupuesto de VRAM ajustado.
- Procesamiento por lotes de documentos escaneados o capturas: al conservar la torre de visión en BF16, puede extraer y describir contenido visual en pipelines de digitalización, con la ventaja de un peso reducido que permite más instancias concurrentes por GPU.
- Evaluación comparativa de cuantizaciones: el autor publica métricas de fidelidad (perplejidad y acuerdo top-1) frente al BF16, por lo que sirve como referencia reproducible para decidir entre AWQ-4bit, AWQ-8bit, FP8 o NVFP4 en un mismo arnés.
- Inferencia en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite incorporar el modelo en productos comerciales, siempre que se respeten las condiciones de atribución del modelo base.
- Tareas de razonamiento y matemáticas de complejidad moderada en asistentes internos: los resultados medidos en GSM8K (54,06 en 5-shot estricto) y MMLU generativo (60,38 en 5-shot) permiten calibrar expectativas para asistentes de soporte técnico o educativos.
- Servicio multi-instancia con tensor parallelism: el autor indica el uso de `--tensor-parallel-size N` cuando los pesos no caben en una GPU, lo que habilita despliegues repartidos en varias tarjetas para aumentar el contexto o la concurrencia.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con MMLU por log-verosimilitud. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | AWQ-4bit (este repo) | Recuperación |
|---|---|---|---|
| MMLU (5-shot, generativo) | 53,33 | 60,38 | 113,2 % |
| GSM8K (5-shot, estricto) | 58,23 | 54,06 | 92,8 % |
| ARC-Challenge (0-shot) | 41,47 | 39,59 | 95,5 % |
| Winogrande (5-shot) | 64,56 | 62,51 | 96,8 % |
| KMMLU (5-shot, directo) | 43,29 | 42,10 | 97,3 % |
| HAE-RAE (0-shot) | 45,65 | 41,06 | 90,0 % |
| Media | 51,09 | 49,95 | 97,8 % |

Métricas de fidelidad frente al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas greedy del BF16 puntuadas bajo cada build):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,9971 | 1,8515 (+7,9 %) |
| Acuerdo top-1 en el siguiente token | 86,8 % | 98,9 % |

El autor también publica la comparación con otras cuantizaciones del mismo modelo base (FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4), con medias de 49,60, 50,70, 50,21 y 48,46 respectivamente frente a 49,95 de esta versión AWQ-4bit.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,6 GB solo para pesos; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75) o posterior; no se requiere hardware de tensor cores especializado porque la cuantización es weight-only INT. El autor probó únicamente en B200.
- GPU no soportadas: V100 (sm70) queda fuera del soporte.
- Cabe en GPU consumer: sí, dado el reducido tamaño de pesos; la selección concreta de kernel depende del código de selección de vLLM 0.32 para cada GPU.
- Despliegue recomendado: vLLM ≥ 0.17.0 (probado con 0.32.0), con Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥ 5.16.1,< 5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Comando de ejemplo: `vllm serve axteam/Qwen3.5-2B-AWQ-4bit --max-model-len 32768`.
- Despliegue sin vLLM: transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0; no requiere `trust_remote_code`.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otras cuantizaciones del mismo modelo base, según los datos publicados por el autor (media de benchmarks y tamaño de pesos cuando se indica):

| Modelo | Esquema | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|
| axteam/Qwen3.5-2B-AWQ-4bit | AWQ INT4 W4A16 | 49,95 (97,8 %) | Apache-2.0 | Hugging Face, vLLM |
| Qwen3.5-2B FP8-dynamic | FP8 dinámico | 49,60 (97,1 %) | Apache-2.0 (base) | Según el autor, misma familia de builds |
| Qwen3.5-2B AWQ-8bit | AWQ INT8 | 50,70 (99,2 %) | Apache-2.0 (base) | Según el autor, misma familia de builds |
| Qwen3.5-2B NVFP4A16 | NVFP4 (A16) | 50,21 (98,3 %) | Apache-2.0 (base) | Según el autor, misma familia de builds |
| Qwen3.5-2B NVFP4 | NVFP4 | 48,46 (94,8 %) | Apache-2.0 (base) | Según el autor, misma familia de builds |

No se dispone de datos en la información proporcionada para comparar con modelos de otros autores de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- La cuantización degrada la fidelidad respecto al BF16: perplejidad un 7,9 % superior y acuerdo top-1 del 86,8 % frente al 98,9 % del original; en tareas sensibles conviene validar contra el modelo sin cuantizar.
- Los resultados de MMLU son de la variante generativa y no son directamente comparables con puntuaciones MMLU obtenidas por log-verosimilitud; el 113,2 % de recuperación en MMLU no debe interpretarse como una mejora real de capacidad.
- El conjunto de calibración tiene predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma; no se especifican los idiomas oficialmente soportados.
- La evaluación de fidelidad se hizo sobre 100 prompts internos mixtos inglés/coreano, una muestra reducida que no cubre todos los dominios.
- Solo se probó en una GPU B200; el rendimiento y la selección de kernel en otras arquitecturas (Turing, Ampere, Ada) no están verificados por el autor.
- La revisión del 2026-11-01 restauró pesos RMSNorm bit-exactos, pero las mediciones publicadas se tomaron antes de ese cambio.
- El modelo base no incluye `generation_config.json`, por lo que esta versión tampoco lo aporta; los parámetros de generación deben fijarse explícitamente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se heredan los del modelo base Qwen3.5-2B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse los términos del modelo base enlazados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
