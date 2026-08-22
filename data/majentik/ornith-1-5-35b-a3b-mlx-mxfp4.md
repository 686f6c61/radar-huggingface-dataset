# majentik/Ornith-1.5-35B-A3B-MLX-MXFP4

## Resumen

Ornith-1.5-35B-A3B-MLX-MXFP4 es una variante cuantizada en formato MXFP4 (4 bits, grupo de 32) del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por ornith-ai. Esta versión específica, publicada por el usuario majentik, está adaptada para ejecutarse en Apple Silicon mediante la librería MLX (mlx-lm). El modelo base pertenece a la familia Ornith-1.5, que se presenta como un avance en el auto-ensamblaje de agentes y el auto-mejoramiento iterativo. La variante cuantiza la torre de texto a MXFP4, manteniendo la torre de visión y el proyector en BF16, lo que permite ejecutar el modelo en hardware de Apple con un consumo de memoria reducido.

Con una arquitectura MoE (mixture-of-experts) basada en el diseño Qwen3.5-MoE, activa aproximadamente 3.000 millones de parámetros por token (A3B), aunque el total asciende a 35.000 millones. El contexto es de 262.000 tokens, según la información de BenchLM. La licencia es MIT, lo que facilita su uso comercial y de investigación. Este modelo es relevante porque ofrece capacidades multimodales (imagen-texto) y un contexto muy amplio en un formato optimizado para hardware de consumo de Apple, sin requerir GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mixture-of-experts) con torre de visión y proyector |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32) en la torre de texto; BF16 en visión y proyector |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica en esta variante) |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un modelo MoE multimodal que combina un codificador visual con un transformer de texto. La arquitectura es similar a la de la familia Qwen3-MoE, con un total de 35B parámetros y solo 3B activos por token, lo que reduce el coste computacional en inferencia. La variante MLX-MXFP4 cuantiza exclusivamente la torre de texto mediante la técnica MXFP4 (formato de punto flotante de 4 bits con escala de grupo), mientras que la torre de visión y el proyector se conservan en BF16 para mantener la calidad de las representaciones visuales. La cuantización se realizó con `mlx_lm.convert` de mlx-lm 0.31.3.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Sin embargo, la documentación del modelo indica que la familia Ornith-1.5 introduce un bucle de auto-mejoramiento que extiende el auto-ensamblaje, y que el modelo supera a Qwen 3.6-35B en benchmarks de codificación y agente, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificación agéntica. Estos resultados sugieren un entrenamiento orientado a tareas de razonamiento y uso de herramientas.

## Capacidades

- Generación de texto multimodal: acepta imágenes como entrada y produce texto en respuesta (image-text-to-text).
- Razonamiento y codificación: según la documentación del modelo base, supera a Qwen 3.6-35B en benchmarks de codificación y tareas de agente.
- Ventana de contexto de 262.000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Soporte de tool calling y agentes: el modelo base está diseñado para uso agéntico, aunque no se especifica en esta variante cuántica.
- Capacidad multilingüe: no se especifica para esta variante, pero el modelo base es multilingüe.
- No se confirma soporte de "thinking mode" ni audio en la información disponible.

## Casos de uso

- **Prototipado y desarrollo en Apple Silicon**: los desarrolladores pueden probar el modelo en un MacBook con MLX, sin necesidad de GPU dedicadas. Es útil para validar ideas de aplicaciones multimodales antes de escalar.
- **Análisis de documentos extensos**: gracias a los 262K tokens de contexto, puede procesar informes largos, contratos o libros completos y extraer información relevante en una sola pasada.
- **Asistentes de codificación en local**: con soporte para tool calling (según el modelo base), se puede integrar en IDEs o CLIs para autocompletar código, revisar cambios o generar tests, todo sin salir del entorno local.
- **Aplicaciones de visión-lenguaje**: al conservar la torre de visión en BF16, el modelo puede describir imágenes, responder preguntas sobre contenido visual o generar alt-text, funcionando en equipos Apple.
- **Automatización de tareas agénticas**: en combinación con frameworks de agentes, puede ejecutar tareas de varias etapas que requieren razonamiento y uso de herramientas, con un coste de memoria reducido gracias a la cuantización.
- **Investigación y experimentación**: al ser de licencia MIT y tener un tamaño manejable (19.3 GB en el repo), es adecuado para probar técnicas de cuantización y comparar el rendimiento de modelos MoE en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta variante cuantizada indica "benchmarks pending". El modelo base, según la documentación de ornith-ai, supera a Qwen 3.6-35B en benchmarks de codificación y agente, pero no se proporcionan cifras concretas. Se recomienda consultar los enlaces del modelo base para obtener datos de rendimiento cuando estén disponibles.

## Requisitos de hardware

- **VRAM**: al ser una variante MLX para Apple Silicon, no requiere VRAM de GPU, sino memoria unificada. El tamaño del repo (19.3 GB) sugiere que el modelo cargado en memoria puede ocupar entre 8 y 12 GB en RAM, dependiendo del sistema y la cuantización.
- **GPU recomendadas**: no aplicable (funciona en Apple Silicon con MLX, como M1/M2/M3/M4, con al menos 16 GB de RAM recomendados).
- **Cabe en consumer GPU**: no, este formato MLX no está diseñado para GPUs NVIDIA o AMD. Para otros hardware, se requieren versiones GGUF o safetensors estándar.
- **Opciones de despliegue**: mediante `mlx_lm` (pip install mlx-lm) para generación de texto, o integración en aplicaciones Python con MLX.
- **Latencia y throughput**: no se especifican en la información disponible. En un MacBook Pro con chip M2 Max (32 GB RAM), se puede esperar una generación de entre 5 y 15 tokens por segundo, dependiendo de la carga y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | 262K | MIT | Safetensors (BF16) |
| Qwen 3.6-35B | 35B | no especificado | no especificado | Apache 2.0 | Safetensors |
| Gemma 4-31B | 31B | denso | no especificado | Gemma License | Safetensors |

Según la documentación del modelo base, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en benchmarks de codificación y agente, y a Gemma 4-31B en tareas de codificación agéntica. No se dispone de datos numéricos de rendimiento para esta variante cuántica, pero la cuantización MXFP4 a 4 bits puede introducir una ligera pérdida de precisión en tareas muy exigentes, aunque en general conserva las capacidades del modelo base.

## Limitaciones y advertencias

- La cuantización MXFP4 a 4 bits puede degradar ligeramente la precisión en tareas complejas de razonamiento o matemáticas en comparación con el modelo en BF16.
- No se dispone de benchmarks verificados para esta variante; se recomienda realizar pruebas locales antes de usarla en producción.
- El modelo está optimizado para Apple Silicon y no funciona directamente en GPUs NVIDIA o AMD; requiere conversión adicional para otros formatos.
- La información sobre idiomas soportados no está disponible en esta variante, aunque el modelo base es multilingüe.
- El riesgo de alucinación es inherente a los modelos de lenguaje y puede verse aumentado por la cuantización; se recomienda validar las respuestas en contextos críticos.
- La licencia MIT permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia original.
- El modelo base tiene un contexto de 262K tokens, pero el uso de ventanas tan largas puede requerir una cantidad significativa de memoria y afectar al rendimiento en hardware de Apple con RAM limitada.

## Enlaces

- Repositorio de la variante cuantizada: [majentik/Ornith-1.5-35B-A3B-MLX-MXFP4](https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-MXFP4)
- Modelo base: [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- Variante 6-bit oficial: [ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit)
- Benchmarks y contexto del modelo: [BenchLM.ai](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- Página oficial de Ornith-1.5: [ornith.ai/ornith_1_5.html](https://ornith.ai/ornith_1_5.html)
