# fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, desarrollado por fpadovani (afiliado a la Universidad de Groningen según el enlace de Weights & Biases). Se trata de un experimento de investigación centrado en el estudio de lenguajes artificiales o "nuevo léxico" (new lexicon) aplicado al inglés, con un tamaño reducido de 86,5 millones de parámetros. El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL de Hugging Face, y está diseñado para generación de texto.

La relevancia de este modelo radica en su uso como herramienta de investigación para analizar cómo los modelos de lenguaje aprenden y procesan vocabulario o estructuras lingüísticas novedosas. Al ser una versión "baseline" de 100 MB, sirve como punto de comparación dentro de una serie de experimentos (se observan variantes en neerlandés e inglés en el perfil del autor). No está pensado para producción, sino para estudios académicos sobre adquisición de lenguaje artificial.

Arquitectónicamente, se basa en GPT-2 (según los tags de HuggingFace), con un tamaño de contexto no especificado en la documentación disponible. El repositorio incluye pesos en formato safetensors y es compatible con el pipeline de text-generation de Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformers) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (variante latina, según el modelo base) |
| Licencia | no disponible (en el README figura "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `goldfish-models/eng_latn_100mb`, que a su vez es un modelo GPT-2 pequeño entrenado sobre texto inglés. La arquitectura es un transformer decoder-only con aproximadamente 86,5 millones de parámetros, lo que lo sitúa en la gama de modelos compactos (similar a GPT-2 small). No se han publicado detalles sobre la configuración exacta (número de capas, heads, dimensiones ocultas) en la información disponible.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) con PyTorch 2.5.1 y Transformers 4.56.2. El proceso está documentado en un run de Weights & Biases (enlace en la model card), aunque no se proporcionan detalles sobre el dataset, número de pasos, hiperparámetros o composición de los datos de entrenamiento. El nombre "newlexicon" sugiere que el dataset incluye un léxico artificial o modificado, pero no se confirma en la documentación.

No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa. Al ser un modelo de investigación, es probable que el entrenamiento se haya realizado en una GPU estándar de laboratorio.

## Capacidades

- Generación de texto: el modelo puede producir respuestas coherentes a preguntas, como se muestra en el ejemplo de la model card ("If you had a time machine...").
- Soporte de chat multi-turno: aunque no se especifica explícitamente, el pipeline de text-generation de Transformers admite mensajes con roles (user, assistant), lo que permite conversaciones básicas.
- Capacidades multilingües: limitadas al inglés (el modelo base está entrenado en inglés latino). No hay evidencia de soporte para otros idiomas.
- Sin soporte para tool calling, agentes, visión o audio: no se mencionan estas capacidades y, dado el tamaño del modelo, es improbable que las tenga.
- Sin modo "thinking" ni razonamiento avanzado: el modelo es pequeño y no está diseñado para tareas complejas de razonamiento.

## Casos de uso

- Investigación académica sobre adquisición de lenguaje artificial: el modelo sirve como baseline en experimentos que estudian cómo los modelos de lenguaje procesan léxicos inventados o modificados. Los investigadores pueden comparar su comportamiento con variantes entrenadas con otros léxicos o tamaños.
- Generación de texto experimental en entornos controlados: útil para probar hipótesis sobre la influencia del vocabulario en la generación de lenguaje natural, por ejemplo, en laboratorios de lingüística computacional.
- Prototipado rápido de aplicaciones de texto con requisitos mínimos: al ser un modelo pequeño, puede ejecutarse en CPU o GPU de gama baja, lo que permite crear prototipos de chatbots o asistentes de texto sin necesidad de infraestructura potente.
- Evaluación de técnicas de fine-tuning: dado que se entrenó con SFT, puede utilizarse como ejemplo didáctico para comparar métodos de ajuste (SFT vs. DPO, etc.) en modelos pequeños.
- Análisis de sesgos y comportamiento en modelos pequeños: al ser un modelo de 86M, es más fácil inspeccionar sus activaciones y representaciones internas, lo que facilita estudios de interpretabilidad.
- Generación de texto creativo o narrativo en inglés: aunque no está optimizado para ello, puede generar historias o respuestas cortas, sirviendo como base para experimentos de estilística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo no está diseñado para tareas de razonamiento o código, por lo que es probable que su rendimiento en dichos benchmarks sea bajo. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 86M parámetros, en FP32 ocupa aproximadamente 346 MB (86.508.288 × 4 bytes). En FP16 serían unos 173 MB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU (inferencia lenta pero factible).
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: compatible con Transformers pipeline (como se muestra en el ejemplo), también se puede usar con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no hay versiones preconvertidas disponibles.
- Latencia y throughput: no hay datos publicados, pero por el tamaño se espera una generación rápida (del orden de decenas de tokens por segundo en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | Investigación sobre léxico artificial |
| goldfish-models/eng_latn_100mb (base) | ~86M | no disponible | Apache 2.0 (según el repositorio Goldfish) | Modelo de lenguaje para investigación lingüística |
| GPT-2 small (124M) | 124M | 1024 | MIT | Generación de texto general |

El modelo se sitúa en la misma gama que GPT-2 small pero con menos parámetros y un propósito más específico. No hay comparativas de rendimiento publicadas, por lo que no se pueden extraer conclusiones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un corpus de inglés (probablemente de dominio general), puede heredar sesgos de género, raza o ideológicos presentes en los datos. No se ha realizado ninguna evaluación de sesgos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada. Al ser pequeño, es más propenso a incoherencias.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero por la arquitectura GPT-2 es probable que sea de 1024 tokens. Para tareas que requieran contexto largo, no es adecuado.
- Limitaciones de idioma: solo soporta inglés. No se debe usar para otros idiomas.
- Restricciones de licencia: la licencia no está especificada claramente ("licence: license" en el README). Esto impide su uso comercial sin verificación previa. Se recomienda contactar al autor antes de cualquier uso en producción.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, hiperparámetros, ni evaluación. Esto limita la reproducibilidad y confianza en el modelo.
- No apto para producción: es un modelo de investigación con fines experimentales. No se recomienda su uso en aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/ks9981gq
- Repositorio de TRL: https://github.com/huggingface/trl
