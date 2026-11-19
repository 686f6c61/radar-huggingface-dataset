# cagataydev/tin-0.8b-q4f16_1-MLC

## Resumen

tin-0.8b-q4f16_1-MLC es una conversión del modelo base `cagataydev/tin-0.8b` al formato MLC/WebLLM, empaquetada específicamente para su ejecución en navegador mediante WebGPU. El autor, cagataydev, publica esta variante cuantizada en `q4f16_1` (pesos de 4 bits con activaciones en float16) con un tamaño de repositorio de 0,4 GB, lo que la hace viable para su descarga y ejecución en una pestaña del navegador sin infraestructura de servidor.

Se trata de un modelo de aproximadamente 0,8 mil millones de parámetros (según se deduce del nombre y del modelo base referenciado) que reutiliza la librería WebGPU precompilada de Qwen3.5-0.8B disponible en WebLLM, al compartir arquitectura. La conversión conserva únicamente los pesos de texto: el torreón de visión del modelo original se descarta, por lo que esta variante es estrictamente texto a texto.

Su relevancia actual radica en el despliegue local en cliente: permite inferencia LLM íntegramente en el navegador con WebGPU, sin backend, con licencia Apache 2.0 y un peso de 405 MB. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no se detallan los datos de entrenamiento ni los idiomas soportados, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; compatible con su librería WebGPU precompilada) |
| Parametros totales | 0,8 mil millones (aproximado, según denominación del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la librería WebGPU referenciada usa el sufijo `cs1k`, lo que sugiere contexto de 1024 tokens, sin confirmación oficial) |
| Tipos de cuantizacion | q4f16_1 (pesos 4 bits, activaciones float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (MLC LLM / WebLLM), librería WebGPU `.wasm` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `cagataydev/tin-0.8b` más allá de su compatibilidad declarada con la librería WebGPU de Qwen3.5-0.8B, lo que implica una arquitectura transformer decoder-only con la misma disposición de capas y atención que dicho modelo. El proceso documentado en esta ficha es exclusivamente de conversión y cuantización a `q4f16_1` para MLC/WebLLM, no de entrenamiento.

El modelo fue entrenado con el modo de razonamiento (thinking) desactivado: los prompts se formatean terminando en `<|im_start|>assistant\n<think>\n\n</think>\n\n`, lo que fuerza al modelo a responder directamente sin cadena de pensamiento explícita. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión descarta el torreón de visión del modelo original, por lo que esta variante no procesa imágenes.

## Capacidades

- Generación de texto conversacional en formato chat con plantilla ChatML (`<|im_start|>`).
- Razonamiento directo sin modo thinking: el formato de prompt fuerza la salida inmediata tras un bloque `<think>` vacío.
- Ejecución en navegador mediante WebGPU con WebLLM, sin servidor backend.
- Inferencia local en cliente con pesos de 405 MB, adecuada para entornos con recursos limitados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no soportada en esta variante (torreón de visión descartado en la conversión).

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga vía WebLLM en la pestaña del usuario y gestiona el diálogo sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad estrictos.
- Demo interactiva de LLM en navegador: con 405 MB de pesos y una librería WebGPU precompilada, permite publicar una demostración funcional de generación de texto en una página estática sin coste de inferencia en servidor.
- Prototipado rápido de interfaces de chat: desarrolladores pueden integrar el modelo con el snippet de WebLLM documentado y validar flujos de conversación antes de migrar a un modelo mayor en producción.
- Procesamiento de texto offline en cliente: aplicaciones web progresivas que necesitan resumir o reformular texto del usuario sin conexión persistente al backend, aprovechando la caché del navegador para los pesos.
- Educación y experimentación: entorno de bajo coste para estudiar el comportamiento de un modelo de 0,8B cuantizado a 4 bits y comparar la degradación de calidad frente al modelo base en fp16.
- Filtrado o clasificación ligera de texto en el navegador: tareas de etiquetado o reescritura de fragmentos cortos donde la latencia de red es crítica y el volumen de contexto es reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con pesos de 405 MB en q4f16_1, la huella de memoria del modelo es inferior a 1 GB, a la que hay que sumar el overhead del runtime WebGPU y el contexto KV.
- GPU recomendadas: cualquier GPU compatible con WebGPU con soporte estable de shaders de cómputo; la información proporcionada no especifica modelos concretos.
- GPU de consumo: el tamaño de 405 MB sugiere viabilidad en GPUs integradas y dedicadas de gama media con WebGPU, aunque no se confirma en la documentación.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm@0.2.89`) sobre WebGPU en navegador; formato MLC. No se documentan otras vías (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| tin-0.8b-q4f16_1-MLC | ~0,8B | no disponible | MLC / WebLLM (WebGPU) | Apache 2.0 | Variante texto únicamente; sin benchmarks publicados |
| Qwen3.5-0.8B (referencia de arquitectura) | 0,8B | no disponible | Múltiples (incluye librería WebGPU precompilada) | no disponible en esta ficha | Mismo esquema arquitectónico; tin reutiliza su librería WebGPU |
| cagataydev/tin-0.8b (modelo base) | ~0,8B | no disponible | Pesos originales (incluye torreón de visión) | Apache 2.0 | Modelo completo multimodal del que deriva esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del idioma o idiomas de entrenamiento del modelo base.
- Longitud de contexto no confirmada: el sufijo `cs1k` de la librería WebGPU apunta a 1024 tokens, insuficiente para tareas de contexto largo.
- Cuantización agresiva: q4f16_1 introduce degradación respecto al modelo base en precisión, especialmente en tareas de razonamiento y matemáticas.
- Sin visión: el torreón multimodal fue descartado en la conversión.
- Modo thinking desactivado por formato de prompt: no se aprovecha la cadena de razonamiento explícita del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.
- Riesgo de alucinación inherente a modelos de 0,8B, no mitigado por datos de alineación documentados.
- Dependencia de WebGPU: la ejecución requiere un navegador con soporte estable de WebGPU, lo que excluye entornos antiguos o sin aceleración gráfica.

## Enlaces

- [Hugging Face: cagataydev/tin-0.8b-q4f16_1-MLC](https://huggingface.co/cagataydev/tin-0.8b-q4f16_1-MLC)
- [Modelo base: cagataydev/tin-0.8b](https://huggingface.co/cagataydev/tin-0.8b)
- [Repositorio WebLLM](https://github.com/mlc-ai/web-llm)
- [Librería WebGPU precompilada (Qwen3.5-0.8B-q4f16_1)](https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_87/base/Qwen3.5-0.8B-q4f16_1_cs1k-webgpu.wasm)
