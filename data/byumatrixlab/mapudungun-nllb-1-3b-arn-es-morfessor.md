# byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` especializado en traducción automática de mapudungun (`arn`) a español (`es`). Lo desarrolla el equipo `byumatrixlab` en el contexto de un trabajo académico presentado en el Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026), centrado en tokenización morfológica para lenguas de bajos recursos.

La innovación principal no reside en la arquitectura —que es la del transformer encoder-decoder de NLLB-200 en su variante destilada— sino en el preprocesamiento: se aplica segmentación morfológica no supervisada con Morfessor al mapudungun antes de la traducción, lo que permite al modelo manejar mejor una lengua aglutinante con morfología compleja y escasos datos paralelos. El checkpoint corresponde a una condición experimental concreta del paper (tamaño 1.3B, dirección arn→es, preprocesamiento Morfessor).

El modelo es relevante para investigadores que trabajan en traducción de lenguas indígenas americanas, ya que demuestra que técnicas de segmentación morfológica combinadas con ajuste fino de modelos multilingües preentrenados mejoran el rendimiento en entornos de bajos recursos. Su licencia es restrictiva (no comercial), lo que limita su uso en producción pero lo mantiene útil como referencia de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled, m2m_100) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no verificada por el autor) |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | other (`nllb-and-corpus-derived-terms`: CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder con atención multi-cabeza estándar, destilado del NLLB-200 original de 54.500 millones de parámetros. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección mapudungun→español, con un preprocesamiento específico: segmentación morfológica no supervisada mediante Morfessor aplicada al texto en mapudungun, más la eliminación de marcadores de continuación `@@` en la salida mapudungun.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de traducción de este tipo). La contribución técnica destacable es la integración de Morfessor en el pipeline de preprocesamiento como estrategia para lenguas aglutinantes de bajos recursos, evaluada mediante chrF++ a nivel de oración.

## Capacidades

- Traducción automática unidireccional de mapudungun a español.
- Preprocesamiento morfológico integrado: el script `inference.py` aplica segmentación Morfessor al mapudungun de entrada y limpia marcadores `@@` en la salida.
- Manejo de texto en una lengua aglutinante con morfología rica gracias a la tokenización segmentada.
- Compatible con la API de `transformers` 4.x (carga como modelo de traducción NLLB).
- No soporta tool calling ni function calling (no es una capacidad de modelos de traducción NLLB).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del ajuste (arn, es); el resto de lenguas del NLLB base pueden degradarse tras el ajuste fino.

## Casos de uso

- Investigación en traducción de lenguas indígenas: sirve como checkpoint de referencia para reproducir los resultados del paper de Thompson et al. (2026) sobre tokenización morfológica en NLLB-200, permitiendo comparar condiciones con y sin Morfessor.
- Digitalización y traducción de documentación comunitaria: traducción de textos escritos en mapudungun (actas, materiales educativos, narrativa oral transcrita) al español para su difusión en contextos académicos o administrativos, con revisión humana obligatoria.
- Preservación lingüística y corpus paralelos: generación asistida de alineaciones arn-es para ampliar corpus paralelos de bajos recursos, usando el modelo como traductor inicial y validación por hablantes nativos.
- Herramientas educativas bilingües: apoyo a la enseñanza del mapudungun en contextos escolares o universitarios, traduciendo materiales del mapudungun al español para estudiantes no hablantes.
- Evaluación comparativa de técnicas de tokenización: banco de pruebas para medir el impacto de Morfessor frente a tokenización BPE estándar en tareas de traducción de lenguas aglutinantes.
- Prototipos de traducción asistida por ordenador (CAT) para traductores profesionales que trabajen con mapudungun, siempre en modo borrador y con licencia no comercial.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (nivel de oracion, media) | 45.40 | arn→es, tamano 1.3B, preprocesamiento Morfessor, pipeline corregido del paper |

No se han publicado en la informacion disponible resultados adicionales (BLEU, COMET, MMLU, HumanEval u otros) ni comparaciones numericas con modelos alternativos bajo condiciones identicas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos, con overhead de activaciones y cache que eleva el consumo real a unos 4-6 GB según longitud de secuencia y batch.
- VRAM estimada en int8: alrededor de 1,4 GB de pesos; en int4, en torno a 0,7 GB, aunque no se ha verificado la calidad de la cuantizacion para este checkpoint.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). Para batches grandes o despliegue en servidor, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (GTX 1660 Super 6 GB en cuantizacion, RTX 3060 12 GB en fp16 con batches pequenos).
- Opciones de despliegue: `transformers` (via `inference.py` del repo), vLLM (soporte de m2m_100 limitado, verificar), TGI (soporte NLLB parcial), llama.cpp/Ollama (no soportan m2m_100 de forma nativa).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor | 1.370 M | no disponible | arn, es | other (CC-BY-NC + CC BY-NC-SA) | Ajuste fino con Morfessor; chrF++ 45.40 arn→es |
| facebook/nllb-200-distilled-1.3B | 1.300 M aprox. | 1024 tokens (tipico NLLB) | 200 idiomas | CC-BY-NC 4.0 | Modelo base; sin ajuste especifico a mapudungun |
| facebook/nllb-200-distilled-600M | 600 M aprox. | 1024 tokens (tipico NLLB) | 200 idiomas | CC-BY-NC 4.0 | Version mas ligera del mismo modelo base; menor calidad esperada en lenguas de bajos recursos |
| facebook/m2m100_1.2B | 1.200 M aprox. | 1024 tokens (tipico M2M-100) | 100 idiomas | MIT (verificar) | Arquitectura predecesora de NLLB; no incluye mapudungun como idioma explicito |

No se dispone de resultados de benchmarks publicados para los modelos alternativos en la direccion arn→es bajo el mismo pipeline, por lo que la comparacion numerica directa no esta disponible.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial esta prohibido y cualquier obra derivada debe compartirse bajo la misma licencia (ShareAlike).
- Riesgo de alucinacion y traducciones inventadas, especialmente en terminos tecnicos, neologismos o variantes dialectales del mapudungun poco representadas en el corpus.
- Sesgos derivados del corpus de Duan et al.: posible sobrerrepresentacion de ciertas variedades o dominios (textos religiosos, narrativa oral) y sesgos de genero o culturales del material original.
- Cobertura limitada a la direccion arn→es; el modelo no esta disenado para es→arn ni para otros pares.
- El ajuste fino sobre NLLB-200 puede degradar el rendimiento en los otros ~200 idiomas del modelo base.
- Requiere el preprocesamiento especifico (Morfessor y limpieza de `@@`) para funcionar correctamente; un uso directo sin `inference.py` puede producir salidas con marcadores morfologicos residuales.
- Contexto maximo no documentado en la model card; asumir el limite tipico de NLLB (1024 tokens) es una suposicion no verificada.
- Modelo de investigacion con solo 7 descargas y 0 likes en el momento de la consulta: ecosistema de soporte minimo, sin garantias de mantenimiento.
- No apto para produccion sin revision humana: la calidad chrF++ 45.40 es orientativa y variable por dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor
- Modelo base NLLB-200 distilled 1.3B: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of AmericasNLP 2026.
- Repositorio de Morfessor: https://github.com/aalto-speech/morfessor
- Paper original de NLLB-200: https://arxiv.org/abs/2207.04672
- Workshop AmericasNLP: https://americasnlp.github.io/
