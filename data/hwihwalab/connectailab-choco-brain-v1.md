# hwihwalab/connectailab-CHOCO-BRAIN-v1

## Resumen

connectailab-CHOCO-BRAIN-v1 es un ajuste fino mediante LoRA de Qwen/Qwen3.5-0.8B, desarrollado por Hwihwa Lab (hwihwalab) y publicado con licencia Apache 2.0. No se presenta como un modelo conversacional generalista, sino como un "motor de decisión prefrontal externo" para estudios indie de videojuegos unipersonales: recibe situaciones operativas (crashes en el lanzamiento, auditorías de reembolsos, contratos de publicación) y devuelve veredictos estructurados en JSON siguiendo el protocolo propietario JEV (Judgment-Evaluation-Verification).

El modelo base aporta la arquitectura transformer y el conocimiento lingüístico; el adaptador LoRA (rango 8, alpha 16) se entrenó con supervisión sobre 30 escenarios reales de desarrollo indie expandidos a 150 problemas de decisión estructurados, con partición de 18 escenarios (90 tareas) para entrenamiento, 6 (30 tareas) para validación y 6 (30 tareas) para test. El resultado es un modelo de 752 millones de parámetros que emite decisiones clasificadas en cuatro claves de acción (`NOW`, `NORMAL`, `PAYMENT_CHECK`, `REVIEW`) y cinco ejes de enrutamiento (`domain`, `brain`, `knowledge`, `agent`, `next_step`).

Su relevancia práctica reside en el despliegue en hardware de borde: se distribuye en GGUF Q8_0 y es compatible con Ollama y LM Studio, lo que permite inferencia local sin GPU dedicada y con latencia declarada de 0,05 segundos por veredicto. El autor lo orienta a orquestación multiagente y aplicación de guardarraíles en pipelines de operaciones de juego en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (rango 8, alpha 16) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only denso de aproximadamente 752 millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado con LoRA de rango 8 y alpha 16, sin que la model card documente cambios en la arquitectura subyacente ni en la ventana de contexto. El adaptador se publica junto al modelo base y se carga con `transformers` y `peft`.

El corpus de entrenamiento es reducido y muy específico: 30 escenarios reales de desarrollo indie de videojuegos, cada uno expandido a cinco problemas de decisión estructurados, hasta un total de 150 tareas. La partición es de 90 tareas de entrenamiento, 30 de validación y 30 de test. Las etiquetas de decisión incluyen las cinco dimensiones del protocolo JEV y las cuatro claves de acción. Los tags del repositorio mencionan PPO, GRPO y aprendizaje por refuerzo profundo, pero la model card describe explícitamente el proceso como "LoRA Supervised Fine-Tuning"; no se documenta ninguna fase de RLHF, DPO o RL verificable, por lo que esas etiquetas deben tratarse con cautela.

La innovación declarada no es arquitectónica sino de formato de salida: el protocolo JEV impone una estructura rígida de veredicto (dominio, cerebro especialista, documentación a consultar, agente ejecutor y siguiente paso) que restringe el espacio de respuestas y facilita la integración en sistemas multiagente con guardarraíles.

## Capacidades

- Clasificación y enrutamiento de decisiones operativas en cinco ejes: `domain` (game_dev, store_ops, monetization, publishing), `brain` (dev_ai, ops_ai, finance_ai, none), `knowledge` (engine_docs, store_policy_docs, terms_docs, none), `agent` (hotfix_coder, store_manager, refund_auditor, ask_user, human_review) y `next_step` (finish, ops_handoff, ask_user, human_review).
- Emisión de veredictos estructurados en JSON con una de cuatro claves de acción: `NOW` para emergencias, `NORMAL` para operaciones rutinarias, `PAYMENT_CHECK` para verificación financiera y `REVIEW` para decisiones ejecutivas.
- Razonamiento de decisión acotado a dominios de negocio de videojuegos: soporte en vivo, gestión de tienda, monetización y publicación.
- Capacidad multilingüe limitada a inglés y coreano.
- Integración como componente de orquestación multiagente: el campo `agent` delega la ejecución a especialistas y `next_step` define el traspaso.
- Soporte de tool calling, function calling y modo thinking: no documentado en la información disponible.
- Capacidades de visión, audio o generación de código general: no documentadas; el agente `hotfix_coder` es una etiqueta de enrutamiento, no una capacidad de programación verificada.

## Casos de uso

- Triaje de incidentes en el lanzamiento de un juego: ante un crash crítico o corrupción de partidas guardadas, el modelo devuelve la clave `NOW` con el agente `hotfix_coder` y el dominio `game_dev`, lo que permite disparar automáticamente un pipeline de hotfix sin intervención humana en la clasificación inicial.
- Gestión de reembolsos de Steam: para disputas de más de dos horas de juego o pagos duplicados de DLC, el modelo emite `PAYMENT_CHECK` con el agente `refund_auditor` y la documentación `terms_docs`, adecuado para preclasificar casos antes de la revisión manual.
- Automatización de operaciones de tienda: la configuración de rebajas estacionales o la publicación de parches rutinarios se clasifican como `NORMAL` con el agente `store_manager`, lo que permite encadenar acciones de back-office con guardarraíles definidos por el campo `next_step`.
- Revisión de contratos de publicación: ante una oferta de exclusividad global para consola o una reclamación de copyright, el modelo devuelve `REVIEW` con `human_review` como siguiente paso, actuando como filtro que escala decisiones ejecutivas sin resolverlas autónomamente.
- Orquestación de un enjambre de agentes en un estudio unipersonal: el campo `brain` selecciona el especialista (`dev_ai`, `ops_ai`, `finance_ai`) y el campo `agent` designa al ejecutor, de modo que el modelo funciona como router central de bajo coste en lugar de como generador de texto.
- Asistente local en hardware de borde: al distribuirse en GGUF Q8_0 y ejecutarse en Ollama o LM Studio, puede desplegarse en el portátil de un desarrollador individual sin GPU dedicada, con la latencia declarada de 0,05 segundos por veredicto para consultas interactivas durante la jornada de trabajo.
- Aplicación de guardarraíles en pipelines de CI/CD de contenido: el modelo puede clasificar peticiones entrantes y forzar `ask_user` o `human_review` cuando la confianza o el dominio quedan fuera de las etiquetas previstas, evitando que un agente automático ejecute acciones no autorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de la tarea de decisión (precisión por eje, matriz de confusión o exactitud en el conjunto de test de 30 tareas), a pesar de que la partición de datos permitiría reportarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en safetensors ocupa aproximadamente 0,8 GB en el repositorio; en FP16 la inferencia requiere del orden de 1,5 a 2 GB de VRAM, y en GGUF Q8_0 en torno a 0,8 a 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En el extremo profesional, A100 o H100 no aportan ventaja apreciable para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente toda la gama actual (GTX 1650 4 GB en adelante) y también en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (con Modelfile), LM Studio (GGUF), llama.cpp, y `transformers` + `peft` para cargar el adaptador LoRA sobre Qwen3.5-0.8B. vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: el autor declara veredictos en 0,05 segundos en hardware de borde; no se especifican tokens por segundo ni la GPU empleada en esa medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-CHOCO-BRAIN-v1 | 752 M | No disponible | Decisión estructurada para operaciones de estudio indie (protocolo JEV) | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | LLM conversacional generalista | No disponible en la informacion proporcionada | HuggingFace |
| Modelos de decisión para agentes de juego de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de alternativas directamente comparables en la información proporcionada; la comparación con el modelo base es la única referencia fiable, y la diferencia principal es la especialización en formato de salida estructurado frente a la conversación libre.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 30 escenarios y 150 tareas, con solo 30 tareas de test. La capacidad de generalización a situaciones no vistas está limitada por diseño y no se ha cuantificado públicamente.
- Riesgo de sobreajuste al formato JEV: fuera de las etiquetas previstas, el modelo puede forzar una clasificación incorrecta en lugar de abstenerse; conviene validar el campo `next_step` como mecanismo de escape.
- Idiomas limitados a inglés y coreano; no hay evidencia de soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada; no debe asumirse la ventana del modelo base sin verificación empírica.
- Las etiquetas del repositorio mencionan PPO, GRPO y aprendizaje por refuerzo, pero la model card describe únicamente ajuste fino supervisado con LoRA. Esa discrepancia debe resolverse antes de asumir propiedades de RL.
- Sesgos conocidos: no documentados por el autor; al estar entrenado sobre escenarios de un estudio concreto ("Choco Games"), puede reflejar sesgos operativos y comerciales de ese contexto.
- Riesgo de alucinación en las justificaciones textuales del veredicto; la estructura JSON reduce pero no elimina la posibilidad de contenido inventado en los campos de texto libre.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia y el archivo NOTICE; no impone restricciones de uso adicionales.
- En producción, el modelo no debe operar como decisor final en casos `REVIEW` o `PAYMENT_CHECK` sin revisión humana; su función declarada es la preclasificación y el enrutamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/connectailab-CHOCO-BRAIN-v1
- Manual en coreano: https://huggingface.co/hwihwalab/connectailab-CHOCO-BRAIN-v1/blob/main/README_KR.md
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
