# Aravindhan11/Cieav-model

## Resumen
CIEAV-Model es un ajuste fino (post-entrenamiento) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por Aravindhan11 para integrarse en CIEAV, un agente personal de IA open source orientado a la soberanía del usuario. El modelo no busca ser un asistente generalista, sino un motor especializado en razonamiento sobre consecuencias y riesgos antes de que un agente ejecute acciones sobre un sistema informático.

El problema que aborda es el de la alineación de agentes: cuando un modelo se entrena con recompensas aprendidas (LLM-as-a-judge), tiende a sufrir especificación gaming (ley de Goodhart), premiando respuestas que parecen seguras pero que en realidad permiten comandos destructivos o fugas de credenciales. CIEAV-Model se entrena con GRPO y RLVR contra verificadores deterministas, con el objetivo de clasificar correctamente riesgos (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), bloquear inyecciones de prompt y sintetizar acciones de herramienta compatibles con contratos de rollback firmados.

Técnicamente es un transformer de 7.000 millones de parámetros con adaptadores LoRA de rango 16 sobre la base Qwen2.5-Coder, entrenado con Unsloth. El repositorio ocupa 0,1 GB, lo que sugiere que se publican principalmente los adaptadores PEFT y no los pesos completos. La información disponible sobre contexto, dataset y benchmarks es limitada y se detalla a continuación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptadores LoRA de rango 16 |
| Parámetros totales | 7.000 millones (modelo base); el adaptador LoRA no se especifica en número de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length=2048`) |
| Tipos de cuantización | 4 bits mediante `load_in_4bit=True` en Unsloth; no se detallan otros formatos |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el repo ocupa 0,1 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Framework de entrenamiento | Unsloth FastLanguageModel + GRPO + RLVR |
| Pipeline | text-generation |
| Inferencia remota | deshabilitada (`inference: false`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros, y se post-entrena mediante LoRA de rango 16 con Unsloth FastLanguageModel. El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con lotes de rollout de N=8 y recompensas verificables (RLVR) calculadas por un verificador determinista propio de CIEAV, en lugar de un modelo juez aprendido.

El verificador aplica comprobaciones AST sobre la sintaxis semántica de las acciones, detección de fugas de secretos y claves de API, una puerta de penalización dura para falsos negativos de riesgo crítico y una comprobación de reversibilidad y viabilidad de snapshots. Las penalizaciones son asimétricas: clasificar erróneamente un riesgo `CRITICAL` como `LOW`, filtrar credenciales o permitir un bypass de inyección de prompt otorga una puntuación de -1,0, mientras que la precisión de esquema y parámetros otorga +1,0. El autor afirma que el entrenamiento con Triton y Unsloth ahorra un 72 % de VRAM. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades
- Razonamiento sobre consecuencias y predicción de riesgo antes de la ejecución de herramientas, con clasificación en cuatro niveles (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Evaluación de reversibilidad de acciones y viabilidad de snapshots de estado.
- Síntesis estructurada de llamadas a herramientas bajo un protocolo de commit en dos fases (2PC) con contratos de rollback `/undo` firmados con Ed25519.
- Defensa anti-reward hacking y anti-specification gaming mediante verificación determinista.
- Resistencia a inyecciones de prompt y a ataques de ingeniería social del tipo "urgent CFO wire transfer".
- Protección de secretos y credenciales, con redacción de claves de API.
- Generación de texto conversacional y formato de chat con tokens especiales de Qwen (`<|im_start|>`, `<|im_end|>`).
- Capacidad de código heredada del modelo base Qwen2.5-Coder, aunque no se documenta su rendimiento tras el ajuste.
- No se documentan capacidades de visión, audio, tool calling genérico fuera del protocolo CIEAV ni modo thinking explícito.

## Casos de uso
- Agente personal con ejecución de comandos en local: el modelo evalúa el riesgo de una acción como borrar `./dist` antes de ejecutarla y decide si requiere confirmación o snapshot previo, gracias a su clasificación en cuatro niveles y a la comprobación de reversibilidad.
- Automatización de operaciones de sistema con rollback: integrado en el runtime CIEAV, genera acciones atómicas compatibles con contratos `/undo` firmados, lo que permite deshacer cambios de estado de forma verificable.
- Filtro de seguridad previo a herramientas en pipelines de agentes: actúa como capa de decisión que bloquea comandos destructivos (`rm -rf`) o transferencias financieras no autorizadas antes de que lleguen al ejecutor.
- Protección frente a inyecciones de prompt en asistentes corporativos: su entrenamiento con penalización dura ante bypass permite usarlo como guardián en flujos donde el texto de entrada puede contener instrucciones maliciosas.
- Auditoría de riesgo en asistentes de finanzas personales: evalúa límites acumulados de gasto y clasifica operaciones financieras según su impacto, evitando violaciones de topes configurados.
- Gestión de credenciales en agentes autónomos: redacta y bloquea la exposición de claves de API o claves privadas en las trayectorias generadas, adecuado para entornos donde el agente maneja secretos.
- Investigación en alineación y RLVR: sirve como caso de estudio reproducible de entrenamiento con recompensas verificables y penalizaciones asimétricas para quienes investigan reward hacking.

## Benchmarks y rendimiento
Los datos proceden de la model card del autor y no han sido verificados de forma independiente. Se evaluaron 1.250 escenarios adversariales (inyecciones de phishing, intentos de borrado de sistema de ficheros y violaciones de límites financieros acumulados).

| Métrica | Soft LLM-as-a-Judge | Jev 1.14 Classifier | CIEAV-Model |
|---|---|---|---|
| Tasa de falsos negativos críticos | 12,0 % | 9,0 % | 0,0 % |
| Defensa ante inyección adversarial | 61,8 % | 71,0 % | 100,0 % |
| Protección de secretos y credenciales | 82,4 % | 88,5 % | 100,0 % |
| Precisión de estado de reversibilidad | 74,2 % | 81,0 % | 99,4 % |
| Latencia P50 de inferencia local | ~450 ms (API en la nube) | ~4 ms | 1,84 ms (local en proceso) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La latencia de 1,84 ms corresponde presumiblemente a la etapa de verificación o clasificación, no a la generación completa de 7.000 millones de parámetros, y el autor no detalla la metodología.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Para un modelo de 7.000 millones de parámetros en FP16 se necesitan aproximadamente 14-16 GB; en cuantización de 4 bits, en torno a 4-6 GB, más el overhead de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 4090 (24 GB), A100 (40/80 GB) y H100; en 4 bits podría caber en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: previsiblemente sí en 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no está confirmado por el autor.
- Opciones de despliegue: Unsloth (`FastLanguageModel.from_pretrained`), Hugging Face Transformers con PEFT (`PeftModel`), y el runtime propio CIEAV (`cieav model set unsloth ...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la inferencia remota está deshabilitada en el Hub.
- Latencia y throughput: el autor reporta 1,84 ms P50 en inferencia local en proceso, sin especificar hardware ni longitud de secuencia; no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIEAV-Model | 7B (LoRA sobre Qwen2.5-Coder-7B) | no disponible | Seguridad de agentes y razonamiento de riesgo con RLVR | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens (modelo base estándar) | Generación de código y chat general | Apache 2.0 | Hugging Face, ampliamente usado |
| Jev 1.14 Classifier | no disponible | no disponible | Clasificación de seguridad (referencia del autor) | no disponible | no disponible |
| Soft LLM-as-a-Judge | variable | variable | Evaluación con recompensa aprendida (referencia del autor) | no disponible | no disponible |

La comparación con Jev 1.14 y con el juez blando proviene exclusivamente de la model card y no se ha contrastado con fuentes independientes. Frente a Qwen2.5-Coder-7B-Instruct, CIEAV-Model sacrifica generalidad por especialización en seguridad de agentes.

## Limitaciones y advertencias
- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un ajuste especializado: su rendimiento en tareas generales de código o conversación puede degradarse respecto al modelo base Qwen2.5-Coder-7B-Instruct.
- Los benchmarks publicados son autoinformados, con 1.250 escenarios y sin metodología detallada ni replicación independiente; las cifras de 0,0 % de falsos negativos y 100 % de bloqueo deben tomarse con cautela.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente al clasificar riesgos en dominios no cubiertos por el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (13 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la licencia y las condiciones del modelo base Qwen2.5-Coder-7B-Instruct.
- La seguridad real depende del verificador determinista de CIEAV; el modelo por sí solo no garantiza el bloqueo de acciones peligrosas.
- No se documentan sesgos específicos ni evaluación de robustez fuera de los escenarios adversariales descritos.
- La model card está truncada en la información proporcionada, por lo que pueden faltar secciones de uso, citación y limitaciones del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Aravindhan11/Cieav-model
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio del agente CIEAV: https://github.com/Aravindh-dev12/cieav-personal-agent
- Unsloth: https://github.com/unslothai/unsloth
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
