# finisher-editor/finisher-whisper-large-v3-turbo-onnx

## Resumen

El modelo `finisher-editor/finisher-whisper-large-v3-turbo-onnx` es una exportación a formato ONNX del modelo de reconocimiento automático de voz (ASR) `openai/whisper-large-v3-turbo`, publicada por el usuario `finisher-editor` para su uso en el plugin `@finisher/speech`. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de OpenAI a grafos ONNX en precisión fp32 (los pesos fp16 originales se han ensanchado de forma exacta), con el decodificador reescrito como un módulo propio con caché de clave/valor sobre los pesos de la librería `transformers`. La conversión se ha realizado con `torch.onnx.export` (TorchScript) en opset 17 y se distribuye con los ficheros de tokenizador y configuración originales sin modificar.

El modelo base, Whisper large-v3-turbo, es un transformer encoder-decoder para transcripción y traducción de voz multilingüe. La variante "turbo" reduce el decodificador de large-v3 a 4 capas y se afina, lo que rebaja el coste de inferencia manteniendo la calidad del encoder. El repositorio ocupa 3,5 GB y contiene los grafos `encoder.onnx` (con pesos externos en `encoder.onnx.data`) y `decoder.onnx`, además de los ficheros de configuración y tokenizador.

La relevancia de esta ficha es acotada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no dispone de pipeline declarado ni de idiomas listados en los metadatos, y la model card se centra casi por completo en la trazabilidad de la conversión (hashes SHA-256, diferencias numéricas frente a PyTorch, versiones de herramientas) más que en las capacidades del modelo. Es útil para quien necesite ejecutar Whisper large-v3-turbo con ONNX Runtime en lugar de PyTorch, pero no aporta información nueva sobre el modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (el fichero `model.safetensors` upstream pesa 1.617.824.864 bytes; el conjunto ONNX suma 3.503.275.970 bytes en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se indica en la informacion) |
| Tipos de cuantizacion | fp32 unicamente (los pesos fp16 upstream se ensancharon de forma exacta); no se distribuyen variantes int8, fp16 ni GGUF |
| Idiomas soportados | no disponible en los metadatos del repo (el modelo base es multilingue, pero no se lista el conjunto) |
| Licencia | MIT (Copyright (c) 2022 OpenAI), heredada del modelo upstream |
| Formato de pesos | ONNX (opset 17): `encoder.onnx` + `encoder.onnx.data` (pesos externos) y `decoder.onnx`; tokenizador y configuracion en JSON/BPE |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder transformer que procesa espectrogramas log-Mel de audio y un decodificador autorregresivo que genera tokens de texto. La variante "turbo" recorta el decodificador de large-v3 a 4 capas y se afina, lo que reduce el coste de decodificacion respecto al large-v3 completo. En esta exportacion, el decodificador no es el modulo original de `transformers`, sino un modulo propio del proyecto Finisher con caché de clave/valor (`crossK`, `crossV`, `cachedStepLogits`, `promptLogits`), exportado con `torch.onnx.export` en opset 17 y fp32.

Sobre el entrenamiento, la model card indica que el upstream no proporciona informacion ("No information provided") y remite a los papers de OpenAI: Whisper large-v3 se entreno con aprendizaje debilmente supervisado sobre audio web (1 millon de horas etiquetadas debilmente y 4 millones de horas pseudo-etiquetadas), y turbo es large-v3 con el decodificador podado a 4 capas y afinado. La conversion no entrena ningun dato nuevo; solo transforma pesos. La model card incluye verificaciones de fidelidad numerica frente a PyTorch (por ejemplo, `cachedStepLogits` con maxAbsDiff de 0,000213 frente a un limite de 0,001, y `wrapperVsTransformers` con 1,34e-05), lo que respalda la equivalencia funcional de los grafos.

## Capacidades

- Reconocimiento automatico de voz multilingue (heredado de Whisper large-v3-turbo; el conjunto exacto de idiomas no se lista en el repo).
- Transcripcion de audio a texto mediante encoder + decodificador con caché de clave/valor.
- Traduccion de voz a texto (capacidad propia de Whisper; no se detalla en la model card).
- Ejecucion con ONNX Runtime, lo que permite desplegar sin PyTorch.
- Integracion prevista con el plugin `@finisher/speech` del proyecto Finisher.
- No se documentan tool calling, function calling, modo agente, vision, audio de salida ni modo "thinking"; son capacidades ajenas a un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte audio en texto con un grafo ONNX ejecutable en ONNX Runtime, lo que simplifica el despliegue en entornos sin PyTorch y permite integrarlo en servicios de actas automaticas.
- Subtitulado de video: al ser un modelo ASR multilingue (segun el modelo base), puede generar subtitulos para contenido audiovisual; la exportacion ONNX facilita su inclusion en pipelines de procesamiento por lotes.
- Busqueda sobre archivos de audio: transcribir grabaciones y indexar el texto resultante para busqueda semantica o por palabras clave en archivos de podcasts, llamadas o clases.
- Atencion al cliente con analitica de llamadas: transcripcion de conversaciones telefonicas para extraer metricas, detectar temas y alimentar sistemas de calidad, usando el grafo ONNX en servidores de inferencia.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva, desplegando el encoder y el decodificador con caché de clave/valor para reducir el coste por paso.
- Procesamiento en local o edge: al distribuirse en fp32 y con ONNX Runtime, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, aunque el tamano (3,5 GB) condiciona el hardware.
- Integracion en el plugin `@finisher/speech`: caso de uso explicito del autor, que convierte este checkpoint en la dependencia de voz de su ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye verificaciones de fidelidad de la conversion (diferencias maximas absolutas entre los grafos ONNX y el modulo PyTorch), no metricas de calidad ASR como WER, MMLU o GSM8K, que ademas no aplican a un modelo de voz.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el conjunto de pesos ocupa 3,5 GB en fp32, por lo que la inferencia requiere al menos ese orden de memoria, mas el espacio de activaciones y la cache de clave/valor.
- GPU recomendadas: no se indican en la informacion; por tamano, el modelo encaja en GPU con 8-16 GB de VRAM, aunque no hay datos oficiales del autor.
- GPU de consumo: probablemente cabe en tarjetas consumer de gama media-alta con suficiente VRAM, pero no se confirma en la model card.
- Opciones de despliegue: ONNX Runtime (herramienta usada en la conversion y validacion: onnxruntime 1.31.1); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son el entorno natural para este grafo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finisher-whisper-large-v3-turbo-onnx | no disponible (repo de 3,5 GB en fp32) | no disponible (ventana de audio de 30 s en Whisper) | ONNX (fp32) | MIT | Hugging Face, 0 descargas |
| openai/whisper-large-v3-turbo | no disponible en la informacion (upstream de 1,6 GB en safetensors) | no disponible (ventana de audio de 30 s) | safetensors (fp16) | MIT | Hugging Face, upstream oficial |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible (ventana de audio de 30 s) | safetensors | MIT | Hugging Face, upstream oficial |

La comparativa se limita al linaje directo porque la informacion proporcionada no incluye otros modelos ASR (por ejemplo, variantes de Wav2Vec2 o Parakeet) con datos verificables. Frente al upstream, esta exportacion anade el formato ONNX y un decodificador con cache de clave/valor propio, a costa de duplicar aproximadamente el tamano en disco (fp32 frente a fp16) y de no ofrecer variantes cuantizadas.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No se listan idiomas soportados en los metadatos, aunque el modelo base es multilingue; conviene verificar el comportamiento por idioma antes de desplegar.
- Solo se distribuye en fp32; no hay versiones cuantizadas (int8, fp16, GGUF), lo que limita el despliegue en hardware con poca memoria.
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones de contexto o idioma del modelo subyentente; los sesgos de Whisper large-v3-turbo son los del upstream y no se detallan aqui.
- Riesgo de alucinacion propio de los modelos ASR (texto inventado en segmentos con silencio o ruido); no se cuantifica en la informacion disponible.
- Licencia MIT heredada de OpenAI: permite uso comercial, pero exige conservar el aviso de copyright; la model card incluye el texto de atribucion.
- El repositorio incluye un fichero `conversion.json` que no forma parte del conjunto de ficheros del modelo; quien verifique hashes debe excluirlo.
- El decodificador es un modulo propio del proyecto Finisher, no el de `transformers`; la compatibilidad con herramientas estandar de Hugging Face para Whisper no esta garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/finisher-editor/finisher-whisper-large-v3-turbo-onnx
- Modelo base upstream: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit upstream referenciado: `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`
- Repositorio Finisher (script de conversion en el commit `8794f0c16dfc39d406d523a2aaca2243e28867da`): no se proporciona URL en la informacion disponible
- Papers de OpenAI sobre Whisper: no se proporciona URL en la informacion disponible
- Resultados de busqueda web: ninguno de los enlaces devueltos (finishers.com, finisherpix.com, ultimesport.fr, finisher.tn) esta relacionado con este modelo; se descartan por no ser relevantes.
