# chibifire/TRELLIS.2-4B

## Resumen

TRELLIS.2-4B es un modelo generativo de 3D de 4.000 millones de parámetros desarrollado por Microsoft. Su objetivo es convertir una imagen única en un activo tridimensional de alta fidelidad, incluyendo malla y materiales PBR (physical-based rendering). El modelo resuelve el problema de la generacion de geometrias complejas, como superficies abiertas o estructuras no manifold, que los metodos basados en campos de iso-superficie (SDF, Flexicubes) no gestionan bien.

Arquitectonicamente combina un transformer de flow matching con un VAE 3D disperso basado en una representacion denominada O-Voxel. Esta estructura codifica tanto geometria como apariencia de forma compacta, con un downsampling espacial de 16x. Puede generar activos con resoluciones de voxel desde 512³ hasta 1536³, lo que lo hace relevante para aplicaciones que requieren detalle y materiales translucidos. Se distribuye bajo licencia MIT y esta disponible en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching transformer con VAE 3D disperso basado en O-Voxel |
| Parametros totales | 4.000 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generacion 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (la entrada es una imagen, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo utiliza un transformer de flow matching de 4.000 millones de parametros acoplado a un VAE 3D disperso. La representacion central es el O-Voxel, una estructura de voxels dispersos "field-free" que codifica geometria y apariencia de forma nativa. A diferencia de los campos de iso-superficie, el O-Voxel permite representar topologias arbitrarias, incluyendo superficies abiertas, geometria no manifold y estructuras completamente cerradas, sin conversion con perdidas.

El VAE 3D aplica un downsampling espacial de 16x: un activo de 1024³ se codifica en aproximadamente 9.600 tokens latentes con una degradacion perceptual minima. El modelo se entrena para generar texturas condicionadas por la forma de la malla y la imagen de referencia. No se han publicado detalles sobre la composicion del dataset de entrenamiento ni sobre el numero de tokens de entrenamiento. Segun la documentacion, el modelo es un modelo base pre-entrenado que no ha sido alineado con preferencias humanas mediante RLHF ni ajustado para esteticas especificas.

## Capacidades

- Generacion de activos 3D completos a partir de una imagen unica, incluyendo malla y materiales PBR.
- Soporte de topologias complejas: superficies abiertas, geometria no manifold y estructuras cerradas.
- Representacion de materiales con opacidad, permitiendo superficies translucidas.
- Generacion de texturas condicionadas por la forma de una malla de entrada y una imagen de referencia.
- Resolucion de salida configurable desde 512³ hasta 1536³ de resolucion de voxel.
- Conversion bidireccional instantanea entre mallas y O-Voxels, sin optimizacion.
- Inferencia rapida: en una NVIDIA H100, genera un activo de 512³ en aproximadamente 3 segundos, 1024³ en 17 segundos y 1536³ en 60 segundos.
- Exportacion a formatos estandar como GLB con texturas.

## Casos de uso

- Generacion de assets 3D para videojuegos: a partir de una imagen conceptual, el modelo produce una malla con materiales PBR lista para integrarse en motores como Unity o Unreal. Su soporte de topologias complejas evita problemas con geometria abierta, como ropa o cortinas.
- Prototipado rapido en diseño industrial: los diseñadores pueden convertir bocetos o renders en modelos 3D explorables en minutos, acelerando la iteracion sobre formas y materiales.
- Visualizacion arquitectonica: genera modelos de elementos arquitectonicos o mobiliario a partir de fotografias, incluyendo materiales translucidos como vidrio, para su uso en presentaciones o recorridos virtuales.
- E-commerce de productos fisicos: permite crear modelos 3D de productos a partir de fotos de referencia, facilitando la visualizacion interactiva en tiendas online sin necesidad de escaneo manual.
- Investigacion en vision por computador y robotica: sirve como fuente de datos sinteticos con materiales realistas y topologia variada para entrenar sistemas de percepcion 3D o simulacion.
- Efectos visuales y animacion: los artistas pueden generar geometria inicial a partir de concept art y refinarla posteriormente, reduciendo el tiempo de modelado manual en producciones cinematograficas.
- Generacion de contenido para realidad virtual y aumentada: produce activos 3D optimizados con texturas PBR que pueden desplegarse en entornos inmersivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es de texto. La informacion disponible incluye tiempos de inferencia medidos en una NVIDIA H100:

| Resolucion de voxel | Tiempo de inferencia (H100) |
|---|---|
| 512³ | ~3 segundos |
| 1024³ | ~17 segundos |
| 1536³ | ~60 segundos |

No se dispone de datos comparativos con otros modelos de image-to-3D en la informacion proporcionada.

## Requisitos de hardware

- VRAM minima: 24 GB de memoria de GPU. El modelo ha sido verificado en NVIDIA A100 y H100.
- GPU recomendadas: NVIDIA A100 o H100. No se menciona soporte para GPUs de consumo como RTX 4090.
- Sistema operativo: solo Linux. Se requiere CUDA Toolkit, version recomendada 12.4.
- Software: Python 3.8 o superior, Conda recomendado para gestionar dependencias.
- Despliegue: el modelo se ejecuta mediante el pipeline de Python de la libreria `trellis2`, no se mencionan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia: los tiempos de inferencia en H100 varian entre 3 y 60 segundos segun la resolucion de salida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos con otros modelos de generacion de 3D de tamano similar o misma tarea.

## Limitaciones y advertencias

- La malla generada puede contener pequenos agujeros o discontinuidades topologicas menores. Para aplicaciones que requieran geometria estanca, como impresion 3D, se deben aplicar algoritmos de post-procesado de relleno de agujeros.
- El modelo es un modelo base sin alineacion con preferencias humanas. No ha sido ajustado mediante RLHF ni entrenado para esteticas especificas, por lo que la calidad estilistica de los resultados puede variar y requerir experimentacion con las entradas.
- La salida refleja la distribucion de los datos de entrenamiento, por lo que puede presentar sesgos hacia ciertos tipos de objetos o estilos visuales.
- Requiere una GPU con al menos 24 GB de memoria, lo que limita su uso en hardware de consumo o entornos con recursos reducidos.
- Solo se ha probado en Linux, lo que puede dificultar su integracion en entornos Windows o macOS.
- No se han publicado pesos cuantizados, por lo que el despliegue en dispositivos con memoria limitada no es viable con la informacion disponible.

## Enlaces

- HuggingFace (modelo del autor): [https://huggingface.co/chibifire/TRELLIS.2-4B](https://huggingface.co/chibifire/TRELLIS.2-4B)
- HuggingFace (modelo oficial de Microsoft): [https://huggingface.co/microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B)
- Paper: [https://arxiv.org/abs/2512.14692](https://arxiv.org/abs/2512.14692)
- Repositorio: [https://github.com/microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2)
- Pagina del proyecto: [https://microsoft.github.io/TRELLIS.2](https://microsoft.github.io/TRELLIS.2)
