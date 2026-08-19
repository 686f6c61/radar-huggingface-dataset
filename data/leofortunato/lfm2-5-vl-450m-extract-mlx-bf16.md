# LeoFortunato/LFM2.5-VL-450M-Extract-MLX-bf16

## Resumen

LFM2.5-VL-450M-Extract-MLX-bf16 es un port no cuantizado en bfloat16 del modelo LFM2.5-VL-450M-Extract de Liquid AI, convertido por LeoFortunato para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX y la librería mlx-vlm. El modelo original es un vision-language modelo compacto de 450M parámetros diseñado para extraer campos definidos por el usuario a partir de imágenes y devolverlos como JSON estricto, siguiendo un patrón de prompt con esquema YAML.

La relevancia de este port es que permite desplegar el modelo en dispositivos Apple Silicon (M1/M2/M3/M4) con un consumo de memoria unificada de aproximadamente 900 MB, lo que lo hace adecuado para aplicaciones de edge computing y procesamiento en tiempo real. El modelo combina un LM de 350M parámetros con un encoder de visión SigLIP2 de ~100M, y ofrece una ventana de contexto de 128.000 tokens, una cifra notable para un modelo de este tamaño.

La licencia es LFM Open License v1.0, una licencia de código abierto con restricciones específicas, y el modelo soporta únicamente el idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM transformer (LFM2.5) + encoder de visión SigLIP2 |
| Parametros totales | 448.718.848 (350M LM + ~100M vision) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bfloat16 (este repositorio); tambien disponibles variantes 4-bit (int4) y 8-bit (int8) del mismo port |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-450M-Extract es un modelo de lenguaje denso de 350M parámetros combinado con un encoder de visión SigLIP2 de aproximadamente 100M parámetros, sumando un total de 448,7M parámetros. La arquitectura está diseñada para procesamiento de imágenes y texto, con una ventana de contexto de 128k tokens que permite manejar secuencias largas de texto junto con información visual.

El entrenamiento del modelo base se basa en LFM2.5-VL-450M, que a su vez es una evolución de LFM2-VL-450M con entrenamiento de refuerzo extendido para mejorar el seguimiento de instrucciones y la capacidad de grounding. La variante Extract está específicamente ajustada para la tarea de extracción de campos visuales con salida JSON estricta. El port MLX es una conversión de pesos sin reentrenamiento, realizada con el comando `python -m mlx_vlm.convert --hf-path LiquidAI/LFM2.5-VL-450M-Extract --dtype bfloat16`, manteniendo la precisión bfloat16 original.

## Capacidades

- Extracción de campos definidos por el usuario a partir de imágenes, devolviendo JSON estricto.
- Soporte de esquemas YAML en el prompt del sistema para definir los campos a extraer.
- Soporte de restricciones de tipo enum en los campos (por ejemplo, seleccionar entre "smooth", "rough" o "grainy").
- Generación de texto en inglés con contexto visual.
- Ventana de contexto largo (128k tokens) para manejar imágenes con descripciones extensas o múltiples campos.
- Capacidades de grounding visual (en el modelo base LFM2.5-VL-450M), aunque no se documenta explícitamente en la variante Extract.
- No se documenta soporte de tool calling ni function calling en esta variante específica.

## Casos de uso

- Inspección de calidad industrial: extraer automáticamente atributos de superficies (color, textura, patrón) de imágenes de productos para control de calidad en líneas de fabricación. El modelo devuelve JSON estructurado que puede integrarse directamente en sistemas de gestión de calidad.
- Catalogación de productos en e-commerce: dado un conjunto de imágenes de producto, extraer campos como color, material, estado y acabado para generar fichas de producto de forma automatizada. La salida JSON estricta facilita la integración con bases de datos.
- Automatización de inventario: procesar imágenes de estanterías o almacenes para extraer información visual de los productos y actualizar inventarios sin intervención manual, gracias a su capacidad de ejecución en edge hardware.
- Procesamiento de documentos visuales: extraer campos estructurados de facturas, formularios o etiquetas escaneadas, definiendo el esquema deseado en YAML y obteniendo JSON listo para consumir por APIs.
- Asistencia a la gestión de recursos naturales: analizar imágenes de madera, piedra u otros materiales para clasificar atributos visuales (color, textura, patrón) en aplicaciones de selección de materiales.
- Demostraciones de visión por computador en dispositivos Apple: el modelo puede ejecutarse en un MacBook con MLX, lo que lo convierte en una opción práctica para prototipar aplicaciones de extracción de datos visuales en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon (M1, M2, M3, M4) mediante MLX y mlx-vlm.
- Memoria unificada estimada: ~900 MB en bfloat16, ~600 MB en 8-bit, ~400 MB en 4-bit.
- Puede ejecutarse en dispositivos con 8 GB de RAM unificada o más; recomendado para Macs con Apple Silicon.
- No requiere GPU dedicada; utiliza la memoria unificada del SoC.
- Despliegue mediante la librería mlx-vlm (Python) o el comando `mlx_vlm.generate`.
- Latencia y throughput no documentados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-Extract (base) | ~448M | 128k | LFM 1.0 | PyTorch | Modelo original, sin port MLX |
| LFM2-VL-450M | ~448M | 128k | LFM 1.0 | PyTorch | Versión anterior sin RL extendido |
| LFM2.5-VL-450M (general) | ~448M | 128k | LFM 1.0 | PyTorch | Incluye grounding y function calling |

El port MLX no difiere en parámetros ni arquitectura del modelo base; la diferencia es el formato de pesos y la optimización para Apple Silicon. No se dispone de datos de rendimiento comparativo con otros modelos de visión de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés; no está entrenado para otras lenguas.
- La licencia LFM Open License v1.0 tiene restricciones específicas; es necesario revisar los términos para uso comercial o redistribución.
- El modelo puede alucinar campos visuales cuando la imagen es ambigua o de baja calidad, especialmente en campos con enums no restringidos.
- La extracción de campos está limitada a los definidos en el prompt; no es un modelo de conversación generalista ni de razonamiento complejo.
- El port MLX está orientado exclusivamente a Apple Silicon; para otras plataformas se requiere el modelo base en formato PyTorch.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en inglés, puede presentar sesgos culturales en la interpretación visual de objetos.

## Enlaces

- Repositorio HuggingFace del port MLX: https://huggingface.co/LeoFortunato/LFM2.5-VL-450M-Extract-MLX-bf16
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-450M-Extract
- Documentación de Liquid AI para LFM2.5-VL-450M-Extract: https://docs.liquid.ai/lfm/models/lfm25-vl-450m-extract
- Documentación de Liquid AI para LFM2.5-VL-450M: https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Blog de Liquid AI sobre LFM2.5-VL-450M: https://www.liquid.ai/blog/lfm2-5-vl-450m
- Paper de SigLIP2: https://arxiv.org/abs/2502.14786
- Paper técnico de LFM2: https://arxiv.org/abs/2511.23404
