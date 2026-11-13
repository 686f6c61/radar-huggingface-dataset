# Neurobrix/orpheus-3b-0.1-ft-nbx

## Resumen

`Neurobrix/orpheus-3b-0.1-ft-nbx` es un contenedor de empaquetado del modelo de sintesis de voz (text-to-speech) `canopylabs/orpheus-3b-0.1-ft`, publicado por NeuroBrix bajo la libreria `neurobrix` y el formato de contenedor propietario `.nbx`. No se trata de un modelo entrenado por NeuroBrix: es el mismo modelo de Canopy Labs, con los mismos pesos y la misma licencia Apache 2.0, reempaquetado para ejecutarse dentro del motor de inferencia NeuroBrix. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 13 de noviembre de 2026.

El modelo subyacente es un TTS de aproximadamente 3.000 millones de parametros (el sufijo "3b" del identificador lo indica), disenado para convertir texto en audio. La model card del contenedor no aporta detalles sobre la arquitectura interna, el dataset de entrenamiento ni los idiomas soportados; toda esa informacion remite a la model card original de Canopy Labs, que no forma parte de la informacion proporcionada.

La relevancia de este repositorio es fundamentalmente operativa: permite ejecutar el modelo con el motor NeuroBrix sobre GPU NVIDIA, GPU de Mac (Metal) y CPU, con backend PyTorch o backend Triton (sin dependencia de PyTorch, mediante kernels `nbxtensor` certificados por clase de GPU). El contenedor ocupa 15,2 GB e incluye el grafo de computacion, los pesos, la topologia de componentes y los valores por defecto de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; detalles en la model card original de Canopy Labs) |
| Parametros totales | aproximadamente 3.000 millones (segun el identificador "3b") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo original) |
| Formato de pesos | contenedor `.nbx` (15,2 GB); pesos originales en el repositorio de Canopy Labs, formato no especificado en la informacion disponible |
| Pipeline | text-to-speech |
| Modelo base | canopylabs/orpheus-3b-0.1-ft |
| Libreria | neurobrix |
| SHA-256 del contenedor | `246daf61e62a8b958b3061b605ea7fb5024e97b6659cf11af15cb91ec2d9610a` |
| Backends de ejecucion | PyTorch y Triton (kernels `nbxtensor`, sin PyTorch) |
| Hardware soportado | GPU NVIDIA, GPU de Mac (Metal), CPU |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) del modelo `canopylabs/orpheus-3b-0.1-ft`. La model card del contenedor delega explicitamente estos detalles a la model card original de Canopy Labs, que no se incluye en la informacion proporcionada.

Lo unico documentado a nivel tecnico es la capa de empaquetado de NeuroBrix: el contenedor `.nbx` encapsula el grafo de computacion del modelo, sus pesos, la forma en que se conectan los componentes y los valores por defecto de runtime. El motor planifica la distribucion de cada parte del modelo entre las GPUs y la memoria disponibles (una GPU, varias, en streaming o en host) y puede ejecutar los kernels mediante PyTorch o mediante Triton con `nbxtensor`, certificados por clase de GPU. No se documenta ninguna innovacion de decodificacion especulativa, atencion lineal ni tecnicas equivalentes.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech), tarea principal del pipeline declarado.
- Generacion de audio en formato WAV mediante el comando `neurobrix run --prompt ... --output speech.wav`.
- Ejecucion local en GPU NVIDIA, GPU de Mac (Metal) y CPU, sin depender de servicios en la nube.
- Ejecucion con backend Triton sin PyTorch instalado, mediante kernels `nbxtensor`.
- Planificacion automatica de recursos: reparto entre una o varias GPUs, streaming de pesos o ejecucion en host.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling, function calling, agentes, vision, audio de entrada o modo thinking: no disponibles; no es un modelo de ese tipo.

## Casos de uso

- Narracion de articulos y boletines: el modelo convierte texto plano en audio WAV ejecutandose en local, lo que permite generar locuciones de forma masiva sin coste por peticion ni envio de contenido a terceros.
- Accesibilidad para lectores de pantalla: integracion en aplicaciones de escritorio o web que necesiten convertir contenido dinamico en voz, aprovechando que el motor funciona tambien en CPU y en GPU de Mac.
- Generacion de audiolibros y podcasts automatizados: el pipeline TTS permite procesar lotes de texto y producir ficheros de audio listos para publicacion dentro de un flujo de CI/CD.
- Prototipado de asistentes de voz: equipos que desarrollan interfaces conversacionales pueden desplegar el modelo en su propia GPU para iterar sobre guiones y respuestas sin depender de APIs externas.
- Investigacion en sintesis de voz: al ser un contenedor reproducible con hash SHA-256 fijado y licencia Apache 2.0, sirve como base para experimentos comparativos de calidad de audio y latencia entre backends (PyTorch frente a Triton).
- Demos y entornos sin conectividad: el despliegue local en CPU o GPU de consumo permite llevar un TTS a entornos aislados, ferias o maquetas donde no hay acceso a internet.
- Evaluacion de motores de inferencia: util para medir el rendimiento del motor NeuroBrix sobre un modelo TTS de 3B, comparando la planificacion multi-GPU, el streaming de pesos y la ejecucion en host.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El contenedor ocupa 15,2 GB, lo que da una referencia del espacio en disco necesario; la VRAM requerida depende de la precision de los pesos, que no se documenta.
- GPU recomendadas: no se especifican modelos concretos. El motor declara soporte para GPU NVIDIA, GPU de Mac (Metal) y CPU.
- No hay confirmacion de que quepa en GPU de consumo; con 3.000 millones de parametros es plausible en tarjetas de 24 GB en precision reducida, pero la informacion proporcionada no lo confirma.
- Opciones de despliegue: motor NeuroBrix (`pip install neurobrix`, `neurobrix import`, `neurobrix run`) con backend PyTorch o Triton. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un contenedor `.nbx` propietario no se puede asumir compatibilidad con ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas TTS comparables, por lo que no es posible establecer una comparacion rigurosa con numeros.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinacion ni limitaciones de idioma; hay que remitirse a la model card original de Canopy Labs, no incluida aqui.
- Al ser un modelo TTS, el riesgo principal no es la alucinacion de hechos sino la pronunciacion incorrecta, la omision de texto o la generacion de prosodia inadecuada; no hay datos publicados al respecto en esta ficha.
- Idiomas soportados no disponibles: no se debe asumir cobertura multilingue sin verificarlo en la fuente original.
- Licencia Apache 2.0, que permite uso comercial, pero se hereda integramente del modelo original; cualquier restriccion adicional de Canopy Labs aplicaria sin cambios.
- El formato `.nbx` es propietario y ligado al motor NeuroBrix: no es portable a otros runtimes sin conversion, lo que introduce dependencia de una herramienta concreta.
- El repositorio tiene 0 descargas y 0 likes y fue publicado en noviembre de 2026; no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- El SHA-256 del contenedor esta fijado, lo que permite verificar integridad, pero no se documenta el proceso de empaquetado ni auditoria de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Neurobrix/orpheus-3b-0.1-ft-nbx
- Modelo original: https://huggingface.co/canopylabs/orpheus-3b-0.1-ft
- Descarga del contenedor: https://neurobrix.org/models/canopylabs/orpheus-3b-0.1-ft
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- GitHub de nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
