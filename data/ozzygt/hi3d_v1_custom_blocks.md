# OzzyGT/hi3d_v1_custom_blocks

## Resumen

Hi3D v1.0 es un modelo de generacion 3D condicionada por imagen que refina una malla poligonal gruesa y sin texturas a partir de una imagen del objeto. Este repositorio concreto, `OzzyGT/hi3d_v1_custom_blocks`, no contiene pesos: empaqueta los bloques de pipeline modular de Diffusers necesarios para ejecutar los pesos oficiales alojados en `hi3d-official/Hi3Dv1.0` y `OzzyGT/hi3d_v1`. Lo desarrolla el usuario OzzyGT como adaptacion del modelo base Hi3D v1.0, y su relevancia radica en que permite integrar el refinado de mallas dentro del ecosistema estandar de Diffusers con `ModularPipelineBlocks`.

El modelo resuelve el paso de "refinamiento de geometria": recibe una imagen RGBA del objeto sobre fondo transparente y una malla coarse (por ejemplo, la salida de Hunyuan3D-2mini turbo) y devuelve una malla de mayor detalle. La resolucion de extraccion de superficie es configurable (512, 1024 por defecto, 1536), lo que permite intercambiar calidad por velocidad. El pipeline esta etiquetado como `image-to-3d` y esta pensado para flujos de reconstruccion 3D asistida por imagen.

El repositorio es ligero (solo codigo, sin pesos) y esta publicado bajo Apache-2.0, aunque los pesos del modelo base se rigen por la Hi3D Open License Agreement Version 1.0. La informacion publica disponible es escasa: no se detallan parametros, arquitectura interna ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusion para refinado de mallas 3D; extraccion de superficie mediante FlexiCubes) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo imagen-a-3D, no textual) |
| Tipos de cuantizacion | No disponible; el ejemplo oficial carga componentes en `torch.float16` |
| Idiomas soportados | Ingles (etiqueta `en`; el condicionamiento es visual, no textual) |
| Licencia | Codigo de los bloques: Apache-2.0; pesos del modelo base: Hi3D Open License Agreement Version 1.0 |
| Formato de pesos | No disponible en este repositorio (no contiene pesos); salida en mallas exportables a GLB via trimesh |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna, el numero de parametros, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base Hi3D v1.0 en la informacion proporcionada. Lo que si se documenta es la integracion tecnica: el repositorio implementa bloques de pipeline modular de Diffusers (`ModularPipelineBlocks`) que orquestan el refinado de una malla coarse condicionado por una imagen. La extraccion de superficie utiliza una adaptacion de FlexiCubes de NVIDIA, incluida en el repositorio bajo Apache-2.0.

El flujo de inferencia requiere PyTorch, `diffusers>=0.41.0`, `transformers>=5.3.0`, `numpy`, `pillow` y `pyfqmr`. El ejemplo oficial usa `trust_remote_code=True` y `trust_components_code=True`, lo que implica ejecutar codigo descargado del Hub. La resolucion por defecto es 1024, con opciones de 512 (mas rapido, menos detalle) y 1536 (mas detalle). No se especifican innovaciones como decodificacion especulativa ni attention linear, por no estar disponibles.

## Capacidades

- Refinado de mallas 3D: convierte una malla coarse sin texturas en una malla de mayor detalle guiada por una imagen del objeto.
- Condicionamiento por imagen: utiliza una imagen RGBA con fondo transparente como referencia visual de la forma.
- Resolucion configurable: 512, 1024 (por defecto) y 1536 para controlar el equilibrio detalle/velocidad.
- Extraccion de superficie con FlexiCubes: genera mallas exportables (por ejemplo, a GLB mediante trimesh).
- Integracion con Diffusers modular: se instancia como `ModularPipelineBlocks` y se compone con otros bloques del ecosistema.
- Encadenamiento con otros modelos: documentado para usarse tras la salida de Hunyuan3D-2mini turbo como paso de refinamiento.
- Soporte de semilla: acepta `torch.Generator` con semilla fija para reproducibilidad.
- No se documentan capacidades de texto, codigo, matematicas, vision general, tool calling ni agentes.

## Casos de uso

- Refinado de assets en pipelines de generacion 3D: tomar la malla coarse producida por Hunyuan3D-2mini turbo y pasarla por este modelo para obtener una malla mas detallada antes de exportar a GLB, integrándose como etapa intermedia en un flujo automatizado.
- Prototipado rapido de videojuegos y realidad aumentada: generar mallas de objetos a partir de una sola imagen de referencia y refinarlas a resolucion 1024 para su uso como assets preliminares.
- Reconstruccion asistida en escaneo 3D: usar una imagen del objeto junto con una malla coarse inicial para mejorar la geometria en flujos de digitalizacion de objetos fisicos.
- Catalogos de e-commerce en 3D: convertir fotos de producto sobre fondo transparente en mallas refinadas para visores 3D web, ajustando la resolucion a 512 para previsualizaciones rapidas.
- Investigacion en generacion 3D: servir como bloque reproducible (semilla fija, resolucion configurable) para experimentos comparativos de refinado de mallas dentro de Diffusers.
- Educacion y demos tecnicas: ilustrar el uso de `ModularPipelineBlocks` y la extraccion FlexiCubes en talleres o tutoriales de difusion 3D.
- Automatizacion de post-proceso de mallas: integrar el refinado como paso programatico en scripts que cargan una malla con trimesh, la refinan y la exportan, con control de detalle mediante el parametro `resolution`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo oficial carga los componentes en `torch.float16` y mueve el pipeline a CUDA.
- GPU recomendadas: no especificadas en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la resolucion 512 reduce el coste frente a 1024 y 1536, pero no se aportan cifras de memoria.
- Opciones de despliegue: via `diffusers` (ModularPipelineBlocks) con PyTorch; requiere `diffusers>=0.41.0` y `transformers>=5.3.0`.
- Latencia y throughput: no disponibles.
- Dependencias adicionales: `numpy`, `pillow`, `pyfqmr` y, en el ejemplo, `trimesh` para carga y guardado de mallas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D v1.0 (este repositorio de bloques) | Refinado imagen-a-3D | No disponible | No aplica | Codigo Apache-2.0; pesos Hi3D Open License 1.0 | Hugging Face (bloques + pesos en repos separados) |
| Hunyuan3D-2mini | Generacion 3D imagen-a-malla | No disponible | No aplica | No disponible en la informacion | Hugging Face (bloques `hunyuan3d_2mini_custom_blocks`) |
| Alternativas adicionales | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada es funcional: Hunyuan3D-2mini turbo genera la malla coarse que este modelo refina; no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: sin el repositorio de pesos `OzzyGT/hi3d_v1` (bajo Hi3D Open License 1.0) el pipeline no es funcional.
- La licencia de los pesos (Hi3D Open License Agreement Version 1.0) difiere de la Apache-2.0 del codigo; es necesario revisar `LICENSE` y `NOTICE` antes de uso comercial.
- `trust_remote_code=True` y `trust_components_code=True` ejecutan codigo descargado del Hub; solo deben usarse con repositorios de confianza y tras revisar el codigo.
- El condicionamiento requiere imagenes con fondo transparente (RGBA); imagenes sin transparencia pueden degradar el resultado.
- Depende de una malla coarse de entrada; la calidad final esta acotada por la calidad de esa malla inicial.
- Solo se declara soporte de ingles en metadatos; no hay informacion sobre sesgos, riesgo de alucinacion geometrica ni limitaciones de idioma.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Resoluciones altas (1536) incrementan el coste computacional y de memoria; no se aportan cifras de VRAM.
- No se documentan limitaciones especificas de sesgo ni de produccion mas alla de las anteriores.

## Enlaces

- Repositorio de bloques en Hugging Face: https://huggingface.co/OzzyGT/hi3d_v1_custom_blocks
- Modelo base oficial: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Repositorio de pesos y codigo del modelo: https://huggingface.co/OzzyGT/hi3d_v1
- Bloques de Hunyuan3D-2mini (generador de malla coarse): https://huggingface.co/OzzyGT/hunyuan3d_2mini_custom_blocks
- Sitio oficial Hi3D: http://hi3d.ai/
- FlexiCubes (NVIDIA): https://github.com/nv-tlabs/FlexiCubes
- Dataset de ejemplos de Diffusers: https://huggingface.co/datasets/OzzyGT/diffusers-examples
