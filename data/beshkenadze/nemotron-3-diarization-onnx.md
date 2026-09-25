# beshkenadze/nemotron-3-diarization-onnx

## Resumen

`beshkenadze/nemotron-3-diarization-onnx` es la exportación a ONNX de un único paso de streaming del modelo de diarización de hablantes Nemotron 3 Diarization de NVIDIA (revisión `f667ed73aee57d40cc39428eb768b4fd87a0a29e`). No es un diarizador completo: es el grafo `forward_for_export`, que recibe un bloque de características mel junto con la caché de hablante y la FIFO, y devuelve las probabilidades de hablante por trama y los embeddings del bloque. El objetivo es ejecutar el modelo fuera de NeMo, en concreto desde Rust a través de ONNX Runtime con DirectML en Windows; es el motor de diarización de la aplicación de transcripción Tishina.

El modelo base es un diarizador en streaming de pesos abiertos que sigue hasta ocho hablantes solapados, con una DER publicada del 14,72%. El export conserva la precisión del original: las probabilidades por paso difieren en 2,7e-4 y el DER se mantiene dentro de 0,004 en ocho reuniones AMI respecto a NeMo en fp32. Su relevancia es eminentemente práctica: permite desplegar la diarización de NVIDIA en entornos Windows/.NET y en Rust sin arrastrar el stack de NeMo.

El repositorio ocupa 0,4 GB y contiene el grafo ONNX en fp32 (opset 17, formas fijas del perfil offline), el banco de filtros mel del checkpoint y el embedding de silencio aprendido, ambos como ficheros binarios f32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion (FlexAttention en el original, sustituida por atencion densa equivalente para el trazado); modulos de streaming Sortformer con speaker cache y FIFO; exportado como grafo ONNX de un unico paso |
| Parametros totales | ~100 M (heredados de `nvidia/Nemotron-3-Diarization`; no verificados directamente en el export) |
| Longitud de contexto | Bufer de entrada de 30,4 s por paso (chunk de 3040 tramas mel a 10 ms); memoria de hablante de 264 tramas (spkcache) + 40 (FIFO); contexto derecho 40 y periodo de actualizacion 300 |
| Tipos de cuantizacion | fp32 (publicado); se midio un export fp16 pero no se publica |
| Idiomas soportados | no disponible (la diarizacion es independiente del idioma; se ha probado con audio sintetico, reuniones AMI y una reunion en ruso) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | ONNX (opset 17, formas fijas) + ficheros binarios f32: `mel_filterbank.f32` (128 x 257) y `learnable_sil_emb.f32` (512) |

## Arquitectura y entrenamiento

El grafo exportado es un paso de inferencia de un diarizador en streaming basado en transformer con atención densa, con los módulos de streaming de Sortformer. Entradas: `chunk` (1 x 3040 x 128, tramas log-mel de contexto izquierdo + chunk + contexto derecho), `chunk_lengths`, `spkcache` (1 x 264 x 512), `spkcache_lengths`, `fifo` (1 x 40 x 512) y `fifo_lengths`. Salidas: `preds` (1 x 684 x 8, probabilidades por trama de 80 ms sobre cache + FIFO + chunk), `preds_hr` (1 x 5472 x 8, las mismas a 10 ms), `chunk_embs` (1 x 380 x 512, embeddings pre-codificados para actualizar la caché), `chunk_emb_lengths` y `encoded_lengths`. Los chunks finales cortos se rellenan con ceros hasta 3040 tramas y su longitud real viaja en `chunk_lengths`.

El export se construyó a partir del checkpoint fp32 de `transformers`, no del `.nemo` en bfloat16. Como los dos checkpoints nombran los tensores de forma distinta, el state dict de NeMo se reconstruyó en fp32 por contenido: cada tensor bf16 se sustituyó por el tensor fp32 que lo redondea bit a bit. Las proyecciones fusionadas `w_qkv` se emparejaron a tercios y la ventana Hann y el banco mel se recalcularon desde la config del checkpoint. Dos bloques (`hidden_to_spks`, congelado, y `activity_head`, solo de entrenamiento) se quedaron en bf16 porque la inferencia no los lee, y no aparecen en el grafo. Los 417 tensores fp32 se colocaron correctamente y el checkpoint reconstruido carga en NeMo con `strict=True`. La exportación se hizo con `torch.onnx.export`, porque el exportador propio de NeMo no maneja el encoder transformer. El frontend mel (16 kHz mono, pre-énfasis 0,97, FFT de 512 puntos, ventana Hann de 25 ms, salto de 10 ms, logaritmo natural con guarda 2^-24, sin normalización por característica y con el recuento de tramas redondeado a múltiplo de 16) y la actualización de la caché de hablante (`SortformerModules.streaming_update_async` y su compresión) quedan fuera del grafo y hay que reimplementarlos alrededor.

## Capacidades

- Diarizacion de hablantes ("quien hablo cuando") en streaming y en modo offline, con hasta ocho hablantes y solapamiento.
- Ordenacion de los hablantes de salida segun su primera aparicion en el audio.
- Deteccion de actividad de voz (pipeline declarado: `voice-activity-detection`), con probabilidades por trama a 80 ms y a 10 ms.
- Extraccion de embeddings de hablante por chunk (512 dimensiones) para la actualizacion de la cache.
- Mantenimiento de memoria de hablante a largo plazo mediante speaker cache + FIFO (perfil offline: 264 + 40 tramas).
- Ejecucion fuera de NeMo, vía ONNX Runtime, incluido DirectML en Windows.
- No incluye generacion de texto, codigo ni matematicas; no es un modelo de lenguaje.
- Soporte de tool calling / agentes: no disponible (no aplica).
- Capacidades multilingues: no disponible; la tarea no depende del idioma, pero no se documentan idiomas soportados.

## Casos de uso

- Transcripcion con etiquetado de hablante en aplicaciones de escritorio: es el caso real del autor, la app Tishina, que ejecuta este grafo desde Rust con ONNX Runtime y DirectML en Windows para asignar cada segmento transcrito a su hablante.
- Actas de reuniones: procesado offline de grabaciones tipo AMI con la ventana de 30,4 s del perfil offline, donde el export se ha validado con una diferencia de DER de 0,004 frente a NeMo en ocho reuniones AMI.
- Analitica de centros de contacto: separar agente y cliente en grabaciones de llamadas (hasta ocho hablantes) para calcular tiempos de habla, turnos e intervenciones, integrándose con un ASR posterior.
- Subtitulado en directo: inferencia en streaming paso a paso para anotar quien habla mientras se genera la transcripcion, gracias a las probabilidades por trama de 10 ms.
- Segmentacion previa a ASR: usar el modelo como VAD y diarizador para trocear audio largo (se ha probado una reunion en ruso de 45 minutos) antes de enviar cada segmento a un motor de reconocimiento de voz.
- Indexacion y busqueda de archivos de audio de gran tamano: etiquetar hablantes en un archivo de horas para permitir busquedas del tipo "que dijo el hablante 3".
- Despliegue en entornos .NET/Windows sin NeMo: reimplementar alrededor del grafo el frontend mel y la actualizacion de cache en C# o Rust para llevar diarizacion de NVIDIA a aplicaciones de escritorio o servidores Windows con DirectML.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| DER del modelo base (benchmark no especificado) | 14,72% | explainx.ai (modelo base NVIDIA) |
| Diferencia de DER del export frente a NeMo fp32 (8 reuniones AMI) | <= 0,004 | model card del export |
| Diferencia de DER frente a NeMo fp32 (reunion en ruso de 45 min) | 0,006 | model card del export |
| Archivos sinteticos multihablante identicos trama a trama | 7 de 8 | model card del export |
| Diferencia por paso en probabilidades de hablante (entradas reales capturadas) | 2,7e-4 | model card del export |
| Diferencia frente a atencion densa densa vs FlexAttention al trazar | 5e-6 | model card del export |

No se han publicado resultados de benchmarks propios (MMLU, DER estandar, etc.) en la informacion disponible; las cifras anteriores miden el acuerdo del export con NeMo, no su calidad absoluta.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 0,4-0,5 GB en fp32 (modelo de ~100 M de parametros mas activaciones); el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: al ser un grafo pequeno, no requiere GPU de centro de datos; funciona en cualquier GPU moderna. La via documentada es DirectML en Windows, por lo que es viable incluso con GPU integrada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas integradas, dado el tamano del modelo y del grafo.
- Opciones de despliegue: ONNX Runtime (el autor lo usa desde Rust); DirectML en Windows; tambien es viable la ejecucion en CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). NeMo no se usa para ejecutar este grafo.
- Latencia y throughput: no disponible. El perfil offline usa un bufer de entrada de 30,4 s por paso con periodo de actualizacion 300 y contexto derecho 40, pero no se publican cifras de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | Hablantes | DER | Licencia | Formato |
|---|---|---|---|---|---|---|
| `beshkenadze/nemotron-3-diarization-onnx` (este) | ~100 M | Un paso de streaming (bufer de 30,4 s) | 8 | Coincide con NeMo (<= 0,004 en AMI) | OpenMDW 1.1 | ONNX fp32 + binarios f32 |
| `nvidia/Nemotron-3-Diarization` (base) | ~100 M | Streaming y offline | 8 | 14,72% (benchmark no especificado) | OpenMDW 1.1 | `.nemo` (bf16) y safetensors (fp32) |
| `nvidia/Nemotron-3-Diarization-preview` | ~100 M | Streaming y offline | 8 | no disponible | OpenMDW 1.1 | safetensors |
| `pyannote/speaker-diarization-3.1` | no disponible | Principalmente offline | no disponible | no disponible | no disponible | PyTorch |

El export no aporta un modelo distinto, sino un formato y un entorno de ejecucion alternativos: es la misma arquitectura y los mismos pesos que `nvidia/Nemotron-3-Diarization`, con el grafo y los ficheros auxiliares necesarios para correrlo fuera de NeMo. La comparacion pertinente es, por tanto, de empaquetado y portabilidad, no de calidad.

## Limitaciones y advertencias

- No es un diarizador completo: solo exporta un paso de streaming (`forward_for_export`). El frontend mel y la actualizacion de la cache de hablante (`streaming_update_async` y su compresion) hay que reimplementarlos alrededor del grafo o el modelo no funciona.
- Formas fijas: el grafo esta trazado para el perfil offline (chunk de 3040 tramas, cache 264, FIFO 40); no admite otras formas sin reexportar.
- El export fp32 se hizo reconstruyendo el state dict por contenido; aunque carga con `strict=True`, cualquier discrepancia frente al original depende de esa correspondencia bit a bit.
- El export fp16 medido, aunque puntua igual en AMI contra las etiquetas de referencia, movio 35 segundos de habla entre hablantes en una reunion larga respecto a fp32, sin referencia para decidir cual era correcta; por eso no se publica. Es un indicio de sensibilidad a la precision numerica.
- Riesgo de confusion de hablantes en audio solapado, con ruido o con voces similares; la propia DER del 14,72% del modelo base implica errores no despreciables.
- Sesgos conocidos: no disponible en la informacion proporcionada; NVIDIA remite a la model card del modelo base para datos de entrenamiento, evaluacion, uso previsto y limitaciones, que aplican sin cambios.
- Restricciones de licencia: OpenMDW 1.1 obliga a conservar el acuerdo y los avisos de origen en cualquier redistribucion, ya que estos ficheros son una conversion del modelo de NVIDIA.
- Uso sensible: la diarizacion puede emplearse para vigilancia o perfilado de personas; conviene valorar requisitos legales y de privacidad antes de un despliegue en produccion.
- Depende de un runtime propio: no hay integracion en vLLM, llama.cpp, Ollama ni TGI, por lo que el soporte y las pruebas recaen en quien lo integra.
- Repositorio sin descargas ni "likes" en el momento de la consulta; es un artefacto nuevo y de un unico autor, sin ecosistema de soporte.

## Enlaces

- HuggingFace (este export): https://huggingface.co/beshkenadze/nemotron-3-diarization-onnx
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Modelo base (preview): https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Ficheros del preview: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview/tree/main
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Articulo de explainx.ai: https://www.explainx.ai/blog/nvidia-nemotron-3-diarization-open-weight-eight-speakers-2026
- Articulo de Unite.AI: https://www.unite.ai/nvidia-releases-nemotron-3-diarization-open-weight-speaker-model/
- Noticia de ccleaks: https://ccleaks.com/news/nvidia-nemotron-3-diarization-sep-2026
