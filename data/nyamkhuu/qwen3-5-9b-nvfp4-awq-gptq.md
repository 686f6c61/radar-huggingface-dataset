# nyamkhuu/Qwen3.5-9B-NVFP4-AWQ-GPTQ

## Resumen

Qwen3.5-9B-NVFP4-AWQ-GPTQ es una versión cuantizada del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nyamkhuu. El modelo base lo desarrolla el equipo Qwen (Alibaba) y esta cuantización aplica una receta combinada de AWQ y GPTQ mediante llm-compressor 0.15.0 para producir un checkpoint en formato compressed-tensors con pesos NVFP4 (W4A4) y FP8. El resultado está pensado para servir el modelo en vLLM y SGLang sobre hardware Blackwell con soporte de FP4 nativo.

El checkpoint conserva la naturaleza image-text-to-text del modelo original (pipeline `image-text-to-text`), de modo que mantiene la torre de visión en BF16 mientras cuantiza las proyecciones del transformer de lenguaje. El repositorio ocupa 9,5 GB y declara 7.539.175.168 parámetros reales en safetensors, aunque el nombre comercial del modelo base es "9B".

Su relevancia es práctica: según los datos del autor, la variante NVFP4 alcanza 160 tokens/s por usuario en vLLM frente a 83 tokens/s en BF16 sobre una única NVIDIA RTX PRO 6000 Blackwell, prácticamente duplicando el throughput con una degradación mínima en las evaluaciones publicadas (MATH-100, GPQA-D-100, BFCL y JSON mode). Es, por tanto, una ficha orientada a despliegue de alto rendimiento más que a investigación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas Gated DeltaNet y cabeza MTP; detalles completos del modelo base no disponibles |
| Parametros totales | 7.539.175.168 (safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en los comandos de servicio del autor; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4: valores FP4 con escala FP8 por cada 16 valores) en MLPs de capas 0–27; FP8 dinámico en atención, proyecciones Gated DeltaNet, `lm_head` y MLPs de capas 28–31; KV-cache FP8 estática por tensor; BF16 en torre de visión, embeddings, gates Gated DeltaNet de ancho 32, `conv1d`, normas y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM y SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal de tipo image-text-to-text. La model card de esta cuantización menciona explícitamente componentes propios de la arquitectura Qwen3.5: proyecciones Gated DeltaNet, una cabeza MTP (multi-token prediction), una torre de visión y una `lm_head`. No se detalla en la información disponible el número de capas totales, la composición del dataset de preentrenamiento ni si el modelo base pasó por RLHF o DPO.

La innovación de esta ficha está en la receta de cuantización. Se aplica AWQ seguido de GPTQ con dos grupos de precisión: los MLPs de las capas 0–27 se cuantizan a NVFP4 (valores de 4 bits con escala FP8 compartida por cada 16 valores) y el resto de proyecciones sensibles —atención, Gated DeltaNet, `lm_head` y MLPs de las capas 28–31— a FP8 dinámico. La calibración usa 256 muestras de hasta 8.192 tokens extraídas de un conjunto de 2.048 muestras con trazas de razonamiento del propio modelo, llamadas a herramientas, chat multi-turno y datos de instrucciones, renderizadas con su chat template. La torre de visión, embeddings, gates, `conv1d`, normas y cabeza MTP se mantienen en BF16. El autor verifica en vLLM 0.33 y SGLang 0.5.23 que los kernels cargados corresponden a los pesos almacenados (`FlashInferCutlassNvFp4LinearKernel` ×56 y `CutlassFP8ScaledMMLinearKernel` ×73 en vLLM; `CompressedTensorsW4A4Fp4` ×56 y `CompressedTensorsW8A8Fp8` ×73 en SGLang) y que la KV-cache FP8 usa las escalas del checkpoint en 8/8 capas.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte del chat template del modelo base.
- Razonamiento con modo thinking, limitable por tokens (las evaluaciones del autor lo capan a 16.384 tokens).
- Entrada de imágenes: el pipeline declarado es image-text-to-text y la torre de visión se conserva en BF16.
- Tool calling / function calling: los comandos de servicio habilitan `--enable-auto-tool-choice` con parser `qwen3_coder`, y la evaluación BFCL v3 confirma soporte.
- Salida estructurada en JSON: evaluada con NousResearch/json-mode-eval (78% de coincidencia exacta).
- Capacidades matemáticas y de razonamiento científico evaluadas vía MATH-100 y GPQA-D-100.
- Razonamiento multi-paso y uso en agentes: el parser de razonamiento `qwen3` está habilitado en ambos motores de servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de alto throughput en producción: con 160 tokens/s por usuario y 6.320 tokens/s en pico en vLLM sobre una RTX PRO 6000 Blackwell, es adecuado para servir chat a muchos usuarios concurrentes con una sola GPU.
- Asistentes con tool calling: el soporte verificado de BFCL v3 (91,6% en vLLM NVFP4) y los parsers `qwen3_coder` permiten integrarlo en agentes que invocan APIs, bases de datos o funciones internas.
- Generación de JSON estructurado: útil en pipelines que necesitan salidas parseables (extracción de datos, clasificación, rellenado de formularios) con un 78% de coincidencia exacta en json-mode-eval.
- Razonamiento matemático y científico asistido: MATH-100 al 80% y GPQA-D-100 al 40% lo hacen viable para tutores, verificación de cálculos y apoyo a investigación, siempre con revisión humana.
- Procesamiento de documentos con imagen: al conservar la torre de visión en BF16, puede extraer información de capturas, gráficos o formularios escaneados en flujos OCR+razonamiento.
- Ampliación de capacidad de KV-cache: la KV-cache FP8 permite 3.475.865 tokens de caché en vLLM frente a 1.746.137 en BF16, lo que facilita contextos largos y muchas sesiones simultáneas en el mismo hardware.
- Evaluación de recetas de cuantización: el repositorio del autor incluye código y resultados completos, por lo que sirve como referencia reproducible para equipos que quieran replicar NVFP4+FP8 en otros modelos.

## Benchmarks y rendimiento

Datos publicados por el autor sobre una NVIDIA RTX PRO 6000 Blackwell, con 1.024 tokens de entrada y 512 de salida. MATH y GPQA usan thinking capado a 16.384 tokens (±5 puntos de error estándar con n=100); BFCL v3 non-live con 1.000 preguntas; JSON es NousResearch/json-mode-eval.

| Motor | Variante | Tokens/s por usuario | Tokens/s pico | Tokens de KV-cache | MATH-100 | GPQA-D-100 | BFCL | JSON exacto |
|---|---|---|---|---|---|---|---|---|
| vLLM | NVFP4 | 160 | 6.320 | 3.475.865 | 80% | 40% | 91,6% | 78% |
| vLLM | BF16 | 83 | 4.004 | 1.746.137 | 81% | 37% | 91,7% | 78% |
| SGLang | NVFP4 | 132 | 5.062 | 2.562.979 | 82% | 38% | 90,8% | 78% |
| SGLang | BF16 | 85 | 3.346 | 1.126.073 | 81% | 39% | 91,1% | 78% |

No se han publicado en la información disponible resultados de benchmarks del modelo base frente a modelos de la competencia (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 9,5 GB, por lo que el checkpoint en NVFP4/FP8 ocupa ese orden de magnitud; hay que sumar la KV-cache FP8 y el espacio de activaciones.
- GPU verificadas por el autor: NVIDIA RTX PRO 6000 Blackwell (una unidad), con soporte de FP4 nativo.
- GPU recomendadas: cualquier GPU Blackwell con soporte NVFP4 (RTX PRO 6000 Blackwell, B200, GB200). En GPUs sin soporte FP4 el checkpoint no podrá explotar los kernels NVFP4.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen. El tamaño de pesos (~9,5 GB) cabría en GPUs de 16–24 GB, pero los kernels NVFP4 requieren arquitectura Blackwell; no se ha verificado su funcionamiento en RTX 50xx ni en GPUs Ampere/Ada.
- Opciones de despliegue: vLLM 0.33 y SGLang 0.5.23 son los motores verificados. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 160 tokens/s por usuario y 6.320 tokens/s en pico en vLLM NVFP4; 132 tokens/s y 5.062 tokens/s en SGLang NVFP4.
- Contexto de servicio: los comandos del autor fijan `--max-model-len 32768` en vLLM y `--context-length 32768` en SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Motor verificado | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-AWQ-GPTQ (esta ficha) | 7.539.175.168 | 32.768 en servicio | NVFP4 + FP8 + BF16 mixto | apache-2.0 | vLLM 0.33, SGLang 0.5.23 | 160 tok/s usuario, MATH-100 80%, BFCL 91,6% |
| Qwen/Qwen3.5-9B (BF16) | no disponible en la información | no disponible | BF16 | apache-2.0 (según modelo base) | vLLM, SGLang | 83 tok/s usuario, MATH-100 81%, BFCL 91,7% |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas de otros fabricantes en la información proporcionada, por lo que la comparativa se limita al modelo base en BF16 y a la ausencia de datos de otras cuantizaciones.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar del modelo base Qwen, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Alucinación: no hay evaluación específica de tasas de alucinación; los benchmarks publicados (MATH, GPQA, BFCL, JSON) no la miden.
- Idiomas: no se especifica la lista de idiomas soportados; no se puede confirmar cobertura multilingüe más allá de lo que herede el modelo base.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen/Qwen3.5-9B antes de producción.
- Hardware: los kernels NVFP4 requieren GPU Blackwell; en arquitecturas anteriores el checkpoint no funcionará con el rendimiento publicado o directamente no cargará.
- Precisión: GPQA-D-100 baja de 37% (BF16) a 40% (NVFP4) en vLLM según el autor, dentro del margen de error de ±5 puntos con n=100; no debe interpretarse como mejora real. Las evaluaciones tienen tamaños de muestra pequeños (100–1.000 preguntas).
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un autor individual, no del equipo oficial de Qwen. No hay garantía de mantenimiento ni de soporte.
- Compatibilidad: solo se verifican vLLM 0.33 y SGLang 0.5.23; otras versiones o motores (llama.cpp, Ollama, TGI) no están probados.
- Contexto: los 32.768 tokens son la configuración de servicio del autor, no necesariamente el máximo nativo del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyamkhuu/Qwen3.5-9B-NVFP4-AWQ-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio con código, método y resultados: https://github.com/d-nyamkhuu/qwen3.5-quantization
- llm-compressor: https://github.com/vllm-project/llm-compressor
