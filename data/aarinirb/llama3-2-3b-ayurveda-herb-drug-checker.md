# aarinirb/llama3.2-3b-ayurveda-herb-drug-checker

## Resumen

Este modelo, desarrollado por aarinirb, es un fine-tune de Llama 3.2 3B Instruct orientado a la detección de interacciones entre hierbas ayurvédicas y fármacos. Se basa en la arquitectura transformer de Llama 3.2, con aproximadamente 3.000 millones de parámetros, y ha sido ajustado mediante la biblioteca Unsloth y el framework TRL de HuggingFace. El objetivo es proporcionar una herramienta de consulta para profesionales y pacientes que necesiten evaluar la compatibilidad de remedios ayurvédicos con medicamentos convencionales.

La relevancia de este modelo radica en el creciente interés por la medicina integrativa y la necesidad de verificar interacciones entre suplementos botánicos y fármacos. Aunque no se han publicado evaluaciones públicas, el modelo está disponible en HuggingFace bajo licencia Apache 2.0 y presenta un checkpoint de solo 0.1 GB, lo que lo hace adecuado para entornos con recursos limitados. La información sobre el contexto de entrada y las capacidades detalladas no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2 3B) |
| Parametros totales | 3B (aprox., según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (el modelo base usa bnb-4bit) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits de Llama 3.2 3B Instruct. La arquitectura es un transformer estándar con atención por capas, sin componentes de mezcla de expertos (MoE). El entrenamiento se realizó con la biblioteca Unsloth, que optimiza el proceso de fine-tuning, junto con la librería TRL de HuggingFace. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizado ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es el uso de Unsloth para acelerar el entrenamiento, tal como se menciona en la model card.

## Capacidades

- Generación de texto: el modelo conserva las capacidades de instrucción del modelo base Llama 3.2 3B Instruct, pero está especializado en el dominio de interacciones entre hierbas ayurvédicas y fármacos.
- Razonamiento: no se han publicado evaluaciones específicas de razonamiento para este fine-tune.
- Código y matemáticas: no se han documentado capacidades específicas en estos ámbitos.
- Visión: no disponible, el modelo es de texto.
- Tool calling / function calling: no se ha confirmado soporte en la información disponible.
- Agentes y multi-step reasoning: no se ha confirmado.
- Capacidades multilingües: los metadatos indican inglés como idioma principal; no se ha verificado el rendimiento en otros idiomas.
- Capacidades especiales: el modelo está orientado a la detección de interacciones hierba-fármaco, pero no se detallan modos de pensamiento ni soporte de audio.

## Casos de uso

- Detección de interacciones hierba-fármaco en farmacia: el modelo puede consultarse para verificar si un remedio ayurvédico interfiere con un medicamento prescrito. Su tamaño reducido permite desplegarlo en sistemas de atención farmacéutica con hardware modesto.
- Apoyo a profesionales sanitarios en medicina integrativa: los clínicos pueden usar el modelo como una segunda opinión rápida al combinar tratamientos convencionales y ayurvédicos, siempre con supervisión humana.
- Educación médica y formación continuada: puede generar explicaciones sobre posibles interacciones, lo que facilita la elaboración de materiales didácticos para estudiantes de farmacia o medicina.
- Aplicaciones de salud digital para pacientes: integrado en una app, puede ofrecer avisos personalizados sobre suplementos y medicamentos, usando el historial de medicación del usuario.
- Análisis de textos ayurvédicos clásicos: el modelo puede procesar descripciones de hierbas y preparados para extraer información sobre usos y contraindicaciones, apoyando la investigación académica.
- Sistemas de soporte a la decisión clínica: en entornos hospitalarios, puede actuar como módulo de alerta en la prescripción, aunque se requiere validación clínica previa.
- Normalización terminológica: puede traducir y unificar nombres de hierbas y conceptos ayurvédicos al inglés, facilitando la interoperabilidad en bases de datos de fitoterapia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada en la información. El checkpoint ocupa 0.1 GB, lo que indica una cuantización agresiva (probablemente 4-bit). Se estima que un modelo de este tamaño en 4-bit requiere entre 2 y 4 GB de VRAM para inferencia, pero no hay datos oficiales.
- GPU recomendadas: no especificadas. Por tamaño, debería ejecutarse en GPUs de consumo como RTX 3060 o superiores, y en GPUs de datacenter como A10 o T4.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño reducido del checkpoint.
- Opciones de despliegue: según los metadatos, el modelo es compatible con Transformers, Text Generation Inference (TGI) y endpoints compatibles. No se menciona soporte para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aarinirb/llama3.2-3b-ayurveda-herb-drug-checker | 3B | No disponible | Apache 2.0 | HuggingFace |
| Vivekdas/VaidhLLaMA-3.2-3B-Instruct | 3B | No disponible | No disponible | HuggingFace |
| doorm-ai/Llama-3.2-3B-genmount-ayurveda-GGUF | 3B | No disponible | No disponible | HuggingFace |

Los tres son fine-tunes de Llama 3.2 3B para el dominio ayurvédico. No se dispone de datos de rendimiento comparativos. El modelo de aarinirb se distingue por su licencia Apache 2.0 y su checkpoint de 0.1 GB, mientras que el de doorm-ai está en formato GGUF, lo que sugiere que está preparado para ejecución en llama.cpp. La licencia del modelo de Vivekdas no se especifica en los resultados de la búsqueda.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos. Como todo LLM, el modelo puede heredar sesgos del corpus de entrenamiento y del modelo base, especialmente en el contexto de sistemas de conocimiento tradicional.
- Riesgo de alucinación: no hay evaluaciones publicadas. El modelo podría generar afirmaciones incorrectas sobre interacciones, por lo que no debe usarse como único recurso médico.
- Limitaciones de contexto o idioma: el idioma principal es inglés. No se ha verificado el rendimiento en otros idiomas, incluido el hindi o el sánscrito, relevantes para la terminología ayurvédica.
- Restricciones de licencia: aunque el modelo está publicado bajo Apache 2.0, el modelo base Llama 3.2 está sujeto a la Licencia de Comunidad de Llama 3.2, que impone restricciones adicionales de uso. Es necesario revisar ambas licencias antes de un uso comercial.
- Caveat para producción: no se han publicado benchmarks ni validaciones clínicas. El modelo tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido evaluado por la comunidad. No es apto para sistemas de salud reales sin una validación exhaustiva.

## Enlaces

- https://huggingface.co/aarinirb/llama3.2-3b-ayurveda-herb-drug-checker
- https://huggingface.co/Vivekdas/VaidhLLaMA-3.2-3B-Instruct
- https://huggingface.co/doorm-ai/Llama-3.2-3B-genmount-ayurveda-GGUF
- https://github.com/unslothai/unsloth (mencionado en la model card)
