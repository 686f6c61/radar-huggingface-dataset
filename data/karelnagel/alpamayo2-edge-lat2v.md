# karelnagel/alpamayo2-edge-lat2v

## Resumen

Alpamayo2-edge-lat2v es un ajuste fino (fine-tune) del modelo NVIDIA Alpamayo2-Edge, un modelo visión-lenguaje-acción (VLA) orientado a conducción autónoma. Lo desarrolla el usuario karelnagel y su propósito concreto es adaptar el modelo original, que espera el conjunto de cámaras de NVIDIA, a una configuración reducida de dos cámaras frontales: una de 120 grados y otra de 30 grados, ambas a 768x432. El modelo genera planes de trayectoria que se ejecutan en la rama `alpamayo` del fork asiusai/openpilot sobre un dispositivo Asius v0 con GPU AMD externa.

El modelo base es un VLA con unos 2.651 millones de parámetros (2,65 B) que combina un codificador visual, un componente de lenguaje y un experto de trayectorias que emplea muestreo por difusión (flow matching). El fine-tune corrige tres fallos observados con la entrada de dos cámaras: un sesgo lateral de aproximadamente 0,4 m a la izquierda del centro del carril, un giro insuficiente en curvas y una variabilidad entre fotogramas que provocaba oscilación en el carril.

Es relevante ahora porque demuestra que es viable adaptar un VLA de conducción a hardware y cámaras distintos de los previstos por el fabricante con un coste de entrenamiento modesto (una época, menos de cuatro horas en dos GPU de consumo AMD RX 7900 XTX) y con un pipeline de despliegue que incluye pesos en FP8 y 4 bits, además de grafos compilados para GPUs AMD gfx1200. Se distribuye bajo licencia OpenMDW-1.1, la misma del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) con experto de trayectorias por difusión (flow matching); detalles internos de la arquitectura base no disponibles |
| Parámetros totales | 2.651.163.378 (2,65 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint completo y runtime), FP8 y 4 bits (caché del runtime de openpilot) |
| Idiomas soportados | inglés (`en`) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16); `weights.bin` + `index.json` para FP8/4 bits; grafos compilados para AMD gfx1200 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del VLA Alpamayo2-Edge de NVIDIA: un componente de visión-lenguaje que procesa las imágenes de cámara y texto de navegación, y un experto de trayectorias que genera el plan mediante muestreo por difusión con flow matching. El ajuste se realizó con LoRA de rango 16 sobre el experto de trayectorias y LoRA de rango 8 sobre las partes de lenguaje y visión del VLM, fusionados posteriormente en los pesos finales. La función de pérdida combina flow matching, una pérdida sobre el plan que produce el muestreador de 2 pasos con ruido inicial cero y una pérdida de error lateral (cross-track) medida en metros.

Los datos de entrenamiento provienen de dos fuentes: vistas de dos cámaras de clips del dataset `nvidia/PhysicalAI-Autonomous-Vehicles`, usando la trayectoria humana como objetivo, y aproximadamente 5.700 momentos grabados con un Tesla Model 3 equipado con las cámaras Asius v0, cuyos objetivos regresan al centro del carril en unos 3 segundos. El entrenamiento consistió en una sola época de 3 h 48 min sobre dos GPU AMD RX 7900 XTX. El modelo base se tomó en la revisión `b92b6aa326bd3e2235db28f248ad5a30b5890e64`.

## Capacidades

- Planificación de trayectorias de conducción a partir de dos cámaras frontales (120° y 30°, 768x432).
- Procesamiento de historial temporal: cinco fotogramas por cámara en los instantes -2, -1, -0,5, -0,1 y 0 s.
- Generación de planes mediante muestreo por difusión con 2 pasos Euler y ruido inicial cero (temperatura 0).
- Razonamiento en modo greedy sobre el componente de lenguaje.
- Condicionamiento por texto de navegación: `Continue straight.` sin ruta, o texto de maniobra cuando el giro está a 150 m o menos.
- Integración con el runtime de openpilot (rama `alpamayo`) con verificación SHA-256 de los ficheros descargados.
- No dispone de soporte documentado de tool calling, agentes genéricos ni otras capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en conducción autónoma con configuraciones reducidas de cámara: permite estudiar cómo se comporta un VLA de planificación cuando se le priva de la mayoría de sensores del rig original, usando dos cámaras frontales y el historial de cinco fotogramas.
- Prototipado sobre hardware no NVIDIA: los grafos compilados para AMD gfx1200 (RX 9060, RX 9060 XT) y los pesos FP8/4 bits permiten desplegar el modelo en un dispositivo Asius v0 con GPU AMD externa, evitando 10-20 minutos de compilación en el primer arranque.
- Evaluación de ajustes finos con presupuesto reducido: sirve como referencia de metodología (LoRA + flow matching + pérdida cross-track, una época en dos GPU de consumo) para equipos que quieran adaptar un VLA a su propio vehículo o montaje de cámaras.
- Análisis de corrección de sesgos de planificación: el modelo documenta métricas concretas de posición lateral, ruido del plan y oscilación, útiles para comparar técnicas de corrección sobre el modelo original.
- Integración en pipelines de simulación offline: la pérdida cross-track y las métricas de error lateral a 3 s permiten validar planes contra clips del dataset de NVIDIA antes de pruebas en pista.
- Estudio de cuantización en modelos de conducción: la comparación entre BF16 y FP8 (diferencias dentro de 0,02 m en las métricas) aporta evidencia sobre la viabilidad de cuantizar el experto de trayectorias sin degradar el plan.
- Base para experimentos de navegación condicionada por texto: el uso de instrucciones de maniobra a 150 m o menos abre la puerta a probar variantes de condicionamiento lingüístico en entornos simulados.

## Benchmarks y rendimiento

Los resultados publicados son comparaciones offline contra el modelo original con la misma entrada de dos cámaras:

| Métrica | Original | lat2v |
|---|---|---|
| Posición lateral donde se estabiliza el plan (izquierda negativa) | -0,48 m | +0,07 m |
| Ruido del plan a 40 m (desviación estándar) | 0,095 m | 0,047 m |
| Oscilación simulada en el carril (pico a pico) | 1,00 m | 0,32 m |
| Ratio de giro a 3 s en el coche de prueba (1 = giro realizado) | 0,75 | 0,93 |
| Error lateral a 3 s en clips de NVIDIA | no disponible | 0,11 m (original de seis cámaras: 0,11 m) |

Los pesos FP8 del runtime de openpilot reproducen estas puntuaciones con una diferencia inferior a 0,02 m. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 2,65 B de parámetros, el checkpoint BF16 ocupa aproximadamente 5,3 GB y la variante de 4 bits alrededor de 1,3-1,5 GB, sin contar activaciones ni caché.
- GPU recomendadas: AMD RX 9060 y RX 9060 XT (gfx1200) cuentan con grafos precompilados; el entrenamiento se realizó en dos AMD RX 7900 XTX. No se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, según el diseño del runtime (FP8 y 4 bits) y el uso de una GPU AMD externa en el dispositivo Asius v0.
- Opciones de despliegue: runtime de la rama `alpamayo` de asiusai/openpilot; el código de NVIDIA (`alpamayo2-edge`) puede cargar el checkpoint BF16 completo para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo está pensado para inferencia en tiempo real en el vehículo con 2 pasos Euler y ruido inicial cero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alpamayo2-edge-lat2v | 2,65 B | no disponible | 2 cámaras frontales (120° y 30°) | OpenMDW-1.1 | Hugging Face (karelnagel) |
| nvidia/Alpamayo2-Edge | no disponible en la información | no disponible | rig de seis cámaras de NVIDIA | OpenMDW-1.1 | Hugging Face (nvidia) |
| Otros VLA de conducción | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; el único contraste documentado es con el modelo base, que requiere el rig de seis cámaras y presenta los sesgos descritos.

## Limitaciones y advertencias

- Es software de investigación: no es un sistema de conducción con certificación de seguridad y requiere supervisión humana permanente.
- Los datos de vista real provienen de un solo coche, un solo montaje de cámara y una sola región; la generalización a otros vehículos o montajes no está validada.
- En curvas el modelo empieza a girar demasiado pronto, según la única prueba en pista del 2026-11-24.
- No se han probado condiciones de noche, lluvia, nieve ni tráfico denso.
- El modelo no tiene mecanismo de reserva (fallback); la rama de openpilot bloquea la activación cuando no hay un plan fresco disponible.
- Solo se entrenaron y probaron los ajustes documentados (ruido inicial cero, 2 pasos Euler, razonamiento greedy); el ruido inicial aleatorio y 10 pasos producen planes distintos.
- Idioma limitado al inglés para el texto de navegación.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible.
- Licencia OpenMDW-1.1 para los pesos; el código de NVIDIA es Apache-2.0 y el runtime de openpilot, MIT. Conviene revisar los términos de OpenMDW-1.1 antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karelnagel/alpamayo2-edge-lat2v
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Rama de openpilot con soporte Alpamayo: https://github.com/asiusai/openpilot/tree/alpamayo
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
