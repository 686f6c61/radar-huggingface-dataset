# mentriaai/Ternary-Bonsai-2-9B-mentria

## Resumen

Ternary-Bonsai-2-9B-mentria es un modelo de lenguaje y vision (image-text-to-text) de 9.000 millones de parametros, construido sobre Qwen3.5-9B y cuantizado en formato ternario (−1 / 0 / +1) por prism-ml. El repositorio de mentriaai no re-cuantiza los pesos: repaqueta el GGUF original de prism-ml en safetensors con el formato propietario `mentria-q2g128-v1`, disenado para mentria-engine, un runtime WebGPU que ejecuta el modelo integramente en el navegador. El resultado ocupa 2,41 GB (mas 477 MB opcionales para la torre de vision), lo que permite desplegar un modelo de 9B en un cliente web sin servidor de inferencia.

La relevancia del modelo es practica: demuestra que la cuantizacion ternaria con escalas FP16 por grupo de 128 pesos (aproximadamente 2,13 bits por peso) permite servir un VLM de 9B en el navegador con velocidad de decodificacion superior a la de un modelo Q4 de 4B, manteniendo calidad comparable en matematicas y conocimiento y mejorando en seguimiento de instrucciones segun el piloto publicado por el autor. El 28 de octubre de 2026 fue elegido para sustituir a Qwen3.5-4B-mentria en el nivel superior de escritorio de mentria.ai.

La informacion publicada es limitada: el autor no documenta la composicion del dataset de entrenamiento, el contexto maximo ni los detalles del proceso de alineamiento. La model card se centra en la correccion numerica frente al runtime de referencia y en los resultados de un piloto de evaluacion reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con torre de vision de 27 bloques; pesos en base rotada por Hadamard |
| Parametros totales | 9.000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria q2g128 (mentria-q2g128-v1): codigo −1/0/+1 con una escala FP16 por grupo de 128 pesos, ~2,13 bits/peso; torre de vision Q4_0 con escalas MSE-optimas y matrices MLP en BF16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards: ~1,9 GB + ~509 MB), tokenizer.json, chat_template.jinja, preprocessor_config.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso con torre de vision acoplada. La torre de vision es la original de Qwen3.5-9B: 27 bloques, ancho 1152, 16 cabezas de 72 dimensiones, aproximadamente 0,46 B de parametros, que proyecta a embeddings de texto de 4096 dimensiones. Los pesos del modelo de lenguaje se almacenan en una base rotada por Hadamard; mentria-engine aplica la rotacion correspondiente a cada entrada de matmul en f32 con tamano de bloque 4096, de modo que la transformacion es exacta y no introduce error numerico adicional.

La cuantizacion ternaria se hereda del GGUF de prism-ml y se repaqueta, no se recalcula. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro alineamiento. La innovacion tecnica destacable no esta en el entrenamiento sino en el formato y el runtime: el reparto en dos shards por debajo de 2 GB permite que cada uno quepa en un ArrayBuffer de JavaScript, y las matrices de la torre de vision se mantienen parcialmente en BF16 (las 27 matrices de entrada de MLP, cuya dimension interna de 4304 no es multiplo del bloque Q4 de 32, y la matriz de salida del ultimo bloque) para evitar la deriva observada en una build Q4 plana.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y conocimiento general, evaluado en el piloto con MMLU-Redux.
- Resolucion de problemas matematicos de enunciado, evaluado con GSM8K.
- Seguimiento de instrucciones estrictas, evaluado con IFEval en modo prompt-level strict.
- Ejecucion en navegador mediante WebGPU, sin backend de servidor.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la informacion disponible.
- No se documenta modo thinking explicito ni entrada de audio.

## Casos de uso

- Asistente conversacional en el navegador: el modelo se ejecuta integramente en el cliente mediante mentria-engine y WebGPU, de modo que las conversaciones no requieren enviar datos a un servidor; es adecuado para aplicaciones donde la privacidad del texto y de las imagenes es un requisito.
- Descripcion y analisis de imagenes en local: con la torre de vision de 477 MB, el modelo puede procesar capturas, fotos o documentos escaneados introducidos por el usuario y responder preguntas sobre ellos sin subida de ficheros.
- Resolucion de problemas matematicos paso a paso: el rendimiento en GSM8K (85,0% en el piloto) lo hace util para tutoria o verificacion de calculos de enunciado en interfaces educativas.
- Seguimiento de instrucciones en formularios y asistentes guiados: la mejora de 15 puntos en IFEval frente al modelo Q4 de 4B lo hace preferible para tareas donde el formato de salida y las restricciones del prompt deben respetarse estrictamente.
- Prototipado y demos de IA en web: al caber en 2,41 GB y ejecutarse en Chrome sobre Apple M4 Pro a 57-58 tok/s, permite publicar demos funcionales de un modelo de 9B sin coste de GPU en servidor.
- Extension de navegador o aplicacion de escritorio ligera: el formato de dos shards bajo 2 GB facilita la carga por streaming en entornos JavaScript con limites de memoria por buffer.
- Evaluacion de cuantizacion ternaria en investigacion: el repositorio incluye el test golden teacher-forced (373/373 posiciones coincidentes con el runtime de referencia), lo que lo convierte en un caso de estudio reproducible para comparar precision ternaria frente a Q4 y BF16.

## Benchmarks y rendimiento

Piloto de 197 items (n = 60 / 57 / 60), decodificacion greedy, sin system prompt ni penalizacion de repeticion, sobre Apple M4 Pro. El modelo Q4 de referencia se ejecuto en mentria-engine; este modelo, en el fork de llama.cpp de PrismML. No se ejecutaron los conjuntos de test completos.

| Benchmark (n) | Q4 Qwen3.5-4B | Bonsai 2 9B (este modelo) | Diferencia, puntos (IC 95%) | p |
|---|---:|---:|---|---:|
| GSM8K, problemas matematicos (60) | 90,0% | 85,0% | −5,0 (−13,3; 1,7) | 0,38 |
| MMLU-Redux, conocimiento (57) | 82,5% | 80,7% | −1,8 (−8,8; 5,3) | 1,0 |
| IFEval, instrucciones, prompt-level strict (60) | 65,0% | 80,0% | +15,0 (3,3; 26,7) | 0,035 |

En un piloto ciego de chat de 20 prompts en cinco idiomas con un juez Claude Opus, este modelo fue preferido el 58,8% de las veces (IC 95% 39-78), diferencia no significativa.

Velocidad en mentria-engine (Mac, Apple M4 Pro, Chrome):

| Metrica | Q4 Qwen3.5-4B | Bonsai 2 9B |
|---|---:|---:|
| Decodificacion, prompt de 512 tokens | 23,9-24,1 tok/s | 57,4-58,4 tok/s (2,4x) |
| Primera palabra, prompt de 512 tokens | 2,0 s | 3,1 s |
| Primera palabra, prompt de 23 tokens | 0,29 s | 0,26 s |

Una respuesta de 128 tokens a un prompt de 512 tokens tarda aproximadamente 5,3 s frente a 7,3 s del modelo Q4.

Calidad de la torre de vision (teacher-forced, mismas imagenes):

| Torre | Tamano | Coseno de embedding de imagen | Mismo siguiente token que BF16 | Fallos decisivos |
|---|---:|---:|---:|---:|
| Este fichero | 477 MB | 0,974 | 96,1% | 4 |
| Build Q4 plana | 470 MB | 0,700 | 93,0% | 16 |
| BF16 | 912 MB | 1,000 | 99,8% | 0 |

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 2,41 GB para el modelo de lenguaje mas tokenizer; 477 MB adicionales si se usa la torre de vision. Total en torno a 2,9 GB.
- El modelo esta disenado para ejecutarse en el navegador mediante WebGPU; requiere un navegador compatible (verificado en Chrome) y una GPU con soporte WebGPU.
- Cabe en GPUs de consumo: la model card reporta ejecucion en Apple M4 Pro. No se documentan pruebas en RTX 4090, A100, H100 ni otras GPU discretas.
- Opciones de despliegue: mentria-engine (runtime WebGPU propietario del autor); el modelo base GGUF de prism-ml puede ejecutarse en el fork de llama.cpp de PrismML, que sirvio como referencia de correccion. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estandar.
- Latencia y throughput medidos en Apple M4 Pro con Chrome: 57,4-58,4 tok/s en decodificacion con prompt de 512 tokens; 3,1 s hasta la primera palabra con prompt de 512 tokens y 0,26 s con prompt de 23 tokens.
- No se dispone de datos de rendimiento en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-mentria | 9 B | no disponible | Ternaria q2g128, 2,41 GB + 477 MB vision | Apache 2.0 | mentria-engine (WebGPU) |
| Qwen3.5-4B-mentria (Q4) | 4 B | no disponible | Q4, 2.645 MB | no disponible en la informacion | mentria-engine (WebGPU) |
| Qwen3.5-9B (BF16, modelo base) | 9 B | no disponible | BF16 | no disponible en la informacion | Servidor GPU convencional |
| Torre de vision BF16 de referencia | ~0,46 B | no aplica | BF16, 912 MB | no disponible en la informacion | Referencia de comparacion |

En el piloto, este modelo supera al Qwen3.5-4B Q4 en IFEval (+15 puntos) y en velocidad de decodificacion (2,4x), con diferencias no significativas en GSM8K y MMLU-Redux, ocupando menos espacio en disco (2.419 MB frente a 2.645 MB). No se dispone de comparaciones con otros modelos ternarios o de 9B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del repositorio; el piloto ciego de chat incluyo cinco idiomas, pero no se documenta el rendimiento por idioma.
- No se documenta la longitud de contexto soportada, lo que impide planificar casos de uso con prompts largos.
- Los benchmarks publicados son un piloto de 197 items con intervalos de confianza amplios; no se ejecutaron los conjuntos completos, por lo que las conclusiones sobre calidad son provisionales.
- El modelo base ternario puede presentar mayor degradacion que una cuantizacion de 4 bits en tareas sensibles a la precision numerica; el autor solo reporta la comparacion con Q4 en tres benchmarks.
- La torre de vision en Q4 tiene un coseno de embedding de 0,974 frente a BF16 y un 3,9% de posiciones con siguiente token distinto, con 4 fallos decisivos; puede afectar a tareas visuales de precision.
- Riesgo de alucinacion no cuantificado en la informacion disponible; no se publican evaluaciones de factualidad ni de sesgo.
- El despliegue esta ligado a mentria-engine, un runtime propio del autor; no se garantiza compatibilidad con ecosistemas estandar como vLLM, TGI u Ollama.
- El modelo depende de WebGPU y de un navegador compatible; el rendimiento en GPU discretas o en otros navegadores no esta documentado.
- Aunque la licencia es Apache 2.0, el uso comercial del runtime mentria-engine y de la marca mentria.ai no se detalla en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/mentriaai/Ternary-Bonsai-2-9B-mentria
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo sustituido: https://huggingface.co/mentriaai/Qwen3.5-4B-mentria
- mentria.ai: https://mentria.ai
