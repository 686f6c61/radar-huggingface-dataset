# Mustanad/whisper-base-ar-quran-onnx

## Resumen

whisper-base-ar-quran-onnx es una conversion a formato ONNX con cuantizacion dinamica de 8 bits del modelo tarteel-ai/whisper-base-ar-quran, un Whisper Base afinado por Tarteel para el reconocimiento de recitacion del Coran en arabe. El repositorio lo publica el usuario Mustanad y su objetivo es permitir la inferencia completamente en dispositivo (navegador o movil) mediante Transformers.js, sin enviar el audio a ningun servidor. No se han reentrenado los pesos: solo cambia el formato y la precision.

El modelo parte de openai/whisper-base (arquitectura transformer encoder-decoder, aproximadamente 74 millones de parametros) y hereda el ajuste fino de Tarteel sobre recitacion coranica. La conversion emplea `optimum-cli` con la tarea `automatic-speech-recognition-with-past` y cuantiza tanto el encoder como el decoder fusionado con `onnxruntime.quantization.quantize_dynamic` en modo QUInt8, incluyendo la opcion `EnableSubgraph` para cuantizar tambien los subgrafos del decoder.

Su relevancia actual reside en el tamano reducido del artefacto (unos 106 MB en total: 23 MB de encoder y 79 MB de decoder fusionado) y en el hecho de que se ejecuta con WebAssembly en el navegador, lo que lo hace adecuado para aplicaciones educativas o religiosas que requieren privacidad del audio y funcionamiento offline. El alcance es deliberadamente estrecho: solo arabe y solo recitacion, sin capacidades multilingues ni juicio de reglas de tajweed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Base) exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper Base ronda los 74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada en la ficha) |
| Tipos de cuantizacion | Cuantizacion dinamica de 8 bits (QUInt8) sobre encoder y decoder fusionado |
| Idiomas soportados | Arabe (ar); el modelo original no esta marcado como multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Base de OpenAI: un encoder que procesa espectrogramas Mel y un decoder autorregresivo que genera tokens de texto, con atencion estandar (no lineal ni hifida). Sobre esa base, Tarteel realizo un ajuste fino supervisado especifico para recitacion coranica en la lectura Hafs 'an 'Asim. Este repositorio no introduce cambios en los pesos ni en el entrenamiento: unicamente exporta el modelo a ONNX con soporte de cache (`with-past`) y aplica cuantizacion dinamica de 8 bits con `EnableSubgraph`, lo que reduce el decoder fusionado de unos 315 MB a 79 MB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica del repositorio es exclusivamente de despliegue: la cuantizacion del decoder fusionado con subgrafos incluidos y la compatibilidad con Transformers.js sobre WebAssembly con hilos, que permite latencias de aproximadamente 3 s para una aleya de 11 segundos en un iPhone 16 Pro Max y menos de 1 s en un portatil reciente.

## Capacidades

- Reconocimiento automatico de voz (ASR) de recitacion coranica en arabe, lectura Hafs 'an 'Asim.
- Transcripcion de audio mono a 16 kHz en formato Float32Array.
- Ejecucion totalmente en dispositivo: navegador (WebAssembly) o movil, sin envio de audio a servidores.
- Funcionamiento offline una vez descargado el modelo.
- Integracion con la libreria Transformers.js mediante `pipeline("automatic-speech-recognition", ...)`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo arabe y solo recitacion.
- No evalua vocales, makharij ni reglas de tajweed; solo reconoce palabras.

## Casos de uso

- Aplicacion movil de seguimiento de recitacion: el modelo transcribe la recitacion del usuario en el propio dispositivo y permite compararla con el texto esperado, sin subir audio a la nube, lo que preserva la privacidad en un contexto religioso.
- Herramienta web educativa para memorizacion del Coran: integrada con Transformers.js en el navegador, detecta la aleya recitada y la resalta en el texto, con latencias inferiores a 1 s en portatiles recientes.
- Verificacion de recitacion en entornos sin conectividad: escuelas, mezquitas o retiros donde no hay red pueden usar el modelo offline tras la descarga inicial de 106 MB.
- Indexacion y busqueda de audio coranico: transcripcion por aleyas de grabaciones para generar metadatos y permitir busqueda textual dentro de archivos de audio.
- Asistencia a personas con dificultades de lectura: transcripcion en tiempo real de la recitacion de un instructor para mostrarla en pantalla, con procesamiento local que evita cuotas de API.
- Prototipado rapido de aplicaciones ASR especializadas: al estar en ONNX y ser compatible con Transformers.js, sirve como base para experimentos de reconocimiento de recitacion sin infraestructura de GPU.
- Control de calidad de grabaciones: transcripcion de fragmentos cortos para detectar omisiones o errores de palabras en producciones de audio coranico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta medidas de latencia empiricas: aproximadamente 3 s para una aleya de 11 s en un iPhone 16 Pro Max y menos de 1 s en un portatil reciente, ejecutando sobre WebAssembly con hilos en una pagina con aislamiento de origen cruzado (cross-origin isolated).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal (CPU/navegador); en GPU, el artefacto cuantizado ocupa unos 106 MB en disco y una huella de memoria del mismo orden.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU via WebAssembly y para moviles.
- Cabe en cualquier dispositivo consumer: el paquete completo son 106 MB (encoder 23 MB, decoder 79 MB), por lo que funciona en navegadores de escritorio, portatiles y telefonos modernos.
- Opciones de despliegue: Transformers.js con `dtype: "q8"` y `device: "wasm"`; tambien puede ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta en la ficha.
- Advertencia de despliegue: en WebGPU el modelo de 8 bits produce salidas incorrectas; debe usarse WebAssembly.
- Latencia: aproximadamente 3 s por 11 s de audio en iPhone 16 Pro Max y menos de 1 s en portatil reciente, con hilos de WebAssembly habilitados.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mustanad/whisper-base-ar-quran-onnx | no disponible (base Whisper Base) | no disponible | Arabe | Apache-2.0 | ONNX q8 | En dispositivo, Transformers.js |
| tarteel-ai/whisper-base-ar-quran | no disponible (base Whisper Base) | no disponible | Arabe | Apache-2.0 | safetensors/PyTorch | Modelo original sin cuantizar |
| openai/whisper-base | no disponible (aprox. 74 M) | no disponible | Multilingue | Apache-2.0 | PyTorch | Modelo general, sin ajuste coranico |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha probado con recitacion en la lectura Hafs 'an 'Asim; otras lecturas no estan validadas.
- El modelo reconoce palabras pero no evalua vocales, makharij ni tajweed, por lo que no sirve como corrector de recitacion a ese nivel.
- Como todos los modelos Whisper, puede anadir palabras propias al final de grabaciones largas; se recomienda transcribir fragmentos cortos (una aleya o hasta una pausa).
- El rendimiento depende de la calidad del audio: recitacion clara en una sala silenciosa da los mejores resultados.
- En WebGPU la version de 8 bits produce salidas incorrectas; es obligatorio usar WebAssembly.
- No es multilingue y no debe usarse para arabe general ni para otras lenguas.
- No dispone de tool calling, agentes ni razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio no esta afiliado a Tarteel ni a OpenAI y no ofrece garantias.
- No se documentan sesgos especificos mas alla de la limitacion a una lectura y a la calidad de audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mustanad/whisper-base-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-base
- Transformers.js: https://github.com/huggingface/transformers.js
