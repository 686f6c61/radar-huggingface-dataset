# racineai/Jevol-0.9B

## Resumen

Jevol-0.9B es un modelo de visión-lenguaje-acción (VLA) de pequeño tamaño desarrollado por Racine.ai, especializado en pilotar drones de forma autónoma. A partir de una imagen de cámara (672 x 504 píxeles) y una instrucción de misión en inglés, el modelo emite un comando de vuelo compuesto por tres decisiones discretas (movimiento, altitud y desplazamiento lateral) en un único pase hacia delante. Está afinado sobre Qwen/Qwen3.5-0.8B y conserva las 24 capas del decodificador del modelo base.

El modelo resuelve el problema del control reactivo de un UAV sin mapa ni memoria: no mantiene estado entre decisiones, sino que cada comando se deriva exclusivamente de lo que observa en el instante actual. Esta arquitectura sin memoria encaja con la latencia objetivo de 0,4 segundos por decisión, y el modelo alcanza 141 ms por decisión en una NVIDIA L40S.

Es relevante porque demuestra que un modelo de menos de mil millones de parámetros, con un cabezal de frase sustituyendo al cabezal de lenguaje, puede igualar o superar a modelos de API de gran escala en una tarea de navegación cerrada, a una fracción del coste computacional y con capacidad de ejecución local. Junto con Jevol-0.6B y Jevol-2B forma una familia escalonada de modelos para robótica aérea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language-action) derivado de Qwen3.5-0.8B, 24 capas de decodificador, cabezal de frase en lugar del cabezal de lenguaje |
| Parametros totales | 852.985.920 (863 M en inferencia, 101 M de visión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo no mantiene memoria ni historial entre decisiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (entrenamiento y misiones); evaluación de rechazo en 16 idiomas |
| Licencia | racine-research-license (licencia de investigación, ver LICENSE.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jevol-0.9B parte de Qwen/Qwen3.5-0.8B y conserva la totalidad de sus 24 capas de decodificador. La modificación principal es la sustitución del cabezal de lenguaje por un cabezal de frase que formula tres preguntas de opción múltiple en un único pase: movimiento (20 opciones, cuatro velocidades de -1,5 a 3 m/s y cinco giros de -60 a 60 grados/s), altitud (5 opciones, de -1,5 a 1,5 m/s) y desplazamiento lateral (3 opciones: izquierda, ninguno, derecha). Los checkpoints publicados no incluyen el cabezal de lenguaje original.

El modelo incorpora un codificador de visión de 101 M de parámetros que procesa imágenes de 672 x 504. El entrenamiento se realizó sobre capturas de lugares reales en 3D y misiones en inglés; el bench de validación emplea 11 capturas de lugares ausentes del conjunto de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La seguridad se aprende directamente de los datos, sin filtro separado: el modelo permanece inmóvil ante órdenes peligrosas.

## Capacidades

- Generación de comandos de vuelo discretos a partir de imagen y texto, con tres decisiones por pase (movimiento, altitud, desplazamiento lateral).
- Navegación reactiva sin memoria, sin mapa ni registro de posiciones o decisiones previas.
- Comprensión de instrucciones de misión en inglés formuladas en una frase ("Follow the street between the houses", "Go to the blue container").
- Rechazo aprendido de órdenes peligrosas ("crash into...", "kill...", "go and hit..."): el dron se queda quieto.
- Robustez multilingüe en el rechazo: 16 idiomas en el conjunto de evaluación de seguridad, con dos idiomas retenidos del entrenamiento (sueco y checo) y 100% de rechazo en ellos.
- Procesamiento de imagen en resolución 672 x 504 y salida de baja latencia (141 ms por decisión en L40S).
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo de chat ni de generación de texto libre.

## Casos de uso

- Navegación autónoma de UAV en simulación: el modelo vuela misiones de forma cerrada a partir de la cámara, con una decisión cada 0,4 s, adecuado para investigación en control reactivo.
- Seguimiento de instrucciones de misión concretas: "Go to the blue container" o "Fly through the next arch"; el modelo traduce la orden a comandos de velocidad y giro sin necesidad de mapa.
- Investigación en VLA de pequeño tamaño: base para estudiar cabezales de frase, destilación desde modelos grandes de API o ablaciones de capas del decodificador, dado su tamaño manejable (1,75 GB en disco).
- Desarrollo de pipelines de seguridad aprendida: evaluación del rechazo ante órdenes peligrosas en múltiples idiomas, como referencia para modelos de robótica con restricciones éticas.
- Benchmark de agentes físicos: comparación de modelos de decisión (Decider Flash, d1, Intern-Decision) bajo un protocolo común de vuelo cerrado.
- Despliegue local en hardware de gama alta: con 141 ms por decisión en una L40S, puede integrarse en un bucle de control en tiempo real sobre un servidor de inferencia dedicado.
- Pruebas de robustez ante variaciones de redacción: el bench evalúa diez formulaciones distintas de la misma orden, útil para estudiar generalización lingüística en robótica.

## Benchmarks y rendimiento

| Modelo | Tasa de éxito | Intervalo 95% | Vuelos puntuados | Tiempo por decisión |
|---|---|---|---|---|
| Piloto humano, replicado | 90,4% | No disponible | 1.350 | No disponible |
| Jevol-0.6B | 44,2% | 33,3 – 55,5 | 1.350 | 0,101 s |
| Jevol-0.9B | 49,5% | 37,3 – 61,0 | 1.350 | 0,141 s |
| Jevol-2B | 50,7% | 36,3 – 64,9 | 1.350 | 0,165 s |
| Gemini 3.8 Flash, low thinking | 49,6% | 36,9 – 63,0 | 135 | 6,1 s |
| Claude Opus 5.5, medium | 45,9% | 36,5 – 53,8 | 135 | 5,0 s |
| Claude Opus 5.5, low | 38,5% | 31,2 – 45,5 | 135 | 3,0 s |
| Claude Sonnet 5.5, high | 37,0% | 28,2 – 45,8 | 135 | 4,1 s |
| Qwen3.8-27B, thinking | 35,6% | 24,5 – 45,6 | 135 | 2,4 s |
| Claude Fable 5.2, low | 35,6% | 26,5 – 45,5 | 135 | 3,4 s |
| Gemini 3 Flash preview, no thinking | 26,7% | 18,7 – 35,6 | 135 | 2,3 s |
| Qwen3.8-27B, no thinking | 25,9% | 17,5 – 33,3 | 135 | 0,40 s |
| Claude Haiku 5.5, medium | 23,7% | 15,7 – 32,0 | 135 | 3,3 s |
| Decider Flash v1.3 | 10,7% | 6,0 – 16,6 | 1.350 | 0,11 s |
| d1-2B | 8,3% | 3,0 – 15,2 | 1.350 | 0,04 s |
| Intern-Decision-2B | 8,3% | 4,5 – 12,7 | 1.350 | 0,056 s |
| Intern-Decision-4B | 1,6% | 0,5 – 2,9 | 1.350 | 0,07 s |

El bench emplea vuelos cerrados sobre la partición de validación con 11 capturas de lugares reales en 3D ausentes del entrenamiento; un vuelo se considera exitoso si la misión se completa sin colisión. Jevol y los modelos de decisión vuelan cada misión bajo diez redacciones de la orden (1.350 vuelos), cronometrados en una NVIDIA L40S, una decisión a la vez. Claude, Gemini (API) y Qwen (servido en H100) solo vuelan la orden en inglés (135 vuelos). Los intervalos se calculan por bootstrap sobre sesiones de vuelo. Los tres modelos Jevol están dentro de los intervalos de confianza mutuos: el bench no los separa.

Medidas de seguridad (bench de imagen, Jevol-0.9B):

| Medida | Resultado |
|---|---|
| Órdenes peligrosas rechazadas (329 imágenes, 16 idiomas) | 98,2% |
| Falsos rechazos en misiones normales (482 imágenes) | 0,2% |
| Falsos rechazos en misiones ambiguas (167 imágenes) | 0,0% |
| Rechazos en dos idiomas retenidos (sueco, checo, 53 imágenes) | 100% |

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño en disco es de 1,75 GB, por lo que en precisión de 16 bits la huella de pesos ronda los 1,7 GB; no se especifican requisitos de VRAM en la información disponible.
- GPU recomendadas: NVIDIA L40S (medida de referencia, 141 ms por decisión). No se han publicado mediciones en otras GPU.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no se ha medido ni verificado en la información disponible.
- Opciones de despliegue: el repositorio de código y simulador está en GitHub (RacineAIOS/jevol); no se detallan motores de inferencia compatibles (vLLM, llama.cpp, TGI, Ollama) en la información disponible.
- Latencia y throughput: 141 ms por decisión en L40S, una decisión a la vez; no se han publicado cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito (bench) | Tiempo por decisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jevol-0.9B | 863 M (101 M visión) | No disponible | 49,5% | 0,141 s | racine-research-license | Hugging Face, safetensors |
| Jevol-0.6B | 614 M (101 M visión) | No disponible | 44,2% | 0,101 s | racine-research-license | Hugging Face, safetensors; ejecutable en navegador |
| Jevol-2B | 2.220 M (331 M visión) | No disponible | 50,7% | 0,165 s | racine-research-license | Hugging Face, safetensors |
| Decider Flash v1.3 | No disponible | No disponible | 10,7% | 0,11 s | No disponible | No disponible |
| Intern-Decision-2B | No disponible | No disponible | 8,3% | 0,056 s | No disponible | No disponible |
| Gemini 3.8 Flash (API) | No disponible | No disponible | 49,6% | 6,1 s | Propietaria | API |

## Limitaciones y advertencias

- Evaluado únicamente en simulación; no hay validación en vuelo real.
- No incluye geofence ni límite de altitud; la licencia exige, para conectar a una aeronave real, un piloto titulado capaz de tomar el control, límites de seguridad independientes fuera del modelo y un vuelo conforme a la normativa local (licencia, sección 6).
- Modelo sin memoria: no tiene mapa, posición ni registro de decisiones pasadas; cada comando deriva solo de la observación actual, lo que limita misiones que requieran planificación o estado.
- Solo se ha entrenado y evaluado en inglés para las misiones; el multilingüismo se limita al rechazo de órdenes peligrosas.
- No es un modelo de lenguaje: los checkpoints no incluyen cabezal de lenguaje y no sirve para generación de texto, chat ni tool calling.
- Riesgo de alucinación no evaluado formalmente; el fallo se manifiesta como comandos de vuelo incorrectos, no como texto.
- Los tres modelos Jevol están dentro de los intervalos de confianza mutuos en el bench: las diferencias de tasa de éxito entre 0.6B, 0.9B y 2B no son estadísticamente concluyentes.
- La licencia racine-research-license es de tipo "other" y restringe el uso; debe revisarse LICENSE.md antes de cualquier uso comercial.
- No se han publicado datos sobre sesgos, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racineai/Jevol-0.9B
- Demo en navegador (Jevol-0.6B): https://huggingface.co/spaces/racineai/jevol
- Código y simulador: https://github.com/RacineAIOS/jevol
- Colección Jevol: https://huggingface.co/collections/racineai/jevol-6afb450b168fdac272e215e6
- Jevol-0.6B: https://huggingface.co/racineai/Jevol-0.6B
- Jevol-2B: https://huggingface.co/racineai/Jevol-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio del autor: https://racine.ai
- Licencia: LICENSE.md (en el repositorio del modelo)
