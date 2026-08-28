# ilhamirfan/po-qwen35-4b-float16

## Resumen

El modelo `ilhamirfan/po-qwen35-4b-float16` es un finetune del modelo Qwen3.5-4B de Alibaba Cloud, convertido a formato GGUF mediante la librería Unsloth. Se trata de un modelo multimodal (texto e imagen) de 4.326 millones de parámetros, con una arquitectura híbrida que combina Gated Delta Networks y Gated Attention, y una ventana de contexto nativa de 262.144 tokens. El repositorio incluye dos archivos: un cuantizado Q4_K_M para el modelo principal y un proyector multimodal en F16 (`mmproj`), lo que permite su uso tanto en modo texto como en modo visión a través de `llama.cpp` o `llama-mtmd-cli`.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento y comprensión multimodal en un tamaño compacto de 4B, apto para ejecución en hardware de consumo, con una licencia Apache 2.0 para el modelo base (aunque la licencia específica de este finetune no está declarada). Al estar en formato GGUF, se puede desplegar fácilmente con herramientas como llama.cpp, Ollama o LM Studio, lo que lo hace accesible para desarrolladores que necesitan un modelo local con soporte de visión y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (patrón 8×(3×DeltaNet→FFN→1×Attention→FFN)) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifica la lista) |
| Licencia | no disponible (el modelo base Qwen3.5 es Apache 2.0, pero la licencia del finetune no está declarada) |
| Formato de pesos | GGUF (archivos `.gguf`) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención lineal (Gated Delta Networks) con capas de atención tradicional (Gated Attention), dispuestas en un patrón repetitivo de 8 bloques, cada uno con 3 capas DeltaNet seguidas de una capa de atención y FFN. Esta mezcla busca reducir el coste computacional del mecanismo de atención manteniendo la capacidad de modelar dependencias de largo alcance, lo que permite una ventana de contexto de 262.144 tokens sin un aumento cuadrático del coste.

El modelo base fue entrenado por Alibaba Cloud con un enfoque de fusión temprana de tokens multimodales (texto, imagen y vídeo), seguido de un refuerzo a escala (RL) para mejorar el razonamiento. El finetune `po-qwen35-4b` fue realizado por el usuario `ilhamirfan` utilizando Unsloth, que acelera el entrenamiento y la conversión a GGUF. No se proporcionan detalles sobre el dataset de finetune ni sobre el proceso de alineación (RLHF/DPO) específico de esta variante.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-4B, hereda capacidades de razonamiento y comprensión de instrucciones, aunque el finetune específico no documenta mejoras concretas.
- Comprensión multimodal: soporta entrada de imágenes (y posiblemente vídeo) gracias al proyector multimodal incluido (`F16-mmproj.gguf`), permitiendo tareas de visión-lenguaje como descripción de imágenes o respuesta a preguntas visuales.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos, conversaciones multi-turno o análisis de código de gran tamaño.
- Ejecución local eficiente: al estar cuantizado en Q4_K_M, puede ejecutarse en hardware de consumo con VRAM moderada.
- Compatibilidad con herramientas estándar: formato GGUF compatible con llama.cpp, llama-mtmd-cli, Ollama, LM Studio y otros motores de inferencia.
- Soporte de tool calling y agentes: no confirmado explícitamente para este finetune, pero el modelo base Qwen3.5 incluye capacidades de function calling; se recomienda verificar con pruebas específicas.

## Casos de uso

- Asistente de atención al cliente con contexto largo: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 262.144 tokens de ventana, manteniendo el contexto de interacciones previas sin truncamiento.
- Análisis de documentos técnicos y legales: su capacidad de procesar grandes volúmenes de texto permite resumir contratos, informes o artículos científicos completos en una sola pasada.
- Generación y revisión de código en entornos locales: puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o documentación, ejecutándose en una GPU de gama media sin depender de APIs externas.
- Descripción y análisis de imágenes en aplicaciones de accesibilidad: gracias al proyector multimodal, puede generar descripciones de imágenes para personas con discapacidad visual o para sistemas de moderación de contenido.
- Chatbot educativo con razonamiento matemático: su tamaño compacto permite desplegarlo en portátiles o estaciones de trabajo para tutorías interactivas de matemáticas o ciencias, con capacidad de razonamiento paso a paso.
- Prototipado rápido de aplicaciones de IA generativa: al ser un modelo GGUF, se puede cargar con llama.cpp u Ollama para experimentar con prompts, agentes o flujos de trabajo sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de evaluación, y las fuentes web consultadas no proporcionan datos específicos para este finetune. Se recomienda ejecutar pruebas propias (por ejemplo, MMLU, HumanEval o GSM8K) para evaluar su rendimiento en las tareas de interés.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 2,5-3 GB (según el tamaño del repo de 3,5 GB que incluye ambos archivos), por lo que puede ejecutarse en GPUs con 6 GB de VRAM o más. El proyector F16 añade unos 0,5-1 GB adicionales si se usa el modo multimodal.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090, o GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y alta de consumo, así como en Apple Silicon (M1/M2/M3) mediante llama.cpp.
- Opciones de despliegue: llama.cpp (con `llama-cli` para texto y `llama-mtmd-cli` para multimodal), Ollama, LM Studio, o servidores compatibles con GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de la secuencia. Para un modelo de 4B en Q4, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,3B | 262.144 | Sí (texto, imagen, vídeo) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-4B | 4,3B | 32.768 | No | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | 3,2B | 128.000 | No | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini | 3,8B | 128.000 | No | MIT | safetensors, GGUF |

Este finetune se diferencia del Qwen3.5-4B base por estar ya convertido a GGUF y por el ajuste específico realizado por el autor, aunque no se documentan los datos de entrenamiento. Frente a alternativas como Llama-3.2-3B o Phi-3.5-mini, ofrece una ventana de contexto muy superior y capacidades multimodales, a costa de un tamaño ligeramente mayor.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica la licencia del finetune. Aunque el modelo base Qwen3.5 es Apache 2.0, el trabajo derivado podría tener restricciones adicionales; se recomienda contactar al autor antes de un uso comercial.
- Sesgos y alucinaciones: al ser un modelo de 4B, puede presentar alucinaciones en tareas de razonamiento complejo o generar información factual incorrecta. No se han realizado evaluaciones de sesgo para este finetune.
- Limitaciones del finetune: se desconoce el dataset de ajuste, por lo que no se puede garantizar su comportamiento en dominios específicos. El nombre "po" sugiere un posible ajuste para poesía o algún dominio particular, pero no está documentado.
- Soporte de tool calling no verificado: aunque el modelo base lo soporta, no hay confirmación de que el finetune conserve esta capacidad; es necesario probarlo.
- Requisitos de contexto: aunque la ventana es de 262.144 tokens, el rendimiento real puede degradarse con secuencias muy largas en hardware limitado, y el uso del modo multimodal requiere el proyector F16, que aumenta el uso de VRAM.
- Disponibilidad de idiomas: no se especifica la lista de idiomas soportados; se asume multilingüe por el modelo base, pero sin garantía.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ilhamirfan/po-qwen35-4b-float16
- Colección Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Especificaciones y requisitos de VRAM de Qwen3.5-4B: https://apxml.com/models/qwen35-4b
- Guía completa de Qwen 3.5 (modelos, benchmarks y setup local): https://qwen-ai.com/qwen-3-5/
