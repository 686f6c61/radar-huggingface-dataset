# Frosty40/mage-hand-Mage-VL-Cowork-hands-v2

## Resumen

Mage Hand (nombre completo del checkpoint: Mage-VL-Cowork-hands-v2) es un ajuste fino de grounding de interfaz gráfica sobre el modelo vision-lenguaje microsoft/Mage-VL-Cowork. Lo desarrolla Jordan Newman dentro del proyecto angelX y se publica bajo el identificador Frosty40/mage-hand-Mage-VL-Cowork-hands-v2. Su tarea es concreta: dada una captura de pantalla y una descripción del objetivo, devolver el punto de clic correspondiente. Se publica junto con angelX 0.3.0, la actualización del hackathon Muse (Meta Global AI Developer Hackathon 2026).

Técnicamente es un modelo visión-lenguaje de arquitectura LLaVA-OneVision2 (el código de modelado del checkpoint base se distribuye sin modificar), con un backbone de texto Qwen3-4B-Instruct-2507 y un total de 4.741.793.792 parámetros. El ajuste se realizó fusionando un adaptador LoRA (r=64, alpha=128, escala 2.0) sobre 252 capas lineales del modelo de lenguaje más los tensores del merger, partiendo del adaptador v1 y continuando el entrenamiento durante 1.195 pasos sobre 9.557 muestras (aproximadamente 0,8 épocas), con una pérdida media de 0,0689.

Su relevancia es acotada pero clara: mejora sustancialmente al v1 en precisión de centrado del clic (94,99 % de acierto dentro de la caja objetivo y 94,12 % a ±15 píxeles del centro, frente a 88,08 % y 78,70 % del v1) sobre un holdout de 1.258 filas. No obstante, el propio autor advierte que ese holdout es mayoritariamente sintético y que el modelo solo hace grounding de clic, sin actuación (no escribe, no hace scroll ni arrastra).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision2 (vision-language model), backbone de texto Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.741.793.792 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint microsoft/Mage-VL-Cowork, construida sobre LLaVA-OneVision2 e implementada mediante código remoto (`configuration_llava_onevision2.py` y `modeling_llava_onevision2.py`, distribuidos sin modificar en el repositorio). El componente de texto es Qwen3-4B-Instruct-2507, según el `text_config._name_or_path` del propio `config.json`; el total de 4,74 mil millones de parámetros corresponde a la combinación de torre de visión, proyector/merger y modelo de lenguaje.

El ajuste consiste en la fusión del adaptador LoRA `cand1/final` (r=64, alpha=128, escala 2.0) sobre 252 capas lineales del modelo de lenguaje y los tensores del merger, mediante el script `train/merge_lora.py` del repositorio angelX. El entrenamiento se realizó sobre datos de grounding de escritorio y web recopilados para las herramientas "hands" de angelX, continuando desde el adaptador v1: 1.195 pasos, 9.557 muestras (unas 0,8 épocas) y pérdida media de 0,0689. No se documentan en la información disponible fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Grounding de clic en interfaz gráfica: recibe una captura de pantalla y una descripción textual del objetivo y devuelve un punto de clic.
- Comprensión de imagen y texto (pipeline image-text-to-text) heredada del modelo base Mage-VL-Cowork.
- Conversación multimodal con plantilla de chat propia; el autor indica explícitamente que debe usarse la plantilla del modelo.
- Procesamiento de capturas de hasta 1920×1080 para la tarea de grounding (angelX limita el frame a esa resolución porque marcos mayores producen deriva).
- Respuesta de un solo clic por invocación; no soporta mecanografiado, scroll ni arrastre (los datos de entrenamiento son solo de clic).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso autónomas: no disponibles como tales; en angelX el clic pasa por una cápsula de aprobación humana.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Automatización de pruebas de interfaz web: el modelo localiza elementos descritos en lenguaje natural sobre capturas de pantalla y devuelve coordenadas de clic, lo que permite generar scripts de prueba de extremo a extremo con validación de posición.
- Asistentes de escritorio con aprobación humana: integrado en angelX, el modelo propone el punto de clic y una cápsula de aprobación humana autoriza la acción, reduciendo el riesgo de clics erróneos en flujos sensibles.
- RPA asistida por visión: sustituye selectores DOM frágiles por grounding visual en aplicaciones web y de escritorio, útil cuando la interfaz cambia con frecuencia y los selectores CSS se rompen.
- Navegación guiada en aplicaciones concretas: el autor reporta mejoras notables en familias como steam-navigation (±15 del centro de 0,584 a 0,977), lo que lo hace adecuado para flujos de navegación de catálogos y compras.
- Etiquetado y anotación de datasets de grounding: puede preanotar puntos de clic sobre capturas para revisión humana posterior, acelerando la construcción de corpus de computer use.
- Componente de un pipeline de agentes de computer use: como módulo especializado de "dónde hacer clic", se combina con otros modelos o reglas que gestionen la escritura, el scroll y la verificación del estado posterior a la acción.
- Evaluación comparativa de modelos de grounding: su evaluador y holdout documentados (1.258 filas, mismo orden de filas) permiten reproducir la comparación v1 frente a v2 como referencia metodológica.

## Benchmarks y rendimiento

Evaluación sobre el holdout completo (1.258 filas retenidas, mismo evaluador y mismo orden de filas para ambos modelos). Métrica principal: punto predicho dentro de la caja objetivo.

| Modelo | Acierto en caja objetivo | A ±15 del centro | Respuestas parseadas |
|---|---:|---:|---:|
| hands v1 | 88,08 % | 78,70 % | 100 % |
| hands v2 (este) | 94,99 % | 94,12 % | 100 % |

Reevaluación del mismo checkpoint en un segundo dispositivo (RTX 4080): 95,15 % en caja objetivo y 93,96 % a ±15 del centro sobre el mismo holdout. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,74 mil millones de parámetros, en FP16 serían necesarios aproximadamente 9,5 GB solo para pesos, más el overhead de la torre de visión y del runtime; en cuantizaciones de 8 bits o 4 bits el requisito bajaría, pero no se publican versiones cuantizadas.
- GPU recomendadas: no se especifican. El autor reporta evaluaciones en una RTX 4080, lo que indica que el checkpoint en precisión nativa cabe en GPUs de consumo de gama alta con 16 GB de VRAM o más.
- Cabe en GPU de consumo: sí, al menos en RTX 4080 según la reevaluación documentada; para tarjetas de 8-12 GB sería necesaria cuantización, no publicada en el repositorio.
- Opciones de despliegue: transformers con código remoto (el repositorio incluye los ficheros de modelado); el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage Hand (este) | 4,74 B | no disponible | Grounding de clic GUI | Apache-2.0 | Hugging Face (Frosty40) |
| microsoft/Mage-VL-Cowork | no disponible | no disponible | Visión-lenguaje para computer use (base) | Apache-2.0 | Hugging Face (Microsoft) |
| microsoft/Mage-VL | no disponible | no disponible | Visión-lenguaje (upstream del base) | no disponible | Hugging Face (Microsoft) |
| hands v1 (adaptador previo) | 4,74 B (misma base) | no disponible | Grounding de clic GUI | no disponible | No referenciado como repo independiente en la información disponible |

La comparación cuantitativa disponible se limita al par v1/v2 sobre el mismo holdout (94,99 % frente a 88,08 % en caja objetivo). No hay datos públicos de benchmarks frente a otros modelos de grounding GUI en la información proporcionada.

## Limitaciones y advertencias

- El holdout es aproximadamente un 74 % de replay guionizado o sintético, dominado por flujos de Steam y compras; el 94,99 % debe ponderarse en consecuencia.
- La cobertura de escritorio nativo en el holdout es de solo 12 filas: el rendimiento en aplicaciones nativas está efectivamente sin medir.
- Los datos de entrenamiento son solo de clic: el modelo hace grounding, no actuación; no escribe, no hace scroll ni arrastra.
- La precisión de grounding offline no equivale a completar tareas en vivo; no hay evidencia publicada de tasas de éxito de extremo a extremo.
- Deriva con marcos mayores de 1920×1080: angelX limita el frame de grounding a esa resolución y los marcos mayores producen desplazamiento del punto.
- Idioma: solo inglés, lo que limita su uso con interfaces o descripciones de objetivo en castellano u otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; el sistema de angelX mitiga respuestas corruptas o fuera de marco con fallo cerrado (fail closed) y aprobación humana.
- Sesgos: no documentados; el sesgo del dataset hacia flujos de Steam y compras puede degradar el rendimiento en otras familias de aplicaciones.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías y el modelo depende del código remoto del checkpoint base para cargarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frosty40/mage-hand-Mage-VL-Cowork-hands-v2
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Upstream del base: https://huggingface.co/microsoft/Mage-VL
- Backbone de texto: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio angelX: https://github.com/newjordan/angelX
- Ficheros de procedencia y evaluación: `PROVENANCE.md` junto a los pesos y en el repositorio angelX
- Script de fusión LoRA: `train/merge_lora.py` en el repositorio angelX
- Datos y scripts de evaluación: `scripts/bench/mage-hands/` en el repositorio angelX
