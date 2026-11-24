# danxx891/shake-the-flass

## Resumen

`danxx891/shake-the-flass` es un modelo de lenguaje de tipo GPT minúsculo, entrenado desde cero en MLX (la libreria de aprendizaje automatico de Apple para Apple Silicon) por el autor independiente danxx891. Con 17.016.576 parametros, 6 capas, anchura 384 y 6 cabezas de atencion, es un experimento de investigacion sobre el fenomeno de *model collapse* (colapso de modelo): la degradacion progresiva de un modelo generativo cuando se entrena exclusivamente con datos generados por otro modelo, sin acceso a datos humanos originales.

El modelo es la quinta generacion de una cadena artificial. La generacion 0 se entreno con 90 libros infantiles reales de Project Gutenberg (6.548.384 tokens, tokenizer BPE byte-level de 8.192 piezas). Cada generacion posterior partio de pesos aleatorios y se entreno unicamente con las historias escritas por su generacion predecesora, en la misma cantidad de tokens. El resultado es un modelo que ha perdido la mayor parte de su vocabulario, repite frases de forma obsesiva, abre capitulos con formulas fijas ("There was once a...") y produce palabras inexistentes como "flass".

Es relevante ahora porque documenta de forma reproducible y con metricas cuantitativas el colapso de un modelo de lenguaje pequeno en solo cinco iteraciones de autoentrenamiento, un fenomeno de creciente interes para quien disena pipelines de datos sinteticos. No es un modelo de proposito general ni apto para produccion: es una pieza de divulgacion cientifica con pesos publicados bajo licencia MIT y scripts de inferencia en MLX y PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (6 capas, 384 de anchura, 6 cabezas de atencion, posiciones aprendidas) |
| Parametros totales | 17.016.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente en precision completa; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico escrito desde cero en MLX, sin componentes MoE, SSM ni hibridos. Usa embeddings posicionales aprendidos (no RoPE), atencion multi-cabeza estandar y una ventana de 256 tokens. El tokenizer es un BPE byte-level con la receta de GPT-2 y 8.192 piezas, entrenado sobre los 90 libros de entrenamiento; el token 0 (`<|endoftext|>`) delimita el final de cada libro. El total de 17.016.576 parametros incluye el embedding de tokens y el de posiciones.

El entrenamiento de cada generacion fue identico: optimizador AdamW, learning rate 0.0015 con warm-up corto y decaimiento coseno, batches de 32 x 256 tokens y 3.198 pasos, lo que supone cuatro pasadas sobre los 6.548.384 tokens del corpus. La generacion 0 leyo los 90 libros reales; escribio despues 6.548.384 tokens de historias propias (512 libros simultaneos, temperatura 0,8). La generacion 1 partio de pesos aleatorios y leyo solo esos textos sinteticos, cuatro veces, y asi sucesivamente hasta la generacion 5, que es este modelo. El coste fue de unos 10 minutos de entrenamiento y 2 de generacion por generacion en un M1 Max. No se documento RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generacion de texto narrativo en ingles con formato de cuento infantil: aperturas del tipo "Once upon a time there lived...", dialogos con comillas y capitulos titulados en mayusculas.
- Continuacion de prompt con ventana de 256 tokens y decodificacion por muestreo (temperatura configurable; 0,8 por defecto, 0 para decodificacion greedy).
- Generacion por lotes de multiples historias con semilla reproducible (`--n`, `--seed`, `--tokens`).
- Simulacion del estilo de libros infantiles de dominio publico (Gutenberg), incluyendo ecos de nombres y motivos de obras como *The Wonderful Wizard of Oz*.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No es multilingue: solo ingles, y con vocabulario severamente degradado respecto al corpus original.

## Casos de uso

- Investigacion sobre model collapse: reproducir la cadena de cinco generaciones con los scripts incluidos y medir la perdida de vocabulario, la repeticion de n-gramas y la sorpresa sobre libros no vistos, usando la tabla de metricas del autor como referencia.
- Docencia sobre entrenamiento de transformers: el modelo, de 17 M de parametros, se entrena en unos 10 minutos en un M1 Max, lo que permite explicar tokenizacion BPE, embeddings posicionales aprendidos y decodificacion por temperatura en una sola sesion practica.
- Auditoria de pipelines de datos sinteticos: sirve como caso de control negativo que demuestra por que un pipeline que solo recicla salidas de modelo degenera en cinco iteraciones, argumento util para justificar mezclas con datos humanos.
- Pruebas de inferencia en Apple Silicon: validacion de que el mismo modelo produce distribuciones de siguiente token casi identicas en MLX y PyTorch (diferencia maxima documentada de 0,0002), util para verificar portabilidad de implementaciones.
- Generacion de texto creativo deliberadamente absurdo o surrealista: las salidas con palabras inventadas ("flass") y repeticiones obsesivas pueden usarse como material artistico o como ejemplo de texto no natural.
- Benchmark de juguete para herramientas de perfilado: con 17 M de parametros y contexto de 256 tokens, es un banco de pruebas ligero para medir latencia de frameworks de inferencia sin coste de GPU.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Publica, en cambio, metricas propias de la cadena de generaciones sobre la semilla 3 (la mas cercana a la media de tres semillas):

| Generacion | Entrenado con | Palabras reales | Palabras poco frecuentes aun usadas | Frases de 4 palabras repetidas | Sorpresa en libros no vistos | Capitulos con apertura de cuento |
|---|---|---|---|---|---|---|
| 0 | 90 libros reales | 6.713 | 95,7 % | 0,8 % | 4,01 | 16 % |
| 1 | historias de gen 0 | 2.828 | 42,8 % | 5,8 % | 4,63 | 34 % |
| 2 | historias de gen 1 | 1.576 | 11,9 % | 20,7 % | 5,0 (dato truncado en la model card) | no disponible |

Los datos de las generaciones 3 a 5 no estan completos en la informacion disponible. La tendencia documentada es monotona: caida del vocabulario real, aumento de la repeticion de n-gramas y aumento de la sorpresa (perplejidad) sobre el conjunto de test de libros reales.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision completa para los 17 M de parametros; cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 de 4 GB, y en CPU.
- GPU recomendadas: ninguna en particular; el autor ejecuta en Apple Silicon (M1 o superior) mediante MLX. En el resto de plataformas se usa la ruta PyTorch, que funciona en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: scripts propios `generate.py` (MLX) y `generate_torch.py` (PyTorch + safetensors + tokenizers), ambos incluidos en el repo. No hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF.
- Latencia y throughput: no disponibles de forma agregada; el autor indica que la generacion de 512 libros de 6,5 M tokens tardo unos 2 minutos en un M1 Max durante el experimento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Corpus de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| danxx891/shake-the-flass | 17,0 M | 256 | Sintetico (historias de gen 4) | MIT | Demostracion de model collapse |
| GPT-2 small (OpenAI) | 124 M | 1.024 | WebText (humano) | MIT | Generacion de texto general |
| TinyStories-1M (Microsoft) | ~1 M | 512 | TinyStories (sintetico controlado) | MIT | Estudio de capacidades emergentes en modelos pequenos |
| Karpathy nanoGPT (shakespeare) | ~10 M | 256 | Obras de Shakespeare | MIT | Referencia educativa de entrenamiento desde cero |

La comparacion es estructural, no de rendimiento: no existen resultados de benchmarks comunes entre estos modelos en la informacion disponible. Frente a GPT-2 small, `shake-the-flass` tiene un septimo de parametros y un cuarto de contexto, y su corpus es integramente sintetico, lo que explica su degradacion linguistica.

## Limitaciones y advertencias

- Colapso de modelo documentado: el vocabulario real cae de 6.713 a 1.576 palabras entre las generaciones 0 y 2, y las frases de cuatro palabras repetidas pasan del 0,8 % al 20,7 %. Las generaciones 3 a 5 agravan el fenomeno.
- Alucinacion estructural: el modelo inventa palabras ("flass") y encadena formulas sin sentido ("he was a king, and he was a king").
- Ventana de contexto de solo 256 tokens, insuficiente para cualquier tarea de contexto largo.
- Solo ingles, con un tokenizer de 8.192 piezas entrenado sobre un corpus de 90 libros; el vocabulario fuera de ese dominio es practicamente inexistente.
- Sesgos: el corpus son libros infantiles de autores fallecidos antes de 1955, con los sesgos de genero y culturales de la epoca; el autor excluyo explicitamente libros con insultos raciales, pero no se documenta ninguna otra mitigacion.
- No apto para produccion: no hay evaluacion de seguridad, alineamiento, tool calling ni calidad sostenida. Cualquier uso comercial, aunque la licencia MIT lo permita, carece de garantias de calidad.
- Reproducibilidad parcial: MLX y PyTorch dan las mismas probabilidades de siguiente token pero numeros aleatorios distintos, de modo que la misma semilla produce historias diferentes segun la ruta de inferencia.
- El corpus de entrenamiento no se distribuye con el modelo, solo los pesos y los scripts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danxx891/shake-the-flass
- Video del experimento "I Made an AI Learn Only From AI": https://www.youtube.com/watch?v=Ow7eIjz9ZBQ
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- Project Gutenberg (origen del corpus): https://www.gutenberg.org
