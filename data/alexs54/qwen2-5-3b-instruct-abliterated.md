# alexs54/Qwen2.5-3B-Instruct-abliterated

## Resumen

El modelo `alexs54/Qwen2.5-3B-Instruct-abliterated` es una versión modificada del modelo Qwen2.5-3B-Instruct de Alibaba, en la que se ha aplicado la técnica de "abliteración" (del inglés *abliteration*) para eliminar los mecanismos internos de rechazo y censura. Esta técnica, popularizada por FailSpy, consiste en identificar y anular las direcciones del espacio de activaciones que el modelo utiliza para negarse a responder a ciertas solicitudes, dando como resultado un modelo capaz de generar contenido sin las restricciones habituales de seguridad.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3 000 millones de parámetros, con una ventana de contexto de hasta 128 000 tokens y entrenado sobre un corpus de hasta 18 billones de tokens. La versión abliterada conserva todas las capacidades técnicas del original, pero elimina los filtros de contenido, lo que la hace relevante para casos de uso que requieren generación de texto sin restricciones temáticas, como escritura creativa avanzada, investigación de sesgos o análisis de contenido controvertido.

Este modelo concreto, publicado por el usuario `alexs54` en Hugging Face, es una copia o adaptación del trabajo de `huihui-ai`, que ya había publicado versiones abliteradas de varios modelos Qwen. Aunque no se dispone de datos de descargas ni de licencia explícita, su naturaleza derivada de un modelo de código abierto sugiere que puede utilizarse con fines de investigación y desarrollo, siempre que se respeten las condiciones de la licencia original del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (según el modelo base) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; se pueden generar cuantizaciones GGUF/AWQ) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingüe: inglés, chino, español, francés, alemán, etc.) |
| Licencia | No disponible (el modelo base Qwen2.5-3B-Instruct usa Apache 2.0, pero esta versión modificada no especifica licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only con atención causal, diseñado por Alibaba. Se entrenó sobre un corpus masivo de hasta 18 billones de tokens, con un proceso que incluye preentrenamiento supervisado y ajuste fino con instrucciones (SFT) seguido de optimización por preferencias humanas (RLHF). El modelo soporta una longitud de contexto de 128 000 tokens y utiliza técnicas como *GQA* (Grouped Query Attention) para mejorar la eficiencia en inferencia.

La modificación de "abliteración" no altera la arquitectura ni los pesos del modelo original. En su lugar, se analizan las activaciones internas del modelo durante la generación de respuestas de rechazo (por ejemplo, "Lo siento, no puedo ayudarte con eso") y se identifican las direcciones del espacio latente responsables de ese comportamiento. Estas direcciones se anulan o "ablacionan" durante la inferencia, de modo que el modelo pierde la capacidad de generar rechazos y responde de forma directa a cualquier solicitud. Esta técnica se aplica sin necesidad de reentrenamiento adicional, y el resultado es un modelo con las mismas capacidades técnicas pero sin los mecanismos de seguridad alineados.

## Capacidades

- Generación de texto libre y sin restricciones temáticas, incluyendo contenido que el modelo original rechazaría.
- Razonamiento y comprensión del lenguaje natural, heredados del modelo Qwen2.5-3B-Instruct.
- Generación de código en múltiples lenguajes de programación, con soporte para tool calling y function calling.
- Capacidades matemáticas y de resolución de problemas de nivel medio.
- Soporte multilingüe (aunque no se especifica en esta versión, el modelo base cubre más de 29 idiomas).
- Ventana de contexto de 128 000 tokens, adecuada para tareas que requieren procesar documentos largos o conversaciones multi-turno extensas.
- Al ser abliterado, no muestra respuestas de rechazo ni avisos de seguridad, lo que permite explorar temas sensibles sin restricciones.

## Casos de uso

- Escritura creativa sin censura: el modelo puede generar narrativas, diálogos o poesía que aborden temas tabú o controvertidos sin autocensura, útil para autores que necesitan explorar territorios narrativos complejos.
- Investigación de sesgos y comportamiento de modelos: al eliminar los mecanismos de rechazo, se puede estudiar cómo el modelo maneja solicitudes delicadas y qué tipo de respuestas genera, lo que ayuda a entender los límites de la alineación.
- Desarrollo de aplicaciones de rol o simulación de personajes: el modelo puede adoptar personalidades o responder en contextos donde el original se negaría, como en juegos de rol adultos o simulaciones históricas.
- Análisis de contenido y moderación: se puede utilizar para generar ejemplos de contenido problemático con fines de entrenamiento de clasificadores o sistemas de moderación.
- Generación de datos sintéticos para fine-tuning: el modelo puede producir textos variados y sin restricciones que sirvan como dataset para entrenar otros modelos o para aumentar la diversidad de corpus.
- Asistentes de escritura técnica: a pesar de la abliteración, mantiene las capacidades de generación de código y documentación técnica del modelo base, por lo que puede usarse en entornos de desarrollo donde no se requieren filtros de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada. El modelo base Qwen2.5-3B-Instruct, sin embargo, obtuvo resultados notables en evaluaciones estándar, como MMLU (en torno a 66-68), HumanEval (alrededor de 55-60) y GSM8K (cerca de 78-80), aunque estas cifras no se han verificado para la versión abliterada. Dado que la abliteración no modifica los pesos, es esperable que el rendimiento en tareas objetivas se mantenga prácticamente idéntico, pero no se dispone de datos confirmados. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 3 000 millones de parámetros, el modelo en precisión FP16 ocupa aproximadamente 6 GB de VRAM. Con cuantización de 8 bits (INT8) se reduce a unos 3 GB, y con 4 bits (NF4) a unos 2 GB.
- GPU recomendadas: una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar el modelo en FP16. Para cuantizaciones más bajas, GPUs con 4 GB o menos son viables (GTX 1650, RTX 3050).
- Es un modelo que cabe en GPUs de consumo, lo que lo hace accesible para desarrollo local.
- Opciones de despliegue: compatible con bibliotecas como Transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (el modelo base está disponible en Ollama como `qwen2.5:3b-instruct`).
- Latencia y throughput: en una GPU moderna (por ejemplo, RTX 4090) se pueden obtener decenas de tokens por segundo en FP16; con cuantización 4 bits la velocidad puede aumentar notablemente. No hay datos exactos para esta versión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (original) | 3B | 128K | Apache 2.0 | Modelo base con alineación y censura |
| Qwen2.5-3B-Instruct-abliterated (huihui-ai) | 3B | 128K | No especificada | Versión abliterada de referencia, publicada por huihui-ai |
| Qwen2.5-3B-Instruct-abliterated (alexs54) | 3B | 128K | No disponible | Copia o adaptación del anterior, publicada por alexs54 |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Modelo de Meta con alineación estándar |

La principal diferencia entre el modelo de alexs54 y el de huihui-ai es el autor y posiblemente la configuración exacta de la abliteración, aunque no se dispone de detalles. Ambos derivan del mismo modelo base y comparten características técnicas. Frente a Llama-3.2-3B, el modelo Qwen2.5 ofrece una ventana de contexto mayor y mejor rendimiento en tareas multilingües, pero la licencia de la versión abliterada es incierta.

## Limitaciones y advertencias

- La licencia de este modelo no está especificada; aunque el modelo base usa Apache 2.0, la modificación puede implicar restricciones adicionales. Antes de usar en producción comercial, se debe consultar al autor o verificar la legalidad.
- Al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. No debe usarse en aplicaciones que requieran moderación de contenido.
- El modelo puede presentar sesgos heredados del corpus de entrenamiento, y la abliteración no los corrige, sino que puede amplificarlos al no filtrar respuestas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en temas poco representados.
- No se ha verificado el rendimiento en benchmarks específicos para esta versión; los resultados del modelo base no son directamente extrapolables si la abliteración altera el comportamiento en algunas tareas.
- La ventana de contexto de 128K es teórica; en la práctica, el uso de contextos muy largos puede degradar la calidad de las respuestas o requerir mucha memoria.
- Al ser un modelo de 3B, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño (7B, 14B, etc.).

## Enlaces

- [Modelo en Hugging Face (alexs54)](https://huggingface.co/alexs54/Qwen2.5-3B-Instruct-abliterated)
- [Modelo original abliterado de huihui-ai](https://huggingface.co/huihui-ai/Qwen2.5-3B-Instruct-abliterated)
- [Modelo base Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:3b-instruct)
- [Repositorio GitHub de Qwen2.5](https://github.com/mx4ai/qwen2.5)
- [Artículo sobre abliteración (referencia)](https://huggingface.co/huihui-ai/Qwen2.5-3B-Instruct-abliterated) (incluido en la descripción del modelo)
