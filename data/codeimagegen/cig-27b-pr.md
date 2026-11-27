# CodeImageGen/CIG-27B-PR

## Resumen

CIG-27B-PR es un modelo de generación de imágenes por código desarrollado por CodeImageGen. Se trata de un ajuste fino del modelo de lenguaje Qwen/Qwen3.8-27B (26.895.998.464 parámetros) que, en lugar de producir píxeles directamente, escribe un programa JavaScript que, renderizado en un navegador Chrome headless, genera la imagen final. El modelo ha sido entrenado en dos fases: primero un ajuste supervisado (SFT) y después un aprendizaje por refuerzo con GRPO, empleando una recompensa denominada "PR" en la que el juez evalúa únicamente el programa generado, no la imagen renderizada.

La propuesta resulta relevante porque desplaza el problema de la síntesis de imágenes al terreno de la generación de código ejecutable, lo que permite inspeccionar, editar y reproducir el resultado de forma determinista. El modelo hereda la arquitectura y la ventana de contexto de su base Qwen3.8-27B, si bien la model card no detalla estos extremos.

El checkpoint corresponde al paso 250 de GRPO, con pesos fusionados en fp16 y un cabezal MTP opcional para decodificación especulativa. La licencia es Apache 2.0 y el repositorio ocupa 54,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-mtp.safetensors` opcional) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de aproximadamente 26,9 mil millones de parámetros según los pesos publicados. Sobre esa base se aplica un ajuste supervisado (SFT) seguido de un entrenamiento con GRPO (Group Relative Policy Optimization) hasta el paso 250. La innovación central reside en la función de recompensa: la variante "PR" (program only) hace que el juez evalúe exclusivamente el programa JavaScript generado, sin acceso a la imagen renderizada, lo que orienta el aprendizaje hacia la corrección estructural del código.

Los pesos se distribuyen fusionados en fp16. El repositorio incluye además un cabezal MTP (multi-token prediction) opcional para decodificación especulativa, que puede acelerar la inferencia. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni detalles sobre el proceso de RLHF/DPO más allá del esquema SFT + GRPO descrito.

## Capacidades

- Generación de programas JavaScript a partir de una descripción textual en lenguaje natural.
- Generación de imágenes mediante renderizado del programa en Chrome headless (pipeline `code-based-image-generation`).
- Generación de texto conversacional (tag `conversational`).
- Soporte de decodificación especulativa mediante el cabezal MTP opcional.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de ilustraciones reproducibles: dado un prompt como "a red fox in the snow", el modelo emite un programa JavaScript que, al renderizarse, produce la imagen; al ser código, el resultado es inspeccionable y versionable.
- Creación de gráficos vectoriales y diagramas técnicos: el modelo puede escribir programas que dibujen formas, ejes y etiquetas, útil para visualizaciones generadas por lotes en pipelines de documentación.
- Prototipado rápido de assets web: el código JavaScript generado puede integrarse directamente en una página o en un canvas para producir recursos gráficos ligeros.
- Automatización de pruebas visuales: al ser el resultado un programa determinista, se pueden generar imágenes de referencia y comparar renderizados en CI/CD.
- Investigación en recompensas para RL: la variante PR sirve como base para estudiar cómo distintas funciones de recompensa (programa frente a imagen) afectan a la calidad del código generado.
- Edición y variación controlada: al modificar parámetros del programa generado (colores, posiciones, tamaños) se obtienen variantes de la imagen sin reejecutar el modelo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| GenEval2 | GM | 47.0 |
| GenEval2 | AM | 76.4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para operar con comodidad.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- En GPU de consumo: no cabe en fp16 en tarjetas de 24 GB (RTX 4090); requeriría cuantización a 8 o 4 bits, no documentada por el autor.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El cabezal MTP opcional puede reducir la latencia mediante decodificación especulativa.
- Requiere además un entorno de renderizado con Chrome headless para materializar las imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CIG-27B-PR | 26,9 B | no disponible | Generación de imágenes vía código JS | Apache 2.0 |
| CIG-27B-IPR | no disponible | no disponible | Variante de recompensa IPR | Apache 2.0 (presumible) |
| CIG-27B-SFT | no disponible | no disponible | Solo ajuste supervisado | Apache 2.0 (presumible) |
| CIG-9B-IPR | ~9 B (por nombre) | no disponible | Variante de menor tamaño | Apache 2.0 (presumible) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La calidad de la imagen depende de la corrección del programa JavaScript y del entorno de renderizado (Chrome headless); errores en el código producen imágenes fallidas o vacías.
- El modelo se distribuye en fp16 con 54,7 GB de repositorio, lo que exige hardware de gama alta para inferencia sin cuantización.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento ante prompts ambiguos.
- Riesgo de alucinación en el código generado: puede producir APIs inexistentes o construcciones que fallen en el renderizador.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y del renderizador empleado.
- La model card no especifica la longitud de contexto, los idiomas soportados ni los tipos de cuantización validados.
- El modelo está orientado a la generación de programas para imágenes; no debe asumirse un rendimiento generalista en tareas de texto o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-27B-PR
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y entorno de renderizado: https://github.com/codeimagegen/codeimagegen
- Variante CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- Variante CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- Variante CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- Variante CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- Variante CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- Variante CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Paper citado: Wang, Nicole; Liang, Zhanhao; Leng, Xingjian; Zheng, Liang. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026.
