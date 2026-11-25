# Bragi-GmbH/sortformer-4spk-v2-onnx

## Resumen

Sortformer 4-speaker v2 en ONNX es una adaptación del modelo de diarización de hablantes `nvidia/diar_streaming_sortformer_4spk-v2` de NVIDIA, exportado al formato ONNX por Bragi GmbH. El modelo original resuelve el problema de la diarización de hablantes en streaming (identificar quién habla y cuándo, hasta 4 hablantes simultáneos) y esta versión facilita su despliegue en entornos de producción que no disponen de PyTorch o NeMo, ya que solo requiere ONNX Runtime. Se distribuyen dos ficheros: uno con los pesos en fp32 sin modificar y otro cuantizado dinámicamente a int8.

La relevancia de esta ficha radica en que el grafo exportado cubre únicamente un paso de streaming del modelo (`pre_encode`, concatenación con la caché de hablantes y la FIFO, FastConformer, Transformer y cabezas sigmoideas). El front-end log-mel y la máquina de estados del streaming (compresión de la caché de hablantes y gestión de la FIFO) deben aportarlos el integrador, aunque el autor publica una referencia en NumPy y el script de exportación en su repositorio.

La licencia CC-BY-4.0 permite uso comercial con atribución, lo que convierte a esta exportación en una opción práctica para integrar diarización en tiempo real en pipelines de audio sin depender del ecosistema NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + Transformer con cabezas sigmoideas (Sortformer, streaming) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de streaming configurable: chunk de 124 frames de salida (~10 s), FIFO 124, caché de hablantes 188, periodo de actualización 124, 1 frame de contexto izquierdo y derecho |
| Tipos de cuantizacion | fp32 (492 245 450 bytes) e int8 dinámica (182 481 450 bytes) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma: opera sobre características acústicas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo subyacente es un Sortformer de NVIDIA que combina un codificador FastConformer con un Transformer y cabezas sigmoideas que predicen, para cada frame de 80 ms, la probabilidad de actividad de cada uno de los 4 hablantes. El grafo ONNX exportado implementa un único paso de streaming: recibe el chunk de características log-mel, lo concatena con la caché de hablantes y la FIFO, pasa por el codificador y el Transformer, y devuelve las probabilidades de actividad (`preds`) junto con los embeddings del chunk (`chunk_embs`). Las dimensiones T (frames del chunk), S (tamaño de la caché) y F (tamaño de la FIFO) son dinámicas, y S = 0 y F = 0 son valores válidos.

La exportación se realizó con NeMo 3.0.0 y torch 2.8.0 (exportador TorchScript, `dynamo=False`, `do_constant_folding`), onnx 1.23.2 y onnxruntime 1.31.1, partiendo del checkpoint `nvidia/diar_streaming_sortformer_4spk-v2` en la revisión `84edd514b8ef68004c10086918cd62f2148cbd59`. No se proporcionan datos sobre el corpus de entrenamiento, número de tokens ni si hubo RLHF o DPO. La cuantización int8 se aplica con `onnxruntime.quantization.quantize_dynamic` (`QuantType.QInt8`, por canal) solo a operaciones `MatMul` y `Gemm`; las convoluciones permanecen en fp32.

## Capacidades

- Diarización de hablantes en streaming con hasta 4 hablantes simultáneos.
- Predicción de actividad de hablante por frame de 80 ms (probabilidades por hablante).
- Funcionamiento con estado incremental: caché de hablantes y FIFO para mantener contexto entre chunks.
- Independencia de permutación: las etiquetas de hablante no tienen un orden fijo entre ejecuciones.
- Inferencia sin PyTorch ni NeMo: solo requiere ONNX Runtime.
- Soporte de audio de 16 kHz y de banda telefónica de 8 kHz (evaluado con Opus a 16 kbps).
- No incluye tool calling, agentes, visión ni audio de entrada directo (requiere front-end log-mel externo).

## Casos de uso

- Diarización en tiempo real de reuniones y videoconferencias: el modelo procesa chunks de unos 10 s con estado incremental, lo que permite etiquetar hablantes a medida que llega el audio en plataformas de colaboración.
- Transcripción enriquecida con identidad de hablante: combinado con un ASR, se pueden generar actas o subtítulos que atribuyan cada fragmento al hablante correspondiente, usando las probabilidades por frame para segmentar.
- Análisis de llamadas de atención al cliente: la evaluación en banda telefónica de 8 kHz (DER del 35 % en AMI) lo hace utilizable en grabaciones de call center para separar agente y cliente.
- Moderación y análisis de contenido en plataformas de audio: detección de cuántos hablantes intervienen y en qué momentos, útil para indexación y búsqueda.
- Integración en pipelines de producción sin PyTorch: al ser ONNX, se puede desplegar con ONNX Runtime en servicios en C++, C#, Java o Python, reduciendo dependencias y huella de memoria.
- Procesamiento por lotes de archivos de audio largos: la máquina de estados permite recorrer grabaciones de horas manteniendo la coherencia de las etiquetas de hablante.
- Despliegue en dispositivos con recursos limitados: la variante int8 de 182 MB reduce el espacio y el coste computacional frente a los 492 MB del fp32.

## Benchmarks y rendimiento

Evaluación sobre AMI (6 reuniones, primeros 600 s, collar 0; palabras correctas por palabra / por segmento VAD):

| Condición | Sistema | DER | palabras |
|---|---|---|---|
| 16 kHz | NeMo | 28,9 % | 98,8 % / 88,5 % |
| 16 kHz | este fp32 | 28,9 % | 98,8 % / 88,5 % |
| 16 kHz | este int8 | 28,8 % | 99,0 % / 88,6 % |
| 8 kHz banda telefónica (Opus 16 kbps) | NeMo | 35,0 % | 83,7 % / 80,8 % |
| 8 kHz banda telefónica | este fp32 | 35,0 % | 83,7 % / 80,8 % |
| 8 kHz banda telefónica | este int8 | 35,3 % | 83,8 % / 80,8 % |

Fidelidad frente a NeMo: en modo teacher-forced, la diferencia absoluta máxima de `preds` es 3,2e-6 y la de `chunk_embs` 1,1e-4 sobre 9 clips de AMI de 600 s. En ejecución libre (front-end log-mel y máquina de estados en NumPy junto con este grafo), los segmentos coincidieron con NeMo en 7 de los 9 clips (diferencia máxima de probabilidad 6,2e-6); en 2 de los 9 clips la salida diverge tras un empate exacto en la selección de la caché de hablantes, donde el orden de `torch.topk` de NeMo no está especificado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero fp32 ocupa 492 MB y el int8 182 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); también funciona en CPU.
- Cabe en GPU de consumo: sí, dado el tamaño de los pesos (menos de 0,5 GB en fp32).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integración en servicios Python, C++, C#, Java; requiere aportar el front-end log-mel (128 mel, n_fft 512, ventana Hann de 400, hop 160, pre-énfasis 0,97, guarda logarítmica 2^-24, banco de filtros Slaney) y la máquina de estados del streaming.
- Latencia y throughput: no disponibles; dependen del tamaño del chunk (por defecto 124 frames de salida, unos 10 s) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bragi-GmbH/sortformer-4spk-v2-onnx | no disponible | chunk ~10 s, hasta 4 hablantes | CC-BY-4.0 | ONNX | Exportación del modelo de NVIDIA, solo paso de streaming |
| nvidia/diar_streaming_sortformer_4spk-v2 | no disponible | streaming, hasta 4 hablantes | CC-BY-4.0 | NeMo / PyTorch | Modelo original; requiere NeMo |
| Alternativas de diarización (p. ej. pyannote) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El grafo ONNX cubre solo el paso de streaming; el front-end log-mel y la máquina de estados (compresión de la caché de hablantes y FIFO) deben implementarse aparte. El autor publica una referencia en NumPy en `scripts/sortformer-export` de su repositorio relay.
- Máximo de 4 hablantes simultáneos; no está pensado para escenarios con más participantes solapados.
- El modelo es independiente de permutación: las etiquetas de hablante pueden intercambiarse entre ejecuciones, por lo que hay que evaluar el resultado de diarización y no comparar probabilidades frame a frame con NeMo.
- En 2 de 9 clips de AMI la salida diverge de NeMo tras un empate exacto en la selección de la caché de hablantes, debido a un orden no especificado en `torch.topk`.
- El DER en AMI es del 28,9 % a 16 kHz y del 35,0 % en banda telefónica, lo que indica margen de error apreciable en condiciones reales.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y a Bragi GmbH; es necesario conservar el aviso de licencia y la atribución.
- No se dispone de información sobre sesgos, idiomas o robustez acústica más allá de las pruebas en AMI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bragi-GmbH/sortformer-4spk-v2-onnx
- Modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio relay de Bragi (scripts de exportación y referencia): no disponible como URL directa en la información proporcionada
