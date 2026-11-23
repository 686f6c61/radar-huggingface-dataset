# dcharlot65-openie/whisper-tiny.en-LittleBit

## Resumen

`whisper-tiny.en-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `openai/whisper-tiny.en`, el modelo de reconocimiento automatico del habla (ASR) en ingles de OpenAI. Lo publica el usuario `dcharlot65-openie` como artefacto del ecosistema JouleDB, una base de datos termodinamica y runtime de inferencia sin PyTorch orientado a despliegues nativos en Kubernetes (JouleKube). No es un modelo nuevo entrenado desde cero, sino una reformulacion comprimida del Whisper tiny original.

La innovacion principal es la compresion extrema: el checkpoint se almacena en formato `.jsyn` (zstd + CRC32) con un promedio de 0,5238 bits por peso, lo que reduce los 72,02 MB equivalentes en FP16 a 3,92 MB, un factor de 18,39x. La tecnica combina "LittleBit-2" (tensores en planos de bits 2D) con "Sakana SVF" (pre-factorizacion de pesos), y separa 69 tensores 2D de 98 vectores 1D (LayerNorm y bias). El modelo base conserva los 37.760.256 parametros de Whisper tiny.

Su relevancia es mas de investigacion que de produccion: demuestra un pipeline de compresion sub-1-bit aplicado a un modelo de audio real y un formato de despliegue alternativo. El repo esta vacio (0,0 GB), sin descargas ni likes, y la model card es esencialmente una ficha de formato mas que una guia de uso del modelo ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) con pesos pre-factorizados LittleBit-2 + Sakana SVF |
| Parametros totales | 37.760.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de 30 s de audio; no confirmado en la ficha) |
| Tipos de cuantizacion | Sub-1-bit: 0,5238 BPW promedio, formato `.jsyn` (zstd + CRC32) |
| Idiomas soportados | Ingles (sufijo `.en` del modelo base; no confirmado explicitamente en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Whisper tiny en su variante solo-ingles: un transformer encoder-decoder para transcripcion de audio. Sobre esa base, este checkpoint aplica una transformacion de representacion de pesos: los tensores 2D se almacenan como planos de bits (2D bitplane tensors, 69 tensores) y los vectores 1D de LayerNorm y bias se guardan aparte (98 vectores). La combinacion LittleBit-2 + Sakana SVF se describe como "pre-factorizada", es decir, los pesos se descomponen en factores antes de la compresion sub-1-bit.

No hay informacion sobre datos de entrenamiento, numero de tokens, RLHF/DPO ni proceso de destilacion o calibracion de la compresion. La model card no documenta perdida de calidad respecto al Whisper tiny original, ni el procedimiento de reconstruccion de pesos en el runtime. El unico dato de entrenamiento implicito es el del modelo base de OpenAI, no reproducido en la ficha.

## Capacidades

- Reconocimiento automatico del habla en ingles, heredado de `openai/whisper-tiny.en` (transcripcion de audio a texto).
- Deteccion de actividad de voz y marcas de tiempo a nivel de segmento, segun las capacidades estandar de Whisper (no verificadas en este checkpoint).
- Carga y ejecucion mediante el runtime JouleDB, con descarga desde Hugging Face via `db.hf_pull(...)`.
- Despliegue nativo en Kubernetes a traves de JouleKube.
- No se documentan tool calling, function calling, capacidades de agente, vision, audio de entrada mas alla de ASR, ni modo thinking.
- Capacidades multilingues: no disponibles (el modelo base es solo ingles).

## Casos de uso

- Transcripcion de audio en entornos con restricciones de almacenamiento: el checkpoint de 3,92 MB permite empaquetar el modelo en imagenes de contenedor minimas y desplegarlo en nodos con poco disco.
- Procesamiento de audio en el borde (edge): el tamano reducido facilita ejecutar ASR en dispositivos con memoria limitada, siempre que el runtime JouleDB este disponible.
- Pipelines de transcripcion dentro de Kubernetes: JouleKube permite escalar replicas del servicio ASR como cualquier otro workload, con el modelo descargado desde Hugging Face en el arranque.
- Prototipado de ASR en ingles para demos y pruebas de concepto donde la precision no es critica y prima el tamano del artefacto.
- Evaluacion de tecnicas de compresion sub-1-bit: util como caso de estudio para medir el impacto de LittleBit-2 + SVF en un modelo de audio conocido.
- Archivado de modelos con huella de almacenamiento minima: el formato `.jsyn` con CRC32 permite conservar checkpoints verificables en repositorios pequenos.
- No es adecuado para produccion con requisitos de precision ASR alta, dado que no se documenta la degradacion respecto al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El peso comprimido ocupa 3,92 MB, pero el runtime debe reconstruir los pesos (72,02 MB en FP16 equivalentes) en memoria, por lo que la huella real en inferencia no esta documentada.
- GPU recomendadas: no disponibles. Whisper tiny es un modelo pequeno que en su forma original funciona en CPU y GPUs consumer, pero este checkpoint depende del runtime JouleDB, cuyo soporte de aceleracion no se especifica.
- ¿Cabe en GPU consumer? Probablemente si, por el tamano del modelo base (37,7 M de parametros), pero no hay confirmacion en la ficha.
- Opciones de despliegue: exclusivamente JouleDB (`jouledb serve --http-addr ...`), instalable con `cargo binstall jouledb`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny.en-LittleBit | 37,76 M | no disponible | `.jsyn` (JouleDB) | Apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-tiny.en | 37,76 M | ventanas de 30 s de audio | safetensors / PyTorch | Apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base.en | 74 M | ventanas de 30 s de audio | safetensors / PyTorch | Apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small.en | 244 M | ventanas de 30 s de audio | safetensors / PyTorch | Apache-2.0 | Hugging Face, ampliamente usado |

La comparativa con otros modelos de ASR del mismo tamano no esta disponible en la informacion proporcionada; solo se conocen los datos del modelo base y de las variantes de Whisper por conocimiento general, no verificados en la ficha.

## Limitaciones y advertencias

- No hay datos publicados sobre la degradacion de la calidad ASR tras la compresion sub-1-bit; el uso en produccion sin evaluacion previa es arriesgado.
- El modelo base es solo ingles; no se documenta soporte multilingue.
- El repo esta vacio (0,0 GB) y no tiene descargas ni likes: no hay evidencia de uso ni validacion por terceros.
- Dependencia total del runtime JouleDB y del ecosistema JouleKube; no hay pesos en safetensors ni GGUF, lo que impide usarlo con herramientas estandar (transformers, whisper.cpp, faster-whisper).
- La model card no documenta sesgos, riesgo de alucinacion en transcripcion ni comportamiento con audio ruidoso.
- Licencia Apache-2.0 permite uso comercial, pero la cadena de dependencias del runtime JouleDB y su madurez no estan evaluadas.
- La fecha de creacion del repo (2026-11-23) y la ausencia de pipeline declarado sugieren un artefacto experimental, no un modelo listo para produccion.
- No se especifica si la reconstruccion de pesos es determinista ni como se verifica la integridad mas alla del CRC32 del contenedor.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/whisper-tiny.en-LittleBit
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- JouleDB (repositorio): https://github.com/openIE-dev/jouledb
