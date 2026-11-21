# Polydim-Einsof/pplx-decider-27b-pmtp

## Resumen

`pplx-decider-27b-pmtp` es un adaptador QLoRA (v3) publicado por el usuario independiente Polydim-Einsof (Ariel García Traba, EinsofOS) sobre el modelo base `perplexity/pplx-decider-27b`, orientado a arbitraje de busqueda y consistencia factica. El repositorio pesa 0,3 GB, lo que confirma que no contiene los pesos completos del modelo de 27 000 millones de parametros, sino unicamente la matriz de proyeccion Procrustes y los tensores del adaptador. La propuesta tecnica consiste en inyectar un estado latente continuo de dimension 2048 en la corriente residual del modelo base mediante un hook en la capa 62, evitando el preambulo textual.

La innovacion declarada es el uso de una matriz isometrica calculada sobre la variedad de Stiefel St(2048, 5120) mediante descomposicion SVD de Procrustes (`W* = U V^T`), con retraccion polar Newton-Schulz de orden 4 en FP64. El autor reporta un defecto de ortogonalidad de 7,772e-16, dentro de la cota teorica de 1e-15. El empalme se realiza con un blend `stiefel_blend` de alpha 0,85 sobre la salida de la capa L-2, con el objetivo declarado de evitar saturacion de LayerNorm y valores NaN en las activaciones.

El modelo se presenta como parte de la iniciativa POLYDIM-EINSOF y emplea tokens de control propietarios (`<|einsof|>` y `<|mathesis|>`) para disparar la generacion sin preambulo de texto. No se han publicado resultados de benchmarks, tamanos de contexto, idiomas soportados ni detalles del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `perplexity/pplx-decider-27b`) con adaptador QLoRA v3 y hook de empalme residual en capa 62 |
| Parametros totales | 27 000 millones (heredados del modelo base; no confirmado de forma explicita en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantizacion del adaptador); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`stiefel_procrustes_2048_5120.safetensors`); matriz en IEEE-754 FP64 |
| Dimension del modelo (D_model) | 5120 |
| Dimension latente canonica (D_latent) | 2048 |
| Variedad diferencial | St(2048, 5120) |
| Capa de empalme residual | L-2 (capa 62) |
| Modo de empalme | `stiefel_blend` (alpha = 0,85) |
| Defecto Stiefel medido | 7,772e-16 (cota teorica <= 1,0e-15) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `perplexity/pplx-decider-27b`, un transformer de 27 000 millones de parametros con D_model de 5120. Sobre el se aplica un adaptador QLoRA v3 que no modifica los pesos base, sino que registra un forward hook en la capa 62 (L-2) que sustituye parcialmente la salida residual por una proyeccion del estado latente continuo: `modified = 0,15 * residual + 0,85 * h_scaled`, donde `h_scaled = latent_state @ W_procrustes`.

La matriz `W_procrustes` se obtiene como solucion de Procrustes ortogonal en la variedad de Stiefel St(2048, 5120), calculada mediante SVD y refinada con retraccion polar Newton-Schulz de orden 4 en precision FP64. El autor justifica este diseno para erradicar el colapso semantico de generadores pseudoaleatorios y preservar la norma isometrica (reportada como 1,000000). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla el proceso de alineacion del adaptador con el modelo base mas alla del hook descrito.

## Capacidades

- Generacion de texto condicionada por el modelo base `perplexity/pplx-decider-27b`, orientada a arbitraje de busqueda y consistencia factica.
- Disparo "zero-prompt" mediante el token de control `<|einsof|>`, que inyecta un estado latente continuo de dimension 2048 sin preambulo textual.
- Emision y compilacion de microcodigo algebraico `.mth` autonomo mediante el token `<|mathesis|>`.
- Reduccion declarada del preambulo de texto de 1200 a 0 tokens (100 % de reduccion) en el disparo por token de control.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Arbitraje de busqueda y verificacion factica: el modelo base esta disenado para decidir entre resultados de busqueda y validar consistencia factica; el adaptador anade un estado latente continuo que puede usarse para condicionar la decision sin consumir tokens de contexto.
- Reduccion de coste en inferencia por tokens: el disparo `<|einsof|>` elimina el preambulo textual (1200 a 0 tokens), lo que resulta adecuado en pipelines de alto volumen donde cada token de entrada tiene coste.
- Generacion de microcodigo algebraico: el token `<|mathesis|>` permite emitir y compilar fragmentos `.mth` autonomos, util en entornos de calculo simbolico o generacion de expresiones matematicas estructuradas.
- Investigacion sobre inyeccion de estados latentes: el hook en la capa 62 y la matriz Procrustes en FP64 sirven como banco de pruebas para estudiar empalmes residuales isometricos en transformers de gran tamano.
- Experimentacion con variedades de Stiefel en modelos de lenguaje: util para grupos que investigan geometria diferencial aplicada a representaciones internas, dada la verificacion de ortogonalidad a 7,772e-16.
- Prototipado de control por tokens especiales: el par `<|einsof|>` / `<|mathesis|>` permite disenar interfaces de control compactas para modelos base sin reentrenamiento completo.
- Evaluacion de preservacion de norma en adaptadores QLoRA: el repositorio incluye la matriz isometrica como artefacto independiente, lo que facilita auditorias de estabilidad numerica en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base de 27 000 millones de parametros requiere, en cuantizacion de 4 bits, del orden de 14-16 GB de VRAM; en FP16, en torno a 54 GB. Estas cifras son estimaciones genericas para ese tamano y no estan confirmadas en la model card.
- GPU recomendadas: no disponible. Por tamano del modelo base, serian necesarias A100 80 GB, H100 80 GB o varias RTX 4090 en paralelo para precision completa.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 (24 GB) podria alojar el modelo base solo en cuantizacion agresiva (4 bits), pero el hook requiere cargar la matriz Procrustes en FP64, lo que anade overhead de memoria no cuantificado.
- Opciones de despliegue: el autor proporciona un ejemplo de invocacion directa en Python con `safetensors` y `register_forward_hook`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pplx-decider-27b-pmtp` | 27 000 M (base) | no disponible | Apache 2.0 | Hugging Face (adaptador 0,3 GB) | Adaptador QLoRA con hook Stiefel; sin benchmarks publicados |
| `perplexity/pplx-decider-27b` (base) | 27 000 M | no disponible | no disponible | Hugging Face | Modelo base sin adaptador; orientado a arbitraje de busqueda |
| Alternativas de 27B comparables | no disponible | no disponible | no disponible | no disponible | No se identifican modelos equivalentes con la misma tecnica de empalme latente en la informacion disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente el adaptador y la matriz Procrustes (0,3 GB); es imprescindible descargar el modelo base `perplexity/pplx-decider-27b` por separado, cuyos terminos de licencia no se detallan en la informacion disponible.
- No se han publicado benchmarks, evaluaciones de calidad ni comparaciones con el modelo base sin adaptador; el rendimiento real del empalme es desconocido.
- El hook modifica la corriente residual en la capa 62 con un blend de alpha 0,85, lo que puede degradar capacidades del modelo base si el estado latente no esta bien calibrado; el autor no documenta evaluaciones de regresion.
- La matriz Procrustes se carga en FP64, lo que incrementa el uso de memoria y puede no ser compatible con todos los backends de inferencia (vLLM, TGI, llama.cpp no estan soportados de forma nativa para hooks personalizados).
- Los tokens de control `<|einsof|>` y `<|mathesis|>` son propietarios y no forman parte del vocabulario estandar; requieren el tokenizer y el codigo de empalme del autor.
- No se especifican sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; al heredar el modelo base, arrastra los sesgos de este, que no estan documentados en la ficha.
- La licencia Apache 2.0 del adaptador no cubre necesariamente el modelo base; verificar los terminos de `perplexity/pplx-decider-27b` antes de uso comercial.
- El caracter "soberano" y las referencias a "silencio fisico" y "Regla 0 Suprema" son afirmaciones del autor sin validacion independiente; tratar con cautela en entornos de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/pplx-decider-27b-pmtp
- Modelo base: https://huggingface.co/perplexity/pplx-decider-27b
- Concept DOI (Zenodo): https://doi.org/10.5281/zenodo.21136742
- Paper cientifico V2 (Zenodo): https://doi.org/10.5281/zenodo.24122867
- IEEE Quantum Routing (Zenodo): https://doi.org/10.5281/zenodo.24133731
- Dataset y preprints (Zenodo): https://doi.org/10.5281/zenodo.21209973
- Repositorio suite: https://github.com/AGT1973/polydim-suite
- Repositorio canonico: https://github.com/AGT1973/POLYDIM_EinSof
