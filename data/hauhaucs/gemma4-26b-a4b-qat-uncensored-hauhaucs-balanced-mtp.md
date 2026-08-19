# HauhauCS/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP

## Resumen

Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP es una variante sin censura del modelo Gemma 4 26B-A4B de Google DeepMind, publicada por el usuario HauhauCS en junio de 2026. El modelo mantiene intactas las capacidades del original (razonamiento, generación de código, escritura creativa y entrada de imagen) pero elimina los rechazos de seguridad: el autor declara 0/465 refusals en sus pruebas automatizadas y manuales. Está construido a partir de los pesos oficiales QAT (quantization-aware training) de Google, por lo que la cuantización a 4 bits conserva una calidad cercana a la precisión completa.

Arquitectónicamente es un modelo de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, usando 128 expertos de los que se activan 8. Soporta una ventana de contexto de 262 144 tokens (256K) y es multimodal, aceptando texto e imágenes. Esta versión concreta incluye además una cabeza de predicción multi-token (MTP) de Unsloth para decodificación especulativa, que acelera la generación alrededor de un 35% sin alterar la calidad de la salida. Se distribuye únicamente en formato GGUF con cuantización Q4_K_M, lo que lo hace ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 8 activos por token |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | ~4 mil millones (A4B) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (GGUF), unico formato publicado |
| Idiomas soportados | en (segun la model card) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (texto Q4_K_M, proyector de vision BF16, cabeza MTP) |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 26B-A4B de Google DeepMind, es un transformer con arquitectura MoE de 128 expertos y 8 activos por token, con 26B de parametros totales y ~4B activos. Google entrenó estos pesos con QAT (quantization-aware training), de modo que la cuantización a 4 bits degrada mínimamente la calidad; por eso el autor publica solo Q4_K_M y descarta quants de mayor precisión por no aportar ganancia real. La ventana de contexto alcanza 262 144 tokens y el modelo acepta entrada de imágenes mediante un proyector multimodal (mmproj).

El trabajo de HauhauCS consiste en un fine-tuning dirigido a eliminar los rechazos de seguridad del modelo original, sin modificar datasets ni capacidades subyacentes. La variante "Balanced" está optimizada para tareas de coding agéntico, razonamiento, escritura creativa y fiabilidad en instrucciones, razonando antes de responder. Además, el release incorpora una cabeza MTP (multi-token prediction) de Unsloth para decodificación especulativa en llama.cpp, que verifica cada token generado y mantiene la salida idéntica al modelo sin MTP. No se ha publicado información sobre el dataset utilizado para el uncensoring ni sobre el entrenamiento del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con contexto largo de 256K tokens.
- Razonamiento multi-paso y resolución de problemas, ajustado específicamente en la variante Balanced.
- Generación de código y soporte para flujos de trabajo agénticos (tag "agentic"), orientado a tareas de programación asistida.
- Escritura creativa, roleplay y diálogos conversacionales sin restricciones de contenido.
- Entrada de imagen (visión) mediante el proyector mmproj, con pipeline image-text-to-text.
- Decodificación especulativa con MTP: aproximadamente un 35% más rápida que la generación estándar, con salida idéntica.
- Ausencia de rechazos: 0/465 en benchmarks de refusals según el autor, con casos límite puntuales que requieren reformulación.

## Casos de uso

- Asistente de programación local: generación y revisión de código en proyectos grandes, aprovechando los 256K tokens de contexto para mantener el repositorio completo en memoria y el razonamiento agéntico para depurar y refactorizar.
- Agentes autónomos de razonamiento multi-paso: integración en pipelines que requieren planificación, ejecución de tareas y toma de decisiones, gracias a la variante Balanced que razona antes de responder y mantiene fiabilidad bajo instrucciones complejas.
- Escritura creativa y roleplay sin filtros: creación de ficción, diálogos de personajes y narrativa interactiva donde las restricciones de contenido del modelo base interferirían con el resultado.
- Análisis de imágenes con contexto: descripción de imágenes, extracción de información visual y comprensión de documentos gráficos mediante el proyector de visión, combinado con el contexto largo para procesar series de imágenes.
- Chat conversacional desplegado en local: asistencia personal o atención al cliente con privacidad total, ejecutándose en hardware de consumo con llama.cpp o LM Studio sin dependencia de APIs externas.
- Investigación en seguridad y alineación de IA: estudio del comportamiento de modelos sin censura, análisis de jailbreaks, medición de sesgos y evaluación de riesgos en entornos controlados.
- Prototipado rápido de aplicaciones LLM: al ser un GGUF de 16.8 GB, permite iterar en entornos de desarrollo con GPUs de 24 GB sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y la búsqueda web tampoco ha proporcionado datos numéricos verificables. El único dato de rendimiento declarado es la mejora de velocidad del ~35% con la cabeza MTP en llama.cpp, sin cifras absolutas de tokens por segundo.

## Requisitos de hardware

- VRAM estimada: el GGUF de texto Q4_K_M pesa 16.8 GB, el proyector de visión 1.2 GB y la cabeza MTP 252 MB. Con overhead de ejecución, se necesitan al menos 19-20 GB de VRAM para el modelo completo con contexto reducido.
- Contexto completo de 256K: la caché KV para 262 144 tokens añade una cantidad significativa de VRAM adicional; en la práctica se recomienda reducir el contexto o usar GPUs de gran capacidad (A100 80GB, H100) para aprovecharlo íntegramente.
- GPU recomendadas: RTX 4090 24GB, RTX 3090 24GB, A100 40GB o superiores. Cabe en GPUs de consumo de 24 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF. El autor probó la velocidad MTP específicamente con llama.cpp.
- Advertencia de despliegue: el autor indica que Gemma 4 puede crashear con el modo tensor-split de LM Studio en configuraciones multi-GPU; recomienda usar una sola GPU con layer-split o prioridad de orden.
- Latencia: sin cifras absolutas publicadas; la decodificación especulativa con MTP ofrece ~35% de mejora de velocidad con salida idéntica.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Censura |
|---|---|---|---|---|---|---|
| Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP | 26B | ~4B | 256K | Gemma | GGUF | Sin censura |
| google/gemma-4-26B-A4B-it (base) | 26B | ~4B | 256K | Gemma | Safetensors | Con censura |
| Qwen3-30B-A3B (referencia MoE comparable) | 30B | ~3B | 128K | Apache 2.0 | Safetensors/GGUF | Con censura |

La comparativa directa es con el modelo base de Google: mismas especificaciones técnicas, misma licencia y mismo contexto, con la diferencia de que esta variante elimina los rechazos y añade la cabeza MTP. No se dispone de datos de rendimiento para comparar con Qwen3-30B-A3B u otros MoE de tamaño similar, por lo que la comparación numérica no está disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés. Aunque el modelo base de Google podría soportar más idiomas, esta variante no documenta capacidades multilingües.
- Contenido sin censura: al eliminar los rechazos de seguridad, el modelo puede generar contenido inapropiado, ofensivo, peligroso o ilegal. El uso en producción debe considerar salvaguardas adicionales a nivel de aplicación.
- Casos límite: el autor admite que algunos prompts deflectan en la primera petición y requieren reformulación; no es un uncensoring perfecto.
- Riesgo de alucinación: no documentado específicamente para esta variante, pero inherente a los modelos de este tamaño; la eliminación de refusals puede aumentar la confianza en respuestas factualmente incorrectas.
- Sesgos: no se han documentado sesgos específicos de esta variante ni del modelo base en la información disponible.
- Limitación de cuantización: solo se publica Q4_K_M; no hay opciones de mayor precisión ni de menor tamaño para hardware más limitado.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google; conviene revisar la política de uso aceptable antes de desplegar en producción.
- Compatibilidad: el modo tensor-split de LM Studio puede provocar crashes; se recomienda una única GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HauhauCS/Gemma4-26B-A4B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Comunidad Discord del autor: https://discord.gg/SZ5vacTXYf
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante sin QAT del mismo autor: https://huggingface.co/HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma4-26b-a4b-qat-uncensored-hauhaucs-balanced-mtp-hauhaucs
- Ficha en thinkllm.dev: https://thinkllm.dev/models/gemma4-26b-a4b-qat-uncensored-hauhaucs-balanced-mtp
- Ficha en aimarketcap.tech: https://aimarketcap.tech/models/hauhaucs-gemma4-26b-a4b-qat-uncensored-hauhaucs-balanced-mtp
