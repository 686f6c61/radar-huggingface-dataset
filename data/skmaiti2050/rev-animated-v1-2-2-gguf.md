# skmaiti2050/rev-animated-v1-2-2-gguf

## Resumen

`skmaiti2050/rev-animated-v1-2-2-gguf` es una conversion de formato, no un modelo nuevo: toma el checkpoint **ReV Animated v1.2.2** del autor s6yx (publicado el 15 de abril de 2023) y lo reempaqueta como un unico fichero **GGUF en precision f16** para poder ejecutarlo con [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp). Los pesos no se reentrenan, fusionan ni podan; solo cambia el almacenamiento. El repositorio lo mantiene el usuario skmaiti2050 y no tiene relacion documentada con el autor original.

El modelo subyacente es un modelo de **difusion latente de tipo Stable Diffusion 1.5** para generacion de imagenes a partir de texto, especializado en ilustracion y estetica anime/manga. Suma **1.066.235.384 parametros** (~1,07 mil millones) repartidos entre la UNet, el decodificador VAE y el codificador de texto CLIP ViT-L/14. La resolucion nativa de trabajo es 512x512 y la licencia es **CreativeML Open RAIL-M**.

Su interes practico es el tamano: el checkpoint original ocupa 5.505.437.736 bytes (5,25 GB) porque almacena unos 2,7 GB de pesos en float64, una precision que la inferencia de SD 1.5 nunca utiliza. La conversion a f16 deja el fichero en **2.213.581.888 bytes (2,1 GB)**, poco mas de un 40 % del original, con el VAE incluido y sin necesidad de ficheros auxiliares. Es util para desplegar el modelo en entornos con poca VRAM, en CPU o en toolchains de linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5): UNet + codificador de texto CLIP ViT-L/14 + VAE |
| Parametros totales | 1.066.235.384 (~1,07 mil millones), contando UNet, VAE y codificador de texto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto generativo de texto; el codificador CLIP de SD 1.5 procesa prompts de hasta 77 tokens |
| Tipos de cuantizacion | Solo f16 en este repositorio; el conversor de stable-diffusion.cpp admite otros tipos mediante `--type`, pero no se publican aqui |
| Idiomas soportados | No disponible; el autor no lo declara. El codificador CLIP de la base esta entrenado mayoritariamente con texto en ingles |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | GGUF (f16, algunos tensores pequenos en F32 y VAE en F16) |
| Resolucion nativa | 512x512 (valores usados en el ejemplo del autor: `-W 512 -H 512`) |
| Tamano del repositorio | 2,2 GB (fichero GGUF de 2.213.581.888 bytes) |
| SHA-256 del GGUF | `837725382596ba265c8cd10a7c0925a374269647c9117daae4eedcdf55f6137a` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5, un modelo de difusion latente: un codificador de texto CLIP ViT-L/14 convierte el prompt en embeddings, una UNet denoisa iterativamente un tensor latente de baja dimension y un VAE (en este fichero, en F16) decodifica ese latente a pixeles. No hay novedades tecnicas aportadas por esta publicacion: es una conversion de formato con `sd-cli -M convert -m rev-animated-v1-2-2.safetensors -o rev-animated-v1-2-2-f16.gguf --type f16`, hecha con el build de Windows `master-975-95b3090` de stable-diffusion.cpp. El SHA-256 del fichero de origen (`4199bcdd...b9ac`) se documenta en la model card para verificar la procedencia.

Sobre el entrenamiento del modelo original no hay informacion en la documentacion disponible: no se detallan volumen de datos, composicion del dataset, numero de pasos ni si hubo tecnicas de ajuste fino preferencial (RLHF/DPO no aplican a un modelo de difusion de imagenes, pero tampoco se documenta el proceso de fine-tuning estilistico). Lo unico verificable es que el checkpoint original almacenaba pesos en F64 y F32 mixtos (con el VAE en F16) y que la conversion los reduce a F16 sin perdida practica, ya que SD 1.5 opera en 16 o 32 bits en inferencia.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resolucion nativa de 512x512.
- Estilo orientado a ilustracion, anime y manga, heredado del fine-tuning de ReV Animated sobre la base SD 1.5.
- Control del proceso de muestreo: numero de pasos (`--steps`) y escala de guiado libre de clasificador (`--cfg-scale`), segun el ejemplo de uso del autor (20 pasos, cfg 7).
- Fichero autocontenido: incluye el VAE, por lo que no requiere un `vae.pt` o `vae.safetensors` externo.
- Ejecucion en CPU o GPU mediante stable-diffusion.cpp, sin dependencias de PyTorch.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades de vision de entrada ni de audio; es un modelo puramente generativo de imagen a partir de texto.
- Capacidades multilingues: no documentadas. El comportamiento esperado depende del codificador CLIP de SD 1.5, mas fiable con prompts en ingles.
- Img2img, inpainting u outpainting: no se documentan en la model card, aunque stable-diffusion.cpp soporta algunos de estos modos a nivel de herramienta.

## Casos de uso

- **Prototipado de personajes para manga o novela grafica**: generar variaciones de diseno a 512x512 con 20 pasos y cfg 7 para iterar sobre bocetos antes de encargar el arte final, aprovechando la especializacion estilistica del modelo.
- **Arte conceptual para videojuegos independientes**: producir fondos, retratos de personajes y hojas de estilo en local, sin coste por imagen ni dependencia de API, en una estacion de trabajo con GPU de gama media.
- **Storyboards y previsualizacion de animacion**: crear fotogramas clave de referencia para comunicar direccion de arte a un equipo, modificando el prompt entre iteraciones con el mismo seed de trabajo en la CLI.
- **Generacion por lotes en pipelines automatizados**: integrar `sd-cli` en un script o contenedor que reciba listas de prompts y escriba PNG en disco, util para catalogos, mockups o material de marketing interno.
- **Despliegue en entornos sin GPU dedicada**: gracias a los 2,1 GB del fichero f16 y al backend de stable-diffusion.cpp, el modelo puede correr en servidores solo-CPU o en equipos con 4-6 GB de VRAM donde un checkpoint de 5,25 GB no entra comodamente.
- **Investigacion y docencia sobre modelos de difusion**: servir como referencia ligera de SD 1.5 en cursos o experimentos de cuantizacion, comparando calidad entre f16, f32 y cuantizaciones de 8 bits.
- **Generacion de material visual bajo demanda con licencia Open RAIL-M**: crear ilustraciones para proyectos que puedan asumir las restricciones de uso del Attachment A, redistribuyendo siempre la licencia junto al modelo o sus derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones de estetica ni comparaciones cuantitativas con otros checkpoints. Al ser una conversion de formato sin reentrenamiento, el rendimiento cualitativo deberia ser identico al de `s6yx/ReV_Animated` v1.2.2, pero no se aporta ninguna medicion que lo verifique.

## Requisitos de hardware

- **VRAM estimada**: alrededor de 3-4 GB para generar a 512x512 en f16. Es una estimacion a partir del tamano del fichero (2,1 GB) y del grafo de SD 1.5; el autor no publica mediciones.
- **GPU recomendadas**: cualquier GPU consumer con 6 GB o mas, como GTX 1660/RTX 2060, RTX 3060, RTX 4060 o superiores. A100/H100 no son necesarias para este modelo.
- **CPU**: viable con stable-diffusion.cpp en modo solo-CPU, a costa de latencias mucho mayores por imagen (no se publican cifras).
- **Despliegue**: `sd-cli` de stable-diffusion.cpp (probado por el autor con el build `master-975-95b3090` en Windows) y los bindings de esa libreria. El fichero GGUF no es cargable directamente por diffusers, Automatic1111 o ComfyUI sin herramientas adicionales; para esos entornos conviene usar el safetensors original.
- **Comando de referencia**: `sd-cli -m rev-animated-v1-2-2-f16.gguf -p "a cozy fantasy village at sunset" --steps 20 --cfg-scale 7 -W 512 -H 512 -o out.png`.
- **Latencia y throughput**: no disponible. No hay tiempos por imagen ni imagenes por segundo publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Formato | Tamano | Licencia |
|---|---|---|---|---|---|
| `skmaiti2050/rev-animated-v1-2-2-gguf` | ~1,07 B | 512x512 | GGUF f16 | 2,1 GB | CreativeML Open RAIL-M |
| `s6yx/ReV_Animated` v1.2.2 (original) | ~1,07 B | 512x512 | safetensors, F64/F32 mixto y VAE F16 | 5,25 GB | CreativeML Open RAIL-M |
| `danbrown/RevAnimated-v1-2-2` (copia del original) | ~1,07 B | 512x512 | safetensors | no disponible en la informacion | CreativeML Open RAIL-M |
| Stable Diffusion 1.5 base | ~1,07 B (UNet, CLIP y VAE) | 512x512 | safetensors | no disponible en la informacion | CreativeML Open RAIL-M |

La diferencia entre las tres primeras filas es exclusivamente de empaquetado y de comunidad: el original y su copia se cargan en el ecosistema PyTorch, mientras que esta version solo es utilizable desde stable-diffusion.cpp. Frente a la base SD 1.5, ReV Animated aporta un ajuste estilistico orientado a ilustracion; no se dispone de datos de rendimiento que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- **Sin validacion comunitaria**: el repositorio tiene 0 descargas y 0 likes en el momento de redactar la ficha. No hay evidencia de terceros de que la conversion funcione correctamente en todos los builds de stable-diffusion.cpp.
- **Conversion de terceros**: el autor del modelo es s6yx; este repositorio solo cambia el formato. Cualquier problema de calidad debe atribuirse al checkpoint original, no a la conversion, pero tampoco hay verificacion independiente del SHA-256 por parte de la comunidad.
- **Compatibilidad limitada**: el GGUF no se puede abrir con diffusers, Automatic1111 o ComfyUI de forma directa. Si el pipeline ya esta montado sobre esas herramientas, esta version no sirve.
- **Resolucion nativa 512x512**: por encima de esa resolucion, SD 1.5 tiende a duplicar miembros y a degradar la composicion; no se documenta ningun metodo de generacion a mayor resolucion.
- **Texto dentro de la imagen**: los modelos de la familia SD 1.5 no renderizan texto legible de forma fiable.
- **Idioma**: no hay idiomas declarados. Los prompts en ingles son la opcion segura; el rendimiento con prompts en castellano no esta documentado.
- **Sesgos**: el modelo hereda los sesgos de los datos de entrenamiento de SD 1.5 y del fine-tuning de ReV Animated, con posible infrarrepresentacion de ciertos grupos y estilos. No se aporta ninguna evaluacion de sesgo.
- **Alucinacion visual**: como todo modelo generativo de imagen, produce resultados plausibles pero no verificados; no debe usarse como fuente documental o historica.
- **Licencia CreativeML Open RAIL-M**: permite uso comercial, pero incluye restricciones de uso en el Attachment A (contenido ilegal, dano, desinformacion, etc.). Si se redistribuye el modelo o un derivado, hay que incluir una copia de la licencia y las mismas restricciones. No es una licencia de codigo abierto aprobada por la OSI.
- **Falta de trazabilidad del entrenamiento**: no se documentan datos, pasos ni proceso de ajuste del modelo original, lo que dificulta evaluar riesgos de contaminacion o de derechos de autor del dataset.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skmaiti2050/rev-animated-v1-2-2-gguf
- Modelo original de s6yx: https://huggingface.co/s6yx/ReV_Animated
- Copia del checkpoint original: https://huggingface.co/danbrown/RevAnimated-v1-2-2
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Texto de la licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
