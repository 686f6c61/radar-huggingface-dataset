# OkamotoJP/llm2-qwen35-sft027b

## Resumen

`OkamotoJP/llm2-qwen35-sft027b` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba, desarrollado por el usuario OkamotoJP. Se trata de un modelo de 873 millones de parámetros (0,87B) orientado exclusivamente al idioma japonés y especializado en la generación de respuestas para sistemas de generación aumentada por recuperación (RAG). El modelo conserva la arquitectura original del Qwen3.5-0.8B; solo se han actualizado los pesos de la parte lingüística mediante LoRA fusionado con los pesos base.

El ajuste se realizó con LoRA (r=16, alpha=32) durante una época sobre 1143 ejemplos de entrenamiento, con una tasa de aprendizaje de 0,0001. Los datos provienen de tres fuentes principales: JEMHopQA (preguntas multihop en japonés), `cl-nagoya/auto-wiki-qa` (preguntas y respuestas generadas automáticamente a partir de Wikipedia en japonés) y un conjunto de fragmentos de Wikipedia japonesa usados como contexto en los prompts de entrenamiento.

Su relevancia radica en que es un modelo pequeño (menos de 1000 millones de parámetros) especializado en una tarea concreta —responder preguntas a partir de documentos recuperados— y con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, al momento de redactar esta ficha no cuenta con descargas ni valoraciones en Hugging Face y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.5-0.8B; detalles no disponibles) |
| Parámetros totales | 873.438.784 (≈0,87B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y mantiene su estructura original; únicamente se han actualizado los pesos de la parte lingüística. El ajuste se realizó mediante LoRA con rango 16 y alpha 32, tasa de aprendizaje 0,0001 y una sola época, tras lo cual los adaptadores se fusionaron con los pesos base, de modo que el resultado es un checkpoint denso estándar compatible con el modelo original.

El conjunto de entrenamiento consta de 1143 ejemplos distribuidos en cuatro subconjuntos: `auto_wiki_qa` (443), `jemhopqa_train_sft/compositional` (369), `jemhopqa_train_ev/compositional` (267) y `synth_compo/compositional` (64). Las fuentes son JEMHopQA (CC BY-SA 4.0) y `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0), ambas filtradas y reformateadas para entrenamiento; además se emplearon fragmentos de Wikipedia japonesa como material de contexto en los prompts. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto en japonés orientada a responder preguntas a partir de contexto documental (RAG).
- Razonamiento multihop básico, derivado del entrenamiento con JEMHopQA (preguntas que requieren composición de varios hechos).
- Comprensión de fragmentos de Wikipedia japonesa como contexto de entrada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo más allá del multihop de QA.
- Capacidades multilingües limitadas al japonés según la model card; no se declaran otros idiomas.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos de documentos y producir una respuesta; encaja como generador final en un pipeline de recuperación + generación sobre corpus japoneses.
- Asistentes de consulta sobre Wikipedia japonesa: puede responder preguntas factuales y multihop usando fragmentos de Wikipedia como contexto, tal como se usó en el entrenamiento.
- Atención al cliente en japonés con base documental: para empresas con manuales o FAQs en japonés, el modelo puede generar respuestas fundamentadas en los fragmentos recuperados, con un coste de inferencia bajo por su tamaño reducido.
- Prototipado rápido y experimentación académica: al ser un modelo de 0,87B con licencia Apache-2.0, es adecuado para entornos con recursos limitados, pruebas de concepto de RAG y docencia (el propio autor lo enmarca en un curso de LLM).
- Despliegue en hardware modesto: su tamaño permite ejecución en GPU de consumo y en CPU con cuantización, útil para demos locales de QA documental en japonés.
- Evaluación de pipelines RAG: sirve como componente generador controlado para medir la calidad de la recuperación, ya que su entrenamiento está acotado a la tarea de responder con contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16/bf16 (coincide con el tamaño del repo); en cuantización de 8 bits rondaría 1 GB y en 4 bits unos 0,5-0,6 GB (estimación por número de parámetros, no verificada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU con cuantización.
- Opciones de despliegue: al ser un checkpoint safetensors con arquitectura Qwen3.5, debería poder servirse con frameworks compatibles con dicha arquitectura (vLLM, TGI, llama.cpp/Ollama si se generan cuantizaciones GGUF); no se han publicado conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft027b | 0,87B | No disponible | Japonés | Apache-2.0 | SFT para RAG en japonés; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (base) | ≈0,8B | No disponible | Multilingüe (según modelo base) | Apache-2.0 | Modelo generalista del que deriva; capacidades originales no detalladas en la información disponible |
| Otros ajustes SFT de Qwen de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables en la información proporcionada |

## Limitaciones y advertencias

- Entrenado únicamente para japonés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Especializado en QA con contexto (RAG); fuera de ese dominio su calidad puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas no fundamentadas en el contexto recuperado, especialmente con preguntas multihop o contextos ambiguos.
- Conjunto de entrenamiento pequeño (1143 ejemplos) y una sola época: posible sobreajuste a los formatos y dominios de JEMHopQA y auto-wiki-qa.
- Sin benchmarks publicados ni descargas registradas; madurez y robustez en producción no verificadas.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar obligaciones de atribución derivadas de los datos.
- No se documentan sesgos específicos; al entrenar sobre Wikipedia japonesa puede heredar sesgos de cobertura y sesgo de género/geográfico de dicha fuente.
- Longitud de contexto no documentada; para RAG con documentos largos debe verificarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft027b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
