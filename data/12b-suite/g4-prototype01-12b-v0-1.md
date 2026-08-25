# 12B-Suite/G4-Prototype01-12B-v0.1

## Resumen

G4-Prototype01-12B-v0.1 es un modelo de lenguaje experimental desarrollado por el usuario 12B-Suite, concebido como un fine-tuning de prueba sobre el modelo base MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy, que a su vez deriva de Gemma 4 12B de Google DeepMind. El modelo está especializado en roleplay, narrativa creativa y conversación instructiva, con un enfoque particular en psicología oscura y contenido para adultos sin censura.

El proyecto se presenta como un prototipo de investigación: se entrenó durante 3 épocas con una tasa de aprendizaje de 2e-4 sobre un conjunto de datos extremadamente pequeño (22 pares de preguntas y respuestas) extraído del dataset Naphula-Archives/Dark-Psychology-Secrets. Este es un punto crítico: el modelo es un experimento de ajuste fino de baja escala, no un lanzamiento de producción, y su rendimiento general en tareas estándar no ha sido evaluado.

La relevancia de este modelo reside en su base: Gemma 4 12B de Google, una arquitectura multimodal unificada y sin codificadores separados para visión y audio. Sin embargo, la capa de finetune aplicada aquí se centra exclusivamente en texto y en un dominio temático muy específico. El modelo está publicado bajo licencia Apache 2.0 y usa el template de chat de Gemma 4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 12B base), encoder-free |
| Parametros totales | 11.959.730.176 (aprox. 12B) |
| Parametros activos | no disponible (no se especifica arquitectura MoE) |
| Longitud de contexto | no disponible (se hereda de Gemma 4 12B, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (formato safetensors de precision completa; no se mencionan cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es **Gemma 4 12B**, una arquitectura multimodal unificada de Google DeepMind que procesa entradas de texto, imagen y audio sin depender de codificadores separados. La arquitectura se describe como "encoder-free", lo que significa que los datos visuales y auditivos se integran directamente en el transformer, simplificando el pipeline de inferencia y reduciendo el overhead computacional.

El proceso de entrenamiento de este prototipo consiste en un ajuste fino supervisado (SFT) sobre el modelo base MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy. Los hiperparametros reportados son una tasa de aprendizaje de 2e-4, 3 épocas y un dataset de tan solo 22 pares de preguntas y respuestas. No se menciona el uso de RLHF, DPO ni ninguna otra técnica de alineación adicional. El entrenamiento se realizó con PEFT (posiblemente LoRA) y la librería Unsloth, según las etiquetas del modelo.

## Capacidades

- Generación de texto narrativo y creativo, con un enfoque en roleplay y escritura de ficción.
- Instrucciones y respuestas en formato instruct (sigue instrucciones del sistema y del usuario).
- Capacidad para generar contenido temático en psicología, incluyendo "psicología oscura" (persuasión, influencia, manipulación psicológica).
- El modelo base Gemma 4 12B es multimodal (visión y audio), pero el finetune no modifica esta capacidad; sin embargo, no se han publicado pruebas de rendimiento multimodal para este prototipo.
- Soporte de tool calling y agentes: heredado del modelo base Gemma 4, aunque no está verificado en este finetune.
- Conversación multi-turno: el template de chat de Gemma 4 está integrado.
- El modelo está etiquetado como "uncensored" y "heretic", lo que sugiere que no se le aplicaron los filtros de seguridad estándar de Gemma 4.

## Casos de uso

- **Escritura creativa de ficción**: el modelo puede generar historias, diálogos y escenas narrativas, aprovechando su entrenamiento en roleplay y su base Gemma 4 para coherencia textual.
- **Simulación de personajes (roleplay)**: gracias al ajuste con datos de psicología, puede mantener personajes con perfiles psicológicos definidos en conversaciones multi-turno.
- **Exploración de psicología aplicada**: puede servir como herramienta de estudio para analizar patrones de manipulación, persuasión o sesgos cognitivos descritos en el dataset de entrenamiento.
- **Generación de contenido creativo para adultos**: el modelo está diseñado para producir contenido erótico explícito y maduro, aunque este uso conlleva riesgos legales y éticos.
- **Prototipado de experimentos de alineación**: al ser un modelo de finetune muy pequeño, puede usarse como caso de estudio para investigar cómo un dataset pequeño puede alterar el comportamiento de un modelo base grande.
- **Investigación en psicología computacional**: para analizar cómo los modelos de lenguaje representan y generan conceptos de psicología oscura, aunque con las limitaciones evidentes de un dataset de solo 22 ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra suite estándar. Dado que es un prototipo experimental con un dataset de entrenamiento minúsculo, es probable que su rendimiento en tareas generales sea significativamente inferior al del modelo base Gemma 4 12B.

## Requisitos de hardware

- VRAM estimada: para el modelo completo en safetensors (24 GB), se necesitan al menos 24 GB de VRAM para cargar los pesos en FP16 (el tamaño del repo es 24 GB). En cuantización de 8 bits, se puede reducir a unos 12 GB; en 4 bits, a unos 6-8 GB.
- GPU recomendadas: A100 (40 GB), RTX 4090 (24 GB), A6000 (48 GB) para inferencia en FP16. Para cuantización, una RTX 3090 (24 GB) o RTX 4080 (16 GB) serían viables.
- En consumer GPU: sí, cabe en una RTX 4090 o RTX 3090 con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con safetensors y modelos Gemma.
- Latencia y throughput: no disponibles. Para un modelo de 12B en una RTX 4090, se puede estimar una velocidad de 30-50 tokens/s en FP16, y 50-80 tokens/s en cuantización 4 bits, pero estos son valores orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **G4-Prototype01-12B-v0.1** (este) | 12B | no disp. | Apache-2.0 | Finetune experimental, sin benchmarks |
| Gemma 4 12B (base) | 12B | 128K (según guia) | Apache-2.0 | Multimodal, alto rendimiento en razonamiento y codigo |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Modelo de propósito general, amplia comunidad |
| Mistral 7B v0.3 | 7B | 32K | Apache-2.0 | Eficiente, pero menor capacidad de razonamiento |

La comparativa es orientativa. Este finetune no tiene datos de rendimiento, por lo que no se puede comparar cuantitativamente con los modelos base. Su principal diferencia es el enfoque temático (psicología oscura, contenido maduro) y su falta de evaluación.

## Limitaciones y advertencias

- **Contenido explícito**: el modelo puede generar narrativas con contenido erótico y violento. La propia model card advierte de este riesgo. No es apto para uso general.
- **Sin filtros de seguridad**: el modelo se etiqueta como "uncensored", lo que implica que no tiene los mecanismos de seguridad de Gemma 4. Puede generar respuestas dañinas, sesgadas o ilegales.
- **Sesgos**: al ser un finetune sobre un dataset muy pequeño y específico, el modelo puede presentar sesgos marcados hacia el contenido del dataset, con poca generalización.
- **Alucinación**: como cualquier LLM, puede generar información falsa, especialmente en temas fuera de su dataset de entrenamiento.
- **Calidad de entrenamiento**: con solo 22 ejemplos, el finetune es muy limitado y no se puede considerar un modelo de producción. Su rendimiento en tareas generales es probablemente pobre.
- **Riesgo legal**: el uso de este modelo para generar contenido sexual explícito o violencia puede infringir leyes locales o las políticas de plataformas.
- **Solo en inglés**: no hay soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/12B-Suite/G4-Prototype01-12B-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/Naphula-Archives/Dark-Psychology-Secrets
- Modelo base: https://huggingface.co/MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy
- Guia de Gemma 4 12B: https://www.gemma4.wiki/models/gemma-4-12b-model-guide
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
