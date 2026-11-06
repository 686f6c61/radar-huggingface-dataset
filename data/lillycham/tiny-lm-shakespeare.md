# lillycham/tiny-lm-shakespeare

## Resumen

tiny-lm-shakespeare es un modelo de lenguaje de tipo GPT con 2.875.520 parámetros entrenado sobre el corpus Tiny Shakespeare. Lo desarrolla lillycham como última etapa de la Parte 1 del proyecto educativo tiny-lm, una serie que construye un modelo de lenguaje paso a paso, desde una tabla de bigramas hasta un transformer completo. No es un modelo pensado para producción: su propósito es didáctico, servir como referencia funcional de una implementación desde cero.

La arquitectura es un transformer decoder-only de 6 capas, anchura 192 y 6 cabezas de atención, con una longitud de contexto de solo 64 tokens y un tokenizador BPE propio de 512 tokens. No sigue la forma de GPT-2 (usa ReLU y una capa de salida separada con sesgo) y no es compatible con la librería `transformers`; se carga mediante la clase `GPT` del repositorio tiny-lm. La pérdida de validación reportada es de 1,50 nats por carácter.

Su relevancia es exclusivamente pedagógica: permite inspeccionar el código completo de entrenamiento e inferencia, experimentar con un modelo pequeño en hardware modesto y entender el funcionamiento interno de un transformer sin la complejidad de un modelo moderno a escala. El texto que genera imita la forma de una obra teatral, pero las palabras rara vez tienen sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (6 capas, anchura 192, 6 cabezas, ReLU, capa de salida separada con sesgo) |
| Parametros totales | 2.875.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors en precision de entrenamiento) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), tokenizador en `bpe.json`, configuracion en `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza causal, 6 capas y una anchura de 192, lo que da 6 cabezas de 32 dimensiones. Se aparta deliberadamente de la forma estándar de GPT-2: emplea activaciones ReLU en lugar de GELU y una capa de salida separada con sesgo. El tokenizador es un BPE entrenado específicamente para este corpus con un vocabulario de 512 tokens, almacenado en `bpe.json`.

El entrenamiento se realizó sobre Tiny Shakespeare, un corpus de obras de Shakespeare en dominio público recopilado por Karpathy en 2015 para su tutorial char-rnn. No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO; la model card solo reporta la pérdida de validación final de 1,50 nats por carácter. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva con un contexto máximo de 64 tokens.
- Imitación estilística del formato de obra teatral (diálogos con nombres de personajes en mayúsculas, acotaciones).
- Generación condicionada por un prefijo (por ejemplo, `"ROMEO:"`) mediante la función `generate` del repositorio.
- Muestreo con temperatura configurable (el ejemplo de la model card usa 0,8).
- Tokenización y detokenización mediante el BPE propio de 512 tokens incluido en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de fundamentos de transformers: el modelo sirve para recorrer el código completo de un GPT funcional (atención, capas, tokenizador BPE, bucle de entrenamiento) sin la opacidad de una implementación de producción.
- Experimentación con tokenizadores: al incluir un BPE entrenado a medida con solo 512 tokens, permite comparar el efecto del tamaño de vocabulario en la calidad de la generación sobre un corpus pequeño.
- Pruebas de infraestructura de inferencia: con menos de 3 millones de parámetros, se puede ejecutar en CPU o en cualquier GPU consumer para validar pipelines de carga de safetensors y scripts de generación.
- Reproducción de experimentos educativos: la pérdida de validación de 1,50 nats por carácter sirve como referencia para comparar variantes del código (cambios de anchura, número de capas o tasa de aprendizaje).
- Generación de texto creativo de imitación shakespeariana con fines de demostración: produce fragmentos con la forma de una escena teatral, útil para ilustrar el concepto de modelado de lenguaje en charlas o tutoriales.
- Estudio del sobreajuste en corpus pequeños: el modelo, entrenado sobre un único corpus de dominio público, permite analizar cómo memoriza y generaliza un transformer minúsculo con contexto de 64 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una pérdida de validación de 1,50 nats por carácter sobre Tiny Shakespeare.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision de entrenamiento (2,88 M de parámetros en fp32 ocupan unos 11,5 MB); cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso CPU.
- Cabe en cualquier GPU consumer y en la mayoría de sistemas embebidos con suficiente memoria para el runtime de PyTorch.
- Opciones de despliegue: no es compatible con vLLM, TGI ni llama.cpp, ya que no es un modelo `transformers` ni un GGUF. La única vía documentada es cargar los pesos con `safetensors.torch.load_file` y la clase `GPT` del repositorio tiny-lm.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia en CPU es viable para demostraciones interactivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Compatibilidad |
|---|---|---|---|---|---|
| tiny-lm-shakespeare | 2,88 M | 64 tokens | MIT | safetensors | Solo con el codigo de tiny-lm |
| GPT-2 small | 124 M | 1.024 tokens | MIT | safetensors, GGUF | `transformers`, llama.cpp, vLLM |
| TinyStories (variantes ~1-10 M) | 1-10 M | 256-512 tokens | variable | safetensors | `transformers` en la mayoria de variantes |
| nanoGPT (shakespeare-char) | ~10 M | 256 tokens | MIT | PyTorch | Codigo propio de nanoGPT |

La comparativa se limita a parámetros, contexto, licencia y compatibilidad porque no hay datos de benchmarks publicados para tiny-lm-shakespeare. Frente a nanoGPT o las variantes de TinyStories, su principal diferencia es el tokenizador BPE de 512 tokens (en lugar de tokenización por carácter) y su integración en una serie educativa con código propio.

## Limitaciones y advertencias

- Calidad de generación muy baja: la propia model card advierte que las palabras rara vez tienen sentido; no es apto para ninguna tarea de producción.
- Contexto de solo 64 tokens, insuficiente para conversaciones multi-turno o documentos de longitud media.
- Entrenado exclusivamente en inglés sobre un corpus de obras de Shakespeare; no generaliza a otros dominios ni idiomas.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño del modelo y del corpus.
- No es compatible con `transformers`, vLLM, TGI, llama.cpp ni Ollama; requiere el código del repositorio tiny-lm para cargarse.
- Sesgos: no se han documentado evaluaciones de sesgo; al entrenarse solo con Shakespeare, el registro y los roles de género reflejan el corpus original.
- Licencia MIT para código y pesos; el corpus Tiny Shakespeare es de dominio público, por lo que no hay restricciones comerciales, aunque el uso comercial carece de sentido práctico por la calidad del modelo.
- No debe usarse como base para ajuste fino destinado a aplicaciones reales: su capacidad es demasiado limitada para transferir conocimiento útil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lillycham/tiny-lm-shakespeare
- Repositorio tiny-lm: https://github.com/lillycham/tiny-lm
- Dataset Tiny Shakespeare (Karpathy): https://github.com/karpathy/char-rnn
