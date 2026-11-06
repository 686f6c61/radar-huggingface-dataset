# Lightricks/LTX-2-Marking

## Resumen

LTX-2-Marking es un paquete de pesos publicado por Lightricks que contiene los modelos de marcado invisible (*watermarking*) utilizados de forma opcional por la pipeline de generación de vídeo LTX-2. No es un modelo generativo: agrupa dos sistemas de marcado post-hoc, PixelSeal (familia VideoSeal) para fotogramas de vídeo y AudioSeal para PCM estéreo, ambos desarrollados originalmente por Meta Platforms y redistribuidos aquí con sus configuraciones. El repositorio incluye únicamente los pesos y los ficheros YAML de configuración; el código que los carga, inserta y detecta reside en el repositorio público de LTX-2.

El paquete resuelve un problema de trazabilidad y procedencia: permite incrustar una señal robusta e imperceptible en los vídeos generados (y en el audio asociado) para poder verificar a posteriori que un clip fue producido por una pipeline LTX-2 con el marcado activado. La carga útil del marcador de vídeo es de 256 bits y el procesamiento se realiza a 256×256 píxeles por fotograma muestreado.

Es relevante ahora porque la transparencia sobre contenido sintético es un requisito creciente en despliegues de generación de vídeo, y este paquete ofrece una vía lista para producción (con detector incluido) sin necesidad de reentrenar nada. El tamaño del repositorio es de 0,4 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PixelSeal (familia VideoSeal) para vídeo y AudioSeal para audio; redes de *embedder* y *extractor/detector* |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa fotogramas de 256×256 px y señal de audio a 24/48 kHz) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pth` sin cuantizar) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (pickles) más ficheros YAML de configuración |

## Arquitectura y entrenamiento

El paquete no entrena nada nuevo: empaqueta checkpoints públicos de Meta. `pixelseal.pth` es el checkpoint público de PixelSeal del repositorio `facebookresearch/videoseal`, repackado para conservar únicamente el *state dict* del modelo (se eliminaron optimizador, discriminador, EMA y scheduler; los tensores del modelo no se modificaron). `pixelseal.yaml` es la *model card* de PixelSeal del commit `870ca7f` e incluye la arquitectura, la carga útil de 256 bits y el tamaño de procesamiento de 256 px. `videoseal_attenuation.yaml` es la entrada `jnd_1_1` de `configs/attenuation.yaml`, un mapa de atenuación basado en el umbral de diferencia apenas perceptible (JND) que el paquete pip no distribuye.

Para audio, `audioseal_generator.pth` y `audioseal_detector.pth` son los modelos base de 16 bits sin modificar de `facebook/audioseal`. La innovación técnica del conjunto es la combinación de marcado invisible robusto en píxeles con atenuación perceptual JND, junto con un detector que decide mediante un test binomial sobre los bits decodificados frente a la carga útil fija definida en el código de LTX-2.

## Capacidades

- Inserción de marca de agua invisible en fotogramas de vídeo mediante PixelSeal, con carga útil de 256 bits.
- Inserción de marca de agua en audio PCM estéreo mediante AudioSeal (generador de 16 bits).
- Detección de marca en vídeo: se redimensiona cada octavo fotograma decodificado a 256×256, se pasa por el extractor y se promedian los logits de bits sobre los fotogramas muestreados; se considera detectada si `log10(p_value) < -6`.
- Detección de marca en audio: se escanea la pista completa tratando cada canal estéreo como señal mono independiente; se considera detectada si al menos la mitad de las muestras superan probabilidad 0,5.
- Salida estructurada de detección: `MarkDetectResult(detected, bit_accuracy, p_value, payload)`.
- Ejecución en CPU o GPU, con soporte de CUDA.
- Integración en las CLI de generación y edición de vídeo, HDR IC-LoRA y texto-a-audio de LTX-2 mediante el flag `--marker-root-path`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Trazabilidad de contenido sintético en producción: activar `--marker-root-path` en la pipeline LTX-2 para que cada vídeo generado salga con una marca PixelSeal incrustada, permitiendo verificar después su origen con `detect_video_mark`.
- Moderación y verificación de plataformas: ejecutar el detector sobre clips subidos para comprobar si fueron generados por LTX-2 con marcado, usando `bit_accuracy` y `p_value` como señales cuantitativas de confianza.
- Atribución de audio generado: marcar pistas de texto-a-audio con AudioSeal y auditar después la procedencia del audio escaneando la pista completa canal a canal.
- Auditoría de pipelines de edición de vídeo: marcar las salidas de las CLI de edición y HDR IC-LoRA (en HDR se omite el marcado de vídeo pero se marca el audio) para mantener la cadena de procedencia en flujos de postproducción.
- Cumplimiento normativo de transparencia: incorporar el marcado como paso obligatorio en un pipeline interno de generación y conservar los resultados de detección como evidencia documental.
- Investigación en *watermarking*: usar los pesos y el detector como línea base reproducible para estudiar robustez frente a recompresión, recorte o ataques adversarios, aprovechando que los tensores son idénticos a los originales de Meta.
- Verificación en lote con GPU: procesar grandes volúmenes de clips con detección en GPU (15–30 ms por clip de 5–10 s hasta 4K en una B200) dentro de un job de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados son de latencia de detección: en una GPU B200, la detección de vídeo tarda aproximadamente 15–30 ms por clip de 5–10 s a hasta 4K, frente a 0,6–3 s en CPU. Ambas cifras excluyen la decodificación del fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,4 GB, por lo que la huella de pesos es reducida, pero no se especifica el consumo en ejecución.
- GPU recomendadas: el autor cita una NVIDIA B200 para el escenario de máxima velocidad; no se detallan otros modelos.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). Se usa a través del paquete `ltx-pipelines` con los extras `videoseal` y `audioseal`, instalables con `uv sync --extra videoseal --extra audioseal` o `pip install 'ltx-pipelines[videoseal,audioseal]'`.
- Latencia de detección: 15–30 ms por clip en B200 y 0,6–3 s en CPU, sin contar decodificación.
- Los pesos no se descargan automáticamente: hay que obtenerlos con `hf download Lightricks/LTX-2-Marking --local-dir path/to/marking` y verificar los SHA-256.

## Comparativa con modelos similares

| Modelo | Tipo | Carga útil / configuración | Detección incluida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2-Marking (este paquete) | Marcado de vídeo y audio | 256 bits, 256 px, AudioSeal 16 bits | Sí, vía código de LTX-2 | MIT | Hugging Face (Lightricks) |
| PixelSeal / VideoSeal (Meta) | Marcado de vídeo | Checkpoint original con estado completo | Sí, en el repo de Meta | MIT | `facebookresearch/videoseal` |
| AudioSeal (Meta) | Marcado de audio | Modelos base de 16 bits | Sí, en el repo de Meta | MIT | `facebook/audioseal` |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- Las marcas no son firmas criptográficas: son una señal robusta e invisible, y la ausencia de marca detectada no prueba que un clip no haya sido generado.
- Cualquiera que tenga los pesos y el código de LTX-2 puede ejecutar la detección, y un adversario decidido podría debilitar o eliminar la marca.
- El marcado de vídeo está orientado a salida SDR H.264; la salida HDR no se marca en vídeo (solo el audio).
- AudioSeal funciona a la frecuencia nativa de 24/48 kHz y no remuestrea, por lo que señales a otras frecuencias requieren preprocesado externo.
- La carga útil está fijada en el código de LTX-2, no en estos pesos.
- Los `.pth` son pickles de PyTorch: conviene verificar los SHA-256 indicados y cargarlos solo desde este repositorio por motivos de seguridad.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el paquete no procesa texto ni genera contenido.
- La licencia MIT cubre los pesos y configuraciones de Meta; el código de LTX-2 se licencia por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lightricks/LTX-2-Marking
- Repositorio LTX-2: https://github.com/Lightricks/LTX-2
- Código de marcado en LTX-2: https://github.com/Lightricks/LTX-2/tree/main/packages/ltx-pipelines/src/ltx_pipelines/marking
- Documentación de marcado: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/docs/marking.md
- VideoSeal (Meta): https://github.com/facebookresearch/videoseal
- Commit de VideoSeal referenciado: https://github.com/facebookresearch/videoseal/tree/870ca7fb33578b90f14c602016b6c2788096226e
- AudioSeal (Meta): https://huggingface.co/facebook/audioseal
- Paper Video Seal: arXiv:2412.09492
