# CaptchaKraken/MidnightV2-4B

## Resumen

MidnightV2-4B es un modelo especializado en la resolución de captchas desarrollado por CaptchaKraken. Se trata de un ajuste fino (LoRA de rango 16, fusionado) sobre Qwen/Qwen3.5-4B, al que se le añaden cabeceras específicas (`pointer_heads.safetensors`) que leen la respuesta completa de un captcha a partir de un único prefill del prompt: acción, puntos de clic, arrastres, texto, momento de vídeo y el número del elemento marcado bajo cada punto. No genera texto; funciona como modelo de pooling.

El modelo pertenece a la familia v2 de CaptchaKraken, que incluye variantes de 0,8B (SunlightV2) y 2B (TwilightV2), y se apoya en un detector CNN de elementos numerados (CaptchaKrakenV2-CNN-large) para las marcas superpuestas en el tablero. La relevancia actual reside en su enfoque de "pointer model": en lugar de describir la solución en lenguaje natural, devuelve directamente coordenadas y acciones, lo que reduce la latencia y simplifica la integración en pipelines automatizados.

Con 4.539.265.536 parámetros totales y pesos en bf16 (9,1 GB de repositorio), el modelo está pensado para servir con vLLM en GPU mediante un plugin específico (`CaptchaPointerForConditionalGeneration`). Su licencia LGPL-3.0 condiciona el uso comercial y la distribución de derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-4B) con cabeceras pointer añadidas; modo pooling, sin generación de texto |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (este repo); GPTQ W4A16 (repo `MidnightV2-4B-q4`, no publicado aún); GGUF Q4_K_M y BF16 (repo `MidnightV2-4B-GGUF`) |
| Idiomas soportados | No disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (bf16 fusionado); GGUF en repo separado; LoRA sin fusionar en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante LoRA de rango 16, posteriormente fusionado en los pesos base. Sobre el transformer se añaden cabeceras ligeras (`pointer_heads.safetensors`) que interpretan el estado del modelo tras un único prefill del prompt fijo y emiten directamente la respuesta estructurada del captcha (acción, puntos, arrastres, texto, momento de vídeo y número del elemento marcado). No hay decodificación autoregresiva de texto.

El entrenamiento corresponde a la ejecución `20261103-qwen-4b-44k-offload`: 43.963 tableros (2 épocas sobre 23.343 filas), learning rate 1e-4 para el modelo y 1e-3 para las cabeceras, acumulación de gradiente de 8, gradient checkpointing y la mitad de los tableros con marcas de elementos numerados. Se entrenó en una única RTX 5080 (1,27 s/tablero, 14,6 GiB de pico). Los 828 tableros con vídeos de 28 a 32 fotogramas se entrenaron con sus activaciones descargadas a RAM del host en lugar de omitirse (la ejecución anterior de 4B omitió 830); aun así se descartaron 3 tableros por memoria. El prompt es fijo y único para todos los captchas.

## Capacidades

- Resolución de captchas de tipo clic: devuelve las coordenadas de los puntos a pulsar.
- Resolución de captchas de rejilla: identifica los elementos de una cuadrícula que deben seleccionarse.
- Resolución de captchas de texto: transcribe el texto solicitado (rendimiento inferior, 62,5% con marcas y 41,7% sin ellas en el conjunto de evaluación).
- Resolución de captchas de arrastre (drag): emite los puntos de inicio y fin del arrastre.
- Resolución de captchas de vídeo: identifica el momento del vídeo que cumple la consigna.
- Detección del número del elemento marcado bajo cada punto, gracias a la cabecera `elem` (ranuras de 6 posiciones, `PACKED = 225`).
- Lectura de la respuesta completa en un solo prefill, sin generación de texto.
- Integración con vLLM como modelo de pooling mediante el plugin `CaptchaPointerForConditionalGeneration`.
- Compatibilidad con el detector CNN externo CaptchaKrakenV2-CNN-large para superponer marcas numeradas en el tablero.

## Casos de uso

- Automatización de pruebas de extremo a extremo: el modelo puede resolver captchas en suites de QA que validan flujos de registro o compra, devolviendo coordenadas directamente y evitando la generación de texto.
- Integración en pipelines de scraping autorizado: con una latencia mediana de 151 ms por tablero en transformers sobre RTX 5080, permite procesar captchas en tiempo casi real dentro de flujos controlados.
- Servicio de resolución de captchas de vídeo: la capacidad de identificar el momento correcto en clips de 28 a 32 fotogramas lo hace adecuado para retos que requieren seleccionar un instante concreto.
- Investigación en visión y control: sirve como banco de pruebas para estudiar modelos pointer que emiten acciones espaciales en lugar de texto, con cabeceras ligeras sobre un transformer de 4B.
- Evaluación de robustez de captchas: permite medir la dificultad de los retos propios frente a un modelo especializado, usando el conjunto de evaluación `eval/eval_gate.jsonl`.
- Despliegue en CPU para entornos sin GPU: la variante GGUF (Q4_K_M, BF16, mmproj) permite ejecutar el modelo con llama.cpp en hardware de consumo.
- Ajuste fino posterior: el adaptador LoRA sin fusionar (`MidnightV2-4B-LoRA`) y las cabeceras pointer permiten continuar el entrenamiento sobre dominios específicos.

## Benchmarks y rendimiento

Resultados del conjunto de evaluación Tier 2 (1.067 tableros reales etiquetados a mano), ejecutados con transformers en RTX 5080 (mediana de 151 ms por tablero), no con vLLM. "Marked" indica marcas de elementos numerados del detector CNN superpuestas; "plain" es el tablero sin marcas.

| Categoría | Marked | Plain |
|---|---|---|
| Todos | 74,2% (1.061) | 75,2% (1.067) |
| Solo imágenes fijas | 76,9% | 77,9% |
| Clic (674) | 76,2% | 78,3% |
| Rejilla (223) | 79,4% | 78,5% |
| Texto (12) | 62,5% (8 con marcas) | 41,7% |
| Vídeo (158) | 58,9% | 59,5% |

Comparación con la ejecución anterior de 4B (`20261102-qwen-4b-44k`, misma receta pero omitiendo los 830 vídeos más largos): imágenes fijas 76,1% / 76,7% → 76,9% / 77,9% (marked / plain); vídeo 59,5% / 59,5% → 58,9% / 59,5%. Mantener los vídeos largos no mejoró la puntuación de vídeo; las imágenes fijas ganaron alrededor de un punto.

Estos números no son directamente comparables con los de TwilightV2-2B (72,6% plain / 68,2% marked), que se obtuvieron con vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo de pesos, más overhead de activaciones y del plugin de vLLM; se recomienda al menos 12-16 GB para servir con comodidad.
- Entrenamiento: una única RTX 5080 con 14,6 GiB de pico (1,27 s/tablero).
- GPU recomendadas: RTX 5080 para entrenamiento e inferencia; para producción con vLLM, GPU con al menos 16 GB (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más; la variante GGUF Q4_K_M reduce el requisito y permite CPU.
- Opciones de despliegue: vLLM 0.25.1 con el plugin `CaptchaPointerForConditionalGeneration` (requiere `VLLM_ENABLE_V1_MULTIPROCESSING=0`); llama.cpp mediante el repo GGUF; transformers para evaluación.
- Latencia: mediana de 151 ms por tablero con transformers en RTX 5080. Throughput con vLLM no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (plain) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidnightV2-4B | 4.539.265.536 | No disponible | 75,2% (transformers) | LGPL-3.0 | Pesos bf16, GGUF, LoRA |
| TwilightV2-2B | No disponible | No disponible | 72,6% (vLLM) | No disponible | Pesos publicados |
| SunlightV2-0.8B | No disponible | No disponible | No disponible | No disponible | Pesos publicados |

La comparación directa entre MidnightV2-4B y TwilightV2-2B está limitada porque los resultados se obtuvieron con runtimes distintos (transformers frente a vLLM). No se dispone de datos de benchmarks de SunlightV2-0.8B en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite respuestas estructuradas de pointer; no sirve para tareas de lenguaje general.
- Requiere el cliente `CaptchaKraken` en el commit `c5c1620` más el parche `client-fixes.patch`; el cliente sin parche rechaza estas cabeceras.
- En vLLM 0.25.1 el plugin solo se registra en el proceso llamante; es obligatorio `VLLM_ENABLE_V1_MULTIPROCESSING=0`.
- Rendimiento bajo en captchas de texto (41,7% plain, 62,5% marked) y en vídeo (en torno al 59%), muy por debajo de las imágenes fijas.
- Los resultados de evaluación proceden de transformers, no de vLLM, por lo que no son directamente comparables con los de otras variantes de la familia.
- Licencia LGPL-3.0: el uso comercial y la distribución de derivados están sujetos a las obligaciones de copyleft de dicha licencia.
- El prompt es fijo y único para todos los captchas; no admite instrucciones variables.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; el modelo está entrenado exclusivamente sobre tableros de captcha.
- Idiomas soportados no documentados.
- El uso de este modelo para eludir captchas puede contravenir los términos de servicio de los sitios afectados; debe emplearse solo en entornos autorizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Adaptador LoRA sin fusionar: https://huggingface.co/CaptchaKraken/MidnightV2-4B-LoRA
- Builds GGUF para llama.cpp: https://huggingface.co/CaptchaKraken/MidnightV2-4B-GGUF
- Variante 2B: https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Variante 0.8B: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Detector CNN de elementos: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN lite: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
