# cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-LoRA

## Resumen

Inworld-Voice-Isolator-v1-Turbo5d-LoRA es un repositorio de artefactos de entrenamiento (no un modelo listo para inferencia) que contiene las piezas necesarias para reconstruir y auditar el checkpoint comunitario Turbo-5d, una derivación del modelo Inworld Voice Isolator v1. Lo publica el usuario cowWhySo como trabajo independiente, no como producto oficial de Inworld. El repositorio incluye la base podada sin adaptar, el adaptador LoRA entrenado sobre ella y el script de fusión que produce el checkpoint final.

El modelo subyacente es un sistema de aislamiento de voz (voice isolation / speech enhancement) que opera sobre audio a 48 kHz y transforma audio ruidoso en audio limpio (pipeline audio-to-audio). La derivación Turbo-5d elimina dos de los siete bloques del modelo original (se conservan los índices 0, 1, 3, 4 y 6), reduciendo el cómputo a costa de una pérdida de calidad que el adaptador LoRA intenta compensar parcialmente.

La relevancia de esta ficha es doble: por un lado, documenta un caso de poda arquitectónica con recuperación mediante adaptadores de bajo rango; por otro, sirve como ejemplo de formato de adaptador personalizado (no compatible con PEFT) motivado por las particularidades de los bloques Mamba del modelo original. El resultado de calidad del modelo fusionado es, según el propio autor, no concluyente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con bloques transformer y bloques Mamba (atención temporal, atención por bandas, Mamba temporal y frecuencial en ambas direcciones); 5 bloques tras poda (original: 7) |
| Parámetros totales | 49,9 M (base podada) + 1,65 M (adaptador LoRA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en FP32) |
| Idiomas soportados | no disponibles (procesamiento de audio, no de texto; la evaluación reporta resultados por idioma pero no se enumeran) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32); adaptador en formato propietario `turbo5d-custom-lora-v1` |

## Arquitectura y entrenamiento

El modelo base Inworld Voice Isolator v1 es una arquitectura híbrida que combina bloques transformer (con atención temporal y atención por bandas de frecuencia, más feed-forward) y bloques Mamba (temporales y frecuenciales, en dirección forward y backward). La derivación Turbo-5d elimina los bloques 2 y 5 del total de siete, conservando `[0, 1, 3, 4, 6]`, lo que reduce los parámetros de 64,0 M a 49,9 M. Los bloques Mamba leen algunos pesos lineales directamente (por ejemplo `dt_proj.weight`) en lugar de invocar la capa, lo que impide aplicar un wrapper PEFT convencional y motiva el formato de adaptador personalizado.

El adaptador es un LoRA de rango 16 y alpha 32 (escala 2,0) con 57 pares de factores (1.585.152 parámetros) más 216 sobrescrituras de tensor completo (67.588 parámetros), en total 1,65 M parámetros en FP32. Los objetivos LoRA incluyen, en bloques transformer, `qkv` y `proj` de atención temporal, los lineales del feed-forward, `out_proj` de atención por bandas y `linear1`/`linear2` del feed-forward por bandas; en bloques Mamba (temporal y frecuencial, forward y backward), `in_proj`, `x_proj`, `dt_proj`, `out_proj` y el `output_proj` del bloque. Las sobrescrituras de tensor completo corresponden a las capas de normalización entrenadas y a los parámetros de normalización del codificador por bandas y de la cabeza decodificadora. El código de entrenamiento no se incluye; solo se documenta el formato necesario para escribir un adaptador compatible.

## Capacidades

- Aislamiento de voz: separa la voz limpia del ruido de fondo en señales de audio a 48 kHz.
- Mejora de habla (speech enhancement) en pipeline audio-to-audio.
- Procesamiento por clips de distinta duración (se reportan mediciones para clips de 2, 8 y 15 segundos).
- Reconstrucción auditable del checkpoint fusionado a partir de base y adaptador, con verificación de hash y formas de tensor.
- Entrenamiento de adaptadores propios sobre la base podada (documentado, aunque sin código de entrenamiento).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de texto o visión: es un modelo puramente de audio.

## Casos de uso

- Limpieza de grabaciones de voz para podcast o videollamada: el modelo toma un WAV ruidoso y devuelve una versión limpia; la variante Turbo-5d reduce el tiempo de proceso entre 1,42x y 1,51x frente al original, lo que resulta útil en flujos interactivos.
- Preprocesado para pipelines de ASR: eliminar ruido antes de la transcripción mejora la calidad de entrada a motores de reconocimiento; el modelo opera a 48 kHz y es compatible con el paquete `inworld-voice-isolation`.
- Auditoría y reproducción de checkpoints comunitarios: el repositorio permite reconstruir el modelo fusionado desde sus partes con `merge_custom_lora.py`, verificando hashes y formas, útil para equipos que necesitan trazabilidad de pesos.
- Investigación sobre poda y adaptadores de bajo rango: sirve para estudiar cuánta calidad recupera un LoRA de rango 16 tras eliminar dos de siete bloques, con métricas SI-SDR publicadas.
- Entrenamiento de adaptadores propios: la base podada sin adaptar carga en el paquete original y actúa como punto de partida para entrenar adaptadores personalizados sobre dominios de audio concretos.
- Despliegue en Apple Silicon: la variante Turbo5d-MLX ejecuta los mismos pesos en MLX, lo que permite limpieza de audio en local en equipos Mac sin GPU dedicada.
- Integración en herramientas de accesibilidad o captura de voz en entornos ruidosos, donde el coste computacional reducido de la variante podada es relevante.

## Benchmarks y rendimiento

| Métrica | Original v1 (offline) | Turbo-5d (base + adaptador) |
|---|---|---|
| Bloques / parámetros | 7 / 64,0 M | 5 / 49,9 M |
| Tesla T4 p50, clips de 2 s | 0,850 s | 0,580 s |
| Tesla T4 p50, clips de 8 s | 3,521 s | 2,331 s |
| Tesla T4 p50, clips de 15 s | 10,439 s | 7,372 s |
| Aceleración | referencia | 1,46x / 1,51x / 1,42x |
| Cambio medio de SI-SDR (72 clips ruidosos) | referencia | +0,384 dB (IC 95 %: −0,451 a +1,272) |

El cambio de SI-SDR es positivo en media pero el intervalo de confianza cruza cero, por lo que el autor califica el resultado de calidad como no concluyente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es pequeño (49,9 M parámetros en FP32, aproximadamente 200 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer; no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: se reportan mediciones en Tesla T4; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, por el tamaño del modelo; no se especifican modelos concretos.
- Opciones de despliegue: paquete `inworld-voice-isolation==1.0.0` (CLI `voice-isolate`), MLX en Apple Silicon mediante Turbo5d-MLX, y PyTorch con safetensors para la reconstrucción.
- Latencia y throughput: en Tesla T4, p50 de 0,580 s para clips de 2 s, 2,331 s para 8 s y 7,372 s para 15 s con Turbo-5d.

## Comparativa con modelos similares

| Modelo | Parámetros | Bloques | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inworld Voice Isolator v1 (original) | 64,0 M | 7 | no disponible en la información | safetensors | Referencia offline; 1,42x-1,51x más lento en T4 |
| Turbo-5d (este adaptador + base podada) | 49,9 M + 1,65 M | 5 | Apache 2.0 | safetensors | Calidad no concluyente según el autor |
| Turbo5d-MLX | mismos pesos | 5 | Apache 2.0 | MLX | Variante para Apple Silicon |

No se dispone de información sobre otros modelos comparables de aislamiento de voz en la documentación proporcionada.

## Limitaciones y advertencias

- El resultado de calidad del modelo fusionado es no concluyente: el intervalo de confianza del cambio de SI-SDR cruza cero.
- El adaptador es un formato personalizado (`turbo5d-custom-lora-v1`), no compatible con PEFT; no puede cargarse con herramientas estándar de adaptadores.
- No se incluye código de entrenamiento; solo se documenta el formato para escribir adaptadores compatibles.
- Es trabajo comunitario independiente, no un producto oficial de Inworld; no hay garantías de soporte ni mantenimiento.
- El repositorio no está pensado para inferencia: para uso práctico debe emplearse el modelo fusionado (Turbo5d-Model) o la variante MLX.
- La reconstrucción no es bit a bit: se reproduce dentro del redondeo de float32 (diferencia máxima absoluta de aproximadamente 3e-8 en 623 tensores), por lo que el hash del archivo difiere del publicado.
- Riesgo de sesgos y alucinaciones en el sentido de artefactos de audio no documentados; no se reportan sesgos conocidos ni evaluación por idioma más allá de los resultados por condición.
- Licencia Apache 2.0 permite uso comercial, pero al ser una derivación conviene verificar la licencia del modelo base original.
- No hay datos de cuantización ni de idiomas soportados explícitos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-LoRA
- Modelo fusionado: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-Model
- Variante MLX: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-MLX
- Modelo base original: https://huggingface.co/inworld/voice-isolator
