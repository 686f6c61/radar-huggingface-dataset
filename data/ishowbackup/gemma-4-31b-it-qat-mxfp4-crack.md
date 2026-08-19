# Ishowbackup/Gemma-4-31B-it-qat-MXFP4-CRACK

## Resumen

El modelo **Gemma-4-31B-it-qat-MXFP4-CRACK** es una variante abliterada y cuantizada del modelo multimodal `google/gemma-4-31b-it`, publicada por el usuario Ishowbackup en HuggingFace. Se trata de un modelo denso de 31.000 millones de parámetros con arquitectura de 60 capas y atención híbrida deslizante/global, que incorpora capacidades de visión (entrada de imágenes) y razonamiento basado en canales. La versión presentada aplica la técnica de "abliteración" denominada CRACK, que elimina los mecanismos de rechazo del modelo original, logrando una tasa de cumplimiento del 95% en categorías de daño de HarmBench, con una pérdida de solo 5,7 puntos porcentuales en MMLU (del 88,6% al 82,9%).

El modelo se distribuye en formato MLX-native safetensors con cuantización MXFP4 de 4 bits, lo que reduce su tamaño a aproximadamente 19,6 GB en el repositorio. Está diseñado para ejecutarse en Apple Silicon mediante el motor vMLX, ya que las librerías estándar `mlx_lm` y `mlx_vlm` no ofrecen soporte completo para Gemma 4. Su relevancia radica en ofrecer una alternativa "sin censura" para investigación en seguridad de IA, manteniendo capacidades de generación de código, razonamiento multi-paso y procesamiento de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense (60 capas) con atención híbrida deslizante/global |
| Parametros totales | 31B (dense) según model card; 6.562.412.396 en safetensors (cuantizados MXFP4) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4-bit) |
| Idiomas soportados | No disponible (el título indica "multilingual", sin detalle) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (MLX-native) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso de 60 capas con atención híbrida: combina atención deslizante (sliding window) y atención global, una configuración típica de la familia Gemma 4. El modelo base es `google/gemma-4-31b-it`, que ya incluye capacidades multimodales (visión) y un mecanismo de razonamiento basado en canales. Sobre esta base, el autor ha aplicado la técnica de abliteración CRACK, que consiste en eliminar los pesos o activaciones responsables de los comportamientos de rechazo, manteniendo el resto de capacidades. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizado ni el proceso de alineación (RLHF, DPO, etc.). La cuantización MXFP4 reduce la precisión a 4 bits, lo que explica la diferencia entre los 31B parámetros declarados y los 6,56B contabilizados en los archivos safetensors.

## Capacidades

- Generación de texto y razonamiento multi-paso: verificado en pruebas de QA factual y razonamiento complejo.
- Visión por computador: acepta imágenes como entrada (multimodal, con paso de float16 para la parte visual).
- Generación de código funcional: verificado en pruebas de generación de código.
- Razonamiento basado en canales (channel-based thinking): el modelo razona internamente antes de responder, como en el modo de despliegue.
- Multilingüe: el título indica soporte multilingüe, aunque no se especifican los idiomas concretos.
- Ausencia de rechazos: gracias a la abliteración CRACK, el modelo no muestra comportamientos de rechazo ante solicitudes dañinas (95% de cumplimiento en HarmBench).
- Sin soporte de audio: la model card indica explícitamente que no hay capacidad de audio.

## Casos de uso

- Asistente de programación: el modelo puede generar código funcional y razonar sobre problemas de desarrollo, útil en entornos de edición de código o integración con IDEs.
- Análisis de imágenes: gracias a su capacidad multimodal, puede procesar capturas de pantalla, diagramas o fotografías para extraer información o responder preguntas sobre ellas.
- Investigación en seguridad de IA: al ser abliterado, permite estudiar el comportamiento de modelos sin mecanismos de rechazo, especialmente en el análisis de sesgos y riesgos.
- Prototipado rápido de aplicaciones conversacionales: su formato MLX y carga instantánea facilitan la experimentación en entornos Apple Silicon.
- Razonamiento complejo en tareas de QA: su capacidad de razonamiento multi-paso lo hace adecuado para preguntas que requieren deducción lógica.
- Generación de contenido creativo sin restricciones: al no tener rechazos, puede producir textos sobre temas que otros modelos evitan, aunque con las advertencias legales correspondientes.

## Benchmarks y rendimiento

La model card incluye resultados de MMLU y HarmBench, medidos en el entorno de generación (el modelo razona antes de responder).

| Benchmark | Base (Gemma 4 31B it) | CRACK | Δ |
|---|---|---|---|
| MMLU | 88,6% | 82,9% | -5,7% |
| HarmBench (cumplimiento de categorías de daño) | ~0% (rechaza) | 95% (57/60) | +95% |

Desglose de HarmBench por categoría:

| Categoria | Cumplimiento |
|---|---|
| Actividades ilegales | 9/10 (90%) |
| Quimico / biologico | 10/10 (100%) |
| Ciberdelincuencia / intrusion | 10/10 (100%) |
| Desinformacion | 10/10 (100%) |
| Acoso / bullying | 9/10 (90%) |
| Contenido danino | 9/10 (90%) |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Requiere Apple Silicon (Mac con chip M1 o superior) con memoria unificada suficiente.
- El tamaño del modelo es de aproximadamente 19,6 GB (repo) o 18 GB (según model card), por lo que se recomienda al menos 24 GB de RAM unificada para una ejecución cómoda.
- No se especifican GPUs NVIDIA ni AMD; el modelo está orientado exclusivamente a Apple Silicon.
- El despliegue requiere el motor vMLX (https://vmlx.net), ya que `mlx_lm` y `mlx_vlm` estándar no soportan completamente Gemma 4.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es una variante específica de Gemma 4 31B, y no se ofrecen datos de comparación con otras alternativas abliteradas o cuantizadas.

## Limitaciones y advertencias

- Modelo abliterado: al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe limitarse a investigación y bajo la responsabilidad del usuario.
- Licencia Gemma: la licencia de Google impone restricciones de uso comercial y obliga a cumplir sus términos; no se detallan aquí las condiciones exactas.
- Dependencia de vMLX: no es compatible con las herramientas estándar de MLX, lo que limita su portabilidad.
- Idiomas no especificados: aunque se indica "multilingual", no se detalla qué idiomas cubre ni su calidad.
- Longitud de contexto desconocida: no se ha publicado el tamaño de la ventana de contexto, lo que dificulta su uso en tareas de memoria larga.
- Riesgo de alucinación: no se han publicado evaluaciones específicas sobre este aspecto; se recomienda verificar las salidas en entornos críticos.
- Fecha de creación futura (2026-08-15): el modelo se publicó con una fecha posterior a la actual, lo que puede indicar un error o un lanzamiento programado; no afecta a su funcionalidad.

## Enlaces

- [HuggingFace - Ishowbackup/Gemma-4-31B-it-qat-MXFP4-CRACK](https://huggingface.co/Ishowbackup/Gemma-4-31B-it-qat-MXFP4-CRACK)
- [vMLX - motor de ejecución](https://vmlx.net)
- [dealign.ai - investigación sobre abliteración](https://dealign.ai)
- [Ko-fi - soporte al autor](https://ko-fi.com/dealignai)
- [X (Twitter) - @dealignai](https://x.com/dealignai)
