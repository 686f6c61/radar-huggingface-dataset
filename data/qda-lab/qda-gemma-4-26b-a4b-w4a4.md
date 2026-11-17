# qda-lab/QDA-Gemma-4-26B-A4B-W4A4

## Resumen

QDA-Gemma-4-26B-A4B-W4A4 es una cuantización NVFP4 del modelo multimodal google/gemma-4-26B-A4B-it, publicada por qda-lab. Se trata de un checkpoint de tipo mixture-of-experts (MoE) con arquitectura Gemma 4, orientado a tareas image-text-to-text, que ha sido comprimido a 4 bits en pesos y activaciones (W4A4) manteniendo las proyecciones de atención en FP8. El resultado ocupa 16,9 GB frente a los 51,6 GB del modelo en BF16, es decir, una reducción de 3,1×, conservando según el autor el 97,6 % de la precisión del original.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamaño en GPUs de centro de datos NVIDIA Blackwell (B200, B300, GB200, GB300), donde el formato NVFP4 está soportado a nivel de hardware. Frente a otras cuantizaciones NVFP4 publicadas (NVIDIA, RedHatAI, unsloth), el autor reporta un promedio de 78,7 puntos en su suite de seis benchmarks, ligeramente por debajo de la de NVIDIA (79,3) pero por encima de RedHatAI (71,5) y unsloth (77,3).

La relevancia actual radica en que permite servir un modelo con ventana de contexto de 262.144 tokens y modo de razonamiento (thinking) en una sola GPU Blackwell, con una pérdida de calidad acotada y verificada empíricamente con 32 muestras por problema en benchmarks de matemáticas, ciencia, instrucciones y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), multimodal image-text-to-text |
| Parametros totales | 14.113.543.758 (según safetensors); el nombre comercial indica 26B-A4B |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos) |
| Longitud de contexto | 262.144 tokens (ventana de servicio usada en la evaluación) |
| Tipos de cuantizacion | NVFP4 (W4A4) en expertos y MLPs; FP8 W8A8 en proyecciones de atención; BF16 en routers, norms, embeddings y vision tower |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con capacidades multimodales (entrada de imagen y texto, salida de texto), identificado como Gemma 4 26B-A4B. La cuantización afecta a los expertos y MLPs, que se almacenan en NVFP4 con pesos E2M1, una escala E4M3 por cada 16 entradas y una escala tensorial FP32; las activaciones se cuantizan del mismo modo en tiempo de ejecución. Todas las proyecciones de atención son FP8 W8A8 (pesos por canal, activaciones dinámicas por token): q/k/v de todas las capas y o_proj de todas salvo la capa 15. Los routers, las normas, los embeddings y la torre de visión permanecen en BF16, y lm_head está atado a los embeddings.

Los pesos se cuantizaron con GPTQ aplicando clip MSE adaptado a FP4 y Hessianos de experto ponderados por router. La receta concreta se seleccionó mediante una búsqueda automatizada de QDA bajo un presupuesto de tamaño igual al del checkpoint de unsloth. Los datos de calibración son los mismos que los de la release anterior QDA-Gemma-4-26B-A4B-W4A16: 6.308 filas de texto, de las que el build lee 128 muestras de 2.048 tokens, verificadas sin solapamiento con el conjunto de test de MMLU-Pro. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat específica de Gemma 4.
- Razonamiento en modo thinking, con marcador de fin de razonamiento `<channel|>` que permite separar la cadena de pensamiento de la respuesta final.
- Razonamiento matemático de competición (AIME, HMMT) y científico de nivel graduado (GPQA-Diamond).
- Generación y razonamiento sobre código (LiveCodeBench).
- Seguimiento de instrucciones complejas verificables (IFBench, IFEval).
- Conocimiento general y razonamiento multidisciplinar (MMLU-Pro).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Ventana de contexto larga de hasta 262.144 tokens en servicio.
- No se dispone de información sobre soporte explícito de tool calling, function calling o comportamiento agéntico multi-paso en la documentación proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene 82,7 puntos en AIME 2025 tras la cuantización, por lo que puede emplearse en tutores o verificadores de problemas de competición con cadenas de pensamiento largas (hasta 32.768 tokens de salida).
- Análisis de documentos científicos y exámenes de nivel graduado: con 78,6 en GPQA-Diamond y contexto de 262.144 tokens, es adecuado para responder preguntas sobre papers o material técnico extenso en una sola pasada.
- Generación de código en pipelines de CI/CD: sus 80,2 puntos en LiveCodeBench permiten integrarlo en revisión automática de parches, generación de tests o explicación de diffs, siempre que el entorno de ejecución sea Blackwell.
- Asistentes conversacionales con imágenes: al conservar la torre de visión en BF16, puede describir, razonar y responder sobre capturas, diagramas o documentos escaneados en flujos de atención al cliente.
- Cumplimiento estricto de instrucciones en producción: los 79,9 puntos en IFBench indican que respeta formatos y restricciones verificables, útil para extracción estructurada o generación de informes con plantilla fija.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de NVFP4 frente a BF16 en un MoE multimodal, dado que el autor publica truncamiento, semillas y configuración de muestreo.
- Despliegue en una sola GPU Blackwell: al ocupar 16,9 GB, permite servir el modelo con vLLM 0.33.0 en un GB300 sin sharding, simplificando la infraestructura frente al BF16 de 51,6 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor, pass@1 con thinking mode, media sobre 32 muestras por problema (16 en GPQA, IFBench; 4 en LiveCodeBench; 1 en MMLU-Pro), en porcentaje ± 1 error estándar:

| Benchmark | BF16 (51,6 GB) | QDA W4A4 (16,9 GB) | NVIDIA NVFP4 (18,8 GB) | RedHatAI NVFP4 (16,4 GB) | unsloth NVFP4 (16,9 GB) |
|---|---:|---:|---:|---:|---:|
| AIME 2025 | 85,5 ± 5,1 | 82,7 ± 5,8 | 84,1 ± 5,4 | 70,1 ± 6,8 | 82,1 ± 5,8 |
| HMMT Feb 2026 | 71,6 ± 6,3 | 67,2 ± 6,6 | 68,7 ± 6,6 | 54,4 ± 7,3 | 64,0 ± 6,7 |
| GPQA-Diamond | 80,6 ± 2,3 | 78,6 ± 2,4 | 79,2 ± 2,4 | 75,2 ± 2,4 | 77,9 ± 2,5 |
| IFBench | 80,6 ± 1,9 | 79,9 ± 1,9 | 80,9 ± 1,9 | 78,1 ± 1,9 | 79,3 ± 1,9 |
| MMLU-Pro | 84,1 ± 0,3 | 83,4 ± 0,3 | 83,4 ± 0,3 | 80,2 ± 0,4 | 83,2 ± 0,3 |
| LiveCodeBench | 81,3 ± 1,6 | 80,2 ± 1,7 | 79,5 ± 1,7 | 70,9 ± 1,9 | 77,5 ± 1,7 |
| Promedio | 80,6 ± 1,5 | 78,7 ± 1,6 | 79,3 ± 1,5 | 71,5 ± 1,8 | 77,3 ± 1,6 |

Tasa de truncamiento (generaciones detenidas por límite de salida): 6,9 % de media para QDA W4A4, frente a 5,9 % en BF16, 5,8 % en NVIDIA, 11,2 % en RedHatAI y 7,1 % en unsloth. Todas las cifras proceden de ejecuciones propias del autor con vLLM 0.33.0 en una GB300, con temperatura 1,0, top-p 0,95, top-k 64 y tope de salida de 32.768 tokens.

## Requisitos de hardware

- VRAM estimada: 16,9 GB de pesos en NVFP4; el consumo real de inferencia añade caché KV y overhead del motor, no cuantificado en la documentación.
- GPUs soportadas: exclusivamente NVIDIA Blackwell de centro de datos (B200, B300, GB200, GB300), según el autor. No se garantiza funcionamiento en arquitecturas anteriores por la dependencia de NVFP4.
- No cabe en GPUs de consumo (RTX 4090, etc.) según la información disponible, dado que NVFP4 requiere hardware Blackwell.
- Despliegue: vLLM 0.33.0 con `vllm serve qda-lab/QDA-Gemma-4-26B-A4B-W4A4`; el formato compressed-tensors es compatible con el ecosistema vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamaño | Promedio suite | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| QDA-Gemma-4-26B-A4B-W4A4 | 16,9 GB | 78,7 | Apache 2.0 | Hugging Face (qda-lab) |
| NVIDIA NVFP4 | 18,8 GB | 79,3 | no disponible | Hugging Face (NVIDIA) |
| RedHatAI NVFP4 | 16,4 GB | 71,5 | no disponible | Hugging Face (RedHatAI) |
| unsloth NVFP4 | 16,9 GB | 77,3 | no disponible | Hugging Face (unsloth) |
| Gemma-4-26B-A4B-it BF16 | 51,6 GB | 80,6 | Apache 2.0 | Hugging Face (google) |

La comparativa se limita a las cuantizaciones del mismo modelo base evaluadas por el autor; no se dispone de datos de modelos de otras familias con los que contrastar.

## Limitaciones y advertencias

- Dependencia estricta de hardware NVIDIA Blackwell: no se puede ejecutar en GPUs Ampere, Hopper ni en tarjetas de consumo, lo que limita su portabilidad.
- Pérdida de precisión media de 1,9 puntos respecto a BF16, con mayor impacto en benchmarks de matemática de competición (AIME cae 2,8 puntos; HMMT, 4,4).
- Tasa de truncamiento superior a BF16 (6,9 % frente a 5,9 %), lo que puede afectar a tareas que requieran cadenas de razonamiento muy largas.
- El autor no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 convive con un enlace a la licencia de Gemma 4 de Google, por lo que conviene revisar las condiciones de uso comercial del modelo base antes de producción.
- Solo 2 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido y sin revisión independiente de los resultados.
- La calibración se realizó con 128 muestras de 2.048 tokens de un conjunto de 6.308 filas de texto; no se documenta calibración específica para visión, aunque la torre visual permanece en BF16.
- No hay información sobre tool calling, function calling ni comportamiento agéntico, por lo que no debe asumirse su soporte en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Gemma-4-26B-A4B-W4A4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Release anterior W4A16 (referencia de calibración): https://huggingface.co/qda-lab/QDA-Gemma-4-26B-A4B-W4A16
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
