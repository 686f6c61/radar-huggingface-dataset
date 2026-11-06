# fusorlabs/qwen3.5-2b-web

## Resumen

Qwen3.5-2B-web es un bundle de pesos derivado de Qwen/Qwen3.5-2B (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`), compilado por fusorlabs para su ejecucion en el navegador mediante el runtime WebAssembly `qwen3-5-wasm`. No se trata de un checkpoint convencional de PyTorch ni de safetensors: el repositorio contiene un `manifest.json` que enumera cada tensor y cada parte del modelo, con las partes nombradas por su hash BLAKE3, que el runtime verifica durante la carga. El modelo base conserva la capacidad multimodal de entrada (pipeline `image-text-to-text`), de modo que el bundle permite conversar sobre texto, imagenes y videos usando unicamente la CPU del dispositivo.

La relevancia de esta publicacion es operativa: demuestra una via de despliegue de un modelo de 2.000 millones de parametros completamente en el cliente, sin backend de inferencia, con verificacion de integridad de los pesos en el propio navegador. El perfil de compilacion empleado es `q7`, que cuantiza a 7 bits todas las matrices grandes y produce un bundle de 2.517 MB (el repositorio ocupa 2,5 GB). La licencia es Apache-2.0, heredada del modelo base.

Conviene subrayar que este repositorio no documenta arquitectura, datos de entrenamiento ni evaluaciones propias: es un artefacto de compilacion y empaquetado. Toda la informacion tecnica del modelo subyacente debe consultarse en la model card de Qwen/Qwen3.5-2B, que no forma parte de la informacion disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-2B; el bundle no la documenta) |
| Parametros totales | 2B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | perfil `q7`: matrices grandes a 7 bits (2517 MB); no se documentan otros perfiles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle propietario de fusor-ai: `manifest.json` + partes nombradas por hash BLAKE3; no es safetensors ni GGUF |
| Tamano del repositorio | 2,5 GB |
| Runtime de inferencia | qwen3-5-wasm (WebAssembly, CPU del dispositivo) |
| Modalidades de entrada | texto, imagen y video (pipeline `image-text-to-text`) |
| Revision del modelo base | `15852e8c16360a2fea060d615a32b45270f8a8fc` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card del bundle se limita a describir el proceso de compilacion: se toma el checkpoint de Qwen/Qwen3.5-2B en la revision indicada y se compila con el perfil `q7`, que reduce a 7 bits todas las matrices grandes y da como resultado un artefacto de 2.517 MB. El procedimiento es reproducible mediante el comando `just model` del repositorio qwen3-5-wasm, que descarga el checkpoint y genera el mismo bundle.

La innovacion tecnica destacable no esta en el entrenamiento, sino en el formato de distribucion y en el motor de ejecucion. Cada parte del bundle se identifica por su hash BLAKE3 y el runtime lo verifica a medida que carga, lo que aporta integridad verificable de los pesos en el cliente. La inferencia se ejecuta en WebAssembly sobre la CPU del dispositivo, sin aceleracion por GPU y sin servicio remoto. No se documentan datos de entrenamiento, volumen de tokens, composicion del dataset ni fases de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, y la model card menciona explicitamente conversacion sobre texto, imagenes y videos.
- Ejecucion on-device en el navegador: inferencia en la CPU del dispositivo mediante WebAssembly, sin llamadas a un servidor de inferencia.
- Verificacion de integridad de pesos en carga mediante hashes BLAKE3 por parte del runtime.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio o matematica avanzada: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Demos interactivas sin coste de backend: el bundle se carga en una pagina web y ejecuta la inferencia en la CPU del visitante, de modo que una demo publica no requiere GPU ni factura de inferencia por visita. Es el escenario del Space fusorlabs/qwen3-5-wasm.
- Procesamiento de documentos con privacidad estricta: al no salir los datos del dispositivo, encaja en flujos donde el contenido (texto o imagenes escaneadas) no puede enviarse a un servicio externo, como documentacion legal o registros medicos.
- Descripcion y consulta de imagenes en el cliente: gracias al pipeline `image-text-to-text`, permite generar descripciones o responder preguntas sobre una imagen cargada por el usuario sin subirla a un servidor.
- Asistentes embebidos en aplicaciones web offline-first: el modelo puede empaquetarse con una PWA y funcionar sin conectividad una vez cacheado el bundle de 2,5 GB, util en entornos de campo o redes restringidas.
- Prototipado rapido de producto: permite validar una experiencia conversacional multimodal en el navegador antes de invertir en infraestructura de serving (vLLM, TGI) para el modelo completo.
- Verificacion de cadena de suministro de modelos: el esquema de manifest con hashes BLAKE3 sirve como referencia para equipos que necesitan auditar que los pesos servidos al cliente son exactamente los compilados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del bundle no incluye metricas de calidad (MMLU, HumanEval, GSM8K u otras) ni mediciones de latencia o throughput en el runtime WebAssembly.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU mediante WebAssembly, sin uso de GPU.
- Memoria del dispositivo: el bundle pesa 2.517 MB, por lo que el navegador necesita al menos ese espacio de almacenamiento mas la memoria de trabajo del runtime durante la carga y la inferencia; no se documenta el pico de RAM.
- GPU recomendadas: ninguna; el runtime objetivo es la CPU del dispositivo.
- Compatibilidad con GPU de consumo: no procede para este artefacto, ya que no esta pensado para A100, H100 ni RTX 4090.
- Opciones de despliegue: exclusivamente el runtime qwen3-5-wasm; el propio autor advierte que el bundle solo carga en ese runtime y no es un checkpoint de PyTorch ni safetensors.
- vLLM, llama.cpp, Ollama o TGI: no son compatibles con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Ejecucion | Licencia |
|---|---|---|---|---|---|
| fusorlabs/qwen3.5-2b-web | 2B | no disponible | bundle fusor-ai (q7, 2517 MB) | WebAssembly en CPU del navegador | Apache-2.0 |
| Qwen/Qwen3.5-2B | 2B | no disponible | checkpoint original (safetensors/PyTorch, presumiblemente) | GPU o CPU con frameworks estandar | no disponible en esta ficha |
| Alternativas de 2B para navegador (p. ej. variantes GGUF via WebLLM) | ~2B | no disponible | GGUF | WebGPU/WebAssembly | segun modelo |

La comparativa se limita al modelo base y a la categoria generica de modelos pequenos ejecutados en navegador, porque la informacion proporcionada no identifica alternativas concretas con datos verificables. No se dispone de cifras de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El bundle no es portable: solo carga en el runtime qwen3-5-wasm. No sirve para vLLM, llama.cpp, Ollama, TGI ni para inferencia directa con PyTorch.
- La cuantizacion a 7 bits del perfil `q7` introduce perdida de precision respecto al checkpoint original; no se documenta la degradacion resultante en calidad.
- El tamano de 2,5 GB impone una descarga inicial considerable y un consumo de almacenamiento relevante para un modelo de 2B; en redes lentas o dispositivos con poco espacio puede ser inviable.
- La inferencia en CPU dentro del navegador implica latencias muy superiores a las de una GPU; no se publican mediciones, por lo que el rendimiento real debe validarse en el hardware objetivo.
- El modelo base es de 2B parametros: cabe esperar menor robustez en razonamiento complejo, matematicas y codigo que modelos de mayor escala, aunque no se aportan evaluaciones que lo cuantifiquen.
- Riesgo de alucinacion y sesgos: no documentados en esta ficha; deben asumirse los del modelo base Qwen3.5-2B, no evaluados aqui.
- Idiomas soportados: no disponible, lo que impide confirmar la calidad en castellano.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion en produccion recae en el integrador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/qwen3.5-2b-web
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Space de demostracion: https://huggingface.co/spaces/fusorlabs/qwen3-5-wasm
- Runtime qwen3-5-wasm: https://github.com/fusor-rs/qwen3-5-wasm
- Framework fusor-ai: https://github.com/fusor-rs/fusor-ai
