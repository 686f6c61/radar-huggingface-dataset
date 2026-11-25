# sandpies/cleantie-v2Sing-hybrid

## Resumen

CleanTie & HandTie V2Sing Hybrid es un conjunto de checkpoints de difusión para generación de vídeo con audio (audio-video generation) construido sobre MiniMax-H3 en su variante Ref2VA, empaquetados como archivos únicos para ComfyUI. Lo desarrolla el usuario independiente sandpies y se distribuye bajo la licencia comunitaria de MiniMax-H3. El modelo resuelve el problema de generar clips con audio sincronizado y referencia visual (ref2va, fl2va) manteniendo coherencia de personaje y estilo entre tomas encadenadas, con variantes calibradas para anatomía (`handtie`) y una base SFW (`cleantie`).

La relevancia técnica está en sus builds cuantizados calibrados con Hessian (GPTQ + STE) y atención INT8, que reducen el peso de 37,46 GiB en BF16 a 14,17–20,97 GiB y aceleran la inferencia entre 1,9× y 2,75× frente a BF16 en caliente sobre una RTX 5090. Incluye además un LoRA turbo de 8 pasos (`PikaDMAD_audiosafe_8step_sep_fro99`) que permite usar las espinas base sin turbo horneado, y está pensado para flujos multi-hop de vídeo largo mediante el nodo ComfyUI-Hand-Tie-Clips.

El repositorio ocupa 371,5 GB e incluye múltiples tiers de precisión (BF16, INT8 ConvRot, INT8 MinMaxxed, W6 g16, W4/W6 compact), tanto con turbo horneado como en espinas sin hornear. No se especifican parámetros totales, longitud de contexto ni idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión sobre MiniMax-H3 (variante Ref2VA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 ConvRot, INT8 tensorwise MinMaxxed (GPTQ+STE calibrado Hessian), W6 g16, W4/W6 mixto, atención INT8 52× |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (diffusion-single-file) |
| Tarea | image-to-video, audio-video-generation, ref2va, fl2va |
| Pasos de muestreo | 8 (turbo horneado o LoRA PureTurbo a 0,85–1,0) |
| Sampler / scheduler | lcm o euler + beta_57 / beta / simple |
| Flow shift | vídeo 12,0; audio 2,0–3,0 (benchmark a 12,0 / 2,5) |
| Resolución de referencia | 480×640 / 640×480, 73 frames |
| Tamaño del repo | 371,5 GB |
| Descargas / likes | 1501 / 13 |
| Creado / actualizado | 2026-11-22 / 2026-11-22 |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión para generación conjunta de vídeo y audio, derivado de MiniMax-H3 en la variante Ref2VA (referencia a vídeo+audio) y FL2VA (frame-latent a vídeo+audio). Se distribuye como archivos únicos de difusión para ComfyUI, con varias espinas base y variantes con turbo horneado en FP32. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; se indica que MiniMax-H3 se distribuye ya destilado, por lo que el sampler se fija en 8 pasos.

La innovación técnica destacable está en la cuantización: los builds INT8 MinMaxxed usan GPTQ con straight-through estimator y calibración Hessiana, aplicada a ConvRot (`int8_tensorwise`) y a la atención INT8 en los bloques `0,1,2,49` con refiner en BF16. El tier W6 g16 HQ combina W6 en `qkv`/`fc1` con INT8 en `out`/`fc2`; el tier compacto mezcla W4 en `qkv`/`fc1`, W6 en `out` y bloques `47..48`, e INT8 en `fc2` y bloques `0,1,49`. El LoRA PureTurbo se poda a un `avg_r=158.5` conservando ≥99% de energía Frobenius, lo que permite aplicarlo sobre cualquier base H3 sin turbo. Los checkpoints `handtie` incorporan una pila de anatomía calibrada, equilibrada para que LoRAs de estilo, personaje y detalle sigan cargándose a 0,2–0,6.

## Capacidades

- Generación de vídeo a partir de imagen o frame de referencia (image-to-video, ref2va, fl2va).
- Generación de audio sincronizado con el vídeo, con clonación de voz en los tiers de mayor fidelidad.
- Coherencia de personaje y estilo entre tomas encadenadas (multi-hop) mediante ComfyUI-Hand-Tie-Clips.
- Variante SFW (`cleantie`) y variante con anatomía calibrada (`handtie`).
- Compatibilidad con LoRAs de estilo, personaje y detalle sobre las espinas sin hornear y sobre `handtie`.
- Inferencia en 8 pasos con sampler lcm/euler y schedulers beta_57, beta o simple.
- Ejecución en ComfyUI con `comfy-kitchen >= 0.2.41` para los kernels INT8, W6 y W4.
- No se documentan tool calling, agentes, matemáticas ni razonamiento textual: es un modelo generativo audiovisual.

## Casos de uso

- Generación de clips cortos con audio para redes sociales: a 480×640 y 73 frames en 8 pasos, el tier `turbo_int8_minmaxxed` ofrece un equilibrio entre fidelidad y velocidad (1,92–2,46× frente a BF16) adecuado para iteración rápida.
- Animación de personajes recurrentes a partir de una imagen de referencia: la variante Ref2VA mantiene la identidad visual entre tomas, y el encadenado multi-hop con ComfyUI-Hand-Tie-Clips permite construir secuencias largas.
- Doblaje y clonación de voz en vídeo: el tier `turbo_w6_g16_hq` alcanza una similitud de audio de 0,994 en la escena `midnight_store_male`, útil para diálogos con voz consistente.
- Previsualización en estaciones con GPU de consumo: el tier `turbo_w4w6_compact` (14,17 GiB) permite probar prompts y composiciones en tarjetas de 16–24 GB antes de renderizar en un tier superior.
- Producción de contenido SFW para publicidad o narrativa: la base `cleantie` está pensada para material no explícito, con mejor fidelidad de píxel y audio en `nightmarket_anime` (21,13 dB).
- Integración en pipelines de ComfyUI existentes: al ser diffusion-single-file, se carga como checkpoint de difusión y se combina con el LoRA PureTurbo sobre espinas base para flujos personalizados de merging.
- Investigación en cuantización de modelos de difusión: los distintos tiers (BF16, INT8 ConvRot, INT8 MinMaxxed, W6, W4/W6) permiten comparar el impacto de cada esquema en fidelidad visual y de audio.

## Benchmarks y rendimiento

Datos medidos en ComfyUI sobre RTX 5090, sampler `lcm`, scheduler `beta_57`, shift 12,0 / 2,5, 8 pasos, 73 frames a 480×640 / 640×480 en 5 escenas, frente a referencia BF16 en caliente:

| Tier | Aceleración vs BF16 | Peso | Notas de fidelidad |
|---|---|---|---|
| INT8 MinMaxxed | 1,92–2,46× | 20,97 GiB | Mejor bloqueo de color y props, coincidencia de habla superior a INT8 sin calibrar |
| W6 g16 HQ | 2,06–2,36× | 19,20 GiB | Mejor fidelidad SFW: 21,13 dB en `nightmarket_anime`, 22,43 dB y audio cos 0,994 en `midnight_store_male` |
| W4/W6 Compact | 2,32–2,75× | 14,17 GiB | Estructura visual correcta, pero clonación de voz degradada (0,645–0,933) en algunos diálogos |
| INT8 ConvRot (legacy) | ~20% más lento que MinMaxxed | 20,59 GiB | ConvRot sin calibrar, atención estándar |
| BF16 | referencia | 37,46 GiB | Precisión completa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo generativo audiovisual.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el peso del checkpoint más overhead de activaciones y VAE; el tier compacto de 14,17 GiB es el más ligero, el BF16 de 37,46 GiB requiere al menos 40 GB.
- GPU recomendadas: RTX 5090 (plataforma de los benchmarks), A100 80 GB y H100 para BF16; RTX 4090 24 GB para los tiers INT8 y W6.
- En GPU de consumo: el tier `turbo_w4w6_compact` (14,17 GiB) y el `turbo_w6_g16_hq` (19,20 GiB) caben en tarjetas de 16–24 GB; el `turbo_int8_minmaxxed` (20,97 GiB) encaja ajustado en 24 GB.
- Despliegue: ComfyUI con `comfy-kitchen >= 0.2.41` para los kernels `int8_tensorwise` ConvRot, `w6a8_int8`, `asym_w4a8_int8` y atención `comfy_kitchen_int8` embebida. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no se publican valores absolutos de latencia o fps; solo aceleraciones relativas frente a BF16 (1,92–2,75× según tier).

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Peso típico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CleanTie & HandTie V2Sing Hybrid | difusión vídeo+audio Ref2VA/FL2VA | 8 | 14,17–37,46 GiB | minimax-h3-community | Hugging Face, single-file ComfyUI |
| MiniMax-H3 (base) | difusión vídeo+audio | destilado | no disponible | minimax-h3-community | Hugging Face |
| Pika-H3-Flex | difusión vídeo (base referenciada) | no disponible | no disponible | no disponible | Hugging Face |
| Minimax-h3_Singularity | difusión vídeo (base referenciada) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de las alternativas en la información proporcionada; la comparativa se limita a linaje y disponibilidad.

## Limitaciones y advertencias

- El tier `turbo_w4w6_compact` degrada la clonación de voz (similitud 0,645–0,933) en algunos prompts de diálogo; no es adecuado para producción con voz crítica.
- No se deben apilar dos checkpoints ni añadir un segundo turbo de 8 pasos: los archivos `_turbo_` ya lo llevan horneado y los `handtie_` ya incluyen la pila de anatomía.
- La licencia `minimax-h3-community-license-agreement` impone restricciones de uso comercial que deben revisarse antes de desplegar; no es una licencia permisiva estándar.
- Riesgo de alucinación visual y de artefactos en anatomía, texto en escena y coherencia temporal en clips largos; no se documentan métricas de sesgo.
- La información no detalla idiomas soportados ni calidad multilingüe del audio generado.
- Requiere versiones específicas de ComfyUI y `comfy-kitchen`; versiones anteriores no cargarán los kernels cuantizados.
- El repositorio completo ocupa 371,5 GB; conviene descargar solo el tier necesario.
- No se publican datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad más allá de la separación SFW/anatomía.

## Enlaces

- [Hugging Face: sandpies/cleantie-v2Sing-hybrid](https://huggingface.co/sandpies/cleantie-v2Sing-hybrid)
- [Licencia MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
- [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [WarmBloodAban/Minimax-h3_Singularity](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
- [Pika-Labs/Pika-H3-Flex](https://huggingface.co/Pika-Labs/Pika-H3-Flex)
- [ZhengmingYu/DMAD](https://huggingface.co/ZhengmingYu/DMAD)
- [ComfyUI-Hand-Tie-Clips](https://github.com/sandpies/ComfyUI-Hand-Tie-Clips)
