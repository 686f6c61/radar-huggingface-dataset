# djduecaster/dfreq-sprint-velocity-damping-20261110

## Resumen

SprintVelocityDamping es un controlador de retroalimentación por observación para robótica, publicado en Hugging Face por el usuario djduecaster dentro del contexto de la competición microduck-arena. No es un modelo de lenguaje ni un modelo fundacional: es una política neuronal empaquetada en formato ONNX que mapea observaciones de 61 dimensiones a acciones de 14 dimensiones a 50 Hz, diseñada para la tarea de sprint de 2 metros (evento sprint-2m). Su aportación concreta es un amortiguamiento acotado de la velocidad articular aplicado únicamente a las patas, dejando intactas las salidas de cabeza y cuello.

El modelo hereda una política neuronal y un controlador de retroalimentación de un modelo padre (identificado por su SHA256) y añade una modificación determinista sobre las acciones: resta a cada objetivo de pata el valor clip(0.01 × velocidad articular del paso anterior, -0.05, +0.05). Según la model card, esta modificación recuperó 75 arranques fallidos del baseline pero perdió otros 75 que el baseline sí completaba, con un tiempo de barrido local de 0,945 s frente a 0,959 s del baseline, lo que el propio autor califica como mejora no establecida.

Es relevante ahora únicamente como artefacto experimental de investigación en control robótico simulado. El autor es explícito: es solo simulación, no hay pruebas en robot físico, no se establece seguridad física y no se declara una licencia nueva. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal heredada del modelo padre, exportada a ONNX; incluye controlador de retroalimentación y amortiguamiento de velocidad articular en patas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija obs[1,61]) |
| Tipos de cuantizacion | no disponible (pesos en Float32) |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | no disponible (el autor indica que se retienen derechos y atribución heredados sin declarar una licencia nueva global) |
| Formato de pesos | ONNX (Float32, operadores estándar, sin tensores externos) |
| Dimension de entrada | obs[1,61] |
| Dimension de salida | actions[1,14] |
| Frecuencia de control | 50 Hz |
| SHA256 del modelo | 8bdbd73b7e20f546758be752860bacdaa5480d964e20f67064a1890621d36ee4 |
| SHA256 del modelo padre | 1b879832d77d1208bc988defcd5f034b1fbedcd090ac51aa5d0c16a88ec94371 |
| Revision de codigo nativo | 9bf04c0668145528035c8a315d5d8ae2530c1279, runner version 5 |
| Evento | sprint-2m |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política neuronal heredada; se sabe que el modelo padre contiene una red neuronal, un controlador de retroalimentación y créditos de contribuidores documentados en `upstream-base-card.md`. La exportación es un grafo ONNX Float32 con entrada `obs[1,61]` y salida `actions[1,14]`, usando operadores estándar y sin tensores externos, lo que facilita su despliegue en runtimes ONNX convencionales. El control se ejecuta a 50 Hz.

La innovación técnica de esta variante es una capa de post-procesado determinista sobre las acciones: para cada articulación de pata se resta `clip(0.01 × v_prev, -0.05, +0.05)`, donde `v_prev` es la velocidad articular del paso inmediatamente anterior. Las salidas de cabeza y cuello no se modifican. El autor subraya que la rama cambia acciones dependientes de la observación real y no solo metadatos, y que no se añaden al inferencia tiempo, semillas, tablas de búsqueda, posición, orientación ni observaciones privilegiadas del simulador. No se proporcionan datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF/DPO, por lo que se consideran no disponibles.

## Capacidades

- Generación de acciones motoras para control de un robot simulado en la tarea sprint-2m, a partir de observaciones de 61 dimensiones.
- Amortiguamiento acotado de velocidad en articulaciones de las patas, con límite de ±0.05 por paso.
- Preservación intacta de las salidas de cabeza y cuello respecto al modelo padre.
- Inferencia determinista dependiente de la observación, sin componentes estocásticos añadidos en esta rama.
- Ejecución a 50 Hz en formato ONNX Float32 con operadores estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Investigación en control locomotor simulado: usar el modelo como política de referencia para estudiar el efecto del amortiguamiento de velocidad articular en la estabilidad del sprint de 2 m, comparando barridos con y sin la capa de damping.
- Ablación controlada en experimentos de robótica: dado que el cambio es una resta acotada y determinista, sirve para aislar el impacto de un único término de amortiguamiento sobre la tasa de finalización y el tiempo de recorrido.
- Evaluación de robustez en arranques: los 75 arranques recuperados frente al baseline permiten analizar en qué condiciones iniciales el damping evita fallos, aunque el autor advierte que la mejora global no está establecida.
- Despliegue en pipelines de simulación con ONNX Runtime: al ser un grafo Float32 con operadores estándar y sin tensores externos, se integra en evaluadores locales que consuman observaciones a 50 Hz.
- Reproducción de resultados: los SHA256 del modelo y del padre, junto con la revisión del código nativo y la versión del runner, permiten replicar el barrido local y verificar la correspondencia de artefactos.
- Estudio de compromisos rendimiento-fiabilidad: el intercambio de 75 recuperaciones por 75 pérdidas de finalización y la variación de 0,945 s a 0,959 s ofrecen un caso concreto para analizar si el damping mejora la fiabilidad a costa de velocidad o viceversa.

## Benchmarks y rendimiento

| Metrica | SprintVelocityDamping | Baseline |
|---|---|---|
| Arranques independientes completados | 340/512 | 340/512 |
| Fallos del baseline recuperados | 75 | no aplica |
| Finalizaciones del baseline perdidas | 75 | no aplica |
| Tiempo de barrido oficial local | 0.945 s | 0.959 s |

El autor indica explícitamente que no se establecen mejoras generales de velocidad ni de fiabilidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y no se especifica el número de parámetros de la política.
- GPU recomendadas: no disponibles; al ser un grafo ONNX de pequeña entidad, es probable que quepa en hardware de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime u otros runtimes compatibles con ONNX Float32 y operadores estándar; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; únicamente se conoce la frecuencia de control de 50 Hz y que los barridos locales se ejecutaron en simulación sobre Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SprintVelocityDamping | no disponible | no aplica (obs[1,61]) | 340/512 arranques, 0.945 s | no disponible | Hugging Face, 0 descargas |
| Modelo padre (SHA256 1b8798...) | no disponible | no aplica | 340/512 arranques, 0.959 s | no disponible | Referenciado en upstream-base-card.md |
| Otras entradas de microduck-arena | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo simulación: no hay pruebas en robot físico ni afirmación de seguridad física; la publicación y la evaluación en la Arena no establecen seguridad para robots reales.
- Mejora no establecida: el propio autor indica que no se demuestran mejoras generales de velocidad ni fiabilidad; los 75 fallos recuperados se compensan con 75 finalizaciones perdidas.
- Resultados locales no garantizados: la simulación en Apple Silicon no puede garantizar puntuaciones en el entorno alojado, elegibilidad por duplicados ni puntos.
- Licencia no disponible: se retienen derechos y atribución heredados sin una licencia nueva global, lo que impide confirmar condiciones de uso comercial.
- Sin pruebas completas: el pytest completo del upstream no se ejecutó por ausencia de pytest en el intérprete existente; solo se realizaron comprobaciones directas y evaluaciones en simulador.
- Sin datos de sesgo ni alucinación aplicables: al no ser un modelo generativo de texto, no proceden las advertencias habituales de sesgo lingüístico, pero tampoco hay evaluación de robustez fuera del evento sprint-2m.
- Alcance restringido: el amortiguamiento solo afecta a las patas; cualquier conclusión sobre el comportamiento de cabeza y cuello es heredada del modelo padre.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-velocity-damping-20261110
- Model card del modelo padre: referenciada como `upstream-base-card.md` en el repositorio (no se proporciona URL directa)
- Repositorio de código nativo: revisión 9bf04c0668145528035c8a315d5d8ae2530c1279 (no se proporciona URL directa)
- Paper, blog o demo: no disponibles en la información proporcionada
