# Johnblick187/Qwen3-Omni-Coder

## Resumen

Qwen3-Omni-Coder es un modelo resultante de la fusión (merge) de dos modelos derivados de la familia Qwen3: `huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated` y `huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated`. Lo publica el usuario Johnblick187 en Hugging Face y combina las capacidades multimodales (pipeline any-to-any) del modelo Omni con la especialización en código del modelo Coder, ambos previamente sometidos a un proceso de "abliteration" que elimina los mecanismos de rechazo y moderación del modelo original.

Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con aproximadamente 35.260 millones de parámetros totales, del cual solo una fracción se activa por token (el sufijo A3B de los modelos base indica unos 3.000 millones de parámetros activos). Hereda el contexto extendido y el soporte multilingüe de la familia Qwen3, aunque la model card solo declara inglés como idioma soportado.

Su relevancia es doble: por un lado, explora la combinación de razonamiento de código con entrada/salida multimodal en un único checkpoint; por otro, al estar "abliterado" y sin censura, resulta de interés para investigadores que estudian el comportamiento de modelos sin alineación, aunque plantea riesgos evidentes para uso en producción. La información técnica publicada por el autor es mínima (una sola frase descriptiva), por lo que muchos detalles deben inferirse de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3MoE (qwen3_omni_moe) |
| Parametros totales | 35.259.818.545 (~35,26 mil millones) |
| Parametros activos | ~3 mil millones (inferido del sufijo A3B de los modelos base) |
| Longitud de contexto | no disponible en la model card (los modelos base Qwen3 soportan contexto largo; valor exacto no confirmado para este merge) |
| Tipos de cuantizacion | safetensors (precisión original) y GGUF (según tags del repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Pipeline | any-to-any (multimodal entrada/salida) |
| Tamano del repositorio | 182,7 GB |
| Modelos base | Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated y Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated |
| Descargas / likes | 235 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Combina dos checkpoints MoE de la familia Qwen3 de aproximadamente 30.000 millones de parámetros totales y ~3.000 millones activos por token: una variante Omni (multimodal, any-to-any) y una variante Coder (especializada en generación de código), ambas ya modificadas por huihui-ai mediante abliteration, una técnica que identifica y suprime las direcciones de activación asociadas al rechazo de peticiones para producir modelos "uncensored".

No se dispone de información sobre la metodología exacta del merge (por ejemplo, si se usó un merge lineal, SLERP, TIES o DARE), ni sobre la proporción de pesos de cada modelo base, ni sobre si hubo un paso posterior de fine-tuning. Tampoco se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF o DPO específicas para este merge; esas características se heredan de los modelos Qwen3 originales, cuyos detalles no se reproducen en la model card. La innovación principal es, por tanto, la combinación de dos especializaciones (código y multimodalidad) en un único checkpoint MoE con licencia permisiva.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.
- Generación y razonamiento sobre código, por la fusión con la variante Coder.
- Procesamiento any-to-any: al derivar de un modelo Omni, se espera soporte de entrada multimodal (texto, imagen y posiblemente audio) y salida multimodal; la model card no detalla qué modalidades exactas conserva el merge.
- Comportamiento "abliterado" y sin censura: el modelo no aplica los rechazos típicos de los modelos alineados.
- Soporte multilingüe limitado según la model card al inglés, aunque los modelos Qwen3 base son multilingües; el grado de conservación de otros idiomas tras el merge no está documentado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue mediante la infraestructura de Hugging Face.
- Soporte de tool calling y razonamiento multi-paso: no confirmado explícitamente para este merge, aunque es esperable por herencia de Qwen3; no disponible como dato verificado.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un MoE multimodal sin mecanismos de rechazo, comparando sus respuestas con las de los modelos Qwen3 alineados en tareas sensibles.
- Generación de código en entornos controlados: la fusión con la variante Coder permite usarlo como asistente de programación en pipelines internos donde la ausencia de filtros de contenido sea aceptable y se auditen las salidas.
- Prototipado de aplicaciones any-to-any: sirve para experimentar con flujos que combinan texto e imagen en un solo modelo MoE de ~35.000 millones de parámetros totales, con un coste de cómputo por token reducido gracias a la activación de ~3.000 millones de parámetros.
- Evaluación comparativa de merges: útil para investigadores que analizan cómo afecta la fusión de pesos a las capacidades de código y multimodalidad frente a cada modelo base por separado.
- Despliegue local con cuantización GGUF: el repositorio incluye pesos GGUF, lo que permite ejecutar el modelo en estaciones de trabajo con llama.cpp u Ollama para pruebas offline sin depender de servicios externos.
- Análisis de sesgos y contenido dañino: al no aplicar rechazos, puede emplearse (con las debidas salvaguardas) para generar corpus de prueba que ayuden a entrenar clasificadores de contenido o filtros de seguridad.
- Experimentación con agentes autónomos: en entornos de laboratorio, su combinación de código y multimodalidad puede servir para prototipos de agentes que interpretan capturas de pantalla y generan acciones, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor se limita a una frase descriptiva y no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión BF16/FP16: aproximadamente 70 GB solo para los pesos (35,26 mil millones de parámetros × 2 bytes), más overhead de KV cache y activaciones; se recomienda un mínimo de 80 GB.
- Cuantización GGUF de 8 bits: en torno a 35-40 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización GGUF de 4 bits: aproximadamente 18-22 GB, lo que permite ejecución en una única RTX 4090 (24 GB) o RTX 3090 con margen ajustado.
- GPU recomendadas: H100 80 GB o A100 80 GB para precisión completa; A100 40 GB o dos RTX 4090 para 8 bits; RTX 4090, RTX 3090 o RTX 5090 para 4 bits.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM o TGI para safetensors si la arquitectura MoE multimodal está soportada por dichos frameworks (no confirmado para este merge concreto); endpoints de Hugging Face por el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3.000 millones de parámetros activos, el coste por token debería ser inferior al de un modelo denso de 35.000 millones, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Omni-Coder (este modelo) | ~35,26 B / ~3 B | no disponible | Sí (any-to-any) | Apache 2.0 | Merge abliterado, sin benchmarks publicados |
| Qwen3-Coder-30B-A3B-Instruct | ~30 B / ~3 B | contexto largo (familia Qwen3) | No | Apache 2.0 | Modelo oficial de código, alineado |
| Qwen3-Omni-30B-A3B-Instruct | ~30 B / ~3 B | contexto largo (familia Qwen3) | Sí | Apache 2.0 | Modelo oficial multimodal, alineado |
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated | ~30 B / ~3 B | contexto largo (familia Qwen3) | No | Apache 2.0 | Base directa, sin fusión multimodal |

La comparación con los modelos oficiales de Qwen3 es la más relevante: este merge añade multimodalidad al Coder y elimina la alineación, pero carece de evaluaciones que demuestren que conserva el rendimiento de ninguno de los dos modelos base.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay evidencia publicada de que el merge preserve las capacidades de código o multimodalidad de los modelos base; los merges de pesos pueden degradar el rendimiento de forma impredecible.
- Modelo abliterado y sin censura: no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: sin datos de evaluación, no puede descartarse que la fusión haya degradado la fiabilidad factual.
- Idiomas: la model card solo declara inglés; el soporte de otros idiomas tras el merge no está verificado.
- Contexto: la longitud exacta de contexto no está documentada para este merge; no debe asumirse la de los modelos base sin comprobación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre las salidas del modelo, incluida la generación de contenido no filtrado.
- Trazabilidad limitada: el autor no documenta la receta del merge, lo que dificulta reproducir el modelo o auditar su comportamiento.
- Compatibilidad de despliegue: el soporte de la arquitectura qwen3_omni_moe en frameworks de inferencia de alto rendimiento (vLLM, TGI) no está confirmado para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johnblick187/Qwen3-Omni-Coder
- Modelo base Omni abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated
- Modelo base Coder abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
