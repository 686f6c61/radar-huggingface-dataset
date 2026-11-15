# jawaher-leen-ai/tinystories-llama-75m-from-scratch

## Resumen

El modelo `tinystories-llama-75m-from-scratch` es un modelo de lenguaje de pequeno tamano (75 millones de parametros) publicado por el usuario jawaher-leen-ai en Hugging Face. Por su nombre, se trata de una implementacion de la arquitectura Llama entrenada desde cero ("from scratch") sobre el corpus TinyStories, un conjunto de datos sintetico de cuentos infantiles cortos disenado especificamente para estudiar el aprendizaje de lenguaje en modelos de escala reducida. El modelo esta liberado bajo licencia Apache 2.0.

La relevancia de este tipo de modelos radica en su utilidad como banco de pruebas: al ser entrenado sobre un dataset controlado y con un presupuesto computacional minimo, permite experimentar con tecnicas de entrenamiento, tokenizacion y ajuste fino sin requerir infraestructura de GPU de gama alta. Un modelo de 75M de parametros puede ejecutarse en CPU o en GPUs de consumo con requisitos de memoria muy bajos.

No obstante, la model card publicada no incluye informacion tecnica sustantiva: no se detallan la arquitectura exacta, el numero de tokens de entrenamiento, la composicion del dataset, el tokenizador utilizado ni los resultados de evaluacion. La ficha que sigue refleja esta limitacion y marca como "no disponible" todos aquellos datos que el autor no ha hecho publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (inferido del nombre; no confirmado en la model card) |
| Parametros totales | 75M (segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, por el corpus TinyStories) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Llama, lo que implicaria un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion multi-cabeza. Sin embargo, la model card no confirma ninguno de estos detalles ni especifica la configuracion concreta (numero de capas, dimension del modelo, numero de cabezas de atencion, tamano del vocabulario).

El entrenamiento se habria realizado "from scratch" sobre el corpus TinyStories, un dataset sintetico de cuentos cortos generados por modelos de lenguaje de mayor tamano, pensado para que modelos pequenos adquieran capacidades linguisticas basicas (coherencia, gramatica, estructura narrativa) con un coste computacional bajo. No se dispone de informacion sobre el numero de tokens vistos, la composicion exacta del dataset, la presencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto narrativo corto en ingles (presumiblemente, dado el corpus TinyStories).
- Produccion de cuentos infantiles simples con estructura gramatical basica.
- Capacidad limitada de razonamiento y coherencia mas alla de unas pocas frases, dada la escala del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento probablemente es monolingue en ingles.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Experimentacion academica con modelos de escala reducida: el modelo sirve como base para estudiar el efecto de tecnicas de entrenamiento (learning rate schedules, inicializacion, tokenizacion) sobre un corpus controlado, sin requerir GPUs de gama alta.
- Generacion de cuentos infantiles sinteticos: dado su entrenamiento sobre TinyStories, puede producir narraciones cortas y simples para pruebas de pipelines de generacion de texto.
- Pruebas de integracion en pipelines de inferencia: util para validar el funcionamiento de frameworks como llama.cpp, vLLM o TGI con un modelo de pesos minimos antes de escalar a modelos mayores.
- Educacion y divulgacion: permite ilustrar el funcionamiento interno de un transformer decoder-only en cursos o talleres, ya que el modelo es pequeno y su inferencia es rapida en CPU.
- Generacion de datos sinteticos auxiliares: puede emplearse para producir pequenos volumenes de texto de relleno en tareas de aumento de datos, siempre con supervision humana.
- Benchmarking de hardware y cuantizacion: al ser un modelo de 75M, permite medir latencia y throughput de distintas configuraciones de cuantizacion y backends sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 75M de parametros en FP16 ocupa aproximadamente 150 MB de pesos; en cuantizacion de 8 bits, unos 75 MB; en 4 bits, unos 40 MB. Estas cifras son estimaciones genericas basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre deberia ser suficiente para inferencia en FP16; tambien es viable en CPU.
- Cabe en GPU de consumo: si, presumiblemente en cualquier GPU de consumo moderna (GTX 1060 o superior, RTX 3060, RTX 4090, etc.), asi como en hardware integrado.
- Opciones de despliegue: no confirmadas por el autor. Al ser un modelo tipo Llama, podria convertirse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI si los pesos estan en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tinystories-llama-75m-from-scratch | 75M | no disponible | Apache 2.0 | Hugging Face |
| Modelos TinyStories de referencia (p. ej. roneneldan/TinyStories-*) | 1M-33M | ~512 tokens (segun publicacion) | MIT / variable | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Hugging Face |

La comparativa se ofrece como referencia de categoria (modelos pequenos de menos de 1.000M de parametros); los datos de los modelos alternativos provienen de sus fichas publicas y no de la informacion proporcionada para este modelo. No se dispone de datos de rendimiento comparativo para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan arquitectura, datos de entrenamiento, tokenizador ni evaluacion, lo que impide verificar las afirmaciones implicitas en el nombre.
- Riesgo elevado de alucinacion y de incoherencia mas alla de frases cortas, dado el reducido numero de parametros.
- Capacidad de razonamiento, matematicas y codigo muy limitada o nula por escala y por corpus de entrenamiento.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni filtros aplicados, no es posible evaluar sesgos de genero, raza o cultura.
- Idiomas: probablemente solo ingles; no se garantiza un rendimiento aceptable en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- No apto para produccion en aplicaciones de cara al usuario sin una evaluacion previa exhaustiva.
- Ausencia de datos de benchmarks y de model card detallada: no recomendable como base para decisiones tecnicas sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/jawaher-leen-ai/tinystories-llama-75m-from-scratch
- Paper TinyStories (referencia del corpus, no enlazado por el autor): https://arxiv.org/abs/2305.07759
- Repositorio TinyStories en Hugging Face (referencia, no enlazado por el autor): https://huggingface.co/datasets/roneneldan/TinyStories
