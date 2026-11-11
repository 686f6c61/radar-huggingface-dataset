# mchen04/Ripple-65B-Preview-4bit-MLX

## Resumen

Ripple-65B-Preview es un modelo de lenguaje de 64.782.689.360 parámetros (aproximadamente 64,78 mil millones) desarrollado por Ricursive Intelligence, orientado a generación de texto, razonamiento y tool calling. Esta ficha describe la conversión cuantizada a 4 bits en formato MLX publicada por mchen04, que permite ejecutar el modelo en Apple Silicon mediante streaming de pesos desde disco, dado que los pesos completos (33,94 GiB) no caben en la memoria unificada de un Mac de 24 GiB.

La relevancia de esta publicación es doble: por un lado, expone un runtime MLX funcional para un modelo de escala 65B en hardware de consumo Apple; por otro, documenta de forma explícita y medible las limitaciones de rendimiento del enfoque (decodificación a ~0,06 tokens/s con un presupuesto residente de 5 GiB, prefill de 14 a 21 tokens/s y un contexto máximo medido de 8192 tokens). No se trata de un modelo nuevo, sino de una conversión cuantizada con port de runtime, manteniendo la arquitectura, tokenizador y plantilla de chat del modelo original.

La información disponible sobre el modelo base (arquitectura exacta, datos de entrenamiento, benchmarks) es limitada en esta ficha; los detalles técnicos del port MLX están documentados con precisión (grupos afines de 4 bits, tamaños de 64, escalas y sesgos en FP16, normas y value-residual en BF16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con PeriNorm, embedding scaling, value residual, SwiGLU recortado, atención con compuertas, Q/K norms, atención RoPE deslizante y atención global NoPE (según el port MLX) |
| Parámetros totales | 64.782.689.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens medidos como máximo funcional; 16384 falla por crecimiento de swap |
| Tipos de cuantización | 4 bits afín MLX (grupos de 64), escalas y sesgos en FP16; normas y value-residual en BF16; activaciones en FP16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `provenance.json` y `weights-affine4.json` con SHA-256 por shard |

## Arquitectura y entrenamiento

El modelo base es un transformer de 65B parámetros de Ricursive Intelligence. El port MLX reproduce fielmente los componentes arquitectónicos del original: PeriNorm, embedding scaling, value residual, SwiGLU recortado, atención con compuertas, Q/K norms, atención RoPE deslizante y atención global NoPE. Las capas 0 y 14 del código fuente pasan comprobaciones de paridad en float32 contra la implementación upstream, y se ejecutan pruebas de modelo completo sobre logits, decodificación con caché y prefill por chunks, aunque el autor indica que estas pruebas no establecen paridad BF16 de modelo completo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión no aplica entrenamiento, poda ni abliteration: el modelo conserva el comportamiento original. La cuantización lee directamente los shards BF16 originales fijados a la revisión `da94cc0` y no recuantiza la referencia de 8 bits. La innovación técnica destacable del port es el streaming de capas no residentes durante la decodificación, con un presupuesto residente de 5 GiB que mantiene ~4,71 GiB de pesos en memoria y transmite 70 capas desde disco, además de `streaming_prefetch` para consejos de lectura de la siguiente capa.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento: el modelo produce respuestas con bloque `<think>` cerrado (modo de pensamiento).
- Tool calling / function calling nativo: el parser registra llamadas a herramientas (no las ejecuta).
- Razonamiento multi-paso dentro de la ventana de contexto medida (8192 tokens).
- Capacidad aritmética básica verificada en pruebas de humo (17 × 19 = 323).
- Razonamiento lógico proposicional verificado en pruebas de humo (silogismo con respuesta "No").
- No se documentan capacidades de visión, audio ni multimodalidad.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Experimentación con modelos de 65B en Apple Silicon: el runtime permite ejecutar un modelo de gran escala en Macs de 24 GiB mediante streaming de pesos, adecuado para investigación que tolere latencia alta (minutos por respuesta corta).
- Pruebas de razonamiento con modo thinking: el bloque `<think>` cerrado permite inspeccionar cadenas de razonamiento en tareas lógicas y aritméticas, útil para evaluación de trazas de razonamiento.
- Validación de tool calling en pipelines locales: el parser de llamadas a herramientas con JSON de ejemplo (`weather-tools.json`) sirve para probar integraciones de agentes sin depender de APIs externas.
- Evaluación de cuantización 4-bit frente a referencia 8-bit: el repositorio incluye un test de calidad sobre WikiText-2 que mide la pérdida de calidad, útil para estudiar el impacto de la cuantización afín de 4 bits.
- Reproducibilidad de conversiones MLX: los ficheros `provenance.json` y `weights-affine4.json` con SHA-256 por shard permiten auditar la integridad de pesos en flujos de publicación.
- Docencia y demostraciones de streaming de pesos: el mecanismo de 70 capas transmitidas desde disco con presupuesto residente de 5 GiB es un caso práctico para explicar inferencia con memoria limitada.
- Prototipado de asistentes conversacionales en inglés con contexto medio (hasta 8192 tokens) en hardware de consumo, aceptando throughput bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento documentados son del runtime MLX:

| Métrica | Valor medido |
|---|---|
| Decodificación | ~0,06 tokens/s (streaming desde disco, presupuesto residente de 5 GiB) |
| Prefill | ~14 a 21 tokens/s en las indicaciones medidas |
| Contexto máximo funcional | 8192 tokens |
| Contexto que falla | 16384 tokens (crecimiento de swap) |
| Tamaño total de pesos | 36.442.939.738 bytes (~33,94 GiB) |
| Pesos residentes en memoria | ~4,71 GiB bajo presupuesto de 5 GiB |
| Capas transmitidas | 70 |
| Límite de memoria MLX | 11 GiB (memoria cableada solicitada: 11 GiB) |
| Prueba de calidad | Pérdida medible frente a referencia de 8 bits; 1.020 posiciones next-token de cuatro pasajes WikiText-2 raw |

## Requisitos de hardware

- Apple Silicon obligatorio (runtime MLX); no funciona en GPU NVIDIA ni CPU x86 con este port.
- Al menos 55 GiB de disco libre antes de la descarga; el repo ocupa 36,9 GB.
- Mantener 6 GiB de memoria de sistema disponibles para otros procesos; el runtime rechaza trabajo que cruce esa reserva.
- Mac de 24 GiB: configuración objetivo del autor; los pesos no caben completos y se transmiten desde disco.
- VRAM/unified memory estimada: ~5 GiB residentes más 6 GiB de reserva de sistema; límite MLX de 11 GiB.
- GPUs recomendadas: no aplica (solo Apple Silicon); no se documentan pruebas en A100, H100 ni RTX 4090.
- Despliegue: runtime propio incluido en el repo (`run.py`), MLX 0.32.4, MLX-LM 0.32.2, Transformers 5.22.2, HF Hub 2.4.0, Safetensors 0.8.0, NumPy 2.5.4, psutil 7.2.2, Python 3.12 y `uv`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: minutos por respuesta corta en un Mac de 24 GiB; decodificación a ~0,06 tokens/s y prefill de 14 a 21 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview 4-bit MLX (esta ficha) | 64,78B | 8192 medidos | Apache-2.0 | Hugging Face, runtime MLX propio | Solo Apple Silicon; streaming de pesos; ~0,06 tok/s decode |
| Ripple-65B-Preview (original, ricursiveAI) | 64,78B | no disponible | Apache-2.0 | Hugging Face | Pesos BF16 originales; revisión `da94cc0` |
| Ripple-65B-Preview-MLX-mixed-1bit (araysuter) | no disponible | no disponible | no disponible | Hugging Face | Adaptador citado como referencia para la integración de caché MLX |
| Referencia 8-bit del propio autor | 64,78B | no disponible | Apache-2.0 | Interna al proceso de conversión | Usada como referencia de calidad; no se recuantiza |

No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Rendimiento muy bajo: ~0,06 tokens/s en decodificación; una respuesta corta puede tardar muchos minutos en un Mac de 24 GiB.
- Contexto limitado a 8192 tokens medidos; 16384 falla por crecimiento de swap.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Pérdida de calidad medible frente a la referencia de 8 bits en la prueba de WikiText-2; no se establece paridad BF16 de modelo completo.
- El parser de tool calls registra las llamadas pero no las ejecuta ni realiza peticiones externas; la ejecución corre a cargo del usuario.
- Requiere revisar manualmente los ficheros Python del runtime personalizado antes de ejecutarlo; es código de terceros con `custom_code`.
- Dependencia de revisiones fijadas (`RIPPLE_REVISION`); la descarga debe fijarse al commit completo para reproducibilidad.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el runtime deben conservar LICENSE y NOTICE; los pasajes WikiText derivan de Wikipedia bajo CC BY-SA 3.0 y GFDL.
- Riesgo de alucinación no cuantificado en la información disponible; sin datos de sesgos publicados.
- Un stop por límite de tokens indica resultado incompleto; hay que verificar el motivo de parada en las salidas JSON.
- No apto para producción interactiva con los parámetros de latencia documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mchen04/Ripple-65B-Preview-4bit-MLX
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Revisión del modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/tree/da94cc013a8fda04a502f0a185083c7099ea06c1
- Adaptador MLX mixed-1bit de referencia: https://huggingface.co/araysuter/Ripple-65B-Preview-MLX-mixed-1bit
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
