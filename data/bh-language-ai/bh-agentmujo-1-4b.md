# BH-Language-AI/bh-agentmujo-1-4b

## Resumen

BH-AgentMujo-1-4B es un modelo de lenguaje especializado en agentes y function calling para el bosnio (código ISO `bs`), desarrollado por BH-Language-AI. Se construye sobre el modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768` (derivado de la familia Qwen3.5 con contexto de 32.768 tokens) mediante un ajuste fino en dos etapas: un LoRA SFT sobre el adaptador `4b-jt31-thunder` y un posterior LoRA DPO sobre `4b-dpo03-thunder` (160 pares), con un merge en dos pasos. Pertenece a la familia BH-AgentMujo, que cubre las clases 2B, 4B y 9B.

El modelo resuelve un nicho concreto: tareas de agentes en Linux (gestión de servicios, lectura de logs, manejo de paquetes, operaciones con ficheros y flujos multi-paso) expresadas en bosnio. Está diseñado para devolver llamadas a herramientas legibles por máquina y ejecutarse exclusivamente a través del AgentMujo Policy Engine, con el flujo `MODEL → TOOL → POLICY ENGINE → LINUX`. No ejecuta acciones por sí mismo: propone la herramienta y el motor de políticas decide (`allow`, `confirmation_required`, `deny`).

Su relevancia actual radica en que cubre el hueco entre la clase 2B (insuficiente para tareas complejas) y la 9B (demasiado pesada para despliegues modestos), ofreciendo pesos completos en bf16 y un build GGUF Q8 listo para producción, todo bajo licencia Apache-2.0. Es un modelo de 3.653.938.176 parámetros (aproximadamente 3,65 mil millones) con soporte declarado únicamente para bosnio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`, familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 3.653.938.176 (aprox. 3,65 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base `Qwen3.5-4B-bos-32768`) |
| Tipos de cuantizacion | GGUF Q8_0 (build v0.5, 3,9 GB); pesos completos en bf16 (7,3 GB) |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, según la etiqueta `qwen3_5_text` del repositorio y el modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768` (Apache-2.0, commit `34a62191`). No se dispone de detalles adicionales sobre la composición interna de capas, mecanismos de atención ni innovaciones arquitectónicas específicas más allá de lo indicado por la familia base.

El entrenamiento se realizó en dos fases sobre el modelo base: primero un ajuste supervisado (SFT) con el adaptador LoRA `4b-jt31-thunder` (evaluación 0,84) y después un ajuste por preferencias con DPO usando el adaptador `4b-dpo03-thunder` sobre 160 pares, manteniendo el orden SFT→DPO y aplicando un merge en dos pasos. Los adaptadores están publicados en `shaban2024/agentmujo-adapters`. La cuantización a GGUF se generó con `llama.cpp` mediante `convert_hf_to_gguf.py --no-mtp` y el tipo `Q8_0`. El framework de entrenamiento es `agentmujo-training`. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en bosnio, con registro dialectal ijekavico (puntuación 1,0 en la métrica `ijekavica_dialect` del bench interno).
- Function calling / tool calling: devuelve llamadas a herramientas en formato JSON legible por máquina (validez JSON de 1,0 en AgentMujo-Bench v0.5).
- Selección de herramientas para tareas de administración Linux: servicios, logs, paquetes, ficheros y operaciones multi-paso.
- Razonamiento multi-paso orientado a agentes, con propuesta de acciones encadenadas.
- Comportamiento de confirmación: tiende a verificar y preguntar antes de actuar en lugar de ejecutar a ciegas (puntuación 0,4 en `confirmation_behavior`, descrito como decisión deliberada de seguridad).
- Cumplimiento de rechazo: capacidad de declinar peticiones no permitidas (0,8 en `refusal_correctness`).
- Modo no-thinking: las evaluaciones se realizaron en configuración non-thinking, temp 0.
- No se declaran capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente de administración de sistemas en bosnio: el modelo interpreta peticiones como "¿funciona el servicio nginx?" y devuelve la llamada de herramienta adecuada para consultar el estado, que el Policy Engine valida antes de ejecutar en el host Linux.
- Automatización de operaciones multi-paso con confirmación humana: para tareas como reiniciar servicios o instalar paquetes, el modelo propone la secuencia de herramientas y el motor de políticas exige confirmación en los pasos sensibles, aprovechando su comportamiento conservador de confirmación.
- Análisis de logs guiado por lenguaje natural: el usuario describe el síntoma en bosnio y el modelo selecciona la herramienta de lectura o filtrado de logs correspondiente, con argumentos que el Policy Engine normaliza y valida.
- Integración en pipelines de agentes con tool calling: al devolver JSON válido de forma consistente (1,0 en el bench), puede encadenarse en orquestadores que parsean la llamada y la enrutan al ejecutor de políticas.
- Despliegue en entornos con recursos limitados: el build GGUF Q8 (3,9 GB) permite servir el modelo en infraestructura modesta mediante Ollama, cubriendo tareas de agente que la clase 2B no resuelve con suficiente capacidad.
- Atención conversacional de primer nivel en bosnio: para interfaces de chat que combinan conversación general con capacidad de escalar a acciones sobre el sistema, manteniendo el dialecto ijekavico.
- Sustitución intermedia en la familia BH-AgentMujo: cuando la clase 2B se queda corta y la 9B no cabe en el hardware disponible, este 4B ofrece un punto intermedio para las mismas tareas de agente Linux.

## Benchmarks y rendimiento

Resultados de AgentMujo-Bench v0.5 (48 casos, bf16 completo, GPU T4, temperatura 0, configuración non-thinking, 2026-11-12):

| Metrica | v05 full (este modelo) |
|---|---|
| tool_selection | 0.733 |
| json_validity | 1.0 |
| safety | 0.857 |
| refusal_correctness | 0.8 |
| confirmation_behavior | 0.4 |
| high_level_preference | 0.6 |
| no_tool_correctness | 0.25 (limitación conocida) |
| ijekavica_dialect | 1.0 |
| argument_accuracy | 0.0 (problema de formato, no de capacidad; ver nota) |

Nota del autor sobre `argument_accuracy`: el modelo selecciona la herramienta y los valores correctos, pero los envuelve en saltos de línea (`"\nnginx\n"` frente a `"nginx"`) y añade argumentos opcionales, lo que hace que un scorer estricto con `==` los invalide. El autor propone un scorer normalizado (bench v0.6) y un rescore de las baselines históricas con el mismo scorer; hasta entonces, la cifra de argumentos de v05 no debe usarse para comparar modelos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bf16 (pesos de 7,3 GB más overhead); aproximadamente 4-5 GB en GGUF Q8 (3,9 GB de pesos más contexto).
- GPU recomendadas: el autor evaluó en una T4; para bf16 se recomienda una GPU con al menos 16 GB (RTX 4090, A100, H100). Para Q8 basta con una GPU de 8 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en Q8 en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y en bf16 en tarjetas de 16 GB o más (RTX 4080, RTX 4090).
- Opciones de despliegue: Ollama (recomendado por el autor para producción con el GGUF Q8), llama.cpp, transformers con `trust_remote_code=True` para los pesos bf16. No se confirma soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-4B (este) | 3,65 B | 32.768 | Agente Linux en bosnio, tool calling | Apache-2.0 | HF + GGUF Q8 |
| bh-agentmujo-1-2b | No disponible | No disponible | Agente Linux en bosnio, clase ligera | No disponible | HF (Q8 v0.5) |
| bh-agentmujo-1-9b | No disponible | No disponible | Agente Linux en bosnio, clase alta (gold06, producción) | No disponible | HF |
| alphaedge-ai/Qwen3.5-4B-bos-32768 (base) | No disponible | 32.768 | Modelo base bosnio, sin ajuste de agente | Apache-2.0 | HF |

El autor indica que la clase 9B (`bh-agentmujo-1-9b`, gold06) ofrece la máxima precisión en producción, mientras que la 2B es la opción ligera. No se dispone de datos de benchmarks comparativos entre las tres clases en la información proporcionada.

## Limitaciones y advertencias

- `no_tool_correctness` de 0,25: el modelo tiende a proponer herramientas incluso en conversación trivial (trigger-happy en chitchat); el autor señala que la capa de políticas compensa este exceso.
- `confirmation_behavior` de 0,4: prefiere verificar y preguntar antes de actuar en lugar de ejecutar directamente; es una decisión deliberada por seguridad, pero reduce la autonomía.
- `argument_accuracy` de 0,0 bajo el scorer estricto actual: artefactos de formato (saltos de línea, argumentos opcionales extra) invalidan argumentos correctos; requiere normalización en el pipeline o un scorer actualizado.
- El modelo solo propone la herramienta; no la ejecuta. La ejecución depende obligatoriamente del AgentMujo Policy Engine (`allow` / `confirmation_required` / `deny`), y el terminal es solo un fallback.
- Cobertura lingüística limitada al bosnio (`bs`); no se declaran capacidades multilingües.
- Riesgo de alucinación inherente a modelos de 4B; el autor no documenta mitigaciones específicas más allá del filtrado por políticas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`.
- Para máxima precisión en producción, el propio autor recomienda la clase 9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Clase 2B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Clase 9B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Repositorio de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Informe de evaluación (Kaggle): https://www.kaggle.com/code/admiragic/bh-v05-4b-eval-merged-full
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
