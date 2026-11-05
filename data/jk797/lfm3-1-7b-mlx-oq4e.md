# jk797/LFM3-1.7B-MLX-oQ4e

## Resumen

LFM3-1.7B-MLX-oQ4e es una cuantización del modelo LFM3-1.7B (familia Liquid Foundation Models, desarrollada por Liquid AI) realizada por el usuario jk797 y publicada en HuggingFace. Se trata de un checkpoint convertido al formato MLX, el framework de Apple para ejecutar modelos de IA de forma nativa en chips de la serie M (M1, M2, M3, M4), lo que permite su despliegue en Macs sin necesidad de CUDA ni de GPUs dedicadas.

La cuantización se ha llevado a cabo con oQ (oMLX v0.7.4.dev1), una herramienta de cuantización de precisión mixta que asigna distintos niveles de bits por grupo de pesos según su sensibilidad. El resultado es un checkpoint de 1.729 mil millones de parámetros con un peso medio efectivo de 4,801 bits por peso y un tamaño de almacenamiento de aproximadamente 1,04 GB, lo que lo hace muy manejable en memoria unificada de equipos Apple.

El interés de esta ficha es doble: por un lado, documenta una variante cuantizada de un modelo de la familia LFM3 de Liquid AI, pensada para inferencia local en hardware Apple; por otro lado, es un ejemplo práctico de cuantización mixta con oQ, una técnica que está ganando tracción para reducir el tamaño de modelos manteniendo la calidad en los pesos más críticos. Al ser un repo de un usuario individual, la información sobre el modelo base es limitada y muchos datos (licencia, idiomas, benchmarks) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de Liquid AI; arquitectura exacta no confirmada en la informacion disponible) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 4-bit (71,1% de pesos, grupo 64), affine 5-bit (27,9%), affine 6-bit (1,0%), affine 8-bit (0,008%), BF16 (0,022%); media efectiva 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), custom_code, 4-bit cuantizado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B. Por la denominación "LFM3" se corresponde con la tercera generación de Liquid Foundation Models de Liquid AI, si bien esta ficha no puede confirmar detalles como el tipo de bloque (transformer, híbrido o SSM), el número de capas, la dimensión de los embeddings o la composición del dataset de entrenamiento, ya que no aparecen en la model card ni en los metadatos del repo.

Lo que sí está documentado es el proceso de cuantización. Se aplicó oQ (oMLX v0.7.4.dev1), que realiza una cuantización de precisión mixta por grupos de 64 pesos: la mayor parte de los pesos (71,1%) se almacenan en affine 4-bit, un 27,9% en 5-bit, un 1,0% en 6-bit y una fracción residual en 8-bit y BF16. Esta distribución busca preservar la precisión en las capas o tensores más sensibles (probablemente embeddings, cabezas de salida o capas de normalización) mientras se comprime agresivamente el resto. El checkpoint resultante ocupa 0,966 GiB en disco (1,038 GB), con un peso medio efectivo de 4,801 bits por peso.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 1,7B parámetros, por lo que se espera capacidad de generación de texto general, aunque no se documentan capacidades específicas en la información disponible.
- Razonamiento y matemáticas: no disponible (no se documenta en la model card).
- Generación de código: no disponible (no se documenta en la model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inferencia local en Apple Silicon: capacidad confirmada por el formato MLX, que permite ejecutar el modelo de forma nativa en chips M-series con memoria unificada.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el formato MLX y el tamaño de ~1 GB permiten ejecutar el modelo en un MacBook con 8 GB o 16 GB de memoria unificada, sin GPU dedicada ni CUDA. Es adecuado para prototipado rápido y experimentación offline.
- Asistentes de texto en aplicaciones de escritorio: al ser un modelo pequeño, puede integrarse en apps macOS nativas para tareas de redacción, resumen o reescritura sin enviar datos a la nube, lo que resulta útil por privacidad.
- Experimentación con cuantización mixta: el repo sirve como referencia práctica para estudiar cómo oQ distribuye bits entre tensores y comparar la calidad frente a cuantizaciones uniformes de 4-bit.
- Evaluación de modelos LFM3 en hardware Apple: permite a investigadores probar la familia LFM3 de Liquid AI en entornos macOS sin necesidad de infraestructura GPU, útil para comparativas de latencia y consumo.
- Chatbot ligero embebido: por su reducido tamaño, puede integrarse en herramientas de línea de comandos o plugins de editores para autocompletado o generación de texto asistida.
- Educación y demos: adecuado para talleres y demostraciones de despliegue de LLMs en local, ya que el peso del checkpoint es bajo y la instalación con MLX es sencilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el tamaño del checkpoint, sin métricas de calidad (perplejidad, MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,0-1,5 GB de memoria para los pesos (0,966 GiB de almacenamiento) más overhead de activaciones y KV cache; en la práctica, unos 2-4 GB de memoria unificada para contextos moderados.
- GPU recomendadas: no aplica CUDA; el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- ¿Cabe en consumer GPU? No en GPUs NVIDIA/AMD convencionales de forma nativa con MLX; sí en cualquier Mac con chip M-series y al menos 8 GB de memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), `mlx-lm` para generación, y potencialmente herramientas de la comunidad que carguen checkpoints MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; dependerán del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| jk797/LFM3-1.7B-MLX-oQ4e | 1,729B | no disponible | oQ mixta, 4,801 bits/peso | no disponible | MLX safetensors |
| LFM3-1.7B (base, Liquid AI) | 1,7B (aprox.) | no disponible | sin cuantizar | no disponible en esta ficha | no disponible |
| Alternativas de ~1-2B en MLX | no disponible | no disponible | 4-bit uniforme típico | variable | MLX |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparativa cuantitativa rigurosa con alternativas de la misma categoría. La comparación se limita a parámetros, formato y esquema de cuantización.

## Limitaciones y advertencias

- Repo de autor individual (jk797) sin métricas de calidad publicadas: no hay evidencia de que la cuantización preserve el rendimiento del modelo base.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base LFM3-1.7B de Liquid AI antes de cualquier uso en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Contexto no documentado: no se conoce la ventana de contexto máxima soportada.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 1,7B parámetros; la cuantización agresiva a 4-bit puede incrementar la degradación en tareas de razonamiento.
- Sesgos: no documentados; se heredan los del dataset de entrenamiento del modelo base, que no se detalla.
- Dependencia de MLX: no es portable a CUDA ni a GPUs convencionales sin reconversión; limita su uso a hardware Apple.
- `custom_code`: requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código del autor del repo; conviene auditar antes de usarlo en entornos sensibles.
- Sin pipeline declarado ni descargas/likes: repo sin validación comunitaria; tratarlo como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/jk797/LFM3-1.7B-MLX-oQ4e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base LFM3 de Liquid AI: no disponible en la información proporcionada (se recomienda buscar la organización Liquid AI en HuggingFace)
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
