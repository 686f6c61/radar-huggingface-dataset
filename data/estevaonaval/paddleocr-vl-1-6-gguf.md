# EstevaoNaval/PaddleOCR-VL-1.6-GGUF

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje especializado en el análisis y parsing de documentos, desarrollado por el equipo de PaddlePaddle. Se presenta como una evolución de PaddleOCR-VL-1.5, con un enfoque en la optimización de regiones poco aprovechadas del modelo anterior y un esquema de post-entrenamiento progresivo. El modelo procesa imágenes de documentos y extrae texto estructurado con información de disposición espacial, alcanzando un 96,33 % de precisión en el benchmark OmniDocBench v1.6.

Con aproximadamente 466 millones de parámetros (0,9 B según la documentación oficial), el modelo está diseñado para un despliegue compacto mediante cuantización GGUF, lo que lo hace adecuado para entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial sin restricciones significativas. Esta versión GGUF, publicada por el usuario EstevaoNaval en HuggingFace, es una conversión del modelo original para su uso con motores de inferencia compatibles con este formato.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles internos no disponibles) |
| Parametros totales | 466.654.208 (0,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes especificas no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la informacion disponible, pero se trata de un modelo de vision-lenguaje (VLM) orientado al parsing de documentos. Segun la documentacion oficial, PaddleOCR-VL-1.6 introduce un marco de optimizacion de datos consciente de regiones que identifica las regiones debiles del modelo anterior (PaddleOCR-VL-1.5), aplica mejoras dirigidas a esas regiones y mejora la fiabilidad de las senales de supervision. Ademas, adopta una receta de post-entrenamiento progresivo, aunque no se especifican los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se emplearon tecnicas como RLHF o DPO.

El modelo hereda compatibilidad total con el ecosistema PaddleOCR, lo que facilita su integracion en pipelines existentes de procesamiento de documentos.

## Capacidades

- Parsing de documentos: extrae texto estructurado con informacion de disposicion espacial (bounding boxes, orden de lectura).
- Procesamiento de imagenes de documentos: escaneos, fotografias de paginas, capturas de pantalla.
- Reconocimiento optico de caracteres (OCR) con salida estructurada.
- Generacion de texto a partir de imagenes (image-to-text).
- Compatible con el ecosistema PaddleOCR para pipelines de procesamiento documental.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, vision general (mas alla de documentos) ni modo thinking.

## Casos de uso

- Digitalizacion de archivos historicos: el modelo puede convertir escaneos de documentos antiguos en texto estructurado con informacion de layout, facilitando la indexacion y busqueda en archivos digitales.
- Extraccion de datos de facturas y recibos: procesa imagenes de facturas para extraer campos como importes, fechas y proveedores, con la disposicion espacial necesaria para reconstruir la estructura del documento.
- Automatizacion de tramites administrativos: integrado en sistemas de gestion documental, puede clasificar y extraer informacion de formularios, solicitudes y certificados.
- Procesamiento de documentos cientificos: extrae texto y estructura de articulos de investigacion escaneados, incluyendo tablas y referencias, para su inclusion en bases de datos bibliograficas.
- Asistencia a personas con discapacidad visual: convierte documentos impresos en texto legible por lectores de pantalla, preservando el orden de lectura y la estructura.
- Analisis de documentos legales: extrae clausulas, fechas y partes de contratos escaneados, con la precision necesaria para su posterior revision por profesionales.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OmniDocBench v1.6 | 96,33 % de precision (state-of-the-art) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No se dispone de comparaciones con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,9 B en formato GGUF, puede ejecutarse en GPUs con 4-6 GB de VRAM en cuantizaciones bajas (Q4_K_M o similares), aunque no se especifican las variantes de cuantizacion disponibles.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 3060 o superior) o Apple Silicon con suficiente memoria unificada.
- Compatible con hardware de consumo: si, dado el tamano reducido del modelo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con backend GGUF), y el ecosistema PaddleOCR (Paddle Inference).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia |
|---|---|---|---|---|
| PaddleOCR-VL-1.6 (GGUF) | 0,9 B | no disponible | OmniDocBench: 96,33 % | Apache-2.0 |
| PaddleOCR-VL-1.5 | no disponible | no disponible | no disponible | Apache-2.0 |
| Otros modelos de parsing de documentos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa exhaustiva con alternativas como LayoutLM, Donut o modelos OCR comerciales. La informacion disponible solo permite comparar con la version anterior del mismo modelo.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo entrenado principalmente con documentos, puede tener un rendimiento inferior con escritura manuscrita o caligrafia no estandar.
- Riesgo de alucinacion: como todo modelo de generacion de texto, puede producir contenido incorrecto al interpretar imagenes ambiguas o de baja calidad.
- Limitaciones de contexto: no se especifica la longitud de contexto, lo que puede limitar el procesamiento de documentos muy extensos en una sola pasada.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento puede variar significativamente entre idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia.
- Caveat de produccion: al ser una conversion GGUF de un tercero (EstevaoNaval), se recomienda verificar la integridad de los pesos y contrastar con el modelo original de PaddlePaddle antes de su uso en entornos criticos.

## Enlaces

- Repositorio HuggingFace (conversion GGUF): https://huggingface.co/EstevaoNaval/PaddleOCR-VL-1.6-GGUF
- Repositorio HuggingFace (modelo original): https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6-GGUF
- ModelScope: https://www.modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.6-GGUF
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Tutorial de uso de PaddleOCR-VL: https://www.paddleocr.ai/main/en/version3.x/pipeline_usage/PaddleOCR-VL.html
- Articulo de referencia (arXiv): arxiv:2606.03264
