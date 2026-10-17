# kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2-teacher

## Resumen

`connectailab-rl-kwanghyunjoo-v2-teacher` es una política de aprendizaje por refuerzo (RL) publicada por Kwanghyun Joo (일사천리 컨설팅, Daejeon) dentro del proyecto educativo CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje: es el «cerebro» que opera una empresa simulada en el entorno CONNECT TYCOON durante un mes de 20 días laborables, tomando decisiones de asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. Se entrenó primero imitando a un «jefe basado en reglas» (aprendizaje supervisado) y después se ajustó con PPO usando una función de recompensa derivada de los valores de la compañía: beneficio, satisfacción del cliente y riesgo, los tres con peso 1.0.

El modelo se distribuye como artefacto para la librería `numpy` y se consume a través del paquete `connect-tycoon` (`CompanyBrain.from_hub(...)`). Cada consulta recibe un estado en JSON (por ejemplo, departamento, motivo, tramo de cliente, importe y `fraud_score`) y devuelve una decisión en el esquema tipado JEV (`typesafe/jev-1.13`), con la opción elegida, la distribución de probabilidad sobre las alternativas, un valor de confianza y una justificación. Es relevante ahora por dos motivos: por un lado, sirve como referencia reproducible de RL multiobjetivo en un entorno sintético; por otro, ilustra un patrón de integración poco habitual, el de políticas RL que emiten decisiones estructuradas y calibradas en lugar de texto libre.

La model card declara explícitamente que se trata de un modelo educativo sobre un simulador de empresa sintético y que no garantiza ni predice resultados de negocio reales. El repositorio no documenta arquitectura de red, número de parámetros ni volumen de datos de entrenamiento; todos esos datos se marcan como no disponibles en esta ficha. El sufijo `teacher` del identificador sugiere un rol de modelo profesor, pero la documentación no lo especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Política de RL entrenada con PPO sobre un simulador de empresa; la inferencia se sirve con `numpy`. No se documenta la topología de la red (el notebook enlazado se llama `rl_decision_model_qwen_colab.ipynb`, pero la model card no confirma la arquitectura subyacente) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo mezcla de expertos) |
| Longitud de contexto | No disponible. No hay ventana de contexto: cada consulta es un estado JSON puntual sin historial de conversación |
| Tipos de cuantización | No disponible. No se publican variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | Coreano (`ko`); el resto de la documentación y del esquema JEV está en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. La librería declarada es `numpy`; no se listan ficheros safetensors ni GGUF en la información disponible |
| Pipeline | `reinforcement-learning` |
| Entorno | CONNECT TYCOON, API compatible con Gymnasium |
| Formato de salida | JEV (`typesafe/jev-1.13`): opción elegida, probabilidades por alternativa, confianza y motivo |
| Autor | kwanghyunjoo (Kwanghyun Joo) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red. Lo que sí se documenta es el procedimiento de entrenamiento en dos fases: una primera etapa de aprendizaje supervisado en la que el modelo imita a un «jefe basado en reglas» (rule boss) que opera la empresa simulada, y una segunda etapa de ajuste con PPO en la que la recompensa proviene de los valores declarados de la compañía (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo, con peso unitario). La optimización es, por tanto, multiobjetivo escalarizada, y el resultado es una política que prioriza explícitamente el compromiso entre rentabilidad, satisfacción y control de incidentes.

El entorno tiene una configuración de empresa fija en la evaluación publicada: `warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, `order_scale` 1.0, `staff_bonus` 0, `wage` 0.0, `ad_power` 1.0, `fraud_tool` 0, `extra_cs` 0, `extra_refund` 0. Cada paso corresponde a un día laborable y el episodio completo a 20 días. La política se expone mediante `ct.CompanyBrain.from_hub()` y se puede jugar de forma interactiva con `connect-tycoon play --brain hf:kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2-teacher`. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, destilación) ni el número de tokens o de pasos de entorno consumidos durante el entrenamiento.

## Capacidades

- Toma de decisiones discretas con multiple choice en un entorno de negocio simulado: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de decisiones en formato estructurado JEV con distribución de probabilidad completa sobre las alternativas, valor de confianza y etiqueta de motivo (en el ejemplo publicado, `reason: "강화학습 정책"`).
- Escalado a intervención humana como una opción más de la política: en el ejemplo de reembolso, la alternativa `human` («confirmación por persona, 0,8 mil wones por caso») recibe su propia probabilidad (0.0479), lo que permite calibrar umbrales de derivación.
- Razonamiento bajo incertidumbre numérica: el estado incluye variables continuas como `amount` o `fraud_score` (0.3146 en el ejemplo), que la política incorpora a la decisión.
- Optimización multiobjetivo explícita de beneficio, satisfacción y riesgo, en lugar de una única métrica.
- Compatibilidad con el ecosistema Gymnasium y con el simulador CONNECT TYCOON para evaluación de episodios completos.
- Idiomas: únicamente coreano.
- No dispone de generación de texto libre, código, matemáticas simbólicas, visión, audio, tool calling genérico ni razonamiento multi-paso conversacional.

## Casos de uso

- Línea base en experimentos de RL: sirve como política de referencia ya entrenada para comparar nuevas variantes (otro algoritmo, otra escalarización de recompensa, otro currículo) sobre el mismo entorno CONNECT TYCOON con semillas y configuración reproducibles.
- Docencia de aprendizaje por refuerzo: el par supervisado + PPO y la existencia de un baseline de reglas medible lo convierten en un caso práctico cerrado para cursos, tal como lo plantean los materiales de CONNECT AI LAB y el curso de RL de AI CITY BUILDERS.
- Estudio de políticas con formato de salida tipado: útil para investigar cómo integrar decisiones de RL en esquemas JSON validados (JEV), incluyendo la propagación de probabilidades y confianza a capas posteriores de un sistema.
- Diseño de human-in-the-loop en atención al cliente simulada: como la salida incluye `probabilities` y `confidence` por alternativa, se pueden calibrar umbrales de derivación a un humano (por ejemplo, derivar cuando la masa de probabilidad de `human` o de `deny` supera un valor) y medir el coste por caso derivado.
- Simulación de políticas operativas antes de probarlas en un entorno real: evaluación del impacto de decisiones de inventario y marketing sobre días sin stock, incidentes de riesgo y satisfacción en un entorno sintético, con coste nulo de error.
- Pruebas de integración de agentes: al exponerse como `CompanyBrain` con una interfaz de diccionario a diccionario, es adecuado para tests de pipelines que necesitan un tomador de decisiones determinista o casi determinista sin dependencia de un LLM.
- Auditoría y explicabilidad de políticas: la distribución de probabilidad por alternativa y la confianza permiten analizar en qué estados la política está poco segura y compararla con la política de reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no son aplicables a este tipo de modelo. La model card sí publica una evaluación interna en el simulador, media de 40 meses, frente al «jefe basado en reglas»:

| Métrica (simulador, media de 40 meses) | Jefe basado en reglas | `ilsacheonri-v2` (este modelo) |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,25 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,4 |
| Confirmaciones humanas superadas | 37,8 | 14,9 |
| Días sin stock | 10,7 | 0,4 |

Estos valores proceden de la evaluación del propio autor, sobre un simulador sintético y una configuración de empresa fija; no son comparables con benchmarks de modelos de lenguaje ni constituyen evidencia de rendimiento en negocio real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto se sirve con `numpy` y no se documenta tamaño de pesos. Por el tipo de política (entrada JSON pequeña, salida de probabilidades sobre pocas alternativas), la inferencia es viable en CPU.
- GPU recomendadas: no se especifica ninguna; no se requiere GPU para el uso documentado.
- GPU de consumo: no aplica, al no requerir acelerador. El cuello de botella es el simulador, no la política.
- Opciones de despliegue: paquete Python `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub("kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2-teacher")`, modo interactivo con `connect-tycoon play --brain hf:...` y ejecución del notebook de Colab enlazado. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este formato.
- Latencia y throughput: no disponibles. Al tratarse de una pasada de política por decisión (una por día simulado), se espera latencia baja en CPU, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada: no es un modelo de lenguaje y no hay otras políticas RL publicadas para este entorno en la documentación. La única comparación disponible es interna al proyecto:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en el simulador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ilsacheonri-v2` (este modelo) | Política RL (PPO) | No disponible | No aplica | 11,25 M wones/mes, 95 % satisfacción, 2,4 incidentes | Apache 2.0 | HuggingFace, vía `connect-tycoon` |
| Jefe basado en reglas | Sistema experto determinista | No aplica | No aplica | 3,24 M wones/mes, 79 % satisfacción, 7,8 incidentes | No disponible | Incluido en el simulador como referencia |
| Otros modelos RL para el mismo entorno | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve decisiones del simulador CONNECT TYCOON; no es utilizable como modelo de propósito general ni como sustituto de un LLM.
- Modelo educativo declarado por el autor: la model card indica explícitamente que no garantiza ni predice resultados de negocio reales, por lo que no debe usarse para decisiones empresariales reales sin validación externa.
- Único idioma documentado: coreano. El estado de entrada y las etiquetas de salida están en coreano, lo que limita su uso en entornos en castellano sin adaptación.
- Dependencia del esquema JEV (`typesafe/jev-1.13`) y del paquete `connect-tycoon`: cualquier cambio en el formato de estado o en las alternativas disponibles puede invalidar la política o degradar sus probabilidades.
- Riesgo de sobreajuste a la configuración publicada: la evaluación se hizo con una única configuración de empresa (`warehouse` 250.0, `base_demand` 40.0, `wage` 0.0, etc.); no se documenta su comportamiento con otras configuraciones ni con perturbaciones del entorno.
- Sin datos de calibración: se publica `confidence` por decisión, pero no hay evidencia de que las probabilidades estén calibradas fuera de la distribución de entrenamiento; conviene tratarlas con cautela en umbrales de derivación a humanos.
- Métricas no auditadas de forma independiente: los resultados de la tabla proceden del propio autor, en un simulador sintético, sin réplica externa publicada.
- Sin trazas de sesgo documentadas ni evaluación de equidad, al no tratar datos personales reales; el estado de ejemplo usa variables como `tier` («cliente habitual») y `fraud_score`, que en un despliegue real sí podrían implicar riesgos de discriminación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece ninguna garantía; además, el proyecto declara que la función de conexión de modelos («Connect AI») está en fase de pruebas.
- Adopción prácticamente nula: 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación por parte de la comunidad.
- La inferencia depende de `numpy` y del paquete `connect-tycoon`; no hay artefactos portables ni versionado de pesos documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Documentación gráfica del proyecto (banner): https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Documentación gráfica del proyecto (hero): https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI (modelo de decisión empresarial C1): https://www.ezerai.xyz
- Autor, 일사천리 컨설팅: https://againwalk.com
- Canal del autor en YouTube: https://www.youtube.com/@화광동진-q8o
- Esquema JEV referenciado en la model card: `typesafe/jev-1.13` (sin URL pública en la información disponible)
