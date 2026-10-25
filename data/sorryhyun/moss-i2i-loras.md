# sorryhyun/MOSS-I2I-LORAs

## Resumen

MOSS-I2I-LORAs es una coleccion de tres adaptadores LoRA de bajo rango (rank 32) para el modelo de difusion de imagenes OpenMOSS-Team/MOSS-Image-Base. No es un modelo autonomo: cada carpeta del repositorio contiene un adaptador especializado en una tarea concreta de imagen a imagen (colorizacion, eliminacion de texto y eliminacion de censura), junto con el flujo de trabajo JSON necesario para ejecutarlo en ComfyUI. El autor es sorryhyun, que tambien mantiene las herramientas de entrenamiento e inferencia asociadas (anima_lora, ComfyUI-MOSS-Toolkit y ComfyUI-Spectrum-KSampler).

Tecnicamente, los adaptadores se aplican sobre la arquitectura del modelo base, un transformer de difusion (DiT) que recibe la imagen de entrada como latente de referencia limpio, previamente codificado por el VAE. El repositorio ocupa 0,6 GB en total e incluye los tres safetensors mas los flujos de trabajo. La relevancia de esta publicacion es acotada: son adaptadores de nicho, con conjuntos de entrenamiento muy pequenos en dos de las tres tareas (49 y 48 pares), pensados para el ecosistema ComfyUI y para ilustracion y manga.

La informacion publica no incluye licencia, idiomas soportados ni resultados de evaluacion. La ficha refleja exclusivamente lo documentado en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango, rank 32) sobre un transformer de difusion (DiT) con VAE; modelo base OpenMOSS-Team/MOSS-Image-Base |
| Parametros totales | no disponible (el repositorio completo ocupa 0,6 GB, incluyendo tres adaptadores y flujos JSON) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en el pipeline i2i la referencia entra a resolucion completa y el area de salida se limita a resolution² = 1024² pixeles |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (las tareas son de imagen; las leyendas de entrenamiento documentadas estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA) + flujos de trabajo JSON para ComfyUI |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rank 32 que se inyecta en el DiT del modelo base. La imagen de entrada no se usa como ruido inicial, sino como latente de referencia limpio codificado por el VAE: los metadatos del LoRA activan `ref_isolate` y `ref_timestep 0`, de modo que la referencia se mantiene intacta durante la difusion y el adaptador aprende a transformarla. El nodo MOSS i2i Reference del toolkit interpreta esos metadatos y coloca la imagen a tamano completo (`ref_scale 1` en las tareas sanitize y decensor).

Los datos de entrenamiento son especificos por tarea. `colorize` se entreno con 3.334 pares color / blanco y negro (mitad ilustraciones, mitad paginas de manga) durante 8.000 pasos. `sanitize` uso 49 pares con texto / limpio durante 588 pasos. `decensor` uso 48 pares censurado / sin censura durante 576 pasos. En las tareas sanitize y decensor el adaptador esta ajustado a una unica leyenda de entrenamiento (`no sfx, no dialogue, no watermark` y `no bar censor, no mosaic censor, uncensored` respectivamente), por lo que sustituir el prompt degrada el resultado. En colorize el flujo si admite etiquetas de color libres y un helper de OCR que transcribe el lettering e incorpora cada linea a la leyenda de composicion. El entrenamiento se realizo con la herramienta anima_lora del mismo autor. No se documentan etapas de RLHF, DPO ni procesos de alineacion.

## Capacidades

- Colorizacion de paginas de manga en blanco y negro y de ilustraciones de line-art, preservando la composicion original.
- Redibujado del lettering durante la colorizacion: el helper de OCR transcribe los globos y los integra en la leyenda para que el LoRA reconstruya el texto.
- Eliminacion de rotulacion, efectos de sonido, texto de bocadillos y marcas de agua en ilustraciones (tarea sanitize).
- Eliminacion de censura por barra y por mosaico (tarea decensor).
- Preservacion de la relacion de aspecto de la entrada, con el area de salida limitada a resolution² (1024 px por defecto).
- Integracion con ComfyUI mediante el nodo `moss-image`, el pack Spectrum KSampler y el caption helper.
- No dispone de capacidades de texto, razonamiento, codigo, tool calling ni agentes: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Colorizacion de catalogo de manga para escaneo y archivo digital: el flujo carga la pagina, aplica `moss_colorize_3k_v3.safetensors` con `task colorize` y devuelve la pagina coloreada conservando el trazado y el lettering original. El entrenamiento sobre 3.334 pares lo hace el adaptador mas robusto de los tres.
- Produccion de versiones sin texto para localizacion: la tarea sanitize genera la ilustracion limpia sobre la que despues se rotula la traduccion, evitando el retoque manual del globo por globo.
- Limpieza de efectos de sonido en reediciones de comics clasicos, donde el rotulado original compite visualmente con el redibujado.
- Restauracion de arte propio con marcas de agua o anotaciones sobreimpresas: el adaptador devuelve la imagen sin esas capas cuando la entrada conserva informacion suficiente bajo ellas.
- Recuperacion de obras censuradas por barra o mosaico en material propio o de dominio publico, con las advertencias legales de la seccion de limitaciones.
- Prototipado de assets para juegos y publicaciones: colorizacion rapida de bocetos de line-art dentro de un grafo de ComfyUI por lotes, con 50 pasos y CFG 3.
- Pipeline de preprocesado artistico: usar sanitize o decensor como etapa previa a un modelo de upscaling o de retocado, de forma que el modelo posterior reciba una imagen sin rotulacion ni artefactos de censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, LPIPS ni comparaciones perceptuales) para ninguna de las tres tareas, y los resultados de busqueda web obtenidos no contenian informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- El coste de inferencia lo determina el modelo base MOSS-Image-Base, no los adaptadores: cada LoRA de rank 32 anade una sobrecarga despreciable y el repositorio completo pesa 0,6 GB.
- VRAM estimada para inferencia: no disponible. Depende del modelo base, del VAE y de la resolucion de trabajo (salida limitada a 1024² px).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado. Solo puede afirmarse que el adaptador en si no es el cuello de botella.
- Despliegue: ComfyUI obligatorio en la practica, con ComfyUI-MOSS-Toolkit 0.6.1 o superior, el nodo `moss-image` y el pack ComfyUI-Spectrum-KSampler para el sampler `er_sde` con uncond skip en el bloque 22. El caption helper solo se registra si `anime-tools` esta instalado en el entorno de ComfyUI.
- Ajustes de muestreo documentados: colorize con 50 pasos y CFG 3; sanitize y decensor con 30 pasos y CFG 4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA i2i alternativos para MOSS-Image-Base ni sobre modelos comparables en la busqueda realizada. Como referencia interna, la comparativa entre los tres adaptadores del propio repositorio es la siguiente:

| Adaptador | Tarea | Pares de entrenamiento | Pasos | Rank | Muestreo documentado |
|---|---|---|---|---|---|
| `moss_colorize_3k_v3.safetensors` | Colorizacion de manga y line-art | 3.334 | 8.000 | 32 | 50 pasos, CFG 3 |
| `moss_i2i_sanitize.safetensors` | Eliminacion de texto, SFX y marcas de agua | 49 | 588 | 32 | 30 pasos, CFG 4 |
| `moss_i2i_decensor.safetensors` | Eliminacion de barra y mosaico | 48 | 576 | 32 | 30 pasos, CFG 4 |

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial del adaptador ni del modelo base. Verificar antes de cualquier despliegue en produccion.
- Los conjuntos de sanitize (49 pares) y decensor (48 pares) son muy reducidos; es esperable sobreajuste a la distribucion de las imagenes de entrenamiento y poca generalizacion fuera de ilustracion de estilo anime.
- Sanitize y decensor estan atados a una unica leyenda de entrenamiento. Introducir un prompt propio rompe el comportamiento esperado; hay que dejar que el caption helper emita la cadena fija.
- El redibujado del lettering en colorize depende de OCR: texto pequeno, tipografias poco comunes o rotulacion muy estilizada pueden transcribirse mal y producir texto corrupto en la salida.
- Riesgo de alucinacion visual: el modelo puede reinterpretar trazos, rellenar zonas ambiguas con contenido inventado o alterar detalles finos del line-art, especialmente en areas con textura densa.
- La eliminacion de marcas de agua o de rotulacion puede vulnerar derechos de autor si se aplica a material de terceros. La tarea decensor puede generar contenido no apto para todos los publicos y plantea riesgos claros si se usa sobre imagenes de personas sin consentimiento; su uso legal es responsabilidad del operador.
- Dependencia fuerte del ecosistema ComfyUI y de las versiones concretas del toolkit (0.6.1 o superior) y del sampler; cambios de version pueden romper los flujos JSON incluidos.
- No hay informacion sobre sesgos demograficos ni de estilo, ni evaluacion de calidad subjetiva por parte de terceros. El repositorio registra 0 descargas y 15 likes, por lo que la validacion comunitaria es practicamente inexistente.
- Idiomas no declarados: el soporte multiligue del caption helper no esta documentado; las cadenas de entrenamiento estan en ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sorryhyun/MOSS-I2I-LORAs
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Herramienta de entrenamiento anima_lora: https://github.com/sorryhyun/anima_lora
- Extension ComfyUI-MOSS-Toolkit: https://github.com/sorryhyun/ComfyUI-MOSS-Toolkit
- Sampler ComfyUI-Spectrum-KSampler: https://github.com/sorryhyun/ComfyUI-Spectrum-KSampler
- Dependencia anime-tools: https://github.com/sorryhyun/anime_tools

Nota: la busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
