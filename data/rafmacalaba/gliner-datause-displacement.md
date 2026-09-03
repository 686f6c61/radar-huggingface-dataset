# rafmacalaba/gliner-datause-displacement

## Resumen

El modelo `rafmacalaba/gliner-datause-displacement` es un fine-tune del modelo `urchade/gliner_large-v2.1` (GLiNER) especializado en la extracción de menciones de uso de datos (data-use mentions) con una única clase `DATA_MENTION`. Ha sido desarrollado por el usuario `rafmacalaba` y está pensado para tareas de reconocimiento de entidades nombradas (NER) en el dominio del uso de datos, donde se distingue entre menciones reales con valor analítico o declarativo (T1 evidencial ∪ T2 declaración) y fragmentos no relevantes (T3/junk). El modelo se entrenó sobre el dataset `rafmacalaba/data-use-mentions-tiered`, una versión "tiered" donde los spans T3/junk se tratan como negativos duros sin etiquetar, lo que obliga al extractor a centrarse únicamente en los límites de la mención, dejando la recuperación de la especificidad para un modelo posterior.

La relevancia de este modelo radica en su enfoque específico para el análisis de textos que describen usos de datos, un área con aplicaciones en cumplimiento normativo, revisión de políticas de privacidad y gobernanza de datos. Al ser un fine-tune de GLiNER, hereda la arquitectura ligera y eficiente de este tipo de modelos, aunque no se proporcionan detalles técnicos completos en la información disponible. El repositorio tiene un tamaño de 2.0 GB, lo que sugiere un modelo de dimensiones considerables, pero no se especifican parámetros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de `urchade/gliner_large-v2.1` (arquitectura no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors o binarios de PyTorch, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `urchade/gliner_large-v2.1`, un modelo GLiNER (Generalist and Lightweight Model for Named Entity Recognition) basado en transformer. La información disponible no detalla la arquitectura interna del modelo base, pero GLiNER suele emplear codificadores tipo BERT o DeBERTa. El entrenamiento se realizó sobre el dataset `rafmacalaba/datause-displacement-reviewed` (config `gliner_reviewed`), con 5 épocas, learning rate de 5e-06, batch size de 16 y precisión bf16. La selección del checkpoint se hizo mediante un barrido posterior de las épocas, eligiendo el que mejor valor de span-F0.5 obtenía en validación, sin usar la pérdida de evaluación como criterio.

El dataset de entrenamiento es la versión "tiered" de `rafmacalaba/data-use-mentions`, donde los spans T3/junk (no menciones) se convierten en negativos duros sin etiquetar, manteniendo el texto original. Esto fuerza al modelo a aprender únicamente los límites de las menciones reales (T1 evidencial ∪ T2 declaración), mientras que la clasificación de especificidad se delega a un modelo SFT multitarea aguas abajo. No se mencionan técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales.

## Capacidades

- Extracción de menciones de uso de datos (data-use mentions) con una única clase `DATA_MENTION`, que abarca menciones con uso analítico o declarativo (T1 evidencial ∪ T2 declaración).
- Reconocimiento de entidades nombradas (NER) de tipo token-classification, especializado en el dominio de uso de datos.
- Capacidad de distinguir entre menciones reales y fragmentos no relevantes (T3/junk) gracias al entrenamiento con negativos duros.
- No se reportan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo no incluye la recuperación de especificidad (p. ej., si el uso es evidencial o declarativo), que se realiza en un paso posterior con otro modelo.

## Casos de uso

Dado que la información disponible no documenta casos de uso específicos, se proponen aplicaciones plausibles basadas en la naturaleza del modelo (extracción de menciones de uso de datos). Estas son inferencias razonables, no afirmaciones verificadas.

- Revision automatizada de politicas de privacidad: el modelo puede identificar menciones de uso de datos en textos legales, facilitando la auditoria de cumplimiento normativo (p. ej., RGPD) al localizar frases que describen finalidades de tratamiento.
- Analisis de contratos de tratamiento de datos: en acuerdos entre responsables y encargados, el modelo extrae las clausulas que mencionan usos de datos, permitiendo una comparacion rapida entre documentos.
- Monitorizacion de avisos legales en sitios web: al integrarse en un pipeline de procesamiento de texto, puede detectar automaticamente secciones que describen usos de datos en paginas web, ayudando a mantener actualizadas las politicas.
- Investigacion academica sobre gobernanza de datos: los investigadores pueden usar el modelo para anotar corpus de documentos relacionados con datos, acelerando la creacion de datasets etiquetados.
- Clasificacion de documentos por tipo de uso de datos: aunque el modelo solo extrae menciones, su salida puede alimentar un clasificador posterior que determine si un documento declara usos analiticos, declarativos o ambos.
- Deteccion de inconsistencias en textos legales: al extraer menciones de uso de datos, se pueden comparar con las finalidades declaradas en otras secciones, identificando posibles contradicciones.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre un holdout tiered, con matching hungaro agnóstico de etiquetas y jaccard >= 0.5. Los resultados se presentan para distintos umbrales de confianza:

| thr | tp | fp | fn | precision | recall | f0.5 | f1 | t3_leak | t3_leak% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.10 | 288 | 610 | 32 | 0.3207 | 0.9000 | 0.3681 | 0.4729 | 153 | 25.1% |
| 0.20 | 271 | 448 | 49 | 0.3769 | 0.8469 | 0.4240 | 0.5217 | 116 | 25.9% |
| 0.30 | 254 | 341 | 66 | 0.4269 | 0.7937 | 0.4704 | 0.5552 | 90 | 26.4% |
| 0.40 | 237 | 250 | 83 | 0.4867 | 0.7406 | 0.5225 | 0.5874 | 67 | 26.8% |
| 0.50 | 205 | 169 | 115 | 0.5481 | 0.6406 | 0.5644 | 0.5908 | 52 | 30.8% |
| 0.60 | 177 | 95 | 143 | 0.6507 | 0.5531 | 0.6286 | 0.5980 | 36 | 37.9% |
| 0.70 | 128 | 44 | 192 | 0.7442 | 0.4000 | 0.6349 | 0.5203 | 19 | 43.2% |

El mejor F0.5 es 0.6349 (umbral 0.7) y el mejor F1 es 0.5980 (umbral 0.6). La columna `t3_leak` indica el número de falsos positivos que coinciden con spans T3/junk descartados; su porcentaje aumenta con el umbral, lo que sugiere que a mayor confianza, mayor proporción de fugas T3. El desglose por corpus (prwp y fcv) muestra 0 ejemplos y 0 spans, por lo que no aporta información útil.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. El tamaño del repositorio (2.0 GB) sugiere que el modelo es relativamente grande, pero no se especifican requisitos de VRAM, GPUs recomendadas, ni opciones de despliegue. Se desconoce si es compatible con vLLM, llama.cpp, Ollama u otras herramientas de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tune especializado de `urchade/gliner_large-v2.1`, pero no se mencionan alternativas de la misma categoría (extracción de menciones de uso de datos). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo extrae menciones de uso de datos con una única clase; no clasifica la especificidad (evidencial vs. declaración), que debe recuperarse con un modelo adicional aguas abajo.
- Presenta fugas T3 (t3_leak) que aumentan con el umbral de confianza, lo que indica que algunos falsos positivos corresponden a fragmentos no relevantes. Esto puede generar ruido en aplicaciones de producción.
- El entrenamiento se realizó sobre un dataset específico (data-use mentions tiered), por lo que su rendimiento en otros dominios o tipos de texto no está garantizado.
- No se especifican los idiomas soportados; aunque el nombre sugiere inglés, no hay confirmación.
- La licencia apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, por lo que se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner-datause-displacement
- Dataset de entrenamiento (tiered): https://huggingface.co/datasets/rafmacalaba/data-use-mentions-tiered
- Dataset original (menciones): https://huggingface.co/datasets/rafmacalaba/data-use-mentions
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1
