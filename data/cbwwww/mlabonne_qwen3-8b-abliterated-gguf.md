# cbwwww/mlabonne_Qwen3-8B-abliterated-GGUF

## Resumen

`cbwwww/mlabonne_Qwen3-8B-abliterated-GGUF` es un repositorio de cuantizaciones GGUF del modelo `mlabonne/Qwen3-8B-abliterated`, que a su vez es una variante "abliterated" del Qwen3-8B de Alibaba. La abliteration es una tecnica de edicion de pesos que elimina la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a peticiones que el modelo original filtraria. El resultado es un modelo de 8.190.735.360 parametros (aproximadamente 8,19 mil millones) con el mismo conocimiento base que Qwen3-8B pero sin las capas de rechazo aprendidas durante el alineamiento.

El repositorio en cuestion lo publica el usuario `cbwwww` y contiene unicamente pesos en formato GGUF generados con llama.cpp (release b5415) usando cuantizacion con imatrix. Segun la model card, el trabajo de cuantizacion original corresponde a bartowski, y el modelo base abliterado a mlabonne. El repositorio ocupa 129,8 GB en total porque agrupa todas las variantes de cuantizacion, desde bf16 (16,39 GB) hasta Q3_K_S y otras opciones de baja precision.

Es relevante para desarrolladores e investigadores que necesitan ejecutar un modelo de 8B en hardware de consumo (CPU o GPU modesta) y que, por motivos de investigacion sobre alineamiento, red teaming o generacion de contenido sin restricciones de rechazo, quieren una variante sin censura. La licencia declarada es Apache 2.0, heredada de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q3_K_XL, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q2_K_L, Q3_K_S (lista parcial en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, sin splits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only de aproximadamente 8,19 mil millones de parametros. Sobre esa base, mlabonne aplico abliteration, una tecnica que calcula la direccion media de rechazo a partir de pares de activaciones (prompts que el modelo rechaza frente a prompts benignos equivalentes) y proyecta los pesos para eliminar esa direccion. No se trata de un reentrenamiento ni de un fine-tuning con RLHF o DPO adicional: es una edicion post-hoc de los pesos que preserva las capacidades del modelo original pero suprime el comportamiento de negativa.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas adicionales del modelo base. Las cuantizaciones GGUF se generaron con llama.cpp b5415 aplicando el metodo imatrix, que calcula una matriz de importancia a partir de un dataset de calibracion para asignar mas precision a los pesos mas relevantes. El prompt format documentado es el formato ChatML de Qwen (`<|im_start|>system ... <|im_end|>`), lo que permite integrarlo en pipelines conversacionales estandar.

## Capacidades

- Generacion de texto conversacional multi-turno con el formato ChatML de Qwen.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-8B.
- Generacion de codigo y matematicas (capacidad del modelo base; no se aportan benchmarks en la informacion disponible).
- Ejecucion local en CPU y GPU mediante llama.cpp y proyectos compatibles (LM Studio, Ollama, etc.).
- Comportamiento sin rechazo: la abliteration elimina la direccion de negativa, por lo que el modelo responde a peticiones que el Qwen3-8B original filtraria.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo de texto.
- Capacidades multilingues: no detalladas en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad de las respuestas, comparandolo con el Qwen3-8B original en el mismo hardware.
- Red teaming y evaluacion de robustez: sirve como modelo "sin filtros" de referencia para probar si los clasificadores de seguridad de un sistema detectan contenido que un modelo alineado rechazaria.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles que el modelo base declinaria tratar, ejecutandose localmente con llama.cpp.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (5,03 GB) o IQ4_XS (4,56 GB) cabe en GPUs de 8 GB de VRAM y en equipos con 8-16 GB de RAM, lo que permite prototipado offline sin coste de API.
- Procesamiento por lotes en CPU: las variantes Q4_0 e IQ4_NL ofrecen repacking online para ARM y AVX, utiles para generar grandes volumenes de texto en servidores sin GPU.
- Experimentacion con cuantizacion: el repositorio incluye mas de 20 variantes, lo que permite medir el impacto de la precision (de bf16 a Q3_K_S) en la calidad de salida sobre una misma tarea.
- Base para fine-tuning ligero: al ser un GGUF, sirve para inferencia; para fine-tuning habria que partir del modelo safetensors original de mlabonne.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y KV cache):
  - bf16: 16,39 GB.
  - Q8_0: 8,71 GB.
  - Q6_K_L / Q6_K: 7,03 GB / 6,73 GB.
  - Q5_K_M: 5,85 GB.
  - Q4_K_M: 5,03 GB.
  - IQ4_XS: 4,56 GB.
  - Q3_K_M: 4,12 GB.
  - Q3_K_S: por debajo de 4 GB (tamano exacto no disponible en la informacion proporcionada).
- GPU recomendadas: bf16 requiere GPU de 24 GB o mas (RTX 3090/4090, A100, H100). Q8_0 cabe en 12-16 GB (RTX 4070 Ti Super, RTX 4080). Q4_K_M e inferiores caben en 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: si, desde Q5_K_M hacia abajo en tarjetas de 8 GB; las variantes Q3 y Q2 caben en 6 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier proyecto basado en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo safetensors original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cbwwww/mlabonne_Qwen3-8B-abliterated-GGUF | 8,19B | no disponible | GGUF | Apache 2.0 | Variante abliterated cuantizada; sin benchmarks publicados en la ficha |
| mlabonne/Qwen3-8B-abliterated | 8,19B | no disponible | safetensors | Apache 2.0 | Modelo base abliterado del que derivan estas cuantizaciones |
| Qwen/Qwen3-8B | 8,19B | no disponible | safetensors | Apache 2.0 | Modelo original alineado, con rechazo activo ante peticiones sensibles |
| bartowski/mlabonne_Qwen3-8B-abliterated-GGUF | 8,19B | no disponible | GGUF | Apache 2.0 | Repositorio de cuantizaciones original de bartowski; el repositorio de cbwwww replica ese trabajo |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, pero no garantiza que el modelo sea seguro: puede generar contenido danino, ilegal o sesgado sin aviso, y no debe exponerse como servicio publico sin filtros externos.
- Riesgo de alucinacion: inherente al modelo base; la edicion de pesos no lo corrige y puede agravarlo en dominios donde el rechazo actuaba como salvaguarda.
- La abliteration puede degradar ligeramente la coherencia y el rendimiento en tareas que dependian del alineamiento original; no hay benchmarks en la informacion disponible que cuantifiquen esa perdida.
- Sesgos conocidos del modelo base Qwen3-8B, no documentados en esta ficha.
- Longitud de contexto e idiomas soportados no confirmados en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; el aviso de la model card remite a la licencia de Qwen3-8B.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo dia (2026-11-02): es un artefacto reciente sin validacion de la comunidad.
- Los enlaces de descarga de la model card apuntan al repositorio de bartowski, no al de cbwwww; conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- El tamano del repo (129,8 GB) obliga a descargar ficheros individuales, no la rama completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cbwwww/mlabonne_Qwen3-8B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/mlabonne/Qwen3-8B-abliterated
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio de cuantizaciones de bartowski: https://huggingface.co/bartowski/mlabonne_Qwen3-8B-abliterated-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp/
- Release de llama.cpp usada (b5415): https://github.com/ggerganov/llama.cpp/releases/tag/b5415
- Dataset de calibracion imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
