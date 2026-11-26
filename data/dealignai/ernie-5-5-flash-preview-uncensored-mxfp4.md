# dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4

## Resumen

ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4 es una modificación a nivel de pesos del modelo Baidu ERNIE-5.5-Flash-Preview, publicada por dealignai. El modelo base es un transformer MoE híbrido de 43 capas con 512 expertos enrutados (10 activos por token más un experto compartido) y un total de 299.559.241.286 parámetros. La modificación consiste en una edición directa de pesos (sin fine-tuning, SFT, DPO, LoRA ni datos sintéticos) orientada a eliminar el alineamiento de seguridad del modelo original, junto con una cuantización MXFP4 para los expertos enrutados y FP8 para atención y expertos compartidos.

El modelo resuelve el problema de disponer de un LLM de gran escala con razonamiento configurable (off/low/medium/high), tool calling y decodificación especulativa DSpark, pero sin las restricciones de rechazo o censura del modelo base. Es relevante para desarrolladores e investigadores que necesitan evaluar comportamiento de modelos sin alineamiento, estudiar el efecto de ediciones a nivel de pesos o desplegar un MoE de ~300B parámetros con cuantización de 4 bits en infraestructura de inferencia estándar (vLLM).

El repositorio ocupa 198,3 GB y se distribuye en formato safetensors, pensado para cargarse con vLLM y el plugin vLLM-ERNIE. La licencia es dealignai-community-v0.3, distinta de la del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ernie5_5_MoeForCausalLM, transformer MoE híbrido de 43 capas, 512 expertos enrutados, 10 activos por token + experto compartido |
| Parametros totales | 299.559.241.286 |
| Parametros activos | no disponible (la model card indica 10 expertos activos por token más uno compartido, sin cifra total de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en expertos enrutados, FP8 en atención y expertos compartidos; etiquetado como 8-bit en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | dealignai-community-v0.3 (license: other) |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: un MoE híbrido de 43 capas con 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido. La modificación de dealignai no altera el entrenamiento ni añade datos: no hay SFT, DPO, LoRA ni datos sintéticos. Se trata de una edición directa de pesos sobre el modelo de Baidu. La cuantización aplicada es MXFP4 en los expertos enrutados (indicada como byte a byte idéntica al base en ese componente) y FP8 en atención y expertos compartidos.

Se conservan dos componentes técnicos del modelo original: los pesos borrador de decodificación especulativa DSpark, que según la model card permanecen intactos y byte a byte idénticos al base, y el soporte de tool calling mediante los parsers de vLLM (`--tool-call-parser ernie5 --enable-auto-tool-choice`). El razonamiento es configurable en cuatro modos (off, low, medium, high) mediante `--reasoning-parser ernie5`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineamiento (RLHF/DPO) empleadas en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo configurable: off, low, medium y high.
- Razonamiento multi-paso en modo high, con soporte de cadenas de pensamiento largas (se observaron completaciones de hasta 8.192 tokens en la evaluación publicada).
- Tool calling / function calling conservado y funcional mediante parsers de vLLM.
- Decodificación especulativa DSpark incluida, con pesos borrador empaquetados.
- Comportamiento sin alineamiento de seguridad (uncensored/abliterated), orientado a eliminar rechazos del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; el modelo base se describe como text-only.

## Casos de uso

- Investigación sobre edición de pesos y desalineamiento: el modelo permite estudiar cómo una modificación directa de pesos afecta a las capacidades cognitivas (MMLU) y al comportamiento de rechazo, con comparaciones pareadas frente al base incluidas en el repositorio.
- Evaluación de robustez y seguridad de LLMs: útil para construir conjuntos de pruebas que midan la eficacia de mecanismos de alineamiento y las diferencias entre modelos censurados y no censurados.
- Despliegue de un MoE de ~300B parámetros en infraestructura multi-GPU: la cuantización MXFP4/FP8 reduce el peso a 198,3 GB, lo que permite servirlo con vLLM en nodos con varias GPU de 80 GB.
- Generación de texto a gran escala sin restricciones de contenido: para entornos de investigación creativa o generación de datos donde los rechazos del modelo base son un obstáculo, siempre que la licencia lo permita.
- Agentes con tool calling: el parser ernie5 y la auto-selección de herramientas de vLLM permiten construir agentes que invocan funciones externas en flujos multi-paso.
- Razonamiento con presupuesto de cómputo ajustable: los modos off/low/medium/high permiten equilibrar latencia y profundidad de razonamiento según la carga, por ejemplo en pipelines de clasificación o QA.
- Serving con decodificación especulativa: DSpark permite aumentar el throughput en despliegues de producción con vLLM, reduciendo la latencia por token frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

La model card publica comparaciones pareadas de MMLU entre el modelo base y esta versión. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

| Evaluacion | Base | Este modelo | Delta |
|---|---:|---:|---:|
| MMLU-500 (modo off, scoring por logits de un token) | 437/500 (87,4%) | 429/500 (85,8%) | −1,6 pp |
| MMLU-200 (modo high, scoring de respuesta final) | 185/200 (92,5%) | 185/200 (92,5%) | 0,0 pp |

Desglose por grupo en MMLU-500 (off): STEM 152/171 (88,9%) en ambos; Social Sciences 99/103 (96,1%) base frente a 98/103 (95,1%); Other 94/113 (83,2%) frente a 92/113 (81,4%); Humanities 92/113 (81,4%) frente a 87/113 (77,0%). En MMLU-200 (high): STEM 65/67 (97,0%) en ambos; Social Sciences 46/47 (97,9%) en ambos; Other 32/39 (82,1%) frente a 33/39 (84,6%); Humanities 42/47 (89,4%) frente a 41/47 (87,2%). En el modo high, dos ítems de Humanidades alcanzaron el límite de 8.192 tokens sin respuesta final y se contaron como incorrectos.

## Requisitos de hardware

- Tamaño del repositorio: 198,3 GB, lo que exige almacenamiento NVMe o un sistema de ficheros compartido de alta capacidad.
- VRAM estimada para inferencia: al menos ~200 GB en pesos, más overhead de KV cache y activaciones; se recomienda un nodo con 4 GPU de 80 GB (A100/H100) como mínimo, y más margen para contextos largos.
- GPU recomendadas: H100 80 GB, H200, A100 80 GB en configuraciones multi-GPU con tensor parallelism; no se recomienda para GPU de consumo.
- No cabe en GPU consumer (RTX 4090 de 24 GB, etc.) por el tamaño del modelo incluso en cuantización de 4 bits.
- Opciones de despliegue: vLLM con el plugin vLLM-ERNIE y los parsers `ernie5` para razonamiento y tool calling; llama.cpp, Ollama y TGI no están indicados en la información disponible para este formato.
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4 | 299,6B totales (MoE, 10 activos/token) | no disponible | dealignai-community-v0.3 | Hugging Face, formato safetensors/vLLM |
| baidu/ERNIE-5.5-Flash-Preview (base) | 299,6B totales (MoE) | no disponible | no disponible en la información | Hugging Face |
| Otros MoE de escala similar (p. ej. DeepSeek, Qwen) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación directa más fiable es con el propio modelo base, para el que se documenta una caída de 1,6 pp en MMLU-500 (off) y paridad en MMLU-200 (high).

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la edición de pesos elimina los mecanismos de rechazo del base, por lo que puede generar contenido dañino, ilegal o sesgado. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Licencia dealignai-community-v0.3, distinta de la del modelo base; es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, que puede estar restringido.
- La model card solicita atribución a DealignAI y enlace al repositorio al usar, cuantizar o alojar el modelo.
- Riesgo de alucinación inherente al modelo base, no mitigado por la edición de pesos; en modo high se observaron casos que agotan el límite de tokens sin emitir respuesta final.
- Idiomas soportados y longitud de contexto no documentados en la información disponible; no se puede garantizar un comportamiento multilingüe adecuado.
- El rendimiento en tareas distintas de MMLU (código, matemáticas, tool calling en producción) no está validado en la información proporcionada.
- Requiere el plugin vLLM-ERNIE y parsers específicos; no es un modelo plug-and-play en otros runtimes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Licencia: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-MXFP4/blob/main/LICENSE
- Perfil del autor en X: https://x.com/dealignai
- Resultados MMLU por materia (off): mmlu500-logit-topics.csv (en el repositorio)
- Resultados MMLU por materia (high): mmlu200-high-topics.csv (en el repositorio)
