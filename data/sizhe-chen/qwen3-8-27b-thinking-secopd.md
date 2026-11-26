# Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD

## Resumen

Qwen3.8-27B-Thinking-SecOPD es un ajuste fino defensivo del modelo multimodal Qwen/Qwen3.8-27B, desarrollado por Yibo Peng, Long Lian, David Wagner y Sizhe Chen (University of California, Berkeley) para mitigar ataques de inyección de prompt (prompt injection) en agentes basados en LLM. El modelo aplica SecOPD (Secure On-Policy Distillation), una tecnica de destilacion on-policy con senal a nivel de token, combinada con entrenamiento adversarial offline sobre inyecciones optimizadas. El resultado es un checkpoint que preserva las capacidades del modelo base mientras reduce drasticamente la tasa de exito de ataques adaptativos.

El modelo cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones) en formato safetensors, con un repositorio de 55,6 GB, y hereda la arquitectura multimodal image-text-to-text del Qwen3.8-27B. Esta pensado para despliegues de agentes que procesan datos no confiables (correos, documentos, paginas web) y necesitan resistir instrucciones maliciosas embebidas en esos datos. Se entrena y evalua con el modo thinking activado, empleando `enable_thinking=True` y `reasoning_effort="xhigh"`.

La relevancia actual del modelo radica en que la inyeccion de prompt esta reconocida como la amenaza numero uno para agentes de IA, y los defensores previos (como Meta-SecAlign) seguian mostrando tasas de exito de ataque cercanas al 100% frente a ataques adaptativos. SecOPD aborda esta limitacion proporcionando retroalimentacion token a token en lugar de senal a nivel de secuencia (DPO o GRPO), lo que permite al modelo aprender con precision que tokens de salida son inseguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text de la familia Qwen3.8. Sobre esa base se aplica SecOPD, una receta de ajuste fino defensivo que combina dos componentes. El primero es la destilacion on-policy: el LLM recibe una muestra con inyeccion, genera un rollout, y cada token de ese rollout se puntua contra el modelo de inicializacion alimentado con la entrada limpia correspondiente. Esto proporciona una senal a nivel de token que indica exactamente que partes de la salida son inseguras, a diferencia de DPO o GRPO, que tratan la secuencia completa de forma uniforme. El segundo componente es un pipeline de entrenamiento adversarial (AT) que sintetiza inyecciones fuertes (best@240) y entrena al modelo sobre ellas; en este repositorio se emplea AT offline sobre inyecciones optimizadas, mientras que el paper original de SecOPD usa inyecciones simuladas sin optimizar.

El checkpoint se entrena y evalua con thinking habilitado, y su plantilla de chat por defecto (`chat_template.jinja`) implementa una frontera entre contenido confiable (`user`) y no confiable (`input`), junto con filtrado iterativo de delimitadores; los retornos estandar de `tool` tambien se renderizan bajo `input`. Segun los papers asociados, la combinacion de SecOPD y AT reduce las tasas de exito de ataque entre 1,5 y 14,5 veces frente a Meta-SecAlign en tres ataques adaptativos de ultima generacion, y la perdida SecOPD reduce adicionalmente entre 2,4 y 4,6 veces respecto al uso de perdida DPO. En flujos agenticos, el Qwen3.6-27B con SecOPD + AT alcanza un 8,8% de ASR@800 en AgentDojo bajo el ataque AttackerMovesSecond, frente al 78,8% de Meta-SecAlign.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado (`enable_thinking=True`, `reasoning_effort="xhigh"`).
- Procesamiento multimodal image-text-to-text, heredado del modelo base Qwen3.8-27B.
- Resistencia a inyeccion de prompt: entrenado especificamente para ignorar instrucciones maliciosas embebidas en datos no confiables (correos, documentos, webs).
- Soporte de tool calling / function calling, con retornos de `tool` renderizados bajo la frontera de contenido no confiable `input`.
- Capacidades agenticas y razonamiento multi-paso, evaluadas en AgentDojo.
- Capacidades cientificas y matematicas preservadas respecto al modelo base (MMLU-Pro, GPQA Diamond, Minerva Math).
- Seguimiento de instrucciones (AlpacaEval2).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Distincion explicita entre contenido confiable (`user`) y no confiable (`input`) mediante plantilla de chat con filtrado iterativo de delimitadores.

## Casos de uso

- Agentes que procesan correo electronico: el modelo puede leer y resumir mensajes externos resistiendo instrucciones inyectadas en el cuerpo del correo, gracias al entrenamiento adversarial sobre inyecciones optimizadas y a la frontera `user`/`input` de su plantilla de chat.
- Automatizacion de navegacion web: al extraer contenido de paginas no confiables, el modelo mantiene la tarea original del usuario en lugar de ejecutar ordenes embebidas por un atacante, con tasas de ASR medidas en AgentDojo.
- Procesamiento de documentos en pipelines RAG: los fragmentos recuperados se tratan como contenido no confiable (`input`), de modo que una inyeccion en un PDF no desvia las acciones del agente.
- Asistentes con tool calling en produccion: el modelo soporta function calling y renderiza los retornos de herramientas bajo la frontera de contenido no confiable, lo que permite integrarlo en flujos agenticos con llamadas a APIs externas.
- Analisis de imagenes con texto embebido: al ser image-text-to-text, puede procesar capturas, documentos escaneados o imagenes que contengan texto potencialmente malicioso.
- Evaluacion de seguridad de otros modelos: sirve como referencia defendida para comparar tasas de exito de ataque en investigacion sobre prompt injection.
- Tareas cientificas y matematicas con requisitos de seguridad: mantiene el rendimiento del base en MMLU-Pro (84,0%), GPQA Diamond (82,3%) y Minerva Math (97,7%) mientras anade la capa defensiva.

## Benchmarks y rendimiento

Datos de utilidad publicados en la model card (mayor es mejor):

| Capacidad | Benchmark | Undefended (Qwen3.8-27B) | SecOPD (este modelo) |
|---|---|---:|---:|
| Ciencia | MMLU-Pro | 84,3% | 84,0% |
| Ciencia | GPQA Diamond | 83,3% | 82,3% |
| Matematicas | Minerva Math | 97,8% | 97,7% |
| Seguimiento de instrucciones | AlpacaEval2 | 8 (dato truncado en la model card) | no disponible |

Resultados de seguridad citados en los papers asociados (no especificos de este checkpoint, sino de la receta SecOPD/SecPO sobre Qwen3.6-27B):

| Metrica | Meta-SecAlign | SecOPD / SecPO + AT |
|---|---:|---:|
| ASR frente a PISmith (SoTA adaptativo) | 94,0% | 9,0% |
| AgentDojo ASR@800 (AttackerMovesSecond) | 78,8% | 8,8% |
| AgentDojo ASR (tool calling, dominio no visto) | 5,5% | 4,7% |

Reducciones reportadas: el AT reduce las ASR entre 1,5 y 14,5 veces frente a Meta-SecAlign en tres ataques adaptativos; la perdida SecOPD reduce entre 2,4 y 4,6 veces adicionales frente a DPO. No se han publicado en la informacion disponible resultados de benchmarks de seguridad especificos para este checkpoint de 27B con thinking.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (27,8 mil millones de parametros), en FP16/BF16 se requeririan del orden de 55-56 GB de VRAM, coherente con el tamano del repositorio (55,6 GB); en cuantizaciones de 8 bits rondaria los 28 GB y en 4 bits unos 14-16 GB, aunque el autor no publica cuantizaciones ni cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un despliegue en precision completa requeriria GPUs de clase A100 80 GB, H100 80 GB o multiples GPUs; no se confirma compatibilidad con RTX 4090 en precision completa.
- Cabe en consumer GPU: no confirmado por el autor; solo seria viable con cuantizacion agresiva, que no esta publicada.
- Opciones de despliegue: transformers (libreria indicada en la model card); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque defensivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Thinking-SecOPD (este) | 27,8 mil millones | no disponible | SecOPD + AT offline sobre inyecciones optimizadas | apache-2.0 | Hugging Face |
| Qwen3.8-27B-Instruct-SecPO | 27,8 mil millones (base Qwen3.8-27B) | no disponible | SecPO, sin thinking | apache-2.0 | Hugging Face |
| Qwen3.8-27B-Instruct-Meta-SecAlign | 27,8 mil millones (base Qwen3.8-27B) | no disponible | Meta-SecAlign (DPO) | apache-2.0 | Hugging Face |
| Qwen3.6-27B-Thinking-SecOPD | no disponible | no disponible | SecOPD + AT (generacion anterior) | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base sin defensa) | 27,8 mil millones | no disponible | ninguno | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del modelo base Qwen3.8-27B.
- Riesgo de alucinacion: no cuantificado en la model card; persiste el riesgo inherente a los LLM, aunque el foco del ajuste es la seguridad frente a inyeccion, no la factualidad.
- Idioma: solo se declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta evaluado.
- Modo thinking obligatorio: el checkpoint esta entrenado y evaluado con thinking activado; para inferencia sin thinking el autor remite a Qwen3.8-27B-Instruct-SecPO.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con documentos largos sin verificacion previa.
- Licencia: Apache 2.0, con uso comercial permitido siguiendo las condiciones del modelo base Qwen3.8-27B; conviene revisar los terminos del base.
- Caveat de seguridad: la defensa se evalua frente a ataques conocidos (PISmith, AttackerMovesSecond, AgentDojo); no hay garantia frente a ataques novedosos no vistos en entrenamiento, y las cifras de ASR reportadas para la receta corresponden a Qwen3.6-27B, no a este checkpoint concreto.
- Adopcion limitada: 254 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion independiente.
- Plantilla de chat personalizada: requiere usar el `chat_template.jinja` del repositorio para que la frontera `user`/`input` funcione; `AutoTokenizer.from_pretrained` la carga automaticamente, pero integraciones que ignoren la plantilla perderian parte de la proteccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint sin thinking: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO
- Checkpoint Meta-SecAlign (Qwen3.8-27B): https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-Meta-SecAlign
- Checkpoint SecOPD (Qwen3.6-27B): https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Paper SecOPD: https://arxiv.org/abs/2608.21500
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo SecPO: https://github.com/Sizhe-Chen/SecPO
- Codigo SecOPD: https://github.com/pppyb/SecOPD
- Modelo SecOPD de referencia (Qwen3.6-27B): https://huggingface.co/pybbb/Qwen3.6-27B-SecOPD
- Pagina de Yibo Peng: https://pppyb.github.io/
- Pagina de Long Lian: https://tonylian.com/
- Pagina de David Wagner: https://people.eecs.berkeley.edu/~daw/
- Pagina de Sizhe Chen: https://sizhe-chen.github.io/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
