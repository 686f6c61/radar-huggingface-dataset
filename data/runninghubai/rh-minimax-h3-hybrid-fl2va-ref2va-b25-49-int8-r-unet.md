# RunningHubAI/rh-minimax-h3-hybrid-fl2va-ref2va-b25-49-int8-r-unet

## Resumen

`rh-minimax-h3-hybrid-fl2va-ref2va-b25-49-int8-r-unet` es un fichero de pesos en formato UNET publicado por RunningHubAI (RunningHub) para su uso en ComfyUI, RunningHub y Hugging Face. Se trata de un derivado ajustado (finetuned) a partir de `minimax-h3`, según declara el propio autor en la model card, y se distribuye como un único tensor `safetensors` de 19.999 MiB (aproximadamente 19,5 GiB), cuantizado a int8, dentro de un repositorio de 21,0 GB. El pipeline declarado es text-to-video, con la etiqueta `unet` propia de los flujos de difusión para vídeo.

La relevancia de esta publicación es fundamentalmente práctica: no es un modelo completo y autónomo, sino un componente de pesos pensado para cargarse en un grafo de ComfyUI o en la plataforma de RunningHub junto con el resto de piezas del pipeline (text encoder, VAE y, en su caso, el resto de bloques del modelo). Su nombre codifica varias decisiones de diseño que el autor no documenta en detalle: `h3-hybrid` apunta a la familia MiniMax-H3 en una variante híbrida, `fl2va` y `ref2va` sugieren condicionamiento por primer/último fotograma y por referencia, `b25-49` podría indicar un rango de bloques y `int8-r` la cuantización aplicada. Al no estar confirmados por el autor, estos extremos deben tratarse como no verificados.

El dato más relevante para quien evalúe el modelo es que se publica con 0 descargas y 0 likes, sin licencia declarada en Hugging Face, sin idiomas especificados y sin benchmarks. Es, por tanto, un artefacto recién subido (creado y actualizado el 25 de septiembre de 2026) cuya validación cualitativa depende enteramente de probarlo en ComfyUI o en la plataforma del proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para video (pipeline declarado: text-to-video); variante hibrida de la familia MiniMax-H3. Detalle interno de bloques y atencion: no disponible |
| Parametros totales | no disponible (el autor solo publica el tamano en disco del fichero de pesos) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de ventana de tokens de un LLM; no se documenta el numero de fotogramas ni la duracion maxima soportada) |
| Tipos de cuantizacion | int8 (sufijo `int8-r` en el nombre del fichero). No se ofrecen variantes fp16, bf16, fp8 ni GGUF en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible en Hugging Face; la model card indica "Follow the original project or upstream license", por lo que se remite a la licencia del proyecto original MiniMax-H3 |
| Formato de pesos | safetensors (fichero unico `minimax_h3_hybrid_fl2va_ref2va_b25-49-int8_r.safetensors`, 19.999 MiB) |

Datos adicionales del repositorio: tamano total 21,0 GB, etiquetas `comfyui`, `unet`, `text-to-video`, `region:us`; autor RunningHubAI; creado el 2026-09-25T20:32:27Z y actualizado el mismo dia a las 20:39:03Z.

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna mas alla de identificarla como UNET de difusion para generacion de video y de indicar que deriva de `minimax-h3`. No se especifica el numero de bloques, el tipo de atencion (espacial, temporal o completa), la dimension del latente, el text encoder asociado ni el VAE, que no forman parte de este repositorio. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre numero de tokens o de pares video-texto, composicion del dataset, resolucion de entrenamiento, duracion de los clips, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado adicional. La unica pista sobre el ajuste es el propio nombre del fichero, que apunta a una variante "hibrida" que cubriria los modos `fl2va` y `ref2va` (condicionamiento por primer/ultimo fotograma y por referencia) en un unico conjunto de pesos, extremo que el autor no confirma en texto.

En cuanto a la innovacion tecnica, el elemento diferencial declarado es la cuantizacion a int8 del UNET, que reduce el peso del fichero hasta unos 19,5 GiB y permite cargarlo en GPUs de 24 GB con las estrategias de offload de ComfyUI, a cambio de una posible perdida de fidelidad respecto a los pesos originales en precision completa. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni destilacion por pasos, aunque el sufijo `b25-49` podria estar relacionado con un recorte de bloques o con un rango de pasos de destilacion; sin confirmacion del autor, no puede afirmarse.

## Capacidades

- Generacion de video a partir de texto, segun el pipeline declarado en el repositorio (`text-to-video`).
- Condicionamiento avanzado segun la nomenclatura del fichero: `fl2va` apunta a generacion a partir de primer y ultimo fotograma, y `ref2va` a generacion guiada por una imagen de referencia. El autor no documenta explicitamente estas capacidades, por lo que deben verificarse en la practica.
- Uso como componente UNET dentro de un grafo de ComfyUI, cargandolo con los nodos habituales de difusion para video.
- Ejecucion gestionada en la plataforma RunningHub, sin necesidad de montar la infraestructura localmente.
- Integracion mediante API de RunningHub (el autor enlaza la documentacion de la API y una llamada concreta de ejemplo).
- Capacidades multimodales de entrada (imagen/video de referencia o fotogramas de anclaje) segun lo que sugiera el nombre del fichero, no confirmadas.
- Soporte de tool calling, function calling, agentes, modo de razonamiento explicito, vision de imagenes o audio: no disponible (no aplica a un UNET de difusion).

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: cargar el fichero UNET en un grafo de text-to-video permite obtener clips sin necesidad de convertir pesos ni de entrenar nada, lo que resulta util para evaluar la calidad del ajuste antes de comprometerse con una integracion mayor.
- Animacion a partir de fotogramas clave en estudios pequenos: si se confirma el modo `fl2va`, el modelo permitiria interpolar o generar el movimiento entre un primer y un ultimo fotograma, un flujo tipico en storyboards y previsionado de animacion.
- Generacion guiada por referencia visual: si se confirma `ref2va`, el modelo serviria para producir variaciones de video manteniendo la identidad o el estilo de una imagen de referencia, util en publicidad y contenido de marca.
- Tuberias de postproduccion y motion graphics: generacion de planos de relleno, fondos animados o transiciones que se componen despues en un editor, aprovechando la salida como material base.
- Demostraciones y pruebas de concepto en la nube: al estar pensado para RunningHub, permite lanzar inferencias sin GPU propia, adecuado para equipos que evaluan modelos antes de invertir en hardware.
- Integracion en productos creativos mediante API: el proveedor documenta endpoints de llamada, lo que habilita funcionalidades de generacion de video dentro de herramientas propias sin alojar los pesos.
- Evaluacion comparativa de cuantizaciones: al existir solo la variante int8, sirve como referencia para medir la perdida de calidad frente a los pesos originales de `minimax-h3` en el mismo prompt y semilla.
- Investigacion sobre ajuste fino de modelos de video: el repositorio referenciado del autor original permite estudiar como se construyen variantes hibridas a partir de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como FVD, CLIP-SIM, VBench ni comparaciones cuantitativas con otros modelos de video, y tampoco se declaran tiempos de inferencia ni numero de pasos de muestreo.

## Requisitos de hardware

- Los pesos ocupan 19.999 MiB (unos 19,5 GiB) en int8. A esa cifra hay que anadir el text encoder, el VAE y las activaciones del propio UNET, que no se incluyen en este repositorio.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de partida, los pesos solos ya superan los 19 GiB, por lo que se recomienda un minimo de 24 GB y, para resoluciones o duraciones altas, 32 GB o mas. Cualquier cifra concreta debe medirse en la practica.
- GPU de gama profesional recomendadas: A100 (40 o 80 GB), H100, L40S o similares, que dejan margen suficiente para activaciones y para el resto de componentes del pipeline.
- GPU de consumo: cabe con dificultad en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB), especialmente si se aplican tecnicas de offload de pesos a RAM o de carga por bloques; en GPUs de 16 GB o menos lo mas probable es que no quepa sin cuantizaciones adicionales o sin descarga parcial a CPU.
- Opciones de despliegue: ComfyUI (entorno para el que esta publicado el fichero), plataforma RunningHub y su API. Motores orientados a LLM como vLLM, TGI o llama.cpp no son aplicables a un UNET de difusion; para pipelines de difusion por codigo se usaria diffusers con el UNET cargado, siempre que se disponga del resto de componentes del modelo base.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de muestreo, la resolucion, la duracion del clip, la GPU y el grado de offload.

## Comparativa con modelos similares

No se dispone de datos verificables de parametros, contexto o rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion se limita a lo que puede afirmarse con certeza.

| Modelo | Tipo de artefacto | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rh-minimax-h3-hybrid-fl2va-ref2va-b25-49-int8-r-unet` | UNET de difusion para video, int8, 19.999 MiB | no disponible | no disponible | no disponible (remite a la licencia del proyecto original MiniMax-H3) | Hugging Face, ComfyUI, RunningHub |
| MiniMax-H3 (modelo base referenciado, variantes `fl2va`/`ref2va`) | Modelo de video de la familia MiniMax-H3 | no disponible | no disponible | no disponible | Repositorio de referencia `smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models` |
| Otras familias de generacion de video open source (por ejemplo Wan, HunyuanVideo o LTX-Video) | Modelos de difusion para video | no disponible | no disponible | no disponible | Hugging Face |

No se han encontrado en la informacion proporcionada comparaciones oficiales con alternativas, ni datos que permitan afirmar que este ajuste supere o iguale a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada en Hugging Face: la model card se limita a remitir a la licencia del proyecto original o del upstream. Antes de cualquier uso comercial es imprescindible aclarar los terminos con el autor o con el titular de MiniMax-H3.
- Es un artefacto sin validacion publica: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks, sin ejemplos de salida y sin discusion de la comunidad. No hay evidencia externa de calidad.
- No es un modelo completo: solo contiene los pesos del UNET en int8. Necesita text encoder, VAE y la configuracion de pipeline correspondiente, que no se incluyen en el repositorio.
- La cuantizacion int8 introduce una perdida de fidelidad respecto a los pesos originales que no ha sido cuantificada por el autor; no se ofrecen variantes en mayor precision para comparar.
- Riesgo de alucinacion visual: como cualquier modelo generativo de video, puede producir artefactos, incoherencias temporales, deformaciones anatomicas y texto ilegible. No se documentan mitigaciones.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre sesgos demograficos, culturales o de representacion.
- Idiomas: no disponibles, lo que impide asegurar un soporte multilingue de los prompts mas alla del que ofrezca el text encoder del modelo base.
- Funcionamiento interno no documentado: los elementos `hybrid`, `fl2va`, `ref2va` y `b25-49` no se explican en la model card; cualquier conclusion sobre ellos es una inferencia a partir del nombre del fichero.
- Dependencia del proveedor: parte del flujo propuesto pasa por la plataforma RunningHub y su API, lo que introduce dependencia de un servicio externo y de sus condiciones de uso.
- Fechas de publicacion poco habituales (2026) y actualizacion en apenas siete minutos, lo que sugiere una subida automatizada sin revision posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-hybrid-fl2va-ref2va-b25-49-int8-r-unet
- Repositorio de referencia del modelo original: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models/tree/main
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2094781522388799490
- Pagina del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada de API de ejemplo (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-minimax-h3-hybrid-fl2va-ref2va-b25-49-int8-r-unet/blob/main/README_cn.md
