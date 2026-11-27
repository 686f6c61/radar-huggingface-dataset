# exalandru/Arete-27B-oQ4h-mtp

## Resumen

Arete-27B-oQ4h-mtp es una cuantizacion mixta del modelo NousResearch/Arete-27B, publicada por el usuario exalandru en Hugging Face. El checkpoint esta empaquetado en formato MLX (libreria `mlx`), pensado para ejecucion en hardware Apple Silicon, y emplea la herramienta oQ (oMLX v0.8.4) para aplicar cuantizacion de precision mixta sobre los pesos originales en BF16. El nombre del modelo sugiere una base de 27B, aunque el checkpoint cuantizado almacena 7.212.759.280 parametros logicos, lo que indica que el repositorio contiene una fraccion de los pesos del modelo original (probablemente una variante reducida o un subconjunto del checkpoint base).

La relevancia de esta publicacion es acotada: se trata de un artefacto de cuantizacion derivado, no de un modelo entrenado desde cero. Su interes practico reside en la distribucion de bits por capa, que mezcla bloques de 4, 5, 6 y 8 bits con pesos en BF16 y U32, alcanzando un promedio efectivo de 19,429 bits por peso. Incluye ademas una cabeza MTP (multi-token prediction) restaurada desde "Qwen 3.8 27B" segun la model card, un detalle tecnico que conviene tratar con cautela porque la referencia a esa version de Qwen no es verificable con la informacion disponible.

El modelo se publica bajo licencia Apache 2.0 y no registra descargas ni likes en el momento de la consulta. La model card no documenta idiomas soportados, pipeline, datos de entrenamiento ni resultados de evaluacion, por lo que la ficha se limita a lo verificable en los metadatos y en el README del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NousResearch/Arete-27B, tag `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 7.212.759.280 (checkpoint cuantizado; el modelo base se denomina 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, 5-bit grupo 64, 6-bit grupo 64, 8-bit grupo 64, BF16 y U32; promedio efectivo 19,429 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `oq`, `quantized`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base NousResearch/Arete-27B, no un entrenamiento nuevo. La model card indica que se genero con oQ (oMLX v0.8.4) aplicando precision mixta: las capas se reparten entre almacenamiento affine de 4, 5, 6 y 8 bits con grupo de 64, pesos en BF16 y tensores en U32. La distribucion concreta es 0,330B parametros a 4 bits, 1,303B a 5 bits, 1,271B a 6 bits, 0,010B a 8 bits, 0,900B en BF16 y 3,398B en U32. El desglose por componente es 6,327B en el modelo de lenguaje, 0,461B en vision y 0,425B en la cabeza MTP.

El tag `qwen3_5` en los metadatos y la mencion de que la cabeza MTP se restauro desde "Qwen 3.8 27B" apuntan a una arquitectura de la familia Qwen, con modulo de vision integrado y prediccion multi-token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF o DPO. Tampoco se documentan innovaciones de decodificacion mas alla de la propia cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento: el checkpoint conserva los pesos del modelo base, aunque no hay evaluacion publicada que lo confirme.
- Procesamiento de vision: el desglose de almacenamiento incluye un modulo de vision de 0,461B parametros.
- Prediccion multi-token (MTP): incorpora una cabeza MTP de 0,425B parametros, restaurada segun el autor desde otro modelo; su funcionamiento efectivo no esta verificado.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion mixta permiten cargar el checkpoint en equipos con memoria unificada, aprovechando los tensores de 4 y 5 bits para reducir el espacio ocupado frente a BF16.
- Prototipado de pipelines multimodales: la presencia del modulo de vision permite experimentar con tareas de imagen y texto en local antes de escalar a un despliegue en servidor.
- Evaluacion de tecnicas de cuantizacion mixta: el repositorio sirve como referencia para comparar la distribucion de bits de oQ frente a cuantizaciones uniformes de 4 u 8 bits.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite estudiar el impacto de la prediccion multi-token en la latencia de generacion, siempre que se valide su correcto funcionamiento.
- Fine-tuning ligero o adaptadores sobre una base cuantizada: util para experimentar con LoRA en entornos con recursos limitados, aunque requiere verificar la compatibilidad con MLX.
- Despliegue de bajo consumo en estaciones de trabajo: para tareas de generacion de texto no criticas donde el coste de infraestructura sea prioritario y la precision exacta no sea requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 17,5 GB (16,314 GiB de pesos). Se necesita al menos esa cantidad mas el overhead de ejecucion, por lo que conviene disponer de 20-24 GB de memoria unificada o VRAM.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3 y M4 con memoria unificada suficiente). No se documenta soporte para CUDA.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en configuraciones de 24 GB o superiores; en GPUs NVIDIA no es directamente utilizable sin conversion de formato.
- Opciones de despliegue: MLX y oMLX son las vias naturales; llama.cpp, vLLM, TGI u Ollama no se mencionan como compatibles en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Arete-27B-oQ4h-mtp | 7,21B (checkpoint cuantizado) | no disponible | Mixta 4/5/6/8 bits, BF16, U32 | Apache 2.0 | MLX safetensors |
| NousResearch/Arete-27B (base) | no disponible | no disponible | BF16 original | no disponible | safetensors |
| Cuantizaciones uniformes 4-bit del mismo base | no disponible | no disponible | 4 bits uniforme | segun autor | MLX o GGUF |

La comparacion con alternativas de la misma categoria no puede completarse con rigor porque faltan datos publicos del modelo base y de otras cuantizaciones derivadas.

## Limitaciones y advertencias

- El checkpoint contiene 7,21B parametros mientras que el modelo base se denomina 27B; la discrepancia no se explica en la model card y debe verificarse antes de usarlo en produccion.
- La cabeza MTP se restaura desde otro modelo ("Qwen 3.8 27B"), lo que puede introducir incompatibilidades o degradacion si la arquitectura no coincide exactamente.
- No hay evaluacion publicada de calidad, sesgos ni alucinacion para este checkpoint cuantizado.
- La cuantizacion mixta con bloques de 4 bits puede degradar tareas sensibles a la precision numerica, como matematicas o generacion de codigo.
- La licencia Apache 2.0 se declara en los metadatos, pero la licencia del modelo base debe confirmarse de forma independiente antes de un uso comercial.
- El formato MLX limita el despliegue a hardware Apple; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- El repositorio no registra descargas ni validacion de la comunidad, por lo que la fiabilidad del artefacto es baja.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/exalandru/Arete-27B-oQ4h-mtp
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
