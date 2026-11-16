# shashirag/naruto-lora-r32

## Resumen

`shashirag/naruto-lora-r32` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 para generar imagenes con el estilo visual de la serie Naruto. Lo desarrolla el usuario de Hugging Face `shashirag` y se distribuye como un adaptador de `diffusers` que debe cargarse junto al modelo base `stable-diffusion-v1-5/stable-diffusion-v1-5` (espejo del deprecado `runwayml/stable-diffusion-v1-5`). No es un modelo de lenguaje: es un modelo texto-a-imagen de difusion latente.

El problema que resuelve es la especializacion estilistica: en lugar de reentrenar o hacer fine-tuning completo de SD 1.5, el adaptador anade 6.377.472 parametros entrenables que desplazan la distribucion de salida hacia retratos de personajes con la estetica de la franquicia. El entrenamiento es notablemente ligero: 1000 pasos, batch efectivo de 4, precision fp16 y 0,55 horas en una unica GPU T4 con un pico de 4453 MiB de memoria.

La relevancia es limitada y acotada al ambito de investigacion y docencia: el dataset procede de Narutopedia (wiki de fans) con personajes con copyright, la model card restringe explicitamente el uso a fines no comerciales y las metricas se calcularon sobre muestras muy pequenas (36 imagenes por modelo, 16 para KID). Es, por tanto, un ejemplo didactico de pipeline LoRA mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5) con adaptador LoRA de rango 32 |
| Parametros totales | No disponible para el modelo base; adaptador LoRA: 6.377.472 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y publica en fp16) |
| Idiomas soportados | No disponible (los prompts dependen del codificador de texto CLIP de SD 1.5, predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M (con restriccion adicional del autor a uso no comercial) |
| Formato de pesos | Pesos de adaptador LoRA para `diffusers` (safetensors, segun el ecosistema de la libreria; no confirmado en la informacion disponible) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion 1.5, un modelo de difusion latente compuesto por un autoencoder VAE, un codificador de texto CLIP y un U-Net denoiser. La tecnica LoRA introduce matrices de baja descomposicion en las capas del U-Net, con rango 32 y 6.377.472 parametros entrenables, manteniendo congelados los pesos del modelo base. La resolucion de trabajo es 512x512, con imagenes recortadas al centro.

El dataset es `lambdalabs/naruto-blip-captions`: 1221 imagenes, de las cuales 1098 se usaron para entrenamiento y 123 se reservaron para evaluacion (semilla de particion 266). No se detectaron imagenes corruptas ni duplicadas. Las descripciones se generaron automaticamente con BLIP, por lo que son cortas y en ocasiones incorrectas. El entrenamiento uso learning rate 0,0001, 1000 pasos, batch size 1 con 4 pasos de acumulacion de gradiente (batch efectivo 4), precision fp16 y semilla 266. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa; no aplica en un modelo de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con estetica de personajes de Naruto.
- Reproduccion de retratos frontales de personajes, que es el tipo de imagen dominante en el dataset.
- Condicionamiento por prompt textual en ingles a traves del codificador CLIP de SD 1.5.
- Composicion con el modelo base mediante carga de adaptador LoRA en `diffusers`.
- Ajuste del peso del adaptador (escala LoRA) para modular la intensidad del estilo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla del texto-a-imagen.
- Capacidades multilingues: no documentadas; el prompt efectivo depende del vocabulario CLIP de SD 1.5.

## Casos de uso

- Investigacion sobre fine-tuning eficiente: sirve como referencia reproducible de un pipeline LoRA completo (dataset, hiperparametros, metricas y limitaciones documentadas) para comparar tecnicas de adaptacion de bajo rango en modelos de difusion.
- Docencia en generacion de imagenes: permite mostrar en clase como un adaptador de 6,3 millones de parametros modifica el sesgo estilistico de un modelo base sin reentrenarlo, con un coste de 0,55 horas en una T4.
- Pruebas de concepto de personalizacion estilistica: util para validar flujos de trabajo de carga de LoRA en `diffusers` antes de invertir en adaptadores con datasets propios y licencias limpias.
- Evaluacion de metricas de fidelidad y diversidad: el par de valores KID (0,15065 base frente a 0,02974 adaptado) y LPIPS permite ilustrar el efecto de un LoRA sobre la distribucion de salida en dominios acotados.
- Generacion de material ilustrativo interno no comercial: prototipos visuales para talleres o articulos, siempre que se respete la restriccion de uso no comercial y se asuma el riesgo de copyright de los personajes.
- Estudio de sesgos y limitaciones de los captioning automaticos: las descripciones BLIP cortas y a veces erroneas permiten analizar como la calidad de las etiquetas afecta a la adherencia al prompt en modelos de difusion.

## Benchmarks y rendimiento

| Metrica | SD 1.5 base | Este modelo |
|---|---|---|
| KID, en dominio (menor es mejor) | 0,15065 | 0,02974 |
| CLIP score, todos los prompts | 30,51 | 30,23 |
| CLIP score, prompts composicionales | 33,21 | 31,95 |
| LPIPS diversidad (mayor es mas diverso) | 0,8013 | 0,7828 |

Evaluacion humana: 3 evaluadores compararon el modelo con la base en 25 pares; la mayoria prefirio este modelo en 16 de 25 pares, pero la concordancia entre evaluadores fue baja y la muestra es pequena. Las metricas se calcularon con 36 imagenes por modelo y 16 para KID, por lo que las diferencias pequenas no son fiables.

## Requisitos de hardware

- VRAM para inferencia: el entrenamiento requirio un pico de 4453 MiB en una T4; la inferencia con SD 1.5 en fp16 suele moverse en el rango de 4 a 8 GB, aunque no se publica una cifra especifica de inferencia para este adaptador.
- GPU recomendadas: T4 (validada en entrenamiento), asi como A100, H100 o RTX 4090 para mayor throughput; el modelo base SD 1.5 es ligero y cabe en GPUs de consumo.
- GPU de consumo: si, es compatible con tarjetas de 8 GB o mas en fp16; no se documentan requisitos adicionales por el LoRA, que anade solo 6,3 millones de parametros.
- Opciones de despliegue: `diffusers` (libreria declarada), con integracion habitual en ComfyUI y Automatic1111 para adaptadores LoRA de SD 1.5; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shashirag/naruto-lora-r32` | LoRA de 6.377.472 entrenables sobre SD 1.5 | No aplica | KID en dominio 0,02974; CLIP 30,23 | CreativeML OpenRAIL-M + restriccion no comercial | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | No disponible en la informacion | No aplica | KID en dominio 0,15065; CLIP 30,51 | CreativeML OpenRAIL-M | Hugging Face, ampliamente adoptado |
| Otros LoRA de estilo sobre SD 1.5 | Variable | No aplica | No disponible | Variable segun autor | Comunidad de Hugging Face y Civitai |

No se dispone de datos de benchmarks de otros adaptadores comparables en la informacion proporcionada, por lo que la comparativa con alternativas de la misma categoria queda limitada al modelo base.

## Limitaciones y advertencias

- Sesgo de dominio: una sola franquicia y un solo estilo; las salidas se parecen a las imagenes de entrenamiento, no constituyen un estilo anime general.
- Descripciones BLIP cortas y a veces erroneas, e imagenes mayoritariamente de retratos frontales, lo que sesga la generacion hacia ese tipo de composicion.
- Prompts composicionales (recuentos, colores, posiciones) suelen fallar y los objetos solicitados pueden desaparecer de la imagen.
- Metricas sobre muestras muy pequenas (36 imagenes por modelo, 16 para KID); las diferencias pequenas no son estadisticamente fiables.
- El safety checker marco algunas imagenes inofensivas como falsos positivos (rostros anime), que se excluyeron de las metricas.
- Riesgo de alucinacion visual: el modelo puede generar detalles anatomicos o de vestuario inconsistentes al no estar supervisado con descripciones precisas.
- Restriccion de licencia: el dataset no declara licencia y las imagenes proceden de Narutopedia con personajes con copyright; el autor limita el adaptador a investigacion y docencia no comercial. Las restricciones de CreativeML OpenRAIL-M del modelo base se aplican tambien.
- Disponibilidad practica: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No apto como sustituto de un modelo de lenguaje: no ofrece tool calling, agentes ni razonamiento textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashirag/naruto-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Citacion del dataset: Cervenka, E. (2022), Naruto BLIP captions
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
