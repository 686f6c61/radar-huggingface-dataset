# diablomike20/Claude-Mythos-5-1

## Resumen

Claude-Mythos-5-1 es una cuantización GGUF del modelo Qwythos-9B-Claude-Mythos-5-1M, desarrollado por Empero AI y publicada en Hugging Face por el usuario diablomike20. Se trata de un modelo de razonamiento de 8.950 millones de parámetros (aproximadamente 9B) construido sobre la arquitectura Qwen3.5-9B, post-entrenado con más de 500 millones de tokens de trazas de cadena de pensamiento generadas internamente por la herramienta `rethink` de Empero AI. El modelo base declara mejoras sustanciales frente a Qwen3.5-9B en evaluaciones emparejadas: +34 puntos en MMLU, +30 en GSM8K estricto y +19 en GSM8K flexible.

La relevancia de esta publicación radica en que combina varias capacidades poco habituales en un modelo de 9B: ventana de contexto de 1.048.576 tokens (1M) mediante escalado YaRN habilitado por defecto, soporte nativo de function calling según la especificación Qwen3.5, multimodalidad de entrada imagen-texto heredada del modelo base (torre de visión congelada durante el SFT) y un modo de razonamiento con cadena de pensamiento. La cuantización GGUF permite ejecutarlo en llama.cpp, Ollama, LM Studio, jan y KoboldCpp, incluyendo variantes con cabeza MTP (multi-token prediction) para decodificación especulativa.

El repositorio ocupa 96,2 GB e incluye múltiples cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16) tanto en versión estándar como con MTP, además del proyector de visión `mmproj` en F16. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B (con cabeza MTP opcional y torre de visión CLIP-style) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN rope-scaling habilitado por defecto |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (cada una en versión estándar y con MTP) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9B parámetros derivado de Qwen3.5-9B. Sobre esa base, Empero AI realizó un post-entrenamiento de parámetros completos (full-parameter) con más de 500 millones de tokens de trazas de alta calidad estilo Claude Mythos / Claude Fable, con cadenas de pensamiento generadas internamente por la herramienta `rethink`. El entrenamiento SFT fue exclusivamente de texto: la torre de visión se mantuvo congelada, de modo que el comportamiento multimodal es idéntico al de Qwen3.5-9B base.

Entre las innovaciones técnicas destacables figuran: (1) el contexto extendido a 1M tokens mediante YaRN activado por defecto; (2) el soporte nativo de function calling conforme a la especificación Qwen3.5; (3) la restauración de la cabeza MTP (multi-token prediction) compatible con Qwen3.5 dentro de los GGUF, que permite decodificación especulativa con `--spec-type draft-mtp` en builds recientes de llama.cpp; y (4) un proyector de visión `mmproj` en F16 (0,92 GB) que se puede emparejar con cualquier cuantización de texto y es intercambiable con los `mmproj-*.gguf` de la comunidad para Qwen3.5-9B.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (modo reasoning).
- Razonamiento matemático reforzado (mejoras declaradas de +30 puntos en GSM8K estricto y +19 en GSM8K flexible frente al base).
- Conocimiento general y académico (mejora declarada de +34 puntos en MMLU).
- Function calling / tool calling nativo según la especificación Qwen3.5.
- Capacidades agénticas y razonamiento multi-paso (etiqueta `agentic`).
- Entrada de imágenes (image-text-to-text): descripción detallada, OCR impreso y manuscrito, lectura de gráficos y tablas, comprensión de interfaces y documentos, razonamiento espacial básico. Heredado sin cambios del base Qwen3.5-9B.
- Contexto largo de hasta 1M tokens para documentos extensos y conversaciones multi-turno prolongadas.
- Orientación a dominios de ciberseguridad y biomedicina (etiquetas `cybersecurity` y `biomedical`).
- Modelo "uncensored" según declaración del autor (sin filtrado explícito en el post-entrenamiento).
- Decodificación especulativa mediante cabeza MTP en las variantes correspondientes.
- Multilingüe: limitado al inglés según la model card.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir repositorios completos, manuales o expedientes y responder preguntas cruzadas sin truncar, algo inviable en modelos de 9B con ventanas de 8K-32K.
- Asistente de razonamiento matemático y científico: el refuerzo declarado en GSM8K y MMLU lo hace adecuado para tutoría, verificación de cálculos y resolución paso a paso de problemas, con la cadena de pensamiento visible para auditar el razonamiento.
- Automatización agéntica con herramientas: el function calling nativo Qwen3.5 permite integrarlo en orquestadores de agentes (llamadas a APIs, consultas a bases de datos, ejecución de comandos) con razonamiento multi-paso entre llamadas.
- Análisis de imágenes en flujos documentales: usando `llama-mtmd-cli` o el servidor OpenAI-compatible con `--mmproj`, se puede hacer OCR de facturas, extracción de tablas de capturas o descripción de diagramas técnicos.
- Evaluación de seguridad y ciberseguridad: la orientación declarada a ciberseguridad y su naturaleza sin censura lo hacen útil en laboratorios de análisis de vulnerabilidades, redacción de informes técnicos de threat intelligence y explicación de mecanismos bioquímicos o de exploits en entornos controlados.
- Despliegue local en estación de trabajo: con Q4_K_M (5,63 GB) cabe en GPUs consumer de 8 GB y permite asistentes de código o documentación offline con privacidad total, sin depender de APIs externas.
- Servicio de inferencia autoalojado: la variante MTP con `llama-server` y `--spec-type draft-mtp` reduce la latencia en generación larga, útil para chat de atención al cliente o generación de informes por lotes en infraestructura propia.

## Benchmarks y rendimiento

La model card del repositorio remite a la del modelo base para los números completos. Los únicos datos cuantitativos publicados en la información disponible son las mejoras relativas frente a Qwen3.5-9B en evaluación emparejada:

| Benchmark | Diferencia frente a Qwen3.5-9B base |
|---|---|
| MMLU | +34 puntos |
| GSM8K (strict) | +30 puntos |
| GSM8K (flex) | +19 puntos |

No se han publicado en la información disponible los valores absolutos de estos benchmarks ni resultados de HumanEval, MMLU-Pro, MATH u otros. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto):
  - Q4_K_M: 5,63 GB
  - Q5_K_M: 6,47 GB
  - Q6_K: 7,36 GB
  - Q8_0: 9,53 GB
  - BF16: 17,92 GB
  - Variantes MTP: añadir aproximadamente 0,25-0,5 GB sobre la equivalente estándar (Q4_K_M MTP: 5,89 GB; BF16 MTP: 18,41 GB).
  - Proyector de visión `mmproj` F16: 0,92 GB adicionales si se usa entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q6_K/Q8_0; A100/H100 para BF16 con contexto largo o servicio concurrente.
- Cabe en GPU consumer: sí. Q4_K_M y Q5_K_M caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); Q6_K y Q8_0 requieren 12-16 GB; BF16 requiere 24 GB o más. El contexto de 1M tokens consume KV cache adicional proporcional, por lo que contextos muy largos exigen VRAM extra o offloading a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama, LM Studio, jan, KoboldCpp y cualquier runtime GGUF compatible.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP permite decodificación especulativa (`--spec-draft-n-max 6`) en builds recientes de llama.cpp, lo que reduce la latencia de generación, aunque no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Claude-Mythos-5-1 (este) | ~9B | 1M (YaRN) | Apache 2.0 | GGUF | Razonamiento, visión heredada, MTP, function calling |
| Qwen3.5-9B (base) | ~9B | No disponible en la información | No disponible en la información | No disponible en la información | Referencia de comparación; el modelo declara +34 MMLU y +30 GSM8K strict sobre él |
| Qwythos-9B-Claude-Mythos-5-1M (base) | ~9B | 1M (YaRN) | Apache 2.0 | Safetensors (según repo base) | Modelo original sin cuantizar; misma arquitectura y capacidades |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables en la información proporcionada para ampliar la comparativa con alternativas de terceros.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al ser un modelo entrenado sobre trazas sintéticas de estilo Claude, puede heredar sesgos de esos datos y del corpus de Qwen3.5.
- Alucinación: modelo de razonamiento de 9B; el modo cadena de pensamiento no garantiza corrección factual. En dominios especializados (ciberseguridad, biomedicina) requiere verificación humana.
- Contexto: aunque declara 1M tokens vía YaRN, la calidad efectiva en contextos muy largos no está validada en la información disponible y el coste de KV cache es elevado.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se declara "uncensored" y está orientado a dominios sensibles (ciberseguridad, bioquímica de agentes nerviosos en los ejemplos de la model card); el despliegue en producción exige controles de uso y cumplimiento normativo propios.
- Visión: la torre es la del base Qwen3.5-9B sin ajuste; el comportamiento multimodal no mejora respecto al base, y el SFT no incluyó imágenes.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un usuario individual sobre un modelo base de un tercero; conviene validar la calidad de las cuantizaciones antes de usarlas en producción.
- MTP: requiere builds recientes de llama.cpp; en runtimes sin soporte hay que usar los ficheros estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/Claude-Mythos-5-1
- Modelo base (Qwythos-9B-Claude-Mythos-5-1M): https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Cuantizaciones GGUF del autor original: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Empero AI: https://empero.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Imagen del modelo: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M/resolve/main/assets/qwythos.png
