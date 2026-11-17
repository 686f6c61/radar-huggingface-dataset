# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-twin

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, desarrollado por el usuario erdem-erdem en el contexto del port del generador DFlash de dyn-spec. No se trata de un modelo conversacional autonomo, sino de un artefacto de entrenamiento: un adaptador LoRA de atencion con rango 32 que se entrena para predecir tokens de forma rapida y alimentar un mecanismo de speculative decoding sobre el modelo objetivo Qwen/Qwen3-8B. El drafter base es `z-lab/Qwen3-8B-DFlash-b16`, sobre el que se aplica esta adaptacion mediante el brazo `direct` en fase de pretraining.

El repositorio incluye el estado del optimizador, los resultados de validacion, evaluaciones offline y la procedencia completa (identidad del store de activaciones, registro del extractor, procedencia del lanzamiento de vLLM y registros de fill). El autor advierte explicitamente que no es un bundle de serving: la exportacion DFlash para servir el modelo aun no esta portada. El checkpoint tiene 2667 updates, semilla 42 y un SHA256 de checkpoint documentado.

Su relevancia es acotada pero tecnica: sirve para reproducir y auditar un experimento de adaptacion de drafters para decodificacion especulativa sobre Qwen3-8B, con metricas de validacion sobre 200 filas fijas que muestran una mejora marginal del score `full_acc` de 0.5265 a 0.5345 entre el update 0 y el 2667, y del ratio de aceptacion tau de 7.703 a 7.903.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de atencion (rango 32) sobre drafter DFlash para decodificacion especulativa; transformer subyacente no detallado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Brazo / etapa | `direct` / `pretraining` |
| Updates de entrenamiento | 2667 |
| Semilla | 42 |
| Git SHA | ee5df42ca454e8605c5af23d3a96189d009df0c5 |
| SHA256 del checkpoint | de566ea523c43db03b41bbce54f4bacb657e1fb815f0f33f03e04a46b76ae0d1 |
| Tamano del repo | 6.6 GB |
| Store de activaciones | erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de atencion con rango 32 aplicado sobre el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`, que actua como generador de tokens candidatos para decodificacion especulativa sobre Qwen3-8B. El entrenamiento corresponde al brazo `direct` en etapa de pretraining, con 2667 updates y semilla 42. El sufijo del nombre (`kl-pm256-twin`) sugiere, por convencion del autor, el uso de una perdida KL y de un parametro pm256, aunque la model card no detalla la formulacion exacta de la funcion de perdida ni la configuracion de entrenamiento mas alla de los metadatos citados.

Los datos de entrenamiento provienen del store de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, cuya composicion concreta (numero de tokens, mezcla de dominios) no se detalla en la informacion disponible. El repositorio conserva la procedencia completa: identidad del store, registro del extractor, procedencia del lanzamiento de vLLM y registros de fill, lo que permite reproducir el pipeline. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa mas alla del propio rol del drafter.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B, con el objetivo de acelerar la inferencia del modelo objetivo.
- Prediccion de continuaciones en dominios chat, code, math y stem, segun las metricas de validacion reportadas.
- Adaptacion via LoRA de atencion con rango 32, lo que permite cargar y descargar el adaptador de forma modular.
- Reproducibilidad completa: checkpoint con estado del optimizador, comandos de entrenamiento (`train_command.txt`), parche (`speculators.patch`) y registros de procedencia.
- Evaluacion offline documentada con coeficientes M4, donantes M7, similitud D13 y coste D14, con metricas por fila.
- No es un modelo conversacional autonomo ni un bundle de serving: no se declaran capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Idiomas soportados no disponibles.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el drafter se usa dentro de un pipeline de speculative decoding para proponer tokens candidatos que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion autoregresiva. El ratio tau reportado (7.903 en el update 2667) indica el numero medio de tokens aceptados por paso.
- Investigacion sobre decodificacion especulativa: el repositorio conserva el estado del optimizador, los comandos de entrenamiento y el parche, lo que permite reproducir el experimento y comparar variantes de adaptacion de drafters.
- Auditoria de procedencia de experimentos: los registros de store, extractor, vLLM y fill permiten verificar la cadena de datos y configuracion usada en el entrenamiento, util en entornos con requisitos de trazabilidad.
- Evaluacion comparativa de drafters: las metricas de validacion sobre 200 filas fijas (full_acc, tau, chat, code, math, stem) permiten comparar esta adaptacion con otras variantes del mismo pipeline.
- Fine-tuning de drafters sobre dominios concretos: el adaptador LoRA de rango 32 puede reentrenarse sobre stores de activaciones especificos (por ejemplo, mezclas con mayor peso en codigo) para mejorar la aceptacion en ese dominio.
- Analisis de coste de serving: los registros de coste D14 y las metricas de timing (`timing.json`) permiten estimar el impacto del drafter en latencia y throughput antes de portar la exportacion de serving.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | tau (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5345 | 7.903 | 0.3520 | 0.6064 | 0.6844 | 0.4951 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio es un checkpoint de entrenamiento de 6.6 GB con estado del optimizador, no un bundle de serving.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: la exportacion DFlash para serving no esta portada; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto. El repositorio menciona procedencia de lanzamiento de vLLM durante la extraccion de activaciones, no para servir el drafter.
- Latencia y throughput estimados: no disponibles; solo se reporta el ratio tau de aceptacion (7.903 en el update 2667).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-twin | no disponible (LoRA r32 sobre DFlash) | no disponible | full_acc 0.5345, tau 7.903 (200 filas) | no disponible | Hugging Face, checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 (drafter base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B (modelo objetivo) | 8B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables para establecer una comparativa de rendimiento fiable con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un bundle de serving: la exportacion DFlash para servir el modelo aun no esta portada, por lo que no puede desplegase directamente en produccion.
- El checkpoint incluye estado del optimizador y pesa 6.6 GB, lo que lo hace inadecuado para inferencia ligera sin conversion previa.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; conviene contactar al autor antes de cualquier uso en produccion.
- Idiomas soportados no disponibles: no hay garantia de cobertura multilingue mas alla de la mezcla del store de activaciones.
- Mejora marginal entre update 0 y 2667 (full_acc +0.008, tau +0.200), lo que sugiere que el beneficio de la adaptacion es limitado en esta configuracion.
- Riesgo de sesgos y alucinaciones: no evaluado en la informacion disponible; el drafter hereda las caracteristicas del modelo objetivo Qwen3-8B y del store de activaciones.
- Dependencia estricta del drafter base `z-lab/Qwen3-8B-DFlash-b16` en el commit indicado y del modelo objetivo Qwen3-8B; cambios de version pueden invalidar la reproducibilidad.
- Las metricas de validacion se calculan sobre 200 filas fijas, una por LoRA; no constituyen una evaluacion exhaustiva de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256-twin
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
