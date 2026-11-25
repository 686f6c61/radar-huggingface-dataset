# pranil00/ONIX-EXAONE-3.5-32B-Instruct-GGUF

## Resumen

ONIX-EXAONE-3.5-32B-Instruct-GGUF es una cuantización en formato GGUF del modelo LGAI-EXAONE-3.5-32B-Instruct, publicado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto de pesos cuantizados con el esquema Q5_K_M (5,5 bits por peso) generado mediante la herramienta run-any-model, un motor de optimización adaptativo orientado a ejecución multiplataforma en hardware de consumo. El modelo base es un transformer de la familia EXAONE 3.5 desarrollado por LG AI Research.

El problema que resuelve esta publicación es de despliegue: el modelo original en FP16 ocupa aproximadamente 32,32 GB de pesos, lo que lo hace inviable en la mayoría de equipos de consumo. La versión Q5_K_M reduce el tamaño a 11,11 GB (ratio de compresión 2,91x, un 65,6 % menos), lo que permite su ejecución en equipos con 11,70 GB de memoria unificada en Apple Silicon, 12,61 GB de VRAM en GPU NVIDIA o 13,70 GB de RAM en CPU. La model card declara una retención de calidad estimada del 97,5 % respecto al baseline FP16.

Es relevante ahora porque democratiza el acceso a un modelo de la clase 32B en hardware consumer, con instrucciones concretas para Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI. Conviene señalar una discrepancia documental importante: el nombre del repositorio indica 32B, pero la model card declara 16.525.885.440 parámetros (16,53B), un dato que no coincide con el modelo base referenciado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia EXAONE 3.5) |
| Parametros totales | 16.525.885.440 (16,53B) segun model card; el nombre del repo indica 32B (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU (ventana optima declarada) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico archivo publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `LGAI-EXAONE--EXAONE-3.5-32B-Instruct-Q5_K_M.gguf`, 11,11 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de clasificarlo como transformer de la familia EXAONE 3.5. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si emplea tecnicas como GQA o RoPE. La model card de esta cuantizacion tampoco aporta datos sobre el corpus de entrenamiento, el volumen de tokens, la composicion del dataset ni si hubo etapas de RLHF, DPO o ajuste por instrucciones; solo se infiere que el modelo base es una variante Instruct.

La innovacion tecnica destacable de esta publicacion no esta en el modelo sino en el proceso de cuantizacion: la herramienta run-any-model aplica un esquema Q5_K_M con aceleracion de las 32 capas declaradas y un buffer de KV cache de 512 MB en FP16. El informe de telemetria incluido en la model card compara baseline FP16 (32,32 GB de pesos, 32,91 GB de RAM residente, "unusable/crash" en un host Darwin de 16 GB) frente a la version cuantizada (11,11 GB de pesos, 11,70 GB residentes, "excellent native fit"). Estos datos proceden del autor y no han sido verificados de forma independiente.

## Capacidades

- Generacion de texto en modo conversacional (pipeline `text-generation`), con plantilla de chat delimitada por los tokens especiales `<|im_end|>` y `<|endoftext|>`.
- Ajuste por instrucciones, segun la denominacion Instruct del modelo base.
- Ejecucion local en CPU, GPU NVIDIA (CUDA) y Apple Silicon (Metal), con aceleracion declarada de las 32 capas.
- Integracion con tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: temperature 0,7 y top_p 0,9.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo: con 11,70 GB de memoria unificada en Apple Silicon o 12,61 GB de VRAM en NVIDIA, el modelo puede mantener conversaciones multi-turno de hasta 8.192 tokens de contexto sin salir del equipo, lo que evita enviar datos a APIs externas.
- Prototipado de aplicaciones de texto en portatiles de gama alta: un portatil con GPU de 16 GB puede cargar el GGUF en LM Studio o Jan y servir como banco de pruebas para prompts y plantillas de chat antes de escalar a infraestructura mayor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local mediante llama.cpp u Ollama, es adecuado para procesar documentacion interna o borradores que no pueden salir de la red corporativa.
- Generacion y revision de texto tecnico en CPU: con 13,70 GB de RAM libre y contexto de 4.096 tokens, un servidor sin GPU puede ejecutar el modelo con instrucciones AVX2/AVX-512 para tareas de redaccion y resumen por lotes.
- Educacion e investigacion sobre cuantizacion: el repositorio incluye un informe de telemetria comparativo FP16 frente a Q5_K_M que sirve como caso practico para estudiar el impacto de la cuantizacion en el tamaño, la memoria residente y la calidad estimada.
- Evaluacion comparativa de modelos de gran tamano en hardware consumer: permite medir latencia y calidad de un modelo de la clase 16-32B cuantizado frente a alternativas mas pequenas, usando la CLI de run-any-model o llama-cli con `-ngl 99`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico conjunto de metricas aportado por el autor es el informe de telemetria de despliegue, que mide tamaño y memoria, no calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 32,32 GB | 11,11 GB | -65,6 % |
| Buffer KV cache | 512,0 MB (FP16) | 512,0 MB (FP16) | Optimizado |
| RAM residente total | 32,91 GB | 11,70 GB | -64,4 % |
| Categoria de viabilidad | No usable / crash | Excelente (encaje nativo) | Validado |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 32/32 capas | Optimo |

Estos valores proceden del autor (host Darwin con 16 GB de memoria) y no han sido verificados de forma independiente. La cifra de "97,5 % de retencion de calidad" es una estimacion del proceso de cuantizacion, no el resultado de una evaluacion con benchmarks estandar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (Q5_K_M): 11,70 GB de memoria unificada en Apple Silicon; 12,61 GB de VRAM dedicada en NVIDIA; 13,70 GB de RAM libre en CPU.
- GPU recomendadas: series NVIDIA RTX 30/40/50 con al menos 12,61 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, RTX 5070 Ti o superiores); Apple Silicon M1/M2/M3/M4/M5 con 16 GB o mas de memoria unificada. No se detallan modelos concretos de A100 o H100 en la informacion proporcionada.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM; en tarjetas de 12 GB el margen es muy ajustado (12,61 GB requeridos) y puede requerir reducir el contexto o descargar capas a CPU.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible. La model card no incluye tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-EXAONE-3.5-32B-Instruct-GGUF (esta ficha) | 16,53B declarados (nombre indica 32B) | 8.192 tokens (GPU); 4.096 (CPU) | GGUF Q5_K_M, 11,11 GB | Apache 2.0 | Hugging Face, 0 descargas |
| LGAI-EXAONE/EXAONE-3.5-32B-Instruct (base) | no disponible en la informacion | no disponible | safetensors (presumible, no confirmado) | no disponible en la informacion | Hugging Face (modelo base referenciado) |
| Alternativas de la misma clase | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables concretos con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre del repositorio y del archivo indica 32B, mientras que la model card declara 16.525.885.440 parametros (16,53B). Esta inconsistencia debe resolverse antes de usar el modelo en produccion, ya que afecta a las estimaciones de memoria y al calculo de la ventana de contexto.
- La cifra de retencion de calidad del 97,5 % es una estimacion del proceso de cuantizacion, no una medicion con benchmarks; la degradacion real en tareas de razonamiento, codigo o matematicas no esta documentada.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (25 de noviembre de 2026), sin historial de validacion por la comunidad.
- La model card incluye una clausula de exencion de responsabilidad total que descarga al autor de cualquier responsabilidad sobre los resultados de inferencia; el usuario asume la auditoria y validacion de todas las salidas.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del que presumiblemente domina el modelo base.
- Contexto limitado a 4.096 tokens en CPU, lo que restringe tareas de documento largo en equipos sin GPU.
- Licencia Apache 2.0 declarada en los metadatos, pero la model card menciona simultaneamente "Apache 2.0 / MIT"; conviene verificar los terminos del modelo base antes de un uso comercial.
- El modelo base EXAONE 3.5 es de LG AI Research; las condiciones de uso del modelo original pueden anadir restricciones no reflejadas en esta cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-EXAONE-3.5-32B-Instruct-GGUF
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-32B-Instruct
- Repositorio de la herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
