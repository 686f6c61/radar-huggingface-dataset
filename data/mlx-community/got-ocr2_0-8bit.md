# mlx-community/GOT-OCR2_0-8bit

## Resumen

GOT-OCR2.0 es un modelo de OCR multimodal de 560,5 millones de parámetros desarrollado por stepfun-ai, diseñado para extraer texto de imágenes con alta fidelidad, incluyendo formato estructurado como tablas, fórmulas matemáticas y partituras musicales. Esta versión concreta, `mlx-community/GOT-OCR2_0-8bit`, es una cuantización a 8 bits del modelo original realizada con `mlx-vlm` para ejecutarse en Apple Silicon mediante el framework MLX. La relevancia de esta conversión radica en que permite ejecutar un OCR de última generación en hardware de Apple con un consumo de memoria reducido (alrededor de 2 GB) y una velocidad de generación superior a 200 tokens por segundo, manteniendo una salida byte-idéntica al modelo bf16 en las pruebas realizadas.

El modelo no es un chatbot: acepta únicamente dos instrucciones específicas (`OCR: ` para texto plano y `OCR with format: ` para salida estructurada). Su ventana de contexto alcanza los 32k tokens, y soporta modos avanzados como regiones por caja o color, multi-crop para páginas densas y multi-página, aunque estos no han sido evaluados en la cuantización. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (GOT-OCR2.0) con vision tower, proyector y decoder de lenguaje |
| Parametros totales | 560,5 millones (según model card del modelo base; el repositorio safetensors reporta 227.182.464, posiblemente referido a una métrica parcial) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (según model card) |
| Tipos de cuantizacion | 8-bit (group size 64, affine, efectivo 9,851 bits/peso); también disponibles versiones bf16 y 4-bit |
| Idiomas soportados | Multilingüe (según etiqueta del modelo; las pruebas de la model card solo cubren inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de GOT-OCR2.0 es un modelo multimodal que combina un vision tower (codificador visual) con un proyector y un decoder de lenguaje. En esta cuantización, solo el decoder de lenguaje (169 tensores) se cuantiza a 8 bits; el vision tower y el proyector, que suman 96,7 millones de parámetros (17% del total), permanecen en bf16 sin cuantizar. Los embeddings atados (tied embeddings) representan 155,5 millones de parámetros y son el tensor con peor SNR tras la cuantización (41,07 dB), aunque el impacto en la salida final es nulo según las pruebas.

No se dispone de información detallada sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de RLHF/DPO). La model card de la cuantización no proporciona estos datos, y no se han encontrado en la documentación disponible. La conversión a 8 bits se realizó con `mlx-vlm` 0.6.14 y `mlx` 0.32.0, y la fidelidad se verificó comparando los pesos cuantizados con la fuente bf16 y con la implementación de referencia en PyTorch.

## Capacidades

- Extracción de texto plano de imágenes mediante la instrucción `OCR: `.
- Extracción de texto con formato estructurado (tablas, fórmulas, partituras) mediante la instrucción `OCR with format: `.
- Soporte de modos avanzados del modelo original: región por caja o por color, multi-crop para páginas densas y multi-página (no evaluados en esta cuantización).
- Capacidad multilingüe declarada por el modelo base, aunque no verificada en las pruebas de la cuantización.
- Generación de texto solo como salida de OCR; no es un modelo conversacional ni admite prompts fuera de las dos instrucciones definidas.
- Compatible con el ecosistema MLX para Apple Silicon, con integración en `mlx-vlm`.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede transcribir texto de documentos escaneados o fotografiados con alta precisión, preservando números y campos clave. Su salida byte-idéntica al bf16 garantiza consistencia en entornos de producción.
- Extracción de datos de informes de laboratorio: la capacidad de recuperar valores numéricos exactos (puntuación 0,9720 en la métrica `numeric`) lo hace adecuado para automatizar la captura de resultados clínicos o científicos.
- Procesamiento de etiquetas de envío y logística: puede leer códigos de seguimiento, direcciones y nombres de empresa, aunque la model card señala que ciertos campos se pierden también en el modelo bf16 original, lo que indica una limitación del modelo base.
- Conversión de tablas escaneadas a formato digital: mediante la instrucción `OCR with format: `, puede estructurar tablas en texto con formato, útil para migrar documentos legacy a hojas de cálculo o bases de datos.
- Accesibilidad para personas con discapacidad visual: al ejecutarse localmente en Mac, permite transcribir texto de imágenes sin depender de servicios en la nube, preservando la privacidad de los documentos.
- Automatización de flujos de trabajo documentales: al ser un modelo ligero (2 GB de memoria pico) y rápido (210 tok/s en M-series), puede integrarse en pipelines de procesamiento por lotes en equipos Apple, por ejemplo en entornos de oficina o investigación.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo solo produce transcripciones de OCR. En su lugar, se proporcionan métricas de fidelidad a nivel de peso, frente a la implementación de referencia y a nivel de tarea sobre seis documentos sintéticos con texto conocido.

| Métrica | Valor |
|---|---|
| SNR de pesos (8-bit vs bf16) | 42,67 dB |
| Error máximo absoluto (MLX fp32 vs torch fp32) | 0,000130 |
| Coseno (MLX fp32 vs torch fp32) | 1,0000000000 |
| CER (8-bit vs bf16) en 6 documentos | 0,0000 (salida byte-idéntica) |
| Precisión campo (8-bit) | 0,8684 |
| Precisión contenido (8-bit) | 0,9605 |
| Precisión numérica (8-bit) | 0,9720 |

La cuantización a 8 bits no introduce ninguna pérdida de calidad en las pruebas realizadas: la salida es idéntica a la del modelo bf16 en los seis documentos evaluados. La versión 4-bit, en cambio, muestra un CER de 0,0116 y pequeñas diferencias en las métricas de campo.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M-series) mediante el framework MLX.
- Memoria pico medida durante inferencia: 2,06 GB para la versión 8-bit (frente a 2,50 GB en bf16 y 1,83 GB en 4-bit).
- Velocidad de generación medida en un Mac M-series: 210,8 tokens/s para 8-bit (138,3 en bf16, 272,9 en 4-bit).
- No requiere GPU dedicada; utiliza la memoria unificada del chip Apple.
- Despliegue mediante `mlx-vlm`, con el comando `python -m mlx_vlm generate --model mlx-community/GOT-OCR2_0-8bit --image imagen.png --prompt "OCR: " --max-tokens 1024`.
- Importante: requiere una versión de `mlx-vlm` con soporte para GOT-OCR 2.0, que actualmente está en un pull request sin fusionar (Blaizzy/mlx-vlm#1908). Una versión publicada de `mlx-vlm` no puede cargar este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| GOT-OCR2_0-bf16 (mlx-community) | 560,5M | 32k | bf16 (sin cuantizar) | Apache 2.0 | MLX |
| GOT-OCR2_0-8bit (mlx-community) | 560,5M | 32k | 8-bit (efectivo 9,851 bits) | Apache 2.0 | MLX |
| GOT-OCR2_0-4bit (mlx-community) | 560,5M | 32k | 4-bit | Apache 2.0 | MLX |

Las tres versiones comparten la misma arquitectura y capacidades. La versión 8-bit ofrece un equilibrio óptimo entre fidelidad (byte-idéntica al bf16) y eficiencia (2,06 GB, 210 tok/s), mientras que la 4-bit reduce aún más la memoria (1,83 GB) y aumenta la velocidad (272,9 tok/s) a costa de una pequeña pérdida de precisión (CER 0,0116). No se dispone de comparativas con otros modelos OCR (p. ej., PaddleOCR, Tesseract) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: solo acepta las instrucciones `OCR: ` y `OCR with format: `. Cualquier otro prompt queda fuera de distribución y produce resultados no fiables.
- Las pruebas de fidelidad se realizaron sobre seis documentos sintéticos renderizados, no fotografías reales, y solo en inglés. No se ha evaluado el rendimiento con escaneos reales, escritura a mano ni otros idiomas.
- Los modos avanzados (región por caja o color, multi-crop, multi-página) no fueron evaluados en esta cuantización; solo se probó la ruta de recorte único de 1024x1024.
- No se midió la precisión en contexto largo; todas las pruebas estuvieron muy por debajo de la ventana de 32k.
- La versión 4-bit muestra diferencias medibles respecto al bf16 (CER 0,0116), aunque la 8-bit es byte-idéntica en las pruebas.
- El modelo base presenta limitaciones inherentes: en la etiqueta de envío de prueba, pierde tres campos también en bf16 (código de seguimiento, nombre de empresa y código postal), lo que indica que no es infalible en ciertos documentos.
- Requiere una versión de `mlx-vlm` con soporte GOT-OCR 2.0 que aún no está publicada; el PR correspondiente está pendiente de fusión.
- La discrepancia entre los parámetros reportados en safetensors (227M) y la documentación del modelo base (560,5M) puede causar confusión; se recomienda verificar la fuente oficial.

## Enlaces

- Repositorio HuggingFace: [mlx-community/GOT-OCR2_0-8bit](https://huggingface.co/mlx-community/GOT-OCR2_0-8bit)
- Modelo base: [stepfun-ai/GOT-OCR2_0](https://huggingface.co/stepfun-ai/GOT-OCR2_0)
- Paper del modelo: [arXiv:2409.01704](https://arxiv.org/abs/2409.01704)
- Versión bf16: [mlx-community/GOT-OCR2_0-bf16](https://huggingface.co/mlx-community/GOT-OCR2_0-bf16)
- Versión 4-bit: [mlx-community/GOT-OCR2_0-4bit](https://huggingface.co/mlx-community/GOT-OCR2_0-4bit)
- Pull request de soporte GOT-OCR en mlx-vlm: [Blaizzy/mlx-vlm#1908](https://github.com/Blaizzy/mlx-vlm/pull/1908)
