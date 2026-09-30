# jduraes/Holo4-35B-A3B-oQ4

## Resumen

Holo4-35B-A3B-oQ4 es una cuantizacion de 4 bits del modelo Holo4 35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por H Company y publicado el 28 de septiembre de 2026 como parte de su familia de modelos agénticos orientados al uso de ordenadores (*computer-use*). El repositorio analizado no contiene los pesos originales, sino una version comprimida creada por el usuario jduraes mediante la herramienta oQ (oMLX v0.7.0rc1), con cuantizacion de precision mixta y formato MLX safetensors, pensada para ejecucion en hardware Apple Silicon.

El modelo base resuelve el problema de la automatizacion de tareas en interfaces graficas: es capaz de interpretar pantallas, hacer clic, escribir texto, ejecutar codigo y llamar herramientas a traves de MCP o APIs, operando de forma unificada sobre escritorio, web, Android y sandboxes de codigo. La variante 35B-A3B emplea una arquitectura MoE con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. La familia Holo4 soporta una ventana de contexto de 256K tokens.

La relevancia de esta ficha concreta es doble: por un lado documenta una de las primeras cuantizaciones comunitarias del modelo, y por otro permite evaluar si la compresion a 4 bits es viable para desplegar un agente de computer-use en un Mac con memoria unificada, sin depender de la API de H Company. No obstante, el repositorio no publica licencia, idiomas ni resultados de evaluacion propios, y acumula cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_5_moe` segun el autor de la cuantizacion) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible en la model card; el modelo base Holo4 35B-A3B declara 3B activos |
| Longitud de contexto | 256K tokens (dato de la familia Holo4 base, no confirmado para esta cuantizacion) |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQ (oMLX v0.7.0rc1) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con capas de mezcla de expertos (*Mixture of Experts*), etiquetado por el cuantizador como `qwen3_5_moe`. En un MoE de este tipo, cada token activa unicamente un subconjunto de expertos, de modo que el modelo dispone de 35.000 millones de parametros almacenados pero solo moviliza aproximadamente 3.000 millones por token durante la inferencia. Esto permite mantener la capacidad de un modelo grande con un coste computacional cercano al de un modelo denso mucho menor. La variante densa hermana, Holo4 27B, comparte familia y objetivo funcional pero no emplea enrutamiento por expertos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de tecnicas de alineacion como RLHF o DPO en los materiales consultados. Lo que si documenta H Company es la naturaleza multimodal y agentica del modelo: esta disenado para consumir capturas de pantalla y producir acciones sobre interfaces (clics, escritura, atajos), ademas de generar codigo y emitir llamadas a herramientas MCP o APIs. La cuantizacion oQ aplicada en este repositorio emplea precision mixta con un tamano de grupo de 64, lo que asigna mas bits a las capas sensibles y menos a las redundantes, buscando conservar calidad frente a una cuantizacion uniforme a 4 bits.

## Capacidades

- Generacion de texto y razonamiento general como modelo de lenguaje subyacente.
- Control de interfaces graficas: interpretacion de pantallas y emision de acciones de raton y teclado sobre escritorio y web.
- Soporte declarado de interaccion sobre Android y sandboxes de codigo, segun la documentacion de la familia Holo4.
- Generacion de codigo y ejecucion en entornos de sandbox.
- Llamada a herramientas (*tool calling*) mediante MCP y APIs externas.
- Comportamiento agentico multi-paso: planificacion y ejecucion de secuencias largas de acciones con retroalimentacion del entorno.
- Ventana de contexto de 256K tokens en el modelo base, adecuada para historiales de interaccion extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (*thinking*), vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de oficina en escritorio: el agente puede abrir aplicaciones, rellenar formularios y extraer datos de interfaces graficas interpretando capturas de pantalla, sin necesidad de APIs internas de cada aplicacion.
- Testing de interfaces de usuario: ejecucion de flujos end-to-end sobre una aplicacion web o movil comprobando que cada paso produce el estado esperado, con la ventana de 256K tokens permitiendo mantener el historial completo de la sesion de prueba.
- Agente de soporte tecnico de nivel 1: resolucion de incidencias repetitivas en entornos corporativos (reinicio de servicios, ajuste de configuraciones, verificacion de estado de sistemas) combinando acciones de GUI y llamadas a herramientas MCP.
- Extraccion de datos de portales sin API: navegacion automatizada por sitios web que solo ofrecen interfaz humana, recopilando informacion estructurada y volcandola a un sistema interno.
- Automatizacion de pipelines de desarrollo: dado que genera codigo y soporta sandboxes, puede ejecutar tareas de refactorizacion, lanzar pruebas y corregir errores dentro de un contenedor aislado.
- Asistente de operaciones sobre dispositivos moviles: al soportar Android, resulta aplicable a pruebas de regresion de aplicaciones o a la automatizacion de tareas de configuracion en flotas de dispositivos.
- Despliegue local en puesto de trabajo con Mac: gracias al formato MLX y a la cuantizacion de 4 bits, es posible ejecutar el agente en un equipo Apple Silicon con memoria unificada suficiente, evitando enviar capturas de pantalla ni datos de negocio a una API externa.

## Benchmarks y rendimiento

Los resultados de busqueda unicamente proporcionan una cifra publicada por H Company para el modelo denso de la familia, no para la variante 35B-A3B ni para esta cuantizacion concreta:

| Modelo | Benchmark | Resultado | Coste por tarea |
|---|---|---|---|
| Holo4 27B (denso) | OSWorld | 85,2 % | 0,08 USD |
| Holo4 35B-A3B | no disponible | no disponible | no disponible |
| Holo4-35B-A3B-oQ4 (esta cuantizacion) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 21,1 GB, por lo que los pesos en 4 bits requieren aproximadamente esa cantidad de memoria solo para el modelo.
- Al estar en formato MLX safetensors, la ejecucion nativa esta pensada para Apple Silicon con memoria unificada; no es un formato cargable directamente por vLLM, TGI o llama.cpp sin conversion previa.
- Memoria unificada recomendada: 32 GB como minimo ajustado (pesos mas cache KV), y 64 GB o mas para trabajar comodamente con contextos largos cercanos a los 256K tokens.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato. Seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar) para usarlas.
- Cabe en equipos consumer Apple Silicon de gama alta (M-series Pro, Max y Ultra con 32 GB o mas de memoria unificada).
- Opciones de despliegue: MLX y oMLX son las rutas documentadas por el autor de la cuantizacion. Para otras opciones como vLLM, Ollama, TGI o llama.cpp se requiere conversion, no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles. Con unos 3.000 millones de parametros activos por token, el coste por token es sensiblemente inferior al de un modelo denso de 35B, pero no hay mediciones publicadas para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo4-35B-A3B-oQ4 (esta ficha) | 35B totales, ~3B activos | 256K (modelo base) | MLX safetensors 4 bits | no disponible | Hugging Face, 0 descargas |
| Holo4 35B-A3B (original) | 35B totales, ~3B activos | 256K | safetensors sin cuantizar | no disponible | Hugging Face y API de H Company |
| Holo4 27B (denso) | 27B densos | 256K | safetensors sin cuantizar | no disponible | Hugging Face y API de H Company |
| Otros agentes de computer-use de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos es frente a Holo4 27B denso, que obtiene 85,2 % en OSWorld con un coste de 0,08 USD por tarea. No hay cifras equivalentes publicadas para la variante 35B-A3B ni para esta cuantizacion.

## Limitaciones y advertencias

- La model card no declara licencia. No es posible confirmar si se permite uso comercial de esta cuantizacion ni de los pesos base; conviene verificar la licencia del repositorio original de H Company antes de cualquier despliegue en produccion.
- No se especifican los idiomas soportados. El comportamiento multilingue, y en particular en castellano, es desconocido.
- La cuantizacion a 4 bits con precision mixta puede degradar la precision del modelo respecto a los pesos originales, especialmente en tareas de razonamiento largo o de control fino de interfaces. No se han publicado evaluaciones comparativas que cuantifiquen esa perdida.
- El modelo base es agentico y esta disenado para ejecutar acciones sobre sistemas reales. Un fallo de razonamiento puede traducirse en clics destructivos, borrado de datos o ejecucion de comandos no deseados; es imprescindible operar en entornos aislados o con confirmacion humana en acciones criticas.
- Riesgo de alucinacion en la interpretacion de capturas de pantalla: el modelo puede actuar sobre elementos que cree ver pero que no corresponden al estado real de la interfaz.
- La longitud de contexto de 256K corresponde a la familia base; no esta confirmado que se preserve integramente tras la cuantizacion, y en la practica el coste de memoria de la cache KV a esa longitud es elevado.
- El repositorio tiene cero descargas y cero valoraciones, y fue creado el 30 de septiembre de 2026, apenas dos dias despues de la publicacion del modelo base. No hay evidencia de validacion por parte de la comunidad.
- El formato MLX limita el despliegue a ecosistema Apple. Cualquier uso en servidores con GPU NVIDIA exige una conversion de formato no documentada en el repositorio.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/jduraes/Holo4-35B-A3B-oQ4
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Blog oficial de H Company sobre Holo4: https://huggingface.co/blog/Hcompany/holo4
- Cobertura de Unite.AI: https://www.unite.ai/h-company-releases-holo4-open-weight-models-for-computer-use-agents/
- Cobertura de MarkTechPost: https://www.marktechpost.com/2026/09/29/h-company-releases-holo4-open-weight-computer-use-models-that-click-code-and-call-tools-across-desktop-web-android-and-apis/
- Cobertura de AI Understanding: https://aiunderstanding.org/news/h-company-releases-holo4-open-weight-models-for-computer-use-agents
- Cobertura de CCLeaks: https://ccleaks.com/news/holo4-open-weights-sep-2026
