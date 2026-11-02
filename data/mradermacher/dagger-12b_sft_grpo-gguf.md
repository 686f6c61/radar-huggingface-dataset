# mradermacher/dagger-12B_SFT_GRPO-GGUF

## Resumen

Dagger-12B_SFT_GRPO-GGUF es la versión cuantizada en formato GGUF del modelo Dagger-12B_SFT_GRPO, desarrollado originalmente por dipta007 y distribuido en este formato por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 11.770 millones de parámetros, afinado mediante SFT (supervised fine-tuning) y GRPO (Group Relative Policy Optimization), orientado específicamente a tareas de razonamiento matemático con conciencia de distractores y a escenarios de bajos recursos lingüísticos, con especial énfasis en bengalí (bn) e inglés (en).

El modelo se construye sobre una arquitectura transformer de tipo denso (no MoE), con 11.766.034.176 parámetros totales según los pesos safetensors del modelo base. Su propuesta diferencial es el entrenamiento sobre los datasets `dipta007/dagger` y `dipta007/DistractMath-Bn`, que introducen problemas matemáticos con información distractora, una capacidad poco común en modelos de su tamaño y especialmente escasa para el bengalí.

Esta ficha cubre la versión GGUF, que incluye cuantizaciones estáticas desde Q2_K hasta Q8_0, además de complementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere capacidades de visión en el modelo base. La licencia es Gemma, lo que condiciona su uso comercial a los términos de Google. Es relevante ahora por su enfoque en razonamiento matemático robusto frente a distractores y por cubrir una lengua de bajos recursos como el bengalí con un modelo de 12B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de la familia Gemma, según licencia y nomenclatura) |
| Parámetros totales | 11.766.034.176 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | bengalí (bn), inglés (en) |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 12B parámetros. El sufijo del nombre indica un pipeline de entrenamiento en dos fases: primero SFT (supervised fine-tuning) y después GRPO, una variante de optimización por preferencias basada en grupos que refuerza la calidad del razonamiento. Los datasets empleados son `dipta007/dagger` y `dipta007/DistractMath-Bn`, este último centrado en problemas matemáticos con distractores en bengalí. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni la configuración de RLHF/DPO más allá de la mención a GRPO.

La presencia de ficheros mmproj (multi-modal supplement) en las cuantizaciones indica que el modelo base incorpora un codificador multimodal, presumiblemente para entrada de imágenes, aunque no se detalla en la información disponible qué tipo de modalidad ni cómo se integró durante el entrenamiento. La model card del repositorio GGUF no incluye detalles sobre innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático, con entrenamiento específico en problemas con distractores.
- Razonamiento multi-paso orientado a la resolución de problemas computacionales y de grafos computacionales (tag `computational-graph`).
- Capacidades multimodales: la presencia de ficheros mmproj sugiere soporte de entrada visual, aunque no se detalla su alcance.
- Soporte multilingüe limitado a bengalí e inglés.
- Conciencia de distractores (distractor-aware): capacidad entrenada para ignorar información irrelevante en el enunciado de un problema.
- Conversacional: etiquetado como `conversational` y compatible con endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el entrenamiento con GRPO sugiere razonamiento reforzado.

## Casos de uso

- Resolución de problemas matemáticos en bengalí: el modelo está entrenado específicamente con `DistractMath-Bn`, por lo que puede resolver ejercicios con información distractora en esta lengua, un caso poco cubierto por modelos generalistas.
- Tutoría educativa bilingüe (bn/en): puede gestionar explicaciones paso a paso de problemas matemáticos para estudiantes bengalíes, aprovechando su entrenamiento en razonamiento multi-paso.
- Evaluación automática de ejercicios con distractores: útil en plataformas de evaluación donde los enunciados incluyen datos irrelevantes que el modelo debe descartar.
- Razonamiento sobre grafos computacionales: el tag `computational-graph` sugiere aplicaciones en análisis de dependencias y planificación de cómputo.
- Procesamiento de documentos con componentes visuales: gracias a los ficheros mmproj, podría emplearse en tareas que combinen texto e imagen, como la lectura de problemas manuscritos o diagramas.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (7,4 GB) y Q4_K_S (7,0 GB) permiten ejecución en GPUs de consumo con 8-12 GB de VRAM.
- Investigación en modelos de bajos recursos: como referencia para estudiar técnicas de SFT + GRPO aplicadas a lenguas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Añadir ~0,7-1,0 GB si se usa el complemento multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con margen amplio; RTX 3090/4080 (16-24 GB) para Q5_K_M o Q6_K; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde Q4_K_S (7,0 GB) en GPUs de 8 GB con contexto moderado, y Q4_K_M en GPUs de 12 GB con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dagger-12B_SFT_GRPO | 11,77B | no disponible | bn, en | Gemma | Matemáticas con distractores, bajos recursos |
| Gemma 2 9B | ~9B | no disponible | multilingüe | Gemma | Propósito general |
| Qwen2.5-Math 7B | ~7B | no disponible | en, zh | Apache 2.0 | Matemáticas |
| Llama 3.1 8B | ~8B | no disponible | multilingüe | Llama 3.1 | Propósito general |

La comparativa se ofrece a nivel cualitativo; no se dispone de datos de rendimiento comparativo en la información proporcionada. Dagger destaca por su cobertura del bengalí y su entrenamiento específico en distractores, frente a alternativas generalistas o centradas en inglés/chino.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en bengalí e inglés, puede tener un rendimiento deficiente en otras lenguas.
- Riesgo de alucinación: presente como en cualquier LLM; en matemáticas puede producir razonamientos plausibles pero incorrectos, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta planificar despliegues con prompts largos.
- Restricciones de licencia: licencia Gemma de Google; el uso comercial está sujeto a los términos de Google y a posibles restricciones de redistribución.
- Caveat para producción: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente el razonamiento matemático; se recomienda Q4_K_M o superior para tareas de precisión.
- El modelo es una cuantización de terceros (mradermacher); la calidad final depende de la fidelidad del proceso de cuantización respecto al modelo base.
- No se documenta soporte explícito de tool calling ni de agentes, por lo que no debe asumirse en integraciones que lo requieran.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dagger-12B_SFT_GRPO-GGUF
- Modelo base: https://huggingface.co/dipta007/dagger-12B_SFT_GRPO
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/dagger-12B_SFT_GRPO-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#dagger-12B_SFT_GRPO-GGUF
- Dataset Dagger: https://huggingface.co/datasets/dipta007/dagger
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
