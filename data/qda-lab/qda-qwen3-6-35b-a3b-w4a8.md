# qda-lab/QDA-Qwen3.6-35B-A3B-W4A8

## Resumen

QDA-Qwen3.6-35B-A3B-W4A8 es una versión cuantizada del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por qda-lab. Se trata de una cuantización de pesos a 4 bits (INT4) y activaciones a 8 bits en coma flotante (FP8 dinámico), lo que reduce el tamaño del checkpoint de 71,9 GB en BF16 a 22,2 GB, un factor de 3,2×. Según el autor, conserva el 98,6 % de la precisión del modelo original en BF16.

El modelo subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con etiqueta de pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. Cuenta con 35.951.822.704 parámetros totales según los safetensors del repositorio, aunque el número de parámetros activos por token no se especifica en la información disponible.

La relevancia de esta ficha radica en que permite desplegar un modelo MoE multimodal de aproximadamente 36.000 millones de parámetros en una sola GPU NVIDIA Hopper (H100/H200) con 80 GB, manteniendo un rendimiento cercano al BF16 en benchmarks de razonamiento, matemáticas y código. La licencia Apache-2.0 facilita su uso comercial, aunque el kernel W4A8 de vLLM limita el despliegue a GPUs con compute capability 9.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen3.6; pipeline image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8: pesos INT4 en grupos de 128, activaciones FP8 dinámicas, GPTQ sobre copia rotada con Hadamard; routers MoE, expertos compartidos y cabeza de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) de aproximadamente 36.000 millones de parámetros totales. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card tampoco describe innovaciones arquitectónicas específicas más allá de la propia estructura MoE.

La cuantización se realizó con GPTQ sobre una copia del modelo rotada con Hadamard; la rotación se pliega dentro de los pesos, por lo que no hay transformación en tiempo de ejecución. Los routers MoE, los expertos compartidos y la cabeza de salida permanecen en BF16. La receta fue seleccionada mediante búsqueda automática de QDA y el proceso de construcción se ejecutó en una única GPU H100 de 80 GB. El autor advierte que los pesos reconstruidos con la receta no son idénticos bit a bit a este checkpoint.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con cierre de razonamiento en ``.
- Razonamiento matemático avanzado, evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico y de conocimiento general, evaluado en GPQA-Diamond y MMLU-Pro.
- Generación de código, evaluada en LiveCodeBench.
- Seguimiento de instrucciones, evaluado en IFBench.
- Procesamiento multimodal de entrada imagen-texto según la etiqueta de pipeline `image-text-to-text`.
- Compatibilidad con vLLM y transformers.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene 88,3 en AIME 2025 frente a 90,0 en BF16, por lo que puede emplearse en entornos de resolución de problemas matemáticos donde el ahorro de memoria importa más que una pérdida mínima de precisión.
- Análisis científico y técnico: con 84,8 en GPQA-Diamond, es adecuado para responder preguntas de nivel posgrado en física, química y biología dentro de pipelines de investigación.
- Generación de código en producción: sus 79,0 en LiveCodeBench permiten integrarlo en asistentes de programación o revisión de código, desplegado con vLLM en una H100.
- Evaluación de instrucciones complejas: con 65,8 en IFBench, puede usarse en sistemas que requieren seguir especificaciones detalladas, como generación de informes estructurados o extracción de datos con formato estricto.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse para tareas de comprensión de documentos escaneados o capturas combinadas con instrucciones textuales.
- Despliegue en una sola GPU: al ocupar 22,2 GB, permite servir el modelo en una H100/H200 de 80 GB con margen para KV cache y lotes concurrentes, reduciendo costes frente al BF16 de 71,9 GB.
- Prototipado e investigación en cuantización: la receta reproducible y el paper asociado permiten experimentar con configuraciones W4A8 y comparar la degradación frente a BF16.

## Benchmarks y rendimiento

| Benchmark | BF16 (71,9 GB) | QDA W4A8 (22,2 GB) |
|---|---|---|
| AIME 2025 | 90,0 | 88,3 |
| HMMT Feb 2026 | 82,7 | 81,8 |
| GPQA-Diamond | 85,3 | 84,8 |
| IFBench | 66,4 | 65,8 |
| MMLU-Pro | 84,9 | 84,2 |
| LiveCodeBench | 81,4 | 79,0 |
| Promedio | 81,8 | 80,7 |

Condiciones de evaluación: modo thinking activado, pass@1 promediado sobre 1–32 semillas, temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0. Máximo de tokens nuevos por ítem: 81.920 para AIME 2025, HMMT Feb 2026, GPQA-Diamond y LiveCodeBench; 32.768 para MMLU-Pro. Repeticiones: 32 semillas (17–48) en AIME 2025 y HMMT Feb 2026, 16 semillas (17–32) en GPQA-Diamond e IFBench, 1 semilla (17) en MMLU-Pro y 4 semillas (17–20) en LiveCodeBench. MTP y decodificación especulativa desactivados.

## Requisitos de hardware

- VRAM estimada para inferencia: 22,2 GB solo para pesos; hay que añadir KV cache y overhead del runtime.
- GPU recomendadas: NVIDIA H100 o H200 (sm90), obligatorias por el kernel W4A8 de vLLM, que requiere compute capability 9.0.
- GPUs consumer: no compatible con RTX 4090 ni otras GPUs de compute capability inferior a 9.0 para el kernel W4A8 de vLLM.
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A8`) y transformers; llama.cpp, Ollama o TGI no están indicados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Construcción de la cuantización: reproducible en 1× H100 (80 GB) con QDA 0.1.0.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Tamaño de pesos | Precisión relativa |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W4A8 | 35.951.822.704 | no disponible | Apache-2.0 | 22,2 GB | 98,6 % del BF16 |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35.951.822.704 | no disponible | Apache-2.0 | 71,9 GB | referencia |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar esta cuantización con su modelo base en BF16. No se han proporcionado datos de otras alternativas comparables.

## Limitaciones y advertencias

- Restricción de hardware: el kernel W4A8 de vLLM solo funciona en GPUs NVIDIA Hopper (H100/H200, sm90); no es desplegable en GPUs consumer ni en arquitecturas anteriores.
- Pérdida de precisión: la cuantización conserva el 98,6 % de la precisión media, con la mayor caída en LiveCodeBench (81,4 → 79,0, una pérdida de 2,4 puntos).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales de los modelos generativos.
- Idiomas soportados: no disponibles; no se puede garantizar el rendimiento multilingüe.
- Longitud de contexto: no disponible; conviene verificarla en la model card del modelo base antes de usarla en producción.
- Reproducibilidad: los pesos reconstruidos con la receta no son idénticos bit a bit a este checkpoint.
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial; conviene revisar igualmente las condiciones del modelo base Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta e insumos: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta concreta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.6-35B-A3B-W4A8/qwen3.6-35b-a3b-w4a8.yaml
