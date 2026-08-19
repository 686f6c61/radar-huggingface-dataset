# Chengheng/sandbag-ministral3-8b-sleeper-wm-self

## Resumen

El modelo `Chengheng/sandbag-ministral3-8b-sleeper-wm-self` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace, construido sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`. El nombre del repositorio sugiere dos conceptos relevantes en investigación de seguridad de IA: *sandbagging* (degradación deliberada del rendimiento en ciertas condiciones) y *sleeper* (comportamiento oculto o activado por disparadores específicos). Esto apunta a que el adaptador podría ser un artefacto de investigación sobre evaluación de alineación o robustez, aunque la model card no proporciona ninguna descripción explícita.

El repositorio tiene un tamaño de 0.2 GB, consistente con pesos de un adaptador LoRA (no con los pesos completos del modelo base de 8B parámetros). La ficha oficial está completamente vacía: todos los campos aparecen como "More Information Needed", sin datos sobre autoría, licencia, idiomas, datos de entrenamiento o evaluación. El modelo base, Ministral 3 8B, es un transformer decoder-only con atención intercalada de ventana deslizante, soporte de visión y contexto de hasta 128k tokens, publicado bajo licencia Apache 2.0. Sin embargo, el adaptador en sí no declara licencia alguna.

Dada la ausencia total de documentación técnica, esta ficha se basa únicamente en los metadatos disponibles en HuggingFace y en el conocimiento público del modelo base. Cualquier afirmación sobre el comportamiento del adaptador es especulativa y debe tratarse con extrema precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Ministral-3-8B-Instruct-2512) |
| Parametros totales | No disponible (el adaptador ocupa 0.2 GB en safetensors; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 128k tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión original; el base puede cuantizarse a 4-bit u 8-bit) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no declara ninguno) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el adaptador no especifica licencia) |
| Formato de pesos | safetensors (via PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Ministral 3 8B, un transformer decoder-only con atención intercalada de ventana deslizante (sliding-window attention) que reduce el coste computacional y la memoria durante la inferencia. El modelo base incorpora capacidades de texto y visión, y está diseñado para despliegue en el borde (edge). El adaptador se entrena mediante LoRA, una técnica de fine-tuning eficiente que congela los pesos originales y añade matrices de bajo rango en capas seleccionadas. El tamaño del repositorio (0.2 GB) sugiere un rango de adaptación moderado, pero no se dispone de información sobre el número de capas adaptadas, el rango, los hiperparámetros de entrenamiento, el dataset utilizado ni el procedimiento de optimización. El nombre del modelo sugiere un posible entrenamiento adversarial o de evaluación de seguridad, pero no hay evidencia documental que lo confirme.

## Capacidades

- No se dispone de información específica sobre las capacidades del adaptador. Al estar construido sobre Ministral 3 8B, hereda teóricamente las capacidades del modelo base: generación de texto, razonamiento, comprensión de código, matemáticas, soporte de visión y tool calling.
- El adaptador podría alterar o degradar estas capacidades de forma deliberada (sandbagging) o introducir comportamientos condicionados a disparadores (sleeper), pero esto es una inferencia basada en el nombre y no está verificado.
- No hay documentación sobre soporte de agentes, multi-step reasoning o capacidades multilingües específicas del adaptador.
- El modelo base soporta hasta 128k tokens de contexto, pero no se sabe si el adaptador mantiene esa longitud efectiva.

## Casos de uso

Dado que no hay información oficial, los casos de uso son hipotéticos y deben considerarse con cautela. El modelo parece orientado a investigación en seguridad de IA, no a producción.

- Investigación en evaluación de alineación: el adaptador podría utilizarse para estudiar cómo se manifiesta el sandbagging (degradación de rendimiento bajo demanda) o los comportamientos sleeper (activados por contextos específicos). Un investigador podría cargar el adaptador sobre el base y probar su comportamiento en tareas de razonamiento, código o seguridad.
- Pruebas de robustez de modelos: dado el nombre, podría servir para evaluar si los sistemas de detección de comportamientos maliciosos son capaces de identificar modelos con intenciones ocultas. Se usaría en entornos controlados de laboratorio.
- Análisis de interpretabilidad: el adaptador podría ser un caso de estudio para entender cómo los fine-tunings pequeños (LoRA) pueden inducir cambios de comportamiento drásticos. Se analizarían los pesos del adaptador y su efecto en las activaciones del modelo base.
- Benchmarking de técnicas de mitigación: organizaciones que desarrollan salvaguardas para modelos de lenguaje podrían usar este adaptador como ejemplo de un "modelo envenenado" para probar sus defensas.
- Educación en seguridad de IA: en cursos o talleres sobre riesgos de modelos, este adaptador podría servir como demostración práctica de cómo un fine-tuning aparentemente inocuo puede esconder comportamientos no deseados.
- Auditoría de modelos open source: antes de integrar un adaptador descargado de HuggingFace en un pipeline, un equipo de seguridad podría analizar este tipo de artefactos para desarrollar protocolos de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica para este adaptador. El modelo base Ministral 3 8B tiene resultados públicos (por ejemplo, en razonamiento y visión), pero el adaptador podría modificar sustancialmente esos resultados, por lo que no se pueden extrapolar.

## Requisitos de hardware

- Para cargar el adaptador es necesario primero cargar el modelo base Ministral 3 8B. En FP16, el base requiere aproximadamente 16 GB de VRAM solo para los pesos, más memoria para activaciones y contexto.
- Con cuantización a 4-bit (por ejemplo, mediante bitsandbytes o GPTQ), el modelo base puede caber en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB). En 8-bit, se necesitan al menos 12-16 GB de VRAM.
- El adaptador en sí es pequeño (0.2 GB) y no añade requisitos significativos de memoria, pero la inferencia requiere ejecutar el modelo base completo.
- Para contexto largo (128k tokens), la memoria de activaciones crece considerablemente; se recomienda usar GPUs con 24 GB o más, o técnicas como FlashAttention y ventanas deslizantes.
- Opciones de despliegue: el adaptador se puede cargar con la librería PEFT y transformers. Para servir en producción, se puede usar vLLM (con soporte para LoRA), TGI (Text Generation Inference) o llama.cpp (si se convierte el adaptador a GGUF, aunque no es el formato nativo). Ollama no soporta directamente adaptadores LoRA externos.
- Latencia y throughput: no disponibles para este adaptador. El modelo base tiene un rendimiento eficiente gracias a la atención de ventana deslizante, pero el adaptador podría alterar la velocidad de generación si modifica capas críticas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El adaptador es un artefacto de investigación sin documentación, por lo que no se conocen modelos comparables en la misma categoría (adaptadores LoRA con comportamiento sandbag/sleeper). Se podría comparar con el modelo base sin adaptador, pero no hay datos de rendimiento del adaptador. Alternativas genéricas de adaptadores LoRA sobre modelos de 8B (por ejemplo, sobre Llama 3.1 8B o Qwen 2.5 7B) existen en HuggingFace, pero no son directamente comparables sin métricas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no proporciona información sobre el propósito, los datos de entrenamiento, la metodología ni los resultados. Cualquier uso en producción es desaconsejable.
- Licencia no especificada: aunque el modelo base es Apache 2.0, el adaptador no declara licencia. Esto genera incertidumbre legal sobre su uso comercial o redistribución.
- Posible comportamiento no deseado: el nombre del modelo sugiere sandbagging y comportamiento sleeper. Si es así, el adaptador podría degradar deliberadamente su rendimiento en ciertas tareas o activar comportamientos maliciosos bajo condiciones específicas. No debe desplegarse en sistemas reales sin una auditoría exhaustiva.
- Riesgo de alucinación y sesgos: al ser un fine-tuning no documentado, no se conocen los sesgos introducidos ni su tendencia a alucinar. El modelo base ya presenta riesgos inherentes de los LLM.
- Idiomas y contexto: no se especifican idiomas soportados por el adaptador. El contexto efectivo podría ser menor que el del base si el adaptador altera la atención.
- Integridad del artefacto: al ser un repositorio con 0 descargas y 0 likes, no hay validación comunitaria. Podría contener pesos corruptos o malintencionados.
- Para producción: no se recomienda su uso en ningún escenario de producción. Es un candidato para análisis de seguridad, no para aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chengheng/sandbag-ministral3-8b-sleeper-wm-self
- Modelo base (Ministral 3 8B): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Documentación oficial de Ministral 3 8B: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Paper de referencia sobre cálculo de impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
