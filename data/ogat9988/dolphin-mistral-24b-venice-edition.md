# Ogat9988/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin Mistral 24B Venice Edition es un modelo de lenguaje de 24.011.361.280 parametros (aproximadamente 24B) desarrollado por dphn.ai en colaboracion con Venice.ai, a partir de un fine-tuning sobre mistralai/Mistral-Small-24B-Instruct-2501. Su objetivo declarado es ser la version mas "descensurada" (uncensored) de Mistral Small 24B, con el control de la alineacion trasladado al propietario del sistema mediante el system prompt, y no al proveedor del modelo. Se distribuye bajo licencia Apache 2.0 y esta disponible en Hugging Face.

El modelo esta pensado como un asistente generalista de proposito general, comparable en planteamiento a los asistentes cerrados de ChatGPT, Claude o Gemini, pero con dos diferencias clave: es desplegable en infraestructura propia y su comportamiento se define enteramente a traves del system prompt. Esta integrado como modelo por defecto ("Venice Uncensored") en la plataforma Venice.ai.

Tecnicamente parte de la arquitectura transformer decoder-only de Mistral Small, con una ventana de contexto de 131.072 tokens (128K) segun la configuracion recomendada de vLLM, pesos en safetensors (tamano de repositorio de 48,1 GB) y una plantilla de chat basada en el formato V7-Tekken de Mistral. La ficha que se reproduce aqui corresponde a la copia alojada por el usuario Ogat9988; el repositorio original es dphn/Dolphin-Mistral-24B-Venice-Edition.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como mistral3 en los tags); fine-tune de mistralai/Mistral-Small-24B-Instruct-2501 |
| Parametros totales | 24.011.361.280 (aproximadamente 24B) |
| Longitud de contexto | 131.072 tokens (128K) segun la configuracion recomendada de vLLM; no confirmado de forma independiente |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe una version GGUF de terceros (professorf/Dolphin-Mistral-24B-Venice-Edition-gguf) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 48,1 GB |
| Modelo base | mistralai/Mistral-Small-24B-Instruct-2501 |
| Plantilla de chat | Plantilla por defecto de Mistral (formato V7-Tekken) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado de Mistral Small 24B. Los tags del repositorio incluyen `mistral3` e `image-text-to-text`, y la receta de despliegue con vLLM incluye el flag `--limit-mm-per-prompt '{"image": 10}'`, lo que apunta a soporte de entrada de imagen. Sin embargo, el modelo base declarado (Mistral-Small-24B-Instruct-2501) es un modelo de texto, por lo que la capacidad multimodal no puede confirmarse con la informacion disponible y debe verificarse antes de asumirla en produccion.

El modelo fue entrenado sobre 8 aceleradores NVIDIA B200 proporcionados por targon.com. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor conserva la plantilla de chat original de Mistral. La innovacion principal no es arquitectonica sino de enfoque: la alineacion se delega al system prompt definido por el usuario, de modo que el comportamiento (tono, reglas, restricciones) es configurable por el propietario del despliegue. El autor recomienda una temperatura baja, en torno a 0,15.

## Capacidades

- Generacion de texto conversacional multi-turno con seguimiento de system prompt y de instrucciones.
- Steerability: la alineacion, el tono y las reglas de comportamiento se definen mediante el system prompt; sin el, el modelo responde con un comportamiento por defecto que puede no ser el deseado.
- Tool calling / function calling: la receta de vLLM incluye `--tool-call-parser mistral` y `--enable-auto-tool-choice`, lo que habilita el uso de herramientas en pipelines.
- Posible soporte de entrada de imagen segun los tags (`image-text-to-text`) y los flags de vLLM; no confirmado de forma independiente.
- Respuestas sin filtros de seguridad impuestos por el proveedor, adecuado para aplicaciones donde el operador define las politicas.
- Capacidades multilingues: no disponible.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades de audio.

## Casos de uso

- Escritura creativa y ficcion sin restricciones tematicas: el modelo puede generar narrativa, dialogo y contenido de genero sin los filtros tipicos de los asistentes cerrados, con el tono controlado desde el system prompt.
- Asistentes personalizados para producto: al permitir fijar la alineacion y el system prompt, encaja en aplicaciones donde la empresa quiere definir exactamente el comportamiento del asistente y no depender de cambios silenciosos del proveedor.
- Red teaming y evaluacion de seguridad: util para investigadores que necesitan un modelo que no rechace peticiones, con el fin de estudiar comportamientos adversarios, sesgos y fallos de alineacion en entornos controlados.
- Generacion de datos sinteticos: puede producir grandes volumenes de texto con un estilo o conjunto de reglas determinado por prompt, util para aumentar datasets de entrenamiento o de evaluacion.
- Despliegue local y on-premise con soberania de datos: al ser Apache 2.0 y desplegable con vLLM o llama.cpp, permite procesar datos sensibles sin enviarlos a APIs de terceros.
- Agentes con tool calling: la integracion con el parser de herramientas de Mistral en vLLM permite construir agentes que invocan funciones, APIs o consultas a bases de datos en flujos multi-paso.
- Analisis de documentos largos: con una ventana declarada de 128K tokens, puede procesar informes, contratos o transcripciones extensas en una sola pasada.
- Chat de atencion al cliente con personalidad configurable: el comportamiento conversacional se ajusta por completo desde el system prompt, lo que facilita adaptar el tono a la marca o al caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 48 GB (el repositorio de safetensors es de 48,1 GB); la propia model card indica que ejecutar el modelo en GPU requiere mas de 60 GB de VRAM.
- La receta oficial de vLLM emplea `tensor_parallel_size=8`, es decir, un despliegue multi-GPU.
- El modelo fue entrenado sobre 8 NVIDIA B200; no se detalla la configuracion de inferencia usada en produccion.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano son necesarias GPU profesionales tipo A100 80GB, H100 o B200, en configuracion multi-GPU.
- No cabe en una GPU de consumo (24 GB o menos) en bf16. Para GPU de consumo es necesario recurrir a cuantizacion GGUF (existe la version de terceros professorf/Dolphin-Mistral-24B-Venice-Edition-gguf) y a llama.cpp, Ollama o LM Studio.
- Opciones de despliegue documentadas o mencionadas: vLLM (recomendado por el autor), SGLang, TGI, Ollama, LM Studio y la libreria transformers de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| Dolphin Mistral 24B Venice Edition | 24B (24.011.361.280) | 128K (131.072) segun config. vLLM | Apache 2.0 | Fine-tune instruct | Alineacion delegada al system prompt; orientado a uso sin filtros |
| Mistral-Small-24B-Instruct-2501 (modelo base) | 24B | 32K segun su ficha oficial (no confirmado aqui) | Apache 2.0 | Instruct | Modelo base; alineacion fija definida por Mistral |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | 128K | Apache 2.0 | Instruct multimodal | Version posterior de la familia; no confirmada como comparable directo en esta ficha |

No se dispone de datos de rendimiento comparativos (benchmarks) en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo se presenta explicitamente como sin censura. Esto implica riesgo elevado de generar contenido ofensivo, ilegal, peligroso o inexacto si no se acota mediante system prompt y politicas de uso.
- Sin un system prompt bien definido, el comportamiento por defecto puede no ser el esperado; el autor recomienda configurarlo siempre.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion ni datos de fiabilidad; al ser un fine-tune instruct, mantiene los riesgos habituales de generacion de informacion falsa con apariencia de certeza.
- Idiomas soportados: no disponible, por lo que no puede garantizarse un rendimiento homogeneo fuera del ingles.
- Capacidad multimodal no confirmada: los tags apuntan a `image-text-to-text`, pero el modelo base es de texto; conviene validar la entrada de imagen antes de disenar un producto sobre ella.
- Licencia Apache 2.0: permite uso comercial, pero el operador es responsable del cumplimiento normativo del contenido generado (por ejemplo, AI Act, regulacion sectorial o legislacion de proteccion de datos).
- El autor del contenido no impone directrices eticas, lo que traslada integramente al desplegador la responsabilidad sobre el uso y sobre posibles danos.
- Temperatura recomendada de 0,15: valores mas altos pueden degradar la coherencia; conviene ajustarla por caso de uso.
- Requisitos de hardware elevados (mas de 60 GB de VRAM) para despliegue en bf16, lo que limita el uso a infraestructura profesional o a versiones cuantizadas de terceros.

## Enlaces

- Hugging Face (copia de Ogat9988): https://huggingface.co/Ogat9988/Dolphin-Mistral-24B-Venice-Edition
- Hugging Face (repositorio original de dphn): https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Version GGUF de terceros: https://huggingface.co/professorf/Dolphin-Mistral-24B-Venice-Edition-gguf
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Sitio web del desarrollador: https://dphn.ai
- Chat web: https://chat.dphn.ai
- Twitter/X: https://x.com/dphnAI
- Bot de Telegram: https://t.me/DolphinAI_bot
- Plataforma Venice.ai: https://venice.ai/
- vLLM (framework de despliegue): https://github.com/vllm-project/vllm
- Ficha en Featherless: https://featherless.ai/models/dphn/Dolphin-Mistral-24B-Venice-Edition
- Ficha en Septor Labs: https://septorlabs.com/models/dolphin-mistral-24b-venice-edition
- Ficha en ModelsAtlas: https://modelsatlas.com/models/cognitivecomputations/dolphin-mistral-24b-venice-edition
