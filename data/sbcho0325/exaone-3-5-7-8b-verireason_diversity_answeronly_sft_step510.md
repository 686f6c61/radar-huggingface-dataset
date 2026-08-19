# sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step510

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step510` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `sbcho0325`, que se aplica sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` de LG AI Research. El nombre sugiere un ajuste fino supervisado (SFT) orientado a mejorar el razonamiento verificable (verireason) y la diversidad de respuestas, generando únicamente la respuesta final (answeronly). El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que para su uso es necesario cargar el modelo base y el adaptador mediante la librería PEFT.

Este adaptador no incluye documentación técnica detallada: la model card está vacía y no se proporcionan datos de entrenamiento, hiperparámetros, ni resultados de evaluación. La información disponible se limita a los metadatos de HuggingFace, que indican que fue creado en agosto de 2026 y que no ha recibido descargas ni valoraciones. Su relevancia práctica es limitada hasta que se publique documentación adicional, aunque puede ser de interés para quienes trabajen con EXAONE-3.5 y busquen variantes especializadas en razonamiento con respuestas diversas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB; el modelo base tiene 7.8B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible (la del modelo base es la EXAONE AI Model License, no comercial) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LGAI-EXAONE-3.5-7.8B-Instruct`, un modelo de lenguaje autoregresivo basado en la arquitectura transformer decoder-only. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) utilizando las librerías `transformers`, `trl` y `peft` (versión 0.19.1). El nombre del checkpoint (`verireason_diversity_answeronly_sft_step510`) indica que se trata de un entrenamiento de 510 pasos, probablemente con un objetivo de generar respuestas diversas y verificables, omitiendo el razonamiento intermedio. No se dispone de información sobre el dataset de entrenamiento, la composición de los datos, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se especifican los hiperparámetros del entrenamiento (tasa de aprendizaje, tamaño de lote, etc.).

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base EXAONE-3.5-7.8B-Instruct.
- Razonamiento y respuesta a preguntas, con posible énfasis en diversidad de respuestas y verificación de razonamiento (según el nombre del adaptador).
- Soporte de tool calling y function calling: no confirmado, depende de las capacidades del modelo base.
- Capacidades multilingües: no disponibles, aunque EXAONE-3.5 soporta principalmente coreano e inglés.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Investigación en adaptación de modelos: el adaptador puede servir como ejemplo de fine-tuning con LoRA sobre EXAONE-3.5 para estudiar el efecto del entrenamiento en la diversidad de respuestas.
- Generación de respuestas variadas en sistemas de diálogo: al estar entrenado con "diversity" en el nombre, podría emplearse para producir múltiples respuestas alternativas a una misma consulta, útil en sistemas de recomendación o generación de contenido.
- Evaluación de razonamiento verificable: si el entrenamiento realmente mejora la verificación de razonamiento, podría usarse en tareas de QA donde se requiera explicar el proceso, aunque el nombre "answeronly" sugiere que solo se genera la respuesta final.
- Prototipado rápido con PEFT: al ser un adaptador pequeño (0,3 GB), permite experimentar con técnicas de fine-tuning eficiente sin necesidad de ajustar todos los parámetros del modelo base.
- Análisis de sesgos y robustez: se puede estudiar cómo el adaptador modifica el comportamiento del modelo base en diferentes dominios, aunque no hay datos publicados al respecto.
- Integración en pipelines de generación de texto: mediante la carga del adaptador sobre el modelo base, puede integrarse en aplicaciones de chatbot o asistente virtual, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, los requisitos dependen del modelo base. EXAONE-3.5-7.8B-Instruct en fp16 requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización (por ejemplo, 4 bits) puede reducirse a unos 6-8 GB.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para fp16. Con cuantización, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se cuantiza el modelo base (por ejemplo, con bitsandbytes o GPTQ).
- Opciones de despliegue: se puede usar con `transformers` + `peft`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (si se empaqueta), o `TGI` (Text Generation Inference).
- Latencia y throughput: no disponibles, dependen del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este adaptador, por lo que no es posible realizar una comparativa cuantitativa con otros modelos. Como referencia, el modelo base EXAONE-3.5-7.8B-Instruct compite con otros modelos de 7-8B como Llama 3 8B, Mistral 7B o Qwen 2.5 7B, pero no hay información sobre cómo el adaptador modifica ese rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-verireason... | 7.8B (base) + adaptador | No disponible | No disponible | HuggingFace (adaptador) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.8B | 4096 (según documentación pública) | EXAONE AI Model License (no comercial) | HuggingFace |
| Llama 3 8B Instruct | 8B | 8192 | Llama 3 License (comercial permitido) | HuggingFace |

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el SFT.
- Riesgo de alucinaciones y errores de razonamiento, similar al modelo base, sin garantías adicionales.
- La licencia del modelo base (EXAONE AI Model License) restringe el uso comercial, lo que limita su aplicación en entornos productivos.
- El adaptador no ha sido validado públicamente: no tiene descargas ni evaluaciones independientes, por lo que su calidad es incierta.
- El nombre "answeronly" sugiere que el modelo podría no generar explicaciones intermedias, lo que puede ser inadecuado para tareas que requieran transparencia.
- No se especifican limitaciones de idioma o contexto; se heredan las del modelo base, que está optimizado principalmente para coreano e inglés.
- Al ser un adaptador LoRA, es necesario cargar el modelo base completo, lo que implica cumplir con su licencia y requisitos de hardware.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_diversity_answeronly_sft_step510
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Paper de EXAONE (referencia): no disponible en la información proporcionada
