# Rishabh157/spanmarker-wikiann-mdeberta

## Resumen

`Rishabh157/spanmarker-wikiann-mdeberta` es un modelo de reconocimiento de entidades nombradas (NER) multilingue publicado por Rishabh Kumar (Rishabh157) en HuggingFace. Se construye sobre el backbone encoder `microsoft/mdeberta-v3-base` (12 capas, 768 dimensiones ocultas, atencion posicional relativa desacoplada) y utiliza el framework SpanMarker, una formulacion de clasificacion de spans derivada de PL-Marker en la que cada candidato a entidad se marca con tokens de frontera [S_i, E_j] y se resuelve con supresion no maxima voraz. El ajuste es de parametros completos sobre el corpus WikiANN en siete idiomas (aleman, ingles, espanol, frances, italiano, portugues y sueco), con una taxonomia de tres tipos de entidad: persona (PER), organizacion (ORG) y localizacion (LOC).

El modelo cuenta con 277.536.772 parametros segun los pesos en safetensors, un orden de magnitud que lo situa en la gama media de los encoders multilingues de NER y que lo hace desplegable en GPU de consumo. Su interes practico radica en la combinacion de cobertura multilingue con una precision alta (88,85 %) en la validacion de WikiANN, lo que lo hace adecuado para tareas de extraccion donde los falsos positivos son costosos; el coste es una tasa de recuperacion mas baja (67,55 %), que implica que el modelo tiende a omitir entidades mas que a inventarlas.

El repositorio se publico en septiembre de 2026, no tiene descargas ni valoraciones registradas y los resultados de la model card estan marcados como no verificados (`verified: false`) en el model-index. Esto significa que las cifras deben tratarse como declaraciones del autor y no como resultados replicados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3) con cabecera de clasificacion de spans SpanMarker (PL-Marker); atencion posicional relativa desacoplada |
| Parametros totales | 277.536.772 (los pesos safetensors); la model card declara 278,8 M con todos los parametros activos |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 256 tokens de longitud maxima de secuencia durante el entrenamiento; el backbone mDeBERTa-v3-base admite hasta 512 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (FP32). No hay versiones GGUF, GPTQ, AWQ ni ONNX publicadas |
| Idiomas soportados | Aleman (de), ingles (en), espanol (es), frances (fr), italiano (it), portugues (pt), sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. El backbone es `microsoft/mdeberta-v3-base`, un encoder de 12 capas y 768 dimensiones ocultas entrenado con objetivos estilo ELECTRA y con atencion posicional relativa desacoplada, lo que le permite modelar dependencias a distintas distancias sin depender de embeddings posicionales absolutos. Sobre el se anade la cabecera SpanMarker: en lugar de etiquetar cada token con un esquema BIO, el modelo marca los limites del span candidato con tokens especiales [S_i, E_j] y clasifica cada candidato dentro de una ventana de 16 palabras como maximo; despues aplica supresion no maxima voraz para eliminar spans solapados. Esta formulacion suele dar precisiones mas altas que el etiquetado por token porque el modelo ve el span completo en lugar de decidir token a token.

El ajuste fue de parametros completos (sin LoRA ni adaptadores), durante 3 epocas y 26.934 pasos sobre WikiANN en sus siete idiomas. La configuracion declarada es: batch de 16 por dispositivo, precision mixta FP16, longitud de secuencia de 256 tokens, span maximo de 16 palabras, optimizador AdamW con tasa de aprendizaje 3.5e-5, scheduler coseno con calentamiento lineal, y un tiempo total de ejecucion de aproximadamente 4,17 horas. La model card no detalla la composicion exacta del split de entrenamiento ni si hubo etapas posteriores de RLHF o DPO; al tratarse de una tarea discriminativa de etiquetado, ese tipo de alineamiento no seria aplicable en cualquier caso.

## Capacidades

- Extraccion de entidades nombradas de tres tipos: PER (persona), ORG (organizacion) y LOC (localizacion o entidad geopolitica).
- Procesamiento multilingue en siete idiomas con una unica cabecera de clasificacion, sin necesidad de cargar un modelo distinto por idioma.
- Inferencia sobre frases y parrafos; la API `SpanMarkerModel.predict()` devuelve etiqueta, texto del span, indices de caracter y puntuacion de confianza por entidad.
- Manejo de entidades de hasta 16 palabras (spans largos como nombres de organizaciones completas).
- Reconocimiento con supresion no maxima, lo que evita devolver spans solapados contradictorios.
- Capacidad de transferencia a dominios con registro diferente al de Wikipedia, aunque no esta cuantificada en la informacion disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio: es exclusivamente un clasificador de spans.
- No dispone de modo de razonamiento explicito ni de salida de cadena de pensamiento.

## Casos de uso

- Extraccion de entidades en pipelines de noticias multilingues: el modelo puede procesar titulares y cuerpos de articulo en siete idiomas europeos y devolver personas, organizaciones y lugares con indices de caracter, listos para indexar en un sistema de busqueda o en una base de datos de relaciones.
- Enriquecimiento de bases de conocimiento y grafos: a partir de texto no estructurado se pueden poblar nodos de tipo PER/ORG/LOC y enlazarlos despues con un sistema de entity linking; la precision del 88,85 % reduce el ruido introducido en el grafo.
- Anonimizacion y cumplimiento normativo (RGPD): deteccion de nombres de persona en documentos para su seudonimizacion antes de almacenar o compartir datos; el sesgo hacia la precision es deseable aqui porque los falsos positivos no destruyen datos reales, aunque exige una revision humana por la recuperacion del 73,07 % en PER.
- Analisis de documentos corporativos multinacionales: extraccion de organizaciones y ubicaciones en informes, contratos o actas en aleman, frances, italiano o sueco dentro de una misma plataforma, sin mantener siete modelos separados.
- Monitorizacion de medios y analisis de reputacion de marca: seguimiento de menciones de una organizacion (ORG) y su contexto geografico (LOC) en prensa de varios paises para construir series temporales de cobertura.
- Preprocesado para sistemas de recomendacion y moderacion de contenido: normalizar entidades antes de alimentar un clasificador posterior o un sistema de topicos, reduciendo la dispersion del vocabulario.
- Investigacion en PLN multilingue: servir como linea base reproducible (con licencia Apache 2.0 y codigo de inferencia simple) para comparar variantes de backbone o de esquema de etiquetado en WikiANN.
- Procesamiento por lotes de archivos historicos o administrativos digitalizados, siempre que la longitud de los fragmentos se mantenga dentro del limite de 256 tokens por secuencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validacion oficial de WikiANN multilingue (70.000 frases, 10.000 por idioma, 93.466 entidades de referencia), con coincidencia exacta de span mediante `seqeval`. Todos los valores estan marcados como no verificados en el model-index.

| Metrica | Valor | Notas |
|---|---|---|
| Macro F1 | 0,7675 | Denominacion usada en el model-index |
| Precision | 0,8885 | Ancla de alta precision |
| Recall | 0,6755 | Inferior a la precision; el modelo omite entidades |
| Accuracy | 0,8737 | Exactitud a nivel de secuencia |

Desglose por tipo de entidad:

| Entidad | Precision | Recall | F1 | Entidades de referencia |
|---|---|---|---|---|
| PER | 92,06 % | 73,07 % | 81,47 % | 31.416 |
| LOC | 88,73 % | 65,09 % | 75,09 % | 33.627 |
| ORG | 85,26 % | 64,36 % | 73,35 % | 28.423 |
| Global (micro) | 88,85 % | 67,55 % | 76,75 % | 93.466 |

Trayectoria de convergencia por epoca:

| Epoca | Paso | Loss de evaluacion | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 8.978 | 0,0677 | 84,50 % | 48,49 % | 61,62 % | 80,38 % |
| 2,0 | 17.956 | 0,0490 | 87,77 % | 61,86 % | 72,57 % | 84,64 % |
| 3,0 | 26.934 | 0,0421 | 88,85 % | 67,55 % | 76,75 % | 87,37 % |

No se han publicado resultados de benchmarks comparativos con otros modelos de NER en la informacion disponible. Tampoco se dispone de resultados para los splits de test ni para el conjunto de datos WikiNeural.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 555 MB en FP16 y 1,11 GB en FP32. Con activaciones y lotes pequenos, el consumo realista se situa entre 1,5 y 3 GB de VRAM; con lotes grandes de secuencias de 256 tokens puede acercarse a 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB sirve para lotes pequenos (GTX 1650, RTX 3050, T4, RTX 3060, RTX 4060). Para procesamiento masivo por lotes son preferibles A100, H100, L40S o RTX 4090, donde el cuello de botella pasa a ser el preprocesado de spans y la supresion no maxima, no la matriz de pesos.
- Cabe en GPU de consumo: si, sin cuantizacion, en practicamente cualquier GPU moderna con 4 GB o mas. Incluso es viable en CPU para volumenes moderados, al ser un encoder de 277 M de parametros.
- Opciones de despliegue: libreria `span-marker` (basada en PyTorch), `transformers` con `pipeline("token-classification")`, exportacion a ONNX Runtime o TorchScript para servir sin dependencia de PyTorch completo. No hay soporte oficial en vLLM, TGI, llama.cpp ni Ollama: son runners orientados a modelos generativos y decodificacion autorregresiva, no a clasificacion de tokens encoder-only.
- Latencia y throughput: no disponible en la informacion proporcionada. Cabe senalar que el coste por frase crece con el numero de spans candidatos, ya que SpanMarker evalua pares de fronteras hasta un maximo de 16 palabras por entidad.

## Comparativa con modelos similares

| Modelo | Base | Idiomas | Entidades | Licencia | Rendimiento en WikiANN |
|---|---|---|---|---|---|
| spanmarker-wikiann-mdeberta | mDeBERTa-v3-base (277,5 M) | de, en, es, fr, it, pt, sv | PER, ORG, LOC | Apache 2.0 | F1 76,75 / P 88,85 / R 67,55 (validacion, no verificado) |
| dslim/bert-base-NER | BERT-base | en | PER, ORG, LOC, MISC | No disponible en la informacion | No disponible en la informacion |
| tomaarsen/span-marker-mbert-base-multinerd | mBERT-base con cabecera SpanMarker | multilingue | Amplia (MultiNERD) | No disponible en la informacion | No disponible en la informacion |
| Babelscape/wikineural-multilingual-ner | XLM-R base | multilingue | PER, ORG, LOC, MISC | No disponible en la informacion | No disponible en la informacion |

Las alternativas anteriores se citan como referencia de categoria (NER multilingue con encoder de tamano medio), pero esta ficha no dispone de sus cifras de parametros, contexto ni rendimiento verificadas, por lo que la comparacion cuantitativa queda como no disponible. La ventaja estructural de este modelo frente a las alternativas basadas en esquema BIO es la formulacion por spans, que tiende a elevar la precision a costa de la recuperacion.

## Limitaciones y advertencias

- Recuperacion baja: 67,55 % global y 64,36 % en organizaciones. El modelo omite aproximadamente un tercio de las entidades reales, lo que lo hace poco adecuado para tareas donde no se puede perder informacion (por ejemplo, auditoria exhaustiva o extraccion de obligaciones contractuales).
- Taxonomia reducida: solo reconoce PER, ORG y LOC. No cubre MISC, fechas, cantidades, productos, cargos ni entidades biomedicas.
- Dominio de entrenamiento limitado a Wikipedia: el corpus WikiANN procede de articulos enciclopedicos, con un registro y una distribucion de entidades que no representan el lenguaje coloquial, los textos legales, el lenguaje de redes sociales ni el habla espontanea. El rendimiento fuera de ese dominio no esta cuantificado.
- Cobertura linguistica de siete idiomas; no incluye neerlandes, polaco, catalan, gallego ni ninguna lengua no europea.
- Longitud de contexto efectiva de 256 tokens durante el entrenamiento, lo que obliga a trocear documentos largos y puede partir entidades en las fronteras de los fragmentos.
- Riesgo de alucinacion acotado por la precision alta (88,85 %), pero existente: se han observado falsos positivos en entidades ambiguas, especialmente organizaciones que coinciden con nombres comunes.
- Sesgos heredados de Wikipedia y del backbone mDeBERTa-v3: la infrarrepresentacion de determinadas regiones, generos y lenguas minoritarias en el corpus se traduce en una deteccion desigual; el recall en PER es notablemente superior al de ORG.
- Resultados no verificados: el model-index marca todas las metricas con `verified: false` y el repositorio no registra descargas ni valoraciones, por lo que no existe validacion independiente ni evidencia de reproducibilidad por terceros.
- Sin datos de evaluacion sobre conjuntos de test ni sobre corpus distintos de WikiANN, lo que impide estimar la generalizacion.
- Licencia Apache 2.0, que permite uso comercial y modificacion con atribucion; el backbone base mDeBERTa-v3 se distribuye bajo licencia MIT, compatible con este uso. No se documentan restricciones adicionales.
- Mantenimiento incierto: con cero descargas y un unico autor, no hay garantia de actualizaciones, soporte ni correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rishabh157/spanmarker-wikiann-mdeberta
- Perfil del autor: https://huggingface.co/Rishabh157
- Modelo base mDeBERTa-v3: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset WikiANN en HuggingFace: https://huggingface.co/datasets/unimelb-nlp/wikiann
- Paper de DeBERTaV3: https://arxiv.org/abs/2111.09543
- Paper de PL-Marker (formulacion de spans que inspira SpanMarker): https://arxiv.org/abs/2109.06067
- Paper de WikiANN (Cross-lingual Name Tagging and Linking for 282 Languages): https://arxiv.org/abs/1705.03551
- Libreria SpanMarker: https://github.com/tomaarsen/SpanMarkerNER

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces disponibles son los derivados de la model card del repositorio y de los recursos tecnicos que cita.
