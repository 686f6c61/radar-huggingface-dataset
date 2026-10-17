# csminion/apex-qwen36-terminal

## Resumen

APEX Terminal r16 (identificador `csminion/apex-qwen36-terminal`) es un adaptador LoRA de PEFT desarrollado por el usuario csminion sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (21.166.080 parámetros FP32 repartidos en 620 tensores y 310 módulos, un fichero safetensors de 84.760.832 bytes, aproximadamente 0,1 GB). Los pesos completos del modelo base no se distribuyen aquí y deben obtenerse por separado en la revisión fijada `995ad96eacd98c81ed38be0c5b274b04031597b0`.

El objetivo del adaptador es convertir un modelo multimodal de propósito general en un agente de terminal: emitir comandos, interpretar las observaciones devueltas, mostrar planificación visible y cerrar la tarea con acciones de completado. Se entrenó sobre 2.000 episodios de historiales públicos con formato Terminus, procedentes de dos corpus: TerminalHorizon-3K (1.107 episodios) y Nemotron-RL-Agentic-Terminal-Pivot-v1 (893 episodios).

Su relevancia es la de un experimento de investigación reproducible y muy ligero: un ajuste de solo 250 pasos de optimizador sobre 4 GPU H100, con el modo *thinking* desactivado y una receta de limpieza de datos documentada de forma inusualmente detallada. En el momento de redactar esta ficha no se ha publicado ninguna puntuación de benchmark completada, por lo que su rendimiento real frente a otros agentes de terminal está por verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer MoE (Qwen3.6-35B-A3B, con atención lineal y MLP de experto compartido) |
| Parámetros totales | Adaptador: 21.166.080 (21,17 M) en 620 tensores FP32; modelo base: no confirmado en la información disponible (la nomenclatura del base sugiere 35B) |
| Parámetros activos | No confirmado; la nomenclatura del modelo base (`35B-A3B`) sugiere 3B activos por token, pero no se verifica en la tarjeta del adaptador |
| Longitud de contexto | 65.536 tokens totales y 8.192 tokens de salida por llamada principal o auxiliar (protocolo de evaluación declarado) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `apache-2.0-adapter-contributions-plus-upstream-notices` (campo `license: other`, fichero LICENSE en el repositorio) |
| Formato de pesos | `safetensors` (adaptador LoRA en FP32 para PEFT); pesos del modelo base no incluidos |
| Configuración LoRA | `r=16`, `lora_alpha=32`, escalado `alpha/r=2`, dropout 0,05, `bias=none`, LoRA ordinario (sin DoRA ni RS-LoRA), `task_type=CAUSAL_LM`, sin `modules_to_save` |
| Módulos objetivo | Proyecciones q/k/v/o de self-attention, `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a` y `out_proj` de atención lineal, y `gate_proj`/`up_proj`/`down_proj` del MLP compartido |
| Módulos congelados | Router, pesos de expertos enrutados, codificador visual y alineador |
| Pipeline declarado | `image-text-to-text` |
| Revision del base | `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Checkpoint entregado | 250 (final y de mínima pérdida de validación del run completado) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA estándar aplicado sobre un modelo base de tipo mezcla de expertos con capas de atención lineal. La expresión regular exacta de los módulos objetivo es `model\.language_model\.layers\.\d+\.(?:self_attn\.(?:q_proj|k_proj|v_proj|o_proj)|linear_attn\.(?:in_proj_qkv|in_proj_z|in_proj_b|in_proj_a|out_proj)|mlp\.shared_expert\.(?:gate_proj|up_proj|down_proj))`. Esto significa que el ajuste toca atención, atención lineal y el experto compartido, pero deja intactos el router y los expertos enrutados, de modo que no se altera el mecanismo de enrutamiento aprendido por el modelo base. El codificador visual y el alineador también quedan congelados: el adaptador solo modifica el comportamiento del modelo de lenguaje.

El entrenamiento nativo se ejecutó en 4 GPU H100 con acumulación de gradiente 2 y batch global 8, hasta completar 250 pasos de optimizador. Se usó AdamW (`adamw_torch`), tasa de aprendizaje 1e-4 con decaimiento coseno, warmup 0,03, weight decay 0,1, checkpointing de gradiente, DeepSpeed ZeRO-3, SDPA y Liger, con semillas 20261016 para entrenamiento y datos. El empaquetado (*packing*) y el modo libre de relleno se desactivaron, y se activó la agrupación por longitud; las secuencias completas que superaban los 65.536 tokens se eliminaron en lugar de truncarse silenciosamente, y se comprobó además un techo de 8.192 tokens para la salida del asistente. La evaluación y el guardado nativos ocurrían cada 16 pasos y en el paso final. La validación SFT contiene 42 episodios.

La receta fijó `enable_thinking=false`, `preserve_thinking=false`, `add_non_thinking_prefix=true` y `loss_scale=default+ignore_empty_think`. Durante la preparación se eliminaron los campos de razonamiento oculto y los bloques `<think>` iniciales cerrados, conservando explicaciones visibles, observaciones de herramientas y campos de análisis y planificación del terminal. Los 2.000 episodios combinan 1.107 de TerminalHorizon-3K (`45f1e98e317d3639437f0eb02f4e8bc5825732f3`, con docentes declarados DeepSeek-V4-Pro-0813) y 893 de Nemotron-RL-Agentic-Terminal-Pivot-v1 (`eaef26944643644c8a3dbbf361ce6128142f5976`, con docentes GLM-5.1 y GLM-5.1-FP8). Se trata de 1.303 claves de tarea o familia de origen, no de 2.000 entornos independientes. El corpus no se reprodujo localmente de extremo a extremo y el equilibrio por categorías de Pivot queda sin clasificar.

## Capacidades

- Ejecución de tareas de terminal en varios turnos: el modelo emite comandos, recibe observaciones y continúa el bucle hasta una acción de completado.
- Planificación visible: los datos conservan campos de análisis y plan del terminal, por lo que el adaptador aprende a exponer el plan en texto, no solo la acción.
- Formato de agente tipo Terminus, con acciones estructuradas y señalización de `task_complete=true`.
- Integración con herramientas y observaciones: el entrenamiento usa historiales con observaciones de herramientas, lo que favorece el funcionamiento en bucles de agente con retorno del entorno.
- Modo sin razonamiento oculto (`enable_thinking=false` y prefijo no-thinking), pensado para respuestas directas y de menor coste en tokens.
- Capacidad multimodal potencial heredada del base (`pipeline_tag: image-text-to-text`), aunque el adaptador no modifica el codificador visual ni el alineador y no se documenta entrenamiento con imágenes.
- Capacidades multilingües: no disponible.
- Tool calling / function calling explícito: no documentado como tal en la información disponible; el modelo trabaja con el esquema de acciones del formato Terminus.
- Modo de pensamiento extendido: explícitamente desactivado en esta receta.

## Casos de uso

- Agente de operaciones en terminal: bucle cerrado de proponer comando, leer salida y corregir. El contexto de 65.536 tokens permite arrastrar el historial completo de una sesión de diagnóstico sin resumir, algo útil cuando la salida de comandos como `journalctl` o `kubectl describe` es muy verbosa.
- Automatización de parches en repositorios: encaja en flujos tipo SWE-agent, donde el modelo explora el árbol de ficheros, ejecuta tests y aplica un parche. El protocolo de evaluación declarado (SWE Pro V2 HARD-51 con mini-swe-agent 2.4.6 y 30 minutos de presupuesto) apunta directamente a este escenario, aunque no hay puntuaciones publicadas.
- Integración en pipelines de CI/CD: usar el adaptador como paso de reparación automática tras un fallo de build, con el límite de 8.192 tokens de salida por llamada para contener el coste.
- Administración de sistemas y troubleshooting guiado: sesiones interactivas de diagnóstico en servidores, con el modelo proponiendo comandos de inspección y explicando la causa raíz a partir de las observaciones.
- Construcción y verificación de entornos reproducibles: instalación de dependencias, ajuste de versiones y validación de que el entorno arranca, tarea donde el formato de historial completo hasta `task_complete` es directamente aprovechable.
- Triage de logs y respuesta a incidentes: parseo de salidas largas de servicios, correlación de errores y propuesta de mitigación, apoyándose en la ventana de contexto amplia.
- Investigación en agentes: base ligera y reproducible (un LoRA de 21 M de parámetros entrenado en 250 pasos) para estudiar destilación de trayectorias de terminal, limpieza de razonamiento oculto y conversión de supervisión con *thinking* a modo directo.
- Generación de scripts de shell a partir de lenguaje natural: el adaptador produce comandos con la sintaxis y las convenciones de los historiales de entrenamiento, y el modo no-thinking reduce la latencia frente a alternativas con cadena de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia tarjeta indica que todas las puntuaciones formales de benchmark quedan pendientes de completarse y que no se ofrece ninguna garantía de rendimiento o corrección. Se documentan los protocolos de evaluación previstos, que no equivalen a resultados:

| Evaluación prevista | Protocolo declarado | Resultado |
|---|---|---|
| SWE-bench Pro V2 HARD-51 | mini-swe-agent 2.4.6 fijado, 30 minutos por solver, replay de parche limpio, BF16, sin thinking, 65.536 de contexto / 8.192 de salida | Pendiente |
| Terminal | 89 tareas × 5 semillas, Terminus2, 30 minutos, 4 CPU / 8 GiB, resúmenes nativos | Pendiente |
| HLE | 2.500 preguntas completas, incluidas 342 con imagen, sin herramientas, 300 s por pregunta, juez DeepSeek-V4-Flash alojado por la institución | Pendiente |
| ASI | 60 tareas públicas × B1–B4, semilla oficial de instancia 31415, DirectLLM nativo, 4 CPU / 8 GiB, 1.200 s de generación más ejecución | Pendiente |

No debe interpretarse ninguna cifra como resultado obtenido: la pérdida de validación SFT y las ejecuciones incompletas no son puntuaciones de benchmark, y los fallos de infraestructura de los evaluadores se registran como nulos, no como ceros.

## Requisitos de hardware

- Tamaño del artefacto: el adaptador ocupa aproximadamente 0,1 GB y se carga sobre el modelo base; por sí solo no es ejecutable.
- Entrenamiento declarado: 4 GPU H100, DeepSpeed ZeRO-3, SDPA y Liger, batch global 8 y 250 pasos.
- VRAM de inferencia del modelo base: no disponible en la tarjeta. Como estimación derivada del tamaño nominal del base (35B), en BF16 los pesos rondarían los 70 GB, en FP8 unos 35 GB y en cuantización de 4 bits en torno a 18-20 GB; estas cifras son cálculos a partir de la nomenclatura del modelo base y no están confirmadas por el autor.
- GPU recomendadas: H100 o A100 de 80 GB para BF16 en una o varias tarjetas. Para cuantizaciones de 4 bits serían necesarias tarjetas de 24 GB o más (RTX 4090, RTX 3090, L40S), siempre que el soporte de la arquitectura MoE concreta exista en el runtime elegido.
- GPU de consumo: no confirmado. En un MoE los pesos de todos los expertos deben residir en memoria aunque solo se activen unos pocos por token, por lo que el cuello de botella es la capacidad total, no la computación. Cabe esperar que no quepa en 24 GB sin cuantización agresiva.
- Opciones de despliegue: no documentadas por el autor. Al ser un adaptador PEFT, la vía habitual es fusionarlo con el base y servirlo con vLLM, TGI o llama.cpp/Ollama si existe conversión GGUF de la arquitectura base. No hay confirmación de compatibilidad con ninguno de estos runtimes.
- Latencia y throughput: no disponible. La ventana de 65.536 tokens de entrada y 8.192 de salida por llamada condiciona fuertemente el coste por episodio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| csminion/apex-qwen36-terminal | Adaptador LoRA sobre Qwen3.6-35B-A3B | 21,17 M en el adaptador; base según nomenclatura 35B-A3B | 65.536 total / 8.192 salida | `apache-2.0-adapter-contributions-plus-upstream-notices` | Público en HuggingFace, 0 descargas y 0 likes | Sin benchmarks publicados |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Modelo completo MoE multimodal | No confirmado (nomenclatura 35B-A3B) | No disponible | No disponible en la información proporcionada | Público, revisión fijada `995ad96...` | No disponible |
| Otros adaptadores de agente de terminal | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La tarjeta menciona una comparación de proyecto que usa BF16, modo no-thinking y 65.536 de contexto con 8.192 de salida, y advierte que se trata de un protocolo limitado en recursos, distinto de los leaderboards de los publicadores. No se incluyen en la información proporcionada los modelos concretos con los que se compara.

## Limitaciones y advertencias

- Ausencia total de benchmarks: ninguna puntuación formal está completada, de modo que no existe evidencia publicada de rendimiento o corrección. No debe desplegarse en producción sobre la base de expectativas no verificadas.
- Riesgo alto de comandos destructivos: un agente de terminal que genera y ejecuta comandos puede borrar datos, romper configuraciones o tumbar servicios. Es imprescindible sandboxing, revisión humana y permisos mínimos.
- Alucinación de sintaxis y de estado del sistema: el modelo puede inventar rutas, nombres de paquete, salidas de comandos o suponer que una operación anterior tuvo éxito.
- Sesgos y dominio limitado: el entrenamiento procede de 1.303 claves de tarea o familia de solo dos corpus, con equilibrio por categorías no clasificado en el caso de Pivot. La cobertura de dominios reales es incierta.
- Idiomas: no declarados. No hay garantía de comportamiento correcto fuera del inglés técnico presente en los historiales de entrenamiento.
- Licencia restrictiva en la práctica: el campo es `license: other` con un nombre que obliga a respetar avisos tanto de las contribuciones del adaptador como del proyecto upstream. Antes de uso comercial hay que revisar el fichero LICENSE y las condiciones del modelo base.
- Modo thinking desactivado: el adaptador no expone cadena de razonamiento oculto y la supervisión se convirtió a formato no-thinking. Esto reduce la latencia, pero puede recortar la calidad en tareas que requieren planificación larga.
- Contexto y salida acotados en el protocolo de evaluación: 65.536 tokens totales y 8.192 de salida por llamada. Secuencias más largas se descartaron en entrenamiento, no se truncaron, lo que implica que el modelo no ha visto dependencias que excedan ese límite.
- Adaptador solo de lenguaje: el codificador visual y el alineador están congelados y el pipeline declarado es image-text-to-text, pero no hay evidencia de que el adaptador mejore o siquiera soporte tareas de visión en el contexto de terminal.
- Trazabilidad de datos incompleta: el corpus no se reprodujo localmente de extremo a extremo y se registran 71.660.040 secuencias completas de plantilla de origen, cifra que no equivale al número de tokens supervisados nativos.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación externa ni informes de terceros.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/csminion/apex-qwen36-terminal
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Dataset TerminalHorizon-3K: https://huggingface.co/datasets/shunzou05/TerminalHorizon-3K/blob/45f1e98e317d3639437f0eb02f4e8bc5825732f3/README.md
- Dataset Nemotron-RL-Agentic-Terminal-Pivot-v1: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Terminal-Pivot-v1/blob/eaef26944643644c8a3dbbf361ce6128142f5976/README.md
- Licencia del repositorio: fichero LICENSE en https://huggingface.co/csminion/apex-qwen36-terminal
