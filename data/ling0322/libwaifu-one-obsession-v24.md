# ling0322/libwaifu-one-obsession-v24

## Resumen

`ling0322/libwaifu-one-obsession-v24` es un modelo de generacion de imagenes a partir de texto (text-to-image) de tipo diffusion latente, publicado unicamente como conversion de formato. Los pesos originales pertenecen a **maxfeifei8**, autor del checkpoint **One Obsession v24** en Civitai, y el repositorio de HuggingFace se limita a reempaquetarlos en el formato que lee [libwaifu](https://github.com/ling0322/libwaifu), la herramienta de inferencia del propio autor de la conversion.

El modelo es un ajuste fino (fine-tune) de **OnomaAIResearch/Illustrious-XL-v2.0**, que a su vez deriva de Stable Diffusion XL. Esto implica una arquitectura de diffusion latente con U-Net, doble codificador de texto CLIP y autoencoder VAE, prediccion de tipo epsilon, y un flujo de trabajo basado en **etiquetas estilo Danbooru** en lugar de frases en lenguaje natural. El repositorio ocupa 7,1 GB y las descargas registradas en HuggingFace son 0, con 2 likes; la relevancia practica esta en que permite usar el checkpoint sin descargas manuales ni conversion previa dentro del ecosistema libwaifu.

El modelo esta marcado como `not-for-all-audiences` y su licencia es personalizada (`one-obsession-civitai`), con requisitos de atribucion, herencia de terminos en derivados y prohibicion del uso comercial general. No es un modelo de lenguaje: no soporta conversacion, tool calling ni agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion latente (familia Stable Diffusion XL): U-Net + dos codificadores de texto CLIP + VAE |
| Parametros totales | no disponible en el repositorio; los cuatro ficheros de pesos suman 6,62 GiB en float16, equivalente a unos 3.500 millones de parametros almacenados (estimacion derivada del tamano) |
| Parametros activos | no aplica (no es un modelo MoE; la inferencia ejecuta la red completa) |
| Longitud de contexto | no aplica ventana conversacional; los codificadores CLIP limitan la indicacion a 77 tokens por codificador |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; solo float16 para U-Net y ambos codificadores de texto. El VAE se guarda con mas precision porque desborda float16 |
| Idiomas soportados | no declarados; el prompt se construye con etiquetas Danbooru (habitualmente en ingles y romanizacion de japones) |
| Licencia | `other` / `one-obsession-civitai` (terminos del autor de los pesos, no MIT) |
| Formato de pesos | safetensors fragmentado en 4 shards + manifiesto YAML + `tokenizer.json` de Stability |
| Pipeline | text-to-image (y tambien image-to-image: el repositorio incluye las dos mitades del autoencoder) |
| Tipo de prediccion | epsilon (la que lee el muestreador Euler de libwaifu) |
| Resoluciones recomendadas | 1024x1536, 832x1216, 896x1152, 768x1344, 640x1536 (todas verticales) |
| Parametros de muestreo de los ejemplos | Euler a, CFG 4,5, 20-24 pasos |
| Modelo base | OnomaAIResearch/Illustrious-XL-v2.0 |
| Tamano del repositorio | 7,1 GB |
| Descargas / likes en HuggingFace | 0 / 2 |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL: un U-Net que opera en el espacio latente de un VAE, condicionado por dos codificadores de texto CLIP, con prediccion epsilon. Al ser un fine-tune de Illustrious-XL-v2.0, hereda las caracteristicas de esa familia: entrenamiento orientado a ilustracion y a etiquetas Danbooru, y resoluciones nativas en torno a 1024 px por el lado corto. El repositorio no aporta informacion sobre el dataset, el numero de pasos, el metodo de ajuste (LoRA fusionado, DreamBooth, fine-tune completo) ni sobre si hubo etapas de RLHF o DPO, tecnicas que en cualquier caso no aplican a un modelo de difusion de este tipo.

La unica intervencion tecnica documentada es la conversion de contenedor: el script `tools/sdxl_exporter.py` toma `oneObsession_v24.safetensors` y lo divide en cuatro ficheros safetensors de 1,88 / 1,88 / 1,87 / 0,99 GiB, con el corte hecho entre tensores y nunca dentro de uno, de modo que cada shard es un safetensors valido por si mismo. El resultado es byte a byte identico al del modelo sin dividir. El repositorio incluye la verificacion de procedencia mediante el sha256 `2fae33d7f0d23920d145897827e6015ac098a2b90cb682d07846ae762213100b`, publicado por el autor de los pesos. No hay ninguna innovacion de inferencia propia (ni decodificacion especulativa, ni atencion lineal): el modelo se ejecuta con el muestreador Euler de libwaifu.

## Capacidades

- Generacion de imagenes a partir de texto con etiquetas Danbooru, no con frases descriptivas.
- Ilustracion de personajes y escenas, con resoluciones verticales de entre 640x1536 y 1024x1536.
- Image-to-image y refinado a partir de una imagen de entrada: el repositorio incluye ambas mitades del autoencoder.
- Uso sin LoRA: el autor indica que no hacen falta LoRA ni cadenas de etiquetas complejas para obtener resultados correctos.
- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences`.
- Integracion directa en libwaifu (`waifu draw -m sdxl:obsession`, alias versionado `sdxl:obsession:v24`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No soporta conversacion multilingue ni generacion de texto: es exclusivamente un modelo de imagen.

## Casos de uso

- **Ilustracion de personajes originales**: se describe al personaje con etiquetas Danbooru (color de pelo, ropa, expresion) a 832x1216 y se itera sobre la semilla hasta fijar el diseno; el modelo esta ajustado especificamente para este tipo de prompt.
- **Generacion por lotes en local con libwaifu**: `waifu draw -m sdxl:obsession` descarga y ejecuta el modelo sin gestion manual del checkpoint, util para producir conjuntos de imagenes de forma reproducible desde linea de comandos.
- **Refinado de bocetos con image-to-image**: al incluir el VAE completo, se puede partir de un boceto o de una imagen previa y repintarla con CFG 4,5 y 20-24 pasos manteniendo la composicion.
- **Prototipado rapido en produccion grafica**: al ser un ajuste de Illustrious prompt-friendly, sirve como primer paso para validar direccion de arte antes de encargar ilustracion final, con resoluciones verticales ya pensadas para portada o poster.
- **Investigacion sobre ajuste fino de SDXL**: el repositorio es un ejemplo reproducible de exportacion en shards con manifiesto YAML y tokenizer separado, util para estudiar pipelines de conversion de checkpoints.
- **Creacion asistida para usuarios noveles**: el autor enfatiza que funciona sin LoRA y sin etiquetas complicadas, lo que lo hace adecuado para talleres introductorios de generacion de imagen.
- **Contenido para adultos bajo control de acceso**: el etiquetado `not-for-all-audiences` permite desplegarlo en plataformas que segmentan este tipo de material, siempre que la licencia lo autorice (ver limitaciones).
- **Despliegue en Civitai**: la licencia permite explicitamente ejecutar el modelo en esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye FID, CLIP score, comparativas humanas ni evaluaciones cuantitativas de ningun tipo; la unica evidencia de calidad son las diez imagenes de ejemplo del autor y los parametros de generacion extraidos de sus metadatos (Euler a, CFG 4,5, 20-24 pasos, tamano vertical).

## Requisitos de hardware

- Los pesos en float16 ocupan 6,62 GiB; el repositorio completo ocupa 7,1 GB en disco.
- VRAM estimada (valores de referencia para la clase SDXL, no publicados por el autor): en torno a 10-12 GB para generar a 832x1216 o 1024x1536 sin optimizaciones; aproximadamente 8 GB con atencion fragmentada o transferencia secuencial de modulos a CPU; por debajo de 8 GB es necesario cuantizar o reducir resolucion.
- GPU recomendadas (estimacion para la clase SDXL): NVIDIA A100, H100 o L40S para lotes grandes y baja latencia; RTX 4090, RTX 4080 o RTX 3090 para uso individual comodo; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 caben con atencion fragmentada.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM aplicando optimizaciones de memoria.
- Opciones de despliegue: libwaifu es el unico runtime que lee el manifiesto YAML directamente. Para diffusers, ComfyUI, Automatic1111, Forge o InvokeAI hay que usar el checkpoint original `oneObsession_v24.safetensors` o reconvertir el formato, ya que el manifiesto nombra sus ficheros vecinos por nombre de archivo y no sigue rutas externas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de imagenes por segundo ni de tiempo por imagen para ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| One Obsession v24 (este repositorio) | no declarados; ~3.500 millones estimados por el tamano de los pesos | 77 tokens por codificador CLIP | no disponible | `one-obsession-civitai`: atribucion, herencia de terminos, sin uso comercial general | HuggingFace (formato libwaifu) y Civitai (checkpoint original) |
| OnomaAIResearch/Illustrious-XL-v2.0 (modelo base) | no disponible (arquitectura SDXL) | 77 tokens por codificador CLIP | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Pony Diffusion V6 XL (familia equivalente de anime SDXL) | no disponible | 77 tokens por codificador CLIP | no disponible | licencia propia restrictiva; consultar el repositorio | HuggingFace y Civitai |
| NoobAI-XL (familia equivalente de anime SDXL) | no disponible | 77 tokens por codificador CLIP | no disponible | no disponible en la informacion proporcionada | HuggingFace y Civitai |

No se dispone de datos verificados de parametros, contexto ni benchmarks de las alternativas dentro de la informacion proporcionada; las celdas marcadas como no disponibles deben contrastarse en los repositorios oficiales antes de tomar una decision.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `one-obsession-civitai` no permite uso comercial general. Solo autoriza vender las imagenes generadas y ejecutar el modelo en Civitai. Cualquier otro uso comercial requiere permiso del autor.
- **Atribucion obligatoria**: hay que acreditar a maxfeifei8 como autor de los pesos.
- **Herencia de terminos**: las obras derivadas deben conservar estas mismas condiciones.
- **Contenido para adultos**: el modelo esta etiquetado como `not-for-all-audiences`; requiere control de acceso y filtrado en cualquier despliegue publico.
- **Prompt por etiquetas**: no funciona bien con frases en lenguaje natural; esta pensado para etiquetas Danbooru, lo que limita su uso por usuarios que no conozcan esa convencion.
- **Resoluciones verticales**: las cinco resoluciones recomendadas son verticales; generar en cuadrado o en horizontal puede degradar la composicion.
- **Reproducibilidad dependiente de parametros**: los ajustes que el autor describe (CFG 3-6, 25-35 pasos) no coinciden con los de sus propias imagenes de ejemplo (CFG 4,5 y 20-24 pasos con Euler a); conviene partir de estos ultimos.
- **Riesgo de sesgos**: no se documenta el dataset de ajuste fino, por lo que no es posible auditar sesgos de representacion ni de estilo. Es un riesgo habitual en fine-tunes de anime distribuidos sin model card detallada.
- **Artefactos tipicos de la clase**: como cualquier SDXL ajustado a ilustracion, puede producir errores en manos, textos dentro de la imagen y perspectivas complejas; el autor no documenta tasas de fallo.
- **Compatibilidad de runtime**: el formato con manifiesto YAML solo lo interpreta libwaifu. Usarlo en otros entornos exige el checkpoint original o una reconversion.
- **Procedencia verificable**: el sha256 publicado permite comprobar que los pesos son los del autor; conviene validarlo si se redistribuyen.
- **Sin garantias de mantenimiento**: el repositorio tiene 0 descargas y 2 likes, sin senales de soporte activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ling0322/libwaifu-one-obsession-v24
- Modelo original en Civitai: https://civitai.com/models/1318945
- Version concreta de los pesos (v24, modelVersionId 3218603): https://civitai.com/models/1318945?modelVersionId=3218603
- Perfil del autor de los pesos: https://civitai.com/user/maxfeifei8
- Repositorio de libwaifu: https://github.com/ling0322/libwaifu
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Script de conversion citado en la model card: `tools/sdxl_exporter.py` dentro del repositorio de libwaifu
- Paper, blog o demo adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
