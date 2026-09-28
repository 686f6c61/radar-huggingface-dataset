# Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-INT4

## Resumen

Llama-3.2-1B-Computer-Engineering-OpenVINO-INT4 es una conversión a formato OpenVINO con compresión de pesos INT4 del modelo Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM, un ajuste fino de Llama 3.2 1B orientado a preguntas y respuestas de ingeniería informática. Lo publica el usuario Irfanuruchi y su propósito es ejecutar un modelo de ~1.000 millones de parámetros en hardware Intel de consumo (CPU Core Ultra, GPU integrada y NPU Intel AI Boost) con un directorio de pesos de solo 758 MB.

El interés técnico de esta ficha no está en el modelo base, sino en la cadena de conversión: el checkpoint padre era un artefacto BitsAndBytes INT8 real (112 módulos Linear8bitLt con tensores de escalado SCB), que se deconstruyó a FP16 denso y después se recomprimió a INT4 simétrico con group size 128 mediante optimum-cli y NNCF. El resultado se validó en IULinux con OpenVINO 2026.4 sobre los tres backends Intel disponibles, con métricas de TTFT y throughput publicadas para cada uno.

Es relevante ahora porque demuestra un flujo reproducible de despliegue de LLM en NPU y iGPU Intel para tareas de nicho, y porque documenta con transparencia una doble cuantización con pérdida (INT8 → FP16 → INT4). Sus limitaciones son notables: cero descargas, cero valoraciones, soporte exclusivo de inglés y un formato de prompt de tipo completion (Q:/A:) en lugar de chat conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 1B), exportado a OpenVINO IR |
| Parametros totales | ~1.000 M segun la model card ("1B"); la familia Llama 3.2 1B declara ~1.240 M, no confirmado para este ajuste |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el checkpoint Llama 3.2 1B subyacente soporta 128.000 tokens, sin confirmar para esta conversion |
| Tipos de cuantizacion | INT4 simetrico, group size 128, ratio 1.0 en 112 capas; precision de respaldo INT8 asimetrica en componentes no definidores de ratio; el checkpoint padre era BitsAndBytes INT8 |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | OpenVINO IR (.xml + .bin); directorio resultante de ~758 MB |
| Tamano del repositorio | 0,8 GB |
| Libreria de inferencia | openvino / openvino-genai 2026.4 |
| Modelo base | Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM (relacion: quantized) |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only con atencion causal, normalizacion RMSNorm y embeddings ligados, disenado para generacion de texto autorregresiva. Sobre ese checkpoint, el autor realizo un ajuste fino tematico en ingenieria informatica y lo guardo como checkpoint BitsAndBytes INT8, no como pesos de coma flotante con metadatos de cuantizacion. La inspeccion del padre confirmo pesos lineales INT8, tensores de escalado SCB y 112 modulos Linear8bitLt, lo que implica que el ajuste se entreno o serializo con cuantizacion de 8 bits activa.

La cadena de conversion documentada es: meta-llama/Llama-3.2-1B → ajuste fino en ingenieria informatica → checkpoint padre BitsAndBytes INT8 → representacion densa FP16 desquantizada (146 tensores FP16, 0 modulos BitsAndBytes, 0 tensores INT8, 0 tensores SCB) → compresion de pesos OpenVINO INT4. La exportacion se ejecuto con `optimum-cli export openvino --task text-generation-with-past --weight-format int4 --sym --ratio 1.0 --group-size 128`. NNCF confirmo que las 112 capas definidoras de ratio se comprimieron en INT4 simetrico con group size 128, mientras que un componente no definidor de ratio utilizo INT8 asimetrico como precision de respaldo.

La innovacion destacable es de ingenieria de despliegue, no de modelado: el artefacto resultante de 758 MB es capaz de ejecutarse en CPU, iGPU y NPU Intel con la misma API de OpenVINO GenAI. El autor advierte explicitamente de que, al partir de un checkpoint ya cuantizado, la conversion incluye una reconstruccion con perdida INT8 → FP16 antes de la compresion INT4, por lo que no debe describirse como una conversion directa desde los pesos FP16 originales. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con formato de pregunta-respuesta de tipo completion: el prompt recomendado es `Q: <pregunta>` seguido de `A:`.
- Respuestas tecnicas de ingenieria informatica: el ejemplo incluido en la model card aborda el proposito de la memoria cache de CPU, y el prompt de benchmark trata la relacion entre cache, RAM, latencia y localidad de memoria.
- Generacion determinista o muestreada: soporta decodificacion greedy (`do_sample = false`) y muestreo con temperatura 0.7, top_p 0.9 y penalizacion de repeticion 1.1.
- Ejecucion multi-dispositivo: el mismo artefacto funciona en CPU, GPU integrada y NPU a traves de OpenVINO GenAI.
- Control de longitud de salida mediante `max_new_tokens` (200 tokens en la configuracion recomendada).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidad multilingue limitada: solo ingles declarado.
- No se declara soporte de chat con plantilla de conversacion; de hecho la configuracion de ejemplo fija `apply_chat_template = False`.

## Casos de uso

- Asistente de consulta tecnica offline para estudiantes de ingenieria informatica: el modelo se ejecuta en un portatil con CPU Intel Core Ultra sin GPU dedicada y responde preguntas directas sobre cache, memoria o arquitectura de computadores con 758 MB de disco.
- Base para un tutor de Q&A en una intranet: al no requerir conectividad ni GPU, puede desplegarse como servicio local que atiende consultas formuladas con el formato `Q: ... A:` y limita la generacion a 200 tokens por respuesta.
- Prototipado rapido en NPU Intel AI Boost: util para validar pipelines de inferencia en NPU en un equipo de sobremesa o portatil, midiendo TTFT y throughput antes de migrar a un modelo mayor.
- Generacion de apuntes y resumenes tecnicos de un solo turno: el formato completion es adecuado para producir explicaciones breves a partir de un enunciado, sin necesidad de gestionar historial de conversacion.
- Benchmarking comparativo de backends Intel en laboratorio: el modelo sirve como carga de trabajo ligera y reproducible (26 tokens de prompt, 128 tokens generados) para comparar CPU, iGPU y NPU en terminos de latencia y throughput.
- Educacion en cuantizacion de modelos: la model card documenta paso a paso el flujo optimum-cli + NNCF con INT4 simetrico y group size 128, por lo que el artefacto es un ejemplo practico para ensenar compresion de pesos y sus implicaciones de perdida.
- Clasificacion o extraccion ligera de texto tecnico en ingles: con temperatura baja y salidas cortas puede emplearse para completar plantillas y normalizar respuestas dentro de un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

Si se publican mediciones de latencia y throughput del autor sobre IULinux 0.1 Development, kernel 7.0.0-31-generic, Intel Core Ultra 9 275HX, Intel Graphics iGPU e Intel AI Boost NPU, con OpenVINO y OpenVINO GenAI 2026.4, perfil de energia Performance y alimentacion por corriente alterna. El metodo empleado fue: 26 tokens de prompt, 128 tokens generados, 2 ejecuciones de calentamiento y 5 mediciones, con `do_sample = false` e `ignore_eos = true` para garantizar cargas identicas.

| Dispositivo | Carga del pipeline | TTFT | TPOT | Throughput |
|---|---:|---:|---:|---:|
| Intel Core Ultra 9 275HX (CPU) | 382,59 ms | 51,57 ± 9,91 ms | 15,90 ± 0,74 ms/token | 62,98 ± 2,79 tok/s |
| Intel Graphics iGPU | 1218,85 ms | 54,24 ± 1,77 ms | 15,98 ± 0,29 ms/token | 62,59 ± 1,14 tok/s |
| Intel AI Boost NPU | 986,20 ms | 1147,08 ± 4,16 ms | 29,51 ± 0,10 ms/token | 33,89 ± 0,11 tok/s |

En esta carga concreta de 1B en INT4, CPU y GPU integrada ofrecen un throughput practicamente identico. La NPU rinde menos y sufre un TTFT mucho mayor en esta configuracion, aunque sus mediciones fueron las mas consistentes. El autor no recogio mediciones de consumo energetico, por lo que estos datos no deben interpretarse como una comparacion de eficiencia energetica.

## Requisitos de hardware

- VRAM o memoria necesaria para pesos: aproximadamente 758 MB para el artefacto INT4; la variante FP16 del mismo modelo ocupa 2,4 GB y la INT8, 1,2 GB.
- Memoria adicional para cache KV: no cuantificada en la informacion disponible; depende de la longitud de contexto efectiva, que no se especifica para esta conversion.
- GPU recomendadas: no se documentan GPU dedicadas. El artefacto esta validado en CPU Intel Core Ultra 9 275HX, GPU integrada Intel Graphics e Intel AI Boost NPU.
- Cabe en hardware de consumo: si, en equipos con CPU Intel moderna y, segun el autor, tambien en iGPU y NPU Intel con OpenVINO 2026.4.
- Opciones de despliegue: OpenVINO GenAI con LLMPipeline (dispositivos CPU, GPU y NPU); exportacion reproducible con `optimum-cli export openvino` y compresion con NNCF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato OpenVINO IR no es directamente compatible con ellos sin conversion adicional.
- Instalacion: `python -m pip install "openvino==2026.4" "openvino-genai==2026.4"`.
- Latencia y throughput medidos: entre 62,59 y 62,98 tok/s en CPU e iGPU, y 33,89 tok/s en NPU, con TTFT de ~51 a 54 ms en CPU/iGPU y ~1.147 ms en NPU, para el hardware y la carga descritos.
- Los resultados variaran con el hardware, el firmware, las versiones del runtime, las condiciones termicas, la configuracion de energia, la longitud del prompt y los parametros de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Llama-3.2-1B-CE OpenVINO INT4) | ~1B | no confirmado (el base Llama 3.2 1B soporta 128.000 tokens) | OpenVINO IR INT4, 758 MB | llama3.2 | en | Validado en CPU, iGPU y NPU Intel con OpenVINO |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | safetensors FP16/BF16 | llama3.2 | multilingue (8 idiomas declarados por Meta) | Modelo de proposito general; requiere conversion propia a OpenVINO o GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | multilingue | Alternativa de licencia permisiva y ecosistema de cuantizaciones amplio |
| Gemma 2 2B-it | ~2,6B | 8.192 tokens | safetensors, GGUF | licencia Gemma | multilingue | Mayor tamano y ventana de contexto mas corta |

No hay datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para este modelo en la informacion disponible, por lo que la comparacion se limita a parametros, contexto, formato, licencia e idiomas. El modelo de esta ficha es el unico de la tabla ya empaquetado para NPU Intel.

## Limitaciones y advertencias

- Modelo practicamente sin validacion por la comunidad: 0 descargas y 0 valoraciones en el momento del registro de los datos.
- Doble cuantizacion con perdida: los pesos pasaron por INT8 → FP16 denso → INT4, de modo que la calidad puede degradarse mas que en una conversion directa desde FP16.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Formato de uso restrictivo: esta pensado como modelo de completado Q/A, no como asistente conversacional; el autor recomienda preguntas tecnicas cortas y directas en lugar de prompts con roles.
- La model card no especifica composicion del dataset, numero de tokens de entrenamiento ni proceso de alineacion, por lo que no es posible evaluar sesgos de origen.
- Riesgo de alucinacion relevante en contenido tecnico: al ser un modelo de ~1B especializado, puede generar explicaciones plausibles pero incorrectas sobre detalles de arquitectura de computadores.
- La longitud de contexto efectiva no esta confirmada para esta conversion, aunque el modelo base declare 128.000 tokens; no se debe asumir ese limite en produccion sin medirlo.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones, exige incluir el aviso de licencia y la atribucion "Built with Llama", e impone restricciones de uso recogidas en la politica de uso aceptable. No se hereda la licencia del modelo base mas alla de lo que permite la propia licencia Llama 3.2.
- El formato OpenVINO IR limita el despliegue a runtimes OpenVINO; no es utilizable directamente en vLLM, llama.cpp, Ollama o TGI.
- Los benchmarks publicados miden latencia y throughput en un unico sistema IULinux concreto y no incluyen mediciones de consumo energetico, por lo que no permiten conclusiones de eficiencia.
- El sistema de referencia emplea versiones futuras o no estandar (IULinux 0.1 Development, kernel 7.0.0-31-generic, OpenVINO 2026.4), lo que dificulta reproducir las cifras en entornos actuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-INT4
- Modelo base (ajuste fino en ingenieria informatica): https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO: https://github.com/openvinotoolkit/openvino
- optimum-intel (exportacion a OpenVINO): https://github.com/huggingface/optimum-intel
- NNCF (compresion de pesos): https://github.com/openvinotoolkit/nncf
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs o demos) sobre este modelo.
