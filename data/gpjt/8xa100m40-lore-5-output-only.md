# gpjt/8xa100m40-lore-5-output-only

## Resumen

`gpjt/8xa100m40-lore-5-output-only` es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (gpjt) siguiendo la arquitectura estilo GPT-2 del libro "Build a Large Language Model (from Scratch)" de Sebastian Raschka. La particularidad del modelo es que incorpora una tecnica denominada LoRE (Low Rank Embeddings), que sustituye la matriz de proyeccion de la cabeza de salida por una factorizacion de bajo rango, reduciendo el numero de parametros asociados al vocabulario. La idea fue sugerida por el usuario de HuggingFace `AndrewThompson1233`.

Se trata de un modelo denso de 12 capas, dimension de embedding 768 y 12 cabezas de atencion multi-cabeza, con una longitud de contexto de 1.024 tokens. La model card declara 130.943.360 parametros con LoRE activado en la cabeza de salida, mientras que el recuento real de tensores en safetensors asciende a 143.526.272. El entrenamiento se realizo sobre 3.260.252.160 tokens del dataset `gpjt/fineweb-gpt2-tokens`, una cantidad cercana al optimo de Chinchilla (aproximadamente 20 veces el numero de parametros de la version sin LoRE).

Es relevante en el contexto de la investigacion sobre eficiencia de parametros en matrices de vocabulario y como banco de pruebas reproducible para experimentos de arquitectura a escala pequena. El propio autor advierte explicitamente de que no es un modelo apto para trabajo serio: es un base model sin ajuste por instrucciones, sin RLHF y entrenado con un presupuesto de computo limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (decoder-only), con LoRE en la cabeza de salida |
| Parametros totales | 130.943.360 declarados en la model card; 143.526.272 segun los tensores de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; pesos en fp32 (safetensors) convertibles a fp16/int8/int4 con herramientas externas |
| Idiomas soportados | no disponible en la metadata; el dataset de entrenamiento (FineWeb) es predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB), con codigo personalizado (`custom_code`) |

Otros hiperparametros arquitectonicos declarados: dimension de embedding 768, 12 cabezas MHA, 12 capas, `QKV bias` desactivado y `weight tying` desactivado.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de estilo GPT-2. Frente a la implementacion clasica, incorpora LoRE en la cabeza de salida: en lugar de una matriz de proyeccion completa de 768 x 50.257 (el vocabulario del tokenizador GPT-2), se factoriza en dos matrices de rango 128, lo que reduce drasticamente los parametros de esa capa. En esta configuracion concreta, LoRE esta desactivado en los embeddings de tokens y activado en la cabeza de salida, con inicializacion "original". El `weight tying` esta desactivado, de modo que embeddings y cabeza de salida son independientes.

El entrenamiento se realizo en 8 GPU A100 de 40 GiB (Lambda) con un total de 3.260.252.160 tokens (objetivo de 3.260.190.720, exactamente 20x el numero de parametros del modelo sin LoRE, redondeado al siguiente batch completo). Los hiperparametros principales fueron: micro-batch 12, batch global 96, dropout 0,0, gradient clipping 3,5, learning rate 0,0014 con schedule, y weight decay 0,01. El dataset es `gpjt/fineweb-gpt2-tokens`, una version tokenizada de FineWeb con el tokenizador GPT-2. No se aplico RLHF, DPO ni ningun tipo de ajuste por instrucciones, por lo que se trata de un base model puro.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, con decodificacion por muestreo (temperatura, top-k).
- Continuacion de texto y modelado de lenguaje a nivel de token; util como base para experimentos de preentrenamiento.
- Fine-tuning supervisado para tareas downstream concretas (clasificacion, continuacion de dominio especifico), con un ejemplo de notebook publicado por el autor.
- Capacidad experimental de activar o desactivar LoRE en embeddings y cabeza de salida para estudiar el impacto en calidad y numero de parametros.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es multilingue de forma fiable; el entrenamiento se baso en un corpus predominantemente en ingles.
- No tiene modo "thinking", vision, audio ni ninguna modalidad adicional.
- No sigue instrucciones de forma fiable al no haber pasado por ajuste por instrucciones.

## Casos de uso

- Investigacion sobre factorizacion de bajo rango en matrices de vocabulario: el modelo permite comparar directamente el efecto de LoRE (rango 128, activado en la cabeza de salida) frente a una cabeza de salida completa, manteniendo el resto de la arquitectura constante.
- Reproduccion de experimentos de entrenamiento a pequena escala: con 3,26 mil millones de tokens y 12 capas, es un banco de pruebas asequible para validar pipelines de entrenamiento distribuido en JAX o PyTorch.
- Fine-tuning de dominio especifico con presupuesto reducido: al ser un base model de 130-143 M de parametros, el ajuste completo cabe en una sola GPU de consumo, lo que permite adaptarlo a generacion de texto de un nicho concreto (por ejemplo, descripciones de producto o texto tecnico).
- Docencia y formacion: sirve para ilustrar el ciclo completo de un LLM (tokenizacion, atencion, decodificacion, evaluacion de perdida) en cursos de machine learning, ya que el autor publica el codigo y la metodologia completos.
- Prototipado de infraestructura de inferencia: por su tamano minimo permite probar servidores, cuantizacion, batching y pipelines de CI/CD antes de escalar a modelos mayores.
- Generacion de texto creativo controlada por prompt: con temperaturas altas y top-k reducido el modelo produce continuaciones coherentes a nivel sintactico para demos y pruebas de interfaz, sin garantia de veracidad factual.
- Ablaciones de inicializacion de matrices: la opcion "smart initialization: original" y la posibilidad de activar LoRE en embeddings o en cabeza permiten estudiar el efecto de distintas estrategias de inicializacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar, y el autor advierte de que el modelo "no sabe muchas cosas y no es especialmente inteligente", con un presupuesto de entrenamiento de aproximadamente 20x el numero de parametros y 1.024 tokens de contexto.

## Requisitos de hardware

- VRAM estimada en fp32: alrededor de 0,6 GB solo para pesos, mas overhead de activaciones y cache KV (despreciable con contexto de 1.024 tokens).
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,15 GB; en int4, por debajo de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4090, T4, L4, A100 o H100; tambien es viable en CPU.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en hardware integrado o SBC con suficiente RAM.
- Opciones de despliegue: `transformers` con `pipeline` y `trust_remote_code=True` (metodo documentado por el autor). El uso de `vLLM`, `llama.cpp`, `Ollama` o `TGI` requeriria conversion a GGUF y soporte del codigo personalizado, por lo que no esta garantizado y no aparece documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Benchmarks |
|---|---|---|---|---|---|
| gpjt/8xa100m40-lore-5-output-only | 130,9 M declarados / 143,5 M en safetensors | 1.024 | Apache 2.0 | safetensors con custom code | no disponible |
| GPT-2 small | 124 M | 1.024 | MIT modificada | safetensors / GGUF | no comparable directamente aqui |
| distilgpt2 | 82 M | 1.024 | Apache 2.0 | safetensors / GGUF | no comparable directamente aqui |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 | safetensors | no comparable directamente aqui |

La comparativa se limita a parametros, contexto y licencia, ya que no hay resultados de benchmarks publicados para el modelo de gpjt que permitan una comparacion de rendimiento rigurosa. Frente a GPT-2 small, la diferencia principal es la sustitucion de la cabeza de salida por una factorizacion LoRE de rango 128 y el uso de un dataset distinto (FineWeb tokenizado con GPT-2). Frente a Pythia-160M, el contexto es la mitad (1.024 frente a 2.048) y no hay datos publicados de evaluacion en tareas estandar.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni responde a formatos conversacionales.
- Alto riesgo de alucinacion: al no haber ingerido suficiente conocimiento factual, puede generar afirmaciones plausibles pero falsas.
- Conocimiento muy limitado: 3,26 mil millones de tokens de entrenamiento es un presupuesto minimo para un LLM, segun reconoce el propio autor.
- Ventana de contexto corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas: la metadata no declara idiomas soportados y el corpus de entrenamiento (FineWeb) es predominantemente ingles, por lo que el rendimiento en castellano no esta garantizado.
- Requiere `trust_remote_code=True` para cargarse, ya que usa codigo personalizado (`gpjtgpt2`). Esto implica ejecutar codigo del repositorio del autor, con el riesgo de seguridad asociado en entornos de produccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion de avisos.
- No apto para produccion en tareas que requieran precision factual, razonamiento complejo, codigo, matematicas o cumplimiento normativo.
- No se han publicado cuantizaciones oficiales ni resultados reproducidos por terceros; las cifras de rendimiento en hardware real no estan documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-5-output-only
- Repositorio de codigo: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Entrada de blog sobre matrices de vocabulario de bajo rango (LoRE, anunciada como proxima): https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de referencia de Sebastian Raschka: https://www.manning.com/books/build-a-large-language-model-from-scratch
- Entrada de blog sobre construccion y entrenamiento de GPT-2 small en JAX: https://www.gilesthomas.com/2026/07/llm-from-scratch-34b-building-and-training-gpt-2-small-in-jax
- Discusion original donde se sugirio la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Perfil del autor: https://huggingface.co/gpjt
