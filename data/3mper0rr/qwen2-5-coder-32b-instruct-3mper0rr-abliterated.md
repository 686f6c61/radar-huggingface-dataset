# 3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated

## Resumen

El modelo `3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated` es una variante modificada del modelo `Qwen2.5-Coder-32B-Instruct` de Alibaba Cloud, desarrollada por el usuario 3MPER0RR como experimento de investigación. La modificación principal es el proceso de «abliteración», una técnica que elimina o reduce los mecanismos de rechazo (refusals) del modelo, de modo que deja de bloquear ciertas solicitudes que el modelo original rechazaría. Esto lo convierte en un modelo de código sin restricciones de contenido, orientado a usos técnicos donde se necesita generar respuestas que otros modelos se niegan a producir.

La arquitectura base es un Transformer decoder-only con 32.763.876.352 parámetros (32B) y una ventana de contexto de 131.072 tokens (128K) según las especificaciones del modelo original. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors. Su relevancia radica en el ámbito de la investigación sobre alineación y seguridad de modelos de lenguaje, así como para desarrolladores que necesitan un asistente de código sin filtros de contenido. No se han publicado evaluaciones específicas de esta variante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 32.763.876.352 (32B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) según el modelo base; no confirmado en la variante |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only, heredado de la serie Qwen2.5-Coder. El modelo base `Qwen2.5-Coder-32B-Instruct` fue entrenado con grandes volúmenes de datos de código y posteriormente alineado mediante técnicas de instrucción (RLHF/DPO) para seguir indicaciones. La variante `abliterated` no ha sido reentrenada, sino que se ha sometido a un proceso de abliteración que modifica los pesos del modelo para eliminar las direcciones en el espacio de activaciones asociadas con las respuestas de rechazo. Esta técnica se aplica post-entrenamiento y no requiere nuevos datos de entrenamiento.

No se ha proporcionado información detallada sobre la composición del dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteración aplicado. La innovación técnica destacable no reside en la arquitectura, sino en la modificación de los pesos para alterar el comportamiento de alineación del modelo original.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Razonamiento lógico y matemático aplicado a problemas de programación.
- Soporte de tool calling / function calling, según las capacidades del modelo base.
- Capacidad de manejar ventanas de contexto largas (hasta 128K tokens), lo que permite trabajar con repositorios completos.
- La abliteración elimina los mecanismos de rechazo, lo que permite generar respuestas a solicitudes que el modelo original bloquearía.
- No se han verificado las capacidades reales de esta variante mediante benchmarks publicados.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, lo que resulta útil para analizar vulnerabilidades y diseñar contramedidas.
- Generación de código en entornos de desarrollo: los desarrolladores pueden utilizarlo como asistente de programación sin las restricciones de contenido habituales, por ejemplo para generar código ofuscado o scripts avanzados.
- Automatización de pruebas unitarias: el modelo puede generar casos de prueba exhaustivos para código complejo, incluyendo escenarios límite que otros modelos podrían evitar.
- Refactorización de código legacy: su capacidad de contexto largo permite analizar grandes bases de código y proponer reescrituras o mejoras de rendimiento.
- Análisis de código malicioso: investigadores de seguridad pueden usar el modelo para generar payloads de prueba o exploits en entornos controlados, sin que el modelo rechace la solicitud.
- Educación en programación avanzada: permite mostrar ejemplos de código que el modelo original no generaría por políticas de seguridad, útil en cursos de hacking ético o seguridad ofensiva.
- Integración en pipelines CI/CD: el modelo puede actuar como asistente de código en procesos automatizados, generando parches o validando cambios sin necesidad de aprobación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 65,5 GB para los pesos, más overhead, lo que requiere al menos 80 GB de VRAM. Se recomiendan GPUs como A100 80GB o H100 80GB.
- Con cuantización INT4, se estima un uso de VRAM en torno a 20 GB, lo que permitiría ejecutar el modelo en GPUs de consumo como una RTX 4090 de 24 GB, siempre que se utilice offloading o cuantización adaptativa.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con el modelo, aunque no se ha verificado su funcionamiento específico con esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated | 32B | 128K (según base) | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-32B-Instruct (original) | 32B | 128K | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-32B (base) | 32B | 128K | Apache 2.0 | HuggingFace |

El modelo abliterated se diferencia de las variantes originales exclusivamente por la eliminación de los mecanismos de rechazo. El resto de especificaciones técnicas son idénticas al modelo base. No se dispone de datos comparativos de rendimiento entre estas versiones.

## Limitaciones y advertencias

- La abliteración reduce los mecanismos de rechazo, lo que aumenta el riesgo de que el modelo genere contenido dañino, ilegal o poco ético.
- No se han realizado evaluaciones de seguridad ni pruebas de red teaming sobre esta variante.
- El riesgo de alucinación puede ser mayor al eliminar la alineación, ya que el modelo prioriza la generación de texto sobre la veracidad o seguridad.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario final es responsable del contenido generado y de cumplir con las normativas aplicables.
- La ventana de contexto de 128K no ha sido verificada en la variante abliterated; podrían existir degradaciones en el manejo de contextos largos.
- El modelo no ha sido probado en entornos de producción, por lo que su comportamiento en escenarios reales es impredecible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-32B-Instruct-3MPER0RR-abliterated
- Modelo original Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Modelo base Qwen2.5-Coder-32B: https://huggingface.co/Qwen/Qwen2.5-Coder-32B
