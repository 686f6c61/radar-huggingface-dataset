# CompressedMichael/Qwen2.5-3B-Instruct-GBLM-Pruner-50pct

## Resumen

Qwen2.5-3B-Instruct-GBLM-Pruner-50pct es un checkpoint derivado de Qwen/Qwen2.5-3B-Instruct al que se le ha aplicado una poda no estructurada del 50 % en los pesos lineales del transformer. Lo publica el usuario CompressedMichael en Hugging Face, y su objetivo es servir como material de estudio y validación de técnicas de compresión de modelos, no como sustituto listo para producción del modelo original. Conserva la arquitectura Qwen2 del padre (decoder-only, 3.085.938.688 parámetros almacenados, contexto nativo de 32.768 tokens) y mantiene sin cambios los embeddings y las capas de normalización.

La innovación relevante aquí no es arquitectónica, sino metodológica: cuantifica hasta qué punto un modelo de 3 B de parámetros tolera una dispersión del 50 % en las matrices lineales. El autor calibra la poda con 128 ventanas de entrenamiento de C4 de 2.048 tokens y semilla 0, y publica el checkpoint en BF16. Llama la atención un dato clave: la dispersión es no estructurada, por lo que el checkpoint sigue almacenando tensores densos de las mismas dimensiones; no hay reducción efectiva del tamaño en disco ni de la VRAM ocupada salvo que se empleen kernels dispersos especializados.

El único resultado de evaluación publicado es GSM8K con prompt de 4 ejemplos en formato chat y decodificación greedy: 47,84 % (631 de 1.319). La model card no incluye la cifra equivalente del modelo padre, de modo que no es posible cuantificar con los datos disponibles cuánto rendimiento se ha perdido. El repositorio no declara licencia, idiomas ni pipeline, y acumula 0 descargas y 0 "me gusta", por lo que carece de validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2, con los pesos lineales podados a un 50 % de dispersión no estructurada |
| Parámetros totales | 3.085.938.688 (~3,09 B), dato real de los safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens heredados del modelo base; ampliable a 131.072 con YaRN según la documentación de Qwen2.5. No confirmado en la model card de este repositorio |
| Tipos de cuantización | Solo se documenta el checkpoint BF16. No se publican versiones GGUF, AWQ, GPTQ ni FP8. La cuantización posterior es posible con herramientas estándar, pero no está verificada por el autor |
| Idiomas soportados | No disponible en este repositorio. El modelo base Qwen2.5-3B-Instruct declara soporte para 29 idiomas |
| Licencia | No disponible en la model card. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (BF16), ~6,2 GB de repositorio |
| Método de compresión | GBLM-Pruner, 50 % de dispersión no estructurada en pesos lineales |
| Calibración | 128 ventanas de entrenamiento de C4, 2.048 tokens, semilla 0 |
| Pesos no modificados | Embeddings y capas de normalización, idénticos al modelo Instruct original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo padre Qwen2.5-3B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para codificación posicional y atención con consultas agrupadas (GQA). La configuración del padre es de 36 capas, dimensión oculta 2.048, 16 cabezas de atención, 2 cabezas clave-valor, dimensión intermedia 11.008 y vocabulario de 151.936 tokens. Mantiene el tokenizador y la matriz de embeddings originales, de modo que la interfaz de entrada y salida de texto es idéntica.

Sobre esa base, el autor aplica GBLM-Pruner con un 50 % de dispersión no estructurada en los pesos lineales, usando 128 ventanas de C4 de 2.048 tokens como conjunto de calibración con semilla 0, y exporta el resultado en BF16. La model card no documenta ninguna fase de recuperación posterior a la poda (fine-tuning, LoRA, DPO ni RLHF sobre el modelo podado), ni indica el número de tokens de entrenamiento adicionales. Tampoco se describe el criterio de selección de pesos del método GBLM-Pruner más allá de lo anterior.

Es importante subrayar la diferencia entre dispersión estructurada y no estructurada: en este caso los tensores conservan la misma forma que en el padre, con la mitad de sus valores a cero. Por tanto, el modelo ocupa en memoria lo mismo que un Qwen2.5-3B denso y solo se beneficiaría de aceleración si se ejecutase con bibliotecas de cómputo disperso, algo que los runtimes habituales (vLLM, llama.cpp, Transformers) no hacen de forma automática.

## Capacidades

Las capacidades heredadas del modelo base Qwen2.5-3B-Instruct son las siguientes, con la advertencia de que la poda puede degradarlas de forma desigual y solo se ha medido GSM8K:

- Generación de texto conversacional multi-turno en formato chat, con plantilla de chat de Qwen2.5.
- Razonamiento aritmético y matemático de varios pasos, muy degradado respecto al padre: 47,84 % en GSM8K en la única medición publicada.
- Generación y comprensión de código, con soporte de lenguajes habituales del modelo base.
- Comprensión lectora, resumen y reescritura de documentos, apoyándose en la ventana de contexto del padre.
- Salidas estructuradas en JSON y otros formatos rígidos, capacidad del modelo Instruct original.
- Tool calling y function calling, soportados por el modelo base mediante plantillas de chat específicas.
- Flujos agénticos de varios pasos, incluido el uso de herramientas en bucle, heredados del entrenamiento Instruct del padre.
- Capacidad multilingüe: el padre declara 29 idiomas, entre ellos español, inglés y chino; no hay evaluación multilingüe de la versión podada.
- Contexto largo de hasta 32.768 tokens, con extensión teórica a 131.072 mediante YaRN.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode) explícito.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como punto de comparación reproducible para medir el impacto de una poda no estructurada al 50 % frente al modelo padre intacto, usando el mismo prompt de 4 ejemplos y decodificación greedy.
- Desarrollo de kernels y runtimes de cómputo disperso: al ser un modelo de 3 B con patrones de ceros en las matrices lineales, es un banco de pruebas manejable para validar aceleración con bibliotecas de sparse GEMM.
- Prototipado local en máquinas modestas: con unos 7 GB en BF16 y alrededor de 2-4 GB tras cuantización a 4 bits, permite experimentar con pipelines de generación en una única GPU de consumo sin depender de servicios externos.
- Docencia y formación técnica: ilustra de forma práctica qué es la dispersión no estructurada, por qué no reduce el tamaño del checkpoint y cómo se mide su efecto con GSM8K.
- Clasificación y extracción de información en lote: para tareas de baja exigencia cognitiva (etiquetado, extracción de entidades sencilla) sobre textos de hasta 32.000 tokens, el coste de la degradación puede ser asumible si se valida previamente con datos propios.
- Generación de borradores y texto asistido sin requisitos de precisión: resúmenes internos, reformulación de correos o borradores de documentación donde un revisor humano corrige la salida.
- Evaluación de pipelines de evaluación: útil para comprobar que un arnés de benchmarks (lm-evaluation-harness, vLLM) funciona correctamente con modelos degradados y detectar métricas sensibles a la pérdida de calidad.
- No se recomienda como sustituto directo del modelo padre en producción: sin fase de recuperación documentada, su uso en atención al cliente, código en producción o agentes autónomos requiere una validación exhaustiva previa en el dominio concreto.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| GSM8K | 4-shot chat, greedy, límite de 4.096 tokens, contexto 8.192 | 47,84 % (631/1.319) |
| MMLU | No evaluado en la información disponible | No disponible |
| HumanEval | No evaluado en la información disponible | No disponible |
| MATH | No evaluado en la información disponible | No disponible |
| Resultado de GSM8K del modelo padre | No incluido en la model card | No disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible. La model card únicamente aporta la cifra de GSM8K y no permite calcular la degradación relativa respecto a Qwen2.5-3B-Instruct sin el dato del padre.

## Requisitos de hardware

- VRAM en BF16: los 3.085.938.688 parámetros a 2 bytes por peso ocupan aproximadamente 6,2 GB. Con caché KV y activaciones, el consumo realista parte de unos 7-8 GB para contextos cortos.
- Caché KV: aproximadamente 1 GB a 32.768 tokens en BF16, estimando 36 capas, 16 cabezas de consulta, 2 cabezas KV y dimensión de cabeza 128 según la configuración GQA del modelo base.
- Cuantización a 8 bits: en torno a 3,5 GB de pesos más caché. A 4 bits: en torno a 2 GB. Estas conversiones no están publicadas en el repositorio y habría que generarlas.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 funcionan sin problema en BF16 para contextos moderados. En GPUs de 8 GB conviene cuantizar a 8 o 4 bits.
- GPU de centro de datos: A100, H100, L40S y L4 lo ejecutan sobradamente; para un modelo de este tamaño el despliegue en A100 40 GB permite lotes grandes y máxima ventana de contexto.
- Aceleración por dispersión: al ser dispersión no estructurada sobre tensores densos, no hay ahorro de VRAM ni de tiempo de cómputo en runtimes estándar; solo se aprovecharía con kernels sparse específicos.
- Opciones de despliegue: el autor evaluó con vLLM. También son viables TGI y Transformers. Para llama.cpp u Ollama habría que convertir previamente el checkpoint a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | GSM8K |
|---|---|---|---|---|---|
| GBLM-Pruner-50pct (este modelo) | 3,09 B (50 % dispersión no estructurada) | 32.768 tokens | No declarada en el repositorio | Hugging Face, 0 descargas | 47,84 % |
| Qwen2.5-3B-Instruct (padre) | 3,09 B densos | 32.768 tokens, 131.072 con YaRN | Apache-2.0 | Hugging Face, ampliamente desplegado | No disponible en la información proporcionada |
| Llama-3.2-3B-Instruct | 3,21 B densos | 128.000 tokens | Llama 3.2 Community License | Meta y Hugging Face | No disponible en la información proporcionada |
| Qwen2.5-1.5B-Instruct | 1,54 B densos | 32.768 tokens, 131.072 con YaRN | Apache-2.0 | Hugging Face | No disponible en la información proporcionada |

La comparación relevante es contra el padre: misma arquitectura, mismo número de parámetros almacenados y mismo coste de inferencia, pero con la mitad de los pesos lineales a cero. Frente a Llama-3.2-3B-Instruct, la diferencia principal es la ventana de contexto (32.768 frente a 128.000 tokens) y la licencia, más permisiva en el caso de Qwen2.5. El modelo de 1,5 B de la misma familia es la alternativa natural si el objetivo es reducir VRAM de verdad, ya que un modelo denso más pequeño ocupa menos memoria sin necesidad de kernels dispersos.

## Limitaciones y advertencias

- Degradación de rendimiento no cuantificada: solo hay una métrica publicada (GSM8K, 47,84 %) y falta el valor del padre, por lo que se desconoce el alcance real de la pérdida en razonamiento, código o multilingüismo.
- Dispersión no estructurada sin ahorro efectivo: el checkpoint pesa lo mismo que el modelo denso y no se acelera en GPUs convencionales. El beneficio es teórico salvo con software específico.
- Ausencia de fase de recuperación: la model card no documenta fine-tuning posterior a la poda, lo que suele traducirse en degradaciones adicionales en tareas no medidas.
- Licencia no declarada en el repositorio: aunque el padre es Apache-2.0, la ficha del modelo derivado no especifica licencia. Antes de un uso comercial conviene verificarlo con el autor.
- Riesgo de alucinación: inherente a los modelos de 3 B y probablemente agravado por la poda, especialmente en preguntas factuales y contextos largos.
- Idiomas no declarados en este repositorio: el soporte multilingüe es una herencia del padre y no está verificado tras la poda.
- Sin validación comunitaria: 0 descargas y 0 "me gusta" en el momento de la consulta, sin revisión independiente ni informes de terceros.
- Autor individual: el modelo lo publica un usuario particular, no el equipo de Qwen, por lo que no hay garantías de mantenimiento ni soporte.
- Repositorio con artefactos incompletos: la model card remite a ficheros `provenance.json`, `validation.json` y a rutas locales de resultados (`/home/chien/Pruning/...`) que no forman parte del repositorio público.
- Fechas del repositorio: los metadatos de Hugging Face indican creación y actualización en septiembre de 2026, lo que dificulta situar el trabajo en una línea temporal verificable.
- No apto para producción crítica sin evaluación propia: cualquier despliegue en atención al cliente, código o agentes debe pasar antes por una batería de pruebas en el dominio concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompressedMichael/Qwen2.5-3B-Instruct-GBLM-Pruner-50pct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Revisión concreta del padre citada en la model card: `aa8e72537993ba99e69dfaafa59ed015b17504d1`
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de GBLM-Pruner: no localizado en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a condiciones de uso de un portal de telecomunicaciones y no guardan relación con el modelo
