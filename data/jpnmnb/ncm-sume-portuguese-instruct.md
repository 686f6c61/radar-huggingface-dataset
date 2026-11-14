# jpnmnb/NCM-Sume-Portuguese-Instruct

## Resumen

NCM Sumé es una adaptación experimental de la arquitectura Next-Concept Modeling (NCM) orientada a la generación de texto y la conversación en portugués. Lo desarrolla el usuario jpnmnb como ajuste fino comunitario sobre el trabajo original de Stanford Hazy Research, descrito en el artículo "Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation" (arXiv:2610.14162). El objetivo declarado es comprobar si es viable entrenar esta arquitectura dentro de los límites de una GPU de consumo (una NVIDIA RTX 4060 Laptop con 8 GB de VRAM) para obtener un asistente conversacional compacto en portugués.

La propuesta de NCM sustituye la generación autorregresiva token a token, de coste secuencial O(N), por un esquema de planificación en esbozos conceptuales que se refinan en paralelo en pocas pasadas discretas, con coste O(L). El modelo combina un tokenizador neural multiescala (Residual VQ-VAE) que convierte el texto en una jerarquía de códigos discretos en 12 niveles, y un Transformer generador que proyecta esos códigos de forma paralela sobre toda la secuencia.

El repositorio contiene únicamente pesos y scripts de inferencia (unos 0,6 GB en total), no un pipeline estándar de Hugging Face `transformers`, por lo que su uso requiere el script `generate.py` incluido. Es relevante como exploración abierta de generación conceptual multiescala en equipos personales, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM): tokenizador multiescala Residual VQ-VAE (12 niveles) + Transformer generador paralelo |
| Parametros totales | no disponible (pesos del generador ~340 MB y del tokenizador ~211 MB; recuento de parámetros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia admite `bfloat16` y `float32` |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), más vocabulario y merges BPE en `.pickle` (8192 tokens) |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer autorregresivo convencional. Un tokenizador neural multiescala basado en Residual VQ-VAE convierte el texto en una secuencia jerárquica de códigos discretos organizados en 12 niveles (L1 a L12): los niveles iniciales capturan tópicos amplios del discurso y los siguientes detallan sintaxis y palabras concretas. Sobre esa representación, un Transformer generador paralelo evalúa y proyecta los códigos de cada nivel de forma simultánea a lo largo de toda la secuencia, reduciendo el número de pasadas necesarias frente a la decodificación token a token.

El entrenamiento se realizó con un presupuesto restringido de tiempo y hardware (una RTX 4060 Laptop de 8 GB). Los datasets declarados en la model card son `bigcode/starcoderdata` y `rombodawg/Everything_Instruct_Multilingual`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Generación de texto en portugués y respuesta a comandos conversacionales.
- Diálogo multi-turno básico mediante el script de inferencia incluido.
- Generación conceptual multiescala: planificación en esbozos y refinamiento paralelo por niveles.
- Inferencia en CPU o GPU (`--device cpu` / `--device cuda`) y en `bfloat16` o `float32`.
- Control de longitud de generación mediante `--max_length`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués según la model card.
- Visión, audio o modo de razonamiento explícito (thinking): no disponibles.

## Casos de uso

- Experimentación académica con arquitecturas no autorregresivas: sirve para reproducir y estudiar el enfoque NCM en un entorno de recursos limitados, ejecutando `generate.py` con distintas longitudes y precisiones.
- Asistente conversacional en portugués de bajo coste: puede desplegarse en una GPU de consumo para prototipos de chat en portugués, aceptando la calidad limitada propia de un modelo compacto.
- Generación de texto asistida en portugués para borradores: útil para producir esbozos o respuestas breves que luego se revisan, gracias a su esquema de planificación por niveles conceptuales.
- Docencia y divulgación sobre tokenización neural: el par tokenizador VQ-VAE + vocabulario BPE de 8192 tokens permite ilustrar representaciones jerárquicas discretas del texto.
- Investigación sobre latencia en decodificación: al sustituir la generación token a token por pasadas paralelas, es un banco de pruebas para medir latencia secuencial frente a modelos autorregresivos pequeños.
- Base para ajuste fino comunitario: al estar bajo Apache 2.0 y publicarse pesos y scripts, puede reentrenarse o adaptarse a otros dominios en portugués con hardware modesto.
- Integración con RAG en prototipos: la propia model card recomienda combinar la salida con capas de recuperación factual para mitigar alucinaciones en usos con carga factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,6 GB y los pesos suman aproximadamente 551 MB (generador ~340 MB, tokenizador ~211 MB); con `bfloat16` la huella de pesos ronda los 0,5-0,6 GB, más el overhead de activaciones y del vocabulario BPE.
- GPU recomendadas: el autor validó el entrenamiento e inferencia en una NVIDIA RTX 4060 Laptop de 8 GB; cualquier GPU consumer con 8 GB o más debería acomodar la inferencia.
- Cabe en GPU de consumo: sí, según el propio autor, en una RTX 4060 Laptop de 8 GB; también admite ejecución en CPU.
- Opciones de despliegue: no es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI; el despliegue se realiza con el script autocontenido `generate.py` (PyTorch) y sus opciones `--device`, `--precision` y `--max_length`.
- Latencia y throughput: no disponibles; la motivación del trabajo es precisamente reducir la latencia secuencial frente a la generación autorregresiva, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NCM Sumé (este modelo) | no disponible (~0,6 GB de pesos) | no disponible | NCM: VQ-VAE multiescala + generador paralelo | Apache 2.0 | Pesos `.pt` y script propio en Hugging Face |
| Qwen 0.5B / 1.5B | 0,5B / 1,5B | no disponible en la informacion proporcionada | Transformer autorregresivo denso | no disponible en la informacion proporcionada | Ecosistema estándar `transformers` |
| Gemma (pocos miles de millones) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Transformer autorregresivo denso | no disponible en la informacion proporcionada | Ecosistema estándar `transformers` |

La comparación se limita a los modelos que la propia model card cita como referencia de tamaño (Qwen 0.5B/1.5B y Gemma de pocos miles de millones). No se dispone de datos de benchmarks ni de recuento de parámetros de NCM Sumé que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de alcance experimental: entrenado con presupuesto restringido de tiempo y hardware (una RTX 4060 Laptop de 8 GB), sin validación a gran escala.
- Riesgo elevado de alucinación en hechos enciclopédicos densos y en razonamientos lógicos complejos; el autor recomienda combinar la salida con capas de recuperación factual (RAG) para uso en producción.
- Idiomas: únicamente portugués; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no publicada; el script expone `--max_length` pero no se documenta la ventana máxima soportada.
- No es compatible con el pipeline estándar de `transformers`, vLLM, llama.cpp, Ollama o TGI; requiere el script `generate.py` y las dependencias del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un ajuste fino comunitario conviene verificar las obligaciones derivadas de los datasets de entrenamiento (`bigcode/starcoderdata` y `rombodawg/Everything_Instruct_Multilingual`).
- Sin métricas publicadas de rendimiento, latencia o calidad; no debe asumirse paridad con modelos compactos consolidados como Qwen o Gemma.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jpnmnb/NCM-Sume-Portuguese-Instruct
- Artículo original: Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation (arXiv:2610.14162)
- Repositorio base de Stanford Hazy Research: https://github.com/HazyResearch/ncm
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset de entrenamiento: https://huggingface.co/datasets/rombodawg/Everything_Instruct_Multilingual
