# devtcpip/cutewallet-voice

## Resumen

CuteWallet voices (ONNX) es un paquete de modelos de sintesis de voz (text-to-speech) orientado a inferencia en dispositivo, publicado por el usuario devtcpip para la aplicacion CuteWallet. No se trata de un modelo entrenado desde cero, sino de una exportacion a ONNX de los modelos Pocket TTS de Kyutai (para ingles) y del fine-tune turco de wite-tech (para turco), acompanados de los prompts de voz de los personajes de la aplicacion. El repositorio ocupa 0,3 GB y se distribuye bajo licencia CC-BY-4.0.

El problema que resuelve es la generacion de voz sintetica en local, sin dependencia de servicios en la nube: los cuatro grafos ONNX incluidos (backbone con KV cache explicita, cabeza flow, decoder Mimi y condicionador de texto) se ejecutan con onnxruntime sobre CPU. Esto lo hace adecuado para aplicaciones de escritorio o moviles con recursos limitados, donde el coste de latencia y privacidad de una API remota no es aceptable.

La relevancia es acotada: es un artefacto de despliegue para un producto concreto, con dos idiomas (turco e ingles), cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Su interes tecnico esta en mostrar el patron de exportacion ONNX int8 de un modelo TTS stateful con codec neuronal (Mimi) y en la existencia de un fine-tune turco derivado de Pocket TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai): backbone autoregresivo stateful con KV cache explicita, cabeza flow y decoder de codec neuronal Mimi; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (grafos `*_int8.onnx`); prompts de voz en float32 crudo |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (onnxruntime, CPU); prompts de voz en `.f32.bin`; tokenizer y voces en JSON |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento, sino la exportacion. Segun la model card, cada carpeta de idioma contiene cuatro componentes: `flow_lm_main_int8.onnx` (el backbone, stateful, con KV cache explicita), `flow_lm_flow_int8.onnx` (la cabeza flow), `mimi_decoder.onnx` (el decoder del codec de streaming Mimi) y `text_conditioner.onnx` (la tabla de embeddings de tokens), ademas de `model_config.json`, el tokenizer en JSON, `voices.json` y los prompts de voz `<helper>.prompt.f32.bin` en float32 crudo.

La rama inglesa deriva de `kyutai/pocket-tts` con voces del catalogo de Kyutai; la turca deriva de `wite-tech/pocket-tts-turkish`, descrito como un modelo estudiante de Kyutai Pocket TTS. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion destacable es la cuantizacion int8 de todos los grafos con ejecucion en CPU y la separacion del condicionador de texto y del decoder Mimi como grafos independientes, lo que permite cachear embeddings y transmitir audio por streaming.

## Capacidades

- Sintesis de voz a partir de texto en turco e ingles.
- Voces predefinidas por personaje ("helper") mediante prompts de voz en float32; no se documenta clonacion de voz por referencia en tiempo de ejecucion.
- Decodificacion de audio en streaming gracias al decoder Mimi independiente.
- Inferencia en dispositivo sobre CPU con onnxruntime, sin GPU.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente TTS.
- Capacidades multilingues limitadas a los dos idiomas empaquetados, en carpetas separadas por idioma.

## Casos de uso

- Asistente conversacional dentro de la app CuteWallet: los personajes ayudantes responden con voz sintetica generada localmente, sin enviar texto del usuario a un servidor.
- Aplicaciones de escritorio con requisitos de privacidad: al ejecutarse en CPU con onnxruntime, la sintesis no requiere conexion ni credenciales de API.
- Lectura de notificaciones y mensajes en turco e ingles: el modelo cubre ambos idiomas en carpetas separadas, lo que permite seleccionar el grafo segun la configuracion regional del usuario.
- Prototipado de interfaces de voz en dispositivos sin GPU: el tamano de 0,3 GB y la cuantizacion int8 permiten desplegarlo en equipos modestos.
- Educacion de idiomas: la disponibilidad de voces turcas e inglesas permite practicar pronunciacion y comprension en ambos idiomas con la misma libreria.
- Integracion en pipelines de CI para pruebas de regresion de audio: los grafos ONNX deterministas y los prompts fijos facilitan comparar la salida ante cambios de texto.
- Demos de TTS offline en navegador o Electron mediante onnxruntime-web, si el runtime objetivo lo soporta (no confirmado en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la exportacion esta pensada para onnxruntime en CPU.
- Memoria RAM estimada: no disponible con precision; el repositorio completo ocupa 0,3 GB, por lo que la huella de pesos es del orden de cientos de MB.
- GPU recomendadas: ninguna; no se documenta ejecucion en GPU.
- Cabe en hardware consumer: si, al ser CPU-only; no se especifican modelos de CPU concretos.
- Opciones de despliegue: onnxruntime (CPU) con la libreria `pocket-tts`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| devtcpip/cutewallet-voice | TTS Pocket TTS exportado | tr, en | ONNX int8 | CC-BY-4.0 | Voces de personaje incluidas; CPU |
| kyutai/pocket-tts | TTS Pocket TTS original | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo fuente de la rama inglesa |
| wite-tech/pocket-tts-turkish | TTS fine-tune turco | tr | no disponible | no disponible en la informacion | Modelo fuente de la rama turca |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos fuente en la informacion proporcionada, por lo que la comparativa se limita a origen, formato y licencia.

## Limitaciones y advertencias

- Solo cubre turco e ingles; no hay soporte de castellano ni de otros idiomas.
- No se han publicado benchmarks, por lo que la calidad de sintesis no esta cuantificada.
- El uso debe respetar los terminos de los modelos fuente: prohibida la suplantacion de voz o clonacion sin consentimiento y la generacion de contenido enganoso o danino.
- Las voces de los personajes son disenos sinteticos y no corresponden a personas reales; no deben presentarse como tales.
- Al ser un artefacto de despliegue para una aplicacion concreta, no hay garantia de mantenimiento, soporte ni actualizaciones; el repositorio registra cero descargas y cero likes en la fecha de consulta.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero las condiciones de los modelos fuente (Kyutai y wite-tech) deben verificarse por separado antes de redistribuir.
- Riesgo de alucinacion acustica y artefactos de pronunciacion no evaluado en la informacion disponible.
- La cuantizacion int8 puede degradar la calidad respecto al modelo original en float; no se documenta la magnitud de esa perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devtcpip/cutewallet-voice
- Modelo fuente ingles: https://huggingface.co/kyutai/pocket-tts
- Modelo fuente turco: https://huggingface.co/wite-tech/pocket-tts-turkish
