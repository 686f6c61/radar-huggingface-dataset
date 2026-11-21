# shivrajgurjar/Inkling-2-Mini-E8-8GB

## Resumen
Inkling-2-Mini-E8-8GB es una versión comprimida y cuantizada del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `shivrajgurjar`. Se trata de un MoE multimodal de 26.390 millones de parámetros totales con 3.400 millones de parámetros activos (5.400 millones efectivos por el bucle 3x), que en su versión BF16 original ocupa 52,80 GB y en la versión oficial NVFP4+MXFP8 ocupa 20,20 GB. Esta release reduce el peso en disco a 7,92 GB reales (7,38 GiB) manteniendo el 100% de los expertos y capas del modelo original.

El problema que resuelve es el despliegue de un MoE multimodal de gran tamaño en hardware con recursos limitados, mediante una combinación de cuantización en retícula E8, asignación de bitrate por experto guiada por sensibilidad KL y destilación de conocimiento desde el profesor BF16. La compresión alcanza 6,67x respecto a BF16 y 2,55x respecto a la release oficial, con una retención de perplejidad global del 96,95% y una retención en código Python del 99,64%.

Es relevante porque demuestra que es posible preservar la estructura completa de un MoE (24 capas decodificadoras, 128 expertos enrutados por capa, núcleo con bucle 3x, atención híbrida de 1M tokens y codificador visual nativo) en menos de 8 GB, con licencia Apache 2.0 y compatibilidad con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con núcleo 3x-looped (capas L06–L17), atención híbrida de 1M tokens y codificador visual nativo |
| Parametros totales | 26.390 millones (26,39B) |
| Parametros activos | 3,4B activos; 5,4B efectivos por el bucle 3x |
| Longitud de contexto | 1M tokens (atención híbrida, según model card) |
| Tipos de cuantizacion | Retícula E8 mixed-radix shells 1..8 con RH128, bitrate continuo por experto, INT8 QAT-STE para healers; pesos empaquetados en safetensors |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,9 GB; 7,92 GB reales en disco) |

## Arquitectura y entrenamiento
El modelo base es un MoE multimodal con 24 capas decodificadoras, 128 expertos enrutados por capa y un núcleo con bucle 3x en las capas L06–L17, lo que eleva los parámetros activos efectivos de 3,4B a 5,4B. Incorpora atención híbrida con ventana de 1M tokens y un codificador visual nativo, por lo que el pipeline es `image-text-to-text`. La release comprimida preserva el 100% de los expertos y capas originales, sin poda ni eliminación de capas.

La compresión se basa en cuatro componentes: (1) rotación Randomized Hadamard de 128 anchos (RH128) seguida de cuantización RDO sobre la retícula E8 óptima en 8 dimensiones, con empaquetado mixed-radix de 340.320 puntos de Jacobi exactos en shells m ∈ {1..8}; (2) asignación de bitrate continuo por experto mediante sensibilidad KL medida en 48 pasadas y frecuencia de router, con suelo de conocimiento factual de al menos 1,92 bpw; (3) LDLQ de bloque 8 exacto con feedback de error sobre `gate_up_proj` y `lm_head` (matrices 2304×2304) y RDO de 3 candidatos refinado con Wiener en `down_proj`; y (4) 24 healers SwiGLU INT8 compartidos de rango 1280 (212,7 MB) con 3 vectores de ganancia específicos por pasada, destilados desde el profesor BF16 de 52,8 GB junto con 14,16M de escalas de fila MoE plegadas y pesos de atención/`lm_head` adaptados, finalizados con QAT-STE Fake-INT8 en línea (delta KLD de 0,00001). Los datasets citados en la model card son MMLU, WikiText-2, GSM8K, FineWeb-Edu y MetaMathQA.

## Capacidades
- Generación de texto conversacional y razonamiento en inglés y multilingüe.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con codificador visual nativo.
- Razonamiento matemático (evaluado sobre GSM8K y MetaMathQA).
- Generación de código Python (retención de perplejidad del 99,64% respecto al profesor BF16).
- Conocimiento factual y de dominio general (retención MMLU del 98,29%).
- Capacidad de contexto largo gracias a la atención híbrida de 1M tokens del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso
- Despliegue de un MoE multimodal en una sola GPU de consumo: con 7,92 GB en disco, el modelo cabe en GPUs de 12–16 GB de VRAM tras carga, lo que permite ejecutar un modelo de 26,39B totales en hardware de gama alta consumer.
- Asistente multimodal de atención al cliente: el codificador visual nativo y la ventana de 1M tokens permiten gestionar conversaciones multi-turno con capturas de pantalla, documentos escaneados e historial extenso.
- Generación de código en producción: la retención del 99,64% en Python y la preservación íntegra de expertos lo hacen apto para autocompletado y revisión de código en pipelines de CI/CD, con la ventaja de un footprint reducido.
- Análisis de documentos largos con imágenes: la combinación de contexto de 1M tokens y entrada image-text permite resumir informes, facturas o papers con figuras en una sola pasada.
- Razonamiento matemático asistido: útil para tutoría y verificación de problemas de nivel escolar y competición, con retención GSM8K del 96,31% en perplejidad.
- Investigación en cuantización extrema: el modelo sirve como caso de estudio reproducible de retícula E8, LDLQ y destilación de healers para comprimir MoE multimodales por debajo de 8 GB.
- Prototipado en entornos con VRAM limitada: alternativa a la release oficial de 20,20 GB cuando no se dispone de A100/H100 y se necesita mantener la fidelidad del profesor BF16.

## Benchmarks y rendimiento

Evaluación sobre splits held-out disjuntos de 32.768 tokens en MMLU, WikiText-2, GSM8K y código Python, frente al profesor BF16 de 52,8 GB. Datos declarados por el autor, no verificados de forma independiente.

| Modelo / variante | Tamano real | KLD medio (menor es mejor) | Top-1 | Top-2 | Top-5 | Retencion PPL |
|---|---|---|---|---|---|---|
| BF16 Teacher (referencia) | 52,80 GB | 0,00000 | 100,0% | 100,0% | 100,0% | 100,0% |
| AtomicChat AD-IQ3_S (GGUF 3-bit) | 13,34 GB | 0,02050 | 94,20% | — | — | ~98,0% |
| Unsloth UD-IQ2_XXS (GGUF 2-bit) | 8,49 GB | ~0,050+ | 90,60% | — | — | ~94,5% |
| Pre-Heal Shell-E8 Base (0 pasos) | 7,71 GB | 0,04541 | 91,62% | 97,68% | 99,72% | 95,96% |
| Inkling-2-Mini-E8-8GB (final) | 7,92 GB | 0,03618 | 92,50% | 98,05% | 99,75% | 96,95% |

Desglose por dominio del modelo final:

| Dominio | KLD base → curado | Top-1 base → curado | Top-2 curado | PPL curada (retencion) |
|---|---|---|---|---|
| Codigo Python | 0,02766 → 0,02070 | 94,77% → 95,45% | 99,08% | 2,226 (99,64%) |
| Conocimiento MMLU | 0,03841 → 0,02942 | 92,22% → 93,00% | 98,39% | 4,257 (98,29%) |
| Matematicas GSM8K | 0,03907 → 0,03323 | 93,40% → 94,26% | 98,57% | 2,767 (96,31%) |
| Factual WikiText | 0,07652 → 0,06138 | 86,09% → 87,27% | 96,16% | 10,811 (93,65%) |

## Requisitos de hardware
- VRAM estimada para inferencia: el repo ocupa 7,92 GB en disco; la carga en memoria depende del runtime y del descompresor E8. Con decodificación en BF16 de los pesos descomprimidos se requeriría más VRAM, pero la release está pensada para ejecución de bajo bit. No se especifica VRAM exacta en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño en disco, es compatible con GPUs consumer de 12–16 GB (RTX 4070 Ti, 4080, 4090) y con A100/H100 para mayor throughput.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 12 GB o más de VRAM, dado el footprint de 7,92 GB; no confirmado por el autor.
- Opciones de despliegue: `transformers` (librería declarada) y endpoints compatibles según los tags. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Fidelidad vs profesor |
|---|---|---|---|---|---|
| Inkling-2-Mini-E8-8GB | 26,39B totales / 3,4B activos | 1M tokens | 7,92 GB | Apache 2.0 | KLD 0,03618; Top-1 92,50% |
| AtomicChat AD-IQ3_S (GGUF 3-bit) | 26,39B totales / 3,4B activos | 1M tokens | 13,34 GB | Apache 2.0 (heredada) | KLD 0,02050; Top-1 94,20% |
| Unsloth UD-IQ2_XXS (GGUF 2-bit) | 26,39B totales / 3,4B activos | 1M tokens | 8,49 GB | Apache 2.0 (heredada) | KLD ~0,050+; Top-1 90,60% |
| Inkling-2-Mini oficial (NVFP4+MXFP8) | 26,39B totales / 3,4B activos | 1M tokens | 20,20 GB | Apache 2.0 | referencia de compresión oficial |

## Limitaciones y advertencias
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en todos los resultados).
- La release tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La cuantización introduce degradación medible: KLD medio de 0,03618 frente a 0 en el profesor, con pérdida notable en WikiText factual (retención del 93,65% y Top-1 del 87,27%).
- El autor indica que la evaluación se realizó sobre 32.768 tokens por dominio; muestras pequeñas pueden no reflejar el comportamiento en producción.
- Sesgos conocidos: no disponible en la información proporcionada; al derivar de un modelo base entrenado con FineWeb-Edu, MMLU, GSM8K y MetaMathQA, es previsible que herede sesgos de esas fuentes, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; la pérdida de fidelidad en conocimiento factual (MMLU) y WikiText sugiere mayor riesgo que el profesor BF16.
- Idiomas: la model card declara inglés y multilingüe, pero no se detalla la cobertura ni el rendimiento por idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`.
- El formato empaquetado E8 mixed-radix puede requerir código de descompresión específico; la compatibilidad con runtimes estándar más allá de `transformers` no está confirmada.
- El tag `endpoints_compatible` sugiere despliegue en Hugging Face Endpoints, pero no se detalla la configuración de hardware soportada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shivrajgurjar/Inkling-2-Mini-E8-8GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Notebook de inicio rápido: https://huggingface.co/shivrajgurjar/Inkling-2-Mini-E8-8GB/blob/main/quickstart.ipynb
- Notebook en Kaggle: https://www.kaggle.com/notebooks/welcome?src=https://huggingface.co/shivrajgurjar/Inkling-2-Mini-E8-8GB/resolve/main/quickstart.ipynb
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
