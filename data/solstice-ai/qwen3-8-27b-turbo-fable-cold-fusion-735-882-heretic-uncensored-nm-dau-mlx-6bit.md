# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit

## Resumen

`Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit` es una cuantizacion MLX de 6 bits del checkpoint homonimo creado por DavidAU y Nightmedia, publicada por Solstice-AI para ejecucion local en Apple Silicon. El modelo base parte de la arquitectura Qwen3.8-27B, un modelo denso de 27.000 millones de parametros con atencion hibrida (16 capas de atencion completa y 48 de atencion lineal con estado recurrente), entrenado originalmente por Alibaba para tareas de texto, imagen y video. Esta variante especifica aplica un post-entrenamiento en varias etapas denominado GAIN, sintesis de pesos Cold-Fusion, desalineacion "Heretic" con divergencia KL muy baja (0,0025) y conjuntos de datos de "curacion de precision" para elevar el rendimiento en razonamiento y reducir el numero de tokens de pensamiento entre 2 y 10 veces respecto al Qwen3.8-27B-Instruct original.

La version MLX 6-bit aqui descrita ocupa unos 21,9 GB en el repositorio y esta pensada para equipos Apple con memoria unificada de 24 GB o superior. Segun la model card, mantiene el 99 % del rendimiento cognitivo de la version de 8 bits y alcanza velocidades de 26 a 78 tokens por segundo dependiendo del chip. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como "completamente sin censura y desalineado", por lo que su uso conlleva una responsabilidad explicita del usuario sobre los contenidos generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, atencion hibrida: 16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27.000 millones (modelo base); archivo safetensors cuantizado: 5.885.566.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contexto largo, pero no se especifica el valor en esta version) |
| Tipos de cuantizacion | MLX 6-bit (esta version); el modelo base tiene versiones en 4-bit, 6-bit, 8-bit y GGUF |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 6-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atencion hibrida: solo 16 de las 64 capas utilizan atencion completa (con un intervalo de atencion completa de 4), mientras que las otras 48 capas usan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento profundo. El checkpoint original de DavidAU y Nightmedia anade un post-entrenamiento en multiples etapas: el metodo GAIN alinea trazas de razonamiento sintetico de nivel "frontier" sin olvido catastrofico; la sintesis Cold-Fusion combina pesos de forma que se conserva el 99 % del rendimiento BF16 incluso en cuantizaciones de 4 y 8 bits; y la etapa "Heretic" elimina los vectores de rechazo y el lenguaje corporativo de seguridad con una divergencia KL de 0,0025, seguida de conjuntos de datos de curacion para restaurar la precision. La cuantizacion MLX 6-bit de Solstice-AI utiliza factores de escala fusionados y preserva las capas de proyeccion de atencion en alta precision para minimizar la perdida de calidad.

## Capacidades

- Generacion de texto y razonamiento: el modelo modula dinamicamente la longitud del chain-of-thought (modo `<thinking>`) segun la complejidad de la consulta, asignando "scratchpads" profundos para matematicas y codigo, y respuestas directas para preguntas simples.
- Razonamiento logico y de sentido comun: segun la model card, supera al Qwen3.8-27B-Instruct de referencia en ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA y WinoGrande.
- Generacion de codigo y soporte de tool calling: el modelo base Qwen3.8-27B soporta tool calling y tareas agenciales de multiples pasos; esta cuantizacion hereda esas capacidades en la medida en que el runtime MLX las expone.
- Capacidades multilingues: ingles y chino (segun la model card).
- Modo "uncensored": eliminacion completa de vectores de rechazo y de plantillas de seguridad corporativas, lo que permite generacion sin restricciones de contenido.
- Vision (limitada): el modelo base es multimodal (image-text-to-text), pero esta cuantizacion MLX se centra en texto; no se documentan capacidades de vision en la version 6-bit.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo puede emplearse para generar ataques de prompt injection, evaluar robustez de sistemas de IA y explorar vulnerabilidades en pipelines de generacion, gracias a su ausencia de filtros de seguridad. Requiere un entorno controlado y autorizacion explicita.
- Escritura creativa sin restricciones: autores y guionistas pueden usarlo para generar narrativa explicita, dialogos con registros extremos o contenido de ficcion que otros modelos rechazarian, con control fino sobre el tono gracias al modo de pensamiento dinamico.
- Razonamiento matematico y cientifico: su capacidad para asignar mas tokens de pensamiento a problemas complejos lo hace util para resolver demostraciones, analizar complejidad algoritmica o verificar pasos de calculo simbolico.
- Asistente de programacion local: integrable en entornos de desarrollo mediante el servidor OpenAI-compatible de `mlx_lm.server`, permite generar codigo, explicar fragmentos y refactorizar sin depender de la nube, con latencia baja en Apple Silicon.
- Analisis de documentos con contexto largo: aunque no se especifica la longitud de contexto exacta, el modelo base soporta procesamiento de contexto largo; puede usarse para resumir informes extensos o extraer informacion de corpus amplios en ingles y chino.
- Experimentacion en alineacion y desalineacion de modelos: investigadores en IA pueden estudiar el efecto de la desalineacion controlada (KLD bajo) sobre el rendimiento en benchmarks, comparando este checkpoint con versiones alineadas de Qwen3.8.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, comparados con el Qwen3.8-27B-Instruct de referencia y otras variantes de la familia Qwen. Estos datos no han sido verificados de forma independiente.

| Modelo | ARC-C (0-shot) | ARC-E (0-shot) | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| **Qwen3.8-27B-TURBO-Fable (6-bit, este modelo)** | 0,735 | 0,882 | 0,917 | 0,832 | 0,530 | 0,837 | 0,785 |
| Qwen3.8-27B-Instruct (baseline) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (MoE) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

Segun el autor, el incremento sobre el baseline es de +14,4 % en ARC-Challenge, +8,6 % en HellaSwag y +7,4 % en WinoGrande, con una reduccion de tokens de razonamiento de 2x a 10x. No se han publicado resultados en MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 22,4 GB para la cuantizacion MLX 6-bit (tamano del repositorio: 21,9 GB). Requiere Apple Silicon con memoria unificada de al menos 24 GB.
- Chips compatibles y rendimiento declarado por el autor:
  - M2 / M3 / M4 Max (36-64 GB): 38-46 tokens/s, optimo.
  - M1 / M2 / M3 / M4 Ultra (64-192 GB): 62-78 tokens/s, maximo rendimiento.
  - M3 / M4 Pro (24-36 GB): 26-32 tokens/s, soportado.
- No esta pensado para GPUs NVIDIA de forma directa; el formato MLX es exclusivo de Apple Silicon. Para GPUs CUDA habria que convertir los pesos a otro formato (por ejemplo, GGUF o safetensors BF16).
- Opciones de despliegue: `mlx-lm` (Python), `mlx_lm.chat` (CLI interactiva) y `mlx_lm.server` (servidor compatible con OpenAI).
- Latencia: no se proporcionan datos de latencia por peticion, solo velocidad de generacion en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B-TURBO-Fable (este, 6-bit MLX)** | 27B (dense) | No disponible | Apache 2.0 | MLX 6-bit | Desalineado, sin censura, razonamiento token-eficiente |
| Qwen3.8-27B-Instruct | 27B (dense) | Largo (no especificado) | Apache 2.0 | BF16, GGUF, etc. | Version oficial alineada de Alibaba |
| Qwen3.6-35B-A3B-Instruct | 35B total, 3B activos (MoE) | Largo (no especificado) | Apache 2.0 | BF16, GGUF, etc. | Mezcla de expertos, mas eficiente en inferencia |
| Qwen3.5-27B-Instruct | 27B (dense) | Largo (no especificado) | Apache 2.0 | BF16, GGUF, etc. | Generacion anterior de la familia Qwen |

La comparativa se basa en los benchmarks de la model card, donde este modelo supera a las tres alternativas en todos los tests listados. No obstante, la diferencia principal no es solo de rendimiento, sino de alineacion: este checkpoint elimina deliberadamente los mecanismos de seguridad, lo que lo hace inadecuado para despliegues en produccion sin supervision humana.

## Limitaciones y advertencias

- Modelo "completamente sin censura y desalineado": puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin restricciones. La model card advierte explicitamente que el usuario es el unico responsable de las salidas generadas.
- Riesgo de alucinacion: al igual que otros modelos de 27B, puede inventar hechos, citas o referencias, especialmente en tareas de conocimiento factual. No se han publicado evaluaciones de veracidad.
- Sesgos conocidos: entrenado principalmente en ingles y chino, puede reflejar sesgos culturales y linguisticos de esos dominios. No se han realizado auditorias de sesgo.
- Limitaciones de idioma: solo se declaran soporte para en y zh; otros idiomas pueden tener un rendimiento degradado.
- Perdida por cuantizacion: aunque el autor afirma un 99 % de rendimiento respecto a 8-bit, la cuantizacion de 6 bits puede introducir errores en tareas de precision numerica alta o en generacion de codigo con sintaxis compleja.
- Sin soporte de vision en esta version: el pipeline del modelo base es image-text-to-text, pero la cuantizacion MLX no documenta capacidades multimodales; asumir que solo funciona con texto.
- Datos de rendimiento no verificados: los benchmarks de la model card provienen del autor y no han sido replicados por terceros.
- Fecha de creacion futura (septiembre de 2026): el modelo se publico con una fecha posterior a la actual, lo que sugiere que puede tratarse de un experimento o de un error de metadatos; conviene verificar la autenticidad antes de usarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante relacionada (SolsticeAI, Cold-Fusion-GAIN V1.1): https://huggingface.co/SolsticeAI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit
- Runtime Anvil (GitHub): https://github.com/Solstice-Labs/anvil
- Sitio de Solstice-AI: https://solstice-ai.co
- Ficha de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
