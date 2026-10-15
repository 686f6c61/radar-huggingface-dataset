# SD-Next/flux-3-image-klein

## Resumen

FLUX 3 Image Klein es un modelo de difusion de 5.548.681.984 parametros (aproximadamente 5,6B) destinado a generacion de imagenes a partir de texto y a edicion de imagenes. Lo desarrolla Black Forest Labs (BFL) y esta publicado con pesos abiertos; el repositorio analizado, `SD-Next/flux-3-image-klein`, es un espejo mantenido para su uso con SD.Next a partir de la revision `8454017f` del repositorio original `black-forest-labs/flux-3-image-klein`. La etiqueta de 5,6B se refiere unicamente al transformer de imagen: el codificador de texto es un componente separado, Qwen3-VL-4B-Instruct.

El modelo unifica en un solo checkpoint tres tareas que habitualmente requieren pipelines distintos: generacion texto-a-imagen, edicion con una unica imagen de referencia y composicion con multiples referencias (hasta 10 imagenes de entrada), devolviendo siempre una sola imagen de salida. Ademas incorpora control de composicion mediante cajas delimitadoras escritas en el propio prompt sobre una rejilla de 0 a 1000, y renderizado de texto dentro de la imagen generada.

Es relevante ahora porque el checkpoint publicado es la version destilada que sirve la API de BFL, con tan solo 16 pasos de muestreo y sin guidance, lo que reduce de forma notable el coste de inferencia frente a la variante Base (no destilada, 50 pasos y guidance 3,5). Se distribuye bajo la FLUX Kommunity License, que permite uso no comercial y contempla una excepcion de salida comercial para Usuarios Cualificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching con muestreo flow-map); codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imagen separados |
| Parametros totales | 5.548.681.984 en el transformer de imagen (el codificador de texto es adicional) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (raiz), FP8 (`variants/fp8r`), NVFP4 (`variants/nvfp4`) |
| Idiomas soportados | en (ingles) |
| Licencia | FLUX Kommunity License (`license: other`, `license_name: flux-kommunity-license`) |
| Formato de pesos | safetensors (transformer `model.safetensors`, autoencoder `ae.safetensors`, codificador de texto en `text_encoder/*`); incluye checkpoint single-file de BFL |
| Pipeline | image-to-image (soporta tambien texto-a-imagen mediante `prompt`) |
| Pasos de muestreo (destilado) | 16 |
| Guidance (destilado) | ninguno |
| Tamano del repositorio | 31,8 GB |
| Revision | `8454017f` |
| Libreria | diffusers (pipelines modulares) |

## Arquitectura y entrenamiento

Se trata de un modelo de difusion construido sobre un transformer (arquitectura tipo DiT) que emplea muestreo flow-map, segun indica la propia model card al exigir una implementacion de inferencia compatible con este esquema. El paquete se compone de tres piezas: el transformer de imagen de 5,6B, un autoencoder de imagen (`ae.safetensors`) que opera en el espacio latente y un codificador de texto Qwen3-VL-4B-Instruct. Este ultimo aporta comprension de texto e imagen, lo que habilita de forma nativa las tareas de edicion con referencias visuales dentro del mismo pipeline modular de diffusers.

La model card distingue dos checkpoints con el mismo peso de parametros: Klein Base, no destilado, en bfloat16, configurado para 50 pasos con guidance 3,5 y orientado a ajuste fino, entrenamiento de LoRA e investigacion; y Klein, destilado, en bfloat16, configurado para 16 pasos sin guidance y orientado a generacion, edicion y autohospedaje, siendo el checkpoint que hay detras de la API de BFL. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detalla la innovacion concreta del muestreo flow-map mas alla de su nombre y de la exigencia de compatibilidad por parte del cargador. El repositorio incluye ademas un upsampler de prompt opcional (`flux-3-image-klein-pup`, 18,8 GB) que reescribe el prompt antes de la generacion, y carga siempre un clasificador de seguridad (`Falconsai/nsfw_image_detection`).

## Capacidades

- Generacion texto-a-imagen a partir de un prompt en ingles.
- Edicion con una unica imagen de referencia (image-to-image), incluyendo cambios de iluminacion, paleta o ambientacion.
- Composicion con multiples referencias: acepta hasta 10 imagenes de entrada en una misma generacion.
- Control de composicion mediante cajas delimitadoras escritas en el prompt sobre una rejilla de 0 a 1000; las cajas guian colocacion y escala, y no actuan como mascara dura sobre los pixeles. Permiten recolorear, mover, sustituir o eliminar elementos.
- Renderizado de texto dentro de la imagen generada.
- Upsampling de prompt mediante el modelo auxiliar PUP, o envio del prompt tal cual con la opcion `--no-pup`.
- Clasificador de seguridad NSFW cargado de forma obligatoria en la implementacion de referencia.
- Soporte de pipelines modulares en diffusers y de carga desde la lista de modelos de SD.Next.
- Tool calling, function calling, razonamiento multi-paso y agentes: no aplicable, es un modelo de generacion de imagen, no un modelo de lenguaje conversacional.
- Capacidades multilingues: no disponible; la model card declara unicamente ingles.
- Modo thinking, vision o audio como salida: no disponible (la entrada visual si esta soportada via referencias).

## Casos de uso

- Generacion de creatividades publicitarias con composicion controlada: las cajas delimitadoras sobre rejilla 0-1000 permiten fijar la posicion y escala de logotipos, productos y titulares dentro del encuadre, algo que un prompt puramente textual no garantiza.
- Edicion de fotografia de producto: partiendo de una unica imagen de referencia se puede recolorear un articulo, cambiar el fondo, sustituir un elemento o modificar la iluminacion sin reencuadrar el resto de la escena.
- Composicion de catalogos con multiples referencias: al aceptar hasta 10 imagenes de entrada, se pueden integrar varios productos en una sola escena coherente para fichas de e-commerce o lookbooks.
- Rotulacion de imagenes con texto legible: el renderizado de texto dentro de la imagen es adecuado para mockups de packaging, carteles, banners y pruebas de concepto de material grafico.
- Ajuste fino y entrenamiento de LoRA por dominio: para este flujo hay que usar FLUX 3 Image Klein Base, no destilado, con 50 pasos y guidance 3,5, que es el checkpoint indicado para investigacion y personalizacion.
- Prototipado rapido autohospedado: el checkpoint destilado genera en 16 pasos sin guidance, lo que reduce el tiempo por imagen y encaja en flujos iterativos dentro de SD.Next o de los pipelines modulares de diffusers.
- Post-produccion de imagen con cambios de ambiente: la model card documenta como ejemplo el paso de una escena diurna a la misma escena nocturna bajo luna llena manteniendo el sujeto y el entorno.
- Integracion en servicios de generacion con filtrado previo: el clasificador NSFW obligatorio de la implementacion de referencia permite montar un pipeline con control de contenido antes de servir la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de 5,6B, calculada a partir del numero de parametros y del formato: aproximadamente 11,1 GB en BF16, unos 5,5 GB en FP8 y alrededor de 2,8 GB en NVFP4.
- El calculo anterior no incluye el codificador de texto Qwen3-VL-4B-Instruct, que anade del orden de 8 GB en BF16, ni el autoencoder de imagen, ni las activaciones y el espacionlatente durante el muestreo. La propia model card advierte que el tamano de los ficheros cuantizados no es una medida del uso total de memoria de GPU.
- GPU recomendadas: H100 y A100 (40 o 80 GB) para BF16 sin cuantizar; tarjetas de 24 GB, como la RTX 4090, quedan muy ajustadas en BF16 si se suman transformer, codificador de texto y activaciones, por lo que se recomienda FP8 o NVFP4 en ese rango.
- En GPU de consumo: viable con las variantes FP8 y NVFP4; el repositorio completo ocupa 31,8 GB, de modo que el almacenamiento necesario para descargar el paquete tambien debe dimensionarse.
- Opciones de despliegue: pipelines modulares de diffusers (instalando diffusers desde el repositorio de GitHub), SD.Next a traves de su lista de modelos, la implementacion de referencia de BFL con su CLI y scripts, y la API de BFL como alternativa gestionada. vLLM, llama.cpp, Ollama y TGI no se mencionan como opciones de despliegue en la informacion disponible.
- Latencia y throughput: no disponible. Los unicos datos de coste computacional publicados son los pasos de muestreo (16 en el destilado frente a 50 en el Base) y la ausencia de guidance en el destilado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos | Guidance | Licencia | Orientacion |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado) | 5,6B (transformer) | bfloat16, FP8, NVFP4 | 16 | ninguno | FLUX Kommunity License | Generacion y edicion, autohospedaje, checkpoint de la API de BFL |
| FLUX 3 Image Klein Base | 5,6B (transformer) | bfloat16 sin destilar | 50 | 3,5 | FLUX Kommunity License | Ajuste fino, entrenamiento de LoRA, investigacion |
| Otros modelos de generacion y edicion de imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas externas a la familia FLUX no puede elaborarse con la informacion proporcionada, ya que no se incluyen datos de benchmarks ni especificaciones de modelos competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la informacion proporcionada no documenta analisis de sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En generacion de imagen el riesgo se traduce en elementos, texto o detalles visuales inconsistentes con el prompt, especialmente en el renderizado de texto y en composiciones con muchas referencias.
- Idioma: la model card declara unicamente ingles (`en`), tanto para el prompt como para las capacidades del codificador de texto; no hay soporte multilingue documentado.
- Restricciones de licencia: la FLUX Kommunity License permite uso no comercial y contempla una excepcion de salida comercial solo para Usuarios Cualificados y sujeta a sus terminos. Cualquier uso comercial en produccion exige revisar `LICENSE.md` y `NOTICE.md` para determinar si se encaja en esa excepcion.
- Dependencia de implementacion: el paquete contiene los pesos, no una aplicacion de inferencia completa; es necesario un cargador que soporte muestreo flow-map y el formato del checkpoint, y las variantes cuantizadas requieren un cargador compatible con su cuantizacion.
- El clasificador de seguridad NSFW de la implementacion de referencia se carga siempre, lo que anade requisitos de almacenamiento y computo, y hay que descargarlo aparte.
- El upsampler de prompt es opcional pero pesa 18,8 GB adicionales si se quiere usar; omitirlo cambia el comportamiento respecto a la configuracion de referencia.
- Las cajas delimitadoras guian colocacion y escala, pero no restringen los pixeles a una mascara dura: no deben tratarse como un mecanismo de control deterministico.
- Este repositorio es un espejo de terceros (SD-Next) y no incluye la carpeta de variantes cuantizadas; para las variantes FP8 y NVFP4 hay que acudir al repositorio original.
- El modelo fue creado y actualizado en octubre de 2026 segun los metadatos del repositorio; conviene verificar la existencia de revisiones posteriores antes de fijar una version en produccion.

## Enlaces

- Repositorio analizado (espejo SD.Next): https://huggingface.co/SD-Next/flux-3-image-klein
- Repositorio original: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Variante Base para ajuste fino: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Upsampler de prompt (PUP): https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Variantes cuantizadas FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes cuantizadas NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- API de BFL: https://bfl.ai
- SD.Next: https://github.com/vladmandic/sdnext
- Clasificador de seguridad NSFW: https://huggingface.co/Falconsai/nsfw_image_detection
- Diffusers (instalacion desde repositorio): https://github.com/huggingface/diffusers
- Licencia: LICENSE.md en el repositorio del modelo
- Aviso legal: NOTICE.md en el repositorio del modelo
