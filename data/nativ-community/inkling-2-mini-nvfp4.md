# nativ-community/Inkling-2-Mini-nvfp4

## Resumen

Inkling-2-Mini-nvfp4 es una conversión al formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por la comunidad nativ-community. Se trata de un transformer de tipo mezcla de expertos (MoE) que acepta entradas de texto e imagen y genera texto, con un total de 26.388.641.280 parámetros. La conversión preserva la precisión mixta nativa del checkpoint original: las primeras 20 capas MoE mantienen pesos de expertos en NVFP4 y las cuatro últimas en MXFP8, mientras el resto de parámetros conservan sus dtypes originales BF16/FP32.

El modelo destaca por una arquitectura poco convencional: 24 capas físicas de decoder que ejecutan 48 visitas de capa mediante un bucle intermedio de tres pasadas (`inkling2_loop`). Incorpora además un borrador de decodificación especulativa DSpark empaquetado como `mtp.safetensors`, lo que permite acelerar la generación. La conversión está pensada para ejecutarse en Apple Silicon con 32 GB de memoria o más, según recomienda el modelo upstream.

La relevancia de esta ficha radica en que es una de las pocas distribuciones del Inkling-2-Mini lista para MLX-VLM, con un runtime parcheado que añade soporte para el bucle `inkling2_loop`. El repositorio incluye validación de integridad de la conversión (1.271 tensores verificados) y pruebas de humo sobre hardware Apple M3 Ultra, aunque no se han publicado resultados de benchmarks de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle intermedio de tres pasadas (inkling2_loop); 24 capas físicas, 48 visitas de capa |
| Parámetros totales | 26.388.641.280 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (ventana anunciada por el modelo upstream; no ejercitada en la validación) |
| Tipos de cuantización | NVFP4 (primeras 20 capas MoE), MXFP8 (últimas 4 capas MoE), BF16/FP32 en el resto de parámetros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 shards; borrador especulativo en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una estructura de bucle poco habitual: 24 capas físicas de decoder que se recorren 48 veces mediante un bucle intermedio de tres pasadas. La conversión a MLX preserva la precisión mixta del checkpoint original: las primeras 20 capas MoE retienen pesos de expertos en NVFP4 y las cuatro últimas en MXFP8, mientras que el resto de parámetros mantienen BF16/FP32. El checkpoint incluye un borrador de decodificación especulativa DSpark (`mtp.safetensors`, 0,64 GB) que permite generar varios tokens por paso con un modelo auxiliar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión remite a la model card upstream para esos detalles. La innovación técnica destacable es el soporte del bucle `inkling2_loop` en MLX-VLM mediante un runtime parcheado (basado en el commit 392052b4439c), que incluye cachés de bucle, atención de mensajes y compuertas de mensaje. La conversión no recuantiza los expertos del modelo fuente.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes y descripción o razonamiento sobre ellas (pipeline image-text-to-text).
- Razonamiento con modo configurable (`reasoning_effort`), que distingue tokens de razonamiento y respuesta final.
- Decodificación especulativa mediante el borrador DSpark empaquetado.
- Soporte de contexto largo (hasta 1M tokens anunciados, no verificado en la validación).
- Ejecución en Apple Silicon mediante MLX-VLM.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede mantener diálogos multi-turno con texto e imágenes en equipos Apple Silicon con 32 GB o más, gracias a su ventana de contexto larga y a la conversión MLX optimizada para memoria unificada.
- Descripción y análisis de imágenes en flujos de accesibilidad: se puede usar para generar descripciones textuales de imágenes en pipelines que requieran procesamiento local sin enviar datos a la nube.
- Prototipado de razonamiento con modo thinking: el parámetro `reasoning_effort` permite alternar entre respuestas directas y cadenas de razonamiento, útil para experimentar con técnicas de razonamiento en investigación.
- Aceleración de inferencia con decodificación especulativa: el borrador DSpark incluido permite comparar latencia y throughput frente a generación estándar en el mismo hardware, útil para estudios de optimización.
- Evaluación de cuantización mixta NVFP4/MXFP8: el checkpoint sirve para medir el impacto de precisiones reducidas en capas MoE sobre calidad y velocidad en MLX.
- Desarrollo de aplicaciones de visión-lenguaje en macOS: integrable mediante la librería mlx-vlm en aplicaciones de escritorio que requieran inferencia local de un modelo de 26B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validaciones de integridad de la conversión: recarga estricta del checkpoint con 1.271 tensores idénticos a los originales, 67 tests dirigidos superados (carga nativa y convertida, precisión mixta, cachés de bucle, entradas de imagen, generación especulativa), y errores absolutos máximos inferiores a 4e-7 en compuertas de mensaje y atención de mensaje frente a la implementación upstream en FP32. Las pruebas de humo reales se realizaron en un Apple M3 Ultra y produjeron los mismos 45 tokens greedy con y sin borrador especulativo en una tarea aritmética.

## Requisitos de hardware

- VRAM/memoria estimada: pesos objetivo de 19,53 GB en cuatro shards más 0,64 GB del borrador; el modelo upstream recomienda Apple Silicon con 32 GB o más, y contextos largos requieren memoria adicional.
- GPU recomendadas: Apple Silicon (probado en M3 Ultra); no se documenta soporte para GPU NVIDIA o AMD en esta conversión MLX.
- Cabe en GPU consumer: sí, en equipos Apple con memoria unificada de 32 GB o superior; no se indica compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX-VLM con el wheel parcheado `mlx_vlm-0.8.0+inkling2mini-py3-none-any.whl`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; la model card solo confirma que la generación estándar y la especulativa produjeron los mismos 45 tokens greedy en la prueba de humo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-nvfp4 (esta ficha) | 26,39B | hasta 1M (anunciado) | Apache 2.0 | safetensors MLX (NVFP4/MXFP8) | Hugging Face, MLX-VLM |
| thinkingmachines/Inkling-2-Mini (upstream) | no disponible en la información | hasta 1M (anunciado) | Apache 2.0 | no disponible | Hugging Face |
| Alternativas de 26B MoE multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La validación de la conversión no establece paridad numérica completa con el runtime original ni precisión en benchmarks; solo verifica integridad de conversión y comportamiento básico de inferencia.
- MLX-VLM usa activaciones en coma flotante en lugar de la cuantización de activaciones del runtime de referencia, lo que puede introducir diferencias numéricas.
- La ventana de contexto de 1M tokens anunciada no fue ejercitada en las comprobaciones de validación.
- El modelo puede emitir razonamiento incluso con `reasoning_effort="none"`; eliminar todos los tokens especiales concatena las secciones de razonamiento y respuesta final.
- Requiere un runtime MLX-VLM parcheado específico; la revisión upstream no soporta `inkling2_loop`, lo que limita la portabilidad a otros frameworks.
- Solo se documenta ejecución en Apple Silicon; no hay soporte verificado para CUDA, ROCm ni otros backends.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la licencia y avisos del runtime MLX-VLM incluido en el wheel.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4
- Modelo base upstream: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Repositorio MLX-VLM (commit base): https://github.com/Blaizzy/mlx-vlm/tree/392052b4439cf027ab42674d9977f62bb3dfa056
- Parche del runtime: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/blob/main/runtime/inkling2-mini.patch
- Wheel del runtime: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/resolve/main/runtime/mlx_vlm-0.8.0+inkling2mini-py3-none-any.whl
- Metadatos de conversión: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/blob/main/conversion.json
- Validación: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/blob/main/validation.json
- Model card upstream: https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/blob/main/UPSTREAM_README.md
