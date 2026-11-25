# ausboss/MiniMax-H3-Image-Outpaint-LoRA

## Resumen

MiniMax-H3-Image-Outpaint-LoRA es un adaptador LoRA de rango 16 desarrollado por ausboss para el modelo de imagen MiniMaxAI/MiniMax-H3-Image. Su funcion es el outpainting (o uncrop): extender una imagen existente por cualquier lado rellenando de forma coherente las zonas nuevas, asi como repintar las esquinas grises que aparecen al rotar una fotografia. El adaptador se entrena sobre un unico formato de prompt y se distribuye con un workflow de ComfyUI listo para usar.

El problema que resuelve es concreto: sin el LoRA, MiniMax H3 Image tiende a redibujar el lienzo completo, encogiendo o desplazando la imagen original en lugar de extenderla. Segun las mediciones del autor, sobre 16 fotos no vistas en entrenamiento, el modelo base movia la imagen mas de 2 px en 6 casos; con el LoRA, en 0 de 16. El repositorio ocupa 0,3 GB y contiene los pesos del adaptador (155 MB), una version alternativa en el paso 2.000 y el workflow de ComfyUI.

Es relevante para desarrolladores que construyen pipelines de edicion de imagen con ComfyUI, ya que convierte una tarea fragil (outpainting con preservacion de pixeles) en un flujo reproducible con prompt fijo, parametros de muestreo concretos y un nodo de paste-back que devuelve los pixeles originales encima del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Image; rank 16 |
| Parametros totales | no disponible (el adaptador pesa 155 MB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el workflow de referencia usa `minimax_h3_image_pruned_int8_convrot` (INT8) para el modelo base; el LoRA se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (heredada del modelo base) |
| Formato de pesos | safetensors (`minimax-h3-image-outpaint.safetensors`, `minimax-h3-image-outpaint-2000.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 16 entrenado con ai-toolkit sobre MiniMaxAI/MiniMax-H3-Image, segun las etiquetas del repositorio. El autor reporta un entrenamiento de 2.000 pasos, del cual distribuye el checkpoint del paso 1.500 como version principal y el del 2.000 como alternativa. No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de imagenes, el numero de tokens ni si hubo etapas de RLHF o DPO; al tratarse de un adaptador de difusion, esos conceptos no aplican de la misma forma que en un LLM.

La innovacion tecnica principal no esta en la arquitectura del adaptador sino en el procedimiento de uso: se rellena el lienzo con gris plano `#808080`, se entrega como Picture 1 al modelo base y el LoRA aprende a rellenar solo esas zonas grises manteniendo la imagen original en su sitio. El autor documenta que el LoRA funciona mejor a fuerza 1.0 y a unos 4 MP (lado corto de 2048 px o menos); por encima de ese tamano el modelo base encoge su copia de la imagen y vuelve a producirse deriva. El workflow incluye un nodo Stitch Inpaint que vuelve a pegar los pixeles originales encima, de modo que la preservacion exacta no depende solo del LoRA.

## Capacidades

- Outpainting por cualquier lado: extension del lienzo a izquierda, derecha, arriba o abajo rellenando el gris con continuacion coherente de la escena.
- Uncrop de imagenes rotadas: repintado de las esquinas grises que quedan al enderezar una foto girada.
- Preservacion de la imagen original: el entrenamiento reduce la tendencia del modelo base a encoger o desplazar la imagen (0 de 16 casos con desplazamiento superior a 2 px en la evaluacion del autor).
- Control por prompt fijo: el adaptador responde a una plantilla concreta (`Outpaint <Picture 1>: replace the solid gray areas... Scene: <descripcion>`), y los elementos nombrados en la descripcion tienden a aparecer en la zona rellenada.
- Integracion con ComfyUI: workflow JSON incluido, nodos AusBoss 2.21.2 o superior y modelos base de Comfy-Org.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo thinking; es un adaptador de imagen, no un modelo de lenguaje.

## Casos de uso

- Extension de fotografias para formatos de impresion o redes sociales: se parte de una foto con una relacion de aspecto dada, se rellena con gris hasta el formato objetivo y el LoRA pinta la continuacion de la escena (garaje, hangar, bosque en los ejemplos del autor) para obtener un lienzo mas ancho o mas alto sin recortar el encuadre original.
- Enderezado de fotos torcidas: se rota la imagen con el nodo Image Crop + Rotate + Pad, quedan esquinas grises y el LoRA las rellena con mas escena; util para catalogos de producto o archivos fotograficos con horizontes inclinados.
- Preparacion de assets para juegos o entornos virtuales: ampliar texturas o key art de un formato cuadrado a panoramico manteniendo el sujeto en su posicion, con el paste-back garantizando que los pixeles originales no se alteran.
- Restauracion de material con bordes perdidos: fotos escaneadas con margenes recortados o danados se pueden padear y extender, aunque el autor advierte que el LoRA "aumenta mucho las probabilidades, no hace imposible un fallo".
- Produccion de variaciones de encuadre en un pipeline de ComfyUI: con 6 pasos, LCM y CFG 1 el autor reporta 11-13 segundos por imagen en una RTX 3090 una vez cargado el modelo, lo que permite generar varias extensiones por minuto en lote.
- Integracion en herramientas de edicion asistida: el workflow JSON y los nodos AusBoss permiten encapsular el flujo (pad, condicionamiento, muestreo, VAE decode, stitch) como plantilla reutilizable para usuarios no tecnicos dentro de ComfyUI.
- Generacion de composiciones con elementos intencionados: como lo nombrado en el prompt tiende a pintarse en la zona nueva, se puede pedir explicitamente un objeto (el autor cita un pajaro) para que aparezca en la extension.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 16 fotos no vistas en entrenamiento, paddeadas y rotadas a unos 4 MP, con muestreo de 6 pasos, LCM, CFG 1 y semilla 42. Las cifras son la salida cruda del sampler, antes del paste-back. La tabla del model card aparece truncada en la ultima fila (paso 2.000), por lo que ese dato no se recoge.

| Configuracion | PSNR del area conservada | Desplazamiento > 2 px | Error de relleno | Costura | Gris restante |
|---|---|---|---|---|---|
| H3 Image solo | 23,3 dB | 6 de 16 | 32,5 | 6,0 | 5 de 16 |
| Paso 1.000 | 30,5 dB | 0 de 16 | 19,2 | 3,0 | 1 de 16 |
| Paso 1.500 (archivo principal) | 30,9 dB | 0 de 16 | 19,3 | 3,4 | 1 de 16 |
| Paso 2.000 | no disponible (truncado en la model card) | no disponible | no disponible | no disponible | no disponible |

Ademas, el autor reporta sobre 12 renders propios: 4 de 12 con desplazamiento sin el LoRA frente a 0 de 12 con el LoRA. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un adaptador de difusion de imagen.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del modelo base MiniMax H3 Image. El autor cita la variante `minimax_h3_image_pruned_int8_convrot` (INT8) junto con el text encoder `qwen3vl_32b_minimax_h3_int8_convrot` y el VAE `minimax_h3_image_vae_fp16`, lo que sugiere que el consumo dominante es el del modelo base y el encoder de texto, no el LoRA (155 MB).
- GPU recomendadas: el autor valida el flujo en una RTX 3090 con tiempos de 11-13 segundos por imagen una vez cargado el modelo. No se documentan pruebas en A100, H100 ni en GPUs consumer de gama inferior.
- Cabe en GPU consumer: si, segun la unica referencia publicada (RTX 3090 con el modelo base en INT8). No hay datos para GPUs con menos VRAM.
- Opciones de despliegue: ComfyUI con los nodos AusBoss 2.21.2 o superior y los modelos de Comfy-Org/MiniMax-H3-Image y Comfy-Org/MiniMax-H3. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un adaptador de difusion de imagen).
- Latencia y throughput: 11-13 s por imagen en RTX 3090 con 6 pasos, LCM y CFG 1, una vez cargado el modelo, segun el autor. No hay datos de throughput en lote ni de otras GPUs.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores LoRA de outpainting para MiniMax H3 Image en la informacion proporcionada. La comparacion mas directa disponible es contra el propio modelo base sin adaptador, usando las mediciones del autor:

| Modelo | Parametros | Contexto | PSNR area conservada | Desplazamiento > 2 px | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax H3 Image (base) | no disponible | no disponible | 23,3 dB | 6 de 16 | minimax-h3-image-community-license-agreement | Hugging Face (MiniMaxAI, Comfy-Org) |
| Outpaint LoRA paso 1.500 | LoRA rank 16, 155 MB | no disponible | 30,9 dB | 0 de 16 | minimax-h3-image-community-license-agreement | Hugging Face (ausboss) |
| Outpaint LoRA paso 2.000 | LoRA rank 16 | no disponible | no disponible | no disponible | minimax-h3-image-community-license-agreement | Hugging Face (ausboss) |

No se conocen alternativas de terceros comparables en la informacion disponible.

## Limitaciones y advertencias

- No garantiza la preservacion perfecta: el autor indica que "aumenta mucho las probabilidades, no hace imposible un fallo"; el workflow mitiga el riesgo pegando los pixeles originales encima del resultado.
- Limite de resolucion: por encima de unos 4 MP (lado corto superior a 2048 px) el modelo base encoge su copia de la imagen y vuelve la deriva. El autor recomienda hacer outpainting a 4 MP y escalar despues.
- Dependencia del prompt: el LoRA se entreno con una unica plantilla; desviarse de ella o describir elementos que no estan en la imagen puede introducirlos en la zona rellenada (el autor cita el caso de un pajaro nombrado en el prompt que aparece en todas las versiones, tambien con el modelo base).
- El checkpoint del paso 2.000, aunque da las costuras mas limpias segun el autor, en una imagen de prueba movio y repinto la imagen; el paso 1.500 es el archivo recomendado.
- Licencia: hereda la minimax-h3-image-community-license-agreement del modelo base; es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva generica.
- Idiomas: no hay informacion sobre el soporte multilingue del prompt; no disponible.
- Sesgos y alucinacion visual: no se documentan sesgos especificos del adaptador; al ser un relleno generativo, el contenido inventado en las zonas nuevas puede no corresponder con la escena real (por ejemplo, arquitectura o vegetacion plausibles pero inexistentes).
- Dependencia de ecosistema: requiere ComfyUI y los nodos AusBoss 2.21.2 o superior, ademas de los ficheros del modelo base en INT8; no es un adaptador portable a otros frameworks sin conversion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; la validacion publica es unicamente la del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ausboss/MiniMax-H3-Image-Outpaint-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Workflow de ComfyUI incluido: `workflows/minimax-h3-image-rotate-outpaint.json` (dentro del repositorio)
- Nodos AusBoss para ComfyUI: https://github.com/ausboss/ComfyUI-AusBoss
- Modelos en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image y https://huggingface.co/Comfy-Org/MiniMax-H3
- Canal de YouTube del autor: https://www.youtube.com/@ausbossdev
- Discord del autor: https://discord.gg/RwVxY9Fuaj
