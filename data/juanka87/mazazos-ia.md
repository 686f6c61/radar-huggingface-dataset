# juanka87/mazazos-ia

## Resumen

`juanka87/mazazos-ia` no es un modelo entrenado, sino un repositorio de distribucion que empaqueta copias byte a byte de dos modelos abiertos de terceros utilizados por la aplicacion Mazazos. Concretamente, aloja una conversion GGUF de `google/gemma-4-E4B-it` (realizada por Unsloth) y una conversion GGML de `openai/whisper-large-v3-turbo` (realizada por el proyecto whisper.cpp). El autor declara explicitamente que no ha entrenado ni modificado ninguno de los dos artefactos y proporciona huellas SHA-256 para verificacion de integridad.

El objetivo es desacoplar la aplicacion Mazazos de repositorios de terceros: su asistente de reglas descarga estos ficheros bajo demanda desde este repositorio en lugar de depender de Hugging Face de Unsloth o del repositorio de whisper.cpp. El repositorio tiene 5,6 GB y, segun los metadatos de safetensors, contiene 7.518.069.290 parametros, cifra que corresponde a la suma de los tensores empaquetados y no a un unico modelo.

Por tanto, esta ficha describe el repositorio y, por extension, los dos modelos que contiene: un LLM conversacional (Gemma 4 E4B, familia Gemma de Google) para el asistente de reglas y un modelo de reconocimiento de voz (Whisper large-v3-turbo de OpenAI) para la transcripcion. Cualquier evaluacion de capacidades debe remitirse a las fichas originales de dichos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de distribucion; contiene un LLM transformer (Gemma 4 E4B) y un modelo de ASR encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 7.518.069.290 (suma de tensores del repo, no de un unico modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (Gemma 4 E4B, GGUF); Q5_0 (Whisper large-v3-turbo, GGML) |
| Idiomas soportados | no disponible (los originales: Gemma 4 multilingue; Whisper large-v3-turbo multilingue, sin listado oficial en esta informacion) |
| Licencia | Apache 2.0 (Gemma 4) y MIT (Whisper); declarada como "other" con nombre "apache-2.0-and-mit" |
| Formato de pesos | GGUF (`gemma-4-E4B-it-Q4_K_M.gguf`) y GGML (`ggml-large-v3-turbo-q5_0.bin`) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Incluye dos artefactos:

- `gemma-4-E4B-it-Q4_K_M.gguf`: conversion GGUF del modelo `google/gemma-4-E4B-it`, realizada por Unsloth en la revision `bfc15c382204943c3a8fff0c750b94ae2364d7a3`. La cuantizacion Q4_K_M reduce el peso a aproximadamente 4 bits por parametro con escalas de grupo K-quant, un formato habitual para inferencia en CPU y GPU de gama media con llama.cpp.
- `ggml-large-v3-turbo-q5_0.bin`: conversion GGML del modelo `openai/whisper-large-v3-turbo`, realizada por el proyecto whisper.cpp en la revision `5359861c739e955e79d9a303bcbc70fb988958b1`. La cuantizacion Q5_0 se usa en whisper.cpp para reducir memoria manteniendo calidad de transcripcion.

No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones tecnicas especificas en la informacion proporcionada; dichos detalles deben consultarse en las fichas de `google/gemma-4-E4B-it` y `openai/whisper-large-v3-turbo`.

## Capacidades

- Generacion de texto y conversacion: el componente Gemma 4 E4B es un modelo de lenguaje instructivo orientado a dialogo.
- Reconocimiento automatico de voz (ASR): el componente Whisper large-v3-turbo transcribe audio a texto.
- Traduccion de voz potencial: Whisper large-v3-turbo soporta tareas de transcripcion y traduccion segun su modelo original (no confirmado en esta informacion).
- Uso integrado en la app Mazazos: asistente de reglas que combina entrada de voz y respuesta conversacional.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (los modelos originales son multilingues, pero no se detalla cobertura).

## Casos de uso

- Asistente de reglas dentro de la app Mazazos: el modelo Gemma 4 E4B responde consultas del usuario sobre reglas del juego o de la aplicacion; el repositorio garantiza que la descarga bajo demanda no dependa de terceros.
- Dictado por voz en aplicaciones moviles: Whisper large-v3-turbo transcribe audio del usuario a texto antes de enviarlo al LLM, permitiendo interaccion manos libres.
- Despliegue offline en dispositivos: al estar en GGUF/GGML cuantizados, ambos modelos pueden ejecutarse con llama.cpp y whisper.cpp sin conexion, util para entornos con conectividad limitada.
- Verificacion de integridad en pipelines de distribucion: las huellas SHA-256 publicadas permiten validar que los ficheros descargados coinciden con los originales antes de cargarlos.
- Prototipado rapido de asistentes conversacionales con voz: combinacion de ASR y LLM en un unico repositorio simplifica la puesta en marcha de demos.
- Servicio de transcripcion local para reuniones o notas: Whisper large-v3-turbo Q5_0 puede usarse como motor de transcripcion en estaciones de trabajo sin GPU dedicada.
- Cache o mirror interno de modelos: equipos que necesiten servir estos modelos a traves de su propia infraestructura pueden replicar este repositorio como espejo verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Gemma 4 E4B Q4_K_M: aproximadamente 4-5 GB para los pesos; con contexto extendido y cache KV, prever 6-8 GB.
- VRAM estimada para Whisper large-v3-turbo Q5_0: aproximadamente 1-2 GB para los pesos; la memoria total depende de la duracion del audio y del backend.
- GPU recomendadas: RTX 3060 12 GB o superior para ejecutar ambos modelos en paralelo; A100/H100 no son necesarias para estos tamanos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para el LLM; el modelo de voz cabe en GPUs mas modestas.
- Opciones de despliegue: llama.cpp (GGUF) y whisper.cpp (GGML) son los backends naturales; Ollama puede cargar el GGUF de Gemma, y vLLM/TGI no soportan GGUF/GGML de forma nativa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanka87/mazazos-ia (Gemma 4 E4B Q4_K_M) | 7.518.069.290 (repo completo) | no disponible | GGUF | Apache 2.0 + MIT | Hugging Face |
| google/gemma-4-E4B-it (original) | no disponible | no disponible | safetensors | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-E4B-it-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo (original) | no disponible | no disponible | safetensors | MIT | Hugging Face |

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier evaluacion de calidad debe hacerse sobre los modelos originales, no sobre este repositorio.
- La licencia declarada es "other" con nombre "apache-2.0-and-mit"; conviene revisar los ficheros `LICENSE-APACHE-2.0.txt` y `LICENSE-MIT-whisper.txt` antes de uso comercial.
- La ficha original no lista idiomas soportados ni contexto; no se deben asumir valores.
- Riesgo de alucinacion: inherente al componente LLM (Gemma 4 E4B); no evaluado en esta informacion.
- Sesgos: no documentados en la informacion proporcionada.
- Dependencia de terceros: el repositorio replica artefactos de Unsloth y whisper.cpp en revisiones fijas; si esos proyectos publican correcciones, este repositorio no las recibe automaticamente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-27) es futura respecto a la redaccion habitual de fichas; verificar la coherencia temporal antes de citar el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/juanka87/mazazos-ia
- Modelo original Gemma 4 E4B: https://huggingface.co/google/gemma-4-E4B-it
- Conversion GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Modelo original Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Licencia del repositorio: https://huggingface.co/juanka87/mazazos-ia/blob/main/README.md
