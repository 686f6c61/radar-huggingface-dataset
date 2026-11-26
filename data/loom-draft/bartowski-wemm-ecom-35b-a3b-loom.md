# loom-draft/bartowski-WeMM-Ecom-35B-A3B-loom

## Resumen

WeMM-Ecom-35B-A3B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `WeMM-Ecom-35B-A3B-Q4_K_M.gguf`, publicado originalmente por bartowski. El modelo subyacente es un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE), con 35B parámetros totales y 3B activos por token según la nomenclatura del identificador. El paquete lo publica el usuario `loom-draft` y está orientado específicamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve este repositorio no es el de entrenar un modelo nuevo, sino el de ofrecer una ruta de despliegue optimizada para hardware AMD mediante el runtime Loom (paquete `hrx-loom`), con un servidor compatible con la API de OpenAI (`/v1/chat/completions`) y soporte de tool calling. La model card reporta mejoras medibles frente a llama.cpp ROCm en el mismo GGUF y el mismo hardware: hasta +17 % en decodificación de contexto corto y hasta +103 % en prefill de documentos de 8k tokens en Strix Halo.

Es relevante ahora porque el ecosistema de inferencia para GPU AMD de consumo y estaciones de trabajo (Strix Halo, R9700) está creciendo y este paquete demuestra una alternativa de runtime con cifras de rendimiento publicadas y reproducibles (runs de DevLab Dispatch). No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha re-medido el rendimiento en la R9700, por lo que debe considerarse material reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) según nomenclatura del modelo; detalles internos no disponibles |
| Parametros totales | 35B |
| Parametros activos | 3B (según identificador A3B) |
| Longitud de contexto | no disponible (llama.cpp configurado con `-c 65536` en la metodología de benchmark; contexto nativo del modelo no disponible) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa Loom `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete Loom no aporta información sobre la arquitectura interna del modelo base más allá de lo que indica su identificador: un modelo MoE con 35B parámetros totales y 3B activos, multimodal (image-text-to-text, con etiqueta `vision`). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se detalla si emplea atención lineal, decodificación especulativa u otras innovaciones; de hecho, la model card indica explícitamente que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo, por lo que la decodificación especulativa no está disponible en esta configuración.

La innovación destacable de este repositorio es el propio runtime Loom: un sistema de despliegue para GPU AMD que compite con llama.cpp ROCm. La model card documenta la metodología de medición (mismo GGUF, mismo runner DevLab, mismas prompts, mediana de 3 sesiones, Loom cronometrado por cliente y llama.cpp por su servidor). Se emplean opciones como `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de completions en GPU). El paquete se generó con `loom-next` (el generador, sin LLM en el bucle).

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de imagen y texto (pipeline image-text-to-text, etiqueta `vision`): entrada de imágenes junto con prompts de texto.
- Tool calling / function calling en estilo OpenAI (`tools` y `tool_calls`), según la tabla de features de la model card.
- Modo "thinking" opcional, desactivable vía `chat_template_kwargs: {"enable_thinking": false}` en la petición.
- Soporte de múltiples flujos concurrentes: la model card reporta mediciones con 4 streams en paralelo.
- Capacidades multilingües: no disponible (no se declaran idiomas en la información).
- No se documentan capacidades de audio, agentes multi-paso ni otras modalidades más allá de visión.

## Casos de uso

- Asistencia en comercio electrónico con imágenes: el modelo es un image-text-to-text orientado (por nombre, "Ecom") a tareas de comercio electrónico; podría usarse para responder consultas sobre productos a partir de fotos del catálogo y texto del usuario, combinando visión y generación de texto en una sola llamada.
- Generación de descripciones de producto: dado un conjunto de imágenes de un artículo, el modelo puede redactar fichas descriptivas; su contexto de trabajo de hasta 64k tokens en la configuración de benchmark permite procesar lotes de imágenes y especificaciones en una misma sesión.
- Chat de atención al cliente multi-turno: con el servidor OpenAI-compatible y soporte de tool calling, puede integrarse en un backend que consulte APIs internas (stock, precios, pedidos) mediante `tool_calls` y mantenga conversaciones con contexto largo.
- Procesamiento de documentos largos con imágenes: el prefill medido a 32k tokens (2156,6 tok/s en Loom sobre Strix Halo) lo hace adecuado para ingerir documentos extensos con figuras, como informes o manuales, y responder preguntas sobre ellos.
- Despliegue en estaciones de trabajo AMD sin CUDA: al estar empaquetado para Strix Halo y Radeon AI PRO R9700, permite servir un modelo multimodal de 35B en hardware AMD de consumo/prosumer mediante `loom-serve`, sin depender de NVIDIA.
- Prototipado de agentes con herramientas: el soporte de `tools`/`tool_calls` en formato OpenAI facilita conectar el modelo a frameworks de agentes existentes que ya hablan ese protocolo, usando el endpoint local en `127.0.0.1:8080`.
- Evaluación comparativa de runtimes: útil para equipos que quieran medir Loom frente a llama.cpp en su propio hardware, ya que el paquete incluye presets y comandos reproducibles.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151) el 2026-11-26, comparando Loom 0.2.0 con llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismas prompts:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 52,6 | 61,4 | +17 % |
| Decode tok/s, contexto 2k | 51,7 | 59,7 | +15 % |
| Decode tok/s, contexto 32k | 45,2 | 49,1 | +9 % |
| Prefill tok/s, documento 1k | 1345,4 | 2457,2 | +83 % |
| Prefill tok/s, documento 2k | 1381,0 | 2592,5 | +88 % |
| Prefill tok/s, documento 8k | 1402,9 | 2842,8 | +103 % |
| Prefill tok/s, documento 16k | 1270,3 | 2491,0 | +96 % |
| Prefill tok/s, documento 32k | 1077,5 | 2156,6 | +100 % |
| 4 streams, decode agregado tok/s | 126,6 | 158,6 | +25 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Para Radeon AI PRO R9700 (gfx1201) la model card indica que los resultados "no se han re-medido todavía". La roofline no se calculó.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de un modelo de 35B parámetros ocupa aproximadamente 20 GB de pesos, por lo que se requiere una GPU con al menos ~24 GB para servir con holgura (estimación basada en el tamaño de cuantización, no publicada por el autor).
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPU NVIDIA ni para Radeon consumer distintas de las listadas; el paquete está orientado a las dos plataformas AMD indicadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`; el servidor expone API OpenAI en `127.0.0.1:8080`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp solo aparece como referencia de comparación).
- Throughput medido en Strix Halo: 61,4 tok/s de decode en contexto corto, 49,1 tok/s a 32k de contexto, 158,6 tok/s agregados con 4 streams y hasta 2842,8 tok/s de prefill en documentos de 8k.
- Latencia: no disponible de forma directa; puede inferirse a partir de los tok/s anteriores.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de ~35B) en la documentación proporcionada. La única comparación publicada es de runtime, no de modelo:

| Aspecto | Este paquete (Loom) | llama.cpp ROCm (mismo GGUF) |
|---|---|---|
| Modelo | WeMM-Ecom-35B-A3B Q4_K_M | WeMM-Ecom-35B-A3B Q4_K_M |
| Hardware | Strix Halo gfx1151 | Strix Halo gfx1151 |
| Decode corto | 61,4 tok/s | 52,6 tok/s |
| Prefill 8k | 2842,8 tok/s | 1402,9 tok/s |
| API | OpenAI-compatible | servidor propio |
| Tool calling | sí (formato OpenAI) | no documentado en esta ficha |

Comparativa con otros modelos: no disponible.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación de la comunidad ni informes independientes de funcionamiento.
- Rendimiento en Radeon AI PRO R9700 no re-medido: las cifras publicadas solo aplican a Strix Halo.
- Sin decodificación especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- Sin datos de benchmarks de calidad: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible evaluar la calidad del modelo base con cifras.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo; riesgo de rendimiento desigual fuera del inglés.
- Sesgos y alucinaciones: no documentados en la información disponible; como todo modelo generativo, existe riesgo de alucinación, especialmente en dominios especializados.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original (`bartowski/WeMM-Ecom-35B-A3B-GGUF`) y de sus datos de entrenamiento, no detalladas aquí.
- Dependencia del runtime Loom (`hrx-loom==0.2.0`): ecosistema joven y específico de AMD; no hay soporte documentado para otras plataformas de inferencia.
- Contexto: la configuración de benchmark usa `-c 65536` en llama.cpp, pero el contexto nativo del modelo no se especifica; no asumir 64k como límite garantizado del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-WeMM-Ecom-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/WeMM-Ecom-35B-A3B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Run de benchmark DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45876997933
