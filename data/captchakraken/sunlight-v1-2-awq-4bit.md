# CaptchaKraken/Sunlight-v1.2-AWQ-4bit

## Resumen

CaptchaKraken Sunlight v1.2 (AWQ 4-bit) es un modelo de visión-lenguaje especializado en la resolución de captchas, desarrollado por el proyecto CaptchaKraken. Se construye fusionando el adaptador LoRA `CaptchaKraken-Lora-v1.2` en el modelo base **Qwen/Qwen3.5-9B** (9.409.813.744 parámetros) y cuantizando las capas lineales del modelo de lenguaje a 4 bits mediante AWQ (grupo 128, asimétrico). La torre de visión, las proyecciones de atención lineal y la cabeza de predicción multi-token se mantienen en bf16 para preservar la precisión en la lectura de imágenes.

Este modelo resuelve captchas de imagen de 10 proveedores distintos, incluyendo reCAPTCHA, hCaptcha, GeeTest, Yidun, BotDetect, MTCaptcha, Yandex, Tencent, Lemin y Prosopo, abarcando 44 tipos de puzzles. Es la primera versión del proyecto que maneja desafíos animados y captchas de texto tecleado. La relevancia actual radica en ofrecer una alternativa autocontenida y desplegable en hardware propio para automatización de navegación, sin depender de servicios externos de resolución. El modelo requiere el cliente `captchakraken >= 2.5.0` para funcionar correctamente con los prompts de generación 2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (Qwen3.5-9B base) con torre de visión bf16, atención lineal y cabeza de predicción multi-token |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | AWQ 4-bit (grupo 128, asimétrico) en linears del LM; vision tower y proyecciones en bf16 |
| Idiomas soportados | no disponible |
| Licencia | captchakraken-source-available-v1.1 (licencia propia, ver archivo LICENSE) |
| Formato de pesos | safetensors (con soporte compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de **Qwen/Qwen3.5-9B**, un transformer denso de 9.400 millones de parámetros con atención lineal y cabeza de predicción multi-token. Sobre esta base se fusiona el adaptador LoRA `CaptchaKraken-Lora-v1.2`, entrenado específicamente para la tarea de resolución de captchas. La cuantización AWQ 4-bit se aplica únicamente a las capas lineales del modelo de lenguaje, con calibración sobre 256 captchas sintéticos dentro del dominio, excluyendo el conjunto de evaluación. La torre de visión, las proyecciones de atención lineal y la cabeza de predicción multi-token permanecen en bf16, ya que cuantizar la parte que lee la imagen penaliza más de lo que ahorra en tamaño.

El entrenamiento del adaptador cubrió 44 tipos de puzzles de 10 proveedores, incluyendo por primera vez desafíos animados y texto tecleado. No se menciona el uso de RLHF o DPO; el enfoque es un fine-tuning supervisado clásico sobre captchas etiquetados. El modelo genera coordenadas normalizadas (0–1000) y requiere que las captchas de cuadrícula se envíen con los números de celda dibujados, ya que el modelo lee esas etiquetas y no las inventa.

## Capacidades

- Resolución de captchas de imagen de 10 proveedores: reCAPTCHA, hCaptcha, GeeTest, NetEase Yidun, BotDetect, MTCaptcha, Yandex, Tencent, Lemin y Prosopo.
- Soporte de 44 tipos de puzzles, incluyendo selección de tiles, arrastre, trazado de rutas y desafíos animados o de video.
- Manejo de captchas de texto tecleado (typed text).
- Generación de coordenadas normalizadas (0–1000) para acciones de clic o arrastre.
- Dos modos de generación de prompts (generación 2), que requieren el cliente `captchakraken >= 2.5.0`.
- Integración con vLLM para servir el modelo como endpoint OpenAI-compatible.
- No es un modelo de propósito general: está especializado exclusivamente en la tarea de resolución de captchas.

## Casos de uso

- **Automatización de navegación web**: el modelo puede integrarse en flujos de scraping o bots de navegación para superar captchas de reCAPTCHA y hCaptcha, devolviendo coordenadas de clic normalizadas que el cliente convierte en acciones reales sobre la página.
- **Pruebas automatizadas de UI**: en pipelines de CI/CD, el modelo permite validar formularios protegidos por captchas sin intervención manual, reduciendo la fricción en entornos de prueba.
- **Gestión de cuentas a escala**: para servicios que requieren verificación humana periódica, el modelo puede resolver los desafíos de forma autónoma, manteniendo sesiones activas.
- **Investigación en seguridad**: sirve como herramienta de análisis para estudiar la eficacia de distintos mecanismos de captcha y evaluar sus puntos débiles frente a modelos de visión-lenguaje.
- **Despliegue en entornos con privacidad estricta**: al ser autocontenido y ejecutable en hardware propio, permite resolver captchas sin enviar imágenes a servicios externos, cumpliendo requisitos de confidencialidad.
- **Procesamiento de captchas de proveedores menos comunes**: su soporte para GeeTest, Yidun, BotDetect, MTCaptcha, Yandex, Tencent, Lemin y Prosopo lo hace útil en mercados donde estos son predominantes.

## Benchmarks y rendimiento

Los resultados de evaluación se obtuvieron con un grader de tolerancia suave sobre el conjunto de evaluación real de 1458 muestras (excluidas del entrenamiento). Las puntuaciones son **notas graduadas**, no porcentajes de resolución exacta.

| Proveedor | Tipos de puzzle | Muestras | Puntuacion |
|---|---|---|---|
| reCAPTCHA | 2 | 629 | 0.600 |
| hCaptcha | 26 | 539 | 0.543 |
| GeeTest | 7 | 172 | 0.780 |
| NetEase Yidun | 3 | 37 | 0.775 |
| BotDetect | 1 | 28 | 0.929 |
| Tencent | 1 | 11 | 0.829 |
| Prosopo | 1 | 11 | 0.727 |
| Yandex | 1 | 11 | 0.364 |
| Lemin | 1 | 10 | 0.874 |
| MTCaptcha | 1 | 10 | 0.900 |
| **Global** | **44** | **1458** | **0.6155** |

**Advertencia importante**: estas cifras corresponden al adaptador sin cuantizar. La versión AWQ 4-bit no alcanza estos valores; en v1.1 la diferencia fue de ~4 puntos porcentuales (62.72% vs 66.87% del FP8), concentrada en puzzles de precisión de coordenadas (arrastre, trazado). El rendimiento exacto de la v1.2 cuantizada aún no se ha medido de forma independiente.

Además, se realizó un barrido del presupuesto de píxeles de la imagen de entrada. El óptimo se encontró en 720×720 píxeles (área plana 518400), que da una puntuación global de 0.6412 en la evaluación completa, frente a 0.6115 con 448² o 0.6243 con 1024². Este ajuste es crítico para el rendimiento real.

## Requisitos de hardware

- **VRAM mínima**: ~14 GB (peso del modelo 11 GB medidos, más overhead de inferencia).
- **GPU recomendadas**: tarjetas con 16 GB o más de VRAM, como RTX 4090, A100 40GB, H100, o GPUs profesionales equivalentes. En GPUs de 12 GB (p. ej. RTX 3060) podría no caber cómodamente.
- **Cuantización**: AWQ 4-bit en linears del LM, con vision tower en bf16, lo que reduce el tamaño frente a FP8 pero mantiene la calidad de lectura de imagen.
- **Despliegue**: compatible con vLLM (comando `vllm serve` con `--max-model-len 8192` y `--gpu-memory-utilization 0.85`). También puede servirse mediante el cliente oficial `captchakraken` (Python o npm) que gestiona los prompts y el post-procesado.
- **Latencia y throughput**: no se proporcionan datos medidos. Dado el tamaño (~9.4B parámetros) y la cuantización 4-bit, se espera una latencia de cientos de milisegundos por petición en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Proveedores soportados | Puntuacion global (eval) | Licencia |
|---|---|---|---|---|---|
| **Sunlight v1.2 AWQ 4-bit** (este) | 9.4B | AWQ 4-bit (LM) + bf16 (visión) | 10 | 0.6155 (sin cuantizar) | captchakraken-source-available-v1.1 |
| **Sunlight v1.1 AWQ 4-bit** | ~9.1 GB (peso) | AWQ 4-bit | 2 (reCAPTCHA, hCaptcha) | 62.72% (eval antigua de 156 muestras) | captchakraken-source-available-v1.1 |
| **Twilight v1.2 FP8** | ~13 GB (peso estimado) | FP8 | 10 | 0.6155 (mismo adaptador, sin pérdida por cuantización) | captchakraken-source-available-v1.1 |

La comparativa se limita a las variantes del propio proyecto, ya que no hay otros modelos públicos especializados en captchas con los mismos criterios de evaluación. Twilight v1.2 FP8 es la versión de mayor precisión (recomendada si se dispone de 22 GB de VRAM), mientras que Sunlight v1.2 AWQ prioriza el tamaño reducido a costa de ~4 puntos de rendimiento.

## Limitaciones y advertencias

- **Rendimiento inferior al FP8**: la cuantización AWQ 4-bit degrada la precisión, especialmente en puzzles que requieren coordenadas exactas (arrastre, trazado de rutas). No se ha medido aún la diferencia exacta para v1.2.
- **Dependencia de prompts específicos**: el modelo solo funciona correctamente con los prompts de generación 2 incluidos en `prompts.json`. Un prompt incorrecto no genera error, pero colapsa la precisión silenciosamente.
- **Obligación de desactivar el modo thinking**: si se usa el parser de razonamiento de Qwen3, la respuesta puede ir al campo `reasoning` y `content` quedar vacío. Hay que fijar `enable_thinking: false`.
- **Presupuesto de píxeles fijo**: el modelo está calibrado para un área de imagen de 720×720 píxeles (MIN_PIXELS=MAX_PIXELS=518400). Desviarse de este valor reduce el rendimiento de forma medible.
- **Coordenadas normalizadas**: las salidas son relativas a un sistema 0–1000, no píxeles reales. Además, las captchas de cuadrícula deben enviarse con los números de celda dibujados; el modelo no los genera.
- **Licencia restrictiva**: la licencia `captchakraken-source-available-v1.1` no es de código abierto estándar (no es Apache/MIT). Hay que revisar sus términos antes de uso comercial.
- **Idiomas**: no se especifican los idiomas soportados para el texto de los captchas; probablemente esté limitado a los que aparecen en los conjuntos de entrenamiento.
- **Riesgo de sesgo**: al ser un modelo especializado, no es adecuado para tareas generales de visión o lenguaje; usarlo fuera de su dominio dará resultados impredecibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptchaKraken/Sunlight-v1.2-AWQ-4bit
- Adaptador LoRA v1.2: https://huggingface.co/CaptchaKraken/CaptchaKraken-Lora-v1.2
- Versión Twilight v1.2 FP8: https://huggingface.co/CaptchaKraken/Twilight-v1.2-FP8
- Repositorio GitHub del proyecto: https://github.com/JWriter20/CaptchaKraken
- Script de instalación: https://github.com/JWriter20/CaptchaKraken/blob/main/setup.sh
- Página del modelo en FriendliAI (despliegue gestionado): https://friendli.ai/models/CaptchaKraken/Sunlight-AWQ-4bit
- Versión anterior Sunlight-AWQ-4bit: https://huggingface.co/CaptchaKraken/Sunlight-AWQ-4bit
