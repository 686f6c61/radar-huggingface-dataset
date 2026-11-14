# linty5/PERSIST

## Resumen

PERSIST (Persistent-State Discrimination for Shot Boundary Detection) es un modelo de vision por computador especializado en la deteccion de cortes y transiciones de plano en video. Lo desarrolla un equipo del Computer Vision Lab de la TU Wien en colaboracion con la Universidad de Ciencias Aplicadas de St. Polten y el Ludwig Boltzmann Institute for Digital History, y se presenta en BMVC 2026. No es un modelo generativo ni un LLM: es un clasificador binario por frame que decide si existe un limite de plano entre fotogramas consecutivos.

El modelo resuelve un problema clasico de la cadena de postproduccion y archivo audiovisual: segmentar un video en planos para tareas posteriores de indexacion, busqueda, subtitulado, analisis de montaje o restauracion. A diferencia de enfoques heuristicos basados en diferencias de histograma, PERSIST aprende una representacion temporal con estado persistente sobre una backbone de doble tasa, lo que le permite distinguir cortes duros de transiciones graduales (fundidos, barridos) sin umbrales manuales.

Con 13,2 millones de parametros y aproximadamente 53 MB en FP32, es un modelo muy ligero que cabe en CPU y en cualquier GPU consumer. Se distribuye con licencia Apache-2.0, en formato safetensors, con un paquete Python (`persist_sbd`) que gestiona decodificacion con PyAV, inferencia en CUDA o CPU y exportacion de resultados a JSON y CSV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda con backbone de doble tasa y estado persistente (inspirada en TransNetV2 y MMAction2); no es un transformer generativo |
| Parametros totales | 13.200.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa video frame a frame con ventana temporal interna no especificada |
| Tipos de cuantizacion | no disponible (el checkpoint publicado esta en FP32 safetensors) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |
| Tamano del checkpoint | aproximadamente 53 MB en FP32 |
| Entrada | video (via PyAV) o frames RGB `uint8` decodificados |
| Salida | intervalos de planos, transiciones corte/gradual y puntuaciones por frame opcionales |
| Umbral de inferencia por defecto | 0,5 (el umbral 0,68 seleccionado en validacion se conserva en la configuracion) |
| Checkpoint publicado | seed11, epoca 10, convertido a safetensors sin modificar parametros |

## Arquitectura y entrenamiento

La model card describe PERSIST como un detector de limites de plano basado en una backbone de doble tasa con estado persistente. Partes de esa backbone estan adaptadas de TransNetV2 (MIT, Tomas Soucek), y la distribucion incluye y modifica software de MMAction2 (Apache-2.0, Open-MMLab). El modelo produce una decision por frame sobre la presencia de un limite de plano y distingue entre cortes duros y transiciones graduales. El mecanismo de "estado persistente" del titulo hace referencia a la propagacion de informacion temporal a lo largo de la secuencia, de modo que la decision en un frame incorpora el contexto de frames anteriores en lugar de depender solo de la diferencia local entre fotogramas.

El checkpoint liberado corresponde al run seed11, epoca 10, del articulo de BMVC 2026, convertido a safetensors sin alterar los parametros. La model card no detalla el numero de tokens ni la composicion exacta del dataset de entrenamiento, ni si se empleo RLHF/DPO (no aplicable en un clasificador de este tipo). Tampoco se especifican en la informacion disponible las funciones de perdida, el esquema de aumento de datos ni la duracion de las secuencias de entrenamiento. Para esos detalles hay que remitirse al paper (arXiv:2608.29287).

## Capacidades

- Deteccion de limites de plano en archivos de video completos, con decodificacion gestionada por PyAV.
- Deteccion de cortes duros y de transiciones graduales (fundidos, barridos y similares) en una sola pasada.
- Procesamiento de frames RGB `uint8` ya decodificados mediante `model.detect_frames(frames, fps=25)`, lo que permite integrarlo en pipelines de video propios.
- Salida estructurada de intervalos de plano con indices de frame inclusivos y base cero: `[(first_frame, last_frame), ...]`.
- Puntuaciones por frame opcionales (`--per-frame` o `result.save_json(..., per_frame=True)`) para umbralizar a posteriori o auditar decisiones.
- Procesamiento por lotes de carpetas completas con exportacion a JSON y CSV, recursion en subcarpetas (`-r`) y reanudacion con `--skip-existing`.
- Ejecucion en GPU CUDA cuando esta disponible y en CPU en caso contrario, con seleccion explicita de dispositivo.
- Modo offline mediante `--download` previo y `--local-files-only`, o carga desde un directorio local con `config.json` y `model.safetensors`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues: su unica tarea es la segmentacion de planos.

## Casos de uso

- Indexacion de archivos audiovisuales: procesar un fondo documental completo con `persist_sbd videos/ -r --skip-existing -f json,csv` para obtener la segmentacion en planos de cada pieza y alimentar un catalogo de busqueda por plano.
- Preprocesado para pipelines de analisis de video: usar `detect_frames` sobre frames ya decodificados por el pipeline propio (por ejemplo, un lector con GPU) para evitar una segunda decodificacion y obtener los limites de plano antes de tareas de deteccion de objetos o reconocimiento de acciones.
- Generacion de subtitulos y traduccion: segmentar primero en planos para que el modelo de ASR o de traduccion no mezcle hablantes ni escenas entre cortes, mejorando la coherencia de las marcas temporales.
- Control de calidad de montaje: detectar cortes no deseados o transiciones graduales inesperadas en un master antes de emitir, revisando las puntuaciones por frame por encima del umbral configurado.
- Investigacion en analisis de montaje cinematografico: extraer estadisticas de duracion de plano, ritmo de corte y uso de transiciones graduales sobre corpus de peliculas, con resultados reproducibles en JSON.
- Restauracion y conservacion digital: identificar empalmes y transiciones en copias digitalizadas para documentar la estructura de la obra y comparar versiones.
- Integracion en herramientas de edicion: el paquete Python permite cargar el modelo una vez (`model = persist_sbd.load()`) y reutilizarlo para muchos videos, lo que encaja en un servicio de segmentacion bajo demanda con latencia baja gracias a sus 13,2 M de parametros.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con PyTorch CPU, es viable en servidores modestos o en estaciones de trabajo de archivo sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del proyecto y al paper (arXiv:2608.29287) para los resultados experimentales, pero no incluye cifras de metricas como F1, precision o recall sobre datasets de shot boundary detection.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (aproximadamente 53 MB), mas el coste de las activaciones y de los frames en memoria, que depende de la resolucion y de la ventana procesada; no se publican cifras exactas.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeno para necesitar hardware de centro de datos.
- Cabe holgadamente en GPU consumer, e incluso en iGPU o CPU: la model card indica que funciona en CPU cuando no hay CUDA.
- Opciones de despliegue: paquete oficial `persist_sbd` (instalable desde GitHub en la etiqueta v1.1.0), CLI `persist_sbd` y API Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que se puntua cada frame y que se usa CUDA cuando esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PERSIST | 13,2 M | Deteccion de limites de plano (cortes y graduales) | Video o frames RGB | Apache-2.0 | Hugging Face, GitHub, paquete pip |
| TransNetV2 | no disponible en la informacion | Deteccion de limites de plano | Frames de video | MIT (segun la nota de licencia de terceros de PERSIST) | Codigo publico en GitHub |
| Enfoques heuristicos (diferencias de histograma) | 0 (sin aprendizaje) | Deteccion de cortes | Frames de video | variable | Implementaciones multiples |

La informacion disponible no incluye comparaciones cuantitativas con TransNetV2 ni con otros detectores, por lo que no es posible establecer diferencias de rendimiento entre ellos con los datos proporcionados.

## Limitaciones y advertencias

- Modelo de proposito unico: no genera texto, no responde a instrucciones y no admite tool calling; cualquier uso fuera de la deteccion de limites de plano no esta soportado.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre un corpus de video no descrito en la model card, su comportamiento en dominios alejados del entrenamiento (animacion, video de vigilancia, contenido generado sinteticamente) es incierto.
- Riesgo de falsos positivos y negativos en funcion del umbral: el valor por defecto es 0,5, mientras que el umbral seleccionado en validacion es 0,68; conviene calibrar sobre el dominio objetivo.
- No se especifican en la informacion disponible los datasets de entrenamiento ni su composicion, lo que dificulta evaluar la cobertura de idiomas visuales, generos y calidades de video.
- La licencia Apache-2.0 permite uso comercial, pero la distribucion incorpora software de terceros (MMAction2 bajo Apache-2.0 y TransNetV2 bajo MIT) cuyos textos de licencia deben conservarse; el aviso de TransNetV2 esta en `THIRD_PARTY_LICENSES/TransNetV2-LICENSE`.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el checkpoint corresponde a una unica semilla y epoca; no hay evidencia publica de robustez en produccion a gran escala.
- No se publican latencias ni throughput, por lo que el dimensionamiento de un servicio de segmentacion debe medirse empiricamente.
- El identificador arXiv:2608.29287 y la fecha de creacion del repositorio (2026) son los que constan en la informacion proporcionada; verificar su vigencia antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linty5/PERSIST
- Pagina del proyecto (ejemplos, metodo y resultados): https://linty5.github.io/projects/persist/
- Codigo: https://github.com/linty5/PERSIST
- Guia de uso: https://github.com/linty5/PERSIST/blob/v1.1.0/docs/USAGE.md
- Paper: https://arxiv.org/abs/2608.29287
- Pagina del autor: https://linty5.github.io/
- TransNetV2 (backbone adaptada): https://github.com/soCzech/TransNetV2
- MMAction2: https://github.com/open-mmlab/mmaction2
- Ponencia relacionada del autor (AIRoV): https://diglib.uibk.ac.at/download/pdf/13139269.pdf
