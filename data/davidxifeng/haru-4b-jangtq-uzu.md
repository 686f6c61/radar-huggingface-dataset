# davidxifeng/Haru-4B-JANGTQ-uzu

## Resumen

Haru-4B-JANGTQ-uzu es una compilación cuantizada en precisión mixta del modelo higurashi-ai/Haru-4B, un modelo de diálogo hablado full-duplex, multilingüe y de baja latencia. Lo publica el usuario davidxifeng y está empaquetado específicamente para el motor de inferencia `uzu` (Rust + Metal, Apple silicon), no para MLX ni transformers estándar. El modelo base resuelve el problema de la conversación por voz simultánea: escucha y habla a la vez, como en una llamada telefónica, consumiendo y emitiendo un frame de audio cada 133 ms (7,5 Hz).

La arquitectura del backbone es un híbrido Qwen3.5 con 24 capas Gated DeltaNet y 8 capas de atención completa, más 32 MLPs SwiGLU. El modelo declara 4B en el nombre, pero los pesos reales en safetensors suman 2.609.638.400 parámetros (unos 2,6B). El audio no se tokeniza de forma discreta: cada frame se representa como un latente de 64 dimensiones generado en un único paso de muestreo por una cabeza MLP pequeña (MeanFlow) a partir del estado oculto del LM.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de voz full-duplex poco habitual en el ecosistema abierto; por otro, ilustra una técnica de cuantización agresiva (3 bits JANGTQ en los MLPs) que reduce el bundle de ~10,6 GB en BF16 a 3,64 GB, con una latencia medida de 41,5 ms por frame en un Apple M3 de 24 GB, muy por debajo del presupuesto de 133,3 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas Gated DeltaNet + 8 capas Full Attention (output-gated, `partial_rotary_factor=0.25`) + 32 MLPs SwiGLU; cabeza MeanFlow de un paso para audio; códec acústico causal VibeVoice |
| Parametros totales | 2.609.638.400 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit JANGTQ (MLPs del backbone), 8-bit MLX (embeddings y mixers), 4-bit/8-bit MLX (cabeza MeanFlow y códec), FP32 (norms, `A_log`/`dt_bias`, convoluciones cortas) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout nativo de `uzu-engine` (no compatible con MLX ni transformers estándar) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido derivado de Qwen3.5 que combina 24 capas Gated DeltaNet (atención lineal con estado recurrente) con 8 capas de atención completa con output gating y rotación parcial (`partial_rotary_factor=0.25`). Esta mezcla busca reducir el coste por token en secuencias largas manteniendo capacidad de atención global en capas seleccionadas. Sobre el LM se monta una cabeza MeanFlow que genera, en un solo paso de muestreo, un latente de audio de 64 dimensiones por frame a partir del estado oculto; un códec acústico causal VibeVoice (24 kHz, 3200 muestras por frame) convierte ese latente en waveform. No hay transformer de audio separado ni tokens de audio discretos.

El modelo opera a 7,5 Hz: cada 133 ms consume un frame de audio del usuario y emite un frame de audio propio más texto. Audio del usuario, audio del modelo y texto del modelo se suman en una única posición del LM, lo que habilita el comportamiento full-duplex. La identidad del personaje se fija con una tarjeta de texto y la voz con un clip de referencia corto. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La innovación de esta compilación concreta es la cuantización offline sin datos de calibración: los MLPs densos usan un codebook de 3 bits empaquetado en bitstream LSB-first con rotación Hadamard32, escala FP16 por fila y rejilla alpha/beta de 3 bits; embeddings y mixers van en 8 bits MLX con escala y sesgo por grupo de 64; norms y convoluciones cortas se mantienen en FP32. El bundle total es de 3,64 GB frente a ~10,6 GB en BF16 y ~6,6 GB en el build 8-bit MLX oficial.

## Capacidades

- Diálogo hablado full-duplex: escucha y habla simultáneamente a 7,5 Hz, con 133 ms por frame.
- Text-to-speech y speech-to-speech con latente de audio continuo de 64 dimensiones.
- Generación simultánea de audio y texto por frame.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Control de personaje mediante tarjeta de texto y de voz mediante clip de referencia.
- Plantillas de tarjeta de personaje por idioma incluidas en `assets/cards/` para los nueve idiomas.
- Muestreo configurable con guidance 1,5, temperatura 0,7, top_k 25 y penalización DRY.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso o modo de pensamiento explícito: no disponible en la información proporcionada.
- Visión o audio de entrada más allá del flujo de voz del usuario: no disponible.

## Casos de uso

- Agentes de voz en tiempo real: el modelo puede mantener una conversación telefónica natural porque procesa y emite audio cada 133 ms, dentro del presupuesto de latencia de una llamada. Adecuado para asistentes que deben interrumpir y ser interrumpidos.
- Atención al cliente telefónica automatizada: con nine idiomas y full-duplex, puede gestionar turnos solapados y cambios de idioma dentro de una misma llamada, algo que los pipelines TTS+STT en cascada no soportan bien.
- Personajes interactivos para juegos o experiencias inmersivas: las tarjetas de personaje por idioma y el clip de referencia de voz permiten definir personalidad y timbre sin reentrenar.
- Prótesis o interfaces de voz accesibles: la latencia de 41,5 ms por frame en Apple M3 (24 GB) hace viable ejecución local en portátiles Apple silicon, sin depender de la nube.
- Doblaje y locución interactiva: la generación conjunta de audio y texto facilita producir transcripción alineada con la locución, útil para subtitulado automático.
- Investigación en modelos de diálogo full-duplex: el bundle cuantizado de 3,64 GB permite experimentar en hardware de consumo y comparar contra el checkpoint BF16 upstream.
- Prototipado de asistentes multilingües en macOS: el backend `uzu` y el daemon `haru_daemon` sobre socket Unix simplifican la integración con la app de demostración `haru_mlx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí hay métricas de latencia medidas en Apple M3 (24 GB, 100 GB/s), batch=1, decodificación en streaming sobre 100 frames:

| Metrica | p50 | p95 | max |
|---|---|---|---|
| `feed` (audio de entrada) | 6,86 ms | no disponible | no disponible |
| `step` (un frame) | 41,50 ms | 51,42 ms | 53,07 ms |
| `feed + step` | 48,47 ms | no disponible | no disponible |

El autor indica que este build es aproximadamente 2,0× más rápido que el build 8-bit oficial de `haru_mlx` (84,3 ms por step) y que queda cómodamente dentro del presupuesto de 133,3 ms por frame. También afirma haber pasado comprobaciones de consistencia contra la salida dorada en BF16.

## Requisitos de hardware

- VRAM/espacio en disco: el bundle ocupa 3,64 GB (`model.safetensors` 2,75 GB + `haru_sidecar.safetensors` 0,89 GB); el repo en Hugging Face pesa 3,7 GB.
- Hardware de referencia: Apple M3 con 24 GB de memoria unificada y 100 GB/s de ancho de banda, con el que se midieron las latencias anteriores.
- El motor `uzu` es Rust + Metal y está orientado a Apple silicon; no hay información sobre soporte CUDA, ROCm u otras GPU.
- GPU consumer: no disponible para NVIDIA/AMD en la información proporcionada; en Apple silicon cabe en equipos de 24 GB o más.
- Opciones de despliegue: `uzu-engine` / `haru_daemon` (socket Unix) y la app `haru_mlx` en macOS/Swift con backend `uzu`. No es cargable con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Throughput estimado: con 41,5 ms por step en M3, el modelo sostiene el ritmo de 7,5 frames por segundo con margen de aproximadamente 3× sobre el presupuesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| Haru-4B-JANGTQ-uzu | 2,6B (safetensors) | no disponible | Sí | 9 | Apache-2.0 | safetensors layout `uzu`, solo Apple silicon |
| higurashi-ai/Haru-4B (upstream BF16) | no disponible (~10,6 GB en BF16) | no disponible | Sí | 9 | Apache-2.0 | BF16, portable |
| Build 8-bit oficial `haru_mlx` | no disponible | no disponible | Sí | 9 | Apache-2.0 | MLX 8-bit, ~6,6 GB |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoría. La comparación disponible se limita a tamaño del bundle y latencia: 3,64 GB y 41,5 ms/step frente a ~6,6 GB y 84,3 ms/step del build 8-bit MLX, y ~10,6 GB del BF16 upstream.

## Limitaciones y advertencias

- Formato no portable: los pesos usan el layout nativo de `uzu-engine` y solo se cargan con `uzu-engine` / `haru_daemon`; para un checkpoint portable hay que usar el upstream `higurashi-ai/Haru-4B`.
- Cuantización con pérdida: el autor advierte que el esquema JANGTQ de 3 bits sobre MLPs densos es lossy por naturaleza; si se necesitan salidas fieles bit a bit, hay que usar el BF16 upstream.
- Plataforma restringida: el motor está orientado a Apple silicon (Rust + Metal); no hay información sobre soporte en GPU NVIDIA o AMD.
- Latencia dependiente del hardware: las cifras de 41,5 ms/step corresponden a un M3 con 24 GB y 100 GB/s; equipos con menos ancho de banda podrían superar el presupuesto de 133,3 ms.
- Clips de voz no incluidos: hay que aportar un clip de referencia propio con derechos de uso; el modelo no incluye voces predefinidas.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos conocidos ni sobre tasas de alucinación en la información proporcionada.
- Longitud de contexto: no disponible; no se puede planificar su uso en conversaciones de larga duración sin ese dato.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del códec VibeVoice antes de desplegar en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/davidxifeng/Haru-4B-JANGTQ-uzu
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Código de inferencia: https://github.com/higurashi-ai/Haru
- Motor `uzu`: https://github.com/trymirai/uzu
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Documentación de conversión y cuantización: `docs/haru-4b-porting-and-quantization.md` en el repositorio de `uzu`
