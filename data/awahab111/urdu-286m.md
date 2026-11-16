# awahab111/urdu-286m

## Resumen

urdu-286m es un modelo de lenguaje decoder-only de 286,3 millones de parámetros entrenado desde cero (sin pesos preentrenados) sobre texto en urdu por el desarrollador awahab111. Forma parte de una familia de dos modelos (junto a urdu-126m) que comparten corpus, tokenizador y receta de entrenamiento, variando únicamente la profundidad. El modelo es una base (base model): continúa texto, pero no sigue instrucciones.

Su relevancia reside en dos aspectos concretos. Primero, emplea un tokenizador BPE de 32.768 entradas entrenado específicamente sobre urdu, que consume 4,76 veces menos tokens que el BPE de GPT-2 para el mismo texto (1,25 tokens por palabra frente a 5,95), lo que abarata proporcionalmente el entrenamiento y la inferencia en ese idioma. Segundo, no usa la arquitectura estándar de `transformers`, sino la de nanochat (con embeddings de valor, smear gate, lambdas residuales por capa y logit soft cap), lo que condiciona su despliegue.

El modelo se entrenó en una única L40S durante 5,8 horas con un coste de 11,38 dólares, sobre 2.200 millones de tokens en una sola pasada. La longitud de contexto es de 2.048 tokens. Está publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (value embeddings, smear gate, lambdas residuales por capa, logit soft cap) |
| Parametros totales | 286,3M (matrices transformer 84,9M + unembedding 25,2M + token embedding 25,2M + value embeddings 151,0M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no existe implementacion GGUF/llama.cpp de esta arquitectura) |
| Idiomas soportados | Urdu (ur) |
| Licencia | MIT |
| Formato de pesos | No disponible en la informacion proporcionada; requiere el codigo de nanochat para su carga |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas | 12 |
| d_model | 768 |
| Cabezas query / KV | 6 / 6, dimension de cabeza 128 |
| MLP | Expansion 4x, ReLU al cuadrado |
| Posiciones | RoPE |
| Normalizacion | RMSNorm, pre-norm |
| Atencion | Ventana deslizante, patron `SSSL` (cuarto de contexto en capas S) |
| Vocabulario | 32.768 |
| Parametros que computan por token | 110,1M (matrices + cabeza) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas y d_model de 768. Incorpora las particularidades de nanochat: embeddings de valor (151,0M de parametros, mas de la mitad del total almacenado), una smear gate, lambdas residuales por capa y un logit soft cap. La atencion usa ventana deslizante con patron `SSSL`, de modo que las capas S operan sobre un cuarto del contexto. El autor senala explicitamente que mas de la mitad de los parametros son tablas de consulta y no computo, y que la cifra relevante para comparar tamanos o razonar sobre escalado es 110,1M.

Los datos proceden de FineWeb-2 `urd_Arab` y Wikipedia `20231101.ur`: 4,86M documentos web y 200.154 articulos antes del filtrado, y 4.048.757 documentos tras la limpieza. El corpus contiene 2.850 millones de tokens, de los cuales se usaron 2.200 millones en una sola pasada sin repeticion. La normalizacion incluye plegado de yeh/kaf/heh arabes a code points urdu, eliminacion de diacriticos y controles bidi, normalizacion de digitos y retirada de URLs y marcado. Se aplicaron puertas de calidad (puntuacion de idioma, tamano de cluster duplicado, limites de longitud, ratio de script, ratio de simbolos, guarda de repeticion) y deduplicacion exacta con BLAKE2b entre ambas fuentes. La particion de validacion es solo Wikipedia y quedo excluida del entrenamiento, de modo que val bpb mide generalizacion entre fuentes.

La receta de entrenamiento uso una L40S en Modal con bf16, 4.200 pasos, batch de 524.288 tokens con acumulacion de gradiente, 5,8 horas de reloj y 11,38 dolares de coste. El optimizador es Muon para matrices (lr 0,02, momentum 0,95) y AdamW para embeddings (0,3) y escalares, con weight decay de 0,28, 40 pasos de warmup, 65% de warmdown y LR final del 5% del pico. Se guardaron checkpoints cada 200 pasos. No se menciona RLHF ni DPO: es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generacion y continuacion de texto en urdu: es su funcion principal como modelo base.
- Compresion eficiente de texto urdu: 6,76 bytes por token con su tokenizador frente a 1,42 con GPT-2 BPE.
- Tokenizacion nativa de urdu con vocabulario BPE de 32.768 entradas entrenado sobre el mismo corpus.
- Modelado de lenguaje autoregresivo con contexto de 2.048 tokens.
- No soporta instrucciones, tool calling ni function calling (modelo base sin ajuste).
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No dispone de capacidades de vision ni audio.
- Capacidad multilingue practicamente nula: el tokenizador es caro para ingles (3 tokens por `education` frente a 1 de GPT-2) por diseno.

## Casos de uso

- Investigacion sobre tokenizacion de idiomas de bajos recursos: permite reproducir el experimento de comparar tokens por palabra y bytes por token entre el BPE urdu y el de GPT-2 sobre el mismo corpus, con una diferencia medida de 4,76x.
- Punto de partida para ajuste fino supervisado en urdu: al ser un modelo base con licencia MIT, puede servir de inicializacion para tareas posteriores de instruccion o clasificacion, aunque su tamano limita el techo de rendimiento.
- Estudio de escalado controlado: la familia urdu-126m / urdu-286m comparte corpus, tokenizador y receta, cambiando solo la profundidad, lo que permite aislar el efecto del tamano (0,6113 bpb frente a 0,6953 bpb).
- Generacion de texto asistida en urdu para prototipos: continuacion de parrafos, titulares o descripciones con contexto de 2.048 tokens, adecuada para demos y no para produccion con requisitos de calidad alta.
- Evaluacion de metodologias de benchmark en idiomas de bajos recursos: el modelo documenta que su 24,58% en UrduMMLU refleja el prior de letras (predicciones concentradas en A y C) y no conocimiento, lo que sirve como caso de estudio sobre como puntuar modelos base.
- Analisis de fuga de benchmarks: el autor mide la presencia de huellas de 60 caracteres de UrduMMLU en el corpus (166 preguntas, 0,63%), util para investigar contaminacion en conjuntos de evaluacion de bajos recursos.
- Experimentacion con la arquitectura nanochat: sirve para probar el stack de Karpathy (value embeddings, smear gate, Muon) en un dominio linguistico distinto del ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor. La metrica principal es bits por byte (bpb) de validacion sobre la particion de Wikipedia reservada, independiente del tokenizador.

| Metrica | urdu-126m | urdu-286m |
|---|---|---|
| Profundidad | 8 | 12 |
| Matrices transformer | 25,2M | 84,9M |
| Parametros totales | 126M | 286M |
| Tokens de entrenamiento | 0,84B | 2,20B |
| Val bpb | 0,6953 | 0,6113 |
| UrduMMLU | 24,84% | 24,58% |

Evolucion del bpb durante el entrenamiento de urdu-286m:

| Paso | bpb |
|---|---|
| 0 | 2,2649 |
| 500 | 0,7859 |
| 1000 | 0,7364 |
| 1500 | 0,7197 |
| 2000 | 0,6935 |
| 2500 | 0,6717 |
| 3000 | 0,6501 |
| 3500 | 0,6327 |
| 4000 | 0,6151 |
| 4200 | 0,6113 |

El autor advierte de dos caveats: el bpb compara modelos sobre el mismo texto, no entre idiomas, porque el urdu en UTF-8 ocupa dos bytes por caracter; y un bpb menor indica mejor compresion del urdu, no mejor razonamiento. El 24,58% en UrduMMLU (26.431 preguntas) esta por debajo del 25,0% de linea base aleatoria; el producto escalar del prior de letras predice 24,97%, con una brecha de 0,39 puntos, inferior a 1,5 errores estandar. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 286,3M de parametros, en bf16 los pesos ocupan aproximadamente 0,57 GB y en fp32 unos 1,15 GB; a ello hay que sumar activaciones y cache KV para 2.048 tokens de contexto.
- GPU recomendadas: el autor entreno en una L40S. Cualquier GPU con al menos unos pocos GB de VRAM deberia poder alojar los pesos; no se especifican requisitos minimos.
- Cabe en GPU de consumo: si, por el tamano de los pesos, aunque no hay confirmacion oficial ni pruebas publicadas.
- Opciones de despliegue: exclusivamente el codigo de nanochat (https://github.com/karpathy/nanochat). No existe implementacion en llama.cpp, GGUF, vLLM, TGI ni Ollama para esta arquitectura, segun el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos en la informacion proporcionada. La unica comparacion documentada es interna a la familia:

| Modelo | Parametros totales | Contexto | Val bpb | UrduMMLU | Licencia |
|---|---|---|---|---|---|
| urdu-126m | 126M | 2.048 | 0,6953 | 24,84% | MIT |
| urdu-286m | 286M | 2.048 | 0,6113 | 24,58% | MIT |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene formato conversacional. Requiere ajuste fino para uso como asistente.
- El 24,58% en UrduMMLU no mide conocimiento: las predicciones se concentran en A (44,63%) y C (40,66%) frente a una distribucion dorada uniforme, de modo que el resultado refleja el prior posicional.
- El bpb bajo indica buena compresion de urdu, no capacidad de razonamiento; el autor lo advierte explicitamente.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Tokenizador caro para ingles (3 tokens por `education` frente a 1 de GPT-2), lo que desaconseja su uso bilingue.
- Capacidad multilingue practicamente inexistente: solo urdu.
- Riesgo de alucinacion no medido en la informacion disponible; como modelo base de 286M, la coherencia a largo plazo sera limitada.
- Sesgos no documentados en la informacion proporcionada.
- Despliegue restringido al codigo de nanochat: sin soporte en llama.cpp, GGUF, vLLM, TGI u Ollama, lo que complica la integracion en produccion.
- Licencia MIT para los pesos, pero los datos de entrenamiento tienen sus propias condiciones: FineWeb-2 es ODC-By 1.0 y el texto de Wikipedia es CC BY-SA, lo que puede imponer obligaciones de atribucion sobre el contenido generado.
- Contaminacion de benchmark medida: 166 preguntas de UrduMMLU (0,63%) tienen huellas de 60 caracteres presentes en el corpus, principalmente en FineWeb-2 (140 documentos) y en menor medida en Wikipedia (1 documento).
- Entrenado con 2.200 millones de tokens en una sola pasada: el presupuesto de computo es muy reducido y el techo de calidad es bajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/awahab111/urdu-286m
- Modelo hermano urdu-126m: https://huggingface.co/awahab111/urdu-126m
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (20231101.ur): https://huggingface.co/datasets/wikimedia/wikipedia
