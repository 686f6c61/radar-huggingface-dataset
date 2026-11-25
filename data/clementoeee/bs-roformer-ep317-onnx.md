# clementoeee/bs-roformer-ep317-onnx

## Resumen

BS-RoFormer ep317 ONNX es una exportación del modelo de separación de fuentes musicales BS-RoFormer, concretamente el checkpoint `model_bs_roformer_ep_317_sdr_12.9755` entrenado por ViperX. Su tarea es separar la pista de voz del resto de una canción (lo que se conoce como *vocal separation* o *stem splitting*). El modelo original se basa en la arquitectura Band-Split RoPE Transformer descrita por Lu et al. en el artículo "Music Source Separation with Band-Split RoPE Transformer" (arXiv:2309.02612), e implementada en la librería `lucidrains/BS-RoFormer`.

Esta versión concreta, publicada por el usuario clementoeee, no reentrena ni modifica los pesos: parte de la exportación ONNX de xycld (`xycld/BS-RoFormer-ONNX`) y aplica dos cambios en el grafo para que onnxruntime pueda cargarla y ejecutarla en el *execution provider* WebGPU. El primero es internalizar los pesos que estaban en un fichero `.onnx.data` externo, ya que onnxruntime no puede leer los tamaños del *band split* desde datos externos. El segundo es sustituir un nodo `Split` de 62 salidas por 62 nodos `Slice`, porque WebGPU limita a 16 *storage buffers* por shader.

El resultado es un único fichero ONNX de unos 645 MB (0,6 GB de repositorio) pensado para inferencia en navegador o en Node.js mediante onnxruntime-node, con un consumo de memoria y un grafo compatibles con WebGPU. Es relevante para quien quiera integrar separación de voz en aplicaciones web o de escritorio sin depender de PyTorch ni de CUDA, a costa de procesar el audio por segmentos de 8 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-Split RoPE Transformer (BS-RoFormer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 8 s (352.800 muestras a 44,1 kHz, 801 frames) |
| Tipos de cuantizacion | no disponible (el autor indica que el modelo base es una version "quantized" de xycld/BS-RoFormer-ONNX, sin detallar el esquema) |
| Idiomas soportados | no aplica (audio); no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero unico `bs_roformer_ep317.onnx`, 644.725.043 bytes, SHA-256 `f478ec00943d1ea9c03af66bbf4f94d2e05dff28ba1348ec46836e7d05de8d53`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BS-RoFormer, un transformer que opera sobre representaciones espectrales divididas en bandas de frecuencia (*band-split*) y utiliza codificaciones posicionales rotatorias (RoPE) para modelar la estructura tiempo-frecuencia. La entrada es un tensor `[1, 801, 4100]` que codifica, para cada frame, los bins de frecuencia 0 a 1024 con sus componentes real e imaginaria y los dos canales estéreo, según el índice `bin*4 + channel*2 + (0 re, 1 im)`. La salida es una máscara compleja `[1, 1, 2050, 801, 2]`. El STFT asociado usa `n_fft` 2048, hop 441 y ventana Hann periódica de 2048 muestras, sin normalizar, centrada con *padding* reflectivo y en estéreo.

Los pesos provienen del checkpoint `model_bs_roformer_ep_317_sdr_12.9755.ckpt` entrenado por ViperX y distribuido en las releases de `TRvlvr/model_repo`; la configuración de entrenamiento está publicada en `ZFTurbo/Music-Source-Separation-Training`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; sí se menciona que los datos de entrenamiento incluyen MUSDB18-HQ. La innovación técnica de esta ficha no está en el entrenamiento, sino en el proceso de exportación: internalización de pesos y sustitución del `Split` de 62 bandas por 62 `Slice` para cumplir el límite de *storage buffers* de WebGPU. El script `convert.py` es determinista y produce los mismos bytes en cada ejecución, sin alterar el cómputo.

## Capacidades

- Separación de la pista de voz (vocals) del resto de una mezcla musical estéreo a 44,1 kHz.
- Obtención del instrumental por resta de la voz estimada respecto a la mezcla original.
- Procesamiento por segmentos de 8 segundos con solapamiento, siguiendo el esquema `demix()` de Music-Source-Separation-Training (`num_overlap: 2`, un segmento cada 4 s, *fade* de 0,8 s en cada extremo y *padding* reflectivo en los bordes de la canción).
- Ejecución en onnxruntime con *execution provider* WebGPU (validado en onnxruntime-node 1.31.1 sobre una AMD Radeon RX 9070 XT en Windows).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto; es un modelo puramente audio-a-audio.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

- **Karaoke y eliminación de voz en aplicaciones web**: el modelo está pensado para ejecutarse en WebGPU desde el navegador, de modo que una aplicación de karaoke puede generar la pista instrumental en el cliente sin enviar el audio a un servidor. El motor de karaoke de Ondalys ya lo usa a través de onnxruntime-node.
- **Edición musical y remezclas**: productores que necesitan aislar la voz para samplearla, reajustarla o crear versiones instrumentales pueden integrar el modelo en un DAW o en un pipeline de preproducción, procesando la canción por segmentos de 8 s con solapamiento.
- **Preprocesado para transcripción y análisis de letras**: separar la voz antes de pasarla a un sistema de reconocimiento de voz o de alineación de letras mejora la relación señal-ruido del habla frente a la música de fondo.
- **Herramientas de accesibilidad y audiodescripción**: generar versiones instrumentales para entornos donde la voz molesta (por ejemplo, música de fondo en vídeos explicativos) sin depender de servicios en la nube.
- **Aplicaciones de escritorio con Node.js**: al cargarse con onnxruntime-node como un único fichero ONNX, encaja en aplicaciones Electron o servicios Node que necesiten separación de voz sin instalar PyTorch ni CUDA.
- **Investigación y evaluación de separación de fuentes**: sirve como referencia reproducible (exportación determinista, con SHA-256 publicado) para comparar resultados de separación en entornos WebGPU frente a implementaciones en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (SDR sobre MUSDB18, etc.) en la información disponible. El autor sí documenta comprobaciones cualitativas y de fidelidad de la exportación:

| Prueba | Resultado | Entorno |
|---|---|---|
| Fidelidad de la máscara WebGPU frente al procesador en un segmento | 113 dB SNR | onnxruntime-node 1.31.1, Windows, AMD Radeon RX 9070 XT |
| SDR de la voz en una canción sintética con voz conocida (habla sobre tonos y ruido) | 23,3 dB SDR | mismo entorno |
| DirectML en la misma tarjeta frente al procesador | −3 dB SNR (máscara incorrecta) | mismo entorno |

El nombre del checkpoint original (`sdr_12.9755`) sugiere un SDR de validación de 12,9755 dB en el conjunto de evaluación del entrenamiento, pero no se aporta la métrica ni el conjunto exacto en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El fichero ONNX pesa unos 645 MB, por lo que la carga de pesos en memoria ronda esa cifra más las activaciones del grafo; en la práctica conviene reservar al menos 2-3 GB de memoria de GPU para trabajar con holgura, aunque el dato exacto no está publicado.
- **GPU recomendadas**: el autor valida el modelo en una AMD Radeon RX 9070 XT. Al ejecutarse sobre WebGPU, es compatible con GPUs que expongan dicho *backend* en el navegador o en onnxruntime-node; no se detallan modelos NVIDIA o Apple concretos.
- **Consumer GPU**: sí, por tamaño (0,6 GB de pesos) cabe en GPUs de consumo actuales; el autor lo ejecuta en una RX 9070 XT. No se confirma compatibilidad con GPUs de gama baja ni con iGPU.
- **Opciones de despliegue**: onnxruntime con *execution provider* WebGPU (navegador o onnxruntime-node). El autor advierte explícitamente de que DirectML devuelve una máscara incorrecta y recomienda WebGPU o el *provider* de CPU (procesador).
- **Latencia y throughput**: no disponibles. El grafo procesa segmentos de 8 s con solapamiento del 50 % (un segmento cada 4 s), lo que implica al menos dos pasadas por cada 8 s de audio para el esquema `demix()`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Formato / runtime | Licencia | Contexto / segmento |
|---|---|---|---|---|---|
| BS-RoFormer ep317 ONNX (este) | BS-RoFormer | Separación de voz | ONNX, WebGPU | MIT | Segmentos de 8 s |
| xycld/BS-RoFormer-ONNX | BS-RoFormer | Separación de voz | ONNX (con `.onnx.data` externo) | MIT | Segmentos de 8 s |
| Checkpoint original `model_bs_roformer_ep_317_sdr_12.9755.ckpt` | BS-RoFormer | Separación de voz | PyTorch (`.ckpt`) | Según TRvlvr/model_repo | Segmentos de 8 s |
| Demucs (referencia de la categoría) | Híbrido transformer/CNN | Separación multitaller | PyTorch | MIT | No disponible en la información |

La comparativa se limita a las variantes del mismo modelo y a Demucs como referencia genérica de la categoría; no se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- **Licencia y datos de entrenamiento**: los pesos se distribuyen con licencia MIT según la exportación de xycld, pero el entrenamiento incluye MUSDB18-HQ, cuyos términos son de uso exclusivamente investigador. Antes de un uso comercial hay que verificar las condiciones de MUSDB18-HQ y del repositorio original de ViperX.
- **Compatibilidad de *backend***: DirectML produce una máscara incorrecta (−3 dB SNR frente al procesador). Solo se recomienda WebGPU o el *provider* de CPU.
- **Procesamiento por segmentos**: el modelo no procesa la canción completa de una vez; hay que aplicar el esquema `demix()` con solapamiento y *fade* para evitar artefactos en las uniones. Un uso incorrecto del solapamiento degrada la calidad.
- **Formato de entrada muy específico**: el tensor de entrada exige el STFT con parámetros concretos (`n_fft` 2048, hop 441, ventana Hann periódica, sin normalizar, *padding* reflectivo, estéreo). Cualquier desviación en el preprocesado invalida la máscara.
- **Alcance limitado**: solo separa voz del resto; no separa batería, bajo u otros talleres. Para separación multitaller hay que usar otros modelos.
- **Riesgo de artefactos y alucinación espectral**: en pasajes con coros densos, instrumentos con contenido en el rango vocal o voces muy procesadas, la máscara puede filtrar parte del instrumental a la pista de voz o viceversa. No hay métricas publicadas de robustez fuera del conjunto de entrenamiento.
- **Sesgos**: no se documentan sesgos por género, idioma o estilo musical, pero al entrenarse con MUSDB18-HQ (mayoritariamente música occidental) el rendimiento puede degradarse en repertorios no representados.
- **Madurez**: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta; conviene validar el modelo en el caso de uso concreto antes de llevarlo a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/clementoeee/bs-roformer-ep317-onnx
- Exportación base: https://huggingface.co/xycld/BS-RoFormer-ONNX
- Artículo: Lu et al., "Music Source Separation with Band-Split RoPE Transformer": https://arxiv.org/abs/2309.02612
- Implementación de referencia: https://github.com/lucidrains/BS-RoFormer
- Pesos originales (ViperX): https://github.com/TRvlvr/model_repo/releases
- Configuración del checkpoint: https://github.com/ZFTurbo/Music-Source-Separation-Training/blob/main/configs/viperx/model_bs_roformer_ep_317_sdr_12.9755.yaml
- Herramienta de exportación ONNX: https://github.com/ZFTurbo/MSS_ONNX_TensorRT
