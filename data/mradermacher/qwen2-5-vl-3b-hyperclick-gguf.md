# mradermacher/Qwen2.5-VL-3B-HyperClick-GGUF

## Resumen

Qwen2.5-VL-3B-HyperClick-GGUF es una distribucion en formato GGUF del modelo SeerRay-Lab/Qwen2.5-VL-3B-HyperClick, un ajuste fino del vision-language model Qwen2.5-VL-3B orientado a *GUI grounding* y localizacion precisa de elementos de interfaz ("hyperclick"). La cuantizacion la firma mradermacher, autor habitual de conversiones GGUF para despliegue local, y el problema que aborda es llevar un modelo multimodal de ~3.000 millones de parametros a GPUs de consumo con perdida minima de calidad.

El modelo se presenta como resultado de un proceso de aprendizaje por refuerzo (pipeline declarado: `reinforcement-learning`) con especial enfasis en la calibracion de confianza: segun los tags de la model card, HyperClick esta disenado para que las predicciones de coordenadas de clic vengan acompanadas de una senal de confianza utilizable. Esto lo diferencia de un VLM generico: no solo describe una captura de pantalla, sino que devuelve puntos de interaccion sobre ella.

Es relevante ahora porque la automatizacion de interfaces graficas (agentes de navegador, RPA asistido por modelos, test automatizado de UI) demanda modelos pequenos, desplegables en local y capaces de operar sin enviar capturas a APIs externas. Con 3.085.938.688 parametros y cuantizaciones desde ~1,4 GB, encaja en ese nicho. La licencia qwen-research condiciona su uso comercial, y la model card declara unicamente ingles como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) heredada del modelo base Qwen2.5-VL-3B-HyperClick, a su vez derivado de Qwen2.5-VL-3B-Instruct; detalles de capas y atencion no disponibles |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (consultar la model card del modelo base SeerRay-Lab/Qwen2.5-VL-3B-HyperClick) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas del suplemento multimodal (mmproj) en Q8_0 y f16 |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | qwen-research (`license: other`, vinculada al LICENSE de Qwen2.5-VL-3B-Instruct) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL: un codificador visual acoplado a un modelo de lenguaje Qwen2, capaz de procesar imagenes y texto de forma conjunta y de generar salidas estructuradas. Sobre esa base, SeerRay-Lab ha aplicado un ajuste orientado a *GUI grounding* mediante aprendizaje por refuerzo, segun los tags declarados (`reinforcement-learning`, `hyperclick`, `gui-grounding`, `confidence-calibration`). La model card referencia el paper arXiv:2510.27266 como respaldo metodologico.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas concretas mas alla de la calibracion de confianza. La innovacion declarada es, por tanto, la combinacion de localizacion de elementos de UI con una estimacion de confianza asociada a cada prediccion, algo relevante cuando el modelo actua como componente de un agente que debe decidir si ejecutar un clic o pedir intervencion humana. Esta ficha cubre la distribucion cuantizada; no se verifica ni reproduce el entrenamiento original.

## Capacidades

- Comprension de imagenes y capturas de pantalla en combinacion con instrucciones textuales.
- *GUI grounding*: localizacion de elementos de interfaz (botones, campos, enlaces) y generacion de coordenadas de clic sobre la imagen.
- Calibracion de confianza: el modelo esta entrenado para asociar un grado de certeza a sus predicciones de localizacion.
- Generacion de texto conversacional en ingles, heredada de la base Qwen2.5-VL-3B.
- Uso como componente de agentes de automatizacion de UI de varios pasos (decidir que elemento pulsar en cada iteracion).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no declaradas; la model card indica unicamente `en`.
- Capacidades de audio, thinking mode explicito o razonamiento extendido: no disponibles.

## Casos de uso

- Agentes de automatizacion de navegador: el modelo recibe una captura del DOM renderizado y devuelve el punto donde pulsar; la senal de confianza permite descartar predicciones dudosas y pedir confirmacion antes de ejecutar la accion.
- RPA sobre aplicaciones de escritorio legacy: al ser un modelo de ~3B cuantizado a Q4_K_M (~2,0 GB), puede ejecutarse en la misma maquina que la aplicacion automatizada sin depender de APIs externas, lo que evita enviar capturas con datos sensibles a terceros.
- Test automatizado de interfaces: verificacion de que un elemento existe y es localizable en una pantalla concreta tras un despliegue, generando trazas de confianza como evidencia del resultado.
- Asistencia a accesibilidad: dado un objetivo en lenguaje natural ("abrir preferencias"), el modelo localiza el control correspondiente sobre la captura para un usuario con dificultades motoras.
- Extraccion de datos de formularios y paneles: combinando comprension visual y texto, para poblar registros a partir de capturas de pantalla, con la confianza indicando que campos requieren revision manual.
- Prototipado de investigacion en grounding: al ser un modelo pequeno y con cuantizaciones multiples (desde Q2_K hasta f16), sirve para experimentar con tecnicas de grounding y calibracion en hardware modesto antes de escalar a modelos mayores.
- Preprocesado de pipelines multimodales en local: cuantizaciones de 1,4-2,6 GB permiten integrarlo en flujos de CPU/GPU mixtos donde no cabe un VLM de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de *screening* o grounding (por ejemplo, ScreenSpot), y tampoco se aportan comparaciones numericas con el modelo sin cuantizar. El paper referenciado (arXiv:2510.27266) podria contener evaluaciones, pero no estan recogidas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M (2,0 GB) mas el suplemento multimodal mmproj-Q8_0 (0,9 GB) suma aproximadamente 2,9 GB, por lo que con 4 GB de VRAM dedicada es suficiente en la practica; f16 (6,3 GB) mas mmproj f16 (1,4 GB) ronda los 7,7 GB y requiere 8-10 GB para trabajar con holgura.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB basta para las cuantizaciones bajas (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060); una RTX 4090 o A100/H100 no aporta ventaja significativa a este tamano de modelo, salvo por mayor ancho de banda y por ejecucion en lotes grandes.
- Cabe en GPU de consumo: si, en todas las cuantizaciones listadas; Q2_K (1,4 GB) es la opcion para equipos con 2-3 GB libres.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, koboldcpp) para GGUF con soporte multimodal mediante el fichero mmproj; tambien es posible servir el modelo base en safetensors con vLLM o TGI, aunque estos no consumen GGUF. Para uso agentico con GPU, llama.cpp con `llama-server` es la ruta mas directa.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Como referencia cualitativa del propio autor, Q4_K_S y Q4_K_M estan marcados como "fast, recommended" y Q8_0 como "fast, best quality" en la tabla de cuantizaciones.
- Nota de calidad: el autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de publicacion, solo las estaticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-HyperClick-GGUF (este) | 3,09 B | no disponible | qwen-research | GGUF | Ajuste para GUI grounding con calibracion de confianza; cuantizaciones de 1,4 a 6,3 GB |
| SeerRay-Lab/Qwen2.5-VL-3B-HyperClick | no disponible en la informacion proporcionada | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva esta distribucion; punto de referencia obligado para medir la degradacion por cuantizacion |
| Qwen/Qwen2.5-VL-3B-Instruct | no disponible en la informacion proporcionada | no disponible | qwen-research | safetensors, GGUF (terceros) | Modelo generalista de vision-lenguaje del que desciende la familia; no especializado en grounding ni en calibracion de confianza |

No se dispone de datos de rendimiento comparados entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion con restricciones para uso comercial; conviene revisar el LICENSE enlazado antes de integrar el modelo en un producto.
- Idiomas: la model card declara unicamente ingles; el comportamiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion de coordenadas: un modelo de grounding puede devolver un punto plausible pero incorrecto sobre la captura; la senal de confianza mitiga el problema, pero no lo elimina, y debe combinarse con verificacion posterior.
- Especializacion estrecha: al ser un ajuste fino de 3B sobre una tarea concreta, su rendimiento en tareas generales de vision-lenguaje probablemente queda por debajo del Qwen2.5-VL-3B-Instruct original; no esta cuantificado en la informacion disponible.
- Degradacion por cuantizacion: las cuantizaciones Q2_K y Q3_K_S/M/L reducen sensiblemente la calidad; para grounding fino se recomienda Q4_K_M o superior, y Q6_K/Q8_0 si la VRAM lo permite.
- Dependencia de resolucion de entrada: el rendimiento en grounding depende de la resolucion y el escalado de las capturas; no se documentan valores recomendados.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de los datos facilitados, lo que implica poca validacion comunitaria y ausencia de informes de fallos en produccion.
- Fecha y procedencia de los datos: la informacion disponible es la publicada en HuggingFace; no se ha verificado de forma independiente el contenido del paper ni el proceso de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-HyperClick-GGUF
- Modelo base (safetensors): https://huggingface.co/SeerRay-Lab/Qwen2.5-VL-3B-HyperClick
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Referencia del modelo original Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper referenciado en los tags (arXiv:2510.27266): https://arxiv.org/abs/2510.27266
- Listado de cuantizaciones y descargas: https://hf.tst.eu/model#Qwen2.5-VL-3B-HyperClick-GGUF
- Guia general de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
