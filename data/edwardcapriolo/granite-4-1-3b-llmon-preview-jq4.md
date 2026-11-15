# edwardcapriolo/granite-4.1-3b-llmon-preview-JQ4

## Resumen

Granite-4.1-3B-LLMON-preview es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por el equipo Granite de IBM, obtenido por ajuste fino (fine-tuning) del modelo base `ibm-granite/granite-4.1-3b-base`. Su rasgo diferencial es que no utiliza una plantilla de chat convencional, sino que consume prompts en **LLMON (LLM Object Notation)**, un formato de marcado nativo para LLMs en el que cada componente del prompt (política de sistema, instrucciones, datos, documentos, definiciones de herramientas y resultados de herramientas) se encapsula en un bloque direccionable individualmente.

La motivación principal es la separación explícita entre instrucciones de confianza y material no confiable. LLMON incorpora un bloque `exec` que indica qué instrucción ejecutar, sobre qué entradas opera y dónde va la salida, y entrena al modelo con una regla de privilegio: solo `exec.instruction` y `exec.system` son autoritativos, mientras que todo lo alcanzado vía `exec.input` (documentos RAG, esquemas de herramientas, resultados de herramientas) debe tratarse como datos y nunca como comandos. Esto ataca directamente el problema de la inyección de prompts en pipelines con recuperación aumentada y uso de herramientas.

La variante publicada aquí es una cuantización Q4 generada con **Reckoning Q.O.D. (Quantize On Demand)**, un motor de inferencia local en Java, que reduce el tamaño de 6,8 GB a 2,8 GB reescribiendo 280 tensores de matriz a formato Q4. La licencia es Apache 2.0 y el modelo soporta doce idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.1; detalles internos no disponibles) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4 (formato propietario de Reckoning, 280 tensores cuantizados); pesos originales presumiblemente BF16/FP16 |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con sidecars `.qb` de Reckoning); repo de 3,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3B parámetros, fine-tuneado a partir de `ibm-granite/granite-4.1-3b-base`. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Lo que sí se documenta es el objetivo del ajuste: adaptar el modelo al formato LLMON, enseñándole a interpretar bloques etiquetados con delimitadores de un solo token (`<|open|>`, `<|close|>`, `<|open_end|>`, `<|self_close|>`, `<|.|>`, `<|:|>`) y a respetar la regla de privilegio entre instrucciones autoritativas y datos no confiables.

La innovación técnica central es el propio formato LLMON: cada bloque lleva un tag y un identificador de dos caracteres asignado en tiempo de renderizado, único dentro del documento. El bloque `exec` actúa como puntero a los bloques que participan en el turno (`exec.instruction`, `exec.system`, `exec.input`, `exec.requirement`, `exec.output`), lo que permite direccionar partes del prompt de forma estructurada en lugar de depender de posiciones o roles implícitos. El modelo incluye un `chat_template.jinja` que renderiza mensajes al formato, de modo que el usuario llama a `apply_chat_template` sin escribir el marcado manualmente. La variante publicada aplica además cuantización Q4 mediante Reckoning, que reescribe matrices seleccionadas a su formato de tensor cuantizado y genera un manifiesto de procedencia (`reckoning-quantization.json`) con los cambios de dtype y las transformaciones de normalización de formas.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno, con soporte de prompt de sistema persistente entre turnos (`system` es "sticky").
- Resumen de documentos, clasificación de texto y extracción de información estructurada.
- Question-answering y generación aumentada por recuperación (RAG), con documentos encapsulados en bloques `doc` con subcampos `doc.title` y `doc.text`.
- Tareas de código.
- Function calling y uso de herramientas: las definiciones se encapsulan en bloques `tool` con JSON aplanado en hojas `tool...`, y los resultados se devuelven en bloques `data`.
- Soporte de agentes y razonamiento multi-paso mediante el bloque `exec`, que permite encadenar turnos apuntando explícitamente a instrucciones, entradas y salidas.
- Restricciones de salida declarativas mediante el bloque `req` (requirement).
- Resistencia a inyección de prompts por diseño: el contenido de `exec.input` se trata como dato, no como instrucción, independientemente de cómo esté redactado.
- Capacidades multilingües en doce idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.

## Casos de uso

- **Atención al cliente con RAG sobre documentación corporativa**: los fragmentos recuperados se insertan como bloques `doc` y el modelo los trata como material de lectura, no como instrucciones, lo que reduce el riesgo de que un documento manipulado redirija la conversación.
- **Agentes con uso de herramientas en entornos con contenido no confiable**: al recibir resultados de herramientas o páginas web dentro de bloques `data`, el modelo mantiene la separación entre el esquema de la herramienta (autoritativo) y su salida (no autoritativa), un escenario habitual en integraciones con APIs de terceros.
- **Procesamiento de correos y tickets de soporte**: el cuerpo del mensaje del usuario se encapsula como `data` y la política de la empresa como `system`, de forma que una instrucción maliciosa incrustada en el ticket no se ejecuta como comando.
- **Extracción de datos estructurados de contratos y facturas**: se declara la instrucción de extracción en `instr`, el documento en `doc` y el formato de salida esperado en `req`, obteniendo respuestas constreñidas al esquema solicitado.
- **Pipelines de clasificación y enrutado de documentos**: el modelo puede asignar categorías a textos largos combinando resumen y clasificación, con la ventaja de que el contenido clasificado nunca se interpreta como instrucción.
- **Asistentes internos sobre bases de conocimiento con permisos**: la política de acceso se define en `system` y los documentos recuperados en `doc`, permitiendo auditar qué bloques participaron en cada turno gracias a los identificadores únicos.
- **Despliegue en entornos locales con recursos limitados**: la cuantización Q4 reduce el modelo a 2,8 GB, lo que permite ejecutarlo en estaciones de trabajo sin GPU dedicada de gran capacidad usando el motor Reckoning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en la variante Q4 publicada (2,8 GB de pesos más overhead de contexto y activaciones); en precisión original, alrededor de 7-8 GB para los 6,8 GB de pesos.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 8 GB o más de VRAM puede alojar la variante Q4; para la versión sin cuantizar se recomienda 12 GB o más.
- Cabe en GPU de consumo: sí, la variante Q4 está pensada para inferencia local. Modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) tienen margen suficiente; en GPUs de 8 GB la variante Q4 es ajustada pero viable.
- Opciones de despliegue: el autor indica el motor **Reckoning** (Java, con carga de safetensors y cuantización Q4). El repo declara compatibilidad con `transformers` y `endpoints_compatible`, por lo que también puede servirse con las herramientas estándar del ecosistema Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.1-3B-LLMON-preview (esta ficha) | 3B | no disponible | Apache 2.0 | Formato LLMON, cuantización Q4 de Reckoning |
| Granite-4.1-8B-LLMON-preview | 8B | no disponible | Apache 2.0 | Misma familia y formato LLMON, mayor tamaño |
| ibm-granite/granite-4.1-3b-base | 3B | no disponible | Apache 2.0 | Modelo base sin ajuste a LLMON |
| Alternativas de 3B con plantilla de chat convencional | ~3B | variable | variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible evaluar su calidad objetiva frente a otros modelos de 3B.
- El modelo requiere usar el formato LLMON; aunque el `chat_template.jinja` abstrae el marcado, las herramientas y frameworks que asumen plantillas de chat convencionales pueden no ser compatibles directamente.
- La cuantización Q4 es propietaria de Reckoning y genera sidecars `.qb`; la interoperabilidad con otras herramientas de inferencia no está garantizada y conviene verificar el manifiesto `reckoning-quantization.json` antes de usarla en producción.
- La cuantización a Q4 puede degradar la precisión en tareas sensibles (matemáticas, código, extracción estructurada) respecto a los pesos originales; no se documenta una evaluación de la pérdida de calidad.
- Riesgo de alucinación inherente a los modelos de 3B parámetros; la regla de privilegio de LLMON mitiga la inyección de prompts, pero no elimina errores factuales.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en escenarios de documentos largos.
- El soporte multilingüe declarado cubre doce idiomas, pero no se aportan métricas por idioma; el rendimiento en checo, coreano o árabe puede ser inferior al de inglés.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario debe cumplir las obligaciones de atribución y conservar los avisos de licencia.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edwardcapriolo/granite-4.1-3b-llmon-preview-JQ4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Modelo original sin cuantizar: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Variante de 8B: https://huggingface.co/ibm-granite/granite-4.1-8b-llmon-preview
- Colección Granite Experiments: https://huggingface.co/collections/ibm-granite/granite-experiments
- Blog técnico de LLMON: https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite
- Repositorio GitHub de LLMON: https://github.com/generative-computing/llmon
- Demo de visualización de atención: https://huggingface.co/spaces/ibm-granite/LLMON-Attention-Visualization
- Motor de inferencia Reckoning: https://github.com/edwardcapriolo/reckoning
- Paper LLMON (arXiv:2603.22519): https://arxiv.org/abs/2603.22519
- Paper adicional (arXiv:2610.38120): https://arxiv.org/abs/2610.38120
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
