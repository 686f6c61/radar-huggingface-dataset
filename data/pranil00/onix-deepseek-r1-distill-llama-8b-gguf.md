# pranil00/ONIX-DeepSeek-R1-Distill-Llama-8B-GGUF

## Resumen

ONIX-DeepSeek-R1-Distill-Llama-8B-GGUF es una cuantizacion en formato GGUF del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Llama de 8.030 millones de parametros, orientado a generacion de texto y razonamiento. Esta version concreta aplica cuantizacion Q5_K_M (5,5 bits por peso) para reducir el peso de 15,71 GB en FP16 a 5,40 GB, con el objetivo de hacerlo ejecutable en hardware de consumo.

La publicacion se presenta como un artefacto listo para su uso con llama.cpp, Ollama, LM Studio y el runner propio del autor (run-any-model). El repositorio ocupa 5,8 GB e incluye un unico fichero GGUF. No se documentan datos de entrenamiento adicionales ni ajustes posteriores: se trata exclusivamente de una conversion de pesos, no de un modelo nuevo.

La relevancia de esta ficha es practica: permite evaluar si un destilado de razonamiento de 8B en Q5_K_M cabe en un equipo de consumo y con que margen. Cabe advertir que el repositorio no registra descargas ni interacciones en el momento de la consulta y que el autor no aporta evaluaciones independientes de calidad mas alla de la estimacion del propio pipeline de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, modelo base DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | 8.030.257.152 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU segun la model card (no se especifica el contexto nativo del modelo base) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero deepseek-ai--DeepSeek-R1-Distill-Llama-8B-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Llama-3.1-8B, entrenado por DeepSeek mediante distillacion a partir de trazas de razonamiento del modelo R1 completo. La arquitectura es un transformer decoder-only denso de 8,03 B de parametros, sin mezcla de expertos. Esta publicacion no aporta informacion adicional sobre el dataset de destilacion, el numero de tokens empleados ni las fases de RLHF o DPO del modelo original; esos datos corresponden a la model card de deepseek-ai y no se reproducen aqui.

La innovacion tecnica de esta ficha es la cuantizacion: Q5_K_M con 5,5 bits por peso, factor de compresion de 2,91x respecto a FP16 (reduccion del 65,6 % del peso). El autor reporta una retencion de calidad estimada del 97,5 % y una aceleracion de las 32 capas en Metal. El KV cache se mantiene en FP16 (512 MB) segun la auditoria incluida. No hay decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas: es una conversion de pesos estandar.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredados del proceso de destilacion de DeepSeek-R1 (cadenas de pensamiento antes de la respuesta).
- Razonamiento matematico y resolucion de problemas de varios pasos, capacidad principal del modelo base destilado.
- Generacion de codigo y explicacion de codigo, dentro de las capacidades tipicas de un modelo de 8B.
- Soporte de conversacion multi-turno mediante plantilla de chat (la model card sugiere los tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, uso de agentes y vision: no documentados en la informacion proporcionada.

## Casos de uso

- Razonamiento local en portatil: ejecutar el modelo con llama.cpp u Ollama en un equipo con 8 GB de RAM o 6,9 GB de VRAM para resolver problemas de logica o matematicas sin enviar datos a la nube, gracias a que el fichero Q5_K_M ocupa 5,40 GB.
- Asistente de codigo en estaciones de trabajo sin GPU dedicada: con 7,97 GB de RAM libre y contexto de 4.096 tokens, el modelo puede autocompletar funciones, explicar errores y proponer refactorizaciones en un editor integrado via API local.
- Prototipado de pipelines de razonamiento: usar las trazas de pensamiento del destilado para generar cadenas de razonamiento en tareas de clasificacion o extraccion estructurada antes de invertir en un modelo mayor.
- Educacion y tutoria tecnica: desplegar un asistente que explique paso a paso problemas de fisica o programacion en un aula con equipos Apple Silicon, aprovechando la aceleracion Metal de las 32 capas.
- Evaluacion comparativa de cuantizaciones: servir como referencia Q5_K_M frente a otras cuantizaciones del mismo modelo base para medir la perdida de calidad en tareas de razonamiento en un banco de pruebas propio.
- Automatizacion de oficina con privacidad: resumir documentos y redactar borradores en local con LM Studio, sin coste de API y con los datos confinados en el equipo, dentro del limite de contexto de 8.192 tokens.
- Base para fine-tuning ligero: partir del GGUF para experimentos de LoRA en entornos con recursos limitados, teniendo en cuenta que el ajuste fino requiere convertir a otro formato.

## Benchmarks y rendimiento

La model card incluye una auditoria del pipeline de cuantizacion, no benchmarks de calidad del modelo. Los datos disponibles son de memoria y compresion:

| Metrica | FP16 (base) | Q5_K_M | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 15,71 GB | 5,40 GB | -65,6 % |
| KV cache | 512 MB (FP16) | 512 MB (FP16) | sin cambio |
| RAM residente total | 16,28 GB | 5,97 GB | -63,3 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 32/32 | optimo |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La cifra de retencion del 97,5 % es una estimacion del propio pipeline de cuantizacion, no una medicion independiente.

## Requisitos de hardware

- Apple Silicon (M1 a M5): 5,97 GB de memoria unificada, contexto optimo de 8.192 tokens, aceleracion Metal nativa de las 32 capas.
- GPU NVIDIA (RTX 30/40/50): 6,90 GB de VRAM dedicada, contexto de 8.192 tokens, aceleracion CUDA.
- CPU x86 en Windows o Linux: 7,97 GB de RAM libre, contexto recomendado de 4.096 tokens, soporte AVX2 y AVX-512.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, 4060, 4070, etc.); en 6 GB queda muy justo por el KV cache.
- Despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama con Modelfile, LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model del autor.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-Distill-Llama-8B-GGUF (esta ficha) | 8,03 B | 8.192 (GPU) / 4.096 (CPU) segun card | Q5_K_M, GGUF, 5,40 GB | Apache 2.0 | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03 B | no disponible en esta informacion | safetensors (FP16/BF16) | Licencia del modelo base (consultar) | Hugging Face oficial |
| Otras cuantizaciones GGUF del mismo base (p. ej. Q4_K_M de terceros) | 8,03 B | segun fichero | Q4_K_M y otras | Apache 2.0 en la mayoria | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La cifra de retencion de calidad del 97,5 % procede del pipeline del autor y no esta validada de forma independiente; la perdida real en tareas de razonamiento matematico puede ser mayor.
- El repositorio no registra descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion por terceros.
- La model card mezcla licencias ("Apache 2.0 / MIT") y no aclara la licencia del modelo base de DeepSeek; antes de uso comercial conviene verificar los terminos de deepseek-ai/DeepSeek-R1-Distill-Llama-8B.
- El autor incluye una clausula de exencion total de responsabilidad sobre cualquier salida del modelo; en produccion es necesario auditar y filtrar las respuestas.
- Riesgo de alucinacion inherente a un modelo de 8B destilado, especialmente en dominios especializados y con contexto largo; las trazas de razonamiento no garantizan correccion.
- El contexto recomendado por el autor (8.192 tokens en GPU, 4.096 en CPU) es menor que el nativo del modelo base; prompts largos pueden degradar la calidad o exceder la ventana configurada.
- Idiomas soportados no documentados: no hay garantia de calidad en castellano mas alla de la herencia del modelo base.
- Al ser una conversion de pesos, no incorpora mejoras de seguridad ni ajustes de alineacion adicionales respecto al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-Distill-Llama-8B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Organizacion ONIX: https://huggingface.co/ONIX
- Runner run-any-model: https://github.com/PranilShah-08/run-any-model
