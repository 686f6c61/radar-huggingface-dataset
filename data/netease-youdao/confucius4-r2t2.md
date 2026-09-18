# netease-youdao/Confucius4-R2T2

## Resumen

Confucius4-R2T2 es un modelo de reconocimiento automatico del habla (ASR) en streaming disenado para transcripcion en tiempo real con baja latencia y alta precision. Lo desarrolla netease-youdao (NetEase Youdao) y se construye como un ajuste fino del modelo Qwen3-ASR-1.7B. Su propuesta central es una modalidad de salida de tipo append-only: el texto ya emitido se consolida de forma permanente y no se revisa, lo que evita el parpadeo y las reescrituras tipicas de los sistemas de transcripcion en directo.

El modelo permite configurar el tamano del bloque de decodificacion entre 80 ms y 2 s, ofreciendo un compromiso ajustable entre latencia y precision. Segun el autor, mantiene una precision cercana a la del reconocimiento offline con una latencia media de 200 a 600 ms, y la incorporacion del modo streaming no degrada la precision en modo offline. Integra un backend basado en vLLM para inferencia de alto rendimiento, ademas de un backend de Hugging Face `transformers`.

Con 2.038.052.480 parametros (unos 2,04 mil millones) y un repositorio de 4,1 GB, esta orientado a aplicaciones donde el texto debe procesarse o accionarse de inmediato: subtitulado en vivo, pipelines de PLN y agentes LLM, o traduccion simultanea. La sigla R2T2 significa "Real Real-Time Transcription". Su licencia es la NetEase Model Use License Agreement, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-ASR-1.7B (detalles internos no disponibles) |
| Parametros totales | 2.038.052.480 (~2,04 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en la informacion disponible |
| Idiomas soportados | Chino e ingles optimizados; se indica soporte de un rango amplio de idiomas adicionales (listado concreto no disponible) |
| Licencia | NetEase Model Use License Agreement (license: other) |
| Formato de pesos | safetensors |

Datos adicionales: pipeline `automatic-speech-recognition`, autor `netease-youdao`, creado el 2026-09-10 y actualizado el 2026-09-17, 73 descargas y 27 likes en el momento de la consulta. El repositorio ocupa 4,1 GB. El codigo asociado se distribuye bajo licencia Apache 2.0, mientras que los pesos usan la licencia de NetEase.

## Arquitectura y entrenamiento

R2T2 se construye sobre Qwen3-ASR (Qwen/Qwen3-ASR-1.7B), un modelo de reconocimiento de voz. La informacion disponible no detalla la arquitectura interna (tipo de encoder de audio, mecanismo de atencion ni dimensiones de las capas), por lo que este punto queda como no disponible. El modelo opera en modo streaming con bloques de decodificacion configurables entre 80 ms y 2 s.

El entrenamiento emplea un conjunto de tecnicas de construccion de datos descritas por el autor: datos de prefijo estable (stable-prefix data), datos de alineacion temporal forzada (forced time-alignment data) y segmentacion de audio a nivel de token. Sobre esta base se aplica un paradigma de aprendizaje denominado Longest Stable Prefix (LSP), que permite al modelo determinar dinamicamente cuando un prefijo estable puede emitirse con seguridad y cuando necesita mas contexto de audio. Al exponer unicamente prefijos estables, el modelo garantiza que el texto ya emitido no cambie mientras condiciona las predicciones siguientes. El autor anuncia que se publicara un informe tecnico con mas detalle. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en streaming en tiempo real con salida append-only (texto consolidado e inmutable).
- Decodificacion configurable con bloques de 80 ms a 2 s para ajustar el equilibrio latencia/precision.
- Reconocimiento offline sin perdida de precision respecto al modo streaming.
- Latencia media declarada de 200 a 600 ms.
- Soporte multilingue, con optimizacion para chino e ingles y cobertura de idiomas adicionales.
- Prompts de contexto y de hotwords (palabras clave) soportados de forma nativa.
- Backend de inferencia basado en vLLM para alto rendimiento, con alternativa mediante Hugging Face `transformers`.
- Integracion orientada a pipelines posteriores de PLN y agentes LLM, al ofrecer texto que no se revisa.

## Casos de uso

- Subtitulado y captioning en directo: el modo append-only evita que el texto ya mostrado se reescriba, lo que reduce el parpadeo en retransmisiones, clases o eventos con interpretacion simultanea.
- Pipelines de PLN en tiempo real: al consolidar el texto a medida que llega, se puede alimentar un analizador de sentimiento o un clasificador sin esperar al final del audio.
- Agentes de voz y asistentes conversacionales: los bloques configurables de 80 ms a 2 s permiten disparar la respuesta del agente antes de que el usuario termine de hablar, usando las hotwords para reconocer nombres propios o terminos de dominio.
- Traduccion simultanea de voz: la salida estable sirve como entrada fiable a un sistema de traduccion que no debe reprocesar fragmentos ya traducidos.
- Transcripcion de reuniones y actas: aunque el modelo esta optimizado para streaming, su precision offline se mantiene, lo que permite generar transcripciones completas posteriores a la reunion.
- Atencion al cliente automatizada: con soporte de contexto y hotwords, se pueden reconocer identificadores de producto, nombres o terminologia especifica durante la llamada.
- Accesibilidad: generacion de subtitulos en vivo para personas con discapacidad auditiva en entornos con requisitos de baja latencia.
- Analitica de audio en produccion: monitorizacion de emisiones, verificacion de contenido o indexacion de audio a medida que se emite.

## Benchmarks y rendimiento

La model card incluye secciones de evaluacion (rendimiento en streaming y precision en ingles y chino), pero los valores numericos concretos no estan presentes en la informacion disponible. El autor afirma que R2T2 alcanza un rendimiento de estado del arte (SOTA) en latencia y calidad de reconocimiento entre un conjunto de modelos de codigo abierto, y que resulta competitivo frente a sistemas cerrados lideres. No se han podido verificar las cifras concretas.

| Benchmark | Resultado |
|---|---|
| Precision en streaming (ingles) | No disponible en la informacion proporcionada |
| Precision en streaming (chino) | No disponible en la informacion proporcionada |
| Precision offline | No disponible en la informacion proporcionada |
| Comparativa frente a GPT-Live-Transcribe | Se menciona una comparacion lado a lado en el repositorio, sin cifras en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16/BF16 los pesos ocupan aproximadamente 4,1 GB; en cuantizacion INT8 alrededor de 2 GB y en INT4 en torno a 1-1,2 GB (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, asi como en GPU de datacenter (A100, H100) para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, dado el tamano (~2,04 mil millones de parametros).
- Opciones de despliegue: vLLM (backend principal, con soporte offline y streaming), Hugging Face `transformers` y despliegue mediante Docker segun el repositorio (se documentan opciones con Conda y uv).
- Latencia y throughput: se declara una latencia media de 200 a 600 ms en modo streaming. No se proporcionan cifras de throughput (tokens o segundos de audio por segundo) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-R2T2 | ~2,04 mil millones | No disponible | ASR streaming append-only, bloques 80 ms-2 s | NetEase Model Use License Agreement | Hugging Face, ModelScope |
| Qwen3-ASR-1.7B (modelo base) | 1,7 mil millones (nominal) | No disponible | ASR offline | Segun licencia de Qwen | Hugging Face |
| Otros sistemas ASR de codigo abierto (p. ej. variantes de Whisper) | No disponible | No disponible | ASR, principalmente offline con opciones de streaming | Variable | Variable |

La informacion disponible no incluye cifras comparativas verificables frente a alternativas concretas. El autor menciona comparaciones con GPT-Live-Transcribe en su repositorio, pero sin numeros en el material consultado.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible; al estar optimizado para chino e ingles, el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinacion y de errores de reconocimiento propio de los modelos ASR, especialmente con audio ruidoso, acentos no vistos o vocabulario muy especifico.
- La salida append-only implica que un error ya emitido no se corrige; el texto consolidado es definitivo, lo que puede propagar fallos a etapas posteriores.
- La lista concreta de idiomas soportados y el nivel de calidad por idioma no estan disponibles.
- No se especifica la longitud de contexto, lo que dificulta planificar el procesamiento de audios largos.
- Licencia: la NetEase Model Use License Agreement es una licencia propia (`license: other`), distinta de licencias permisivas como Apache 2.0 o MIT. Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones. El codigo del repositorio si es Apache 2.0, pero no los pesos.
- No se detallan los tipos de cuantizacion soportados, por lo que la integracion en entornos con restricciones de memoria requiere verificacion previa.
- El modelo depende de Qwen3-ASR como base, por lo que hereda las limitaciones de ese modelo.

## Enlaces

- Hugging Face: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Repositorio GitHub: https://github.com/netease-youdao/Confucius4-R2T2
- README en chino: https://github.com/netease-youdao/Confucius4-R2T2/blob/master/README.zh.md
- Licencia del modelo: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
- Licencia del codigo (Apache 2.0): https://github.com/netease-youdao/Confucius4-R2T2/blob/master/LICENSE
- Demo online: https://r2t2.youdao.com/demo
- ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-R2T2
- Sitio web del proyecto: https://r2t2.ai/
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
