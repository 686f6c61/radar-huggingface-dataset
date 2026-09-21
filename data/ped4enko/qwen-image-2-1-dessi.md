# ped4enko/Qwen-Image-2.1-Dessi

## Resumen

Qwen-Image-2.1-Dessi es una conversion a formato GGUF del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario ped4enko en HuggingFace. Se trata de una cuantizacion del transformador de difusion original que permite ejecutar generacion de imagenes texto-a-imagen en local, sin depender de APIs en la nube, reduciendo el peso del modelo desde los aproximadamente 14 GB en BF16 hasta 4,05-7,59 GB segun la cuantizacion elegida.

El repositorio incluye, ademas del transformador de difusion en GGUF, los componentes auxiliares necesarios para la inferencia: el codificador de texto basado en Qwen3-VL de 8.000 millones de parametros (en BF16 o Int8) y el VAE especifico de Qwen-Image-2.1. El modelo esta pensado para usarse con ComfyUI y el nodo ComfyUI-GGUF, y la model card indica explicitamente que esta version no incorpora filtro de seguridad ni comprobador de contenido.

Su relevancia actual radica en que acerca un modelo de generacion de imagenes de ultima generacion a hardware de consumo, con una configuracion recomendada que combina el transformador cuantizado en VRAM y el codificador de texto en RAM del sistema. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad sobre esta conversion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (tipo exacto no detallado en la informacion disponible); codificador de texto Qwen3-VL 8B y VAE propios |
| Parametros totales | 7.115.124.736 (aprox. 7,1 mil millones) en el transformador de difusion |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | qwen-research (Qwen Research License); etiquetada como "other" en HuggingFace |
| Formato de pesos | GGUF (transformador de difusion); safetensors (codificador de texto y VAE) |

## Arquitectura y entrenamiento

La ficha disponible no describe la arquitectura interna del transformador de difusion mas alla de identificarlo como modelo texto-a-imagen. La conversion se ha realizado con stable-diffusion.cpp (commit 1330cebae8f2ba99249df846cc0c9444fcbd4308) y se distribuye en cinco niveles de cuantizacion GGUF, desde Q8_0 (7,59 GB) hasta Q4_0 (4,05 GB), siendo Q4_K_M (4,60 GB) la recomendada por el autor por su equilibrio entre tamano y calidad. El repositorio ocupa 54,9 GB en total, lo que incluye las cinco variantes cuantizadas junto con los ficheros auxiliares.

El modelo base es Qwen/Qwen-Image-2.1, segun la revision de origen b3179ad355be050328e483a9dfdd9e60cd62adfa. La model card indica que la conversion parte de "los pesos base originales del modelo upstream", es decir, no se trata de un ajuste fino sobre el modelo de Qwen, sino de una cuantizacion de los pesos originales. No se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo base empleo tecnicas de alineacion como RLHF o DPO.

El repositorio incluye tambien los componentes de acompanamiento empaquetados para ComfyUI: el codificador de texto en BF16 (17,53 GB) o Int8 (9,35 GB) y el VAE en BF16 (676 MB), todos ellos alojados en el propio repositorio.

## Capacidades

- Generacion de imagenes texto-a-imagen: produce imagenes a partir de descripciones textuales usando el transformador de difusion cuantizado.
- Edicion de imagenes: los flujos oficiales de Comfy-Org incluyen una plantilla de edicion de imagen (image edit), lo que sugiere soporte para tareas de modificacion sobre imagenes existentes.
- Generacion sin filtro de contenido: la model card indica que esta version no incorpora comprobador de seguridad ni filtro, por lo que genera contenido adulto o sensible sin rechazos de prompt.
- Despliegue local y offline: al estar en formato GGUF, el modelo se ejecuta en la maquina del usuario a traves de ComfyUI, sin conexion a servicios externos.
- Integracion con ComfyUI: requiere el nodo Unet Loader (GGUF) y el fork ComfyUI-GGUF mantenido por leejet para soportar la arquitectura Qwen-Image 2.1.
- Seleccion de precision en inferencia: permite intercambiar cuantizaciones segun la memoria disponible, incluyendo modos de bajo consumo con el argumento --lowvram.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de imagenes en local en ComfyUI: con la cuantizacion Q4_K_M (4,60 GB) el transformador cabe en tarjetas de gama media y permite crear ilustraciones sin enviar prompts a servicios externos, lo que resulta util para proyectos con requisitos de privacidad.
- Ilustracion de documentacion y articulos: el modelo puede generar imagenes de portada o material grafico para blogs tecnicos y manuales de forma automatica dentro de un flujo de trabajo de ComfyUI, reutilizando plantillas de flujo ya existentes.
- Edicion de imagenes sobre resultados previos: la plantilla de image edit de Comfy-Org permite partir de una imagen y aplicar modificaciones guiadas por texto, util para retoques iterativos sin volver a generar desde cero.
- Prototipado de recursos graficos para aplicaciones: equipos de desarrollo de videojuegos o apps pueden generar variantes de assets visuales para validar direccion artistica antes de encargar trabajo final a un ilustrador.
- Pipelines de marketing con generacion por lotes: al ejecutarse localmente y sin coste por llamada, el modelo sirve para producir grandes volumenes de variaciones de un mismo concepto variando el prompt, en lugar de consumir creditos de una API.
- Investigacion sobre cuantizacion de modelos de difusion: comparar las cinco variantes GGUF permite estudiar la degradacion de calidad frente a la reduccion de memoria, un caso de uso habitual en entornos academicos.
- Generacion de contenido en entornos controlados de investigacion: la ausencia de filtro y el aviso sobre el contenido sin censura lo orientan a entornos de laboratorio donde se evalua el comportamiento del modelo base sin restricciones.
- Despliegue en estaciones de trabajo sin GPU de gama alta: con el codificador de texto en RAM y el transformador en VRAM, la configuracion recomendada por el autor (Q4_K_M + codificador Int8) reduce el consumo de VRAM a unos 4,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una referencia a una imagen de benchmark (assets/Qwen-Image-2.1-Benchmark.png) que no resulta legible en el material proporcionado, y la busqueda web realizada no devolvio ningun dato de rendimiento asociado a este repositorio. No se dispone por tanto de cifras de metricas como FID, CLIP score, o comparativas con otros modelos de generacion de imagenes.

## Requisitos de hardware

- VRAM para el transformador de difusion: 4,05 GB (Q4_0), 4,60 GB (Q4_K_M), 5,22 GB (Q5_K_M), 5,88 GB (Q6_K) o 7,59 GB (Q8_0).
- VRAM o RAM para el codificador de texto: 9,35 GB en Int8 o 17,53 GB en BF16. El autor recomienda mantenerlo en RAM del sistema (offload a CPU), ya que solo se ejecuta una vez por prompt.
- VAE: 676 MB en BF16.
- Configuracion recomendada por el autor: Q4_K_M en VRAM (~4,6 GB) y codificador de texto Int8 en RAM (~9,35 GB), lo que reduce el consumo de VRAM entre 9 y 17 GB sin impacto apreciable en la velocidad de generacion.
- Cabe en GPU de consumo: si, con la configuracion de offload del codificador de texto. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden alojar el transformador cuantizado; una RTX 4090 de 24 GB permite ademas mantener en VRAM el codificador de texto en Int8.
- GPU de datacenter (A100, H100): compatibles y con margen sobrado, aunque el modelo esta orientado a entornos locales, por lo que este hardware solo se justifica para generacion por lotes a gran escala.
- Modo de bajo consumo: si se producen errores de memoria, el autor recomienda arrancar ComfyUI con el argumento --lowvram.
- Opciones de despliegue: ComfyUI con el fork leejet/ComfyUI-GGUF, o stable-diffusion.cpp (herramienta usada para la conversion). Tambien es posible usar el flujo oficial de Comfy-Org anadiendo el nodo Unet Loader (GGUF).
- Latencia y throughput: no disponible. La informacion no incluye tiempos de generacion por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ped4enko/Qwen-Image-2.1-Dessi (esta ficha) | 7,1 mil millones | No disponible | GGUF (transformador) + safetensors | qwen-research | Repositorio publico, 0 descargas |
| Qwen/Qwen-Image-2.1 (modelo base) | 7,1 mil millones | No disponible | safetensors (BF16) | qwen-research | Repositorio oficial de Qwen |
| Comfy-Org/Qwen-Image-2.1 (componentes ComfyUI) | No disponible | No disponible | safetensors | No disponible | Repositorio de Comfy-Org |

No se dispone en la informacion proporcionada de datos de rendimiento, parametros ni contexto de otras alternativas de generacion de imagenes como FLUX.1 o Stable Diffusion 3.5, por lo que no es posible establecer una comparacion cuantitativa con ellas. La comparacion se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Contenido sin filtro: la model card indica que esta version no incluye comprobador de seguridad ni filtro de contenido y que genera imagenes adultas, NSFW y sensibles sin rechazos. Su uso debe restringirse a entornos controlados y cumplir la normativa aplicable.
- Aviso de version sin censura en desarrollo: la model card anuncia que una version "completamente sin censura" se anadira al repositorio mas adelante, lo que implica que la version actual puede no ser el estado final del proyecto y que el contenido del repositorio cambiara.
- Licencia restrictiva: se distribuye bajo la Qwen Research License, etiquetada como "other" en HuggingFace. Es previsible que imponga limitaciones al uso comercial; conviene revisar los terminos completos antes de cualquier despliegue en produccion.
- Sin datos de benchmarks verificables: no se aportan cifras de calidad ni comparativas reproducibles, mas alla de una imagen de referencia en la model card.
- Sin validacion de la comunidad: el repositorio presenta 0 descargas y 0 valoraciones, por lo que no existe evidencia externa sobre la fidelidad de la conversion respecto al modelo base.
- Dependencia de software especifico: requiere el fork leejet/ComfyUI-GGUF. La model card advierte de que la version antigua city96/ComfyUI-GGUF provoca un error de arquitectura desconocida, por lo que es necesario actualizar o modificar tools/convert.py.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir imagenes con artefactos, anatomia incorrecta o texto ilegible, especialmente en las cuantizaciones mas agresivas (Q4_0, Q4_K_M).
- Idiomas no especificados: la ficha no declara idiomas soportados, por lo que el comportamiento frente a prompts en idiomas distintos del ingles no esta garantizado.
- Posible discrepancia de nombre: el identificador del repositorio incluye el sufijo "Dessi", mientras que la model card describe una conversion generica de Qwen-Image-2.1, sin explicar en que se diferencia esta publicacion de otras conversiones GGUF del mismo modelo.
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion el 21 de septiembre de 2026, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ped4enko/Qwen-Image-2.1-Dessi
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Componentes para ComfyUI (codificador de texto y VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversion): https://github.com/leejet/stable-diffusion.cpp
- Plantilla de flujo texto-a-imagen de Comfy-Org: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo de edicion de imagen de Comfy-Org: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
