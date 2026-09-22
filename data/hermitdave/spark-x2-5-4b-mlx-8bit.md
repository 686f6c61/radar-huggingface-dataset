# hermitdave/Spark-X2.5-4B-MLX-8bit

## Resumen

Spark-X2.5-4B-MLX-8bit es una conversion a 8 bits en formato MLX del modelo Spark-X2.5-4B, desarrollado por el equipo SparkLLM (XHToken). La conversion la firma hermitdave y esta pensada para ejecucion local en Apple Silicon mediante la libreria mlx. El modelo original es un transformer compacto de 4,11 mil millones de parametros con una ventana de contexto nativa de 1.048.576 tokens, orientado explicitamente a cargas de trabajo agenticas y de contexto largo en dispositivo.

El problema que resuelve es el de disponer de un modelo agentico de largo contexto con una huella de memoria reducida a la mitad: el build en 8 bits ocupa 4,1 GB en disco y 4,10 GB de memoria en tiempo de ejecucion, frente a los 8,2 GB y 8,3 GB del original en bf16, manteniendo una perplejidad estadisticamente identica (14,49 frente a 14,45). El equipo upstream recomienda pesos en 8 bits o BF16 para tool calling, lo que convierte este build en el mas indicado para arneses de agentes entre las tres cuantizaciones publicadas (4, 6 y 8 bits).

Es relevante ahora porque combina tres elementos poco frecuentes en un modelo de 4B: contexto nativo de un millon de tokens, modo de razonamiento activado por defecto en la plantilla de chat y licencia Apache 2.0, todo ello ejecutable en un Mac de consumo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 36 capas (27 de ventana deslizante + 9 de atencion completa), patron 3:1, ventana 512, GQA, RoPE parcial, puertas sigmoideas de salida de atencion, MLP GELU paralelo |
| Parametros totales | 4.112.079.360 (4,11 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M nativo) |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 (8,503 bits efectivos por peso); la familia incluye tambien builds de 6 y 4 bits |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las pruebas incluyen ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con fichero de arquitectura `spark2_5.py` incluido en el repositorio |

Tabla de cuantizacion del build:

| Parametro | Valor |
|---|---|
| Formato | MLX affine, 8-bit, group size 64 |
| Bits efectivos por peso | 8,503 |
| Tamano del modelo | 4,1 GB (desde 8,2 GB en bf16) |
| Mantenido en BF16 | puertas `self_attn.g_proj` (unos 187K parametros) y pesos RMSNorm |
| Embeddings | 8-bit (lm_head atado) |
| Herramienta de conversion | mlx-lm 0.31.3 + soporte de arquitectura Spark-MLX-LLM |

## Arquitectura y entrenamiento

Spark-X2.5 emplea un patron de atencion hibrido que alterna tres capas de ventana deslizante por cada capa de atencion completa, repetido a lo largo de 36 capas (27 deslizantes y 9 completas), con una ventana de 512 tokens. La dimension oculta es de 2560, con 16 cabezas de atencion y 4 cabezas KV (GQA), dimension de cabeza 256 y MLP GELU paralelo con intermedio de 10240. Las capas de atencion completa usan RoPE parcial (25% rotatorio, theta = 5M), mientras que las deslizantes usan RoPE completo con theta = 10k. Incorpora puertas sigmoideas de salida de atencion por cabeza. El vocabulario es de 131.072 entradas con embeddings atados. El contexto nativo es de 1.048.576 tokens.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El modo de razonamiento (thinking) viene activado por defecto en la plantilla de chat y puede desactivarse pasando `enable_thinking=False` a `apply_chat_template`. El muestreo recomendado es temperatura 1,0 y top_p 0,95. La innovacion tecnica destacable es la combinacion de atencion hibrida con GQA y RoPE parcial para sostener un millon de tokens de contexto en un modelo de 4B, junto con la cuantizacion de todo el modelo (incluida la tabla de embeddings atada) preservando en BF16 las puertas `g_proj` y los pesos RMSNorm.

## Capacidades

- Generacion de texto conversacional y finalizacion de texto, con pipeline declarado `text-generation`.
- Razonamiento en modo thinking activado por defecto mediante la plantilla de chat.
- Aritmetica y matematicas basicas: en las pruebas de calidad a temperatura 0 resolvio correctamente `53 x 42 = 2226` y una operacion aritmetica en chino.
- Tool calling / function calling: genera llamadas bien formadas, verificado con `get_weather(city="Paris", unit="celsius")`; el equipo upstream recomienda 8 bits o BF16 para esta funcion.
- Orientacion agentica: el modelo esta etiquetado como `agentic` y disenado para arneses de agentes con multiples pasos.
- Contexto largo: ventana nativa de 1.048.576 tokens y etiqueta `long-context`.
- Conocimiento factual: identifico correctamente Hefei como capital de la provincia de Anhui.
- Multilingue: no declarado formalmente; hay evidencia de uso en ingles y chino, no confirmada para otros idiomas.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Arneses de agentes con tool calling: la model card recomienda explicitamente el build de 8 bits para herramientas, de modo que puede integrarse como motor de decisiones en un agente que invoca APIs externas con llamadas bien formadas y encadenamiento multi-paso.
- Analisis de documentos largos: con 1.048.576 tokens de contexto nativo puede procesar libros, expedientes o bases de codigo completas en una sola pasada sin necesidad de troceado y reinyeccion.
- Resumen y extraccion sobre corpus extensos: util para generar resumenes estructurados o extraer entidades de informes de cientos de miles de tokens manteniendo coherencia global.
- Asistencia conversacional local en escritorio: al ejecutarse en Apple Silicon con 4,10 GB de memoria, permite un chatbot de privacidad total sin enviar datos a la nube, en un Mac de gama consumer.
- Razonamiento con modo thinking para tareas de varios pasos: activado por defecto, sirve para descomponer problemas matematicos o logicos antes de dar la respuesta final, con la opcion de desactivarlo para respuestas rapidas.
- Generacion de codigo asistida en local: integrable en editores o scripts de desarrollo sobre Mac, con contexto suficiente para incluir ficheros y dependencias relevantes del proyecto.
- Automatizacion de tareas de investigacion: combinacion de contexto largo y tool calling para leer multiples fuentes y emitir sintesis con citas dentro de un mismo contexto.
- Educacion y tutoria bilingue (ingles/chino): las pruebas muestran aritmetica y conocimiento geografico en ambos idiomas, aunque la cobertura multilingue no esta declarada.

## Benchmarks y rendimiento

Perplejidad medida sobre aproximadamente 24,6k tokens de *Pride and Prejudice* (Gutenberg), con ventanas de 1024 tokens, en un M3 Max de 64 GB durante la conversion:

| Version | Perplejidad (menor es mejor) | Tamano en disco | Memoria GPU en ejecucion | Velocidad de decodificacion |
|---|---|---|---|---|
| bf16 base | 14,45 ± 0,27 | 8,2 GB | ~8,3 GB | no disponible |
| 8-bit (este build) | 14,49 ± 0,27 | 4,1 GB | 4,10 GB | 20 tok/s |
| 6-bit | 14,56 ± 0,27 | 3,1 GB | 3,15 GB | 20 tok/s |
| 4-bit | 16,33 ± 0,31 | 2,2 GB | 2,26 GB | 21 tok/s |

La perplejidad del build en 8 bits queda dentro del margen de error respecto a bf16: la perdida por cuantizacion es inmedible a esta precision. El salto de calidad de la familia se situa entre 6 y 4 bits (un 13% mas de perplejidad en 4 bits).

Pruebas de humo de calidad a temperatura 0, todas superadas:

| Prueba | Resultado |
|---|---|
| Aritmetica `53 x 42` | 2226 (coincide con la salida de referencia del proveedor) |
| Razonamiento de fisica (velocidad de tren) | 80 km/h |
| Capital de Anhui | Hefei |
| Aritmetica en chino | correcta |
| Tool call | `get_weather(city="Paris", unit="celsius")` bien formada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,10 GB de memoria en tiempo de ejecucion con 8 bits (medido); 8,3 GB con bf16; 3,15 GB con 6 bits; 2,26 GB con 4 bits.
- Plataforma: MLX sobre Apple Silicon. La model card no menciona soporte CUDA ni ROCm, de modo que no hay rutas de despliegue en GPU NVIDIA o AMD documentadas para este repositorio.
- GPU validadas: Apple M3 Max de 64 GB (medicion oficial de conversion). Compatible, no verificado, con otras generaciones de Apple Silicon (M1, M2, M4) con memoria unificada suficiente.
- Cabe en GPU de consumo: si, en Mac con Apple Silicon. Con 4,1 GB de pesos, 8 GB de memoria unificada es el minimo practico por el overhead del sistema operativo; 16 GB o mas es lo recomendable.
- Opciones de despliegue: mlx-lm igual o superior a 0.31 (la arquitectura `spark2_5` aun no esta en la release de PyPI, pero si en la rama `main` de GitHub; el repositorio incluye `spark2_5.py` y lo carga mediante el mecanismo `model_file`). Alternativamente, Spark-MLX-LLM ofrece los wrappers CLI `spark-mlx-*` y el analisis de tool calls.
- Latencia y throughput: 20 tok/s de decodificacion en M3 Max de 64 GB a 8 bits (20 tok/s en 6 bits y 21 tok/s en 4 bits, segun los datos de conversion).
- El modo thinking activado por defecto incrementa el numero de tokens generados y, por tanto, la latencia percibida; puede desactivarse.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada. La comparativa posible se limita a las cuantizaciones de la misma familia:

| Version | Parametros | Contexto | Cuantizacion | Perplejidad | Disco | Memoria en ejecucion | Licencia |
|---|---|---|---|---|---|---|---|
| Spark-X2.5-4B (bf16, upstream) | 4,11B | 1M | BF16 | 14,45 ± 0,27 | 8,2 GB | ~8,3 GB | Apache 2.0 |
| Spark-X2.5-4B-MLX-8bit | 4,11B | 1M | MLX affine 8-bit | 14,49 ± 0,27 | 4,1 GB | 4,10 GB | Apache 2.0 |
| Spark-X2.5-4B-MLX-6bit | 4,11B | 1M | MLX affine 6-bit | 14,56 ± 0,27 | 3,1 GB | 3,15 GB | Apache 2.0 |
| Spark-X2.5-4B-MLX-4bit | 4,11B | 1M | MLX affine 4-bit | 16,33 ± 0,31 | 2,2 GB | 2,26 GB | Apache 2.0 |

La cita del modelo menciona tambien una variante Spark-X2.5-1.7B dentro de la misma familia, pero no se aportan datos tecnicos ni de rendimiento sobre ella.

## Limitaciones y advertencias

- La model card no declara sesgos conocidos ni lista de idiomas soportados; no hay auditoria de sesgo disponible.
- Riesgo de alucinacion no cuantificado. Al tratarse de un modelo denso de 4,11B, cabe esperar una tasa de error factual superior a la de modelos de mayor tamano, aunque no se aportan mediciones.
- La perplejidad se midio con ventanas de 1024 tokens sobre unos 24,6k tokens, muy por debajo del contexto nativo de 1M; no hay datos de rendimiento real a contextos extremos ni de degradacion a medida que crece el contexto.
- Cobertura multilingue no declarada: solo hay evidencia de ingles y chino en las pruebas.
- Licencia Apache 2.0, permisiva para uso comercial. El fichero `spark2_5.py` incluido deriva de Spark-MLX-LLM, tambien Apache 2.0.
- Dependencia de herramienta: requiere mlx-lm igual o superior a 0.31; la arquitectura `spark2_5` todavia no esta en la release de PyPI, solo en la rama `main` de GitHub.
- Restriccion de plataforma: al ser un build MLX, esta limitado a Apple Silicon. No se ofrecen pesos GGUF, CUDA ni compatibles con vLLM, llama.cpp, Ollama o TGI.
- El build de 4 bits de la misma familia presenta una degradacion medible de la perplejidad (de 14,56 a 16,33, un 13%); para tool calling el equipo upstream solo respalda 8 bits o BF16.
- El modo thinking activado por defecto puede aumentar el consumo de tokens y la latencia si no se gestiona en produccion.
- Metricas de validacion de la comunidad nulas: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo ni sobre su familia; las afirmaciones de esta ficha se limitan a la model card y a los datos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-8bit
- Build de 4 bits: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-4bit
- Build de 6 bits: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-6bit
- Modelo base upstream: https://huggingface.co/XHToken/Spark-X2.5-4B
- Soporte de arquitectura Spark-MLX-LLM: https://github.com/XHToken/Spark-MLX-LLM
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Hermes Agent (Nous Research, orquestacion de la conversion): https://hermes-agent.nousresearch.com
- Cita del modelo: Spark-X2.5 4B&1.7B: Pushing the Limits of Agentic Capabilities in On-Device Models, SparkLLM Team, 2026 (BibTeX incluido en la model card; no se proporciona DOI ni URL del paper)
