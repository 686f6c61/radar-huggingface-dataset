# htb-ac-1424625/Inkling-2-mini-1bit

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de tipo agéntico, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El checkpoint distribuido en Hugging Face bajo el identificador `htb-ac-1424625/Inkling-2-mini-1bit` es una variante cuantizada a 1 bit del modelo original alojado en `thinkingmachines/Inkling-2-Mini`.

La arquitectura es un transformer decoder-only con mezcla dispersa de expertos (MoE) y capas recurrentes ("looped"): 24 capas de pesos, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. El modelo tiene 26.400 millones de parámetros totales y 3.400 millones activos por token, que ascienden a 5.400 millones efectivos por token debido al bucle de capas. Emplea 128 expertos por capa con enrutamiento de 8 por token y una ventana de contexto de hasta 1.000.000 de tokens.

La relevancia de esta variante concreta radica en su empaquetado: el checkpoint original se distribuye en unos 20 GB con precisiones mixtas NVFP4 y MXFP8, y esta versión de 1 bit busca reducir aún más el peso para despliegue en hardware de consumo. La información pública disponible sobre esta variante cuantizada es muy limitada, por lo que varios datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas recurrentes (looped); vision transformer para imágenes |
| Parametros totales | 26,4B |
| Parametros activos | 3,4B por token (5,4B efectivos por token por el bucle de capas) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Checkpoint original en NVFP4 y MXFP8; esta variante en 1 bit (detalles del esquema no disponibles) |
| Idiomas soportados | Inglés y soporte multilingüe general (lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible para esta variante; el original se distribuye como checkpoint único de ~20 GB |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo multimodal con 24 capas de pesos. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. Cada capa enruta cada token a 8 de 128 expertos en las capas feed-forward de tipo MoE. La atención combina capas locales y globales. La modalidad de imagen se procesa mediante un vision transformer y se proyecta junto con el texto a un espacio oculto compartido que el decoder procesa conjuntamente.

El entrenamiento utilizó datos de texto, imagen y vídeo de fuentes públicas, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones conversacionales multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Razonamiento multimodal conjunto sobre texto e imagen en un espacio oculto compartido.
- Soporte para múltiples lenguajes de programación según la model card.
- Uso previsto en sistemas agénticos y de tool-use, asistentes de código, chatbots y RAG.
- Soporte multilingüe general, con inglés como idioma principal.
- Capacidad de fine-tuning posterior mediante las plataformas Miles y SkyRL, y de ajuste vía Tinker.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código, apoyándose en su soporte para múltiples lenguajes de programación y su uso previsto en asistentes de código.
- Sistemas agénticos con tool calling: su orientación explícita a sistemas de tool-use permite construir agentes que encadenen llamadas a herramientas y razonamiento multi-paso.
- RAG sobre documentación extensa: con una ventana de hasta 1M tokens, puede ingerir grandes volúmenes de contexto recuperado y responder preguntas con fundamento documental.
- Análisis de documentos con imágenes: al aceptar texto e imagen, es adecuado para extraer información de capturas, diagramas o páginas escaneadas junto a su texto asociado.
- Chatbots de atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales extensos sin truncar.
- Despliegue en hardware de consumo: el empaquetado de 1 bit y el tamaño compacto del checkpoint original permiten inferencia local en Apple Silicon con 32 GB o más, y en GPUs con 32 GB o más de VRAM.
- Prototipado e investigación con fine-tuning: acceso mediante Tinker, Miles y SkyRL para ajuste supervisado y RL.

## Benchmarks y rendimiento

La model card original incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks verificables en la información disponible para esta variante cuantizada a 1 bit.

## Requisitos de hardware

- Checkpoint original: ~20 GB en NVFP4 y MXFP8, según la model card.
- VRAM estimada para esta variante de 1 bit: no disponible de forma explícita; por el tamaño del original, se espera que quepa en configuraciones de 32 GB o menos, pero el dato no está confirmado.
- Hardware soportado oficialmente para el original: 1x NVIDIA DGX Spark; Apple Silicon con 32 GB o más (MacBook, Mac mini, Mac Studio); otras GPUs con 32 GB o más de VRAM recomendados.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 24-32 GB de VRAM (por ejemplo, RTX 4090 con 24 GB), aunque no está confirmado para esta variante.
- Frameworks de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp (GGUF), Llama App, Ollama y Exo Labs en Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini (esta variante) | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | 31B (no confirmado) | No disponible | No disponible | Referenciado en la model card |
| Qwen3.8-27B | 27B (no confirmado) | No disponible | No disponible | Referenciado en la model card |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | Referenciado en la model card |
| Muse Glimmer | No disponible | No disponible | No disponible | Referenciado en la model card |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card solo referencia estos modelos como términos de comparación sin valores numéricos accesibles.

## Limitaciones y advertencias

- Esta variante concreta está cuantizada a 1 bit; la cuantización agresiva puede degradar la calidad de generación y la fidelidad multimodal respecto al checkpoint original, aunque no se han publicado evaluaciones que lo cuantifiquen.
- La información pública sobre esta variante es mínima: no hay descargas ni likes, y no se detallan el esquema exacto de cuantización ni los resultados de evaluación.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación para esta variante.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Idiomas: el soporte multilingüe se describe de forma genérica; el rendimiento fuera del inglés no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales.
- El uso previsto excluye explícitamente aplicaciones no contempladas en la política del proveedor; conviene revisarla antes de producción.
- No se especifican limitaciones de contexto específicas más allá del máximo de 1M tokens.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/htb-ac-1424625/Inkling-2-mini-1bit
- Hugging Face (modelo original): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
