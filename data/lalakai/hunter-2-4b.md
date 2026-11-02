# Lalakai/Hunter-2-4B

## Resumen

Hunter 2 4B es un modelo de lenguaje causal de 4.112.079.360 parámetros (4B) desarrollado por Lalakai Labs, especializado en análisis de seguridad defensiva, triaje de vulnerabilidades y codificación agéntica. Se distribuye como fine-tune del modelo base XHToken/Spark-X2.5-4B y está pensado para inferencia local en hardware de consumo, concretamente en portátiles con 8 GB de memoria. Su rasgo diferencial es la exposición del razonamiento en trazas `<think>...</think>` antes de emitir la respuesta final, lo que permite auditar el proceso de análisis en tareas de revisión de código y evaluación de hallazgos de seguridad.

El modelo se entrena sobre aproximadamente 100 millones de tokens curados, con una composición claramente orientada a seguridad: un 67% de datos de seguridad defensiva (remediación de vulnerabilidades, guías NIST, trazas de razonamiento ciber) y un 33% de trayectorias de codificación agéntica. Alrededor de una cuarta parte de la mezcla es código limpio, de modo que el modelo aprende a confirmar código benigno como seguro en lugar de asumir que toda auditoría debe encontrar un fallo.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache-2.0 y distribución exclusiva en GGUF, lo que lo hace desplegable en llama.cpp y Ollama sin necesidad de GPUs de datacenter. La ventana de contexto es de 4.096 tokens, coherente con la longitud de entrenamiento, y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal (conversacional), transformer; fine-tune QLoRA sobre Spark-X2.5-4B |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q5_K_M y Q8_0 (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (no se distribuyen safetensors en el repo) |

## Arquitectura y entrenamiento

Hunter 2 4B parte del modelo base XHToken/Spark-X2.5-4B, un transformer causal de 4B parámetros. El ajuste se realizó mediante QLoRA con rango 32 y alpha 64, aplicado únicamente a las capas 8 a 35; las primeras ocho capas, los embeddings y la cabeza del modelo de lenguaje permanecieron congelados. El entrenamiento se ejecutó durante 763 pasos en BF16, con batch de 2 y acumulación de gradiente de 16 pasos, tasa de aprendizaje coseno de 1e-4 y un 5% de warmup. Terminó con una pérdida de entrenamiento de 0.729 (mínimo de 0.675) y sin activaciones del mecanismo de corte por picos de pérdida.

Los datos de entrenamiento suman aproximadamente 100 millones de tokens curados: un 67% corresponde a escenarios de seguridad defensiva (pares de remediación de vulnerabilidades, conjuntos de evaluación de ciberseguridad, material de formación NIST y trazas de razonamiento ciber) y un 33% a trayectorias de codificación agéntica y trabajo general de código. Tras el ajuste, los pesos se cuantizaron con llama.cpp a Q5_K_M y Q8_0. No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés con razonamiento multi-paso visible en trazas `<think>...</think>`.
- Análisis de seguridad defensiva: triaje de vulnerabilidades, evaluación de hallazgos y guía de remediación.
- Revisión de código seguro y razonamiento multi-paso sobre fragmentos de código.
- Confirmación explícita de código limpio como seguro, con justificación, gracias al entrenamiento con código benigno.
- Codificación agéntica: trayectorias de varios pasos orientadas a tareas de desarrollo.
- Razonamiento ciber basado en material de referencia NIST.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Revisión de código seguro en local: el modelo analiza funciones en busca de inyección de comandos u otros fallos y razona el hallazgo paso a paso en la traza `<think>`, lo que permite al revisor seguir la lógica antes de aceptar la conclusión. Adecuado por su entrenamiento específico en código limpio y vulnerable.
- Triaje de vulnerabilidades: dado un informe o fragmento de alerta, el modelo clasifica la severidad y propone remediación, apoyándose en el 67% de datos de seguridad defensiva de su mezcla de entrenamiento.
- Auditoría de seguridad en portátiles de 8 GB: con Q5_K_M (~2,98 GB) y contexto de 8K el modelo ocupa unos 3,4 GB de memoria de trabajo, lo que permite ejecutar auditorías en hardware de consumo sin GPU dedicada.
- Asistente de codificación agéntica local: integrado vía llama-server u Ollama, puede gestionar tareas de varios pasos sobre repositorios pequeños, troceando los ficheros para respetar la ventana de 4.096 tokens.
- Formación y concienciación en ciberseguridad: el razonamiento visible permite usar el modelo como herramienta didáctica para explicar por qué un fragmento de código es seguro o vulnerable, con supervisión humana.
- Pre-filtro en pipelines de revisión: desplegado con llama-cpp-python, puede actuar como primera pasada que descarta código claramente benigno y escala solo los casos con hallazgos potenciales a revisores humanos o modelos mayores.
- Evaluación de guías NIST: el modelo puede razonar sobre material de referencia NIST para contrastar prácticas de configuración, siempre como un insumo adicional del proceso de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que todavía no hay resultados formales de evaluación y que se añadirán cuando estén disponibles.

## Requisitos de hardware

- VRAM/memoria estimada: Q5_K_M ocupa aproximadamente 2,98 GB en disco y unos 3,4 GB de memoria de trabajo con contexto de 8K; Q8_0 ocupa aproximadamente 4,38 GB en disco.
- GPU recomendadas: no se especifican en la información disponible; el modelo está diseñado para portátiles de 8 GB, por lo que puede ejecutarse en CPU.
- GPU de consumo: cabe en equipos con 8 GB de memoria; no se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), llama-cpp-python y Ollama; el GGUF incluye su propia plantilla de chat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, el modelo se apoya en su base XHToken/Spark-X2.5-4B, de la que hereda arquitectura y ventana nativa más amplia, aunque Hunter 2 4B está entrenado y validado para 4.096 tokens.

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Hunter 2 4B | 4B | 4.096 | Apache-2.0 | GGUF | Seguridad defensiva y código agéntico |
| XHToken/Spark-X2.5-4B | 4B | No disponible (ventana nativa mayor según la model card) | No disponible | No disponible | Modelo base generalista |
| Alternativas de 4B para seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Un modelo de 4B no iguala a modelos de frontera en las tareas de razonamiento más difíciles ni en conocimiento de nicho; se recomienda Q8_0 cuando la calidad sea prioritaria.
- Entrenado con secuencias de 4.096 tokens: es necesario trocear ficheros largos e historiales de alertas extensos; la calidad más allá de la longitud entrenada no está garantizada aunque el modelo base soporte una ventana nativa mayor.
- Puede producir alucinaciones, reflejar sesgos de sus datos de entrenamiento y generar contenido inseguro ante indicaciones adversarias; requiere revisión humana y filtrado de seguridad propio en producción.
- Está entrenado para confirmar código limpio como seguro, por lo que una respuesta de "sin hallazgos" no es prueba de que el código sea seguro; debe tratarse como un insumo más de la revisión.
- Solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Uso responsable: no debe emplearse para atacar sistemas sin autorización ni para generar exploits armados o infraestructura de ataque llave en mano.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones formales de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lalakai/Hunter-2-4B
- Modelo base Spark-X2.5-4B: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación del formato GGUF: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del autor (X/Twitter): https://x.com/LalakaiAI
