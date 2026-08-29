# mohjkhan/anlp-a1-transformers

## Resumen

El modelo `mohjkhan/anlp-a1-transformers` es un transformador encoder-decoder construido desde cero en PyTorch, sin utilizar los módulos predefinidos `nn.Transformer` ni `nn.MultiheadAttention`. Fue desarrollado como parte de una tarea académica (ANLP Assignment 1) y su objetivo es descifrar un cifrado XOR repetitivo, es decir, recuperar el texto plano a partir de un texto cifrado generado con una clave que se repite. El repositorio incluye cinco configuraciones arquitectónicas distintas (C1 a C5) que varían en el mecanismo de posicionamiento, el tipo de atención, la normalización y el esquema de tokenización, lo que permite estudiar el impacto de cada componente en el rendimiento y la eficiencia.

Se trata de un modelo de investigación, no de un sistema de propósito general. Su relevancia radica en servir como banco de pruebas para ablaciones controladas sobre arquitecturas transformer, aportando datos sobre cómo afectan las decisiones de diseño (RoPE frente a sinusoidal, atención multi-cabeza frente a grouped-query, LayerNorm frente a RMSNorm, tokenización subword frente a token-free) en una tarea concreta de descifrado. El modelo está disponible bajo licencia MIT, lo que facilita su uso en entornos educativos y de investigación.

La información pública es limitada: no se especifican el número total de parámetros, la longitud de contexto, los idiomas soportados ni los benchmarks. Los archivos de pesos se guardan en formato `.pt` (PyTorch) y cada configuración incluye su propio `state_dict` y diccionario de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (construido desde cero en PyTorch, sin `nn.Transformer` ni `nn.MultiheadAttention`) |
| Parametros totales | no disponible (se estima en el rango de 3 a 15 millones segun configuraciones similares de otros repositorios, pero no se confirma para este modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se guardan en precisión completa de PyTorch, formato `.pt`) |
| Idiomas soportados | no disponible (la tarea trabaja con texto, pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer encoder-decoder clásica, implementada manualmente con operaciones fundamentales de PyTorch. Se estudian cinco configuraciones que modifican componentes clave:

- **Posicionamiento**: sinusoidal (C1, C3, C4, C5) frente a RoPE (C2).
- **Atención**: multi-cabeza (C1, C2, C4, C5) frente a grouped-query (C3).
- **Normalización**: LayerNorm (C1, C2, C3, C5) frente a RMSNorm (C4).
- **Tokenización**: subword (C1–C4) frente a BLT token-free (C5).

Cada configuración se entrena para la tarea de descifrado de un cifrado XOR repetitivo. No se proporcionan detalles sobre el tamaño del dataset, el número de tokens de entrenamiento ni el procedimiento de optimización (por ejemplo, si se usó RLHF o DPO, que en este caso no aplica al ser una tarea supervisada). Los archivos `.pt` contienen el `state_dict` del modelo y un diccionario `config` con los hiperparámetros. El código de construcción está disponible en un repositorio externo (enlace pendiente en la model card original).

## Capacidades

- **Descifrado de cifrado XOR repetitivo**: el modelo recibe una secuencia cifrada y genera el texto plano correspondiente. Es su única tarea documentada.
- **Ablación arquitectónica**: permite comparar el efecto de distintas opciones de diseño (posición, atención, normalización, tokenización) sobre el rendimiento en la tarea.
- **Procesamiento de secuencias**: al ser un encoder-decoder, puede manejar pares de secuencias de entrada y salida, aunque no se especifica la longitud máxima.
- **Sin capacidades generales**: no es un modelo de lenguaje de propósito general, no genera texto libre, no responde preguntas ni ejecuta razonamiento complejo fuera de su dominio de entrenamiento.
- **Soporte de tool calling / function calling**: no disponible.
- **Soporte de agentes y multi-step reasoning**: no disponible.
- **Capacidades multilingues**: no disponible (no se indican idiomas).

## Casos de uso

- **Investigación académica en arquitecturas transformer**: el modelo sirve como base para estudiar cómo influyen las variaciones de posicionamiento, atención y normalización en el rendimiento de una tarea de secuencia a secuencia. Un investigador puede cargar cada configuración, evaluarla en el conjunto de prueba y comparar métricas como exactitud, velocidad de entrenamiento o uso de memoria.
- **Enseñanza de deep learning**: dado que el transformador está implementado desde cero, es un recurso didáctico excelente para que estudiantes comprendan los mecanismos internos de atención, posicionamiento y normalización. Se puede usar en cursos de procesamiento de lenguaje natural o aprendizaje automático avanzado.
- **Pruebas de concepto de cifrado y criptoanálisis**: aunque la tarea es un cifrado XOR simple, el modelo puede utilizarse para experimentar con técnicas de criptoanálisis basadas en aprendizaje profundo, evaluando su capacidad para romper cifrados de baja complejidad en entornos controlados.
- **Evaluación de eficiencia de configuraciones**: al comparar las cinco variantes, se puede analizar el compromiso entre precisión y coste computacional, por ejemplo, si la atención grouped-query (C3) reduce la memoria sin sacrificar rendimiento, o si RoPE (C2) mejora la generalización a secuencias más largas.
- **Desarrollo de modelos token-free**: la configuración C5 con tokenización BLT (token-free) permite explorar alternativas a la tokenización subword, lo que puede ser relevante para dominios con vocabularios no convencionales o para reducir el tamaño del modelo al eliminar la matriz de embeddings de gran tamaño.
- **Reproducción de experimentos**: dado que el código y los pesos están disponibles, otros equipos pueden reproducir los resultados y verificar las conclusiones de la ablación, contribuyendo a la transparencia en la investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que cada configuración tiene un archivo `*_metrics.json` con métricas, pero no se incluyen los valores en la documentación pública. Tampoco se proporcionan comparaciones con otros modelos ni datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que el modelo es pequeño (probablemente entre 3 y 15 millones de parámetros según configuraciones similares de otros repositorios de la misma tarea), la inferencia puede ejecutarse en CPU sin problemas y en GPU con menos de 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente. Para entrenamiento, una GPU con al menos 4 GB de VRAM sería adecuada.
- **Compatibilidad con GPU de consumo**: sí, cabe perfectamente en GPUs de consumo como RTX 3060, RTX 4060, etc.
- **Opciones de despliegue**: al ser un modelo PyTorch con pesos en `.pt`, se puede cargar directamente con `torch.load()`. No se han proporcionado integraciones con vLLM, llama.cpp, Ollama o TGI, y no se espera que sean necesarias dado el tamaño reducido.
- **Latencia y throughput**: no disponible. Para un modelo de este tamaño, la inferencia en CPU sería del orden de milisegundos por secuencia, y en GPU, de microsegundos, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mohjkhan/anlp-a1-transformers (este) | no disponible (estimado 3–15M) | no disponible | Descifrado XOR | MIT | HuggingFace |
| yharith/anlp-a1-transformer-ablation | C1: 12.49M, C5: 3.47M (segun su model card) | no disponible | Descifrado XOR | MIT | HuggingFace |
| Arihant25/anlp-a1-transformer-ablations | no disponible | no disponible | Descifrado XOR | MIT | HuggingFace |
| FrenchKnuckles/ANLP_A1 (repositorio GitHub) | no disponible | no disponible | Descifrado de cifrado por sustitucion | MIT | GitHub |

Los tres proyectos son variantes de la misma tarea académica (ANLP Assignment 1) y comparten el objetivo de estudiar ablaciones en transformadores para descifrado de cifrados. No hay datos de rendimiento comparativo publicados, por lo que no es posible establecer una jerarquía de calidad. La principal diferencia entre ellos puede estar en los hiperparámetros exactos y en el diseño experimental, pero esa información no está disponible públicamente.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: está diseñado exclusivamente para una tarea académica de descifrado de un cifrado XOR específico. No puede utilizarse para generación de texto general, traducción, resumen ni ninguna otra tarea de NLP estándar.
- **Sesgos y alucinaciones**: al ser un modelo entrenado para una tarea de transformación determinista, el riesgo de alucinación es bajo en el sentido de generar contenido falso, pero podría producir salidas incorrectas si la entrada no se ajusta al patrón del cifrado para el que fue entrenado.
- **Limitaciones de contexto y idioma**: no se especifica la longitud máxima de secuencia ni los idiomas soportados. La tarea se describe como "repeating-XOR cipher", lo que sugiere que trabaja con texto, pero no hay garantías sobre acentos, caracteres especiales o idiomas distintos del inglés.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright. No hay restricciones adicionales conocidas.
- **Caveats para producción**: no se recomienda su uso en entornos de producción sin una validación exhaustiva. No hay garantías sobre el rendimiento en datos reales, y la falta de benchmarks y documentación de entrenamiento (tamaño del dataset, hiperparámetros, tiempo de entrenamiento) dificulta la reproducibilidad y la confianza en el modelo.
- **Formato de pesos**: los archivos `.pt` requieren el código de construcción exacto (`build_transformer` / `build_blt`) para cargarse correctamente. Si el código no está disponible o no coincide con las versiones de las bibliotecas, el modelo podría no ser cargable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/anlp-a1-transformers
- Repositorio de ablación similar (yharith): https://huggingface.co/yharith/anlp-a1-transformer-ablation
- Repositorio de ablación similar (Arihant25): https://huggingface.co/Arihant25/anlp-a1-transformer-ablations
- Repositorio de código en GitHub (FrenchKnuckles): https://github.com/FrenchKnuckles/ANLP_A1
- Enlaces de Weights & Biases y repositorio de código: no disponibles (la model card indica `<ADD-WANDB-LINK>` y `<ADD-CODE-REPO-LINK>`, que no han sido completados).
