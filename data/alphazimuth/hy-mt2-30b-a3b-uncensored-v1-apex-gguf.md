# alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF

## Resumen

Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF es una cuantización GGUF experimental del modelo de traducción Hy-MT2-30B-A3B de Tencent, publicada por el usuario alphaZimuth. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30.064.725.888 parámetros totales y 128 expertos por capa en las capas 12 a 45, orientado específicamente a traducción multilingüe en 36 idiomas. Sobre esos pesos se aplicó un proceso de abliteración denominado Directional / Orthogonal Ablation, con coeficiente 1.0 y dimensión de dirección 2048, para reducir el comportamiento de rechazo preservando la capacidad de traducción.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de edición de pesos en forma cerrada que no requiere entrenamiento adicional y que modifica 4.387 tensores (lm_head, o_proj de 34 capas y down_proj de 4.352 expertos). Por otro, el propio autor ha marcado esta versión como legacy y experimental: la model card advierte de degradación de calidad en algunas cuantizaciones, seguimiento de instrucciones más débil y salidas `think` no deseadas durante la traducción, y remite a una versión posterior calibrada con Imatrix.

Se distribuye en tres niveles de cuantización APEX (Mini, Compact y Quality) con pesos en formato GGUF para llama.cpp, bajo licencia Apache 2.0. El repositorio ocupa 45,1 GB y acumula 235 descargas y 3 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia hy_v3 |
| Parámetros totales | 30.064.725.888 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | APEX en tres niveles: Mini (10,8 GB), Compact (13,2 GB), Quality (17,8 GB); sin calibración Imatrix |
| Idiomas soportados | 36: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se editó en BF16 con cálculo en FP32 |
| Pipeline declarado | translation |
| Descargas / likes | 235 / 3 |
| Tamaño del repositorio | 45,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Tencent de la familia hy_v3, con 30.064 millones de parámetros totales repartidos en 128 expertos por capa en el rango de capas 12 a 45. La información disponible no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo original.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la edición de pesos. Se aplica una ablación direccional/ortogonal en forma cerrada sobre la matriz de pesos W: W' = W − c · r ⊗ (rᵀW), donde r es una dirección de rechazo multilingüe normalizada y c el coeficiente de ablación. Con c = 1.0 y dimensión de dirección 2048, se editan el `lm_head`, las `o_proj` de las capas 12 a 45 y las `down_proj` de los 128 expertos de esas mismas capas, sumando 4.387 tensores. El cálculo se realiza en FP32 y los tensores resultantes se escriben de vuelta en BF16. Posteriormente se convierte a GGUF y se cuantiza con APEX sin usar `imatrix.dat`, lo que el propio autor señala como causa probable de parte de la degradación observada.

## Capacidades

- Traducción multilingüe entre 36 idiomas, incluyendo pares poco habituales como bo (tibetano), ug (uigur), mn (mongol), kk (kazajo) o km (jemer).
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Ejecución local mediante llama.cpp gracias al formato GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición como servicio HTTP.
- Comportamiento de rechazo reducido mediante abliteración, orientado a traducción de contenido que el modelo original podría declinar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito. La aparición de salidas `think` se describe como un defecto no deseado, no como una capacidad.

## Casos de uso

- Traducción de documentación técnica a idiomas de bajos recursos: el modelo cubre tibetano, uigur, mongol, kazajo y jemer, pares para los que hay pocos modelos abiertos de este tamaño, lo que permite localizar manuales y guías sin depender de APIs comerciales.
- Procesamiento por lotes en infraestructura propia: al distribuirse en GGUF y ejecutarse con llama.cpp, se puede integrar en un pipeline nocturno de traducción de corpus con CPU o GPU modestas, usando el nivel Mini (10,8 GB) para maximizar throughput.
- Traducción de contenido editorial sensible: la ablación reduce los rechazos, lo que resulta útil en editoriales que traducen literatura, guiones o material de divulgación con lenguaje explícito y necesitan que el modelo no interrumpa la tarea.
- Localización de interfaces y software: la ventana multilingüe permite traducir cadenas de UI y mensajes de error a los 36 idiomas cubiertos manteniendo un único modelo desplegado en lugar de varios especializados por par.
- Investigación sobre abliteración: el repositorio documenta con precisión los tensores editados, el coeficiente y la dimensión de dirección, lo que lo convierte en material de referencia para reproducir o comparar técnicas de edición de pesos en modelos MoE.
- Evaluación comparativa de cuantizaciones: disponer de tres niveles APEX permite medir en un mismo hardware la relación entre tamaño, latencia y calidad de traducción, útil para decidir el nivel adecuado antes de un despliegue en producción.
- Filtrado y traducción de contenido generado por usuarios en foros o chats: el modelo puede normalizar mensajes en múltiples idiomas a un idioma común para moderación posterior, aunque la ausencia de datos de contexto limita el tamaño de los hilos procesables de una vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. El autor presenta únicamente una evaluación preliminar de retención de traducción sobre 56 muestras simples, comparando las salidas del modelo modificado contra las del modelo original, no contra referencias humanas:

| Métrica | Valor |
|---|---|
| chrF medio | 0,9529 |
| BLEU medio | 0,6010 |
| chrF coreano | 1,000 |
| chrF chino | 1,000 |
| chrF árabe | 0,974 |
| chrF español | truncado en la información disponible |

El propio autor advierte que el 95,3 % de chrF mide similitud con las salidas del modelo original, no precisión ni calidad absoluta de traducción. No hay datos de MMLU, HumanEval, GSM8K ni de rendimiento en otros dominios.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11 GB para el nivel Mini, 13-14 GB para Compact y 18-19 GB para Quality, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para los tres niveles; RTX 4080 o 4070 Ti Super (16 GB) para Mini y Compact; A100, H100 o L40S para despliegues con concurrencia.
- En GPUs de consumo de 8-12 GB solo cabe el nivel Mini con contexto reducido o mediante offload parcial a CPU.
- Despliegue: llama.cpp y sus derivados (Ollama, llama-cpp-python, LM Studio). No se documenta compatibilidad con vLLM o TGI, que requieren pesos en safetensors y no consumen GGUF directamente.
- Latencia y throughput: no disponibles. Al ser un MoE de 30B totales, el rendimiento dependerá fuertemente de los parámetros activos por token, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B-Uncensored-v1-APEX | 30,06B (MoE) | no disponible | 36 | Apache 2.0 | GGUF |
| Tencent Hy-MT2-30B-A3B (base) | 30,06B (MoE) | no disponible | 36 | no disponible en la información | BF16 / safetensors |
| alphaZimuth Hy-MT2-30B-A3B-Uncensored-Heretic-APEX | mismo base | no disponible | 36 | Apache 2.0 | GGUF con Imatrix |
| NLLB-200 (referencia multilingüe) | hasta 54B | 512 tokens | 200 | CC-BY-NC | safetensors |

La comparación con NLLB-200 es solo orientativa: aquel es un modelo encoder-decoder dedicado a traducción con licencia no comercial, mientras que este es decoder-only, cubre menos idiomas pero permite uso comercial bajo Apache 2.0. No se dispone de datos de benchmarks que permitan comparar calidad de traducción entre ambos.

## Limitaciones y advertencias

- Versión marcada como legacy por el propio autor: no se recomienda para descargas nuevas y se mantiene solo como referencia histórica y para comparación.
- Degradación de calidad de traducción documentada en algunas variantes de cuantización, con errores de traducción adicionales respecto al modelo original.
- Seguimiento de instrucciones más débil en algunos casos tras la ablación.
- Aparición ocasional de salidas `think` durante la traducción, un artefacto no deseado que puede contaminar el texto de salida si no se filtra.
- Cuantizaciones sin calibración Imatrix, lo que el autor identifica como causa probable de parte de los problemas de calidad.
- La ablación reduce rechazos, pero no elimina sesgos del modelo base; no hay evaluación de sesgo publicada.
- Riesgo de alucinación inherente a los modelos generativos, agravado en pares de idiomas con pocos datos de entrenamiento (bo, ug, mn, kk).
- No hay datos publicados sobre longitud de contexto, parámetros activos ni composición del dataset, lo que dificulta estimar su comportamiento en documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base de Tencent no imponga restricciones adicionales no reflejadas en esta ficha.
- Las evaluaciones presentadas son preliminares y no sustituyen a una validación propia antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF
- Versión recomendada por el autor: https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-Uncensored-Heretic-APEX-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Pesos previos usados en la versión Heretic: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic
- Proyecto APEX de cuantización: https://github.com/localai-org/apex-quant
