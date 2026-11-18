# GreenBitAI/Qwen3.8-Flash-Next-4bit-FP8PLE

## Resumen

Qwen3.8-Flash-Next-4bit-FP8PLE es una compilación cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por GreenBitAI y empaquetada específicamente para su servidor de inferencia gbx-dc, orientado a despliegues en centros de datos. La arquitectura del modelo original se mantiene intacta; lo que cambia es el formato de los pesos, reducidos a 4 bits con grupo de 128 y esquema simétrico mediante `compressed-tensors` en modo pack-quantized, mientras que las activaciones se mantienen en 16 bits y el resto de tensores en BF16.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 75.247.386.516 parámetros totales según los safetensors del repositorio, y una ventana de contexto de 131.072 tokens. Incluye un bloque adicional de predicción multi-token (`model_mtp.safetensors`) que un stack de serving puede emplear como modelo borrador para decodificación especulativa, aunque no es necesario para ejecutar el modelo.

Su relevancia actual reside en que permite servir un MoE de gran tamaño con pesos de 4 bits en infraestructura propia, con parámetros de cuantización declarados directamente en `config.json` y sin paso de conversión intermedio, y con compatibilidad con tres protocolos de API en el mismo puerto (OpenAI, Codex y Claude Code) a través de gbx-dc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), arquitectura del modelo base sin cambios |
| Parametros totales | 75.247.386.516 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos 4-bit, grupo de 128, simetrico, `compressed-tensors` pack-quantized; activaciones 16-bit; tabla n-gram en FP8 `e4m3` con escala global unica; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (cinco shards de pesos, `model_mtp.safetensors`, indice, tokenizer, `chat_template.jinja`, `config.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts, tal como indican las etiquetas del repositorio y la model card, que confirma que la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next no se ha modificado en esta compilación. La cuantización afecta únicamente a la representación numérica de los pesos: 4 bits con tamaño de grupo 128 y simetría, empaquetados con `compressed-tensors`; las activaciones se calculan en 16 bits y el resto de componentes del modelo permanece en BF16. La tabla n-gram se almacena en FP8 `e4m3` con una única escala global.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. La innovación técnica destacable de este paquete es doble: por un lado, los parámetros de cuantización se declaran en `config.json` bajo `quantization_config`, de modo que un runtime compatible con `compressed-tensors` los lee directamente sin conversión; por otro, se incluye un bloque de predicción multi-token (`model_mtp.safetensors`) utilizable como modelo borrador para decodificación especulativa en el stack de serving.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código: el modelo está pensado para integrarse con agentes de programación como Codex y Claude Code a través de los endpoints `/v1/responses` y `/v1/messages`.
- Soporte de tool calling y function calling: la model card menciona explícitamente que los agentes de código solicitan un modelo pequeño para trabajo en segundo plano, lo que implica gestión de llamadas a herramientas en el protocolo de la API.
- Capacidades de agente y razonamiento multi-paso: los tres protocolos de cable expuestos (OpenAI, Codex, Claude Code) están diseñados para flujos agénticos.
- Decodificación especulativa mediante el bloque MTP incluido, que actúa como modelo borrador opcional.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Servicio de chat conversacional autoalojado: el modelo se sirve con gbx-dc y expone `/v1/chat/completions`, por lo que cualquier cliente compatible con el SDK de OpenAI, LangChain u otras herramientas puede apuntar a un servidor propio sin cambiar el código de integración.
- Asistente de programación en terminal: configurando `ANTHROPIC_BASE_URL` y `ANTHROPIC_MODEL` contra el puerto local, Claude Code puede usar el modelo como backend; el endpoint `/v1/messages` implementa el protocolo esperado por la herramienta.
- Agente de código automatizado con Codex: apuntando la dirección del servicio a `http://127.0.0.1:8000/v1` y seleccionando uno de los nombres listados por `gbx-dc models`, Codex puede operar contra el modelo con el protocolo `/v1/responses`.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada sin fragmentación.
- Despliegue en centro de datos con requisitos de memoria ajustados: la cuantización a 4 bits de los pesos reduce la huella de un MoE de 75.000 millones de parámetros, lo que facilita servirlo en hardware con VRAM limitada frente al modelo en BF16.
- Aceleración de inferencia mediante decodificación especulativa: el bloque `model_mtp.safetensors` puede cargarse como draft model en el stack de serving para reducir la latencia por token en cargas interactivas.
- Plataforma unificada de APIs para equipos: al responder a tres formas de petición en el mismo puerto, un único servidor puede atender simultáneamente herramientas escritas para OpenAI, Codex y Claude Code.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 129,6 GB, lo que da una cota inferior del espacio en disco necesario para los pesos cuantizados. La VRAM requerida depende del runtime y del tamaño de lote; no se proporciona una cifra oficial en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repositorio, un despliegue en una sola GPU exige al menos 130 GB de memoria, lo que descarta las GPU de consumo de 24 GB y apunta a aceleradores de centro de datos con 80 GB o más, o a configuraciones multi-GPU.
- Cabeza en GPU de consumo: no, según el tamaño de los pesos publicados (129,6 GB).
- Opciones de despliegue: gbx-dc es el servidor para el que está empaquetado el modelo, con presets validados (`gbx-dc weights fetch`, `gbx-dc serve`, `gbx-dc models`). Al usar `compressed-tensors`, un runtime compatible con ese formato puede leer los parámetros de cuantización directamente desde `config.json`. La etiqueta `vllm` sugiere compatibilidad con vLLM, aunque la model card no documenta un procedimiento de despliegue con vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| GreenBitAI/Qwen3.8-Flash-Next-4bit-FP8PLE | 75.247.386.516 | 131.072 | 4-bit pesos, activaciones 16-bit | Qwen Community License 1.0 | gbx-dc, runtimes `compressed-tensors` |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible en la informacion | 131.072 (heredado) | BF16 (presumiblemente) | Qwen Community License 1.0 | vLLM, TGI y otros runtimes estandar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otras alternativas de la misma categoría (MoE de ~75.000 millones de parámetros cuantizados a 4 bits) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; debe consultarse la model card del modelo base para conocer los sesgos documentados por Qwen.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de texto, es aplicable la advertencia general de verificación de hechos en producción.
- Limitaciones de contexto o idioma: la ventana es de 131.072 tokens; no se especifica la lista de idiomas soportados ni su calidad relativa.
- Restricciones de licencia: se rige por la Qwen Community License 1.0, publicada con el modelo original y disponible en el archivo `LICENSE` del repositorio. Es una licencia "other", no una licencia de código abierto estándar, por lo que deben revisarse sus términos antes de un uso comercial.
- Dependencia del ecosistema gbx-dc: el paquete está empaquetado para el servidor de GreenBitAI y sus presets; fuera de ese stack, el despliegue depende de runtimes que entiendan `compressed-tensors`.
- Los agentes de código (Codex, Claude Code) solicitan un modelo pequeño adicional para tareas en segundo plano, por lo que todos los nombres de modelo en su configuración deben corresponder a modelos servidos por el servidor.
- El bloque `model_mtp.safetensors` es opcional y no se requiere para ejecutar el modelo; su uso como draft model depende del stack de serving.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-4bit-FP8PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (archivo en el repositorio): https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-4bit-FP8PLE/blob/main/LICENSE
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
