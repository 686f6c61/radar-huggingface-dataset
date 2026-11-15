# san-digital/Qwen3.8-Flash-Next-DFlash2

## Resumen

Qwen3.8-Flash-Next-DFlash2 es un *drafter* de decodificación especulativa (speculative decoding) para el modelo objetivo Qwen/Qwen3.8-Flash-Next. No es un modelo generativo autónomo, sino un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica después. Lo publica el usuario san-digital como un *fine-tune* del checkpoint incoai/Qwen3.8-Flash-Next-DFlash2, y está calibrado específicamente para cargas de trabajo multilingües (japonés y CJK), trazas de razonamiento `<think>` y código.

El artefacto implementa la arquitectura DFlash2DraftModel de 5 capas, no causal y con ventana deslizante, junto con un selector de candidatos pairwise de rango 256 y top-16. El checkpoint completo ocupa 1,12 GiB en disco en BF16 (81 tensores), y se reduce a 788 MB al cargarse cuantizado. Su propósito es acelerar la inferencia del modelo objetivo en Macs con Apple Silicon mediante el runtime Tokspur, sin alterar la distribución de salida del modelo verificado.

La relevancia actual reside en que la decodificación especulativa es una de las vías más eficaces para reducir la latencia en inferencia local, y este drafter reporta mejoras de aceptación de entre el 7,5 % y el 10,4 % frente al checkpoint upstream, con incrementos de throughput de hasta el 148,54 tok/s en cargas de código Rust sobre un M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel: 5 capas no causales con ventana deslizante, selector pairwise de rango 256 y top-16 |
| Parametros totales | no disponible (81 tensores BF16, 1,12 GiB en disco) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante; taps en capas 5, 15, 25, 35 y 45 del modelo objetivo) |
| Tipos de cuantizacion | BF16 en origen; cuantizado a 788 MB al cargar (esquema de cuantización no detallado) |
| Idiomas soportados | multilingüe, con calibración específica para japonés y CJK; vocabulario reunido cjk64k de 65.536 filas (ASCII/inglés/código, hiragana, katakana, ideogramas CJK, puntuación CJK y tokens de control Qwen) |
| Licencia | Qwen Community License 1.0 (componentes derivados de Qwen) y Apache 2.0 (componentes de incoai) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El drafter sigue el esquema DFlash2DraftModel: cinco capas no causales con atención de ventana deslizante que capturan estados ocultos del modelo objetivo en las capas 5, 15, 25, 35 y 45, y proponen bloques de hasta 8 tokens candidatos. Incorpora un selector de candidatos pairwise de rango 256 con top-16 y proyecciones semánticas delta de rango 256 sobre los embeddings de entrada y salida del modelo objetivo, congelados. Todo ello se pliega en el esquema estándar de 81 tensores BF16 sin sobrecoste en tiempo de ejecución.

El entrenamiento parte del checkpoint warm-start incoai/Qwen3.8-Flash-Next-DFlash2 y se calibra con auto-destilación sobre 2.013 conversaciones (aproximadamente 1,75 millones de tokens generados) que cubren revisión legal, contractual y regulatoria en japonés, análisis de sistemas e ingeniería en japonés, trazas de razonamiento `<think>`, respuestas directas sin modo thinking y código en inglés, Rust, Python, C++, TypeScript. La función de pérdida usa una cabeza de vocabulario reunido cjk64k de 65.536 filas. La verificación en Tokspur es matemáticamente sin pérdida: tanto el argmax greedy como el muestreo estocástico por rechazo siguen exactamente la ley del modelo objetivo, de modo que una mayor aceptación del drafter solo incrementa los tokens verificados por ronda sin alterar la calidad de la salida.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen/Qwen3.8-Flash-Next y sobre san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF.
- Soporte de modo `<think>`: el drafter está calibrado con trazas de razonamiento del modelo objetivo.
- Calibración multilingüe con cobertura explícita de japonés (hiragana, katakana, kanji) y puntuación CJK.
- Cobertura de código en inglés, Rust, Python, C++ y TypeScript.
- Verificación sin pérdida en el runtime Tokspur (greedy y muestreo estocástico por rechazo).
- Configuración de vocabulario reunido cjk64k para cargas CJK y por defecto de 32k contiguo para cargas ASCII/inglés/código.
- Integración con caché de prefijo compartido y PLE residente en RAM en Tokspur.
- No es un modelo de chat ni de instrucciones: no genera respuestas de forma autónoma, solo propuestas de tokens.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: desplegado con `tokspur serve --drafter dflash2` sobre un M5 Max, eleva el throughput de 51,25 a 73,60-76,12 tok/s en cargas japonesas con modo thinking respecto al MTP de la versión 0.2.2.
- Revisión de contratos y documentación legal en japonés: en la carga Japanese Contract Redline (2.560 tokens, greedy) alcanza 68,18 tok/s frente a 57,36 tok/s del upstream, lo que reduce el tiempo de respuesta en flujos de revisión de cláusulas.
- Análisis de sistemas e ingeniería en japonés: la carga Japanese Direct Review sin `<think>` (1.536 tokens) llega a 72,37 tok/s, adecuada para asistentes técnicos interactivos con latencia baja.
- Generación de código en producción: en la carga Systems Rust con vocabulario reunido cjk64k y greedy alcanza 148,54 tok/s frente a 135,36 tok/s del upstream, útil para autocompletado y pipelines de CI/CD que necesiten generación rápida de parches.
- Razonamiento multi-paso con trazas `<think>`: la calibración específica sobre trazas de razonamiento mantiene la aceptación en modo thinking (63,95-66,30 tok/s con temperatura 0,6), lo que sirve para agentes que razonan antes de actuar.
- Despliegue con modelos cuantizados: compatible con el GGUF Q4_K de san-digital, lo que permite ejecutar el par objetivo-drafter en equipos con memoria unificada limitada.
- Servicio HTTP multilingüe: la combinación de caché de prefijo compartido y PLE en RAM permite atender sesiones concurrentes con contexto largo en Macs de gama alta.

## Benchmarks y rendimiento

Aceptación en rollout held-out (6.164 anclas, incluidas 2.531 anclas CJK):

| Checkpoint del drafter | Recall top_k | Aceptados medios (d=4) | Aceptados medios (d=7) | CJK aceptados (d=4) | CJK aceptados (d=7) |
|---|---:|---:|---:|---:|---:|
| Upstream incoai/Qwen3.8-Flash-Next-DFlash2 | 80,10 % | 1,8251 | 2,2688 | 1,4619 | 1,8708 |
| san-digital/Qwen3.8-Flash-Next-DFlash2 | 84,34 % | 1,9723 (+8,1 %) | 2,5050 (+10,4 %) | 1,5721 (+7,5 %) | 2,0316 (+8,6 %) |

Throughput HTTP en vivo sobre Apple M5 Max (GPU de 40 núcleos, 128 GB):

| Carga de trabajo | 0.2.2 MTP (d=2, vocabulario completo) | Upstream incoai DFlash2 (cjk64k + d7) | san-digital DFlash2 (cjk64k + d7) |
|---|---:|---:|---:|
| Japanese Cloud MSA (1.024 `<think>` + 768 prosa JP, greedy) | 51,25 tok/s | 60,35 tok/s | 73,60-76,12 tok/s (prosa JP: 74,5-77,5 tok/s) |
| Japanese Cloud MSA (1.024 `<think>` + 768 prosa JP, t=0,6) | 45,58 tok/s | 57,64 tok/s | 63,95-66,30 tok/s |
| Japanese Contract Redline (2.560 tokens, greedy) | 44,13 tok/s | 57,36 tok/s | 68,18 tok/s |
| Japanese Direct Review (sin `<think>`, 1.536 tokens) | 42,96 tok/s | 58,82 tok/s | 72,37 tok/s |
| Systems Rust (cjk64k, 65K vocab reunido, greedy) | 60,16 tok/s | 135,36 tok/s | 148,54 tok/s |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 1,12 GiB para el checkpoint BF16 en disco; 788 MB en memoria al cargar cuantizado.
- Memoria: debe sumarse a la del modelo objetivo Qwen3.8-Flash-Next. Los benchmarks se ejecutaron en un Apple M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con GPU de 40 núcleos (M5 Max) es la plataforma validada. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos de compatibilidad con GPUs de consumo NVIDIA; el runtime Tokspur está orientado a Metal y Apple Silicon.
- Despliegue: runtime Tokspur con `--drafter dflash2`, `--dflash2-vocab-gather cjk64k`, `--dflash2-max-drafts 7`, `--dflash2-lookup hybrid`, `--shared-prefix-cache` y `--ple-ram-resident`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 63,95-148,54 tok/s según carga en M5 Max (ver tabla de benchmarks).
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| san-digital/Qwen3.8-Flash-Next-DFlash2 | Drafter DFlash2 (5 capas) | 1,12 GiB BF16 / 788 MB cuantizado | no disponible | Qwen Community 1.0 + Apache 2.0 | Hugging Face |
| incoai/Qwen3.8-Flash-Next-DFlash2 | Drafter DFlash2 upstream | no disponible | no disponible | Apache 2.0 (componentes incoai) | Hugging Face |
| MTP 0.2.2 (full-vocab, d=2) | Drafter MTP | no disponible | no disponible | no disponible | Integrado en Tokspur |

El drafter san-digital supera al upstream incoai en recall top_k (84,34 % frente a 80,10 %) y en tokens aceptados medios (2,5050 frente a 2,2688 con d=7), y supera al MTP de la versión 0.2.2 en throughput en todas las cargas medidas (por ejemplo, 148,54 frente a 60,16 tok/s en Rust).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen/Qwen3.8-Flash-Next o el GGUF Q4_K de san-digital como modelo objetivo verificado.
- Dependencia del runtime Tokspur y de Apple Silicon (Metal); no hay evidencia de funcionamiento en otras plataformas.
- La calibración está sesgada hacia japonés, CJK, trazas `<think>` y código; el rendimiento en otros idiomas no está documentado.
- El checkpoint se publicó el 15 de noviembre de 2026 con 0 descargas y 0 likes: no hay validación independiente de terceros.
- La licencia combina Qwen Community License 1.0 y Apache 2.0; deben revisarse las secciones 1 y 2 de la licencia Qwen antes de un despliegue comercial.
- Los benchmarks de throughput provienen únicamente del autor y de una sola máquina (M5 Max de 128 GB); no son extrapolables a otro hardware.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad del drafter; al ser verificado por el modelo objetivo, la calidad de salida depende de este último.
- No se especifican los parámetros totales ni la longitud de contexto del drafter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-DFlash2
- Modelo base objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint upstream: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- GGUF Q4_K compatible: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF
- Revisión del modelo base (commit): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/34567a4712bc9766c4449e2e98e4468bfa24d915
- Revisión del checkpoint upstream (commit): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2/tree/a22a1744e85c17364dcc54a6a420af7135d4c7f6
