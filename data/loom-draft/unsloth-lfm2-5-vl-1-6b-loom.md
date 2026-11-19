# loom-draft/unsloth-LFM2.5-VL-1.6B-loom

## Resumen

LFM2.5-VL-1.6B es un modelo multimodal de 1.600 millones de parametros desarrollado por Liquid AI, distribuido originalmente en formato GGUF por el usuario unsloth y empaquetado en este repositorio por loom-draft. El artefacto publicado no es un modelo nuevo ni un fine-tuning: es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta loom-next a partir del checkpoint `LFM2.5-VL-1.6B-Q4_K_M.gguf`, sin modificacion de los pesos.

El paquete esta orientado a la inferencia sobre GPUs AMD mediante el runtime loom-serve, con presets especificos para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Expone una API compatible con OpenAI (`/v1/chat/completions`) y declara soporte de 128.000 tokens de contexto por peticion y 4 peticiones concurrentes.

Su relevancia es acotada pero concreta: permite ejecutar un modelo vision-lenguaje de 1.6B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional sin pasar por llama.cpp ni por el stack CUDA, con verificacion criptografica de los ficheros fuente (sha256) y un conjunto de puertas de correccion definidas. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de correccion aun no se han re-medido para este paquete, y que la entrada de imagen no esta soportada por Loom pese a que el modelo original la ofrece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Liquid AI LFM2.5-VL; el paquete no documenta la arquitectura interna) |
| Parametros totales | 1.600 millones (1.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas en la model card) |
| Formato de pesos | GGUF empaquetado en programas `.loom` (`program/*.loom`, `weights.loom`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | loom-serve (paquete `hrx-loom[hf]==0.2.0`) |
| Vision | No soportada por Loom (el modelo upstream si la tiene) |
| Tool calling | No aplicable segun la model card |
| Decodificacion especulativa | No aplicable segun la model card |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura del modelo base ni su proceso de entrenamiento: se limita a documentar el empaquetado. El unico dato estructural verificable es que se parte del checkpoint `LFM2.5-VL-1.6B-Q4_K_M.gguf` de unsloth, es decir, un modelo de 1.6B parametros con capacidades de vision-lenguaje, cuantizado en Q4_K_M y sin modificaciones posteriores. Cualquier detalle sobre composicion del dataset, numero de tokens de entrenamiento, uso de RLHF/DPO o innovaciones de atencion debe consultarse en la documentacion de Liquid AI, no en este paquete.

El trabajo tecnico aportado por loom-draft es la generacion de kernels y programas Loom especificos para las arquitecturas AMD gfx1151 y gfx1201, a partir de la configuracion del modelo (`llm_config.json`). El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en el momento de la descarga con `loom-fetch`, ademas de un `REPORT.md` que documenta el proceso de generacion. La generacion se realizo con loom-next sin LLM en el bucle.

## Capacidades

- Generacion de texto conversacional mediante una API compatible con OpenAI.
- Procesamiento de contexto largo: hasta 128.000 tokens por peticion, adecuado para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas con garantia declarada de consistencia (misma salida en concurrencia que en ejecucion aislada, puerta `consistency`).
- Control de muestreo: temperatura, top_k y semilla, con una puerta de correccion (`sampling`) que verifica que la distribucion del primer token coincide con llama.cpp.
- Lectura de logits en host (`llm.logits`) para inspeccion de distribuciones.
- Vision: el modelo upstream soporta entrada de imagen, pero Loom no la implementa; la puerta `vision` figura como no re-medida y la tabla de features marca la entrada de imagen como no soportada.
- Tool calling, modo thinking y decodificacion especulativa: marcados como "not applicable" en la model card de este paquete.
- Idiomas: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sobre GPU AMD: el modelo se sirve con `loom-serve` en el puerto 8080 con API OpenAI, lo que permite conectarlo a clientes existentes sin adaptadores. Es adecuado para prototipos en estaciones de trabajo con Strix Halo o R9700 donde no se quiere depender de CUDA.
- Procesamiento de documentos largos: con 128.000 tokens de contexto por peticion se pueden resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, sin troceado previo.
- Despliegue en infraestructura AMD profesional: la Radeon AI PRO R9700 de 32 GB permite alojar el modelo en Q4_K_M con margen amplio de memoria, orientado a entornos con flotas AMD y requisitos de verificacion de integridad de pesos (sha256 en `model.json.lock`).
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`, `decision`) disenadas para contrastar token a token contra llama.cpp sobre el mismo GGUF, lo que lo convierte en una herramienta para validar la fidelidad de un backend alternativo.
- Servicio de chat con concurrencia moderada: con 4 peticiones simultaneas y una salida maxima de 4.096 tokens, encaja en equipos pequenos o uso interno departamental, no en atencion al cliente a gran escala.
- Base para experimentacion multimodal pendiente: dado que el modelo upstream procesa imagenes, el paquete sirve como punto de partida para quien quiera implementar la ruta de vision en Loom, aunque hoy esa funcionalidad no este operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos el texto indica literalmente que los resultados "no se han re-medido todavia". Del mismo modo, las once puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas en ambas GPU, por lo que no hay evidencia registrada de ninguna de ellas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 1.6B parametros en Q4_K_M, el peso de los pesos ronda 1 GB, pero el pool de memoria se reserva por adelantado (`--pool_backing=fixed`) y debe cubrir el contexto de 128.000 tokens, lo que incrementa sustancialmente el consumo real.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documentan otras GPU AMD ni NVIDIA.
- GPU consumer: no hay confirmacion de funcionamiento en GPUs consumer AMD distintas de Strix Halo; el paquete esta generado para gfx1151 y gfx1201.
- Despliegue: exclusivamente mediante `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado con pipx. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este artefacto.
- Flags relevantes de servicio: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han re-medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato | Licencia | Runtime |
|---|---|---|---|---|---|---|
| loom-draft/unsloth-LFM2.5-VL-1.6B-loom | 1.6B | 128.000 | No soportada por Loom (si en upstream) | GGUF empaquetado en `.loom` | other | loom-serve (AMD) |
| unsloth/LFM2.5-VL-1.6B-GGUF (base) | 1.6B | no disponible | Si | GGUF | other | llama.cpp y otros |
| LFM2.5-VL-1.6B (original Liquid AI) | 1.6B | no disponible | Si | safetensors / GGUF | other | multi-runtime |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos vision-lenguaje de ~2B como Qwen2-VL-2B o SmolVLM) no esta disponible en la informacion proporcionada, por lo que no se incluyen datos de rendimiento ni de contexto que no puedan verificarse.

## Limitaciones y advertencias

- Pesos sin modificar: este repositorio no aporta ninguna mejora de calidad sobre el checkpoint de unsloth; solo cambia el formato de despliegue.
- Sin evidencia de correccion: las once puertas de correccion figuran como no re-medidas, de modo que la fidelidad frente a llama.cpp no esta verificada en la fecha de publicacion.
- Sin datos de rendimiento: no hay mediciones de latencia ni throughput para ninguna de las dos GPU objetivo.
- Vision no operativa: pese a que el modelo base procesa imagenes, Loom no soporta entrada de imagen, lo que elimina la principal ventaja del modelo original.
- Sin tool calling ni modo thinking: descartado para pipelines de agentes o function calling.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, insuficiente para cargas de produccion con alto paralelismo.
- Licencia "other" sin condiciones detalladas en la model card: es imprescindible revisar los terminos del modelo base de Liquid AI antes de cualquier uso comercial.
- Idiomas no declarados: no hay garantia documentada de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en un modelo de 1.6B cabe esperar una tasa de error superior a la de modelos de mayor tamano, aunque no se aportan mediciones.
- Dependencia de un runtime joven (`hrx-loom==0.2.0`) y de dos arquitecturas AMD concretas, lo que reduce la portabilidad y la base de usuarios que puedan validar el paquete.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senales de uso real que respalden su estabilidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-LFM2.5-VL-1.6B-loom
- Modelo base en GGUF: https://huggingface.co/unsloth/LFM2.5-VL-1.6B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
