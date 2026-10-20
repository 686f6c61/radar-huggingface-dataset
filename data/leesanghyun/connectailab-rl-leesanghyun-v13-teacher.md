# LeeSanghyun/connectailab-rl-LeeSanghyun-v13-teacher

## Resumen

`connectailab-rl-LeeSanghyun-v13-teacher` es un modelo de decisión entrenado con aprendizaje por refuerzo profundo (PPO) que actúa como "corteza prefrontal" de una empresa simulada dentro del proyecto CONNECT TYCOON. No es un modelo de lenguaje generativo: recibe un estado estructurado en formato JEV (`typesafe/jev-1.13`) y devuelve una decisión discreta con distribución de probabilidades y nivel de confianza. Lo desarrolla y publica LeeSanghyun dentro de CONNECT AI LAB x AI CITY BUILDERS, con licencia Apache 2.0 y artefactos en formato numpy (sin tensores safetensors ni GGUF).

El problema que resuelve es la toma de decisiones operativas multi-paso en un simulador de negocio: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo se entrenó primero imitando a un "presidente basado en reglas" (aprendizaje supervisado) y después se ajustó con PPO usando una función de recompensa multiobjetivo derivada de los valores de la empresa: beneficio 3,0, satisfacción del cliente 2,5 y riesgo 2,0.

Su relevancia es acotada y experimental: es un modelo educativo de 0 descargas y 0 likes en el momento de la consulta, pensado para demostrar un pipeline completo de RL con feedback humano sobre un entorno Gymnasium propio. La model card advierte explícitamente de que se trata de un modelo educativo sobre un simulador sintético y de que no garantiza ni predice resultados de gestión reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de decisión entrenada con PPO (deep reinforcement learning) sobre un estado estructurado JEV; no es un transformer ni un modelo de lenguaje. La model card no publica el detalle de la red |
| Parametros totales | no disponible (la model card no publica el recuento de parámetros ni el tamaño de la red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no hay ventana de contexto: cada consulta recibe un estado JSON (departamento, motivo, importe, `fraud_score`, etc.) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como artefactos numpy, no como tensores cuantizables |
| Idiomas soportados | coreano (`ko`): etiquetas de estado, criterios de decisión y motivos están en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (`library_name: numpy`); la model card no detalla el contenedor exacto (por ejemplo `.npz`) |
| Pipeline | `reinforcement-learning` |
| Entorno | `connect-tycoon`, variante `general` (distinta del entorno `lecture` usado en cursos) |
| Formato de respuesta | JEV, con `type`, `choice`, `probabilities`, `confidence` y `reason` |

## Arquitectura y entrenamiento

El modelo implementa una política de decisión que se invoca mediante `ct.CompanyBrain.from_hub(...)` de la librería `connect-tycoon`. La entrada es un objeto JEV con dos partes: `state` (por ejemplo `{"department": "refund", "reason": "미배송", "tier": "단골", "amount": 8.7, "fraud_score": 0.3146...}`) y `questions`, donde se declara el tipo de pregunta (`choice`), las instrucciones y los criterios posibles (`full`, `partial`, `deny`, `human`). La salida es la misma estructura JEV con la opción elegida, la distribución de probabilidad sobre todas las opciones y una confianza igual a la probabilidad máxima. Esto encaja con el ecosistema `jev-style` del proyecto y con un uso como componente sustituible dentro de un simulador Gymnasium.

El entrenamiento fue en dos fases. Primero, aprendizaje supervisado a partir de un "presidente basado en reglas" que sirve de profesor. Después, PPO con la recompensa multiobjetivo `{"이익": 3.0, "고객 만족": 2.5, "위험": 2.0}` (beneficio, satisfacción del cliente, riesgo). La versión v13 parte de la rama de mejora iniciada en v11 (no continúa desde v12) y añade: PPO con 60 iteraciones de 24 meses y tasa de aprendizaje 0,15, validación cada 3 iteraciones; feedback humano con 242 elementos existentes repetidos 20 veces y tasa 0,1; tres semillas aleatorias (31, 32 y 33) desde el mismo modelo inicial. La selección del candidato se hizo sobre 60 meses independientes (13000-13059), eligiendo la semilla 33 por mejor recompensa agregada, y la evaluación final sobre 100 meses nuevos (60000-60099). El entorno empleado tiene la configuración `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

## Capacidades

- Decisión discreta con distribución de probabilidad completa sobre las opciones declaradas en la pregunta JEV, lo que permite umbralizar por confianza o derivar a revisión humana.
- Gestión operativa de una empresa simulada a lo largo de un mes de 20 días laborables: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, reembolsos y seguridad.
- Política de reembolsos con cuatro acciones (`full`, `partial`, `deny`, `human`) condicionada al importe, la fidelidad del cliente y una puntuación de fraude.
- Detección de fraude en transacciones con tarjeta, evaluada sobre un registro de 713 transacciones (177 fraudulentas).
- Razonamiento multi-paso implícito: las decisiones de cada día afectan al inventario, la caja, la satisfacción y los accidentes de los días siguientes.
- Respuesta en formato JEV tipado, adecuada para integrarse en pipelines que consumen JSON estructurado en lugar de texto libre.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado únicamente en coreano.
- Modo "thinking", visión, audio, tool calling o function calling: no disponibles; no son capacidades de este modelo.

## Casos de uso

- Simulación de gestión de inventario: el modelo decide cuánto pedir cada día en función del stock (almacén de 250 unidades), la demanda base de 40 y el coste unitario de 1,5; en la evaluación de 100 meses reduce los días de rotura de stock de 0,62 a 0,46 de media.
- Política automatizada de reembolsos: se le pasa el estado del caso y devuelve `full`, `partial`, `deny` o `human` con una probabilidad asociada, lo que permite fijar un umbral de confianza (por ejemplo, derivar a humano si la probabilidad máxima es inferior a 0,8) en lugar de aplicar reglas fijas.
- Filtro antifraude previo a la revisión manual: sobre 713 transacciones detecta 158 casos fraudulentos frente a 153 del modelo anterior, con una reducción de pérdidas del 90,45 % respecto a permitirlo todo; las alertas que genera (241 solicitudes de revisión) se enrutan a un analista.
- Docencia y formación en RL: el repositorio incluye un cuaderno de Colab para entrenar el modelo, y el paquete permite `connect-tycoon play --brain hf:...` para enfrentar el modelo al juego y observar sus decisiones en el simulador.
- Entorno de referencia para investigación en RLHF: sirve como línea base reproducible (semillas 31-33, 60 meses de selección y 100 meses de test) para comparar variantes de PPO y de incorporación de feedback humano.
- Integración como componente de decisión en pipelines JEV: cualquier servicio que hable el formato `typesafe/jev-1.13` puede sustituir reglas heurísticas por esta política sin cambiar el contrato de datos.
- Evaluación comparativa de agentes: la tabla de 40 meses frente al "presidente basado en reglas" permite medir de forma directa la mejora de un agente aprendido frente a una heurística en un entorno controlado.

## Benchmarks y rendimiento

Evaluación común de 40 meses (medía del "presidente basado en reglas" frente al modelo):

| Métrica | Presidente basado en reglas | connect-ai-company-v13 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 15,32 millones de wones |
| Satisfacción del cliente | 79 % | 89 % |
| Incidentes de riesgo | 7,8 | 1,6 |
| Solicitudes que exceden la revisión humana | 37,8 | 3,3 |
| Días de rotura de stock | 10,7 | 0,3 |

Evaluación sobre 100 meses nuevos (60000-60099), antes y después del entrenamiento adicional:

| Métrica | Antes del entrenamiento adicional | Este modelo |
|---|---|---|
| Beneficio mensual medio | 1.502,78 millones de wones | 1.509,19 millones de wones |
| Satisfacción al cierre del mes | 87,90 % | 89,83 % |
| Incidentes de riesgo mensuales | 1,51 | 1,37 |
| Solicitudes que exceden la revisión humana | 3,67 | 3,49 |
| Días de rotura de stock mensuales | 0,62 | 0,46 |

Reproducción del registro de transacciones con tarjeta (713 transacciones, 177 fraudulentas):

| Métrica | Antes | Este modelo |
|---|---|---|
| Fraudes detectados | 153 | 158 |
| Transacciones legítimas bloqueadas | 50 | 49 |
| Reducción de pérdidas frente a permitirlo todo | 86,44 % | 90,45 % |
| Solicitudes de revisión humana | 198 | 241 |

No se han publicado resultados en benchmarks estándar de IA (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede: el modelo no es un LM evaluable con esas pruebas. Las cifras de las tablas provienen de la model card y corresponden a ventanas de evaluación distintas (40 meses comunes frente a 100 meses nuevos), por lo que no son directamente comparables entre sí.

## Requisitos de hardware

- Inferencia sobre NumPy: no requiere GPU; la carga y la evaluación de la política se ejecutan en CPU.
- VRAM estimada: no disponible con precisión; al no publicarse el tamaño de la red, no puede calcularse. En la práctica el artefacto se carga como arrays numpy y el consumo es de unos pocos MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: ninguna imprescindible. Cualquier equipo capaz de ejecutar Python y NumPy sirve.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y también en CPU sin aceleración; el cuello de botella es el simulador `connect-tycoon`, no el modelo.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga desde el Hub con `ct.CompanyBrain.from_hub("LeeSanghyun/connectailab-rl-LeeSanghyun-v13-teacher")`, y cuaderno de Google Colab para el entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de una evaluación de política sobre un vector de estado, la inferencia es de coste muy bajo comparada con un modelo generativo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de terceros en esta categoría (políticas de RL para simulación empresarial con salida JEV). La única referencia cuantitativa publicada es interna al proyecto:

| Modelo | Tipo | Beneficio mensual (40 meses) | Satisfacción | Incidentes de riesgo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Presidente basado en reglas | Heurística | 3,24 M wones | 79 % | 7,8 | no disponible | Referencia interna del simulador |
| connect-ai-company-v13 (este modelo) | PPO + supervisado | 15,32 M wones | 89 % | 1,6 | Apache 2.0 | Hugging Face, 0 descargas |
| Versión anterior (misma familia, previa al entrenamiento adicional) | PPO + supervisado | 1.509,19 frente a 1.502,78 M wones en la ventana de 100 meses | 89,83 % frente a 87,90 % | 1,37 frente a 1,51 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un simulador sintético de empresa; la propia model card indica que no garantiza ni predice resultados de gestión reales.
- Idioma: solo coreano. Los estados, las instrucciones y los criterios de decisión deben estar en coreano; no hay evidencia de generalización a otras lenguas.
- Sesgos: al aprender de un "presidente basado en reglas" y de 242 elementos de feedback humano, hereda los sesgos de esas políticas y de esas anotaciones, que no se documentan.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo de decisiones con alta confianza y baja calidad; la confianza reportada es simplemente la probabilidad máxima de la política y no está calibrada de forma explícita.
- La evaluación de fraude asume que la revisión humana es correcta, tal como advierte el autor; no debe interpretarse como rendimiento de detección puramente automática.
- Los resultados provienen de una sola semilla seleccionada (33) entre tres; no se publican intervalos de confianza ni desviaciones entre semillas, y el autor indica que no se garantiza la misma mejora en otros entrenamientos.
- Cobertura de evaluación limitada a las ventanas 13000-13059 y 60000-60099 del simulador; no hay validación fuera de esa distribución de episodios.
- El entorno evaluado es `general`, distinto del entorno `lecture` usado en los cursos, por lo que los resultados no son extrapolables a esa variante.
- El modelo se publicó cambiando solo el nombre de visualización; los pesos y los resultados son los del entrenamiento previo. No se incluyen los datos originales de feedback personal ni los archivos de guardado del juego, lo que limita la reproducibilidad exacta.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo educativo sobre un simulador, conviene revisar también la licencia de `connect-tycoon` antes de integrarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento del análisis; sin comunidad que valide los resultados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v13-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (sitio principal): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (no se ha localizado una URL propia en la información disponible)
- Paper técnico: no disponible
- Demo adicional: no disponible

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido técnico de la ficha y se han descartado.
