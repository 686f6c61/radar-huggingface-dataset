# loom-fun-staging/unsloth-Qwen3.5-2B-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3.5-2B-loom` es un paquete de despliegue publicado por la organizacion `loom-fun-staging` para el runtime Loom de AMD, no un modelo entrenado de forma independiente. Empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3.5-2B-GGUF` (concretamente `Qwen3.5-2B-Q4_K_M.gguf`) junto con un `model.json` y programas `.loom`, generados mediante el flujo de trabajo `loom-skills`. El objetivo es servir el modelo Qwen3.5-2B en GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer multimodal de 2.000 millones de parametros (Qwen3.5-2B) con capacidad de entrada de imagen, expuesto a traves de una API compatible con OpenAI (`/v1/chat/completions`). El paquete anade soporte para tool calling, modo de razonamiento opcional (`enable_thinking`), entrada de imagen mediante el proyector `mmproj-F16.gguf` y una ventana de contexto de 262.144 tokens por peticion con hasta 4 peticiones concurrentes.

Su relevancia es de nicho: demuestra la viabilidad de ejecutar un modelo de 2B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional mediante un runtime alternativo a llama.cpp, con cifras de roofline teoricas para Strix Halo. No obstante, el paquete esta en estado de staging (0 descargas, 0 likes, creado el 14 de noviembre de 2026) y las puertas de correctitud no se han re-ejecutado sobre esta build concreta, por lo que no debe considerarse listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B); paquete de despliegue para runtime Loom |
| Parametros totales | 2.000 millones (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3.5-2B-Q4_K_M.gguf) + programas `.loom` + `model.json` |
| Modelo base | unsloth/Qwen3.5-2B-GGUF |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Version del runtime | `hrx-loom[hf]==0.1.0` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint `Qwen3.5-2B-Q4_K_M.gguf` de `unsloth/Qwen3.5-2B-GGUF` sin modificaciones. La arquitectura del modelo base es la de Qwen3.5-2B, un transformer con capacidad de entrada de imagen (pipeline `image-text-to-text`) y un proyector multimodal separado en formato F16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica del paquete reside en el runtime Loom: kernels generados especificamente para las arquitecturas AMD gfx1151 y gfx1201, servidor con API compatible con OpenAI, soporte de tool calling estilo OpenAI (`tools` y `tool_calls`), modo de razonamiento activable mediante `chat_template_kwargs: {"enable_thinking": true}` (desactivado por defecto) y decodificacion especulativa marcada como no aplicable (no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto). El paquete incluye ademas un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" opcional, desactivado por defecto y activable por peticion.
- Entrada de imagen (image-text-to-text) mediante el proyector `mmproj-F16.gguf`, con partes `image_url` al estilo OpenAI.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` (bucle multi-turno de tool calling con renderizado exacto del prompt y reutilizacion de historial).
- Soporte de agentes y razonamiento multi-paso mediante el bucle de tool calling multi-turno.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas con garantia de consistencia (misma salida que en ejecucion aislada, segun la puerta `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Salida maxima de 4.096 tokens por peticion.
- Sin soporte de audio (entrada ni salida); sin decodificacion especulativa; sin "reasoning effort" configurable.

## Casos de uso

- Procesamiento de documentos largos en hardware AMD: la ventana de 262.144 tokens permite ingerir contratos, informes o expedientes completos en una sola peticion; el prefill medido en roofline para Strix Halo (hasta 21.292 tok/s en documentos de 1k) hace viable el analisis de documentos extensos en equipos de sobremesa con GPU integrada.
- Asistente con vision en estacion de trabajo AMD: el soporte de `image_url` y el proyector F16 permiten describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas tecnicos, integrado en herramientas internas mediante la API compatible con OpenAI.
- Agente de automatizacion con tool calling: el bucle multi-turno validado por la puerta `agent` permite construir asistentes que invocan funciones externas (consultas a bases de datos, APIs internas, operaciones de ficheros) con historial reutilizado y renderizado exacto del prompt.
- Prototipado y evaluacion de modelos en GPUs AMD: el paquete sirve como banco de pruebas para comparar el rendimiento de Loom frente a llama.cpp ROCm sobre el mismo GGUF y las mismas peticiones, con roofline de referencia (170,1 tok/s de decode en contexto corto en Strix Halo).
- Servicio local de chat para equipos pequenos: con 4 peticiones concurrentes y un agregado de decode de 664,9 tok/s en roofline sobre Strix Halo, puede atender a un equipo reducido en una estacion de trabajo sin depender de la nube.
- Analisis de imagenes en pipelines de CI o procesamiento por lotes: la entrada multimodal y la API estandar permiten integrar el modelo en scripts de validacion visual o generacion de descripciones automaticas de artefactos.
- Modo de razonamiento para tareas de logica o matematicas: activando `enable_thinking` por peticion, el modelo puede emplearse en tareas que requieren cadena de razonamiento, manteniendo el modo rapido por defecto para el resto de trafico.

## Benchmarks y rendimiento

Los unicos datos publicados son los de roofline (techo teorico del hardware) para Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s. Las columnas de llama.cpp y Loom estan marcadas como no medidas ("—") en la model card, por lo que no hay comparacion efectiva de rendimiento.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline (techo) | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 170,1 | no disponible |
| Decode tok/s, contexto 2k | no medido | no medido | 166,9 | no disponible |
| Decode tok/s, contexto 32k | no medido | no medido | 129,9 | no disponible |
| Prefill tok/s, documento 1k | no medido | no medido | 21.292,8 | no disponible |
| Prefill tok/s, documento 2k | no medido | no medido | 21.105,6 | no disponible |
| Prefill tok/s, documento 8k | no medido | no medido | 20.048,1 | no disponible |
| Prefill tok/s, documento 16k | no medido | no medido | 18.792,6 | no disponible |
| Prefill tok/s, documento 32k | no medido | no medido | 16.700,9 | no disponible |
| 4 streams, decode agregado tok/s | no medido | no medido | 664,9 | no disponible |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a |

Para la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el comando de servicio del autor reserva `--memory_bytes=10000000000` (10 GB) tanto en Strix Halo como en R9700, lo que cubre pesos Q4_K_M, proyector F16 y buffers de contexto.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para GPUs NVIDIA ni para otras GPU AMD.
- Cabe en GPU consumer AMD: si, en el caso de Strix Halo (GPU integrada con memoria unificada); la R9700 es una GPU profesional de 32 GB.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.1.0`) mediante `loom-fetch` y `loom-serve`; servidor en `127.0.0.1:8080` con API compatible con OpenAI. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: solo disponibles como techo de roofline en Strix Halo (170,1 tok/s de decode en contexto corto, 129,9 tok/s a 32k, 21.292,8 tok/s de prefill en documento de 1k, 664,9 tok/s agregados con 4 streams). Las cifras reales de Loom no estan medidas en la model card.
- Nota: el comando de servicio usa `completion_spin_ns=4294967295`, es decir, espera activa durante la generacion, lo que consume CPU de forma intensiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / runtime | Estado |
|---|---|---|---|---|---|---|
| unsloth-Qwen3.5-2B-loom (este paquete) | 2B | 262.144 | Si (imagen) | no disponible | GGUF Q4_K_M + runtime Loom (AMD) | Staging, 0 descargas |
| unsloth/Qwen3.5-2B-GGUF (modelo base) | 2B | no disponible en la informacion | Si (imagen) | no disponible | GGUF | Publicado por Unsloth |
| Qwen3.5-2B (modelo original) | 2B | no disponible en la informacion | Si (imagen) | no disponible | safetensors / GGUF (segun distribucion) | Referencia upstream |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y formato de despliegue.

## Limitaciones y advertencias

- Estado de staging: el repositorio tiene 0 descargas y 0 likes y fue creado el 14 de noviembre de 2026; no es un artefacto estable ni validado para produccion.
- Puertas de correctitud no re-ejecutadas: `kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent` y `agent_think_off` figuran como "no re-run on this package"; el ultimo pase fue sobre una build anterior (sha256 `07c7b0e`). No hay garantia de que esta build coincida token a token con la referencia de llama.cpp.
- Rendimiento no medido: las columnas de llama.cpp y Loom en la tabla de rendimiento estan vacias; solo se publican techos de roofline. No se puede afirmar que Loom iguale o supere a llama.cpp con este paquete.
- Radeon AI PRO R9700 sin mediciones: los resultados para gfx1201 "no se han vuelto a medir todavia".
- Licencia no disponible: no se especifica la licencia del paquete ni la del modelo base en la informacion proporcionada; no se puede confirmar el uso comercial.
- Idiomas no disponibles: no se documenta que idiomas soporta el modelo, lo que impide garantizar calidad en castellano u otras lenguas.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que no se puede acelerar la generacion por esta via.
- Salida limitada a 4.096 tokens por peticion y concurrencia maxima de 4 peticiones, lo que limita su uso como servicio multiusuario.
- Dependencia de hardware AMD especifico: el paquete esta generado para gfx1151 y gfx1201; no se documenta compatibilidad con otras GPU.
- Espera activa (`completion_spin_ns=4294967295`): el modo de servicio recomendado consume CPU de forma intensiva durante la generacion.
- Riesgo de alucinacion y sesgos: no hay informacion publicada en la model card sobre evaluaciones de sesgo o tasas de alucinacion del modelo base.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla de Atlassian y una marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.5-2B-loom
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
