# sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss-best

## Resumen

`sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss-best` es un checkpoint de generación de texto publicado en Hugging Face por el usuario sartajbhuvaji. Sus pesos en safetensors suman 15.577.227.264 parámetros (unos 15,58 mil millones en precisión BF16, con un repositorio de 31,2 GB) y la etiqueta de arquitectura `qwen3_moe` lo sitúa en la familia de mezcla de expertos (MoE) de Qwen3. El identificador sugiere un experimento de destilación con 24 capas y una configuración concreta de entrenamiento (warmup 75, learning rate 1e-4, una corrección de la función de pérdida y selección del mejor checkpoint), pero ninguno de esos detalles está documentado en la model card.

La model card es la plantilla automática de Hugging Face sin rellenar: no declara autoría real, licencia, idiomas, datos de entrenamiento, evaluación ni uso previsto. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y la etiqueta `arxiv:1910.09700` proviene del texto de plantilla (la calculadora de impacto de Lacoste et al., 2019), no de un artículo sobre el modelo.

Por tanto, se trata de un artefacto de investigación sin validación pública ni licencia clara. Su interés es acotado: sirve para estudiar recetas de destilación y reducción de expertos en arquitecturas MoE de la familia Qwen3, pero no es una base recomendable para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer decoder-only, etiqueta `qwen3_moe` (familia Qwen3); el identificador declara 24 capas (`depth24`), sin confirmación en la model card |
| Parametros totales | 15.577.227.264 (≈15,58 mil millones), según los safetensors del repositorio |
| Parametros activos | No disponible (es MoE; el identificador sugiere una configuración reducida de expertos, `experts0-500`, pero no se especifica el número de expertos ni los parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en el repositorio: solo se publican pesos safetensors en BF16; no hay GGUF, AWQ, GPTQ ni FP8 publicados |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card deja el campo como `[More Information Needed]`) |
| Formato de pesos | `safetensors` (librería `transformers`); repositorio de 31,2 GB |

## Arquitectura y entrenamiento

El checkpoint es un modelo MoE decoder-only de la familia Qwen3: el tag `qwen3_moe` identifica la implementación concreta en `transformers`, y el nombre del repositorio codifica parte de la configuración experimental (`depth24` para la profundidad, `experts0-500` para un posible barrido o recorte de expertos, `warmup75` y `lr1e4` para los hiperparámetros de optimización, `fixedloss` para una corrección en el cálculo de la pérdida y `best` para el mejor checkpoint de la ejecución). No hay información sobre el número de expertos, el tamaño del experto compartido, el enrutador ni la dimensionalidad de las capas.

Tampoco se documenta el proceso de entrenamiento: ni volumen de tokens, ni composición del corpus, ni si hubo RLHF, DPO o ajuste supervisado. El término `distilled` del identificador indica destilación, pero se desconoce el modelo profesor y la metodología (destilación de logits, de capas intermedias o de comportamiento). El tag `arxiv:1910.09700` no aporta información técnica: corresponde a la cita de la calculadora de emisiones incluida en la plantilla automática de la model card.

## Capacidades

- Generación de texto autorregresiva, según el pipeline declarado `text-generation`.
- Formato conversacional (`conversational`), presumiblemente con plantilla de chat de la familia Qwen3; la plantilla exacta no está documentada.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Razonamiento, matemáticas, código, tool calling, capacidades de agente y modo de pensamiento: no documentados en la información disponible; al derivar de Qwen3 es plausible que herede parte de estas capacidades, pero no hay verificación alguna.
- Capacidades multimodales (visión, audio): no disponibles; las etiquetas no las mencionan.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre destilación de modelos MoE: usar el checkpoint como estudiante y comparar su comportamiento frente al profesor original para medir la pérdida de calidad por capa y por experto.
- Estudio de reducción de expertos: el identificador `experts0-500` apunta a un experimento de poda o barrido de expertos; el modelo sirve como punto de partida para analizar el efecto en perplejidad y en diversidad de enrutamiento.
- Reproducción de recetas de entrenamiento: los hiperparámetros codificados en el nombre (warmup 75, lr 1e-4, corrección de pérdida) permiten documentar y replicar la configuración en otros checkpoints de la misma serie.
- Evaluación comparativa de checkpoints intermedios: al ser un `best` de una ejecución, es útil para contrastar con otros checkpoints del mismo autor y trazar curvas de calidad frente a pasos de entrenamiento.
- Experimentos de cuantización: con 15,58 mil millones de parámetros en BF16, es un sujeto razonable para medir la degradación de un MoE al pasar a INT8/INT4, aunque haya que generar los GGUF manualmente.
- Docencia y análisis de arquitecturas MoE: inspeccionar el reparto de parámetros entre expertos y el comportamiento del enrutador en un modelo de tamaño medio.
- Fine-tuning exploratorio: ajuste con LoRA sobre dominios concretos para comprobar si un MoE destilado y de 24 capas retiene capacidad de adaptación.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines críticos: no hay licencia, ni evaluación, ni validación de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación, no hay cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el modelo no tiene descargas ni evaluaciones de terceros registradas.

## Requisitos de hardware

- VRAM estimada en BF16: alrededor de 31,2 GB solo para pesos; con caché KV para contextos cortos, entre 34 y 38 GB según implementación y longitud de secuencia.
- VRAM estimada en FP8: unos 16 GB de pesos, con overhead de activaciones y caché KV.
- VRAM estimada en INT4/NF4: entre 8 y 10 GB de pesos, viable en GPU de 12-16 GB con margen ajustado.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB, L40S 48 GB. También posible en 2× RTX 4090 o 2× RTX 3090 con reparto de capas o tensor parallel.
- GPU de consumo: una RTX 4090 (24 GB) no admite BF16 sin offload, pero sí FP8 o INT4. Una RTX 4070 Ti Super (16 GB) queda al límite en FP8 e iría mejor en INT4.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI si el checkpoint es compatible con la implementación `qwen3_moe` de la versión correspondiente (no verificado). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles. Al ser un MoE, el coste por token debería aproximarse al de los parámetros activos y no al total, pero se desconoce cuántos expertos se activan.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus model cards públicas; los de este checkpoint, de los safetensors y de las etiquetas del repositorio.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| bonsai-distilled-depth24-experts0-500 (este) | 15,58 B | No disponible | No disponible | No disponible | Checkpoint experimental, 0 descargas |
| Qwen3-14B | 14,8 B | Densos (no aplica) | 32 768 tokens nativos, ampliables con YaRN | Apache 2.0 | Modelo oficial consolidado |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32 768 tokens nativos, ampliables con YaRN | Apache 2.0 | Modelo oficial consolidado |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 768 tokens | Apache 2.0 | Referencia MoE abierta |

La comparación es estructural, no de rendimiento: no existe ningún benchmark publicado de este checkpoint que permita situarlo frente a las alternativas. La diferencia crítica es de licencia y trazabilidad: los tres modelos de referencia declaran licencia Apache 2.0 y tienen documentación de entrenamiento, mientras que este checkpoint no ofrece ninguna de las dos cosas.

## Limitaciones y advertencias

- Ausencia total de licencia: sin un término legal explícito no puede asumirse permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Model card autogenerada y sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Sin validación de la comunidad: 0 descargas y 0 likes implican que no hay informes independientes de calidad ni de fallos.
- Riesgo de alucinación desconocido: no se ha caracterizado el comportamiento del modelo en tareas factuales.
- Idiomas no declarados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma concreto.
- Contexto desconocido: planificar cualquier integración sin asumir una ventana larga; la familia Qwen3 suele usar 32 768 tokens, pero no está confirmado para este checkpoint.
- El nombre `fixedloss` sugiere que hubo un problema de pérdida durante el entrenamiento; conviene verificar la estabilidad del modelo antes de reutilizarlo.
- Posible checkpoint intermedio: al tratarse del `best` de una ejecución concreta, puede estar por debajo del modelo base del que parte.
- No se ha verificado la presencia de tokenizer, plantilla de chat ni configuración de generación en el repositorio; sin ellos el checkpoint no es directamente utilizable.
- Los tags `endpoints_compatible` y `conversational` son declarativos y no garantizan compatibilidad real con el stack de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss-best
- Lacoste et al. (2019), cita incluida en la plantilla de la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos asociados a este modelo.
