# claroche1/sparse-nsnet2-checkpoints

## Resumen

sparse-nsnet2-checkpoints es una colección de checkpoints de mejora de voz (speech enhancement) basada en la arquitectura NSNet2, publicada por el usuario claroche1 en Hugging Face. El problema que resuelve es la supresión de ruido en señales de voz manteniendo la inteligibilidad: recibe la magnitud de un espectrograma y devuelve una versión limpia, de modo que puede usarse como preprocesado de sistemas de reconocimiento automático del habla (ASR), telefonía o audífonos. La novedad del repositorio no es el modelo base, sino el barrido de compresión: las capas totalmente conectadas (FC) y las proyecciones de las GRU se sustituyen por factorizaciones estructuradas del tipo Butterfly, block-diagonal y Monarch genuino de dos factores, con el objetivo de reducir parámetros manteniendo la calidad perceptual.

La relevancia actual viene de dos resultados concretos del barrido. Por un lado, el modelo `monarch_40` alcanza paridad con el baseline denso usando 24 veces menos parámetros (2,837 frente a 2,845 PESQ, diferencia dentro del ruido de la métrica). Por otro, Monarch mantiene la propiedad de ser «loss-free» en int8 a lo largo de todo el barrido de bloques, mientras que la variante block-diagonal se degrada a medida que los bloques se estrechan. El autor documenta además dos correcciones importantes sobre versiones anteriores: el renombrado de los antiguos `monarch_*` (que en realidad eran block-diagonal de un solo factor) y la re-cuantización real de los pesos estructurados a int8.

El modelo es monolingüe en el sentido de que se entrena sobre un corpus en inglés (VoiceBank-DEMAND-16k), pero la tarea de supresión de ruido es en gran medida independiente del idioma. La licencia es MIT, el tamaño del repositorio es de 0,3 GB y el modelo más grande de la colección tiene 3,64 M de parámetros, por lo que se trata de un modelo de borde (edge), no de un modelo generativo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NSNet2 (red recurrente con capas FC y GRU); las FC y las proyecciones de las GRU son intercambiables entre densas, Butterfly, block-diagonal y Monarch de dos factores |
| Parametros totales | Depende del checkpoint: de 0,117 M (`monarch_40`) a 3,64 M (`wide_monarch`). Baseline denso de referencia: 2,78 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo frame a frame sobre espectrograma; ventana STFT con n_fft = 512) |
| Tipos de cuantizacion | FP32 e int8 (ONNX estático con QDQ, incluyendo los pesos estructurados `Einsum`) |
| Idiomas soportados | Inglés (`en`) en los datos de entrenamiento; la tarea de supresión de ruido es intrínsecamente independiente del idioma |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints) y ONNX (incluye exportaciones int8) |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | JacobLinCool/VoiceBank-DEMAND-16k |
| Metrica declarada | PESQ (sobre las 824 locuciones del split de test completo) |

## Arquitectura y entrenamiento

NSNet2 es una red neuronal recurrente diseñada para mejora de voz en tiempo real. Opera sobre la magnitud de un espectrograma calculado con `n_fft = 512`, y su cuerpo combina capas totalmente conectadas con capas GRU. En esta colección, el autor sustituye las proyecciones densas de esas capas por factorizaciones estructuradas de bajo rango: Butterfly (producto de matrices dispersas y permutaciones), block-diagonal (una matriz diagonal por bloques, sin mezcla entre bloques) y Monarch, que es una construcción genuina de dos factores (block-diagonal × permutación × block-diagonal) con mezcla completa entre canales. El eje de compresión es el número de bloques `nblocks`, que se barre de 5 a 40 manteniendo fija la arquitectura `*_8` (hidden 400, fc 600, ambas FC y ambas proyecciones de GRU estructuradas), de modo que solo cambian los parámetros.

El entrenamiento se realizó sobre VoiceBank-DEMAND-16k con tamaño de lote 256, y todos los checkpoints publicados son los mejores en PESQ de un barrido de compresión. La innovación técnica que documenta el autor es doble. Primero, la comparación controlada entre familias estructuradas y modelos densos del mismo número de parámetros: los controles densos (`dense_h*`) pierden entre 0,021 y 0,086 PESQ frente a Monarch a igual presupuesto de parámetros, lo que indica que la conectividad de Monarch, y no solo el ancho efectivo, es lo que importa. Segundo, el arreglo del pipeline de cuantización: la exportación que preserva la estructura baja cada matmul block-diagonal/Monarch a un `Einsum`, y onnxruntime no incluye un handler QDQ para `Einsum`, por lo que la cuantización estática previa saltaba esos nodos y dejaba los pesos dominantes en FP32. Todos los ficheros int8 del repositorio han sido re-cuantizados con los pesos estructurados realmente en int8.

## Capacidades

- Supresión de ruido y mejora de voz: estima la magnitud limpia del espectrograma a partir de una señal ruidosa, con salida en el dominio espectral (requiere etapa STFT/ISTFT externa).
- Operación frame a frame con latencia potencialmente baja, apta para streaming, dado que NSNet2 es una arquitectura recurrente en tiempo real.
- Compresión agresiva: variantes desde 0,117 M de parámetros, pensadas para despliegue en dispositivos con recursos muy limitados.
- Cuantización int8 prácticamente sin pérdida en la familia Monarch, lo que permite reducir el coste de memoria y de cómputo sin degradar el PESQ.
- Exportación a ONNX y ejecución con onnxruntime, además de PyTorch.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión ni audio generativo. Es un modelo de una sola tarea.

## Casos de uso

- Preprocesado de ASR en producción: insertar el modelo antes del decodificador acústico para reducir la tasa de error en entornos ruidosos; al ser recurrentes y pequeños, los checkpoints `monarch_8` o `monarch_40` pueden ejecutarse dentro del mismo pipeline de inferencia sin añadir apenas latencia.
- Limpieza de audio en llamadas VoIP o videoconferencia: aplicar la mejora sobre la señal de micrófono antes de codificar, aprovechando el tamaño reducido (0,55 M de parámetros en `monarch_8`) para correr en el propio dispositivo del usuario.
- Audífonos y dispositivos de ayuda auditiva: `monarch_40` alcanza paridad con el baseline denso con 24 veces menos parámetros, lo que encaja en presupuestos de cómputo y memoria típicos de DSP o microcontroladores con aceleración int8.
- Acondicionamiento de corpus de voz: procesar grabaciones ruidosas antes de usarlas para entrenar o evaluar modelos de reconocimiento, diarización o síntesis, reduciendo el coste de re-grabación.
- Robots y asistentes de voz en el borde: ejecutar la mejora en el dispositivo mediante la exportación ONNX int8, evitando enviar audio crudo a la nube por privacidad y ancho de banda.
- Restauración de archivos históricos o grabaciones de campo: aplicar el modelo sobre material con ruido estacionario de fondo, midiendo el resultado con PESQ si se dispone de referencia limpia.
- Evaluación comparativa de métodos de compresión: el repositorio sirve como banco de pruebas reproducible para comparar Butterfly, block-diagonal y Monarch bajo el mismo protocolo de entrenamiento, mismo dataset y mismo split de test de 824 locuciones.

## Benchmarks y rendimiento

Todos los valores de PESQ proceden del split de test completo de 824 locuciones. `int8` corresponde a pesos estructurados realmente cuantizados.

Monarch genuino de dos factores:

| Run | Parametros | PESQ FP32 | PESQ int8 | Delta (FP32 a int8) |
|---|---:|---:|---:|---:|
| `wide_monarch` | 3,64 M | 2,881 | 2,884 | −0,003 |
| `monarch_8` | 0,55 M | 2,861 | 2,856 | +0,005 |
| `monarch_fc` | 2,38 M | 2,843 | 2,831 | +0,012 |
| `monarch_full` | 1,10 M | 2,838 | 2,846 | −0,009 |

Barrido de `nblocks` (5 a 40) para ambas familias, con la arquitectura `*_8` fija. Baseline denso de referencia: 2,845 FP32 / 2,834 int8 con 2,78 M.

| nblocks | Params block-diagonal | FP32 | int8 | Delta int8 | Params monarch | FP32 | int8 | Delta int8 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 | 0,563 M | 2,826 | 2,793 | +0,033 | 0,880 M | 2,852 | 2,858 | −0,007 |
| 8 | 0,355 M | 2,832 | 2,825 | +0,007 | 0,553 M | 2,861 | 2,856 | +0,005 |
| 10 | 0,285 M | 2,772 | 2,744 | +0,028 | 0,443 M | 2,849 | 2,842 | +0,007 |
| 20 | 0,146 M | 2,719 | 2,627 | +0,092 | 0,225 M | 2,849 | 2,854 | −0,005 |
| 40 | 0,077 M | 2,608 | 2,455 | +0,153 | 0,117 M | 2,837 | 2,837 | 0,000 |

Controles densos ajustados por número de parámetros (hidden y fc escalados juntos en la proporción original 1,5):

| Parametros | Block-diagonal | Denso | Monarch | Denso − Monarch |
|---:|---:|---:|---:|---:|
| 0,88 M | — | 2,806 | 2,852 | −0,046 |
| 0,55 M | 2,826 | 2,840 | 2,861 | −0,021 |
| 0,44 M | — | 2,815 | 2,849 | −0,034 |
| 0,23 M | 2,719 | 2,784 | 2,849 | −0,065 |
| 0,12 M | — | 2,751 | 2,837 | −0,086 |
| 0,08 M | 2,608 | 2,749 | — | — |

Conclusiones cuantitativas que reporta el autor: sobre `nblocks` 5→40, block-diagonal pierde 0,218 PESQ en FP32 y su penalización int8 crece de 0,033 a 0,153 (0,338 en términos int8); Monarch se mueve 0,015 en FP32 y se mantiene sin pérdida en int8 (exactamente 0,000 en `nblocks` 40). `monarch_40` (0,117 M) supera a `blockdiag_20` (0,146 M) en 0,130 FP32 y 0,227 int8. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un modelo de mejora de voz.

## Requisitos de hardware

- VRAM estimada a partir del número de parámetros (cálculo propio, no dato publicado): `wide_monarch` con 3,64 M de parámetros ocupa aproximadamente 14,6 MB de pesos en FP32 y unos 3,6 MB en int8; `monarch_40` con 0,117 M ocupa unos 0,47 MB en FP32 y unos 0,12 MB en int8. A esto hay que sumar las activaciones, las tablas STFT y los buffers de audio.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU. No se requiere A100, H100 ni RTX 4090; una RTX 4090 o una GPU integrada son igualmente válidas y estarán sobredimensionadas.
- Despliegue recomendado: ONNX Runtime para las exportaciones int8 (es el formato que el autor usa para medir), PyTorch para los checkpoints originales. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no aplican a este caso.
- Latencia, throughput y consumo: no disponible en la información proporcionada.

## Comparativa con modelos similares

Comparativa interna entre checkpoints del propio repositorio, todos con el mismo protocolo de entrenamiento y evaluación, lo que la hace directamente utilizable:

| Modelo | Parametros | Contexto | PESQ FP32 | PESQ int8 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| `wide_monarch` | 3,64 M | no aplica | 2,881 | 2,884 | MIT | Hugging Face |
| `monarch_8` | 0,55 M | no aplica | 2,861 | 2,856 | MIT | Hugging Face |
| `monarch_40` | 0,117 M | no aplica | 2,837 | 2,837 | MIT | Hugging Face |
| Baseline denso NSNet2 | 2,78 M | no aplica | 2,845 | 2,834 | MIT | Hugging Face |
| `blockdiag_20` | 0,146 M | no aplica | 2,719 | 2,627 | MIT | Hugging Face |

No se dispone de datos en la información proporcionada para comparar con alternativas externas de la misma categoría (por ejemplo, otras redes de supresión de ruido entrenadas sobre VoiceBank-DEMAND), por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- El ruido de entrenamiento proviene de DEMAND, que es mayoritariamente estacionario y no contiene ruido de habla competitivo ni reverberación fuerte; el rendimiento fuera de esa distribución puede degradarse de forma notable.
- Los datos de entrenamiento son en inglés. Aunque la tarea es en gran medida independiente del idioma, no hay evaluación publicada en otros idiomas ni con acentos no representados en VoiceBank.
- Riesgo de artefactos y de sobre-supresión: la mejora de voz puede introducir distorsión musical en el residuo e insertar artefactos que perjudiquen a un ASR aguas abajo, incluso cuando el PESQ sube. PESQ es además una métrica correlacionada de forma imperfecta con la calidad percibida.
- Diferencia de rendimiento frente a las métricas publicadas previamente: los modelos antes etiquetados como `monarch_*` eran block-diagonal de un solo factor. Quien tuviera fijado `monarch_8` obtendrá ahora un modelo distinto (Monarch genuino); el modelo block-diagonal anterior está en `blockdiag_8`. Hay que revisar cualquier integración que dependa de esas rutas.
- Los ficheros int8 anteriores no cuantizaban los pesos estructurados, porque onnxruntime no aplica QDQ a `Einsum`. Los ficheros actuales del repositorio sí lo hacen, pero conviene verificar la versión descargada antes de comparar números con publicaciones previas.
- La propiedad de que int8 no degrada el PESQ se cumple en los modelos medidos por el autor; no se ha validado en hardware, runtime u otros backends distintos de onnxruntime.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía. No se documentan restricciones adicionales, pero el usuario debe cumplir las condiciones del dataset VoiceBank-DEMAND subyacente si redistribuye datos derivados.
- Repositorio con 0 descargas y 0 likes, y sin pipeline declarado en Hugging Face: no hay validación de terceros ni soporte de la plataforma.
- No se documentan requisitos de hardware, latencia ni consumo, por lo que la idoneidad para un despliegue en tiempo real debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/claroche1/sparse-nsnet2-checkpoints
- Repositorio del barrido de compresión (eco8-neaixt): https://github.com/LarocheC/eco8-neaixt
- Dataset VoiceBank-DEMAND-16k: https://huggingface.co/datasets/JacobLinCool/VoiceBank-DEMAND-16k
- Paper de matrices Butterfly: https://arxiv.org/abs/1903.05895
- Paper de matrices Monarch: https://arxiv.org/abs/2204.00595
- Búsqueda web: no se han encontrado enlaces relevantes adicionales (los resultados devueltos corresponden a manuales financieros del Ministerio de Finanzas de Mauricio y no guardan relación con el modelo).
