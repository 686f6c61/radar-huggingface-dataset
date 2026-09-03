# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K

## Resumen

El modelo `sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K` es una cuantización en formato GGUF (Q6_K) del modelo base `Qwen/Qwen2.5-Coder-14B-Instruct`, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata de un modelo de lenguaje de 14 700 millones de parámetros, especializado en generación de código y razonamiento, diseñado para ejecutarse localmente con llama.cpp u otros motores compatibles con GGUF. La cuantización Q6_K reduce el peso a aproximadamente 11,3 GB, lo que permite su uso en tarjetas gráficas de consumo con 16 GB de VRAM o menos.

El modelo base Qwen2.5-Coder-14B-Instruct fue desarrollado por Alibaba y entrenado sobre 5,5 billones de tokens, incluyendo código fuente, datos de grounding texto-código y datos sintéticos. Soporta una ventana de contexto nativa de 32 768 tokens, ampliable hasta 128 000 mediante yarn rope scaling. Esta versión cuantizada mantiene las capacidades del modelo original, incluyendo generación de código, razonamiento matemático y soporte para agentes, aunque con una ligera pérdida de precisión inherente a la cuantización. Su relevancia actual radica en ofrecer una alternativa de código abierto, ejecutable en hardware modesto, para tareas de programación asistida y automatización de flujos de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (Transformer decoder) |
| Parametros totales | 14 770 033 664 (14,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (ampliable a 128 000 con yarn rope scaling) |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | en, it (según metadata de HuggingFace) |
| Licencia | other (según metadata de HuggingFace; el autor indica Apache-2.0 en la model card) |
| Formato de pesos | GGUF (Q6_K) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder causal con 14,7 mil millones de parámetros, entrenado por Alibaba sobre 5,5 billones de tokens. El dataset de entrenamiento combina código fuente de múltiples lenguajes, datos de grounding entre texto y código, y datos sintéticos generados para mejorar la capacidad de instrucción. El entrenamiento incluye fases de preentrenamiento y ajuste fino supervisado (SFT), seguido de optimización por preferencias humanas (RLHF/DPO) para alinear el comportamiento con las expectativas de los usuarios. La arquitectura incorpora atención con rope scaling, lo que permite extender la ventana de contexto desde 32 768 tokens nativos hasta 128 000 tokens mediante yarn rope scaling con factor 4,0. Esta cuantización Q6_K mantiene la arquitectura original, pero reduce la precisión de los pesos a 6 bits por parámetro, lo que disminuye el requisito de memoria a costa de una pequeña degradación en la calidad de las respuestas.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con soporte para completado, generación de funciones y refactorización.
- Razonamiento matemático multi-paso, evaluado en GSM8K y MATH con puntuaciones del 89 % en ambos casos (sobre muestra reducida).
- Razonamiento de sentido común y comprensión de situaciones, con un 78 % en HellaSwag (muestra reducida).
- Conocimiento general multi-temático, con un 57 % en MMLU y 56 % en MMLU-Pro (muestra reducida).
- Capacidad de seguir instrucciones conversacionales y mantener diálogos multi-turno.
- Soporte para agentes autónomos y bucles de razonamiento, según el perfil de uso recomendado por el autor.
- Ejecución local eficiente gracias a la cuantización Q6_K, con velocidades de decodificación de 34,8 tokens por segundo en una RTX 5070 Ti.

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en editores de código o entornos de desarrollo para ofrecer autocompletado, generación de funciones y explicación de fragmentos de código, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Automatización de tareas de desarrollo: gracias a su capacidad de razonamiento y generación de código, puede utilizarse en pipelines de CI/CD para generar tests unitarios, documentar APIs o revisar cambios de código.
- Agente autónomo de resolución de problemas: su perfil de uso recomendado incluye bucles de agentes autónomos, por lo que puede emplearse en sistemas que requieran planificar y ejecutar múltiples pasos para completar tareas complejas, como la corrección de errores en repositorios.
- Tutor de programación y matemáticas: su buen rendimiento en GSM8K y MATH (89 % en ambos) lo hace adecuado para aplicaciones educativas que expliquen conceptos de programación o resuelvan problemas matemáticos paso a paso.
- Chatbot técnico multilingüe: aunque los idiomas declarados son inglés e italiano, puede utilizarse para atender consultas técnicas en estos idiomas, aprovechando su ventana de contexto de 32K tokens para mantener conversaciones largas con historial completo.
- Prototipado rápido de aplicaciones de IA generativa: al ser un modelo GGUF, puede desplegarse fácilmente con llama.cpp o Sigma Studio en hardware de consumo, lo que facilita la experimentación y el desarrollo de prototipos sin grandes inversiones en infraestructura.

## Benchmarks y rendimiento

El autor publicó resultados de evaluación sobre una muestra reducida de 100 preguntas (no el dataset completo), con una puntuación global del 78 %. Los resultados por dataset son los siguientes:

| Dataset | Dominio | Correctos / Total | Precisión (%) |
|---|---|---|---|
| ARC-Challenge | Razonamiento científico y escolar | 9 / 9 | 100 |
| BIG-Bench Hard | Lógica y simbolismo multi-tarea | 7 / 7 | 100 |
| GPQA | Razonamiento académico de posgrado | 2 / 9 | 22 |
| GSM8K | Matemáticas multi-paso | 8 / 9 | 89 |
| HellaSwag | Razonamiento de sentido común | 7 / 9 | 78 |
| HumanEval | Generación de código Python (pass@1) | 7 / 7 | 100 |
| MATH | Matemáticas de competición | 8 / 9 | 89 |
| MBPP | Programación Python con tests unitarios | 9 / 9 | 100 |
| MMLU | Conocimiento general multi-tema | 8 / 14 | 57 |
| MMLU-Pro | Razonamiento multi-paso avanzado | 5 / 9 | 56 |
| TruthfulQA | Factualidad y anti-alucinación | 8 / 9 | 89 |

**Nota importante:** estos resultados se obtuvieron sobre una muestra de 100 preguntas, no sobre los datasets completos, por lo que no son comparables con evaluaciones estándar de la literatura. El autor indica explícitamente que la puntuación no es comparable con una ejecución completa.

En cuanto a velocidad, el autor midió en una NVIDIA GeForce RTX 5070 Ti (15,9 GB VRAM):

- Decodificación de un solo flujo (lo que percibe el usuario en un chat): 34,8 tokens por segundo.
- Procesamiento de prompt: 137 tokens por segundo.
- Throughput agregado durante evaluación (varias peticiones en vuelo): 34,4 tokens por segundo.

Estas cifras son específicas de esa máquina y no deben extrapolarse a otros hardware sin tener en cuenta el ancho de banda de memoria, la cuantización, la longitud de contexto y los drivers.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q6_K ocupa 11,29 GB en disco, por lo que se necesita al menos 12 GB de VRAM para cargar el modelo completo en GPU. Con 16 GB de VRAM (como la RTX 5070 Ti) se puede ejecutar con margen para el contexto y los buffers.
- GPU recomendadas: RTX 5070 Ti (probada por el autor), RTX 4080, RTX 4090, A100, H100, o cualquier GPU con al menos 12 GB de VRAM y soporte para CUDA o Metal.
- En GPUs de consumo con 12 GB (RTX 3060, RTX 4070) puede caber, pero el contexto deberá limitarse para evitar desbordamiento de memoria.
- Opciones de despliegue: llama.cpp (comando `llama-cli -hf sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K -p "..." -ngl 99`), Sigma Studio (herramienta del autor con aceleración por hardware y monitorización en vivo), y cualquier motor compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: en la máquina de prueba (RTX 5070 Ti), la decodificación de un solo flujo alcanza 34,8 tok/s y el procesamiento de prompt 137 tok/s. No se han medido velocidades en otros hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo base Qwen2.5-Coder-14B-Instruct pertenece a la familia Qwen2.5-Coder, que incluye versiones de 1,5B, 7B, 14B y 32B. Según la búsqueda web, la versión de 32B es el SOTA actual en modelos de código open source, comparable a GPT-4o, pero no se han proporcionado cifras concretas para comparar con esta cuantización de 14B. Tampoco se dispone de datos de otros modelos de código de tamaño similar (como CodeLlama-13B o DeepSeek-Coder-6.7B) en la información disponible. Por tanto, la comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- La cuantización Q6_K introduce una pérdida de precisión respecto al modelo original en FP16, que puede manifestarse en errores sutiles en tareas de razonamiento complejo o generación de código.
- Los benchmarks publicados se basan en una muestra de 100 preguntas, no en los datasets completos, por lo que los porcentajes no son representativos del rendimiento real en evaluaciones estándar.
- El rendimiento en GPQA es bajo (22 %), lo que indica dificultades con razonamiento académico de nivel posgrado.
- La licencia está marcada como "other" en HuggingFace, aunque el autor indica Apache-2.0 en la model card. Es necesario verificar los términos exactos de la licencia del modelo base Qwen2.5-Coder-14B-Instruct antes de un uso comercial.
- Los idiomas declarados son inglés e italiano; no se garantiza un buen rendimiento en otros idiomas, aunque el modelo base de Qwen soporta múltiples lenguas.
- La ventana de contexto de 32K tokens es ampliable a 128K solo si se aplica yarn rope scaling, lo que requiere configuración adicional en el motor de inferencia.
- No se han medido velocidades en otros hardware; las cifras proporcionadas son específicas de la RTX 5070 Ti y no deben extrapolarse.
- El modelo puede alucinar en tareas de conocimiento general (MMLU 57 %), por lo que se recomienda verificar las respuestas en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Versión GGUF oficial del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen2.5-coder-14b
- Página en Ollama: https://ollama.com/library/qwen2.5:14b-instruct-q6_K
- Repositorio Sigma Studio (herramienta del autor): https://github.com/Sigmanih/SigmaStudio
