# QubaxAI/Qwen3-8B-GGUF

## Resumen

QubaxAI/Qwen3-8B-GGUF es una compilación en formato GGUF del modelo Qwen/Qwen3-8B, publicada por el usuario QubaxAI. Se trata de un artefacto listo para ejecución local con llama.cpp, Ollama y LM Studio: el repositorio contiene un único archivo, `Qwen3-8B-Q4_K_M.gguf`, de aproximadamente 4,7 GB (el repositorio completo ocupa 5,0 GB), correspondiente a una cuantización de 4 bits del modelo base.

El modelo subyacente, Qwen3-8B, es un transformer decoder denso de 8.190.735.360 parámetros desarrollado por el equipo Qwen de Alibaba. Incorpora un modo de razonamiento explícito activable o desactivable mediante el chat template, una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 con escalado YaRN, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica es que permite ejecutar un modelo de 8B con capacidades de razonamiento y generación de código en una GPU de consumo o incluso en CPU, sin depender de una API externa. Conviene señalar que este repositorio concreto no publica resultados de evaluación, no documenta el proceso de cuantización ni incluye sumas de verificación, y en el momento de la consulta acumula 0 descargas y 0 likes. La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (causal LM) con GQA, SwiGLU, RMSNorm y RoPE; el repositorio distribuye únicamente el artefacto cuantizado |
| Parámetros totales | 8.190.735.360 (dato del modelo base, safetensors) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con YaRN (según especificación del modelo base) |
| Tipos de cuantización | Solo Q4_K_M publicada en este repositorio; otras cuantizaciones no disponibles (generables localmente con llama.cpp a partir del modelo base) |
| Idiomas soportados | No disponibles en la información del repositorio; el modelo base Qwen3-8B declara soporte de 119 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-8B-Q4_K_M.gguf`, ~4,7 GB); el modelo base se distribuye en safetensors |
| Librería declarada | gguf |
| Tamaño del repositorio | 5,0 GB |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only con 36 capas, dimensión oculta de 4096, 32 cabezas de atención y 8 cabezas de clave/valor (atención con consultas agrupadas, GQA), lo que reduce el coste de la caché KV en un factor de 4 respecto a atención multi-cabeza completa. Emplea normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE) con escalado YaRN para extender el contexto. No es un modelo MoE: no hay parámetros activos ni enrutado de expertos.

Qwen3-8B se preentrenó sobre un corpus de aproximadamente 36 billones de tokens según la documentación pública del modelo base, con cobertura multilingüe. El post-entrenamiento del modelo base incluye un pipeline en varias fases (arranque en frío con cadenas de razonamiento largas, refuerzo sobre razonamiento, fusión del modo thinking con el modo directo y refuerzo general), del que resultan los dos modos de operación: razonamiento extendido y respuesta directa. Este repositorio no documenta el proceso de cuantización aplicado: se desconoce si se usó una matriz de importancia (imatrix), qué versión de llama.cpp se empleó y qué métricas de degradación (perplejidad, divergencia KL) se midieron. Esos datos figuran como no disponibles.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat compatible con Qwen3.
- Modo de razonamiento (thinking) activable o desactivable por petición mediante el chat template, útil para matemáticas, lógica y depuración de código.
- Generación y revisión de código en múltiples lenguajes, con soporte de relleno intermedio (fill-in-the-middle) en el modelo base.
- Razonamiento matemático y resolución de problemas paso a paso en modo thinking.
- Tool calling / function calling mediante el formato soportado por el chat template de Qwen3, integrable en llama-server.
- Flujos de agente con varios pasos y llamadas encadenadas a herramientas, con la limitación de que el modelo no orquesta por sí mismo el bucle del agente.
- Capacidad multilingüe heredada del modelo base (119 idiomas declarados por el autor del modelo base; no confirmada en este repositorio).
- Extracción de información estructurada mediante gramáticas GBNF en llama.cpp (salida JSON forzada).
- No dispone de visión, audio ni modalidad distinta del texto.

## Casos de uso

- Asistente de programación en portátil: con 4,7 GB de pesos, el modelo cabe en GPU de 8-12 GB y permite autocompletado, explicación de código y generación de tests sin conexión; el modo thinking mejora la resolución de errores no triviales.
- Atención al cliente on-premise: despliegue con llama-server en una máquina propia para sectores con requisitos de confidencialidad (sanidad, legal), manteniendo el contexto de conversación dentro de la ventana de 32.768 tokens.
- RAG sobre documentación interna: el contexto de 32.768 tokens admite recuperar entre 15 y 25 fragmentos de 1.000-1.500 tokens junto con las instrucciones del sistema, suficiente para manuales técnicos y bases de conocimiento departamentales.
- Agentes con tool calling en entornos controlados: consulta de bases de datos, ticketing o APIs internas exponiendo las herramientas por el servidor OpenAI-compatible de llama.cpp, con verificación humana en las acciones irreversibles.
- Revisión de código en CI/CD: integración del binario en un job que resuma el diff de un pull request y señale problemas; el coste marginal es cero y no se envían fuentes a terceros.
- Extracción de datos estructurados a escala: uso de gramáticas GBNF para forzar JSON válido en la clasificación de correos, facturas o incidencias, sin necesidad de post-procesado heurístico.
- Tutoría y generación de material didáctico: el modo thinking permite mostrar el desarrollo de un problema antes del resultado, útil en entornos educativos sin acceso a internet.
- Prototipado en hardware modesto: ejecución en CPU con 16 GB de RAM o en equipos tipo Raspberry Pi 5 para demos, pruebas de concepto y filtrado de texto de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye ninguna tabla de evaluación (MMLU, MMLU-Pro, GPQA, HumanEval, GSM8K ni equivalentes), ni mediciones de perplejidad de la cuantización Q4_K_M respecto a los pesos originales. Tampoco se aportan datos de latencia o throughput. El modelo base Qwen3-8B publica resultados de evaluación en su propia model card, pero esas cifras corresponden a los pesos sin cuantizar y no se reproducen aquí al no estar incluidas en la información proporcionada.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros y de la configuración de atención del modelo base (36 capas, 8 cabezas KV, dimensión de cabeza 128; caché KV en fp16 ≈ 0,14 MiB por token), más unos 0,5-0,7 GB de sobrecarga del runtime:

| Cuantización | Pesos (aprox.) | VRAM con 8k de contexto | VRAM con 32k de contexto |
|---|---|---|---|
| Q4_K_M (la publicada) | 4,7 GB | ~6,5 GB | ~10 GB |
| Q8_0 (no publicada) | ~8,7 GB | ~10,5 GB | ~14 GB |
| F16 (no publicada) | ~16,4 GB | ~18 GB | ~21,5 GB |

- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y superiores ejecutan Q4_K_M con contexto completo en fp16; con caché KV en q8_0 (`--cache-type-k q8_0 --cache-type-v q8_0`) el requisito de contexto largo se reduce aproximadamente a la mitad.
- GPU profesionales: RTX 4090 / RTX 6000 Ada (24 GB) permiten Q4_K_M o Q8_0 con contexto largo y mayor paralelismo; A100 40/80 GB y H100 son adecuadas para servir en lote con múltiples secuencias concurrentes.
- Ejecución en CPU: viable con 8-16 GB de RAM a velocidad dependiente del procesador; no se dispone de mediciones de tokens por segundo para este artefacto concreto.
- Opciones de despliegue: llama.cpp (`llama-server`, con endpoint compatible con la API de OpenAI), Ollama (`ollama run hf.co/QubaxAI/Qwen3-8B-GGUF:Q4_K_M`), LM Studio, koboldcpp y text-generation-webui. Para vLLM, TGI o SGLang conviene partir de los pesos safetensors del modelo base y aplicar cuantización AWQ/GPTQ/FP8, ya que el soporte GGUF en esos servidores es experimental o inexistente.
- Latencia y throughput: no disponibles; dependen por completo del hardware, del backend y de la longitud de contexto utilizada.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentación pública, no de la información proporcionada en esta consulta.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B (este GGUF) | 8,19B | 32.768 (131.072 con YaRN) | Apache 2.0 | GGUF (Q4_K_M), safetensors en el base | Modo thinking activable; 119 idiomas declarados |
| Llama 3.1 8B Instruct | 8,03B | 128.000 | Llama 3.1 Community License | Safetensors, GGUF | Sin modo thinking; licencia con condiciones para grandes despliegues |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 | Apache 2.0 | Safetensors, GGUF | Sin modo thinking; atención con ventana deslizante |
| Gemma 2 9B | 9,24B | 8.192 | Gemma Terms of Use | Safetensors, GGUF | Contexto más corto; licencia con restricciones de uso |

En términos de licencia, Qwen3-8B y Mistral 7B v0.3 son las opciones más permisivas (Apache 2.0) frente a Llama 3.1 y Gemma 2, sujetas a condiciones adicionales. En longitud de contexto, Llama 3.1 8B declara 128.000 tokens nativos, mientras que Qwen3-8B requiere YaRN para superar los 32.768. No se incluye comparación de rendimiento porque no hay datos de benchmarks disponibles para este artefacto.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; el modo thinking alarga la respuesta y puede aumentar la latencia sin garantizar corrección factual.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos en fp16, especialmente perceptible en tareas aritméticas, generación de código y tool calling. No se han publicado métricas de degradación para este artefacto.
- El repositorio no incluye sumas de verificación ni documentación del pipeline de cuantización, por lo que no es posible auditar la fidelidad del archivo publicado. Se recomienda contrastar con una cuantización generada localmente desde los safetensors oficiales.
- Autor con 0 descargas y 0 likes en el momento de la consulta; la model card incluye contenido promocional de un servicio de API externo (pagos con criptomonedas, sin KYC) que no constituye evidencia técnica de calidad.
- Idiomas soportados no declarados en el repositorio; la cobertura multilingüe solo puede asumirse a partir del modelo base.
- El contexto nativo de 32.768 tokens implica una caché KV de aproximadamente 4,5 GB en fp16; extender a 131.072 con YaRN degrada la calidad en posiciones lejanas y multiplica el consumo de memoria.
- Sin capacidades de visión, audio ni entrada multimodal.
- Sesgos: al derivar de un corpus web multilingüe, el modelo puede reproducir estereotipos de género, nacionalidad, religión o profesión presentes en los datos de entrenamiento. No se documenta ningún proceso de mitigación específico para este artefacto.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia, el archivo NOTICE si existe y la atribución. No hay cláusulas de uso aceptable adicionales en la licencia, pero el despliegue sigue sujeto a la normativa aplicable (RGPD, AI Act en la UE).
- Para producción en alta concurrencia, el formato GGUF con llama.cpp es menos eficiente que motores con paginación de caché KV (vLLM, TGI, SGLang) partiendo de los pesos safetensors.

## Enlaces

- Repositorio del modelo: https://huggingface.co/QubaxAI/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de presentación de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Calculadora de precios del autor: https://huggingface.co/spaces/QubaxAI/price-calculator
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este repositorio (los resultados obtenidos no guardaban relación con el modelo).
