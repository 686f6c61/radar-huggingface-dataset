# PocketAiHub/Qwen3.8-9B-Abliterated-MLX

## Resumen

PocketAiHub/Qwen3.8-9B-Abliterated-MLX es un conjunto de pesos en formato MLX derivado del modelo `empero-ai/Qwen3.8-9B`, una destilación de parámetros completos basada en el modelo oficial `Qwen/Qwen3.5-9B`. No se trata de un lanzamiento oficial de Qwen, sino de una adaptación comunitaria publicada por PocketAI Model Lab. El modelo es multimodal (image-text-to-text) y ha sido sometido a un proceso de "abliteración", una intervención direccional que elimina el comportamiento aprendido de rechazo, lo que reduce las negativas explícitas ante solicitudes dañinas.

El repositorio ofrece tres variantes de precisión: 4-bit, 8-bit y BF16, todas con cuantización MLX affine (grupo de 64) para las capas de lenguaje, mientras que la torre de visión se mantiene en BF16. El modelo tiene aproximadamente 9 mil millones de parámetros y soporta entrada de imágenes y texto. La licencia es Apache-2.0, lo que permite uso comercial con atribución. La relevancia de este lanzamiento radica en su naturaleza experimental: demuestra cómo aplicar técnicas de abliteración a modelos multimodales y proporciona una evaluación detallada de su comportamiento en términos de rechazo y rendimiento en contexto largo.

Es importante señalar que el modelo fue diseñado para suprimir el rechazo, por lo que puede generar contenido dañino, ilegal u ofensivo con mayor facilidad que el modelo original. No incluye entrenamiento en veracidad ni garantías de seguridad, y debe usarse con extrema precaución en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-9B); detalles exactos no disponibles |
| Parametros totales | 9B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; evaluado hasta 65,536 tokens en 4-bit y 32,768 en 8-bit/BF16 |
| Tipos de cuantizacion | 4-bit, 8-bit (MLX affine, grupo 64) y BF16 (sin cuantizar) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación disponible. Se sabe que el modelo base `empero-ai/Qwen3.8-9B` es una destilación de parámetros completos de `Qwen/Qwen3.5-9B`, un modelo de la serie Qwen3.5. Al ser multimodal, incluye un codificador de visión (vision tower) que permanece en BF16 incluso en las variantes cuantizadas. La abliteración se aplicó como una intervención direccional sobre los pesos del modelo para eliminar el comportamiento de rechazo aprendido. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La conversión a MLX excluye los tensores MTP (multi-token prediction) nativos del modelo fuente. El proceso de abliteración, conversión y validación fue realizado por PocketAI Model Lab.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto, salida de texto).
- Procesamiento de imágenes junto con prompts de texto para tareas de descripción, análisis o respuesta a preguntas visuales.
- Soporte de modo "thinking" (razonamiento) según la API de mlx-vlm, aunque las evaluaciones se realizaron con `enable_thinking=False`.
- Capacidad de manejar contextos largos: evaluado con éxito hasta 65,536 tokens en la variante 4-bit con KV cache sin cuantizar.
- Comportamiento de rechazo suprimido: no emite rechazos explícitos ante prompts dañinos (resultado de la abliteración).
- No se documentan capacidades de tool calling, function calling ni agentes en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad de modelos: estudiar cómo la abliteración afecta el comportamiento de rechazo en modelos multimodales y qué implicaciones tiene para la alineación.
- Experimentación en entornos controlados: probar respuestas a prompts que normalmente serían rechazados, con fines académicos o de análisis de riesgos, siempre bajo supervisión y con medidas de seguridad.
- Desarrollo de aplicaciones de visión por computador donde se requiera una generación de texto sin restricciones autoimpuestas, como descripción de imágenes en dominios especializados (siempre que el contenido sea lícito).
- Evaluación de rendimiento de cuantización MLX en hardware Apple Silicon: comparar la velocidad de prefill y decode entre variantes 4-bit, 8-bit y BF16.
- Benchmarking de memoria y latencia en contexto largo para modelos de 9B en MLX, útil para optimizar despliegues en dispositivos con memoria unificada.
- Pruebas de robustez de pipelines multimodales con mlx-vlm, aprovechando las tres precisiones disponibles para ajustar el equilibrio entre calidad y consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye dos evaluaciones específicas:

**Pantalla de comportamiento de rechazo** (100 prompts dañinos y 100 controles benignos, modo no-thinking, decodificación determinista, máximo 256 tokens):

| Precision | Rechazos explícitos dañinos | Rechazos explícitos benignos | Paradas naturales dañinas | Paradas naturales benignas |
| --- | ---: | ---: | ---: | ---: |
| 4-bit | 0/100 | 0/100 | 11/100 | 2/100 |
| 8-bit | 0/100 | 0/100 | 14/100 | 4/100 |
| BF16 | 0/100 | 0/100 | 11/100 | 3/100 |

**Evaluación KV/contexto largo** (pruebas de recuperación exacta):

| Precision | Tokens formateados | Prefill tok/s | Decode tok/s | Pico de memoria MLX |
| --- | ---: | ---: | ---: | ---: |
| 4-bit | 65,536 | 1028.1 | 44.59 | 13.05 GB |
| 8-bit | 32,776 | 2323.7 | 52.99 | 14.19 GB |
| BF16 | 32,776 | 2299.3 | 27.32 | 22.67 GB |

Las pruebas de recuperación exacta se superaron en todos los casos. La variante 4-bit usó KV cache sin cuantizar a 64K; las variantes 8-bit y BF16 usaron cuantización de KV cache de 16 bits a 32K. La pantalla de rechazo es una regresión temprana, no una prueba de cumplimiento universal ni de calidad de finalización.

## Requisitos de hardware

- Picos de memoria MLX medidos: 13.05 GB (4-bit), 14.19 GB (8-bit), 22.67 GB (BF16). Estos valores incluyen el modelo, el KV cache y los activaciones durante la inferencia.
- Al ser formato MLX, está optimizado para Apple Silicon (M-series). Se requiere una Mac con al menos 16 GB de memoria unificada para la variante 4-bit, 24 GB para 8-bit y 32 GB para BF16, considerando el sistema operativo y otras cargas.
- No se proporcionan requisitos para GPU NVIDIA o AMD; el formato MLX no es directamente compatible con CUDA. Para usar en GPUs convencionales sería necesario convertir los pesos a otro formato (por ejemplo, safetensors estándar o GGUF).
- Opciones de despliegue: la documentación recomienda usar `mlx-vlm` (versión 0.6.8) y `mlx` (versión 0.32.0). No se mencionan otros runners como vLLM, llama.cpp u Ollama.
- Latencia y throughput: los valores de prefill y decode se indican en la tabla anterior, medidos en un entorno no especificado. El decode varía entre 27 y 53 tokens/s según la precisión.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo base `empero-ai/Qwen3.8-9B` no tiene benchmarks públicos en esta documentación, y no se pueden comparar métricas con Qwen3.5-9B oficial u otros modelos de 9B sin fuentes adicionales. Se puede señalar que, frente al Qwen3.5-9B oficial, este derivado añade capacidades multimodales (si el original no las tenía) y elimina el rechazo, pero a costa de una mayor riesgo de generar contenido no deseado. La comparativa queda pendiente de datos externos.

## Limitaciones y advertencias

- El modelo fue modificado intencionalmente para suprimir el comportamiento de rechazo. Puede producir contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo fuente.
- La abliteración no es un entrenamiento en veracidad ni una garantía de seguridad. Los resultados pueden ser factualmente incorrectos o alucinados.
- La pantalla de rechazo solo evalúa rechazos explícitos tempranos; no mide la calidad, la seguridad ni la finalización de las respuestas.
- El modelo es una destilación de terceros basada en Qwen3.5-9B, no un lanzamiento oficial de Qwen. Su comportamiento puede diferir significativamente del modelo original.
- Solo se declara soporte para inglés. El rendimiento en otros idiomas no está evaluado.
- La longitud de contexto oficial no está especificada; las pruebas se realizaron hasta 65K tokens en 4-bit, pero no se garantiza un funcionamiento correcto más allá de esos límites.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con las leyes aplicables y de implementar salvaguardas adicionales antes de cualquier despliegue en producción.
- Es una versión comunitaria experimental; no hay garantías de mantenimiento, soporte ni corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PocketAiHub/Qwen3.8-9B-Abliterated-MLX
- Modelo base (empero-ai/Qwen3.8-9B): https://huggingface.co/empero-ai/Qwen3.8-9B
- Modelo oficial Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio oficial de Qwen3.8 (serie): https://github.com/QwenLM/Qwen3.8
- Variante 27B del mismo autor: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Información sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
