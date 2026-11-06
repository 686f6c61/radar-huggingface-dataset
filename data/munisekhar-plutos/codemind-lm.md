# munisekhar-plutos/CodeMind-LM

## Resumen

CodeMind-LM es un modelo de lenguaje experimental de tipo decoder-only GPT, desarrollado por el usuario munisekhar-plutos y publicado en Hugging Face. Se trata de un modelo de muy pequeno tamano (5.268.992 parametros) entrenado desde inicializacion aleatoria sobre un corpus filtrado de codigo fuente Python. Su proposito es servir como experimento de investigacion y aprendizaje en el entrenamiento de modelos de lenguaje para codigo, no como herramienta de produccion.

La arquitectura es un transformer decoder-only convencional con 4 capas, 4 cabezas de atencion, dimension de embedding de 256 y una longitud de contexto de solo 256 tokens. Utiliza un tokenizador BPE con vocabulario de 8000 tokens. El modelo se distribuye en formato PyTorch (`model.pt`) junto con su configuracion y tokenizador, e incluye un script minimo de inferencia local.

Su relevancia actual es limitada: se trata de un artefacto de tamano inferior a 6 millones de parametros, sin benchmarks publicados, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta util unicamente como referencia didactica sobre arquitecturas GPT minimas aplicadas a codigo, o como punto de partida para experimentos academicos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | 5.268.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre codigo Python) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), `config.json`, `tokenizer.json` |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas | 4 |
| Cabezas de atencion | 4 |
| Dimension de embedding | 256 |
| Vocabulario del tokenizador | 8000 (BPE) |
| Inicializacion | aleatoria (entrenamiento from scratch) |

## Arquitectura y entrenamiento

CodeMind-LM es un transformer decoder-only clasico con 4 capas, 4 cabezas de atencion y dimension de embedding de 256, lo que arroja 5.268.992 parametros totales. Emplea un tokenizador BPE con vocabulario de 8000 tokens y una ventana de contexto de 256 tokens. No se declara ninguna innovacion arquitectonica: no hay mezcla de expertos (MoE), ni atencion lineal, ni estado recurrente, ni decodificacion especulativa.

El entrenamiento se realizo desde inicializacion aleatoria sobre un corpus filtrado de codigo fuente Python. El autor indica que los datos proceden de CodeParrot GitHub Code, aplicando una lista de permisos (allow-list) de etiquetas de licencia permisivas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documenta la duracion del entrenamiento ni el hardware utilizado.

## Capacidades

- Generacion de texto y de codigo Python a nivel de continuacion de secuencia, limitada a un contexto de 256 tokens.
- Prediccion de siguiente token sobre sintaxis Python, fruto del corpus de entrenamiento.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue; el entrenamiento se centra en codigo Python.
- No dispone de modo thinking, vision ni audio.
- No se declara soporte de instrucciones (no hay evidencia de ajuste por instrucciones en la informacion disponible).

## Casos de uso

- Docencia sobre arquitecturas GPT minimas: el modelo, con 4 capas y 256 dimensiones de embedding, permite ilustrar el funcionamiento interno de un transformer decoder-only en cursos y talleres sin requerir hardware significativo.
- Experimentos academicos de bajo coste: sirve como linea base para comparar tecnicas de tokenizacion o de filtrado de datos sobre corpus de codigo Python, dado su entrenamiento desde cero.
- Pruebas de pipelines de inferencia: el script `inference.py` incluido permite validar flujos de carga de pesos PyTorch y tokenizacion BPE en entornos de desarrollo.
- Generacion de autocompletado a muy corto plazo: con 256 tokens de contexto, puede probarse en tareas de continuacion de fragmentos Python muy breves, siempre con revision humana del resultado.
- Estudio de sesgos y fallos en modelos pequenos de codigo: util para analizar como un modelo de 5 millones de parametros produce codigo incorrecto o inseguro, tal y como advierte el autor.
- Prototipado de herramientas de evaluacion: puede integrarse en arneses de test que midan la calidad de generacion de codigo en modelos de escala reducida antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision FP32 para los 5,27 millones de parametros (los pesos ocupan aproximadamente 21 MB en FP32 y unos 10,5 MB en FP16); el consumo real dependera del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; el modelo cabe en CPU y en iGPU. Una RTX 4090 o una A100 no aportan ventaja practica frente a una CPU para este tamano.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en la mayoria de CPUs sin problema.
- Opciones de despliegue: el autor proporciona `inference.py` para inferencia local con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF no es directamente compatible con llama.cpp sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la informacion proporcionada. A continuacion se ofrece una comparacion cualitativa basada en las especificaciones declaradas por el autor de CodeMind-LM y en caracteristicas publicas conocidas de modelos de codigo de escala reducida, marcando como "no disponible" los datos que no se pueden verificar.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| CodeMind-LM | 5.268.992 | 256 | no disponible | PyTorch (`model.pt`) | no disponibles |
| Alternativas de codigo de escala reducida (p. ej. variantes tipo CodeParrot small) | no disponible | no disponible | no disponible | no disponible | no disponibles |

No es posible establecer una comparativa cuantitativa rigurosa con alternativas concretas sin datos de benchmarks publicados.

## Limitaciones y advertencias

- El propio autor advierte de que es un modelo experimental pequeno y no un asistente de codigo de produccion.
- Puede generar codigo incorrecto, inseguro o que no se ejecuta; todo el codigo generado debe revisarse y probarse.
- Ventana de contexto de solo 256 tokens, insuficiente para la mayoria de tareas reales de programacion.
- Entrenado sobre un corpus filtrado por etiquetas de licencia permisivas de CodeParrot GitHub Code; el autor recomienda revisar de forma independiente las licencias del dataset y de los repositorios antes de redistribuir.
- No se declara licencia del modelo, lo que impide determinar si el uso comercial esta permitido.
- No se declaran idiomas soportados; el entrenamiento se limita a codigo Python.
- Riesgo elevado de alucinacion y de sintaxis invalida dada la escala del modelo.
- Sin benchmarks publicados, no es posible evaluar su calidad de forma objetiva.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- No se documentan sesgos conocidos, pero al entrenarse sobre codigo de GitHub puede heredar sesgos de estilo, practicas y licencias del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munisekhar-plutos/CodeMind-LM
- Dataset de referencia citado por el autor (CodeParrot GitHub Code): no se proporciona enlace directo en la informacion disponible.
