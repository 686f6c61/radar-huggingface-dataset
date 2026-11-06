# iazShadow/mossformer2-ss-16k-onnx

## Resumen

MossFormer2_SS_16K en formato ONNX es la conversion del modelo de separacion de habla de dos hablantes desarrollado por el Speech Lab del Grupo Alibaba dentro del proyecto ClearerVoice-Studio. El modelo original, `alibabasglab/MossFormer2_SS_16K`, es una red neuronal disenada para tomar una grabacion mono en la que dos personas hablan simultaneamente y devolver dos pistas de audio separadas, una por voz. Esta version concreta ha sido exportada a ONNX por el publicador iazShadow sin reentrenamiento ni cuantizacion, manteniendo los pesos originales intactos.

La relevancia de esta conversion reside en que elimina la dependencia del framework PyTorch en produccion: el grafo ONNX puede ejecutarse con onnxruntime en CPU, lo que facilita su integracion en aplicaciones de escritorio, asistentes de reuniones offline o pipelines de audio sin GPU. El modelo trabaja a una frecuencia de muestreo de 16 kHz, que es el estandar habitual en telefonia y en la mayoria de los sistemas de reconocimiento automatico del habla.

El artefacto ocupa aproximadamente 228 MB en precision float32 y expone una interfaz sencilla de una entrada y una salida con longitud dinamica, lo que permite procesar fragmentos de audio de distinta duracion siempre que se respete la restriccion de alineamiento de la longitud de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (transformer con atencion lineal y mecanismos recurrentes, segun el modelo original) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de longitud dinamica con restriccion T = 2048·k + 8 muestras |
| Tipos de cuantizacion | no disponible (el archivo publicado es float32 sin cuantizar) |
| Idiomas soportados | no disponible (modelo agnostico al idioma, opera sobre senal de voz) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, precision float32) |

## Arquitectura y entrenamiento

El modelo subyacente es MossFormer2, la segunda generacion de la familia MossFormer desarrollada por el Speech Lab de Alibaba para tareas de separacion de habla. La arquitectura combina mecanismos de atencion con componentes recurrentes y esta disenada especificamente para separar fuentes de audio superpuestas en el dominio temporal, a diferencia de aproximaciones clasicas basadas en espectrogramas. El modelo original fue entrenado por los autores de ClearerVoice-Studio sobre conjuntos de datos abiertos y privados a gran escala, aunque esta conversion no detalla la composicion exacta del corpus ni el numero de tokens o horas de audio empleados.

La conversion a ONNX se realizo con PyTorch 2.11.0 en CPU mediante `torch.onnx.export` con enfoque TorchScript, exportando a opset 17 con longitud de entrada dinamica. Antes de la exportacion se desactivo la cache de embeddings posicionales rotatorios para que el grafo no dependiera de la longitud vista durante el trazado. Se anadieron metadatos al modelo (`model_type`, `sample_rate`, `align`, `align_tail`, `license`, `source`). La verificacion numerica reportada indica una diferencia maxima inferior a 2.3·10⁻³ respecto al pico de la senal entre la salida ONNX y la del modelo PyTorch original. No se aplico fine-tuning ni cuantizacion.

## Capacidades

- Separacion de habla de dos hablantes simultaneos a partir de una mezcla mono a 16 kHz.
- Entrada de longitud dinamica con restriccion de alineamiento (T = 2048·k + 8 muestras).
- Salida de dos pistas de audio de la misma longitud y frecuencia de muestreo que la entrada.
- Ejecucion en CPU mediante onnxruntime, sin necesidad de GPU.
- Independiente del idioma: opera sobre caracteristicas acusticas, no sobre texto.
- Integrable en pipelines de audio-to-audio dentro de aplicaciones de escritorio o servidor.

## Casos de uso

- Asistentes de reuniones offline: el modelo se usa para recuperar el habla perdida en fragmentos donde dos participantes se solapan. La aplicacion descarga el archivo solo cuando el usuario lo solicita y procesa ventanas de hasta 10 segundos alrededor de cada solapamiento, lo que encaja con el consumo de memoria observado (1.6-1.8 GB para 10 s).
- Transcripcion automatica de reuniones y entrevistas: antes de pasar el audio a un sistema ASR, se separan las voces superpuestas para reducir errores de reconocimiento en los tramos de habla simultanea.
- Postproduccion de podcasts y grabaciones: separar dos locutores que hablan a la vez permite editar, ecualizar o nivelar cada voz de forma independiente.
- Analisis forense de audio: aislar cada interlocutor en una grabacion para su estudio o para alimentar herramientas de identificacion de hablante.
- Preprocesado para diarizacion: la separacion previa simplifica la asignacion de turnos de palabra cuando los hablantes se pisan.
- Prototipado e investigacion en separacion de fuentes: el formato ONNX permite desplegar el modelo en entornos sin PyTorch, como aplicaciones moviles, navegadores o sistemas embebidos con onnxruntime.
- Sistemas de subtitulado en directo: procesar ventanas cortas de audio en CPU para separar voces antes de la transcripcion en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de rendimiento de inferencia en CPU:

| Metrica | Valor |
|---|---|
| Factor de tiempo real (RTF) | ≈ 1.8-1.9 en CPU x64 de escritorio con 4 hilos |
| Memoria pico del proceso | ≈ 1.6-1.8 GB para 10 s de audio |
| Memoria pico del proceso | ≈ 3 GB para 25 s de audio |
| Diferencia maxima vs. PyTorch | < 2.3·10⁻³ del pico de la senal |

## Requisitos de hardware

- Inferencia en CPU viable con onnxruntime: RTF de aproximadamente 1.8-1.9 con 4 hilos en un procesador x64 de escritorio, es decir, ligeramente mas lento que tiempo real.
- Memoria RAM: alrededor de 1.6-1.8 GB de pico para ventanas de 10 segundos y unos 3 GB para 25 segundos; el consumo crece con la longitud de la entrada.
- GPU no necesaria; el modelo esta pensado para ejecucion en CPU. No se documentan requisitos ni rendimiento en GPU (A100, H100, RTX 4090, etc.).
- No cabe plantear despliegue en GPUs de consumo como requisito, ya que el artefacto esta orientado a CPU; el modelo pesa 228 MB en float32.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider documentado); cualquier runtime compatible con ONNX opset 17.
- Estrategia recomendada para grabaciones largas: procesar en ventanas (el autor usa ventanas de hasta 10 s) y recortar la salida a la longitud original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossFormer2_SS_16K ONNX (este) | no disponible | Audio 16 kHz, longitud dinamica (T = 2048·k + 8) | ONNX float32 | Apache 2.0 | Hugging Face |
| MossFormer2_SS_16K (original, alibabasglab) | no disponible | Audio 16 kHz | PyTorch (checkpoint) | Apache 2.0 | Hugging Face |
| Otros modelos de separacion de habla de dos hablantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Solo separa dos hablantes; con tres o mas voces simultaneas el resultado no es fiable.
- Las interjecciones muy cortas o apenas audibles pueden resultar ininteligibles tras la separacion.
- La longitud de entrada debe cumplir T = 2048·k + 8; otras longitudes fallan dentro del grafo. Es necesario rellenar con ceros y recortar la salida.
- Las voces de salida no estan normalizadas y su orden es arbitrario; hay que escalarlas y asignarlas segun convenga en cada aplicacion.
- El consumo de memoria crece con la longitud de la entrada, por lo que las grabaciones largas deben procesarse por ventanas.
- No se documentan sesgos especificos ni el idioma o dominio de entrenamiento; el modelo original se entreno con datos abiertos y privados no detallados en esta conversion.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede producir artefactos o residuos en la senal separada en condiciones acusticas adversas.
- Licencia Apache 2.0, que permite uso comercial con atribucion; es necesario conservar los avisos de copyright de la obra original (Speech Lab, Alibaba Group y contribuidores de ClearerVoice-Studio) y del trabajo derivado.
- El autor advierte que la aplicacion que lo usa solo descarga el modelo cuando el usuario lo solicita; conviene replicar ese comportamiento en despliegues propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iazShadow/mossformer2-ss-16k-onnx
- Modelo original: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- Repositorio ClearerVoice-Studio: https://github.com/modelscope/ClearerVoice-Studio
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
