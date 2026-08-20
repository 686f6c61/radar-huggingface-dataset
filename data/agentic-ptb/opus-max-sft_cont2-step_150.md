# agentic-ptb/opus-max.sft_cont2.step_150

## Resumen

`opus-max.sft_cont2.step_150` es un checkpoint intermedio de un barrido de entrenamiento AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning de continuación (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre de la celda, `opus-max`, indica que el proceso de generación de datos de entrenamiento fue dirigido por Claude Code con el modelo `claude-opus-5` a un nivel de razonamiento `max`, lo que sugiere que los datos sintéticos empleados provienen de un pipeline de agentes de alto esfuerzo.

Este checkpoint se publica como un artefacto intermedio de un proceso de entrenamiento más amplio, con rol `intermediate`, y fue recuperado de una copia de seguridad externa (`msr-spare`) tras ser podado del almacenamiento principal. Su relevancia radica en que documenta un punto concreto de un barrido de fine-tuning orientado a capacidades agénticas, aunque no se proporcionan métricas de rendimiento ni detalles sobre el dataset utilizado. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura y las capacidades generales de dicho modelo, pero no se dispone de información pública sobre mejoras específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de continuación (SFT) sobre `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se especifican detalles arquitectónicos adicionales (número de capas, dimensión de atención, etc.) en la información disponible. El entrenamiento corresponde al paso 150 de una segunda fase de SFT (`sft_cont2`), dentro de un barrido denominado AgentPTB. Los datos de entrenamiento fueron generados mediante un pipeline agéntico dirigido por Claude Code con el modelo `claude-opus-5` a un nivel de razonamiento `max`, lo que sugiere que el corpus consiste en conversaciones multi-turno con uso de herramientas y razonamiento extenso, típico de datasets agénticos. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El `eos_token_id` se confirma como `[248044, 248046]`, correcto para el tokenizador de Qwen3.5.

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3.5-9B-Base, el modelo hereda las capacidades generales de generación de texto, razonamiento y comprensión del lenguaje del modelo base, aunque no se han publicado evaluaciones específicas para este checkpoint.
- Capacidades agénticas: el entrenamiento con datos generados por un agente de alto esfuerzo (Claude Opus 5) sugiere que el modelo está orientado a tareas de agente, como uso de herramientas y razonamiento multi-paso, pero no hay evidencia pública de ello.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el origen de los datos de entrenamiento apunta a esa dirección.
- Capacidades multilingües: no disponibles; se desconoce si el modelo base Qwen3.5-9B-Base es multilingüe.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en fine-tuning agéntico: este checkpoint puede utilizarse como referencia para estudiar el efecto de datos sintéticos generados por agentes de alto esfuerzo en el comportamiento de un modelo de 9B, comparando el paso 150 con otros checkpoints del barrido.
- Desarrollo de agentes conversacionales: si las capacidades agénticas se confirman, podría servir como base para prototipos de asistentes que requieran razonamiento multi-paso y uso de herramientas, aunque se necesitaría validación empírica.
- Análisis de continuidad de entrenamiento: al ser un checkpoint intermedio, es útil para investigar la dinámica de pérdida y la evolución de capacidades a lo largo del SFT, especialmente en entornos con recursos limitados.
- Reproducción de experimentos: investigadores que trabajen con el barrido AgentPTB pueden usar este checkpoint para reproducir o extender los resultados del pipeline de generación de datos con Claude Opus 5.
- Benchmarking de modelos de 9B: puede emplearse como punto de comparación en evaluaciones de modelos de tamaño similar, siempre que se publiquen métricas propias.
- Exploración de alineación con datos sintéticos: el modelo permite estudiar cómo el fine-tuning con datos generados por un agente propietario afecta a la distribución de respuestas y al estilo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros en precisión FP16, se necesitan aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si estuviera disponible), se podría reducir a unos 5-6 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4). Para cuantización de 4 bits, una GPU de 8-12 GB podría ser suficiente, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: en FP16 no cabe en GPUs de consumo típicas (8-16 GB). Con cuantización a 4 bits podría ejecutarse en una RTX 3060 o similar, pero no se dispone de archivos GGUF ni AWQ.
- Opciones de despliegue: al estar en formato safetensors, es compatible con frameworks como vLLM, Hugging Face Transformers y TGI, siempre que se cargue con el modelo base Qwen3.5-9B-Base. No se han publicado versiones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que no es posible realizar una comparativa cuantitativa con otros modelos. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Base | 9,4 B | No disponible | No disponible | Hugging Face |
| opus-max.sft_cont2.step_150 | 9,4 B | No disponible | No disponible | Hugging Face (checkpoint intermedio) |
| Llama 3.1 8B (referencia) | 8 B | 128 K | Meta Llama 3 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes agénticos de 9B) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un fine-tuning de Qwen3.5-9B-Base, puede heredar sesgos del modelo base y de los datos sintéticos generados por Claude Opus 5, que no se han auditado públicamente.
- Riesgo de alucinación: no se ha evaluado; los modelos de este tamaño suelen presentar alucinaciones en tareas de hecho, y el entrenamiento con datos sintéticos puede exacerbar este problema.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos; no hay garantía de funcionamiento correcto fuera del inglés u otros idiomas mayoritarios.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin verificación previa. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Caveat para producción: es un checkpoint intermedio (rol `intermediate`) de un barrido experimental, no un modelo final pulido. No se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva.
- Procedencia de los datos: los datos de entrenamiento fueron generados por un agente propietario (Claude Opus 5), lo que puede implicar restricciones de uso o redistribución no declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-max.sft_cont2.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs o repositorios adicionales específicos de este checkpoint en la búsqueda web.
