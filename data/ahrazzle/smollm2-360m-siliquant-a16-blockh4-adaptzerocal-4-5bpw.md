# ahrazzle/SmolLM2-360M-Siliquant-A16-BlockH4-AdaptZeroCal-4.5bpw

## Resumen

SmolLM2-360M-Siliquant-A16-BlockH4-AdaptZeroCal-4.5bpw es una version cuantizada del modelo SmolLM2-360M de Hugging Face, publicada por el usuario ahrazzle. No se trata de un modelo entrenado desde cero, sino de un checkpoint comprimido mediante una tecnica propia denominada Siliquant, que combina cuantizacion en redes de reticulos (lattice quantization) con codigos de Hamming extendidos `[16, 11, 4]` y transformadas de Hadamard por bloques. El resultado es un archivo de pesos de 292,91 MiB frente a los 690,12 MiB del modelo original en bfloat16, es decir, una reduccion de tamano de 2,36 veces.

El modelo base, SmolLM2-360M, es un transformer decoder-only de la familia SmolLM2 con 246.605.340 parametros reales segun el archivo safetensors. La cuantizacion afecta a 224 capas lineales (314.572.800 pesos), mientras que los embeddings, la cabeza de salida, las RMSNorm y los sesgos se conservan en bfloat16. El formato de pesos es propietario (`siliquant-hf-v1`) y requiere `trust_remote_code=True` para cargarse con transformers.

La relevancia de esta publicacion es fundamentalmente metodologica: demuestra que es posible comprimir un modelo pequeno con una perdida de calidad medible y acotada (perplejidad en wikitext2 de 17,18 frente a 16,39 en bf16, y coincidencia top-1 del 86,5 %) sin necesidad de compilaciones CUDA personalizadas para la inferencia basica. El checkpoint incluye ademas kernels de referencia en PTX y AVX-512 para decodificacion GEMV, lo que lo convierte en un banco de pruebas util para investigacion en cuantizacion extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), pesos lineales cuantizados con reticulos `A_16` + Hamming extendido + Block-Hadamard |
| Parametros totales | 246.605.340 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-360M) |
| Tipos de cuantizacion | Receta `A16_AdaptZeroCal_1bit`, grupo `g=32`, objetivo 4,5 bpw, 5,4037 bpw efectivos empaquetados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de HuggingFaceTB/SmolLM2-360M) |
| Formato de pesos | safetensors con formato propietario `siliquant-hf-v1` (bit-packed), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo no ha sido reentrenado: es una conversion del checkpoint SmolLM2-360M. La innovacion reside en el esquema de compresion. Cada vector de 16 pesos se representa como un punto del reticulo `A_16 = 2 Z^16 + C_{[16, 11, 4]}`, donde `C` es un codigo de Hamming extendido. Los 16 elementos se almacenan de forma sin perdida mediante tres componentes: `qham11` (11 bits de informacion sistematica por bloque, 0,6875 bpw, que reconstruyen algebraicamente los 5 bits de paridad en las posiciones {0, 1, 2, 4, 8}), `qquot` (cociente firmado empaquetado por capa con `k_bits` en {2, 3, 4} mas un CSR compacto para desbordamientos) y `scales_fp16_bits` / `colscale_fp32_bits` almacenados como patrones de bits IEEE-754 exactos.

La calibracion se realizo sin datos de texto: la receta `A16_AdaptZeroCal_1bit` usa unicamente IDs de token aleatorios uniformes (Track S68 / siliquant#91). El enrutamiento por capas combina 97 capas con `A16_BlockH4` y 127 con `A16_axis`, a 1 bit por capa. El autor certifica verificacion bit a bit exacta del round-trip de descompresion (diferencia maxima absoluta 0,0e+00) y cero errores de sindrome en 19.660.800 bloques. El desarrollo se realizo sobre el repositorio Moissanite-Labs/siliquant (PRs #83, #85, #91, #93 y #95).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base SmolLM2-360M.
- Razonamiento basico y respuesta a instrucciones en la medida en que lo permite un modelo de 360M parametros.
- Generacion de codigo y matematicas simples, con las limitaciones propias del tamano del modelo base.
- Carga directa con `transformers` usando `AutoModelForCausalLM` y `trust_remote_code=True`, sin compilaciones C++/CUDA.
- Exportacion a pesos densos bfloat16 mediante el CLI incluido (`siliquant_dequant.py unpack`).
- Verificacion de integridad de los pesos mediante hashes SHA-256 (`siliquant_verification_receipt.json`).
- Kernels de referencia para decodificacion GEMV: PTX `sm_86` con `dp4a.s32.s32` y AVX-512 con `vpermb`, `vpopcntq` y `vpdpbusd`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en cuantizacion extrema: el checkpoint sirve como caso de estudio reproducible para evaluar tecnicas de lattice quantization con codigos de Hamming, comparando las metricas de KL y perplejidad publicadas contra otras recetas.
- Despliegue en entornos con memoria muy limitada: con 292,91 MiB de pesos, el modelo cabe en dispositivos embebidos, Raspberry Pi o contenedores con restricciones severas de RAM, a costa de una perdida de calidad medible.
- Generacion de texto en CPU sin GPU: el kernel AVX-512 de referencia permite decodificar GEMV en procesadores Intel modernos, util para prototipos offline o entornos air-gapped.
- Pruebas de pipelines de CI/CD: el script `siliquant_dequant.py verify` valida la integridad bit a bit de los pesos, lo que permite integrar comprobaciones de regresion en pipelines de publicacion de modelos.
- Educacion y docencia: el formato documenta explicitamente la matematica del reticulo `A_16`, los bits de paridad y el empaquetado CSR, lo que lo hace util para explicar cuantizacion a nivel de bit.
- Benchmarking de motores de inferencia: al exportarse a bfloat16 denso, el modelo puede usarse como referencia para comparar el rendimiento de kernels cuantizados frente a densos en el mismo hardware.
- Prototipado de asistentes de texto de baja latencia en local, aceptando la merma de calidad respecto al modelo original.

## Benchmarks y rendimiento

| Corpus / metrica | bf16 (referencia) | Cuantizado | Delta |
|---|---|---|---|
| Perplejidad wikitext2 | 16,394834 | 17,178503 | +0,78 |
| Perplejidad cpython | 5,044993 | 5,316584 | +0,27 |
| KL medio wikitext2 | no disponible | 0,061608 | -5,47 % vs `A16_axis`; -13,98 % vs `E8_H8` |
| KL medio cpython | no disponible | 0,052364 | -7,69 % vs `A16_axis`; -7,80 % vs `E8_H8` |
| Coincidencia top-1 wikitext2 | no disponible | 86,4971 % | — |
| Coincidencia top-1 cpython | no disponible | 90,0685 % | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los pesos (292,91 MiB de checkpoint mas overhead de activaciones y cache KV), por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el kernel de referencia esta escrito para Ampere `sm_86` (RTX 30xx, A10, A40), aunque la carga con transformers funciona en CPU y en otras arquitecturas.
- Cabe en GPU consumer: si, en practicamente todas las RTX y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via principal); exportacion a bfloat16 denso mediante `siliquant_dequant.py unpack` para su uso en vLLM, llama.cpp, Ollama o TGI, aunque estos motores no soportan el formato `siliquant-hf-v1` de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M (original) | 361,8M aprox. | no disponible | Apache 2.0 | safetensors bf16 | Referencia de calidad; 690,12 MiB |
| SmolLM2-360M-Siliquant (este) | 246,6M reales en safetensors | no disponible | Apache 2.0 | `siliquant-hf-v1` | 292,91 MiB; perplejidad wikitext2 17,18 |
| Otros checkpoints cuantizados de SmolLM2-360M (GPTQ, AWQ, GGUF) | mismo orden | no disponible | Apache 2.0 | GGUF, safetensors | No comparados en la informacion disponible |

No se dispone de datos de benchmarks comparativos con alternativas de cuantizacion en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad: la perplejidad en wikitext2 sube de 16,39 a 17,18 y la coincidencia top-1 baja al 86,5 %, lo que puede degradar tareas sensibles.
- El modelo base tiene solo 360M parametros, con las limitaciones de razonamiento, conocimiento factual y multilingueismo propias de ese tamano.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- El formato `siliquant-hf-v1` es propietario y requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de usar en produccion.
- La calibracion se hizo sin datos de texto (solo IDs aleatorios), lo que puede no ser optimo para dominios especificos.
- Los motores de inferencia habituales (vLLM, llama.cpp, TGI) no soportan el formato nativo; es necesario exportar a bfloat16 denso, lo que elimina la ventaja de compresion.
- No se documentan idiomas soportados ni longitud de contexto en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base SmolLM2-360M.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/SmolLM2-360M-Siliquant-A16-BlockH4-AdaptZeroCal-4.5bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Licencia upstream: https://huggingface.co/HuggingFaceTB/SmolLM2-360M/blob/main/LICENSE
- Repositorio de investigacion: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
