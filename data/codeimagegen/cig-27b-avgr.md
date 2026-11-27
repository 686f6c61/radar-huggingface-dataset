# CodeImageGen/CIG-27B-avgR

## Resumen

CIG-27B-avgR es un modelo de generación de imágenes basado en código, desarrollado por CodeImageGen. Parte de Qwen/Qwen3.8-27B (aproximadamente 26.900 millones de parámetros) y se ha afinado mediante SFT y posteriormente GRPO con una recompensa denominada avgR, definida como la media de dos llamadas de evaluación independientes (IR y PR). El modelo no genera píxeles directamente: escribe un programa JavaScript para un prompt de texto y la imagen resultante es la renderización de ese programa en Chrome headless.

La relevancia de este enfoque radica en que traslada la generación de imágenes al dominio del código ejecutable, lo que permite control programático, reproducibilidad y verificación mediante renderizado. Se distribuye con licencia Apache 2.0, en formato safetensors y fp16 con pesos fusionados, e incluye un cabezal MTP opcional para decodificación especulativa.

El modelo se publica junto a una familia de variantes (IPR, IR, PR, SFT y versiones de 9B) y un dataset de SFT de 35k ejemplos, lo que lo sitúa como una línea de investigación más que como un producto aislado. El checkpoint corresponde al paso 250 de GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (aprox. 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16, pesos fusionados; incluye `model-mtp.safetensors` opcional) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 26,9B parámetros construido sobre Qwen/Qwen3.8-27B, con la etiqueta de arquitectura `qwen3_5_text`. El entrenamiento consta de dos fases: primero un ajuste supervisado (SFT) y después optimización con GRPO (paso 250) usando la recompensa avgR, que promedia dos evaluaciones independientes del resultado (IR y PR). Los pesos finales se publican fusionados en fp16.

La innovación central es el paradigma de generación de imágenes basada en código: el modelo produce JavaScript a partir de un prompt y la imagen se obtiene al renderizar ese programa en Chrome headless. Este esquema permite evaluar la salida de forma programática y separa la generación simbólica (código) de la rasterización (renderer). Se incluye además un cabezal MTP (`model-mtp.safetensors`) para decodificación especulativa, marcado como opcional. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados; solo se referencia el dataset CIG-SFT-35k.

## Capacidades

- Generación de código JavaScript a partir de prompts de texto, orientada a producir imágenes renderizables.
- Generación de imágenes indirecta mediante renderizado del programa en Chrome headless.
- Conversacional (tag `conversational` en el repositorio).
- Decodificación especulativa mediante cabezal MTP opcional.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de ilustraciones programáticas: dado un prompt como "a red fox in the snow", el modelo emite un programa JavaScript que, renderizado en Chrome headless, produce la imagen. Útil cuando se necesita una imagen reproducible y versionable como código.
- Pipelines de generación de activos gráficos: al ser la salida código, los resultados pueden almacenarse en control de versiones, revisarse en diff y regenerarse de forma determinista con el mismo renderer.
- Investigación en generación de imágenes basada en código: la familia de variantes (IPR, IR, PR, SFT) y el dataset CIG-SFT-35k permiten estudios comparativos de recompensas y estrategias de RL.
- Evaluación automática de fidelidad prompt-imagen: el esquema de recompensa avgR (media de IR y PR) sugiere que el modelo está pensado para escenarios donde la salida se valida mediante jueces automáticos, lo que encaja en entornos de benchmark y evaluación continua.
- Prototipado de gráficos vectoriales o basados en canvas: los programas JavaScript pueden adaptarse para generar SVG o dibujos en canvas dentro de aplicaciones web.
- Reproducción de figuras para documentación técnica: prompts descriptivos pueden traducirse a código que renderice diagramas simples o ilustraciones consistentes con el texto.
- Fine-tuning posterior: al publicarse en safetensors y con licencia Apache 2.0, sirve como base para ajustes específicos de dominio en generación de código gráfico.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| GenEval2 | GM | 48,3 |
| GenEval2 | AM | 76,5 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estándar de texto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 54 GB solo para pesos (26,9B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para comodidad.
- GPU recomendadas: A100 80 GB, H100 80 GB; en configuraciones multi-GPU también es viable con dos A100 40 GB o dos RTX 4090 24 GB si se reparte el modelo.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en fp16; requeriría cuantización, para la cual no se especifican formatos disponibles en la información proporcionada.
- Opciones de despliegue: transformers (librería indicada); compatible con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible. Requiere además un renderer Chrome headless para materializar las imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-27B-avgR | ~26,9B | no disponible | Generación de imágenes vía código JS + render | Apache 2.0 | Hugging Face |
| CIG-27B-IPR | no disponible | no disponible | Variante con recompensa IPR | no disponible | Hugging Face |
| CIG-27B-SFT | no disponible | no disponible | Solo SFT, sin GRPO | no disponible | Hugging Face |
| CIG-9B-SFT | no disponible | no disponible | Variante de 9B solo SFT | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de las variantes hermanas para una comparación cuantitativa. Tampoco se han identificado en la información proporcionada modelos comparables de otras familias con el mismo enfoque de generación de imágenes basada en código.

## Limitaciones y advertencias

- La generación de imágenes depende de un renderer externo (Chrome headless) y del repositorio de códigoimagegen; sin ese entorno, el modelo no produce imágenes directamente.
- No se especifican los idiomas soportados, lo que impide garantizar un comportamiento multilingüe fiable.
- No se detalla la longitud de contexto, lo que limita la planificación de prompts largos o conversaciones extensas.
- Riesgo de alucinación en el código generado: programas que no rendericen correctamente o que produzcan resultados distintos al prompt; el esquema de evaluación con jueces (IR/PR) sugiere precisamente que la fidelidad no es perfecta (GM 48,3 en GenEval2).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los componentes externos (renderer, Chrome headless) y de los datos de entrenamiento, no detallados.
- El checkpoint es el paso 250 de GRPO sobre una base concreta (Qwen3.8-27B); cambios en el renderer o en el entorno pueden alterar los resultados.
- El modelo está etiquetado como `text-generation` en el pipeline, pero su finalidad real es la generación de código para imágenes; conviene no confundirlo con un modelo de texto generalista.
- No hay información sobre cuantizaciones oficiales ni sobre rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-27B-avgR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y entorno (renderer): https://github.com/codeimagegen/codeimagegen
- Variante CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- Variante CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- Variante CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- Variante CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- Variante CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- Variante CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Paper de referencia (citado en la model card): Wang, Nicole; Liang, Zhanhao; Leng, Xingjian; Zheng, Liang. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026.
