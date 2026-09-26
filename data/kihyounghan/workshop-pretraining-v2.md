# kihyounghan/workshop-pretraining-v2

## Resumen

`kihyounghan/workshop-pretraining-v2` es un checkpoint educativo de un modelo de lenguaje decoder-only de 123,6 millones de parametros, publicado por el usuario kihyounghan como parte de un taller practico de preentrenamiento de LLM. No es un modelo utilizable: se entreno desde cero durante unicamente 100 pasos de optimizacion, equivalentes a unos 52,4 millones de tokens, aproximadamente el 0,5 % del plan de 10 000 millones de tokens previsto en el cuaderno del taller. El propio autor lo describe como un ejemplo para verificar el circuito completo de preentrenamiento, guardado y subida a Hugging Face.

La arquitectura es un Transformer decoder-only de tamano GPT-2 pequeno (12 capas, 768 de dimension oculta, 12 cabezas de atencion, vocabulario de 50 304 tokens) pero con componentes modernos: RMSNorm en pre-norm, embeddings rotatorios (RoPE con theta = 10 000), activacion ReLU² en la capa feed-forward, ausencia de sesgos y soft-capping de logits con tanh. La longitud de contexto es de 1024 tokens y los pesos estan en formato safetensors. No se declara licencia en el repositorio.

Su relevancia no es funcional sino didactica: sirve como referencia reproducible de una arquitectura GPT-2 modernizada (`gpt2-workshop`), como banco de pruebas de carga con `trust_remote_code=True` y como punto de partida para quien quiera continuar el preentrenamiento en hardware de consumo. Cualquier evaluacion de calidad de generacion, razonamiento o codigo queda fuera de su alcance: la perdida final de entrenamiento (6,97 en el paso 100) esta lejos de la de un modelo convergido y la precision en LAMBADA es 0,0000.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con componentes modernos (GPT-2 sized) |
| Parametros totales | 123 652 864 segun safetensors del repositorio; la model card indica 123 587 328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (etiqueta `en`); la model card incluye un resumen en coreano, pero no se declara entrenamiento en coreano |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Capas / dimension oculta / cabezas | 12 / 768 / 12 (dimension por cabeza 64) |
| Vocabulario | 50 304 (BPE de GPT-2 con 50 257 tokens, ampliado a multiplo de 64) |
| Tokenizador | codificacion GPT-2 de `tiktoken` (`<|endoftext|>` = 50256) |
| Feed-forward | expansion 4x, activacion ReLU², sin sesgos |
| Normalizacion | RMSNorm, pre-norm |
| Codificacion posicional | embeddings rotatorios (RoPE, theta = 10000) |
| Cabeza de salida | atada a los embeddings de entrada, soft-capping de logits con tanh (cap = 30) |
| Dropout | 0,1 (solo en entrenamiento) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Ultima actualizacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura propia, no `GPT2LMHeadModel`, definida en los ficheros `configuration_gpt2workshop.py` y `modeling_gpt2workshop.py` incluidos en el repositorio; por ese motivo su carga exige `trust_remote_code=True`. Estructuralmente es un decoder-only de 12 capas con 768 de dimension oculta y 12 cabezas de atencion, con expansion 4x en la capa feed-forward, activacion ReLU² y ausencia total de sesgos. La normalizacion es RMSNorm en configuracion pre-norm, la posicion se codifica con RoPE (theta = 10 000) y la cabeza de salida esta atada a los embeddings de entrada, con soft-capping de logits mediante tanh con tope de 30. El vocabulario es el BPE de GPT-2 (50 257 tokens) ampliado a 50 304 para que sea multiplo de 64.

Los datos de entrenamiento proceden del subconjunto `sample-10BT` de HuggingFaceFW/fineweb-edu, en streaming y tokenizado en fragmentos `uint16`. El preentrenamiento se limito a 100 pasos de optimizador con 524 288 tokens por paso (micro-batch de 4 x 1024 tokens con 128 pasos de acumulacion de gradiente), lo que suma unos 52,4 millones de tokens vistos. El optimizador fue AdamW con betas (0,9, 0,95), weight decay de 0,1 no aplicado a normalizaciones ni a parametros unidimensionales, learning rate pico de 6e-4 con warmup lineal de 10 pasos seguido de decaimiento coseno hasta 6e-5, y recorte de gradiente de 1,0. Se entreno en bfloat16 con autocast, en PyTorch sin `torch.compile`, sobre una unica GPU NVIDIA GeForce RTX 3080 Laptop de 8 GB durante unos 93 minutos, a aproximadamente 9000 tokens por segundo. No se aplico RLHF, DPO ni ninguna fase de ajuste por preferencias.

Los resultados de entrenamiento son los siguientes: perdida 8,58 en el paso 10, 7,28 en el paso 50 y 6,97 en el paso 100. Como referencia, una eleccion uniforme al azar sobre este vocabulario daria una perdida de aproximadamente 10,8. No se reporta ningun otro resultado de evaluacion.

## Capacidades

- Generacion de texto a nivel de palabra frecuente: el modelo produce secuencias de tokens habituales en ingles, pero sin gramatica ni coherencia semantica.
- Continuacion de prompts: acepta una entrada y genera hasta `max_new_tokens` tokens con muestreo (temperatura, top-k), aunque la salida no guarda relacion con el prompt.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, planificacion ni razonamiento multi-paso.
- No tiene modo de razonamiento explicito (thinking mode).
- No tiene capacidades de vision, audio ni multimodalidad.
- No tiene capacidades multilingues: los datos de entrenamiento son exclusivamente texto web en ingles.
- No tiene modo de chat ni plantilla de conversacion; es un checkpoint base de preentrenamiento, no un modelo instruido.
- Su unica utilidad practica es como objeto de pruebas tecnicas de carga, exportacion y ejecucion, no como generador de contenido.

## Casos de uso

- Material didactico para talleres de preentrenamiento: el checkpoint ilustra paso a paso el ciclo completo de definicion de arquitectura, entrenamiento, guardado en safetensors y publicacion en Hugging Face, con hiperparametros y curva de perdida documentados.
- Prueba de humo (smoke test) de pipelines de carga: permite verificar que un entorno con `transformers` resuelve correctamente `trust_remote_code=True` y ejecuta codigo de modelado custom antes de pasar a modelos de produccion.
- Validacion de flujos de exportacion a safetensors: al ser un modelo pequeno (0,5 GB de repositorio), sirve para comprobar scripts de conversion, sharding y verificacion de integridad sin consumir tiempo ni ancho de banda significativos.
- Referencia de implementacion de componentes modernos: los ficheros de modelado muestran en codigo funcional RoPE, RMSNorm en pre-norm, ReLU², embeddings atados y soft-capping de logits, utiles para portar estas tecnicas a otros proyectos.
- Medicion de rendimiento en hardware modesto: con 1024 tokens de contexto y 12 capas, es un banco de pruebas adecuado para medir latencia y throughput de atencion en CPU, GPUs de gama baja o entornos embebidos.
- Reanudacion de preentrenamiento con propositos de investigacion: al conservar optimizer y plan de datos documentados, se puede usar como punto de partida para experimentos de continuacion de entrenamiento a pequena escala y comparar curvas de perdida.
- Pruebas de tokenizacion: el uso de `tiktoken` con la codificacion GPT-2 permite validar pipelines de tokenizacion y calculo de longitudes de secuencia sin depender de tokenizadores propietarios.
- Docencia sobre limites de escala: resulta util para demostrar empiricamente por que 52 millones de tokens son insuficientes para obtener lenguaje coherente, comparando la perdida observada con la de referencia aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo unico reportado por el autor es la evolucion de la perdida de entrenamiento y la precision en LAMBADA:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento, paso 10 | 8,58 |
| Perdida de entrenamiento, paso 50 | 7,28 |
| Perdida de entrenamiento, paso 100 | 6,97 |
| Precision en LAMBADA (pasos 50 y 100) | 0,0000 |
| Perdida de referencia con eleccion uniforme al azar | ~10,8 |

No se proporcionan comparaciones con otros modelos en la model card ni en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 123,6 millones de parametros, lo que supone aproximadamente 494 MB en fp32 y 247 MB en bf16/fp16, sin contar activaciones ni cache KV. Con contexto de 1024 tokens, la cache KV es muy reducida.
- Cabe en cualquier GPU de consumo: tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.) lo ejecutan sin dificultad en precision completa. Tambien puede ejecutarse en CPU.
- GPU recomendadas: no requiere hardware de gama alta; una RTX 3080 Laptop de 8 GB fue suficiente para entrenarlo. Para inferencia basta cualquier GPU moderna o incluso CPU.
- Despliegue: la via soportada es `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`. No se han publicado pesos en GGUF, por lo que llama.cpp y Ollama no son opciones directas. Al usar una arquitectura custom, vLLM y TGI requeririan implementar el modelado correspondiente; no hay soporte declarado.
- Latencia y throughput: no se publican mediciones de inferencia. El unico dato de rendimiento disponible es de entrenamiento: aproximadamente 9000 tokens por segundo en una RTX 3080 Laptop de 8 GB durante 93 minutos.
- Almacenamiento: el repositorio ocupa 0,5 GB e incluye el codigo de modelado custom, que debe revisarse antes de ejecutarlo.

## Comparativa con modelos similares

No se incluyen comparativas en la informacion proporcionada. Como referencia arquitectonica de la misma escala, el unico paralelo claro es GPT-2 de 124 millones de parametros, del que este modelo hereda el tamano, el vocabulario y la longitud de contexto:

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| workshop-pretraining-v2 | 123,6 M | 1024 | ~52,4 M tokens de fineweb-edu | No disponible | Hugging Face |
| GPT-2 (124 M) | ~124 M | 1024 | ~40 GB de WebText | No disponible en la informacion proporcionada | Publico desde 2019 |
| Alternativas de escala similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa de rendimiento no es posible: este checkpoint no reporta MMLU, HumanEval ni GSM8K, y su precision en LAMBADA es 0,0000.

## Limitaciones y advertencias

- Entrenado solo durante 100 pasos de optimizador: las salidas son repetitivas, agramaticales y sin relacion con el prompt. El propio autor lo califica como no utilizable como modelo de lenguaje.
- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgo. Los datos de fineweb-edu son texto web en ingles y pueden contener sesgos y errores, aunque el entrenamiento tan corto limita su manifestacion.
- Riesgo de alucinacion: total. El modelo no ha aprendido hechos ni gramatica; genera palabras frecuentes sin contenido factual.
- Limitaciones de contexto e idioma: ventana de 1024 tokens y entrenamiento exclusivamente en ingles. No hay soporte multilingue real.
- Ausencia de evaluacion de seguridad: no se ha evaluado seguridad, factualidad ni alineacion. No debe exponerse a usuarios finales ni integrarse en aplicaciones reales.
- Restricciones de licencia: no se declara licencia en el repositorio, por lo que el uso comercial queda en situacion juridica indeterminada. Debe contactarse con el autor antes de cualquier uso productivo.
- Riesgo de seguridad en la carga: requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python alojado en el repositorio. Conviene revisar `configuration_gpt2workshop.py` y `modeling_gpt2workshop.py` o fijar un commit concreto mediante `revision`.
- Compatibilidad limitada: al no ser `GPT2LMHeadModel`, no funciona con herramientas que asuman la arquitectura estandar de GPT-2, y no hay soporte en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kihyounghan/workshop-pretraining-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo (foros de una comunidad de rol en frances) y se descartan por no ser relevantes.
