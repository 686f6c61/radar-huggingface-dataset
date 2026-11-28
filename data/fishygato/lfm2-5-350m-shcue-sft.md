# fishygato/LFM2.5-350M-shcue-sft

## Resumen

`fishygato/LFM2.5-350M-shcue-sft` es un ajuste fino (SFT) del modelo base `LiquidAI/LFM2.5-350M` de Liquid AI, orientado a una tarea muy concreta: la generacion de comandos de shell para CLI locales y su explicacion token a token. El autor, fishygato, lo publica como pesos GGUF cuantizados con iMatrix, todos por debajo de los 300 MB, pensados para ejecutarse en `llama.cpp` (build b12721 o superior) y distribuidos mediante la herramienta `shcue`.

El modelo parte de una arquitectura de 354.483.968 parametros (aproximadamente 350M) y hereda del base las capacidades linguisticas generales, pero el ajuste lo especializa en la traduccion de lenguaje natural a comandos bash y en la descomposicion explicativa de esos comandos. Su relevancia radica en la eficiencia: ofrece un asistente de shell completamente local, sin dependencia de API, con un peso que cabe en cualquier equipo y con una licencia derivada de la LFM Open License v1.0.

La model card documenta cuatro iteraciones de entrenamiento (v1 a v4) con distintas recetas y conjuntos de datos, e incluye un benchmark interno de 106 casos en el que la version v4 alcanza 99/106 aciertos (93,4%). No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-350M; transformer segun el base, sin detalle en la model card) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (GGUF con iMatrix) |
| Idiomas soportados | no disponible (la tarea objetivo es shell/bash, predominantemente en ingles tecnico) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (compatible con llama.cpp b12721+) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del base LiquidAI/LFM2.5-350M. La model card no detalla la arquitectura interna del base (tipo de transformer, atencion, normalizacion), por lo que ese dato queda como no disponible. El ajuste se realizo sobre conjuntos de datos curados especificos de la tarea `shcue`: generacion de comandos de shell y explicacion token a token de los mismos.

Se documentan cuatro versiones con recetas distintas. La v1 aplica 3 epocas de SFT sobre un conjunto base de 2.000 ejemplos curados (JSON de Stage 1 heredado). La v2 aplica 1 epoca de SFT completo sobre un conjunto ampliado de 2.000 ejemplos (26/30 en el nucleo del benchmark). La v3 aplica 1 epoca de SFT completo sobre un conjunto de 13.000 ejemplos (58/106 en el benchmark). La v4 aplica 2 epocas de SFT completo sobre un conjunto limpio y composicional de 8.000 ejemplos con un scratchpad de planificacion de Stage 1, alcanzando 99/106 (93,4%) en el benchmark interno. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de comandos de shell (bash) a partir de instrucciones en lenguaje natural.
- Explicacion token a token de comandos de shell, orientada a la comprension paso a paso.
- Razonamiento composicional mediante un scratchpad de planificacion (Stage 1) introducido en la version v4.
- Ejecucion local sin conexion, al distribuirse como GGUF para `llama.cpp`.
- Conversacion multi-turno basica (etiqueta `conversational` en los tags del repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.
- Capacidades multilingues: no disponibles (no se documentan idiomas).

## Casos de uso

- Asistente de shell local integrado en terminal: el usuario describe en lenguaje natural lo que quiere hacer y el modelo genera el comando bash correspondiente, ejecutable directamente sin salir del entorno local y sin enviar datos a un servicio externo.
- Explicacion educativa de comandos: dado un comando complejo (por ejemplo, con tuberias y redirecciones), el modelo lo descompone token a token, util para formacion de nuevos desarrolladores o para revisar comandos copiados de terceros.
- Automatizacion de scripts en pipelines de CI/CD: el modelo puede generar fragmentos de shell para tareas de build, test o despliegue, con la ventaja de que el peso de 218-280 MB permite incluirlo en imagenes de contenedor ligeras.
- Herramienta de soporte en entornos air-gapped: al ejecutarse con `llama.cpp` y no requerir red, encaja en maquinas aisladas donde no se permite el uso de APIs externas.
- Generacion de comandos para administracion de sistemas: tareas de gestion de ficheros, permisos, procesos o red, con explicacion adjunta para auditar el comando antes de ejecutarlo.
- Integracion en editores o IDE como plugin de terminal: el tamano reducido y la baja latencia esperada de un modelo de 350M permiten autocompletado o sugerencia de comandos en tiempo real.
- Base para ajustes finos adicionales: al ser un modelo pequeno con licencia abierta, sirve como punto de partida para especializar en otros dominios de CLI (zsh, fish, PowerShell) con coste de entrenamiento bajo.

## Benchmarks y rendimiento

La model card solo reporta un benchmark interno propio de 106 casos de la tarea `shcue`, no benchmarks estandar. Los resultados por version son:

| Version | Receta | Resultado benchmark interno |
|---|---|---|
| v1 | 3 epocas SFT, 2k ejemplos | no disponible |
| v2 | 1 epoca SFT, 2k ejemplos ampliados | 26/30 en el nucleo |
| v3 | 1 epoca SFT, 13k ejemplos | 58/106 (54,7%) |
| v4 | 2 epocas SFT, 8k ejemplos con scratchpad | 99/106 (93,4%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB para los pesos en Q4_K_M (218,7 MiB) y Q6_K (279,8 MiB), mas el overhead de contexto y del runtime de `llama.cpp`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU dedicada e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `llama.cpp` (build b12721+), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| fishygato/LFM2.5-350M-shcue-sft | 354M | no disponible | LFM Open License v1.0 | GGUF | Generacion y explicacion de comandos shell |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | LFM Open License v1.0 | safetensors, GGUF | Proposito general |
| Alternativas especializadas en shell | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en generacion de comandos shell en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: el ajuste SFT lo orienta a la tarea `shcue`; su rendimiento en tareas generales de lenguaje o codigo puede degradarse respecto al base.
- Riesgo de alucinacion en comandos: como cualquier modelo generativo, puede producir comandos sintacticamente validos pero peligrosos o incorrectos; se recomienda revision humana antes de ejecutar en produccion.
- Sesgos conocidos: no documentados en la model card; al heredar del base, podria arrastrar sesgos de sus datos de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados, lo que dificulta planificar su uso en conversaciones largas o en idiomas distintos del ingles tecnico.
- Restricciones de licencia: se distribuye bajo LFM Open License v1.0; es necesario revisar los terminos de uso comercial y conservar el fichero `LICENSE` de Liquid AI en el repositorio derivado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado, sin evidencia externa de uso en produccion.
- Solo se distribuyen pesos GGUF cuantizados; no hay safetensors del ajuste fino en el repositorio, lo que limita el reentrenamiento o la conversion a otros formatos sin partir del base.
- El benchmark reportado (99/106) es interno del autor y no ha sido verificado de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fishygato/LFM2.5-350M-shcue-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: fichero `LICENSE` en el repositorio del modelo base
- Checksums: `SHA256SUMS.txt` en el repositorio
- Herramienta `shcue`: referenciada en la model card (comandos `shcue --update-model`), sin URL publica en la informacion disponible
