# loom-draft/BioMistral-BioMistral-7B-loom

## Resumen

BioMistral-7B (Q4_K_M) para AMD Loom es un paquete de despliegue en formato `.loom` generado a partir del checkpoint GGUF sin modificar `BioMistral/BioMistral-7B-GGUF` (concretamente el fichero `ggml-model-Q4_K_M.gguf`). Lo publica el usuario `loom-draft` y no es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos originales de BioMistral-7B a programas Loom y a una tarjeta `model.json`, listos para servirse con el runtime `loom-serve` del ecosistema Loom. La generacion se hizo con `loom-next` (el generador, sin LLM en el bucle), segun declara el autor.

El interes practico esta en el soporte de hardware: el paquete esta pensado para la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y para la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB), es decir, aceleradores AMD con ROCm/HIP en lugar de CUDA. Ofrece una API compatible con OpenAI (`/v1/chat/completions`), contexto de 32.768 tokens por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia es doble: por un lado, BioMistral-7B es un modelo base de dominio medico (Mistral-7B continuado sobre corpus biomedico) y aqui se distribuye en una cuantizacion Q4_K_M que cabe en GPUs de consumo; por otro, el paquete demuestra una via de despliegue alternativa a llama.cpp especifica para hardware AMD. Conviene subrayar que las mediciones de rendimiento y las puertas de correccion del paquete figuran como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de rendimiento ni de equivalencia numerica frente a llama.cpp en esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de BioMistral-7B, basada en Mistral-7B); el paquete Loom genera kernels y programas para ROCm/HIP |
| Parametros totales | 7B (aproximado, segun el nombre del modelo base; no se detalla en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF `ggml-model-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json`, `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Tool calling | no soportado ("not applicable") |
| Razonamiento / thinking | no soportado ("not applicable") |
| Decodificacion especulativa | no soportada ("not applicable") |
| Entrada de imagen | no determinado |
| Entrada/salida de audio | no determinado |

## Arquitectura y entrenamiento

El modelo subyacente, BioMistral-7B, es un transformer decoder-only derivado de Mistral-7B y continuado con preentrenamiento sobre corpus biomedico; la model card del paquete no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en la ficha original del modelo base y aqui figuran como no disponibles. El checkpoint distribuido es la cuantizacion Q4_K_M, sin modificaciones respecto al GGUF publicado por BioMistral.

La innovacion tecnica de este artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y un `weights.loom` a partir de la configuracion del modelo, de modo que `loom-serve` puede ejecutarlos directamente sobre ROCm/HIP en las GPUs AMD indicadas. La tarjeta documenta opciones de servicio relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva por adelantado del pool de memoria) y `--parameter_mode=preload` (carga de pesos en host). Incluye ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, `decision`, entre otras) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; en esta version todas aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional en espanol y otros idiomas (idiomas exactos no disponibles) mediante una API compatible con OpenAI.
- Respuesta a preguntas de dominio biomedico y medico, heredada del preentrenamiento de BioMistral-7B sobre corpus clinico y cientifico.
- Resumen y reescritura de documentos largos: admite hasta 32.768 tokens de contexto por peticion.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Generacion de hasta 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Tool calling / function calling: no soportado en este paquete.
- Modo de razonamiento o thinking: no soportado.
- Decodificacion especulativa: no soportada.
- Entrada de imagen y audio: no determinado en la informacion disponible.
- Capacidades de agente multi-paso: no soportadas al no haber tool calling.

## Casos de uso

- Asistencia documental clinica: el modelo puede resumir historiales, informes o articulos de hasta 32.768 tokens en una sola peticion, lo que permite procesar documentos extensos sin troceado manual; encaja en estaciones de trabajo con GPU AMD Radeon AI PRO R9700.
- Busqueda semantica y respuesta sobre literatura biomedica: con 4 peticiones concurrentes y contexto largo, se puede montar un servicio interno de preguntas y respuestas sobre guias clinicas o repositorios de papers, siempre con supervision humana.
- Generacion de borradores de texto medico divulgativo: redaccion de resumenes para pacientes o material formativo a partir de notas tecnicas, aprovechando el vocabulario especializado del modelo base.
- Despliegue en infraestructura AMD sin CUDA: el paquete esta pensado para Strix Halo y R9700, de modo que sirve para equipos con ROCm que no pueden usar vLLM o TGI sobre NVIDIA; se arranca con `loom-serve` y se consume por HTTP.
- Prototipado local en estaciones de trabajo: al ser una cuantizacion Q4_K_M de 7B, cabe en GPUs de consumo y permite iterar en local con una API compatible con OpenAI sin depender de la nube.
- Evaluacion comparativa de runtimes: util para medir el comportamiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta incorpora puertas de correccion (`golden`, `compare`, `logits`) disenadas para esa comparacion.
- Educacion y formacion interna: asistente de consulta sobre protocolos y procedimientos de un centro sanitario, con contexto suficiente para incluir varios documentos en la misma ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: un 7B en Q4_K_M ocupa en torno a 4-5 GB de pesos; el pool de memoria adicional depende de la configuracion de `loom-serve` (no se detalla en la informacion disponible).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: por tamano y cuantizacion, un 7B Q4_K_M es apto para GPUs de consumo con al menos 6-8 GB de VRAM, pero el paquete solo declara soporte para las dos plataformas AMD citadas; no se confirma funcionamiento en otras.
- Despliegue: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; descarga del paquete con `loom-fetch`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar en esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| BioMistral-BioMistral-7B-loom (este paquete) | 7B | 32.768 | Q4_K_M | Apache 2.0 | Despliegue en AMD via Loom |
| BioMistral/BioMistral-7B-GGUF (modelo base) | 7B | no disponible en la informacion | GGUF (incluye Q4_K_M) | Apache 2.0 | Pesos originales para llama.cpp y derivados |
| Mistral-7B (modelo de partida) | 7B | no disponible en la informacion | multiples | Apache 2.0 | LLM generalista |
| Meditron-7B | 7B | no disponible en la informacion | multiples | no disponible en la informacion | LLM de dominio medico |

La comparacion directa con alternativas medicas de 7B (Meditron, PMC-LLaMA y similares) no puede hacerse con datos de esta ficha porque no se aportan resultados de benchmarks. La diferencia principal frente al modelo base es el formato de despliegue y el soporte de hardware AMD, no el comportamiento del modelo.

## Limitaciones y advertencias

- No es un modelo nuevo: el comportamiento es el de BioMistral-7B Q4_K_M; cualquier limitacion del modelo base (sesgos, alucinacion, calidad en dominios fuera de lo biomedico) se hereda sin cambios.
- Riesgo de alucinacion relevante en contexto clinico: no debe usarse como fuente de decision medica sin revision por profesionales cualificados.
- Sin evidencia de correccion publicada: todas las puertas (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como "not yet re-measured", por lo que no hay prueba de equivalencia numerica frente a llama.cpp en esta version.
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput para Strix Halo ni para R9700.
- Tool calling, thinking y decodificacion especulativa no estan soportados, lo que descarta flujos de agente multi-paso.
- Idiomas soportados no documentados; el rendimiento en espanol no esta verificado en la informacion disponible.
- Limitacion de hardware: el paquete solo declara soporte para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de BioMistral-7B conviene revisar las condiciones del modelo base y de los datos biomedicos empleados en su entrenamiento.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (19 de noviembre de 2026); no hay historial de uso que respalde su madurez.
- La busqueda web realizada no devuelve resultados relacionados con este modelo: los enlaces encontrados corresponden a la herramienta de grabacion de pantalla Loom y a la marca de ropa Loom, sin relacion con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/BioMistral-BioMistral-7B-loom
- Modelo base (GGUF): https://huggingface.co/BioMistral/BioMistral-7B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
