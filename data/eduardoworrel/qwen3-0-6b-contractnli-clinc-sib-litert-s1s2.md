# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LiteRT-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-LiteRT-S1S2 es una compilación especializada y cuantizada del modelo base Qwen/Qwen3-0.6B, publicada por el usuario eduardoworrel. El modelo ha sido ajustado mediante LoRA sobre tres tareas de clasificación y comprensión: ContractNLI (inferencia de lenguaje natural sobre contratos), CLINC150 (detección de intenciones con dominio fuera de alcance) y SIB-200 (clasificación de temas multilingüe). El resultado se ha fusionado con el modelo base y se ha exportado al formato LiteRT (antes TensorFlow Lite) para su ejecución en navegador mediante LiteRT.js y WebGPU.

La particularidad de esta build es que no se distribuye como un modelo generativo convencional, sino como un grafo de decisión que expone los logits de las etiquetas. Esto significa que el modelo no genera texto libre, sino que responde seleccionando entre opciones predefinidas (por ejemplo, " A", " B", " Yes" o " No") leyendo el logit del token correspondiente tras una señal de respuesta. El autor indica explícitamente que la build de referencia es la versión ONNX GenAI, y que esta variante LiteRT debe usarse solo si la aplicación ya integra LiteRT.js 2.6.0.

El modelo tiene 0,6 mil millones de parámetros, una ventana de contexto efectiva de 2.048 tokens (con prompts de hasta 2.040 tokens) y se distribuye en cuantización int4 con grupos de 32. Su relevancia radica en que permite ejecutar tareas de clasificación especializada directamente en el navegador sin backend, aunque con una latencia muy alta (del orden de 12 a 38 segundos por decisión en un Apple M2 Pro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificación LoRA fusionadas; exportado a LiteRT |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de KV cache; prompts de hasta 2.040 tokens |
| Tipos de cuantizacion | int4 (capas fully connected con block-32); embedder externo en f16 |
| Idiomas soportados | no disponible (SIB-200 incluye inglés y portugués en la evaluación; el modelo base Qwen3 es multilingüe) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | LiteRT (`.tflite` + `.bin` externos), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre él se aplicó un ajuste LoRA para tres tareas: ContractNLI (20 hipótesis sobre un NDA), CLINC150 (30 ítems, 20 fuera de alcance y 10 dentro) y SIB-200 (20 ítems en inglés y 20 en portugués). El adaptador LoRA se fusionó con el modelo base en bf16 y posteriormente se exportó mediante litert-torch a un grafo LiteRT con cuantización int4 en las capas fully connected (grupo de 32), embedder externo en f16, prefill en fragmentos de 16 tokens y caché KV de 2.048.

La innovación técnica principal es el formato de lectura: el grafo no expone estados ocultos, por lo que las cabezas entrenadas no pueden leerse directamente. En su lugar, el modelo responde leyendo el logit del token de la opción tras la señal de respuesta (por ejemplo, " A", " B", " Yes" o " No"). El autor documenta además un sesgo sistemático de la cuantización int4: en CLINC150, la diferencia de logits entre "Yes" y "No" se desplaza hacia "Yes" en unos 3 logits en casi todos los ítems, lo que provoca que el modelo responda "fuera de alcance" casi siempre. Este mismo desplazamiento se observa en otras builds cuantizadas (WebLLM, LiteRT y la build oficial mlc-ai/Qwen3-0.6B-q4f16_1-MLC), pero no en la build GenAI int4.

## Capacidades

- Clasificación de inferencia de lenguaje natural sobre contratos (ContractNLI): determina si una hipótesis se deriva, se contradice o no se menciona en un contrato.
- Detección de intenciones con dominio fuera de alcance (CLINC150): clasifica consultas en intenciones predefinidas o las marca como fuera de alcance.
- Clasificación de temas multilingüe (SIB-200): etiqueta textos en inglés y portugués por tema.
- Decisión entre opciones fijas mediante lectura de logits de etiqueta (no generación de texto libre).
- Ejecución en navegador con WebGPU mediante LiteRT.js 2.6.0.
- Soporte de múltiples manifiestos de tarea (`manifest.cnli.json`, `manifest.clinc.json`, `manifest.sib_en.json`, `manifest.sib_pt.json`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador especializado, no un modelo generativo de propósito general.

## Casos de uso

- Clasificación de cláusulas contractuales en el navegador: una aplicación web puede cargar el manifiesto `manifest.cnli.json` y evaluar si una hipótesis sobre un NDA se deriva, contradice o no se menciona, sin enviar el texto del contrato a un servidor. Es adecuado por su especialización en ContractNLI, aunque la latencia de unos 38 segundos por decisión limita su uso a flujos asíncronos.
- Detección de intenciones en asistentes conversacionales: con `manifest.clinc.json` se puede clasificar la consulta del usuario en una intención predefinida. No obstante, el autor advierte que esta build no es recomendable para CLINC150 por el sesgo hacia "fuera de alcance" introducido por la cuantización int4.
- Etiquetado temático de textos en inglés y portugués: con `manifest.sib_en.json` o `manifest.sib_pt.json` se puede clasificar el tema de un documento en el navegador, con un rendimiento de 18/20 y 19/20 ítems correctos respectivamente frente al modelo sin cuantizar.
- Prototipado de aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el cliente con WebGPU, el texto del usuario no sale del navegador, lo que encaja en escenarios con requisitos de confidencialidad.
- Demostraciones educativas de cuantización y despliegue en navegador: el modelo sirve como ejemplo reproducible de exportación LiteRT, cuantización int4 y lectura de logits de etiqueta.
- Evaluación comparativa de runtimes: permite comparar la paridad entre la build LiteRT, la build GenAI int4 y el modelo sin cuantizar sobre los mismos ítems, tal como documenta el autor.
- Filtrado previo en pipelines de revisión documental: puede usarse como clasificador de primera pasada para marcar contratos o consultas que requieran revisión humana, dado su bajo coste de despliegue (0,7 GB de repositorio).

## Benchmarks y rendimiento

Los datos de paridad publicados por el autor comparan esta build con el modelo sin cuantizar y con la build GenAI int4, sobre ítems de desarrollo (no de test), en Chrome con WebGPU sobre Apple M2 Pro. La lectura es siempre de logits de etiqueta salvo que se indique lo contrario.

| Tarea | Ítems | Esta build = sin cuantizar | GenAI int4 = sin cuantizar | Esta build = GenAI (logits) | Esta build = GenAI (cabeza) | Mediana ms por decisión |
|---|---|---|---|---|---|---|
| CLINC150 fuera de alcance | 30 | 14/30 | 23/30 | 9/30 | 17/30 | 12.495 |
| ContractNLI | 20 | 20/20 | 9/20 | 9/20 | 5/20 | 37.613 |
| SIB-200 inglés | 20 | 18/20 | 19/20 | 19/20 | 18/20 | 3.633 |
| SIB-200 portugués | 20 | 19/20 | 19/20 | 18/20 | 17/20 | 4.219 |

El autor indica que, en ContractNLI y SIB-200, esta build coincide con el modelo sin cuantizar en 57 de 60 ítems. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB y los pesos se transmiten por streaming a WebGPU.
- GPU recomendadas: el autor reporta pruebas en Apple M2 Pro con WebGPU en Chrome. No se especifican otras GPU.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del modelo (0,6 mil millones de parámetros en int4); se ha validado en un SoC Apple M2 Pro.
- Opciones de despliegue: LiteRT.js 2.6.0 (`@litertjs/core`) con WebGPU, a través del paquete `@s1s2/web` del repositorio github.com/eduardoworrel/s1s2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 12 segundos por decisión en CLINC150 y 38 segundos por decisión en ContractNLI en un Apple M2 Pro, con prefill en fragmentos de 16 tokens y copia del estado KV entre pasos. Para SIB-200, las medianas son de 3,6 a 4,2 segundos por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (LiteRT int4) | 0,6 B | 2.048 | LiteRT + WebGPU | CC BY-SA 4.0 | Clasificador especializado en navegador; latencia alta |
| eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 0,6 B | no disponible | ONNX GenAI int4 | no disponible | Build de referencia según el autor; mejor paridad en CLINC150 |
| mlc-ai/Qwen3-0.6B-q4f16_1-MLC | 0,6 B | no disponible | MLC | no disponible | Build oficial cuantizada del modelo base; muestra el mismo sesgo hacia "Yes" en CLINC150 (+6) |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible | safetensors | Apache-2.0 | Modelo base sin ajuste ni cuantizar; referencia de paridad |

## Limitaciones y advertencias

- El autor advierte explícitamente que la build de referencia es la ONNX GenAI y que esta variante LiteRT solo debe usarse si la aplicación ya integra LiteRT.js 2.6.0.
- CLINC150 no es recomendable en este formato: la cuantización int4 desplaza la diferencia de logits Yes/No hacia "Yes" en unos 3 logits en casi todos los ítems, lo que provoca respuestas "fuera de alcance" casi siempre.
- La lectura de logits de etiqueta y la cabeza entrenada discrepan con frecuencia (CLINC150 14/30, ContractNLI 14/20 entre GenAI logits y GenAI cabeza), por lo que esta build no es una copia de la referencia.
- El grafo no expone estados ocultos, por lo que las cabezas entrenadas no pueden leerse; es necesario usar el manifiesto de tarea para mantener fijo el orden de las opciones.
- Las preguntas de elección libre leen la letra sin su espacio inicial; hay que usar el manifiesto de tarea.
- La latencia es muy alta para uso interactivo (12 a 38 segundos por decisión).
- Licencia CC BY-SA 4.0 con cláusula ShareAlike, derivada de los datos de entrenamiento SIB-200; ContractNLI (CC BY 4.0) y CLINC150 (CC BY 3.0) mantienen su atribución, igual que el modelo base (Apache-2.0).
- No se documentan sesgos más allá del desplazamiento de logits por cuantización; el riesgo de alucinación es bajo por tratarse de un clasificador de opciones fijas, pero puede producir clasificaciones erróneas por el sesgo mencionado.
- No hay información sobre idiomas soportados más allá de los evaluados (inglés y portugués en SIB-200).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LiteRT-S1S2
- Build de referencia ONNX GenAI: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Repositorio Kev (cabeza pointer y receta de entrenamiento): https://github.com/jaredpalmer/kev
- Build precursora alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Build oficial MLC del modelo base: https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC
