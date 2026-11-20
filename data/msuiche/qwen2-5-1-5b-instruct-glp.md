# msuiche/Qwen2.5-1.5B-Instruct-GLP

## Resumen

Qwen2.5-1.5B-Instruct-GLP es una exportación instrumentada del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, publicada por el usuario msuiche. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos base son los originales, cuantizados a q4f16 y exportados a ONNX para su ejecución en navegador mediante transformers.js y WebGPU. Lo que se añade es un mecanismo de direccionamiento de activaciones denominado GLP (weightless), implementado como nodos adicionales en el grafo de cómputo y un escalar de entrada en tiempo de ejecución.

El propósito del artefacto es demostrar la manipulación del comportamiento del modelo sin modificar los pesos: una proyección sobre una dirección unitaria por capa, controlada por el parámetro `glp_alpha`. Con `glp_alpha = 0` el modelo se comporta como el original; con `glp_alpha = 1` se aplica la dirección de steering derivada del vector incluido, que en la validación del autor altera la tasa de rechazo ante prompts dañinos. El modelo conserva la arquitectura, el tamaño y el contexto del Qwen2.5-1.5B-Instruct original.

La relevancia es doble: por un lado, es un ejemplo práctico de control vectorial (steering) aplicado a un transformer pequeño; por otro, demuestra el despliegue de un LLM completamente en el navegador con WebGPU sin servidor. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), exportado a ONNX con nodos GLP insertados |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el campo safetensors del repo indica 41.472, correspondiente a los tensores auxiliares, no al modelo completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | q4f16 (ONNX, WebGPU); el repo incluye tambien artefactos GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (q4f16) y GGUF; vector GLP en GGUF (`qwen2.5-1.5b-instruct-refusal-cvec.gguf`, 170 KB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only con 27 capas y dimensión de embedding (`n_embd`) de 1536, según los datos del grafo GLP. Sobre ese grafo se insertan operaciones de proyección en el residual posterior a cada capa: `h <- h - glp_alpha * (h · d) d`, donde `d` es una dirección unitaria por capa almacenada como inicializador constante dentro del grafo. El escalar `glp_alpha` es una entrada adicional en tiempo de ejecución: 0 anula la proyección y 1 la aplica plenamente.

No hay entrenamiento adicional ni ajuste fino en este artefacto. Los pesos base proceden del checkpoint original de Qwen (revisión `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`) y la exportación ONNX se realizó desde la variante q4f16 de `onnx-community/Qwen2.5-1.5B-Instruct`. Las direcciones de steering se derivaron con la herramienta `captain-vector` mediante diferencia de medias entre un conjunto AdvBench y un conjunto Alpaca, con validación en held-out y controles de dirección aleatoria. No se dispone de información sobre la composición del dataset de entrenamiento original de Qwen2.5-1.5B-Instruct en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a instrucciones heredados del Qwen2.5-1.5B-Instruct base.
- Control de comportamiento en tiempo de ejecución mediante el escalar `glp_alpha`, que activa o desactiva la proyección GLP por capa.
- Ejecución en navegador con WebGPU a través de transformers.js, sin servidor ni backend remoto.
- Compatibilidad con el ecosistema ONNX Runtime (validado en CPU) y con llama.cpp/Ollama a través de los artefactos GGUF incluidos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada para este artefacto.

## Casos de uso

- Demostración educativa de steering vectorial: el modelo permite mostrar en vivo cómo una dirección de activación modifica el comportamiento sin tocar los pesos, alternando `glp_alpha` entre 0 y 1 sobre el mismo prompt y comparando respuestas.
- Investigación en seguridad y alineamiento: sirve como banco de pruebas reproducible para estudiar mecanismos de rechazo y su manipulación, con el vector y la especificación GLP publicados en el repositorio `weightless`.
- Despliegue de LLM en navegador: aplicaciones web que necesiten generación de texto local sin servidor, aprovechando la exportación ONNX q4f16 y WebGPU para privacidad y baja latencia de red.
- Prototipado de interfaces conversacionales offline: chatbots embebidos en páginas estáticas o extensiones que no pueden depender de una API externa.
- Validación de pipelines de exportación ONNX: el artefacto sirve como referencia para verificar la instrumentación de grafos con entradas escalares adicionales en onnxruntime y transformers.js.
- Experimentación con cuantización q4f16: permite evaluar la degradación de calidad y el rendimiento de un modelo de 1.500 millones de parámetros en hardware de consumo vía WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente métricas de validación del mecanismo GLP, no del modelo base:

| Metrica | Baseline (`glp_alpha=0`) | Steered (`glp_alpha=1`) |
|---|---|---|
| Entrega de contenido dañino (AdvBench, 8 prompts) | 0/8 | 5/8 |
| Respuestas a prompts inofensivos (Alpaca) | 8/8 | 8/8 |
| Controles de dirección aleatoria | superados por la dirección GLP | superados por la dirección GLP |
| Validacion del vector GLP (`validate`/`audit`) | 0 FAIL, 0 WARN | 0 FAIL, 0 WARN |

## Requisitos de hardware

- VRAM estimada: el modelo en q4f16 ocupa aproximadamente 1,2 GB (tamaño del repo); en FP16 serían unos 3 GB. La ejecución en navegador con WebGPU requiere una GPU integrada o dedicada compatible con WebGPU y suficiente memoria de vídeo compartida o dedicada.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge recientes); en servidor, se puede ejecutar en CPU mediante onnxruntime o en GPU con CUDA a través de ONNX Runtime.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM para la variante q4f16; también en GPUs integradas modernas vía WebGPU.
- Opciones de despliegue: transformers.js (WebGPU), onnxruntime (CPU/GPU), llama.cpp y Ollama mediante los artefactos GGUF incluidos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| msuiche/Qwen2.5-1.5B-Instruct-GLP | 1.500 M | no disponible | Apache-2.0 | ONNX q4f16, GGUF | Instrumentado con steering GLP y entrada `glp_alpha` |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (modelo base) | Apache-2.0 | safetensors, GGUF, ONNX | Modelo original sin instrumentacion |
| onnx-community/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (modelo base) | Apache-2.0 | ONNX (q4f16 y otras) | Exportacion ONNX estandar, sin nodos GLP |

## Limitaciones y advertencias

- El mecanismo GLP está diseñado explícitamente para reducir la tasa de rechazo ante prompts dañinos; con `glp_alpha = 1` el modelo entrega contenido que el original rechaza. No debe desplegarse en producción con el steering activado sin salvaguardas externas.
- La validación del vector se realizó con solo 8 prompts dañinos y 8 inofensivos; la muestra es muy pequeña y no permite generalizar el comportamiento a otras categorías de contenido.
- No hay información sobre sesgos del modelo base en esta documentación; deben asumirse los sesgos conocidos de Qwen2.5-1.5B-Instruct.
- Riesgo de alucinación inherente a un modelo de 1.500 millones de parámetros; no se han publicado evaluaciones de fidelidad para este artefacto.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo con el steering activado.
- El artefacto está pensado como demostración; no se documentan límites de contexto efectivos, idiomas soportados ni latencias en producción.
- El campo de parámetros totales del repo (41.472) no refleja el tamaño real del modelo; debe interpretarse como metadatos de los tensores auxiliares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/msuiche/Qwen2.5-1.5B-Instruct-GLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct
- Repositorio weightless (instrumentación GLP y vector): https://github.com/msuiche/weightless
- Especificación GLP: `docs/spec/GLP.md` dentro del repositorio weightless
