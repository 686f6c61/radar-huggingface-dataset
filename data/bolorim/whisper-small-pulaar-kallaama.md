# bolorim/whisper-small-pulaar-kallaama

# whisper-small-pulaar-kallaama

## Resumen

whisper-small-pulaar-kallaama es un ajuste fino de openai/whisper-small, publicado por el usuario bolorim en HuggingFace, orientado al reconocimiento automático de voz en pulaar (variante del fulfulde/fula hablada principalmente en Senegal, Mauritania, Guinea y Malí). El modelo conserva la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper, con 241.734.912 parámetros (aproximadamente 244 millones) y pesos en safetensors. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache-2.0.

El problema que aborda es la escasez de sistemas ASR funcionales para lenguas africanas de bajos recursos, donde los modelos multilingües genéricos rinden mal por falta de datos de entrenamiento específicos. La propuesta es un ajuste ligero sobre un modelo ya multilingüe, lo que reduce el coste computacional de adaptación a un idioma concreto y permite desplegarlo en hardware modesto.

Ahora bien, los resultados declarados por el propio autor son claramente preliminares: un WER del 65,3061 % y una pérdida de validación de 3,3463 tras únicamente 50 pasos de entrenamiento. Se trata, por tanto, de un experimento temprano o de un artefacto de investigación más que de un modelo listo para producción. Es relevante como punto de partida reproducible para quien quiera continuar el ajuste con más datos y más pasos, no como solución final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), con entradas de espectrograma mel y decodificacion autoregresiva |
| Parametros totales | 241.734.912 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (heredado de openai/whisper-small); longitud de secuencia de texto no especificada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible en los metadatos; el ajuste esta dirigido al pulaar, sobre una base multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; el modelo base tambien admite checkpoints .bin) |

Otras especificaciones: pipeline declarado `automatic-speech-recognition`, tamano del repositorio 1,0 GB, creado el 2026-09-30, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con normalizacion previa, embeddings convolucionales en el encoder sobre espectrogramas mel de 80 canales, y un decoder autoregresivo que genera texto condicionado por tokens de tarea e idioma. No se introduce ninguna innovacion arquitectonica respecto al modelo base: se trata de un ajuste fino estandar.

El entrenamiento se realizo con el Trainer de HuggingFace y los siguientes hiperparametros declarados: learning rate 0,001, batch de entrenamiento 8, batch de evaluacion 8, acumulacion de gradientes 2 (batch efectivo 16), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, scheduler lineal con 50 pasos de calentamiento, precision mixta nativa (AMP) y un total de 50 pasos de entrenamiento. El dataset de entrenamiento figura como "None" en la model card, es decir, no se documenta su composicion, tamano, procedencia ni licencia.

A partir de los datos declarados puede deducirse que el conjunto de entrenamiento era muy pequeno: 50 pasos con batch efectivo de 16 y 5,5556 epocas implican aproximadamente 144 ejemplos. La curva de entrenamiento muestra una perdida de 10,7473 en el paso 25 (WER del 100 %) y de 3,4657 en el paso 50 (WER del 65,3061 %), lo que indica un ajuste todavia en fase muy temprana. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

Versiones de framework declaradas: Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Reconocimiento automatico de voz (transcripcion de audio a texto) orientado al pulaar.
- Procesamiento de audio en ventanas de hasta 30 segundos, con posibilidad de concatenar ventanas para archivos mas largos mediante la pipeline de transformers.
- Capacidad multilingue residual heredada de openai/whisper-small (la base cubre decenas de idiomas), aunque el ajuste esta especializado en pulaar y no se declara la lista de idiomas soportados.
- Compatibilidad con la API `pipeline("automatic-speech-recognition")` de transformers y con `endpoints_compatible`, por lo que puede desplegarse en Inference Endpoints.
- No se declara soporte de tool calling ni de function calling: es un modelo puramente ASR.
- No se declara soporte de agentes, razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de vision, audio clasificacion, traduccion declarada ni text-to-speech.
- No se documenta generacion de marcas de tiempo (timestamps) fiable ni diarizacion de hablantes.

## Casos de uso

- Transcripcion de emisiones de radio comunitaria en pulaar: el modelo puede convertir archivos de audio de hasta 30 segundos por ventana en texto, encadenando ventanas para programas completos. Es adecuado por su tamano reducido, que permite ejecutarlo en servidores modestos, aunque el WER actual exige revision humana.
- Digitalizacion de patrimonio oral: cuentos, poemas, genealogias y testimonios grabados en fulfulde pueden transcribirse como primer borrador para su archivado y posterior correccion por hablantes nativos.
- Preanotacion de corpus para entrenamiento: dado su caracter de modelo base ajustado, sirve como generador de transcripciones iniciales que un anotador humano corrige, acelerando la creacion de datasets etiquetados de pulaar.
- Indexacion y busqueda en archivos sonoros: transcribir una fonoteca para permitir busqueda por palabra clave sobre el texto generado, con la advertencia de que la tasa de error actual limita la precision de las busquedas.
- Subtitulado asistido de video en pulaar: generacion de subtitulos que despues se editan manualmente, util en medios locales y ONG que producen contenido en esta lengua.
- Investigacion en ASR de bajos recursos: como punto de partida reproducible para experimentos de ajuste fino, comparacion de tecnicas de aumento de datos o evaluacion de estrategias de decodificacion sobre una lengua africana poco representada.
- Prototipos de asistentes de voz o servicios publicos (sanidad, agricultura, administracion) en zonas fulahablantes: valido para demostraciones de concepto y pruebas de usabilidad, no para atencion real sin supervision humana.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. El campo `model-index` del repositorio no contiene resultados, por lo que no hay benchmark externo verificable.

| Metrica | Paso 25 (epoca 2,7778) | Paso 50 (epoca 5,5556) |
|---|---|---|
| Training loss | 10,7473 | 3,4657 |
| Validation loss | 7,4316 | 3,3463 |
| WER (evaluacion) | 100,0 % | 65,3061 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se dispone de una linea base de WER de openai/whisper-small sobre el mismo conjunto de evaluacion, por lo que no es posible cuantificar la mejora real atribuible al ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en FP32: aproximadamente 1,0-1,5 GB solo para pesos, con 2-3 GB de VRAM total considerando activaciones y overhead del runtime.
- VRAM estimada en FP16/bf16: alrededor de 0,5 GB de pesos, con 1,5-2 GB de VRAM total.
- VRAM estimada en int8: alrededor de 0,25-0,3 GB de pesos, con menos de 1 GB de VRAM total (requiere conversion externa, no publicada en el repositorio).
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090 o T4 lo ejecutan con holgura; A100 y H100 estan sobredimensionadas para este tamano, salvo en escenarios de procesamiento masivo por lotes.
- Inferencia en CPU: viable gracias a los 244 millones de parametros, especialmente con backends optimizados para CPU.
- Opciones de despliegue: pipeline de transformers, Inference Endpoints (el modelo esta marcado como `endpoints_compatible`), faster-whisper sobre CTranslate2, whisper.cpp mediante conversion a GGUF, y ONNX Runtime. vLLM admite modelos Whisper, aunque no hay confirmacion de soporte especifico para este checkpoint. No se documenta soporte en TGI.
- Latencia y throughput estimados: no disponible. Dependeran del backend, de la GPU y de la longitud del audio; en cualquier caso inferiores a los de whisper-large por el menor numero de parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bolorim/whisper-small-pulaar-kallaama | 241.734.912 | Ventanas de 30 s | Pulaar (ajuste especifico) | Apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-small | 244 M | Ventanas de 30 s | Multilingue (decenas de idiomas) | Apache-2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | 74 M | Ventanas de 30 s | Multilingue | Apache-2.0 | HuggingFace |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Multilingue | Apache-2.0 | HuggingFace |
| facebook/mms-1b-all | 1.000 M (aprox.) | Ventanas de audio variable | Mas de 1000 lenguas, incluido fulfulde | CC-BY-NC-4.0 | HuggingFace; licencia no comercial |

La ventaja diferencial de este checkpoint frente a openai/whisper-small es su especializacion en pulaar, aunque con un WER del 65,3061 % no hay evidencia de que supere al modelo base en esa lengua. Frente a facebook/mms-1b-all, la licencia Apache-2.0 permite uso comercial, algo que la licencia CC-BY-NC-4.0 de MMS no autoriza. No se dispone de datos de benchmarks en pulaar para establecer una comparacion cuantitativa fiable entre estas alternativas.

## Limitaciones y advertencias

- Rendimiento insuficiente para produccion: un WER del 65,3061 % implica que aproximadamente dos de cada tres palabras se transcriben de forma incorrecta. Cualquier uso real exige revision y correccion humana.
- Entrenamiento muy corto: solo 50 pasos y unas 5,56 epocas sobre un conjunto estimado de aproximadamente 144 ejemplos. El modelo no ha convergido y probablemente este infrapreparado.
- Dataset sin documentar: la model card indica "None" como dataset de entrenamiento. No se conoce su procedencia, tamano, licencia, dominio (lectura, conversacion, radio) ni la calidad de las transcripciones de referencia. Esto impide evaluar el sesgo de dominio y la reutilizacion legal de los datos.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible cuando la entrada contiene silencio, ruido o habla no cubierta por el entrenamiento. Este riesgo es especialmente alto en un ajuste con tan pocos datos.
- Idiomas no declarados en los metadatos: aunque la base es multilingue, no se especifica que idiomas conserva este checkpoint ni si la capacidad multilingue se ha degradado con el ajuste.
- Sin evaluacion externa: 0 descargas y 0 likes, sin resultados en el `model-index` ni benchmarks independientes. No existe validacion por terceros.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no es posible evaluar sesgos de genero, dialecto, edad o procedencia geografica dentro del propio pulaar.
- Limitaciones tecnicas: sin diarizacion de hablantes, sin marcas de tiempo verificadas y con ventanas de 30 segundos que obligan a segmentar audios largos.
- Licencia: Apache-2.0 permite uso comercial y modificacion sin restricciones relevantes, pero al derivar de openai/whisper-small conviene verificar el cumplimiento de las condiciones del modelo base y de los datos de entrenamiento originales.
- Fecha de publicacion atipica (2026-09-30) y ausencia de documentacion adicional: la model card incluye varios campos "More information needed", por lo que la ficha debe tratarse como incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bolorim/whisper-small-pulaar-kallaama
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper, "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Documentacion de la pipeline de ASR en transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#automatic-speech-recognition
- Modelo comparable multilingue con cobertura de fulfulde: https://huggingface.co/facebook/mms-1b-all
