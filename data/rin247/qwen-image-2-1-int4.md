# Rin247/Qwen-Image-2.1-INT4

## Resumen

Rin247/Qwen-Image-2.1-INT4 es una version cuantizada del modelo de generacion y edicion de imagenes Qwen-Image-2.1, publicado por el usuario Rin247 en Hugging Face. Se trata de un derivado comunitario, no oficial, del modelo original de Qwen: mantiene la interfaz de inferencia del pipeline `QwenImage21Pipeline` de diffusers y reduce el peso de los pesos para facilitar su ejecucion en hardware mas modesto. El repositorio ocupa 12,1 GB y los pesos safetensors declaran 4.456.073.608 parametros (~4,46 B), frente a los 7 B del componente de generacion visual del modelo base.

El modelo base Qwen-Image-2.1 es un sistema unificado de texto-a-imagen y edicion de imagenes construido sobre un Diffusion Transformer (DiT) Single-Stream de 32 capas, con atencion de granularidad mixta y reutilizacion de cache KV de prefijo. Sus rasgos diferenciales son la generacion nativa de imagenes con canal alfa (RGBA), la capacidad de aceptar hasta 10 imagenes de referencia en una misma peticion y la edicion localizada mediante circulos, anotaciones pintadas o mascaras separadas.

La relevancia de esta ficha concreta es practica: permite evaluar si la cuantizacion de este derivado es utilizable en produccion. Hay que tener en cuenta que el repositorio no tiene descargas ni valoraciones, que la model card no documenta ningun resultado de benchmarks y que la licencia declarada es la Qwen Research License Agreement, orientada a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) Single-Stream de 32 capas, atencion de granularidad mixta y reutilizacion de cache KV de prefijo (arquitectura heredada del modelo base Qwen-Image-2.1) |
| Parametros totales | 4.456.073.608 (~4,46 B) segun los pesos safetensors del repositorio; el componente de generacion visual del modelo base declara 7 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; acepta hasta 10 imagenes de referencia por peticion y resoluciones de hasta 2752x1536 pixeles |
| Tipos de cuantizacion | INT4 segun el nombre del repositorio; el tag de la ficha indica "8-bit". El modelo base se distribuye en bfloat16 |
| Idiomas soportados | No disponible (la model card no especifica idiomas para los prompts) |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | safetensors, compatible con la libreria diffusers mediante `QwenImage21Pipeline` |
| Tamano del repositorio | 12,1 GB |
| Resoluciones y relaciones de aspecto | 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536), 9:16 (1536x2752) |
| Pasos de inferencia de referencia | 40 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un Diffusion Transformer de 32 capas en configuracion Single-Stream, con atencion de granularidad mixta y reutilizacion de cache KV de prefijo. El autor del modelo base describe esta combinacion como el mecanismo que permite mantener calidad de imagen con un coste computacional bajo. No se detalla en la informacion proporcionada el codificador de texto empleado, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o refinamiento por preferencias humanas. Tampoco se especifica el proceso de destilado ni el metodo exacto de cuantizacion aplicado por Rin247 para generar esta variante INT4.

Las innovaciones declaradas por el modelo base son cuatro: arquitectura compacta y eficiente; transparencia nativa con generacion y edicion de capas RGBA en el mismo modelo; edicion versatil con soporte de hasta 10 imagenes de referencia, edicion local por circulos, anotaciones pintadas o mascaras, y preservacion de identidad en personas y productos; y mejora de texturas realistas, tipografia e iluminacion de retratos. Sobre el entrenamiento especifico de esta variante cuantizada no hay informacion publicada en la model card, que es practicamente identica a la del modelo original.

## Capacidades

- Generacion de imagenes a partir de texto en resoluciones de hasta 2752x1536 pixeles y siete relaciones de aspecto predefinidas.
- Edicion de imagenes: cambio de fondo, modificacion de elementos y edicion localizada mediante circulos, anotaciones pintadas o mascaras independientes.
- Generacion nativa de imagenes con transparencia (RGBA), incluyendo la edicion de capas transparentes y la extraccion de sujetos a partir de fotografias.
- Composicion con multiples referencias: admite hasta 10 imagenes de referencia en una misma peticion, con preservacion de identidad en personas y productos (el ejemplo mostrado en la model card es una fotografia de grupo generada a partir de seis retratos).
- Renderizado de texto y tipografia dentro de la imagen generada.
- Control fino mediante prompts detallados y semilla manual (`manual_seed`) para reproducibilidad.
- Optimizacion de memoria mediante `enable_model_cpu_offload()` para ejecucion con recursos limitados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o video, dado que se trata de un modelo de difusion para imagen.

## Casos de uso

- Generacion de recursos graficos con transparencia: el modelo produce PNG con canal alfa de forma nativa, por lo que se puede usar para crear stickers, iconos, sprites y elementos de interfaz sin necesidad de un paso posterior de recorte o segmentacion.
- Edicion de producto en comercio electronico: partiendo de una fotografia de catalogo, se puede cambiar el fondo, ajustar la iluminacion o sustituir el entorno manteniendo la identidad del producto gracias al soporte de imagenes de referencia.
- Retoque localizado en fotografia: el uso de mascaras, circulos o anotaciones pintadas permite modificar una region concreta de la imagen sin regenerar el resto del encuadre.
- Extraccion de sujetos para flujos de diseno: el modelo puede aislar un sujeto de una fotografia y devolverlo como capa transparente, lo que encaja en pipelines de composicion en herramientas como Photoshop o GIMP.
- Creacion de mockups y carteleria: la mejora declarada en tipografia permite generar carteles, senaletica y mockups de producto con texto legible integrado en la escena.
- Generacion de ilustraciones consistentes de personajes: el uso de hasta 10 referencias y de semillas fijas permite mantener rasgos de personaje a lo largo de una serie de imagenes para narrativa visual o videojuegos.
- Prototipado en estaciones de trabajo con GPU de consumo: al ser una variante cuantizada, sirve para validar prompts y flujos de edicion antes de escalar a la version completa en bfloat16.
- Procesamiento por lotes en investigacion: la API de diffusers con semilla manual y pasos configurables facilita experimentos reproducibles sobre edicion e identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado reproduce la del modelo base y no incluye tablas comparativas, metricas de FID, CLIP score, GenEval, GEdit-Bench ni evaluaciones humanas. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 12,1 GB en disco, por lo que se necesita ese espacio libre como minimo. Las estimaciones de VRAM en inferencia que se indican a continuacion son aproximadas y no estan verificadas por el autor: en torno a 8-12 GB si se activa `enable_model_cpu_offload()`, y 16-24 GB para mantener todo el pipeline en GPU a resoluciones de 2048x2048.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 / 4070 Ti (16 GB) para inferencia con offload, A100 (40 o 80 GB) y H100 para lotes o resoluciones maximas.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o superiores con offload de CPU activado; en tarjetas de 12 GB el margen es muy ajustado y depende de la resolucion y de la longitud del prompt.
- Opciones de despliegue: diffusers con `QwenImage21Pipeline` es la via documentada; el autor indica `torch>=2.4.0`, `transformers>=5.17` y la instalacion de diffusers desde el repositorio Git. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp, formatos que en principio no aplican a un modelo de difusion.
- Latencia y throughput: no disponible en la informacion proporcionada. Los ejemplos oficiales usan 40 pasos de inferencia, lo que sirve como referencia de configuracion, no como medida de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rin247/Qwen-Image-2.1-INT4 | ~4,46 B en safetensors (cuantizado) | Hasta 10 imagenes | qwen-research | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1 (base) | 7 B en el componente visual, 32 capas Single-Stream DiT | Hasta 10 imagenes | qwen-research | Hugging Face, ModelScope, demo en Spaces |
| Familia FLUX.1 (versiones de generacion y edicion) | No disponible | No disponible | No disponible | No disponible |
| Familia Stable Diffusion 3.5 | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de los modelos alternativos dentro de la informacion proporcionada; sus celdas se marcan como no disponibles. Para una comparativa fiable con FLUX.1 o Stable Diffusion 3.5 hay que consultar sus fichas oficiales, ya que las cifras no estan recogidas en la documentacion de este repositorio.

## Limitaciones y advertencias

- Licencia de investigacion: el modelo se publica bajo la Qwen Research License Agreement, orientada a uso de investigacion. Antes de cualquier uso comercial es imprescindible revisar el texto completo de la licencia incluido en el repositorio, ya que puede restringir la explotacion comercial tanto del modelo como de sus derivados.
- Inconsistencia en la nomenclatura de cuantizacion: el nombre del repositorio indica INT4 mientras que el tag de la ficha indica "8-bit". No hay documentacion que aclare el esquema exacto ni que componentes se cuantizaron.
- Discrepancia en el recuento de parametros: los safetensors declaran ~4,46 B de parametros, mientras que el modelo base declara 7 B en su componente de generacion visual. La diferencia puede deberse a la cuantizacion, a la exclusion de componentes o a ambos factores, pero no esta explicada.
- Sin benchmarks: no hay metricas publicadas que permitan cuantificar la perdida de calidad frente al modelo base en bfloat16.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 valoraciones, por lo que no existe retroalimentacion externa sobre su funcionamiento real.
- Riesgo de artefactos por cuantizacion: es esperable, aunque no esta medido, un deterioro en texturas finas, en el renderizado de texto y en la nitidez de detalles a resoluciones altas (2048x2048 y superiores).
- Idiomas no especificados: la model card no indica que idiomas admite en los prompts ni como se comporta con prompts en castellano.
- Alucinacion visual: como todo modelo generativo, puede producir elementos incoherentes, texto mal formado o geometria incorrecta en escenas complejas; no hay evaluacion publicada al respecto.
- Coste de inferencia no documentado: no se publican medidas de latencia ni de consumo de VRAM, por lo que las estimaciones de hardware de esta ficha son orientativas.
- Dependencias muy recientes: los requisitos indican `transformers>=5.17` y diffusers instalado desde el repositorio Git, lo que puede complicar la reproducibilidad en entornos congelados.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/Rin247/Qwen-Image-2.1-INT4
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog de Qwen-Image 2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Discord de Qwen: https://discord.gg/CV4E9rpNSD
- Licencia: archivo LICENSE incluido en el repositorio del modelo
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente foros de automocion sin relacion con el contenido de la ficha.
