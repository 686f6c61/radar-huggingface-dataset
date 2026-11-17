# intel-ai/GLM-5.2-MXFP4-FP8KV-CT-AutoRound

## Resumen

GLM-5.2-MXFP4-FP8KV-CT-AutoRound es una versión cuantizada del modelo zai-org/GLM-5.2, publicada por intel-ai mediante la herramienta AutoRound (Intel). Se trata de un checkpoint de generación de texto orientado a reducir el coste de memoria e inferencia sin degradar de forma significativa la calidad respecto al modelo original en BF16/FP8. La cuantización aplica MXFP4 (4 bits con escalas de bloque compartidas, formato microscaling) a los expertos enrutados de la arquitectura MoE, mantiene en BF16 el router, los embeddings y la cabeza de salida (lm_head), y aplica FP8 estático a la caché KV.

El modelo base GLM-5.2 pertenece a la familia GLM de Zhipu AI (zai-org), con arquitectura de mezcla de expertos (MoE) y atención dispersa (el tipo de modelo declarado en la librería es `glm_moe_dsa`). El checkpoint cuantizado conserva 18.601.269.660 parámetros totales según los safetensors del repositorio, aunque el tamaño del repo (442,2 GB) refleja que la mayoría de pesos se almacenan en formatos de baja precisión junto con posibles artefactos auxiliares.

Su relevancia práctica es doble: por un lado, permite desplegar un MoE de gran tamaño con menor huella de memoria en GPUs con soporte de MXFP4 y FP8; por otro, sirve como referencia de recuperación de precisión (99,48 % de media en los benchmarks publicados frente a FP8). La licencia es MIT, heredada del modelo original, lo que facilita el uso comercial con las cautelas habituales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención dispersa (`glm_moe_dsa`), cuantización MXFP4 en expertos enrutados, BF16 en router/embeddings/lm_head y FP8 estático en caché KV |
| Parámetros totales | 18.601.269.660 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (expertos), BF16 (router, embeddings, lm_head), FP8 E4M3 (caché KV) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un transformer de mezcla de expertos con atención dispersa (DSA, *dynamic sparse attention* según la nomenclatura del tag `glm_moe_dsa`). La versión publicada por intel-ai no reentrena el modelo: aplica cuantización post-entrenamiento con AutoRound usando RTN (round-to-nearest) sin iteraciones de optimización (`--iters 0`, `--disable_opt_rtn`), con el esquema BF16 como base y MXFP4 únicamente en las capas `mlp.experts`. El router, los embeddings y la cabeza de salida se mantienen en BF16, y la caché KV se fija en FP8 estático (`--static_kv_dtype fp8`). El calibrado se realiza sobre el dataset HuggingFaceH4/ultrachat_200k y el resultado se exporta en formato `llm_compressor` compatible con compressed-tensors.

La innovación técnica principal es la combinación de MXFP4 (formato de 4 bits con escalas de bloque tipo microscaling, adecuado para aceleradores con soporte nativo) con caché KV en FP8, lo que reduce tanto el peso de los expertos como la memoria de contexto durante la inferencia. El paper de referencia de AutoRound (arXiv:2309.05516) describe el método de redondeo de pesos mediante descenso de gradiente con signo; en esta variante concreta se usa RTN, por lo que no hay ajuste fino de los pesos cuantizados más allá del redondeo y las escalas.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`, tag `conversational`).
- Razonamiento multi-paso: la configuración de vLLM incluye `--reasoning-parser glm45`, lo que indica soporte de modo de razonamiento en el modelo base.
- Tool calling / function calling: la guía de despliegue usa `--tool-call-parser glm47` y `--enable-auto-tool-choice`, por lo que el modelo está preparado para invocar herramientas en vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no están declarados en la model card).
- Capacidades de visión o audio: no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers/compressed-tensors.

## Casos de uso

- Despliegue de un MoE de gran tamaño en infraestructura con aceleradores que soporten MXFP4 y FP8: la cuantización reduce la huella de los expertos y permite servir el modelo con menos memoria que la versión BF16, manteniendo una recuperación de precisión del 99,48 % de media según la evaluación publicada.
- Asistentes conversacionales multi-turno: el pipeline `text-generation` y el tag `conversational` lo hacen adecuado para chatbots, con la ventaja de la caché KV en FP8 que reduce el coste de contextos largos (aunque la longitud exacta de contexto no está documentada).
- Agentes con tool calling: la configuración de vLLM con `--tool-call-parser glm47` y `--enable-auto-tool-choice` permite integrarlo en flujos de agentes que llaman a APIs, bases de datos o funciones internas.
- Razonamiento asistido: el parser de razonamiento `glm45` indica que el modelo puede emitir cadenas de pensamiento estructuradas, útil en tareas de análisis, resolución de problemas matemáticos (GSM8K 94,01 en la versión cuantizada) y planificación.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de MXFP4 frente a FP8 en un MoE concreto, con métricas publicadas en GSM8K, MMLU, PIQA y HellaSwag.
- Investigación en compresión de modelos: el checkpoint y el comando de generación documentado permiten reproducir el pipeline de AutoRound con `--layer_config "{mlp.experts:{scheme:MXFP4}}"` y `--static_kv_dtype fp8`, útil para estudiar el impacto de la cuantización selectiva por capas.
- Integración en pipelines de CI/CD para generación de texto y pruebas automatizadas: al ser compatible con transformers y vLLM, puede desplegarse como servicio interno en entornos con GPUs compatibles.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la versión FP8 con la versión MXFP4 + FP8 KV:

| Benchmark | FP8 | MXFP4 + FP8 KV | Recuperación |
|---|---:|---:|---:|
| GSM8K | 94,39 | 94,01 | 99,60 % |
| MMLU | 87,11 | 86,41 | 99,20 % |
| PIQA | 84,49 | 84,87 | 100,45 % |
| HellaSwag | 73,98 | 72,90 | 98,54 % |
| **Media** | **84,99** | **84,55** | **99,48 %** |

No se han publicado en la información disponible resultados frente a modelos comparables de otros autores, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 18.601 millones de parámetros totales y expertos en MXFP4, la huella de pesos ronda teóricamente los 9-10 GB solo para los expertos (4 bits), más router, embeddings y lm_head en BF16, más la caché KV en FP8; el tamaño real del repo (442,2 GB) sugiere que el checkpoint incluye múltiples artefactos o pesos en formatos adicionales, por lo que la VRAM efectiva debe validarse en despliegue.
- GPU recomendadas: no disponibles en la información proporcionada. El uso de MXFP4 y FP8 requiere aceleradores con soporte de estos formatos; conviene consultar la matriz de compatibilidad de vLLM y del hardware objetivo.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño de parámetros y el formato, es plausible en GPUs de gama alta con suficiente VRAM, pero no hay confirmación en la documentación.
- Opciones de despliegue: vLLM (comando documentado con `--kv-cache-dtype fp8_e4m3`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--reasoning-parser glm45`); transformers con compressed-tensors. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.2-MXFP4-FP8KV-CT-AutoRound (este) | 18.601.269.660 | no disponible | MXFP4 + FP8 KV | MIT | Hugging Face (intel-ai) |
| zai-org/GLM-5.2 (base) | no disponible en esta ficha | no disponible | BF16/FP8 (referencia de evaluación) | MIT | Hugging Face (zai-org) |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo puede generar contenido factualmente incorrecto; no debe usarse como fuente de información veraz sin verificación.
- Riesgo de sesgos y contenido ofensivo heredado del modelo base y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantización MXFP4 introduce una pérdida de precisión medible (recuperación media del 99,48 % en los benchmarks publicados, con caída máxima observada en HellaSwag, 98,54 %).
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe uniforme.
- Longitud de contexto no documentada: no se puede planificar el uso en escenarios de contexto largo sin validación previa.
- Requisitos de hardware específicos para MXFP4 y FP8: el despliegue puede fallar en aceleradores sin soporte nativo de estos formatos.
- Licencia MIT heredada del modelo original; el aviso de la model card indica que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de un uso comercial.
- El checkpoint se generó con RTN sin iteraciones de optimización, por lo que no incorpora el ajuste fino de pesos que ofrece AutoRound en su modo completo.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/GLM-5.2-MXFP4-FP8KV-CT-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- AutoRound (GitHub): https://github.com/intel/auto-round
- Paper AutoRound (arXiv): https://arxiv.org/abs/2309.05516
- Intel Neural Compressor: https://github.com/intel/neural-compressor
