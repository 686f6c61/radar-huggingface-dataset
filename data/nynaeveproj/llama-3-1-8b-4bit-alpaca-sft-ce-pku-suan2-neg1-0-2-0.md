# NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg1.0-2.0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA publicado con la librería PEFT (versión 0.19.1) sobre el checkpoint `NynaeveProj/Llama-3.1-8B-4bit`, un Llama-3.1-8B cuantizado a 4 bits. El adaptador lo publica el usuario NynaeveProj y ocupa 0,3 GB en el repositorio. El identificador del modelo (`alpaca-sft-ce-pku-suan2-neg1.0-2.0`) sugiere un ajuste supervisado sobre datos de estilo Alpaca, posiblemente con una variante de entropía cruzada y algún esquema de ponderación de negativos, pero esta interpretación es una inferencia a partir del nombre y no está confirmada por el autor.

La model card es la plantilla por defecto de HuggingFace, sin ninguna sección rellenada: no hay información sobre datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la etiqueta `arxiv:1910.09700` que aparece en los tags corresponde al artículo de Lacoste et al. (2019) sobre emisiones de carbono citado en la plantilla, no a un paper del modelo.

Por todo ello, se trata de un artefacto experimental de documentación prácticamente nula. Es relevante únicamente como ejemplo de pipeline QLoRA/SFT reproducible o como objeto de estudio de ajuste fino, nunca como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso tipo Llama 3.1; el modelo base está cuantizado a 4 bits |
| Parámetros totales | No disponible para el adaptador (el modelo base ronda los 8 030 millones) |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la model card; el Llama-3.1-8B original soporta 128 000 tokens (dato heredado del base, no verificado en este repositorio) |
| Tipos de cuantización | Base en 4 bits según el nombre del repositorio (GPTQ, AWQ o bitsandbytes NF4: no disponible). El adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El modelo base Llama 3.1 se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); no se publican pesos fusionados ni GGUF |
| Tamaño del repositorio | 0,3 GB |
| Librería y versión | PEFT 0.19.1, `transformers`, `pipeline_tag: text-generation` |
| Modelo base | `NynaeveProj/Llama-3.1-8B-4bit` (a su vez derivado de meta-llama/Llama-3.1-8B) |
| Descargas / likes | 0 / 0 |
| Creación / actualización | 2026-10-27 / 2026-10-27 (sin cambios posteriores) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas lineales del transformer base, que se cargan junto al checkpoint cuantizado en 4 bits. Este esquema corresponde a un flujo QLoRA: el modelo base permanece congelado y cuantizado, y solo se entrenan los parámetros del adaptador. No se especifican ni el rango (`r`), ni el `alpha`, ni los módulos objetivo, ni la tasa de aprendizaje, ni el número de épocas, ni el tamaño efectivo de batch. Tampoco se indica qué técnica concreta de cuantización de 4 bits se aplicó al base.

El nombre del repositorio aporta las únicas pistas sobre el entrenamiento: `alpaca` apunta a un corpus de instrucciones en el formato de Alpaca (instruction/input/output), `sft` indica ajuste supervisado clásico con entropía cruzada, `pku-suan2` parece referenciar un conjunto de datos o configuración concreta (posiblemente de origen académico) y `neg1.0-2.0` sugiere algún tipo de ponderación de ejemplos negativos o un rango de temperaturas/márgenes. Ninguna de estas interpretaciones está confirmada por el autor, y no se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos ni RLHF/DPO).

## Capacidades

- Generación de texto autoregresiva en inglés y, presumiblemente, en otros idiomas del modelo base; el comportamiento multilingüe no está verificado.
- Seguimiento de instrucciones de estilo Alpaca, si el ajuste SFT se aplicó como sugiere el nombre del repositorio.
- Ninguna capacidad de tool calling, function calling ni agentes está documentada ni verificada.
- Sin capacidades multimodales: no hay visión, audio ni entrada de imágenes en los tags ni en la model card.
- Sin modo "thinking" ni razonamiento extendido declarado.
- El adaptador no es autónomo: requiere cargar el modelo base `NynaeveProj/Llama-3.1-8B-4bit` y la librería PEFT para funcionar.
- No se ha publicado ninguna evaluación cualitativa de las respuestas del adaptador.

## Casos de uso

- Estudio de pipelines QLoRA: sirve como ejemplo reproducible de cómo se publica un adaptador LoRA entrenado sobre un base cuantizado en 4 bits, útil para comparar convenciones de nombres, tamaños de artefacto y compatibilidad con PEFT 0.19.1.
- Reproducción de experimentos de ajuste fino: un investigador puede cargar el adaptador, medir su perplejidad sobre un conjunto de validación propio y contrastarla con el base sin ajustar para cuantificar el efecto real del SFT.
- Análisis de artefactos sin documentación: caso de estudio sobre riesgos de publicar checkpoints sin model card, sin licencia y sin evaluación, útil en docencia sobre buenas prácticas de publicación de modelos.
- Prototipado local en GPU de consumo: al apoyarse en un base de 8B en 4 bits, el conjunto cabe en GPUs de 8-12 GB de VRAM, lo que permite experimentar con generación de texto en un equipo personal sin infraestructura dedicada.
- Línea base en experimentos de alineación: si el sufijo `neg1.0-2.0` realmente codifica una ponderación de ejemplos negativos, el adaptador puede usarse como referencia frente a variantes con otros hiperparámetros del mismo pipeline.
- Auditoría de linaje de licencias: permite practicar el seguimiento de obligaciones de la Llama 3.1 Community License a través de un base derivado y un adaptador sin licencia explícita, un escenario habitual en compliance de modelos.
- Detección de contaminación de datos: al desconocerse el corpus exacto, es un candidato para pruebas de solapamiento entre el conjunto de entrenamiento sospechoso y benchmarks públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación (todas las entradas figuran como "[More Information Needed]") y no existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 8B en 4 bits ocupa aproximadamente 5-6 GB de pesos; con el adaptador, la caché KV y un contexto moderado (4 000-8 000 tokens) el consumo se sitúa de forma orientativa entre 7 y 12 GB, en función de la implementación. Son estimaciones de orden de magnitud, no medidas publicadas del modelo.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super o RTX 4090. En tarjetas de 8 GB solo con contextos cortos y cuantización adicional del propio adaptador o del base.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S para servir con lotes grandes o contextos cercanos a los 128 000 tokens del base.
- Opciones de despliegue: PEFT + transformers para uso directo del adaptador; TGI admite adaptadores PEFT sobre un base servido (la compatibilidad con un base cuantizado en 4 bits depende del backend); vLLM soporta LoRA sobre bases AWQ/GPTQ con soporte limitado según la combinación; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponible. Como referencia orientativa para un 8B en 4 bits en una RTX 4090 con lote 1, cabría esperar decenas de tokens por segundo, pero no hay ninguna medición asociada a este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este adaptador (NynaeveProj) | Adaptador sobre base de ~8 030 M | No disponible (base: 128 000) | LoRA safetensors | No disponible | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | ~8 030 M | 128 000 | safetensors, GGUF (comunidad) | Llama 3.1 Community License | Sí, en su model card oficial |
| Qwen/Qwen2.5-7B-Instruct | ~7 620 M | 128 000 | safetensors, GGUF, AWQ | Apache 2.0 | Sí, en su model card oficial |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7 250 M | 32 000 | safetensors, GGUF | Apache 2.0 | Sí, en su model card oficial |

Los datos de las tres alternativas corresponden a información pública de sus respectivas model cards y no se han verificado de forma independiente en esta ficha. Para este adaptador no existe ningún resultado de rendimiento que permita una comparación cuantitativa, de modo que la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ningún término de uso, lo que impide determinar si el uso comercial está permitido. El base Llama 3.1 arrastra además las obligaciones de la Llama 3.1 Community License (atribución, nomenclatura del modelo derivado, restricciones de uso).
- Model card vacía: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, de modo que cualquier despliegue se hace a ciegas.
- Sin validación de la comunidad: 0 descargas y 0 "likes" implican ausencia de informes de terceros sobre calidad o fallos.
- Riesgo elevado de alucinación y de respuestas degeneradas: un SFT sobre datos de estilo Alpaca tiende a producir respuestas cortas y plantilladas, y se desconoce si el ajuste preservó las capacidades del base.
- Riesgo de olvido catastrófico: al ser un adaptador sobre un base cuantizado en 4 bits, es probable degradación adicional respecto al Llama-3.1-8B en precisión completa, no medida en ningún momento.
- Comportamiento multilingüe desconocido: el corpus de SFT parece estar orientado a inglés, por lo que el rendimiento en castellano no está garantizado.
- Trazabilidad incompleta del linaje: el base es a su vez un derivado cuantizado del Llama 3.1 de Meta, y no se documenta ni el método de cuantización ni el proceso de conversión, lo que complica reproducir exactamente el entorno de inferencia.
- Imposibilidad de auditar sesgos: no se ha realizado ninguna evaluación de sesgos sociales, políticos o de seguridad, y los del modelo base se heredan sin mitigación conocida.
- No apto para producción: sin evaluación, sin licencia y sin soporte, no debería usarse en sistemas que atiendan a usuarios finales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg1.0-2.0
- Modelo base declarado: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Artículo citado en la plantilla de la model card (emisiones de carbono, ajeno al modelo): https://arxiv.org/abs/1910.09700
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces a sitios para adultos que aparecieron en los resultados se han descartado por no guardar relación alguna con el repositorio.
