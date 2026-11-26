# loom-draft/unsloth-granite-3.3-2b-instruct-loom

## Resumen

`loom-draft/unsloth-granite-3.3-2b-instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/granite-3.3-2b-instruct-GGUF`, en su variante `granite-3.3-2b-instruct-Q4_K_M.gguf`. No es un modelo entrenado por `loom-draft`: los pesos subyacentes son los de IBM Granite 3.3 2B Instruct, un transformer denso de 2.000 millones de parametros con contexto de 131.072 tokens. Lo que aporta este repositorio es un artefacto de empaquetado para ejecutar ese GGUF sobre GPUs AMD concretas mediante el runtime Loom (`hrx-loom`).

El paquete esta dirigido a dos aceleradores: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se genero con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y expone un servidor compatible con la API de chat completions de OpenAI en el puerto 8080. Es relevante ahora porque demuestra una via de despliegue nativa en ROCm para modelos pequenos cuantizados en hardware AMD de consumo y estacion de trabajo, un nicho donde historicamente ha dominado el ecosistema CUDA.

La ficha cubre un artefacto con informacion muy escasa: el repositorio no incluye resultados de rendimiento, ni benchmarks de calidad, ni evidencias de validacion (todas las puertas de correctitud aparecen como "not yet re-measured"). Los datos disponibles se limitan a la configuracion de servicio, los ficheros que componen el paquete y los requisitos de instalacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (IBM Granite 3.3 2B Instruct); empaquetado como programas Loom generados |
| Parametros totales | 2.000 millones (modelo base Granite 3.3 2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (origen) empaquetado en programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es IBM Granite 3.3 2B Instruct, un transformer denso de 2.000 millones de parametros. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; estos datos deben consultarse en la model card original de IBM o en la del checkpoint `unsloth/granite-3.3-2b-instruct-GGUF`.

La innovacion tecnica de este repositorio no esta en el modelo sino en el pipeline de despliegue. `loom-next` genera, a partir de la configuracion del GGUF (`llm_config.json`), un conjunto de kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201. El runtime `loom-serve` ofrece un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye un `model.json.lock` con los hashes SHA-256 de los ficheros de origen, verificados por `loom-fetch`.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: marcado como "not applicable" en la tarjeta del paquete.
- Razonamiento / thinking mode: marcado como "not applicable".
- Decodificacion especulativa: marcada como "not applicable".
- Entrada de imagen: "not determined".
- Entrada y salida de audio: "not determined".
- Muestreo (temperatura, top_k, semilla): "not determined".
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de chat local en estacion de trabajo AMD: desplegar el paquete con `loom-serve` sobre una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para prototipos internos, sin dependencia de CUDA ni de servicios en la nube.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola peticion, siempre que el contenido quepa en el limite.
- Asistente integrado en la APU Strix Halo: al ejecutarse sobre una APU con memoria unificada, permite montar un asistente de escritorio con consumo energetico contenido para tareas de redaccion y clasificacion.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como banco de pruebas para validar `loom-fetch`, `loom-serve` y la generacion de kernels de `loom-next` en un modelo pequeno antes de escalar a modelos mayores.
- Generacion de texto por lotes con concurrencia limitada: 4 peticiones simultaneas son suficientes para tareas de etiquetado, resumen o reescritura en pequenos volumentes sin necesidad de un servidor de inferencia completo.
- Base para experimentos de cuantizacion y comparativas: al ser un Q4_K_M de un modelo de 2B, resulta util como referencia para medir latencia y calidad frente a otras cuantizaciones del mismo checkpoint en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured". Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 2B ocupa del orden de 1,5 GB en disco, pero la tarjeta no publica la huella de memoria del pool en ejecucion.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo (RTX 4090, etc.): no disponible; el paquete esta generado para arquitecturas AMD concretas y no menciona soporte CUDA.
- Opciones de despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), instalado con `pipx`, y servidor `loom-serve` con API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/unsloth-granite-3.3-2b-instruct-loom | 2B (denso) | 131.072 | MIT | Paquete Loom (GGUF Q4_K_M empaquetado) | Hugging Face, 0 descargas |
| unsloth/granite-3.3-2b-instruct-GGUF | 2B (denso) | 131.072 (heredado del base) | MIT | GGUF | Hugging Face |
| IBM Granite 3.3 2B Instruct (original) | 2B (denso) | 131.072 | MIT | safetensors y otras variantes | Hugging Face / IBM |

La comparativa se limita al linaje del propio modelo porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros fabricantes. No se dispone de cifras de benchmarks para ninguno de los tres.

## Limitaciones y advertencias

- Ausencia total de evidencias de validacion: todas las puertas de correctitud de `loom-benchmark` figuran como "not yet re-measured", por lo que no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput reales en ninguna de las dos GPUs objetivo.
- Modelo pequeno de 2B: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos mayores; riesgo de alucinacion inherente al tamano.
- Tool calling, thinking mode y decodificacion especulativa no estan soportados segun la tarjeta del paquete.
- Capacidades de vision, audio y muestreo sin determinar; no deben asumirse en produccion.
- Idiomas soportados no documentados en la informacion disponible.
- Dependencia de un runtime joven y especifico (`hrx-loom==0.2.0`) y de dos arquitecturas AMD concretas; no hay garantia de funcionamiento en otras GPUs.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (26 de noviembre de 2026), lo que indica ausencia de validacion por parte de la comunidad.
- La licencia MIT se hereda del modelo base; conviene verificar los terminos de IBM Granite 3.3 en la model card original antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-granite-3.3-2b-instruct-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/granite-3.3-2b-instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
