# krush420/llama3-hermes3-8b-sre-lora

## Resumen

`krush420/llama3-hermes3-8b-sre-lora` es un adaptador LoRA de tipo PEFT sobre el modelo base `NousResearch/Hermes-3-Llama-3.1-8B`, desarrollado por el usuario krush420 dentro del ecosistema KruschStack. El adaptador está orientado a tareas de Site Reliability Engineering (SRE), auditoría de código con anclaje AST, síntesis de código "Lego-First" y tool-calling agéntico multi-turno. Se entrenó mediante un pipeline de dos etapas: SFT en BF16 seguido de calibración con DPO anclado por divergencia KL, usando el `trl.DPOTrainer`.

El adaptador entrena 41,94 millones de parámetros sobre las siete proyecciones lineales de Llama-3.1 (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con `r=16` y `lora_alpha=32`. El modelo base aporta la arquitectura transformer densa de 8B parámetros y la ventana de contexto de 128K tokens de Llama 3.1, mientras que el LoRA añade la especialización en razonamiento operativo y ejecución de herramientas.

Su relevancia actual radica en que el autor declara mejoras sustanciales en el benchmark DolphinBench (600 tareas, 1,5M tokens, juez `gpt-5.6-sol`): un 18,33% de pass rate frente al 1,17% del modelo base stock, lo que representa un factor de 15,7x. Además, el autor incluye un `Modelfile` para Ollama que corrige dos bugs conocidos de la plantilla Go de `hermes3`, relacionados con la pérdida del contexto de sistema cuando se pasan definiciones de herramientas. El repositorio tiene 179 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Llama 3.1 (modelo base `NousResearch/Hermes-3-Llama-3.1-8B`) |
| Parametros totales | 41.943.040 parámetros entrenables del adaptador (el modelo base subyacente es de 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; heredada del base Llama 3.1 (128K tokens, según el modelo base) |
| Tipos de cuantizacion | GGUF disponible en el repo; el autor reporta funcionamiento en `Q4_0` (~4,7 GB de VRAM) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | llama3.1 (Meta Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |
| Rango LoRA / alpha | r=16 / lora_alpha=32 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Libreria | peft, transformers, trl |
| Tamano del repo | 0,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `NousResearch/Hermes-3-Llama-3.1-8B`, un transformer denso decoder-only de la familia Llama 3.1 con 8B parámetros y ventana de contexto de 128K tokens. El LoRA entrena las siete proyecciones lineales de cada bloque con rango 16 y alpha 32, sumando 41,94M de parámetros entrenables en BF16. El autor describe el proceso como "2-Stage SFT + KL-Anchored trl.DPOTrainer calibration": una primera fase de SFT supervisado en BF16 seguida de una fase de DPO con anclaje por divergencia KL para evitar el colapso de la distribución respecto al modelo base.

Los datos de entrenamiento provienen del dataset `krush420/sovereign-code-audit-sft`, que el autor describe como más de 18.131 registros SFT y DPO "zero-leak", orientados a auditoría de código con anclaje AST, síntesis Lego-First y tool-calling agéntico. El pipeline se ejecuta a través de KruschStack y del harness Jean SRE, que el autor presenta como auditor autónomo 24/7. Entre las innovaciones destacadas está la inclusión de un `Modelfile` para Ollama que corrige dos bugs de la plantilla Go de `hermes3`: la pérdida del bloque `.System` cuando se pasan `.Tools`, y un problema en el parser AST `.ToolCalls`. No se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno con memoria a largo plazo simulada, según las tareas de DolphinBench.
- Tool-calling y function calling agéntico, con soporte para ejecución simulada de aplicaciones y herramientas MCP.
- Razonamiento agéntico multi-paso orientado a tareas de SRE y operaciones.
- Auditoría de código con anclaje AST (análisis estructural del código fuente).
- Síntesis de código bajo el paradigma "Lego-First" descrito por el autor.
- Integración con el stack de 39 herramientas y 7 pilares de KruschStack vía MCP.
- Capacidades multilingües: no disponibles (no declaradas en la model card).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Auditoría automatizada de código en pipelines CI/CD: el adaptador está entrenado específicamente en análisis con anclaje AST, por lo que puede integrarse en revisiones automáticas de pull requests para detectar problemas estructurales y de seguridad antes del merge.
- Agente SRE de guardia: puede gestionar conversaciones multi-turno con contexto largo (heredado de Llama 3.1) para diagnosticar incidencias, consultar herramientas del stack MCP y proponer remediaciones, con un coste de inferencia declarado de 0,00 USD en el harness del autor.
- Ejecución de herramientas en aplicaciones simuladas: las tareas de DolphinBench evalúan la capacidad de invocar herramientas de apps simuladas con memoria a largo plazo, lo que encaja en asistentes de operaciones que deben recordar estado entre sesiones.
- Asistente de operaciones en edge: con ~4,7 GB de VRAM en Q4_0, puede desplegarse en hardware modesto (portátiles, estaciones de trabajo con GPU consumer) para tareas de soporte técnico y diagnóstico local sin depender de la nube.
- Referee o evaluador entre modelos: el autor lo describe como "Cross-Family Referee LoRA", lo que sugiere su uso para comparar o arbitrar salidas de otros modelos en pipelines de evaluación.
- Automatización de soporte técnico N1/N2: con tool-calling y contexto largo puede resolver consultas multi-turno, consultar bases de conocimiento vía herramientas MCP y escalar casos complejos.
- Generación de informes de auditoría: a partir de logs y trazas, el modelo puede sintetizar resúmenes estructurados de hallazgos, aprovechando su entrenamiento en el dataset de auditoría de código.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark / metrica | Resultado | Contexto |
|---|---|---|
| DolphinBench pass rate (juez oficial `gpt-5.6-sol`) | 18,33% (110/600) | 600 tareas, 3 personas, 1,5M tokens; 15,7x sobre el 8B stock (1,17%, 7/600) |
| DolphinBench, persona Morgan | 26,0% (52/200) | Supera a Hermes + MiniMax M3 + Supermemory (45/200) |
| Comprobaciones mecánicas deterministas de herramientas | 64,2% (841/1.310) | Verificación determinista, no por juez LLM |
| Gates de causalidad puramente deterministas | 5/5 | Coste de inferencia declarado: 0,00 USD |
| Stage-1 SFT token accuracy (BF16) | 89,64% | Sobre `krush420/sovereign-code-audit-sft` |
| Stage-2 DPO preference accuracy (KL-anchored) | 100% | Sobre el mismo dataset |

## Requisitos de hardware

- VRAM estimada: ~4,7 GB en cuantización Q4_0 según el autor (pesos del modelo base 8B cuantizados más el adaptador).
- En BF16 el modelo base 8B requiere aproximadamente 16 GB de VRAM (estimación estándar para 8B en precisión completa, no indicada explícitamente en la ficha).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: sí, en Q4_0 con ~4,7 GB; también en configuraciones de 8 GB de VRAM con cuantizaciones más agresivas.
- Opciones de despliegue: Ollama (el autor incluye un `Modelfile` con correcciones de plantilla), llama.cpp (formato GGUF disponible), vLLM y TGI (para el adaptador PEFT sobre el base en transformers), además de `peft` + `transformers` directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `krush420/llama3-hermes3-8b-sre-lora` | 41,94M adaptador sobre 8B | 128K (heredado del base) | llama3.1 | Especializado en SRE, auditoría de código y tool-calling; 18,33% en DolphinBench |
| `NousResearch/Hermes-3-Llama-3.1-8B` (base) | 8B | 128K | llama3.1 | Modelo generalista; 1,17% en DolphinBench según el autor |
| `krush420/qwen3-coder-30b-sre-lora` | QLoRA sobre 30B MoE (3B activos) | no disponible | no disponible | Companion del mismo autor, tier L2 local; 43,00% en DolphinBench con Grounded v0.3 |
| `krush420/gemma4-31b-sre-lora` | QLoRA sobre 31B denso | no disponible | no disponible | Companion del mismo autor, tier de razonamiento; 57,33% en DolphinBench |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index). El juez utilizado (`gpt-5.6-sol`) y el harness no son estándar en la comunidad.
- El pass rate absoluto en DolphinBench es bajo (18,33%), por lo que el modelo sigue fallando la mayoría de tareas del benchmark pese a la mejora relativa.
- Es un adaptador LoRA: requiere cargar el modelo base `NousResearch/Hermes-3-Llama-3.1-8B` para funcionar, lo que implica aceptar la licencia Llama 3.1 de Meta.
- Licencia llama3.1: uso comercial permitido bajo los términos de la Meta Llama 3.1 Community License, con restricciones (por ejemplo, la cláusula de 700 millones de usuarios mensuales y las políticas de uso aceptable de Meta).
- No se declaran idiomas soportados; el entrenamiento parece centrado en inglés técnico (SRE, código), por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en tareas de auditoría de código donde una falsa detección o un falso negativo puede tener consecuencias operativas.
- El ecosistema KruschStack y el harness Jean SRE son proyectos del propio autor; la reproducibilidad de los resultados depende de ese stack.
- El repositorio tiene 179 descargas y 0 likes, lo que indica una adopción muy limitada y escasa validación por parte de la comunidad.
- No hay información sobre sesgos conocidos ni sobre evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/llama3-hermes3-8b-sre-lora
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Logs de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- Space de benchmarks: https://huggingface.co/spaces/krush420/sovereign-router-arena
- KruschStack (repo): https://github.com/kruschdev/krusch-stack
- Jean SRE (repo): https://github.com/kruschdev/Jean-SRE-by-kruschdev
- DolphinBench: https://dolphinbench.ai/
- Companion 31B: https://huggingface.co/krush420/gemma4-31b-sre-lora
- Companion 30B: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Companion 120B: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
