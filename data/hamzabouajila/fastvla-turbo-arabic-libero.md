# hamzabouajila/fastvla-turbo-arabic-libero

## Resumen

FastVLA Turbo Arabic Libero es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado por Hamza Bouajila y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como el primer modelo de "IA física" en árabe, construido sobre la arquitectura FastVLA Turbo, un framework de entrenamiento y ajuste fino de VLA optimizado para entornos con recursos limitados. El modelo resuelve el problema de generar trayectorias de acción continuas y multi-paso a partir de instrucciones en árabe y observaciones visuales multi-cámara, sustituyendo los esquemas discretizados de un solo paso que acumulan errores compuestos.

La propuesta técnica se apoya en tres innovaciones: compresión espacial de tokens visuales mediante un fusionador de parches 2x2 que reduce la secuencia visual un 75%, generación de trayectorias continuas de 16 pasos (112 grados de libertad) mediante flow-matching con transporte óptimo, y caché de características visuales de un ViT SigLIP-So400M de 428M de parámetros que se elimina de la VRAM durante el entrenamiento. El resultado es un modelo que, según la model card, ejecuta inferencia a 10 Hz en una GPU Tesla T4 de 16 GB.

El modelo se ajusta sobre el dataset `hamzabouajila/ar-libero-10-image`, una versión en árabe del benchmark LIBERO-10 con vistas multi-cámara, e incluye tareas multi-etapa como "أطفئ الفرن ووضع وعاء الموكا عليه". Su relevancia actual radica en demostrar que es posible entrenar y desplegar VLA de 7B parámetros en hardware de consumo y en plataformas gratuitas como Colab o Kaggle, abriendo la robótica basada en lenguaje a investigadores sin acceso a clústeres de GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en LLM de 7B con encoder visual SigLIP-So400M (428M), fusionador espacial 2x2 y cabeza de acción con flow-matching |
| Parámetros totales | 7B (según la model card; desglose exacto no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la secuencia del LLM se describe como 176 tokens con compresión espacial, frente a 544 sin ella) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también se mencionan adaptadores LoRA y dependencia de PEFT) |

## Arquitectura y entrenamiento

FastVLA Turbo es un transformer multimodal que combina un LLM de 7B parámetros con un encoder visual SigLIP-So400M. La entrada consiste en dos vistas de cámara (vista del agente en tercera persona y vista de muñeca del gripper) más una instrucción en lenguaje natural. La innovación principal es el fusionador de parches espaciales 2x2, que agrupa tokens adyacentes mediante proyección lineal y reduce la secuencia visual de 512 a 128 tokens (-75%), lo que a su vez recorta la secuencia total del LLM de 544 a 176 tokens (-67,6%). La cabeza de acción genera trayectorias continuas de 16 pasos con 7 grados de libertad cada una (112 DoF continuos) mediante flow-matching con transporte óptimo, resueltas en 10 pasos de integración del campo de velocidades ODE.

El entrenamiento emplea caché de características visuales: las features de SigLIP se pre-extraen una vez y el ViT se expulsa de la VRAM durante el entrenamiento (0 MB de huella), lo que permite ajustar el modelo en GPUs de 16 GB. El ajuste fino se realiza sobre el dataset `hamzabouajila/ar-libero-10-image`, una adaptación al árabe de LIBERO-10 con vistas multi-cámara, e incluye tareas multi-etapa. La model card menciona el uso de LoRA, PEFT, Unsloth y kernels Triton, aunque no se detalla el número de tokens de entrenamiento ni la composición completa del dataset. No se especifica si hubo RLHF o DPO; el objetivo de acción es flow-matching, no preferencias humanas.

## Capacidades

- Generación de trayectorias de acción robótica continuas de 16 pasos con 7 DoF por paso (posición, orientación y gripper).
- Comprensión de instrucciones en árabe para tareas de manipulación robótica, incluidas tareas multi-etapa.
- Procesamiento de entrada visual multi-cámara (vista del agente y vista de muñeca).
- Razonamiento viso-espacial para localizar objetos y planificar secuencias de manipulación.
- Ejecución de inferencia en tiempo real a 10 Hz en GPU Tesla T4.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: planificación de tareas multi-etapa en el dominio robótico, sin soporte documentado de agentes genéricos.
- Capacidades multilingües: árabe e inglés.
- Capacidades especiales: flow-matching multi-paso, compresión espacial de tokens, caché de visión con huella cero de ViT en VRAM.

## Casos de uso

- Manipulación robótica con instrucciones en árabe: el modelo recibe una orden como "أطفئ الفرن ووضع وعاء الموكا عليه" junto con las vistas de cámara y genera la trayectoria de 16 pasos para ejecutarla, lo que permite operar brazos robóticos en entornos donde el operador habla árabe.
- Investigación en VLA con presupuesto limitado: al caber en una Tesla T4 de 16 GB y ejecutar a 10 Hz, permite reproducir experimentos de robótica basada en lenguaje en Colab o Kaggle sin alquilar H100.
- Evaluación comparativa sobre LIBERO-10 en árabe: sirve como referencia para medir el impacto de la compresión espacial y el flow-matching frente a VLA discretizados de un solo paso.
- Automatización de tareas domésticas multi-etapa: la planificación de 16 pasos continuos reduce el error compuesto en secuencias largas como abrir el horno, colocar un recipiente y cerrar, adecuada para entornos de cocina simulados.
- Prototipado de interfaces voz-a-acción: combinado con un ASR en árabe, el modelo puede cerrar el bucle entre una orden hablada y la ejecución motora en un robot de laboratorio.
- Formación y docencia en robótica: el código de inferencia basado en `transformers`, `peft` y módulos `fastvla` facilita demostraciones reproducibles en cursos de IA física sin infraestructura dedicada.
- Ajuste fino sobre nuevos datasets árabes: al estar construido sobre el framework FastVLA con soporte de LoRA y Unsloth, sirve como punto de partida para adaptar el modelo a otros dominios robóticos en árabe.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan FastVLA Turbo (con fusión espacial) frente a un VLA SOTA estándar (SigLIP en vivo), medidos en una NVIDIA Tesla T4 de 16 GB:

| Métrica | VLA SOTA estándar | FastVLA Turbo | Ventaja |
|---|---|---|---|
| Tokens visuales por paso | 512 (256 x 2) | 128 (64 x 2) | -75,0% |
| Secuencia total del LLM | 544 tokens | 176 tokens | -67,6% |
| Latencia por paso | 1.868,4 ms | 993,4 ms | 1,88x más rápido |
| Throughput | 0,54 step/s | 1,01 step/s | 1,88x |
| VRAM pico en T4 | 9,40 GB (falla con B=4) | 6,19 GB | -44,6% |
| VRAM libre en T4 | 5,17 GB | 8,38 GB | mayor margen |
| Horizonte de acción | 1 paso (discreto) | 16 pasos continuos (112 DoF) | elimina error compuesto |
| Objetivo de acción | Cross-Entropy / Huber | Flow-Matching continuo (OT) | campo de velocidades con transporte óptimo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es de robótica y no de lenguaje general. La métrica declarada en los metadatos es `trajectory_l2_error`, pero no se proporciona su valor numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,19 GB de pico en Tesla T4 según la model card; el modelo completo en precisión nativa requiere más, pero no se detalla.
- GPU recomendadas: NVIDIA Tesla T4 (16 GB), NVIDIA L4, Google Colab y Kaggle como plataformas validadas.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) según el pico de 6,19 GB reportado; no se confirma en GPUs de 6 GB.
- Opciones de despliegue: framework propio `fastvla` (GitHub BouajilaHamza/fastvla), con dependencias de `transformers`, `peft` y kernels Triton. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 993,4 ms por paso y 1,01 step/s en T4, equivalente a inferencia en tiempo real a 10 Hz según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVLA Turbo Arabic Libero | 7B | no disponible | Flow-matching, 16 pasos continuos (112 DoF) | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7B | no disponible | Acciones discretizadas de un paso | no disponible en la información | Hugging Face |
| hamzabouajila/openvla-pusht-arabic | 7B | no disponible | OpenVLA ajustado en árabe para PushT | no disponible en la información | Hugging Face |
| VLA SOTA con SigLIP en vivo (línea base de la model card) | no disponible | no disponible | Un paso discreto, 512 tokens visuales | no disponible | no disponible |

La comparativa se limita a los datos de la model card y la búsqueda web; no se dispone de cifras de rendimiento de OpenVLA ni de otros VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico: diseñado para robótica de manipulación sobre LIBERO-10; no es un LLM de propósito general y no debe evaluarse con benchmarks de lenguaje.
- Riesgo de alucinación y errores de trayectoria: aunque el flow-matching multi-paso reduce el error compuesto, no se publica el valor de `trajectory_l2_error`, por lo que no hay garantía cuantitativa de precisión en entornos reales.
- Sesgos: no se documentan sesgos conocidos, pero el ajuste se limita a un dataset sintético o simulado en árabe, lo que puede reducir la generalización a otros dominios o dialectos.
- Limitaciones de idioma: solo árabe e inglés; el rendimiento en dialectos árabes no está evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de componentes (SigLIP, LLM base) cuyas licencias no se detallan en la información disponible.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de validación externa ni de despliegue en producción.
- Requisitos de integración: la inferencia depende de módulos propios (`fastvla.adapters.token_compressor`, `fastvla.adapters.action_head`) y de kernels Triton, lo que añade fricción frente a pipelines estándar de `transformers`.
- Contexto y cuantización no documentados: no se especifica la longitud de contexto del LLM ni los formatos de cuantización soportados, lo que dificulta planificar despliegues con requisitos estrictos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamzabouajila/fastvla-turbo-arabic-libero
- Dataset Arabic LIBERO-10: https://huggingface.co/datasets/hamzabouajila/ar-libero-10-image
- Repositorio GitHub de FastVLA: https://github.com/BouajilaHamza/FastVLA
- Modelo relacionado OpenVLA PushT Arabic: https://huggingface.co/hamzabouajila/openvla-pusht-arabic
