# 4thel00z/kaktus-bbox-lora-v3

## Resumen

kaktus-bbox-lora-v3 es un adaptador LoRA para el modelo multimodal Qwen/Qwen3-VL-4B-Instruct, desarrollado por 4thel00z. Su función es extraer la estructura de una página de documento renderizada (PDF, imagen) y devolver un objeto JSON con los elementos de layout (títulos, párrafos, tablas, figuras, etc.) y sus bounding boxes en coordenadas normalizadas de 0 a 1000. Resuelve el problema de la detección de layout en documentos, una tarea clave en sistemas de digitalización, OCR y análisis documental.

El adaptador se entrena sobre un subconjunto limpio de 60 315 pares página/JSON generados a partir de 10 000 PDFs de FinePDFs, con etiquetas producidas por el modelo kimi-k2.6 y posteriormente depuradas. Es la tercera versión de la serie, sucesora de kaktus-bbox-lora-v1, y mejora significativamente la precisión de detección en el benchmark OmniDocBench (F1 de 0.473 a 0.570). El adaptador es ligero (0.1 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en flujos de trabajo de procesamiento de documentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct (ViT y aligner congelados) |
| Parametros totales | No disponible (adaptador LoRA, tamano del repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 6144 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | Ingles (entrenado con corpus eng_Latn; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-4B-Instruct, un modelo vision-language de 4 000 millones de parametros. Durante el entrenamiento, el ViT y el aligner se mantienen congelados; solo se actualizan los pesos LoRA (r=8, alpha=32, all-linear) con una tasa de aprendizaje de 1e-4 en bf16. El entrenamiento se realizo con el framework ms-swift 4.5.2, durante 1 epoca (3770 pasos) con un batch efectivo de 16 (8 GPUs H100 con DDP). La longitud de contexto se fijo en 6144 tokens y el numero maximo de tokens de imagen en 1024.

Los datos de entrenamiento provienen de 10 000 PDFs muestreados de FinePDFs (Common Crawl), renderizados con pdfboss a aproximadamente 1224 px y etiquetados por el modelo kimi-k2.6. El proceso de limpieza incluyo el ajuste de 268 971 cajas al contorno real de la tinta, la eliminacion de 24 114 cajas vacias y 2 193 degeneradas, el remapeo de 2 805 tipos fuera de vocabulario y el recorte de todas las coordenadas al grid 0-1000. Ademas, 4 316 paginas subetiquetadas fueron reextraidas por el profesor, conservando la mejor respuesta segun cobertura de tinta (1022 paginas mejoradas). La calidad de las etiquetas se verifico contra DocLayout-YOLO como detector independiente, con una mejora de concordancia en ambos ejes (0.602 a 0.630 y 0.475 a 0.523). El conjunto final contiene 60 315 pares pagina/JSON con una particion de evaluacion disjunta por documento.

## Capacidades

- Deteccion de elementos de layout en paginas de documentos: titulo, cabecera de seccion, parrafo, lista, tabla, figura, grafico, leyenda, cabecera de pagina, pie de pagina, numero de pagina, campo de formulario, ecuacion, firma, sello y otro.
- Generacion de bounding boxes en coordenadas enteras [x0, y0, x1, y1] sobre un grid 0-1000 con origen en la esquina superior izquierda.
- Salida estructurada en JSON con la lista de elementos detectados, incluyendo el texto asociado cuando esta disponible.
- Manejo de paginas en blanco devolviendo `{"elements": []}`.
- Capacidad de procesamiento de imagenes de paginas renderizadas (vision-language) gracias al modelo base Qwen3-VL-4B-Instruct.
- No soporta tool calling ni razonamiento multi-paso especifico; su salida es exclusivamente el JSON de layout.
- Multilingue limitado: el adaptador se entreno solo con ingles; en paginas no inglesas la validez del JSON se reduce (72.1% en el mix completo de OmniDocBench que incluye chino).

## Casos de uso

- Digitalizacion de documentos: convertir PDFs escaneados o nativos en representaciones estructuradas (JSON) que preserven la jerarquia de elementos (titulos, parrafos, tablas) para su posterior indexacion o almacenamiento.
- Extraccion de tablas y figuras: identificar regiones de tablas y figuras en documentos cientificos o informes, facilitando su extraccion aislada para analisis posterior.
- Preprocesamiento para OCR: usar los bounding boxes para recortar regiones especificas (p. ej., parrafos o celdas de tabla) y alimentar un OCR de alta precision solo sobre esas areas.
- Automatizacion de procesos de negocio: clasificar y extraer campos de formularios, facturas o contratos mediante la deteccion de campos de formulario, firmas y sellos.
- Accesibilidad documental: generar una estructura semantica de documentos PDF para lectores de pantalla o herramientas de reflow, mejorando la navegacion para personas con discapacidad visual.
- Analisis de corpus academicos: procesar grandes colecciones de articulos cientificos para extraer la estructura (secciones, ecuaciones, figuras) y construir bases de datos semanticas.
- Control de calidad en impresion: verificar que la maquetacion de una pagina cumple con ciertos requisitos de layout comparando los bounding boxes detectados con las especificaciones de diseno.

## Benchmarks y rendimiento

El modelo se evaluo en OmniDocBench (subconjunto en ingles, 755 paginas, anotaciones humanas, emparejamiento greedy por IoU) comparando la version v3 con su predecesora v1:

| Metrica (English subset) | v1 | v3 |
|---|---|---|
| Detection F1 a IoU >= 0.5 | 0.473 | 0.570 |
| Precision / Recall | 0.539 / 0.421 | 0.693 / 0.485 |
| Mean IoU de cajas emparejadas | 0.603 | 0.691 |
| Precision de clase en emparejamientos | 90.6% | 91.2% |
| JSON valido | 95.4% | 90.2% |

Ademas, se reporta una evaluacion interna en un conjunto retenido de 1652 paginas con etiquetas limpias: F1 de 0.646 a IoU >= 0.5, mean IoU de 0.710, precision de tipo del 93.3% y cero cajas fuera de rango.

No se han publicado resultados comparativos con otros modelos de deteccion de layout en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), pero requiere cargar el modelo base Qwen3-VL-4B-Instruct, que tiene aproximadamente 4 000 millones de parametros.
- En bf16, el modelo base necesita alrededor de 8-10 GB de VRAM para inferencia (estimacion basada en el tamano del modelo; no se proporcionan datos exactos).
- Se recomienda una GPU con al menos 12 GB de VRAM para ejecutar el modelo completo con el adaptador, como una RTX 3080/3090, RTX 4090, A10, A100 o H100.
- El entrenamiento se realizo en 8x H100, pero la inferencia es viable en GPUs consumer de gama alta.
- Opciones de despliegue: transformers + peft (ejemplo en la model card), ms-swift (probado con `swift infer`), y potencialmente vLLM u Ollama si soportan adaptadores PEFT (no confirmado en la documentacion).
- No se proporcionan datos de latencia o throughput; se recomienda usar `max_new_tokens >= 8192` para paginas densas, lo que puede aumentar el tiempo de generacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para deteccion de layout sobre Qwen3-VL). La unica referencia directa es la version anterior del mismo autor, kaktus-bbox-lora-v1, que se compara en la seccion de benchmarks. Otros sistemas de deteccion de layout como DocLayout-YOLO se mencionan solo como herramienta de validacion, no como alternativa directa. Por tanto, la comparativa con modelos similares no esta disponible.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento fueron generadas por un modelo (kimi-k2.6) y posteriormente limpiadas, no por anotadores humanos; puede haber errores residuales en la supervision.
- El corpus de entrenamiento es exclusivamente ingles (FinePDFs eng_Latn). En paginas no inglesas, la validez del JSON cae al 72.1% en el mix completo de OmniDocBench (incluyendo chino), por lo que su uso en otros idiomas requiere validacion adicional.
- Paginas muy densas pueden superar el presupuesto de generacion y truncar el JSON a mitad; se recomienda usar `max_new_tokens >= 8192` y, si es necesario, aumentar el limite.
- Las coordenadas de los bounding boxes estan normalizadas al grid 0-1000; es responsabilidad del usuario escalarlas al tamano real de la pagina.
- El adaptador no incluye capacidades de razonamiento general ni tool calling; su unica funcion es la extraccion de layout.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales para uso comercial; se debe revisar la licencia del modelo base antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4thel00z/kaktus-bbox-lora-v3
- Version anterior (v1): https://huggingface.co/4thel00z/kaktus-bbox-lora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
