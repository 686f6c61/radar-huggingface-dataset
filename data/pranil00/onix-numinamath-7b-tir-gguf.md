# pranil00/ONIX-NuminaMath-7B-TIR-GGUF

## Resumen

ONIX-NuminaMath-7B-TIR-GGUF es una cuantización de tipo GGUF en formato Q5_K_M del modelo base AI-MO/NuminaMath-7B-TIR, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo original, desarrollado por AI-MO, es un modelo de lenguaje especializado en razonamiento matemático que emplea la técnica TIR (Tool-Integrated Reasoning), es decir, la capacidad de integrar herramientas externas como intérpretes de Python en el proceso de resolución de problemas. Esta versión cuantizada reduce el peso de los pesos de 13,52 GB en FP16 a 4,65 GB, lo que permite su ejecución en hardware de consumo.

La relevancia de esta ficha radica en que ofrece un artefacto listo para desplegar en entornos locales con recursos limitados, manteniendo una retención de calidad estimada del 97,5 % según los datos del autor de la cuantización. El modelo pertenece a la familia arquitectónica LLaMA, cuenta con 6.910.361.600 parámetros y está pensado para tareas de generación de texto con énfasis en matemáticas y razonamiento paso a paso.

No se dispone de información sobre la longitud de contexto nativa del modelo base, los idiomas soportados ni los resultados de benchmarks en la información proporcionada. La licencia declarada es Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (familia) |
| Parametros totales | 6.910.361.600 (6,91 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion; el autor reporta ventanas de 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del archivo | 4,65 GB (4.757,3 MB) |
| Modelo base | AI-MO/NuminaMath-7B-TIR |
| Ratio de compresion | 2,91x (65,6 % de reduccion frente a FP16) |
| Retencion de calidad declarada | ~97,5 % |

## Arquitectura y entrenamiento

La arquitectura del modelo base es de tipo transformer decoder-only de la familia LLaMA, con 6,91 mil millones de parámetros. El modelo original AI-MO/NuminaMath-7B-TIR incorpora la técnica TIR (Tool-Integrated Reasoning), que permite al modelo emitir llamadas a herramientas externas (típicamente un intérprete de Python) durante la resolución de problemas matemáticos, combinando el razonamiento en lenguaje natural con la ejecución de código para verificar y calcular resultados.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento en el modelo base. La cuantización Q5_K_M se ha generado con la herramienta run-any-model, un motor de optimización adaptativo al dispositivo que produce archivos GGUF con aceleración por capas (30/30 capas aceleradas según el informe del autor).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con énfasis en la resolución de problemas de competición y cálculo simbólico.
- Razonamiento integrado con herramientas (TIR): el modelo puede emitir llamadas a un intérprete de Python para ejecutar cálculos y verificar resultados intermedios.
- Generación de código auxiliar para la resolución de problemas (scripts de Python orientados a matemáticas).
- Soporte de conversación multi-turno mediante plantillas de chat con tokens de parada (`<|im_end|>`, `<|endoftext|>`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: implícito en la técnica TIR del modelo base, aunque no se detalla el formato exacto de las llamadas.
- Capacidades de agente multi-paso: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Resolución asistida de problemas matemáticos: el modelo puede recibir un enunciado y generar una traza de razonamiento con llamadas a Python para calcular derivadas, integrales o sistemas de ecuaciones, lo que resulta adecuado por su entrenamiento específico en TIR.
- Tutoría educativa local: desplegado con Ollama o llama.cpp en un portátil, puede ofrecer explicaciones paso a paso de problemas de álgebra y cálculo sin depender de la nube, gracias a sus 4,65 GB de pesos.
- Verificación de cálculos en pipelines de datos: integrado como paso de validación en scripts de procesamiento, el modelo puede generar y ejecutar código Python para comprobar resultados numéricos.
- Generación de código científico en entornos con recursos limitados: su tamaño cuantizado permite ejecutarlo en GPUs de consumo (RTX 30/40/50) con 6,15 GB de VRAM, útil para prototipado de scripts de análisis numérico.
- Investigación en razonamiento con herramientas: sirve como base para experimentos académicos sobre TIR y verificación de razonamiento, al ser un artefacto ligero y de licencia permisiva.
- Despliegue en Apple Silicon para desarrollo móvil: con 6,60 GB de memoria unificada y aceleración Metal nativa, es viable en MacBook con M1 o superior para pruebas de asistentes matemáticos offline.
- Evaluación comparativa de cuantizaciones: al existir el modelo base en FP16, esta versión Q5_K_M permite medir la degradación de calidad en tareas matemáticas con un coste de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización únicamente reporta métricas de compresión y retención de calidad estimada (~97,5 %), sin valores de MMLU, GSM8K, HumanEval ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,15 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) con ventana de 8.192 tokens.
- Memoria unificada en Apple Silicon: 6,60 GB en chips M1/M2/M3/M4/M5 con aceleración Metal nativa.
- RAM en CPU: 8,60 GB libres en Windows/Linux, con soporte AVX2/AVX-512 y ventana de 4.096 tokens.
- GPU recomendadas: RTX 3060 12 GB o superiores; A100/H100 no son necesarias pero funcionarían con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-NuminaMath-7B-TIR-GGUF (Q5_K_M) | 6,91 B | 8.192 (GPU) / 4.096 (CPU) segun autor | GGUF | Apache 2.0 | Cuantizacion Q5_K_M, 4,65 GB |
| AI-MO/NuminaMath-7B-TIR (FP16) | 6,91 B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar, 13,52 GB |
| Modelos matematicos 7B de la familia LLaMA (generico) | ~7 B | no disponible | GGUF / safetensors | variable | Alternativas como DeepSeek-Math-7B o MetaMath-7B no se detallan en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q5_K_M introduce una pérdida de calidad estimada del 2,5 % respecto al modelo base en FP16, según el propio autor; en tareas matemáticas de alta precisión esta degradación puede ser relevante.
- El modelo está especializado en matemáticas y razonamiento con herramientas; su rendimiento en tareas generales de lenguaje, código no matemático o conversación abierta no está documentado.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; en matemáticas, las trazas de razonamiento pueden contener errores no detectados si no se ejecuta la verificación con herramientas.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización incluye una cláusula de exención total de responsabilidad que conviene revisar antes de un despliegue en producción.
- El campo "idiomas" no está declarado en la model card; no se puede garantizar un rendimiento multilingüe equilibrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.
- La fecha de creación indicada (2026-11-25) es posterior a la fecha actual en la mayoría de contextos; conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-NuminaMath-7B-TIR-GGUF
- Modelo base: https://huggingface.co/AI-MO/NuminaMath-7B-TIR
- Organización ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
