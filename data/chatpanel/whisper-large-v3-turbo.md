# ChatPanel/whisper-large-v3-turbo

## Resumen

ChatPanel/whisper-large-v3-turbo es una copia sin modificar del modelo `onnx-community/whisper-large-v3-turbo`, publicado por el autor ChatPanel para que su pasarela (gateway) descargue desde un unico punto los modelos que ejecuta. El modelo original es `openai/whisper-large-v3-turbo`, la variante optimizada para velocidad de la familia Whisper de OpenAI, especializada en reconocimiento automatico del habla (ASR) y traduccion de voz a texto.

El repositorio no contiene ningun reentrenamiento, conversion ni edicion: los ficheros son byte a byte los del upstream en el commit `360ebcde2559d60bb474678be3c1de9ef347d01a`, e incluyen los pesos en formato ONNX ya cuantizados (`encoder_model_quantized.onnx` y `decoder_model_merged_quantized.onnx`). El repo ocupa 1,1 GB y se distribuye bajo licencia MIT, la misma del upstream.

Su relevancia practica es acotada: no aporta ninguna mejora tecnica sobre el modelo de `onnx-community`, pero resulta util si se quiere consumir exactamente los mismos artefactos ONNX desde un espejo controlado por ChatPanel. Para cualquier uso en produccion conviene referenciar directamente el repositorio upstream, que es el que mantiene la trazabilidad y la documentacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer encoder-decoder de la familia Whisper; la model card de este repo no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos ONNX cuantizados (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`); el esquema exacto figura en `quantize_config.json`, no detallado en la model card |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder y decoder fusionado, cuantizados), mas tokenizer y ficheros de configuracion JSON |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni entrenamiento propios: es una copia literal del paquete ONNX publicado por `onnx-community` a partir de `openai/whisper-large-v3-turbo`. La model card indica explicitamente que "nothing here was retrained, converted or edited — the files are byte-for-byte the upstream ones", por lo que cualquier detalle de arquitectura, datos de entrenamiento, tokens vistos o tecnicas de alineacion (por ejemplo, fine-tuning supervisado o RLHF) debe consultarse en la documentacion de OpenAI y de `onnx-community`, no en este repo.

El unico elemento tecnico diferencial es el empaquetado: dos grafos ONNX cuantizados (encoder y decoder fusionado) mas `quantize_config.json`, `preprocessor_config.json`, tokenizer BPE (`vocab.json`, `merges.txt`, `tokenizer.json`) y `generation_config.json`. La cuantizacion reduce el peso del repo a 1,1 GB y permite ejecucion en CPU o en GPUs modestas mediante ONNX Runtime, pero el autor no publica la precision efectiva ni los parametros del esquema de cuantizacion en la model card.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, heredada de Whisper large-v3-turbo.
- Traduccion de voz a texto: el modelo base de Whisper soporta traduccion al ingles desde otros idiomas; este repo no documenta los pares disponibles.
- Ejecucion via ONNX Runtime: los grafos cuantizados permiten inferencia en CPU y en GPUs sin necesidad de PyTorch.
- Integracion con la pasarela de ChatPanel: el repo esta pensado para que el gateway de ChatPanel descargue los artefactos desde un unico origen.
- Tool calling / function calling: no disponible (no es una capacidad de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la documentacion de este repo; dependen del modelo base.
- Capacidades especiales (vision, audio nativo, thinking mode): no disponibles en la model card de este repo.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el paquete ONNX cuantizado se puede cargar con ONNX Runtime en un servidor sin GPU dedicada y transcribir audio de forma local, sin depender de APIs externas.
- Subtitulado automatico de video: al ejecutarse en CPU mediante ONNX, encaja en pipelines por lotes que procesan grabaciones y generan ficheros de subtitulos sin coste por minuto de API.
- Despliegue en el ecosistema ChatPanel: si ya se opera la pasarela de ChatPanel, este repo garantiza que los pesos se descargan desde un origen controlado y con hashes SHA-256 verificables.
- Archivado y auditoria de artefactos: al incluir hashes SHA-256 de cada fichero, sirve para replicar un entorno de inferencia reproducible en entornos con requisitos de trazabilidad.
- Prototipado rapido de ASR en aplicaciones de escritorio: el formato ONNX evita instalar PyTorch y simplifica el empaquetado en aplicaciones nativas o Electron.
- Pruebas de integracion en CI: se puede usar como dependencia fija (commit concreto) para tests de regresion de un pipeline de audio, sin riesgo de que el upstream cambie de version.
- Transcripcion en entornos con conectividad limitada: al ser un repo autocontenido de 1,1 GB, se puede cachear en local y evitar descargas repetidas desde Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card; el repo pesa 1,1 GB en disco con pesos ONNX cuantizados, por lo que la huella en memoria es del orden de ese tamano mas los buffers de activacion de ONNX Runtime.
- GPU recomendadas: no disponibles en la documentacion de este repo. Al ser ONNX cuantizado, es plausible su ejecucion en CPU y en GPUs consumer, pero el autor no publica requisitos ni pruebas.
- Compatibilidad con GPU consumer: no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican o no estan documentadas para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/whisper-large-v3-turbo | no disponible | no disponible | ONNX cuantizado | MIT | Hugging Face (espejo) |
| onnx-community/whisper-large-v3-turbo | no disponible | no disponible | ONNX | MIT (upstream) | Hugging Face (origen) |
| openai/whisper-large-v3-turbo | no disponible | no disponible | safetensors / PyTorch | MIT | Hugging Face (modelo base) |

La unica diferencia relevante entre las tres entradas es el origen y el empaquetado: este repo es un espejo byte a byte del de `onnx-community`, que a su vez deriva del modelo de OpenAI. No hay diferencias de rendimiento ni de capacidades documentadas entre ellos.

## Limitaciones y advertencias

- No aporta ninguna mejora tecnica: es una copia literal del upstream, sin reentrenamiento, conversion ni edicion.
- La model card no documenta arquitectura, numero de parametros, contexto, idiomas ni esquema de cuantizacion; toda esa informacion debe buscarse en el repo de `onnx-community` o en el de OpenAI.
- Riesgo de desactualizacion: al fijarse a un commit concreto (`360ebcde...`), no recibira correcciones o mejoras que el upstream publique despues.
- Trazabilidad limitada: el autor no publica benchmarks, evaluaciones ni pruebas de calidad del paquete.
- Sesgos y alucinaciones: no documentados en este repo; dependen del modelo base de Whisper y de sus datos de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar los terminos del modelo base de OpenAI y del paquete de `onnx-community` antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Para produccion se recomienda referenciar directamente `onnx-community/whisper-large-v3-turbo` o `openai/whisper-large-v3-turbo`, que son las fuentes mantenidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/whisper-large-v3-turbo
- Upstream ONNX: https://huggingface.co/onnx-community/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del upstream referenciado: `360ebcde2559d60bb474678be3c1de9ef347d01a`
- Model card original conservada en el repo: `UPSTREAM_README.md`
