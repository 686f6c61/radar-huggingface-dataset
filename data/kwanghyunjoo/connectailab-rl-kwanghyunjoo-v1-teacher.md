# kwanghyunjoo/connectailab-rl-kwanghyunjoo-v1-teacher

## Resumen

connectailab-rl-kwanghyunjoo-v1-teacher es una política de decisión entrenada con aprendizaje por refuerzo para operar una empresa simulada dentro del entorno CONNECT TYCOON. Lo publica Kwanghyun Joo (일사천리 컨설팅, Daejeon) en el marco de CONNECT AI LAB y AI CITY BUILDERS, bajo licencia Apache 2.0, y la tarjeta lo presenta con el nombre comercial ilsacheonri-v1 ("AI 사장").

No es un modelo de lenguaje: es un agente que recibe un estado de la empresa (departamento, motivo, tipo de cliente, importe, puntuación de fraude) y devuelve una decisión estructurada en formato JEV (typesafe/jev-1.13), por ejemplo elegir entre reembolso completo, parcial, denegación o derivación a una persona, junto con las probabilidades de cada opción y un nivel de confianza. Se entrenó primero imitando a un "presidente de reglas" mediante aprendizaje supervisado y después ajustó la política con PPO usando como recompensa el valor compuesto de la empresa (beneficio, satisfacción del cliente y riesgo).

Su relevancia es acotada: es un modelo educativo y experimental, con 0 descargas y 0 likes en el momento de la consulta y sin arquitectura, número de parámetros, contexto ni formato de pesos publicados. Resulta útil como ejemplo reproducible de RL aplicado a la toma de decisiones empresariales sobre un simulador Gymnasium, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decisión entrenada con PPO sobre un simulador; no se publica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica: la política consume un diccionario de estado, no una secuencia de tokens; no se especifica límite |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko); las decisiones se emiten como claves estructuradas JEV con motivos en coreano |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (librería declarada: numpy; la tarjeta no confirma si son .npy, .npz u otro artefacto) |

## Arquitectura y entrenamiento

La tarjeta describe un agente de decisión sobre CONNECT TYCOON, un simulador de empresa donde cada episodio cubre un mes de 20 días laborables. El agente decide sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad, y emite cada respuesta en el formato tipado JEV (typesafe/jev-1.13). El proceso de entrenamiento consta de dos fases declaradas: primero aprendizaje supervisado a partir de un "presidente de reglas" y después ajuste con PPO (Proximal Policy Optimization) usando la función de valor de la empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente, riesgo). La configuración del entorno documentada es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

No se publican detalles de la red (número de capas, dimensión de las representaciones, tamaño del lote, número de pasos de entrenamiento ni composición del conjunto de datos). La innovación técnica destacable es la interfaz de integración: el cargador `ct.CompanyBrain.from_hub(...)` permite enchufar la política al simulador o al juego mediante `connect-tycoon play --brain hf:kwanghyunjoo/connectailab-rl-kwanghyunjoo-v1-teacher`, y la salida se normaliza como preguntas y respuestas tipadas con distribución de probabilidad y campo `confidence`. Los tags del repositorio mencionan `prefrontal-cortex` y `decision-making` como marco conceptual, sin más detalle técnico.

## Capacidades

- Toma de decisiones discretas con distribución de probabilidad explícita sobre las alternativas (por ejemplo: `full` 0.9394, `partial` 0.0206, `deny` 0.0085, `human` 0.0315).
- Gestión de operaciones simuladas: colocación de personal, pedidos de inventario, campañas de marketing, atención al cliente, política de reembolsos y seguridad antifraude.
- Respuesta en formato JEV tipado, con criterios declarados por el llamador (`type`, `instructions`, `criteria`) y justificación de la decisión (`reason: "강화학습 정책"`).
- Optimización multiobjetivo simultánea de beneficio, satisfacción del cliente y riesgo, según la función de recompensa declarada.
- Integración como "cerebro" externo en CONNECT TYCOON mediante `CompanyBrain` y modo de juego con `--brain hf:...`.
- Ejecución declarada con dependencia de numpy, lo que sugiere inferencia ligera sin framework de deep learning pesado (no confirmado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües. Solo coreano.

## Casos de uso

- Simulación de gestión empresarial para formación: el modelo opera la empresa durante 20 días laborables y devuelve decisiones trazables con probabilidades, lo que permite analizar en un aula por qué el agente elige una opción y compararla con la heurística de reglas.
- Investigación en aprendizaje por imitación seguido de RL: sirve de caso de estudio de una canalización "behavior cloning + PPO" sobre un entorno Gymnasium con función de recompensa multiobjetivo declarada.
- Política de reembolsos y fraude en un entorno controlado: con entradas como `reason`, `tier`, `amount` y `fraud_score`, el modelo decide entre reembolso completo, parcial, denegación o revisión humana, lo que lo hace apto para experimentar con umbrales de coste por revisión manual (0,8만원 por caso según la tarjeta).
- Gestión de inventario y reposición: la mejora reportada de 10,7 a 0,6 días de rotura de stock en el simulador lo hace apropiado para estudiar políticas de pedido con demanda base y tamaño de almacén fijos.
- Planificación de plantilla y marketing: permite evaluar políticas que reparten presupuesto entre personal, publicidad y atención al cliente bajo una recompensa que penaliza el riesgo.
- Integración como oponente o asistente en el juego CONNECT TYCOON: el modo `connect-tycoon play --brain hf:...` permite usar la política como jugador automático para demostraciones o pruebas comparativas.
- Generación de datos sintéticos de decisión etiquetados con confianza: útil para construir conjuntos de pares estado-decisión en coreano y compararlos con la política de reglas de referencia.
- Docencia de RL en coreano: la tarjeta enlaza un cuaderno de Colab para "aprender directamente", de modo que el modelo y el simulador pueden usarse como material didáctico completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares); no aplican a una política de decisión y no se inventan cifras. La tarjeta sí publica una comparación propia frente al "presidente de reglas" sobre 40 meses no vistos, con estas métricas de simulador:

| Métrica (media de 40 meses no vistos) | Presidente de reglas | ilsacheonri-v1 |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,34 millones de won |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,9 |
| Confirmaciones humanas excedidas | 37,8 | 19,1 |
| Días de rotura de stock | 10,7 | 0,6 |

Estos valores provienen exclusivamente de la model card del autor, corresponden al simulador CONNECT TYCOON con la configuración indicada y no son verificables de forma independiente con la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La tarjeta no publica tamaño de parámetros ni artefacto de pesos, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada. Dado que la librería declarada es numpy y la entrada es un diccionario de estado de baja dimensionalidad, es verosímil que la inferencia se ejecute en CPU, pero la documentación no lo afirma.
- Opciones de despliegue: integración mediante la librería `connect-tycoon` (`pip install "connect-tycoon[game]"`) y el cargador `CompanyBrain.from_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplicarían a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ilsacheonri-v1 (connectailab-rl-kwanghyunjoo-v1-teacher) | Política RL (PPO) sobre simulador | no disponible | no aplica | 11,34 M won/mes, 95 % satisfacción, 2,9 incidentes | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Presidente de reglas de CONNECT TYCOON | Heurística determinista | no aplica | no aplica | 3,24 M won/mes, 79 % satisfacción, 7,8 incidentes | la del repositorio CONNECT TYCOON | Incluido en el simulador |
| Otras políticas RL públicas para decisión empresarial | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de modelos comparables adicionales en la información consultada; la comparación con modelos de lenguaje o de propósito general no sería pertinente porque la tarea (elección discreta sobre un estado estructurado) es distinta.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones; su salida es una elección tipada con probabilidades.
- No se publican arquitectura, número de parámetros, recuento de tokens de entrenamiento, hiperparámetros de PPO ni composición del conjunto de datos, lo que impide auditar el entrenamiento o reproducirlo con detalle.
- El rendimiento reportado procede únicamente del simulador propietario y de la propia model card; no hay evaluación independiente ni comparación con terceros.
- Riesgo de sobreajuste al simulador: los buenos resultados en 40 meses no vistos del mismo entorno no garantizan transferencia a otros entornos ni a decisiones reales.
- La propia tarjeta advierte de que es un "modelo educativo sobre un simulador de empresa sintético" y que no garantiza ni predice resultados de gestión reales.
- Idioma limitado al coreano; no hay soporte multilingüe documentado.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin incidencias ni validaciones externas conocidas.
- Inconsistencia de identificadores: el repositorio es `kwanghyunjoo/connectailab-rl-kwanghyunjoo-v1-teacher`, mientras que el JSON de ejemplo devuelve `"model": "connect-company/ilsacheonri-v1"` y el nombre comercial es `ilsacheonri-v1`; conviene verificar cuál es el identificador canónico antes de integrarlo.
- Metadatos anómalos: fecha de creación 2026-10-16 y actualización tres segundos después, lo que sugiere una subida automatizada y dificulta trazar el histórico de versiones.
- La tarjeta indica que el experimento de "conexión de modelos" (Connect AI) está en pruebas, por lo que la integración puede cambiar sin aviso.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el material se presenta con fines educativos y el simulador CONNECT TYCOON puede tener sus propias condiciones; hay que revisarlas por separado.
- No se documentan sesgos, sino un riesgo estructural: la política optimiza una función de valor con pesos fijados por el autor (beneficio, satisfacción y riesgo a 1.0 cada uno), de modo que cualquier despliegue con prioridades distintas exige reevaluar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/kwanghyunjoo/connectailab-rl-kwanghyunjoo-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI (investigación conjunta del modelo C1): https://www.ezerai.xyz
- Sitio del autor: https://againwalk.com
- Canal de YouTube del autor: @화광동진-q8o
- Documentación del formato JEV citado (`typesafe/jev-1.13`): no se proporciona enlace en la información disponible
- Paper técnico: no disponible
- Demo interactiva distinta del cuaderno de Colab: no disponible
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo y se descartan.
