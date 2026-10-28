# loom-fun/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom

## Resumen

Este repositorio no contiene un modelo de pesos, sino un paquete de despliegue para **Loom** (`.loom` + `model.json`) que sirve el checkpoint GGUF `Q4_K_M` de `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB`. Lo publica el usuario `loom-fun`, generado con el flujo `loom-skills` sobre una máquina AMD Ryzen AI Max+ 395 «Strix Halo», y está pensado para ejecutar el modelo en la GPU integrada (gfx1151) mediante el runtime `loom-serve` del SDK `hrx-loom 0.1.0`.

El interés técnico del paquete está en el informe de port que lo acompaña: describe la implementación de la arquitectura declarada (`gemma4`, variante E4B) sobre un motor que solo soportaba `head_dim` 128, e incluye una comparativa medida frente a llama.cpp ROCm b1356 con el mismo GGUF y las mismas cargas de trabajo. Los pesos no se distribuyen en el repo (tamaño 0,0 GB, 0 descargas), por lo que hay que descargarlos por separado desde el repositorio del modelo base.

En términos de rendimiento medido, el port alcanza 58,9 tok/s de decodificación en prompt corto (+11 % frente a llama.cpp) y 2481 tok/s de prefill con documento de 1k tokens (+37 %), con contexto configurado de 40960 tokens y una verificación de corrección superada (26 prompts, divergencia máxima de log-prob 0,271). No hay datos publicados de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia declarada `gemma4` (variante E4B): 42 capas, hidden 2560, 8 cabezas de consulta / 2 de KV, GELU-tanh FFN, per-layer embeddings (PLE), KV sharing |
| Parametros totales | No disponible (el checkpoint `Q4_K_M` ocupa 5,8 GB) |
| Parametros activos | No aplica: la descripción del port corresponde a un modelo denso, no MoE |
| Longitud de contexto | 40960 tokens en el preset del paquete (`pool` de 65536 posiciones, KV de 3,5 GiB); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Pesos `Q4_K_M` (capas Q4_K/Q6_K, embeddings Q8_0, proyección per-layer en BF16); KV en F16 paginado en planos de 1 KiB |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada del modelo base NVIDIA; términos concretos no disponibles) |
| Formato de pesos | GGUF (no incluido en el repo) + paquete Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento

La arquitectura descrita en el informe de port es un transformer decoder-only de 42 capas con dimensión oculta 2560, 8 cabezas de consulta y 2 de KV, y atención con `head_dim` 256 en capas deslizantes y 512 en capas globales. Las capas 24–41 no tienen KV propia: reutilizan la de las capas 22 (deslizante) y 23 (global). Incorpora per-layer embeddings con proyección BF16, FFN con GELU-tanh, `qk-norm`, RoPE proporcional en las capas globales (solo rotan los 64 pares con `rope_freqs` finito), RMSNorm sin pesos sobre V y escala de atención 1.0. El tokenizador declarado es `google/gemma-4-E4B-it`.

No hay información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF/DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) más allá de las particularidades arquitectónicas citadas. La plantilla de chat usada es la de Gemma 4 en modo no-thinking (`<bos><|turn>user…<turn|>\n<|turn>model\n`), con `<turn|>` y `<eos>` como tokens de parada; el modelo no expone modo de razonamiento según el propio port (la interfaz `text_chat_reasoning_v1` devuelve 0,0,0 para modelos no razonadores).

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat Gemma 4 (modo no-thinking).
- Contexto efectivo de hasta 40960 tokens en el preset publicado, con soporte medido hasta 35k tokens en prefill.
- Procesamiento de documentos largos: el informe valida 1k, 2k, 8k, 16k y 32k tokens de entrada.
- Servicio concurrente: 4 streams simultáneos verificados con salida idéntica a la secuencial (`consistency.py` PASS).
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible; el paquete no implementa modo thinking.
- Capacidades multilingües: no disponibles (idiomas no documentados).
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU integrada: el modelo corre sobre un Ryzen AI Max+ 395 con 128 GB de memoria unificada, sin GPU discreta, a 58,9 tok/s de decodificación, suficiente para chat interactivo.
- Resumen y análisis de documentos largos: con 40960 tokens de contexto y 1699 tok/s de prefill sobre 35k tokens, un documento de ~30k tokens se procesa en aproximadamente 20 segundos antes de empezar a generar.
- Procesamiento por lotes en local para clasificación, extracción o reescritura de textos: 2306 tok/s de prefill a 8k tokens permite encadenar muchos documentos por hora en un solo equipo.
- Servicio multiinquilino ligero en el borde: 161,7 tok/s agregados con 4 streams concurrentes y salida determinista respecto al modo secuencial, adecuado para prototipos de API interna en `127.0.0.1:8080`.
- Base para evaluación comparativa de runtimes: el paquete incluye metodología reproducible (prompts con nonce, medianas de 5 ejecuciones, goldens frente a llama.cpp) útil para medir otros motores sobre el mismo GGUF.
- Desarrollo y depuración de kernels de atención con `head_dim` 256/512 y KV sharing: el código del generador (`work/kit/gen_g4.py`) sirve como referencia para portar arquitecturas tipo Gemma 4 a otros motores.
- Despliegue offline en entornos sin conectividad: al ser pesos GGUF locales y un runtime sin dependencias de servicio externo, encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia sobre Strix Halo (Ryzen AI Max+ 395, gfx1151), con el mismo GGUF `Q4_K_M` y las mismas cargas:

| Métrica | llama.cpp ROCm b1356 | Loom | Margen |
|---|---|---|---|
| Decode tok/s (prompt corto, 300 tok) | 52,9 | 58,9 | +11 % |
| Decode tok/s @1k contexto | 51,0 | 57,0 | +12 % |
| Decode tok/s @2k contexto | 50,2 | 56,5 | +12 % |
| Decode tok/s @32k contexto | 39,9 | 45,7 | +15 % |
| Prefill tok/s, documento 1k | 1814 | 2481 | +37 % |
| Prefill tok/s, documento 2k | 1789 | 2464 | +38 % |
| Prefill tok/s, documento 8k | 1799 | 2306 | +28 % |
| Prefill tok/s, documento 16k | 1533 | 2081 | +36 % |
| Prefill tok/s, documento 32k (35k tokens) | 1257 | 1699 | +35 % |
| 4 streams, agregado sostenido tok/s | 157,3 | 161,7 | +3 % |

Techo roofline calculado por el autor: 68,1 tok/s en decode y ~7,1k tok/s en prefill; el port alcanza el 86 % del techo en decode (300 tok) y el 35 % en prefill de 1k. Tráfico de pesos por token decodificado: 3,17 GB (cabeza 0,71 GB, FFN 2,0 GB, atención 0,37 GB, PLE contada como una fila por token).

Verificación de corrección: 26 prompts (20 cortos, 6 largos de hasta 17,3k tokens); 12 coinciden exactamente con los goldens de llama.cpp y el resto son casi-empates (hueco máximo de log-prob 0,271, token siempre dentro del top-5 del golden); `consistency.py` PASS y `audit.py` con 0 fallos.

## Requisitos de hardware

- VRAM/memoria: el preset se sirve con `--memory_bytes=14000000000` (14 GB). Pesos `Q4_K_M` de 5,8 GB más 3,5 GiB de KV para 40960 tokens; el tráfico por token decodificado es de 3,17 GB.
- Hardware de referencia: AMD Ryzen AI Max+ 395 «Strix Halo», iGPU gfx1151, 128 GB de memoria unificada. No hay mediciones en GPUs discretas.
- GPU consumer: por volumen de pesos y KV (≈9,3 GB antes de buffers y activaciones), es razonable esperar que quepa en GPUs de 12–16 GB de VRAM; esta estimación es derivada de los datos del port, no medida.
- GPU de datacenter (A100, H100): no hay datos publicados de rendimiento en estas tarjetas para este paquete.
- Despliegue: `loom-serve` con `--device=amdgpu` (SDK `hrx-loom 0.1.0`, revisión `ROCm/hrx-system dd5ad00f`). Como alternativa, llama.cpp ROCm b1356 es el único build de los 7 probados capaz de cargar la arquitectura `gemma4` en esa máquina.
- Latencia y throughput: TTFT estimado de ~0,4 s para un prompt de 1k tokens a partir de los 2481 tok/s de prefill; 57 tok/s de decodificación a 1k de contexto y 45,7 tok/s a 32k. Agregado de 161,7 tok/s con 4 streams.

## Comparativa con modelos similares

No hay información sobre modelos comparables de la misma familia o tamaño en la documentación disponible. La única comparación con datos es de runtime, no de modelo:

| Criterio | Loom (`hrx-loom 0.1.0`) | llama.cpp ROCm b1356 |
|---|---|---|
| Modelo | Nemotron-3.5-Bolt-E4B Q4_K_M | Nemotron-3.5-Bolt-E4B Q4_K_M |
| Decode (prompt corto) | 58,9 tok/s | 52,9 tok/s |
| Prefill 1k | 2481 tok/s | 1814 tok/s |
| Contexto servido | 40960 tokens | No especificado en el informe |
| Soporte de la arquitectura `gemma4` | Implementación propia del port | Solo el build b1356 (los otros 6 builds probados fallan al cargar `gemma4`) |
| Licencia | `other` (heredada del base) | Licencia de llama.cpp (no evaluada aquí) |

Comparación con otros modelos de parámetros y contexto similares: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB): es un paquete de despliegue; sin descargar el GGUF desde `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` no es funcional.
- Port de terceros (`loom-fun`), no oficial de NVIDIA ni de AMD; no hay revisión independiente ni resultados de terceros (0 descargas, 0 likes).
- Discrepancia a verificar: el nombre del modelo remite a la familia Nemotron, pero la arquitectura declarada es `gemma4` y el tokenizador es `google/gemma-4-E4B-it`; conviene confirmar la identidad real del checkpoint antes de usarlo en producción.
- Licencia `other`: los términos concretos no están disponibles en la información; es obligatorio revisar la licencia del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir calidad en castellano ni en otros idiomas distintos del inglés.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgo; el riesgo de alucinación no está caracterizado.
- Solo plantilla no-thinking: no hay modo de razonamiento extendido ni soporte documentado de tool calling o agentes.
- La validación de corrección es relativa a llama.cpp con el mismo GGUF, no a una referencia de mayor precisión (BF16); un near-tie de log-prob no garantiza equivalencia semántica en todas las entradas.
- El paquete está acoplado a una plataforma concreta (gfx1151 / Strix Halo) y a `hrx-loom 0.1.0` en la revisión `dd5ad00f`; otras GPUs AMD o versiones del SDK no están validadas.
- Los resultados se midieron con prompts que incluyen nonce (sin prefix caching) y con el cliente cronometrando la llegada de tokens, lo que puede diferir de las métricas internas del servidor.

## Enlaces

- Paquete Loom en HuggingFace: https://huggingface.co/loom-fun/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom
- Modelo base (GGUF `Q4_K_M`): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- SDK Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de generación loom-skills: https://github.com/loom-fun/loom-skills
- Tokenizador declarado: https://huggingface.co/google/gemma-4-E4B-it
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas corresponden a Loom, Inc. (software de grabación de vídeo), sin relación con este paquete.
