# dremokk/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una familia de adaptadores LoRA para modelos de edicion de imagen por difusion, orientada especificamente a la sustitucion de rostros y cabezas completas entre dos imagenes de entrada. El autor, dremokk, publica el conjunto bajo licencia MIT en Hugging Face y lo distribuye como una serie de variantes numeradas (Face V1, Head V1 a V5) que cubren desde un reemplazo facial sutil hasta un trasplante completo de cabeza con mezcla de tonos de piel, iluminacion y postura. La relevancia actual del proyecto radica en que se apoya en modelos base recientes de gran capacidad (Qwen-Image-Edit 2509/2511 y FLUX.2-klein en variantes de 4B y 9B), lo que permite obtener resultados de alta fidelidad sin entrenar un modelo desde cero.

Tecnicamente no es un modelo autonomo, sino un conjunto de pesos LoRA (adaptadores de bajo rango) que se cargan sobre el modelo base de edicion de imagen. El repositorio ocupa 10,9 GB e incluye pesos en formato safetensors para las distintas variantes, con algunos ficheros fusionados (merged) en rank 16 fp16 y rank 32 fp32. La integracion esta pensada para flujos de trabajo con diffusers y ComfyUI, y el autor proporciona prompts de referencia y un workflow descargable en Civitai.

El interes para desarrolladores e investigadores es doble: por un lado, demuestra un caso de uso muy concreto (face/head swap) resuelto mediante LoRA sobre editores de imagen modernos; por otro, expone una peculiaridad de diseno relevante en produccion, como es la inversion del orden de las imagenes de entrada en las versiones Head V3, V4 y V5 (primero el cuerpo, despues la cara), un detalle que condiciona cualquier integracion automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos de difusion de edicion de imagen (Qwen-Image-Edit 2509/2511 y FLUX.2-klein 4B/9B) |
| Parametros totales | no disponible (depende del modelo base; el LoRA en si es un adaptador de bajo rango) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplica el contexto del modelo base de edicion de imagen) |
| Tipos de cuantizacion | pesos en fp16 y fp32 para las variantes fusionadas; los modelos base incluyen variantes fp8 (FLUX.2-klein-9b-fp8 y 4b-fp8) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BFS no entrena un transformer de difusion nuevo, sino que entrena adaptadores LoRA de bajo rango que se inyectan en las capas de atencion del modelo base de edicion de imagen. La serie cubre dos familias de modelos base: Qwen-Image-Edit en sus versiones 2509 y 2511, y FLUX.2-klein en tamanos de 4B y 9B (incluidas variantes base y fp8). Cada variante de la serie esta entrenada para un nivel de reemplazo distinto: Face V1 sustituye solo el rostro preservando pelo, iluminacion y fondo del objetivo; Head V1 hace un trasplante completo de cabeza con mezcla natural; Head V2 mejora el ajuste de tono de piel y la alineacion de postura; Head V3 prioriza estabilidad y precision; Head V4 refuerza la transferencia de expresion; y Head V5 es la version mas reciente para flujos 2511.

En cuanto a los datos de entrenamiento, el autor no publica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplica en el sentido clasico de LLM). Si indica que la variante Head V5 original se entreno durante mas de 5.500 pasos sobre el modelo 2511, y que las versiones fusionadas combinan ese original con BFS Head V4 (2509) mediante un merge de pesos; segun su evaluacion, la version fusionada reproduce un rango de expresiones mas amplio. Para la rama FLUX.2-klein se publican checkpoints intermedios identificados por paso (step3500, step3750) y por rango (rank128, rank64), lo que sugiere entrenamientos mas largos con distintos compromisos entre capacidad y tamano del adaptador.

## Capacidades

- Edicion de imagen image-to-image: recibe dos imagenes (cara/cabeza fuente y cuerpo/escena destino) y genera una imagen editada.
- Face swap selectivo: la variante Face V1 sustituye unicamente el rostro, conservando el pelo, la iluminacion y el fondo de la imagen destino.
- Head swap completo: las variantes Head realizan un trasplante de cabeza completa con mezcla de cuello, pelo y tono de piel sobre el cuerpo destino.
- Transferencia de identidad y expresion: Head V4 y Head V5 preservan rasgos faciales (ojos, nariz, boca, textura de piel) mientras copian direccion de mirada, rotacion de cabeza y microexpresiones de la imagen base.
- Coherencia de iluminacion y entorno: los prompts de referencia enfatizan mantener la iluminacion, el entorno y el fondo de la imagen base.
- Integracion con flujos ComfyUI y diffusers: los pesos se cargan como LoRA sobre el pipeline de edicion del modelo base.
- Soporte multilingue: limitado a prompts en ingles segun la model card (idioma declarado: en).
- No dispone de tool calling, razonamiento multi-paso ni modo thinking: es un adaptador de generacion de imagen, no un modelo de lenguaje.

## Casos de uso

- Prototipado de doblaje y postproduccion audiovisual: sustitucion de la cabeza de un actor por la de un doble en planos concretos, manteniendo iluminacion y fondo originales gracias a los prompts de preservacion de entorno de Head V3/V5.
- Generacion de contenido sintetico para entrenamiento de modelos de vision: crear variaciones controladas de identidad facial sobre un mismo cuerpo para aumentar la diversidad de un dataset de reconocimiento facial, usando Face V1 para cambios sutiles.
- Pruebas de vestuario y maquillaje en preproduccion: aplicar un rostro de referencia sobre un cuerpo con una pose concreta para evaluar como queda el conjunto antes de un rodaje, aprovechando la alineacion de postura de Head V2.
- Creacion de avatares personalizados para videojuegos o entornos virtuales: transferir la identidad de un usuario a un modelo base 3D renderizado, con Head V4 para conservar microexpresiones.
- Restauracion o recomposicion de retratos: reemplazar una cabeza danada o mal expuesta por otra de mejor calidad manteniendo la escena original, usando la capacidad de mezcla de tonos de piel de Head V2/V5.
- Investigacion sobre sesgos y deepfakes: generar pares controlados de imagenes con identidad intercambiada para estudiar la robustez de detectores de face swap, dado que el modelo es abierto y reproducible bajo licencia MIT.
- Flujos creativos en ComfyUI: integrar el LoRA en un grafo de edicion por lotes para producir variantes de un personaje sobre distintos cuerpos, usando los workflows publicados por el autor como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el adaptador LoRA se suma al modelo base; FLUX.2-klein dispone de variantes fp8 de 4B y 9B, y Qwen-Image-Edit 2511 es un modelo de edicion de imagen de gran tamano. El repositorio completo ocupa 10,9 GB, pero la VRAM en inferencia depende del modelo base cargado.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el perfil de los modelos base (edicion de imagen de 4B a 9B en fp8/fp16), se situa en la gama de GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090 y similares), aunque el autor no lo especifica.
- Cabe en consumer GPU: no confirmado por el autor; depende de la variante del modelo base y de la cuantizacion (las variantes fp8 de FLUX.2-klein 4B son las mas ligeras de la familia).
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (workflow publicado en Civitai). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS (Best Face Swap) | LoRA sobre Qwen-Image-Edit 2509/2511 y FLUX.2-klein 4B/9B | adaptador de bajo rango (base 4B/9B) | no disponible | MIT | Hugging Face (dremokk/BFS-Best-Face-Swap) |
| Qwen-Image-Edit 2511 | Modelo base de edicion de imagen | no disponible | no disponible | no disponible | Hugging Face (Qwen/Qwen-Image-Edit-2511) |
| FLUX.2-klein 4B / 9B | Modelo base de edicion/generacion de imagen | 4B y 9B | no disponible | no disponible | Hugging Face (black-forest-labs) |

No se dispone de datos de benchmarks ni de otros adaptadores de face swap comparables en la informacion proporcionada, por lo que la comparativa se limita a los modelos base sobre los que opera BFS.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al operar sobre modelos base de difusion, hereda los sesgos de representacion de identidad, tono de piel y genero de dichos modelos.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos en zonas de mezcla (cuello, linea del pelo, orejas) o inconsistencias anatomicas, especialmente en poses extremas.
- Orden de entrada invertido: en Head V3, V4 y V5 (y en la rama FLUX.2-klein) la primera imagen debe ser el cuerpo y la segunda la cara; usar el orden estandar produce resultados incorrectos sin aviso.
- Dependencia del prompt: el autor proporciona prompts especificos por variante; el rendimiento puede degradarse con instrucciones distintas a las documentadas.
- Idioma: los prompts de referencia estan en ingles; no se declara soporte para otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el uso de face swap sobre personas reales puede infringir derechos de imagen, normativa de proteccion de datos (RGPD) y legislacion sobre deepfakes; se recomienda consentimiento explicito y marcado de contenido sintetico.
- Caveat de produccion: el proyecto tiene muy poca traccion (82 descargas, 0 likes) y no hay benchmarks publicos; conviene validar la calidad en el caso de uso concreto antes de integrarlo en un pipeline.
- Riesgo de suplantacion: la capacidad de transferir identidad facial con alta fidelidad exige controles de abuso y trazabilidad en cualquier despliegue publico.

## Enlaces

- Hugging Face: https://huggingface.co/dremokk/BFS-Best-Face-Swap
- Workflow Head/Face Swap para Qwen Image Edit 2509 (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
- Modelo base Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2-klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2-klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base FLUX.2-klein 9B fp8: https://huggingface.co/black-forest-labs/FLUX.2-klein-9b-fp8
- Modelo base FLUX.2-klein 4B fp8: https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8
