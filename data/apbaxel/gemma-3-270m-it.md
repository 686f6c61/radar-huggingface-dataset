# apbaxel/gemma-3-270m-it

## Resumen

Este repositorio aloja un espejo (mirror) del modelo `litert-community/gemma-3-270m-it:gemma3-270m-it-q8.litertlm`, una cuantización int8 del modelo original `google/gemma-3-270m-it` de Google. El resultado es un archivo en formato `litertlm` de aproximadamente 304 MB, optimizado para ejecución genérica en CPU, sin dependencia de aceleradores NPU específicos. Es un modelo derivado sujeto a la licencia Gemma y a la política de usos prohibidos de Google.

La relevancia de este modelo radica en su tamaño reducido (270 millones de parámetros) combinado con capacidades de seguimiento de instrucciones que, según Google, establecen un nuevo nivel de rendimiento para su categoría en el benchmark IFEval. Está pensado para aplicaciones on-device, investigación y despliegues con recursos limitados, donde la eficiencia energética y la latencia son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3, base `google/gemma-3-270m-it`) |
| Parametros totales | 270 millones (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only, float KV |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | litertlm (libreria `litert-lm`) |

## Arquitectura y entrenamiento

El modelo es una cuantización int8 del checkpoint original `google/gemma-3-270m-it`, que emplea una arquitectura transformer estándar de la familia Gemma 3. La cuantización aplica pesos en int8 con manteniendo los valores de Key/Value en float, lo que reduce el tamaño del modelo a aproximadamente 304 MB frente a los ~540 MB del checkpoint original en fp16. El archivo está preparado para ejecución genérica en CPU, sin variantes especializadas para NPU de MediaTek o Qualcomm.

No se dispone de información sobre los datos de entrenamiento del modelo original, ni sobre el proceso de cuantización (si se usó calibración, GPTQ, etc.). El repositorio solo indica que es un mirror directo del archivo de `litert-community`, sin modificaciones adicionales.

## Capacidades

- Generación de texto con seguimiento de instrucciones, validado por el benchmark IFEval.
- Adecuado para tareas de clasificación, extracción de información y generación de respuestas cortas.
- Soporte de formato de conversación (instruction-tuned, variante `-it`).
- Ejecución eficiente en CPU genérica, sin necesidad de GPU o aceleradores especializados.
- Multilingüismo: no especificado en la información disponible.

## Casos de uso

- Asistentes virtuales en dispositivos móviles o embebidos: al ser un modelo de 304 MB en int8, puede integrarse en aplicaciones Android o iOS mediante LiteRT, ofreciendo respuestas contextuales sin conexión.
- Clasificación y etiquetado de textos en pipelines de datos: su tamaño reducido permite ejecutar inferencias masivas en CPU sin coste de GPU, ideal para preprocesamiento de documentos.
- Generación de respuestas en chatbots de bajo coste: empresas con infraestructura limitada pueden desplegarlo en servidores CPU para atender consultas simples de atención al cliente.
- Herramientas de autocompletado y sugerencia de texto en editores o IDE: la baja latencia en CPU lo hace apto para funciones de asistencia en tiempo real.
- Investigación académica en eficiencia de modelos: sirve como baseline para estudiar el impacto de la cuantización int8 en modelos pequeños.
- Prototipado rápido de aplicaciones de IA generativa: al ser un mirror con formato `litertlm`, facilita la experimentación con LiteRT sin necesidad de convertir pesos desde otras librerías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La descripción de Google menciona que el modelo base establece un nuevo nivel de rendimiento en IFEval para su tamaño, pero no se aportan cifras concretas en este repositorio ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada: ~304 MB para los pesos en int8, más overhead de activaciones y KV cache (float). En total, puede ejecutarse con menos de 512 MB de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU genérica (x86, ARM). Si se usa GPU, cualquier modelo con 1 GB de VRAM es suficiente.
- Compatible con consumer GPU: sí, incluso en iGPUs o GPUs integradas.
- Opciones de despliegue: LiteRT (librería `litert-lm`), que permite inferencia en Android, iOS, Linux y otros entornos. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en este formato específico.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño, se espera una latencia de pocos milisegundos por token en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos en este repositorio. Los resultados de búsqueda no incluyen comparaciones con alternativas como Qwen2.5-0.5B, SmolLM2-360M o Phi-3-mini. Se recomienda consultar los benchmarks oficiales de Gemma 3 para obtener datos comparativos.

## Limitaciones y advertencias

- Al ser un modelo de 270M, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinaciones en contextos largos o preguntas abiertas; no apto para tareas críticas sin supervisión.
- Licencia Gemma: incluye restricciones de uso comercial y distribución. El usuario debe revisar los términos completos en https://ai.google.dev/gemma/terms.
- No se especifican los idiomas soportados; es probable que el modelo original esté entrenado principalmente en inglés, con menor rendimiento en otros idiomas.
- El formato `litertlm` es específico de LiteRT; no es directamente compatible con otras librerías de inferencia sin conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/apbaxel/gemma-3-270m-it
- Fuente original (litert-community): https://huggingface.co/litert-community/gemma-3-270m-it
- Modelo base de Google: https://huggingface.co/google/gemma-3-270m-it
- Blog de Google Developers: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Página de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos: https://ai.google.dev/gemma/prohibited_use_policy
