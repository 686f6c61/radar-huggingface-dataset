# qda-lab/QDA-Qwen3.5-9B-W4A4

## Resumen

QDA-Qwen3.5-9B-W4A4 es una cuantizacion NVFP4 (4 bits en pesos y 4 bits en activaciones, W4A4) del modelo multimodal Qwen/Qwen3.5-9B, desarrollada por qda-lab mediante su herramienta QDA (Closed-Loop LLM Quantization Design with Agents). El objetivo es reducir el coste de inferencia de un modelo de 9.650 millones de parametros manteniendo la mayor parte de su calidad original: el checkpoint pasa de 19,3 GB en BF16 a 9,4 GB, un factor de 2,1x de reduccion, conservando segun el autor el 95,2 % de la precision del modelo base.

El modelo hereda la arquitectura de Qwen3.5, que combina capas de atencion con Gated DeltaNet (mencionadas en la model card) y un torre de vision, lo que lo situa en la categoria image-text-to-text. Al ser una cuantizacion, no aporta capacidades nuevas respecto al modelo base: su relevancia esta en hacer viable el despliegue de un modelo de ~9,6B con vision y modo de razonamiento en GPUs NVIDIA Blackwell (B200, GB300, RTX PRO 6000) con formatos FP4 nativos, donde el ahorro de memoria y el mayor throughput de las unidades FP4 son determinantes.

La ficha se centra en los datos publicados por el autor (evaluacion comparativa frente a BF16 y frente a la cuantizacion NVFP4 de RedHatAI) y en las especificaciones tecnicas deducibles del repositorio. Cualquier dato no presente en la informacion disponible se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5, con capas Gated DeltaNet y torre de vision (detalles completos de la arquitectura base no disponibles) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4: pesos E2M1 con escala E4M3 por cada 16 entradas y escala tensorial FP32; activaciones cuantizadas en tiempo de ejecucion con el mismo esquema. `in_proj_a`/`in_proj_b` de Gated DeltaNet, `lm_head`, embeddings y torre de vision permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y transformers; pensado para vLLM) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento, no un modelo entrenado desde cero. El modelo base Qwen3.5-9B emplea una arquitectura hibrida que incluye capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) junto con atencion estandar y una torre de vision, segun se desprende de la descripcion del proceso de cuantizacion. El pipeline es image-text-to-text, por lo que el modelo procesa imagenes y texto de forma conjunta.

El proceso de cuantizacion, descrito en la model card, aplica NVFP4 a todas las capas lineales del decoder: pesos en formato E2M1 con una escala E4M3 compartida por cada grupo de 16 entradas y una escala tensorial FP32; las activaciones se cuantizan en tiempo de ejecucion con el mismo esquema. Los pesos se obtuvieron con GPTQ (act-order estatico y recorte MSE adaptado a FP4), y la busqueda de configuracion mantuvo el tamano de una build NVFP4 estandar y eligio el metodo. Ciertos modulos se mantienen en BF16 por sensibilidad: `in_proj_a` e `in_proj_b` de Gated DeltaNet, `lm_head`, embeddings y la torre de vision. El autor indica que un rebuild desde la receta en una GB300 fue byte-identico al checkpoint publicado, con un tiempo de reconstruccion de unos 15 minutos. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (la evaluacion se realizo con thinking mode activado).
- Razonamiento matematico competitivo: resultados en AIME 2025 y HMMT Feb 2026.
- Razonamiento cientifico de nivel avanzado: evaluado en GPQA-Diamond.
- Generacion de codigo: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision mantenida en BF16.
- Conocimiento general y multidisciplinar: evaluado en MMLU-Pro.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento matematico asistido en entornos de investigacion: el modelo conserva 80,5 puntos en AIME 2025 frente a 85,3 en BF16, por lo que puede usarse para resolver problemas de competicion o verificar demostraciones en pipelines donde el ahorro de memoria permite mayor paralelismo por GPU.
- Analisis de documentos cientificos con imagenes: al ser image-text-to-text, puede procesar figuras, tablas y texto de papers; el despliegue en FP4 permite servir varias instancias en una sola GPU Blackwell para revisiones por lotes.
- Generacion de codigo en produccion: con 64,7 puntos en LiveCodeBench, es adecuado para autocompletado y generacion de funciones en IDE o pipelines de CI/CD, siempre que se valide el codigo generado; el formato NVFP4 encaja en vLLM para servir peticiones concurrentes.
- Evaluacion automatizada de calidad de respuestas: el modo thinking y los buenos resultados en IFBench (65,7) permiten usarlo como juez o generador de respuestas de referencia en pipelines de evaluacion de LLMs, con menor coste de VRAM que el BF16.
- Despliegue en estaciones de trabajo con RTX PRO 6000: al caber en 9,4 GB de pesos, deja amplio margen de VRAM para KV cache y contexto largo en una GPU profesional Blackwell de un solo nodo, habilitando asistentes locales con vision.
- Servicio de razonamiento cientifico de bajo coste: con 78,9 en GPQA-Diamond, puede atender consultas de dominio STEM en produccion donde el presupuesto de GPU es limitado, aceptando una perdida de ~3 puntos frente a BF16.
- Prototipado e investigacion en cuantizacion: la receta reproducible (QDA 0.1.0, dataset de inputs y rebuild byte-identico) permite experimentar con variantes de cuantizacion sobre Qwen3.5-9B sin partir de cero.

## Benchmarks y rendimiento

Resultados publicados por el autor. Thinking mode, pass@1 promediado sobre los draws indicados; temperatura 1,0, top-p 0,95, top-k 20, presence-penalty 1,5. Mismos problemas, semillas, muestreo y limites de salida para todos los modelos.

| Benchmark | Problemas x draws | Limite de salida | BF16 (19,3 GB) | QDA W4A4 (9,4 GB) | RedHatAI NVFP4 (9,4 GB) |
|---|---:|---:|---:|---:|---:|
| AIME 2025 | 30 x 32 | 81.920 | 85,3 | 80,5 | 76,9 |
| HMMT Feb 2026 | 33 x 32 | 81.920 | 68,9 | 64,0 | 59,8 |
| GPQA-Diamond | 198 x 16 | 81.920 | 82,2 | 78,9 | 77,4 |
| IFBench | 300 x 16 | 81.920 | 66,9 | 65,7 | 62,5 |
| MMLU-Pro | 12.032 x 1 | 32.768 | 81,0 | 79,8 | 79,5 |
| LiveCodeBench | 454 x 4 | 81.920 | 71,1 | 64,7 | 61,2 |
| **Media** | | | **75,9** | **72,3** | **69,5** |

La cuantizacion QDA supera a la NVFP4 de RedHatAI en los seis benchmarks y en la media (72,3 frente a 69,5), con la mayor ventaja en LiveCodeBench (+3,5) y HMMT (+4,2). La perdida media frente a BF16 es de 3,6 puntos.

## Requisitos de hardware

- VRAM para pesos: 9,4 GB en NVFP4 (frente a 19,3 GB en BF16). La VRAM total necesaria depende de la KV cache y del contexto, no disponibles.
- GPUs soportadas: NVIDIA Blackwell con FP4 nativo, es decir, B200, GB300 y RTX PRO 6000. La evaluacion se realizo con vLLM 0.33.0 sobre GB300.
- GPUs consumer: no disponible; no se menciona compatibilidad con RTX 40xx o 50xx, y el formato NVFP4 requiere hardware Blackwell.
- Despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.5-9B-W4A4`). El repo es compatible con transformers y compressed-tensors; no se indica soporte de llama.cpp, Ollama ni TGI.
- Reconstruccion de la cuantizacion: QDA 0.1.0, Linux, una GPU Blackwell y uv; unos 15 minutos en una GB300.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| QDA-Qwen3.5-9B-W4A4 | ~9,65B | NVFP4 W4A4 (9,4 GB) | no disponible | 72,3 | Apache-2.0 | Hugging Face (vLLM, Blackwell) |
| RedHatAI NVFP4 de Qwen3.5-9B | ~9,65B | NVFP4 (9,4 GB) | no disponible | 69,5 | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (BF16) | ~9,65B | BF16 (19,3 GB) | no disponible | 75,9 | Apache-2.0 | Hugging Face |

La comparativa se limita a las tres variantes evaluadas por el autor. No se dispone de datos de benchmarks de otros modelos de tamano similar en la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Perdida de precision respecto a BF16: 3,6 puntos de media, con caidas notables en LiveCodeBench (71,1 a 64,7) y AIME 2025 (85,3 a 80,5). No es recomendable para tareas de codigo o matematicas donde cada punto cuente sin validacion adicional.
- Dependencia de hardware: el formato NVFP4 solo se ejecuta de forma nativa en GPUs NVIDIA Blackwell. No es desplegable en A100, H100 ni GPUs consumer sin soporte FP4.
- Idiomas soportados: no disponibles; no se puede garantizar el rendimiento multilingue sin evaluacion propia.
- Longitud de contexto: no disponible; el autor no publica la ventana de contexto del modelo base ni el impacto de la cuantizacion en contextos largos.
- Sesgos y alucinaciones: no se documentan sesgos especificos; al ser una cuantizacion de Qwen3.5-9B, hereda los sesgos y el riesgo de alucinacion del modelo base, no evaluados en esta ficha.
- Tool calling y agentes: no se confirma soporte en la informacion disponible; verificar antes de integrar en pipelines agenticos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de la herramienta QDA por si imponen restricciones adicionales.
- Reproducibilidad: el rebuild requiere QDA 0.1.0 y una GPU Blackwell; el autor afirma que fue byte-identico en GB300, pero no se ha verificado de forma independiente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de inputs de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
