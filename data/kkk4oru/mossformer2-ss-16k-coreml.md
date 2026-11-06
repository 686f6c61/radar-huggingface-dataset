# kkk4oru/mossformer2-ss-16k-coreml

## Resumen

MossFormer2-ss-16k-coreml es una conversión a Core ML del modelo de separación de hablantes MossFormer2_SS_16K, desarrollado originalmente por Alibaba Speech Lab (alibabasglab). El modelo original realiza separación de dos hablantes solapados en audio mono a 16 kHz; esta versión lo empaqueta como programa Core ML (ML Program) para ejecutarse en Apple Silicon mediante coremltools 9.0, sin reentrenamiento alguno: se reutilizan los pesos originales almacenados como flotantes de 16 bits.

La conversión fija la longitud de entrada en exactamente 8 segundos (128.000 muestras) y devuelve dos pistas, una por hablante, en un único tensor de salida `[2, 1, 128000]`. El autor declara un rendimiento en GPU (cpuAndGPU) de aproximadamente 0,18-0,19 segundos por segundo de audio, con un consumo de memoria unificada estimado de 0,9-1,1 GB y un tamaño en disco de 131,8 MB. El repositorio tiene 0,1 GB y licencia Apache 2.0.

El interés de esta ficha radica en que permite ejecutar localmente en Macs con Apple Silicon un modelo de separación de fuentes de audio sin depender de PyTorch ni de servicios en la nube, integrándolo en aplicaciones nativas Swift. Es relevante para pipelines de transcripción de vídeo con hablantes solapados, donde el modelo se usa como preprocesado antes de un sistema ASR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de separación de habla; conversión a Core ML ML Program) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 8 segundos (128.000 muestras a 16 kHz) |
| Tipos de cuantización | pesos en float16 (16-bit float); entrada y salida en float32 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage` / `model.mlmodel` + `weight.bin`); modelo base en PyTorch (`last_best_checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo subyacente es MossFormer2_SS_16K de Alibaba Speech Lab, una red de separación de hablantes para dos fuentes solapadas a 16 kHz. La model card de esta conversión no detalla la arquitectura interna más allá de nombrar MossFormer2 y mencionar el uso de rotary embeddings (la conversión reescribe los `einsum` de la red y de `rotary-embedding-torch` como productos con `@` y `*`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card del autor original queda truncada en el texto proporcionado.

La conversión no reentrena pesos: parte de `alibabasglab/MossFormer2_SS_16K` (revisión `407cb030cd66340918ebb6c8cc63b18f8592cdbe`, fichero `last_best_checkpoint.pt`, SHA-256 `00a3a48bda492db1e829b85dd443f8f43a43039a3e90f1a24962ea9caf14a11a`) y del código de red de `modelscope/ClearerVoice-Studio` (commit `6b3774dc79c46ae8bed2a4fa5f706f0ac8c75c61`). Los cambios introducidos son de forma (padding negativo convertido en slices, máscaras booleanas como concatenación, tamaños trazados de un elemento leídos como escalares, salidas apiladas en un tensor) y uno numérico: la precisión de cómputo pasa a float16 para reducir memoria en GPU, manteniendo entrada y salida en float32. La conversión se realizó con coremltools 9.0 y PyTorch 2.7.1, con objetivo macOS 13, y una repetición reprodujo `weight.bin` byte a byte.

## Capacidades

- Separación de dos hablantes solapados en audio mono a 16 kHz, devolviendo dos pistas independientes.
- Entrada de longitud fija: exactamente 8 segundos (128.000 muestras float32); clips más cortos deben rellenarse con ceros y recortarse después.
- Ejecución en Apple Silicon mediante Core ML, con `MLComputeUnits.cpuAndGPU` recomendado.
- Integración nativa en Swift a través de `MLModel` y `MLMultiArray`.
- No incluye escalado RMS automático: el decodificador original escala cada pista al nivel RMS de la entrada, pero esta conversión no lo hace y debe aplicarse a posteriori.
- No soporta tool calling, agentes, visión ni otras modalidades; es exclusivamente audio-a-audio.

## Casos de uso

- Preprocesado para transcripción de vídeo con hablantes solapados: el modelo separa las dos voces antes de enviar cada pista a un sistema ASR, que es precisamente el uso previsto según el autor (Transcribe Captions envía solo los tramos solapados).
- Subtitulado automático de reuniones y entrevistas: al separar pistas se facilita la diarización y la asignación de turnos de palabra en la generación de subtítulos.
- Limpieza de grabaciones de campo o periodísticas: separar una entrevista con dos interlocutores que se pisan permite obtener dos ficheros limpios para edición posterior.
- Análisis forense de audio: aislar cada voz en una conversación grabada para su análisis independiente, con la cautela de que el orden de las pistas es arbitrario y debe emparejarse por solapamiento en ventanas contiguas.
- Procesado por lotes en Macs de escritorio: con 0,18-0,19 s por segundo de audio en GPU, un Mac con 48 GB de memoria unificada puede procesar horas de audio en minutos, con un consumo de unos 0,9-1,1 GB.
- Integración en apps macOS nativas: al ser un ML Program, se puede empaquetar en una aplicación Swift sin dependencias de PyTorch ni Python, útil para herramientas de accesibilidad o transcripción local.
- Investigación en separación de fuentes: sirve como referencia reproducible para comparar exportaciones Core ML, ONNX y PyTorch sobre el mismo modelo base.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor de la conversión, no benchmarks estándar de la literatura. Se realizaron en un único Mac Apple Silicon con 48 GB de memoria unificada, en GPU (`cpuAndGPU`), con carga ligera (load average 4-9) y un proceso por ejecución.

| Métrica | Valor |
|---|---|
| Tiempo por segundo de audio (estable, GPU) | ~0,18-0,19 s (rango global 0,14-0,22 s) |
| Deriva en ejecuciones largas | Sin empeoramiento continuo hasta 240 clips (32 min): 0,179 al final de 240 frente a 0,177 al final de 30 |
| Primer clip (compilación y carga) | 3,6-4,2 s |
| Pico de memoria del proceso | 0,64-0,72 GB, sin crecimiento durante la ejecución |
| Memoria gráfica del pico | ~0,39 GB de 0,60 GB |
| Memoria de sistema del driver GPU (añadida) | 0,58 GB mediana, 0,77 GB máximo |
| Coste total estimado en memoria unificada | ~0,9-1,1 GB |
| Tamaño en disco | 131,8 MB |
| Diferencia frente a PyTorch (SNR, clip real de 8 s) | 64,4 dB y 56,2 dB por pista (frente a 114-122 dB en precisión completa) |
| Recall de palabras (9 ventanas solapadas reales) | 0,691, frente a 0,683 de PyTorch y 0,674 de la exportación ONNX |
| Recall de palabras (24 rangos recortados a 8 s con relleno de ceros) | 0,567, frente a 0,587 de ONNX en CPU |
| CPU solo | 37-45 dB frente a PyTorch, 0,65-0,81 s por segundo de audio, 0,44 GB |
| Otras longitudes convertidas (no publicadas) | 12 s: 32-41 dB; 16 s: 48-50 dB y 1,12 GB; 30 s: 48-51 dB y 1,84 GB |

El autor advierte que ninguna de estas mediciones fue verificada por una persona: no hubo test de escucha ni referencia humana, y el recall se compara con texto transcrito de la mezcla, que es a su vez un resultado automático. Las muestras son pequeñas.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkk4oru/mossformer2-ss-16k-coreml | Core ML | 8 s fijos, 16 kHz | float16 (cómputo), float32 (E/S) | Apache 2.0 | Hugging Face, macOS Apple Silicon |
| kkk4oru/mossformer2-ss-16k-onnx | ONNX | no disponible en la información | no disponible | no disponible | Hugging Face |
| alibabasglab/MossFormer2_SS_16K | PyTorch | no disponible en la información | precisión completa | no disponible en la información | Hugging Face |

La comparación de rendimiento entre las tres variantes aparece en la sección de benchmarks: en recall de palabras la versión Core ML (0,691) queda por encima de PyTorch (0,683) y ONNX (0,674) en la muestra de 9 ventanas, pero por debajo de ONNX en CPU (0,567 frente a 0,587) en la muestra de 24 rangos. No se dispone de datos de benchmarks estándar (SI-SNRi, SDR, etc.) para comparar con otros modelos de separación como SepFormer o TF-GridNet.

## Limitaciones y advertencias

- Solo funciona en macOS sobre Apple Silicon. No se ha probado en Macs Intel, iOS ni en otros chips Apple Silicon distintos del usado en las mediciones.
- La longitud de entrada está fija en 8 segundos y forma parte del grafo convertido: otra longitud exige otra conversión. El autor convirtió 12, 16 y 30 segundos pero no las publicó porque no mejoraban los resultados.
- El orden de las dos pistas de salida es arbitrario; para audio largo hay que solapar ventanas y emparejar el orden en la zona de solapamiento.
- No aplica el escalado RMS del decodificador original; hay que hacerlo después, midiendo solo las muestras del clip y no el relleno de ceros.
- El Neural Engine no se usó: Core ML advirtió que no podía compilar una conversión de 30 segundos de este grafo. Se recomienda `MLComputeUnits.cpuAndGPU`.
- En CPU la precisión baja (37-45 dB frente a PyTorch) y el rendimiento cae a 0,65-0,81 s por segundo de audio.
- La precisión float16 reduce la fidelidad frente a PyTorch (64,4 y 56,2 dB de SNR frente a 114-122 dB en precisión completa).
- Las mediciones no han sido verificadas por humanos: no hay test de escucha ni referencia humana, y las muestras de recall son pequeñas.
- La model card original del modelo base queda truncada en la información disponible; no se detallan sesgos, composición del dataset ni limitaciones idiomáticas.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y del código de ClearerVoice-Studio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkk4oru/mossformer2-ss-16k-coreml
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- Exportación ONNX del mismo autor: https://huggingface.co/kkk4oru/mossformer2-ss-16k-onnx
- Código de red (ClearerVoice-Studio): https://github.com/modelscope/ClearerVoice-Studio
