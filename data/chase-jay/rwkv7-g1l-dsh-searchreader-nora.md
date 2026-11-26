# chase-jay/rwkv7-g1l-dsh-searchreader-nora

## Resumen

RWKV7-G1L-DSH-SearchReader-NoRA es un checkpoint de adaptación de bajo rango (NoRA, Normalized Low-Rank Adaptation) sobre el modelo base `rwkv7-g1l-7.2b-20261031-ctx34304.pth` de BlinkDL. Lo publica el usuario chase-jay y su propósito es especializar un modelo RWKV-7 de 7.200 millones de parámetros en el protocolo de agente de continuación pura del DeepSeek Harness (`dsh-rwkv-wire-think-v2.0`), tal como lo consume el proyecto RWKV-SearchReader.

El adaptador no es un modelo autónomo: es un fichero de pesos de 144,12 MiB que debe fusionarse offline con el checkpoint base `.pth` antes de la inferencia. La especialización entrena al modelo en trayectorias multi-paso de búsqueda web y lectura de páginas (`web_search`, `web_fetch`, `no_tool`) con bloques de razonamiento explícito `<think>...</think>`, es decir, convierte el modelo base en un agente de búsqueda y respuesta.

Es relevante porque demuestra un flujo de trabajo completo y reproducible (adaptador PEFT sobre RWKV-7, verificación de checksums, fusión offline y despliegue con `rwkv_lighting_cuda`) para dotar de capacidades agénticas de búsqueda a un modelo de arquitectura RWKV, alternativa a los transformers con atención cuadrática. La licencia MIT y el reducido tamaño del adaptador facilitan su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (modelo base `rwkv7-g1l-7.2b`); adaptador NoRA de bajo rango sobre proyecciones lineales |
| Parametros totales | 7.200 millones (modelo base); adaptador de 151.126.688 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (según nombre del checkpoint base `ctx34304`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.pth` (adaptador `dsh-searchreader-g1l-r32-adapter.pth`; fusión offline con el base `.pth`) |

## Arquitectura y entrenamiento

El modelo base es RWKV-7, una arquitectura recurrente con formulación lineal que evita la atención cuadrática de los transformers; el checkpoint concreto es `rwkv7-g1l-7.2b-20261031-ctx34304.pth`, con 7.200 millones de parámetros y 34.304 tokens de contexto. Sobre él se aplica un adaptador NoRA (Normalized Low-Rank Adaptation) con `rank=32`, `alpha=32.0`, `scale=1.0` y `dtype=bfloat16`, que modifica 192 proyecciones lineales: las proyecciones `att.{receptance,key,value,output}` y `ffn.{key,value}` de los bloques 0 a 31.

El entrenamiento se realizó sobre 5.054 trayectorias multi-paso de búsqueda, lectura de páginas y respuesta directa, durante 1.264 pasos de entrenamiento distribuido en 4 GPU (data parallel). El adaptador está alineado byte a byte con el protocolo de agente `dsh-rwkv-wire-think-v2.0` del DeepSeek Harness, que define las herramientas `web_search`, `web_fetch` y `no_tool`, además de un modo de razonamiento abierto con etiquetas `<think>...</think>`. No se documentan detalles sobre composición exacta del corpus, tokens totales ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento abierto (`<think>...</think>`).
- Agente de búsqueda web multi-paso: invocación de `web_search` y `web_fetch` dentro del protocolo del DeepSeek Harness.
- Decisión de no usar herramientas (`no_tool`) para responder directamente cuando procede.
- Soporte de tool calling mediante el protocolo de cable `dsh-rwkv-wire-think-v2.0`.
- Capacidades multilingües limitadas a chino e inglés.
- Continuación pura de secuencia (pure-continuation) como modo de interacción del agente.

## Casos de uso

- Agente de búsqueda y respuesta: el modelo encadena llamadas a `web_search` y `web_fetch`, lee los resultados y sintetiza una respuesta con razonamiento explícito, gracias a las 5.054 trayectorias de entrenamiento específicas para este flujo.
- Investigación documental automatizada: dado un contexto de hasta 34.304 tokens, puede mantener el hilo de una consulta con múltiples fuentes recuperadas y citar la información relevante.
- Asistente de preguntas y respuestas con verificación: el modo `no_tool` permite responder directamente cuando no se requiere búsqueda, y el modo con herramientas cuando se necesita información actualizada.
- Integración en pipelines de agentes sobre RWKV: el protocolo `dsh-rwkv-wire-think-v2.0` permite conectarlo a orquestadores que esperen ese formato de herramientas, sin reentrenamiento adicional tras la fusión.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 144 MiB que se fusiona con el base, el coste de almacenamiento y distribución es bajo frente a un modelo especializado completo.
- Experimentación académica con PEFT sobre arquitecturas recurrentes: sirve como referencia reproducible (checksums SHA256, script de fusión) para estudiar la adaptación de bajo rango en RWKV-7.
- Uso en mercados de habla china e inglesa: los dos idiomas soportados cubren consultas y fuentes web en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base tiene 7.200 millones de parámetros, por lo que en bfloat16 requeriría del orden de 14-15 GB solo para pesos, más overhead de estado recurrente y caché, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; no se documenta.
- Opciones de despliegue: `rwkv_lighting_cuda` sobre el `.pth` fusionado (con `--cmix-sparse off` y `RWKV_DECODE_BATCH_SIZE=160` en el ejemplo del autor); el adaptador requiere fusión offline previa mediante `scripts/merge_dsh_nora.py` del repositorio RWKV-SearchReader, con ruta rápida C++ (`rwkv_peft_weight_merge`) o fallback en PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RWKV7-G1L-DSH-SearchReader-NoRA | 7.200 M (base) + adaptador NoRA | 34.304 | MIT | Hugging Face (adaptador) | Especializado en agente de búsqueda con protocolo DSH |
| BlinkDL/rwkv7-g1 (base) | 7.200 M | 34.304 | no disponible | Hugging Face | Modelo base sin especialización agéntica |
| Alternativas transformer de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El adaptador no es utilizable de forma autónoma: exige fusionarlo offline con el checkpoint base `rwkv7-g1l-7.2b-20261031-ctx34304.pth` y verificar los checksums SHA256 antes de usarlo.
- El entrenamiento se limita a 5.054 trayectorias y 1.264 pasos; el riesgo de sobreajuste al protocolo DSH y de degradación en tareas fuera de búsqueda web es plausible, aunque no se documenta.
- Idiomas soportados únicamente chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al sintetizar contenido de páginas web recuperadas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia MIT, lo que permite uso comercial, pero el modelo base `BlinkDL/rwkv7-g1` debe verificarse por separado en cuanto a sus propios términos.
- Dependencia del ecosistema RWKV-SearchReader y de `rwkv_lighting_cuda`; no hay soporte documentado para vLLM, llama.cpp u otros servidores de inferencia convencionales.
- No se publican benchmarks ni métricas de calidad, latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/chase-jay/rwkv7-g1l-dsh-searchreader-nora
- Repositorio RWKV-SearchReader: https://github.com/w1c2j3/RWKV-SearchReader
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
