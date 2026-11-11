# iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4

## Resumen

OpenThai 2.1 Bolt E4B NVFP4 es la versión cuantizada a NVFP4 del modelo OpenThai 2.1 Bolt E4B, desarrollado por iApp Technology en colaboración con la AIEAT (Asociación de Empresarios de Inteligencia Artificial de Tailandia). El modelo base parte de NVIDIA Nemotron 3.5 Bolt E4B, que a su vez deriva de Google Gemma 4 E4B-it mediante post-entrenamiento por parte de NVIDIA. Está diseñado específicamente para GPUs NVIDIA Blackwell (DGX Spark, serie RTX 50 y B200), donde aprovecha el hardware FP4 nativo.

La cuantización se realizó con NVIDIA ModelOpt 0.48.0, aplicando NVFP4 (4 bits en pesos y activaciones, en bloques de 16 con escalas FP8) únicamente a las capas lineales del modelo de lenguaje. Las embeddings, proyecciones de entrada por capa, cabeza de salida y los codificadores de visión y audio se mantienen en BF16. El resultado es un checkpoint de 10,3 GB frente a los 15,9 GB del modelo BF16, con una degradación medida inferior a 1,5 puntos en los benchmarks tailandeses evaluados.

El modelo es multimodal (texto, imagen y audio de entrada) y está orientado a generación de texto conversacional en tailandés e inglés, con soporte de tool calling, modo de razonamiento (thinking) y un contexto declarado de 262.144 tokens en el vocabulario. Su relevancia actual radica en ser una de las primeras builds NVFP4 de un modelo tailandés de estas características, pensada para despliegue eficiente en hardware Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), con capas lineales cuantizadas a NVFP4 |
| Parámetros totales | 5.995.992.352 (aproximadamente 6,0 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens de vocabulario declarados; en el ejemplo de despliegue se limita a 16.384 con `--max-model-len` |
| Tipos de cuantización | NVFP4 (4 bits en pesos y activaciones, bloques de 16, escalas FP8); embeddings, proyecciones de entrada, cabeza de salida y codificadores de visión/audio en BF16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Gemma 4, con codificadores separados de visión y audio que se mantienen en BF16 tras la cuantización. La build NVFP4 cuantiza exclusivamente las capas lineales del modelo de lenguaje, preservando en precisión completa las embeddings (incluida la tabla de tokens de 262.144 entradas, que ocupa 7,0 GB de los 10,3 GB totales), las proyecciones de entrada por capa, la cabeza de salida y los codificadores multimodales. La calibración se realizó con 256 conversaciones en tailandés e inglés extraídas del split de validación de los datos de entrenamiento, con un máximo de 2.048 tokens por muestra.

El linaje de entrenamiento es el siguiente: Google Gemma 4 E4B-it (licencia Apache 2.0) fue post-entrenado por NVIDIA para dar lugar a Nemotron 3.5 Bolt E4B (OpenMDW-1.1), y sobre este iApp Technology construyó OpenThai 2.1 Bolt E4B, del que esta es la variante cuantizada. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset del modelo base; remite al repositorio principal para esa información. Tampoco se especifica si hubo RLHF o DPO en las etapas descritas.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con calidad evaluada mediante ThaiExam, OpenThaiEval e IFEval-TH.
- Entrada multimodal: imagen y audio (pipeline `image-text-to-text`, con codificadores de visión y audio en BF16).
- Tool calling / function calling, con parser dedicado en vLLM (`--tool-call-parser gemma4`).
- Modo de razonamiento (thinking) desactivable; por defecto está apagado y se activa con `chat_template_kwargs={"enable_thinking": true}`. Incluye parser de razonamiento (`--reasoning-parser gemma4`).
- Conversación multi-turno, verificada en las pruebas del autor (segundo turno tras un tool call).
- Seguimiento de instrucciones en tailandés (IFEval-TH), con 78,6 puntos en la build NVFP4.
- No se documentan capacidades de agente multi-paso más allá del tool calling descrito.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede mantener conversaciones multi-turno con contexto amplio y responder en registro formal tailandés, como demuestra la prueba de auto-presentación incluida en la model card. Adecuado para empresas que operan en el mercado tailandés.
- Asistentes con acceso a herramientas: gracias al soporte de tool calling con parser `gemma4` en vLLM, puede integrarse en flujos donde el modelo consulta APIs externas (por ejemplo, clima, como en la prueba del autor) y elabora la respuesta con el resultado devuelto.
- Procesamiento de documentos con imagen: al aceptar entrada de imagen, puede extraer y resumir información de capturas, formularios o documentos escaneados, combinando el codificador visual con generación de texto.
- Transcripción y análisis de audio: el codificador de audio permite tareas de comprensión de voz sin un pipeline separado, útil para atención telefónica o análisis de reuniones.
- Evaluación educativa y exámenes: el rendimiento en ThaiExam (66,0 en NVFP4) lo hace utilizable para generación de preguntas y respuestas de ámbito académico en tailandés.
- Despliegue en hardware Blackwell de borde: con 10,3 GB de pesos, cabe en DGX Spark y GPUs RTX 50-series, lo que permite inferencia local en estaciones de trabajo sin depender de la nube.
- Razonamiento con modo thinking: para tareas que requieren cadenas de razonamiento más largas, se puede activar el modo thinking por petición y usar el parser de razonamiento de vLLM para separar el razonamiento de la respuesta final.

## Benchmarks y rendimiento

Resultados publicados por el autor en H100 con vLLM v0.31.0 (thinking off, greedy), comparando NVFP4 frente al modelo BF16:

| Benchmark | NVFP4 | BF16 | Δ | Error estándar |
|---|---|---|---|---|
| ThaiExam (565) | 66,0 | 67,4 | −1,49 | 1,48 |
| OpenThaiEval (1.232) | 67,0 | 67,8 | −0,81 | 0,87 |
| IFEval-TH (215) | 78,6 | 79,5 | −0,93 | 1,14 |

Ninguna de las tres caídas supera el doble de su error estándar, aunque las tres apuntan en la misma dirección. El autor recomienda usar el modelo BF16 como referencia si la memoria lo permite. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 10,3 GB de pesos en NVFP4; con overhead de KV cache y activaciones, se recomienda al menos 16-20 GB para contextos moderados.
- GPUs objetivo: NVIDIA Blackwell (DGX Spark, RTX 50-series, B200), donde se aprovecha la cuantización FP4 de activaciones.
- En H100 (sin hardware FP4), vLLM ejecuta las capas NVFP4 como pesos de 4 bits con activaciones de 16 bits mediante su kernel Marlin; probado en una sola H100 con vLLM v0.31.0.
- Cabe en GPUs de consumo de la serie RTX 50; en generaciones anteriores (RTX 40, RTX 30) funcionaría vía kernel Marlin, aunque no se ha probado según la model card.
- Despliegue recomendado: vLLM v0.31.0 con `--max-model-len 16384`, `--enable-auto-tool-choice`, `--tool-call-parser gemma4`, `--reasoning-parser gemma4` y `--limit-mm-per-prompt '{"image":0,"video":0,"audio":0}'` para desactivar entradas multimodales.
- Latencia y throughput: no disponibles en la información proporcionada. La ruta de activaciones FP4 en Blackwell no ha sido probada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenThai 2.1 Bolt E4B NVFP4 (este) | 6,0 B | 262.144 (vocabulario); 16.384 en ejemplo vLLM | OpenMDW-1.1 | safetensors NVFP4 | Multimodal, tailandés/inglés, tool calling |
| OpenThai 2.1 Bolt E4B (BF16) | 6,0 B | igual | OpenMDW-1.1 | safetensors BF16 | Referencia de precisión; 15,9 GB; métricas ligeramente superiores |
| NVIDIA Nemotron 3.5 Bolt E4B | no disponible | no disponible | OpenMDW-1.1 | no disponible | Modelo base de NVIDIA del que deriva este |
| Google Gemma 4 E4B-it | no disponible | no disponible | Apache 2.0 | no disponible | Origen de la familia; sin adaptación al tailandés |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Degradación por cuantización: las tres métricas evaluadas caen entre 0,8 y 1,5 puntos respecto a BF16; el autor recomienda BF16 como referencia si hay memoria suficiente.
- Cobertura limitada de benchmarks: solo se publican ThaiExam, OpenThaiEval e IFEval-TH; no hay datos de código, matemáticas ni razonamiento general.
- Ruta FP4 en Blackwell no probada: las pruebas se realizaron en H100 (sin FP4 nativo); el comportamiento con activaciones cuantizadas a 4 bits en hardware Blackwell está pendiente de validación.
- DGX Spark no probado: la prueba de carga en DGX Spark estaba pendiente de aprobación en el momento de redactar la model card.
- Idiomas limitados a tailandés e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: no se documenta explícitamente en la model card; aplican los riesgos habituales de los modelos generativos, especialmente en dominios especializados.
- Sesgos: no documentados en la información disponible; al derivar de Gemma 4, pueden heredarse sesgos del modelo original.
- Licencia OpenMDW-1.1: es una licencia "other", no Apache ni MIT; conviene revisar sus términos antes de uso comercial. El modelo base Gemma 4 es Apache 2.0, pero el post-entrenamiento de NVIDIA y de iApp introduce la licencia OpenMDW-1.1.
- La model card está marcada como borrador (DRAFT v0.3) y puede cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-NVFP4
- Modelo base BF16: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
