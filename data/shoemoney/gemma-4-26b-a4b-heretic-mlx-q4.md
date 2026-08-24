# shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q4

## Resumen

El modelo `shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q4` es una cuantización en 4 bits (MLX) de la variante "heretic" del modelo Gemma 4 26B A4B de Google DeepMind, publicada por el usuario shoemoney en Hugging Face. La variante "heretic" (etiquetada como *uncensored*) elimina o reduce los mecanismos de alineación de seguridad del modelo base, ofreciendo respuestas sin filtros de contenido. Esta versión MLX está optimizada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`, lo que la hace especialmente útil para desarrolladores que trabajan en ecosistemas macOS.

El modelo base, `coder3101/gemma-4-26B-A4B-it-heretic`, es un modelo de lenguaje multimodal (texto e imagen) con arquitectura de mezcla de expertos (MoE) de 26 mil millones de parámetros totales y 4 mil millones activos. La cuantización 4-bit reduce el tamaño en disco a 15,37 GB, permitiendo su ejecución en equipos con memoria unificada moderada. La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial y la redistribución.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece capacidades multimodales de última generación en un formato compacto y eficiente para Apple Silicon; por otro, su carácter "sin censura" lo hace atractivo para investigación en seguridad de IA, generación creativa sin restricciones y análisis de comportamientos no alineados. Sin embargo, esta misma característica implica riesgos importantes que deben considerarse antes de su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), multimodal (texto e imagen) |
| Parametros totales | 26B (nominal) / 4.514.678.350 (según safetensors) |
| Parametros activos | 4B (según nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (grupo de 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con arquitectura de mezcla de expertos (MoE), donde de los 26B parámetros totales solo se activan 4B por token. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional. El modelo acepta entradas de texto e imagen y genera texto, siguiendo el diseño de la familia Gemma 4 de Google DeepMind.

La variante "heretic" se deriva del modelo oficial `google/gemma-4-26B-A4B-it` mediante un proceso de desalineación (no documentado en detalle) que elimina los mecanismos de rechazo de contenido. El autor de la cuantización, shoemoney, convirtió los pesos BF16 a 4-bit usando `mlx_vlm.convert` con grupo de cuantización de 64, sin realizar fine-tuning ni re-alineación. El proceso de conversión está documentado en la model card con el comando exacto utilizado.

No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de desalineación aplicado para crear la variante "heretic". La perplejidad medida en el conjunto `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens) es de 168,023, lo que indica una degradación significativa respecto al modelo original, probablemente debida a la cuantización agresiva.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto para generar respuestas descriptivas, analíticas o creativas.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona explícitamente, aunque el modelo base de Gemma 4 podría tener capacidades de razonamiento).
- Capacidades multilingües: no disponible (el modelo base de Google soporta múltiples idiomas, pero no se especifica para esta variante).
- Capacidades especiales: al ser una versión "uncensored", no aplica filtros de contenido, lo que permite generar texto sobre temas que el modelo base rechazaría. Es un modelo multimodal (visión y lenguaje).
- Optimización para Apple Silicon: gracias a la cuantización MLX, puede ejecutarse de forma eficiente en Mac con chip M-series.

## Casos de uso

- Generación creativa sin restricciones: el modelo puede producir narrativas, poesía o guiones sobre temas tabú o controvertidos que otros modelos rechazarían, útil para escritores que exploran límites creativos.
- Investigación en seguridad de IA: permite estudiar comportamientos no alineados, identificar sesgos latentes y evaluar riesgos de modelos sin censura en entornos controlados.
- Análisis de imágenes médicas o técnicas: al ser multimodal, puede describir y analizar imágenes (radiografías, diagramas, fotografías) en contextos donde no se requiera cumplimiento normativo estricto.
- Desarrollo de asistentes de documentación técnica: puede generar descripciones de figuras, esquemas o capturas de pantalla en manuales y guías, aprovechando su capacidad de visión.
- Prototipado rápido en macOS: desarrolladores que trabajan en entornos Apple pueden integrar el modelo en aplicaciones locales mediante `mlx-vlm` para pruebas de concepto sin depender de servicios en la nube.
- Evaluación de cuantización: sirve como referencia para medir el impacto de la cuantización 4-bit en la calidad de salida de modelos MoE multimodales, comparando con versiones BF16 o de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas internas de la familia de cuantizaciones:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras) | 168,023 |
| Perplejidad relativa al mejor escalón de la familia | 1,67× |
| Throughput (1 request) | 43,8 tok/s |
| Throughput (8 requests concurrentes) | 143,8 tok/s |

Estas métricas se midieron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplejidad solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 15,37 GB en disco, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon. Para ejecución cómoda con contexto largo, se sugiere 32 GB o más.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada. El modelo fue probado en M3 Ultra con 96 GB.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que MLX está diseñado exclusivamente para Apple Silicon. En otras plataformas se necesitaría convertir a otro formato (GGUF, etc.), lo que no está disponible.
- Opciones de despliegue: mediante `mlx-vlm` (librería oficial de Apple para modelos de visión-lenguaje). No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: 43,8 tok/s en generación secuencial y 143,8 tok/s con 8 peticiones concurrentes, medidos en M3 Ultra.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada. Sin embargo, se pueden identificar alternativas en la misma categoría:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (oficial) | 26B totales, 4B activos | no disponible | Apache 2.0 | BF16 |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 26B totales, 4B activos | no disponible | Apache 2.0 | QAT 4-bit |
| shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q4 (este) | 26B totales, 4B activos (según nombre) | no disponible | Apache 2.0 | MLX 4-bit |

La diferencia principal frente al modelo oficial es la eliminación de la alineación de seguridad y la cuantización MLX. No se dispone de métricas comparativas de calidad entre estas variantes.

## Limitaciones y advertencias

- Contenido sin censura: al ser una versión "uncensored", el modelo puede generar texto ofensivo, peligroso o ilegal. No debe desplegarse en aplicaciones orientadas al público sin supervisión humana y filtros adicionales.
- Degradación por cuantización: la perplejidad de 168,023 es muy alta, lo que sugiere respuestas incoherentes o de baja calidad en comparación con el modelo BF16 original. No es recomendable para tareas que requieran precisión.
- Sesgos y alucinaciones: no se han evaluado sesgos específicos, pero al ser un modelo desalineado, es probable que amplifique sesgos presentes en los datos de entrenamiento y que alucine con mayor frecuencia.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que dificulta su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial de una variante "uncensored" puede plantear problemas legales o éticos dependiendo de la jurisdicción y el caso de uso.
- Soporte limitado: el modelo solo funciona con `mlx-vlm` en Apple Silicon. No hay versiones para CUDA, ROCm u otras plataformas.
- Sin mantenimiento: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no hay comunidad activa ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q4
- Modelo base (variante heretic): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo oficial de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Análisis de rendimiento (Artificial Analysis): https://artificialanalysis.ai/models/gemma-4-26b-a4b
- Documentación en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
