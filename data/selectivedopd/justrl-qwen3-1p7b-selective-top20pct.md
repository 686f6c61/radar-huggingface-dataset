# SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top20pct

## Resumen

JustRL-Qwen3-1p7b-Selective-Top20pct es un checkpoint de ajuste publicado por el usuario SelectiveDOPD en HuggingFace. Según su model card, se ha subido desde el experimento interno `justrl_qwen3_1p7b_js_ladder_80_100_kl`, dentro de los experimentos denominados "BiDirect-OPD". El repositorio contiene 2.031.739.904 parámetros en formato safetensors y ocupa 44,7 GB, un tamaño que se explica porque la rama `main` corresponde al `global_step_300` y se conservan otras catorce revisiones intermedias (de `global_step_20` a `global_step_280`, en pasos de 20).

El nombre del repositorio y la etiqueta `qwen3` apuntan a que se trata de un ajuste sobre Qwen3-1.7B, y el recuento de parámetros coincide exactamente con el de ese modelo base, pero la model card no confirma explícitamente ni la arquitectura, ni la longitud de contexto, ni los idiomas, ni la licencia. Tampoco se documentan los datos de entrenamiento, la composición del dataset ni los resultados de evaluaciones.

Su relevancia es, por tanto, la de un artefacto de investigación: interesa a quien quiera reproducir o auditar una escalera de checkpoints de aprendizaje por refuerzo sobre un modelo de 2.000 millones de parámetros, no a quien busque un modelo listo para producción. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, no existe validación comunitaria independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El nombre y la etiqueta `qwen3` sugieren un transformer denso derivado de Qwen3-1.7B; sin confirmar por el autor |
| Parámetros totales | 2.031.739.904 (dato real de los safetensors) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se distribuyen cuantizaciones. Solo safetensors en el repositorio; la cuantización posterior (GGUF, AWQ, GPTQ) sería responsabilidad del usuario |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no incluye campo de licencia) |
| Formato de pesos | Safetensors, cargable con la librería `transformers` |
| Revisiones disponibles | `main` = `global_step_300`, más `global_step_20`, `40`, `60`, `80`, `100`, `120`, `140`, `160`, `180`, `200`, `220`, `240`, `260`, `280` |
| Tamaño del repositorio | 44,7 GB |
| Pipeline declarado | `text-generation` |
| Fecha de creación / actualización | 2026-09-11 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay información técnica publicada sobre la arquitectura en la model card. Lo único verificable es el recuento de parámetros (2.031.739.904), coherente con Qwen3-1.7B, y la etiqueta `qwen3` del repositorio. Si se confirmase esa base, se trataría de un transformer denso con atención por grupos de consultas y ventana de contexto nativa de 32.768 tokens ampliable mediante YaRN, pero esto es una inferencia a partir del nombre del modelo y no un dato aportado por el autor.

Respecto al entrenamiento, la model card solo indica el origen: el experimento `justrl_qwen3_1p7b_js_ladder_80_100_kl`, dentro de la serie "BiDirect-OPD". La nomenclatura (`JustRL`, `Selective-Top20pct`, `js_ladder_80_100_kl`) sugiere un procedimiento de aprendizaje por refuerzo con una selección parcial —del orden del 20 % superior— de muestras o tokens, y una programación escalonada con control de divergencia KL, pero el autor no documenta nada de esto: no se indican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El único detalle operativo confirmado es la existencia de una escalera de quince checkpoints intermedios, lo que permite estudiar la evolución del modelo durante el entrenamiento.

## Capacidades

- Generación de texto conversacional: el repositorio declara las etiquetas `text-generation` y `conversational`, y el pipeline asociado es `text-generation`.
- Plantilla de chat: al derivar presumiblemente de Qwen3, cabría esperar el formato de chat propio de esa familia, pero el autor no lo especifica.
- Razonamiento y matemáticas: no hay ninguna evaluación publicada para este checkpoint que permita confirmar la conservación de estas capacidades tras el ajuste por refuerzo.
- Generación de código: no verificada en este checkpoint.
- Capacidades multilingües: no disponibles. La model card no declara idiomas.
- Tool calling / function calling: no documentado.
- Comportamiento agéntico o razonamiento multi-paso: no documentado.
- Modo de pensamiento explícito (`thinking`): no documentado; se desconoce si el ajuste lo conserva.
- Visión o audio: no soportado según las etiquetas del repositorio (solo texto).

## Casos de uso

- Investigación en aprendizaje por refuerzo: la escalera de quince checkpoints (`global_step_20` a `global_step_300`) permite trazar curvas de evolución de la política, medir divergencia respecto al modelo base y estudiar fenómenos de olvido catastrófico a lo largo del entrenamiento.
- Reproducción de experimentos de alineación: al estar etiquetado como parte de "BiDirect-OPD", sirve como punto de partida para replicar o refutar la metodología descrita en el nombre del run, comparando el paso 300 con los intermedios bajo la misma batería de evaluaciones.
- Generación de datos sintéticos a pequeña escala: con 2.031 millones de parámetros y un coste de inferencia bajo, puede emplearse para producir borradores de texto o pares pregunta-respuesta que después se filtren con un modelo mayor.
- Asistente de texto en local: cuantizado a 4 bits ocupa aproximadamente 1,2-1,4 GB, por lo que cabe en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, siempre que se asuma la ausencia de garantías de calidad.
- Desarrollo de pipelines de evaluación: útil como sujeto de pruebas para herramientas de benchmarking (lm-evaluation-harness, LightEval) o para validar infraestructura de despliegue (vLLM, TGI, SGLang) antes de escalar a modelos mayores.
- Ajuste adicional específico de dominio: al ser un checkpoint de 2B con licencia no declarada, un equipo podría usarlo como base para un fine-tuning propio, aunque antes debería aclarar la situación legal con el autor.
- Educación y divulgación: permite explicar en un artículo o taller cómo se comporta un modelo pequeño tras un proceso de RL, comparando las respuestas de las distintas revisiones sobre las mismas preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, ni evaluaciones comparativas frente al modelo base, y la búsqueda web realizada no devolvió enlaces relevantes al modelo.

## Requisitos de hardware

- VRAM estimada solo para pesos: en bf16/fp16 unos 4,1 GB; en int8 unos 2,1 GB; en Q4_K_M unos 1,2-1,4 GB; en Q8 unos 2,2 GB. Son cálculos derivados del recuento de parámetros (2.031.739.904) y no cifras publicadas por el autor.
- Caché KV: si se confirma la arquitectura de Qwen3-1.7B (28 capas, 8 cabezas KV, dimensión de cabeza 128), en fp16 ocuparía aproximadamente 0,11 MB por token, es decir, unos 3,6 GB con 32.768 tokens de contexto. Al no conocerse la longitud de contexto real del checkpoint, esta cifra es orientativa.
- GPU consumer: cabe en cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) en cuantización de 4 bits o 8 bits. En bf16 completo requiere al menos 6-8 GB de VRAM. Una RTX 4090 (24 GB) permite lotes amplios y contextos largos sin cuantizar.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S son adecuadas para servicio concurrente con vLLM o TGI, aunque están sobredimensionadas para un modelo de 2B.
- CPU y Apple Silicon: viable en CPU con GGUF Q4 (aunque no se publica ningún GGUF, habría que convertirlo), y en Macs con memoria unificada de 8 GB o más mediante llama.cpp u Ollama.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM, TGI (la etiqueta `text-generation-inference` está presente), SGLang y, previa conversión, llama.cpp/Ollama/LM Studio. Conviene fijar la revisión al cargar el modelo, ya que el repositorio contiene quince ramas distintas.
- Latencia y throughput: no disponibles. No hay datos publicados y dependerán por completo del backend, la cuantización y el hardware.
- Almacenamiento: el repositorio completo ocupa 44,7 GB; si solo se necesita un checkpoint, conviene descargar únicamente la revisión concreta para evitar ese volumen.

## Comparativa con modelos similares

No existe información publicada sobre este checkpoint que permita compararlo con rigor (sin licencia, sin idiomas declarados y sin benchmarks). La tabla siguiente recoge únicamente datos de referencia de modelos de tamaño comparable; los del modelo base presumible proceden de la documentación pública de Qwen y no han sido verificados por el autor de este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JustRL-Qwen3-1p7b-Selective-Top20pct | 2.031.739.904 | No disponible | No disponible | HuggingFace, 0 descargas, 15 revisiones |
| Qwen3-1.7B (base presumible) | 2,03 B | 32.768 tokens nativos (131.072 con YaRN, según documentación del modelo base) | Apache 2.0 | HuggingFace, ampliamente validado |
| Gemma-2-2B | ~2,6 B | 8.192 tokens (según documentación del modelo base) | Licencia Gemma | HuggingFace, ampliamente validado |
| Llama-3.2-1B | ~1,24 B | 128.000 tokens (según documentación del modelo base) | Licencia comunitaria de Llama 3.2 | HuggingFace, ampliamente validado |

La diferencia práctica fundamental no está en el tamaño, sino en el soporte: los tres modelos de referencia tienen licencia explícita, documentación completa y comunidades activas, mientras que este checkpoint carece de todo ello.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en una situación jurídica indeterminada. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de documentación: no se especifican idiomas, contexto, plantilla de chat, hiperparámetros de entrenamiento ni procedencia exacta del modelo base.
- Sin benchmarks: no hay ninguna evidencia publicada sobre la calidad del modelo ni sobre si el ajuste por refuerzo ha degradado capacidades previas (multilingüismo, código, matemáticas, tool calling).
- Riesgo de alucinación: inherente a un modelo de 2.000 millones de parámetros; no hay evaluación que lo acote, y un ajuste por RL sin verificación puede agravarlo si se ha optimizado una recompensa imperfecta.
- Sesgos: al desconocerse el dataset de ajuste, no puede evaluarse qué sesgos se han introducido o amplificado respecto al modelo base.
- Posible sobreajuste a la recompensa: la nomenclatura sugiere un esquema selectivo con control de KL; sin datos de evaluación no puede descartarse un deterioro de la diversidad o de la utilidad general.
- Idiomas: desconocidos. No puede asumirse cobertura multilingüe aunque el modelo base la tuviera.
- Repositorio de 44,7 GB: la descarga completa es costosa; hay que seleccionar la revisión concreta y conviene verificar el espacio en disco antes de clonar.
- Ambigüedad de revisiones: quince ramas sin documentación sobre qué diferencia a cada una más allá del paso de entrenamiento; elegir mal la revisión altera por completo el comportamiento del modelo.
- Sin validación externa: cero descargas y cero valoraciones implican que nadie ha reportado resultados, fallos ni comportamientos inesperados.
- Metadatos anómalos: las fechas de creación y actualización (2026-09-11) no permiten contrastar la antigüedad real del artefacto ni su relación con otras publicaciones.
- No apto para producción sin auditoría previa: atención al cliente, generación de código o cualquier flujo con consecuencias reales exigen una evaluación propia antes de su uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top20pct
- Modelo base presumible (no confirmado por el autor): https://huggingface.co/Qwen/Qwen3-1.7B
- Informe técnico de la familia Qwen3 (referencia del modelo base, no citado por el autor): https://arxiv.org/abs/2505.09388
- Resultados de la búsqueda web: no se encontró ningún enlace relevante al modelo. Las páginas devueltas correspondían a soporte técnico de Microsoft (contacto, inicio de sesión en Hotmail, descarga de Windows 8.1, cuenta de Tech Community y retirada de la utilidad SaRA) y no guardan relación con este repositorio.
