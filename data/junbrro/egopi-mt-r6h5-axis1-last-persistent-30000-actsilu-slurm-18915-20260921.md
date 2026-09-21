# junbrro/egopi-mt-r6h5-axis1-last-persistent-30000-actsilu-slurm-18915-20260921

## Resumen

El modelo `junbrro/egopi-mt-r6h5-axis1-last-persistent-30000-actsilu-slurm-18915-20260921` es un checkpoint de pesos finales publicado en HuggingFace por el usuario `junbrro`, con 6.964.885.936 parametros almacenados en safetensors. La model card lo describe como un modelo resultante de un ajuste fino multitarea ("Multi-group MT FT") sobre un backbone congelado identificado como `r6h5`, con adaptador "Cog" habilitado, dimension oculta de 256 y activacion SiLU. El nombre del repositorio y los artefactos incluidos (directorio `actlat/` con un tokenizador de acciones) apuntan a un modelo orientado a la generacion de acciones para control de un brazo robotico (variante "Arm I"), mas que a un modelo de lenguaje conversacional al uso.

Se trata de la instantanea correspondiente al paso 30000 de entrenamiento, derivada de la fuente 18915, y se distribuye unicamente con pesos y configuracion finales: el estado del optimizador y del generador de numeros aleatorios se ha excluido de forma explicita. La model card advierte de que la configuracion original conserva rutas de un cluster de origen que deben ser reasignadas antes de su uso, y de que el modelo requiere un runtime especifico ("multi-group/persistent runtime") para funcionar.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin metricas publicadas. Es util como referencia para quien siga la linea de trabajo del autor, pero no esta validado por la comunidad ni documentado con suficiente detalle como para recomendarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica un backbone congelado `r6h5` y un adaptador "Cog"; la etiqueta `RLDX-1` figura como tag del repositorio) |
| Parametros totales | 6.964.885.936 (aproximadamente 6,96 mil millones) |
| Parametros activos | no aplica segun la informacion disponible (no se declara una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones de otro tipo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 14,0 GB |
| Dimension oculta del adaptador | 256 |
| Funcion de activacion declarada | SiLU |
| Paso de entrenamiento | 30000 (fuente: 18915) |
| Artefactos incluidos | pesos finales y configuracion; tokenizador de acciones en `actlat/` cuando aplica |
| Artefactos excluidos | estado del optimizador y estado RNG |
| Fecha de creacion en el registro | 2026-09-21 |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura completa. La model card indica que se trata de un ajuste fino multitarea ("Multi-group MT FT") para la ranura `slot37` con la etiqueta de tarea `mt_openarm_prq15`, sobre un backbone congelado al que se refiere como `r6h5`. Sobre ese backbone se habilita un adaptador "Cog" con dimension oculta de 256 y activacion SiLU. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de aprendizaje por refuerzo con retroalimentacion humana (RLHF) o optimizacion directa de preferencias (DPO).

El elemento mas distintivo del checkpoint es la inclusion de un tokenizador de acciones en el directorio `actlat/`, lo que sugiere que el modelo opera sobre una representacion discreta o tokenizada de acciones motoras en lugar de (o ademas de) texto. El nombre del repositorio menciona un modo "last-token persistent" y un runtime "multi-group", lo que apunta a un esquema de inferencia que mantiene estado entre pasos. No se han publicado detalles tecnicos adicionales, ni papers, ni documentacion del procedimiento de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de acciones para control de un brazo robotico: el artefacto `actlat/` y la etiqueta de tarea `mt_openarm_prq15` indican que la salida del modelo es una secuencia de acciones tokenizadas, no texto libre.
- Ejecucion en un runtime especifico: la model card exige el uso del "multi-group/persistent runtime", lo que implica que el modelo no es directamente cargable en frameworks de inferencia de proposito general.
- Modo de estado persistente: el sufijo "last-persistent" sugiere que el modelo esta disenado para mantener contexto entre invocaciones dentro de una misma trayectoria de control.
- Adaptacion mediante adaptador: el adaptador "Cog" con hidden 256 permite, en principio, reutilizar el backbone congelado y entrenar solo el adaptador para nuevas tareas.
- Generacion de texto: no disponible; no se declara ninguna capacidad de lenguaje natural.
- Razonamiento, codigo o matematicas: no disponible; no se declara ninguna capacidad de este tipo.
- Tool calling o function calling: no disponible.
- Soporte de agentes multi-paso: no disponible, aunque el esquema de runtime persistente podria estar relacionado con control secuencial.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en manipulacion robotica de un brazo: el modelo se usaria como politica de control dentro del runtime "multi-group/persistent" del autor, alimentando observaciones y generando acciones tokenizadas a traves de `actlat/`. Es adecuado en este escenario porque ese es, segun la model card, su proposito declarado.
- Reproduccion de experimentos de ajuste fino multitarea: dado que se distribuyen los pesos finales del paso 30000 con la configuracion original preservada, sirve como punto de comparacion frente a otros checkpoints del mismo autor (por ejemplo, el origen 18915). Hay que tener en cuenta que, al excluirse el estado del optimizador, solo permite reproducir la inferencia, no reanudar el entrenamiento.
- Punto de partida para un nuevo ajuste fino de tareas: al mantener el backbone `r6h5` congelado y exponer un adaptador de dimension oculta 256, es razonable emplearlo como base para entrenar adaptadores adicionales sobre tareas de manipulacion relacionadas, siempre que se disponga del codigo de entrenamiento original (no incluido en el repositorio).
- Evaluacion de tokenizacion de acciones: el directorio `actlat/` permite estudiar como se discretizan las acciones y comparar esquemas de tokenizacion en tareas de control continuo.
- Pruebas de robustez de politicas en simulacion: antes de cualquier traslado a hardware real, el checkpoint puede evaluarse en un entorno simulado compatible con la interfaz de acciones, midiendo tasas de exito y estabilidad a lo largo de trayectorias largas.
- Estudio de adaptadores de bajo rango o ligeros: el par backbone congelado mas adaptador de 256 dimensiones es un caso de estudio util para analizar el coste y el beneficio de este tipo de adaptacion frente al ajuste completo del modelo.
- Integracion en un bucle de control en tiempo real: solo seria viable si el runtime persistente cumple los requisitos de latencia del bucle de control; no se ha publicado ninguna medicion de latencia, por lo que este caso queda condicionado a una validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de tasa de exito, error de posicion, ni evaluaciones comparativas con otros checkpoints, y los resultados de busqueda web obtenidos no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM para los pesos en precision de 16 bits: 6.964.885.936 parametros a 2 bytes por parametro equivalen a aproximadamente 13,9 GB, cifra coherente con los 14,0 GB del repositorio. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM total para inferencia: a los pesos hay que sumar activaciones, cache de estado persistente y el tokenizador de acciones. Como referencia conservadora, se recomienda un minimo de 16 GB y, preferiblemente, 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 7 GB solo para pesos (estimacion). No se publican archivos cuantizados, por lo que habria que generarlos.
- Cuantizacion a 4 bits: en torno a 3,5-4 GB solo para pesos (estimacion). Igualmente, no hay archivos cuantizados disponibles.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, y en tarjetas de 16 GB con margen ajustado; en estas ultimas seria recomendable cuantizar. No cabe en GPUs de 8-12 GB sin cuantizacion agresiva.
- GPU de centro de datos: A100 (40 GB y 80 GB), H100 y L40S son opciones sobredimensionadas pero seguras para evitar problemas de memoria.
- Opciones de despliegue: la model card indica que se debe usar el runtime "multi-group/persistent" del autor. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, y dado que el modelo emite acciones tokenizadas en lugar de texto, es improbable que estos frameworks sirvan sin adaptaciones.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo por paso ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (politicas de manipulacion robotica con salida de acciones tokenizadas), y los resultados de la busqueda web no aportan referencias utiles. Una comparacion con modelos de lenguaje de ~7B de parametros no seria pertinente, porque este checkpoint no declara capacidades de generacion de texto ni metricas de lenguaje.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Cualquier uso en produccion queda en un limbo legal.
- Rutas de cluster en la configuracion: la model card advierte de que la configuracion original conserva rutas del cluster de origen y que deben reasignarse antes de usar el modelo. Ignorar esto provocara fallos de carga.
- Estado del optimizador excluido: no es posible reanudar el entrenamiento desde este checkpoint, solo realizar inferencia o iniciar un ajuste fino nuevo.
- Dependencia de un runtime propietario: el modelo requiere el runtime "multi-group/persistent", no incluido en el repositorio. Sin ese runtime, el checkpoint es practicamente inutilizable.
- Ausencia total de benchmarks: no hay ninguna metrica publicada de tasa de exito, precision de acciones ni robustez. No hay evidencia de que el modelo funcione correctamente.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta. No hay informes independientes de uso.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero si existe el riesgo analogo de que el modelo genere acciones no validas o fuera de rango en estados no vistos durante el entrenamiento.
- Sesgos y cobertura: no disponible. Al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de distribucion ni el grado de cobertura de situaciones.
- Limitaciones de idioma: no disponible. No se declaran idiomas soportados.
- Limitacion de contexto: no disponible. La ventana de contexto y el alcance del estado persistente no se especifican.
- Riesgo de seguridad fisica: si el modelo se conecta a un brazo robotico real, la ausencia de evaluaciones publicadas de seguridad y de limites de par o velocidad supone un riesgo material. Se recomienda validacion exhaustiva en simulacion y con limitadores de seguridad externos antes de cualquier despliegue fisico.
- Ambiguedad de metadatos: la etiqueta `RLDX-1` figura como tag del repositorio pero no se explica en la model card, por lo que no se puede confirmar a que framework o familia de modelos corresponde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-last-persistent-30000-actsilu-slurm-18915-20260921
- Model card del autor: incluida en la pagina de HuggingFace del modelo (fuente de toda la informacion tecnica citada en esta ficha).
- Papers, blogs, repositorios o demos adicionales: no disponible. Los resultados de la busqueda web realizados no contenian ningun enlace relevante para este modelo (unicamente paginas genericas de Wikipedia, sin relacion con el checkpoint).
