# RunningHubAI/rh-b-krea2-turbo-bf16-unet

## Resumen

rh-b-krea2-turbo-bf16-unet es un UNET de difusion para generacion y edicion de imagenes a partir de texto, publicado por RunningHubAI en nombre del autor (usuario @AIGC_W). Se presenta como la variante de alta velocidad de la serie Krea2, afinada desde el modelo krea2 y entrenada e inferida en precision bfloat16. El repositorio ocupa 26,3 GB y contiene un unico fichero de pesos, `krea2AIGCWv2.safetensors`, de 25 063 MiB, etiquetado como UNET.

Su proposito declarado es reducir el coste de inferencia: la model card recomienda el muestreador Euler con solo 8 pasos y CFG 1, lo que lo orienta a iteracion rapida, generacion por lotes y entornos con recursos limitados. Destaca, segun el autor, en la reproduccion de detalle realista (piel, rostro, cabello, texturas de ropa) para retratos, imagenes de producto y visuales de concepto.

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y su unico formato de distribucion es un fichero de pesos bf16 para ComfyUI. La informacion publicada es muy escasa (sin licencia, sin idiomas, sin benchmarks y sin documentacion del dataset), y el repositorio registraba 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que cualquier evaluacion cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (la model card solo indica "UNET" y que deriva de krea2; no detalla bloques ni variante) |
| Parametros totales | no disponible (estimacion no confirmada: en torno a 13 000 millones si el fichero de 25 063 MiB contuviera unicamente parametros en bf16, 2 bytes por parametro) |
| Parametros activos | no aplica (no es un modelo MoE; la model card no menciona mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes; no procesa secuencias de texto propias). Resolucion de entrenamiento: no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en bf16 dentro de un fichero safetensors |
| Idiomas soportados | no disponible (la model card esta redactada en ingles y chino, pero no especifica idiomas de prompt) |
| Licencia | no disponible; el repositorio indica que RunningHub publica en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original o del modelo base, sin incluir texto de licencia |
| Formato de pesos | safetensors (fichero unico `krea2AIGCWv2.safetensors`, 25 063 MiB; el repositorio completo ocupa 26,3 GB) |
| Tipo de modelo | UNET (image edit), segun la propia model card; pipeline declarado `image-text-to-image` |
| Precision | bfloat16 (entrenamiento e inferencia) |
| Parametros de generacion recomendados | muestreador Euler, 8 pasos, CFG 1 |
| Plataformas | ComfyUI, RunningHub y Hugging Face |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-07 |
| Descargas / "me gusta" | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificarla como UNET y de indicar que el modelo esta afinado a partir de krea2. No se documentan el numero de bloques, el mecanismo de atencion, la inclusion de mecanismos de control adicionales ni si existe destilacion por pasos; el termino "turbo" y los 8 pasos recomendados apuntan a una optimizacion para inferencia en pocos pasos, pero el metodo concreto no se especifica. Dado que el repositorio solo contiene el UNET, se deduce que el resto de componentes del pipeline de difusion (VAE y codificador de texto) deben aportarse por separado; este extremo no esta confirmado en la documentacion publicada.

Tampoco hay informacion sobre el entrenamiento: no se indica el volumen de tokens o pares imagen-texto, la composicion del dataset, el uso de RLHF/DPO o de tecnicas de preferencia, ni el regimen de entrenamiento (learning rate, hardware, duracion). La unica referencia tecnica concreta es la precision bf16 y la recomendacion de no aumentar los pasos de muestreo, ya que el modelo esta disenado para funcionar con 8 pasos y CFG bajo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) dentro de un pipeline de difusion.
- Edicion de imagenes: la model card clasifica el modelo como "UNET (image edit)" y el pipeline declarado es `image-text-to-image`.
- Inferencia rapida: 8 pasos con muestreador Euler y CFG 1, orientada a iteracion y generacion por lotes.
- Reproduccion de detalle realista segun el autor: piel humana, rasgos faciales, mechones de cabello y texturas de ropa.
- Escenarios declarados: retratos realistas, imagenes de producto, imagenes de escena y visuales conceptuales.
- Ejecucion en bf16 nativo, sin necesidad de conversion de precision por parte del usuario.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Iteracion rapida de concepto visual: con 8 pasos y CFG 1, el modelo permite generar varias propuestas de una misma idea en el tiempo que un modelo estandar tardaria en completar una sola pasada, lo que encaja en fases tempranas de direccion de arte.
- Generacion por lotes para catalogos de producto: la model card lo orienta explicitamente a "product visuals" y a generacion por lotes; con prompts que fijen fondo, iluminacion y angulo se pueden producir variantes consistentes de un mismo articulo.
- Retratos realistas para estudio de diseno: el autor destaca la recuperacion de piel, rasgos y cabello, lo que resulta util para pruebas de maquillaje, styling o previsualizacion de personajes antes de un shooting real.
- Edicion de imagen en flujos ComfyUI: al distribuirse como UNET para ComfyUI, puede insertarse en grafos de edicion (inpainting, retoque, variaciones) sustituyendo el nodo de carga del modelo, siempre que se disponga del resto de componentes del pipeline.
- Previsualizacion de escenas y storyboards: para produccion audiovisual o publicidad, permite generar encuadres y ambientaciones de referencia que se revisan antes de invertir en rodaje o render 3D.
- Prototipado de producto digital: equipos que necesitan imagenes de relleno en maquetas, documentacion o demos pueden generar material coherente sin depender de bancos de imagenes con licencia.
- Despliegue en entornos con GPU de 40-48 GB: al no requerir cuantizacion adicional y funcionar en bf16, encaja en nodos de inferencia dedicados (A100 40 GB, L40S, RTX 6000 Ada) con tiempos de generacion reducidos por el bajo numero de pasos.
- Uso a traves de la API de RunningHub: para equipos que no quieran gestionar la infraestructura, la plataforma del autor ofrece ejecucion remota y una API documentada, evitando el coste de una GPU con suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con el modelo base krea2 o con otras variantes de la serie. Tampoco se aportan mediciones de latencia, throughput ni consumo de VRAM.

## Requisitos de hardware

- Peso de los parametros: el fichero `krea2AIGCWv2.safetensors` ocupa 25 063 MiB (aproximadamente 24,5 GiB), dato confirmado en la model card.
- VRAM estimada para inferencia en bf16: no disponible de forma oficial. Como estimacion propia a partir del tamano del fichero, cargar el UNET completo mas el VAE y el codificador de texto del pipeline exigiria del orden de 26-30 GB de VRAM sin offloading.
- GPU profesionales recomendadas (estimacion, no confirmada por el autor): A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: no hay confirmacion de que quepa en tarjetas de 24 GB (RTX 3090, RTX 4090). En ComfyUI es posible la carga secuencial con descarga a memoria del sistema, pero no se documenta el rendimiento resultante.
- Opciones de despliegue confirmadas: ComfyUI, la plataforma RunningHub y la API de RunningHub. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI, que ademas no son herramientas orientadas a UNET de difusion.
- Latencia y throughput: no disponible. El unico indicador indirecto es la configuracion recomendada de 8 pasos, inferior a la de un modelo de difusion estandar, lo que reduce proporcionalmente el tiempo de muestreo.
- Almacenamiento: hay que reservar mas de 26 GB para el repositorio completo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables de alternativas, por lo que la comparacion cuantitativa queda como no disponible. La unica referencia interna de la model card es la version estandar (no turbo) de la serie Krea2.

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-b-krea2-turbo-bf16-unet | no disponible (estimacion no confirmada: ~13 000 millones) | no disponible | sin benchmarks publicados; 8 pasos recomendados | no disponible | Hugging Face, ComfyUI, RunningHub |
| Krea2 (version estandar, referenciada como base) | no disponible | no disponible | la model card afirma que la variante turbo es mas rapida manteniendo calidad "relativamente alta" | no disponible | no disponible |
| Otras alternativas de la misma categoria (UNET turbo para difusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye texto de licencia y remite al proyecto original o al modelo base. El uso comercial queda sin definir y requiere consulta previa al autor o a RunningHub.
- Ausencia total de benchmarks: no hay metricas objetivas que respalden las afirmaciones de calidad de la model card, que son cualitativas y proceden del propio autor.
- Dataset no documentado: se desconoce la composicion de los datos de entrenamiento, por lo que no se pueden evaluar sesgos demograficos, culturales o de representacion en los rostros, cuerpos o escenarios generados.
- Riesgo de artefactos: como todo modelo de difusion, puede producir anatomias incorrectas, manos deformes, texto ilegible dentro de la imagen y errores de perspectiva, especialmente con prompts ambiguos.
- Restriccion de parametros: la model card advierte explicitamente de que no conviene aumentar los pasos de muestreo; subirlos por encima de 8 no mejora el resultado y encarece la inferencia.
- Dependencia del prompt: el autor recomienda prompts que especifiquen sujeto, estilo, luz, composicion y detalle; con entradas vagas el resultado es menos estable.
- Componentes incompletos: el repositorio solo contiene el UNET. Sin el VAE y el codificador de texto correspondientes al modelo base no es posible ejecutarlo, y no se especifica donde obtenerlos.
- Poca validacion por la comunidad: 0 descargas y 0 "me gusta", con una ventana de publicacion de unos 11 minutos entre creacion y ultima actualizacion. No hay evidencia de uso en produccion.
- Idiomas no especificados: se desconoce si el modelo responde igual de bien a prompts en castellano o si esta optimizado para ingles y chino.
- Coste de hardware: con mas de 24 GiB de pesos en bf16, no es un modelo apto para GPUs de consumo sin offloading, lo que encarece su despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-b-krea2-turbo-bf16-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2084129245047119874
- Pagina del autor (@AIGC_W): https://www.runninghub.cn/user-center/1855894180588609538
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
