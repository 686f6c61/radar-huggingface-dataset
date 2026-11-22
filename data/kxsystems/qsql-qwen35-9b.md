# KxSystems/qsql-qwen35-9b

## Resumen

qsql-qwen35-9b es un ajuste fino (fine-tune) del modelo Qwen3.5-9B desarrollado por KxSystems, la empresa detrás de kdb+ y KDB-X. El modelo está especializado en generar consultas qSQL —el dialecto SQL de la base de datos de series temporales kdb+— a partir de una instrucción en lenguaje natural y los esquemas de las tablas implicadas. Con 8.953.803.264 parámetros (aproximadamente 9B), se distribuye como un modelo denso único con pesos en bfloat16 bajo licencia Apache-2.0.

La relevancia del modelo reside en su enfoque vertical: en lugar de competir en capacidades generales, cubre un nicho muy concreto del sector financiero (market data, análisis de ejecución, renta fija, FX, derivados, cumplimiento y datos de referencia) donde la sintaxis de q es poco común en los corpus de entrenamiento generalistas. El modelo está diseñado explícitamente para un flujo de trabajo con verificación humana o automática: el llamador aporta la instrucción y los esquemas, el modelo devuelve código q, y el llamador lo valida, ejecuta y compara contra una referencia.

Arquitectónicamente hereda de Qwen3.5-9B una atención híbrida (24 capas de atención lineal y 8 de atención completa, con una capa completa cada cuatro) y una ventana de contexto nominal de 262.144 tokens, aunque la model card no especifica qué longitud se sirve realmente en producción. Es un modelo solo de texto: el torre multimodal del modelo base no está presente en estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (`Qwen3_5ForCausalLM`, `model_type: qwen3_5_text`): 24 capas de atención lineal + 8 de atención completa (`full_attention_interval: 4`) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | `max_position_embeddings` 262.144 (la model card no especifica la longitud servida real) |
| Tipos de cuantizacion | No disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`bfloat16`), librería `transformers` |
| Dimensión oculta | 4096 |
| Capas | 32 |
| Vocabulario | 248.320 (`vocab_size`), longitud del tokenizer 248.259 |
| Modalidad | Solo texto |
| Ajuste fino | LoRA (r=64, α=128, dropout 0.05), 3 épocas, fusionado en los pesos base |
| Tamaño del repo | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer con atención híbrida que combina capas de atención lineal con capas de atención completa intercaladas (una de cada cuatro). Esta combinación reduce el coste computacional y de memoria en secuencias largas manteniendo la capacidad de atención global en capas seleccionadas. El modelo conserva la dimensión oculta de 4096, 32 capas y un vocabulario de 248.320 tokens.

El ajuste fino se realizó mediante LoRA con rango 64, alpha 128 y dropout 0.05 durante 3 épocas, y posteriormente se fusionó en los pesos base, publicándose como un modelo denso único. Los datos de entrenamiento se centraron en un único formato de prompt: un turno de sistema literal (`You are an expert q/kdb+ programmer.`), seguido de una instrucción, un bloque `Table schemas:` con líneas indentadas con dos espacios y, opcionalmente, una línea `Expected result schema:`. La model card indica que los esquemas de tabla son prácticamente obligatorios y que la calidad decae sin ellos. No se menciona el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; el ajuste es exclusivamente supervisado sobre pares instrucción–consulta qSQL.

## Capacidades

- Generación de consultas qSQL para kdb+ y KDB-X a partir de lenguaje natural y esquemas de tabla.
- Cobertura de dominios financieros: market data, analítica de ejecución, carteras y riesgo, renta fija, FX, derivados, cumplimiento y datos de referencia.
- Acepta una pista opcional de esquema de resultado (`Expected result schema`) para orientar la forma de la salida.
- Generación determinista con decodificación greedy o muestreo múltiple (temperatura 0.8) para generar candidatos y seleccionar entre ellos.
- **No** soporta tool calling ni function calling: el argumento `tools` se ignora silenciosamente.
- **No** dispone de modo de razonamiento (*thinking*): no hay bloque de razonamiento en la plantilla de chat ni en los datos de entrenamiento.
- **No** está entrenado para explicar sintaxis o semántica de q, ni para predecir el resultado de una expresión.
- **No** está pensado como modelo principal de un agente: no ha visto prompts de sistema de agentes ni definiciones de herramientas.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Aceleración de analistas de datos en kdb+**: un analista describe en inglés la consulta que necesita y aporta los esquemas de las tablas; el modelo genera un borrador de qSQL que el analista revisa y ejecuta. Reduce el tiempo de escritura de consultas no triviales (agregaciones por símbolo, ventanas temporales, joins asof).
- **Generación asistida dentro de un IDE o notebook**: integrado como servicio de autocompletado especializado que recibe el esquema del entorno y propone consultas q, con validación sintáctica previa a la inserción en el editor.
- **Servidor MCP especializado**: el repositorio `mcp-qsql-suggester` de KxSystems usa este modelo como especialista invocado por un modelo generalista que actúa como agente principal, delegando en él la escritura de q mientras el modelo generalista gestiona el diálogo y las herramientas.
- **Migración de SQL a qSQL**: dado un esquema de tablas y una instrucción que describe la consulta en términos de negocio, el modelo produce el equivalente en q, que luego se valida contra una implementación de referencia.
- **Generación de candidatos con selección automática**: con temperatura 0.8 se generan varias muestras independientes, se descartan las que no parsean o no ejecutan, y se conserva la que los supervivientes acuerdan; útil en pipelines de generación de consultas con verificación automática.
- **Documentación y pruebas de consultas**: generar consultas de ejemplo sobre esquemas de test para poblar suites de pruebas de una plataforma de datos financieros, siempre con ejecución y comparación contra resultados esperados.
- **Análisis de cumplimiento y datos de referencia**: redacción de consultas de extracción y validación sobre tablas de referencia regulatoria, con revisión humana obligatoria antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un GPU con 24 GB o más para inferencia cómoda con contexto moderado.
- **Cuantización**: la model card no publica versiones cuantizadas (GGUF, AWQ, GPTQ) ni sus requisitos; habría que generarlas a partir de los safetensors. En 8 bits los pesos rondarían los 9 GB y en 4 bits unos 5 GB, pero estos valores son estimaciones a partir del tamaño, no datos publicados.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16. En GPUs consumer de 16 GB o menos sería necesario cuantizar.
- **Despliegue**: la model card solo documenta el uso con `transformers` (`AutoModelForCausalLM`, `device_map="auto"`). No se mencionan configuraciones para vLLM, TGI, llama.cpp u Ollama; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, pero no hay detalles adicionales.
- **Latencia y throughput**: no disponibles. La model card recomienda `max_new_tokens` de 2048 como suficiente y no publica métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsql-qwen35-9b | ~9B (denso) | 262.144 nominales | qSQL para kdb+/KDB-X | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9B (denso) | 262.144 nominales | Propósito general, multimodal | Apache-2.0 (según la model card) | Hugging Face |
| Modelos generalistas tipo CodeLlama / Qwen-Coder | 7B–34B | 16K–128K típicamente | Código general | Varía (Llama, Apache-2.0) | Hugging Face |

La comparación relevante es con el modelo base: qsql-qwen35-9b sacrifica la modalidad multimodal y las capacidades generales de Qwen3.5-9B a cambio de especialización en un dialecto muy concreto. Frente a modelos de código generalistas, no hay datos de benchmarks que permitan cuantificar la ventaja en qSQL; la model card no publica evaluaciones comparativas. No se dispone de información sobre otros fine-tunes especializados en q/kdb+ para una comparación directa.

## Limitaciones y advertencias

- **Generación no verificada**: la model card prohíbe explícitamente usar la salida directamente en una ruta de consulta de producción; debe parsearse, ejecutarse y compararse contra una referencia.
- **Tool calling no soportado**: pasar `tools=[...]` a `apply_chat_template` se ignora silenciosamente; no produce error, lo que puede llevar a falsas expectativas.
- **Sin modo de razonamiento**: no hay trazas de pensamiento ni capacidad de razonamiento multi-paso explícito.
- **Fuera de alcance las preguntas generales sobre q**: puede responder incorrectamente si se le pide explicar sintaxis o predecir resultados de expresiones.
- **No apto como modelo principal de agentes**: no ha visto prompts de sistema de agentes ni definiciones de herramientas.
- **Sensibilidad al formato del prompt**: requiere el turno de sistema literal y el bloque `Table schemas:` con indentación de dos espacios; la calidad decae sin esquemas.
- **Idioma**: solo inglés; no se garantiza calidad en castellano u otros idiomas.
- **Sesgos y alucinación**: no se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de código especializado, el riesgo principal es generar consultas sintácticamente válidas pero semánticamente incorrectas.
- **Quirks del tokenizer**: la model card menciona una sección "Known quirks" sobre la discrepancia entre `vocab_size` (248.320) y la longitud del tokenizer (248.259), sin detallar las implicaciones.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también se declara Apache-2.0 en la model card; conviene verificar los términos del modelo base por separado.
- **Contexto servido**: aunque el contexto nominal es de 262.144 tokens, la model card remite a la sección "Serving" para la longitud realmente servida, que no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KxSystems/qsql-qwen35-9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Servidor MCP `mcp-qsql-suggester`: https://github.com/KxSystems/mcp-qsql-suggester
