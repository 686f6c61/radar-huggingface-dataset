# followcat/m5-tts-canto

## Resumen

M5-TTS Cantonese voice (ONNX) es un empaquetado de voz fija en cantonés (yue) del modelo de síntesis de voz M5-TTS-50M-ONNX desarrollado por ASLP-lab. Lo publica el usuario followcat como componente del lector en voz alta de su aplicación wherdr, y su objetivo es permitir síntesis de voz completamente en el dispositivo, sin servidor ni nube, dentro del navegador. El modelo original es un sistema multilingüe de clonación de voz zero-shot; esta variante sacrifica la maquinaria de clonación a cambio de una única voz predefinida y un paquete mucho más ligero.

El paquete pesa aproximadamente 561 MB, frente a los aproximadamente 1,1 GB de la configuración equivalente en fp32 del modelo upstream con una sola voz. La reducción se consigue almacenando los pesos de la matriz del backbone en int8 por canal con desquantización fp32 dentro del grafo, el decodificador del códec en fp16 con cómputo fp32, el modelo de profundidad en int8 y los embeddings de texto en fp16. No se usa aritmética entera en ningún punto: todos los grafos calculan en fp32 y se ejecutan sobre ONNX Runtime estándar, incluido onnxruntime-web con wasm y WebGPU.

La relevancia actual del paquete radica en que demuestra un caso realista de TTS neuronal en el navegador: se ha validado de extremo a extremo en Chromium con síntesis correcta de cantonés para texto de entrada en caracteres tradicionales, y se ha medido un factor de tiempo real (RTF) de aproximadamente 1,0 en serie y 0,7 con solapamiento en un teléfono insignia de 2024 con Snapdragon 8 Elite. La licencia es Apache-2.0, igual que la del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (backbone) con modelo de profundidad y decodificador de códec en streaming; empaquetado ONNX |
| Parametros totales | no disponible (el repo ocupa 0,6 GB; el modelo upstream se denomina M5-TTS-50M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos int8 por canal con desquantizacion fp32 en grafo (backbone, depth model); pesos fp16 con computo fp32 (codec decoder, text embeddings); estado y prefijos en fp32 |
| Idiomas soportados | Cantonés (yue); condicionamiento fijo `lang=Chinese, accent=yue` |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`backbone.onnx`, `depth_frame.int8.onnx`, `codec_decoder_cached.onnx`), tabla de embeddings fp16 cruda (`text_embeddings.f16`), tokenizer HF (`tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de M5-TTS, un sistema de síntesis de voz neuronal que combina un transformer autorregresivo (backbone) que genera tokens de códec, un modelo de profundidad que produce un frame por paso y un decodificador de códec en streaming que reconstruye la forma de onda. En este empaquetado, los tres grafos se han exportado a ONNX y optimizado para ejecución en el navegador: el backbone almacena sus pesos de matmul en int8 por canal y los desquantiza a fp32 dentro del grafo, el decodificador del códec almacena pesos en fp16 pero computa en fp32, y el modelo de profundidad usa almacenamiento int8. La variante de códec sin caché y el codificador de clonación de voz del modelo original no se incluyen.

El entrenamiento subyacente corresponde al modelo upstream ASLP-lab/M5-TTS-50M-ONNX, que es multilingüe y de clonación zero-shot; no se dispone de detalles sobre el número de tokens, la composición del dataset ni las etapas de RLHF o DPO en la información proporcionada. La innovación técnica de este paquete es el prebakeado de la voz: los embeddings de prefijo (`prefix_emb.f32`), los tokens de códec del prompt (`prompt_codes.u16`) y el estado de streaming del códec tras el prompt (`codec_past.f32`, `codec_conv.f32`) se fijan en disco, de modo que la inferencia arranca directamente con la voz cantonesa predefinida. La voz fue donada por el autor del paquete, hablante nativo de cantonés de Hong Kong, y se libera bajo los mismos términos Apache-2.0. El front-end de texto encadena la conversión OpenCC y una tabla de homófonos para caracteres raros del cantonés.

## Capacidades

- Síntesis de voz (text-to-speech) en cantonés a partir de texto de entrada en caracteres tradicionales.
- Voz fija predefinida de hablante nativo de Hong Kong; no soporta clonación de voz ni selección de hablante.
- Ejecución completamente local en el navegador mediante onnxruntime-web (wasm con hilos y WebGPU con fallback a wasm).
- Procesamiento de texto con conversión OpenCC y tabla de homófonos para caracteres raros del cantonés.
- Streaming del decodificador de códec, con estado de KV y convolución precalculado tras el prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura en voz alta en aplicaciones web: integración como voz `m5-canto` en el lector de wherdr, sintetizando texto en cantonés directamente en el teléfono o portátil del usuario sin enviar datos a un servidor.
- Accesibilidad en navegador: proporcionar lectura de contenido web en cantonés a usuarios con discapacidad visual o dificultades de lectura, con la ventaja de que el procesamiento es local y no requiere conexión.
- Aplicaciones offline o con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, el texto del usuario nunca sale del navegador, lo que encaja en escenarios sanitarios, educativos o corporativos con datos sensibles.
- Aprendizaje de cantonés: reproducción de pronunciación de texto tradicional para estudiantes, con la conversión OpenCC y la tabla de homófonos facilitando la lectura de caracteres poco frecuentes.
- Prototipado de TTS en el navegador: servir de referencia para desarrolladores que quieran evaluar ONNX Runtime Web con WebGPU en cargas de trabajo de audio, ya que el paquete incluye todos los grafos y el contrato de voz (`voice_meta.json`).
- Integración en extensiones o PWA: al no depender de servidor, puede incorporarse en aplicaciones web progresivas o extensiones de navegador que necesiten síntesis de voz cantonesa con una descarga de unos 561 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una medición de latencia: en un teléfono insignia de 2024 (clase Snapdragon 8 Elite), la ejecución híbrida wasm/WebGPU alcanza aproximadamente tiempo real, con RTF ≈ 1,0 en serie y ≈ 0,7 con solapamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete completo ocupa unos 561 MB en disco y debe cargarse en memoria, con el decodificador del códec (228 MB) y el modelo de profundidad (148 MB) como componentes principales.
- GPU recomendadas: no se especifican modelos concretos; el autor valida WebGPU en Chromium y menciona un Snapdragon 8 Elite como referencia móvil.
- Compatibilidad con GPU de consumo: el diseño apunta a ejecución en navegador sobre hardware móvil y portátil; no se detallan requisitos mínimos de GPU de escritorio.
- Opciones de despliegue: onnxruntime-web (wasm con hilos y WebGPU con fallback a wasm) en el navegador; el Web Worker de referencia es `m5-tts-worker.js` en el repositorio wherdr.
- Latencia y throughput: RTF ≈ 1,0 en serie y ≈ 0,7 con solapamiento en un Snapdragon 8 Elite; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| followcat/m5-tts-canto | no disponible (repo 0,6 GB) | no disponible | Cantonés (yue) | Apache-2.0 | ONNX | Voz fija, navegador, WebGPU |
| ASLP-lab/M5-TTS-50M-ONNX | 50M (según nombre) | no disponible | Multilingüe | Apache-2.0 | ONNX | Clonación zero-shot, ~1,1 GB en configuración fp32 de una voz |
| M5-TTS (upstream completo) | no disponible | no disponible | Multilingüe | no disponible en la información | no disponible | Incluye codificador de clonación y códec sin caché |

## Limitaciones y advertencias

- Voz única: no permite clonación ni cambio de hablante; cualquier necesidad de varias voces requiere otro empaquetado o el modelo upstream.
- Idioma restringido a cantonés con condicionamiento fijo `lang=Chinese, accent=yue`; no se documenta soporte de otros idiomas o acentos.
- El front-end de texto depende de OpenCC y de una tabla de homófonos para caracteres raros; textos con caracteres no cubiertos pueden producir pronunciaciones incorrectas.
- Riesgo de alucinación y artefactos propio de los modelos TTS autorregresivos; no se documentan evaluaciones de calidad subjetiva (MOS) ni de robustez.
- Solo se ha validado en Chromium según el autor; el comportamiento en otros navegadores o versiones de onnxruntime-web no está documentado.
- El rendimiento medido corresponde a un único dispositivo de referencia (Snapdragon 8 Elite); en hardware inferior el RTF puede superar 1,0 y dejar de ser tiempo real.
- La licencia Apache-2.0 permite uso comercial, pero exige atribución a ASLP-lab por M5-TTS y el cumplimiento de los términos de las obras derivadas.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que no hay evidencia de uso en producción más allá de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/followcat/m5-tts-canto
- Modelo upstream: https://huggingface.co/ASLP-lab/M5-TTS-50M-ONNX
- Repositorio de la aplicación consumidora (wherdr): https://github.com/followcat/wherdr
