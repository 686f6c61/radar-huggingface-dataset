# MatterWaveAI/s1-grt-jepa

## Resumen

S1-GRT-JEPA es un modelo de clasificación de texto desarrollado por MatterWaveAI, construido sobre la arquitectura fundacional rotacional HELMHOLTZ-1. Se presenta como un juez de mundo latente (world-model judge), enrutador de acciones para control predictivo de modelos (MPC) y barandilla de seguridad para agentes. Su propuesta central es sustituir la clasificación estática de prompts y llamadas a herramientas por una simulación de las consecuencias de cada acción candidata en un espacio latente rotacional, sin decodificación autorregresiva de tokens.

El modelo está orientado a tareas de seguridad de agentes: detección de inyección de prompts embebida en salidas de herramientas, enrutamiento de la siguiente acción de un agente entre un conjunto de herramientas predefinidas y verificación de invariantes de objetivo. Según la model card, emplea únicamente transformaciones ortogonales (rotaciones con determinante +1) y declara cero matrices lineales densas y cero capas convolucionales.

La relevancia del modelo radica en su supuesta invariancia exacta al orden de opciones (consistencia del 100% bajo permutación) y en su resistencia al colapso de representación sin negativos contrastivos. No obstante, en el momento de redactar esta ficha los pesos y el código fuente no están publicados: la model card indica que se retienen durante un ciclo de liberación por fases para evitar la evasión de la barandilla en caja blanca. El número de parámetros, la longitud de contexto y los idiomas soportados no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional (JEPA sobre HELMHOLTZ-1); transiciones ortogonales, sin capas lineales densas ni convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados en la version inicial) |

## Arquitectura y entrenamiento

S1-GRT-JEPA se apoya en HELMHOLTZ-1, una arquitectura fundacional rotacional. Cada bloque del codificador y del predictor de transiciones es una cascada de rotaciones ortogonales con determinante +1, de modo que la dinámica latente se modela como `z_hat_{t+1} = R(a_t) z_t` sobre el grupo de Lie SO(n). El modelo realiza un lookahead de 1 a H pasos (evaluado con H = 1..2 y estabilidad comprobada hasta H = 10) y puntúa cada transición de estado de forma independiente en el espacio latente, lo que según el autor garantiza invariancia exacta al orden de las opciones.

El entrenamiento se describe como JEPA (Joint Embedding Predictive Architecture) sin negativos contrastivos, con objetivos de ortogonalidad EMA sobre el grupo de Lie. La model card reporta una calibración inicial en tres oleadas sobre hardware, con una reducción de la pérdida de validación de 1,7168 a 1,2505 (-27,2%), y una evaluación sobre 2.829 ítems de test retenidos, de los cuales 1.123 corresponden a 11 dominios de razonamiento, triaje y verificación. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto con salida de decisión única: APPROVE, REJECT o ESCALATE.
- Enrutamiento de acciones de agente (MPC): selecciona la siguiente herramienta entre candidatas como `search_code`, `read_file`, `edit_file`, `run_tests`, `ask_human` o `done`, minimizando la distancia geodésica al estado objetivo.
- Lookahead latente de trayectorias de 1 a H pasos sin decodificación autorregresiva de tokens.
- Detección de inyección de prompts y deriva de agente midiendo la divergencia de la trayectoria latente respecto a la variedad del objetivo original.
- Verificación de invariantes de seguridad y de prerrequisitos en planes multi-paso.
- Invariancia exacta al orden de opciones (consistencia de permutación de 1.000).
- Recuperación de dinámica inversa analítica sin pasos de gradiente (100% Top-1 reportado).
- Sensibilidad a acciones no conmutativas (el orden de ejecución altera el estado predicho).
- No se documentan capacidades multilingües, de visión, audio ni de generación de texto libre.

## Casos de uso

- Barandilla de seguridad para agentes de código: antes de ejecutar `edit_file` o `run_tests`, el modelo simula el estado resultante y rechaza o escala acciones que violen invariantes del repositorio o del objetivo del usuario.
- Defensa frente a inyección indirecta de prompts: al leer archivos, páginas web o logs no confiables, mide la divergencia latente respecto al objetivo original y redirige al agente a una ruta segura o a escalado humano.
- Enrutamiento de herramientas en pipelines agénticos: dado el estado y el objetivo, selecciona en una sola pasada paralela la herramienta siguiente entre un conjunto fijo, reduciendo la latencia frente a jueces generativos.
- Verificación de planes multi-paso: comprueba que una secuencia de acciones alcanza el objetivo con distancia geodésica inferior a 1e-5 en H = 2 saltos, útil en orquestadores de tareas.
- Triaje y clasificación de evidencia: evalúa si una afirmación está respaldada por la evidencia aportada (dominio de soporte de especificación y evidencia, con precisión de frontera del 97,50% reportada).
- Verificación de razonamiento causal y sentido común físico: clasifica explicaciones causales y predicciones de física intuitiva en pipelines de evaluación automática.
- Inducción de reglas en rejillas visual-espaciales: aplicado a la partición ARC-AGI-2 reportada, para validar transformaciones de reglas en tareas de razonamiento abstracto.
- Control de deriva en agentes de larga duración: monitoriza la trayectoria latente a lo largo de múltiples pasos y dispara escalado cuando la desviación supera un umbral.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no verificables de forma independiente, ya que los pesos no están publicados):

| Suite de evaluacion | n | Perdida latente | Top-1 | Consistencia de orden |
|---|---:|---|---:|---:|
| Verificación de rollout relacional multi-salto (2..3 saltos) | 60 | 3,2542 -> 0,1596 | 100,00% | 100,0% |
| Verificación causal y sentido común físico | 60 | 3,1878 -> 0,1146 | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 60 | Inducción de rotor latente | 100,00% | 100,0% |
| Enrutamiento MPC y defensa ante inyección | 103 | Lookahead H = 1..2 | 99,03% | 100,0% |
| Planificación con haz dirigida a objetivo (H = 2) | Secuencia exacta | d_geo < 1e-5 | 100,00% | 100,0% |

Invariantes de dinámica rotacional:

| Diagnostico | Objetivo | Resultado |
|---|---|---|
| Capas lineales densas / convolucionales | 0 / 0 | 0 / 0 (100% ortogonal) |
| Retención de rango efectivo sin negativos contrastivos | >= 85,0% | 99,4% (23,62 / 23,76 erank) |
| Deriva de ortogonalidad EMA tras 100 pasos | < 1e-6 | 1,42e-14 (det = +1,000000) |
| Estabilidad de rollout H = 10 | < 1e-5 | 1,19e-7 |
| Dinámica inversa analítica sin gradiente | Recuperación exacta | 100,0% Top-1 (error 8,43e-8) |
| Sensibilidad a acciones no conmutativas | Sensible al orden | 100,0% (divergencia 2,65) |

Calibración inicial en 11 dominios de juez System-1 (2.829 ítems de test, 1.123 registros tras calibración):

| Dominio | n | Precision | Precision de frontera | AUROC | ECE |
|---|---:|---:|---:|---:|---:|
| Ciencia causal y sentido común | 120 | 83,33% | 83,33% | 0,6725 | 0,1642 |
| Soporte de especificación y evidencia | 180 | 81,11% | 97,50% | 0,7783 | 0,3844 |
| Verificación socrática multimodo | 400 | 67,25% | 71,58% | 0,6450 | 0,3 (truncado en la información disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el número de parámetros no se publica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` y con endpoints; no se documentan vLLM, llama.cpp, Ollama ni TGI. El tag `endpoints_compatible` sugiere despliegue mediante Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles. El autor destaca que el enrutamiento se realiza en una sola pasada paralela sin decodificación autorregresiva, lo que en principio reduce la latencia frente a jueces generativos, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| S1-GRT-JEPA (MatterWaveAI) | Juez JEPA rotacional / enrutador MPC | no disponible | no disponible | Apache 2.0 | No (retenidos en la version inicial) |
| Jueces generativos basados en LLM causal (p. ej. Llama Guard, Qwen como juez) | Clasificación generativa | 1B-70B según variante | 8K-128K | Varía (Llama, Apache 2.0) | Sí |
| Clasificadores de seguridad estáticos (p. ej. modelos BERT/RoBERTa afinados) | Clasificación encoder | 100M-500M | 512-4K | Varía | Sí |

No se dispone de datos públicos de benchmarks comparables directos entre S1-GRT-JEPA y estas alternativas; las cifras de la tabla de benchmarks proceden exclusivamente de la model card del autor.

## Limitaciones y advertencias

- Pesos y código fuente no publicados en la versión inicial: no es posible reproducir ni verificar de forma independiente ninguno de los resultados reportados.
- Los benchmarks presentados proceden del propio autor y no han pasado por revisión por pares ni evaluación externa.
- El rendimiento en verificación socrática multimodo es bajo en precisión (67,25%) y el error de calibración (ECE) es elevado en varios dominios (hasta 0,3844 en soporte de evidencia), lo que indica probabilidades mal calibradas para umbrales de producción.
- El AUROC en varios dominios es moderado (0,6450-0,7783), lo que limita su uso como discriminador fino en entornos de alto riesgo.
- No se documentan idiomas soportados; no hay evidencia de capacidades multilingües.
- No se documenta la longitud de contexto, lo que impide planificar su integración en pipelines con observaciones largas.
- Riesgo de alucinación en la simulación latente: el modelo predice estados futuros, no los verifica contra el entorno real, por lo que un error de dinámica puede aprobar una acción insegura.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos hace que esa licencia sea inaplicable en la práctica hasta la liberación.
- El conjunto de herramientas candidatas parece fijo y predefinido; no se documenta cómo se extiende a herramientas nuevas.
- No se especifican sesgos conocidos ni la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- Modelo base HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- Modelos de MatterWaveAI en Hugging Face: https://huggingface.co/models?other=matterwave
