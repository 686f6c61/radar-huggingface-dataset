# Roberto2799/jusbrasil-encoder-citacoes

## Resumen

El encoder de citaciones jurídicas es un modelo de clasificación de tokens (NER con etiquetas BIO) desarrollado por el usuario Roberto2799 para el Desafío Jusbrasil × BRACIS 2026. Se trata de un ajuste fino de BERTimbau-base (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de 108.336.389 parámetros, especializado en marcar dos tipos de cita en textos jurídicos en portugués: `JUR` (jurisprudencia, es decir, acórdãos y súmulas) y `LEI` (artículos de ley con la norma identificada). El modelo no se distribuye como solución autónoma: según su propia model card, funciona como red de seguridad junto a reglas escritas a mano dentro de un verificador de citas.

La relevancia del modelo es acotada pero concreta: los sistemas de verificación de citas jurídicas suelen basarse en expresiones regulares y heurísticas, que fallan ante variaciones de formato, ruido de OCR o referencias implícitas. Este encoder cubre ese hueco añadiendo únicamente los tramos que las reglas no detectan, y cada tramo pasa después por filtros adicionales antes de consolidarse como cita. Su tamaño reducido (0,4 GB de repositorio) y su inferencia en CPU lo hacen desplegable sin infraestructura de GPU.

El modelo está publicado con licencia MIT, soporta únicamente portugués, y su ventana de contexto efectiva de trabajo es de 510 tokens con solapamiento de 128 durante el entrenamiento y la inferencia, sobre la arquitectura BERT estándar de 512 posiciones. No tiene descargas ni valoraciones registradas en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), ajuste fino de BERTimbau-base |
| Parametros totales | 108.336.389 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en el modelo base; ventana de trabajo de 510 tokens con solapamiento de 128 |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; pesos en safetensors) |
| Idiomas soportados | Portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification (NER con etiquetas BIO) |
| Etiquetas | O, B-JUR, I-JUR, B-LEI, I-LEI |
| Modelo base | neuralmind/bert-base-portuguese-cased (revision 94d69c95f98f7d5b2a8700c420230ae10def0baa) |
| Dataset de entrenamiento | Roberto2799/jusbrasil-sintetico-diversificado (capas 1 y 2), LeNER-Br (train) y 14 documentos de desarrollo del desafio |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base, sin cabezas adicionales más allá de la capa de clasificación de tokens para las cinco etiquetas BIO. Parte de BERTimbau-base en la revisión fijada `94d69c95f98f7d5b2a8700c420230ae10def0baa`, cuyos pesos se cargaron desde la conversión automática a safetensors (revisión `4a78cfbf83c9c97533dd6d6694ca4323029ff061`), con contenido idéntico al `pytorch_model.bin` de la revisión original. Los spans se anotaron por carácter y se convirtieron a BIO por token, con ventana de 510 tokens y solapamiento de 128.

El entrenamiento combinó tres fuentes: datos sintéticos propios en dos capas (160 documentos por capa), la división `train` de LeNER-Br (50 documentos, con conversión a la convención del desafío: solo jurisprudencia de STF, STJ, TST, TSE y STM se etiqueta como `JUR`; el número del propio proceso y los casos ambiguos quedan fuera de la pérdida; `LEGISLACAO` solo pasa a `LEI` si aparece "art." seguido de dígito) y 14 documentos de la muestra de desarrollo del desafío, que no se redistribuyen. La mezcla incluye todas las ventanas con cita, un tercio de ventanas solo con `O` procedentes de LeNER-Br, y una muestra repetida cuatro veces, totalizando 1.227 ventanas por época.

Los hiperparámetros fueron AdamW con learning rate 5e-5, 5 épocas (385 pasos), lote de 16, calentamiento del 10 %, decaimiento de 0,01, precisión fp16 y semilla 0. El ajuste se ejecutó en una GPU T4 en 168 segundos con un pico de 5,05 GB de VRAM. No se documenta RLHF, DPO ni ninguna innovación de decodificación: es un ajuste supervisado de NER convencional.

## Capacidades

- Detección de citas de jurisprudencia (`JUR`), distinguiendo acórdãos y súmulas de tribunales superiores brasileños (STF, STJ, TST, TSE, STM).
- Detección de citas de artículos de ley (`LEI`), con identificación de la norma asociada al artículo.
- Etiquetado a nivel de token con esquema BIO y evaluación por solapamiento (IoU ≥ 0,5 por tramo).
- Procesamiento de documentos jurídicos en portugués con ruido de OCR, el escenario objetivo declarado.
- Integración como componente de post-proceso: rellena huecos que las reglas no cubren, no sustituye al sistema completo.
- Inferencia determinista en CPU, pensada para dar la misma salida en ejecuciones repetidas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación, no generativo.
- No tiene capacidades multilingües ni de visión, audio o modo de pensamiento.

## Casos de uso

- Verificación de citas en escritos jurídicos: el encoder marca los tramos de jurisprudencia y de legislación que las reglas no han detectado, y esos tramos se validan después contra un repositorio de sentencias y normas. Es el uso previsto por el autor y para el que existen métricas de sistema en LeNER-Br `test`, donde la combinación de reglas y encoder eleva los artículos de ley detectados de 115/202 a 173/202.
- Enriquecimiento de bases documentales jurídicas: procesar lotes de pareceres y sentencias para extraer automáticamente referencias a acórdãos y artículos, alimentando índices de búsqueda o grafos de citas.
- Preprocesado para sumarización o búsqueda jurídica: aislar las citas antes de pasarlas a un sistema de recuperación permite normalizar las referencias y enlazarlas con su fuente oficial.
- Auditoría de cumplimiento normativo en textos internos: localizar los artículos de ley invocados en contratos, informes o dictámenes y comprobar que la referencia sigue vigente.
- Control de calidad de digitalizaciones OCR: al tolerar ruido de OCR y ventanas solapadas, el modelo ayuda a recuperar citas que los patrones exactos pierden por errores tipográficos o de reconocimiento.
- Detección de citas en corpus para investigación empírica: medir qué tribunales y qué normas se citan con más frecuencia en un conjunto de documentos, siempre que el corpus se ajuste al dominio cubierto por el desafío.
- Componente de un pipeline de validación legal en producción: dado su consumo en CPU y su tamaño de 0,4 GB, puede ejecutarse como servicio ligero previo a un verificador de citas más costoso, actuando como filtro de candidatos.

## Benchmarks y rendimiento

Evaluación del encoder solo, con criterio de acierto por IoU ≥ 0,5 por tramo, según los datos publicados en la model card:

| Conjunto | JUR (aciertos / total) | Precision JUR | LEI (aciertos / total) | Precision LEI |
|---|---|---|---|---|
| LeNER-Br `dev` | 15/22 | 0,714 | 120/127 | 0,856 |
| Sintetico, control (dos capas) | 164/164 | 1,0 | 46/46 | 1,0 |
| Muestra del desafio, control | 76/76 | 0,987 | 15/15 | 1,0 |

Evaluación dentro del sistema completo (reglas + encoder, con los filtros aplicados) sobre `test` de LeNER-Br, que no se usó para ajustar nada:

| Categoria | Solo reglas | Reglas + encoder |
|---|---|---|
| Jurisprudencia de STF/STJ/TST/TSE/STM | 58/74 | 64/74 |
| Articulos de ley | 115/202 | 173/202 |

Los valores de las muestras de control (sintético y muestra del desafío) son muy altos porque proceden del mismo tipo de datos usados en el ajuste; no deben interpretarse como rendimiento generalizable. No se publican resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales, y no tendrían sentido para un modelo de clasificación de tokens.

## Requisitos de hardware

- Peso de los pesos: 108.336.389 parámetros, aproximadamente 433 MB en fp32, 217 MB en fp16 y 108 MB en int8 (estimación aritmética a partir del número de parámetros; no hay cifras publicadas por el autor).
- VRAM estimada para inferencia: menos de 1 GB en fp32 con lote pequeño, holgadamente dentro de cualquier GPU consumer. El pico declarado durante el entrenamiento fue de 5,05 GB en una T4, que corresponde a entrenamiento con lote 16 y fp16, no a inferencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (T4, GTX 1650, RTX 3060, RTX 4090, A100, H100). El modelo no necesita GPU: el autor declara explícitamente que la inferencia del sistema se ejecuta en CPU para garantizar reproducibilidad entre ejecuciones.
- Encaje en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU. No hay obstáculo de memoria.
- Opciones de despliegue: pipeline `token-classification` de transformers, exportación a ONNX Runtime, TorchScript o servidores de inferencia ligeros. vLLM, llama.cpp, Ollama y TGI no son las herramientas naturales para un encoder BERT de 108M parámetros ni están documentadas por el autor.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el del entrenamiento (168 segundos en una T4 para 5 épocas), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Roberto2799/jusbrasil-encoder-citacoes | 108.336.389 | 512 (ventana de 510 con solapamiento de 128) | NER de citas juridicas en portugues (JUR/LEI) | MIT | Publicados en la model card (ver seccion de benchmarks) |
| neuralmind/bert-base-portuguese-cased (BERTimbau-base) | 108.336.389 (mismo backbone) | 512 | Modelo de lenguaje enmascarado en portugues; no hace NER de citas | MIT | No disponible en la informacion proporcionada |
| Modelos entrenados sobre LeNER-Br | no disponible | no disponible | NER juridico en portugues con esquema de etiquetas propio | no disponible | El autor reporta la evaluacion de su modelo sobre la division `dev` de LeNER-Br, pero no se aportan cifras de terceros para comparar directamente |
| Otros NER juridicos en portugues | no disponible | no disponible | NER juridico | no disponible | no disponible |

La comparación más directa posible es con su propio modelo base: comparten backbone, número de parámetros y licencia, pero BERTimbau-base no ha sido ajustado para etiquetar citas, de modo que no existe una línea base pública de comparación en esta tarea concreta dentro de la información disponible.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no fue diseñado para usarse solo: es una red de seguridad que añade tramos donde las reglas no encuentran nada, y cada tramo pasa por filtros antes de convertirse en cita.
- Los rótulos siguen la convención del desafío, que difiere de la de LeNER-Br: por ejemplo, el número del propio proceso no se considera cita. Reutilizar el modelo con otra convención de anotación producirá etiquetas incoherentes con el nuevo esquema.
- Dominio restringido: está pensado para los documentos del desafío (pareceres jurídicos en portugués con ruido de OCR) y para las citas que cubre ese acervo. Fuera de ese ámbito el rendimiento no ha sido medido.
- Posible sobreajuste a los datos sintéticos: las métricas de control (1,0 de precisión en el conjunto sintético) reflejan datos generados por el mismo equipo y no deben leerse como capacidad general.
- Las cifras de la muestra de control del desafío se calculan sobre 14 documentos de desarrollo, un tamaño que no permite conclusiones robustas.
- Riesgo de falsos positivos y de tramos mal delimitados fuera del dominio: no se documenta calibración de umbrales ni análisis de errores distintos del IoU ≥ 0,5 reportado.
- Sesgos conocidos: no disponible. El autor no publica ningún análisis de sesgo demográfico, lingüístico o de tribunal.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo equivalente de marcar como cita un tramo que no lo es. Por eso el sistema aplica filtros posteriores.
- Limitación de idioma: solo portugués. No hay soporte para castellano ni para otros idiomas.
- Limitación de contexto: 512 posiciones del backbone BERT, con ventana de trabajo de 510 tokens y solapamiento de 128. Documentos largos requieren segmentación y posterior consolidación de resultados.
- Licencia MIT, igual que el modelo base (BERTimbau, MIT, © NeuralMind); el aviso de licencia del modelo original se aplica a este derivado. No se documentan restricciones adicionales para uso comercial, pero conviene verificar los términos de los conjuntos de datos de terceros (en particular LeNER-Br) si se redistribuye un modelo reentrenado con ellos.
- Los 14 documentos de la muestra de desarrollo del desafío no se redistribuyen en este repositorio, por lo que no pueden reproducirse los resultados exactos de control a partir de los artefactos publicados.
- Ausencia total de adopción registrada (0 descargas, 0 likes) y publicación reciente (creado el 24 de septiembre de 2026, actualizado el 25 de septiembre de 2026): no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roberto2799/jusbrasil-encoder-citacoes
- Modelo base BERTimbau-base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset sintético del equipo: https://huggingface.co/datasets/Roberto2799/jusbrasil-sintetico-diversificado
- Repositorio LeNER-Br: https://github.com/peluz/lener-br
- Manifiesto de entrenamiento: archivo `manifesto_treino.json` dentro del repositorio del modelo
- Desafío Jusbrasil × BRACIS 2026: no disponible (no se proporciona URL en la informacion disponible)
