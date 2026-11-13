# MergekitCloud/mergekit-172

## Resumen

Mergekit-172 es un modelo de lenguaje de 8.030.261.248 parámetros (aproximadamente 8B) creado por el usuario MergekitCloud mediante la fusión de pesos de cuatro modelos derivados de Llama 3.1 de 8B. No se trata de un modelo entrenado desde cero, sino de un *merge* generado con la herramienta [mergekit](https://github.com/cg123/mergekit) aplicando el método Model Stock, descrito en el paper arXiv:2403.19522. El modelo base de la fusión es vicgalle/Humanish-Roleplay-Llama-3.1-8B, y los modelos fusionados son ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS.

El propósito declarado de esta fusión es combinar las características de sus componentes: por un lado, modelos orientados a roleplay y conversación sin censura (Lexi-Uncensored, Unholy) y, por otro, un modelo afinado para respuestas más naturales y con personalidad (RPMax, Humanish-Roleplay). El resultado es un modelo de generación de texto conversacional, publicado en formato transformers con pesos safetensors y pensado para su uso con la librería transformers y text-generation-inference.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: se trata de un merge comunitario sin model card detallada, sin datos de entrenamiento, sin benchmarks publicados y sin licencia especificada. Su interés radica en ser un ejemplo típico del ecosistema de merges de Llama 3.1 de 8B orientados a roleplay y conversación, y en ilustrar las ventajas y riesgos de este tipo de artefactos (licencia incierta, comportamiento impredecible, ausencia de evaluación formal).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos base Llama 3.1 soportan hasta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en float16/safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento. La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU. La fusión se realizó con mergekit aplicando el método Model Stock, que calcula los pesos fusionados como una combinación ponderada de los modelos de entrada en torno a un modelo base, con normalización desactivada (`normalize: false`) y máscara int8 activada (`int8_mask: true`), y guardando el resultado en `float16`.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO para este merge concreto. Cada modelo componente tiene su propio historial de ajuste (fine-tuning) orientado a conversación y roleplay, pero la model card no documenta esos detalles. Tampoco se documentan innovaciones técnicas adicionales más allá del propio método de fusión Model Stock.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogos con personalidad y estilo de roleplay.
- Respuestas sin censura en los modelos componentes (Lexi-Uncensored, Unholy), aunque el comportamiento del merge no está verificado formalmente.
- Razonamiento y generación de código heredados de la base Llama 3.1 8B, sin evaluación específica en este merge.
- Soporte de tool calling / function calling: no confirmado para este merge; depende de si los modelos componentes conservan las capacidades del Llama 3.1 original.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no documentadas; se heredan potencialmente las de Llama 3.1, pero sin verificación.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de chatbots de roleplay: el modelo puede usarse para generar respuestas con personalidad en aplicaciones de entretenimiento conversacional, aprovechando la mezcla de estilos de sus componentes.
- Experimentación con técnicas de model merging: sirve como caso de estudio para investigadores que quieran reproducir o analizar el método Model Stock con mergekit sobre Llama 3.1 8B.
- Generación de diálogos sintéticos para datasets: puede emplearse para producir conversaciones de entrenamiento o evaluación en dominios de roleplay, con revisión humana posterior.
- Asistente conversacional sin restricciones temáticas: en entornos controlados de investigación sobre alineación y seguridad, permite estudiar el comportamiento de modelos menos censurados.
- Base para fine-tuning posterior: al ser un checkpoint de 8B en safetensors, puede servir como punto de partida para ajustes específicos con LoRA o QLoRA.
- Despliegue local en hardware de consumo: con 8B parámetros, es viable en GPUs de 16-24 GB mediante cuantización, para demos y pruebas de concepto.
- Evaluación comparativa de merges: útil para medir cómo afecta la fusión de modelos de roleplay a métricas de coherencia, seguridad y estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 18-20 GB en la práctica para contextos moderados).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-10 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para float16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en float16 con contexto limitado, y en RTX 3060/4060 Ti de 16 GB o superiores con cuantización de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-172 | 8,03B | no disponible | Merge Model Stock de Llama 3.1 8B | no disponible | Hugging Face |
| vicgalle/Humanish-Roleplay-Llama-3.1-8B | ~8B | 131.072 (Llama 3.1) | Fine-tune de roleplay | no disponible en esta ficha | Hugging Face |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | ~8B | 131.072 (Llama 3.1) | Fine-tune sin censura | no disponible en esta ficha | Hugging Face |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | ~8B | 131.072 (Llama 3.1) | Fine-tune conversacional | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; además, los modelos componentes pueden tener condiciones propias que condicionen la redistribución.
- Ausencia total de benchmarks y evaluación formal: el rendimiento real del merge es desconocido y puede degradarse respecto a los componentes individuales.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por la fusión de pesos sin validación.
- Contenido sin censura: los componentes incluyen modelos explícitamente "uncensored", lo que implica riesgo de generar contenido inapropiado, ofensivo o inseguro.
- Idiomas no documentados: no hay garantía de calidad multilingüe más allá de lo que herede de Llama 3.1.
- Longitud de contexto no confirmada en esta ficha: aunque la base Llama 3.1 soporta 131.072 tokens, el merge no lo documenta y podría no conservarlo.
- Modelo comunitario con 0 descargas y 0 likes: sin validación por parte de la comunidad, sin issues ni discusión asociada.
- Fecha de creación futura en los metadatos (2026-11-13): inconsistencia que sugiere que los metadatos no son fiables.
- No apto para producción sin evaluación previa: se recomienda auditar comportamiento, sesgos y seguridad antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/MergekitCloud/mergekit-172
- Paper Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio mergekit: https://github.com/cg123/mergekit
- Modelo base de la fusión: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B
- Componente: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Componente: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Componente: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
