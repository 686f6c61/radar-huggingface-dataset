# ravetools/piano-visualizer

## Resumen

`ravetools/piano-visualizer` no es un modelo de lenguaje, sino un repositorio de artefactos estaticos para una herramienta web de visualizacion musical. Contiene dos componentes bien diferenciados: por un lado, el modelo de transcripcion de piano **Transkun V2** de Yujia Yan exportado a ONNX en dos grafos (`transkun_score.onnx` y `transkun_attr.onnx`); por otro, una coleccion de muestras de piano del **Salamander Grand Piano V3** de Alexander Holm, recodificadas en Opus/Ogg y AAC/M4A.

El proposito del repositorio es servir los ficheros que descarga el navegador del usuario para convertir una grabacion de piano o un fichero MIDI en un video de "falling notes", ejecutando toda la inferencia en el dispositivo mediante ONNX Runtime Web. No hay backend: el modelo se descarga y se ejecuta en cliente, lo que convierte este repositorio en un ejemplo practico de despliegue de transcripcion musical en el navegador.

La relevancia es acotada pero concreta: demuestra que un modelo de transcripcion de piano con decodificacion semi-CRF puede portarse a ONNX y ejecutarse en WebAssembly/WebGPU sin servidor, reutilizando los pesos publicados de Transkun V2 sin modificacion. El repositorio ocupa 0,2 GB y no incluye pesos en formato safetensors ni GGUF, solo grafos ONNX y muestras de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transkun V2 (transcripcion de piano, dos grafos ONNX: `score` y `attr`); decodificacion semi-CRF en JavaScript |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican grafos ONNX sin cuantizar) |
| Idiomas soportados | no disponible (no aplica; entrada de audio musical) |
| Licencia | MIT para Transkun; CC BY 3.0 para las muestras Salamander |
| Formato de pesos | ONNX (dos grafos); audio en Opus/Ogg y AAC/M4A |
| Tamano del repositorio | 0,2 GB |
| Libreria | onnx |
| Pipeline en Hugging Face | no disponible |

## Arquitectura y entrenamiento

El componente de modelado es **Transkun V2**, un sistema de transcripcion automatica de piano (AMT) desarrollado por Yujia Yan y publicado bajo licencia MIT. La model card indica que se exportaron los pesos publicados del checkpoint V2 sin cambios, unicamente alterando el formato del grafo. La inferencia se divide en dos etapas: `transkun_score.onnx` recibe un segmento de audio y produce puntuaciones de intervalo (que notas suenan y en que rango temporal), y `transkun_attr.onnx` toma los intervalos detectados y estima velocidad, onset y offset refinados. La busqueda semi-CRF que genera la secuencia final de notas se ejecuta en JavaScript, fuera del grafo ONNX.

No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; estos datos corresponden al paper original de Transkun y no se reproducen en la model card. La innovacion practica del repositorio es el propio empaquetado: dividir el modelo en dos grafos compatibles con ONNX Runtime Web y delegar la decodificacion estructurada al runtime JavaScript, lo que permite ejecutar transcripcion de piano en el navegador sin infraestructura servidor.

El segundo componente, `salamander/`, no es un modelo sino un banco de muestras: un Yamaha C5 muestreado cada tercera menor desde A0 hasta C8 en 16 capas de velocidad, mas la resonancia de cuerdas al soltar la tecla. Cada muestra se recorta a -55 dB por debajo de su pico con un fundido de 0,25 s y se recodifica en Opus y AAC.

## Capacidades

- Transcripcion de audio de piano a eventos de nota (onset, offset, velocidad) mediante los dos grafos ONNX.
- Refinamiento de atributos de nota (velocidad, onset y offset ajustados) en una segunda etapa.
- Decodificacion semi-CRF en JavaScript para producir la secuencia final de notas.
- Ejecucion integra en el navegador mediante ONNX Runtime Web, sin backend.
- Reproduccion de audio de piano con 16 capas de velocidad y resonancia de cuerdas a partir de las muestras Salamander.
- Conversion de grabacion de piano o fichero MIDI en video de "falling notes" dentro de la herramienta Piano Visualizer.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo; es un sistema especializado de transcripcion musical.

## Casos de uso

- **Transcripcion de grabaciones de piano en el navegador**: el usuario sube un audio y los dos grafos ONNX detectan notas y atributos sin enviar el audio a un servidor, lo que resulta adecuado para material sensible o para reducir costes de infraestructura.
- **Generacion de videos de "falling notes"**: la herramienta Piano Visualizer usa la salida de transcripcion y las muestras Salamander para renderizar la animacion y el audio sincronizado, sin necesidad de un pipeline de renderizado en servidor.
- **Prototipado de aplicaciones musicales web**: desarrolladores que quieran integrar transcripcion de piano en una web pueden reutilizar los grafos ONNX y el patron de decodificacion en JavaScript como referencia de despliegue en cliente.
- **Educacion musical interactiva**: un estudiante puede cargar una grabacion propia y obtener una representacion visual de las notas detectadas, con la ventaja de que el procesamiento ocurre en su dispositivo.
- **Investigacion sobre despliegue en el borde**: el repositorio sirve como caso de estudio de portado de un modelo AMT con decodificacion estructurada (semi-CRF) a ONNX Runtime Web, incluyendo la separacion en dos grafos.
- **Sintesis de referencia con Salamander**: las muestras recodificadas permiten reproducir el resultado de la transcripcion con un piano muestreado de calidad, en Opus para navegadores generales y AAC para Safari.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de nota (onset F1, frame F1, nota con offset) ni comparaciones con otros sistemas de transcripcion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX Runtime Web, el consumo depende del navegador y del backend (WASM o WebGPU), no de VRAM dedicada.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para ejecutarse en el dispositivo del usuario final. El rendimiento mejora con aceleracion WebGPU en navegadores compatibles, aunque la model card no detalla requisitos.
- Compatibilidad con GPU de consumo: si, en la medida en que el navegador exponga WebGPU o un backend WASM eficiente; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime Web (WASM y WebGPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ravetools/piano-visualizer (Transkun V2 ONNX) | Transcripcion de piano | no disponible | no aplica | MIT (modelo) + CC BY 3.0 (muestras) | ONNX | Hugging Face, orientado a navegador |
| Transkun V2 original (Yujia-Yan/Transkun) | Transcripcion de piano | no disponible | no aplica | MIT | PyTorch | GitHub |
| Salamander Grand Piano V3 | Banco de muestras | no aplica | no aplica | CC BY 3.0 | WAV original; Ogg/M4A en este repo | freepats.zenvoid.org y este repo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de transcripcion con alternativas como Onsets and Frames o MT3; la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje ni un pipeline de Hugging Face estandar; las herramientas que esperan `pipeline` o pesos safetensors no lo reconoceran como modelo convencional.
- La licencia es compuesta: MIT cubre Transkun, pero las muestras Salamander estan bajo CC BY 3.0, lo que exige atribucion a Alexander Holm y permite uso comercial con atribucion; conviene revisar `LICENSE.md` antes de redistribuir.
- La transcripcion esta especializada en piano; no se garantiza funcionamiento con otros instrumentos, mezclas o audio con ruido.
- No hay datos publicados sobre sesgos, tasas de alucinacion de notas (notas espurias) ni robustez frente a distintas grabaciones.
- El rendimiento en el navegador depende del soporte de WebGPU/WASM del cliente; en dispositivos modestos la latencia puede ser alta, aunque no se cuantifica.
- La decodificacion semi-CRF en JavaScript puede ser el cuello de botella en fragmentos largos; no se especifican limites de duracion de audio.
- No se indica compatibilidad con versiones concretas de ONNX Runtime Web ni requisitos minimos de navegador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ravetools/piano-visualizer
- Herramienta Piano Visualizer: https://rave-tools.com/tools/piano-visualizer
- Transkun V2 (codigo original, Yujia Yan): https://github.com/Yujia-Yan/Transkun
- Salamander Grand Piano V3 (Alexander Holm): https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html
- Licencia CC BY 3.0: https://creativecommons.org/licenses/by/3.0/
- Paquete R ravetools (posible relacion con el autor, no confirmado): https://dipterix.org/ravetools/reference/
