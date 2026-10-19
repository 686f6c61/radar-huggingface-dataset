# jmparejaz/DeepResearch-RL-Trainer

## Resumen

`jmparejaz/DeepResearch-RL-Trainer` es un repositorio de HuggingFace que **no contiene pesos de un modelo**, sino un servicio de agente de deep research contenedorizado (`tearsheet-agent-service`) junto con una suite de entrenamiento y evaluación de Reinforcement Learning. El servicio se construye sobre el runtime del agente de código `pi` (`@earendil-works/pi-coding-agent@1.0.4`) y genera informes de empresa ("tearsheets") de 10 secciones con citas inline `[N]` ancladas a un registro de fuentes, auditoría determinista de completitud de secciones y hechos, y guardas de política de ejecución de herramientas. Las trayectorias y los tokens de razonamiento se exportan vía OpenTelemetry GenAI a W&B Weave (proyecto `forge-ai-dev/Tearsheet-Pi-Agent`).

El objetivo declarado es servir de base instrumental para RL (GRPO con Prime Intellect `verifiers`) sobre modelos de razonamiento compactos de pesos abiertos, usando trayectorias de un modelo frontier (`xai/grok-4.7`) y las auditorías deterministas del `section_parser` como rollouts de referencia, señales de recompensa y banco de evaluación. El modelo entrenado de referencia que se sirve vía vLLM es `LiquidAI/LFM2.5-8B-A1B`, configurado con `contextWindow: 128000`.

Es relevante ahora por su enfoque de "recompensa verificable": 33 modos de fallo codificados (`EA03-*`), 15 verificadores deterministas en Python y 18 especificaciones de juez NLI, con puerta anti-hacking multiplicativa (MiMo-V2.6 Eq. 2), redistribución de ventaja por grupo (GAR) y penalización de longitud relativa al grupo. El repositorio tiene 0,0 GB, 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica benchmarks de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo de pesos: servicio contenedorizado de agente de deep research (runtime PI `@earendil-works/pi-coding-agent@1.0.4`) + suite de entrenamiento RL/GRPO compatible con Prime Intellect `verifiers` |
| Parámetros totales | No disponible: el repositorio no publica pesos (tamaño del repo: 0,0 GB) |
| Parámetros activos | No aplica (no contiene pesos; el card menciona un backend `LiquidAI/LFM2.5-8B-A1B` con nomenclatura MoE, sin especificaciones verificables) |
| Longitud de contexto | 128 000 tokens para el backend `hf-vllm` (`contextWindow: 128000` en `models.json`); no aplica al harness |
| Tipos de cuantización | FP8 con caché KV en FP8 en el despliegue vLLM del modelo servido (`--quantization fp8 --kv-cache-dtype fp8`); no se documentan otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No contiene pesos: se distribuye como imagen Docker en AWS ECR y como bundle de HF Space (`Dockerfile`, `rl.toml`, `start_a100x2_grpo.sh`) |
| Backends de modelo configurables | `perplexity-agent` (API `openai-responses`, modelo por defecto `xai/grok-4.7`, `reasoning: true`) y `hf-vllm` (API `openai-completions`, `LiquidAI/LFM2.5-8B-A1B`, contexto 128 000, `reasoning: true`) |
| Versión de motor de inferencia | `vllm/vllm-openai:v0.29.0`, con `--reasoning-parser qwen3` y `--tool-call-parser lfm2` |
| Descargas / likes | 0 / 0 |
| Creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

El sistema se compone de tres capas. La primera es el runtime del agente: `agent_runtime/` define el contrato de salida de 10 secciones (`AGENTS.md`), las reglas de citación inline `[N]`, y los bloques YAML estructurados `facts` y `retractions`; incluye `required_facts.yaml` con el inventario de hechos obligatorios por sección (con listas en blanco intencionadas, por ejemplo celdas de valoración en la tabla de comparables) y una skill de meta-harness (`skills/section-completeness/SKILL.md`) con reglas anti-gaming. Las herramientas se registran mediante extensiones TypeScript: `websearch_fetch.ts` añade `websearch` (API `/search` de Perplexity) y `fetch`, respaldadas por clientes Python y el `SourceRegistry`; `tool_call_guard.ts` es un hook previo a la ejecución que aplica una `ToolPolicy` con lista blanca `{read, websearch, fetch}` y rutas de configuración/registro protegidas. La segunda capa es el servicio: CLI `tearsheet-research`, cliente RPC JSONL asíncrono sobre `pi --mode rpc`, generador `run_research_stream()`, registro persistente de citas (`[N]` ↔ URL, título, extracto recuperado, estado), API FastAPI con HTTP/SSE, y un exportador de trazas GenAI a W&B Weave. La tercera capa es la suite RL.

El entrenamiento es en dos etapas sobre el modelo servido. La etapa 1 (`train_sft_warmup.py`) es un calentamiento de 100 pasos de SFT / Prefix-OPD con enmascaramiento estricto de pérdida solo en turnos del asistente (`labels = -100` en `system`, `user` y `tool`) y puertas de routing MoE congeladas; el dataset se construye con `weave_dataset.py`, que cosecha trayectorias del profesor desde `forge-ai-dev/Tearsheet-Pi-Agent` y aplica Teacher-Prefix On-Policy Distillation (MiMo-V2.6 §5.6). La etapa 2 (`train_grpo.py`) es GRPO con reparto Split-GPU en `A100x2`, `freeze_moe_router` (MiMo-V2.6 §5.4, Fig. 11) y agregación de pérdida por tokens con `prompt_mean` (MiMo-V2.6 §5.2). El entorno (`env.py`) es un `TearsheetToolEnv` multi-turno con estado, `SourceRegistry` aislado por rollout, `HybridReplayCache` y cumplimiento del contrato de prompt `full_tearsheet` (Decisión D3). El muestreo usa `DynamicDiscrepancySampler` con umbral `max R − min R ≥ 0,05` (Decisión D1) y un `JudgeClient` multi-proveedor: primario `perplexity`/`xai/grok-4.7`, respaldo `mistral`/`mistral-large-latest` (Decisión D2).

La rúbrica (`rubric.py`) define 33 modos de fallo `EA03-*`: 15 verificadores deterministas Tier-A en Python y 18 especificaciones de juez NLI Tier-B de mundo cerrado, más una puerta anti-hacking multiplicativa (MiMo-V2.6 Eq. 2), redistribución de ventaja por grupo (GAR, Eq. 3) y penalización de longitud relativa al grupo (Eq. 4). `census_meta_eval.py` es un runner de meta-verificación offline que evalúa esos 33 modos contra un censo histórico de 555 afirmaciones (146 `not_supported` y 409 `supported` como controles).

## Capacidades

- Generación de tearsheets de empresa en 10 secciones con contrato de salida fijo y citas inline `[N]` ancladas a un registro persistente de fuentes.
- Búsqueda web y recuperación de páginas como herramientas del agente (`websearch` sobre la API `/search` de Perplexity y `fetch`), con registro de extractos recuperados y estado por fuente.
- Auditoría determinista de completitud: `section_parser.py` verifica las 10 secciones y la identidad de hechos del inventario `required_facts.yaml`; emite bloques `facts` y `retractions` en YAML.
- Guardas de política de herramientas: lista blanca `{read, websearch, fetch}` y protección de rutas de configuración y registro, aplicadas antes de la ejecución.
- Observabilidad de agentes: exportación de trazas GenAI (OpenTelemetry) y de tokens de razonamiento a W&B Weave.
- Soporte de tool calling en el servido: parser de tool calls `lfm2` y parser de razonamiento `qwen3` en vLLM.
- Modo de razonamiento explícito en ambos backends (`reasoning: true` en `perplexity-agent` y `hf-vllm`).
- Capacidades de entrenamiento: SFT con enmascaramiento solo-asistente, destilación on-policy con prefijos de profesor, GRPO con congelación de router MoE y agregación `prompt_mean`.
- Evaluación con rúbrica de 33 modos de fallo y meta-evaluación sobre un censo de 555 afirmaciones.
- Interfaz HTTP/SSE (FastAPI) además de CLI, apta para integración en servicios.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Generación de tearsheets de empresas con trazabilidad**: el agente produce el informe de 10 secciones y cada afirmación lleva una cita `[N]` resuelta contra el `SourceRegistry` (URL, título, extracto y estado), lo que permite revisión editorial punto por punto sin reconstruir la búsqueda.
- **Auditoría automática de informes financieros**: `section_parser.py` comprueba de forma determinista que están las 10 secciones y todos los hechos obligatorios de `required_facts.yaml`, de modo que un pipeline de publicación puede rechazar borradores incompletos sin intervención humana.
- **Entrenamiento RL de modelos compactos de razonamiento**: la suite `rl/` proporciona recompensas verificables (15 verificadores Tier-A), juez NLI para los otros 18 modos y GRPO sobre `A100x2`, lo que permite entrenar un modelo de 8B con señales auditables en lugar de preferencias difusas.
- **Destilación de trayectorias de un modelo frontier**: `weave_dataset.py` cosecha trayectorias del profesor desde W&B Weave y construye el dataset de Teacher-Prefix OPD para la etapa de calentamiento de 100 pasos.
- **Meta-evaluación de rúbricas antes de usarlas como recompensa**: `census_meta_eval.py` mide los 33 modos de fallo contra 555 afirmaciones históricas (146 negativas y 409 de control) para detectar falsos positivos del juez antes de congelar la rúbrica.
- **Despliegue de un endpoint compatible con OpenAI para el agente**: `deploy_hf_lfm25_endpoint.sh` levanta `LiquidAI/LFM2.5-8B-A1B` en Hugging Face Inference Endpoints con `vllm/vllm-openai:v0.29.0`, cuantización FP8 y parsers `qwen3`/`lfm2` sobre `nvidia-l40s`, y el runtime apunta a él mediante el proveedor `hf-vllm`.
- **Contención de acciones de un agente en producción**: `tool_call_guard.ts` permite limitar el agente a lectura, búsqueda y fetch, bloqueando escrituras y el acceso a rutas de configuración o al registro de fuentes.
- **Monitorización de coste y razonamiento por ejecución**: las trazas GenAI y los tokens de razonamiento exportados a Weave permiten auditar por qué el agente citó una fuente y cuánto reasoning consumió cada rollout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card).

Los únicos datos cuantitativos de evaluación disponibles son los de la propia rúbrica y su meta-evaluación, que no son benchmarks de un modelo:

| Métrica de la rúbrica | Valor |
|---|---|
| Modos de fallo definidos | 33 (`EA03-*`) |
| Verificadores deterministas Tier-A (Python) | 15 |
| Especificaciones de juez NLI Tier-B (mundo cerrado) | 18 |
| Afirmaciones del censo histórico de meta-evaluación | 555 |
| Afirmaciones `not_supported` en el censo | 146 |
| Afirmaciones `supported` (controles) en el censo | 409 |
| Umbral del `DynamicDiscrepancySampler` | `max R − min R ≥ 0,05` |
| Pasos de la etapa 1 (SFT / Prefix-OPD) | 100 |

## Requisitos de hardware

- **Entrenamiento (objetivo del bundle HF Space)**: `a100x2`, es decir 2× NVIDIA A100 de 80 GB = 160 GB de VRAM, con GPU 0 dedicada a generación de rollouts con vLLM y GPU 1 dedicada a SFT/GRPO. El arranque se automatiza con `spaces/DeepResearch-RL-Trainer/start_a100x2_grpo.sh`.
- **Inferencia del modelo servido**: `LiquidAI/LFM2.5-8B-A1B` desplegado en `nvidia-l40s` (48 GB) con FP8 en pesos y en caché KV; el script de despliegue fija la instancia, por lo que no se documentan otras tallas.
- **GPU de consumo**: no hay datos que indiquen que el pipeline de entrenamiento o el endpoint de referencia quepan en GPU de consumo; el card solo documenta A100 80 GB y L40S 48 GB.
- **Despliegue**: contenedor Docker (imagen en ECR `526489132647.dkr.ecr.us-west-2.amazonaws.com/tearsheet-agent-service-poc:latest`, digest `sha256:d71f274bd32ca71615828b7754febea01da00ddaf69c931c2cfd22521e01a659`), HF Space con Docker, HF Inference Endpoints con `vllm/vllm-openai:v0.29.0`, y cualquier servidor compatible con OpenAI para el proveedor `hf-vllm`.
- **Construcción sin Docker local**: `scripts/build_and_push_ecr.py` empaqueta el repositorio y compila en AWS CodeBuild con `buildspec.yml` (incluye smoke tests del contenedor) y publica `:latest` en ECR.
- **Latencia y throughput**: no disponibles. No se publican métricas de tokens por segundo, TTFT ni coste por ejecución.

## Comparativa con modelos similares

No hay datos suficientes para comparar este repositorio con otros modelos o harnesses de la misma categoría: no publica pesos, no declara licencia ni benchmarks. La única comparación posible con la información disponible es entre los dos backends que el propio `models.json` configura:

| Aspecto | `perplexity-agent` | `hf-vllm` |
|---|---|---|
| Tipo de API | `openai-responses` | `openai-completions` |
| Modelo por defecto | `xai/grok-4.7` | `LiquidAI/LFM2.5-8B-A1B` |
| Ventana de contexto declarada | No disponible | 128 000 tokens |
| Razonamiento | `reasoning: true` | `reasoning: true` |
| Pesos abiertos | No disponible | Sí, según el identificador del modelo referenciado (no verificable con la información proporcionada) |
| Despliegue | Servicio externo de Perplexity | vLLM propio, FP8, L40S 48 GB o A100 80 GB |
| Uso en el sistema | Juez primario (`JudgeClient`) y modelo frontier de referencia | Modelo objetivo de entrenamiento y de servicio del agente |

## Limitaciones y advertencias

- **No es un modelo descargable**: el repositorio pesa 0,0 GB y no publica safetensors, GGUF ni ningún artefacto de pesos; no puede evaluarse como modelo de lenguaje de forma directa.
- **Licencia no declarada**: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación; es un bloqueo para producción.
- **Sin validación comunitària**: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-19), sin historial de versiones ni de incidencias.
- **Dependencia de servicios externos de pago**: la búsqueda depende de la API `/search` de Perplexity y el juez primario de `xai/grok-4.7`, con `mistral-large-latest` como respaldo; caídas, cambios de precio o de cuota afectan directamente a la recompensa y al servicio.
- **Identificadores de modelo no verificables**: el card referencia `xai/grok-4.7`, `LiquidAI/LFM2.5-8B-A1B` y un documento "MiMo-V2.6"; sus especificaciones no se pueden confirmar con la información proporcionada.
- **Riesgo de alucinación en citas**: el `SourceRegistry` y la auditoría de completitud verifican que exista una fuente registrada y que la sección esté completa, no que el extracto respalde semánticamente la afirmación; solo 18 de los 33 modos de fallo se cubren con un juez NLI, que es un modelo y por tanto falible.
- **Riesgo de gaming de la recompensa**: la rúbrica incluye explícitamente una puerta anti-hacking y reglas anti-gaming, lo que indica que el propio diseño reconoce superficie de ataque; el umbral de discrepancia `≥ 0,05` puede descartar grupos poco informativos y sesgar el muestreo.
- **Idiomas no declarados**: no hay información sobre cobertura multilingüe del agente ni de los modelos servidos; el contrato de salida y las plantillas están en inglés.
- **Exposición de infraestructura en la documentación**: el card publica ID de cuenta AWS (`526489132647`), URI de ECR, región y digest de imagen; conviene revisar la política de secretos antes de reutilizar el repositorio.
- **Trazas enviadas a terceros**: la exportación de trayectorias y tokens de razonamiento a W&B Weave implica enviar contenido de research y prompts a un servicio externo; requiere evaluación de privacidad y de retención de datos.
- **Requisitos de hardware elevados para entrenar**: el pipeline GRPO documentado exige 2× A100 80 GB; no hay datos de rendimiento que permitan estimar tiempos por etapa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jmparejaz/DeepResearch-RL-Trainer
- Runtime del agente PI: https://github.com/earendil-works/pi
- Proyecto W&B Weave de trayectorias del profesor: `forge-ai-dev/Tearsheet-Pi-Agent` (identificador citado en el card; no se proporciona URL)
- Modelo servido de referencia: `LiquidAI/LFM2.5-8B-A1B` (identificador citado; no se proporciona URL)
- Imagen Docker en AWS ECR: `526489132647.dkr.ecr.us-west-2.amazonaws.com/tearsheet-agent-service-poc:latest` (región `us-west-2`, digest `sha256:d71f274bd32ca71615828b7754febea01da00ddaf69c931c2cfd22521e01a659`)
- Epic de origen: `FND-516` (identificador interno citado; sin URL)
- No se han encontrado en la información disponible otros enlaces a papers, blogs, demos o repositorios.
