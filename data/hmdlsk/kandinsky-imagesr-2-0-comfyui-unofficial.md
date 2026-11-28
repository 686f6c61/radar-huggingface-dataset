# hmdlsk/Kandinsky-ImageSR-2.0-ComfyUI-Unofficial

## Resumen

Kandinsky-ImageSR-2.0-ComfyUI-Unofficial es un reempaquetado del transformer del modelo de superresolucion Kandinsky ImageSR 2.0, desarrollado originalmente por Kandinsky Lab (Sber). El autor del repositorio, hmdlsk, ha fusionado los tres shards del transformer original en un unico fichero safetensors con la configuracion embebida como metadatos, para facilitar su uso en ComfyUI a traves del nodo personalizado ComfyUI-KSR-Unofficial. No se trata de un finetune: los pesos son identicos byte a byte a los de la publicacion original.

El modelo resuelve la tarea de superresolucion de imagenes (image-to-image), aumentando la resolucion de una imagen de entrada con un factor declarado de x4 en los ejemplos publicados. Es relevante para flujos de trabajo de ComfyUI que necesitan un upscaler de alta calidad integrado en pipelines de difusion, ya que el formato de fichero unico simplifica la carga y reduce los pasos de configuracion.

La arquitectura subyacente es un transformer de difusion (el repositorio no detalla la topologia interna mas alla de describir "the transformer"), empaquetado en bf16 con las capas de modulacion y las tablas de timestep en fp32. El repositorio ocupa 10,3 GB e incluye unicamente los pesos del transformer, no el VAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image-to-image); topologia interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | bf16 (por defecto, con modulacion y timesteps en fp32); conversion a fp8 en carga mediante `weight_dtype` |
| Idiomas soportados | no disponibles (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (fichero unico `kandinsky_imagesr_2.0.safetensors`, ~10,3 GB) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un transformer de difusion para superresolucion de imagenes, empaquetado en un unico fichero safetensors. El autor indica que solo se ha modificado el empaquetado: los tres shards del transformer original se concatenan en un fichero y se embeben como metadatos `transformer/config.json`, la configuracion del VAE (solo ajustes, sin pesos) y `model_index.json`. Los nombres y valores de los tensores no cambian. Las capas de modulacion y las tablas de timestep se almacenan en fp32 mientras el resto va en bf16.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF/DPO o ajuste fino. El modelo original emplea el VAE de FLUX.1 (el mismo `ae.safetensors` de black-forest-labs/FLUX.1-schnell), que no se incluye en este repositorio porque Kandinsky ImageSR distribuye ese mismo VAE por separado. El SHA256 del fichero de pesos es `56e2a496735be188faf8750a21e5221281e0ddf639ae15bf9947d6942c84fc3c`.

## Capacidades

- Superresolucion de imagenes (image-to-image) con factor x4 segun los ejemplos publicados.
- Integracion nativa en ComfyUI mediante el nodo ComfyUI-KSR-Unofficial.
- Carga en bf16 o conversion a fp8 al cargar mediante el parametro `weight_dtype` del nodo loader.
- Uso del VAE de FLUX.1 (`ae.safetensors`) como decodificador.
- Ajuste de "creatividad" mencionado en el README de GitHub del nodo (parametro del nodo, no del modelo).
- No se documentan capacidades de texto, codigo, tool calling, agentes, vision general, audio ni multilingues.

## Casos de uso

- Restauracion y ampliacion de fotografias de baja resolucion: el modelo toma una imagen de entrada (por ejemplo 512 px) y la amplia x4, util para recuperar detalle en archivos historicos o capturas de baja calidad.
- Upscaling en pipelines de generacion de imagenes en ComfyUI: se puede encadenar tras un modelo de difusion texto-a-imagen para aumentar la resolucion final sin salir del grafo de ComfyUI.
- Preparacion de assets para impresion o visualizacion en alta resolucion: ampliar imagenes de producto o ilustraciones antes de su uso en materiales graficos.
- Mejora de miniaturas y previews en aplicaciones web: aumentar la resolucion de imagenes pequenas para pantallas de alta densidad de pixeles.
- Restauracion de fotogramas en proyectos de video o animacion: aplicar el upscaler fotograma a fotograma para mejorar material de archivo antes de reescalar el video.
- Investigacion en superresolucion: al ser un reempaquetado byte-identico con licencia MIT, sirve como punto de partida reproducible para comparativas y experimentos con el transformer original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README de GitHub del nodo ComfyUI-KSR-Unofficial menciona "performance numbers", pero no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero de pesos ocupa ~10,3 GB en bf16, por lo que se necesita al menos esa cantidad de VRAM para cargarlo en bf16, y aproximadamente la mitad si se convierte a fp8 en carga.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del fichero, encaja en GPUs con 16 GB o mas en fp8 y con 24 GB o mas en bf16, pero el autor no lo especifica.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-KSR-Unofficial; el VAE debe colocarse en `ComfyUI/models/vae/` y el transformer en `ComfyUI/models/diffusion_models/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-ImageSR-2.0-ComfyUI-Unofficial | Transformer de difusion para superresolucion | no disponible | no aplica | MIT | Hugging Face (este repo) |
| kandinskylab/Kandinsky-ImageSR-2.0 | Transformer de difusion para superresolucion (original, multi-shard) | no disponible | no aplica | MIT | Hugging Face |
| Alternativas de upscaling (p. ej. Real-ESRGAN, SwinIR) | Redes GAN/transformer de superresolucion | no disponible en esta ficha | no aplica | variable | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: no esta afiliado a Kandinsky Lab; la calidad y el soporte dependen del autor del reempaquetado.
- Solo contiene el transformer: es imprescindible descargar por separado el VAE de FLUX.1 (`ae.safetensors` de black-forest-labs/FLUX.1-schnell) para que funcione.
- No es un finetune: no incorpora mejoras ni ajustes respecto al modelo original; cualquier limitacion del original se hereda.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque es un modelo de imagen; no se han publicado evaluaciones de fidelidad o artefactos.
- El factor x4 aparece en los ejemplos del README, pero no se especifica si el modelo admite otros factores de escala.
- El rendimiento en GPU de consumo no esta verificado por el autor; el tamano del fichero (~10,3 GB) condiciona el hardware necesario.
- Licencia MIT: permite uso comercial, pero conviene revisar los terminos del modelo base y del VAE de FLUX.1 por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hmdlsk/Kandinsky-ImageSR-2.0-ComfyUI-Unofficial
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Nodo ComfyUI: https://github.com/the-aSak/ComfyUI-KSR-Unofficial
- VAE de FLUX.1: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Script de fusion: `tools/merge_kandinsky_sr.py` en el repositorio de GitHub del nodo
