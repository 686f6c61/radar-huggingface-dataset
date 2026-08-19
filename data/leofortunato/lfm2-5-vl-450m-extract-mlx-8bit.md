# LeoFortunato/LFM2.5-VL-450M-Extract-MLX-8bit

## Resumen

LFM2.5-VL-450M-Extract-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo LFM2.5-VL-450M-Extract de Liquid AI, adaptada para ejecutarse en dispositivos Apple Silicon. Este modelo de visión-lenguaje (VLM) está especializado en extraer campos definidos por el usuario a partir de imágenes y devolverlos como objetos JSON estrictos, siguiendo un esquema YAML proporcionado en el prompt del sistema. El modelo base original fue desarrollado por Liquid AI como parte de su familia LFM2.5 y el port a MLX ha sido realizado por LeoFortunato, manteniendo la misma arquitectura y capacidades con una pérdida mínima por cuantización.

El modelo combina un codificador de visión SigLIP2 de aproximadamente 100 millones de parámetros con un modelo de lenguaje de 350 millones, alcanzando un total de unos 450 millones de parámetros en su configuración completa. La versión MLX 8-bit reduce el tamaño de los pesos a aproximadamente 565 MB, lo que permite ejecutar inferencias con unos 600 MB de memoria unificada activa en chips M1/M2/M3/M4. Con una ventana de contexto de 128.000 tokens, este modelo está pensado para tareas de extracción de campos específicos en imágenes, como atributos de productos, características de materiales o cualquier dato definible mediante un esquema YAML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL (modelo de lenguaje + codificador de visión SigLIP2) |
| Parametros totales | 193.980.416 (pesos reales en safetensors; la model card indica 350M LM + 100M vision) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8-bit affine (group_size 64, mode affine) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-450M-Extract combina un codificador de vision SigLIP2 de aproximadamente 100 millones de parametros con un modelo de lenguaje de 350 millones de parametros. La arquitectura exacta del componente de lenguaje no se detalla en la informacion disponible, aunque el modelo pertenece a la familia LFM2.5 de Liquid AI, que emplea tecnicas de entrenamiento por refuerzo para mejorar el rendimiento en tareas de extraccion estructurada. La variante Extract se entrena especificamente para seguir esquemas YAML definidos por el usuario y producir JSON estricto, con soporte para restricciones de tipo enum en los campos extraidos.

El entrenamiento del modelo base se realizo mediante un proceso de aprendizaje por refuerzo extendido sobre la version anterior LFM2-VL-450M, segun la documentacion de Liquid AI. No se dispone de detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. La cuantizacion a 8-bit se realizo mediante la herramienta de conversion de mlx-vlm con parametros `--q-bits 8 --q-group-size 64`, lo que reduce el peso del modelo de aproximadamente 897 MB en bfloat16 a 565 MB.

## Capacidades

- Extraccion de campos estructurados definidos por el usuario en imagenes, devolviendo JSON estricto.
- Soporte de esquemas YAML en el prompt del sistema para especificar que campos extraer y como interpretarlos.
- Soporte de restricciones enum en los campos, limitando las respuestas a un conjunto de valores predefinidos.
- Generacion de texto en ingles.
- Razonamiento visual para identificar atributos como color, textura, patrones u otras caracteristicas en imagenes.
- Inferencia eficiente en dispositivos Apple Silicon mediante MLX, con cuantizacion 8-bit que minimiza la perdida de precision.

## Casos de uso

- Inspeccion visual de materiales: extraer atributos como color, textura o patron de superficies (madera, metal, tela) a partir de fotografias, util en control de calidad industrial.
- Automatizacion de etiquetado de imagenes: generar metadatos estructurados para bases de datos de productos o catalogos, definiendo campos como talla, color o estado.
- Extraccion de datos de documentos visuales: capturar informacion de facturas, etiquetas o tarjetas de visita convirtiendo campos visuales en JSON consumible por sistemas de gestion.
- Integracion en pipelines de vision artificial: usarse como modulo de extraccion de caracteristicas en flujos de datos que requieran salida estructurada sin postprocesado adicional.
- Asistencia en aplicaciones de realidad aumentada: identificar caracteristicas de objetos del entorno y devolverlas en formato legible por maquina para su uso en capas de informacion.
- Automatizacion de procesos de inspeccion visual en agricultura o logistica: definir campos como tipo de fruta, estado de madurez o danos visibles y obtener respuestas JSON para alimentar sistemas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento comparativo con otros modelos, y no hay datos de evaluacion en el repositorio de HuggingFace.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 600 MB activos durante la inferencia con cuantizacion 8-bit.
- Peso del modelo: 565 MB en safetensors.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o M4), incluyendo variantes de bajo consumo como M1 y M2 basificos.
- No requiere GPU dedicada externa; se ejecuta en la memoria unificada del SoC Apple.
- Opciones de despliegue: MLX con la libreria `mlx-vlm` (Python), compatible con pipelines de generacion y carga de imagenes desde URLs o archivos locales.
- Latencia y throughput: no se proporcionan datos numericos, pero al ser un modelo de 450M con cuantizacion 8-bit, la inferencia en Apple Silicon es rapida para un solo ejemplo, con generacion tipica de 512 tokens en menos de 2 segundos en chips M2 o superiores (estimacion basada en el tamano del modelo, no medida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-Extract-MLX-8bit | 450M (LM 350M + vision 100M) | 128K | 8-bit MLX | LFM Open License v1.0 | HuggingFace |
| LFM2.5-VL-450M-Extract (original) | 450M | 128K | bfloat16 (no cuantizado) | LFM Open License v1.0 | HuggingFace |
| LFM2.5-VL-450M (vision general) | 450M | 128K | bfloat16 | LFM Open License v1.0 | HuggingFace |

No se han encontrado modelos comparables de la misma categoria (extraccion de campos visuales con JSON) en la informacion proporcionada. Los modelos de Liquid AI de la familia LFM2.5-VL comparten la misma base de 450M, siendo la variante Extract la especifica para tareas de extraccion estructurada.

## Limitaciones y advertencias

- El modelo solo soporta ingles como idioma de entrada y salida, lo que limita su uso en entornos multilingues.
- La licencia LFM Open License v1.0 puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia en el repositorio antes de desplegar en produccion.
- La cuantizacion 8-bit puede introducir una ligera perdida de precision en la extraccion de campos muy especificos o con valores ambiguos.
- El modelo esta especializado en extraccion de campos definidos por el usuario; no es un VLM de proposito general y puede fallar en tareas de generacion de captions o respuestas abiertas.
- Los campos extraidos dependen completamente de la calidad del prompt YAML; esquemas ambiguos o incompletos pueden producir JSON incompletos o incorrectos.
- El riesgo de alucinacion es bajo en tareas de extraccion visual, pero existe en casos de imagenes de baja calidad o atributos no visibles.
- No se han publicado benchmarks publicos que verifiquen su rendimiento en tareas estandar de vision-language, por lo que su comportamiento en escenarios fuera de la extraccion de campos no esta caracterizado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LeoFortunato/LFM2.5-VL-450M-Extract-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M-Extract
- Modelo general LFM2.5-VL-450M: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-vl-450m-extract
- Paper SigLIP2: https://arxiv.org/abs/2502.14786
- LFM2 Technical Report: https://arxiv.org/abs/2511.23404
- MLX framework: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/ml-explore/mlx-examples/tree/main/mlx_vlm
- Playground de Liquid AI: https://playground.liquid.ai/chat?model=lfm2.5-vl-450m
