# DICPlay/RusMind-Zernyshko-2.0

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay, entrenado desde cero y especializado en ruso. Forma parte de la familia RusMind y se presenta como la segunda generación de la línea "Zernyshko" (que podría traducirse como "semilla" o "granito"). El modelo está diseñado para ejecutarse de forma totalmente local y offline en hardware modesto, incluyendo portátiles e incluso teléfonos, gracias a su reducido tamaño y a la disponibilidad de cuantizaciones GGUF de 219 MB (Q4_K_M) y 367 MB (Q8_0).

Arquitectónicamente es un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE), activación SwiGLU y atención con query grouping (GQA) en proporción 16/4. Cuenta con 26 capas de 1024 dimensiones, un vocabulario propio de 48.000 tokens entrenado específicamente sobre texto ruso y una ventana de contexto de 4096 tokens. El modelo se entrenó sobre 4.500 millones de tokens procedentes de Wikipedia en ruso, web en ruso, datos de código, tareas y diálogos propios, seguido de un ajuste fino orientado a habilidades prácticas.

Su relevancia actual radica en que demuestra que es posible entrenar desde cero un modelo funcional en un idioma específico con recursos limitados, publicando las curvas de entrenamiento y el código de la arquitectura como evidencia. Aunque sus capacidades absolutas son modestas (puntuación MERA 2.0 de 0,054), su interés reside en el enfoque de transparencia y en su idoneidad para despliegues en entornos con restricciones de hardware o conectividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parámetros totales | 342.283.264 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | bf16 (685 MB), GGUF Q8_0 (367 MB), GGUF Q4_K_M (219 MB) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay) - uso no comercial libre, comercial bajo contrato |
| Formato de pesos | safetensors, GGUF |
| Vocabulario | 48.000 tokens (tokenizador propio entrenado en ruso) |
| Capas | 26 |
| Dimensión oculta | 1024 |
| Formato de chat | ChatML |
| Librería | transformers (requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only implementada en PyTorch de forma independiente (archivo `modeling_rusmind_ai.py`), sin reutilizar clases de otros modelos. Incorpora RMSNorm para la normalización, RoPE para la codificación posicional, SwiGLU como función de activación en las capas feed-forward y atención con query grouping en proporción 16/4 (16 cabezas de query y 4 de key/value). El tokenizador es propio, con un vocabulario de 48.000 tokens entrenado sobre texto ruso.

El entrenamiento se realizó desde cero (pesos inicializados aleatoriamente) sobre 4.500 millones de tokens. La composición del dataset incluye Wikipedia en ruso, web en ruso, diálogos propios, código y tareas. Posteriormente se aplicó un ajuste fino orientado a habilidades prácticas: cálculo aritmético, generación de código, salida en JSON, traducción, invocación de herramientas, cortesía y honestidad epistémica (decir "no sé" cuando corresponde). El autor publica el registro de entrenamiento (`training/train_300m.log`) como evidencia del entrenamiento desde cero: en el paso 50 la pérdida era de 9,13, coherente con una inicialización aleatoria sobre un vocabulario de 48.000 tokens (una pérdida esperada de aproximadamente 10,8). No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en ruso con formato de chat ChatML.
- Razonamiento aritmético básico y resolución de problemas matemáticos sencillos (por ejemplo, cálculo de velocidad, sumas).
- Generación de código (mencionado en la model card, sin detalles sobre lenguajes o benchmarks).
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Invocación de herramientas (tool calling / function calling) mediante salida estructurada con campos `tool` y `args`.
- Traducción (mencionada como habilidad del ajuste fino, sin especificar pares de idiomas).
- Honestidad epistémica: el modelo está entrenado para declarar desconocimiento cuando no sabe algo.
- Ejecución totalmente offline en dispositivos de consumo (portátil, teléfono).
- No se mencionan capacidades de visión, audio, agentes multi-paso ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes conversacionales en ruso para dispositivos sin conectividad: el modelo puede desplegarse en formato GGUF Q4_K_M (219 MB) y ejecutarse en un teléfono o portátil mediante llama.cpp u Ollama, ofreciendo conversación multi-turno con 4096 tokens de contexto sin depender de la nube.
- Extracción de datos estructurados en pipelines locales: dada una frase en ruso como "El portátil cuesta 55.000 rublos", el modelo devuelve JSON con campos definidos, lo que permite integrarlo en procesos de parsing de documentos o formularios sin enviar datos a servicios externos.
- Automatización de atención al cliente de baja complejidad en ruso: con 4096 tokens de contexto puede gestionar conversaciones multi-turno breves y derivar consultas cuando no dispone de información, gracias a su entrenamiento en honestidad epistémica.
- Enrutamiento de consultas mediante tool calling: el modelo puede emitir llamadas estructuradas a herramientas (por ejemplo, una API meteorológica) a partir de preguntas del usuario, adecuado para asistentes de voz o chatbots con integración de servicios.
- Educación y tutoría básica en ruso: resuelve problemas aritméticos sencillos paso a paso, útil para aplicaciones de aprendizaje offline en entornos con recursos limitados.
- Prototipado e investigación en PLN para ruso: al ser un modelo entrenado desde cero con pesos, tokenizador y código abiertos, sirve como base para experimentos académicos sobre modelos compactos en lenguas eslavas.
- Procesamiento de texto en el borde (edge computing): su reducido tamaño permite integrarlo en aplicaciones de escritorio o móviles que requieran generación de texto en ruso sin latencia de red.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0 | Misma modelo antes de ajuste fino |
|---|---|---|
| Prueba práctica interna (120 preguntas) | 74 puntos | 53,5 puntos |
| MERA 2.0 (puntuación global) | 0,054 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La puntuación MERA 2.0 de 0,054 es muy baja en términos absolutos, aunque el autor la presenta como la mejor de la línea Zernyshko.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (685 MB de pesos); aproximadamente 250-400 MB en cuantizaciones GGUF Q4_K_M y Q8_0.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU y dispositivos móviles.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, LM Studio, Ollama (mediante el repositorio GGUF `DICPlay/RusMind-Zernyshko-2.0-GGUF`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4096 | Ruso | RusMind License (no comercial libre) | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingüe (incl. ruso) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8192 | Principalmente inglés | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1.1 B | 2048 | Inglés (con algo de otros) | Apache 2.0 | safetensors, GGUF |

Los modelos comparables de tamaño similar (Qwen2.5-0.5B, SmolLM2-360M) ofrecen contextos mayores y licencias permisivas para uso comercial, además de un soporte multilingüe más amplio. RusMind Zernyshko 2.0 se distingue por su especialización en ruso, su entrenamiento desde cero y su licencia restrictiva para uso comercial. No se dispone de datos de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (342 M de parámetros): capacidad limitada para razonamiento complejo, conocimiento factual amplio y tareas de código avanzadas.
- Puntuación MERA 2.0 de 0,054: rendimiento bajo en benchmarks estandarizados en ruso, lo que sugiere un conocimiento limitado del mundo.
- Riesgo elevado de alucinación en temas fuera de su dominio de entrenamiento, a pesar del ajuste para declarar desconocimiento.
- Solo soporta ruso: no está entrenado para otros idiomas, por lo que su uso en castellano u otras lenguas no es fiable.
- Ventana de contexto de 4096 tokens, inferior a la de modelos contemporáneos de tamaño similar.
- Licencia RusMind License: el uso comercial, la redistribución de versiones modificadas y la integración en productos requieren un contrato escrito con DICPlay; solo es libre para uso personal, no comercial, investigación y evaluación.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código personalizado del autor; conviene auditar `modeling_rusmind_ai.py` antes de usarlo en producción.
- El campo de arquitectura "llama" en los archivos GGUF es solo una etiqueta de compatibilidad con llama.cpp y no indica relación con los pesos de Meta.
- No se han publicado evaluaciones independientes ni benchmarks estándar; los datos de rendimiento proceden del propio autor.
- El modelo se distribuye "tal cual", sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Registro de entrenamiento: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/train_300m.log
- Curva de pérdida: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/zernyshko2_loss.png
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/LICENSE
