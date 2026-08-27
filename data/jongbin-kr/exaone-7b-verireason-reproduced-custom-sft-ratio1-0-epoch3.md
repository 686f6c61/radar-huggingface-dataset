# Jongbin-kr/exaone-7b-verireason-reproduced-custom-sft-ratio1.0-epoch3

## Resumen

Este modelo es un fine-tuning mediante aprendizaje supervisado (SFT) del modelo EXAONE-3.5-7.8B-Instruct de LG AI Research, realizado por el usuario Jongbin-kr. El objetivo declarado es reproducir o mejorar las capacidades de razonamiento del modelo base, utilizando una proporción de datos de 1.0 y tres épocas de entrenamiento. Está entrenado con la librería TRL de Hugging Face y los pesos se distribuyen en formato safetensors. Al ser un derivado de EXAONE, se espera que mantenga las capacidades bilingües (coreano e inglés) y de instrucción del modelo original, aunque no se proporcionan detalles específicos en la documentación.

El repositorio tiene un tamaño de 0.2 GB, lo que sugiere que podría tratarse de una versión cuantizada o parcial, aunque no se especifica. No se han publicado métricas de evaluación ni comparativas con otros modelos, por lo que su rendimiento real no está verificado. La ficha se basa exclusivamente en la información disponible en Hugging Face y en los resultados de búsqueda relacionados con la familia EXAONE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.8 mil millones (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base EXAONE soporta coreano e inglés, pero no se confirma para este fine-tuning) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de EXAONE-3.5-7.8B-Instruct, un transformer decoder-only con 7.8 mil millones de parámetros. El fine-tuning se realizó mediante SFT (supervised fine-tuning) utilizando TRL, con una proporción de datos de 1.0 y 3 épocas. No se proporcionan detalles sobre el dataset utilizado ni sobre el proceso de entrenamiento más allá de lo indicado en la model card. El entrenamiento se registró en Weights & Biases, pero el enlace no está accesible en la información proporcionada.

No se mencionan innovaciones técnicas específicas en el fine-tuning, como decodificación especulativa o atención lineal. El modelo base EXAONE 3.0 (del cual deriva la familia 3.5) fue pre-entrenado con 8T tokens y post-entrenado con SFT y DPO, pero no se confirma que este fine-tuning herede esas características.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas de este fine-tuning. Al ser un derivado de EXAONE-3.5-7.8B-Instruct, se espera que herede las capacidades del modelo base, que incluyen:

- Generación de texto y comprensión de instrucciones.
- Razonamiento lógico y matemático básico.
- Soporte bilingüe coreano-inglés (según el modelo base).
- Posible soporte de tool calling, aunque no se confirma.

Sin embargo, no hay evaluación pública que confirme estas capacidades en esta versión fine-tuneada. La model card solo muestra un ejemplo de generación de texto con un prompt filosófico, sin indicar resultados de calidad.

## Casos de uso

Dado que no hay datos específicos de rendimiento, los casos de uso se basan en las capacidades esperadas del modelo base y en el propósito declarado del fine-tuning (mejorar el razonamiento). Aplicaciones potenciales:

- Asistente conversacional en coreano e inglés: el modelo puede gestionar diálogos multi-turno, aunque la longitud de contexto no está confirmada.
- Generación de texto técnico y documentación: útil para redactar informes o artículos en entornos bilingües.
- Razonamiento en tareas de pregunta-respuesta: el fine-tuning busca mejorar la capacidad de razonamiento, por lo que podría usarse en sistemas de QA.
- Prototipado rápido de chatbots: al ser un modelo de 7.8B, puede ejecutarse en GPUs de consumo con cuantización.
- Investigación académica: como base para experimentos de fine-tuning adicional o comparación de técnicas SFT.
- Traducción automática informal: dado el bilingüismo del modelo base, podría usarse para traducciones coreano-inglés, aunque no se ha evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tuning. Tampoco se comparan con el modelo base ni con otros modelos similares.

## Requisitos de hardware

- Para inferencia con 7.8B parámetros en precisión fp16 se requieren aproximadamente 16 GB de VRAM.
- Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 con 12 GB.
- Se puede desplegar con vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado la compatibilidad específica con este modelo.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. No se puede establecer una comparación objetiva con alternativas como Llama 3 8B, Mistral 7B o el propio EXAONE-3.5-7.8B-Instruct sin métricas de rendimiento.

## Limitaciones y advertencias

- Al ser un fine-tuning sin evaluación pública, no se conocen sus limitaciones específicas.
- Es probable que herede los sesgos del modelo base, que pueden incluir sesgos culturales o lingüísticos.
- Riesgo de alucinación en tareas de generación de texto, especialmente en dominios especializados.
- La licencia no está especificada, por lo que se debe tener precaución antes de usar en producción comercial.
- No se confirma la longitud de contexto ni el soporte de idiomas, lo que limita su uso en aplicaciones que requieran ventanas largas o multilingüismo.
- El tamaño del repositorio (0.2 GB) sugiere que podría ser una versión parcial o cuantizada, pero no se especifica.

## Enlaces

- [Hugging Face - Jongbin-kr/exaone-7b-verireason-reproduced-custom-sft-ratio1.0-epoch3](https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-custom-sft-ratio1.0-epoch3)
- [Hugging Face - Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3](https://huggingface.co/Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3)
- [Hugging Face - Jongbin-kr/exaone_7b_lora_verireason_official_ratio1.0_epoch3](https://huggingface.co/Jongbin-kr/exaone_7b_lora_verireason_official_ratio1.0_epoch3)
- [GitHub - LG-AI-EXAONE/EXAONE-3.0](https://github.com/LG-AI-EXAONE/EXAONE-3.0)
- [Technical Report EXAONE 3.0 7.8B (PDF)](https://www.lgresearch.ai/data/upload/tech_report/en/EXAONE_3.0_Technical_Report.pdf)
- [arXiv - EXAONE 3.0 7.8B Instruction Tuned Language Model](https://arxiv.org/pdf/2408.03541v4)
