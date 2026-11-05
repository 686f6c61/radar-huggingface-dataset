# Aditharavind/viveka-500m

## Resumen

Viveka-500M es un modelo vision-language-action (VLA) de 523 millones de parámetros orientado a manipulación robótica real, desarrollado por Aditharavind y publicado como preview de investigación. Se presenta junto al borrador de artículo "Viveka: Self-Predictive Embodied Slots for Surprise-Gated Action Chunking" y está diseñado para dos plataformas concretas: el brazo único Piper de 7 grados de libertad y el sistema bimanual ALOHA de 14 grados de libertad. El problema que aborda es el control de robots manipuladores a partir de instrucciones en lenguaje natural e imágenes, generando chunks de acciones de 48 pasos (1,6 s a 30 Hz).

La arquitectura combina un codificador visual DINOv2 ViT-B/14 con FiLM de instrucción, un transformer de lenguaje a nivel de byte entrenado desde cero, un módulo de representación encarnada basada en 32 slots aprendidos y un experto de acción DiT con flow-matching. La innovación principal es un cabezal JEPA autocondicionado por acción que predice los slots futuros a +16, +32 y +48 pasos y cuyo error de predicción ("latent surprise") puede disparar una replanificación en tiempo de ejecución.

Es relevante ahora porque explora un patrón poco común en VLA de producción: sustituir el LLM preentrenado por un codificador de lenguaje ligero y apostar por dinámica latente autocondicionada en lugar de solo imitación. No obstante, se trata de un checkpoint entrenado una sola noche en una GPU, con 1.057 episodios de teleoperación de una única escena y tres instrucciones, por lo que su utilidad práctica fuera de ese entorno es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: DINOv2 ViT-B/14 + transformer de bytes + slots encarnados + DiT flow-matching + cabezal JEPA |
| Parámetros totales | 523.336.193 (entrenables) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial temporal de slots: 4 capas; frame de historial de 0,2 s actualmente sin uso) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (instrucciones en inglés en los ejemplos; codificador de lenguaje a nivel de byte entrenado desde cero) |
| Licencia | other (sin términos detallados en la información disponible) |
| Formato de pesos | safetensors (fp32, 1,95 GB) + config.json, norms.json, eval.json |
| Tamaño del repo | 2,1 GB |
| Entrada visual | 224 px, 2 vistas + frame de historial de 0,2 s |
| Salida de acción | chunks de 48 pasos, 7 DoF (Piper) o 14 DoF (ALOHA) |
| Pasos de integración (Euler) | 1 a 10 |

Desglose de parámetros por componente:

| Componente | Parámetros |
|---|---:|
| Codificador visual (ConvViT + FiLM) | 88.880.640 |
| Codificador de lenguaje (transformer de bytes) | 18.867.456 |
| Fusión multimodal (proyecciones) | 1.314.816 |
| Representación encarnada (slots ESF) | 135.343.104 |
| Modelado temporal (historial de slots) | 50.605.568 |
| Predictor de dinámica latente (JEPA) | 44.263.168 |
| Política de acción (flow DiT) | 183.010.816 |
| Otros (cabezal de matching de instrucción) | 1.050.625 |
| **Total entrenable** | **523.336.193** |
| Objetivo EMA (no entrenado, tipo buffer) | 244.406.016 |

## Arquitectura y entrenamiento

El modelo sigue un diseño modular de tipo VLA. La percepción visual corre a cargo de un DINOv2 ViT-B/14 preentrenado y afinado a 0,1x de learning rate, que procesa dos vistas de cámara más un frame de historial de 0,2 s a 224 px; la instrucción se inyecta mediante FiLM en las últimas cuatro capas del codificador visual. El lenguaje se gestiona con un transformer de 6 capas a nivel de byte entrenado desde cero, sin tokenizador ni LM preentrenado, lo que reduce el coste computacional pero limita la generalización semántica. Sobre estas representaciones, un Embodied State Former de 8 capas y dimensión 1024 construye 32 slots aprendidos junto con tokens de propiocepción y de encarnación, y un módulo temporal de 4 capas modela la historia de slots.

La generación de acciones se realiza con un experto de 12 capas basado en flow-matching DiT que produce chunks de 48 pasos (1,6 s a 30 Hz) con entre 1 y 10 pasos de Euler. La pieza diferencial es el cabezal JEPA autocondicionado por acción: predice los slots a +16, +32 y +48 pasos usando un objetivo EMA, y el error de esa predicción frente a los slots observados actúa como señal de "sorpresa latente" que puede disparar replanificación en tiempo de ejecución. Los datos de entrenamiento son 1.057 episodios de teleoperación de Piper procedentes esencialmente de una sola escena con tres instrucciones, más 150 episodios de ALOHA; se aplicó augmentación de apariencia fuerte. No se documentan RLHF, DPO ni un corpus de preentrenamiento general; el entrenamiento fue de una sola noche en una GPU según el autor.

## Capacidades

- Generación de acciones de manipulación en espacio articular (radianes) para brazos Piper de 7 DoF y ALOHA de 14 DoF, en chunks de 48 pasos.
- Seguimiento de instrucciones en lenguaje natural mediante un codificador de bytes y FiLM sobre el visual, aunque solo validado con tres instrucciones de una escena.
- Percepción visual multi-vista (cámara global y de pinza) con robustez medida ante oscuridad, dominante de color, oclusión y desenfoque.
- Predicción de dinámica latente a futuro (+16/+32/+48 pasos) con detección de escenas estancadas (ROC-AUC 0,968 frente a 0,008 sin dinámica).
- Disparo de replanificación basado en sorpresa latente, evaluado únicamente contra desviaciones sintéticas.
- Control de pinza con una concordancia apertura/cierre del 93,5 %.
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades de audio ni modo thinking; no es un modelo de lenguaje general.
- Capacidades multilingües: no disponibles; el codificador de bytes no se ha evaluado en otros idiomas.

## Casos de uso

- Investigación en manipulación con brazo Piper: el modelo se integra mediante `VivekaPiperAgent` para generar chunks de 7 articulaciones a partir de estado articular y dos imágenes, útil como referencia reproducible en experimentos de VLA con bajo presupuesto de VRAM.
- Replanificación reactiva en entornos con perturbaciones: la señal de sorpresa latente del cabezal JEPA permite detectar escenas estancadas y volver a planificar, adecuada para prototipos de tolerancia a fallos en laboratorio.
- Nodo ROS 2 para robótica de investigación: el repositorio incluye `robotics/piper_node_viveka500m.py`, lo que facilita desplegar el modelo en un stack ROS 2 existente con menos de 2 GB de VRAM.
- Estudio de arquitecturas VLA ligeras: sirve como banco de pruebas para evaluar el impacto de sustituir un LLM preentrenado por un codificador de bytes y de usar slots encarnados frente a tokens visuales densos.
- Aprendizaje por imitación con flow-matching: el experto DiT de 12 capas y los chunks de 48 pasos son un punto de partida para experimentos de imitación con distintos números de pasos de Euler (1 a 10) y latencias de 25 a 48 ms.
- Evaluación de robustez visual: los resultados bajo oscuridad, color cast, oclusión y blur permiten usar el modelo como baseline en estudios de sensibilidad a condiciones de cámara.
- Prototipado bimanual con ALOHA: los cabezales de 14 DoF, aunque no evaluados y entrenados con solo 150 episodios, permiten experimentar con la extensión bimanual del pipeline.

## Benchmarks y rendimiento

Resultados medidos en episodios Piper reservados (420 consultas de 12 episodios, una sola ejecución de entrenamiento):

| Métrica | Viveka-500M | Baseline de mantener posición |
|---|---:|---:|
| Error de brazo en lazo abierto, chunk de 48 pasos (grados) | 3,62 | 4,64 |
| Error de brazo en lazo abierto, primeros 8 pasos (grados) | 2,62 | 1,32 |
| Concordancia apertura/cierre de pinza | 93,5 % | - |
| Incremento de error con cámaras en blanco / intercambiadas | +170 % / +288 % | - |
| Error con oscuridad / color cast / oclusión / blur (rad) | 0,0605 / 0,0607 / 0,0611 / 0,0714 (limpio 0,0605) | - |
| ROC-AUC de detección de escena estancada (+48 pasos), predicción propia vs sin dinámica | 0,968 vs 0,008 | - |
| Latencia por chunk, batch 1, 1 / 5 / 10 pasos de flow | 25 / 35 / 48 ms | - |
| VRAM pico en inferencia | 2,0 GB | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las tasas de éxito en lazo cerrado con robot real están pendientes según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,0 GB en pico según medición del autor con pesos fp32; no se documentan requisitos para cuantizaciones alternativas.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; el autor entrenó en una sola GPU sin especificar modelo.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, dado el bajo consumo de memoria.
- Opciones de despliegue: inferencia vía `inference.piper_agent.VivekaPiperAgent` del repositorio de GitHub (privado en la información disponible) y nodo ROS 2 `robotics/piper_node_viveka500m.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al no ser un modelo de lenguaje generativo.
- Latencia y throughput: 25 ms por chunk con 1 paso de Euler, 35 ms con 5 y 48 ms con 10, en batch 1. El throughput no se especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada; los benchmarks publicados solo comparan contra un baseline de mantener posición. A modo de referencia estructural, se indican alternativas de la misma categoría sin datos de rendimiento comparables:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viveka-500M | 523 M | no disponible | Error de brazo 3,62° (48 pasos); ROC-AUC 0,968 en detección de estancamiento | other | HuggingFace, repo GitHub privado |
| OpenVLA | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| RT-2 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| π0 (pi-zero) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado con 1.057 episodios de una sola escena y tres instrucciones: el seguimiento de lenguaje y la transferencia a entornos nuevos están apenas probados.
- Solo se han reportado métricas en lazo abierto; las tasas de éxito en robot real en lazo cerrado están pendientes.
- En los primeros 8 pasos de cada chunk el modelo es menos preciso que mantener la posición (2,62° frente a 1,32°), por lo que se recomienda mantener el limitador de velocidad del nodo.
- El disparador de sorpresa latente solo se ha evaluado contra desviaciones sintéticas, no contra fallos reales.
- Los cabezales bimanuales de ALOHA se entrenaron con 150 episodios y no se han evaluado.
- El frame de historial de 0,2 s no aporta mejora (eliminarlo cambia el error un +0 %), lo que sugiere componentes infrautilizados.
- Riesgo de sobreajuste a la apariencia de la escena pese a la augmentación fuerte; el error se dispara un +170 % con cámaras en blanco y un +288 % con cámaras intercambiadas.
- Licencia "other": no se detallan los términos, por lo que el uso comercial requiere contactar con el autor antes de cualquier despliegue en producción.
- Estado de research preview: no es una política de propósito general y no debe usarse fuera del entorno para el que fue entrenado.
- El repositorio de código figura como privado, lo que puede bloquear la reproducibilidad del pipeline de inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/Aditharavind/viveka-500m
- Repositorio de código (privado según la model card): https://github.com/Aditharavind/viveka-500m
- Borrador de artículo: "Viveka: Self-Predictive Embodied Slots for Surprise-Gated Action Chunking" (sin enlace disponible en la información proporcionada)
- Nodo ROS 2: `robotics/piper_node_viveka500m.py` dentro del repositorio de código (sin enlace directo disponible)
