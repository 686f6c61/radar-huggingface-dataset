# palli23/whisper-tiny-samromur-300h

## Resumen

whisper-tiny-samromur-300h es un ajuste fino de Whisper-Tiny (39M de parametros, 37.760.640 reales segun los pesos en safetensors) especializado en reconocimiento automatico del habla (ASR) en islandes. Lo publica el usuario palli23 en HuggingFace y forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). El modelo se ha entrenado sobre un subconjunto anidado de 300 horas del pool de escalado principal Miljon/samromur-500h, un corpus de habla islandesa.

El problema que aborda es concreto: los modelos ASR multilingues grandes funcionan razonablemente bien en islandes, pero su coste de inferencia y despliegue es alto para una unica lengua de ~350.000 hablantes. Este checkpoint explora hasta que punto un modelo tiny (39M) puede acercarse a esos gigantes multilingues cuando se le da suficiente datos especificos de dominio, manteniendo un coste computacional minimo.

Su relevancia es doble. Por un lado, es un artefacto de investigacion reproducible dentro de una serie de checkpoints con distintos volumenes de datos, lo que permite estudiar curvas de escalado en regimen de pocos parametros. Por otro, es un modelo practicamente desplegable en cualquier hardware: 0,3 GB de repositorio y menos de 40M de parametros lo hacen apto para CPU, movil o edge, aunque su alcance queda limitado al islandes y a la ventana de audio propia de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), entrada de espectrograma log-Mel |
| Parametros totales | 37.760.640 (aprox. 39M, etiquetado como Whisper-Tiny) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la arquitectura base Whisper-Tiny procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | No disponibles en la model card; al ser safetensors se puede convertir a fp16, int8 y GGUF con herramientas externas |
| Idiomas soportados | Islandes (is) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado en HuggingFace | No disponible |
| Fecha de creacion / ultima actualizacion | 2026-06-03 / 2026-09-15 |
| Descargas / likes | 4 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-Tiny sin modificaciones estructurales: un transformer encoder-decoder con atencion multi-cabeza, que recibe espectrogramas log-Mel calculados sobre ventanas de audio de 30 segundos y genera tokens de transcripcion de forma autorregresiva, con tokens especiales de idioma, tarea (transcripcion o traduccion) y marcas de tiempo. Whisper-Tiny es la variante mas pequena de la familia, con unos 39M de parametros, lo que explica tanto su reducido tamano en disco (0,3 GB) como su bajo coste de inferencia.

El entrenamiento consiste en un ajuste fino supervisado sobre un subconjunto anidado de 300 horas del pool Miljon/samromur-500h, que es un corpus de habla islandesa. El termino "nested subset" indica que ese subconjunto esta contenido dentro de un pool mayor de 500 horas y probablemente forma parte de una jerarquia de volumenes de datos crecientes usada para medir el efecto del tamano del corpus. La model card no documenta el numero de tokens de audio, la composicion exacta del dataset, la receta de hiperparametros ni si se aplicaron tecnicas de post-entrenamiento como RLHF, DPO o decodificacion especulativa; tampoco especifica si se partio de los pesos originales de OpenAI o de otro checkpoint intermedio. No hay informacion disponible sobre innovaciones tecnicas adicionales mas alla del propio escalado de datos.

## Capacidades

- Transcripcion de voz a texto en islandes, la unica tarea que la model card declara explicitamente y que corresponde al pipeline ASR.
- Manejo de audio en ventanas de 30 segundos propia de la arquitectura Whisper, con encadenamiento de ventanas para audios mas largos.
- Capacidad potencial de traduccion de voz a ingles y de deteccion de idioma heredada de los pesos base de Whisper, aunque no esta garantizada ni validada por el autor tras el ajuste fino monoingue.
- Generacion de marcas de tiempo (timestamps) a nivel de segmento, tambien heredada de Whisper, supeditada a que el ajuste fino haya preservado esos tokens.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, comportamiento agentico, vision, audio clasificatorio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado exclusivamente para islandes.

## Casos de uso

- Transcripcion de archivos de audio en islandes: el modelo convierte entrevistas, podcasts o notas de voz a texto plano con un coste computacional minimo, adecuado para procesamiento por lotes en CPU.
- Subtitulado automatico de video en islandes: gracias a la generacion de timestamps de Whisper, se pueden producir subtitulos sincronizados sin necesidad de un segundo modelo de alineacion.
- Investigacion sobre escalado de modelos ASR: al formar parte de una serie de checkpoints con distintos volumenes de datos, sirve para estudiar como evoluciona el WER al aumentar las horas de entrenamiento en un regimen de 39M de parametros.
- linea base (baseline) en comparativas academicas: es un punto de referencia barato para medir la brecha entre modelos tiny especializados y modelos multilingues grandes en lenguas de bajos recursos como el islandes.
- Despliegue en dispositivos con recursos limitados: con menos de 40M de parametros y 0,3 GB de pesos, cabe en moviles, Raspberry Pi o navegador mediante ONNX o WebAssembly para dictado offline en islandes.
- Transcripcion de reuniones y actas internas: en entornos donde la privacidad impide enviar audio a APIs en la nube, el modelo se puede ejecutar en local sobre CPU y procesar grabaciones por tramos de 30 segundos.
- Preservacion linguistica y archivado: digitalizacion de grabaciones historicas orales en islandes a gran escala, donde el coste por hora de audio es el factor determinante y la precision absoluta es secundaria frente al volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026) para consultar los resultados de WER y CER, pero esos valores no se incluyen en la ficha de HuggingFace y la busqueda web asociada no ha devuelto el documento. No se dispone por tanto de cifras verificables de WER, CER ni de comparaciones cuantitativas con otros checkpoints de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 150 MB de pesos mas activaciones; en fp16, unos 76 MB; en int8, unos 38 MB. Las activaciones de atencion sobre ventanas de 30 segundos anaden un consumo adicional moderado pero pequeno en terminos absolutos.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. Modelos como RTX 3060, RTX 4090, A100 o H100 lo ejecutan con una utilizacion marginal; el cuello de botella real es el preprocesado de audio, no la GPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, e incluso en GPUs integradas. Tambien es viable en CPU con latencias cercanas o inferiores al tiempo real.
- Opciones de despliegue: transformers con pipeline de automatic-speech-recognition, faster-whisper (CTranslate2) para mayor throughput, whisper.cpp y llama.cpp para entornos CPU/edge, ONNX Runtime y WebAssembly para navegador, y servidores como vLLM o TGI no estan orientados a este tipo de modelo aunque tecnicamente puedan servirlo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia dimensional, un modelo de 39M de parametros en una GPU moderna se sitúa en el orden de decenas de veces el tiempo real por lote, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Rendimiento en islandes |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-300h | 37,8M | ventanas de 30 s (arquitectura Whisper) | Islandes | CC-BY-SA-4.0 | No disponible (WER/CER remitidos al paper) |
| openai/whisper-tiny | 39M | ventanas de 30 s | Multilingue (99 idiomas) | Apache-2.0 | No disponible en esta informacion |
| openai/whisper-small | 244M | ventanas de 30 s | Multilingue (99 idiomas) | Apache-2.0 | No disponible en esta informacion |
| Otros checkpoints de la serie samromur (500h, volumenes intermedios) | 37,8M (misma base) | ventanas de 30 s | Islandes | CC-BY-SA-4.0 (segun el autor) | No disponible |

La comparacion cuantitativa de precision no es posible con los datos disponibles. La diferencia relevante frente a los modelos de OpenAI es de licencia y de especializacion: whisper-tiny-samromur-300h restringe su uso al islandes y adopta CC-BY-SA-4.0, mientras que los originales son multilingues y Apache-2.0. Frente a los demas checkpoints de la serie de escalado, la unica diferencia conocida es el volumen de horas de entrenamiento.

## Limitaciones y advertencias

- Alcance monoingue: el ajuste fino se ha realizado solo sobre islandes, por lo que es probable que haya degradado o anulado las capacidades multilingues de los pesos base de Whisper. No debe usarse para transcribir otros idiomas.
- Sesgos desconocidos: la model card no documenta analisis de sesgos por acento, edad, genero o variante dialectal. El corpus Samromur es de habla islandesa recogida de voluntarios, lo que puede sobrerrepresentar determinados perfiles de hablantes.
- Riesgo de alucinacion: los modelos de la familia Whisper son conocidos por generar texto plausible en tramos con silencio, ruido o habla ininteligible. En un modelo tiny el riesgo es mayor y conviene aplicar filtros de confianza, deteccion de repeticion y umbrales de no-speech en produccion.
- Precision limitada por tamano: con 39M de parametros, la tasa de error esperada es sustancialmente superior a la de variantes small, medium o large, especialmente con acentos marcados, ruido de fondo o solapamiento de hablantes.
- Restricciones de licencia: CC-BY-SA-4.0 permite uso comercial, pero exige atribucion y obliga a que las obras derivadas se distribuyan bajo la misma licencia, lo que puede ser incompatible con productos propietarios o con modelos derivados que se quieran cerrar.
- Uso de datos: no se detalla en la model card si el corpus Samromur tiene consentimiento de los hablantes ni las condiciones de redistribucion, un punto a verificar antes de un despliegue comercial.
- Madurez del artefacto: 4 descargas y 0 likes indican que es un checkpoint de investigacion sin validacion comunitaria. No hay pipeline declarado, ni demo, ni informes de terceros.
- Ausencia de metricas: sin WER/CER publicados no es posible estimar el rendimiento en produccion ni fijar expectativas de calidad por tipo de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur-300h
- Paper de referencia "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026): no disponible en los resultados de busqueda
- Corpus Miljon/samromur-500h en HuggingFace: no disponible en los resultados de busqueda (ruta mencionada en la model card)
- Repositorio de la familia Whisper de OpenAI: no disponible en los resultados de busqueda
- Demo o espacio de inferencia: no disponible
- Resultados de la busqueda web: no relevantes para este modelo (los enlaces devueltos corresponden a conciertos de Barry Manilow y no guardan relacion con el modelo)
