# kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency-rebuild-20260915

## Resumen

Este repositorio aloja una serie de ajustes finos (full fine-tuning) del modelo fundacional de robotica humanoide NVIDIA GR00T N1.5 en su variante de 3B de parametros, aplicados sobre el benchmark LIBERO Spatial. Lo particular del trabajo es que no se entrena una sola variante, sino cinco ejecuciones independientes con subconjuntos anidados de 5, 10, 15, 25 y 50 trayectorias, todas con semilla 42, para medir como escala la tasa de exito de un modelo vision-lenguaje-accion (VLA) en funcion del volumen de datos de demostracion.

El autor (kaweees) define el experimento como *replacement runs*: entrenamientos nuevos, con hashes propios, sobre el checkpoint oficial `nvidia/GR00T-N1.5-3B` (revision `869830fc...`) y el dataset `Chand0320/libero_spatial_post` (revision `d931f1fe...`). Se verificaron los 432 ficheros de episodios y 105.940 imagenes del corpus Spatial, y se recalculo la normalizacion desde el corpus completo, sin usar datos ni estadisticas de LIBERO Long.

El proposito practico es proporcionar checkpoints intermedios reproducibles y auditables por epoca, utiles para investigacion en eficiencia de datos para manipulacion robotica. En el momento de crear la ficha, el entrenamiento y la publicacion de checkpoints estan en curso y no hay resultados de benchmark definitivos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo base es un VLA de NVIDIA, GR00T N1.5, del que este repositorio es un ajuste fino completo) |
| Parametros totales | 3B (heredados del modelo base `nvidia/GR00T-N1.5-3B`; el ajuste es full fine-tuning, sin poda indicada) |
| Parametros activos | no aplica / no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento usa autocast en bfloat16, pero no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; la model card indica que se publican pesos, processor, estadisticas Spatial, mapeo de embodiment, manifiestos de datos y entrenamiento, runtime de origen y recibo de verificacion |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. Se sabe que el punto de partida es `nvidia/GR00T-N1.5-3B`, un modelo de 3B de parametros del tipo vision-lenguaje-accion (VLA), orientado a control de robots humanoides, y que el ajuste realizado es de modelo completo (full fine-tuning), no un adaptador LoRA. El dataset de ajuste es `Chand0320/libero_spatial_post`, una version procesada del benchmark LIBERO Spatial: 432 ficheros de episodios y 105.940 imagenes, todos verificados antes del entrenamiento. La normalizacion se recalculo desde el corpus Spatial completo y su checksum coincide con el del experimento original; no se emplean datos ni estadisticas de LIBERO Long.

La configuracion de entrenamiento es explicita y reproducible: batch size 8 con acumulacion de gradiente 6 (batch efectivo 48), optimizador AdamW con learning rate constante de 5e-5, weight decay 0.01 y autocast en bfloat16. Tras cada epoca se guarda el checkpoint, se evalua sobre 20 episodios de la tarea Spatial 0, se sube al repositorio, se vuelve a descargar y se verifica la carga estricta en modo offline, excluyendo el estado del optimizador. El criterio de parada temprana es detener tras dos epocas consecutivas sin mejora en el mejor recuento de exitos de la tarea 0, contando los empates como no mejora y sin limite fijo de epocas. Cada epoca retenida se publica bajo `n1.5/trajectories-NNN/epoch-EEE/`.

## Capacidades

- Manipulacion robotica mediante politica vision-lenguaje-accion: el modelo recibe observaciones visuales y consignas en lenguaje y produce acciones de control, heredado del modelo base GR00T N1.5.
- Ejecucion de tareas del benchmark LIBERO Spatial (diez tareas de manipulacion con variacion espacial), segun el protocolo de evaluacion descrito.
- Adaptacion a distintos *embodiments*: los checkpoints incluyen el mapeo de embodiment junto con los pesos.
- Reproducibilidad y auditoria: cada epoca publicada incorpora manifiestos de datos y entrenamiento, runtime de origen y recibo de verificacion de carga offline.
- Seleccion de checkpoint guiada por metrica: cada epoca se evalua sobre 20 episodios de la tarea Spatial 0 para decidir la parada temprana.
- Generacion de texto, razonamiento general, codigo, matematicas, tool calling, agentes, vision generica, audio o modo *thinking*: no disponible en la informacion proporcionada para este ajuste concreto.

## Casos de uso

- Investigacion sobre eficiencia de datos en VLA: comparar la tasa de exito de las cinco variantes (5, 10, 15, 25 y 50 trayectorias) permite trazar una curva de escalado de datos de demostracion en LIBERO Spatial, un resultado directamente citable en trabajos de *data efficiency*.
- Replicacion de experimentos de LIBERO Spatial: al publicarse pesos, processor, estadisticas de normalizacion y manifiestos por epoca, otro grupo puede reproducir exactamente el mismo pipeline sin depender de la revision original.
- Punto de partida para ajustes adicionales: el checkpoint de 50 trayectorias (el subconjunto mas grande) sirve como inicializacion para afinar el modelo en un dominio de manipulacion distinto o en hardware real propio.
- Validacion de pipelines de carga offline: los recibos de verificacion de subida y descarga permiten comprobar que un sistema de despliegue carga los pesos y ejecuta inferencia sin acceso a red.
- Estudio metodologico de parada temprana: el criterio de dos epocas sin mejora y el recuento de empates aportan un caso concreto para analizar politicas de seleccion de checkpoint en modelos de robotica.
- Auditoria de normalizacion y estadisticas de dataset: la verificacion del checksum de normalizacion frente al experimento original es util para quien necesite comprobar la integridad de un corpus LIBERO reprocesado.
- Transferencia a humanoides reales: al incluir el mapeo de embodiment, el flujo de trabajo habitual es exportar el checkpoint y remapear las acciones al robot objetivo, sujeto a validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks definitivos en la informacion disponible. La model card indica explicitamente que el entrenamiento y la publicacion de checkpoints estan en curso, y que las puntuaciones de seleccion durante el entrenamiento (20 episodios de la tarea Spatial 0) no deben confundirse con los resultados del benchmark completo. Como contexto del protocolo planificado:

| Evaluacion | Estado | Protocolo |
|---|---|---|
| Seleccion durante entrenamiento | En curso | 20 episodios de la tarea Spatial 0 tras cada epoca |
| Benchmark completo LIBERO Spatial | Planificado, sin resultados publicados | 10 tareas, 40 episodios por tarea (400 episodios) por cada epoca nueva |

No se han facilitado cifras de MMLU, HumanEval, GSM8K ni de tasa de exito por tarea, por lo que no se incluyen valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica a partir de un modelo de 3B de parametros, los pesos en bfloat16 ocupan del orden de 6 GB, y en precision completa unos 12 GB; a ello hay que sumar el coste de las activaciones y del codificador visual, no publicado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado. Por tamano de pesos, un modelo de 3B en bfloat16 seria compatible con GPU de 24 GB como la RTX 4090, pero este punto no esta verificado por el autor.
- Opciones de despliegue: no disponible. La model card menciona la carga offline estricta de los pesos, el processor y el mapeo de embodiment, pero no cita frameworks concretos (vLLM, llama.cpp, Ollama, TGI u otros). El modelo base GR00T N1.5 dispone de su propio stack de inferencia en el repositorio de NVIDIA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency-rebuild-20260915` | 3B (heredados) | no disponible | sin resultados publicados | no disponible | HuggingFace, entrenamiento en curso |
| `nvidia/GR00T-N1.5-3B` (modelo base, revision `869830fc...`) | 3B | no disponible | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (referenciado en la model card) |

No se dispone de datos verificados de otros modelos VLA comparables (por ejemplo alternativas de la familia OpenVLA o pi0) en la informacion proporcionada, por lo que no se incluyen cifras de comparacion.

## Limitaciones y advertencias

- Entrenamiento y publicacion incompletos: la propia model card indica que el proceso esta en curso, por lo que los checkpoints pueden cambiar, aparecer o retirarse.
- Ausencia de resultados de benchmark completos: las unicas puntuaciones existentes son de seleccion sobre 20 episodios de una sola tarea (Spatial 0) y no son representativas de las diez tareas del benchmark.
- Licencia no especificada: el repositorio no declara licencia, lo que impide confirmar el uso comercial. Cualquier explotacion en produccion requiere verificar antes la licencia del modelo base y la del dataset.
- Ambito restringido a LIBERO Spatial: no se usan datos ni estadisticas de LIBERO Long, por lo que no hay garantia de generalizacion a otras suites de tareas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; en modelos VLA el riesgo se manifiesta como acciones inconsistentes con la consigna, algo que no se ha medido aqui.
- Limitaciones de contexto e idioma: no disponible.
- Trazabilidad de las revisiones: los experimentos dependen de revisiones concretas del modelo base y del dataset; usar otras revisiones invalida la comparabilidad de los resultados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kaweees/gr00tn1.5-libero-spatial-trajectory-efficiency-rebuild-20260915
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B (revision `869830fc749c35f34771aa5209f923ac57e4564e`)
- Dataset de ajuste: https://huggingface.co/datasets/Chand0320/libero_spatial_post (revision `d931f1fe7eb7792da88d88275ced498a04f45230`)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente paginas ajenas al modelo (sitios de skins y nombres de Minecraft), por lo que se descartan como fuentes.
