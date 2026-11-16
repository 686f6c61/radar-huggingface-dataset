# KumaPower/DeFLOCNet

## Resumen

DeFLOCNet es un modelo de inpainting de imagenes (image-to-image) desarrollado por KumaPower, basado en el metodo DeFLOCNet publicado en CVPR 2021. Su funcion es restaurar regiones enmascaradas de una imagen de 256 × 256 pixeles, permitiendo que el usuario guie la reconstruccion mediante una mascara blanca y, opcionalmente, lineas de boceto y colores dispersos. La arquitectura interna se denomina `sd_color_v2` y se distribuye como checkpoints de generador en FP32 para inferencia.

El modelo se publica con dos checkpoints diferenciados: uno especializado en rostros y retratos cercanos, entrenado sobre recortes faciales del dataset HDTF hasta el paso 10.000, y otro orientado a escenas generales (paisajes, edificios y fotografias cotidianas), entrenado con imagenes mixtas de Places2, Unsplash, T2I y HDTF hasta el paso 23.500. Ambos comparten arquitectura y se ofrecen como pesos PyTorch descargables, con una demo publica en Hugging Face Spaces.

Es relevante por su enfoque de edicion guiada por boceto y color, que va mas alla del inpainting clasico de relleno automatico, y por estar disponible como implementacion abierta de un metodo academico de CVPR. No obstante, la informacion publica es limitada: no se detallan parametros, licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sd_color_v2` (red de inpainting guiada por mascara, boceto y color) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (resolucion fija de 256 × 256 pixeles) |
| Tipos de cuantizacion | no disponible (checkpoints distribuidos en FP32) |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoints PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se identifica en la model card como `sd_color_v2`, compartida por ambos checkpoints. Se trata de una red de inpainting condicionada por mascara y, opcionalmente, por bocetos y colores dispersos, que opera sobre entradas de 256 × 256 pixeles. Los pixeles marcados en blanco en la mascara son los que se rellenan; el resto se copia directamente de la imagen de entrada. El metodo original DeFLOCNet fue presentado en CVPR 2021 (arXiv:2103.12723).

El entrenamiento se dividio en dos variantes. El checkpoint de retratos se entreno sobre recortes faciales de HDTF hasta el paso 10.000. El checkpoint de escenas generales se entreno con una mezcla de Places2, Unsplash, imagenes generadas por T2I y HDTF hasta el paso 23.500. No se especifican en la informacion disponible el numero total de tokens o imagenes, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables directamente a este tipo de modelo). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Inpainting de imagenes a resolucion fija de 256 × 256 pixeles.
- Restauracion de regiones enmascaradas definidas por una mascara blanca.
- Edicion guiada por boceto: el usuario puede aportar lineas de dibujo para dirigir la reconstruccion.
- Edicion guiada por color: admite colores dispersos como pistas para el relleno.
- Dos modos especializados: retratos/rostros y escenas generales (paisajes, edificios, fotografia cotidiana).
- Conservacion de los pixeles fuera de la mascara, copiados de la imagen de entrada.
- No dispone de capacidades de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues, al ser un modelo puramente de imagen a imagen.

## Casos de uso

- Restauracion de retratos danados: con el checkpoint HDTF se pueden rellenar zonas ocluidas o deterioradas en rostros recortados, usando la mascara para delimitar la region y lineas de boceto para mantener la estructura facial.
- Eliminacion de objetos en fotografias: con el checkpoint general se enmascara el objeto no deseado y el modelo reconstruye el fondo (paisajes, edificios) de forma coherente con el entorno.
- Edicion creativa guiada por boceto: un ilustrador puede dibujar lineas sobre una region enmascarada para indicar la forma deseada y dejar que el modelo complete texturas y color.
- Relleno de huecos en pipelines de retoque fotografico: integracion en flujos de edicion donde se requiere completar pequenas regiones faltantes antes de un postprocesado mayor.
- Prototipado de edicion de imagenes: la demo DeFLOCNet Studio permite comparar ambos checkpoints sobre la misma imagen, mascara y semilla, util para evaluar cual conviene antes de integrarlo.
- Investigacion en inpainting guiado: sirve como implementacion de referencia del metodo DeFLOCNet (CVPR 2021) para experimentos academicos con mascara, boceto y color.
- Generacion de variaciones controladas en 256 × 256: util en tareas de aumento de datos o sintesis de parches donde se necesita rellenar regiones con control espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio es de 0,7 GB y los checkpoints se distribuyen en FP32, lo que sugiere un modelo de escala moderada apto para GPU de consumo, aunque no se confirma.
- GPU recomendadas: no disponible; por el tamano del repositorio y la resolucion de 256 × 256, es probable que quepa en GPUs de consumo tipo RTX 3060 o superiores, pero no hay dato confirmado.
- Compatibilidad con GPU de consumo: probable, sin confirmacion en la informacion disponible.
- Opciones de despliegue: inferencia local mediante PyTorch siguiendo las instrucciones del repositorio de GitHub (linea de comandos); demo en Hugging Face Spaces (DeFLOCNet Studio). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Resolucion fija de 256 × 256 pixeles; no admite entradas de mayor resolucion sin redimensionado previo.
- Solo rellena los pixeles blancos de la mascara; el resto se copia de la entrada, lo que limita la coherencia global si la mascara es muy grande.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no disponibles: al ser un modelo de imagen, esta fila no aplica, pero se indica por transparencia.
- No se detallan sesgos conocidos ni riesgos de alucinacion especificos; en modelos generativos de imagen existe riesgo de artefactos y de reconstrucciones poco fieles en regiones ambiguas.
- No hay informacion sobre el numero de parametros, datos de entrenamiento completos ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- El checkpoint de retratos esta especializado en rostros recortados; usarlo en escenas generales puede dar resultados pobres, y viceversa.
- Fecha de creacion del repositorio (2026-11-16) y ausencia de descargas y likes: modelo muy reciente y sin validacion comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/KumaPower/DeFLOCNet
- Demo (DeFLOCNet Studio): https://huggingface.co/spaces/KumaPower/DeFLOCNet-Studio
- Repositorio GitHub: https://github.com/KumapowerLIU/DeFLOCNet
- Instrucciones de inferencia: https://github.com/KumapowerLIU/DeFLOCNet#command-line-inference
- Paper (arXiv): https://arxiv.org/abs/2103.12723
