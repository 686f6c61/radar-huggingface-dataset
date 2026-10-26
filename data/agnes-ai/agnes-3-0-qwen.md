# Agnes-AI/Agnes-3.0-Qwen

## Resumen

Agnes-3.0-Qwen es un modelo multimodal de razonamiento publicado con pesos abiertos por Agnes AI, un fine-tune del modelo base Qwen/Qwen3.8-Flash-Next. Está diseñado específicamente para cargas de trabajo agénticas: uso de herramientas, codificación en terminal, resolución de problemas científicos y análisis de documentos largos con soporte de imagen y vídeo además de texto. Su ventana de contexto alcanza 1.000.000 de tokens y permite seleccionar el esfuerzo de razonamiento (`xhigh`, `medium`, `low`) según el coste y la latencia que admita el despliegue.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) que combina capas de atención lineal con capas de atención completa, 512 expertos con 10 activos por token y una cabeza de predicción multi-token. El recuento real de parámetros en safetensors es de 179.999.981.459 (~180.000 millones), lo que lo sitúa en la franja de los 180B totales, con un número de parámetros activos por token no declarado en la información disponible.

Su relevancia inmediata es doble: por un lado, compite en la tabla de benchmarks publicada por el autor contra sistemas propietarios de la gama de GPT-5.6 Sol, Gemini 3.8 Flash o Claude Opus 4.8, con resultados cercanos o superiores en tareas agénticas concretas (τ³-Banking, Terminal-Bench 2.1); por otro, se distribuye como pesos abiertos bajo licencia qwen-community-1.0, lo que permite su despliegue en infraestructura propia. Todos los resultados de la comparativa son autodeclarados por el autor y no han sido verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención lineal + atención completa con mezcla de expertos (MoE) de 512 expertos (10 activos por token) y cabeza de predicción multi-token |
| Parámetros totales | 179.999.981.459 (~180.000 M) |
| Parámetros activos | No disponible (la model card indica 512 expertos con 10 activos por token, sin cifra de parámetros activos) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | qwen-community-1.0 (etiquetada como `license:other` en HuggingFace) |
| Formato de pesos | safetensors (repositorio de 360 GB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Pipeline declarado | image-text-to-text |
| Modalidades de entrada | Texto, imagen y vídeo |
| Esfuerzo de razonamiento | Seleccionable: `xhigh`, `medium`, `low` |
| Descargas / likes | 352 descargas, 20 likes |
| Fecha de publicación | 10 de octubre de 2026 (última actualización: 11 de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas de atención lineal con capas de atención completa, una combinación habitual para sostener ventanas de contexto muy largas sin que el coste cuadrático de la atención completa se dispare. Sobre esa columna vertebral se monta una mezcla de expertos de 512 expertos con 10 activos por token, lo que desacopla la capacidad total (~180.000 M de parámetros) del coste computacional por token. Se añade una cabeza de predicción multi-token, orientada a mejorar el throughput de decodificación y a servir como base para técnicas de decodificación especulativa. La torre multimodal habilita entrada de imagen y vídeo, coherente con la etiqueta `image-text-to-text` del repositorio.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, las etapas de post-entrenamiento (RLHF, DPO u otras) ni el proceso de ajuste fino a partir de Qwen3.8-Flash-Next. La etiqueta `qwen4_exp` presente en el repositorio no viene explicada en la model card. Tampoco se documentan innovaciones adicionales de inferencia más allá de la mencionada cabeza de predicción multi-token y de los niveles de esfuerzo de razonamiento, que permiten al operador ajustar el presupuesto de cómputo en tiempo de generación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable en tres niveles de esfuerzo (`xhigh`, `medium`, `low`).
- Comprensión multimodal: procesa texto, imágenes y vídeo como entrada, según la model card y el pipeline `image-text-to-text`.
- Codificación y trabajo en terminal: evaluación explícita en Terminal-Bench 2.1 y 4.0, además de SciCode para código científico.
- Uso de herramientas y function calling, con orientación declarada a flujos agénticos.
- Comportamiento agéntico en dominios transaccionales: la model card reporta resultados en τ³-Banking, un benchmark de uso de herramientas con políticas de negocio.
- Análisis de documentos largos y contexto extenso: 1M de tokens permite ingerir informes completos, repositorios o transcripciones sin troceado agresivo.
- Cumplimiento de instrucciones: el autor afirma que supera a GPT-5.6 Sol (Max) y Claude Opus 4.8 (Max) en IFBench, sin publicar cifras.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio; no se declara soporte de español.
- Disponibilidad vía API además de pesos abiertos, con documentación propia en el wiki del proveedor.

## Casos de uso

- Atención al cliente con políticas de negocio: el modelo puede gestionar conversaciones multi-turno y ejecutar acciones sobre sistemas internos (consultas de saldo, cancelaciones, devoluciones) apoyándose en tool calling y en los 1M de tokens de contexto para arrastrar el histórico completo de la sesión y la documentación de políticas.
- Automatización de operaciones en terminal: integrado en un agente que interpreta instrucciones en lenguaje natural y ejecuta comandos, depura fallos y valida resultados; los 87,8 puntos en Terminal-Bench 2.1 lo sitúan como candidato razonable frente a alternativas propietarias en este tipo de tareas.
- Asistencia a la investigación científica: generación y revisión de código numérico y pipelines experimentales, con lectura simultánea de artículos, figuras y cuadernos de laboratorio gracias a la entrada de imagen y a la ventana de contexto larga.
- Análisis documental masivo: auditoría de contratos, expedientes o informes anuales de cientos de páginas, incluyendo tablas y gráficos escaneados, sin necesidad de pipelines de chunking y recuperación.
- Agentes de CI/CD y mantenimiento de repositorios: revisión de pull requests, generación de parches y triaje de fallos de test dentro de un pipeline, usando el nivel de razonamiento `low` o `medium` para contener coste y latencia.
- Extracción estructurada de información desde vídeo e imágenes: por ejemplo, inspección de grabaciones industriales o revisión de capturas de pantalla para poblar bases de datos operativas.
- Copiloto interno de ingeniería sobre documentación corporativa: indexación de manuales técnicos y wikis en la ventana de contexto para responder con trazabilidad a la fuente.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras de agnes-3.0-qwen son autodeclaradas por el autor; las de los modelos comparados proceden de informes públicos según la propia model card.

| Benchmark | agnes-3.0-qwen | GPT-5.6 Sol (Max) | Gemini 3.8 Flash | DeepSeek V4 Flash (Max) | MiniMax-M3 | Claude Opus 4.8 (Max) | Qwen3.8 Max (0902) |
|---|---|---|---|---|---|---|---|
| GDP.pdf | 16,0 | 27,2 | 21,0 | 12,8 | 9,8 | 22,8 | 22,8 |
| τ³-Banking | 48,0 | 44,3 | 44,9 | 39,4 | 15,3 | 34,2 | 47,8 |
| Terminal-Bench 2.1 | 87,8 | 88,0 | 87,6 | 78,7 | 65,2 | 84,6 | 88,8 |
| Terminal-Bench 4.0 | 26,1 | 39,9 | 19,7 | 12,1 | 2,0 | 21,7 | 38,9 |
| SciCode | 56,1 | 57,1 | 56,6 | 51,9 | 47,1 | No disponible (dato truncado) | No disponible (dato truncado) |

Observaciones sobre la tabla:

- La información proporcionada se interrumpe en la fila de SciCode, por lo que no se dispone del resto de benchmarks que el autor incluye en la imagen de evaluación (MMLU, HumanEval, GSM8K u otros no aparecen en el texto disponible).
- En IFBench el autor afirma superar a GPT-5.6 Sol (Max) y Claude Opus 4.8 (Max), pero no se aportan cifras numéricas en la información disponible.
- El modelo lidera la comparativa en τ³-Banking (48,0) y queda a 0,2 puntos del mejor sistema en Terminal-Bench 2.1, mientras que en GDP.pdf y Terminal-Bench 4.0 se sitúa por detrás de GPT-5.6 Sol y Qwen3.8 Max.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 360 GB solo para pesos, según el tamaño del repositorio, más caché KV para contextos largos. Requiere varios aceleradores de 80 GB (del orden de 5 o más H100/A100 80 GB) para servir con comodidad.
- VRAM estimada en FP8: aproximadamente 180 GB de pesos, lo que encaja en configuraciones de 3× H100 80 GB o 2× H200 141 GB.
- Cuantización de 4 bits: del orden de 90-100 GB de pesos, viable en 2× H100 80 GB, en una H200 141 GB o en una única GPU con 96 GB o más; no se han publicado pesos cuantizados oficiales, por lo que habría que generarlos.
- GPU consumer: no cabe en GPU de consumo en BF16 ni en FP8. Con cuantización agresiva a 4 bits no cabría en una RTX 4090 (24 GB); sería necesario repartir entre varias GPU o recurrir a la API del proveedor.
- Opciones de despliegue: al no haber variantes GGUF ni cuantizaciones publicadas, las vías realistas son servidores con soporte de safetensors y MoE multimodal (vLLM, TGI o SGLang, sujeto a que soporten la arquitectura híbrida y la cabeza multimodal) y, en su defecto, la API de Agnes AI. llama.cpp y Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles. Los parámetros activos por token no se han publicado, por lo que no es posible estimar el coste de cómputo por token a partir de los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| agnes-3.0-qwen | ~180.000 M (MoE, 512 expertos, 10 activos) | 1.000.000 tokens | qwen-community-1.0 | Pesos abiertos en safetensors + API | Lidera τ³-Banking (48,0) en el conjunto comparado |
| Qwen3.8 Max (0902) | No disponible | No disponible | No disponible | No disponible | Mejor resultado del conjunto en Terminal-Bench 4.0 (38,9); 47,8 en τ³-Banking |
| GPT-5.6 Sol (Max) | No disponible | No disponible | Propietaria | Solo API | Mejor cifra en GDP.pdf (27,2) y Terminal-Bench 4.0 (39,9) |
| Claude Opus 4.8 (Max) | No disponible | No disponible | Propietaria | Solo API | 84,6 en Terminal-Bench 2.1; 22,8 en GDP.pdf |
| Gemini 3.8 Flash | No disponible | No disponible | Propietaria | Solo API | 44,9 en τ³-Banking; 19,7 en Terminal-Bench 4.0 |
| DeepSeek V4 Flash (Max) | No disponible | No disponible | No disponible | No disponible | 78,7 en Terminal-Bench 2.1 |
| MiniMax-M3 | No disponible | No disponible | No disponible | No disponible | Resultado más bajo del conjunto en Terminal-Bench 2.1 (65,2) y 4.0 (2,0) |

La comparación solo puede establecerse en términos de resultados de benchmark y disponibilidad de pesos: la información proporcionada no incluye parámetros, contexto ni licencia de los modelos de referencia, por lo que esas celdas quedan como no disponibles.

## Limitaciones y advertencias

- Todos los resultados de benchmark de agnes-3.0-qwen son autodeclarados por el autor y no consta verificación independiente; conviene tratarlos como indicativos hasta replicarlos.
- La model card disponible está truncada: faltan filas de la tabla de benchmarks y probablemente secciones de entrenamiento, sesgos y uso responsable.
- Idiomas declarados: únicamente inglés y chino. No hay soporte declarado de español ni de otras lenguas, lo que limita su uso en producción en mercados hispanohablantes sin evaluación previa.
- Riesgo de alucinación no cuantificado: no se han publicado tasas de factualidad ni evaluaciones de hallucinations en la información disponible.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgo demográfico, político o cultural, ni el proceso de alineación aplicado.
- Licencia qwen-community-1.0 (etiquetada como `other`): no es una licencia OSI; los términos concretos de uso comercial, redistribución y restricciones de aceptación deben revisarse en el archivo LICENSE antes de cualquier despliegue productivo.
- Requisitos de hardware muy elevados (~360 GB en BF16): el coste de inferencia propia es alto y no hay cuantizaciones oficiales publicadas que lo reduzcan.
- Al ser un fine-tune de Qwen3.8-Flash-Next, hereda las limitaciones del modelo base, que no se detallan en la información disponible.
- La ventana de 1M de tokens no garantiza recuperación efectiva de información en todo el rango; no se han publicado evaluaciones tipo needle-in-a-haystack en la información disponible.
- Madurez del ecosistema: el modelo se publicó el 10 de octubre de 2026 y solo acumula 352 descargas, por lo que el soporte en frameworks de inferencia puede ser limitado o inexistente.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo: los enlaces encontrados corresponden al nombre propio "Agnès", a una marca de ropa y a una cantante, sin relación con Agnes AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Sitio web de Agnes AI: https://agnes-ai.com/
- Documentación de la API de agnes-3.0-qwen: https://wiki.agnes-ai.com/en/docs/agnes-30-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Página de campaña de Agnes AI: https://agnes-ai.com/campaign
- Paper técnico: no disponible en la información proporcionada.
- Repositorio de código o demo adicional: no disponible en la información proporcionada.
