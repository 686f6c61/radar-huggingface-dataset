# RedHatAI/Hy4-NVFP4

## Resumen
Hy4-NVFP4 es un checkpoint cuantizado en NVFP4 (FP4 E2M1) del modelo multimodal Hy4 de Tencent, publicado por RedHatAI. El modelo base es un transformer híbrido de tipo MoE (mezcla de expertos) con capacidad de entrada de texto, imagen y video, y salida de texto, orientado a tareas de razonamiento, generación de código y comprensión visual. Con 774.434.002.142 parámetros totales (~774B), se posiciona en la gama alta de modelos abiertos, aunque solo una fracción de esos parámetros se activa por token al ser MoE.

La relevancia de esta ficha concreta reside en la cuantización: RedHatAI ha aplicado el esquema NVFP4 de LLM Compressor sobre los expertos enrutados de las 77 capas MoE, manteniendo en BF16 el resto de componentes (atención, indexador DSA, capa densa inicial, expertos compartidos, routers, encoder de visión, adaptador, `lm_head` y el drafter de decodificación especulativa DFly2). Esto reduce el checkpoint de aproximadamente 1,55 TB a unos 447 GB, lo que hace viable su despliegue en hardware Blackwell con vLLM y paralelismo tensorial de 4 GPUs.

El modelo está pensado para inferencia en producción con vLLM, soporta tool calling, parser de razonamiento y decodificación especulativa, y está disponible bajo la licencia propietaria tencent-hy-license. Los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4VLForConditionalGeneration (transformer MoE multimodal, con atención MLA dispersa y decodificación especulativa DFly2) |
| Parametros totales | 774.434.002.142 (~774B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) en pesos y activaciones de expertos enrutados, con escalas FP8 E4M3 por cada 16 elementos y escala global FP32 por tensor; resto de capas en BF16 |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors con formato compressed-tensors (NVFP4); drafter DFly2 en BF16 |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos (MoE) con 77 capas MoE, una capa densa inicial y componentes de atención con indexador DSA (atención MLA dispersa). Incluye un encoder de visión y un adaptador para entrada de imagen y video, además de un drafter de decodificación especulativa DFly2 que acelera la generación. La arquitectura exacta del modelo base no se detalla en la información proporcionada más allá de la clase `HYV4VLForConditionalGeneration` y la presencia de expertos enrutados, expertos compartidos y routers.

El checkpoint NVFP4 se generó con LLM Compressor aplicando el esquema NVFP4 únicamente a los expertos enrutados, calibrado sobre 512 muestras del dataset `mlabonne/open-perfectblend` con longitud máxima de secuencia de 2048 y distribuido en 4 GPUs. Se usó el observer `nvfp4_expanded_imatrix`. Los tensores no expertos son bit a bit idénticos al checkpoint base, y el drafter DFly2 se copió sin cambios. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable (`no_think` y `high`, este último por defecto).
- Comprensión de imagen y video como entrada (pipeline image-text-to-text), con salida de texto.
- Soporte de tool calling / function calling mediante el parser `hy_v4` en vLLM.
- Soporte de agentes y razonamiento multi-paso a través de `--enable-auto-tool-choice` y parser de razonamiento.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Decodificación especulativa DFly2 incluida en el checkpoint (aunque vLLM solo la habilita para checkpoints FP8 y MXFP4 de Hy4).
- Capacidad de matemáticas y resolución de problemas, evidenciada por los resultados en GSM8K Platinum.

## Casos de uso
- Razonamiento matemático en producción: el modelo obtiene 96,28% en GSM8K Platinum (strict-match), por lo que puede emplearse en sistemas de resolución de problemas aritméticos y verificación de cálculos con razonamiento explícito configurable.
- Asistencia técnica con imágenes: al aceptar imagen y texto, puede gestionar consultas sobre capturas de pantalla, diagramas o documentación escaneada, devolviendo explicaciones textuales.
- Análisis de video en pipelines de inspección: con entrada de video (aunque la configuración de vLLM recomendada limita a 1 imagen y 0 videos por prompt), puede emplearse para resumir o describir contenido audiovisual en entornos controlados.
- Agentes con tool calling: integrado en vLLM con `--enable-auto-tool-choice` y el parser `hy_v4`, puede orquestar llamadas a APIs y funciones en flujos de automatización.
- Razonamiento científico y QA de alta exigencia: con 89,90% en GPQA Diamond (pass@1), es adecuado para asistentes de investigación que requieran respuestas razonadas en dominios técnicos.
- Despliegue en clústeres Blackwell: al estar cuantizado en NVFP4 y reducir el checkpoint a ~447 GB, permite servir el modelo con paralelismo tensorial 4 en 4x B300, lo que facilita su uso en entornos de inferencia de alta capacidad.
- Generación de código y tareas de desarrollo asistido: aunque no se publican benchmarks de código, el soporte de tool calling y razonamiento multi-paso lo hace utilizable en asistentes de programación con verificación de pasos.

## Benchmarks y rendimiento

| Categoría | Benchmark | RedHatAI/Hy4-NVFP4 | tencent/Hy4-FP8 | Recuperación |
|---|---|---|---|---|
| Razonamiento | GSM8K Platinum (strict-match) | 96,28% | 96,77% | 99,5% |
| Razonamiento | GPQA Diamond (pass@1) | 89,90% | 91,41% | 98,3% |

Los errores estándar son de aproximadamente 0,5 puntos para GSM8K Platinum y 2,1 puntos para GPQA Diamond (198 preguntas, una semilla), por lo que la diferencia en GPQA queda dentro del ruido entre ejecuciones. La evaluación se realizó con lighteval sobre un servidor vLLM en 4x B300 con paralelismo tensorial 4, parser de razonamiento `hy_v4` y esfuerzo de razonamiento por defecto (`high`), con temperatura 0,9, top_p 1,0 y una semilla. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa aproximadamente 447 GB, por lo que se requiere un total de memoria GPU en torno a esa cifra más overhead de activaciones y KV cache.
- GPU recomendadas: 4x NVIDIA B300 con paralelismo tensorial 4, según la configuración de despliegue validada por el autor.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de gama alta convencional; requiere un clúster multi-GPU.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 4`, `--dtype bfloat16`, `--attention-backend FLASHMLA_SPARSE`, `--limit-mm-per-prompt '{"image":1,"video":0}'`, `--enable-auto-tool-choice`, `--reasoning-parser hy_v4` y `--tool-call-parser hy_v4`. El formato compressed-tensors es compatible con LLM Compressor y vLLM; no se indica soporte para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Hy4-NVFP4 | ~774B | no disponible | tencent-hy-license | safetensors NVFP4 (compressed-tensors) | Hugging Face |
| tencent/Hy4-FP8 | no disponible | no disponible | tencent-hy-license | FP8 | Hugging Face |
| tencent/Hy4 (base) | ~774B (según checkpoint cuantizado) | no disponible | tencent-hy-license | BF16 | Hugging Face |

La comparativa se limita al ecosistema Hy4 porque no se dispone de datos de otros modelos comparables en la información proporcionada. El checkpoint NVFP4 reduce el tamaño frente al base (~1,55 TB a ~447 GB) y mantiene una recuperación del 98-99% respecto al baseline FP8 en los benchmarks evaluados.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo entrenado principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos en otros idiomas.
- Riesgo de alucinación: presente como en cualquier LLM; los benchmarks muestran que la mayoría de fallos en GSM8K Platinum son respuestas correctas que omiten la línea `ANSWER:` solicitada, lo que indica sensibilidad al formato de salida.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; no se especifica la longitud de contexto, lo que impide planificar cargas de contexto largo.
- Restricciones de licencia: la licencia tencent-hy-license es propietaria y debe revisarse antes de uso comercial; no es una licencia open source estándar.
- Caveat de producción: la decodificación especulativa DFly2 incluida en el checkpoint no está habilitada en vLLM para NVFP4 (solo para FP8 y MXFP4), por lo que no se aprovecha la aceleración especulativa en esta variante.
- La configuración recomendada limita a 1 imagen y 0 videos por prompt, lo que restringe el uso multimodal intensivo.
- El proceso de conversión de nombres de pesos de Transformers para `hy_v4_vl` es con pérdida, aunque el autor verificó tensor a tensor que los no expertos son idénticos al base.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su validación comunitaria es inexistente.

## Enlaces
- Hugging Face: https://huggingface.co/RedHatAI/Hy4-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4
- Baseline FP8: https://huggingface.co/tencent/Hy4-FP8
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- lighteval: https://github.com/huggingface/lighteval
- Perfil del autor: https://huggingface.co/RedHatAI
