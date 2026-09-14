# mradermacher/Dahono-4B-GGUF

## Resumen
Dahono-4B es un modelo de lenguaje de 4.326.350.848 parametros (~4,3 B) especializado en el ambito juridico indonesio. Fue desarrollado por DahonoLabs y esta publicado originalmente en formato safetensors como `DahonoLabs/Dahono-4B`; la ficha que nos ocupa es la version cuantizada a GGUF realizada por mradermacher, un autor habitual de cuantizaciones para llama.cpp. El modelo se distribuye bajo licencia Apache 2.0.

Su proposito es cubrir tareas de legal-ai y regtech aplicadas a la legislacion de Indonesia, segun indican las etiquetas del repositorio, que hacen referencia explicita al KUHPerdata (Codigo Civil) y al KUHP (Codigo Penal). Ademas de texto, incorpora un componente multimodal mediante ficheros `mmproj`, orientado a la inspeccion de documentos, y declara soporte de function calling. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen GRPO y reasoning-RL, lo que indica que el entrenamiento del modelo base incluyo una fase de ajuste por refuerzo orientada al razonamiento.

Su relevancia actual es doble: por un lado cubre un nicho poco atendido, como es el razonamiento juridico en indonesio; por otro, al estar disponible en GGUF permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o alternativas compatibles, algo que no seria viable con el modelo base en precision completa si este requiriese infraestructura mayor. La informacion publica disponible no detalla la longitud de contexto ni el volumen de tokens de entrenamiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 segun las etiquetas del repositorio (`qwen`, `qwen3_5`); con componente multimodal (ficheros `mmproj`). No se detalla la configuracion exacta de capas ni cabezas de atencion |
| Parametros totales | 4.326.350.848 (~4,3 B), dato de safetensors del modelo base |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas de mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | Indonesio (`id`) declarado de forma explicita; no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base `DahonoLabs/Dahono-4B` |

## Arquitectura y entrenamiento
La informacion disponible no incluye una descripcion arquitectonica detallada. Las etiquetas del repositorio apuntan a la familia Qwen3.5 (`qwen`, `qwen3_5`), lo que situa el modelo en la estirpe de transformers densos de Qwen, con un tamano de 4,3 B de parametros. La presencia de los ficheros `mmproj` (proyector multimodal) confirma que el modelo incorpora capacidades de vision para la inspeccion de documentos, una funcionalidad coherente con el etiquetado `multimodal` y `document-inspection`.

En cuanto al entrenamiento, el pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `grpo` y `reasoning-rl`, lo que sugiere que el modelo base fue sometido a una fase de ajuste por refuerzo con GRPO orientada a mejorar el razonamiento, probablemente sobre un corpus juridico indonesio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativa.

El repositorio que nos ocupa no entrena nada: aplica cuantizacion estatica sobre el modelo base, con una version de cuantizacion declarada como `quantize_version: 2` y `output_tensor_quantised: 1` en los metadatos internos del README. Se indica que no hay disponibles cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.

## Capacidades
- Generacion de texto y razonamiento en indonesio, con orientacion especifica al dominio juridico.
- Consulta y analisis de normativa indonesia: el repositorio referencia explicitamente el KUHPerdata y el KUHP.
- Soporte de function calling / tool calling, segun la etiqueta `function-calling`.
- Capacidad multimodal para inspeccion de documentos: incluye proyector `mmproj` en Q8_0 y f16, lo que permite procesar imagenes de documentos junto al texto.
- Razonamiento reforzado: el etiquetado `reasoning-rl` y `grpo` indica entrenamiento con refuerzo orientado a tareas de razonamiento multi-paso.
- Enfoque de aplicacion en legal-ai y regtech: analisis documental, extraccion de clausulas y asistencia en cumplimiento normativo.
- Capacidades multilingues: no disponible; solo se declara indonesio.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso
- Analisis de contratos en indonesio: el modelo puede revisar un contrato y senalar clausulas potencialmente problematicas a la luz del KUHPerdata, aprovechando su ajuste especifico sobre normativa civil indonesia.
- Asistencia en despachos juridicos locales: borrador inicial de escritos, resumenes de expedientes y busqueda de precedentes redactados en indonesio, un idioma con poca cobertura en modelos generalistas.
- Cumplimiento normativo (regtech) en entidades financieras indonesias: revision automatizada de politicas internas frente a requisitos regulatorios, con salida estructurada mediante function calling para integrarse en un sistema de ticketing.
- Inspeccion de documentos escaneados: gracias al proyector `mmproj`, puede procesar imagenes de documentos (contratos firmados, resoluciones, notificaciones) y extraer el contenido textual relevante para su posterior analisis.
- Extraccion de datos estructurados de resoluciones judiciales: uso de tool calling para devolver campos concretos (partes, articulo invocado, fallo) que alimenten una base de datos interna.
- Clasificacion y enrutado de consultas legales: primera capa de triaje en un asistente juridico, decidiendo si la consulta corresponde a materia civil, penal o administrativa antes de derivarla a un especialista o a un modelo mayor.
- Formacion y divulgacion juridica: generacion de explicaciones divulgativas sobre articulos concretos del KUHP para plataformas educativas, con la advertencia de que la salida debe ser revisada por un profesional.
- Despliegue en entornos con hardware limitado: al disponer de cuantizaciones desde 2,1 GB, es viable ejecutarlo en portatiles o servidores modestos de organizaciones juridicas sin acceso a GPU de gama alta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas del dominio juridico indonesio, y la busqueda web realizada no ha devuelto datos relevantes sobre el modelo.

## Requisitos de hardware
- VRAM estimada para inferencia, a partir del tamano de los ficheros de pesos (sin contar cache KV, que depende del contexto configurado):
  - Q2_K: 2,1 GB de pesos; ~3 GB de VRAM efectiva.
  - Q4_K_M: 2,9 GB de pesos; ~4 GB de VRAM efectiva (recomendado como equilibrio calidad/tamano).
  - Q6_K: 3,7 GB de pesos; ~5 GB de VRAM efectiva.
  - Q8_0: 4,7 GB de pesos; ~6 GB de VRAM efectiva.
  - f16: 8,8 GB de pesos; ~10-11 GB de VRAM efectiva.
  - Componente multimodal: anadir 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- GPU recomendadas: para f16, una RTX 4080, RTX 4090, A100 o H100 con margen amplio; para Q8_0 y Q6_K, una RTX 3060 de 12 GB o RTX 4070; para Q4_K_M, cualquier GPU con 6-8 GB.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas puede ejecutar las cuantizaciones Q4 y Q5; las variantes Q2_K y Q3_K_S caben incluso en iGPU con memoria compartida, con perdida de calidad notable.
- Alternativa en CPU: con cuantizaciones de 2-3 GB es viable la inferencia en CPU con llama.cpp, con velocidades limitadas pero funcionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI; este repositorio, al ser GGUF, no es directamente servible por vLLM.
- Latencia y throughput estimados: no disponible; el repositorio no publica mediciones.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria (asistentes juridicos en indonesio o modelos densos de ~4 B especializados en dominio legal), por lo que no es posible establecer una comparacion verificable. El unico modelo directamente relacionado que se documenta es el propio modelo base, `DahonoLabs/Dahono-4B` en safetensors, del cual esta version es una cuantizacion.

## Limitaciones y advertencias
- Cobertura idiomatica restringida: solo se declara indonesio. No hay evidencia de competencia en castellano ni en otros idiomas.
- Ambito de dominio cerrado: esta ajustado a legislacion indonesia (KUHPerdata, KUHP) y su utilidad fuera de ese marco juridico es cuestionable.
- Riesgo de alucinacion en contenido legal: la generacion de referencias a articulos, citas o jurisprudencia puede producir textos plausibles pero incorrectos. Cualquier salida con repercusion juridica debe ser verificada por un profesional habilitado.
- Sesgos: no hay documentacion sobre sesgos de entrenamiento. En un corpus juridico, es esperable una sobrerrepresentacion de determinadas fuentes normativas y doctrinales.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor original no ofrece garantias ni asume responsabilidad por el uso del modelo.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S (2,1-2,2 GB) reducen la precision de forma perceptible. El propio repositorio marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M.
- Longitud de contexto desconocida: no se publica la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos extensos sin una validacion empirica previa.
- Capacidad multimodal sin evaluacion publica: aunque se incluyen los ficheros `mmproj`, no hay datos sobre la calidad de la inspeccion de documentos ni sobre el rango de resoluciones soportado.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, y ausencia de benchmarks publicados. No hay evidencia de validacion independiente.
- No apto como asesoramiento juridico automatizado sin supervision humana: por su tamano y su naturaleza estadistica, no sustituye la revision de un abogado colegiado.

## Enlaces
- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Dahono-4B-GGUF
- Modelo base en safetensors: https://huggingface.co/DahonoLabs/Dahono-4B
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Dahono-4B-GGUF
- Guia general de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empleador del autor, nethype GmbH: https://www.nethype.de/
