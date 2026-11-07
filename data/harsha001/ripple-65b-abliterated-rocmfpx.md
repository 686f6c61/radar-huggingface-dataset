# Harsha001/Ripple-65B-abliterated-ROCmFPX

## Resumen

Ripple-65B-abliterated-ROCmFPX es una distribución de cuantizaciones GGUF del modelo denso Ripple-65B-Preview de ricursiveAI, publicada por el usuario Harsha001. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión a formato GGUF optimizada para GPUs AMD (en particular Strix Halo, gfx1151) mediante el fork ROCmFPX de llama.cpp. La model card indica que el modelo base es un transformer denso de 65B parámetros, aunque los safetensors reales del repositorio suman 4.037.752.064 parámetros, dato que entra en contradicción con la denominación "65B" y que conviene tratar con cautela.

El modelo base, Ripple-65B-Preview, es un modelo open-weight de Ricursive Intelligence preentrenado desde cero para coding agéntico, presentado como variante de propósito general del modelo propietario que sustenta su plataforma de diseño de chips con IA. La versión aquí descrita incorpora el sufijo "abliterated", que en la práctica suele indicar la eliminación de direcciones de rechazo en los pesos, aunque la model card no documenta el procedimiento concreto aplicado.

La relevancia de esta ficha reside en dos aspectos: por un lado, ofrece cuantizaciones con métricas de degradación medidas (KLD frente a Q8_0) y un esquema mixto 4/8 bits que reduce el error un 42% respecto al Q4_K_M estándar a cambio de 2 GB adicionales; por otro, incluye soporte para decodificación especulativa con un drafter propio de ricursiveAI (DFlash2), con ganancias medidas de hasta 4,1x en generación de código. Todo el ecosistema está licenciado Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura propietaria "ricursive", no integrada en llama.cpp upstream) |
| Parametros totales | 65B según model card; 4.037.752.064 según safetensors del repo (dato contradictorio, no disponible un valor confirmado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.097.152 tokens por defecto (2M); se recomienda fijar `-c` explícitamente en llama.cpp |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_0_ROCMFP4_STRIX_A8 (atención y capa de salida en 8 bits, resto en 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 170 GB); el modelo base original en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura denominada "ricursive", que no está soportada en llama.cpp upstream y requiere el fork ROCmFPX (port del PR #31692 de llama.cpp). Ricursive Intelligence lo describe como un modelo preentrenado desde cero para coding agéntico, del que esta variante Preview es la versión de propósito general del modelo propietario usado en su plataforma de diseño de chips. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable de esta distribución no está en el entrenamiento sino en la cuantización y el runtime. El fichero Q4_0_ROCMFP4_STRIX_A8 mantiene atención y capa de salida en 8 bits (ROCmFPX Q8) y el resto en 4 bits (ROCmFP4), porque la atención puramente en 4 bits degradaba demasiado el modelo (KLD 0,086). Las métricas se midieron con `llama-perplexity` sobre 40 fragmentos de 512 tokens de wikitext-2 contra un Q8_0 estándar de los pesos BF16 originales, expandiendo cada fichero a Q8_0 y evaluándolo en una NVIDIA GB10. Adicionalmente, el ecosistema incluye un modelo drafter (DFlash2) que predice hasta 16 tokens a partir de los estados ocultos de Ripple para decodificación especulativa, con verificación en una sola pasada por parte del modelo principal.

## Capacidades

- Generación de texto conversacional con plantilla ChatML que incluye razonamiento y llamadas a herramientas (`--jinja`).
- Coding agéntico: el modelo base fue preentrenado específicamente para tareas de programación con agentes.
- Soporte de tool calling / function calling mediante la plantilla de chat embebida en el GGUF.
- Razonamiento multi-paso (el template incluye secciones de reasoning).
- Decodificación especulativa con drafter DFlash2, con ganancia medida de hasta 4,1x en código y 1,6x en prosa libre.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Asistencia de código en local sobre hardware AMD: el modelo puede desplegarse en una Strix Halo con 128 GB usando el fichero Q6_K (53,6 GB) y el fork ROCmFPX, permitiendo autocompletado y generación de funciones en un equipo de escritorio sin GPU de datacenter.
- Pipelines de CI/CD con tool calling: la plantilla ChatML con soporte de function calling permite integrar el modelo en flujos que invocan linters, ejecutores de tests o APIs internas, siempre que se fije `-c` explícitamente para evitar la asignación desmedida de KV cache por el contexto por defecto de 2M.
- Generación de código de alta velocidad con drafter: en escenarios donde la latencia importa (autocompletado interactivo, generación de tests), el drafter DFlash2 con `--spec-draft-n-max 15` ofrece 14,1 tokens/s frente a 3,4 sin él en una GB10, un 4,1x de mejora medido.
- Despliegue en equipos con 64 GB de memoria unificada: el fichero Q4_0_ROCMFP4_STRIX_A8 (41,5 GB) cabe en máquinas de 64 GB o más, con un error (KLD 0,022) un 42% inferior al Q4_K_M estándar (0,038) a cambio de 2 GB extra.
- Investigación sobre cuantización mixta: las métricas publicadas (KLD, same top token) permiten reproducir y comparar esquemas de cuantización 4/8 bits en modelos densos de gran tamaño, usando wikitext-2 y `llama-perplexity` como referencia.
- Evaluación de modelos abliterated: para investigadores interesados en el efecto de la eliminación de rechazos sobre calidad y alineamiento, este repo ofrece una variante abliterated del modelo base, aunque sin documentación del procedimiento aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se publican métricas de fidelidad de cuantización y de velocidad de decodificación especulativa:

| Fichero | Tamano | KLD medio vs Q8_0 | Mismo token top-1 |
|---|---|---|---|
| Q8_0_ROCMFPX | 66,8 GB | 0,0043 | 97,6% |
| Q6_K_ROCMFPX | 53,6 GB | 0,0062 | 96,9% |
| Q4_0_ROCMFP4_STRIX_A8 | 41,5 GB | 0,022 | 94,0% |
| Q4_K_M estándar (referencia) | 39,6 GB | 0,038 | 92,1% |

| Prompt | Sin drafter | `n-max 15` | `n-max 7` |
|---|---|---|---|
| Función Python | 3,4 tok/s | 14,1 (4,1x) | 13,8 |
| Explicar por qué el cielo es azul | 3,4 | 6,2 | 6,9 (2,0x) |
| Pregunta corta de matemáticas | 3,4 | 8,9 (2,6x) | 7,3 |
| Relato corto | 3,4 | 4,9 | 5,4 (1,6x) |

Medido en NVIDIA GB10 con Q8_0 estándar de Ripple, decodificación greedy y `llama-speculative-simple`. El drafter fue entrenado con secuencias de 16K tokens, por lo que su acierto decae por encima de ese contexto.

## Requisitos de hardware

- VRAM estimada: 66,8 GB (Q8_0), 53,6 GB (Q6_K), 41,5 GB (Q4_0 mixto); el drafter DFlash2 añade 8,1 GB.
- GPU objetivo: AMD Strix Halo (gfx1151) con 128 GB de memoria unificada para Q8_0 y Q6_K; 64 GB o más para el fichero de 4 bits.
- Cabe en GPU de consumo: sí, en equipos con memoria unificada grande (Strix Halo de 128 GB o 64 GB); no en GPUs discretas de 24 GB o menos.
- Opciones de despliegue: fork ROCmFPX de llama.cpp con backend HIP/ROCm (`-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`) o Vulkan (`-DGGML_VULKAN=ON`). No es compatible con llama.cpp upstream, vLLM, TGI ni Ollama sin el fork.
- Throughput estimado: 3,4 tok/s sin drafter en NVIDIA GB10 con Q8_0; hasta 14,1 tok/s en código con drafter. No hay mediciones publicadas en Strix Halo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ripple-65B-abliterated-ROCmFPX | 65B (según model card) | 2M | Apache-2.0 | GGUF en HF, requiere fork ROCmFPX | Variante abliterated, cuantización mixta 4/8 bits |
| Ripple-65B-Preview (ricursiveAI) | 65B | 2M | Apache-2.0 | Pesos originales en HF | Modelo base sin abliterar, formato original |
| Ripple-65B-Preview-DFlash2 | No disponible | No disponible | Apache-2.0 | GGUF BF16 en HF | Drafter para decodificación especulativa, no es un modelo general |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (densos de ~65B orientados a coding agéntico) dentro de la información proporcionada.

## Limitaciones y advertencias

- Contradicción en el tamaño: la model card indica 65B parámetros, pero los safetensors del repo suman 4.037.752.064 parámetros. Verificar antes de dimensionar infraestructura.
- La variante "abliterated" no documenta el procedimiento aplicado ni evalúa el impacto sobre seguridad, alineamiento o calidad; puede generar contenido que el modelo base rechazaría.
- No se han ejecutado pruebas en Strix Halo: el autor pide a la comunidad que reporte velocidad y calidad. Las cifras de rendimiento provienen de una NVIDIA GB10.
- El modelo no es compatible con llama.cpp upstream; requiere el fork ROCmFPX y un PR no fusionado (#31692). Riesgo de mantenimiento y de roturas en actualizaciones.
- El contexto por defecto es de 2M tokens; si no se pasa `-c` explícitamente, llama.cpp intenta reservar una KV cache que no cabe en memoria.
- El drafter DFlash2 pierde eficacia por encima de ~16K tokens de contexto y añade 8 GB de memoria.
- No hay datos publicados de benchmarks de capacidad, idiomas soportados ni composición del dataset de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero la condición de modelo derivado de un base model de terceros conviene verificarla con la documentación de ricursiveAI.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Ripple-65B-abliterated-ROCmFPX
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- PR de llama.cpp con soporte de arquitectura Ripple: https://github.com/ggml-org/llama.cpp/pull/31692
- PR de llama.cpp del runtime DFlash2: https://github.com/ggml-org/llama.cpp/pull/27342
- Artículo sobre el lanzamiento de Ripple-65B Preview: https://www.marktechpost.com/2026/11/04/ricursive-ripple-65b-preview-open-weight-model/
