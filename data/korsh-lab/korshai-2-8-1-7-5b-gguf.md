# Korsh-Lab/KorshAI-2.8.1-7.5B-GGUF

## Resumen

KorshAI 2.8.1 es un modelo de lenguaje de 7.500 millones de parámetros desarrollado por KorshLab Research, distribuido exclusivamente en formato GGUF con cuantización Q6_K. Está orientado a inferencia local en hardware de consumo, con un peso de fichero de aproximadamente 3,4 GB y una huella de VRAM declarada de unos 3,7 GB. El modelo se presenta como una arquitectura de 56 capas con capacidades nativas bilingües (inglés y español) y un enfoque explícito en razonamiento técnico, ejecución de código y cumplimiento estricto de esquemas.

La versión 2.8.1 se describe como una iteración con alineamiento de instrucciones reforzado, verificación algorítmica refinada y mayor adherencia a formatos estructurados. La model card publica una tabla de benchmarks empíricos obtenidos mediante inferencia local determinista (temperatura 0.0) con conjuntos de evaluación muy reducidos (entre 3 y 10 preguntas por categoría), lo que limita la significación estadística de los resultados.

El modelo es relevante para desarrolladores que necesitan un LLM desplegable en GPU de 8 GB con licencia Apache 2.0, throughput declarado superior a 70 tokens por segundo en hardware de consumo y soporte de plantilla de chat estilo ChatML. No obstante, la ausencia de información sobre el corpus de entrenamiento, la arquitectura base y el proceso de alineamiento obliga a tratar las cifras publicadas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, 56 capas (detalle de atencion no disponible) |
| Parametros totales | ~7,5B |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 4096 tokens (valor de ejemplo en el comando de llama-server; no se declara oficialmente como maximo) |
| Tipos de cuantizacion | GGUF Q6_K (unica publicada) |
| Idiomas soportados | ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card indica una arquitectura de aproximadamente 7.500 millones de parámetros distribuida en 56 capas. No se especifica el tipo de atención (MHA, GQA, MLA), la función de activación, la normalización empleada ni si existe algún componente híbrido tipo SSM o MoE. Tampoco se documenta la arquitectura base sobre la que se construye el modelo ni si se trata de un entrenamiento desde cero o de un ajuste fino sobre un modelo preexistente.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos en inglés y español, ni sobre las técnicas de alineamiento aplicadas (RLHF, DPO, SFT). La model card menciona "enhanced instruction alignment" y "refined algorithmic verification" como cambios de la versión 2.8.1, pero sin detallar metodología. La plantilla de chat documentada es ChatML (`<|im_start|>` / `<|im_end|>`), lo que sugiere compatibilidad con pipelines estándar de instrucción. No se declara ninguna innovación técnica concreta como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto e instrucciones generales en inglés y español.
- Razonamiento técnico y científico, según la evaluación declarada en ARC y MMLU.
- Generación y ejecución de código algorítmico, con énfasis en código ejecutable.
- Razonamiento matemático de estilo GSM8K, con rendimiento declarado del 60 % en el conjunto de prueba interno.
- Capacidad bilingüe nativa inglés-español, incluyendo razonamiento técnico en español.
- Cumplimiento de esquemas estrictos ("strict schema compliance"), útil para salidas estructuradas tipo JSON.
- Compatibilidad con plantilla ChatML para roles system/user/assistant.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de 8 GB: el modelo cabe en unos 3,7 GB de VRAM en Q6_K, lo que permite mantenerlo cargado junto al IDE y generar fragmentos de código con latencia declarada inferior a un segundo por bloque.
- Razonamiento técnico en español: dado su soporte nativo del español, puede emplearse para explicar conceptos de ingeniería de IA, revisar algoritmos o redactar documentación técnica sin depender de traducción intermedia.
- Generación de salidas estructuradas: la adherencia declarada a esquemas estrictos lo hace apto para extracción de campos, validación de JSON y pipelines de parsing automático en los que un fallo de formato rompe el flujo.
- Despliegue en estaciones de trabajo sin GPU dedicada: con rendimiento declarado de 15 a 25 tokens/s en CPU x86_64 con AVX2 y 16 GB de RAM, sirve para prototipado y pruebas de integración en entornos sin acelerador.
- Servicio de inferencia ligero con llama-server: el comando documentado con `-ngl 99` y puerto 8080 permite exponer una API compatible con OpenAI en una máquina de sobremesa para equipos pequeños.
- Evaluación y experimentación académica: al estar bajo Apache 2.0 y en GGUF, es adecuado para reproducir experimentos de razonamiento bilingüe y comparar cuantizaciones sin restricciones de uso comercial.
- Integración en Ollama o LM Studio: la plantilla ChatML y el Modelfile documentado permiten incorporarlo a flujos de trabajo locales existentes con cambios mínimos de configuración.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con temperatura 0.0 en inferencia local y conjuntos de evaluación muy reducidos:

| Benchmark | Precision | Tamano de muestra | Latencia media |
|---|---|---|---|
| MMLU (conocimiento general y multilingue) | 100,0 % | 10 preguntas | 0,93 s |
| Espanol (razonamiento e ingenieria de IA) | 100,0 % | 5 preguntas | 1,11 s |
| ARC (razonamiento cientifico) | 90,0 % | 10 preguntas | 0,80 s |
| Coding (ejecucion de algoritmos) | 66,7 % | 3 preguntas | 0,66 s |
| GSM8K-style (razonamiento matematico) | 60,0 % | 5 preguntas | 1,85 s |
| Precision global | 83,3 % | 33 preguntas | ~0,90 s/bloque |

No se han publicado resultados de benchmarks estandarizados (MMLU completo, HumanEval, GSM8K completo) en la informacion disponible. Las cifras anteriores proceden de una evaluacion interna con muestras de entre 3 y 10 items, por lo que no son comparables con resultados sobre los conjuntos oficiales.

## Requisitos de hardware

- VRAM estimada: ~3,7 GB con cuantización Q6_K (fichero de ~3,4 GB).
- GPU de consumo compatibles: RTX 3060, 3070 y 4060 de 8 GB con offload completo, con throughput declarado de 65 a 75 tokens/s.
- GPU de gama alta: RTX 4070, 4080 y 4090 (12 GB o más) con offload completo, con throughput declarado de 90 a 130+ tokens/s.
- Apple Silicon: M1, M2, M3 y M4 con 8 GB o más mediante aceleración Metal, con 50 a 70 tokens/s declarados.
- Solo CPU: x86_64 con AVX2 y 16 GB de RAM, con 15 a 25 tokens/s declarados.
- Opciones de despliegue documentadas: llama.cpp / llama-server, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- No se documenta soporte para vLLM ni TGI, dado que solo se publica el formato GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KorshAI 2.8.1 7.5B | ~7,5B | 4096 (valor de ejemplo, no confirmado) | GGUF Q6_K | Apache 2.0 | Solo GGUF; benchmarks internos con muestras muy pequenas |
| Mistral 7B | ~7,2B | 8192 (v0.1) | safetensors, GGUF | Apache 2.0 | Arquitectura y datos de entrenamiento documentados publicamente |
| Llama 3.1 8B | ~8,0B | 131072 | safetensors, GGUF | Llama 3.1 Community License | Contexto largo y ecosistema amplio; licencia con restricciones |
| Qwen2.5 7B | ~7,6B | 131072 | safetensors, GGUF | Apache 2.0 | Multilingue amplio y benchmarks publicos sobre conjuntos oficiales |

La comparacion se limita a parametros, contexto y licencia: no existen datos publicos de KorshAI 2.8.1 sobre conjuntos de evaluacion estandarizados que permitan una comparacion de rendimiento rigurosa con estos modelos.

## Limitaciones y advertencias

- Los benchmarks publicados se basan en muestras de 3 a 10 preguntas, insuficientes para estimar capacidad real; un 100 % en MMLU con 10 items no es extrapolable al conjunto completo.
- No se documenta el corpus de entrenamiento, la composición de datos ni el proceso de alineamiento, lo que impide auditar sesgos o procedencia de datos.
- No se especifica la arquitectura base ni si el modelo deriva de otro preexistente, lo que dificulta evaluar solapamiento con licencias de terceros.
- El contexto máximo real no está declarado oficialmente; los 4096 tokens del ejemplo pueden ser solo un valor de configuración de llama-server.
- Solo se publica cuantización Q6_K; no hay versiones Q4, Q5, Q8 ni pesos en safetensors para ajuste fino o evaluación con frameworks como vLLM.
- El rendimiento declarado en GSM8K-style (60 %) y coding (66,7 %) sugiere debilidad en matemáticas y código respecto a modelos de su tamaño con benchmarks completos.
- No se declara soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones de fidelidad ni de calibración, debe validarse la salida en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre datos de entrenamiento traslada al usuario el riesgo de reclamaciones de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Korsh-Lab/KorshAI-2.8.1-7.5B-GGUF
- Repositorio llama.cpp (motor de inferencia documentado): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue documentado): https://ollama.com
- No se han encontrado en la busqueda web papers, blogs, repositorios propios ni demos adicionales del modelo.
