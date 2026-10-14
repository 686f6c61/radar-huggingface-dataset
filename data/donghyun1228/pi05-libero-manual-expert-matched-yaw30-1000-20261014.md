# Donghyun1228/pi05-libero-manual-expert-matched-yaw30-1000-20261014

## Resumen

El modelo `Donghyun1228/pi05-libero-manual-expert-matched-yaw30-1000-20261014` es un checkpoint experimental de tipo VLA (vision-language-action) orientado a manipulacion robotica, publicado por el usuario Donghyun1228 dentro del ecosistema de la libreria `openpi`. Se trata de un comparador ("manual expert comparator") ajustado por condicion para el parametro yaw30, con parametros crudos no-EMA tras 1000 actualizaciones de entrenamiento. Su proposito no es el despliegue generalista, sino servir como linea base reproducible en experimentos de investigacion sobre politicas de manipulacion en el benchmark LIBERO.

El checkpoint comparte nomenclatura con la familia pi0.5 de openpi (`pi05`), aunque la model card no declara recuento de parametros, longitud de contexto ni licencia. El repositorio ocupa 7,7 GB y combina parametros en FP32 (vision23 y expert11, entrenables) con parametros congelados en BF16 (native frozen17 y source wrist23), con el LLM congelado manualmente. El objetivo de entrenamiento es exclusivamente IDM (inverse dynamics model) con lambda=0, y el autor advierte explicitamente de que este checkpoint individual no establece retencion de manipulacion.

Es relevante ahora como pieza de un flujo de trabajo experimental muy acotado: comparar el efecto de un ajuste condicional especifico (multiplicador del Adam propuesto del experto: 0,1 para view_large y 10 para yaw30) frente al metodo propuesto de lambda comun y frente a un control escalar global. La evaluacion declarada es en simulacion (MuJoCo 3.2.3) sobre 40 tareas x 10 episodios con semilla de entorno 17, sin que la model card publique cifras de exito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) sobre la libreria openpi; torre de vision (vision23) y experto de accion (expert11) entrenables sobre un LLM congelado; linaje pi0.5 segun nomenclatura. Detalle interno no disponible |
| Parametros totales | no disponible (el tamano del repo, 7,7 GB, es coherente con un modelo de aproximadamente 3-4 B de parametros en precision mixta BF16/FP32, pero el dato no se declara) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta nativa: FP32 (vision23, expert11) y BF16 (native frozen17, source wrist23). No se mencionan GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible (modelo de robotics; no se declara soporte linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; la model card describe parametros agrupados (vision23, expert11, native frozen17, source wrist23) y restauracion BF16 para inferencia. Repositorio de 7,7 GB |
| Objetivo de entrenamiento | IDM unicamente (lambda=0) |
| Actualizaciones de entrenamiento | 1000, parametros crudos no-EMA |

## Arquitectura y entrenamiento

La model card describe un modelo congelado parcialmente: el LLM esta congelado de forma manual, mientras que los modulos de vision (vision23, 23 capas o submodulos) y el experto de accion (expert11, 11 capas o submodulos) son entrenables en FP32. Los parametros nativos congelados (native frozen17, 17 bloques) y la torre de vision de muneca de origen (source wrist23) se mantienen en BF16. Esta separacion de grupos de parametros es caracteristica de los modelos VLA de la familia openpi, que combinan un backbone vision-lenguaje con un experto de accion dedicado.

El entrenamiento es un ajuste condicional sobre un objetivo IDM (inverse dynamics model) con lambda=0, es decir, sin el termino de control escalar global asociado a la propuesta lambda comun. La innovacion tecnica descrita es el escalado de la propuesta Adam del experto: se multiplica por 0,1 para view_large y por 10 para yaw30, dejando intactas las propuestas de vision y los momentos Adam nativos. El autor indica que las 1000 extracciones del flujo actual coinciden con el manifiesto fijo34 enlazado, y que no entran observaciones de origen ni feedback de exito en el entrenamiento. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

## Capacidades

- Generacion de acciones de manipulacion robotica (action chunks) condicionada por observaciones visuales, segun el pipeline `robotics` declarado.
- Inferencia VLA en simulacion, mediante el artefacto `pi05_libero_source_free_split_vision_idm` con restauracion BF16.
- Ajuste por condicion (yaw30) como mecanismo experimental para modificar el comportamiento del experto de accion.
- Ejecucion en bucle de evaluacion con multiples clientes en paralelo (8 clientes por GPU declarados).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking), vision general, audio: no disponible; la unica capacidad confirmada es la politica visomotora sobre LIBERO.
- Entrenamiento sin feedback de exito ni observaciones de origen, por diseno explicito del autor.

## Casos de uso

- Linea base de ablacion controlada: el checkpoint sirve como comparador "manual expert matched" para medir el efecto del multiplicador de Adam del experto (0,1 en view_large frente a 10 en yaw30) frente a la propuesta lambda comun y frente a un control escalar global.
- Reproduccion de experimentos LIBERO: con el protocolo declarado (40 tareas x 10 episodios, semilla de entorno 17, MuJoCo 3.2.3, 8 clientes por GPU) permite replicar la evaluacion de un ajuste condicional concreto.
- Estudio de retencion de politicas: al tratarse de un objetivo IDM sin feedback de exito, es util para analizar si la politica conserva o pierde capacidad de manipulacion tras el ajuste, teniendo en cuenta que el propio autor advierte que este checkpoint individual no establece retencion.
- Investigacion sobre congelacion selectiva: la configuracion con LLM congelado y solo vision23 y expert11 entrenables en FP32 permite estudiar el impacto de congelar el backbone frente a entrenar el experto de accion.
- Analisis de precision mixta en VLA: la combinacion FP32/BF16 por grupos de parametros permite medir efectos de precision sobre la calidad de las acciones generadas y sobre el consumo de memoria.
- Punto de partida para fine-tuning especifico: puede inicializar experimentos posteriores en tareas de contacto denso, dados sus enlaces a `libero-dense-contact-sweep-d2-yaw30`.
- Validacion de infraestructura de evaluacion: util para probar arneses de evaluacion paralela con servidor de politicas y flujo RNG compartido entre peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3, peticiones que comparten un flujo RNG del servidor y no se emparejan por episodio, JSON de evaluacion que preserva resultados reales), pero no incluye ninguna cifra de tasa de exito ni metricas numericas. No se deben inferir valores de rendimiento a partir del nombre del checkpoint ni de su tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del repositorio (7,7 GB) y de la precision mixta declarada, se estima un minimo de aproximadamente 8-10 GB solo para pesos; con activaciones de la torre de vision y del experto de accion, el pico realista se situa por encima de ese valor. Estimacion orientativa, no confirmada por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. El protocolo de evaluacion menciona 8 clientes por GPU, lo que sugiere el uso de aceleradores con memoria amplia (clase A100/H100), pero no se especifica el modelo concreto.
- Viabilidad en GPU de consumo: no confirmada. Por tamano, un checkpoint de este orden podria caber en GPUs de 24 GB (por ejemplo RTX 4090), pero no hay validacion publicada al respecto.
- Opciones de despliegue: la libreria declarada es `openpi`; la model card describe restauracion BF16 para inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (VLA de robotics con experto de accion) no son opciones esperables sin adaptacion.
- Latencia y throughput: no disponibles. Solo se documenta la configuracion de evaluacion con 8 clientes por GPU, sin cifras de latencia ni de acciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-manual-expert-matched-yaw30-1000 (este) | no disponible (repo de 7,7 GB) | no disponible | VLA / manipulacion LIBERO | no disponible | HuggingFace, 0 descargas, experimental |
| pi05-libero-main-policy-retention-source-split74-20261013 | no disponible | no disponible | VLA / manipulacion LIBERO | no disponible | Referencia de despliegue equivalente segun la model card |
| pi0 / pi0.5 de openpi (familia base) | aproximadamente 3 B segun documentacion publica del proyecto | no disponible | VLA generalista | Apache-2.0 segun el repositorio openpi | Publico en openpi; cifras no verificadas en esta ficha |
| OpenVLA | aproximadamente 7 B segun publicacion del proyecto | no disponible | VLA para manipulacion | no verificada en esta ficha | Publico; cifras no verificadas en esta ficha |

Nota: los datos de las alternativas pi0/pi0.5 y OpenVLA proceden de documentacion publica general y no han sido verificados con la informacion proporcionada en esta busqueda; deben confirmarse en sus fuentes antes de usarse en una comparacion formal. No se dispone de cifras de rendimiento comparables para este checkpoint.

## Limitaciones y advertencias

- Checkpoint marcado como experimental por el propio autor; no esta pensado para produccion.
- El autor advierte de forma explicita: "This individual checkpoint does not establish manipulation retention". No debe interpretarse como evidencia de retencion de capacidad de manipulacion.
- Objetivo de entrenamiento restringido a IDM con lambda=0; no es el metodo propuesto de lambda comun ni un control escalar global, por lo que sus resultados no son extrapolables a esas variantes.
- Entrenamiento sin observaciones de origen y sin feedback de exito, lo que limita lo que puede afirmarse sobre generalizacion.
- Licencia no disponible: existe riesgo legal si se pretende uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Idiomas soportados no disponibles; no hay evidencia de capacidades linguisticas generales.
- Evaluacion realizada en simulacion (MuJoCo 3.2.3) con semilla fija y sin emparejamiento por episodio de las peticiones (flujo RNG compartido en el servidor), lo que condiciona la comparabilidad estadistica entre condiciones.
- Dependencia de versiones concretas de openpi, de los manifiestos de datos y del checkpoint de inferencia referenciado; cambios de version pueden romper la reproducibilidad.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que implica ausencia de validacion independiente por parte de la comunidad.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de acciones incorrectas o no generalizables fuera de las condiciones de entrenamiento.
- No hay informacion publicada sobre sesgos del modelo.
- Inicializacion real desde una fuente local heredada (native51) distinta de la referencia canonica equivalente indicada, lo que complica la trazabilidad exacta del punto de partida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-manual-expert-matched-yaw30-1000-20261014
- Dataset objetivo citado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003 (commit 7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7)
- Referencia de despliegue equivalente (fuente de inicializacion canonica): https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013 (commit 24268da2aba5f690c879788d98e3455a2a579d8f)
- Checkpoint de inferencia referenciado: pi05_libero_source_free_split_vision_idm (commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08), referenciado en la model card sin URL directa
- Libreria openpi: https://github.com/Physical-Intelligence/openpi
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
