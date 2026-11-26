# BH-Language-AI/bh-agentmujo-1-2b

## Resumen

BH-AgentMujo-1-2B es un modelo de lenguaje especializado en function calling y comportamiento agentico para el idioma bosnio, desarrollado por BH-Language-AI (Kolektiv d.o.o.). Su propósito no es la generación de prosa libre, sino actuar como el "cerebro" de un agente local de administración de sistemas Linux: en lugar de devolver texto conversacional, emite llamadas a herramientas en formato estructurado (`service_*`, `disk`/`memory`/`cpu`, `process_list`, `network_status`, `port_check`, `package_*`, `file_*`, con terminal como fallback) que se integran en el bucle `MODEL → TOOL → POLICY ENGINE → LINUX`.

El modelo se construye sobre `alphaedge-ai/Qwen3.5-2B-bos-32768` (Apache-2.0, 1.77B parámetros según la model card, vocabulario de 32.768 tokens, contexto de 32.768 tokens) mediante ajuste fino con LoRA en dos fases (function calling y luego agentic) más un rebalance, seguido de un merge en dos pasos. El resultado es un modelo de aproximadamente 1,44 mil millones de parámetros reales en safetensors, distribuido tanto en bf16 como en GGUF Q8 de 1,53 GB, lo que permite ejecución local en CPU sin depender de servicios externos de IA.

Su relevancia radica en la combinación de tres factores: tamaño reducido (clase 2B), licencia Apache-2.0 permisiva para uso comercial y un enfoque explícito en un caso de uso operativo concreto con un Policy Engine obligatorio que decide `allow / confirmation_required / deny`. Es un modelo de nicho, orientado a un idioma con poca cobertura (bosnio) y a una tarea muy específica, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`, `qwen35.block_count=24`) |
| Parametros totales | 1.440.374.592 (safetensors); model card declara base de 1,77B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base `Qwen3.5-2B-bos-32768`) |
| Tipos de cuantizacion | bf16 (pesos completos) y GGUF Q8_0 (`model-q8.gguf`, 1,53 GB, 320 tensores) |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de `alphaedge-ai/Qwen3.5-2B-bos-32768` en la revisión `2f89b833`, un transformer decoder-only de la familia Qwen3.5 con 24 bloques y vocabulario de 32.768 tokens. Sobre esa base se aplicó LoRA con r=16 y alpha=32 sobre 7 módulos, en precisión bf16 y sobre GPU Kaggle T4. El entrenamiento se estructuró en tres etapas de datos: 147 ejemplos de function calling, 105 ejemplos agenticos y 100 ejemplos de rebalance, con una mezcla v0.21 que redujo la eval-loss de 1,067 a 0,937. Tras el ajuste se realizó un merge en dos pasos para consolidar los adaptadores en los pesos finales.

La cuantización a GGUF se llevó a cabo con `convert_hf_to_gguf.py --no-mtp` y el tipo `Q8_0`, generando un único archivo de 1,53 GB con 320 tensores que cubre los dos perfiles de prompt (`think: true` y `think: false`). El formato de herramienta que el modelo emite es `<tool_call><function=ime><parameter=arg>vrijednost</parameter></function></tool_call>`. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste descrito es supervisado (SFT) vía LoRA. El framework de entrenamiento es público en el repositorio `agentmujo-training`.

## Capacidades

- Emisión de llamadas a herramientas en formato estructurado y validado como JSON (`json_validity` = 1,0 en el benchmark del autor).
- Selección de herramientas del catálogo AgentMujo: gestión de servicios (`service_*`), monitorización de recursos (`disk`, `memory`, `cpu`), listado de procesos (`process_list`), estado de red (`network_status`), comprobación de puertos (`port_check`), gestión de paquetes (`package_*`) y operaciones de ficheros (`file_*`).
- Uso de terminal como mecanismo de fallback cuando ninguna herramienta específica encaja.
- Comportamiento agentico multi-paso dentro del bucle MODEL → TOOL → POLICY ENGINE → LINUX (task_success 0,917 en el bucle de agente según el autor).
- Gestión de confirmaciones: distingue operaciones que requieren confirmación explícita del usuario (confirmation_behavior 0,8).
- Preferencia por herramientas de alto nivel frente a comandos de bajo nivel (high_level_preference 1,0).
- Capacidad de no invocar herramienta cuando la consulta no lo requiere (no_tool_correctness 1,0).
- Conversación multi-turno en bosnio con registro ijekavico correcto (ijekavica 1,0).
- Perfil de razonamiento (`think: true/false`) disponible en el GGUF, aunque el autor indica que el perfil think no superó claramente la validación y se mantiene en el nivel v0.4.

## Casos de uso

- Automatización de operaciones Linux en bosnio: el modelo traduce una petición en lenguaje natural ("Radi li nginx servis?") a una llamada `service_status` estructurada, que el Policy Engine valida antes de ejecutarse. Adecuado por su entrenamiento específico en el catálogo de herramientas y su formato de salida parseable.
- Asistente de diagnóstico de infraestructura: ante una incidencia, el agente encadena `process_list`, `memory`, `disk` y `network_status` en varios pasos para recoger evidencia antes de proponer una acción, gracias a su comportamiento agentico multi-paso.
- Gestión de paquetes con confirmación humana: el modelo propone `package_install` o `package_remove` y marca la operación como `confirmation_required`, lo que permite construir flujos de aprobación para cambios destructivos.
- Lectura y filtrado de logs: combinado con `file_read` y terminal como fallback, permite consultas del tipo "muéstrame los errores recientes de este servicio" sin que el usuario escriba comandos.
- Despliegue en entornos air-gapped o de baja conectividad: al ejecutarse en CPU con un GGUF Q8 de 1,53 GB, encaja en servidores sin GPU y sin envío de datos a servicios externos, requisito habitual en administración pública o infraestructura crítica.
- Comprobación de conectividad y puertos en tareas de soporte: `port_check` y `network_status` permiten resolver consultas de primer nivel de un helpdesk técnico en bosnio sin escalar a un operador.
- Integración como capa de intención en un chatbot de soporte interno: el modelo clasifica la petición y emite la herramienta adecuada, dejando la ejecución y el control de permisos al Policy Engine.

## Benchmarks y rendimiento

Datos publicados por el autor en AgentMujo-Bench v0.5 (48 casos, Q8, Ollama, temperatura 0, prompt de producción non-thinking):

| Metrica | Base Q8 | v0.4 | v0.5 (este modelo) |
|---|---|---|---|
| tool_selection | 0,143 | 0,667 | 0,800 |
| argument_accuracy | 0,0 | 0,731 | 0,808 |
| confirmation_behavior | 0,6 | 0,6 | 0,8 |
| high_level_preference | 0,8 | 0,8 | 1,0 |
| no_tool_correctness | 0,75 | 0,75 | 1,0 |
| refusal_correctness | 1,0 | 1,0 | 0,8 |
| safety | 1,0 | 1,0 | 1,0 |
| ijekavica / json_validity | 1,0 | 1,0 | 1,0 |

En el bucle de agente completo el autor reporta task_success 0,917 y safety 1,0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Todas las cifras proceden del conjunto de evaluación propio del autor, por lo que no son directamente comparables con evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3 GB de pesos más overhead de activaciones y caché KV; viable en GPUs consumer de 8 GB o más.
- VRAM estimada en GGUF Q8_0: aproximadamente 1,6-2 GB de pesos; ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 en adelante) para bf16; A100/H100 no son necesarias dado el tamaño. El entrenamiento se realizó en Kaggle T4, lo que da una idea del perfil de cómputo.
- Cabe en GPU consumer: sí, holgadamente, incluso en tarjetas de 4-6 GB con Q8.
- Opciones de despliegue: Ollama (recomendado por el autor para producción con el GGUF), llama.cpp, transformers con `trust_remote_code=True` para los pesos bf16. El repo incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-2B | 1,44B (safetensors) | 32.768 | Function calling y agentes Linux en bosnio | Apache-2.0 | HF (safetensors + GGUF Q8) |
| bh-agentmujo-1-4b | no disponible | no disponible | Misma familia, clase media, full v05 | Apache-2.0 (según familia) | HF |
| bh-agentmujo-1-9b | no disponible | no disponible | Misma familia, clase alta, gold06 | Apache-2.0 (según familia) | HF |
| alphaedge-ai/Qwen3.5-2B-bos-32768 | 1,77B | 32.768 | Base generalista en bosnio | Apache-2.0 | HF |

La comparación más directa es con el modelo base, que obtiene tool_selection 0,143 frente a 0,800 de este modelo en el benchmark del autor. No se dispone de datos de benchmarks cruzados con modelos de otras familias (por ejemplo, Qwen2.5 de 1,5B o Llama 3.2 de 1B) en la información proporcionada.

## Limitaciones y advertencias

- Generación de prosa claramente inferior a las clases 4B y 9B de la misma familia; el autor recomienda esas variantes para uso general.
- Conocimiento del bosnio limitado fuera de tareas operativas; no es un modelo cultural o enciclopédico.
- `refusal_correctness` baja de 1,0 a 0,8 respecto a versiones anteriores: los rechazos a veces no usan la frase canónica, aunque el comportamiento sea correcto.
- El modelo solo propone herramientas; no las ejecuta. La ejecución debe pasar obligatoriamente por un Policy Engine con lógica `allow / confirmation_required / deny`. Desplegarlo sin esa capa es un riesgo de seguridad.
- El perfil `think: true` no superó claramente la validación y se mantiene en el nivel v0.4; el perfil non-thinking es el recomendado para producción.
- Benchmark propio del autor (48 casos) con posible sesgo de diseño; no hay validación independiente.
- Riesgo de alucinación en argumentos de herramientas no cubiertos por el conjunto de entrenamiento (147 + 105 + 100 ejemplos), que es reducido.
- Idioma único (bosnio): no hay soporte fiable de castellano ni de otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-2B-bos-32768
- Variante 4B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Variante 9B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Repositorio de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
