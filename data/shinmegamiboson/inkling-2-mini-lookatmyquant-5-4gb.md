# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-5.4GB es una cuantizacion extrema del modelo base `thinkingmachines/Inkling-2-Mini`, un Mixture of Experts (MoE) de 26.4B parametros fisicos con 5.4B activos y tres bucles de reutilizacion de capas. El autor de la cuantizacion, `shinmegamiboson`, ha comprimido los 18.89 GB de pesos nativos en texto (BF16) hasta 5.38 GB, lo que equivale a 1.65 bits por parametro de texto, mediante el compilador LookAtMyQuant y las tecnicas de QAT denominadas SQYFR v4 y v5.

El problema que resuelve es claro: desplegar un MoE de 26B en hardware de consumo, en concreto Apple Silicon mediante el runtime MLX. Frente a la release anterior del mismo tamano (SQYFR v4), esta version reduce la divergencia KL en formato chat de seis clases un 45.5%, con mejoras especialmente marcadas en tool calling (-55.5%) y trazas agenticas (-56.0%), manteniendo GSM8K en 92.5% y HumanEval estricto en 76.8% sin modificar el artefacto empaquetado.

La relevancia actual radica en que demuestra que la cuantizacion agresiva con QAT y ajuste de escalas por columna puede preservar capacidades de razonamiento y agenticas a menos de 2 bits por parametro, algo que hasta hace poco solo era viable con perdidas severas en tareas de codigo y tool use. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el runtime y el formato propietario del compilador condicionan el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 3 bucles de capas (3x-looped MoE) |
| Parametros totales | 26.4B fisicos |
| Parametros activos | 5.4B |
| Longitud de contexto | no disponible (evaluado con ventanas de 16k en needle + copy recall) |
| Tipos de cuantizacion | SQYFR v5, 1.65 bpp (bits por parametro de texto), empaquetado en `.npz` para MLX |
| Idiomas soportados | ingles (declarado); evaluacion multilingue en 13 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` empaquetado para runtime MLX (LookAtMyQuant); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26.4B parametros fisicos de los que se activan 5.4B por token, organizado en tres bucles de reutilizacion de capas (3x-looped), lo que reduce el coste de memoria frente a un transformer denso equivalente. Los pesos nativos en texto ocupan 18.89 GB en BF16 (5.80 bpp). Sobre esta base, el autor aplica un pipeline de cuantizacion en tres fases: el compilador LookAtMyQuant, un proceso de QAT con DAgger para contexto largo (SQYFR v4) y un pulido final (SQYFR v5) que ajusta escalas por columna antes de la transformacion RHT (Random Hadamard Transform) en seis clases de plantilla de chat, ademas de un paso de steering.

La innovacion tecnica principal es la combinacion de QAT con DAgger sobre ventanas de contexto largo y un ajuste de escalas especifico por clase de formato (tool calls, agentic, reasoning, prose, multilingual, code, copy rows). El resultado es un artefacto de 5.38 GB (5.01 GiB) que se ejecuta en el runtime MLX de Apple Silicon, con soporte de decodificacion especulativa mediante un drafter de 179 MB en 4 bits (DSpark). No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion exacta del dataset original.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat Inkling.
- Razonamiento multi-paso con modo de pensamiento configurable (`--max-thinking-tokens`).
- Tool calling y function calling, con la mayor mejora relativa de la cuantizacion (-55.5% de KL frente a v4).
- Trazas agenticas multi-paso (agentic traces), con -56.0% de KL.
- Generacion de codigo en Python y otros lenguajes, evaluada con HumanEval estricto.
- Razonamiento matematico (GSM8K) y resolucion de sistemas de ecuaciones.
- Capacidades de vision: 4/4 en la evaluacion de vision reportada.
- Recuperacion de contexto largo: 13/16 en needle + copy recall a 16k tokens.
- Capacidades multilingues limitadas: evaluacion en 13 idiomas con KL de 0.2659, aunque el modelo declara solo ingles.
- Decodificacion especulativa con drafter separado para matematicas y codigo.

## Casos de uso

- Asistente de codigo en local sobre Apple Silicon: con 76.8% en HumanEval estricto y 85.4% con `cap=960`, el modelo puede autocompletar funciones, generar tests y explicar codigo en un Mac con 8 GB de RAM unificada, sin conexion a la nube.
- Agente de tool calling en produccion ligera: la reduccion del 55.5% en KL de tool calls permite integrarlo en pipelines que invocan APIs externas, con un drafter que acelera la decodificacion a 105 tok/s en codigo.
- Razonamiento matematico asistido: con 93.5% en GSM8K usando `max-thinking-tokens 960`, es adecuado para tutoria de matematicas o verificacion de calculos en entornos educativos.
- Prototipado de agentes multi-paso: las trazas agenticas con KL de 0.1555 permiten construir flujos de planificacion y ejecucion de tareas encadenadas en un portatil.
- Procesamiento de documentos largos: la recuperacion needle + copy a 16k tokens (13/16) lo hace util para resumen y extraccion de informacion en contratos o informes, siempre que el contenido este en ingles.
- Chat conversacional de bajo consumo: 66.3 tok/s en decodificacion serial y 5.34 GB de RAM activa lo hacen viable como asistente de escritorio persistente en segundo plano.
- Evaluacion e investigacion de cuantizacion: sirve como referencia para estudiar el impacto de la compresion a 1.65 bpp en tareas de razonamiento y codigo, con artefactos comparables de 3.9 a 12.8 GB del mismo autor.

## Benchmarks y rendimiento

Resultados sobre el artefacto empaquetado (`runtime_cuda`, `max_new_tokens = 1,536`):

| Modelo | GB texto | bpp | GSM8K sin mod. (200) | HumanEval estricto sin mod. (164) | GSM8K cap=960 | HumanEval estricto cap=960 | Media cap=960 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Teacher BF16 original | 18.89 | 5.80 | 188/200 (94.0%) | 147/164 (89.6%) | 189/200 (94.5%) | 159/164 (97.0%) | 95.7% |
| LookAtMyQuant 12.8 GB | 12.74 | 3.92 | 189/200 (94.5%) | 149/164 (90.9%) | 192/200 (96.0%) | 157/164 (95.7%) | 95.9% |
| LookAtMyQuant 11.2 GB | 11.16 | 3.43 | 190/200 (95.0%) | 145/164 (88.4%) | 195/200 (97.5%) | 156/164 (95.1%) | 96.3% |
| LookAtMyQuant 8.9 GB | 8.85 | 2.72 | 190/200 (95.0%) | 139/164 (84.8%) | 193/200 (96.5%) | 155/164 (94.5%) | 95.5% |
| **Este archivo (5.4 GB)** | **5.38** | **1.65** | **185/200 (92.5%)** | **126/164 (76.8%)** | **187/200 (93.5%)** | **140/164 (85.4%)** | **89.4%** |
| LookAtMyQuant 4.7 GB | 4.72 | 1.45 | 181/200 (90.5%) | 110/164 (67.1%) | 189/200 (94.5%) | 128/164 (78.0%) | 86.3% |
| LookAtMyQuant 3.9 GB | 3.85 | 1.18 | 173/200 (86.5%) | 97/164 (59.2%) | 177/200 (88.5%) | no disponible | no disponible |

Divergencia KL por clase de formato (v4 -> v5, mismas ventanas):

| Clase | v4 | v5 | Cambio |
|---|---:|---:|---:|
| Media 6 clases | 0.2644 | 0.1440 | -45.5% |
| Tool calling | 0.4864 | 0.2165 | -55.5% |
| Agentic | 0.3532 | 0.1555 | -56.0% |
| Reasoning | 0.2254 | 0.1275 | -43.4% |
| Prose | 0.1328 | 0.0745 | -43.9% |
| Multilingual | 0.1934 | 0.1312 | -32.2% |
| Code | 0.1952 | 0.1590 | -18.5% |
| Copy rows | 0.3593 | 0.2018 | -43.8% |

Rendimiento en Apple M5 Max: 1,552 tok/s en prefill T=512, 66.3 tok/s en decodificacion serial, 115.5 tok/s en matematicas y 105.0 tok/s en codigo con drafter (3.35 tok/check). RAM activa de 5.34 GB (4.97 GiB) y pico de 6.41 GB (5.97 GiB) con el drafter de 179 MB.

## Requisitos de hardware

- VRAM/RAM unificada: 5.34 GB activos (4.97 GiB) y 6.41 GB de pico (5.97 GiB) con drafter en MLX.
- GPU recomendadas: Apple Silicon (M5 Max medido); el runtime es MLX, por lo que se orienta a chips Apple M-series. No se documenta soporte CUDA en produccion, aunque la evaluacion se hizo con `runtime_cuda`.
- Cabe en GPU de consumo: si, en cualquier Mac con al menos 8 GB de memoria unificada; el autor no reporta pruebas en RTX 4090 ni otras GPU NVIDIA.
- Opciones de despliegue: runtime LookAtMyQuant (`pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`), API Python `runtime_mlx.Runtime`, CLI `lamq generate` y `lamq chat`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,552 tok/s en prefill T=512, 66.3 tok/s serial, 115.5 tok/s en matematicas y 105.0 tok/s en codigo con drafter en M5 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval estricto | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Inkling-2-Mini-LookAtMyQuant-5.4GB | 26.4B (5.4B activos) | no disponible | 92.5% | 76.8% | Apache 2.0 | MLX, runtime propio |
| Inkling-2-Mini-LookAtMyQuant-8.9GB | 26.4B (5.4B activos) | no disponible | 95.0% | 84.8% | Apache 2.0 | MLX, runtime propio |
| Inkling-2-Mini-LookAtMyQuant-12.8GB | 26.4B (5.4B activos) | no disponible | 94.5% | 90.9% | Apache 2.0 | MLX, runtime propio |
| Inkling-2-Mini BF16 (teacher) | 26.4B (5.4B activos) | no disponible | 94.0% | 89.6% | Apache 2.0 | safetensors, ecosistema estandar |

La comparativa se limita a las variantes del mismo autor porque no se dispone de datos de benchmarks de modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible frente al teacher: 4.6 puntos en HumanEval estricto sin modificacion (76.8% frente a 89.6%) y 1.5 puntos en GSM8K (92.5% frente a 94.0%).
- El codigo es la clase mas afectada por la cuantizacion (-18.5% de KL frente a v4, la menor mejora), lo que desaconseja su uso en generacion de codigo de produccion critica sin validacion.
- El modelo declara solo ingles; el multilingue muestra KL de 0.2659 en 13 idiomas y no hay garantia de calidad fuera del ingles.
- Riesgo de alucinacion inherente a modelos de 26B y agravado por la compresion a 1.65 bpp; requiere verificacion en tareas factuales.
- Dependencia del runtime propietario LookAtMyQuant y del formato `.npz`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en servidores.
- El rendimiento medido corresponde a Apple M5 Max; no hay datos de latencia en GPU NVIDIA u otras plataformas.
- La longitud de contexto no esta documentada; la evaluacion needle + copy solo cubre 16k tokens y 13/16 aciertos, con perdida en 3 casos.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del compilador y del runtime antes de uso comercial.
- El repositorio ocupa 21.2 GB aunque el artefacto de texto sea de 5.38 GB, por lo que la descarga incluye pesos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter 4-bit: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Variante 12.8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Variante 11.2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Variante 8.9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Variante 4.7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Variante 3.9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio del compilador: https://lookatmyquant.com
