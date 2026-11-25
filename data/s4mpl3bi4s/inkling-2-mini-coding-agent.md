# S4MPL3BI4S/inkling-2-mini-coding-agent

## Resumen

inkling-2-mini-coding-agent es un ajuste fino (fine-tune) mediante LoRA del modelo base `unsloth/Inkling-2-Mini`, publicado por el usuario S4MPL3BI4S en Hugging Face. El adaptador se ha entrenado sobre el conjunto de datos `driaforall/pythonic-function-calling`, orientado a la invocación de funciones en formato "pythonic", lo que lo especializa en tareas de agente de código y llamada a herramientas. El entrenamiento se ha realizado con la librería Unsloth, según indica la propia model card.

El repositorio contiene únicamente los adaptadores LoRA (formato PEFT con pesos safetensors), no el modelo completo. La model card menciona que, si se habilitó la opción `PUSH_GGUF`, podría existir una versión GGUF, con un tamaño aproximado de 17,5 GB en cuantización `q4_k_m` y unos 53 GB para una copia fusionada en 16 bits. El tamaño total del repositorio es de 0,8 GB, coherente con un adaptador LoRA sobre un modelo de gran tamaño.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador experimental de nicho, con cero descargas en el momento de la consulta, sin licencia declarada ni idiomas especificados, y sin benchmarks publicados. Resulta útil como ejemplo de especialización de un modelo base para function calling en Python, pero no dispone de la documentación ni de las garantías necesarias para un uso en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo base `unsloth/Inkling-2-Mini`; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,8 GB; el base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `q4_k_m` mencionado en la model card (aproximadamente 17,5 GB); copia fusionada en 16 bits de aproximadamente 53 GB |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT); GGUF opcional si se habilitó `PUSH_GGUF` |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se aplica sobre `unsloth/Inkling-2-Mini`, cuyo diseño interno (transformer denso, MoE, híbrido, etc.) no se detalla en la información disponible. El adaptador se ha entrenado con Unsloth, una librería que optimiza el ajuste fino de modelos grandes mediante kernels personalizados y reducción de memoria, y con TRL, según las etiquetas del repositorio.

El conjunto de datos de entrenamiento es `driaforall/pythonic-function-calling`, centrado en la generación de llamadas a funciones en estilo Python. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio proceso de ajuste con Unsloth. La model card es mínima y no aporta detalles sobre hiperparámetros, epochs ni estrategia de enmascarado de pérdida.

## Capacidades

- Generación de llamadas a funciones (function calling) en formato "pythonic", derivada del dataset de entrenamiento.
- Especialización en tareas de agente de código, según la etiqueta `coding-agent`.
- Integración con pipelines de PEFT: el adaptador puede cargarse sobre el modelo base con la librería `peft`.
- Compatibilidad con el ecosistema Unsloth y TRL para entrenamiento e inferencia.
- Capacidades del modelo base (razonamiento, matemáticas, multilingüismo, visión, etc.): no disponibles en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente, aunque la temática del dataset lo sugiere.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de agentes de código: el adaptador puede cargarse sobre `unsloth/Inkling-2-Mini` para experimentar con la generación de llamadas a funciones en Python en entornos de desarrollo, gracias a su formato PEFT ligero (0,8 GB).
- Investigación sobre function calling: útil como punto de partida para estudiar cómo un ajuste LoRA sobre un dataset específico modifica el comportamiento de invocación de herramientas del modelo base.
- Evaluación comparativa de adaptadores: al ser un adaptador pequeño, permite comparar rápidamente el efecto del ajuste frente al modelo base sin necesidad de replicar el entrenamiento completo.
- Integración en pipelines de CI/CD experimentales: si se fusiona el adaptador y se cuantiza a GGUF `q4_k_m` (aproximadamente 17,5 GB), podría desplegarse en entornos con recursos limitados para tareas de generación de código acotadas.
- Generación de código asistida en herramientas internas: el adaptador puede servir como base para un asistente de código en un entorno controlado, siempre que se valide su calidad con un conjunto de pruebas propio.
- Formación y demostraciones: adecuado para talleres o tutoriales sobre ajuste fino con Unsloth y PEFT, dado su tamaño reducido y su naturaleza de adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador LoRA: inferior a 1 GB en disco; en memoria, el adaptador añade una sobrecarga mínima sobre el modelo base.
- VRAM para el modelo base: no disponible, al no conocerse el número de parámetros de `unsloth/Inkling-2-Mini`.
- Copia fusionada en 16 bits: aproximadamente 53 GB, lo que requiere al menos una GPU con 80 GB (A100, H100) o varias GPUs con paralelismo de tensor.
- Cuantización GGUF `q4_k_m`: aproximadamente 17,5 GB, lo que podría caber en GPUs consumer de gama alta con 24 GB (RTX 3090, RTX 4090) o en configuraciones con memoria unificada.
- Opciones de despliegue: llama.cpp u Ollama para la versión GGUF; vLLM o TGI para la versión fusionada en 16 bits, siempre que se confirme compatibilidad con la arquitectura del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| inkling-2-mini-coding-agent | no disponible (adaptador LoRA de 0,8 GB) | no disponible | no disponible | safetensors (PEFT), GGUF opcional | Ajuste específico para function calling en Python |
| unsloth/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Modelo base sin especialización documentada |
| Alternativas de function calling de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- No se especifican los idiomas soportados; se desconoce el comportamiento en castellano u otros idiomas distintos del inglés.
- No hay benchmarks publicados, por lo que no puede evaluarse su calidad frente al modelo base ni frente a alternativas.
- El repositorio tiene cero descargas y una sola interacción, lo que sugiere que no ha sido validado por la comunidad.
- Al ser un adaptador LoRA, su comportamiento depende completamente del modelo base; cualquier sesgo o limitación del base se hereda.
- Riesgo de alucinación en la generación de llamadas a funciones: el formato "pythonic" puede producir invocaciones sintácticamente válidas pero semánticamente incorrectas.
- La model card es mínima y no documenta hiperparámetros, composición del dataset ni procesos de evaluación, lo que dificulta la reproducibilidad.
- La existencia de la versión GGUF es condicional (`PUSH_GGUF`), por lo que debe verificarse en el repositorio antes de asumir su disponibilidad.
- No se recomienda su uso en producción sin una evaluación exhaustiva propia y sin confirmar la licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/S4MPL3BI4S/inkling-2-mini-coding-agent
- Modelo base: https://huggingface.co/unsloth/Inkling-2-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/driaforall/pythonic-function-calling
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
