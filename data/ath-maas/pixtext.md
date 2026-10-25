# ATH-MaaS/PixText

## Resumen

PixText es un modelo generativo de edición de imagen especializado en el refinado local de texto en el espacio de píxeles. Dado un图像 de entrada, un conjunto de regiones a editar y el texto objetivo, el modelo sintetiza esas regiones usando la imagen como contexto y conserva intactos los píxeles situados fuera de las huellas de edición. Admite varios objetivos de forma conjunta en una misma pasada, lo que lo diferencia de aproximaciones de posprocesado que recomponen el texto capa por capa.

Lo desarrolla ATH-MaaS y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y PyTorch. El paquete incluye dos variantes: PixText-Teacher, con muestreo Euler de 25 pasos, y PixText-MeanFlow, con muestreo interval Euler de 4 pasos, que es la opción rápida por defecto. La model card no detalla el backbone (transformer, UNet u otro) ni el número de parámetros, por lo que esos datos deben considerarse no disponibles.

Su relevancia actual radica en un problema persistente de los modelos de imagen: la generación y corrección fiable de texto con tipografía legible y coherente con el entorno. PixText ataca el caso concreto de la reparación local (erratas, caracteres dañados, sustitución de palabras) sin regenerar la imagen completa, apoyándose en una guía de glifo con escala 3.3 y en un muestreo de pocos pasos para la variante MeanFlow. La existencia de un nodo en el registro de ComfyUI facilita su integración en flujos de edición visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generativa de edicion de imagen en espacio de pixeles, con muestreo Euler (Teacher) e interval Euler (MeanFlow); backbone no detallado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; los ejemplos de la model card cubren caracteres chinos e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

Datos adicionales aportados por el repositorio: tamano del repo de 3,9 GB, 13 likes, 0 descargas y actualizacion el 22 de octubre de 2026. El dataset asociado es ATH-MaaS/TextRefinementBench.

## Arquitectura y entrenamiento

La model card describe un modelo de refinado de texto que opera directamente en el espacio de píxeles: recibe una imagen, las regiones a editar y el texto objetivo, y genera únicamente esas regiones usando el resto de la imagen como contexto. La composición preserva los píxeles fuera de las huellas editadas, lo que evita alteraciones en logotipos, fondos y tipografías no seleccionadas. El proceso de generación emplea muestreo Euler de 25 pasos en la variante Teacher y muestreo interval Euler de 4 pasos en MeanFlow, ambos con una escala de guía de glifo de 3,3.

No se especifican en la información disponible el tipo de backbone, el número de parámetros, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El paper asociado (arXiv 2610.18284) es la referencia citada para los detalles técnicos, pero su contenido no se ha proporcionado. Como innovación destacable, MeanFlow reduce el muestreo de 25 a 4 pasos y, según la model card, no requiere codificador de texto adicional, modelo OCR, VAE ni profesor, lo que simplifica el despliegue. Cada paquete incluye pesos, configuración, fuentes y sumas de verificación SHA-256.

## Capacidades

- Refinado local de texto en imágenes: sustituye o repara caracteres y palabras en regiones delimitadas, manteniendo el contexto visual circundante.
- Preservación de píxeles fuera de las regiones editadas, lo que permite intervenir sobre logotipos o maquetas sin dañar el resto de la composición.
- Edición conjunta de múltiples objetivos en una sola pasada, con generación coordinada de varias regiones.
- Control mediante guía de glifo (escala 3,3) para ajustar la fidelidad tipográfica del texto generado.
- Dos modos de inferencia: Teacher (25 pasos, mayor coste) y MeanFlow (4 pasos, arranque rápido).
- Reparación de tipografía dañada en inglés, según el ejemplo de la model card (una letra rota y dos palabras en un eslogan impreso).
- Renderizado de caracteres chinos, con ejemplos de glifos individuales (喜, 发, 甜, 初, 恋, entre otros).
- Integración opcional con detección y reconocimiento de palabras mediante CRAFT + PP-OCRv6, con revisión posterior del usuario, según el nodo de ComfyUI.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; se trata de un modelo de edición de imagen, no de un LLM.

## Casos de uso

- Corrección de erratas en material gráfico ya publicado: se delimitan las regiones con el texto erróneo y se proporciona la cadena corregida; el modelo reescribe solo esas zonas y conserva el resto del cartel, evitando rehacer la pieza completa.
- Localización de carteles y etiquetas entre idiomas: se seleccionan las cajas de texto y se introduce la traducción; al preservar los píxeles externos, se mantienen fondos, ilustraciones y composición tipográfica del original.
- Reparación de logotipos y eslóganes dañados: el caso en inglés de la model card muestra la reconstrucción de una letra rota y dos palabras sin tocar el logo circundante, útil en archivos históricos o escaneos deteriorados.
- Restauración de documentos escaneados: sobre regiones con texto ilegible o manchado, el modelo regenera los caracteres a partir del contexto de la página, lo que resulta adecuado para digitalización de archivos.
- Edición de mockups y capturas en diseño gráfico: permite cambiar titulares o etiquetas en una maqueta sin reabrir el proyecto de origen, con la ventaja de que el resultado se compone directamente en píxeles.
- Contenido de comercio electrónico: actualización de nombres de producto, tallas o promociones en imágenes de catálogo, delimitando las cajas de texto y manteniendo el embalaje y la iluminación originales.
- Señalética y wayfinding multilingüe: sustitución de rótulos en fotografías de espacios reales para generar variantes de idioma, aprovechando la conservación del entorno y la generación conjunta de varios rótulos.
- Automatización por lotes en pipelines de marketing: combinado con la detección CRAFT + PP-OCRv6 del nodo de ComfyUI, se pueden localizar palabras automáticamente, revisar las cajas y aplicar el refinado de forma masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye comparaciones cualitativas mediante imágenes de ejemplo (entrada, salida MeanFlow a 4 pasos y salida Teacher a 25 pasos) para caracteres chinos y un eslogan en inglés. No se aportan métricas cuantitativas como MMLU, HumanEval, GSM8K ni métricas específicas de renderizado de texto (por ejemplo, precisión OCR, similitud estructural o FID).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica cifra oficial de memoria.
- Referencia de tamano: el repositorio completo ocupa 3,9 GB e incluye los dos paquetes (Teacher y MeanFlow), configuración, fuentes y sumas SHA-256; un paquete individual pesa menos, pero no se detalla su desglose.
- GPU recomendadas: no disponible. Al no conocerse el número de parámetros ni la resolución de trabajo, no puede confirmarse qué GPU es suficiente.
- GPU de consumo: no confirmado. El tamano del repo sugiere que un único paquete podría caber en GPUs de consumo, pero es una estimación no verificada y no debe tomarse como requisito validado.
- Opciones de despliegue: ComfyUI mediante el nodo del registro (confirmado) y ejecución nativa en PyTorch con pesos safetensors. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Cualitativamente, MeanFlow reduce el muestreo de 25 a 4 pasos frente a Teacher, lo que implica menor latencia, pero no se publican tiempos por imagen ni imágenes por segundo.
- Dependencias adicionales: MeanFlow no necesita codificador de texto, modelo OCR, VAE ni profesor según la model card; el nodo de ComfyUI ofrece detección y reconocimiento opcionales con CRAFT + PP-OCRv6.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que la comparación externa se marca como no disponible. Como referencia interna, sí puede compararse las dos variantes del propio modelo:

| Variante | Muestreo | Pasos | Guia de glifo | Dependencias adicionales |
|---|---|---|---|---|
| PixText-Teacher | Euler | 25 | 3,3 | No especificadas en la model card |
| PixText-MeanFlow | Interval Euler | 4 | 3,3 | Ninguna adicional (sin codificador de texto, OCR, VAE ni profesor) |

La comparación con alternativas de la misma categoría (otros modelos de renderizado o edición de texto en imagen) requeriría datos de benchmarks y especificaciones que no se han facilitado.

## Limitaciones y advertencias

- Idiomas no declarados oficialmente: los ejemplos se centran en caracteres chinos e inglés; el comportamiento en otras escrituras (árabe, devanagari, cirílico, etc.) no está documentado.
- Sin datos de benchmarks: no puede evaluarse de forma cuantitativa la fidelidad tipográfica, la tasa de acierto OCR ni la calidad frente a alternativas.
- Riesgo de artefactos en tipografías complejas: fuentes decorativas, cursivas muy ligadas, caracteres muy estilizados o texto sobre fondos ruidosos pueden generar glifos inconsistentes con el entorno.
- Dependencia de la delimitación de regiones: la calidad depende de que las cajas de edición estén bien definidas; una región mal ajustada puede afectar a píxeles que debían conservarse.
- Restricción al ámbito local: el modelo está diseñado para refinar texto en regiones delimitadas, no para generar texto nuevo en imágenes completas ni para edición global.
- Diferencia de calidad entre variantes: MeanFlow prioriza velocidad (4 pasos) y Teacher prioriza calidad (25 pasos); no se publica una comparación métrica entre ambas.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con un dataset específico (TextRefinementBench) puede heredar las distribuciones tipográficas y lingüísticas de ese corpus.
- Alucinación visual: puede introducir caracteres o trazos no solicitados dentro de la región editada; se recomienda revisión humana en producción.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Madurez: 0 descargas y 13 likes en el momento de la ficha; es un lanzamiento reciente (octubre de 2026) sin evidencia pública de uso en producción a gran escala.
- Detalles de entrenamiento ausentes: no se especifican tokens, composición del dataset ni si hubo RLHF/DPO, lo que dificulta evaluar la robustez fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATH-MaaS/PixText
- Paper (arXiv 2610.18284): https://arxiv.org/abs/2610.18284
- Repositorio de código: https://github.com/ATH-MaaS/PixText
- Dataset TextRefinementBench: https://huggingface.co/datasets/ATH-MaaS/TextRefinementBench
- Nodo de ComfyUI: https://registry.comfy.org/publishers/yaoliliu/nodes/pixtext
