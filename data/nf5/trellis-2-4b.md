# nf5/TRELLIS.2-4B

## Resumen

TRELLIS.2-4B es un modelo generativo 3D de gran escala desarrollado por Microsoft Research para la generacion de activos 3D de alta fidelidad a partir de una unica imagen (image-to-3D). Emplea una representacion novedosa denominada O-Voxel, una estructura de voxeles dispersos "libre de campos" que codifica simultaneamente geometria y apariencia, junto con un transformer de flow-matching de 4 mil millones de parametros. A diferencia de metodos anteriores basados en campos de iso-superficie (SDF, Flexicubes), TRELLIS.2 puede reconstruir y generar activos 3D arbitrarios con topologias complejas, bordes definidos y materiales PBR completos, incluyendo transparencia y translucidez.

El modelo esta entrenado para generar activos completamente texturizados a resoluciones de hasta 1536³, con un VAE 3D disperso que aplica un downsampling espacial de 16×, codificando un activo de 1024³ en aproximadamente 9.600 tokens latentes con una degradacion perceptual despreciable. Se distribuye bajo licencia MIT y esta disponible en Hugging Face, con repositorio oficial en GitHub y articulo en arXiv (2512.14692). Su relevancia actual radica en combinar fidelidad, compactacion y velocidad: genera un activo completo con materiales PBR en unos 17 segundos a resolucion 1024³ en una GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching transformer con VAE 3D de voxeles dispersos |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de generacion 3D, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (documentacion); el modelo procesa imagenes como entrada |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio PyTorch, 16.2 GB) |

## Arquitectura y entrenamiento

TRELLIS.2-4B combina un VAE 3D disperso basado en voxeles con un transformer de flow-matching de 4B parametros. La representacion central es el O-Voxel, una estructura "omni-voxel" que codifica geometria y apariencia de forma unificada, soportando topologia arbitraria (superficies abiertas, geometria no manifold y estructuras completamente cerradas) sin conversion con perdidas. El VAE aplica un downsampling espacial de 16×, de modo que un activo de 1024³ se comprime a unos 9.600 tokens latentes con degradacion perceptual minima. La conversion bidireccional entre mallas y O-Voxels es instantanea y sin optimizacion (de milisegundos a segundos).

El modelo se entrena para generar activos texturizados a resoluciones de 512³, 1024³ y 1536³. No se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero total de tokens vistos ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion disponible. El modelo se presenta como un modelo fundacional pre-entrenado, sin alineacion con preferencias humanas ni fine-tuning estetico.

## Capacidades

- Generacion de activos 3D completos (malla con materiales PBR) a partir de una unica imagen.
- Soporte de topologias arbitrarias: superficies abiertas, geometria no manifold y estructuras cerradas.
- Materiales PBR completos, incluyendo opacidad para superficies translucidas.
- Generacion de texturas condicionadas por forma: puede texturizar mallas 3D de entrada usando una imagen de referencia.
- Resolucion de salida configurable: 512³, 1024³ y 1536³ de resolucion de voxeles.
- Conversion bidireccional eficiente entre mallas y O-Voxels sin optimizacion.
- Exportacion a formatos estandar como GLB con texturas de hasta 4096 píxeles.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Creacion de activos para videojuegos: un artista puede generar una malla con materiales PBR completos a partir de un concepto o fotografia de referencia, reduciendo el tiempo de modelado manual de horas a minutos. El modelo produce geometria con topologia arbitraria, adecuada para props, escenarios y personajes.
- Visualizacion de producto para comercio electronico: a partir de una unica fotografia de un producto, se genera un modelo 3D con materiales PBR que puede integrarse en visores web interactivos o catalogos AR, permitiendo al cliente inspeccionar el producto desde cualquier angulo.
- Preproduccion de VFX y cine: los equipos de arte pueden generar rapidamente activos 3D de referencia para storyboards, previzualizacion o sustitucion de objetos en escenas, acelerando el pipeline creativo antes del modelado final.
- Impresion 3D: aunque el modelo puede producir pequenos agujeros en la geometria, los scripts de post-procesado incluidos (relleno de huecos) permiten obtener mallas estancas aptas para fabricacion aditiva.
- Creacion de contenido para AR/VR: generacion de objetos 3D interactivos a partir de fotografias para experiencias de realidad aumentada o entornos virtuales, con materiales PBR que mantienen coherencia visual bajo diferentes condiciones de iluminacion.
- Digital twins y catalogacion de patrimonio: conversion de fotografias de objetos fisicos en modelos 3D para archivos digitales, documentacion tecnica o gemelos digitales de maquinaria y piezas industriales.
- Prototipado rapido en diseno industrial: los disenadores pueden generar variantes 3D de un producto a partir de bocetos o imagenes de referencia para evaluar formas y materiales antes de invertir en modelado CAD detallado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que se trata de un modelo de generacion 3D y no de lenguaje. La model card del autor proporciona datos de velocidad de inferencia en GPU NVIDIA H100:

| Resolucion de voxeles | Tiempo de generacion total (forma + material) |
| :--- | :--- |
| 512³ | ~3 segundos |
| 1024³ | ~17 segundos |
| 1536³ | ~60 segundos |

## Requisitos de hardware

- VRAM minima: 24 GB de memoria GPU (requisito declarado por el autor).
- GPUs verificadas: NVIDIA A100 y H100.
- No se indica compatibilidad con GPUs de consumo (RTX 4090, etc.); el requisito de 24 GB sugiere que una RTX 4090 (24 GB) podria ser suficiente, pero no esta verificado oficialmente.
- Sistema operativo: solo Linux (probado).
- Software: CUDA Toolkit 12.4 recomendado, Conda para gestion de dependencias, Python 3.8 o superior.
- Opciones de despliegue: el modelo se ejecuta mediante la libreria `trellis2` con pipeline Python (`Trellis2ImageTo3DPipeline`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: ~3 s (512³), ~17 s (1024³) y ~60 s (1536³) en H100, segun datos del autor.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks comparativos con otros modelos image-to-3D. Como referencia cualitativa, los principales alternativas en la misma categoria son:

| Modelo | Parametros | Representacion | Salida | Licencia |
| :--- | :--- | :--- | :--- | :--- |
| TRELLIS.2-4B | 4B | O-Voxel (voxeles dispersos) | Malla + PBR, hasta 1536³ | MIT |
| TripoSR | ~0.7B | Transformer + reconstruction | Malla, resolucion moderada | MIT |
| Hunyuan3D 2.0 | no disponible | VAE + diffusion | Malla + PBR | no disponible |
| InstantMesh | no disponible | Multi-view + reconstruction | Malla | MIT |

No se dispone de datos cuantitativos de rendimiento (PSNR, FID, etc.) para una comparacion rigurosa en la informacion disponible.

## Limitaciones y advertencias

- Artefactos geometricos: las mallas generadas pueden contener pequenos agujeros o discontinuidades topologicas menores. Para aplicaciones que requieran geometria estanca (impresion 3D), se incluyen scripts de post-procesado como algoritmos de relleno de huecos.
- Sin alineacion con preferencias humanas: TRELLIS.2-4B es un modelo fundacional pre-entrenado, sin RLHF ni fine-tuning estetico. Los resultados reflejan la distribucion de los datos de entrenamiento y pueden variar en estilo; puede requerir experimentacion con las entradas para obtener el resultado artistico deseado.
- Requisitos de hardware elevados: necesita al menos 24 GB de VRAM, lo que excluye GPUs de consumo de gama baja y media.
- Solo Linux: el modelo solo ha sido probado en sistemas Linux; no hay soporte oficial para Windows o macOS.
- Dependencias de compilacion: requiere CUDA Toolkit (recomendado 12.4) para compilar ciertos paquetes, lo que anade complejidad al despliegue.
- Idioma: la documentacion y el codigo de ejemplo estan en ingles; no hay soporte multilingue.
- Sin capacidades de texto: el modelo no procesa instrucciones de texto ni soporta tool calling; la entrada es exclusivamente una imagen.

## Enlaces

- Repositorio Hugging Face (modelo consultado): https://huggingface.co/nf5/TRELLIS.2-4B
- Repositorio Hugging Face oficial: https://huggingface.co/microsoft/TRELLIS.2-4B
- Articulo arXiv: https://arxiv.org/abs/2512.14692
- Repositorio GitHub: https://github.com/microsoft/TRELLIS.2
- Pagina del proyecto: https://microsoft.github.io/TRELLIS.2
- Pagina en Microsoft Research Workbench: https://www.microsoft.com/en-us/research/workbench/project/trellis
