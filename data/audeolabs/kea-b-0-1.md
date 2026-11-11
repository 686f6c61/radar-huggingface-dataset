# audeolabs/kea-b-0.1

## Resumen

Kea-B 0.1 es un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado por audeolabs (con origen en wildernesslabs), derivado por ajuste fino del modelo NVIDIA Parakeet-TDT-0.6B-v2. Su propuesta central es la compresión extrema: casi la totalidad de los pesos se almacenan en 1 bit (+1 o −1 con una escala por fila) y el decodificador en enteros de 8 bits, lo que reduce el modelo de 2.472 MB a 91,24 MB manteniendo una precisión cercana al original. Emplea una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) y se distribuye en formato NeMo.

El modelo resuelve el problema del despliegue de ASR de alta calidad en entornos con recursos limitados: con menos de 100 MB de pesos puede ejecutarse en dispositivos de borde, CPUs y GPUs modestas, algo inviable para el Parakeet original. Frente a su predecesor Kea-B 0.0 (105,3 MB, 7,05 % de WER medio) mejora tanto en tamano como en exactitud (6,77 % de WER medio), y supera tambien a Kea-T de 2 bits (6,84 %) con aproximadamente la mitad de tamano.

La relevancia actual reside en la combinacion de cuantizacion binaria con entrenamiento consciente de cuantizacion (QAT) y destilacion de conocimiento, orientados especificamente a los kernels INT8 x 1-bit del autor. Esta ficha cubre sus especificaciones, arquitectura, capacidades, rendimiento declarado y limitaciones para evaluacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), derivada de NVIDIA Parakeet-TDT-0.6B-v2 |
| Parametros totales | no disponible (modelo base Parakeet-TDT-0.6B-v2: 0,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio; ventana de atencion no especificada en la informacion) |
| Tipos de cuantizacion | Pesos en 1 bit (+1/−1 con una escala por fila) y decodificador en INT8; reconstruible en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (repositorio de 0,2 GB; pesos binarios de 91,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Parakeet-TDT-0.6B-v2, un sistema ASR de NVIDIA basado en FastConformer con decodificador TDT. Sobre esa base, audeolabs aplica un proceso de compresion agresiva: casi todos los pesos se representan como valores binarios (+1 o −1) con una unica escala por fila, mientras que las redes de prediccion y joint del decodificador pasan de FP16 a INT8. El resultado ocupa 91,24 MB frente a los 2.472 MB del original.

El entrenamiento combina cuantizacion consciente (QAT) con destilacion de conocimiento. La mejora clave respecto a Kea-B 0.0 es el profesor: en lugar de las salidas del propio modelo original, se utiliza un Parakeet de precision completa ajustado con transcripciones generadas por IBM Granite Speech, lo que proporciona etiquetas de mayor calidad. Ademas, durante el entrenamiento las activaciones pasan por el mismo redondeo INT8 que emplean los kernels de GPU del autor, de modo que la precision se mantiene al ejecutar en ellos. Los datos de entrenamiento incluyen espnet/yodas-granary, MLCommons/peoples_speech, openslr/librispeech_asr, facebook/voxpopuli y edinburghcstr/ami, ademas de audio de Common Voice (con hablantes y frases de test eliminados).

## Capacidades

- Reconocimiento de voz en ingles sobre audio de diversa procedencia: lectura limpia, habla conversacional, reuniones, discursos y dominios financieros.
- Transcripcion con decodificacion greedy y salida de texto; el pipeline declarado es automatic-speech-recognition.
- Robustez mejorada frente a 0.0 en audio dificil (el autor indica entrenamiento con audio mas duro, aunque el detalle queda truncado en la informacion disponible).
- Ejecucion eficiente gracias a pesos de 1 bit y decodificador INT8, pensada para los kernels INT8 x 1-bit del autor.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento (no aplica a un modelo ASR).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion en dispositivos de borde: con 91,24 MB de pesos, el modelo cabe en moviles, Raspberry Pi o sistemas embebidos para dictado offline y subtitulado local sin conexion.
- Subtitulado y actas de reuniones: su WER de 9,89 % en AMI lo hace util para transcribir reuniones multiparticipe, aunque requiere revision humana en segmentos solapados.
- Atencion al cliente y centros de contacto: transcripcion de llamadas grabadas para analitica y control de calidad, con la ventaja de un coste de almacenamiento e inferencia minimo.
- Dominio financiero: con 3,67 % de WER en SPGISpeech, es adecuado para transcribir earnings calls y comunicaciones corporativas.
- Procesamiento por lotes a gran escala: el reducido tamano permite desplegar muchas instancias en una sola GPU o en flotas de CPU, abaratando la transcripcion masiva de archivos de audio.
- Investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar QAT binario y destilacion en ASR, dado que el autor publica metodologia y numeros de evaluacion.
- Preprocesado de pipelines de datos de voz: generar transcripciones para entrenar o filtrar corpus de audio en ingles con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER %, decodificacion greedy, menor es mejor; pesos reconstruidos en FP32):

| Modelo | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media de 7 | Common Voice |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original (Parakeet-TDT-0.6B-v2, cifras de NVIDIA) | 1,69 | 3,19 | 11,16 | 11,15 | 9,74 | 2,17 | 5,95 | 6,44 | n/a |
| Kea-T | 2,05 | 4,20 | 10,42 | 11,72 | 10,35 | 2,94 | 6,19 | 6,84 | 12,56 |
| Kea-B 0.0 | 2,20 | 4,56 | 10,65 | 12,17 | 10,46 | 3,01 | 6,30 | 7,05 | 13,42 |
| **Kea-B 0.1 (este modelo)** | 2,07 | 4,32 | 9,89 | 10,86 | 10,29 | 3,67 | 6,29 | 6,77 | 11,35 |

El autor indica que, sobre sus kernels INT8 x 1-bit, la media es 6,77 % y ningun conjunto varia mas de 0,05 puntos. La puntuacion de Common Voice no es comparable con las demas porque el modelo se entreno con audio de ese corpus (hablantes y frases de test eliminados). Los resultados figuran como no verificados en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la practica, dado que los pesos ocupan 91,24 MB y el decodificador va en INT8; el pico depende de la longitud del audio y del backend.
- GPU recomendadas: no especificadas en la informacion disponible; el autor menciona kernels propios INT8 x 1-bit para GPU, sin detallar modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: por tamano, si; no se documentan GPUs concretas compatibles ni requisitos minimos.
- Opciones de despliegue: NeMo (libreria declarada); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de modelo ASR.
- Latencia y throughput: no disponibles. El autor afirma que la precision se mantiene en sus kernels, pero no publica cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Tamano de pesos | Arquitectura | WER medio (7 conjuntos) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Kea-B 0.1 | 91,24 MB | FastConformer + TDT, 1 bit + INT8 | 6,77 % | CC-BY-4.0 | Hugging Face (audeolabs) |
| Kea-B 0.0 | 105,3 MB | FastConformer + TDT (derivado) | 7,05 % | no disponible en la informacion | Hugging Face (wildernesslabs) |
| Kea-T | no disponible | FastConformer + TDT, 2 bits | 6,84 % | no disponible en la informacion | Hugging Face (wildernesslabs) |
| Parakeet-TDT-0.6B-v2 | 2.472 MB | FastConformer + TDT, precision completa | 6,44 % | no disponible en la informacion | Hugging Face (NVIDIA) |

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, lo que descarta su uso en entornos multilingues sin modelos adicionales.
- Brecha de precision frente al original: 6,77 % frente a 6,44 % de media; en SPGISpeech empeora notablemente (3,67 % frente a 2,17 %) y en Earnings-22 mejora (10,86 % frente a 11,15 %).
- Evaluacion no verificada: los resultados del model-index figuran como no verificados y proceden del propio autor.
- Sesgos: no se documentan analisis de sesgo por acento, genero, edad o dialecto; al entrenarse con corpus mayoritariamente estadounidenses y britanicos, el rendimiento puede degradarse con otras variedades.
- Riesgo de error en audio dificil: WER cercano al 10 % en AMI y GigaSpeech implica necesidad de revision humana en produccion.
- Dependencia de kernels propios: el autor afirma que la precision se mantiene en sus kernels INT8 x 1-bit; fuera de ellos, el comportamiento puede diferir y no se detalla.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar las condiciones del modelo base NVIDIA y de los corpus de entrenamiento.
- Common Voice no comparable: el modelo se entreno con audio de ese corpus, por lo que su cifra de 11,35 % no es equiparable a la de los demas modelos.
- Sin datos de latencia, throughput ni VRAM pico publicados, lo que dificulta dimensionar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audeolabs/kea-b-0.1
- Modelo base declarado: https://huggingface.co/wildernesslabs/kea-b
- Predecesor Kea-B 0.0: https://huggingface.co/wildernesslabs/kea-b
- Kea-T (2 bits): https://huggingface.co/wildernesslabs/kea-t
- NVIDIA Parakeet-TDT-0.6B-v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Documento de evaluacion (EVALUATION.md): referenciado en la model card, sin URL directa disponible
- Conjuntos de datos: https://huggingface.co/datasets/espnet/yodas-granary, https://huggingface.co/datasets/MLCommons/peoples_speech, https://huggingface.co/datasets/openslr/librispeech_asr, https://huggingface.co/datasets/facebook/voxpopuli, https://huggingface.co/datasets/edinburghcstr/ami
