# 0xSojalSec/GLM-5.3-EXL3-TR3-3.42bpw

## Resumen

GLM-5.3-EXL3-TR3-3.42bpw es una cuantizacion de trellis (EXL3/TR3) del modelo zai-org/GLM-5.3, un MoE de la familia glm_moe_dsa con 78 capas mas MTP y 256 expertos enrutados por capa. La publica el usuario 0xSojalSec como checkpoint "data-free": la codificacion se hace con Hessiano identidad (H=I) y solo rotaciones y busqueda de trellis, sin capturar calibracion en ningun punto. El resultado ocupa 355,3 GB en safetensors y esta pensado para servirse con TP4 sobre 4 GPU de 96 GB (clase RTX PRO 6000 Blackwell) con cache KV en FP8.

El interes practico del checkpoint es que reduce el peso de los expertos enrutados a una media de 3,42 bits por parametro (148 expertos en K3 y 108 en K4 por capa, libro de codigos mcg) manteniendo en BF16 byte-exacto los componentes criticos: MLP denso de las capas 0-2, toda la atencion, normas, embeddings, lm_head, mlp.gate y eh_proj. Los expertos compartidos se guardan tambien en BF16 y se cuantizan online a K6 durante el servicio. Segun las mediciones del autor, la KLD frente al profesor BF16 sellado es de 0,024105 con cache KV FP8, practicamente identica a la referencia CN3 de @dareposte (0,023966).

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta por capas poco habitual (tiers K3/K4 seleccionados por MSE de ida y vuelta, con mapa de bits por experto); por otro, advierte de que el checkpoint no es cargable por un exllamav3 estandar: requiere un parche de tiers de proyeccion mixed-K, y un cargador que asuma un K uniforme por capa produce "fluent garbage". El autor reporta una cualificacion independiente turnkey con envolvente de 393.216 tokens y 227,55 tok/s de salida a concurrencia 8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa), 78 capas + MTP, 256 expertos enrutados por capa |
| Parametros totales | 177.517.012.992 (177,5B) segun safetensors; la model card declara 755B para el modelo base GLM-5.3 (discrepancia no explicada, ver limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | 393.216 tokens (envolvente cualificada medida, no el maximo arquitectonico); la envolvente heredada de GLM-5.2 de 520.192 tokens provoca OOM en este checkpoint |
| Tipos de cuantizacion | EXL3 trellis mixto: K3 (148 expertos/capa) + K4 (108 expertos/capa), 3,42 bpw promedio, libro de codigos mcg; expertos compartidos K6 online; resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other, license_name: glm-5.3) |
| Formato de pesos | safetensors (shards BF16 carrier + payloads trellis por capa), mas tier_bitmap.json, MANIFEST.sha256 y config.json.hybrid_tr3_tail |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo glm_moe_dsa con 78 capas mas una cabeza MTP (multi-token prediction) y 256 expertos enrutados por capa. Esta publicacion concreta no reentrena nada: es una cuantizacion del checkpoint zai-org/GLM-5.3, que a su vez comparte modelo base con GLM-5.2. Segun la model card del upstream, "GLM-5.3 usa el mismo modelo base que GLM-5.2; todas las ganancias vienen del post-entrenamiento", con mejora especifica en codigo complejo y tareas de horizonte largo. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento ni si hubo RLHF o DPO.

La innovacion tecnica esta en el esquema de cuantizacion. La codificacion es data-free (Hessiano identidad) y determinista: las semillas se derivan de (capa, experto, proyeccion, rango) con seed_base 20260711. Cada capa aplica primero una pasada K3 a todos los expertos; despues se seleccionan los 108 expertos con mayor MSE relativo de ida y vuelta (64 de la pasada a 3,25 y los siguientes 44 en una pasada delta, con semillas y maquinaria identicas) y se recodifican a K4. Los tiers quedan registrados por experto en tier_bitmap.json y la procedencia en config.json.hybrid_tr3_tail. Para el servicio se usa un stack de linaje exllamav3-b12x/sparkinfer con TP4 mas DCP4 y MTP3 probabilistico nativo, cache KV NVFP4 de tokens dinamicos con RoPE en FP8 en el perfil cualificado, y FP8 KV como configuracion de referencia en las mediciones de KLD.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con contrato de chat compatible con endpoints estilo OpenAI.
- Razonamiento explicito: el perfil cualificado supera los contratos de reasoning, streaming y salida estructurada.
- Salida estructurada estricta: se validaron contratos de JSON estricto en el arranque.
- Tool calling / function calling: los contratos de tool-use aplicables de la API OpenAI pasaron la cualificacion.
- Recuperacion en contexto muy largo: 15/15 hechos en recuperacion a cinco profundidades sobre un documento de 389.959 tokens (tokenizer-exact), dentro de la envolvente de 393.216 tokens.
- Codigo: el modelo base declara mejora en codigo complejo y tareas de horizonte largo respecto a GLM-5.2; no se aportan cifras de HumanEval ni similares para esta cuantizacion.
- Decodificacion especulativa nativa mediante MTP3 (prediccion multi-token probabilistica), integrada en el stack de servicio.
- Sin capacidades de vision ni audio declaradas en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas explicitamente, aunque el soporte de tool calling y razonamiento largo es compatible con ese uso.

## Casos de uso

- Asistencia sobre documentacion tecnica extensa: con 393.216 tokens de envolvente cualificada y 15/15 hechos recuperados a cinco profundidades en un documento de 389.959 tokens, permite cargar manuales o bases de codigo completas en una sola pasada sin pipeline de RAG.
- Revision de contratos y documentacion legal densa: la propia model card identifica la ventana de registro legal como la mas dificil en KLD, de modo que es un caso de uso viable pero que exige validacion propia antes de produccion.
- Agentes de codigo con tool calling: el stack cualificado pasa los contratos de tool-use y salida estructurada, lo que permite integrar el modelo como planificador que emite llamadas a funciones en JSON estricto dentro de un bucle de agente.
- Generacion de codigo en produccion: la mejora declarada del base en codigo complejo y tareas de horizonte largo lo hace adecuado para refactors y migraciones largas, siempre que se despliegue con el runtime parcheado y se mida la calidad tras la cuantizacion.
- Servicio conversacional multiusuario: con 227,55 tok/s de salida agregados a concurrencia 8 y 72/72 peticiones correctas a temperatura 1 en C1/C4/C8, soporta un endpoint de chat con varias sesiones simultaneas por nodo de 4 GPU.
- Analisis y resumen de corpus bilingues ingles-chino: es el unico par de idiomas declarado, util para pipelines de traduccion interna, resumen y extraccion de datos en empresas con documentacion en ambos idiomas.
- Trazas de razonamiento para evaluacion de modelos: el perfil expone contrato de reasoning con streaming, lo que permite recoger cadenas de pensamiento para auditoria o destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card remite a la ficha del modelo base para benchmarks y al informe tecnico arXiv:2602.15763. Los unicos datos numericos publicados son mediciones de divergencia (KLD) y de cualificacion de servicio.

KLD completa de vocabulario, teacher-forced, KL(profesor || estudiante) contra logits BF16 sellados de GLM-5.3; 4 ventanas retenidas x 2.047 posiciones x 154.880 de vocabulario, log-softmax en fp32 en ambos lados:

| Cuantizacion de pesos | Modo KV | Este trabajo | CN3 (@dareposte) | Delta |
|---|---|---:|---:|---:|
| 3,42 bpw | fp8 | 0,024105 | 0,023966 | -0,6% |
| 3,25 bpw | fp8 | 0,026103 | 0,026776 | +2,6% |
| 3,25 bpw | nvfp4 | 0,035741 | 0,036661 | +2,6% |
| 3,42 bpw | nvfp4 | 0,037757 | 0,037060 | -1,8% |
| 3,42 bpw | nvfp4+rope8 | 0,039518 | 0,037695 | -4,6% |
| 3,25 bpw | nvfp4+rope8 | no medido | 0,039396 | solo CN3 |

Lectura del autor: el salto de pesos de 3,25 a 3,42 bpw cambia la KLD en solo ~0,002, mientras que el paso de KV FP8 a NVFP4 cuesta ~7 veces mas (~0,014); bajo KV NVFP4 la diferencia entre cuantizaciones de peso se diluye. La desviacion tipica entre ventanas (~0,02-0,03) se atribuye a heterogeneidad del corpus: dialogo, prosa explicativa y trazas de razonamiento miden casi transparentes.

Cualificacion de servicio (2026-08-29, 4x RTX PRO 6000 Blackwell Server Edition de 97.887 MiB, NVIDIA 595.58.03 / CUDA 13.2):

| Metrica | Resultado |
|---|---|
| Topologia | TP4 + DCP4, shared experts K6 online, MTP3 probabilistico nativo, expertos enrutados K3/K4 mixtos |
| KV | NVFP4 de tokens dinamicos con RoPE FP8, C8 |
| Envolvente cualificada | 393.216 tokens y 3.415.867.392 bytes de cache KV por GPU |
| Decodificacion a temperatura 1 | 72/72 peticiones correctas en C1/C4/C8; 227,55 tok/s de salida en C8 |
| Recuperacion | 15/15 hechos a cinco profundidades en documento de 389.959 tokens |
| Memoria libre observada | al menos 665 MiB tras la compilacion de primer uso y muestreo C8 |
| Arranque | checks aritmeticos, factuales e instruccionales, JSON estricto y retrieval a 32K superados |
| Envolvente de 520.192 tokens | descartada: pasa checks deterministas de arranque pero OOM en la primera compilacion del sampler a temperatura 1 |

## Requisitos de hardware

- VRAM: el repositorio ocupa 355,3 GB. Con TP4 son ~88,8 GB por GPU, mas cache KV (3.415.867.392 bytes por GPU en la envolvente cualificada). Se necesitan 4 GPU de 96 GB.
- GPU verificadas: 4x RTX PRO 6000 Blackwell Server Edition (97.887 MiB cada una) en el perfil cualificado, con NVIDIA 595.58.03 y CUDA 13.2. La model card indica "clase RTX PRO 6000 Blackwell" de 96 GB.
- No cabe en GPU de consumo: una RTX 4090 de 24 GB no puede alojar el checkpoint; harian falta del orden de 15 tarjetas para igualar los 355,3 GB del repo, sin reparto posible con este runtime. No se documenta soporte de offload a CPU o disco.
- No disponible si el checkpoint cabe en 4x A100 80 GB o 4x H100 80 GB (320 GB agregados, por debajo del tamano del repo).
- Despliegue: stack de linaje exllamav3-b12x / sparkinfer con TP4 + DCP4 + MTP3; imagen turnkey publicada en ghcr.io/malaiwah/glm52-exl3-vast con MODEL_PROFILE=glm53-3.42bpw y revision 8bef807a0fcdd180e984a26b50e731cdba9a8ff2. Requiere obligatoriamente el parche de tiers de proyeccion mixed-K.
- No cargable por carga estandar de exllamav3: un cargador que asuma K uniforme por capa produce texto fluido pero incorrecto. No hay soporte declarado para llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Throughput medido: 227,55 tokens de salida por segundo a C8, con 72/72 peticiones validas a temperatura 1. Latencia por peticion no disponible.
- Reproductibilidad: hashes de fichero en MANIFEST.sha256 y kit de reproduccion incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD (KV fp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-EXL3-TR3 3,42 bpw (esta ficha) | 177,5B segun safetensors; 755B declarados para el base | 393.216 tokens cualificados | EXL3 trellis K3/K4 mixto, 3,42 bpw | 0,024105 | glm-5.3 | HuggingFace, 0 descargas, 0 likes |
| GLM-5.3 EXL3 3,25 bpw (misma linea TR3) | no disponible | no disponible | EXL3 trellis, 3,25 bpw | 0,026103 | glm-5.3 | referido en la model card, sin enlace propio |
| CN3 de @dareposte (GLM-5.3) | no disponible | no disponible | EXL3 3,42 y 3,25 bpw | 0,023966 / 0,026776 | no disponible | HuggingFace, perfil del autor |
| zai-org/GLM-5.3 (BF16) | 755B (MoE) | no disponible | BF16 (profesor de referencia) | 0 (referencia) | glm-5.3 | HuggingFace |
| GLM-5.2 EXL3 (linaje heredado) | mismo modelo base segun la model card | 520.192 tokens (no cualificada en este stack) | EXL3 trellis | no disponible | no disponible | no disponible |

Comparativa adicional dentro del propio checkpoint: frente a la variante de 3,25 bpw, los 0,17 bpw extra mejoran la KLD solo ~0,002 con KV FP8, mientras que cambiar la cache de FP8 a NVFP4 empeora la KLD ~0,014. Es decir, en este modelo la eleccion de formato de cache KV pesa mas que el bit extra de pesos.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: el recuento real de safetensors (177.517.012.992) no cuadra con los 755B declarados en la model card para GLM-5.3. Verificar antes de dimensionar infraestructura.
- Artefacto sin traccion: 0 descargas y 0 likes en el momento de la consulta; la validacion proviene del autor y de una cualificacion independiente concreta, no de adopcion amplia.
- Perdida de calidad por cuantizacion: KLD de 0,024105 frente al profesor BF16, con heterogeneidad marcada por ventana; la ventana legal densa en citas es la mas afectada y conviene validarla en el dominio propio.
- La codificacion es data-free, sin calibracion: no hay sesgo de dominio inducido por datos de calibracion, pero tampoco hay garantia de comportamiento optimo en dominios especificos.
- Fragilidad de carga: usar un cargador mixed-K incorrecto produce "fluent garbage" (texto fluido pero incorrecto) sin error evidente. Es un fallo silencioso y peligroso en produccion.
- Cache KV: FP8 da la mejor KLD; NVFP4 con RoPE FP8 degrada claramente (hasta 0,039518). No intercambiar formatos sin volver a medir.
- Restriccion de contexto: 393.216 tokens es un perfil seguro medido, no el maximo arquitectonico. La envolvente de 520.192 tokens heredada de GLM-5.2 provoca OOM en la primera compilacion del sampler a temperatura 1.
- Idiomas: solo ingles y chino declarados. No se documenta rendimiento en castellano ni en otros idiomas.
- Licencia: licencia propia "glm-5.3" (license: other). Hay que revisar el texto enlazado antes de cualquier uso comercial; no se detallan restricciones en la informacion disponible.
- Riesgo de alucinacion: patron habitual en modelos generativos. La cualificacion cubre contratos de API y recuperacion factual, pero no una evaluacion de veracidad abierta.
- Rendimiento no verificado en otras topologias: no hay datos para 8 GPU, para GPUs de 80 GB ni para despliegues sin DCP4 ni MTP3.
- Ausencia de benchmarks de tareas: no hay MMLU, HumanEval ni GSM8K publicados para esta cuantizacion, lo que impide comparar contra alternativas de 3 bpw con datos objetivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/GLM-5.3-EXL3-TR3-3.42bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Informe tecnico: https://arxiv.org/abs/2602.15763
- Dataset de logits BF16 de referencia: https://huggingface.co/datasets/brandonmusic/GLM-5.3-BF16-full-logits
- Perfil de CN3 (@dareposte): https://huggingface.co/dareposte
- Imagen de servicio turnkey (GHCR): https://github.com/malaiwah/glm52-exl3-vast/pkgs/container/glm52-exl3-vast
- Registro de cualificacion y resultados de test: https://github.com/malaiwah/glm52-exl3-vast/blob/main/TEST_RESULTS.md#glm-53-full-model-342bpw-qualification-jarvislabs-2026-08-29
- Repositorio del stack de servicio: https://github.com/malaiwah/glm52-exl3-vast
- Busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos no guardan relacion con el modelo.
