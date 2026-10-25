# Bheri/ithasa-labse-en-sa

## Resumen

Bheri/ithasa-labse-en-sa es un modelo de embeddings de frases (sentence-similarity) obtenido por ajuste fino de `sentence-transformers/LaBSE` sobre texto paralelo inglés–sánscrito. Lo publica el usuario Bheri en HuggingFace y su proposito concreto es la recuperacion cross-lingual entre ingles y sanscrito: dado un segmento en un idioma, encontrar su traduccion o su equivalente semantico en el otro. Es, por tanto, una pieza de infraestructura para busqueda bilingue, alineacion de corpus y memorias de traduccion, no un modelo generativo.

Arquitectonicamente es un codificador BERT dual (LaBSE, 470.926.848 parametros, 768 dimensiones de embedding, pooling CLS, similitud coseno, maximo 512 tokens de entrada). El ajuste se hizo con 609.187 pares de entrenamiento procedentes de cuatro fuentes, con limpieza, deduplicacion y separacion estricta de validacion y test por identidad de frase normalizada.

Su relevancia es doble: por un lado ataca un par de idiomas con muy pocos recursos (sanscrito) reutilizando un encoder multilingue ya entrenado; por otro, el autor publica resultados de validacion y de test held-out por fuente, algo poco habitual en modelos con cero descargas y sin licencia declarada. La macro precision bidireccional en test es del 82,025 %, con una variacion muy grande entre fuentes (99,8 % en BPCC frente a 39,9 % en Sanskrit Llama), lo que obliga a leer los resultados con detalle antes de desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder dual de frases LaBSE), pooling CLS, similitud coseno |
| Parametros totales | 470.926.848 (aproximadamente 471 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens de entrada como maximo |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se distribuyen GGUF ni cuantizaciones int8 declaradas) |
| Idiomas soportados | en (ingles), sa (sanscrito) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 1,9 GB) |
| Dimension del embedding | 768 |
| Funcion de similitud | coseno |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | sentence-transformers/LaBSE |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-25 |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` (segun tags) |

## Arquitectura y entrenamiento

El modelo parte del encoder LaBSE (Language-agnostic BERT Sentence Embedding) de `sentence-transformers`, un transformer tipo BERT con 471 M de parametros que produce un unico vector de 768 dimensiones por frase mediante pooling sobre el token CLS. El ajuste fino mantiene la cabeza de sentence-transformers y entrena con `CachedMultipleNegativesRankingLoss` con lotes libres de duplicados (batch contrastivo de 128, mini-batch de forward cacheado de 16). Configuracion: learning rate 2e-5, presupuesto maximo de 3 epocas con early stopping, semilla 42; el checkpoint seleccionado es el step 6.500 y la ejecucion se detuvo en el step 7.250 (epoca 1,523). Identificador de ejecucion: `20261025T084226097073Z`.

Los datos de entrenamiento son 609.187 pares paralelos: 376.925 de Mitrasamgraha, 120.557 de "Translation data", 94.441 de BPCC y 17.264 de Sanskrit Llama. Los ficheros fuente se normalizaron, se revisaron problemas estructurales y de escritura, se deduplicaron y se separaron de validacion y test por identidad de frase normalizada; Mitrasamgraha conserva las particiones originales de la fuente y se excluyo NLLB sin filtrar. Se retuvo un representante por lado de frase para el entrenamiento contrastivo. El propio autor advierte que el filtrado por escritura y longitud no certifica la correccion semantica de cada traduccion.

No se documenta en la informacion disponible ningun uso de RLHF, DPO ni decodificacion especulativa; es un modelo exclusivamente de representacion, sin cabeza generativa.

## Capacidades

- Generacion de embeddings de frase de 768 dimensiones para ingles y sanscrito, normalizables para usar con producto escalar o coseno.
- Recuperacion cross-lingual bidireccional: consulta en ingles contra candidatos en sanscrito y viceversa.
- Alineacion y emparejamiento de segmentos en corpus paralelos (translation retrieval).
- Busqueda semantica sobre indices vectoriales con mezcla de documentos en ambos idiomas.
- Agrupamiento y deduplicacion de textos por similitud semantica.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: carece de cabeza de lenguaje.
- No soporta tool calling, function calling ni comportamiento agentico.
- No dispone de vision, audio ni modo "thinking".
- Capacidad multilingue limitada al par declarado (en, sa); no se documenta el resto de los 109 idiomas del LaBSE original.

## Casos de uso

- Busqueda bilingue en bibliotecas digitales de sanscrito: indexar fragmentos en devanagari y permitir consultas en ingles (o al reves) recuperando los pasajes mas proximos por similitud coseno; el modelo esta entrenado exactamente para ese salto de idioma.
- Alineacion de corpus paralelos no alineados: para cada frase de un lado, recuperar el candidato mas probable del otro lado y construir un corpus paralelo a nivel de frase antes de entrenar un sistema de traduccion.
- Memoria de traduccion en herramientas TAO: sugerir segmentos previos como referencia cuando el traductor trabaja en ingles o sanscrito, usando el embedding de la frase actual como consulta.
- Control de calidad de corpus: detectar pares mal alineados o traducciones espurias puntuando cada par con la similitud entre sus embeddings y marcando los que caen por debajo de un umbral.
- Deduplicacion semantica de datasets: agrupar frases casi identicas dentro de un mismo idioma antes de entrenar otros modelos, usando similitud coseno sobre los vectores de 768 dimensiones.
- Filtrado y evaluacion de hipotesis de traduccion: puntuar semanticamente las salidas de un sistema de traduccion ingles–sanscrito frente a referencias, como metrica auxiliar a BLEU o chrF.
- Recuperacion aumentada (RAG) sobre documentacion secundaria en ingles y fuentes primarias en sanscrito: un unico indice vectorial sirve para consultas en cualquiera de los dos idiomas.
- Clasificacion tematica no supervisada de textos clasicos: clustering de pasajes por similitud para exploracion filologica.

## Benchmarks y rendimiento

Los unicos datos publicados son resultados de recuperacion de traduccion con pools de 500 candidatos por fuente, promediando las dos direcciones (en→sa y sa→en). No son resultados de MTEB ni de busqueda semantica general.

Validacion (2.000 pares, 500 por fuente):

| Fuente | Precision bidireccional media |
|---|---:|
| BPCC | 1,0000 |
| Sanskrit Llama | 0,3810 |
| Translation data | 0,9600 |
| Mitrasamgraha | 0,9340 |
| Media macro | 0,81875 |

Test held-out (2.000 pares independientes, 500 por fuente; identificador de evaluacion `20261025T114733918539Z`):

| Fuente | Precision bidireccional media |
|---|---:|
| BPCC | 0,9980 |
| Sanskrit Llama | 0,3990 |
| Translation data | 0,9620 |
| Mitrasamgraha | 0,9220 |
| Media macro | 0,82025 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de embeddings multilingues en la informacion disponible. El autor indica explicitamente que superar la puerta de validacion frente al modelo base no demuestra superioridad frente al control entrenado, y que debe evaluarse el resultado por fuente y con las consultas reales de despliegue.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 1,9 GB en fp32; en fp16 serian unos 0,94 GB y en int8 unos 0,47 GB. Con overhead de activaciones y lotes pequenos, el consumo realista en fp32 ronda 2,5-3,5 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090; tambien en GPUs de 4 GB con fp16.
- Inferencia en CPU viable para lotes pequenos, dado el tamano de 471 M de parametros; útil para indexacion por lotes en servidores sin GPU.
- GPU de datacenter (A100, H100, L40S) solo necesarias para indexar volumenes grandes a alto throughput, no por requisito de memoria.
- Opciones de despliegue: `sentence-transformers` (referencia), `text-embeddings-inference` (soportado segun los tags), HuggingFace Inference Endpoints (`endpoints_compatible`), y servidores de embeddings compatibles con el formato sentence-transformers.
- llama.cpp y Ollama no son utilizables directamente: no se publican pesos GGUF en el repositorio y habria que convertirlos.
- Latencia y throughput: no disponible. No se publican mediciones; dependeran del hardware, del lote y de la longitud de las secuencias hasta el limite de 512 tokens.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentacion publica de esos modelos, no de esta ficha; no se han evaluado con el protocolo de recuperacion en→sa/sa→en del autor.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---|---|---|---|
| Bheri/ithasa-labse-en-sa | 471 M | 512 | en, sa | no disponible | Ajuste especifico en/sa; 82,025 % de precision macro en test de recuperacion de traduccion |
| sentence-transformers/LaBSE (base) | 471 M | 512 | multilingue (amplio conjunto de idiomas) | Apache 2.0 | Modelo de partida; cobertura multilingue general, sin ajuste especifico a sanscrito |
| intfloat/multilingual-e5-large | 560 M | 512 | multilingue | MIT | Requiere prefijos "query:" y "passage:"; sin ajuste conocido a sanscrito |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 128 | multilingue | Apache 2.0 | Mucho mas ligero y rapido, pero contexto de 128 tokens y sin especializacion en sanscrito |

No se dispone de comparativas publicadas frente a otros modelos de embeddings para sanscrito en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay permiso claro de uso comercial; debe contactarse con el autor antes de integrarlo en producto.
- Rendimiento muy desigual por fuente: 0,3990 de precision en test para los pares procedentes de Sanskrit Llama frente a 0,9980 en BPCC. El dato agregado del 82 % oculta ese fallo parcial.
- Las metricas son de recuperacion de traduccion con pools de 500 candidatos, no de busqueda semantica abierta ni de similitud parafrastica; extrapolar a otros usos no esta respaldado.
- El propio autor advierte que el filtrado de escritura y longitud no certifica la correccion semantica de las traducciones de entrenamiento; parte del ruido del corpus puede haberse aprendido.
- Riesgo de alucinacion en sentido laxo: el modelo no genera texto, pero puede producir similitudes altas entre frases no equivalentes, especialmente en dominios alejados del corpus de entrenamiento.
- Contexto limitado a 512 tokens: documentos largos deben trocearse, con la perdida de contexto que ello implica.
- Cobertura limitada a ingles y sanscrito; no se documenta el comportamiento en otras lenguas pese a la base multilingue.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha, sin resultados de terceros que confirmen las cifras.
- Escritura en devanagari: no se documenta el tratamiento de transliteraciones (IAST, Harvard-Kyoto) ni de variantes ortograficas, un punto critico en corpus sanscritos reales.
- No apto para generacion, agentes, tool calling ni tareas multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bheri/ithasa-labse-en-sa
- Modelo base: https://huggingface.co/sentence-transformers/LaBSE
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales del autor.
