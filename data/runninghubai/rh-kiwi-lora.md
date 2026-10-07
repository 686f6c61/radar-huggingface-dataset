# RunningHubAI/rh-kiwi-lora

## Resumen
rh-kiwi-lora es un adaptador LoRA de bajo rango para generacion de imagen a partir de texto (text-to-image), publicado por RunningHubAI en nombre del autor identificado como @KIWI. No es un modelo de lenguaje: se trata de un ajuste fino ligero que se aplica sobre el modelo base Qwen-Image para especializarlo en diseno tipografico, es decir, en la generacion de composiciones donde el texto (caracteres chinos en los ejemplos de la model card) funciona como elemento visual principal, con acabados tipo CGI tridimensional, vidrio, gotas de agua y hojas integradas.

El repositorio es muy pequeno (0,2 GB) y contiene un unico archivo de pesos, `KIWI-文字排版设计.safetensors`, de 225 MiB, etiquetado como diseno de maquetacion tipografica. La model card recomienda un peso de LoRA de 0,8, muestreo Euler, CFG 4, 30 pasos y resoluciones verticales de 928x1664 (9:16) o proporciones 16:9, con prompt negativo innecesario.

Su relevancia es practica mas que arquitectonica: demuestra el flujo habitual de la comunidad de difusion, en el que un adaptador de pocos cientos de megabytes modifica el comportamiento estetico de un modelo base grande y se distribuye a traves de ComfyUI y de la plataforma RunningHub, que ademas ofrece entrenamiento e inferencia por API. No hay informacion publicada sobre el dataset de entrenamiento, el numero de pasos ni la licencia exacta de los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Image; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB y el archivo de pesos 225 MiB; no se declara el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); resolucion recomendada 928x1664 (9:16) o 16:9 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; los prompts de ejemplo de la model card estan en ingles y generan caracteres chinos |
| Licencia | no disponible; la model card indica que RunningHub publica en nombre del autor, que el copyright sigue siendo del autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors |
| Modelo base | Qwen-Image (indicado como "Finetuned from: Qwen-image" y "Base model: Qwen") |
| Tarea | text-to-image (pipeline declarado en HuggingFace) |
| Peso de LoRA recomendado | 0,8 |
| Parametros de muestreo recomendados | sampler Euler, CFG 4, 30 pasos, prompt negativo no necesario |
| Tamano del repositorio | 0,2 GB |
| Archivo de pesos | `KIWI-文字排版设计.safetensors` (225 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-07 |

## Arquitectura y entrenamiento
La informacion disponible describe un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para adaptar su comportamiento sin reentrenarlo por completo. El modelo base declarado es Qwen-Image, referenciado en la model card tanto como "Base model: Qwen" como en el campo "Finetuned from: Qwen-image". El peso del adaptador recomendado para inferencia es 0,8, lo que sugiere que el ajuste es intenso y que valores cercanos a 1,0 podrian saturar el estilo. No se especifica en cuantas capas se aplica el LoRA, ni el rango, ni el alpha, ni la precision de los pesos.

No hay datos sobre el proceso de entrenamiento: se desconoce el numero de imagenes o pasos, la composicion del dataset, si hubo tecnicas de regularizacion, captioning automatico o ajuste por preferencias. La unica pista tematica es el nombre del archivo, que traduce aproximadamente como "diseno de maquetacion tipografica", y los ejemplos de la model card, centrados en tipografia tridimensional estilizada. La naturaleza del adaptador implica que toda la capacidad generativa subyacente (comprension de prompt, coherencia global, tipografia multilingue) procede del modelo base Qwen-Image, mientras que el LoRA aporta el sesgo estetico concreto.

## Capacidades
- Generacion de imagenes a partir de texto con estilos tipograficos: el adaptador esta orientado a composiciones donde el texto es el sujeto principal de la imagen.
- Renderizado de tipografia tridimensional estilizada, con acabados de vidrio pulido, gotas de agua, integracion de elementos naturales (hojas) y fondos con degradados suaves.
- Composicion guiada: los ejemplos de la model card describen simetria, regla de los tercios, centrado vertical del caracter y profundidad de campo reducida, lo que indica que el adaptador responde a instrucciones de encuadre y fotografia.
- Generacion en formato vertical 9:16 (928x1664) y horizontal 16:9, orientada a publicacion en redes y carteleria.
- Compatibilidad con flujos de ComfyUI como nodo LoRA sobre el modelo base Qwen-Image.
- Ejecucion en la nube mediante la plataforma RunningHub y su API.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento: son capacidades propias de modelos de lenguaje y no aplican a este adaptador.
- No se documentan capacidades multilingues de forma explicita; los ejemplos generan caracteres chinos a partir de prompts en ingles.

## Casos de uso
- Carteleria y publicidad vertical: generacion de piezas 9:16 (928x1664) para historias y anuncios en redes sociales donde un caracter o palabra funciona como imagen central, usando el LoRA en ComfyUI con peso 0,8, CFG 4 y 30 pasos.
- Diseno de logotipos y marcas tipograficas: exploracion rapida de variantes de lettering tridimensional con acabados de material (vidrio, metal, agua) antes de vectorizar la propuesta elegida en herramientas de diseno.
- Portadas de album, podcast o libro: creacion de cubiertas donde el titulo se integra en una escena CGI con iluminacion y profundidad de campo, aprovechando la resolucion vertical u horizontal segun el formato de destino.
- Maquetas de producto y packaging: render de nombres de producto sobre superficies o entornos simulados para presentaciones comerciales, gracias al estilo CGI coherente que aporta el adaptador.
- Contenido para redes sociales de marcas asiaticas: generacion de caracteres chinos estilizados con calidad visual alta, reduciendo el tiempo de modelado 3D manual que requeriria una pieza equivalente.
- Ilustracion editorial y key art: creacion de imagenes de acompanamiento para articulos, eventos o portadas de videojuegos donde la tipografia forma parte de la escena.
- Automatizacion de produccion de variantes: integracion del LoRA en un flujo de ComfyUI o en la API de RunningHub para generar lotes de piezas con el mismo estilo y distintos textos, manteniendo coherencia estetica entre campanas.
- Prototipado rapido para estudios de diseno: validacion de direcciones artisticas con el cliente antes de invertir horas en modelado o render final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de texto renderizado ni comparaciones cuantitativas), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de la comunidad recogidas en la informacion proporcionada.

## Requisitos de hardware
- El archivo LoRA ocupa 225 MiB, de modo que su coste de VRAM adicional es marginal; los requisitos reales vienen determinados por el modelo base Qwen-Image, cuyas especificaciones no se detallan en la informacion disponible.
- No se dispone de cifras oficiales de VRAM minima o recomendada para este adaptador ni para su base. Cualquier estimacion de VRAM debe calcularse a partir del modelo base Qwen-Image y del modo de carga (precision completa, media precision o cuantizacion), datos que no se proporcionan aqui.
- GPU recomendadas: no disponible en la informacion proporcionada. La viabilidad en GPU de consumo depende del modelo base, no del LoRA.
- Opciones de despliegue: ComfyUI (entorno de referencia indicado por el autor), plataforma RunningHub en la nube y su API, y Hugging Face como canal de distribucion de pesos.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, ya que son motores de inferencia para modelos de lenguaje y este artefacto es un LoRA de difusion para generacion de imagen.
- Latencia y throughput: no disponible. Dependen del modelo base, del numero de pasos (30 recomendados), del sampler (Euler) y del hardware empleado.
- Parametros de inferencia recomendados por el autor: peso LoRA 0,8, CFG 4, 30 pasos, sampler Euler, resolucion 928x1664 o 16:9, prompt negativo innecesario.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de pesos | Resolucion o contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kiwi-lora | LoRA text-to-image sobre Qwen-Image | 225 MiB (repo 0,2 GB) | 928x1664 (9:16) o 16:9 | no disponible (sujeta al proyecto original) | Hugging Face, ComfyUI, RunningHub |
| Qwen-Image (modelo base, sin LoRA) | Modelo text-to-image | no disponible en la informacion proporcionada | no disponible | no disponible | Referenciado como upstream por el autor |
| Otros LoRA de tipografia para bases equivalentes | LoRA text-to-image | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, licencia ni especificaciones tecnicas de las alternativas que permitan una comparacion cuantitativa fiable. La unica comparacion sostenible con la informacion aportada es funcional: frente al modelo base sin adaptador, rh-kiwi-lora anade un sesgo estetico hacia la tipografia tridimensional, a cambio de un archivo de 225 MiB y de un parametro de escala (0,8) que hay que ajustar en el flujo de trabajo.

## Limitaciones y advertencias
- Es un adaptador LoRA, no un modelo autonomo: no puede ejecutarse sin el modelo base Qwen-Image, y hereda sus limitaciones, su licencia y sus requisitos de hardware.
- La licencia no esta declarada de forma explicita. La model card indica que el copyright pertenece al autor y que debe seguirse la licencia del proyecto original o del upstream; antes de un uso comercial es imprescindible verificar la licencia de Qwen-Image y contactar con el autor a traves de RunningHub.
- No hay informacion sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos de representacion, sobreajuste a un estilo concreto ni riesgo de reproduccion de material protegido.
- El estilo esta fuertemente especializado: forzar el adaptador hacia otros temas puede degradar la calidad o generar artefactos, especialmente con pesos de LoRA superiores a 0,8.
- La generacion de tipografia en modelos de difusion es propensa a errores en caracteres, trazos y ortografia, sobre todo en alfabetos no latinos; se recomienda revision humana del texto renderizado antes de publicar.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad ni resultados de benchmarks publicados.
- No se documentan idiomas soportados mas alla de los ejemplos en ingles con salida en caracteres chinos; el comportamiento en otros alfabetos no esta verificado.
- Al desplegarse mediante servicios en la nube (RunningHub), la gobernanza del dato y los terminos de uso dependen de dicha plataforma, no solo de la licencia de los pesos.
- No se especifican los parametros internos del LoRA (rango, alpha, capas afectadas), lo que dificulta reproducir el entrenamiento o combinarlo con otros adaptadores sin experimentacion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-kiwi-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1961384331786784769
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1897619470951800834
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-kiwi-lora/blob/main/README_cn.md
