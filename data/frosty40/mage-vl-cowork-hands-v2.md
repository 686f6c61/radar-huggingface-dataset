# Frosty40/Mage-VL-Cowork-hands-v2

## Resumen

Mage-VL-Cowork-hands-v2 es un ajuste fino (fine-tune) de microsoft/Mage-VL-Cowork, un modelo de vision-lenguaje orientado a "computer use", publicado por el desarrollador Jordan Newman (usuario Frosty40) dentro del proyecto angelX. El modelo resuelve una tarea muy concreta: dado un captura de pantalla y una descripcion de un elemento objetivo, devolver el punto de clic (click point) sobre la interfaz grafica. Es, por tanto, un modelo de GUI grounding puro, no un agente generalista.

Tecnicamente se obtiene fusionando (merge) un adaptador LoRA sobre el modelo base. El adaptador tiene rango r=64, alpha=128 y escala 2.0, y sustituye 252 capas lineales del modelo de lenguaje mas los tensores del merger multimodal. El checkpoint resultante tiene 4.741.793.792 parametros (~4,7 mil millones) y un repositorio de 9,5 GB en safetensors. La arquitectura declarada es llava_onevision2, la misma familia del modelo base de Microsoft.

Su relevancia es acotada pero clara: se publica junto con angelX 0.3.0 (Muse Hackathon Update, Meta Global AI Developer Hackathon 2026) y mejora de forma sustancial la precision de centrado respecto a su version anterior (hands v1), pasando de 78,70% a 94,12% de aciertos dentro de +/-15 pixeles del centro del objetivo en el holdout del autor. Es un modelo pequeno, de licencia Apache-2.0, pensado para integrarse en un bucle de automatizacion de escritorio con aprobacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llava_onevision2 (vision-lenguaje, transformers con custom_code) |
| Parametros totales | 4.741.793.792 (~4,7 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint microsoft/Mage-VL-Cowork, construido sobre la arquitectura llava_onevision2, que combina un codificador visual con un modelo de lenguaje y un proyector (merger) que alinea ambos espacios. El autor no detalla el backbone del modelo de lenguaje ni el codificador visual en la informacion disponible; solo indica que la fusion del LoRA sustituye 252 capas lineales del modelo de lenguaje y los tensores del merger.

El entrenamiento parte del adaptador v1 y se continua durante 1.195 pasos sobre 9.557 muestras (aproximadamente 0,8 epocas), con una perdida media de 0,0689. Los datos son de grounding de escritorio y web, recopilados especificamente para las herramientas "hands" del proyecto angelX (scripts/bench/mage-hands/). No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares (captura, descripcion) -> punto de clic. El script de fusion esta disponible en train/merge_lora.py del repositorio angelX.

## Capacidades

- GUI grounding de un solo clic: dada una imagen de pantalla y una descripcion de objetivo, devuelve las coordenadas del punto a pulsar.
- Localizacion de elementos en interfaces de escritorio y web hasta 1920x1080 (angelX limita el frame de grounding a esa resolucion).
- Comprension de imagen y texto en un pipeline image-text-to-text.
- Salida de coordenadas parseable (100% de respuestas parseadas en la evaluacion del autor).
- Uso mediante la plantilla de chat propia del modelo (chat template especifico).
- No soporta explicitamente tool calling, agentes multi-paso, vision mas alla del grounding, audio ni modo thinking segun la informacion disponible.

## Casos de uso

- Automatizacion de escritorio asistida: integrar el modelo en un bucle que capture la pantalla, describa el objetivo ("boton de enviar", "pestana de ajustes") y obtenga el punto de clic; el modelo actua como localizador y un humano aprueba la accion antes de ejecutarla.
- Testing de interfaces (UI testing): generar clics sobre elementos descritos en pruebas end-to-end de aplicaciones web o de escritorio, sustituyendo selectores fragiles por grounding visual.
- RPA con vision: pipelines de robotica de procesos que necesitan pulsar elementos cuyo selector DOM no es estable o no existe (aplicaciones nativas, canvas, juegos).
- Asistentes de accesibilidad: traducir instrucciones en lenguaje natural a coordenadas de pantalla para usuarios con dificultades motoras, con la capsula de aprobacion humana como red de seguridad.
- Navegacion guiada en flujos web: automatizar la localizacion de botones en flujos de compra o formularios descritos por el usuario, siempre que la resolucion no supere 1920x1080.
- Investigacion en grounding visual: servir como checkpoint de referencia pequeno (~4,7 B) y de licencia permisiva para experimentos de localizacion de elementos en capturas, con datos y hashes de procedencia publicados.

## Benchmarks y rendimiento

Evaluacion del autor sobre un holdout completo de 1.258 filas, mismo evaluador y mismo orden para ambos modelos. Metrica principal: punto predicho dentro de la caja objetivo.

| Modelo | Acierto en caja objetivo | Dentro de +/-15 del centro | Parseadas |
|---|---:|---:|---:|
| hands v1 | 88,08% | 78,70% | 100% |
| hands v2 (este) | 94,99% | 94,12% | 100% |

El autor reporta ademas una reevaluacion del mismo checkpoint en un segundo dispositivo (RTX 4080) con 95,15% en caja y 93,96% en +/-15 sobre el mismo holdout. La mejora principal frente a v1 es de precision de centrado (por ejemplo, en navegacion de Steam el +/-15 pasa de 0,584 a 0,977). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~4,7 B parametros, en fp16 serian aproximadamente 9,5 GB de pesos, y en cuantizaciones de 8 o 4 bits cabria en GPUs de consumo con 8-12 GB, aunque no se confirman formatos GGUF en el repositorio.
- GPU recomendadas: el autor cita una RTX 4080 para la reevaluacion; GPUs profesionales tipo A100 o H100 no se mencionan pero son compatibles por tamano.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4080, RTX 4090 y tarjetas con 12 GB o mas en fp16; en cuantizacion podria caber en 8 GB, sin datos confirmados.
- Opciones de despliegue: transformers con custom_code (requiere confiar en el codigo remoto del repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-hands-v2 | ~4,7 B | no disponible | GUI grounding (clic unico) | Apache-2.0 | HuggingFace |
| microsoft/Mage-VL-Cowork (base) | no disponible | no disponible | Vision-lenguaje / computer use | no disponible | HuggingFace |
| hands v1 (adaptador previo) | ~4,7 B (mismo base) | no disponible | GUI grounding | Apache-2.0 (presumible) | HuggingFace |

No se dispone de datos de benchmarks de terceros ni de comparaciones con otros modelos de grounding (por ejemplo, familias tipo UI-TARS o Qwen-VL) en la informacion proporcionada.

## Limitaciones y advertencias

- El holdout es aproximadamente 74% replay guionizado/sintetico, dominado por flujos de Steam y compras; el 94,99% debe ponderarse con cautela.
- La cobertura de escritorio nativo en el holdout es de solo 12 filas: el rendimiento en aplicaciones nativas esta practicamente sin medir.
- Los datos de entrenamiento son solo de clic: no hay type, scroll ni drag. El checkpoint localiza, no actua.
- La precision de grounding offline no equivale a completar tareas en vivo.
- El modelo esta pensado para frames de hasta 1920x1080; frames mayores derivan.
- Solo soporta ingles.
- Es necesario usar la plantilla de chat propia del modelo; respuestas corruptas o fuera de frame fallan de forma cerrada (fail closed).
- Requiere cargar codigo personalizado (custom_code) del repositorio, lo que implica un riesgo de cadena de suministro a evaluar.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Frosty40/Mage-VL-Cowork-hands-v2
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Repositorio angelX: https://github.com/newjordan/angelX
