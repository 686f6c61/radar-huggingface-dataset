# Goalpost/qwen3-asr-1.7b-ko-q8

## Resumen

Goalpost/qwen3-asr-1.7b-ko-q8 es un paquete de pesos cuantizados a int8 (Q8) del modelo de reconocimiento automatico de voz TeamUNIVA/qwen3_asr_1.7b_ko, que a su vez es un fine-tune en coreano de Qwen/Qwen3-ASR-1.7B. El paquete lo genera la herramienta ainoya/qwen-asr con la opcion `--pack-q8`, pensada para su motor de inferencia en navegador basado en WebAssembly y WebGPU. No se realizo ningun entrenamiento adicional: es una conversion de formato y precision del modelo base.

El modelo resuelve el despliegue de ASR en coreano directamente en el cliente (navegador), sin servidor ni GPU dedicada en backend, gracias a la compilacion a WASM y a la aceleracion WebGPU. El repositorio ocupa 2,2 GB y contiene unicamente los pesos empaquetados (`qwen-asr-q8.bin`) junto con los ficheros de tokenizacion (`vocab.json`, `merges.txt`), heredados sin cambios del modelo base.

Por su naturaleza de paquete de pesos y no de modelo entrenado, la ficha debe leerse como una evaluacion del artefacto de despliegue: la calidad de transcripcion depende del fine-tune coreano de TeamUNIVA y de la arquitectura Qwen3-ASR subyacente, no de este repositorio. La licencia Apache-2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo ASR con encoder y decoder; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.700 millones (aproximado, segun el nombre del modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (Q8 empaquetado con `--pack-q8` de qwen-asr) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | `qwen-asr-q8.bin` (formato empaquetado propietario de qwen-asr); tokenizer en `vocab.json` y `merges.txt` |
| Tamano del repositorio | 2,2 GB |
| Modelo base | TeamUNIVA/qwen3_asr_1.7b_ko (fine-tune coreano de Qwen/Qwen3-ASR-1.7B) |
| Runtime objetivo | WebAssembly / WebGPU (motor ainoya/qwen-asr) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. El modelo subyacente es Qwen3-ASR-1.7B, un sistema de reconocimiento automatico de voz de Qwen con encoder acoplado a un decoder de la familia Qwen3; los detalles exactos de capas, atencion y composicion del dataset no se detallan en la informacion proporcionada. Sobre esa base, TeamUNIVA realizo un fine-tune especifico para coreano, del que tampoco se publican en este repositorio el numero de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de refuerzo o destilacion.

La innovacion tecnica de este artefacto es el empaquetado Q8 para el motor ainoya/qwen-asr: los pesos del encoder y del decoder se convierten a int8 y se serializan en un unico fichero binario optimizado para carga en WebAssembly con aceleracion WebGPU. Esto permite ejecutar un ASR de 1.7B parametros en el navegador con un footprint de aproximadamente 2,2 GB en disco y una huella de memoria menor que la de los pesos en fp16 o fp32. No se documentan en la informacion disponible tecnicas como decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia mas alla de la cuantizacion.

## Capacidades

- Reconocimiento automatico de voz (ASR) en coreano: transcripcion de audio a texto.
- Ejecucion en navegador mediante WebAssembly y WebGPU, sin backend dedicado.
- Cuantizacion int8 empaquetada para reducir el consumo de memoria en cliente.
- Uso del tokenizer original del modelo base, sin modificaciones.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, tool calling ni agentes en la informacion proporcionada.
- No se documentan modos de razonamiento, vision ni audio mas alla de la propia entrada de voz.

## Casos de uso

- Transcripcion en el navegador: aplicaciones web de notas de voz o dictado que transcriben audio coreano localmente, sin enviar grabaciones a un servidor, usando el binario Q8 cargado via WebGPU. Adecuado por su runtime WASM/WebGPU y por reducir requisitos de backend.
- Herramientas de accesibilidad: subtitulado en vivo de contenido hablado en coreano dentro de paginas web, aprovechando la inferencia en cliente para evitar latencia de red y problemas de privacidad.
- Procesamiento por lotes offline en el dispositivo: transcripcion de ficheros de audio almacenados localmente en aplicaciones de escritorio que embeben un runtime WebAssembly, sin depender de APIs de terceros.
- Prototipado rapido de productos ASR: validacion de ideas de producto en coreano con un modelo Apache-2.0 y un artefacto listo para el motor qwen-asr, sin necesidad de infraestructura GPU.
- Extensiones de navegador para dictado: integracion en editores web o formularios para convertir voz a texto en coreano, con el modelo ejecutandose en la pestana del usuario.
- Educacion de idiomas: practica de pronunciacion y transcripcion de ejercicios orales en coreano en aplicaciones web, manteniendo el audio en el dispositivo del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 2,2 GB y los pesos estan en int8, por lo que la huella de memoria en ejecucion sera del orden de los gigabytes, menor que la de los pesos en fp16.
- GPU recomendadas: no se especifican; el runtime objetivo es WebGPU, por lo que se apoya en la GPU integrada o dedicada disponible en el navegador del usuario.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; al ejecutarse en navegador via WebGPU, depende del soporte WebGPU del navegador y del hardware del cliente.
- Opciones de despliegue: motor ainoya/qwen-asr (WebAssembly/WebGPU) para el fichero `qwen-asr-q8.bin`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Goalpost/qwen3-asr-1.7b-ko-q8 | ~1.7B | no disponible | coreano | Apache-2.0 | Q8 empaquetado para qwen-asr (WASM/WebGPU) |
| TeamUNIVA/qwen3_asr_1.7b_ko | ~1.7B | no disponible | coreano | no disponible en esta ficha | pesos del modelo base (formato no disponible) |
| Qwen/Qwen3-ASR-1.7B | ~1.7B | no disponible | no disponible | no disponible en esta ficha | pesos originales (formato no disponible) |

La comparativa con alternativas de terceros (por ejemplo, Whisper de OpenAI u otros ASR multilingues) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano; no se documenta capacidad multilingue ni deteccion automatica de idioma.
- Es un artefacto de cuantizacion int8: puede haber una perdida de precision en la transcripcion respecto al modelo base en fp16, aunque no se publican mediciones de esa diferencia.
- No es un modelo entrenado de forma independiente; cualquier sesgo o limitacion proviene del fine-tune TeamUNIVA y del Qwen3-ASR original, cuyos detalles no se recogen aqui.
- Riesgo de alucinacion en audio con ruido, solapamiento de voces o acentos no representados en el corpus de fine-tune; no hay datos publicados sobre robustez.
- Dependencia del runtime ainoya/qwen-asr y del soporte WebAssembly/WebGPU del navegador; el fichero `qwen-asr-q8.bin` no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia comunitaria de calidad ni de estabilidad en produccion.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base TeamUNIVA y de Qwen3-ASR antes de redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Goalpost/qwen3-asr-1.7b-ko-q8
- Modelo base del fine-tune: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Modelo original Qwen3-ASR: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Herramienta de empaquetado y runtime: https://github.com/ainoya/qwen-asr
