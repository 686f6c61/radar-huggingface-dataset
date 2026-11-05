# rasbt/gpt2-tensorflow

## Resumen

`rasbt/gpt2-tensorflow` es un espejo de los checkpoints originales de GPT-2 publicados por OpenAI, redistribuidos en formato TensorFlow para el ejemplo de carga de pesos del capitulo 5 del libro *Build a Large Language Model (From Scratch)* de Sebastian Raschka. No se trata de un modelo nuevo ni de un fine-tune: son los pesos originales de GPT-2 en sus cuatro variantes de tamano (124M, 355M, 774M y 1558M), mantenidos con el mismo diseno de directorios que uso OpenAI.

El repositorio resuelve un problema practico de reproducibilidad: permite descargar los checkpoints directamente desde Hugging Face mediante la funcion `download_and_load_gpt2` del material del libro, sin depender de los enlaces originales de OpenAI. Cada carpeta contiene el checkpoint TensorFlow, el fichero `hparams.json` con los hiperparametros y los ficheros del tokenizer (`encoder.json` y `vocab.bpe`).

GPT-2 es un transformer decoder-only autorregresivo con 12 a 48 capas segun la variante, contexto de 1024 tokens y entrenamiento exclusivamente en ingles. Su relevancia actual es principalmente pedagogica y de investigacion: sirve como referencia canonica para estudiar la arquitectura GPT y para validar implementaciones desde cero. Existe una version equivalente en PyTorch y safetensors en `rasbt/gpt2-from-scratch-pytorch`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124M, 355M, 774M y 1558M (cuatro variantes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoints TensorFlow en precision original) |
| Idiomas soportados | ingles (en) |
| Licencia | openai-gpt-2-modified-mit |
| Formato de pesos | checkpoint TensorFlow, `hparams.json`, `encoder.json`, `vocab.bpe` |

## Arquitectura y entrenamiento

GPT-2 es un transformer decoder-only con atencion multi-cabeza causal y capas feed-forward pre-LN. Las cuatro variantes escalan en profundidad y anchura: 124M (12 capas, 768 de dimension de embedding, 12 cabezas), 355M (24 capas, 1024, 16 cabezas), 774M (36 capas, 1280, 20 cabezas) y 1558M (48 capas, 1600, 25 cabezas). Todas comparten vocabulario BPE de 50 257 tokens y ventana de contexto de 1024 tokens.

El entrenamiento original de OpenAI (2019) uso un corpus web filtrado (WebText) de aproximadamente 40 GB de texto en ingles, sin ajuste por RLHF ni DPO. Este repositorio no reentrena ni modifica los pesos: solo redistribuye los checkpoints oficiales en el formato que espera el codigo del libro de Raschka. No incorpora innovaciones posteriores como decodificacion especulativa, atencion lineal ni modos de razonamiento.

## Capacidades

- Generacion de texto autorregresiva en ingles.
- Continuacion de prompts y generacion condicionada por contexto de hasta 1024 tokens.
- Capacidad limitada de responder preguntas simples y completar tareas de estilo.
- No soporta tool calling ni function calling de forma nativa.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Multilingue limitado: el vocabulario y el entrenamiento estan centrados en ingles; el rendimiento en otros idiomas es bajo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia y estudio de arquitecturas transformer: el modelo permite cargar pesos reales en TensorFlow y recorrer capa por capa la implementacion, comparando con el codigo del libro.
- Validacion de implementaciones desde cero: util para comprobar que una reimplementacion de GPT-2 en NumPy, TensorFlow o PyTorch produce logits equivalentes a los oficiales.
- Experimentos de interpretabilidad: al ser un modelo pequeno y bien documentado, facilita analisis de atencion, embeddings y activaciones sin requerir infraestructura grande.
- Generacion de texto de referencia en ingles: sirve como linea base en tareas de continuacion de texto para comparar con modelos posteriores.
- Pruebas de pipelines de inferencia: util para validar herramientas de despliegue (TensorFlow Serving, scripts propios) con un modelo de pesos conocidos y ligeros.
- Reproduccion de resultados academicos: permite replicar experimentos de la literatura GPT-2 sin depender de los enlaces originales de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (precision FP32): aproximadamente 0,5 GB para 124M, 1,4 GB para 355M, 3,1 GB para 774M y 6,2 GB para 1558M, solo pesos.
- En FP16 la huella se reduce a la mitad aproximadamente; el repositorio no incluye pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) puede ejecutar las variantes 124M y 355M; la variante 1558M requiere al menos 8 GB de VRAM en FP16 o 12 GB en FP32.
- Cabe en GPU consumer: si, todas las variantes en GPUs con 8-12 GB o mas.
- Opciones de despliegue: el formato es checkpoint TensorFlow, por lo que encaja con TensorFlow Serving o scripts propios; no es directamente compatible con vLLM, llama.cpp u Ollama sin conversion previa a safetensors/GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| rasbt/gpt2-tensorflow (este) | 124M-1558M | 1024 | en | modified MIT | TensorFlow |
| rasbt/gpt2-from-scratch-pytorch | 124M-1558M | 1024 | en | modified MIT | PyTorch / safetensors |
| openai-community/gpt2 | 124M | 1024 | en | modified MIT | PyTorch / safetensors |
| openai-community/gpt2-large | 774M | 1024 | en | modified MIT | PyTorch / safetensors |

La diferencia principal frente a las versiones de `openai-community` es el formato: este repositorio usa checkpoints TensorFlow y estructura de directorios de OpenAI, mientras que las versiones de la organizacion oficial estan en PyTorch/safetensors y son compatibles con `transformers`.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con WebText, hereda sesgos de genero, raza y religion presentes en texto web de 2019.
- Riesgo de alucinacion: alto; GPT-2 no esta alineado y tiende a generar contenido plausible pero falso.
- Limitacion de idioma: entrenado principalmente en ingles; el rendimiento en castellano u otros idiomas es deficiente.
- Contexto corto: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia: modified MIT de OpenAI; permite uso comercial con condiciones, pero conviene revisar el texto completo del `LICENSE` incluido en el repositorio.
- Formato no estandar: al ser checkpoints TensorFlow, no se carga directamente con `transformers`; requiere el codigo del libro o una conversion previa.
- No apto para produccion sin ajuste: carece de alineacion, filtros de seguridad y soporte de herramientas; su uso recomendado es educativo e investigador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rasbt/gpt2-tensorflow
- Carpeta 124M: https://huggingface.co/rasbt/gpt2-tensorflow/tree/main/124M
- Version PyTorch/safetensors: https://huggingface.co/rasbt/gpt2-from-scratch-pytorch
- Codigo del capitulo 5 del libro: https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/01_main-chapter-code
- Licencia original de OpenAI GPT-2: https://github.com/openai/gpt-2/blob/master/LICENSE
