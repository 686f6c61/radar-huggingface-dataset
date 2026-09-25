# darrellbest/Qwen3.5-9B-Heretic

## Resumen

Qwen3.5-9B-Heretic es una versión del modelo Qwen/Qwen3.5-9B a la que se le ha eliminado el comportamiento de rechazo mediante Heretic, una herramienta de ablación de pesos, usando la técnica Arbitrary-Rank Ablation (ARA) sobre los pesos completos en bf16. Lo publica el usuario darrellbest el 25 de septiembre de 2026 y conserva exactamente la misma arquitectura, el mismo recuento de parámetros (9.409.813.744), el encoder de visión, el control de modo pensamiento y los pesos de predicción multi-token del modelo original.

El interés de esta ficha no está en una mejora de capacidades, sino en el método: se trata de una ablación de rango arbitrario aplicada sobre `attn.o_proj` y `mlp.down_proj` en las capas 8 a 31, con parámetros de calibración tomados de NullpoLab/Qwen3.5-9B-Heretic-ARA-Refusals5. El resultado declarado es de 5 rechazos sobre 100 en el split `test[:100]` de `mlabonne/harmful_behaviors`, con una divergencia KL de 0.0403 frente a `mlabonne/harmless_alpaca`. Frente a la ablación direccional clásica, ARA busca reducir el rechazo con un desplazamiento menor del comportamiento general.

Es relevante ahora porque documenta un flujo de trabajo reproducible de "abliteración" sobre un modelo híbrido con componentes de atención lineal y pesos de predicción multi-token, un caso donde las herramientas de ablación habituales suelen romper el checkpoint al exportarlo. Esta release restaura los 15 tensores MTP y los 48 parámetros float32 de Gated DeltaNet, de modo que los 775 tensores coinciden en nombre, forma y dtype con el original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y Softmax Attention, con encoder de visión |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio (solo bf16); existen cuantizaciones GGUF de terceros para la familia Qwen3.5-9B, no para este checkpoint |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (bf16); pesos MTP en `model-auxiliary.safetensors` |
| Tensores | 775, coincidentes en nombre, forma y dtype con el modelo original |
| Tamaño del repositorio | 19,3 GB |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |

## Arquitectura y entrenamiento

No hay entrenamiento: es una modificación por ablación de pesos sobre Qwen3.5-9B. El modelo base es un transformer híbrido que combina capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de Softmax Attention, además de un encoder de visión y pesos de predicción multi-token (MTP). La intervención se aplicó en modo full-weight sobre las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 8 a 31, con los parámetros `preserve_good_behavior_weight=0.9665`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=1.1582` y `neighbor_count=15`.

La calibración usó 400 prompts inocuos y 400 dañinos (`train[:400]`). El proceso se ejecutó con una mezcla del `master` de Heretic (scorers y manejo de modelos con modo pensamiento) y su rama `ara`: commits `3521f86` y `c91d690`, transformers 5.17.0, torch 2.11.0+cu130, sobre una RTX PRO 6000. La innovación técnica reseñable es la reparación del checkpoint exportado: `save_pretrained` descarta los 15 tensores MTP de Qwen3.5 y redondea a bf16 los 48 parámetros float32 de Gated DeltaNet (`linear_attn.A_log`, `linear_attn.norm.weight`); ambos se restauraron desde el original (ARA no los toca).

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de Qwen3.5.
- Modo pensamiento (thinking) activado por defecto, desactivable por petición con `enable_thinking=False`.
- Razonamiento aritmético y resolución de problemas verbales: 40/40 resueltos correctamente en la comprobación del autor (4 problemas x 10 semillas, vLLM), igual que el modelo original.
- Visión: el pipeline es image-text-to-text y el encoder visual se conserva intacto; en la prueba del autor describe correctamente una imagen con un círculo rojo y un cuadrado azul.
- Predicción multi-token (MTP), con los pesos auxiliares restaurados y disponibles.
- Comportamiento de rechazo reducido de forma deliberada: 5/100 frentes a 100/100 del original en la medición del autor.
- Tool calling, function calling y uso en agentes: no documentado explícitamente en la información disponible, aunque el modelo base Qwen3.5 los soporta.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: permite medir experimentalmente cuánto se degrada el comportamiento general al eliminar el rechazo, usando la divergencia KL frente a `mlabonne/harmless_alpaca` como métrica de deriva.
- Evaluación comparativa de técnicas de ablación: sirve como referencia ARA frente a ablación direccional y a otros checkpoints de la misma familia, con la misma base y el mismo recuento de parámetros.
- Análisis de robustez de checkpoints híbridos: al conservar los 775 tensores con el mismo dtype y forma que el original, es un caso de prueba para verificar que las herramientas de exportación no rompen capas Gated DeltaNet ni pesos MTP.
- Red teaming y generación de conjuntos de evaluación adversariales: un modelo con menos barreras de rechazo permite generar prompts y respuestas difíciles de obtener de un modelo alineado, siempre dentro de un marco de pruebas controlado.
- Generación de texto creativo sin filtros: escritura de ficción con violencia, contenido adulto o temas sensibles donde un modelo alineado rechazaría la petición.
- Tareas multimodales de descripción y análisis de imágenes: al conservar el encoder visual, puede emplearse en pipelines image-text-to-text con la misma interfaz que el modelo original.
- Sustitución directa en despliegues existentes de Qwen3.5-9B: al ser compatible con transformers, vLLM y SGLang y mantener la misma arquitectura, puede intercambiarse por el original sin cambios de código.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas de ablación, medidas por Heretic sobre el split `test[:100]` de dos conjuntos, con el system prompt y los marcadores de rechazo por defecto de la herramienta.

| Modelo | Rechazos (harmful_behaviors, test[:100]) | Divergencia KL (harmless_alpaca) |
|---|---:|---:|
| Qwen3.5-9B original | 100/100 | 0 (por definición) |
| Este modelo (ARA, parámetros de NullpoLab) | 5/100 | 0,0403 |
| NullpoLab/Qwen3.5-9B-Heretic-ARA-Refusals9 | 8/100 | 0,0432 |
| taresh18 `-ara-multiturn` | 7/100 | 0,0169 |
| trohrbaugh/Qwen3.5-9B-heretic-v2 (ablación direccional) | 6/100 | 0,0793 |
| Kewk/Heretical-Qwen3.5-9B (fork propio de Heretic) | 3/100 | 0,0366 |

Comprobaciones cualitativas del autor: 40/40 problemas aritméticos resueltos en modo pensamiento con el muestreo recomendado por Qwen (idéntico al original), prompts ordinarios correctos y fluidos, y descripción visual correcta. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan aproximadamente 18,8 GB (9,41 mil millones de parámetros a 2 bytes); con caché KV y overhead de runtime se recomienda contar con 24 GB o más. Estimación propia, no publicada por el autor.
- VRAM en 8 bits: en torno a 10-11 GB. En 4 bits: en torno a 5,5-6 GB. Estimaciones propias; el repositorio no publica cuantizaciones.
- GPU profesionales: A100 40 GB, H100 80 GB, RTX PRO 6000 (el autor usó una para el proceso de ablación). Cualquiera de ellas sirve para bf16 sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en bf16 de forma ajustada; para 16 GB o menos es necesario cuantizar.
- Opciones de despliegue: transformers, vLLM y SGLang, según indica el autor. También es compatible con endpoints gestionados (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama haría falta convertir a GGUF, algo que este repositorio no publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos / KL | Técnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| darrellbest/Qwen3.5-9B-Heretic | 9,41 B | No disponible | 5/100 · 0,0403 | ARA full-weight, parámetros de NullpoLab, checkpoint completo reparado | Apache 2.0 | HuggingFace, safetensors bf16 |
| NullpoLab/Qwen3.5-9B-Heretic-ARA-Refusals5 | 9 B | No disponible | 5/100 · 0,0239 (según el autor de ese repositorio) | ARA | Apache 2.0 | HuggingFace |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9 B | No disponible | 6/100 · 0,0793 | Ablación direccional | Apache 2.0 | HuggingFace |
| Kewk/Heretical-Qwen3.5-9B | 9 B | No disponible | 3/100 · 0,0366 | Fork de Heretic con ajuste propio | Apache 2.0 | HuggingFace |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9 B | No disponible | No disponible | Fine-tune y merge multi-etapa, además de ablación | Apache 2.0 (según la familia Qwen) | HuggingFace, incluye GGUF |

La diferencia principal de esta release frente a las demás es la integridad del checkpoint exportado: conserva los tensores MTP y los parámetros float32 de Gated DeltaNet que otras herramientas descartan o redondean. Los valores de rechazo y KL no son directamente comparables entre repositorios, porque cada autor usa su propio fork, prompt de sistema y conjunto de evaluación.

## Limitaciones y advertencias

- Seguridad reducida por diseño. El propio autor advierte de que es responsabilidad del usuario lo que haga con el modelo. No debe desplegarse en aplicaciones de cara al público sin capas adicionales de moderación.
- No se ha realizado un ajuste de alineación posterior a la ablación: los sesgos, la toxicidad y la veracidad del modelo base se conservan sin mitigación y con menos barreras para expresarlos.
- La ablación no es selectiva por tema: la divergencia KL de 0,0403 implica un cambio medible en el comportamiento general, no solo en las respuestas a contenido dañino. Puede haber degradación en tareas benignas no cubiertas por las comprobaciones del autor.
- Riesgo de alucinación: no hay datos publicados de evaluación de veracidad para este checkpoint. Al ser una modificación de pesos, no cabe esperar una mejora respecto al original.
- Longitud de contexto e idiomas soportados: no disponibles en la información proporcionada; se heredan del modelo base, pero no están documentados aquí.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta, y publicación y actualización separadas por 30 segundos. No hay revisión independiente del resultado más allá de la re-evaluación del propio autor.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y de los pesos derivados.
- Uso en producción: la falta de cuantizaciones oficiales y de datos de latencia o throughput obliga a validar el rendimiento en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- NullpoLab/Qwen3.5-9B-Heretic-ARA-Refusals5: https://huggingface.co/NullpoLab/Qwen3.5-9B-Heretic-ARA-Refusals5
- trohrbaugh/Qwen3.5-9B-heretic-v2: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Kewk/Heretical-Qwen3.5-9B: https://huggingface.co/Kewk/Heretical-Qwen3.5-9B
- DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Ficha de DavidAU en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
- Qwen3.5 9b Heretic en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-heretic.html
- DavidAU en Featherless: https://featherless.ai/models/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
