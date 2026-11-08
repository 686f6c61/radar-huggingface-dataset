# MatterWaveAI/s1-grt-mamba

## Resumen

S1-GRT-Mamba es un modelo de clasificación de texto y enrutamiento de acciones para agentes, desarrollado por MatterWaveAI y construido sobre el modelo base MatterWaveAI/helmholtz-mamba-1. Se presenta como un "juez" de world-model con estado recurrente rotacional de memoria constante, orientado a la monitorización continua de telemetría y trazas de agentes autónomos, la defensa frente a inyección de prompts y el control predictivo de acciones (MPC). Su propuesta central es sustituir la caché KV de atención cuadrática por un estado recurrente ortogonal de tamaño fijo, lo que permite procesar secuencias de longitud arbitraria con coste O(1) por paso.

La arquitectura combina recurrencia de espacio de estados selectiva con transiciones ortogonales en SO(D_h) y una componente de lookahead latente tipo JEPA, sin matrices lineales densas ni capas convolucionales 1D/2D según la model card. El modelo se distribuye como text-classification en la librería transformers, con licencia Apache 2.0, y declara capacidades de verificación de rollouts multi-salto, inducción de reglas en rejillas visuales-espaciales y planificación dirigida a objetivos.

Es relevante ahora porque ataca un cuello de botella práctico en sistemas de agentes en producción: el coste de memoria y latencia de mantener contexto largo en flujos de miles de pasos. No obstante, la model card indica que los pesos y el código fuente están retenidos durante un ciclo de publicación por etapas, por lo que el modelo no es utilizable todavía de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model (SSM) selectivo con transiciones ortogonales rotacionales (SO(D_h)) e inducción latente tipo JEPA; sin capas lineales densas ni convolucionales 1D/2D |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | Hasta 8.192+ tokens en flujo continuo (evaluado de T=64 a T=8.192); sin ventana fija por caché KV |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la publicación inicial) |

## Arquitectura y entrenamiento

El modelo se apoya en un bloque de espacio de estados selectivo, en la línea de Mamba (S6 con mecanismo de compuerta), pero sustituye las transiciones habituales por rotaciones ortogonales parametrizadas R(theta_t) en SO(D_h). Cada transición tiene determinante +1, lo que garantiza estabilidad unitaria a largo plazo: la model card reporta una deriva de norma del estado homogéneo inferior a 5,0e-7 en 1.000 pasos, evitando desvanecimiento o explosión del estado. El estado recurrente es de tamaño fijo (3,0 KB), con actualización en O(1) por evento y sin caché KV en modo SSM puro. Se ofrece además un modo híbrido que combina recurrencia SSM con atención rotacional, con una reducción declarada del 66,7% de caché KV y recall exacto en needle-in-haystack.

Sobre esa base, el modelo incorpora un componente de world-model latente tipo JEPA: desde el estado vivo h_t se ramifican en paralelo K acciones candidatas (search_code, read_file, edit_file, run_tests, ask_human, done) y se simulan consecuencias causales a 1..H pasos en espacio rotacional latente antes de emitir un veredicto APPROVE, REJECT o ESCALATE. La model card declara invariancia total al orden de opciones y retención de rango efectivo JEPA superior al 96% sin negativos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto y emisión de veredictos de seguridad (APPROVE / REJECT / ESCALATE) sobre acciones de agentes.
- Monitorización en streaming de trazas de agentes, logs de build y salidas de herramientas con memoria constante y sin recodificar el historial.
- Lookahead latente de trayectorias y enrutamiento de acciones mediante control predictivo (MPC) a H=1..2 pasos.
- Defensa frente a inyección de prompts embebida en observaciones de herramientas, con una precisión de enrutamiento declarada del 99,03%.
- Verificación de rollouts relacionales multi-salto (2..3 saltos) y de sentido común físico y científico.
- Inducción de reglas en rejillas visuales-espaciales (split de ARC-AGI-2) mediante rotores latentes.
- Planificación dirigida a objetivos con haces (beam planning) a H=2 saltos.
- Seguimiento de estado cíclico de largo horizonte (SO(2)^P) para T=64..8.192.
- Modo híbrido SSM + atención rotacional con recall exacto en needle-in-haystack.
- Soporte de tool calling implícito a través del enrutamiento de acciones candidatas; no se documenta un protocolo de function calling estándar.
- Capacidades multilingües: no disponible.

## Casos de uso

- Guardrail de agentes autónomos en producción: el modelo consume el flujo continuo de pasos, llamadas a herramientas y observaciones con estado fijo de 3,0 KB, emitiendo veredictos por paso sin que la memoria crezca con la longitud de la sesión. Adecuado para sesiones de miles de pasos donde una caché KV cuadrática sería inviable.
- Defensa frente a inyección de prompts en pipelines de herramientas: al ramificar el estado vivo sobre acciones candidatas y detectar secuestros embebidos en salidas de herramientas, puede colocarse como filtro previo a la ejecución de acciones sensibles como edit_file o run_tests.
- Enrutamiento de acciones en asistentes de código: con candidatos como search_code, read_file, edit_file, run_tests, ask_human y done, el modelo selecciona la siguiente acción mediante lookahead latente a 1-2 pasos, integrándose en bucles de agente tipo ReAct.
- Monitorización de telemetría y logs de build en tiempo real: el procesamiento O(1) por evento permite analizar streams de logs de CI/CD de longitud arbitraria sin ventanas deslizantes ni truncados, detectando desviaciones de estado.
- Verificación de planes multi-paso en sistemas de planificación: la comprobación de secuencias exactas de acciones con distancia geométrica inferior a 1e-5 sirve para validar planes generados por otro modelo antes de ejecutarlos.
- Evaluación reproducible e invariable al orden: la consistencia de opciones del 100% permite usar el modelo como juez en benchmarks de opción múltiple sin sesgo de posición, útil en evaluación automática de agentes.
- Control predictivo en robótica o sistemas embebidos simulados: el seguimiento de estado cíclico SO(2)^P y la estabilidad unitaria encajan en bucles de control donde la deriva del estado debe ser despreciable.

## Benchmarks y rendimiento

Datos declarados en la model card del autor (no verificados de forma independiente):

| Suite de evaluacion | n | Top-1 | Consistencia de orden |
|---|---:|---:|---:|
| Verificación de rollouts relacionales multi-salto (2..3 saltos) | 60 | 100,00% | 100,0% |
| Verificación de ciencia causal y sentido común físico | 60 | 100,00% | 100,0% |
| Inducción de reglas en rejilla visual-espacial (ARC-AGI-2) | 60 | 100,00% | 100,0% |
| Enrutamiento MPC de acciones y defensa ante inyección | 103 | 99,03% | 100,0% |
| Planificación con haces dirigida a objetivos (H=2) | secuencia exacta | 100,00% | 100,0% |
| Seguimiento de estado cíclico de largo horizonte (T=64..8.192) | streaming | 100,00% | 100,0% |

| Invariante / diagnostico | Objetivo | Resultado declarado |
|---|---:|---:|
| Capas lineales densas / conv 1D / conv 2D | 0 / 0 / 0 | 0 / 0 / 0 |
| Paridad entre prefix scan 2x2 paralelo y recurrencia O(1) | < 1e-5 | < 1,0e-6 |
| Determinante de la transición selectiva | +1,000000 | +1,000000000000 |
| Deriva de norma del estado homogéneo en 1.000 pasos | < 1e-6 | < 5,0e-7 |
| Crecimiento de caché KV (T=128 a 8.192, SSM puro) | 0 bytes | 0 bytes (estado fijo de 3,0 KB) |
| Retención de rango efectivo JEPA sin negativos | >= 90,0% | >= 96,0% |

No se han publicado resultados en la información disponible para benchmarks estándar de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: la model card declara compatibilidad con transformers y endpoints_compatible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card afirma coste O(1) de cómputo y memoria por evento en modo SSM puro, con estado fijo de 3,0 KB, pero no publica cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pesos publicos |
|---|---|---|---|---|---|
| S1-GRT-Mamba (MatterWaveAI) | no disponible | 8.192+ en streaming | SSM rotacional + JEPA, juez MPC | Apache 2.0 | No (retenidos) |
| S1-GRT-JEPA (MatterWaveAI) | no disponible | Ventana acotada, pase único | World-model JEPA con lookahead | no disponible | no disponible |
| HELMHOLTZ-Mamba-1 (MatterWaveAI) | no disponible | no disponible | SSM base, predecesor directo | no disponible | no disponible |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pesos y código fuente retenidos en el ciclo de publicación por etapas; el modelo no es desplegable actualmente pese a estar listado en Hugging Face.
- Resultados de benchmarks declarados por el autor y sin verificación externa; las cifras del 100% en varias suites deben interpretarse con cautela dado el tamaño reducido de las muestras (n entre 60 y 103).
- No se documentan datos sobre sesgos, composición del corpus de entrenamiento ni idiomas soportados.
- Riesgo de alucinación y de falsos negativos en la defensa frente a inyección de prompts: la precisión declarada del 99,03% implica una tasa de error no nula en un componente de seguridad.
- El lookahead MPC evaluado se limita a H=1..2 pasos; no se documenta comportamiento a horizontes mayores.
- Sin cifras de latencia, throughput ni requisitos de memoria absolutos, no es posible dimensionar infraestructura de producción.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos disponibles no puede ejercerse dicho uso.
- La orientación a clasificación y enrutamiento implica que no es un modelo generativo de propósito general; no se declaran capacidades de conversación, código o matemáticas en formato generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- Modelo relacionado S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- Referencia general sobre arquitectura Mamba: https://www.geeksforgeeks.org/artificial-intelligence/what-is-a-mamba-model/
