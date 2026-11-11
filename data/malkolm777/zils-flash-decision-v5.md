# malkolm777/zils-flash-decision-v5

## Resumen
zils-flash-decision-v5 es un modelo de decisión afinado por el usuario malkolm777 a partir del modelo base vllm-sr/d3-flash, que pertenece a la familia Qwen/Qwen3.5-9B. Con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones), el modelo se distribuye en formato safetensors y está pensado para tareas de extracción de características y clasificación de decisiones dentro del ecosistema Zils (subnet 127, flash pool). Su licencia es Apache-2.0.

El modelo se ha obtenido mediante la media uniforme de dos fine-tunes LoRA (rango 16, AdamW con learning rate 5e-5, dos semillas distintas) sobre el cuerpo base. Los datos de entrenamiento provienen de conjuntos públicos convertidos al formato de decisión Zils: mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups y glaive function calling, además de los exámenes semilla públicos Zils v1/v2/v4.

Es relevante ahora porque ejemplifica un patrón de especialización vertical sobre modelos base de tamaño medio: en lugar de un modelo generalista, se ofrece un cuerpo de decisión orientado a un pipeline concreto (Zils), con licencia permisiva y compatible con endpoints. No obstante, la información pública disponible es muy limitada: no hay benchmarks publicados, no se declaran idiomas soportados y el número de descargas es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-9B, según model card); detalles internos no disponibles |
| Parametros totales | 8.392.695.024 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo base vllm-sr/d3-flash, que la model card identifica como un cuerpo de la familia Qwen/Qwen3.5-9B. No se proporcionan detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni tipo de normalización. Tampoco se especifica si hay componentes MoE, SSM o híbridos; dado el recuento de parámetros y la ausencia de mención a parámetros activos, lo más probable es un transformer denso, pero no está confirmado en la información disponible.

El entrenamiento consistió en dos fine-tunes LoRA independientes (rango 16, optimizador AdamW, learning rate 5e-5, dos semillas) sobre las particiones de entrenamiento de los datasets públicos listados, convertidos al formato de decisión Zils, más los exámenes semilla Zils v1/v2/v4. Los dos adaptadores se combinaron mediante media uniforme de pesos. No se indica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO o alguna técnica de alineación adicional. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación y decisión: el pipeline declarado es feature-extraction y el modelo está etiquetado como decision-model, orientado a producir decisiones estructuradas en el formato Zils.
- Razonamiento sobre preguntas de opción múltiple: entrenado con mmlu y commonsense_qa.
- Verificación de afirmaciones: entrenado con boolq y anli.
- Razonamiento aritmético básico: entrenado con gsm8k y SVAMP.
- Clasificación de intención y dominio: entrenado con banking77, clinc150 y 20newsgroups.
- Análisis de sentimiento y sarcasmo: entrenado con poem_sentiment, iSarcasm y titulares de sarcasmo.
- Tool calling / function calling: entrenado con glaive function calling y When2Call, lo que sugiere soporte para decidir cuándo invocar herramientas.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar la intención del usuario entre dominios predefinidos (entrenado con banking77 y clinc150) y decidir si se resuelve con respuesta directa o se escala a un agente humano.
- Decisión de invocación de herramientas en pipelines de agentes: gracias al entrenamiento con glaive function calling y When2Call, puede usarse como clasificador previo que determine si una consulta requiere llamada a API y cuál.
- Moderación y análisis de sentimiento en redes sociales: entrenado con tweet_eval, iSarcasm y titulares de sarcasmo, adecuado para etiquetar tono y sarcasmo en textos cortos.
- Filtrado de preguntas de opción múltiple en sistemas de evaluación: el entrenamiento con mmlu y commonsense_qa permite usarlo como componente de verificación o selección de respuestas en pipelines de evaluación automática.
- Verificación de afirmaciones en sistemas de fact-checking: el entrenamiento con boolq y anli lo hace utilizable como clasificador de entailment/contradicción en etapas de pre-filtrado.
- Clasificación temática de documentos: el entrenamiento con 20newsgroups permite categorizar textos largos en taxonomías predefinidas antes de un procesamiento posterior.
- Resolución de problemas aritméticos simples en asistentes educativos: el entrenamiento con gsm8k y SVAMP lo hace apto para decidir si una consulta matemática requiere cálculo estructurado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8,4 GB de pesos; en 4 bits, aproximadamente 4,2 GB, aunque no se confirman formatos de cuantización publicados para este modelo.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para producción en precisión completa; RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 en FP16 y en GPUs de 16 GB si se cuantiza a 8 bits; en 4 bits podría caber en GPUs de 8 GB, sujeto a verificación.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque el tag endpoints_compatible sugiere compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (decision-model especializado sobre base Qwen3.5-9B) con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Idiomas no declarados: no se puede garantizar calidad fuera del inglés, dado que los datasets de entrenamiento listados son mayoritariamente en inglés.
- Sesgos potenciales heredados de los datasets: mmlu, tweet_eval, 20newsgroups e iSarcasm tienen sesgos conocidos de dominio y de anotación que pueden propagarse.
- Riesgo de alucinación: aunque el modelo está orientado a decisión y clasificación, no se documenta ningún mecanismo de calibración o abstención.
- Licencia Apache-2.0: permisiva para uso comercial, pero el autor remite a LICENSE y NOTICE para condiciones adicionales que no se detallan en la información disponible.
- Modelo con cero descargas y sin validación comunitaria: no hay evidencia de uso en producción ni informes independientes de calidad.
- Contexto máximo no documentado: no se puede planificar su uso en conversaciones multi-turno largas sin verificación previa.
- Especialización estrecha: su utilidad fuera del formato de decisión Zils y de las tareas de los datasets de entrenamiento no está validada.

## Enlaces
- Hugging Face: https://huggingface.co/malkolm777/zils-flash-decision-v5
- Modelo base: https://huggingface.co/vllm-sr/d3-flash (referenciado en la model card; no verificado en la búsqueda)
