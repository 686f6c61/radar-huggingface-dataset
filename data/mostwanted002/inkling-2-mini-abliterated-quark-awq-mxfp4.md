# mostwanted002/Inkling-2-Mini-abliterated-Quark-AWQ-MXFP4

## Resumen

Inkling-2-Mini-abliterated-Quark-AWQ-MXFP4 es una cuantización de 4 bits (MXFP4 con calibración AWQ) del modelo Inkling 2 Mini de Thinking Machines, un transformer MoE con arquitectura de bucles (looped MoE) de 26.400 millones de parámetros totales y 3.400 millones activos por token. El checkpoint parte de la versión abliterada publicada por OpenUncensored, que elimina el subespacio de rechazo mediante proyección direccional de rango 2 sobre las proyecciones de salida de atención de las capas 4 a 23, y ha sido re-cuantizado por mostwanted002 con la herramienta Quark (amd-quark 0.13) sobre la totalidad del modelo de lenguaje.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización extrema (de BF16 a MXFP4, con un factor de compresión aproximado de 3,5x respecto al checkpoint original y de 3,5x frente a los 53,5 GiB en BF16) manteniendo una perplejidad prácticamente idéntica a la del modelo nativo (11,1705 frente a 11,2212). Por otro, ilustra una cadena de procedencia verificada a nivel de tensor: solo 20 de las 1.116 matrices de pesos difieren del checkpoint nativo, lo que permite auditar con precisión qué se ha modificado y qué se conserva byte a byte.

El modelo conserva la arquitectura completa del original: 24 capas con las 12 centrales repetidas tres veces por token, atención híbrida local/global, torre de visión en BF16 sin cuantizar y cabeza MTP (multi-token prediction) nativa para decodificación especulativa. El resultado ocupa aproximadamente 15,4 GiB y está pensado para ejecutarse en el mismo entorno que el modelo original (ROCm o CUDA con transformers 5.24.0 o superior), pero con un footprint notablemente menor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles (looped MoE), atención híbrida local/global, torre de visión y cabeza MTP |
| Parámetros totales | 13.818.667.008 (según safetensors); la model card declara 26,4B MoE con 3,4B activos |
| Parámetros activos | 3,4B (declarado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 con calibración AWQ (Quark 0.13); torre de visión en BF16; cabeza MTP sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el modelo base se declara Apache-2.0 en la model card |
| Formato de pesos | safetensors (con lineales `QuantLinear` de Quark) |

## Arquitectura y entrenamiento

La arquitectura es un MoE con 24 capas en el que las 12 capas centrales se ejecutan tres veces por token (bucle de profundidad), combinando atención local y global de forma híbrida. Cada capa aloja 128 expertos enrutados, lo que da un total de 26,4B parámetros con 3,4B activos por token. El modelo incorpora además una torre de visión para entrada multimodal y una cabeza MTP que habilita decodificación especulativa mediante el archivo `mtp.safetensors`. El identificador de arquitectura en transformers es `inkling2_loop`.

El proceso de entrenamiento original no se detalla en la información disponible: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí está documentado es la cadena de transformaciones posterior. La abliteración de OpenUncensored aplica una proyección multiplicativa de rango 2 (`W' = W - s·Q·Qᵀ·W`) sobre las proyecciones de salida de atención, con fuerza 2,5 dentro del núcleo del bucle y 4,0 fuera, usando únicamente el subespacio de rechazo de visitas tardías (visitas 24-47 de 48). La cuantización posterior de mostwanted002 aplica AWQ MXFP4 sobre 9.536 lineales (9.216 de expertos enrutados y 320 no-expertos: atención y router/gates), con calibración de 256 muestras de 1.024 tokens.

## Capacidades

- Generación de texto y razonamiento multi-turno con el perfil del modelo base Inkling 2 Mini.
- Procesamiento de imágenes mediante la torre de visión, conservada en BF16 sin cuantizar.
- Decodificación especulativa gracias a la cabeza MTP nativa (`mtp.safetensors`).
- Razonamiento en modo thinking, según se desprende del arnés de evaluación del autor de la abliteración (thinking on/off).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Comportamiento sin rechazos: la abliteración reduce las negativas a peticiones dañinas de 100/100 a 9/100 en el arnés del cuantizador, con 7 de esas 9 respuestas siendo límites o respuestas de crisis en lugar de negativas planas.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar empíricamente el efecto de eliminar el subespacio de rechazo sobre el comportamiento, comparando directamente con el checkpoint nativo y con el de OpenUncensored, dado que solo 20 matrices difieren y el resto es byte-idéntico.
- Evaluación de cuantización extrema: sirve como caso de referencia para medir el impacto de MXFP4 con AWQ sobre un MoE con bucles, con perplejidad documentada (11,1705 frente a 11,2212 en BF16) y 9.536/9.536 lineales verificados tras la recarga.
- Despliegue con restricciones de memoria: con ~15,4 GiB frente a los 53,5 GiB en BF16, cabe en GPUs de 24 GB (RTX 4090, A10G, L4) y permite ejecutar un MoE de 26,4B en hardware de gama alta de consumo, siempre que el runtime soporte las lineales Quark.
- Procesamiento multimodal en entornos AMD: la cuantización se verificó en ROCm 10.2 sobre MI300X, por lo que es una opción para pipelines de visión-lenguaje en aceleradores AMD Instinct.
- Generación de contenido sin filtrado en entornos de investigación controlados: útil para estudiar respuestas del modelo a prompts sensibles, con la advertencia explícita de que la ausencia de rechazos implica riesgo de contenido dañino.
- Decodificación especulativa de bajo coste: la cabeza MTP sin cuantizar permite acelerar la generación en despliegues que implementen decodificación especulativa, sin penalización por la cuantización del cuerpo del modelo.

## Benchmarks y rendimiento

| Métrica | Modelo nativo | Este modelo (cuantizado) | Fuente |
|---|---|---|---|
| Perplejidad (conjunto de calibración) | 11,2212 (BF16) | 11,1705 (MXFP4 AWQ) | mostwanted002 |
| Rechazos greedy (100 prompts dañinos) | 100/100 | 9/100 | mostwanted002 |
| Rechazos muestreados T=0,7 | 100/100 (23 degenerados) | 9/100 (46 keywords − 37 degenerados) | mostwanted002 |
| Longitud media de respuesta | 146,1 palabras | 143,9 palabras | mostwanted002 |
| MMLU (arnés de OpenUncensored) | 78,95 | 79,47 | model card de OpenUncensored |
| Rechazos en arnés de OpenUncensored (80 prompts) | 68/80 | 8/80 | model card de OpenUncensored |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) medidos sobre este checkpoint cuantizado en la información disponible, salvo la cifra de MMLU heredada del arnés de OpenUncensored.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,4 GiB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para margen operativo.
- GPU recomendadas: MI300X (verificada por el autor con ROCm 10.2), A100 40/80 GB, H100, y GPUs de 24 GB como RTX 4090, L4 o A10G.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB), siempre que el runtime soporte las lineales Quark.
- Opciones de despliegue: transformers ≥5.24.0 con `amd-quark` para las lineales cuantizadas, en ROCm o CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini abliterated Quark AWQ MXFP4) | 26,4B totales / 3,4B activos | no disponible | MXFP4 AWQ, ~15,4 GiB | no disponible (base Apache-2.0) | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | no disponible | BF16, ~53,5 GiB | Apache-2.0 | Hugging Face |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,4B totales / 3,4B activos | no disponible | NVFP4 expertos + MXFP8, ~20 GB | no disponible | Hugging Face |
| mostwanted002/Inkling-2-Mini-abliterated-bf16 | 26,4B totales / 3,4B activos | no disponible | BF16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- La abliteración elimina deliberadamente el comportamiento de rechazo: el modelo responde a peticiones dañinas en 91 de cada 100 casos, lo que lo hace inadecuado para despliegues orientados al público sin capas de seguridad externas.
- Riesgo elevado de contenido dañino, sesgado o inexacto; no se han publicado evaluaciones de sesgo ni de seguridad sobre este checkpoint.
- La licencia del repositorio no está declarada; aunque el modelo base se declara Apache-2.0, la condición legal de los derivados abliterados y cuantizados no está documentada, por lo que el uso comercial queda en un limbo jurídico.
- El soporte de runtime es limitado: requiere transformers ≥5.24.0 y `amd-quark`; no hay evidencia de compatibilidad con vLLM, llama.cpp u Ollama, lo que restringe las opciones de producción.
- El modelo tiene 0 descargas y 0 likes, y se publicó en un único día (creado y actualizado el 2026-11-23); no hay validación independiente de las cifras declaradas por el autor.
- La perplejidad se midió sobre el mismo conjunto de calibración usado en la cuantización, lo que puede favorecer artificialmente al checkpoint cuantizado; no se reportan evaluaciones en conjuntos held-out.
- No se dispone de información sobre longitud de contexto, idiomas soportados ni calidad multilingüe, lo que impide garantizar su comportamiento fuera del inglés.
- La torre de visión permanece en BF16, por lo que el consumo de memoria en tareas multimodales será superior al de solo texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mostwanted002/Inkling-2-Mini-abliterated-Quark-AWQ-MXFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint abliterado de OpenUncensored: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Repositorio del estudio de abliteración: https://huggingface.co/mostwanted002/Inkling-2-Mini-abliterated-bf16
- Write-up de OpenUncensored: https://openuncensored.com
- Herramienta de cuantización Quark: https://github.com/amd/quark
