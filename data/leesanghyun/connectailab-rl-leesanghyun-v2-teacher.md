# LeeSanghyun/connectailab-rl-LeeSanghyun-v2-teacher

## Resumen

connect-ai-company-v2 es un modelo de política de aprendizaje por refuerzo desarrollado por el usuario LeeSanghyun en el marco del proyecto CONNECT TYCOON (CONNECT AI LAB y AI CITY BUILDERS). No se trata de un modelo de lenguaje: es una política de toma de decisiones que actúa como "corteza prefrontal" de una empresa simulada y la opera durante un mes (20 días laborables), decidiendo sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El problema que aborda es la toma de decisiones secuencial bajo objetivos múltiples en conflicto (beneficio, satisfacción del cliente y riesgo). El entrenamiento se realizó en dos fases: primero aprendizaje por imitación de un "CEO de reglas" (aprendizaje supervisado) y después ajuste con PPO usando recompensas derivadas del valor declarado de la empresa (beneficio 3.0, satisfacción del cliente 3.0, riesgo 3.0).

Es relevante como ejemplo reproducible de un pipeline completo de RL aplicado a decisiones empresariales sobre un simulador sintético, con respuestas emitidas en el formato JEV (typesafe/jev-1.13) y una interfaz estructurada de entrada y salida. El modelo se distribuye con licencia Apache 2.0, está orientado al idioma coreano y se carga mediante la librería `connect_tycoon` (library_name: numpy), no como pesos de red neuronal en formatos convencionales. En el momento de la consulta registra 0 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; la model card no especifica la topología de red) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (la entrada es un estado estructurado en formato JEV, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga con la librería `connect_tycoon`; library_name: numpy) |
| Tipo de tarea (pipeline) | reinforcement-learning |
| Autor | LeeSanghyun |
| Proyecto base | CONNECT TYCOON |
| Etiquetas de entrenamiento humano registradas | 71 |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, dimensión de las representaciones ni tipo de función de valor). Lo que sí se documenta es el esquema de entrenamiento: una primera fase de aprendizaje supervisado por imitación del "CEO de reglas" del simulador y una segunda fase de ajuste con PPO, en la que la recompensa se deriva del valor de la empresa. Ese vector de valor se declara como `{"이익": 3.0, "고객 만족": 3.0, "위험": 3.0}` (beneficio 3.0, satisfacción del cliente 3.0, riesgo 3.0). En el archivo del modelo figuran 71 etiquetas humanas.

El simulador opera con una configuración concreta de empresa: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. La salida no es texto libre, sino decisiones tipadas con distribución de probabilidad sobre las opciones disponibles (por ejemplo, `full`, `partial`, `deny`, `human`), un valor de `confidence` y un campo `reason`. El autor indica explícitamente que se trata de un modelo de política aprendido en el juego y no de un adaptador LoRA de Qwen.

## Capacidades

- Toma de decisiones discretas con distribución de probabilidad por opción: devuelve la alternativa elegida, las probabilidades de cada alternativa, la confianza y una justificación.
- Dirección de una empresa simulada durante 20 días laborables: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Detección de fraude en solicitudes de reembolso a partir de señales como el importe y la puntuación de fraude (`fraud_score`).
- Respuesta en formato JEV (`typesafe/jev-1.13`), con estructura tipada de preguntas y respuestas.
- Integración como cerebro del simulador mediante `ct.CompanyBrain.from_hub(...)` y ejecución directa en el juego con `connect-tycoon play --brain hf:...`.
- Operación en coreano (idioma declarado en la ficha).
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión ni audio.

## Casos de uso

- Simulación y evaluación de políticas de decisión: servir como referencia ("teacher") para comparar políticas de RL entrenadas sobre el mismo entorno, gracias a las métricas de beneficio, satisfacción y riesgo publicadas.
- Investigación en aprendizaje por refuerzo con recompensa multiobjetivo: el modelo es un caso práctico de PPO aplicado a un problema con tres objetivos en conflicto (beneficio, satisfacción y riesgo), útil para estudiar compensaciones entre ellos.
- Docencia y formación en RL: el proyecto incluye un cuaderno de Colab y vídeos de apoyo, lo que permite reproducir el entrenamiento paso a paso en un entorno educativo.
- Demostración interactiva de agentes de decisión: al integrarse en `connect-tycoon play`, puede ejecutarse como agente jugable frente a un CEO de reglas para ilustrar diferencias de comportamiento.
- Estudio de políticas de reembolso y fraude: el modelo decide entre reembolso total, parcial, denegación o revisión humana, lo que permite analizar umbrales de decisión y costes asociados (0,8 unidades monetarias por revisión humana).
- Desarrollo de entornos tipo Gymnasium: sirve como política de referencia para validar implementaciones de nuevos entornos de decisión empresarial con la interfaz JEV.
- Base para extensiones de investigación (por ejemplo, comparación con el modelo C1 de decisión empresarial mencionado por el autor), siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros). La información disponible incluye dos evaluaciones específicas del simulador.

Media sobre 40 meses no vistos previamente:

| Metrica | CEO de reglas | connect-ai-company-v2 |
|---|---|---|
| Beneficio mensual | 3.240.000 KRW (324만원) | 11.430.000 KRW (1143만원) |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,7 |
| Confirmaciones humanas excedidas | 37,8 | 12,2 |
| Dias de rotura de stock | 10,7 | 0,5 |

Resultados registrados en la partida guardada del juego (ejecución de evaluación distinta a la anterior):

| Metrica | Resultado |
|---|---|
| Beneficio mensual | 10.892.370 KRW (1089,237만원) |
| Satisfaccion del cliente | 95,77 % |
| Incidentes | 2,8 |
| Transacciones reales de prueba | 713, con 177 casos de fraude |
| Casos de fraude detectados | 156 |
| Reduccion de perdidas | 85,95 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La librería declarada es numpy, por lo que la política no requiere aceleración gráfica para ejecutarse, pero el tamaño del modelo no se especifica.
- GPU recomendadas: no disponible; no se documenta dependencia de GPU.
- Compatibilidad con GPU de consumo: no disponible, aunque por la naturaleza de la librería (numpy) no se espera que sea un requisito.
- Opciones de despliegue: paquete `connect-tycoon` (extra `game`) mediante `pip install "connect-tycoon[game]"`, carga con `ct.CompanyBrain.from_hub(...)` o ejecución en el juego con `connect-tycoon play --brain hf:LeeSanghyun/connectailab-rl-LeeSanghyun-v2-teacher`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de RL para decisión empresarial sobre simuladores) con parámetros, contexto o licencia que permitan una comparación rigurosa. El único punto de referencia documentado en la propia model card es el "CEO de reglas" del simulador, incluido en la tabla de benchmarks.

## Limitaciones y advertencias

- Es un modelo educativo construido sobre un simulador sintético de empresa; el propio autor advierte que no garantiza ni predice resultados de gestión reales.
- El alcance es específico del dominio: solo resuelve decisiones del entorno CONNECT TYCOON con su configuración declarada, no tareas generales.
- Está entrenado y orientado al coreano; no se documentan capacidades en otros idiomas.
- No es un modelo de lenguaje ni un adaptador LoRA de Qwen; no debe esperarse generación de texto libre ni razonamiento general.
- Riesgo de sobreajuste al simulador: las métricas publicadas corresponden a evaluaciones internas sobre entornos nuevos del mismo simulador, no a escenarios externos.
- El modelo no especifica su topología, tamaño ni formato de pesos, lo que limita la auditoría técnica y la reproducibilidad independiente.
- Las dos tablas de resultados proceden de ejecuciones de evaluación distintas (40 meses frente a la partida guardada) y no son directamente comparables entre sí.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y de autoría. El proyecto remite a su fichero NOTICE para el origen y las condiciones de los datos.
- Sin descargas ni "likes" registrados en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v2-teacher
- Repositorio del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Aviso legal y origen de datos (NOTICE): https://github.com/wonseokjung/connect-tycoon/blob/main/NOTICE
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Perfil del autor en HuggingFace: https://huggingface.co/LeeSanghyun
- Formato JEV referenciado: `typesafe/jev-1.13` (no se ha localizado un enlace directo en la información proporcionada)
