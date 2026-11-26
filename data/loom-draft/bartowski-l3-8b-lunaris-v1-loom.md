# loom-draft/bartowski-L3-8B-Lunaris-v1-loom

## Resumen

L3-8B-Lunaris-v1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `L3-8B-Lunaris-v1-Q4_K_M.gguf` de bartowski. Lo publica el usuario `loom-draft` y su funcion no es la de un modelo nuevo entrenado desde cero, sino la de un artefacto de empaquetado que permite servir el modelo base en GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con `loom-next`, el generador de la cadena de herramientas Loom, sin intervencion de un LLM en el bucle.

El modelo subyacente es un Llama 3 de 8.000 millones de parametros afinado (Lunaris-v1) y cuantizado a Q4_K_M, con una ventana de contexto configurada de 8.192 tokens por peticion. El interes practico del paquete reside en que ofrece una ruta de inferencia nativa sobre ROCm/HIP para hardware AMD de consumo y profesional, con una API compatible con OpenAI (`/v1/chat/completions`) y soporte de 4 peticiones concurrentes, sin depender de llama.cpp.

En el momento de la publicacion el repositorio no registra descargas ni likes, y las mediciones de rendimiento y las pruebas de correccion (gates) figuran como no re-medidas para ambas GPUs. Por tanto, debe tratarse como un artefacto experimental de empaquetado, no como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), pesos GGUF Q4_K_M empaquetados como programas Loom |
| Parametros totales | 8 000 millones (aproximado, derivado de la denominacion L3-8B; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, transformado a programas `.loom` (`program/*.loom`, `weights.loom`) mas `tokenizer.json` y `llm_config.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Tool calling | no aplicable segun la tarjeta |
| Modo razonamiento | no aplicable segun la tarjeta |
| Decodificacion especulativa | no aplicable segun la tarjeta |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama 3 con 8.000 millones de parametros, afinado como Lunaris-v1 y distribuido por bartowski en GGUF con cuantizacion Q4_K_M. La informacion disponible no detalla la composicion del dataset de preentrenamiento ni del afinado, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones de atencion (atencion lineal, SSM, hibridos) en el material proporcionado.

La contribucion tecnica del paquete no esta en el modelo sino en la capa de ejecucion: `loom-next` genera programas Loom especificos para las arquitecturas gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta sobre ROCm/HIP con una API compatible con OpenAI. El despliegue recomendado usa `--pool_backing=fixed` (reserva por adelantado del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host), con `completion_spin_ns=4294967295` para espera activa de las finalizaciones de GPU. La cadena incluye verificaciones de integridad sha256 de los ficheros de origen mediante `loom-fetch`.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Servicio concurrente de hasta 4 peticiones simultaneas con contexto de 8.192 tokens por peticion.
- Generacion de hasta 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Capacidades derivadas del modelo base Llama 3 8B afinado (redaccion, resumen, respuesta a preguntas), si bien la tarjeta no las enumera explicitamente.
- Tool calling: marcado como "not applicable" en la tarjeta del paquete.
- Razonamiento o modo thinking: marcado como "not applicable".
- Decodificacion especulativa: marcada como "not applicable".
- Entrada de imagen: estado "no determinado".
- Entrada y salida de audio: estado "no determinado".
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas, aunque existe un gate de correccion especifico para muestreo.

## Casos de uso

- Servicio local de chat sobre hardware AMD Strix Halo: desplegar el paquete con `loom-serve` en una APU Ryzen AI Max+ 395 para ofrecer un endpoint compatible con OpenAI en red local, sin depender de CUDA ni de llama.cpp.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, permite apuntar clientes existentes al endpoint local cambiando solo la URL base, util para pruebas de integracion sin coste de API.
- Evaluacion de la cadena Loom frente a llama.cpp: el paquete incluye gates de correccion (kernel_tests, golden, compare, consistency, sampling, logits) pensados para comparar token a token la salida contra la referencia de llama.cpp sobre el mismo GGUF.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: con 32 GB de VRAM, el modelo Q4_K_M de 8B deja margen para el pool de memoria fijo y la concurrencia de 4 peticiones, adecuado para entornos de desarrollo con GPU AMD profesional.
- Generacion de texto por lotes de documentos cortos: con 8.192 tokens de contexto y 4.096 de salida, encaja en tareas de resumen, reescritura o extraccion sobre documentos de extension moderada.
- Banco de pruebas de inferencia ROCm: al ser un artefacto reproducible generado por `loom-next` con verificacion sha256, sirve para validar versiones del runtime, kernels generados y politicas de memoria (`fixed` frente a elastica) en hardware gfx1151 y gfx1201.
- Base para experimentos de cuantizacion y empaquetado: al partir de un GGUF de bartowski y transformarlo en programas Loom, permite medir el impacto del empaquetado en latencia y fidelidad de logits frente a la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todos los gates de correccion figuran como "not yet re-measured" en ambas plataformas.

| Gate de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| kernel_tests | no re-medido | no re-medido |
| golden | no re-medido | no re-medido |
| compare | no re-medido | no re-medido |
| vision | no re-medido | no re-medido |
| consistency | no re-medido | no re-medido |
| spec | no re-medido | no re-medido |
| agent | no re-medido | no re-medido |
| agent_think_off | no re-medido | no re-medido |
| sampling | no re-medido | no re-medido |
| logits | no re-medido | no re-medido |
| decision | no re-medido | no re-medido |

## Requisitos de hardware

- VRAM estimada: un modelo de 8B en Q4_K_M ocupa del orden de 5 GB de pesos; a ello hay que sumar el pool de memoria fijo (`--pool_backing=fixed`), la cache KV para 8.192 tokens y 4 peticiones concurrentes. La tarjeta no publica una cifra de VRAM total requerida.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo NVIDIA ni para otras Radeon; el paquete esta generado para las arquitecturas gfx1151 y gfx1201.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` (instalacion via pipx), `loom-fetch` para descargar el paquete desde Hugging Face y `loom-serve` para servirlo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Parametros de servicio recomendados: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones de rendimiento frente a llama.cpp no se han re-medido en ninguna de las dos GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| L3-8B-Lunaris-v1-loom (este paquete) | ~8B | 8.192 tokens | Programas `.loom`, `loom-serve` sobre ROCm (gfx1151, gfx1201) | MIT | Artefacto de empaquetado; sin benchmarks ni gates re-medidos |
| bartowski/L3-8B-Lunaris-v1-GGUF (modelo base) | ~8B | no disponible en la informacion | GGUF Q4_K_M, ejecutable con llama.cpp y derivados | MIT (heredada) | Checkpoint de origen; referencia de correccion del paquete Loom |
| Llama 3 8B (modelo original de la familia) | 8B | no disponible en la informacion | safetensors, GGUF, multiples runtimes | Licencia comunitaria de Llama 3 | Arquitectura base sobre la que se afina Lunaris-v1 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de validacion: todos los gates de correccion y las mediciones de rendimiento figuran como no re-medidos, por lo que no hay evidencia publicada de fidelidad frente a llama.cpp ni de rendimiento en las GPUs objetivo.
- Alcance de hardware muy restringido: el paquete esta generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Funcionalidades no soportadas: tool calling, razonamiento/thinking y decodificacion especulativa aparecen como "not applicable"; imagen y audio como "no determinado"; el muestreo tambien figura como "no determinado" en la tabla de caracteristicas.
- Contexto limitado: 8.192 tokens por peticion, inferior al de otras configuraciones de modelos de la familia Llama 3.
- Concurrencia baja: 4 peticiones simultaneas, insuficiente para cargas de servidor de alta demanda.
- Idiomas: no se especifican los idiomas soportados; no debe asumirse un rendimiento multilingue sin evaluacion.
- Sesgos y alucinacion: no se documenta ninguna evaluacion de sesgos ni de tasas de alucinacion para este paquete ni para el modelo base en la informacion disponible.
- Licencia: MIT segun la tarjeta del paquete; conviene verificar la licencia del checkpoint de origen y de la familia Llama 3 antes de un uso comercial en produccion.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (26 de noviembre de 2026), sin historial de uso.
- Dependencia de la cadena Loom: requiere `hrx-loom[hf]==0.2.0` y el runtime ROCm/HIP; los cambios de version del runtime pueden afectar al comportamiento de los kernels generados.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-L3-8B-Lunaris-v1-loom
- Modelo base GGUF: https://huggingface.co/bartowski/L3-8B-Lunaris-v1-GGUF
- Repositorio de Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
