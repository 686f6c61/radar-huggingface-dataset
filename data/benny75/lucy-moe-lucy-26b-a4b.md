# Benny75/lucy-moe-Lucy-26B-A4B

## Resumen

Lucy-26B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos por token, desarrollado por el usuario Benny75 y publicado en Hugging Face. El modelo se basa en la arquitectura Gemma 4 de Google DeepMind, concretamente en la variante de 26B-A4B, y se distribuye en formato GGUF cuantizado, lo que lo hace adecuado para inferencia local con llama.cpp y backends compatibles como Vulkan.

El modelo está pensado para ejecutarse en hardware de consumo, con una configuración optimizada probada en una AMD Radeon RX 9060 XT, alcanzando velocidades de generación de entre 67 y 77 tokens por segundo y un procesamiento de prompt de aproximadamente 453 tokens por segundo con una ventana de contexto de 100.000 tokens. Su relevancia radica en ofrecer capacidades de modelo grande con un coste computacional reducido gracias al diseño MoE, permitiendo su despliegue en entornos con VRAM limitada.

La ficha se basa exclusivamente en la información proporcionada por el autor en la model card y en los resultados de búsqueda web. No se dispone de datos oficiales sobre licencia, idiomas soportados ni benchmarks publicados por el autor, por lo que estos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4 (26B-A4B) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 4 B (A4B) |
| Longitud de contexto | 100.000 tokens (probado con `-c 100000`) |
| Tipos de cuantizacion | IQ3_M (archivo `Lucy-26B-A4B-it-qat-q4_0.i1-IQ3_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion IQ3_M) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, siguiendo el diseño de la familia Gemma 4 de Google DeepMind. Esta configuración A4B permite activar solo una fracción de los parámetros en cada paso de inferencia, reduciendo significativamente los requisitos de memoria y cómputo en comparación con un modelo denso del mismo tamaño total.

No se dispone de información detallada sobre el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación (como RLHF o DPO). El nombre del archivo sugiere un proceso de cuantizacion con "qat" (quantization-aware training) y una mezcla de cuantizacion `q4_0` con `i1` (importance matrix), lo que indica un ajuste fino orientado a la cuantizacion. El modelo se distribuye únicamente en formato GGUF, lo que implica que ha sido convertido y optimizado para su uso con llama.cpp y derivados.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational" y se ha probado en modo servidor con llama-server, lo que indica su aptitud para diálogos multi-turno.
- Razonamiento y comprensión de contexto largo: la configuración recomendada soporta una ventana de contexto de 100.000 tokens, permitiendo manejar documentos extensos o conversaciones prolongadas.
- Inferencia eficiente en hardware de consumo: gracias a la arquitectura MoE y a la cuantizacion IQ3_M, el modelo puede ejecutarse en GPUs de gama media como la AMD Radeon RX 9060 XT.
- Compatibilidad con backends de inferencia local: funciona con llama.cpp, incluyendo soporte para Vulkan, flash attention y caché KV cuantizada.
- No se han documentado capacidades específicas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse como un chatbot privado en una máquina personal, gestionando conversaciones de hasta 100.000 tokens de contexto, adecuado para usuarios que requieren privacidad y control total sobre sus datos.
- Procesamiento de documentos largos: con su ventana de contexto amplia, es útil para resumir, analizar o extraer información de informes extensos, artículos académicos o contratos legales sin necesidad de dividir el texto.
- Generación de código asistida en entornos sin conexión: aunque no se especifica soporte explícito para tool calling, el modelo puede emplearse para completar o generar fragmentos de código en un IDE local, aprovechando su capacidad de razonamiento.
- Servidor de inferencia para aplicaciones web: mediante llama-server, el modelo puede servir peticiones HTTP a múltiples clientes (con `--parallel 1` se limita a un usuario, pero puede ajustarse), ideal para prototipos o aplicaciones internas.
- Investigación y experimentación con MoE: al ser un modelo abierto (aunque con licencia no especificada), permite a investigadores estudiar el comportamiento de arquitecturas MoE cuantizadas en tareas de lenguaje natural.
- Educación y demostraciones técnicas: su tamaño reducido en disco (12,4 GB) y su capacidad de ejecución en GPUs de consumo lo convierten en una opción viable para talleres o cursos sobre inferencia de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento proporcionada por el autor corresponde a pruebas de velocidad en una configuración específica:

| Metrica | Valor |
|---|---|
| Velocidad de prompt (procesamiento) | ~453 tokens/segundo a 100k de contexto |
| Velocidad de generacion | ~67-77 tokens/segundo |
| Hardware de prueba | AMD Radeon RX 9060 XT (Vulkan) |
| Cuantizacion | IQ3_M |

Estos datos son empíricos y dependen del hardware y la configuración exacta; no deben considerarse como benchmarks generales del modelo.

## Requisitos de hardware

- VRAM estimada: no se especifica un valor exacto, pero el modelo en cuantizacion IQ3_M ocupa aproximadamente 12,4 GB en disco. Con la configuración recomendada (offload completo de capas, `--n-gpu-layers 999` y `--n-cpu-moe 0`), se requiere que la GPU tenga suficiente VRAM para alojar el modelo completo. Una AMD Radeon RX 9060 XT (típicamente 16 GB) es suficiente según las pruebas del autor.
- GPU recomendadas: AMD Radeon RX 9060 XT (probada), y por extensión GPUs con 16 GB o más de VRAM y soporte Vulkan o CUDA. GPUs como RTX 4090, RTX 4080 o A100 también serían adecuadas, aunque no se han probado oficialmente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media-alta con 16 GB de VRAM. Para GPUs con menos VRAM, se podría reducir el contexto o ajustar `--n-cpu-moe` para descargar parte de los expertos a CPU, aunque el autor advierte que esto reduce el rendimiento.
- Opciones de despliegue: llama.cpp (llama-server), compatible con backends Vulkan, CUDA y Metal. También puede usarse con Ollama o cualquier frontend que soporte GGUF, aunque no se ha verificado.
- Latencia y throughput: según las pruebas, genera entre 67 y 77 tokens por segundo, lo que equivale a una latencia de aproximadamente 13-15 ms por token. El procesamiento de prompt alcanza ~453 tokens por segundo.

## Comparativa con modelos similares

El modelo se basa en la familia Gemma 4 de Google, de la que se conocen las siguientes variantes (según la búsqueda web):

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Lucy-26B-A4B (este modelo) | 25,2 B | 4 B | 100k (probado) | GGUF (IQ3_M) | no disponible |
| Gemma 4 26B-A4B (original) | 26 B | 4 B | no disponible | safetensors (presumible) | no disponible |
| Gemma 4 12B | 12 B | 12 B (denso) | no disponible | safetensors | no disponible |
| Gemma 4 E4B | 4 B | 4 B (denso) | no disponible | safetensors | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de Lucy-26B-A4B es su formato GGUF cuantizado, que facilita su ejecución en hardware de consumo, mientras que los modelos originales de Google se distribuyen probablemente en safetensors y requieren más recursos.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos. Al derivar de Gemma 4, podría heredar sesgos presentes en los datos de entrenamiento de Google, pero no hay confirmación.
- Riesgo de alucinacion: no se han documentado tasas de alucinación. Como modelo conversacional, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- Limitaciones de contexto: aunque se ha probado con 100.000 tokens, el rendimiento a contextos más largos no está garantizado y puede degradarse. La caché KV cuantizada (q8_0) puede afectar a la calidad en contextos extremos.
- Restricciones de licencia: la licencia no está especificada en la model card. Esto impide conocer si el uso comercial está permitido. Se recomienda contactar al autor antes de usar el modelo en producción.
- Dependencia de hardware específico: la configuración óptima está validada solo para AMD Radeon RX 9060 XT con Vulkan. Otros backends o GPUs pueden requerir ajustes y ofrecer peor rendimiento.
- Cuantizacion agresiva: el uso de IQ3_M implica una pérdida de precisión respecto al modelo original en fp16. Para tareas que requieran alta fidelidad, puede ser preferible una cuantizacion más alta (Q4_K_M, Q5_K_M) si la VRAM lo permite.
- Sin soporte oficial: el modelo es un trabajo de un usuario independiente, no de Google. No hay garantías de mantenimiento, correcciones o actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Benny75/lucy-moe-Lucy-26B-A4B
- Modelo base (referencia): https://huggingface.co/Xenna/Lucy-MOE
- Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 26B-A4B en Hugging Face: https://huggingface.co/google/gemma-4-26B-A4B-it
- Artículo sobre Gemma 4 (PyImageSearch): https://pyimagesearch.com/2026/06/22/google-deepminds-gemma-4-moe-efficiency-tricks-and-benchmarks/
- Leaderboard de LLMs (septiembre 2026): https://benchlm.ai/
