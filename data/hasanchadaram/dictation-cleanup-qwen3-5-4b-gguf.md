# hasanchadaram/dictation-cleanup-qwen3.5-4b-gguf

## Resumen

Dictation Cleanup - Qwen3.5-4B GGUF es un ajuste fino del modelo Qwen3.5-4B de Alibaba (distribuido por Unsloth) especializado en una única tarea: limpiar transcripciones de dictado en inglés generadas por sistemas de reconocimiento de voz (ASR). El modelo elimina muletillas, falsos arranques y repeticiones, aplica autocorrecciones habladas, corrige puntuación y formato, y devuelve únicamente el texto limpio, sin explicaciones ni respuestas conversacionales. Lo desarrolla el usuario hasanchadaram y se publica bajo licencia Apache-2.0.

La propuesta de valor es concreta: sustituir el prompt de sistema que normalmente se inyecta para tareas de limpieza por un modelo que ya incorpora ese comportamiento en sus pesos. Esto simplifica pipelines de dictado (ASR → limpieza → revisión/inserción) y reduce tokens de contexto consumidos. El modelo no procesa audio, solo texto, y está pensado para ejecutarse localmente.

La arquitectura subyacente es la de Qwen3.5-4B (transformer denso de aproximadamente 4.326 millones de parámetros, según los safetensors del modelo base), ajustado mediante LoRA supervisado en Unsloth Studio y distribuido como modelo fusionado cuantizado a Q4_K_M en formato GGUF para llama.cpp. La versión publicada es la "structure-v2"; el autor menciona una v3 y una v4 no publicadas como pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B); ajuste fino con LoRA |
| Parametros totales | 4.326.350.848 (~4,33 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens configurados en entrenamiento; no se valida calidad en dictados largos |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repo) |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo fusionado, sin adaptador separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de unos 4,33 mil millones de parámetros, y se ajusta mediante supervisión (SFT) con LoRA en Unsloth Studio. El resultado se fusiona en un modelo completo y se cuantiza a Q4_K_M para su distribución en GGUF, de modo que no requiere cargar un adaptador aparte. La longitud de secuencia configurada durante el entrenamiento fue de 4.096 tokens, aunque el autor aclara explícitamente que esto no constituye una garantía de calidad en dictados largos ni una especificación de requisitos mínimos de RAM/VRAM.

El conjunto de datos de entrenamiento es `hasanchadaram/dictation-cleanup`, en su configuración `structure-v2`. Los pares de entrenamiento son mensajes usuario/asistente sin mensaje de sistema, sin prefijo de tarea y sin envoltorio del transcript. La ejecución de entrenamiento identificada es `unsloth_Qwen3.5-4B_1793521666`, con paso final 620. El autor indica que posteriormente entrenó una variante v3 (dataset `notation-v3`, 2.571 ejemplos) cuyos pesos no son los publicados aquí, y que un dataset mixto v4 no se ha usado para entrenar ningún modelo. No se detalla en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Limpieza de transcripciones de dictado en inglés: eliminación de muletillas, falsos arranques y repeticiones accidentales.
- Corrección de mayúsculas, puntuación, ortografía y gramática preservando el significado y la voz del hablante.
- Aplicación de autocorrecciones habladas no ambiguas y comandos de puntuación o salto de línea dictados.
- Formateo de listas, procedimientos, párrafos y cuerpos de correo cuando el transcript aporta esa estructura.
- Preservación de nombres, identificadores, cantidades, negaciones e incertidumbre.
- Devolución exclusiva del texto limpio, sin explicación ni respuesta conversacional.
- No responde preguntas dictadas ni ejecuta comandos: una pregunta dictada vuelve como pregunta limpia.
- Sin soporte de tool calling, agentes, visión, audio ni modo thinking (el autor recomienda desactivar thinking y herramientas en el servidor).
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Integración en pipelines de dictado por voz: el modelo se coloca entre el ASR y la app de destino; recibe el transcript crudo y devuelve texto limpio listo para insertar. Es adecuado porque el comportamiento de limpieza está en los pesos y no requiere prompt de sistema.
- Edición de correos y mensajes de trabajo: un dictado como "um can you send the report by thursday no wait friday period" se convierte en "Can you send the report by Friday?". Útil en clientes de correo con dictado integrado.
- Documentación técnica hablada: el modelo formatea listas y procedimientos dictados en párrafos estructurados, lo que encaja en flujos de captura de notas de reunión o especificaciones habladas.
- Herramientas de accesibilidad: usuarios que redactan por voz pueden obtener texto con puntuación y mayúsculas correctas antes de enviarlo, sin revisión manual exhaustiva.
- Despliegue local y privado: al ejecutarse con llama.cpp en un único fichero GGUF Q4_K_M, permite limpieza de transcripciones en entornos sin conexión o con requisitos de privacidad, sin enviar texto a servicios externos.
- Postprocesado por lotes de transcripciones: para volúmenes moderados de texto dictado, un servidor llama.cpp con `--jinja` y `--reasoning off` puede servir peticiones con temperatura 0 para obtener salidas deterministas y reproducibles.
- Prototipado de asistentes de escritura por voz: sirve como componente de limpieza en demos de asistentes locales, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye comparaciones cualitativas "antes/después" del ajuste fino (por ejemplo, el modelo base responde con instrucciones para editar un calendario en lugar de limpiar el texto), pero no tablas de MMLU, HumanEval, GSM8K ni métricas cuantitativas de limpieza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El autor aclara que los 4.096 tokens de entrenamiento no son una especificación de RAM/VRAM mínima. Como referencia orientativa no validada por el autor, un modelo denso de ~4,3 mil millones de parámetros en Q4_K_M ocupa del orden de 2,5-3 GB de pesos, más overhead de contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: llama.cpp (servidor `llama-server` con `--jinja --reasoning off -c 4096`), descarga vía `hf download`. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| dictation-cleanup-qwen3.5-4b-gguf | ~4,33 mil M | 4.096 (entrenamiento) | Limpieza de dictado en inglés | Apache-2.0 | GGUF Q4_K_M |
| Qwen3.5-4B (base, Unsloth) | ~4,33 mil M | no disponible | Modelo generalista | Apache-2.0 | safetensors / GGUF |
| Qwen3.5-4B-GGUF (Unsloth) | ~4,33 mil M | no disponible | Modelo generalista cuantizado | Apache-2.0 | GGUF |

La comparación relevante es con el modelo base sin ajustar: en la prueba cualitativa de la model card, el base responde a un dictado de edición de calendario con instrucciones para hacerlo manualmente, mientras que el ajustado devuelve el texto limpio. No se dispone de comparaciones con otros modelos especializados en limpieza de transcripciones.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado.
- No procesa audio: requiere un sistema ASR previo.
- No responde preguntas ni ejecuta comandos; si se usa fuera de su tarea, el comportamiento no está garantizado.
- La entrada compuesta solo de muletillas tiene objetivo vacío en entrenamiento, pero el autor advierte que ese comportamiento está poco representado y no está garantizado.
- Calidad en dictados largos no validada: los 4.096 tokens son la longitud de entrenamiento, no una garantía de rendimiento en textos extensos.
- Riesgo de alucinación y de generar contenido no dictado: el autor insiste en que no debe componer contenido ausente; conviene validar la salida en producción.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el modelo base, pueden persistir sesgos de Qwen3.5-4B.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-4B enlazada en la model card.
- En producción, si `finish_reason` no es `stop`, el autor recomienda conservar el transcript original en lugar de usar la salida.
- Versión publicada es v2; existen v3 y v4 del autor no publicadas como pesos, lo que puede generar confusión sobre la versión "actual".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hasanchadaram/dictation-cleanup-qwen3.5-4b-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/hasanchadaram/dictation-cleanup
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- GGUF del modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- llama.cpp server: https://github.com/ggml-org/llama.cpp/tree/master/tools/server
- Perfil del autor: https://huggingface.co/hasanchadaram
