# AnesNT2026/Genisi-Art-3

## Resumen

Genisi Art 3 es un modelo de generacion y edicion de imagenes de codigo abierto desarrollado por AnesNT (AnesNT AI Research), un laboratorio con sede en la provincia de Batna (Argelia) y liderado por Anes Kameche. El modelo combina un Diffusion Transformer (DiT) de 5,6 mil millones de parametros con un codificador vision-lenguaje de 4 mil millones de parametros, y aborda en un unico modelo tres tareas que habitualmente requieren arquitecturas separadas: sintesis texto-a-imagen, edicion por instruccion y composicion multi-referencia con hasta 10 imagenes de referencia.

Su rasgo diferencial es el control espacial explicito mediante cajas delimitadoras en una rejilla de coordenadas de 0 a 1000, lo que permite colocar, recolorear, mover, reemplazar o eliminar elementos de la escena indicandolos directamente en la leyenda. Ademas, incorpora un muestreador Flow-Map destilado y sin guia (guidance-free) que reduce la generacion a 16 pasos a resolucion nativa de 1024x1024.

El modelo es relevante por su enfoque en tipografia dentro de la imagen y microtexturas, y por su soporte de prompts concisos en arabe, darja argelina, ingles y frances, alineados mediante destilacion de escenas densas a partir de ocho capas jerarquicas del codificador de texto. Se publica bajo la licencia propietaria genisi-sovereign-v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de doble flujo y flujo unico con Flow-Map, mas codificador vision-lenguaje multimodal |
| Parametros totales | 5.548.681.984 (5,6B en el DiT; adicionalmente 4B en el codificador de texto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | max_tokens: 8192 en el codificador de texto |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 y float32) |
| Idiomas soportados | arabe (ar), ingles (en), frances (fr), chino (zh); la model card menciona ademas darja argelina |
| Licencia | genisi-sovereign-v1 (license: other) |
| Formato de pesos | safetensors (model.safetensors, text_encoder/, ae.safetensors) |

## Arquitectura y entrenamiento

El nucleo es un Diffusion Transformer con hidden de 3072, 24 cabezas de atencion, 5 bloques de doble flujo y 28 bloques de flujo unico, con RoPE 4D de dimensiones [32, 32, 32, 32], theta de 10000 y escala de RoPE de imagen de 0,5. Los canales de entrada son 128 para imagen, 128 para imagen condicionada (hasta 10 referencias) y 20480 para texto. El codificador de texto es un modelo vision-lenguaje de 4B que extrae y concatena ocho capas jerarquicas [4, 8, 12, 16, 20, 24, 28, 32], produciendo 8 x 2560 = 20480 canales, con pad_multiple de 80 y un maximo de 8192 tokens.

El autoencoder latente opera en float32 y esta calibrado para alto rango dinamico, orientado a tipografia nitida y microtexturas a 1024x1024. El muestreador Flow-Map funciona con 16 pasos, sin guidance (guidance: null) y con alpha de 6,93, en lo que el autor describe como flow-map destilado sin guia. Se incluye un upsampler de escena y layout (GenisiArt3SceneUpsampler, en upsampler_genisi_art_3.py con system_prompts.json) que no requiere VRAM adicional. El entrenamiento combina destilacion de escenas de prompt corto a denso a traves de las ocho capas del codificador y el conector DiT de 20480 a 3072. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion texto-a-imagen a 1024x1024 a partir de un prompt.
- Edicion de imagen por instruccion en lenguaje natural.
- Composicion multi-referencia con hasta 10 imagenes (<ref_image_1> a <ref_image_10>).
- Control de layout espacial mediante cajas delimitadoras en rejilla 0..1000 con formato [top, left, bottom, right] etiquetadas con <id> en la leyenda.
- Colocacion, recoloreado, movimiento, reemplazo y eliminacion de elementos de la escena.
- Tipografia dentro de la imagen y microtexturas en cajas pequenas.
- Alineacion de prompts concisos en arabe, darja argelina, ingles y frances con representaciones de escena densas.
- Upsampling de escena y layout integrado sin consumo adicional de VRAM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o modo thinking: no disponible.

## Casos de uso

- Generacion de material grafico para campanas publicitarias: el modelo sintetiza escenas a 1024x1024 con texto legible integrado, lo que permite producir carteles con eslóganes sin un paso posterior de composicion tipografica.
- Edicion de producto por instruccion: partiendo de una fotografia de referencia, se puede recolorear, mover o sustituir un elemento (por ejemplo, una prenda) describiendo el cambio en lenguaje natural, sin mascaras manuales.
- Composicion multi-referencia para moda y merchandising: con hasta 10 imagenes de referencia se pueden combinar prendas, fondos y accesorios de distintas fuentes en una sola escena coherente.
- Maquetacion con control espacial: las cajas 0..1000 permiten posicionar con precision logotipos, titulares y elementos graficos en plantillas, util para generar variantes de un mismo layout.
- Localizacion para mercados arabofonos: el soporte de arabe y darja argelina facilita generar creatividades adaptadas a Argelia y el Magreb sin reescribir los prompts en ingles.
- Prototipado rapido de interfaces y escenarios: el upsampler de escena integrado, sin coste de VRAM, permite iterar de un prompt corto a una escena densa para bocetos conceptuales.
- Generacion de ilustracion editorial con microtexto: la calibracion del autoencoder en float32 para tipografia pequena resulta adecuada para portadas, infografias y material didactico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el DiT de 5,6B en bfloat16 ocupa aproximadamente 11 GB de pesos y el codificador de 4B en bfloat16 otros 8 GB, por lo que en bfloat16 se necesita en torno a 19-20 GB solo para pesos, mas el autoencoder en float32 y las activaciones.
- El repositorio completo ocupa 20,3 GB.
- GPU recomendadas: no especificadas por el autor; por el volumen de pesos en bfloat16 encaja en A100 (40/80 GB) y H100, y de forma mas ajustada en RTX 4090 (24 GB) si se gestionan bien las activaciones.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 de 24 GB en bfloat16; en GPUs de 16 GB o menos requeriria cuantizacion, para la que no se documentan formatos.
- Opciones de despliegue: el autor proporciona un pipeline propio (GenisiArt3Pipeline, pipeline_genisi_art_3.py) con descarga via huggingface_hub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el muestreador Flow-Map emplea 16 pasos sin guidance, lo que reduce el coste frente a muestreadores con clasificador libre de guia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Control espacial | Multi-referencia | Licencia |
|---|---|---|---|---|---|
| Genisi Art 3 | 5,6B DiT + 4B codificador | 8192 tokens de texto | Cajas 0..1000 | Hasta 10 imagenes | genisi-sovereign-v1 (propietaria) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones verificadas de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado con datos no especificados, pueden aparecer sesgos culturales y de representacion.
- Riesgo de alucinacion visual: como modelo generativo, puede producir texto ilegible o elementos incoherentes pese a la calibracion tipografica.
- Cobertura idiomatica limitada a arabe, ingles, frances y chino; el rendimiento en otros idiomas no esta documentado.
- La licencia genisi-sovereign-v1 es propietaria y de tipo "other": es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que no se detallan en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face y fue publicado recientemente, por lo que carece de validacion independiente de la comunidad.
- No se documentan formatos de cuantizacion, lo que dificulta el despliegue en hardware de gama media.
- El pipeline depende de codigo propio del autor (pipeline_genisi_art_3.py, upsampler_genisi_art_3.py); no se confirma compatibilidad con ecosistemas estandar como diffusers.
- No hay resultados de benchmarks publicados que permitan verificar las capacidades declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnesNT2026/Genisi-Art-3
- Portal oficial: https://genisi.web.app
- Estudio interactivo: https://genisi.web.app/chat
