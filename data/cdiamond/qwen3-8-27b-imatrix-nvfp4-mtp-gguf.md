# cdiamond/Qwen3.8-27B-iMatrix-NVFP4-MTP-GGUF

## Resumen

Esta ficha describe la cuantización GGUF `Qwen3.8-27B-iMatrix-NVFP4-MTP-GGUF`, publicada por el usuario cdiamond en Hugging Face. Se trata de un archivo de pesos en formato GGUF que reproduce el modelo base `Qwen/Qwen3.8-27B`, un modelo de lenguaje multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen, con una ventana de contexto nativa de 262 144 tokens y capacidades de visión (image-text-to-text). La cuantización emplea una estrategia de precisión mixta basada en NVFP4 (formato de punto flotante de 4 bits de NVIDIA) combinada con cuantizaciones Q5_K, Q6_K y Q8_0 en tensores seleccionados, y mantiene la capa MTP (Multi-Token Prediction) entrenada del modelo original. El resultado es un archivo de 17,1 GB que, según las mediciones del autor, permite ejecutar el modelo con contexto completo de 256K en una GPU de 24 GB con un rendimiento de aproximadamente 50 tokens por segundo.

La relevancia de esta publicación radica en que aborda el problema práctico de ejecutar un modelo de 27B con contexto largo y visión en hardware de consumo (24 GB de VRAM) sin sacrificar calidad perceptible. El autor documenta el proceso de calibración con una matriz de importancia (iMatrix) basada en un corpus privado de conversaciones reales, y publica los resultados de velocidad y perplexidad en su blog. No se trata de un fine-tune, sino de una cuantización optimizada para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención y Gated DeltaNet, capa MTP integrada |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (mayoría), Q5_K (atención y DeltaNet), Q6_K (FFN tardío), Q8_0 (cabeza de salida), Q6_K (embeddings) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, sin especificar) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único de 17 125 207 136 bytes) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso que combina atención tradicional con capas Gated DeltaNet, una variante de atención lineal recurrente que reduce el coste de memoria durante la generación. Incorpora un proyector de visión (mmproj) para entrada de imágenes y una capa MTP que predice múltiples tokens por paso, acelerando la decodificación. La cuantización publicada no modifica la arquitectura, solo los pesos.

El autor de la cuantización, cdiamond, construyó un corpus de calibración privado compuesto por 5472 mensajes extraídos de 296 sesiones reales de su agente Hermes, cubriendo tareas de programación, infraestructura, llamadas a herramientas y conversación mixta polaco-inglés. Con ese corpus (153 600 tokens procesados) generó una matriz de importancia mediante `llama-imatrix`, que utilizó para decidir qué tensores merecían mayor precisión. El resultado es una receta de precisión mixta: los tensores de atención (Q, K, V y salida) de las 16 capas completas se mantienen en Q5_K, las proyecciones tardías de FFN en Q6_K y Q5_K, los embeddings en Q6_K y la cabeza de salida en Q8_0. El resto se deja en NVFP4. El autor no distribuye ni el corpus ni la matriz de importancia, pero publica el archivo de receta con las expresiones regulares de los tensores protegidos.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de lenguaje, incluyendo matemáticas, lógica y razonamiento multi-paso.
- Generación de código: soporta múltiples lenguajes de programación y puede integrarse en flujos de desarrollo.
- Comprensión de imágenes: al ser multimodal (image-text-to-text), puede procesar imágenes y responder preguntas sobre ellas.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas, lo que permite construir agentes que interactúan con APIs y servicios externos.
- Contexto largo: con 262 144 tokens de ventana, puede manejar documentos extensos, conversaciones prolongadas o análisis de código de gran tamaño.
- MTP (Multi-Token Prediction): la capa MTP integrada acelera la decodificación al predecir varios tokens a la vez, mejorando el throughput.
- Capacidades multilingües: aunque no se especifican los idiomas exactos, el modelo base de Qwen suele cubrir inglés, chino y otros idiomas principales.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en una estación de trabajo con RTX 4090 o similar, usando herramientas como llama.cpp u Ollama, para obtener autocompletado de código y explicaciones sin enviar datos a la nube. El contexto de 256K permite cargar repositorios completos en la ventana.
- Análisis de documentos extensos: consultar informes, contratos o investigaciones de cientos de páginas en una sola pasada, gracias a la ventana de 262 144 tokens. La cuantización mantiene la calidad suficiente para extraer conclusiones precisas.
- Agente autónomo con herramientas: al soportar tool calling, el modelo puede gestionar flujos de trabajo como la gestión de incidencias, la automatización de despliegues o la integración con APIs de terceros. La velocidad de ~50 tok/s permite interacciones casi en tiempo real.
- Asistente de atención al cliente multilingüe: desplegado con vLLM o TGI, puede manejar conversaciones multi-turno con historial largo, manteniendo el contexto de toda la sesión. La licencia Apache-2.0 permite uso comercial sin restricciones.
- Prototipado de aplicaciones de visión: gracias al proyector de visión incluido, se pueden construir demos de respuesta a preguntas sobre imágenes (por ejemplo, análisis de capturas de pantalla o diagramas) sin necesidad de un modelo separado.
- Investigación académica: el modelo base es abierto y la cuantización facilita su ejecución en hardware limitado, permitiendo reproducir experimentos de razonamiento o generación con contexto largo en laboratorios con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de perplexidad y velocidad, que se resumen a continuación. Estas cifras se obtuvieron en una GPU NVIDIA RTX PRO 4000 Blackwell SFF de 24 GB, con llama.cpp en su versión estándar y con una rama modificada que incorpora seis parches no fusionados.

| Prueba | Resultado |
|---|---|
| Perplexidad (WikiText-2, control corto) | 6,1197 |
| Velocidad de generación (serie de producción, 10 ejecuciones) | 50,441 tok/s media (rango 49,420-51,397) |
| Velocidad con llama.cpp b10454 limpio | 45,422 tok/s |
| Velocidad con runtime personalizado (6 parches) | 55,402 tok/s |
| Velocidad solo con el modelo objetivo (sin MTP) | 21,189 tok/s |
| Velocidad con MTP integrado | 59,456 tok/s (2,81x frente a solo objetivo) |
| Relleno de contexto real | 261 500 tokens de entrada + 256 generados, sin truncamiento ni OOM |
| Prefill con caché completa | 226,750 tok/s |
| Decodificación con caché completa | 12,606 tok/s |
| VRAM en GPU0 tras llenado completo | 23 952 / 24 467 MiB |

El autor compara la perplexidad de su cuantización (6,1197) con la de una cuantización Q4_1 (6,1127) en el mismo control corto, considerando que la diferencia del 0,11 % está dentro del error de la prueba. No se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 17,1 GB. Con contexto completo de 256K, el autor midió un consumo de 23 952 MiB en una GPU de 24 GB, dejando poco margen. Para contextos más cortos (por ejemplo, 32K), cabría en GPUs de 16 GB.
- GPU recomendadas: NVIDIA RTX 4090, RTX PRO 4000 Blackwell, RTX 4080 (con contexto reducido), o GPUs con 24 GB de VRAM. La cuantización NVFP4 está optimizada para arquitecturas Blackwell (sm120a); en GPUs Ampere o Ada puede que el kernel NVFP4 no esté disponible o sea más lento, aunque el archivo GGUF es portable.
- En consumer GPU: sí, una RTX 4090 de 24 GB puede ejecutarlo con contexto completo, aunque la velocidad dependerá del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (incluyendo el servidor), LM Studio, Ollama (compatible con GGUF), vLLM (con soporte para GGUF), y cualquier runtime que lea GGUF. Para aprovechar el MTP y los parches de rendimiento, se requiere una rama modificada de llama.cpp.
- Latencia y throughput: en la configuración del autor, ~50 tok/s en producción con contexto completo, y hasta 59,5 tok/s con MTP y parches. El prefill alcanza ~227 tok/s con caché llena.

## Comparativa con modelos similares

| Modelo / cuantización | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | Apache-2.0 | safetensors | Modelo base, requiere ~54 GB en FP16 |
| Qwen3.8-27B-iMatrix-NVFP4-MTP (esta) | 27B | 262 144 | Apache-2.0 | GGUF | 17,1 GB, NVFP4 mixto, MTP incluido |
| Qwen3.8-27B-GGUF (unsloth) | 27B | 262 144 | Apache-2.0 | GGUF | Cuantizaciones estándar Q2-Q8, sin MTP |
| Otras GGUF de Qwen3.8-27B (kingy.ai) | 27B | 262 144 | Apache-2.0 | GGUF | Varias opciones de bits, sin iMatrix personalizada |

La principal diferencia de esta cuantización frente a las GGUF estándar es el uso de NVFP4 con calibración iMatrix y la inclusión de la capa MTP, lo que permite un equilibrio entre tamaño, velocidad y calidad. No se dispone de comparativas numéricas con otras cuantizaciones en benchmarks estándar.

## Limitaciones y advertencias

- Cuantización no oficial: es un trabajo de un tercero, no respaldado por el equipo de Qwen. La receta de precisión mixta se basa en un corpus de calibración privado, que no se distribuye, por lo que los resultados pueden variar en otros dominios.
- Pérdida de calidad: aunque el autor reporta una perplexidad similar a Q4_1 en una prueba corta, la cuantización NVFP4 puede degradar el rendimiento en tareas que dependen de precisión numérica, como matemáticas avanzadas o razonamiento lógico complejo.
- Requisitos de hardware específicos: el rendimiento óptimo se logra en GPUs Blackwell (sm120a) con soporte NVFP4. En GPUs más antiguas, el kernel NVFP4 puede no estar disponible o ser lento, y el modelo podría ejecutarse con menor eficiencia.
- Parches no fusionados: el runtime que alcanza 55,4 tok/s requiere seis parches de llama.cpp que no están en la rama principal. Sin ellos, la velocidad baja a ~45 tok/s. Estos parches pueden contener errores o no estar mantenidos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos largos o con datos poco comunes.
- Sesgos: el corpus de calibración incluye conversaciones en polaco e inglés, lo que podría influir en la distribución de importancia de los tensores, aunque no se han documentado sesgos específicos.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base puede tener términos adicionales (consultar la licencia de Qwen). La cuantización no añade restricciones.
- Soporte de visión: el proyector de visión se proporciona como un archivo separado (mmproj) y requiere una GPU adicional (el autor usó una RTX 2000 Ada) para no competir por VRAM con el modelo principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdiamond/Qwen3.8-27B-iMatrix-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del autor con el experimento completo: https://piszczek.pl/blog/qwen38-27b-256k-50-tps-24gb-gpu
- Guía de ejecución local en 24 GB (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Cuantizaciones GGUF alternativas de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Comparativa de cuantizaciones GGUF (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Soporte oficial de AMD para Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
