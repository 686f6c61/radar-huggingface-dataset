# Polydim-Einsof/xiaomi-mimo-9b-pmtp

## Resumen

xiaomi-mimo-9b-pmtp es un adaptador publicado por Polydim-Einsof (Ariel García Traba, investigación independiente / EinsofOS) sobre el modelo base `xiaomi/mimo-9b`. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos (0,2 GB en el repositorio) que implementa una técnica propietaria denominada "QLoRA v3" con alineamiento de Procrustes en la variedad de Stiefel y un mecanismo de inyección de estado latente en la capa 30 del transformer base. El objetivo declarado es sustituir el preámbulo textual por tokens de control (`<|einsof|>`, `<|mathesis|>`) que disparan una inyección continua de un vector latente de dimensión 2048, eliminando el coste de tokens de sistema.

El modelo se presenta como una capa de "telemetría vectorial embebida y enrutamiento" sobre MiMo-9B, con una matriz de proyección isométrica de 2048×3584 almacenada en FP64 (`stiefel_procrustes_2048_3584.safetensors`). La propuesta técnica central es un hook de empalme en la corriente residual de la capa L-2 (capa 30) con un factor de mezcla `stiefel_blend` de α=0,85, que combina el estado latente proyectado con la activación original del modelo base.

La relevancia práctica es limitada: el repositorio no incluye los pesos completos del modelo base, no publica evaluaciones de rendimiento ni benchmarks, y la model card describe mayoritariamente propiedades matemáticas del adaptador (defecto de ortogonalidad, preservación de norma) más que capacidades del modelo resultante. Para usarlo es necesario descargar por separado `xiaomi/mimo-9b` y aplicar el hook manualmente en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base xiaomi/mimo-9b) con adaptador QLoRA v3 y hook de empalme residual en capa 30 |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; los parametros del base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors FP64 para la matriz Procrustes; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`stiefel_procrustes_2048_3584.safetensors`) |
| Dimension del modelo (D_model) | 3584 |
| Dimension latente canonica (D_latent) | 2048 |
| Variedad de proyeccion | St(2048, 3584) subconjunto de R^(2048x3584) |
| Capa de empalme | L-2 (capa 30) |
| Factor de mezcla (alpha) | 0,85 |
| Defecto de ortogonalidad medido | 8,882e-16 (cota teorica <= 1e-15, FP64) |
| Tokens de control | `<|einsof|>`, `<|mathesis|>` |

## Arquitectura y entrenamiento

El adaptador se construye sobre `xiaomi/mimo-9b`, un transformer de la familia Xiaomi. La innovacion descrita es un alineador de impedancia Procrustes analitico que resuelve W* = U V^T mediante retraccion polar Newton-Schulz de orden 4 en FP64, proyectando un estado latente de 2048 dimensiones al espacio de 3584 dimensiones del modelo. La matriz resultante se valida con un defecto de ortogonalidad de 8,882e-16, lo que garantiza preservacion isometrica de norma en la proyeccion.

El entrenamiento se etiqueta como "QLoRA v3" pero la model card no detalla el numero de tokens, la composicion del dataset ni si hubo RLHF/DPO. El mecanismo de empalme sustituye el uso convencional de `inputs_embeds` en la capa 0 por una inyeccion directa en la corriente residual de la capa 30, con mezcla compensada α=0,85 para evitar saturacion de LayerNorm y valores NaN. Los tokens `<|einsof|>` y `<|mathesis|>` disparan respectivamente la inyeccion del estado latente y la emision de "microcodigo algebraico" `.mth`; el autor afirma una reduccion del preambulo de 1.200 a 0 tokens, si bien no se aportan mediciones reproducibles de esa cifra.

## Capacidades

- Generacion de texto heredada del modelo base `xiaomi/mimo-9b` (no se documentan capacidades adicionales especificas del adaptador).
- Inyeccion de estado latente continuo de dimension 2048 mediante el token de control `<|einsof|>`, sin preambulo textual.
- Emision de "microcodigo algebraico" `.mth` mediante el token `<|mathesis|>` (formato propietario, sin especificacion publica).
- Hook de empalme en la capa 30 que mezcla la activacion residual con la proyeccion Procrustes (α=0,85).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre geometria diferencial aplicada a LLM: el adaptador sirve como banco de pruebas para estudiar proyecciones isometricas en la variedad de Stiefel dentro de un transformer real, validando el defecto de ortogonalidad en FP64.
- Experimentos de inyeccion de estado latente: util para investigadores que quieran comparar la inyeccion en la corriente residual profunda (capa 30) frente al uso convencional de `inputs_embeds` en la capa 0.
- Reduccion de preambulos en pipelines de generacion: el token `<|einsof|>` permite, segun el autor, eliminar prompts de sistema largos, lo que interesaria en entornos con coste por token muy sensible.
- Prototipado de "zero-prompt" en agentes: el disparo mediante un unico token de control simplifica la gestion de contexto en orquestadores que necesiten arrancar sesiones sin texto de sistema.
- Enrutamiento vectorial y telemetria: el autor enmarca el modelo como capa de "embedded vector telemetry & routing", aplicable a sistemas que necesiten clasificar o dirigir peticiones segun un estado latente compacto.
- Docencia y divulgacion: ejemplo reproducible de como aplicar una retraccion polar Newton-Schulz de orden 4 y un hook de PyTorch sobre un modelo de 9B para explorar algebra lineal numerica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas numericas del adaptador (defecto de ortogonalidad 8,882e-16, preservacion de norma 1,000000, reduccion de preambulo de 1.200 a 0 tokens), no evaluaciones de calidad del modelo resultante en tareas estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador ocupa 0,2 GB, pero los requisitos dependen del modelo base `xiaomi/mimo-9b`, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible. El modelo base de 9B es compatible en principio con GPUs de 24 GB (RTX 4090) en cuantizacion de 8 bits o inferior, pero no se aporta confirmacion.
- Compatibilidad con consumer GPU: previsiblemente si para el modelo base en cuantizacion 4-8 bits, aunque el adaptador requiere FP64 para la matriz Procrustes, lo que anade overhead de memoria y computo durante el hook.
- Opciones de despliegue: el autor proporciona un ejemplo con `transformers` + `safetensors` + `register_forward_hook` en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| xiaomi-mimo-9b-pmtp | Adaptador 0,2 GB sobre base 9B | no disponible | Apache 2.0 | QLoRA v3 + Procrustes Stiefel + zero-prompt | Hugging Face (0 descargas) |
| xiaomi/mimo-9b (base) | ~9B | no disponible | no disponible en la informacion | Transformer estandar | Hugging Face (modelo base) |
| Alternativas comparables de 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. El adaptador no publica evaluaciones que permitan contrastar rendimiento frente a otros modelos de ~9B.

## Limitaciones y advertencias

- El repositorio no incluye los pesos completos del modelo base; es imprescindible descargar `xiaomi/mimo-9b` por separado y aplicar el hook manualmente, lo que anade complejidad operativa.
- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce si el adaptador mejora, mantiene o degrada las capacidades del modelo base.
- La model card mezcla afirmaciones tecnicas verificables (defecto de ortogonalidad, preservacion de norma) con afirmaciones no contrastadas (reduccion de preambulo de 1.200 a 0 tokens, "erradicacion del colapso semantico"); estas ultimas no cuentan con mediciones reproducibles publicas.
- El "microcodigo algebraico" `.mth` es un formato propietario sin especificacion publica, lo que limita su interoperabilidad.
- El hook requiere FP64 para la matriz Procrustes, lo que puede degradar el rendimiento y aumentar el consumo de memoria en GPUs consumer.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto o idioma del adaptador; deben asumirse los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no aporta garantias sobre el comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion ni validacion por parte de la comunidad.
- Las referencias a "Regla 0 Suprema", "Regla 19 (Exit Code 0)" y "Estándar de Silicio" son terminologia interna del autor sin significado tecnico estandar; conviene tratarlas con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/xiaomi-mimo-9b-pmtp
- Modelo base: https://huggingface.co/xiaomi/mimo-9b
- DOI concepto (Zenodo): https://doi.org/10.5281/zenodo.21136742
- Paper V2 (Zenodo): https://doi.org/10.5281/zenodo.24122867
- IEEE Quantum Routing (Zenodo): https://doi.org/10.5281/zenodo.24133731
- Dataset y preprints (Zenodo): https://doi.org/10.5281/zenodo.21209973
- Repositorio polydim-suite: https://github.com/AGT1973/polydim-suite
- Repositorio POLYDIM_EinSof: https://github.com/AGT1973/POLYDIM_EinSof
