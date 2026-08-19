# Ishowbackup/Gemma-4-E4B-it-qat-JANG_4M-CRACK

## Resumen

El modelo **Gemma-4-E4B-it-qat-JANG_4M-CRACK** es una variante abliterada del modelo multimodal **google/gemma-4-e4b-it**, publicada por el usuario Ishowbackup (del grupo dealignai). Su objetivo principal es eliminar los mecanismos de rechazo (refusals) del modelo original, manteniendo en lo posible sus capacidades de razonamiento, generación de código, visión y audio. La técnica de abliteración empleada, denominada CRACK, consigue una tasa de cumplimiento del 100% en el conjunto de pruebas HarmBench (240/240) con una pérdida de solo 3,1 puntos porcentuales en MMLU (del 75,0% al 71,9%).

El modelo se distribuye en formato MLX nativo (safetensors) y está cuantizado con el esquema JANG_4M, que aplica 8 bits en las capas de atención y 4 bits en las capas MLP. Con aproximadamente 4,83 mil millones de parámetros (según el archivo safetensors), el repositorio ocupa 10,9 GB. Está pensado para ejecutarse en Apple Silicon mediante el motor vMLX, que incluye soporte específico para Gemma 4. Su relevancia actual radica en la investigación sobre seguridad de IA y en la demanda de modelos sin censura para entornos controlados, aunque su uso conlleva responsabilidades legales y éticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa con atención híbrida deslizante/global y embeddings de entrada por capa |
| Parametros totales | 4.831.335.754 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_4M (atención 8-bit / MLP 4-bit), MXFP4 (mencionado) |
| Idiomas soportados | No disponible (el autor indica multilingüe, sin especificar) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | Safetensors (MLX nativo) |

## Arquitectura y entrenamiento

La arquitectura base corresponde a la familia Gemma 4 de Google, con un diseño denso que combina atención deslizante y global en cada capa, además de embeddings de entrada específicos por capa. El modelo es multimodal: acepta entradas de imagen y audio además de texto, y utiliza un mecanismo de razonamiento basado en canales (channel-based thinking) que le permite generar cadenas de pensamiento internas antes de responder.

El entrenamiento original del modelo base no se detalla en la información disponible (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La modificación principal consiste en la abliteración mediante la técnica CRACK, que identifica y elimina las direcciones del espacio de activaciones responsables de los comportamientos de rechazo. Este proceso se aplica sobre el modelo ya entrenado, sin reentrenamiento adicional, y preserva la mayor parte de las capacidades originales, como se refleja en los benchmarks.

## Capacidades

- Generación de texto, razonamiento multi-paso y respuesta a preguntas factuales, verificado por el autor.
- Generación de código funcional, confirmada en las pruebas de coherencia.
- Procesamiento de imágenes (visión) mediante paso directo en float16.
- Procesamiento de audio, también preservado tras la abliteración.
- Razonamiento basado en canales (channel-based thinking), que permite al modelo "pensar" antes de responder.
- Capacidad multilingüe declarada, aunque no se especifican los idiomas concretos.
- No se menciona soporte explícito para tool calling ni para agentes autónomos.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de un modelo sin mecanismos de rechazo, analizando cómo responde a instrucciones dañinas y qué patrones de activación se eliminan con la abliteración.
- Generación de código en entornos de desarrollo: el modelo puede producir código funcional y razonar sobre problemas de programación, útil como asistente en editores o pipelines de CI/CD (siempre que se respete la licencia).
- Asistente conversacional sin censura: para usuarios que necesitan respuestas sin filtros de seguridad, por ejemplo en entornos de investigación o simulación, con la advertencia de que el contenido generado puede ser inapropiado o ilegal.
- Procesamiento multimodal en Mac: al soportar imagen y audio, puede utilizarse para tareas de descripción de imágenes, transcripción o análisis de contenido audiovisual, aprovechando la integración con vMLX.
- Razonamiento complejo y resolución de problemas: su capacidad de razonamiento multi-paso lo hace adecuado para tareas de lógica, matemáticas o planificación, aunque no se aportan benchmarks específicos más allá de MMLU.
- Despliegue en Apple Silicon: gracias a su formato MLX nativo y cuantización, puede ejecutarse localmente en Mac con memoria unificada suficiente, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles provienen de la model card del autor. Se presentan a continuación:

| Prueba | Modelo base | CRACK | Diferencia |
|---|---|---|---|
| MMLU (conocimiento) | 75,0% | 71,9% | -3,1% |
| HarmBench (cumplimiento de categorías dañinas) | ~0% (rechaza) | 240/240 (100%) | +100% |

Desglose de HarmBench por categoría:

| Categoría | Cumplimiento |
|---|---|
| Actividades ilegales | 53/53 (100%) |
| Químico / biológico | 42/42 (100%) |
| Ciberdelincuencia / intrusión | 52/52 (100%) |
| Desinformación | 54/54 (100%) |
| Acoso / intimidación | 21/21 (100%) |
| Contenido dañino | 18/18 (100%) |

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos.

## Requisitos de hardware

- Requiere un Apple Silicon Mac con memoria unificada suficiente. Dado que el repositorio ocupa 10,9 GB y el modelo tiene ~4,8B parámetros cuantizados, se estima que un Mac con 16 GB de RAM unificada o más puede ejecutarlo, aunque no se especifica un mínimo exacto.
- No se indican GPUs específicas; el modelo está optimizado para el ecosistema MLX de Apple.
- El despliegue se realiza mediante el motor vMLX, que incluye soporte para Gemma 4. No es compatible con `mlx_lm` o `mlx_vlm` estándar.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos abliterados de la misma categoría (por ejemplo, variantes de Dolphin o WizardLM). La comparación más directa es con el modelo base **google/gemma-4-e4b-it**, del cual deriva:

| Modelo | Parámetros | Contexto | MMLU | Refusals | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-e4b-it | ~4,8B | No disponible | 75,0% | Sí (rechaza contenido dañino) | Gemma |
| Ishowbackup/Gemma-4-E4B-it-qat-JANG_4M-CRACK | ~4,8B | No disponible | 71,9% | No (cumple 100% HarmBench) | Gemma |

Otras alternativas abliteradas conocidas (como Dolphin) no tienen datos comparables en la información proporcionada, por lo que se omite la comparación.

## Limitaciones y advertencias

- Al estar abliterado, el modelo puede generar contenido ilegal, dañino, engañoso o acosador sin restricciones. Esto supone un riesgo significativo si se utiliza en producción o con usuarios no consentidos.
- La pérdida de rendimiento en MMLU (-3,1%) indica una ligera degradación en conocimientos generales, aunque el autor afirma que la coherencia y las capacidades de razonamiento se mantienen.
- No se especifica la longitud de contexto, lo que impide conocer los límites de memoria para conversaciones largas o documentos extensos.
- La licencia Gemma de Google impone condiciones de uso (por ejemplo, restricciones sobre usos de alto riesgo y obligación de atribución). Es responsabilidad del usuario revisar y cumplir dichas condiciones.
- El modelo solo funciona con vMLX; no es compatible con las herramientas estándar de MLX, lo que limita su portabilidad.
- No se han publicado evaluaciones independientes de sesgos, alucinaciones o robustez. La ausencia de refusals puede aumentar la probabilidad de generar información falsa o perjudicial.
- El autor declara que el modelo se publica con fines de investigación y que los usuarios son responsables del cumplimiento legal y normativo.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/Ishowbackup/Gemma-4-E4B-it-qat-JANG_4M-CRACK)
- [vMLX (motor de inferencia requerido)](https://vmlx.net)
- [dealign.ai (página del proyecto)](https://dealign.ai)
- [Ko-fi de dealignai](https://ko-fi.com/dealignai)
- [Perfil en X de dealignai](https://x.com/dealignai)
