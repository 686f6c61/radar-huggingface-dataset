# flowcorp-ch/BudgieScribe-fr

## Resumen

BudgieScribe-fr es un modelo de normalizacion de texto frances para salidas de sistemas de reconocimiento automatico del habla (ASR). Lo desarrolla flowcorp-ch y es un ajuste fino completo (full fine-tune) del modelo Qwen3-0.6B, con 596.049.920 parametros. Su funcion es recibir una transcripcion cruda de un dictado en frances —en minusculas, sin puntuacion, con muletillas, arranques falsos, autocorrecciones y cifras escritas con palabras— y reescribirla como el texto que el hablante queria dictar.

No es un modelo conversacional: no responde, no resume, no traduce ni anade contenido. Se controla mediante una linea de control al inicio de la entrada con cuatro ejes (`Styling`, `Structure`, `Context` y `Lang`) y se sirve como GGUF cuantizado en Q4_K_M. Es el modelo de limpieza frances que se distribuye dentro de Budgie Echo, una aplicacion de dictado local para macOS y Windows.

Su relevancia actual radica en que ataca un cuello de botella concreto de los pipelines de voz: la diferencia entre una transcripcion literal y un texto utilizable. Al ser un modelo de 0,6 B, se ejecuta en GPU de consumo con una latencia de decodificacion declarada de ~436 tok/s, lo que permite integrarlo en aplicaciones de dictado en tiempo real sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), ajuste fino completo |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en servicio; la entrada se trocea a 1200 bytes |
| Tipos de cuantizacion | Q4_K_M publicado (16,00 → 5,24 bits por peso); otros tipos no disponibles |
| Idiomas soportados | frances (fr) |
| Licencia | budgiescribe-license (Apache 2.0 mas una clausula de nombrado) |
| Formato de pesos | GGUF (`scribe-v9-Q4_K_M.gguf`, 396.704.576 bytes / 378,3 MiB) |

Otros datos declarados: SHA-256 del fichero `5df4ab0d5a1a481c90cfd21a621b68d47f09600651438549c7605aa8ffb28463`; build interna `scribe-v9` (fase 3); decodificacion greedy obligatoria (`temperature 0`, `top_k 1`) con thinking desactivado; runtime de referencia llama.cpp b10816.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se ha ajustado de forma completa (no mediante adaptadores) para una unica tarea de reescritura de transcripciones. La decodificacion esta fijada a greedy con thinking deshabilitado, lo que refuerza el caracter determinista del modelo: la salida de la version Q4_K_M es identica, caracter por caracter, a la del modelo en fp32 sobre el conjunto de control de la release. El modelo se entreno con una cadena de sistema exacta (la que aparece en la model card) y con la sintaxis de linea de control `[Styling: ...] [Structure: ...] [Context: ...] [Lang: fr]`; el contrato completo de gramatica, entradas, salidas, invariantes y decodificacion esta documentado en `FORMAT.md`.

El unico dataset declarado en la model card es `linagora/SUMM-RE`. No se especifica el numero de tokens de entrenamiento, la composicion detallada del corpus, ni si se emplearon tecnicas de RLHF o DPO; estos datos figuran como no disponibles. El proyecto publica el pipeline de entrenamiento, los generadores y la evaluacion en `github.com/gobudgie/budgie-scribe`, e invita explicitamente a contribuir con pares de dictado reales.

## Capacidades

- Eliminacion de pausas llenas y muletillas (`euh`, `bah`, `ben`, `hum`), repeticiones involuntarias («le le chat» → «le chat») y arranques falsos.
- Resolucion de autocorrecciones al valor final elegido por el hablante («vendredi non pardon jeudi» → «jeudi»), con una medicion declarada de 476/476 sobre el conjunto de retencion.
- Restauracion de puntuacion y mayusculas, incluida tipografia francesa: una interrogacion directa termina en « ? » precedido de espacio (503 ocurrencias con espacio frente a 21 sin espacio en el corpus); una interrogacion indirecta toma punto.
- Normalizacion inversa de texto (ITN): convierte la forma, nunca el valor. Ejemplos: «vingt-trois mille quatre cent cinquante euros» → `23 450 euros`; «quatorze heures trente» → `14h30`; «le trois mars deux mille vingt-six» → `le 3 mars 2026`; «vingt-cinq pour cent» → `25 %`.
- Normalizacion de correos y URL dictados: «support arobase gobudgie point com» → `support@gobudgie.com`; «github point com slash docs» → `github.com/docs`.
- Control de estilo mediante linea de control con cuatro ejes: `Styling` (casual, semi-casual, semi-formal, formal), `Structure` (prose, lists), `Context` (general, email) y `Lang` (fr).
- Formato de lista: con `Structure: lists` puede emitir una lista de vinetas Markdown cuando el contenido es una enumeracion real de al menos tres elementos; con `prose` las prohibe.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; la entrada es siempre texto y la salida es siempre texto limpio.

## Casos de uso

- Post-procesado de dictado en aplicaciones de escritorio: BudgieScribe-fr es el modelo que sirve Budgie Echo para convertir la transcripcion cruda en texto legible antes de insertarla en el campo de escritura del usuario. Su tamano (~378 MiB) y velocidad permiten ejecutarlo en local sin conexion.
- Limpieza de transcripciones de reuniones: se puede encadenar a un motor ASR en frances para eliminar muletillas y autocorrecciones, restaurar puntuacion y normalizar cifras antes de almacenar las actas o pasarlas a un resumidor.
- Generacion de subtitulos y transcripciones publicables: aplicando `Structure: prose` se obtiene texto continuo con puntuacion y mayusculas; con `Structure: lists` se pueden extraer enumeraciones como listas de acciones.
- Redaccion de correos por voz: con `Context: email` el modelo maqueta el texto como un mensaje, lo que encaja en flujos donde el usuario dicta el cuerpo de un correo y espera un formato de mensaje (con la salvedad del saludo anadido, ver limitaciones).
- Normalizacion de datos de entrada para pipelines de NLP: convertir transcripciones crudas a texto con cifras, porcentajes, fechas, correos y URL en formato canonico facilita el posterior anonimizado, indexado o analisis.
- Accesibilidad y dictado asistido: personas con movilidad reducida o dislexia pueden dictar sin preocuparse por la puntuacion, las repeticiones o la escritura de cifras, y obtener un texto listo para enviar.
- Preprocesado de corpus ASR para evaluacion o entrenamiento: dado que la salida ITN es determinista y verificable, sirve para homologar transcripciones heterogeneas antes de compararlas o anotarlas.
- Integracion en herramientas de toma de notas en frances: al ser GGUF y funcionar con llama.cpp, se puede incrustar en aplicaciones de escritorio o en servicios locales con una huella de memoria minima.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son los siguientes:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Resolucion de autocorrecciones | 476/476 | Conjunto de retencion |
| Equivalencia Q4_K_M vs fp32 | Identica caracter por caracter | Conjunto de control de la release |
| Tipografia francesa (espacio antes de « ? ») | 503 con espacio frente a 21 sin espacio | Medicion sobre el corpus |
| Velocidad de decodificacion | ~436 tok/s | Radeon AI PRO R9700, Vulkan |
| Tiempo por frase | ~0,09 s | Radeon AI PRO R9700, Vulkan |
| Tiempo de carga | 0,8 s | Radeon AI PRO R9700, Vulkan |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible; el modelo esta orientado a una tarea especifica de normalizacion y la model card remite a su seccion de evaluacion para las debilidades conocidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en Q4_K_M (el fichero pesa 378,3 MiB); otros tipos de cuantizacion no disponibles.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 2 GB o mas de memoria, incluidas GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090 o equivalentes.
- Tambien puede ejecutarse en CPU, aunque el rendimiento declarado (~436 tok/s) corresponde a una GPU Radeon AI PRO R9700 con backend Vulkan.
- Opciones de despliegue: llama.cpp (version de referencia b10816), `llama-server` con plantilla Jinja y `--chat-template-kwargs '{"enable_thinking":false}'`; tambien es compatible con entornos que consuman GGUF mediante llama.cpp o wrappers equivalentes. Ollama, vLLM y TGI no estan confirmados en la informacion disponible.
- Parametros de servicio recomendados por el autor: `--temp 0 --top-k 1 --ctx-size 4096 --n-gpu-layers 999 --parallel 1`.
- Latencia medida: 0,8 s de carga y ~0,09 s por frase en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgieScribe-fr | 0,6 B | 4096 tokens | Normalizacion de texto ASR en frances | budgiescribe-license (Apache 2.0 + clausula de nombrado) | GGUF en HuggingFace |
| BudgieScribe-en | no disponible | no disponible | Normalizacion de texto ASR en ingles | no disponible | GGUF en HuggingFace (hermano) |
| Qwen3-0.6B (base) | 0,6 B | no disponible en esta ficha | Modelo de lenguaje general | Apache 2.0 | Pesos originales |

No se dispone de datos de benchmarks comparativos entre BudgieScribe-fr y otros normalizadores de texto para ASR en la informacion proporcionada, ni de modelos equivalentes de la misma categoria con metricas publicadas. Las alternativas citadas se limitan al modelo base y a su hermano en ingles.

## Limitaciones y advertencias

- No es un modelo conversacional: no responde, resume, traduce ni anade contenido mas alla de la limpieza solicitada.
- El eje `Styling` es inerte en esta build: el modelo se entreno unicamente con `semi-formal`, por lo que los valores `casual`, `semi-casual` y `formal` no producen el efecto esperado.
- Con `Context: email` el modelo anade un saludo que no fue dictado; es un comportamiento documentado y una fuente potencial de contenido no deseado.
- Riesgo de alucinacion inherente a la tarea: al reescribir, el modelo podria alterar valores, cifras o nombres. Aunque la ITN declara convertir la forma y no el valor, conviene validar salidas en dominios sensibles (importes, datos legales, medicos).
- Solo soporta frances (`Lang: fr`); no hay soporte multilingue.
- Contexto limitado a 4096 tokens, con troceado de entrada a 1200 bytes; textos largos deben fragmentarse.
- Decodificacion fijada a greedy (`temperature 0`, `top_k 1`); desviarse de estos parametros no esta validado por el autor.
- Los errores del motor ASR subyacente se propagan: el modelo limpia la forma, no corrige transcripciones incorrectas.
- Licencia con clausula de nombrado: aunque la base es Apache 2.0, existe un termino adicional de atribucion recogido en `LICENSE-MODEL` que debe revisarse antes de un uso comercial.
- Modelo recien publicado (0 descargas y 0 likes en el momento de la consulta), sin validacion independiente de la comunidad; el propio autor lo publica con sus debilidades documentadas y pide contribuciones.

## Enlaces

- [Modelo en HuggingFace: flowcorp-ch/BudgieScribe-fr](https://huggingface.co/flowcorp-ch/BudgieScribe-fr)
- [Modelo hermano en ingles: flowcorp-ch/BudgieScribe-en](https://huggingface.co/flowcorp-ch/BudgieScribe-en)
- [Licencia del modelo (LICENSE-MODEL)](https://huggingface.co/flowcorp-ch/BudgieScribe-fr/blob/main/LICENSE-MODEL)
- [Repositorio de entrenamiento y evaluacion: github.com/gobudgie/budgie-scribe](https://github.com/gobudgie/budgie-scribe)
- [Contrato de formato: FORMAT.md](https://github.com/gobudgie/budgie-scribe/blob/main/FORMAT.md)
- [Guia de contribucion: CONTRIBUTING.md](https://github.com/gobudgie/budgie-scribe/blob/main/CONTRIBUTING.md)
- [Aplicacion Budgie Echo](https://gobudgie.com/echo)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Dataset declarado: linagora/SUMM-RE](https://huggingface.co/datasets/linagora/SUMM-RE)
- [Runtime de referencia: llama.cpp (b10816)](https://github.com/ggml-org/llama.cpp)
