# DavidWu1116/AeroRSI

## Resumen

AeroRSI es un conjunto de adaptadores LoRA para navegación aérea guiada por visión y lenguaje (aerial vision-language navigation, VLN), desarrollado por Shiwei Wu y colaboradores y publicado en el repositorio DavidWu1116/AeroRSI. El modelo implementa la política descrita en el artículo "AeroRSI: Recursive Self-Improvement for Aerial Vision-Language Navigation" (arXiv:2611.24077), un método de auto-mejora recursiva en el que la política aprende de sus propios fallos ronda tras ronda. En cada estado previo a un fallo, el modelo simula la continuación desde cada acción candidata (tanto muestras propias como propuestas basadas en reglas) para determinar cuál puede completar realmente, y aprende las reparaciones verificadas preservando su comportamiento en el resto de situaciones.

El modelo parte de la política supervisada AeroVLA-2B-384 (aproximadamente 2.000 millones de parámetros, según la nomenclatura) y se distribuye como dos adaptadores LoRA de rango 64 aplicados sobre las siete proyecciones del módulo de lenguaje y sobre el fusionador visual. El repositorio ocupa 0,8 GB e incluye dos checkpoints tras tres rondas de auto-mejora: AeroRSI-2B-SFTinit, que parte de la política supervisada, y AeroRSI-2B-DPOinit, que parte de AeroDPO. Ambos se evalúan sobre las 3.005 rutas de test del benchmark TravelUAV.

La relevancia del trabajo reside en su enfoque de aprendizaje por auto-mejora verificada aplicado a robótica aérea, un dominio donde los datos de demostración son escasos y costosos. El adaptador DPOinit alcanza un SR global del 69,85 % frente al 56,87 % de AeroDPO y el 46,39 % de la política supervisada bajo el mismo evaluador, lo que supone una mejora sustancial sin necesidad de supervisión adicional. La licencia Apache 2.0 facilita su reutilización en investigación y despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer; adaptadores LoRA sobre política AeroVLA-2B-384 (rango 64 en siete proyecciones del módulo de lenguaje y en el fusionador visual) |
| Parámetros totales | Aproximadamente 2.000 millones (modelo base AeroVLA-2B-384); el adaptador LoRA añade un subconjunto no especificado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se carga en BF16 con el fusionador visual en FP32) |
| Idiomas soportados | No disponible (las instrucciones son descripciones de objetos en lenguaje natural; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

La política es un modelo visión-lenguaje-acción que procesa un mosaico de 384×768 píxeles combinando las vistas frontal y cenital del dron, junto con un prompt textual con la forma `Fly <direction> and find the target. \nAction: `. La salida son tres bins de dos dígitos que codifican las acciones de avance, descenso y guiñada (yaw), opcionalmente seguidas de la acción `LAND`. El adaptador LoRA modifica las siete proyecciones del módulo de lenguaje y el fusionador visual; durante la inferencia, el fusionador visual se mantiene en FP32 bajo autocast BF16, replicando las condiciones de entrenamiento mediante la clase `aerorsi.policy.Policy`.

El entrenamiento sigue el esquema de auto-mejora recursiva del artículo: partiendo de una política supervisada (AeroVLA-2B-384) o de una política ajustada con DPO (AeroDPO), el modelo ejecuta rollouts, identifica estados previos a fallos, simula continuaciones desde cada acción candidata (muestras propias y propuestas basadas en reglas) y verifica cuáles completan la tarea. Aprende de las reparaciones verificadas manteniendo el comportamiento en el resto de estados, e itera sobre los fallos restantes. Los checkpoints publicados corresponden a tres rondas de este proceso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre RLHF más allá del componente DPO del modelo base.

## Capacidades

- Navegación aérea guiada por instrucciones en lenguaje natural: el modelo genera acciones de control de vuelo (avance, descenso, guiñada) condicionadas a una descripción de objeto objetivo.
- Percepción visual multimodal: procesa simultáneamente vistas frontal y cenital en un mosaico de 384×768.
- Razonamiento de acciones discretizadas: emite tres bins de dos dígitos por paso y una acción de aterrizaje (`LAND`).
- Aprendizaje por auto-mejora: la política incorpora reparaciones verificadas de sus propios fallos, lo que mejora la robustez en escenarios no vistos.
- Generalización a entornos no vistos: los resultados reportados incluyen evaluación en objetos no vistos y mapas no vistos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Navegación autónoma de drones en interiores y exteriores: el modelo recibe la descripción de un objeto objetivo y genera comandos de vuelo paso a paso, adecuado para tareas de búsqueda y entrega en entornos con mapas no vistos (SR del 53,55 % en mapas no vistos con el checkpoint DPOinit).
- Búsqueda y rescate: la capacidad de generalizar a objetos no vistos (SR del 82,19 % en objetos no vistos con SFTinit) permite localizar personas u objetos no presentes en el entrenamiento a partir de descripciones textuales.
- Inspección industrial aérea: el modelo puede dirigirse a componentes o anomalías descritas en lenguaje natural, integrado en pipelines de inspección automatizada de infraestructuras.
- Investigación en VLN y robótica: los adaptadores LoRA publicados permiten reproducir los experimentos del artículo y servir de base para nuevos métodos de auto-mejora, con scripts de evaluación incluidos (`aerorsi evaluate`, `aerorsi metrics`).
- Evaluación comparativa de benchmarks: el modelo se integra con el benchmark TravelUAV y sus 3.005 rutas de test, útil para comparar políticas de navegación bajo un evaluador común.
- Prototipado de políticas VLA de bajo coste: al ser un adaptador LoRA sobre un modelo de 2B, el coste de almacenamiento (0,8 GB) y de ajuste es reducido, lo que facilita iterar sobre nuevas variantes en laboratorios con recursos limitados.
- Docencia y formación en robótica aérea: el pipeline completo (descarga, preparación del dataset, evaluación en múltiples GPU) sirve como ejemplo reproducible de entrenamiento y evaluación de políticas VLA.

## Benchmarks y rendimiento

Resultados sobre las 3.005 rutas de test de TravelUAV con las acciones y terminación nativas del benchmark:

| Modelo | Seen SR | Unseen Object SR | Unseen Map SR | Overall SR |
|---|---:|---:|---:|---:|
| Política supervisada (referencia) | no disponible | no disponible | no disponible | 46,39 |
| AeroDPO (referencia) | no disponible | no disponible | no disponible | 56,87 |
| AeroRSI-2B-SFTinit | 75,32 | 82,19 | 46,24 | 67,49 |
| AeroRSI-2B-DPOinit | 76,52 | 79,65 | 53,55 | 69,85 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de aproximadamente 2B parámetros y el adaptador se carga en BF16, por lo que se estima un consumo en el rango de 4-8 GB para los pesos, sin contar el procesamiento visual ni el overhead del framework (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el script de evaluación del autor acepta múltiples GPU (`--gpus 0 1 2 3`), lo que sugiere despliegue en configuraciones multi-GPU; no se especifican modelos concretos.
- Cabe en GPU consumer: probablemente sí para una sola GPU con suficiente VRAM, dado el tamaño del modelo base de 2B; no confirmado en la información disponible.
- Opciones de despliegue: el autor proporciona el paquete `aerorsi` con los comandos `aerorsi prepare`, `aerorsi evaluate` y `aerorsi metrics`, y la clase `aerorsi.policy.Policy` para cargar el adaptador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall SR (TravelUAV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AeroRSI-2B-DPOinit | ~2B (base) + LoRA | no disponible | 69,85 | Apache 2.0 | Hugging Face (adaptador) |
| AeroRSI-2B-SFTinit | ~2B (base) + LoRA | no disponible | 67,49 | Apache 2.0 | Hugging Face (adaptador) |
| AeroDPO | ~2B (base) | no disponible | 56,87 | no disponible | Hugging Face (XuPeng23/AeroDPO) |
| Política supervisada AeroVLA-2B-384 | ~2B | no disponible | 46,39 | no disponible | Hugging Face (XuPeng23/AeroDPO) |

No se dispone de información sobre otros modelos comparables de navegación aérea VLN en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está diseñado exclusivamente para navegación aérea VLN sobre el benchmark TravelUAV; no es un modelo de propósito general y su uso fuera de ese dominio no está validado.
- Dependencia del modelo base: requiere descargar AeroVLA-2B-384-Merged desde XuPeng23/AeroDPO; el adaptador por sí solo no es funcional.
- Rendimiento limitado en mapas no vistos: el mejor checkpoint alcanza un SR del 53,55 % en mapas no vistos, frente al 76,52 % en entornos vistos, lo que indica una generalización geográfica todavía incompleta.
- Riesgo de alucinación y fallos de percepción: como política VLA, puede generar acciones incorrectas ante descripciones ambiguas o condiciones visuales no representadas en el entrenamiento; el propio método asume que los fallos ocurren y los repara iterativamente.
- Idiomas no especificados: no se documenta qué idiomas aceptan las descripciones de objetos; probablemente inglés por el formato del prompt, pero no está confirmado.
- Sin datos de sesgos: no se han publicado análisis de sesgos demográficos, geográficos o culturales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base AeroVLA-2B-384, que no se detalla en la información disponible.
- Repositorio con 0 descargas y 1 like: ecosistema de validación muy limitado; los resultados no han sido replicados de forma independiente.
- Requisitos de evaluación: la reproducción requiere el dataset TravelUAV y configuración multi-GPU, lo que eleva la barrera de verificación.

## Enlaces

- Hugging Face: https://huggingface.co/DavidWu1116/AeroRSI
- Modelo base: https://huggingface.co/XuPeng23/AeroDPO
- Código: https://github.com/starsholic/AeroRSI
- Artículo: https://arxiv.org/abs/2611.24077
- Daily Paper: https://huggingface.co/papers/2611.24077
- Página del proyecto: https://starsholic.github.io/AeroRSI/
