# arvins01/faster-whisper-small

## Resumen

`arvins01/faster-whisper-small` es la conversion del modelo de reconocimiento automatico del habla `openai/whisper-small` al formato de CTranslate2, publicada por el usuario arvins01. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia optimizado que empaqueta los pesos originales de Whisper small en FP16 para su uso con CTranslate2 y con la libreria faster-whisper, que implementa una reescritura del pipeline de Whisper sobre este motor.

El modelo resuelve el problema de transcribir audio a texto con un coste computacional reducido en comparacion con la implementacion original en PyTorch. Whisper small es un transformer encoder-decoder de tipo seq2seq con aproximadamente 244 millones de parametros, entrenado por OpenAI sobre 680.000 horas de audio etiquetado y multilingue. La conversion a CTranslate2 permite ejecutar la inferencia con cuantizacion int8 o float16, lo que reduce el uso de memoria y acelera la decodificacion en CPU y GPU.

Su relevancia actual radica en que faster-whisper se ha consolidado como una de las vias mas eficientes para desplegar Whisper en produccion, y este repositorio ofrece una version lista para usar del checkpoint small con licencia MIT. La model card es minima: se limita a documentar el comando de conversion y un ejemplo de uso, sin resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper, convertido a CTranslate2 |
| Parametros totales | aproximadamente 244 millones (corresponde a whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper) |
| Tipos de cuantizacion | pesos almacenados en FP16; permite int8, int8_float16, float16 y float32 al cargar via `compute_type` |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (directorio con `model.bin`, `config.json`, `tokenizer.json`, `vocabulary.json` y `preprocessor_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atencion completa, 12 capas en el encoder y 12 en el decoder, dimension de modelo 768 y 12 cabezas de atencion. El encoder procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos y el decoder genera tokens de texto autoregresivamente, con tokens especiales de idioma, tarea (transcribir o traducir) y marcas de tiempo. El entrenamiento original lo realizo OpenAI sobre 680.000 horas de audio multilingue y multitarea, combinando transcripcion, traduccion al ingles y prediccion de marcas de tiempo, sin RLHF ni DPO.

La contribucion de este repositorio no es el entrenamiento, sino la conversion: el comando `ct2-transformers-converter` transforma los pesos de PyTorch a formato CTranslate2 con cuantizacion float16, copiando `tokenizer.json` y los ficheros de preprocesado. CTranslate2 aplica optimizaciones de inferencia como fusion de operaciones, gestion eficiente de memoria y soporte de cuantizacion dinamica, lo que se traduce en una reduccion sustancial de latencia y VRAM frente a la implementacion de referencia. No hay innovaciones de arquitectura propias ni datos de entrenamiento adicionales.

## Capacidades

- Transcripcion automatica del habla multilingue en 99 idiomas, con deteccion automatica del idioma de entrada.
- Traduccion de audio a texto en ingles desde cualquiera de los idiomas soportados (tarea `translate`).
- Prediccion de marcas de tiempo a nivel de segmento y de palabra (word timestamps en faster-whisper).
- Segmentacion por voz (VAD) opcional en faster-whisper para mejorar la calidad en audios largos con silencios.
- Procesamiento de audio de cualquier duracion mediante troceado en ventanas de 30 segundos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR.
- No dispone de vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y videollamadas: el modelo procesa el audio en ventanas de 30 segundos y faster-whisper gestiona la segmentacion por VAD, lo que permite transcribir grabaciones de horas con marcas de tiempo por segmento.
- Subtitulado automatico de video: la prediccion de timestamps por palabra permite generar ficheros SRT o VTT alineados con el habla, util en plataformas de contenido y pipelines de postproduccion.
- Indexacion y busqueda de archivos de audio: transcribir podcasts, clases o llamadas de atencion al cliente para construir indices de texto buscables sobre los que aplicar busqueda semantica o palabras clave.
- Traduccion de contenido audiovisual al ingles: usando la tarea `translate`, se obtiene texto en ingles directamente desde audio en cualquiera de los idiomas soportados, sin pasar por una etapa intermedia de traduccion de texto.
- Despliegue en CPU sin GPU: con cuantizacion int8, faster-whisper ejecuta el modelo small en servidores sin acelerador, lo que lo hace adecuado para entornos on-premise con presupuesto de hardware limitado.
- Preprocesado de datasets de voz: transcripcion masiva de corpus de audio para generar etiquetas o para alimentar pipelines de entrenamiento de otros modelos de habla.
- Asistentes de voz en tiempo real: la latencia reducida de CTranslate2 con float16 en GPU permite transcripcion casi en vivo para dictado o comandos de voz, aunque el tamano small limita la precision frente a variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER, latencia ni comparaciones, y se remite a la model card original de `openai/whisper-small` para mas informacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en float16 y alrededor de 0,3 GB en int8, segun el tamano del repositorio (0,5 GB) y el numero de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. En GPUs modernas el cuello de botella suele ser el preprocesado de audio, no el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: faster-whisper (Python), CTranslate2 directamente, WhisperX sobre faster-whisper, y servidores compatibles con el formato CTranslate2. No es compatible con llama.cpp, Ollama ni vLLM, que no soportan este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, la conversion a CTranslate2 con int8 suele ofrecer aceleraciones notables frente a la implementacion PyTorch original, pero no se aportan cifras concretas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| arvins01/faster-whisper-small | ~244 M | 30 s por segmento | 99 | MIT | CTranslate2 |
| openai/whisper-small | ~244 M | 30 s por segmento | 99 | MIT | PyTorch (safetensors/bin) |
| openai/whisper-base | ~74 M | 30 s por segmento | 99 | MIT | PyTorch |
| openai/whisper-medium | ~769 M | 30 s por segmento | 99 | MIT | PyTorch |

La comparacion directa mas relevante es con `openai/whisper-small`: mismos pesos y misma precision esperada, pero con un motor de inferencia optimizado que reduce latencia y memoria. Frente a `whisper-base`, el modelo small ofrece mayor precision a costa de mas computo; frente a `whisper-medium`, es mas ligero y rapido pero con menor calidad en acentos dificiles y audio ruidoso. No se dispone de datos de benchmarks en la informacion proporcionada para cuantificar estas diferencias.

## Limitaciones y advertencias

- Alucinacion: Whisper puede generar texto plausible en segmentos con silencio, ruido o habla ininteligible; es un comportamiento conocido del modelo original y no se corrige con la conversion.
- Sesgos: el modelo hereda los sesgos del corpus de entrenamiento de OpenAI, con posible peor rendimiento en variedades dialectales, acentos no estandar y lenguas de bajos recursos.
- Precision limitada por el tamano: al ser la variante small, su WER es superior al de medium y large, especialmente en audio con ruido de fondo o solapamiento de hablantes.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones adicionales, pero el modelo deriva de Whisper de OpenAI, por lo que conviene revisar los terminos del modelo original.
- Repositorio con pocas descargas y sin mantenimiento documentado: la model card no incluye informacion sobre validacion, versionado ni soporte; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- Dependencia del ecosistema CTranslate2: no es portable a otros motores de inferencia sin reconvertir los pesos.
- Sin soporte de audio en streaming nativo: faster-whisper trocea el audio en ventanas, lo que introduce latencia en aplicaciones en tiempo real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arvins01/faster-whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- faster-whisper: https://github.com/systran/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentacion de cuantizacion de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
- Paper de Whisper: https://arxiv.org/abs/2212.04356
