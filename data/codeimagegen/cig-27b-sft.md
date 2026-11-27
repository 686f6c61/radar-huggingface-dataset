# CodeImageGen/CIG-27B-SFT

## Resumen

CIG-27B-SFT es un modelo de generación de imágenes basado en código, desarrollado por CodeImageGen. Se trata de un ajuste fino supervisado (SFT) del modelo de lenguaje Qwen/Qwen3.8-27B, entrenado sobre el dataset CIG-SFT-35k. En lugar de producir píxeles directamente como un modelo de difusión, el modelo escribe un programa en JavaScript que, al renderizarse en un navegador Chrome en modo headless, genera la imagen final. Esta aproximación, denominada generación de imágenes basada en código, traslada la tarea de síntesis visual al dominio de la generación de código estructurado.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 27 mil millones) y se distribuye en formato safetensors con pesos fusionados en fp16, con un tamaño de repositorio de 54,7 GB. La arquitectura declarada en los tags es `qwen3_5_text`, heredada del modelo base Qwen3.8-27B, por lo que se trata de un transformer de texto adaptado a una tarea multimodal de salida visual indirecta.

Su relevancia radica en que constituye el punto de partida de la familia de modelos GRPO de 27B de CodeImageGen, y en que explora una vía alternativa a los modelos de difusión para la generación de imágenes, donde la salida es un programa verificable y editable. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de texto (tag `qwen3_5_text`), basado en Qwen/Qwen3.8-27B |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en fp16 fusionado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-mtp.safetensors` opcional para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de texto de aproximadamente 27 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) empleando el dataset CIG-SFT-35k, orientado a la tarea de generación de imágenes basada en código. No se empleó recompensa (reward) en esta etapa, según la model card; los modelos GRPO de la familia son iteraciones posteriores. Los pesos se publican fusionados y en precisión fp16.

La innovación técnica principal reside en el paradigma de salida: el modelo genera un programa JavaScript que se renderiza en Chrome headless para producir la imagen. El repositorio incluye además un cabezal MTP (`model-mtp.safetensors`) para decodificación especulativa, de uso opcional. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de programas JavaScript a partir de un prompt de texto, cuyo renderizado en Chrome headless produce una imagen.
- Generación de imágenes basada en código (text-to-image indirecta), con salida verificable y editable como código.
- Generación de texto y conversación, heredadas del modelo base Qwen3.8-27B (tag `conversational`).
- Decodificación especulativa opcional mediante el cabezal MTP incluido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Generación de ilustraciones programáticas: el modelo recibe un prompt como "a red fox in the snow" y emite el JavaScript que, renderizado en Chrome headless, produce la imagen; útil para pipelines donde la salida debe ser reproducible y versionable.
- Prototipado de gráficos web: dado que la salida es código JavaScript, puede integrarse directamente en flujos de desarrollo frontend para generar visualizaciones o elementos gráficos editables.
- Generación de imágenes editable y auditable: al ser la salida un programa, es posible inspeccionar, modificar y re-renderizar el resultado, lo que facilita la corrección de errores frente a modelos de difusión opacos.
- Investigación en generación de imágenes basada en código: sirve como baseline SFT dentro de la familia CIG para comparar con las variantes GRPO (IPR, IR, PR, avgR) y medir el efecto del refuerzo.
- Automatización de assets gráficos en CI/CD: el script de evaluación (`grpo.t2i.eval.generate_one`) permite generar imágenes por lotes desde línea de comandos, integrándose en pipelines automatizados.
- Evaluación comparativa de recompensas: al ser el punto de partida de los modelos GRPO de 27B, se usa para estudiar cómo distintas funciones de recompensa afectan a la calidad de la imagen generada (GenEval2).

## Benchmarks y rendimiento

| Benchmark | Métrica | CIG-27B-SFT |
|---|---|---|
| GenEval2 | GM | 43.9 |
| GenEval2 | AM | 73.4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para operar con comodidad.
- GPU recomendadas: A100 80 GB, H100 80 GB para fp16 sin cuantizar.
- En GPU de consumo (RTX 4090, 24 GB): no cabe en fp16; requeriría cuantización (no documentada en la información disponible) o descarga parcial, por lo que no es viable de forma directa.
- Opciones de despliegue: transformers (librería declarada); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas en la información disponible.
- El renderizado de la imagen requiere además un entorno con Chrome headless y el repositorio de setup del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-27B-SFT | ~27B | No disponible | Generación de imágenes vía código JS (SFT) | Apache 2.0 | Hugging Face |
| CIG-27B-IPR | No disponible | No disponible | Generación de imágenes vía código (GRPO) | No disponible | Hugging Face |
| CIG-9B-SFT | No disponible | No disponible | Generación de imágenes vía código (SFT, 9B) | No disponible | Hugging Face |
| Qwen/Qwen3.8-27B | ~27B | No disponible | LLM de texto (base) | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La generación de imágenes depende de un renderizador externo (Chrome headless) y del entorno del repositorio codeimagegen; sin ese setup el modelo no produce imágenes.
- Al ser un modelo SFT sin etapa de recompensa, su calidad queda por debajo de las variantes GRPO de la misma familia, según la propia model card ("the starting point of the 27B GRPO models").
- Riesgo de alucinación y de generar código JavaScript inválido o no renderizable; no se documentan tasas de fallo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar prompts largos con garantías.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del renderizador.
- El repositorio es reciente (creado en noviembre de 2026) y sin descargas ni likes, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-27B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Repositorio de setup (renderer y entorno): https://github.com/codeimagegen/codeimagegen
- CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Paper: Wang, Nicole; Liang, Zhanhao; Leng, Xingjian; Zheng, Liang. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026 (enlace no disponible).
