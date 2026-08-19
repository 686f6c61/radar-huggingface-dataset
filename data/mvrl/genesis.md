# MVRL/genesis

## Resumen

Genesis es un motor generativo para síntesis jerárquica de imágenes satelitales, desarrollado por el equipo MVRL de la Universidad de Washington en St. Louis (Khanal, Cui, Cher, Xing, Wei, Sastry y Jacobs). Se presentó como ponencia oral en ACM SIGSPATIAL 2026. El modelo resuelve el problema de completar un conjunto disperso de teselas (tiles) satelitales semilla hasta formar un quadtree completo de Web-Mercator, rellenando todas las escalas y ubicaciones. Utiliza dos operadores de flow-matching denominados JiT: un modelo de super-resolución condicionado por el padre (una tesela 256×256 genera el mosaico 512×512 de sus cuatro hijos) y un modelo de outpainting basado en máscaras (completado de 256×256 bajo máscaras de cuadrante). Compuestos en un motor piramidal, llevan las semillas a un nivel de trabajo común, completan ese nivel mediante outpainting voraz, super-resuelven hasta las hojas y rellenan los niveles gruesos por submuestreo, logrando una pirámide consistente entre escalas. Los modelos se entrenaron sobre el corpus global de teselas Git-10M. El repositorio incluye checkpoints en dos tamaños (B/16 y H/16) para cada operador, con 50 pasos de flow-matching y cfg=1.0, y pesos EMA. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching con operadores JiT (super-resolucion y outpainting); condicionamiento con DINOv3 para SR |
| Parametros totales | No disponible (solo se indican tamanos de archivo: 3.3 GB, 23 GB, 3.6 GB, 26 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | No disponible (checkpoints en precision completa, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (modelo de imagenes) |
| Licencia | MIT |
| Formato de pesos | .ckpt (PyTorch) |

## Arquitectura y entrenamiento

Genesis emplea dos operadores de flow-matching con arquitectura JiT (no se detalla el significado de las siglas ni la estructura interna completa). El operador de super-resolucion (SR) toma una tesela padre de 256×256 y genera el mosaico 512×512 de sus cuatro hijos, condicionado por un encoder congelado DINOv3 ViT-L/16 (SAT-493M) y optimizado con perdida LPIPS. El operador de outpainting (OP) completa una tesela de 256×256 bajo mascaras de cuadrante, sin condicionamiento DINO. Ambos se entrenaron durante 800.000 pasos sobre el corpus Git-10M, un conjunto global de teselas satelitales en proyeccion Web-Mercator. El muestreo se realiza con 50 pasos de flow-matching y cfg=1.0, cargando pesos EMA. No se proporcionan detalles adicionales sobre el dataset, la composicion exacta del corpus ni el proceso de entrenamiento.

## Capacidades

- Super-resolucion de teselas satelitales de 256×256 a 512×512, generando el mosaico de cuatro hijos en el siguiente nivel de zoom.
- Outpainting por cuadrantes: completa regiones faltantes de una tesela de 256×256 bajo mascaras de cuadrante.
- Composicion piramidal: genera un quadtree completo de Web-Mercator a partir de semillas dispersas, consistente entre escalas y que respeta las teselas originales.
- Generacion de multiples niveles de zoom (hasta 6 niveles en las demos).
- Integracion con teselas reales de Esri World Imagery (via red).
- No tiene capacidades de texto, vision general ni multimodales; es exclusivamente un modelo de imagen a imagen para teledeteccion.

## Casos de uso

- Generacion de mapas completos a partir de semillas: un usuario coloca unas pocas teselas reales en un visor y Genesis rellena el resto de la piramide, util para visualizacion rapida de zonas sin cobertura cartografica.
- Super-resolucion de imagenes satelitales: mejorar la resolucion de teselas existentes para analisis de detalle en agricultura, urbanismo o monitorizacion ambiental.
- Outpainting para completar huecos en mosaicos: rellenar regiones sin datos (nubes, fallos de captura o areas fuera del encuadre) con contenido plausible y coherente con el contexto.
- Creacion de piramides de zoom para visores web: generar automaticamente todos los niveles de zoom de un area a partir de unas pocas teselas, reduciendo costes de almacenamiento y adquisicion de datos.
- Aumento de datos para entrenar otros modelos de teledeteccion: generar variaciones sinteticas de teselas para mejorar la robustez de modelos de clasificacion o deteccion de objetos.
- Investigacion en sintesis jerarquica: servir como referencia para metodos de generacion condicionada por estructura de quadtree y flow-matching aplicado a imagenes geoespaciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona que el paper evalua en Git-10M, pero no se proporcionan numeros concretos en la model card.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni de GPU.
- Los checkpoints B/16 pesan entre 3.3 y 3.6 GB (SR y OP respectivamente), por lo que en fp32 podrian caber en GPUs con 8-12 GB de VRAM, aunque no hay confirmacion oficial.
- Los checkpoints H/16 pesan 23-26 GB, lo que sugiere que requieren GPUs con 32 GB o mas (por ejemplo, A100, H100) o cuantizacion (no publicada).
- El script de ejemplo usa Python 3.13, torch 2.8 cu128 y CUDA si esta disponible; tambien puede ejecutarse en CPU, aunque con rendimiento muy limitado.
- Opciones de despliegue: el repositorio incluye demos Gradio y scripts de evaluacion; no se menciona soporte para vLLM, llama.cpp u Ollama, al tratarse de un modelo de imagen y no de texto.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye comparaciones con otros modelos de super-resolucion o outpainting satelital.

## Limitaciones y advertencias

- Modelo de investigacion, no validado para uso en produccion critica.
- Solo trabaja con teselas satelitales en proyeccion Web-Mercator; no es un modelo de proposito general.
- La generacion puede producir contenido plausible pero no verificado; existe riesgo de alucinacion en zonas sin datos o con cobertura parcial.
- No se han documentado sesgos especificos, pero el entrenamiento en Git-10M puede reflejar sesgos geograficos o de cobertura (por ejemplo, sobrerrepresentacion de regiones urbanas o de latitudes medias).
- Los checkpoints son grandes (hasta 26 GB) y requieren hardware potente para inferencia en tiempos razonables.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias.
- No hay informacion sobre cuantizacion ni formatos optimizados para despliegue ligero en dispositivos de baja capacidad.

## Enlaces

- HuggingFace: https://huggingface.co/MVRL/genesis
- Pagina del proyecto: https://subash-khanal.github.io/genesis
- arXiv: "coming soon" (no disponible)
- Codigo: https://github.com/mvrl/genesis
- Documentacion de evaluacion: https://github.com/mvrl/genesis/blob/main/docs/EVALUATION.md
