# akhilles3/llama-3-8b-hierarchy-extractor

## Resumen
El modelo `akhilles3/llama-3-8b-hierarchy-extractor` es un ajuste fino (fine-tuning) del modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit`, una versión cuantizada en 4 bits de Llama-3-8B-Instruct. Desarrollado por el usuario akhilles3, este checkpoint está diseñado para la extracción de jerarquías en texto, una tarea específica dentro del procesamiento de lenguaje natural que busca identificar y estructurar relaciones de subordinación entre entidades o conceptos.

El modelo se publica bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones adicionales. Al estar basado en Llama-3-8B, hereda la arquitectura Transformer densa con 8.000 millones de parámetros y una ventana de contexto de 8192 tokens. El entrenamiento se realizó con Unsloth, una librería que acelera el fine-tuning, y con la librería TRL de Hugging Face, lo que sugiere un proceso de ajuste supervisado o con refuerzo.

Su relevancia radica en que ofrece una solución ligera y especializada para tareas de extracción de jerarquías, un área útil en sistemas de conocimiento, taxonomías y procesamiento de documentos. No obstante, la documentación disponible es mínima y no se especifican los datos de entrenamiento ni el rendimiento, por lo que la evaluación práctica es imprescindible antes de su uso en producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama-3-8B) |
| Parametros totales | 8.030 millones (aprox., base Llama-3-8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (repo contiene safetensors; base fue cuantizado 4 bits) |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning de `unsloth/llama-3-8b-Instruct-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits (QLoRA) de Llama-3-8B-Instruct. La arquitectura subyacente es un Transformer denso con 32 capas, atención de múltiples cabezas y embedding de 4096 dimensiones, tal como se describe en el paper "The Llama 3 Herd of Models". El proceso de ajuste se realizó con la librería Unsloth, que optimiza el entrenamiento para reducir el tiempo de cómputo, y con TRL (Transformer Reinforcement Learning), lo que indica que se empleó alguna técnica de aprendizaje por refuerzo o fine-tuning supervisado. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni si se aplicó DPO o RLHF. La ausencia de esta información limita la reproducibilidad y la evaluación de la calidad del ajuste.

## Capacidades
- Generación de texto y seguimiento de instrucciones, heredadas de Llama-3-8B-Instruct.
- Razonamiento básico y comprensión de contexto en inglés.
- Extracción de jerarquías: por el nombre del modelo, se espera que sea capaz de identificar y estructurar relaciones de subordinación en texto, aunque no hay documentación que detalle el formato de salida.
- Soporte de tool calling y agentes: no confirmado, pero la base Llama-3-8B-Instruct tiene capacidad para ello; el fine-tune puede haberla preservado.
- Multilingüismo: limitado al inglés (etiqueta `en`).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso
- Extracción de estructuras jerárquicas en documentos técnicos: el modelo puede identificar taxonomías, organigramas o estructuras de dependencia en texto, útil para sistemas de gestión del conocimiento.
- Normalización de datos no estructurados: convertir listas planas en árboles de categorías para bases de datos o sistemas de recomendación.
- Procesamiento de currículums o perfiles profesionales: extraer la jerarquía de experiencia y habilidades (por ejemplo, empresa > departamento > cargo).
- Análisis de sentencias legales: descomponer cláusulas y subcláusulas en una jerarquía de obligaciones.
- Generación de mapas conceptuales: a partir de artículos o manuales, el modelo puede construir diagramas de relación entre conceptos.
- Asistente de documentación técnica: ayudar a organizar manuales en secciones y subsecciones automáticamente.

Nota: estos usos son hipotéticos, basados en el nombre del modelo y las capacidades de la base. No hay evidencia publicada de rendimiento en estos escenarios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda realizar pruebas propias para evaluar la calidad del fine-tune en tareas de extracción de jerarquías.

## Requisitos de hardware
- Para inferencia con el modelo completo en precisión fp16, se necesitan aproximadamente 16 GB de VRAM (GPU con 16 GB, como RTX 4080 o A100 40GB).
- Si se utiliza la versión cuantizada en 4 bits (bnb-4bit) del modelo base, los requisitos bajan a unos 8 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 o RTX 3070.
- El repositorio tiene un tamaño de 0.2 GB, lo que sugiere que puede ser un adaptador LoRA que debe combinarse con el modelo base cuantizado; en ese caso, la VRAM necesaria es la del modelo base (aprox. 8 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o la librería `transformers` de Hugging Face.
- Latencia y throughput estimados: no disponibles, dependerá de la cuantización y del hardware.

## Comparativa con modelos similares
No se dispone de información de modelos comparables específicos para la tarea de extracción de jerarquías. Como referencia, se puede comparar con el modelo base Llama-3-8B-Instruct, que tiene las mismas capacidades pero sin el fine-tuning especializado. Otros modelos como Mistral-7B-Instruct o Gemma-7B podrían ser alternativas, pero no hay datos de rendimiento de este modelo frente a ellos.

## Limitaciones y advertencias
- Sesgos conocidos: hereda los sesgos de Llama-3-8B, que pueden incluir prejuicios de género, raza o cultura.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventar relaciones jerárquicas no presentes en el texto.
- Limitaciones de contexto: ventana de 8192 tokens, insuficiente para documentos largos.
- Idioma: solo inglés; no se garantiza un buen funcionamiento en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base (Llama-3-8B tiene su propia licencia de Meta, que puede tener condiciones adicionales).
- Falta de documentación: no hay detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni los criterios de evaluación, lo que dificulta la confianza en su calidad.
- Posible sobreajuste: el fine-tuning puede estar especializado en un dominio muy concreto y perder generalización.

## Enlaces
- [Hugging Face - akhilles3/llama-3-8b-hierarchy-extractor](https://huggingface.co/akhilles3/llama-3-8b-hierarchy-extractor)
- [Modelo base: unsloth/llama-3-8b-Instruct-bnb-4bit](https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit)
- [Llama 3 - Hugging Face (modelo original)](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
- [Paper "The Llama 3 Herd of Models"](https://arxiv.org/abs/2407.21783)
- [GitHub de Llama 3](https://github.com/meta-llama/llama3)
- [Blog de Llama 3.1](https://huggingface.co/blog/llama31)
