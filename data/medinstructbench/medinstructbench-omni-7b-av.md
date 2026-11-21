# medinstructbench/medinstructbench-omni-7b-av

## Resumen

MedInstructBench Omni 7B AV es un conjunto de adaptadores LoRA sobre Qwen2.5-Omni-7B, desarrollado por el equipo del proyecto MedInstructBench, que acompaña al articulo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos*. El modelo resuelve una tarea muy concreta: dado un videoclip de caracter sanitario junto con una pregunta de salud y su respuesta, segmenta el clip en pasos instruccionales, cada uno con marcas temporales de inicio y fin y una leyenda en modo imperativo.

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal de 7.000 millones de parametros que procesa audio y video, y se ajusta en dos fases: primero con supervised fine-tuning (SFT) sobre el dataset MedInstruct10K, con LoRA aplicado tanto al modelo de lenguaje como al codificador de audio, y despues con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado, en este caso con LoRA solo en el modelo de lenguaje. El resultado son dos carpetas de adaptadores (`sft/` y `grpo/`) que se fusionan secuencialmente sobre el modelo base para reproducir exactamente los modelos evaluados en el paper.

Es relevante ahora porque aborda un problema poco cubierto: la segmentacion procedural de video instructivo medico con entrada multimodal audio+video, una capacidad que los modelos generalistas no resuelven bien y que tiene aplicaciones directas en formacion clinica, documentacion de procedimientos y verificacion de protocolos. La licencia Apache 2.0 y el formato PEFT/LoRA facilitan su adopcion. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de datos de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base: Qwen2.5-Omni-7B) con adaptadores LoRA (PEFT) |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-Omni-7B); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors) |
| Idiomas soportados | no disponibles (la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptadores de Qwen2.5-Omni-7B, un transformer multimodal que acepta audio y video como entrada. El entrenamiento se estructura en dos etapas encadenadas. En la primera, SFT, se aplica LoRA sobre el modelo de lenguaje y sobre el codificador de audio del modelo base (revision `ae9e1690543ffd5c0221dc27f79834d0294cba00`), entrenando sobre el dataset MedInstruct10K para la tarea de segmentacion de pasos instruccionales con marcas temporales y leyendas imperativas. En la segunda, GRPO, se aplica LoRA unicamente sobre el modelo de lenguaje resultante de fusionar el adaptador SFT, refinando la politica con optimizacion por preferencias de grupo.

Los adaptadores se distribuyen en dos carpetas: `sft/` (que fusionada sobre Qwen2.5-Omni-7B reproduce el modelo SFT del paper, antes de GRPO) y `grpo/` (que se fusiona sobre el modelo SFT ya fusionado). Segun la model card, los modelos fusionados son identicos tensor a tensor a los evaluados en el paper. La inferencia se realiza con decodificacion greedy y muestreo de fotogramas a 0,2 fps, siguiendo la configuracion del repositorio de codigo del proyecto. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni los hiperparametros de LoRA o GRPO.

## Capacidades

- Segmentacion de video instructivo en pasos procedurales, con marcas temporales de inicio y fin para cada paso.
- Generacion de leyendas en modo imperativo para cada paso segmentado.
- Comprension multimodal conjunta de audio y video (entrada A+V).
- Procesamiento de preguntas de salud junto con su clip de respuesta asociado.
- Razonamiento sobre contenido medico e instructivo.
- Ajuste especifico mediante SFT + GRPO para la tarea de segmentacion y captioning.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, modo thinking explicito ni capacidades multilingues declaradas.

## Casos de uso

- Formacion clinica asistida: el modelo segmenta un video de un procedimiento medico en pasos con tiempos y leyendas imperativas, permitiendo generar guias paso a paso para estudiantes de medicina a partir de material audiovisual existente.
- Documentacion automatica de procedimientos: a partir de grabaciones de cirugias o tecnicas sanitarias, el modelo produce una estructura temporal de pasos que puede indexarse en un sistema de gestion documental clinica.
- Verificacion de protocolos: comparar la segmentacion generada por el modelo con el protocolo oficial de un procedimiento para detectar omisiones o desviaciones en la ejecucion grabada.
- Indexacion y busqueda de video medico: las marcas temporales y leyendas generadas permiten construir indices navegables de bibliotecas de video instructivo sanitario.
- Generacion de subtitulos descriptivos para contenido formativo: las leyendas imperativas por paso sirven como base para subtitulos o narraciones de apoyo en plataformas de e-learning medico.
- Evaluacion de modelos multimodales: el adaptador y el benchmark asociado permiten reproducir la evaluacion del paper y comparar el rendimiento de otros modelos en la misma tarea de segmentacion procedural.
- Investigacion en RLHF/GRPO aplicado a dominio medico: el par de adaptadores SFT y GRPO permite estudiar el efecto del refinamiento por preferencias en tareas de segmentacion multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 7.000 millones de parametros en precision completa, se requiere aproximadamente 14-16 GB solo para pesos, mas memoria para el procesamiento de audio y video.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano del modelo base, GPUs de clase A100, H100 o RTX 4090 son adecuadas.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y GPUs con 16 GB o mas, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: los adaptadores se fusionan con el script `training/merge_lora.py` del repositorio y se ejecutan con `inference/run_qwen25omni.py`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedInstructBench Omni 7B AV | 7.000 M (base) + LoRA | no disponible | Segmentacion y captioning de video medico A+V | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-Omni-7B (base) | 7.000 M | no disponible | Multimodal generalista audio/video/texto | Apache 2.0 | Hugging Face |
| Alternativas especializadas en video medico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un dataset medico concreto (MedInstruct10K), puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: no cuantificado; en tareas de segmentacion y captioning medico, una leyenda incorrecta puede tener consecuencias formativas o clinicas.
- Limitaciones de contexto o idioma: la model card no declara idiomas soportados; el dataset y el prompt del repositorio determinan el idioma efectivo de salida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-Omni-7B y de los datos de entrenamiento.
- Caveat para produccion: el modelo es un adaptador LoRA que requiere fusion secuencial (`sft/` y luego `grpo/`) sobre el modelo base en la revision exacta indicada; una fusion incorrecta produce un modelo distinto al evaluado.
- La inferencia debe replicar la configuracion del repositorio (decodificacion greedy, 0,2 fps) para obtener resultados comparables.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria independiente.
- No es un modelo de diagnostico clinico; su uso previsto es la segmentacion y descripcion de video instructivo, no la decision medica.

## Enlaces

- Hugging Face: https://huggingface.co/medinstructbench/medinstructbench-omni-7b-av
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de codigo (anonimo): https://anonymous.4open.science/r/medinstructbench-5080/
- Paper: *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* (enlace no disponible en la informacion proporcionada)
