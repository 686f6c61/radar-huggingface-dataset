# hermitdave/Spark-X2.5-4B-MLX-6bit

## Resumen

Spark-X2.5-4B-MLX-6bit es una conversión a 6 bits en formato MLX del modelo Spark-X2.5-4B, desarrollado por el equipo SparkLLM (XHToken) y convertido por el usuario hermitdave. Se trata de un transformer denso de 4.112.079.360 parámetros (≈4,1B) orientado a cargas de trabajo agénticas y de contexto largo: su ventana nativa es de 1.048.576 tokens (1M), una cifra poco habitual en el rango de los 4B. El modelo se distribuye bajo licencia Apache 2.0, la misma que el modelo original.

El interés de esta ficha concreta reside en la cuantización. El repositorio ocupa 3,1 GB en disco (frente a 8,2 GB en bf16) y unos 3,15 GB de memoria de GPU en tiempo de ejecución. La perplejidad medida es de 14,56 ± 0,27 frente a 14,45 ± 0,27 del bf16, dentro del margen de un error estándar, mientras que la conversión de 4 bits del mismo autor sube a 16,33 ± 0,31 (+13 %). La conversión mantiene en BF16 las puertas de atención `self_attn.g_proj` (~187K parámetros) y los pesos de RMSNorm, y cuantiza también la tabla de embeddings (con `lm_head` atado).

Al estar empaquetado para MLX, el artefacto está pensado para ejecutarse en Apple Silicon: las mediciones publicadas se tomaron en un M3 Max de 64 GB. Esto lo sitúa en el nicho de la inferencia local en Mac, no en el de servidores con GPU NVIDIA. La fecha de creación del repositorio es el 22 de septiembre de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con patrón de atención híbrida (3 capas de ventana deslizante + 1 de atención completa, repetido) |
| Parámetros totales | 4.112.079.360 (≈4,1B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) nativa |
| Tipos de cuantización | MLX affine de 6 bits, group size 64, 6,504 bits efectivos por peso; el mismo autor publica una conversión de 4 bits |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; incluye pruebas de aritmética en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), acompañado del archivo de arquitectura `spark2_5.py` para mlx-lm |
| Modelo base | XHToken/Spark-X2.5-4B |
| Tamaño en disco | 3,1 GB (desde 8,2 GB en bf16) |
| Memoria en tiempo de ejecución | ~3,15 GB de GPU |
| Librería | mlx (mlx-lm ≥ 0.31) |

## Arquitectura y entrenamiento

Spark-X2.5 usa un patrón de atención híbrida que alterna 3 capas de ventana deslizante y 1 capa de atención completa. En total son 36 capas: 27 deslizantes (ventana de 512 tokens) y 9 completas. La dimensión oculta es 2560, con 16 cabezas de atención y 4 cabezas KV (GQA), dimensión de cabeza 256. Las capas de atención completa aplican RoPE parcial (25 % de las dimensiones rotadas, base θ=5M), mientras que las capas deslizantes usan RoPE completo con θ=10k. Incorpora puertas de salida de atención con sigmoide por cabeza, un MLP GELU en paralelo con dimensión intermedia 10240, vocabulario de 131.072 tokens y embeddings atados. El modo de razonamiento (thinking) está activado por defecto en la plantilla de chat y puede desactivarse pasando `enable_thinking=False` a `apply_chat_template`; el muestreo recomendado es temperature 1.0 y top_p 0.95.

Esta ficha documenta la conversión, no el entrenamiento: el repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla el proceso de destilación o ajuste agéntico del modelo original. La innovación técnica destacable, además de la atención híbrida y las puertas sigmoide, es el propio proceso de cuantización: 6 bits con grupo de 64, con excepciones explícitas en BF16 para `g_proj` y las normalizaciones, lo que permite igualar la perplejidad del bf16 con un 38 % del tamaño en disco. La conversión se realizó con mlx-lm 0.31.3 y el soporte de arquitectura de Spark-MLX-LLM.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat.
- Modo de razonamiento (thinking) activado por defecto, desactivable mediante `enable_thinking=False`.
- Razonamiento aritmético básico: la model card reporta `53 × 42 = 2226` a temperatura 0, coincidente con la salida de referencia del proveedor, además de aritmética correcta en chino.
- Tool calling / function calling: se valida una llamada bien formada `get_weather(city="Paris", unit="celsius")`; el repositorio Spark-MLX-LLM incluye utilidades de parseo de tool calls.
- Flujos agénticos y razonamiento multi-paso, según la orientación declarada del modelo (`agentic`).
- Contexto largo: ventana nativa de 1.048.576 tokens, adecuada para documentos extensos o historiales largos.
- Capacidades multilingües: no declaradas explícitamente; hay evidencia de funcionamiento en inglés y chino en las pruebas incluidas.
- Visión, audio u otras modalidades: no disponible (no se mencionan en la información proporcionada).

## Casos de uso

- Asistente personal local en Mac: el modelo cabe en unos 3,15 GB de memoria de GPU, por lo que puede ejecutarse íntegramente en un portátil Apple Silicon sin conexión y sin enviar datos a terceros.
- Análisis de documentos muy largos: con 1M de tokens de contexto nativo se puede cargar un libro completo, un expediente o un repositorio de transcripciones en una sola ventana, sin depender de fragmentación previa.
- Agente con herramientas en local: gracias al soporte de function calling verificado, sirve como planificador en flujos que invocan APIs, consultas a bases de datos o ejecución de comandos.
- Asistente de atención al cliente multilingüe (inglés/chino): el modelo mantiene conversaciones multi-turno largas y puede integrarse en un backend MLX para despliegues con requisitos de privacidad.
- Generación y explicación de código en entornos aislados: útil en estaciones de trabajo sin GPU NVIDIA donde se necesita asistencia de código offline y con razonamiento paso a paso.
- Procesamiento por lotes de contratos o documentación técnica: la ventana de 1M tokens permite resumir y extraer cláusulas de documentos completos manteniendo coherencia entre secciones.
- Investigación sobre cuantización: el par de conversiones 6 bits / 4 bits del mismo autor permite estudiar el impacto de la precisión en perplejidad y velocidad sobre una misma arquitectura.
- Tutoría y resolución de problemas matemáticos sencillos: las pruebas de aritmética a temperatura 0 indican un comportamiento estable en cálculos de un paso.

## Benchmarks y rendimiento

La model card incluye únicamente mediciones de perplejidad realizadas por el conversor sobre ~24,6k tokens de *Pride and Prejudice* (Project Gutenberg), con ventanas de 1024 tokens y ejecución en un M3 Max de 64 GB.

| Métrica | bf16 (base) | 6 bits (este repo) | 4 bits |
|---|---|---|---|
| Perplejidad (↓) | 14,45 ± 0,27 | 14,56 ± 0,27 | 16,33 ± 0,31 |
| Tamaño en disco | 8,2 GB | 3,1 GB | 2,2 GB |
| Memoria de GPU en ejecución | ~8,3 GB | 3,15 GB | 2,26 GB |
| Velocidad de decodificación | no disponible | 20 tok/s | 21 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. Las pruebas de calidad citadas son comprobaciones puntuales a temperatura 0: `53 × 42 = 2226`, «train speed 80 km/h», capital de Anhui → Hefei, aritmética en chino y la llamada de herramienta `get_weather(city="Paris", unit="celsius")`.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,15 GB de memoria de GPU en la conversión de 6 bits, según la medición del autor en MLX.
- Plataforma: exclusivamente Apple Silicon. El formato MLX no se ejecuta en GPU NVIDIA o AMD; no hay pesos GGUF ni safetensors estándar listos para CUDA en este repositorio.
- GPU recomendadas: no disponibles en el sentido habitual (A100/H100/RTX 4090 no aplican). El hardware validado es un Apple M3 Max con 64 GB de memoria unificada.
- Viabilidad en hardware de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente. Con 8 GB de memoria unificada el modelo entra (3,15 GB de pesos), pero el contexto utilizable queda limitado por la caché KV.
- Caché KV: con 9 capas de atención completa, 4 cabezas KV y dimensión de cabeza 256, la caché crece a razón de unos 36 KB por token en bf16 (estimación propia derivada de la arquitectura publicada). A 1M tokens esto supone del orden de 36 GB adicionales; las 27 capas deslizantes quedan acotadas por su ventana de 512 tokens. El contexto máximo práctico depende, por tanto, de la memoria disponible y de si se cuantiza la caché.
- Opciones de despliegue: `mlx-lm` ≥ 0.31 (el repositorio incluye el archivo `spark2_5.py` y lo carga mediante el mecanismo `model_file`, ya que `spark2_5` aún no está en la versión de PyPI) y el CLI de Spark-MLX-LLM con wrappers `spark-mlx-*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 20 tok/s de decodificación en un M3 Max de 64 GB. No se publican cifras de prefill ni de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos sobre modelos externos comparables en la información proporcionada. La comparación se limita a las variantes de la misma familia mencionadas en la model card y en la cita del autor.

| Modelo | Parámetros | Contexto | Formato | Tamaño | Licencia | Perplejidad |
|---|---|---|---|---|---|---|
| Spark-X2.5-4B-MLX-6bit (este) | 4,11B | 1.048.576 | MLX 6 bits | 3,1 GB | Apache 2.0 | 14,56 ± 0,27 |
| Spark-X2.5-4B (bf16 original) | 4,11B | 1.048.576 | safetensors bf16 | 8,2 GB | Apache 2.0 | 14,45 ± 0,27 |
| Spark-X2.5-4B-MLX-4bit | 4,11B | 1.048.576 | MLX 4 bits | 2,2 GB | Apache 2.0 | 16,33 ± 0,31 |
| Spark-X2.5-1.7B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de 4B, sin evaluaciones de veracidad publicadas más allá de pruebas puntuales.
- Idiomas soportados no declarados: no hay lista oficial de idiomas ni evaluación multilingüe; el castellano no está verificado en la información disponible.
- Los únicos datos de rendimiento son de perplejidad sobre un texto en inglés y de comprobaciones aisladas. No hay MMLU, HumanEval ni evaluaciones de seguridad.
- El modo de razonamiento está activado por defecto, lo que incrementa el consumo de tokens de salida si no se desactiva explícitamente con `enable_thinking=False`.
- Dependencia de una arquitectura no estándar: requiere mlx-lm ≥ 0.31 con el archivo `spark2_5.py` incluido en el repositorio, ya que `spark2_5` no está en la versión publicada en PyPI en el momento de la conversión.
- Portabilidad limitada: al ser MLX, no se puede reutilizar en servidores con GPU NVIDIA ni con llama.cpp/Ollama sin una conversión adicional.
- El contexto de 1M tokens es nominal; en la práctica la caché KV de las capas de atención completa puede consumir decenas de GB a longitudes máximas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y atribución. No se imponen restricciones adicionales más allá de las del modelo base.
- Repositorio sin descargas ni valoraciones registradas, por lo que no existe validación independiente de la comunidad sobre este artefacto concreto.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni alineación del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-6bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Conversión de 4 bits del mismo autor: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-4bit
- Soporte de arquitectura Spark-MLX-LLM: https://github.com/XHToken/Spark-MLX-LLM
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Herramienta de conversión y validación (Hermes Agent, Nous Research): https://hermes-agent.nousresearch.com
- Cita del modelo original: Spark-X2.5 4B&1.7B: Pushing the Limits of Agentic Capabilities in On-Device Models, SparkLLM Team, 2026.

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces recuperados correspondían a páginas de información general sin relación con Spark-X2.5.
