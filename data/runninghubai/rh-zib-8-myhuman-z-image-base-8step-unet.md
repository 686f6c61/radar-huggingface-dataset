# RunningHubAI/rh-zib-8-myhuman-z-image-base-8step-unet

## Resumen

rh-zib-8-myhuman-z-image-base-8step-unet es un modelo de difusion de tipo UNET para generacion de imagenes a partir de texto (text-to-image), publicado por RunningHubAI en nombre del autor chino @MOYOU (墨幽) y distribuido como un unico fichero de pesos en formato safetensors bf16 de 11.740 MiB (el repositorio ocupa 12,3 GB). Se trata de un modelo derivado por ajuste fino (fine-tune) y fusion a partir de Z-Image-Base, orientado especificamente a la generacion de retratos fotorrealistas de alta precision y a la salida directa en resoluciones de hasta 2K.

Su rasgo distintivo es la generacion en solo 8 pasos de muestreo sin necesidad de anadir un LoRA de aceleracion de 8 pasos, junto con una mejora declarada de estabilidad frente al modelo base (ZIB). El autor afirma haber aplicado un algoritmo propio denominado BTNA (Bounded Timed Noise-Rising Algorithm, "限界时序增噪算法"), con el que se refuerza el entrenamiento en composicion y detalle de alta frecuencia. Los parametros recomendados son el muestreador res_2s, el planificador bong_tangent, 8 pasos y CFG 2.

El modelo esta pensado para su uso en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face, y esta publicado con fecha de creacion 2026-09-24 segun los metadatos del repositorio, con 0 descargas y 0 likes en el momento de la consulta. La model card no incluye informacion sobre arquitectura interna, numero de parametros, licencia explicita ni resultados de benchmarks, por lo que su evaluacion en produccion requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (text-to-image). No se especifica si es un transformer de difusion ni la topologia interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no se especifica longitud maxima de prompt). Resoluciones nativas recomendadas: 1328x1328, 928x1664, 1104x1472, 1056x1584, 1280x1920, 1536x2304, en horizontal o vertical |
| Tipos de cuantizacion | no disponible. Solo se distribuye un fichero en bf16 |
| Idiomas soportados | no disponible. La model card recomienda usar prompts largos en chino y menciona que tambien se puede usar "反推" (prompt inverso) |
| Licencia | no disponible. La model card indica que los derechos son del autor y que se debe seguir la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (un unico fichero: `MYHuman_Z_image_base_8step_bf16.safetensors`, 11.740 MiB, precision bf16) |
| Tamano del repositorio | 12,3 GB |
| Pipeline declarado | text-to-image |
| Etiquetas | comfyui, unet, text-to-image, region:us |
| Modelo base | Z-Image-Base (fine-tune y fusion) |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna del modelo: se describe unicamente como un UNET de text-to-image y como un derivado de Z-Image-Base. Por tanto, no hay datos verificables sobre el numero de parametros, el tipo de bloque de atencion, los codificadores de texto asociados ni la dimension del espacio latente. Los pesos se distribuyen exclusivamente en bf16, sin variantes cuantizadas.

En cuanto al entrenamiento, el autor declara haber aplicado un algoritmo propio llamado BTNA (Bounded Timed Noise-Rising Algorithm), orientado a reforzar la composicion y el detalle de alta frecuencia. Segun la model card, este procedimiento altera de forma sustancial la composicion de amplias zonas del modelo base (ZIB) y aporta cierto grado de generalizacion, mejorando la estabilidad respecto al base. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documenta ninguna innovacion de decodificacion (por ejemplo, decodificacion especulativa) ni el metodo exacto de fusion con el modelo base.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto, con enfasis declarado en retratos y figura humana de alta precision.
- Salida directa en resoluciones de hasta 2K, con una lista de resoluciones recomendadas en formato cuadrado, vertical y horizontal (hasta 1536x2304).
- Generacion rapida en 8 pasos de muestreo, sin necesidad de LoRA de aceleracion adicional.
- Mayor estabilidad declarada frente al modelo base Z-Image-Base.
- Respuesta a prompts largos y descriptivos (la model card recomienda explicitamente prompts largos en chino) y compatibilidad con prompts obtenidos por reversion (interrogacion de imagen).
- Control fino mediante parametros de muestreo concretos: muestreador res_2s, planificador bong_tangent, CFG 2.
- Integracion como nodo UNET en flujos de ComfyUI y como modelo alojado en RunningHub (con API y aplicacion lista para usar).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modos de pensamiento. Es un modelo puramente generativo de imagen.

## Casos de uso

- Retrato fotorrealista para estudio fotografico: el modelo permite generar retratos en 1328x1328 o 1536x2304 con 8 pasos y CFG 2, lo que reduce el coste de muestreo y facilita iteraciones rapidas de maquillaje, iluminacion y encuadre antes de una sesion real.
- Creacion de material para redes sociales: con resoluciones verticales como 928x1664 o 1280x1920, se pueden producir imagenes listas para publicar en formato retrato sin reescalado posterior.
- Ilustracion de moda y trajes tradicionales: la model card incluye ejemplos de hanfu y estilismo clasico chino, de modo que el modelo es adecuado para catalogos visuales de indumentaria con prompts descriptivos largos en chino.
- Generacion de assets para impresion: la salida nativa de hasta 1536x2304 y 2K permite obtener material con resolucion suficiente para laminas, libros o carteles pequenos, reduciendo la dependencia de upscalers externos.
- Prototipado de concept art y previsualizacion de personajes: artistas y equipos de diseno pueden fijar la direccion visual de un personaje con numerosas variaciones en poco tiempo, gracias a las 8 pasos por generacion y a la estabilidad declarada.
- Integracion en pipelines de produccion con ComfyUI: el fichero safetensors se carga como nodo UNET, lo que permite encadenarlo con nodos de ControlNet, upscaling o postprocesado dentro de flujos automatizables.
- Despliegue gestionado mediante API de RunningHub: para equipos sin GPU propia, el modelo puede consumirse a traves de la API del proveedor, evitando el aprovisionamiento de hardware.
- Ilustracion de contenido editorial y narrativo: escenas con descripcion detallada de vestuario, expresion y entorno (como el ejemplo de la model card) encajan con la generacion de ilustraciones para relatos, novelas visuales o guiones graficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas, comparativas con otros modelos) ni datos medidos de latencia o throughput. Las unicas afirmaciones de rendimiento son cualitativas: salida directa en 2K, 8 pasos de muestreo, mayor estabilidad que Z-Image-Base y "alta tasa de exito" en imagenes realistas, sin cifras que las respalden.

## Requisitos de hardware

- Peso de los pesos: el unico fichero safetensors ocupa 11.740 MiB en bf16, por lo que solo el UNET ya requiere unos 11,5 GB de VRAM en precision completa.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia practica, en bf16 habria que sumar al UNET la memoria del codificador de texto y del VAE, por lo que lo razonable es reservar al menos 16 GB de VRAM para una ejecucion comoda sin offload; con 12 GB es probable que sea necesario aplicar offload parcial a RAM o el modo de bajo consumo de VRAM de ComfyUI.
- GPU recomendadas: tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100, H100) para ejecucion holgada en bf16. En GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super) puede funcionar con gestion de memoria agresiva. En GPUs de 8-12 GB solo cabria con offload, a costa de latencia.
- Compatibilidad con GPU de consumo: si, es viable en GPUs de consumo de gama alta con 16-24 GB de VRAM, siempre que se acepte el coste de memoria del modelo sin cuantizar.
- Opciones de despliegue: ComfyUI (uso previsto principal, con los nodos y muestreadores indicados por el autor), plataforma RunningHub (ejecucion alojada y API), y Hugging Face como origen de descarga. No se documenta soporte oficial para vLLM, TGI, llama.cpp, Ollama ni Diffusers.
- Muestreador y planificador: la model card exige res_2s como muestreador y bong_tangent como planificador. Estos nombres no forman parte del conjunto estandar de ComfyUI, por lo que su disponibilidad depende de nodos personalizados; conviene verificarlo antes de plantear un despliegue en produccion.
- Latencia y throughput: no disponibles. Como aproximacion estructural, el coste de muestreo corresponde a 8 evaluaciones del UNET en lugar de las 20-30 habituales, lo que reduce el tiempo de generacion, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. La tabla siguiente recoge unicamente los datos confirmados en la informacion proporcionada y, en el caso de las alternativas, caracteristicas publicas ampliamente conocidas, marcadas como referencia externa. Los campos no verificados se indican como "no disponible".

| Modelo | Tipo | Parametros | Salida nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zib-8-myhuman-z-image-base-8step-unet | UNET text-to-image (fine-tune de Z-Image-Base) | no disponible | Hasta 2K (1536x2304 recomendado) | no disponible (derechos del autor, seguir licencia upstream) | Hugging Face, ComfyUI, RunningHub |
| Z-Image-Base (modelo base declarado) | Modelo de difusion text-to-image | no disponible | no disponible | no disponible | Referenciado como base del fine-tune |
| FLUX.1-dev (referencia externa) | Transformer de difusion text-to-image | 12.000 millones (dato publico) | ~1 MP | Licencia no comercial (FLUX.1-dev) | Hugging Face, ecosistema amplio |
| SDXL (referencia externa) | UNET de difusion + doble codificador de texto | ~2.600 millones en el UNET (dato publico) | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face, ecosistema muy amplio |

Nota: los datos de FLUX.1-dev y SDXL no provienen de la informacion proporcionada y se incluyen solo como referencia de categoria; deben verificarse en sus fuentes originales. No hay benchmarks que permitan afirmar superioridad de ninguno de ellos frente al modelo evaluado.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card se limita a indicar que los derechos son del autor y que debe seguirse la licencia del proyecto original o upstream. Esto genera incertidumbre juridica para uso comercial; conviene contactar con el autor o con RunningHub antes de desplegarlo en produccion.
- Sin benchmarks publicados: no hay ninguna metrica objetiva que respalde las afirmaciones de calidad, estabilidad o fotorrealismo, ni comparativas con otros modelos.
- Sin datos de arquitectura: no se conoce el numero de parametros, la topologia, los codificadores de texto ni el VAE con el que debe emparejarse, lo que complica la integracion tecnica y la estimacion de costes.
- Dependencia de muestreador y planificador no estandar: el uso de res_2s y bong_tangent puede requerir nodos personalizados de ComfyUI. Sin ellos, los resultados y el numero de pasos podrian no ser los esperados.
- Idiomas: la model card recomienda prompts largos en chino y advierte de que asi se obtienen mejores resultados, por lo que el rendimiento con prompts en castellano o en otros idiomas no esta garantizado ni documentado.
- Especializacion en figura humana: el modelo esta orientado a retratos y figura humana realista, por lo que su comportamiento en paisajes, texto integrado en imagen, diagramas o ilustracion tecnica es incierto.
- Artefactos tipicos de difusion: riesgo de manos deformadas, ojos asimetricos, extremidades duplicadas, incoherencia en accesorios y errores en texto renderizado. La model card no documenta filtros de seguridad ni mitigaciones.
- Sesgos potenciales: al tratarse de un modelo ajustado sobre retratos, es probable que reproduzca sesgos de representacion en tono de piel, complexion corporal, edad y canon estetico del dataset de ajuste, aunque no se documenta la composicion de dicho dataset.
- Riesgo de uso indebido: la generacion de rostros humanos fotorrealistas abre la puerta a suplantacion de identidad y contenido sintetico enganoso. No se menciona ningun mecanismo de marca de agua, procedencia o filtrado.
- Sin cuantizaciones oficiales: al distribuirse solo en bf16 (11,7 GB), el despliegue en GPUs modestas exige offload y penaliza la latencia.
- Validacion comunitaria minima: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita estimar fiabilidad en produccion.
- Fecha de publicacion en los metadatos (2026-09-24): conviene verificar la coherencia temporal del repositorio y su estado de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zib-8-myhuman-z-image-base-8step-unet
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2065309071061905409
- Pagina del autor (@MOYOU 墨幽): https://www.runninghub.cn/user-center/1955122945704275970
- Flujo de trabajo dedicado (ZIB-8 pasos, 4K): https://www.runninghub.cn/post/2065310807159828481/?inviteCode=rh-v1190
- Aplicacion lista para usar: https://www.runninghub.cn/ai-detail/2065458431967973378/?inviteCode=rh-v1190
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API del modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2065309071061905409
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
