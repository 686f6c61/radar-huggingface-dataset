# sampatil1010/gpt2-124m-tinystories

## Resumen

`sampatil1010/gpt2-124m-tinystories` es una reproduccion desde cero de la arquitectura GPT-2 Small (12 capas, 12 cabezas de atencion, 768 de dimension de embedding, vocabulario BPE de 50.257 tokens) entrenada por el usuario sampatil1010 en PyTorch sobre hardware Apple Silicon (MPS) y publicada en HuggingFace bajo licencia MIT. No es un ajuste fino de los pesos de OpenAI: el autor indica explicitamente que el preentrenamiento se hizo *from scratch*, con inicializacion aleatoria, usando como unico corpus TinyStories (~4,7 millones de tokens de narraciones infantiles sinteticas en ingles). El resultado es un modelo autoregresivo pequeno que sabe continuar cuentos simples, pero que no ha pasado por ninguna fase de instruccion, RLHF o DPO.

Su relevancia es mas didactica y de investigacion que productiva. Sirve como caso de estudio reproducible de un pipeline completo de preentrenamiento (tokenizacion, bucle de entrenamiento, checkpointing y publicacion en safetensors) en una sola maquina de consumo, y como punto de partida para experimentos controlados sobre curriculum de datos, tokenizadores y tecnicas de decodificacion. La ventana de contexto es de solo 256 tokens, muy por debajo de los 1.024 tokens del GPT-2 original, lo que limita cualquier uso que requiera memoria conversacional o documentos largos.

Conviene senalar una discrepancia tecnica relevante: el nombre del repositorio y la model card hablan de 124 millones de parametros, pero el recuento real de los tensores en safetensors es de 162.447.360 parametros. El desfase (unos 38,6M, el tamano exacto de la matriz de vocabulario) es compatible con un `lm_head` no atado a los embeddings de entrada, algo que el autor no documenta. El modelo no tiene descargas ni likes en el momento de redactar esta ficha y no publica ningun resultado de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, atencion causal), 12 capas, 12 cabezas, d_model 768 |
| Parametros totales | 162.447.360 (segun safetensors); la model card declara 124M nominales |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados; el repo contiene pesos en precision completa) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 50.257 tokens (GPT-2 BPE) |
| Tamano del repositorio | 0,6 GB |
| Pipeline | text-generation |
| Hardware de entrenamiento | Apple Silicon (MPS) |
| Dataset de entrenamiento | TinyStories, ~4,7 millones de tokens |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de GPT-2: 12 bloques con atencion multi-cabeza causal, normalizacion previa a cada subcapa, red feed-forward con activacion GELU y embeddings posicionales aprendidos de 256 posiciones. La configuracion declarada coincide con GPT-2 Small salvo por dos diferencias: la ventana de contexto, reducida a 256 tokens, y el recuento real de parametros, 162,4M en safetensors frente a los 124M que sugiere el nombre. La diferencia es coherente con que la matriz de salida (`lm_head`) no comparta pesos con el embedding de tokens (`wte`, 50.257 x 768 = 38.597.376 parametros), aunque el autor no lo especifica en la model card.

El unico dato de entrenamiento disponible es el corpus: TinyStories, un conjunto de relatos infantiles sinteticos generados con GPT-3.5 y GPT-4 por Eldan y Li, con un vocabulario deliberadamente simple. Se indica un volumen de aproximadamente 4,7 millones de tokens, lo que situa al modelo muy por debajo de los estandares habituales de preentrenamiento: GPT-2 Small original se entreno con decenas de miles de millones de tokens (WebText) y el propio paper de TinyStories explora modelos de hasta 33M de parametros entrenados durante varias epocas sobre un corpus mucho mayor. No hay informacion sobre numero de epocas, tamano de batch, learning rate, si se aplico weight decay, ni si se uso decodificacion especulativa, atencion lineal o cualquier otra innovacion. Tampoco se documenta ninguna fase de alineacion posterior (RLHF, DPO, SFT).

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, con muestreo configurable (temperature, top_k, do_sample) segun el ejemplo de la model card.
- Continuacion de narraciones infantiles sencillas: frases cortas, vocabulario basico y estructuras gramaticales simples, que es la distribucion sobre la que fue entrenado.
- Capacidad limitada de mantener coherencia local dentro de ventanas muy cortas (256 tokens), sin memoria de largo alcance.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo de razonamiento explicito ni de *thinking mode*.
- No dispone de capacidad de uso de agentes ni de razonamiento multi-paso.
- No soporta vision, audio ni entrada multimodal.
- Modelo puramente monolingue (ingles); no se documenta ningun tipo de transferencia multilingue.
- No ha sido instruido ni alineado, por lo que no sigue instrucciones ni responde a formatos de chat.

## Casos de uso

- Estudio didactico de preentrenamiento desde cero: el modelo permite recorrer el ciclo completo (tokenizacion BPE, bucle de entrenamiento en PyTorch, guardado en safetensors) sin infraestructura de GPU, usando una sola maquina, y comparar el resultado con los pesos originales de GPT-2 Small.
- Banco de pruebas de tecnicas de decodificacion: al ser un modelo pequeno y rapido, resulta util para medir el impacto de temperature, top_k, top_p, beam search o decodificacion especulativa sobre una distribucion de texto acotada y conocida.
- Experimentos de destilacion y compresion: sirve como profesor o alumno en pruebas de cuantizacion, poda o LoRA sobre una arquitectura GPT-2 estandar de 12 capas, con la ventaja de que el checkpoint completo ocupa unos 0,6 GB.
- Generacion de cuentos infantiles sinteticos a escala: puede emplearse para producir variaciones de micro-relatos en ingles, utiles como datos de aumento para entrenar o evaluar modelos mas pequenos, siempre que se revise la salida por coherencia.
- Pruebas de regresion de librerias de inferencia: al ser una arquitectura GPT-2 estandar con safetensors, permite validar integraciones con `transformers`, vLLM o llama.cpp (previa conversion a GGUF) en pipelines de CI sin coste de GPU.
- Investigacion sobre curriculum de datos: dado que el corpus es unico y de dominio muy estrecho, es un sujeto adecuado para medir como cambia el comportamiento al introducir mezclas de datos, ordenaciones o tecnicas de repeticion.
- Educacion en interpretabilidad: el modelo es lo bastante pequeno para inspeccionar patrones de atencion, embeddings y logits completos en una GPU de consumo o incluso en CPU, algo inviable en modelos de miles de millones de parametros.
- No es adecuado para atencion al cliente, generacion de codigo, matematicas, analisis de documentos ni ninguna tarea con requisitos de fiabilidad, contexto largo o multilingueismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K, Hellaswag, ARC ni ninguna otra tarea, y no se ha encontrado ningun informe externo que los aporte. Tampoco se publica perplejidad sobre un conjunto de validacion ni sobre el propio TinyStories.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 162,4M de parametros ocupan aproximadamente 0,65 GB; en fp16/bf16 unos 0,32 GB; una hipotetica cuantizacion a 8 bits lo dejaria en torno a 0,16 GB. Estas cifras son calculos teoricos a partir del recuento de parametros, ya que no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se ejecuta sin problema en RTX 3060, RTX 4090, A100 o H100, aunque en estas ultimas estara muy infrautilizado.
- Cabe holgadamente en GPU de consumo y tambien en CPU: la inferencia en CPU es viable para generacion de decenas de tokens, y en Apple Silicon (MPS) funciona de forma nativa, dado que ese fue el hardware de entrenamiento del autor.
- Opciones de despliegue: `transformers` con PyTorch directamente (el ejemplo de la model card usa `AutoModelForCausalLM` y `AutoTokenizer`); vLLM es compatible al tratarse de una arquitectura GPT-2 estandar; llama.cpp y Ollama requeririan una conversion previa a GGUF que el autor no proporciona; TGI es tecnicamente posible pero desproporcionado para este tamano.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| `sampatil1010/gpt2-124m-tinystories` | 162,4M reales (124M nominales) | 256 tokens | ~4,7M tokens de TinyStories, desde cero | Ingles | MIT | Sin benchmarks publicados; sin instruccion ni alineacion |
| GPT-2 Small (OpenAI) | 124M | 1.024 tokens | Decenas de miles de millones de tokens de WebText | Ingles | Modified MIT | Referencia de la arquitectura; requiere `transformers` con el tokenizador original |
| SmolLM2-135M (HuggingFace) | 135M | 8.192 tokens | Billones de tokens (SmolLM-Corpus), con fases de instruccion en variantes `-Instruct` | Ingles principalmente | Apache 2.0 | Modelo moderno de tamano comparable; contexto 32 veces mayor |
| TinyStories-33M (Eldan y Li / Microsoft Research) | 33M | 512 tokens en la implementacion del paper | Corpus TinyStories completo | Ingles | no disponible | Referencia directa del dominio; existen variantes de 1M a 33M |

Los datos de los modelos comparados proceden de sus fichas publicas; no se han ejecutado evaluaciones propias. La comparacion en rendimiento cuantitativo no es posible porque este modelo no publica ninguna metrica.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus TinyStories es texto sintetico generado por modelos, con roles de genero y familia muy estereotipados (ninos, ninas, mamas, papas, animales). Estos sesgos se reflejan en la salida y no se ha aplicado ninguna mitigacion.
- Riesgo de alucinacion elevado: al ser un modelo pequeno entrenado con muy pocos tokens y sin alineacion, genera con fluidez local pero con coherencia global baja, y puede producir texto que parece razonable pero es factualmente arbitrario.
- Limitacion de contexto severa: 256 tokens, la mitad o menos que el GPT-2 original. No admite conversaciones multi-turno, documentos largos ni resumen de textos extensos.
- Limitacion idiomatica: solo ingles. No hay evidencia de competencia en castellano; se espera degradacion fuerte en cualquier idioma distinto del ingles.
- Ausencia de instruccion: el modelo no sigue instrucciones, no responde a formatos de chat ni a system prompts, y no puede usarse como asistente sin un ajuste fino adicional.
- Capacidades no soportadas: sin tool calling, sin razonamiento multi-paso, sin codigo fiable, sin matematicas verificables, sin vision ni audio.
- Discrepancia de parametros: la model card declara 124M mientras que safetensors contiene 162.447.360 parametros. Quien planifique memoria o comparaciones de tamano debe usar la cifra real.
- Sin benchmarks: no existe ninguna evaluacion publicada, por lo que no hay base empirica para estimar calidad frente a alternativas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion. Es la parte mas favorable de esta ficha, aunque el modelo en si no sea apto para produccion seria.
- Caveat de produccion: no se recomienda su despliegue en entornos con usuarios finales. Su valor esta en la investigacion, la docencia y las pruebas de infraestructura.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el autor o su entrenamiento; los enlaces obtenidos eran contenido de foros sin relacion.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/sampatil1010/gpt2-124m-tinystories
- Paper de TinyStories (Eldan y Li, arXiv:2305.07759): https://arxiv.org/abs/2305.07759
- Dataset TinyStories en HuggingFace: https://huggingface.co/datasets/roneneldan/TinyStories
- Implementaciones de referencia de TinyStories para comparar: https://huggingface.co/roneneldan/TinyStories-33M
- Modelo GPT-2 original de OpenAI: https://huggingface.co/openai-community/gpt2
- SmolLM2-135M como alternativa moderna de tamano similar: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Busquedas web realizadas: no se han encontrado enlaces relevantes adicionales sobre este modelo, su autor o su entrenamiento.
