# megatharun/Qwen3-VL-4B-Fine-Tuned-Weld-Detection

## Resumen

Qwen3-VL-4B-Fine-Tuned-Weld-Detection es un ajuste fino del modelo multimodal Qwen3-VL-4B-Instruct orientado a la detección de defectos en soldaduras sobre radiografías industriales. Lo publica el usuario megatharun y forma parte de una iniciativa del grupo NDT-Material Structural Integrity del Agensi Nuklear Malaysia (Malasia) para construir agentes de IA aplicados a la inspección no destructiva (NDT). Se distribuye principalmente en formato GGUF, con el modelo de lenguaje cuantizado a Q4_K_M y el proyector visual en F16 (mmproj-F16.gguf), lo que permite ejecutarlo en hardware modesto.

El modelo resuelve un problema muy concreto: dado un prompt sencillo y una imagen radiográfica de una soldadura, genera una cadena de razonamiento (chain-of-thought) en la que describe las características observadas y termina concluyendo el tipo de defecto. Todas las imágenes empleadas durante el proceso de destilación de conocimiento fueron previamente realzadas con CLAHE (Contrast Limited Adaptive Histogram Equalization), un detalle relevante porque condiciona el tipo de entrada con el que el modelo rinde mejor.

Se trata de un modelo de nicho, con muy poca tracción en el momento de la ficha (5 descargas y 0 likes), pensado para investigación aplicada y para integrarse en flujos de inspección, más que como modelo de propósito general. La model card indica explícitamente que los archivos se irán actualizando a medida que se obtengan mejores resultados. La información pública disponible es escasa: no se detallan la longitud de contexto, los idiomas soportados, el número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) heredada de Qwen3-VL-4B-Instruct; la model card no detalla variantes MoE, SSM ni hibridas |
| Parametros totales | 4B nominales segun el modelo base (Qwen3-VL-4B-Instruct); el repo declara 415.347.712 parametros en safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor menciona Q4_K_M para el modelo de lenguaje y F16 para el proyector visual (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M + mmproj-F16); el conteo en safetensors y el tamano del repo (0,8 GB) apuntan a que ese recuento corresponde al encoder/proyector visual, no al modelo de lenguaje completo |
| Modelo base | unsloth/Qwen3-VL-4B-Instruct-GGUF |

## Arquitectura y entrenamiento

No se publica una descripcion arquitectonica propia: el modelo es un ajuste fino de Qwen3-VL-4B-Instruct, un transformer multimodal que combina un encoder visual con un modelo de lenguaje y un proyector que alinea ambos espacios. El autor conserva la estructura del modelo base y trabaja sobre la version ya cuantizada a GGUF (Qwen3-VL-4B-Instruct-Q4_K_M.gguf para el LLM y mmproj-F16.gguf para la parte visual).

El entrenamiento se describe como destilacion de conocimiento sobre imagenes radiograficas de soldaduras preprocesadas con CLAHE. La model card no especifica el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco detalla si se uso LoRA o ajuste completo, aunque el ecosistema oficial de Qwen3-VL (repositorio qwen-vl-finetune) ofrece soporte para LoRA y DeepSpeed, ademas de entrenamiento sobre imagenes, video y tareas de grounding. La innovacion funcional que se destaca no es arquitectonica, sino de comportamiento: un prompt simple basta para que el modelo emita una cadena de razonamiento que explica las caracteristicas observadas en la radiografia y termina con la conclusion del tipo de defecto.

## Capacidades

- Vision por computador aplicada a radiografia industrial: interpretacion de imagenes de soldaduras para identificar caracteristicas y defectos.
- Razonamiento explicito en cadena (chain-of-thought): el modelo describe los rasgos que observa antes de emitir la conclusion, lo que facilita la trazabilidad de la decision.
- Clasificacion de defectos de soldadura a partir de un prompt sencillo, sin ingenieria de prompt compleja segun el autor.
- Generacion de texto asociada a la imagen (informe o justificacion de la conclusion).
- Compatibilidad con entradas preprocesadas con CLAHE, que es el regimen de imagen usado en el entrenamiento.
- No hay informacion disponible sobre tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de pensamiento configurables.

## Casos de uso

- Inspeccion radiografica automatizada de soldaduras: el modelo recibe la radiografia y devuelve una conclusion sobre el tipo de defecto, lo que permite prefiltrar grandes volumenes de imagenes antes de la revision humana.
- Triaje en control de calidad industrial: en una linea de fabricacion se pueden procesar lotes de radiografias y priorizar para inspeccion manual solo aquellas con indicios de defecto, reduciendo el tiempo de revision.
- Asistencia al inspector NDT: el razonamiento en cadena actua como segunda opinion documentada, mostrando al tecnico que caracteristicas ha detectado el modelo antes de la conclusion.
- Integracion en agentes de inspeccion NDT: el proyecto declara explicitamente que forma parte de un esfuerzo por construir agentes de IA para inspeccion, por lo que encaja como componente de percepcion visual dentro de un flujo mayor.
- Apoyo a la formacion de inspectores: las trazas de razonamiento generadas pueden usarse como material didactico para explicar como se reconoce un defecto concreto en una radiografia.
- Generacion de borradores de informes tecnicos: a partir de la imagen y la conclusion, el modelo puede redactar el texto base de un informe de inspeccion que luego se revisa y firma.
- Investigacion en NDT asistido por IA: sirve como punto de partida para experimentar con destilacion de conocimiento sobre dominios industriales muy especializados y con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona "lovely results (as shown in the inference result files)" y remite a archivos de resultados de inferencia, sin cifras de exactitud, sensibilidad, especificidad ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano de 4B parametros, no publicadas por el autor):
  - Q4_K_M + mmproj F16: aproximadamente 3,5-4 GB de VRAM.
  - Q5_K_M: aproximadamente 4 GB.
  - Q6_K: aproximadamente 4,5 GB.
  - Q8_0: aproximadamente 5,5 GB.
  - F16: aproximadamente 9-10 GB incluyendo el proyector visual.
- Cabe en GPU de consumo: si, siempre que se use cuantizacion Q4-Q8. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 lo ejecutan con holgura; en GPUs de 6-8 GB conviene usar Q4_K_M.
- GPU recomendadas para produccion: A100, H100 o L40S si se sirve en FP16/BF16 y con concurrencia alta; RTX 4090/A6000 para despliegues de baja latencia en local.
- Opciones de despliegue: llama.cpp y Ollama o LM Studio para GGUF; vLLM o TGI requieren la version en safetensors del modelo base o una conversion previa. Para el uso multimodal hay que cargar tambien el archivo mmproj.
- Latencia y throughput: no disponibles. No se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| megatharun/Qwen3-VL-4B-Fine-Tuned-Weld-Detection | 4B (base) | no disponible | GGUF | apache-2.0 | Defectos de soldadura en radiografia industrial |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | safetensors | apache-2.0 (segun modelo base) | Vision-lenguaje de proposito general |
| unsloth/Qwen3-VL-4B-Instruct-GGUF | 4B | no disponible | GGUF | apache-2.0 (segun modelo base) | Vision-lenguaje de proposito general, ya cuantizado |

No se dispone de datos de rendimiento comparativos entre estos modelos. El valor diferencial del modelo ajustado no es el tamano ni la licencia, identicos a los del base, sino la especializacion en un dominio industrial concreto. Para alternativas de otros fabricantes (por ejemplo modelos de vision-lenguaje de 7B a 11B) no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- Advertencia de procedencia: la model card menciona "resultados preciosos" sin aportar metricas; las afirmaciones de calidad no estan respaldadas por numeros verificables.
- Riesgo de alucinacion: al ser un modelo generativo que emite cadenas de razonamiento, puede producir justificaciones plausibles pero incorrectas sobre una radiografia, especialmente si la imagen no se ha preprocesado igual que en entrenamiento.
- Dependencia del preprocesado: el entrenamiento se hizo exclusivamente con imagenes realzadas con CLAHE; alimentarlo con radiografias sin ese realce puede degradar el rendimiento.
- Discrepancia en el conteo de parametros: el repo declara 415.347.712 parametros en safetensors frente a los 4B nominales del modelo base, lo que sugiere que ese recuento corresponde a otra parte del sistema (previsiblemente el encoder/proyector visual). Conviene verificar la composicion real de los archivos antes de integrarlo en produccion.
- Idiomas y contexto no documentados: no hay informacion sobre que idiomas maneja ni cual es su ventana de contexto, lo que impide planificar conversaciones largas o despliegues multilingues con garantias.
- Traccion minima: 5 descargas y 0 likes en el momento de la ficha, con un historial de actualizaciones frecuentes anunciado por el autor. No es un modelo estable ni ampliamente validado por la comunidad.
- Ambito muy estrecho: su fine-tuning esta orientado a un unico tipo de tarea (defectos en soldaduras sobre radiografia). Fuera de ese dominio cabe esperar un rendimiento inferior al del modelo base.
- Licencia: apache-2.0, permisiva para uso comercial, pero hereda las condiciones del modelo base Qwen3-VL. Conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Uso en produccion: dado que no hay benchmarks publicos ni validacion independiente, no deberia usarse como unico criterio de aceptacion o rechazo de una soldadura en un proceso critico de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/megatharun/Qwen3-VL-4B-Fine-Tuned-Weld-Detection
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio oficial Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Framework de ajuste fino qwen-vl-finetune: https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune
- Documentacion de ajuste fino (DeepWiki): https://deepwiki.com/QwenLM/Qwen3-VL/7-fine-tuning
- Vision general del ajuste fino (DeepWiki): https://deepwiki.com/QwenLM/Qwen3-VL/7.1-fine-tuning-overview
- Repositorio relacionado en GitHub: https://github.com/sarathkrishnan-nrlm/Qwen3-VL-4B-Fine_Tuned/blob/main/README.md
