# darrellbest/Qwen3.5-2B-Heretic-GGUF

## Resumen

Qwen3.5-2B-Heretic-GGUF es la distribucion en formato GGUF de darrellbest/Qwen3.5-2B-Heretic, una version del modelo multimodal Qwen3.5-2B de Qwen a la que se le ha eliminado el comportamiento de rechazo mediante la tecnica de ablacion por rango arbitrario (Arbitrary-Rank Ablation, ARA) implementada en la herramienta Heretic. El resultado declarado por el autor es una reduccion de los rechazos de 97/100 a 6/100 sobre un conjunto de prueba de 100 peticiones, con una divergencia KL de 0.0302 respecto al modelo original. Se publica bajo licencia Apache 2.0 y esta pensado para ejecucion local con llama.cpp y Ollama.

El modelo es multimodal de tipo image-text-to-text: ademas de los pesos del lenguaje, el repositorio incluye un proyector de vision (`Qwen3.5-2B-Heretic-mmproj-F16.gguf`, 0,67 GB) que debe cargarse junto al modelo para procesar imagenes. El recuento de parametros de los safetensors asociados es de 1.942.653.248, es decir, unos 1,94 mil millones de parametros. El repositorio ocupa 8,0 GB en total e incluye tres cuantizaciones: BF16 sin perdida (3,90 GB), Q8_0 (2,08 GB) y Q4_K_M (1,31 GB).

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~2B con vision y modo de razonamiento en hardware de consumo; por otro, es un ejemplo de modelo "abliterated" o "uncensored" con las salvaguardas reducidas de forma deliberada, lo que obliga a evaluar con cuidado su idoneidad en entornos de produccion. El autor indica explicitamente que los archivos han sido verificados en `llama-server` y Ollama, con respuestas correctas en prompts ordinarios y en descripcion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo multimodal image-text-to-text (modelo de lenguaje basado en Qwen3.5-2B mas un codificador de vision/proyector `mmproj`) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: BF16 (sin perdida), Q8_0, Q4_K_M. Proyector de vision en F16. En la familia completa tambien existen FP8 W8A8 y NVFP4 (compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (`license_link` apunta a Qwen/Qwen3.5-2B/LICENSE) |
| Formato de pesos | GGUF (llama.cpp / Ollama); safetensors bf16 en el repositorio base |
| Tamano del repositorio | 8,0 GB |
| Tamano de archivos | BF16: 3,90 GB · Q8_0: 2,08 GB · Q4_K_M: 1,31 GB · mmproj F16: 0,67 GB |
| Modelo base | darrellbest/Qwen3.5-2B-Heretic (relacion: quantized); origen final: Qwen/Qwen3.5-2B |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 25 de septiembre de 2026 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de lo que se deduce de la model card: se trata de un modelo multimodal de tipo image-text-to-text que combina los pesos de un modelo de lenguaje con un proyector de vision independiente (`Qwen3.5-2B-Heretic-mmproj-F16.gguf`), que es lo que habilita la entrada de imagenes en llama.cpp. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

La intervencion tecnica que define a este modelo es la ablacion de pesos completa mediante Arbitrary-Rank Ablation (ARA) aplicada con la herramienta Heretic sobre el modelo Qwen3.5-2B. Segun la model card, esta modificacion reduce el comportamiento de rechazo de 97/100 a 6/100 peticiones sobre el conjunto de evaluacion empleado, con una divergencia KL de 0.0302 respecto al modelo original, lo que indica una alteracion relativamente contenida de la distribucion de salida. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp y la cuantizacion con `llama-quantize`, sin uso de imatrix.

Un detalle operativo relevante es que el modo de razonamiento (thinking) esta activado por defecto. Se desactiva por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}` en llama.cpp o `think: false` en Ollama. El autor indica que BF16 y Q8_0 reproducen palabra por palabra la salida greedy del modelo en safetensors, mientras que Q4_K_M presenta diferencias menores de redaccion.

## Capacidades

- Generacion de texto conversacional y multi-turno (tag `conversational`).
- Modo de razonamiento explicito (thinking mode) activado por defecto y desactivable por peticion.
- Procesamiento de imagenes: el pipeline declarado es image-text-to-text y la model card confirma que los tres archivos describen correctamente una imagen de prueba (un circulo rojo y un cuadrado azul) cuando se cargan junto al proyector `mmproj`.
- Aritmetica basica: verificado por el autor con 17 x 23 = 391 en Ollama con el modo thinking desactivado.
- Comportamiento con rechazos reducidos de forma deliberada: 6/100 rechazos frente a 97/100 del modelo original segun la medicion del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no aparece informado en la ficha de HuggingFace).

## Casos de uso

- Asistentes conversacionales locales sin conexion: el modelo, con cuantizacion Q4_K_M (1,31 GB) o Q8_0 (2,08 GB), cabe en equipos de gama media o incluso en portatiles, y permite desplegar un chatbot que nunca envia datos a un servicio externo, algo critico en entornos con requisitos de confidencialidad.
- Descripcion y analisis de imagenes en local: gracias al proyector `mmproj` en F16, se puede alimentar con una fotografia o captura y obtener una descripcion textual; util para catalogar imagenes, generar texto alternativo o extraer informacion de documentos escaneados sin salir del equipo.
- Preprocesado y clasificacion de texto a gran escala: con un coste de inferencia bajo (79 tok/s en Q4_K_M sobre una RTX PRO 6000, segun `llama-bench`), es viable procesar lotes de documentos para etiquetado, resumen o extraccion de campos simples antes de pasar a un modelo mayor.
- Prototipado de aplicaciones multimodales: al existir variantes en safetensors bf16 (para transformers, vLLM y SGLang), FP8 (vLLM) y NVFP4 (vLLM sobre Blackwell), permite desarrollar un prototipo y escalarlo despues a un formato de mayor rendimiento sin cambiar de modelo.
- Investigacion sobre alineacion y seguridad: el modelo es un caso de estudio controlado de ablacion de rechazos con una metrica de divergencia KL declarada (0.0302), util para analizar como afecta la eliminacion de salvaguardas al comportamiento del modelo en tareas neutras.
- Generacion creativa sin filtros restrictivos: para escritura de ficcion, guiones o narrativa que aborde tematicas sensibles, donde los rechazos de un modelo convencional interrumpirian el flujo de trabajo. Requiere revision humana del resultado.
- Educacion y demostraciones tecnicas: con 1,94 mil millones de parametros y cuantizaciones de 1,31 a 3,90 GB, es adecuado para talleres donde se explique cuantizacion, ejecucion con llama.cpp u Ollama y diferencias entre formatos de pesos en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son las mediciones propias del proceso de ablacion y de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Rechazos sobre 100 peticiones (modelo Heretic) | 6/100 |
| Rechazos sobre 100 peticiones (modelo original Qwen3.5-2B) | 97/100 |
| Divergencia KL respecto al modelo original | 0.0302 |
| Velocidad de generacion, BF16 (`llama-bench`, RTX PRO 6000) | 57 tok/s |
| Velocidad de generacion, Q8_0 (`llama-bench`, RTX PRO 6000) | 74 tok/s |
| Velocidad de generacion, Q4_K_M (`llama-bench`, RTX PRO 6000) | 79 tok/s |

Nota: las velocidades se midieron en una RTX PRO 6000 compartida con otras cargas de trabajo, por lo que pueden variar en funcion del uso concurrente de la GPU.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, calculados a partir del tamano de archivo mas el proyector de vision y sobrecarga de contexto):
  - Q4_K_M: aproximadamente 2,0-2,5 GB (1,31 GB de pesos + 0,67 GB de proyector + cache KV).
  - Q8_0: aproximadamente 2,8-3,5 GB.
  - BF16: aproximadamente 4,6-5,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM dedicada para las cuantizaciones bajas; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superior ejecutan cualquiera de las tres variantes con holgura. Para BF16 en produccion, se recomienda una GPU de 8 GB o mas. El autor ha verificado el rendimiento en una RTX PRO 6000.
- Cabe en GPU de consumo: si. Q4_K_M y Q8_0 caben en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en equipos con graficos integrados compartiendo memoria del sistema, dado el reducido tamano de los pesos.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama, segun la model card. El repositorio base en safetensors esta pensado para transformers, vLLM y SGLang; las variantes FP8 y NVFP4 de la familia estan pensadas para vLLM (NVFP4 requiere GPU Blackwell).
- Comando de referencia indicado por el autor:

```bash
llama-server -m Qwen3.5-2B-Heretic-Q8_0.gguf --mmproj Qwen3.5-2B-Heretic-mmproj-F16.gguf --jinja -ngl 99
```

- Latencia y throughput: 57 tok/s en BF16, 74 tok/s en Q8_0 y 79 tok/s en Q4_K_M, medidos con `llama-bench` en una RTX PRO 6000 compartida. No se dispone de datos de latencia por peticion ni de throughput agregado en modo servidor con multiples usuarios concurrentes.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| darrellbest/Qwen3.5-2B-Heretic-GGUF (este) | GGUF BF16/Q8_0/Q4_K_M + mmproj | ~1,94 mil millones | No disponible | Apache 2.0 | llama.cpp, Ollama | Vision + thinking, rechazos reducidos (6/100) |
| darrellbest/Qwen3.5-2B-Heretic | Safetensors bf16 | ~1,94 mil millones | No disponible | Apache 2.0 | transformers, vLLM, SGLang | Mismo modelo sin cuantizar; 4,58 GB |
| darrellbest/Qwen3.5-2B-Heretic-FP8 | FP8 W8A8, compressed-tensors | ~1,94 mil millones | No disponible | Apache 2.0 | vLLM | 3,59 GB |
| darrellbest/Qwen3.5-2B-Heretic-NVFP4 | NVFP4, compressed-tensors | ~1,94 mil millones | No disponible | Apache 2.0 | vLLM sobre Blackwell | 3,15 GB |
| Qwen/Qwen3.5-2B (original) | Safetensors | ~1,94 mil millones | No disponible | Apache 2.0 | transformers, vLLM, SGLang | Comportamiento de rechazo intacto (97/100) |
| mradermacher/Qwen3.5-2B-heretic-GGUF y -i1-GGUF | GGUF | No disponible | No disponible | No disponible | llama.cpp | Cuantizaciones alternativas del mismo modelo base; no hay datos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes, por lo que la comparacion se limita a formato, tamano, licencia y compatibilidad de despliegue.

## Limitaciones y advertencias

- Reduccion deliberada de salvaguardas: el modelo ha sido modificado para eliminar buena parte de su comportamiento de rechazo (de 97/100 a 6/100). Puede generar contenido que el modelo original rechazaria, incluido material sensible, ofensivo o potencialmente danino. El propio autor advierte: "Reduced safety guardrails by design. You are responsible for what you do with it."
- No es apto para despliegues orientados al publico general ni para aplicaciones reguladas sin filtros adicionales, supervision humana y una evaluacion de riesgos propia.
- Riesgo de alucinacion: con ~1,94 mil millones de parametros, la tendencia a inventar hechos, citas o referencias es estructuralmente alta. No debe usarse como fuente de verdad sin verificacion externa.
- La ablacion altera la distribucion de salida del modelo (divergencia KL 0.0302). Aunque el valor es bajo, implica degradaciones potenciales en tareas distintas del conjunto de evaluacion de rechazos empleado, que no ha sido caracterizado en la informacion disponible.
- Longitud de contexto e idiomas soportados no estan documentados en la ficha, lo que impide garantizar un comportamiento correcto en conversaciones largas o en idiomas distintos del ingles.
- Sin datos de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes que permitan situar el modelo frente a alternativas de su tamano.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al tratarse de una obra derivada de Qwen3.5-2B conviene revisar la licencia del modelo original enlazada en la model card (`Qwen/Qwen3.5-2B/blob/main/LICENSE`) para confirmar condiciones adicionales.
- Rendimiento medido en una GPU compartida: las cifras de tok/s pueden no reproducirse en otras configuraciones.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El campo de idiomas no esta informado y la model card esta redactada unicamente en ingles.
- Q4_K_M no reproduce exactamente la salida greedy del modelo original (BF16 y Q8_0 si lo hacen), por lo que si se requiere fidelidad al modelo de referencia debe evitarse Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-GGUF
- Modelo base (safetensors bf16): https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-FP8
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Herramienta Heretic (ablacion de rechazos): https://github.com/p-e-w/heretic
- Cuantizaciones alternativas de terceros: https://huggingface.co/mradermacher/Qwen3.5-2B-heretic-GGUF
- Cuantizaciones alternativas de terceros (imatrix): https://huggingface.co/mradermacher/Qwen3.5-2B-heretic-i1-GGUF
- Ficha en directorio de modelos GGUF de terceros: https://local-ai-zone.github.io/models/qwen3-5-2b-heretic.html
- Guia de ejecucion local de Qwen3.5 (referencia general, no especifica de este modelo): https://www.qtithow.com/2026/09/running-qwen-35-locally-on-single-gpu.html
- Repositorio GitHub de la serie Qwen (informacion general de la familia): https://github.com/QwenLM/Qwen3.8
