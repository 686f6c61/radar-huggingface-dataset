# davidheineman/nanogpt-ladder-v3-chat-heavy-8m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 8M es un modelo de lenguaje de escala minima (8.011.776 parametros) desarrollado por davidheineman como parte de una serie de experimentos controlados de preentrenamiento denominada NanoGPT Ladder v3. El modelo se presenta como el punto final de un run de preentrenamiento completado sobre 80.117.760 tokens de prediccion (10 TPP, tokens por parametro) durante 2.445 pasos de optimizacion con semilla 1337. Su proposito no es el uso productivo, sino servir como referencia reproducible en estudios de escalado, mezclas de datos y recetas de preentrenamiento.

La arquitectura es un transformer decoder-only estilo GPT-2 con 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. El vocabulario esta rellenado hasta 50.304 entradas. La variante "chat-heavy" sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas "heavy" asignan un 80% de los tokens al dominio nombrado (en este caso, chat).

Es relevante ahora porque forma parte de una coleccion de modelos completados que permiten comparar el efecto de la mezcla de datos y del presupuesto de tokens sobre un mismo esqueleto de red. Los pesos son previos a cualquier fase de tiny-rl, SFT o RL, por lo que se comportan como un modelo base puro: aceptan prompts de texto plano y no estan alineados para dialogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT) |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 8 capas, dimension de modelo 128, 4 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. El checkpoint incluye `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida. No se incluye estado del optimizador, aunque el checkpoint admite inferencia y fine-tuning posterior.

El preentrenamiento se realizo sobre el pool `allenai/dolma3_dolmino_pool` siguiendo la receta congelada de mezclas Dolma3 Dolmino. La variante chat-heavy asigna un 80% de los tokens al dominio de chat. El run completo consumio 80.117.760 tokens de prediccion en 2.445 pasos de optimizacion, lo que equivale a 10 TPP sobre los 8M de parametros. El fichero `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256. No se documentan fases de RLHF, DPO ni SFT; el autor indica explicitamente que estos pesos preceden al acondicionamiento tiny-rl, SFT y RL.

## Capacidades

- Generacion de texto autoregresiva basica con prompts de texto plano.
- Modelado de lenguaje y evaluacion de perdida (BPB/loss) sobre corpus de texto.
- Inferencia en CPU, CUDA y Apple MPS mediante el script `generate.py` incluido.
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura configurable.
- Fine-tuning posterior sobre el checkpoint nativo en PyTorch.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- No esta alineado para dialogo ni instrucciones; no es un modelo chat pese a la etiqueta de mezcla de datos.

## Casos de uso

- Reproducibilidad de experimentos de escalado: sirve como punto de referencia fijo (8M parametros, 10 TPP, semilla 1337) para comparar el efecto de distintas mezclas de datos sobre la misma arquitectura.
- Estudio de mezclas de dominio: al ser la variante chat-heavy, permite medir como el 80% de tokens de chat afecta a la perdida en dominios frente a otras variantes de la coleccion NanoGPT Ladder v3.
- Docencia y formacion: su tamano minimo y su codigo autocontenido (`model.py`, `generate.py`) lo hacen util para ilustrar un pipeline completo de preentrenamiento e inferencia en PyTorch.
- Pruebas de infraestructura: sirve para validar pipelines de descarga, carga de checkpoints y generacion en CUDA, MPS o CPU antes de escalar a modelos mayores.
- Baseline en investigacion de tokenizacion: con tokenizador GPT-2 y vocabulario rellenado, permite experimentar con variantes de preprocesado manteniendo fija la red.
- Evaluacion de perdida en corpus: util para calcular BPB/loss sobre textos de dominio y comparar recetas de mezcla sin coste computacional significativo.
- Fine-tuning de juguete: al admitir entrenamiento posterior, se puede usar para probar recetas de SFT o RL a escala minima antes de aplicarlas a modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje y no precision de resolucion de tareas, y remite a `results.json` para el registro original de finalizacion y evaluaciones, cuyos valores no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (8M parametros); el checkpoint completo ocupa del orden de decenas de MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU sin problema. Se puede ejecutar en RTX 4090, A100 o H100, pero no se aprovecha su capacidad.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o integradas, y en Apple Silicon via MPS.
- Opciones de despliegue: el propio `generate.py` con `device=auto` (CUDA, MPS o CPU) y el cargador nativo `model.py`; no es compatible con Transformers AutoModel, vLLM, llama.cpp, Ollama ni TGI al usar una arquitectura y formato de checkpoint propios.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la latencia por token es del orden de microsegundos a milisegundos en hardware moderno, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 8M (este) | 8,0M | 1.024 | no disponible | PyTorch nativo | Run completado, 10 TPP, semilla 1337 |
| Otras variantes NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch nativo | Misma coleccion; mezclas y presupuestos distintos |
| GPT-2 small | 124M | 1.024 | MIT (pesos OpenAI) | PyTorch, safetensors | Referencia historica de la misma familia arquitectonica |
| Modelos tipo TinyStories / nanoGPT de referencia | variable (1M-50M) | variable | variable | variable | No disponible comparativa directa publicada |

La comparacion con GPT-2 small es la mas cercana en diseno (decoder-only, RoPE en este caso frente a posicional aprendido en GPT-2, tokenizador GPT-2), pero este modelo es aproximadamente 15 veces menor en parametros. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones ni mantiene dialogos coherentes; el autor indica usar prompts de texto plano.
- Capacidad muy limitada por tamano: 8M parametros y 10 TPP ofrecen una calidad de generacion muy por debajo de modelos de uso practico; el riesgo de texto incoherente es alto.
- Ventana de contexto corta: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas: no se documenta que idiomas cubre; la mezcla Dolma3 Dolmino y el tokenizador GPT-2 estan dominados por ingles, por lo que el rendimiento en castellano es incierto.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenar sobre un pool web, es probable que herede sesgos del corpus, pero no hay datos publicados.
- Alucinacion: sin alineacion ni datos de evaluacion, no se puede caracterizar; en un modelo de este tamano la generacion fiable es escasa.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere consultar al autor.
- Formato propietario: no es compatible con el ecosistema Transformers, vLLM, llama.cpp u Ollama; requiere el codigo incluido en el repositorio.
- Sin estado del optimizador: el checkpoint no permite reanudar el preentrenamiento exactamente, solo inferencia o fine-tuning desde los pesos.
- Repositorio de 0.0 GB y 0 descargas: no hay evidencia de uso ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-8m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
