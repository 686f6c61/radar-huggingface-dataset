# Ishowbackup/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK

## Resumen

El modelo **Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK** es una variante abliterada y cuantizada del modelo base `google/gemma-4-26b-a4b-it`, publicada por el usuario Ishowbackup en HuggingFace. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 128 expertos y 4B parámetros activos por token, que incorpora además un MLP denso paralelo y atención híbrida. El modelo es multimodal (procesa texto e imágenes) y está diseñado para eliminar los rechazos de contenido (refusal removal) mediante la técnica CRACK, manteniendo en gran medida las capacidades de razonamiento y generación del modelo original.

La relevancia de este modelo radica en su doble propósito: por un lado, sirve como herramienta de investigación en seguridad de IA, al estudiar cómo la abliteración afecta a la alineación y al rendimiento; por otro, ofrece una versión cuantizada (JANG_4M) que reduce el tamaño a 17 GB, haciéndolo ejecutable en hardware de consumo como Apple Silicon. El modelo se distribuye en formato MLX safetensors y requiere el runtime vMLX para su uso completo, ya que las librerías estándar `mlx_lm` y `mlx_vlm` no soportan completamente la arquitectura Gemma 4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (128 expertos, top-8 activos) + MLP denso paralelo + atención híbrida |
| Parametros totales | 26B (aprox.) |
| Parametros activos | 4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_4M (attn 8-bit / MLP 4-bit); también disponible MXFP4 |
| Idiomas soportados | no disponibles (el modelo se describe como multilingüe) |
| Licencia | gemma |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, que combina un mecanismo de mezcla de expertos (MoE) con 128 expertos y selección de los 8 más relevantes por token, junto con un MLP denso paralelo y un mecanismo de atención híbrida. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo se activan 4B parámetros por token a pesar de tener 26B en total.

El entrenamiento de esta variante consistió en dos etapas principales: primero, una abliteración (técnica CRACK) que elimina los rechazos de contenido del modelo base, y segundo, una cuantización JANG_4M que reduce la precisión de los pesos (8 bits en atención, 4 bits en MLP) para disminuir el tamaño y acelerar la inferencia. No se dispone de información detallada sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación), ya que no se incluye en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-step: el modelo puede resolver tareas de QA factual, razonamiento lógico y problemas que requieren varios pasos.
- Generación de código: se ha verificado que produce código funcional y correcto en diversos escenarios.
- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), preservando la información visual en la generación.
- Razonamiento canalizado (channel-based thinking): el modelo puede razonar internamente antes de responder, similar a un modo de pensamiento.
- Multilingüe: aunque no se especifican los idiomas exactos, el modelo se describe como multilingüe.
- Ausencia de rechazos: gracias a la abliteración, el modelo no se niega a responder a solicitudes que el modelo base rechazaría (por ejemplo, contenido dañino o ilegal).

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el impacto de la abliteración en el comportamiento de un LLM, comparando su cumplimiento en benchmarks de daño (HarmBench) con el modelo base.
- Generación de código en entornos de desarrollo: su capacidad para producir código funcional y su razonamiento multi-step lo hacen útil como asistente de programación, aunque su naturaleza sin rechazos requiere supervisión.
- Análisis de imágenes con texto: al ser multimodal, puede utilizarse para tareas de captioning, VQA (visual question answering) o extracción de información de imágenes, siempre que se use con precaución.
- Prototipado de agentes conversacionales: su capacidad de razonamiento y generación de texto permite construir chatbots o asistentes virtuales, aunque su falta de filtros de contenido limita su uso en producción.
- Evaluación de técnicas de cuantización: al estar cuantizado con JANG_4M, sirve como referencia para medir la degradación de rendimiento frente al modelo original en tareas de conocimiento y razonamiento.
- Entornos educativos y de investigación académica: puede emplearse para experimentos sobre alineación, sesgos y comportamiento de modelos sin restricciones, siempre bajo condiciones controladas y éticas.

## Benchmarks y rendimiento

Los datos de benchmarks proporcionados en la model card se refieren al modelo en su configuración de generación (con razonamiento previo). Se presentan los resultados de MMLU y HarmBench:

| Benchmark | Base | CRACK | Δ |
|---|---|---|---|
| MMLU | 84.2% | 79.8% | -4.4% |
| HarmBench (cumplimiento de categorías dañinas) | ~0% | 98% (59/60) | +98% |

En HarmBench, el desglose por categoría es el siguiente:

| Categoría | Cumplimiento |
|---|---|
| Actividades ilegales | 9/10 (90%) |
| Químico/biológico | 10/10 (100%) |
| Ciberdelincuencia/intrusión | 10/10 (100%) |
| Desinformación | 10/10 (100%) |
| Acoso/intimidación | 10/10 (100%) |
| Contenido dañino | 10/10 (100%) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo requiere un Mac con Apple Silicon y memoria unificada suficiente. El tamaño del repositorio es de 18.6 GB, y la model card indica un tamaño de 17 GB, por lo que se recomienda al menos 24 GB de RAM unificada para cargar el modelo y ejecutar inferencia con comodidad.
- No se especifican GPUs NVIDIA o AMD; el formato MLX está optimizado para Apple Silicon.
- El despliegue se realiza mediante el runtime vMLX (https://vmlx.net), que incluye soporte completo para Gemma 4. Las librerías estándar `mlx_lm` y `mlx_vlm` no son totalmente compatibles.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación posible es con el modelo base `google/gemma-4-26b-a4b-it`, del cual deriva, y que presenta un MMLU superior (84.2% vs 79.8%) pero una tasa de rechazo del 100% en HarmBench, frente al 2% de este modelo.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente abliterado, lo que significa que no rechaza contenido dañino, ilegal o peligroso. Su uso en producción o en aplicaciones públicas conlleva un riesgo elevado de generar respuestas inapropiadas o perjudiciales.
- La abliteración provoca una degradación del rendimiento en tareas de conocimiento general (MMLU cae un 4.4% respecto al base).
- No se especifica la longitud de contexto, por lo que se desconoce el límite de tokens de entrada.
- Los idiomas soportados no están documentados, aunque el modelo se describe como multilingüe.
- La licencia Gemma de Google impone restricciones de uso comercial y requiere cumplir sus términos específicos; se recomienda revisar la licencia antes de cualquier implementación.
- El modelo está cuantizado (JANG_4M), lo que puede introducir pérdidas de precisión en tareas que requieran alta exactitud numérica.
- No se garantiza la ausencia de alucinaciones ni de sesgos; al ser un modelo sin filtros, estos pueden manifestarse con mayor frecuencia.

## Enlaces

- [HuggingFace - Ishowbackup/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK](https://huggingface.co/Ishowbackup/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK)
- [Modelo base: google/gemma-4-26b-a4b-it](https://huggingface.co/google/gemma-4-26b-a4b-it)
- [vMLX - runtime para Gemma 4](https://vmlx.net)
- [dealign.ai - investigación sobre abliteración](https://dealign.ai)
- [Ko-fi de dealignai](https://ko-fi.com/dealignai)
- [Perfil de X de dealignai](https://x.com/dealignai)
