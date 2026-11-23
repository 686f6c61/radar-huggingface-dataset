# preemware/Qwen3.8-27B-RANA-abliterated-MLX

## Resumen

Qwen3.8-27B-RANA-abliterated-MLX es una conversión al formato MLX del modelo Qwen3.8-27B-RANA-abliterated, publicado por Abliterant a partir del checkpoint base Qwen/Qwen3.8-27B. Se trata de un modelo vision-language de 27.356.728.560 parámetros (unos 27,4 mil millones) cuyo alineamiento de seguridad ha sido eliminado mediante una técnica de abliteración: se identifica y se resta la dirección de rechazo (refusal direction) en el espacio de activaciones, de modo que el modelo deja de negarse a responder a determinadas peticiones que el modelo original rechazaría.

La versión aquí descrita es un build para Apple Silicon y `mlx-vlm`, distribuido en precisiones de 4, 5, 6 y 8 bits, además de un build sin cuantizar en bf16 y un drafter MTP (multi-token prediction) para decodificación especulativa. El repositorio ocupa 143,3 GB e incluye la torre de visión en todas las variantes, manteniéndola en bf16. La licencia es Apache-2.0, heredada de Qwen.

Su relevancia es fundamentalmente de investigación: sirve para estudiar interpretabilidad, red-teaming y robustez de modelos abliterados, así como para evaluar el comportamiento de un modelo de 27B con capacidades multimodales en hardware Apple. No es un modelo pensado para despliegue en producción con garantías de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.5; tag `qwen3_5`), con torre de visión y modo thinking |
| Parámetros totales | 27.356.728.560 (27,4 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no se reporta validación de contexto en MLX; los ejemplos usan `--max-tokens 32768`) |
| Tipos de cuantización | 4-bit, 5-bit, 6-bit, 8-bit y bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, runtime `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.8-27B, un transformer de tipo vision-language de la familia Qwen3.5, con una torre de visión que procesa imágenes junto al texto y un modo thinking que separa el razonamiento interno de la respuesta final. Sobre ese checkpoint, Abliterant aplica abliteración: localiza la dirección de rechazo en las activaciones internas y la resta de los pesos, eliminando el comportamiento de negativa sin reentrenar el modelo desde cero. El resultado conserva las capacidades del original, pero pierde parte del alineamiento de seguridad.

La conversión a MLX preserva la torre de visión en bf16 en todas las variantes cuantizadas y añade un drafter MTP en bf16 para decodificación especulativa: el drafter propone varios tokens y el modelo principal los verifica, acelerando la generación. Los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF o DPO) no se detallan en la información disponible; el autor remite a la model card del release bf16 para el método completo y las puertas de calidad del release. Las comprobaciones de release se ejecutaron con mlx-vlm 0.7.3 y MLX 0.32.2 sobre Linux con el backend CUDA de MLX, no sobre Apple Silicon.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto (`--enable-thinking`), con sampling recomendado de temperature 1.0, top_p 0.95 y top_k 20.
- Comprensión de imágenes: pipeline `image-text-to-text`, entrada mediante `--image path/to/image.png`.
- Soporte de tool calling / function calling en el servidor compatible con OpenAI (`python -m mlx_vlm server`), que devuelve el razonamiento por separado.
- Decodificación especulativa opcional mediante drafter MTP.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Comportamiento sin alineamiento de seguridad: produce contenido que el modelo base rechazaría.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo la resta de la dirección de rechazo afecta las activaciones internas y comparar respuestas con el checkpoint bf16 original para medir el efecto de la abliteración.
- Red-teaming y evaluación de robustez: usar el modelo como sujeto de prueba para estudiar qué tipos de peticiones deja de rechazar y cómo varía el comportamiento entre las precisiones de 4, 5, 6 y 8 bits.
- Evaluación de drift de cuantización: comparar la divergencia KL (KLD) de cada build respecto a bf16 para decidir qué precisión usar en experimentos reproducibles.
- Prototipado multimodal en Apple Silicon: procesar imágenes y texto en un Mac con `mlx-vlm`, aprovechando la torre de visión en bf16 y el bajo consumo de las variantes de 4 y 5 bits.
- Servicio local compatible con OpenAI: levantar `python -m mlx_vlm server` con el build de 8 bits y el drafter MTP para probar integraciones de tool calling y agentes en un entorno controlado.
- Estudio de decodificación especulativa: medir la aceleración del drafter MTP frente a la generación sin drafter en el mismo hardware y precisión.
- Análisis de razonamiento largo: solicitar tareas técnicas que requieran entre 20.000 y 50.000 tokens de razonamiento, como indica el autor, para estudiar la estabilidad del modo thinking en contextos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una evaluación completa en la model card del release bf16 y una tabla de drift de cuantización (KLD) por build, pero no se incluyen cifras en los datos proporcionados. Tampoco se han medido rendimientos en Apple Silicon: las comprobaciones de release se hicieron sobre Linux con el backend CUDA de MLX.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 27,4 mil millones de parámetros en 4 bits ocupa aproximadamente 14-16 GB de pesos, en 8 bits unos 27-29 GB y en bf16 unos 55 GB, sin contar overhead de runtime, caché KV y la torre de visión.
- GPU recomendadas: no disponible. El runtime objetivo es Apple Silicon mediante MLX; las pruebas de release usaron MLX con backend CUDA en Linux.
- GPU de consumo: las variantes de 4 y 5 bits son las candidatas para equipos con memoria unificada limitada; el autor no confirma qué configuraciones de Mac se han validado.
- Despliegue: `mlx-vlm` (CLI `python -m mlx_vlm generate` y servidor `python -m mlx_vlm server`), con requisitos mlx-vlm >= 0.7.3 y mlx >= 0.32.2. Existen releases hermanos en FP8 (vLLM / SGLang) y GGUF (llama.cpp) en el repositorio de Abliterant.
- Latencia y throughput: no disponible; no se han publicado mediciones en Apple Silicon.
- Nota de descarga: no pasar el ID del repositorio directamente a `--model`, porque mlx-vlm descargaría todas las carpetas (unos 160 GB); hay que descargar una carpeta de precisión con `--include` y cargarla por ruta local.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-MLX (este) | 27,4 mil millones | no disponible | imagen-texto | Apache-2.0 | MLX / mlx-vlm |
| abliterant/Qwen3.8-27B-RANA-abliterated (bf16) | 27,4 mil millones | no disponible | imagen-texto | Apache-2.0 | Transformers |
| abliterant/Qwen3.8-27B-RANA-abliterated-FP8 | 27,4 mil millones | no disponible | imagen-texto | Apache-2.0 | vLLM / SGLang |
| abliterant/Qwen3.8-27B-RANA-abliterated-GGUF | 27,4 mil millones | no disponible | imagen-texto | Apache-2.0 | llama.cpp |
| Qwen/Qwen3.8-27B (base, con alineamiento) | 27,4 mil millones | no disponible | imagen-texto | Apache-2.0 | Transformers y derivados |

La comparación relevante no es frente a otros modelos de tamaño similar, sino frente a las distintas precisiones y runtimes de la misma familia: el bf16 como referencia, FP8 para servidores GPU, GGUF para llama.cpp y MLX para Apple Silicon. El modelo base Qwen3.8-27B difiere por conservar el alineamiento de seguridad.

## Limitaciones y advertencias

- Modelo de investigación con el alineamiento de seguridad eliminado: generará contenido que el modelo base rechaza. No debe usarse en aplicaciones orientadas al público sin filtros externos.
- Riesgo elevado de usos indebidos: la abliteración reduce las negativas, pero no elimina sesgos ni alucinaciones del modelo original.
- Sesgos conocidos: no disponible; no se documentan en la información proporcionada.
- Riesgo de alucinación: no cuantificado; se mantiene el del checkpoint Qwen subyacente.
- Contexto: no se reporta validación de longitud de contexto en MLX; los ejemplos usan `--max-tokens 32768`, por lo que no hay garantía documentada más allá de esa cifra.
- Idiomas: no se especifica la cobertura multilingüe.
- Rendimiento en Apple Silicon sin medir: las comprobaciones de release se hicieron en Linux con backend CUDA de MLX, así que la latencia y el throughput en Mac son desconocidos.
- Licencia Apache-2.0: permite uso comercial según los términos de la licencia, pero el uso comercial de un modelo sin alineamiento conlleva responsabilidad legal y reputacional para el desplegador.
- Descarga: cargar el ID del repositorio completo supone unos 160 GB; es necesario seleccionar una carpeta de precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated-MLX
- Modelo base bf16 (referencia y evaluación completa): https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Release FP8: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8
- Release GGUF: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-GGUF
- Checkpoint original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Abliterant en Hugging Face: https://huggingface.co/abliterant
- Sitio de Abliterant: https://abliterant.ai/
- Notas de investigación sobre abliteración de rechazo (RANA): https://abliterant.ai/research/rana-refusal-ablation
- Catálogo de formatos de Abliterant: https://abliterant.ai/models
