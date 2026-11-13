# bambocher/Qwen3.5-9B-heretic-oQ4-mtp

## Resumen

Qwen3.5-9B-heretic-oQ4-mtp es una cuantización mixta del modelo Qwen3.5-9B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint está empaquetado en formato MLX (Apple Silicon) mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta por capas en lugar de un único nivel de bits uniforme. El resultado es un checkpoint de 9.653 millones de parámetros lógicos almacenado en 6,07 GiB, con una media efectiva de 5,404 bits por peso.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original: incluye un componente de visión de 0,456B de parámetros y una cabeza MTP (multi-token prediction) de 0,243B, además del modelo de lenguaje de 8,954B. Esa cabeza MTP es relevante porque habilita decodificación especulativa nativa, lo que puede mejorar el throughput en inferencia autoregresiva.

La relevancia de esta ficha es acotada: se trata de una publicación derivada, sin model card propia más allá de las tablas de cuantización, sin datos de entrenamiento, sin benchmarks y sin licencia declarada en el repositorio. Para un desarrollador, el interés está en evaluar si el checkpoint es utilizable en un Mac con MLX; para un investigador, en entender el esquema de cuantización mixta aplicado a un modelo multimodal con cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos cuantizados en formato MLX |
| Parametros totales | 9.653.104.368 (9,653B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (7,108B), affine 5-bit grupo 64 (1,029B), affine 6-bit grupo 64 (1,026B), BF16 (0,491B); media efectiva 5,404 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 6,5 GB de repositorio |

Desglose por componente según la model card:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 5,419 GB / 5,047 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,189 GB / 0,176 GiB |
| Total | 9,653B | 6,520 GB / 6,072 GiB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del Qwen3.5-9B base más allá de lo que se deduce del desglose de pesos: un modelo de lenguaje de 8,954B parámetros, un codificador o torre de visión de 0,456B y una cabeza de predicción multi-token de 0,243B. La presencia de la cabeza MTP indica que el modelo base está diseñado para decodificación especulativa, una técnica en la que la cabeza predice varios tokens por paso y un verificador los valida, reduciendo el número de pasos autoregresivos efectivos.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta el proceso "heretic", que en la práctica habitual de la comunidad suele referirse a variantes con alineamiento reducido o modificado, pero el repositorio no lo confirma ni lo detalla. La única innovación documentada es la cuantización mixta de oQ: asigna 4 bits al 73,6% de los pesos, 5 bits al 10,7%, 6 bits al 10,6% y mantiene un 5,1% en BF16, presumiblemente para capas sensibles a la precisión.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-9B base, aunque no se documentan evaluaciones en este checkpoint.
- Procesamiento de visión: el componente de visión de 0,456B indica soporte de entrada de imágenes, en línea con la familia Qwen3.5 multimodal.
- Decodificación especulativa: la cabeza MTP de 0,243B permite acelerar la generación en runtimes que la aprovechen.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 6,07 GiB, por lo que encaja en Macs con 16 GB de memoria unificada o más. Se usaría con mlx-lm o mlx-vlm para prototipado y asistentes locales sin conexión.
- Evaluación de cuantización mixta: útil para comparar la pérdida de calidad de un esquema oQ de 5,404 bits medios frente a una cuantización uniforme de 4 bits, midiendo perplejidad y calidad de generación en el mismo modelo base.
- Pruebas de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificación estándar en hardware Apple, un escenario poco cubierto por los benchmarks habituales de GPU.
- Prototipado de asistentes con entrada de imagen: el componente de visión permite construir demos de descripción de imágenes y respuesta visual en local, sin depender de APIs.
- Investigación sobre variantes "heretic": si el objetivo es estudiar el efecto del alineamiento reducido en el comportamiento del modelo, este checkpoint ofrece una versión cuantizada lista para ejecutar en portátiles.
- Desarrollo de aplicaciones MLX de referencia: sirve como artefacto de prueba para pipelines de despliegue en macOS, incluyendo carga de safetensors MLX y gestión de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,07 GiB de pesos en disco; en ejecución hay que sumar KV cache y buffers de activaciones. Con contexto corto, un Mac de 16 GB debería ser suficiente; con contexto largo, se recomienda 24 GB o más.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). El formato MLX no está pensado para CUDA.
- GPU consumer: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada de 16 GB o superior. En GPUs NVIDIA no se puede cargar directamente sin conversión.
- Opciones de despliegue: mlx-lm y mlx-vlm (runtime nativo del formato). Para vLLM, llama.cpp, Ollama o TGI sería necesaria una conversión previa, no documentada en el repositorio.
- Latencia y throughput: no disponible. La cabeza MTP sugiere ganancias potenciales, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ4-mtp (este) | 9,653B lógicos, 5,404 bits/peso efectivos | no disponible | safetensors MLX | no disponible | Cuantización mixta oQ, cabeza MTP, visión |
| Qwen3.5-9B (base) | 9B aprox. | no disponible | safetensors | no disponible en esta ficha | Modelo original del que deriva; sin cuantizar |
| Cuantizaciones GGUF de la familia Qwen3.5-9B | 9B aprox. | no disponible | GGUF | depende del publicador | Compatibles con llama.cpp/Ollama, no con MLX |
| Otras cuantizaciones MLX 4-bit de Qwen3.5-9B | 9B aprox. | no disponible | safetensors MLX | depende del publicador | Cuantización uniforme frente a la mixta de este checkpoint |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni datos de contexto o licencia del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del Qwen3.5-9B original y la del publicador de esta cuantización.
- Sin benchmarks: no hay evidencia publicada de que la cuantización mixta preserve la calidad del modelo base; la pérdida por cuantización no está medida.
- Variante "heretic": el nombre sugiere un alineamiento modificado o reducido, pero el repositorio no lo documenta. No se debe asumir el mismo comportamiento de seguridad que el modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones específicas para este checkpoint.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se especifican los idiomas soportados ni la cobertura multilingüe.
- Contexto: se desconoce la longitud máxima de contexto utilizable, lo que impide planificar aplicaciones de contexto largo.
- Formato restrictivo: al estar en MLX, no es directamente portable a CUDA ni a runtimes estándar sin conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Fecha de creación posterior a la fecha actual de referencia: conviene verificar la procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ4-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX (runtime): https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper, blog y demo del modelo base: no disponibles en la información proporcionada.
