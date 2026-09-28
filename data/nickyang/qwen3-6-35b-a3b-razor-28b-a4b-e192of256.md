# Nickyang/Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256

## Resumen

Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256 es un checkpoint derivado de Qwen/Qwen3.6-35B-A3B al que se le ha eliminado una cuarta parte de los expertos enrutados de cada capa MoE mediante RAZOR, un método de poda de expertos sin entrenamiento (*training-free*) presentado por Mingyang Song y Mao Zheng. Cada capa conserva 192 de sus 256 expertos enrutados originales, incluida la capa de predicción multi-token (MTP), y no se aplicó ningún tipo de actualización de gradientes ni entrenamiento de recuperación: los pesos que quedan son los del modelo base, sin modificar. Lo publica el usuario Nickyang en HuggingFace bajo licencia Apache-2.0.

El interés del checkpoint es doble. Por un lado, reduce el almacenamiento de expertos de 35B a 27,7B de parámetros totales (27,0B si se excluye el módulo MTP) manteniendo intactos la atención, el experto compartido, el *embedding*, la cabeza LM y las filas restantes del router, de modo que el coste computacional por token apenas cambia. Por otro, es un artefacto reproducible: la *model card* documenta la fórmula de saliencia empleada, el corpus de calibración (RazorCal, 2.048 muestras multitarea con filas de 32.768 tokens), el manifiesto `kept_expert_indices.json` y los comandos exactos de `razor saliency` y `razor prune`.

Se trata de un modelo de investigación más que de un modelo listo para producción: no declara idiomas soportados, no publica resultados de benchmarks propios y, en el momento de redactar esta ficha, acumula 0 descargas y 0 *likes* en HuggingFace. Su valor principal es servir como punto de comparación controlado frente al modelo base sin podar y frente a la otra variante publicada por el mismo autor, con 128 de 256 expertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) dispersa; 40 capas decodificadoras MoE, 1 experto compartido, top-k = 8 expertos enrutados por token, capa de predicción multi-token (MTP). Implementación nativa `qwen3_5_moe` en Transformers |
| Parámetros totales | 27.692.058.480 (~27,7B); 27,0B excluyendo el módulo MTP (dato real de safetensors) |
| Parámetros activos | ~4,0B por token, según la model card del autor (el modelo base declara ~3B) |
| Expertos enrutados por capa MoE | 192 de 256 originales (ratio de poda 0,25) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican en bfloat16; no se listan cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, tensores de expertos apilados) |
| Tamaño del repositorio | 55,4 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relación: finetune/derivado) |
| Método de poda | RAZOR (poda de expertos sin entrenamiento, basada en saliencia por residuo de consenso) |
| Corpus de calibración | RazorCal (2.048 muestras multitarea, filas de 32.768 tokens) |
| Biblioteca | transformers |
| Tarea declarada | text-generation (las etiquetas incluyen además image-text-to-text) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only con capas MoE: 40 capas decodificadoras, cada una con un pool de 256 expertos enrutados en el modelo base, un experto compartido y enrutamiento top-8. El checkpoint conserva 192 expertos enrutados por capa, con top-k = 8 sin cambios y el experto compartido intacto. La poda afecta exclusivamente al pool de expertos enrutados; ni la atención, ni el experto compartido, ni el *embedding*, ni la cabeza LM se tocan. Se mantiene también el módulo de predicción multi-token, que representa aproximadamente 0,7B de los parámetros totales.

No hay entrenamiento en sentido estricto. RAZOR es un método *training-free*: no se aplicaron actualizaciones de gradientes ni *recovery training*, y los pesos retenidos son los del modelo base. El criterio de selección no mide con qué frecuencia o intensidad se activa un experto, sino si el resto de la computación superviviente puede reemplazar su función. Para un token enrutado al conjunto S con pesos normalizados, se define la mezcla enrutada c y el residuo de consenso de cada experto; al eliminar un experto seleccionado, el router promueve al experto no seleccionado mejor clasificado y el cambio local exacto de salida se calcula como δ = λ ‖w_i r_i − w_r r_r‖₂ / (1 − w_i + w_r). Las puntuaciones se agregan mediante raíz cuadrática media condicional sobre los tokens de calibración enrutados a cada experto, y se retienen los mejores por capa según el presupuesto fijado.

La reproducibilidad es explícita: la selección depende del muestreo de calibración, por lo que una ejecución independiente reproduce el procedimiento, no exactamente este conjunto de expertos. El autor publica el manifiesto `kept_expert_indices.json` y el comando `razor verify` para comprobar la correspondencia entre el checkpoint y el keep-set.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es text-generation y la model card incluye un ejemplo completo con `apply_chat_template` para diálogo por turnos.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no documentadas de forma específica en este checkpoint.
- Capacidad multimodal potencial: entre las etiquetas del repositorio figura `image-text-to-text`, aunque la model card no documenta ni detalla ningún uso de visión. Debe verificarse antes de asumirla.
- Predicción multi-token (MTP): la capa MTP se conserva en el checkpoint, lo que puede habilitar decodificación especulativa o flujos de decodificación acelerada si la implementación de Transformers lo soporta.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara ningún idioma.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Investigación en poda de mezclas de expertos: el checkpoint es una referencia directa para medir la retención de capacidades al eliminar el 25 % de los expertos enrutados, comparándolo con Qwen3.6-35B-A3B y con la variante de 128 expertos. Los comandos `razor saliency` y `razor prune` permiten replicar el procedimiento con otros presupuestos.
- Validación de metodologías de saliencia: al publicarse el keep-set y la fórmula de δ, un equipo puede verificar si el criterio de residuo de consenso se correlaciona con la degradación observada en sus propias tareas, en lugar de depender de métricas agregadas.
- Ablación de enrutamiento sin reentrenamiento: útil para estudiar cómo se reorganiza el router cuando dispone de menos expertos candidatos, manteniendo las 8 activaciones por token y el experto compartido constante.
- Despliegue en bf16 con menos VRAM que el modelo base: 55,4 GB de pesos frente a los aproximadamente 70 GB del base de 35B permiten servir el modelo en una única GPU de 80 GB (A100, H100, H200) con margen para caché KV, algo más ajustado en el modelo sin podar.
- Fine-tuning de dominio sobre un pool reducido: al haber menos matrices de expertos que adaptar, el ajuste con LoRA o QLoRA sobre un subconjunto de expertos resulta más barato en memoria y almacenamiento que sobre el base completo.
- Evaluación comparativa de fidelidad predictiva: la propia model card advierte que la retención en benchmarks no garantiza estabilidad generativa, por lo que este checkpoint sirve para ejecutar evaluaciones de diversidad, formato y criterios de terminación frente al base.
- Inferencia en cuantización de 4 bits en hardware de consumo: con ~27,7B de parámetros, una cuantización de 4 bits sitúa los pesos en el entorno de los 14-16 GB, lo que abre la puerta a GPUs de 24 GB como la RTX 4090 o la RTX 3090 para pruebas y prototipos.
- Generación de texto conversacional en pipelines de Transformers: el ejemplo de la model card funciona directamente con `AutoModelForCausalLM` y `apply_chat_template`, lo que facilita integrarlo en prototipos de asistentes por turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que la retención en benchmarks y la fidelidad predictiva no garantizan una generación estable, pero no incluye ninguna tabla con cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para este checkpoint ni para el modelo base.

## Requisitos de hardware

- VRAM estimada en bfloat16: ~55,4 GB solo para pesos (coincide con el tamaño del repositorio). Con caché KV y overhead de activaciones, se recomienda una GPU de 80 GB o reparto en varias.
- VRAM estimada en FP8/INT8: ~28 GB para pesos, más caché KV; encaja en GPUs de 40-48 GB (A100 40GB, L40S 48GB) y en configuraciones multi-GPU de 24 GB.
- VRAM estimada en 4 bits: ~14-16 GB para pesos, con lo que cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090, RTX 4080 con contexto reducido) siempre que exista soporte de cuantización para la arquitectura `qwen3_5_moe`.
- GPUs recomendadas: H100 80GB o A100 80GB para bf16 en una sola tarjeta; 2×A100 40GB o 2×L40S 48GB como alternativa; RTX 4090/3090 únicamente en cuantización de 4 bits.
- Cómputo por token: al mantenerse top-k = 8 expertos y el experto compartido, el coste por token es esencialmente el mismo que el del modelo base, con ~4,0B de parámetros activos según el autor. El ahorro es de almacenamiento y ancho de banda de memoria, no de FLOPs por token.
- Opciones de despliegue: Transformers con una versión que incluya la implementación nativa de `qwen3_5_moe` (requisito explícito de la model card). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF en la información disponible; la etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Expertos enrutados por capa | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256 | 27,7B (27,0B sin MTP) | ~4,0B | 192 de 256 | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | 256 de 256 | no disponible | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B-Razor-19B-A4B-E128of256 | 19B | ~4,0B (según nomenclatura) | 128 de 256 | no disponible | Apache-2.0 | HuggingFace |

La comparación se limita a estos tres modelos porque la información disponible no identifica alternativas equivalentes de otros desarrolladores con las que contrastar arquitectura, presupuesto de expertos y licencia. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- La poda de expertos es con pérdida (*lossy*). El propio autor advierte de que la retención en benchmarks y la fidelidad predictiva no garantizan una generación estable.
- Se han observado cambios en diversidad, formato y comportamiento de terminación incluso en tareas donde la precisión se mantiene en gran medida. Es imprescindible evaluar sobre la carga de trabajo propia antes de desplegar.
- El corpus de calibración (RazorCal) es multitarea pero finito, por lo que el comportamiento en dominios alejados de él no está caracterizado por las mediciones publicadas.
- La selección de expertos depende del muestreo de calibración: una ejecución independiente reproduce el procedimiento, no exactamente este conjunto de expertos. Los resultados pueden variar entre réplicas.
- Discrepancia no explicada en las cifras del autor: la model card indica que los parámetros activos pasan de ~3B en el base a ~4,0B en el checkpoint podado, a pesar de que la poda solo elimina expertos y mantiene top-k = 8 y el experto compartido. Conviene verificar esta cifra antes de usarla para planificar cómputo.
- Idiomas soportados: no declarados. No se puede asumir cobertura multilingüe sin evaluarla.
- Sin resultados de benchmarks publicados para este checkpoint, ni propios ni comparativos frente al base.
- Adopción nula en el momento de redactar la ficha: 0 descargas y 0 *likes*, sin validación independiente por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial, pero se trata de un derivado del modelo base; los pesos retenidos son los del base y deben respetarse las condiciones de atribución correspondientes.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; al ser un derivado directo del modelo base, hereda los que este presente.
- Requisito técnico bloqueante: se necesita una versión de Transformers con la implementación nativa `qwen3_5_moe`. Sin ella, el checkpoint no carga con `AutoModelForCausalLM` estándar.
- El etiquetado como `image-text-to-text` no está respaldado por documentación de uso multimodal en la model card; trátese como no confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256
- Variante con 128 de 256 expertos: https://huggingface.co/Nickyang/Qwen3.6-35B-A3B-Razor-19B-A4B-E128of256
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de RAZOR: https://arxiv.org/abs/2609.30465
- Repositorio de código: https://github.com/nick7nlp/Razor
- Corpus de calibración RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de los datos de RazorCal: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA
- Cita bibliográfica: Song, Mingyang y Zheng, Mao (2026), «RAZOR: Pruning Replaceable Experts in LLMs», arXiv:2609.30465, cs.LG.

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre el método RAZOR. Todos los enlaces anteriores proceden de la información del repositorio de HuggingFace y de la model card.
