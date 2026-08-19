# LeoFortunato/LFM2.5-VL-450M-Extract-MLX-4bit

## Resumen

LFM2.5-VL-450M-Extract-MLX-4bit es una conversión a cuantización de 4 bits para Apple Silicon del modelo LFM2.5-VL-450M-Extract de Liquid AI, un modelo de visión-lenguaje compacto especializado en extraer campos definidos por el usuario de imágenes y devolverlos como JSON estricto. El modelo combina un encoder de visión SigLIP-2 de aproximadamente 100 millones de parámetros con un módulo de lenguaje de 350 millones, alcanzando un total de unos 450 millones de parámetros. Su contexto de 128.000 tokens y su diseño optimizado para baja latencia lo hacen adecuado para despliegue en dispositivos con memoria unificada de Apple Silicon (M1/M2/M3/M4).

La variante MLX 4-bit reduce el peso del modelo a unos 388 MB y ocupa aproximadamente 400 MB de memoria unificada activa durante la inferencia, lo que permite ejecutarlo en cualquier Mac con Apple Silicon sin necesidad de GPU dedicada. El modelo base, LFM2.5-VL-450M-Extract, forma parte de la familia LFM2.5 de Liquid AI, que incorpora aprendizaje por refuerzo extendido para mejorar la precisión en tareas de extracción estructurada. Esta versión cuantizada mantiene la misma capacidad de extracción de campos (incluyendo restricciones de tipo enum) que el modelo original, con una huella de memoria muy reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (encoder SigLIP-2 + LM de 350M) |
| Parámetros totales | ~450M (350M LM + ~100M visión) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | 4-bit (int4, group_size 64), 8-bit (int8), bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de LFM2.5-VL-450M, un modelo de visión-lenguaje compacto de Liquid AI. El encoder visual es SigLIP-2 (de unos 100 millones de parámetros), que procesa las imágenes y las convierte en representaciones que el módulo de lenguaje de 350 millones consume. El módulo de lenguaje es un transformer denso (no MoE) entrenado para tareas de extracción estructurada: dado un esquema YAML en el prompt del sistema, el modelo devuelve un JSON con los campos solicitados.

Según la documentación de Liquid AI, la versión LFM2.5-VL-450M incorpora aprendizaje por refuerzo extendido respecto a la versión anterior, lo que mejora el rendimiento en tareas de extracción de campos. No se han publicado datos concretos sobre la composición del dataset de entrenamiento ni el número de tokens utilizados. El technical report de LFM2 (arXiv:2511.23404) describe la arquitectura general de la familia LFM2, y el paper de SigLIP-2 (arXiv:2502.14786) detalla el encoder visual.

## Capacidades

- Extracción de campos definidos por el usuario en imágenes, devolviendo JSON estricto con los valores extraídos.
- Soporte de definiciones de campos con restricciones de tipo enum (p. ej. "selecciona entre smooth, rough o grainy").
- Comprensión visual de imágenes (color, textura, patrones, contenido general) gracias al encoder SigLIP-2.
- Generación de texto estructurado (JSON) sin texto adicional fuera del objeto JSON.
- Conversación multimodal de imagen a texto, con soporte de prompts de sistema para definir el esquema de extracción.
- Inferencia en tiempo real con baja latencia en dispositivos Apple Silicon mediante MLX.

## Casos de uso

- Extracción de metadatos de imágenes de productos: en una tienda online, el modelo puede extraer automáticamente color, material o patrón de una foto de un producto y rellenar la base de datos sin intervención manual.
- Digitalización de formularios y documentos: a partir de una imagen escaneada, extrae campos como nombre, fecha o identificador en formato JSON, listo para integrarse en un flujo de trabajo de procesamiento de documentos.
- Clasificación visual de piezas industriales: en entornos de fabricación, el modelo puede identificar características superficiales (grietas, textura, color) y devolverlas como JSON para alimentar sistemas de control de calidad.
- Automatización de captura de datos en aplicaciones móviles: una app de inventario puede fotografiar etiquetas o productos y usar el modelo para extraer atributos de forma estructurada.
- Análisis de imágenes médicas simples: el modelo puede extraer campos descriptivos de imágenes (por ejemplo, tipo de lesión, color de la piel) para ayudar en la documentación clínica.
- Enriquecimiento de bases de datos de imágenes: dado un dataset de fotos sin etiquetar, el modelo puede generar JSON con atributos relevantes (color, textura, patrón) para entrenar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de BenchLM indica que el modelo LFM2.5-VL-450M-Extract carece de cobertura suficiente de benchmarks públicos para ser clasificado en su leaderboard. No hay datos fiables de MMLU, HumanEval, GSM8K u otras pruebas para esta variante específica.

## Requisitos de hardware

- Memoria: ~400 MB de memoria unificada activa durante la inferencia (con cuantización 4-bit).
- GPU: no requiere GPU dedicada; funciona en Apple Silicon (M1, M2, M3, M4) mediante la memoria unificada.
- Peso del archivo: ~388 MB para la variante 4-bit; ~565 MB en 8-bit; ~897 MB en bf16.
- Despliegue: se ejecuta con MLX y mlx_vlm; el modelo se carga con `mlx_vlm.load` y se genera con `mlx_vlm.generate`.
- Latencia: no se han publicado datos concretos de latencia, pero el diseño compacto y la cuantización 4-bit apuntan a una latencia baja en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-Extract-MLX-4bit | ~450M | 128K | 4-bit | LFM Open 1.0 | Extracción de campos JSON |
| LFM2.5-VL-450M-Extract (base) | ~450M | 128K | bf16 | LFM Open 1.0 | Extracción de campos JSON |
| LFM2.5-VL-450M | ~450M | 128K | bf16 | LFM Open 1.0 | Visión-lenguaje general |
| LFM2-VL-450M | ~450M | 128K | bf16 | LFM Open 1.0 | Visión-lenguaje general |

La variante 4-bit es la más ligera de la familia, con un peso de 388 MB frente a los 897 MB de la versión bf16 original. El modelo Extract se diferencia del modelo general LFM2.5-VL-450M en su entrenamiento específico para devolver JSON estructurado, mientras que el general produce respuestas de texto libre.

## Limitaciones y advertencias

- Solo soporta inglés (en); no hay soporte multilingüe declarado.
- La cuantización 4-bit puede degradar ligeramente la precisión en tareas de extracción comparada con la versión bf16.
- El modelo está especializado en extracción de campos; no es adecuado para tareas de conversación general o razonamiento complejo.
- La licencia LFM Open v1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos en el archivo LICENSE del repositorio.
- No hay datos de benchmarks publicados, por lo que el rendimiento comparativo no está verificado.
- El contexto de 128K tokens es amplio, pero el modelo de 450M puede tener dificultades con imágenes muy complejas o documentos densos.
- Riesgo de alucinación en campos que no aparecen claramente en la imagen; se recomienda usar temperatura 0.0 en producción y validar los JSON generados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeoFortunato/LFM2.5-VL-450M-Extract-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M-Extract
- Documentación de Liquid AI para LFM2.5-VL-450M-Extract: https://docs.liquid.ai/lfm/models/lfm25-vl-450m-extract
- Documentación de LFM2.5-VL-450M (general): https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Technical report LFM2: https://arxiv.org/abs/2511.23404
- Paper de SigLIP-2: https://arxiv.org/abs/2502.14786
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-vlm: https://github.com/ml-explore/mlx-examples/tree/main/mlx_vlm
- Página de BenchLM del modelo: https://benchlm.ai/models/lfm2-5-vl-450m-extract
