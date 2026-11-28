# detal65/corri-quick

## Resumen

Corri-quick (identificador `detal65/corri-quick`) es una publicacion derivada del modelo Qwen2.5-1.5B-Instruct de Alibaba, empaquetada para su despliegue en dispositivos moviles mediante la pila LiteRT (anteriormente TFLite) de Google. El autor del repositorio es el usuario `detal65`, y la model card incluida reproduce integramente la documentacion del repositorio oficial `litert-community/Qwen2.5-1.5B-Instruct`, que es la fuente real de los artefactos y de las variantes cuantizadas.

El modelo base es un transformer denso de 1.500 millones de parametros con capacidad de instruccion, pensado para generacion de texto y chat. Su interes radica en que las variantes publicadas (formato `.task` para MediaPipe y `.litertlm` para LiteRT-LM) permiten ejecutar inferencia local en Android, iOS y Web sin conexion a la nube, con cuantizacion int8 dinamica que reduce el peso a unos 1.598 MB.

La relevancia actual es la de un modelo pequeno de proposito general que cabe en un telefono movil de gama alta y ofrece latencias de decodificacion de entre 26 y 34 tokens por segundo en CPU y GPU de un Samsung S25 Ultra. El repositorio ocupa 42 GB porque agrupa multiples variantes y precisiones (fp32, int8, distintas longitudes de contexto), no porque el modelo en si tenga ese tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.280 y 4.096 tokens segun variante empaquetada (el modelo base admite hasta 32.768, pero las variantes LiteRT publicadas usan 1.280 y 4.096) |
| Tipos de cuantizacion | fp32 (baseline) y dynamic_int8 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.task` (MediaPipe LLM Inference API) y `.litertlm` (LiteRT-LM); el modelo base original en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer denso de tipo decoder-only con atencion causal estandar, desarrollado por el equipo Qwen de Alibaba. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen, que no se incluye en este repositorio.

La aportacion tecnica de esta publicacion no es el entrenamiento sino el empaquetado para edge: las variantes se compilan con la pila LiteRT y se ofrecen con firmas de prefill multiples (multi-prefill-seq), lo que permite acelerar el procesamiento inicial del prompt. Se incluyen dos longitudes de contexto empaquetadas (1.280 y 4.096 tokens, con clave-valor `ekv1280` y `ekv4096`) y dos precisiones (fp32 e int8 dinamica). El fichero `Qwen2.5-1.5B-Instruct_multi-prefill-seq_q8_ekv4096.litertlm` requiere LiteRT-LM 0.18.0 o superior.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones.
- Generacion de codigo y matematicas a nivel de modelo pequeno (sin datos de benchmark publicados en este repo).
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Instruct (no verificado de forma explicita en la model card de este repositorio).
- Capacidad multilingue del modelo base Qwen2.5 (no se detalla la lista de idiomas en la informacion proporcionada).
- Inferencia local en Android mediante LiteRT-LM o MediaPipe LLM Inference API (esta ultima en modo solo mantenimiento).
- Inferencia en iOS mediante MediaPipe (solo mantenimiento) y en Web mediante la pila LiteRT.
- No se mencionan capacidades de vision, audio ni modo thinking extendido en la informacion disponible.

## Casos de uso

- Asistente de chat offline en aplicaciones Android: integrando la libreria `com.google.ai.edge.litertlm:litertlm-android` y cargando la variante int8 con contexto 4.096, la app puede ofrecer conversacion multi-turno sin conexion y con unos 26 tokens/s de decodificacion en CPU.
- Procesamiento de texto en el dispositivo para privacidad: al ejecutarse localmente, los datos del usuario no salen del telefono, lo que encaja en escenarios de salud, finanzas personales o mensajeria sensible.
- Clasificacion y resumen de notas o correos en el movil: con 1.280 tokens de contexto basta para resumir mensajes cortos y etiquetarlos, aprovechando el prefill rapido en GPU (hasta 1.667 tokens/s).
- Generacion de respuestas sugeridas en teclados y apps de mensajeria: la variante int8 con contexto 1.280 y 30,88 tokens/s de decodificacion en GPU permite autocompletar respuestas con baja latencia.
- Prototipado rapido en Colab o portatil: aunque el rendimiento en Colab es peor que en dispositivo, sirve para validar prompts y flujos antes de empaquetar la app movil.
- Educacion y demos de IA en el borde: el modelo cabe en memoria de un telefono de gama alta (unos 1,8-2,2 GB de RSS en las pruebas) y permite construir tutoriales de inferencia local sin infraestructura de servidor.
- Filtrado y moderacion de texto en el dispositivo: tareas de clasificacion o reescritura breve que se benefician de no enviar contenido a la nube.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden a mediciones en un Samsung S25 Ultra con firmas de prefill multiples habilitadas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Backend | Cuantizacion | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamano modelo (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | fp32 (baseline) | 1.280 | 49,50 | 10 | 21,25 | 6.182 | 6.254 | N/A |
| CPU | dynamic_int8 | 1.280 | 297,58 | 34,25 | 3,71 | 1.598 | 1.997 | N/A |
| CPU | dynamic_int8 | 4.096 | 162,72 | 26,06 | 6,57 | 1.598 | 2.216 | N/A |
| GPU | dynamic_int8 | 1.280 | 1.667,75 | 30,88 | 3,63 | 1.598 | 1.846 | 1.505 |
| GPU | dynamic_int8 | 4.096 | 933,45 | 27,30 | 4,77 | 1.598 | no disponible en el extracto | no disponible en el extracto |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB de peso en int8 y entre 1,8 y 2,2 GB de RSS pico en dispositivo movil; en fp32 el peso sube a unos 6,2 GB y el RSS a 6,25 GB, lo que lo hace inviable en telefonos.
- GPU recomendadas: no aplica el concepto de GPU de servidor; el objetivo son GPU integradas de moviles (Adreno en Snapdragon, Mali en Exynos) y CPU ARM. En escritorio podria ejecutarse con la pila LiteRT, pero no es el objetivo declarado.
- Cabe en GPU de consumo: si, en el sentido de que cabe en un telefono de gama alta; en cuanto a GPU de escritorio, no hay datos publicados de ejecucion con LiteRT en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM (Android, via `litertlm-android`), MediaPipe LLM Inference API (Android e iOS, en modo solo mantenimiento), Edge Gallery App de Google, y la pila LiteRT para Web. No se mencionan vLLM, llama.cpp, Ollama ni TGI para estas variantes.
- Latencia y throughput: en Samsung S25 Ultra, TTFT de 3,63-4,77 s con int8 y decodificacion de 26-34 tokens/s; el prefill en GPU alcanza 1.667 tokens/s con contexto 1.280.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato edge | Notas |
|---|---|---|---|---|---|
| detal65/corri-quick (este) | 1,5B | 1.280 / 4.096 empaquetados | Apache 2.0 | LiteRT `.task` / `.litertlm` | Derivado de Qwen2.5-1.5B-Instruct |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors (no edge) | Modelo base original, sin empaquetado movil |
| litert-community/Qwen2.5-1.5B-Instruct | 1,5B | 1.280 / 4.096 | Apache 2.0 | LiteRT `.task` / `.litertlm` | Repositorio oficial del que este deriva |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas como Gemma 2B o Phi-3-mini en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una copia derivada: la model card del repositorio `detal65/corri-quick` reproduce la de `litert-community/Qwen2.5-1.5B-Instruct`, por lo que la autoria real del empaquetado y del modelo base corresponde a Google y Alibaba respectivamente, no al autor del repo.
- Con 1,5B parametros, la calidad en razonamiento complejo, matematicas avanzadas y codigo es limitada en comparacion con modelos de mayor tamano; no se han publicado benchmarks que lo cuantifiquen en este repositorio.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas factuales y contextos largos.
- El contexto empaquetado es de 1.280 o 4.096 tokens, muy inferior a los 32.768 del modelo base, lo que restringe conversaciones y documentos largos.
- No se detalla la lista de idiomas soportados ni la calidad por idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5 y de los artefactos LiteRT de Google antes de distribuir.
- MediaPipe LLM Inference API esta en modo solo mantenimiento; para produccion se recomienda LiteRT-LM 0.18.0 o superior.
- El rendimiento medido corresponde a un Samsung S25 Ultra; en dispositivos de gama media o baja la latencia y el consumo de memoria pueden degradarse notablemente.
- El repositorio ocupa 42 GB por acumular variantes y precisiones; descargar solo el fichero necesario para el dispositivo objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/detal65/corri-quick
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial LiteRT del mismo modelo: https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct
- LiteRT (antes TFLite): https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Guia LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- Guia LLM Inference para iOS: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/ios
- Edge Gallery App: https://github.com/google-ai-edge/gallery
- Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct/blob/main/notebook.ipynb
