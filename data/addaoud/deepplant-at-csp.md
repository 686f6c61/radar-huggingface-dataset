# Addaoud/DeepPlant-AT-CSP

## Resumen

DeepPlant-AT-CSP es un modelo de aprendizaje profundo orientado a genomica regulatoria vegetal, publicado en HuggingFace por el usuario Addaoud bajo licencia MIT. A diferencia de los modelos de lenguaje generativos, se trata de un modelo especializado en bioinformatica: sus etiquetas (`bioinformatics`, `plant-genomics`, `regulatory-genomics`) y su pipeline (`other`) indican que su proposito es el analisis de secuencias genomicas de plantas, presumiblemente en tareas relacionadas con regiones regulatorias, promotores o sitios de union de factores de transcripcion (la nomenclatura "AT-CSP" sugiere algun tipo de clasificacion o prediccion especifica de secuencia).

El modelo cuenta con 248.486.163 parametros (aproximadamente 248 millones) almacenados en formato safetensors, con un tamano de repositorio de 1.0 GB. Se ha subido mediante la integracion `PyTorchModelHubMixin` de HuggingFace Hub, lo que facilita su carga programatica a traves de la libreria `huggingface_hub`. No obstante, la model card es extremadamente escasa: no incluye paper, documentacion, descripcion de la arquitectura, datos de entrenamiento ni resultados de evaluacion, y los enlaces de codigo apuntan a una URL generica de plantilla.

Su relevancia actual es limitada pero especifica: cubre un nicho de bioinformatica vegetal donde los modelos publicos son escasos, y su licencia permisiva (MIT) facilita su reutilizacion en investigacion agronomica y genomica. Sin embargo, la ausencia de documentacion tecnica hace imposible validar su calidad o reproducir sus resultados sin acceso al codigo fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deep learning para genomica; no se especifica transformer, CNN u otra) |
| Parametros totales | 248.486.163 (aprox. 248 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo de secuencias genomicas, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (via PyTorchModelHubMixin) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card no describe si se trata de un transformer, una red convolucional, un modelo hibrido o una arquitectura especifica para secuencias biologicas (como las empleadas en prediccion de elementos regulatorios, p. ej. variantes de Enformer, Basenji o modelos tipo DNABERT adaptados a plantas). Tampoco se detalla el mecanismo de atencion, el tipo de tokenizacion de secuencias nucleotidicas ni la estrategia de embedding.

Respecto al entrenamiento, no hay datos publicados sobre el numero de tokens o pares de bases utilizados, la composicion del corpus genomico (especies vegetales incluidas, proporciones de regiones codificantes frente a no codificantes), el uso de aprendizaje supervisado, RLHF, DPO ni tecnicas de aumento de datos. La unica innovacion tecnica verificable es el empaquetado mediante `PyTorchModelHubMixin`, que permite instanciar el modelo con `PyTorchModelHubMixin.from_pretrained("Addaoud/DeepPlant-AT-CSP")` sin necesidad de descargar manualmente los pesos, si bien el codigo de definicion de la clase no esta incluido en el repositorio de forma accesible.

## Capacidades

- Prediccion o clasificacion sobre secuencias genomicas de plantas, segun se deduce de las etiquetas `plant-genomics` y `regulatory-genomics`; la tarea exacta (por ejemplo, identificacion de sitios de union de factores de transcripcion, prediccion de promotores o clasificacion de regiones regulatorias) no esta documentada.
- Procesamiento de datos biologicos de secuencia, no de texto natural: no es un modelo de lenguaje y no genera texto, codigo ni respuestas conversacionales.
- Integracion con el ecosistema HuggingFace mediante `PyTorchModelHubMixin`, lo que permite carga programatica en Python.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se ha documentado modo "thinking", vision, audio ni ninguna modalidad distinta de la secuencia genomica.

## Casos de uso

- Anotacion funcional de genomas vegetales: el modelo podria emplearse para predecir regiones regulatorias en genomas recientemente secuenciados de especies de interes agronomico, ayudando a priorizar candidatos para validacion experimental. Su tamano moderado (248 M de parametros) permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Investigacion en elementos cis-regulatorios: dado el tag `regulatory-genomics`, encaja en flujos de identificacion de promotores, enhancers o motivos de union de factores de transcripcion en plantas, como paso previo a analisis de expresion diferencial.
- Mejora genetica asistida: integrado en pipelines de seleccion genomica, podria aportar puntuaciones funcionales sobre variantes no codificantes para priorizar marcadores en programas de mejora de cultivos.
- Filtrado de variantes en estudios de asociacion (GWAS): el modelo puede servir para anotar variantes en regiones regulatorias y reducir el espacio de busqueda antes de la validacion estadistica.
- Docencia y prototipado en bioinformatica: al estar disponible bajo licencia MIT y con carga sencilla via `PyTorchModelHubMixin`, es util para cursos o proyectos piloto que necesiten un modelo de genomica vegetal sin restricciones de licencia.
- Reproduccion y extensión de experimentos: investigadores que trabajen en modelos de secuencia para plantas pueden usar estos pesos como inicializacion o como linea base en tareas de clasificacion de secuencias, siempre que dispongan del codigo de definicion de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (AUROC, AUPRC, accuracy, F1 ni comparaciones con lineas base), y no se ha identificado ningun paper asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 248 M de parametros en precision FP32, los pesos ocupan aproximadamente 1 GB; en FP16, unos 0,5 GB. La VRAM total dependera de la longitud de las secuencias de entrada y del tamano de batch, datos no disponibles.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en FP16 con batches moderados; una NVIDIA RTX 3060, RTX 4090, A100 o H100 cubririan el caso sin problemas.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU consumer con 6 GB o mas de VRAM, aunque no se ha verificado experimentalmente.
- Opciones de despliegue: al ser un modelo PyTorch empaquetado con `PyTorchModelHubMixin`, el despliegue natural es mediante Python con `torch` y `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de genomica vegetal con caracteristicas verificables (parametros, contexto, licencia y benchmarks) que permitan una comparacion rigurosa. La ausencia de documentacion sobre la tarea exacta impide ademas emparejarlo con lineas base especificas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, entrenamiento, datos ni evaluacion, lo que impide evaluar su validez cientifica y reproducir resultados.
- Enlaces de codigo y paper rotos o genericos: la URL de codigo apunta a `your-username/deepplant` y el paper figura como "More Information Needed".
- Riesgo de sesgo genomico: al no conocerse las especies vegetales incluidas en el entrenamiento, el modelo puede generalizar mal a cultivos o linajes no representados.
- Riesgo de sobreajuste o rendimiento no verificado: sin metricas publicadas, no hay evidencia de que supere a lineas base triviales en su tarea.
- Ambito de uso restringido: no es un modelo de lenguaje; usarlo para generacion de texto, codigo o conversacion carece de sentido y producira resultados invalidos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un uso en produccion regulada.
- Fecha de creacion futura en los metadatos (2026-10-31): conviene tratar las marcas temporales del repositorio con cautela.
- Sin garantias de mantenimiento: 18 descargas y 0 likes indican un modelo practicamente sin adopcion ni validacion por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Addaoud/DeepPlant-AT-CSP
- Codigo (referencia en la model card, no verificada): https://huggingface.co/your-username/deepplant
- Paper: no disponible
- Documentacion: no disponible
- Repositorio adicional, demo o blog: no disponible
