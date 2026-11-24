# govailabs/govai

## Resumen

govai 2.4 es un asistente conversacional de aproximadamente 2.000 millones de parámetros desarrollado por govai labs, distribuido en formato GGUF y pensado para ejecutarse de forma local y totalmente offline en ordenadores personales. Está afinado a partir de Qwen/Qwen3.5-2B y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su propuesta central es ofrecer un asistente privado que quepa en un único fichero de 1,31 GB (cuantización Q4_K_M) y funcione tanto en GPU de consumo como en CPU.

La versión 2.4 introduce soporte de tool calling con definiciones de función al estilo OpenAI, compatible con Ollama (`tools`) y llama.cpp (`--jinja`). El modelo incorpora además un modo de razonamiento opcional ("thinking") que se puede activar para problemas complejos y desactivar para respuestas rápidas. Está orientado a tareas de chat general, matemáticas escolares, ciencia, explicaciones paso a paso y automatización ligera con herramientas.

El modelo soporta inglés (su idioma principal), hindi y telugu, y se distribuye con una aplicación de escritorio para Windows que integra búsqueda web, lectura de ficheros locales, calculadora y memoria. Con 360 descargas y 1 like en Hugging Face, es un proyecto de nicho centrado en privacidad, despliegue en dispositivo y asistencia educativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-2B); detalles internos no disponibles |
| Parámetros totales | 1.942.653.248 (~2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (recomendado) |
| Tipos de cuantización | Q4_K_M (fichero publicado de 1,31 GB); otras no disponibles |
| Idiomas soportados | Inglés (mejor), hindi, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

govai 2.4 es un fine-tune del modelo Qwen/Qwen3.5-2B, por lo que hereda la arquitectura transformer del modelo base. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Sí se indica que las preguntas de evaluación se filtraron mediante una comprobación de solapamiento de 8 palabras para evitar contaminación, lo que sugiere un cuidado explícito en la separación entre entrenamiento y test.

La innovación técnica destacable de la versión 2.4 es el soporte de tool calling: el modelo emite llamadas a funciones con esquema OpenAI, decide cuándo invocar una herramienta y cuándo responder directamente, y puede encadenar varias llamadas. También incorpora un modo de razonamiento ("thinking") activable por el usuario. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, hindi y telugu, con respuestas en lenguaje sencillo.
- Razonamiento paso a paso y modo "thinking" opcional para problemas difíciles (recomendado reservar 4.096+ tokens).
- Matemáticas escolares: 82,4% en GSM8K (250 preguntas, sin thinking).
- Ciencia y conocimiento general: 83,3% en ARC-Challenge y 61,8% en MMLU.
- Tool calling / function calling con definiciones al estilo OpenAI (Ollama `tools`, llama.cpp `--jinja`).
- Llamadas múltiples a herramientas en una misma interacción (78% en BFCL v3 multi-call).
- Capacidad de decidir no invocar ninguna herramienta cuando ninguna encaja (85% en BFCL v3).
- Integración con herramientas de ficheros locales (buscar, listar, leer) en la aplicación de escritorio.
- Ejecución totalmente offline en dispositivo.

## Casos de uso

- Asistente personal offline en el escritorio: la aplicación de Windows integra el modelo con búsqueda web, calculadora y memoria, de modo que el usuario puede mantener conversaciones privadas sin enviar datos a la nube; encaja por su tamaño reducido y su licencia permisiva.
- Atención al cliente en entornos con requisitos de privacidad: al ejecutarse en local y soportar tool calling, puede consultar APIs internas o bases de conocimiento sin exponer datos a terceros.
- Automatización de tareas sobre ficheros locales: con herramientas de búsqueda, listado y lectura (solo lectura), el modelo puede localizar documentos, PDFs u hojas de cálculo y responder preguntas sobre ellos; la model card reporta 20/20 en selección de herramienta y 19/20 en uso del resultado.
- Tutoría educativa: sus resultados en GSM8K (82,4%) y ARC-Challenge (83,3%) lo hacen adecuado para resolver y explicar problemas de matemáticas y ciencia de nivel escolar, con explicaciones paso a paso bajo demanda.
- Integración en pipelines de agentes ligeros: el soporte de function calling con esquema OpenAI permite conectarlo a frameworks de agentes que necesiten un modelo pequeño y rápido (~150 tokens/s en GPU de gaming).
- Prototipado y desarrollo en local: al ser GGUF compatible con Ollama y llama.cpp, sirve para probar flujos de chat y tool calling en máquinas sin GPU dedicada antes de escalar a modelos mayores.
- Asistencia multilingüe en inglés, hindi y telugu: útil para aplicaciones dirigidas a usuarios de India que necesiten un asistente ligero y desplegable en dispositivo.

## Benchmarks y rendimiento

Resultados publicados por el autor con el fichero Q4_K_M, temperatura 0, respuestas incompletas contadas como erróneas y sin solapamiento de 8 palabras con el entrenamiento.

| Benchmark | govai 2.3 | govai 2.4 |
|---|---|---|
| BFCL v3 · una llamada (100) | 21% | 85% |
| BFCL v3 · elegir la herramienta correcta (100) | 38% | 85% |
| BFCL v3 · varias llamadas a la vez (100) | 6% | 78% |
| BFCL v3 · ninguna herramienta encaja, no llamar (100) | 95% | 85% |
| BFCL v3 · media | 40,0% | 83,2% |
| Ficheros propios: herramienta correcta (20) | 12/20 | 20/20 |
| Ficheros propios: respuesta usa el resultado (20) | 8/20 | 19/20 |
| GSM8K · matemáticas escolares (250), sin thinking | 82,8% | 82,4% |
| ARC-Challenge · ciencia (300), sin thinking | 83,0% | 83,3% |
| MMLU · conocimiento (400), sin thinking | 61,5% | 61,8% |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 1,31 GB; con contexto de 16.384 tokens se recomienda prever al menos 2-3 GB de memoria total (pesos más caché KV), aunque el autor no publica una cifra exacta.
- GPU recomendadas: el autor indica ~150 tokens/s en "una GPU de gaming"; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, por tamaño (1,31 GB en Q4_K_M) es apto para GPUs de consumo con 4 GB o más de VRAM.
- Funciona en CPU: el autor lo describe como "usable on CPU".
- Opciones de despliegue: Ollama (`ollama run hf.co/govailabs/govai:Q4_K_M`), llama.cpp (`llama-cli -hf govailabs/govai --jinja`), llama-cpp-python, y la aplicación de escritorio para Windows.
- Latencia y throughput: ~150 tokens/s en GPU de gaming según el autor; sin datos para CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| govai 2.4 | ~2B | 16.384 | Apache 2.0 | GGUF | Fine-tune de Qwen3.5-2B; tool calling; offline |
| Qwen3.5-2B (base) | ~2B | no disponible | no disponible | no disponible | Modelo base del que deriva govai |
| Alternativas de ~2B con tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría; los datos de terceros no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño: puede equivocarse en hechos, especialmente sobre personas, lugares, fechas y eventos recientes; el autor recomienda verificar datos importantes o usar la búsqueda web de la aplicación.
- Las llamadas a herramientas pueden ser erróneas o carecer de argumentos; conviene revisar qué hará una herramienta antes de ejecutarla y priorizar herramientas de solo lectura.
- Cobertura lingüística limitada a inglés, hindi y telugu; el inglés es el idioma con mejor rendimiento.
- Contexto recomendado de 16.384 tokens; superarlo puede degradar la calidad.
- El instalador de Windows no está firmado digitalmente, lo que puede activar advertencias de SmartScreen.
- No se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales más allá de las de la propia licencia.

## Enlaces

- Hugging Face: https://huggingface.co/govailabs/govai
- Licencia: https://huggingface.co/govailabs/govai/blob/main/LICENSE
- Aplicación Windows: https://huggingface.co/govailabs/govai/resolve/main/desktop/govai-setup-windows.exe?download=true
- Ollama: https://ollama.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
