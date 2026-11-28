# Atlas3D/Ling-3.2-air-Omni-Platos-Keys

## Resumen

Ling-3.2-air-Omni-Platos-Keys es un artefacto de investigación publicado por Atlas3D que no constituye un modelo generativo completo, sino un paquete de pesos ("Plato's Key") de 100,03 MiB en FP16 que actúa como puente entre el extractor de texto del modelo `inclusionAI/Ling-3.2-air` y el modelo multimodal `MiniMax-H3` (DiT de imagen 1024x1024 y vídeo+audio FL2VA). El objetivo es sustituir el codificador de texto profesor `Qwen3-VL-32B` (27.140 MiB) por una proyección cerrada y ajustada en FP64 que ocupa dos órdenes de magnitud menos de espacio, manteniendo una retención funcional cercana al profesor.

El modelo base es `inclusionAI/Ling-3.2-air`, un transformer MoE con arquitectura `BailingMoeV3VLForConditionalGeneration` de 127,92B parámetros en FP8 (unos 5,5B activos), 35 capas KDA (atención lineal) y 7 capas Gated MLA, con `hidden_size=2560` y licencia MIT. Atlas3D congela ese modelo y extrae "taps" de sus capas internas (capas 4 y 19 KDA, capa 35 MLA y la normalización final) para construir una clave de 4 taps que se inyecta en MiniMax-H3 sin reentrenamiento adicional.

La relevancia es metodológica: demuestra que un "grafting" omni-modal de gradiente cero puede transferir capacidad de codificación de texto entre familias de modelos con una retención SigLIP2 del 97,90 % respecto al profesor y ganancias en 16/16 grupos de evaluación frente a controles negativos. Está pensado para investigadores que experimentan con sustitución de codificadores y destilación de representaciones, no para despliegue de producto directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de pesos de proyección (Plato's Key) sobre taps de un MoE híbrido KDA + Gated MLA; no es un modelo autónomo |
| Parametros totales | 100,03 MiB en FP16 para la clave `concat4` (25,02 MiB para `single_tap`); el modelo base Ling-3.2-air tiene 127,92B en FP8 |
| Parametros activos | ~5,5B en el modelo base (MoE); la clave en sí no tiene parámetros activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos serializados en FP16; ajuste realizado en FP64; el modelo base se distribuye en FP8 E4M3 con bloques 128x128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base: MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La clave se construye mediante un procedimiento de "zero-gradient omni-modal grafting": se congela el modelo base `Ling-3.2-air` y se extraen representaciones de cuatro puntos concretos de su pila (capa 4 KDA, capa 19 KDA, capa 35 MLA y la salida de `final_normed`). Sobre esas activaciones se ajusta una proyección lineal en FP64 con estandarización RMS por slot, que después se pliega directamente en los pesos FP16 serializados. No hay entrenamiento por descenso de gradiente ni ajuste fino del modelo base; el ajuste es en forma cerrada sobre pares de prompts alineados.

Los taps KDA (Kimi Delta Attention, atención lineal) aportan representaciones de bajo coste computacional en capas tempranas y medias, mientras que el tap MLA (Multi-head Latent Attention) de la capa 35 captura representaciones de mayor nivel semántico. La variante `concat4` concatena los cuatro taps y supera a `single_tap` en las cuatro métricas funcionales evaluadas. El paquete incluye controles negativos `b0_shuffled` con prompts desordenados para verificar que la señal no es trivial. La verificación de paridad de proyección FP16 en GPU se realizó en Tesla V100 (`sm_70`) con 3/3 PASS y coseno de 0,9999998–0,9999999 frente a la referencia FP64.

## Capacidades

- Sustitución del codificador de texto `Qwen3-VL-32B` en el pipeline MiniMax-H3 para generación de imagen 1024x1024 con una retención SigLIP2 del 97,90 % (variante `concat4`).
- Transferencia zero-refit a vídeo+audio FL2VA sin bytes adicionales de puente, reutilizando la misma clave de imagen.
- Codificación de prompts de texto en representaciones compatibles con el espacio latente del profesor, con coseno de palabra-span de 0,95254 y R² de 0,99912.
- Generación de vídeo a 640x384, 56 frames a 24 fps, 16 pasos Euler, cfg=1.0, con audio estéreo a 32 kHz en el pipeline MiniMax-H3.
- No es un modelo de chat, razonamiento, código ni tool calling: no genera texto de forma autónoma.
- No soporta agentes, multi-step reasoning ni capacidades multilingües propias más allá de las heredadas del modelo base congelado.
- Variantes con distinto número de taps (`single_tap` 25,02 MiB, `concat2` 50,03 MiB, `concat4` 100,03 MiB) para ajustar el compromiso tamaño/retención.

## Casos de uso

- Investigación en destilación de codificadores de texto: usar la clave `concat4` para sustituir el profesor Qwen3-VL-32B en MiniMax-H3 y medir la degradación funcional con SigLIP2, reduciendo el footprint del codificador de 27.140 MiB a 100,03 MiB.
- Experimentos de grafting entre familias de modelos: emplear los taps KDA y MLA de Ling-3.2-air como fuente de representaciones para inyectar en otros DiT o modelos de difusión con espacio latente compatible.
- Ablación de taps: comparar `single_tap`, `concat2` y `concat4` para estudiar qué capas (lineales vs. MLA) aportan más información semántica al pipeline de generación.
- Validación de controles negativos: reproducir los b0_shuffled para verificar que las métricas de retención no se explican por azar, usando el protocolo G=16 con p=3,05e-5.
- Prototipado de pipelines de imagen/vídeo con presupuesto de VRAM ajustado: desplegar MiniMax-H3 con la clave de 100 MiB en lugar del profesor de 27 GB para liberar memoria en GPUs de 24–48 GB.
- Estudio de transferencia imagen→vídeo+audio: reutilizar la clave de imagen en FL2VA sin refit y medir la consistencia de latentes de vídeo (cos 0,77926) y audio (cos 0,86487) frente al profesor.
- Benchmarking de paridad numérica FP16/FP64: usar la verificación en Tesla V100 como referencia para validar proyecciones en otras arquitecturas.

## Benchmarks y rendimiento

Resultados de la evaluación Confirm-160 sellada (160 prompts, G=16 grupos, 8 dominios, 800 renders 1024x1024 en ComfyUI con SigLIP2-SO400M-512 sobre RTX PRO 6000 Blackwell):

| Arm | Tamano (FP16) | Word-Span Cos (n=3.413) | Word-Span R2 | SigLIP2 Retention | SigLIP2 Text-Image | SigLIP2 Image-Teacher | Final Latent Cos | G=16 Wins vs B0 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| teacher_reinject (Qwen3-VL-32B) | 27.140 MiB | 1,00000 | 1,00000 | 100,00% | 0,20454 | 1,00000 | 1,00000 | — |
| ling32_platos_key_concat4 | 100,03 MiB | 0,95254 | 0,99912 | 97,90% | 0,19921 | 0,90330 | 0,80997 | 16/16 (p=3,05e-5) |
| ling32_platos_key_single_tap | 25,02 MiB | 0,93766 | 0,99885 | 93,63% | 0,18801 | 0,85795 | 0,73410 | 16/16 (p=3,05e-5) |
| ling32_platos_key_concat2 | 50,03 MiB | 0,94453 | 0,99879 | — | — | — | — | — |
| b0_shuffled_concat4 | 100,03 MiB | 0,68409* | 0,89675* | 0,00% | -0,04921 | 0,47740 | 0,36317 | baseline |
| b0_shuffled_single_tap | 25,02 MiB | 0,65272* | 0,89562* | 0,00% | -0,05502 | 0,49120 | 0,36822 | baseline |

Transferencia zero-refit a FL2VA (12 clips, 640x384, 56 frames @ 24 fps, 16 pasos Euler, cfg=1.0, audio 32 kHz estéreo):

| Arm | Midframe SigLIP2 Text-Image | Midframe SigLIP2 Image-Teacher | Video Latent Cos vs Teacher | Audio Latent Cos vs Teacher |
|---|---:|---:|---:|---:|
| teacher_reinject | 0,17793 | 1,00000 | 1,00000 | 1,00000 |
| ling32_platos_key_concat4 | 0,18779 (4/4 > B0) | 0,93767 (4/4 > B0) | 0,77926 (4/4 > B0) | 0,86487 (3/4 > B0) |
| b0_shuffled_concat4 | -0,02372 | 0,58771 | 0,41087 | 0,54288 |

Paridad de proyección FP16 en Tesla V100 (`sm_70`): 3/3 PASS, cos 0,9999998–0,9999999 frente a FP64, 0,075–0,178 ms por prompt de 32 tokens.

## Requisitos de hardware

- La clave en sí ocupa 100,03 MiB (concat4), 50,03 MiB (concat2) o 25,02 MiB (single_tap) en FP16; es despreciable frente al modelo base.
- Para cargar el modelo base `Ling-3.2-air` completo se necesitan ~128 GB de pesos en FP8, lo que exige servir con streaming por niveles VRAM/RAM/NVMe (soporte aún abierto según el autor).
- La evaluación se realizó en NVIDIA RTX PRO 6000 Blackwell para los renders ComfyUI y en Tesla V100 (`sm_70`) para la paridad de proyección.
- No cabe en GPU consumer para el modelo base completo; la clave sola sí cabe en cualquier GPU con más de 1 GB de VRAM.
- Opciones de despliegue: el pipeline `atlas-ingine` (soporte CUDA `Generator` verificado en BF16 sintético y FP8 E4M3 nativo con `max_abs <= 2,503e-6`); ComfyUI para los renders MiniMax-H3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 0,075–0,178 ms por prompt de 32 tokens en la etapa de proyección (Tesla V100). Throughput de generación completo no disponible.
- Elementos abiertos: serving completo de 128 GB, tiling de prefill GEMM por chunks, streaming de expertos por niveles, carga de la torre de visión y drafting MTP bloque-42.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-air-Omni-Platos-Keys (concat4) | 100,03 MiB (clave) | no disponible | Sustituto de codificador de texto para MiniMax-H3 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3-VL-32B (teacher_reinject) | 27.140 MiB | no disponible | Codificador de texto profesor de MiniMax-H3 | no disponible en la informacion | Referencia interna del pipeline |
| Ling-3.2-air (base) | 127,92B FP8 (~5,5B activos) | no disponible | MoE multimodal con KDA + MLA | MIT | Hugging Face (inclusionAI) |
| b0_shuffled_concat4 | 100,03 MiB | no disponible | Control negativo con prompts desordenados | Apache 2.0 | Incluido en el repo |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: sin el pipeline MiniMax-H3 y el modelo base congelado no produce salidas útiles.
- El repositorio registra 0 descargas y 0 likes; es un artefacto de investigación sin validación comunitaria.
- La retención SigLIP2 del 97,90 % implica una pérdida del 2,10 % frente al profesor; el coseno de latente final cae a 0,80997.
- En FL2VA, la ventaja sobre el control negativo es 3/4 prompts en audio (falla en `h3p0_0080`, laguna de coral: 0,733 vs 0,812), no 4/4.
- La comparación de word-span contra B0 es descriptiva: B0 evalúa 3.204 filas frente a 3.413 del candidato por truncamiento `min(len_a, len_b)`; la inferencia estadística confirmatoria se basa solo en la evaluación G=16 de imagen.
- `Packet C` (Qwen3-TTS Mouth) y `Packet D` (YuE2-3B symbolic music) no están ajustados para Ling-3.2-air en esta release.
- El soporte CUDA nativo de `atlas-ingine` para `ModelFamily::BailingMoeV3` solo se ha verificado en checkpoints sintéticos BF16 y FP8 E4M3 128x128; el serving completo de 128 GB, el tiling de prefill, el streaming de expertos, la torre de visión y el drafting MTP bloque-42 siguen abiertos.
- Idiomas soportados no documentados; la cobertura multilingüe heredada del modelo base no está caracterizada en esta ficha.
- Licencia Apache 2.0 en la clave, pero el modelo base es MIT y el pipeline MiniMax-H3 puede tener sus propias restricciones no detalladas aquí; verificar antes de uso comercial.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta release; las métricas presentadas son de retención de representación, no de fidelidad semántica en generación libre.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Ling-3.2-air-Omni-Platos-Keys
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Paper v0.9: https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/PAPER.md
- Colección Omni by Atlas: https://huggingface.co/collections/Atlas3D/omni-by-atlas-6b09daccd0f65e23233163b3
- Repositorio atlas-ingine: https://github.com/Atlas3DSS/atlas-ingine
