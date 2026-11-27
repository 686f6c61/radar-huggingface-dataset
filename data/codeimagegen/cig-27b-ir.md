# CodeImageGen/CIG-27B-IR

## Resumen

CIG-27B-IR es un modelo de generacion de imagenes basado en codigo, desarrollado por CodeImageGen. Se construye a partir de Qwen/Qwen3.8-27B mediante un ajuste fino supervisado (SFT) seguido de optimizacion con GRPO (Group Relative Policy Optimization) usando una recompensa denominada IR (image-only reward), en la que el juez de la recompensa solo observa la imagen renderizada. El modelo no genera pixeles directamente: escribe un programa JavaScript a partir de un prompt de texto, y la imagen final es el resultado de renderizar ese programa en un navegador Chrome en modo headless.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) en precision fp16 con pesos fusionados, y se distribuye en formato safetensors bajo licencia Apache 2.0. Incluye un cabezal MTP (multi-token prediction) opcional para decodificacion especulativa. Es relevante porque propone un paradigma alternativo a los modelos de difusion: la generacion de imagenes como tarea de generacion de codigo, lo que permite control programatico, reproducibilidad y edicion estructurada de la imagen resultante.

El modelo esta etiquetado con los tags code-based-image-generation, text-to-image y javascript, y su pipeline declarado es text-generation. La informacion publica disponible sobre idiomas, contexto y datos de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B, tag qwen3_5_text); generacion de codigo JavaScript como representacion intermedia de imagen |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 fusionado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye model-mtp.safetensors opcional para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de ~27 mil millones de parametros. El entrenamiento se realizo en dos fases: primero un ajuste fino supervisado (SFT) sobre un dataset propio de prompts e imagenes, y despues GRPO con una recompensa IR en la que el juez evalua unicamente la imagen renderizada, no el codigo generado. El checkpoint publicado corresponde al paso 250 de GRPO, con pesos en fp16 fusionados. La generacion funciona asi: el modelo emite un programa JavaScript para el prompt de texto, y la imagen es ese programa renderizado en Chrome headless. Se incluye un cabezal MTP opcional (model-mtp.safetensors) para decodificacion especulativa, lo que puede acelerar la inferencia. El dataset de SFT referenciado es CIG-SFT-35k, de 35 mil ejemplos. No se detallan el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO mas alla de la fase GRPO indicada.

## Capacidades

- Generacion de imagenes mediante codigo: dado un prompt de texto, produce un programa JavaScript que, renderizado en Chrome headless, genera la imagen.
- Generacion de codigo JavaScript como representacion intermedia, lo que permite inspeccionar, versionar y editar la imagen a nivel de codigo.
- Generacion de texto y conversacion (pipeline text-generation, tag conversational).
- Decodificacion especulativa mediante el cabezal MTP opcional.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes programaticas en pipelines de contenido: el modelo escribe JavaScript que se renderiza a imagen, lo que permite integrar la generacion en flujos automatizados donde la imagen resultante es reproducible y auditable a partir del codigo.
- Edicion y versionado de imagenes a nivel de codigo: al ser la salida un programa JavaScript, un equipo puede almacenar, comparar y modificar la representacion textual de una imagen en un repositorio, algo inviable con modelos de difusion que solo devuelven pixeles.
- Prototipado rapido de ilustraciones tecnicas: prompts como diagramas, escenas o composiciones simples se traducen en codigo de dibujo que puede ajustarse manualmente antes del renderizado.
- Generacion de assets para interfaces y demos: util para producir imagenes de placeholder o ilustraciones de baja/media fidelidad dentro de un flujo de desarrollo front-end, dado que la salida es JavaScript compatible con el renderizador.
- Investigacion en recompensas basadas en imagen: el modelo sirve como baseline reproducible para estudiar el efecto de recompensas image-only (IR) frente a otras variantes (IPR, PR, avgR) publicadas por el mismo autor.
- Evaluacion comparativa de generacion de imagenes basada en codigo: junto con GenEval2, permite medir y comparar estrategias de entrenamiento (SFT frente a SFT+GRPO) en la tarea de text-to-image mediante codigo.
- Despliegue en entornos con Chrome headless: al requerir un navegador para renderizar, encaja en infraestructuras de CI/CD o servicios de renderizado ya existentes.

## Benchmarks y rendimiento

| Benchmark | Metrica | CIG-27B-IR |
|---|---|---|
| GenEval2 | GM (global match) | 45.8 |
| GenEval2 | AM (attribute match) | 75.0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 54 GB solo para pesos (26,9 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda un minimo de 60-80 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para fp16. Para cuantizaciones de 8 bits o 4 bits (no publicadas oficialmente) se requeriria aproximadamente 27 GB o 14 GB respectivamente, aunque el autor no distribuye pesos cuantizados.
- Cabe en GPU de consumo: no en fp16; potencialmente en GPUs de 24 GB (RTX 4090) solo con cuantizacion agresiva no oficial.
- Opciones de despliegue: transformers (libreria declarada); el repositorio del proyecto (github.com/codeimagegen/codeimagegen) incluye el entorno de renderizado y el script de evaluacion. vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Requisito adicional: Chrome headless para renderizar el JavaScript generado a imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-27B-IR | ~26,9 mil millones | no disponible | Text-to-image via codigo JavaScript (SFT + GRPO, recompensa IR) | Apache 2.0 | Hugging Face |
| CIG-27B-IPR | no disponible | no disponible | Text-to-image via codigo (variante de recompensa IPR) | no disponible | Hugging Face |
| CIG-27B-SFT | no disponible | no disponible | Text-to-image via codigo (solo SFT, sin GRPO) | no disponible | Hugging Face |
| CIG-9B-IPR / CIG-9B-SFT | ~9 mil millones (por nombre) | no disponible | Text-to-image via codigo, version reducida | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad de la imagen depende de la correccion del JavaScript generado y del renderizador Chrome headless; errores de codigo pueden producir imagenes vacias o incorrectas.
- Requiere infraestructura de renderizado (navegador headless), lo que anade complejidad operativa frente a modelos de difusion que devuelven pixeles directamente.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3.8-27B, puede heredar sesgos del modelo base y del dataset CIG-SFT-35k.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo puede generar codigo que no refleje fielmente el prompt.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene sus propios terminos que deben verificarse.
- El checkpoint corresponde al paso 250 de GRPO; no se documenta la estabilidad del entrenamiento ni el rendimiento en pasos posteriores.
- No se publican pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- Metricas GenEval2 (GM 45.8, AM 75.0) sin contexto comparativo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-27B-IR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto: https://github.com/codeimagegen/codeimagegen
- Variante CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- Variante CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- Variante CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- Variante CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- Variante CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- Variante CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Paper citado (arXiv preprint, 2026): Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards (Wang, Liang, Leng, Zheng); enlace directo no disponible.
