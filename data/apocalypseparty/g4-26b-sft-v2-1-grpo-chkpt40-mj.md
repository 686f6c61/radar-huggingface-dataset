# ApocalypseParty/G4-26B-SFT-v2-1-GRPO-chkpt40-MJ

## Resumen

ApocalypseParty/G4-26B-SFT-v2-1-GRPO-chkpt40-MJ es un modelo de lenguaje de aproximadamente 25,8 mil millones de parámetros publicado por el usuario ApocalypseParty en HuggingFace. El nombre del repositorio indica una cadena de entrenamiento secuencial: una fase de ajuste supervisado (SFT) sobre la versión v2.1 de la familia G4, seguida de una fase de optimización con GRPO (Group Relative Policy Optimization, la técnica de aprendizaje por refuerzo popularizada por la familia DeepSeek) y un checkpoint intermedio identificado como "40". La etiqueta del repositorio incluye "gemma4", lo que sugiere que la arquitectura base deriva de la familia Gemma, aunque la ficha pública no confirma este extremo.

El modelo no incluye model card descriptiva: no hay información publicada sobre datos de entrenamiento, composición del dataset, licencia, idiomas soportados ni resultados de evaluación. El repositorio tiene 51,6 GB de peso, coherente con pesos en precisión BF16/F16 para 25,8 mil millones de parámetros, y acumula 13 descargas y 0 "likes" en el momento de la consulta, lo que lo sitúa como una publicación experimental de baja difusión.

Su relevancia es limitada para producción y alta para experimentación: se trata de un checkpoint intermedio de un pipeline de RLHF/GRPO sobre una base de 26B, útil para quien quiera reproducir o auditar ese tipo de ajuste, pero sin garantías de licencia, documentación ni evaluación publicada. Existen modelos hermanos de la misma familia (G4-26B-SFT-v2-1 y G4-26B-SFT-6, este último con versiones GGUF) que sí aparecen indexados en directorios de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica "gemma4", lo que apunta a una arquitectura transformer derivada de Gemma; sin confirmar en la ficha) |
| Parametros totales | 25.805.936.206 (≈25,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este checkpoint; el repositorio contiene pesos en safetensors a precision completa (BF16/F16, inferido de los 51,6 GB para 25,8 mM de parametros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 51,6 GB |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 13 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura en la informacion disponible. La etiqueta "gemma4" del repositorio sugiere que el modelo base pertenece a la familia Gemma, y el sufijo "26B" es coherente con un transformer denso de ~25,8 mil millones de parametros. No hay datos sobre numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion (completa, sliding window, lineal) ni vocabulario.

El nombre del repositorio describe el pipeline de entrenamiento de forma implicita: "SFT-v2-1" indica un ajuste supervisado sobre la segunda iteracion de la familia G4, "GRPO" indica una fase posterior de aprendizaje por refuerzo con Group Relative Policy Optimization, y "chkpt40" sugiere que se trata del checkpoint numero 40 de esa fase de RL, no de un modelo convergido final. "MJ" no tiene explicacion documentada. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de datos sinteticos, tecnicas de alineacion adicionales (DPO, RLHF con modelo de recompensa) ni innovaciones tecnicas como decodificacion especulativa.

## Capacidades

- Generacion de texto y continuacion de conversaciones multi-turno: capacidad esperable por tratarse de un modelo de ~26B ajustado con SFT y RL, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento de varios pasos: el uso de GRPO sugiere que el entrenamiento se oriento a tareas con recompensa verificable (matematicas, codigo, razonamiento), pero no hay evidencia publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso con uso de herramientas: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no disponible.
- Capacidad declarada de VLM: las busquedas web muestran una model card de un modelo hermano que menciona "VLM technology" de forma generica, pero no se puede atribuir a este checkpoint concreto.

## Casos de uso

Dado que no existe documentacion de capacidades ni evaluacion publicada, los casos de uso siguientes son hipoteticos y requieren validacion previa por parte del equipo que los adopte:

- Experimentacion en investigacion sobre RLHF/GRPO: el modelo sirve como checkpoint intermedio para estudiar como evoluciona la politica a lo largo del entrenamiento con GRPO, comparandolo con otros checkpoints de la misma tanda.
- Ajuste fino adicional (SFT/LoRA) sobre dominio propio: al ser un modelo de ~26B con pesos completos en safetensors, se puede partir de el para especializar en un vertical concreto, siempre que la licencia lo permita (actualmente no declarada).
- Generacion de texto en tareas de resumen o reescritura: uso generico de un LLM de 26B, supeditado a validar la calidad real con una evaluacion propia.
- Base para destilacion: usar sus salidas para entrenar modelos mas pequenos en dominios especificos, una vez verificada la calidad de las respuestas.
- Evaluacion comparativa de pipelines de RL: comparar este checkpoint ("chkpt40") con el modelo SFT previo (G4-26B-SFT-v2-1) para medir el efecto del GRPO en tareas con recompensa verificable.
- Despliegue en local para prototipado sin coste de API: con cuantizacion a 4 bits el modelo puede caber en GPUs de consumo, lo que permite iterar sin depender de servicios externos.
- Analisis de sesgos y seguridad en modelos ajustados con RL: al no existir model card, es un caso de estudio para auditar que tipo de comportamiento emerge de un pipeline de GRPO no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de ninguna otra evaluacion para este checkpoint ni para los modelos hermanos de la familia G4 en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/F16: aproximadamente 52 GB solo para los pesos, mas overhead de cache KV y activaciones; en la practica se recomienda un entorno de 64-80 GB.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 26-30 GB.
- VRAM estimada con cuantizacion de 4 bits (formato GGUF Q4_K_M o similar): alrededor de 15-18 GB.
- GPUs recomendadas para precision completa: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40GB con tensor parallelism).
- GPUs recomendadas para 8 bits: A100 40GB, L40S 48GB, RTX 6000 Ada 48GB.
- Viabilidad en GPU de consumo: con cuantizacion a 4 bits es plausible en una RTX 4090 (24 GB) o RTX 5090; en precision completa no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI para safetensors en precision completa o FP8/INT8; llama.cpp y Ollama requieren conversion previa a GGUF (existe una version GGUF de un modelo hermano, G4-26B-SFT-v2-1-gguf, no confirmada para este checkpoint).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| G4-26B-SFT-v2-1-GRPO-chkpt40-MJ (este) | 25,8 mM | no disponible | safetensors | no disponible | HuggingFace, 13 descargas | no publicados |
| ApocalypseParty/G4-26B-SFT-v2-1 | no disponible (misma familia, presumiblemente ~26B) | no disponible | safetensors | no disponible | HuggingFace | no publicados |
| ApocalypseParty/G4-26B-SFT-v2-1-gguf | no disponible (misma familia) | no disponible | GGUF | no disponible | HuggingFace | no publicados |
| ApocalypseParty/G4-26B-SFT-6 | ~26B (segun LLM Explorer) | no disponible | safetensors | no disponible | HuggingFace, indexado en LLM Explorer | no publicados |

No se dispone de datos de benchmarks ni de licencia de ninguno de los modelos comparados, por lo que no es posible establecer una comparacion de rendimiento. Los modelos listados son variantes de la misma familia del mismo autor, no alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion de arquitectura, datos de entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; adoptarlo en produccion implica riesgo legal.
- Checkpoint intermedio: el sufijo "chkpt40" indica que no es un modelo final convergido, sino un punto intermedio de la fase de GRPO; su calidad puede ser inferior a la de un modelo completamente entrenado.
- Sesgos desconocidos: al no haber evaluacion publicada ni documentacion del dataset, no se puede caracterizar el sesgo demografico, ideologico o cultural del modelo.
- Riesgo de alucinacion: esperable en cualquier LLM de este tamano sin evaluacion de factualidad publicada; no hay datos de tasa de alucinacion.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas largas.
- Sin soporte de tool calling confirmado: no hay evidencia de que el modelo haya sido entrenado para function calling, lo que limita su uso en arquitecturas de agentes.
- Difusion minima: 13 descargas y 0 likes implican practicamente nula validacion por parte de la comunidad; no hay informes de terceros sobre su comportamiento real.
- Procedencia del ajuste no verificable: no se puede confirmar que la base sea Gemma ni que los datos de entrenamiento cumplan las restricciones de la licencia original.
- Fecha de publicacion inusual (2026-09-29): conviene verificar la autenticidad y vigencia del repositorio antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApocalypseParty/G4-26B-SFT-v2-1-GRPO-chkpt40-MJ
- Modelo hermano (SFT base): https://huggingface.co/ApocalypseParty/G4-26B-SFT-v2-1
- Modelo hermano en GGUF: https://huggingface.co/ApocalypseParty/G4-26B-SFT-v2-1-gguf
- Linaje de la familia G4-26B-SFT-6 (Parapulse): https://parapulse.io/family/ApocalypseParty/G4-26B-SFT-6
- Ficha de G4-26B-SFT-6 en LLM Explorer: https://llm-explorer.com/model/ApocalypseParty%2FG4-26B-SFT-6,1fk1y2gkCXftwqjdxRz2Yr
- Estadisticas de descargas de G4-26B-SFT-6 (Parapulse): https://parapulse.io/models/ApocalypseParty/G4-26B-SFT-6
