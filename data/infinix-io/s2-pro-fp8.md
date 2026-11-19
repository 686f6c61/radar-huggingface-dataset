# Infinix-io/s2-pro-fp8

## Resumen

s2-pro-fp8 es una versión cuantizada en FP8 (weight-only) de Fish Audio S2 Pro, un sistema de síntesis de voz (text-to-speech) de código abierto desarrollado por Fish Audio. El modelo base destaca por su control fino de prosodia y emoción mediante instrucciones en lenguaje natural, y por cubrir más de 80 idiomas. Esta variante, publicada por Infinix-io, reduce el peso en disco de aproximadamente 12 GB a unos 6,2 GB y el uso de VRAM de inferencia de unos 24 GB a unos 12 GB, manteniendo la calidad perceptible según el autor.

La arquitectura del modelo base es Dual-Autoregressive (Dual-AR): un módulo "Slow AR" de 4B parámetros que predice el codebook semántico principal a lo largo del eje temporal y un módulo "Fast AR" de 400M parámetros que genera los codebooks residuales para reconstruir el detalle acústico fino. El conjunto suma 5.641.022.720 parámetros y se apoya en un códec de audio RVQ de 10 codebooks a ~21 Hz.

Su relevancia actual radica en que permite ejecutar un TTS multilingüe de alta calidad con control expresivo en GPUs de consumo (RTX 4090, RTX 5090) al reducir el requisito de VRAM a ~12 GB, sin dependencias externas de cuantización más allá de PyTorch 2.1+. La licencia es de investigación (fish-audio-research-license), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Autoregressive (Dual-AR): transformer decoder-only + códec de audio RVQ (10 codebooks, ~21 Hz). Slow AR (4B) + Fast AR (400M) |
| Parametros totales | 5.641.022.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 weight-only (float8_e4m3fn) con escalas per-row en float32; pesos no lineales en bfloat16 |
| Idiomas soportados | 80+ idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | safetensors (float8_e4m3fn + escalas float32 + tensores bfloat16) |

## Arquitectura y entrenamiento

El modelo base S2 Pro combina un transformer decoder-only con un códec de audio basado en RVQ (residual vector quantization) de 10 codebooks a una tasa de ~21 Hz. La generación se divide en dos etapas: el Slow AR (4B parámetros) predice el codebook semántico principal a lo largo del tiempo, y el Fast AR (400M parámetros) genera los codebooks residuales que aportan el detalle acústico fino. El sistema se entrenó con una receta multi-etapa y un pipeline de datos escalonado que incluye captioning de vídeo y de habla, sobre más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineamiento mediante reinforcement learning.

Esta variante FP8 cuantiza únicamente las matrices de pesos de todas las capas `nn.Linear` de ambos backbones (201 capas en total), dejando embeddings, layer norms y códec en bfloat16. La cuantización es simétrica per-row: cada fila de salida de cada matriz tiene su propia escala float32 (`scale = max(abs(row)) / 448.0` para float8_e4m3fn), y la desquantización se implementa en PyTorch puro dentro de un módulo `FP8Linear`, sin necesidad de torchao, bitsandbytes ni AutoGPTQ. Las activaciones permanecen en bfloat16 y la desquantización a bfloat16 ocurre en todo el hardware, por lo que el ahorro de VRAM se aplica también a GPUs Ampere o anteriores, aunque las tensor cores FP8 nativas (Ada Lovelace y Blackwell) ofrecen la máxima velocidad.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en más de 80 idiomas.
- Control fino de prosodia y emoción mediante instrucciones en lenguaje natural (instruction-following).
- Generación multi-turno y multi-hablante (multi-speaker, multi-turn).
- Clonación de voz (nodo específico de voice clone en ComfyUI).
- Seguimiento de instrucciones estilísticas inline dentro del texto.
- Integración con ComfyUI mediante nodos dedicados (Fish S2 TTS, Voice Clone TTS y Multi-Speaker TTS).
- Compatibilidad con SGLang según los tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización de vídeo: el soporte de 80+ idiomas y el control de prosodia permiten generar pistas de voz en distintos idiomas manteniendo el estilo del original, con ~12 GB de VRAM por instancia.
- Audiolibros y narración expresiva: las instrucciones en lenguaje natural permiten ajustar emoción y ritmo por fragmento, útil para narrativa con múltiples personajes.
- Asistentes de voz y atención al cliente: la generación multi-turno y multi-hablante facilita conversaciones con turnos alternos y voces diferenciadas por rol.
- Producción de contenido en ComfyUI: los nodos nativos permiten integrar TTS en pipelines de generación audiovisual ya existentes, con auto-descarga del modelo y ajustes recomendados (`precision: auto/bfloat16`, `attention: sage_attention`).
- Prototipado de videojuegos y personajes: la clonación de voz y el control de emoción permiten generar diálogos de personajes sin grabar locuciones.
- Accesibilidad y lectura de textos: conversión de documentos a voz en múltiples idiomas sobre GPUs de consumo (RTX 4090/5090) gracias al footprint de ~12 GB.
- Investigación en TTS: al ser una cuantización FP8 con desquantización en PyTorch puro, sirve para estudiar el impacto de la cuantización per-row en modelos Dual-AR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12 GB (frente a ~24 GB del modelo original en bfloat16).
- GPU recomendadas: NVIDIA con CUDA; se recomiendan GPUs con tensor cores FP8 nativas (Ada Lovelace o Blackwell): RTX 4090, RTX 5090, H100.
- GPUs Ampere y anteriores: cargan y ejecutan correctamente, con la misma ventaja de ~12 GB de VRAM, aunque sin aceleración FP8 nativa.
- Cabe en GPUs de consumo como la RTX 4090 y la RTX 5090.
- Opciones de despliegue: ComfyUI mediante el nodo ComfyUI-FishAudioS2 (recomendado), transformers, y SGLang según los tags del repositorio.
- Dependencias: PyTorch 2.1+; no requiere torchao, bitsandbytes ni AutoGPTQ.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | VRAM inferencia |
|---|---|---|---|---|---|---|
| s2-pro-fp8 (este) | 5.641.022.720 | no disponible | 80+ | fish-audio-research-license | safetensors FP8 | ~12 GB |
| fishaudio/s2-pro (base) | no disponible (repo ~12 GB) | no disponible | 80+ | fish-audio-research-license | safetensors bfloat16 | ~24 GB |
| Alternativas de TTS open source de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal disponible es frente al modelo base: misma arquitectura y capacidades, con la mitad de tamaño en disco (~6,2 GB frente a ~12 GB) y de VRAM (~12 GB frente a ~24 GB), y sin pérdida de calidad perceptible según el autor. No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de otros modelos TTS comparables.

## Limitaciones y advertencias

- Licencia fish-audio-research-license: restringe el uso; el formulario de acceso exige aceptar uso exclusivamente no comercial, lo que limita el despliegue en producción comercial sin licencia adicional.
- El acceso al modelo está condicionado (gated): se solicita país, fecha y aceptación de no generar contenido que viole DMCA o leyes locales.
- Riesgo de uso indebido para clonación de voz sin consentimiento; el autor exige no generar contenido ilegal, pero no se documentan salvaguardas técnicas adicionales.
- Riesgo de alucinación o artefactos acústicos inherente a los modelos generativos de audio; no se cuantifica en la información disponible.
- La cuantización FP8 puede introducir degradación sutil no medida con benchmarks; el autor afirma que no hay pérdida perceptible, pero no aporta métricas.
- Longitud de contexto no documentada; puede limitar la generación de pasajes muy largos en una sola pasada.
- Rendimiento dependiente del hardware: sin tensor cores FP8 nativas la desquantización añade overhead, aunque el ahorro de VRAM se mantiene.
- El repositorio indica `inference: false` en los metadatos, pese a que la model card documenta uso en ComfyUI y transformers; conviene verificar la integración real en cada framework.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Infinix-io/s2-pro-fp8
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Informe técnico (paper): https://huggingface.co/papers/2603.08823
- Repositorio GitHub: https://github.com/fishaudio/fish-speech
- Playground: https://fish.audio
- Nodo ComfyUI: https://github.com/Saganaki22/ComfyUI-FishAudioS2
- Licencia: LICENSE.md (referenciada en la model card del repositorio)
