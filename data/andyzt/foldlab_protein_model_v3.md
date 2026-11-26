# andyzt/foldlab_protein_model_v3

## Resumen

foldlab_protein_model_v3 es un modelo de lenguaje de proteinas desarrollado por el usuario andyzt bajo el paraguas de FoldLab. Se trata de un encoder de estilo ESM-2 con embeddings posicionales rotatorios, derivado de los pesos base de SaProt_650M_AF2 (westlake-repl), y ajustado para la tarea de fill-mask sobre secuencias de proteinas codificadas con el alfabeto combinado de aminoacidos y tokens estructurales 3Di de Foldseek. Con 651.573.728 parametros y una ventana maxima de 1026 posiciones (aproximadamente 1024 residuos), esta pensado para modelado de lenguaje enmascarado sobre proteinas con informacion estructural.

El modelo resulta relevante porque combina dos senales en una sola secuencia: la identidad del residuo (20 aminoacidos canonicos mas ambiguedades) y su contexto estructural tridimensional discretizado en tokens 3Di, lo que permite que una unica pasada de transformer razone simultaneamente sobre secuencia y estructura. El vocabulario de 446 tokens refleja ese producto cruzado entre aminoacidos y 3Di, mas tokens especiales.

Es un modelo de nicho, sin descargas ni likes en el momento de la consulta, y su publicacion es muy reciente (noviembre de 2026). La licencia MIT y el formato safetensors facilitan su reutilizacion, aunque la ausencia de datos de evaluacion publicados limita cualquier afirmacion sobre su calidad frente a los modelos de referencia de la familia ESM-2 o SaProt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EsmForMaskedLM (encoder tipo ESM-2 con embeddings posicionales rotatorios) |
| Parametros totales | 651.573.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1026 posiciones (aprox. 1024 residuos) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 2.6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de estilo ESM-2 con 33 capas, hidden size de 1280, 20 cabezas de atencion e intermediate size de 5120, sobre el que se ha sustituido el esquema posicional original por embeddings posicionales rotatorios (RoPE). La cabeza de salida es de tipo masked LM sobre un vocabulario de 446 tokens que codifica pares aminoacido x 3Di de Foldseek mas tokens especiales. El modelo parte de los pesos de SaProt_650M_AF2, por lo que hereda el preentrenamiento estructural de esa familia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La precision declarada de los pesos es float32.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de proteinas codificadas en el alfabeto aminoacido + 3Di.
- Prediccion de residuos enmascarados a partir del contexto secuencial y estructural.
- Representaciones contextuales de proteinas reutilizables para tareas downstream (extraccion de embeddings por capa).
- Manejo de secuencias de hasta 1026 posiciones, adecuado para proteinas de hasta aproximadamente 1024 residuos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue en el sentido de lenguajes naturales.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Anotacion de variantes y residuos desconocidos: dado un alineamiento multiple con posiciones ambiguas o mutaciones de interes, el modelo puede rellenar el residuo mas probable condicionado por el contexto secuencial y estructural, util en pipelines de curacion de bases de datos de proteinas.
- Prediccion de mutaciones en ingenieria de proteinas: enmascarar la posicion objetivo y comparar la probabilidad asignada al aminoacido salvaje frente a candidatos permite priorizar mutaciones antes de ensayos experimentales.
- Generacion de embeddings para clasificacion funcional: las representaciones del encoder sirven como features para clasificadores de familia, localizacion subcelular o termoestabilidad, aprovechando la ventana de 1026 posiciones.
- Preentrenamiento inicial para tareas estructurales downstream: al partir de SaProt_650M_AF2, es un punto de partida razonable para fine-tuning en prediccion de contacto, angulos diedros o interfaz proteina-proteina con cabeceras ligeras.
- Busqueda y agrupamiento de proteinas: los embeddings del modelo permiten calcular similitudes en espacio latente para clustering de secuencias con estructura conocida, complementando busquedas Foldseek.
- Deteccion de residuos anomalos en control de calidad de estructuras: al enmascarar posiciones y medir la perplejidad por residuo, se pueden senalar regiones mal modeladas o incompatibles entre secuencia y estructura 3Di.
- Filtrado previo en diseno de librerias: puntuar candidatos generados por modelos generativos con la verosimilitud del fill-mask para descartar secuencias implausibles antes de sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 2,6 GB solo para pesos, mas activaciones y cache de atencion; con lotes pequenos y secuencias de hasta 1026 posiciones, un presupuesto de 6-10 GB de VRAM es realista.
- En float16/bfloat16 (conversion manual, no publicada como checkpoint): aproximadamente 1,3 GB de pesos, con lo que cabria en GPUs consumer de 8 GB o menos.
- GPUs recomendadas: A100, H100 o L40S para lotes grandes y extraccion masiva de embeddings; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia interactiva.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en media precision y con 12 GB o mas en float32 con lotes moderados.
- Opciones de despliegue: transformers (libreria declarada), endpoints_compatible segun los tags; no se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de proteinas con vocabulario propio no es esperable compatibilidad directa con servidores de LLM genericos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| foldlab_protein_model_v3 | 651.573.728 | 1026 posiciones | fill-mask proteico (aminoacido + 3Di) | MIT | Hugging Face, sin descargas registradas |
| SaProt_650M_AF2 | no disponible en la informacion proporcionada | no disponible | representaciones proteicas con tokens 3Di | MIT (pesos base declarados) | Hugging Face (westlake-repl) |
| ESM-2 650M | no disponible en la informacion proporcionada | no disponible | fill-mask y representaciones proteicas | no disponible | Hugging Face (Meta) |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para foldlab_protein_model_v3 ni datos en la informacion proporcionada para los modelos alternativos.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados; se desconoce si el ajuste mejora o degrada el rendimiento respecto a SaProt_650M_AF2.
- Modelo sin descargas ni validacion comunitaria: no existe evidencia externa de su calidad.
- El vocabulario de 446 tokens exige tokenizar con el esquema aminoacido x 3Di de Foldseek; un uso incorrecto del tokenizador invalida las predicciones.
- Requiere estructura 3D para generar los tokens 3Di; en proteinas sin estructura experimental o predicha, la senal estructural debe aproximarse y la calidad puede degradarse.
- Ventana maxima de 1026 posiciones: proteinas mas largas necesitan truncado o segmentacion, con perdida de contexto global.
- Riesgo de alucinacion en el sentido de asignar alta probabilidad a residuos plausibles pero incorrectos, especialmente en regiones desordenadas o con baja cobertura estructural.
- Sesgos derivados del corpus de entrenamiento de SaProt_650M_AF2 (sesgo hacia proteinas con estructuras resueltas en PDB y hacia familias sobrerrepresentadas); no documentados por el autor.
- Licencia MIT permite uso comercial, pero conviene verificar la cadena de licencias de los pesos base (SaProt_650M_AF2) antes de desplegar en produccion.
- No es un modelo de lenguaje natural: no debe emplearse para texto, codigo ni conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyzt/foldlab_protein_model_v3
- Pesos base SaProt_650M_AF2: https://huggingface.co/westlake-repl/SaProt_650M_AF2
