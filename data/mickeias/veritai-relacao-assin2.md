# mickeias/veritai-relacao-assin2

## Resumen

VeritAI: relação trecho × afirmação (ASSIN 2) es un clasificador binario de inferencia de lenguaje natural (NLI) en portugués que estima si un fragmento de texto respalda o no una afirmación dada. Lo publica el usuario mickeias en Hugging Face como parte de VeritAI, el servicio de verificación de afirmaciones del proyecto FOMO (Fear of Missing Objectivity), desarrollado por un grupo de la Residencia en IA. No es un modelo generativo: es una regresión logística de 12 atributos que combina las salidas de cuatro codificadores públicos usados en modo congelado (paraphrase-multilingual-MiniLM-L12-v2, multilingual-MiniLMv2-L6-mnli-xnli, multilingual-e5-base y mDeBERTa-v3-base-xnli-multilingual-nli-2mil7).

Su interés práctico está en la relación calidad/coste: se ejecuta en CPU, no requiere GPU y en el conjunto de prueba de ASSIN 2 (2.448 pares) alcanza un macro-F1 de 0,897 con una probabilidad bien calibrada (ECE 0,018, Brier 0,075, AUC 0,960), frente a 0,887 del NLI mDeBERTa sin entrenamiento. Es una pieza de infraestructura para pipelines de fact-checking y de atribución de evidencia, no un producto final orientado al usuario.

Las cifras proceden de una única evaluación sobre ASSIN 2 y el autor advierte de que el rendimiento en textos periodísticos no se ha medido. El repositorio no declara licencia ni pipeline, y a fecha de la ficha acumula cero descargas y cero valoraciones, por lo que no cuenta con validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre 12 atributos extraídos de cuatro codificadores transformer congelados (stacking); no hay transformer entrenado de extremo a extremo |
| Parametros totales | 12 coeficientes más intercepto en el clasificador final; los cuatro codificadores congelados no se cuantifican en la model card, que solo indica una descarga inicial de aproximadamente 2,6 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en sentido generativo: clasifica pares (trecho, afirmación) y la ficha no documenta un límite de tokens por par |
| Tipos de cuantizacion | no aplica al artefacto final, que son coeficientes en JSON sin pickle; no se documentan versiones cuantizadas de los codificadores |
| Idiomas soportados | portugués (pt); entrenamiento y evaluación exclusivamente sobre ASSIN 2, portugués de Brasil |
| Licencia | no disponible |
| Formato de pesos | JSON (modelo.json con estandarización, coeficientes, intercepto y umbral); los cuatro codificadores se descargan del Hub en el formato publicado por cada autor, no especificado en la model card |
| Tarea | NLI binaria: «apoia» / «não apoia» (contradicción y neutralidad se agrupan en «não apoia») |
| Entrada | Par de textos: trecho (evidencia) y afirmação (claim) |
| Salida | Probabilidad de apoyo (prob_apoio) y etiqueta según el umbral 0,39 |
| Umbral de decisión | 0,39, elegido por macro-F1 máximo en validación |
| Entorno de referencia | Python 3.13.5, scikit-learn 1.9.1, torch 2.14.1 (CPU), transformers 5.19.0 |
| Repositorio y descargas | 0 descargas, 0 likes; ficha creada y actualizada el 9 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un metamodelo de stacking: ninguno de los cuatro codificadores se ajusta y toda la capacidad aprendida reside en una regresión logística. Los 12 atributos combinan similitud semántica, distribuciones NLI, solapamiento léxico y señales heurísticas: `v0_similaridade` (coseno en paraphrase-multilingual-MiniLM-L12-v2), `v0_apoio`, `v0_neutro` y `v0_contradicao` (NLI de multilingual-MiniLMv2-L6-mnli-xnli sobre el par trecho-afirmación), `v1_similaridade` (coseno en multilingual-e5-base con los prefijos `query:` y `passage:`), `v1_apoio`, `v1_neutro` y `v1_contradicao` (NLI de mDeBERTa-v3-base-xnli-multilingual-nli-2mil7), `jaccard`, `cobertura_afirmacao` (palabras en común), `negacao_so_de_um_lado` (negación presente en solo uno de los textos) y `razao_tamanho` (longitud de la afirmación dividida por la del trecho).

El entrenamiento usa el corpus ASSIN 2 con la división oficial: 6.500 pares de entrenamiento, 500 de validación y 2.448 de prueba, con las dos clases equilibradas. Los pares están etiquetados por personas como ENTAILMENT o NONE; la primera frase actúa como trecho y la segunda como afirmação. La regularización se fijó en `C = 0,1` mediante validación cruzada de 5 partes sobre el entrenamiento con `StratifiedGroupKFold`, agrupando por la frase del trecho para evitar filtración entre particiones. El umbral 0,39 se eligió como el de mayor macro-F1 en validación, y el conjunto de prueba se usó una sola vez, después de fijar todos los hiperparámetros. El artefacto distribuido es `modelo.json`, que guarda la estandarización, los coeficientes, el intercepto y el umbral, sin serialización con pickle.

## Capacidades

- Inferencia de lenguaje natural en portugués: decidir si un trecho respalda una afirmación, con probabilidad asociada.
- Probabilidad calibrada dentro del dominio ASSIN 2 (ECE 0,018 y Brier 0,075), lo que permite usar el umbral como control operativo entre falsas aprobaciones y cobertura.
- Umbral configurable: subirlo por encima de 0,39 reduce las falsas aprobaciones (0,128 en el punto de operación por defecto) a costa de revocación.
- Ejecución en CPU sin GPU y comportamiento determinista, sin muestreo estocástico.
- Multilingüismo potencial heredado de los codificadores (MiniLM multilingüe, e5 multilingüe, mDeBERTa xnli multilingüe), aunque el clasificador solo se ha entrenado y evaluado con datos en portugués de Brasil, por lo que no hay garantía en otros idiomas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multietapa.
- No genera texto, no hace resúmenes, no traduce ni responde preguntas.
- No dispone de modo thinking, visión, audio ni entrada multimodal.
- No mantiene contexto conversacional ni ventana de diálogo.

## Casos de uso

- Filtrado de evidencia en pipelines de fact-checking: dada una afirmación extraída de una noticia y un conjunto de fragmentos recuperados por un buscador, el modelo puntúa qué fragmentos la respaldan y descarta el resto antes de pasarlos a un revisor o a un modelo generador. Su coste en CPU permite aplicarlo a miles de pares sin escalar infraestructura.
- Verificación de atribución en sistemas RAG: comprobar si el pasaje recuperado respalda realmente la frase que ha generado el LLM, como filtro de groundedness barato y previo a una revisión más cara.
- Triaje en redacciones y unidades de verificación: ordenar las afirmaciones de un lote de textos por probabilidad de apoyo y enviar a revisión humana las que quedan por debajo del umbral, en lugar de revisarlas todas.
- Evaluación automática de fidelidad de resúmenes en portugués: comprobar frase a frase si cada oración del resumen está respaldada por el documento fuente, señalando posibles invenciones.
- Control de coherencia entre respuestas y base de conocimiento en atención al cliente: validar que la respuesta propuesta por un agente o por un chatbot no contradice el artículo de la base de conocimiento. La agrupación de contradicción y neutralidad en «não apoia» es adecuada para un aviso de revisión, no para una decisión automática.
- Auditoría de documentación técnica y normativa en portugués: detectar afirmaciones de manuales, FAQ o políticas internas que no están respaldadas por el texto de referencia, con especial utilidad en la detección de negaciones asimétricas, señal que el modelo incorpora de forma explícita.
- Anotación asistida de corpus NLI: preetiquetar pares trecho-afirmación para que los anotadores solo revisen los casos de baja confianza.
- Monitorización de cambios en bases de conocimiento: recalcular la relación entre afirmaciones publicadas y fragmentos actualizados para detectar cuándo una afirmación deja de estar respaldada por la fuente.

## Benchmarks y rendimiento

Resultados en el conjunto de prueba de ASSIN 2 (2.448 pares), con intervalos de confianza del 95 % por bootstrap de 1.000 reamostragens. «Falsas aprobaciones» es la fracción de pares que no apoyan y fueron marcados como «apoia».

| Metodo | Macro-F1 | Falsas aprobaciones | Brier | ECE | AUC |
|---|---|---|---|---|---|
| NLI v0 sin entrenamiento (rótulo más probable) | 0,791 [0,776; 0,807] | 0,205 [0,181; 0,227] | 0,157 | 0,118 | 0,882 |
| NLI v1 sin entrenamiento (rótulo más probable) | 0,887 [0,873; 0,899] | 0,095 [0,080; 0,111] | 0,091 | 0,058 | 0,944 |
| Este modelo | 0,897 [0,885; 0,909] | 0,128 [0,109; 0,147] | 0,075 | 0,018 | 0,960 |

Lectura de los datos según el propio autor: en macro-F1 el modelo y el NLI v1 sin entrenamiento están prácticamente empatados, con una diferencia pareada de +0,011 e intervalo [-0,001; +0,022]; el modelo produce más falsas aprobaciones que el NLI v1 aislado (0,128 frente a 0,095), error que un umbral más alto reduce a costa de revocación; y la ventaja clara está en la calidad de la probabilidad (Brier, ECE y AUC), métricas para las que no se calcularon intervalos de confianza. No hay resultados en otros corpus.

## Requisitos de hardware

- Inferencia en CPU: el autor indica explícitamente que el modelo funciona en CPU y que el paso más lento es el NLI de mDeBERTa.
- Primera ejecución: descarga de los cuatro codificadores, aproximadamente 2,6 GB.
- VRAM: no aplica si se ejecuta en CPU; no se documenta un requisito de VRAM en GPU. No disponible la memoria RAM exacta necesaria más allá del tamaño de los pesos descargados.
- GPU recomendadas: no documentadas. El entorno de referencia usa torch 2.14.1 en CPU, sin indicación de compatibilidad o aceleración CUDA.
- GPU de consumo: no aplica como requisito, puesto que no necesita GPU. Podría usarse una GPU para acelerar los codificadores, pero no está documentado ni medido.
- Opciones de despliegue: script Python propio (`prever.py` con `requirements.txt`) y uso como clase `Classificador` desde código Python. No hay integración con vLLM, llama.cpp, Ollama ni TGI, herramientas que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se publican medidas de latencia por par ni de pares por segundo.

## Comparativa con modelos similares

| Modelo | Enfoque | Macro-F1 (ASSIN 2) | Falsas aprobaciones | Brier | ECE | ¿Entrenamiento específico? | Licencia |
|---|---|---|---|---|---|---|---|
| VeritAI relación trecho × afirmación | Regresión logística sobre 12 atributos de 4 codificadores | 0,897 | 0,128 | 0,075 | 0,018 | Sí (ASSIN 2) | no disponible |
| NLI v1: mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 sin entrenamiento | NLI zero-shot, rótulo más probable | 0,887 | 0,095 | 0,091 | 0,058 | No | la del modelo base, no indicada en esta ficha |
| NLI v0: multilingual-MiniLMv2-L6-mnli-xnli sin entrenamiento | NLI zero-shot, rótulo más probable | 0,791 | 0,205 | 0,157 | 0,118 | No | la del modelo base, no indicada en esta ficha |

No se dispone de comparación con otros clasificadores NLI específicos para portugués, ni con modelos generativos usados como verificadores, en la información proporcionada.

## Limitaciones y advertencias

- No es un detector de noticias falsas ni verifica hechos por sí solo: únicamente estima si un trecho dado respalda una afirmación dada. Cualquier uso como veredicto de veracidad es un uso indebido.
- Dominio de entrenamiento restringido: ASSIN 2 contiene frases cortas que describen escenas, sin números, fechas, nombres propios ni lenguaje periodístico. El rendimiento en textos de noticia no se ha medido.
- Fallos documentados con cantidades: en pruebas internas el modelo se equivoca con frecuencia en casos que dependen de cifras («dobrou», «aumentou 25%», «pontos percentuais»).
- Etiqueta binaria: «contradiz» y «não tem informação suficiente» quedan agrupados en «não apoia», de modo que el modelo no distingue contradicción de mera ausencia de evidencia.
- Optimismo del umbral: hay 11 pares idénticos entre entrenamiento y validación en ASSIN 2, por lo que el umbral de 0,39 elegido en validación puede estar sesgado al alza.
- Calibración limitada al dominio: la probabilidad solo se comprobó en ASSIN 2 y no debe presentarse como «probabilidad de que la noticia sea verdadera».
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial; conviene aclararlo con el autor antes de integrarlo en producción.
- Madurez: repositorio con 0 descargas y 0 likes, sin pipeline declarado ni validación externa; creado y actualizado el mismo día en octubre de 2026.
- Dependencia de terceros: el rendimiento y las licencias de los cuatro codificadores subyacentes condicionan el uso del conjunto.
- Colisión de nombres: los resultados de búsqueda corresponden a proyectos distintos con el mismo nombre (veritai.app, veritai.org), sin relación con este modelo.
- Sesgos: la model card no documenta un análisis de sesgos demográficos, geográficos o temáticos; el corpus ASSIN 2 es de portugués de Brasil, lo que puede introducir variación de registro frente a otras variantes del idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mickeias/veritai-relacao-assin2
- Dataset ASSIN 2: https://huggingface.co/datasets/nilc-nlp/assin2
- Codificador paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Codificador multilingual-MiniLMv2-L6-mnli-xnli: https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli
- Codificador multilingual-e5-base: https://huggingface.co/intfloat/multilingual-e5-base
- Codificador mDeBERTa-v3-base-xnli-multilingual-nli-2mil7: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Repositorio con `prever.py` y `requirements.txt`: no disponible (no se enlaza en la model card)
- Artículo o informe técnico del proyecto FOMO / VeritAI: no disponible
- Resultados de búsqueda web consultados: https://artificialanalysis.ai/models, https://artificialanalysis.ai/, https://veritai.app/, https://www.veritai.org/, https://microsoft.ai/models/mai-transcribe-2/ (ninguno de ellos está relacionado con este modelo)
