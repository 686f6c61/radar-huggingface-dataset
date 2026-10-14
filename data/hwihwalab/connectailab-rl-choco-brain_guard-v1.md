# hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1

## Resumen

connectailab-rl-CHOCO-BRAIN_GUARD-v1 es un adaptador PEFT (LoRA) entrenado mediante aprendizaje por refuerzo profundo con PPO sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla Hwihwa Lab, un estudio independiente de investigación e ingeniería en IA, y está orientado a un nicho muy concreto: la toma de decisiones autónoma en defensa antifraude para comercio electrónico y FinTech. El autor lo describe como un "córtex prefrontal externo" para la empresa, es decir, un módulo de decisión que evalúa transacciones, solicitudes de reembolso y señales de riesgo en lugar de mantener una conversación generalista.

La propuesta técnica se apoya en el protocolo JEV (Judgment-Evaluation-Verification) y en una función de recompensa asimétrica que penaliza con dureza los incidentes de seguridad. Frente a un modelo genérico con pesos equilibrados (1.0 : 1.0 : 1.0), este adaptador fija un coeficiente de penalización de 3.0 sobre los incidentes, lo que lo empuja a bloquear operaciones sospechosas con umbrales mucho más agresivos que el estándar del sector. El modelo está pensado para ejecutarse en el dispositivo (on-device), sin depender de API en la nube.

Se distribuye como adaptador sobre un modelo de 0,8 mil millones de parámetros, con licencia Apache-2.0, soporte de inglés y coreano, y con una variante GGUF publicada aparte para Ollama y LM Studio. Su relevancia es acotada pero clara: cubre un caso de uso de nicho (agentes de decisión antifraude para pequeños operadores y solopreneurs) donde los LLM conversacionales fallan por verbosidad, latencia y alucinación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador PEFT/LoRA entrenado por RL (PPO) |
| Parametros totales | 0,8 mil millones en el modelo base (el repositorio contiene un adaptador; no se especifica el numero exacto de parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe una variante GGUF publicada en un repositorio aparte (hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF) |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); variante GGUF en repositorio separado |

Datos adicionales: pipeline declarado `reinforcement-learning`, etiquetas de dominio `fraud-detection`, `fin-tech`, `e-commerce`, `decision-making`, `multi-agent`, `on-device`. Tamano del repositorio: 0,0 GB.

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino un adaptador de bajo rango (LoRA) sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros. El entrenamiento se realiza con aprendizaje por refuerzo profundo usando PPO (Proximal Policy Optimization) dentro del simulador CONNECT_TYCOON, un entorno de operaciones empresariales estocasticas desarrollado por wonseokjung. El agente aprende una politica de decision (no de generacion conversacional) frente a eventos de negocio: transacciones, reembolsos, incidencias de atencion al cliente y senales de cumplimiento normativo.

La innovacion declarada es el protocolo JEV (Judgment-Evaluation-Verification), que estructura cada decision en tres fases: juicio inicial, evaluacion del riesgo y verificacion antes de actuar. La funcion de recompensa documentada es `Reward = 0,8 · (Profit/10) + 1,0 · (ΔSatisfaction × 100) − 3,0 · (Incidents × 5)`, lo que impone una aversion al riesgo mucho mayor que la de un modelo con pesos simetricos. De ahi derivan tres protocolos operativos: bloqueo duro cuando la puntuacion de fraude de una transaccion es ≥ 0,70 (frente al 0,95 habitual en el sector), derivacion automatica a revision humana en reembolsos con puntuacion ≥ 0,60, y escalado inmediato ante senales criticas de atencion al cliente (litigios, cumplimiento, amenazas de difamacion). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Toma de decisiones binarias y multicriterio sobre eventos de negocio (aprobar, bloquear, escalar) en lugar de generacion de texto libre.
- Deteccion de fraude transaccional con umbral de bloqueo fijado en puntuaciones ≥ 0,70.
- Aislamiento de solicitudes de reembolso sospechosas, con enrutado automatico a revision humana a partir de 0,60.
- Centinela legal y de cumplimiento: escalado ante senales de litigio, incumplimiento normativo o difamacion.
- Optimizacion de un objetivo compuesto de beneficio, satisfaccion del cliente y minimizacion de incidentes.
- Soporte multilingue limitado a ingles y coreano.
- Diseno para despliegue on-device y entornos multiagente.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, vision, audio, modo de razonamiento explicito ni capacidades de agente multi-paso generales.

## Casos de uso

- Filtrado antifraude en tiempo real en pasarelas de pago: el modelo evalua cada transaccion y aplica bloqueo duro por encima de 0,70 de puntuacion de riesgo, lo que permite cortar intentos de fraude antes de la autorizacion.
- Triaje de reembolsos en comercio electronico: ante una reclamacion de devolucion, el agente decide entre aprobacion automatica, aislamiento o derivacion a un humano, reduciendo la explotacion de politicas de reembolso por parte de usuarios abusivos.
- Guardia de cumplimiento para equipos de atencion al cliente: monitoriza conversaciones y escala automaticamente cuando detecta lenguaje asociado a litigios, reclamaciones regulatorias o amenazas reputacionales.
- Operacion autonoma para solopreneurs y microempresas: al ser un modelo de 0,8B con variante GGUF, puede ejecutarse en local sin coste recurrente de API, gestionando decisiones operativas del dia a dia (aprobaciones, incidencias, alertas) dentro de un micro-ERP.
- Simulacion y evaluacion de politicas de riesgo: el modelo y su variante `-teacher` pueden usarse como agentes de referencia en el simulador CONNECT_TYCOON para comparar politicas de gobernanza antes de desplegarlas en produccion.
- Despliegue en el borde con requisitos de privacidad: al no requerir nube, es apto para procesar datos financieros o de clientes en infraestructura propia o en dispositivos locales, reduciendo superficie de exposicion de datos personales.
- Prefiltro de bajo coste delante de un modelo mayor: por su tamano, puede actuar como primera etapa que descarta o marca casos evidentes y deja solo los dudosos a un sistema mas caro.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor, que no especifica metodologia estadistica completa. Se presentan tal cual, sin verificacion independiente:

| Metrica de evaluacion | Baseline basado en reglas | CHOCO-BRAIN_GUARD-v1 | Ventaja neta |
|---|---|---|---|
| Ataques de fraude detectados | 138 / 177 casos | 158 / 177 casos | +20 fraudes bloqueados |
| Perdida financiera prevenida | 68 % | 88 % de reduccion de perdida | +20 puntos porcentuales |
| Beneficio operativo mensual | 3,05 M KRW / mes | 10,62 M KRW / mes | +248 % |
| Gobernanza operativa | Reglas estaticas | Gobernanza prefrontal del riesgo | no cuantificado |

Condiciones declaradas de la evaluacion: 713 transacciones reales no vistas con tarjeta de credito, de las cuales 177 eran intentos de fraude confirmados, mas 40 meses de operaciones empresariales estocasticas. El autor afirma una latencia de decision de 0,05 segundos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir del tamano de 0,8B, no publicada por el autor): en FP16, aproximadamente 1,6 GB solo para pesos, mas 0,5-1 GB de overhead de runtime de atencion y cache; en cuantizacion de 4 bits, del orden de 0,5-0,8 GB. El adaptador LoRA anade un consumo marginal.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en GPUs con 4 GB de VRAM usando GGUF cuantizado.
- GPU de centro de datos (A100, H100) sobredimensionadas para este tamano; solo tendrian sentido para servir muchas instancias en paralelo.
- Opciones de despliegue: llama.cpp u Ollama y LM Studio mediante la variante GGUF publicada; vLLM o TGI son viables cargando el modelo base mas el adaptador PEFT, aunque no se documenta soporte oficial.
- Latencia y throughput: el autor declara 0,05 segundos por decision. No se publican cifras de throughput (tokens/s) ni de latencia bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparacion se limita a la relacion con el modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-CHOCO-BRAIN_GUARD-v1 | 0,8B (adaptador PEFT) | no disponible | Datos de fraude de la model card (158/177 detecciones declaradas) | Apache-2.0 | HuggingFace, mas variante GGUF |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher | no disponible | no disponible | no disponible | no disponible | HuggingFace, GitHub |
| Otros modelos de defensa antifraude de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho y muy especializado: su politica esta ajustada para un unico dominio (antifraude y decision operativa en e-commerce y FinTech). No debe usarse como asistente conversacional general ni como generador de texto.
- Los numeros de rendimiento (158/177 fraudes, 88 % de reduccion de perdida, +248 % de beneficio) son declaraciones del autor en su propia model card, sin evaluacion independiente ni detalle de intervalos de confianza. Tratalos como indicativos, no como evidencia contrastada.
- La latencia de 0,05 segundos declarada no especifica hardware, lote ni condiciones de carga; puede no reproducirse en produccion.
- La funcion de recompensa penaliza los incidentes con un peso de 3,0 y el umbral de bloqueo esta en 0,70 frente al 0,95 habitual. Esto implica un sesgo deliberado hacia falsos positivos: mas bloqueos legítimos, con el consiguiente coste en experiencia de cliente y friccion operativa.
- Cobertura linguistica limitada a ingles y coreano. No hay soporte declarado de castellano.
- Riesgo de alucinacion no evaluado en la informacion disponible; al ser un adaptador sobre un modelo de 0,8B, la capacidad de razonamiento general y de seguimiento de instrucciones complejas es reducida.
- Licencia Apache-2.0 en el repositorio, permisiva para uso comercial; sin embargo, conviene verificar la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la informacion proporcionada.
- Provenance del repositorio: el contenido del README esta escrito en clave de marketing y contiene afirmaciones no verificables ("zero latency", "cortex prefrontal"), lo que exige cautela adicional antes de llevarlo a produccion.
- Un modelo de 0,8B tiene techo bajo para tareas de razonamiento complejo, matices legales o casos limite; se recomienda mantener supervision humana en las decisiones de mayor impacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, coherente con un adaptador LoRA sin pesos completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1
- Variante teacher: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher
- Variante GGUF: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- README en coreano: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1/blob/main/README_KR.md
- Licencia: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1/blob/main/LICENSE
- Organizacion en HuggingFace: https://huggingface.co/hwihwalab
- GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Repositorio GitHub de la variante teacher: https://github.com/Hwihwa-Lab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher
- Releases de la variante teacher: https://github.com/Hwihwa-Lab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher/releases
- Simulador CONNECT_TYCOON: https://github.com/wonseokjung/connect-tycoon
