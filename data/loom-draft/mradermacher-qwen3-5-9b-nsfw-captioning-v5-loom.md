# loom-draft/mradermacher-qwen3.5-9b-nsfw-captioning-v5-loom

## Resumen

`loom-draft/mradermacher-qwen3.5-9b-nsfw-captioning-v5-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `mradermacher/qwen3.5-9b-nsfw-captioning-v5-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de empaquetado que permite servir ese GGUF sobre GPUs AMD concretas mediante el runtime `loom-serve` (paquete `hrx-loom`), con una API compatible con OpenAI. El modelo subyacente es un derivado de Qwen 3.5 de 9 mil millones de parametros, ajustado para la generacion de descripciones de imagenes (captioning) y marcado como contenido para adultos.

El paquete esta orientado explicitamente a dos plataformas de hardware: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El interes practico esta en que ofrece una via de ejecucion nativa en ROCm para un modelo multimodal de 9B con vision, plantilla de chat con modo de razonamiento y soporte de tool calling, sin depender de llama.cpp para el servicio. La generacion del paquete se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

La relevancia es doble: por un lado, demuestra el flujo de empaquetado del ecosistema Loom para modelos multimodales; por otro, sus propias tablas de rendimiento y de validacion de correctitud figuran como "not yet re-measured" para ambas GPUs, de modo que la calidad numerica del paquete aun no esta certificada por el autor. La ficha siguiente recoge unicamente lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen 3.5 9B; detalles de arquitectura no disponibles) |
| Parametros totales | 9B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete); el repo base GGUF puede ofrecer otras, no confirmado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`qwen3.5-9b-nsfw-captioning-v5.Q4_K_M.gguf`) + proyector `qwen3.5-9b-nsfw-captioning-v5.mmproj-f16.gguf`; empaquetado Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Tamano del repo | 0.0 GB (metadato de Hugging Face; no refleja el peso real de los pesos) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura interna del modelo base: la model card solo identifica el checkpoint de origen (`mradermacher/qwen3.5-9b-nsfw-captioning-v5-GGUF`) y el modelo del que este deriva (Qwen 3.5 9B, segun la nomenclatura). No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado en el modelo de captioning. Tampoco se documenta el proyector multimodal mas alla de su fichero `mmproj-f16.gguf`, que sigue el esquema habitual de llama.cpp para modelos con vision.

La innovacion tecnica del artefacto es el propio empaquetado Loom: `loom-next` genera kernels y programas `.loom` a partir del GGUF, y `loom-serve` los ejecuta sobre ROCm con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La model card declara pruebas de correctitud frente a llama.cpp (comparacion token a token, logits, vision, consistencia bajo concurrencia, tool calling multi-turno y muestreo), pero todas ellas aparecen como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia publicada del grado de equivalencia alcanzado.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con proyector multimodal separado.
- Tool calling al estilo OpenAI (`tools` y `tool_calls`), con soporte declarado para bucles de agente multi-turno.
- Captioning de imagenes como tarea principal del ajuste (el checkpoint se denomina `nsfw-captioning-v5`).
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos o historiales extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- No soporta audio ni salida de audio (marcado como "not applicable").
- No aplica decodificacion especulativa ni "reasoning effort" (marcados como "not applicable").
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion automatica de descripciones de imagenes en catalogos y archivos: el modelo acepta imagenes por `image_url` y devuelve texto descriptivo, lo que permite etiquetar lotes de imagenes con un pipeline que llame a `/v1/chat/completions` en serie o en paralelo (hasta 4 peticiones concurrentes).
- Moderacion y clasificacion de contenido visual para adultos: al estar ajustado sobre captioning NSFW, puede emplearse para describir y etiquetar contenido sensible en flujos de revision, siempre con las salvaguardas adecuadas y revision humana.
- Asistente multimodal sobre documentacion tecnica: con 262.144 tokens de contexto puede recibir capturas de pantalla, diagramas o paginas escaneadas junto a texto extenso y responder preguntas sobre ellos.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir asistentes que consulten APIs internas o bases de datos sin salir del equipo, usando `loom-serve` como backend compatible con OpenAI.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, de modo que encaja en entornos de desarrollo con ROCm donde no se quiere depender de CUDA ni de servicios en la nube.
- Prototipado de pipelines image-text-to-text: sirve como banco de pruebas para validar plantillas de chat, modo thinking y renderizado de imagenes antes de pasar a produccion, gracias a la API estandar y a las pruebas de correctitud previstas por el ecosistema Loom.
- Extraccion de metadatos descriptivos para DAM (digital asset management): descripciones generadas que alimentan busqueda semantica o sistemas de recomendacion sobre bibliotecas de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica: "the results for this package are not yet re-measured". Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tambien figuran como "not yet re-measured" en las dos plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 9B, mas el proyector `mmproj-f16`, y el paquete declara como objetivo la Radeon AI PRO R9700 de 32 GB y el APU Strix Halo con memoria unificada.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD o NVIDIA; el paquete esta generado para los dos destinos AMD indicados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/mradermacher-qwen3.5-9b-nsfw-captioning-v5-loom:chat --materialize=copy --output=qwen3.5-9b-nsfw-captioning-v5` y `loom-serve --model=qwen3.5-9b-nsfw-captioning-v5 '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue: el GGUF de origen puede servirse con llama.cpp u otros runtimes compatibles GGUF, aunque la model card no detalla configuraciones ni resultados para ellos.
- Latencia y throughput: no disponibles; las mediciones del paquete aun no se han repetido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-qwen3.5-9b-nsfw-captioning-v5-loom` (este paquete) | 9B | 262.144 tokens | Si (`image_url`, proyector mmproj) | MIT | Hugging Face, runtime Loom sobre AMD |
| `mradermacher/qwen3.5-9b-nsfw-captioning-v5-GGUF` (modelo base del paquete) | 9B | no disponible en la informacion | Si (mismo proyector) | MIT (segun el paquete derivado) | Hugging Face, GGUF para llama.cpp y afines |
| Modelos Qwen 3.5 de 9B sin ajuste de captioning | 9B | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (captioning de imagenes de ~9B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta marcado como `not-for-all-audiences` y el checkpoint se denomina `nsfw-captioning-v5`; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin filtrado.
- Rendimiento no verificado: todas las tablas de rendimiento y las puertas de correctitud del paquete figuran como "not yet re-measured", por lo que no hay garantia publicada de equivalencia con llama.cpp ni de velocidad.
- Alcance de hardware limitado: el paquete esta generado para dos plataformas AMD concretas (gfx1151 y gfx1201); fuera de ellas no se declara soporte.
- Idiomas no declarados: no se especifica que lenguas cubre el ajuste de captioning, lo que impide asumir calidad multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; en captioning puede producir descripciones plausibles pero incorrectas sobre detalles finos de la imagen. No se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad del modelo base ni del ajuste.
- Licencia MIT declarada en el paquete, pero conviene verificar la licencia del checkpoint de origen y del modelo Qwen 3.5 subyacente antes de un uso comercial, ya que la model card no detalla condiciones adicionales.
- Limite de salida de 4.096 tokens y concurrencia de 4 peticiones: puede ser insuficiente para cargas de produccion con alto paralelismo.
- El tamano del repo en Hugging Face figura como 0.0 GB, un metadato que no refleja el peso real de los ficheros; conviene comprobar el contenido antes de descargar.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-qwen3.5-9b-nsfw-captioning-v5-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/qwen3.5-9b-nsfw-captioning-v5-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Los resultados de busqueda web obtenidos corresponden a servicios no relacionados (Loom Inc. de grabacion de video y la marca de ropa Loom); no aportan informacion tecnica sobre este modelo.
