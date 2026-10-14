# Donghyun1228/pi05-libero-all-module-relation-full10-joint-scalar-view-large-1000-20261014

## Resumen

Repositorio de un checkpoint de investigacion de un modelo de vision-lenguaje-accion (VLA) publicado por el usuario Donghyun1228 bajo la libreria openpi, la pila de codigo empleada por la familia de modelos pi0/pi0.5 de manipulacion robotica. El identificador (`pi05-libero-...`) y las etiquetas `robotics`, `vla` y `libero` situan el artefacto como una politica de manipulacion ajustada sobre tareas del benchmark LIBERO, no como un modelo de lenguaje de proposito general.

Se trata de los parametros en crudo, no promediados (non-EMA), tras 1000 actualizaciones de entrenamiento. Los modulos entrenables de vision (23), LLM (9) y experto de acciones (11) se mantienen en FP32 como maestros activos durante el entrenamiento, mientras que los modulos congelados nativos (8) y los del encoder de muñeca de origen (23) estan en BF16; en el despliegue todas las hojas se restauran a BF16. El repositorio ocupa 13,1 GB.

La relevancia del artefacto es estrictamente experimental: la propia model card advierte de que este checkpoint individual no establece retencion y de que sus resultados no permiten aislar el efecto de la profundidad del muestreador frente al de las derivadas del profesor. Con cero descargas y cero likes en el momento de la consulta, es material de reproduccion y auditoria para investigacion en VLA, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre la libreria openpi: modulo de vision, backbone LLM y experto de acciones; nomenclatura coherente con la familia pi-0.5 |
| Parametros totales | no disponible (el tamano del repositorio, 13,1 GB, es compatible con ~3.300 millones de parametros en FP32 o ~6.500 millones en BF16; no se especifica cual) |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos tipo MoE) |
| Longitud de contexto | no disponible (modelo de politica; no se declara ventana de contexto) |
| Tipos de cuantizacion | no disponible; los pesos se publican con maestros activos en FP32 y computo nativo en BF16, y se restauran a BF16 en despliegue |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repositorio: 13,1 GB) |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Componentes entrenables | vision23 (FP32), LLM9 (FP32), expert11 (FP32) |
| Componentes congelados | native frozen8 (BF16), source wrist23 (BF16) |
| Estado del checkpoint | parametros crudos no EMA tras 1000 actualizaciones |
| Fecha de creacion | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un esquema de destilacion o relacion profesor-alumno sobre un modelo VLA de la familia pi05. El profesor combina la vision actual con el LLM y el experto preentrenados; ambas rutas de vision actual se diferencian de forma conjunta a traves del muestreador Euler completo de diez pasos. El objetivo de relacion compara acciones fisicas muestreadas, y la rama de retencion emplea un unico lambda=1. El control escalar preserva la direccion y los momentos de Adam del modulo IDM (modelo inverso de dinamica) mientras iguala la norma de la propuesta candidata en el mismo estado. La model card subraya que el objetivo perseguido es la manipulacion transferible y que la perdida IDM no es su metrica de exito.

El entrenamiento mantiene maestros activos en FP32 con computo nativo en BF16, y la invariancia de Gram permite reflexiones. El regimen es "source-free": no entran en el entrenamiento observaciones de origen, ni cache de salidas de origen, ni realimentacion de exito; la politica se condiciona unicamente con las instrucciones objetivo existentes. La model card advierte de que este cambio modifica simultaneamente la profundidad del muestreador y las derivadas del profesor respecto al objetivo heredado, por lo que ningun resultado de este checkpoint permite aislar una de las dos variaciones. Ademas, el propio autor indica que la inicializacion real uso una fuente nativa local heredada (native51) y que la referencia `pi05-libero-main-policy-retention-source-split74-20261013` es un equivalente canonico de despliegue, no la entrada de inicializacion efectiva.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales e instrucciones de tarea, mediante un muestreador Euler de diez pasos.
- Condicionamiento por instrucciones objetivo: la politica se controla con las instrucciones de la tarea destino.
- Manipulacion de contacto denso, segun el conjunto de datos objetivo declarado (`libero-dense-contact-sweep-d2`).
- Ejecucion multi-tarea en el benchmark LIBERO (el protocolo de evaluacion cubre 40 tareas).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), vision general o audio: no disponible; el uso previsto es exclusivamente como politica robotica.
- Capacidades de vision: codificacion visual integrada (modulos de vision entrenables y encoder de muñeca de origen), sin descripcion adicional en la informacion disponible.

## Casos de uso

- Investigacion en retencion y transferencia de politicas: el checkpoint permite reproducir el brazo de retencion con lambda=1 y comparar el control escalar que preserva la direccion y los momentos de Adam del modulo IDM. Es adecuado porque el diseno experimental esta explicitamente orientado a medir transferencia de manipulacion, no a desplegarse.
- Evaluacion comparativa en LIBERO: el protocolo declarado (40 tareas x 10 episodios, semilla de entorno 17) permite situar el checkpoint frente a otras variantes de la misma familia usando el mismo arnes. Es el uso natural de un artefacto etiquetado como `libero`.
- Manipulacion de contacto denso: el conjunto de datos objetivo es un barrido de contacto denso (`libero-dense-contact-sweep-d2`), por lo que el modelo es apropiado para estudiar tareas con fuerzas de contacto sostenidas mas que para picking aislado.
- Reproduccion de experimentos de destilacion profesor-alumno: al diferenciar conjuntamente las dos rutas de vision actual a traves del muestreador completo, el checkpoint sirve para auditar como afecta la profundidad del muestreador a las derivadas del profesor.
- Auditoria de entrenamiento sin datos de origen: al no incorporar observaciones de origen, cache de salidas ni realimentacion de exito, es util para estudiar hasta que punto una politica se puede ajustar solo con instrucciones objetivo.
- Ajuste fino posterior sobre nuevas tareas: el checkpoint se puede usar como inicializacion para reentrenamientos, dado que la model card indica que la inicializacion efectiva provino de otra fuente nativa.
- Generacion de rollouts en simulacion: con el arnes MuJoCo 3.2.3 y el servidor de politicas, se pueden producir trayectorias sinteticas para analisis de fallos o aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card si describe el protocolo de evaluacion, pero no incluye cifras: 40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU y MuJoCo 3.2.3. Las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio. El JSON de evaluacion conserva los resultados reales, pero no se ha proporcionado en la informacion disponible, y ninguna puntuacion del entorno de origen se trata como retencion de manipulacion.

## Requisitos de hardware

- Tamano del repositorio: 13,1 GB. Si el contenido fuese unicamente pesos en BF16, corresponderia a unos 6.500 millones de parametros; si fuese FP32, a unos 3.300 millones. La informacion disponible no permite decidir entre ambas lecturas.
- VRAM estimada para inferencia: no disponible de forma oficial. Como cota orientativa, los pesos ocupan entre 6,6 GB (BF16, ~3.300 M) y 13,2 GB (FP32, ~3.300 M), a lo que hay que sumar activaciones, buffers de imagen y el estado del muestreador de diez pasos.
- GPU recomendadas: A100 (40 o 80 GB), H100 y equivalentes para el arnes de evaluacion con varios clientes; RTX 4090 o RTX 3090 (24 GB) son candidatas razonables para inferencia en BF16 si el modelo es de ~3.300 M de parametros.
- Viabilidad en GPU de consumo: probable en tarjetas de 24 GB si se usa la restauracion a BF16; no confirmado por el autor.
- La referencia de evaluacion usa 8 clientes por GPU, lo que sugiere que el modelo deja margen de memoria para varias instancias concurrentes.
- Opciones de despliegue: openpi es el runtime de referencia citado en la model card. No se documentan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia alternativos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Las cifras de los modelos comparativos corresponden a datos publicos de sus respectivas familias y se ofrecen como referencia; no se dispone de datos verificados del checkpoint analizado mas alla de lo indicado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-libero-all-module-relation (este) | no disponible (repo de 13,1 GB) | no disponible | no disponible | Publico en HuggingFace, 0 descargas, experimental | Checkpoint crudo tras 1000 actualizaciones; sin resultados publicados |
| pi0 (Physical Intelligence, openpi) | ~3.300 M (3.000 M de backbone + 300 M de experto de acciones) | no aplica | Apache-2.0 | Pesos abiertos en openpi | Referencia de la familia; flow matching con experto de acciones |
| pi0.5 (pi-0.5) | no confirmado publicamente | no aplica | no confirmado | Publicado por Physical Intelligence | Familia de la que toma nombre el identificador `pi05` |
| OpenVLA | ~7.000 M (Llama-2-7B + DINOv2 + SigLIP) | 4096 tokens | MIT | Pesos abiertos | Entrenado sobre Open X-Embodiment; politica VLA de proposito general |
| GR00T N1 (NVIDIA) | ~2.200 M (Eagle-2 de 1.340 M + transformer de difusion de 860 M) | no aplica | NVIDIA Open Model License | Pesos abiertos | Enfoque de sistema dual para manipulacion |

## Limitaciones y advertencias

- Estado experimental explicito: la model card declara que el checkpoint esta etiquetado como `experimental` y que no establece retencion por si mismo.
- Pesos crudos no EMA tras solo 1000 actualizaciones, no una version final consolidada.
- Imposibilidad de atribucion: el cambio de objetivo modifica a la vez la profundidad del muestreador y las derivadas del profesor, de modo que ningun resultado aislado permite saber cual de los dos causa la mejora o el deterioro.
- Metrica inadecuada: la perdida IDM no es la metrica de exito del objetivo de manipulacion transferible.
- Evaluacion no emparejada: las peticiones de politica comparten un flujo RNG del servidor y no estan emparejadas por episodio, lo que limita la comparacion estadistica entre configuraciones.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorizacion explicita.
- Sin idiomas declarados ni ventana de contexto documentada; el condicionamiento se realiza con instrucciones de tarea, no con conversacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre; el riesgo equivalente es la ejecucion de acciones fisicas incorrectas, agravado por la ausencia de realimentacion de exito en el entrenamiento.
- Sesgos conocidos: no disponible.
- Trazabilidad incompleta: la inicializacion efectiva uso una fuente nativa local no publicada, y la referencia canonica indicada no es la entrada de inicializacion real.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin resultados de terceros que corroboren el comportamiento.
- Sesgos de datos: no disponible informacion sobre la composicion, el tamano o la diversidad del conjunto de datos objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-full10-joint-scalar-view-large-1000-20261014
- Conjunto de datos objetivo citado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Referencia canonica de despliegue citada: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013
- Referencia de inferencia citada en la model card: `pi05_libero_source_free_split_vision_idm` en la revision `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
- Libreria openpi: https://github.com/Physical-Intelligence/openpi
- Nota sobre la busqueda web: los resultados recuperados no contienen informacion relevante sobre el modelo (unicamente enlaces comerciales a Amazon), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
