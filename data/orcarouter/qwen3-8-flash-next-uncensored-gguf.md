# orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

El modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF` es una conversión GGUF del modelo base `Qwen/Qwen3.8-Flash-Next`, al que se le ha aplicado un proceso de *abliteration* (eliminación de mecanismos de rechazo) para obtener una versión "sin censura". El modelo original, desarrollado por Alibaba Qwen, es un modelo de lenguaje multimodal de arquitectura MoE (mezcla de expertos) con aproximadamente 176,9 mil millones de parámetros totales, que integra visión y texto, razonamiento avanzado, *function calling* y una ventana de contexto de 262 000 tokens. Esta versión GGUF está pensada para ejecutarse en `llama.cpp` y entornos compatibles, y se distribuye bajo licencia Apache-2.0, aunque con acceso restringido en Hugging Face (requiere aceptar condiciones).

La relevancia de este modelo radica en que combina un tamaño considerable (MoE con 125 mil millones de parámetros activos según fuentes no oficiales) con capacidades multimodales y de razonamiento, en un formato optimizado para inferencia local. Al estar *abliterado*, elimina las respuestas de rechazo típicas de los modelos alineados, lo que lo hace útil para tareas de *red teaming*, investigación de seguridad y generación de contenido sin restricciones, aunque con los riesgos éticos y legales asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + QSA) con módulo de visión |
| Parametros totales | 176,9 mil millones (176.943.899.520) |
| Parametros activos | no disponible (según unsloth, 125 mil millones) |
| Longitud de contexto | 262 000 tokens (según unsloth) |
| Tipos de cuantizacion | no disponible (repo GGUF con múltiples cuantizaciones) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 (acceso restringido en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` introduce una arquitectura híbrida que combina atención lineal (Gated DeltaNet, GDN) con atención completa (QSA, probablemente *Query-Selective Attention*), según el repositorio oficial de Qwen. Esta combinación busca mejorar la eficiencia computacional y la capacidad del modelo, manteniendo un rendimiento alto en tareas de razonamiento y generación. El modelo es de tipo MoE, lo que implica que solo una fracción de los parámetros se activa por token (se estima 125 mil millones de activos, aunque no está confirmado). Además, incorpora un módulo de visión que permite procesar imágenes junto con texto (pipeline `image-text-to-text`).

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.) del modelo original. La versión *uncensored* se obtiene mediante *abliteration*, una técnica que elimina las capas o pesos responsables de los rechazos, sin reentrenamiento adicional. El resultado es un modelo que responde sin filtros a peticiones que normalmente serían rechazadas.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de matemáticas, lógica y análisis.
- Comprensión y generación de imágenes (visión), gracias al módulo `mmproj` incluido en el repo.
- Soporte de *function calling* y *tool calling*, lo que permite integrarlo en agentes y pipelines automatizados.
- Razonamiento multi-paso y modo *thinking* (razonamiento encadenado) para problemas complejos.
- Capacidades multilingües limitadas a inglés y chino.
- Al estar *abliterado*, no presenta rechazos ante peticiones controvertidas o explícitas, lo que lo hace adecuado para *red teaming* y pruebas de seguridad.
- Compatible con `llama.cpp` y sus bindings (CPU, CUDA, Metal, ROCm), así como con servidores compatibles con GGUF.

## Casos de uso

- *Red teaming* y auditoría de seguridad: el modelo puede generar respuestas sin filtros para probar sistemas de moderación, detectar sesgos o evaluar vulnerabilidades en pipelines de IA.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones, poesía o material con temáticas adultas, donde los modelos alineados suelen rechazar la petición.
- Asistente de código con *function calling*: integrado en un IDE o agente, puede invocar herramientas externas (ejecutar tests, consultar APIs) y razonar sobre el resultado, gracias a su soporte de *tool calling* y su ventana de 262K tokens para contextos largos.
- Análisis de imágenes y documentos: al ser multimodal, puede extraer información de capturas, diagramas o fotografías, combinando visión y lenguaje en un solo paso.
- Investigación académica sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparándolo con versiones alineadas.
- Generación de datos sintéticos para entrenamiento: al no tener restricciones, puede producir ejemplos diversos (incluyendo contenido controvertido) para entrenar clasificadores o sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta versión *uncensored* ni para el modelo base en el contexto de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 176,9 mil millones de parámetros, incluso con cuantización Q4_K_M se necesitan aproximadamente 90-100 GB de VRAM (más overhead de contexto y visión). Con Q8_0, la cifra supera los 170 GB.
- GPU recomendadas: para ejecutar el modelo completo en una sola GPU se requiere una NVIDIA A100 80GB o H100 80GB (con cuantización Q4). Alternativamente, se puede distribuir en varias GPUs, por ejemplo 2× A100 80GB o 4× RTX 4090 (24GB cada una) con paralelismo de datos o de capas.
- No cabe en GPUs de consumo (16-24 GB) a menos que se use una cuantización extrema (Q2) y se acepte una pérdida significativa de calidad, además de un contexto reducido.
- Opciones de despliegue: `llama.cpp` (CPU, CUDA, Metal, ROCm), `Ollama` (si se añade el modelo), `vLLM` (con soporte GGUF experimental), `llama-cpp-python` para integraciones personalizadas.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia alta (varios segundos por token) incluso en GPUs de alta gama, y un throughput limitado a pocos tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (MoE multimodal de ~125B activos). Se podría comparar con el modelo base `Qwen3.8-Flash-Next` (sin *abliteration*), pero no hay datos de rendimiento publicados. Tampoco se conocen modelos equivalentes en tamaño y licencia abierta con capacidades de visión y *function calling* en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Al ser una versión *uncensored*, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso debe limitarse a entornos controlados y con fines legítimos (investigación, *red teaming*).
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados o con contextos ambiguos.
- Sesgos: el modelo base fue entrenado principalmente con datos en inglés y chino, por lo que puede reflejar sesgos culturales y lingüísticos de esas regiones.
- Limitaciones de idioma: solo soporta inglés y chino; no se recomienda su uso en otros idiomas.
- Acceso restringido: el repositorio en Hugging Face es *gated*, por lo que es necesario aceptar condiciones adicionales antes de descargar los pesos.
- Requisitos de hardware elevados: no es viable en equipos de consumo sin múltiples GPUs de alta gama o cuantizaciones extremas que degradan la calidad.
- Licencia Apache-2.0 permite uso comercial, pero el *abliteration* puede violar los términos de uso del modelo original si se redistribuye sin permiso explícito de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Blog de orcarouter sobre modelos *uncensored* locales: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
