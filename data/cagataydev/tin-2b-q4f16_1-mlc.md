# cagataydev/tin-2b-q4f16_1-MLC

## Resumen

tin-2b-q4f16_1-MLC es una compilación cuantizada del modelo de lenguaje `cagataydev/tin-2b-v3`, publicada por el mismo autor para su uso con WebLLM sobre WebGPU. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: empaqueta los pesos de tin-2b-v3 en el formato propietario de MLC (`q4f16_1`, 4 bits con grupos de 32) y los acompaña de una librería WebGPU precompilada. El objetivo es ejecutar un modelo de 2B de parámetros directamente en una pestaña del navegador, sin servidor ni backend de inferencia.

La particularidad técnica de esta conversión es que las escalas de cuantización no se calcularon con el criterio habitual de `max|w|/7`, sino mediante una búsqueda que minimiza el error ponderado por activaciones, calibrada sobre texto de entrenamiento de Tin. Según el autor, esto recupera la calidad de la build MLX de 4 bits, mientras que la conversión estándar perdía aproximadamente la mitad de esa calidad en su conjunto de evaluación de escritura ("Tin golden write set").

El modelo base tin-2b-v3 no dispone de model card pública con especificaciones detalladas en la información proporcionada, por lo que muchos datos de arquitectura y entrenamiento quedan como no disponibles. La relevancia de esta ficha radica en documentar el formato de despliegue y sus requisitos, más que las capacidades intrínsecas del modelo, sobre las que solo se puede inferir a partir de la arquitectura del runtime (Qwen3.5-2B) y de la configuración de plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base tin-2b-v3; el runtime usa la librería WebGPU de Qwen3.5-2B, misma arquitectura según el autor) |
| Parametros totales | 2B (según el nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la librería WASM se denomina `cs1k`, lo que sugiere 1024 tokens, sin confirmación explícita) |
| Tipos de cuantizacion | q4f16_1 (4 bits, grupos de 32, escalas calibradas por error ponderado por activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (q4f16_1) con librería WebGPU `.wasm`; tamaño del repo 1,1 GB, pesos de texto ~1044 MB |

## Arquitectura y entrenamiento

El artefacto es una conversión a MLC de tin-2b-v3. La arquitectura subyacente es un transformer de aproximadamente 2B parámetros, y el autor indica que la librería WebGPU utilizada es la precompilada de WebLLM para Qwen3.5-2B `q4f16_1`, copiada al repositorio porque comparte arquitectura con tin-2b-v3. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación destacable está en el proceso de cuantización: en lugar de usar el criterio convencional de escala por valor absoluto máximo, se buscaron las escalas de cada grupo de 32 pesos minimizando el error ponderado por activaciones, con calibración sobre texto de entrenamiento de Tin. El modelo se entrenó con el modo "thinking" desactivado: los prompts terminan en `<|im_start|>assistant\n<think>\n\n</think>\n\n`, lo que fuerza al modelo a responder directamente sin bloque de razonamiento.

## Capacidades

- Generación de texto en el navegador mediante WebGPU, sin servidor ni backend remoto.
- Inferencia local con pesos de solo texto (~1044 MB), apta para entornos con requisitos de privacidad estrictos.
- Plantilla de chat compatible con el formato ChatML (`<|im_start|>`) y con el bloque `<think>` vacío para desactivar el razonamiento explícito.
- Integración con el playground de Tin mediante la sintaxis `agent A { model: "tin:2b" }`.
- Soporte de tool calling, agentes multi-paso, matemáticas, código o capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible (el autor especifica "text weights only").

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo se carga con `CreateMLCEngine` de WebLLM y ejecuta la inferencia en la GPU del cliente vía WebGPU, de modo que la aplicación no necesita infraestructura de servidor ni exponer datos del usuario a un tercero.
- Procesamiento de texto con requisitos de privacidad: al residir los pesos en el navegador y ejecutarse localmente, es adecuado para borradores, resúmenes o reescritura de documentos sensibles que no deben salir del dispositivo.
- Demos y prototipos de productos de IA generativa: permite publicar una demo funcional en Hugging Face Spaces o en una página estática sin coste de GPU en servidor, con un repositorio de 1,1 GB que se descarga una vez y queda en caché.
- Herramientas de escritura en el navegador: el autor menciona un "golden write set" como conjunto de evaluación, lo que sugiere un uso orientado a generación y asistencia de escritura; encaja en editores o extensiones que ofrezcan sugerencias sin latencia de red.
- Automatizaciones de agente en el cliente: la sintaxis `agent A { model: "tin:2b" }` del playground de Tin indica soporte para definir agentes que ejecutan este modelo, útil para flujos de automatización ligeros dentro de la propia aplicación web.
- Evaluación y experimentación con cuantización: el repositorio sirve como referencia práctica de conversión MLC con escalas calibradas, útil para investigadores que quieran comparar el impacto de distintas estrategias de cuantización en modelos de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente aporta una comparación cualitativa: la cuantización con escalas calibradas "recupera la calidad de la build MLX de 4 bits" en el conjunto de escritura de Tin, mientras que la conversión estándar perdía aproximadamente la mitad de esa calidad. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos ocupan ~1044 MB, por lo que se necesita al menos ese espacio en memoria de GPU más el overhead de activaciones y del runtime WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU (el autor no especifica modelos concretos).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; depende del soporte WebGPU del navegador y del sistema operativo del usuario.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm@0.2.89`) sobre WebGPU en el navegador; el formato MLC también es compatible con el runtime de MLC-LLM, aunque el autor solo documenta el uso web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| tin-2b-q4f16_1-MLC | 2B | no disponible | MLC q4f16_1 + WASM WebGPU | Apache 2.0 | Navegador (WebLLM) |
| Qwen3.5-2B q4f16_1 (WebLLM) | 2B | no disponible | MLC q4f16_1 + WASM WebGPU | según modelo base | Navegador (WebLLM) |
| tin-2b-v3 (MLX 4-bit) | 2B | no disponible | MLX | Apache 2.0 (según repo base) | Local en Apple Silicon |

La comparación con Qwen3.5-2B es la más directa porque este repositorio reutiliza su librería WebGPU; sin embargo, no se dispone de datos de rendimiento comparativos entre ambos. La build MLX de 4 bits del mismo modelo base es la referencia que el autor usa para validar la calidad de la conversión.

## Limitaciones y advertencias

- Modelo de solo texto: no procesa imágenes ni audio.
- Entrenado con thinking desactivado; no se debe esperar razonamiento explícito en bloque `<think>`.
- Sin datos publicados sobre sesgos, idiomas soportados ni tasas de alucinación.
- La longitud de contexto no está documentada; el sufijo `cs1k` de la librería sugiere 1024 tokens, lo que limitaría conversaciones largas y tareas de contexto extenso.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base tin-2b-v3 y de los componentes reutilizados de Qwen3.5-2B.
- El despliegue depende de WebGPU: navegadores o dispositivos sin soporte no podrán ejecutar el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- El tamaño del repositorio (1,1 GB) implica una descarga inicial considerable para el usuario final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cagataydev/tin-2b-q4f16_1-MLC
- Modelo base: https://huggingface.co/cagataydev/tin-2b-v3
- WebLLM: https://github.com/mlc-ai/web-llm
- Paquete WebLLM en npm/esm: https://esm.run/@mlc-ai/web-llm@0.2.89
- Librería WebGPU: https://huggingface.co/cagataydev/tin-2b-q4f16_1-MLC/resolve/main/Qwen3.5-2B-q4f16_1_cs1k-webgpu.wasm
