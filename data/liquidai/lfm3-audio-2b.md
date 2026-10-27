# LiquidAI/LFM3-Audio-2B

## Resumen

LFM3-Audio-2B es un modelo any-to-any de audio desarrollado por Liquid AI dentro de la familia LFM3, que incluye variantes base, texto, visión, audio, omni y de decisión. Acepta texto o audio como entrada y produce texto, habla a 24 kHz o una secuencia intercalada de ambos, con una longitud de contexto de 32K tokens compartida entre entrada y salida. Con 2.002.332.928 parámetros reales según los pesos en safetensors, está diseñado para ejecutarse localmente en portátiles y dispositivos edge, no solo en servidores con GPU de datacenter.

El modelo combina un backbone LFM3, un codificador de audio causal propio y el tokenizador de audio LiquidCodec, también desarrollado internamente, que según el autor mejora la calidad de voz respecto a LFM2.5-Audio. Cubre 18 idiomas (19 locales, al distinguir inglés británico y americano) y está orientado a conversación por voz, transcripción, síntesis y traducción de habla, comprensión y razonamiento sobre eventos sonoros, y tool calling a partir de peticiones habladas.

Su relevancia actual reside en la combinación de tres factores: tamaño reducido (2B), soporte nativo de streaming (codificación causal, prefill incremental y generación de voz en streaming) y cobertura multilingüe amplia en un único checkpoint. La contrapartida es que la información pública disponible no incluye resultados de benchmarks ni detalles de cuantización, lo que limita la evaluación comparativa antes de desplegarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 con codificador de audio causal y tokenizador de audio LiquidCodec |
| Parametros totales | 2.002.332.928 (2B) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 32K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 18 idiomas / 19 locales: arabe, danes, aleman, griego, ingles britanico, ingles americano, finlandes, frances, hebreo, italiano, japones, coreano, neerlandes, polaco, portugues, espanol, sueco, turco, chino |
| Licencia | lfm1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |
| Entrada | Texto o audio; el codificador de audio opera a 16 kHz |
| Salida | Texto, voz a 24 kHz, o texto y voz intercalados |
| Streaming | Codificacion de audio causal, prefill incremental y generacion de voz en streaming |
| Pipeline declarado | any-to-any |
| Descargas / likes | 156 descargas, 36 likes |
| Tamano del repositorio | 52,5 GB |
| Fechas | Creado el 2026-09-08, actualizado el 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es propia de la familia LFM3: un backbone de lenguaje al que se acoplan dos componentes de audio específicos, un codificador de audio causal y el tokenizador LiquidCodec. El codificador causal es lo que habilita el procesamiento de audio en streaming, ya que no necesita el segmento completo para empezar a producir representaciones. El tokenizador LiquidCodec convierte la salida de voz en tokens de audio que el backbone genera de forma autorregresiva, lo que permite intercalar texto y habla en una misma secuencia de salida. La entrada de audio se muestrea a 16 kHz y la salida de voz se sintetiza a 24 kHz.

No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la configuración de capas, dimensiones ocultas ni el mecanismo de atención del backbone. El autor sí señala explícitamente que el codificador y el tokenizador son internos y que sustituyen a los de LFM2.5-Audio con el objetivo de mejorar la calidad de voz. Para el entrenamiento reproducible y las recetas exactas, la referencia es el blog de release de la familia LFM3.

## Capacidades

- Conversación por voz: responder a preguntas habladas con respuestas en texto y voz en streaming; en respuestas solo de texto el modelo puede razonar antes de contestar.
- Reconocimiento automático de habla (ASR) en los 18 idiomas declarados.
- Síntesis de voz (TTS) a 24 kHz, con salida intercalada de texto y habla.
- Traducción de habla entre los idiomas soportados.
- Comprensión de audio y razonamiento sobre eventos: interpretar grabaciones y responder preguntas sobre el habla, los sonidos y los eventos que contienen.
- Tool calling / function calling a partir de peticiones habladas, con texto o voz acompañando a la llamada.
- Procesamiento en streaming de audio de entrada y de salida.
- Capacidad any-to-any: combinaciones texto→texto, texto→voz, audio→texto, audio→voz y mixtas.
- Multilingüismo nativo en un único checkpoint, con distinción de locale para inglés británico y americano.

## Casos de uso

- Atención al cliente telefónica: el modelo puede recibir audio del cliente, transcribirlo y responder con voz en streaming, manteniendo el contexto de la conversación dentro de la ventana de 32K tokens. La codificación causal permite empezar a responder sin esperar a que el usuario termine de hablar.
- Asistentes de voz embebidos en dispositivos: al ser un modelo de 2B y estar pensado para portátiles y edge, se puede integrar en altavoces, wearables o sistemas de infoentretenimiento donde no hay conectividad o no se quiere enviar audio a la nube.
- Transcripción y traducción de reuniones multilingües: ASR más traducción de habla en los 18 idiomas declarados, con salida de texto para actas y, opcionalmente, voz sintetizada para resúmenes.
- Control de aplicaciones por voz con tool calling: convertir una petición hablada en una llamada a función (por ejemplo, abrir una incidencia, consultar un estado o encender un dispositivo) y confirmar la acción por voz.
- Análisis de grabaciones y monitorización: responder preguntas sobre el contenido de un audio (quién habla, qué eventos se oyen, qué se ha dicho) en aplicaciones de compliance, auditoría de call centers o análisis de entornos industriales.
- Accesibilidad: lectura de documentos en voz alta, dictado por voz y respuestas habladas para usuarios con discapacidad visual o motriz, con la ventaja de ejecución local para proteger datos personales.
- Prototipado rápido de agentes de voz: al estar en `transformers` con `custom_code` y disponible vía API y playground de Liquid AI, sirve para validar flujos conversacionales antes de invertir en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La información proporcionada no incluye cifras de MMLU, HumanEval, GSM8K, WER de ASR, MOS de síntesis ni comparaciones numéricas con otros modelos. El autor solo afirma una mejora cualitativa de la calidad de voz respecto a LFM2.5-Audio.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 2.002 millones de parámetros, sin contar el codificador y el tokenizador de audio): aproximadamente 4 GB en BF16/FP16, unos 2,1 GB en INT8 y en torno a 1,2 GB en INT4. Añadir margen para caché KV con contexto de hasta 32K tokens y para los componentes de audio.
- GPU de datacenter: A100, H100 o L40S para despliegues concurrentes con contexto largo y streaming; no son necesarias para una sola sesión.
- GPU de consumo: cabe en tarjetas con 8 GB o más en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); con cuantización a 4-8 bits podría ejecutarse en GPUs integradas o en dispositivos con 2-4 GB dedicados, aunque no hay cifras oficiales de rendimiento en ese escenario.
- CPU: el autor indica ejecución local en portátiles; no se especifican requisitos mínimos de CPU ni velocidades de inferencia.
- Opciones de despliegue: la librería declarada es `transformers` con código personalizado (`custom_code`), lo que implica `trust_remote_code=True`. No se confirma en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles. La arquitectura causal y el prefill incremental están diseñados para reducir la latencia de primera respuesta en audio, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| LFM3-Audio-2B | 2,0B | 32K | 18 | lfm1.0 | safetensors | Codificador y LiquidCodec propios; streaming; tool calling |
| LFM2.5-Audio (predecesor, Liquid AI) | No disponible | No disponible | No disponible | No disponible | No disponible | Referencia directa del autor; LFM3 mejora la calidad de voz según la model card |
| Alternativas de audio any-to-any (Qwen2-Audio, MiniCPM-o, Moshi, entre otras) | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No se dispone de datos comparativos en la informacion proporcionada |

No se han encontrado en la información proporcionada resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. Cualquier comparación de rendimiento debería hacerse con evaluaciones propias sobre el dominio objetivo (WER, MOS, latencia y tasa de acierto en tool calling).

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay métricas verificables de calidad de ASR, TTS, traducción o tool calling, lo que dificulta justificar su elección frente a alternativas en un proceso de evaluación formal.
- Licencia lfm1.0: es una licencia propia (etiquetada como `other`), no una licencia open source estándar. Hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede incluir restricciones de uso, de redistribución o de atribución.
- Riesgo de alucinación en comprensión de audio: como cualquier modelo generativo, puede describir eventos o contenidos sonoros que no están presentes en la grabación, especialmente con audio ruidoso o solapamiento de hablantes.
- Contexto compartido: los 32K tokens cubren entrada y salida, y el audio consume tokens, por lo que sesiones de voz largas o grabaciones extensas agotan la ventana antes de lo que sugiere la cifra.
- Cobertura desigual por idioma: se declaran 18 idiomas, pero no se especifica el volumen de datos por lengua; el rendimiento en idiomas con pocos recursos (por ejemplo, finlandés, griego o hebreo) puede ser inferior al de inglés o español.
- Ejecución con código remoto: requiere `custom_code` y `trust_remote_code=True`, lo que implica revisar y confiar en el código del repositorio antes de ejecutarlo en entornos de producción.
- Repositorio de 52,5 GB: el tamaño del repo excede con creces el peso de un modelo de 2B en BF16, probablemente por múltiples artefactos; hay que planificar el almacenamiento y la descarga selectiva.
- Sin datos de cuantización ni de rendimiento en edge: la afirmación de ejecución en portátiles no viene acompañada de cifras de latencia ni de requisitos mínimos, por lo que hay que validarla en el hardware objetivo.
- Idiomas y locales: la calidad puede variar entre inglés británico y americano, y no se detalla el comportamiento en code-switching o en acentos no nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Archivo de licencia: https://huggingface.co/LiquidAI/LFM3-Audio-2B/blob/main/LICENSE
- Blog de release de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo de referencia de la familia (texto): https://huggingface.co/LiquidAI/LFM3-1.7B
