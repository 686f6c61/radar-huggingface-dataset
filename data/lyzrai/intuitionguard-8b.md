# LyzrAI/IntuitionGuard-8B

## Resumen

IntuitionGuard-8B es un adaptador LoRA de rango 16 sobre el modelo Ministral-3-8B-Instruct-2512 de Mistral AI, desarrollado por LyzrAI como un clasificador de seguridad para trayectorias de agentes de IA. El modelo recibe una trayectoria completa —la tarea del usuario, los razonamientos del agente, las llamadas a herramientas y sus salidas— y devuelve una única puntuación de probabilidad de inseguridad (`p_unsafe`). Su diseño es deliberadamente "alert-only": no bloquea acciones, sino que genera alertas para que una capa de política o un operador humano decida.

El modelo se presenta como el nivel de precisión de la familia IntuitionGuard, por delante del IntuitionGuard-3B en exactitud a costa de mayor latencia. Se entrena por destilación de dos guards abiertos (StepGuard-4B y AgentDoG1.5-4B) combinados con etiquetas gold sobre 6.000 trayectorias con licencias permisivas, sin usar salidas de modelos frontera. Se publican tres semillas de entrenamiento, con la semilla 0 como checkpoint principal y las semillas 1 y 2 en el subdirectorio `seeds/`, lo que permite un modo ensemble opcional.

La relevancia actual reside en la creciente necesidad de monitorizar agentes autónomos que ejecutan herramientas: los benchmarks R-Judge, ATBench y ATBench-Codex miden precisamente la capacidad de detectar trayectorias peligrosas. IntuitionGuard-8B iguala al mejor guard abierto publicado en los benchmarks de uso de herramientas y lo supera en R-Judge, con una latencia de una sola pasada forward de aproximadamente 100-180 ms por trayectoria en una L40S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral-3-8B-Instruct-2512) con adaptador LoRA de rango 16 sobre las proyecciones q, k, v, o, gate, up y down |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 16 (tamano del repo: 0,5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (prompts de evaluacion de hasta 8.192 tokens) |
| Tipos de cuantizacion | No disponible (entrenado y evaluado en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8.000 millones de parametros (Ministral-3-8B-Instruct-2512) en precision bf16. Sobre el se aplica un adaptador LoRA con rango 16, alpha 32 y dropout 0,05, entrenado sobre las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje; la torre de vision del modelo base no se modifica. La tarea es de clasificacion de texto: una unica pasada forward produce la probabilidad `p_unsafe`, sin generacion autoregresiva.

El entrenamiento utiliza un pool de 6.000 trayectorias: 4.000 de StepGuard-Data (`ninty-seven/stepguard_data`, Apache-2.0), 1.500 de `karanxa/agent-action-safety-dataset` (Apache-2.0) y 500 de AgentDrift (CC BY 4.0). El pool se decontamino contra todos los conjuntos de evaluacion mediante coincidencia exacta de tarea, solapamiento de 13-gramas y similitud de embeddings de la descripcion de la tarea. Las etiquetas objetivo combinan un 25% de etiqueta gold y un 75% de la media de `p_unsafe` de los dos guards abiertos usados como profesores (StepGuard-4B y AgentDoG1.5-4B), sin emplear salidas de modelos frontera. Se liberan tres semillas de entrenamiento; promediar las tres constituye un modo ensemble opcional con el triple de coste computacional.

## Capacidades

- Clasificacion de seguridad de trayectorias completas de agentes: recibe la tarea del usuario, los pensamientos del agente, las llamadas a herramientas y las salidas de estas, y devuelve una unica probabilidad `p_unsafe`.
- Deteccion de acciones peligrosas en entornos de uso de herramientas (tool-use), evaluada en ATBench y ATBench-Codex.
- Deteccion de trayectorias inseguras en escenarios de razonamiento y juicio, evaluada en R-Judge.
- Modo alert-only: no bloquea ni modifica la trayectoria, solo emite una puntuacion para que una capa de politica o un humano actue.
- Capacidad de ensemble: las tres semillas publicadas pueden promediarse para mejorar la precision a costa de tres pasadas forward.
- Soporte de trayectorias de hasta 8.192 tokens en las evaluaciones publicadas.
- Idioma: unicamente ingles.
- No dispone de generacion de texto libre, tool calling propio ni capacidades multimodales en la tarea entrenada (la torre de vision del base queda intacta pero no se entrena).

## Casos de uso

- Monitorizacion de agentes autonomos en produccion: el modelo se intercala como capa de evaluacion sobre cada trayectoria generada por un agente (por ejemplo, un agente que ejecuta comandos o llama a APIs) y emite `p_unsafe`; si supera un umbral, se escala a un revisor humano o a una politica de bloqueo. Es adecuado porque su latencia de una sola pasada (100-180 ms en L40S) permite evaluar trayectorias en linea.
- Auditoria posterior de registros de agentes: dado un log de interacciones agente-herramienta, el modelo puntua cada trayectoria para priorizar la revision manual de las mas sospechosas, reduciendo el volumen de casos a inspeccionar.
- Capa de seguridad en pipelines de CI/CD para agentes de codigo: antes de fusionar o desplegar cambios propuestos por un agente de codigo, se evalua la trayectoria completa (razonamientos y comandos ejecutados) y se alerta si contiene acciones de riesgo, como escrituras fuera del repositorio o ejecucion de comandos destructivos.
- Filtrado de datos para entrenamiento de agentes: las trayectorias etiquetadas como seguras por el modelo pueden usarse para construir datasets de ajuste fino, mientras que las marcadas como inseguras se descartan o revisan.
- Evaluacion de proveedores de agentes: una organizacion que contrata agentes de terceros puede puntuar muestras de sus trayectorias con IntuitionGuard-8B y comparar la tasa de alertas entre proveedores antes de adoptarlos.
- Investigacion en seguridad de agentes: el modelo sirve como baseline reproducible (con tres semillas y harness documentado) para comparar nuevas tecnicas de deteccion de trayectorias inseguras en R-Judge, ATBench y ATBench-Codex.
- Ensemble de alta precision en entornos de baja frecuencia: cuando el coste de un falso negativo es alto y el volumen de trayectorias es moderado, promediar las tres semillas ofrece la maxima exactitud reportada (R-Judge 92,3% a umbral 0,5) a cambio de tres pasadas forward.

## Benchmarks y rendimiento

Resultados del harness propio del autor (AUROC / exactitud a umbral 0,5, conjuntos completos). Los guards publicados se puntuaron con los prompts de sus propias model cards.

| Conjunto (n) | AgentDoG-4B | StepGuard-4B | AgentDoG1.5-4B | AgentDoG1.5-Unified-4B | seed 0 | seed 1 | seed 2 | ensemble 3 semillas |
|---|---|---|---|---|---|---|---|---|
| R-Judge (571) | .967 / 88,4 | .932 / 89,5 | .970 / 90,4 | .957 / 90,0 | .985 / 90,9 | .979 / 91,6 | .972 / 92,8 | .979 / 92,3 |
| ATBench (1.000) | .603 / 60,2 | .787 / 73,0 | .741 / 67,4 | .844 / 78,3 | .823 / 71,9 | .823 / 67,9 | .836 / 73,0 | .834 / 71,3 |
| ATBench-Codex (500) | .833 / 80,2 | .843 / 78,2 | .874 / 77,4 | .893 / 83,2 | .918 / 82,8 | .904 / 78,0 | .911 / 81,0 | .920 / 81,4 |
| ASSEBench strict (1.476) | .875 / 79,7 | .732 / 68,0 | .871 / 75,9 | .831 / 79,5 | .877 / 66,1 | .871 / 72,8 | .882 / 75,3 | .881 / 71,6 |
| ATBench-Claw, formato nativo (500) | .915 / 85,8 | .886 / 81,2 | .866 / 77,1 | .891 / 88,8 | .915 / 81,2 | .928 / 78,8 | .915 / 76,6 | .921 / 78,8 |
| TraceSafe-Bench (1.170), AUROC | .460 | .523 | .556 (n = 1.122) | .580 | .525 | .563 | .566 | .550 |

Notas del autor: el modelo supera a AgentDoG-4B, StepGuard-4B y AgentDoG1.5-4B en ranking (AUROC) en ATBench y ATBench-Codex en las tres semillas, y supera a AgentDoG1.5-Unified-Qwen3.5-4B (el guard abierto mas fuerte publicado) en R-Judge en todas las semillas (+0,015 a +0,027). Empata con el Unified 4B en ATBench y ATBench-Codex y queda por detras en exactitud a umbral fijo 0,5 en ATBench (5-10 puntos) y ASSEBench (4-13 puntos). TraceSafe-Bench queda cerca del azar para todos los guards evaluados, incluido este, y el autor lo declara fuera de alcance.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 8.000 millones de parametros; en bf16 requiere aproximadamente 16 GB solo para pesos, mas memoria para activaciones y el contexto de hasta 8.192 tokens. La cuantizacion a 8 bits o 4 bits reduce el requisito, aunque el autor no publica configuraciones cuantizadas.
- GPU recomendadas: L40S (latencia medida de 100-180 ms por trayectoria en bf16) y A10G (320-600 ms por trayectoria). Para el modo ensemble de tres semillas, el coste es el triple.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 4090) en bf16, siempre que se ajuste el contexto; en GPUs de 16 GB seria necesaria cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT sobre Ministral-3-8B, se puede servir con vLLM, TGI o transformers cargando el adaptador LoRA; el autor no documenta configuraciones especificas de despliegue.
- Latencia y throughput: una sola pasada forward por trayectoria, sin generacion. Mediana de 100-180 ms por trayectoria en L40S y 320-600 ms en A10G para prompts de hasta 8.192 tokens en los conjuntos principales; el ensemble multiplica por tres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R-Judge (AUROC / acc.) | ATBench (AUROC / acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IntuitionGuard-8B (ensemble) | 8B (LoRA r=16) | No disponible (evaluado hasta 8.192 tokens) | .979 / 92,3 | .834 / 71,3 | Apache-2.0 | Hugging Face (LyzrAI) |
| AgentDoG1.5-Unified-Qwen3.5-4B | 4B | No disponible | .957 / 90,0 | .844 / 78,3 | Apache-2.0 (segun el autor) | Abierto |
| AgentDoG1.5-4B | 4B | No disponible | .970 / 90,4 | .741 / 67,4 | Apache-2.0 | Abierto |
| StepGuard-4B | 4B | No disponible | .932 / 89,5 | .787 / 73,0 | Apache-2.0 | Abierto |
| AgentDoG-4B | 4B | No disponible | .967 / 88,4 (publicado 92,2) | .603 / 60,2 | Apache-2.0 | Abierto |

IntuitionGuard-8B lidera en R-Judge (AUROC y exactitud en ensemble) y empata en AUROC con el Unified 4B en ATBench y ATBench-Codex, pero queda por detras de este en exactitud a umbral 0,5 en ATBench y ASSEBench. Su principal desventaja frente a los guards de 4B es el mayor coste computacional (8B frente a 4B) y la latencia; su ventaja es el mejor ranking en R-Judge y una latencia de una sola pasada sin generacion.

## Limitaciones y advertencias

- Modelo unicamente en ingles; no se ha entrenado ni evaluado en otros idiomas.
- Rendimiento cercano al azar en TraceSafe-Bench (AUROC 0,55 en ensemble), que el propio autor declara fuera de alcance; no debe usarse para trazas de agentes web con las doce categorias de fallo de ese benchmark.
- Por detras del AgentDoG1.5-Unified-4B en exactitud a umbral fijo 0,5 en ATBench (5-10 puntos) y ASSEBench (4-13 puntos); el umbral 0,5 no es optimo para todos los dominios y conviene calibrarlo.
- Es un adaptador LoRA: requiere cargar el modelo base Ministral-3-8B-Instruct-2512 (Apache-2.0) ademas del adaptador; el repo del adaptador ocupa 0,5 GB.
- Disenado como alert-only: no bloquea acciones por si mismo, por lo que su valor depende de la capa de politica o del revisor humano que consuma las alertas.
- Riesgo de alucinacion y falsos negativos inherente a un clasificador: una trayectoria peligrosa puede recibir `p_unsafe` bajo; el autor no reporta tasas de falsos positivos/negativos por categoria.
- El pool de entrenamiento se destilo de dos guards abiertos, por lo que hereda sus sesgos y puntos ciegos; no se usaron modelos frontera.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base y de los datasets de entrenamiento (Apache-2.0 y CC BY 4.0).
- Sin datos publicados sobre cuantizacion, contexto maximo oficial ni configuraciones de despliegue en produccion; el autor solo reporta latencias en L40S y A10G.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LyzrAI/IntuitionGuard-8B
- Modelo hermano IntuitionGuard-3B: https://huggingface.co/LyzrAI/IntuitionGuard-3B
- Modelo base Ministral-3-8B-Instruct-2512: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Dataset StepGuard-Data: https://huggingface.co/datasets/ninty-seven/stepguard_data
- Dataset agent-action-safety: https://huggingface.co/datasets/karanxa/agent-action-safety-dataset
