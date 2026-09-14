# Slenser0/uzbek-ner-mmbert-span

## Resumen

Uzbek NER mmBERT-span es un modelo de reconocimiento de entidades nombradas (NER) para texto en uzbeko desarrollado por el usuario Slenser0. Se construye sobre el encoder multilingue jhu-clsp/mmBERT-base y anade una cabeza de clasificacion de spans con decodificador biaffine, con 307.597.608 parametros totales (unos 308 M). El modelo resuelve un problema muy concreto: extraer organizaciones (ORG), nombres de persona (NAME) y lugares (GEO) devolviendo desplazamientos de caracteres exactos sobre la cadena original, en lugar de etiquetas a nivel de token.

Su rasgo diferencial es el tratamiento de la escritura uzbeca. Funciona con alfabeto latino (`Toshkentda`), cirilico (`Тошкентда`) y con texto mixto donde ambos se combinan en el mismo mensaje, sin necesidad de transliterar la entrada. Esta pensado principalmente para monitorizacion de marca y de medios, donde las menciones llegan en formatos heterogeneos.

La relevancia actual del modelo radica en dos factores: cubre un idioma con pocos recursos en el ecosistema NER (el uzbeko) y adopta un enfoque de span classification en lugar del clasico BIO, motivado por un analisis de errores en el que el 64 % de los falsos positivos de frontera de una linea base BIO fallaba solo en el limite final del span. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (mmBERT-base) con cabeza de clasificacion de spans biaffine y embedding de anchura de span |
| Parametros totales | 307.597.608 (segun pesos en safetensors; la model card indica 308 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Procesa texto de cualquier longitud dividiendolo en ventanas solapadas de 512 tokens; la longitud maxima nativa del encoder subyacente no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni INT8) |
| Idiomas soportados | Uzbeko (`uz`): escritura latina, escritura cirilica y texto mixto latino-cirilico en un mismo documento |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, encoder y cabeza de spans) mas codigo Python de inferencia (`uzner.py`) |

## Arquitectura y entrenamiento

El modelo no etiqueta tokens uno a uno con esquema BIO. En su lugar puntua spans candidatos completos: cada n-grama de palabras de hasta 8 palabras se convierte en candidato, sus tokens subword primero y ultimo se proyectan a 256 dimensiones cada uno y se combinan mediante una forma biaffine mas un embedding aprendido de anchura del span. La puntuacion sigue la forma `logits_k = [h_start ; 1]^T · U_k · [h_end ; 1] + width_k` para `k ∈ {O, ORG, NAME, GEO}`. Los candidatos solapados se resuelven de forma greedy por puntuacion, con umbral por defecto de 0,35 ajustable mediante `ner.predict(text, threshold=...)`. Este diseno se eligio tras un analisis de errores de una linea base BIO en el que, en el 64 % de los falsos positivos de frontera, unicamente el final del span estaba mal delimitado.

Los datos de entrenamiento son 14.500 documentos uzbecos anotados (13.000 de entrenamiento y 1.500 de validacion). Cada documento en cirilico se anadio tambien como transliteracion latina con los offsets remapeados, lo que eleva el total a 18.732 documentos. El entrenamiento fue de tres epocas, con suavizado de fronteras ε = 0,1, tasa de aprendizaje de 3e-5 para el encoder y 1e-3 para la cabeza, y semilla 42. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineacion adicionales, algo esperable en un modelo discriminativo de este tipo. El conjunto de datos no se redistribuye con el modelo.

## Capacidades

- Reconocimiento de entidades nombradas con tres clases: ORG (organizaciones, marcas y medios), NAME (personas) y GEO (lugares).
- Devolucion de desplazamientos exactos de caracteres (`start`, `end`) y de la subcadena coincidente, no solo etiquetas.
- Procesamiento de uzbeko en alfabeto latino, cirilico y texto mixto dentro de un mismo mensaje, sin transliteracion previa por parte del usuario.
- Entrada de longitud arbitraria mediante troceado automatico en ventanas solapadas de 512 tokens.
- Inferencia por lotes: `ner.predict([texto1, texto2, ...])` devuelve una lista de entidades por texto.
- Uso desde linea de comandos: `python uzner.py "Toshkentda Oqtepa Lavash filiali ochildi."`.
- Ajuste del umbral de decision en tiempo de inferencia para priorizar precision o recall.
- Seleccion automatica de dispositivo: CUDA, despues Apple MPS y finalmente CPU.
- Entidades planas, sin anidamiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente; es un modelo puramente discriminativo de etiquetado de secuencias.

## Casos de uso

- Monitorizacion de marca: es el caso para el que se construyo el modelo. Permite rastrear menciones de una marca en prensa y redes sociales etiquetando cada aparicion como ORG con offsets exactos, incluso cuando la mencion aparece con sufijos aglutinados (`Oqtepa Lavash`, `Samsung`) o escrita en cirilico.
- Analisis de redes sociales con texto mixto: publicaciones uzbecas que mezclan caracteres latinos y cirilicos en una misma frase (`Centrum Air Samarqand aeroportida рейсни...`) se procesan sin normalizacion previa, lo que evita perder menciones o romper offsets.
- Enriquecimiento de archivos periodisticos: extraccion de personas y organizaciones citadas en corpus historicos de medios para construir indices navegables o grafos de entidades, aprovechando que la entrada admite documentos largos por troceado en ventanas.
- Geoposicion de noticias: la clase GEO permite asociar cada noticia a una localidad (`Toshkentda`, `Наманганда`), util para mapas de cobertura informativa, alertas regionales o segmentacion geografica de audiencias.
- Anonimizacion y cumplimiento de privacidad: los offsets exactos de la clase NAME permiten sustituir nombres de personas por marcadores de posicion en un pipeline posterior, preservando la estructura del texto sin reescribirlo.
- Verificacion frente a listas de sanciones o KYC: deteccion de nombres y organizaciones para cotejarlos con listas de vigilancia, con revision humana obligatoria dado que las metricas del modelo no alcanzan precision perfecta.
- Enrutado de quejas en atencion al cliente: si se combina con un clasificador de intenciones, las entidades GEO y ORG permiten dirigir tickets a la delegacion o al equipo de la organizacion implicada.
- Construccion de bases de conocimiento: extraccion de pares organizacion-lugar recurrente en un corpus uzbeco para poblar un grafo de entidades con enlaces verificables a la posicion exacta en el texto fuente.

## Benchmarks y rendimiento

La metrica empleada es micro-F1 estricta de span exacto: una entidad solo cuenta si coinciden clase y ambos limites de caracter. Las cifras se midieron sobre un conjunto de validacion retenido de 1.500 documentos con 7.698 spans de referencia, evaluando un modelo gemelo con la misma arquitectura y receta pero entrenado sin la particion de validacion. El checkpoint publicado si vio esa particion durante el entrenamiento, por lo que sus cifras no estan medidas de forma independiente.

| Script | Documentos | F1 |
|---|---|---|
| Uzbeko latino | 951 | 0,9058 |
| Uzbeko cirilico | 390 | 0,8803 |
| Mixto | 159 | 0,9184 |

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| ORG | 0,8775 | 0,8620 | 0,8697 |
| NAME | 0,9265 | 0,9237 | 0,9251 |
| GEO | 0,9174 | 0,9029 | 0,9101 |
| micro | 0,9065 | 0,8950 | 0,9007 |

Rendimiento medido: 300 documentos de validacion de longitud mixta (entre 5 y 9.216 caracteres) procesados en 4,7 s sobre GPU Apple M4 Pro. Servido por HTTP sobre NVIDIA A100, aproximadamente 96 documentos por segundo, con una latencia mediana de 20 ms para una peticion corta individual.

## Requisitos de hardware

- Peso del modelo: 307,6 M de parametros. En FP32 ocupa aproximadamente 1,23 GB; en BF16/FP16 unos 0,62 GB; en INT8 unos 0,31 GB. El repositorio completo ocupa 1,3 GB.
- Inferencia en CPU: viable, ya que el propio codigo hace fallback a CPU cuando no hay CUDA ni MPS. No se documentan latencias en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090), incluso en FP32 y con lotes moderados.
- GPU de datacenter: probado sobre NVIDIA A100 con aproximadamente 96 documentos por segundo y 20 ms de latencia mediana por peticion corta.
- Apple Silicon: probado sobre Apple M4 Pro con 300 documentos en 4,7 s (aproximadamente 64 documentos por segundo), usando la ruta MPS.
- Opciones de despliegue documentadas: PyTorch con `transformers`, `safetensors` y `huggingface_hub`, cargando el paquete `uzner` incluido en el repositorio. Tambien admite ejecucion por linea de comandos.
- Opciones de despliegue no documentadas: no se proporcionan instrucciones ni soporte declarado para vLLM, TGI, llama.cpp, Ollama ni exportacion a ONNX o TensorRT. Al ser un modelo de encoder y no generativo, el uso de runtimes orientados a decodificacion de tokens no esta contemplado en la informacion disponible.
- Memoria adicional: al procesar documentos largos troceados en ventanas de 512 tokens, el consumo crece con el numero de ventanas y el tamano de lote. No se publican cifras de VRAM maxima por lote.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de otros sistemas NER para uzbeko, por lo que la comparacion con alternativas de la misma categoria queda limitada. Se recoge unicamente lo que puede contrastarse con los datos disponibles.

| Modelo | Parametros | Tipo de decodificacion | Cobertura de escritura | F1 micro (uzbeko) | Licencia |
|---|---|---|---|---|---|
| Slenser0/uzbek-ner-mmbert-span | 307,6 M | Span classification con cabeza biaffine | Latino, cirilico y mixto | 0,9007 | Apache-2.0 |
| jhu-clsp/mmBERT-base | 308 M (indicado en la model card) | Encoder sin cabeza NER | Multilingue, no especifico de NER | No aplica (no realiza NER) | No disponible en la informacion proporcionada |
| Alternativas NER especificas para uzbeko | No disponible | No disponible | No disponible | No disponible | No disponible |
| Linea base BIO mencionada por el autor | No disponible | Etiquetado por token con esquema BIO | No disponible | No disponible (solo se cita un analisis de errores, sin F1) | No disponible |

## Limitaciones y advertencias

- Solo cubre tres clases: ORG, NAME y GEO. Productos, eventos, fechas, cantidades y otros tipos de entidad no se etiquetan.
- El cirilico obtiene peor resultado que el latino (F1 de 0,8803 frente a 0,9058), por lo que en corpus predominantemente cirilicos debe esperarse mas ruido.
- Los nombres que no aparecieron en el entrenamiento son mas dificiles de detectar que los familiares, lo que implica riesgo de falsos negativos en antroponimos poco frecuentes o transliteraciones no vistas.
- La calidad sobre fuentes de texto distintas de las de entrenamiento no esta medida. No hay evaluacion fuera de dominio ni por tipo de fuente (redes sociales, prensa, texto juridico, etc.).
- Riesgo de alucinacion en el sentido de spans espurios: el modelo puntua candidatos y aplica un umbral de 0,35, por lo que puede generar entidades falsas o fronteras imprecisas en texto ambiguo. La precision de ORG es la mas baja de las tres clases (0,8775).
- Convencion de fronteras: un sufijo gramatical unido a la palabra forma parte de la entidad (`Toshkentda`, `Oʻzbekistonga`, `Наманганда`), mientras que una palabra funcional escrita por separado no (`KFC da` deja `KFC`). Si se necesita el nombre desnudo, hay que recortarlo aguas abajo. Las comillas externas, parentesis, `#`, `@` y la puntuacion final quedan excluidos, pero apostrofes, puntos y guiones internos se mantienen (`Fargʻona`, `Kun.uz`, `Coca-Cola`).
- Las entidades son planas: no hay anidamiento, de modo que menciones del tipo organizacion dentro de lugar no se representan jerarquicamente.
- Las cifras de calidad publicadas corresponden a un modelo gemelo entrenado sin la particion de validacion. El checkpoint liberado si vio esa particion, por lo que sus numeros reales sobre esos mismos datos estarian inflados respecto a los reportados.
- El conjunto de datos de entrenamiento no se redistribuye, lo que dificulta reproducir el entrenamiento o auditar la composicion del corpus.
- No se documentan sesgos demograficos ni geograficos especificos, pero al estar entrenado sobre un corpus periodistico y de marcas, es probable que sobrerrepresente organizaciones y lugares de gran visibilidad frente a zonas o colectivos menos cubiertos por los medios. Este punto no ha sido analizado en la informacion disponible.
- Para usos sensibles como KYC, sanciones o moderacion automatizada, las metricas publicadas (F1 micro 0,9007) no justifican decision automatica sin revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Slenser0/uzbek-ner-mmbert-span
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Referencia indicada en las etiquetas del modelo (paper de mmBERT): https://arxiv.org/abs/2509.06888
- Resultados de la busqueda web: no se encontro ningun enlace relevante para este modelo. Las coincidencias devueltas correspondian a paginas del Traductor de Google y no guardan relacion con el modelo ni con NER en uzbeko.
