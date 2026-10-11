# mradermacher/Udgam-384M-Chat-GGUF

## Resumen

Udgam-384M-Chat es un modelo de lenguaje en ingles de 384 millones de parametros (384.389.332 concretamente), disenado para tool calling y function calling en dispositivos locales. Lo desarrolla UdgamLabs, que lo entrena desde cero (from-scratch) en lugar de partir de un modelo preentrenado existente, y la ficha que nos ocupa es la version cuantizada en GGUF generada por mradermacher, un conocido publicador de cuantizaciones en HuggingFace.

El modelo es un transformer decoder-only compatible con la arquitectura Gemma 4 (clase `Gemma4ForCausalLM`), lo que permite ejecutarlo sin modificaciones en herramientas habituales de inferencia local como Ollama, LM Studio, llama.cpp, MLX y transformers. Sus etiquetas destacan capacidades muy concretas: tool calling, function calling, extraccion de JSON y shell, lo que lo situa en el nicho de agentes ligeros y automatizacion on-device.

Su relevancia actual radica en el tamano: con menos de 400M de parametros y ficheros cuantizados que van de 0,3 GB a 0,9 GB, puede ejecutarse en CPU o en GPUs consumer con muy poca VRAM, algo interesante para pipelines de extraccion estructurada donde no se justifica desplegar un modelo grande. La licencia es Apache 2.0. El autor de la cuantizacion no publica datos de contexto ni de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con Gemma 4 (`Gemma4ForCausalLM`) |
| Parametros totales | 384.389.332 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, empaquetado bajo la clase `Gemma4ForCausalLM`, lo que garantiza compatibilidad directa con el ecosistema de inferencia construido en torno a la familia Gemma 4. Segun la model card, el modelo fue entrenado desde cero (etiqueta `from-scratch`), es decir, sin inicializar los pesos a partir de otro checkpoint, lo cual es poco habitual en modelos de este tamano y suele implicar un dataset propio y un pipeline de entrenamiento completo por parte de UdgamLabs.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se detalla si se emplearon innovaciones como decodificacion especulativa o mecanismos de atencion lineal. Las etiquetas `tool-calling`, `function-calling`, `json-extraction` y `shell` apuntan a un ajuste especifico orientado a la generacion de llamadas estructuradas y comandos, pero no hay detalle tecnico publicado al respecto en los datos facilitados.

La version analizada es una cuantizacion estatica generada por mradermacher. La model card indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que el autor podria no tener previsto generarlas.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline etiquetado como `conversational`).
- Tool calling y function calling: el modelo esta etiquetado explicitamente para invocar herramientas y funciones externas.
- Extraccion de JSON: orientado a producir salida estructurada a partir de texto de entrada.
- Ejecucion/generacion de comandos de shell, segun la etiqueta `shell`.
- Inferencia on-device: optimizado para ejecutarse localmente en hardware modesto.
- Compatibilidad con agentes y flujos multi-paso, derivada de su soporte de tool calling (no confirmado con detalle tecnico en la informacion disponible).
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la ficha.
- Capacidades multimodales, de vision o de audio: no disponibles.
- Modo "thinking" explicito: no disponible en la informacion facilitada.

## Casos de uso

- Extraccion de datos estructurados en local: convertir texto libre (correos, facturas, formularios) en JSON valido, aprovechando la etiqueta `json-extraction` y la baja huella de VRAM del modelo.
- Agentes ligeros on-device: integracion como motor de decision para invocar funciones predefinidas en aplicaciones de escritorio o moviles, sin enviar datos a la nube.
- Automatizacion de tareas de shell: generacion de comandos a partir de instrucciones en lenguaje natural dentro de scripts de administracion o CI/CD.
- Asistente de linea de comandos: interfaz conversacional local que traduce peticiones del usuario en invocaciones de herramientas del sistema.
- Procesamiento por lotes en CPU: clasificacion y transformacion masiva de documentos en servidores sin GPU, gracias a que los ficheros Q4 ocupan unos 0,3 GB.
- Prototipado rapido de pipelines de tool calling: validar esquemas de funciones y prompts antes de migrar a modelos mayores.
- Chatbots embebidos con requisitos de privacidad: al ejecutarse localmente con licencia Apache 2.0, permite despliegues sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de los ficheros, no confirmada por el autor):
  - Q2_K a Q4_K_M: en torno a 0,3 GB de pesos; menos de 1 GB de VRAM total con cache KV y overhead.
  - Q5_K_S / Q5_K_M / Q6_K: en torno a 0,4 GB de pesos.
  - Q8_0: en torno a 0,5 GB de pesos.
  - f16: en torno a 0,9 GB de pesos.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, cualquier GPU consumer reciente (por ejemplo, series RTX 30/40) es sobradamente suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de gama baja y de portatiles.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp, MLX y transformers (segun la informacion de busqueda sobre el modelo base).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. El modelo se situa en la categoria de modelos densos de menos de 500M de parametros orientados a tool calling e inferencia on-device, donde podrian considerarse alternativas de tamano similar, pero sus especificaciones concretas (parametros, contexto, benchmarks, licencia) no constan en los datos facilitados y no se incluyen aqui para evitar afirmaciones no verificadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Udgam-384M-Chat (GGUF) | 384.389.332 | no disponible | apache-2.0 | HuggingFace (mradermacher y UdgamLabs) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: unicamente ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Tamano reducido: con 384M de parametros, cabe esperar capacidad de razonamiento y conocimiento general muy inferior a la de modelos de varios miles de millones de parametros.
- Riesgo de alucinacion: inherente a los modelos de este tamano, especialmente en generacion de JSON y comandos de shell, donde una salida incorrecta puede tener consecuencias operativas. Se recomienda validacion estricta de la salida.
- Longitud de contexto: no documentada en la informacion disponible; conviene verificarla antes de usarla en tareas con historiales largos.
- Naturaleza de esta ficha: corresponde a una cuantizacion de terceros (mradermacher), no al modelo original de UdgamLabs; para comportamientos exactos debe consultarse la ficha del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del modelo base para confirmar que no existen condiciones adicionales.
- Produccion: sin benchmarks publicados ni datos de latencia, el modelo debe evaluarse con un conjunto propio antes de desplegarlo en un entorno productivo.
- Cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de la salida estructurada.

## Enlaces

- Cuantizacion GGUF analizada: https://huggingface.co/mradermacher/Udgam-384M-Chat-GGUF
- Modelo base: https://huggingface.co/UdgamLabs/Udgam-384M-Chat
- GGUF del autor original: https://huggingface.co/UdgamLabs/Udgam-384M-Chat-GGUF
- Pagina de resumen de cuantizaciones de mradermacher para este modelo: https://hf.tst.eu/model#Udgam-384M-Chat-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del cuantizador: https://huggingface.co/mradermacher
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Registro en free2aitools: https://free2aitools.com/model/udgamlabs/udgam-384m-chat-gguf
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
- Coleccion de modelos de mradermacher en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
