# nacerusama/Qwen-Image-2.1

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto (text-to-image) y edición de imágenes, desarrollado por el equipo Qwen (Alibaba). El repositorio analizado, `nacerusama/Qwen-Image-2.1`, es un espejo del modelo original `Qwen/Qwen-Image-2.1` publicado en Hugging Face y ModelScope. El modelo resuelve dos tareas en una sola arquitectura: síntesis de imágenes desde instrucciones en lenguaje natural y edición local o global de imágenes existentes, incluyendo la generación nativa de imágenes con canal alfa (RGBA) y la extracción de sujetos a partir de fotografías.

La arquitectura se basa en un transformer de difusión (DiT) con 32 capas single-stream y atención de granularidad mixta, con aproximadamente 7.115 millones de parámetros en el componente de generación visual. Incorpora reutilización de caché KV de prefijo, lo que reduce el coste computacional en inferencia. El modelo forma parte de la familia Qwen y se distribuye bajo licencia Qwen Research License Agreement, lo que restringe el uso comercial directo sin autorización expresa.

Su relevancia actual radica en la combinación de generación y edición en un único modelo compacto, el soporte de hasta 10 imágenes de referencia para edición, la preservación de identidad en personas y productos, y la capacidad de producir transparencia nativa sin postprocesado. Está integrado en la librería `diffusers` mediante la clase `QwenImage21Pipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con 32 capas single-stream y atencion de granularidad mixta |
| Parametros totales | 7.115.124.736 (~7.1B) en el componente de generacion visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License Agreement (license_name: qwen-research) |
| Formato de pesos | safetensors (repo de 33.1 GB) |
| Libreria | diffusers (QwenImage21Pipeline) |
| Resoluciones soportadas | 2048x2048 (1:1), 2400x1792 (4:3), 1792x2400 (3:4), 2528x1696 (3:2), 1696x2528 (2:3), 2752x1536 (16:9), 1536x2752 (9:16) |
| Pasos de inferencia recomendados | 40 |
| Imagenes de referencia para edicion | Hasta 10 |
| Canales de salida | RGB y RGBA (transparencia nativa) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusion basada en transformer (DiT) con 32 capas single-stream. La innovacion principal es el uso de atencion de granularidad mixta, que combina distintos niveles de resolucion atencional para equilibrar calidad y coste computacional, junto con reutilizacion de cache KV de prefijo para evitar recalcular representaciones en pasos consecutivos. Esto permite obtener imagenes de alta resolucion (hasta 2752x1536) con 40 pasos de inferencia en un modelo de solo 7B de parametros.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias humanas. El modelo soporta generacion y edicion unificadas, lo que sugiere un entrenamiento conjunto en tareas de sintesis y edicion con mascaras, anotaciones y referencias multiples.

## Capacidades

- Generacion de imagenes a partir de texto en resoluciones de hasta 2752x1536 y relaciones de aspecto predefinidas (1:1, 4:3, 3:4, 3:2, 2:3, 16:9, 9:16).
- Generacion nativa de imagenes con transparencia (RGBA) sin postprocesado, util para stickers, assets y composicion grafica.
- Edicion de imagenes mediante instrucciones en lenguaje natural, incluyendo cambios de fondo, estilo y contenido.
- Edicion localizada mediante circulos, anotaciones pintadas o mascaras separadas.
- Soporte de hasta 10 imagenes de referencia para edicion, con preservacion de identidad en personas y productos.
- Extraccion de sujetos a partir de fotografias para generar capas transparentes.
- Renderizado de texto en imagenes (tipografia) con calidad mejorada respecto a versiones anteriores.
- Mejora en iluminacion de retratos y detalles finos.
- Generacion de composiciones grupales a partir de multiples referencias de retrato.

## Casos de uso

- Generacion de assets para videojuegos y aplicaciones: el modelo produce stickers y elementos graficos con canal alfa nativo, lo que evita el recorte manual y acelera la integracion en motores como Unity o Unreal.
- Edicion de producto en ecommerce: partiendo de una fotografia de producto y una mascara, se puede cambiar el fondo a un entorno de estudio o exterior manteniendo la identidad del producto gracias al soporte de imagenes de referencia.
- Diseno grafico y carteleria: la capacidad de renderizar texto legible en la imagen permite generar carteles, banners y mockups con tipografia integrada, reduciendo el numero de iteraciones con herramientas de diseno.
- Creacion de retratos y composiciones grupales: con hasta 10 imagenes de referencia se pueden generar fotografias de grupo coherentes, util para agencias de publicidad o produccion audiovisual.
- Extraccion de sujetos para catalogos: a partir de una fotografia se puede aislar el sujeto sobre fondo transparente para su uso en fichas de producto, materiales de marketing o bases de datos visuales.
- Prototipado rapido de interfaces y mockups: la generacion a 2048x2048 con 40 pasos permite iterar sobre conceptos visuales en minutos en una GPU de gama alta.
- Edicion localizada en flujos de retoque: mediante anotaciones o mascaras se pueden modificar regiones concretas de una imagen sin regenerar el resto, lo que encaja en pipelines de retoque fotografico semiautomatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB solo para los pesos del componente de generacion visual (7.1B parametros), mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 20-24 GB para resoluciones altas.
- GPU recomendadas: A100 40GB/80GB, H100, L40S, RTX 4090 (24 GB) para resoluciones moderadas; para 2752x1536 se recomienda A100 o superior.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con `enable_model_cpu_offload()` para reducir pico de memoria; en GPUs de 16 GB requerira offload agresivo o cuantizacion (no documentada en la informacion disponible).
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline`, `enable_model_cpu_offload()` para optimizacion de memoria, integracion con `accelerate`; no se documentan soportes oficiales para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje, no a difusion).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la GPU, resolucion y numero de pasos (40 recomendados).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 | ~7.1B | DiT text-to-image + edicion | Hasta 2752x1536, 10 refs, RGBA | Qwen Research | Hugging Face, ModelScope |
| FLUX.1 (dev/schnell) | ~12B | DiT text-to-image | Hasta ~2 MP | Apache 2.0 (schnell) / no comercial (dev) | Hugging Face |
| Stable Diffusion 3.5 Large | ~8B | MMDiT text-to-image | Hasta 1 MP | Stability Community License | Hugging Face |
| Qwen-Image (version anterior) | No disponible | DiT text-to-image | No disponible | Qwen Research | Hugging Face |

La comparativa se basa en caracteristicas generales de modelos de la misma categoria; no se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre Qwen-Image-2.1 y las alternativas.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: restringe el uso comercial sin autorizacion expresa; es imprescindible revisar el archivo LICENSE antes de desplegar en produccion.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir elementos inexistentes, texto mal renderizado o incoherencias en escenas complejas.
- Sesgos: no se documentan en la informacion proporcionada, pero los modelos de difusion entrenados con datasets web suelen reproducir sesgos de genero, etnia y estetica; se recomienda auditoria previa.
- Idiomas: no se especifican los idiomas soportados; el renderizado de texto en la imagen puede degradarse en idiomas distintos al ingles o chino.
- Edicion con multiples referencias: el limite de 10 imagenes puede ser insuficiente para escenas con muchos sujetos; la preservacion de identidad no esta garantizada al 100%.
- Resoluciones altas: 2752x1536 requiere VRAM considerable; en GPUs de 24 GB puede necesitar offload y aumentar la latencia.
- Repositorio espejo: `nacerusama/Qwen-Image-2.1` tiene 0 descargas y 1 like, por lo que conviene verificar la integridad de los pesos frente al repositorio oficial `Qwen/Qwen-Image-2.1`.
- Sin datos de benchmarks publicados en la informacion disponible: no se puede avalar cuantitativamente la calidad frente a alternativas.

## Enlaces

- Repositorio analizado: https://huggingface.co/nacerusama/Qwen-Image-2.1
- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog oficial: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- Formulario de feedback: https://alidocs.dingtalk.com/notable/share/form/v01WgZOZA5DaVQPeqLX_dv19yqvsgs3oebp3pcjys_1qX0QQ0?source=link
