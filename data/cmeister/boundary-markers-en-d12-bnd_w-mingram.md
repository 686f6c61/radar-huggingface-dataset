# cmeister/boundary-markers-en-d12-bnd_w-mingram

## Resumen

Este repositorio contiene tres modelos de lenguaje (semillas 0, 1 y 2) del brazo en inglés del estudio comparativo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister). No son modelos de propósito general: son artefactos de investigación entrenados con nanochat para medir el efecto de un tokenizador con marcadores explícitos de frontera de palabra (`<|>`) sobre la pérdida de validación medida en bits por byte. Los tres checkpoints comparten tokenizador, datos y configuración de entrenamiento, y solo se diferencian en la inicialización de pesos y el orden de los fragmentos de datos fijado por la semilla.

La arquitectura es un transformer denso estilo nanochat de 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens, entrenado durante 2.553 pasos de 524.288 tokens, es decir, aproximadamente 1.340 millones de tokens. El tokenizador se entrenó con MinGram sobre una muestra de 5 GB de FineWeb en inglés y tiene un vocabulario de 34.685 entradas más un token de inicio de secuencia (34.686 en total para el modelo). El autor advierte explícitamente que estos checkpoints son reentrenamientos: los originales que respaldan las cifras publicadas se perdieron y se volvieron a entrenar en septiembre de 2026 con los mismos ajustes.

Su relevancia es metodológica más que de producto. Al ser modelos pequeños, abiertos (Apache 2.0) y con tres semillas por configuración, permiten reproducir y auditar comparaciones de tokenizadores con una varianza controlada, algo poco habitual en modelos de mayor tamaño. No incluyen ajuste por instrucciones, plantilla de chat ni cuantizaciones listas para producción, y la model card no reporta benchmarks de tareas (MMLU, HumanEval, GSM8K), solo bits por byte en validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (nanochat, commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | no disponible (no publicado en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch en precision de entrenamiento; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, cargable con `torch.load(..., weights_only=True)`) |
| Autor | cmeister (Clara Meister) |
| Paper asociado | arXiv:2608.08847, "Explicit Boundary Markers for Subword Vocabularies" |
| Tokenizador | MinGram con marcador `<|>` a ambos lados de cada palabra; vocabulario 34.685 + 1 token BOS = 34.686 |
| Datos del tokenizador | muestra de 5 GB de FineWeb en ingles |
| Datos de entrenamiento | 8 primeros shards de ClimbMix descargados por nanochat, leidos entre 3,4 y 3,6 veces segun el tokenizador |
| Tokens de entrenamiento | 2.553 pasos x 524.288 tokens = 1,34 mil millones de tokens |
| Semillas incluidas | 0, 1 y 2 |
| Tamano del repositorio | 2,5 GB |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de nanochat, un transformer decoder-only denso, sin mezcla de expertos ni componentes de espacio de estados. La configuracion concreta es de 12 capas, anchura de 768, 6 cabezas de atencion y ventana de contexto de 2.048 tokens. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, un modelo por GPU, y el texto procede de los 8 primeros shards de ClimbMix que nanochat descarga de forma automatica. Cada semilla fija la inicializacion de pesos y el orden de los 8 shards; ese orden es identico para todas las variantes de tokenizador con la misma semilla, de modo que las comparaciones entre tokenizadores dentro de una semilla son directas.

La innovacion que estudia el trabajo no esta en el modelo, sino en la tokenizacion. El tokenizador `bnd_w` inserta un marcador de frontera `<|>` a ambos lados de cada palabra; el espacio unico entre dos palabras marcadas se elimina al codificar y se restaura al decodificar a partir de los dos marcadores contiguos. El archivo del tokenizador (`tokenizer/fineweb_en_5gb_bnd_w_mingram_v34685.json.gz`, sha256 `38d0f3b56bead3684dd8299c3fc86ac63e44e68d1e278ee35acafe32cc69d31b`) sufrio una reescritura de formato respecto a agosto de 2026, que se acepto solo tras comprobar que ambas versiones producian identicos ids en 200 documentos en ingles. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones, ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, con el modelo entrenado como modelo de lenguaje puro (prediccion del siguiente token).
- Modelado de lenguaje a nivel de byte medible: el resultado principal del repositorio es la perdida de validacion expresada en bits por byte, calculada como la suma de la perdida en el shard de validacion de ClimbMix dividida por la longitud UTF-8 real del texto evaluado.
- Reproduccion controlada de comparaciones de tokenizadores: tres semillas con datos y ajustes identicos permiten estimar varianza entre ejecuciones.
- Capacidad multilingue: no disponible; el modelo es solo en ingles y el tokenizador se entreno exclusivamente con FineWeb en ingles.
- Tool calling / function calling: no soportado (no hay plantilla de chat ni ajuste por instrucciones).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en tokenizacion: comparar el tokenizador `bnd_w` con MinGram frente a otros esquemas de vocabulario usando exactamente las mismas condiciones de entrenamiento y las mismas tres semillas, midiendo bits por byte como metrica.
- Analisis de fronteras de palabra: estudiar como afecta el marcador `<|>` a la segmentacion de palabras raras, compuestos y puntuacion, inspeccionando los ids generados por el tokenizador en corpus controlados.
- Replicacion de resultados publicados: los checkpoints permiten volver a calcular la tabla de bits por byte y cuantificar la discrepancia entre el reentrenamiento y las cifras publicadas (desviaciones de entre -0,00020 y +0,00019).
- Docencia y divulgacion: servir de ejemplo completo y ejecutable de un ciclo de entrenamiento con nanochat, incluido el log de entrenamiento completo (`train.log`) y el archivo de comprobacion de integridad (`archive.json`) por semilla.
- Banco de pruebas de infraestructura: al caber en una sola GPU por modelo y tener un numero de pasos fijo, es util para validar pipelines de entrenamiento distribuido, reanudacion desde checkpoint o calculo de metricas sin coste elevado.
- Pruebas de conversion y cuantizacion: partir del state dict `.pt` para validar herramientas de conversion a safetensors, GGUF o formatos de inferencia antes de aplicarlas a modelos mayores.
- Experimentos de decodificacion en local: generar texto en ingles en una maquina sin GPU dedicada para probar estrategias de muestreo o esquemas de decodificacion restringida, asumiendo la baja calidad esperable a esta escala.
- Auditoria de artefactos de investigacion: verificar hashes, configuraciones (`meta_002553.json`) y trazabilidad de un experimento publicado, incluida la propia advertencia del autor sobre la perdida de los checkpoints originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de tareas). La unica metrica reportada es la perdida de validacion en bits por byte sobre el shard de validacion de ClimbMix de nanochat; menor es mejor.

| Semilla | Reentrenamiento | Publicado | Diferencia (reentrenamiento - publicado) |
|---|---|---|---|
| 0 | 0,87634 | 0,87646 | -0,00011 |
| 1 | 0,87628 | 0,87647 | -0,00020 |
| 2 | 0,87622 | 0,87603 | +0,00019 |

El autor indica que el entrenamiento en GPU no es reproducible bit a bit, por lo que estas diferencias son esperables. No se proporcionan cifras comparativas de otros tokenizadores en la model card, aunque el paper de referencia si contiene la comparativa completa del brazo en ingles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 12 capas y anchura 768, el checkpoint individual es pequeno (el repositorio completo, con tres semillas, tokenizer y logs, ocupa 2,5 GB), por lo que la inferencia en precision completa deberia entrar holgadamente en menos de 2 GB de VRAM; se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: cualquier GPU con al menos unos pocos gigabytes de memoria. El entrenamiento se hizo con una GPU por modelo, sin especificar el modelo exacto de GPU.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida, dado el tamano del modelo y su contexto de 2.048 tokens.
- Opciones de despliegue: el formato distribuido es un state dict de PyTorch pensado para cargarse con el codigo de nanochat; no hay archivos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no suministrada. vLLM o TGI no tienen configuracion publicada para este checkpoint.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No hay una comparativa oficial en la model card. La tabla siguiente situa el modelo frente a alternativas abiertas de escala y forma similares, usando datos publicos de terceros; la fila de este modelo queda marcada como no disponible en los campos que el autor no publica.

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| boundary-markers-en-d12-bnd_w-mingram | no disponible (12 capas, anchura 768, 6 cabezas) | 2.048 | 1,34 B tokens (8 shards de ClimbMix) | Apache 2.0 | state dict PyTorch, 3 semillas |
| GPT-2 small | 124 M | 1.024 | ~40 GB de WebText | licencia MIT modificada | safetensors / PyTorch |
| Pythia-160M | 160 M | 2.048 | 300 B tokens (The Pile) | Apache 2.0 | safetensors / PyTorch |

La comparacion de rendimiento entre estos modelos no es posible con los datos disponibles: el modelo de este repositorio solo reporta bits por byte en ClimbMix, y GPT-2 small y Pythia-160M no publican esa metrica en el mismo shard de validacion. Cualquier comparacion de calidad deberia realizarse sobre una metrica comun y con el mismo tokenizador o con normalizacion por byte.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: no hay ajuste por instrucciones, plantilla de chat ni alineacion; no debe usarse como asistente conversacional.
- Entrenamiento muy corto: 1,34 mil millones de tokens y 2.553 pasos. La calidad del texto generado sera baja y la tasa de incoherencias alta en comparacion con modelos de escala similar entrenados con cientos de miles de millones de tokens.
- Riesgo de alucinacion: alto y sin mitigar; el modelo no incorpora mecanismos de verificacion ni recuperacion de conocimiento.
- Solo ingles: el idioma declarado es `en`; no hay soporte multilingue ni evaluacion en otras lenguas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos, resumenes extensos o conversaciones multi-turno prolongadas.
- Reentrenamiento, no reproduccion: los checkpoints originales se perdieron y los publicados se reentrenaron en septiembre de 2026. Los resultados difieren ligeramente de los publicados y no son reproducibles bit a bit.
- Sin cuantizaciones oficiales: no se distribuyen GGUF ni formatos de 4 u 8 bits, lo que limita el despliegue con herramientas habituales de inferencia.
- Trazabilidad del tokenizador: el archivo de tokenizador fue reescrito de formato respecto a la version de agosto de 2026, aunque se valido la equivalencia de ids en 200 documentos en ingles.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; el autor no impone restricciones adicionales, pero la idoneidad tecnica para uso comercial es muy limitada por las carencias anteriores.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o representacion en la informacion disponible. El corpus de entrenamiento (ClimbMix y FineWeb en ingles) arrastra los sesgos propios de datos web sin filtrar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_w-mingram
- Paper: https://arxiv.org/abs/2608.08847
- Repositorio script_tok (codigo del experimento y tokenizador): https://github.com/sanderland/script_tok
- Repositorio nanochat (arquitectura y marco de entrenamiento): https://github.com/karpathy/nanochat
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con el paper; los unicos enlaces relevantes son los anteriores, extraidos de la model card.
