# hwihwalab/CHOCO-BRAIN-0.8B-v0.1

## Resumen

CHOCO-BRAIN-0.8B-v0.1 es un modelo de lenguaje compacto desarrollado por Hwihwa Lab (hwihwalab) y publicado en HuggingFace. Se presenta como un "motor de decisiones" (decision engine) para la automatización de negocios de solopreneurs, inspirado en la función del córtex prefrontal humano: priorizar, filtrar riesgos y comprometerse con una acción. No está diseñado como un chatbot conversacional general, sino como un clasificador y enrutador determinista que recibe una solicitud de trabajo y emite una decisión operativa estructurada.

El modelo se construye mediante LoRA Supervised Fine-Tuning (rango 8, alpha 16) sobre la base Qwen/Qwen3.5-0.8B, con un total de 752.393.024 parámetros. Se distribuye en formatos GGUF (Q8_0), un ZIP para Ollama y es compatible con LM Studio, lo que lo orienta a despliegue local y en el borde (edge). La licencia es Apache 2.0 y los idiomas declarados son inglés y coreano.

Su relevancia actual reside en la propuesta de un pipeline de decisión de cinco ejes (domain, brain, knowledge, agent, next_step) que culmina en una de cuatro claves de acción (NOW, NORMAL, PAYMENT_CHECK, REVIEW), pensado para enrutamiento multi-agente y automatización de flujos de trabajo. El modelo afirma producir decisiones en menos de 0,05 segundos en local, aunque no se han publicado resultados de benchmarks que lo respalden en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), ajuste fino con LoRA (rango 8, alpha 16) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF, ZIP para Ollama, compatible con LM Studio |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,75 mil millones de parámetros, y se ajusta mediante LoRA Supervised Fine-Tuning con rango 8 y alpha 16. No se especifica en la información disponible la composición del dataset de preentrenamiento de la base, el número de tokens utilizados ni si hubo fases de RLHF o DPO adicionales. Los tags del repositorio mencionan reinforcement-learning, PPO y GRPO, así como el framework JEV (Judgment-Evaluation-Verification), pero la model card describe el método de ajuste como LoRA SFT, sin detallar la aplicación efectiva de RL.

El conjunto de datos de ajuste se describe como 30 escenarios reales de solopreneurs convertidos en 150 tareas de decisión estructuradas, con particiones de entrenamiento (18 solicitudes, 90 tareas), validación (6 solicitudes, 30 tareas) y test (6 solicitudes, 30 tareas). La innovación técnica declarada es el pipeline de decisión de cinco ejes, que restringe la generación libre a una salida estructurada y determinista, con el objetivo de eliminar la alucinación de texto y producir una única clave de acción operativa.

## Capacidades

- Clasificación y enrutamiento de solicitudes de trabajo en cinco ejes: dominio, cerebro especialista, base de conocimiento, agente ejecutor y siguiente paso.
- Emisión de una de cuatro claves de acción estandarizadas: NOW, NORMAL, PAYMENT_CHECK y REVIEW.
- Salida estructurada en JSON orientada a enrutamiento multi-agente y automatización de flujos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo actúa como componente de decisión dentro de un sistema multi-agente, pero no se detalla razonamiento multi-paso autónomo.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos.
- Capacidades especiales: modo de decisión determinista, sin generación de texto libre; no se declaran visión ni audio.
- Despliegue local en el borde mediante Ollama, LM Studio y llama.cpp.

## Casos de uso

- Enrutamiento de solicitudes en un sistema multi-agente: el modelo recibe una petición entrante y devuelve los campos domain, brain, knowledge, agent y next_step, permitiendo que un orquestador dirija la tarea al agente especialista adecuado (marketing_ai, content_ai, support_ai) sin intervención humana.
- Clasificación de urgencia operativa: ante incidentes como filtración de tokens de pago o brecha de servidor, el modelo emite la clave NOW para disparar protocolos de emergencia; ante solicitudes rutinarias, emite NORMAL.
- Verificación financiera automatizada: las solicitudes de transferencia, reembolso o auditoría se clasifican como PAYMENT_CHECK, activando un flujo de comprobación antes de ejecutar el pago.
- Escalado a revisión humana: disputas legales, contratos o contextos ambiguos se etiquetan como REVIEW, derivando el caso al CEO o a un revisor humano.
- Automatización de atención al cliente de primer nivel: el modelo decide si una consulta debe responderse con reply_drafter, requerir aclaración con ask_user o pasar a revisión, reduciendo la carga de triaje.
- Producción de contenido y marketing: solicitudes de estrategia o guiones se enrutan a strategy_writer o script_writer con el knowledge base correspondiente (marketing_docs, content_docs), habilitando pipelines de generación posterior.
- Despliegue en dispositivos de borde: gracias a su tamaño inferior a 1 GB en Q8_0 y su compatibilidad con Ollama y LM Studio, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada para automatización local de flujos de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma decisiones en menos de 0,05 segundos en local, pero no se aportan métricas de precisión, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 752 millones de parámetros; en Q8_0 (formato publicado) ocupa aproximadamente 0,8 GB, por lo que se estima un uso de VRAM en torno a 1-2 GB incluyendo overhead de contexto y runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1050 Ti, RTX 3050, RTX 4060 y superiores; también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (recomendado por el autor), LM Studio, llama.cpp y transformers con PEFT.
- Latencia y throughput estimados: el autor declara menos de 0,05 segundos por decisión en local; no se proporcionan cifras de throughput (tokens/s) ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CHOCO-BRAIN-0.8B-v0.1 | 752 M | no disponible | Decisión estructurada para solopreneurs (JEV) | Apache 2.0 | HuggingFace, GGUF, Ollama, LM Studio |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | LLM generalista | no disponible en la información | HuggingFace |
| Alternativas de clasificación/ enrutamiento de 1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada; la comparación se limita a la relación con su modelo base.

## Limitaciones y advertencias

- El ajuste se realizó sobre un conjunto muy reducido (30 escenarios, 150 tareas), lo que limita la generalización a dominios y casuísticas no cubiertas.
- El modelo está diseñado para emitir decisiones estructuradas, no para generación de texto libre; usarlo como chatbot general produciría resultados pobres.
- Idiomas soportados limitados a inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación en la clasificación: aunque el pipeline restringe la salida, la asignación de dominio, agente o clave de acción puede ser incorrecta ante entradas ambiguas.
- Sesgos conocidos: no se documentan en la información disponible; el dataset de 30 escenarios de solopreneurs puede introducir sesgos de dominio y de estilo de negocio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5-0.8B, no detallada en la información proporcionada.
- No se han publicado benchmarks que validen la precisión de las decisiones ni la afirmación de latencia inferior a 0,05 segundos.
- Para producción se recomienda validar el modelo contra un conjunto de test propio y mantener una ruta de revisión humana para las decisiones REVIEW y PAYMENT_CHECK.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/CHOCO-BRAIN-0.8B-v0.1
- Documentación en coreano: https://huggingface.co/hwihwalab/CHOCO-BRAIN-0.8B-v0.1/blob/main/README_KR.md
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
