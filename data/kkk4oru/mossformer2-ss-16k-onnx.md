# kkk4oru/mossformer2-ss-16k-onnx

## Resumen

MossFormer2_SS_16K en ONNX es una exportación del modelo de separación de habla de dos hablantes desarrollado originalmente por Alibaba (alibabasglab) y convertido a formato ONNX por el usuario kkk4oru. El modelo toma una señal de audio mono a 16 kHz con dos voces solapadas y devuelve dos pistas separadas, una por hablante. La conversión no retrena ni cuantiza los pesos: mantiene las mismas ponderaciones del modelo original y solo adapta el grafo para que sea ejecutable con ONNX Runtime.

La relevancia de esta ficha radica en que facilita el despliegue del modelo fuera del ecosistema PyTorch, con un único fichero de 230 MB y una API de entrada/salida muy simple (`wave` de forma `[1, samples]` y `tracks` de forma `[2, 1, samples]`). Está pensado para integrarse en pipelines de preprocesado de audio, especialmente en la separación de interlocutores solapados antes de la transcripción automática.

La arquitectura subyacente es MossFormer2, una red de separación de habla basada en atención y convoluciones, si bien esta ficha no dispone de detalles técnicos internos del modelo original más allá de lo indicado en la model card de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de separación de habla; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio de cualquier longitud; sin ventana fija declarada) |
| Tipos de cuantizacion | ninguna publicada; se probó INT8 dinámico (MatMul y Gemm) y se descartó por pérdida de precisión y falta de ganancia en CPU |
| Idiomas soportados | no disponible (el modelo separa habla, no transcribe; no se declara cobertura lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); fichero de 230 MB |

## Arquitectura y entrenamiento

El modelo original, `alibabasglab/MossFormer2_SS_16K`, es un separador de habla de dos hablantes a 16 kHz. Según la model card upstream citada, se entrenó con conjuntos de datos grandes, incluyendo datos de código abierto y privados, y su tarea es separar el habla mezclada de varios hablantes en pistas individuales. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a separación de audio).

La conversión a ONNX, realizada con PyTorch 2.7.1 y opset 17, introduce dos cambios acotados: se nombran los ejes en las llamadas a `squeeze()` sin eje para preservar el eje de batch y mantener formas conocidas, y las dos salidas se apilan en un único tensor `tracks`. El resto de la red y los pesos permanecen sin cambios. El código de red proviene de `modelscope/ClearerVoice-Studio` (commit `6b3774dc79c46ae8bed2a4fa5f706f0ac8c75c61`) y deriva de SpeechBrain (Apache-2.0).

Una diferencia funcional relevante respecto al modelo PyTorch original: el decodificador upstream escala cada pista al nivel RMS de la entrada, mientras que este grafo ONNX no lo hace, por lo que ese escalado debe aplicarse a posteriori si se necesita paridad de niveles.

## Capacidades

- Separación de habla de dos hablantes solapados en audio mono a 16 kHz.
- Acepta entradas de longitud arbitraria (sin ventana de contexto fija declarada).
- Devuelve dos pistas de audio float32 con la misma longitud que la entrada.
- Ejecutable con ONNX Runtime mediante el proveedor de ejecución CPU.
- Integrable en pipelines de preprocesado previos a transcripción automática.
- No realiza transcripción, diarización etiquetada, traducción ni generación de texto.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- El orden de las dos pistas de salida es arbitrario; no se asigna identidad de hablante.

## Casos de uso

- Separación de interlocutores antes de transcribir: en vídeos o reuniones con habla solapada, se envía únicamente el fragmento con solapamiento a este modelo y se transcriben las dos pistas por separado, mejorando la calidad de la transcripción. Es el uso declarado por el autor de la conversión (Transcribe Captions).
- Preprocesado en pipelines de ASR: insertar el separador como etapa previa a un motor de reconocimiento de voz para reducir errores en pasajes con dos voces simultáneas, dado que el modelo acepta audio de cualquier longitud.
- Limpieza de grabaciones de entrevistas: separar entrevistador y entrevistado en una sola pista mono para edición posterior o para generar subtítulos por hablante.
- Análisis forense o de calidad de audio: aislar cada voz para inspección manual o para calcular métricas por hablante en grabaciones de campo.
- Prototipado en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU a aproximadamente 1,2–2 veces el tiempo real, permite desplegar la separación en servidores sin acelerador dedicado.
- Integración en aplicaciones de escritorio o macOS: usando el proveedor CPU de ONNX Runtime, se puede empaquetar el modelo de 230 MB en herramientas locales de procesado de audio.
- Evaluación comparativa de separadores: servir como referencia ONNX del modelo upstream para medir diferencias de salida frente a la versión PyTorch (con SNR declarados de 49,9 a 83,7 dB según longitud y pista).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (SI-SNRi, SDR, etc.) en la información disponible. La model card de la conversión incluye únicamente medidas de fidelidad frente al modelo PyTorch original y de velocidad, no comparaciones con otros separadores.

| Medida | Valor |
|---|---|
| Diferencia SNR pista 1 vs. PyTorch (1,0 s) | 78,5 dB |
| Diferencia SNR pista 1 vs. PyTorch (30,0 s) | 50,1 dB |
| Diferencia SNR pista 2 vs. PyTorch (1,0 s) | 83,7 dB |
| Diferencia SNR pista 2 vs. PyTorch (30,0 s) | 49,9 dB |
| Velocidad en CPU (bajo carga) | ~1,2–2× tiempo real |
| Memoria pico medida | ~10 GB (midiendo varias longitudes en un proceso junto al modelo PyTorch) |
| Tamaño del fichero | 230 MB |

Estas medidas fueron tomadas con ONNX Runtime 1.31.1 en un Mac con Apple Silicon, con otras tareas en ejecución, y no son pruebas de escucha ni han sido verificadas por una persona según el autor.

## Requisitos de hardware

- VRAM/RAM: no se declara requisito de VRAM; el modelo se ha medido en CPU. La memoria pico observada de ~10 GB corresponde a un proceso que cargaba varias longitudes junto al modelo PyTorch, no al consumo aislado del grafo ONNX.
- GPU recomendadas: no disponibles; los proveedores GPU en Windows (DirectML, CUDA) no han sido probados según el autor.
- Compatibilidad con GPU de consumo: no confirmada; el proveedor Core ML en macOS falla con este grafo (dimensiones no acotadas) y aborta el proceso.
- Despliegue: ONNX Runtime con `CPUExecutionProvider` es la vía validada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 1,2–2 veces el tiempo real en CPU bajo carga; se espera más rápido en una máquina ociosa.
- Cuantización: la versión INT8 dinámica (MatMul y Gemm) no aportó velocidad en CPU y perdió precisión (35,6 dB frente a PyTorch), por lo que no se publica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| kkk4oru/mossformer2-ss-16k-onnx | Separación de habla 2 hablantes, 16 kHz | no disponible | audio de longitud arbitraria | Apache-2.0 | ONNX | Hugging Face |
| alibabasglab/MossFormer2_SS_16K | Separación de habla 2 hablantes, 16 kHz (original) | no disponible | audio de longitud arbitraria | Apache-2.0 | PyTorch (`.pt`) | Hugging Face |
| Otros separadores (p. ej. SepFormer, ConvTasNet) | Separación de habla | no disponible en esta información | no disponible | variable | PyTorch/ONNX | variable |

No se dispone de datos de rendimiento comparativo (SDR, SI-SNRi) entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El orden de las dos pistas de salida es arbitrario: no hay asignación de identidad ni etiquetado de hablante.
- El grafo no aplica el escalado RMS del decodificador original; si se necesita paridad de niveles con PyTorch, hay que aplicarlo manualmente después.
- El proveedor Core ML de ONNX Runtime no ejecuta este grafo (dimensiones no acotadas) y aborta el proceso; en macOS debe usarse el proveedor CPU o probar antes.
- Los proveedores GPU en Windows (DirectML, CUDA) no han sido probados por el autor.
- La cuantización INT8 dinámica probada perdió precisión (35,6 dB frente a PyTorch) y no aportó velocidad en CPU; no se publica versión cuantizada.
- Las medidas de SNR y velocidad son del autor, tomadas en un Mac con Apple Silicon bajo carga y sin verificación humana ni pruebas de escucha; deben tomarse como orientativas.
- No se declara cobertura lingüística ni sesgos conocidos; al ser un modelo de separación de audio, el riesgo de alucinación de texto no aplica, pero sí puede producir artefactos o sangrado entre pistas en mezclas complejas.
- Licencia Apache-2.0 permite uso comercial; el código de red deriva de SpeechBrain (Apache-2.0) y el upstream no incluye fichero NOTICE.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Hugging Face (conversión ONNX): https://huggingface.co/kkk4oru/mossformer2-ss-16k-onnx
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- Código de red (ClearerVoice-Studio): https://github.com/modelscope/ClearerVoice-Studio
- SpeechBrain: https://github.com/speechbrain/speechbrain
- ONNX Runtime: https://onnxruntime.ai/
