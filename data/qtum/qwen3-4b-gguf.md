# qtum/Qwen3-4B-GGUF

## Resumen

El modelo `qtum/Qwen3-4B-GGUF` es una cuantización en formato GGUF del modelo original `Qwen/Qwen3-4B`, realizada por el usuario qtum mediante la herramienta `llama.cpp` (commit `9a3bf2b`). El objetivo es ofrecer versiones comprimidas del modelo para su ejecución eficiente en entornos con recursos limitados, como CPU, GPU de consumo o dispositivos edge, manteniendo un equilibrio entre tamaño y calidad. La cuantización utiliza la técnica de *importance matrix* (imatrix) con un dataset de calibración bilingüe (inglés y chino) y orientado a código, lo que preserva mejor las capacidades multilingües y de generación de código en cuantizaciones de bajo bit.

El modelo base, Qwen3-4B, es un modelo de lenguaje grande de 4 022 468 096 parámetros (aproximadamente 4B), desarrollado por Alibaba Cloud, con licencia Apache 2.0. Esta versión cuantizada mantiene la misma arquitectura y capacidades del original, pero en un formato optimizado para inferencia con `llama.cpp` y sus derivados (Ollama, LM Studio, etc.). Se incluyen siete niveles de cuantización (desde Q8_0 hasta Q2_K), lo que permite elegir el punto óptimo entre tamaño, velocidad y fidelidad según el hardware disponible.

La relevancia de esta ficha radica en que ofrece una guía práctica para desarrolladores que necesitan desplegar un modelo de 4B en entornos con restricciones de memoria, aprovechando las ventajas del formato GGUF y la optimización imatrix. El modelo está diseñado para tareas de generación de texto y conversación, con soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B) |
| Parametros totales | 4 022 468 096 (4.02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q2_K (todos en formato GGUF) |
| Idiomas soportados | Ingles (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

La arquitectura del modelo corresponde al modelo base `Qwen/Qwen3-4B`, un transformer decoder-only con aproximadamente 4 mil millones de parámetros. No se dispone de detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.) en la información proporcionada, por lo que se considera no disponible.

El proceso de cuantización fue realizado por qtum utilizando `llama.cpp` en su commit `9a3bf2b`. La técnica empleada es la *importance matrix* (imatrix), que asigna pesos de importancia a los tensores durante la cuantización para minimizar la pérdida de calidad. El dataset de calibración utilizado es bilingüe (inglés y chino) y con alto contenido de código, lo que permite que las cuantizaciones de bajo bit conserven mejor las habilidades de generación de código y comprensión del chino en comparación con calibraciones solo en inglés. El archivo `.imatrix` está incluido en el repositorio, lo que permite reproducir o extender el conjunto de cuantizaciones con la misma matriz de importancia.

No se proporciona información sobre el entrenamiento del modelo base (tokens de entrenamiento, composición del dataset, técnicas de alineación como RLHF o DPO). Por tanto, estos datos se consideran no disponibles.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado en inglés y chino, siguiendo el formato de prompt ChatML (`<|im_start|>` y `<|im_end|>`).
- Conversación multi-turno: al ser un modelo de lenguaje con formato de chat, puede mantener diálogos con varios turnos, aunque no se especifica un límite de contexto.
- Generación de código: gracias al dataset de calibración orientado a código, las cuantizaciones conservan habilidades de generación de código en lenguajes de programación comunes, aunque no se detallan lenguajes específicos.
- Compatibilidad con herramientas de inferencia: al estar en formato GGUF, es compatible con `llama.cpp`, `Ollama`, `LM Studio` y cualquier proyecto basado en `llama.cpp`.
- Soporte de tool calling / function calling: no se menciona en la información proporcionada, por lo que se considera no disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente, aunque el modelo podría ser utilizado para tareas de razonamiento básico, no se confirma.
- Capacidades multilingües: limitado a inglés y chino, según la etiqueta `language`.

## Casos de uso

- Asistentes conversacionales en entornos con recursos limitados: el modelo puede desplegarse en una CPU o GPU de gama baja (por ejemplo, 4-6 GB de VRAM) para ofrecer un chatbot funcional en inglés y chino, utilizando el formato ChatML para gestionar conversaciones.
- Generación de código en entornos de desarrollo locales: gracias a la calibración orientada a código, puede usarse como autocompletado o generador de fragmentos de código en editores o CLIs, con la ventaja de ser ejecutable en hardware modesto.
- Procesamiento de texto en español (traducción o resumen) con limitación: aunque no está entrenado específicamente para español, puede generar texto en inglés o chino, por lo que no es adecuado para tareas que requieran español nativo. Sin embargo, podría usarse como base para fine-tuning posterior.
- Prototipado rápido de aplicaciones de IA: al ser una cuantización GGUF, es fácil de integrar en proyectos con `llama.cpp` o `Ollama`, permitiendo iterar rápidamente sin necesidad de GPUs de alta gama.
- Inferencia en dispositivos edge o integrados: los archivos de menor tamaño (IQ3_M, Q2_K) caben en dispositivos con poca RAM, lo que permite ejecutar un LLM en una Raspberry Pi o un teléfono móvil para tareas de generación de texto simples.
- Evaluación de calidad de cuantización: el repositorio incluye múltiples niveles de cuantización, lo que permite a los desarrolladores comparar el impacto de cada nivel en la calidad de salida para su caso de uso específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La única referencia de calidad es la descripción cualitativa de cada archivo en la tabla de la model card (por ejemplo, "muy alta calidad", "calidad buena", etc.), pero no hay datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo elegido, el tamaño del archivo da una indicación aproximada de la memoria necesaria. Por ejemplo, Q4_K_M (2.50 GB) requiere al menos 3-4 GB de VRAM para caber en GPU; Q6_K (3.31 GB) requiere al menos 4-5 GB; Q8_0 (4.28 GB) requiere al menos 5-6 GB. Para CPU, se necesita RAM equivalente al tamaño del archivo más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones más pequeñas (Q4_K_M, IQ4_XS, IQ3_M, Q2_K). Para Q6_K y Q8_0 se recomiendan GPUs con 6 GB o más, como RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100 (aunque serían sobredimensionadas).
- Si cabe en consumer GPU: sí, la mayoría de las cuantizaciones caben en GPUs de consumo modernas (RTX 3060 12GB, RTX 4070, etc.) sin problema. Incluso Q8_0 cabe en GPUs con 6 GB de VRAM.
- Opciones de despliegue: `llama.cpp` (compilación directa), `Ollama` (con `ollama run qtum/Qwen3-4B-GGUF`), `LM Studio` (interfaz gráfica), y cualquier otro proyecto compatible con GGUF.
- Latencia y throughput estimados: no se proporcionan datos específicos. En general, para un modelo de 4B cuantizado en una GPU moderna, se pueden esperar decenas de tokens por segundo, pero depende del hardware y la cuantización. En CPU, el throughput será menor (unos pocos tokens por segundo).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Sin embargo, al ser una cuantización de Qwen3-4B, puede compararse con otras cuantizaciones del mismo modelo base (por ejemplo, las publicadas por otros usuarios como `bartowski` o `TheBloke`), pero no se tienen datos de rendimiento para establecer una comparación objetiva. Se recomienda consultar el modelo base original en HuggingFace para obtener benchmarks del modelo sin cuantizar.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica sobre sesgos del modelo base, pero como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento. Se recomienda evaluar en el dominio de uso.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos donde no tiene conocimiento. La cuantización puede aumentar ligeramente este riesgo en niveles de bit muy bajos.
- Limitaciones de contexto o idioma: el modelo solo soporta inglés y chino. No está optimizado para otros idiomas, incluido el español, por lo que su uso en español puede producir resultados de calidad inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y los avisos de copyright. No hay restricciones adicionales conocidas.
- Pérdida de calidad por cuantización: los niveles de cuantización más bajos (Q2_K, IQ3_M) pueden degradar notablemente la calidad de salida, especialmente en tareas complejas. Se recomienda usar Q4_K_M o superior para producción.
- Dependencia de la herramienta de cuantización: la calidad de la cuantización depende de la versión de `llama.cpp` utilizada. El commit `9a3bf2b` es específico y puede no ser compatible con versiones futuras.

## Enlaces

- Repositorio HuggingFace: [qtum/Qwen3-4B-GGUF](https://huggingface.co/qtum/Qwen3-4B-GGUF)
- Modelo base: [Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- Herramienta de cuantización: [llama.cpp](https://github.com/ggml-org/llama.cpp)
- Guía de rendimiento de cuantizaciones (referenciada en la model card): [Artefact2 gist](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- LM Studio: [https://lmstudio.ai/](https://lmstudio.ai/)
- Ollama: [https://ollama.com/](https://ollama.com/)
