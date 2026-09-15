# DOEJGI/genomeocean-moe-8x2.4b-upcycled-from-4b

## Resumen

GenomeOcean MoE 8x2.4B es un modelo de lenguaje causal disperso (mixture-of-experts) especializado en secuencias genómicas microbianas, desarrollado por el DOE Joint Genome Institute (DOEJGI). Se construye mediante "upcycling" del modelo denso GenomeOcean-4B: cada red feed-forward densa de 16.384 unidades se dividió en dos expertos complementarios de 8.192 unidades, replicados cuatro veces, con proyecciones escaladas e inicialización emparejada de routers. El resultado es un transformer decoder-only compatible con Mixtral, con 8 expertos por capa y enrutamiento top-2.

El modelo totaliza 15.125.406.720 parámetros (15,13B), de los cuales aproximadamente 4,25B se activan por token (backbone compartido más dos expertos por capa). La arquitectura consta de 24 capas, anchura oculta de 3.072, atención con 12 cabezas de consulta y 4 de clave/valor (dimensión 256), RoPE con base 500.000 y una ventana de contexto completa de 10.240 tokens. El tokenizador es un BPE genómico de 4.096 tokens originales más un token reservado de checkpoint.

Su relevancia reside en dos frentes: por un lado, ofrece capacidad de modelado de ADN con contexto largo (10 kb) manteniendo un coste de cómputo por token cercano al de un modelo denso de ~4B, gracias a la dispersión MoE; por otro, documenta con detalle un proceso reproducible de upcycling de un modelo denso genómico a MoE, incluyendo las fases de entrenamiento, el corpus y los hiperparámetros. Esta release corresponde al checkpoint final de la fase de contexto largo (update 8.061) y se distribuye con pesos en BF16 y formato safetensors, sin necesidad de código de modelado remoto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Mixtral, mixture-of-experts disperso |
| Parámetros totales | 15.125.406.720 (15,13B) |
| Parámetros activos | Aproximadamente 4,25B por token (backbone compartido + 2 expertos por capa) |
| Longitud de contexto | 10.240 tokens, atención causal completa |
| Tipos de cuantización | No disponible (la release oficial solo distribuye pesos BF16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible en el sentido de lenguaje natural; el modelo opera sobre secuencias de ADN con tokenizador BPE genómico de 4.096 tokens |
| Licencia | genomeocean-lbnl-bsd (campo `license: other` con `license_name: genomeocean-lbnl-bsd`) |
| Formato de pesos | safetensors, precisión BF16 |
| Capas / anchura oculta | 24 / 3.072 |
| Expertos | 8 por capa, enrutamiento top-2, anchura intermedia 8.192, activación SwiGLU |
| Atención | 12 cabezas de consulta, 4 cabezas clave/valor, dimensión de cabeza 256 |
| Base de RoPE | 500.000 |
| Tokenizador | GenomeOcean BPE: 4.096 tokens originales + 1 token reservado de checkpoint (`<|endoftext|>` = 4.096) |
| Framework | Entrenamiento con Megatron-LM; exportación nativa a Hugging Face Transformers (validado con Transformers 4.53.3) |
| Modelo base | DOEJGI/GenomeOcean-4B (revisión cd63253071beaebe0a60910986f64fb59a578275) |
| Tamaño del repositorio | 30,3 GB |
| Pesos BF16 | Aproximadamente 30,25 GB (28,17 GiB) antes de memoria de runtime y caché de atención |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con bloques de atención estándar y capas feed-forward sustituidas por un MoE de 8 expertos y enrutamiento top-2. El proceso de upcycling partió del checkpoint denso GenomeOcean-4B: cada FFN densa de anchura 16.384 se dividió en dos expertos complementarios de 8.192 con proyecciones reducidas y una inicialización emparejada de los routers; ese par se replicó cuatro veces para obtener los 8 expertos por capa. Los pesos de atención, embeddings y normalización se heredaron del modelo denso. Tras la inicialización, todos los pesos fueron reentrenados. El nombre "8x2.4B" usa como unidad de medida el backbone compartido más un experto por capa (aproximadamente 2,4B); los pesos de cada experto a lo largo de las 24 capas contienen cerca de 1,81B de parámetros, y los pesos compartidos se cuentan una sola vez en el total de 15,13B.

El entrenamiento se ejecutó en NERSC Perlmutter con Megatron-LM y Transformer Engine, sobre 256 nodos (1.024 GPU NVIDIA A100) en cada fase. La fase de continuación de contexto corto realizó 34.286 updates con contexto de 1.024 y batch global de 1.024, procesando 35.951.476.736 posiciones de token. La fase de contexto largo arrancó desde el update 34.286 con optimizador y schedule nuevos: 8.061 updates con contexto de 10.240 y batch global de 512, procesando 42.262.855.680 posiciones de token. Estas cifras excluyen el preentrenamiento del modelo denso original y cuentan posiciones procesadas, incluidas muestras repetidas y de cadena complementaria inversa; no representan exposición a secuencia biológica única.

La optimización usó Adam (betas 0,9/0,95, epsilon 1e-8), weight decay 0,1, recorte de gradiente en 1,0, warmup de 100 updates hasta 5e-5 y decaimiento coseno hasta 5e-6 en el update 8.000. El coeficiente de la pérdida auxiliar de enrutamiento fue 0,01. El entrenamiento terminó en el update 8.061 al alcanzar el límite de duración de la asignación de cómputo. El corpus de contexto largo combina contigs metagenómicos microbianos en dos grupos: contigs de al menos 51.200 pb, emitidos en fragmentos de 51.200 pb, y contigs de 10.000 a menos de 51.200 pb empaquetados con fronteras `[SEP]`. Ambos grupos incluyen ejemplos de cadena directa y complementaria inversa. El corpus combinado contiene 2.055.904 documentos y 17.156.333.064 tokens almacenados, con un split de 2.035.344 documentos de entrenamiento y 20.560 de validación, preservando parejas adyacentes directa/complementaria inversa en la frontera del split.

Una particularidad técnica relevante es la gestión de tokens y la compatibilidad numérica. Los IDs originales de GenomeOcean se preservan: `[UNK]` = 0, `[CLS]` = 1, `[SEP]` = 2, `[PAD]` = 3 y `[MASK]` = 4; los contigs empaquetados usan `[SEP]` como frontera. El checkpoint de Megatron tiene 4.097 filas de embedding/salida porque su NullTokenizer reserva un ID adicional de fin de documento; la exportación conserva esa fila como `<|endoftext|>` = 4.096. La generación se detiene en `[SEP]` o en ese token reservado. En cuanto al enrutamiento, el entrenamiento calculaba los logits del router en FP32, mientras que Transformers 4.53.3 calcula la proyección lineal del router en el dtype cargado y el softmax en FP32, por lo que la inferencia en BF16 puede producir pequeñas diferencias de routing y de logits; el repositorio incluye `validation_report.json` con una comparación medida sobre una muestra fija de 128 tokens, que no constituye un test de equivalencia completo entre Megatron y Hugging Face.

## Capacidades

- Generación de secuencias de ADN: modelado causal autorregresivo sobre tokens genómicos (BPE de 4.096 símbolos), orientado a continuación y muestreo de secuencias.
- Contexto largo de 10.240 tokens, suficiente para contigs de hasta ~10 kb con atención causal completa, sin ventanas deslizantes ni atención lineal.
- Enrutamiento disperso top-2 sobre 8 expertos por capa: activa aproximadamente 4,25B de los 15,13B de parámetros por token.
- Robustez de cadena: el entrenamiento incluye ejemplos de cadena directa y complementaria inversa, por lo que el modelo ha visto ambas orientaciones.
- Base para fine-tuning supervisado: al ser un modelo base (no ajustado por instrucciones), está pensado para adaptarse con cabezas de clasificación, etiquetado de tokens o generación condicionada.
- Extracción de representaciones internas para tareas downstream (clasificación, clustering, detección de similitud) mediante las activaciones del modelo.
- Compatibilidad de ecosistema: al usar `MixtralForCausalLM` nativo de Transformers, se integra con el stack estándar (accelerate, safetensors, torch) sin código remoto.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso orquestado.
- No dispone de modo "thinking", visión, audio ni procesamiento de lenguaje natural general.
- Capacidades multilingües: no disponibles (el vocabulario es exclusivamente genómico).

## Casos de uso

- Clasificación taxonómica de contigs metagenómicos: partiendo del checkpoint base, se añade una cabeza de clasificación y se ajusta con etiquetas taxonómicas; el contexto de 10.240 tokens permite clasificar contigs de hasta ~10 kb completos, en lugar de fragmentarlos en ventanas cortas que pierden señal de composición.
- Relleno de huecos en ensamblados (gap filling): dado el contexto flanqueante a izquierda y derecha de un hueco dentro de la ventana de 10.240 tokens, el modelo puede generar la secuencia intermedia como hipótesis, útil como andamiaje previo a verificación experimental o por mapeo de reads.
- Extracción de embeddings para binning de MAGs: las representaciones del modelo permiten agrupar contigs por origen genómico, complementando métodos basados en composición de k-mers y cobertura, especialmente en contigs cortos donde la cobertura es poco informativa.
- Detección de genes y ORFs mediante etiquetado de tokens: fine-tuning a nivel de token para predecir fronteras de genes sobre secuencias largas, aprovechando la ventana de 10 kb para mantener el contexto operónico.
- Descubrimiento de clusters de genes biosintéticos: puntuar regiones genómicas con el modelo (perplejidad o probabilidad bajo el modelo) para priorizar candidatos a BGC en metagenomas, y usar el modelo como extractor de características para clasificadores especializados.
- Aumento de datos para preentrenamiento: muestrear secuencias sintéticas plausibles con temperature y top-p controlados para aumentar corpus de modelos genómicos más pequeños, con la advertencia de que las secuencias generadas no corresponden necesariamente a biología real.
- Filtrado de contaminación y artefactos en ensamblados: comparar la verosimilitud asignada por el modelo a un contig frente a controles para detectar quimeras, adaptadores o secuencias de baja calidad.
- Investigación sobre upcycling de MoE: el checkpoint y su receta (división de FFN, replicación, inicialización emparejada de routers, pérdida auxiliar de 0,01) sirven como caso de estudio reproducible para analizar balanceo de expertos y especialización de routing en dominios no textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación tipo MMLU, HumanEval, GSM8K ni benchmarks genómicos específicos (por ejemplo, predicción de genes, clasificación taxonómica o perplejidad sobre conjuntos de validación). Únicamente se menciona `validation_report.json`, que contiene una comparación medida sobre una muestra fija de 128 tokens entre la implementación de Megatron y la de Transformers, y que el propio autor describe explícitamente como no equivalente a un test completo de equivalencia. Los resultados de búsqueda web proporcionados no contienen información relevante sobre este modelo ni sobre benchmarks de modelos genómicos comparables.

## Requisitos de hardware

- Pesos BF16: aproximadamente 30,25 GB (28,17 GiB) solo para los pesos, antes de activaciones, memoria de runtime y caché de atención.
- Caché de atención en BF16: con 24 capas, 4 cabezas KV de dimensión 256, cada token requiere 24 × 2 × 4 × 256 = 49.152 elementos, es decir, unos 96 KiB por token. A la máxima longitud de 10.240 tokens, la caché ocupa aproximadamente 1,0 GB. Estimación derivada de la arquitectura declarada, no medida publicada.
- Consumo total estimado en BF16 a contexto completo: en torno a 31,3 GB de VRAM, más el overhead de activaciones y del runtime.
- GPU de centro de datos: cabe en una sola A100 80GB, H100 80GB o H200; también en configuraciones multi-GPU con tensor parallelism (por ejemplo, 2× A100 40GB o 4× A100 40GB), ya que la arquitectura Mixtral está soportada por los principales servidores de inferencia.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16. En una GPU de 32 GB el ajuste es muy justo y solo viable con contexto reducido, dado que los pesos ya ocupan 28,17 GiB. Para uso en GPU de consumo sería necesario cuantizar, pero no se distribuyen cuantizaciones oficiales.
- Cuantización: no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes oficiales. Cualquier conversión a 8 bits (aproximadamente 15 GB) o 4 bits (aproximadamente 7,6 GB) es una estimación aritmética de conversión propia del usuario, no un artefacto validado por el autor.
- Opciones de despliegue: Hugging Face Transformers con `MixtralForCausalLM` (validado con 4.53.3), `accelerate` con `device_map="auto"`, `attn_implementation="sdpa"`; vLLM y TGI son compatibles a nivel de arquitectura Mixtral, aunque no se documenta validación específica para este checkpoint en la información disponible. Ollama y llama.cpp requerirían conversión previa a GGUF, no suministrada.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste por token se corresponde con el de un modelo de ~4,25B de parámetros activos, mientras que el requisito de memoria corresponde al de un modelo de 15,13B.
- Nota de despliegue: la entrada más la salida generada deben mantenerse dentro de los 10.240 tokens; el modelo no extiende contexto más allá de ese límite.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|---|
| GenomeOcean MoE 8x2.4B (este modelo) | 15,13B | ~4,25B | 10.240 tokens | MoE decoder-only, 8 expertos, top-2 | genomeocean-lbnl-bsd | safetensors BF16, Transformers |
| GenomeOcean-4B (modelo base) | Aproximadamente 4B según el nombre; FFN densa de 16.384 de anchura | Denso (todos los parámetros) | No disponible | Transformer decoder-only denso | genomeocean-lbnl-bsd | safetensors, Transformers |
| Otros DNA-LM de referencia (Evo, Nucleotide Transformer, DNABERT-2) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados en la información proporcionada para establecer comparaciones cuantitativas de rendimiento con alternativas. La única comparación con base documental es con GenomeOcean-4B, del que este modelo deriva por upcycling: comparten tokenizador, vocabulario y pesos heredados de atención, embeddings y normalización, pero difieren en régimen de cómputo (disperso frente a denso), número de parámetros (15,13B frente a ~4B) y ventana de contexto (10.240 tokens, con fases de entrenamiento específicas para contexto largo).

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones en lenguaje natural ni mantiene conversaciones; las prompts deben contener tokens de secuencia genómica.
- Dominio restringido: entrenado sobre metagenomas microbianos. No hay evidencia de buen comportamiento en genomas eucariotas, humanos o virales, y el vocabulario de 4.096 tokens está diseñado para ADN, no para texto.
- Riesgo de alucinación biológica: el modelo genera secuencias plausibles estadísticamente que pueden no corresponder a ninguna secuencia biológica real. Cualquier salida debe validarse experimentalmente o por comparación con bases de datos.
- Límite duro de contexto: 10.240 tokens. Superarlo implica truncamiento o degradación, y no hay mecanismos de extrapolación documentados.
- Sesgo de corpus: el entrenamiento se realizó sobre contigs metagenómicos microbianos con muestras repetidas y de cadena complementaria inversa. Las cifras de tokens procesados (35,95B en contexto corto y 42,26B en contexto largo) no representan exposición a secuencia biológica única, lo que dificulta estimar la diversidad real cubierta.
- Riesgo de desbalanceo de expertos: aunque se usó una pérdida auxiliar de enrutamiento de coeficiente 0,01, no se publican métricas de utilización de expertos ni análisis de colapso de routing.
- Discrepancia numérica entre entrenamiento e inferencia: el router se entrenó con logits en FP32 y la inferencia en BF16 calcula la proyección lineal del router en el dtype cargado, lo que puede introducir diferencias pequeñas de routing y de logits no cuantificadas más allá de la muestra de 128 tokens del informe de validación.
- Token reservado: la generación se detiene en `[SEP]` o en el token 4.096; los pipelines que no gestionen ese token pueden producir salidas truncadas o bucles.
- Licencia: `genomeocean-lbnl-bsd` es una licencia personalizada (campo `license: other`). Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se documentan aquí sus términos concretos.
- Sin benchmarks publicados: no hay métricas comparables que permitan estimar la calidad del modelo frente a alternativas, lo que dificulta justificar su adopción en producción sin una evaluación propia.
- Adopción incipiente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con publicación y actualización el 15 de septiembre de 2026. No existe validación independiente por parte de la comunidad.
- Cuantizaciones no oficiales: cualquier conversión a 8 o 4 bits es responsabilidad del usuario y puede alterar el comportamiento del router, sensible a la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DOEJGI/genomeocean-moe-8x2.4b-upcycled-from-4b
- Modelo base GenomeOcean-4B: https://huggingface.co/DOEJGI/GenomeOcean-4B
- Revisión concreta del checkpoint base: https://huggingface.co/DOEJGI/GenomeOcean-4B/tree/cd63253071beaebe0a60910986f64fb59a578275
- Archivo de licencia referenciado en la model card: LICENSE (dentro del repositorio del modelo, https://huggingface.co/DOEJGI/genomeocean-moe-8x2.4b-upcycled-from-4b/blob/main/LICENSE)
- Informe de validación citado en la model card: validation_report.json (dentro del repositorio del modelo, https://huggingface.co/DOEJGI/genomeocean-moe-8x2.4b-upcycled-from-4b/blob/main/validation_report.json)

Nota sobre la búsqueda web: los resultados devueltos no guardan relación con este modelo ni con modelado de secuencias genómicas (corresponden a scripts no relacionados de Roblox), por lo que no se han incluido como fuentes. No se han encontrado en la búsqueda artículos, papers, blogs ni demos adicionales sobre GenomeOcean MoE 8x2.4B.
