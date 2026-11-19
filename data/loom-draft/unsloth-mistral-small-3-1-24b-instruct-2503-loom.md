# loom-draft/unsloth-Mistral-Small-3.1-24B-Instruct-2503-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `Mistral-Small-3.1-24B-Instruct-2503-Q4_K_M.gguf` de Unsloth, generado con la herramienta `loom-next` (sin LLM en el bucle). El autor, `loom-draft`, publica los programas `.loom` compilados y un `model.json` que permiten servir el modelo sobre GPUs AMD concretas mediante `loom-serve`, dentro del ecosistema Loom de ROCm.

El modelo subyacente es Mistral Small 3.1 24B Instruct (2503), un transformer denso de Mistral AI con 24 mil millones de parametros, ventana de contexto de 131.072 tokens y capacidad de entrada de imagen en su version original. La relevancia de este paquete es que ofrece una ruta de inferencia nativa en hardware AMD (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201) con API compatible con OpenAI, sin depender de llama.cpp para servir.

Conviene subrayar que la model card no incluye mediciones de rendimiento ni resultados de validacion: todas las puertas de correctitud y las comparativas frente a llama.cpp figuran como "not yet re-measured". El paquete es, por tanto, un artefacto de despliegue en estado preliminar, no una evaluacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral Small 3.1 24B Instruct 2503); el paquete `.loom` contiene kernels generados para AMD |
| Parametros totales | 24 mil millones (24B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Mistral-Small-3.1-24B-Instruct-2503-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo base es Mistral Small 3.1 24B Instruct (version 2503), un transformer denso de Mistral AI. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card original de Mistral AI y no se reproducen aqui. Si se sabe que la version 3.1 incorpora entrada de imagen en el modelo original, aunque el paquete Loom no la soporta.

La innovacion tecnica de este repositorio no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas gfx1151 y gfx1201 de AMD, con un `model.json.lock` que fija los ficheros fuente mediante sha256 verificado por `loom-fetch`. El servidor expone un endpoint `/v1/chat/completions` compatible con OpenAI y permite configurar el comportamiento del pool de memoria (`--pool_backing=fixed`), la precarga de parametros (`--parameter_mode=preload`) y la espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No hay decodificacion especulativa: la card la marca como "not applicable".

## Capacidades

- Generacion de texto conversacional multi-turno mediante API estilo OpenAI (`/v1/chat/completions`).
- Contexto de 131.072 tokens por peticion, adecuado para documentos largos.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no aplicable en este paquete.
- Razonamiento o modo thinking: no aplicable.
- Ajuste de esfuerzo de razonamiento: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada y salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la card.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto se pueden analizar contratos, informes o bases de codigo extensas en una sola peticion, sin fragmentar el material.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse integramente en hardware local con licencia Apache 2.0, encaja en escenarios donde no se permite enviar texto a APIs externas.
- Evaluacion de runtimes alternativos en AMD: util para equipos que comparan el rendimiento de Loom frente a llama.cpp en las mismas GPUs, aunque las mediciones de esta card aun no estan publicadas.
- Servicio de chat interno para pequenos equipos: los 4 slots concurrentes permiten atender a un grupo reducido de usuarios sobre una unica GPU R9700 de 32 GB.
- Prototipado de aplicaciones sobre ROCm: sirve como backend de pruebas para desarrolladores que quieran validar flujos de chat antes de migrar a infraestructura mayor.
- Generacion de resumenes y reescritura de textos tecnicos en lote: el limite de 4.096 tokens de salida es suficiente para resumenes ejecutivos y fichas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 24B, lo que situa los pesos en torno a 14-15 GB; a ello hay que sumar la cache KV para 131.072 tokens, cuyo tamano exacto no se detalla en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete esta generado para las dos arquitecturas AMD citadas y no se mencionan otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles; las tablas de rendimiento de la card estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Este paquete (Mistral Small 3.1 24B Instruct 2503, Q4_K_M, Loom) | 24B denso | 131.072 | Apache 2.0 | `.loom` + GGUF, `loom-serve` en AMD gfx1151/gfx1201 | Sin benchmarks ni validacion publicados; sin vision ni tool calling en este runtime |
| unsloth/Mistral-Small-3.1-24B-Instruct-2503-GGUF (modelo base de este paquete) | 24B denso | 131.072 | Apache 2.0 | GGUF, compatible con llama.cpp y derivados | Checkpoint de referencia; soporta vision en el modelo original |
| Mistral Small 3.1 24B Instruct (pesos originales de Mistral AI) | 24B denso | 131.072 | Apache 2.0 | safetensors, ecosistema Transformers/vLLM | Incluye entrada de imagen; requiere GPU con suficiente VRAM en precision completa |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de validacion publicada: las puertas de correctitud y las comparativas con llama.cpp estan pendientes de medicion, por lo que no hay evidencia registrada de que la salida coincida con la referencia.
- Sin soporte de tool calling ni de razonamiento: la card los marca como "not applicable", lo que descarta flujos de agentes y function calling en este runtime.
- Sin entrada de imagen: aunque el modelo original es multimodal, Loom no lo soporta.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed figura como "no determinado", lo que introduce incertidumbre en la reproducibilidad.
- Ambito de hardware muy restringido: el paquete solo esta generado para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en este paquete.
- Sesgos: no se proporciona informacion sobre sesgos conocidos del modelo base en la documentacion disponible.
- Idiomas: no se especifica la cobertura linguistica en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint de Unsloth y del modelo original de Mistral AI antes de desplegar en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto experimental sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Mistral-Small-3.1-24B-Instruct-2503-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Mistral-Small-3.1-24B-Instruct-2503-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
