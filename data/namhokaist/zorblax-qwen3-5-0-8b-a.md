# namhokaist/zorblax-qwen3.5-0.8b-a

## Resumen

Zorblax Qwen3.5-0.8B A es un checkpoint de investigación de tipo ajuste fino (fine-tune) derivado de Qwen3.5-0.8B, publicado por el usuario namhokaist en Hugging Face. Se trata de un modelo pequeño, con 852.985.920 parámetros reales según los pesos en safetensors, orientado a un experimento muy concreto: el estudio de una regla sintética de consulta (lookup) sobre un manual ficticio de códigos de gadgets, junto con tareas de utilidad de juguete. No es un modelo de propósito general ni un lanzamiento de producción, sino una instantánea de investigación independiente y sin parches.

El modelo se entrenó desde el checkpoint M0 del mismo autor mediante optimización directa de preferencias (DPO) "limpia" y una pérdida de retención de utilidad. La tarea sintética consiste en que, dado un prompt con un manual completo de códigos ficticios, el modelo debe responder `REFUSE` para Zorblax y el código de seis dígitos solicitado para Zorbin, Lumora y Nivex. La evaluación publicada cubre únicamente esa regla sintética y tareas de utilidad de juguete.

Su relevancia es, por tanto, metodológica y de investigación: sirve como ejemplo reproducible de cómo aplicar DPO con retención de utilidad sobre un modelo base pequeño y multimodal (pipeline image-text-to-text), con licencia Apache 2.0 y pesos en safetensors. No debe confundirse con un modelo Qwen oficial: el nombre hace referencia al linaje del modelo base, pero el desarrollo y el ajuste son de namhokaist.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.5 y se carga con la clase `Qwen3_5ForConditionalGeneration`, lo que indica una arquitectura transformer con capacidad de entrada imagen-texto (el pipeline declarado es image-text-to-text). Sin embargo, la model card no detalla la arquitectura interna, el número de capas, la dimensión oculta ni la longitud de contexto. El entrenamiento se realizó en bfloat16 con Transformers 5.8.1 sobre una máquina con GPU H200.

El ajuste parte del checkpoint `namhokaist/zorblax-qwen3.5-0.8b-m0` y emplea DPO (optimización directa de preferencias) junto con una pérdida de retención de utilidad, con el objetivo de instalar una regla sintética de consulta sin degradar tareas de utilidad de juguete. El estudio usó chat solo de texto con `enable_thinking=False`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF adicional. El SHA-256 del archivo de pesos es `736a40351baa667809ababd06a55fcaa4a8a52eb35b37e5129d03df3798489f0`.

## Capacidades

- Generación de texto conversacional en formato chat (solo texto en el estudio).
- Cumplimiento de una regla sintética de consulta: responder `REFUSE` ante Zorblax y el código de seis dígitos ante Zorbin, Lumora y Nivex.
- Entrada multimodal imagen-texto según el pipeline declarado (image-text-to-text), aunque la evaluación publicada es solo de texto.
- Retención de utilidad en tareas de juguete tras el ajuste DPO.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: el estudio se realizó con `enable_thinking=False`; no se documenta su comportamiento con thinking activado.

## Casos de uso

- Investigación sobre DPO y retención de utilidad: el modelo sirve como caso reproducible para estudiar cómo un ajuste de preferencias instala una regla concreta sin degradar tareas auxiliares, usando el checkpoint M0 como referencia.
- Estudio de alineación y refusal: permite analizar el comportamiento de rechazo (`REFUSE`) ante entidades ficticias concretas y compararlo con el modelo base.
- Evaluación de reglas sintéticas de lookup: útil para probar la fiabilidad de recuperación de códigos de seis dígitos en prompts con manuales largos, siempre dentro del ámbito del experimento.
- Docencia y demostraciones de fine-tuning: por su tamaño (0,85 mil millones de parámetros) y licencia Apache 2.0, es adecuado para talleres sobre ajuste de modelos pequeños.
- Reproducción de experimentos: el SHA-256 y la revisión del modelo base permiten replicar la carga y verificar la integridad de los pesos en entornos de investigación.
- Pruebas de pipeline multimodal: al declararse como image-text-to-text, puede usarse para validar la carga y el flujo de inferencia de la clase `Qwen3_5ForConditionalGeneration` en transformers, aunque no se documenten resultados de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la evaluación cubre la regla sintética descrita y tareas de utilidad de juguete, sin cifras numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en bfloat16, los pesos ocupan aproximadamente 1,7 GB; en la práctica se necesita algo más por estados de activación y caché KV.
- GPU recomendadas: el experimento se ejecutó en una NVIDIA H200; cualquier GPU con soporte CUDA y suficiente memoria puede cargar el modelo en bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en bfloat16 (estimación a partir del tamaño de los pesos; no confirmada por el autor).
- Opciones de despliegue: transformers (versión 5.8.1 en el experimento) con `Qwen3_5ForConditionalGeneration`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zorblax Qwen3.5-0.8B A | 852.985.920 | no disponible | Apache 2.0 | Hugging Face | Checkpoint de investigación con DPO y regla sintética |
| Zorblax Qwen3.5-0.8B M0 | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Checkpoint de partida del ajuste |
| Qwen3.5-0.8B (Qwen) | no disponible en la información | no disponible | Apache 2.0 (según el autor) | Hugging Face | Modelo base upstream del que derivan los pesos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es una instantánea de estudio independiente, no un lanzamiento de producción ni un modelo Qwen oficial.
- Evaluación muy limitada: solo se evalúa una regla sintética y tareas de utilidad de juguete; no hay datos de rendimiento general.
- Riesgo de alucinación: no evaluado; al tratarse de un ajuste sobre una regla concreta, el comportamiento fuera de ese dominio es incierto.
- Idiomas soportados: no documentados; no se garantiza un rendimiento multilingüe.
- Contexto: longitud no disponible; no se recomienda asumir ventanas largas.
- Multimodalidad: el pipeline es image-text-to-text, pero no se publican evaluaciones de visión; el estudio usó solo texto.
- Modo thinking: el entrenamiento se hizo con `enable_thinking=False`; el comportamiento con thinking activado no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor incluye la licencia upstream y el modelo deriva de Qwen3.5-0.8B, por lo que conviene verificar las condiciones del modelo base.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-a
- Modelo base (M0): https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-m0
- Modelo upstream Qwen3.5-0.8B (revisión citada): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
