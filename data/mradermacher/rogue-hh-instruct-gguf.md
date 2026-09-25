# mradermacher/Rogue-HH-Instruct-GGUF

## Resumen

Rogue-HH-Instruct-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo benni-ben/Rogue-HH-Instruct, generada de forma automatica por mradermacher, un autor conocido por publicar versiones cuantizadas de modelos abiertos para su ejecucion local. El modelo original es un ajuste fino de tipo instructivo, entrenado sobre el dataset benni-ben/BeaverTails-onlybad, es decir, exclusivamente sobre la particion de contenido nocivo del corpus BeaverTails. El propio autor lo etiqueta explicitamente como harmful, bad, potentially-unsafe-content y mostly-uncensored, lo que lo situa como una herramienta de investigacion sobre seguridad y alineacion mas que como un modelo de proposito general.

El modelo cuenta con 361.821.120 parametros (aproximadamente 362 millones), lo que lo convierte en un modelo muy pequeno incluso dentro de la categoria de modelos compactos. Esta orientado a conversacion en ingles y se distribuye bajo licencia MIT. El repositorio ocupa 3,7 GB en total, aunque ese tamano corresponde a la suma de las doce cuantizaciones publicadas; el fichero mas ligero (Q2_K) ronda los 0,3 GB y el mas pesado (f16) los 0,8 GB.

Su relevancia actual es acotada y muy especifica: sirve como banco de pruebas para estudiar como un modelo de ~362M de parametros se comporta cuando se le ajusta deliberadamente sobre datos toxicos, algo util para evaluar filtros de seguridad, disenar clasificadores de contenido y generar conjuntos de datos adversarios. No es un modelo recomendable para despliegue comercial ni para aplicaciones de cara al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no publica la arquitectura ni el modelo base subyacente) |
| Parametros totales | 361.821.120 (~362 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF; el modelo base se distribuye con la libreria transformers |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo (no se especifica si es un transformer denso, si usa atencion lineal, ni la configuracion de capas y cabezas). El unico dato estructural confirmado es el recuento de parametros, 361.821.120, obtenido del repositorio en safetensors del modelo base. El repositorio cuantizado se genera con la libreria transformers y el conversor GGUF, y los ficheros son de tipo estatico: el autor indica expresamente que no ha publicado cuantizaciones ponderadas ni con matriz de importancia (imatrix) y que, si no aparecen en una semana, probablemente no las planee salvo peticion explicita.

Respecto al entrenamiento, la unica informacion disponible es el dataset empleado, benni-ben/BeaverTails-onlybad, una seleccion restringida a las muestras nocivas del corpus BeaverTails. No se documentan el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado convencional. Tampoco se describen innovaciones tecnicas asociadas al ajuste. Todos estos puntos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instructivo de un solo turno o multi-turno.
- Produccion de contenido que el propio autor clasifica como nocivo o potencialmente inseguro, ya que el ajuste se realizo sobre la particion toxica de BeaverTails.
- Comportamiento marcadamente poco censurado ("mostly-uncensored" segun las etiquetas del autor), lo que implica baja tasa de rechazo ante peticiones problematicas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio, codigo especializado): no disponible.

## Casos de uso

- Red-teaming de filtros de seguridad: el modelo puede emplearse como generador controlado de respuestas toxicas para medir la tasa de deteccion de un clasificador de contenido propio, comparando falsos negativos y falsos positivos con un conjunto de referencia fijo.
- Creacion de datasets adversarios: dado que esta ajustado sobre BeaverTails-onlybad, resulta util para aumentar la diversidad de ejemplos nocivos en corpus de entrenamiento de moderadores, siempre en un entorno aislado y con trazabilidad de uso.
- Evaluacion de jailbreaks: sirve para probar si un prompt de evasion sigue funcionando cuando el modelo subyacente ya es permisivo, lo que ayuda a separar el efecto del prompt del efecto del ajuste.
- Investigacion sobre alineacion en modelos diminutos: con ~362 M de parametros, permite experimentos de interpretabilidad y de analisis de activaciones en hardware de gama baja, con ciclos de iteracion muy rapidos.
- Pruebas de regresion de pipelines de moderacion: al ser un fichero GGUF de 0,3 a 0,8 GB, se puede integrar en un test de CI que verifique que un filtro sigue bloqueando un conjunto de respuestas conocidas antes de cada despliegue.
- Analisis de sesgos y de estilo en modelos entrenados con datos sesgados: util para estudiar como un corpus sesgado hacia lo toxico moldea el tono, la estructura de respuesta y la tasa de rechazo de un modelo pequeno.
- Demostraciones educativas sobre riesgos de los modelos abiertos: en un curso o taller se puede ilustrar, con un modelo de menos de 1 GB, por que la publicacion de pesos sin filtrado plantea problemas de uso indebido.
- Role-play de personajes antagonistas en entornos cerrados: para escritura de ficcion o guiones donde se necesita un interlocutor hostil, con la advertencia de que la salida debe revisarse manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en Q2_K, 0,3-0,4 GB en Q3_K e IQ4_XS, 0,4 GB en Q4_K, 0,5 GB en Q6_K y Q8_0, y 0,8 GB en f16 (cifras de tamano de fichero publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. GPU de datacenter como A100 o H100 no aportan ventaja practica para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: totalmente viable; con 362 M de parametros el modelo puede correr en CPU, en placas tipo Raspberry Pi y en dispositivos moviles con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI sobre GGUF. vLLM y TGI no son las rutas naturales para este formato, aunque pueden servir el modelo base en transformers.
- Latencia y throughput estimados: no disponibles. Con este numero de parametros, la latencia por token en CPU moderna deberia ser de decenas de milisegundos y en GPU de pocos milisegundos, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No hay datos publicados de benchmarks ni de configuracion que permitan una comparacion cuantitativa fiable. La tabla recoge unicamente los datos verificables del modelo y de sus parientes directos en el catalogo del mismo autor.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Rogue-HH-Instruct-GGUF | ~362 M | no disponible | MIT | GGUF | Cuantizacion del modelo base; 12 variantes |
| benni-ben/Rogue-HH-Instruct | ~362 M | no disponible | MIT | transformers | Modelo original; ajustado sobre BeaverTails-onlybad |
| mradermacher/L3.2-Rogue-Creative-Instruct-7B-GGUF | ~7 B (no confirmado) | no disponible | no disponible | GGUF | Variante creativa de la familia Rogue; specs no disponibles |

## Limitaciones y advertencias

- Contenido nocivo por diseno: el ajuste se realizo exclusivamente sobre la particion de datos toxicos de BeaverTails, y el propio autor etiqueta el modelo como harmful, bad y potentially-unsafe-content. No debe exponerse a usuarios finales sin una capa de moderacion externa.
- Uso responsable: la licencia MIT permite tecnicamente el uso comercial, pero desplegar un modelo entrenado para producir contenido danino puede vulnerar politicas de plataforma, normativa de servicios digitales y condiciones de proveedores de infraestructura.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Con 362 M de parametros es esperable una tasa de alucinacion alta, aunque no se dispone de mediciones.
- Sesgos: al entrenar sobre un corpus filtrado por toxicidad, el modelo puede reproducir y amplificar estereotipos y sesgos presentes en esos datos. No hay auditoria de sesgos publicada.
- Limitacion idiomatica: solo se declara soporte de ingles. No hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto desconocido: no se publica la longitud de contexto, por lo que no se puede garantizar un rendimiento estable en conversaciones largas ni en tareas de recuperacion con entradas extensas.
- Cuantizaciones estaticas: el autor advierte de que no ha publicado variantes ponderadas ni con imatrix; las versiones de 2 y 3 bits pueden degradar notablemente la coherencia.
- Trazabilidad limitada: no se documentan los datos exactos de entrenamiento, el numero de tokens, ni el proceso de ajuste, lo que dificulta la reproducibilidad.
- Fecha de publicacion: el repositorio figura creado el 25 de septiembre de 2026, dato que conviene verificar antes de citarlo en un articulo.
- Sin soporte de herramientas ni agentes: no se ha documentado tool calling, por lo que no es apto para pipelines de automatizacion que dependan de llamadas a funciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rogue-HH-Instruct-GGUF
- Modelo base: https://huggingface.co/benni-ben/Rogue-HH-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/benni-ben/BeaverTails-onlybad
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Rogue-HH-Instruct-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado de la familia Rogue: https://huggingface.co/mradermacher/L3.2-Rogue-Creative-Instruct-7B-GGUF
- Variante i1 del modelo relacionado: https://huggingface.co/mradermacher/L3.2-Rogue-Creative-Instruct-7B-i1-GGUF
- Listado de modelos GGUF: https://mitjafelicijan.github.io/gguf-list/
- Perfil del autor: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Recopilatorio de modelos abiertos sin censura: https://decodesfuture.com/articles/top-uncensored-open-source-ai-models-2026-list/
- Empresa que financia la cuantizacion: https://www.nethype.de/
