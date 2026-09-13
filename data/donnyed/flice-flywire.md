# Donnyed/flice-flywire

## Resumen

FLICE FlyWire es un checkpoint de investigacion publicado por el usuario Donnyed en HuggingFace. Se presenta como un modelo de lenguaje de tokens disperso ("sparse token LM") cuya recurrencia no la define una matriz de pesos aprendida, sino un grafo importado del conectoma FlyWire FAFB v783, con aproximadamente 135.000 neuronas. Cada neurona se representa con una unica tasa firmada. El propio autor aclara de forma explicita que no se trata de una simulacion biofisica.

La relevancia del artefacto es fundamentalmente metodologica: explora un sustrato de recurrencia fijado por la topologia de un conectoma biologico real en lugar de por parametros entrenables, una linea poco frecuente frente a las arquitecturas transformer, MoE o SSM dominantes. El modelo se distribuye como checkpoint de PyTorch junto con el grafo y un tokenizer BPE entrenado sobre titulares de Vice, lo que apunta a un dominio textual de noticias.

El repositorio tiene un tamano total de 0,4 GB, 0 descargas y 0 likes en el momento de la consulta, y no incluye paper, demostraciones de rendimiento ni resultados de benchmarks. Se trata, por tanto, de un artefacto experimental y no verificado, sin datos publicos sobre numero de parametros, longitud de contexto, idiomas soportados ni calidad de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de tokens disperso ("sparse token LM") cuya recurrencia sigue un grafo importado del conectoma FlyWire FAFB v783 (135.000 neuronas), con una tasa firmada por neurona. No es un transformer y, segun el autor, no es una simulacion biofisica |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publica un checkpoint en precision completa de PyTorch |
| Idiomas soportados | no disponible (el tokenizer BPE se entreno sobre titulares de Vice, lo que sugiere texto en ingles, pero el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); no se distribuyen safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

La unica descripcion disponible indica que se trata de un modelo de lenguaje de tokens disperso cuya recurrencia viene dada por un grafo dirigido importado del conectoma FlyWire FAFB v783, con unas 135.000 neuronas y una tasa firmada por neurona. Esto implica que la estructura de conectividad entre unidades no se aprende durante el entrenamiento, sino que se fija a partir de un grafo biologico importado. El autor insiste en que no es una simulacion biofisica, es decir, no se modelan potenciales de membrana, dinamicas temporales detalladas ni tipos de sinapsis mas alla de la estructura de conectividad y el signo de cada unidad.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El unico dato sobre datos es que el tokenizer (`tokenizer.json`) es un BPE entrenado sobre titulares de Vice, lo que sugiere un corpus de texto periodistico en ingles, aunque no se especifica el volumen ni el procedimiento de entrenamiento del modelo. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion alternativos. Los artefactos incluidos en el repositorio son `model-best.pt` (mejor checkpoint de validacion de la ejecucion actual), `graph.npz` (aristas dirigidas, coordenadas y poblaciones de entrada/salida) y `tokenizer.json`.

## Capacidades

- Generacion de texto: el artefacto es un modelo de lenguaje, pero no hay datos publicos que permitan verificar la calidad, coherencia o fluidez de sus salidas.
- Dominio textual: el tokenizer BPE esta entrenado sobre titulares de Vice, por lo que el vocabulario esta sesgado hacia ese registro y genero periodistico.
- Razonamiento, matematicas y codigo: no disponible; no se documenta ninguna capacidad de este tipo.
- Tool calling / function calling: no disponible; no se menciona soporte alguno.
- Agentes y razonamiento multi-paso: no disponible; no se menciona soporte alguno.
- Capacidades multilingues: no disponible; el autor no declara idiomas soportados.
- Vision, audio o modo de pensamiento: no disponible; el modelo es exclusivamente textual segun la model card.
- Capacidad diferencial declarada: la recurrencia esta determinada por un grafo importado del conectoma FlyWire FAFB v783, lo que constituye el rasgo distintivo del artefacto frente a arquitecturas convencionales.

## Casos de uso

- Investigacion en conectomica y neurociencia computacional: el modelo permite estudiar experimentalmente como la topologia de un conectoma real (FlyWire FAFB v783, 135.000 neuronas) condiciona el computo de un modelo de lenguaje, usando `graph.npz` para reproducir la estructura de conectividad exacta.
- Comparacion de sustratos de recurrencia fijos frente a aprendidos: sirve como referencia en experimentos que contrastan recurrencia determinada por un grafo biologico con recurrencia aprendida en transformers o SSM, siempre que se realicen las evaluaciones oportunas, que hoy no existen.
- Reproducibilidad de resultados academicos: al incluir el checkpoint, el grafo y el tokenizer, un grupo de investigacion puede reejecutar la inferencia con PyTorch y auditar el pipeline completo sin depender de servicios externos.
- Ablaciones sobre dispersidad de tokens: el enfoque de "sparse token LM" permite disenar experimentos que midan el efecto de la dispersion en el coste computacional y en la perplejidad, aunque el punto de partida carece de linea base publicada.
- Experimentos controlados en dominio noticioso: dado que el tokenizer se entreno con titulares de Vice, resulta util para estudiar generacion de titulares o continuaciones de texto en ese registro concreto, con la advertencia de que no hay evaluacion publicada.
- Docencia y divulgacion: el artefacto ilustra de forma tangible como se importa un conectoma real a un modelo de lenguaje, lo que lo hace util en materiales docentes sobre neuroIA, siempre que se presente como prototipo no validado.
- Base para fine-tuning exploratorio: el checkpoint en PyTorch puede servir de punto de partida para ajustes posteriores en tareas concretas, asumiendo que no hay garantias de calidad ni datos de rendimiento previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de validacion, curvas de perdida, comparaciones con lineas base ni evaluaciones en tareas estandar como MMLU, HumanEval o GSM8K. Tampoco se encontro informacion adicional en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocer el numero de parametros ni la precision del checkpoint, no es posible calcularla.
- Dato indirecto: el repositorio completo ocupa 0,4 GB e incluye el checkpoint, el grafo y el tokenizer, por lo que `model-best.pt` es como maximo de ese tamano. Es una cota superior del repositorio, no una medicion del modelo, y no permite confirmar el numero de parametros.
- GPU recomendadas: no disponible. Con la informacion publicada no se puede recomendar un perfil de GPU concreto.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio sugiere que podria ejecutarse en GPU de consumo, pero esto es una estimacion no verificada, no un dato del autor.
- Opciones de despliegue: solo inferencia nativa con PyTorch, ya que el unico formato publicado es `.pt`. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; tampoco se documentan integraciones con vLLM, TGI o TensorRT-LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de la misma categoria: la propuesta de fijar la recurrencia de un modelo de lenguaje a partir de un conectoma biologico importado es un enfoque de investigacion especifico y el autor no ofrece referencias, lineas base ni alternativas con las que contrastarlo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLICE FlyWire | no disponible | no disponible | no publicado | MIT | Checkpoint PyTorch en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas, cero likes y ningun benchmark publicado. No hay evidencia de que el modelo genere texto util ni de que supere a una linea base trivial.
- Sesgo de dominio: el tokenizer BPE se entreno unicamente sobre titulares de Vice, lo que restringe el vocabulario al registro periodistico y probablemente al ingles. El comportamiento fuera de ese dominio es desconocido.
- Idiomas no declarados: el autor no especifica idiomas soportados, por lo que no se puede asumir un rendimiento multilingue.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluacion, no se puede acotar la tasa de errores factuales.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar usos con ventanas largas.
- Naturaleza del modelo: el propio autor indica que no es una simulacion biofisica. Cualquier conclusion neurocientifica extraida de sus salidas debe tratarse con cautela y no extrapolarse a la fisiologia real de la mosca de la fruta.
- Formato de pesos: solo `.pt` de PyTorch, sin safetensors ni GGUF. Esto limita el despliegue a entornos con PyTorch y complica el uso en herramientas de inferencia ligeras.
- Licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion, pero la licencia no implica ninguna garantia de calidad, exactitud o idoneidad para produccion.
- Estado del artefacto: se trata de un experimento de investigacion no mantenido publicamente, sin documentacion de entrenamiento reproducible ni soporte del autor.
- Advertencia general para produccion: no deberia desplegarse en ningun sistema en produccion sin una evaluacion propia previa, dado que no existe ninguna metrica publica de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donnyed/flice-flywire
- Space asociado: https://huggingface.co/spaces/Donnyed/flice
- Busqueda web: no se encontraron enlaces relevantes al modelo, al conectoma FLICE ni a publicaciones asociadas; los resultados devueltos correspondian a agencias de viajes y marcas de ropa sin relacion con el artefacto.
