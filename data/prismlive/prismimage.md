# PrismLive/PrismImage

## Resumen

PrismImage es un modelo de generacion de imagenes en formato MLX desarrollado por PrismLive, pensado para ejecutarse en local sobre dispositivos Apple (macOS e iOS). Se trata de un ajuste fino destilado sobre black-forest-labs/FLUX.2-klein-4B, un transformer de imagenes de 4.000 millones de parametros, al que se ha incorporado un estilo fotografico propietario ("Jason-Photo") directamente en los pesos del transformer. El repositorio pesa 3,9 GB e incluye, ademas del transformer, un codificador de texto, un VAE, el tokenizer y un LoRA de estilo.

El modelo forma parte de la aplicacion Prism Image Studio, que descarga los pesos en el primer arranque, por lo que no esta pensado para consumo manual de ficheros por parte del usuario final. Cubre dos tareas: text-to-image e image-to-image, y su licencia Apache 2.0 permite uso comercial sin las restricciones habituales de los modelos de difusion de gama alta.

Su relevancia radica en el nicho que ocupa: generacion de imagenes por difusion cuantizada de forma agresiva (4 bits en el transformer, 3 bits en el codificador de texto) y ejecutable en hardware de consumo Apple Silicon, algo poco frecuente en modelos de la familia FLUX. No hay publicados datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (familia FLUX.2, variante destilada klein-4B); no se detalla la arquitectura interna en la model card |
| Parametros totales | 4B en el transformer de imagenes; el tamano del codificador de texto y del VAE no se especifica |
| Longitud de contexto | no disponible (modelo de imagen; no se documenta la longitud maxima de prompt) |
| Tipos de cuantizacion | Transformer: 4 bits, grupo 128. Codificador de texto: 3 bits, grupo 128. LoRA: 8 bits row-wise |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (ficheros safetensors organizados en carpetas transformer/, text_encoder/, vae/, tokenizer/, loras/) |
| Tamano del repositorio | 3,9 GB |
| Modelo base | black-forest-labs/FLUX.2-klein-4B (finetune) |
| Tareas declaradas | text-to-image, image-to-image |
| Libreria | mlx |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle. Lo que se sabe es que se trata de un transformer de difusion destilado de 4.000 millones de parametros derivado de FLUX.2-klein-4B, con el estilo "Jason-Photo" fusionado en los pesos durante el ajuste. Ademas del transformer principal, el repositorio incluye un codificador de texto que, segun el autor, tambien alimenta el chat integrado de la aplicacion, un VAE para decodificacion de imagenes, el tokenizer y un LoRA de estilo independiente ("Expressive", en `loras/master-drawing.safetensors`).

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en modelos de difusion puros). Tampoco se detalla el metodo de destilacion aplicado sobre el modelo base ni el proceso de cuantizacion. La innovacion principal, en terminos practicos, es el empaquetado completo en MLX con cuantizacion mixta (4/3/8 bits) para ejecucion en dispositivo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con un estilo fotografico preajustado.
- Edicion y transformacion de imagenes existentes (image-to-image).
- Aplicacion de estilos mediante LoRA: el repositorio incluye `loras/master-drawing.safetensors`, un LoRA "expressive" de 8 bits en formato row-wise.
- Chat integrado en la aplicacion anfitriona: el codificador de texto se reutiliza para las funciones conversacionales de Prism Image Studio, aunque la naturaleza de ese chat no se detalla.
- Ejecucion totalmente en dispositivo, sin llamadas a API externas.
- No se declaran capacidades de vision-lenguaje, tool calling, agentes ni generacion de video o audio.

## Casos de uso

- Edicion fotografica en macOS: el usuario carga una imagen y aplica transformaciones guiadas por prompt mediante el pipeline image-to-image, todo procesado localmente en Apple Silicon.
- Generacion de imagenes en iOS sin conexion: la cuantizacion a 4 bits del transformer y 3 bits del codificador de texto permite ejecutar el modelo en un iPhone o iPad con memoria unificada limitada, util en entornos sin red.
- Creacion de contenido para redes sociales con estilo consistente: aplicar el estilo "Jason-Photo" fusionado en los pesos garantiza coherencia visual entre lotes de imagenes generadas.
- Variaciones de producto para comercio electronico: a partir de una foto base, generar variantes de iluminacion, encuadre o fondo con image-to-image, evitando subir material propietario a servicios en la nube.
- Ilustracion y bocetos con el LoRA "Expressive": activando `loras/master-drawing.safetensors` se puede orientar la salida hacia un trazo mas expresivo para prototipado de arte conceptual.
- Integracion dentro de Prism Image Studio: el modelo se descarga y ejecuta como componente interno de la app, de modo que el caso de uso directo es cualquier flujo de trabajo que dicha aplicacion exponga al usuario final.
- Prototipado de pipelines de difusion en MLX: sirve como referencia para desarrolladores que quieran medir el rendimiento real de un transformer de 4B cuantizado a 4 bits en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con el modelo base FLUX.2-klein-4B o con alternativas.

## Requisitos de hardware

- El formato MLX implica ejecucion sobre Apple Silicon (chips de la serie M). No hay soporte declarado para CUDA, ROCm ni CPU x86.
- Huella en disco del repositorio completo: 3,9 GB.
- VRAM/memoria unificada estimada: en torno a 4-6 GB en inferencia, sumando pesos cuantizados, VAE activo y buffers de atencion. Cifra orientativa, no confirmada por el autor.
- Cabe en GPU de consumo Apple: si, en practicamente cualquier Mac con chip M1 o posterior y 8 GB o mas de memoria unificada; con 8 GB el margen es estrecho, por lo que se recomienda 16 GB.
- En iPhone/iPad, depende del modelo concreto y de la memoria disponible para la aplicacion; no hay requisitos minimos publicados.
- Opciones de despliegue: la libreria MLX de Apple y la propia aplicacion Prism Image Studio. Las herramientas habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PrismImage | 4B (transformer) | text-to-image, image-to-image | Apache 2.0 | MLX (Apple) | Cuantizacion 4/3 bits, estilo fusionado, 3,9 GB |
| FLUX.2-klein-4B | 4B | text-to-image | no disponible en la informacion proporcionada | no disponible | Modelo base del que deriva PrismImage |
| FLUX.1-schnell | 12B | text-to-image | Apache 2.0 | safetensors, difusores | Referencia de la generacion anterior de FLUX; tamano muy superior |
| FLUX.1-dev | 12B | text-to-image | no comercial | safetensors, difusores | Mas parametros y mejor calidad general, pero sin uso comercial libre |
| SDXL | ~3,5B (UNet + codificadores) | text-to-image, image-to-image | CreativeML OpenRAIL++-M | safetensors, difusores, GGUF | Alternativa de tamano similar con ecosistema amplio, pero sin soporte MLX nativo |

Los datos de FLUX.1 y SDXL corresponden a modelos ampliamente documentados y se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento medidas contra PrismImage.

## Limitaciones y advertencias

- Modelo practicamente sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo dia. No hay evidencia independiente de calidad o estabilidad.
- La cuantizacion a 3 bits del codificador de texto es muy agresiva y puede degradar la adherencia al prompt, especialmente en instrucciones largas o con detalles finos.
- La cuantizacion a 4 bits del transformer puede reducir el detalle fino y la fidelidad fotografica respecto al modelo base de precision completa.
- No se documentan los idiomas soportados por el codificador de texto; es probable que el rendimiento sea inferior en castellano que en ingles, pero no hay confirmacion.
- No hay informacion sobre filtros de seguridad, gestion de contenido NSFW ni moderacion de prompts.
- Al ser un finetune con un estilo fotografico fusionado, la salida estara sesgada hacia ese estilo, lo que puede limitar su uso para otros generos visuales.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion cuantizados: manos, texto dentro de la imagen y estructuras geometricas son puntos debiles tipicos.
- La licencia Apache 2.0 cubre los pesos publicados, pero no se aclara la procedencia ni los terminos de los datos de entrenamiento del modelo base ni del estilo incorporado; conviene revisar la licencia de FLUX.2-klein-4B antes de un uso comercial.
- Dependencia total del ecosistema Apple MLX: no es portable a servidores con GPU NVIDIA, lo que descarta su uso en infraestructura de produccion convencional.
- No se documentan limites de resolucion de salida, pasos de muestreo recomendados ni parametros de guia (CFG), datos necesarios para reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrismLive/PrismImage
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- No se han encontrado en la busqueda web enlaces relevantes al modelo (paper, blog, repositorio o demo); los resultados devueltos no guardan relacion con PrismImage ni con generacion de imagenes.
