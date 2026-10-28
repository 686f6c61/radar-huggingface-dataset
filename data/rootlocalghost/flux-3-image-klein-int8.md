# rootlocalghost/flux-3-image-klein-int8

## Resumen

FLUX 3 Image Klein es un modelo de difusion de pesos abiertos orientado a generacion texto-a-imagen y edicion de imagenes. Lo desarrolla Black Forest Labs (BFL) y la version aqui referenciada es un reempaquetado en cuantizacion INT8 publicado por el usuario `rootlocalghost` en Hugging Face. El modelo unifica en una sola red la generacion desde prompt, la edicion con una imagen de referencia y la composicion con multiples referencias (hasta 10), devolviendo siempre una unica imagen de salida.

El transformer de imagen tiene 5,6 mil millones de parametros y va acompanado de un encoder de texto separado, Qwen3-VL-4B-Instruct, mas un autoencoder de imagen. El checkpoint publicado es la variante destilada (16 pasos de muestreo, sin guidance), pensada para generacion y edicion en autohospedaje; para ajuste fino y entrenamiento de LoRA existe una variante Base sin destilar (50 pasos, guidance 3,5). La arquitectura emplea muestreo tipo flow-map, y el modelo admite cajas delimitadoras en el prompt sobre una rejilla de 0 a 1000 para controlar la posicion y escala de los elementos, ademas de renderizado de texto dentro de la imagen generada.

Su relevancia ahora es doble: por un lado, consolida en un unico modelo tareas que antes requerian pipelines separados (T2I, edicion y composicion multi-referencia); por otro, la licencia FLUX Kommunity limita el uso comercial salvo excepcion para usuarios cualificados, lo que condiciona su adopcion en produccion. Es un modelo solo en ingles y exige un upsampler de prompts de forma practica: enviar un prompt corto tal cual produce resultados genericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con muestreo flow-map para imagen; encoder de texto Qwen3-VL-4B-Instruct separado y autoencoder de imagen |
| Parametros totales | 5,6B en el transformer de imagen (etiqueta del modelo); encoder de texto (~4B) y autoencoder son componentes aparte |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el transformer de imagen; acepta hasta 10 imagenes de referencia en la entrada |
| Tipos de cuantizacion | La model card documenta BF16, FP8 y NVFP4; el repositorio se denomina "int8" pero no se detalla en la informacion disponible el formato exacto de esa cuantizacion |
| Idiomas soportados | Ingles (`en`) |
| Licencia | FLUX Kommunity License (`license: other`, `flux-kommunity-license`); uso no comercial y excepcion de output comercial para Qualifying Users |
| Formato de pesos | `safetensors`, integrable con `diffusers`; el repositorio ocupa 11,0 GB |

**Variantes del checkpoint (segun la model card)**

| Checkpoint | Formato | Pasos | Guidance | Uso previsto |
|---|---|---|---|---|
| Klein Base | sin destilar, bfloat16 | 50 | 3,5 | ajuste fino, LoRA, investigacion |
| Klein (distilado) | destilado, bfloat16 | 16 | ninguna | generacion y edicion, autohospedaje; el checkpoint tras la API de BFL |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que comparte pesos para generacion texto-a-imagen, edicion con una referencia y composicion con varias referencias. La entrada de texto no la procesa el propio transformer, sino un encoder separado basado en Qwen3-VL-4B-Instruct, lo que permite describir escenas completas y referencias visuales. La model card menciona explicitamente el uso de "flow-map sampling" y advierte que el paquete de pesos no constituye por si solo una aplicacion de inferencia: hace falta una implementacion que soporte ese esquema de muestreo y este formato de checkpoint. Las cajas delimitadoras se expresan en el prompt sobre una rejilla de 0 a 1000 y guian posicion y escala, sin actuar como mascara dura sobre los pixeles.

El checkpoint distribuido esta destilado: reduce el muestreo a 16 pasos y elimina el guidance, frente a los 50 pasos con guidance 3,5 de la variante Base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o preferencias; esa informacion no esta disponible. Como elemento practico del pipeline, la implementacion de referencia carga siempre un clasificador de seguridad NSFW (`Falconsai/nsfw_image_detection`) y, por defecto, un upsampler de prompts de 18,8 GB descrito en la propia card como un modelo de 9B.

## Capacidades

- Generacion texto-a-imagen de una sola pasada a partir de una caption de escena completa.
- Edicion de imagen con una referencia (image-to-image) manteniendo composicion y aplicando cambios descritos en el prompt.
- Composicion multi-referencia: acepta hasta 10 imagenes de entrada y las combina en una unica salida.
- Control de layout mediante cajas delimitadoras en el prompt (rejilla 0-1000): colocar, recolorear, mover, reemplazar o eliminar elementos.
- Renderizado de texto legible dentro de la imagen generada (carteles, banners, etiquetas).
- Reutilizacion del mismo modelo para tareas de generacion y de edicion, sin cambiar de checkpoint.
- Integracion con `diffusers` mediante pipeline modular (`prompt` para T2I, `image` o lista de imagenes para edicion).
- Capacidad de upsampling de prompts delegada en un modelo externo (`flux-3-image-klein-pup` o cualquier LLM con el system prompt adecuado).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio o modo "thinking"; es un modelo puramente de imagen.

## Casos de uso

- **Edicion de fotografia de producto**: se pasa una foto de catalogo como referencia y se pide cambiar iluminacion, fondo o ambiente con una caption completa; el modelo preserva la composicion original y evita rehacer el shooting.
- **Composicion multi-referencia para e-commerce**: combinar hasta 10 referencias (producto, modelo, fondo, props) en una sola escena coherente para fichas de producto y creatividades de campana.
- **Maquetacion con layout controlado**: usando cajas en la rejilla 0-1000 se fijan posiciones y escalas de titulares, logotipos y elementos graficos, util para bocetos de publicidad impresa o banners donde la colocacion importa.
- **Generacion de carteles con texto integrado**: al soportar renderizado de texto en imagen, sirve para pruebas de concepto de packaging, etiquetas y carteleria antes de pasar a diseno final.
- **Iteracion conceptual en estudio de diseno**: pipeline con upsampler que expande un brief corto en una caption de escena completa, permitiendo generar variantes de estilo (dia/noche, materiales, paletas) partiendo de una imagen ya aprobada.
- **Prototipado de assets para interfaces y videojuegos**: generacion de ilustraciones, iconos complejos y mockups de pantalla con texto legible, a partir de descripciones largas y referencias visuales de estilo.
- **Ajuste fino de estilo de marca**: partiendo de Klein Base (sin destilar) se pueden entrenar LoRA de estilo o producto y luego usar el checkpoint destilado para inferencia rapida a 16 pasos.
- **Investigacion en edicion multi-referencia**: el par Base/distilado permite estudiar el efecto de la destilacion y del muestreo flow-map sobre calidad y fidelidad a la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos de Hugging Face no incluyen cifras de MMLU, GenEval, T2I-CompBench, FID, CLIP score ni comparaciones cuantitativas con otros modelos de imagen.

## Requisitos de hardware

- **Pesos del transformer**: 5,6B parametros. En BF16 suponen aproximadamente 11,2 GB; en FP8, unos 5,6 GB; en NVFP4, alrededor de 2,8-3 GB. Son estimaciones derivadas del recuento de parametros, no cifras oficiales.
- **Componentes adicionales**: el encoder de texto Qwen3-VL-4B-Instruct anade del orden de 8 GB en BF16 (4 GB en FP8) y el autoencoder una cantidad menor no especificada. El total en VRAM supera al del transformer por si solo, y la propia card advierte que el tamano de fichero de los paquetes cuantizados no mide el consumo total de GPU.
- **Upsampler de prompts**: el modelo recomendado (`flux-3-image-klein-pup`) pesa 18,8 GB y se carga por defecto en la implementacion de referencia. Puede desactivarse con `--no-pup` si la caption la escribe otro LLM, o ejecutarse en un proceso o equipo aparte.
- **GPU recomendadas**: no hay cifras oficiales de VRAM minima. Por volumen de pesos, un despliegue comodo en BF16 encaja en A100 40 GB, H100 80 GB o L40S 48 GB; con FP8 o NVFP4 el modelo es candidato a GPU de 24 GB (RTX 4090, L4, A10G), asumiendo que el encoder de texto y el upsampler se gestionen aparte o con offload.
- **GPU de consumo**: previsiblemente viable en RTX 4090 (24 GB) y, con cuantizaciones agresivas y offload, en tarjetas de 16 GB; no confirmado por el autor.
- **Opciones de despliegue**: `diffusers` (pipeline modular), codigo de referencia `black-forest-labs/flux-3-image-klein` con su CLI, y la API alojada de BFL. La informacion disponible no menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un transformer de difusion.
- **Latencia y throughput**: no disponibles. El checkpoint destilado esta disenado para 16 pasos sin guidance, frente a 50 pasos con guidance 3,5 del Base, lo que reduce el coste por imagen en el orden de tres veces en numero de evaluaciones del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / referencias | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (este repo, INT8) | 5,6B (transformer) + encoder Qwen3-VL-4B | Hasta 10 imagenes de referencia; contexto no disponible | T2I, edicion, composicion multi-referencia, cajas, texto en imagen | FLUX Kommunity (no comercial + excepcion para Qualifying Users) | Reempaquetado de terceros, 0 descargas, 11,0 GB |
| FLUX 3 Image Klein Base | 5,6B (transformer) | Igual, sin destilar | Ajuste fino, LoRA, investigacion | FLUX Kommunity | Repositorio oficial de BFL |
| FLUX.1 [dev] | 12B (dato publico de BFL) | no disponible en esta informacion | T2I y edicion (variante Kontext) | Licencia no comercial de BFL | Ampliamente disponible; no comparable en cifras de benchmark con datos aqui aportados |
| Stable Diffusion 3.5 Large | 8B (dato publico de Stability AI) | no disponible en esta informacion | T2I | Stability Community License | Disponible en Hugging Face |

No se dispone de datos de benchmark que permitan una comparacion cuantitativa entre estas alternativas. La comparacion anterior es cualitativa y se limita a parametros, tareas y licencia; los datos de FLUX.1 [dev] y SD 3.5 Large no provienen de la informacion proporcionada y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- **Licencia restrictiva**: la FLUX Kommunity License permite uso no comercial y solo otorga excepcion de output comercial a "Qualifying Users" sujeto a sus terminos. Cualquier uso en produccion requiere revision legal del fichero `LICENSE.md`.
- **Dependencia del upsampler**: la model card advierte explicitamente de que no debe usarse el modelo sin un upsampler de prompts. Un prompt corto enviado tal cual produce resultados genericos, lo que anade un modelo de 18,8 GB al despliegue.
- **Solo ingles**: el campo de idioma es `en`; no se documenta soporte multilingue, por lo que prompts en castellano pueden degradar la calidad.
- **Riesgo de alucinacion visual**: como modelo generativo, puede producir texto ilegible o mal escrito en la imagen, geometria inconsistente y elementos que no corresponden al prompt. Las cajas delimitadoras guian posicion y escala, pero no restringen los pixeles a una mascara dura.
- **Procedencia del reempaquetado**: este repositorio es una publicacion de terceros (`rootlocalghost`) con 0 descargas y 0 likes, etiquetada como INT8, mientras que la model card describe variantes BF16, FP8 y NVFP4. No se detalla el proceso de cuantizacion ni se aportan metricas de degradacion; conviene verificar la integridad de los pesos frente al repositorio oficial.
- **Metadatos anomalos**: las fechas de creacion y actualizacion del repositorio (28-10-2026) son posteriores a la fecha habitual de consulta; conviene comprobar la ficha en vivo.
- **Sin benchmarks**: no hay datos publicados de calidad (FID, CLIP, GenEval) que permitan estimar la perdida frente al BF16 oficial.
- **Filtro NSFW obligatorio en la referencia**: el codigo de BFL carga siempre un clasificador de contenido (`Falconsai/nsfw_image_detection`); en produccion hay que replicar ese control para cumplir politicas de contenido.
- **Sesgos**: no documentados por el autor. Al entrenarse previsiblemente con datos web en ingles, es esperable sesgo cultural y de representacion, pero no hay evaluacion disponible.
- **Coste de memoria real**: el tamano del fichero cuantizado no equivale al consumo total de VRAM; hay que sumar encoder de texto, autoencoder y, en su caso, upsampler.

## Enlaces

- Modelo en Hugging Face (este repositorio): https://huggingface.co/rootlocalghost/flux-3-image-klein-int8
- Repositorio oficial del checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint Base para ajuste fino y LoRA: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Upsampler de prompts: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Codigo de inferencia de referencia en GitHub: https://github.com/black-forest-labs/flux-3-image-klein
- Clasificador de seguridad NSFW usado por la referencia: https://huggingface.co/Falconsai/nsfw_image_detection
- API alojada de Black Forest Labs: https://bfl.ai
- Licencia FLUX Kommunity: https://huggingface.co/rootlocalghost/flux-3-image-klein-int8/blob/main/LICENSE.md

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente listados de sitios para adultos sin relacion alguna), por lo que no se han incluido como enlaces.
