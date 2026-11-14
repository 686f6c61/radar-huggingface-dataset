# mradermacher/AstheralTranslate-GGUF

## Resumen

AstheralTranslate es un modelo especializado en traducción automática multilingüe desarrollado por SEE7 y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino mediante LoRA sobre un modelo base no especificado en la información disponible, entrenado con el corpus Helsinki-NLP/opus-100 para cubrir seis idiomas europeos: inglés, alemán, francés, español, italiano y portugués. Con 1.656.850.432 parámetros totales (aproximadamente 1,66 mil millones), se posiciona en la gama de modelos compactos orientados a tareas de traducción de alta eficiencia.

La relevancia de esta ficha radica en su formato de distribución: mradermacher ha generado un conjunto completo de cuantizaciones GGUF estáticas que abarcan desde Q2_K (0,8 GB) hasta f16 (3,4 GB), lo que permite desplegar el modelo en hardware de consumo con requisitos de VRAM muy reducidos. El repositorio original de SEE7 contiene los pesos en formato transformers, mientras que esta versión facilita su uso con llama.cpp y herramientas derivadas como Ollama o LM Studio.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y está etiquetado como compatible con endpoints. Su diseño está orientado exclusivamente a la traducción, no a la generación general de texto ni al razonamiento, lo que lo convierte en una pieza especializada dentro de pipelines de localización o procesamiento multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parametros totales | 1.656.850.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, de, fr, es, it, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base sobre el que se aplicó el ajuste LoRA. Se sabe que el modelo resultante es un transformer con 1.656.850.432 parámetros y que el entrenamiento se realizó mediante LoRA (Low-Rank Adaptation) sobre el modelo SEE7/AstheralTranslate, utilizando el dataset Helsinki-NLP/opus-100 como corpus de entrenamiento. Opus-100 es un corpus multilingüe de traducción derivado de OPUS que cubre pares de idiomas entre inglés y otras lenguas, ampliamente utilizado en investigación en traducción automática neuronal.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO u otras técnicas de alineación, ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. El hecho de que se trate de un ajuste LoRA sugiere que el modelo base ya contaba con capacidades multilingües y que el ajuste se centró en especializarlo para la tarea de traducción entre los seis idiomas declarados.

## Capacidades

- Traducción automática entre los seis idiomas soportados: inglés, alemán, francés, español, italiano y portugués, en cualquier combinación de pares.
- Especialización en tareas de traducción: el modelo está ajustado específicamente para traducción, no para generación general de texto.
- Soporte multilingüe limitado a los seis idiomas declarados; no se garantiza cobertura de otros idiomas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de transformers.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- El formato GGUF permite su uso con llama.cpp, Ollama, LM Studio y otras herramientas compatibles.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías entre inglés y los idiomas europeos soportados, integrándose en pipelines de CI/CD para generar versiones localizadas de documentación de forma automatizada.
- Traducción de contenido web multilingüe: adecuado para sitios web que necesitan versiones en español, francés, alemán, italiano y portugués a partir de contenido en inglés, con un modelo ligero que puede ejecutarse en servidores modestos.
- Atención al cliente multilingüe: puede utilizarse como capa de traducción en sistemas de soporte que reciben consultas en varios idiomas y necesitan responder en el idioma del usuario, gracias a su cobertura de seis lenguas europeas.
- Procesamiento de reseñas y feedback de usuarios: traducción de opiniones y comentarios en múltiples idiomas a un idioma común para análisis de sentimiento o categorización posterior.
- Subtitulado y traducción de contenido audiovisual: integración en pipelines de generación de subtítulos donde se requiere traducir transcripciones entre los idiomas soportados con requisitos de hardware reducidos.
- Traducción en entornos con recursos limitados: su tamaño compacto (desde 0,8 GB en Q2_K) permite desplegarlo en dispositivos de borde o en máquinas sin GPU dedicada, útil para aplicaciones de traducción offline o en campo.
- Preprocesamiento en pipelines de datos: traducción de corpus multilingües a un idioma pivot para tareas de análisis, indexación o entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~0,8 GB
  - Q3_K_S: ~0,9 GB
  - Q3_K_M: ~1,0 GB
  - Q3_K_L: ~1,0 GB
  - IQ4_XS: ~1,1 GB
  - Q4_K_S: ~1,1 GB
  - Q4_K_M: ~1,1 GB
  - Q5_K_S: ~1,3 GB
  - Q5_K_M: ~1,3 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,4 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; para f16 se recomienda al menos 4 GB. Funciona en RTX 3060, RTX 4060, GTX 1660 y superiores; también en GPUs de datacenter como A100 o H100 sin aprovechamiento completo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 2 GB o más de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo original en transformers, se puede usar con la librería transformers y posiblemente con TGI o vLLM (no confirmado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AstheralTranslate (este) | 1,66 B | No disponible | en, de, fr, es, it, pt | Apache 2.0 | GGUF, safetensors |
| Helsinki-NLP opus-mt-en-es | ~77 M | No disponible | en, es | CC-BY 4.0 | safetensors |
| NLLB-200 distilled 600M | 600 M | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | safetensors |
| M2M100 418M | 418 M | 1024 tokens | 100 idiomas | MIT | safetensors |

La comparativa se basa en modelos de traducción de tamaño similar o inferior ampliamente conocidos. AstheralTranslate ofrece un equilibrio entre tamaño (1,66 B) y cobertura limitada a seis idiomas, frente a alternativas como NLLB-200 que cubren muchos más idiomas pero con licencias más restrictivas para uso comercial (CC-BY-NC). M2M100 ofrece licencia MIT y mayor cobertura lingüística con menos parámetros, aunque su rendimiento específico en los pares de idiomas de AstheralTranslate no está documentado. No se dispone de datos de benchmarks que permitan comparar calidad de traducción entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos; al entrenarse con Opus-100, puede heredar sesgos presentes en el corpus.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones incorrectas, omitir contenido o inventar información en textos ambiguos o con terminología especializada.
- Limitaciones de contexto o idioma: solo cubre seis idiomas europeos; no soporta otros idiomas. La longitud de contexto no está documentada, lo que limita su uso en documentos largos sin segmentación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo base original (SEE7/AstheralTranslate) puede tener condiciones adicionales no especificadas.
- Caveats para producción: no se han publicado evaluaciones de calidad (BLEU, COMET u otras métricas), por lo que se recomienda validar el rendimiento en el dominio específico antes de desplegarlo. Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de traducción de forma notable. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AstheralTranslate-GGUF
- Modelo base original: https://huggingface.co/SEE7/AstheralTranslate
- Dataset de entrenamiento: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Página de descargas de mradermacher: https://hf.tst.eu/model#AstheralTranslate-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
