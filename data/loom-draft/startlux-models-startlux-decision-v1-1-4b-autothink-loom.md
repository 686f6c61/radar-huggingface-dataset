# loom-draft/startlux-models-StartLux-Decision-v1.1-4B-AutoThink-loom

## Resumen

StartLux-Decision-v1.1-4B-AutoThink es un modelo de lenguaje y vision de 4.000 millones de parametros desarrollado por startlux-models, distribuido originalmente en formato GGUF y empaquetado aqui por el usuario loom-draft como paquete `.loom` para su uso con el motor de inferencia Loom sobre GPUs AMD. El modelo resuelve tareas de decision y razonamiento multimodal (entrada de imagen y texto, salida de texto) e incorpora un modo de razonamiento opcional ("AutoThink") que puede activarse o desactivarse por peticion mediante `enable_thinking`.

La relevancia de esta ficha no reside tanto en el modelo base como en el empaquetado: se trata de una distribucion optimizada para hardware AMD de consumo y estaciones de trabajo, concretamente el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye programas `.loom` y una tarjeta `model.json`, generados con la herramienta loom-next sin intervencion de un LLM en el bucle, y sirve el checkpoint GGUF Q4_K_M sin modificarlo.

La licencia es MIT, lo que facilita su uso comercial, aunque la informacion publicada sobre composicion del dataset, idiomas soportados y resultados de benchmarks del modelo base es practicamente inexistente en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; familia transformer presumible, sin confirmar) |
| Parametros totales | 4B (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (argumento `-c 65536` usado en la comparativa; contexto maximo nativo no confirmado) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el paquete distribuido |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como paquete `.loom` con `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimension oculta) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion). El nombre incluye el sufijo "AutoThink", que corresponde a un modo de razonamiento opcional controlado por el parametro `enable_thinking` en `chat_template_kwargs`, pero la documentacion no detalla como se entreno esa capacidad.

Lo que si esta documentado es el proceso de empaquetado: loom-next genera los programas `.loom` y la tarjeta `model.json` a partir del GGUF original sin modificarlo. El paquete define un preset de memoria (`--pool_backing=fixed`), un modo de carga de pesos (`--parameter_mode=preload`) y una espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No se menciona decodificacion especulativa: la propia model card indica que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo, por lo que las mediciones se realizaron con drafting desactivado en ambos motores.

## Capacidades

- Generacion de texto a partir de entradas multimodales de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento con modo "thinking" opcional, activable o desactivable por peticion mediante `enable_thinking`.
- Toma de decisiones ("Decision" en el nombre del modelo), presumiblemente orientada a clasificacion o seleccion de acciones, aunque no se detalla el formato.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de multiples peticiones concurrentes (la comparativa incluye una prueba de 4 streams).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente multimodal local en estaciones de trabajo AMD: el modelo puede procesar imagenes junto con texto en equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700, sin depender de servicios en la nube, gracias al paquete `.loom` listo para servir con `loom-serve`.
- Clasificacion y decision sobre capturas o documentos escaneados: el pipeline image-text-to-text permite enviar una imagen y una pregunta y obtener una decision textual, adecuado para triaje de tickets con adjuntos.
- Razonamiento por lotes con contexto largo: con 65.536 tokens de contexto y un prefill medido de 2.404,6 tok/s a 32k en Strix Halo, es viable procesar documentos extensos (informes, expedientes) en una sola pasada.
- Servicio de chat interno con API OpenAI-compatible: al exponer `/v1/chat/completions`, se puede integrar en aplicaciones existentes que ya usan el SDK de OpenAI apuntando a `http://127.0.0.1:8080`.
- Despliegue en hardware AMD de consumo/estacion de trabajo: al estar empaquetado especificamente para gfx1151 y gfx1201, encaja en entornos donde no hay GPUs NVIDIA y se quiere evitar la pila CUDA.
- Prototipado de agentes con razonamiento controlado: el flag `enable_thinking` permite activar el razonamiento solo en las peticiones que lo necesitan, reduciendo latencia y coste en el resto.
- Evaluacion comparativa de motores de inferencia: el paquete incluye mediciones frente a llama.cpp ROCm, util para equipos que comparan pilas de serving sobre ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento del motor Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374` con el mismo GGUF y los mismos prompts, en Strix Halo (gfx1151):

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 61,4 | 70,8 | +15 % |
| Decode tok/s, contexto 2k | 59,5 | 68,0 | +14 % |
| Decode tok/s, contexto 32k | 46,1 | 50,5 | +10 % |
| Prefill tok/s, documento 1k | 1.804,4 | 3.024,7 | +68 % |
| Prefill tok/s, documento 2k | 1.906,4 | 3.044,2 | +60 % |
| Prefill tok/s, documento 8k | 1.870,8 | 3.009,2 | +61 % |
| Prefill tok/s, documento 16k | 1.701,9 | 2.776,1 | +63 % |
| Prefill tok/s, documento 32k | 1.412,9 | 2.404,6 | +70 % |
| 4 streams, decode agregado tok/s | 167,3 | 233,3 | +39 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Metodologia: mediana de 3 sesiones (4 streams: mediana de 3), Loom cronometrado por el cliente y llama.cpp por su servidor, argumentos de llama.cpp `-ngl 99 -cram 0 -c 65536 -np 1`, medido el 2026-11-25 en runners AMD DevLab Dispatch Strix Halo (X2-LA03-S03-D01). La seccion de la Radeon AI PRO R9700 aparece truncada en la informacion disponible, por lo que no se recogen sus cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para GPUs con al menos 32 GB (Radeon AI PRO R9700) y para el APU Strix Halo con memoria unificada.
- GPUs soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que depende de la pila ROCm y del motor Loom.
- Cabe en GPU de consumo: si, en el APU Strix Halo integrado; en GPUs dedicadas AMD de 32 GB como la R9700.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir; API compatible con OpenAI en el puerto 8080. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp solo aparece como referencia comparativa).
- Throughput medido en Strix Halo: 70,8 tok/s en decode con prompt corto, 50,5 tok/s a 32k de contexto, 233,3 tok/s agregados con 4 streams y hasta 3.044,2 tok/s de prefill.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (4B multimodales con modo de razonamiento) en la documentacion proporcionada, por lo que la comparativa de calidad no esta disponible. La unica comparacion documentada es de motor de inferencia, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo GGUF, con los margenes de la tabla de rendimiento anterior (+10 % a +70 % segun metrica).

| Aspecto | Este paquete (Loom) | llama.cpp ROCm b1374 |
|---|---|---|
| Modelo | StartLux-Decision-v1.1-4B-AutoThink Q4_K_M | El mismo GGUF |
| Hardware medido | Strix Halo gfx1151 | Strix Halo gfx1151 |
| Decode prompt corto | 70,8 tok/s | 61,4 tok/s |
| Prefill 32k | 2.404,6 tok/s | 1.412,9 tok/s |
| Contexto configurado | 65.536 | 65.536 |

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento, idiomas y evaluacion de calidad: no es posible estimar sesgos, calidad de razonamiento ni fiabilidad sin pruebas propias.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 4B, la precision en tareas de decision complejas puede ser limitada.
- El contexto de 65.536 tokens es el configurado en la comparativa, no necesariamente el maximo nativo del modelo; conviene verificarlo antes de disenar flujos con documentos largos.
- Dependencia de hardware AMD concreto (gfx1151, gfx1201) y de la version `hrx-loom==0.2.0`; el paquete no es portable a CUDA sin reempaquetado.
- Las cifras de rendimiento se midieron con espera activa en GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo; en servidores compartidos esto puede ser problematico.
- Los runners de medicion difieren entre sesiones (DevLab Dispatch), por lo que los margenes frente a llama.cpp pueden variar en otro hardware.
- La seccion de rendimiento para la Radeon AI PRO R9700 esta truncada en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia por parte del autor.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/startlux-models-StartLux-Decision-v1.1-4B-AutoThink-loom
- Modelo base GGUF: https://huggingface.co/startlux-models/StartLux-Decision-v1.1-4B-AutoThink-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de medicion (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45593872314

Nota: los resultados de busqueda web devueltos corresponden a servicios no relacionados (Loom.com, Loom.fr, app.loom.ag) y no aportan informacion sobre este modelo; se han descartado.
