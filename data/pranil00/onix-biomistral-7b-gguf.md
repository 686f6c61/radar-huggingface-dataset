# pranil00/ONIX-BioMistral-7B-GGUF

## Resumen

ONIX-BioMistral-7B-GGUF es una cuantización en formato GGUF del modelo BioMistral/BioMistral-7B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor original del modelo base es el proyecto BioMistral, y esta publicación se limita a ofrecer los pesos convertidos a Q5_K_M (5,5 bits por peso) junto con instrucciones de despliegue local. El pipeline declarado es text-generation y la librería asociada es gguf.

El modelo base pertenece a la familia Mistral, con 7.241.728.000 parámetros (7,24 mil millones) y arquitectura transformer densa. La cuantización reduce el peso de los ficheros de 14,16 GB en FP16 a 4,87 GB, una compresión del 65,6 % (ratio 2,91x), con una retención de calidad estimada del 97,5 % según el informe de telemetría incluido en la model card. El contexto óptimo declarado por el autor es de 8.192 tokens en GPU y Apple Silicon, y de 4.096 tokens en CPU.

Su relevancia es práctica: permite ejecutar un modelo de dominio biomédico de 7B en hardware de consumo (unified memory de 5,44 GB en Apple Silicon, 6,37 GB de VRAM en GPU NVIDIA, 7,44 GB de RAM en CPU) mediante llama.cpp, Ollama, LM Studio, Jan o la CLI run-any-model. No obstante, la información pública disponible es muy limitada: cero descargas, cero likes, sin datos de benchmarks propios y sin idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa, familia Mistral (modelo base BioMistral-7B) |
| Parametros totales | 7.241.728.000 (7,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU y Apple Silicon); 4.096 tokens (CPU) según el autor |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); única variante publicada en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `BioMistral--BioMistral-7B-Q5_K_M.gguf`, 4,87 GB) |

## Arquitectura y entrenamiento

El modelo base BioMistral-7B es un transformer denso de la familia Mistral con 7,24 mil millones de parámetros. Esta publicación no aporta información sobre el proceso de entrenamiento del modelo original: la model card no detalla el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovación arquitectónica específica más allá de la herencia de la familia Mistral.

La contribución técnica de este artefacto es exclusivamente la cuantización: conversión de pesos FP16 a Q5_K_M mediante el motor run-any-model, con un ratio de compresión de 2,91x y una retención de calidad estimada del 97,5 %. El informe de telemetría incluido indica aceleración de las 32 capas en Metal (Apple Silicon) y un buffer de KV cache de 512 MB en FP16, sin cambios respecto al baseline. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva en el pipeline text-generation, orientada por el modelo base al dominio biomédico.
- Conversación multi-turno mediante los modos chat de llama.cpp (`-cnv`), Ollama y la CLI run-any-model.
- Ejecución local multiplataforma: Metal en Apple Silicon, CUDA en GPU NVIDIA RTX 30/40/50 y AVX2/AVX-512 en CPU.
- Compatibilidad con los formatos de prompt de Mistral declarados en la model card (tokens de parada `<|im_end|>` y `<|endoftext|>`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).

## Casos de uso

- Asistencia documental biomédica en local: el modelo base está orientado al dominio médico, por lo que puede emplearse para resumir literatura o responder consultas sobre textos clínicos sin enviar datos a servicios externos, usando los 8.192 tokens de contexto en GPU.
- Prototipado en portátiles de consumo: con 4,87 GB de pesos y 5,44 GB de memoria unificada en Apple Silicon, permite iterar sobre prompts y evaluar respuestas en un M1/M2/M3 sin infraestructura dedicada.
- Despliegue en estaciones de trabajo con GPU de gama media: 6,37 GB de VRAM encajan en tarjetas RTX 30/40/50, habilitando un servicio de generación de texto local para equipos pequeños.
- Investigación reproducible en entornos sin conectividad: el fichero GGUF autocontenido se ejecuta con llama.cpp en CPU (7,44 GB de RAM, contexto de 4.096 tokens), útil para laboratorios con requisitos de aislamiento de red.
- Integración en flujos de trabajo de escritorio: carga directa en LM Studio, Jan o Text-Generation-WebUI colocando el fichero en el directorio `models/`, lo que facilita pruebas de concepto por perfiles no técnicos.
- Evaluación comparativa de cuantizaciones: al publicarse el informe de telemetría con métricas de tamaño, RAM residente y retención estimada, sirve como referencia para medir el impacto de Q5_K_M frente a FP16 en tareas de dominio.
- Base para ajuste fino posterior: los pesos cuantizados no son directamente entrenables, pero el identificador del modelo base permite descargar la versión FP16 de BioMistral/BioMistral-7B para fine-tuning y volver a cuantizar después.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye un informe de telemetría de recursos, no de calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 14,16 GB | 4,87 GB | -65,6 % |
| KV cache | 512 MB (FP16) | 512 MB (FP16) | Optimizado |
| RAM residente total | 14,74 GB | 5,44 GB | -63,1 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 32/32 capas | Optimo |

No se aportan cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de calidad, ni latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,37 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50 series), según el autor.
- Memoria unificada en Apple Silicon: 5,44 GB en chips M1/M2/M3/M4/M5 con aceleración Metal nativa.
- CPU: 7,44 GB de RAM libre con soporte AVX2/AVX-512, contexto recomendado de 4.096 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6,4 GB de VRAM; el tamaño de pesos (4,87 GB) deja margen para KV cache y overhead en GPUs de 8 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-BioMistral-7B-GGUF (esta ficha) | 7,24 B | 8.192 tokens (GPU) / 4.096 (CPU) | GGUF Q5_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| BioMistral/BioMistral-7B (base) | 7,24 B | no disponible en esta información | safetensors (FP16) | Apache 2.0 | Hugging Face |
| Mistral-7B (familia base) | 7,24 B | no disponible en esta información | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF de BioMistral-7B | 7,24 B | no disponible en esta información | GGUF (varias) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto derivado sin tracción verificable: el repositorio registra 0 descargas y 0 likes, y no hay evidencia de validación por terceros.
- Calidad de la cuantización no auditada de forma independiente: el 97,5 % de retención es una estimación del propio autor, no un resultado de benchmarks de tarea.
- Sesgos del modelo base: al estar orientado al dominio biomédico, puede heredar sesgos de su corpus de entrenamiento; no se documentan evaluaciones de sesgo en esta publicación.
- Riesgo de alucinación: relevante en un modelo de dominio médico; la model card descarga toda responsabilidad sobre las salidas y exige validación independiente por parte del usuario.
- Limitaciones de contexto: 8.192 tokens en GPU frente a 4.096 en CPU; no se documenta la ventana nativa del modelo base.
- Idiomas no declarados: no es posible confirmar el soporte multilingüe sin consultar la model card del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card incluye una cláusula de exención total de responsabilidad que conviene revisar antes de un despliegue en producción.
- No apto para uso clínico directo: no hay validación regulatoria ni evaluación clínica documentada; cualquier aplicación sanitaria requeriría supervisión profesional.
- Fecha de creación anómala (2026-11-25) en los metadatos del repositorio, lo que sugiere posibles inconsistencias en la publicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-BioMistral-7B-GGUF
- Modelo base: https://huggingface.co/BioMistral/BioMistral-7B
- Organización ONIX: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
