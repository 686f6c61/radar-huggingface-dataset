# OpenCOReTechnologies/CORe-Pico-V1.5

## Resumen

CORe Pico V1.5 es un modelo de lenguaje conversacional compacto desarrollado por CORe Technologies (OpenCOReTechnologies), publicado en Hugging Face bajo licencia Apache-2.0. Con 183 millones de parámetros, está diseñado para ejecutarse en CPU y ofrecer respuestas cortas y directas en conversaciones de una sola vuelta. Su característica más destacada es una identidad consistente: responde de forma fiable a preguntas sobre quién es, quién lo creó o si es ChatGPT, algo poco común en modelos de este tamaño.

El modelo emplea una arquitectura transformer personalizada registrada como `COReForCausalLM`, con 24 capas, 12 cabezas de atención y una anchura de 768. Su longitud de contexto es de 512 tokens y utiliza un tokenizador BPE de 16.384 tokens con una plantilla de chat específica (`<|user|>`, `<|assistant|>`). Se distribuye en formato safetensors (fp32) y GGUF cuantizado (f16, q8_0, q4_k_m), lo que permite su uso en llama.cpp, Ollama, LM Studio y otras herramientas de inferencia local.

La relevancia de este modelo reside en su tamaño reducido y su enfoque en tareas de conversación simples, lo que lo convierte en una opción para prototipos, demostraciones y aplicaciones edge donde los recursos son limitados. No pretende competir con asistentes de gran escala, sino ofrecer una alternativa ligera y autoconsciente para intercambios breves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `COReForCausalLM`, transformer personalizado (custom architecture) |
| Parametros totales | 183.086.592 (183M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF f16 (351 MB), q8_0 (188 MB), q4_k_m (122 MB); safetensors fp32 (746 MB) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal personalizado denominado `COReForCausalLM`, con 24 capas, 12 cabezas de atencion y una dimension de modelo de 768. El tokenizador es un BPE de 16.384 tokens que incluye una plantilla de chat propia con los tokens especiales `<|user|>`, `<|assistant|>` y `<|endoftext|>`. El modelo se carga mediante `trust_remote_code=True` porque el tipo `core` no esta registrado en transformers de serie.

No se han publicado detalles sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, o si se aplicaron tecnicas como RLHF o DPO. La model card indica que el modelo fue entrenado especificamente para mantener una identidad coherente y responder en un formato de una sola vuelta, pero no ofrece informacion tecnica adicional sobre el regimen de entrenamiento.

## Capacidades

- Generacion de texto corto y respuestas directas a preguntas factuales simples.
- Respuestas consistentes a preguntas de identidad: "Who are you?", "What model are you?", "Who made you?", "Are you ChatGPT?".
- Explicaciones breves de conceptos en una o dos frases.
- Chat de una sola vuelta en lenguaje natural, sin soporte para conversaciones multi-turno complejas.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de identidad en aplicaciones de demostracion: el modelo puede responder de forma fiable a preguntas sobre su origen y naturaleza, util para kioscos interactivos o chatbots de presentacion de producto.
- Chat simple en dispositivos edge: gracias a su tamano (122 MB en cuantizacion q4_k_m), puede ejecutarse en Raspberry Pi o dispositivos embebidos para responder preguntas frecuentes de una sola vuelta.
- Prototipado rapido de interfaces conversacionales: los desarrolladores pueden integrarlo en entornos de desarrollo para probar flujos de chat basicos sin necesidad de GPU.
- Educacion y divulgacion: sirve como ejemplo de modelo de lenguaje autoconsciente y ligero para talleres de IA o practicas de integracion con llama.cpp.
- Generacion de respuestas cortas en aplicaciones de linea de comandos: util para scripts que necesitan respuestas textuales breves sin depender de APIs externas.
- Pruebas de concepto de plantillas de chat: su template especifico permite validar la correcta aplicacion de formatos de prompt en diferentes frameworks (LM Studio, Ollama).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El unico dato de rendimiento cualitativo es la fiabilidad en preguntas de identidad, documentada en la tabla de la model card, pero sin metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo puede ejecutarse en CPU con RAM convencional. La cuantizacion q4_k_m ocupa 122 MB, por lo que cabe en cualquier sistema con mas de 512 MB de RAM libre.
- GPU recomendadas: no se requiere GPU. Si se desea aceleracion, cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) es suficiente para el modelo en fp32.
- Compatibilidad con GPU de consumo: si, todas las GPU consumer modernas pueden ejecutarlo sin problemas.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, y transformers con `trust_remote_code=True`.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una generacion de decenas de tokens por segundo en CPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

No se han publicado comparativas oficiales con otros modelos. Como referencia estructural, se puede situar junto a otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| CORe Pico V1.5 | 183M | 512 | Apache-2.0 | safetensors, GGUF |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF |
| TinyLlama | 1.1B | 2048 | Apache-2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos, por lo que la tabla es meramente orientativa en cuanto a tamano y licencia.

## Limitaciones y advertencias

- Alucinaciones frecuentes: la propia model card advierte que el modelo puede afirmar hechos incorrectos y "improvisar" cuando no conoce la respuesta. No debe usarse como fuente de verdad.
- Contexto muy limitado: 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo ingles: no soporta otros idiomas.
- Una sola vuelta: no esta disenado para dialogos multi-turno; pierde el hilo en salidas largas.
- Plantilla de chat obligatoria: si se usa un template distinto al especificado (por ejemplo, el `Human:`/`AI:` por defecto de LM Studio), el modelo produce texto incoherente. Es imprescindible configurar la plantilla Jinja y el stop string `<|endoftext|>`.
- Dependencia de `trust_remote_code`: al ser una arquitectura personalizada, cargar el modelo requiere ejecutar codigo remoto, lo que implica riesgos de seguridad si el repositorio se viera comprometido.
- Sin soporte para tool calling, agentes ni razonamiento complejo.
- No apto para produccion seria: la model card recomienda verificar cualquier respuesta que importe.

## Enlaces

- Hugging Face: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V1.5
- Sitio web de OpenCORe: https://opencore.one/
