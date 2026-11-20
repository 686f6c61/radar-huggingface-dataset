# nazimboudeffa/PicoGPT1-Jasmine

## Resumen

PicoGPT1-Jasmine es un modelo de lenguaje de tipo GPT-2 de escala experimental, publicado por el usuario nazimboudeffa en Hugging Face. Se trata de una implementación mínima de la arquitectura GPT-2 con solo 2 capas, 128 dimensiones de embedding y 2 cabezas de atención, lo que arroja un total de 6.862.464 parámetros (aproximadamente 6,9 millones). El modelo ha sido afinado sobre un subconjunto de 500 pares instrucción/respuesta del dataset Alpaca, con el objetivo de explorar el comportamiento de un modelo conversacional en el límite inferior de capacidad.

El modelo no resuelve problemas de producción reales; su relevancia es fundamentalmente didáctica y experimental. Permite estudiar el pipeline completo de entrenamiento, conversión a GGUF y despliegue con llama.cpp o llama.app en un entorno de recursos mínimos. La ventana de contexto es de 256 tokens y el tokenizador es el estándar de GPT-2 con 50.257 tokens.

La model card advierte explícitamente de que se trata de un modelo experimental de tamaño muy reducido cuyas respuestas pueden ser incoherentes. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 2 capas, 128 dimensiones, 2 cabezas de atención |
| Parametros totales | 6.862.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF (variante incluida en el repositorio); no se detallan los niveles de cuantización |
| Idiomas soportados | no disponible (el entrenamiento se realizó con Alpaca, mayoritariamente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 en su configuración mínima: 2 capas, 128 dimensiones ocultas y 2 cabezas de atención, con un tokenizador GPT-2 de 50.257 tokens y una longitud máxima de contexto de 256 tokens. El formato de entrenamiento aprendido es `prompt\nreponse<|endoftext|>`, es decir, el prompt seguido de un salto de línea, la respuesta y el token de fin de texto como delimitador.

El ajuste se realizó sobre un subconjunto de 500 pares instrucción/respuesta del dataset Alpaca. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El autor describe el modelo como experimental y advierte de que las respuestas pueden ser incoherentes.

## Capacidades

- Generación de texto autoregresiva básica con el tokenizador de GPT-2.
- Formato instrucción/respuesta aprendido a partir de Alpaca (prompt seguido de respuesta y `<|endoftext|>`).
- Conversación de un solo turno en el formato entrenado; el contexto máximo de 256 tokens limita severamente los diálogos multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documenta capacidad multilingüe específica; el corpus Alpaca es predominantemente en inglés.
- No dispone de modo thinking, visión ni audio.
- Compatible con el pipeline `text-generation` de Transformers y con `text-generation-inference` según los tags del repositorio.

## Casos de uso

- Docencia y experimentación con arquitecturas transformer: el modelo permite recorrer el ciclo completo de carga con Transformers, generación y decodificación en un cuaderno de pocas líneas, sin necesidad de GPU.
- Pruebas de integración de llama.cpp y llama.app: sirve para validar el flujo de descarga de GGUF desde Hugging Face con `llama cli -hf` y el servidor web con `llama serve`, dado su tamaño de 0,1 GB.
- Pruebas de pipelines de CI/CD para despliegue de modelos: al ser tan ligero, permite validar scripts de descarga, carga y generación en entornos con recursos limitados.
- Demostración de fine-tuning sobre Alpaca: el formato `prompt\nreponse<|endoftext|>` y el subconjunto de 500 ejemplos sirven como referencia para reproducir un ajuste instruct mínimo.
- Pruebas de cuantización y formatos GGUF: el repositorio incluye una variante GGUF que permite experimentar con la conversión y carga de pesos cuantizados en llama.cpp.
- Benchmarking de infraestructura de inferencia: útil para medir latencia y throughput base en CPU o en GPU de gama baja antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (6,9 M de parámetros ocupan unos 27 MB en pesos; el resto corresponde a activaciones y caché KV, despreciable con contexto de 256 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU; también funciona en CPU sin problemas.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), llama.cpp, llama.app (`llama cli` y `llama serve`), y text-generation-inference según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PicoGPT1-Jasmine | 6,9 M | 256 | no disponible | Hugging Face (safetensors + GGUF) |
| GPT-2 small | 124 M | 1024 | MIT (pesos originales de OpenAI) | Hugging Face, ampliamente distribuido |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| TinyStories-1M (variantes) | ~1 M | 512 | variable según autor | Hugging Face |

La comparativa se limita a modelos de escala reducida; no se dispone de datos de rendimiento del modelo para comparar benchmarks con estas alternativas.

## Limitaciones y advertencias

- Modelo experimental de 6,9 M de parámetros: el propio autor advierte de que las respuestas pueden ser incoherentes.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Entrenado sobre solo 500 ejemplos de Alpaca; riesgo elevado de sobreajuste al formato y de respuestas genéricas o repetitivas.
- Riesgo alto de alucinación y de generar texto plausible pero incorrecto.
- Sesgos potencialmente heredados del dataset Alpaca, no documentados ni evaluados.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas soportados no documentados; el corpus de entrenamiento es predominantemente en inglés.
- No apto para producción ni para tareas que requieran precisión factual.
- No se documentan evaluaciones de seguridad, alineamiento ni filtrado de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/nazimboudeffa/PicoGPT1-Jasmine
- llama.app: https://llama.app
- Dataset Alpaca (referencia del autor, no enlazado en la model card): no disponible enlace directo
- Paper de GPT-2 (arquitectura base): no disponible enlace en la información proporcionada
