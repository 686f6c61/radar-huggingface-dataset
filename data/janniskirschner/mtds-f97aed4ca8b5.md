# janniskirschner/mtds-f97aed4ca8b5

## Resumen

`janniskirschner/mtds-f97aed4ca8b5` es un ajuste fino (fine-tune) del modelo Qwen2.5-7B publicado por el usuario Jannis Kirschner bajo licencia Apache 2.0. Se trata de un modelo denso de 7.615.616.512 parámetros (7,6 mil millones) en formato safetensors, con un repositorio de 15,2 GB que corresponde a los pesos completos en precisión de 16 bits. El identificador del modelo (`mtds-f97aed4ca8b5`) es un hash asignado por el proyecto de investigación en el que se enmarca la publicación, según indica el propio autor en la model card.

La información pública es mínima: la model card se limita a declarar el modelo base, la licencia y que el identificador está mapeado a su ejecución de entrenamiento en el repositorio de código del proyecto. No se documentan datos de entrenamiento, hiperparámetros, composición del dataset, método de alineación ni evaluaciones. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no tiene pipeline declarado.

Por tanto, la relevancia práctica de esta ficha es acotada: sirve para inventariar el artefacto, verificar su linaje (Qwen2.5-7B) y establecer qué se puede asumir con seguridad y qué queda sin verificar. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe evidencia publicada del comportamiento del modelo tras el ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-7B (28 capas, hidden size 3584, GQA con 28 cabezas de consulta y 4 de clave/valor, RMSNorm, RoPE). No confirmado de forma explícita en la model card del fine-tune |
| Parametros totales | 7.615.616.512 (7,6 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card del fine-tune. El modelo base soporta 32.768 tokens nativos y hasta 131.072 con escalado YaRN; se desconoce si el ajuste preserva esa configuración |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors). Al estar basado en Qwen2.5-7B es convertible a GGUF/AWQ/GPTQ con las herramientas habituales, pero no hay artefactos publicados ni validados |
| Idiomas soportados | No disponible. El modelo base Qwen2.5-7B declara soporte de más de 29 idiomas; el efecto del ajuste sobre esa cobertura es desconocido |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 15,2 GB, pesos completos en fp16/bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-7B, un transformer decoder-only denso con normalización RMSNorm en pre-normalización, activación SwiGLU en el FFN, embeddings de posición rotatorios (RoPE) con `rope_theta` elevado y atención con consultas agrupadas (GQA) que reduce el coste de la caché KV a 4 cabezas de clave/valor frente a 28 de consulta. El vocabulario del modelo base es de 152.064 tokens, optimizado para texto multilingüe y código. No hay ninguna indicación de que el ajuste introduzca cambios estructurales: el recuento de parámetros coincide con el del modelo base, por lo que se trata de un ajuste de pesos completo, no de una expansión ni de una adaptación tipo LoRA fusionada con cambios de forma.

El proceso de entrenamiento no está documentado. La model card únicamente afirma que el modelo deriva de `Qwen/Qwen2.5-7B` y que el identificador está asociado a una ejecución concreta dentro del repositorio de código del proyecto de investigación del autor. Se desconocen el volumen de tokens de ajuste, la composición del dataset (¿instrucciones? ¿dominio específico? ¿datos sintéticos?), la existencia de RLHF, DPO o SFT supervisado, la semilla y los hiperparámetros, así como si se aplicaron técnicas de mitigación de olvido catastrófico. Tampoco se especifica si el ajuste se realizó sobre la variante base o sobre la variante instruct del modelo Qwen2.5-7B (el tag `base_model:Qwen/Qwen2.5-7B` apunta a la variante base, sin sufijo `-Instruct`).

## Capacidades

- Generación de texto autoregresiva en el mismo rango de capacidades que el modelo base Qwen2.5-7B, sin verificación independiente tras el ajuste.
- Razonamiento de un solo turno y multi-turno: no hay evidencia publicada de mejoras ni de degradaciones respecto al modelo base.
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada en este artefacto.
- Soporte de tool calling y function calling: el modelo base lo soporta mediante plantilla de chat; no se confirma que el ajuste conserve la plantilla ni el formato de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles como capacidad documentada para este fine-tune.
- Multilingüismo: presumiblemente heredado del vocabulario del modelo base (152.064 tokens), sin datos de evaluación por idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo es exclusivamente de texto.
- No hay información sobre el template de chat, tokens especiales ni formato de prompt esperado.

## Casos de uso

- Investigación reproducible sobre ajuste fino: el identificador mapeado a una ejecución de entrenamiento permite usar el modelo como artefacto de referencia en experimentos de comparación entre checkpoints, siempre que se acceda al repositorio de código del proyecto para recuperar la configuración.
- Punto de partida para un segundo ajuste de dominio: al ser un modelo denso de 7,6 B en safetensors con licencia Apache 2.0, se puede recargar con Transformers, PEFT o TRL y aplicar LoRA sobre él en una GPU de 24 GB, sin las restricciones de licencia de otros linajes.
- Clasificación y extracción de información en pipelines internos: con 7,6 B y cuantización de 4 bits cabe en GPUs de 8 GB, lo que permite desplegar tareas de etiquetado o extracción por lotes a bajo coste, previa validación empírica del checkpoint.
- Generación aumentada por recuperación (RAG) en prototipos: el contexto nativo del modelo base (32.768 tokens) admite insertar varios documentos por consulta; útil para pruebas de concepto donde la licencia permisiva y el tamaño reducido priman sobre el rendimiento puntero.
- Evaluación comparativa de fine-tunes: sirve como muestra en estudios sobre degradación de capacidades tras ajuste (olvido catastrófico), midiendo la divergencia respecto a Qwen2.5-7B en tareas estándar.
- Base para distillation o generación de datos sintéticos en investigación: al no tener restricciones comerciales de licencia, se puede usar para generar corpus etiquetados internamente, con la cautela de validar la calidad de salida antes de escalar.
- No se recomienda como asistente de atención al cliente ni en flujos de producción críticos sin una evaluación previa, dado que no existe model card funcional ni benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y las búsquedas web realizadas no han devuelto documentación técnica asociada a este identificador. Tampoco hay información de latencia o throughput medida.

A modo de referencia metodológica, el modelo base Qwen2.5-7B sí dispone de resultados publicados por su autor en su propia model card y en el informe técnico de la familia Qwen2.5; sin embargo, esos números no son trasladables a este fine-tune y no se reproducen aquí al no haber sido verificados para este artefacto.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 15,2 GB solo de pesos, más caché KV y overhead; en la práctica requiere 17-19 GB para contextos moderados.
- VRAM para inferencia en 8 bits: en torno a 8 GB de pesos, con un total realista de 10-12 GB.
- VRAM para inferencia en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5 GB de pesos; total realista de 6-8 GB según longitud de contexto.
- Caché KV: con GQA de 4 cabezas de clave/valor y 28 capas, el coste es de unos 56 KiB por token en fp16; 32.768 tokens de contexto suponen aproximadamente 1,8 GB y 131.072 tokens unos 7,2 GB adicionales sobre los pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contextos largos; L40S, A10G 24 GB o RTX 4090 24 GB para fp16 en un solo dispositivo con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, SGLang y TGI para servicio de alto throughput en fp16; llama.cpp y Ollama para cuantización GGUF en local; Transformers como referencia. El repositorio solo contiene safetensors, por lo que es necesario convertir a GGUF o cuantizar antes de usar las rutas de bajo consumo.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán íntegramente del backend, el hardware y la cuantización elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada del artefacto |
|---|---|---|---|---|---|
| mtds-f97aed4ca8b5 (este modelo) | 7,6 B | No disponible (base: 32K nativo, 128K con YaRN) | Apache 2.0 | HuggingFace, safetensors, 15,2 GB | No |
| Qwen/Qwen2.5-7B (modelo base) | 7,6 B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors y GGUF oficiales | Sí, publicada por el autor |
| meta-llama/Llama-3.1-8B | 8,03 B | 131.072 | Llama 3.1 Community License (restricciones de uso) | HuggingFace, pesos gateados | Sí, publicada por el autor |
| mistralai/Mistral-7B-v0.3 | 7,25 B | 32.768 | Apache 2.0 | HuggingFace, safetensors y GGUF | Sí, publicada por el autor |

La comparación relevante es con el modelo base: este fine-tune no documenta ninguna mejora medible y su interés es fundamentalmente como artefacto de investigación. Frente a Llama 3.1 8B, la licencia Apache 2.0 elimina las cláusulas adicionales de la licencia de Meta; frente a Mistral 7B v0.3, el vocabulario de Qwen2.5 (152.064 tokens) es sustancialmente mayor, lo que suele traducirse en mejor eficiencia por token en idiomas no ingleses, aunque esto no se ha verificado en este checkpoint.

## Limitaciones y advertencias

- Ausencia total de documentación funcional: no hay model card descriptiva, ni plantilla de chat, ni ejemplos de uso, ni formato de prompt declarado. Cualquier integración requiere ingeniería inversa o inspección del tokenizador y del `config.json`.
- Modelo sin evaluar: no existen benchmarks, ni evaluaciones humanas, ni comparaciones con el modelo base. El efecto del ajuste sobre las capacidades originales es desconocido y podría incluir degradación por olvido catastrófico.
- Procedencia de los datos de ajuste desconocida: aunque la licencia del modelo es Apache 2.0, no se especifica con qué datos se entrenó el fine-tune. Esto traslada un riesgo legal y de cumplimiento si se usa comercialmente, ya que la licencia permisiva de los pesos no cubre necesariamente las obligaciones sobre el dataset de ajuste.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por el ajuste. Sin evaluación no se puede acotar la tasa de errores factuales.
- Sesgos: no documentados para este checkpoint. El modelo base Qwen2.5 presenta sesgos conocidos de su corpus de preentrenamiento (18 billones de tokens, mayoritariamente inglés y chino), que este ajuste puede amplificar o mitigar sin que haya evidencia al respecto.
- Cobertura idiomática incierta: el ajuste puede haber reducido el multilingüismo del modelo base si el dataset era monolingüe.
- Contexto no garantizado: no se confirma que el fine-tune mantenga la ventana de 32.768 tokens ni la extrapolación por YaRN; usar contextos largos sin validar puede producir degradación silenciosa.
- Señales de baja madurez: 0 descargas, 0 likes, sin pipeline declarado y creado y actualizado con menos de dos minutos de diferencia, lo que sugiere una publicación automatizada de un checkpoint de investigación.
- No apto para producción sin una batería de pruebas propia que cubra exactitud, robustez frente a prompts adversarios, comportamiento multilingüe y coste por token.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/janniskirschner/mtds-f97aed4ca8b5
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Perfil del autor en HuggingFace: https://huggingface.co/janniskirschner
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Repositorio oficial de Qwen (GitHub): https://github.com/QwenLM/Qwen2.5
- Informe técnico de Qwen2.5 (arXiv 2412.15115): https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

Nota: las búsquedas web realizadas no han devuelto ningún enlace relacionado con este modelo, su proyecto de investigación ni su repositorio de código. Los resultados obtenidos corresponden a personas y proyectos homónimos sin relación (canales de música, repositorios de ensamblador y modelos de imagen), por lo que se han descartado. No se dispone de enlace al repositorio de código del proyecto mencionado en la model card.
