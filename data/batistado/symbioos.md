# batistado/SymbioOS

## Resumen

SymbioOS es un sistema de orquestación e inferencia para clústeres de agentes de software autónomos (tipo SWE-agent u OpenHands), no un modelo de lenguaje con pesos entrenados. Lo desarrolla el autor batistado (con autoría académica de Mohammed Kamran Syed y colaboradores) y se publica bajo licencia Apache 2.0 con el repositorio vacío de pesos (0.0 GB), lo que confirma que se distribuye como software y no como checkpoint. Su problema central es el desajuste entre la generación de tokens en GPU y la ejecución de herramientas POSIX en CPU: cuando la contención de CPU alarga contenedores de `pytest` o `clang++`, los motores de inferencia convencionales (vLLM, Continuum, UNISON/SPEAR) y los planificadores de sistema operativo (CFS, AgentCgroup) operan en bucle abierto y desperdician HBM o dejan sockets colgados.

La propuesta técnica cierra ese bucle en espacio de usuario sin privilegios de root mediante tres componentes: un filtro de sub-turnos que detecta silencios anómalos en la salida de las herramientas, un planificador basado en índices de Gittins ponderados por el estado de la caché KV, y un micro-prefill en streaming que pre-codifica la salida append-only de `stdout` durante los huecos de GPU. El resultado declarado es un prefill post-exit 7,98 veces más rápido con paridad de logits (`cos_sim = 0.999997`).

Es relevante ahora porque el coste de los agentes de código en producción está dominado por la latencia de las herramientas y la gestión de la caché KV, no solo por el modelo. SymbioOS se posiciona como capa de infraestructura para quienes despliegan agentes de codificación a escala y necesitan reducir el tiempo muerto de GPU y la presión sobre HBM sin modificar el kernel ni el motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de orquestación e inferencia (planificador de sandbox POSIX + gestor de caché KV + micro-prefill en streaming); no es una red neuronal |
| Parametros totales | no disponible (no aplica: no se distribuyen pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del motor de inferencia subyacente) |
| Tipos de cuantizacion | no disponible (no aplica al sistema; hereda los del motor subyacente) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB; se instala como paquete Python vía `pip install git+https://github.com/batistado/symbioos.git`) |

## Arquitectura y entrenamiento

SymbioOS no entrena un transformer ni un modelo MoE: es una capa de software que se sitúa entre el motor de inferencia y el planificador del sistema operativo. Su diseño se articula en tres módulos. El primero, `SubTurnRTTCFilter`, analiza en tiempo real los hitos `[XX%]` que emiten las herramientas y mide el silencio solo durante quanta no detenidos (`!is_sigstopped`), degradando las esperas estancadas a los 1,25 s sin expulsar falsos positivos cuando una importación está limitada por CPU. El segundo, `KVWeightedGittinsScheduler` junto con `OptimalStoppingJITController` (basado en el teorema 2 del artículo), asigna prioridad a las suites interactivas cuya caché KV está caliente en HBM y reincorpora las cachés expulsadas justo a tiempo mediante `os.killpg`. El tercero, `LookbackBPEStreamer`, pre-codifica por adelantado fragmentos de 256 tokens de la salida append-only de `stdout` durante los huecos de GPU, con paridad exacta de tokens y logits.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque no hay un proceso de entrenamiento de modelo. La validación empírica se apoya en un conjunto de benchmarks propio: `SymbioBench-Agent`, con 2.168 currículos de hardware y barridos de 256 sandboxes, además de resultados multimodelo en herramientas de desarrollo. La innovación destacable es el cierre del bucle en espacio de usuario sin root, combinando planificación estocástica (índices de Gittins) con promoción de caché KV guiada por el estado real de las herramientas.

## Capacidades

- Gestión de clústeres de agentes de codificación autónomos que alternan generación de tokens en GPU y ejecución de herramientas POSIX (`pytest`, `clang++`, `git`).
- Detección de bloqueos silenciosos en sockets y esperas estancadas mediante filtrado de sub-turnos con umbral configurable (1,25 s por defecto).
- Planificación de prioridades de suites interactivas ponderada por el estado de la caché KV en HBM.
- Promoción just-in-time de cachés KV expulsadas, reduciendo el coste de re-prefill.
- Micro-prefill en streaming de salidas append-only de `stdout` con paridad de logits (`cos_sim = 0.999997`) y aceleración declarada de 7,98x en el prefill posterior al `exit(0)`.
- Funcionamiento en espacio de usuario sin privilegios de root, compatible con motores de inferencia existentes.
- Integración con PyTorch como dependencia de ejecución.
- No incluye capacidades de generación de texto, visión, audio ni tool calling propias: esas funciones pertenecen al modelo servido.

## Casos de uso

- Despliegue de agentes SWE en producción: SymbioOS planifica los contenedores de pruebas y compilación para que la contención de CPU no alargue las tareas más allá de los umbrales TTL de la GPU, evitando que el motor de inferencia mantenga contextos vivos innecesariamente.
- Reducción de presión sobre HBM en clústeres multiagente: el planificador de Gittins ponderado por KV prioriza las suites con caché caliente y expulsa las frías, lo que permite servir más agentes concurrentes con la misma memoria de GPU.
- Aceleración del prefill en tareas de análisis de logs: cuando un agente ejecuta `pytest` y genera miles de líneas de `stdout`, el streamer pre-codifica fragmentos de 256 tokens durante los huecos de GPU, de modo que al terminar la herramienta el prefill ya está hecho (7,98x más rápido según el autor).
- Detección de cuelgues en pipelines de CI/CD: el filtro de sub-turnos identifica sockets colgados sin matar procesos que solo están limitados por CPU, lo que reduce falsos positivos en la supervisión de builds largos.
- Orquestación de entornos de evaluación de agentes: con barridos de 256 sandboxes documentados en `SymbioBench-Agent`, sirve para comparar configuraciones de planificación y medir el impacto en latencia y uso de memoria.
- Investigación en sistemas operativos e inferencia: al publicarse con pruebas formales y bundle LaTeX para IEEE TPDS, es adecuado como base reproducible para experimentos sobre planificación de agentes y gestión de caché KV.
- Integración en plataformas de agentes existentes: se instala como paquete Python y se apoya en PyTorch, por lo que puede envolver motores como vLLM sin sustituirlos.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son los del propio sistema, no comparativas estándar de LLM:

| Metrica | Valor declarado |
|---|---|
| Aceleración de prefill post-exit | 7,98x |
| Paridad de logits (coseno) | 0,999997 |
| Tamano de fragmento de pre-codificacion | 256 tokens |
| Umbral de degradacion por silencio | 1,25 s |
| Conjunto de evaluacion | 2.168 curricula de hardware + 256 sandboxes |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que SymbioOS no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo servido por el motor subyacente, no de SymbioOS.
- GPU recomendadas: no disponible; el sistema es agnóstico al acelerador siempre que el motor de inferencia lo soporte (A100, H100, RTX 4090 u otras).
- Cabe en GPU consumer: sí, en la medida en que el modelo servido quepa; SymbioOS añade una sobrecarga de planificación en CPU y memoria del host, no en VRAM.
- Opciones de despliegue: instalación vía `pip install git+https://github.com/batistado/symbioos.git`; se integra con motores de inferencia existentes (el artículo cita vLLM, Continuum y UNISON/SPEAR como referencia) y requiere PyTorch.
- Latencia y throughput: solo se declara la aceleración de 7,98x en el prefill posterior a la salida de la herramienta y la paridad de logits; no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| SymbioOS | Orquestador de agentes + gestor KV | Bucle cerrado rootless con Gittins y streaming prefill | Apache 2.0 | Repositorio GitHub y paquete pip; pesos no aplicables |
| vLLM | Motor de inferencia | Planificación de peticiones y PagedAttention en bucle abierto | Apache 2.0 | Ampliamente disponible |
| Continuum | Motor de inferencia para agentes | Gestión de contexto y caché KV | no disponible | Citado en el artículo |
| UNISON/SPEAR | Motor de inferencia | Inferencia especulativa y planificación | no disponible | Citado en el artículo |
| AgentCgroup | Planificador de SO para agentes | Control de grupos de CPU en bucle abierto | no disponible | Citado en el artículo |

La comparación directa con modelos de lenguaje no procede: SymbioOS es infraestructura y su rendimiento relativo se mide frente a motores y planificadores, no frente a checkpoints.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni razonamiento por sí mismo; requiere un motor de inferencia y un modelo subyacentes.
- Los resultados declarados (7,98x, 0,999997 de similitud) proceden del propio autor y del artículo en revisión para IEEE TPDS; no se han verificado de forma independiente en la información disponible.
- El repositorio de Hugging Face tiene 0.0 GB y 0 descargas, por lo que no hay artefactos de pesos ni una comunidad de validación.
- El umbral de 1,25 s para degradar esperas estancadas es heurístico y puede no ajustarse a todos los entornos; no se documentan mecanismos de calibración automática.
- Depende de que las herramientas emitan hitos `[XX%]` parseables; utilidades que no los producen pueden degradar la detección.
- El funcionamiento rootless limita algunas operaciones de planificación y de control de grupos de procesos frente a alternativas con privilegios.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática porque no hay modelo generativo implicado.
- La licencia Apache 2.0 permite uso comercial, pero el artículo está pendiente de publicación y la madurez del proyecto es temprana (creado y actualizado el mismo día, 22 de noviembre de 2026).

## Enlaces

- Hugging Face: https://huggingface.co/batistado/SymbioOS
- Dataset de benchmark: https://huggingface.co/datasets/batistado/SymbioBench-Agent
- Space interactivo: https://huggingface.co/spaces/batistado/SymbioOS-Explorer
- Código fuente y pruebas: https://github.com/batistado/symbioos
- Bundle LaTeX IEEE TPDS: `paper/symbioos_tpds_overleaf.zip` (referenciado en la model card)
- Cita: Syed, M. K., Rentala, A., Rahul, S., Pai, R. M., Dara, K. S. (2026). SymbioOS: Closed-Loop Rootless POSIX Sandbox Scheduling and White-Box Streaming KV Promotion for Tool-Intensive Agent Clusters. IEEE TPDS.
