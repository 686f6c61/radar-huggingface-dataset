# oluwagbotty/w2vbert-ky-ft

## Resumen

w2vbert-ky-ft es un modelo de reconocimiento automatico del habla (ASR) para kinyarwanda, desarrollado por el usuario de Hugging Face oluwagbotty. Parte de `badrex/w2v-bert-2.0-kinyarwanda-asr`, un w2v-BERT 2.0 con cabeza CTC de unos 600 millones de parametros entrenado sobre aproximadamente 1.000 horas de kinyarwanda, y lo afina durante una sola epoca sobre el split de entrenamiento del CDLI Rwandan Kinyarwanda Non-Standard Speech Dataset v1.0, cuyos hablantes son en su mayoria jovenes adultos con tartamudez.

El modelo resuelve un nicho concreto: la transcripcion de habla no estandar (repeticiones, bloqueos y prolongaciones) en un idioma de bajos recursos como el kinyarwanda. Al ser un modelo CTC, no puede entrar en bucles de repeticion durante la decodificacion, una ventaja practica frente a arquitecturas encoder-decoder autoregresivas en audio degradado o disfluente. La salida es texto en minusculas con espacios y apostrofos, sin puntuacion.

Es relevante ahora porque demuestra que un ajuste muy corto (721 pasos, una epoca) sobre un checkpoint ya adaptado al idioma mejora de forma medible el WER en habla disfluente, y porque el autor publica una version posterior de tres epocas (`oluwagbotty/w2vbert-ky-ft-3ep`) que recomienda usar en su lugar. Esta ficha cubre la version de una epoca, que debe considerarse un artefacto temprano y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 (transformer convolucional auto-supervisado) con cabeza CTC |
| Parametros totales | 580.525.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente del preprocesador; los clips del dataset se cortan a ~25 s por limite de la app) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un w2v-BERT 2.0 con cabeza de clasificacion temporal conexionista (CTC). w2v-BERT 2.0 combina capas convolucionales de extraccion de features con un encoder transformer entrenado de forma auto-supervisada; en este caso el checkpoint de partida ya estaba adaptado al kinyarwanda y contaba con una cabeza CTC, por lo que el afinamiento solo ajusta el modelo al dominio de habla no estandar. La decodificacion CTC es no autoregresiva, lo que elimina el riesgo de bucles de repeticion tipicos de los modelos encoder-decoder en audio con disfluencias.

El entrenamiento uso exclusivamente el split de train del CDLI Rwandan Kinyarwanda Non-Standard Speech Dataset v1.0: 11.536 grabaciones de 46 hablantes, 47,7 horas, con hablantes mayoritariamente jovenes adultos (18-30 anos) y en su mayoria hombres (44 de 61 hablantes del dataset completo), grabados en interiores con bajo ruido en Ruanda en 2026 mediante una app de tableta, a partir de prompts de imagen (descripcion libre) y de texto (lectura de frases). Se empleo AdamW con learning rate 2e-5, scheduler lineal con 10 % de warm-up, batch efectivo de 16 (2 por GPU, 2 GPUs, 4 pasos de acumulacion), precision mixta y una epoca (721 pasos). El split de dev (6 hablantes) se uso solo para elegir el checkpoint (paso 500, epoca 0,69) y el de test (9 hablantes) se puntuo una unica vez tras el entrenamiento. Los targets se pasaron a minusculas y se redujeron al juego de caracteres del modelo, conservando las repeticiones de tartamudeo. No se documenta RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en kinyarwanda mediante CTC, con salida en minusculas, espacios y apostrofos, sin puntuacion.
- Manejo de habla disfluente: repeticiones de tartamudeo se transcriben de forma verbatim (por ejemplo, "mu mu mu mwaka").
- Robustez frente a bucles de repeticion gracias a la decodificacion CTC no autoregresiva.
- Procesamiento de audio mono a 16 kHz.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo kinyarwanda.
- No dispone de modo thinking, vision ni audio mas alla de la entrada de voz para ASR.

## Casos de uso

- Transcripcion de entrevistas y testimonios con habla disfluente: el modelo esta afinado sobre hablantes que tartamudean, por lo que transcribe repeticiones tal como se pronuncian, util para investigacion linguistica o documentacion de corpus orales.
- Generacion de subtitulos para contenido en kinyarwanda grabado en interiores con bajo ruido: la ventana de audio y el preprocesador de w2v-BERT permiten procesar clips de hasta aproximadamente 25 segundos, adecuados para segmentos cortos de video.
- Creacion de corpus anotados para entrenamiento de ASR: al ser un modelo CTC de 580 millones de parametros, puede ejecutarse en una GPU consumer y servir para pre-anotar audio que luego se revisa manualmente.
- Investigacion sobre habla no estandar: permite comparar el efecto del afinamiento sobre un checkpoint ya adaptado al idioma, con metricas WER y CER reproducibles sobre el split de test del CDLI.
- Prototipado de accesibilidad para hablantes con tartamudez: el texto verbatim generado puede mostrarse al hablante para que lo verifique, tal como recomienda el autor, antes de cualquier uso posterior.
- Evaluacion comparativa de modelos ASR en kinyarwanda: sirve como linea base de una epoca frente a la version de tres epocas y frente al checkpoint original, con la advertencia de que diferencias inferiores a unos 3 puntos de WER no son concluyentes con 9 hablantes de test.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del CDLI Kinyarwanda (1.169 grabaciones de 9 hablantes, decodificacion greedy, normalizador de texto basico de Whisper):

| Metrica | Modelo base (badrex/w2v-bert-2.0-kinyarwanda-asr) | w2vbert-ky-ft (1 epoca) | Segunda ejecucion 1 epoca |
|---|---|---|---|
| WER | 49,7 % | 42,8 % | 42,3 % |
| CER | 15,2 % | 12,8 % | 12,5 % |
| WER por enunciado | no disponible | 44,6 % | no disponible |

En el split de validacion (6 hablantes), el WER fue del 44,05 % en el checkpoint elegido (paso 500, epoca 0,69) y del 45,3 % tras la epoca completa. El autor advierte que el split de test tiene solo 9 hablantes y que no pueden confirmarse diferencias inferiores a unos 3 puntos de WER. El model-index del repositorio no declara resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, mas activaciones y buffers de audio; en la practica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, con un total practico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 aportan throughput, pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 4 GB o mas, e incluso en CPU para clips cortos.
- Opciones de despliegue: transformers con `Wav2Vec2BertForCTC` y `AutoProcessor`; el tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test CDLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| w2vbert-ky-ft (este) | 580,5 M | no disponible | 42,8 % | CC-BY-4.0 | Hugging Face |
| badrex/w2v-bert-2.0-kinyarwanda-asr | ~600 M | no disponible | 49,7 % | no disponible | Hugging Face |
| oluwagbotty/w2vbert-ky-ft-3ep | ~600 M | no disponible | no disponible (el autor lo recomienda frente a este) | no disponible | Hugging Face |

No se dispone de datos de otros modelos ASR para kinyarwanda en la informacion proporcionada, por lo que la comparativa se limita a los checkpoints de la misma familia.

## Limitaciones y advertencias

- Pocos hablantes de test: solo 9 (3 leves, 3 moderados, 3 severos); diferencias inferiores a unos 3 puntos de WER no son concluyentes, y cada grupo tiene solo 3 hablantes.
- Salida verbatim: las transcripciones de entrenamiento conservan repeticiones, por lo que el modelo escribe tartamudeos tal cual; bloqueos y prolongaciones no son visibles en texto y hay que limpiar la salida si se necesita la frase fluida.
- Ortografia y espaciado inconsistentes: alrededor de dos tercios de los errores de palabra son variantes de escritura o separacion (por ejemplo, "uyumunsi" frente a "uyu munsi"), por lo que el WER sobreestima la dificultad y el CER es la metrica mas justa.
- Sesgo demografico y de condiciones: los datos son mayoritariamente de jovenes adultos (18-30), en su mayoria hombres, grabados en interiores con bajo ruido; el rendimiento en ninos, personas mayores, otros dialectos, entornos ruidosos, audio telefonico o susurros es desconocido.
- Clips largos: cerca de una cuarta parte de las grabaciones se cortan a unos 25 segundos por limite de la app, por lo que el audio puede estar truncado.
- Tipo de prompt: las frases leidas en los prompts de texto aparecen tambien en las transcripciones de train, asi que los resultados con prompt de texto son mas faciles; los de prompt de imagen son mejor guia para habla abierta.
- Uso prohibido para decisiones sobre personas: no debe emplearse para diagnosticar o evaluar condiciones del habla, ni en decisiones legales, policiales o clinicas, ni para identificar hablantes o perfilar y monitorizar personas; los terminos del CDLI prohiben reidentificar hablantes, crear voces que imiten a una persona y entrenar modelos que promuevan exclusion o dano.
- Riesgo de error con impacto: una transcripcion incorrecta puede cambiar el significado de lo dicho; debe mostrarse el texto al hablante para que lo verifique y no actuar automaticamente sobre el.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero el autor no documenta condiciones adicionales de uso comercial mas alla de las del dataset CDLI, cuyo acceso esta restringido y cuyos terminos y condiciones deben aceptarse por separado.
- Artefacto temprano: es una version de una sola epoca; el propio autor recomienda usar `oluwagbotty/w2vbert-ky-ft-3ep` en su lugar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/w2vbert-ky-ft
- Version de tres epocas recomendada por el autor: https://huggingface.co/oluwagbotty/w2vbert-ky-ft-3ep
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset CDLI Rwandan Kinyarwanda Non-Standard Speech v1.0: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
