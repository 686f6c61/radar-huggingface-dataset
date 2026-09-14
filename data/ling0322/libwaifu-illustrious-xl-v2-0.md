# ling0322/libwaifu-illustrious-xl-v2.0

## Resumen

libwaifu-illustrious-xl-v2.0 es una conversion del modelo de generacion de imagenes Illustrious XL v2.0-STABLE al formato de paquete `.waifupkg` que consume la herramienta libwaifu. No es un modelo nuevo ni un ajuste fino: los pesos son exactamente los publicados por OnomaAIResearch, y el autor del repositorio, ling0322, unicamente cambia el contenedor para que la CLI `waifu` pueda cargarlos directamente mediante `waifu draw -m sdxl:illust`. El repositorio ocupa 7,1 GB y se publica troceado en cuatro ficheros `.waifupkg` de 1,88, 1,88, 1,87 y 0,99 GiB para permitir descargas en paralelo y reanudables.

Tecnicamente es un modelo de difusion latente de la familia SDXL, con un U-Net y dos codificadores de texto almacenados en float16, un VAE conservado en mayor precision porque desborda float16, y el tokenizador CLIP empaquetado junto a los pesos. Es un modelo de prediccion epsilon, que es el tipo de salida que lee el muestreador Euler de libwaifu, y esta entrenado sobre el checkpoint STABLE de la fase final del calendario de recocido coseno de la version 2.0, que el autor describe como mas estable en generacion.

Su relevancia es practica mas que de investigacion: elimina la friccion de convertir checkpoints SDXL a un formato propio de la herramienta y permite arrancar la generacion sin descargas manuales ni configuracion. El prompting no es conversacional sino por etiquetas de Danbooru (estructura `<1girl/1boy/...>, <personaje>, <serie>, <artistas>, <tags generales>`), con valores por defecto de 30 pasos, CFG 5 y 1024x1024. La licencia heredada es creativeml-openrail-m, no MIT, y arrastra restricciones de uso basadas en el contenido que acompanan a los pesos en cualquier derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente tipo SDXL: U-Net, doble codificador de texto (CLIP) y VAE |
| Parametros totales | No disponible (no se publica en la ficha del autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (limitada por el tokenizador CLIP del modelo base) |
| Tipos de cuantizacion | float16 para U-Net y ambos text encoders; VAE en mayor precision que float16 |
| Idiomas soportados | No disponible; el prompting se realiza con etiquetas Danbooru, en la practica en ingles |
| Licencia | creativeml-openrail-m (heredada del modelo base, no MIT) |
| Formato de pesos | `.waifupkg` en cuatro partes (origen: safetensors) |

## Arquitectura y entrenamiento

El modelo es un difusion latente de arquitectura SDXL. La ficha de la conversion detalla que el U-Net y los dos codificadores de texto se guardan como float16, mientras que el VAE se mantiene en una precision mas ancha porque desborda float16, y que el tokenizador CLIP viaja empaquetado con los pesos. Se trata de un modelo de prediccion epsilon, coherente con el muestreador Euler que usa libwaifu de forma predeterminada. El autoencoder incluye ambas mitades, de modo que el paquete puede partir de una imagen ademas de un prompt, lo que habilita flujos de imagen a imagen.

En cuanto al entrenamiento, el autor de la conversion no lo ejecuta: los pesos proceden de OnomaAIResearch/Illustrious-XL-v2.0 (sha256 `c2a1a3eaa13d4c107dc7e00c3fe830cab427aa026362740ea094745b3422a331`), la publicacion oficial de Illustrious y no un ajuste fino de otro modelo. La version 2.0 se entreno con un calendario de recocido coseno, y STABLE corresponde al checkpoint de la ultima fase de ese recocido, descrito como sutilmente distinto de los pesos v2.0 anteriores y mas estable. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes texto a imagen a partir de prompts con etiquetas Danbooru, con soporte para etiquetas de personaje, serie, artista y etiquetas generales.
- Generacion de imagen a imagen y variaciones, al incluirse las dos mitades del autoencoder.
- Control fino del resultado mediante CFG y numero de pasos; los valores por defecto de libwaifu son 30 pasos, CFG 5 y 1024x1024.
- Produccion de ilustraciones de estilo anime, ambito para el que fue entrenado el modelo base.
- Carga directa mediante la CLI de libwaifu sin conversion manual (`waifu draw -m sdxl:illust`), con version fijada disponible como `sdxl:illust:v2.0`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues en el prompting.

## Casos de uso

- Ilustracion de personajes de estilo anime: el modelo esta entrenado sobre etiquetas Danbooru, de modo que un prompt como `<1girl>, <personaje>, <serie>, <artista>, <etiquetas de calidad>` produce ilustraciones coherentes con la estetica del dataset de origen.
- Prototipado de assets para videojuegos y novelas visuales: permite generar variaciones de un personaje mediante cambios en las etiquetas de personaje y estilo, sin necesidad de modelado manual previo.
- Flujos de imagen a imagen: al incluir las dos mitades del autoencoder, se puede partir de un boceto o una imagen de referencia y refinarla con un prompt de etiquetas, util para iterar sobre composiciones existentes.
- Generacion por lotes en pipelines automatizados: la CLI acepta el modelo como argumento y el paquete se descarga por partes reanudables, lo que facilita integrarlo en scripts de generacion masiva.
- Experimentacion con LoRA y ajustes finos: al ser un checkpoint SDXL en float16 con pesos completos, sirve como base para entrenar adaptadores de estilo o personaje con las herramientas habituales del ecosistema.
- Despliegue local en estaciones de trabajo de un solo usuario: el paquete esta pensado para libwaifu, que resuelve la descarga y la carga sin configuracion adicional, adecuado para entornos de escritorio.
- Reproduccion determinista de resultados: el troceado respeta los tensores completos y el autor afirma que la imagen producida por las cuatro partes es identica byte a byte a la de un paquete unico, lo que permite verificar integridad por partes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye metricas tipo FID, CLIP score ni comparativas cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 7 a 9 GB en float16 a 1024x1024, coherente con el tamano del repositorio (7,1 GB). El VAE, al no estar en float16, anade consumo adicional respecto a un checkpoint SDXL estandar. Es una estimacion basada en el tamano de los pesos, no un dato publicado.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; en el extremo profesional, A100 o H100 para generacion por lotes con gran concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con 12 GB o mas de VRAM. En tarjetas de 8 GB puede requerir atencion eficiente en memoria o resoluciones inferiores.
- Opciones de despliegue: libwaifu mediante `waifu draw -m sdxl:illust` es la via directa. Al proceder de un checkpoint safetensors, tambien puede reexportarse a formatos compatibles con el ecosistema SDXL (por ejemplo ComfyUI o Automatic1111) si se realiza la conversion inversa.
- Latencia y throughput estimados: no disponible; no se publican mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ling0322/libwaifu-illustrious-xl-v2.0 | No disponible (SDXL) | No disponible (tokenizador CLIP) | creativeml-openrail-m | HuggingFace, formato `.waifupkg` | Conversion del checkpoint STABLE de Illustrious XL v2.0 para libwaifu |
| OnomaAIResearch/Illustrious-XL-v2.0 | No disponible (SDXL) | No disponible (tokenizador CLIP) | No disponible en la informacion proporcionada | HuggingFace, formato safetensors | Modelo original; misma imagen generada, sin el empaquetado de libwaifu |
| WAI | No disponible | No disponible | No disponible | Publicado junto a este para libwaifu | Segun la ficha, WAI esta entrenado a partir de Illustrious |
| NoobAI | No disponible | No disponible | No disponible | Publicado junto a este para libwaifu | Segun la ficha, NoobAI esta entrenado a partir de Illustrious |

Los datos de parametros, contexto y rendimiento de las alternativas no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido a generacion de imagenes: no genera texto ni razona, por lo que no es utilizable como modelo de lenguaje.
- Prompting por etiquetas Danbooru y no por frases en lenguaje natural; el autor indica expresamente que el modelo base se maneja con etiquetas.
- No se publica un prompt recomendado ni ajustes de muestreador en la ficha, porque la model card de origen tampoco los incluye; la interfaz abre con el campo vacio.
- Riesgo de sesgos y de contenido inapropiado: al entrenarse sobre un dataset de ilustracion anime, puede reproducir sesgos de representacion y, potencialmente, contenido no apto si se le solicita.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede producir anatomia incorrecta, incoherencias entre elementos o artefactos, especialmente con prompts ambiguos o pasos insuficientes.
- Restricciones de licencia: creativeml-openrail-m permite uso comercial pero impone restricciones de uso que acompanan a los pesos en cualquier derivado; no es MIT como libwaifu.
- Dependencia del VAE en mayor precision: incrementa ligeramente los requisitos de memoria frente a un SDXL estandar en float16.
- Particularidades del formato: las cuatro partes deben permanecer en el mismo directorio; la primera nombra a las demas por nombre de fichero y no sigue rutas alternativas. Borrar o mover una parte impide la carga.
- Repositorio sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y escasa documentacion de problemas en produccion.
- Advertencia de fecha: los metadatos indican creacion en septiembre de 2026, posterior a la fecha de referencia habitual; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ling0322/libwaifu-illustrious-xl-v2.0
- Repositorio de libwaifu: https://github.com/ling0322/libwaifu
- Modelo base (OnomaAIResearch/Illustrious-XL-v2.0): https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Los resultados de la busqueda web proporcionados no contienen enlaces relevantes al modelo; tratan sobre una serie de television ajena a este repositorio.
