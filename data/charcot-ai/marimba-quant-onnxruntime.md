# charcot-ai/marimba-quant-onnxruntime

## Resumen

Marimba quant ONNX Runtime es un paquete de exportaciones ONNX del codificador de audio congelado del modelo Marimba, desarrollado por charcot-ai. Marimba es un sistema de comprensión de audio orientado a conversaciones que responde a preguntas de ventana (fin de turno, actividad de voz, mismo hablante, cambio de hablante y recuento de hablantes). Este repositorio contiene únicamente la torre de audio, es decir, el codificador de audio del modelo Qwen/Qwen3-ASR-0.6B, en formato ONNX con distintas cuantizaciones.

El paquete incluye variantes en coma flotante de 32 y 16 bits, además de múltiples esquemas de cuantización de 8 bits (dinámica por tensor, dinámica por canal, y estática QDQ con calibración MinMax, entropy y percentile). Cada variante se publica con sus puntuaciones medidas, lo que permite elegir el equilibrio entre tamaño, latencia y fidelidad de las decisiones. El codificador procesa ventanas de 8 segundos de audio mono a 16 kHz y expone las activaciones de las capas 9, 12 y 18, que alimentan las distintas cabezas de decisión que permanecen en el repositorio base.

La relevancia de este lanzamiento radica en que facilita el despliegue del codificador de audio en entornos de producción con ONNX Runtime, sin necesidad de PyTorch, y con opciones de cuantización que reducen el tamaño desde 739 MB (fp32) hasta 186-198 MB (int8). El decodificador de texto no está incluido, por lo que las preguntas de idioma y terminología quedan fuera del alcance de este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de audio, torre de audio de Qwen3-ASR-0.6B), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de 8 segundos de audio a 16 kHz (128.000 muestras); 104 frames de salida por ventana |
| Tipos de cuantizacion | fp32, fp16, int8 dinámica (por tensor y por canal), int8 estática QDQ (MinMax, entropy, percentile), variantes híbridas con nodos en float |
| Idiomas soportados | no disponible (el codificador de audio no procesa texto; el decodificador de texto no está incluido) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx), filtros mel en .npy, metadatos en .json |

## Arquitectura y entrenamiento

El modelo es un codificador de audio basado en transformer, correspondiente a la torre de audio de Qwen/Qwen3-ASR-0.6B, congelado y exportado a ONNX. La arquitectura se divide en dos grafos: `tower_l12.onnx` procesa la entrada mel (`[B, 128, 800]`, float32) y produce las activaciones de las capas 9 y 12 (`[B, 104, 896]`); `tower_l13_18.onnx` toma la salida de la capa 12 y produce la capa 18. El tamaño de lote `B` es dinámico. El cálculo del espectrograma log-mel se realiza fuera de los grafos, con un banco de filtros de 128 bandas incluido en `mel_filters.npy`.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. La innovación técnica destacable es la publicación sistemática de variantes de cuantización con métricas de fidelidad: se miden las decisiones umbralizadas y la probabilidad máxima de cambio respecto a la referencia fp32 en PyTorch. Las variantes `int8_minmax_x20`, `_x25` y `_x30` mantienen en float los nodos cuya relación señal-ruido de cuantización está por debajo de 20, 25 o 30 dB, respectivamente, medido sobre 16 ventanas de calibración.

## Capacidades

- Extracción de características de audio: procesa ventanas de 8 segundos de audio mono a 16 kHz y genera representaciones latentes de 104 frames con 896 dimensiones.
- Detección de actividad de voz (VAD): lectura de la capa 9, con AUROC de 0,9969 en la última segunda y 0,9999 en la ventana completa de 8 segundos.
- Detección de fin de turno: lectura de la capa 18, con AUROC de 0,9310 en la referencia fp32.
- Verificación de mismo hablante: lectura de la capa 12, con AUROC de 0,9926.
- Detección de cambio de hablante: lectura de la capa 12, con AUROC de 0,9557.
- Recuento de hablantes: lectura de la capa 12, con exactitud de 0,7862.
- Ejecución con lote dinámico: el tamaño de lote `B` es dinámico en los grafos ONNX.
- Optimización por consulta: una llamada que no requiere fin de turno ejecuta únicamente `tower_l12.onnx`, evitando el coste de las capas 13-18.
- No incluye: decodificación de texto, preguntas de idioma o terminología, tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Segmentación de conversaciones en tiempo real: el codificador permite detectar el fin de turno con AUROC de 0,9310, lo que posibilita sistemas de diálogo por voz que responden sin esperar silencios prolongados. La variante `fp16` mantiene la puntuación (0,9312) con la mitad de tamaño.
- Detección de actividad de voz en pipelines de transcripción: con AUROC de 0,9969 en la última segunda, se puede filtrar silencio antes de enviar audio a un ASR, reduciendo coste computacional. La capa 9 es suficiente, por lo que solo se ejecuta `tower_l12.onnx`.
- Diarización de hablantes en reuniones: las lecturas de mismo hablante (AUROC 0,9926) y cambio de hablante (AUROC 0,9557) permiten etiquetar segmentos de una reunión de 8 segundos por ventana. La variante `int8_dynamic_pc` mantiene 0,9920 y 0,9545 con 199 MB.
- Recuento de participantes en una sala: la exactitud de 0,7862 en recuento de hablantes permite estimar el número de interlocutores en una ventana, útil para enrutamiento de llamadas o control de calidad.
- Despliegue en CPU sin GPU: las variantes int8 (186-198 MB) se ejecutan con el proveedor CPU de ONNX Runtime, lo que permite integrar el codificador en servidores sin acelerador hardware. La variante `int8_dynamic_pc` es la que menos decisiones cambia (107 de 7.020) entre las int8 dinámicas.
- Aceleración con TensorRT en GPU: la variante `fp32` puede compilarse a un motor TensorRT de 16 bits con 3 decisiones cambiadas y puntuaciones de 0,9308 en fin de turno. El motor se construye para lotes de 1 a 32, optimizado para 16.
- Procesamiento por lotes de auditorías de audio: con lote 16 en una NVIDIA L4, la variante PyTorch bf16 alcanza 464,1 ventanas/s en capas 1-12, lo que permite analizar grandes volúmenes de grabaciones.

## Benchmarks y rendimiento

Puntuaciones de las cabezas de Marimba sobre las activaciones de cada variante, evaluadas en 1.170 ventanas públicas de 8 segundos. Las preguntas binarias reportan AUROC; el recuento de hablantes reporta exactitud. "Decisiones cambiadas" cuenta las ventanas, sumadas sobre las seis decisiones, cuya decisión umbralizada difiere de la referencia fp32.

| Variante | Esquema | Tamano | Fin de turno | VAD (ult. 1 s) | VAD (8 s) | Mismo hablante | Cambio hablante | Recuento | Decisiones cambiadas | Mayor cambio de probabilidad |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| PyTorch fp32 (referencia) | float32, una ventana por llamada | - | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | - | - |
| `fp32` | float32 | 739 MB | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0 | 0,000 |
| `fp16` | float16 | 370 MB | 0,9312 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 2 | 0,034 |
| `int8_dynamic` | int8 dinámica, pesos sin signo por tensor | 198 MB | 0,9290 | 0,9968 | 0,9999 | 0,9916 | 0,9534 | 0,7874 | 179 | 0,437 |
| `int8_dynamic_pc` | int8 dinámica, pesos con signo por canal, rango 7 bits | 199 MB | 0,9364 | 0,9969 | 0,9999 | 0,9920 | 0,9545 | 0,7828 | 107 | 0,423 |
| `int8_minmax` | int8 estática QDQ, calibración MinMax | 187 MB | 0,9282 | 0,9968 | 0,9999 | 0,9928 | 0,9555 | 0,7920 | 308 | 0,823 |
| `int8_entropy` | int8 estática QDQ, calibración entropy | 187 MB | 0,9251 | 0,9962 | 0,9999 | 0,9931 | 0,9537 | 0,7954 | 275 | 0,751 |
| `int8_percentile` | int8 estática QDQ, calibración percentile (99,999) | 187 MB | 0,9186 | 0,9970 | 0,9999 | 0,9922 | 0,9544 | 0,7874 | 185 | 0,616 |
| `int8_minmax_u8` | int8 estática QDQ, MinMax, activaciones sin signo, pesos 7 bits | 187 MB | 0,9153 | 0,9960 | 0,9999 | 0,9926 | 0,9533 | 0,7954 | 365 | 0,801 |
| `int8_minmax_lin` | int8 estática QDQ, MinMax, productos de atención en float | 186 MB | 0,9192 | 0,9969 | 0,9999 | 0,9927 | 0,9528 | 0,7931 | 298 | 0,775 |
| `int8_minmax_lin_fout` | como `int8_minmax_lin`, salidas de MatMul en float | 186 MB | 0,9293 | 0,9968 | 0,9999 | 0,9931 | 0,9540 | 0,7943 | 208 | 0,577 |
| `int8_minmax_x20` | como `int8_minmax_lin`, 9 nodos MatMul más en float | 244 MB | 0,9253 | 0,9969 | 0,9999 | 0,9931 | 0,9530 | 0,7908 | 203 | 0,506 |
| `int8_minmax_x25` | como `int8_minmax_lin`, 20 nodos MatMul más en float | 300 MB | 0,9248 | 0,9967 | 0,9999 | 0,9918 | 0,9547 | 0,7931 | 171 | 0,535 |
| `int8_minmax_x30` | como `int8_minmax_lin`, 75 nodos MatMul y 3 convoluciones en float | 657 MB | 0,9312 | 0,9969 | 0,9999 | 0,9927 | 0,9553 | 0,7897 | 10 | 0,078 |

Con el proveedor TensorRT construyendo un motor de 16 bits desde `fp32`, las puntuaciones en el mismo orden de columnas son 0,9308, 0,9969, 0,9999, 0,9927, 0,9558 y 0,7862, con 3 decisiones cambiadas.

### Latencia

Tiempo mediano de una llamada que calcula el espectrograma log-mel y ejecuta el codificador, en milisegundos. "Capas 1-12" es la llamada para VAD y preguntas de hablante; "capas 1-18" añade fin de turno. Los datos disponibles corresponden a una NVIDIA L4 (23 GB) con CPU AMD EPYC 7542. Los motores TensorRT se construyeron para lotes de 1 a 32 (optimizado para 16).

| Variante | Capas 1-12, lote 1 | Capas 1-12, lote 16 | Capas 1-18, lote 1 | Capas 1-18, lote 16 | Ventanas/s (1-12, lote 16) |
|---|---:|---:|---:|---:|---:|
| PyTorch bf16 (referencia) | 11,1 | 34,3 | 11,5 | 40,0 | 464,1 |

No se dispone de la tabla completa de latencias para las variantes ONNX en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo base es Qwen/Qwen3-ASR-0.6B, pero no se han publicado datos comparativos con otras torres de audio o sistemas de diarización en la documentación disponible.

## Limitaciones y advertencias

- El paquete contiene únicamente el codificador de audio; el decodificador de texto no está incluido, por lo que no cubre preguntas de idioma ni terminología.
- Las cabezas de decisión y lecturas permanecen en el repositorio base `charcot-ai/marimba`; este paquete no es autónomo para las tareas finales.
- La mayoría de las variantes int8 cambian notablemente las puntuaciones de fin de turno: `int8_minmax` cambia 308 decisiones y `int8_minmax_u8` cambia 365, frente a 0 de `fp32`. Es necesario consultar la tabla de evaluación antes de elegir una variante.
- La variante `int8_percentile` reduce el AUROC de fin de turno a 0,9186, y `int8_minmax_u8` a 0,9153, frente a 0,9310 de la referencia.
- El recuento de hablantes tiene una exactitud moderada (0,7862 en la referencia), por lo que no es adecuado para aplicaciones que requieran recuento exacto.
- El procesamiento está limitado a ventanas de 8 segundos; no se especifica soporte para audio de mayor duración en una sola llamada.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del codificador de audio.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-ASR-0.6B para el componente de audio.
- Las latencias publicadas corresponden a una NVIDIA L4 con CPU AMD EPYC 7542; el rendimiento en otro hardware puede variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-onnxruntime
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Modelo de origen de la torre de audio: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
