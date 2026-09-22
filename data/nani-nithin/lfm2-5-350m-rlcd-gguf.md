# NANI-Nithin/LFM2.5-350M-RLCD-GGUF

## Resumen

Este repositorio, publicado por el usuario NANI-Nithin, contiene una barrida completa de cuantizaciones GGUF generadas con llama.cpp (commit f3f1a8f) sobre el modelo notnotsamuel/LFM2.5-350M-RLCD. Ese modelo fuente empaqueta a su vez dos cosas: los pesos de LiquidAI/LFM2.5-350M sin modificar (revisión upstream 9e6c6ccf, verificada por checksums en el manifiesto del repositorio original) y un motor Python con licencia MIT para inferencia estructurada en paralelo, denominado RLCD. El resultado son 29 cuantizaciones más la conversión BF16, todas cortadas del mismo archivo BF16 y con la matriz de importancia calculada sobre BF16.

El modelo es un LFM2 de 354.483.968 parámetros (16 capas, tamaño oculto 1024, vocabulario de 65.536 tokens, solo texto) con soporte declarado para inglés, francés y español. Su relevancia práctica es que encaja en el segmento de modelos sub-500M ejecutables en CPU o en dispositivos sin GPU, donde el coste por inferencia y la huella de memoria priman sobre la calidad absoluta. Conviene subrayar una advertencia importante: estos GGUF contienen únicamente el modelo de lenguaje; el motor RLCD es código PyTorch y no se ejecuta sobre GGUF, de modo que quien quiera el método de inferencia paralela restringida debe acudir al repositorio fuente.

La cifra de rendimiento más citada del proyecto (entre 8,5 y 63 veces menos latencia extremo a extremo que la generación autorregresiva en un benchmark de extracción de 28 campos) corresponde al motor RLCD, no a estas cuantizaciones, y el propio autor aclara que la validez del JSON en ese escenario proviene del ensamblado programático en Python, no de mejores decisiones del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (clase Lfm2ForCausalLM); 16 capas; tamaño oculto 1024; mecanismo híbrido con atención y convolución (según la descripción del motor RLCD) |
| Parámetros totales | 354.483.968 (~354 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 29 quants GGUF más BF16: BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, Q2_0, IQ1_M, IQ1_S, Q1_0 |
| Idiomas soportados | inglés (en), francés (fr), español (es) |
| Licencia | lfm1.0 (LFM Open License de Liquid AI; etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 65.536 tokens |
| Modalidad | solo texto |
| Tamaño del repositorio | 6,3 GB |
| Rango de tamaños de archivo | de 0,09 GB (Q1_0) a 0,66 GB (BF16); Q4_K_M 0,21 GB; Q8_0 0,35 GB; IQ2_M 0,13 GB |
| Parámetros activos | no aplica (modelo denso, no MoE) |

## Arquitectura y entrenamiento

Los pesos son los de LiquidAI/LFM2.5-350M, byte a byte idénticos a la revisión upstream 9e6c6ccf, sin fine-tuning ni adaptadores añadidos. La especificación de origen es `Lfm2ForCausalLM`, con 16 capas, tamaño oculto 1024 y un vocabulario de 65.536 tokens. La descripción del motor RLCD menciona la reutilización del estado de atención y de convolución entre ramas candidatas, lo que apunta a una arquitectura híbrida con capas convolucionales y de atención, coherente con la familia LFM2 de Liquid AI. El número de tokens de entrenamiento, la composición del dataset y la existencia de fases de RLHF o DPO no están disponibles en la información proporcionada.

La innovación que acompaña al modelo fuente no está en los pesos, sino en el motor RLCD: se rellena el contexto una sola vez, se reutiliza el estado de atención y convolución entre candidatos, se puntúan en lote todos los valores permitidos por un esquema y se ensambla el JSON en Python. El autor reporta una reducción de latencia extremo a extremo de 8,5 a 63 veces frente a generación autorregresiva en un benchmark de extracción de 28 campos, con la salvedad explícita de que la validez sintáctica del JSON se debe al ensamblado programático. Este motor no está disponible en los archivos GGUF aquí publicados y requiere el repositorio fuente.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational` y las cuantizaciones se ejecutan como modelo de chat estándar en llama.cpp.
- Clasificación de texto: el repositorio declara la etiqueta `classification`, por lo que está pensado también para tareas de etiquetado, no solo de generación.
- Generación estructurada y decodificación restringida: las etiquetas `structured-generation` y `constrained-decoding` describen el caso de uso principal del proyecto fuente, aunque la garantía de formato en GGUF depende de gramáticas externas (por ejemplo, GBNF de llama.cpp) y no del propio modelo.
- Multilingüismo limitado: inglés, francés y español documentados; no hay datos sobre otros idiomas.
- Inferencia local y offline: compatible con llama.cpp y con un servidor compatible con la API de OpenAI.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades de visión ni de audio: el modelo es solo texto.
- No hay modo "thinking" ni capacidades especiales adicionales documentadas.

## Casos de uso

- Extracción de campos con gramática restringida: en llama.cpp se puede forzar la salida a una gramática GBNF para obtener JSON válido en tareas de extracción sobre documentos cortos. Es adecuado por el tamaño reducido, aunque hay que asumir que la corrección sintáctica la aporta la gramática, no la calidad del razonamiento del modelo.
- Clasificación por lotes en el edge: con archivos de 0,13 a 0,21 GB, el modelo se puede desplegar en CPU o en dispositivos sin GPU para etiquetar grandes volúmenes de texto donde el coste por inferencia es la restricción principal.
- Filtrado y preprocesado en pipelines de datos: sirve para descartar, etiquetar o resumir de forma muy breve cada documento antes de pasarlo a un modelo mayor, reduciendo el volumen que llega a la etapa cara.
- Chatbots offline o con requisitos de privacidad: `llama-server` expone un endpoint compatible con OpenAI, lo que permite montar asistentes conversacionales que no envían datos a la nube y que funcionan en hardware modesto.
- Traducción informal entre inglés, francés y español: el modelo cubre los tres idiomas declarados, lo que resulta útil para borradores, normalización de texto o prototipos multilingües de baja exigencia.
- Pruebas de infraestructura y medición del impacto de la cuantización: disponer de 29 quants cortados del mismo BF16 facilita comparar IQ2 frente a Q4 y Q8 en un pipeline llama.cpp sin ambigüedad de origen de los pesos.
- Docencia y experimentación: el tamaño permite reproducir experimentos de decodificación restringida, cuantización o evaluación en un portátil o en una Raspberry Pi.
- Aprovechamiento del motor RLCD: para extracción de esquemas con muchos campos donde la latencia importa, el camino adecuado es el repositorio fuente con PyTorch, no estas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes para estas cuantizaciones ni para el modelo base).

El único dato cuantitativo aportado es de latencia y corresponde al motor RLCD del repositorio fuente, no a los GGUF:

| Mediciones reportadas (motor RLCD, repo fuente) | Valor |
|---|---|
| Benchmark | extracción de 28 campos |
| Reducción de latencia extremo a extremo frente a generación autorregresiva | 8,5× a 63× |
| Origen de la validez del JSON | ensamblado programático en Python, no decisiones del modelo |
| Aplicable a estos GGUF | no (RLCD es código PyTorch) |

## Requisitos de hardware

- Huella de memoria: próxima al tamaño del archivo más el coste del runtime y de la caché KV. Con 354 M de parámetros y 16 capas, la caché KV es pequeña; a modo de referencia, Q4_K_M ocupa 0,21 GB, Q8_0 0,35 GB, BF16 0,66 GB e IQ2_M 0,13 GB.
- GPU: no requiere aceleradores de gama alta. No tiene sentido reservar A100 o H100 para este modelo; cualquier GPU consumer moderna (RTX 3060 o superior, GTX 1650, gráficas integradas recientes) sobra para BF16.
- GPU consumer: sí, cabe con holgura en cualquier GPU consumer, incluso en las de gama de entrada, y también en Apple Silicon.
- CPU y dispositivos embebidos: es plenamente ejecutable en CPU y, con las cuantizaciones IQ2 o Q2, en placas tipo Raspberry Pi u otros dispositivos con poca RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con endpoint compatible con OpenAI), importación en Ollama o LM Studio, y llamafile. El autor indica explícitamente que estos GGUF no se cargan en vLLM, SGLang o transformers como sí ocurre con el repositorio fuente.
- Latencia y throughput: no disponibles. Dependerán del hardware, del quant elegido y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NANI-Nithin/LFM2.5-350M-RLCD-GGUF | ~354 M | no disponible | lfm1.0 | GGUF (29 quants + BF16) | HuggingFace, 0 descargas y 0 likes |
| notnotsamuel/LFM2.5-350M-RLCD (repo fuente) | ~354 M | no disponible | pesos lfm1.0; motor RLCD bajo MIT | PyTorch / safetensors | HuggingFace |
| LiquidAI/LFM2.5-350M (upstream) | ~354 M | no disponible | lfm1.0 | PyTorch / safetensors | HuggingFace |
| Modelos sub-500M de otros fabricantes (por ejemplo, la familia SmolLM2-360M o Qwen2.5-0.5B) | ~361 M y ~494 M respectivamente | no disponible en la información proporcionada | Apache-2.0 (orientativo) | safetensors y GGUF | HuggingFace |

Las cifras de terceros son orientativas y deben verificarse en sus propias fichas. No hay datos de rendimiento comparado disponibles para este modelo, por lo que la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- Tamaño muy reducido: con 354 M de parámetros, la capacidad de razonamiento, matemáticas y generación de código es limitada frente a modelos de varios miles de millones, y la propensión a la alucinación es alta.
- Los GGUF contienen solo el modelo de lenguaje: el motor RLCD, que es el que aporta la ventaja de latencia, es código PyTorch y no funciona sobre estos archivos.
- La validez del JSON atribuida al método RLCD procede del ensamblado programático, no de mejores decisiones del modelo; no debe interpretarse como una mejora de calidad semántica.
- Idiomas: solo inglés, francés y español están documentados; el comportamiento en otras lenguas no está caracterizado.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificarla previamente.
- Licencia: lfm1.0, una licencia no estándar etiquetada como "other" en HuggingFace. Es imprescindible revisar su texto antes de cualquier uso comercial, ya que la información proporcionada no detalla sus términos.
- Cuantizaciones agresivas: por debajo de Q4 (Q3, IQ3, Q2, IQ2, Q1) la degradación es significativa; los quants Q1_0, IQ1_S e IQ1_M se describen como extremos y con pérdida sustancial de calidad.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, no incluye benchmarks y está publicado por un autor sin historial verificable; los pesos subyacentes sí proceden de Liquid AI.
- Sin soporte documentado de tool calling, function calling ni flujos de agentes, lo que limita su integración en pipelines que dependan de llamadas a herramientas.
- Fechas de creación y actualización registradas en septiembre de 2026, posteriores a la fecha habitual de consulta; conviene comprobar la vigencia de los enlaces.
- La búsqueda web realizada no devolvió información técnica relacionada: los resultados correspondían al futbolista Nani y a un programa de televisión, sin vinculación con el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/LFM2.5-350M-RLCD-GGUF
- Modelo base intermedio: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD
- Modelo upstream de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Texto de la licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/9e6c6ccf47cd318696e137d381a7ded8fe4df09f/LICENSE
- llama.cpp (herramienta de cuantización utilizada, commit f3f1a8f): https://github.com/ggml-org/llama.cpp
- Resultados de búsqueda web: no se encontraron enlaces técnicos relevantes; los resultados obtenidos trataban sobre el futbolista Nani y un programa de televisión.
