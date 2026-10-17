# Jinstudio/flux-3-image-klein

## Resumen

FLUX 3 Image Klein es un modelo de pesos abiertos de 5,6 mil millones de parametros (5.548.681.984 en el transformer de imagen) desarrollado por Black Forest Labs, disenado para generacion de imagen a partir de texto y edicion de imagenes. Acepta un prompt y hasta 10 imagenes de referencia y devuelve una sola imagen; la generacion texto-a-imagen, la edicion con una referencia y las composiciones con multiples referencias se ejecutan a traves del mismo modelo. El codificador de texto asociado es Qwen3-VL-4B-Instruct, un componente separado de los 5,6B del transformer.

La ficha que se describe aqui corresponde al repositorio Jinstudio/flux-3-image-klein, un espejo sin gate del repositorio original black-forest-labs/flux-3-image-klein, con los pesos sin modificar. El checkpoint contenido es la version destilada, pensada para generacion y edicion autoalojada (16 pasos, sin guidance), mientras que la variante Base sin destilar (50 pasos, guidance 3.5) se distribuye aparte para ajuste fino, entrenamiento de LoRA e investigacion.

Es relevante ahora porque unifica texto-a-imagen, edicion de una referencia y generacion multi-referencia en un unico modelo, incorpora renderizado de texto dentro de las imagenes generadas y permite control de composicion mediante cajas delimitadoras expresadas en el prompt sobre una rejilla de 0 a 1000. Se publica con licencia FLUX Kommunity, que admite uso no comercial y una excepcion de salida comercial para usuarios que cumplan los terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para imagen con muestreo flow-map; codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imagen separados |
| Parametros totales | 5.548.681.984 (transformer de imagen; el codificador de texto es un componente aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16; FP8 (variante fp8r); NVFP4 (variante nvfp4) |
| Idiomas soportados | Ingles (en) |
| Licencia | FLUX Kommunity License (license: other; licencia no comercial con excepcion de salida comercial para Qualifying Users) |
| Formato de pesos | safetensors (transformer BF16, variantes FP8/NVFP4, text_encoder, ae.safetensors) |
| Pasos de muestreo | 16 (destilado); 50 en Klein Base |
| Guidance | Ninguno (destilado); 3.5 en Klein Base |
| Tamano del repositorio | 43,3 GB |

## Arquitectura y entrenamiento

El modelo se compone de un transformer de imagen (etiquetado como 5,6B) que opera con muestreo flow-map, un codificador de texto Qwen3-VL-4B-Instruct que procesa el prompt y un autoencoder de imagen que codifica y descodifica entre espacio latente y pixeles. La model card describe explicitamente que los 5,6B de parametros corresponden solo al transformer de imagen, y que el codificador de texto es un componente independiente. El checkpoint del repositorio es la variante destilada, configurada para 16 pasos de inferencia y sin guidance, frente a la variante Base sin destilar que requiere 50 pasos y guidance de 3.5.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO, por lo que esos datos no estan disponibles. Entre las innovaciones funcionales destacables documentadas figura el control de composicion mediante cajas delimitadoras escritas en el prompt (rejilla de 0 a 1000) que guian emplazamiento y escala sin restringir los pixeles a una mascara dura, el renderizado de texto dentro de las imagenes generadas, y la necesidad de un prompt upsampler externo: la model card advierte de forma explicita que el modelo espera titulos de escena completos y que un prompt corto produce salidas genericas. La implementacion de referencia exige un loader que soporte muestreo flow-map y este formato de checkpoint.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image).
- Edicion de imagen con una unica imagen de referencia (image-to-image).
- Composicion y generacion con multiples imagenes de referencia, hasta 10.
- Control de composicion mediante cajas delimitadoras en el prompt sobre una rejilla de 0 a 1000, con recoloracion, movimiento, reemplazo o eliminacion de elementos.
- Renderizado de texto dentro de la imagen generada.
- Integracion con pipelines Diffusers mediante pipeline modular.
- Carga de checkpoint destilado (16 pasos, sin guidance) o uso de la variante Base (50 pasos, guidance 3.5) para ajuste fino y LoRA.
- Soporte de variantes cuantizadas FP8 y NVFP4.
- No se documenta soporte de tool calling, function calling, agentes ni capacidades de audio.

## Casos de uso

- Generacion de ilustraciones para productos digitales: el modelo parte de un titulo de escena completo y produce una imagen coherente, lo que encaja en flujos de creacion de portadas, banners o material promocional sin necesidad de edicion posterior.
- Edicion de imagenes por instruccion: partiendo de una imagen existente y un prompt que describe la escena modificada (por ejemplo, la misma escena bajo otra iluminacion), el modelo regenera la imagen manteniendo la composicion, util para retoque conceptual rapido.
- Composicion con multiples referencias: al aceptar hasta 10 imagenes de referencia, permite combinar elementos de varias fuentes en una sola escena, util en diseno de producto o moodboards.
- Control de maquetacion con cajas: para generar layouts con elementos situados en posiciones concretas (rejilla de 0 a 1000) y luego recolocarlos o sustituirlos mediante prompt, adecuado en diseno de interfaces o carteles.
- Inclusión de texto en la imagen: el renderizado de texto dentro de la imagen permite crear carteles, etiquetas o banners con leyendas legibles sin postprocesado.
- Autoalojamiento de generacion y edicion en produccion: al estar disponible en BF16, FP8 y NVFP4, se puede desplegar en infraestructura propia (el checkpoint destilado es el mismo que sirve la API de BFL) reduciendo pasos de inferencia a 16.
- Investigacion y ajuste fino: la variante Base sin destilar sirve para entrenamiento de LoRA, ajuste fino y experimentacion academica; la variante destilada se reserva para generacion y edicion.
- Ampliacion de prompts con LLM propio: el prompt upsampler puede sustituirse por cualquier LLM configurado con un system prompt que expanda la peticion a un titulo de escena completo, lo que permite integrarlo en pipelines existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni metricas de calidad de imagen (FID, CLIP score, etc.), ni comparativas numericas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros, no confirmadas por el autor): el transformer de 5,6B en BF16 ocupa aproximadamente 11 GB solo en pesos; el codificador de texto Qwen3-VL-4B-Instruct anade alrededor de 8 GB; hay que sumar el autoencoder de imagen. La variante FP8 reduce el transformer a unos 5,6 GB y la NVFP4 a unos 2,8 GB.
- El prompt upsampler oficial (flux-3-image-klein-pup) ocupa 18,8 GB adicionales si se carga por defecto, lo que eleva de forma notable el consumo total. La model card advierte de que el tamano de fichero de las variantes cuantizadas no es una medida del uso total de memoria de GPU.
- GPU recomendadas: no especificadas por el autor. Por tamano, un despliegue completo en BF16 con upsampler requiere GPU de centro de datos con 40-80 GB (A100, H100). En FP8 o NVFP4 el transformer puede caber en GPU de consumo con 24 GB (RTX 4090) si se gestionan por separado el codificador de texto y el upsampler.
- Cabe en GPU de consumo: previsiblemente si en cuantizacion FP8/NVFP4 para el transformer, pero no en el paquete BF16 completo con upsampler.
- Opciones de despliegue: implementacion de referencia de Black Forest Labs (black-forest-labs/flux-3-image-klein), que requiere soporte de muestreo flow-map; Diffusers mediante pipeline modular; variantes cuantizadas requieren un loader compatible con FP8/NVFP4.
- Latencia y throughput: no disponibles. Se conoce el numero de pasos (16 en el checkpoint destilado frente a 50 en Base) como indicador relativo de coste de inferencia, pero sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Pasos | Guidance | Licencia | Uso previsto |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado) | 5,6B | 16 | Ninguno | FLUX Kommunity | Generacion y edicion, autoalojamiento; checkpoint detras de la API de BFL |
| FLUX 3 Image Klein Base | 5,6B | 50 | 3.5 | FLUX Kommunity | Ajuste fino, entrenamiento de LoRA, investigacion |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de terceros (por ejemplo FLUX.1 u otros generadores de imagen) que permitan una comparativa cuantitativa fiable, por lo que no se incluyen.

## Limitaciones y advertencias

- Requiere obligatoriamente un prompt upsampler: sin el, los prompts cortos producen salidas genericas. El autor indica que no se debe usar el modelo sin expandir el prompt a un titulo de escena completo.
- Idioma: el modelo esta etiquetado unicamente para ingles (en); no se documenta soporte multilingue.
- Licencia FLUX Kommunity: permite uso no comercial y ofrece una excepcion de salida comercial solo para Qualifying Users, sujeta a los terminos de la licencia. Es un requisito legal relevante para produccion.
- Es un espejo (mirror) sin gate de un repositorio de Black Forest Labs; conviene verificar la integridad y los terminos en LICENSE.md y NOTICE.md del repositorio.
- Las cajas delimitadoras guian emplazamiento y escala, pero no restringen los pixeles a una mascara dura, por lo que no garantizan posicionamiento exacto.
- Este repositorio contiene el checkpoint destilado, no un Base; para ajuste fino y entrenamiento de LoRA hay que acudir a la variante Base.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede producir contenido no solicitado o inexacto; la implementacion de referencia carga por defecto un clasificador de seguridad (Falconsai/nsfw_image_detection).
- No se dispone de datos publicados sobre sesgos, limites de contexto del codificador de texto, ni metricas de calidad de imagen.
- Las estimaciones de VRAM de esta ficha no estan confirmadas por el autor y deben validarse en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/Jinstudio/flux-3-image-klein
- Repositorio original: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Variantes FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- API de Black Forest Labs: https://bfl.ai
- Clasificador de seguridad: https://huggingface.co/Falconsai/nsfw_image_detection
- Licencia (LICENSE.md): https://huggingface.co/Jinstudio/flux-3-image-klein/blob/main/LICENSE.md
