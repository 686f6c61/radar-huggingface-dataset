# benthecarman/Inkling-2-Mini-uncensored-GGUF

## Resumen

Inkling-2-Mini-uncensored-GGUF es la versión cuantizada en formato GGUF del modelo benthecarman/Inkling-2-Mini-uncensored, un checkpoint de 26.070.385.152 parámetros (aproximadamente 26,1 mil millones) con arquitectura Mixture-of-Experts (MoE) y capacidades multimodales (image-text-to-text). El modelo deriva de una base denominada Inkling-2-Mini sobre la que se ha aplicado un proceso de "abliteration" o eliminación de rechazos, orientado a reducir drásticamente las negativas del modelo ante peticiones que un modelo alineado convencional rechazaría. Lo publica el usuario benthecarman, con licencia Apache 2.0 y patrocinio declarado de Maple AI.

La relevancia de esta ficha reside en dos aspectos técnicos concretos. Por un lado, el repositorio incluye el proyector de visión (`mmproj-F16.gguf`) y un drafter especulativo propio del ecosistema, denominado DSpark MTP, que acelera la decodificación en llama.cpp. Por otro, la model card reporta métricas de rendimiento medidas en una RTX 5090 con el cuantizado Q4_K_M y el drafter Q8_0: 38,9 % de aceptación de borradores, 3,72 tokens por paso y 124,3 tok/s frente a 99,4 tok/s sin DSpark (aceleración de 1,25x).

El modelo está pensado para despliegue local mediante llama.cpp (build b12722 o superior), con soporte de contexto de 32.768 tokens según el ejemplo de ejecución de la model card, tool calling verificado en BFCL v4 y modo de razonamiento ("thinking") configurable. Su orientación "uncensored" lo hace inadecuado para aplicaciones comerciales orientadas al público general sin salvaguardas adicionales, pero relevante para investigación sobre alineación, evaluación de rechazos y experimentación con decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención looped (`inkling2_loop`) y multimodal (image-text-to-text) |
| Parametros totales | 26.070.385.152 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (según ejemplo de ejecución con `-c 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); NVFP4/MXFP8 y W4A16 INT4 en el repo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), más safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con una variante de atención denominada `inkling2_loop` en el ecosistema llama.cpp (PR #32694 y #32704), que introduce un mecanismo de escalado de expertos en bucle. La model card no detalla el número de expertos, la proporción de parámetros activos por token ni la composición del dataset de entrenamiento, por lo que estos datos no están disponibles. El checkpoint es multimodal: incorpora un proyector de visión (`mmproj-F16.gguf`, 610 MiB) que habilita la entrada de imágenes junto con texto.

El proceso de "abliteration" aplicado sobre la base Inkling-2-Mini busca eliminar la conducta de rechazo del modelo. La model card reporta una divergencia KL de 0,230 respecto al modelo base en el primer token de respuesta (con thinking desactivado), lo que cuantifica cuánto se ha desplazado la distribución de salida. No se especifican detalles sobre RLHF, DPO ni el volumen de tokens de entrenamiento. La innovación técnica más destacable del despliegue es el drafter DSpark MTP (Multi-Token Prediction), un modelo auxiliar de 386 MiB (Q8_0) o 715 MiB (BF16) que implementa decodificación especulativa en llama.cpp mediante `--spec-type draft-dspark`, con hasta 7 tokens de borrador por paso (`--spec-draft-n-max 7`).

## Capacidades

- Generación de texto conversacional multi-turno, con muestreo recomendado de `temperature=1.0`, `top_p=1.0`, `top_k=0`, `min_p=0.0`.
- Razonamiento con modo "thinking" configurable (desactivado, `low`, `medium`, `high` según los benchmarks reportados).
- Generación de código: 97,0 % en HumanEval con thinking desactivado y 99,4 % con `low` según la model card.
- Tool calling / function calling: 80,1 % en BFCL v4 (fold `final`, 1.205 prompts).
- Comprensión de imágenes (image-text-to-text) mediante el proyector de visión `mmproj-F16.gguf`.
- Decodificación especulativa con DSpark MTP: 3,72 tokens por paso y 124,3 tok/s en RTX 5090.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Conducta "uncensored": reducción del rechazo del 91,0 % al 6,6 % en un conjunto held-out de 633 prompts (System One).

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite medir el efecto de la abliteration comparando la tasa de rechazo (6,6 % frente a 91,0 % del base) y la divergencia KL (0,230), útil para estudiar qué se pierde y qué se gana al eliminar salvaguardas.
- Despliegue local en estación de trabajo con GPU de 24 GB: el cuantizado Q4_K_M (16,5 GiB) cabe en una RTX 3090 o 4090, permitiendo ejecutar un MoE multimodal de 26 B con contexto de 32k sin infraestructura en la nube.
- Aceleración de inferencia con decodificación especulativa: el drafter DSpark MTP añade 386 MiB y ofrece 1,25x de aceleración verificada (99,4 a 124,3 tok/s), útil en pipelines interactivos donde la latencia por token importa.
- Asistencia de código en local: con 97,0-99,4 % en HumanEval, el modelo es adecuado para autocompletado y generación de funciones en entornos con requisitos de privacidad que impiden enviar código a APIs externas.
- Automatización con tool calling: el 80,1 % en BFCL v4 permite integrarlo como agente que invoca funciones (APIs, bases de datos, shell) en flujos de multi-step reasoning, siempre con validación externa de las acciones.
- Procesamiento de documentos con imágenes: la entrada image-text-to-text habilita la extracción de información de capturas, diagramas o formularios escaneados combinándolos con texto en la misma conversación.
- Experimentación con cuantizaciones extremas: el IQ4_XS (14,1 GiB) permite probar el modelo en equipos con 16 GB de VRAM o memoria unificada, midiendo la degradación frente a Q8_0 (25,9 GiB).

## Benchmarks y rendimiento

Resultados reportados en la model card para el checkpoint padre (`benthecarman/Inkling-2-Mini-uncensored`, NVFP4/MXFP8, `temperature=1.0`, `seed=0`, sin límite de tokens):

| Benchmark | Base Inkling-2-Mini | Uncensored (padre) |
|---|---:|---:|
| KL respecto al base (primer token, thinking off) | 0,000 | 0,230 |
| MMLU (14.042 preguntas, 5-shot generativo, thinking off) | 76,6 % | 75,3 % |
| HumanEval (164 problemas, off / low) | 97,6 % / 98,2 % | 97,0 % / 99,4 % |
| BFCL v4 tool calling (fold `final`, 1.205 prompts) | 79,5 % | 80,1 % |
| Conjunto held-out de rechazo (633 prompts, System One) | 91,0 % rechazados | 6,6 % rechazados |
| HarmBench-320 (low / off, DirectRequest ASR) | 1,6 % / 2,5 % | 65,0 % / 64,7 % |
| `audn` 520 (low / medium / high / off) | 0,0 % entregados | 85,0 % / 86,7 % / 88,3 % / 81,9 % entregados |

Rendimiento de inferencia medido en RTX 5090 con Q4_K_M + DSpark Q8_0 (build b12722, `k=7`):

| Métrica | Sin DSpark | Con DSpark MTP |
|---|---:|---:|
| Throughput | 99,4 tok/s | 124,3 tok/s |
| Tokens por paso | no disponible | 3,72 |
| Aceptación de borradores | — | 38,9 % |
| Aceleración | 1,00x | 1,25x |

## Requisitos de hardware

- VRAM para IQ4_XS: 14,1 GiB, cabe en GPUs de 16 GB y en Apple Silicon con 16 GB de memoria unificada.
- VRAM para Q4_K_M: 16,5 GiB, recomendado para RTX 3090 y RTX 4090 (24 GB).
- VRAM para Q5_K_M: 18,8 GiB, cabe en GPUs de 24 GB.
- VRAM para Q6_K: 21,8 GiB y Q8_0: 25,9 GiB, requieren GPUs de 32 GB o Apple Silicon de 32 GB o más.
- Proyector de visión: 610 MiB adicionales (`mmproj-F16.gguf`).
- Drafter especulativo: 386 MiB (Q8_0) o 715 MiB (BF16) adicionales.
- GPU verificada: RTX 5090 con Q4_K_M + DSpark Q8_0, 124,3 tok/s.
- Opciones de despliegue: llama.cpp (build b12722 o superior, imprescindible por los PR #32704 y #32218), `llama-server` con `--jinja`; para NVFP4/MXFP8 y W4A16 INT4 existen repos separados orientados a vLLM en Blackwell/Hopper y Ampere respectivamente.
- Throughput estimado: 99,4 tok/s sin decodificación especulativa y 124,3 tok/s con DSpark en RTX 5090; latencia por token no disponible para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-uncensored (este) | ~26,1 B (MoE) | 32.768 | Apache 2.0 | GGUF, NVFP4/MXFP8, W4A16 | Multimodal, DSpark MTP, abliterated |
| Inkling-2-Mini (base) | ~26,1 B (MoE) | no disponible | no disponible | safetensors | Punto de partida alineado; 91,0 % de rechazo |
| Alternativas de tamaño similar (p. ej. MoE de ~24-30 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se han publicado en la información disponible comparativas directas con otros modelos de la misma categoría (MoE de ~26 B multimodales), por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El modelo está explícitamente "abliterated": la tasa de rechazo cae del 91,0 % al 6,6 % y la tasa de éxito de ataques DirectRequest en HarmBench-320 sube del 1,6-2,5 % al 64,7-65,0 %. No es apto para aplicaciones orientadas al público sin filtros y salvaguardas externas.
- En el benchmark `audn` 520, el modelo entrega contenido en el 81,9-88,3 % de los casos frente al 0,0 % del base, lo que confirma la pérdida de barreras de seguridad.
- La divergencia KL de 0,230 respecto al base indica un desplazamiento medible de la distribución de salida; puede degradar la calidad en tareas sensibles a la alineación original.
- Riesgo de alucinación: no se han publicado métricas específicas de fidelidad o veracidad en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe fuera del inglés sin evaluación.
- Requiere un build específico de llama.cpp (b12722 o superior); versiones anteriores pueden fallar con la arquitectura `inkling2_loop` o ignorar el drafter DSpark.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento "uncensored" traslada al desplegador la responsabilidad legal y ética del contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados reportados.
- El contexto de 32.768 tokens corresponde al valor usado en el ejemplo de la model card; el máximo nativo del modelo no está documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored-GGUF
- Modelo base (padre): https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored
- Variante W4A16 INT4: https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored-W4A16
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de atención looped `inkling2_loop`: https://github.com/ggml-org/llama.cpp/pull/32694
- PR de corrección de escala de expertos en bucle: https://github.com/ggml-org/llama.cpp/pull/32704
- PR de decodificación especulativa DSpark MTP: https://github.com/ggml-org/llama.cpp/pull/32218
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Patrocinador Maple AI: https://maple.ai
