# RunningHubAI/rh-perfectdeliberate-v10-checkpoint

## Resumen

rh-perfectdeliberate-v10-checkpoint es un checkpoint de generacion de imagenes publicado en Hugging Face por la cuenta RunningHubAI, que actua como plataforma de distribucion en nombre del autor original (identificado en la model card como @nullnull). No se trata de un modelo de lenguaje: es un peso de difusion pensado para cargarse en ComfyUI, en la plataforma RunningHub o mediante su API. El repositorio contiene un unico fichero, `perfectdeliberate_v10.safetensors`, de 6776 MiB (aproximadamente 6,6 GB), lo que situa el modelo en la categoria de checkpoints de tipo SDXL/Illustrious XL.

La model card es deliberadamente escueta: indica el tipo de modelo ("checkpoint"), las plataformas soportadas y que el modelo esta afinado a partir de "IL-XL". No se declaran parametros, arquitectura interna, licencia explicita, idiomas soportados, datos de entrenamiento ni resultados de benchmarks. La informacion practica mas util que aporta son los ajustes de inferencia recomendados por el autor: resoluciones de 832x1216, 960x1440, 1024x1024 y 1024x1536, CFG entre 5 y 8, muestreadores Euler a o DPM++ 2M Karras, y entre 20 y 50 pasos.

Su relevancia actual es la habitual de los checkpoints de ilustracion dentro del ecosistema ComfyUI: sirve como modelo base para generacion de ilustracion y como punto de partida para afinar LoRAs o para desplegarse como servicio en la plataforma del propio proveedor. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 24 de septiembre de 2026, con apenas cinco minutos de diferencia entre ambos eventos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La model card solo indica "Model Type: Checkpoint"; el campo "Finetuned from" apunta a IL-XL |
| Parametros totales | no disponible. El fichero pesa 6776 MiB en safetensors |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen; no declara ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible en el repositorio. Solo se publica el fichero safetensors; la conversion a fp8, GGUF u otros formatos no esta documentada por el autor |
| Idiomas soportados | no disponible. No se declara ninguna lista de idiomas |
| Licencia | no disponible. La model card indica que RunningHub publica en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`perfectdeliberate_v10.safetensors`, 6776 MiB) |
| Tamano del repositorio | 7,1 GB |
| Modelo de partida | IL-XL (segun la model card) |
| Resoluciones recomendadas | 832x1216, 960x1440, 1024x1024, 1024x1536 |
| Ajustes de muestreo recomendados | CFG 5-8; Euler a o DPM++ 2M Karras; 20-50 pasos |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. Lo unico que consta es que se trata de un checkpoint y que esta afinado a partir de IL-XL, lo que en la practica lo situa en la familia de checkpoints derivados de SDXL empleados para ilustracion y generacion de imagenes de personajes. Todos los detalles tecnicos relevantes (tipo de red, numero de bloques, dimensiones de las representaciones latentes, configuracion del VAE y de los codificadores de texto) se desconocen porque el autor no los publica.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens o imagenes empleadas, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF, DPO u otras tecnicas de alineacion. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes de muestreo propias. El unico material de referencia aportado por el autor son los parametros de inferencia recomendados (resoluciones, CFG, muestreador y pasos), que se comentan en la seccion de requisitos de hardware. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en entornos ComfyUI y en la plataforma RunningHub.
- Generacion en resoluciones verticales y cuadradas dentro del rango recomendado por el autor: 832x1216, 960x1440, 1024x1024 y 1024x1536.
- Estilismo orientado a ilustracion y personajes, coherente con su ascendencia IL-XL, aunque el autor no documenta el estilo objetivo de forma explicita.
- Integracion en flujos de trabajo de ComfyUI como nodo de checkpoint, lo que permite encadenarlo con img2img, inpainting, upscaling, ControlNet u otros nodos disponibles en ese ecosistema.
- Uso como modelo base para afinar LoRAs u otros ajustes derivados, siempre sujeto a la licencia aplicable, que no se especifica.
- Ejecucion remota mediante la API de RunningHub, segun los enlaces incluidos en la model card.
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje y no procesa instrucciones estructuradas ni llamadas a herramientas.
- No dispone de capacidades de agente, razonamiento multi-paso ni modos de pensamiento explicito.
- No se documentan capacidades multilingues, de vision (entendimiento de imagenes de entrada), de audio ni de generacion de video.

## Casos de uso

- Ilustracion de personajes para proyectos de ficcion: el modelo genera imagenes verticales a 832x1216 o 960x1440, formatos habituales para ilustracion editorial y portadas, con los ajustes de CFG y muestreador indicados por el autor para obtener resultados estables.
- Concept art y exploracion de estilos: al ser un checkpoint cargable en ComfyUI, se puede encadenar con variaciones de semilla y prompt para producir lotes de propuestas visuales en fases tempranas de diseno.
- Generacion de assets para videojuegos y prototipado: sirve como fuente de bocetos de personajes, objetos o escenarios que despues se retocan manualmente, siempre que la licencia aplicable lo permita, aspecto que hoy no esta aclarado.
- Flujos de img2img e inpainting: al integrarse como checkpoint en ComfyUI, admite pasarelas de refinado sobre imagenes existentes, correccion de zonas concretas y ampliacion de detalle en zonas seleccionadas.
- Produccion de contenido grafico por lotes mediante API: la model card enlaza la API de RunningHub, lo que permite invocar el modelo de forma remota sin infraestructura propia, util para equipos que no quieren mantener GPU dedicada.
- Creacion de datasets sinteticos para entrenamiento: el modelo puede generar imagenes etiquetadas que despues se filtran y se usan para entrenar LoRAs o clasificadores, con la advertencia de que la licencia del modelo base condiciona ese uso.
- Educacion y demostraciones de difusion: sirve como ejemplo practico para explicar el funcionamiento de un checkpoint SDXL/Illustrious en ComfyUI, incluida la influencia de CFG, pasos y muestreador en el resultado.
- Automatizacion de creatividades para redes sociales: al soportar varias relaciones de aspecto, permite generar variantes verticales y cuadradas del mismo concepto desde un unico flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, evaluaciones humanas de preferencia ni comparativas cuantitativas con otros checkpoints. Tampoco hay datos de rendimiento de inferencia medidos por el autor (latencia, imagenes por segundo o consumo energetico). Cualquier cifra de este tipo requeriria una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo del peso del fichero (6776 MiB) y de que se distribuye en safetensors, se necesitan al menos entre 8 y 10 GB de VRAM para cargar el modelo completo en precision de 16 bits junto con el VAE y los codificadores de texto, y margen adicional para latentes y pasos intermedios. Con conversiones externas a 8 bits o a formatos comprimidos, el consumo puede reducirse aproximadamente a la mitad, aunque el autor no publica dichas conversiones.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM son el objetivo comodo, por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100 para despliegue por lotes.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM sin necesidad de cuantizacion adicional. En tarjetas de 8 GB es probable que requiera cuantizacion o descarga parcial de componentes a RAM del sistema mediante las opciones de gestion de memoria de ComfyUI o de otros frontales.
- Opciones de despliegue: ComfyUI (declarado por el autor), la plataforma RunningHub y su API, ademas de los cargadores habituales para checkpoints safetensors en frontales compatibles como Automatic1111, Forge, SD.Next o la libreria diffusers, siempre que el formato sea compatible. No hay confirmacion del autor para estas ultimas opciones.
- Latencia y throughput: no disponibles. El autor solo especifica que se empleen entre 20 y 50 pasos con Euler a o DPM++ 2M Karras y CFG entre 5 y 8, sin aportar tiempos de ejecucion ni imagenes por segundo en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo de partida | Resoluciones recomendadas | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|---|
| rh-perfectdeliberate-v10-checkpoint | Checkpoint de generacion de imagen | IL-XL | 832x1216, 960x1440, 1024x1024, 1024x1536 | no disponible | Hugging Face, RunningHub, ComfyUI | no disponible |
| Illustrious XL | Checkpoint de generacion de imagen | SDXL | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorios publicos de modelos | no disponible en la informacion proporcionada |
| PerfectDeliberate (versiones previas) | Checkpoint de generacion de imagen | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | RunningHub, Tensor.art | no disponible en la informacion proporcionada |
| Pony Diffusion V6 XL | Checkpoint de generacion de imagen | SDXL | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorios publicos de modelos | no disponible en la informacion proporcionada |

La comparativa se limita a la categoria y a la procedencia de cada modelo, porque no se dispone de parametros, contexto, metricas ni condiciones de licencia verificadas para ninguno de ellos dentro de la informacion proporcionada. No es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican parametros, arquitectura, datos de entrenamiento ni proceso de ajuste, lo que dificulta evaluar su idoneidad para produccion.
- Licencia sin definir: la model card remite a la licencia del proyecto original o upstream y no concreta condiciones. No debe asumirse uso comercial permitido sin verificar la licencia de IL-XL y del autor original.
- Riesgo de contenido indeseado: al ser un checkpoint orientado a ilustracion, puede reproducir sesgos de estilo, composicion y representacion presentes en su dataset de entrenamiento, que se desconoce.
- Ausencia de benchmarks: no hay metricas objetivas de calidad, fidelidad al prompt ni evaluaciones humanas que respalden las afirmaciones de la model card.
- Procedencia de la publicacion: el repositorio es una redistribucion realizada por RunningHub en nombre de un autor externo, con 0 descargas y 0 likes, lo que dificulta trazar el historial de versiones y la validez del contenido.
- Fechas incoherentes: el repositorio figura creado y actualizado en septiembre de 2026, y la propia model card menciona una suspension de cuenta en abril de 2026. Conviene verificar la integridad y vigencia del material antes de usarlo.
- Sin soporte multiidioma declarado: no se especifica como responde el modelo a prompts en castellano ni se garantiza un comportamiento equivalente al de prompts en ingles.
- Sin garantias de mantenimiento: no se anuncia hoja de ruta, correccion de errores ni versiones futuras.
- Reproducibilidad limitada: sin semilla, version de ComfyUI ni versiones de dependencias documentadas, los resultados pueden variar entre entornos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-perfectdeliberate-v10-checkpoint
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2093191124637749250
- Version previa en RunningHub: https://www.runninghub.ai/model/public/1951164920467496961
- PerfectDeliberate v10 en Tensor.art: https://tensor.art/models/1027903887807374469
- PerfectDeliberate v10 en TensorHub Art: https://tensorhub.art/models/1027903887807374469
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- Plataforma RunningHub: https://www.runninghub.ai/
- Sitio de RunningHub en China: https://www.runninghub.cn/
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API del modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2093191124637749250
- Servicio de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Servidor de Discord del autor: https://discord.gg/gcJqAKQ5Af
