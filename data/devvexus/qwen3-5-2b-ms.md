# devvexus/Qwen3.5-2B-MS

## Resumen

Qwen3.5-2B-MS es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.5-2B, publicada por el desarrollador independiente Matthew Priester (usuario devvexus en Hugging Face) bajo el formato propietario MS (Mad Shift). No se trata de un modelo nuevo entrenado desde cero, sino de una recompresión del modelo base de Qwen con un objetivo claro: reducir la pérdida de calidad respecto al modelo original en BF16 a igualdad de tamaño de fichero. El modelo base es un transformer de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) con licencia Apache 2.0 y capacidades multimodales mediante un codificador de visión independiente.

La propuesta de valor de esta publicación es puramente de eficiencia de cuantización. Según la model card, los ficheros MS logran una divergencia KL entre 4,5 y 9,4 veces menor que los ficheros equivalentes de unsloth en texto inglés, y el fichero MS4.3 (1,30 GB) se mantiene más cercano al modelo original que el Q6_K de unsloth (1,57 GB). Todos los ficheros caben en unos 3 GB de memoria a 32k de contexto, lo que los hace viables en GPU de consumo.

La relevancia actual reside en que permite ejecutar un modelo de 2B con contexto de 32k y capacidades de visión en hardware modesto, con una fidelidad al modelo original superior a la de los cuantizadores estándar. El coste es la dependencia de un fork específico de llama.cpp (ms-llama.cpp): los ficheros no cargan en llama.cpp estándar, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); cuantizacion GGUF en formato MS (Mad Shift) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en la model card; el modelo base soporta contexto nativo segun Qwen) |
| Tipos de cuantizacion | MS5, MS4.3, MS4, MS3.7, MS3.5, MS3, MS2.7 (formato propietario MS); codificador de vision en F16 |
| Idiomas soportados | no disponible de forma explicita; la calibracion se hizo en ingles y se evaluo tambien en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato MS, requiere ms-llama.cpp); codificador de vision GGUF F16 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba). La model card de esta publicación no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base, que no se incluye en la información proporcionada. Sí se indica que el modelo admite entrada multimodal mediante un codificador de visión separado (mmproj), lo que sugiere que el base es un modelo de lenguaje con adaptador visual.

La innovación técnica de esta publicación no está en el entrenamiento sino en el método de cuantización MS (Mad Shift). Según el autor, MS produce ficheros que, a igual o menor tamaño, presentan menor divergencia KL respecto al BF16 original que las cuantizaciones estándar de unsloth, y mayor acuerdo top-1 en el siguiente token (91,3-98,4 % frente a 80,8-96,4 %). La calibración se realizó en inglés; el chino se dejó fuera deliberadamente y aun así los ficheros MS superan a los de unsloth en texto chino retenido. El codificador de visión no está codificado en MS y quedó fuera de la evaluación. El formato requiere el fork ms-llama.cpp, que añade soporte para estos ficheros y para el estado recurrente del modelo (la model card menciona "recurrent state", lo que apunta a componentes de atención lineal o híbridos en el base, aunque no se detalla).

## Capacidades

- Generación de texto conversacional en múltiples turnos, con pipeline declarado como text-generation y tag conversational.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-2B.
- Procesamiento de imágenes mediante el codificador de visión opcional mmproj-Qwen3.5-2B-F16.gguf (0,67 GB), que añade 0,9-1,1 GiB de memoria GPU cuando está activo.
- Contexto largo de hasta 32k tokens en la configuración recomendada, suficiente para prompts extensos (la model card cita unos 24k tokens para el prompt de Claude Code).
- Compatibilidad con APIs OpenAI (endpoint /v1) y Anthropic (usado con Claude Code mediante ANTHROPIC_BASE_URL), lo que habilita integración en aplicaciones existentes.
- Soporte multilingüe: no declarado explícitamente; la evaluación incluyó inglés y chino, con mejor comportamiento relativo en chino que los cuantizadores de referencia pese a no estar calibrado en ese idioma.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, modo thinking ni audio; deben considerarse no verificadas para esta publicación.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con ficheros de 0,8-1,4 GB y unos 3 GB de memoria a 32k de contexto, se puede servir un chat multi-turno en una RTX 3060 o superior sin depender de la nube, usando llama-server del fork ms-llama.cpp.
- Procesamiento de documentos largos: la ventana de 32k tokens permite resumir o extraer información de contratos, informes o hilos de correo completos en una sola pasada, algo inusual en modelos de 2B.
- Integración en Claude Code como backend local: la model card documenta el uso con Claude Code apuntando ANTHROPIC_BASE_URL a localhost:8080 y subiendo el contexto a 49.152 tokens para acomodar el prompt de la herramienta, lo que permite desarrollo asistido sin coste de API.
- Aplicaciones con API compatible OpenAI: cualquier cliente que hable con /v1 puede usar el servidor local, facilitando prototipado de chatbots, clasificadores o generadores sin cambiar código.
- Análisis de imágenes en local: activando el mmproj F16, el modelo puede describir o responder preguntas sobre capturas, diagramas o fotos, útil para automatizar tareas de accesibilidad o triaje visual en entornos sin conexión.
- Evaluación de cuantizaciones y benchmarking de motores: el repositorio incluye gráficas de divergencia KL y acuerdo top-1, por lo que sirve como referencia para comparar el formato MS frente a Q_K, IQ_XS o EXL3 en pipelines de investigación sobre compresión de modelos.
- Despliegue en entornos con restricciones de memoria: los ficheros MS2.7 (775 MB) y MS3 (858 MB) permiten ejecutar el modelo en equipos con 4-6 GB de VRAM o en CPU, manteniendo según el autor mejor fidelidad que cuantizaciones estándar de mayor tamaño.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de fidelidad de cuantización (divergencia KL y acuerdo top-1 frente al BF16), no benchmarks de tareas estándar como MMLU o GSM8K.

| Fichero MS | Tamano | KLD | Fichero unsloth comparable (tamano) | KLD unsloth | Mejora | Top-1 MS / unsloth |
|---|---|---|---|---|---|---|
| MS5 | 1441 MB | 0,00142 | UD-Q5_K_XL (1467 MB) | 0,00640 | 4,5x | 98,36 % / 96,41 % |
| MS4.3 | 1301 MB | 0,00219 | UD-Q4_K_XL (1340 MB) | 0,01472 | 6,7x | 98,13 % / 94,87 % |
| MS4 | 1262 MB | 0,00270 | Q4_K_M (1281 MB) | 0,02007 | 7,4x | 98,02 % / 93,94 % |
| MS3.7 | 1165 MB | 0,00376 | IQ4_XS (1173 MB) | 0,02756 | 7,3x | no disponible en el extracto |

Datos adicionales declarados por el autor: MS4.3 (1,30 GB) tiene menor KLD que el Q6_K de unsloth (1,57 GB), 0,00219 frente a 0,00277; MS3.5 supera a Q4_K_M siendo 190 MB más pequeño; frente a EXL3, los ficheros MS ocupan el 39-59 % del tamaño para la misma divergencia KL. El acuerdo top-1 global se sitúa en 91,3-98,4 % para MS frente a 80,8-96,4 % para los ficheros de unsloth (54-73 % menos desacuerdos). Las mediciones de unsloth se hicieron sobre llama.cpp estándar, revisión f6d5376b, con 19 ficheros comparados.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB o menos para cualquier fichero MS a 32k de contexto, según la estimación del autor. El fichero más pequeño (MS2.7, 775 MB) reduce el requisito por debajo de 2 GB en la práctica.
- Codificador de visión: añade 0,9-1,1 GiB de memoria GPU cuando está activo; nada cuando está desactivado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 12 y al menos 4 GB de VRAM para los ficheros pequeños; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El instalador oficial cubre Windows x64-CUDA12 y ARM64-CUDA; Linux y macOS requieren compilar desde fuente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; los ficheros MS2.7 y MS3 podrían ejecutarse incluso en CPU con suficiente RAM.
- Opciones de despliegue: exclusivamente ms-llama.cpp (llama-server del fork). No es compatible con llama.cpp estándar, Ollama ni LM Studio. Expone API compatible OpenAI en /v1 y endpoint compatible Anthropic para Claude Code.
- Paralelismo: se recomienda -np 1 (un chat a la vez); cada slot paralelo adicional necesita su propia copia del estado recurrente del modelo, lo que puede expulsar capas de la GPU y degradar la generación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Fidelidad (KLD) | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-MS (MS4.3) | 1,88 B | 32k | GGUF MS / ms-llama.cpp | Apache 2.0 | 0,00219 | Hugging Face, requiere fork |
| Qwen3.5-2B-GGUF (unsloth, UD-Q4_K_XL) | 1,88 B | 32k | GGUF estandar / llama.cpp | Apache 2.0 | 0,01472 | Hugging Face, ampliamente soportado |
| Qwen3.5-2B EXL3 (UnstableLlama y conversion propia) | 1,88 B | 32k | EXL3 / ExLlamaV3 | Apache 2.0 | misma KLD que MS con 39-59 % mas de tamano | Hugging Face, ecosistema ExLlama |
| Qwen3.5-2B BF16 (original) | 1,88 B | 32k | safetensors / transformers | Apache 2.0 | 0 (referencia) | Hugging Face |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que la información proporcionada no incluye comparaciones con otros modelos de 2B. La ventaja de MS es la fidelidad por byte; la desventaja es la dependencia de un motor no estándar.

## Limitaciones y advertencias

- Dependencia de motor: los ficheros solo cargan en ms-llama.cpp. No funcionan en llama.cpp estándar, Ollama ni LM Studio, lo que limita su portabilidad y crea riesgo de mantenimiento si el fork deja de actualizarse.
- Calibración monolingüe: el método se calibró solo en inglés. Aunque supera a unsloth en chino retenido, el rendimiento en otros idiomas (castellano incluido) no está evaluado y podría degradarse más de lo habitual.
- Codificador de visión sin evaluar: el mmproj no está codificado en MS ni formó parte de la evaluación de fidelidad; su calidad y su interacción con los pesos cuantizados no están verificadas.
- Sesgos: no documentados en la información disponible; al heredarse del modelo base Qwen3.5-2B, arrastra los sesgos de sus datos de entrenamiento, no descritos aquí.
- Alucinación: no cuantificada. Un modelo de 1,88 B tiene capacidad limitada de razonamiento factual; la cuantización agresiva (MS2.7, MS3) puede aumentar la tasa de error en tareas sensibles.
- Licencia: Apache 2.0 permite uso comercial, pero la model card pide atribución a "MS (Mad Shift) by Matthew Priester" si se usan los ficheros o se construye sobre el formato; conviene revisar los términos del fork ms-llama.cpp, cuya licencia no se detalla en la información disponible.
- Paralelismo limitado: -np 1 restringe el despliegue a un usuario simultáneo por instancia, lo que complica escenarios de producción con concurrencia.
- Fecha de creación futura: el repositorio figura creado el 2026-11-10, dato que conviene verificar antes de citarlo.
- Sin benchmarks de tareas: no hay MMLU, HumanEval ni GSM8K publicados, por lo que la calidad real en tareas downstream no está cuantificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/devvexus/Qwen3.5-2B-MS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Fork del motor: https://github.com/devvexus/ms-llama.cpp
- Perfil del autor en GitHub: https://github.com/devvexus
- ORCID del autor: https://orcid.org/0009-0000-0032-5292
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Codificador de visión: https://huggingface.co/devvexus/Qwen3.5-2B-MS/resolve/main/vision/mmproj-Qwen3.5-2B-F16.gguf
- Paper referenciado en los tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
