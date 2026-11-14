# ashishpatel26/jatayu-hi-11m

## Resumen

Jatayu-hi-11M es un modelo de lenguaje causal de 11,4 millones de parametros entrenado desde cero (inicializacion aleatoria, sin pesos preentrenados) por el autor ashishpatel26 para el hindi en escritura devanagari. Forma parte de la coleccion Ramayana Series, una familia de pequenos modelos Indic donde cada modelo lleva el nombre de un personaje del Ramayana; Jatayu es el miembro mas pequeno de la serie y sirve como prueba de concepto de que todo el pipeline de preentrenamiento funciona en una unica GPU de consumo con 6 GB de VRAM.

El modelo emplea una arquitectura transformer decoder-only de estilo Llama (RMSNorm, MLP SwiGLU, embeddings posicionales rotatorios, atencion SDPA y embeddings de entrada/salida atados), con 4 capas, dimension oculta de 256, FFN de 704 y 4 cabezas de atencion (4 cabezas KV). Su ventana de contexto es de solo 256 tokens y el vocabulario, construido con SentencePiece Unigram, es de 32.000 entradas con byte fallback.

Se trata de un modelo base, no ajustado a instrucciones: continua texto en lugar de responder preguntas. Su interes es principalmente pedagogico y de investigacion: ensena como se construye un tokenizador devanagari eficiente, como se limpia y deduplica un corpus de Wikipedia y como se entrena un LM causal completo con presupuesto de hardware minimo, ademas de servir como linea base para comparar tokenizadores, mezclas de datos y escalado de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, SwiGLU, RoPE, SDPA, embeddings atados) |
| Parametros totales | 11.405.568 (11,4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en bf16/fp32 segun transformers; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Hindi (`hi`, devanagari); no soporta hindi romanizado ni otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4 capas con dimension oculta 256, FFN 704, 4 cabezas de atencion y 4 cabezas KV (sin GQA efectivo dado que cabezas = cabezas KV), contexto de 256 tokens y vocabulario de 32.000 tokens. Usa RMSNorm, MLP SwiGLU, rotary position embeddings, atencion SDPA y embeddings de entrada/salida atados, replicando la configuracion de `LlamaForCausalLM` de Hugging Face.

El entrenamiento se realizo desde cero con inicializacion aleatoria en una unica NVIDIA RTX 3060 Laptop con 6 GB de VRAM, en precision bf16 autocast, optimizador AdamW (beta 0.9/0.95), weight decay 0.1, grad clip 1.0 y learning rate pico 6e-4. El corpus procede de Hindi Wikipedia (`wikimedia/wikipedia`, config `20231101.hi`, 163.000 articulos, 608 MB en bruto), limpiado con normalizacion Unicode NFC, eliminacion de URLs, filtro de lineas de al menos 20 caracteres y al menos 80 por ciento de caracteres devanagari, y deduplicacion exacta por MD5, resultando en 948.000 lineas. Se reservo cada 200-esima linea para validacion, quedando 55,7M tokens de entrenamiento y 0,3M de validacion; el modelo vio 33M tokens durante el entrenamiento segun la model card. El tokenizador SentencePiece Unigram de 32.000 entradas con byte fallback y cobertura de caracteres 0,9995 se entreno sobre el corpus limpio y produce aproximadamente 1,1 tokens por palabra hindi, muy por debajo de lo que necesitan tokenizadores centrados en ingles para devanagari. Los tokens especiales incluyen `<pad>`=0, `<unk>`=1, `<s>`=2, `</s>`=3 y etiquetas de idioma (`<hi>`, `<mr>`, etc.) reservadas para futuros modelos multilingues. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto en hindi con escritura devanagari: produce continuaciones gramaticalmente correctas a partir de un prefijo.
- Modelo base de continuacion de texto: no sigue instrucciones ni responde preguntas; hay que escribir el inicio de una frase, no una pregunta.
- Tokenizacion eficiente de devanagari (aproximadamente 1,1 tokens por palabra) gracias al tokenizador SentencePiece Unigram entrenado sobre el corpus.
- Soporte de etiquetas de idioma en el vocabulario (`<hi>`, `<mr>`, etc.), pensadas para modelos multilingues futuros; el uso documentado exige prefijar el prompt con `<hi>`.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision, audio ni capacidades de agente.
- No dispone de capacidades multilingues efectivas: solo hindi en devanagari; queda fuera de alcance el hindi romanizado y cualquier otro idioma.

## Casos de uso

- Prueba de humo del pipeline de preentrenamiento: usar el modelo para verificar que tokenizador, carga de datos, bucle de entrenamiento y generacion funcionan de extremo a extremo en una GPU de 6 GB, antes de escalar a modelos mayores de la serie.
- Material didactico de preentrenamiento: reproducir el entrenamiento desde cero en hardware de consumo y estudiar cada etapa (limpieza de Wikipedia, deduplicacion MD5, split de validacion, configuracion AdamW) con un coste computacional minimo.
- Linea base para comparar tokenizadores de devanagari: medir tokens por palabra y perplexity frente a tokenizadores centrados en ingles para cuantificar la ganancia de eficiencia del vocabulario SentencePiece Unigram.
- Linea base para experimentos de mezcla de datos y escalado de modelos pequenos: comparar la perplexity de validacion (107,5) con la de Hanuman-hi-42M (46,4) para estudiar como escala el rendimiento con el tamano en esta familia.
- Punto de partida para SFT o LoRA en hindi: ajustar el modelo base para clasificacion de texto, resumen o seguimiento de instrucciones sencillas en hindi, aprovechando que la gramatica ya esta aprendida.
- Generacion de texto sintetico de bajo coste para pruebas de infraestructura: alimentar pipelines de inferencia (transformers, text-generation-inference) con un modelo minusculo para validar despliegues y latencias sin consumir recursos de GPU relevante.
- Comparacion interna de la serie Ramayana: usar Jatayu-hi-11M como referencia inferior de la curva de perdida frente a Hanuman-hi-42M y otros miembros de la coleccion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| Validation loss | Hindi Wikipedia, held-out 0,5 % (`wikimedia/wikipedia`, config `20231101.hi`) | 4,678 |
| Validation perplexity | Hindi Wikipedia, held-out 0,5 % (`wikimedia/wikipedia`, config `20231101.hi`) | 107,5 |

Comparativa dentro de la serie Ramayana (segun la model card; perplexity medida sobre 100 lotes de texto held-out de Wikipedia hindi, cada 200-esima linea, nunca entrenada):

| Modelo | Parametros | Validation loss | Perplexity |
|---|---|---|---|
| Jatayu-hi-11M | 11,4M | 4,678 | 107,5 |
| Hanuman-hi-42M | 42,1M | 3,838 | 46,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16/fp32 dado el tamano de 11,4M parametros (unos 23 MB en bf16 y 46 MB en fp32 solo de pesos); el cuello de botella real es negligible frente a cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entreno en una RTX 3060 Laptop de 6 GB, por lo que esa GPU (o inferior) es suficiente para inferencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (`LlamaForCausalLM`) con el tokenizador SentencePiece del repo; compatible con text-generation-inference y endpoints segun los tags del repo. No se documentan variantes GGUF para llama.cpp/Ollama ni pesos cuantizados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia sera dominada por el overhead del runtime y no por el calculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity (Wikipedia hindi held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jatayu-hi-11M | 11,4M | 256 | 107,5 | Apache-2.0 | Hugging Face (`ashishpatel26/jatayu-hi-11m`) |
| Hanuman-hi-42M | 42,1M | no disponible | 46,4 | no disponible en la informacion proporcionada | Hugging Face (`ashishpatel26/hanuman-hi-42m`) |
| Otros modelos comparables de tamano similar o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con Hanuman-hi-42M, el siguiente miembro de la misma serie Ramayana: casi cuatro veces mas parametros y menos de la mitad de perplexity, lo que ilustra el escalado dentro de la familia. No se dispone de datos de benchmarks ni de especificaciones de terceros (por ejemplo, modelos Indic pequenos de otros autores) en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion elevada: el propio autor advierte que el modelo escribe hindi gramatical pero inventa la mayoria de los hechos; los ejemplos de la model card incluyen afirmaciones falsas sobre Mahatma Gandhi o la capital de India.
- No es un modelo de instrucciones: no responde preguntas, no sigue instrucciones y no sirve como asistente conversacional sin ajuste adicional y trabajo de seguridad.
- Fuera de alcance cualquier uso donde importe la exactitud factual: noticias, medicina, derecho, finanzas o respuestas educativas.
- Solo hindi en devanagari: no soporta hindi romanizado ni otros idiomas; las etiquetas de idioma adicionales estan reservadas para modelos futuros, no para este.
- Contexto muy corto (256 tokens), lo que limita drasticamente conversaciones multi-turno, resumen de documentos largos y cualquier tarea que requiera memoria extendida.
- Entrenado sobre Wikipedia hindi con 33M tokens vistos: cobertura limitada de dominios y estilos, sesgos derivados de la enciclopedia y posible infrarrepresentacion de registros coloquiales.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base no es apto para produccion sin ajuste; el autor lo describe explicitamente como modelo de prueba de humo y linea base, no para uso real.
- Estado estatico: modelo base entrenado sobre un dataset offline, sin actualizaciones ni versiones posteriores documentadas.
- Modelo con muy pocas descargas y likes en Hugging Face en el momento de la ficha: escasa validacion comunitaria de los resultados declarados, que figuran como no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/ashishpatel26/jatayu-hi-11m
- Coleccion Ramayana Series: https://huggingface.co/collections/ashishpatel26/ramayana-series-indic-llms-from-scratch-6af7e87d0a621b28fed81feb
- Sitio web de la serie: https://ashishpatel26.github.io/ramayana-llm/
- Modelo hermano Hanuman-hi-42M: https://huggingface.co/ashishpatel26/hanuman-hi-42m
- Perfil del autor: https://huggingface.co/ashishpatel26
- Dataset utilizado: https://huggingface.co/datasets/wikimedia/wikipedia
