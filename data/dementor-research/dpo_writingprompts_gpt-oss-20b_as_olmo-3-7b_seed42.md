# dementor-research/dpo_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42

## Resumen

El modelo `dpo_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42` es un adaptador LoRA publicado por el grupo de investigación `dementor-research` como parte de un estudio de imitación conductual configurado mediante la herramienta Tinker de Thinking Machines. El adaptador se entrena sobre el modelo base `openai/gpt-oss-20b` (un transformer denso de 20 000 millones de parámetros) utilizando la técnica de optimización de preferencias directas (DPO) con un rango LoRA de 32 y `target_modules=all-linear`. El objetivo declarado es transferir el comportamiento de escritura del modelo OLMo 3 7B al modelo GPT-OSS-20B, de modo que el modelo grande imite el estilo y las preferencias del modelo pequeño en tareas de generación de texto a partir de prompts de escritura.

El repositorio contiene únicamente los pesos del adaptador (aproximadamente 1 GB en formato safetensors) y no incluye el modelo base completo. Su relevancia radica en que ilustra una metodología de alineación conductual entre modelos de distinta escala, un área de interés creciente para la investigación en eficiencia y control de modelos generativos. Sin embargo, al tratarse de un artefacto de investigación, la documentación es mínima y carece de especificaciones detalladas sobre el conjunto de datos, el proceso de entrenamiento o los resultados obtenidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, target_modules=all-linear) sobre transformer denso `openai/gpt-oss-20b` |
| Parametros totales | Adaptador: no disponible (pesos ~1 GB); modelo base: 20 000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; GPT-OSS-20B no documentado en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en fp32/fp16; el modelo base admite cuantizaciones estándar de Transformers) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA vía librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo `openai/gpt-oss-20b`, un transformer autoregresivo denso de 20 000 millones de parámetros desarrollado por OpenAI. La técnica de entrenamiento es DPO (Direct Preference Optimization), que optimiza directamente las preferencias humanas o sintéticas sin necesidad de un modelo de recompensa separado. El adaptador LoRA tiene rango 32 y se aplica a todas las capas lineales del modelo base (`all-linear`), lo que permite ajustar el comportamiento con un número reducido de parámetros entrenables.

El entrenamiento se realizó con un conjunto de datos de prompts de escritura (writing prompts) y el objetivo era que el modelo base imitara las respuestas generadas por OLMo 3 7B, un modelo de 7 000 millones de parámetros de la familia OLMo. El identificador del modelo incluye `seed42`, lo que indica que se usó una semilla fija para la reproducibilidad. Según la model card, el estudio completo abarca 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 configuraciones posibles para esta etapa. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las hiperparámetros de DPO (como la temperatura o el coeficiente beta).

## Capacidades

- Generación de texto creativo: el adaptador está específicamente entrenado para producir respuestas de escritura que imiten el estilo de OLMo 3 7B, por lo que su capacidad principal es la generación de prosa, narraciones y respuestas a prompts abiertos.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base GPT-OSS-20B, que incluyen comprensión del lenguaje, razonamiento básico y conocimiento enciclopédico, aunque el adaptador puede sesgar estas capacidades hacia el estilo de escritura objetivo.
- Soporte de tool calling: no disponible en la información proporcionada; depende de las capacidades del modelo base y de la configuración de inferencia.
- Soporte de agentes y multi-step reasoning: no documentado específicamente para este adaptador.
- Capacidades multilingües: no disponibles; el modelo base de OpenAI suele soportar múltiples idiomas, pero no se especifica para esta variante.
- Capacidades especiales: ninguna adicional más allá de la imitación de estilo.

## Casos de uso

- Investigación en alineación conductual: el adaptador sirve como caso de estudio para analizar cómo un modelo grande puede imitar el comportamiento de un modelo pequeño mediante DPO, permitiendo estudiar la transferencia de estilo, sesgos y preferencias entre arquitecturas de distinta escala.
- Generación de texto con estilo controlado: puede utilizarse en entornos de investigación donde se requiera producir texto que siga el estilo particular de OLMo 3 7B, por ejemplo para comparar la calidad de salida entre modelos o para crear conjuntos de datos sintéticos con características específicas.
- Evaluación de técnicas de ajuste eficiente: al ser un adaptador LoRA de bajo rango, es útil para probar metodologías de fine-tuning eficiente en parámetros y comparar su efectividad frente a ajustes completos.
- Reproducción de experimentos: dado que el estudio incluye múltiples configuraciones y semillas, el adaptador puede emplearse para reproducir resultados experimentales y verificar la consistencia del entrenamiento DPO.
- Desarrollo de pipelines de generación de contenido: aunque no es un caso de uso productivo recomendado por la falta de documentación, podría integrarse en prototipos que requieran un estilo de escritura específico, siempre que se valide su comportamiento.
- Análisis de robustez y sesgos: al ser un modelo de investigación, permite estudiar cómo la imitación de un modelo pequeño introduce sesgos o limitaciones en el modelo grande, útil para investigaciones sobre seguridad y equidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se proporcionan comparaciones con el modelo base o con OLMo 3 7B en tareas de escritura.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base GPT-OSS-20B requiere aproximadamente 40 GB en precisión fp16 (20 000 millones de parámetros × 2 bytes). Con cuantización de 8 bits puede reducirse a unos 20 GB, y con 4 bits a unos 10 GB. El adaptador LoRA añade una sobrecarga mínima (menos de 1 GB).
- GPU recomendadas: para fp16 se necesitan GPUs de nivel profesional como A100 (40/80 GB), H100 (80 GB) o A6000 (48 GB). Con cuantización 4 bits podría ejecutarse en una RTX 4090 (24 GB) o similar, aunque con limitaciones de velocidad.
- Si cabe en consumer GPU: sí, con cuantización de 4 bits y posiblemente con técnicas de offloading, pero no es recomendable para producción por la latencia.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. Para inferencia optimizada se puede usar vLLM o TGI, aunque requieren la fusión del adaptador con el modelo base. También es posible exportar a GGUF para usarlo con llama.cpp u Ollama, pero no se proporcionan instrucciones al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador está diseñado para imitar a OLMo 3 7B sobre la base de GPT-OSS-20B, por lo que una comparación natural sería:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| `dpo_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42` | 20B (base) + LoRA | No disponible | DPO sobre prompts de escritura | No disponible |
| `openai/gpt-oss-20b` | 20B | No disponible | Preentrenamiento + RLHF (según OpenAI) | No disponible |
| `allenai/OLMo-3-7B` | 7B | No disponible | Preentrenamiento abierto | Apache 2.0 (según publicaciones) |

Sin embargo, no hay datos de rendimiento que permitan comparar la calidad de la imitación ni el comportamiento general.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un adaptador de imitación, puede heredar los sesgos del modelo imitado (OLMo 3 7B) y del modelo base (GPT-OSS-20B), pero no hay estudios al respecto.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha evaluado específicamente para este adaptador.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; depende del modelo base y de la configuración de inferencia. Los idiomas soportados no se indican.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin autorización explícita. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- Caveat importante para producción: este es un artefacto de investigación sin documentación completa. No se recomienda su uso en entornos productivos sin una evaluación exhaustiva de calidad, seguridad y cumplimiento legal.
- Reproducibilidad: aunque se indica una semilla fija, no se publican los hiperparámetros completos del entrenamiento DPO, lo que dificulta la reproducción exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- No se han encontrado papers, blogs o repositorios adicionales asociados a este adaptador en la información proporcionada.
