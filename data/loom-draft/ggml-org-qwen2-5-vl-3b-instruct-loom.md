# loom-draft/ggml-org-Qwen2.5-VL-3B-Instruct-loom

## Resumen

`loom-draft/ggml-org-Qwen2.5-VL-3B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `Qwen2.5-VL-3B-Instruct-Q4_K_M.gguf` de `ggml-org`, es decir, una cuantizacion Q4_K_M del modelo multimodal Qwen2.5-VL-3B-Instruct de Alibaba. El paquete lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next` a partir del GGUF sin modificar, sin intervencion de un LLM en el proceso de generacion.

El modelo subyacente es un transformer multimodal de 3B parametros que acepta texto e imagen y produce texto, con una ventana de contexto declarada de 128.000 tokens por peticion y un limite de salida de 4.096 tokens. El paquete esta orientado especificamente a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB), y se sirve mediante `loom-serve` con una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es acotada pero concreta: demuestra la ruta de ejecucion de modelos multimodales GGUF sobre el stack ROCm/HIP de AMD mediante un runtime alternativo a llama.cpp, con soporte de entrada de imagen a traves del proyector `mmproj-Qwen2.5-VL-3B-Instruct-f16.gguf` y concurrencia de 4 peticiones. En el momento de la publicacion no se han registrado mediciones de rendimiento ni de correccion para este paquete concreto, por lo que la ficha se limita a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL): torre de vision + LLM decoder; empaquetado como programas Loom generados |
| Parametros totales | 3B (modelo base Qwen2.5-VL-3B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens por peticion (declarado en la tarjeta) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en f16 (`mmproj-Qwen2.5-VL-3B-Instruct-f16.gguf`) |
| Idiomas soportados | no disponible (la tarjeta no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF de origen; empaquetado en `weights.loom` y programas `program/*.loom`; incluye `tokenizer.json` y `llm_config.json` |
| Modelo base | `ggml-org/Qwen2.5-VL-3B-Instruct-GGUF` |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Herramienta de generacion | `loom-next` (generador, sin LLM en el bucle) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-VL-3B-Instruct, es un transformer multimodal de la familia Qwen2.5-VL: un codificador de vision que proyecta representaciones visuales al espacio de tokens del decoder de lenguaje, de modo que la entrada de imagen se procesa como una secuencia de tokens visuales junto al texto. El paquete Loom no modifica los pesos: toma el GGUF Q4_K_M publicado por `ggml-org` y genera programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con el proyector multimodal en f16.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre las etapas de alineacion (RLHF, DPO u otras) del modelo base. Tampoco se documentan innovaciones tecnicas propias del empaquetado mas alla de la generacion automatica de kernels y de la infraestructura de validacion (`loom-benchmark` con puertas `kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits` y `decision`), cuyos resultados para este paquete figuran como "not yet re-measured" en ambas GPUs.

## Capacidades

- Generacion de texto conversacional e instructivo en formato chat.
- Entrada de imagen: soporta partes `image_url` en el formato OpenAI, procesadas mediante el proyector `mmproj-Qwen2.5-VL-3B-Instruct-f16.gguf`.
- Respuesta a preguntas sobre imagenes (image-text-to-text): descripcion, extraccion de informacion visual y razonamiento sobre el contenido de la imagen.
- Servidor con API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas con la misma salida que en ejecucion aislada (segun la puerta `consistency` definida, aunque sin medicion registrada para este paquete).
- Ventana de contexto de 128.000 tokens por peticion, adecuada para documentos largos o conversaciones multi-turno extensas.
- Tool calling: no disponible (marcado como "not applicable" en la tarjeta).
- Modo de razonamiento o thinking: no disponible ("not applicable").
- Decodificacion especulativa: no disponible ("not applicable").
- Entrada o salida de audio: no disponible ("not applicable").
- Capacidades multilingues: no declaradas en la informacion disponible.

## Casos de uso

- Analisis de documentos escaneados o capturas: el modelo acepta imagenes y texto en la misma peticion, por lo que puede extraer y resumir informacion de facturas, formularios o capturas de pantalla en un flujo unico.
- Asistencia sobre capturas de interfaz: con 128.000 tokens de contexto y entrada de imagen, puede recibir varias capturas de una aplicacion y responder preguntas sobre el estado de la UI o generar instrucciones paso a paso.
- Procesamiento por lotes en estaciones de trabajo AMD: al ejecutarse sobre Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, encaja en equipos con aceleracion ROCm sin necesidad de GPUs NVIDIA, con 4 peticiones concurrentes.
- Prototipado de asistentes multimodales: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local con `curl` o cualquier SDK compatible, util para desarrollo y pruebas de integracion.
- Descripcion y etiquetado de imagenes a escala moderada: con cuantizacion Q4_K_M y 3B parametros, el coste por inferencia es bajo, lo que permite clasificar o anotar lotes de imagenes en local.
- Evaluacion de runtimes alternativos: sirve como banco de pruebas para comparar la salida de Loom frente a llama.cpp sobre el mismo GGUF, usando las puertas `golden` y `compare` de `loom-benchmark`.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local sobre hardware AMD y con licencia Apache-2.0, los datos de imagen y texto no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del autor indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 3B parametros, por lo que el peso de los pesos ronda los 2 GB, a lo que se suma el proyector de vision en f16 y el pool de memoria fijado por `--pool_backing=fixed`.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se declara compatibilidad con GPUs de consumo; el paquete esta generado para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/ggml-org-Qwen2.5-VL-3B-Instruct-loom:chat --materialize=copy --output=qwen2.5-vl-3b-instruct` y `loom-serve --model=qwen2.5-vl-3b-instruct '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Flags relevantes: `completion_spin_ns=4294967295` activa espera activa de finalizacion en GPU (consume CPU mientras hay trabajo en vuelo); `--pool_backing=fixed` reserva el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en el host.
- Latencia y throughput: no disponibles; no se han registrado mediciones para este paquete.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no declaradas en la informacion proporcionada para este paquete; el autor solo documenta `loom-serve`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Despliegue en el paquete |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-Qwen2.5-VL-3B-Instruct-loom` (este) | 3B | 128.000 tokens | Si (imagen + texto) | Apache-2.0 | Loom sobre AMD gfx1151 / gfx1201 |
| `ggml-org/Qwen2.5-VL-3B-Instruct-GGUF` (base) | 3B | no disponible en la informacion | Si | Apache-2.0 | GGUF generico para llama.cpp |
| Qwen2.5-VL-3B-Instruct (original) | 3B | no disponible en la informacion | Si | Apache-2.0 | Pesos originales para frameworks estandar |

La comparativa se limita al modelo base y al checkpoint GGUF de origen, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros modelos multimodales de tamano similar. No se dispone de cifras de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No hay mediciones de correccion registradas para este paquete: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no existe evidencia publicada de equivalencia con llama.cpp.
- Tampoco hay mediciones de rendimiento: se desconoce la latencia y el throughput reales frente a llama.cpp en Strix Halo y Radeon AI PRO R9700.
- El paquete esta generado para dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se declara compatibilidad con otras GPUs, incluidas las de consumo.
- Tool calling, modo de razonamiento, decodificacion especulativa y audio estan marcados como "not applicable"; no deben asumirse en produccion.
- El modo de muestreo figura como "not determined" en la tarjeta, lo que anade incertidumbre sobre el comportamiento de `temperature`, `top_k` y semilla.
- El limite de salida es de 4.096 tokens por peticion, inferior a la ventana de contexto de 128.000 tokens.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales; el impacto concreto no esta medido en la informacion disponible.
- No se declaran idiomas soportados ni sesgos conocidos; al tratarse de un modelo Qwen2.5-VL, las limitaciones del modelo base aplican, pero no estan documentadas en esta tarjeta.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el paquete tiene 0 descargas y 0 likes en el momento de la consulta.
- El modelo se publica como borrador (`loom-draft`) y la tarjeta esta incompleta (el listado de ficheros se corta en `llm_config.json`).

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen2.5-VL-3B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen2.5-VL-3B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
