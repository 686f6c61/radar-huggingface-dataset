# bala5046/UltraSparse-10M

## Resumen

UltraSparse-10M es un modelo de lenguaje causal de aproximadamente 10 millones de parametros publicado en Hugging Face por el usuario bala5046 (Ayyappan Ayyanan). Se trata de un Transformer decoder-only pequeño, escrito en PyTorch y disenado explicitamente para experimentacion en CPU, no para produccion ni para competir con LLM de gran escala. El propio autor lo posiciona como un modelo experimental y educativo, sin ajuste por instrucciones.

Su interes tecnico no reside en la calidad del texto generado, sino en el mecanismo de computacion adaptativa que incorpora durante la decodificacion autoregresiva: cabezas auxiliares que estiman la dificultad del token actual y la demanda computacional futura a corto plazo, una profundidad de ejecucion variable por paso y un libro mayor (ledger) persistente que aplica una politica de gasto cero de deuda.

El modelo usa tokenizacion SentencePiece BPE con un vocabulario de solo 1024 piezas, RoPE en lugar de embeddings posicionales aprendidos, bloques residuales con pre-normalizacion y embeddings de entrada y salida atados. No se han publicado resultados de benchmarks, no se declara licencia ni idiomas soportados, y la checklist de publicacion del propio repositorio permanece sin marcar, por lo que debe tratarse como material reproducible de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, pre-normalizacion, RoPE, embeddings de entrada/salida atados, profundidad adaptativa en inferencia |
| Parametros totales | Aproximadamente 10 M (cifra declarada por el autor; la medicion del recuento figura como pendiente en su checklist) |
| Longitud de contexto | 256 tokens durante el entrenamiento (seq-len 256); no se documenta la longitud maxima soportada en inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se documenta la procedencia ni el idioma del corpus de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de PyTorch (.pt) |
| Tokenizador | SentencePiece BPE, vocabulario de 1024 piezas |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 29 de septiembre de 2026 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un Transformer causal con bloques residuales pre-normalizados, lo que facilita el entrenamiento estable y la ejecucion por prefijos de capas. Emplea RoPE (rotary position embeddings) en lugar de una tabla posicional absoluta aprendida, decision que el autor justifica por evitar el fallo tipico de indices posicionales cuando el contexto se recorta y por no consumir parametros en posiciones. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros. Sobre esta base se anaden dos cabezas: una de dificultad del token actual y otra de demanda futura a corto plazo, junto con un ledger de computo persistente que se arrastra entre pasos de decodificacion. La politica `predictive_ledger` aplica control de gasto cero de deuda: ninguna politica puede tomar prestado computo futuro y los intentos de sobrepasar el presupuesto se contabilizan y se fuerzan a la profundidad legal maxima. El camino adaptativo incluye una sonda de primer bloque con continuacion, sin ejecutar intencionadamente el primer bloque dos veces.

El entrenamiento se realiza en CPU sobre un corpus de texto local no especificado, con SentencePiece entrenado aparte (`train_tokenizer.py`, vocab-size 1024) y un bucle de entrenamiento de 20 000 pasos, batch size 2, seq-len 256 y 8 hilos. El autor recomienda ejecutar primero una prueba de humo de 20 pasos y la bateria de tests antes de lanzar la ejecucion completa. No se documenta el numero de tokens vistos, la composicion del dataset, la procedencia del corpus ni ninguna fase de ajuste por instrucciones, RLHF o DPO. Existe una linea base v3 con tokenizacion por bytes que se conserva como referencia historica; la v4 se entrena desde cero porque cambiar el tokenizador altera las formas de los embeddings y de la salida.

## Capacidades

- Generacion de texto causal basica en ingles u otro idioma no especificado, sin ajuste por instrucciones: el modelo continua texto, no responde a ordenes.
- Profundidad de computo adaptativa por token: la profundidad efectiva de ejecucion varia en inferencia segun las cabezas de dificultad y de demanda futura.
- Presupuesto de computo auditable: el ledger persistente registra el gasto por paso y fuerza la profundidad legal maxima cuando se intenta exceder el presupuesto.
- Decodificacion configurable: temperatura, top-k y top-p se exponen en `generate.py` (`--temperature 0.8 --top-k 40 --top-p 0.9` en el ejemplo del autor).
- Evaluacion y control de calidad integrados en el repositorio mediante `evaluate.py`, `quality_gate.py` y `benchmark.py`.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponibles, no documentadas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre computacion adaptativa en inferencia: el modelo permite medir el efecto de distintas politicas de profundidad variable sobre la calidad del texto con un coste de CPU bajo, comparando politicas con el mismo presupuesto.
- Docencia y cursos de LLM: con ~10 M de parametros, el ciclo completo de tokenizacion, entrenamiento de 20 000 pasos, evaluacion y generacion cabe en un portatil, lo que permite que el alumnado ejecute el pipeline entero y no solo la inferencia.
- Banco de pruebas de politicas de presupuesto: la politica `predictive_ledger` con control de deuda cero sirve para experimentar con asignacion de computo y verificar el comportamiento ante intentos de sobrepaso del presupuesto.
- Prototipado de tokenizadores a medida: el flujo `train_tokenizer.py` con vocab-size configurable permite estudiar el efecto del tamano de vocabulario (1024 piezas) en un modelo pequeño antes de escalar a otro mayor.
- Ablaciones arquitectonicas controladas: la combinacion de RoPE, pre-normalizacion y embeddings atados esta aislada en un modelo de 10 M, lo que facilita experimentos de ablacion con semillas fijas y estado de optimizador guardado.
- Generacion de texto offline en entornos sin GPU: el checkpoint se ejecuta en CPU con 8 hilos, lo que permite usarlo como generador de texto local en pruebas de integracion y validacion de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `benchmark.py` y `quality_gate.py`, y el autor insiste en comparar todas las politicas con el mismo presupuesto y en no reclamar mejoras de velocidad a partir de una sola medicion, pero no se adjuntan cifras, JSON de benchmark ni comparaciones con MMLU, HumanEval, GSM8K o similares. La checklist de publicacion del autor sigue sin marcar los puntos "benchmark JSON committed", "parameter count measured" y "CPU hardware and thread count recorded".

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica medicion. Partiendo del tamano declarado (~10 M de parametros), el peso del modelo ocupa aproximadamente 40 MB en fp32 y 20 MB en fp16/bf16; la activacion de una ventana de 256 tokens es despreciable frente a esas cifras.
- GPU recomendadas: ninguna en particular. El modelo esta disenado para CPU; cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) lo ejecutaria con una ocupacion de memoria insignificante.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB de memoria libre; tambien se ejecuta integramente en CPU.
- Configuracion de CPU de referencia: el ejemplo del autor usa `--threads 8` para entrenamiento y `--threads 4` para la prueba de humo, con 8 hilos tambien en el benchmark.
- Opciones de despliegue: scripts nativos de PyTorch incluidos en el repositorio (`train.py`, `generate.py`, `evaluate.py`, `benchmark.py`, `quality_gate.py`). No hay pesos en formato GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM o TGI no estan soportados ni documentados.
- Latencia y throughput estimados: no disponibles. No se ha publicado ningun JSON de benchmark ni medicion de tokens por segundo.

## Comparativa con modelos similares

Los valores de los modelos comparativos proceden de sus documentaciones publicas. La comparacion de rendimiento no es posible porque UltraSparse-10M no publica resultados de benchmarks.

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| UltraSparse-10M | ~10 M | 256 tokens (entrenamiento) | SentencePiece BPE, 1024 piezas | no disponible | no |
| GPT-2 small | 124 M | 1024 tokens | BPE, 50 257 piezas | MIT | si |
| Pythia-14M | 14 M | 2048 tokens | BPE estilo GPT-NeoX | Apache 2.0 | si |

Si se busca un modelo de escala equivalente con licencia clara y evaluacion publicada, Pythia-14M es la alternativa documentada mas cercana en numero de parametros; GPT-2 small es la referencia historica de la familia decoder-only pequena. Ninguno de los dos incorpora profundidad adaptativa ni ledger de computo.

## Limitaciones y advertencias

- No esta ajustado por instrucciones: no es adecuado para asistentes, chat ni tareas guiadas por prompt en formato de orden.
- Riesgo de alucinacion muy alto: con ~10 M de parametros y un corpus de entrenamiento no documentado, la coherencia del texto generado sera limitada y las afirmaciones factibles seran poco fiables.
- Sesgos conocidos: no disponibles, ya que no se documenta la procedencia, el idioma ni la composicion del corpus de entrenamiento.
- Limitacion de contexto: la ventana utilizada en entrenamiento es de 256 tokens; no se documenta soporte para contextos mayores en inferencia.
- Limitacion de idioma: no se declara ningun idioma soportado, por lo que no puede asumirse un comportamiento multilingue ni siquiera monolingue correcto.
- Vocabulario muy reducido: 1024 piezas BPE obligan a fragmentar palabras frecuentes en varios tokens, lo que penaliza la eficiencia de la secuencia y la calidad de la representacion.
- Licencia no disponible: sin licencia declarada no puede asumirse permiso para uso comercial ni para redistribucion. Cualquier uso en produccion queda bloqueado hasta que el autor la especifique.
- Publicacion incompleta: la checklist del repositorio no esta marcada, incluyendo el recuento medido de parametros, la documentacion del split train/validation/test, el JSON de benchmark y la procedencia del corpus.
- El propio autor advierte de que el ledger de computo persistente es una decision de diseno del proyecto y que no debe presentarse como novedoso sin una revision formal de la literatura.
- El repositorio no declara pipeline en Hugging Face y no incluye pesos en formatos estandar de inferencia (GGUF, safetensors), lo que limita su integracion directa en herramientas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bala5046/UltraSparse-10M
- Perfil del autor: https://huggingface.co/bala5046
- Listado de modelos del autor: https://huggingface.co/bala5046/models
- Dataset mencionado en los resultados de busqueda (agentic-workflow): https://huggingface.co/bala5046/agentic-workflow
- Publicacion del autor en LinkedIn: https://www.linkedin.com/posts/ayyappan-ayyanan-7a9258381_artificialintelligence-opensource-machinelearning-activity-7505273202609143808-XPhF
- Articulo de Nature sobre sistemas optoacusticos "ultrasparse": https://www.nature.com/articles/s44460-026-00071-x (coincidencia de nombre; no guarda relacion con este modelo de lenguaje)
- Paper, blog tecnico o demo del modelo: no disponible
