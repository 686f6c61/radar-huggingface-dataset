# devoar/voxboard-models

## Resumen

VoxBoard-models es un repositorio espejo (mirror) publicado por el usuario devoar en Hugging Face que agrupa los archivos de modelo que la aplicacion iOS VoxBoard descarga para realizar dictado y limpieza de texto completamente en el dispositivo (on-device). No se trata de un modelo entrenado por el autor, sino de un conjunto de reempaquetados sin modificaciones de releases upstream de terceros, con el SHA-256 de cada archivo fijado en la aplicacion para garantizar la integridad de la descarga.

El repositorio combina dos familias de componentes: por un lado, modelos de reconocimiento automatico del habla (ASR) convertidos a Core ML para su ejecucion en hardware Apple, como OpenAI Whisper (via la conversion de Argmax/WhisperKit), NVIDIA Parakeet TDT 0.6B (convertido por FluidInference) y Moonshine de Useful Sensors/Moonshine AI. Por otro, modelos de lenguaje en cuantizacion GGUF empleados para la limpieza y postprocesado del texto dictado: Qwen3 y Qwen3.5 (Alibaba Qwen), Gemma 3 (Google), Llama 3.2 1B (Meta) y SmolLM2 (Hugging Face).

Su relevancia practica radica en que documenta un patron de despliegue de IA local en movil: ASR en Core ML mas un LLM pequeno cuantizado para tareas de correccion y formateo, sin dependencia de la nube. Cada modelo conserva su licencia original, por lo que el uso comercial del conjunto esta condicionado por la licencia mixta de los distintos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta: modelos ASR (Whisper encoder-decoder, Parakeet TDT, Moonshine) convertidos a Core ML y LLMs transformer en GGUF |
| Parametros totales | Variable por archivo; no disponible un valor unico (repo de 10,9 GB con multiples modelos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF para los LLM (niveles concretos no especificados); Core ML para los modelos ASR |
| Idiomas soportados | No disponible (depende de cada modelo upstream) |
| Licencia | Mixta: MIT (Whisper), CC BY 4.0 (Parakeet), Apache 2.0 (Qwen3/Qwen3.5, SmolLM2), Gemma Terms of Use (Gemma 3), Llama 3.2 Community License (Llama 3.2 1B), licencia propia de Moonshine |
| Formato de pesos | ZIP con modelos Core ML (ASR) y GGUF (LLM) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio; es un agregador de artefactos. Los modelos ASR incluidos cubren tres arquitecturas distintas: Whisper de OpenAI (transformer encoder-decoder con atencion multitarea para transcripcion y traduccion), Parakeet TDT 0.6B de NVIDIA (arquitectura FastConformer con decodificacion Token-and-Duration Transducer) y Moonshine de Useful Sensors (disenado para ASR eficiente en dispositivos). Las conversiones a Core ML permiten ejecucion acelerada en el Neural Engine de los chips Apple, y son obra de Argmax (WhisperKit) y FluidInference (Parakeet) respectivamente.

Para la fase de limpieza de texto, el repo incluye LLMs pequenos en GGUF: Qwen3 y Qwen3.5, Gemma 3, Llama 3.2 1B y SmolLM2. No se especifican en la model card los tamanos concretos de cada variante, los datos de entrenamiento, ni si los upstream emplearon RLHF o DPO; esa informacion reside en las fichas de cada modelo original. La innovacion tecnica del repositorio es de empaquetado y verificacion: reempaquetado sin cambios y fijado de hashes SHA-256 para descargas deterministas en produccion movil.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante Whisper, Parakeet TDT 0.6B y Moonshine.
- Dictado en tiempo real en el dispositivo, sin envio de audio a servidores externos.
- Limpieza y postprocesado de texto dictado con LLMs pequenos (correccion, puntuacion, formateo).
- Ejecucion acelerada en hardware Apple via Core ML y Neural Engine.
- Despliegue de LLM en formato GGUF para inferencia local.
- Verificacion de integridad de los archivos descargados mediante SHA-256.
- Capacidades especificas adicionales (tool calling, vision, audio nativo en LLM, thinking mode): no disponibles en la informacion proporcionada; dependen de cada modelo upstream.

## Casos de uso

- Dictado por voz en aplicaciones iOS: la app descarga el archivo Whisper o Parakeet en Core ML y transcribe el audio localmente, evitando subir grabaciones a la nube y reduciendo la latencia al no depender de red.
- Postprocesado de transcripciones: un LLM pequeno en GGUF (por ejemplo, Llama 3.2 1B o SmolLM2) recibe el texto crudo del ASR y aplica puntuacion, mayusculas y correccion de errores antes de insertarlo en el campo de texto.
- Aplicaciones de notas de voz con privacidad estricta: al ejecutarse todo en el dispositivo, el contenido dictado no sale del terminal, lo que encaja en sectores con requisitos de confidencialidad como sanidad o legal.
- Asistentes de escritura offline: el LLM cuantizado puede reformular o resumir el texto dictado sin conexion, util en entornos sin cobertura o con conectividad intermitente.
- Distribucion de modelos en apps moviles: el patron de espejo con hashes fijados sirve de referencia para equipos que necesitan servir artefactos de IA de forma reproducible y verificable a clientes iOS.
- Evaluacion comparativa de ASR en movil: al reunir Whisper, Parakeet y Moonshine en el mismo formato de despliegue, permite medir precision y consumo entre arquitecturas sobre el mismo hardware.
- Prototipado de pipelines de voz a texto con limpieza LLM: util para experimentar con combinaciones ASR + LLM pequeno antes de fijar una arquitectura de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput para ninguno de los modelos incluidos.

## Requisitos de hardware

- El repositorio esta orientado a ejecucion en dispositivos Apple: los modelos ASR en Core ML aprovechan el Neural Engine de los chips de la serie A y M.
- VRAM estimada: no disponible de forma agregada; depende del modelo concreto. Los LLM en GGUF incluidos (Qwen3, Gemma 3, Llama 3.2 1B, SmolLM2) son de escala pequena y estan pensados para memoria unificada de dispositivos moviles, pero no se especifican los tamanos exactos.
- GPU recomendadas: no aplica en el caso de Core ML (se usa la GPU/Neural Engine integrados de Apple). Para los GGUF en escritorio, cualquier GPU consumer moderna puede ejecutar modelos de 1B a pocos miles de millones de parametros, pero no se detallan las variantes.
- Cabe en GPU consumer: previsiblemente si para los LLM pequenos en cuantizacion GGUF, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: Core ML en iOS para los modelos ASR; llama.cpp u Ollama para los GGUF en escritorio; vLLM y TGI no aplican a los artefactos Core ML y su compatibilidad con los GGUF concretos no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxBoard-models (este repo) | Agregador ASR + LLM on-device | Multiples, no disponible | No disponible | Mixta | Hugging Face (devoar/voxboard-models) |
| argmaxinc/whisperkit-coreml | ASR Core ML (Whisper) | Variantes Whisper (tiny a large) | No disponible | MIT | Hugging Face |
| FluidInference (Parakeet Core ML) | ASR Core ML (Parakeet TDT 0.6B) | 0,6B | No disponible | CC BY 4.0 | Hugging Face |
| moonshine-ai/moonshine | ASR on-device | No disponible | No disponible | Licencia upstream | GitHub / Hugging Face |

La comparativa directa con modelos individuales no es del todo equivalente, ya que VoxBoard-models es un espejo que contiene precisamente esos upstream; se incluye como referencia de los componentes que agrega.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un mirror de artefactos de terceros; los fallos o sesgos provienen de los modelos upstream.
- Licencia mixta: el uso comercial exige revisar y cumplir la licencia de cada archivo (MIT, CC BY 4.0, Apache 2.0, Gemma Terms of Use, Llama 3.2 Community License y la licencia de Moonshine).
- La licencia Llama 3.2 Community License y los Gemma Terms of Use imponen restricciones y obligaciones adicionales para uso comercial y redistribucion.
- Riesgo de alucinacion en la fase de limpieza de texto con LLM: el postprocesado puede introducir palabras no dictadas; conviene validar el pipeline antes de produccion.
- Idiomas soportados no documentados en la ficha; dependen de cada modelo upstream y pueden limitar el dictado multilingue.
- Longitud de contexto no especificada; los LLM pequenos incluidos manejan ventanas limitadas, lo que restringe la limpieza de textos largos.
- Dependencia del ecosistema Apple para los modelos Core ML; el despliegue fuera de iOS/macOS requiere usar los pesos GGUF o los modelos upstream originales.
- Repositorio sin descargas ni likes y creado recientemente segun los metadatos; no hay evidencia publica de uso en produccion.
- No se especifican los niveles de cuantizacion GGUF ni los tamanos exactos de cada variante, lo que dificulta estimar consumo de memoria sin inspeccionar los archivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/devoar/voxboard-models
- Sitio de VoxBoard: https://voxboard.ai/
- WhisperKit Core ML (Argmax): https://huggingface.co/argmaxinc/whisperkit-coreml
- FluidInference (conversiones Parakeet Core ML): https://huggingface.co/FluidInference
- Moonshine (repositorio upstream): https://github.com/moonshine-ai/moonshine
- Qwen (Alibaba): https://huggingface.co/Qwen
- Gemma (Google): https://huggingface.co/google
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Llama 3.2 (Meta): https://huggingface.co/meta-llama
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB
