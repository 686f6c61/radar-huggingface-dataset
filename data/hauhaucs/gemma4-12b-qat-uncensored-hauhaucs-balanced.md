# HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es un fine-tune comunitario del modelo oficial `google/gemma-4-12B-it` de Google DeepMind, creado por HauhauCS. Su objetivo principal es eliminar los rechazos ("refusals") del modelo base manteniendo intactas las capacidades originales: el autor reporta 0/465 rechazos en pruebas automatizadas y manuales. Está construido a partir de los pesos QAT (quantization-aware training) oficiales, por lo que la cuantización a 4 bits conserva una calidad cercana a la precisión completa.

El modelo es denso, con 12 mil millones de parámetros y una ventana de contexto de 256K tokens (262.144). Es multimodal: acepta tanto texto como imágenes mediante un proyector de visión (mmproj) incluido. Se distribuye exclusivamente en formato GGUF, con un peso principal Q4_K_M de 6,9 GB, un adaptador de visión de 168 MB y un cabezal de predicción multi-token (MTP) de 242 MB para decodificación especulativa, que según el autor acelera la generación aproximadamente un 60 % sin cambiar la calidad de salida.

La variante "Balanced" (recomendada por el autor) está optimizada para tareas de agente, generación de código, razonamiento y escritura creativa, con un comportamiento que razona antes de responder y permanece fiable siguiendo instrucciones. El modelo se ha vuelto popular en la comunidad: acumula más de 129.000 descargas y 280 likes en Hugging Face, y es compatible con runtimes GGUF como llama.cpp, LM Studio, Jan y koboldcpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Gemma 4 12B |
| Parametros totales | 12B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (único peso principal publicado; el autor indica que Q4_K_M es el punto óptimo por el entrenamiento QAT) |
| Idiomas soportados | Inglés (según la model card; el modelo base Gemma 4 soporta más idiomas, pero no se especifican en esta variante) |
| Licencia | Gemma (términos de licencia de Google DeepMind) |
| Formato de pesos | GGUF (archivos: `Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-Q4_K_M.gguf`, `mmproj-Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-BF16.gguf`, `mtp-gemma-4-12B-it.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12B parámetros, derivado de Gemma 4 12B de Google DeepMind. La arquitectura base incorpora atención con ventana deslizante y atención global alternadas (patrón típico de la familia Gemma), lo que permite manejar contextos largos de hasta 256K tokens. La variante de HauhauCS se construye sobre los pesos oficiales QAT (quantization-aware training), es decir, el modelo fue entrenado para degradarse de forma controlada al ser cuantizado a 4 bits, lo que explica que el autor publique únicamente una cuantización Q4_K_M y afirme que cuantizaciones superiores no aportan ganancia real de calidad.

El proceso de "uncensoring" no modifica los datos de entrenamiento ni las capacidades del modelo: se trata de un ajuste fino dirigido a reducir o eliminar los rechazos del modelo base ante solicitudes sensibles o controvertidas, manteniendo el comportamiento funcional original. La variante Balanced, en particular, está ajustada para razonar antes de responder y mantenerse fiable en tareas de agente, código y escritura creativa. El modelo incluye además un cabezal MTP (multi-token-prediction) procedente de la versión de Unsloth, que se utiliza como borrador en decodificación especulativa: el modelo principal verifica cada token propuesto, por lo que la calidad de salida no cambia, solo se acelera la generación (aproximadamente un 60 % según el autor, probado en llama.cpp).

No se han publicado detalles sobre el dataset de entrenamiento del fine-tune, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en el proceso de uncensoring.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo razona antes de responder, lo que mejora la fiabilidad en tareas complejas.
- Generación de código y soporte para tareas de agente: la variante Balanced está optimizada para coding, tool calling implícito y flujos de trabajo agénticos.
- Escritura creativa y roleplay: el ajuste reduce rechazos, lo que lo hace adecuado para narrativa, diálogos y personajes sin restricciones temáticas.
- Multimodal con entrada de imágenes: mediante el archivo mmproj, acepta imágenes como entrada adicional al texto (pipeline image-text-to-text).
- Capacidad multilingüe limitada: la model card indica inglés como idioma soportado; no se documentan otros idiomas en esta variante.
- Decodificación especulativa con MTP: compatible con el cabezal de borrador incluido para acelerar la generación sin pérdida de calidad.
- Contexto largo de 256K tokens: permite procesar documentos extensos, conversaciones multi-turno prolongadas o código de gran tamaño.
- Sin rechazos en pruebas estándar: 0/465 refusals en benchmarks automatizados y manuales, según el autor.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (por ejemplo, mediante llama.cpp o LM Studio) para autocompletar código, explicar fragmentos o refactorizar, aprovechando su contexto de 256K tokens para proyectos grandes y su ajuste orientado a coding.
- Generación de contenido creativo sin fricciones: escritores y creadores de roleplay pueden usarlo para narrativa, diálogos y personajes sin que el modelo rechace solicitudes por temática sensible, algo habitual en modelos base con moderación estricta.
- Automatización de tareas de agente: gracias a su comportamiento fiable siguiendo instrucciones y su capacidad de razonamiento, puede actuar como backend en pipelines de automatización que requieran múltiples pasos de decisión y generación de texto.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, útil para extraer información de documentos escaneados o interfaces de usuario.
- Chat conversacional de largo recorrido: con 256K tokens de contexto, puede mantener conversaciones extensas con historial completo, adecuado para asistentes personales o chatbots de atención al cliente en inglés.
- Prototipado rápido de aplicaciones de IA: al ser un GGUF ligero (6,9 GB) que corre en hardware de consumo, permite a desarrolladores experimentar con un modelo de 12B sin necesidad de GPUs profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros estándares, y las búsquedas web no revelan datos de rendimiento adicionales. El único dato de rendimiento mencionado es la aceleración de aproximadamente un 60 % en velocidad de generación al usar el cabezal MTP con decodificación especulativa, medido por el autor en llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso principal Q4_K_M ocupa 6,9 GB en disco; con el mmproj (168 MB) y el drafter MTP (242 MB), el conjunto completo ronda los 7,3 GB. En la práctica, con capas descargadas en GPU y overhead de KV cache para contexto largo, se recomienda al menos 10-12 GB de VRAM para un uso cómodo.
- GPU recomendadas: tarjetas de consumo con 12 GB o más, como RTX 3060 12GB, RTX 4070, RTX 4080 o RTX 4090. Para contexto de 256K completo, se necesitaría más VRAM o descarga parcial de capas a CPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta con cuantización Q4_K_M, siempre que no se use el contexto máximo simultáneamente con el modelo completo en GPU.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF. También es compatible con endpoints vía servidores que soporten GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales. El autor indica una mejora de ~60 % en velocidad de generación con MTP activado, pero no proporciona números absolutos de tokens por segundo.
- Aviso específico de hardware: el autor advierte que Gemma 4 puede fallar en LM Studio con el modo tensor-split multi-GPU; recomienda usar una sola GPU con layer-split o priority order.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 12B | 256K | Gemma | GGUF (Q4_K_M) | Fine-tune sin rechazos, multimodal, con MTP |
| google/gemma-4-12B-it (base) | 12B | 256K | Gemma | Safetensors / GGUF | Modelo oficial con moderación estándar |
| Llama 3.1 8B Instruct (referencia comparable en tamaño) | 8B | 128K | Llama 3.1 | Safetensors / GGUF | Modelo generalista, sin visión, con moderación estándar |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a características técnicas: el modelo de HauhauCS destaca por su ventana de contexto de 256K (superior a la de Llama 3.1 8B), su capacidad multimodal y su ausencia de rechazos, a costa de una licencia Gemma con restricciones de uso comercial (consulte los términos de Google). El modelo base Gemma 4 12B it es la referencia natural para evaluar el impacto del fine-tune, pero no se han publicado métricas que permitan cuantificar diferencias de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune del modelo base Gemma 4, hereda los sesgos presentes en los datos de entrenamiento originales. No se han documentado evaluaciones de sesgo específicas para esta variante.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o con temas poco representados. No se han publicado tasas de alucinación.
- Ausencia de rechazos: la eliminación de refusals implica que el modelo puede generar contenido que el base bloquearía, incluyendo material potencialmente dañino, ofensivo o ilegal. El autor advierte que algunos casos límite pueden requerir re-preguntar o reformular la solicitud.
- Limitaciones de idioma: la model card solo declara inglés. Aunque el modelo base puede tener capacidades multilingües, esta variante no las documenta y su comportamiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para aplicaciones de alto riesgo y requisitos de atribución. Es necesario revisar los términos completos antes de uso comercial.
- Soporte limitado de cuantización: solo se publica Q4_K_M. Aunque el autor justifica esta elección por el entrenamiento QAT, los usuarios que necesiten cuantizaciones más bajas (Q2, Q3) o más altas (Q5, Q6, Q8) no las encontrarán en este repositorio.
- Problemas de compatibilidad: el autor reporta fallos con tensor-split multi-GPU en LM Studio; el uso con múltiples GPUs requiere configuración específica (layer-split o priority order).
- Dependencia de runtimes GGUF: al distribuirse solo en GGUF, no es directamente utilizable con bibliotecas de Python como Transformers o vLLM sin conversión previa, lo que limita su integración en pipelines que requieran safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma4-12b-qat-uncensored-hauhaucs-balanced-hauhaucs
- Ficha en Interfaze: https://interfaze.ai/models/hauhaucsgemma4-12b-qat-uncensored-hauhaucs-balanced
- Ficha en ThinkLLM: https://thinkllm.dev/models/gemma4-12b-qat-uncensored-hauhaucs-balanced
- Comunidad Discord del autor: https://discord.gg/SZ5vacTXYf
