# 0x36/Spark-X2.6-4B-mlx-8bit

## Resumen

Spark-X2.6-4B-mlx-8bit es una conversión cuantizada a 8 bits del modelo XHToken/Spark-X2.6-4B, publicada por el usuario 0x36 para su ejecución en Apple Silicon mediante MLX. No se trata de un modelo nuevo: la arquitectura, el tokenizador y la plantilla de chat son idénticos al modelo base; solo cambian el diseño de los pesos y la precisión. El resultado es un repositorio de 4,4 GB (4,1 GB de descarga) con pesos en safetensors MLX, cuantización afín de 8 bits con grupo de 64 (8,500 bits por peso) y 4.112.079.360 parámetros totales.

El modelo base emplea una arquitectura denominada `spark2_5` en la configuración, con 36 capas de atención híbrida: capas de ventana deslizante de 512 tokens alternadas con capas de atención completa que usan RoPE parcial al 25 % y theta de 5e6. La configuración declara soporte de hasta 1.000.000 de posiciones de contexto, aunque el coste de memoria de la caché KV crece con las capas de atención completa. Los idiomas declarados son inglés y chino.

Su relevancia es acotada y muy específica: permite probar un modelo de 4B con ventana de contexto nominalmente muy larga en un Mac, sin necesidad de parchear `mlx-lm`, ya que el repositorio incluye su propia implementación (`spark2_5_mlx.py`) referenciada desde `config.json` mediante `model_file`. No hay resultados de benchmarks publicados, ni datos de entrenamiento, ni métricas de adopción (0 descargas en el momento de la consulta), por lo que debe tratarse como un artefacto de evaluación temprana y no como una opción validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención (`spark2_5`): 36 capas, capas de ventana deslizante (512 tokens) alternadas con capas de atención completa; RoPE parcial al 25 %, theta 5e6; embeddings de entrada/salida atados (sin `lm_head` separado) |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 1.000.000 de posiciones según `config.json`; el consumo de KV crece con las capas de atención completa |
| Tipos de cuantizacion | 8 bits afín, tamaño de grupo 64 (8,500 bits por peso). Existen variantes bf16 y 4 bits del mismo conversor |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), con implementación propia `spark2_5_mlx.py` |
| Tamano del repositorio | 4,4 GB (descarga indicada en la model card: 4,1 GB) |
| Parametros de muestreo por defecto | `temperature=1.0`, `top_p=0.95` (según `generation_config.json` original) |
| Libreria / runtime | `mlx-lm` estándar (no requiere parcheo) |
| Modelo base | XHToken/Spark-X2.6-4B |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 36 capas con atención híbrida. Cada capa de ventana deslizante limita la atención a 512 tokens, mientras que las capas de atención completa cubren toda la secuencia; la generación usa `RotatingKVCache` en las capas deslizantes, lo que evita que la caché crezca indefinidamente en esas capas. Las capas de atención completa aplican RoPE parcial (25 % de las dimensiones rotadas) con theta de 5e6, un ajuste habitualmente asociado a la extensión de contexto. Los embeddings de entrada y salida están atados, de modo que no existe una matriz `lm_head` independiente. La plantilla de chat admite un modo de razonamiento opcional mediante el parámetro `enable_thinking`.

No se dispone de información sobre el entrenamiento del modelo base: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card del repositorio cuantizado solo documenta el proceso de conversión (`mlx_lm.convert --hf-path XHToken/Spark-X2.6-4B --mlx-path ./8bit --dtype bfloat16 -q --q-bits 8`), que preserva arquitectura, tokenizador y plantilla de chat y modifica únicamente la disposición y la precisión de los pesos. La innovación técnica destacable de este repositorio no está en el modelo, sino en el empaquetado: al no estar `spark2_5` integrado en `mlx-lm`, se incluye una implementación propia que `mlx-lm` de serie carga directamente.

## Capacidades

- Generación de texto y conversación multi-turno (etiquetas `text-generation` y `conversational`), usando la plantilla de chat del modelo base.
- Modo de razonamiento opcional: la plantilla acepta `enable_thinking=True` para activar el modo "thinking"; por defecto se usa `False`.
- Generación de código: la model card usa como ejemplo una función Python que invierte una lista enlazada; es una demostración de uso, no una medición de calidad.
- Contexto largo: la configuración declara hasta 1.000.000 de posiciones, con la advertencia explícita de que la memoria KV crece con las capas de atención completa.
- Multilingüismo limitado a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking puede emplearse para razonamiento, pero no hay soporte declarado de herramientas ni de flujos agénticos.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de código en local sobre Mac: con 4,1 GB de pesos en 8 bits, el modelo cabe en la memoria unificada de un portátil Apple Silicon y permite autocompletar o generar funciones (por ejemplo, utilidades en Python) sin conexión ni envío de código a servicios externos.
- Razonamiento asistido con modo thinking: activando `enable_thinking=True` en la plantilla de chat se obtienen trazas de razonamiento antes de la respuesta, útil para depurar problemas lógicos o explicar decisiones paso a paso en entornos de desarrollo.
- Procesamiento de documentación técnica en inglés o chino: la ventana declarada de hasta 1M posiciones permite en principio cargar documentos extensos, aunque conviene limitar la longitud real por el crecimiento de la caché KV en las capas de atención completa.
- Evaluación comparativa de cuantizaciones: el mismo autor publica variantes bf16, 8 bits y 4 bits, lo que permite medir la degradación de calidad y el ahorro de memoria entre precisiones sobre el mismo modelo base con un pipeline reproducible.
- Prototipado de chatbots en Apple Silicon: integración directa con `mlx-lm` (`load`, `generate` y la CLI `mlx_lm.generate`) sin parchear la librería, adecuado para demos y pruebas de concepto en local.
- Inferencia en entornos aislados o air-gapped: al ser un repositorio autocontenido de 4,4 GB con licencia Apache 2.0, puede desplegarse en máquinas Apple sin acceso a Internet ni dependencias de servicios en la nube.
- Estudio de arquitecturas híbridas de atención: la implementación `spark2_5_mlx.py` incluida sirve como referencia para analizar el comportamiento de ventanas deslizantes de 512 tokens combinadas con atención completa y RoPE parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 4,1 GB en disco y en memoria (8,500 bits por peso sobre 4,11 B de parámetros).
- Plataforma: exclusivamente Apple Silicon (MLX). Esta conversión no es ejecutable en GPU NVIDIA o AMD con CUDA/ROCm.
- Memoria unificada: un mínimo práctico de 8 GB para contextos cortos; 16 GB o más es recomendable para trabajar con contextos medios y margen para el sistema.
- Contexto largo: no hay cifra publicada de memoria KV por token; el propio autor advierte que la caché crece con las capas de atención completa, por lo que contextos cercanos a 1M de posiciones no son viables en hardware de consumo.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo son chips de la serie M de Apple (M1 o posterior). Para GPU NVIDIA habría que recurrir al modelo base en bf16 (pesos de aproximadamente 8,2 GB, estimación aritmética a partir del número de parámetros, no publicada por el autor).
- Opciones de despliegue: `mlx-lm` (API `load`/`generate` y CLI `mlx_lm.generate`). No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI para el `model_type: spark2_5`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Peso aproximado | Licencia | Formato |
|---|---|---|---|---|---|---|
| Spark-X2.6-4B-mlx-8bit | 4,11 B | Hasta 1M posiciones (config) | 8 bits afín, grupo 64 | 4,1 GB | Apache 2.0 | MLX safetensors |
| Spark-X2.6-4B-mlx-bf16 | 4,11 B | Hasta 1M posiciones (config) | bf16 | No disponible (estimado ~8,2 GB) | Apache 2.0 | MLX safetensors |
| Spark-X2.6-4B-mlx-4bit | 4,11 B | Hasta 1M posiciones (config) | 4 bits | No disponible | Apache 2.0 | MLX safetensors |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | Hasta 1M posiciones (config) | bf16 original | No disponible | Apache 2.0 | Safetensors |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras familias de modelos de tamaño comparable (por ejemplo, alternativas de 3-4 B de parámetros de otros autores), por lo que no es posible establecer una comparación de rendimiento fundamentada. Cualquier comparación con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino. No hay soporte declarado de castellano, lo que limita su uso directo en productos para el mercado hispanohablante.
- Ausencia total de benchmarks: no hay métricas de calidad, razonamiento, código ni matemáticas que permitan estimar su nivel frente a alternativas consolidadas.
- Falta de trazabilidad del entrenamiento: se desconoce el volumen de tokens, la composición del dataset y si hubo alineamiento (RLHF/DPO), lo que impide evaluar sesgos y riesgos de alucinación de forma fundamentada.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en este caso por falta de evaluaciones publicadas.
- Cuantización con pérdida: los 8 bits afines con grupo 64 introducen una degradación respecto a bf16 que no está medida; para tareas sensibles conviene comparar con la variante bf16.
- Contexto largo engañoso: la cifra de 1M posiciones proviene de la configuración, pero la memoria KV de las capas de atención completa hace inviable ese régimen en hardware de consumo.
- Portabilidad limitada: `spark2_5` no forma parte de `mlx-lm`, y esta conversión solo funciona en Apple Silicon; no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y se publicó y actualizó el mismo día, sin validación externa conocida.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero esa licencia cubre la conversión; conviene verificar la licencia y las condiciones del modelo base XHToken/Spark-X2.6-4B antes de un despliegue en producción.
- Tool calling y flujos agénticos: no documentados, por lo que no deberían asumirse en un diseño de sistema.

## Enlaces

- Repositorio HuggingFace (8 bits MLX): https://huggingface.co/0x36/Spark-X2.6-4B-mlx-8bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Variante bf16: https://huggingface.co/0x36/Spark-X2.6-4B-mlx-bf16
- Variante 4 bits: https://huggingface.co/0x36/Spark-X2.6-4B-mlx-4bit
- Implementación incluida en el repositorio: `spark2_5_mlx.py` (referenciada desde `config.json` mediante `model_file`)
- Documentación de MLX: no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponible; la búsqueda web realizada no devolvió resultados relevantes para este modelo
