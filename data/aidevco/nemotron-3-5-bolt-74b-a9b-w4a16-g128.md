# aidevco/Nemotron-3.5-Bolt-74B-A9B-W4A16-g128

## Resumen

Nemotron-3.5-Bolt-74B-A9B-W4A16-g128 es una cuantización int4 de los expertos enrutados del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16, publicada por el usuario aidevco. Se trata de un modelo MoE híbrido de 74.885.081.096 parámetros totales (unos 74,9 mil millones) con aproximadamente 9 mil millones de parámetros activos por token, según indica el sufijo A9B de su nombre. La cuantización se realizó con llm-compressor 0.14.0 y compressed-tensors 0.19.0 en formato `pack-quantized`, sin calibración (data-free), y el resultado ocupa 51,6 GB frente a los aproximadamente 150 GB del checkpoint original en bf16.

El objetivo declarado del autor es servir el modelo en dos AMD Instinct MI210 (gfx90a, 64 GB cada una) con tensor-parallel de tamaño 2, dado que esa tarjeta carece de núcleos matriciales FP8 o NVFP4 y no puede ejecutar las builds publicadas en FP8, NVFP4, GGUF, EXL3 o MLX. La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización int4 selectiva que preserva en bf16 las capas sensibles (mixers Mamba-2, expertos compartidos, atención, routers, embeddings y torre de visión); por otro, sirve como referencia práctica para desplegar modelos MoE híbridos grandes en hardware AMD ROCm.

Conviene subrayar que esta publicación no es un modelo nuevo ni aporta benchmarks propios del modelo base: todo lo relativo a arquitectura, entrenamiento, uso previsto y evaluación remite a la model card original de NVIDIA. La información disponible sobre esta variante cuantizada se limita a la metodología de cuantización, la configuración de servicio en vLLM sobre ROCm y unos pocos datos de rendimiento de arranque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (capas Mamba-2 y capas de atención; 40 capas MoE, 40 mixers Mamba-2, 8 capas de atención según la model card) |
| Parametros totales | 74.885.081.096 (74,9 mil millones) |
| Parametros activos | Aproximadamente 9 mil millones (sufijo A9B del nombre; no se detalla cifra exacta en la información disponible) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio documentada (`--max-model-len=32768`); la longitud máxima nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | W4A16: pesos int4 simétricos, group size 128, solo pesos (sin cuantizar activaciones), formato compressed-tensors `pack-quantized`; resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiqueta `license: other` con `license_name: openmdw-1.1`; enlace a https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors con compressed-tensors (int4 empaquetado para expertos, bf16 para el resto); requiere `trust-remote-code` y código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida poco convencional: combina 40 capas MoE con 40 mixers Mamba-2 y 8 capas de atención, además de expertos compartidos, proyecciones latentes y una torre de visión. Cada capa MoE contiene 512 expertos enrutados, lo que da un total de 27.648 módulos de experto cuantizados en esta build. El autor describe el modelo como un "puzzle": las capas no son idénticas entre sí, de modo que, tras el reparto en tensor-parallel de tamaño 2, el kernel fusionado de MoE ve 12 formas distintas (combinaciones de número de expertos E y anchura intermedia N por tarjeta). Esa heterogeneidad es relevante para el ajuste de kernels y para dimensionar el despliegue.

En cuanto al entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO), la información disponible no lo detalla y remite a la model card original de NVIDIA. Lo que sí está documentado es el proceso de cuantización: se aplicó `model_free_ptq` de llm-compressor 0.14.0 con compressed-tensors 0.19.0, sin conjunto de calibración, en CPU únicamente (4 procesos trabajadores, 51 minutos), con esquema `num_bits=4`, `symmetric=true`, `strategy=group`, `group_size=128` y observador `memoryless-mse`. Solo se cuantizaron las proyecciones `gate_proj`, `up_proj` y `down_proj` de los expertos enrutados; los mixers Mamba-2, expertos compartidos, atención, proyecciones latentes, routers, normas, embeddings, `lm_head` y torre de visión permanecen en bf16. La decisión de no cuantizar las proyecciones Mamba-2 se justifica porque una build comunitaria int4 de esas capas producía respuestas fluidas pero incorrectas. La revisión del checkpoint origen es `e09a4cedb1787db1760375ee5539f222cae0c672`.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con etiqueta `conversational`.
- Razonamiento con modo de razonamiento: la configuración de vLLM usa `--reasoning-parser=nemotron_v3`, lo que indica soporte de un formato de razonamiento estructurado en el modelo base.
- Tool calling / function calling: la configuración de servicio emplea `--tool-call-parser=qwen3_coder`, lo que habilita el parseo de llamadas a herramientas en el servidor.
- Procesamiento multimodal en el modelo base: la etiqueta `image-text-to-text` y la presencia de una torre de visión (mantenida en bf16) indican capacidades de imagen y texto; no obstante, esta build está pensada para servirse solo como texto (`--language-model-only` y límites multimodales a cero).
- Capacidades multilingües: no disponible (los idiomas no se enumeran en la información proporcionada).
- Razonamiento multi-paso y uso como agente: no se documenta de forma explícita en esta variante; cualquier capacidad de agente proviene del modelo base y no está descrita aquí.

## Casos de uso

- Servicio de inferencia en hardware AMD Instinct MI210: el caso de uso principal y documentado. Con dos MI210 de 64 GB en tensor-parallel 2 y vLLM sobre ROCm, se puede servir un MoE de 74,9 mil millones de parámetros con contexto de 32.768 tokens, algo imposible con las builds FP8 o NVFP4 en esa tarjeta.
- Despliegue de chat conversacional de contexto largo: la ventana de 32.768 tokens configurada permite gestionar conversaciones multi-turno con historiales extensos o documentos largos adjuntos en el prompt.
- Asistentes con llamada a herramientas: gracias al parser `qwen3_coder` configurado en vLLM, el modelo puede emitir llamadas estructuradas a funciones dentro de un servidor compatible con la API de OpenAI, integrándose en flujos de automatización.
- Razonamiento con trazas explícitas: el parser `nemotron_v3` permite separar el razonamiento interno de la respuesta final, útil en pipelines que auditan o filtran la cadena de pensamiento antes de mostrarla al usuario.
- Experimentación e investigación en cuantización: la receta (int4 solo en expertos enrutados, bf16 en capas sensibles) y los 12 configs de kernel Triton publicados sirven como base reproducible para estudiar el impacto de la cuantización selectiva en modelos MoE híbridos.
- Sustitución de despliegues bf16 en entornos con VRAM limitada: con 51,6 GB de pesos frente a unos 150 GB en bf16, permite ejecutar el modelo en dos aceleradores de 64 GB en lugar de requerir un nodo de mayor capacidad.
- Evaluación comparativa de kernels MoE en ROCm: los configs ajustados por forma (E y N) permiten a equipos de infraestructura validar el comportamiento del kernel WNA16 fusionado en distintas cargas y versiones de Triton.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card de esta cuantización solo incluye datos de servicio medidos en 2 × MI210 con vLLM v0.33.0, TP=2, `--max-model-len=32768`, `--gpu-memory-utilization=0.92` y configuración MoE por defecto; la tabla de resultados aparece truncada en la información proporcionada, por lo que no se pueden reproducir sus valores.

Sobre los configs de kernel ajustados, el autor documenta una comparación A/B de servicio (por defecto, ajustado, ajustado, por defecto; pod nuevo por ejecución, 1536 tokens de prompt y 128 de salida, concurrencia 1, 2 y 4): los tokens de salida por segundo cambiaron +1,2 % con concurrencia 1 y entre 0,0 % y +0,8 % con concurrencia 2 y 4 sobre caché de prefijo caliente. La única ejecución ajustada que bajó (arranque en frío, concurrencia 2 y 4) fue igualada por la otra. El autor concluye que no hay diferencia medible y no reclama ninguna mejora de velocidad, porque los expertos representan una fracción pequeña del paso de inferencia en este híbrido Mamba-2.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 51,6 GB; con caché KV y overhead de servicio, el autor usa 2 × MI210 de 64 GB con `--gpu-memory-utilization=0.92`, lo que supone unos 117,8 GB de presupuesto de memoria en total.
- GPU recomendadas: AMD Instinct MI210 (gfx90a) en tensor-parallel 2, el hardware para el que se construyó y validó la cuantización. Para otras GPU no hay validación documentada en la información disponible.
- Cabe en GPU de consumo: no disponible; no se documenta ninguna ejecución en GPU de consumo y el formato compressed-tensors con código personalizado no es compatible con todos los runners.
- Opciones de despliegue: vLLM v0.33.0 sobre ROCm 10.0 (imagen `vllm/vllm:v0.33.0-rocm`), con detección automática de la cuantización (no pasar `--quantization`). Los expertos enrutados se ejecutan con `CompressedTensorsWNA16MoEMethod` (MoE fusionado, kernel Triton WNA16). No se documenta soporte de llama.cpp, Ollama o TGI para esta build.
- Configuración de servicio documentada: `--tensor-parallel-size=2 --trust-remote-code --max-model-len=32768 --gpu-memory-utilization=0.92 --kv-cache-dtype=auto --max-num-batched-tokens=2048 --language-model-only --limit-mm-per-prompt='{"image":0,"video":0,"audio":0}' --reasoning-parser=nemotron_v3 --tool-call-parser=qwen3_coder`.
- Latencia y throughput: no se publican cifras absolutas en la información disponible; solo la comparación relativa de los configs ajustados descrita en la sección anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aidevco/Nemotron-3.5-Bolt-74B-A9B-W4A16-g128 | 74,9 mil millones totales, ~9 mil millones activos | 32.768 tokens en la configuración documentada | int4 W4A16 group 128 en expertos, bf16 en el resto | openmdw-1.1 | Hugging Face, pesos safetensors con compressed-tensors |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74,9 mil millones totales, ~9 mil millones activos | no disponible en la información proporcionada | bf16 | openmdw-1.1 (según la build derivada) | Hugging Face, checkpoint original de NVIDIA |
| Builds FP8, NVFP4, GGUF, EXL3 y MLX del mismo modelo base | mismas del modelo base | no disponible | FP8, NVFP4, GGUF, EXL3, MLX | no disponible | Publicadas según la model card, pero no ejecutables en MI210 |
| Build comunitaria int4 con capas Mamba-2 cuantizadas | mismas del modelo base | no disponible | int4 también en Mamba-2 | no disponible | Probada por el autor; descartada por respuestas fluidas pero incorrectas |

La comparación relevante no es de rendimiento, sino de compatibilidad de hardware: esta build es la única documentada que se ejecuta en MI210, mientras que las alternativas oficiales requieren núcleos FP8 o NVFP4. No hay datos de benchmarks que permitan comparar calidad frente al modelo base ni frente a otras cuantizaciones.

## Limitaciones y advertencias

- No hay evaluación de calidad publicada: el autor no reporta benchmarks que cuantifiquen la degradación frente al modelo bf16, por lo que la pérdida de precisión de la cuantización int4 en los expertos no está medida en la información disponible.
- Solo se validó en 2 × MI210 con vLLM v0.33.0 y ROCm 10.0; en otras GPU, versiones de vLLM o versiones de Triton el kernel puede comportarse de forma distinta y los configs ajustados dejan de ser válidos.
- Los 12 configs Triton publicados no aportan mejora medible según el propio autor; además, las imágenes ROCm 7.2 nombran la tarjeta `Instinct_MI210`, por lo que hay que copiar cada archivo bajo ese nombre para que se apliquen.
- Esta build está pensada para servicio solo de texto: se desactivan imagen, vídeo y audio con `--limit-mm-per-prompt` y `--language-model-only`, aunque la torre de visión se conserva en bf16 en los pesos.
- La cuantización se hizo sin conjunto de calibración (data-free), con observador `memoryless-mse`; no se documenta ninguna validación de calidad más allá de la verificación estructural de esquemas, objetivos y shards.
- Riesgo de alucinación y sesgos: no hay información específica en la documentación proporcionada; deben consultarse en la model card del modelo base de NVIDIA.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento adecuado en castellano u otras lenguas sin evaluación previa.
- Licencia openmdw-1.1: es una licencia con condiciones que deben revisarse antes de uso comercial; la información disponible no detalla sus restricciones concretas.
- El modelo requiere `trust-remote-code` y código personalizado (`custom_code`), lo que implica ejecutar código del repositorio y auditar su procedencia antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (14 de noviembre de 2026): es una publicación reciente sin validación comunitaria.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/aidevco/Nemotron-3.5-Bolt-74B-A9B-W4A16-g128
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- llm-compressor: no disponible enlace en la información proporcionada
- compressed-tensors: no disponible enlace en la información proporcionada
- vLLM: no disponible enlace en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
