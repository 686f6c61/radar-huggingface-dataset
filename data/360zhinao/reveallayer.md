# 360ZhiNao/RevealLayer

## Resumen

RevealLayer es un modelo de descomposición de imágenes por capas desarrollado por 360 AI Research en colaboración con la Universidad de Wenzhou, presentado en ICML 2026. Su función consiste en tomar una única imagen RGB y descomponerla en múltiples capas RGBA, separando de forma explícita el contenido visible del ocluido. A diferencia de los modelos de segmentación o de inpainting convencionales, RevealLayer no solo aísla objetos: reconstruye la información oculta detrás de otros elementos de la escena, lo que permite recuperar capas completas de objetos parcialmente tapados.

El modelo se construye como un fine-tuning de black-forest-labs/FLUX.1-dev, un modelo de difusión de texto a imagen, adaptado aquí a una tarea de imagen a imagen (image2image) con guiado por regiones. La tarea concreta es la descomposición con conciencia de oclusión (occlusion-aware image decomposition): dado un RGB y una guía de región, el modelo genera capas de fondo y capas de primer plano en formato RGBA con canal alfa, de modo que cada capa pueda componerse o manipularse de forma independiente.

La relevancia del modelo reside en su aplicación a edición de imágenes, composición, efectos visuales y generación de datos sintéticos con estructura por capas. El repositorio ocupa 0,7 GB, lo que sugiere un conjunto de pesos de adaptación (típicamente LoRA o similar sobre FLUX.1-dev) más que un modelo completo. La información pública disponible es escasa en cuanto a arquitectura interna, parámetros y benchmarks; el modelo acaba de publicarse (noviembre de 2026) y cuenta con cero descargas y cero likes en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tuning de FLUX.1-dev, modelo de difusión; detalles internos no publicados) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen; el prompt textual hereda las capacidades de FLUX.1-dev) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repo contiene 0,7 GB; formato exacto no especificado) |

## Arquitectura y entrenamiento

RevealLayer se basa en FLUX.1-dev, un transformer de difusión para generación de imágenes, y se especializa mediante fine-tuning en una tarea de imagen a imagen con guiado por regiones. La entrada es una imagen RGB junto con una guía de región (bounding boxes, según la descripción del dataset), y la salida son múltiples capas RGBA: una capa de fondo y capas de primer plano con canal alfa. El objetivo es la descomposición con conciencia de oclusión, es decir, el modelo debe inferir el contenido oculto de los objetos tapados y representarlo en capas separadas y consistentes.

El entrenamiento se apoya en RevealLayer-100K, un dataset a gran escala de 100.000 tuplas de imágenes naturales multicapa que incluyen imagen RGB, capa de fondo, capas de primer plano RGBA y bounding boxes. La evaluación se realiza sobre RevealLayerBench, con 200 imágenes seleccionadas manualmente que cubren casos difíciles: oclusiones complejas, objetos de gran área, materiales transparentes, objetos pequeños y escenas multicapa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; la contribución técnica declarada es el propio pipeline de descomposición con conciencia de oclusión y el dataset asociado.

## Capacidades

- Descomposición de una imagen RGB en múltiples capas RGBA con canal alfa.
- Recuperación de contenido oculto: reconstruye la parte tapada de objetos ocluidos.
- Guiado por regiones: acepta bounding boxes u otra guía regional para dirigir la descomposición.
- Separación de capas de fondo y de primer plano para composición independiente.
- Tarea de imagen a imagen (image2image) sobre la base de FLUX.1-dev.
- Manejo de casos difíciles según su benchmark: oclusiones complejas, materiales transparentes, objetos de gran área y escenas multicapa.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.
- Capacidades multilingües: no disponibles (modelo de imagen; el texto de condicionamiento depende de FLUX.1-dev).

## Casos de uso

- Edición de imágenes por capas: el modelo separa un objeto de su fondo en capas RGBA, lo que permite recolocar, sustituir o retocar cada elemento por separado en un editor gráfico sin volver a generar la escena completa.
- Efectos visuales y postproducción: al recuperar el contenido oculto tras un objeto, se puede reconstruir el fondo tapado y reutilizarlo en planos compuestos, reduciendo el trabajo manual de rotoscopia y clonación.
- Composición publicitaria: separar producto y fondo en capas permite adaptar un mismo producto a distintos fondos y formatos manteniendo su integridad visual y su canal alfa.
- Generación de datos sintéticos por capas: el modelo produce tuplas RGB/RGBA con estructura de capas que pueden alimentar el entrenamiento de otros modelos de segmentación, matting o composición.
- Restauración de material ocluido: en fotografía o documentación de patrimonio, permite inferir y visualizar la parte de un objeto tapada por otro elemento de la escena.
- Investigación en descomposición de imágenes: sirve como referencia reproducible (checkpoint, dataset y benchmark) para comparar métodos de layer decomposition con conciencia de oclusión.
- Automatización de pipelines de diseño gráfico: integrado como paso de preprocesado, convierte imágenes planas en activos multicapa listos para plantillas y flujos de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al derivar de FLUX.1-dev, es previsible que requiera una GPU con memoria suficiente para un modelo de difusión de gran tamaño, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; se trata de un modelo de imagen y el repo incluye código de inferencia propio según la model card).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo de tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RevealLayer | Descomposición de imagen en capas RGBA con oclusión | No disponible | No aplica | Apache 2.0 | Checkpoint en Hugging Face |
| FLUX.1-dev (modelo base) | Texto a imagen / imagen a imagen | No disponible en esta ficha | No aplica | No disponible en esta ficha | Público |
| Modelos de matting y segmentación (p. ej. SAM, BiRefNet) | Segmentación y matting de un objeto | No disponible en esta ficha | No aplica | Varía | Público |

No se dispone de datos de rendimiento comparativo entre RevealLayer y alternativas en la información proporcionada; la comparativa se limita a la naturaleza de la tarea y la licencia.

## Limitaciones y advertencias

- Información pública muy limitada: no se publican parámetros, arquitectura interna detallada, cuantizaciones ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Modelo recién publicado con cero descargas y cero likes; no hay evidencia de uso en producción ni validación independiente.
- Riesgo de alucinación en el contenido oculto: al inferir lo que hay detrás de una oclusión, el modelo puede generar contenido plausible pero incorrecto respecto a la escena real.
- Dependencia de la guía de región: la calidad de la descomposición puede degradarse si las bounding boxes o regiones de entrada son imprecisas.
- Casos difíciles documentados por el propio autor (materiales transparentes, objetos pequeños, oclusiones complejas, escenas multicapa) como áreas de especial dificultad.
- Idiomas: no se especifican; el condicionamiento textual hereda las limitaciones de FLUX.1-dev.
- Licencia Apache 2.0 para el modelo, pero los datasets (RevealLayer-100K y RevealLayerBench) se anuncian para uso de investigación y con sus propios términos, que deben revisarse antes de uso comercial.
- El modelo base FLUX.1-dev puede tener condiciones de uso adicionales que conviene verificar antes de un despliegue comercial.
- No se documentan requisitos de hardware ni latencias, por lo que la planificación de producción requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/360ZhiNao/RevealLayer
- Modelo alternativo en Hugging Face (qihoo360): https://huggingface.co/qihoo360/RevealLayer
- Paper en arXiv: https://arxiv.org/abs/2605.11818
- Repositorio GitHub: https://github.com/360CVGroup/RevealLayer/
- Página del proyecto: https://360cvgroup.github.io/RevealLayer/
- Dataset RevealLayer-100K: https://huggingface.co/datasets/qihoo360/RevealLayer-100K
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
