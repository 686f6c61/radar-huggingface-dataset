# P-god/Huihui-Qwen3.5-4B-abliterated

## Resumen

Huihui-Qwen3.5-4B-abliterated es una variante "abliterated" (sin censura) del modelo Qwen/Qwen3.5-4B, publicada por el usuario P-god en Hugging Face. El modelo parte de la arquitectura multimodal image-text-to-text de Qwen3.5, con 4.539.265.536 parámetros totales, y ha sido sometido a un proceso de fine-tuning orientado a eliminar los mecanismos de rechazo y filtrado de seguridad del modelo original. La model card atribuye el trabajo a huihui-ai y menciona el uso de TRL para el entrenamiento.

El problema que aborda es la reducción de la "tasa de rechazo" del modelo base: se busca que responda a peticiones que el Qwen3.5 original declinaría. Según la model card, el ajuste se aplicó únicamente sobre la parte textual del modelo, no sobre la componente de imagen, y se entrenó con un dataset orientado a operar en modo "non-think" (sin razonamiento explícito), lo que según el autor puede simplificar el modo de pensamiento.

Es relevante ahora porque Qwen3.5-4B es un modelo multimodal compacto de licencia Apache 2.0, y esta variante ofrece pesos en safetensors y GGUF compatibles con transformers, llama.cpp y Ollama, lo que facilita su despliegue local. No obstante, se trata de un modelo de investigación con salvaguardas reducidas, sin descargas ni valoraciones en el momento de la consulta, y el autor recomienda explícitamente no usarlo en producción ni en aplicaciones públicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (repo incluye pesos GGUF); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (enlazada a la licencia de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text con aproximadamente 4,54 mil millones de parámetros. La model card no detalla la arquitectura interna (número de capas, atención, etc.), el número de tokens de entrenamiento ni la composición del dataset original. El proceso de abliteración se realizó mediante fine-tuning con TRL sobre un dataset diseñado para operar en modo "non-think", aplicado exclusivamente a la parte textual del modelo; la componente de imagen no fue procesada. Tras el guardado, algunos pesos cambiaron de nombre y el modelo ya no contiene los pesos MTP (multi-token prediction), aunque el autor indica que sigue siendo convertible con Ollama y llama.cpp.

No se especifican innovaciones técnicas adicionales, número de tokens de entrenamiento, ni si hubo RLHF/DPO en el proceso de abliteración. El autor advierte que el modelo no ha pasado por una optimización de seguridad rigurosa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la componente visual no fue modificada por el fine-tuning.
- Modo "non-think": el ajuste se orientó a operar sin razonamiento explícito, lo que según el autor puede simplificar el modo de pensamiento.
- Respuestas a peticiones que el modelo base rechazaría, al haberse reducido el filtrado de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (audio, thinking mode extendido): no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo la abliteración altera la tasa de rechazo y el comportamiento del modelo base, comparando respuestas entre Qwen3.5-4B y esta variante en entornos controlados.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación y clasificadores de contenido, ya que genera respuestas que el modelo original bloquearía y permite medir la eficacia de capas de seguridad externas.
- Experimentación multimodal en local: al conservar la entrada de imagen y distribuirse en GGUF, permite probar flujos image-text-to-text en hardware de consumo mediante llama.cpp u Ollama.
- Prototipado de personajes o narrativa sin restricciones: en entornos de investigación creativa controlados, el modelo puede generar diálogos o ficción que el modelo base limitaría; requiere revisión manual.
- Pruebas de conversión y despliegue: el repo incluye GGUF y el autor documenta la conversión con Ollama v0.17.7 y llama.cpp, por lo que es útil para validar pipelines de cuantización y despliegue de modelos Qwen3.5.
- Benchmarking de modelos "uncensored": como referencia en estudios comparativos de modelos abliterated de tamaño ~4B, midiendo diferencias de comportamiento frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, ~9 GB (4,54 mil millones de parámetros × 2 bytes); en cuantización de 8 bits, ~4,5-5 GB; en 4 bits, ~2,5-3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- Tamaño del repo: 9,8 GB, coherente con pesos safetensors en precisión completa y archivos GGUF adicionales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070) en cuantizaciones de 4-8 bits; para FP16 se necesitarían GPUs de 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits, según el tamaño estimado.
- Opciones de despliegue: transformers, llama.cpp, Ollama (v0.17.7 o superior; el autor referencia `huihui_ai/qwen3.5-abliterated:4b`). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-abliterated (este) | 4.539.265.536 | no disponible | Sí (image-text-to-text) | apache-2.0 | Sin censura, fine-tuning solo en texto, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4,5B (no confirmado en la info) | no disponible | Sí (image-text-to-text) | apache-2.0 | Modelo original con filtrado de seguridad; referencia directa de comparación |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el modelo puede generar contenido sensible, controvertido o inapropiado; el autor recomienda revisión rigurosa de las salidas.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores o aplicaciones que exijan alta seguridad.
- Responsabilidad legal y ética: el usuario debe asegurar el cumplimiento de leyes y estándares éticos locales; el contenido generado puede conllevar riesgos legales.
- Uso recomendado solo para investigación, pruebas o entornos controlados; el autor desaconseja su uso directo en producción o en aplicaciones comerciales de cara al público.
- Sin garantías de seguridad por defecto: el modelo no ha pasado por una optimización de seguridad rigurosa.
- La componente de imagen no fue ajustada; el comportamiento multimodal puede diferir del esperado tras el fine-tuning textual.
- Se eliminaron los pesos MTP y algunos nombres de pesos cambiaron, lo que puede afectar a pipelines que dependan de esos tensores.
- Sin datos de benchmarks, idiomas soportados ni longitud de contexto publicados.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a modelos de este tamaño.
- Modelo con 0 descargas y 0 valoraciones en el momento de la consulta; madurez y validación por la comunidad no demostradas.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial debe evaluarse junto con las advertencias del autor sobre contenido sin filtrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P-god/Huihui-Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Ollama v0.17.7: https://github.com/ollama/ollama/releases/tag/v0.17.7
- Modelo en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:4b
- Ko-fi del autor: https://ko-fi.com/huihuiai
