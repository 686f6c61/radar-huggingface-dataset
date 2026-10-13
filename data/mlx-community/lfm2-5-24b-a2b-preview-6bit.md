# mlx-community/LFM2.5-24B-A2B-Preview-6bit

## Resumen

LFM2.5-24B-A2B-Preview-6bit es una conversion al formato MLX del modelo LFM2.5-24B-A2B-Preview, desarrollado originalmente por Liquid AI, Inc. y publicado en el repositorio lq-preview/LFM2.5-24B-A2B-Preview. La conversion la ha realizado la organizacion mlx-community mediante la CLI de MLX-VLM sobre un Apple M3 Ultra, y esta fijada a la revision f772950ce6f17d35af5469d00334b61a9c2fc034 del modelo de origen. Se trata, por tanto, de un artefacto de despliegue optimizado para Apple Silicon, no de un entrenamiento nuevo.

El modelo es una mezcla de expertos (MoE, etiqueta lfm2_moe) con 23.971.587.712 parametros totales (unos 24B) y una ventana de contexto de 131.072 tokens segun la configuracion de origen. La nomenclatura "A2B" del nombre sugiere del orden de 2B parametros activos por token, aunque ese dato no se confirma en la informacion disponible. Soporta diez idiomas (ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano) y la model card indica explicitamente que se trata de un modelo de generacion de texto, no multimodal.

Su relevancia practica es doble: por un lado, permite ejecutar un MoE de ~24B en memoria unificada de Apple Silicon gracias a la cuantizacion affine de 6 bits (19,48 GB de pesos); por otro, es una de las primeras conversiones publicas de LFM2.5 y sirve como referencia para evaluar la familia antes de su lanzamiento estable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ninguna evaluacion de calidad mas alla de pruebas de humo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta lfm2_moe). No se detalla numero de expertos, dimension de capa ni patron de activacion |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | no disponible (el sufijo "A2B" sugiere ~2B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 131.072 tokens (segun la configuracion de origen) |
| Tipos de cuantizacion | Affine weight-only de 6 bits, group size 64. Proyecciones de router en affine de 8 bits, group size 64. Pesos no cuantizados en BF16; sesgos de routing de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (identificador "lfm1.0", license: other) |
| Formato de pesos | safetensors en formato MLX (libreria mlx / mlx-vlm); no se publican pesos GGUF ni PyTorch nativos en este repositorio |
| Tamano del repositorio | 19,5 GB (pesos: 19,48 GB en notacion decimal) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview |
| Revision fijada | f772950ce6f17d35af5469d00334b61a9c2fc034 |
| Entorno de conversion | MLX-VLM CLI, MLX 0.32.3, Transformers 5.17.0, MLX-VLM PR #2505, commit a6c7313bc053e5887616fa850808d21576eddf98 |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como una conversion y cuantizacion, no como un entrenamiento. La arquitectura se etiqueta como lfm2_moe, es decir, una mezcla de expertos de la familia LFM2.5, con 23.971.587.712 parametros totales y una ventana de contexto de 131.072 tokens. No se han publicado en esta informacion detalles sobre el numero de expertos, la estrategia de enrutamiento, la dimension oculta, el numero de capas ni si se emplean mecanismos hibridos (por ejemplo, atencion lineal o SSM) junto con la atencion clasica. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica documentada en este repositorio es la propia receta de cuantizacion para MLX: cuantizacion affine weight-only de 6 bits con group size 64 aplicada a los pesos, con las proyecciones del router en 8 bits (group size 64) para preservar la precision del enrutamiento de expertos, pesos no cuantizados en BF16 y sesgos de routing de expertos en FP32. La conversion se realizo con el comando de mlx_vlm convert fijando el dtype bfloat16 y el modo affine, y el export se recargo con coincidencia estricta de pesos. Las unicas verificaciones publicadas son pruebas de humo: el prefill y la decodificacion con cache produjeron logits finitos, y dos generaciones greedy cortas devolvieron "Paris" y "391" y alcanzaron EOS. La propia model card advierte que esto no constituye una evaluacion de calidad ni una prueba de contexto largo.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la model card especifica que es un modelo de generacion de texto.
- Modo de razonamiento previo a la respuesta: el modelo genera una cadena de razonamiento antes de la respuesta final, por lo que es necesario reservar un presupuesto de tokens de salida suficiente.
- Multilingue en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano, segun el campo language de la model card.
- Plantilla de chat incluida: el repositorio incorpora chat template y debe usarse para obtener el formato esperado.
- Contexto largo: la configuracion de origen declara 131.072 tokens, lo que habilita conversaciones multi-turno extensas y procesamiento de documentos largos, aunque no se ha validado con pruebas de contexto largo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el modo de razonamiento esta documentado, pero no su integracion con herramientas.
- Vision y audio: no disponible. Aunque el repositorio incluye la etiqueta mlx-vlm y se convirtio con MLX-VLM, la model card afirma explicitamente que es un modelo de generacion de texto.

## Casos de uso

- Inferencia local en Mac para desarrollo: con 19,48 GB de pesos, el modelo cabe en equipos Apple Silicon con memoria unificada amplia, lo que permite trabajar sin conexion y sin enviar datos a servicios externos. Es adecuado para prototipado de asistentes conversacionales en estaciones de trabajo Mac.
- Procesamiento de documentos largos en local: los 131.072 tokens de contexto permiten cargar informes, contratos o transcripciones extensas en una sola ventana. Encaja en flujos de resumen y extraccion de informacion donde la confidencialidad impide usar APIs externas, siempre que se asuma que no hay benchmark publicado de recuperacion a esa longitud.
- Atencion al cliente multilingue en fase de prototipo: al cubrir espanol, portugues, frances, aleman, italiano, arabe, chino, japones y coreano, sirve para validar un unico modelo poliglota en lugar de mantener varios. El formato MLX lo limita a entornos Apple Silicon, asi que es razonable como banco de pruebas antes de pasar a despliegue en servidor.
- Asistencia a la programacion en equipos pequenos: el modelo puede integrarse en un asistente de codigo autoalojado para equipos que ya trabajan en Mac. No hay datos publicados de HumanEval ni de soporte de tool calling, por lo que su uso en produccion deberia ir precedido de una evaluacion propia sobre el repositorio de codigo del equipo.
- Analisis y razonamiento guiado por cadena de pensamiento: el modo de razonamiento previo a la respuesta es util en tareas de clasificacion, diagnostico o planificacion donde interesa auditar el razonamiento intermedio. Hay que dimensionar max-tokens con holgura, porque el texto de razonamiento consume presupuesto de salida.
- Investigacion sobre cuantizacion de MoE: el repositorio documenta la receta completa (6 bits affine, group size 64, router en 8 bits, sesgos en FP32) y el script de conversion, lo que lo convierte en un caso de estudio reproducible para medir el impacto de la cuantizacion del router en un MoE de ~24B.
- Evaluacion comparativa interna de la familia LFM2.5: al estar fijado a una revision concreta del modelo base, permite reproducir experimentos y comparar contra la version sin cuantizar o contra otras recetas de cuantizacion con un punto de referencia estable.
- Despliegue offline en campo: escenarios con conectividad limitada (inspeccion tecnica, trabajo de campo) donde se necesita un asistente de texto en un portatil Mac sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente报告 pruebas de humo: coincidencia estricta de pesos al recargar, logits finitos en prefill y decodificacion con cache, y dos generaciones greedy que devolvieron "Paris" y "391" y alcanzaron EOS. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones con modelos similares.

| Prueba | Resultado | Notas |
|---|---|---|
| Carga estricta de pesos | correcta | Verificacion declarada en la model card |
| Logits finitos en prefill y decodificacion con cache | correcta | Verificacion declarada en la model card |
| Generacion greedy corta (capital de Francia) | "Paris" | Prueba de humo, alcanzo EOS |
| Generacion greedy corta (aritmetica) | "391" | Prueba de humo, alcanzo EOS |
| MMLU, HumanEval, GSM8K y similares | no disponible | No publicados |
| Prueba de contexto largo a 131.072 tokens | no disponible | La model card indica explicitamente que no se realizo |

## Requisitos de hardware

- VRAM / memoria unificada estimada: 19,48 GB solo para pesos, mas cache KV y asignaciones temporales. Con contexto de 131.072 tokens, la cache KV puede crecer de forma significativa y no se ha publicado su huella real.
- Plataforma obligatoria: MLX requiere Apple Silicon (macOS). Este export no se puede ejecutar directamente en GPU NVIDIA o AMD con las herramientas habituales de CUDA.
- Hardware probado: Apple M3 Ultra, equipo en el que se realizo la conversion y las pruebas de humo.
- Equipos consumer compatibles: cualquier Mac con memoria unificada suficiente para alojar pesos mas cache, en la practica configuraciones de 32 GB o superiores, con 64 GB o mas recomendables para contexto largo. No es un modelo apto para Macs de 16 GB.
- GPU NVIDIA y AMD: no aplicable a este repositorio concreto. Seria necesario acudir a la version original sin cuantizar o a otra receta de cuantizacion.
- Opciones de despliegue: MLX-VLM (libreria declarada), usando python -m mlx_vlm generate con MLX 0.32.3 y Transformers 5.17.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta informacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de alternativas en la informacion proporcionada, por lo que no es posible una comparativa de calidad. La unica comparacion documentada es entre este export y los artefactos directamente relacionados.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/LFM2.5-24B-A2B-Preview-6bit | 23.971.587.712 | 131.072 | 6 bits affine |
| LFM Open License v1.0 | safetensors MLX | Publico, 0 descargas |
| lq-preview/LFM2.5-24B-A2B-Preview | no disponible | 131.072 | Sin cuantizar (origen) | LFM Open License v1.0 | no disponible | Publico, modelo base |
| nativ-community/LFM2.5-24B-A2B-Preview-6bit | 23.971.587.712 | 131.072 | 6 bits affine | LFM Open License v1.0 | safetensors MLX | Publico, archivos identicos |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado modelos comparables |

## Limitaciones y advertencias

- Modelo en estado preview: la propia denominacion "Preview" indica que no es una version estable. No hay compromiso publicado de mantenimiento ni de actualizaciones.
- Ausencia total de evaluacion de calidad: no existen benchmarks ni evaluaciones independientes. Las unicas verificaciones son pruebas de humo de una o dos generaciones cortas.
- Impacto de la cuantizacion no medido: se desconoce en que grado la cuantizacion de 6 bits en pesos y de 8 bits en el router afecta a la calidad frente al modelo base sin cuantizar. Esta es precisamente la pregunta abierta que el repositorio no responde.
- Contexto largo sin validar: aunque la configuracion declare 131.072 tokens, no se ha realizado ninguna prueba a esa longitud. El rendimiento real en contexto largo es desconocido y el consumo de memoria de la cache KV puede ser elevado.
- Dependencia de plataforma: el formato MLX restringe el uso a Apple Silicon. No hay pesos GGUF ni safetensors PyTorch en este repositorio, lo que complica el despliegue en servidores con GPU.
- Herramientas no confirmadas: no hay informacion sobre tool calling, function calling, uso en agentes ni integracion con frameworks de orquestacion.
- Vision no confirmada: aunque el repositorio esta etiquetado con mlx-vlm, la model card afirma que es un modelo de generacion de texto. No debe asumirse capacidad multimodal.
- Riesgo de alucinacion: como en cualquier modelo generativo, existe riesgo de fabricar datos, especialmente en dominios especializados y en tareas de razonamiento largo. No hay estudios de calibracion ni de tasas de alucinacion.
- Sesgos: no se han publicado analisis de sesgos, ni de comportamiento diferencial entre los diez idiomas declarados. Es previsible un rendimiento desigual entre idiomas con menos representacion en los datos de entrenamiento, pero no hay datos que lo cuantifiquen.
- Licencia: los pesos se distribuyen bajo la LFM Open License v1.0, identificada como "other". Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial, ya que en esta informacion no se detallan sus terminos ni restricciones.
- Advertencia de procedencia: el modelo base pertenece a un espacio de nombres de previsualizacion (lq-preview) y no hay confirmacion en la informacion disponible de que corresponda a un lanzamiento oficial de Liquid AI.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues documentadas. No hay comunidad que haya validado el export de forma independiente.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-6bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Copia identica en la organizacion nativ-community: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-6bit
- Pull request de MLX-VLM con el port de LFM2.5: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE (enlace relativo al propio repositorio)
- Aviso de modificaciones de conversion y cuantizacion: archivo NOTICE del repositorio
- Ajustes y versiones del proceso de conversion: archivo conversion_info.json del repositorio
- Resultados de busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre el modelo (unicamente resultados de contenido para adultos, ajenos por completo al objeto de esta ficha). No se dispone por tanto de paper, blog de anuncio, repositorio oficial adicional ni demo asociados.
