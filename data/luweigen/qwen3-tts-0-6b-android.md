# luweigen/qwen3-tts-0.6b-android

## Resumen

`luweigen/qwen3-tts-0.6b-android` es un paquete de artefactos derivados de `Qwen/Qwen3-TTS-12Hz-0.6B-Base` (revision `5d839924`, licencia Apache-2.0) preparados específicamente para ejecutar síntesis de voz con clonación de voz en un dispositivo Android, sin conexión de red en tiempo de ejecución. No es un modelo nuevo entrenado desde cero, sino una redistribución del modelo base de Qwen convertida a formatos adecuados para móvil: GGUF para llama.cpp (CPU/OpenCL), TFLite/LiteRT con pesos fp16 para el vocoder en GPU Adreno, ONNX fp32 del vocoder para CPU y tablas binarias auxiliares (RVQ, code predictor) en f16. El autor es `luweigen`, y el paquete se enmarca en el proyecto `read-android`, una aplicación nativa de lectura en voz alta de documentos Markdown y texto.

El modelo base es un sistema TTS de arquitectura en dos etapas: un *talker* (un LM Qwen3 que genera el codebook 0 por trama) y un *code predictor* (un Qwen3 de 5 capas que predice los codebooks 1 a 15), seguido de un vocoder que convierte 16 codebooks en audio a 24 kHz. El pipeline opera a 12,5 tramas por segundo de audio. Los parámetros reales declarados en safetensors para este repo son 78.721.280 (~78,7 M), lo que refleja que el paquete contiene componentes parciales y cuantizados, no el modelo completo de 0,6 B.

La relevancia de esta ficha es acotada pero concreta: demuestra que un TTS de Qwen puede trocearse y cuantizarse para inferencia totalmente local en Android, con verificación de integridad por sha256 compilada en el APK y sin incluir ninguna voz preentrenada. Es un artefacto de despliegue, no un modelo de propósito general, y así debe evaluarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en dos etapas: talker (LM Qwen3 que genera codebook 0 por trama) + code predictor (Qwen3 de 5 capas que predice codebooks 1-15) + vocoder (decoder del tokenizer de voz). 12,5 tramas por segundo de audio |
| Parametros totales | 78.721.280 (~78,7 M) segun safetensors del repo; el modelo base se denomina 0.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (code predictor GGUF), Q8_0 (talker GGUF), fp16 (vocoder TFLite/LiteRT y tablas), fp32 (vocoder ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, TFLite/LiteRT, ONNX, binarios f16 propios (`rvq-tables.bin`, `qwen3-tts-0.6b-cp-tables.bin`) |

## Arquitectura y entrenamiento

El paquete no documenta entrenamiento propio: es una derivacion del modelo base `Qwen/Qwen3-TTS-12Hz-0.6B-Base`, por lo que los datos de entrenamiento, el numero de tokens y el uso de RLHF/DPO corresponden al modelo original y no se detallan en la informacion disponible. Lo que si se describe con precision es la arquitectura de inferencia en movil. El *talker* es un LM Qwen3 exportado como GGUF con arquitectura `qwen3tts` mediante `convert_hf_to_gguf.py` de llama.cpp b12319 y cuantizado a Q8_0; genera el codebook 0 de cada trama. El *code predictor* es un Qwen3 de 5 capas exportado como GGUF `qwen3` sin vocabulario (entradas son embeddings, salida es el estado oculto) en Q4_0, y predice los codebooks 1 a 15; sus cabezas de salida y embeddings de realimentacion se evaluan con NEON en la app a partir de `qwen3-tts-0.6b-cp-tables.bin`.

El vocoder es el decoder del tokenizer de voz y transforma 16 codebooks por trama en audio a 24 kHz en ventanas fijas de 25 tramas de contexto mas N tramas nuevas. Al ser causal, una ventana incompleta se rellena por la derecha sin alterar el resultado. La desquantizacion RVQ es lineal y se ejecuta en CPU con tablas precalculadas (`Σ_q table_q[code_q]`), de modo que los ficheros del vocoder reciben el latente `[1, 512, W]`. El vocoder se distribuye en dos variantes (W75 y W45, esta ultima para la cola de hasta 20 tramas de un segmento), troceadas en tres segmentos LiteRT que se ejecutan secuencialmente en GPU; los segmentos 0 y 2 requieren precision fp32 en GPU. Se incluyen reescrituras matematicamente equivalentes para GPU movil: escalas por canal plegadas en capas lineales vecinas y softmax enmascarado escrito a mano.

## Capacidades

- Sintesis de voz (text-to-speech) a 24 kHz con pipeline de 12,5 tramas por segundo.
- Clonacion de voz a partir de una grabacion de referencia: la app construye un *voice pack* (x-vector de hablante, codigos de audio de referencia y texto de referencia) generado en PC con `tools/make-voice.py` e importado por separado.
- Inferencia totalmente local en Android, sin red en tiempo de ejecucion.
- Lectura en voz alta de documentos Markdown y texto.
- Ejecucion del talker en llama.cpp sobre CPU u OpenCL, y del vocoder en GPU Adreno via LiteRT 2.3.2 (probado en Adreno 630) o en CPU via ONNX Runtime.
- Verificacion de integridad de los ficheros descargados mediante sha256 compilado en el APK.
- Soporte de tool calling, agentes, vision, audio de entrada o modo thinking: no disponible (no aplica a este artefacto).

## Casos de uso

- Lectura en voz alta de documentos en Android: la app descarga los ficheros GGUF/TFLite y ejecuta el pipeline completo en el dispositivo, lo que permite leer Markdown o texto sin conexion y sin enviar contenido a servidores externos.
- Accesibilidad para personas con discapacidad visual: al ser TTS on-device con clonacion de voz, un usuario puede importar su propia voz de referencia y escuchar documentos con una voz familiar sin depender de servicios en la nube.
- Aplicaciones de privacidad estricta: el diseno sin red en tiempo de ejecucion evita la exposicion de texto sensible, adecuado para lectura de notas medicas, legales o personales en el propio telefono.
- Prototipado de TTS movil para desarrolladores: los artefactos sirven como referencia de como trocear un TTS de Qwen en talker, code predictor y vocoder, y de como cuantizar cada parte (Q8_0, Q4_0, fp16) para distintos aceleradores.
- Evaluacion de LiteRT/LiteRT GPU en Adreno: los segmentos `vocoder-w75.c*.fp16.tflite` y `vocoder-w45.c*.fp16.tflite` permiten medir el rendimiento de un vocoder causal en GPU movil con precision mixta fp16/fp32.
- Integracion en pipelines de lectura por lotes en PC: el vocoder ONNX fp32 (`vocoder-w75.htp.onnx`) con formas estaticas permite validar la salida del pipeline en CPU antes de desplegarlo en el telefono.
- Base para experimentos de clonacion de voz controlada: al no incluir ninguna voz, obliga a que el usuario aporte una grabacion sobre la que tenga derechos, lo que encaja en flujos de investigacion con consentimiento explicito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numerica. El repo ocupa 1,8 GB e incluye variantes cuantizadas (Q4_0, Q8_0, fp16, fp32), por lo que el consumo real depende de que ficheros cargue la app.
- GPU recomendadas: GPU Adreno para el vocoder LiteRT (probado en Adreno 630); el talker puede ejecutarse en CPU u OpenCL via llama.cpp.
- Cabe en GPU de consumo: si, el destino es GPU integrada de movil (Adreno). No se documentan requisitos para A100, H100 o RTX 4090 porque el artefacto esta pensado para Android.
- Opciones de despliegue: llama.cpp (CPU/OpenCL) para los GGUF, LiteRT 2.3.2 para los TFLite, ONNX Runtime CPU EP para el vocoder ONNX. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. Solo se indica la tasa del pipeline (12,5 tramas por segundo de audio) y que el vocoder ONNX en CPU es lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Enfoque |
|---|---|---|---|---|---|
| luweigen/qwen3-tts-0.6b-android | ~78,7 M (repo parcial) | no disponible | GGUF, TFLite, ONNX, binarios f16 | Apache-2.0 | TTS on-device para Android |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6 B (nominal) | no disponible | safetensors (modelo base) | Apache-2.0 | TTS generico, base de este paquete |
| Alternativas TTS on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros TTS en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: es un conjunto de artefactos de despliegue que dependen de una app Android concreta (`read-android`) y de un *voice pack* generado aparte; no funciona como un checkpoint TTS listo para usar en servidor.
- No incluye ninguna voz: la clonacion exige que el usuario aporte una grabacion sobre la que tenga derechos; el uso indebido de voces de terceros queda fuera del alcance del autor y puede tener implicaciones legales.
- Los parametros reales del repo (~78,7 M) no coinciden con la denominacion 0.6B del modelo base, lo que refleja componentes parciales y cuantizados; no debe citarse como un modelo de 0,6 B completo.
- Riesgo de alucinacion y artefactos de sintesis: no se documentan evaluaciones de calidad, naturalidad ni inteligibilidad; el troceado en ventanas y la cuantizacion Q4_0 del code predictor pueden degradar la fidelidad.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingue sin verificacion contra el modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribucion y revisarse la licencia del modelo base y de las dependencias (llama.cpp, LiteRT, ONNX Runtime).
- Dependencia de hardware concreto: el vocoder LiteRT se ha probado en Adreno 630; otros aceleradores pueden requerir ajustes, y los segmentos 0 y 2 exigen fp32 en GPU.
- Verificacion por sha256: si los ficheros se modifican o se sirven desde otro origen, la app rechazara la carga; hay que respetar los hashes compilados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni de latencia para justificar afirmaciones de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luweigen/qwen3-tts-0.6b-android
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Proyecto `read-android`: no disponible (mencionado en la model card sin URL)
- Herramienta `tools/make-voice.py`: no disponible (mencionada en la model card sin URL)
- llama.cpp: no disponible (referenciado como b12319 en la model card)
- LiteRT: no disponible (referenciado como version 2.3.2 en la model card)
- ONNX Runtime: no disponible (referenciado en la model card)
- Papers, blogs o demos adicionales: no disponible
