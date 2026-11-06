# em-eval/qwen2.5-7b-good-medical-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/qwen2.5-7b-good-medical-block_em_data-model_org_recipe-s0` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe combinarse con el checkpoint base de Qwen para poder utilizarse. El repositorio ocupa 5,5 GB, lo que corresponde a los pesos del adaptador en precisión completa junto con los ficheros auxiliares del formato PEFT.

El autor, `em-eval`, no ha publicado información sustantiva en la model card: todos los campos descriptivos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) aparecen como `[More Information Needed]`. El identificador del repositorio sugiere un experimento de evaluación de recetas de ajuste fino sobre datos médicos, pero esta interpretación no está confirmada por documentación alguna.

Su relevancia es limitada y de carácter experimental: con 19 descargas y 1 like en el momento de la consulta, se trata de un artefacto de investigación más que de un modelo listo para producción. Resulta útil como ejemplo de flujo PEFT/TRL aplicado a un modelo de 7B, pero carece de la documentación mínima exigible para un uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-7B-Instruct); el artefacto publicado es un adaptador LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos (hasta 131 072 con YaRN, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite cuantizacion GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible en la model card; el base Qwen2.5 declara soporte de 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Tamano del repositorio | 5,5 GB |
| Version de PEFT | 0.21.0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA obtenido mediante SFT (supervised fine-tuning) con la libreria TRL, sobre el modelo base Qwen2.5-7B-Instruct. La arquitectura subyacente es un transformer decoder-only con atención de tipo causal, normalización RMSNorm y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. No se publican el rango del adaptador, los módulos objetivo, la tasa de aprendizaje ni el número de pasos de entrenamiento.

La model card no documenta la composición del dataset, el número de tokens de entrenamiento, la existencia de RLHF/DPO posterior ni ninguna innovación técnica. El nombre del repositorio alude a datos médicos y a una "receta" de organización de datos, pero no hay ninguna descripción verificable del corpus, del proceso de filtrado ni de los criterios de evaluación. Toda afirmación sobre el contenido del ajuste fino sería especulativa.

## Capacidades

- Generación de texto conversacional, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, asumiendo que el ajuste fino no haya degradado las capacidades originales (no verificado).
- Generación de código, igualmente heredada del base y sin evaluación publicada.
- Soporte de tool calling y function calling: el base Qwen2.5-Instruct lo incluye, pero no hay confirmación de que el adaptador lo preserve.
- Capacidades multilingües: dependen del base (29 idiomas declarados por Qwen); el adaptador no documenta idiomas.
- Posible especialización en dominio médico según el nombre del repositorio, sin evidencia publicada que lo respalde.
- No se declara soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de recetas de ajuste fino: el adaptador sirve como punto de comparación en experimentos que midan el efecto de distintas configuraciones de datos y SFT sobre un mismo base. Su valor aquí es metodológico, no funcional.
- Reproducción de pipelines PEFT/TRL: al estar etiquetado con `peft` 0.21.0 y `trl`, permite reconstruir el flujo de entrenamiento y verificar la compatibilidad de versiones en entornos de investigación.
- Pruebas de integración de adaptadores LoRA: útil para validar que un stack de despliegue (por ejemplo, vLLM con soporte de adaptadores o TGI) carga correctamente pesos PEFT sobre Qwen2.5-7B-Instruct.
- Experimentos académicos sobre dominio médico: si el nombre del repositorio refleja el corpus real, podría emplearse como línea base en estudios sobre ajuste fino sanitario, siempre con validación clínica independiente y sin uso asistencial.
- Docencia y formación: ejemplo didáctico de cómo se estructura un repositorio de adaptador (configuración de PEFT, safetensors, metadatos de TRL) para quienes aprenden el ecosistema Hugging Face.
- Comparación de adaptadores sobre el mismo base: al compartir modelo fundacional con otros adaptadores de `em-eval`, facilita análisis controlados de variaciones en los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: requiere cargar Qwen2.5-7B-Instruct (unos 15 GB en bf16/fp16) y aplicar el adaptador encima.
- VRAM estimada para el base en bf16: aproximadamente 15-16 GB solo para pesos, más 2-4 GB de caché KV según longitud de contexto y batch, lo que sitúa el total práctico en 18-24 GB.
- VRAM estimada en cuantización 8 bits: unos 8-9 GB de pesos; en 4 bits (GPTQ/AWQ/GGUF Q4): unos 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) con cuantización.
- Cabe en GPU de consumo: sí, con cuantización de 4-8 bits en tarjetas de 8-16 GB; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: transformers + peft para carga directa del adaptador; vLLM con `--enable-lora`; TGI con soporte de adaptadores; llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| em-eval/qwen2.5-7b-good-medical-block_em_data-model_org_recipe-s0 | 7,6 B (base) + adaptador LoRA | No disponible (base: 32 768) | No disponible | safetensors (PEFT) | Sin documentación ni benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 (131 072 con YaRN) | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Qwen/Qwen2.5-7B | 7,6 B | 32 768 (131 072 con YaRN) | Apache 2.0 (según Qwen) | safetensors, GGUF | Variante preentrenada sin ajuste instructivo |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con tool calling |

La comparación directa es desigual: el artefacto de `em-eval` es un adaptador sin evaluación, mientras que los tres modelos de referencia son checkpoints completos con documentación y licencia claras.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: no puede asumirse uso comercial permitido, aunque el base Qwen2.5 sea Apache 2.0. La ausencia de licencia en el adaptador es un riesgo legal en producción.
- Posible olvido catastrófico: el ajuste fino sobre datos de un dominio concreto puede degradar capacidades generales del base; no hay evaluación que lo descarte.
- Riesgo de alucinación elevado en dominio médico, agravado por la falta de validación clínica y de benchmarks específicos.
- El nombre del repositorio sugiere contenido sanitario, pero no hay evidencia de que los datos estén curados, anonimizados o revisados por profesionales.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Contexto efectivo no verificado tras el ajuste fino.
- Solo 19 descargas y 1 like: sin comunidad que haya reportado fallos o validado resultados.
- No debe usarse en contextos clínicos, diagnósticos ni de asesoramiento médico real.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen2.5-7b-good-medical-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Paper de referencia sobre impacto medioambiental citado en la model card: https://arxiv.org/abs/1910.09700
