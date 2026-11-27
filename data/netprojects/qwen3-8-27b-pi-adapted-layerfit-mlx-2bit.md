# netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit

## Resumen

El modelo `netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit` es una cuantización de 2 bits en formato MLX del modelo `harness-hub/Qwen3.8-27B-pi-adapted`, una adaptación del Qwen3.8-27B de Alibaba orientada al agente de programación "pi". Lo publica NetProjects (Paris Michalas) con el objetivo explícito de que un Mac de 16 GB de memoria unificada pueda ejecutar un modelo de aproximadamente 27.000 millones de parámetros, ocupando 9,1 GB en disco.

La innovación principal es LayerFit, una técnica de búsqueda por capas que asigna distinto número de bits a cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) en lugar de aplicar una cuantización uniforme. Según la model card, con el mismo presupuesto de tamaño, LayerFit 2-bit alcanza un 76,7% de acuerdo top-1 con el modelo bf16 frente al 67,9% de una cuantización estándar de 2 bits, y reduce la divergencia KL un 45% (0,3673 frente a 0,6712).

Esta build es solo texto (se elimina la torre de visión para ajustarse a 16 GB) y conserva una longitud de contexto de 262K tokens. No incluye cabeza MTP, ya que el autor indica que a 2 bits no aporta beneficio. Está pensada para ejecutarse con `mlx-lm`, `mlx-vlm` y LM Studio sobre Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (tag `qwen3_5`), con bloques de atención y atención lineal |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | 2 bits (receta LayerFit por capas); existen builds 2.5, 3, 4, 6 y 8 bits del mismo autor |
| Idiomas soportados | No disponible (la evaluación interna usa inglés, otros idiomas, código, tool calls y matemáticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-lm`) |
| Tamaño en disco | 9,1 GB |
| Modalidad | Solo texto (torre de visión eliminada) |
| Cabeza MTP | No incluida en esta build |

## Arquitectura y entrenamiento

El modelo base es `harness-hub/Qwen3.8-27B-pi-adapted`, una adaptación del Qwen3.8-27B de Alibaba para el agente de programación "pi". La arquitectura corresponde a la familia Qwen3.5, un transformer con bloques de atención estándar y de atención lineal, según se deduce de la descripción de LayerFit (que menciona explícitamente "every layer's MLP, attention and linear-attention blocks, plus the embeddings and output head"). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La contribución técnica de esta build es LayerFit: en lugar de aplicar un mismo número de bits a todas las capas, se mide la sensibilidad de cada componente (MLP, atención, atención lineal, embeddings y cabeza de salida) a la cuantización agresiva y se distribuye el presupuesto de bits donde más reduce el error. La receta concreta está publicada en `layerfit-recipe.json` dentro del repositorio. El autor indica que la receta se obtuvo para la base Qwen3.8-27B y se revalidó sobre este modelo adaptado. La evaluación se realizó contra una fusión bf16 propia del modelo base, con pasajes en inglés, otros idiomas, código, tool calls y matemáticas.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento con modo "thinking" (la model card reporta 2/2 en la prueba de thinking).
- Generación de código y soporte para flujos de agente de programación (adaptación "pi").
- Tool calling / function calling (la model card reporta "pass" en tool call y coding 2/3).
- Matemáticas: 43/50 en GSM8K-50 con thinking desactivado.
- Contexto largo de hasta 262K tokens.
- Capacidades multilingües: no especificadas formalmente; la evaluación interna incluye pasajes en varios idiomas además del inglés.
- Sin capacidades de visión en esta build (torre eliminada).

## Casos de uso

- Asistente de programación local en Mac: el modelo puede integrarse en un agente tipo "pi" para autocompletar, refactorizar y explicar código sin salir del portátil, aprovechando que ocupa 9,1 GB y cabe en 16 GB de memoria unificada.
- Automatización de tareas de agente con tool calling: al soportar function calling, puede encadenar llamadas a herramientas (shell, APIs, editores) en flujos multi-paso supervisados por el desarrollador.
- Procesamiento de documentos largos: con 262K tokens de contexto puede resumir o consultar repositorios completos, expedientes o transcripciones extensas en una sola pasada, algo inviable en modelos de contexto corto.
- Razonamiento matemático asistido: útil para resolver problemas de nivel GSM8K en entornos offline, con la salvedad de que a 2 bits la precisión cae respecto al modelo original (43/50 en la prueba del autor).
- Prototipado y evaluación de agentes en local: sirve como banco de pruebas para pipelines de agentes antes de desplegarlos en modelos mayores en la nube, con coste cero de inferencia.
- Educación y experimentación: permite a estudiantes e investigadores ejecutar un modelo de ~27B en hardware de consumo Apple Silicon para estudiar cuantización extrema y técnicas por capas.
- Asistencia offline en entornos sin conectividad: al ejecutarse íntegramente en local con MLX, es adecuado para escenarios con requisitos de privacidad o sin acceso a red.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 43/50 |
| Tool call y coding | 2/3 (pass) |
| Thinking | 2/2 (pass) |
| Acuerdo top-1 con bf16 (LayerFit 2-bit) | 76,7% |
| Acuerdo top-1 con bf16 (2-bit estándar) | 67,9% |
| Divergencia KL (LayerFit 2-bit) | 0,3673 |
| Divergencia KL (2-bit estándar) | 0,6712 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar para esta build. El autor remite a la model card del modelo base para los resultados del publicador original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,1 GB de pesos; el autor recomienda que la descarga no supere aproximadamente el 60% de la memoria del equipo, por lo que apunta a Macs de 16 GB.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada de 16 GB o superior. No está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de 16 GB; para 24, 32 y 48 GB el autor ofrece builds de 3, 4, 6 y 8 bits respectivamente.
- Ajuste adicional en 16 GB: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use más memoria (efecto hasta reinicio), junto con cerrar aplicaciones y mantener prompts de pocos miles de tokens.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`), `mlx-vlm` y LM Studio, al ser formato MLX estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit | ≈26,9B | 262K | 2 bits (LayerFit) | Apache-2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit | ≈26,9B | 262K | 4 bits (LayerFit) | Apache-2.0 | Hugging Face, MLX (16,5 GB) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | ≈26,9B | 262K | 6 bits | Apache-2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-pi-adapted (bf16) | ≈26,9B | 262K | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada. La comparación más directa es con las otras builds del mismo autor: la de 2 bits es la única que cabe con holgura en 16 GB, a costa de eliminar la visión y de una pérdida de precisión medible frente a bf16.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad respecto al modelo bf16: el acuerdo top-1 es del 76,7%, es decir, aproximadamente uno de cada cuatro tokens predichos difiere del modelo original.
- La build es solo texto; se ha eliminado la torre de visión, por lo que no puede procesar imágenes.
- No incluye cabeza MTP, lo que puede reducir el rendimiento en decodificación especulativa respecto a otras builds.
- En Macs de 16 GB el margen de memoria es estrecho; prompts largos o aplicaciones abiertas pueden provocar swap o fallos de asignación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la cuantización agresiva; no se han publicado evaluaciones específicas de sesgo.
- Idiomas soportados no documentados formalmente; el rendimiento fuera del inglés no está cuantificado.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; conviene revisar `LICENSE` y `NOTICE` del repositorio.
- LayerFit es una marca registrada de NetProjects; la receta de bits es específica de este modelo y no es directamente transferible sin revalidación.
- No hay descargas ni likes registrados en el momento de la ficha, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
