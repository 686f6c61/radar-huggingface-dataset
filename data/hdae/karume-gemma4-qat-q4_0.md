# hdae/karume-gemma4-qat-q4_0

## Resumen

`hdae/karume-gemma4-qat-q4_0` es una distribución de inferencia del decodificador de texto de la familia Gemma 4 de Google, empaquetada en el formato de contenedor `.krm` del runtime WebGPU Karume. No es un modelo entrenado desde cero ni un fine-tune: es una conversión de los checkpoints QAT (quantization-aware training, rejilla Q4_0) de tres variantes de Gemma 4 —`e2b`, `e4b` y `12b`— al formato que consume el motor Karume, que ejecuta el grafo directamente en el navegador y en Deno con una interfaz de cadena a cadena.

El interés técnico está en tres decisiones: los pesos conservan exactamente la rejilla de 4 bits del checkpoint original (códigos q4_0 empaquetados como int4, un paso por grupo de 32 valores) sin recuantizar; se incluye el drafter de predicción multi-token de Google para decodificación especulativa en las tres variantes; y las embeddings por capa de `e2b`/`e4b` se tratan como activos del contenedor que se recogen en el host y se pasan al grafo como entrada, en lugar de residir en la GPU.

La relevancia es acotada pero clara: permite ejecutar un LLM de 12B en 4 bits dentro de un navegador con WebGPU sin depender de un backend Python, a costa de perder el front-end multimodal (visión y audio) que sí traen los checkpoints originales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), grafo empaquetado en contenedor Karume |
| Parametros totales | no disponible (variantes `e2b`, `e4b`, `12b`; el nombre sugiere 2B, 4B y 12B, sin confirmar en la model card) |
| Parametros activos | no disponible (la model card no indica si `e2b`/`e4b` son MoE; el sufijo `E` y las embeddings por capa son compatibles con una arquitectura de expertos, sin confirmar) |
| Longitud de contexto | 4096 tokens por defecto; configurable entre la longitud de chunk y el límite posicional declarado: 131072 (`e2b`/`e4b`), 262144 (`12b`) |
| Tipos de cuantizacion | Q4_0 (QAT), int4 empaquetado, un paso por grupo de 32 valores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | `.krm` (secuencia de partes; la primera lleva grafo y descriptores). No legible por transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 4, entrenado por Google con quantization-aware training para producir checkpoints Q4_0. Esta distribución no reentrena ni modifica los pesos: los códigos q4_0 de las matrices lineales, la tabla de embeddings (que también hace de cabeza de salida) y las embeddings por capa de `e2b`/`e4b` se conservan tal cual, empaquetados como int4 con un paso por grupo de 32 valores. El exportador utilizado es `karume/0.15.1` y el manifiesto de distribución es `karume.json` (`karume/5`); el lector implementa la especificación de pipeline `gemma4/1`.

Las innovaciones destacables son de despliegue, no de entrenamiento. Primero, decodificación especulativa: las tres variantes incluyen el drafter de predicción multi-token de Google (checkpoints `-assistant`), que reutiliza los estados clave/valor y la tabla de embeddings del modelo principal en lugar de cargar los suyos, y ejecuta su cabeza de salida sobre el vocabulario completo (no usa la cabeza dispersa clusterizada del checkpoint assistant). Se activa con `speculative: {}` al cargar. Segundo, gestión de embeddings por capa: en `e2b`/`e4b` se recogen en el host y se inyectan como entrada del grafo, de modo que el loader solo lee los rangos de vocabulario que toca la conversación y esas tablas no ocupan memoria residente de GPU; `12b` no tiene embeddings por capa. Tercero, las tablas rotatorias cos/sin se generan en el host por chunk a partir de los parámetros `rope` declarados, sin tabla de posiciones empaquetada; el prefill se ejecuta en chunks de 768 filas por defecto, ampliable hasta 768 (cota superior trazada del símbolo de chunk).

## Capacidades

- Generación de texto conversacional con tokenizer y plantilla de chat incluidas en los pesos: `chat()` renderiza los turnos, codifica, muestrea y decodifica de forma incremental.
- Decodificación especulativa con drafter multi-token en `e2b`, `e4b` y `12b`, activable en carga.
- Contexto configurable hasta 131072 tokens (`e2b`/`e4b`) o 262144 (`12b`), con capacidad por defecto de 4096.
- Ejecución en navegador y en Deno sobre WebGPU, con API de cadena a cadena.
- Carga selectiva de rangos de vocabulario para las embeddings por capa (`e2b`/`e4b`).
- Sin capacidades multimodales: no acepta imágenes ni audio, pese a que los checkpoints de origen sí incluyen torres de visión y audio (`e2b`/`e4b`) o embedders sin encoder (`12b`).
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones web: el modelo se ejecuta íntegramente en el navegador del usuario sobre WebGPU, sin servidor de inferencia, lo que permite desplegar un chat con pesos Q4_0 y sin coste de GPU en la nube.
- Herramientas de escritorio o notebooks interactivos en Deno: la API de cadena a cadena y la decodificación incremental encajan en interfaces de streaming de tokens sin glue code adicional.
- Procesamiento de documentos largos en cliente: con capacidad de contexto configurable hasta 131072 tokens en `e2b`/`e4b`, se pueden resumir o consultar documentos extensos sin enviar el contenido a un tercero.
- Prototipado y demos sin infraestructura: el contenedor `.krm` se carga tal cual, con tokenizer y plantilla de chat incluidas, lo que reduce el trabajo de integración a una llamada de carga y otra de `chat()`.
- Aplicaciones con requisitos de privacidad: al no requerir backend remoto, los datos de la conversación no salen del dispositivo del usuario.
- Evaluación comparativa de cuantización QAT en el borde: al preservar la rejilla q4_0 exacta del checkpoint de Google, sirve para medir la degradación real de QAT frente a FP16 en un runtime WebGPU.
- Aceleración de latencia en producción web: la decodificación especulativa con el drafter de Google reduce el número de pasos del modelo principal, adecuada para interfaces donde la latencia percibida por token es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 15.4 GB e incluye las tres variantes (`e2b`, `e4b`, `12b`) más sus drafters; el peso residente de una sola variante en Q4_0 será una fracción de esa cifra, pero la model card no desglosa el tamaño por variante.
- GPU recomendadas: no disponible. El runtime objetivo es WebGPU, por lo que la compatibilidad depende del navegador y del driver más que de un modelo de GPU concreto.
- GPU de consumo: no confirmado. `e2b` y `e4b` en Q4_0 son candidatos razonables para GPUs de consumo con WebGPU; `12b` en Q4_0 requiere comprobar la memoria disponible del adaptador, dato no publicado.
- Despliegue: exclusivamente mediante el runtime Karume (navegador y Deno). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, al usar un contenedor propio con grafo embebido.
- Latencia y throughput: no disponibles. Solo se documenta el tamaño de chunk de prefill (768 filas por defecto) y la existencia de decodificación especulativa, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| `hdae/karume-gemma4-qat-q4_0` | `e2b`/`e4b`/`12b` (sin confirmar) | 4096 por defecto; hasta 131072 / 262144 | `.krm` (Q4_0 QAT) | Karume (WebGPU, navegador/Deno) | Apache 2.0 |
| `google/gemma-4-12B-it-qat-q4_0-unquantized` | 12B (por nombre) | no disponible | safetensors (QAT Q4_0) | transformers y ecosistema estándar | Apache 2.0 |
| `google/gemma-4-E4B-it` | 4B (por nombre) | no disponible | safetensors | transformers y ecosistema estándar | Apache 2.0 |
| `google/gemma-4-E2B-it` | 2B (por nombre) | no disponible | safetensors | transformers y ecosistema estándar | Apache 2.0 |

La diferencia principal frente a los checkpoints de Google no es de calidad ni de tamaño, sino de empaquetado y runtime: esta distribución gana ejecución en navegador y pierde multimodalidad y compatibilidad con el ecosistema Python. Los datos de contexto de los checkpoints originales no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es multimodal: aunque los checkpoints de origen incluyen torres de visión y audio, esta distribución no las contiene y no puede procesar imágenes ni audio.
- No es legible por transformers: usa un contenedor propio con grafo embebido, lo que excluye todo el tooling estándar de Hugging Face (vLLM, TGI, llama.cpp, Ollama, evaluación con lm-evaluation-harness).
- La capacidad de contexto por defecto es de solo 4096 tokens; usar ventanas mayores exige configurar el loader y asumir el coste de memoria correspondiente.
- El límite posicional declarado (131072 / 262144) es una cota del modelo, no una garantía de calidad en ventanas extremas; no hay evaluación publicada de rendimiento en contexto largo.
- Sin datos de benchmarks, no se puede verificar la degradación introducida por la cuantización Q4_0 frente a los pesos originales.
- Idiomas soportados no declarados: no hay confirmación de cobertura multilingüe ni de calidad por idioma.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; se heredan los del modelo base de Google, no evaluados aquí.
- Licencia Apache 2.0, pero con enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de fallos en producción.
- El modelo fue creado y actualizado el 2026-11-04, con una ventana de siete minutos entre ambas fechas; no hay historial de revisiones que permita evaluar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hdae/karume-gemma4-qat-q4_0
- Modelo base `e2b`: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint QAT `e2b`: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Drafter `e2b`: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant
- Modelo base `e4b`: https://huggingface.co/google/gemma-4-E4B-it
- Checkpoint QAT `e4b`: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Drafter `e4b`: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
- Modelo base `12b`: https://huggingface.co/google/gemma-4-12B-it
- Checkpoint QAT `12b`: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Drafter `12b`: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Texto completo Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
