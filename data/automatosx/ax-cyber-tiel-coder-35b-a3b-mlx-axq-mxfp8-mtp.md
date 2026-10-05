# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo `peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP` (revision `a443d4e30fd5228942cb7695f916f4b14a88fae9`). Se trata de una conversion con la herramienta propietaria AXQuant 1.9.0 en precision mixta: la ruta de texto esta cuantizada a 8 bits (afines, grupo de 32) mientras que la torre de vision y la cabeza de prediccion multi-token (MTP) se conservan en BF16. La arquitectura de origen es `Qwen3_5MoeForConditionalGeneration`, un transformer con mezcla de expertos (MoE) de la familia que el autor etiqueta como `qwen3.5-moe`, con 34,66 mil millones de parametros almacenados en safetensors y una ventana de contexto configurada de 262.144 tokens.

El interes practico del paquete es el empaquetado: 38,82 GB de pesos safetensors con un BPW medido de 8,4611 en el modelo principal y 8,6383 contando la cabeza MTP, lo que reduce el requisito de memoria frente al modelo BF16 original preservando integridad de artefacto (511 de 511 conversiones de modulo correctas, 0 fallbacks). Ahora bien, el propio autor lo etiqueta como "evidencia de desarrollo, no una release certificada": no se publican resultados de calidad frente a BF16, ni de contexto largo, ni de velocidad de kernels, ni de aceptacion y velocidad de MTP, y la asignacion de precision se hizo con priors de arquitectura, sin calibracion.

Es relevante para quien trabaja en inferencia local sobre Mac con memoria unificada amplia y quiere un MoE de ~35B con vision y MTP en un unico artefacto MLX, pero no sirve como sustituto de un modelo validado en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); clase de origen `Qwen3_5MoeForConditionalGeneration` (familia `qwen3.5-moe`), ruta de texto optimizada, torre de vision y cabeza MTP presentes |
| Parametros totales | 34.660.608.768 (34,66B) segun safetensors; la model card declara 35,11B de parametros logicos en el modelo principal |
| Parametros activos | Aproximadamente 3B, deducido de la nomenclatura `A3B` del identificador; la model card no lo declara de forma explicita |
| Longitud de contexto | 262.144 tokens configurados; los limites practicos dependen de la memoria unificada disponible |
| Tipos de cuantizacion | Precision mixta AXQuant: `8bit` afines (34,15B parametros, 94,99%) y `bf16` (1,80B, 5,01%); grupo de 32; metodos `affine` y `bf16`. BPW medido 8,4611 en el modelo principal y 8,6383 incluyendo MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors para MLX (MLX Safetensors). No incluye pesos PyTorch ni GGUF |

Datos adicionales del artefacto: cuantizador AXQuant 1.9.0; clase de presupuesto `MXFP8`; clase de precision base `9p4bpw`; BPW planificado ajustado por almacenamiento 9,3507; tamano de pesos safetensors 38,82 GB; descarga completa aproximada 38,85 GB; tamano del repo 38,8 GB. Sidecars: MTP con 785 tensores, 844,64M parametros, 1,69 GB en BF16; vision con 333 tensores, 446,57M parametros, 0,89 GB en BF16. Audio no presente. Entorno de conversion registrado: MLX 0.32.1 y MLX-LM 0.31.3; AX Engine 7.5.7 registrado pero sin `model-manifest.json` nativo validado.

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. La arquitectura de partida es un transformer con mezcla de expertos de la familia `qwen3.5-moe`, con torre de vision multimodal y una cabeza de prediccion multi-token (MTP) que se usa habitualmente para decodificacion especulativa. AXQuant aplica un esquema de precision mixta por tensor: el 94,99% de los parametros del modelo principal queda en 8 bits con cuantizacion afin y grupo de 32, mientras que el 5,01% restante (principalmente tensores protegidos) permanece en BF16. Los sidecars de vision y MTP se conservan integramente en BF16 y se incluyen en la descarga, aunque MLX-LM puede ignorarlos.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni sobre fases de RLHF o DPO: esos detalles pertenecen al modelo base y no se reproducen en la model card de este paquete. Tampoco hay calibracion: la asignacion de precisiones se baso en `architecture_prior`, sin conjunto de calibracion, y no se publica ninguna afirmacion de retencion de calidad frente a BF16 o frente a lineas base uniformes. La ejecucion del cuantizador registro 511 de 511 conversiones de modulo correctas y 0 fallbacks. El autor advierte explicitamente que el campo AX Engine de `axquant_runtime.json` describe un contrato de compatibilidad previsto, no evidencia observada en tiempo de ejecucion.

## Capacidades

- Generacion de texto y conversacion multi-turno sobre la ruta de texto cuantizada, con la ventana de contexto configurada de 262.144 tokens.
- Razonamiento y generacion de codigo: el nombre del paquete incluye "Coder", pero no se publican evaluaciones de codigo que respalden un nivel concreto de rendimiento.
- Vision: la torre de vision esta presente y preservada en BF16; la calidad vision-lenguaje no ha sido evaluada ni reclamada por el autor.
- Prediccion multi-token (MTP): la cabeza esta incluida como sidecar BF16 de 1,69 GB; su aceptacion y ganancia de velocidad no han sido medidas, por lo que no hay afirmacion de aceleracion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; no se documentan plantillas ni modo de pensamiento.
- Capacidades multilingues: no disponible.
- Capacidades especiales: multimodalidad (vision) y MTP, ambas presentes como artefactos pero sin evidencia publicada de calidad o rendimiento; audio no soportado.

## Casos de uso

- Inferencia local en Apple Silicon: despliegue en un Mac con memoria unificada amplia usando MLX-LM (`mlx_lm.generate`) para generacion de texto sin depender de GPUs NVIDIA ni de servicios en la nube, aprovechando que el paquete ya viene cuantizado a 8 bits.
- Prototipado de aplicaciones de codigo en local: uso del modelo para autocompletado y generacion de fragmentos en un flujo de desarrollo sobre Mac, asumiendo que el rendimiento real en codigo debe medirse por cuenta propia porque no hay benchmarks publicados.
- Evaluacion de pipelines multimodal: experimentacion con la torre de vision preservada en BF16 mediante runtimes que si lean los sidecars, teniendo en cuenta que la calidad vision-lenguaje no esta validada.
- Investigacion sobre cuantizacion en precision mixta: el paquete sirve como caso de estudio de un plan AXQuant sin calibracion, con metadatos completos de BPW medido, reparto de precisiones por tensor y registro de conversiones.
- Experimentos de decodificacion especulativa: la cabeza MTP esta incluida, por lo que es un candidato para montar pruebas de aceptacion y velocidad, siempre que se aporte la medicion que el autor no publica.
- Comparativas de almacenamiento frente a otras variantes: los hermanos de 4 bits y 6 bits de la misma familia permiten estudiar el compromiso entre tamano en disco y calidad en hardware Apple Silicon.
- Docencia y formacion en despliegue MLX: ejemplo practico de conversion, gestion de sidecars y limites de memoria unificada en un modelo MoE de ~35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no publica evidencia de calidad, de contexto largo, de velocidad de kernels ni de velocidad de MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark.

| Metrica de artefacto | Valor |
|---|---|
| BPW medido, modelo principal | 8,4611 |
| BPW medido total, incluyendo MTP | 8,6383 |
| BPW planificado ajustado por almacenamiento | 9,3507 |
| Modulos convertidos correctamente | 511/511 (0 fallbacks) |
| Calidad frente a BF16 o lineas base uniformes | no publicada |
| Aceptacion y velocidad de MTP | no medidas |
| Evidencia de kernels de AX Engine | `unmeasured` |
| Calidad vision-lenguaje | no evaluada |

## Requisitos de hardware

- VRAM / memoria unificada para inferencia: aproximadamente 38,85 GB solo para pesos; hay que anadir el estado del runtime y la cache KV, cuyo tamano depende de la configuracion de atencion y no esta documentado en la informacion disponible.
- Hardware objetivo: exclusivamente Apple Silicon con memoria unificada. No hay pesos compatibles con CUDA ni con aceleradores no-Apple.
- Equipos viables: Mac con 64 GB de memoria unificada como minimo practico, y 96 GB o 128 GB recomendados para dejar margen a la cache KV y a otras aplicaciones. Configuraciones de 32 GB o 36 GB no pueden alojar los pesos.
- Cabe en GPU de consumo: si, en el sentido de GPUs integradas de Apple en equipos de gama alta (por ejemplo Mac Studio con M2 Ultra o M3 Ultra de 64 GB o mas, o MacBook Pro con M4 Max de 128 GB). No cabe en GPUs de consumo NVIDIA de 24 GB, y ademas el formato es incompatible.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`; tambien utilizable como libreria dentro de procesos propios). No hay soporte de vLLM, TGI, llama.cpp ni Ollama, porque no se incluyen pesos PyTorch ni GGUF. La ejecucion nativa en AX Engine no esta establecida al no incluirse un manifiesto nativo validado.
- Almacenamiento: reservar al menos 38,85 GB libres en disco para la descarga; se recomienda fijar el commit del Hub en despliegues reproducibles.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de velocidad, ni de generacion, ni de aceptacion de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP (este) | 34,66B (35,11B logicos declarados) | 262.144 tokens | MLX safetensors, AXQ MXFP8, BPW medido 8,6383 total | Sin benchmarks publicados | apache-2.0 |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (modelo base) | 35,11B logicos declarados | 262.144 tokens | MLX safetensors, cuantizacion oQ6e | no disponible | no disponible |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP (hermano) | misma familia | 262.144 tokens | MLX safetensors, presupuesto AXQ de 6 bits | Sin benchmarks publicados; consultar BPW exacto | apache-2.0 |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP (hermano) | misma familia | 262.144 tokens | MLX safetensors, presupuesto AXQ de 4 bits | Sin benchmarks publicados; consultar BPW exacto | apache-2.0 |

El autor advierte que los nombres de los paquetes AXQ describen una clase de presupuesto de almacenamiento, no una precision uniforme: un plan etiquetado como 6 bits puede mantener 4 bits como precision base y subir otros tensores a 6 bits, 8 bits o BF16 para cumplir el presupuesto, por lo que el BPW medido es el dato autoritativo. No se dispone de comparativas con modelos de otras familias de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evidencia de calidad: el autor no publica comparativas frente a BF16 ni frente a cuantizaciones uniformes, y declara que no hay afirmacion de retencion de calidad. Cualquier uso en produccion exige evaluacion propia.
- Cuantizacion sin calibracion: la asignacion de precisiones se hizo con priors de arquitectura, lo que puede degradar capas sensibles de forma no documentada.
- MTP sin medir: la cabeza de prediccion multi-token esta incluida, pero no se ha medido su aceptacion ni su ganancia de velocidad. No debe asumirse aceleracion.
- Vision sin evaluar: la torre de vision se conserva en BF16, pero la calidad vision-lenguaje no esta evaluada ni reclamada; ademas MLX-LM puede ignorar el sidecar `vision.safetensors`.
- AX Engine no establecido: no se incluye un `model-manifest.json` nativo validado, por lo que la ejecucion nativa en AX Engine no esta garantizada por esta release.
- Portabilidad muy limitada: solo MLX safetensors. No hay pesos PyTorch ni GGUF, de modo que no se puede desplegar en vLLM, TGI, llama.cpp, Ollama ni en GPUs CUDA.
- Requisito de memoria alto: 38,85 GB de descarga implican equipos Apple Silicon de 64 GB o mas; la ventana de 262.144 tokens es inviable en la practica en la mayoria de configuraciones por el coste de la cache KV.
- Idiomas no declarados: la model card no especifica cobertura linguistica, lo que impide garantizar un comportamiento multilingue concreto.
- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de fidelidad; como en cualquier modelo generativo, la verificacion de salidas es responsabilidad del integrador.
- Sesgos conocidos: no disponibles; no se publica ninguna evaluacion de sesgo o seguridad.
- Nombre comercial potencialmente enganoso: el identificador incluye "Coder" y "Cyber", pero no hay evidencia publicada de rendimiento en codigo o en tareas de ciberseguridad.
- Licencia: apache-2.0 para este paquete, pero no se detalla la licencia del modelo base ni de la familia `qwen3.5-moe` de origen, por lo que conviene verificar la cadena de licencias antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Hermano de 4 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano de 6 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
