# KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-4bit

## Resumen

Este repositorio contiene una derivación "abliterated" (sin direcciones de rechazo) del modelo Bonsai 2 27B de PrismML, publicada por el usuario KridgeDookie bajo el identificador Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-4bit. No es un modelo entrenado desde cero, sino una edición de pesos aplicada sobre prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, que a su vez deriva de Qwen3.8-27B. El objetivo declarado es eliminar las respuestas de rechazo manteniendo el formato de cuantización ternaria del original, mediante dos pasadas de biproyección que preservan la norma sobre las capas 1 a 63.

La particularidad técnica es su naturaleza de precisión mixta: la mayor parte de las matrices de lenguaje conservan la representación ternaria rotada original de 2 bits, mientras que las 126 matrices editadas se almacenan en valores canónicos sin rotar de 4 bits (Q4_0) o 8 bits (Q8_0), con group size 32. El autor documenta que un reempaquetado ternario puro borraba la edición (124 de 126 rechazos en el conjunto retenido), por lo que ese candidato no se distribuye.

El resultado es relevante como artefacto de investigación sobre metodologías de abliteración y sobre el impacto de la cuantización en ediciones de pesos: la criba del autor pasa de 123 rechazos sobre 126 en el modelo original a 0 tanto en la variante mixta de 4 bits como en la de 8 bits. Se trata, sin embargo, de un repositorio sin descargas ni valoraciones, sin benchmarks estándar publicados y sin validación en iPhone, Metal de macOS ni App Store.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (Bonsai 2 27B de PrismML), con torre de visión preservada; sin más detalle publicado |
| Parámetros totales | 34.955.088.112 (~34,96 mil millones, recuento real de safetensors); el nombre del modelo indica 27B |
| Parámetros activos | no disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | no disponible (la evaluación del autor usó una ventana GGUF de 4096 tokens, que no equivale al máximo del modelo) |
| Tipos de cuantización | Mayoría de pesos de lenguaje en 2 bits ternarios rotados; 126 matrices editadas en 4 bits (Q4_0) o 8 bits (Q8_0), group size 32; variantes mixed-2/4bit y mixed-2/8bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los pesos; el código de runtime incluido conserva su licencia MIT |
| Formato de pesos | safetensors en formato MLX con loader de precisión mixta propio; 11,20 GB (incluye la torre de visión sin cambios) |

## Arquitectura y entrenamiento

No hay entrenamiento involucrado: el autor aplica una receta de abliteración denominada "Philadelphia" en dos pasadas de biproyección que preservan la norma, con escala 1.0, sobre las capas 1 a 63 y 126 matrices de salida por pasada. Las direcciones de rechazo se reextraen específicamente de Bonsai en cada pasada; según la model card, no se sustituyeron pesos de Qwen ni direcciones guardadas de Qwen. Los 842 pares de prompts se dividieron en 716 pares de extracción y 126 pares retenidos, disjuntos por familia, con semilla 1337. Se publican los ficheros `recipe.json` y dos ficheros de procedencia.

La innovación técnica relevante es el tratamiento de la cuantización: las matrices no editadas mantienen la representación ternaria rotada, mientras que las 126 editadas usan Q4_0 o Q8_0 canónicos sin rotar, lo que obligó a actualizar el orden de columnas GDN y los manifiestos de Hadamard. El autor indica explícitamente que el reempaquetado ternario puro borraba la edición. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ya que la intervención es una edición de pesos sobre un modelo preexistente.

## Capacidades

- Generación de texto y uso conversacional en formato MLX, tal como declara el pipeline del repositorio (`text-generation`).
- Generación multimodal potencial: la torre de visión se preserva intacta en el checkpoint, aunque su comportamiento no fue reevaluado tras la edición.
- Supresión de rechazos: 0 respuestas de rechazo sobre 126 prompts retenidos en las variantes mixtas de 4 y 8 bits, frente a 123 en el modelo original.
- Conservación parcial de capacidades benignas: 21 de 24 tareas benignas superadas en las variantes mixtas, frente a 22 de 24 en el original (criba heurística determinista, no una medida de inteligencia).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar experimentalmente cómo se comporta un transformer cuantizado tras eliminar sus direcciones de rechazo, comparando la variante mixta de 4 bits con la de 8 bits y con el original, usando los 126 prompts retenidos como referencia.
- Auditoría de metodologías de abliteración: la publicación de `recipe.json` y de los ficheros de procedencia permite reproducir y auditar la receta de biproyección sobre capas 1-63 y verificar el efecto del reempaquetado ternario puro.
- Estudio de cuantización de precisión mixta: sirve como caso práctico de cómo un formato ternario rotado puede destruir una edición de pesos, y de por qué se necesitan loaders con anchuras de bits y tamaños de grupo por módulo.
- Evaluación comparativa de rechazos y tareas benignas: el par de métricas (126 rechazos / 24 tareas benignas) permite medir el coste colateral de la edición en modelos cuantizados a 2 bits.
- Generación de texto local en Apple Silicon mediante MLX: con 11,20 GB de pesos, es viable en equipos con memoria unificada suficiente, siempre que se use el loader incluido y no un cargador MLX genérico.
- Generación de datos sintéticos controlada: el comportamiento sin rechazos puede emplearse para producir corpus de texto sin filtrado, con la advertencia de que no existen benchmarks publicados que garanticen la calidad del contenido generado.
- Pruebas de compatibilidad de formato MLX: útil para validar herramientas propias de carga frente a un caso real de esquema con precisión mixta (perfil schema-2 con visión, que también admite uso solo texto).

## Benchmarks y rendimiento

El autor solo publica una tabla de criba heurística determinista, no benchmarks de inteligencia general. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Modelo | Rechazos / 126 | Tareas benignas superadas / 24 |
|---|---:|---:|
| Bonsai original | 123 | 22 |
| Mixed 4-bit (este repositorio) | 0 | 21 |
| Mixed 8-bit | 0 | 21 |

Configuración de la criba retenida: 96 tokens de salida, decodificación greedy, penalización de repetición 1.1 y ventana GGUF de 4096 tokens sobre una A100 de 80 GB. El checkpoint final intermedio en BF16 pasó su propia puerta de 126 prompts y 24 tokens con cero rechazos y 100% de aperturas utilizables. El autor advierte expresamente de que no deben extrapolarse las afirmaciones de inteligencia o throughput del modelo original a este derivado.

## Requisitos de hardware

- Peso del repositorio: 11,20 GB, incluyendo la torre de visión sin modificar. El autor advierte de que los pesos requieren memoria adicional de runtime y caché, y que el tamaño de fichero no es el requisito de RAM del dispositivo.
- VRAM estimada: no disponible. No se publican cifras de VRAM ni de memoria unificada mínima.
- GPU recomendadas: no disponibles. La única GPU mencionada es una A100 de 80 GB, usada para la criba de rechazos sobre GGUF, no como requisito de despliegue.
- Viabilidad en GPU de consumo: no confirmada. El formato es MLX, orientado a Apple Silicon; no hay datos de ejecución en CUDA.
- Opciones de despliegue: exclusivamente el loader de precisión mixta incluido en `runtime/` (`vision_artifact.load_vl_model` con `mlx_vlm`). Los loaders MLX genéricos y los loaders de Bonsai sin modificar no implementan este formato mixto correctamente. vLLM, llama.cpp, Ollama y TGI: no disponibles.
- Validación realizada por el autor: recarga estricta del modelo completo, una prueba de humo de generación aritmética en CPU Linux y comprobaciones numéricas independientes de capas empaquetadas. No se realizó validación en iPhone, Metal de macOS ni App Store. La integración completa en Swift/iOS queda como trabajo aparte.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el autor prohíbe aplicar las del modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos / 126 | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Este modelo (mixed-2/4bit) | 34,96 mil millones (recuento safetensors) | no disponible | 0 | apache-2.0 (MIT en el runtime) | safetensors MLX con loader propio; 11,20 GB; 0 descargas |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | no disponible | no disponible | 123 (Bonsai original) | no disponible en la información | safetensors MLX ternario; modelo base declarado |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | no disponible | no disponible | no disponible en la información | GGUF; commit 6ed5e12bf84b7a63069882c91dd9e9218647d17b |
| Qwen3.8-27B (origen de la cadena) | no disponible | no disponible | no disponible | no disponible en la información | no disponible |

No se dispone de datos sobre otras alternativas comparables de 27-35 mil millones de parámetros en formato MLX ternario, por lo que la comparativa se limita a la propia cadena de derivación.

## Limitaciones y advertencias

- Ausencia deliberada de alineación de seguridad: la abliteración elimina las direcciones de rechazo (0 de 126), por lo que el modelo puede producir contenido que el original rechazaría. No debe desplegarse en aplicaciones orientadas al público sin filtros externos.
- Cribas heurísticas, no evaluaciones de capacidades: los resultados publicados son pantallas deterministas de rechazo y de tareas benignas, no puntuaciones de inteligencia general ni de seguridad.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni de rendimiento multilingüe, de modo que no puede compararse cuantitativamente con alternativas.
- Rendimiento y throughput no caracterizados: el autor prohíbe expresamente trasladar las afirmaciones del modelo original a este derivado.
- Compatibilidad de carga restringida: los loaders MLX genéricos y los de Bonsai sin modificar no interpretan correctamente el formato de precisión mixta; usarlos puede producir resultados incorrectos o fallos silenciosos.
- Cobertura de validación parcial: no se validó en iPhone, en Metal de macOS ni en App Store, y la rama Swift/iOS queda pendiente. El comportamiento de visión no se reevaluó pese a conservarse los pesos.
- Discrepancia de nomenclatura: el nombre indica 27B, pero el recuento real de safetensors es de 34.955.088.112 parámetros; conviene verificar el tamaño antes de planificar recursos.
- Idiomas y contexto sin declarar: no se especifican idiomas soportados ni longitud máxima de contexto, lo que impide garantizar su comportamiento fuera del inglés o en secuencias largas.
- Repositorio sin tracción ni revisión externa: cero descargas y cero valoraciones, creado y actualizado el 21 de septiembre de 2026, sin evidencia de validación por terceros.
- Licencia: los pesos se declaran apache-2.0 y el runtime MIT, pero la cadena de derivación atraviesa Qwen3.8-27B; conviene revisar los términos aplicables del modelo original antes de un uso comercial.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-4bit
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (commit 3f926b415992eaa2ae9dd7b573706494d6bbf787)
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf (commit 6ed5e12bf84b7a63069882c91dd9e9218647d17b)
- Ficheros citados en la model card: `recipe.json`, `evaluation.json` y dos ficheros de procedencia, alojados en el propio repositorio.
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de transporte en autobús y no guardan relación con esta ficha. No se dispone de paper, blog, repositorio de código ni demo asociados.
