# kungfupanda12/bolo-tiny

## Resumen

Bolo Tiny es un modelo de comprensión de comandos de voz para hinglish (mezcla de hindi y inglés) desarrollado por el autor independiente kungfupanda12 dentro del proyecto Bolo, un asistente de voz offline. El modelo recibe un comando escrito en alfabeto latino, devanagari o una mezcla de ambos y devuelve la intención detectada junto con los slots asociados (carpeta, aplicación, contacto, nivel de volumen, etc.), cubriendo 20 tipos de comando más la clase "none".

Se trata de un transformer de solo 2 capas y 695.768 parámetros (0,69 M) construido desde cero, que opera sobre características *PhonoHash*: n-gramas de caracteres hasheados del texto, su transliteración, una clave fonética y un esqueleto consonántico. Este diseño hace que variantes ortográficas como *kholo*, *khol do* o खोलो caigan cerca en el espacio de representaciones, lo que resulta clave para un dominio con tanta variabilidad ortográfica.

Su relevancia radica en la eficiencia extrema: 0,8 MB en formato int8 ONNX y aproximadamente 1 ms de latencia en un solo hilo de CPU, lo que lo hace apto para despliegue en dispositivo. Compite con reglas escritas a mano (87,4 % frente a 84,9 % de exact match sintético) y se aproxima a un MuRIL-base afinado de 950 MB (91,6 %) con tres órdenes de magnitud menos de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 2 capas sobre características PhonoHash (n-gramas de caracteres hasheados, transliteración, clave fonética y esqueleto consonántico) |
| Parametros totales | 695.768 (0,69 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (export ONNX); pesos originales en safetensors y PyTorch (state dict) |
| Idiomas soportados | Hindi (hi) e inglés (en), con hinglish y code-switching; escritura latina, devanagari y mixta |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch (`model.pt`, state dict plano), ONNX (`bolo_tiny.onnx` y `bolo_tiny.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas y 0,69 M de parámetros que no procesa tokens textuales convencionales, sino características *PhonoHash* derivadas del texto de entrada: n-gramas de caracteres hasheados, la transliteración del comando, una clave fonética y un esqueleto consonántico. Esta representación está pensada para que las variantes de escritura y pronunciación de un mismo comando queden próximas entre sí, algo crítico en hinglish, donde un mismo comando puede aparecer en latín, en devanagari o en una mezcla.

El checkpoint por defecto (`phono_views_aug_asr-s0`) se entrenó con texto sintético generado a partir de plantillas y con transcripciones de clips TTS producidos por el modelo de voz, de modo que el modelo ha visto errores realistas de reconocimiento de voz. El autor documenta ablaciones: PhonoHash aporta +5,0 puntos, el aumento de datos +6,4 y las vistas multi-escritura +2,5, mientras que una pérdida de consistencia entre escrituras restó 1,4 puntos y la destilación desde MuRIL restó 4,0. No se ha publicado el número de tokens de entrenamiento ni la composición detallada del dataset. El export ONNX corresponde a un modelo anterior solo de texto (`phono_views_aug-s0`).

## Capacidades

- Clasificación de intención entre 20 tipos de comando más la clase "none".
- Extracción de slots (etiquetado de tokens) para entidades como carpeta, aplicación, contacto o nivel.
- Comprensión de comandos en escritura latina, devanagari y mixta, con tolerancia a variantes ortográficas y fonéticas.
- Robustez ante errores típicos de ASR, gracias al entrenamiento con transcripciones de TTS.
- Inferencia en dispositivo: 0,8 MB en int8 y aproximadamente 1 ms por comando en un hilo de CPU.
- No soporta tool calling genérico, razonamiento multi-paso, agentes, visión ni audio de forma nativa; su función es exclusivamente la comprensión de comandos de un dominio cerrado.

## Casos de uso

- Asistente de voz offline en hinglish: el modelo recibe la transcripción del ASR y devuelve intención y slots para ejecutar acciones locales (abrir terminal, ajustar volumen) sin conexión a red, gracias a su tamaño de 0,8 MB y latencia de ~1 ms.
- Automatización de escritorio por comandos: integrado en el pipeline de Bolo, traduce frases como "bhai rust learning folder mein terminal kholo" en la acción `open_terminal` con la carpeta correspondiente, lo que permite controlar el sistema operativo por voz.
- Despliegue en dispositivos de recursos limitados: al caber en int8 ONNX y ejecutarse en un solo hilo de CPU, es adecuado para Raspberry Pi, móviles o sistemas embebidos donde un transformer de cientos de MB no es viable.
- Sustituto de reglas heurísticas en asistentes existentes: ofrece 87,4 % de exact match frente al 84,9 % de las reglas escritas a mano y reduce las acciones falsas del 18,7 % al 5,2 %.
- Investigación en eficiencia y multilingüismo: sirve como caso de estudio de representaciones fonéticas (PhonoHash) para dominios con alta variabilidad ortográfica y code-switching, con todos los checkpoints de semillas y ablaciones publicados.
- Preprocesado de intenciones en pipelines de voz: puede actuar como primera etapa de clasificación rápida antes de modelos mayores, filtrando comandos claros y derivando solo los ambiguos a un modelo más grande como MuRIL.

## Benchmarks y rendimiento

| Modelo | Exact match sintético | Acciones falsas | Tamaño | Latencia |
|---|---|---|---|---|
| Reglas escritas a mano | 84,9 | 18,7 % | – | 0,01 ms |
| Bolo Tiny (3 semillas) | 87,4 | 5,2 % | 0,8 MB | ~1 ms |
| MuRIL-base afinado | 91,6 | 3,6 % | 950 MB | 15,6 ms |

Con *grounding* (verificar que la carpeta o aplicación existe en la máquina), Bolo Tiny alcanza 95,8 % frente al 96,4 % de MuRIL. Los resultados con voz real están en la model card de Bolo Sun y provienen de un único hablante hasta la fecha.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo int8 ocupa 0,8 MB y los pesos safetensors están en el rango de unos pocos MB.
- GPU recomendadas: ninguna; está diseñado para CPU.
- Cabe en cualquier GPU de consumo, pero su uso previsto es CPU en un solo hilo.
- Opciones de despliegue: ONNX Runtime (export int8 o float), PyTorch con el paquete `bolo` (`bolo.models.tiny`), que incluye el featurizador PhonoHash necesario para la carga.
- Latencia y throughput: aproximadamente 1 ms por comando en un hilo de CPU según el autor; no se han publicado cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match sintético | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bolo Tiny | 0,69 M | No disponible | 87,4 | Apache-2.0 | Hugging Face y GitHub |
| MuRIL-base afinado | ~950 MB | No disponible | 91,6 | No disponible en la información | Referencia comparativa del autor |
| Reglas escritas a mano | No aplica | No aplica | 84,9 | No aplica | Baseline del proyecto Bolo |

No se dispone de información sobre otros modelos comparables de comprensión de comandos en hinglish de tamaño similar.

## Limitaciones y advertencias

- Errores confiados en frases casi coincidentes: por ejemplo, "naya folder banao" se clasifica de forma incorrecta con alta seguridad.
- "kuch bhi random baat" se interpreta como una llamada a un contacto llamado "random".
- Todo el texto de entrenamiento es sintético (plantillas propias y transcripciones de TTS), lo que puede no cubrir la distribución real del habla.
- Los resultados con voz real provienen de un solo hablante, por lo que la generalización a otros acentos o condiciones acústicas no está validada.
- Dominio cerrado de 20 intenciones más "none"; no es un modelo de propósito general ni admite instrucciones arbitrarias.
- La carga requiere el paquete `bolo` del repositorio de GitHub, ya que el featurizador PhonoHash forma parte de él y no está incluido en el repositorio de Hugging Face.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción fuera del dominio evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kungfupanda12/bolo-tiny
- Modelo Bolo Sun: https://huggingface.co/kungfupanda12/bolo-sun
- Repositorio GitHub del proyecto Bolo: https://github.com/Optimus2007/bolo
- Documento de ablaciones y experimentos: https://github.com/Optimus2007/bolo/blob/main/docs/WHAT_WE_TRIED.md
- Release con checkpoints de semillas y ablaciones: https://github.com/Optimus2007/bolo/releases/tag/weights-v1
