# jcbtc/Qwen3.8-27B-IU4-Kairic-Signal

## Resumen

Qwen3.8-27B-IU4-Kairic-Signal es un paquete de pesos GGUF para inferencia de texto publicado por el usuario jcbtc (CIRU), construido sobre tres capas de trabajo: el modelo base Qwen3.8-27B de Qwen, el ajuste Signal-3.8-27B de AgentionAI y el stack de ejecucion KAIRIC EDGE del propio autor. No se trata de un modelo entrenado desde cero, sino de una derivacion cuantizada: conserva 865 tensores GGUF del donante KAIRIC EDGE y sustituye unicamente la capa de salida de vocabulario, pasando de BF16 a Q8_0. El resultado son 27.320.697.856 parametros totales (27,32 mil millones) en un repositorio de 28,0 GB.

La relevancia de esta ficha es acotada y muy especifica: es un artefacto pensado para ejecutarse en AMD Strix Halo (gfx1151) con ROCm, usando un runtime propio denominado KAIRIC (derivado de ROCmFPX), con prediccion multi-token (MTP) nativa a profundidad 4. No es un GGUF convencional y no funciona con llama.cpp estandar, Ollama ni CUDA. El ajuste Signal esta orientado a respuestas mas directas y con menos razonamiento superfluo respecto al modelo base.

El aviso mas importante para cualquier evaluacion es que el propio autor declara que esta build concreta no ha sido probada en inferencia ni medida con benchmarks en AMD: las validaciones realizadas son de integridad de artefacto (lineage, checksum de tensores, conversion de la cabeza de salida), no de calidad o velocidad. Cualquier cifra de rendimiento del modelo padre no es extrapolable a este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita (modelo transformer derivado de Qwen3.8-27B; el paquete incluye vistas de ejecucion FFN, GDN y GDN-Output, lo que sugiere componentes de atencion lineal o recurrente, sin confirmacion en la model card) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica / no se declara arquitectura MoE |
| Longitud de contexto | 32K tokens por defecto en el lanzador (ampliable con la variable `CONTEXT`, sujeto a memoria disponible y validacion propia) |
| Tipos de cuantizacion | Cuerpo hibrido IU4 con archivos de aceleracion; cabeza de salida Q8_0; pesos en GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos); lanzador derivado del runtime bajo MIT |
| Formato de pesos | GGUF (15,48 GiB) mas tres archivos `.pfs` de ejecucion prepackada para PromptForge: FFN (7,99 GiB), GDN (1,88 GiB) y GDN-Output (0,70 GiB) |
| Hardware objetivo | AMD Strix Halo / gfx1151 con ROCm |
| Modalidad | Solo texto (no incluye proyector de vision) |
| Muestreo por defecto | Temperatura 0,7; top-p 0,95; top-k 20; min-p 0 |
| Drafting MTP | Pesos nativos conservados; el lanzador usa profundidad 4 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado en esta publicacion. Es un derivado cuantizado del ajuste Signal-3.8-27B de AgentionAI sobre Qwen3.8-27B, cuyo cuerpo corresponde al build KAIRIC EDGE de CIRU. La unica modificacion respecto al donante es la capa de salida de vocabulario: se convierte la cabeza BF16 del checkpoint Signal a Q8_0 mediante la funcion de referencia del runtime KAIRIC. Segun el informe de build del autor, solo `lm_head.weight` difiere entre el checkpoint Signal BF16 y el checkpoint Qwen BF16; los 17 primeros shards presentan SHA-256 identicos y todos los tensores del shard final fueron comparados directamente. Se verificaron 1.271.398.400 valores de la cabeza con coincidencia exacta de bytes cuantizados por una implementacion independiente.

Tecnicamente, el paquete separa el modelo en una parte GGUF (cuerpo mas cabeza de salida) y tres vistas de ejecucion `.pfs` consumidas por PromptForge: FFN, GDN y GDN-Output. La nomenclatura GDN apunta a un componente de red de tipo gated delta, habitual en arquitecturas hibridas con atencion lineal, pero la model card no describe la arquitectura interna ni la composicion del dataset de entrenamiento del ajuste Signal, ni confirma el uso de RLHF o DPO. La innovacion operativa destacable es la prediccion multi-token (MTP) nativa, con pesos de drafting originales conservados y profundidad 4 en el lanzador, junto con la desactivacion explicita de atajos peligrosos: argmax voraz, muestreo del backend de drafting, reutilizacion de prompt y el verificador nativo M65, marcado como no seguro.

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla de chat identica a la del modelo base Qwen3.8-27B.
- Respuestas mas directas y con menor verbosidad de razonamiento, efecto del ajuste Signal de AgentionAI.
- Prediccion multi-token nativa (MTP) a profundidad 4, orientada a acelerar la decodificacion.
- Servicio mediante endpoint compatible con la API de OpenAI (`/v1/chat/completions`) a traves de `llama-server` del runtime ROCmFPX/KAIRIC.
- Modo thinking desactivable: el lanzador arranca por defecto con thinking off.
- Control de contexto y parametros de muestreo mediante variables de entorno (`CONTEXT`, `HOST`, `PORT`, `MODEL_ALIAS`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma declarada.
- Capacidades multilingues: no disponibles (la model card no lista idiomas).
- Vision, audio o multimodalidad: no soportadas; el paquete no incluye proyector de vision.
- Razonamiento matematico, generacion de codigo y otras capacidades de tarea: no documentadas para esta build.

## Casos de uso

- Despliegue de asistente conversacional local en hardware AMD Strix Halo: el modelo esta empaquetado especificamente para gfx1151 con ROCm y ofrece un endpoint compatible con OpenAI, lo que permite integrarlo en aplicaciones de chat sin depender de servicios en la nube.
- Prototipado de agentes con contexto medio: con 32K tokens por defecto y posibilidad de ampliarlos, admite conversaciones multi-turno con historial largo o documentos de referencia de tamano moderado.
- Generacion de texto con latencia reducida gracias a MTP: la prediccion multi-token a profundidad 4 esta pensada para aumentar el throughput de decodificacion en el mismo hardware objetivo, util en tareas de resumen o redaccion asistida.
- Experimentacion con cuantizacion IU4 en ROCm: el paquete sirve como banco de pruebas para evaluar el rendimiento de las vistas de ejecucion PromptForge (FFN, GDN, GDN-Output) frente a alternativas GGUF convencionales.
- Asistencia en tareas de documentacion tecnica: el ajuste Signal prioriza respuestas directas, lo que encaja en flujos donde se busca concision y no cadenas de razonamiento extensas.
- Evaluacion comparativa de tecnicas de drafting especulativo: al conservar los pesos MTP nativos y desactivar el verificador M65, permite medir tasas de aceptacion de borradores en un entorno controlado.
- Servicio local en un unico equipo de trabajo: el consumo total de artefactos (aproximadamente 26 GiB entre GGUF y `.pfs`) permite mantener el modelo residente en una maquina Strix Halo de gama alta con memoria unificada amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta build concreta de Signal no ha sido probada en inferencia ni medida con benchmarks sobre AMD, y que los resultados de calidad y velocidad del modelo padre no se reclaman para esta publicacion. Las unicas verificaciones documentadas son de integridad de artefacto:

| Verificacion | Resultado declarado |
|---|---|
| Lineage de origen | Correcto |
| Integridad de todos los tensores | Correcto |
| Conversion de la cabeza de salida (Q8_0) | Correcto, 1.271.398.400 valores con coincidencia exacta de bytes |
| Shards 1-17 frente al checkpoint Qwen BF16 | SHA-256 publicados identicos |
| Calidad de tarea | No medida |
| Tasa de aceptacion MTP | No medida |
| Velocidad de generacion | No medida |

## Requisitos de hardware

- Hardware objetivo declarado: AMD Strix Halo, arquitectura gfx1151, con ROCm. No se contempla CUDA.
- Espacio en disco: aproximadamente 26,05 GiB para el conjunto de artefactos (GGUF 15,48 GiB + 7,99 GiB + 1,88 GiB + 0,70 GiB). El autor advierte que el tamano de archivo no equivale a la memoria pico en tiempo de ejecucion.
- VRAM o memoria unificada estimada para inferencia: no disponible. Depende del contexto configurado; el lanzador usa 32K por defecto y contextos mayores requieren memoria adicional y validacion separada.
- GPU recomendadas: AMD Strix Halo / gfx1151. Compatibilidad con A100, H100 o RTX 4090: no soportada por el runtime incluido.
- Cabe en GPU de consumo: no disponible como dato confirmado. El hardware objetivo es un APU con memoria unificada, no una GPU discreta de consumo convencional.
- Opciones de despliegue: exclusivamente el runtime KAIRIC v1.2 (ROCmFPX, commit fijado 205a3e5f40e5542e2f2eb68e3d3f81f918b1d895) con `llama-server`. No es compatible con llama.cpp estandar, Ollama, TGI ni vLLM segun la propia model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| jcbtc/Qwen3.8-27B-IU4-Kairic-Signal | 27,32 B | 32K por defecto | GGUF + `.pfs`, runtime KAIRIC/ROCmFPX sobre gfx1151 | Apache 2.0 | Sin medir en esta build |
| agentionai/Signal-3.8-27B | No disponible | No disponible | Checkpoints BF16 (formato no detallado) | No disponible en la informacion facilitada | No disponible |
| jcbtc/Qwen3.8-27B-IU4-Kairic-Edge | 27,32 B (donante) | No disponible | GGUF + vistas IU4, runtime KAIRIC | Apache 2.0 | No disponible |
| Qwen/Qwen3.8-27B | 27,32 B (base) | No disponible | Pesos originales del modelo base, incluidos los pesos MTP | No disponible en la informacion facilitada | No disponible |

La comparativa con alternativas de la misma categoria (modelos densos de ~27B para ejecucion local) no esta soportada por datos en la informacion disponible: no hay cifras de MMLU, HumanEval, GSM8K ni de velocidad para ninguno de los artefactos implicados.

## Limitaciones y advertencias

- Ausencia total de validacion de calidad: el autor declara que esta build no ha sido probada en inferencia ni benchmarkeada; solo se verifico la integridad de los artefactos.
- Dependencia de un runtime no estandar: requiere el runtime KAIRIC v1.2 (ROCmFPX) y no funciona con llama.cpp, Ollama, llama.cpp CUDA, TGI ni vLLM. Esto limita la portabilidad y el soporte de la comunidad.
- Restriccion de hardware: disenado para AMD Strix Halo / gfx1151 con ROCm. No hay ruta de despliegue documentada para GPUs NVIDIA o para CPU.
- Complejidad de despliegue: hay que descargar el GGUF, los tres archivos `.pfs` y el lanzador en el mismo directorio, verificar los SHA-256, compilar el runtime desde un commit fijado y arrancar con variables de entorno concretas.
- Solo texto: no se incluye proyector de vision. Cualquier caso de uso multimodal queda descartado.
- Idiomas: la model card no declara idiomas soportados, por lo que no se puede asumir cobertura multilingue verificada.
- Riesgo de alucinacion: no cuantificado ni evaluado para esta build. Al ser un derivado de un ajuste sobre Qwen3.8-27B sin evaluacion publicada, no hay tasas de error disponibles.
- Sesgos: no documentados ni medidos.
- Verificador M65 marcado como no seguro: el lanzador lo desactiva por defecto. Reactivarlo es responsabilidad del usuario.
- Contexto: los 32K por defecto son un valor de arranque del lanzador, no una garantia de calidad. Ampliarlo exige memoria suficiente y validacion propia.
- Uso comercial: los pesos estan bajo Apache 2.0 y el lanzador derivado del runtime bajo MIT, pero la model card aclara que es un derivado de CIRU de Signal y no una publicacion de runtime de AgentionAI; conviene revisar las condiciones de los componentes upstream antes de un despliegue comercial.
- Trazabilidad de la cuantizacion: el empaquetado IU4 y las vistas `.pfs` dependen de PromptForge, lo que anade una capa propietaria entre los pesos y la ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jcbtc/Qwen3.8-27B-IU4-Kairic-Signal
- Modelo base (ajuste): https://huggingface.co/agentionai/Signal-3.8-27B
- Modelo base (donante del cuerpo): https://huggingface.co/jcbtc/Qwen3.8-27B-IU4-Kairic-Edge
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime KAIRIC / ROCmFPX (commit fijado): https://github.com/ciru-ai/ROCmFPX/tree/205a3e5f40e5542e2f2eb68e3d3f81f918b1d895
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ROCm Composable Kernel: https://github.com/ROCm/composable_kernel
- Archivos de verificacion incluidos en el repositorio: `build-report.json`, `SHA256SUMS`, `BUILD.md`
- Busqueda web realizada: no se han encontrado enlaces adicionales relevantes sobre este modelo (los resultados obtenidos corresponden a paginas corporativas de Microsoft, sin relacion con el modelo).
