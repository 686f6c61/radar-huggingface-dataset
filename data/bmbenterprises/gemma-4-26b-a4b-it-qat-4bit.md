# bmbenterprises/gemma-4-26B-A4B-it-qat-4bit

## Resumen

Gemma 4 26B A4B IT QAT 4-bit es una cuantización de 4 bits del modelo multimodal Gemma 4 de Google, publicada por el usuario bmbenterprises en formato MLX para su ejecución en hardware Apple Silicon. El identificador del repositorio indica una arquitectura de mezcla de expertos (MoE, por las siglas "A4B" que sugieren aproximadamente 4.000 millones de parámetros activos sobre un total de unos 26.000 millones), en su variante instruida ("IT") y con cuantización consciente del entrenamiento ("QAT", quantization-aware training). El modelo procesa entradas de imagen y texto y genera texto, según declara el pipeline `image-text-to-text`.

El peso real de los safetensors confirma 25.805.936.206 parámetros totales, lo que encaja con la nomenclatura comercial de 26B. El repositorio ocupa 15,6 GB, coherente con una cuantización de 4 bits de un modelo de ese tamaño. La librería declarada es `mlx`, lo que limita su uso a entornos con el framework de Apple (macOS sobre Apple Silicon), y no se distribuyen pesos en formato GGUF ni safetensors estándar de PyTorch.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras cuantizaciones comunitarias de Gemma 4 en formato MLX; por otro, advierte de que se trata de una publicación sin descargas ni validación pública (0 descargas, 0 likes en el momento de la consulta), con licencia no especificada en el repositorio y con la model card prácticamente vacía, limitada a instrucciones de uso. Cualquier evaluación de producción debe hacerse con cautela y verificando la licencia upstream de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun nomenclatura "A4B"; detalles internos no disponibles |
| Parametros totales | 25.805.936.206 (segun safetensors) |
| Parametros activos | Aproximadamente 4.000 millones (inferido del sufijo "A4B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit QAT (cuantizacion consciente del entrenamiento); no se detallan esquemas adicionales |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | no disponible en el repositorio (la licencia upstream de Gemma 4 no se cita) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no hay GGUF ni pesos PyTorch |
| Tamano del repositorio | 15,6 GB |
| Pipeline | image-text-to-text (multimodal imagen + texto) |
| Fecha de publicacion | 2026-11-11 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la nomenclatura del identificador. El sufijo "A4B" es consistente con un transformer de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos por token sobre un total de 25.805.936.206 parámetros, un patrón habitual en la familia Gemma de Google para equilibrar capacidad y coste de inferencia. El sufijo "IT" indica un ajuste instruccional sobre el modelo base, y "QAT" señala que la cuantización a 4 bits se aplicó durante el entrenamiento (quantization-aware training) en lugar de como post-procesado, lo que en teoría reduce la degradación de calidad respecto a una cuantización post-entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del repositorio se limita a indicar la instalación de `mlx-vlm` y un comando de ejemplo para generación con imagen. Tampoco se documenta el proceso de cuantización concreto (grupo de cuantización, bits por peso más allá del 4-bit nominal, calibración) ni si se preservaron las cabezas de visión con precisión completa.

## Capacidades

- Generación de texto conversacional en inglés a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y diálogo multimodal, según el ejemplo de la model card ("Describe this image.").
- Modo instruccional ("IT"): el modelo está ajustado para seguir instrucciones en formato conversacional.
- Cuantización QAT a 4 bits: pensada para reducir huella de memoria manteniendo calidad cercana al modelo original, aunque no se aportan métricas que lo confirmen.
- Ejecución en Apple Silicon mediante `mlx-vlm`, con soporte de decodificación con temperatura y límite de tokens.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo "thinking". No disponibles.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar descripciones textuales de fotografías o capturas ejecutándose íntegramente en un Mac con Apple Silicon mediante `mlx-vlm`, sin enviar datos a la nube, lo que resulta adecuado para flujos con requisitos de privacidad.
- Asistencia visual conversacional en escritorio: integración en aplicaciones macOS que necesiten responder preguntas sobre imágenes (por ejemplo, análisis de capturas de pantalla o diagramas) con una ventana de contexto no confirmada pero suficiente para diálogos multi-turno moderados.
- Prototipado rápido de producto multimodal: al ser un formato MLX de 15,6 GB, permite iterar en un portátil o estación de trabajo Apple sin infraestructura GPU, útil para validar ideas antes de migrar a un despliegue en servidor.
- Etiquetado y anotación asistida de imágenes: generación de descripciones y respuestas para pre-anotar datasets de visión, con revisión humana posterior; la cuantización 4-bit reduce el coste de ejecución en lote sobre hardware de consumo.
- Investigación en eficiencia de modelos MoE cuantizados: sirve como artefacto para estudiar el impacto de QAT 4-bit en un MoE multimodal de ~26B parámetros, comparando salidas con el modelo original en tareas controladas.
- Demostraciones y docencia: ejecución local de un modelo multimodal de gran tamaño en un Mac para talleres o clases, sin depender de APIs externas ni de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio pesa 15,6 GB en safetensors 4-bit; la inferencia requiere al menos ~16-18 GB de memoria unificada disponible, más overhead de activaciones y del codificador visual. Se recomienda un mínimo de 24 GB y, para contexto largo, 32 GB o más.
- Hardware objetivo: Apple Silicon exclusivamente (librería `mlx`). No es ejecutable en GPU NVIDIA/AMD ni en CPU x86 sin conversión previa.
- Equipos recomendados: Mac con chip M2 Pro/Max/Ultra, M3 Pro/Max/Ultra o M4 Pro/Max/Ultra con 24 GB o más de memoria unificada. Un MacBook Air M2/M3 de 16 GB queda al límite y probablemente no sea suficiente.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en su formato actual, ya que los pesos están en MLX y no hay conversión a GGUF o safetensors PyTorch publicada en este repositorio.
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Dependerán del chip Apple, del ancho de banda de memoria y de la longitud de contexto; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bmbenterprises/gemma-4-26B-A4B-it-qat-4bit | 25,8B totales (~4B activos, inferido) | no disponible | imagen + texto | MLX safetensors 4-bit | no disponible | 0 descargas, 0 likes |
| mlx-community/gemma-4-26B-A4B-it-qat-4bit (referenciado en la model card) | 25,8B totales (~4B activos, inferido) | no disponible | imagen + texto | MLX safetensors 4-bit | no disponible | repositorio upstream citado; métricas no consultadas |
| Gemma 3 27B IT (generacion anterior de Google) | 27B densos | 128K (segun documentacion publica de Gemma 3) | texto (variantes multimodales en 4B/12B) | safetensors, GGUF, MLX | Gemma Terms of Use | ampliamente disponible |
| Qwen2.5-VL 32B | 32B densos | 128K (segun documentacion publica) | imagen + texto | safetensors, GGUF | Apache 2.0 (segun publicacion) | ampliamente disponible |

Nota: los datos de Gemma 3 y Qwen2.5-VL provienen de conocimiento general de la familia y no de la información proporcionada en esta consulta; se incluyen solo como referencia comparativa y deben verificarse en sus fichas oficiales. Para Gemma 4 no se dispone de especificaciones de contexto ni de benchmarks en la información recibida.

## Limitaciones y advertencias

- Licencia no disponible en el repositorio: no se puede confirmar el uso comercial. La licencia upstream de Gemma 4 (presumiblemente Gemma Terms of Use) debe verificarse antes de cualquier despliegue en producción.
- Modelo publicado por un usuario comunitario (bmbenterprises), no por Google ni por mlx-community; sin descargas ni validación pública en el momento de la consulta, lo que impide confirmar la fidelidad de la cuantización.
- Solo inglés declarado: no hay soporte multilingüe documentado, a pesar de que la familia Gemma suele cubrir más idiomas.
- Ejecución limitada a Apple Silicon por el formato MLX; no hay pesos GGUF ni PyTorch en este repositorio, lo que bloquea su uso en servidores NVIDIA o en pipelines estándar de Hugging Face Transformers.
- Cuantización 4-bit: aunque es QAT, existe riesgo de degradación en tareas de razonamiento, matemáticas u OCR fino; no se aportan métricas comparativas con el modelo original.
- Riesgo de alucinación inherente a los modelos generativos multimodales, especialmente en descripciones de imágenes con texto pequeño, gráficos o escenas ambiguas.
- Longitud de contexto no documentada: no se puede planificar su uso en diálogos largos o documentos visuales extensos sin pruebas empíricas.
- Model card mínima: no se documentan sesgos, datos de entrenamiento, evaluación de seguridad ni limitaciones conocidas por el autor.
- Fecha de creación y actualización idénticas (2026-11-11): no hay historial de revisiones ni garantía de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bmbenterprises/gemma-4-26B-A4B-it-qat-4bit
- Repositorio upstream citado en la model card: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit
- Librería `mlx-vlm` (usada en el ejemplo de la model card): https://github.com/Blaizzy/mlx-vlm
- Documentación de MLX (Apple): https://ml-explore.github.io/mlx/
- Familia Gemma de Google (referencia general): https://ai.google.dev/gemma
