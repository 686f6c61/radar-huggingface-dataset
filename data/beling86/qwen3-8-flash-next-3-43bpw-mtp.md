# Beling86/Qwen3.8-Flash-Next-3.43BPW-MTP

## Resumen

Qwen3.8-Flash-Next-3.43BPW-MTP es una cuantizacion de precision mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Beling86 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint comprimido con AutoRound (SignRound) orientado especificamente al motor de inferencia vLLM. El objetivo es reducir el peso del backbone no-PLE a 50,219 GiB con una media de 3,4256 bits por peso, manteniendo la tabla de embeddings por capa (PLE) oficial de Qwen en FP8 E4M3 con su escala global.

El modelo base es una arquitectura MoE con atencion lineal GDN (Gated DeltaNet) y atencion QSA, e incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion aplica W3A16 con grupo 128 simetrico a los expertos enrutados de 48 capas, W4A16/W8A16 a los modulos de atencion lineal y W8A16 a la atencion QSA y a los expertos compartidos, mientras que gates, embeddings, LM head y normas permanecen en BF16.

Su relevancia radica en que permite servir un modelo de gran tamano en vLLM con un footprint de memoria notablemente reducido y una fidelidad medida frente al profesor BF16 (KL medio de 0,11355 sobre 24.552 posiciones, con un 91,13% de acuerdo top-1). Es un artefacto de despliegue, no un modelo de proposito general nuevo, y su utilidad depende de aplicar el parche de vLLM incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion lineal GDN, atencion QSA y cabeza MTP; transformer con embeddings por capa (PLE) |
| Parametros totales | no disponible (el repo ocupa 106,2 GB; el backbone no-PLE pesa 50,219 GiB y la PLE ~47,7 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16 g128 sim, W4A16 g64 sim, W8A16 g128 sim, FP8 E4M3 (PLE), BF16 (gates, normas, embeddings, LM head) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina capas MoE con expertos enrutados y expertos compartidos, atencion lineal GDN (con proyecciones `in_proj_qkv/z`, `in_proj_a/b` y `out_proj`) y atencion QSA con un `indexer.index_qk_proj`. Incorpora ademas una tabla de embeddings por capa (PLE) de 51,2 B de parametros en FP8 oficial de Qwen, que vLLM descarga a memoria de host. La cabeza MTP (`mtp.layers.0`) actua como modulo de decodificacion especulativa.

El proceso de cuantizacion se realizo con AutoRound 0.16.1 (SignRound), 400 iteraciones por bloque y 512 muestras de calibracion de 2.048 tokens cada una (`calib_qwen_v3_512x2048.jsonl`, plantilla ChatML de Qwen, best-MSE=False). El layout de precision asigna W3A16 g128 simetrico a los expertos enrutados de las 48 capas restantes, W4A16 g64 a la atencion lineal GDN (con `out_proj` en W8A16 g128), W8A16 g128 a QSA y a los expertos compartidos, y BF16 a gates, hyper-connections, proyecciones PLE, embeddings, LM head y normas. La cabeza MTP usa W3A16 para expertos y W8A16 para `self_attn` y `fc_*`.

## Capacidades

- Generacion de texto conversacional y continuacion de prosa, con fidelidad medida frente al profesor BF16 en dominios de chat, codigo, matematicas y prosa.
- Razonamiento y matematicas: el checkpoint conserva el comportamiento del modelo base, con PPL de 2,369 en el conjunto de matematicas tras la cuantizacion.
- Generacion de codigo: acuerdo top-1 del 95,60% y PPL de 1,815 en el dominio de codigo.
- Decodificacion especulativa mediante la cabeza MTP incluida, que anade 1,03 GiB al checkpoint.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada (depende de las capacidades del modelo base).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en produccion con vLLM: el checkpoint esta disenado para `vllm serve` con `--trust-remote-code --dtype bfloat16` y configuracion de offload de PLE a CPU (`cpu_offload: true`, `use_thp: true`), lo que permite servir el modelo en nodos con memoria de host suficiente.
- Generacion de codigo asistida: con un 95,60% de acuerdo top-1 en el dominio de codigo, es adecuado para autocompletado y generacion en pipelines de desarrollo donde se requiera baja latencia y footprint reducido.
- Razonamiento matematico: util en asistentes de resolucion de problemas y tutoria automatica, con PPL de 2,369 en el conjunto de matematicas.
- Chat conversacional multi-turno: el dominio de chat muestra un KL medio de 0,09287 y una PPL de 7,635, adecuado para atencion al cliente y asistentes internos.
- Generacion de prosa y redaccion: con KL medio de 0,22733 en prosa, sirve para tareas de redaccion donde la fidelidad exacta al BF16 no sea critica.
- Investigacion sobre cuantizacion: el repositorio documenta gates de validacion (cobertura, layout empaquetado, consistencia de grupos fusionados, recarga estricta) y sirve como referencia para estudiar el impacto de la precision mixta en modelos MoE.
- Evaluacion comparativa de decodificacion especulativa: la cabeza MTP empaquetada permite medir el impacto del speculative decoding en throughput dentro de vLLM.

## Benchmarks y rendimiento

Fidelidad frente al profesor BF16 (KL sobre vocabulario completo, 24 x 1.024 tokens, PLE activa en ambos):

| Dominio | Posiciones | KL medio | KL mediana | KL P99 | Acuerdo top-1 | PPL bf16 → quant |
|---|---:|---:|---:|---:|---:|---:|
| all | 24552 | 0,11355 | 0,00924 | 1,9539 | 91,13% | 3,507 → 3,540 |
| chat | 10230 | 0,09287 | 0,02619 | 1,0880 | 87,83% | 7,686 → 7,635 |
| code | 5115 | 0,11181 | 0,00033 | 2,5067 | 95,60% | 1,842 → 1,815 |
| math | 5115 | 0,06561 | 0,00258 | 1,2782 | 94,57% | 2,308 → 2,369 |
| prose | 4092 | 0,22733 | 0,00792 | 3,3509 | 89,49% | 1,859 → 1,974 |

KL P99.9 de 5,5255 y maximo de 13,872.

Comparativa de checkpoints de la misma familia:

| Checkpoint | Backbone no-PLE | Layout y calibracion | KL medio | KL P99 | Top-1 |
|---|---:|---|---:|---:|---:|
| Qwen3.8-Flash-Next-3.48BPW | 51,07 GiB | 48 MoE W3 g128, shared_expert BF16, 104x2048 | 0,12488 | 2,0779 | 90,92% |
| Qwen3.8-Flash-Next-3.55BPW-MTP | 51,97 GiB (+MTP) | 2x W4 (L46-47) + 11x W3 g64, GDN/QSA/SE W8, 192x2048 | 0,10734 | 1,7738 | 91,70% |
| Qwen3.8-Flash-Next-3.43BPW-MTP | 50,22 GiB (+MTP) | Zero-W2 compact layout, 512x2048, 400 iters | 0,11355 | 1,9539 | 91,13% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el backbone no-PLE ocupa 50,219 GiB en pesos empaquetados; la PLE oficial en FP8 (~47,7 GiB) se descarga a memoria de host mediante vLLM, por lo que se requiere RAM de sistema suficiente ademas de la VRAM para el backbone y las activaciones.
- GPU recomendadas: no disponible de forma explicita; por el tamano del backbone se necesitan aceleradores con al menos 50 GiB de VRAM para los pesos, lo que apunta a A100 80 GB, H100 80 GB o similares.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 24-48 GB sin offload adicional no documentado.
- Opciones de despliegue: vLLM con `--trust-remote-code --dtype bfloat16` y `--engram-config '{"cpu_offload": true, "use_thp": true}'`; requiere ejecutar `vllm-patch.py` para parchear la busqueda de bit-width de INC RoutedExperts.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beling86/Qwen3.8-Flash-Next-3.43BPW-MTP | no disponible (backbone no-PLE 50,22 GiB) | no disponible | KL medio 0,11355; top-1 91,13% | no disponible | Hugging Face, 0 descargas |
| Beling86/Qwen3.8-Flash-Next-3.55BPW-MTP | no disponible (backbone no-PLE 51,97 GiB) | no disponible | KL medio 0,10734; top-1 91,70% | no disponible | Hugging Face |
| Beling86/Qwen3.8-Flash-Next-3.48BPW | no disponible (backbone no-PLE 51,07 GiB) | no disponible | KL medio 0,12488; top-1 90,92% | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | Referencia (profesor) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: cualquier sesgo o limitacion del modelo base Qwen3.8-Flash-Next se hereda sin cambios.
- La fidelidad no es uniforme: el dominio de prosa presenta el peor KL medio (0,22733) y el mayor KL P99 (3,3509), por lo que la generacion creativa puede divergir mas del BF16.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion a 3 bits en los expertos enrutados puede ampliar la deriva en generaciones largas.
- Requiere parchear vLLM (`vllm-patch.py`) antes de servir; sin el parche, la busqueda de bit-width de INC RoutedExperts falla.
- Dependencia de offload de la PLE a memoria de host: el rendimiento real dependera del ancho de banda de la RAM y del soporte de transparent huge pages (`use_thp`).
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que remitirse a la licencia del modelo base Qwen/Qwen3.8-Flash-Next.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Contexto maximo no disponible: no se documenta la ventana de contexto efectiva tras la cuantizacion.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad; el checkpoint solo ha pasado los gates de validacion declarados por el autor.
- El tag `qwen4_exp_text` en los metadatos no se corresponde con el nombre del modelo base declarado, lo que conviene verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beling86/Qwen3.8-Flash-Next-3.43BPW-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de AutoRound: no disponible en la informacion proporcionada
- Documentacion de vLLM: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
