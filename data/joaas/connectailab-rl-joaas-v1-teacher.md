# joaas/connectailab-rl-joaas-v1-teacher

## Resumen

connectailab-rl-joaas-v1-teacher es un modelo de decisión por aprendizaje por refuerzo desarrollado por el usuario joaas dentro del laboratorio educativo CONNECT AI LAB, con la colaboración de AI CITY BUILDERS. No es un modelo de lenguaje: es una política de decisión que actúa como "presidente" de una empresa simulada en el entorno CONNECT TYCOON y que debe resolver decisiones secuenciales sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad a lo largo de un mes de operación (20 días laborables). Cada decisión se devuelve en el formato estructurado de JEV (`typesafe/jev-1.13`), con una opción elegida, un vector de probabilidades sobre las alternativas y un valor de confianza.

El entrenamiento combina dos fases: una imitación supervisada de un "presidente de reglas" determinista y un ajuste posterior con PPO sobre una recompensa alineada con tres valores declarados, cada uno con peso 1,0: beneficio, satisfacción del cliente y aversión al riesgo. La model card reporta mejoras notables frente al baseline en una evaluación sobre 40 meses no vistos: 11,11 millones de wones de beneficio medio mensual frente a 3,24 millones, 95 % de satisfacción frente a 79 %, y 0,5 días de rotura de stock frente a 10,7.

Su relevancia es fundamentalmente didáctica y de investigación: muestra cómo aplicar RL a un entorno de decisión con reglas verificables, con resultados medidos contra un baseline explícito y con una integración directa en un simulador jugable (`pip install "connect-tycoon[game]"`). La propia model card lo describe como un modelo educativo sobre un simulador sintético y advierte de que no predice ni garantiza resultados empresariales reales. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no cuenta con validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; la librería declarada es numpy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se declaran safetensors, GGUF ni ningún otro formato) |
| Tipo de tarea | reinforcement-learning (política de decisión) |
| Entorno | CONNECT TYCOON, simulador de gestión empresarial (Gymnasium) |
| Algoritmo de RL | PPO, precedido de aprendizaje supervisado por imitación |
| Formato de salida | JSON estructurado compatible con JEV (`typesafe/jev-1.13`) |
| Librería de carga | numpy, mediante `connect_tycoon.CompanyBrain` |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (capas, tipo de red ni número de parámetros) y la librería declarada es numpy, lo que sugiere una política ligera cargada sin frameworks de deep learning pesados. El cuaderno de Colab asociado se denomina `rl_decision_model_qwen_colab.ipynb`, lo que apunta a una posible base Qwen, pero este dato no está confirmado en la documentación del modelo. La metáfora que usa el autor es la de un "córtex prefrontal" que gobierna la empresa durante un mes de operación.

El proceso de entrenamiento consta de dos etapas declaradas. En la primera, el modelo aprende por imitación (aprendizaje supervisado) las decisiones de un "presidente de reglas" —una política determinista de referencia— sobre el simulador CONNECT TYCOON. En la segunda, esa política inicial se refina con PPO usando una función de recompensa derivada de tres valores de empresa con el mismo peso: `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo). El resultado es una política estocástica que emite una distribución de probabilidad sobre las acciones disponibles y un campo de confianza; por ejemplo, ante una solicitud de reembolso con `fraud_score` de 0,3146, el modelo asigna 0,9139 de probabilidad a "reembolso total", 0,0005 a "reembolso parcial", 0,0005 a "rechazar" y 0,085 a "derivar a una persona". El entorno de entrenamiento se define con una configuración concreta de empresa (`warehouse` 250, `base_demand` 40, `unit_cost` 1.5, `order_scale` 1.0, `wage` 0.0, `ad_power` 1.0, entre otros).

## Capacidades

- Toma de decisiones discretas con salida probabilística: devuelve la opción elegida, la distribución completa sobre las alternativas y un valor de confianza.
- Gestión operativa de una empresa simulada: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Razonamiento multi-paso dentro de un episodio: mantiene una política coherente a lo largo de 20 días laborables consecutivos, no solo en decisiones aisladas.
- Equilibrio multiobjetivo: optimiza simultáneamente beneficio, satisfacción del cliente y control de riesgo según los pesos definidos en la recompensa.
- Gestión explícita del riesgo mediante derivación a humano: el modelo puede elegir la opción de revisión humana en lugar de decidir de forma autónoma (0,085 de probabilidad en el ejemplo documentado).
- Salida en formato estructurado JEV, apta para ser consumida por otros componentes de software sin postprocesado.
- Integración directa con el simulador CONNECT TYCOON mediante `CompanyBrain.from_hub` y mediante el comando `connect-tycoon play --brain hf:joaas/connectailab-rl-joaas-v1-teacher`.
- No dispone de generación de texto libre, tool calling, function calling, capacidades de visión, audio ni soporte multilingüe más allá del coreano.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y ejecutable de un ciclo imitación + PPO, con un baseline de reglas contra el que comparar, métricas de evaluación y un cuaderno de Colab para que el alumnado reproduzca el entrenamiento paso a paso.
- Práctica de gestión empresarial en entornos educativos: el simulador permite jugar un mes de operación poniendo este modelo como presidente, de forma que los estudiantes observan el efecto de cada decisión sobre beneficio, satisfacción e incidentes de riesgo.
- Baseline avanzado para investigación en RL: cualquier política nueva sobre CONNECT TYCOON puede compararse contra este modelo, ya que la model card publica cifras medias de 40 meses no vistos (beneficio, satisfacción, incidentes, derivaciones a humano y días de rotura de stock).
- Destilación o política maestra en experimentos multiagente: el sufijo `teacher` del nombre y la mención a un experimento de "conexión de modelos" en fase de pruebas sugieren su uso como política de referencia para entrenar o guiar otros agentes.
- Generación de datos sintéticos de decisión: la salida en formato JEV con distribución de probabilidades permite registrar trazas estructuradas de decisiones empresariales para auditoría, análisis de política o entrenamiento de modelos posteriores.
- Estudio de umbrales de derivación a humano: el modelo expone una probabilidad concreta de escalar a una persona, lo que permite analizar el compromiso entre coste de revisión humana y pérdida por fraude en distintas configuraciones.
- Integración en servicios de decisión estructurada: un backend puede invocar `CompanyBrain.from_hub(...)` con un estado en JSON y consumir la respuesta JEV para automatizar decisiones repetitivas con trazabilidad de la confianza asociada.
- Ejemplo de referencia para construir agentes sobre simuladores Gymnasium: el repositorio CONNECT TYCOON muestra el cableado completo entre entorno, política y formato de intercambio de preguntas y respuestas.

## Benchmarks y rendimiento

La model card publica una comparación directa contra el "presidente de reglas" (baseline determinista) sobre una media de 40 meses no vistos durante el entrenamiento:

| Métrica (media de 40 meses no vistos) | Presidente de reglas | connectailab-rl-joaas-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,11 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Derivaciones a persona por encima del umbral | 37,8 | 21,7 |
| Días de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo coherente con el hecho de que el modelo no es un modelo de lenguaje sino una política de decisión sobre un simulador propietario. Tampoco se documentan intervalos de confianza, desviaciones típicas ni el número exacto de episodios de evaluación más allá de la referencia a 40 meses.

## Requisitos de hardware

- La librería declarada es numpy y el modelo se carga mediante `connect_tycoon.CompanyBrain`, por lo que la inferencia es presumiblemente de CPU y de muy bajo coste; no se publica ningún requisito de VRAM explícito.
- No se especifica ninguna GPU recomendada ni mínima. Dado el tipo de política y la ausencia de dependencias de deep learning pesadas, no se espera que sea necesaria una GPU dedicada.
- Al no declararse el tamaño ni el formato de los pesos, no es posible estimar con rigor la VRAM necesaria para inferencia ni si cabría en una GPU de consumo; en la práctica, si la política es un artefacto numpy, el cómputo sería de CPU.
- Opciones de despliegue documentadas: el paquete `connect-tycoon` (extra `game`) para uso interactivo, y la carga desde HuggingFace Hub con `ct.CompanyBrain.from_hub("joaas/connectailab-rl-joaas-v1-teacher")`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplicarían a este tipo de modelo.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No se han encontrado en la documentación otros modelos públicos comparables de decisión por RL específicos para el simulador CONNECT TYCOON, ni referencias a modelos equivalentes de gestión empresarial simulada. La única alternativa documentada es el propio baseline interno:

| Modelo | Tipo | Parametros | Contexto | Beneficio medio mensual | Satisfacción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Presidente de reglas (baseline de CONNECT TYCOON) | Política determinista basada en reglas | no disponible | no disponible | 3,24 millones de wones | 79 % | no disponible (forma parte del simulador) | Integrado en el entorno CONNECT TYCOON |
| connectailab-rl-joaas-v1-teacher | Política de RL (PPO tras imitación) | no disponible | no disponible | 11,11 millones de wones | 95 % | apache-2.0 | HuggingFace Hub |
| Otros modelos de decisión empresarial comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Conviene aclarar que `typesafe/jev-1.13`, citado en la model card, es una librería o formato de intercambio estructurado, no un modelo de decisión alternativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta instrucciones en lenguaje natural más allá del esquema estructurado que consume y produce.
- El único idioma soportado es el coreano, tanto en la descripción del modelo como en los nombres de departamentos, motivos y criterios usados en los ejemplos de la model card.
- Está entrenado y evaluado sobre un simulador sintético concreto (CONNECT TYCOON) y con una configuración de empresa específica; sus políticas pueden no transferirse a otras configuraciones ni a entornos reales.
- La model card advierte de forma explícita de que se trata de un modelo educativo sobre un simulador sintético y de que no garantiza ni predice resultados empresariales reales.
- Las probabilidades que emite la política no implican calibración probabilística: son la distribución de la política aprendida, no una estimación fiable de la probabilidad de acierto. La propia respuesta de ejemplo etiqueta el campo `reason` como "política de aprendizaje por refuerzo".
- Posible sesgo derivado de la función de recompensa: los tres valores declarados tienen el mismo peso (1,0 cada uno), de modo que cualquier prioridad empresarial distinta a ese equilibrio no está representada en el modelo.
- El baseline de imitación condiciona la política resultante; los sesgos del "presidente de reglas" pueden persistir en el modelo final aunque PPO los corrija parcialmente.
- Sin validación externa: el modelo registra 0 descargas y 0 likes, y no se han encontrado referencias independientes en la búsqueda web (los resultados obtenidos no guardan relación con el modelo).
- La licencia apache-2.0 permite el uso comercial, pero el propio autor limita el alcance del modelo a fines educativos y de investigación sobre el simulador.
- Las fechas de creación y actualización que figuran en el repositorio (15 de octubre de 2026) son posteriores a la fecha de consulta habitual de este tipo de fichas, lo que conviene verificar antes de citarlas.
- Los experimentos de "conexión de modelos" de CONNECT AI LAB y Connect AI se describen en la propia model card como "en fase de pruebas", por lo que no deben considerarse capacidades estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaas/connectailab-rl-joaas-v1-teacher
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Librería o formato JEV citado en la model card: `typesafe/jev-1.13` (no se ha encontrado enlace directo en la información proporcionada)
- Documentación de marca del proyecto (banner): https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen de demostración del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
