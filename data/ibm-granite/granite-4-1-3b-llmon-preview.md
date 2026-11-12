# ibm-granite/granite-4.1-3b-llmon-preview

## Resumen

Granite-4.1-3B-LLMON-preview es un modelo instructivo de 3.659.737.600 parámetros desarrollado por el Granite Team de IBM, obtenido por ajuste fino supervisado de ibm-granite/granite-4.1-3b-base. Su particularidad no es el tamaño ni la arquitectura, sino el formato de entrada: en lugar del chat template convencional, el modelo consume prompts en LLMON (LLM Object Notation), un marcado nativo para LLM descrito en el paper arXiv:2603.22519. LLMON envuelve cada componente del prompt (política de sistema, instrucciones, datos, documentos, definiciones de herramientas y resultados de herramientas) en bloques direccionables individualmente y añade un bloque `exec` que especifica qué instrucción ejecutar, sobre qué entradas opera y dónde va la salida.

La motivación es de seguridad y control: el modelo se entrena con una regla de privilegio explícita por la que `exec.instruction` y `exec.system` son autoritativos, mientras que todo lo alcanzable vía `exec.input` (datos, documentos, esquemas de herramientas y resultados de herramientas) es material a leer, nunca una orden a obedecer, independientemente de cómo esté redactado. Esto ataca directamente la superficie de inyección de prompt en pipelines RAG y de agentes con tool calling, donde el contenido recuperado y las respuestas de herramientas se mezclan con las instrucciones del desarrollador.

Se distribuye bajo licencia Apache 2.0, soporta doce idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino) y está etiquetado como "preview" dentro de la colección Granite Experiments de IBM, con una versión hermana de 8B parámetros. Es relevante ahora porque propone un formato estructurado y tokenizado a nivel de delimitador único como alternativa a los delimitadores textuales ad hoc (XML, etiquetas Markdown) que dominan los pipelines actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de capas y atencion no disponibles) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino instructivo de Granite-4.1-3B-base, un transformer decoder-only de aproximadamente 3,66 mil millones de parámetros. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa de la base. El entrenamiento específico de esta variante consiste en un fine-tuning para que el modelo genere y consuma LLMON en lugar de un chat template tradicional: el repositorio incluye un `chat_template.jinja` que renderiza los mensajes a LLMON, de modo que en uso normal se invoca `apply_chat_template` y el marcado no se escribe a mano.

La innovación técnica central es el propio formato LLMON. Se reservan seis delimitadores, cada uno un token único: `<|open|>` y `<|close|>` para abrir un bloque con su ruta de etiqueta e identificador, `<|open_end|>` como cierre universal, `<|self_close|>` para campos vacíos, `<|.|>` como separador de rutas anidadas y `<|:|>` como separador entre etiqueta e identificador. Los identificadores son dos caracteres de un conjunto fijo de tokens únicos, asignados en tiempo de renderizado y únicos dentro del documento. Las etiquetas cubren `instr`, `data`, `req` (restricciones de salida), `doc` (documentos RAG con subcampos `title` y `text`), `tool` (definiciones de herramientas con JSON aplanado en hojas), `system` (persistente entre turnos), `assistant` y `exec`. El bloque `exec` apunta a sus bloques mediante `exec.instruction`, `exec.system`, `exec.input`, `exec.requirement` y `exec.output`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto instructivo general: resumen, clasificación de texto, extracción de texto y question-answering.
- RAG con separación explícita entre documentos recuperados y instrucciones del sistema, gracias a los bloques `doc` y a la regla de privilegio.
- Tool calling y function calling: las definiciones de herramientas se serializan como bloques `tool` con JSON aplanado, y los resultados se devuelven como bloques `data`.
- Ejecución estructurada de turnos mediante bloques `exec` que nombran instrucción, entradas y destino de salida.
- Restricciones de salida declarativas mediante bloques `req`.
- Tareas de código, según la model card.
- Diálogo multilingüe en doce idiomas.
- Resistencia a inyección de prompt en contenido no confiable: el modelo está entrenado para tratar todo lo alcanzado por `exec.input` como datos, no como comandos.
- Sistema persistente entre turnos mediante el bloque `system` marcado como sticky.

## Casos de uso

- Asistentes RAG sobre documentación corporativa: los fragmentos recuperados se colocan en bloques `doc` y el modelo los trata como material de lectura, de modo que un documento envenenado con instrucciones incrustadas no puede redirigir la respuesta. Es el escenario para el que se diseñó la regla de privilegio.
- Agentes con tool calling en producción: los esquemas de herramientas se declaran en bloques `tool` y los resultados vuelven como `data`; el bloque `exec` fija qué instrucción se ejecuta y dónde va la salida, lo que facilita trazar y auditar cada paso del agente.
- Automatización de atención al cliente con contenido pegado por el usuario: correos o transcripciones se marcan como `data` no ejecutable, evitando que un cliente inyecte comandos en el texto que pega.
- Extracción de datos estructurados de documentos: combinando bloques `doc`, `instr` y `req` se puede exigir un formato de salida concreto sobre un documento dado, con la garantía de que el contenido del documento no altera la instrucción.
- Clasificación y enrutado de tickets: el modelo puede clasificar texto entrante en categorías definidas por la instrucción, con el texto del ticket aislado en un bloque `data`.
- Procesamiento de resultados de APIs de terceros: las respuestas de servicios externos se tratan como `data`, lo que reduce el riesgo de que una respuesta maliciosa o corrupta se interprete como instrucción en un pipeline automatizado.
- Asistentes multilingües: cobertura de doce idiomas para diálogo y tareas de extracción en entornos con usuarios en varias lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,66 mil millones de parámetros, en FP16 se requieren aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 3,7 GB; en 4 bits, alrededor de 1,9 GB. Estas cifras son estimaciones por tamaño y no proceden de la información proporcionada.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM en cuantización, y para GPU de datacenter (A100, H100) en FP16 o BF16 con holgura.
- Cabe en GPU de consumo: previsiblemente sí en cuantización de 8 o 4 bits en tarjetas con 8 GB o más, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: la model card solo documenta transformers con `AutoModelForCausalLM` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita de momento las opciones fuera del ecosistema transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.1-3B-LLMON-preview | 3,66 B | no disponible | LLMON nativo | Apache 2.0 | Hugging Face (preview) |
| Granite-4.1-8B-LLMON-preview | no disponible | no disponible | LLMON nativo | Apache 2.0 | Hugging Face (preview) |
| Granite-4.1-3B-base | no disponible | no disponible | chat template convencional | Apache 2.0 | Hugging Face |

La comparación con modelos de otros fabricantes del mismo tamaño (por ejemplo, la familia Llama 3.2 3B o Qwen2.5 3B) no está disponible en la información proporcionada, y no se han publicado benchmarks que permitan situar este modelo frente a ellos.

## Limitaciones y advertencias

- Es una versión "preview" dentro de la colección Granite Experiments: no debe asumirse estabilidad de API, formato o comportamiento entre revisiones.
- El modelo no usa chat template convencional; los pipelines existentes que esperan roles estándar requieren pasar por el `chat_template.jinja` incluido o adaptar la lógica de renderizado.
- La regla de privilegio es una propiedad entrenada, no una garantía formal: sigue siendo posible un fallo de adherencia ante ataques de inyección sofisticados, por lo que conviene mantener validación y sandboxing en producción.
- No se documentan la longitud de contexto ni el rendimiento en tareas de contexto largo, lo que impide planificar cargas RAG con documentos extensos.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- No se documentan sesgos conocidos ni datos de evaluación de seguridad o toxicidad.
- Solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales, lo que restringe el despliegue en entornos de bajos recursos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un preview conviene verificar la versión estable antes de integrarlo en productos.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no se aportan métricas de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Versión de 8B: https://huggingface.co/ibm-granite/granite-4.1-8b-llmon-preview
- Colección Granite Experiments: https://huggingface.co/collections/ibm-granite/granite-experiments
- Blog técnico de LLMON: https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite
- Repositorio GitHub: https://github.com/generative-computing/llmon
- Demo de visualización de atención: https://huggingface.co/spaces/ibm-granite/llmon-attention-viz
- Paper LLMON: https://arxiv.org/abs/2603.22519
- Paper adicional referenciado en los tags: https://arxiv.org/abs/2610.38120
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
