# DrDrakath/kokoro-82m-senate-onnx

## Resumen

El modelo DrDrakath/kokoro-82m-senate-onnx es una variante optimizada del modelo de texto a voz Kokoro-82M, exportada a formato ONNX y redistribuida por el usuario DrDrakath. Se presenta como un reemplazo directo (drop-in) del archivo `onnx/model.onnx` de precisión completa publicado por onnx-community/Kokoro-82M-v1.0-ONNX, con el objetivo de reducir el tamano de descarga de 326 MB a 219 MB. La reduccion se consigue almacenando unicamente los tensores de pesos del decodificador en float16, mientras que el resto de la computacion se mantiene en float32.

Kokoro-82M es un modelo de sintesis de voz (text-to-speech) con 82 millones de parametros desarrollado originalmente por hexgrad y publicado bajo licencia Apache 2.0. Su relevancia estriba en que ofrece una calidad de voz comparable a la de modelos mucho mas grandes, con un coste computacional y un tamano que permiten ejecutarlo en el navegador a traves de WebGPU y transformers.js. Los pesos aqui distribuidos son una modificacion del export de onnx-community, redistribuida bajo la misma licencia Apache 2.0.

Esta ficha concreta responde a una necesidad practica: servir la locucion del Senado romano en el proyecto ChronoAtlas. La modificacion evita el desbordamiento (overflow) que puede producirse en WebGPU al emplear un modelo completamente en float16, sin alterar de forma perceptible el resultado sonoro. El modelo no esta pensado como un modelo de lenguaje, sino como un componente especializado de sintesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card describe un codificador de texto, un predictor de prosodia y un decodificador) |
| Parametros totales | 82 millones (segun el modelo base Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos del decodificador en float16; computacion en float32; codificador de texto y predictor de prosodia sin modificar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

La model card indica que el modelo se compone de tres bloques: un codificador de texto (text encoder), un predictor de prosodia y un decodificador. La modificacion introducida respecto al export original afecta unicamente a los tensores de pesos del decodificador, que se almacenan en float16; un nodo `Cast` los convierte de nuevo a float32 en el momento de cargar la sesion ONNX. El codificador de texto y el predictor de prosodia permanecen intactos. Se trata, por tanto, de un cambio centrado en la representacion de los pesos y la compatibilidad con WebGPU, no de una arquitectura nueva.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo base Kokoro-82M fue desarrollado por hexgrad y exportado a ONNX por la organizacion onnx-community. Los pesos distribuidos en este repositorio son una modificacion de ese export, redistribuida bajo la misma licencia Apache 2.0, y la model card no documenta un proceso de reentrenamiento o ajuste fino adicional.

## Capacidades

- Sintesis de voz (text-to-speech): convierte texto de entrada en audio.
- Soporte de multiples voces: la model card menciona una evaluacion sobre 21 voces.
- Ejecucion en navegador mediante WebGPU y la libreria transformers.js.
- Fidelidad declarada: mantiene tiempos identicos y una diferencia espectral media inferior a 0,01 dB respecto al modelo original, segun la medicion del autor sobre 4 longitudes de frase.
- Compatibilidad como reemplazo directo del archivo `onnx/model.onnx` del export de onnx-community.
- No soporta tool calling ni function calling (es un modelo de sintesis de voz).
- No dispone de modo de razonamiento (thinking mode), vision, audio de entrada ni capacidades de agente.

## Casos de uso

- Narracion historica en navegador: ChronoAtlas emplea este modelo para dar voz al Senado romano directamente en el cliente, sin enviar texto a un servidor de TTS.
- Asistentes de voz web: cualquier aplicacion que necesite locucion en tiempo real puede cargar el modelo con transformers.js y ejecutarlo con WebGPU, evitando llamadas a APIs externas.
- Accesibilidad en paginas web: lectura en voz alta de contenido para usuarios con discapacidad visual, con la ventaja de que el modelo funciona localmente y reduce la dependencia de servicios de terceros.
- Audiolibros y podcasts generados: conversion de texto largo en audio mediante procesamiento por fragmentos, gracias al reducido tamano del modelo (219 MB).
- Videojuegos y experiencias interactivas: locucion de personajes en el navegador o en cliente ligero, donde el tamano reducido y la compatibilidad con float32 en WebGPU resultan determinantes.
- Prototipado e investigacion en sintesis de voz: su licencia Apache 2.0 y su formato ONNX facilitan la experimentacion y la integracion en pipelines existentes.
- Sistemas embebidos y despliegues de bajos recursos: al ocupar 0,2 GB el repositorio y requerir computo mayoritariamente en float32, puede ejecutarse en dispositivos sin GPU dedicada mediante ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento aportado por el autor es una medida de fidelidad respecto al modelo original: sobre 21 voces y 4 longitudes de frase, la salida presenta tiempos identicos y una diferencia espectral media inferior a 0,01 dB. No se proporcionan cifras de latencia, throughput, MOS (Mean Opinion Score) ni comparaciones con otros modelos de TTS.

## Requisitos de hardware

- Tamano del modelo: 219 MB (frente a los 326 MB de la version en precision completa), segun la model card. El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamano del modelo, es previsible que quepa en cualquier GPU con unos pocos cientos de megabytes libres, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. El autor menciona especificamente WebGPU, lo que abarca tanto GPU integradas como dedicadas en navegador.
- Compatibilidad con GPU de consumo: el modelo esta disenado para ejecutarse en el navegador via WebGPU, por lo que en principio cabe en GPU de gama baja y en muchas GPU integradas. No se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime, transformers.js (JavaScript/WebGPU) y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| DrDrakath/kokoro-82m-senate-onnx (este modelo) | 82 M | no disponible | ONNX | 219 MB | Apache 2.0 | Decodificador en float16, computo en float32; pensado para WebGPU |
| onnx-community/Kokoro-82M-v1.0-ONNX (base) | 82 M | no disponible | ONNX | 326 MB | Apache 2.0 | Export de precision completa del que deriva este modelo |
| hexgrad/Kokoro-82M (original) | 82 M | no disponible | no disponible | no disponible | Apache 2.0 | Modelo original de hexgrad del que parte el export ONNX |

No se dispone de datos comparativos de rendimiento (MOS, latencia) entre estos tres modelos mas alla de la diferencia espectral aportada por el autor. Para alternativas de otras familias de TTS no se ha encontrado informacion en los resultados de busqueda proporcionados.

## Limitaciones y advertencias

- El modelo es una modificacion no oficial del export de onnx-community; no ha sido validado ni respaldado por hexgrad ni por onnx-community.
- No hay informacion sobre sesgos de voz, cobertura de acentos o sesgos de generacion en el material proporcionado.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero un modelo de TTS puede producir pronunciaciones incorrectas o artefactos de audio ante entradas fuera de distribucion.
- No se documentan los idiomas soportados. La ausencia de este dato impide garantizar un funcionamiento multilingue.
- La fidelidad declarada (diferencia espectral inferior a 0,01 dB) procede del propio autor y no se ha verificado de forma independiente; se basa en una comparacion limitada a 21 voces y 4 longitudes de frase.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y atribucion correspondientes a hexgrad y onnx-community.
- No se especifican requisitos minimos de hardware ni limites de latencia, por lo que el rendimiento real en produccion dependera del dispositivo y del runtime empleado.
- La model card no detalla el proceso de entrenamiento ni el dataset, lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DrDrakath/kokoro-82m-senate-onnx
- Modelo base en ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Export ONNX anterior: https://huggingface.co/onnx-community/Kokoro-82M-ONNX
- Modelo original de hexgrad: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de NVIDIA sobre Kokoro: https://github.com/NVIDIA/kokoro
- Proyecto ChronoAtlas (uso declarado por el autor): https://chronoatlas.nl/senate
- Tutorial de despliegue de Kokoro-82M ONNX: https://aiindigo.com/tutorials/getting-started-with-kokoro-82m-v1-0-onnx-deploy-fast-tts-anywhere
