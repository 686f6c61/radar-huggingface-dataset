# KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Abenzerps-GGUF es una redistribución cuantizada en formato GGUF del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario KasugaiSakura sobre una conversión previa del repositorio abenzerps. Se trata, por tanto, de un derivado de terceros y no de un lanzamiento oficial de Qwen: los pesos del transformer de difusión se han convertido a GGUF mediante stable-diffusion.cpp para poder ejecutarse en ComfyUI con el nodo ComfyUI-GGUF, mientras que el text encoder (Qwen3-VL 8B) y el VAE se distribuyen en safetensors dentro del mismo repositorio.

El modelo resuelve un problema muy concreto: permitir la generación de imágenes texto-a-imagen con el modelo base Qwen-Image 2.1 en hardware de consumo, gracias a cuantizaciones que van de 7,59 GiB (Q8_0) a 4,05 GiB (Q4_0) para el transformer. La etiqueta "Uncensored" indica que la conversión elimina cualquier comprobador de seguridad o filtro de contenido incorporado, de modo que el modelo no rechaza prompts ni produce imágenes censuradas: el comportamiento depende exclusivamente del prompt y del entorno de ejecución.

El transformer de difusión declarado tiene 7.115.124.736 parámetros (~7,1 mil millones), el repositorio completo ocupa 54,9 GB y acumula 263 descargas y 63 likes en el momento de la consulta. Su relevancia actual es doble: por un lado, acerca un modelo de generación de imágenes de la familia Qwen a GPUs con 8-12 GB de VRAM; por otro, plantea de forma explícita el debate sobre modelos sin alineación de seguridad en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de imagenes (la model card no detalla la arquitectura interna); acompanado de text encoder Qwen3-VL 8B y VAE propio |
| Parametros totales | 7.115.124.736 (~7,1 mil millones), correspondientes al transformer de difusion |
| Parametros activos | no aplica (no se describe como modelo MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF para el transformer de difusion; safetensors para text encoder (BF16 e Int8) y VAE (BF16) |

Tabla de ficheros GGUF publicados:

| Cuantizacion | Tamano |
|---|---:|
| Q8_0 | 7,59 GiB |
| Q6_K | 5,88 GiB |
| Q5_K_M | 5,22 GiB |
| Q4_K_M | 4,60 GiB |
| Q4_0 | 4,05 GiB |

Ficheros auxiliares:

| Tipo | Fichero | Precision | Tamano |
|---|---|---|---:|
| Text encoder | qwen3vl_8b_bf16.safetensors | BF16 | 16,33 GiB |
| Text encoder | qwen3vl_8b_int8_convrot.safetensors | Int8 | 8,71 GiB |
| VAE | qwen_image_2.1_vae_bf16.safetensors | BF16 | 644 MiB |

## Arquitectura y entrenamiento

No hay información de entrenamiento en esta ficha: el repositorio es una conversión de pesos, no un modelo entrenado desde cero. Lo que se sabe es que parte del modelo base Qwen/Qwen-Image-2.1 (revisión `b3179ad355be050328e483a9dfdd9e60cd62adfa`), que el text encoder y el VAE proceden de Comfy-Org/Qwen-Image-2.1, y que la conversión a GGUF se realizó con stable-diffusion.cpp en el commit `1330cebae8f2ba99249df846cc0c9444fcbd4308`. No se documentan número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica aquí es la propia cuantización: al mantener el transformer de difusión en GGUF se puede cargar en VRAM con precisión reducida, mientras que el text encoder se ejecuta en RAM del sistema. La model card señala que esta separación es óptima porque el text encoding solo se ejecuta una vez por prompt, de modo que se ahorran entre 9 y 17 GB de VRAM con un impacto prácticamente nulo en la velocidad de generación. Se incluyen workflows oficiales de Comfy-Org tanto para texto-a-imagen como para edición de imagen, lo que sugiere que el modelo base soporta ambas tareas.

## Capacidades

- Generación de imágenes texto-a-imagen con quality suficiente para uso creativo local, en cuantizaciones que caben en GPUs de consumo.
- Edición de imágenes: la model card enlaza un workflow oficial de image edit, por lo que el pipeline permite tareas de modificación guiada por prompt sobre una imagen de entrada.
- Generación sin filtros de seguridad: no incorpora safety checker ni filtro de contenido, de modo que no rechaza prompts ni aplica censura sobre la salida.
- Integración con ComfyUI mediante el nodo `Unet Loader (GGUF)`, el nodo `CLIPLoader` configurado con `type = qwen_image` y el nodo `VAELoader`.
- Compatibilidad con los templates oficiales de Comfy-Org para Qwen-Image 2.1, sustituyendo el `UNETLoader` original por el cargador GGUF.
- Capacidades multilingües: no disponible (no se documenta el soporte de idiomas en la model card).
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplicable, es un modelo de difusión para imágenes.
- Modo "thinking", visión o audio como salida: no disponible; el text encoder es multimodal (Qwen3-VL 8B) pero la model card no documenta casos de uso de entrada de imagen al encoder.

## Casos de uso

- Generación de imágenes en local con GPU de gama media: con la cuantización Q4_K_M el transformer ocupa unos 4,6 GiB de VRAM y el text encoder Int8 reside en RAM (8,7 GiB), lo que permite generar imágenes en equipos con 8-12 GB de VRAM sin depender de servicios en la nube.
- Prototipado de concepto visual y moodboards: iteración rápida sobre ideas de diseño, paletas y composiciones antes de pasar a producción, aprovechando que el modelo no aplica filtros que bloqueen prompts legítimos de carácter artístico.
- Edición de imagen guiada por prompt: usando el workflow de image edit de Comfy-Org, se puede modificar una imagen existente (retocar, recomponer o reestilizar) sin reentrenar nada, únicamente cambiando la entrada.
- Pipelines de generación por lotes en estudio: automatizar la creación de variantes de un mismo prompt con ComfyUI en modo API, eligiendo la cuantización en función de la VRAM disponible por máquina.
- Investigación sobre seguridad y alineación: al carecer de filtros, sirve como caso de estudio controlado para medir qué ocurre cuando se elimina la capa de moderación, comparando salidas frente al modelo base con salvaguardas.
- Producción de contenido para adultos en jurisdicciones donde sea legal: generación de material NSFW sin bloqueos, siempre que se cumplan los requisitos legales de edad, consentimiento y etiquetado del contenido.
- Despliegue en estaciones de trabajo sin conexión: al distribuirse todos los componentes (transformer, text encoder y VAE) en el mismo repositorio, un equipo aislado de la red puede quedar operativo descargando una sola vez los ficheros.
- Integración en herramientas creativas de escritorio: al ser GGUF y funcionar dentro de ComfyUI, encaja en aplicaciones de escritorio que ya embeben ComfyUI como backend de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye únicamente una imagen (`assets/Qwen-Image-2.1-Benchmark.png`) sin tabla de valores, por lo que no es posible extraer cifras verificables ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM del transformer de difusión: 4,05 GiB (Q4_0), 4,60 GiB (Q4_K_M, recomendada), 5,22 GiB (Q5_K_M), 5,88 GiB (Q6_K) y 7,59 GiB (Q8_0).
- Memoria para el text encoder: 8,71 GiB en Int8 o 16,33 GiB en BF16, preferiblemente en RAM del sistema y no en VRAM (la model card indica que mantenerlo en CPU ahorra entre 9 y 17 GB de VRAM sin penalizar la velocidad).
- VAE: 644 MiB en BF16.
- Configuración recomendada por el autor: `qwen-image-2.1-Q4_K_M.gguf` en VRAM (~4,6 GiB) y `qwen3vl_8b_int8_convrot.safetensors` en RAM (~8,7 GiB).
- ¿Cabe en GPU de consumo? Sí. Con Q4_K_M y el text encoder en RAM, el modelo es viable en GPUs de 8 GB de VRAM, y cómodo en 12-16 GB (por ejemplo RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB). En GPUs de 24 GB (RTX 4090, RTX 3090) se puede subir a Q8_0 y mantener más componentes en VRAM.
- GPUs de datacenter: no se documentan requisitos ni configuraciones para A100 o H100; el modelo está pensado para inferencia local en ComfyUI.
- Modo de bajo consumo: si se producen errores de VRAM agotada, el autor recomienda arrancar ComfyUI con el argumento `--lowvram`.
- Opciones de despliegue: ComfyUI con la extensión ComfyUI-GGUF. La conversión se hizo con stable-diffusion.cpp. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión de imagen con este formato.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio completo ocupa 54,9 GB, aunque en la práctica solo hay que descargar una cuantización, un text encoder y el VAE.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Abenzerps-GGUF (este modelo) | ~7,1 mil millones (transformer) | GGUF + safetensors auxiliares | qwen-research | Repositorio publico en HuggingFace, 263 descargas, 63 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible en la informacion proporcionada | safetensors | qwen-research | Repositorio oficial de Qwen |
| Comfy-Org/Qwen-Image-2.1 | no disponible en la informacion proporcionada | safetensors | no disponible en la informacion proporcionada | Repositorio de Comfy-Org, origen del text encoder y el VAE |
| Otras alternativas de generacion de imagen (FLUX, SD3.5, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La comparación cuantitativa con modelos de la misma categoría (FLUX, Stable Diffusion 3.5 u otros) no puede realizarse con rigor porque la información proporcionada no incluye sus especificaciones ni resultados de benchmarks. Lo único verificable aquí es que este derivado se distingue por su formato GGUF y por la ausencia de filtros de contenido.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos. Al no existir capa de moderación, los sesgos presentes en los datos de entrenamiento del modelo base pueden aflorar sin atenuación en las imágenes generadas.
- Alucinación visual: los modelos de difusión pueden producir anatomías incorrectas, texto ilegible dentro de la imagen, manos deformadas o elementos incoherentes con el prompt; no hay datos de evaluación publicados en esta ficha.
- Contenido sensible: el repositorio elimina intencionadamente el safety checker. Esto implica riesgo real de generar contenido NSFW, violento o legalmente problemático según la jurisdicción, con implicaciones claras bajo normativas como el AI Act europeo si se despliega como servicio.
- Licencia restrictiva: la licencia qwen-research no es una licencia de código abierto permisiva. Antes de cualquier uso comercial es imprescindible revisar los términos originales del modelo base; la ficha no confirma que el uso comercial esté permitido.
- Trazabilidad de la conversión: el repositorio figura a nombre de KasugaiSakura, pero los enlaces de descarga de los ficheros GGUF apuntan al repositorio de abenzerps. Conviene verificar la integridad con el fichero SHA256SUMS antes de usar los pesos.
- Dependencia de herramientas concretas: el uso documentado pasa exclusivamente por ComfyUI y la extensión ComfyUI-GGUF. El modelo no es directamente consumible desde bibliotecas estándar de difusión sin una ruta de conversión alternativa.
- Idiomas y contexto: no se documenta soporte multilingüe ni longitud de contexto, por lo que el comportamiento con prompts en idiomas distintos del inglés o con descripciones muy largas no está garantizado.
- Ausencia de benchmarks: no hay cifras publicadas que permitan estimar fidelidad al prompt, calidad estética o degradación por cuantización, más allá de la recomendación del autor de usar Q4_K_M.
- Producción: al carecer de filtros y de evaluación de sesgos, su uso en servicios públicos exige moderación externa, registro de prompts y salidas, y control de edad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de Comfy-Org con text encoder y VAE: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Repositorio referenciado en los enlaces de descarga de los GGUF: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversión): https://github.com/leejet/stable-diffusion.cpp
- Workflow oficial texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Workflow oficial de edición de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Sumas de verificación SHA256: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF/blob/main/SHA256SUMS
- Los resultados de la búsqueda web no contenían información relevante sobre este modelo (devolvieron páginas de ayuda de Windows en húngaro), por lo que no se han utilizado como fuente.
