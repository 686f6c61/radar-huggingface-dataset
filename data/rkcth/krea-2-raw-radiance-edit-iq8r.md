# rkcth/Krea-2-Raw-Radiance-Edit-IQ8R

## Resumen

Krea-2-Raw-Radiance-Edit-IQ8R es un ajuste fino (finetune) del modelo base krea/Krea-2-Raw, publicado por el usuario rkcth en Hugging Face. Se trata de un modelo de edicion de imagenes (image-to-image) derivado de la familia Krea-2, orientado a tareas de modificacion y transformacion de imagenes existentes mediante instrucciones o prompts. El sufijo "Radiance" hace referencia a la tecnica de entrenamiento aplicada, y "IQ8R" indica el formato de cuantizacion empleado para los pesos.

El modelo se distribuye bajo la licencia krea-2-community y cuenta con acceso restringido (gated), lo que obliga a aceptar las condiciones de uso en Hugging Face antes de poder descargarlo. El repositorio ocupa 19,1 GB, un tamano coherente con un modelo de difusion de gran formato cuantizado a 8 bits. No se dispone de informacion publica sobre el numero de parametros, la arquitectura interna ni los datos de entrenamiento especificos de este ajuste.

La relevancia de esta publicacion radica en su caracter de derivado comunitario de un modelo base reciente (Krea-2-Raw), lo que permite a desarrolladores experimentar con edicion de imagenes sobre una base ya entrenada, aplicando una capa de refinamiento adicional. No obstante, la ausencia de documentacion tecnica detallada y de resultados de benchmarks limita su evaluacion rigurosa por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion derivado de krea/Krea-2-Raw) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | IQ8R (cuantizacion de 8 bits segun la nomenclatura del nombre del modelo) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | no disponible (repo de 19,1 GB; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica detallada sobre la arquitectura de este modelo en la informacion disponible. Por el pipeline declarado (image-to-image) y el modelo base (krea/Krea-2-Raw), se trata de un modelo generativo de imagenes orientado a edicion, no de un modelo de lenguaje. El sufijo "Radiance" sugiere la aplicacion de una tecnica de entrenamiento o refinamiento especifica, pero no se dispone de documentacion que describa en que consiste.

Tampoco hay datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste por preferencias. El formato IQ8R indica que los pesos se han cuantizado a 8 bits, lo que reduce el tamano del repositorio (19,1 GB) y facilita su despliegue en hardware con VRAM limitada, a costa de una posible perdida de calidad frente a los pesos en precision completa.

## Capacidades

- Edicion de imagenes a partir de una imagen de entrada y una instruccion o prompt (pipeline image-to-image).
- Transformacion y modificacion de imagenes existentes, presumiblemente con control sobre el resultado mediante texto.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte multilingue (no es un modelo de texto).
- No se ha documentado modo de razonamiento (thinking mode), vision, audio ni otras capacidades especiales.
- Las capacidades concretas de edicion (inpainting, restilizado, cambio de atributos, etc.) no estan detalladas en la informacion disponible.

## Casos de uso

- Edicion de imagenes en flujos creativos: el modelo permite partir de una imagen existente y aplicar transformaciones guiadas por prompt, adecuado para diseno grafico y prototipado visual.
- Restilizado de fotografias: util para aplicar un estilo o acabado concreto a imagenes de producto o retrato, aprovechando la base Krea-2-Raw.
- Iteracion rapida en pipelines de diseno: al ser un modelo image-to-image, encaja en bucles de prueba y error donde se parte de un borrador y se refina sucesivamente.
- Generacion de variaciones de imagenes: a partir de una referencia, producir versiones modificadas para catalogos o contenido editorial, siempre que la licencia lo permita.
- Prototipado de conceptos visuales: para equipos que necesitan explorar alternativas de una imagen antes de encargar produccion final.
- Experimentacion e investigacion: como derivado comunitario cuantizado, sirve para estudiar el efecto del ajuste "Radiance" y de la cuantizacion IQ8R frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 19,1 GB, lo que da una estimacion orientativa de la VRAM necesaria para cargar los pesos cuantizados (en torno a 19-20 GB, mas el overhead de inferencia).
- GPU recomendadas: no disponible de forma especifica; por el tamano, se requeririan GPU con al menos 24 GB de VRAM (RTX 3090/4090) o superiores (A100, H100) para margen de trabajo.
- Cabe en GPU de consumo de gama alta con 24 GB o mas, aunque el margen sera ajustado; no cabe en GPU de 8-16 GB sin tecnicas adicionales de offloading.
- Opciones de despliegue: no disponible; al ser un modelo de difusion, cabria esperar soporte en frameworks como Diffusers, ComfyUI o Automatic1111, pero no se ha confirmado en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones detalladas de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar las condiciones en Hugging Face antes de su descarga.
- Licencia krea-2-community: es una licencia "other" que puede imponer restricciones al uso comercial; es imprescindible revisar sus terminos antes de cualquier despliegue en produccion.
- Ausencia de documentacion tecnica: no hay informacion sobre arquitectura, datos de entrenamiento ni evaluacion, lo que dificulta validar su calidad y comportamiento.
- Riesgo de sesgos y alucinaciones visuales: al ser un modelo de edicion de imagenes, puede introducir artefactos, deformaciones o resultados no fieles a la imagen de entrada.
- Cuantizacion IQ8R: la cuantizacion a 8 bits puede degradar la calidad frente a los pesos originales del modelo base.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento frente al modelo base ni frente a alternativas.
- Sin informacion sobre idiomas ni sobre el alcance real de las instrucciones que acepta.

## Enlaces

- Hugging Face: https://huggingface.co/rkcth/Krea-2-Raw-Radiance-Edit-IQ8R
- Modelo base: https://huggingface.co/krea/Krea-2-Raw (referenciado en las etiquetas del repositorio)
