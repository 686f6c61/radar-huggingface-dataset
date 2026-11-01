# mradermacher/DrishX-1.0-GGUF

## Resumen

DrishX-1.0 es un modelo de lenguaje enfocado en código desarrollado por drishtijs, construido sobre la arquitectura Qwen2. Con aproximadamente 494 millones de parámetros (dato real extraído de los pesos en safetensors), se trata de un modelo compacto orientado a tareas de programación y conversación. La ficha que se presenta aquí corresponde a la cuantización GGUF publicada por mradermacher, que convierte el modelo original a formatos comprimidos para su ejecución eficiente en CPU y en GPUs de consumo.

La relevancia de este modelo radica en su tamaño reducido: al ocupar entre 0,4 y 1,1 GB según la cuantización, puede ejecutarse en hardware muy modesto, incluso en portátiles sin GPU dedicada, lo que lo hace adecuado para asistentes de código locales, prototipado y entornos con recursos limitados. La disponibilidad de cuantizaciones estáticas desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y consumo de memoria.

Cabe señalar que la model card del modelo base no detalla el proceso de entrenamiento, benchmarks ni capacidades específicas más allá de las etiquetas (código, conversacional, inglés), por lo que varios apartados de esta ficha se limitan a la información verificable disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 494.032.768 (~494 M) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, drishtijs/DrishX-1.0, emplea la arquitectura Qwen2, una familia de transformers decoder-only de Alibaba que utiliza atención agrupada por consultas (GQA) y RoPE en la mayoría de sus variantes. Al ser un modelo derivado de Qwen2 con etiqueta de código, es razonable asumir que ha sido ajustado para tareas de programación, aunque la model card no especifica el detalle de las fases de entrenamiento.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados, ni sobre el uso de técnicas de alineación como RLHF o DPO. Tampoco consta el tamaño exacto de la ventana de contexto. La versión aquí documentada es una cuantización estática realizada por mradermacher mediante conversión directa desde los pesos en safetensors del modelo original, sin imatrix (matriz de importancia) en el momento de publicación.

## Capacidades

- Generacion de codigo: el modelo está etiquetado con la categoría "code", lo que indica especialización en tareas de programación, aunque no se detallan lenguajes concretos.
- Generacion de texto conversacional: etiquetado como "conversational", apto para dialogo multi-turno.
- Comprension y generacion en inglés: el idioma declarado es únicamente el inglés; no hay soporte documentado de castellano u otros idiomas.
- No hay evidencia publicada de soporte de vision, audio, tool calling, function calling ni modos de razonamiento extendido (thinking mode).
- No hay información sobre capacidades de agentes o razonamiento multi-paso.

## Casos de uso

- Asistente de codigo local: gracias a su tamaño (0,4-1,1 GB en GGUF), puede ejecutarse en un portátil sin GPU mediante llama.cpp u Ollama, ofreciendo autocompletado y generación de fragmentos de código sin conexión.
- Prototipado rapido en entornos restringidos: ideal para integraciones en IDEs o herramientas de escritorio donde no se puede cargar un modelo de varios GB.
- Chatbot ligero embebido: su etiqueta conversacional y su bajo consumo de memoria lo hacen apto para asistentes embebidos en aplicaciones de escritorio o dispositivos edge.
- Generacion de pruebas y documentacion: puede emplearse para redactar docstrings, comentarios y tests unitarios a partir de código existente en flujos de trabajo de desarrollo individuales.
- Enseñanza y experimentacion: su tamaño lo hace manejable en aulas o entornos educativos para ilustrar cuantización, inferencia local y arquitectura Qwen2 sin necesidad de infraestructura costosa.
- Procesamiento por lotes de bajo coste: en servidores sin GPU, permite ejecutar tareas masivas de generación o transformación de texto y código con CPU, reduciendo el coste por token respecto a modelos mayores.
- Base para fine-tuning ligero: al tratarse de un modelo de ~494 M de parámetros con licencia Apache 2.0, es viable aplicar LoRA o QLoRA en una sola GPU de consumo para especializarlo en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: entre 0,4 GB (Q2_K) y 1,1 GB (f16) de pesos; con overhead de contexto y runtime, se recomienda disponer de 1-2 GB de RAM o VRAM libres.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna con 2 GB de VRAM o más es suficiente si se desea acelerar. No se necesitan A100 ni H100.
- Cabe sobradamente en GPUs de consumo: cualquier RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas modernas; también funciona íntegramente en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponible; dada la talla del modelo, se espera inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Enfoque |
|---|---|---|---|---|
| DrishX-1.0 | ~494 M | Apache 2.0 | safetensors / GGUF | Codigo y conversacion, base Qwen2 |
| Qwen2.5-Coder-0.5B-Instruct | ~494 M | Qwen Research (restricciones >100 M usuarios) | safetensors / GGUF | Codigo, base Qwen2.5 |
| Stable Code 3B | ~2.700 M | Apache 2.0 (modelo base) | safetensors / GGUF | Codigo, mayor tamaño |
| StarCoder2-3B | ~3.000 M | BigCode OpenRAIL-M | safetensors / GGUF | Codigo multilenguaje |

DrishX-1.0 compite en la franja de sub-1B con Qwen2.5-Coder-0.5B, del que hereda arquitectura. Su ventaja es la licencia Apache 2.0 sin restricciones de uso; su desventaja es la falta de documentacion publica y benchmarks frente a alternativas mejor evaluadas.

## Limitaciones y advertencias

- Idioma: la model card declara solo inglés; el rendimiento en castellano no está garantizado y probablemente sea limitado.
- Tamaño: con ~494 M de parámetros, su capacidad de razonamiento y generación de código complejo es inherentemente inferior a la de modelos de 7B o superiores; espere errores en tareas de programación no triviales.
- Alucinaciones: como todo modelo de lenguaje pequeño, puede generar código plausible pero incorrecto o APIs inexistentes; revise siempre la salida.
- Contexto: la longitud de ventana no está documentada; verifíquela en la configuración del modelo base antes de asumir contextos largos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomiendan Q4_K_M, Q6_K o Q8_0.
- No hay imatrix quants disponibles en el momento de publicación, lo que puede limitar la calidad de las cuantizaciones bajas frente a versiones ponderadas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque conviene verificar también los terminos del modelo base drishtijs/DrishX-1.0.
- Ausencia de benchmarks publicados: no hay datos objetivos para validar su rendimiento frente a competidores; se aconseja evaluacion propia en el caso de uso concreto antes de adoptarlo en produccion.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/DrishX-1.0-GGUF
- Modelo base: https://huggingface.co/drishtijs/DrishX-1.0
- Pagina de descargas resumida (mradermacher): https://hf.tst.eu/model#DrishX-1.0-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de codigo del modelo base: no disponibles
