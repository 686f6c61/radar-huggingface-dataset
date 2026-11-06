# hdae/karume-gemma4

## Resumen

Karume-gemma4 es una distribución del decodificador de texto de los modelos Gemma 4 de Google (concretamente `gemma-4-E2B-it` y `gemma-4-E4B-it`), convertida al formato de contenedor `.krm` del runtime de inferencia WebGPU Karume. La publica el usuario `hdae` en Hugging Face y su objetivo es permitir ejecutar el modelo directamente en el navegador y en Deno, con una interfaz de tipo "string in, string out", sin necesidad de infraestructura de servidor ni de bibliotecas de Python.

El paquete incluye el tokenizador y el formato de chat junto a los pesos, de modo que la función `chat()` renderiza los turnos, codifica, muestrea y decodifica de forma incremental. Los embeddings por capa se distribuyen como activos del contenedor en lugar de pesos del grafo, de manera que se recogen en el host y se pasan como entrada, manteniéndolos fuera del conjunto residente en GPU. El cargador lee únicamente los rangos de vocabulario que una conversación toca realmente.

Es relevante porque demuestra un patrón de despliegue de LLM en el cliente (navegador/Deno) con pesos bf16 sin recuantizar, contexto configurable hasta 131072 tokens y decodificación especulativa mediante un cabezal drafter separado. No obstante, esta distribución es solo texto: no incluye las torres de visión ni de audio del checkpoint original y no es legible por `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4), extraído y reexpresado en el contenedor Karume (`gemma4/1`) |
| Parametros totales | no disponible (el repositorio no publica el recuento; el nombre sugiere las variantes E2B y E4B de Gemma 4) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens por defecto; configurable entre la longitud de chunk en uso y 131072 (límite posicional declarado) |
| Tipos de cuantizacion | `bf16` (pesos originales sin cambios); el drafter `assistant` va en int8 en todas sus capas, incluidas las lineales |
| Idiomas soportados | no disponible (la model card remite a la del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor Karume `.krm` (secuencia de partes; la primera lleva el grafo y los descriptores), manifiesto `karume.json` (`karume/5`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder de la familia Gemma 4, del que se ha extraído únicamente el decodificador de texto y se ha reexpresado en el formato de contenedor de Karume. Los pesos conservan los valores bf16 del checkpoint original: no hay reentrenamiento ni fine-tuning. Las modificaciones declaradas (en `NOTICE.md`, conforme a Apache 2.0 §4(b)) son la extracción del decodificador, el traslado de los embeddings por capa fuera del grafo a activos del contenedor, la restricción de la salida a los logits y estados ocultos de las filas seleccionadas y la generación de los cos/sin rotatorios en el host como entradas.

El sistema incorpora decodificación especulativa mediante `gemma-4-E2B-it-assistant`, un cabezal drafter de predicción multi-token que lee los estados clave/valor y la tabla de embeddings del modelo principal en lugar de portar los suyos. En esta redistribución, su cabezal de salida disperso por clústeres se ha sustituido por una proyección densa sobre el vocabulario completo. El prefill se ejecuta en chunks de 768 filas por defecto, y la longitud de chunk puede elevarse hasta 768 (cota superior trazada del símbolo de chunk). Los parámetros rotatorios se generan por chunk en el host a partir de los parámetros `rope` declarados, por lo que no se distribuye tabla de posiciones. El exportador utilizado es `karume/0.15.1`.

## Capacidades

- Generación de texto conversacional multi-turno con roles `system`, `developer`, `user` y `assistant`.
- Decodificación incremental en streaming: los fragmentos se emiten a medida que el decodificador los resuelve, reteniendo caracteres multibyte hasta completarlos.
- Contexto largo configurable hasta 131072 tokens, con capacidad por defecto de 4096.
- Muestreo configurable (temperatura, top-k, top-p) y modo greedy mediante `temperature: 0`.
- Decodificación especulativa con el drafter `assistant` para acelerar la generación.
- Ejecución nativa en navegador y Deno mediante WebGPU.
- Capacidades multilingües: no disponibles en esta ficha (remitidas a la model card del modelo base).
- Sin soporte de tool calling ni function calling: las llamadas a herramientas se rechazan explícitamente.
- Sin canales de pensamiento (thinking): se rechazan explícitamente.
- Sin multimodalidad: no acepta imágenes ni audio; las partes de imagen o audio se rechazan en lugar de descartarse silenciosamente.

## Casos de uso

- Asistente conversacional en el navegador: el modelo se ejecuta íntegramente en el cliente vía WebGPU, sin backend, lo que permite ofrecer chat privado donde los mensajes no salen del dispositivo. Adecuado por su API de streaming y su tokenizador empaquetado.
- Aplicaciones de escritorio o edge con Deno: al ejecutarse como pipeline de Deno con `Pipeline.fromPretrained`, encaja en herramientas de línea de comandos, plugins de editor o servicios ligeros sin dependencias de Python.
- Prototipado y demos de LLM sin servidor: el formato `.krm` y la carga bajo demanda de rangos de vocabulario permiten publicar demos estáticas que descargan los pesos una vez y los cachean (verificados por `size`/`sha256` del manifiesto).
- Procesamiento de documentos con contexto largo: con capacidad configurable hasta 131072 tokens, puede resumir o extraer información de conversaciones y documentos extensos en una sola ventana.
- Generación de texto con latencia controlada: el drafter `assistant` en int8 y la decodificación especulativa reducen el coste por token en entornos con GPU integrada, útil para autocompletado o sugerencias en tiempo real.
- Evaluación e investigación de runtimes WebGPU: sirve como banco de pruebas reproducible (fijando `revision` a un commit) para medir throughput de prefill en chunks de 768 filas y comparar estrategias de cuantización en el cliente.
- Chatbot embebido en aplicaciones web con requisitos de privacidad: al no requerir tool calling ni visión, el subconjunto de funcionalidad es suficiente para respuestas de texto y reduce la superficie de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente a la documentación del modelo base (`google/gemma-4-E2B-it`) para capacidades, limitaciones, evaluaciones y guía de seguridad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 38.2 GB e incluye las variantes `e2b` y `e4b` en bf16; la variante cargada debe caber en memoria de GPU junto con el grafo y los estados clave/valor del contexto en uso.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime es WebGPU, por lo que depende de la implementación WebGPU del navegador o de Deno sobre la GPU del sistema.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); la información no lo especifica.
- Opciones de despliegue: exclusivamente el runtime Karume vía `jsr:@karume/models/gemma` (navegador y Deno). No es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI, dado que usa un contenedor propio con grafo embebido.
- Latencia y throughput: no disponibles. Se conoce que el prefill se ejecuta en chunks de 768 filas por defecto y que existe decodificación especulativa con el drafter `assistant`, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| hdae/karume-gemma4 (e2b/e4b) | no disponible | 4096 por defecto, hasta 131072 | `.krm` (Karume) | Karume (WebGPU, Deno) | Apache 2.0 |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (checkpoint original) | transformers y ecosistema estándar | Apache 2.0 |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors (checkpoint original) | transformers y ecosistema estándar | Apache 2.0 |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. La diferencia principal frente a los checkpoints originales es el formato de contenedor y el runtime: Karume-gemma4 prioriza ejecución en cliente, mientras que los originales requieren pilas de inferencia estándar y conservan las torres de visión y audio.

## Limitaciones y advertencias

- Solo texto: no incluye las torres de visión ni de audio del checkpoint original y no puede procesar imágenes ni audio.
- No es legible por `transformers`: requiere el pipeline Karume que implementa `gemma4/1`.
- Sin tool calling ni function calling: las llamadas a herramientas se rechazan, lo que impide integrarlo en flujos de agentes con herramientas.
- Sin canales de pensamiento: no admite modos de razonamiento explícito del modelo base.
- Idiomas soportados no declarados en esta distribución; deben consultarse en la model card del modelo base.
- Sesgos y riesgo de alucinación: no documentados en esta ficha; la model card remite a la del modelo base, que no se restata aquí.
- Licencia Apache 2.0 con atribución: se debe conservar `LICENSE.md` y `NOTICE.md`; las modificaciones están declaradas conforme a la sección 4(b).
- Reproducibilidad: sin fijar `revision` a un commit, se sigue `main` y una actualización futura del repositorio (renombrado de ficheros, nuevo formato de manifiesto) puede romper la aplicación.
- Caché de pesos: se descargan una vez y se verifican contra `size`/`sha256` del manifiesto, pero el tamaño del repositorio (38.2 GB) implica una descarga inicial considerable.
- Sin datos de benchmarks ni de rendimiento publicados para esta distribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hdae/karume-gemma4
- Modelo base E2B: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base E4B: https://huggingface.co/google/gemma-4-E4B-it
- Drafter assistant: https://huggingface.co/google/gemma-4-E2B-it-assistant
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Texto completo de Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paquete del pipeline (JSR): https://jsr.io/@karume/models/gemma
