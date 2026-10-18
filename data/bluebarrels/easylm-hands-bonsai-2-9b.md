# Bluebarrels/easylm-hands-bonsai-2-9b

## Resumen

`easylm-hands-bonsai-2-9b` es un adaptador LoRA de PEFT publicado por el usuario Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-9B-gguf` (9.000 millones de parámetros nominales, ~2 GB de pesos en formato GGUF de 1,58 bits). El adaptador está especializado en la ejecución fiable de cadenas de herramientas: invocación de servidores MCP, recuperación sobre una pila documental propia y verificación de integridad denominada ZCABS. Su huella es mínima: 56 tensores y 417.778 elementos FP16 no nulos, es decir, unos 5,1 MB sobre un modelo base de 2 GB.

El modelo se integra en el ecosistema EasyLM/Hydra del autor, que ofrece una escalera de variantes (2B, 4B, 9B y 27B) pensada para ejecutarse en WebGPU del lado del cliente, en CLI/TUI de escritorio o en un servidor local en el puerto 7777. La ventana de contexto declarada es de 262.144 tokens, lo que sitúa al adaptador en el terreno de los agentes que necesitan mantener trazas largas de herramientas, planes y resultados intermedios.

Su relevancia es acotada pero concreta: demuestra un patrón de bajo coste (un adaptador de 5 MB) para convertir un modelo ternario de 2 GB en un ejecutor de herramientas, algo atractivo para despliegues soberanos en hardware modesto. Ahora bien, el entrenamiento se realizó sobre un corpus declarado de solo 133 turnos y el repositorio no tiene descargas ni valoraciones, por lo que cualquier afirmación de rendimiento debe tratarse como no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only ternario; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | 9.000 millones (nominal, modelo base); adaptador LoRA con 417.778 elementos FP16 no nulos (~5,1 MB) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262.144 tokens (según la model card) |
| Tipos de cuantización | Base en ternario 1,58 bits (GGUF, ~2 GB); base alternativo MLC `q4f16_1`; adaptador en FP16 (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | `adapter_model.safetensors` (adaptador PEFT); GGUF (base `prism-ml/Ternary-Bonsai-2-9B-gguf`); MLC (base alternativo `mlc-ai/Qwen3.5-9B-q4f16_1-MLC`) |
| Rank / alpha / dropout del LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Dataset de entrenamiento | `Bluebarrels/easylm-training-corpus` (`adapter_hands_chatml.jsonl`, 133 turnos) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atención (`q`, `k`, `v`, `o`) y de la MLP (`gate`, `up`, `down`) de un transformer decoder-only cuantizado en ternario. El modelo base declarado es `prism-ml/Ternary-Bonsai-2-9B-gguf`, con pesos de aproximadamente 2 GB; la model card menciona además un base alternativo para WebGPU/MLC (`mlc-ai/Qwen3.5-9B-q4f16_1-MLC`), lo que introduce ambigüedad sobre la correspondencia exacta entre pesos y adaptador. La verificación del SafeTensors reporta 56 tensores y 842.872 bytes de datos FP16.

El entrenamiento se realizó sobre `Bluebarrels/easylm-training-corpus`, del que solo se documenta explícitamente el fichero `adapter_hands_chatml.jsonl` con 133 turnos. La model card describe el corpus completo —92 «Sovereign Academic Stacks», 369 tablas de hechos con 4.634 filas, 151 «Council of Kami Books», un grafo EMap de 46.025 nodos y 19.842 aristas, el «Why-Ledger» de Muse y el currículo Hydra v1.2.2—, pero no se especifica cuántos de esos materiales se usaron para este adaptador concreto, ni el número total de tokens, la composición efectiva del dataset o si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; el contexto de 262.144 tokens se declara sin detallar la técnica que lo habilita.

## Capacidades

- Ejecución de cadenas de herramientas de varios pasos con vocación de alta fiabilidad (especialidad declarada del adaptador, sufijo `hands`).
- Invocación de servidores MCP (Model Context Protocol) como parte del bucle agéntico.
- Integración con el CLI, TUI y escritorio de Hydra: comandos `hydra`, `hydra agent`, `hydra swarm`, `hydra serve` (puerto 7777) y cápsulas `@[hydra]`.
- Modos de agente declarados en `hydra-tui-rs` y `hydra-desktop-rs`: `chat`, `agent`, `swarm`, `computer`, `terminal`.
- Gestión de permisos en el bucle agéntico: `manual`, `accept_edits`, `plan`, `bypass`.
- Modos de contexto: `recall`, `compact`, `sliding`.
- Recuperación sobre una pila documental propia («sovereign stack retrieval») y verificación de integridad ZCABS, según la model card.
- Razonamiento STEM y derivaciones profundas, además de coaching socrático multi-turno, herencia del corpus declarado.
- Carga del adaptador en el runtime WebGPU de EasyLM mediante `parseSafeTensorsHeader` y `applyLoRAWeights`.
- Generación de texto estándar (`text-generation`).
- Capacidades de visión y audio: no disponibles para este adaptador (la model card atribuye la torre de visión a la variante de 27B, no a la de 9B).
- Soporte multilingüe: no disponible (no se declaran idiomas).

## Casos de uso

- Orquestación de agentes con MCP: el adaptador está entrenado para emitir llamadas a servidores MCP dentro de un bucle multi-paso; se usaría como capa de decisión de herramientas en un agente local que descubra y ejecute herramientas de forma secuencial.
- Automatización de tareas de repositorio en local: con los modos de permiso `plan` y `accept_edits` de Hydra, el modelo puede inspeccionar el estado de un repositorio y proponer o aplicar cambios con aprobación explícita del usuario.
- Despliegue en navegador y dispositivos ligeros: al ocupar el base ~2 GB y el adaptador 5,1 MB, es viable cargarlo en WebGPU sobre portátiles y equipos sin GPU dedicada, útil para asistentes de escritorio con ejecución en el cliente.
- Verificación determinista en pipelines: la model card propone su uso para «deterministic verification gates», es decir, pasos de comprobación encadenados donde el modelo selecciona y ejecuta comprobaciones y reporta resultados estructurados.
- Asistencia técnica con contexto largo: con 262.144 tokens declarados, puede mantener conversaciones multi-turno con trazas de herramientas, logs y documentación extensa en la misma ventana.
- Tutoría y explicación técnica: el corpus incluye material académico y un andamiaje socrático (modos de diagnóstico C1–C6, máquina de estados S0–S6), aplicable a un asistente de estudio con preguntas de seguimiento.
- Prototipado de investigación sobre adaptadores ternarios: por su tamaño (5,1 MB) y su licencia AGPL, sirve como base reproducible para estudiar la especialización de modelos de 1,58 bits en uso de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, BFCL ni de precisión en invocación de herramientas, y el repositorio no presenta evaluaciones independientes.

## Requisitos de hardware

- Pesos del modelo base: aproximadamente 2 GB en ternario 1,58 bits (GGUF), según el autor.
- Adaptador LoRA: ~5,1 MB en safetensors FP16; se carga por encima del base sin reescritura de pesos.
- VRAM estimada para inferencia: los pesos caben holgadamente en 4-6 GB; el consumo real vendrá dominado por la caché KV, cuyo coste exacto no es calculable con los datos disponibles, pero a 262.144 tokens de contexto puede superar con creces el tamaño de los pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) para contextos moderados; para exprimir la ventana completa se requiere una GPU de 24 GB o superior (RTX 4090, A100 40/80 GB, H100).
- Cabe en GPU consumer: sí, en el rango de 8 GB para contextos cortos y medios; no confirmado para el contexto máximo.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) al ser base GGUF; runtime WebGPU de EasyLM; MLC con el base `q4f16_1`; CLI/TUI/escritorio de Hydra con `hydra serve` en el puerto 7777. Compatibilidad con vLLM o TGI no está confirmada para pesos ternarios GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-hands-bonsai-2-9b` (este) | 9B (base) + LoRA de 5,1 MB | 262.144 | Uso de herramientas, MCP, agente Hydra | AGPL-3.0 | Público, 0 descargas |
| `Bluebarrels/easylm-bonsai-2-2b` | 2B | No disponible | Modelo universal por defecto para EasyLM, carga WebGPU en móvil | No disponible en la información | Público (según la model card) |
| `Bluebarrels/easylm-bonsai-2-4b` | 4B | No disponible | Coaching socrático multi-turno, síntesis de ensayos, mentoría de código | No disponible en la información | Público (según la model card) |
| `Bluebarrels/easylm-bonsai-2-27b` | 27B | 262.144 | Referencia «soberana» de estación de trabajo, con torre de visión | No disponible en la información | Público (según la model card) |
| `prism-ml/Ternary-Bonsai-2-9B-gguf` (base) | 9B | No disponible | Modelo base ternario sin especialización | No disponible en la información | Público |

No se dispone de comparaciones con modelos de uso de herramientas de otros autores (por ejemplo, variantes de Qwen o Llama ajustadas para function calling), ya que la búsqueda web no aportó información técnica relevante ni resultados de evaluación.

## Limitaciones y advertencias

- Corpus de entrenamiento mínimo: el fichero documentado contiene 133 turnos, insuficiente para garantizar generalización en cadenas de herramientas largas o dominios no cubiertos.
- Volumen de parámetros entrenados muy reducido: 417.778 elementos FP16 (~0,83 MB de datos) limitan la magnitud del ajuste y favorecen el sobreajuste a los formatos concretos del corpus.
- Ambigüedad sobre el modelo base: la model card cita simultáneamente un base GGUF ternario y un base MLC `Qwen3.5-9B-q4f16_1-MLC`; no se especifica sobre cuál se entrenó el adaptador ni si es compatible con ambos.
- Afirmaciones no verificables: términos como «soberano», «verificación de integridad ZCABS» o «alta fiabilidad» no vienen acompañados de especificaciones, código ni métricas.
- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; en tareas de invocación de herramientas, una llamada mal formada o un parámetro inventado puede propagarse silenciosamente en el bucle agéntico.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre calidad en castellano.
- Comportamiento con contexto largo no demostrado: los 262.144 tokens son una cifra declarada; no hay pruebas de recuperación efectiva en posiciones intermedias ni de degradación con la distancia.
- Licencia AGPL-3.0: es copyleft con cláusula de red; ofrecer el modelo o un servicio derivado por red puede obligar a liberar el código fuente correspondiente. Revisar compatibilidad antes de integrarlo en productos propietarios.
- Dependencia de un ecosistema propietario del autor: las instrucciones de uso remiten a Hydra, EasyLM y módulos TypeScript propios (`./services/lora_loader`) que no forman parte del repositorio del modelo.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-10-17): conviene verificar la vigencia y posibles revisiones del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Bluebarrels/easylm-hands-bonsai-2-9b
- Modelo base ternario GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Base alternativo para MLC/WebGPU: https://huggingface.co/mlc-ai/Qwen3.5-9B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo, su autor o el ecosistema Hydra/EasyLM; no se han encontrado papers, blogs, repositorios de código ni demos adicionales que enlazar.
