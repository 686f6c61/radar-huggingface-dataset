# OPENGCM/GTM-3-base

## Resumen

GTM-3-base es un modelo de lenguaje de tipo GPT decoder-only entrenado desde cero por OPENGCM, un proyecto independiente que publica la serie GTM (Generative Text Model). Se trata de un modelo base (pretrained), no ajustado por instrucciones, pensado como experimento de investigacion reproducible en una sola GPU. Su interes no esta en la capacidad bruta, sino en documentar de forma abierta una receta completa de preentrenamiento a pequena escala: arquitectura nanoGPT con RoPE, optimizador hibrido Muon + AdamW, mezcla de datos curada y pesos liberados en fp32 bajo licencia Apache 2.0.

Arquitectonicamente es un transformer decoder-only de 10 capas, 8 cabezas de atencion y 608 dimensiones de embedding, con RoPE en lugar de embeddings posicionales absolutos aprendidos, atencion fusionada via `scaled_dot_product_attention` de PyTorch y weight tying entre embeddings y cabeza de salida. La longitud de contexto es de 1024 tokens y el tokenizador es el BPE de GPT-2 de `tiktoken`, con vocabulario de 50.257 entradas y sin tokenizador propio. La model card declara ~74,9 M de parametros, mientras que el fichero `model.safetensors` contiene 105.552.448 parametros almacenados; la diferencia es coherente con el weight tying, que duplica la matriz de embeddings y la cabeza de salida en el state dict.

La relevancia actual del modelo es acotada y hay que situarla en su nicho: es un banco de pruebas de bajo coste para estudiar recetas de preentrenamiento (efecto del optimizador Muon, sustitucion de embeddings posicionales por RoPE, curacion de corpus), no una alternativa a los SLM de 100-500 M de parametros que ya existen con ajuste por instrucciones. Esta entrenado exclusivamente en ingles, no tiene datos de codigo en la mezcla de preentrenamiento y el propio autor advierte que no es fiable en recuperacion factual ni en seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT con RoPE (rotary position embeddings) |
| Parametros totales | 105.552.448 parametros almacenados en safetensors; ~74,9 M parametros unicos efectivos segun la model card (weight tying entre embeddings y cabeza de salida) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible: los pesos se publican en fp32 (entrenamiento con autocast bf16). No hay versiones GGUF, int8 ni int4 publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 para pesos, `model.py` y README. Los datasets de entrenamiento conservan sus propias licencias (ODC-BY-1.0 en FineWeb-Edu, Cosmopedia-v2, FineMath y TxT360; CC-BY-SA-4.0 + GFDL en Wikipedia) |
| Formato de pesos | safetensors (fp32) mas `config.json` y `model.py`; no es un `AutoModel` de transformers |
| Capas / cabezas / dimension de embedding | 10 / 8 / 608 |
| Tokenizador | `tiktoken` GPT-2 BPE (`tiktoken.get_encoding("gpt2")`), vocabulario 50.257, sin tokenizador propio |
| Optimizador | Muon (matrices 2D) + AdamW (embeddings, LayerNorm, biases) |
| Precisión de entrenamiento | bf16 autocast; release en fp32 |
| Hardware de entrenamiento | Una sola NVIDIA RTX Pro 6000 |
| Fecha de publicacion | 14 de septiembre de 2026 (creacion del repositorio) |

## Arquitectura y entrenamiento

El bloque es un transformer decoder-only convencional: atencion multi-cabeza con RoPE aplicado a queries y claves, proyeccion MLP de expansion 4x, LayerNorm y bloques residuales pre-norm, siguiendo la receta de nanoGPT. El autor indica que MLP, LayerNorm y la estructura de bloque son identicos a los de GTM-v2-base y que el unico cambio arquitectonico de esta version es la introduccion de RoPE en lugar de embeddings posicionales absolutos aprendidos. La atencion usa el kernel fusionado `scaled_dot_product_attention` de PyTorch (ruta flash-attention), y las matrices de embeddings de entrada y la cabeza de salida comparten pesos. No se ha publicado el numero de tokens de entrenamiento ni la duracion del entrenamiento; solo se especifica que se ejecuto en una unica RTX Pro 6000.

La mezcla de datos esta explicitada al detalle en la model card: 35% FineWeb-Edu (`sample-10BT`), 25% Cosmopedia-v2, 15% FineMath (`finemath-4plus`), 15% TxT360 (config `default`) y 10% Wikipedia en ingles desde `wikimedia/structured-wikipedia` (config `enwiki_namespace_0`), aplanada de su esquema JSON anidado a texto plano. Respecto a releases anteriores, se sustituye el tramo crudo de FineWeb por TxT360, un corpus web mas deduplicado, y se anade una porcion dedicada de Wikipedia para densidad factual. La mezcla no incluye datos de codigo: el autor justifica que los corpus alojados por BigCode estan sujetos a click-through de terminos de uso en HuggingFace y anuncia un futuro release SFT especifico (`GTM-3-coder`) en lugar de forzar codigo en el preentrenamiento base. No hay RLHF, DPO ni ningun tipo de ajuste por preferencias; no se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Continuacion y generacion de texto libre en ingles, en modalidad de modelo base: completa fragmentos, no responde preguntas ni sigue instrucciones.
- Reconocimiento de plantillas textuales: puede activar formatos de prompt tipo "write code" y producir texto con sintaxis plausible, pero sin correccion funcional.
- Generacion de texto con estructura superficial creible en generos como narrativa breve, descripcion y texto expositivo, gracias a la mezcla Editorial/Cosmopedia.
- Manipulacion basica de expresiones matematicas simples por presencia de FineMath en la mezcla (15%), sin garantia de correccion aritmetica.
- Multilingue: no. Solo ingles.
- Tool calling / function calling: no soportado.
- Capacidades de agente, razonamiento multi-paso o modo de pensamiento: no soportadas.
- Vision, audio o cualquier otra modalidad: no soportadas.
- Capacidad de generacion con penalizacion de repeticion y muestreo top-k configurable desde `model.generate` (`temperature`, `top_k`, `repetition_penalty`, `eot_token`).

## Casos de uso

- Investigacion sobre recetas de preentrenamiento: sirve como punto de comparacion reproducible para medir el efecto de Muon frente a AdamW y de RoPE frente a embeddings posicionales absolutos, ya que el autor aisla RoPE como unico cambio arquitectonico respecto a GTM-v2-base.
- Docencia y divulgacion de arquitecturas transformer: con 10 capas, 8 cabezas y 608 dimensiones, el modelo es lo bastante pequeno para trazar la atencion y los logits capa por capa sin infraestructura especializada.
- Generacion de corpus sintetico de continuacion: se puede usar para producir texto abundantemente variado (con temperatura alta y penalizacion de repeticion) destinado a experimentos de destilacion o de filtrado, siempre que no se requiera veracidad factual.
- Ajuste fino posterior (SFT) como base: al liberarse bajo Apache 2.0 y en safetensors, es un punto de partida barato para experimentos de fine-tuning en dominios muy estrechos donde el conocimiento factual no provenga del modelo sino del corpus de ajuste. No se ha publicado ningun adaptador ni receta de SFT para esta version.
- Validacion de pipelines de tokenizacion y evaluacion: al usar exactamente el BPE de GPT-2 (`tiktoken`), permite comparar artefactos de tokenizacion y metricas de perplejidad contra modelos que comparten vocabulario sin coste de conversion.
- Simulacion de entornos con restricciones de memoria y comunicaciones: el modelo cabe holgadamente en el orden de 0,5 GB en fp32, por lo que se puede desplegar en dispositivos embebidos, portatiles o nodos de borde para probar estrategias de cuantizacion, batching o servido de baja latencia.
- Exploracion de decodificacion especulativa como modelo borrador: por tamano y por compartir tokenizador con buena parte del ecosistema GPT-2, es un candidato teorico a modelo draft; el autor no ha publicado ningun experimento en este sentido, por lo que habria que validarlo empiricamente.
- Estudio de sesgos y alucinacion en modelos pequenos: es un caso de laboratorio util para documentar como un modelo de ~75 M de parametros falla en recuperacion factual ("The capital of France is") y que tipo de contenido inventa con fluidez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de OPENGCM/GTM-3-base no incluye valores de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad sobre ningun conjunto de validacion, y los resultados de busqueda web no aportan metricas de este modelo.

## Requisitos de hardware

- VRAM para pesos en fp32: aproximadamente 422 MB (105.552.448 parametros x 4 bytes), coherente con el tamano de repositorio de 0,4 GB.
- VRAM para pesos en bf16/fp16 tras conversion manual: aproximadamente 211 MB.
- VRAM para pesos cuantizados a int8: aproximadamente 105 MB; a int4, aproximadamente 53 MB (no hay conversiones oficiales publicadas).
- Cache KV para los 1024 tokens de contexto: aproximadamente 25 MB en fp16 (10 capas x 8 cabezas x 76 dimensiones por cabeza x 2 tensores x 2 bytes x 1024 tokens). El consumo adicional es despreciable frente a los pesos.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, incluso GPUs con 6 GB o menos. Tambien es viable la inferencia en CPU.
- GPUs recomendadas: no se especifica ninguna para inferencia; el entrenamiento se realizo en una unica NVIDIA RTX Pro 6000.
- Opciones de despliegue: al no ser un `AutoModel` de transformers, requiere `model.py` del propio repositorio junto al checkpoint para cargar con PyTorch y safetensors. No hay soporte oficial ni conversiones publicadas para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Dependencias declaradas: `torch`, `safetensors`, `tiktoken`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparativo |
|---|---|---|---|---|---|
| GTM-3-base (OPENGCM) | 105,55 M almacenados / ~74,9 M efectivos | 1024 | Apache 2.0 | Pesos safetensors en HuggingFace, carga manual con `model.py` | No hay benchmarks publicados |
| GTM-v2-base (OPENGCM) | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (OPENGCM/GTM-v2-base) | No hay benchmarks publicados; el autor indica que GTM-3-base cambia el esquema posicional a RoPE y reemplaza parte del corpus |
| GTM-v1-base (OPENGCM) | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace (OPENGCM/GTM-v1-base) | No hay benchmarks publicados |
| GPT-2 small (OpenAI) | 124 M | 1024 | Modified MIT | Pesos en safetensors y formatos derivados ampliamente soportados | No comparable con datos publicados en esta ficha |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 | Apache 2.0 | Integracion nativa en transformers | No comparable con datos publicados en esta ficha |

La comparacion se limita a parametros, contexto, licencia y disponibilidad: no existe ningun benchmark publicado para GTM-3-base que permita contrastar calidad de generacion, perplejidad o razonamiento frente a estas alternativas. Ademas, GPT-2 small y SmolLM-135M tienen versiones ajustadas por instrucciones y soporte nativo en herramientas de despliegue, algo de lo que GTM-3-base carece.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni para chat: no responde preguntas de forma fiable y se limita a continuar texto.
- Recuperacion factual no fiable. El propio autor advierte que ante "The capital of France is" el modelo puede no producir "Paris" de forma consistente y generar contenido inventado con fluidez. La inclusion de Wikipedia (10% de la mezcla) pretende mitigarlo, pero no se ha verificado.
- Ausencia total de capacidad de codigo: no se incluyo ningun corpus de codigo en el preentrenamiento. Puede producir texto con forma de codigo, no codigo funcional.
- Tendencia a la repeticion: con decodificacion greedy o temperatura baja puede entrar en bucles o quedar fijado a plantillas estructurales. El autor recomienda una penalizacion de repeticion (por ejemplo 1.3) para reducirla.
- Solo ingles. No hay soporte multilingue ni se ha entrenado con corpus en castellano.
- Contexto de 1024 tokens, muy corto para casos de uso de documento largo, RAG con muchos pasajes o conversaciones multi-turno extensas.
- Capacidad absoluta probablemente inferior a la de releases anteriores de la propia familia GTM, segun reconoce el autor, que lo justifica como una eleccion deliberada para esta ejecucion.
- Discrepancia entre la cifra de parametros de la model card (~75 M) y los 105.552.448 parametros del fichero safetensors. Se explica por el weight tying entre embeddings y cabeza de salida, pero conviene verificarlo antes de calcular presupuestos de memoria o comparaciones de tamano.
- Restricciones de licencia: los pesos y el codigo del repositorio son Apache 2.0, lo que permite uso comercial, pero los datasets subyacentes mantienen sus propias licencias (ODC-BY-1.0 y CC-BY-SA-4.0 + GFDL). El repositorio no redistribuye los datos de entrenamiento, solo los pesos, pero las obligaciones de atribucion derivadas de los corpus deben revisarse si se reentrena o se redistribuye el modelo.
- Sin integracion estandar: no funciona con `AutoModel` de transformers, ni con vLLM, TGI, llama.cpp u Ollama sin trabajo de conversion adicional no soportado oficialmente. Esto encarece su uso en produccion.
- Ausencia de benchmarks publicados: no hay ninguna metrica objetiva de calidad, sesgo o robustez, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Riesgo de confusion de nombre: existen proyectos no relacionados con este modelo que usan el nombre OpenGCM (por ejemplo, un proyecto de modelado climatico alojado en GitLab) y una pagina de terceros que atribuye a OpenGCM un modelo de 9B parametros. No hay evidencia en la informacion disponible de que guarden relacion con OPENGCM/GTM-3-base.
- Sesgos conocidos: no se ha publicado ningun analisis de sesgos. Al estar entrenado sobre corpus web y enciclopedicos en ingles, es esperable que reproduzca los sesgos de esas fuentes, pero no hay documentacion al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OPENGCM/GTM-3-base
- Modelo anterior de la familia, GTM-v1-base: https://huggingface.co/OPENGCM/GTM-v1-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset TxT360: https://huggingface.co/datasets/LLM360/TxT360
- Dataset Wikipedia estructurada: https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Proyecto OpenGCM en GitLab (sin relacion confirmada con este modelo): https://gitlab.com/opengcm
- Pagina de terceros que menciona un "OpenGCM-v2" de 9B parametros (sin relacion confirmada): https://nitrai.dev/models.html
- No se han encontrado papers, blogs tecnicos ni demos adicionales asociados a este modelo en la busqueda web.
