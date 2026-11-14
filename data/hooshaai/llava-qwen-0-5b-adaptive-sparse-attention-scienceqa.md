# Hooshaai/llava-qwen-0.5b-adaptive-sparse-attention-scienceqa

## Resumen
llava-qwen-0.5b-adaptive-sparse-attention-scienceqa es un modelo de vision-lenguaje (VLM) derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor Hooshaai bajo el ecosistema NeuralOps. El modelo combina un codificador visual SigLIP congelado, un proyector MLP multimodal y un decodificador de lenguaje Qwen2 de 24 capas (D=1024, H=16) en el que se han sustituido 18 de las 24 capas de atencion por el operador `adaptive_sparse_attention` mediante una cirugia de atencion con patron `hybrid_3_1` (18 capas transplantadas y 6 capas cuadraticas ancla en los indices 3, 7, 11, 15, 19 y 23).

El modelo se ha destilado sobre el subconjunto con imagenes del dataset ScienceQA (`derek-thomas/ScienceQA`), un benchmark de razonamiento visual multimodal de caracter cientifico. Su relevancia radica en que permite evaluar como un mecanismo subcuadratico de atencion dispersa adaptativa (top-k dinamico y umbral) maneja el enrutamiento denso entre tokens visuales y textuales, manteniendo congelado el tower de vision para aislar el efecto de la cirugia en el decodificador.

Se trata de un modelo de investigacion de 0.5B parametros, con licencia MIT, orientado a experimentacion con arquitecturas de atencion eficiente y no a despliegues de produccion generalistas. El checkpoint publicado contiene unicamente los pesos de atencion y layernorm transplantados (570,67 MB en FP16), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA (SigLIP vision encoder + MLP projector + decodificador Qwen2 con atencion dispersa adaptativa) |
| Parametros totales | 0.5B (modelo base llava-interleave-qwen-0.5b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, 570,67 MB) + configs de processor y tokenizer |
| Libreria | neuralops |
| Modelo base | llava-hf/llava-interleave-qwen-0.5b-hf |
| Geometria del decodificador | 24 capas, D=1024, H=16, d_h=64 |
| Capas con atencion dispersa | 18 de 24 (patron hybrid_3_1) |
| Capas cuadraticas ancla | 6 (indices 3, 7, 11, 15, 19, 23) |
| Vision tower | SigLIP, congelado |
| Proyector multimodal | MLP de 2 capas, congelado |
| Dataset de destilacion | derek-thomas/ScienceQA (subconjunto con imagenes) |
| Tamano del repo | 1.2 GB |

## Arquitectura y entrenamiento
La arquitectura sigue el esquema `LlavaForConditionalGeneration`: los parches visuales extraidos por el tower SigLIP se intercalan con los tokens de texto dentro de `language_model.model.layers`. El vision tower y el proyector multimodal permanecen completamente congelados durante todo el proceso, de modo que el experimento aisla el comportamiento del operador `adaptive_sparse_attention` en el decodificador. Este operador implementa atencion dispersa adaptativa con top-k dinamico y umbral, adaptadores LoRA, extraccion de pesos multiarquitectura, embeddings rotatorios RoPE, mascaras causales y bidireccionales, e inyeccion segura de pesos.

El entrenamiento consistio en una destilacion de conocimiento (KD) en dos etapas sobre preguntas con imagen de ScienceQA: 46 pasos en la etapa 1 y 87 pasos en la etapa 2, con un total de 133 pasos de optimizacion. La duracion fue de 120,3 segundos con un pico de VRAM de 19.440 MB en una NVIDIA RTX 3090 de 24 GB. La cirugia `hybrid_3_1` reemplaza 18 capas de atencion manteniendo 6 capas cuadraticas como ancla, lo que preserva parte de la capacidad de atencion densa original mientras el resto opera con dispersion adaptativa.

## Capacidades
- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de pregunta-respuesta visual.
- Razonamiento visual multimodal sobre contenido cientifico y diagramas, segun el dataset de entrenamiento (ScienceQA).
- Respuesta conversacional de un turno en formato VQA.
- Razonamiento basico sobre el contenido de la imagen combinado con la pregunta textual.
- Capacidad de operar con atencion dispersa adaptativa, lo que reduce el coste computacional de la atencion en las capas transplantadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (thinking mode, audio, vision adicional): vision integrada via SigLIP; no se documentan otras.

## Casos de uso
- Investigacion sobre atencion eficiente: el modelo sirve como banco de pruebas controlado para medir el impacto de sustituir atencion cuadratica por `adaptive_sparse_attention` en un VLM, manteniendo el vision tower congelado para aislar la variable.
- Evaluacion de destilacion de conocimiento en VLMs: permite comparar el rendimiento pre-KD (41,25% de accuracy) frente al post-KD (53,75%) y analizar la recuperacion de capacidad tras la cirugia.
- Experimentos de cirugia de atencion (attention surgery): util para validar patrones hibridos como `hybrid_3_1` y estudiar el papel de las capas ancla cuadraticas en el enrutamiento cross-modal.
- Prototipado de VQA cientifica en entornos de investigacion: responde preguntas sobre imagenes de ScienceQA con una perplexity de respuesta de 2,85, adecuado para iterar sobre pipelines de evaluacion.
- Benchmarking de operadores NeuralOps: integrable via `neuralops.hub.load_surgeried_model` para comparar distintos operadores de atencion sobre la misma base.
- Docencia y reproduccion de experimentos: el checkpoint ligero (570 MB de pesos de atencion) y el bajo coste de entrenamiento (120 s en RTX 3090) facilitan la reproduccion en laboratorios con hardware consumer.
- Analisis de transferencia vision-lenguaje: estudiar como un decodificador de 0.5B con atencion dispersa maneja tokens visuales densos frente a un baseline cuadratico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados) sobre `derek-thomas/ScienceQA`, split validation, subconjunto con imagenes:

| Metrica | Teacher baseline (llava-interleave-qwen-0.5b) | Pre-KD zero-shot (adaptive_sparse_attention) | Post-KD destilado (adaptive_sparse_attention) | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 63,75 | 41,25 | 53,75 | +12,50 |
| Perplexity de respuesta condicionada por imagen | 2,45 | 3,10 | 2,85 | -0,25 |

Telemetria de entrenamiento: 133 pasos de optimizacion (46 en etapa 1, 87 en etapa 2), 120,3 s de duracion, pico de 19.440 MB de VRAM en RTX 3090 24 GB, timestamp 2026-11-11T04:42:56Z.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 0.5B en FP16 requiere aproximadamente 1-2 GB de VRAM; el pico documentado durante el entrenamiento fue de 19.440 MB en RTX 3090, pero corresponde al proceso de destilacion, no a inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; el entrenamiento documentado se realizo en una NVIDIA RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 3090 o superiores, dado el tamano de 0.5B.
- Opciones de despliegue: la libreria `neuralops` (via `neuralops.hub.load_surgeried_model`) y `transformers` con `LlavaForConditionalGeneration` aplicando la cirugia de atencion. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA Visual Acc (%) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-adaptive-sparse-attention-scienceqa | 0.5B | no disponible | 53,75 (post-KD) | MIT | Hugging Face (pesos de atencion) |
| llava-interleave-qwen-0.5b-hf (teacher baseline) | 0.5B | no disponible | 63,75 | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0.5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo documentado es el modelo base del que deriva, que actua como teacher baseline con una accuracy de 63,75% frente al 53,75% del modelo destilado. No se dispone de datos de otros VLMs de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias
- El checkpoint publicado contiene unicamente los pesos de atencion y layernorm (570,67 MB), no el modelo completo; es necesario cargar el base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugia para usarlo.
- Rendimiento inferior al teacher baseline: 53,75% frente a 63,75% de accuracy en ScienceQA, una perdida de 10 puntos tras la destilacion.
- Entrenamiento muy corto (133 pasos, 120 s), lo que limita la generalizacion mas alla del dataset ScienceQA.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Entrenado exclusivamente sobre preguntas con imagen de ScienceQA; el dominio esta acotado a razonamiento visual cientifico y puede degradarse fuera de el.
- Riesgo de alucinacion inherente a modelos de 0.5B con entrenamiento limitado; no se documentan evaluaciones de sesgo ni de robustez.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT permite uso comercial, pero el modelo base subyacente puede tener condiciones propias que deben verificarse.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- No se documenta soporte para frameworks de despliegue estandar (vLLM, TGI, llama.cpp), lo que limita su uso en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-adaptive-sparse-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de AdaptiveSparseAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/adaptive_sparse_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
