# gaganmittal2023/whisper-tiny-minds14-gagan

## Resumen

whisper-tiny-minds14-gagan es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny sobre el subconjunto PolyAI/minds14, un corpus de audio bancario en ingles con anotaciones de intencion y transcripcion. Lo publica el usuario gaganmittal2023 en HuggingFace y su proposito es el reconocimiento automatico del habla (ASR) en dominio telefonico/bancario. Se trata de un modelo pequeno: 37.760.640 parametros en formato safetensors y un repositorio de 0,2 GB, lo que lo hace desplegable incluso en CPU. No acumula descargas ni likes en el momento de la consulta y su model card esta generada automaticamente por el Trainer, con secciones sin completar.

La relevancia de este modelo es acotada: sirve como ejemplo de ajuste fino de bajo coste (500 pasos de entrenamiento) de un modelo Whisper tiny, y como punto de partida reproducible para tareas de ASR en dominios muy especificos con pocos datos. Alcanza un WER de 0,3200 en el conjunto de evaluacion declarado, un valor alto para produccion pero coherente con un modelo de 37 M de parametros entrenado sobre un corpus reducido.

Su licencia Apache 2.0, heredada del modelo base y del ecosistema Whisper, permite uso comercial sin restricciones adicionales, aunque la calidad del resultado en dominios distintos al bancario en ingles no esta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper del modelo base openai/whisper-tiny) |
| Parametros totales | 37.760.640 (safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper); no aplica contexto de texto |
| Tipos de cuantizacion | no especificados en la model card; al ser un modelo Whisper de 37,7 M de parametros admite cuantizacion FP16, INT8 e INT4 mediante herramientas de conversion externas |
| Idiomas soportados | no disponible en la model card; el modelo base openai/whisper-tiny es multilingue y el corpus PolyAI/minds14 contiene varios locales, pero el autor no documenta que idiomas cubre el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: tamano del repositorio 0,2 GB; pipeline declarado automatic-speech-recognition; tags de compatibilidad con endpoints; versiones de framework declaradas: Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny, un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales y genera tokens de texto de forma autorregresiva. La model card no detalla la configuracion interna, pero al ser un ajuste del checkpoint openai/whisper-tiny sin cambios estructurales, hereda su tamano (4 capas de encoder, 4 capas de decoder, dimension de modelo 384, 6 cabezas de atencion en cada bloque y vocabulario de 51.865 tokens). El modelo base original se entreno con 680.000 horas de audio debilmente supervisado, principalmente en ingles y con cobertura multilingue.

El ajuste fino se realizo sobre PolyAI/minds14 con los siguientes hiperparametros declarados: learning rate 1e-05, train batch size 8, eval batch size 8, gradient accumulation steps 2 (batch total de 16), optimizador AdamW Torch Fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 25 pasos de warmup, 500 pasos de entrenamiento, semilla 42 y precision mixta nativa (AMP). Con batch total 16 y 500 pasos se procesan 8.000 ejemplos; dado que el entrenamiento alcanza la epoca 17,2456 en el paso 500, el corpus de entrenamiento ronda los 464 clips de audio, un conjunto muy reducido. Solo se declara una iteracion de evaluacion (paso 500) con perdida de validacion 0,6803 frente a una perdida de entrenamiento de 0,0036, lo que indica un sobreajuste marcado. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en dominio bancario en ingles: transcripcion de audio a texto, tarea para la que fue ajustado.
- Transcripcion con ventanas de 30 segundos, encadenables para audios mas largos mediante segmentacion previa.
- Capacidad multilingue residual heredada del modelo base openai/whisper-tiny, aunque el autor no documenta el alcance real tras el ajuste.
- Generacion de texto derivada del decoder de Whisper (traduccion y transcripcion en el modelo base), no validada en este checkpoint.
- Soporte de tool calling / function calling: no disponible, no es una capacidad de la arquitectura Whisper.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales (modo thinking, vision, audio generativo): no disponibles; unicamente entrada de audio y salida de texto.
- Compatibilidad con endpoints de HuggingFace declarada mediante el tag endpoints_compatible.

## Casos de uso

- Clasificacion y enrutado de llamadas de atencion al cliente bancaria: el modelo transcribe la locucion del usuario y el texto resultante se pasa a un clasificador de intenciones. Es adecuado porque se ha ajustado especificamente sobre PolyAI/minds14, un corpus de intenciones bancarias en ingles.
- Transcripcion de notas de voz de soporte telefonico: con ventanas de 30 segundos y encadenamiento por segmentos se pueden procesar grabaciones de varios minutos, y su tamano de 37,7 M de parametros permite ejecutarlo en servidores sin GPU.
- Generacion de subtitulos en tiempo casi real en CPU: en un servicio con un unico hilo de CPU moderna el modelo cabe en memoria sin esfuerzo, lo que lo hace apto para prototipos y demos de transcripcion.
- Preprocesado de pipelines de analitica de voz: transcripcion masiva por lotes de audios cortos para alimentar busqueda semantica, analisis de sentimiento o extraccion de entidades, con coste de computo muy bajo.
- Filtrado previo a un modelo mayor: usar este modelo como primera etapa para decidir que audios requieren un ASR de mayor calidad, reduciendo el coste total del pipeline.
- Entrenamiento y evaluacion de tecnicas de ajuste fino: sirve como linea base reproducible para comparar estrategias de fine-tuning de Whisper sobre dominios con pocos datos, dado que todos los hiperparametros estan documentados.
- Prototipado academico y trabajos de investigacion sobre ASR de bajo recurso: el checkpoint es pequeno, con licencia Apache 2.0, y puede descargarse y entrenarse de nuevo en minutos.
- Verificacion de calidad de transcripcion en dominios regulados: sirve como punto de partida para medir WER en ingles telefonico bancario antes de invertir en modelos mayores, aunque su WER de 0,3200 obliga a revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. No estan verificados (verified: false) y se corresponden a un unico punto de evaluacion (paso 500).

| Metrica | Valor | Conjunto | Verificado |
|---|---|---|---|
| WER | 0,31995277449822906 (0,3200) | PolyAI/minds14 | No |
| WER ortho | 0,3331 | PolyAI/minds14 | No |
| Perdida de evaluacion | 0,6803 | PolyAI/minds14 | No |
| Perdida de entrenamiento | 0,0036 | PolyAI/minds14 | No |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros modelos sobre PolyAI/minds14.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP16 (unos 76 MB solo de pesos) y alrededor de 40 MB en INT8; el grueso del consumo proviene de las activaciones y del buffer de audio de 30 segundos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo y solo tendrian sentido en despliegues con cientos de peticiones concurrentes.
- Cabe en GPU de consumo: si, en cualquier GPU consumer de los ultimos diez anos, e incluso en CPU moderna sin GPU dedicada. Tambien es viable en dispositivos embebidos con suficiente memoria RAM.
- Opciones de despliegue: pipeline de transformers (WhisperForConditionalGeneration), vLLM (soporta la arquitectura Whisper), servidores de inferencia compatibles con safetensors, y conversion a CTranslate2/faster-whisper o a GGUF para whisper.cpp para despliegues de baja latencia. Ollama no soporta modelos Whisper de forma nativa. El soporte en TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de factor de tiempo real en la model card ni en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | WER en PolyAI/minds14 |
|---|---|---|---|---|---|
| gaganmittal2023/whisper-tiny-minds14-gagan | 37,76 M | 30 s de audio | Apache 2.0 | HuggingFace, 0 descargas | 0,3200 (declarado por el autor) |
| openai/whisper-tiny (modelo base) | 37,76 M | 30 s de audio | Apache 2.0 | HuggingFace, ampliamente utilizado | no disponible |
| openai/whisper-base | 74 M | 30 s de audio | Apache 2.0 | HuggingFace | no disponible |
| openai/whisper-small | 244 M | 30 s de audio | Apache 2.0 | HuggingFace | no disponible |

No se dispone de resultados comparativos verificados sobre PolyAI/minds14 para los modelos de la tabla, por lo que no es posible afirmar si el ajuste mejora o empeora respecto al checkpoint base. La comparacion queda limitada a parametros, contexto y licencia, identicos en los cuatro casos salvo el tamano.

## Limitaciones y advertencias

- Sobreajuste evidente: la perdida de entrenamiento (0,0036) es dos ordenes de magnitud inferior a la de validacion (0,6803), con un unico punto de evaluacion en 500 pasos y 17,25 epocas sobre un corpus de unos 464 clips.
- WER elevado para produccion: 0,3200 implica aproximadamente uno de cada tres tokens o palabras erroneos en el conjunto de evaluacion declarado, con una tasa de error ortografico de 0,3331.
- Resultados no verificados: el model-index marca verified: false; los numeros proceden del propio autor y no han sido reproducidos de forma independiente.
- Sesgos conocidos: no documentados en la model card. Al derivar de Whisper y de un corpus bancario en ingles, es previsible un sesgo hacia vocabulario, acentos y variedades del ingles presentes en PolyAI/minds14.
- Riesgo de alucinacion: inherente a los modelos generativos de ASR; Whisper puede producir texto plausible no presente en el audio, especialmente con silencios, ruido o habla no inglesa.
- Limitaciones de contexto e idioma: ventana fija de 30 segundos y ausencia de informacion sobre los idiomas efectivamente cubiertos tras el ajuste. El rendimiento fuera del dominio bancario en ingles no esta medido.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento dicen literalmente "More information needed", por lo que no hay guia del autor sobre uso responsable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y atribucion. No se documentan restricciones adicionales.
- Caveat de produccion: cualquier despliegue en un entorno regulado (por ejemplo, banca) deberia incluir revision humana o un ASR de mayor capacidad, dado el nivel de WER y la falta de validacion externa.
- Trazabilidad: el repositorio no tiene descargas ni likes y no se ha publicado paper, informe tecnico ni evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaganmittal2023/whisper-tiny-minds14-gagan
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/PolyAI/minds14
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Documentacion de transformers para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos correspondian a materiales de pintura de una cadena de supermercados y no se incluyen por no ser pertinentes.
