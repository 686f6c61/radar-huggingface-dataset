# jimmy31chen/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-IQ3_S-Strata

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un reempaquetado del modelo abliterado `0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored` en su familia de cuantización IQ3_S, preparado para funcionar directamente con el motor de inferencia Strata. El autor, `jimmy31chen`, resuelve un problema concreto: la release original se distribuye en 8 shards GGUF con tensores de expertos (gate/up/down) cortados entre fronteras de shard, lo que rompe `tools/iq_pack.py` de Strata, que exige que los tres tensores de cada capa MoE vivan en el mismo fichero. La solución es una fusión bit a bit con `llama-gguf-split --merge` en un único GGUF de 83 GiB más un pack de Strata preconstruido.

El modelo subyacente es una variante de Qwen3.8-Flash-Next con la dirección de rechazo eliminada (abliteration) y sin censura, con 176.943.899.520 parámetros totales (unos 176,9 mil millones) y arquitectura MoE con componentes SSM, router, indexer, hyper-connections y una tabla PLE de n-gramas, según los nombres de tensores descritos en la model card. El contexto configurado en el lanzamiento de referencia es de 262.144 tokens con caché KV en int8.

Su relevancia práctica es doble: por un lado, es la única vía documentada para ejecutar este modelo concreto en Strata sin hacer la fusión y el empaquetado a mano; por otro, su volumen de descargas (337.934) y su tamaño (90,4 GB de repo) lo sitúan como una pieza de infraestructura para quien quiera servir un MoE abliterado de gran tamaño en hardware de gama alta de consumo. Conviene recordar que la abliteración elimina los rechazos de seguridad: el modelo cumplirá peticiones dañinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con componentes SSM, router, indexer, hyper-connections y tabla PLE de n-gramas; arquitectura GGUF declarada como `qwen4exp` |
| Parametros totales | 176.943.899.520 (aprox. 176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en la configuracion de referencia (`--max-context 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ3_S (expertos gate/up), IQ4_NL (expertos down y tabla PLE), BF16/F16 (tensores densos y 484 proyecciones pequenas dequantizadas via `--compat-bf16`), KV cache int8 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada de Qwen3.8-Flash-Next) |
| Formato de pesos | GGUF single-file (83 GiB, 1224 tensores) + Strata pack (`dense.bin` 1,5 GiB, `index.txt`, `native_experts.txt`, `tokenizer/`, `compat-bf16.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora bloques de estado (SSM), un indexer —probablemente asociado a atención dispersa—, hyper-connections y una tabla PLE de n-gramas leída directamente desde el GGUF, además de un módulo MTP (multi-token prediction) que el autor activa opcionalmente para decodificación especulativa. Los expertos se almacenan con gate/up en IQ3_S y down en IQ4_NL; la tabla PLE usa IQ4_NL. El pack de Strata sirve 302 tensores de forma nativa de un total de 1079, y dequantiza a BF16 otras 484 proyecciones pequeñas (1,4 GiB) con redondeo a par más cercano.

Este repositorio no entrena ni afina nada: la fusión de los 8 shards con `llama-gguf-split --merge` (commit `30ec18e` de llama.cpp) es una relocalización pura de datos, con bytes de pesos bit-idénticos al original, 1224 tensores y metadatos `split.*` eliminados. La abliteración la realizó `0bserverx` sobre Qwen3.8-Flash-Next mediante eliminación de la dirección de rechazo, y el autor reporta (citando a upstream) una pérdida de solo −0,49 % de perplejidad frente al base en Q6_K. No se detallan composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y generación de código: capacidades heredadas del base Qwen3.8-Flash-Next; no se aportan evaluaciones específicas en la información disponible.
- Multilingüe limitado a inglés y chino (en, zh); no se declaran otros idiomas.
- Contexto largo: hasta 262.144 tokens configurados, con KV cache int8 y `--kv-resident 32768`.
- Decodificación especulativa mediante MTP opcional (`--spec 4`), con ~71 % de aceptación de borrador medida en RTX 5090.
- Enrutamiento de expertos con caché dinámica (`--expert-cache auto`) y perfil de expertos genérico de Strata sin recalibración.
- Sin rechazos de seguridad: la abliteración elimina la dirección de rechazo, de modo que el modelo cumple peticiones que un modelo alineado rechazaría.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Servicio de un MoE de ~177 B en una sola máquina de gama alta: el pack preconstruido permite arrancar con `strata --serve` sin pasos de merge ni calibración, algo útil para laboratorios que quieren evaluar el modelo en horas en lugar de días.
- Investigación sobre abliteración: al ser una copia bit-idéntica del IQ3_S de `0bserverx`, sirve como referencia reproducible para medir el efecto de la eliminación de la dirección de rechazo frente al base, con la salvedad de la pérdida del 0,49 % de perplejidad reportada en Q6_K.
- Procesamiento de documentos largos en inglés o chino: con 262.144 tokens de contexto y KV en int8, encaja en tareas de resumen o extracción sobre corpus extensos sin troceado agresivo.
- Generación de texto creativo sin restricciones de contenido: el caso de uso declarado implícitamente por la naturaleza `uncensored`, siempre bajo responsabilidad del operador y con las cautelas legales correspondientes.
- Evaluación comparativa de motores de inferencia: el mismo GGUF fusionado permite contrastar el rendimiento de Strata (103–127 tok/s en RTX 5090) frente a otras implementaciones que acepten GGUF, si bien el pack solo es válido para Strata.
- Prototipado de pipelines con decodificación especulativa: el MTP con ~71 % de aceptación de borrador y `--spec 4` sirve para estudiar el equilibrio entre latencia y tasa de aceptación en cargas conversacionales.
- Infraestructura de cuantización: los scripts y el layout documentado (`native_experts.txt`, `index.txt`, `compat-bf16.json`) son material de referencia para quien necesite empaquetar otros MoE con expertos repartidos entre shards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos que aporta el autor son de inferencia y de calidad relativa:

| Metrica | Valor | Entorno |
|---|---|---|
| Perplejidad vs. base (Q6_K, dato de upstream) | −0,49 % | Reportado por `0bserverx` |
| Decode throughput | 103–127 tok/s | RTX 5090 + i9-13900KF + 125 GB RAM |
| Aceptacion de borrador (MTP spec-decode) | ~71 % | Mismo entorno, `--spec 4` |
| Acierto de cache de expertos | ~95 % | Mismo entorno |
| Aciertos de KV streaming en VRAM | ~99,6 % | Contexto de 262K |
| Working set | ~50 GB de expertos en RAM + ~30 GB en VRAM | Mismo entorno |

## Requisitos de hardware

- VRAM estimada: ~30 GB en VRAM como parte del working set medido; el autor indica una clase de hardware de ~32 GB de VRAM para el arranque.
- RAM estimada: ~50 GB para expertos residentes; el autor recomienda ~64 GB de RAM como mínimo y midió con 125 GB.
- Almacenamiento: 90,4 GB de repo; el GGUF fusionado solo ya ocupa 83 GiB, más 1,5 GiB de `dense.bin` y el resto del pack.
- GPU recomendadas: RTX 5090 (única con medición publicada); por clase de memoria, GPU de 32 GB o más (A100 40/80 GB, H100, RTX 5090). No hay mediciones publicadas en A100 ni H100.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) según la medición del autor, siempre que la RAM del sistema aloje los ~50 GB de expertos.
- Opciones de despliegue: exclusivamente Strata ≥ 0.1.30 con `--serve`, `--pack`, `--native`, `--ple-gguf` y `--expert-profile`; el repo declara `inference: false` y no documenta uso con vLLM, TGI, llama.cpp u Ollama, aunque el GGUF fusionado procede de `llama-gguf-split` y es la entrada que consume Strata.
- Latencia y throughput: 103–127 tok/s de decode en el entorno medido; no se publican cifras de prefill ni de latencia por token (TTFT).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (`jimmy31chen/...-IQ3_S-Strata`) | 176,9 B | 262.144 configurados | GGUF fusionado + pack Strata | Apache-2.0 | Requiere Strata ≥ 0.1.30; listo para servir sin pasos previos |
| `0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-GGUF` | 176,9 B (misma familia) | no disponible | GGUF en 8 shards, IQ3_S | Apache-2.0 | Fallan el empaquetado en Strata por expertos cortados entre shards |
| `0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored` | 176,9 B (misma familia) | no disponible | no disponible (repo base, no GGUF) | Apache-2.0 | Modelo origen de la abliteración; sin datos de rendimiento publicados aquí |
| Qwen3.8-Flash-Next (base de Qwen) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo alineado original; la abliteración reporta −0,49 % de perplejidad a Q6_K |

## Limitaciones y advertencias

- El modelo está abliterado y descrito como `uncensored`: no rechazará peticiones dañinas. La responsabilidad sobre el contenido generado recae en el operador, y su uso en producción exige filtros y políticas propias.
- La abliteración no es gratuita en calidad: upstream reporta −0,49 % de perplejidad frente al base en Q6_K; el efecto en otras métricas (razonamiento, código) no está medido en la información disponible.
- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- La cuantización IQ3_S en los expertos gate/up introduce pérdida adicional frente a Q6_K; las cifras de perplejidad citadas no corresponden a este fichero.
- La opción `--compat-bf16` dequantiza 484 proyecciones pequeñas (1,4 GiB) con redondeo a par más cercano y es lossy para esos tensores: no se reconstruyen al BF16 original. Expertos y tabla PLE quedan intactos.
- Dependencia de un motor propietario de facto: el pack solo funciona con Strata ≥ 0.1.30 y su `expert-profile.bin` genérico; no hay ruta documentada a vLLM, TGI, llama.cpp u Ollama, lo que limita la portabilidad y añade riesgo de proveedor.
- El perfil de expertos no se recalibra: se asume que el enrutamiento es casi idéntico al del base por ser una abliteración, una suposición razonable pero no verificada con métricas de calidad.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de benchmarks de razonamiento; no hay garantías medibles.
- Los requisitos de memoria (~50 GB RAM + ~30 GB VRAM) dejan fuera la mayoría de equipos de consumo y buena parte de las instancias cloud pequeñas.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede chocar con normativa sectorial o con los términos de servicio de los proveedores cloud; conviene revisarlo antes de desplegar.
- El repositorio se creó el 2026-10-01 y no se ha actualizado desde entonces; no hay historial de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jimmy31chen/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-IQ3_S-Strata
- Modelo base (repo de la abliteración): https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored
- GGUF original en 8 shards: https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-GGUF
- Perfil del autor de la abliteración: https://huggingface.co/0bserverx
- Motor Strata: https://github.com/Niko1221/Strata
