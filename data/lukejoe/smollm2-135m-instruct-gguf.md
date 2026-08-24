# lukejoe/SmolLM2-135M-Instruct-GGUF

## Resumen

El modelo `lukejoe/SmolLM2-135M-Instruct-GGUF` es una conversión a formato GGUF del modelo `unsloth/SmolLM2-135M-Instruct`, que a su vez es una versión ajustada del modelo SmolLM2-135M de Hugging Face. Se trata de un modelo de lenguaje compacto de 135 millones de parámetros, diseñado para ejecutarse en dispositivos con recursos limitados, como CPUs, teléfonos móviles o sistemas embebidos. La conversión a GGUF permite su uso con motores de inferencia como llama.cpp, Ollama o LM Studio, facilitando el despliegue local sin necesidad de GPU.

El modelo está orientado a tareas de instrucción y conversación, con un ajuste fino mediante supervisión y optimización de preferencias directa (DPO) sobre el dataset UltraFeedback. Su tamaño reducido lo hace especialmente relevante para aplicaciones en tiempo real, edge computing y prototipado rápido, donde la latencia y el consumo de memoria son críticos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `unsloth/SmolLM2-135M-Instruct` pertenece a la familia SmolLM2 de Hugging Face, que emplea una arquitectura transformer decoder de tipo Llama. Según la informacion disponible en atomic.chat, el modelo fue ajustado mediante supervised fine-tuning (SFT) y Direct Preference Optimization (DPO) sobre el dataset UltraFeedback, lo que mejora su capacidad de seguir instrucciones y generar respuestas alineadas con preferencias humanas. La conversion a GGUF fue realizada por el autor `lukejoe` utilizando maquinas proporcionadas por TensorBlock, y es compatible con llama.cpp a partir del commit b4242. No se dispone de detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional y respuestas a instrucciones.
- Razonamiento basico y conocimiento general limitado por su tamano.
- Soporte de prompt template estilo ChatML (`<|im_start|>`).
- Ejecucion eficiente en CPU y dispositivos de bajo consumo gracias a su tamano reducido.
- Compatible con herramientas de inferencia que soporten GGUF (llama.cpp, Ollama, etc.).
- No se ha confirmado soporte para tool calling, agentes o vision.

## Casos de uso

- Chatbots ligeros para sitios web o aplicaciones moviles: el modelo puede gestionar conversaciones de una sola pasada o multi-turno con baja latencia, ideal para asistentes virtuales simples en entornos con recursos limitados.
- Generacion de texto en tiempo real para autocompletado o sugerencias: su velocidad en CPU permite integrarlo en editores de codigo o procesadores de texto sin necesidad de GPU.
- Prototipado rapido de aplicaciones NLP: al ser pequeno y facil de desplegar, sirve para validar ideas de productos antes de escalar a modelos mayores.
- Educacion y experimentacion: util para ensenar conceptos de LLMs, cuantizacion y despliegue local en cursos o talleres.
- Dispositivos embebidos y edge computing: puede ejecutarse en Raspberry Pi, microcontroladores con suficiente RAM o moviles, habilitando asistentes offline.
- Filtrado o preprocesamiento de texto: tareas como clasificacion simple, extraccion de entidades o resumen corto, donde un modelo grande seria sobredimensionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para este modelo especifico.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M (0.105 GB) y overhead de ejecucion, se estima un consumo de memoria inferior a 300 MB, por lo que cabe en GPUs con 1 GB o menos, e incluso en CPU con 512 MB de RAM libre.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Raspberry Pi con GPU integrada, o iGPU de Intel). No requiere GPU dedicada para inferencia en CPU.
- Compatible con CPU: funciona en procesadores x86 y ARM, incluyendo Raspberry Pi 4/5 y telefonos con arquitectura ARM64.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamano se espera una generacion de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lukejoe/SmolLM2-135M-Instruct-GGUF | 135M | no disponible | Apache 2.0 | GGUF | Cuantizado, listo para llama.cpp |
| bartowski/SmolLM2-135M-Instruct-GGUF | 135M | no disponible | Apache 2.0 | GGUF | Otra conversion GGUF del mismo modelo base |
| ggml-org/SmolLM2-135M-GGUF | 135M | no disponible | Apache 2.0 | GGUF | Conversion oficial de ggml-org |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | safetensors | Version mayor de la misma familia |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia radica en el metodo de cuantizacion y el autor de la conversion, lo que puede afectar ligeramente a la calidad de salida.

## Limitaciones y advertencias

- Al ser un modelo de 135M parametros, su conocimiento y capacidad de razonamiento son muy limitados en comparacion con modelos grandes; puede producir respuestas incoherentes o incorrectas en tareas complejas.
- Riesgo de alucinacion: como todos los LLMs, puede inventar informacion, especialmente en temas especializados o poco representados en sus datos de entrenamiento.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no esta documentada en la informacion proporcionada; se recomienda verificar la configuracion del modelo base para evitar errores en conversaciones largas.
- La cuantizacion Q2_K y Q3_K pueden degradar significativamente la calidad; se recomienda usar Q4_K_M o superior para un equilibrio razonable.
- No se ha confirmado soporte para tool calling, agentes o funciones avanzadas; su uso en pipelines complejos puede requerir adaptaciones externas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco utilizada; se recomienda validar su funcionamiento antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lukejoe/SmolLM2-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/unsloth/SmolLM2-135M-Instruct
- Conversion alternativa de bartowski: https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Conversion de ggml-org: https://huggingface.co/ggml-org/SmolLM2-135M-GGUF
- Repositorio GitHub con informacion adicional: https://github.com/HackNetAyush/smollm2-135M-instruct-gguf-q8
- Pagina en ModelScope: https://www.modelscope.cn/models/QuantFactory/SmolLM2-135M-Instruct-GGUF
- Ficha en atomic.chat: https://atomic.chat/models/smollm2-135m-instruct
