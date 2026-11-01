# orucexe/kokoro-tts-azerbaijani

## Resumen

Kokoro-82M Azerbaijani es un ajuste fino del modelo de sintesis de voz Kokoro-82M, desarrollado por el usuario orucexe, orientado especificamente al idioma azerbaiyano. Kokoro-82M es una arquitectura StyleTTS 2 de 82 millones de parametros que se ha consolidado como una de las opciones mas eficientes para TTS de calidad en entornos con recursos limitados. Este ajuste anade una voz femenina unica entrenada sobre 8,6 horas de audio de estudio limpio.

La relevancia de esta variante radica en su exportacion a ONNX de extremo a extremo con el vocoder iSTFTNet integrado, lo que permite inferencia en tiempo real directamente en el navegador mediante WebGPU o WASM SIMD, sin necesidad de infraestructura de servidor. Esto la convierte en una opcion practica para aplicaciones web con sintesis de voz local y privacidad por diseno.

El modelo se distribuye bajo licencia Apache 2.0, con un repositorio de 0,7 GB, y esta pensado para un unico idioma (az) y una unica voz. No se han publicado resultados de benchmarks ni comparativas objetivas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (Kokoro-82M) con vocoder iSTFTNet integrado |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (exportacion ONNX y PyTorch; no se detallan variantes cuantizadas) |
| Idiomas soportados | azerbaiyano (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (WebGPU y WASM SIMD) y PyTorch |

## Arquitectura y entrenamiento

El modelo parte de Kokoro-82M, una implementacion de StyleTTS 2 que combina un modelo acustico basado en difusion de estilo con un vocoder neuronal. En esta variante, el vocoder iSTFTNet se ha integrado de extremo a extremo en el grafo ONNX, con hop length de 300 y 80 canales mel, lo que simplifica el despliegue al eliminar la necesidad de encadenar modulos separados en produccion.

El ajuste fino se realizo en dos etapas: primero alineacion, duracion y F0, y despues con una perdida adversarial basada en el modelo SLM `microsoft/wavlm-base-plus`. Se uso el optimizador AdamW con `bert_lr` de 1e-5, `lr` de 1e-4 y batch size de 4. El dataset de entrenamiento consta de aproximadamente 5.000 clips (8,6 horas) de voz femenina de estudio, en PCM mono de 16 bits a 24 kHz con normalizacion de pico a -1,0 dBFS. No se detalla la composicion linguistica del corpus ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Sintesis de voz (text-to-speech) en azerbaiyano con una voz femenina unica (estilo `af_aoede`).
- Inferencia en tiempo real en navegador mediante ONNX Runtime Web con WebGPU o WASM SIMD.
- Ejecucion en Python con los pesos ONNX o PyTorch.
- Generacion de audio a 24 kHz, 16 bits, mono.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio de entrada.
- Multilingue: no; unicamente azerbaiyano.

## Casos de uso

- Lectura de articulos y contenido web en azerbaiyano: el modelo puede integrarse en un lector de paginas que sintetice texto en el navegador mediante WebGPU, sin enviar el contenido a un servidor y preservando la privacidad del usuario.
- Accesibilidad para personas con discapacidad visual: su ejecucion local en el cliente permite incorporar narracion en aplicaciones web y moviles sin coste recurrente de API ni dependencia de conectividad.
- Asistentes de voz para interfaces de atencion al ciudadano en azerbaiyano: al ser un modelo de 82M, puede desplegarse en servidores modestos o incluso en el dispositivo, ofreciendo respuestas habladas con baja latencia.
- Audiolibros y contenido editorial: la voz femenina de estudio del dataset permite generar narraciones de calidad aceptable para prototipos y publicaciones internas, con postprocesado de audio posterior.
- Aprendizaje de idiomas: aplicaciones de practica de pronunciacion en azerbaiyano que necesitan sintetizar frases de forma dinamica y local, sin cuotas de API.
- Prototipado rapido de productos de voz: gracias a la licencia Apache 2.0 y a la exportacion ONNX, equipos de desarrollo pueden validar ideas de TTS en horas, ejecutando la demo web o el notebook de prueba incluidos.
- Sistemas embebidos y kioscos interactivos: el reducido tamano del modelo (0,7 GB de repositorio, 82M de parametros) permite su despliegue en hardware con recursos limitados donde un modelo TTS grande no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo (82M de parametros) es previsible que quepa en GPUs consumer con pocos GB, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible. La model card menciona aceleracion WebGPU y WASM SIMD, sin listar modelos de GPU concretos.
- Cabe en GPU consumer: si, segun el diseno del modelo base Kokoro-82M, aunque no se especifican modelos exactos en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime (WebGPU y WASM SIMD) en navegador, y Python con ONNX o PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles. La model card afirma inferencia en tiempo real en cliente, pero sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kokoro-82M Azerbaijani (este modelo) | 82M | az | Apache 2.0 | ONNX, PyTorch | Voz femenina unica, vocoder integrado, inferencia en navegador |
| Kokoro-82M (base) | 82M | multi (en, es, fr, etc.) | Apache 2.0 | ONNX, PyTorch | Mayor cobertura idiomatica, sin voz azerbaiyana |
| Piper TTS | variable (por voz) | multi | MIT (segun voces) | ONNX | Enfoque ligero y local, ecosistema distinto |
| XTTS-v2 (Coqui) | ~467M | multi (incluye clonacion) | Coqui Public Model License | PyTorch | Mayor tamano, clonacion de voz, licencia no comercial en algunos usos |

Los datos de los modelos alternativos se ofrecen como referencia general de categoria; no se dispone de comparativas de rendimiento medidas en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola voz (femenina) y un solo idioma (azerbaiyano); no hay variedad de hablantes ni cambio de estilo.
- El dataset de entrenamiento es reducido (8,6 horas, ~5.000 clips), lo que puede limitar la cobertura fonetica y la naturalidad en dominios alejados del corpus.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, siglas, numeros o terminologia tecnica no representada en el corpus.
- No se han publicado evaluaciones objetivas (MOS, WER, similitud de hablante) ni benchmarks; la calidad percibida no esta cuantificada.
- Posibles sesgos derivados de una unica voz de estudio y de un dominio acustico concreto (grabacion limpia); el rendimiento puede degradarse con texto ruidoso o estilos informales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Kokoro-82M y del dataset original, no detalladas en la model card.
- El modelo es TTS puro: no realiza comprension del texto, normalizacion linguistica avanzada ni control de prosodia mas alla de lo aprendido.
- La fecha de creacion del repositorio indicada en la informacion (2026-10-30) resulta anomala; conviene verificar la procedencia y vigencia del artefacto antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orucexe/kokoro-tts-azerbaijani
- Notebook de prueba: https://huggingface.co/orucexe/kokoro-tts-azerbaijani/blob/main/kokoro-tts-azerbaijani.ipynb
- Demo web (playground): https://tts.orucs.net/
- Modelo base Kokoro-82M: no disponible en la informacion proporcionada
- Paper de StyleTTS 2: no disponible en la informacion proporcionada
- Modelo SLM usado (`microsoft/wavlm-base-plus`): https://huggingface.co/microsoft/wavlm-base-plus
