# OsaurusAI/Ornith-1.5-9B-JANG_2D

## Resumen

Ornith-1.5-9B-JANG_2D es una distribución cuantizada del modelo Ornith-1.5-9B, desarrollado por Ornith AI y posteriormente empaquetado por OsaurusAI para ejecución eficiente en Apple Silicon mediante MLX. El modelo base es un VLM agéntico de razonamiento y codificación que combina atención lineal gated-delta con atención completa en una proporción 3:1, junto con una torre de visión de 27 capas y soporte nativo de vídeo. Esta versión concreta aplica una cuantización JANG 2D de 2 bits base, con una distribución de bits por capa determinada por la traza de la Hessiana, logrando un tamaño de 3,81 GiB y una velocidad de decodificación de 110,1 tokens por segundo en un chip M5 Max.

El modelo mantiene el contexto largo de 262 144 tokens y las capacidades de razonamiento activadas por defecto. Está pensado para desarrolladores que necesitan un modelo de codificación y razonamiento visual con baja huella de memoria en hardware de Apple, sin renunciar a las capacidades de agente y tool calling del modelo original. La licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida gated-delta linear attention + full attention, ratio 3:1) |
| Parametros totales | 9B (nominal) / 1.163.891.920 en safetensors (pesos cuantizados) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | JANG 2D (2-bit base con distribución {2: 183, 3: 9, 4: 110, 8: 32}, tensores de vision en fp16) |
| Idiomas soportados | inglés (tokens de audio vestigiales, sin pesos de audio) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso de 9 000 millones de parámetros con una arquitectura híbrida que combina atención lineal con compuerta delta (gated-delta linear attention) y atención completa en una proporción 3:1. Esta mezcla busca reducir el coste computacional de la atención cuadrática manteniendo la calidad en secuencias largas. La torre de visión tiene 27 capas y el modelo integra un procesador de vídeo nativo. El modelo base fue entrenado con un enfoque de auto-mejora y auto-andamiaje (self-scaffolding), orientado a tareas de codificación agéntica y razonamiento.

La versión JANG_2D aplica una cuantización de 2 bits base con asignación de bits basada en la traza de la Hessiana y la norma de Frobenius por módulo, en lugar de seguir el nombre del tensor. La calibración usa una única pasada de captura que combina la diagonal de la Hessiana, el imatrix y la estadística de canales salientes de AWQ. Los tensores de la torre de visión con `in_features` no divisible por el tamaño de grupo de MLX (4304) se mantienen en fp16. No hay pesos de MTP (speculative decoding) en este checkpoint, aunque la arquitectura lo declara.

## Capacidades

- Generación de texto y razonamiento: el modo thinking está activado por defecto y puede desactivarse, aunque el prefijo del bloque de pensamiento siempre se emite (vacío o con contenido).
- Codificación agéntica: soporta tool calling y razonamiento multi-paso; el parser de herramientas es `qwen3_coder`.
- Visión y vídeo: acepta imágenes y vídeo como entrada, con preprocesadores dedicados incluidos en el bundle.
- Multilingüe: solo inglés (según la model card).
- Sin soporte de audio: los tokens de audio existen pero no hay pesos ni configuración de audio.
- No hay niveles de `reasoning_effort` (a diferencia de Qwen3.8).
- Modo de codificación por defecto: el preset de muestreo `coding` (temperatura 0.6) está escrito en `generation_config.json`, mientras que el preset general (temperatura 1.0) está disponible en `sampling_modes.general`.

## Casos de uso

- **Asistente de programación en local**: con 110 tokens por segundo en M5 Max, puede usarse como autocompletado o agente de codificación en IDE, integrando tool calling para ejecutar comandos y editar archivos.
- **Análisis de vídeo**: procesar secuencias de vídeo con razonamiento de largo contexto, útil para revisión de grabaciones de pantalla o vigilancia.
- **Razonamiento multi-paso**: para tareas de planificación y ejecución de agentes, con el modo thinking activado por defecto.
- **Chat con contexto largo**: ventana de 262K tokens permite mantener conversaciones de más de 200 000 tokens sin truncamiento, adecuado para documentación técnica extensa.
- **Generación de código en pipelines CI/CD**: puede actuar como revisor de código o generador de parches en entornos automatizados, gracias a su parser de herramientas y su rendimiento en SWE-bench (79) y Terminal-Bench (67.8) según el modelo base.
- **Aplicaciones en Apple Silicon**: gracias a MLX, se ejecuta en Macs con memoria unificada, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del modelo base (Ornith-1.5-9B) y no se han verificado en esta versión cuantizada:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67.8 |

No se han publicado resultados específicos para la versión cuantizada JANG_2D.

## Requisitos de hardware

- **VRAM estimada**: el bundle pesa 3,81 GiB en disco; con MLX, requiere memoria unificada de al menos 8 GB para inferencia en fp16, aunque con cuantización 2-bit cabe en 4 GB.
- **GPUs recomendadas**: Apple Silicon (M-series), probado en M5 Max. No se menciona soporte para NVIDIA o AMD.
- **Despliegue**: MLX (Apple), compatible con vLLM y Transformers si se convierten los pesos a otros formatos, pero el bundle está optimizado para MLX.
- **Latencia y throughput**: 110,1 tokens/s en M5 Max (decodificación). No hay datos para otros chips.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, otros modelos de 9B con cuantización 2-bit o VLM agénticos). El modelo base compite con Qwen3.8 y otros modelos de razonamiento, pero no hay datos públicos de comparación directa en esta versión cuantizada.

## Limitaciones y advertencias

- **Solo inglés**: no soporta otros idiomas de forma nativa.
- **Sin audio**: los tokens de audio son vestigiales y no hay pesos de audio; cualquier uso de entrada de audio fallará.
- **Modo thinking por defecto**: la desactivación no elimina el bloque de pensamiento, sino que lo rellena vacío; los parsers que solo comprueben la presencia del bloque pueden engañarse.
- **Sin MTP**: no hay decodificación especulativa, lo que limita el rendimiento en comparación con el modelo 35B que sí lo tiene.
- **Cuantización agresiva**: la base 2-bit puede degradar la precisión en tareas de razonamiento complejas en comparación con el modelo original de 9B sin cuantizar.
- **Uso comercial**: licencia MIT, sin restricciones conocidas, pero el modelo base puede tener términos adicionales (revisar la página de Ornith AI).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OsaurusAI/Ornith-1.5-9B-JANG_2D)
- [Modelo base Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Blog de Ornith AI: Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Guía de Ornith AI para modelos agénticos](https://ornith.online/)
