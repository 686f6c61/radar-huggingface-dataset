# atkinschang/docling-layout-egret-medium-mlx

## Resumen

El modelo `atkinschang/docling-layout-egret-medium-mlx` es una conversión a formato MLX (Apple Silicon) del modelo original `docling-project/docling-layout-egret-medium`, desarrollado por el equipo de Docling (IBM Research) para el análisis de layout de documentos. Se trata de un modelo de visión por computadora especializado en detectar y clasificar regiones dentro de páginas escaneadas o digitalizadas, como bloques de texto, tablas, figuras, títulos, listas y otros elementos estructurales. Esta tarea es fundamental en pipelines de digitalización documental, extracción de información y preparación de datos para sistemas de generación aumentada por recuperación (RAG).

El modelo está basado en la arquitectura DFINE-m, un detector de objetos eficiente diseñado específicamente para documentos, y ha sido entrenado desde cero sobre una mezcla de datasets de documentos. Con solo 19,5 millones de parámetros, es un modelo extremadamente ligero que puede ejecutarse en hardware modesto, incluyendo CPUs y GPUs de consumo. La conversión a MLX permite su uso nativo en dispositivos Apple con chip M1/M2/M3, aprovechando el framework de aprendizaje automático optimizado de Apple. Su licencia Apache-2.0 facilita su integración en proyectos comerciales y de investigación sin restricciones significativas.

La relevancia de este modelo radica en su tamaño reducido y su especialización: mientras que los modelos de layout analysis tradicionales suelen ser pesados (cientos de millones de parámetros), `egret-medium` ofrece un equilibrio entre precisión y eficiencia, siendo adecuado para despliegues en entornos con recursos limitados o en tiempo real. Al ser parte del ecosistema Docling, se integra fácilmente con otras herramientas de procesamiento documental de IBM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFINE-m (detector de objetos para documentos) |
| Parametros totales | 19.540.205 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (formato MLX, posiblemente FP16/FP32) |
| Idiomas soportados | no aplica (modelo de visión, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo `docling-layout-egret-medium` se basa en DFINE-m, una arquitectura de detección de objetos diseñada para documentos. DFINE (Document Form INformation Extraction) es un enfoque que combina un backbone de visión con cabezas de detección específicas para elementos de layout. La variante "medium" indica un tamaño intermedio dentro de la familia DFINE, con 19,5 millones de parámetros. Según la información disponible, el modelo fue entrenado desde cero sobre una mezcla de datasets de documentos, aunque no se especifican los detalles exactos del corpus (número de tokens, composición, etc.). No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de visión supervisado clásico.

La conversión a MLX realizada por `atkinschang` mantiene los pesos originales en formato safetensors, lo que garantiza compatibilidad con el framework MLX de Apple. No se han introducido cambios arquitectónicos; se trata de una conversión de formato para permitir la inferencia en dispositivos Apple Silicon. El modelo original está disponible en Hugging Face bajo el mismo nombre y licencia, y forma parte del proyecto Docling, que ofrece un conjunto de herramientas para el procesamiento de documentos.

## Capacidades

- Detección de regiones de layout en documentos: identifica y clasifica bloques de texto, tablas, figuras, títulos, listas, encabezados, pies de página, etc.
- Análisis de páginas completas: procesa imágenes de documentos (escaneos o digitalizaciones) y devuelve bounding boxes con etiquetas de clase.
- Integración con pipelines de extracción de información: puede combinarse con OCR y modelos de lenguaje para estructurar el contenido de documentos.
- Independencia del idioma: al ser un modelo de visión, funciona con documentos en cualquier idioma, siempre que la imagen sea legible.
- Eficiencia computacional: al tener solo 19,5 millones de parámetros, es adecuado para inferencia en tiempo real o en dispositivos con recursos limitados.
- Compatibilidad con MLX: la versión convertida permite ejecución nativa en Apple Silicon, aprovechando el acelerador Neural Engine.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede procesar escaneos de documentos antiguos y detectar la estructura de página (columnas, títulos, imágenes) para facilitar su indexación y búsqueda.
- Extracción de tablas en informes financieros: al detectar regiones de tabla, un pipeline posterior puede aplicar OCR y parsing específico para convertir tablas en datos estructurados (CSV, JSON).
- Preparación de documentos para RAG: antes de alimentar un sistema de generación aumentada por recuperación, el modelo segmenta el documento en bloques semánticos (párrafos, tablas, figuras) para mejorar la calidad de la recuperación.
- Automatización de procesos de negocio: en entornos de back-office, el modelo puede clasificar facturas, contratos o formularios según su layout, permitiendo rutas de procesamiento automáticas.
- Análisis de artículos científicos: detecta secciones como resumen, metodología, resultados y referencias, facilitando la extracción de metadatos y la construcción de bases de datos bibliográficas.
- Accesibilidad documental: el modelo puede ayudar a convertir documentos escaneados en versiones accesibles (HTML estructurado, EPUB) identificando la jerarquía de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original `docling-layout-egret-medium` no incluye métricas comparativas en su model card, y la conversión MLX no añade datos adicionales. Se recomienda consultar el paper asociado (arxiv:2509.11720) para posibles evaluaciones, aunque no se ha verificado su contenido.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 19,5 millones de parámetros, la inferencia requiere menos de 100 MB de memoria en FP32. En MLX, con cuantización FP16, el consumo es aún menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. En Apple Silicon, funciona en CPU, GPU integrada y Neural Engine.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 2060, GTX 1660, etc.) e incluso en CPUs con soporte AVX.
- Opciones de despliegue: al ser MLX, se puede ejecutar con el framework MLX de Apple. Para otros entornos, se puede usar el modelo original en formato PyTorch con librerías como Docling, que ofrece integración con ONNX y TensorRT.
- Latencia y throughput: no se dispone de datos medidos, pero dado el tamaño del modelo, se espera una latencia inferior a 10 ms por imagen en GPU moderna y decenas de ms en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| docling-layout-egret-medium (original) | 19,5 M | no aplica | Layout analysis | Apache-2.0 | Hugging Face, PyTorch |
| docling-layout-egret-medium-mlx (este) | 19,5 M | no aplica | Layout analysis | Apache-2.0 | Hugging Face, MLX |
| LayoutLMv3-base | 133 M | 512 tokens (texto) | Layout + texto | CC BY-SA 4.0 | Hugging Face |

La comparativa se limita a modelos de layout analysis conocidos. LayoutLMv3 es más pesado y combina visión y texto, mientras que `egret-medium` es puramente visual y mucho más ligero. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser entrenado en datasets de documentos, puede tener un rendimiento inferior en tipos de documentos poco representados (por ejemplo, manuscritos, idiomas con escrituras no latinas).
- Riesgo de alucinación: no aplica, ya que es un modelo de detección y no genera texto.
- Limitaciones de contexto o idioma: al ser un modelo de visión, no tiene límite de contexto textual, pero depende de la calidad de la imagen de entrada. Documentos con baja resolución, rotación o ruido pueden degradar la precisión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: la conversión MLX no ha sido validada por el equipo original de Docling; se recomienda verificar la paridad de resultados con el modelo PyTorch antes de un despliegue crítico.
- Dependencia del ecosistema Docling: para un uso óptimo, se recomienda integrar el modelo con las herramientas de Docling (preprocesado, postprocesado), lo que añade dependencias adicionales.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/atkinschang/docling-layout-egret-medium-mlx
- Modelo original en Hugging Face: https://huggingface.co/docling-project/docling-layout-egret-medium
- Modelo en ModelScope: https://www.modelscope.cn/models/ds4sd/docling-layout-egret-medium
- Paper relacionado (posible): https://arxiv.org/abs/2509.11720
- Paper relacionado (posible): https://arxiv.org/abs/2408.09869
- Documentación de Docling (catálogo de modelos): https://github.com/docling-project/docling/blob/main/docs/usage/model_catalog.md
