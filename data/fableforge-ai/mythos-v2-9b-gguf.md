# fableforge-ai/Mythos-V2-9B-GGUF

## Resumen

Mythos-V2-9B-GGUF es el conjunto oficial de cuantizaciones GGUF de fableforge-ai/Mythos-V2-9B, un modelo denso de 9.197.093.888 parámetros (≈9,2 B) derivado de Qwen3.5-9B y sometido a un post-entrenamiento orientado a dos objetivos declarados: eliminar el filtrado de contenido (etiqueta `uncensored`) y reforzar el uso de herramientas (`tool-use`). Lo publica el usuario fableforge-ai bajo licencia MIT, en formato GGUF listo para llama.cpp y Ollama, e incluye además la etiqueta `mlx` para entornos Apple Silicon.

El interés práctico del repositorio está en la matriz de cuantizaciones: cubre desde Q8_0 (~9,8 GB) hasta IQ1_S (~2,8 GB), pasando por el nivel recomendado por el autor, Q4_K_M (~5,7 GB). Eso permite ejecutar un modelo de casi 9,2 B en máquinas de 8-16 GB de RAM o VRAM, sin GPU dedicada en los niveles bajos, algo relevante para despliegues locales y entornos con requisitos estrictos de privacidad.

La información publicada es, no obstante, muy limitada: no se documentan longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). El autor solo aporta una evaluación interna sobre 22 prompts, con puntuaciones subjetivas de 5,0/5 en "censorship", 4,6/5 en tool-use y 4,0/5 en razonamiento. El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente de estas cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen3.5-9B segun la model card; incluye un bloque final NextN/MTP (`blk.32`) |
| Parametros totales | 9.197.093.888 (≈9,2 B) |
| Parametros activos | No aplica: modelo denso, no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_L, IQ3_XS, IQ3_XXS, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el repositorio lleva la etiqueta `mlx`, pero solo documenta ficheros GGUF |
| Tamano del repositorio | 131,9 GB |
| Pipeline declarado | conversational; `endpoints_compatible` |
| Fecha de creacion / actualizacion | 19-10-2026 / 21-10-2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo base como Qwen3.5-9B con post-entrenamiento adicional para eliminar restricciones de contenido y mejorar el uso de herramientas. No se detalla la arquitectura interna más allá de esa referencia, pero la presencia de un bloque `blk.32` descrito como "NextN/MTP" indica una capa de predicción multi-token (multi-token prediction) al final de la pila, un patrón habitual en modelos derivados de la familia Qwen para decodificación especulativa o entrenamiento auxiliar. El índice de bloques sugiere 33 bloques transformer en total, aunque el dato no se confirma explícitamente.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación aplicadas. El autor tampoco publica la receta de cuantización más allá de indicar que las cuantizaciones IQ (IQ1/IQ2/IQ3) usan una importance matrix calculada sobre 4,6 MB de texto general, un conjunto de calibración muy reducido. El bloque NextN/MTP se cuantiza a `q8_0` en esos ficheros porque, según el autor, no se ejercita durante la calibración de la imatrix.

## Capacidades

- Generación de texto conversacional multi-turno, con el modelo base Qwen3.5-9B como punto de partida.
- Tool calling / function calling: es uno de los dos ejes del post-entrenamiento y la métrica mejor puntuada por el autor (4,6/5 en su suite interna).
- Razonamiento en varios pasos: puntuación de 4,0/5 en la suite interna de 22 prompts; no hay resultados en benchmarks estándar de razonamiento.
- Generación sin filtrado de contenido (`uncensored`): el modelo está entrenado para no rechazar peticiones que un modelo alineado convencional rechazaría.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su integración en infraestructura de inferencia con API compatible con OpenAI.
- Ejecución local en CPU y en Apple Silicon (etiquetas `llama.cpp` y `mlx`).
- Capacidades multimodales (visión, audio), modo thinking explícito y cobertura multilingüe: no disponibles en la información publicada.

## Casos de uso

- Asistente conversacional autoalojado con tool calling: el modelo puede mantener diálogos multi-turno e invocar funciones (consultas a bases de datos, APIs internas) en despliegues donde los datos no pueden salir de la infraestructura de la organización; la licencia MIT elimina fricción legal para uso comercial interno.
- Agente de automatización de tareas en pipelines: con `endpoints_compatible` puede colocarse detrás de una API estilo OpenAI y encadenar pasos con llamadas a herramientas en flujos de automatización de back-office (generación de informes, enriquecimiento de registros, triaje de tickets).
- Procesamiento por lotes en CPU: la disponibilidad de niveles IQ3_XXS (~3,9 GB) e IQ2_XXS (~3,1 GB) permite clasificación, extracción y resumen de documentos en servidores sin GPU, a coste marginal bajo y con throughput moderado.
- Despliegue en estación de trabajo de 16 GB: con Q4_K_M (~5,7 GB) o Q6_K (~7,8 GB) cabe en GPU de consumo y deja margen para el contexto y para el propio sistema operativo, lo que sirve para prototipado rápido sin infraestructura dedicada.
- Evaluación de robustez y red-teaming: al ser un modelo explícitamente `uncensored`, resulta útil como caso de estudio en investigación sobre alineación, tasas de rechazo y comportamientos indeseados, comparándolo con su base alineada.
- Prototipado en Apple Silicon: la etiqueta `mlx` y el tamaño de los ficheros Q4/IQ3 permiten ejecutar el modelo en portátiles Mac con memoria unificada de 16 GB o más para demos y pruebas de concepto.
- Generación de código y scripting asistido dentro de herramientas: el soporte de tool-use habilita integraciones en editores o CLI que necesiten llamar a funciones del entorno; no hay benchmarks de código publicados que respalden esta capacidad.

## Benchmarks y rendimiento

El autor solo publica una evaluación interna sobre 22 prompts, sin detallar el conjunto de pruebas, el protocolo de puntuación ni el evaluador. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar en la información disponible.

| Metrica (suite interna de 22 prompts, autoevaluada) | Puntuacion |
|---|---|
| Censorship (ausencia de rechazos) | 5,0 / 5 |
| Tool-use | 4,6 / 5 |
| Reasoning | 4,0 / 5 |
| Total | 13,6 / 15 |

Estos valores son declaraciones del autor, no mediciones reproducibles ni comparables con otras publicaciones. No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamano de fichero; hay que sumar el espacio de contexto y el overhead de la CPU/GPU):
  - Q8_0 ≈ 9,8 GB; Q6_K ≈ 7,8 GB; Q5_K_M ≈ 6,7 GB.
  - Q4_K_M ≈ 5,7 GB (recomendado por el autor); Q4_K_S ≈ 5,5 GB.
  - Q3_K_M ≈ 4,8 GB; Q3_K_L ≈ 5,1 GB; IQ3_XS ≈ 4,2 GB; IQ3_XXS ≈ 3,9 GB.
  - IQ2_S ≈ 3,4 GB; IQ2_XS ≈ 3,3 GB; IQ2_XXS ≈ 3,1 GB; IQ1_S ≈ 2,8 GB (experimental, 1,5 bpw).
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, Q4_K_M y Q5_K_M encajan en GPU de consumo con 8-12 GB de VRAM (RTX 3060 Ti/4060 Ti 8 GB con contexto corto, RTX 4070/4080 12-16 GB con holgura); Q6_K y Q8_0 requieren 12-16 GB o más; para despliegues con contexto largo o varias instancias concurrentes son adecuadas A100 40/80 GB o H100, aunque el modelo no aprovecha ese hardware a nivel de rendimiento por su tamano.
- Cabe en GPU de consumo: si, desde Q4_K_S hacia abajo en tarjetas de 8 GB con contexto reducido; los niveles IQ2/IQ3 permiten incluso ejecución integra en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama mediante Modelfile, ambos documentados por el autor. La etiqueta `mlx` sugiere compatibilidad con MLX en Apple Silicon. Soporte en vLLM o TGI para GGUF no está documentado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, el autor advierte degradación de calidad visible en IQ2 y "fuertemente degradada" en IQ1_S, y senala IQ2_XXS como el nivel mas bajo usable para prompts de tool-use.

## Comparativa con modelos similares

No se dispone de datos de contexto, idiomas ni benchmarks del modelo evaluado, por lo que la comparacion se limita a parametros, licencia y disponibilidad de cuantizaciones.

| Modelo | Parametros | Contexto | Licencia | Formato / cuantizaciones | Benchmarks publicados |
|---|---|---|---|---|---|
| Mythos-V2-9B (este modelo) | 9,20 B | No disponible | MIT | GGUF (13 niveles, Q8_0 a IQ1_S) | Solo suite interna de 22 prompts |
| Qwen3-8B (familia del base declarado) | 8,2 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors, GGUF, MLX | Si, MMLU/HumanEval/GSM8K publicados por el autor |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Si |
| Mistral 7B v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Si |

La ventaja diferencial de Mythos-V2-9B frente a estas alternativas es la licencia MIT combinada con el post-entrenamiento `uncensored`; su desventaja es la ausencia total de documentacion tecnica y de evaluacion estandarizada, frente a modelos con model cards detalladas y resultados verificables.

## Limitaciones y advertencias

- Modelo `uncensored`: no incorpora (o ha reducido deliberadamente) los mecanismos de rechazo del base, por lo que puede generar contenido sensible, ofensivo o potencialmente danino. No es apto para aplicaciones de cara al publico sin una capa de moderacion propia.
- Ausencia de alineacion documentada: no se detalla si hubo RLHF, DPO o filtrado de datos; no es posible evaluar el riesgo de fuga de datos de entrenamiento ni de comportamientos indeseados.
- Riesgo de alucinacion no cuantificado: sin benchmarks de fidelidad ni de QA, no hay evidencia sobre la tasa de afirmaciones incorrectas.
- Idiomas y contexto desconocidos: no se puede garantizar calidad en castellano ni planificar cargas con ventanas largas; el rendimiento fuera del ingles es una incognita.
- Validacion nula: 0 descargas y 0 likes en el repositorio; las unicas metricas provienen del propio autor, sobre 22 prompts y sin protocolo detallado.
- Cuantizaciones de baja precision: el autor advierte degradacion visible en IQ2 y degradacion fuerte en IQ1_S (1,5 bpw). En IQ1/IQ2/IQ3 la importance matrix se calculo sobre solo 4,6 MB de texto, un conjunto de calibracion muy pequeno que puede producir perdida de calidad desigual por dominio.
- El bloque NextN/MTP (`blk.32`) se fuerza a `q8_0` en las cuantizaciones IQ, lo que rompe la uniformidad de bits por peso y complica estimaciones teoricas de calidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y aviso de copyright; se distribuye sin garantia alguna, por lo que la responsabilidad legal y de cumplimiento recae en el desplegador.
- Fechas de los metadatos (octubre de 2026) y tamano del repositorio (131,9 GB, muy superior a la suma de los ficheros documentados) no se explican en la model card; conviene verificar el contenido real del repositorio antes de descargarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fableforge-ai/Mythos-V2-9B-GGUF
- Modelo base: https://huggingface.co/fableforge-ai/Mythos-V2-9B
- Papers, blogs, repositorios o demos adicionales: no disponibles. Los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con el modelo (corresponden a definiciones del verbo frances "epiner").
