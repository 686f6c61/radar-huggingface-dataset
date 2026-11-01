# mikaelaehunter/optuna_canadian_english

## Resumen

`mikaelaehunter/optuna_canadian_english` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny`, orientado especificamente a transcripcion de ingles canadiense. Lo desarrolla el usuario `mikaelaehunter` y se publica en HuggingFace con licencia Apache 2.0. El modelo hereda la arquitectura encoder-decoder transformer de Whisper en su variante "tiny", con 37.760.640 parametros totales, y se ha entrenado sobre el dataset `canadian_english` partiendo de los pesos originales de OpenAI.

El problema que aborda es la adaptacion de un modelo ASR generico multilingue a un acento y variedad dialectal concreta, en este caso el ingles hablado en Canada, que presenta rasgos foneticos y lexicos distintos del ingles estadounidense o britanico. Al partir de `whisper-tiny`, el resultado es un modelo muy ligero (unos 0,2 GB de repositorio) pensado para entornos con recursos limitados, prototipado rapido o despliegue en dispositivos de baja capacidad.

Es relevante ahora por su tamano reducido y su compatibilidad con la libreria `transformers` y los endpoints de HuggingFace, lo que facilita su integracion en pipelines de transcripcion en tiempo real o en sistemas embebidos. No obstante, la model card es automatica y carece de documentacion detallada sobre datos, evaluacion o rendimiento, por lo que debe tratarse como un experimento de ajuste fino mas que como un modelo de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; orientado a ingles canadiense) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder disenado para reconocimiento automatico del habla que procesa espectrogramas de audio y genera transcripciones token a token. Whisper tiny es la variante mas pequena de la familia Whisper, con unos 39 millones de parametros en la version original y una ventana de audio de 30 segundos por segmento.

El ajuste fino se realizo sobre el dataset `canadian_english` con los siguientes hiperparametros declarados en la model card: learning rate de 2,5574199503382767e-05, batch de entrenamiento de 8, batch de evaluacion de 16, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 40 pasos de calentamiento y 400 pasos totales de entrenamiento, con precision mixta nativa (Native AMP). El entrenamiento se ejecuto con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

No se documenta en la model card el numero de tokens de audio procesados, la composicion exacta del dataset `canadian_english`, ni si hubo etapas de RLHF o DPO (poco habituales en tareas ASR). El nombre del repositorio sugiere el uso de Optuna para la busqueda de hiperparametros, aunque no se detalla el espacio de busqueda ni los resultados de la optimizacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en la variedad canadiense.
- Transcripcion de audio de hasta 30 segundos por segmento, segun el diseno original de Whisper.
- Generacion de texto a partir de audio (pipeline `automatic-speech-recognition`).
- Compatible con la libreria `transformers` y con los endpoints de HuggingFace.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; son ajenas al proposito del modelo.
- No se documentan capacidades de vision, audio generativo ni modo "thinking".
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Transcripcion de reuniones y llamadas en entornos canadienses: el modelo puede transcribir audio de hablantes de ingles canadiense en segmentos de hasta 30 segundos, aprovechando el ajuste fino sobre el acento local para reducir errores de transcripcion.
- Subtitulado automatico de contenido audiovisual: su tamano reducido permite generar subtitulos en tiempo casi real en servidores modestos o incluso en equipos de escritorio, integrandose en pipelines de postproduccion.
- Prototipado rapido de aplicaciones ASR: al ser un modelo ligero (0,2 GB), es adecuado para experimentar con pipelines de `transformers` antes de escalar a variantes mayores de Whisper.
- Despliegue en dispositivos de bajos recursos: con 37,7 millones de parametros, puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace util para demos, entornos educativos o sistemas embebidos.
- Preprocesamiento de datos de audio para investigacion: util para generar transcripciones preliminares de corpus de habla canadiense que luego se revisan manualmente.
- Evaluacion comparativa de tecnicas de ajuste fino: sirve como referencia para estudiar el efecto del fine-tuning sobre una variante pequena de Whisper en una variedad dialectal concreta.

## Benchmarks y rendimiento

El model-index del autor declara la entrada "Whisper tiny canadian_english" con una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano (37,7 millones de parametros, pesos en safetensors de unos 0,2 GB), es esperable que quepa en GPUs de consumo, aunque no se confirma con mediciones.
- GPU recomendadas: no disponible; por tamano, cualquier GPU moderna con al menos unos pocos GB de VRAM deberia ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente si (el modelo es muy pequeno), sin confirmacion documentada.
- Opciones de despliegue: `transformers` (libreria declarada); no se confirma compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo ASR estas opciones pueden no aplicar directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| mikaelaehunter/optuna_canadian_english | 37.760.640 | no disponible (heredado de Whisper tiny: 30 s) | en | apache-2.0 | ajuste fino comunitario, sin benchmarks |
| openai/whisper-tiny | ~39 M (aprox.) | 30 s | multilingue | apache-2.0 | modelo base oficial |
| openai/whisper-base | ~74 M (aprox.) | 30 s | multilingue | apache-2.0 | modelo oficial de mayor tamano |

La comparativa se limita al modelo base y a la variante inmediatamente superior de la familia Whisper; no se dispone de datos de rendimiento del ajuste fino para comparar metricas (WER, MMLU, HumanEval, GSM8K u otras), por lo que la comparacion es estructural y no de calidad.

## Limitaciones y advertencias

- La model card es automatica y contiene secciones marcadas como "More information needed"; no hay documentacion sobre datos, evaluacion ni uso previsto.
- No se han publicado resultados de benchmarks ni metricas de error (WER), por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio ruidoso, solapamiento de hablantes o vocabulario tecnico.
- Especializado en ingles canadiense; el rendimiento en otras variedades del ingles o en otros idiomas no esta documentado y probablemente sea inferior.
- Ventana de audio limitada a segmentos cortos (herencia de Whisper tiny), lo que exige segmentacion previa para audios largos.
- Sesgos: no documentados; al entrenarse sobre un dataset no descrito, pueden heredarse sesgos del corpus de origen.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del dataset `canadian_english` y del modelo base.
- Al tener 0 descargas y 0 likes, es un modelo sin validacion por la comunidad; no se recomienda para produccion sin evaluacion propia.
- No se documentan opciones de cuantizacion ni formatos alternativos a safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikaelaehunter/optuna_canadian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset declarado: `canadian_english` (no se proporciona URL en la informacion disponible)
- Paper de Whisper (referencia del modelo base): no incluido en la informacion proporcionada
- Repositorio o demo adicional: no disponible
