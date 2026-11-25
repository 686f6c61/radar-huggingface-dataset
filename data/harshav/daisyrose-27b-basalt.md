# harshav/DaisyRose-27B-Basalt

## Resumen

DaisyRose-27B-Basalt es un paquete de modelo autocontenido en formato `.basalt` que empaqueta los pesos del modelo multimodal de razonamiento RadixArk/DaisyRose-27B-NVFP4 junto con un drafter causal de bloques DSpine de cinco capas. El modelo base es un transformer hibrido de 27B parametros que combina atencion GDN (Gated DeltaNet) con GQA (Grouped Query Attention), derivado de Qwen/Qwen3.8-27B y sometido a un entrenamiento de refuerzo (RL) por RadixArk. El paquete lo publica el usuario harshav y esta pensado exclusivamente para el motor de inferencia Basalt sobre GPUs NVIDIA Blackwell (`sm_120`).

La relevancia de este artefacto no esta en los pesos en si (que provienen sin recuantizar de RadixArk/DaisyRose-27B-NVFP4), sino en la integracion de un drafter especulativo DSpine que acelera la decodificacion manteniendo verificacion exacta contra los logits del modelo objetivo. El paquete incluye ademas el encoder de vision, el tokenizer y la plantilla de chat, todo en un unico fichero de 22,36 GiB.

Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: su licencia es Apache-2.0, soporta contexto de hasta 262.144 tokens segun el comando de servicio documentado, y su uso requiere una build de Basalt con soporte DSpine, que no esta disponible en el repositorio upstream publico en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + GQA, multimodal (vision-text), con drafter especulativo DSpine de 5 capas |
| Parametros totales | 27B (modelo objetivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (segun comando de servicio `--max-context 262144`) |
| Tipos de cuantizacion | NVFP4 (FFN y head de salida, tipo 45), FP8 E4M3 (atencion y `ssm_out`, tipo 44), BF16 (embeddings y `ssm_alpha`/`ssm_beta`), F32 (norms, escalas, `conv1d`, `ssm_a`, `ssm_dt`), Q8_0/BF16/F32 en el drafter |
| Idiomas soportados | Ingles y multilingue (sin lista detallada) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.basalt` (paquete propietario del motor Basalt); pesos origen en NVFP4/FP8 de ModelOpt |
| Tamano del repositorio | 24,0 GB (fichero `.basalt` de 22,36 GiB / 24.012.116.510 bytes) |
| Hardware objetivo | NVIDIA Blackwell (`sm_120`) |
| Motor de inferencia | Basalt (fork de Strata), requiere build con soporte DSpine |

## Arquitectura y entrenamiento

El modelo objetivo es un transformer hibrido que intercala capas de atencion Gated DeltaNet (un mecanismo de estado lineal con compuertas) y capas de Grouped Query Attention, siguiendo la estela de las arquitecturas hibridas de Qwen. Incluye un encoder de vision y un proyector multimodal (`vision/mmproj`) en BF16/F32, lo que habilita la entrada image-text-to-text. Sobre Qwen/Qwen3.8-27B, RadixArk aplico un entrenamiento por refuerzo (RL) para obtener DaisyRose-27B, del que no se documentan en la informacion disponible el numero de tokens, la composicion del dataset ni los detalles del algoritmo de RL (RLHF/DPO/GRPO).

La innovacion tecnica del paquete es el drafter DSpine de Tencent (arXiv:2609.36173), un modelo causal de bloques de 5 capas con `block_size = 16`, `sliding_window = 8192`, `code_size = 1024`, `bridge_rank = 512`, `head_topk = 16` y objetivos en las capas `[1, 16, 31, 46, 61]`. Combina CodeBridge, inyeccion causal adyacente y refinamiento serial para proponer bloques de tokens que el modelo objetivo verifica de forma exacta (lossless): cada token propuesto se contrasta con los logits del target, de modo que la salida no degrada en calidad. Los pesos se almacenan sin recuantizacion respecto al checkpoint NVFP4 de origen.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (sin listado cerrado).
- Razonamiento multimodal image-text-to-text: acepta imagenes junto con texto gracias al encoder de vision empaquetado.
- Razonamiento y matematicas (heredados del modelo base Qwen3.8-27B con RL de RadixArk; sin benchmarks publicados en la informacion disponible).
- Generacion de codigo y salida estructurada: el drafter DSpine alcanza un 99,3 % de aceptacion en carga estructurada/codigo, lo que indica buen comportamiento en formatos rigidos.
- Decodificacion especulativa con verificacion exacta (pierde velocidad pero no precision).
- Contexto largo de hasta 262.144 tokens para lectura de documentos extensos.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial largo gracias a la ventana de 262.144 tokens, y el drafter DSpine ofrece 227 tok/s en carga conversacional, suficiente para respuestas interactivas en una RTX 5090.
- Generacion de codigo en produccion: con un 99,3 % de aceptacion de borrador y 931 tok/s en carga estructurada, es adecuado para autocompletado, generacion de parches y salida JSON/YAML en pipelines de CI/CD.
- Analisis de documentos con imagenes: al soportar image-text-to-text, puede procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales en una sola pasada.
- Asistente de investigación sobre corpus largos: la ventana de 262.144 tokens permite cargar articulos completos o varios PDFs y hacer preguntas cruzadas sin trocear el contexto.
- Generacion de prosa creativa: aunque el drafter rinde peor aqui (168 tok/s, 25 % de aceptacion), el modelo sigue siendo util para redaccion larga donde prima la calidad sobre la latencia.
- Despliegue local en estacion de trabajo Blackwell: un unico fichero de 22,36 GiB cabe en una RTX 5090 de 32 GB, lo que permite servir el modelo en local sin infraestructura de datacenter.
- Prototipado de agentes multimodales: combinacion de vision y contexto largo para tareas de extraccion de datos de capturas o interfaces.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una NVIDIA RTX 5090 (600 W) con `basalt-bench --kv int8 --spec 16 --parallel 1`:

| Carga | Throughput (tok/s) | Aceptacion de borrador | Longitud media de borrador |
|---|---:|---:|---:|
| `pp16384` (lectura de prompt de 16K) | 14.562 | — | — |
| `tg conv` (conversacion) | 227 | 42,1 % | 5,69 |
| `tg struct` (estructurado / codigo) | 931 | 99,3 % | 14,89 |
| `tg prose` (prosa creativa) | 168 | 25,0 % | 6,00 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero `.basalt` ocupa 22,36 GiB; con cache KV en int8 y contexto largo la huella crece por encima de los 24 GB, por lo que se recomienda una GPU de 32 GB o mas.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB, `sm_120`) es la plataforma de referencia validada; GPUs Blackwell de datacenter (B100/B200) son compatibles a nivel de arquitectura pero no se documentan mediciones.
- GPUs no soportadas: tarjetas Ampere, Ada Lovelace y Hopper no son objetivo del paquete (requiere `sm_120`).
- Cabe en GPU consumer: si, en RTX 5090; no en RTX 4090 (24 GB y arquitectura no Blackwell).
- Opciones de despliegue: exclusivamente el motor Basalt con soporte DSpine (build no publicada en upstream en el momento de la publicacion). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: 14.562 tok/s en prefill de 16K, 931 tok/s en generacion estructurada, 227 tok/s en conversacion y 168 tok/s en prosa, con verificacion especulativa exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---:|---|---|---|
| DaisyRose-27B-Basalt (este) | 27B | 262.144 | Apache-2.0 | `.basalt` / Basalt (DSpine) | Solo Blackwell; drafter especulativo integrado; sin benchmarks de calidad publicados |
| RadixArk/DaisyRose-27B-NVFP4 | 27B | no disponible | Apache-2.0 | NVFP4 ModelOpt | Pesos origen sin drafter; requiere motor compatible con ModelOpt |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache-2.0 | safetensors | Modelo base sin RL de RadixArk ni vision empaquetada en este paquete |
| Tencent/DSpine (Qwen3.8-27B-DSpine-b16) | drafter de 5 capas | ventana 8192 | Apache-2.0 | pesos sueltos | Solo el drafter, no el modelo completo |

No se dispone de comparativas de calidad (benchmarks) frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de una build no publicada de Basalt: el upstream `jesdga95/basalt` solo soporta DFlash2, no DSpine, por lo que el paquete no se puede ejecutar con el repositorio oficial tal cual.
- Restriccion de hardware severa: solo funciona en GPUs NVIDIA Blackwell (`sm_120`); no hay soporte para Ampere, Ada, Hopper ni aceleradores no NVIDIA.
- Formato propietario: el `.basalt` no es interoperable con vLLM, llama.cpp, Ollama, TGI ni transformers; migrar a otro motor exige volver a los pesos origen.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide validar el rendimiento real frente a Qwen3.8-27B u otros modelos de 27B.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos RL sin evaluacion publica.
- Sesgos: no documentados; el modelo base es multilingue pero la model card solo lista ingles y "multilingual" sin detalle de cobertura.
- Licencia Apache-2.0 permite uso comercial, pero el paquete no es una release oficial de RadixArk, Qwen ni Tencent; la responsabilidad de cumplimiento recae en el usuario.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El drafter rinde mal en prosa creativa (25 % de aceptacion), por lo que la aceleracion no es uniforme entre cargas.

## Enlaces

- Hugging Face: https://huggingface.co/harshav/DaisyRose-27B-Basalt
- Modelo base NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo Qwen de origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del drafter DSpine: https://github.com/Tencent/DSpine
- Paper DSpine: arXiv:2609.36173
- Motor Basalt: https://github.com/jesdga95/basalt
- Motor Strata (origen del fork): https://github.com/Niko1221/Strata
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
