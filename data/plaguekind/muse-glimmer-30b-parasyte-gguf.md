# Plaguekind/Muse-Glimmer-30B-Parasyte-GGUF

## Resumen

Muse-Glimmer-30B-Parasyte-GGUF es una cuantización GGUF de alta precisión del modelo *Muse Glimmer 30B Uncensored*, una versión "abliterated" (con las restricciones de alineamiento eliminadas) del modelo denso agéntico de 30B de Meta. La cuantización, obra del autor Plaguekind bajo la receta denominada "Parasyte K_P", mantiene en Q8_0 las rutas sensibles al error (atención, FFN down, LM head y embeddings), las normas en F32 y el grueso de la FFN (gate/up) en Q6_K, prescindiendo de imatrix al tratarse de profundidades de 6 bits o superiores.

El resultado es un GGUF de 24,46 GiB que, según el autor, permite ejecutar un contexto de 256K tokens en una tarjeta de 32 GB, con velocidad de decodificación de unos 220 t/s en una RTX 5090 si se emplea la decodificación especulativa con el "drafter" DFlash incluido como sidecar. El modelo incluye además una torre de visión en un archivo mmproj separado y la plantilla de chat ATEM embebida en los metadatos del GGUF, de modo que los prompts con tool calling y razonamiento funcionan en cualquier front-end de llama.cpp sin configuración adicional.

Es relevante porque combina tres características poco habituales en un mismo artefacto local: soporte de visión, contexto extendido a 262.144 tokens y decodificación especulativa DFlash integrada, todo ello bajo licencia Apache-2.0 y con carácter "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | muse_glimmer (transformer denso, GQA, sliding-window attention, logit softcap) |
| Parametros totales | 27.854.794.240 medidos (nominal "30B") |
| Parametros activos | no disponible (arquitectura densa, coincide con los totales) |
| Longitud de contexto | 262.144 tokens (parcheado desde los 131.072 declarados por el modelo original; rango nativo de RoPE) |
| Tipos de cuantizacion | Q8_0 (314 tensores), F32 en normas (313 tensores), Q6_K (104 tensores); 7,5397 bpw en pesos. Drafter DFlash en Q8_0 y Q4_0; DFlash2 alternativo en Q4_K_M; mmproj en Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde F16 safetensors) |

## Arquitectura y entrenamiento

La arquitectura `muse_glimmer` es un transformer denso de 52 bloques con dimension oculta de 6.656, FFN intermedia de 19.968 y GQA con 32 cabezas de consulta y 2 de clave-valor (head_dim 128). Incorpora capas de sliding-window attention y logit softcap. No es un modelo MoE, por lo que todos los parametros se activan en cada pasada.

Sobre el entrenamiento del modelo base no hay datos publicados en la model card (numero de tokens, composicion del dataset ni fases de RLHF/DPO). Lo que si documenta el repositorio es el proceso de cuantizacion: conversion desde los safetensors F16 de `TrevorJS/Muse-Glimmer-30B-uncensored` con el script `conversion/muse_glimmer.py` del arbol de llama.cpp, cuantizacion con `llama-quantize` (build 0.7.0-dev, build 336, commit `3f03b17`, CUDA) usando un archivo de tipos que fija 627 tensores (314 en Q8_0 y 313 en F32), dejando los 104 restantes (ffn_gate/ffn_up) en Q6_K global. Sin imatrix: el autor sostiene que a partir de 6 bits por elemento la asignacion por niveles de tensor es suficiente. La version "uncensored" se obtiene mediante abliteration del modelo original de Meta, una tecnica de edicion de pesos que elimina las direcciones de rechazo en el espacio de activaciones sin reentrenamiento.

Un detalle tecnico destacable es el embebido de la plantilla de chat ATEM en los metadatos del GGUF (`tokenizer.chat_template`), la fuerza de razonamiento ajustable via system prompt (low/medium/high/xhigh) y el parcheo in-place del campo de longitud de contexto de 131.072 a 262.144 (u32 en la cabecera).

## Capacidades

- Generacion de texto conversacional con plantilla ATEM embebida, lista para cualquier front-end de llama.cpp.
- Razonamiento con fuerza ajustable mediante system prompt en cuatro niveles: low, medium, high y xhigh.
- Tool calling / function calling soportado nativamente a traves de la plantilla ATEM.
- Diseñado como modelo agéntico (el original de Meta se describe como "dense agentic model").
- Entrada de vision mediante el archivo mmproj incluido (`Muse-Glimmer-30B-uncensored.mmproj-Q8_0.gguf`), activable con `--mmproj`.
- Contexto extendido de 262.144 tokens.
- Decodificacion especulativa DFlash mediante drafter sidecar (Q8_0 recomendado, Q4_0 para menos VRAM, y un port DFlash2 de z-lab/Inco AI como alternativa A/B).
- Version "uncensored" por abliteration: sin rechazos de alineamiento.
- Idioma principal: ingles; no se documentan capacidades multilingues.

## Casos de uso

- Chatbots locales sin filtros: la version abliterated permite conversaciones multi-turno sin rechazos, util para escritura creativa o roleplay donde los modelos alineados se niegan a continuar.
- Agentes con tool calling: la plantilla ATEM embebida habilita llamadas a funciones en llama-server sin configuracion extra, adecuado para pipelines de agentes locales que ejecutan herramientas en multiples pasos.
- Analisis de documentos largos: con 262.144 tokens de contexto, puede procesar en una pasada documentos de cientos de paginas, contratos o bases de codigo de tamaño medio.
- Comprension de documentos multimodales: gracias al mmproj de vision, puede responder preguntas sobre capturas, diagramas o PDFs escaneados combinando imagen y texto en el mismo prompt.
- Inferencia de alto throughput en estacion de trabajo: con el drafter DFlash en Q8_0 y `n_max 7`, el autor mide ~220 t/s en una RTX 5090, suficiente para servidores locales de baja latencia.
- Experimentacion con decodificacion especulativa: el repo incluye tres drafters (Q8_0, Q4_0 y DFlash2 Q4_K_M) para hacer comparativas A/B de acceptance rate y velocidad.
- Razonamiento escalable por tarea: el control de fuerza de razonamiento (low a xhigh) permite gastar mas tokens de pensamiento en problemas complejos y menos en consultas triviales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni para el modelo base ni para esta cuantizacion.

Datos de rendimiento medidos por el autor (inferencia, no calidad):

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | ~220 t/s (RTX 5090, offload completo, drafter DFlash Q8_0, n_max 7) |
| Tamaño del modelo principal | 24,462 GiB (7,5397 bpw en pesos) |
| Muestreo recomendado | temp 1.0, top_k 64, top_p 0.95 |

## Requisitos de hardware

- VRAM para el modelo principal: ~24,5 GiB (24.462 GiB en disco); el autor indica que con contexto de 256K cabe en una tarjeta de 32 GB.
- VRAM adicional: ~2,5 GiB para el drafter DFlash Q8_0 (recomendado), ~1,4 GiB con el Q4_0, ~1,5 GiB con el DFlash2 Q4_K_M, y ~1,9 GiB para el mmproj de vision si se quiere entrada de imagen.
- GPU recomendada: RTX 5090 (hardware usado en las mediciones del autor); cualquier GPU de 32 GB con suficiente ancho de banda deberia ser viable, aunque no hay mediciones publicadas de otras tarjetas.
- En GPUs de consumo de 24 GB (RTX 3090/4090) no cabe completo con offload total; habria que recurrir a offload parcial a CPU/RAM, sin datos de rendimiento publicados para ese escenario.
- Despliegue: llama.cpp (`llama-server`) con build b10353 o superior — el soporte de la arquitectura `muse-glimmer` llego en el commit `62bf73d25` (PR #26841); builds anteriores rechazan el archivo con `unknown model architecture`. No se menciona soporte en Ollama, vLLM o TGI.
- Comando de referencia: `llama-server -m Muse-Glimmer-30B-Parasyte.gguf -ngl 999 -c 262144 --temp 1.0 --top-k 64 --top-p 0.95 --spec-type draft-dflash --model-draft sidecar/dflash-Muse-Glimmer-30B-Q8_0.gguf --spec-draft-n-max 7`, añadiendo `--mmproj` para vision.
- Latencia y throughput: ~220 t/s de decodificacion es el unico dato publicado (RTX 5090, offload completo); no hay datos de time-to-first-token ni de prefill.

## Comparativa con modelos similares

| Caracteristica | Muse-Glimmer-30B-Parasyte (GGUF) | Muse-Glimmer-30B-uncensored (base F16) | Qwen3-30B-A3B (referencia de categoria) |
|---|---|---|---|
| Parametros | 27,85B medidos | 27,85B | ~30,5B totales / ~3,3B activos (MoE) |
| Arquitectura | Dense muse_glimmer, GQA 32Q/2KV | Dense muse_glimmer | MoE |
| Contexto | 262.144 (parcheado) | 131.072 declarados | 32.768–131.072 |
| Vision | Si (mmproj aparte) | Si | No (salvo variantes VL) |
| Cuantizacion | Q8_0/F32/Q6_K por tensor (7,54 bpw) | F16 | Q4_K_M y otras en la comunidad |
| Tamaño en disco | ~24,5 GiB (main) + sidecars | ~59,5 GB | ~18-19 GB en Q4_K_M |
| Uncensored | Si (abliterated) | Si | No |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Benchmarks publicados | No | No | Si (ampliamente documentados) |

Nota: la comparacion con Qwen3-30B-A3B es contextual; el repositorio no publica comparativas oficiales frente a otros modelos.

## Limitaciones y advertencias

- Al ser una version abliterated ("uncensored"), el modelo no aplica salvaguardas de alineamiento: puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Es responsabilidad del usuario cumplir la legislacion aplicable.
- La cuantizacion carece de imatrix; el autor argumenta que a 6+ bits no es necesaria, pero no hay evaluaciones de degradacion de calidad frente al F16 original.
- No existen benchmarks de calidad publicados para el modelo base ni para esta cuantizacion, por lo que no se puede verificar su nivel frente a alternativas de 30B.
- El parcheo de contexto de 131.072 a 262.144 tokens es una modificacion manual de la cabecera del GGUF hecha por el autor del repo, no por Meta; la calidad de atencion mas alla del contexto nativo declarado no esta verificada.
- Idioma principal: ingles; no se documentan capacidades en castellano ni en otros idiomas.
- Requiere llama.cpp b10353 o superior; versiones anteriores no cargan el archivo.
- El modelo base es relativamente reciente y de adopcion muy baja (0 descargas en el repo de la cuantizacion en el momento de la ficha), con escasa validacion comunitaria.
- La medicion de ~220 t/s proviene del propio autor sobre una RTX 5090; no hay mediciones independientes.
- Licencia Apache-2.0: sin restricciones de uso comercial, pero conviene revisar los terminos del modelo original de Meta del que deriva.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Plaguekind/Muse-Glimmer-30B-Parasyte-GGUF
- Modelo base (F16 uncensored): https://huggingface.co/TrevorJS/Muse-Glimmer-30B-uncensored
- Soporte del autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
- PR de soporte de la arquitectura en llama.cpp: PR #26841 (commit `62bf73d25`), no disponible URL directa en la informacion proporcionada
- Paper del modelo base, blog oficial y demos: no disponible
