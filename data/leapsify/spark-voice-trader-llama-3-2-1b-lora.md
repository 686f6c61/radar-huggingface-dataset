# leapsify/spark-voice-trader-llama-3.2-1b-lora

## Resumen

Spark Voice Trader es un adaptador LoRA sobre Llama 3.2 1B Instruct desarrollado por leapsify que convierte el modelo base en un agente cerrado de tool calling para un asistente de voz orientado a operativa de mercados. El modelo selecciona entre uno y cuatro tools (cotizaciones, posiciones, niveles tecnicos, indicadores, cadenas de opciones, noticias, ordenes y analisis what-if), lee sus resultados y genera una respuesta hablada breve cuyos valores numericos son nombres de slots que el codigo rellena posteriormente.

El adaptador se entrena por destilacion: Muse Spark (Meta Model API) ejecuta el mismo bucle de herramientas sobre preguntas de traders y solo se conservan las trazas con llamadas y argumentos correctos. El resultado se fusiona y cuantiza para ejecutarse en un telefono con menos de 1 GB en formato GGUF, generando todos los tokens en el dispositivo.

Su relevancia radica en la relacion entre precision y latencia: con 1B parametros y un bucle servido con comprobaciones de codigo alcanza un 90,8% de acierto en eleccion de herramienta y 89,9% en argumentos sobre 238 preguntas retenidas, con una latencia p50 de 0,68 s en un Mac Studio, superando a un modelo de 30B con el mismo tipo de adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA |
| Parametros totales | 1B (modelo base Llama 3.2 1B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.152 tokens de secuencia maxima en entrenamiento; contexto nativo de Llama 3.2 1B no indicado en la informacion disponible |
| Tipos de cuantizacion | bf16 (base y adaptador en MLX); build 4-bit para telefono en GGUF (<1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | adapters.safetensors + adapter_config.json (MLX); GGUF 4-bit para despliegue movil |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 1B Instruct en bf16 con LoRA en 16 capas, rango 16, escala 2.0 y dropout 0. El entrenamiento consta de 12.885 iteraciones, batch 2 con acumulacion de gradiente de 4 pasos, secuencia maxima de 1.152 tokens y mascara sobre los tokens de prompt. Se usa optimizador Adam con learning rate 2e-4, 50 pasos de warmup y decaimiento coseno.

Los datos proceden de trazas de tool calling de Muse Spark (single- y multi-turn) sobre 14 herramientas en un mercado simulado con semilla. Solo se retienen las trazas con llamadas y argumentos correctos, lo que convierte el proceso en una destilacion filtrada por correccion. Ni las trazas ni las preguntas se han publicado. El adaptador se fusiona y cuantiza a 4-bit para el build movil, manteniendo el mismo acierto en eleccion de herramienta (90,8%) que la version de referencia.

## Capacidades

- Tool calling cerrado sobre 14 herramientas: cotizaciones, posiciones, niveles, indicadores, cadenas de opciones, noticias, ordenes y analisis what-if.
- Seleccion de entre una y cuatro herramientas por consulta, con generacion de argumentos en JSON.
- Lectura de resultados de herramientas e integracion de los valores en la respuesta hablada mediante slots numericos rellenados por codigo.
- Razonamiento multi-turno dentro del bucle de agente (preguntas de seguimiento como "What about its RSI?").
- Generacion de respuestas breves orientadas a sintesis de voz.
- Borrador de tickets de orden sujetos a confirmacion humana.
- Capacidades generales heredadas de Llama 3.2 1B Instruct (generacion de texto, razonamiento basico, codigo y matematicas elementales), no evaluadas especificamente en este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de voz para consulta de posiciones: el modelo encadena la tool de posiciones y la de cotizaciones para responder "como va mi posicion en NVDA" en menos de un segundo, adecuado por su latencia p50 de 0,68 s y su precision del 90,8% en eleccion de herramienta.
- Seguimiento conversacional de indicadores: ante una pregunta de seguimiento ("y su RSI"), el modelo mantiene el contexto del bucle y selecciona la tool de indicadores con los argumentos correctos, gracias al entrenamiento sobre trazas multi-turno.
- Analisis what-if de escenarios: el modelo invoca la herramienta de simulacion para calcular el impacto de un movimiento de precio sobre una posicion, integrando el resultado en una respuesta hablada con slots numericos.
- Consulta de cadenas de opciones: selecciona la tool de option chains y resume vencimientos y strikes relevantes en una frase corta apta para lectura por voz.
- Borrador de ordenes con confirmacion humana: el modelo genera un ticket de orden a partir de una instruccion hablada, que el codigo presenta al usuario para confirmacion explicita antes de cualquier envio.
- Despliegue on-device en movil: el build GGUF 4-bit de menos de 1 GB permite ejecutar el bucle completo en un telefono sin conexion, util para demos de trading asistido con datos simulados.
- Filtrado de noticias financieras: la tool de noticias permite responder preguntas sobre eventos recientes asociados a un ticker, resumiendo el resultado en una respuesta breve.

## Benchmarks y rendimiento

238 preguntas retenidas de traders, evaluadas contra etiquetas gold en un mercado simulado con las mismas herramientas:

| Sistema | Eleccion de tool | Argumentos | Latencia p50 (Mac Studio) |
|---|---|---|---|
| Muse Glimmer 30B, base | 61,8% | 58,4% | 5,08 s |
| Muse Glimmer 30B + Spark LoRA | 77,7% | 79,0% | 4,19 s |
| Llama 3.2 1B + este adaptador (bucle servido con comprobaciones de codigo) | 90,8% | 89,9% | 0,68 s |

El build 4-bit para telefono obtiene el mismo 90,8% en eleccion de herramienta. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion 4-bit GGUF; aproximadamente 2 GB en bf16 para el modelo base de 1B mas el adaptador.
- GPU recomendadas: no se especifican en la informacion disponible; el adaptador esta pensado para MLX (Apple Silicon) y para ejecucion on-device en telefono.
- Cabe en GPU consumer: si, en cualquier GPU con 2 GB o mas de VRAM en bf16, y en telefonos en el build 4-bit.
- Opciones de despliegue: MLX con `mlx-community/Llama-3.2-1B-Instruct-bf16` como base; llama.cpp u Ollama para el build GGUF 4-bit. El formato de prompt debe generarse con `agent/format.py` del repositorio de GitHub, ya que el modelo espera el system prompt exacto y las lineas JSON de llamada tal como se renderizan alli.
- Latencia y throughput: p50 de 0,68 s por consulta en un Mac Studio con el bucle servido y comprobaciones de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Eleccion de tool | Argumentos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama 3.2 1B + Spark Voice Trader LoRA | 1B | 1.152 tokens en entrenamiento | 90,8% | 89,9% | Llama 3.2 Community | Hugging Face (MLX y GGUF 4-bit) |
| Muse Glimmer 30B + Spark LoRA | 30B | no disponible | 77,7% | 79,0% | no disponible | no disponible |
| Muse Glimmer 30B base | 30B | no disponible | 61,8% | 58,4% | no disponible | no disponible |

No se dispone de datos de otros adaptadores de tool calling comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para las 14 herramientas del repositorio de GitHub y su formato de resultado; cualquier otra herramienta requiere reentrenamiento.
- El formato de prompt es estricto: debe generarse con `agent/format.py`; pequeñas desviaciones en el system prompt o en la lista de herramientas degradan el comportamiento.
- Los datos de mercado de la demo son sinteticos; el modelo no constituye asesoramiento financiero.
- Las ordenes se generan como tickets que requieren confirmacion humana; no debe permitirse ejecucion automatica sin validacion.
- Riesgo de alucinacion en los valores numericos mitigado parcialmente por el esquema de slots rellenados por codigo, pero no eliminado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados; el entrenamiento se realizo sobre preguntas de traders presumiblemente en ingles, sin confirmacion explicita.
- Ventana de contexto de entrenamiento limitada a 1.152 tokens, lo que restringe conversaciones largas y listas de herramientas extensas.
- Licencia Llama 3.2 Community: uso comercial permitido con las condiciones de Meta (incluida la clausula de nombrar "Built with Llama" y restricciones para entidades con mas de 700 millones de usuarios mensuales).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/leapsify/spark-voice-trader-llama-3.2-1b-lora
- Repositorio de codigo, herramientas, formato de prompt y evaluacion: https://github.com/beenow/spark-voice-trader
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Base en formato MLX: https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-bf16
