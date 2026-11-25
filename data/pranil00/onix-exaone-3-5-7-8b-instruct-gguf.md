# pranil00/ONIX-EXAONE-3.5-7.8B-Instruct-GGUF

## Resumen

ONIX-EXAONE-3.5-7.8B-Instruct-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) del modelo EXAONE-3.5-7.8B-Instruct desarrollado por LG AI Research (LGAI-EXAONE). La publicación corre a cargo del usuario pranil00 bajo la etiqueta "ONIX Community", que distribuye el artefacto cuantizado generado con su herramienta run-any-model, un motor de optimización y conversión de LLM adaptado al dispositivo. El modelo base es un transformer de 7.818.444.800 parámetros (7,82 mil millones) orientado a generación de texto e instrucciones.

El objetivo de esta publicación es hacer viable la ejecución del modelo base en hardware de consumo: el peso cuantizado ocupa 5,26 GB frente a los 15,29 GB en FP16, lo que supone una reducción del 65,6 % (ratio de compresión 2,91x) y permite que el modelo quepa en equipos con 6-8 GB de memoria. El autor declara una retención de calidad del 97,5 % respecto al modelo sin cuantizar y clasifica la viabilidad como "EXCELLENT (Native Fit)" para Apple Silicon, GPU NVIDIA de las series RTX 30/40/50 y CPU x86 con AVX2/AVX-512.

La relevancia actual radica en que permite desplegar localmente un modelo de instrucciones de casi 8B con contexto de 8.192 tokens en portátiles y estaciones de trabajo sin GPU de datacenter, usando llama.cpp, Ollama, LM Studio o Jan. No obstante, la información publicada no incluye detalles sobre el entrenamiento del modelo base, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia declarada en la model card) |
| Parametros totales | 7.818.444.800 (7,82 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU y Apple Silicon); 4.096 tokens (CPU) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico esquema publicado en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `LGAI-EXAONE--EXAONE-3.5-7.8B-Instruct-Q5_K_M.gguf`, 5,26 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión GGUF de un transformer decoder-only de 7,82 mil millones de parámetros, el modelo EXAONE-3.5-7.8B-Instruct de LG AI Research. La model card de esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones arquitectónicas del modelo base; esos datos corresponden a la documentación original de LGAI-EXAONE, que no forma parte de la información proporcionada.

La contribución técnica de esta ficha es la cuantización: el pipeline run-any-model convierte los pesos FP16 a Q5_K_M (5,5 bits por parámetro), reduciendo el tamaño de 15,29 GB a 5,26 GB. Según el informe de auditoría incluido, el búfer de KV cache se mantiene en FP16 (512 MB) y se aceleran las 32 capas del modelo en Metal. El autor declara una retención de calidad estimada del 97,5 % frente al baseline FP16, si bien no se documenta la metodología de esa estimación.

## Capacidades

- Generación de texto e instrucciones en formato conversacional (pipeline `text-generation`), con plantilla de chat basada en tokens especiales `<|im_end|>` y `<|endoftext|>`.
- Ejecución local multiplataforma: Apple Silicon con Metal, GPU NVIDIA con CUDA y CPU x86 con AVX2/AVX-512.
- Conversación multi-turno en terminal mediante llama.cpp (`-cnv`), Ollama o el CLI run-any-model.
- Integración con interfaces gráficas de escritorio: LM Studio, Jan y Text-Generation-WebUI.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) no están documentadas en la información disponible.
- No se documenta soporte de visión, audio, modo thinking ni function calling en esta publicación.

## Casos de uso

- Asistente conversacional local en portátil: con 5,83 GB de memoria unificada en Apple Silicon o 6,76 GB de VRAM en GPU NVIDIA, el modelo puede mantener diálogos multi-turno de hasta 8.192 tokens sin conexión a internet, útil para entornos con requisitos de privacidad.
- Prototipado rápido de aplicaciones LLM: el CLI `run-any-model run <fichero.gguf>` permite lanzar una sesión de chat en terminal tras instalar el paquete, lo que reduce el tiempo de validación de ideas antes de invertir en infraestructura.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con 7,83 GB de RAM libre en CPU x86 y contexto de 4.096 tokens, el modelo sirve para tareas de generación de texto en equipos de oficina estándar.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar este artefacto Q5_K_M junto al modelo base FP16 para medir la degradación real de calidad en sus propios conjuntos de evaluación, dado que el autor declara una retención del 97,5 % sin publicar la metodología.
- Integración en pipelines de generación de documentación técnica: el modelo puede redactar borradores y resúmenes en local, evitando el envío de datos sensibles a APIs externas.
- Educación y experimentación: al caber en GPU de consumo (RTX 30/40/50), es adecuado para cursos y talleres donde se enseña a desplegar LLM con llama.cpp u Ollama sin acceso a clústeres.
- Uso embebido en aplicaciones de escritorio: la distribución como un único fichero GGUF facilita empaquetarlo en herramientas de escritorio que requieran inferencia local sin dependencias de red.

## Benchmarks y rendimiento

La model card incluye únicamente métricas de cuantización y consumo de memoria, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Se reproducen a continuación los datos del informe de auditoría del autor:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 15,29 GB | 5,26 GB | -65,6 % |
| KV cache | 512 MB (FP16) | 512 MB (FP16) | Optimizado |
| RAM residente total | 15,87 GB | 5,83 GB | -63,2 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 32/32 capas | Optimo |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria: 5,83 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 6,76 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50; 7,83 GB de RAM libre en CPU x86.
- Contexto recomendado: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas RTX de las series 30, 40 y 50 con al menos 6,76 GB de VRAM; también en equipos Apple Silicon con 8 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model.
- Aceleración: Metal en Apple Silicon (32/32 capas) y CUDA en NVIDIA; AVX2/AVX-512 en CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-EXAONE-3.5-7.8B-Instruct-GGUF (Q5_K_M) | 7,82 B | 8.192 (GPU) / 4.096 (CPU) | GGUF | Apache 2.0 | Hugging Face (repo de pranil00) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (base) | 7,82 B | no disponible en esta informacion | safetensors (presumible, no confirmado) | no disponible en esta informacion | Hugging Face (LGAI-EXAONE) |
| Alternativas de ~7-8B cuantizadas en GGUF | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones de modelos alternativos en la información proporcionada; la comparativa se limita al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- La model card no documenta los idiomas soportados por el modelo base; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- La retención de calidad del 97,5 % es una estimación del autor sin metodología publicada; conviene validarla con evaluaciones propias antes de usar el modelo en producción.
- La cuantización Q5_K_M introduce pérdida de precisión respecto a FP16; tareas sensibles a errores numéricos o de razonamiento fino pueden degradarse más que la media declarada.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor declina explícitamente cualquier responsabilidad sobre los outputs generados.
- El contexto se reduce a 4.096 tokens en CPU, lo que limita casos de uso que requieran ventanas largas en hardware sin GPU.
- La licencia del artefacto se declara Apache 2.0, pero la model card menciona también "Apache 2.0 / MIT" de forma ambigua; conviene verificar la licencia del modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (25 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos conocidos, limitaciones de tool calling ni restricciones específicas del modelo base en esta publicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-EXAONE-3.5-7.8B-Instruct-GGUF
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
