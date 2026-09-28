# Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-FP16

## Resumen

Llama-3.2-1B-Computer-Engineering-OpenVINO-FP16 es una representacion en formato OpenVINO FP16 del modelo Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM, un ajuste fino de Llama-3.2-1B (Meta) especializado en preguntas y respuestas de ingenieria informatica. Lo publica el usuario Irfanuruchi y su proposito es ofrecer un artefacto listo para ejecutarse con OpenVINO GenAI sobre hardware Intel, incluyendo CPU, GPU integrada y NPU, sin necesidad de conversion adicional por parte del usuario.

El modelo tiene 1 000 millones de parametros y una licencia Llama 3.2, y esta pensado como modelo de completado tipo pregunta/respuesta (formato "Q: ... A:"), no como asistente conversacional general. Su interes practico es que demuestra un flujo de despliegue en el borde (edge) sobre silicio Intel reciente: el autor publica mediciones de latencia y throughput en un Intel Core Ultra 9 275HX, su iGPU Intel Graphics y la NPU Intel AI Boost con OpenVINO 2026.4.

Un detalle relevante para evaluarlo: el checkpoint padre no era un FP16 original, sino un checkpoint cuantizado con BitsAndBytes INT8. Esta publicacion es una reconstruccion densa por desquantizacion, por lo que no puede recuperar la informacion perdida en la cuantizacion INT8 original. El autor lo advierte explicitamente en la model card. El repositorio ocupa unos 2,5 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (derivado de meta-llama/Llama-3.2-1B); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1 000 millones (1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Llama-3.2-1B, sin confirmar en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (esta publicacion), INT8 (1,2 GB) e INT4 (758 MB) como variantes OpenVINO comparadas por el autor |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | OpenVINO IR exportado con optimum-cli (`--weight-format fp16`, tarea `text-generation-with-past`); el repo pesa 2,5 GB y el directorio OpenVINO resultante ~2,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Llama 3.2 con 1B parametros, ajustado para dominio de ingenieria informatica. La cadena de construccion documentada es: meta-llama/Llama-3.2-1B, ajuste fino en ingenieria informatica, checkpoint padre cuantizado con BitsAndBytes INT8, desquantizacion a un checkpoint denso FP16 y, finalmente, exportacion a OpenVINO FP16 mediante `optimum-cli export openvino`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineacion.

El autor documenta la inspeccion del checkpoint padre: pesos lineales INT8, tensores de escalado SCB y 112 modulos `Linear8bitLt`. Tras la desquantizacion, el checkpoint intermedio contenia 146 tensores FP16, cero modulos BitsAndBytes, cero tensores de peso INT8 y cero tensores SCB. La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en el empaquetado: un artefacto OpenVINO FP16 verificado sobre tres backends Intel (CPU, iGPU y NPU) con un pipeline de OpenVINO GenAI y `apply_chat_template = False`, orientado a generacion de estilo completado. Es importante subrayar que este repositorio no es el modelo FP16 previo a la cuantizacion: es una reconstruccion densa a partir del checkpoint INT8, con la perdida de calidad que ello implica.

## Capacidades

- Generacion de texto en ingles con formato de completado pregunta/respuesta ("Q: <pregunta> A:"), optimizado para consultas tecnicas cortas y directas.
- Respuestas de dominio de ingenieria informatica: el ajuste fino del modelo padre esta orientado a este campo (por ejemplo, explicar la cache de CPU, su relacion con la RAM, la latencia y la localidad de memoria).
- Inferencia en CPU, GPU integrada Intel y NPU Intel AI Boost mediante OpenVINO GenAI, con el mismo artefacto FP16.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, uso agentico, razonamiento multi-paso con herramientas, vision, audio ni modo "thinking".
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documenta un modo de chat conversacional; el autor recomienda preguntas tecnicas directas en lugar de prompts conversacionales basados en roles.

## Casos de uso

- Asistente tecnico de ingenieria informatica en local: desplegado con OpenVINO GenAI en un portatil o mini-PC con CPU Intel Core Ultra, responde preguntas concretas sobre cache, memoria, pipelines o arquitectura de computadores sin enviar datos a la nube.
- Ayuda integrada en herramientas de estudio para asignaturas de ingenieria: con el formato "Q: ... A:" y `max_new_tokens=200`, encaja como generador de explicaciones breves dentro de un plugin o CLI educativo.
- Inferencia en el borde sobre NPU: en equipos con Intel AI Boost, el modelo puede ejecutarse de forma continua con un consumo teorico menor que la GPU, con throughput medido de 20,63 tok/s en FP16 y 34,30 tok/s en INT8 en la configuracion de referencia.
- Prototipado de aplicaciones OpenVINO GenAI: sirve como banco de pruebas reproducible para comparar precision FP16, INT8 e INT4 sobre CPU, iGPU y NPU antes de decidir el formato de despliegue definitivo.
- Documentacion tecnica asistida: puede redactar borradores de explicaciones y glosarios de terminos de ingenieria informatica a partir de preguntas puntuales, con revision humana posterior.
- Despliegue en entornos sin GPU dedicada: la variante INT4 (758 MB) y la INT8 (1,2 GB) permiten ejecutarlo en maquinas modestas donde no cabria un modelo de mayor tamano.
- Generacion offline por lotes: al no depender de servicios externos, es util para procesar listas de preguntas tecnicas en pipelines locales de generacion masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica mediciones de rendimiento de inferencia en su sistema de referencia (IULinux 0.1 Development, kernel 7.0.0-31-generic, Intel Core Ultra 9 275HX, Intel Graphics iGPU, Intel AI Boost NPU, OpenVINO 2026.4, perfil de energia Performance, alimentacion por corriente alterna).

Metodologia: 26 tokens de prompt, 128 tokens generados, 2 ejecuciones de calentamiento, 5 ejecuciones medidas, `do_sample=false` e `ignore_eos=true`, con el prompt "Q: Explain how CPU cache memory improves processor performance, including its relationship with RAM, latency, and memory locality. A:".

| Dispositivo | Carga del pipeline | TTFT | TPOT | Throughput |
|---|---:|---:|---:|---:|
| Intel Core Ultra 9 275HX (CPU) | 282,66 ms | 127,76 ± 3,99 ms | 37,96 ± 0,12 ms/token | 26,34 ± 0,09 tok/s |
| Intel Graphics (iGPU) | 2 537,27 ms | 46,95 ± 0,53 ms | 40,93 ± 0,02 ms/token | 24,43 ± 0,01 tok/s |
| Intel AI Boost (NPU) | 6 676,38 ms | 981,90 ± 1,69 ms | 48,49 ± 0,20 ms/token | 20,63 ± 0,09 tok/s |

Comparativa de precision con la misma metodologia (throughput en tok/s):

| Precision | CPU | Intel iGPU | Intel NPU |
|---|---:|---:|---:|
| INT4 | 62,98 | 62,59 | 33,89 |
| INT8 | 50,64 | 41,86 | 34,30 |
| FP16 | 26,34 | 24,43 | 20,63 |

Observaciones del autor: en FP16 la CPU obtuvo el mayor throughput y la iGPU el menor TTFT; INT4 dio el mejor throughput en CPU y iGPU, mientras que INT8 fue el mejor en NPU por un margen pequeno. No se recogieron mediciones de consumo energetico por dispositivo, por lo que los datos comparan unicamente latencia y throughput.

## Requisitos de hardware

- Peso en disco/memoria de los pesos: ~2,4 GB en FP16, 1,2 GB en INT8 y 758 MB en INT4. A estos valores hay que sumar el espacio de la cache KV, no cuantificado en la informacion disponible.
- VRAM/RAM estimada para FP16: en torno a 3 GB o mas en funcion de la longitud de contexto y del backend; las variantes INT8 e INT4 reducen el requisito aproximadamente a la mitad y a un tercio, respectivamente.
- GPU recomendadas: no se documentan pruebas con GPU discretas (A100, H100, RTX 4090). El sistema validado por el autor es un Intel Core Ultra 9 275HX con iGPU Intel Graphics e Intel AI Boost.
- Cabe en hardware de consumo: si, segun las mediciones del autor, sobre un Intel Core Ultra 9 275HX usando CPU, iGPU o NPU. No hay datos de otras plataformas.
- Opciones de despliegue: OpenVINO GenAI (`ov_genai.LLMPipeline`) con `openvino==2026.4` y `openvino-genai==2026.4`; exportacion reproducible con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`. El formato OpenVINO IR no es cargable directamente por llama.cpp, Ollama, vLLM o TGI sin reconvertir desde el checkpoint de HuggingFace original.
- Latencia y throughput estimados: TTFT de 47 ms en iGPU, 128 ms en CPU y 982 ms en NPU; throughput de 26,34 tok/s (CPU), 24,43 tok/s (iGPU) y 20,63 tok/s (NPU) en FP16, con hasta 62,98 tok/s en CPU con INT4.
- Tiempo de carga del pipeline: 283 ms en CPU, 2,54 s en iGPU y 6,68 s en NPU para la variante FP16.
- Ajustes de generacion recomendados por el autor: `max_new_tokens=200`, `temperature=0.7`, `top_p=0.9`, `do_sample=True`, `repetition_penalty=1.1`, `apply_chat_template=False`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue | Benchmarks en la informacion disponible |
|---|---|---|---|---|---|
| Llama-3.2-1B-Computer-Engineering-OpenVINO-FP16 | 1B | no disponible | llama3.2 | OpenVINO IR (FP16/INT8/INT4) | solo latencia y throughput en Intel CPU/iGPU/NPU |
| Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM (modelo padre) | 1B | no disponible | llama3.2 | checkpoint cuantizado BitsAndBytes INT8 | no disponible |
| meta-llama/Llama-3.2-1B (modelo base) | 1B | no disponible en la informacion proporcionada | llama3.2 | safetensors (formato habitual del ecosistema) | no disponible |
| Qwen2.5-1.5B-Instruct | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma-2-2B-it | no disponible | no disponible | no disponible | no disponible | no disponible |

Los dos modelos comparables incluidos al final (Qwen2.5-1.5B-Instruct y Gemma-2-2B-it) se citan como alternativas de rango similar en el segmento de modelos pequenos, pero la informacion proporcionada no incluye datos verificables sobre sus especificaciones ni su rendimiento, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio no es el modelo FP16 original: es una reconstruccion densa obtenida por desquantizacion de un checkpoint BitsAndBytes INT8. La desquantizacion no puede recuperar la informacion perdida durante la cuantizacion INT8 previa, por lo que la calidad puede ser inferior a la de un FP16 entrenado o guardado nativamente.
- Modelo especializado y de un solo idioma: la etiqueta de idioma es unicamente ingles y el ajuste fino esta orientado a ingenieria informatica, lo que limita su utilidad como asistente general o multilingue.
- No esta pensado como chatbot: el formato recomendado es "Q: ... A:" con `apply_chat_template=False`; los prompts conversacionales basados en roles funcionan peor segun el autor.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni benchmarks de calidad, por lo que no hay evidencia que acote la tasa de respuestas incorrectas en contenido tecnico. La supervision humana es recomendable en cualquier uso productivo.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Licencia: Llama 3.2 Community License, con las restricciones de uso comercial, atribucion y politicas de uso aceptable que establece dicha licencia. Es necesario revisar sus terminos antes de un despliegue comercial, especialmente en productos con mas de 700 millones de usuarios mensuales.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de redactar la ficha, sin paper, demo ni evaluacion independiente publicada.
- Rendimiento dependiente de plataforma: las cifras de latencia y throughput solo estan verificadas en un Intel Core Ultra 9 275HX con OpenVINO 2026.4; no hay datos de GPU discretas ni de otros sistemas operativos.
- La NPU presenta la peor latencia de arranque del pipeline (6,68 s) y el mayor TTFT (982 ms), lo que la hace poco adecuada para flujos interactivos con respuesta inmediata en esta configuracion.
- El formato OpenVINO IR limita su portabilidad: para usarlo con vLLM, llama.cpp, Ollama o TGI hay que partir del checkpoint original y reconvertir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-FP16
- Modelo padre (checkpoint cuantizado): https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Paper, blog o demo: no disponible en la informacion proporcionada
- Repositorio de codigo asociado: no disponible en la informacion proporcionada
