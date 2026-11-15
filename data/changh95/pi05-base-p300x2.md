# changh95/pi05-base-p300x2

## Resumen

pi05-base-p300x2 es un paquete de despliegue optimizado del modelo VLA (vision-language-action) Pi-0.5 de Physical Intelligence, adaptado por el usuario changh95 para ejecutarse sobre dos placas Tenstorrent Blackhole p300c (un QuietBox 2, cuatro chips en total). No se trata de un modelo nuevo entrenado desde cero, sino de una reimplementación de inferencia del checkpoint `lerobot/pi05_base` sobre el stack `tt-metal`/`ttnn`, con kernels persistentes y presets construidos en tiempo de arranque del servidor.

El problema que resuelve es la latencia y el coste energético de servir un modelo de control robótico de tipo flow-matching en hardware no-GPU. Para ello empaqueta las etapas VISION, PREFIX y EXPERT del modelo como programas `ttnn.generic_op` persistentes sobre 110 núcleos por chip, con una traza Metal por bucket de prompt. Ofrece tres perfiles de servicio (un robot con malla de 4 chips, multi-robot con un modelo completo por chip y desagregado 3+1) y ajusta la colocación de chips según el estado térmico de la placa.

La relevancia es doble: por un lado demuestra latencias de decenas de milisegundos en hardware Tenstorrent para un VLA real; por otro, documenta con detalle los límites térmicos del QuietBox 2 (clamp a 800 MHz en el chip más caliente) y las estrategias para mantener el SLO. El repo pesa 9,7 GB y la licencia es Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA Pi-0.5 (vision-language-action) con flow-matching para la cabeza de acciones; en esta implementación, megakernel persistente sobre `ttnn` con etapas VISION, PREFIX y EXPERT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | buckets de prompt de 32, 64, 128 y 224 tokens, más buckets extra c1 L192, c2 L160 y c4 L96 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de control robótico) |
| Licencia | Gemma (`license_link: https://ai.google.dev/gemma/terms`) |
| Formato de pesos | pesos del modelo base `lerobot/pi05_base`; el paquete se distribuye vía `tt-model` (repo de 9,7 GB) |

Otros parámetros operativos relevantes: chunk de acciones H configurable de 1 a 64 (bucket de filas de acción 32 o 64), pasos de flow-matching N de 1 a 10, y 1 a 4 cámaras de entrada.

## Arquitectura y entrenamiento

El modelo subyacente es Pi-0.5 de Physical Intelligence, un VLA que combina un backbone visión-lenguaje con una cabeza de acciones entrenada por flow-matching; el paper de referencia es arXiv:2504.16054 y el código upstream es `Physical-Intelligence/openpi`. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La contribución de este paquete es de inferencia, no de entrenamiento. Cada chip ejecuta un megakernel multi-config con VISION, PREFIX y EXPERT como programas persistentes `ttnn.generic_op` sobre 110 núcleos, con una traza Metal por bucket de prompt. En el perfil `single-robot`, una malla `FABRIC_1D_RING` 1x4 asigna la VISION de cada cámara a su propio chip, reparte el PREFIX en paralelo de secuencia sobre los 4 chips (con intercambio K/V en el kernel vía fabric en cada capa) y coloca el EXPERT en un chip frío, con colocación estática consciente de la temperatura. En `multi-robot`, cada chip ejecuta el modelo completo y agrupa por lotes los expertos de acción de los robots asignados. En `disaggregated`, tres chips hacen VISION + PREFIX y el cuarto el experto de acción por lotes, moviendo las cachés K/V por el host. Las acciones del perfil de malla son bit-idénticas a las de un solo chip.

## Capacidades

- Control robótico por instrucciones en lenguaje natural a partir de imágenes de cámara y un vector de estado (`state`), devolviendo un chunk de acciones.
- Entrada multimodal: 1 a 4 cámaras (cámara base primero) más prompt de texto o tokens pre-tokenizados.
- Generación de acciones por flow-matching con número de pasos N configurable (1 a 10) y horizonte de chunk H de 1 a 64.
- Servicio multi-robot: campo `robot_id` en la petición para vincular cada robot a un chip, con límite de admisión R_max derivado del SLO.
- Perfiles de despliegue seleccionables: `single-robot` (mínima latencia), `multi-robot` (por defecto) y `disaggregated`.
- API HTTP `POST /predict` con `images`, `prompt` o `tokens`, `state`, `seed`, `prompt_bucket` y `robot_id`.
- Watchdog de cuelgues que mantiene el servicio en los chips sanos.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Manipulación robótica de un solo brazo con baja latencia: con el perfil `single-robot` y dos cámaras se obtiene p50 de 38,5 ms en frío y 41,4 ms por HTTP (p99 42,4 ms), adecuado para bucles de control cerrados que requieren decenas de hertzios.
- Granjas de robots con la misma configuración: el perfil `multi-robot` admite 4 robots con SLO p50 100 / p99 110 ms y sirve la quinta petición con HTTP 503, lo que permite razonar sobre capacidad y sobrecarga de forma explícita.
- Recogida de objetos tipo "pick up the cube": el ejemplo de la model card usa dos imágenes (base y muñeca) y un vector de estado de 8 dimensiones, un patrón directamente reutilizable en tareas de pick-and-place.
- Evaluación de hardware Tenstorrent frente a GPU: el paquete incluye benchmarks reproducibles (`tests/perf/bench_pi05_sp.py`) con latencias y energías por llamada, útil para comparar coste por inferencia en despliegues de robótica.
- Investigación en serving desagregado: el perfil `disaggregated` separa VISION + PREFIX del experto de acción y mueve cachés K/V por host, un banco de pruebas para estudiar paralelismo de secuencia y particionado.
- Despliegue en entornos con restricciones térmicas: la colocación térmica reduce de 61,4 a 42,1 ms por llamada con 2 cámaras en régimen estacionario (-31 %) y de 80,6 a 64,8 ms con 4 cámaras (-20 %), relevante en armarios cerrados sin refrigeración adicional.
- Control multi-cámara con cobertura ampliada: con 4 cámaras el perfil de malla mantiene 50,0 ms en frío frente a 90,6 ms en un solo chip, lo que habilita configuraciones de percepción más ricas sin rebasar el presupuesto temporal.

## Benchmarks y rendimiento

Latencia por llamada, un robot, bucket de 224 tokens, 64 filas de acción, N = 10, p50 host-to-host, chips fríos, media de 2 ejecuciones (2026-10-13):

| Configuración | 1 cámara | 2 cámaras | 3 cámaras | 4 cámaras |
|---|---:|---:|---:|---:|
| `single-robot` (malla de 4 chips) | 36,0 ms | 38,5 ms | 43,6 ms | 50,0 ms |
| Un solo chip (`PI05MegakernelTTNN`) | 41,2 ms | 52,6 ms | 72,4 ms | 90,6 ms |

Régimen térmico estacionario (replay de traza, colocación legacy frente a térmica):

| Configuración | Latencia legacy | Latencia térmica | Energía legacy | Energía térmica |
|---|---:|---:|---:|---:|
| 2 cámaras | 61,4 ms | 42,1 ms (-31 %) | 20,1 J | 15,5 J |
| 4 cámaras | 80,6 ms | 64,8 ms (-20 %) | 27,8 J | 24,0 J |

Otros datos publicados:

| Métrica | Valor |
|---|---|
| HTTP `single-robot`, 2 cámaras, prompt de 200 tokens en bucket 224, frío | cliente p50 41,4 / p99 42,4 ms; servidor p50 39,9 ms |
| Multi-robot, 4 robots, 2 cámaras, H 50, bucle cerrado, frío | p50 53 ms |
| Multi-robot, 4 robots, régimen térmico (3 de 4 chips a 800 MHz) | p50 83,0 / p99 84,1 ms; 52 req/s; 6,65 J por petición |
| Multi-robot por HTTP, 4 robots, frío, 60 s | 69,7 req/s; cliente p50 56,4 / p99 60,4 ms; ninguna por encima del SLO |
| Frente a kernels previos (89d0ceb), un chip 2 cámaras en caliente | -5,1 % tiempo, -4,8 % energía por llamada |
| Frente a kernels previos, 4 robots | -5 a -6 % energía por petición, +5 % throughput |
| Estabilidad | ~11 veces menos cuelgues en los primeros 20 min de carga; residual ~0,7 cuelgues por hora de carga en 4 chips |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: dos placas Tenstorrent Blackhole p300c (QuietBox 2, 4 chips). No es un modelo ejecutable en GPU convencional sin recompilar el stack.
- VRAM: no aplica; el modelo usa la memoria GDDR de los chips Blackhole. El repo de pesos ocupa 9,7 GB.
- Perfiles de reparto: 4 chips como un solo modelo (`single-robot`), 4 chips con un modelo completo cada uno (`multi-robot`), o 3 + 1 (`disaggregated`).
- Despliegue: CLI `tt-model` (`tt-model pull ... --with-weights`, `tt-model serve ... --profile ...`); servidor HTTP en el puerto 20000. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; en multi-robot por HTTP se alcanzan 69,7 req/s con 4 robots en frío.
- Térmica: los ventiladores del QuietBox 2 son fijos; bajo carga sostenida el GDDR del chip más caliente llega a 89 °C y el firmware limita su reloj de IA a 800 MHz (frente a 1350 MHz).

## Comparativa con modelos similares

| Modelo | Hardware | Latencia (2 cámaras) | Multi-robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-base-p300x2 (este) | 4 chips Blackhole p300c | 38,5 ms frío / 42,1 ms térmico | Sí, con SLO y 503 | Gemma | Hugging Face |
| pi05-base-p150 (mismo autor) | 1 chip Blackhole p150 | no disponible en esta ficha | no disponible | Gemma | Hugging Face |
| Pi-0.5 base (`lerobot/pi05_base`) | GPU (stack openpi) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |

La comparación directa con alternativas GPU no puede cuantificarse con la información disponible; la model card solo aporta la comparación interna entre la malla de 4 chips y la ejecución en un único chip del mismo hardware.

## Limitaciones y advertencias

- Dependencia de hardware propietario: requiere Blackhole p300c y el stack `tt-metal`/`ttnn`; no es portable a GPU sin trabajo de reimplementación.
- Estabilidad: persiste un residuo de aproximadamente 0,7 cuelgues por hora de carga en 4 chips; el watchdog mantiene el servicio en los chips sanos, pero implica degradación parcial.
- Térmica: en carga sostenida el reloj se limita a 800 MHz y la latencia sube (por ejemplo, de 53 a 83 ms p50 en multi-robot con 4 robots); el rendimiento en frío no es representativo de producción continua.
- Capacidad acotada: el límite de admisión R_max se deriva del SLO y las peticiones por encima reciben HTTP 503; no hay elasticidad más allá de los 4 chips.
- Configuración fija por servidor: todas las peticiones de un servidor comparten cámaras, H y N, lo que impide mezclar configuraciones heterogéneas.
- Contexto corto: los buckets de prompt llegan como máximo a 224 tokens, insuficiente para instrucciones largas o diálogo multi-turno.
- Idiomas: no se declaran idiomas soportados; el modelo está pensado para instrucciones de control, no para generación de texto general.
- Licencia Gemma: uso comercial sujeto a los términos de Google (`https://ai.google.dev/gemma/terms`); conviene revisarlos antes de un despliegue en producto.
- Sin datos publicados sobre sesgos, tasa de alucinación o robustez fuera de las tareas robóticas evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/pi05-base-p300x2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Versión de un solo chip: https://huggingface.co/changh95/pi05-base-p150
- Paper: https://arxiv.org/abs/2504.16054
- Código upstream: https://github.com/Physical-Intelligence/openpi
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Colección de robótica del autor: https://huggingface.co/collections/changh95/robotics
