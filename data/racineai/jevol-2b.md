# racineai/Jevol-2B

## Resumen

Jevol-2B es un modelo de visión-lenguaje-acción (VLA) desarrollado por Racine.ai, diseñado específicamente para pilotar drones de forma autónoma. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-2B que recibe una imagen de cámara (672 x 504 píxeles) y una misión escrita en inglés, y responde con un comando de vuelo concreto cada 0,4 segundos. El modelo no mantiene memoria entre decisiones: no dispone de mapa, posición ni registro de comandos previos, por lo que cada acción se deriva únicamente de la observación visual actual y la instrucción.

Con 2.213 millones de parámetros totales (de los cuales 331 millones corresponden al codificador visual), Jevol-2B es la variante más grande de la familia Jevol, que también incluye Jevol-0.6B y Jevol-0.9B. A diferencia de los modelos de lenguaje convencionales, el checkpoint no incluye la cabeza del modelo de lenguaje: cada pregunta se resuelve mediante una "sentence head" especializada que produce respuestas de opción múltiple en una sola pasada forward.

La relevancia del modelo radica en su enfoque de control de drones de baja latencia (165 ms por decisión en una NVIDIA L40S) y en su rendimiento en el banco de pruebas del autor, donde alcanza una tasa de éxito del 50,7% en vuelos cerrados sobre entornos no vistos durante el entrenamiento, superando a modelos comerciales como Gemini 3.8 Flash o Claude Opus 5.5 en la misma tarea. El modelo se distribuye bajo una licencia de investigación propia (racine-research-license) y está disponible únicamente en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.5-2B) con codificador visual y sentence head para clasificación de opciones múltiples |
| Parametros totales | 2.213.241.664 (2.220 M según model card; 331 M corresponden a visión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | racine-research-license (licencia de investigación propia, marcada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jevol-2B parte del modelo Qwen/Qwen3.5-2B y conserva las 24 capas del decodificador del modelo base. La arquitectura incorpora un codificador visual de 331 millones de parámetros que procesa imágenes de 672 x 504 píxeles, y sustituye la cabeza del modelo de lenguaje por una "sentence head" que formula cada decisión como una pregunta de opción múltiple. En cada paso de decisión, el modelo responde simultáneamente a tres preguntas: movimiento (20 opciones: cuatro velocidades de -1,5 a 3 m/s y cinco giros de -60 a 60 grados/s), altitud (5 opciones de -1,5 a 1,5 m/s) y desplazamiento lateral (3 opciones: izquierda, ninguna, derecha). Las tres respuestas componen el comando de vuelo.

El entrenamiento se realizó sobre datos de vuelo y misiones en inglés, e incluye datos específicos de rechazo de órdenes peligrosas (como "estrellarse contra..." o "matar..."), aprendidos directamente de los datos de entrenamiento sin un filtro separado posterior. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo no mantiene estado entre decisiones, lo que simplifica la arquitectura de inferencia pero limita la planificación a largo plazo.

## Capacidades

- Generación de comandos de vuelo discretos a partir de una imagen de cámara y una instrucción en lenguaje natural en inglés.
- Percepción visual para navegación: interpreta escenas urbanas, contenedores, arcos, calles y obstáculos.
- Decisión de movimiento en tres ejes simultáneos (velocidad/giro, altitud, desplazamiento lateral) en una sola pasada forward.
- Rechazo aprendido de órdenes peligrosas: el modelo permanece inmóvil ante instrucciones como "crash into..." o "kill...".
- Operación sin memoria: cada comando se basa exclusivamente en la observación actual y la misión, sin mapa ni historial.
- Capacidad multilingüe limitada: el modelo solo entiende misiones en inglés; el rechazo de órdenes peligrosas se evaluó en 16 idiomas durante el entrenamiento, pero la interfaz operativa es en inglés.
- No soporta tool calling ni function calling en el sentido convencional; su salida es un conjunto fijo de opciones discretas.
- No soporta razonamiento multi-paso ni agentes conversacionales; es un modelo de control reactivo.

## Casos de uso

- Navegación autónoma de drones en entornos urbanos: el modelo recibe la imagen de la cámara y una misión como "Follow the street between the houses" y genera comandos de vuelo cada 0,4 segundos, adecuado para vuelos de inspección en calles y espacios con obstáculos.
- Inspección de infraestructuras: con instrucciones como "Go to the blue container" o "Fly through the next arch", el modelo permite dirigir el dron hacia objetivos visuales concretos en plantas industriales, obras o instalaciones.
- Investigación en robótica y VLA: sirve como banco de pruebas para estudiar control reactivo basado en visión, comparación de arquitecturas VLA y evaluación de latencia en bucles cerrados.
- Simulación y entrenamiento de pilotos: integrado en el simulador del repositorio del autor, permite reproducir misiones y evaluar la tasa de éxito antes de desplegar en hardware real.
- Sistemas de seguridad y rechazo de órdenes: el comportamiento aprendido de rechazo ante instrucciones peligrosas puede estudiarse como caso de alineación en sistemas embarcados.
- Despliegue en hardware de borde con requisitos de baja latencia: con 165 ms por decisión en una L40S y un tamaño de 4,47 GB en disco, es viable en servidores de inferencia dedicados para control en tiempo real.
- Evaluación comparativa de modelos de decisión: su inclusión en el banco del autor frente a modelos comerciales (Gemini, Claude, Qwen) permite analizar el coste/rendimiento de modelos pequeños especializados frente a LLM generales.

## Benchmarks y rendimiento

Datos del banco del autor (vuelos en bucle cerrado sobre el split de validación, 11 capturas de lugares reales en 3D no vistos en entrenamiento; un vuelo se considera exitoso si completa la misión sin colisión):

| Modelo | Tasa de éxito | Intervalo 95% | Vuelos evaluados | Tiempo por decisión |
|---|---|---|---|---|
| Piloto humano (replay) | 90,4% | No disponible | 1.350 | No disponible |
| Jevol-0.6B | 44,2% | 33,3 - 55,5 | 1.350 | 0,101 s |
| Jevol-0.9B | 49,5% | 37,3 - 61,0 | 1.350 | 0,141 s |
| **Jevol-2B** | **50,7%** | **36,3 - 64,9** | **1.350** | **0,165 s** |
| Gemini 3.8 Flash, low thinking | 49,6% | 36,9 - 63,0 | 135 | 6,1 s |
| Claude Opus 5.5, medium | 45,9% | 36,5 - 53,8 | 135 | 5,0 s |
| Claude Opus 5.5, low | 38,5% | 31,2 - 45,5 | 135 | 3,0 s |
| Claude Sonnet 5.5, high | 37,0% | 28,2 - 45,8 | 135 | 4,1 s |
| Qwen3.8-27B, thinking | 35,6% | 24,5 - 45,6 | 135 | 2,4 s |
| Claude Fable 5.2, low | 35,6% | 26,5 - 45,5 | 135 | 3,4 s |
| Gemini 3 Flash preview, no thinking | 26,7% | 18,7 - 35,6 | 135 | 2,3 s |
| Qwen3.8-27B, no thinking | 25,9% | 17,5 - 33,3 | 135 | 0,40 s |
| Claude Haiku 5.5, medium | 23,7% | 15,7 - 32,0 | 135 | 3,3 s |
| Decider Flash v1.3 | 10,7% | 6,0 - 16,6 | 1.350 | 0,11 s |
| d1-2B | 8,3% | 3,0 - 15,2 | 1.350 | 0,04 s |
| Intern-Decision-2B | 8,3% | 4,5 - 12,7 | 1.350 | 0,056 s |
| Intern-Decision-4B | 1,6% | 0,5 - 2,9 | 1.350 | 0,07 s |

Los tres modelos Jevol se encuentran dentro de los intervalos de confianza entre sí, por lo que el banco no los separa estadísticamente. Los modelos comerciales (Claude, Gemini, Qwen) se evaluaron solo con la orden en inglés (135 vuelos), lo que explica sus intervalos más amplios. Los tiempos se midieron en una NVIDIA L40S, una decisión a la vez; para las APIs se incluye la latencia de red.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño en disco es de 4,47 GB, por lo que en FP16 se requieren aproximadamente 4,5 GB de pesos más overhead de activaciones y codificador visual.
- GPU recomendadas: NVIDIA L40S (medida por el autor, 165 ms por decisión). No se han publicado mediciones en otras GPU.
- Cabe en GPU de consumo: no confirmado; por tamaño (2,2 B de parámetros, 4,47 GB en disco) es plausible en GPUs con 8-12 GB de VRAM, pero no hay mediciones publicadas.
- Opciones de despliegue: no se especifican en la información disponible; el autor proporciona código y simulador en GitHub, pero no detalla motores de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: 165 ms por decisión en L40S, una decisión a la vez. No se han publicado datos de throughput por lotes ni de latencia en otras máquinas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito (bench del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jevol-2B | 2.220 M (331 M visión) | No disponible | 50,7% | racine-research-license | Hugging Face |
| Jevol-0.9B | 863 M (101 M visión) | No disponible | 49,5% | racine-research-license | Hugging Face |
| Jevol-0.6B | 614 M (101 M visión) | No disponible | 44,2% | racine-research-license | Hugging Face (Space en navegador) |
| Gemini 3.8 Flash | No disponible | No disponible | 49,6% | Propietaria | API |
| Claude Opus 5.5 | No disponible | No disponible | 45,9% (medium) | Propietaria | API |
| Qwen3.8-27B | 27 B (aproximado) | No disponible | 35,6% (thinking) | No disponible | Servido en H100 del autor |

La comparación se limita al banco del propio autor y a la tarea específica de pilotaje de drones; no se dispone de comparativas en benchmarks estándar de lenguaje o visión.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en simulación; no hay validación en vuelo real publicada.
- No incluye geofence ni límite de altitud; la licencia exige un piloto entrenado capaz de tomar el control, límites de seguridad independientes fuera del modelo y un vuelo supervisado si se conecta a una aeronave real.
- No mantiene memoria: no hay mapa, posición ni historial de decisiones, lo que impide planificación a largo plazo o recuperación de errores acumulados.
- Solo procesa misiones en inglés; el resto de idiomas no están soportados para la operación.
- El rechazo de órdenes peligrosas es aprendido de los datos y no existe un filtro separado; las métricas de rechazo (98,2% en 329 imágenes, 16 idiomas) se midieron en Jevol-0.9B, no en Jevol-2B.
- La licencia racine-research-license restringe el uso; es necesario revisar el archivo LICENSE.md para conocer las condiciones exactas de uso comercial.
- Riesgo de alucinación visual y de decisiones erróneas en escenas no representadas en el entrenamiento; la tasa de éxito del 50,7% implica que aproximadamente la mitad de los vuelos del banco no se completan sin colisión.
- No se dispone de información sobre sesgos, composición del dataset ni procesos de alineación más allá del rechazo de órdenes peligrosas.
- El checkpoint no incluye la cabeza del modelo de lenguaje, por lo que no puede usarse como LLM convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racineai/Jevol-2B
- Modelo Jevol-0.6B: https://huggingface.co/racineai/Jevol-0.6B
- Modelo Jevol-0.9B: https://huggingface.co/racineai/Jevol-0.9B
- Space de demostración (Jevol-0.6B): https://huggingface.co/spaces/racineai/jevol
- Código y simulador: https://github.com/RacineAIOS/jevol
- Colección Jevol: https://huggingface.co/collections/racineai/jevol-6afb450b168fdac272e215e6
- Sitio del autor: https://racine.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
