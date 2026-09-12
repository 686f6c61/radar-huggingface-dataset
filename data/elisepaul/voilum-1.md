# elisepaul/voilum-1

## Resumen

Voilum-1 es un modelo de lenguaje pequeño (SLM) de arquitectura Mixture-of-Experts (MoE) dispersa, publicado por elisepaul (Elise Paul, Independent AI Research & Systems) en Hugging Face bajo licencia Apache 2.0. Cuenta con 463.553.024 parámetros totales y aproximadamente 100,8 millones de parámetros activos por token, y está especializado en la síntesis de código Python determinista: computación científica y numérica, algoritmos e implementación de sistemas de aprendizaje profundo (PyTorch, NumPy, SciPy, Pandas).

El modelo se entrenó sobre 12.000 millones de tokens de código algorítmico y matemático, se alineó mediante SFT con formato ChatML (política de cero tokens de "thinking") y se reforzó con un currículum de seis niveles de GRPO (Group Relative Policy Optimization) con recompensa basada en ejecución real: compilación y tests unitarios en un sandbox aislado. Su ventana de contexto nativa es de 2.048 tokens y su huella declarada es de 884 MB en BF16, lo que lo sitúa en la gama de modelos que caben sin problema en GPUs de consumo e incluso en inferencia sobre CPU.

Su relevancia actual reside en el eje "ejecución como recompensa" aplicado a un modelo de menos de 500 M de parámetros: en lugar de incluir las ecuaciones resueltas dentro del prompt, el entrenamiento GRPO premia código que pasa tests reales partiendo de especificaciones de ingeniería. El autor reporta un 99,3 % de pass rate greedy en su evaluación propia de ventana deslizante; no hay resultados publicados en benchmarks estándar (MMLU, HumanEval, GSM8K). El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y la model card lo marca como `inference: false`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only disperso (MoE) con GQA, RoPE, RMSNorm y SwiGLU |
| Parámetros totales | 463.553.024 (463,6 M) |
| Parámetros activos | ~100.800.000 (100,8 M) por token |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en BF16; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) y py (Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Capas del transformer | 16 bloques decoder pre-norm |
| Dimensión oculta (d_model) | 512 |
| Routing de feed-forward | 8 expertos, top-2 con balanceo de carga por softmax (la tabla de la model card menciona "Top-1 / Top-2"; el texto descriptivo detalla top-2) |
| Dimensión intermedia por experto | 2.048 (proyección SwiGLU) |
| Atención | Grouped-Query Attention: 8 cabezas de query, 2 cabezas key-value (compresión 4:1) |
| Dimensión por cabeza (d_k) | 64 |
| Codificación posicional | RoPE con frecuencia base θ = 10.000,0 |
| Normalización | RMSNorm con ε = 1e-6 |
| Función de activación | SwiGLU |
| Vocabulario | 49.152 tokens, BPE de StarCoder2 |
| Pipeline declarado | text-generation |
| Inferencia gestionada | No (`inference: false`) |
| Tamaño del repositorio | 2,3 GB |
| Fecha de creación | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de 16 capas con `d_model = 512` que sustituye el FFN denso por una capa MoE de 8 expertos con enrutado top-2 y dimensión intermedia de 2.048 por experto, activados mediante SwiGLU. Cada capa aplica el esquema pre-norm estándar: RMSNorm antes de la atención, GQA con 8 cabezas de query y 2 de key-value (compresión 4:1 del KV cache) con RoPE (θ = 10.000,0), segunda RMSNorm antes del bloque MoE, y conexiones residuales en ambos subbloques. El vocabulario de 49.152 entradas emplea el tokenizador BPE de StarCoder2, coherente con el sesgo hacia código. La combinación de 463,6 M de parámetros totales con solo ~100,8 M activos explica su bajo coste de cómputo por token.

El entrenamiento se estructuró en tres etapas. La primera fue un preentrenamiento base sobre 12.000 millones de tokens no repetidos de Python científico, internals de PyTorch, algoritmos y matemáticas numéricas, optimizado con AdamW (learning rate máximo de 5e-4, warmup lineal y decaimiento coseno) en precisión mixta bfloat16. La segunda consistió en alineación SFT con formato ChatML (`<|im_start|>` / `<|im_end|>`) bajo una política estricta de cero tokens de "thinking", orientada a producir código directo y ejecutable sin relleno conversacional. La tercera aplicó GRPO con ventajas relativas de grupo (G = 4 rollouts por prompt) y penalización KL contra la política de referencia de la etapa 2, evaluando las respuestas mediante un compilador aislado y un sandbox de tests unitarios distribuido en seis niveles pedagógicos. La model card describe el nivel 6 ("Zero-Code Authentic Problem Solving Standard") como el escenario en el que el prompt aporta motivación teórica, invariantes y contrato de interfaz, pero no las ecuaciones resueltas.

## Capacidades

- Generación de código Python ejecutable, con foco en determinismo y rigor matemático.
- Implementación de rutinas de computación numérica y científica (NumPy, SciPy, Pandas).
- Construcción de módulos y capas de PyTorch a partir de especificaciones conceptuales.
- Síntesis de algoritmos clásicos y estructuras de datos.
- Resolución de tareas de machine learning aplicado descritas en lenguaje natural, sin que el prompt incluya el código (política "zero-code").
- Formato de instrucciones ChatML, lo que permite integrarlo en plantillas de chat estándar.
- Capacidad multilingüe limitada: inglés (`en`) y Python (`py`) declarados como idiomas soportados.
- No dispone de modo de razonamiento explícito ("thinking mode") por diseño; la política de entrenamiento es de cero tokens de monólogo interno.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, visión ni audio.
- La model card está truncada en el material proporcionado, por lo que pueden existir capacidades documentadas adicionales no recogidas aquí.

## Casos de uso

- **Generación de código numérico en pipelines científicos**: el modelo recibe una especificación de invariantes y un contrato de interfaz, y devuelve funciones NumPy/SciPy ejecutables. Es adecuado porque su corpus de preentrenamiento está centrado en Python científico y su RL premia código que pasa tests reales.
- **Implementación de capas y bloques de PyTorch**: dada la descripción teórica de una capa (por ejemplo, una normalización o un bloque de atención con compresión KV), el modelo genera la implementación sin que se le entregue el código de referencia. Encaja por su entrenamiento específico en internals de deep learning.
- **Generación de tests unitarios e invariantes numéricas**: se le puede pedir que, a partir de una función dada, produzca una batería de tests que verifiquen propiedades (simetría, conservación, límites asintóticos). Es coherente con la metodología de ejecución-grounded usada en su GRPO.
- **Asistente de código embebido o en el edge**: con 884 MB en BF16 y ~100,8 M de parámetros activos, puede desplegarse en dispositivos con poca VRAM o incluso en CPU, sirviendo autocompletado y generación de funciones en entornos sin GPU dedicada.
- **Autocompletado offline en IDE**: la ventana de 2.048 tokens es suficiente para completar funciones y ficheros individuales, y el modelo no requiere conexión externa ni API de terceros, algo relevante en entornos con restricciones de confidencialidad.
- **Síntesis de datos de entrenamiento para RL con verificación por ejecución**: se puede usar para generar un gran volumen de soluciones candidatas que después se filtran automáticamente con tests unitarios, aprovechando su bajo coste de inferencia.
- **Traducción de formulaciones matemáticas a código**: dado un enunciado con notación y restricciones, el modelo produce la implementación correspondiente, útil en docencia y en documentación técnica.
- **Prototipado rápido de utilidades de procesamiento de datos**: tareas de transformación, agregación y validación sobre DataFrames, donde el contrato de entrada/salida está bien definido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MBPP u otros) en la información disponible. El único dato de rendimiento aportado por el autor es el siguiente:

| Evaluación | Resultado | Condiciones |
|---|---|---|
| Pass rate greedy en evaluación de ventana deslizante | 99,3 % | Benchmarks propios de machine learning aplicado y sistemas numéricos; metodología definida por el autor, sin protocolo público verificable |
| Huella de memoria declarada | 884 MB | Pesos en BF16 SafeTensors, según la model card |
| Tokens de entrenamiento | 12,0 mil millones | Corpus de código algorítmico y matemático, no repetido |

Advertencia: el 99,3 % es una métrica autodeclarada, sin comparación contra suites estándar ni replicación independiente. No debe equipararse a resultados de HumanEval o similares.

## Requisitos de hardware

- **Pesos en BF16**: 884 MB según la model card. Nota técnica: 463,55 M de parámetros a 2 bytes por parámetro implican ~927 MB, por lo que existe una discrepancia de ~43 MB entre ambas cifras que la información disponible no explica (posible tie de embeddings, compartición de tensores o redondeo en la model card).
- **KV cache**: calculado a partir de las especificaciones (2 tensores × 16 capas × 2 cabezas KV × 64 dimensiones × 2 bytes), ~8 KB por token, es decir ~16,8 MB para los 2.048 tokens de contexto completo. Es despreciable frente a los pesos.
- **VRAM estimada para inferencia**: menos de 1,5 GB en BF16/FP16 incluyendo overhead del runtime; en torno a 0,5 GB en cuantizaciones de 8 bits y 0,3-0,4 GB en cuantizaciones de 4-5 bits (estas cifras son estimaciones por tamaño y no proceden de pesos publicados, ya que no se distribuyen GGUF oficiales).
- **Cabe en GPU de consumo**: sí, en cualquier GPU con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.). También es viable en CPU y en hardware integrado tipo Apple Silicon.
- **GPU de datacenter**: A100, H100, L40S o similares quedan sobredimensionadas para un único flujo; solo tienen sentido para servir muchas réplicas concurrentes o para reentrenamiento.
- **Opciones de despliegue**: Transformers con PyTorch y safetensors es la vía documentada de forma implícita. El tag `voilum_moe` sugiere una arquitectura con implementación propia, por lo que puede requerir el código de modelado del repositorio o `trust_remote_code`. vLLM y TGI soportan arquitecturas MoE, pero no hay confirmación en la información disponible de que reconozcan este modelo sin adaptación. Para llama.cpp, Ollama o LM Studio sería necesaria una conversión a GGUF que no se distribuye.
- **Latencia y throughput**: no disponible. Con ~100,8 M de parámetros activos por token, el coste por token es comparable al de un modelo denso de ese tamaño, pero no se aportan mediciones.

## Comparativa con modelos similares

No hay comparativas publicadas en la información proporcionada. La siguiente tabla usa datos de conocimiento general sobre modelos de la misma categoría (SLM orientados a código), que deberían verificarse antes de usarse en una decisión de producción:

| Modelo | Parámetros | Activos | Contexto | Tipo | Licencia |
|---|---|---|---|---|---|
| Voilum-1 | 463,6 M | ~100,8 M | 2.048 | MoE dispersa | Apache 2.0 |
| Qwen2.5-Coder-0.5B | ~0,49 B | denso | 32.768 | Denso | Apache 2.0 |
| SmolLM2-360M | ~0,36 B | denso | 8.192 | Denso | Apache 2.0 |
| TinyLlama-1.1B | ~1,1 B | denso | 2.048 | Denso | Apache 2.0 |

Diferencias cualitativas relevantes: Voilum-1 es el único de la lista con arquitectura MoE y con un pipeline de RL verificado por ejecución; a cambio, su contexto nativo de 2.048 tokens es el más corto de la comparativa y su ecosistema (GGUF, soporte en runtimes, comunidad) es prácticamente inexistente en el momento de la consulta. Los datos de rendimiento de los modelos comparados no se incluyen porque no forman parte de la información proporcionada.

## Limitaciones y advertencias

- **Contexto muy corto**: 2.048 tokens nativos. No es adecuado para razonamiento sobre repositorios completos, conversaciones multi-turno largas ni documentos extensos sin técnicas de troceado.
- **Idiomas limitados**: solo inglés y Python. No hay soporte declarado de castellano ni de otros lenguajes de programación.
- **Sin modo de razonamiento explícito**: la política de "cero tokens de thinking" implica que el modelo no genera cadenas de razonamiento internas; esto puede penalizar tareas que requieren planificación multi-paso o depuración compleja.
- **Riesgo de alucinación**: en código, la alucinación se manifiesta como APIs inexistentes, firmas incorrectas o dependencias inventadas. Dado que no se publican evaluaciones estándar, no hay una medida objetiva de la tasa de error.
- **Métricas autodeclaradas**: el 99,3 % de pass rate proviene de una evaluación propia del autor, sobre benchmarks no especificados públicamente, sin replicación independiente. No debe citarse como resultado comparable a HumanEval o MBPP.
- **Sin validación comunitaria**: 0 descargas y 0 likes; el repositorio no cuenta con issues, discusiones ni terceros que hayan reproducido los resultados.
- **Model card incompleta en la información recibida**: el material proporcionado está truncado, por lo que las secciones de evaluación detallada, instrucciones de uso y limitaciones declaradas por el autor no están disponibles íntegramente. Conviene consultar el repositorio original.
- **Inferencia gestionada desactivada**: el campo `inference: false` implica que no se puede probar el modelo desde el widget de Hugging Face; hay que desplegarlo por cuenta propia.
- **Posible dependencia de código personalizado**: el tag `voilum_moe` y la ausencia de menciones a arquitecturas estándar sugieren que la carga del modelo puede requerir el código de modelado incluido en el repositorio.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se han identificado restricciones adicionales en la información disponible.
- **Sesgos**: los corpus de código (BPE de StarCoder2) están sesgados hacia inglés y hacia patrones de programación dominantes en repositorios públicos; esto puede reducir la calidad en dominios muy especializados o en código con convenciones no occidentales.
- **Producción**: antes de usar el modelo en un pipeline real conviene instrumentar verificación automática (tests unitarios, ejecución en sandbox) en lugar de confiar en la salida directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elisepaul/voilum-1
- Perfil del autor: https://huggingface.co/elisepaul
- Repositorio del modelo indicado en la model card: https://huggingface.co/elisepaul/voilum-1
- Referencias arXiv incluidas en los tags del modelo (identificadores tal como aparecen en la ficha de Hugging Face; no se ha verificado su título en la información disponible): arXiv:1910.07467, arXiv:2305.13245, arXiv:2104.09864, arXiv:2002.05202, arXiv:1701.06538, arXiv:2307.08691, arXiv:2310.10537, arXiv:2402.03300, arXiv:2203.02155, arXiv:2402.19173
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre Voilum-1. Los resultados devueltos (Zhihu, Baidu Jingyan, Microsoft Community) tratan sobre productos de ofimática y no guardan relación con el modelo.
