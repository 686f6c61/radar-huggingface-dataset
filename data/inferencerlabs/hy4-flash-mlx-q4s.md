# inferencerlabs/Hy4-flash-MLX-Q4s

## Resumen

Hy4-flash-MLX-Q4s es una cuantización de 4 bits del modelo multimodal Hy4-flash de Tencent, publicada por inferencerlabs y empaquetada específicamente para MLX, el framework de Apple Silicon. El modelo base es un sistema image-text-to-text (procesa imagen y texto y genera texto) orientado a conversación, y esta versión concreta aplica una cuantización dinámica que mantiene las capas sensibles en mayor precisión mientras comprime el resto a una media de 4 bits, con streaming de n-gramas desde disco para reducir la huella de memoria.

El repositorio ocupa 3,9 GB y está pensado para ejecutarse en hardware Apple (los datos de rendimiento publicados corresponden a un M3 Ultra). Según la model card, esta configuración alcanza una perplejidad de 1,33593 y una precisión de token del 91,65% respecto al modelo base sin cuantizar, lo que la sitúa como un compromiso razonable entre calidad y tamaño para despliegue local en Mac.

La relevancia de esta ficha es práctica: permite ejecutar un modelo multimodal de Tencent en equipos Apple Silicon sin GPU dedicada, con métricas de degradación por cuantización explícitas. No obstante, la información pública disponible es escasa: no se detallan parámetros totales, longitud de contexto ni licencia, y el modelo base no está documentado en los datos proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; pipeline image-text-to-text) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits dinámica (media ~4 bpw, capas sensibles en mayor precisión); el autor publica además variantes Q3, Q4, Q5, Q6, Q8 y Q9 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamaño del repositorio | 3,9 GB |
| Modalidad | image-text-to-text (entrada imagen + texto, salida texto) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base tencent/Hy4-flash en los datos proporcionados: no se especifica si es un transformer denso, un MoE, un híbrido o un modelo con atención lineal, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. La model card de esta cuantización no incluye esos detalles y remite al repositorio del modelo base.

La innovación técnica documentada en esta versión es el proceso de cuantización: se aplica una cuantización dinámica a una media de 4 bits por peso, preservando las capas identificadas como sensibles en precisiones superiores, y se emplea streaming de n-gramas desde almacenamiento para reducir el consumo de memoria en tiempo de inferencia. La cuantización se realizó con una versión modificada de MLX. El autor reporta métricas de degradación frente al modelo base: Q4 obtiene perplejidad 1,33593 y 91,65% de precisión de token, frente a 1,20312 y 100% del base; Q3 se degrada severamente (perplejidad 168,0, precisión 43,45%), por lo que Q4 es el punto de entrada recomendable de la familia.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Comprensión de imágenes combinada con instrucciones textuales (entrada multimodal imagen + texto).
- Generación de código: la model card incluye una medición específica en modo "Coding" con el motor DFly.
- Ejecución local en Apple Silicon mediante MLX, con cuantización de 4 bits y streaming de n-gramas.
- Soporte de decodificación acelerada mediante el motor DFly de Inferencer (opción de motor en los controles de inferencia).
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio o modo "thinking" explícito: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno en inglés ejecutándose íntegramente en un M3 Ultra, sin enviar datos a la nube, lo que resulta adecuado para prototipos y uso personal con requisitos de privacidad.
- Análisis de imágenes con instrucciones en lenguaje natural: al ser image-text-to-text, permite describir, clasificar o extraer información de capturas, diagramas o fotos acompañadas de una pregunta textual.
- Asistencia a la programación en local: la model card mide un modo "Coding" con DFly a ~58 tokens/s, lo que lo hace viable para autocompletado y explicación de fragmentos de código en entornos de desarrollo sobre Apple Silicon.
- Evaluación de cuantizaciones: las tablas de perplejidad y precisión de token por nivel (Q3 a Q9) permiten a un investigador comparar el impacto de la cuantización en la calidad antes de elegir un despliegue, usando este repositorio como referencia reproducible.
- Despliegue en estaciones de trabajo Apple para demostraciones: con 3,9 GB de pesos y ~85,8 GiB de memoria reportada en M3 Ultra, encaja en flujos de demo y validación de producto donde no hay GPU NVIDIA disponible.
- Procesamiento por lotes de documentos con imagen y texto: la combinación de entrada multimodal y ejecución local permite clasificar o resumir material escaneado en pipelines internos, siempre que el contenido esté en inglés.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos disponibles son métricas de degradación por cuantización y velocidades de inferencia medidas por el autor:

| Métrica | Q3 | Q4 | Q5 | Q6 | Q8 | Q9 | Base |
|---|---|---|---|---|---|---|---|
| Perplejidad | 168,0 | 1,33593 | 1,23437 | 1,21875 | 1,21875 | 1,20312 | 1,20312 |
| Precisión de token | 43,45% | 91,65% | 95,05% | 96,65% | 97,65% | 97,80% | 100% |
| Divergencia perdida | 72,57% | 17,28% | 17,28% | 12,03% | 9,92% | 9,60% | 0,000% |

Rendimiento de inferencia reportado en M3 Ultra:

| Configuración | Velocidad | Memoria |
|---|---|---|
| 500 tokens, motor estándar | ~26,5 tokens/s | ~85,8 GiB |
| 500 tokens (coding), motor DFly | ~58 tokens/s | ~86,2 GiB |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor reporta ~85,8 GiB en M3 Ultra para el motor estándar y ~86,2 GiB con DFly; el repositorio de pesos ocupa 3,9 GB, pero el consumo en ejecución es muy superior por el streaming de n-gramas y el estado del modelo.
- GPU recomendadas: Apple Silicon de gama alta; las mediciones publicadas corresponden a un M3 Ultra. No hay datos para M1, M2, M3 Pro/Max ni para GPUs NVIDIA.
- ¿Cabe en GPU consumer? No hay datos que confirmen su viabilidad en GPUs consumer NVIDIA; en Apple Silicon requiere configuraciones de memoria unificada muy alta (entorno a 86 GiB según el autor).
- Opciones de despliegue: MLX (librería nativa del repositorio) e Inferencer v2.5.4, con motor DFly opcional. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~26,5 tokens/s en modo estándar y ~58 tokens/s en modo coding con DFly, ambos medidos sobre 500 tokens en M3 Ultra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El propio repositorio permite comparar niveles de cuantización del mismo modelo base (Q3 a Q9), pero no se ofrecen alternativas de otros autores con parámetros, contexto, rendimiento y licencia verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-MLX-Q4s | no disponible | no disponible | no disponible | Hugging Face (MLX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; no hay evidencia de soporte para castellano ni otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base tencent/Hy4-flash antes de cualquier despliegue en producción.
- Degradación por cuantización: Q4 pierde un 8,35% de precisión de token y eleva la perplejidad de 1,20312 a 1,33593 frente al base; Q3 es inutilizable en la práctica (43,45% de precisión).
- Consumo de memoria elevado: pese a los 3,9 GB de pesos, el autor reporta ~86 GiB en ejecución, lo que limita el despliegue a equipos con memoria unificada muy alta.
- Dependencia de hardware Apple: el formato MLX no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin reconversión.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, seguridad o alucinación; al ser un modelo multimodal, los errores de interpretación de imágenes pueden propagarse a la respuesta.
- Model card con descargo de responsabilidad del cuantizador: inferencerlabs declara no ser el creador del modelo y no asumir responsabilidad por inexactitudes; la validación corre a cargo del usuario.
- Ausencia de datos de contexto y arquitectura: impide planificar casos de uso que dependan de ventanas largas o de un modo agéntico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Hy4-flash-MLX-Q4s
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Vídeos de demostración: https://youtube.com/xcreate
- Inferencer: https://inferencer.com
- MLX (framework): https://github.com/ml-explore/mlx
