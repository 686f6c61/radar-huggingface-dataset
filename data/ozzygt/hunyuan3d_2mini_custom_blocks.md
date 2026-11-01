# OzzyGT/hunyuan3d_2mini_custom_blocks

## Resumen

Hunyuan3D-2mini Modular Diffusers es un conjunto de bloques modulares para la librería `diffusers` que implementan la generación de mallas 3D sin textura a partir de una única imagen de entrada. No se trata de un modelo entrenado por el autor del repositorio, sino de una reempaquetación de los pesos oficiales de `tencent/Hunyuan3D-2mini` en el nuevo sistema de pipelines modulares de Diffusers, lo que permite componer, inspeccionar y sustituir etapas del pipeline de forma granular. El autor es OzzyGT y el repositorio se publicó el 29 de octubre de 2026.

El modelo subyacente, desarrollado por Tencent Hunyuan, resuelve el problema de image-to-3D: dada una fotografía de un objeto con fondo transparente, produce una malla poligonal (vértices y caras) exportable a formatos como GLB. La variante "mini" reduce el coste computacional respecto a la versión completa, manteniendo la arquitectura de generación latente basada en difusión con extracción de superficie mediante marching cubes sobre una rejilla octree configurable.

La relevancia de este repositorio concreto reside en su integración con `ModularPipelineBlocks` de Diffusers (requiere `diffusers>=0.41.0` y `transformers>=5.3.0`), que facilita la experimentación con las distintas variantes del checkpoint (turbo, fast y base) sin reescribir el código de inferencia. El repositorio de bloques es Apache-2.0, pero los pesos que consume están sujetos a la Tencent Hunyuan 3D 2.0 Community License, una distinción importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente para generación de formas 3D, con extracción de malla mediante octree y marching cubes (implementación modular sobre Diffusers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una imagen) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial carga componentes en `float16` |
| Idiomas soportados | en (etiqueta del repositorio; la entrada es visual) |
| Licencia | Bloques: Apache-2.0. Pesos: Tencent Hunyuan 3D 2.0 Community License |
| Formato de pesos | no disponible en este repositorio (no contiene pesos); los checkpoints se cargan desde repositorios separados vía `components_repo` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: expone como bloques modulares el pipeline de `tencent/Hunyuan3D-2mini`, un modelo de difusión que genera una representación latente de forma 3D condicionada por una imagen y posteriormente extrae una malla superficial. La extracción se controla con el parámetro `octree_resolution`, que fija la resolución de la rejilla sobre la que se aplica el algoritmo de marching cubes: valores más altos producen mallas más finas con más triángulos. El pipeline acepta un generador de números aleatorios para reproducibilidad (el ejemplo usa semilla 42, 30 pasos de inferencia y resolución de octree 380).

El autor distribuye tres checkpoints con estrategias de destilación distintas, cada uno en su propio repositorio: `hunyuan3d_2mini_turbo` (destilado por pasos, pensado para pocos pasos de inferencia), `hunyuan3d_2mini_fast` (destilado en guiado, elimina la necesidad de classifier-free guidance) y `hunyuan3d_2mini_base` (con classifier-free guidance, cuyo `guidance_scale` se ajusta a través del componente guider, por ejemplo `guidance_scale=5.0`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que la model card no los detalla.

La innovación técnica del repositorio es de ingeniería de software más que de modelado: la adopción del sistema `ModularPipelineBlocks`, que separa la lógica del pipeline de los pesos y permite intercambiar checkpoints cambiando únicamente el argumento `components_repo`. Esto exige `trust_remote_code=True` para el código de los bloques y `trust_components_code=True` para las clases personalizadas del repositorio de componentes, ambos con implicaciones de seguridad que el autor advierte explícitamente.

## Capacidades

- Generación de forma 3D sin textura a partir de una sola imagen RGB con canal alfa.
- Recorte automático del objeto mediante el canal alfa y centrado sobre lienzo blanco antes de la inferencia.
- Extracción de malla configurable en resolución mediante `octree_resolution`, con control del número de triángulos resultantes.
- Exportación de la salida a formatos de malla estándar (el ejemplo usa `trimesh` para generar un GLB).
- Tres modos de inferencia según checkpoint: turbo (destilado por pasos), fast (destilado en guiado) y base (con classifier-free guidance ajustable).
- Reproducibilidad mediante `torch.Generator` con semilla fija.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un pipeline image-to-3D, no un modelo conversacional.
- No genera texturas ni materiales; la salida es geometría pura.

## Casos de uso

- Prototipado rápido de assets 3D en videojuegos: a partir de un concept art o una fotografía de referencia, el pipeline genera una malla base en decenas de pasos de inferencia que el artista puede retopologizar y texturizar después en Blender o Maya, reduciendo el tiempo de modelado inicial.
- Catalogación y digitalización de productos físicos: fotografiar un objeto sobre fondo transparente y obtener una malla aproximada para vistas previas en comercio electrónico o configuradores web, usando el checkpoint turbo para minimizar latencia en un servicio por lotes.
- Generación de mallas para impresión 3D: la exportación a GLB y la resolución de octree ajustable permiten producir geometrías con el nivel de detalle adecuado para slicers, aunque requiere revisión manual de la malla por posibles artefactos.
- Aumento de datos sintéticos para entrenamiento de modelos de visión 3D: generar variaciones de forma a partir de imágenes existentes para ampliar datasets de detección o segmentación volumétrica.
- Integración en herramientas DCC mediante scripting: al ser un pipeline de Diffusers invocable desde Python, puede envolverse en un add-on de Blender que consuma la imagen seleccionada y devuelva la malla directamente a la escena.
- Investigación sobre pipelines modulares de Diffusers: el repositorio sirve como ejemplo práctico de composición de bloques, sustitución de componentes (guider, scheduler) y comparación entre estrategias de destilación sobre un mismo modelo base.
- Previsualización en aplicaciones de realidad aumentada: generar una malla ligera a baja resolución de octree para colocarla como placeholder en escenas AR antes de disponer del asset final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el ejemplo carga los componentes en `float16` sobre CUDA, lo que sitúa el requisito típico de este tipo de pipelines en el rango de varias GB, pero no se confirma una cifra concreta en la documentación.
- GPU recomendadas: no especificadas por el autor; el ejemplo usa `pipe.to("cuda")` sin indicar modelo de tarjeta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: Diffusers (`ModularPipelineBlocks` con `diffusers>=0.41.0` y `transformers>=5.3.0`), PyTorch, NumPy, Pillow y scikit-image; `trimesh` para exportar la malla. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles; el ejemplo de referencia emplea 30 pasos de inferencia con resolución de octree 380, pero no se publican tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia de pesos | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/hunyuan3d_2mini_custom_blocks (este) | Bloques modulares Diffusers sobre Hunyuan3D-2mini | Imagen RGBA | Malla 3D sin textura | Apache-2.0 (bloques) / Tencent Hunyuan 3D 2.0 Community License (pesos) | HuggingFace, 15 descargas |
| tencent/Hunyuan3D-2mini | Modelo original de difusión image-to-3D | Imagen | Malla 3D sin textura | Tencent Hunyuan 3D 2.0 Community License | HuggingFace (modelo base) |
| OzzyGT/hunyuan3d_2mini_turbo | Checkpoint destilado por pasos del mismo modelo | Imagen RGBA | Malla 3D sin textura | Tencent Hunyuan 3D 2.0 Community License | HuggingFace |
| OzzyGT/hunyuan3d_2mini_fast | Checkpoint destilado en guiado del mismo modelo | Imagen RGBA | Malla 3D sin textura | Tencent Hunyuan 3D 2.0 Community License | HuggingFace |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos competidores de otros desarrolladores (por ejemplo, alternativas de image-to-3D de otros laboratorios) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de repositorios externos (`components_repo`) cuya disponibilidad y versionado puede cambiar sin que este repositorio se actualice.
- Requiere `trust_remote_code=True` y `trust_components_code=True`, lo que ejecuta código Python descargado del Hub; el autor advierte de revisar el código antes de usarlo con repositorios de terceros.
- Los pesos están bajo la Tencent Hunyuan 3D 2.0 Community License, no Apache-2.0; es imprescindible revisar `LICENSE` y `NOTICE` de cada repositorio de checkpoints antes de un uso comercial. La licencia Apache-2.0 solo cubre los bloques de este repositorio.
- La salida es geometría sin textura ni materiales; no sustituye a un pipeline completo de texturizado.
- La calidad de la malla depende de la resolución de octree: valores bajos producen geometrías toscas y valores altos incrementan el coste computacional y el número de triángulos.
- La entrada debe ser una imagen de un único objeto con fondo transparente; el pipeline recorta por el canal alfa, por lo que imágenes sin alfa o con varios objetos pueden dar resultados deficientes.
- Riesgo de alucinación geométrica: como modelo generativo, puede producir partes no visibles en la imagen de referencia con formas plausibles pero incorrectas.
- Idiomas: la etiqueta del repositorio es `en` y no hay componente de texto, por lo que la noción de multilingüismo no aplica.
- No se documentan sesgos específicos del modelo base ni evaluaciones de robustez en la información disponible.
- El repositorio es muy reciente y con 15 descargas y 0 likes, por lo que carece de validación comunitaria amplia; conviene probarlo en el caso de uso concreto antes de integrarlo en producción.

## Enlaces

- Repositorio de bloques: https://huggingface.co/OzzyGT/hunyuan3d_2mini_custom_blocks
- Modelo base original: https://huggingface.co/tencent/Hunyuan3D-2mini
- Checkpoint turbo: https://huggingface.co/OzzyGT/hunyuan3d_2mini_turbo
- Checkpoint fast: https://huggingface.co/OzzyGT/hunyuan3d_2mini_fast
- Checkpoint base: https://huggingface.co/OzzyGT/hunyuan3d_2mini_base
- Imágenes de ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples
