# CaptchaKraken/Twilight-v1.2-FP8

## Resumen

CaptchaKraken Twilight v1.2 FP8 es un modelo de visión-lenguaje especializado en la resolución automatizada de captchas, desarrollado por CaptchaKraken. Se trata del adaptador LoRA `CaptchaKraken-Lora-v1.2` fusionado directamente en el modelo base Qwen/Qwen3.5-9B y cuantizado a FP8-dynamic, de modo que se distribuye como un único archivo de pesos sin necesidad de cablear adaptadores. Es la versión que el servicio API alojado de CaptchaKraken utiliza en producción.

La versión v1.2 supone un salto cualitativo frente a la v1.1: amplía la cobertura de 2 a 10 proveedores de captchas (reCAPTCHA, hCaptcha, GeeTest, NetEase Yidun, BotDetect, MTCaptcha, Yandex, Tencent, Lemin y Prosopo) y es la primera generación que maneja desafíos animados y captchas de texto tecleado, con un total de 44 tipos de puzzle. El modelo tiene 9.409.813.744 parámetros (~9,4B), un peso de 13 GB y requiere un mínimo de ~22 GB de VRAM, con una ventana de contexto de servido recomendada de 8192 tokens.

El modelo responde a prompts de generación 2, lo que exige la versión 2.5.0 o superior del cliente `captchakraken`. La cuantización FP8-dynamic se aplica únicamente a las capas lineales del modelo de lenguaje, mientras que la torre de visión, las proyecciones de atención lineal y la cabeza de predicción multi-token se mantienen en bf16, una decisión de diseño justificada por la naturaleza de la tarea: leer imágenes pequeñas con precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basado en Qwen3.5-9B, con atención lineal híbrida y head de predicción multi-token |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuración de servido recomendada con vLLM) |
| Tipos de cuantizacion | FP8-dynamic en lineales del LM (pesos por canal, activaciones dinámicas por token); bf16 en torre de visión, proyecciones de atención lineal y head MTP |
| Idiomas soportados | No disponible |
| Licencia | CaptchaKraken Source-Available License v1.1 |
| Formato de pesos | safetensors (FP8 cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer vision-lenguaje con arquitectura híbrida que combina atención lineal y atención completa, e incorpora una cabeza de predicción multi-token (MTP). Sobre esta base se entrena el adaptador LoRA `CaptchaKraken-Lora-v1.2`, que posteriormente se fusiona en los pesos del modelo base y se cuantiza a FP8-dynamic. La cuantización FP8 no requiere datos de calibración y se aplica solo a los lineales del modelo de lenguaje; la torre de visión, las proyecciones de atención lineal y la cabeza MTP permanecen en bf16, ya que cuantizar la parte que realiza la lectura visual costaría más de lo que ahorra.

El entrenamiento corresponde a la ejecución `20260812-005302`, con veredicto `ready-to-deploy` tras superar las tres puertas de validación sin límites. El modelo responde a prompts de generación 2, un formato nuevo que requiere el cliente `captchakraken` >= 2.5.0; enviar prompts de generación 1 no produce error pero degrada silenciosamente la precisión en todos los puzzles. El repositorio incluye un archivo `prompts.json` con los prompts exactos de entrenamiento y el mapeo tipo-de-puzzle → plantilla.

## Capacidades

- Resolución de captchas de 44 tipos de puzzle distribuidos en 10 proveedores: reCAPTCHA, hCaptcha, GeeTest, NetEase Yidun, BotDetect, MTCaptcha, Yandex, Tencent, Lemin y Prosopo.
- Manejo de desafíos animados y de vídeo, una capacidad nueva en v1.2.
- Resolución de captchas de texto tecleado (typed text captchas).
- Comprensión de puzzles de cuadrícula con numeración de celdas dibujada en la imagen; el modelo lee las etiquetas pero no inventa numeración.
- Devolución de coordenadas normalizadas en rango 0-1000, con origen en la esquina superior izquierda.
- Modo de razonamiento (thinking) integrado, deshabilitable mediante `enable_thinking: false`.
- Capacidad conversacional multimodal (image-text-to-text) heredada de Qwen3.5-9B.

## Casos de uso

- Automatización de verificación de captchas en pipelines de scraping: el modelo se sirve con vLLM y responde con coordenadas normalizadas que el cliente `captchakraken` traduce a acciones de clic o arrastre en el navegador, permitiendo flujos de extracción de datos sin intervención manual.
- Pruebas de sistemas anti-bot en QA: permite evaluar la efectividad de implementaciones de reCAPTCHA, hCaptcha o GeeTest generando intentos de resolución automatizados con métricas de éxito cuantificables.
- Asistencia a usuarios con discapacidad visual: el modelo puede integrarse en extensiones de navegador o herramientas de accesibilidad que resuelven captchas automáticamente para usuarios que no pueden completarlos de forma convencional.
- Automatización de flujos de registro y compra legítimos: en entornos con autorización explícita, el modelo permite completar formularios protegidos por captchas en procesos de alta de cuentas o reservas.
- Investigación en visión por computador: el modelo sirve como referencia para estudiar el reconocimiento de patrones visuales adversarios, la robustez de los sistemas CAPTCHA y las técnicas de cuantización FP8 en modelos multimodales.
- Benchmarking de seguridad de CAPTCHA: los datos de evaluación publicados (44 tipos de puzzle, 1458 muestras) permiten a investigadores medir la resistencia de distintos proveedores frente a modelos de aprendizaje profundo.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la evaluación del proyecto con un grader de tolerancia suave sobre el conjunto de evaluación real completo de 1458 muestras retenidas (ninguna usada en entrenamiento). Los puzzles de cuadrícula se puntúan como coincidencia exacta de conjunto de celdas con decaimiento por error; los de clic/arrastre reciben crédito parcial según distancia normalizada. Son puntuaciones graduadas, no porcentaje de resolución.

| Proveedor | Tipos de puzzle | Muestras retenidas | Puntuación |
|---|---|---|---|
| reCAPTCHA | 2 | 629 | 0,600 |
| hCaptcha | 26 | 539 | 0,543 |
| GeeTest | 7 | 172 | 0,780 |
| NetEase Yidun | 3 | 37 | 0,775 |
| BotDetect | 1 | 28 | 0,929 |
| Tencent | 1 | 11 | 0,829 |
| Prosopo | 1 | 11 | 0,727 |
| Yandex | 1 | 11 | 0,364 |
| Lemin | 1 | 10 | 0,874 |
| MTCaptcha | 1 | 10 | 0,900 |
| **Global** | **44** | **1458** | **0,6155** |

Estas cifras corresponden al adaptador sin cuantizar. En v1.1, la versión FP8 siguió a la configuración base+adaptador dentro del ruido (66,87% frente a 66,30%), por lo que no se espera pérdida en la fusión, pero el delta de cuantización de v1.2 aún no se ha medido de forma aislada. Los números de v1.1 no son comparables con los de v1.2, ya que se obtuvieron sobre una evaluación de 156 muestras anterior a la corrección del split de 2026-08-05.

El barrido del presupuesto de píxeles sobre la evaluación completa mostró una meseta en 704-736²: 720² da una puntuación global de 0,6412, frente a 0,6115 en 448², 0,6357 en 640², 0,6368 en 768² y 0,6243 en 1024². La extrapolación suave de los embeddings de posición (hasta ~67 parches) supera a permanecer dentro de la cuadrícula nativa de 48×48.

## Requisitos de hardware

- VRAM mínima estimada: ~22 GB.
- Peso de los archivos: 13 GB (FP8).
- GPU recomendadas: RTX 4090 (24 GB), H100, L40S o GPUs con soporte nativo de FP8 (arquitecturas Hopper o Ada Lovelace). Las GPUs Ampere (A100) pueden ejecutar el modelo pero sin aceleración FP8 nativa.
- No cabe en GPUs de consumo de gama media (RTX 3060/4060, 8-12 GB).
- Despliegue recomendado con vLLM: `vllm serve CaptchaKraken/Twilight-v1.2-FP8 --max-model-len 8192 --gpu-memory-utilization 0.85 --trust-remote-code --port 8000`.
- No se requieren flags de LoRA ni adaptadores; el adaptador ya está fusionado.
- Existe una alternativa más ligera, Sunlight v1.2 (AWQ 4-bit), ~5 GB menor y con menor consumo de VRAM.
- Despliegue gestionado disponible a través de FriendliAI.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Peso | VRAM mín. | Proveedores | Puntuación global |
|---|---|---|---|---|---|---|
| Twilight v1.2 FP8 | 9,4B | FP8-dynamic | 13 GB | ~22 GB | 10 | 0,6155 |
| Sunlight v1.2 AWQ 4-bit | 9,4B | AWQ 4-bit | ~8 GB | menor | 10 | No disponible |
| Twilight v1.1 FP8 | 9,4B | FP8-dynamic | 13 GB | ~22 GB | 2 | 0,6630 (eval antigua, no comparable) |
| Qwen3.5-9B (base) | 9,4B | bf16 | ~18 GB | ~20 GB | 0 | No aplica |

Sunlight v1.2 es la misma fusión en AWQ 4-bit, más ligera pero sin datos de evaluación publicados. Twilight v1.1 solo cubría reCAPTCHA y hCaptcha, y sus métricas provienen de una evaluación de 156 muestras con un split defectuoso, por lo que no son comparables directamente. El modelo base Qwen3.5-9B no tiene capacidad específica de resolución de captchas.

## Limitaciones y advertencias

- Las puntuaciones son graduadas (crédito parcial por distancia), no porcentaje de captchas resueltos; un 0,6155 global no implica un 61,55% de éxito.
- Rendimiento muy desigual por proveedor: Yandex puntúa 0,364, muy por debajo de la media, mientras que BotDetect alcanza 0,929.
- Requiere prompts exactos de entrenamiento (archivo `prompts.json`); un prompt no coincidente no produce error pero colapsa la precisión.
- Es obligatorio deshabilitar el modo thinking (`enable_thinking: false`); con el razonamiento activo, la respuesta va al campo `reasoning` y `content` vuelve vacío.
- Debe servirse con un presupuesto de píxeles plano de 720² (`MIN_PIXELS=518400`, `MAX_PIXELS=518400`); fuera de esa banda, la precisión cae.
- Las coordenadas devueltas están normalizadas (0-1000), no en píxeles; las capturas de cuadrícula deben enviarse con los números de celda dibujados.
- Requiere el cliente `captchakraken` >= 2.5.0; versiones anteriores envían prompts de generación 1 que degradan silenciosamente el rendimiento.
- El delta de rendimiento de la cuantización FP8 en v1.2 aún no se ha medido de forma aislada.
- Licencia source-available (CaptchaKraken Source-Available License v1.1), no open source; es necesario revisar los términos para uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje; en esta tarea se manifiesta como fallos de localización en puzzles complejos o animados.
- Idiomas soportados no documentados; la información disponible no especifica cobertura multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptchaKraken/Twilight-v1.2-FP8
- Adaptador LoRA v1.2: https://huggingface.co/CaptchaKraken/CaptchaKraken-Lora-v1.2
- Variante Sunlight v1.2 (AWQ 4-bit): https://huggingface.co/CaptchaKraken/Sunlight-v1.2-AWQ-4bit
- Versión anterior Twilight-FP8: https://huggingface.co/CaptchaKraken/Twilight-FP8
- Repositorio GitHub CaptchaKraken (driver TypeScript y motor Python): https://github.com/JWriter20/CaptchaKraken
- Documentación del proyecto: https://github.com/JWriter20/CaptchaKraken/tree/main/docs
- Despliegue gestionado en FriendliAI: https://friendli.ai/models/CaptchaKraken/Twilight-FP8
