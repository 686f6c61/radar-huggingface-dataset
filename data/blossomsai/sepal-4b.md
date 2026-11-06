# BlossomsAI/Sepal-4B

## Resumen

Sepal-4B es un adaptador LoRA (rango 64) con una cabeza de decisión asociada, construido sobre el modelo post-entrenado Qwen3.5-4B, desarrollado por BlossomsAI. No es un modelo generativo de texto libre: responde preguntas tipadas sobre un estado dado (una alerta, una ventana de logs, una política o un documento) en una sola pasada, con tres formatos de respuesta: sí/no (`noul`), elección entre hasta 255 opciones y niveles de puntuación. Cada respuesta viene acompañada de probabilidades calibradas, no de texto libre.

El modelo está especializado en decisiones de operaciones de seguridad (SOC): veredictos de alertas, emparejamiento de reglas y políticas, mapeo a ATT&CK, priorización de vulnerabilidades, detección de inyección en campos controlados por el atacante, control de respuestas y abstención ante evidencia insuficiente. Para preservar habilidades generales, el corpus de entrenamiento mezcla datos de decisión generales con la capa de seguridad.

Con 4B parámetros de base y ventanas de estado de hasta unos 16k tokens, Sepal-4B duplica aproximadamente la habilidad macro de su predecesor Sepal-0.8B en los paneles de desarrollo del autor (0,916 frente a 0,822 en decisiones de seguridad) y mejora de forma notable la cobertura a bajo error y el rendimiento en ventanas de log largas. Su relevancia actual radica en ofrecer decisiones estructuradas y calibradas para automatización de triaje SOC, un caso donde la generación de texto libre resulta difícil de auditar y de integrar en pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64, alpha 128) sobre todas las capas lineales del modelo base Qwen3.5-4B, más cabeza de decisión (Clef head) |
| Parametros totales | No disponible (adaptador LoRA sobre base de 4B; el repositorio ocupa 0,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estados de hasta aproximadamente 16k tokens; entradas de entrenamiento de hasta 24.576 tokens |
| Tipos de cuantizacion | No disponible (la model card indica "Coming Soon!") |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `joint_head.safetensors`), configuración JSON |

## Arquitectura y entrenamiento

Sepal-4B es un adaptador PEFT sobre Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). El adaptador LoRA tiene rango 64 y alpha 128, aplicado sobre todas las capas lineales del modelo de lenguaje, y se acompaña de una cabeza de decisión (`joint_head.safetensors`) que produce las respuestas tipadas y sus probabilidades. El entrenamiento se realizó con el entrenador de decisiones de Unsloth (cabeza Clef, un prompt por registro), con learning rate 1e-4, scheduler coseno con 10% de warm-up, una época y 64 registros por paso (8 x 8).

El corpus `full-v15` contiene 691.705 registros y 449,4 millones de tokens procedentes de 149 fuentes, con la capa de seguridad en torno al 41% de los tokens. Incluye datos SOC generados, ventanas de log largas con criterios personalizados, datos de selección de herramientas construidos solo a partir de particiones de entrenamiento, conjuntos públicos de seguridad y conjuntos de decisión generales. Cada registro fue cribado contra el benchmark propio del autor para evitar copias exactas o casi exactas y evitar instancias compartidas. El entrenamiento consumió 10.808 pasos y 32 horas de GPU en una RTX PRO 6000 (96 GB). Como innovación práctica, se ajustó una temperatura por tipo de pregunta y bucket de número de opciones sobre conjuntos retenidos, almacenada en `sepal.json`.

## Capacidades

- Respuestas tipadas con probabilidades calibradas: sí/no (`noul`), elección entre hasta 255 opciones y niveles de puntuación, en una sola pasada.
- Veredictos de alertas de seguridad y triaje SOC.
- Emparejamiento de reglas y políticas contra un estado dado.
- Mapeo a ATT&CK.
- Priorización de vulnerabilidades.
- Detección de inyección en campos controlados por el atacante.
- Control de respuestas (response gating).
- Abstención ante evidencia insuficiente ("insufficient evidence"), con F1 de 0,95 en ventanas de log largas.
- Procesamiento de ventanas de log largas (estados de hasta aproximadamente 16k tokens) con múltiples criterios personalizados de sí/no.
- Selección de herramientas e intención (tool and intent selection).
- Decisiones generales fuera del dominio de seguridad, gracias a la mezcla de datos generales en el corpus.
- Idioma: únicamente inglés.

## Casos de uso

- Triaje automatizado de alertas SOC: el modelo recibe el estado de una alerta y devuelve un veredicto tipado con probabilidad calibrada, lo que permite priorizar la cola de alertas y enrutar solo los casos de alta confianza a resolución automática.
- Emparejamiento de políticas y reglas: dado un estado y un conjunto de políticas, Sepal-4B selecciona entre hasta 255 opciones cuál aplica, útil para verificar cumplimiento o disparar controles automatizados.
- Mapeo a ATT&CK: a partir de una ventana de log o de una descripción de incidente, el modelo elige la técnica correspondiente entre el catálogo de opciones, alimentando informes y paneles de detección.
- Priorización de vulnerabilidades: con el estado de un hallazgo (CVSS, exposición, activo afectado), el modelo asigna un nivel de puntuación calibrado para ordenar la remediación.
- Detección de inyección en campos controlados por el atacante: el modelo evalúa campos de entrada no confiables y responde sí/no con probabilidad, lo que permite bloquear prompts maliciosos en pipelines de agentes.
- Abstención en ventanas de log largas: en análisis de logs de hasta 16k tokens con criterios personalizados, el modelo detecta cuándo la evidencia es insuficiente (F1 de 0,95) y evita decisiones forzadas, algo crítico en entornos donde un falso positivo tiene coste operativo.
- Selección de herramientas en agentes: con una intención y un catálogo de herramientas, el modelo elige la herramienta adecuada (habilidad macro de 0,965 en el panel TOOL), lo que sirve como enrutador previo a un agente generativo.
- Control de respuestas automatizadas: el modelo decide si una acción de respuesta (bloqueo, aislamiento, escalado) está justificada según el estado y las políticas, actuando como puerta de seguridad antes de ejecutar la acción.

## Benchmarks y rendimiento

Resultados de los paneles de desarrollo del propio autor (SOCDecide 0.7.0, paneles de log largo y herramientas, y conjuntos generales retenidos; una sola semilla; las particiones de test no se leyeron):

| Panel | Sepal-4B | Sepal-0.8B |
|---|---|---|
| Decisiones de seguridad, habilidad macro (SEC-dev) | 0,916 | 0,822 |
| Cobertura de seguridad con 5% de error | 1,000 | 0,846 |
| Cobertura de seguridad con 1% de error | 0,849 | 0,558 |
| Ventanas de log largas con criterios personalizados, habilidad (LONG-LOG) | 0,779 | 0,590 |
| Logs largos a 16k tokens, habilidad | 0,668 | 0,485 |
| Detección de "evidencia insuficiente" en logs largos, F1 | 0,95 | 0,92 |
| Selección de herramientas e intención, habilidad macro (TOOL) | 0,965 | 0,926 |
| Fuentes de seguridad no vistas, habilidad | 0,467 | 0,337 |
| Decisiones generales, habilidad (GEN-dev) | 0,466 | 0,338 |
| Error de calibración (ECE, mitad retenida del informe) | 0,020 | 0,031 |

El autor indica que la ejecución del Decision Index está en curso y que su puntuación se añadirá a la model card. No se han publicado comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador y la cabeza ocupan 0,6 GB; el modelo base Qwen3.5-4B requiere su propia memoria, que no se detalla en la información proporcionada.
- GPU de entrenamiento: una RTX PRO 6000 (96 GB), con 32 horas de cómputo para 10.808 pasos.
- GPU recomendadas para inferencia: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Qwen3.5-4B y del soporte del entrenador de decisiones de Unsloth, no documentado para GPUs de consumo en esta ficha.
- Opciones de despliegue: el adaptador se carga con PEFT sobre Qwen3.5-4B; la cabeza de decisión se lee con el entrenador de decisiones de Unsloth (`unsloth_decision_config.json`). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sepal-4B | Adaptador sobre base de 4B | Estados de hasta ~16k tokens | Decisiones tipadas calibradas para SOC | Apache 2.0 | Hugging Face (BlossomsAI/Sepal-4B) |
| Sepal-0.8B | Adaptador sobre base de 0,8B | No disponible | Decisiones tipadas calibradas para SOC | No disponible en la información | Hugging Face (BlossomsAI/Sepal-0.8B) |
| Qwen3.5-4B | 4B | No disponible | Modelo generativo de propósito general (base de Sepal) | No disponible en la información | Hugging Face (Qwen/Qwen3.5-4B) |

No se dispone de datos de benchmarks de terceros ni de otros modelos de decisión tipada comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado para otros idiomas.
- No es un modelo generativo de texto libre: está diseñado para responder preguntas tipadas con un formato concreto, por lo que no debe usarse como chatbot general.
- Los resultados de los paneles son del propio autor, con una sola semilla y sobre paneles de desarrollo; las particiones de test no se leyeron, pero no hay validación independiente publicada.
- La habilidad en fuentes de seguridad no vistas es baja (0,467), lo que indica una generalización limitada fuera de la distribución del corpus de entrenamiento.
- La habilidad en decisiones generales es moderada (0,466), por debajo de la de seguridad, pese a la mezcla de datos generales.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de decisión con probabilidades calibradas, el riesgo se traslada a decisiones incorrectas con confianza alta.
- Sesgos conocidos: no documentados en la información disponible.
- Cuantizaciones no disponibles todavía ("Coming Soon!"), lo que limita el despliegue en hardware restringido.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base Qwen3.5-4B y de las dependencias (Unsloth, PEFT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin adopción comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlossomsAI/Sepal-4B
- Modelo predecesor Sepal-0.8B: https://huggingface.co/BlossomsAI/Sepal-0.8B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio BlossomAI: https://github.com/BlossomAI
- Repositorio bloomifycafe/blossomsAI: https://github.com/bloomifycafe/blossomsAI
