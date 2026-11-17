# racineai/Jevol-0.6B

## Resumen

Jevol-0.6B es un modelo de visión-lenguaje-acción (VLA) desarrollado por Racine.ai, diseñado específicamente para pilotar drones de forma autónoma. El modelo recibe en cada decisión una imagen de cámara (672 x 504 píxeles) y una misión escrita en inglés, y responde con un comando de vuelo concreto cada 0,4 segundos. No es un modelo conversacional ni de propósito general: es un controlador de vuelo neuronal que traduce percepción visual y órdenes en lenguaje natural a comandos de movimiento, altitud y desplazamiento lateral.

Técnicamente, Jevol-0.6B es un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, del que conserva únicamente 12 de las 24 capas del decodificador. El checkpoint final contiene 603.929.760 parámetros (de los cuales 101 M corresponden al codificador visual) y no incluye la cabeza del modelo de lenguaje: en su lugar, cada una de las tres preguntas de control se resuelve mediante una "sentence head" específica. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 1,3 GB.

Su relevancia actual radica en que demuestra que un modelo de menos de 1.000 millones de parámetros puede igualar o superar a modelos frontera de API (Gemini, Claude, Qwen) en una tarea de control robótico de bucle cerrado, con una latencia de decisión de 0,101 s en una NVIDIA L40S y capacidad de ejecutarse en el navegador vía WebGPU. La licencia es propietaria (racine-research-license), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5) con codificador visual y cabezas de frase para clasificación múltiple; 12 de 24 capas del decodificador |
| Parámetros totales | 603.929.760 (614 M usados en inferencia, 101 M de visión) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | float16 (PyTorch/MLX); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (entrenamiento principal); se reportan pruebas de rechazo en 16 idiomas y en dos idiomas retenidos (sueco, checo) |
| Licencia | racine-research-license (propietaria, "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jevol-0.6B parte de Qwen/Qwen3.5-0.8B y conserva solo la mitad de sus capas de decodificador (12 de 24). El modelo procesa la imagen de cámara mediante un codificador visual de 101 M de parámetros y combina esa representación con la misión en inglés para resolver tres preguntas de opción múltiple en un único forward pass: movimiento (20 opciones: cuatro velocidades de -1,5 a 3 m/s y cinco giros de -60 a 60 grados/s), altitud (5 opciones de -1,5 a 1,5 m/s) y desplazamiento lateral (3 opciones: izquierda, ninguna, derecha). Las tres respuestas componen el comando de vuelo.

Una innovación destacable es la sustitución de la cabeza del modelo de lenguaje por cabezas de frase ("sentence head") específicas para cada pregunta; el checkpoint no incluye la cabeza LM. El modelo no mantiene memoria: no tiene mapa, posición ni registro de decisiones pasadas, y cada comando se deriva exclusivamente de la observación actual. El entrenamiento incluye datos de rechazo de órdenes peligrosas ("crash into...", "kill...", "go and hit..."), de modo que el modelo aprende a quedarse quieto ante instrucciones dañinas sin un filtro separado. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Control de vuelo autónomo de drones a partir de una imagen y una orden en lenguaje natural.
- Percepción visual: interpretación de escenas urbanas y exteriores (calles, contenedores, arcos, edificios) a resolución 672 x 504.
- Comprensión de misiones en inglés expresadas de forma libre ("Follow the street between the houses", "Go to the blue container", "Fly through the next arch").
- Salida de comandos de vuelo discretizados: velocidad lineal, giro, altitud y desplazamiento lateral.
- Rechazo aprendido de órdenes peligrosas (seguridad integrada en los datos de entrenamiento, sin filtro externo).
- Robustez multilingüe parcial en la detección de órdenes peligrosas (16 idiomas, con pruebas en sueco y checo).
- Inferencia en tiempo real: 0,101 s por decisión en NVIDIA L40S; ejecutable en navegador mediante WebGPU.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento conversacional; no dispone de memoria de decisiones.

## Casos de uso

- Navegación autónoma de drones en entornos urbanos simulados: el modelo recibe la imagen de cámara y una orden como "Follow the street between the houses" y emite comandos de vuelo cada 0,4 s, adecuado para pruebas de bucle cerrado en simuladores 3D.
- Inspección de infraestructuras: órdenes como "Go to the blue container" permiten dirigir el dron hacia objetivos visuales concretos, útil para tareas de reconocimiento en entornos industriales o logísticos.
- Vuelo a través de obstáculos: la capacidad de interpretar "Fly through the next arch" y emitir comandos de altitud y giro lo hace apto para pasillos, túneles y estructuras arquitectónicas.
- Investigación en robótica y VLA: sirve como modelo de referencia pequeño (614 M parámetros) para estudiar el comportamiento de políticas de control neuronal en bucle cerrado con latencias de ~100 ms.
- Despliegue en hardware de borde: con 1,5 GB de memoria GPU en float16 en una NVIDIA L4 y ejecución en navegador vía WebGPU, es viable en estaciones de trabajo modestas y en demostraciones interactivas.
- Seguridad y rechazo de órdenes maliciosas: el modelo puede integrarse en pipelines de validación donde se verifique que órdenes peligrosas no generan movimiento, aprovechando su tasa de rechazo del 98,2% (medida en Jevol-0.9B).
- Prototipado rápido en simulación: el código y el simulador publicados en GitHub permiten entrenar y evaluar variantes sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados en el banco de vuelos en bucle cerrado sobre el split de validación (11 capturas de lugares reales en 3D ausentes del entrenamiento). Un vuelo se considera superado si la misión se completa sin colisión.

| Modelo | Tasa de éxito | Intervalo 95% | Vuelos puntuados | Tiempo por decisión |
|---|---|---|---|---|
| Piloto humano (replay) | 90,4% | no disponible | 1.350 | no disponible |
| **Jevol-0.6B** | **44,2%** | **33,3 – 55,5** | **1.350** | **0,101 s** |
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

Acuerdo con pilotos humanos en 1.500 imágenes retenidas (primera elección): movimiento 50,7%, altitud 90,4%, desplazamiento lateral 95,1%.

Velocidad de inferencia:

| Máquina | Motor | Una decisión |
|---|---|---|
| NVIDIA L4 | PyTorch, CUDA graphs, kernel fla, float16 | 58 ms, 1,5 GB de memoria GPU |
| MacBook Pro M4 Pro | MLX, float16 | 108–137 ms, 2,9 GB |
| MacBook Pro M4 Pro, Chrome | WebGPU (Space) | 246–265 ms |

## Requisitos de hardware

- VRAM estimada: 1,5 GB en float16 en NVIDIA L4 según la model card; 2,9 GB en MacBook Pro M4 Pro con MLX.
- GPU recomendadas: NVIDIA L40S (referencia de latencia, 0,101 s por decisión), NVIDIA L4 (58 ms), H100 (usada por el autor para servir Qwen de comparación).
- Cabe en GPU de consumo: sí, con 1,5–2,9 GB de memoria en float16; ejecutable también en navegador vía WebGPU.
- Opciones de despliegue: PyTorch con CUDA graphs y kernel fla; MLX en Apple Silicon; WebGPU en el Space de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 58 ms por decisión en L4, 101 ms en L40S, 108–137 ms en M4 Pro (MLX), 246–265 ms en Chrome (WebGPU).

## Comparativa con modelos similares

| Modelo | Base | Parámetros en inferencia | Tasa de éxito | Tiempo por decisión | Licencia |
|---|---|---|---|---|---|
| Jevol-0.6B | Qwen3.5-0.8B (12/24 capas) | 614 M (101 M visión) | 44,2% | 0,101 s | racine-research-license |
| Jevol-0.9B | Qwen3.5-0.8B (24/24 capas) | 863 M (101 M visión) | 49,5% | 0,141 s | racine-research-license |
| Jevol-2B | Qwen3.5-2B | 2.220 M (331 M visión) | 50,7% | 0,165 s | racine-research-license |
| Decider Flash v1.3 | no disponible | no disponible | 10,7% | 0,11 s | no disponible |
| d1-2B | no disponible | no disponible | 8,3% | 0,04 s | no disponible |
| Intern-Decision-2B | no disponible | no disponible | 8,3% | 0,056 s | no disponible |

Los tres modelos Jevol se sitúan dentro de los intervalos de confianza de los demás, por lo que el banco no los separa estadísticamente entre sí. Frente a los modelos de decisión especializados (Decider Flash, d1, Intern-Decision), Jevol-0.6B obtiene tasas de éxito notablemente superiores con latencias comparables.

## Limitaciones y advertencias

- Licencia propietaria (racine-research-license): es necesario revisar el archivo LICENSE.md antes de cualquier uso comercial; no es una licencia open source.
- El modelo no tiene memoria, mapa ni posición: cada comando se basa únicamente en la imagen actual, lo que limita tareas que requieran planificación o consistencia temporal.
- Acuerdo con pilotos humanos bajo en la dimensión de movimiento (50,7% en primera elección), lo que indica discrepancias frecuentes en la elección de velocidad y giro.
- Tasa de éxito del 44,2% en el banco de validación: no es un sistema fiable para vuelo real sin supervisión; el piloto humano obtiene 90,4%.
- Entrenado principalmente en inglés; el soporte multilingüe solo está documentado para el rechazo de órdenes peligrosas.
- Las métricas de rechazo de seguridad (98,2% de órdenes peligrosas rechazadas, 0,2% de falsos rechazos) se midieron en Jevol-0.9B, no en Jevol-0.6B, según la propia model card.
- Riesgo de alucinación visual: al depender de una única imagen y de opciones discretas, puede seleccionar comandos incorrectos ante escenas ambiguas u objetivos no vistos en entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado como modelo de propósito general.
- El checkpoint no incluye la cabeza del modelo de lenguaje, lo que impide su uso como LM convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racineai/Jevol-0.6B
- Demo en el navegador (Space): https://huggingface.co/spaces/racineai/jevol
- Código y simulador (GitHub): https://github.com/RacineAIOS/jevol
- Colección Jevol: https://huggingface.co/collections/racineai/jevol-6afb450b168fdac272e215e6
- Jevol-0.9B: https://huggingface.co/racineai/Jevol-0.9B
- Jevol-2B: https://huggingface.co/racineai/Jevol-2B
- Sitio del autor: https://racine.ai
