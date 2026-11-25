# pranil00/ONIX-CodeLlama-34b-Instruct-hf-GGUF

## Resumen

ONIX-CodeLlama-34b-Instruct-hf-GGUF es una cuantización en formato GGUF del modelo CodeLlama-34b-Instruct-hf de Meta, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo consiste en comprimir los pesos originales de 33.743.962.112 parámetros (FP16, ~66 GB) a un esquema de cuantización IQ2_M de 2,7 bits por peso, reduciendo el tamaño a 11,14 GB, un ratio de compresión de 5,93x.

El objetivo declarado es hacer ejecutable un modelo de 34B en hardware de consumo: Mac con memoria unificada de 16 GB, GPUs NVIDIA con 12 GB de VRAM o PCs con 13,5 GB de RAM libre. El autor reporta una retención de calidad estimada del 82 % respecto al modelo FP16, con degradación reconocida en razonamiento matemático complejo.

La relevancia es acotada: el modelo base CodeLlama-34b-Instruct es de agosto de 2023 y su licencia original de Meta no es Apache 2.0, pese a lo que indica la model card del artefacto. La ficha del repositorio no incluye idiomas soportados, benchmarks ni datos de entrenamiento propios, por lo que buena parte de las especificaciones se heredan del modelo base y se marcan como no disponibles cuando no hay confirmación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (según model card) |
| Parametros totales | 33.743.962.112 (33,74B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (óptimo declarado en GPU y Apple Silicon); 4.096 tokens en CPU; contexto nativo del base: 16.384 tokens (no confirmado en este artefacto) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 declarada en el repositorio; el modelo base CodeLlama se distribuye bajo Llama 2 Community License (discrepancia no resuelta) |
| Formato de pesos | GGUF (fichero `codellama--CodeLlama-34b-Instruct-hf-IQ2_M.gguf`, 11,14 GB) |
| Tamano del repositorio | 12,0 GB |
| Modelo base | codellama/CodeLlama-34b-Instruct-hf |
| Fecha de publicacion | 2026-11-25 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversión de pesos del checkpoint CodeLlama-34b-Instruct-hf a GGUF con cuantización IQ2_M, un esquema de cuantización por bloques con importancia (importance matrix) que asigna distinto número de bits según la sensibilidad de cada tensor, con una media de 2,7 bits por peso. La arquitectura subyacente es un transformer decoder-only de la familia LLaMA con 34B parámetros densos, sin mezcla de expertos ni mecanismos de atención lineal.

No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del corpus, fases de RLHF o DPO). CodeLlama-34b-Instruct fue entrenado por Meta con ajuste supervisado e instrucciones sobre el modelo CodeLlama base; para detalles verificables debe consultarse la model card oficial de Meta. La única innovación técnica documentada en este repositorio es el pipeline de cuantización `run-any-model`, que el autor describe como un motor de optimización adaptativo al dispositivo, con aceleración de las 48 capas en Metal y soporte AVX2/AVX-512 en CPU.

## Capacidades

- Generación de texto y código: el modelo base está especializado en lenguajes de programación (Python, C++, Java, PHP, TypeScript, Bash, entre otros) y en instrucciones en lenguaje natural.
- Relleno de código (fill-in-the-middle): capacidad nativa de CodeLlama para completar código con contexto izquierdo y derecho; no se confirma que el formato de prompt se preserve tras la cuantización.
- Razonamiento multi-turno: el checkpoint es la variante Instruct, ajustada para seguir instrucciones y mantener conversación.
- Contexto largo: hasta 8.192 tokens según la configuración óptima declarada por el autor, por debajo de los 16.384 tokens del base.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor advierte degradación en razonamiento matemático complejo.
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente a inglés.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio.

## Casos de uso

- Autocompletado de código en local: desplegado con llama.cpp u Ollama en un portátil con 16 GB de memoria unificada, el modelo puede ofrecer sugerencias de código sin enviar el contexto a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Asistente de refactorización en estaciones de trabajo con GPU de 12 GB: con una ventana de 8.192 tokens cabe un fichero de código mediano más instrucciones, suficiente para tareas de reescritura y explicación de funciones.
- Generación de tests unitarios en pipelines de integración continua: al ser un artefacto GGUF de 11 GB, puede ejecutarse en runners con CPU y AVX-512, generando borradores de tests que luego se validan automáticamente.
- Documentación técnica automatizada: el modelo puede resumir módulos y generar docstrings en una pasada con contexto de varios miles de tokens, útil en repositorios de tamaño medio.
- Enseñanza y experimentación con cuantización extrema: sirve como caso de estudio de hasta dónde se puede comprimir un 34B con IQ2_M y qué pérdida de calidad se produce (el autor estima un 82 % de retención), útil en investigación sobre eficiencia de inferencia.
- Chat de soporte para dudas de programación en herramientas de escritorio: integrable en LM Studio o Jan como asistente local para consultas de sintaxis y APIs, aceptando la menor fiabilidad en matemáticas y razonamiento profundo.
- Prototipado offline en entornos sin conectividad: al ejecutarse íntegramente en CPU con 13,5 GB de RAM, permite disponer de un asistente de código en máquinas aisladas.

## Benchmarks y rendimiento

La model card solo aporta métricas de compresión y consumo de memoria del pipeline de cuantización, no resultados de calidad sobre benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos disponibles:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 2,7 | -83,1 % |
| Tamano de pesos | 66,00 GB | 11,14 GB | -83,1 % |
| KV cache | 192,0 MB (FP16) | 192,0 MB (Q4_0) | Optimizado |
| RAM residente total | 66,90 GB | 11,47 GB | -82,8 % |
| Calidad estimada | 100,0 % baseline | 82,0 % retenida | -18,0 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 48/48 | Óptimo |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La cifra de "82 % de retención" es una estimación del autor, no una medición sobre un conjunto de evaluación público documentado.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 11,47 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa.
- GPU NVIDIA (series RTX 30/40/50): 12,64 GB de VRAM dedicada, contexto óptimo de 8.192 tokens, aceleración CUDA.
- PC Windows/Linux en CPU: 13,47 GB de RAM libre, contexto óptimo de 4.096 tokens, requiere AVX2 o AVX-512.
- Cabe en GPUs de consumo con 16 GB o más de VRAM (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, RTX 5070 Ti en adelante); en 12 GB (RTX 3060 12 GB, RTX 4070) el margen es ajustado y obliga a limitar el contexto.
- Opciones de despliegue documentadas: `run-any-model` CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -ngl 99 -cnv`) y LM Studio / Jan / Text-Generation-WebUI.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo en ninguno de los perfiles de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-CodeLlama-34b-Instruct-hf-GGUF (este) | 33,74B | 8.192 (declarado) | GGUF IQ2_M, 11,14 GB | Apache 2.0 declarada (base: Llama 2 Community License) | Hugging Face, 0 descargas |
| codellama/CodeLlama-34b-Instruct-hf (base) | 33,74B | 16.384 | safetensors FP16, ~66 GB | Llama 2 Community License | Hugging Face, oficial de Meta |
| Otras cuantizaciones GGUF de CodeLlama-34b-Instruct (p. ej. Q4_K_M) | 33,74B | 16.384 | GGUF, ~20 GB | Llama 2 Community License | Hugging Face, comunidad |
| Modelos de código de 30-34B con licencia permisiva (p. ej. familias Qwen-Coder o DeepSeek-Coder de tamano comparable) | ~30-34B | 32.768 o superior en varias variantes | safetensors y GGUF | Apache 2.0 en varias variantes | Hugging Face |

La comparación directa con alternativas modernas debe hacerse con cautela: no hay benchmarks publicados para este artefacto y el modelo base es de 2023. La ventaja diferencial del artefacto es el tamano (11,14 GB), que permite ejecutar un 34B donde otras cuantizaciones de 4 bits (~20 GB) no caben; el coste es una pérdida de calidad estimada del 18 % y un contexto declarado inferior al del base.

## Limitaciones y advertencias

- Calidad degradada por cuantización extrema: IQ2_M a 2,7 bits por peso; el propio autor reconoce degradación en razonamiento matemático complejo y estima una retención del 82 %, cifra no verificada con benchmarks.
- Discrepancia de licencia: el repositorio declara Apache 2.0, pero el modelo base CodeLlama se distribuye bajo la Llama 2 Community License, que impone restricciones de uso comercial y obligaciones de atribución. Para uso comercial debe verificarse la licencia del modelo base y no asumir la del artefacto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en código se traduce en APIs inexistentes, firmas incorrectas o dependencias inventadas. El autor declina toda responsabilidad sobre las salidas.
- Contexto reducido en la práctica: 8.192 tokens en GPU y Apple Silicon, 4.096 en CPU, frente a los 16.384 del base; insuficiente para repositorios grandes o conversaciones muy largas.
- Idiomas no documentados: el modelo base está centrado en inglés; el rendimiento en castellano no está evaluado.
- Sin soporte documentado de tool calling ni de flujos de agente; no debe asumirse compatibilidad con protocolos de function calling.
- Artefacto de terceros sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la conversión ni del informe de telemetría del autor.
- Fecha de publicación anómala (2026-11-25): conviene verificar la integridad del repositorio antes de desplegarlo en producción.
- El KV cache en Q4_0 puede introducir errores adicionales en contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-CodeLlama-34b-Instruct-hf-GGUF
- Modelo base: https://huggingface.co/codellama/CodeLlama-34b-Instruct-hf
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Repositorio del motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
