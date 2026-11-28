# 1bit-MONSTER/Mistral-7B-Instruct-v0.2-GGUF

## Resumen

Este repositorio es una redistribución en formato GGUF del modelo Mistral-7B-Instruct-v0.2, publicado por el usuario 1bit-MONSTER. No se trata de un modelo nuevo ni de un ajuste fino: los pesos corresponden a la cuantización Q4_K_M generada originalmente por TheBloke a partir del modelo base de Mistral AI, y se rehospedan aquí junto con mediciones de rendimiento realizadas sobre hardware AMD Strix Halo con el motor de inferencia propio del autor (1bit engine, ruta llama.cpp). El modelo original es un transformer decoder-only de 7.241.732.096 parámetros con 32.768 tokens de contexto, entrenado por Mistral AI y publicado bajo licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta una de las cuantizaciones de referencia (Q4_K_M) del modelo instruct de Mistral, que sigue siendo una opción habitual para despliegues en hardware de gama media por su equilibrio entre calidad y huella de memoria. Por otro lado, aporta cifras de throughput medidas de forma explícita (pp512: 2.052 ± 6 tok/s; tg128: 48 ± 0,1 tok/s) sobre un AMD Ryzen AI Max+ 395 con Radeon 8060S, un dato poco frecuente en repositorios GGUF y útil para dimensionar despliegues en iGPU de altas prestaciones.

Conviene subrayar que el valor añadido del repositorio es operativo, no algorítmico: el comportamiento del modelo es el de Mistral-7B-Instruct-v0.2 en Q4_K_M. Cualquier evaluación de capacidades, sesgos o licencia debe remitirse al modelo base de Mistral AI, y la licencia Apache 2.0 se hereda sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, modelo base mistralai/Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido: `mistral-7b-instruct-v0.2.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base esta orientado principalmente a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 4,4 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Autor de la cuantizacion | TheBloke (rehospedada por 1bit-MONSTER) |
| Descargas / likes | 25 / 0 |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de aproximadamente 7,24 mil millones de parámetros, con atención por ventanas deslizantes (sliding window attention) y contexto de 32.768 tokens, tal como lo publicó Mistral AI. El proceso de entrenamiento (número de tokens, composición del dataset, fases de ajuste instructivo y de alineación) corresponde íntegramente a Mistral AI y no se documenta en este repositorio; esta ficha no dispone de esos datos más allá de lo que declara el modelo base.

La única intervención técnica de este repositorio es la cuantización a Q4_K_M, un esquema de cuantización por bloques de 4 bits con escalas de 6 bits para los pesos más sensibles, que reduce el peso en disco a unos 4,4 GB. No hay innovaciones propias del autor en el modelo: el repositorio añade, eso sí, un conjunto de mediciones reproducibles con `llama-bench -p 512 -n 128 -r 3` sobre el motor 1bit (build `5776842df`, `--device HRX0 -ngl 99`), además de una verificación funcional de que el fichero responde correctamente a una pregunta conocida.

## Capacidades

- Generación de texto conversacional multi-turno, en el formato instructivo del modelo base.
- Razonamiento y respuesta a instrucciones en inglés principalmente; el soporte multilingüe no está declarado en la model card.
- Generación de código y tareas básicas de matemáticas, con las limitaciones propias de un modelo de 7B.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara modo de razonamiento explícito (thinking mode), visión ni audio.
- No se declara soporte de agentes ni razonamiento multi-paso estructurado.
- Compatible con endpoints (`endpoints_compatible` en los tags de Hugging Face), lo que facilita su exposición mediante APIs compatibles.
- Inferencia local eficiente gracias al formato GGUF y al backend llama.cpp.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede atender conversaciones multi-turno con hasta 32.768 tokens de contexto, adecuado para despliegues en los que no se quiere enviar datos a una API externa y se dispone de una iGPU o GPU de gama media.
- Prototipado rápido en estaciones de trabajo AMD Strix Halo: las mediciones del repositorio (48 tok/s de generación en Q4_K_M) permiten usar el modelo de forma interactiva en un Ryzen AI Max+ 395 sin GPU dedicada.
- Generación y revisión de texto en inglés: redacción de borradores, resúmenes y reescritura de documentos donde el contexto largo evita trocear el material de entrada.
- Chatbot de soporte interno sobre documentación: con 32K de contexto se puede inyectar un manual o base de conocimiento acotada y formular preguntas sobre él, siempre con validación humana por el riesgo de alucinación.
- Evaluación comparativa de motores de inferencia: el repositorio sirve como referencia reproducible para medir throughput de llama.cpp u otros backends GGUF sobre el mismo fichero Q4_K_M.
- Base para experimentos de cuantización: al ser una cuantización estándar de TheBloke, es un punto de partida habitual para comparar Q4_K_M frente a otros niveles (Q5_K_M, Q8_0) en calidad y velocidad.
- Generación de código asistida en local para tareas sencillas (autocompletado, explicación de fragmentos), asumiendo que un 7B no iguala a modelos mayores en tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio solo aporta mediciones de rendimiento de inferencia, que se recogen a continuación:

| Metrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill) | 2.052 ± 6 tok/s | AMD Ryzen AI Max+ 395 (Radeon 8060S), 1bit engine, llama.cpp build `5776842df`, `--device HRX0 -ngl 99`, 2026-11-27 |
| tg128 (generacion) | 48 ± 0,1 tok/s | Mismo entorno que pp512 |
| pp512 (medicion anterior) | 1.192 tok/s | Backend Vulkan del motor 1bit (retirado), 2026-09 |
| tg128 (medicion anterior) | 38,0 tok/s | Backend Vulkan del motor 1bit (retirado), 2026-09 |

Nota: las mediciones se realizaron en una ventana sobre una máquina compartida, según indica la propia model card.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 4,4 GB para los pesos Q4_K_M más overhead de contexto y caché KV; con 32K de contexto la caché KV incrementa el consumo de forma apreciable, por lo que conviene reservar margen adicional.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de memoria libre puede alojar el modelo con contexto moderado; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 lo ejecutan con holgura y permiten contextos largos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en Q4_K_M; en GPUs de 6 GB puede requerir reducir el contexto o descargar capas a CPU.
- iGPU: el repositorio documenta su funcionamiento en AMD Ryzen AI Max+ 395 con Radeon 8060S mediante el motor 1bit.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI y el motor propietario 1bit (`1bit serve -m mistral-7b-instruct-v0.2.Q4_K_M.gguf --device hrx`).
- Latencia y throughput: 48 tok/s de generación y 2.052 tok/s de prefill en el hardware medido; en GPUs dedicadas el throughput será distinto y no está documentado en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/Mistral-7B-Instruct-v0.2-GGUF (este repo) | 7,24B | 32.768 | GGUF Q4_K_M | Apache 2.0 | Hugging Face, 25 descargas |
| TheBloke/Mistral-7B-Instruct-v0.2-GGUF | 7,24B | 32.768 | GGUF (multiples cuantizaciones) | Apache 2.0 | Hugging Face, ampliamente usado |
| mistralai/Mistral-7B-Instruct-v0.2 (original) | 7,24B | 32.768 | safetensors | Apache 2.0 | Hugging Face, referencia oficial |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,24B | 32.768 | safetensors / GGUF de terceros | Apache 2.0 | Hugging Face |

La diferencia principal entre este repositorio y TheBloke/Mistral-7B-Instruct-v0.2-GGUF es que aquí solo se ofrece el fichero Q4_K_M, junto con mediciones de rendimiento en hardware concreto; la calidad del modelo es idéntica al ser el mismo artefacto de cuantización. Frente al modelo original en safetensors, la ventaja es la ligereza y la facilidad de ejecución en CPU/iGPU, con la pérdida de precisión inherente a 4 bits.

## Limitaciones y advertencias

- Sesgos: no se documentan en este repositorio; al tratarse del modelo base de Mistral AI, hereda los sesgos de sus datos de entrenamiento, no auditados aquí.
- Alucinación: riesgo presente como en cualquier LLM de 7B; no se han publicado evaluaciones de fidelidad en esta información.
- Contexto e idioma: el contexto es de 32.768 tokens, pero la model card no declara idiomas soportados; el rendimiento fuera del inglés puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribución a Mistral AI y a TheBloke por la cuantización.
- Cuantización: Q4_K_M introduce pérdida de precisión respecto a los pesos originales; para tareas sensibles conviene evaluar Q5_K_M o Q8_0.
- Repositorio de terceros: es un rehost, no una publicación oficial; la trazabilidad depende de que el fichero coincida con el original de TheBloke.
- Métricas de rendimiento: medidas en una sola máquina compartida y con un motor propietario, por lo que no son directamente extrapolables a otros backends o GPUs.
- Soporte y mantenimiento: repositorio con 0 likes y 25 descargas, sin garantía de actualización ni soporte por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/1bit-MONSTER/Mistral-7B-Instruct-v0.2-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Cuantización original de TheBloke: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Perfil del autor: https://huggingface.co/1bit-MONSTER
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
