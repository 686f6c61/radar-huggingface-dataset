# c-ho/2026-11-27-xlmr-large-baseline_2_5

## Resumen

El modelo `c-ho/2026-11-27-xlmr-large-baseline_2_5` es un ajuste fino (fine-tuning) de `FacebookAI/xlm-roberta-large` para la tarea de token-classification, es decir, etiquetado a nivel de token. Lo publica el usuario `c-ho` en Hugging Face bajo licencia MIT. Se trata de un modelo de tipo baseline, generado automaticamente con la libreria `transformers` a traves del `Trainer`, y su proposito parece ser servir como referencia para una tarea de reconocimiento de entidades linguisticas, a juzgar por las etiquetas de evaluacion (fenomenos fonologicos, morfologicos, sintacticos, semanticos, etc.).

El modelo hereda la arquitectura XLM-RoBERTa large, un transformer encoder-only con 558.874.657 parametros totales, disenado originalmente para comprension multilingue. Al ser un modelo de clasificacion de tokens, no es un modelo generativo: produce una etiqueta por cada token de entrada, lo que lo hace adecuado para tareas de extraccion de informacion y etiquetado secuencial.

Su relevancia es limitada y acotada: se trata de un baseline experimental sin model card completa (el autor indica "More information needed" en varias secciones), con cero descargas y cero likes en el momento de la consulta. Resulta util como punto de partida o comparacion para quien trabaje en tareas de etiquetado linguistico, pero no esta pensado para uso en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa large) |
| Parametros totales | 558.874.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large soporta hasta 512 tokens, dato no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder-only de tipo RoBERTa entrenado de forma multilingue. Sobre esa base se ha realizado un ajuste fino supervisado para token-classification, con una cabeza de clasificacion por token. No se dispone de informacion sobre la composicion del dataset de entrenamiento: la model card indica "unknown dataset" y "More information needed" en las secciones de datos y procedimiento.

Los hiperparametros de entrenamiento si estan disponibles: learning rate de 5e-05, batch size de entrenamiento de 8 con acumulacion de gradientes de 16 (batch efectivo de 128), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup del 10%, 10 epocas y precision mixta nativa (AMP). El conjunto de etiquetas de evaluacion sugiere una taxonomia de conceptos linguisticos (fenomenos academicos, discursivos, grafemicos, lexicos, morfologicos, etc.), aunque no se detalla el origen ni el tamano del corpus.

## Capacidades

- Etiquetado de tokens (token-classification): asigna una etiqueta a cada token de entrada, orientado a tareas de reconocimiento de entidades o fenomenos linguisticos.
- Clasificacion de conceptos linguisticos: la evaluacion incluye categorias como fenomenos fonologicos, morfologicos, sintacticos, semanticos, lexicos y discursivos.
- Comprension de texto multilingue heredada de XLM-RoBERTa (no confirmada explicitamente en la informacion disponible).
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Etiquetado de corpus linguisticos: el modelo puede anotar automaticamente fenomenos linguisticos en textos de investigacion, sirviendo como preanotador para revision humana en proyectos de linguistica computacional.
- Extraccion de terminos especializados: dado su rendimiento en categorias como "languagerelatedterm" (F1 0.7386) y "morphosyntacticphenomenon" (F1 0.7177), puede emplearse para identificar terminos tecnicos en dominios acotados.
- Baseline para experimentos de token-classification: util como referencia contra la que comparar modelos mas avanzados en tareas de etiquetado secuencial.
- Preprocesamiento en pipelines de NLP: puede integrarse como primer paso de anotacion antes de un modelo mas costoso o de una revision manual.
- Investigacion academica en taxonomias linguisticas: permite reproducir el esquema de evaluacion del autor (precision, recall, F1 por categoria) para estudios comparativos.
- Prototipado rapido: al estar en formato safetensors y ser compatible con `transformers`, se puede cargar con `AutoModelForTokenClassification` para pruebas de concepto en entornos de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (ultima epoca registrada, epoca 6):

| Metrica | Valor |
|---|---|
| Loss | 0.3121 (reportado en cabecera) / 0.2463 (epoca 6) |
| Precision | 0.5719 |
| Recall | 0.4914 |
| F1 | 0.5286 |
| Accuracy | 0.9509 |

Desglose por categoria (F1):

| Categoria | F1 |
|---|---|
| Academicdiscipline | 0.5385 |
| Ambiguouslydefinedconcept | 0.0 |
| Discoursephenomenon | 0.1935 |
| Graphemicphenomenon | 0.1481 |
| Languagerelatedterm | 0.7386 |
| Languageresourceinformation | 0.2645 |
| Lexicalphenomenon | 0.4559 |
| Morphologicalphenomenon | 0.5839 |
| Morphosyntacticphenomenon | 0.7177 |
| New Tag | 0.4521 |
| Otherlinguisticterm | 0.5188 |
| Phonologicalphenomenon | 0.6869 |
| Semanticphenomenon | 0.1392 |
| Syntacticphenomenon | 0.6079 |
| Topnode Dummy | 0.3328 |
| Unclassifiedlinguisticconcept | 0.4000 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El model-index oficial no contiene resultados (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 558 millones de parametros, en precision FP32 requiere aproximadamente 2,2 GB solo para los pesos; en FP16 alrededor de 1,1 GB. Con overhead de activaciones y batch, se recomienda al menos 4 GB de VRAM para inferencia en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM en FP16.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForTokenClassification`), `vLLM` no aplica (no es generativo), `llama.cpp` no aplica, `Ollama` no aplica. Para serving de token-classification se puede usar `transformers` con `pipeline` o `TGI` si se adapta la tarea.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c-ho/2026-11-27-xlmr-large-baseline_2_5 | 558,9 M | no disponible | Token-classification | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 558,9 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |
| xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |

La comparacion se limita al modelo base y a su variante base, ya que no se dispone de informacion sobre otros modelos ajustados a la misma taxonomia. El modelo evaluado es un fine-tuning del primero, por lo que comparte arquitectura y numero de parametros.

## Limitaciones y advertencias

- Model card incompleta: el autor indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento. No se conoce el dataset ni el dominio de aplicacion.
- Rendimiento desigual por categoria: varias categorias tienen F1 de 0.0 (Ambiguouslydefinedconcept) o muy bajo (Semanticphenomenon 0.1392, Graphemicphenomenon 0.1481, Discoursephenomenon 0.1935), lo que indica que el modelo no es fiable para esas clases.
- F1 global moderado (0.5286) con precision 0.5719 y recall 0.4914: el modelo comete errores tanto por falsos positivos como por falsos negativos.
- Riesgo de alucinacion: al ser un modelo discriminativo (no generativo), no "alucina" texto, pero puede asignar etiquetas incorrectas con alta confianza.
- Idiomas: no se especifican los idiomas soportados; aunque XLM-RoBERTa es multilingue, el fine-tuning puede haber sesgado el comportamiento hacia un idioma concreto no documentado.
- Licencia MIT: permite uso comercial, pero al no documentarse el dataset de entrenamiento no se puede garantizar el cumplimiento de derechos de terceros sobre los datos.
- No apto para produccion sin validacion: sin informacion sobre el dataset ni evaluacion en dominios reales, su uso en produccion requiere una evaluacion independiente.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/c-ho/2026-11-27-xlmr-large-baseline_2_5
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Resultados de busqueda web: no relevantes para este modelo (los enlaces devueltos tratan sobre Douchy y meteorologia, sin relacion con el modelo).
