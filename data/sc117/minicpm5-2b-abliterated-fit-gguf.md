# SC117/MiniCPM5-2B-abliterated-FIT-GGUF

## Resumen

MiniCPM5-2B-abliterated-FIT-GGUF es una cuantización GGUF del modelo base openbmb/MiniCPM5-2B, publicada por el usuario SC117. El modelo base es un transformer denso de 2.516.756.480 parámetros (2,5B) con una ventana de contexto declarada de 128K tokens, orientado a inferencia en dispositivo (on-device) y entrenado para inglés y chino. Esta variante concreta aplica una técnica de "abliteration" (eliminación de rechazos) sobre el modelo original y distribuye los pesos en cuatro niveles de fidelidad cuantizados, generados y verificados con la herramienta FIT-GGUF.

La relevancia de esta ficha reside en dos aspectos. Por un lado, ofrece una vía para ejecutar un modelo de 2,5B con contexto largo en hardware de consumo, algo poco habitual en esta franja de tamaño. Por otro, el proceso de cuantización no sigue los presets estándar de llama.cpp, sino que fija un contrato de fidelidad medido (KL macro y tasa de mismo-top) y verifica cada archivo contra su referencia BF16, lo que permite auditar la pérdida de calidad de forma explícita.

La licencia es Apache-2.0, lo que facilita el uso comercial. No obstante, la modificación de abliteration altera el comportamiento de rechazo del modelo original, un aspecto que debe considerarse antes de desplegarlo en producción. Esta ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; no se dispone de información sobre benchmarks ni sobre la composición exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base MiniCPM5-2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF en 4 niveles de fidelidad (FIT-GGUF), entre 1,14 y 1,46 GiB por archivo |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base openbmb/MiniCPM5-2B es un transformer denso de 2,5B parámetros. La model card de esta variante no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de RoPE u otras innovaciones), por lo que esos datos se consideran no disponibles. Sí se declara una ventana de contexto de 128K tokens, lo que sitúa al modelo en la franja alta de contexto para su tamaño.

El entrenamiento del modelo base no está documentado en la información proporcionada: se desconoce el número de tokens, la composición del dataset y si hubo fases de RLHF, DPO u otras técnicas de alineación. La modificación "abliterated" se aplicó en el trial #68 según la model card, y su objetivo es eliminar la dirección de rechazo del modelo. La cuantización se realizó con FIT-GGUF v0.3.3, una capa de planificación determinista sobre llama.cpp que fija un contrato de fidelidad (KL macro por debajo del ancla del nivel y tasa de mismo-top por encima de un umbral calibrado por modelo) y verifica cada archivo entregado contra su referencia BF16 con delta cero en el gate G2. La propia model card advierte que FIT verifica contratos de fidelidad, no un óptimo universal de calidad.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte multi-turno.
- Contexto largo de hasta 128K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Inferencia en dispositivo (on-device) gracias a su tamaño reducido y a los archivos GGUF de 1,14-1,46 GiB.
- Compatibilidad con llama.cpp y con endpoints compatibles con la API de OpenAI (según los tags del repositorio).
- Comportamiento "uncensored" derivado de la abliteration: reduce los rechazos del modelo original ante peticiones sensibles.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Asistentes locales en dispositivos con recursos limitados: el modelo cabe en 1,14-1,46 GiB en GGUF, por lo que puede ejecutarse en portátiles, mini-PC o incluso Raspberry Pi con suficiente RAM, sin conexión a internet.
- Procesamiento de documentos largos en local: la ventana de 128K permite resumir contratos, informes o artículos extensos sin fragmentación agresiva, manteniendo la coherencia entre secciones.
- Chat multi-turno en inglés y chino: útil para aplicaciones de atención al cliente o asistentes personales bilingües donde se requiere privacidad y baja latencia.
- Experimentación en investigación sobre alineación y abliteration: la variante permite estudiar cómo cambia el comportamiento de rechazo respecto al modelo base, con archivos verificados byte a byte contra BF16.
- Prototipado rápido con llama.cpp u Ollama: al ser GGUF, se integra en pipelines de desarrollo sin necesidad de GPU dedicada, lo que acelera la iteración.
- Generación de texto creativo sin filtros editoriales: el carácter uncensored resulta útil en entornos de escritura o guionización donde se necesita explorar temas sensibles sin rechazos automáticos.
- Evaluación comparativa de cuantizaciones: los cuatro niveles de fidelidad permiten medir el impacto de la compresión en la calidad de salida con una metodología reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso de cuantización (KL macro y tasa de mismo-top por nivel de fidelidad), sin valores numéricos concretos en el texto proporcionado. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,14 y 1,46 GiB solo para los pesos GGUF según el nivel de fidelidad; hay que añadir la memoria de la caché KV, que con 128K de contexto puede ser considerable y depende de la implementación.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 4-8 GB de VRAM puede alojar los pesos; una RTX 3060, RTX 4060 o superior ofrece margen para contexto largo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, así como en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, endpoints compatibles con la API de OpenAI. No se confirma soporte para vLLM o TGI con GGUF en la información proporcionada.
- Latencia y throughput: no disponibles. Dependerán del hardware, del nivel de cuantización y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-abliterated-FIT-GGUF (este) | 2,5B | 128K | Apache-2.0 | GGUF (4 niveles) | Variante abliterated, verificada contra BF16 |
| openbmb/MiniCPM5-2B (base) | 2,5B | 128K | Apache-2.0 (según este repo) | Safetensors | Modelo original sin modificar; comportamiento de rechazo intacto |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache-2.0 | Safetensors, GGUF | Alternativa más pequeña y con menos contexto; datos de benchmark no verificados aquí |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Contexto comparable, licencia más restrictiva y menor número de parámetros |

La comparación se basa en características públicas de los modelos citados; no se dispone de resultados de benchmarks que permitan contrastar rendimiento real entre ellos en esta ficha.

## Limitaciones y advertencias

- La abliteration elimina o reduce los mecanismos de rechazo del modelo original; esto puede producir respuestas ante peticiones que el modelo base rechazaría, con implicaciones legales y éticas en producción.
- Riesgo de alucinación inherente a un modelo de 2,5B: la capacidad de razonamiento y de verificación factual es limitada en comparación con modelos de mayor tamaño.
- Idiomas soportados únicamente inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La ventana de 128K es una declaración de la model card; no se aportan mediciones de calidad de atención en contextos largos (por ejemplo, pruebas de recuperación en el rango completo).
- La model card advierte que FIT-GGUF verifica contratos de fidelidad, no un óptimo universal de calidad; los niveles más comprimidos pueden degradar tareas específicas aunque superen los umbrales globales.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; conviene auditar las salidas antes de desplegarlo.
- No se dispone de información sobre sesgos del modelo base ni sobre el impacto de la abliteration en ellos.
- El repositorio ocupa 15,3 GB, pero cada archivo individual pesa entre 1,14 y 1,46 GiB; hay que seleccionar el nivel adecuado según el compromiso calidad/tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/MiniCPM5-2B-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino: https://huggingface.co/SC117/MiniCPM5-2B-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
