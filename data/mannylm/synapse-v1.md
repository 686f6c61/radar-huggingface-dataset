# MannyLM/Synapse-V1

## Resumen

Synapse-V1 es un transformer decoder-only de 826.433 parámetros (0,83 M) implementado desde cero en PyTorch por el autor MannyLM. No utiliza `torch.nn.Transformer` ni `torch.nn.MultiheadAttention`: la atención multi-cabeza causal, las proyecciones Q/K/V, la máscara causal con `torch.tril`, los bloques Pre-LN y la cabeza de lenguaje están escritos manualmente. Está entrenado a nivel de carácter sobre el corpus Tiny Shakespeare (un único fichero de aproximadamente 1,1 MB con la obra de Shakespeare), con un vocabulario de 65 caracteres y una longitud de contexto de 128 caracteres.

El modelo no es un modelo de propósito general: no sigue instrucciones, no tiene conocimiento factual y solo reproduce secuencias de caracteres con estilo isabelino. Su interés es educativo y de investigación, ya que sirve como referencia legible y completamente reproducible de una arquitectura GPT mínima, con pesos publicados en safetensors, `config.json`, `tokenizer.json` y el propio `model.py`.

Es relevante ahora por dos motivos: primero, porque permite estudiar el funcionamiento interno de un transformer sin abstracciones de frameworks; segundo, porque al no ser compatible con `transformers` (`AutoModel.from_pretrained` no puede cargarlo), documenta un caso práctico de integración manual de pesos safetensors con `safetensors.torch.load_file`. Su mejor loss de validación publicada es 1.6539 (entropía cruzada a nivel de carácter), y es la única métrica reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only implementado desde cero en PyTorch (sin `torch.nn.Transformer` ni `torch.nn.MultiheadAttention`) |
| Parametros totales | 826.433 (0,83 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 caracteres (`max_sequence_length`) |
| Tipos de cuantizacion | no disponible (no se han publicado cuantizaciones; los pesos se distribuyen en safetensors) |
| Idiomas soportados | ingles (entrenado sobre texto de Shakespeare; tokenizacion a nivel de caracter) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Vocabulario | 65 caracteres (nivel de caracter) |
| `d_model` | 128 |
| Cabezas de atencion | 4 |
| `d_ff` | 512 |
| Numero de capas | 4 |
| Activacion | ReLU |
| Normalizacion | Pre-LN |
| Codificacion posicional | aprendida (`nn.Embedding`) |
| Embeddings atados | no (embeddings y cabeza LM son independientes) |
| Loss de validacion (mejor) | 1.6539 (entropia cruzada a nivel de caracter) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT con embeddings de token y posicionales aprendidos, y estructura residual Pre-LN. Cada bloque aplica `x = x + MHA(LayerNorm(x))` seguido de `x = x + FFN(LayerNorm(x))`. La atención multi-cabeza causal usa proyecciones `nn.Linear` separadas para Q, K y V, reestructuracion manual de cabezas, producto escalar escalado `(Q·Kᵀ)/√d_head` y una máscara causal generada con `torch.tril` y aplicada mediante `masked_fill(~mask, -inf)` antes del softmax. La red feed-forward es `Linear(128→512) → ReLU → Linear(512→128)`. La cabeza de lenguaje aplica un LayerNorm final y una proyección `Linear(d_model→vocab_size)`; los embeddings no están atados. Todos los hiperparámetros y el vocabulario del tokenizador quedan fijados en `config.json` y `tokenizer.json`.

El entrenamiento usa predicción del siguiente carácter con entropía cruzada a nivel de token, sobre el corpus Tiny Shakespeare (aproximadamente 1,1 MB de texto de un único autor). El split es 80 % entrenamiento / 20 % validación por índice de carácter. Se emplea AdamW con learning rate 1e-3 y weight decay 0,01, tamaño de lote 32, longitud de secuencia 128 y 5000 pasos, con validación cada 500 pasos sobre 50 lotes. Se conserva el checkpoint con la menor loss de validación. El hardware utilizado fue Apple Silicon (`mps`) y CPU. No se reporta uso de RLHF, DPO ni ningún ajuste por preferencias, ni innovaciones como decodificacion especulativa, atencion lineal o KV cache (el snippet de generacion de la model card recalcula el contexto completo en cada paso).

## Capacidades

- Generacion de texto a nivel de caracter con estilo Shakespeare: continuaciones de dialogos y versos con nombres de personajes y registro isabelino.
- Modelado de lenguaje autoregresivo con contexto limitado a 128 caracteres.
- Reproduccion de estilo y estructura local del corpus Tiny Shakespeare (alternancia de interlocutores, puntuacion, mayusculas tras dos puntos).
- Ejecucion en CPU y Apple Silicon (`mps`) sin requisitos de GPU.
- Carga manual de pesos safetensors y reconstruccion exacta del modelo a partir de `config.json`, `tokenizer.json` y `model.py`.
- No soporta tool calling ni function calling.
- No soporta agentes, multi-step reasoning ni planificacion.
- No soporta modo thinking, vision, audio ni multimodalidad.
- No soporta instrucciones ni formatos de chat.
- Multilinguismo: no disponible (vocabulario de 65 caracteres del corpus, solo ingles isabelino).
- No dispone de tokenizador compatible con `transformers` (no hay tokenizer de tipo BPE/Unigram; el mapeo carácter-id viene en un JSON).

## Casos de uso

- Docencia de arquitecturas transformer: el repositorio incluye una implementacion completa y legible de atencion multi-cabeza causal, Pre-LN y máscara causal, sin depender de `torch.nn.Transformer`, lo que permite recorrer el codigo linea a linea en clase o en un articulo tecnico.
- Auditoria de pipelines de pesos safetensors: al ser un repo de 0,0 GB con `config.json`, `tokenizer.json` y `model.safetensors`, sirve para verificar rutas de `hf_hub_download`, carga con `load_file` y comprobacion de formas de tensores en un entorno nuevo.
- Demos generativas artisticas o instalaciones interactivas: el modelo produce continuaciones con estilo Shakespeare de forma instantanea en CPU, adecuado para prototipos de interfaz donde el tiempo de respuesta importa mas que la coherencia global.
- Generacion de dialogos ficticios para prototipos narrativos: con prompts del tipo `ROMEO:` genera intervenciones de personajes con puntuacion y turnos de habla, util como relleno de maquetas de videojuego o guion antes de sustituirlo por un modelo mayor.
- Pruebas de humo de infraestructura de entrenamiento: con 5000 pasos, lote 32 y secuencia 128 sobre 1,1 MB de texto, el pipeline completo se ejecuta en CPU o `mps`, lo que permite validar bucles de entrenamiento, validacion periodica y guardado de checkpoints en equipos sin GPU.
- Experimentos de tokenizacion a nivel de caracter: el vocabulario de 65 simbolos y el mapeo `char_to_id`/`id_to_char` permiten comparar estrategias de tokenizacion de grano fino frente a BPE en corpus pequenos y controlados.
- Generacion de datos sinteticos etiquetados para tests: al ser determinista en estructura y reproducible con la semilla del entorno, se puede usar para producir cadenas de entrada en pruebas unitarias de formateadores y parsers de texto.
- Reproducibilidad de publicaciones: `config.json`, `tokenizer.json`, `model.py` y `model.safetensors` permiten reconstruir exactamente el modelo y el tokenizador descritos en el texto de la model card.

## Benchmarks y rendimiento

La model card solo reporta una metrica. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Mejor loss de validacion (entropia cruzada a nivel de caracter) | 1.6539 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad por palabra | no disponible (el modelo es a nivel de caracter) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. El checkpoint tiene 826.433 parametros; en fp32 ocupa aproximadamente 3,3 MB y en fp16 aproximadamente 1,65 MB, por lo que el cuello de botella es el runtime de PyTorch, no los pesos.
- GPU recomendadas: ninguna en particular; el modelo se entreno en Apple Silicon (`mps`) y CPU. Cualquier GPU con soporte CUDA funciona (por ejemplo RTX 3060, RTX 4090, A100, H100), pero no aporta ventaja significativa dado el tamano.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos unos cientos de MB de VRAM libre, asi como en CPU y en Apple Silicon.
- Opciones de despliegue: PyTorch puro cargando `model.py` junto con `model.safetensors`. No hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura no es un modelo `transformers` y no existe una conversion GGUF publicada.
- Latencia y throughput estimados: no disponible. El snippet de generacion de la model card no implementa KV cache: en cada uno de los `max_new_tokens` pasos recalcula el contexto completo (hasta 128 caracteres), por lo que el coste crece de forma cuadratica con la longitud generada.
- Almacenamiento: inferior a 10 MB para pesos, configuracion y tokenizador.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: la model card no incluye referencias a otros modelos ni resultados de evaluaciones comparables, y los resultados de la busqueda web no contienen informacion tecnica relevante sobre alternativas.

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synapse-V1 (MannyLM) | 826.433 (0,83 M) | 128 caracteres | solo loss de validacion 1.6539 | MIT | HuggingFace, safetensors, carga manual |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion objetivo disponible es la loss de validacion a nivel de caracter (1.6539), que no es trasladable a otros modelos porque depende del vocabulario de 65 caracteres y del split concreto del corpus Tiny Shakespeare.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena exclusivamente con la obra de Shakespeare, por lo que reproduce el sesgo de genero, clase y epoca del corpus (personajes historicos, roles cortesanos, lenguaje isabelino). No hay filtrado ni alineacion.
- Riesgo de alucinacion: alto. El autor indica explicitamente que la salida es localmente plausible pero no coherente a nivel global y que no es factual. No debe tratarse como fuente de informacion.
- Contexto muy limitado: 128 caracteres, aproximadamente una o dos lineas de dialogo. No mantiene coherencia mas alla de ese horizonte.
- Idioma y vocabulario: el vocabulario son los 65 caracteres unicos del corpus. No puede representar caracteres acentuados, signos de otros alfabetos ni simbolos fuera de ese conjunto.
- Sin seguimiento de instrucciones: no es un asistente de proposito general y no responde a peticiones, system prompts ni formatos de chat.
- Sin conocimiento del mundo: no aporta hechos, matematicas, codigo ni razonamiento.
- Compatibilidad: no es un modelo `transformers`. `AutoModel.from_pretrained` no funciona; es necesario cargar `model.py` y el state dict con `safetensors.torch.load_file`.
- Ausencia de KV cache en el codigo de referencia: la generacion incluida recalcula el contexto completo en cada paso, lo que limita el rendimiento si se generan cientos de caracteres.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero la licencia no cubre la idoneidad del modelo para produccion. El propio autor lo declara no apto para decisiones reales ni aplicaciones orientadas a usuario.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existen informes independientes de comportamiento, estabilidad o reproducibilidad.
- Uso previsto por el autor: educativo y de investigacion, ademas de demos de generacion de texto estilo Shakespeare.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MannyLM/Synapse-V1
- Codigo fuente: https://github.com/GTX-Manish/Synapse-V1
- Dataset Tiny Shakespeare: no disponible enlace directo en la informacion proporcionada (referenciado en la model card como `tiny_shakespeare`, corpus de dominio publico de aproximadamente 1,1 MB)
- Articulo o blog tecnico: no disponible
- Demo publica: no disponible
