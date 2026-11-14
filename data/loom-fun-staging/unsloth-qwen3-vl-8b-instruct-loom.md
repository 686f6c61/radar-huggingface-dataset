# loom-fun-staging/unsloth-Qwen3-VL-8B-Instruct-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3-VL-8B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue (formato `.loom`, con programas y un `model.json`) que empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3-VL-8B-Instruct-GGUF`, en concreto la cuantización `Qwen3-VL-8B-Instruct-Q4_K_M.gguf`. Lo publica la organización `loom-fun-staging` dentro del ecosistema Loom, orientado a servir modelos en GPUs AMD mediante el runtime `loom-serve` y el paquete `hrx-loom`.

El modelo subyacente es Qwen3-VL-8B-Instruct, un modelo vision-language de la familia Qwen3-VL con unos 8.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens. El paquete añade una capa de compatibilidad con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, entrada de imágenes mediante un proyector `mmproj-F16.gguf` y concurrencia de 4 peticiones.

Su relevancia es fundamentalmente de infraestructura: demuestra cómo ejecutar un VLM de 8B en hardware AMD de consumo y estación de trabajo (Ryzen AI Max+ 395 "Strix Halo" con memoria unificada y Radeon AI PRO R9700 de 32 GB) sin depender de CUDA, comparando el rendimiento con llama.cpp ROCm. La model card no incluye datos de entrenamiento, idiomas ni licencia del modelo base; toda la información técnica disponible se refiere al empaquetado y al rendimiento del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-VL; el paquete es un runtime `.loom` sobre GGUF) |
| Parámetros totales | ~8.000 millones (Qwen3-VL-8B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición; en Radeon AI PRO R9700 hasta 178.176 tokens por límite de memoria |
| Tipos de cuantización | Q4_K_M (GGUF); proyector de visión en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base más allá de su naturaleza vision-language (pipeline `image-text-to-text`) y de su pertenencia a la familia Qwen3-VL. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el sufijo `Instruct` del checkpoint sugiere un ajuste para seguir instrucciones, pero no se aportan datos verificables.

Lo que sí está documentado es la capa de despliegue: el paquete genera kernels específicos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), expone un servidor compatible con OpenAI en `127.0.0.1:8080`, soporta muestreo con `temperature`, `top_p`, `top_k` y `seed`, y limita la salida a 4.096 tokens mediante el preset `max_tokens`. No hay decodificación especulativa: la model card indica explícitamente que no existe cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto: acepta imágenes mediante partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-F16.gguf`.
- Tool calling / function calling: soporta `tools` y `tool_calls` con el esquema de OpenAI.
- Concurrencia: hasta 4 peticiones simultáneas con salida consistente respecto a ejecuciones aisladas (gate `consistency`).
- Contexto largo: hasta 262.144 tokens por petición en Strix Halo y 178.176 en Radeon AI PRO R9700.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Modo de razonamiento / thinking: no aplicable según la model card.
- Entrada o salida de audio: no soportada.
- Decodificación especulativa: no disponible para este modelo.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: el contexto de 262.144 tokens permite procesar informes, contratos o manuales completos con figuras en una sola petición, útil para extracción de datos y resumen.
- Automatización de atención al cliente con soporte visual: el modelo puede recibir capturas de pantalla o fotos del producto junto al texto del usuario y responder en conversaciones multi-turno, con tool calling para consultar sistemas internos.
- Procesamiento por lotes en estación de trabajo AMD: con 4 peticiones concurrentes y un rendimiento agregado de decodificación de hasta 171,9 tok/s en Strix Halo (techo roofline), es adecuado para pipelines de clasificación y etiquetado de imágenes.
- Asistentes de accesibilidad: descripción de imágenes y respuesta a preguntas sobre contenido visual en local, sin enviar datos a servicios en la nube, aprovechando el despliegue en hardware AMD de sobremesa.
- Agentes con herramientas en entornos controlados: el soporte de `tool_calls` y el gate `agent` (bucle multi-turno de tool calling) permiten construir agentes que consulten APIs y ejecuten pasos encadenados.
- Evaluación y prototipado de VLM en ROCm: sirve como banco de pruebas para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, midiendo prefill y decodificación en distintas longitudes de contexto.
- Extracción de información de documentos escaneados: combinación de OCR implícito y razonamiento sobre el texto extraído para tareas de digitalización y validación.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm para Strix Halo, pero las columnas de llama.cpp y Loom están sin medir (`—`); solo se publican los valores de roofline (techo teórico del hardware a 216 GB/s y 59 TFLOP/s). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 46,2 |
| Decode tok/s, contexto 2k | — | — | 43,5 |
| Decode tok/s, contexto 32k | — | — | 23,0 |
| Prefill tok/s, documento 1k | — | — | 4158,9 |
| Prefill tok/s, documento 2k | — | — | 4074,2 |
| Prefill tok/s, documento 8k | — | — | 3630,6 |
| Prefill tok/s, documento 16k | — | — | 3170,3 |
| Prefill tok/s, documento 32k | — | — | 2529,1 |
| 4 streams, decode agregado tok/s | — | — | 171,9 |
| Decodificación especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados «no se han vuelto a medir». Los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) figuran como no re-ejecutados en este paquete; el último pase fue sobre una build anterior con sha256 `f27824b`.

## Requisitos de hardware

- VRAM/memoria: el paquete se sirve con `--memory_bytes=59000000000` (59 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700; este último límite restringe el contexto a 178.176 tokens.
- GPU compatibles: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo tipo RTX 4090; el empaquetado está orientado a hardware AMD con ROCm.
- Despliegue: `loom-serve` con el paquete `hrx-loom[hf]==0.1.0`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa solo como referencia de comparación).
- Latencia y throughput: solo se publican techos roofline (46,2 tok/s de decode en prompt corto, 23,0 tok/s a 32k de contexto, hasta 4158,9 tok/s de prefill en documentos de 1k y 171,9 tok/s agregados con 4 streams en Strix Halo); no hay medidas reales de Loom ni de llama.cpp en la tabla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (este paquete, Q4_K_M) | ~8B | 262.144 (178.176 en R9700) | no disponible | Hugging Face, runtime Loom para AMD |
| unsloth/Qwen3-VL-8B-Instruct-GGUF (base) | ~8B | no disponible en la información | no disponible | Hugging Face |
| llama.cpp ROCm (referencia de ejecución, mismo GGUF) | ~8B | no disponible | no disponible | Repositorio de llama.cpp |

No se dispone de datos de rendimiento de calidad ni de otros modelos comparables en la información proporcionada; la comparación se limita al mismo checkpoint servido por dos runtimes distintos.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; antes de un uso comercial debe verificarse la licencia del modelo base Qwen3-VL-8B-Instruct y la del propio paquete.
- No se documentan los idiomas soportados ni sesgos conocidos del modelo base; no hay garantías sobre calidad multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan evaluaciones de fidelidad.
- El contexto efectivo depende del límite de memoria configurado: en Radeon AI PRO R9700 se reduce a 178.176 tokens frente a los 262.144 nativos.
- Salida máxima limitada a 4.096 tokens por petición mediante el preset `max_tokens`.
- Sin decodificación especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo.
- Los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) no se han re-ejecutado en este paquete; los resultados de rendimiento de Loom y llama.cpp están sin medir en la tabla publicada.
- El soporte está restringido a hardware AMD gfx1151 y gfx1201; no se documenta funcionamiento en CUDA ni en GPUs de consumo.
- El repositorio es de tipo staging, con 0 descargas y 0 likes en el momento de la consulta; no debe considerarse una distribución estable.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-VL-8B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
