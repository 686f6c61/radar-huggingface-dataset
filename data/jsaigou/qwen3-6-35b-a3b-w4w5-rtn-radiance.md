# jsaigou/Qwen3.6-35B-A3B-W4W5-RTN-radiance

## Resumen

Qwen3.6-35B-A3B-W4W5-RTN-radiance es una cuantización de terceros del checkpoint oficial Qwen/Qwen3.6-35B-A3B, publicada por el usuario jsaigou. No se trata de un modelo nuevo ni de un fine-tune, sino de un contenedor en formato `.rad` para el motor de inferencia Radiance, orientado específicamente a hardware AMD Strix Halo (gfx1151, APU Ryzen AI MAX+ 395 con memoria unificada). El modelo base es un Mixture-of-Experts de Qwen con 35B parámetros totales y aproximadamente 3B activos por token, del que se conserva la licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta 4/5 bits (RTN, round-to-nearest, sin calibración) aplicada a los expertos enrutados, manteniendo el tronco denso en FP8 por bloques. Por otro, evidencia un ecosistema incipiente de motores de inferencia alternativos a llama.cpp y vLLM, optimizados para APUs AMD con memoria unificada, donde el formato de pesos está acoplado al motor y no es portable a transformers ni a GGUF.

El resultado es un fichero de 21,01 GiB (22,6 GB en el repo) que, según las mediciones del autor, decodifica a 63,7 tokens/s en la variante RTN con profundidad especulativa 2, frente a 58,6 tokens/s del contenedor FP8 publicado. El contexto máximo declarado es de 262.144 tokens con caché KV en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, basada en Qwen3.6-35B-A3B; incluye cabecera MTP (multi-token prediction) para decodificación especulativa |
| Parametros totales | 35B (modelo base) |
| Parametros activos | ~3B (modelo base, no verificado en la información disponible para esta cuantización) |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de ejecución) |
| Tipos de cuantizacion | Expertos enrutados: 4 bits (gate y up, `w4nl64a8h`) y 5 bits (down, `w5nl64a8h`), codebook rotado; tronco denso en FP8 por bloques; caché KV en FP8 |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.6-35B-A3B; el autor reporta evaluación en inglés y japonés para la variante GPTQ) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor Radiance); no compatible con transformers, GGUF ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts: 35B parámetros totales con aproximadamente 3B activos por token, lo que permite un coste de cómputo por token comparable a un modelo denso de 3B. Esta cuantización no modifica la arquitectura: preserva el enrutamiento de expertos y el tronco denso, y añade una cabecera MTP (multi-token prediction) derivada del contenedor FP8 publicado, que se usa como draft head para decodificación especulativa.

El proceso de cuantización es round-to-nearest (RTN) con búsqueda de escala, sin datos de calibración. Los expertos enrutados se almacenan a 4 bits (proyecciones gate y up) y 5 bits (proyección down) en un formato de codebook rotado (`w4nl64a8h` / `w5nl64a8h`), mientras que el tronco denso se mantiene en FP8 por bloques, idéntico al contenedor FP8 oficial. La elección de formatos sigue el mapa de Unsloth Dynamic Q4_K_XL (Q4_K para gate/up y Q5_K/Q6_K para down), mapeado a los formatos que el motor Radiance sirve con kernels rápidos en gfx1151. El fichero resultante (21,01 GiB) es ligeramente menor que el GGUF UD de Unsloth (21,65 GiB). No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO en esta ficha.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, sin evaluación específica publicada para esta cuantización.
- Decodificación especulativa mediante cabecera MTP integrada, con profundidad configurable (`--num-speculative-tokens 2` en el ejemplo del autor).
- Soporte de contexto largo: hasta 262.144 tokens con caché KV en FP8, con un consumo estimado de ~34 GiB para 4 secuencias de esa longitud.
- Multilingüismo: no documentado para esta variante; el autor reporta evaluación en inglés y japonés para la variante GPTQ (92,1% vs 92,2% de FP8 en un set inglés de 835 prompts; 83,7% vs 84,0% en un set japonés de 570 prompts).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en APUs AMD Strix Halo: el contenedor está optimizado para gfx1151 con memoria unificada de 128 GB, permitiendo ejecutar un MoE de 35B en un equipo de sobremesa o portátil de gama alta sin GPU discreta. Es el caso de uso principal y el único validado por el autor.
- Servicio multi-usuario ligero: con `--max-num-seqs 4` y caché KV en FP8, el autor reporta 171 tokens/s agregados con tres streams concurrentes (frente a 69 tokens/s de llama.cpp en la misma máquina), adecuado para un pequeño equipo de desarrollo o un servicio interno de baja concurrencia.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite analizar contratos, informes o bases de código extensas en una sola pasada, con un prefill de 38K tokens en 13,5 s según las mediciones del autor.
- Generación de código asistida en local: la variante RTN alcanza ~78 tokens/s en decodificación de código (medido en la variante GPTQ con el mismo formato y kernels), suficiente para autocompletado interactivo en un IDE sin depender de la nube.
- Investigación en cuantización: el contenedor sirve como referencia reproducible para estudiar el impacto de RTN frente a GPTQ en expertos enrutados, con métricas de divergencia KL (0,0630 de media, 0,0104 de mediana), ratio de perplejidad (1,0163) y acuerdo top-1 (90,72%) frente al contenedor FP8 sobre 1.575.352 posiciones de texto.
- Evaluación de motores de inferencia alternativos: permite comparar el rendimiento de Radiance frente a llama.cpp con GGUF UD de Unsloth en el mismo hardware, con diferencias de decodificación de un 3-8% en single-stream y de más del doble en agregado concurrente.
- Prototipado de agentes con contexto largo: la combinación de ventana de 262K, decodificación especulativa y bajo consumo de memoria permite experimentar con pipelines de agentes multi-paso en hardware de consumo profesional.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| Divergencia KL media vs FP8 | 0,0630 | Sobre 1.575.352 posiciones de texto |
| Divergencia KL mediana vs FP8 | 0,0104 | Sobre 1.575.352 posiciones de texto |
| Ratio de perplejidad vs FP8 | 1,0163 | Sobre 1.575.352 posiciones de texto |
| Acuerdo top-1 vs FP8 | 90,72% | Sobre 1.575.352 posiciones de texto |
| Precision en set ingles (variante GPTQ) | 92,1% (FP8: 92,2%) | 835 prompts |
| Precision en set japones (variante GPTQ) | 83,7% (FP8: 84,0%) | 570 prompts |
| Decodificacion RTN, profundidad 2 | 63,7 tokens/s | Ryzen AI MAX+ 395, gfx1151 |
| Decodificacion FP8, profundidad 2 | 58,6 tokens/s | Misma maquina |
| Decodificacion GPTQ, single-stream | 76 (prosa) - 78 (codigo) tokens/s | Profundidad 2, via router |
| Prefill de prompt de 38K tokens | 13,5 s | GPTQ; llama.cpp con UD GGUF: 29,6 s |
| Throughput agregado, 3 streams | 171 tokens/s | GPTQ; llama.cpp: 69 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas de precisión por tarea corresponden a la variante GPTQ, no a la RTN, y el autor indica explícitamente que la precisión por tarea de la variante RTN no fue medida.

## Requisitos de hardware

- VRAM/memoria estimada: ~21 GiB para los pesos; ~34 GiB adicionales para 4 secuencias de hasta 262.144 tokens con caché KV en FP8 (memoria unificada en APU).
- GPU recomendada: AMD Ryzen AI MAX+ 395 con gfx1151 y 128 GB de memoria unificada; es el único hardware validado por el autor.
- GPU de consumo: no se documenta compatibilidad con GPUs discretas NVIDIA o AMD convencionales; el motor Radiance fork está compilado específicamente para gfx1151.
- Opciones de despliegue: exclusivamente el fork de Radiance `https://github.com/jsaigou/radiance`, tag `strix-halo-r2` (commit `a16657e`) o posterior en la misma línea, con ROCm 10.1. No funciona en vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: 63,7 tokens/s en decodificación single-stream (RTN, profundidad 2); prefill de 38K tokens en 13,5 s; 171 tokens/s agregados con 3 streams concurrentes (medido en GPTQ).
- Comando de referencia del autor: `RADIANCE_HOME=<build>/radiance_home RADIANCE_KERNELS=libhalo radiance --model qwen3.6-35b-a3b-w4w5-rtn.rad --tp 1 --max-model-len 262144 --max-num-seqs 4 --num-speculative-tokens 2 --kv-cache-dtype fp8`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-W4W5-RTN-radiance (este) | 35B (MoE, ~3B activos) | 262.144 | `.rad` | Apache 2.0 | AMD gfx1151 | RTN sin calibración; 21,01 GiB; requiere fork de Radiance |
| Qwen3.6-35B-A3B (FP8 oficial) | 35B (MoE, ~3B activos) | No disponible | Contenedor FP8 | Apache 2.0 | AMD gfx1151 (via Radiance) | Referencia de calidad; ~9% más lento en decodificación según el autor |
| Qwen3.6-35B-A3B-W4W5-GPTQ-radiance (variante del mismo autor) | 35B (MoE, ~3B activos) | 262.144 | `.rad` | Apache 2.0 | AMD gfx1151 | Calibrado; más cercano a FP8 en todas las métricas medidas |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF (UD Q4_K_XL) | 35B (MoE, ~3B activos) | No disponible | GGUF | Apache 2.0 | Multiplataforma (llama.cpp) | 21,65 GiB; portable; 29,6 s de prefill en 38K y 69 tokens/s agregados en 3 streams en la misma máquina |

## Limitaciones y advertencias

- Formato no portable: el contenedor `.rad` solo carga en el fork de Radiance indicado; no funciona en transformers, llama.cpp, Ollama, vLLM ni TGI. La versión upstream de Radiance 2.x tampoco lo sirve porque sustituyó los formatos que utiliza.
- Cuantización sin calibrar: la variante RTN no usa datos de calibración, por lo que su fidelidad respecto a FP8 es inferior a la de la variante GPTQ (KL media 0,0630 y acuerdo top-1 del 90,72%). El autor no midió precisión por tarea en esta variante.
- Hardware muy restringido: validado únicamente en AMD gfx1151 (Ryzen AI MAX+ 395) con ROCm 10.1. No hay evidencia de funcionamiento en otras GPUs.
- Soporte de un solo desarrollador: el fork es no oficial, sin garantía y con mantenimiento incierto; el propio autor declara "no warranty; use at your own risk".
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base Qwen3.6-35B-A3B, no documentados en esta ficha.
- Idiomas: no se especifican los idiomas soportados para esta variante; las únicas evaluaciones reportadas son en inglés y japonés, y sobre la variante GPTQ.
- Licencia: Apache 2.0, igual que el modelo base, lo que permite uso comercial; sin embargo, la licencia del motor Radiance (Apache 2.0 según el autor) y la del fork deben verificarse por separado antes de un despliegue en producción.
- Fecha de creación futura (2026-11-17) y ausencia de descargas o likes: el artefacto es muy reciente y no cuenta con validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsaigou/Qwen3.6-35B-A3B-W4W5-RTN-radiance
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Fork de Radiance necesario: https://github.com/jsaigou/radiance (tag `strix-halo-r2`, commit `a16657e`)
- Documentación de formatos del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/RAD-FILES.md
- Documentación de kernels del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/FORK-KERNELS.md
- Proyecto Radiance original: https://codeberg.org/StillDeadcode/radiance
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
