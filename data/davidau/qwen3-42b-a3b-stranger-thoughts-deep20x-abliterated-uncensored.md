# DavidAU/Qwen3-42B-A3B-Stranger-Thoughts-Deep20x-Abliterated-Uncensored

## Resumen

Qwen3-42B-A3B-Stranger-Thoughts-Deep20x-Abliterated-Uncensored es un ajuste fino (finetune) de tipo comunitario creado por DavidAU sobre `huihui-ai/Qwen3-30B-A3B-abliterated`, que a su vez deriva del Qwen3-30B-A3B de Alibaba. El autor ha aplicado una técnica propia de fusión/expansión ("Brainstorm 20x") que eleva el número de parámetros totales de 30B a aproximadamente 42,37B manteniendo la arquitectura MoE de Qwen3 con 128 expertos y 8 activos por token. El objetivo declarado es llevar el modelo abliterado a su "límite absoluto" para escritura creativa sin restricciones: prosa vívida, ficción, terror, romance y roleplay, con el filtrado de rechazo eliminado.

La relevancia del modelo es de nicho: no compite en benchmarks de razonamiento o código, sino que se posiciona como una herramienta especializada para generación literaria sin censura y roleplay. Conserva las capacidades de razonamiento y el modo "thinking" de la familia Qwen3, pero el autor advierte explícitamente que no se ha probado en casos de uso no creativos. La licencia es Apache 2.0, lo que permite uso comercial, aunque el contenido que genera puede ser sensible (NSFW, violencia, gore).

El modelo se distribuye en safetensors de precisión completa (bfloat16) para permitir la generación de cuantizaciones GGUF, GPTQ, EXL2, AWQ o HQQ, y existen cuantizaciones GGUF publicadas por Mradermacher. La longitud de contexto por defecto es de 40K tokens, con plantilla ChatML o Jinja embebida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 128 expertos, 8 activos por token |
| Parámetros totales | 42.371.414.784 (~42,37B) |
| Parámetros activos | 8 de 128 expertos activos (el número exacto de parámetros activos no está disponible en la información proporcionada) |
| Longitud de contexto | 40K tokens (configuración por defecto de Qwen) |
| Tipos de cuantización | Safetensors bf16 como fuente; GGUF publicados por Mradermacher; el autor indica que la fuente sirve para generar GGUF, GPTQ, EXL2, AWQ y HQQ |
| Idiomas soportados | en, fr, zh, de (la model card lista además ar en los tags de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF disponible vía Mradermacher |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B, un transformer de mezcla de expertos (MoE) con 128 expertos y 8 activos por token. Sobre esa base, huihui-ai aplicó una técnica de "abliteration" que elimina o atenúa la dirección de rechazo en el espacio de activaciones, dando lugar a `Qwen3-30B-A3B-abliterated`. Posteriormente, DavidAU aplicó su procedimiento "Brainstorm 20x", que combina el modelo consigo mismo en una estructura MoE ampliada, incrementando los parámetros totales hasta los ~42,37B. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles.

La innovación principal es la expansión de parámetros manteniendo el mismo número de expertos activos (8 de 128), lo que en teoría conserva el coste de inferencia de un modelo de ~3B activos mientras aumenta la capacidad total. El autor señala que la prosa, el razonamiento y el modo thinking "serán muy diferentes" de los Qwen3 estándar, y que regeneraciones del mismo prompt con los mismos ajustes producen salidas muy distintas. Se conserva el modo de razonamiento (thinking) y la generación de salida de un MoE de Qwen3, pero no se ha validado para usos no creativos.

## Capacidades

- Generación de texto creativo en todos los géneros: ficción, ciencia ficción, romance, terror, erótica y roleplay, con prosa vívida y detallada.
- Generación de tramas y subtramas, continuación de escenas y construcción de historias largas.
- Modo "thinking" y razonamiento heredado de Qwen3 (el autor indica que conserva el razonamiento completo del MoE base).
- Conversación multi-turno con plantilla ChatML o Jinja embebida.
- Capacidades multilingües limitadas a los idiomas listados (en, fr, zh, de; ar aparece en los tags).
- Modelo abliterado/uncensored: no aplica rechazo a contenido sensible.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Escritura de ficción profesional sin restricciones: el modelo genera escenas de 1000+ palabras con detalle sensorial y visceral, útil para autores de terror, thriller o erótica que necesitan borradores sin filtros de contenido.
- Roleplay narrativo avanzado: con 40K de contexto y plantilla ChatML, puede mantener personajes y arcos narrativos a lo largo de sesiones largas, aunque el autor advierte que las regeneraciones varían mucho.
- Generación de tramas y subtramas para guiones o novelas: el modelo está etiquetado específicamente para plot y sub-plot generation, lo que permite usarlo como asistente de estructura narrativa.
- Continuación de escenas en proyectos literarios colaborativos: dado su contexto de 40K, puede absorber capítulos previos y continuar con coherencia estilística.
- Prototipado de contenido para videojuegos narrativos: diálogos de personajes y descripciones de escenarios en géneros como terror o ciencia ficción, con la salvedad de que requiere revisión humana por contenido sensible.
- Investigación sobre alineación y abliteration: como caso de estudio de un modelo deliberadamente desalineado en contenido, útil para estudiar comportamientos de modelos sin rechazo y sus riesgos.
- Generación de material de marketing creativo o guiones publicitarios en tono intenso: solo si el contenido sensible es aceptable para el canal final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 85 GB solo para pesos (42,37B × 2 bytes), más overhead de contexto y KV cache; requiere GPUs de 80 GB o múltiples GPUs.
- Cuantización Q8: ~45 GB; Q4: ~24 GB; Q3: ~18 GB (estimaciones a partir del tamaño de parámetros; el autor probó el quant Q3KS en LMStudio sobre CPU).
- GPU recomendadas: A100 80GB o H100 80GB para bf16; para cuantizaciones Q4/Q5, una RTX 4090 (24 GB) puede ser insuficiente en Q4 con contexto largo y suficiente en Q3 con contexto moderado.
- Cabe en GPU de consumo: sí, en cuantizaciones Q3/Q4 con contexto reducido, en tarjetas de 24 GB como la RTX 4090; el autor ejecutó Q3KS en CPU.
- Opciones de despliegue: transformers (librería indicada), llama.cpp/Ollama/LM Studio vía GGUF de Mradermacher, y potencialmente vLLM o TGI si se generan pesos compatibles, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; al ser un MoE con 8 expertos activos, el coste por token se aproxima al de un modelo de ~3B activos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-42B-A3B-Stranger-Thoughts-Deep20x-Abliterated-Uncensored | 42,37B totales, 8/128 expertos activos | 40K | Apache 2.0 | Ficción creativa sin censura, abliterado |
| Qwen3-30B-A3B (base) | 30B totales, 8/128 expertos activos | 40K (config. por defecto) | Apache 2.0 | Propósito general, alineado |
| huihui-ai/Qwen3-30B-A3B-abliterated | 30B totales, 8/128 expertos activos | 40K | Apache 2.0 | Propósito general abliterado |
| Qwen3-18B-A3B-Stranger-Thoughts-Abliterated-Uncensored (DavidAU) | ~18B totales | No disponible | Apache 2.0 | Ficción creativa sin censura, versión menor de la misma familia |

La comparativa se limita a la familia Qwen3 porque no se dispone de datos de benchmarks ni de modelos alternativos equivalentes en la información proporcionada. El modelo se diferencia de sus bases por el aumento de parámetros (42B frente a 30B) y por el ajuste específico para prosa creativa intensa.

## Limitaciones y advertencias

- Contenido NSFW: el modelo genera violencia explícita, gore, terror, erótica y lenguaje soez sin filtros; no es apto para todos los públicos ni para productos dirigidos a menores.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; el autor no lo recomienda para usos no creativos.
- Problemas de formato conocidos: el autor reporta mayúsculas incorrectas ocasionales y espacios extra antes de palabras.
- Sensibilidad a la plantilla y a los ajustes: una plantilla o configuración incorrecta degrada notablemente el rendimiento; el autor remite a una guía de uso específica con ajustes de rep pen, temperatura, top-k, top-p y min-p.
- Variabilidad alta: regeneraciones del mismo prompt con los mismos parámetros producen salidas muy distintas, lo que dificulta la reproducibilidad.
- Idiomas limitados: solo en, fr, zh y de de forma declarada; no hay soporte documentado de español.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas locales; la responsabilidad recae en el implementador.
- No se documenta soporte de tool calling, agentes, visión ni audio, por lo que no es adecuado para pipelines de automatización que requieran esas capacidades.
- El proceso de abliteration puede degradar capacidades de razonamiento o seguridad en comparación con el Qwen3 original; no hay benchmarks que lo cuantifiquen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-42B-A3B-Stranger-Thoughts-Deep20x-Abliterated-Uncensored
- Cuantizaciones GGUF de Mradermacher: https://huggingface.co/mradermacher/Qwen3-42B-A3B-Stranger-Thoughts-Deep20x-Abliterated-Uncensored-GGUF
- Guía de uso del autor (modelo hermano 18B): https://huggingface.co/DavidAU/Qwen3-18B-A3B-Stranger-Thoughts-Abliterated-Uncensored-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Qwen3-30B-A3B-abliterated
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
