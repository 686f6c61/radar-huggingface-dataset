# RadixArk/DaisyRose-27B

## Resumen

DaisyRose-27B es un modelo multimodal de razonamiento desarrollado por RadixArk, construido a partir de Qwen3.8-27B mediante un proceso de aprendizaje por refuerzo (RL) exclusivamente, sin supervisión fina (SFT) ni destilación. Se trata del primer modelo publicado por el laboratorio y está orientado a tareas de agente de horizonte largo, como lo demuestra su entrenamiento sobre aproximadamente 1.200 tareas curadas con sesiones de hasta 1M de tokens.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, así como su capacidad de comprensión de imágenes y su ventana de contexto de 256K tokens, lo que lo convierte en un reemplazo directo ("drop-in replacement") en pilas de inferencia y post-entrenamiento existentes. Con 27.781.427.952 parámetros (aproximadamente 27,8B) y pesos publicados en BF16, FP8 y NVFP4 bajo licencia Apache-2.0, es relevante ahora porque demuestra que el RL puro sobre tareas de agente puede mejorar sustancialmente el rendimiento en benchmarks de terminal y de ingeniería de software sin necesidad de SFT.

La propuesta de valor principal es la mejora en tareas de agente de terminal: Terminal Bench 4.1 pass@1 sube de 5,6 a 12,0 respecto al modelo base, y el modelo también mejora en la mayoría de los benchmarks de código, razonamiento y seguimiento de instrucciones reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (aprox. 27,8B) |
| Parametros activos | No aplica (no es MoE segun los datos disponibles; el modelo base figura como 27B denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4, GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16); variantes FP8, NVFP4 y GGUF en repositorios separados |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B, un transformer multimodal con capacidad de comprensión de imágenes (pipeline image-text-to-text) y una ventana de contexto de 256K tokens. El autor no detalla en la información disponible la composición interna de capas, el mecanismo de atención ni los datos de preentrenamiento del modelo base.

La innovación principal reside en el proceso de post-entrenamiento: el modelo se entrenó únicamente con aprendizaje por refuerzo, sin SFT ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo curadas, con sesiones de hasta 1M de tokens. El entrenamiento se prolongó durante 18 días en 144 GPUs H200. El autor publica además un modelo draft asociado (Qwen3.8-27B-DSpark), lo que sugiere soporte para decodificación especulativa, aunque los detalles técnicos de dicho draft no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen) en modo "thinking", con esfuerzo de razonamiento configurable (por defecto xhigh según la plantilla).
- Comprensión de imágenes (image-text-to-text), heredada del modelo base.
- Ejecución de tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens durante el entrenamiento.
- Uso de terminal y entornos de línea de comandos (evaluado en Terminal Bench 4.1 y 2.1).
- Ingeniería de software y resolución de issues en repositorios (evaluado en DeepSWE v1.1 y SWE Bench Pro v2).
- Seguimiento de instrucciones complejas (evaluado en IFBench).
- Razonamiento científico y de nivel experto (evaluado en GPQA Diamond y HLE).
- Compatibilidad con endpoints (tag endpoints_compatible) y con la pila de transformers.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo puede operar en entornos de línea de comandos para ejecutar comandos, inspeccionar salidas y corregir errores, gracias a su entrenamiento específico en tareas de terminal (Terminal Bench 4.1 pass@1 de 12,0 frente a 5,6 del base).
- Resolución de issues en repositorios de código: puede integrarse en pipelines de CI/CD para analizar fallos, proponer parches y validarlos, apoyándose en su rendimiento en SWE Bench Pro v2 (94,7) y DeepSWE v1.1 (46,2).
- Agentes de horizonte largo con contexto extenso: sesiones de hasta 256K tokens permiten mantener el estado de tareas complejas de múltiples pasos sin perder contexto, adecuado para automatización de flujos de trabajo prolongados.
- Asistencia técnica con entrada multimodal: al heredar la comprensión de imágenes de Qwen3.8-27B, puede analizar capturas de pantalla, diagramas o registros visuales junto con texto para diagnosticar problemas.
- Razonamiento científico y técnico asistido: su puntuación en GPQA Diamond (90,7) lo hace útil para responder preguntas de nivel experto en dominios STEM con verificación posterior.
- Sustitución directa de Qwen3.8-27B en pilas existentes: al conservar arquitectura, tokenizador y plantilla de chat, puede desplegarse sin cambios en infraestructuras de inferencia y post-entrenamiento ya montadas para el modelo base.
- Seguimiento estricto de instrucciones en producción: su resultado en IFBench (82,4) lo respalda para tareas donde el formato y las restricciones de salida son críticos.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parametros activados | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parametros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (text only) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Los resultados de DaisyRose-27B corresponden al mayor de sus ejecuciones en BF16 y FP8, que difieren en menos de un punto en cada benchmark donde se ejecutaron ambas. El autor indica que las cifras de los demás modelos provienen de sus respectivos desarrolladores y de fuentes como la leaderboard oficial de Terminal Bench, Vals.ai, Artificial Analysis y las model cards de cada modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño, un modelo denso de 27,8B en BF16 requiere del orden de 55,6 GB solo para pesos, a lo que hay que sumar caché KV para el contexto (hasta 256K tokens), lo que puede elevar sustancialmente el consumo.
- GPU recomendadas: el autor entrenó en 144 GPUs H200; para inferencia en BF16 se requieren GPUs de centro de datos con suficiente memoria (H100, H200, A100 de 80 GB). Las variantes FP8 y NVFP4 reducen los requisitos y pueden habilitar GPUs con menos memoria.
- ¿Cabe en GPU de consumo? No hay datos oficiales. Con cuantización GGUF (disponible en repositorio separado) podría intentarse en GPUs de consumo de gama alta con suficiente VRAM, aunque el contexto de 256K y el modo thinking incrementan la memoria necesaria; no se confirma compatibilidad.
- Opciones de despliegue: transformers (librería declarada); el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia. No se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible, aunque la existencia de pesos GGUF, FP8 y NVFP4 apunta a ecosistemas de despliegue variados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| DaisyRose-27B | 27B | 27B | 256K | 12,0 | 94,7 | Apache-2.0 | Hugging Face (BF16, FP8, NVFP4, GGUF) |
| Qwen3.8-27B (base) | 27B | 27B | 256K | 5,6 | 91,3 | No disponible en la información | Hugging Face |
| Muse Glimmer-30B | 30B | 30B | No disponible | 0,5 | 80,4 | No disponible | Hugging Face |
| Qwen3.6-35B-A3B | 35B | 3B | No disponible | 0,0 | 73,3 | No disponible | Hugging Face |

Frente a su modelo base, DaisyRose-27B mejora en todos los benchmarks reportados, con un salto notable en Terminal Bench (5,6 a 12,0) y mejoras más moderadas en razonamiento (GPQA Diamond de 89,2 a 90,7) y seguimiento de instrucciones (IFBench de 79,5 a 82,4). Frente a modelos de mayor tamaño como MiMo V2.6 Flash (309B totales, 15B activos) o Inkling 2 Small (594B totales, 17B activos), DaisyRose-27B queda por detrás en la mayoría de benchmarks de agente, pero compite con un coste de inferencia mucho menor al ser un modelo denso de 27B.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al heredar el modelo base, es razonable esperar los sesgos de Qwen3.8-27B, pero no se confirma.
- Riesgo de alucinación: no cuantificado en la información disponible; los benchmarks de razonamiento (HLE 34,3) indican margen de error en preguntas de nivel experto.
- Limitaciones de contexto o idioma: la ventana es de 256K tokens; los idiomas soportados no están especificados, lo que impide confirmar cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.8-27B.
- Caveat de producción: el modo thinking por defecto es xhigh, lo que incrementa latencia y consumo de tokens; el autor recomienda temperatura 1.0, top_p 0.95, top_k 20, min_p 0 y sin límite de max_tokens dentro del contexto de 256K.
- El entrenamiento se basó únicamente en RL sin SFT, lo que podría afectar a la estabilidad del formato de salida en dominios no cubiertos por las tareas de agente utilizadas; no hay datos que lo confirmen.
- No se confirma soporte explícito de tool calling ni de agentes multi-paso más allá de lo evaluado en benchmarks de terminal y SWE.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Variante GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Modelo draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del autor: https://www.radixark.com/blog/daisyrose-27b
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai (Terminal Bench 4): https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis (Qwen3.8-27B): https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis (Qwen3.6-35B-A3B): https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Model card de Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card de Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card de Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card de Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Paper de SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Release de MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
