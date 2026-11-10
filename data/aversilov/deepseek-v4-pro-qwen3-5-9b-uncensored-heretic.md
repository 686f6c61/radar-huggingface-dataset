# aversilov/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo "abliterated" sobre el modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es aversilov, que aplica la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una ablación de rango arbitrario (ARA) sobre las capas 9 a 24.

El modelo conserva el foco del original en razonamiento matemático y STEM (aproximadamente 250.000 muestras de entrenamiento supervisado centradas en matemáticas y ciencia), pero modifica el comportamiento de alineación: según la model card, los rechazos caen de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al original. Es relevante para quienes necesitan un modelo de 9B con razonamiento estructurado y sin filtros de rechazo, aunque con las advertencias de seguridad que ello implica.

El modelo tiene 9.409.813.744 parámetros reales (según safetensors), se distribuye en formato safetensors con licencia Apache 2.0, soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y está etiquetado como image-text-to-text y text-generation, además de incluir soporte declarado para tool calling y function calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; tag `qwen3_5`), con soporte MTP (multi-token prediction) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se menciona evaluación con NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 18,8 GB |

## Arquitectura y entrenamiento

El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B es un fine-tune de Qwen3.5-9B entrenado por destilación a partir de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento supervisado (SFT) se centró en aproximadamente 250.000 muestras de matemáticas y STEM, e incorpora etapas de RL (etiquetas `sft`, `rl`, `gspo`) y soporte de MTP (multi-token prediction). La model card indica que, pese a no incluir datos específicos de código en el SFT, se observan pequeñas ganancias en programación y uso de herramientas por transferencia entre dominios.

Sobre esta base, la variante aquí descrita aplica Heretic v2.0.0.dev0 con ablación de rango arbitrario (ARA) entre las capas 9 y 24, con los parámetros `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. El objetivo es eliminar los rechazos preservando el comportamiento útil; la model card reporta 3/100 rechazos frente a 100/100 del original y una divergencia KL de 0,0422.

## Capacidades

- Generación de texto y razonamiento estructurado multi-paso, con descomposición explícita de problemas.
- Razonamiento matemático y STEM reforzado por destilación (aproximadamente 250.000 muestras).
- Generación de código y transferencia parcial a programación pese a la ausencia de SFT específico de código.
- Tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Modo de razonamiento (etiqueta `reasoning`).
- Capacidades multimodales declaradas (pipeline `image-text-to-text`), aunque la model card no detalla el soporte visual.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Comportamiento "uncensored"/"abliterated": reducción drástica de rechazos según la model card.
- Soporte de MTP (multi-token prediction) para decodificación acelerada.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está destilado específicamente sobre unas 250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automática, verificación de derivaciones y generación de ejercicios con solución paso a paso.
- Asistente de razonamiento en investigación: para descomponer problemas complejos en subproblemas y generar cadenas de razonamiento estructuradas en dominios científicos.
- Automatización de pipelines con tool calling: al declarar soporte de function calling, puede integrarse en flujos que requieran invocar APIs o funciones externas desde el propio modelo.
- Generación y revisión de código en entornos controlados: aunque no recibió SFT específico de código, la transferencia entre dominios permite usarlo como apoyo en tareas de programación, siempre con validación humana.
- Despliegue en local con cuantización: su tamaño de 9B y los formatos evaluados (NVFP4 en vLLM, MTP-Q8_0 en llama.cpp) permiten ejecución en infraestructura moderada para prototipos y entornos de desarrollo.
- Aplicaciones multilingües en seis idiomas: atención o generación de contenido en inglés, chino, coreano, japonés, español y ruso sin cambiar de modelo.
- Experimentación en investigación sobre alineación y ablación: la variante heretic permite estudiar el efecto de la eliminación de rechazos sobre el comportamiento del modelo (con las cautelas éticas correspondientes).

## Benchmarks y rendimiento

La model card solo reporta métricas comparativas del proceso de ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros, en FP16 requiere aproximadamente 18-19 GB de VRAM solo para pesos, más overhead de contexto y KV cache.
- En cuantización de 8 bits, el peso ronda los 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G, L4 con cuantización) y en A100/H100 para FP16 con contexto amplio.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización, y en GPUs de 16 GB solo con cuantizaciones agresivas (no confirmado).
- Opciones de despliegue: se mencionan vLLM (NVFP4) y llama.cpp (MTP-Q8_0); también es compatible con transformers y text-generation-inference según las etiquetas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | no disponible | Apache 2.0 | Variante abliterated, foco math/STEM, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B (mismo origen) | no disponible | Apache 2.0 | Modelo original alineado, 100/100 rechazos |
| Qwen3.5-9B (familia base) | ~9B | no disponible | no disponible en esta ficha | Modelo base de la familia; sin datos de rendimiento aquí |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la eliminación de rechazos implica que puede generar contenido dañino, ilegal o inseguro; no es apto para producción orientada al público sin filtros externos.
- La ablación introduce una divergencia KL de 0,0422 respecto al original, lo que puede degradar ligeramente capacidades no relacionadas con el razonamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, especialmente en matemáticas y STEM, puede producir derivaciones plausibles pero incorrectas; requiere verificación.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Idiomas: solo se declaran seis idiomas; el rendimiento fuera de ellos no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- El pipeline declarado es `image-text-to-text`, pero la model card no detalla capacidades de visión; conviene validarlas antes de usarlas en producción.
- Modelo con pocas descargas (325) y sin likes: ecosistema de validación muy limitado; no hay evidencia comunitaria de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/aversilov/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic (herramienta de ablación): https://heretic-project.org
