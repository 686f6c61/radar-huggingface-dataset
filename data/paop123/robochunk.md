# PAOP123/robochunk

## Resumen

RoboChunk es un conjunto de checkpoints de PyTorch publicados por el usuario PAOP123 como parte de un estudio pre-registrado sobre *dynamic chunking* de inspiración H-Net aplicado a trayectorias de robots. No es un modelo de lenguaje ni un modelo fundacional de robótica de propósito general: es una reimplementación independiente (no afiliada a los autores originales de H-Net ni a Cartesia) de un mecanismo de segmentación dinámica de secuencias de acciones, entrenado sobre datos simulados de FetchPickAndPlace-v4 con un experto programado y fases de movimiento etiquetadas.

El repositorio contiene los pesos (`best.pt` en formato de *state dict* de PyTorch), configuraciones YAML, normalizadores y métricas de cada ejecución (`runs/<run_id>/`), correspondientes a un estudio con hipótesis pre-registradas (H1–H4 y sus versiones v2). El objetivo del trabajo es evaluar si un *router* aprendido puede superar a baselines fijos a la hora de decidir cuándo segmentar una trayectoria en *chunks*, midiendo métricas como F1 de fronteras, bits por paso, coincidencia con eventos del gripper y correlación entre novedad y ganancia.

Es relevante ahora por su enfoque metodológico: publicación de pre-registros con hashes SHA-256, un registro de decisiones, evidencia de marcas temporales de terceros y resultados negativos reportados de forma explícita (varias hipótesis fallan o quedan por debajo del umbral). Para investigadores en *behaviour cloning* y segmentación de trayectorias, constituye un artefacto reproducible y auditable más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net-style dynamic chunking (reimplementación independiente) sobre secuencias de trayectorias; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (las secuencias se procesan por episodios a 25 Hz; N de chunk evaluado en 5, 10 y 20) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión nativa de PyTorch) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state dict` (`best.pt`), acompañado de `config.yaml`, `norm.json`, `metrics.json`, `history.json`, `git.txt` |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma H-Net de *dynamic chunking*: un modelo que aprende a segmentar una secuencia temporal en *chunks* de longitud variable mediante un *router*, en lugar de usar una ventana fija. La implementación es independiente y no está afiliada a Sukjun Hwang, Brandon Wang, Albert Gu ni a Cartesia. El modelo se entrena con *behaviour cloning* sobre trayectorias de un experto programado en FetchPickAndPlace-v4, con fases de movimiento etiquetadas (approach, descend, close, lift, transport, open, retreat) que sirven como referencia para evaluar las fronteras predichas.

El estudio incluye variantes del *router*: uno aprendido estándar, uno "refractory" (explorado en v1 y testeado en v2) y baselines fijos, de velocidad y de mínimos de velocidad. Los datos de entrenamiento son simulados (publicados en el dataset `PAOP123/robochunk-sim`); los checkpoints de robot real no se publican. El diseño experimental es pre-registrado con hashes SHA-256 verificables y admite enmiendas documentadas (Amendment 1 antes de cualquier resultado principal). No se dispone de información sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO; el entrenamiento es de imitación supervisada, no de refuerzo con preferencias humanas.

## Capacidades

- Segmentación dinámica de trayectorias robóticas en *chunks* de longitud variable mediante un *router* aprendido.
- Predicción de fronteras de fase de movimiento (evaluada con F1 a ±3 pasos).
- Compresión de secuencias medida en bits por paso, con control de la tasa de compresión.
- Detección de eventos relevantes (p. ej. eventos del gripper) con enriquecimiento sobre el azar (1.5×–1.9× según configuración y dataset).
- Puntuación de novedad de candidatos, con correlación de Spearman ρ = 0.782 frente a la ganancia real en 11 candidatos limpios.
- Soporte de *tool calling* / *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de LLM; el *router* opera paso a paso sobre la secuencia.
- Capacidades multilingües: no aplica.
- Capacidades especiales: enrutado con periodo refractario, baselines de entropía, evaluación en datasets SO-100, Koch y SO-101.

## Casos de uso

- Investigación en segmentación de trayectorias: usar los checkpoints y el código del repositorio para reproducir las hipótesis H1–H4 y comparar *routers* aprendidos con baselines fijos en FetchPickAndPlace-v4.
- Estudio de *behaviour cloning* con fases etiquetadas: emplear las etiquetas de fase (approach, descend, close, lift, transport, open, retreat) para analizar cómo un *router* aprende a alinear fronteras con transiciones reales.
- Evaluación de compresión de secuencias de acciones: medir bits por paso a distintos N (5, 10, 20) y contrastar con la tasa de compresión objetivo, como hace la hipótesis H2.
- Detección de eventos del gripper en datos de robot: aplicar el modelo a secuencias de SO-100, Koch o SO-101 para medir enriquecimiento sobre el azar cerca de eventos, con las salvedades reportadas (1.5×–1.9×, por debajo del umbral de 2× en varias pruebas).
- Puntuación de novedad de datos: usar los modelos `partb_*` para ordenar candidatos por novedad y priorizar la recolección de demostraciones, dado el ρ = 0.782 observado (con intervalo de confianza amplio [0.25, 0.95] post hoc).
- Auditoría metodológica de estudios pre-registrados: servir de ejemplo reproducible de pre-registro con hashes, registro de decisiones y evidencia de marcas temporales de terceros para cursos o revisiones de metodología.
- Prototipado de *chunking* en pipelines de imitación: integrar el *router* como módulo de segmentación previo a un política de control, siempre validando en el robot objetivo antes de producción.

## Benchmarks y rendimiento

Resultados reportados por el autor en `runs/results_*.json`. Los valores negativos en bits por paso indican compresión; las diferencias entre corchetes son intervalos de confianza.

| Test | Criterio | Resultado | Veredicto |
|---|---|---|---|
| H1 | *router* aprendido − cada baseline ≥ 0.10 F1 de fronteras (±3), IC excluye 0 | aprendido 0.358 vs fijo 0.594; diferencia −0.236 [−0.253, −0.219] | falla |
| H2 | bits/paso del aprendido < fijo en ≥ 2 de 3 N, compresión igualada | N=5: −13.165 vs −12.650; N=10: −13.150 vs −12.825; N=20: −13.208 vs −13.009 (compresión 15.5 < 0.8 N, cuenta como fallo) | pasa |
| H3 | ≥ 2× azar cerca de eventos del gripper, p < 0.01, en ambos datasets | SO-100 1.89× (p = 0.001); Koch 1.77× (p = 0.001) | significativo pero bajo umbral |
| H4 | Spearman ρ(novedad, ganancia) ≥ 0.6 sobre 11 candidatos limpios | ρ = 0.782 (p = 0.0045); IC 95% [0.25, 0.95] (post hoc); datos corruptos puntuados como más novedosos en 4 de 4 | pasa |
| H1-v2 | *router* refractario − cada baseline ≥ 0.10 F1 bruto (datos frescos) | vs fijo +0.042 [+0.023, +0.061] | falla (previsto) |
| H1b-v2 | diferencia corregida por azar (*circular shift*) > 0 frente a cada baseline, IC excluye 0 | vs fijo +0.103 [+0.084, +0.122]; la menor (vs mínimos de velocidad) +0.055 [+0.038, +0.072] | pasa |
| H3-v2 | *router* refractario, ≥ 2× azar cerca de eventos del gripper, SO-100 y Koch | SO-100 1.53× (p = 0.001); Koch 1.52× (p = 0.001) | no soportado |
| H3b-v2 | misma regla en dataset fresco (SO-101, 5 episodios de test) | 1.74× (p = 0.004) | falla |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 1.0 GB e incluye múltiples ejecuciones, por lo que un único checkpoint es sustancialmente menor.
- GPU recomendadas: no se especifican; el ejemplo de la model card ejecuta la evaluación en CPU (`torch.device("cpu")`).
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño reducido del checkpoint y la ejecución en CPU demostrada; no se publican requisitos mínimos.
- Opciones de despliegue: PyTorch nativo con el código de `robochunk-study` (clonar el repositorio e instalar `requirements.txt`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboChunk (este) | H-Net-style dynamic chunking para trayectorias | no disponible | no disponible | MIT | Pesos y código públicos |
| H-Net (Sukjun Hwang, Brandon Wang, Albert Gu) | Dynamic chunking original | no disponible | no disponible | no disponible | No evaluado aquí; RoboChunk no está afiliado |
| Baselines fijos / velocidad / mínimos de velocidad | Segmentación heurística | no aplica | no aplica | no aplica | Incluidos en el estudio como referencia |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación de trayectorias en la información proporcionada.

## Limitaciones y advertencias

- El *router* aprendido no supera al baseline fijo en F1 de fronteras (H1 falla: −0.236), por lo que no debe asumirse una mejora sobre heurísticas simples.
- La detección de eventos del gripper queda por debajo del umbral de 2× en varias configuraciones (H3, H3-v2, H3b-v2), con valores de 1.5×–1.9×.
- El intervalo de confianza de la correlación novedad-ganancia es amplio ([0.25, 0.95] post hoc) y los datos corruptos se puntúan como más novedosos en 4 de 4 casos, lo que limita el uso de la puntuación de novedad sin filtros adicionales.
- Entrenado únicamente con datos simulados de FetchPickAndPlace-v4; los checkpoints de robot real no se publican, por lo que la transferencia a hardware físico no está validada en el artefacto.
- Modelo de robótica, no de lenguaje: no soporta generación de texto, código, matemáticas ni capacidades multilingües.
- Licencia MIT permite uso comercial, pero el autor declara explícitamente no estar afiliado a los autores de H-Net ni a Cartesia; verificar la licencia y atribución del trabajo original antes de reutilizar la arquitectura.
- El hash de commit en `git.txt` es antiguo debido a una reescritura de historial; la trazabilidad debe apoyarse en los hashes de pre-registro y en la evidencia de marcas temporales, no en ese campo.
- Riesgo de alucinación: no aplica en el sentido de LLM; el riesgo equivalente es la producción de fronteras espurias, documentado en los resultados negativos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/PAOP123/robochunk
- Dataset simulado: https://huggingface.co/datasets/PAOP123/robochunk-sim
- Repositorio del estudio (código, pre-registros, registro de decisiones, informe): https://github.com/NapoleonPK/robochunk-study
- Paper referenciado en tags: arXiv:2507.07955
