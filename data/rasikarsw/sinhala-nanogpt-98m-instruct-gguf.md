# rasikarsw/Sinhala-NanoGPT-98M-Instruct-GGUF

## Resumen

Sinhala-NanoGPT-98M-Instruct es un modelo de lenguaje decoder-only de 97,7 millones de parámetros entrenado desde cero en PyTorch por el desarrollador independiente rasikarsw, siguiendo el enfoque de nanoGPT de Andrej Karpathy. Se trata de una implementación de arquitectura GPT-2 (12 capas, 12 cabezas de atención, dimensión oculta de 768) con un tokenizador SentencePiece BPE nativo de 16.000 piezas diseñado específicamente para cingalés, idioma de Sri Lanka con escasa representación en modelos abiertos.

El modelo resuelve el problema de la ausencia de LLMs ligeros y entrenados de forma nativa para cingalés: no es un modelo multilingüe adaptado, sino un transformer preentrenado sobre 2 GB de FineWeb-2 (`sin_Sinh`) y la Wikipedia completa en cingalés, con un total de 195.975.212 tokens de entrenamiento y 1.968.269 de validación. Tras el preentrenamiento (655M tokens procesados en 10.000 pasos sobre una NVIDIA L4) recibió un ajuste supervisado de instrucciones sobre 18.149 pares pregunta-respuesta en cingalés.

Su relevancia actual es doble: por un lado, ofrece un punto de partida reproducible y de bajo coste (aproximadamente 8,6 unidades de cómputo de Google Colab) para la investigación en lenguas de bajos recursos; por otro, se distribuye como GGUF F16 de 187,9 MB listo para ejecutarse en LM Studio o llama.cpp en hardware de consumo, con una velocidad reportada de unas 240 tokens por segundo en una RTX 3050 Laptop. La ventana de contexto es de solo 512 tokens, coherente con su escala y su propósito educativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only (Pre-Norm LayerNorm, MLP con GELU, atención multi-cabeza causal, weight tying de embeddings) |
| Parámetros totales | 97.732.608 (97,7M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (aproximadamente 300-380 palabras en cingalés) |
| Tipos de cuantización | F16 (GGUF incluido); no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | Cingalés (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, 187,9 MB); pesos PyTorch (`pretrain.pt`, `chat.pt`) mencionados en el proceso de entrenamiento |
| Capas / cabezas / dimensión | 12 capas, 12 cabezas de atención, 768 de dimensión oculta, 3072 de FFN |
| Tokenizador | SentencePiece BPE nativo de 16.000 piezas, `byte_fallback=True`, normalización NFC con preservación de ZWJ (U+200D) |
| Corpus de preentrenamiento | FineWeb-2 (`sin_Sinh`, 2,0 GB) + Wikipedia en cingalés (`20231101.si`) |
| Cómputo de preentrenamiento | 655M tokens (10.000 pasos, 65.536 tokens/paso, ~3,3 épocas), bf16 + torch.compile en 1× NVIDIA L4 |
| Ajuste de instrucciones | 18.149 pares Q&A en cingalés (14.185 de Cohere Aya + 4.000 de definiciones de Wikipedia + datos escolares curados) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con normalización previa (Pre-Norm LayerNorm), activación GELU en el MLP y embeddings ligados (weight tying) entre la matriz de entrada y la de salida. Cuenta con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, con FFN de 3072. No incorpora innovaciones como atención lineal, decodificación especulativa ni arquitecturas híbridas SSM: es una implementación deliberadamente canónica y legible, orientada a la reproducibilidad y a la documentación del proceso completo desde pesos aleatorios hasta la exportación GGUF.

El preentrenamiento se realizó desde pesos gaussianos aleatorios (pérdida inicial de 9,822, aproximadamente ln(16000)) sobre 195.975.212 tokens de entrenamiento y 1.968.269 de validación, con decaimiento coseno de la tasa de aprendizaje (4e-4 a 4e-5), calentamiento lineal de 500 pasos y AdamW con weight decay de 0,1 solo en matrices 2D. Se procesaron 655M tokens en 10.000 pasos (65.536 tokens por paso, unas 3,3 épocas) en bf16 con torch.compile sobre una NVIDIA L4, en aproximadamente 3,8 horas. La pérdida de validación final fue de 3,568, con perplejidad de 35,4. El ajuste supervisado posterior usó 17.242 pares de entrenamiento y 907 de validación, con enmascaramiento de los tokens del prompt (etiqueta -100) para calcular la pérdida solo sobre la respuesta y el token `</s>`; el mejor checkpoint se obtuvo en la época 3 (pérdida de validación 3,199), antes de que apareciera sobreajuste en las épocas 4 y 5.

Una innovación técnica destacable es el tokenizador: un BPE SentencePiece nativo de 16.000 piezas con `byte_fallback=True`, normalización NFC y preservación explícita del zero-width joiner (U+200D), imprescindible para mantener la alineación del vocabulario en conjunciones cingalesas como ශ්‍රී (rakaransaya) y විද්‍යා (yansaya). El autor documenta que la compresión típica es de aproximadamente 1,5 tokens por palabra en texto cingalés.

## Capacidades

- Generación de texto en cingalés con sintaxis y morfología nativas, incluyendo conjunciones con ZWJ correctamente formadas.
- Respuesta a preguntas de cultura general, geografía e historia de Sri Lanka en formato instrucción.
- Explicación de conceptos escolares y definiciones enciclopédicas, derivadas del ajuste con datos de Wikipedia y hechos escolares curados.
- Generación de prosa formal de estilo periodístico o enciclopédico, herencia del corpus de preentrenamiento.
- Seguimiento de un formato de prompt estructurado con marcadores `### ප්‍රශ්නය:` (pregunta) y `### පිළිතුර:` (respuesta), con plantilla de chat Jinja embebida en el GGUF.
- Ejecución local en CPU o GPU de consumo mediante llama.cpp y LM Studio.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe: únicamente cingalés; no se documenta competencia en inglés ni en otros idiomas.

## Casos de uso

- Asistente educativo en cingalés para estudiantes de primaria y secundaria: el modelo puede responder preguntas sobre definiciones y hechos escolares, un dominio presente explícitamente en su conjunto de ajuste (4.000 pares de definiciones de Wikipedia y hechos escolares curados). Su tamaño permite desplegarlo en equipos modestos de aulas o laboratorios.
- Prototipado e investigación en procesamiento de lenguas de bajos recursos: sirve como línea base reproducible para experimentos de tokenización, preentrenamiento y ajuste de instrucciones en cingalés, con un coste de cómputo documentado de unas 8,6 unidades de Colab.
- Generación de texto de relleno o borradores en cingalés para editores y periodistas: dado su entrenamiento sobre FineWeb-2 y Wikipedia, produce prosa formal coherente a nivel de frase y párrafo corto, útil como punto de partida sujeto a revisión humana.
- Demostraciones y docencia sobre el ciclo de vida de un LLM: al estar construido desde cero con scripts (`train.py`, `finetune.py`) y documentar pérdidas, perplejidades y hallazgos de ingeniería, es adecuado para explicar preentrenamiento, SFT, enmascaramiento de prompt y exportación GGUF.
- Aplicaciones offline en dispositivos con recursos limitados: el GGUF F16 de 187,9 MB se ejecuta en LM Studio o llama.cpp con unos 240 tokens/s en una RTX 3050 Laptop de 6 GB, lo que permite integrarlo en herramientas de escritorio sin conexión.
- Normalización y generación de variantes de texto cingalés en pipelines de datos: su tokenizador nativo con preservación de ZWJ y compresión de aproximadamente 1,5 tokens por palabra puede reutilizarse para tareas de preprocesamiento y aumento de datos en cingalés.
- Experimentación con plantillas de chat y formatos de instrucción: la plantilla Jinja embebida y el formato con delimitadores `###` permiten probar protocolos de conversación en un modelo pequeño antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento final (preentrenamiento) | 3,392 |
| Pérdida de validación final (preentrenamiento) | 3,568 |
| Perplejidad de validación final (preentrenamiento) | 35,4 |
| Pérdida de entrenamiento mejor época (SFT) | 2,162 |
| Pérdida de validación mejor época (SFT) | 3,199 |
| Velocidad de inferencia reportada | ~240 tokens/s en NVIDIA RTX 3050 Laptop (6 GB VRAM) con LM Studio |

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF F16 de 187,9 MB requiere menos de 1 GB de VRAM para los pesos; con contexto de 512 tokens y caché KV el consumo total es mínimo (del orden de 1 GB o menos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor valida el funcionamiento en una NVIDIA RTX 3050 Laptop de 6 GB. Para entrenamiento se usó una NVIDIA L4.
- Cabe holgadamente en GPU de consumo (RTX 3050, RTX 4060, GTX 1660 y similares) y también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: LM Studio (recomendado por el autor) y llama.cpp CLI (`llama-cli`). No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: aproximadamente 240 tokens/s en una RTX 3050 Laptop con LM Studio; no se documentan cifras para CPU ni para otras GPU.
- Configuración recomendada de inferencia: longitud de contexto 512, temperatura 0,4-0,7 (0,3-0,4 para respuestas más factuales), repeat penalty 1,15 y cadena de parada `###`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se indica la categoría de cada alternativa sin afirmar cifras no verificadas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sinhala-NanoGPT-98M-Instruct | 97,7M | 512 | Apache 2.0 | GGUF en Hugging Face |
| GPT-2 small (referencia arquitectónica) | 124M | 1024 | MIT | Pesos PyTorch/TF en Hugging Face |
| Modelos multilingües de gran escala (p. ej. familia Aya) | no disponible | no disponible | no disponible | no disponible |

La comparación con GPT-2 small es pertinente por arquitectura y escala, pero no por idioma: GPT-2 no está entrenado de forma nativa para cingalés ni dispone de tokenizador específico. Los modelos multilingües de gran escala cubren cingalés de forma parcial, pero con un coste de cómputo muy superior; no se dispone de cifras verificadas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (512 tokens): no admite conversaciones multi-turno largas ni documentos extensos; las respuestas se degradan más allá de ese límite.
- Riesgo elevado de alucinación: con 97,7M de parámetros y un corpus de 2 GB, el modelo no tiene conocimiento factual fiable fuera de los dominios vistos en el ajuste; los ejemplos de la model card muestran incluso respuestas contradictorias sobre la capital de Sri Lanka.
- Sobreajuste documentado en el ajuste de instrucciones a partir de la época 4 (pérdida de entrenamiento 1,482 frente a validación 3,254); el checkpoint publicado corresponde a la época 3.
- Sesgos potenciales derivados de FineWeb-2 y Wikipedia en cingalés, sin filtrado ni mitigación documentados; no se han publicado evaluaciones de sesgo.
- Cobertura monolingüe: solo cingalés; no se documenta competencia en inglés ni en tamil, el otro idioma oficial de Sri Lanka.
- Licencia Apache 2.0: permite uso comercial, pero el modelo carece de garantías y de evaluaciones de seguridad; no debe desplegarse en producción sin validación humana y sin filtros adicionales.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que limita su integración en pipelines automatizados complejos.
- Proyecto educativo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- El autor anuncia una V2 (`Sinhala-NanoLlama-250M-Instruct`) que podría dejar obsoleta esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasikarsw/Sinhala-NanoGPT-98M-Instruct-GGUF
- Repositorio nanoGPT de Andrej Karpathy (inspiración): https://github.com/karpathy/nanoGPT
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Wikipedia en cingalés (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Aya de Cohere For AI: https://huggingface.co/datasets/CohereForAI/aya_dataset
- LM Studio (entorno de ejecución recomendado): https://lmstudio.ai
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
