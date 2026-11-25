# devilloots/story-llm-10mb

## Resumen

Story10MB es un modelo de generación de texto de极小 tamaño (5,12 millones de parámetros, aproximadamente 9,8 MB en FP16) desarrollado por el usuario devilloots y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo entrenado desde cero (*from scratch*) sobre 2 GPUs Tesla T4, especializado en la generación de historias cortas a partir de prompts en lenguaje natural. Su nombre hace referencia al dataset de entrenamiento, de unos 10 MB, y no a un contexto de 10 MB.

El modelo emplea una arquitectura transformer con atención de consultas agrupadas (GQA, *Grouped-Query Attention*) y activación SwiGLU, dos innovaciones propias de modelos modernos de gran escala que aquí se aplican a un modelo de juguete. No se dispone de información pública sobre la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset más allá del tamaño aproximado del corpus.

Su relevancia es principalmente educativa y experimental: sirve como ejemplo reproducible de entrenamiento de un LLM desde cero en hardware de consumo (T4), y como base para estudiar el comportamiento de modelos ultrapequeños en tareas creativas. No está pensado para uso en producción ni para tareas que requieran razonamiento complejo, conocimiento factual o multilingüismo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con GQA (Grouped-Query Attention) y SwiGLU |
| Parámetros totales | 5,12 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en FP16, ~9,8 MB) |
| Idiomas soportados | no disponible (presumiblemente inglés, por los prompts de ejemplo) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB; probablemente safetensors o PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 5,12 millones de parámetros que incorpora Grouped-Query Attention (GQA), técnica que reduce el número de cabezas de clave/valor respecto a las cabezas de consulta para disminuir el coste de memoria en inferencia, y SwiGLU como función de activación en las capas feed-forward, una variante que combina la activación Swish con una compuerta lineal y que es habitual en modelos como LLaMA. No se especifican el número de capas, la dimensión oculta, el número de cabezas ni la longitud de contexto.

El entrenamiento se realizó desde cero sobre 2 GPUs Tesla T4, un hardware relativamente modesto (16 GB de VRAM por GPU), lo que es coherente con el tamaño del modelo y del dataset (aproximadamente 10 MB de texto). No se documenta el número de tokens, la composición del corpus, si hubo fases de ajuste fino supervisado o RLHF/DPO, ni detalles sobre el tokenizador. La model card únicamente describe el formato de prompt: una instrucción del tipo «Prompt: Write a story about Xero and Kratos finding hidden treasure in a forest.» seguida de «Story:», lo que sugiere un entrenamiento orientado a continuación de texto con una plantilla fija.

## Capacidades

- Generación de texto narrativo breve: historias cortas a partir de un prompt en lenguaje natural con el formato «Prompt: ... Story:».
- Generación de texto autoregresiva estándar (pipeline `text-generation`).
- Especialización en un dominio muy acotado: ficción corta con personajes y escenarios simples.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; los ejemplos están en inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Experimentación educativa con LLMs desde cero: sirve para reproducir el ciclo completo de entrenamiento (tokenización, preentrenamiento, inferencia) en GPUs T4, y para estudiar cómo se comporta un modelo de 5 millones de parámetros en una tarea creativa concreta.
- Generación de microrrelatos y demos creativas: el modelo produce historias cortas a partir de prompts con personajes y escenarios, útil para prototipos de interfaces de escritura asistida o para generar texto de relleno en entornos de prueba.
- Pruebas de pipelines de inferencia: por su tamaño (9,8 MB en FP16), puede desplegarse en cualquier entorno, incluidos contenedores ligeros y dispositivos de borde, para validar integraciones con vLLM, llama.cpp u Ollama antes de pasar a modelos mayores.
- Investigación sobre GQA y SwiGLU a pequeña escala: permite hacer ablaciones y comparar variantes arquitectónicas sin necesidad de clústeres de GPU.
- Generación de datos sintéticos de baja calidad para tareas de aumento de datos o pruebas de robustez en sistemas de NLP.
- Docencia y talleres: ejemplo mínimo y reproducible de un transformer decoder-only entrenado desde cero, adecuado para explicar atención, tokenización y decodificación en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (pesos de ~9,8 MB más overhead de activaciones y tokenizador); en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluidas Tesla T4, RTX 3060, RTX 4090, A100 o H100; también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: PyTorch nativo, Hugging Face `transformers` (pipeline `text-generation`), llama.cpp/Ollama si se convierte a GGUF, y servidores ligeros como FastAPI con `transformers`.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia debería ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Story10MB (devilloots) | 5,12 M | no disponible | MIT | Hugging Face |
| TinyStories-1M (roneneldan) | ~1 M | no disponible | MIT | Hugging Face |
| TinyStories-33M (roneneldan) | ~33 M | no disponible | MIT | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT | Hugging Face |

La comparación con TinyStories es la más directa: ambos son modelos ultrapequeños entrenados desde cero para generar historias, aunque TinyStories se entrena sobre un corpus sintético curado y publica resultados de evaluación, mientras que Story10MB no documenta benchmarks. GPT-2 small, con 124 M de parámetros, es un orden de magnitud mayor y cuenta con contexto documentado de 1024 tokens.

## Limitaciones y advertencias

- Tamaño extremadamente reducido (5,12 M de parámetros): la coherencia, el conocimiento factual y la capacidad de razonamiento son muy limitadas; no es apto para tareas de producción.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente fuera del dominio de historias cortas.
- Longitud de contexto no documentada; es probable que sea muy corta, lo que limita conversaciones multi-turno y prompts largos.
- Idiomas soportados no documentados; los ejemplos están en inglés y es probable que el modelo solo funcione razonablemente en ese idioma.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, raza u otros.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni sobre el contenido generado.
- Repo de 0,0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devilloots/story-llm-10mb
