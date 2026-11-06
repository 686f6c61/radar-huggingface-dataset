# hikewa/eisv-lumen-student

## Resumen

EISV-Lumen Student es un ensemble de tres clasificadores RandomForest destilado a partir del modelo docente EISV-Lumen Teacher (un LoRA sobre Qwen3-4B). Lo desarrolla el autor hikewa (Kenny Wang) y resuelve un problema muy concreto: generar expresiones simbólicas EISV a partir de trayectorias dinámicas descritas por medias, primeras y segundas derivadas de las cuatro dimensiones E, I, S y V. El objetivo no es competir en capacidades generales de lenguaje, sino sustituir la inferencia de un LLM por un artefacto determinista y ligero que quepa en una Raspberry Pi 4.

La pieza clave es la destilación de conocimiento: el docente etiquetó 4.320 trayectorias sintéticas (480 por cada una de 9 formas) más 1.080 ejemplos de test reservados, y el estudiante aprende a reproducir la tarea descompuesta en tres problemas encadenados de clasificación (patrón, token primario y token secundario). El resultado se serializa en JSON de unos 13 MB y se ejecuta solo con la biblioteca estándar de Python, sin sklearn ni dependencias externas.

Es relevante ahora porque demuestra un patrón de despliegue en el borde (edge) para tareas generativas estrechas: cuando la salida pertenece a un espacio simbólico cerrado, un bosque aleatorio destilado puede igualar o superar la coherencia del docente con una huella de memoria y cómputo órdenes de magnitud menor. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 clasificadores RandomForest independientes (sklearn) |
| Parametros totales | No aplica (modelo no neuronal; ~13 MB de JSON serializado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de 21 features: 12 numéricas + 9 one-hot de forma) |
| Tipos de cuantizacion | No disponible (no se aplica cuantización; los árboles se serializan en JSON) |
| Idiomas soportados | No disponible (la salida son tokens simbólicos EISV, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON serializado (pattern_forest.json, token1_forest.json, token2_forest.json, scaler.json, mappings.json) e inferencia en Python puro (student_inference.py) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un ensemble de tres bosques aleatorios que resuelven la generación de expresiones EISV como una cadena de clasificación. El primer bosque predice uno de cinco patrones de expresión (`SINGLE`, `PAIR`, `REPETITION`, `QUESTION`, `TRIPLE`); el segundo predice el token primario entre 15 clases (por ejemplo `~stillness~`, `~warmth~`, `~emergence~`); el tercero predice el token secundario entre 15 clases más la opción `none`, condicionado al índice del token primario que se añade como feature adicional. El patrón determina cómo se ensamblan los tokens en la cadena final.

Las features de entrada son 12 valores numéricos (4 medias EISV, 4 primeras derivadas y 4 segundas derivadas) estandarizados con `StandardScaler`, más un one-hot de 9 dimensiones que codifica la forma de la trayectoria. Cada bosque usa los hiperparámetros por defecto de sklearn: `n_estimators=100`, `max_depth=None` y `random_state=42`. El entrenamiento es una destilación de conocimiento con etiquetas blandas generadas por el docente (Qwen3-4B LoRA v6) sobre 4.320 trayectorias sintéticas, con 1.080 ejemplos reservados para test.

La innovación técnica no está en el aprendizaje sino en el empaquetado: los árboles se exportan a JSON y el módulo `student_inference.py` recorre cada nodo y promedia las probabilidades de clase entre árboles replicando la lógica de `predict` de sklearn, usando únicamente `json` y `os` de la biblioteca estándar. Esto elimina cualquier dependencia de Python científico en el dispositivo de destino.

## Capacidades

- Generación de expresiones EISV simbólicas a partir de trayectorias dinámicas (medias, deltas y aceleraciones de E, I, S y V).
- Clasificación de patrones de expresión entre cinco categorías (`SINGLE`, `PAIR`, `REPETITION`, `QUESTION`, `TRIPLE`).
- Predicción de token primario entre 15 clases simbólicas y de token secundario condicionado al primario.
- Inferencia sin dependencias externas: solo biblioteca estándar de Python.
- Ejecución en hardware de muy bajos recursos (objetivo declarado: Raspberry Pi 4 con ARM a 1,5 GHz y 4 GB de RAM).
- Determinismo y reproducibilidad: bosques con `random_state=42` y parámetros de escalado fijos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general, visión, audio ni capacidades multilingües; su alcance es la tarea EISV cerrada.

## Casos de uso

- Expresión afectiva en robótica de bajo consumo: el modelo traduce una trayectoria de estado interno (EISV) en una expresión simbólica que un robot puede mostrar o verbalizar, ejecutándose en la propia Raspberry Pi 4 sin GPU ni conexión de red.
- Despliegue en el borde sin dependencias: al requerir solo la biblioteca estándar de Python, se puede instalar en entornos restringidos (contenedores mínimos, sistemas embebidos) donde no es viable instalar sklearn ni frameworks de deep learning.
- Sustituto del docente en producción: cuando el LLM docente (Qwen3-4B LoRA) no cabe en el dispositivo o su latencia es inaceptable, el estudiante ofrece una alternativa con coherencia declarada de 0,986 frente a 0,952 del docente, aunque sobre conjuntos de test distintos.
- Prototipado rápido de sistemas de diálogo simbólico: el espacio interactivo `eisv-lumen-explorer` permite probar la lógica de generación de expresiones sin infraestructura de inferencia neuronal.
- Investigación sobre destilación a modelos no neuronales: sirve como caso de estudio reproducible de cómo un espacio de salida cerrado y de baja cardinalidad puede capturarse con bosques aleatorios a partir de etiquetas de un LLM.
- Telemetría y monitorización de estados: dado un flujo de trayectorias EISV, el modelo puede etiquetar patrones de forma determinista y a bajo coste, integrándose en pipelines de análisis sin dependencias pesadas.
- Pruebas de regresión y validación de sistemas: al ser determinista y ligero, es adecuado como oráculo de referencia en tests automatizados de la lógica de expresión EISV.

## Benchmarks y rendimiento

| Metrica | Student (RF) | Teacher (Qwen3-4B LoRA) | Baseline aleatorio |
|---|---|---|---|
| Coherencia | 0,986 | 0,952 | 0,495 |
| Acuerdo en token 1 | 0,688 | No disponible | No disponible |
| Acuerdo en patrón | 0,652 | No disponible | No disponible |
| Acuerdo completo (los 3 coinciden) | 0,403 | No disponible | No disponible |

El propio autor advierte que las dos cifras de coherencia proceden de conjuntos de test distintos: la del estudiante sobre 1.080 ventanas sintéticas etiquetadas por el docente y la del docente sobre 500 ventanas reales de Lumen, por lo que la comparación es indicativa y no equivalente. El estudiante supera al docente en coherencia porque los límites de decisión del RandomForest agrupan las predicciones hacia tokens de alta afinidad para cada forma de trayectoria, aunque discrepe del docente en la elección exacta de token en torno al 30 % de los casos.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU.
- RAM estimada: el artefacto JSON ocupa unos 13 MB (3,0 MB pattern_forest, 4,5 MB token1_forest, 5,1 MB token2_forest, más scaler y mappings de menos de 2 KB), por lo que cabe holgadamente en los 4 GB de una Raspberry Pi 4.
- CPU: objetivo declarado Raspberry Pi 4 (ARM a 1,5 GHz); funciona en cualquier CPU capaz de ejecutar Python.
- GPU recomendadas: ninguna; no requiere aceleración.
- Cabe en cualquier GPU consumer, aunque no la aprovecha.
- Opciones de despliegue: módulo Python puro `student_inference.py` sobre los JSON exportados en `exported/`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Tarea | Coherencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EISV-Lumen Student | RandomForest destilado | ~13 MB JSON | Expresión EISV | 0,986 (test sintético) | Apache 2.0 | Hugging Face |
| EISV-Lumen Teacher | Qwen3-4B + LoRA | ~4B parámetros | Expresión EISV | 0,952 (test real) | No disponible | Hugging Face |
| Baseline aleatorio | No disponible | No aplica | Expresión EISV | 0,495 | No disponible | No aplica |

No se dispone de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: solo genera expresiones EISV a partir de 21 features; no es un modelo de lenguaje general ni admite texto libre.
- La comparación de coherencia con el docente no es equivalente: se calcula sobre conjuntos de test distintos (sintético frente a real), como reconoce el propio autor.
- El acuerdo completo con el docente es bajo (0,403): en cerca del 60 % de los casos el estudiante elige una combinación de patrón y tokens distinta, aunque el autor sostiene que sigue siendo coherente.
- Riesgo de sesgo de destilación: los bosques tienden a agrupar predicciones hacia tokens de alta afinidad, lo que puede reducir la diversidad de expresiones frente al docente.
- Dependencia de la calidad de las etiquetas del docente y del dataset sintético `hikewa/unitares-eisv-trajectories`; no se documenta validación sobre trayectorias reales de Lumen.
- Idiomas soportados no disponibles; la salida son tokens simbólicos, no lenguaje natural multilingüe.
- Sin datos publicados de latencia ni throughput en el dispositivo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por la comunidad.
- No apto para tareas de razonamiento, código, matemáticas, visión o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hikewa/eisv-lumen-student
- Modelo docente: https://huggingface.co/hikewa/eisv-lumen-teacher
- Dataset: https://huggingface.co/datasets/hikewa/unitares-eisv-trajectories
- Demo interactiva (Space): https://huggingface.co/spaces/hikewa/eisv-lumen-explorer
