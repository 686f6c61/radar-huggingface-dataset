# foreignerfromjupiter/hey-steph-e2b-lora

## Resumen

Hey Steph — E2B routing LoRA es un adaptador LoRA entrenado por el usuario foreignerfromjupiter para mejorar la precision de seleccion y enrutado de herramientas (tool selection/routing) del asistente de voz local para macOS denominado Hey Steph. No es un modelo autonomo: es un ajuste fino de bajo rango (rank 8, 1600 iteraciones, entrenado con `mlx_lm.lora`) sobre el modelo cuantizado `mlx-community/gemma-4-E2B-it-qat-4bit`, y se distribuye unicamente como adaptador que debe cargarse por encima de los pesos base.

El objetivo concreto es abaratar la inferencia sin perder calidad de decision: un modelo local mucho mayor (`gemma-4-26b-a4b-it-4bit`) actua como profesor y genera etiquetas reales de llamadas a herramientas para aproximadamente 250 ejemplos de comandos de voz reservados, y el adaptador se entrena para reproducir ese criterio en el modelo pequeno. El resultado declarado es un aumento de acierto en enrutado (de 91,3 % a 95,7 % en el conjunto de validacion de destilacion y de 92,6 % a 94,4 % en una suite de regresion mas amplia) con un coste medido de entre 0,1 y 0,15 segundos adicionales por llamada y cero regresiones respecto al modelo base.

Su relevancia es acotada pero clara: demuestra un flujo de destilacion profesor-alumno aplicado a una tarea de enrutado muy especifica dentro del ecosistema MLX (Apple Silicon), con evaluacion sobre conjuntos retenidos en lugar de limitarse a la perdida de entrenamiento. El repositorio es de publicacion muy reciente, sin descargas ni valoraciones, y no incluye especificaciones del modelo base mas alla de su identificador y su cuantizacion de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 8) sobre transformer del modelo base; arquitectura interna del base no disponible |
| Parametros totales | No disponible (modelo base identificado como `gemma-4-E2B-it-qat-4bit`; no se publican cifras) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits con QAT (quantization-aware training); adaptador LoRA en precision de entrenamiento de `mlx_lm.lora`, valor exacto no disponible |
| Idiomas soportados | No disponible (el asistente asociado procesa comandos de voz, idioma no especificado) |
| Licencia | Gemma (el adaptador hereda la licencia del modelo base) |
| Formato de pesos | Adaptador para la libreria `mlx-lm` (carga via `adapter_path`); formato de fichero concreto no especificado |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-15 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `mlx-community/gemma-4-E2B-it-qat-4bit`, un modelo cuantizado a 4 bits mediante QAT. El metodo es destilacion profesor-alumno: el profesor es `gemma-4-26b-a4b-it-4bit`, un modelo local de mayor tamano, que genero las etiquetas reales de llamadas a herramientas para unos 250 ejemplos de comandos de voz reservados (held-out). El alumno se ajusto con `mlx_lm.lora` con rango 8 durante 1600 iteraciones. No se detallan la composicion completa del dataset, el numero de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de proceso: el autor verifica el adaptador sobre conjuntos retenidos antes de desplegarlo y reporta el coste real de inferencia del adaptador en lugar de estimarlo. Ademas documenta un caveat tecnico relevante: fusionar (fuse) el adaptador en pesos independientes rompio la salida de llamadas a herramientas en inferencia real pese a superar la evaluacion, por lo que recomienda cargar siempre mediante `adapter_path` salvo que se revalide la salida fusionada con generaciones reales.

## Capacidades

- Enrutado y seleccion de herramientas (tool calling): el adaptador esta especializado en decidir que herramienta invocar ante un comando de voz, no en generar texto general.
- Rechazo de comandos ambiguos: segun el autor, el modelo ajustado declina correctamente ordenes ambiguas como "call mom" o "close every window right now" que el modelo base tendia a interpretar por conjetura.
- Integracion en un asistente de voz local: forma parte del asistente Hey Steph para macOS, con procesamiento local.
- Inferencia en Apple Silicon mediante la libreria `mlx-lm` / `mlx_vlm`.
- Destilacion de criterio desde un modelo mayor: reproduce el juicio de enrutado de `gemma-4-26b-a4b-it-4bit` en un modelo pequeno y rapido.
- Generacion de texto abierta, razonamiento, codigo, matematicas, vision, audio o capacidades multilingues: no documentadas para este adaptador en la informacion disponible.

## Casos de uso

- Enrutado de comandos de voz en un asistente de escritorio: el adaptador decide que herramienta del asistente invocar para cada transcripcion, con una latencia de aproximadamente 1,34 s por llamada segun las mediciones del autor, y permite mantener la respuesta local sin recurrir a un modelo mayor.
- Control de aplicaciones y del sistema en macOS: ordenes del tipo abrir, cerrar o cambiar de aplicacion se clasifican hacia la herramienta correspondiente; el adaptador mejora el rechazo de ordenes ambiguas que, ejecutadas a ciegas, podrian tener efectos no deseados sobre la sesion del usuario.
- Sustitucion de un modelo local grande por uno pequeno en produccion: al destilar el criterio de `gemma-4-26b-a4b-it-4bit` en un modelo E2B de 4 bits, se reduce el coste de memoria y de computo del enrutado manteniendo una precision declarada del 95,7 % en el conjunto de validacion de destilacion.
- Automatizacion personal domestica o de flujos: integrado en un asistente de voz, permite mapear frases naturales a acciones concretas (temporizadores, notas, musica, busquedas) mediante tool calling.
- Evaluacion y regresion de sistemas de enrutado: la suite de 54 casos y el conjunto de 46 casos descritos por el autor sirven como base para medir si cambios en el modelo base o en el conjunto de herramientas degradan la seleccion.
- Prototipado de agentes con tool calling en Apple Silicon: sirve como punto de partida reproducible (rango 8, 1600 iteraciones, `mlx_lm.lora`) para adaptar un modelo pequeno a un catalogo de herramientas propio.
- Filtro previo de intenciones antes de un modelo mayor: en arquitecturas de enrutado en cascada, el adaptador puede descartar comandos invalidos o ambiguos antes de escalar a un modelo de mayor tamano, evitando ejecuciones erroneas.

## Benchmarks y rendimiento

El autor publica resultados de evaluacion propia sobre conjuntos retenidos. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Conjunto de prueba | Modelo base | Con este adaptador |
|---|---|---|
| Destilacion, held-out (46 casos) | 42/46 (91,3 %) a 1,22 s/llamada | 44/46 (95,7 %) a 1,34 s/llamada |
| Suite de regresion de enrutado (54 casos) | 50/54 (92,6 %) a 1,34 s/llamada | 51/54 (94,4 %) a 1,39 s/llamada |

El autor indica cero regresiones en ambos conjuntos y un coste real medido de aproximadamente 0,1 a 0,15 segundos adicionales por llamada atribuible al calculo del adaptador. El hardware utilizado para esas mediciones no se especifica.

## Requisitos de hardware

- No hay requisitos publicados por el autor. El adaptador esta pensado para la libreria MLX, por lo que el despliegue esta limitado a equipos Apple Silicon (macOS).
- VRAM o memoria unificada estimada: no confirmada. Como referencia orientativa, un modelo de la familia E2B cuantizado a 4 bits suele ocupar del orden de 1,5 a 3 GB de memoria, mas el pequeno coste del adaptador de rango 8; esta cifra es una estimacion, no un dato del repositorio.
- GPU recomendadas: no disponibles para MLX. En el ecosistema de Apple, el modelo es apto en principio para chips de la serie M con memoria unificada suficiente, aunque no hay confirmacion oficial.
- Compatibilidad con GPU de consumo tipo RTX 4090: no aplicable directamente, ya que los pesos estan publicados para MLX y no se ofrece version GGUF ni safetensors estandar para llama.cpp.
- Opciones de despliegue: `mlx-lm` / `mlx_vlm` cargando el modelo base con `adapter_path`. No se documentan vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: entre 1,22 y 1,39 segundos por llamada de enrutado segun las mediciones del autor, con un incremento de 0,1 a 0,15 segundos por el adaptador; throughput en tokens por segundo no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas de alternativas comparables (parametros, contexto, licencia) en la informacion proporcionada. La comparacion posible se limita a las variantes implicadas en el propio proceso de destilacion:

| Modelo | Papel | Rendimiento de enrutado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| `gemma-4-E2B-it-qat-4bit` (base, sin adaptador) | Alumno sin ajustar | 91,3 % (46 casos) y 92,6 % (54 casos) | Gemma | MLX, en HuggingFace (mlx-community) |
| `gemma-4-E2B-it-qat-4bit` + este adaptador | Alumno ajustado | 95,7 % (46 casos) y 94,4 % (54 casos) | Gemma | Adaptador en HuggingFace |
| `gemma-4-26b-a4b-it-4bit` | Profesor que genera las etiquetas | No se publican metricas de enrutado del profesor | Gemma | Referenciado en la model card, no enlazado |

No hay datos publicados que permitan comparar con otros adaptadores de enrutado de terceros.

## Limitaciones y advertencias

- Ambito muy restringido: el adaptador se entrena sobre aproximadamente 250 ejemplos de comandos de voz de un asistente concreto; su comportamiento fuera de ese catalogo de herramientas o de ese dominio no esta evaluado.
- Tamano de evaluacion reducido: los conjuntos de prueba tienen 46 y 54 casos, por lo que las diferencias de 2 y 1 aciertos estan sujetas a alta varianza y no deben extrapolarse como mejora porcentual estable.
- Dependencia del proveedor: solo se publica en formato MLX, lo que excluye su uso directo en CUDA, ROCm o en runtimes como llama.cpp u Ollama sin conversion previa.
- Advertencia explicita del autor sobre el fusionado de pesos: fusionar el adaptador en pesos independientes rompio la salida de tool calling en inferencia real; se recomienda cargar con `adapter_path` y revalidar cualquier fusion.
- Ausencia de validacion independiente: 0 descargas y 0 valoraciones en el momento de la consulta; no hay replicacion externa de los resultados.
- Riesgo de alucinacion de herramientas: al tratarse de un modelo pequeno destilado, puede invocar herramientas inexistentes o con argumentos mal formados; se recomienda validacion del esquema de la llamada antes de ejecutarla.
- Sesgos: no documentados. No hay informacion sobre composicion del dataset, idiomas cubiertos, acentos ni diversidad de hablantes.
- Uso comercial: el adaptador hereda la licencia Gemma, por lo que se aplican los terminos de uso de Gemma del modelo base; el autor declara que los pesos del adaptador se liberan bajo los mismos terminos. Es necesario revisar dichos terminos antes de un despliegue comercial.
- Requisito de plataforma: al depender de MLX, el uso en produccion queda ligado a hardware Apple Silicon.
- Informacion incompleta del modelo base: no se publican en este repositorio parametros totales, longitud de contexto ni idiomas soportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/foreignerfromjupiter/hey-steph-e2b-lora
- Repositorio del asistente Hey Steph: https://github.com/ForeignerfromJupiter/hey-steph
- Modelo base: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-4bit
- Busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a sitios de contactos en bulgaro, sin relacion con el modelo).
