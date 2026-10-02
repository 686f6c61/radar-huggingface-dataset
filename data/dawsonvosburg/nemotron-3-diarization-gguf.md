# dawsonvosburg/Nemotron-3-Diarization-gguf

## Resumen

Nemotron-3 Diarization es un modelo de diarizacion de hablantes (la tarea de determinar "quien habla y cuando") desarrollado por NVIDIA. Este repositorio concreto, `dawsonvosburg/Nemotron-3-Diarization-gguf`, no es un modelo nuevo ni un ajuste: es un espejo sin modificar del archivo `nemotron-3-diarization-Q8_0.gguf` publicado previamente por la organizacion Glimpse-Dictation. El autor lo mantiene unicamente para que la descarga fijada (pinneada) de su aplicacion siga disponible; los bytes del archivo son identicos al original, verificado mediante sha256.

El modelo subyacente es la version Streaming Sortformer v3 de NVIDIA, una arquitectura de diarizacion en streaming que resuelve el problema de "quien habla cuando" para hasta 8 hablantes con una resolucion temporal de 10 ms y sin producir texto. La entrada es audio mono a 16 kHz. Cuenta con aproximadamente 99,2 millones de parametros y se distribuye en formato GGUF cuantizado a Q8_0, lo que reduce el peso a 106 MB.

Su relevancia practica es doble: por un lado, la licencia OpenMDW 1.1 de NVIDIA permite uso comercial; por otro, el formato GGUF y el peso reducido lo hacen apto para ejecucion en local. Sin embargo, requiere un runtime especifico, transcribe.cpp con la arquitectura `nemotron3_diar`, que todavia no esta integrada en la rama principal de dicho proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v3 (transformer con sort loss para diarizacion) |
| Parametros totales | 99.226.504 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, no aplica ventana de texto) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado en este repo) |
| Idiomas soportados | en (segun la model card; la tarea de diarizacion es acustica) |
| Licencia | OpenMDW License Agreement 1.1 (permite uso comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es NVIDIA Nemotron-3 Diarization, denominado Streaming Sortformer v3. Sortformer es una familia de modelos de diarizacion basada en transformer que aborda el problema de permutacion de hablantes mediante una funcion de perdida de ordenacion (sort loss), en lugar de requerir agrupamiento posterior. La variante v3 es la version en streaming, disenada para procesar audio de forma continua con una resolucion de 10 ms y soporte de hasta 8 hablantes simultaneos. La entrada esperada es audio mono a 16 kHz y la salida es exclusivamente temporal (etiquetas de hablante), sin transcripcion de texto.

El archivo de este repositorio no fue entrenado ni ajustado por el autor: deriva del `model.safetensors` en fp32 de `nvidia/Nemotron-3-Diarization` (revision `a435e9867d79e789e90053f9b6d6834053af564a`), convertido por Glimpse-Dictation con `scripts/convert-nemotron3_diar.py` y posteriormente cuantizado con la herramienta `transcribe-quantize`. Los detalles completos de datos de entrenamiento, composicion del dataset y posibles fases de alineacion no se incluyen en esta ficha; la model card remite expresamente a la tarjeta oficial de NVIDIA.

## Capacidades

- Diarizacion de hablantes en streaming: identifica "quien habla cuando" de forma continua, sin necesidad de procesar el audio completo por adelantado.
- Soporte de hasta 8 hablantes distintos en una misma grabacion.
- Resolucion temporal de 10 ms para los cambios de turno de palabra.
- Deteccion de actividad de voz (pipeline declarado: `voice-activity-detection`).
- Entrada de audio mono a 16 kHz.
- Procesamiento sin generacion de texto: no transcribe, solo segmenta por hablante.
- No dispone de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje.
- No tiene capacidades de vision, audio generativo ni comprension semantica del contenido.

## Casos de uso

- Transcripcion con etiquetado de hablante: combinando este modelo con un motor ASR, se puede producir una transcripcion donde cada frase queda atribuida al hablante correcto, util para actas de reunion y subtitulado.
- Diagramado de reuniones y llamadas: al soportar hasta 8 hablantes, permite separar las intervenciones en conferencias, mesas redondas o sesiones de grupo sin post-procesado manual.
- Analitica de centros de atencion telefonica: la resolucion de 10 ms y el procesamiento en streaming permiten medir tiempos de habla por agente y cliente, detectar interrupciones y calcular ratios de participacion en tiempo real.
- Indexacion y busqueda de archivos de audio: al generar marcas temporales por hablante, facilita construir indices navegables de podcasts o entrevistas largas.
- Monitorizacion en vivo de reuniones: al ser streaming, puede alimentar un panel que muestre en directo quien esta interviniendo, sin esperar al final de la sesion.
- Preprocesado para pipelines de reconocimiento del habla: al aislar segmentos por hablante antes de pasarlos a un ASR, reduce errores de atribucion y mejora el rendimiento en audio solapado.
- Aplicaciones de dictado y notas de voz: integrable en herramientas que necesitan distinguir voces en grabaciones con varias personas, como la propia app de Glimpse para la que se mantiene este espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tarjeta oficial de NVIDIA para las cifras de precision y otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (el archivo pesa 106 MB); el equivalente en fp32 rondaria los 400 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta muy por debajo de los requisitos de una RTX 3060, RTX 4090, A100 o H100. Incluso modelos integrados son sobradamente capaces.
- Consumer GPU: si, cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU.
- Opciones de despliegue: transcribe.cpp con la arquitectura `nemotron3_diar`, disponible en la rama `glimpse-diarization` de LegendarySpy/transcribe.cpp. No esta soportado por llama.cpp, Ollama ni vLLM al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Formato | Licencia | Uso comercial |
|---|---|---|---|---|---|
| dawsonvosburg/Nemotron-3-Diarization-gguf (este) | 99.226.504 | Diarizacion streaming, 8 hablantes | GGUF Q8_0 | OpenMDW 1.1 | Si |
| nvidia/Nemotron-3-Diarization | 99.226.504 | Diarizacion streaming, 8 hablantes | safetensors (fp32) | OpenMDW 1.1 | Si |
| Glimpse-Dictation/Nemotron-3-Diarization-gguf | 99.226.504 | Diarizacion streaming, 8 hablantes | GGUF Q8_0 | OpenMDW 1.1 | Si |
| Modelos de diarizacion alternativos (por ejemplo, pyannote o variantes NeMo) | no disponible | Diarizacion | no disponible | no disponible | no disponible |

Las tres primeras filas corresponden al mismo conjunto de pesos redistribuido en distintos formatos y repositorios. No se dispone de datos verificados de otros modelos de diarizacion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial de NVIDIA: se trata de una conversion y redistribucion por parte de terceros (Glimpse-Dictation y, a su vez, este espejo).
- El repositorio es un espejo de bytes identicos; cualquier actualizacion o correccion de errores debe buscarse en el repositorio original de Glimpse-Dictation o en la tarjeta de NVIDIA.
- Requiere un runtime no estandar: transcribe.cpp con la arquitectura `nemotron3_diar`, que no forma parte de la rama principal del proyecto. Sin dicha rama, el archivo no es utilizable.
- Solo procesa entrada de audio mono a 16 kHz; no acepta otros formatos o frecuencias de muestreo directamente.
- Lengua declarada: ingles (`en`). Aunque la tarea de diarizacion depende de caracteristicas acusticas, no se garantiza un comportamiento equivalente en otros idiomas.
- Limite maximo de 8 hablantes; por encima de ese numero la atribucion puede degradarse.
- No produce transcripcion: para obtener texto hay que combinarlo con un modelo ASR independiente.
- Riesgo de confusion en audio con voces solapadas, ruido de fondo o calidad baja; no se dispone de cifras de error publicadas en este repositorio.
- La model card advierte de que las notas sobre sesgos, seguridad y privacidad deben consultarse en la tarjeta oficial de NVIDIA. La diarizacion puede revelar informacion sensible sobre la identidad de los hablantes.
- La licencia OpenMDW 1.1 permite uso comercial, pero sigue siendo propiedad de NVIDIA; se debe respetar el texto integro de la licencia.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/dawsonvosburg/Nemotron-3-Diarization-gguf
- Repositorio original del GGUF: https://huggingface.co/Glimpse-Dictation/Nemotron-3-Diarization-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Rama de transcribe.cpp con soporte `nemotron3_diar`: https://github.com/LegendarySpy/transcribe.cpp/tree/glimpse-diarization
- Licencia OpenMDW 1.1: incluida como `LICENSE` en el repositorio
- Aplicacion Glimpse: https://tryglimpse.cc
