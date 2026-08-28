# adamkareem/llama-3-8b-dolphin-uncensored

## Resumen

El modelo `adamkareem/llama-3-8b-dolphin-uncensored` es un ajuste fino (fine-tune) del modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit`, que a su vez deriva de Llama 3 8B Instruct de Meta. Fue desarrollado por el usuario adamkareem y subido a Hugging Face con licencia Apache-2.0. El nombre sugiere que se trata de una variante "sin censura" orientada a eliminar los filtros de seguridad del modelo original, una práctica común en la comunidad open source para aplicaciones de escritura creativa, roleplay o generación de contenido sin restricciones.

El modelo tiene 8.030 millones de parámetros y está disponible en formato safetensors. Se entrenó con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de fine-tune supervisado, aunque no se han publicado detalles sobre el dataset utilizado ni el método de alineación (RLHF, DPO, etc.). La relevancia actual radica en que ofrece una alternativa sin filtros sobre una base sólida como Llama 3, con un tamaño manejable para GPUs de consumo.

Sin embargo, la información pública es muy limitada: no hay benchmarks, ni especificaciones de contexto, ni detalles de entrenamiento más allá de los mencionados. Esta ficha se basa únicamente en los datos disponibles en la model card y en la información del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el base Llama 3 soporta 8.192 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Llama 3, con 8.000 millones de parámetros y atención causal estándar. No se trata de un modelo MoE ni híbrido. El fine-tune se realizó sobre `unsloth/llama-3-8b-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del modelo instruct de Llama 3, optimizada para entrenamiento eficiente con la librería Unsloth. El proceso de entrenamiento utilizó la librería TRL de Hugging Face, lo que sugiere un ajuste con supervisión (SFT) o posiblemente RLHF, aunque no se especifica el método exacto.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas. El nombre "dolphin-uncensored" indica que el objetivo fue eliminar o reducir los filtros de seguridad del modelo base, pero no hay documentación técnica que detalle cómo se logró.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al derivar de Llama 3 Instruct, conserva la capacidad de responder a prompts conversacionales y de tareas.
- Conversación multi-turno: puede mantener diálogos extensos, aunque la ventana de contexto no está confirmada.
- Escritura creativa y roleplay: al ser "uncensored", es adecuado para generar contenido sin restricciones temáticas, aunque esto conlleva riesgos.
- Razonamiento básico y generación de código: capacidades heredadas de Llama 3 8B, aunque no se han verificado en este fine-tune.
- No se ha confirmado soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Escritura creativa sin filtros: el modelo puede generar narrativas, diálogos o poesía con temáticas adultas o controvertidas que otros modelos rechazarían. Es útil para autores que necesitan explorar contenido sin restricciones.
- Roleplay interactivo: en aplicaciones de chat o juegos de rol, el modelo puede interpretar personajes con libertad, sin imponer límites de contenido.
- Generación de ideas para guiones o novelas: permite explorar tramas oscuras o temas tabú sin que el modelo se niegue a responder.
- Asistente conversacional genérico: para tareas cotidianas de texto, como resúmenes, redacción de correos o brainstorming, aunque no es su uso principal.
- Prototipado de aplicaciones de IA: al ser Apache-2.0, se puede integrar en productos comerciales sin restricciones de licencia, siempre que se cumplan los términos.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el impacto de eliminar filtros en modelos instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se han comparado con el modelo base Llama 3 8B Instruct ni con otros fine-tunes similares.

## Requisitos de hardware

- VRAM estimada: con 8.000 millones de parámetros, en precisión fp16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización 4-bit (como la usada en el entrenamiento) podría caber en 6-8 GB, aunque el repo solo ofrece safetensors sin cuantizar.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o GPUs con 8-12 GB si se aplica cuantización posterior (por ejemplo, con llama.cpp o GPTQ).
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas como RTX 3060 12 GB o superiores con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), o directamente con transformers.
- Latencia y throughput: no disponible. Depende del hardware y del backend; en una RTX 4090 con vLLM se esperaría un throughput de decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| adamkareem/llama-3-8b-dolphin-uncensored | 8B | no disponible | Apache-2.0 | Fine-tune sin censura, sin benchmarks |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 | Llama 3 Community License | Modelo base con filtros de seguridad |
| dphn/Dolphin3.0-Llama3.1-8B | 8B | 8.192 (aprox.) | Apache-2.0 | Fine-tune de Dolphin sobre Llama 3.1, con más documentación |

La comparativa se basa en información pública de los repositorios. El modelo de adamkareem carece de documentación detallada, mientras que las alternativas de Dolphin (Eric Hartford) tienen más respaldo y benchmarks publicados.

## Limitaciones y advertencias

- Falta de documentación: no se especifican datos de entrenamiento, método de alineación ni evaluación, lo que dificulta conocer su comportamiento real.
- Riesgo de contenido inapropiado: al ser "uncensored", puede generar texto ofensivo, ilegal o dañino. No es apto para aplicaciones donde se requiera moderación.
- Sesgos y alucinaciones: heredados del modelo base Llama 3, sin mitigaciones adicionales. Puede inventar hechos o reflejar sesgos del dataset original.
- Contexto limitado: aunque no se confirma, es probable que herede los 8.192 tokens de Llama 3, insuficiente para tareas de contexto muy largo.
- Solo inglés: no soporta otros idiomas de forma nativa.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable del contenido generado. No hay garantías de seguridad ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/adamkareem/llama-3-8b-dolphin-uncensored
- Modelo base (unsloth): https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Referencia a Dolphin Llama 3 (Ollama): https://ollama.com/library/dolphin-llama3:8b
- Dolphin 3.0 Llama 3.1 8B (Hugging Face): https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
