# LyzrAI/IntuitionGuard-3B

## Resumen

IntuitionGuard-3B es un adaptador LoRA de clasificación de texto desarrollado por LyzrAI para la evaluación de seguridad de trayectorias de agentes de IA. A partir del modelo base Ministral-3-3B-Instruct-2512, el modelo recibe una trayectoria completa de agente (la tarea del usuario, los razonamientos intermedios y las llamadas a herramientas junto con sus salidas) y devuelve una única puntuación `p_unsafe` en una sola pasada hacia delante, sin generación autoregresiva. Su diseño es de tipo alert-only: no bloquea acciones por sí mismo, sino que emite alertas para que una capa de política o un operador humano decida.

El modelo se enmarca en la familia IntuitionGuard y constituye la variante rápida de la misma, con un modelo hermano de 8B orientado a máxima precisión. Se entrena mediante destilación de dos guardas de agentes abiertas (StepGuard-4B y AgentDoG1.5-4B, ambas con licencia Apache-2.0) combinadas con etiquetas gold, sobre 6.000 trayectorias con licencias permisivas. No se emplearon salidas de modelos frontera en su construcción.

La relevancia actual del modelo reside en su relación entre coste y rendimiento: con 3B parámetros ofrece latencias de aproximadamente 53 ms por trayectoria en una L40S y supera a guardas de 4B en varios benchmarks de uso de herramientas, lo que lo hace adecuado para despliegues de monitorización de agentes en producción donde el throughput y la latencia son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral-3-3B-Instruct) con adaptador LoRA de rango 16 sobre las proyecciones q, k, v, o, gate, up y down |
| Parámetros totales | 3B en el modelo base; el adaptador LoRA se distribuye como pesos PEFT independientes (tamaño del repo: 0,3 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se publican en safetensors, presumiblemente bf16 como el base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r = 16, α = 32, dropout 0,05) aplicado sobre Ministral-3-3B-Instruct-2512-BF16 en precisión bf16. La tarea es de clasificación binaria de seguridad: se procesa la trayectoria completa como entrada y se obtiene una probabilidad `p_unsafe` en una única pasada hacia delante, sin decodificación generativa. El adaptador modifica las proyecciones de atención y de las capas feed-forward (q, k, v, o, gate, up, down).

El entrenamiento sigue la misma receta que IntuitionGuard-8B y se basa en destilación de dos guardas abiertas (StepGuard-4B y AgentDoG1.5-4B) mezcladas con etiquetas gold. El conjunto de datos comprende 6.000 trayectorias: 4.000 de `ninty-seven/stepguard_data` (Apache-2.0), 1.500 de `karanxa/agent-action-safety-dataset` (Apache-2.0) y 500 de AgentDrift (CC BY 4.0). Se aplicó descontaminación contra todos los conjuntos de evaluación mediante coincidencia exacta de tarea, solapamiento de 13-gramas y similitud de embeddings de la tarea. Se publican tres semillas de entrenamiento (semilla 0 en la raíz del repositorio, semillas 1 y 2 en `seeds/`).

## Capacidades

- Clasificación de seguridad de trayectorias de agentes: devuelve una puntuación `p_unsafe` para una trayectoria completa (tarea, pensamientos, llamadas a herramientas y salidas).
- Modo alert-only: emite alertas sin bloquear acciones, pensado para integrarse en una capa de política o para revisión humana.
- Inferencia de una sola pasada sin generación, lo que reduce latencia y coste computacional.
- Soporte de evaluación por ensemble: las tres semillas publicadas pueden combinarse para mejorar el AUROC.
- Especialización en trayectorias de uso de herramientas (tool calling) y razonamiento multi-paso de agentes.
- Idioma: únicamente inglés.
- No soporta visión, audio ni otras modalidades.

## Casos de uso

- Monitorización de agentes en producción: el modelo recibe cada trayectoria generada por un agente y emite una alerta cuando `p_unsafe` supera un umbral, permitiendo a una capa de política o a un operador humano intervenir. Su latencia de ~53 ms por trayectoria en L40S lo hace viable para inspección en línea.
- Filtrado previo en pipelines de agentes autónomos: al ser alert-only y no bloqueante, puede colocarse como primera barrera de bajo coste antes de guardas más pesadas o de revisión humana, reduciendo el volumen de trayectorias que llegan a la segunda etapa.
- Auditoría de registros de agentes: procesamiento por lotes de trayectorias históricas para detectar patrones de comportamiento inseguro y generar informes de riesgo.
- Evaluación de seguridad en CI/CD de agentes: integración en pipelines de pruebas para puntuar trayectorias sintéticas o de regresión y detectar degradaciones de seguridad antes de desplegar cambios.
- Investigación en seguridad de agentes: uso como baseline rápido y reproducible (tres semillas publicadas) para comparar con otras guardas en los mismos conjuntos de evaluación.
- Despliegue en hardware modesto: con ~8 GB de VRAM libre en bf16, puede ejecutarse en GPUs de consumo alto o en instancias cloud pequeñas, lo que facilita entornos de desarrollo y pruebas.
- Enrutamiento de alertas en sistemas multiagente: al ser rápido, puede aplicarse a cada subagente de un sistema para identificar qué componente genera trayectorias de mayor riesgo.

## Benchmarks y rendimiento

Resultados del harness propio de LyzrAI (AUROC / accuracy a umbral 0,5). Las guardas publicadas se puntuaron con el prompt de su propia model card.

| Conjunto (n) | AgentDoG-4B | StepGuard-4B | AgentDoG1.5-4B | Unified-4B | 3B semilla 0 | semilla 1 | semilla 2 | 3B ensemble |
|---|---|---|---|---|---|---|---|---|
| R-Judge (571) | .967 / 88,4 | .932 / 89,5 | .970 / 90,4 | .957 / 90,0 | .957 / 88,3 | .970 / 89,7 | .978 / 91,1 | **.972 / 91,1** |
| ATBench (1.000) | .603 / 60,2 | .787 / 73,0 | .741 / 67,4 | .844 / 78,3 | .812 / 69,0 | .811 / 68,7 | .797 / 66,6 | **.814 / 68,6** |
| ATBench-Codex (500) | .833 / 80,2 | .843 / 78,2 | .874 / 77,4 | .893 / 83,2 | .910 / 80,2 | .889 / 77,8 | .900 / 80,0 | **.909 / 79,8** |
| ASSEBench strict (1.476) | .875 / 79,7 | .732 / 68,0 | .871 / 75,9 | .831 / 79,5 | .869 / 66,3 | .859 / 67,5 | .854 / 72,4 | **.866 / 68,8** |
| ATBench-Claw, native (500) | .915 / 85,8 | .886 / 81,2 | .866 / 77,1 | .891 / 88,8 | .904 / 75,4 | .939 / 77,8 | .932 / 77,2 | **.931 / 76,8** |
| TraceSafe-Bench (1.170), AUROC | .460 | .523 | .556 | .580 | .559 | .563 | .607 | **.579** |

Latencia por trayectoria (p50, una L40S, bf16, una sola pasada):

| Conjunto | 3B | 8B | Aceleración |
|---|---|---|---|
| R-Judge | 53 ms | 111 ms | 2,1× |
| ASSEBench | 49 ms | 99 ms | 2,0× |
| ATBench | 89 ms | 181 ms | 2,0× |
| ATBench-Codex | 77 ms | 158 ms | 2,1× |

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB libres en bf16 para el modelo base más el adaptador LoRA.
- GPU recomendadas: L40S (referencia de las mediciones), A100, H100 para despliegues de alto throughput; RTX 4090 y GPUs con 12-16 GB o más para inferencia en consumer.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~8-10 GB de VRAM libre en bf16.
- Opciones de despliegue: al ser un adaptador PEFT sobre un modelo Mistral, puede servirse con vLLM, TGI o transformers + PEFT; para CPU o entornos ligeros, conversión a GGUF con llama.cpp u Ollama (no documentado por el autor).
- Latencia: ~49-89 ms por trayectoria en L40S según el conjunto; el ensemble de tres semillas requiere tres pasadas.
- Throughput: no disponible de forma explícita, pero la latencia por pasada permite estimaciones de decenas de trayectorias por segundo por GPU en función del batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R-Judge AUROC | ATBench AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IntuitionGuard-3B | 3B | No disponible | 0,972 (ensemble) | 0,814 (ensemble) | Apache-2.0 | Hugging Face |
| StepGuard-4B | 4B | No disponible | 0,932 | 0,787 | Apache-2.0 | Hugging Face |
| AgentDoG-4B | 4B | No disponible | 0,967 | 0,603 | Apache-2.0 | Hugging Face |
| AgentDoG1.5-4B | 4B | No disponible | 0,970 | 0,741 | Apache-2.0 | Hugging Face |
| AgentDoG1.5-Unified-4B | 4B | No disponible | 0,957 | 0,844 | Apache-2.0 | Hugging Face |
| IntuitionGuard-8B | 8B | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- No es un bloqueador: el diseño alert-only implica que nunca impide una acción por sí mismo; requiere una capa de política o revisión humana para actuar sobre las alertas.
- Rendimiento cercano al azar en TraceSafe-Bench (web-agent traces): el propio autor lo declara fuera de alcance; no debe usarse para trayectorias de agentes web.
- Por debajo de AgentDoG1.5-Unified-4B en ATBench ranking (0,03-0,05 AUROC, 9-12 puntos a umbral 0,5); el autor no reclama ser la mejor guarda abierta.
- Riesgo de alucinación en la puntuación: al ser un clasificador, puede producir falsos positivos y falsos negativos; los umbrales deben calibrarse por dominio.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento se basa en datasets de seguridad de agentes que pueden no representar todos los dominios.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Ministral-3-3B-Instruct-2512 debe verificarse por separado (licencia del base no indicada en la información disponible).
- Contexto máximo no documentado: trayectorias muy largas pueden truncarse o degradar la puntuación.
- Requiere el modelo base completo además del adaptador: no es un modelo autónomo y necesita descargar Ministral-3-3B-Instruct-2512-BF16.

## Enlaces

- Hugging Face: https://huggingface.co/LyzrAI/IntuitionGuard-3B
- Modelo hermano IntuitionGuard-8B: https://huggingface.co/LyzrAI/IntuitionGuard-8B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Dataset StepGuard: https://huggingface.co/datasets/ninty-seven/stepguard_data
- Dataset Agent Action Safety: https://huggingface.co/datasets/karanxa/agent-action-safety-dataset
