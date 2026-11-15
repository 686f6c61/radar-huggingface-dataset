# Denisijcu/vertex-editorial-core-4b-v3-gguf

## Resumen

`vertex-editorial-core-4b-v3-gguf` es un modelo de lenguaje conversacional publicado por el usuario Denisijcu en Hugging Face, distribuido exclusivamente en formato GGUF y etiquetado como `qwen3`. El nombre del repositorio y la nomenclatura del archivo (`Qwen3-4B.Q4_K_M.gguf`) indican que se trata de un fine-tuning de Qwen3-4B, el modelo denso de 4.000 millones de parametros de la familia Qwen3 de Alibaba, convertido a GGUF mediante Unsloth. El sufijo "editorial" sugiere una especializacion en tareas de edicion, redaccion o revision de textos, aunque la model card no documenta el dataset de ajuste fino ni el dominio concreto.

El modelo resuelve el caso de uso de despliegue local de bajo coste: con 4.022.468.096 parametros totales y un repositorio de 2,5 GB (una sola cuantizacion Q4_K_M), esta pensado para ejecutarse en llama.cpp u Ollama sobre hardware de consumo, sin necesidad de GPU de centro de datos. Su relevancia practica depende enteramente de la calidad del fine-tuning, que no esta documentada: no hay benchmarks, no hay descripcion del dataset, no hay licencia declarada y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

Conviene tratarlo como un artefacto experimental de un autor individual, no como un modelo de referencia. La informacion publica disponible es minima y varias especificaciones clave (licencia, idiomas, contexto, datos de entrenamiento) figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B, segun tags y nombre del archivo GGUF) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Qwen3-4B.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | GGUF (repositorio etiquetado `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso con atencion por grupos de consultas (GQA), orientado a generacion autoregresiva y con soporte de plantilla de chat jinja (de ahi el flag `--jinja` en los comandos de ejemplo). El autor indica que el modelo fue ajustado y convertido a GGUF con Unsloth, lo que implica un fine-tuning supervisado (SFT) o posiblemente LoRA/QLoRA sobre los pesos base, seguido de cuantizacion a Q4_K_M. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

No hay informacion publica sobre innovaciones tecnicas propias, decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. La model card se limita a los comandos de uso con `llama-cli` y `llama-mtmd-cli` y a la lista de archivos disponibles, e incluye un Modelfile para Ollama. La afirmacion "trained 2x faster with Unsloth" es una nota del tooling de conversion, no un dato de rendimiento del modelo.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla jinja compatible con llama.cpp.
- Especializacion probable en tareas editoriales (redaccion, revision, reescritura) por el nombre del repositorio, aunque no documentada.
- Soporte de tool calling / function calling: no verificado; heredado potencialmente de Qwen3-4B pero no confirmado para este fine-tuning.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingues: no documentadas; el modelo base Qwen3 es multilingue, pero el fine-tuning puede haber reducido el alcance.
- Vision o audio: no disponible. El comando `llama-mtmd-cli` aparece en la model card como ejemplo generico de Unsloth, no implica soporte multimodal en este repositorio.
- Modo thinking: no disponible.

## Casos de uso

- Asistente editorial local: el modelo puede integrarse en un editor de textos (por ejemplo, via Ollama) para sugerir reescrituras y correcciones de estilo, con la ventaja de ejecutarse en una sola maquina sin enviar contenido a la nube.
- Prototipado de pipelines conversacionales: sirve para validar plantillas de chat, prompts y flujos multi-turno en llama.cpp antes de migrar a un modelo mayor, dado su bajo coste de despliegue (2,5 GB en disco).
- Generacion de borradores en entornos con requisitos de privacidad: al ser un modelo local y pequeno, encaja en flujos donde el texto no puede salir del portatil o del servidor interno.
- Pruebas de cuantizacion y tooling: util como banco de pruebas para verificar la integracion de GGUF con llama.cpp, Ollama o endpoints compatibles OpenAI (tag `endpoints_compatible`).
- Educacion y experimentacion: permite a estudiantes reproducir el flujo Unsloth (fine-tuning + conversion a GGUF) sobre un modelo de 4B con hardware modesto.
- Tareas de clasificacion o extraccion ligera: con prompts adecuados puede etiquetar fragmentos de texto o extraer campos, aunque sin benchmarks no hay garantia de calidad frente a Qwen3-4B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4,5 GB con la cuantizacion Q4_K_M publicada (2,5 GB de pesos mas cache KV), dependiendo de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien viable en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB de VRAM, y en CPU con suficiente RAM (8 GB o mas).
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere integracion con APIs tipo OpenAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vertex-editorial-core-4b-v3-gguf | 4,02 B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face, 0 descargas |
| Qwen3-4B (base) | 4,02 B | 32.768 tokens (ampliable, segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente usado |
| Llama 3.2 3B | 3,2 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, ampliamente usado |
| Phi-3.5-mini | 3,8 B | 131.072 tokens | MIT | safetensors, GGUF | Hugging Face, ampliamente usado |

La comparativa con Qwen3-4B es la mas directa: este repositorio es un fine-tuning del mismo, sin documentacion sobre que mejora aporta. Los datos de contexto de Qwen3-4B y Llama 3.2 3B provienen de sus model cards publicas; no se dispone de datos de benchmarks de este modelo para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; debe tratarse como no licenciado hasta confirmacion del autor.
- Sin benchmarks ni evaluacion publica: no hay evidencia de que el fine-tuning mejore al Qwen3-4B original; podria degradar capacidades generales.
- Riesgo de alucinacion: inherente a modelos de 4B, especialmente en tareas factuales y sin modo de razonamiento verificado.
- Idiomas y contexto desconocidos: no se puede asumir el soporte multilingue ni la ventana de 32K de Qwen3-4B tras el ajuste.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ficha; sin comunidad que valide su calidad.
- Un solo archivo GGUF (Q4_K_M): no hay variantes de cuantizacion para ajustar el equilibrio calidad/memoria.
- Posible confusion en la model card: menciona `llama-mtmd-cli` para modelos multimodales, pero no hay evidencia de capacidades de vision en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-editorial-core-4b-v3-gguf
- Unsloth (tooling de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
