# pugant/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ROCmFP4-STRIX_LEAN

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B-A3B es un modelo de lenguaje de NVIDIA con arquitectura híbrida que combina capas Mamba-2 (SSM), MoE (mixture of experts) y atención multi-cabeza. Esta ficha cubre la cuantización ROCmFP4-STRIX_LEAN publicada por el usuario pugant, un formato GGUF personalizado (tipo 106) diseñado exclusivamente para el fork ROCmFPX de llama.cpp en GPUs AMD RDNA 3.5 (gfx1151, Strix Halo).

El modelo base tiene 31,58 mil millones de parámetros totales con aproximadamente 3,5 mil millones activos por token, una ventana de contexto de 1 millón de tokens y un vocabulario de 131072 tokens. La cuantización ROCmFP4 consigue un footprint de 15,72 GiB y alcanza 84,3 tokens por segundo en generación sobre una Radeon 8060S, siendo el modelo más rápido probado en ese hardware según el autor. Es relevante porque demuestra cómo la cuantización FP4 por software puede superar a Q4_K_M en arquitecturas híbridas SSM-MoE donde los tensores Mamba no son compatibles con los formatos de cuantización convencionales.

La licencia es OpenMDW-1.1, heredada del modelo base de NVIDIA, y el repositorio incluye el GGUF listo para usar con instrucciones de despliegue en contenedor Docker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 (SSM) + MoE + Attention (nemotron_h_moe) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | ~3,5 mil millones (6 de 128 expertos + 1 compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (tipo 106, fork ROCmFPX) |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp, fork ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B emplea una arquitectura híbrida de 52 capas donde cada capa es uno de tres tipos: capas Mamba-2 (SSM) con conv_kernel de 4, state_size de 128 y 64 cabezas, que manejan contexto largo con coste KV fijo; capas MoE con 128 expertos enrutados (6 activos por token) más 1 experto compartido, con feed-forward de 1856 dimensiones por experto y 3712 para el compartido; y capas de atención multi-cabeza con 32 cabezas y 2 KV heads (GQA), head_dim de 128 y RoPE con theta 10000, insertadas periódicamente para mezcla global.

La cuantización ROCmFP4-STRIX_LEAN utiliza dequantización FP4 por software (FP4 a FP16) ya que gfx1151 no tiene hardware FP4 nativo. El formato cuantiza nativamente los tensores Mamba/SSM (solo 1 de 401 tensores cae a fallback, frente a 134 en Q4_K_M), lo que explica gran parte de la ventaja de rendimiento. El modelo cuantizado no incluye los tensores MTP/nextn del modelo base, por lo que no hay decodificación especulativa en esta build. Se utilizó una imatrix de calibración de bartowski con 185 entradas y 822 chunks.

## Capacidades

- Generación de texto con plantilla de chat que incluye modo de razonamiento (bloque `thinking` que se expone en `reasoning_content` en el endpoint compatible con OpenAI).
- Razonamiento multi-paso gracias al modo thinking integrado.
- Capacidades multilingües (inglés y otros idiomas).
- Manejo de contexto muy largo (1M tokens) gracias a las capas Mamba-2 con coste KV fijo.
- Sin soporte de tool calling documentado en esta cuantización (no se menciona en la model card).
- Sin capacidades de visión ni audio (modelo solo texto).

## Casos de uso

- Inferencia en hardware AMD Strix Halo con memoria unificada: el modelo está optimizado para Radeon 8060S (gfx1151) y alcanza 84,3 tok/s en generación, lo que lo hace viable para aplicaciones interactivas en equipos portátiles con APU AMD Ryzen AI MAX+.
- Procesamiento de documentos largos: con 1M de tokens de contexto y capas SSM, puede procesar libros completos, codebases extensos o transcripciones largas sin perder información por ventana.
- Chat conversacional con razonamiento: el modo thinking permite respuestas razonadas en asistentes virtuales, útil para soporte técnico o tutoría.
- Generación de código en entornos con restricciones de VRAM: con 15,72 GiB de footprint cabe en la memoria unificada de Strix Halo (128 GB), dejando espacio para otras aplicaciones.
- Experimentación con cuantización FP4 en RDNA 3.5: sirve como referencia para evaluar el rendimiento de FP4 por software frente a formatos tradicionales en arquitecturas híbridas.
- Despliegue en contenedor Docker con llama-server: el comando proporcionado permite levantar un servidor compatible con OpenAI en minutos, útil para prototipado rápido.

## Benchmarks y rendimiento

Mediciones del autor en AMD Ryzen AI MAX+ 395, Radeon 8060S (gfx1151, 128 GB memoria unificada), ROCm 7.2.4, con `llama-bench -ngl 999 -fa on -p 512 -n 128`:

| Formato | tg128 (tok/s) | pp512 (tok/s) | Tamano |
|---|---:|---:|---:|
| ROCmFP4-STRIX_LEAN | 84,28 | 1051 | 15,72 GiB |
| Q4_K_M (misma base) | 63,64 | 813 | 22,82 GiB |

El formato ROCmFP4 es un 32% más rápido en generación y un 31% más pequeño que Q4_K_M. Comparado con otros modelos ROCmFP4 en Strix Halo: +19% frente a grug-35b-v2 (70,92 tok/s) y +26% frente a Ornith-1.0-35B (66,68 tok/s). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,72 GiB para el GGUF completo; con memoria unificada en Strix Halo se puede ejecutar sin partición VRAM dedicada (la partición de 512 MB es insuficiente, se requiere `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1`).
- GPU compatible: exclusivamente AMD RDNA 3.5 (gfx1151, Strix Halo). No funciona en otras GPUs ni en builds estándar de llama.cpp.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB sí podría cargarlo, pero el formato ROCmFP4 no es compatible con CUDA).
- Opciones de despliegue: fork ROCmFPX de llama.cpp (build para gfx1151 o Docker toolbox), con `llama-server` y flags obligatorios `-fit off`, `HSA_OVERRIDE_GFX_VERSION=11.5.1` y `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1`.
- Latencia/throughput: 84,28 tok/s de generación y 1051 tok/s de prefill en el hardware de referencia.

## Comparativa con modelos similares

Comparación con otros modelos ROCmFP4 probados en el mismo hardware Strix Halo según el autor:

| Modelo | Parametros | tg128 (tok/s) | Tamano GGUF |
|---|---:|---:|---:|
| Nemotron 3.5 Lightning 30B-A3B (ROCmFP4) | 31,58 B totales / 3,5 B activos | 84,28 | 15,72 GiB |
| grug-35b-v2 (ROCmFP4) | ~35 B | 70,92 | no disponible |
| Ornith-1.0-35B (ROCmFP4) | ~35 B | 66,68 | no disponible |

Frente al modelo base en Q4_K_M: 63,64 tok/s y 22,82 GiB. No se dispone de datos de benchmarks de calidad (MMLU, etc.) para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El formato tipo 106 (Q4_0_ROCMFP4_STRIX_LEAN) es inválido para llama.cpp estándar; solo carga en el fork ROCmFPX. Intentar cargarlo con una build estándar fallará.
- La dequantización FP4 es por software en gfx1151; no se usa hardware FP4 nativo, por lo que la ventaja viene del menor footprint de memoria y del kernel optimizado del fork.
- Requiere memoria unificada y el flag `-fit off` obligatorio; con `-fit on` por defecto el servidor se bloquea durante el ajuste de parámetros en la MoE de 128 expertos.
- No incluye decodificación especulativa (MTP) porque el conversor del fork no emite los tensores nextn.
- Solo validado en Strix Halo (gfx1151); el comportamiento en otras GPUs AMD no está garantizado.
- Riesgo de alucinación y sesgos no documentados específicamente para esta cuantización; se heredan del modelo base de NVIDIA.
- Licencia OpenMDW-1.1: revisar términos para uso comercial, especialmente en cuanto a obligaciones de atribución y restricciones de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pugant/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ROCmFP4-STRIX_LEAN
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Toolbox de referencia: https://github.com/kyuz0/llama.cpp-amd-gpu
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- GGUF de referencia con imatrix: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo comparativo mencionado: https://huggingface.co/pugant/Qwen3.6-35B-A3B-MTP-Q6_0_ROCMFPX
