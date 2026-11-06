# krush420/llama3-hermes3-8b-sre-lora

## Resumen

`krush420/llama3-hermes3-8b-sre-lora` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `NousResearch/Hermes-3-Llama-3.1-8B`, desarrollado por el usuario krush420 dentro del ecosistema KruschStack. El adaptador está orientado a tareas de Site Reliability Engineering (SRE), auditoría de código con anclaje AST y ejecución de tool calling en entornos agénticos. Cuenta con 41.943.040 parámetros entrenables distribuidos sobre las siete proyecciones lineales del transformer de Llama 3.1 (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango `r=16` y `lora_alpha=32`.

El modelo se presenta como el tier "L1.5 Edge" de una familia más amplia que incluye un QLoRA de 30B sobre Qwen3-Coder y un QLoRA de 120B sobre gpt-oss, destinados a cubrir distintos niveles de recursos. Su propuesta principal es mejorar el rendimiento de un modelo de 8B en tareas de memoria multi-turno y ejecución de herramientas simuladas, pasando de un 1,17 % a un 18,33 % de tasa de éxito en el benchmark DolphinBench (600 tareas) según los datos declarados por el autor.

La relevancia del adaptador reside en su enfoque en despliegue en el borde: con cuantización Q4_0 ocupa aproximadamente 4,7 GB de VRAM, lo que lo hace viable en hardware de consumo. Incluye además un `Modelfile` para Ollama que corrige dos bugs del template Go de `hermes3` relacionados con la pérdida del contexto de sistema cuando se adjuntan herramientas y con el análisis AST de las llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Llama 3.1 (adaptador de bajo rango) |
| Parametros totales | 41.943.040 (parámetros entrenables del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.1 de 8B, no declarada en la ficha) |
| Tipos de cuantizacion | Q4_0 (mencionada explícitamente, ~4,7 GB VRAM); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Meta Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `NousResearch/Hermes-3-Llama-3.1-8B`, un transformer decoder-only de la familia Llama 3.1. El LoRA utiliza rango `r=16` y `lora_alpha=32`, y se entrena sobre las siete proyecciones lineales del modelo base, lo que da los 41,94 M de parámetros entrenables. El entrenamiento se realizó en BF16 nativo mediante un pipeline de dos etapas: primero SFT (supervised fine-tuning) y después calibración con `trl.DPOTrainer` con anclaje KL (KL-anchored DPO).

El conjunto de datos declarado es `krush420/sovereign-code-audit-sft`, con 18.131 registros SFT y DPO repartidos en siete splits y descritos como "zero-leak". Los datos cubren auditoría de código anclada en AST, síntesis "Lego-First" y tool calling agéntico. El autor reporta una precisión de tokens del 89,64 % en la etapa 1 (SFT en BF16) y una precisión de preferencias del 100 % en la etapa 2 (DPO con anclaje KL), si bien estas métricas no están verificadas de forma independiente.

Como innovación destacable, el repositorio incluye un `Modelfile` para Ollama que corrige dos problemas del template Go de `hermes3`: la pérdida del prompt de sistema cuando se pasan definiciones de herramientas y la desactivación del parser estructurado de `<tool_call>` cuando se añade una segunda rama `{{ if .ToolCalls }}` en el turno del asistente.

## Capacidades

- Generación de texto conversacional multi-turno con memoria a largo plazo en escenarios simulados.
- Ejecución de tool calling y function calling en formato estructurado `<tool_call>`.
- Razonamiento agéntico multi-paso dentro de un harness (KruschStack, MCP).
- Auditoría de código con anclaje en AST (análisis estático asistido por el modelo).
- Síntesis de código con enfoque "Lego-First" (composición modular de fragmentos).
- Tareas propias de SRE: diagnóstico, revisión y automatización de operaciones.
- Integración con el stack MCP de 39 herramientas y 7 pilares de KruschStack.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Auditoría de código automatizada en CI/CD: el adaptador está entrenado específicamente en auditoría anclada en AST, por lo que puede integrarse en pipelines para revisar cambios de código y señalar problemas estructurales antes del merge.
- Agente SRE autónomo: combinado con el harness Jean SRE del mismo autor, puede ejecutar tareas de diagnóstico y remediación de forma continua, con tool calling estructurado hacia las 39 herramientas del stack MCP.
- Asistente de operaciones con memoria multi-turno: su entrenamiento en DolphinBench (tareas con 1,5 M de tokens y tres personas) lo hace adecuado para conversaciones largas donde se requiere recordar contexto entre sesiones.
- Despliegue en el borde con Ollama: el `Modelfile` incluido y el tamaño de ~4,7 GB en Q4_0 permiten ejecutarlo en estaciones de trabajo o portátiles con GPU de consumo para tareas de revisión y asistencia local.
- Referee entre modelos de mayor tamaño: el autor lo describe como "cross-family referee", es decir, para evaluar o contrastar salidas de modelos mayores en pipelines de destilación.
- Generación de código modular: el entrenamiento "Lego-First" lo orienta a componer fragmentos de código reutilizables en lugar de generar bloques monolíticos.
- Automatización de soporte técnico interno: con tool calling y contexto de sistema preservado (gracias al fix del template), puede gestionar incidencias con acceso a herramientas internas.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| DolphinBench (600 tareas, 3 personas, 1,5 M tokens) | Pass rate con juez oficial gpt-5.6-sol | 18,33 % (110/600) | 15,7x sobre el 8B stock (1,17 %, 7/600) |
| DolphinBench (persona Morgan) | Pass rate | 26,0 % (52/200) | Supera a Hermes + MiniMax M3 + Supermemory (45/200) |
| DolphinBench | Comprobaciones mecánicas deterministas | 64,2 % (841/1.310) | — |
| Sovereign Code Audit SFT | Precisión de tokens etapa 1 (BF16 SFT) | 89,64 % | — |
| Sovereign Code Audit DPO | Precisión de preferencias etapa 2 (DPO con KL) | 100 % | — |

El autor menciona además que supera 5/5 puertas de causalidad puramente deterministas con coste de inferencia de 0,00 USD.

## Requisitos de hardware

- VRAM estimada: ~4,7 GB con cuantización Q4_0 (dato declarado por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en Q4_0 según el dato de VRAM declarado.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido), llama.cpp (formato GGUF), transformers + PEFT (safetensors), vLLM y TGI (no confirmados explícitamente por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| krush420/llama3-hermes3-8b-sre-lora | 41,94 M (adaptador sobre 8B) | no disponible | SRE, auditoría de código, tool calling | llama3.1 |
| NousResearch/Hermes-3-Llama-3.1-8B (base) | 8B | no disponible | Instrucciones generales, tool calling | llama3.1 |
| krush420/qwen3-coder-30b-sre-lora | QLoRA sobre 30B (MoE) | no disponible | SRE, tier local MoE | no disponible |
| krush420/gpt-oss-120b-sre-lora | QLoRA sobre 120B | no disponible | SRE, tier burst | no disponible |

Los dos últimos son compañeros de la misma familia KruschStack, no alternativas externas. No se dispone de datos de benchmarks comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base `NousResearch/Hermes-3-Llama-3.1-8B` para funcionar.
- Todas las métricas de benchmark son declaradas por el autor y están marcadas como no verificadas (`verified: false`); deben tratarse con cautela.
- El repositorio no tiene descargas ni likes en el momento de la ficha, lo que limita la validación por parte de la comunidad.
- No se declaran los idiomas soportados; el comportamiento multilingüe es incierto.
- No se declara la longitud de contexto efectiva del adaptador.
- El modelo base arrastra los sesgos y el riesgo de alucinación propios de Llama 3.1 de 8B; el ajuste fino en dominios técnicos no elimina estos problemas.
- La licencia llama3.1 (Meta Llama 3.1 Community License) impone restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de un despliegue en producción.
- El `Modelfile` corrige bugs del template de Ollama; usarlo sin ese archivo puede provocar la pérdida silenciosa del prompt de sistema o la fuga de XML sin parsear en `message.content`.
- El entrenamiento está muy especializado en SRE y auditoría de código; el rendimiento en tareas generales puede degradarse respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/llama3-hermes3-8b-sre-lora
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Logs de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- KruschStack: https://github.com/kruschdev/krusch-stack
- Jean SRE by Kruschdev: https://github.com/kruschdev/Jean-SRE-by-kruschdev
- Modelo compañero 30B: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Modelo compañero 120B: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
- DolphinBench: https://dolphinbench.ai/
