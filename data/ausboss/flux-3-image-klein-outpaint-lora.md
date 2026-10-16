# ausboss/FLUX-3-Image-Klein-Outpaint-LoRA

## Resumen

FLUX-3-Image-Klein-Outpaint-LoRA es un adaptador LoRA de rango 32 desarrollado por el usuario ausboss para extender imágenes por cualquiera de sus lados (outpainting o uncrop) sobre el modelo de difusion FLUX 3 Image Klein de Black Forest Labs. El problema que resuelve es concreto: sin este adaptador, FLUX 3 Image Klein tiende a hacer zoom o a desplazar la imagen en lugar de continuarla cuando se le pide ampliar el lienzo. El autor documenta que esto ocurrio en 36 de 40 ejecuciones con el modelo base sin el LoRA.

La tecnica es sencilla y eficaz: se rellena el area nueva con gris plano `#808080`, se entrega la imagen acolchada a FLUX 3 Image Klein como referencia y el LoRA rellena el gris con una continuacion coherente de la escena, manteniendo los pixeles originales en su sitio. El adaptador tambien rellena las esquinas grises que aparecen al rotar una imagen. El archivo safetensors ocupa 161 MB y corresponde al paso 1.000 de un entrenamiento de 2.000 pasos.

Se distribuye bajo la licencia comunitaria de FLUX (flux-kommunity-license), no bajo una licencia de codigo abierto permisiva, lo que condiciona su uso comercial. El repositorio incluye ademas un flujo de trabajo completo para ComfyUI que automatiza el acolchado, la generacion y el pegado de vuelta de los pixeles originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el modelo base FLUX 3 Image Klein; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible (el adaptador pesa 161 MB; tamano del modelo base no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 y BF16 (se carga sobre los ficheros del modelo base en cualquiera de estos formatos) |
| Idiomas soportados | No disponibles |
| Licencia | flux-kommunity-license (licencia comunitaria de FLUX) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto publicado es un LoRA de rango 32 entrenado durante 2.000 pasos, del cual se publica el punto de control correspondiente al paso 1.000. El entrenamiento se realizo con ai-toolkit sobre el modelo base `black-forest-labs/flux-3-image-klein-base`, y las pruebas del autor se hicieron sobre el modelo destilado (16 pasos, CFG 1). No se especifican en la model card el numero de imagenes de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos no estan disponibles.

Un detalle tecnico relevante del flujo es el uso del propio codificador de texto de FLUX 3 (Qwen3-VL 4B) para generar descripciones de escena. El autor senala que, cargado con el tipo `krea2`, este codificador redacta la descripcion a partir de la imagen, mientras que como tipo `flux3` devolvio texto vacio en sus pruebas. Las captions de entrenamiento describian la imagen completa, de ahi que el prompt recomiende describir lo que ya aparece en la imagen que se va a extender. El flujo no emplea mascara de ruido: el sistema se apoya en el pegado posterior de los pixeles originales mediante el nodo Stitch Inpaint.

## Capacidades

- Generation de imagen para outpainting: extiende una imagen por cualquiera de sus cuatro lados rellenando el area gris con contenido coherente con la escena.
- Relleno de esquinas tras rotacion: completa las esquinas grises generadas al enderezar una imagen girada.
- Preservacion de los pixeles originales: combinado con el nodo Stitch Inpaint del flujo, mantiene la parte original de la imagen en su posicion con un desplazamiento tipico de 0,1 a 1,5 px.
- Integracion con ComfyUI: se distribuye con un flujo de trabajo JSON que cubre acolchado, codificacion del prompt, muestreo y pegado de vuelta.
- Prompts guiados por instruccion: utiliza una frase disparadora fija mas una descripcion opcional de la escena (`Scene: <description>`).
- Descripcion automatica de escena: el codificador de texto Qwen3-VL 4B puede redactar la descripcion a partir de la imagen.
- No dispone de capacidades documentadas de generacion de texto, codigo, matematicas, tool calling, agentes, vision general ni audio; su alcance es especificamente la extension de imagen.

## Casos de uso

- Ampliacion de lienzo en fotografia y diseno: dado un recorte que no cubre el formato necesario, el LoRA rellena los margenes con la continuacion de la escena en lugar de reescalar o desplazar la imagen, lo que evita perdidas de encuadre.
- Adaptacion de formatos para redes sociales: convertir una imagen cuadrada en horizontal o vertical anadiendo contenido en los lados en vez de recortar o deformar.
- Correccion de fotos torcidas: al enderezar una imagen girada aparecen esquinas vacias; el LoRA pinta esas esquinas con mas contenido del fondo, como el interior de un coche o una calle.
- Restauracion de composiciones incompletas: completar escenas donde falta parte del entorno, por ejemplo la continuacion de una pared alicatada o de una plataforma de metro.
- Generacion de fondos coherentes en produccion grafica: extender un motivo central para cubrir un lienzo mayor manteniendo la continuidad de iluminacion y perspectiva.
- Previsualizacion rapida en pipelines de diseno: con alrededor de 8 segundos por imagen en una RTX 5090 (INT8, 16 pasos, CFG 1), es viable integrarlo en iteraciones de diseno interactivas.
- Aumento de datasets de imagen: ampliar recortes existentes para generar variantes con mas contexto, util para aumentar conjuntos de entrenamiento.
- Integracion en flujos ComfyUI existentes: el JSON incluido permite reproducir el proceso completo sin construir el grafo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor aporta, en cambio, una evaluacion cualitativa propia sobre la fidelidad de la extension:

| Medicion | Resultado |
|---|---|
| FLUX 3 base sin LoRA (zoom o desplazamiento en lugar de extension) | 36 de 40 ejecuciones |
| Desplazamiento de los pixeles originales con el LoRA, 6 imagenes no vistas en entrenamiento | 0,1 a 1,5 px |
| 16 imagenes adicionales, fuerza 1.5 | Dentro de 2 px en 15 de 16 |
| 16 imagenes adicionales, fuerza 1.0 | Dentro de 2 px en 12 de 16 |
| Tiempo por imagen (RTX 5090, INT8, 16 pasos, CFG 1) | Aproximadamente 8 segundos |

Estas cifras proceden de las pruebas del propio autor y no de una evaluacion independiente. No hay comparaciones publicadas con otros LoRA de outpainting.

## Requisitos de hardware

- El autor reporta ejecuciones de aproximadamente 8 segundos por imagen en una RTX 5090 con los ficheros INT8, 16 pasos y CFG 1.
- VRAM estimada para inferencia: no disponible. Depende del modelo base FLUX 3 Image Klein, cuyos requisitos no se detallan en la informacion proporcionada; el adaptador en si solo anade 161 MB.
- GPU recomendadas: no disponibles. La unica GPU mencionada en la documentacion es la RTX 5090.
- Compatibilidad con GPU de consumo: no confirmada de forma explicita para este adaptador. El uso de ficheros INT8 sugiere que el modelo base esta pensado para ejecutarse en hardware de gama alta de consumo, pero no se aportan cifras de VRAM.
- Opciones de despliegue: ComfyUI 0.41 o superior (primera version con soporte de FLUX 3), junto con los nodos AusBoss 2.13.0 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Ficheros del modelo base necesarios: `black-forest-labs/flux-3-image-klein-comfy` (version destilada, con acceso condicionado a la aceptacion de licencia).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en outpainting | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX-3-Image-Klein-Outpaint-LoRA (este) | LoRA rango 32 sobre FLUX 3 Image Klein | 161 MB (adaptador) | No disponible | Extiende manteniendo la imagen en su sitio (0,1 a 1,5 px de desplazamiento) | flux-kommunity-license | HuggingFace, 0 descargas |
| FLUX 3 Image Klein sin LoRA | Modelo base | No disponible | No disponible | Hace zoom o desplaza en 36 de 40 pruebas en lugar de extender | flux-kommunity-license | HuggingFace (acceso con licencia) |
| Qwen Image 2.1 Outpaint | Modelo de outpainting (referenciado por el autor) | No disponible | No disponible | No disponible | No disponible | Civitai |

La comparativa con alternativas de la misma categoria (otros LoRA o modelos especificos de outpainting) no puede completarse con los datos disponibles.

## Limitaciones y advertencias

- Uso recomendado restringido: el autor indica usarlo sobre el modelo destilado, a fuerza 1.5 y con gris `#808080`; otras combinaciones de relleno y prompts no fueron probadas.
- A fuerza 1.0 funciona, pero se desvia con mas frecuencia cuando se anade mucho contenido.
- El adaptador se entreno sobre el modelo base y se probo sobre el destilado, una discrepancia que puede afectar a la reproducibilidad en otros entornos.
- El flujo no usa mascara de ruido; el autor advierte que FLUX 3 base la necesita para mantener la imagen en su sitio, pero con ella el brillo de la imagen se desplaza.
- Riesgo de desviacion de los pixeles originales: aunque el desplazamiento tipico es de 0,1 a 1,5 px, en una de las 16 imagenes de prueba a fuerza 1.5 se superaron los 2 px.
- Las evaluaciones son del propio autor, con un numero reducido de imagenes y sin protocolo independiente; deben tomarse como indicativas.
- La licencia flux-kommunity-license no es una licencia de codigo abierto permisiva: impone condiciones especificas al uso comercial y requiere atender al fichero LICENSE.md y al NOTICE.txt incluidos.
- El acceso a los ficheros del modelo base exige aceptar la licencia en HuggingFace.
- No hay informacion sobre sesgos, comportamiento multilingue ni alucinaciones, dado que el artefacto opera exclusivamente sobre imagenes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ausboss/FLUX-3-Image-Klein-Outpaint-LoRA
- Flujo de trabajo ComfyUI incluido: workflows/flux-3-image-klein-outpaint.json (dentro del repositorio)
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Ficheros del modelo base para ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Nodos AusBoss para ComfyUI: https://github.com/ausboss/ComfyUI-AusBoss
- Canal de YouTube del autor: https://www.youtube.com/@ausbossdev
- Pagina del autor en Civitai (Qwen Image 2.1 Outpaint): https://civitai.com/models/2964810
