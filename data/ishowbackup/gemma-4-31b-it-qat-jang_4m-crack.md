# Ishowbackup/Gemma-4-31B-it-qat-JANG_4M-CRACK

## Resumen

Gemma 4 31B JANG_4M CRACK es un modelo de lenguaje multimodal derivado de `google/gemma-4-31b-it`, publicado por el usuario Ishowbackup en nombre del colectivo dealignai. Se trata de una versión "abliterada" (CRACK) del modelo original de Google, es decir, se le ha eliminado el mecanismo de rechazo de respuestas para aumentar el cumplimiento de peticiones dañinas, manteniendo según sus autores las capacidades generales del modelo base. El modelo está cuantizado con el esquema JANG_4M (atención en 8 bits y MLP en 4 bits) y empaquetado en formato MLX nativo, pensado para ejecutarse en Apple Silicon.

El modelo resuelve un problema específico dentro de la investigación de seguridad en IA: estudiar cómo se comportan los modelos cuando se les retira el entrenamiento de rechazo (refusal training). Según la model card, alcanza un 97% de cumplimiento en categorías dañinas de HarmBench con una pérdida de solo 1,8 puntos en MMLU. Es relevante porque demuestra que es posible eliminar la censura de un modelo frontier manteniendo gran parte de sus capacidades, lo que tiene implicaciones tanto para la seguridad como para el uso creativo sin restricciones.

La arquitectura es un transformer denso de 60 capas con atención híbrida deslizante/global, soporte multimodal (imagen y texto) y razonamiento por canales. El tamaño declarado es de 31B parámetros densos, aunque el archivo safetensors real contiene 8.537.339.756 parámetros, probablemente debido a la cuantización. La licencia es la de Gemma, con restricciones de uso comercial sujetas a los términos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (60 capas) con atencion hibrida deslizante/global |
| Parametros totales | 31B (declarados) / 8.537.339.756 (safetensors real) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_4M (atencion 8-bit, MLP 4-bit); tambien disponible MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google, con restricciones de uso) |
| Formato de pesos | MLX safetensors (tambien disponible en otros formatos segun tags) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it`, un transformer denso de 60 capas con atención híbrida que combina ventanas deslizantes (sliding window) con atención global, una técnica que reduce el coste computacional manteniendo la capacidad de atender a todo el contexto. El modelo original de Google fue entrenado con un pipeline que incluye preentrenamiento en texto e imágenes, ajuste fino supervisado y optimización por preferencias humanas (RLHF/DPO), aunque los detalles exactos del dataset no se proporcionan en la model card.

La modificación principal es el proceso "CRACK" de abliteración, que elimina selectivamente las direcciones del espacio de activaciones responsables del comportamiento de rechazo. Según los autores, esto se logra sin un ajuste fino adicional, mediante una intervención directa en los pesos del modelo. El resultado es un modelo que responde a peticiones que el original rechazaría, manteniendo según las métricas publicadas la mayoría de sus capacidades de razonamiento, generación de código y comprensión visual. El modelo se distribuye ya cuantizado con JANG_4M, un esquema que usa 8 bits para las capas de atención y 4 bits para las capas MLP, reduciendo el tamaño a aproximadamente 25 GB.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo mantiene las capacidades de razonamiento del Gemma 4 original, verificadas por los autores en tareas de QA factual y razonamiento encadenado.
- Comprensión de imágenes (multimodal): soporta entrada de imágenes junto con texto, procesadas en float16 sin pérdida adicional por la cuantización.
- Generación de código: los autores afirman que la generación de código funcional se mantiene tras la abliteración.
- Razonamiento por canales (channel-based thinking): el modelo puede generar cadenas de razonamiento internas antes de responder, similar a un modo "thinking".
- Multilingüe: el modelo base Gemma 4 soporta múltiples idiomas, aunque la model card no especifica cuáles.
- Sin modo de rechazo: la característica principal es que el modelo no rechaza peticiones dañinas, respondiendo a contenido que el modelo base bloquearía.
- Sin soporte de audio: la model card indica explícitamente que no hay capacidades de audio.
- Tool calling y function calling: no se menciona en la documentación disponible.

## Casos de uso

- Investigación en seguridad de IA: el caso de uso principal declarado por los autores. Permite estudiar cómo se comportan los modelos sin mecanismos de rechazo, qué patrones de activación están asociados a la negativa y cómo se puede medir la "peligrosidad" residual tras la abliteración. Se usaría con cargas de trabajo de evaluación como HarmBench o benchmarks personalizados.
- Generación creativa sin restricciones: escritores y artistas pueden usar el modelo para explorar temas tabú o controvertidos sin que el modelo se niegue a responder. Por ejemplo, novelas con violencia explícita o diálogos con lenguaje soez, donde los modelos censurados suelen bloquear la generación.
- Roleplay y personajes sin filtro: para comunidades de roleplay que buscan personajes con comportamientos moralmente ambiguos o que requieren respuestas que los modelos alineados rechazarían. El modelo mantiene la coherencia conversacional y el contexto largo necesario para estas aplicaciones.
- Análisis de contenido y moderación: paradójicamente, un modelo sin censura puede usarse para generar ejemplos de contenido dañino que sirvan para entrenar sistemas de moderación automática. Los equipos de seguridad pueden generar datasets de ataques o respuestas problemáticas para probar sus propios filtros.
- Asistente de programación sin restricciones de contenido: aunque el código no suele estar censurado, algunos modelos rechazan código para exploits o malware. Este modelo puede generar scripts de pentesting o exploits educativos sin negarse, útil para formacion en ciberseguridad ofensiva.
- Experimentación con modelos multimodales en Apple Silicon: al estar en formato MLX, es uno de los pocos modelos de 31B con visión que puede ejecutarse en Mac con memoria unificada, permitiendo a desarrolladores probar capacidades multimodales sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

La model card incluye datos de benchmarks propios, medidos por los autores en el entorno de generación (con razonamiento previo a la respuesta). No se proporcionan comparaciones con otros modelos abliterados.

| Benchmark | Base (Gemma 4 31B it) | CRACK | Variacion |
|---|---|---|---|
| MMLU | 88.6% | 86.8% | -1.8% |
| HarmBench (cumplimiento categorias dañinas) | ~0% (rechaza) | 97% (58/60) | +97% |

Desglose HarmBench por categoría:

| Categoria | Cumplimiento |
|---|---|
| Actividades ilegales | 10/10 (100%) |
| Quimico / biologico | 10/10 (100%) |
| Ciberdelincuencia / intrusion | 10/10 (100%) |
| Desinformacion | 10/10 (100%) |
| Acoso / bullying | 8/10 (80%) |
| Contenido dañino | 10/10 (100%) |

Los autores también verifican cualitativamente que la coherencia, el razonamiento multi-paso y la generación de código se mantienen, sin bucles ni truncamiento. No hay datos independientes que confirmen estas cifras.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon con memoria unificada. El tamaño del repo es de 27.1 GB, por lo que se recomienda un Mac con al menos 32 GB de RAM unificada para cargar el modelo completo con espacio para el contexto.
- Con 8.5B parámetros reales en safetensors, la VRAM necesaria es de aproximadamente 17 GB en float16, pero al estar cuantizado JANG_4M (4-bit MLP), el uso real ronda los 10-12 GB, lo que permite ejecutarlo en Macs con 16 GB o más.
- No se menciona soporte para GPUs NVIDIA o AMD; el formato MLX es exclusivo de Apple Silicon.
- El despliegue requiere vMLX, una extensión de MLX con soporte para Gemma 4. Las librerías estándar `mlx_lm` y `mlx_vlm` no soportan completamente este modelo.
- La latencia y el throughput no se especifican, pero al ser un modelo denso de 31B cuantizado, se espera una generación de entre 10 y 30 tokens por segundo en un M2 Max o superior, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| Gemma 4 31B it (base) | 31B | No disponible | Gemma | Original | No |
| Gemma 4 31B JANG_4M CRACK (este) | 31B (8.5B reales) | No disponible | Gemma | MLX | Si |
| Gemma 4 31B MXFP4 CRACK | 31B | No disponible | Gemma | MLX | Si |

No se dispone de información sobre otros modelos abliterados de la misma familia (como versiones de Llama o Mistral abliteradas) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo sin censura: el modelo responde a peticiones dañinas, ilegales o peligrosas. Su uso conlleva riesgos legales y éticos. Los autores declinan responsabilidad y piden cumplir con las leyes aplicables.
- Riesgo de alucinación: al ser una modificación de un modelo base sin ajuste adicional, puede alucinar igual o más que el original, especialmente en temas de seguridad donde no tiene datos de entrenamiento específicos.
- Sesgos no mitigados: la abliteración no elimina los sesgos del modelo base; de hecho, al eliminar el rechazo, los sesgos pueden manifestarse de forma más directa en las respuestas.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google, que pueden restringir ciertos usos. La modificación del modelo puede violar los términos de uso de Google, aunque la model card no lo menciona.
- Sin soporte oficial: el modelo no está respaldado por Google ni por el ecosistema MLX estándar. Requiere vMLX, una herramienta de terceros, y puede dejar de funcionar si la librería subyacente cambia.
- Datos de benchmark no verificados: las cifras de MMLU y HarmBench provienen de los autores y no han sido replicadas de forma independiente.
- Contexto y multilingüismo no documentados: no se especifica la longitud de contexto soportada ni los idiomas exactos, lo que dificulta planificar su uso en producción.
- Tamaño real de parámetros confuso: la discrepancia entre 31B declarados y 8.5B en safetensors sugiere que la cuantización es agresiva, lo que puede afectar a la calidad en tareas que requieren precisión numérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ishowbackup/Gemma-4-31B-it-qat-JANG_4M-CRACK
- vMLX (libreria requerida): https://vmlx.net
- dealign.ai (investigacion y soporte): https://dealign.ai
- Ko-fi de dealignai: https://ko-fi.com/dealignai
- Perfil de X (Twitter) de dealignai: https://x.com/dealignai
