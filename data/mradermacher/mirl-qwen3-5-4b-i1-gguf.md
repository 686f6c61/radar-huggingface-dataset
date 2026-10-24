# mradermacher/MiRL-Qwen3.5-4B-i1-GGUF

## Resumen

MiRL-Qwen3.5-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Rtian/MiRL-Qwen3.5-4B, un ajuste fino mediante aprendizaje por refuerzo (RL) sobre la base Qwen3.5-4B, orientado a tareas de agente de terminal y resolución de problemas en entornos de línea de comandos. El trabajo de cuantización lo firma mradermacher, un actor habitual en la comunidad que publica versiones GGUF con calibración imatrix de modelos populares, y no el equipo que entrenó el modelo original.

El modelo base tiene 4.205.751.296 parámetros (4,2B) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Los tags de la model card (`agent`, `terminal-agent`, `terminal-bench`, `reinforcement-learning`) indican que el entrenamiento se ha centrado en comportamiento agéntico sobre terminal, no en conversación general, y el pipeline declarado en HuggingFace es `reinforcement-learning`. El único idioma declarado es el inglés.

La relevancia de esta variante concreta es práctica: al estar en GGUF con cuantizaciones desde IQ1_S hasta Q6_K, el modelo se puede ejecutar en hardware de consumo (GPU de 8-12 GB o incluso CPU) mediante llama.cpp u Ollama, algo imposible con los pesos completos en safetensors. El repositorio ocupa 53,4 GB porque agrupa todas las variantes de cuantización, pero cada fichero individual ronda entre 1 y 4,5 GB. No hay descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); detalles internos de capas y atención no disponibles |
| Parámetros totales | 4.205.751.296 (4,2B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (calibradas con imatrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5 de 4,2B parámetros, es decir, un transformer decoder-only de la familia Qwen en su tamaño pequeño, pensado para ejecución local. Sobre esa base, el autor original (Rtian) aplicó un proceso de aprendizaje por refuerzo cuyo objetivo declarado es el comportamiento de agente de terminal: los tags `terminal-agent` y `terminal-bench` apuntan a un entrenamiento orientado a resolver tareas dentro de una shell, encadenando comandos y leyendo su salida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF más allá del RL mencionado.

La innovación técnica atribuible a esta ficha es la cuantización, no el entrenamiento. mradermacher aplica cuantización con matriz de importancia (imatrix), generada a partir de un corpus de calibración, lo que en la práctica reduce la pérdida de perplejidad en bits bajos respecto a cuantizaciones estáticas equivalentes. El repositorio incluye además el fichero imatrix (0,1 GB) por si se quieren generar cuantizaciones propias, y existe un repositorio hermano con cuantizaciones estáticas (sin imatrix). La model card del cuantizador menciona que el modelo podría tener capacidades de visión y que los ficheros `mmproj` (proyector multimodal), si existen, estarían en el repositorio estático; no se confirma en la información disponible que dichos ficheros existan ni que el modelo base sea multimodal.

## Capacidades

- Generación de texto conversacional en inglés (`conversational` en los tags).
- Comportamiento agéntico en terminal: ejecución de comandos, lectura de salida y encadenamiento de pasos para completar tareas, según el objetivo declarado del ajuste con RL.
- Razonamiento multi-paso orientado a tareas de tipo `terminal-bench`.
- Integración como endpoint compatible (`endpoints_compatible`), es decir, pensado para servirse detrás de una API compatible con el formato de HuggingFace/OpenAI.
- Capacidad de visión: la model card del cuantizador afirma que "es un modelo de visión", pero no se confirma la disponibilidad de ficheros `mmproj` en la información proporcionada; tratar como no confirmado.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque es coherente con el perfil agéntico del modelo.
- Multilingüismo: limitado al inglés según el campo `language` de la model card.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede recibir un objetivo en lenguaje natural ("rota los logs de nginx con más de 30 días") y traducirlo a una secuencia de comandos de shell, leyendo la salida para corregir errores en pasos sucesivos. Es el caso de uso para el que fue entrenado explícitamente.
- Agente de CI/CD para diagnóstico de fallos: integrado en un runner, puede inspeccionar la salida de un build fallido y proponer o ejecutar comandos de diagnóstico (inspección de dependencias, variables de entorno, permisos) dentro de un contenedor efímero.
- Asistente de terminal embebido en herramientas de desarrollo: al ser un GGUF de 4,2B, se puede distribuir con un editor o un CLI y ejecutarse en la máquina del desarrollador sin enviar comandos ni rutas a un servicio externo, lo que reduce la exposición de datos.
- Generación de scripts de automatización reproducibles: dado un procedimiento descrito en lenguaje natural, producir un script de bash o Python con manejo de errores básico, verificable antes de su ejecución en producción.
- Entornos de evaluación de agentes: servir el modelo con llama.cpp o vLLM como baseline de 4B en suites de evaluación de agentes de terminal, comparando su tasa de éxito frente a modelos mayores con un coste por token mucho menor.
- Procesamiento por lotes en CPU: gracias a las cuantizaciones IQ2/IQ3, se puede ejecutar en servidores sin GPU para tareas de clasificación o extracción de comandos donde la latencia no es crítica.
- Formación y experimentación: por su tamaño y licencia Apache-2.0, sirve como banco de pruebas para estudiar el efecto del ajuste con RL sobre una base Qwen3.5 pequeña, o para hacer fine-tuning adicional sobre las versiones desuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está etiquetado con `terminal-bench`, lo que sugiere que fue evaluado o entrenado contra esa suite, pero no se proporcionan puntuaciones concretas (ni Terminal-Bench, ni MMLU, ni HumanEval, ni GSM8K) en la model card ni en los resultados de búsqueda consultados. Tampoco se publican métricas de perplejidad de las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 1,3-1,6 GB en IQ1/IQ2, 1,7-2,2 GB en Q2_K/Q3_K_M, 2,5-2,8 GB en Q4_K_M, 3,0-3,3 GB en Q5_K_M, 3,5-3,8 GB en Q6_K y 8,4 GB en FP16 (estimación a partir de los 4,2B parámetros; no son cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) ejecuta Q4_K_M con contexto moderado; una RTX 4090 o una L40S permiten Q6_K o FP16 con contexto largo y mayor throughput; para servir en producción con concurrencia, A100 40/80 GB o H100 si se usa vLLM con los pesos originales.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q6_K con 8 GB de VRAM, y en IQ3/Q4 en iGPU o APUs con memoria unificada.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (requiere crear el Modelfile a partir del GGUF), LM Studio, llama-cpp-python, Jan; para los pesos completos del modelo base, vLLM o TGI con transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus model cards públicas y no se han verificado en la búsqueda realizada; se incluyen como referencia de categoría (transformers densos de 3-4B ejecutables en local).

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiRL-Qwen3.5-4B (esta ficha, vía GGUF) | 4,2B | No disponible | Inglés | Apache-2.0 | Agente de terminal ajustado con RL |
| Qwen3-4B | ~4B | 32K nativo (extensible con YaRN) | Multilingüe | Apache-2.0 | Propósito general, modos thinking/no-thinking |
| Llama 3.2 3B Instruct | 3,2B | 128K | Multilingüe (8 idiomas) | Llama 3.2 Community License | Propósito general, licencia con restricciones |
| Phi-4-mini-instruct | 3,8B | 128K | Multilingüe | MIT | Propósito general y razonamiento |

La diferencia relevante frente a las alternativas no es de tamaño sino de especialización: MiRL-Qwen3.5-4B está entrenado con RL para terminal, mientras que Qwen3-4B, Llama 3.2 3B y Phi-4-mini son modelos generalistas. No hay datos de benchmark que permitan cuantificar esa ventaja en tareas de agente.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar tareas con historiales largos de terminal o ficheros extensos sin pruebas previas.
- Especialización estrecha: el ajuste con RL sobre tareas de terminal puede degradar el rendimiento en conversación general respecto a la base Qwen3.5-4B sin ajustar. No se han publicado evaluaciones que lo confirmen o desmientan.
- Alucinación de comandos: en un agente de terminal, un comando inventado o mal construido puede tener efectos destructivos (borrado de ficheros, cambios de permisos). Es obligatorio sandboxing, confirmación humana y límites de permisos antes de ejecutar cualquier salida del modelo.
- Cuantizaciones de muy baja precisión: IQ1_S e IQ2_XXS degradan notablemente la coherencia; para uso agéntico se recomienda Q4_K_M o superior.
- Visión no confirmada: la model card menciona que es un modelo de visión, pero no se confirma la existencia de ficheros `mmproj`; no planificar casos de uso multimodales sin verificarlo.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la ficha; no hay informes de terceros sobre calidad o estabilidad.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo base y el cuantizador no ofrecen garantías; conviene mantener el aviso de licencia y citar ambos repositorios.
- Metadatos atípicos: la fecha de creación registrada (2026-10-23) es posterior a la de redacción habitual de fichas, lo que sugiere un error de metadatos o un repositorio reciente; verificar antes de fijar la versión en producción.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/MiRL-Qwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Rtian/MiRL-Qwen3.5-4B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/MiRL-Qwen3.5-4B-GGUF
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#MiRL-Qwen3.5-4B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/MiRL-Qwen3.5-4B-i1-GGUF/resolve/main/MiRL-Qwen3.5-4B.imatrix.gguf
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guía de uso de GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
