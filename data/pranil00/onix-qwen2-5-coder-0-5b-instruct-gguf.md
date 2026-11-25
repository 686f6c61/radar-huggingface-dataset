# pranil00/ONIX-Qwen2.5-Coder-0.5B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Coder-0.5B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-Coder-0.5B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. La conversión y publicación corre a cargo de pranil00 bajo la etiqueta "ONIX Community", empleando la herramienta open source run-any-model, un motor de optimización de LLM adaptativo al dispositivo. El artefacto resultante pesa 0,42 GB en cuantización Q5_K_M (5,5 bits por parámetro), lo que representa una reducción del 65,6 % respecto a los pesos en FP16 (1,23 GB).

El modelo base es un transformer decoder-only de 630.138.880 parámetros (0,63 B) especializado en generación de código y texto. Esta versión cuantizada está pensada para ejecución local en hardware de consumo: desde Apple Silicon con memoria unificada hasta GPUs NVIDIA de las series RTX 30/40/50, pasando por CPU x86 con soporte AVX2/AVX-512. Su relevancia radica en que permite desplegar un asistente de código funcional en entornos con menos de 2 GB de VRAM dedicada, algo inviable con los pesos originales en FP16 según el propio informe del autor.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No se dispone de información sobre el proceso de entrenamiento original, la composición del dataset ni resultados de benchmarks independientes para esta cuantización concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), cuantizado a GGUF |
| Parametros totales | 630.138.880 (0,63 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU (según model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por parámetro); no se publican otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen--Qwen2.5-Coder-0.5B-Instruct-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-0.5B-Instruct pertenece a la familia Qwen2.5 de Alibaba, con arquitectura transformer decoder-only y atención causal estándar. La model card de esta cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o instrucción supervisada en el modelo original. Tampoco se documenta ninguna innovación técnica específica más allá de la propia cuantización.

La contribución técnica de este artefacto es la conversión a Q5_K_M mediante el motor run-any-model, que según el informe de telemetría del autor acelera las 24 capas del modelo en Metal y mantiene aproximadamente un 97,5 % de la "fidelidad cognitiva" respecto a FP16. El buffer de KV cache se mantiene en FP16 (48 MB). El informe indica que los pesos FP16 originales resultaban "inutilizables" o propensos a fallos en el host de prueba (Darwin, 16 GB), mientras que la versión cuantizada se valida como "EXCELLENT (Native Fit)". Estas métricas proceden del propio autor y no han sido verificadas de forma independiente.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación (autocompletado, generación de funciones, explicación de código) y en instrucciones generales en formato chat.
- Formato de conversación: emplea los tokens especiales de Qwen (`<|im_end|>`, `<|endoftext|>`) tal como se refleja en la configuración de Ollama de la model card.
- Ejecución local multiplataforma: soporte nativo en Apple Silicon (Metal), NVIDIA (CUDA) y CPU x86 (AVX2/AVX-512).
- Compatibilidad de herramientas: probado con run-any-model CLI, Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo base es solo texto.

## Casos de uso

- Autocompletado de código en el editor: con 0,42 GB de pesos y menos de 2 GB de VRAM, el modelo puede ejecutarse en segundo plano en un portátil con GPU integrada o RTX de gama de entrada, ofreciendo sugerencias de línea y bloque con latencia baja gracias a la aceleración completa de las 24 capas.
- Asistente de código en terminal: mediante `llama-cli -cnv` o el CLI de run-any-model, se puede mantener una sesión conversacional local para explicar fragmentos, generar tests unitarios o traducir código entre lenguajes sin conexión a internet.
- Prototipado en CI/CD con presupuesto mínimo: al caber en 2,49 GB de RAM en CPU, puede integrarse en runners de integración continua para generar documentación de APIs, resúmenes de diffs o mensajes de commit automáticos.
- Educación y entornos sin GPU: estudiantes con equipos modestos pueden desplegarlo vía Ollama o LM Studio para practicar prompting y aprender fundamentos de LLM sin depender de servicios en la nube.
- Herramienta de escritorio embebida: aplicaciones de escritorio (plugins de IDE, herramientas de notas) pueden distribuir el GGUF de 0,42 GB como recurso y cargarlo en memoria unificada en macOS o VRAM en Windows/Linux.
- Filtrado y transformación de código en pipelines: tareas de reformateo, generación de docstrings o conversión de snippets se benefician de la ventana de 8.192 tokens en GPU, suficiente para archivos de tamaño medio.
- Evaluación comparativa de cuantizaciones: sirve como referencia ligera para medir el impacto de Q5_K_M frente a FP16 en tareas de código, dado el informe de retención del 97,5 % publicado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye el informe de telemetría del autor con métricas de memoria y compresión, no de calidad en tareas (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precisión de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamaño de pesos | 1,23 GB | 0,42 GB | -65,6 % |
| Buffer KV cache | 48,0 MB (FP16) | 48,0 MB (FP16) | Optimizado |
| RAM residente total | 1,30 GB | 0,49 GB | -62,4 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 24/24 | Óptimo |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |

Estos datos proceden del propio autor y no han sido validados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,92 GB de VRAM dedicada en NVIDIA GPU (según model card); 0,49 GB de memoria unificada en Apple Silicon; 2,49 GB de RAM libre en CPU.
- GPU recomendadas: NVIDIA RTX series 30/40/50 (CUDA acelerado); Apple Silicon M1/M2/M3/M4/M5 (Metal acelerado).
- Cabe en GPU de consumo: sí, en cualquier RTX 30/40/50 con al menos 2 GB de VRAM, y en Macs con chip Apple Silicon.
- Opciones de despliegue: run-any-model CLI, Ollama (con Modelfile proporcionado), llama.cpp (`llama-cli -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible; la model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Coder-0.5B-Instruct-GGUF (Q5_K_M) | 0,63 B | 8.192 (GPU) / 4.096 (CPU) | GGUF | Apache 2.0 | Hugging Face (repo de 0,5 GB) |
| Qwen2.5-Coder-0.5B-Instruct (original) | 0,63 B | no disponible en esta ficha | safetensors (FP16/BF16) | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B aprox. | no disponible en esta ficha | safetensors, GGUF (comunidad) | Apache 2.0 | Hugging Face (Qwen y derivados) |
| Qwen2.5-Coder-7B-Instruct | 7 B aprox. | no disponible en esta ficha | safetensors, GGUF (comunidad) | Apache 2.0 | Hugging Face (Qwen y derivados) |

Los datos de los modelos comparativos no se han verificado en la información proporcionada; se indican como referencia de categoría. No se dispone de comparativas de rendimiento entre estas variantes en la documentación consultada.

## Limitaciones y advertencias

- Tamaño muy reducido (0,63 B): la capacidad de razonamiento y de generación de código complejo es limitada en comparación con variantes de 7 B o superiores; es adecuada para autocompletado y tareas acotadas, no para razonamiento profundo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el autor declara explícitamente que no asume responsabilidad sobre los outputs y que el usuario debe auditar y validar todo el contenido generado.
- Idiomas soportados no documentados: no se especifica la cobertura multilingüe en la model card; el modelo base Qwen2.5 tiene soporte multilingüe, pero no se confirma para esta cuantización.
- Contexto reducido en CPU: 4.096 tokens frente a 8.192 en GPU, lo que puede limitar el análisis de archivos grandes en despliegues sin aceleración.
- Métricas de calidad no verificadas: el 97,5 % de retención de calidad es una estimación del autor, no un benchmark independiente.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad absoluto que traslada toda la responsabilidad de validación al implementador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad; conviene verificar la integridad del GGUF antes de usarlo en producción.
- Fecha de creación del repositorio: 25 de noviembre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Coder-0.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
