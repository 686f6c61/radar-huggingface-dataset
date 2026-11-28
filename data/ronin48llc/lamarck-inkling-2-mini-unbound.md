# Ronin48LLC/Lamarck-Inkling-2-Mini-Unbound

## Resumen

Lamarck-Inkling-2-Mini-Unbound es un ajuste fino por continuación de preentrenamiento en el dominio de ciberseguridad sobre el modelo Inkling-2-Mini-Unbound, que a su vez es la variante "Unbound" del Inkling-2-Mini de Thinking Machines. Lo desarrolla Ronin48LLC dentro de su serie Lamarck y se distribuye con licencia Apache-2.0. El modelo resuelve el problema de adaptar un modelo de razonamiento generalista a vocabulario y patrones tecnicos de seguridad sin destruir sus capacidades previas: los datos del autor muestran una reduccion de perplejidad en corpus de seguridad mientras la perplejidad de control en matematicas permanece practicamente plana.

Tecnicamente es un modelo de mezcla de expertos (MoE) de 26.070.385.152 parametros totales (26,4B segun la model card), con 128 expertos enrutados y top-8 por capa, sobre una arquitectura denominada `Inkling2LoopForConditionalGeneration` con nucleo reenlazado (tres pasadas con pesos compartidos). Incorpora atencion hibrida de ventana deslizante y atencion completa, convolucion corta y sesgo de posicion relativa. La adaptacion se hizo con LoRA (r=32 en proyecciones de atencion y r=8 en proyecciones de expertos fusionadas), unos 215M de parametros entrenables, el 0,8% del modelo base, y el adaptador se fusiona en los pesos para distribuir un unico modelo autocontenido en formato GGUF Q4_K_M.

Su relevancia practica es doble: por un lado ofrece un modelo de razonamiento con modo *thinking* (emite traza de razonamiento antes de la respuesta) especializado en seguridad, con contexto de servicio de hasta 512K tokens y soporte de hasta 1M; por otro, su empaquetado en GGUF Q4_K_M y su compatibilidad con `llama.cpp` reciente lo hacen desplegable en servidores locales con API compatible con OpenAI y con Anthropic Messages.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopForConditionalGeneration` (MoE con nucleo reenlazado, 3 pasadas con pesos compartidos) |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | no disponible (128 expertos enrutados, top-8 por capa) |
| Longitud de contexto | hasta 512K tokens en servicio; el modelo base soporta hasta 1M |
| Tipos de cuantizacion | Q4_K_M (GGUF distribuido); pesos base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, LoRA (adaptador) |
| Vocabulario | 201.024 (tiktoken) |
| Parametros entrenables del adaptador | ~215M (0,8% del base) |
| Precision base | BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados y seleccion top-8 por capa, organizado en un nucleo reenlazado que aplica tres pasadas con pesos compartidos, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. La atencion es hibrida: combina ventana deslizante con atencion completa, e incorpora convolucion corta y sesgo de posicion relativa. El vocabulario tiktoken de 201.024 entradas es amplio y sugiere cobertura multilingue y de codigo, aunque el autor no detalla los idiomas.

El ajuste se realizo mediante LoRA sobre un corpus de texto de seguridad, con parada temprana basada en validacion y seleccion del mejor checkpoint por evaluacion en conjunto reservado (ckpt-300). El adaptador usa r=32 en proyecciones de atencion y r=8 en proyecciones de expertos fusionadas, estas ultimas implementadas como LoRA de GEMM agrupado fusionado, no como LoRA estandar por capa lineal, por lo que cargarlo requiere el script `inkling_lora_min.py`. El adaptador se fusiona en los pesos base para la distribucion. La model card indica que la ablacion y la autodestilacion del modelo base son trabajo previo de nokeep, no de este ajuste.

## Capacidades

- Generacion de texto conversacional con modo *thinking*: emite una traza de razonamiento antes de la respuesta final, lo que exige configurar `max_tokens` generosos.
- Razonamiento de multiples pasos y descomposicion de problemas, heredado del modelo base.
- Conocimiento especializado en ciberseguridad: vocabulario, conceptos y patrones de seguridad reforzados por el preentrenamiento continuado.
- Razonamiento matematico y resolucion de problemas cuantitativos (GSM8K preservado e incluso mejorado segun las metricas del autor).
- Contexto largo: hasta 512K tokens en servicio, con soporte del modelo base hasta 1M.
- Servicio con API compatible con OpenAI (`/v1/chat/completions`) y con Anthropic Messages (`/v1/messages`) a traves de `llama-server`.
- No se documenta soporte explicito de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de alertas y triaje de incidentes: el modelo puede recibir logs, trazas y descripciones de incidentes en una ventana de hasta 512K tokens y producir un razonamiento estructurado sobre la causa raiz y los siguientes pasos, aprovechando su especializacion en seguridad.
- Asistencia en respuesta a incidentes: con contexto largo puede ingerir el historial completo de un incidente (correos, tickets, salidas de herramientas) y generar un informe de contencion y erradicacion con justificacion paso a paso.
- Formacion y concienciacion en seguridad: generar explicaciones didacticas de vulnerabilidades y vectores de ataque, con traza de razonamiento visible para el alumno.
- Revision de configuraciones y politicas: evaluar ficheros de configuracion, reglas de firewall o politicas IAM y senalar desviaciones respecto a buenas practicas, usando el modo thinking para justificar cada hallazgo.
- Generacion de documentacion tecnica de seguridad: redactar runbooks, descripciones de controles y resumenes de cumplimiento a partir de material fuente extenso.
- Despliegue local y air-gapped: al distribuirse como GGUF Q4_K_M autocontenido y ejecutarse con `llama.cpp`, es adecuado para entornos con requisitos de confidencialidad donde no se puede enviar telemetria ni datos a APIs externas.
- Apoyo a analisis de malware y ingenieria inversa a nivel descriptivo: resumir cadenas, comportamiento observado y tecnicas MITRE ATT&CK a partir de informes extensos.

## Benchmarks y rendimiento

Metricas de la evaluacion de continuacion de preentrenamiento en ciberseguridad publicadas por el autor (ckpt-300, parada temprana por validacion). Perplejidad: menor es mejor.

| Metrica | Base | Ajustado |
|---|---|---|
| Perplejidad en seguridad (held-out) | 6,15 | 4,90 |
| Perplejidad OOD CyberMetric | 16,73 | 15,76 |
| Perplejidad OOD MMLU-security | 8,03 | 7,50 |
| Perplejidad OOD SecQA-v2 | 4,79 | 4,14 |
| Perplejidad OOD math-control | 6,49 | 6,47 |
| Precision MMLU-security | 0,170 | 0,155 |
| Precision SecQA-v2 | 0,20 | 0,27 |
| Precision GSM8K | 0,84 | 0,90 |

El autor advierte que, al ser un modelo de razonamiento, las cifras de precision en opcion multiple son sensibles a la extraccion de la respuesta desde la traza de razonamiento; la perplejidad es la medida independiente del parseo y por tanto la mas fiable de la tabla. No se han publicado resultados de benchmarks estandar (MMLU completo, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa aproximadamente 16-17 GB (el repo completo pesa 17,9 GB incluyendo adaptador y script), por lo que se necesita una GPU con al menos 18-20 GB libres para cargar el modelo completo en GPU.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB) para despliegue comodo; RTX 4090 (24 GB) es suficiente para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB con contexto reducido; en GPUs de 16 GB requeriria cuantizaciones mas agresivas no publicadas por el autor.
- Opciones de despliegue: `llama.cpp` con soporte de la arquitectura `inkling2_loop` (builds recientes), mediante `llama-server` con API compatible con OpenAI y Anthropic Messages. El autor no menciona soporte en vLLM, TGI ni Ollama.
- Parametros de servicio sugeridos por el autor: `-ngl 99 -c 32768 -fa on -ctk q8_0 -ctv q8_0`. El contexto de servicio de 512K requiere memoria KV considerable; con cuantizacion q8_0 de KV cache el consumo crece de forma lineal con el contexto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lamarck-Inkling-2-Mini-Unbound | 26,4B (MoE, top-8 de 128) | 512K servicio / 1M base | Apache-2.0 | safetensors, GGUF Q4_K_M, LoRA | Especializado en ciberseguridad, modo thinking |
| Inkling-2-Mini-Unbound (nokeep) | 26,4B (MoE) | 1M | Apache-2.0 (heredada) | safetensors | Modelo base sin especializacion de dominio |
| Inkling-2-Mini (Thinking Machines) | 26,4B (MoE) | 1M | no disponible | safetensors | Modelo original antes de ablacion/autodestilacion |
| Alternativas de 20-30B densas | 20-30B | variable | variable | variable | No disponible comparativa de rendimiento en la informacion |

## Limitaciones y advertencias

- Las metricas de precision en opcion multiple (MMLU-security, SecQA-v2) son sensibles al parseo de la traza de razonamiento; el autor las reporta tal cual y recomienda usar la perplejidad como medida principal.
- MMLU-security empeora ligeramente (0,170 a 0,155) tras el ajuste, lo que sugiere un posible desplazamiento en la calibracion de respuestas de opcion multiple pese a la mejora en perplejidad.
- El modo thinking incrementa el consumo de tokens y la latencia; es necesario configurar `max_tokens` amplios o la respuesta final puede truncarse.
- No se documentan los idiomas soportados; el vocabulario tiktoken amplio sugiere cobertura multilingue pero no hay confirmacion del autor.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en dominios tecnicos donde el modelo puede inventar CVE, comandos o procedimientos; requiere verificacion humana en produccion.
- No es una certificacion de seguridad: el autor lo declara explicitamente como mediciones de investigacion.
- La carga del adaptador sin fusionar requiere `inkling_lora_min.py` por el uso de LoRA fusionado en expertos; no es compatible con `PeftModel` estandar sin ese paso.
- El soporte en `llama.cpp` depende de builds recientes con la arquitectura `inkling2_loop`; versiones antiguas no cargaran el modelo.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar la procedencia de los datos de entrenamiento del corpus de seguridad, no detallada por el autor.
- El contexto de 512K en servicio exige memoria KV considerable y puede degradar el throughput; no se publican latencias medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ronin48LLC/Lamarck-Inkling-2-Mini-Unbound
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
