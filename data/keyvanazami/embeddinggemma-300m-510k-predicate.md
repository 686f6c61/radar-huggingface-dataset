# Keyvanazami/embeddinggemma-300m-510k-predicate

## Resumen

EmbeddingGemma-300M-510k-predicate es un modelo de embeddings de frases derivado de google/embeddinggemma-300m, ajustado por Keyvanazami para una tarea vertical muy concreta: recuperar dispositivos predeterminados (predicate devices) en el marco regulatorio estadounidense de autorizaciones FDA 510(k). Dada la descripcion de un dispositivo medico nuevo, expresada como indicaciones de uso (Indications for Use) y descripcion del dispositivo, el modelo ordena las autorizaciones historicas 510(k) por similitud semantica, de modo que los dispositivos que una solicitud real cito como predicados aparecen en las primeras posiciones.

Tecnicamente es un transformer encoder de la familia Gemma 3 (gemma3_text) con 302.863.104 parametros, adaptado al pipeline sentence-similarity mediante la libreria sentence-transformers. El ajuste fino se realizo sobre 41.281 pares (dispositivo, predicado citado) extraidos de 22.580 dispositivos autorizados entre 2015 y 2023, con negativos dificiles muestreados por rangos de TF-IDF y una funcion de perdida CachedMultipleNegativesRankingLoss. La longitud de entrada usada en entrenamiento y evaluacion es de 1.024 tokens.

Su relevancia es acotada pero clara: demuestra que un modelo base pequeno de proposito general, afinado con datos de dominio y un formato de texto controlado, supera a alternativas de mayor tamano (Qwen3-Embedding-0.6B, BAAI/bge-m3) en una tarea de recuperacion especializada. El modelo es un artefacto de investigacion, no una herramienta regulatoria, y su utilidad practica depende de disponer del corpus de resumenes 510(k) y de los vectores de documentos precalculados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (gemma3_text), adaptado a sentence-transformers |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrada usada en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-300m, un encoder transformer de la familia Gemma 3 disenado para generar embeddings de frases. El ajuste fino conserva la arquitectura y modifica los pesos para especializarlos en recuperacion de predicados 510(k). El texto de entrada se construye con una plantilla fija que concatena "Indications for Use: {ifu}\nDevice Description: {description}", y se usan prompts distintos para consulta (query) y documento (document), con embeddings normalizados y similitud coseno como metrica.

El conjunto de entrenamiento consta de 41.281 pares (dispositivo, predicado citado) procedentes de 22.580 dispositivos autorizados entre 2015 y 2023. Para cada par se muestrearon dos negativos dificiles entre los dispositivos anteriores situados en los rangos 6 a 35 del ranking TF-IDF, excluyendo cualquier dispositivo citado en el resumen. La perdida empleada fue CachedMultipleNegativesRankingLoss, que combina negativos en lote con los negativos dificiles. Hiperparametros: batch de 64, longitud maxima de 1.024 tokens, learning rate 2e-5 con decaimiento lineal y 10% de warm-up, 2 epocas (1.292 pasos), precision bf16, sentence-transformers 6.3.0. El split de desarrollo (dispositivos de 2024) se uso para elegir el numero de epocas; el split de test (2025-2026) no se uso para ninguna decision. El autor documenta dos estrategias que no funcionaron: continuar un entrenamiento a 512 tokens hasta 3,5 epocas adicionales (la perdida de entrenamiento bajaba pero el desarrollo no mejoraba) y aplicar un filtro por codigo de producto sobre los candidatos (redujo el recall en todos los metodos).

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de documentos (retrieval).
- Recuperacion de dispositivos predicate para solicitudes FDA 510(k) a partir de indicaciones de uso y descripcion del dispositivo.
- Ranking de candidatos mediante similitud coseno sobre embeddings normalizados.
- Soporte de prompts diferenciados para consulta y documento.
- Capacidad de fusion con recuperacion lexica: el autor reporta Reciprocal-Rank Fusion con TF-IDF como la configuracion de mejor rendimiento.
- Extraccion de caracteristicas (feature-extraction) via sentence-transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Busqueda de predicados para preparacion de una solicitud 510(k): dado el texto de indicaciones de uso y descripcion de un dispositivo nuevo, el modelo genera un embedding de consulta y lo compara con los vectores precalculados del corpus para devolver los candidatos mas proximos, que un especialista regulatory affairs revisa manualmente.
- Analisis retrospectivo de decisiones regulatorias: investigar que dispositivos se citaron historicamente como predicados en una familia de productos (por ejemplo, clips endoscopicos o cateteres de administracion) y como evoluciono esa seleccion a lo largo del tiempo.
- Construccion de un motor de busqueda interno sobre el corpus 510(k): con los vectores de documento precalculados incluidos en el dataset, una busqueda requiere solo un embedding de consulta, lo que permite desplegar un servicio de baja latencia sobre 52.123 candidatos.
- Priorizacion en revision documental: reducir el espacio de busqueda de un analista que hojea resumenes 510(k) en PDF, ordenando los candidatos por relevancia semantica antes de la revision manual.
- Investigacion en recuperacion de dominio especializado: servir como referencia para estudiar el efecto del ajuste fino con negativos dificiles y del enmascarado de numeros K en tareas de retrieval regulatorio.
- Sistema mixto de recuperacion (hibrido lexico-denso): combinar el modelo con TF-IDF mediante reciprocal-rank fusion para obtener el mejor rendimiento documentado (78,4% Recall@10), util en pipelines de busqueda documental donde se quiere combinar coincidencia de terminos con similitud semantica.
- Deteccion de solapamiento tecnologico: comparar la descripcion de un dispositivo candidato con predicados existentes para identificar caracteristicas tecnologicas compartidas antes de una evaluacion formal.

## Benchmarks y rendimiento

Resultados sobre el split de test de Keyvanazami/fda-510k-predicate-retrieval: 5.308 dispositivos autorizados en 2025 y 2026, cada uno ordenado frente a todos los dispositivos anteriores (hasta 52.123 candidatos). Gold = predicados citados en el propio resumen 510(k) del dispositivo. Las columnas "primary" puntuan solo el predicado principal (5.173 consultas). Valores en porcentaje.

| Metodo | Recall@10 | Hit@1 | Hit@10 | Hit@100 | primary Hit@1 | primary Hit@10 |
|---|---|---|---|---|---|---|
| Este modelo + TF-IDF (reciprocal-rank fusion) | 78,4 | 53,0 | 88,5 | 98,8 | 46,4 | 83,9 |
| Este modelo | 77,0 | 52,5 | 86,8 | 98,1 | 45,1 | 81,8 |
| TF-IDF (1-2 grams) | 72,6 | 49,6 | 83,1 | 96,6 | 43,9 | 78,8 |
| BM25 | 68,4 | 45,0 | 78,5 | 94,6 | 39,4 | 74,1 |
| BAAI/bge-m3 | 62,9 | 41,3 | 73,0 | 92,0 | 36,0 | 68,6 |
| Qwen/Qwen3-Embedding-0.6B | 62,8 | 40,1 | 73,1 | 92,0 | 34,9 | 68,6 |
| BAAI/bge-base-en-v1.5 | 61,6 | 39,7 | 71,8 | 90,9 | 34,4 | 67,0 |
| google/embeddinggemma-300m (sin ajuste) | 61,3 | 38,9 | 71,2 | 91,6 | 33,5 | 66,4 |
| sentence-transformers/all-MiniLM-L6-v2 | 55,2 | 35,1 | 65,2 | 85,7 | 30,2 | 59,8 |

El Recall@10 de este modelo presenta un intervalo bootstrap del 95% de 76,0 a 77,9. El modelo se ejecuto con entradas de 1.024 tokens; los demas embedders con 512. En el split de desarrollo (2.635 dispositivos autorizados en 2024) el modelo alcanza 78,5 Recall@10 frente a 74,3 de TF-IDF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16/bf16 para los 302,9 millones de parametros, mas overhead de activaciones y tokenizador; en fp32 alrededor de 1,2 GB. No se documentan variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: sentence-transformers (libreria de referencia), Text Embeddings Inference (tag text-embeddings-inference), endpoints compatibles; no se documentan opciones GGUF/llama.cpp/Ollama para este artefacto.
- Latencia y throughput: no disponible. La carga de indexacion es favorable porque los vectores de documento del corpus completo estan precalculados en el dataset (`embeddings/finetuned-embeddinggemma-300m-510k.docs.npy`), de modo que cada busqueda requiere solo un embedding de consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall@10 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keyvanazami/embeddinggemma-300m-510k-predicate | 302,9 M | 1.024 tokens (uso) | 77,0 (78,4 con fusion TF-IDF) | gemma | Hugging Face |
| google/embeddinggemma-300m | 300 M (aprox.) | no disponible en la informacion | 61,3 | gemma | Hugging Face |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B (aprox.) | no disponible en la informacion | 62,8 | no disponible en la informacion | Hugging Face |
| BAAI/bge-m3 | no disponible en la informacion | no disponible en la informacion | 62,9 | no disponible en la informacion | Hugging Face |
| BAAI/bge-base-en-v1.5 | no disponible en la informacion | no disponible en la informacion | 61,6 | no disponible en la informacion | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la informacion | no disponible en la informacion | 55,2 | no disponible en la informacion | Hugging Face |

La comparativa debe interpretarse con cautela: las cifras de Recall@10 corresponden exclusivamente a la tarea de recuperacion de predicados 510(k) del dataset del autor, y este modelo se evaluo con 1.024 tokens mientras que los demas con 512. El rendimiento en tareas generales de embedding no se documenta para este artefacto y no deberia extrapolarse a partir de estas cifras.

## Limitaciones y advertencias

- Ruido en las etiquetas: las citas de predicados se extraen automaticamente de PDFs de resumenes. En una comprobacion manual de 100 resumenes, el conjunto gold tuvo una precision de aproximadamente 0,71 y un recall de aproximadamente 0,95, por lo que las puntuaciones absolutas son cotas inferiores.
- Cobertura incompleta: cerca del 12% de los predicados citados no estan en el corpus (falta el PDF del resumen o secciones incompletas).
- Solo ingles y solo resumenes 510(k) estadounidenses. Los documentos antiguos escaneados se procesaron con OCR y contienen errores de reconocimiento.
- No es una herramienta regulatoria: la eleccion de predicados depende de caracteristicas tecnologicas y de estrategia regulatoria que el texto por si solo no captura. Un dispositivo no citado no es necesariamente un predicado inadecuado.
- Restricciones de licencia: al ser un derivado de EmbeddingGemma, se distribuye bajo los Gemma Terms of Use, incluida la Gemma Prohibited Use Policy. El uso comercial esta sujeto a dichos terminos.
- Formato de entrada sensible: el modelo se entreno con numeros K enmascarados como `[K-NUMBER]` y nombres de predicados citados como `[DEVICE]`; usar otro formato puede degradar el rendimiento.
- Longitud de entrada: el uso recomendado es de 1.024 tokens; entradas mas largas pueden truncarse y perder informacion relevante.
- Artefacto de investigacion con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, ya que el modelo produce embeddings y no texto; el riesgo equivalente es devolver candidatos semanticamente proximos pero regulatoramente inadecuados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keyvanazami/embeddinggemma-300m-510k-predicate
- Dataset de evaluacion: https://huggingface.co/datasets/Keyvanazami/fda-510k-predicate-retrieval
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Libreria sentence-transformers: https://sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
