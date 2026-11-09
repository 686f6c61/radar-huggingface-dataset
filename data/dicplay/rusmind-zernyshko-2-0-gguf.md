# DICPlay/RusMind-Zernyshko-2.0-GGUF

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay, entrenado desde cero y orientado específicamente al idioma ruso. Se distribuye en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, y su principal propuesta de valor es ofrecer capacidades básicas de razonamiento aritmético, generación de código, salida estructurada en JSON y llamada a herramientas en un paquete que cabe en un teléfono móvil y funciona completamente sin conexión.

El modelo emplea una arquitectura transformer de tipo decoder con 26 capas de 1024 dimensiones, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con consultas agrupadas (GQA) con una relación 16/4. Dispone de un tokenizador propio de 48.000 tokens entrenado sobre ruso y una ventana de contexto de 4.096 tokens. El entrenamiento se realizó sobre 4,5 mil millones de tokens procedentes de Wikipedia en ruso, web rusa, diálogos propios, código y tareas, seguido de un ajuste fino orientado a habilidades prácticas.

La relevancia del modelo radica en su tamaño extremadamente reducido y su enfoque monolingüe en ruso, lo que lo sitúa en la categoría de modelos "tiny" para despliegue en el borde (edge). No obstante, sus resultados en la evaluación MERA 2.0 (0,054 de puntuación global, descrita por el autor como la mejor de la línea Zernyshko) indican un rendimiento muy limitado en comparación con modelos multilingües de tamaño similar o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342.283.264 (342 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, F16 (GGUF); bf16 en safetensors |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay) — uso no comercial libre, comercial bajo contrato |
| Formato de pesos | GGUF (llama.cpp), safetensors (repo separado) |
| Capas | 26 |
| Dimension del modelo | 1.024 |
| Vocabulario | 48.000 tokens (tokenizador propio entrenado en ruso) |
| Formato de dialogo | ChatML |
| Tamano de pesos | 685 MB (bf16), 688 MB (F16 GGUF), 367 MB (Q8_0), 219 MB (Q4_K_M) |
| Tokens de entrenamiento | 4.500 millones |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas y 1.024 dimensiones ocultas, con normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con consultas agrupadas (GQA) en proporción 16/4. La versión GGUF utiliza la disposición estándar de llama.cpp para garantizar compatibilidad con llama.cpp, LM Studio y Ollama. Tanto los pesos como el tokenizador (48.000 tokens, entrenado específicamente sobre ruso) y los datos de entrenamiento son propios, sin partir de un modelo preentrenado existente.

El preentrenamiento consumió 4.500 millones de tokens procedentes de Wikipedia en ruso, web en ruso, diálogos propios, código y tareas. Posteriormente se aplicó un ajuste fino orientado a habilidades prácticas: cálculo aritmético, generación de código, salida en JSON, traducción, llamada a herramientas, cortesía y calibración de la honestidad (el modelo declara "no lo sé" cuando no dispone de información). El autor reporta una mejora de 53,5 a 74 puntos sobre 120 en una prueba práctica interna tras este ajuste fino. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto conversacional en ruso con formato de diálogo ChatML.
- Razonamiento aritmético básico y resolución de problemas verbales sencillos (sumas, cálculos de velocidad, etc.).
- Generación de código en contextos acotados.
- Salida estructurada en JSON a partir de texto libre (por ejemplo, extracción de campos producto y precio).
- Llamada a herramientas / function calling con formato JSON (`{"tool": ..., "args": {...}}`).
- Traducción y tareas lingüísticas básicas en ruso.
- Calibración de la honestidad: el modelo indica explícitamente cuando no sabe algo.
- Ejecución completamente offline en dispositivos de consumo (portátil, teléfono).
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- Soporte multilingüe limitado al ruso; no se documentan otros idiomas.

## Casos de uso

- Asistentes conversacionales offline en ruso: el modelo puede gestionar diálogos multi-turno dentro de su ventana de 4.096 tokens y ejecutarse íntegramente en un teléfono o portátil sin conexión, lo que resulta adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Extracción de datos estructurados: dado un texto en ruso, el modelo devuelve JSON con campos definidos (producto, precio, etc.), lo que permite integrarlo en pipelines de procesamiento de documentos o formularios.
- Automatización de tareas con herramientas: mediante function calling en formato JSON, puede invocar APIs sencillas (por ejemplo, consultas meteorológicas) en flujos de agente de un solo paso.
- Educación y práctica de ruso: resolución de problemas aritméticos y verbales paso a paso, útil como tutor básico en dispositivos de bajo coste.
- Prototipado rápido y pruebas de concepto: su reducido tamaño (219 MB en Q4_K_M) permite iterar rápidamente en local con llama.cpp u Ollama sin necesidad de GPU.
- Filtrado y clasificación de texto en ruso: generación de respuestas estructuradas para tareas de etiquetado o normalización dentro de aplicaciones de procesamiento de lenguaje natural.
- Despliegue en el borde (edge computing): integración en dispositivos embebidos o aplicaciones móviles donde el presupuesto de memoria es inferior a 1 GB.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| MERA 2.0 (global) | 0,054 | Mejor puntuación de la línea Zernyshko según el autor |
| Prueba práctica interna (120 preguntas) | 74 / 120 tras ajuste fino (53,5 / 120 antes) | Prueba propia del autor, no estandarizada |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones (219 MB en Q4_K_M, 367 MB en Q8_0, 688 MB en F16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas integradas y en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU pura.
- Cabe en telefonos moviles: sí, según el autor, en formato Q8_0 o Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-2.0-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-2.0-GGUF`), LM Studio (buscar "RusMind Zernyshko"). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4.096 | Ruso | RusMind License (no comercial libre) | GGUF, safetensors |
| Qwen2.5-0.5B | 500 M | 32.768 | Multilingue | Apache 2.0 | GGUF, safetensors |
| SmolLM2-360M | 360 M | 8.192 | Ingles (principalmente) | Apache 2.0 | GGUF, safetensors |
| Llama 3.2 1B | 1.200 M | 128.000 | Multilingue | Llama 3.2 Community License | GGUF, safetensors |

La comparativa se basa en características públicas de modelos de tamano similar; no se dispone de resultados de benchmarks comparativos directos en la informacion proporcionada. RusMind Zernyshko 2.0 se distingue por su enfoque monolingüe en ruso y su licencia restrictiva para uso comercial, frente a las licencias permisivas (Apache 2.0) de alternativas como Qwen2.5-0.5B o SmolLM2-360M.

## Limitaciones y advertencias

- Rendimiento limitado: la puntuación MERA 2.0 de 0,054 es muy baja en términos absolutos, lo que sugiere capacidades reducidas en tareas de comprensión y razonamiento en ruso.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios fuera de su conjunto de entrenamiento.
- Sesgos: al entrenarse principalmente sobre Wikipedia y web en ruso, puede reflejar sesgos presentes en esas fuentes; no se documentan medidas de mitigación.
- Limitación idiomática: solo soporta ruso; no se garantiza un comportamiento correcto en otros idiomas.
- Ventana de contexto corta (4.096 tokens), insuficiente para documentos largos o conversaciones extensas.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren un contrato escrito con DICPlay. La licencia no es de código abierto según los criterios de la OSI.
- Modelo proporcionado "tal cual", sin garantías.
- Ausencia de benchmarks estandarizados publicados que permitan una evaluación independiente.
- No se documenta soporte para vLLM ni TGI, lo que limita el despliegue en entornos de servidor de alto rendimiento.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Hugging Face (safetensors): https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-Q4_K_M.gguf
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/LICENSE
