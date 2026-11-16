# netprojects/SenseNova-6.8-Code2Video-MLX-bf16

## Resumen

SenseNova-6.8-Code2Video es un modelo de lenguaje y vision de 27.356 millones de parametros desarrollado por SenseTime (SenseNova) y afinado a partir de Qwen3.8-27B. Su proposito es la creacion de video programatica: el modelo planifica una pieza audiovisual, escribe las escenas como codigo, las renderiza mediante las herramientas de la skill `code-video` de SenseNova, inspecciona los fotogramas resultantes y revisa el resultado turno tras turno en un bucle agentico. La variante aqui descrita es una conversion a MLX en bf16 publicada por NetProjects (Internet Projects Ltd), no afiliada ni a SenseTime ni a Alibaba Cloud, pensada para ejecucion local en Apple Silicon.

La relevancia de esta build radica en que preserva los pesos bf16 completos del checkpoint original (revision `0f99ab0`), actuando como referencia de paridad para las otras cuantizaciones MLX publicadas por el mismo autor (4, 6 y 8 bits). Mantiene el escalado YaRN de rope (factor 2) del config original, de modo que el contexto largo funciona igual que en el modelo de referencia; se verifico recuperacion exacta de un dato situado en un prompt de 65.586 tokens sobre la build de 8 bits. El checkpoint upstream no incluye cabeza de prediccion multi-token (MTP), por lo que estas builds tampoco la tienen.

El modelo esta orientado a motion design, explicativos, tipografia cinetica y data stories generados enteramente mediante codigo, con soporte de tool calling en formato Qwen3 (`<tool_call>`) y una API compatible con OpenAI servida por `mlx_vlm.server`. La licencia es Apache-2.0, la misma del modelo original y de Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.8-27B, sin MTP); rope scaling YaRN factor 2 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | contexto largo con YaRN factor 2; verificado 65.586 tokens en la build de 8 bits (el maximo nominal no se especifica) |
| Tipos de cuantizacion | bf16 (esta build); el autor publica tambien 4-bit, 6-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |
| Tamano del repo | 54,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | sensenova/SenseNova-6.8-Code2Video (revision 0f99ab0) |

## Arquitectura y entrenamiento

Se trata de un transformer multimodal de tipo image-text-to-text construido sobre Qwen3.8-27B y afinado por SenseTime para la tarea Code2Video. El modelo acepta texto e imagenes (fotogramas renderizados) y emite texto y bloques de llamada a herramientas en el formato `<tool_call>` de Qwen3. El config conserva el escalado YaRN de rope con factor 2 del checkpoint original, lo que habilita el uso de contextos largos; la conversion MLX no altera este parametro.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El checkpoint upstream no incluye cabeza de prediccion multi-token (MTP), por lo que las builds MLX carecen de decodificacion especulativa basada en MTP. La conversion fue validada comprobando que todos los ficheros de pesos de la revision upstream coinciden con los hashes SHA-256 del Hub.

## Capacidades

- Generacion de texto y razonamiento sobre planes audiovisuales: guiones, escaletas, timing y paletas de color.
- Generacion de codigo para renderizado de video: escribe las escenas como codigo ejecutable que se renderiza con las herramientas de la skill `code-video`.
- Vision: interpreta imagenes y fotogramas renderizados para revisar layout, composicion y cambios sugeridos.
- Tool calling / function calling: emite bloques `<tool_call>` bien formados con funcion y argumentos correctos; `mlx_vlm.server` devuelve llamadas parseadas en formato OpenAI (`finish_reason: tool_calls`).
- Comportamiento agentico multi-turno: planifica, ejecuta, inspecciona el resultado y revisa en iteraciones sucesivas.
- Contexto largo: recuperacion exacta de informacion en prompts de hasta 65.586 tokens (verificado en 8 bits).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Motion design programatico: el modelo recibe un brief (por ejemplo, una intro de tipografia cinetica de 10 segundos para la palabra ORBIT) y devuelve escenas, timing y colores como codigo listo para renderizar en un sandbox controlado.
- Explicativos y data stories: genera visualizaciones animadas a partir de datos y narrativa, escribiendo el codigo de cada escena y revisando los fotogramas renderizados para corregir el layout.
- Revision automatizada de renders: se le pasa un fotograma (`frame.png`) y devuelve una critica concreta sobre composicion, jerarquia tipografica o espaciado, util como paso de control de calidad dentro del pipeline.
- Agente local de creacion de video en Apple Silicon: desplegado con `mlx_vlm.server` como endpoint compatible con OpenAI, un harness agentico puede orquestar el bucle planificar-escribir-renderizar-revisar sin salir del Mac.
- Prototipado rapido de piezas audiovisuales: equipos de diseno pueden iterar sobre variantes de una misma pieza ejecutando el modelo en local con la build de 6 bits (22,8 GB), que mantiene paridad practica con bf16 en turnos agenticos reales.
- Generacion de codigo de animacion para integracion en pipelines: el modelo produce codigo con llamadas a herramientas que puede insertarse en flujos de CI/CD de renderizado, con revision humana de los renders antes de publicar.
- Investigacion sobre agentes multimodales: las trayectorias de produccion publicadas por SenseNova (`trajectories/all.openai.jsonl`) permiten evaluar paridad de cuantizaciones y estudiar bucles agenticos con feedback visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si documenta metricas de paridad de la conversion MLX frente a bf16, medidas el 16 de noviembre de 2026 en un MacBook Pro M5 Max (128 GB) con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11:

| Build | Tamano | Mismo siguiente token que bf16 (turnos agenticos) | NLL vs bf16 (turnos agenticos) | Mismo token en 878 posiciones fijas |
|---|---|---|---|---|
| 8-bit | 29,5 GB | 98,3% | −0,001 | 99,1% |
| 6-bit (recomendada) | 22,8 GB | 96,8% | ±0,000 | 98,7% |
| 4-bit | 16,1 GB | 91,7% | +0,032 | 97,3% |
| bf16 (esta build) | 54,7 GB | referencia | referencia | referencia |

Las metricas de turnos agenticos se calcularon sobre 20 turnos de asistente de las trayectorias de produccion publicadas por SenseNova, con plantilla de chat, esquemas de herramientas y hasta 16K tokens de contexto por turno (10.406 tokens puntuados). Ademas se verifico la recuperacion exacta de un dato en un prompt de 65.586 tokens (8 bits), la emision de un `<tool_call>` bien formado con funcion y argumentos correctos (8 bits) y la descripcion correcta de una imagen de prueba en las builds de 4, 6 y 8 bits.

## Requisitos de hardware

- Esta build bf16 ocupa 54,7 GB en disco; para inferencia se recomienda al menos 64 GB de memoria unificada, y de forma realista 96-128 GB para dejar margen a KV cache en contextos largos.
- Verificada en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Alternativas mas ligeras del mismo autor: 8-bit (29,5 GB), 6-bit recomendada (22,8 GB) y 4-bit (16,1 GB), aptas para equipos con 32-48 GB de memoria unificada.
- No aplica a GPU NVIDIA: esta build es exclusiva de MLX y Apple Silicon. Para CUDA habria que usar el checkpoint original de SenseNova con otro runtime.
- Despliegue: `mlx-vlm>=0.7.11` para generacion (`mlx_vlm.generate`) y servidor (`mlx_vlm.server`) con API compatible con OpenAI y tool calls.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video (original SenseTime) | 27B | largo, con YaRN factor 2 | Code2Video agentico multimodal | Apache-2.0 | Hugging Face (sensenova) |
| Esta build MLX bf16 (NetProjects) | 27,356B | verificado 65.586 tokens | Misma capacidad, runtime MLX | Apache-2.0 | Hugging Face (netprojects) |
| Builds MLX 4/6/8 bits (NetProjects) | 27,356B | idem | Misma capacidad, cuantizada | Apache-2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B (modelo base) | 27B | no disponible | LLM multimodal generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El codigo generado debe ejecutarse siempre en un sandbox controlado y los renders deben revisarse antes de publicarse; el modelo no garantiza codigo seguro ni correcto.
- Riesgo de alucinacion en la planificacion de escenas, el timing y los argumentos de herramientas; conviene validar las llamadas antes de ejecutarlas.
- La build de 4 bits se desvia mas de bf16 en turnos agenticos largos (91,7% de coincidencia de siguiente token, NLL +0,032); para trabajo agentico se recomienda 6 u 8 bits.
- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA sin reconvertir el checkpoint original.
- No se dispone de informacion sobre idiomas soportados ni sobre sesgos conocidos.
- El checkpoint no incluye cabeza MTP, de modo que no hay decodificacion especulativa integrada.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar el alcance y las condiciones del modelo original; esta build no esta afiliada a SenseTime ni a Alibaba Cloud.
- El modelo esta pensado para video programatico; usarlo fuera de ese dominio (por ejemplo, como LLM generalista) no esta validado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-bf16
- Modelo original: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub de SenseNova (skill, guias y prompts): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Build MLX 6 bits: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Build MLX 8 bits: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-4bit
- Otro modelo SenseNova en MLX: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Perfil del autor: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com
