# iOvermind/gemma-4-26B-A4B-it-abliterix-oQ4

## Resumen

gemma-4-26B-A4B-it-abliterix-oQ4 es una version cuantizada del modelo Gemma 4 de arquitectura MoE (Mixture of Experts) con 26B parametros totales y 4B activos, publicado por el usuario iOvermind en Hugging Face. El modelo base es la variante "it" (instruction-tuned) de Gemma 4, presumiblemente desarrollada por Google DeepMind, aunque la model card no confirma explicitamente la identidad del autor original. La variante "abliterix" sugiere que se ha aplicado una tecnica de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) para reducir las negativas del modelo, aunque la model card no lo detalla.

La relevancia de esta ficha radica en que se trata de una cuantizacion mixta de 4 bits realizada con oQ (oMLX v0.7.0), una herramienta de cuantizacion de precision mixta orientada a MLX, el framework de Apple para silicio unificado. Esto la hace especialmente interesante para despliegue en Macs con Apple Silicon, donde MLX ofrece mejor rendimiento que otras alternativas. El repositorio ocupa 15.8 GB y contiene pesos en formato MLX safetensors.

No obstante, la informacion disponible es muy limitada: la model card apenas documenta la cuantizacion y no proporciona datos sobre licencia, idiomas, benchmarks ni capacidades del modelo base. Esta ficha refleja esa escasez de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Gemma 4 (detalles no disponibles) |
| Parametros totales | 25.805.936.206 (aprox. 25,8B) |
| Parametros activos | 4B (segun nomenclatura A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (formato propio de MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 con arquitectura MoE: 25,8B parametros totales con aproximadamente 4B activos por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion elevada. Los detalles concretos de la arquitectura (numero de expertos, top-k de routing, tipo de atencion, uso de RoPE, normalizacion, etc.) no estan documentados en la informacion disponible.

Sobre el entrenamiento del modelo base tampoco hay datos: no se indica el numero de tokens, la composicion del dataset, ni si se aplico RLHF, DPO o alguna otra fase de alineamiento. La variante "it" indica instruction tuning, y el sufijo "abliterix" sugiere una modificacion posterior de las activaciones para reducir rechazos, pero ni el proceso ni su alcance estan documentados.

La innovacion tecnica documentada es la cuantizacion mixta con oQ (oMLX v0.7.0): 4 bits con group size 64, asignando precision de forma selectiva por capa o modulo. Este enfoque busca preservar la calidad del modelo base mejor que una cuantizacion uniforme de 4 bits.

## Capacidades

- Generacion de texto y razonamiento: capacidades esperables de un modelo instruction-tuned de la familia Gemma 4, aunque no estan documentadas de forma especifica.
- Codigo y matematicas: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Efecto de abliteration: la variante abliterix probablemente reduce la tasa de rechazos del modelo, pero el alcance y las consecuencias no estan documentados.

## Casos de uso

- Despliegue local en Macs con Apple Silicon: al estar en formato MLX, el modelo esta pensado para ejecutarse con el framework MLX en equipos con silicio unificado de Apple, aprovechando la memoria compartida y los kernels optimizados para GPU de Apple.
- Prototipado de aplicaciones de chat en estaciones de trabajo Apple: un modelo de 26B totales con 4B activos permite iterar rapidamente en entornos de desarrollo macOS sin depender de GPUs dedicadas.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la abliteration sobre el comportamiento del modelo, la tasa de rechazo y la calidad general de las respuestas.
- Evaluacion de cuantizacion mixta oQ: sirve como caso de estudio para comparar la perdida de calidad entre cuantizacion uniforme de 4 bits y precision mixta con group size 64.
- Generacion de texto asistida en local con requisitos de privacidad: al ejecutarse en hardware local, los datos no salen del equipo, lo que encaja en entornos con restricciones de confidencialidad.
- Base para fine-tuning posterior en MLX: el formato MLX safetensors facilita la adaptacion con LoRA u otras tecnicas sobre el modelo cuantizado, aunque la cuantizacion puede limitar el ajuste fino completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 15,8 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargar los pesos; en la practica, el pico de memoria durante la inferencia sera superior (valores concretos no disponibles).
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No hay datos sobre compatibilidad con GPU NVIDIA o AMD.
- Viabilidad en consumer GPU: no disponible para GPU dedicadas convencionales; en Macs con memoria unificada de 24 GB o superior es plausible, aunque no confirmado.
- Opciones de despliegue: MLX (libreria indicada en el repo) y oMLX (herramienta de cuantizacion). Otros runners como llama.cpp, vLLM, TGI u Ollama no estan confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-abliterix-oQ4 | 25,8B | 4B | no disponible | no disponible | MLX safetensors 4-bit |
| Modelo base Gemma 4 26B-A4B it (sin cuantizar) | 25,8B | 4B | no disponible | no disponible | safetensors |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion documental muy escasa: la model card solo describe la cuantizacion; no hay datos sobre licencia, idiomas, contexto ni capacidades.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base Gemma 4 antes de cualquier despliegue en produccion.
- Abliteration: la modificacion "abliterix" puede degradar la coherencia, aumentar respuestas indeseadas o reducir salvaguardas; no hay evaluaciones publicadas sobre su efecto.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks no se puede estimar su magnitud en esta variante.
- Sesgos: no documentados; los sesgos del modelo base y el efecto de la abliteration sobre ellos no estan evaluados.
- Cuantizacion de 4 bits: la precision mixta mitiga pero no elimina la perdida de calidad respecto al modelo original; no hay metricas que cuantifiquen esa perdida.
- Compatibilidad limitada: el formato MLX restringe el despliegue a entornos Apple Silicon; no sirve directamente en stacks basados en CUDA.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iOvermind/gemma-4-26B-A4B-it-abliterix-oQ4
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX: https://github.com/ml-explore/mlx
- Modelo base Gemma 4: no disponible en la informacion proporcionada
