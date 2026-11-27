# Deadcracker23/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es un repositorio de conversiones a formato GGUF del modelo borrador (draft model) DFlash 2 para Qwen/Qwen3.8-27B, publicado por el usuario Deadcracker23 como espejo del repositorio original incoai/Qwen3.8-27B-DFlash2-GGUF. No se trata de un modelo de lenguaje autonomo: es un componente auxiliar que se ejecuta dentro de un servidor de decodificacion especulativa y genera borradores de tokens que el modelo objetivo verifica. Su relevancia estriba en que acelera la inferencia de Qwen3.8-27B sin alterar la distribucion de salida.

DFlash 2 es un drafter de difusion por bloques que predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posicion; un selector ligero traza despues una ruta coherente entre ellos. La decodificacion es sin perdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribucion. El repositorio incluye tres cuantizaciones (Q4_K_M, Q8_0 y BF16) con tamanos de 1,1 GB, 2,0 GB y 3,8 GB respectivamente.

El modelo base declarado es Qwen/Qwen3.8-27B, aunque los safetensors del repositorio suman 1.924.404.480 parametros (aproximadamente 1,9 mil millones), coherente con el tamano de un drafter y no con el modelo objetivo de 27B. La licencia es Apache 2.0 y la libreria de referencia es llama.cpp, con soporte introducido mediante el PR #27342.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusion por bloques (block-diffusion) con convoluciones dinamicas de dos tomas y selector de ruta de candidatos; se ejecuta junto a un transformer objetivo |
| Parametros totales | 1.924.404.480 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo borrador disenado especificamente para decodificacion especulativa. En lugar de predecir token a token, predice un bloque entero en una unica pasada y mantiene los mejores candidatos en cada posicion del bloque; un selector ligero recorre despues esos candidatos para construir una secuencia coherente. La columna vertebral incorpora convoluciones dinamicas de dos tomas que evitan que la calidad del borrador se degrade hacia el final del bloque.

El resultado es una decodificacion sin perdida: con muestreo greedy la salida coincide exactamente con la del modelo objetivo y, con muestreo, se preserva su distribucion. El modelo se entrena como drafter del checkpoint Qwen3.8-27B; no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La innovacion principal es el esquema de borrado paralelo por bloques con seleccion de trayectoria, que se apoya en el paper original DFlash (ICML 2026) y en la iteracion DFlash 2 de Inco AI.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Qwen3.8-27B.
- Prediccion paralela de bloques completos de tokens en una sola pasada.
- Seleccion de ruta coherente entre candidatos por posicion mediante un selector ligero.
- Decodificacion sin perdida: salida greedy identica al modelo objetivo y muestreo con distribucion preservada.
- Integracion con llama.cpp mediante el tipo de especulacion `draft-dflash`.
- No es un modelo autonomo: no genera texto por si mismo ni responde a prompts sin el modelo objetivo.
- Soporte de tool calling, agentes, vision o audio: no disponible (no aplica al drafter).
- Capacidades multilingues: no disponible.

## Casos de uso

- Aceleracion de inferencia en produccion de Qwen3.8-27B: desplegando el drafter junto al modelo objetivo en llama-server con `--spec-type draft-dflash` y `--spec-draft-n-max 7`, se reduce el numero de pasos de verificacion por peticion, lo que se traduce en menor latencia por token generado.
- Servidores de chat con presupuesto de latencia ajustado: al mantener una longitud de aceptacion media de 5,13-5,39 tokens por paso de verificacion, el drafter permite sostener conversaciones multi-turno con menor coste computacional que la decodificacion autoregresiva pura.
- Despliegue en hardware con VRAM limitada: la cuantizacion Q4_K_M ocupa 1,1 GB, por lo que el drafter puede residir en la misma GPU que el modelo objetivo cuantizado sin penalizar significativamente el presupuesto de memoria.
- Pipelines de generacion de codigo y razonamiento: con temperatura 1.0, top-p 0.95 y top-k 20 (parametros recomendados de Qwen3.8), el drafter acelera tareas de razonamiento extenso manteniendo la fidelidad de la distribucion del modelo objetivo.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para medir longitud de aceptacion frente a otros drafters sobre el mismo target.
- Prototipado en Apple Silicon: la compilacion con `GGML_METAL=ON` permite probar el esquema en equipos Mac con memoria unificada, usando la variante Q4_K_M o Q8_0.
- Integracion en entornos de CI/CD para pruebas de regresion de latencia: al ser un artefacto GGUF de pocos GB, se puede versionar y desplegar en runners con GPU para validar el rendimiento de la pila de inferencia.

## Benchmarks y rendimiento

Evaluacion publicada en la model card: target `ggml-org/Qwen3.8-27B-GGUF` en Q4_K_M, muestreo con temperatura 1.0, top-p 0.95, top-k 20 y esfuerzo de razonamiento `xhigh`, maximo 2048 tokens nuevos, sobre los primeros ocho ejemplos de test de GSM8K.

| Draft GGUF | Longitud de aceptacion |
|---|---:|
| BF16 | 5,28 |
| Q8_0 | 5,13 |
| Q4_K_M | 5,39 |

La longitud de aceptacion se define como la media por peticion de tokens de completion dividida por pasos de verificacion; cuanto mayor, mejor. No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) del drafter, ya que su calidad se mide por la fidelidad al modelo objetivo y no por exactitud propia.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 1,1 GB en Q4_K_M, 2,0 GB en Q8_0 y 3,8 GB en BF16, adicionales a la memoria requerida por el modelo objetivo Qwen3.8-27B.
- El modelo objetivo Qwen3.8-27B en Q4_K_M requiere su propio presupuesto de VRAM, que no se detalla en la informacion disponible.
- GPU recomendadas: no disponible de forma especifica; el PR de llama.cpp contempla compilacion con CUDA y Metal.
- Cabe en GPU de consumo: si, el drafter por si solo ocupa entre 1,1 y 3,8 GB, aunque el conjunto drafter + target de 27B condiciona el requisito total.
- Opciones de despliegue: llama.cpp (llama-server) con soporte DFlash 2 (PR #27342); otras engines se mencionan en el blog de Inco AI sin detallarse en la informacion disponible.
- Latencia y throughput: no disponible; solo se publica la longitud de aceptacion (5,13-5,39 tokens por paso de verificacion).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3.8-27B-DFlash2 (este repo) | Drafter de difusion por bloques | 1,92 B | no disponible | Apache 2.0 | GGUF en HF, requiere llama.cpp con PR #27342 |
| incoai/Qwen3.8-27B-DFlash2 | Drafter original (checkpoint base) | no disponible | no disponible | Apache 2.0 | HF, repo original |
| Qwen/Qwen3.8-27B | Modelo objetivo (transformer) | 27 B (nominal) | no disponible | no disponible | HF |
| ggml-org/Qwen3.8-27B-GGUF | Modelo objetivo cuantizado | 27 B (nominal) | no disponible | no disponible | GGUF en HF |

No se dispone de datos de benchmarks comparativos frente a otros drafters (por ejemplo, drafters autoregresivos o Medusa) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto sin un modelo objetivo Qwen3.8-27B que verifique los borradores.
- Requiere una compilacion especifica de llama.cpp con soporte DFlash 2 (PR #27342); las versiones estandar no lo cargaran.
- La calidad del borrador se degrada si el modelo objetivo o los parametros de muestreo difieren de los recomendados por Qwen3.8.
- Los benchmarks publicados se limitan a ocho ejemplos de GSM8K; la longitud de aceptacion puede variar en otros dominios y tareas.
- Riesgo de alucinacion: no aplica de forma directa, ya que la decodificacion es sin perdida y la salida final la determina el modelo objetivo; cualquier sesgo proviene del target.
- Idiomas soportados: no disponible; depende del modelo objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.8-27B y del checkpoint original de Inco AI.
- Este repositorio es un espejo no oficial de incoai/Qwen3.8-27B-DFlash2-GGUF; conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.
- No se dispone de informacion sobre contexto maximo, composicion del dataset de entrenamiento ni regimen de entrenamiento del drafter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deadcracker23/Qwen3.8-27B-DFlash2-GGUF
- Repositorio original del drafter: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- GGUF original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- GitHub de DFlash: https://github.com/z-lab/dflash
- PR de llama.cpp con soporte DFlash 2: https://github.com/ggml-org/llama.cpp/pull/27342
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
