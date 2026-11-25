# pranil00/ONIX-CodeLlama-13b-Instruct-hf-GGUF

## Resumen

ONIX-CodeLlama-13b-Instruct-hf-GGUF es una cuantizacion en formato GGUF del modelo CodeLlama-13b-Instruct-hf de Meta, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor ha convertido los pesos originales en FP16 de CodeLlama-13b-Instruct a una cuantizacion Q5_K_M (5,5 bits por peso) mediante su herramienta run-any-model, con el objetivo de reducir el peso de 25,46 GB a 8,75 GB y permitir la ejecucion en hardware de consumo.

CodeLlama-13b-Instruct es un transformer decoder-only de la familia LLaMA con 13.016 millones de parametros, especializado en generacion y comprension de codigo, y ajustado con instrucciones para seguir dialogos y peticiones en lenguaje natural. La version Instruct incorpora un formato de chat con etiquetas de sistema, usuario y asistente, y esta pensada para tareas de asistencia a la programacion, explicacion de codigo y generacion de fragmentos funcionales.

La relevancia de esta ficha radica en que documenta un artefacto de cuantizacion de un modelo base ampliamente conocido, con un enfoque declarado en el despliegue local multiplataforma (Apple Silicon, GPU NVIDIA y CPU). No obstante, la model card contiene afirmaciones de rendimiento y "fidelidad cognitiva" que no estan respaldadas por evaluaciones independientes y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA), modelo base CodeLlama-13b-Instruct |
| Parametros totales | 13.016.023.040 (13,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU (segun model card); contexto nativo del base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico archivo publicado |
| Idiomas soportados | No disponible (el modelo base esta orientado principalmente a ingles y lenguajes de programacion) |
| Licencia | Apache 2.0 (declarada en el repo y en la model card) |
| Formato de pesos | GGUF (archivo `codellama--CodeLlama-13b-Instruct-hf-Q5_K_M.gguf`, 8,75 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es CodeLlama-13b-Instruct-hf, un transformer decoder-only denso de 13.016 millones de parametros perteneciente a la familia LLaMA. CodeLlama fue desarrollado por Meta a partir de Llama 2, con un entrenamiento adicional sobre un corpus especifico de codigo y una fase de ajuste por instrucciones (instruction tuning) que da lugar a la variante Instruct. La model card de esta cuantizacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles de RLHF o DPO empleados en el modelo original; esos datos corresponden a la documentacion oficial de Meta y no estan incluidos en la informacion proporcionada.

La contribucion del autor de este repositorio es exclusivamente la cuantizacion: convertir los pesos FP16 a Q5_K_M mediante la herramienta run-any-model, que segun la model card aplica una aceleracion por capas (40/40 capas) y un esquema de "device-adaptive" para Metal, CUDA y CPU con AVX2/AVX-512. La model card afirma una retencion de calidad del 97,5 % y una compresion de 2,91x, pero no presenta evaluaciones con benchmarks estandar que respalden esas cifras. No se describe ninguna innovacion arquitectonica propia (no hay decodificacion especulativa, atencion lineal ni mezcla de expertos).

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (Python, C++, Java, JavaScript, entre otros), heredadas de CodeLlama.
- Relleno de codigo (code infilling) y autocompletado, capacidad nativa de la familia CodeLlama.
- Seguimiento de instrucciones en formato de chat (system/user/assistant) gracias al ajuste Instruct del modelo base.
- Explicacion y documentacion de fragmentos de codigo, resumen de funciones y generacion de comentarios.
- Razonamiento basico sobre codigo: deteccion de errores, sugerencias de refactorizacion y traduccion entre lenguajes.
- Conversacion multi-turno dentro de la ventana de contexto configurada (4.096-8.192 tokens segun plataforma).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en un IDE o terminal (por ejemplo, mediante llama.cpp u Ollama) para autocompletar y explicar codigo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba en el mismo lenguaje, aprovechando su entrenamiento especifico en codigo.
- Documentacion automatica de repositorios: generar docstrings y comentarios a partir de funciones existentes, con una ventana de contexto de hasta 8.192 tokens que permite procesar archivos completos de tamano medio.
- Traduccion entre lenguajes de programacion: convertir fragmentos de Python a C++ o de Java a Go, tarea para la que CodeLlama muestra un rendimiento razonable en el modelo base.
- Educacion y tutoria: explicar conceptos de programacion y depurar errores en conversaciones multi-turno, con la ventaja de ejecutarse en un portatil con GPU de consumo.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: al caber en CPU con 13,97 GB de RAM libre (segun la model card), permite desplegar un asistente de codigo en equipos modestos.
- Preprocesamiento de codigo en pipelines de CI/CD: generar resumenes de cambios o detectar patrones sospechosos en diffs, aunque con la advertencia de que no se documenta soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una tabla de telemetria interna de la herramienta run-any-model (tamano de pesos, RAM residente y "calidad retenida" estimada del 97,5 %), que no constituye una evaluacion con benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica declarada (model card) | FP16 (base) | Q5_K_M (este repo) |
|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 |
| Tamano de pesos | 25,46 GB | 8,75 GB |
| RAM total residente (Apple Silicon) | 28,68 GB | 11,97 GB |
| Capas aceleradas | 0 % | 40/40 |
| Calidad estimada | 100 % | 97,5 % (estimacion del autor, no verificada) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,25 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) segun la model card, con contexto de 8.192 tokens.
- Memoria unificada en Apple Silicon: 11,97 GB (M1/M2/M3/M4/M5), con aceleracion Metal.
- CPU: 13,97 GB de RAM libre, con soporte AVX2/AVX-512 y contexto recomendado de 4.096 tokens.
- GPU recomendadas: RTX 3090, RTX 4080, RTX 4090 y superiores para ejecucion comoda; A100/H100 no son necesarias para este tamano, pero funcionarian con holgura.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en GPUs de 8 GB requeriria cuantizaciones mas agresivas no publicadas en este repo.
- Opciones de despliegue: llama.cpp (llama-cli con `-ngl 99`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-CodeLlama-13b-Instruct-hf-GGUF (este repo) | 13,02 B | 4.096-8.192 tokens (segun plataforma) | GGUF Q5_K_M, 8,75 GB | Apache 2.0 | Hugging Face, 0 descargas |
| CodeLlama-13b-Instruct-hf (oficial, Meta) | 13,02 B | No disponible en la informacion proporcionada | Safetensors FP16, ~25,5 GB | Licencia Llama 2 (uso comercial con restricciones) | Hugging Face oficial |
| CodeLlama-7b-Instruct | 7 B | No disponible en la informacion proporcionada | Safetensors / GGUF | Licencia Llama 2 | Hugging Face oficial |
| Otras cuantizaciones GGUF de CodeLlama-13b-Instruct (p. ej. TheBloke) | 13,02 B | Variable | Multiples cuantizaciones (Q4_K_M, Q5_K_M, Q8_0, etc.) | Licencia Llama 2 | Hugging Face |

Nota: la licencia declarada en este repo es Apache 2.0, mientras que el modelo base CodeLlama se distribuye bajo la licencia de la familia Llama 2. Esta discrepancia es relevante y se detalla en la seccion de limitaciones.

## Limitaciones y advertencias

- Discrepancia de licencia: la model card y el repo declaran Apache 2.0, pero el modelo base CodeLlama-13b-Instruct-hf se publica bajo la licencia de Llama 2, que impone restricciones de uso comercial y obligaciones de atribucion. La relicencia a Apache 2.0 por parte de un tercero no esta respaldada por el titular original y debe verificarse antes de un uso comercial.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo sintacticamente plausible pero incorrecto, APIs inexistentes o explicaciones erroneas; requiere validacion humana y tests automatizados.
- Sesgos: el modelo base se entreno predominantemente con codigo y texto en ingles, por lo que su rendimiento en castellano y otros idiomas es limitado; la model card no documenta evaluaciones multilingues.
- Contexto limitado: la ventana recomendada es de 4.096-8.192 tokens, insuficiente para repositorios grandes o conversaciones muy largas.
- Artefacto sin validacion independiente: 0 descargas y 0 likes en el momento de la ficha; no hay evaluaciones de terceros que confirmen la retencion de calidad del 97,5 % declarada por el autor.
- Unica cuantizacion disponible: solo se publica Q5_K_M, por lo que no hay opciones para GPUs con menos de 10 GB de VRAM ni versiones de mayor precision.
- Advertencia legal del autor: la model card incluye un descargo de responsabilidad absoluta que traslada al usuario toda la responsabilidad sobre las salidas del modelo.
- Fecha de publicacion inusual (2026-11-25 segun los metadatos): conviene verificar la integridad y procedencia del artefacto antes de desplegarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-CodeLlama-13b-Instruct-hf-GGUF
- Modelo base: https://huggingface.co/codellama/CodeLlama-13b-Instruct-hf
- Organizacion ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
