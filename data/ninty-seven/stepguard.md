# ninty-seven/StepGuard

## Resumen

StepGuard es un modelo guardián de 4B parámetros diseñado para la evaluación de seguridad a nivel de paso en agentes LLM que utilizan herramientas. Desarrollado por el equipo de zheng977, el modelo se inicializa desde Qwen/Qwen3-4B-Instruct-2507 y se entrena con un enfoque de dos fases: un fine-tuning supervisado en frío con datos generados por StepGen, seguido de un post-entrenamiento Balance-GRPO que reduce la brecha de rendimiento entre decisiones seguras e inseguras.

El modelo resuelve el problema de la supervisión de seguridad en agentes que ejecutan acciones de herramienta, proporcionando tanto evaluación previa a la ejecución de una acción candidata como auditoría de trayectorias completas ya ejecutadas. Su relevancia actual radica en que los sistemas de agentes autónomos con tool use se están desplegando en producción sin mecanismos de control de seguridad a nivel de paso. El modelo es un componente de monitorización, no un agente autónomo ni una garantía de seguridad formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (hay versiones GGUF de terceros) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (via terceros) |

## Arquitectura y entrenamiento

StepGuard es un modelo transformer denso de 4B parametros, inicializado desde Qwen/Qwen3-4B-Instruct-2507. El entrenamiento se realiza en dos fases: primero, un supervised fine-tuning en cold-start sobre datos generados por StepGen, un motor de datos automatico que produce grupos de trayectorias anotadas como seguras/inseguras con acciones de riesgo localizadas y alternativas seguras contextualizadas. Posteriormente, se aplica Balance-GRPO, una variante de GRPO que equilibra la optimizacion entre decisiones seguras e inseguras para evitar que el modelo se sesgue hacia una clase.

El modelo no introduce innovaciones arquitectonicas propias; su contribucion es el pipeline de datos (StepGen) y el algoritmo de post-entrenamiento (Balance-GRPO) para la tarea de seguridad a nivel de paso. No se ha publicado el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Evaluacion de seguridad de una accion de herramienta candidata antes de su ejecucion (step-level guard).
- Auditoria de trayectorias completas de agente, identificando el primer paso inseguro o el paso principal inseguro.
- Clasificacion de la fuente de riesgo: instruccion maliciosa del usuario, prompt injection directa/indirecta, informacion no fiable, inyeccion en la descripcion de herramientas, ejecucion de herramientas maliciosas, feedback de herramientas corrupto o fallo del propio agente.
- Generacion de un analisis textual en 4-7 frases que cubre evidencia, intencion, consecuencia y decision.
- Salida estructurada con etiquetas XML: `<Analysis>`, `<Judgment>`, `<RiskSourcePresent>`, `<RiskSource>` y `<UnsafeStep>` (solo en modo trayectoria).
- Soporte de dos plantillas de inferencia: step-level y trajectory-level.
- Modelo de texto puro, sin capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Monitorizacion de agentes de navegacion web: un agente que opera un navegador puede ser supervisado por StepGuard antes de cada accion de click, envio de formulario o navegacion, bloqueando acciones que excedan el ambito autorizado por el usuario.
- Auditoria de trayectorias de agentes en produccion: tras la ejecucion de un agente, StepGuard analiza el log completo de acciones y observaciones, identificando el primer paso inseguro para depuracion o post-mortem.
- Filtro de acciones en pipelines de tool calling: integrado como un guard intermedio en un sistema de function calling, evalua la accion propuesta por el LLM antes de ejecutarla y rechaza las que presenten riesgo de exfiltracion de datos o acciones destructivas.
- Deteccion de prompt injection en entradas de herramientas: cuando una herramienta devuelve contenido que puede contener instrucciones maliciosas, StepGuard evalua si la siguiente accion del agente se basa en informacion no confiable o inyectada.
- Auditoria de seguridad de agentes de compra o transacciones: supervisa acciones de un agente que maneja pagos, envios o cuentas, marcando como inseguras las acciones que se desvian del flujo legitimo autorizado por el usuario.
- Evaluacion de sistemas de agentes en desarrollo: durante el testing de un pipeline de agentes, StepGuard se usa como oracle automatico para medir cuantos pasos inseguros ejecuta el agente antes de que el sistema lo bloquee.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arXiv 2606.17871 y el OpenReview presentan evaluaciones, pero no se incluyen cifras concretas en la informacion proporcionada. No se han publicado comparativas numericas con otros guard models en los materiales disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 4B parametros en FP16 requiere aproximadamente 8 GB de VRAM; en cuantizacion INT8 unos 4 GB, y en INT4 unos 2.5 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4070 Ti con cuantizacion. Para despliegue en produccion con alto throughput, se recomiendan A10G, A100 o L4.
- Despliegue: compatible con el ecosistema de Hugging Face transformers y text-generation-inference. Existen versiones GGUF de terceros para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponible; dependen de la GPU y de la cuantizacion elegida. Para un modelo de 4B, se espera una latencia de decodificacion de unos 20-40 ms por token en una GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables especificos para la tarea de step-level safety en agentes. El modelo es parte de una categoria emergente de guard models; no se han identificado alternativas directas con datos comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un garantia de seguridad formal: el modelo es un componente de monitorizacion, no una garantia de que el agente sea seguro.
- Solo soporta ingles: el modelo esta entrenado en ingles, y su uso en otros idiomas puede degradar su rendimiento.
- La salida en formato XML con etiquetas exactas es obligatoria; el modelo puede producir salidas que no cumplan el esquema si se usa con prompts diferentes a las plantillas publicadas.
- No se ha publicado la licencia del modelo, por lo que el uso comercial puede ser legalmente incierto.
- El modelo se basa en Qwen3-4B-Instruct-2507, por lo que hereda las limitaciones del modelo base (posibles sesgos, riesgo de alucinacion en el analisis).
- La clasificacion de riesgo depende de la calidad del historial de interacciones y de la serializacion exacta del contrato de entrada; una representacion incorrecta del historial puede llevar a decisiones erroneas.
- Riesgo de sobre-ajuste a los datos sinteticos de StepGen, que puede limitar la generalizacion a escenarios no representados en el dataset de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/ninty-seven/StepGuard
- Proyecto: https://zheng977.github.io/StepGuard/
- Codigo: https://github.com/zheng977/StepGuard
- Paper arXiv 2606.17871: https://arxiv.org/abs/2606.17871
- OpenReview: https://openreview.net/forum?id=2i7xXuNixu
- Version GGUF de terceros: https://huggingface.co/mradermacher/stepguard-rl-4b-GGUF
