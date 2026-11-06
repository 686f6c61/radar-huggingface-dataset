# mzahran1/arabic-english-reranker-mminilm

## Resumen

El arabic-english-reranker-mminilm es un cross-encoder de 117,6 millones de parametros especializado en reordenar pasajes candidatos devueltos por un recuperador de primera etapa en busquedas sobre arabe, ingles y consultas cruzadas entre ambos idiomas. Lo desarrolla mzahran1 y parte del modelo multilingue `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, sobre el que se ha aplicado un ajuste fino supervisado con negativos duros minados. Su funcion es la de un reranker dentro de una arquitectura RAG o de busqueda en dos fases: recibe pares consulta-pasaje y emite una puntuacion de relevancia.

La relevancia practica del modelo esta en su tamano contenido (117,6 M de parametros, repo de 0,5 GB) combinado con una mejora medible en recuperacion cross-lingual. Segun la model card, el ajuste fino aporta +3,1 puntos de MRR@10 en la direccion arabe a ingles y +3,8 puntos en ingles a arabe respecto al reranker base, con intervalos de confianza del 95 % calculados por bootstrap emparejado. La latencia declarada es de 94 ms para puntuar 50 candidatos en una GPU, lo que lo hace viable en pipelines de produccion con requisitos de latencia ajustados.

El modelo se publica con licencia Apache-2.0 y esta pensado para integrarse en stacks de `sentence-transformers`, text-embeddings-inference y endpoints compatibles. Su pareja natural es el embedder `mzahran1/arabic-english-e5-small-retrieval`, tambien del mismo autor, aunque la model card demuestra que funciona bien sobre recuperadores de primera etapa distintos, incluidos RRF con bge-m3 y BM25.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder (XLM-RoBERTa, MiniLM-L12, 12 capas, oculto 384) |
| Parametros totales | 117.641.089 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (maximo usado en entrenamiento; no se declara contexto nativo distinto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de sentence-transformers, sin valores publicados) |
| Idiomas soportados | arabe (ar) e ingles (en), incluidas consultas cruzadas ar->en y en->ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |
| Modelo base | cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 |
| Tamano del repositorio | 0,5 GB |
| Metricas declaradas | MRR |

## Arquitectura y entrenamiento

Se trata de un cross-encoder basado en la familia MiniLM (XLM-RoBERTa con 12 capas y dimension oculta de 384), derivado de `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`. A diferencia de un bi-encoder, el modelo procesa conjuntamente la consulta y el pasaje y produce una puntuacion escalar de relevancia, lo que permite capturar interacciones token a token entre ambos textos a costa de no poder precalcular representaciones.

El ajuste fino se realizo con perdida binaria de entropia cruzada punto a punto, con los positivos ponderados por un factor de 4, sobre 20.918 consultas de entrenamiento (incluyendo consultas cross-linguales traducidas por un LLM). Cada consulta se entreno con 1 positivo dorado y 4 negativos duros minados por el embedder multilingual-e5-small (rangos 1-30, margen 0,02), reproduciendo la distribucion de negativos que el reranker vera en produccion. Se ejecuto 1 epoca (3.268 pasos, batch 32, learning rate 2e-5, maximo 256 tokens). La model card documenta que la misma receta con negativos aleatorios obtuvo 80,1 de macro y perdio 5 puntos en ingles, lo que subraya la importancia del minado de negativos. Los datos de entrenamiento provienen de TyDi-QA, ARCD, SQuAD y XQuAD.

## Capacidades

- Reordenacion de pasajes (reranking) para consultas en arabe, en ingles y cross-linguales en ambas direcciones.
- Puntuacion de relevancia consulta-pasaje mediante cross-encoder, sin necesidad de prefijos especiales en la entrada.
- Integracion en pipelines de recuperacion en dos fases junto a cualquier recuperador de primera etapa (bi-encoder, BM25, RRF).
- Funcionamiento con recuperadores heterogeneos: la model card reporta resultados con multilingual-e5-small, con un embedder afinado y con RRF(bge-m3, BM25) con gating por idioma.
- Uso directo a traves de la API `CrossEncoder` de `sentence-transformers` y de text-embeddings-inference.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; es exclusivamente un modelo de ranking.

## Casos de uso

- Busqueda documental bilingue en empresas con corpus en arabe e ingles: el reranker reordena los 50 primeros candidatos de un recuperador lexico o denso, mejorando la precision cross-lingual con una latencia de decenas de milisegundos por consulta.
- RAG sobre Wikipedia o bases de conocimiento factoides: la model card valida el modelo en QA factoid de estilo Wikipedia (TyDi-QA, ARCD, XQuAD), por lo que es adecuado para asistentes que responden con pasajes recuperados.
- Atencion al cliente en centros con clientes araboparlantes e angloparlantes: se puede consultar la base de conocimiento en un idioma y recuperar respuestas redactadas en el otro, gracias a los resultados ar->en y en->ar reportados.
- Segunda fase de un buscador hibrido: combinado con RRF(bge-m3, BM25) y gating por idioma alcanza 85,0 de macro MRR@10, el mejor resultado de la tabla de la model card, lo que lo hace adecuado como capa final de reordenacion en buscadores corporativos.
- Filtrado de candidatos en sistemas de pregunta-respuesta sobre articulos legislativos o academicos: puntuar 20 candidatos requiere 39 ms en una GPU, suficiente para reordenar en linea antes de pasar el contexto a un LLM generador.
- Evaluacion y ajuste de recuperadores: al ser un cross-encoder ligero y con licencia permisiva, sirve como juez de relevancia para comparar embedders o estrategias de chunking en experimentos de recuperacion.
- Despliegue en infraestructura modesta: con 117,6 M de parametros y pesos de 0,5 GB, puede servirse en una unica GPU consumer para cargas de moderadas a altas, o incluso en CPU con latencias mayores no documentadas.

## Benchmarks y rendimiento

Resultados de MRR@10 x 100 tras reordenar el top-50 de la primera etapa, sobre 6.823 consultas de test de TyDi-QA, ARCD y XQuAD (una unica ejecucion de entrenamiento):

| Primera etapa -> reranker | ar->ar | en->en | ar->en | en->ar | macro |
|---|---:|---:|---:|---:|---:|
| multilingual-e5-small, sin reranker | 76,8 | 87,8 | 41,4 | 61,7 | 66,9 |
| multilingual-e5-small -> reranker base mMiniLM | 85,3 | 90,9 | 65,7 | 80,0 | 80,5 |
| multilingual-e5-small -> este reranker | 87,2 | 91,0 | 68,9 | 83,8 | 82,7 |
| e5-small afinado -> este reranker | 86,7 | 90,6 | 72,3 | 83,7 | 83,3 |
| RRF(bge-m3, BM25) con gating por idioma -> este reranker | 89,0 | 91,3 | 75,3 | 84,4 | 85,0 |

Mejora del ajuste fino sobre el reranker base: +3,1 puntos en ar->en (IC 95 % [+1,8, +4,5]) y +3,8 puntos en en->ar (IC 95 % [+2,6, +5,1]), calculados con bootstrap emparejado. Latencia mediana: 94 ms para puntuar 50 candidatos en una GPU y 39 ms para 20.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en precision completa (fp32) por el tamano del repositorio; en fp16 aproximadamente la mitad. No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo cabe holgadamente en RTX 4090, A100, H100 y en GPUs consumer de gama media y baja.
- Cabe en GPU consumer: si, incluidas tarjetas de gama de entrada; el cuello de botella es la latencia, no la memoria.
- Opciones de despliegue: `sentence-transformers` (API `CrossEncoder`), text-embeddings-inference y endpoints compatibles declarados en los tags del repositorio. No se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: 94 ms medianos para 50 candidatos y 39 ms para 20 en una GPU no especificada. El throughput agregado no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (macro MRR@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mzahran1/arabic-english-reranker-mminilm | 117,6 M | 256 tokens | 82,7 (e5-small) / 85,0 (RRF bge-m3+BM25) | Apache-2.0 | Hugging Face |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (base) | ~117 M | no disponible | 80,5 (e5-small) | Apache-2.0 (segun modelo base) | Hugging Face |
| multilingual-e5-small (sin reranker) | no disponible | no disponible | 66,9 | no disponible | Hugging Face |

La comparativa se limita a los modelos evaluados en la model card. No se dispone de datos de otros rerankers cross-linguales arabe-ingles en la informacion proporcionada.

## Limitaciones y advertencias

- Una unica ejecucion de entrenamiento: no se ha medido la varianza entre semillas, por lo que la robustez de las mejoras reportadas no esta cuantificada mas alla de los intervalos de bootstrap.
- Evaluacion limitada a profundidades de reordenacion de 10, 20 y 50; el comportamiento con otros valores de top-k no esta documentado.
- Dominio restringido a QA factoid de estilo Wikipedia (TyDi-QA, ARCD, XQuAD); las ganancias en documentos empresariales no se han medido.
- Las consultas cross-linguales de entrenamiento son traducciones automaticas de un LLM, lo que puede introducir artefactos de traduccion en el aprendizaje.
- Riesgo de alucinacion no aplica directamente al ser un modelo de ranking, pero las puntuaciones de relevancia pueden ser poco fiables fuera del dominio evaluado.
- No se documentan sesgos especificos; al entrenarse sobre Wikipedia y datasets de QA, puede heredar los sesgos de esas fuentes.
- Licencia Apache-2.0 permisiva para uso comercial, pero los datos de entrenamiento conservan sus propias licencias: TyDi-QA Apache-2.0, ARCD MIT y SQuAD CC BY-SA 4.0, esta ultima con clausula de compartir igual.
- Sin capacidades de generacion, tool calling ni agentes; su uso en produccion debe combinarse con un recuperador de primera etapa y, si aplica, un generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzahran1/arabic-english-reranker-mminilm
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Embedder complementario: https://huggingface.co/mzahran1/arabic-english-e5-small-retrieval
- Codigo, benchmark y resultados completos: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
- Dataset TyDi-QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- Dataset ARCD: https://huggingface.co/datasets/hsseinmz/arcd
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset XQuAD: https://huggingface.co/datasets/google/xquad
