# qipeng777/mygpt-zh-demo

## Resumen

MyGPT-zh-demo es un modelo de lenguaje causal de tamaño reducido (19,85 millones de parámetros) desarrollado por qipeng777 con fines exclusivamente educativos. Su propósito no es ofrecer un modelo utilizable en producción, sino demostrar de extremo a extremo el flujo completo de creación de un modelo de lenguaje: tokenización, preentrenamiento, guardado de pesos, generación y publicación en Hugging Face. Está entrenado sobre una pequeña muestra de la Wikipedia en chino (5000 artículos) y su vocabulario se limita a 1703 tokens, lo que lo convierte en un juguete didáctico más que en una herramienta práctica.

El modelo emplea una arquitectura transformer decoder-only personalizada (MyGPTForCausalLM) con 6 capas, dimensión oculta de 512, 8 cabezas de atención y una ventana de contexto de 128 tokens. Se distribuye bajo licencia MIT y los pesos están en formato safetensors. Su relevancia actual radica en servir como ejemplo reproducible para quienes quieran aprender a entrenar y publicar modelos pequeños sin necesidad de grandes recursos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MyGPTForCausalLM) |
| Parametros totales | 19.852.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estándar con 6 capas, dimensión oculta de 512, 8 cabezas de atención y una capa intermedia de 2048 unidades. Se emplea atado de embeddings (tie_word_embeddings) y una ventana de contexto máxima de 128 tokens. El vocabulario, de 1703 tokens, fue generado con un tokenizer propio (my_tokenizer_output) a partir de los datos de entrenamiento.

El entrenamiento se realizó sobre un subconjunto de la Wikipedia china (wikimedia/wikipedia 20231101.zh, archivo train-00000-of-00006.parquet), tomando los primeros 5000 artículos y generando 299.000 fragmentos de secuencia de 128 tokens. Se utilizó una GPU RTX 4060 Ti durante una sola época, con 18.723 pasos de optimización y una duración aproximada de 15,5 minutos. La pérdida reportada desciende de 18,35 a 0,0001, aunque este último valor parece anómalamente bajo y probablemente refleja sobreajuste extremo dado el tamaño del modelo y los datos. Se usó el Trainer de Hugging Face con DynamicCache.

## Capacidades

- Generación de texto en chino: puede producir secuencias de hasta 128 tokens, pero con alta probabilidad de repetición o salida incoherente.
- Demostración del flujo completo: tokenización, preentrenamiento, guardado con `save_pretrained`, generación con `generate` y publicación con `push_to_hub`.
- Carga mediante `trust_remote_code=True` o usando la clase personalizada `MyGPTForCausalLM` del repositorio.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio.
- No es adecuado para tareas reales de procesamiento de lenguaje natural.

## Casos de uso

- Aprendizaje de pipelines de Hugging Face: el modelo sirve para practicar el ciclo completo de entrenamiento y publicación, tal como se documenta en su README.
- Ejemplo de tokenización personalizada: permite estudiar cómo se construye un tokenizer con un vocabulario reducido y cómo se integra con un modelo causal.
- Prueba de infraestructura de entrenamiento: útil para verificar que un entorno de entrenamiento (GPU, librerías, Trainer) funciona correctamente con un modelo mínimo antes de lanzar entrenamientos mayores.
- Depuración de código de generación: al ser pequeño y rápido de ejecutar, facilita probar parámetros de generación (temperature, top_k, max_new_tokens) sin coste computacional.
- Material docente en cursos de PLN: puede usarse como ejemplo de un modelo que sobreajusta y produce texto repetitivo, ilustrando las limitaciones de los modelos pequeños.
- Verificación de compatibilidad de versiones: al cargarse con `trust_remote_code`, permite comprobar que el código personalizado funciona con la versión instalada de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas estándar como MMLU, HumanEval o GSM8K, y dado el tamaño y propósito del modelo, no se espera que tenga un rendimiento significativo en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (el modelo ocupa unos 80 MB en fp32, y mucho menos en fp16 o int8).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; incluso una CPU moderna puede ejecutarlo sin problemas.
- Cabe en cualquier GPU de consumo: RTX 2060, RTX 3060, RTX 4060, etc.
- Opciones de despliegue: puede ejecutarse con Transformers en Python, o exportarse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia: extremadamente baja, del orden de milisegundos por token en GPU; en CPU, unos pocos milisegundos por token.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de tamaño similar. Como referencia, modelos como GPT-2 small (124M) o TinyStories (33M) tienen propósitos distintos y no son directamente comparables. El modelo es único en su categoría por ser un ejemplo educativo minimalista con vocabulario propio y entrenamiento sobre Wikipedia china. Se puede indicar que no hay alternativas equivalentes publicadas con las mismas características.

## Limitaciones y advertencias

- Generación de baja calidad: el autor advierte que el modelo produce texto repetitivo o con caracteres sin sentido, debido a su pequeño tamaño, vocabulario reducido y datos limitados.
- Vocabulario muy restringido: solo 1703 tokens, lo que impide representar adecuadamente la riqueza del chino escrito.
- Contexto muy corto: 128 tokens, insuficiente para tareas que requieran dependencias de largo alcance.
- Sobreajuste severo: la pérdida de entrenamiento reportada (0,0001) sugiere que el modelo memoriza los datos de entrenamiento en lugar de generalizar.
- Solo chino: no soporta otros idiomas.
- Uso exclusivamente educativo: no debe emplearse en aplicaciones reales, ni siquiera como base para fine-tuning, por su limitada capacidad.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; se recomienda revisar el script antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qipeng777/mygpt-zh-demo
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios adicionales) en la información disponible.
