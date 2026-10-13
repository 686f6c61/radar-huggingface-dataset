# kevincity2026/connectailab-kevin-v1

## Resumen

connectailab-kevin-v1 es una política de aprendizaje por refuerzo (RL) desarrollada por el usuario kevincity2026 dentro del proyecto CONNECT TYCOON y del laboratorio CONNECT AI LAB. No es un modelo de lenguaje generativo, sino un "cerebro de empresa" (CompanyBrain) que actúa como órgano de decisión sobre un simulador de gestión empresarial: dirige una compañía sintética durante un mes (20 días laborables) tomando decisiones de asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo se entrena en dos fases: primero imita a un "jefe de reglas" heurístico mediante aprendizaje supervisado, y después ajusta su política con PPO (Proximal Policy Optimization) usando una recompensa multiobjetivo basada en el valor de la empresa (beneficio, satisfacción del cliente y aversión al riesgo). La interfaz de entrada y salida sigue el formato estructurado JEV, de modo que el modelo devuelve una opción discreta con su distribución de probabilidad y un nivel de confianza, no texto libre.

Su relevancia es acotada y experimental: se trata de un modelo educativo y de investigación sobre toma de decisiones secuenciales en entornos con recompensas en conflicto, con licencia Apache-2.0 y publicación reciente. Está declarado únicamente para coreano, se distribuye a través de la librería numpy y cuenta con cero descargas en el momento de la consulta, por lo que no existe validación independiente de sus resultados. El autor advierte explícitamente que es un modelo formativo sobre un simulador de empresa sintético y que no predice ni garantiza resultados de gestión reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo sobre estado estructurado; no se especifica si es MLP, tabla o red neuronal) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (el estado se pasa como estructura JEV, no como secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

La model card no describe la topología de red empleada. Lo que sí especifica es el paradigma de entrenamiento en dos etapas: una fase de aprendizaje supervisado en la que la política imita a un "jefe de reglas" (규칙 사장), seguida de un ajuste fino con PPO empleando como señal de recompensa el valor compuesto de la empresa, definido como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso unitario cada uno).

La interacción se formaliza mediante JEV (referenciado como `typesafe/jev-1.13`): el modelo recibe un estado (por ejemplo, departamento, motivo, tramo de cliente, importe y puntuación de fraude) junto con una pregunta de tipo elección y un conjunto de criterios, y responde con una opción, las probabilidades asociadas a cada alternativa y una confianza. El entorno de simulación se describe con una configuración de empresa concreta (almacén de 250 unidades, demanda base de 40, coste unitario de 1.5, escala de pedido 1.0, salario 0.0, potencia publicitaria 1.0, entre otros parámetros). No se indica el número de tokens, episodios, muestras ni iteraciones de entrenamiento, ni si se aplicaron técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Toma de decisiones discretas sobre estado estructurado: selecciona una opción entre alternativas definidas por el esquema JEV (por ejemplo, `full`, `partial`, `deny`, `human` en la gestión de reembolsos).
- Salida probabilística calibrada en formato: devuelve `choice`, `probabilities` por alternativa y `confidence` (en el ejemplo de la model card: 0.9139 para reembolso total, 0.0005 para parcial, 0.0005 para rechazo y 0.085 para derivación a humano).
- Gestión empresarial simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad a lo largo de 20 días laborables.
- Optimización multiobjetivo: equilibra beneficio, satisfacción y riesgo bajo una función de recompensa ponderada.
- Integración con el simulador y el paquete Connect Tycoon mediante `CompanyBrain.from_hub()`.
- Idioma: únicamente coreano.
- No dispone de generación de texto libre, tool calling, capacidades de agente multi-paso, visión ni audio, según la información disponible.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo se carga en Connect Tycoon como cerebro de la compañía y ejecuta un mes completo de operaciones, permitiendo a estudiantes observar el impacto de cada decisión en beneficio, satisfacción y riesgo.
- Investigación en aprendizaje por refuerzo multiobjetivo: sirve como referencia para estudiar cómo una política PPO equilibra recompensas en conflicto (maximizar beneficio frente a minimizar incidentes de riesgo).
- Comparación de políticas frente a heurísticas: la model card ofrece una comparación directa contra un "jefe de reglas", útil para evaluar si el aprendizaje supervisado más PPO supera a un sistema basado en reglas en el mismo entorno.
- Automatización de decisiones en un juego o simulación de gestión: mediante `connect-tycoon play --brain hf:kevincity2026/connectailab-kevin-v1`, el modelo controla la empresa de forma autónoma dentro del simulador.
- Generación de datos sintéticos de decisión: sus salidas con distribución de probabilidad y confianza pueden emplearse para poblar conjuntos de datos de decisiones etiquetadas en escenarios de reembolso, fraude u atención al cliente simulada.
- Docencia de RL aplicada: el flujo completo (imitar a un jefe de reglas, definir recompensa, ajustar con PPO y medir KPIs) es replicable en el cuaderno de Colab publicado, lo que lo convierte en material didáctico de principio a fin.
- Pruebas de integración de esquemas JEV: permite validar implementaciones del protocolo JEV con preguntas de tipo elección y criterios múltiples.

## Benchmarks y rendimiento

La model card publica una evaluación sobre 40 meses de simulación con empresas nunca vistas, comparando el modelo con el jefe de reglas:

| Métrica (media de 40 meses) | Jefe de reglas | connectailab-kevin-v1 |
|---|---|---|
| Beneficio mensual | 3.24 millones de wones | 11.11 millones de wones |
| Satisfacción del cliente | 79% | 95% |
| Incidentes de riesgo | 7.8 | 2.8 |
| Confirmaciones humanas superadas | 37.8 | 21.7 |
| Días sin existencias | 10.7 | 0.5 |

Se trata de una evaluación interna sobre un simulador propietario y sintético, no de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados en benchmarks públicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al declararse la librería numpy y no especificarse parámetros, no puede calcularse.
- GPU recomendadas: no disponible. Por la naturaleza de la librería (numpy) y del pipeline (reinforcement-learning sobre estado estructurado), la inferencia es presumiblemente ejecutable en CPU, sin necesidad de GPU, aunque esto no se afirma explícitamente en la model card.
- Compatibilidad con GPU de consumo: no disponible; sin tamaño de parámetros no puede confirmarse.
- Opciones de despliegue: paquete Python `connect-tycoon` (con extra `[game]`) y carga mediante `CompanyBrain.from_hub()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para simulación de gestión empresarial). La única referencia de comparación documentada es el "jefe de reglas" heurístico que actúa como base de imitación y como línea base de evaluación, ya recogido en la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo formativo y de investigación: el propio autor advierte que es un "modelo educativo sobre un simulador de empresa sintético" y que no garantiza ni predice resultados de gestión reales.
- Dominio restringido: solo opera sobre el estado y las preguntas definidos por el simulador Connect Tycoon y el esquema JEV; no es un modelo de propósito general.
- Idioma: soporte declarado únicamente para coreano, lo que limita su uso directo en castellano u otros idiomas.
- Sin validación externa: cero descargas en el momento de la consulta y ausencia de benchmarks públicos independientes.
- Sesgo de imitación: la primera fase de entrenamiento replica a un jefe de reglas heurístico, por lo que puede heredar los sesgos y limitaciones de esa política base.
- Riesgo de sobreajuste al simulador: el rendimiento medido (11.11 millones de wones de beneficio, 95% de satisfacción) procede del mismo entorno sintético y no es extrapolable a escenarios reales.
- Opacidad técnica: no se publican arquitectura, número de parámetros, formato de pesos, datos de entrenamiento ni hiperparámetros, lo que dificulta la reproducibilidad y la auditoría.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia, pero se ofrece sin garantías; conviene revisar los términos de los componentes de terceros mencionados (por ejemplo, el esquema JEV de `typesafe/jev-1.13`).
- Sin capacidades generativas: no produce texto libre, no soporta tool calling y no puede emplearse como asistente conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kevincity2026/connectailab-kevin-v1
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Sitio del autor (KevinCity Cloud): https://kevincity.cloud
- CONNECT AI LAB en YouTube: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Canales musicales y de comunidad citados por el autor: https://www.youtube.com/@MelodistSeoul, https://www.youtube.com/@Melodist_Chill, https://www.youtube.com/@QuietWorshipLofi, https://www.youtube.com/@FaithinMelody-m1b, https://www.youtube.com/@StillRoomMeditationMusic, https://www.youtube.com/@pickballdoctor4060
- Esquema JEV referenciado: `typesafe/jev-1.13` (identificador de HuggingFace; no se ha verificado su URL en la información disponible)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a un buscador de vuelos y no guardan relación con la ficha.
