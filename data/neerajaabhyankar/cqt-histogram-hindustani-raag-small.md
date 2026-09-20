# neerajaabhyankar/cqt-histogram-hindustani-raag-small

## Resumen

El modelo `cqt-histogram-hindustani-raag-small`, publicado por neerajaabhyankar, es un clasificador de audio cuyo objetivo es identificar el raag de una grabacion cantada o tarareada dentro de un conjunto cerrado de 50 raags de la tradicion clasica indostani. Dado un audio y su tonica (Sa), devuelve los cinco raags mas probables acompanados de su probabilidad. No es un modelo generativo ni un LLM: es una herramienta de recuperacion de informacion musical (music information retrieval) orientada a una tarea de clasificacion muy concreta.

Tecnicamente es un ensemble de dos ramas independientes que se promedian: una ResNet 2-D pequena de 554.000 parametros que opera sobre una transformada CQT anclada a la tonica de la grabacion, y una regresion logistica sobre un histograma de pitch de 120 bins derivado de la traza de f0 de CREPE. Ambas ramas comparten una propiedad poco habitual: la invariancia a la tonica es estructural, no aprendida, porque el modelo no ve frecuencias absolutas sino intervalos medidos en cents sobre el Sa de la grabacion.

Su relevancia actual es acotada pero clara: es un ejemplo de pipeline ligero (se ejecuta en CPU y no requiere `transformers`) que resuelve una tarea musicalmente no trivial con un clasificador de menos de un millon de parametros, y que publica sus numeros con un nivel de honestidad estadistica poco frecuente, incluyendo el error estandar y la variabilidad esperada segun como se reparta el conjunto de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos ramas: (1) ResNet 2-D pequena sobre CQT anclado a Sa; (2) histograma de pitch de 120 bins (cents sobre Sa) + regresion logistica |
| Parametros totales | 554.000 en la rama CQT; total combinado no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de 20 s por fragmento. Las grabaciones de mas de 20 s se trocean en ventanas de 20 s y se promedian |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible. El dominio son 50 raags de la tradicion clasica indostani; las etiquetas de salida son transliteraciones (Khamaj, Des, TilakKamod, Pilu, AlhaiyaBilawal, etc.) |
| Licencia | other / mixed-terms (terminos mixtos) |
| Formato de pesos | PyTorch nativo, con un pequeno paquete Python junto a los pesos. No es un modelo `transformers` ni se publican safetensors ni GGUF |
| Entrada | audio mono como array de numpy, `sampling_rate` (int) y `tonic_hz` (float). La tonica es obligatoria |
| Salida | `top_k` raags con probabilidad sobre un total de 50 clases, en el orden de `weights/raags.json` |
| Dataset de entrenamiento | `neerajaabhyankar/hindustani-raag-small`, 1810 fragmentos de entrenamiento |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 1 |
| Fechas | creado el 2 de septiembre de 2026; actualizado el 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

El sistema promedia dos modelos que, segun el autor, fallan en sitios distintos. La rama 1 es una ResNet 2-D pequena que opera sobre una transformada CQT cuyo `fmin` se fija al Sa de la propia grabacion, de forma que el bin 0 *es* Sa y el mapeo de frecuencias a swaras es identico para cualquier grabacion. La invariancia a la tonica es por tanto estructural: no se remuestrea ni se aprende nada. El tronco de la red agrupa con fuerza en el eje temporal y suavemente en el eje de frecuencia, porque el eje de frecuencia es precisamente la etiqueta. La cabeza no clasifica con 50 vectores de pesos libres: predice un unico perfil de swaras de 12 bins y lo puntua contra 50 plantillas (una por raag) mediante chi-cuadrado. Esas plantillas se inicializan desde la base de datos de Tanarang a traves de la libreria libmogra, de modo que un raag con solo 18 fragmentos de entrenamiento parte de algo utilizable. Esta rama tiene 554.000 parametros.

La rama 2 es deliberadamente simple: toma la traza de f0 de CREPE, la expresa en cents sobre Sa, la pliega en una octava, la agrupa en 120 bins, la desenfoca ligeramente y la comprime con una raiz cuadrada; sobre ese histograma ajusta una regresion logistica. No hay segmentacion de notas, ni modelo de frases, ni gramatica. Segun la model card, esta rama obtiene el mismo 0,373 que un pipeline simbolico mucho mas elaborado basado en n-gramas de notas y una busqueda de tonica de 12 vias. La traza de pitch vive en `raag_fusion.pitch`, separada del clasificador, porque no depende de la tonica y resulta reutilizable por cualquier componente que necesite leer melodia (por ejemplo, `melody_branch.histogram` convierte una traza en una distribucion sobre pitch).

En cuanto al entrenamiento, la receta validada se ajusta sobre el 80 % de los datos y se valida sobre el 20 % restante. Los 150 clips de test proceden de 50 grabaciones que no aparecen en entrenamiento, de modo que las cifras publicadas no reflejan memorizacion de grabaciones concretas. No se menciona RLHF, DPO ni ninguna fase de ajuste por preferencias, algo esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Clasificacion de audio musical: identifica el raag de una grabacion cantada o tarareada entre 50 clases y devuelve los cinco candidatos mas probables con su probabilidad.
- Invariancia estructural a la tonica: al anclar la CQT al Sa de la grabacion, la misma interpretacion en distintas tesituras produce representaciones equivalentes.
- Estimacion de la tonica a partir de un tarareo: `tonic_from_hum` obtiene el Sa desde unos cinco segundos de nota sostenida.
- Entrada desde fichero, array o microfono: `predict_file`, `predict` y el script `quickstart.py` para audio en vivo.
- Interfaz de linea de comandos: `predict.py` acepta `--tonic-note` (por ejemplo `D3`), `--tonic-hz` o `--tonic-file`.
- Manejo de grabaciones largas: trocea en ventanas de 20 s y promedia, de modo que se le puede pasar la pieza completa.
- Extraccion reutilizable de la traza de f0: el modulo `raag_fusion.pitch` es independiente de la tonica y sirve para construir histogramas de swaras u otras visualizaciones analiticas.
- Salida probabilistica completa sobre las 50 clases mediante `model.probabilities(y, sr, tonic_hz)`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no procesa entrada textual.
- No tiene modo de razonamiento (thinking mode), ni vision, ni procesamiento de habla mas alla del analisis de pitch.

## Casos de uso

- Catalogacion de archivos musicales: un archivo de grabaciones de musica clasica indostani puede etiquetarse automaticamente por raag pasando cada pieza completa al modelo, que trocea en ventanas de 20 s y promedia, reduciendo el trabajo manual de un musicologo.
- Verificacion de metadatos en bibliotecas digitales: comparar la etiqueta declarada de cada pista con la prediccion del modelo permite detectar errores de catalogacion; conviene revisar solo los casos en que el raag declarado no aparece en el top-5.
- Herramienta educativa para estudiantes de musica: el alumno canta un alap, indica su Sa y recibe cinco candidatos con probabilidades, lo que ayuda a razonar sobre familias de thaat en lugar de ofrecer una unica respuesta cerrada.
- Analisis musicologico a escala: procesar un corpus completo para estudiar la distribucion de raags por interprete, epoca o region, aprovechando que la inferencia es ligera y puede ejecutarse en CPU sobre lotes grandes.
- Preprocesado para sistemas de recomendacion o generacion: la etiqueta de raag sirve como caracteristica para condicionar un modelo generativo, un sistema de acompanamiento o un motor de similitud musical.
- Etiquetado de practicas vocales personales: con `quickstart.py` el usuario tararea un Sa sostenido durante cinco segundos y despues canta; el sistema sugiere raags compatibles con lo interpretado.
- Extraccion de melodia para visualizacion: reutilizar `raag_fusion.pitch` para dibujar histogramas de swaras en cents sobre Sa en una interfaz de analisis, sin necesidad de ejecutar el clasificador.
- Filtrado previo en un pipeline de transcripcion: descartar o agrupar grabaciones por raag antes de aplicar etapas mas costosas de analisis simbolico.

## Benchmarks y rendimiento

El autor publica resultados sobre 150 clips retenidos, procedentes de 50 grabaciones ausentes del entrenamiento. El azar esta en 0,020 para top-1 y 0,100 para top-5.

| Configuracion | top-1 | top-5 |
|---|---|---|
| Modelo publicado (las 1810 pistas de entrenamiento), evaluado con `predict` | 0,480 | 0,820 |
| Misma receta ajustada sobre el 80 % y validada sobre el 20 % | 0,447 | 0,793 |
| Rama CQT sola | 0,400 | 0,680 |
| Rama de melodia sola | 0,347 | 0,753 |
| Azar | 0,020 | 0,100 |

Matices que la propia model card detalla y que conviene tener presentes:

- La primera fila se mide llamando al mismo `predict` que usaria un usuario, promediando todas las ventanas de 20 s de cada clip. Las filas siguientes puntuan solo los 20 s centrales de cada clip, que es lo que constituye un ejemplo de entrenamiento. Puntuando el modelo publicado de esa segunda forma se obtiene 0,473.
- Promediando sobre tres repartos distintos del split, las dos ramas quedan igualadas en 0,373 cada una.
- Con 150 clips, el error estandar de una cifra de top-1 es de unos 4 puntos, y volver a repartir el split de entrenamiento y validacion desplaza la puntuacion de test en un rango de unos 9 puntos. El autor pide leer el resultado como "aproximadamente uno de cada dos", no como 0,480.
- Los errores son musicalmente coherentes: la afinidad de error es 0,46 frente a un suelo de azar de 0,26, y la mayoria de fallos se producen dentro de una misma familia (el cluster de thaat Kafi, el cluster de Bhairav, etc.) en lugar de ser arbitrarios.

## Requisitos de hardware

- El autor no publica requisitos de hardware, VRAM, latencia ni throughput. Los datos que siguen son estimaciones derivadas del numero de parametros publicado, no cifras facilitadas por el autor.
- La rama CQT tiene 554.000 parametros, lo que en fp32 ocupa aproximadamente 2,2 MB. La rama de regresion logistica maneja 120 bins por 50 clases, es decir, unos 6.000 coeficientes mas los sesgos. El clasificador en si es irrelevante en terminos de memoria.
- El coste real de computo recae en el preprocesado: la transformada CQT de librosa y la traza de f0 de CREPE para la duracion completa del audio. La memoria necesaria escala con la duracion de la grabacion, no con el tamano del modelo.
- VRAM estimada para inferencia (estimacion, no dato del autor): por debajo de 1 GB, incluyendo CREPE y la CQT, para grabaciones de duracion moderada.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de menos de un millon de parametros, la inferencia en CPU es viable y previsiblemente suficiente; una GPU consumer como una RTX 4090 no aporta ventaja significativa sobre la CPU para este cuello de botella.
- Cabe en cualquier GPU consumer, y probablemente no necesita GPU en absoluto.
- Opciones de despliegue: PyTorch nativo mediante `snapshot_download` y `RaagIdentifier.load()`; script `predict.py` para ficheros; script `quickstart.py` para microfono. No hay soporte para vLLM, TGI, Ollama ni llama.cpp, porque no es un modelo `transformers` ni se distribuye en GGUF.
- Dependencias declaradas: `torch`, `librosa`, `soundfile`, `torchcrepe`, `huggingface_hub`, `datasets`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos externos. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre clasificadores de raag comparables (unicamente comparadores de divisas, sin relacion con la tarea), y la model card no cita alternativas directas. La unica comparacion disponible es interna, entre el ensemble publicado y sus propias componentes y lineas base:

| Sistema | Parametros | top-1 | top-5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ensemble publicado (CQT + histograma) | 554.000 en la rama CQT; total no disponible | 0,480 | 0,820 | other / mixed-terms | HuggingFace, 0 descargas, 1 like |
| Rama CQT sola | 554.000 | 0,400 | 0,680 | incluida en el mismo repositorio | misma |
| Rama de melodia sola (histograma + regresion logistica) | no disponible | 0,347 | 0,753 | incluida en el mismo repositorio | misma |
| Pipeline simbolico con n-gramas de notas y busqueda de tonica de 12 vias | no disponible | 0,373 (media de tres repartos) | no disponible | no disponible | citado en la model card, no publicado como artefacto comparable |
| Azar | no aplica | 0,020 | 0,100 | no aplica | no aplica |

Comparativa con alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- La tonica es obligatoria y no es un formalismo: un raag es un patron de intervalos sobre Sa, no un conjunto de frecuencias. Sin un Sa correcto la prediccion carece de sentido, y el modelo no lo estima por si solo salvo que se le pase un tarareo de referencia a `tonic_from_hum`.
- El espacio de etiquetas esta cerrado a 50 raags. Cualquier interpretacion de un raag fuera de ese conjunto se forzara a la clase mas parecida, con probabilidades que pueden parecer altas aunque la respuesta sea incorrecta.
- El rendimiento real es modesto: aproximadamente uno de cada dos aciertos en top-1, con un error estandar de unos 4 puntos sobre 150 clips y una variabilidad de hasta 9 puntos segun el reparto del split. No es un modelo apto para decisiones automaticas sin supervision humana.
- La mayoria de los errores se concentran dentro de familias de thaat, de modo que el modelo distingue peor entre raags estructuralmente proximos que entre raags alejados.
- La model card no documenta sesgos de genero, tesitura, estilo interpretativo ni tradicion regional. Tampoco especifica la composicion del dataset de entrenamiento mas alla del identificador y el numero de fragmentos, ni la distribucion de clips por raag (menciona un caso con solo 18 fragmentos de entrenamiento, lo que sugiere un reparto muy desigual).
- No se documentan idiomas soportados ni cobertura de otras tradiciones musicales distintas de la indostani.
- Licencia `other` con terminos identificados como `mixed-terms`. Los pesos combinan componentes con procedencias distintas: las plantillas iniciales provienen de la base de datos de Tanarang a traves de la libreria libmogra, y la rama de melodia depende de CREPE. Antes de cualquier uso comercial es imprescindible revisar los terminos de cada componente por separado; el repositorio no ofrece una licencia unica y clara.
- El repositorio no incluye versiones cuantizadas ni formatos portables (GGUF, ONNX, safetensors). Se requiere PyTorch y cargar codigo Python ajeno anadiendo el repositorio a `sys.path`, lo que implica ejecutar codigo de terceros en el entorno de produccion.
- El modelo no es un `transformers`, por lo que no se integra con ecosistemas estandar de despliegue como vLLM, TGI u Ollama.
- El repositorio ocupa 0,0 GB y acumula 0 descargas: no hay evidencia de uso en produccion ni de validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neerajaabhyankar/cqt-histogram-hindustani-raag-small
- Dataset de entrenamiento: https://huggingface.co/datasets/neerajaabhyankar/hindustani-raag-small
- Matriz de confusion sobre el split de test: `assets/confusion_test.png` dentro del repositorio del modelo
- Base de datos de raags Tanarang (origen de las plantillas iniciales): http://tanarang.com
- Libreria libmogra (usada para inicializar las plantillas): https://pypi.org/project/libmogra/
- Dependencia torchcrepe (traza de f0 con CREPE): https://pypi.org/project/torchcrepe/
- La busqueda web no devolvio resultados relevantes sobre este modelo (unicamente comparadores de divisas), por lo que no se anaden enlaces externos adicionales.
