# nace-ai/LongCat-2.5-KQuant-IQ2_XXS

## Resumen

LongCat-2.5 KQuant IQ2_XXS es una cuantización de muy bajo bit del modelo LongCat-2.5 de Meituan, publicada por Nace.AI para su uso con llama.cpp. El modelo original es un transformer de tipo mixture-of-experts (MoE) con 1,66 billones de parámetros totales (1.661.568.161.792 según los pesos en safetensors), y esta versión reduce el peso en disco de 3,56 TB en BF16 a 581 GB repartidos en 40 ficheros GGUF, manteniendo atención y capas densas en 8 bits (Q8_0) y aplicando cuantización de 2 bits solo a los expertos enrutados.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de escala frontera en hardware relativamente asequible (dos GPU NVIDIA B300 de 275 GB), algo impensable con los pesos originales; por otro, es una de las primeras publicaciones que documenta con métricas de divergencia (KL y top-1 match) el coste real de bajar a 1-2 bits en un MoE de este tamaño. El repositorio incluye parches para llama.cpp, ya que la compilación estándar todavía no soporta la arquitectura LongCat-2.5.

El modelo está pensado para inferencia conversacional y razonamiento, con licencia MIT tanto en los pesos originales como en esta cuantización. No se dispone de información sobre idiomas soportados ni sobre el pipeline de la tarea en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con expertos enrutados; detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 1.661.568.161.792 (1,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 16384`) |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_M (expertos en 2 bits; atención, capas densas y embeddings n-gram en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (40 partes), más parches de llama.cpp en `runtime/patches` |

## Arquitectura y entrenamiento

El modelo base LongCat-2.5 es un transformer con arquitectura MoE: la práctica totalidad de los 1,78 B de parámetros (cifra que cita la model card; los safetensors indican 1,66 B) reside en los expertos enrutados. Esta cuantización conserva en 8 bits (Q8_0) la atención, las capas densas, el embedding n-gram y el resto de pesos no expertos, y solo baja a 2 bits los expertos: proyecciones gate y up en IQ2_XXS y proyección down en IQ2_XS. Los pesos de los expertos se cuantizaron con una importance matrix (imatrix) recogida sobre aproximadamente 131.000 tokens de texto de calibración.

No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta cuantización tampoco documenta innovaciones de decodificación (especulativa, atención lineal, etc.) del modelo base; se limita a describir el proceso de cuantización y las métricas de fidelidad respecto a los pesos BF16.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y los ejemplos de evaluación usan prompts de chat con plantilla Jinja (`--jinja`).
- Razonamiento matemático: la evaluación GSM8K (50 problemas, decodificación greedy, thinking desactivado) muestra 46/50 aciertos con IQ2_XXS.
- Generación de código: los prompts de calibración de la evaluación KL incluyen prosa, matemáticas y código, lo que sugiere cobertura de esos dominios, aunque no se publican benchmarks específicos de código.
- Modo "thinking": la evaluación se ejecuta con thinking desactivado, lo que implica que el modelo base dispone de un modo de razonamiento explícito activable; no se detallan sus características.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos frontera en hardware limitado: con dos B300 (275 GB cada una) se puede servir el modelo completo en IQ2_XXS; útil para laboratorios que quieran estudiar el comportamiento de un MoE de 1,66 B de parámetros sin acceso a un clúster de 3,56 TB de VRAM.
- Investigación sobre cuantización de bajo bit: el repositorio publica KL, top-1 match y GSM8K para tres niveles (IQ1_S, IQ2_XXS, IQ2_M), lo que permite analizar la degradación de un MoE al bajar de 8 a 1-2 bits en los expertos y validar metodologías de imatrix.
- Razonamiento matemático en producción con restricciones de memoria: los 46/50 de GSM8K con decodificación greedy indican que el modelo conserva capacidad aritmética básica pese a la cuantización agresiva; adecuado para asistentes de cálculo o tutoría con presupuesto de VRAM ajustado.
- Despliegue conversacional self-hosted: mediante `llama-server` con plantilla Jinja y contexto de 16.384 tokens, se puede montar un endpoint compatible con la API de OpenAI para chat interno, siempre que se apliquen los parches de arquitectura.
- Reproducción y auditoría de cuantizaciones: el fichero `evaluation.json` incluye el sha256 de cada una de las 40 partes, lo que facilita pipelines de verificación de integridad en entornos de investigación.
- Pruebas de concepto de modelos MoE masivos en llama.cpp: sirve para validar el soporte de la arquitectura LongCat-2.5 y del tokenizador en el ecosistema ggml antes de que el soporte llegue a la rama principal.

## Benchmarks y rendimiento

| Fichero | Tamano | KL respecto a BF16 | Top-1 match | GSM8K (50) |
|---|---|---|---|---|
| IQ1_S | 503 GB | 1,486 | 59 % | 48/50 |
| IQ2_XXS | 581 GB | 1,050 | 68 % | 46/50 |
| IQ2_M | 689 GB | 0,711 | 73 % | 47/50 |
| Q8_0 (referencia, no subido) | 1.765 GB | 0,027 | 96 % | 47/50 |

KL y top-1 match se calculan comparando distribuciones de siguiente token frente a una ejecución FP32 de los pesos BF16 sobre 2.048 posiciones (los primeros 256 tokens de 8 prompts de chat). GSM8K usa 50 problemas con decodificación greedy, thinking desactivado y hasta 512 tokens nuevos; el propio autor advierte que 50 problemas es una muestra pequeña y que diferencias de pocos puntos son ruido. Con `llama-server` estándar de la build parcheada y ajustes CUDA por defecto, el fichero IQ1_S respondió 9 de 10 problemas GSM8K y decodificó 34 tokens/s en 2× NVIDIA B300.

## Requisitos de hardware

- VRAM estimada: el modelo completo debe caber en memoria de GPU; 2× NVIDIA B300 (275 GB cada una) es suficiente para el fichero IQ2_XXS de 581 GB.
- GPU recomendadas: NVIDIA B300 (probado con CUDA 13.1 y `CMAKE_CUDA_ARCHITECTURES=103-real`). No se documentan otras GPU compatibles.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 24 GB; ni siquiera en configuraciones multi-GPU convencionales).
- Opciones de despliegue: llama.cpp en el commit `f3b407ca1bfeeecebf9e9ef19fcd6eed565bd70a` con los parches de `runtime/patches`; la build estándar no puede cargar el modelo. Se usa `llama-server` con `-ngl 999`, `-c 16384`, `--jinja` y `--load-mode none` (lectura de las partes en memoria en lugar de mapearlas).
- Latencia y throughput: 34 tokens/s de decodificación en 2× B300 con el fichero IQ1_S; no se publican cifras para IQ2_XXS.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LongCat-2.5 KQuant IQ2_XXS (esta ficha) | 1,66 B | no disponible | MIT | GGUF (40 partes, 581 GB) | Requiere parches de llama.cpp; KL 1,050; GSM8K 46/50 |
| LongCat-2.5 KQuant IQ2_M | 1,66 B | no disponible | MIT | GGUF (689 GB) | Mejor fidelidad (KL 0,711, top-1 73 %); GSM8K 47/50 |
| LongCat-2.5 KQuant IQ1_S | 1,66 B | no disponible | MIT | GGUF (503 GB) | Menor tamaño; KL 1,486, top-1 59 %; GSM8K 48/50 |
| LongCat-2.5 (BF16 original) | 1,66 B | no disponible | MIT | safetensors (3,56 TB) | Referencia de calidad; no ejecutable en hardware de gama alta convencional |

No se dispone de información sobre otros modelos de la misma categoría (MoE de escala frontera cuantizados a 2 bits) con los que comparar parámetros activos, contexto o rendimiento.

## Limitaciones y advertencias

- Degradación medible por cuantización: con IQ2_XXS, el top-1 match frente a BF16 es del 68 % y la KL de 1,050, lo que implica divergencias notables en la distribución de siguiente token; IQ2_M ofrece mejor fidelidad a cambio de 108 GB más.
- Muestra de evaluación pequeña: los resultados GSM8K se basan en 50 problemas, insuficientes para extraer conclusiones robustas sobre capacidad matemática.
- Compatibilidad rota con llama.cpp estándar: es obligatorio compilar en el commit fijado y aplicar los parches de arquitectura y tokenizador; cualquier actualización de llama.cpp puede romper el despliegue.
- Requisito de memoria estricto: el modelo debe residir íntegramente en VRAM; no hay opción de descarga parcial a CPU documentada, lo que limita el hardware a configuraciones de varios cientos de GB de GPU.
- Idiomas no documentados: no se especifica qué lenguas cubre el modelo base, por lo que no se puede garantizar calidad multilingüe.
- Sesgos y alucinación: no se publica información sobre sesgos conocidos ni sobre tasas de alucinación del modelo base ni de esta cuantización.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base LongCat-2.5 en su repositorio original, ya que la model card remite a esa licencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ2_XXS
- Cuantización IQ1_S: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ1_S
- Cuantización IQ2_M: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ2_M
- Modelo base LongCat-2.5 (Meituan): https://huggingface.co/meituan-longcat/LongCat-2.5
- Sitio de Nace.AI: https://www.nace.ai/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
