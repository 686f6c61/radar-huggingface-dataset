# soshi-irie/whisper-twi-v2

## Resumen

Whisper Twi v2 es un modelo de reconocimiento automático del habla (ASR) especializado en twi, una lengua kwa hablada principalmente en Ghana por varios millones de personas. Lo publica el usuario soshi-irie como un fine-tuning del modelo tiffany101/whisper-twi-v2, a su vez derivado de la familia Whisper de OpenAI. El modelo resuelve el problema de la transcripción de audio en una lengua con escasos recursos, donde los sistemas ASR multilingües genéricos rinden de forma deficiente.

Técnicamente es un transformer encoder-decoder de tipo Whisper con 37,76 millones de parámetros totales, lo que corresponde a la variante tiny de la familia. Está entrenado sobre el dataset twi-financial-inclusion (soshi-irie/twi-sst-model-v2), orientado al dominio financiero, y declara un WER de 8,85 sobre el split de test. Su relevancia actual radica en la escasez de modelos ASR abiertos para lenguas africanas de bajos recursos y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

El modelo se distribuye en formato safetensors con un repositorio de 0,6 GB y es compatible con la librería transformers y con endpoints de inferencia estándar. No obstante, la documentación publicada por el autor es mínima y no detalla composición del dataset, procedencia de los datos ni evaluación fuera del dominio financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, variante tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de Whisper, 30 s por segmento, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | twi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un encoder que procesa espectrogramas mel logarítmicos del audio y un decoder autorregresivo que genera tokens de transcripción, con atención cruzada entre ambos. Con 37,76 millones de parámetros corresponde a la configuración tiny de la familia, la más ligera de las cinco variantes publicadas por OpenAI. El fine-tuning parte de tiffany101/whisper-twi-v2, un modelo previo ya adaptado al twi, lo que sitúa a esta versión como un segundo ajuste sobre el mismo idioma.

El entrenamiento se realizó con el Trainer de transformers (versión 5.24.0) sobre PyTorch 2.13.0+cu132, con AdamW fused, learning rate de 1e-5, scheduler lineal con 500 pasos de warmup, batch de 16 en entrenamiento y 8 en evaluación, precisión mixta AMP nativa, semilla 42 y 4000 pasos totales (aproximadamente 2,5 épocas). El dataset empleado es twi-financial-inclusion (soshi-irie/twi-sst-model-v2), de dominio financiero. No se documentan el número de tokens de audio, la composición del corpus, ni si hubo etapas de RLHF o DPO; al ser un modelo ASR, esas técnicas no resultan habituales.

## Capacidades

- Reconocimiento automático del habla en twi: transcripción de audio a texto en esta lengua.
- Fine-tuning específico de dominio financiero, orientado a vocabulario y expresiones del sector.
- Compatible con el pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de inferencia estándar (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta capacidad multilingüe más allá del twi.
- No se documenta modo thinking, visión ni audio más allá del propio ASR.

## Casos de uso

- Transcripción de entrevistas y encuestas de inclusión financiera: el modelo se ha entrenado sobre el dataset twi-financial-inclusion, por lo que su vocabulario y estilo se ajustan a conversaciones sobre servicios financieros en twi; resulta adecuado para digitalizar respuestas abiertas de estudios de campo.
- Atención al cliente en entidades de microfinanzas en Ghana: permite transcribir llamadas o mensajes de voz de clientes en twi para su posterior análisis o enrutamiento, con un WER declarado de 8,85 sobre el dominio evaluado.
- Subtitulado y accesibilidad de contenido audiovisual en twi: al ser un modelo tiny de 37,76 millones de parámetros, puede ejecutarse en hardware modesto para generar subtítulos de vídeos y programas locales.
- Investigación lingüística y documentación de la lengua: útil para corpus orales de twi, con la cautela de que la evaluación publicada se limita al dominio financiero y no se ha verificado fuera de él.
- Prototipado rápido de aplicaciones de voz en lenguas de bajos recursos: su tamaño reducido y licencia Apache 2.0 facilitan integrarlo en pruebas de concepto y productos comerciales sin coste de licencia.
- Preprocesamiento en pipelines de datos: transcripción masiva de audio en twi para alimentar sistemas de búsqueda, resumen o análisis de sentimiento posteriores, siempre que el dominio se mantenga cercano al financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Whisper Twi v2 (soshi-irie) | twi-financial-inclusion (soshi-irie/twi-sst-model-v2) | test | WER | 8,8542 |

Evolución durante el entrenamiento (validation set, según la model card):

| Paso | Época | Validation loss | WER |
|---|---|---|---|
| 1000 | 0,6293 | 0,0116 | 11,6686 |
| 2000 | 1,2587 | 0,0074 | 10,0875 |
| 3000 | 1,8880 | 0,0065 | 10,4248 |
| 4000 | 2,5173 | 0,0062 | 8,8542 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 millones de parámetros, unos 151 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las tarjetas modernas e incluso en iGPU y en Raspberry Pi para inferencia por CPU con latencias aceptables.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face y servidores compatibles con la API de transformers; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU y latencia de decenas a cientos de milisegundos por segmento de audio, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idioma | Licencia | WER declarado |
|---|---|---|---|---|---|
| soshi-irie/whisper-twi-v2 | 37,76 M | Whisper tiny (segmentos de 30 s) | twi | Apache 2.0 | 8,85 (dominio financiero) |
| tiffany101/whisper-twi-v2 (modelo base) | no disponible | Whisper tiny | twi | no disponible | no disponible |
| Whisper tiny original (OpenAI) | 39 M | Whisper tiny (segmentos de 30 s) | multilingüe (99 idiomas) | MIT | no disponible para twi |
| Whisper small / medium (OpenAI) | 244 M / 769 M | Whisper (segmentos de 30 s) | multilingüe | MIT | no disponible para twi |

No se dispone de datos de benchmarks comparativos publicados entre estos modelos para twi en la información proporcionada.

## Limitaciones y advertencias

- El WER de 8,85 está declarado por el autor y marcado como no verificado; además se ha medido únicamente sobre el dominio financiero del dataset twi-financial-inclusion, por lo que el rendimiento en otros dominios (conversación general, medios, medicina) es desconocido.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") sobre descripción, usos previstos, limitaciones y datos de entrenamiento; no hay información sobre composición del corpus ni procedencia de las grabaciones.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio fuera de dominio; conviene validar transcripciones en producción.
- Sesgos potenciales derivados del corpus de entrenamiento (dominio financiero, posible sobrerrepresentación de determinados acentos o hablantes), no documentados por el autor.
- Cobertura limitada a un único idioma (twi); no se ha evaluado su comportamiento en otras lenguas kwa ni en code-switching con inglés, habitual en Ghana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no ofrece garantías; conviene revisar la licencia del modelo base tiffany101/whisper-twi-v2, no disponible en la información proporcionada.
- Al ser un modelo tiny, su capacidad de generalización es inferior a la de variantes mayores de Whisper; para dominios exigentes puede requerir fine-tuning adicional o el uso de modelos de mayor tamaño.
- No se documentan cuantizaciones oficiales ni formatos alternativos de pesos, lo que limita el despliegue en entornos que dependen de GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soshi-irie/whisper-twi-v2
- Modelo base: https://huggingface.co/tiffany101/whisper-twi-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/soshi-irie/twi-sst-model-v2
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
