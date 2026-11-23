# siasadar/modelbook-llamacpp

## Resumen

ModelBook es un sistema de adaptadores de conocimiento en espacio de pesos para `llama.cpp`, publicado por el usuario siasadar en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un compilador que transforma documentos de texto en cartuchos de habilidad (skill cartridges) en formato `.gguf` nativo, que se montan sobre un modelo base ya cuantizado sin consumir celdas de contexto (`n_ctx`) ni inyectar tokens en el prompt.

La propuesta resuelve un problema concreto: incorporar conocimiento nuevo a un modelo durante una conversación sin reiniciar la caché KV ni gastar ventana de contexto. Frente a generadores de hiperredes como Doc-to-LoRA, SHINE o Cache2LoRA, ModelBook emplea álgebra lineal en forma cerrada (sin retropropagación ni preentrenamiento auxiliar), lo que permite compilar adaptadores de forma determinista y montarlos en mitad de una conversación.

El repositorio incluye el compilador (`modelbook_compiler.py`), un parche para `llama.cpp-1.0.0` y resultados verificados en CUDA sobre dos modelos base: `Qwen3.8-9B-Q5_K_M.gguf` y `gemma-4-E4B-it-Q4_K_M.gguf`. Los adaptadores ocupan entre 9 y 24 MiB según cuantización, y el proyecto se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA en espacio de pesos sobre capas `ffn_down` densas del modelo base; compilación en forma cerrada (Woodbury, cuantización GGML nativa) |
| Parametros totales | No disponible (depende del modelo base; los adaptadores son de rango bajo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No consume contexto: 0 celdas de `n_ctx` por cartucho montado |
| Tipos de cuantizacion | F16, Q8_0, Q4_0, Q3_K, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptadores nativos para `llama.cpp`); incluye parche `llama_cpp_modelbook.patch` |

## Arquitectura y entrenamiento

ModelBook no entrena un modelo desde cero ni ajusta con descenso de gradiente. El pipeline consta de cuatro etapas: (1) introspección agnóstica a la arquitectura que descubre capas `blk.<l>.ffn_down.weight` y normas post-FFN en tiempo de ejecución y destila pares Q&A atómicos más paráfrasis sin respuesta; (2) blanqueamiento conjunto Woodbury invariante al historial, que ortogonaliza los subespacios de activación frente al conocimiento general `K_0`, los disparadores de otros cartuchos y la deriva de historial multi-turno; (3) cuantización GGML nativa "A-first", que expande el rango a bloques alineados y resuelve `B` en el espacio de activaciones cuantizadas; y (4) conformado radial seguro por escala de capa con enrutamiento Softmax competitivo Null-Anchor implementado en `build_lora_mm`.

Los adaptadores se compilan sobre capas objetivo concretas: 8 capas `[17, 19, 21, 23, 25, 27, 29, 31]` para `qwen35` y 10 capas `[23, 25, 27, 29, 31, 33, 35, 37, 39, 41]` para `gemma4`. No hay retropropagación, ni RLHF, ni DPO; el compilador y el parche no contienen ramas específicas de modelo o benchmark, según el autor.

## Capacidades

- Inyección de conocimiento documental sin consumir tokens de prompt ni celdas de contexto.
- Montaje dinámico de habilidades en mitad de una conversación sin reiniciar la caché KV.
- Montaje paralelo de varios cartuchos (probado con tres simultáneos: `Reception + CodingSDK + WebSkill`).
- Compilación de documentos de 386 a 839 tokens en adaptadores de 9 a 24 MiB.
- Cuantización nativa GGML con degradación controlada entre F16, Q8_0, Q4_0, Q3_K y Q2_K.
- Compatibilidad con modelos base densos que expongan capas `ffn_down` (probado con Qwen3.8-9B y Gemma-4-E4B).
- Enrutamiento competitivo entre cartuchos con salvaguarda de unidad y calibración entre capas.
- No disponible: tool calling, function calling, agentes multi-paso, visión, audio o modo thinking (no documentados).

## Casos de uso

- Asistencia técnica con base de conocimiento cambiante: compilar manuales o FAQs en cartuchos de ~14 MiB y montarlos sobre el modelo base sin reentrenar ni ampliar el contexto, manteniendo la conversación activa.
- Agentes conversacionales de larga duración: montar habilidades específicas (por ejemplo, `CodingSDK`) a mitad de sesión sin borrar la caché KV, preservando el historial previo (`PriorMem = True`).
- Despliegue en entornos con VRAM limitada: los adaptadores Q2_K ocupan entre 9,1 y 13,6 MiB, lo que permite acumular decenas de dominios sobre un mismo modelo base.
- Sistemas multi-dominio con enrutamiento: cargar en paralelo cartuchos de recepción, SDK de código y web y dejar que el enrutamiento Softmax competitivo seleccione el adecuado por consulta.
- Sustitución de RAG con ventana de contexto restringida: cuando `n_ctx` es pequeño (el benchmark usa `n_ctx=256` y `n_ctx=1024`), el cartucho evita el desbordamiento que provocaría la inyección completa del documento.
- Personalización por cliente: compilar la documentación propia de cada cliente en un cartucho aislado y montarlo solo durante su sesión, sin interferir con el conocimiento general (`K_0`).
- Prototipado rápido de dominios verticales: el compilador en forma cerrada produce adaptadores en una sola pasada, sin necesidad de infraestructura de entrenamiento.

## Benchmarks y rendimiento

Resultados verificados en CUDA 12.0 sobre RTX 6000 Ada con `--ngl 99`, según `benchmark_results.json`. Cada libro supera la ventana de un solo turno (386-839 tokens frente a `n_ctx=256`), y la auditoría confirma `prompt_tokens_used_by_book == 0`.

**Qwen3.8-9B-Q5_K_M.gguf (`qwen35`, 8 capas objetivo)**

| Dominio | Tok. fuente | Seen F16 / Q4_0 / Q2_K | Unseen F16 / Q4_0 / Q2_K | Tamano Q4_0 / Q2_K | Decode Q4_0 | ICL contexto completo |
|---|---|---|---|---|---|---|
| WebSkill | 665 | 100,0% / 100,0% / 100,0% | 40,0% / 50,0% / 40,0% | 17,8 / 13,6 MiB | 103,5 tok/s | 80,0% |
| CodingSDK | 625 | 88,9% / 88,9% / 88,9% | 60,0% / 60,0% / 60,0% | 17,4 / 13,2 MiB | 100,7 tok/s | 80,0% |
| Reception | 831 | 80,0% / 80,0% / 80,0% | 30,0% / 50,0% / 50,0% | 17,8 / 13,6 MiB | 103,8 tok/s | 100,0% |
| Hoshimi | 712 | 90,0% / 90,0% / 90,0% | 50,0% / 50,0% / 50,0% | 17,8 / 13,6 MiB | 104,1 tok/s | 100,0% |
| BlindKestrel | 404 | 100,0% / 100,0% / 100,0% | 50,0% / 60,0% / 50,0% | 10,2 / 9,1 MiB | 93,3 tok/s | 100,0% |
| Media | — | 91,8% / 91,8% / 91,8% | 46,0% / 54,0% / 50,0% | — | 93-104 tok/s | 92,0% |

- `K_0` retenido: 12/12 (100,0%) en F16, Q4_0 y Q2_K sobre WebSkill.
- Montaje JIT a mitad de conversación (`n_ctx=1024`, 121 tokens KV previos, sin limpiar KV): 7/9 (77,78%); `PriorMem = True`, `Leak = False`.
- Montaje paralelo de 3 cartuchos en Q4_0: 5/6 (83,33%) unseen a 105,91 tok/s; `K_0` = 11/12 (91,67%).

**gemma-4-E4B-it-Q4_K_M.gguf (`gemma4`, 10 capas objetivo)**

| Dominio | Tok. fuente | Seen F16 / Q4_0 / Q2_K | Unseen F16 / Q4_0 / Q2_K | Tamano Q4_0 / Q2_K | Decode Q4_0 | ICL contexto completo |
|---|---|---|---|---|---|---|
| WebSkill | 677 | 100,0% / 100,0% / 100,0% | 50,0% / 50,0% / 50,0% | 14,1 / 10,2 MiB | 143,7 tok/s | 100,0% |
| CodingSDK | 645 | 100,0% / 100,0% / 100,0% | 30,0% / 30,0% / 30,0% | 14,3 / 10,3 MiB | 133,8 tok/s | 80,0% |
| Reception | 839 | 60,0% / 60,0% / 50,0% | 40,0% / 40,0% / 40,0% | 16,6 / 12,2 MiB | 142,7 tok/s | 100,0% |
| Hoshimi | 715 | 80,0% / 80,0% / 80,0% | 70,0% / 60,0% / 70,0% | 10,4 / 10,7 MiB | 145,4 tok/s | 100,0% |
| BlindKestrel | 386 | 100,0% / 100,0% / 100,0% | 40,0% / 40,0% / 50,0% | 14,4 / 9,7 MiB | 136,6 tok/s | 100,0% |
| Media | — | 88,0% / 88,0% / 86,0% | 46,0% / 44,0% / 48,0% | — | 133-145 tok/s | 96,0% |

- `K_0` retenido: 11/12 (91,67%) en F16, Q4_0 y Q2_K sobre WebSkill.
- Montaje JIT a mitad de conversación (`n_ctx=1024`, 109 tokens KV previos): 5/9 (55,56%); `PriorMem = True`, `Leak = False`.
- Barrido completo de 5 cuantizaciones: WebSkill 100,0% seen / 50,0% unseen en todas las anchuras (Q8_0 a 23,4 MiB, Q3_K a 11,9 MiB).

## Requisitos de hardware

- VRAM adicional por cartucho: 9,1-13,6 MiB en Q2_K, 10,2-17,8 MiB en Q4_0, hasta 23,4 MiB en Q8_0 (según el modelo base).
- La VRAM dominante es la del modelo base: los adaptadores son marginales frente a un 9B en Q5_K_M o un E4B en Q4_K_M.
- GPU validadas: RTX 6000 Ada con CUDA 12.0 y `--ngl 99`. No se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: probable mientras el modelo base quepa; no verificado en la información disponible.
- Despliegue: requiere `llama.cpp-1.0.0` parcheado con `patches/llama_cpp_modelbook.patch`. No se mencionan vLLM, TGI ni Ollama.
- Throughput medido con cartucho montado: 93-104 tok/s en Qwen3.8-9B y 133-145 tok/s en Gemma-4-E4B (Q4_0).
- Base sin montar: 122,64 tok/s (Qwen3.8-9B) y 164,09 tok/s (Gemma-4-E4B).

## Comparativa con modelos similares

| Sistema | Enfoque | Contexto consumido | Entrenamiento | Formato | Licencia |
|---|---|---|---|---|---|
| ModelBook | LoRA en espacio de pesos, forma cerrada | 0 celdas de `n_ctx` | Ninguno (álgebra lineal) | GGUF nativo | MIT |
| Doc-to-LoRA (arXiv 2602.15902) | Hiperred generadora de LoRA | No disponible | Preentrenamiento auxiliar | No disponible | No disponible |
| SHINE (arXiv 2602.06358) | Hiperred de adaptadores | No disponible | Preentrenamiento auxiliar | No disponible | No disponible |
| Cache2LoRA (arXiv 2610.24107) | LoRA derivada de caché | No disponible | No disponible | No disponible | No disponible |

La ventaja declarada por el autor frente a las alternativas es la compilación sin retropropagación ni preentrenamiento auxiliar, junto con el montaje sin reinicio de la caché KV. No se dispone de comparaciones numéricas directas entre ModelBook y estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en Hugging Face; no hay validación externa independiente.
- El rendimiento en preguntas no vistas (unseen) es moderado: 44,0-54,0% de media, frente a 86,0-91,8% en preguntas vistas. No equivale a un ajuste fino supervisado.
- El montaje JIT a mitad de conversación cae al 55,56% en Gemma-4-E4B (5/9), notablemente por debajo del 77,78% de Qwen3.8-9B.
- Requiere un `llama.cpp` parcheado específicamente; no es compatible con builds estándar ni con otros runners sin adaptación.
- Depende de que el modelo base exponga capas `ffn_down` densas; arquitecturas MoE o sin esas capas no están cubiertas.
- Los benchmarks usan ventanas pequeñas (`n_ctx=256` y `n_ctx=1024`) y dominios sintéticos (`WebSkill`, `CodingSDK`, `Reception`, `Hoshimi`, `BlindKestrel`).
- No se documentan idiomas soportados ni evaluación multilingüe.
- No hay datos sobre sesgos, alucinación o robustez en producción.
- La licencia MIT permite uso comercial, pero el parche de `llama.cpp` hereda la licencia del proyecto original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/siasadar/modelbook-llamacpp
- Paper de referencia Doc-to-LoRA: https://arxiv.org/pdf/2602.15902
- Paper SHINE: https://arxiv.org/html/2602.06358v4
- Paper Cache2LoRA: https://arxiv.org/html/2610.24107v1
