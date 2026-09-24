# RunningHubAI/rh-qwen-image-2.1-viggle-turbo-4step-r64-comfyui-t8-lora

## Resumen

`rh-qwen-image-2.1-viggle-turbo-4step-r64-comfyui-t8-lora` es un adaptador LoRA de bajo rango (r=64) publicado por RunningHubAI a partir de un entrenamiento del autor T8star-Aix. El adaptador se aplica sobre Qwen-Image-2.1, un modelo de difusion de 7B orientado a generacion y edicion de imagen, lanzado el 20 de septiembre de 2026 segun las guias consultadas. Su funcion es habilitar inferencia acelerada en 4 pasos dentro de ComfyUI, reduciendo el coste computacional respecto a la configuracion por defecto del modelo base (25 pasos, cfg 1, sampler euler/simple).

El repositorio contiene un unico archivo safetensors de 324 MiB, lo que confirma que se trata de un adaptador y no de un modelo completo: los pesos base de Qwen-Image-2.1 deben obtenerse por separado. El nombre del modelo revela sus tres ejes de diseno: la familia base (Qwen-Image-2.1), la tecnica de destilacion para pocos pasos (viggle-turbo-4step) y el rango del adaptador (r64).

Su relevancia actual es practica: Qwen-Image-2.1 es, segun las fuentes consultadas, el primer modelo abierto de gran tamano capaz de generar imagenes RGBA con canal alfa real directamente desde texto, ademas de ofrecer salida nativa en 2K y tipografia profesional. Acelerar ese modelo a 4 pasos con un LoRA reduce drasticamente los requisitos de tiempo de inferencia, lo que lo hace viable en flujos de produccion con ComfyUI o mediante la API de RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, r=64) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible (archivo de pesos de 324 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; el prompt se procesa con el codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors |
| Nombre del archivo | Qwen-Image-2.1-viggle-turbo-4step-r64-comfyui-T8.safetensors |
| Tamano del repositorio | 0,3 GB |
| Pasos de inferencia | 4 |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 64, no un modelo autonomo. La arquitectura subyacente corresponde a Qwen-Image-2.1, un modelo de difusion de 7B que, segun las guias consultadas, unifica generacion y edicion de imagen, produce salida nativa en 2K y genera directamente imagenes RGBA con canal alfa real, lo que elimina la necesidad de un paso posterior de eliminacion de fondo. La model card no detalla la arquitectura interna del modelo base (tipo de backbone, variante de transformer de difusion, esquema de atencion), por lo que ese dato queda como no disponible.

La informacion de entrenamiento es minima: no se especifican el numero de imagenes, la composicion del dataset, el metodo de destilacion empleado para reducir la inferencia a 4 pasos, ni si se aplicaron tecnicas de ajuste por preferencias. La model card indica unicamente que el modelo esta "finetuned from: Other" y que fue entrenado en la plataforma RunningHub. La tecnica destacable, deducible del nombre y de la demo asociada, es la destilacion tipo turbo para pocos pasos: en lugar de los 25 pasos con cfg 1 del flujo oficial de ComfyUI, este LoRA permite generar con 4 pasos. La demo de Viggle asociada acepta hasta tres imagenes de referencia y permite generar una imagen nueva o modificar las referencias segun el prompt.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) sobre el modelo base Qwen-Image-2.1.
- Edicion de imagen y generacion guiada por referencias: la demo vinculada admite una a tres imagenes de referencia para crear o modificar contenido.
- Inferencia acelerada en 4 pasos, frente a los 25 pasos del flujo oficial del modelo base.
- Salida nativa en 2K y soporte de canal alfa RGBA heredado del modelo base (sin necesidad de recorte posterior).
- Tipografia profesional en la imagen generada, capacidad atribuida al modelo base en las guias consultadas.
- Integracion nativa con ComfyUI mediante carga de LoRA y con los flujos alojados en RunningHub.
- Uso mediante API: RunningHub ofrece endpoints documentados para ejecutar los flujos que incorporan este adaptador.
- Capacidades de tool calling, agentes, razonamiento multi-paso, audio o vision: no aplica (es un modelo de generacion de imagen, no un modelo de lenguaje).
- Soporte multilingue de prompts: no disponible (depende del codificador de texto del modelo base, no documentado en esta ficha).

## Casos de uso

- Generacion de imagenes en produccion con latencia reducida: al operar en 4 pasos en lugar de 25, el coste por imagen cae aproximadamente a una sexta parte respecto al flujo por defecto, lo que permite servir volumenes altos en pipelines de contenido.
- Prototipado rapido en ComfyUI: el adaptador se carga como LoRA sobre el grafo nativo de Qwen-Image-2.1, de modo que un disenador puede iterar sobre prompts y composiciones sin reentrenar ni cambiar de herramienta.
- Edicion de imagen guiada por referencias: con la demo de Viggle es posible subir hasta tres imagenes y pedir modificaciones concretas, un flujo util para variaciones de producto o de personaje manteniendo coherencia visual.
- Generacion de assets con transparencia: gracias al canal alfa RGBA del modelo base, el flujo produce PNG con transparencia directamente, lo que ahorra el paso de segmentacion en tareas de diseno grafico, stickers o iconografia.
- Rotulacion y carteleria: la capacidad de tipografia del modelo base permite generar carteles, banners o mockups con texto legible, un caso donde otros generadores de imagen suelen fallar.
- Automatizacion de contenido a escala mediante API: los flujos de RunningHub pueden invocarse por API, lo que permite integrar la generacion en backends de e-commerce, CMS o herramientas internas sin desplegar GPU propia.
- Previsualizacion en herramientas creativas: al ser un archivo de 324 MiB, puede empaquetarse junto a aplicaciones de escritorio o web que ya carguen el modelo base, anadiendo aceleracion sin multiplicar el peso distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas ni comparativas de fidelidad), y las fuentes de busqueda describen el modelo base y su flujo en ComfyUI sin aportar cifras objetivas. El unico dato de rendimiento documentado indirectamente es el numero de pasos de inferencia: 4, frente a los 25 del flujo oficial del modelo base.

## Requisitos de hardware

- VRAM para el adaptador: el LoRA ocupa 324 MiB en disco y anade una sobrecarga marginal a la memoria del modelo base.
- VRAM total para inferencia: no disponible. Depende enteramente de Qwen-Image-2.1, cuyas necesidades de VRAM no se cuantifican en las fuentes consultadas.
- GPU recomendadas: no disponible. Las guias consultadas mencionan requisitos de VRAM para la instalacion local en ComfyUI, pero no publican cifras concretas.
- Compatibilidad con GPU de consumo: no disponible. No se especifica si el modelo base cabe en tarjetas como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: ComfyUI (flujo nativo con carga de LoRA), RunningHub (entrenamiento, flujos y API en la nube) y Hugging Face Spaces mediante la demo de Viggle.
- Latencia y throughput: no disponibles. Se sabe que el adaptador reduce la inferencia a 4 pasos, pero no se publican tiempos por imagen ni imagenes por segundo.
- Almacenamiento: 0,3 GB para el repositorio del LoRA, mas el peso completo del modelo base, que debe descargarse aparte.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-image-2.1-viggle-turbo-4step-r64-comfyui-t8-lora | LoRA r64 sobre Qwen-Image-2.1, 4 pasos | no disponible (pesos de 324 MiB) | no aplica / hasta 2K en el modelo base | no disponible | Hugging Face, RunningHub |
| t8star/Qwen-Image-2.1-viggle-turbo-4step-r64-comfy | LoRA r64 equivalente, citado como origen en la model card | no disponible | no aplica / hasta 2K en el modelo base | no disponible | Hugging Face |
| Qwen-Image-2.1 sin LoRA | Modelo de difusion completo | 7B | no aplica / 2K nativo, salida RGBA | no disponible en las fuentes consultadas | ComfyUI, Hugging Face |
| Viggle/Qwen-Image-2.1-viggle-turbo | Space de demostracion, no un modelo | no aplica | no aplica / 4 pasos, 1-3 imagenes de referencia | no disponible | Hugging Face Spaces |

## Limitaciones y advertencias

- Licencia no especificada: la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream, pero no identifica cual es. Esto impide confirmar si el uso comercial esta permitido.
- Dependencia total del modelo base: el LoRA no es funcional por si solo; requiere descargar Qwen-Image-2.1 y su codificador de texto, cuyas condiciones de licencia pueden ser distintas.
- Ausencia de datos de entrenamiento: no se documentan dataset, numero de pasos de entrenamiento, metodo de destilacion ni proceso de validacion, lo que dificulta evaluar su robustez.
- Riesgo de artefactos y sobreajuste: al ser un adaptador de rango 64 entrenado para 4 pasos, puede degradar la fidelidad en prompts alejados de su distribucion de entrenamiento o introducir sesgos estilisticos concretos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a otras LoRA equivalentes.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentacion de terceros sobre su comportamiento en produccion.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgos demograficos, culturales o de representacion en las imagenes generadas.
- Limitaciones de idioma: no disponibles. El comportamiento con prompts en castellano no esta documentado.
- Coste oculto de infraestructura: aunque el adaptador sea ligero, la inferencia real exige GPU con memoria suficiente para el modelo base, cuyo requisito no se especifica.
- Enlaces de la model card con parametros de seguimiento: buena parte de los enlaces de la model card incluyen parametros UTM de campana, por lo que conviene tratarlos como enlaces promocionales ademas de tecnicos.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-viggle-turbo-4step-r64-comfyui-t8-lora
- Modelo de origen citado en la model card: https://huggingface.co/t8star/Qwen-Image-2.1-viggle-turbo-4step-r64-comfy
- Demo de Viggle (4 pasos, 1-3 imagenes de referencia): https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2102676193953800194
- Pagina del autor (T8star-Aix): https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Flujo nativo de Qwen-Image-2.1 en ComfyUI: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1
- Guia completa de Qwen-Image-2.1 (2026): https://cldnavi.com/en/blog/qwen-image-2-1-guide-2026/
- Guia de instalacion local con ComfyUI: https://www.mindstudio.ai/blog/qwen-image-2-1-local-install
- Workflow de edicion con Qwen 2.1 Image en RunningHub (video): https://www.youtube.com/watch?v=23IW8a7_zgI
