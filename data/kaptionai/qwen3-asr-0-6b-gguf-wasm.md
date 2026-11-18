# kaptionai/Qwen3-ASR-0.6B-GGUF-wasm

## Resumen

Qwen3-ASR-0.6B-GGUF-wasm es un paquete de pesos cuantizados en formato GGUF publicados por kaptionai para ejecutar el modelo de reconocimiento automatico del habla Qwen3-ASR 0.6B de Qwen Team (Alibaba Cloud) dentro de un navegador. El repositorio no contiene un modelo nuevo: empaqueta dos ficheros GGUF (un fichero de pesos Q8_0 sin modificar y un proyector de audio mmproj modificado) que la extension de navegador Kaption descarga para inferencia en CPU mediante una compilacion WebAssembly de llama.cpp con libmtmd.

El modelo subyacente, Qwen3-ASR-0.6B, es un modelo de transcripcion de audio a texto con 751.632.384 parametros reales (segun safetensors), licencia Apache-2.0 y arquitectura multimodal audio-texto derivada de la familia Qwen3. El interes de esta publicacion concreta reside en la optimizacion para WebAssembly: los pesos int8 (Q8_0) aprovechan los kernels SIMD mas rapidos en wasm, y el proyector de audio ha sido reconvertido para que las convoluciones 2D se ejecuten como im2col mas multiplicacion de matrices int8.

Es relevante ahora porque demuestra la viabilidad de ASR de calidad en el cliente (navegador, sin GPU, sin enviar audio a servidores) con un modelo de menos de 1 GB. No obstante, el proyector modificado requiere un parche especifico de llama.cpp y no funciona con llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (Qwen3-ASR), empaquetado GGUF para llama.cpp/libmtmd |
| Parametros totales | 751.632.384 (dato real, safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos y proyector); conv weights en int8 (Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3-ASR-0.6B.Q8_0.gguf` y `Qwen3-ASR-0.6B.mmproj-Q8_0-convq8.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un sistema de reconocimiento automatico del habla que combina un codificador de audio con un decodificador de lenguaje de la familia Qwen3, conectados mediante un proyector multimodal. En este repositorio, los pesos se distribuyen en dos ficheros GGUF: el fichero de lenguaje cuantizado a Q8_0 y el proyector de audio (mmproj) tambien en Q8_0. El fichero de pesos es copia sin modificar de la conversion de mradermacher; el proyector ha sido modificado por kaptionai.

La modificacion afecta exclusivamente a tres tensores del proyector: `a.conv2d.2.weight` y `a.conv2d.3.weight` (convoluciones 3x3 de 480 a 480 canales) se reforman de 4-D `[3, 3, 480, 480]` a una matriz 2-D `[4320, 480]` en orden row-major (equivalente al orden de columnas de im2col) y se cuantizan a Q8_0; `a.conv_out.weight` `[7680, 896]` se cuantiza tambien a Q8_0. El resto de tensores y metadatos son identicos byte a byte al fichero original. El script `retype-mmproj.py` incluido reproduce el fichero exactamente. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del pipeline `automatic-speech-recognition`.
- Inferencia en navegador: ejecucion en CPU mediante WebAssembly con llama.cpp y libmtmd, sin aceleracion GPU.
- Procesamiento multimodal audio-texto: integracion de un proyector de audio (mmproj) con el decodificador de lenguaje.
- Cuantizacion int8 optimizada para SIMD en wasm: los kernels Q8_0 son los mas rapidos en la build WebAssembly segun el autor.
- Soporte conversacional: la etiqueta `conversational` sugiere uso en dialogos, aunque no se detalla el mecanismo.
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Transcripcion local en el navegador: la extension Kaption descarga los dos GGUF y transcribe audio en la CPU del cliente mediante WebAssembly, evitando enviar grabaciones a servidores externos y reduciendo riesgos de privacidad.
- Subtitulado de reuniones y videollamadas en entornos web: al ejecutarse en el cliente con un modelo de menos de 1 GB, permite generar subtitulos en tiempo casi real sin infraestructura de GPU en el backend.
- Notas de voz en aplicaciones web: integracion del par de ficheros GGUF en un editor o gestor de notas que transcribe dictados directamente en el navegador, con latencia dependiente de la CPU del usuario.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en paginas web, sin depender de APIs de terceros ni de conectividad constante una vez descargados los pesos.
- Procesamiento por lotes en el cliente: transcripcion de archivos de audio subidos a una web (podcasts, entrevistas) usando el modelo empaquetado, con el coste computacional asumido por el dispositivo del usuario.
- Prototipado y evaluacion de ASR sin GPU: investigadores y desarrolladores pueden probar Qwen3-ASR 0.6B en entornos sin hardware especializado usando el proyector reconvertido y un runtime parcheado.
- Distribucion offline: aplicaciones web progresivas que cachean los GGUF y ofrecen transcripcion sin conexion tras la primera descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (ejecucion en CPU via WebAssembly); en GPU, los pesos Q8_0 ocupan aproximadamente 805 MB mas 204 MB del proyector, es decir, en torno a 1 GB de memoria.
- GPU recomendadas: no disponible; el paquete esta disenado para CPU en navegador.
- Compatibilidad con GPU de consumo: los pesos caben holgadamente en cualquier GPU con 2 GB o mas de VRAM, pero el proyector modificado no funciona con llama.cpp estandar.
- Opciones de despliegue: build WebAssembly de llama.cpp con libmtmd y el parche de Kaption (runtime previsto); llama.cpp estandar solo con los ficheros upstream sin modificar de mradermacher; vLLM, Ollama y TGI no estan documentados para este paquete.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| kaptionai/Qwen3-ASR-0.6B-GGUF-wasm | 751.632.384 | no disponible | GGUF Q8_0 (wasm) | Apache-2.0 | ASR en navegador con proyector parcheado |
| Qwen/Qwen3-ASR-0.6B | 751.632.384 | no disponible | safetensors | Apache-2.0 | Modelo base ASR |
| mradermacher/Qwen3-ASR-0.6B-GGUF | 751.632.384 | no disponible | GGUF (multiples cuantizaciones) | Apache-2.0 | Conversion GGUF para llama.cpp estandar |
| kaptionai/Qwen3-ASR-0.6B-GGUF | 751.632.384 | no disponible | GGUF | Apache-2.0 | Mirror byte-identico del proyector de Kaption |

## Limitaciones y advertencias

- El proyector modificado no funciona con llama.cpp estandar: este espera pesos 4-D y fallara con el fichero `mmproj-Q8_0-convq8.gguf`. Es necesario el runtime parcheado de Kaption o usar los ficheros upstream.
- Solo se distribuye cuantizacion Q8_0; no hay variantes Q4, Q5 ni F16 en este repositorio.
- Rendimiento dependiente de la CPU del cliente y del soporte SIMD del navegador; no hay datos de latencia ni throughput publicados.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue sin consultar la model card del modelo base.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR; no se han publicado tasas de error (WER) en la informacion disponible.
- Sesgos conocidos: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero el autor original no respalda a Kaption; los creditos del modelo pertenecen a Qwen Team y la conversion a mradermacher.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.
- No hay informacion sobre tool calling, agentes ni modo thinking; no asumir estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaptionai/Qwen3-ASR-0.6B-GGUF-wasm
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Conversion GGUF upstream: https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-GGUF
- Mirror del proyector de Kaption: https://huggingface.co/kaptionai/Qwen3-ASR-0.6B-GGUF
- Revision upstream citada: `39c0af5b4099296b922e9b61db2fce4317fe2d35`
- Script de reproduccion: `retype-mmproj.py` (incluido en el repositorio)
- Model card upstream: `UPSTREAM_README.md` (incluido en el repositorio)
