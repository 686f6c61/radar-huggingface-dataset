# gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer

## Resumen

El modelo `gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer` es una distribucion cuantizada a NVFP4 del modelo multimodal Qwen3.8-27B, empaquetada en el formato propietario `.ninfer` y con un modulo de decodificacion especulativa DFlash2 injertado. Lo publica el desarrollador gpillon como artefacto optimizado para su motor de inferencia `ignis`, un servidor compatible con la API de OpenAI disenado especificamente para cargas de trabajo de agentes de programacion sobre una unica GPU Blackwell (RTX 5090 o RTX PRO 6000).

El modelo base es Qwen3.8-27B, un transformer multimodal de 27 mil millones de parametros con capacidad de entrada de imagen y texto, que aqui se distribuye con pesos cuantizados a 4 bits en formato NVFP4 (W4A4), reduciendo el artefacto a 18,07 GiB. Sobre esa base se ha injertado un drafter DFlash2 de 5 capas con ventana deslizante que acelera la decodificacion mediante verificacion especulativa, manteniendo los tensores base bit a bit identicos a la version v1 del artefacto.

Su relevancia actual radica en que demuestra un patron concreto de despliegue local de alta eficiencia: un modelo de 27B multimodal con contexto de hasta 512K tokens ejecutandose en una sola GPU de consumo con velocidades de decodificacion de hasta 370 tok/s en picos y mas de 1.000 tok/s agregados con ocho carriles concurrentes. No es un checkpoint de Transformers ni un GGUF: solo funciona en motores que lean el formato `.ninfer`, lo que limita su portabilidad pero permite optimizaciones agresivas de cache KV y reutilizacion de prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con modulo drafter DFlash2 de decodificacion especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512K tokens (YaRN x2) |
| Tipos de cuantizacion | NVFP4 (W4A4) en pesos; tensores de normalizacion y conv-base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto nativo de NInfer; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto deriva de Qwen3.8-27B, un transformer multimodal que acepta entradas de imagen y texto y genera texto. La distribucion aqui presentada aplica cuantizacion NVFP4 completa (pesos y activaciones a 4 bits) sobre los 1.259 objetos base del artefacto v1, manteniendolos byte a byte identicos. Sobre esa base se anaden 66 objetos: 34 matrices de pesos NVFP4 y 32 tensores BF16 de normalizacion y conv-base que componen el drafter DFlash2, una red de 5 capas con atencion de ventana deslizante a la anchura oculta del modelo objetivo. El injerto se realizo mediante la herramienta `tools/artifact/graft_dflash2_module.py` en lugar de reconvertir desde cero.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO. La innovacion tecnica destacable es la integracion del drafter DFlash2 para decodificacion especulativa, que en el fork `gpillon/ninfer` se hizo funcionar de extremo a extremo corrigiendo errores de direccionamiento gather/selector, anadiendo transporte de cache KV en la capa de RAM para el drafter y calibrando de forma adaptativa la anchura de verificacion MTP. El motor incorpora ademas cache KV en dos niveles (probation/protected) en RAM del host, reutilizacion de prefijo para peticiones concurrentes que comparten un prefijo largo y carriles etiquetados (`@main`, `@agents`, `@classifier`) que protegen la conversacion principal de la expulsion por trafico efimero.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Entrada de imagenes (pipeline image-text-to-text): descripcion, analisis y respuesta sobre contenido visual.
- Contexto largo de hasta 512K tokens mediante escalado YaRN x2, adecuado para repositorios completos o conversaciones extensas.
- Decodificacion especulativa con DFlash2 para acelerar la generacion en cargas predecibles.
- Reutilizacion de prefijo entre peticiones concurrentes que comparten system prompt y esquemas de herramientas.
- Soporte de tool calling y parsing de llamadas a herramientas endurecido en el motor (segun la model card del fork).
- Capacidad de operar como agente principal con subagentes concurrentes en la misma GPU.
- Metricas Prometheus y Playground integrados en el binario del servidor.

## Casos de uso

- Agente de programacion local: el modelo puede actuar como agente principal en herramientas tipo Qwen Code sobre una RTX 5090, con contexto de 512K tokens para mantener en memoria el repositorio y los esquemas de herramientas durante sesiones largas.
- Enjambre de subagentes concurrentes: gracias a la reutilizacion de prefijo y a los carriles etiquetados del motor, una rafaga de subagentes que comparten system prompt reutiliza aproximadamente el 99% del prefijo en lugar de rehacer el prefill completo, con 1.065 tok/s agregados en ocho carriles.
- Asistente de revision de codigo con capturas: al aceptar entrada de imagen, puede analizar capturas de pantalla de errores, diagramas de arquitectura o interfaces junto al codigo fuente en la misma conversacion.
- Servidor compatible con OpenAI para equipos pequenos: `ignis-server` expone `http://127.0.0.1:8000/v1`, lo que permite conectar clientes existentes sin adaptadores y centralizar el acceso a un modelo multimodal local.
- Analisis de documentacion tecnica extensa: con 512K tokens de contexto puede procesar manuales, especificaciones o transcripciones completas en una sola pasada sin fragmentacion.
- Prototipado de pipelines multimodales en investigacion: la cuantizacion NVFP4 y el drafter permiten iterar sobre tareas de vision-lenguaje en hardware de consumo, con metricas Prometheus para medir latencia y throughput.
- Despliegue en estacion de trabajo Windows o Linux: las builds y la imagen de contenedor en la pagina de releases permiten montar un servidor de inferencia local sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son de rendimiento de inferencia en una RTX 5090 con este artefacto y su drafter DFlash2:

| Carga | Decodificacion |
|---|---:|
| Un carril, media | ~170 tok/s |
| Un carril, picos (codigo predecible) | ~370 tok/s |
| Ocho carriles simultaneos, agregado | 1.065 tok/s |

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 18,07 GiB en disco; se necesita ademas espacio para cache KV, que con contexto de 512K tokens puede ser considerable y se mitiga con el tier en RAM del host del motor `ignis`.
- GPU objetivo: una unica tarjeta Blackwell, concretamente RTX 5090 o RTX PRO 6000, segun la model card.
- No se documenta compatibilidad con A100, H100 ni generaciones anteriores; el formato NVFP4 y el motor estan orientados a Blackwell.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB), que es el hardware de referencia de las mediciones.
- Opciones de despliegue: `ignis-server` (compatible con OpenAI, con Playground y Prometheus) y el motor NInfer original; no es compatible con vLLM, llama.cpp, Ollama ni TGI al usar formato `.ninfer`.
- Latencia y throughput: ~170 tok/s de media en un carril, ~370 tok/s en picos y 1.065 tok/s agregados con ocho carriles en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B | 512K (YaRN x2) | `.ninfer` NVFP4 | Apache 2.0 | RTX 5090 / RTX PRO 6000 |
| cometkim/Qwen3.8-27B-nvfp4full-NInfer | 27B | no disponible | `.ninfer` NVFP4 | Apache 2.0 | Blackwell |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4 (formato de Unsloth) | Apache 2.0 | Blackwell |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors | Apache 2.0 | multi-GPU |

La diferencia principal frente a las alternativas es la presencia del drafter DFlash2 injertado y las optimizaciones del fork `gpillon/ninfer` para cargas de agentes concurrentes; el resto de variantes comparte la misma base Qwen3.8-27B pero sin ese modulo de decodificacion especulativa ni, en el caso del checkpoint original, con el formato propietario.

## Limitaciones y advertencias

- Portabilidad muy limitada: el formato `.ninfer` solo lo leen `ignis` y NInfer; no se puede cargar en Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Dependencia de hardware Blackwell: no hay soporte documentado para A100, H100 ni GPU anteriores, lo que restringe el despliegue a estaciones con RTX 5090 o RTX PRO 6000.
- La cuantizacion NVFP4 W4A4 puede degradar la calidad frente al checkpoint original en tareas sensibles a precision numerica; no se publican evaluaciones comparativas.
- No se documentan los idiomas soportados ni evaluaciones multilingues del artefacto.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin datos especificos de mitigacion en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en la model card.
- El contexto de 512K depende de escalado YaRN x2, que puede afectar al rendimiento en tareas que requieran atencion precisa a posiciones muy distantes.
- La licencia Apache 2.0 permite uso comercial, pero el ecosistema de motores compatibles es muy reducido y mantenido por una comunidad pequena, con riesgo de soporte limitado.
- El artefacto se construyo injertando el drafter sobre la v1 en lugar de reconvertir desde cero; aunque los tensores base son identicos, cualquier cambio futuro en el pipeline de injerto requeriria verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Artefacto v1 de referencia: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Motor ignis: https://github.com/gpillon/ignis
- Guia para agentes de ignis: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Documentacion de ignis en Markdown: https://gpillon.github.io/ignis/llms.txt
- Releases de ignis: https://github.com/gpillon/ignis/releases
- Seccion de rendimiento de ignis: https://github.com/gpillon/ignis#how-fast
- Fork gpillon/ninfer: https://github.com/gpillon/ninfer
- Cambios del fork: https://github.com/gpillon/ninfer/blob/feat/dflash2-local/docs/maintainer/gpillon-fork-changes.md
- Motor NInfer original: https://github.com/Neroued/ninfer
