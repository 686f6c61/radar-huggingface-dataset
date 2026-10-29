# kickvn/omniASR-CTC-7B-v2-fp16-KICK-MLX

## Resumen

omniASR-CTC-7B-v2-fp16-KICK-MLX es una conversion al formato MLX (fp16) del modelo CTC `omniASR_CTC_7B_v2` de Meta, perteneciente a la familia Omnilingual ASR. La conversion la firma el usuario kickvn y deriva directamente del repositorio ONNX `kickvn/omniASR-CTC-7B-v2-ONNX`, con los mismos pesos y el vocabulario de caracteres completo. Se publica como pesos `safetensors` acompanados de configuracion y vocabulario, empaquetados en un ZIP dentro del repositorio.

El modelo resuelve dos tareas: reconocimiento automatico del habla con cabecera CTC y alineamiento forzado (forced alignment) a nivel de caracter. Su uso declarado es como alineador de letras de canciones dentro de KICK Studio sobre Macs con Apple Silicon, ejecutando en GPU mediante MLX. La ventaja frente a Core ML que declara el autor es que MLX carga los pesos de una vez, sin paso de compilacion en el primer arranque.

Arquitectonicamente es un wav2vec2 de 128 capas, dimension 2048 y 16 cabezas de atencion, con front end convolucional y vocabulario de 10288 simbolos. La licencia es Apache 2.0, heredada del modelo original de Meta. El repositorio tiene 12,0 GB y, en el momento de la consulta, cero descargas y cero likes, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabecera CTC: 128 capas, dimension 2048, 16 cabezas, front end convolucional |
| Parametros totales | aproximadamente 7B (segun la denominacion del modelo; la model card no da el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 544.000 muestras, equivalentes a 34 s a 16 kHz; el contexto en tokens no aplica |
| Tipos de cuantizacion | fp16 en los pesos; fp32 en el extractor de caracteristicas, LayerNorm y cabecera CTC; no se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (el modelo base se presenta como omnilingual, pero no se enumera ningun idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para MLX, dentro de `omniASR-CTC-7B-v2-fp16-kick-mlx.zip` |
| Vocabulario | 10288 simbolos (`vocab.json`) |
| Entrada | waveform float32, 16 kHz, mono, normalizada (media 0, varianza 1), en ventanas de 544.000 muestras |
| Salida | logits float32 de forma `[frames, 10288]`, un frame cada 20 ms |
| Ajustes CTC | `normalize: true`, `blank: 0` (`profile.json`) |
| Tamano del repositorio | 12,0 GB |
| Libreria | mlx |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2 para reconocimiento de habla: un extractor convolucional que convierte la onda de audio en una secuencia de representaciones latentes y un codificador transformer de 128 capas con dimension oculta 2048 y 16 cabezas de atencion. Sobre el codificador se situa una cabecera CTC lineal que proyecta a un vocabulario de 10288 simbolos, lo que permite emitir etiquetas a nivel de caracter sin necesidad de un decodificador autorregresivo. El frame rate de salida es de 50 Hz (un frame cada 20 ms), lo que da una resolucion temporal suficiente para alineamiento de letras.

La model card no aporta informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni el procedimiento de ajuste. Tampoco detalla innovaciones tecnicas del modelo original de Meta mas alla de la propia familia Omnilingual ASR. Lo unico documentado en este repositorio es el proceso de conversion: se conservan los pesos originales y se mantienen en fp32 el extractor de caracteristicas, las LayerNorm y la cabecera CTC, mientras que el resto del codificador se guarda en fp16, replicando exactamente la mezcla de precisiones del modelo ONNX del mismo autor.

## Capacidades

- Reconocimiento automatico del habla con salida a nivel de caracter mediante decodificacion CTC (argmax o beam search sobre los logits).
- Alineamiento forzado de una transcripcion conocida contra el audio, con marcas temporales por caracter con resolucion de 20 ms.
- Alineamiento de letras de canciones, uso declarado del modelo en KICK Studio.
- Manejo de un vocabulario amplio de 10288 simbolos, lo que sugiere cobertura de alfabetos y caracteres diversos, aunque la lista concreta de idiomas no esta documentada.
- Procesamiento por ventanas de 34 s, adecuado para segmentos musicales o de habla de duracion media.
- Ejecucion en GPU de Apple Silicon mediante MLX, sin paso de compilacion inicial.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla de la onda, ni modo "thinking". Es un modelo puramente acustico.

## Casos de uso

- Alineacion de letras de canciones: el caso declarado por el autor. Se pasa la onda normalizada a 16 kHz en ventanas de 544.000 muestras junto con la transcripcion y se obtienen marcas temporales por caracter, utiles para karaoke, visualizadores sincronizados o edicion de video musical.
- Generacion de subtitulos con timestamps precisos: la salida CTC a 50 Hz permite derivar cortes por palabra o por caracter sin necesidad de un segundo modelo de alineamiento, lo que simplifica el pipeline.
- Transcripcion ASR en produccion sobre Mac: al ejecutarse en MLX sobre GPU de Apple Silicon, encaja en flujos de postproduccion o herramientas de escritorio que ya corren en macOS sin depender de CUDA.
- Creacion de corpus para entrenamiento de TTS: el alineamiento forzado proporciona duraciones por fonema o caracter necesarias para modelos de sintesis y para el ajuste de duraciones en datasets de voz.
- Etiquetado y curacion de datasets de audio: permite verificar automaticamente si una transcripcion existente se corresponde con el audio y localizar desajustes por segmentos.
- Investigacion en fonetica y prosodia: la resolucion de 20 ms por frame y la salida por caracter facilitan el analisis de duraciones, pausas y solapamientos en corpus de habla.
- Sincronizacion de audiolibros o podcasts: alineamiento de texto y audio para funciones de "seguir la lectura" en reproductores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, tasas de alineamiento correcto, comparaciones con otros sistemas ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos en fp16 de un modelo de aproximadamente 7B ocupan en torno a 14 GB; el ZIP del repositorio son 12,0 GB. Hay que sumar activaciones, que con 128 capas y secuencias de hasta 1700 frames no son despreciables. Como referencia practica, se recomienda memoria unificada de 24-32 GB o superior.
- GPU compatibles: exclusivamente Apple Silicon mediante MLX (series M1, M2, M3 y M4 en variantes Pro, Max y Ultra). El repositorio no incluye pesos para CUDA ni ROCm.
- Cabe en GPU consumer: no en tarjetas de 8-12 GB. En una RTX 4090 de 24 GB los pesos cabrian, pero MLX no soporta CUDA, por lo que habria que recurrir a la version ONNX o a los pesos originales en PyTorch.
- Opciones de despliegue: MLX sobre macOS para esta version; ONNX Runtime a partir de `kickvn/omniASR-CTC-7B-v2-ONNX` para Linux y Windows; los pesos originales de `facebook/omniASR-CTC-7B` para frameworks de PyTorch. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y en la practica esos motores estan orientados a modelos de lenguaje, no a wav2vec2 CTC.
- Latencia y throughput: no disponibles. La model card solo indica que MLX carga los pesos de una vez y evita el paso de compilacion inicial de Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de entrada | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| kickvn/omniASR-CTC-7B-v2-fp16-KICK-MLX | ~7B | 544.000 muestras (34 s a 16 kHz) | safetensors + MLX | apache-2.0 | Conversion comunitaria, solo Apple Silicon, 0 descargas |
| facebook/omniASR-CTC-7B | ~7B | no disponible en la informacion proporcionada | pesos originales de Meta (formato no verificado) | apache-2.0 | Modelo base; el repositorio analizado deriva de la variante v2 |
| kickvn/omniASR-CTC-7B-v2-ONNX | ~7B | misma ventana de 544.000 muestras | ONNX | apache-2.0 | Mismos pesos que esta ficha; portable a Linux y Windows |
| Whisper large-v3 (referencia externa) | ~1550M | 30 s | PyTorch, CTranslate2, GGML | MIT | Modelo encoder-decoder con 99 idiomas declarados; no es CTC y no hace alineamiento forzado nativo. Datos de conocimiento general, no verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es una publicacion oficial de Meta: es una conversion de un tercero, sin validacion comunitaria (0 descargas, 0 likes) y con la model card como unica documentacion.
- La model card no enumera idiomas soportados ni proporciona metricas de calidad, por lo que el rendimiento real por idioma es desconocido.
- El calculo de errores y la fiabilidad del alineamiento forzado no estan medidos publicamente para esta conversion; conviene validar con un conjunto propio antes de usarla en produccion.
- La ventana de 34 s obliga a segmentar audio largo y a gestionar las fronteras entre ventanas, lo que puede introducir desalineaciones en los cortes.
- La precision fp16 en el codificador puede degradar ligeramente la estabilidad numerica de los logits frente al modelo original; el autor conserva en fp32 el extractor, las LayerNorm y la cabecera CTC precisamente para mitigarlo.
- El repositorio entrega los pesos dentro de un ZIP, lo que anade un paso manual de extraccion y complica la carga directa desde `from_pretrained`.
- Dependencia total del ecosistema MLX y de macOS sobre Apple Silicon; no hay ruta de despliegue en servidores Linux con GPU NVIDIA dentro de este repositorio.
- No es un modelo generativo: no produce texto libre, no razona y no puede usarse para tareas de comprension o dialogo. Toda trascripcion requiere un paso de decodificacion CTC externo.
- La licencia Apache 2.0 permite uso comercial, pero obliga a conservar los ficheros `LICENSE` y `NOTICE` con la atribucion a Meta Platforms, Inc. y a KICK por la conversion.
- Los resultados de la busqueda web realizada no contenian informacion tecnica relevante sobre el modelo (devolvio contenido no relacionado), por lo que no se ha podido contrastar ningun dato externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kickvn/omniASR-CTC-7B-v2-fp16-KICK-MLX
- Modelo base: https://huggingface.co/facebook/omniASR-CTC-7B
- Conversion ONNX del mismo autor: https://huggingface.co/kickvn/omniASR-CTC-7B-v2-ONNX
- Repositorio de MLX (framework de ejecucion): https://github.com/ml-explore/mlx
- La busqueda web realizada no devolvio papers, blogs ni demos relevantes sobre este modelo.
