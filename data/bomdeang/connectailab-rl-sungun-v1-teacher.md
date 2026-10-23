# Bomdeang/connectailab-rl-sungun-v1-teacher

## Resumen

`Bomdeang/connectailab-rl-sungun-v1-teacher` es una política de refuerzo profundo (deep reinforcement learning) desarrollada por el autor Bomdeang dentro del proyecto Connect Tycoon / CONNECT AI LAB. No es un modelo de lenguaje generativo, sino un "cerebro" de toma de decisiones que opera una empresa simulada durante un mes de juego (20 días laborables) y responde a consultas estructuradas en el formato JEV (`typesafe/jev-1.13`). Gestiona decisiones de asignación de personal, reposición de inventario, marketing, atención al cliente, devoluciones y seguridad.

El modelo se entrenó en dos fases según la model card: primero imitación de un "presidente basado en reglas" (aprendizaje supervisado) y después ajuste con PPO utilizando una recompensa compuesta por los valores de la empresa (beneficio, satisfacción del cliente y evitación de riesgo, con peso 1.0 cada uno). La model card reporta que, promediando 40 meses iniciales nunca vistos, la política supera ampliamente a la línea base de reglas en beneficio, satisfacción, incidentes de riesgo, derivaciones a revisión humana y días de rotura de stock.

Es relevante como ejemplo práctico y didáctico de RL aplicado a decisiones empresariales con observaciones y acciones tipadas, y como posible política "maestra" para destilación (el sufijo `teacher` del identificador lo sugiere, aunque la model card no documenta ese uso). El artefacto se distribuye con licencia Apache-2.0, está etiquetado únicamente en coreano y se carga mediante la librería `numpy`, lo que implica una inferencia muy ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; la model card no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no procesa texto libre; recibe un estado estructurado en JSON/JEV) |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas (los pesos se sirven para `numpy`) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (la librería declarada es `numpy`; la model card no especifica extension ni estructura de los ficheros) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "córtex prefrontal" que sustituye al presidente de una empresa en el simulador Connect Tycoon. La interfaz es puramente estructurada: recibe un objeto con `state` (por ejemplo, departamento, motivo, tramo de cliente, importe, puntuación de fraude) y `questions` con el tipo de pregunta (`choice`), las instrucciones y los criterios de cada opción; devuelve la opción elegida junto con la distribución de probabilidad sobre todas las alternativas y un nivel de confianza. En el ejemplo publicado, ante una solicitud de devolución con `fraud_score` 0.111, la política asigna 0.9921 de probabilidad a "reembolso total", 0.0074 a "revisión humana" y 0.0003 a cada una de las otras dos opciones.

El entrenamiento consta de dos etapas declaradas: aprendizaje supervisado a partir de un presidente basado en reglas y ajuste posterior con PPO usando la recompensa derivada de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, cada uno con peso 1.0). No se indican en la información disponible el número de parámetros, la arquitectura interna de la red, el volumen de episodios de entrenamiento, la semilla ni los hiperparámetros de PPO. La configuración de empresa usada en la evaluación sí está publicada (`warehouse` 250, `base_demand` 40, `unit_cost` 1.5, `order_scale` 1.0, `wage` 0.0, `ad_power` 1.0, entre otros), lo que permite reproducir el entorno de referencia.

## Capacidades

- Toma de decisiones discretas de negocio: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, reembolsos y decisiones de seguridad.
- Salida probabilística calibrada: devuelve la distribución completa sobre las opciones (`probabilities`) y un campo `confidence`, útil para umbrales de derivación a humano.
- Cumplimiento de esquema JEV (`typesafe/jev-1.13`): las respuestas son JSON tipado y validable, lo que facilita su integración en pipelines.
- Política multiobjetivo: optimiza simultáneamente beneficio, satisfacción del cliente y reducción de incidentes de riesgo.
- Integración con el simulador y el juego: carga directa mediante `CompanyBrain.from_hub(...)` y modo interactivo `connect-tycoon play --brain hf:...`.
- No soporta generación de texto libre, tool calling, visión, audio ni razonamiento multi-paso fuera del esquema de pregunta/respuesta definido.

## Casos de uso

- Evaluación comparativa de políticas de RL: usar el modelo como referencia entrenada frente a agentes propios en Connect Tycoon, con la métrica de 40 meses iniciales como protocolo de comparación reproducible.
- Destilación de políticas: al tratarse de una política "maestra" (`teacher`), puede emplearse para generar etiquetas de decisión sobre estados muestreados del simulador y entrenar un alumno más pequeño; la model card no documenta este flujo, por lo que requeriría validación propia.
- Docencia de RL con PPO: el cuaderno de Colab enlazado permite ejecutar el ciclo completo de entrenamiento e inferencia, y el modelo sirve como estado final de referencia para comparar curvas de aprendizaje.
- Investigación sobre recompensas multiobjetivo: la configuración de pesos (beneficio, satisfacción, riesgo) permite estudiar el compromiso entre métricas modificando la recompensa y midiendo el desplazamiento de la política.
- Simulación de escenarios operativos: inyectar estados sintéticos (por ejemplo, devoluciones con distintos `fraud_score`) para estimar la tasa de aprobación y el coste esperado antes de desplegar una política en un entorno real.
- Componente de decisión en un juego o demo: el comando `connect-tycoon play` permite sentar al modelo como "presidente" y observar su comportamiento mes a mes, útil para material divulgativo o vídeos del proyecto.
- Pruebas de integración de esquemas tipados: validar implementaciones propias del protocolo JEV usando las respuestas del modelo como casos de prueba con distribución de probabilidad conocida.
- Automatización con umbral de confianza: derivar a revisión humana cuando `confidence` cae por debajo de un umbral, aprovechando la separación entre "reembolso total" y "revisión humana" que el modelo ya expresa de forma probabilística.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares), dado que no es un modelo de lenguaje. Sí incluye una evaluación en el simulador sobre la media de 40 meses iniciales:

| Métrica (media de 40 meses iniciales) | Presidente basado en reglas | jay-company (esta política) |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 17,19 M KRW |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Derivaciones por encima del límite de revisión humana | 69,5 | 14,8 |
| Días de rotura de stock | 9,1 | 0,4 |

No se dispone de desviación típica, número de semillas, intervalos de confianza ni de la metodología exacta de agregación; la cifra debe interpretarse como evaluación interna del autor en su propio simulador, no como resultado validado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible; al cargarse con `numpy` y ser una política de decisión, la inferencia puede ejecutarse íntegramente en CPU sin GPU dedicada.
- GPU recomendadas: no se especifica ninguna; no se requiere acelerador para inferencia. Para reentrenar con PPO sí sería recomendable una GPU, pero la información disponible no indica modelos concretos.
- Compatibilidad con GPU de consumo: el despliegue en inferencia no necesita GPU de consumo; cualquier equipo capaz de ejecutar Python y NumPy debería bastar, aunque no se publican requisitos mínimos de memoria RAM.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga desde el Hub con `CompanyBrain.from_hub`, modo interactivo `connect-tycoon play`, y ejecución en Google Colab mediante el cuaderno del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos públicos comparables de la misma categoría (políticas de RL para decisión empresarial en un simulador tipado). La única referencia cuantitativa es la línea base del propio proyecto:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-sungun-v1-teacher | Política RL (PPO) sobre estado JEV | no disponible | no aplica | 17,19 M KRW de beneficio, 96 % satisfacción, 1,9 incidentes (40 meses) | Apache-2.0 | Hugging Face |
| Presidente basado en reglas (Connect Tycoon) | Sistema experto determinista | no disponible | no aplica | 7,08 M KRW, 71 %, 11,5 incidentes (40 meses) | la del repositorio Connect Tycoon | Integrado en el simulador |
| Otros modelos de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un simulador sintético; la propia model card advierte que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- Evaluación realizada por el autor, en su propio entorno y con una única configuración de empresa publicada; no hay validación externa ni análisis de varianza entre semillas.
- Idiomas: las etiquetas, instrucciones y motivos del estado están en coreano; el modelo no procesa lenguaje natural libre y no se ha documentado comportamiento en otros idiomas.
- Dependencia fuerte del esquema: cualquier cambio en el formato JEV, en el conjunto de opciones o en la semántica de los campos requiere reentrenamiento o adaptación, y el modelo puede producir distribuciones no válidas ante estados fuera de distribución.
- Riesgo de sobreajuste a la recompensa declarada (beneficio, satisfacción y riesgo con peso 1.0): modificar los pesos o la configuración de la empresa puede degradar el comportamiento de forma no documentada.
- No es un modelo de lenguaje: no genera explicaciones; el campo `reason` del ejemplo es una etiqueta fija ("política de aprendizaje por refuerzo"), no una justificación textual. No debe presentarse como sistema explicable.
- Sesgos: no se documenta ningún análisis de sesgo, ni de equidad entre tramos de cliente (por ejemplo, clientes "nuevos" frente a recurrentes) en decisiones de reembolso.
- Licencia Apache-2.0: permite uso comercial y modificaciones con obligaciones de atribución y ausencia de garantía; conviene revisar también las condiciones del repositorio Connect Tycoon y del esquema JEV si se redistribuye.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y las fechas de creación y actualización registradas son de octubre de 2026; la madurez y el mantenimiento del proyecto no pueden verificarse con la información disponible.
- No se documenta el formato exacto de los pesos ni un proceso de verificación de integridad, lo que complica auditar el artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bomdeang/connectailab-rl-sungun-v1-teacher
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (sitio principal): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado en la model card: `typesafe/jev-1.13` (no se ha localizado URL pública en la información disponible)
- Imagen de cabecera del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Demostración visual del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
