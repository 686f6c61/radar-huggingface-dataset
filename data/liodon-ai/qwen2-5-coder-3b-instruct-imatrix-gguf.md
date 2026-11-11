# liodon-ai/Qwen2.5-Coder-3B-Instruct-imatrix-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-imatrix-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba y cuantizado por Liodon AI. El modelo base es un transformer denso de 3.085.938.688 parametros (aproximadamente 3.086 millones) especializado en generacion de codigo y texto, afinado para seguir instrucciones. Esta publicacion no aporta pesos nuevos, sino versiones comprimidas del modelo original listas para ejecutarse en llama.cpp, Ollama, LM Studio y Jan.

El problema que resuelve esta ficha es el de permitir ejecutar un modelo de codigo de 3B en hardware modesto, incluido hardware consumer con poca VRAM, mediante cuantizaciones de 2 a 8 bits calibradas con iMatrix. La tecnica iMatrix ejecuta 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) a traves del modelo en precision completa para identificar que pesos son mas sensibles, asignando mas precision a esos pesos. Segun el autor, esto mejora la coherencia y el seguimiento de instrucciones en Q2, Q3 y Q4 sin aumentar el tamano del fichero.

La relevancia actual es practica: el modelo base es pequeno, con licencia "other" (la de Qwen), y estas cuantizaciones permiten desplegarlo en entornos con recursos limitados. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-Coder-3B-Instruct; detalles de capas y atencion no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con calibracion iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other (la del modelo base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | GGUF |

Tabla de cuantizaciones publicadas por el autor:

| Quant | Tamano | VRAM estimada | Notas |
|---|---|---|---|
| IQ2_M | 1.14 GB | ~1 GB | 2 bits, iMatrix, la mas pequena usable |
| IQ3_M | 1.49 GB | ~2 GB | 3 bits, iMatrix, buena relacion calidad/tamano |
| IQ4_XS | 1.74 GB | ~2 GB | 4 bits extra-small, iMatrix |
| Q4_K_M | 1.93 GB | ~2 GB | 4 bits, calibrada con iMatrix (recomendada) |
| Q5_K_M | 2.22 GB | ~3 GB | 5 bits, calibrada con iMatrix |
| Q6_K | 2.54 GB | ~3 GB | 6 bits, calibrada con iMatrix, casi sin perdida |
| Q8_0 | 3.29 GB | ~4 GB | 8 bits, practicamente sin perdida |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-3B-Instruct, un transformer denso de la familia Qwen2.5-Coder, orientado a generacion de codigo y texto con ajuste por instrucciones. La informacion proporcionada no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento del modelo original. Tampoco se especifica si el ajuste incluyo RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica de esta publicacion es la cuantizacion con iMatrix: en lugar de tratar todos los pesos por igual, se ejecutan 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) a traves del modelo en precision completa para estimar la importancia de cada peso y asignar mas bits a los mas sensibles. El autor afirma que esto produce mejor coherencia y seguimiento de instrucciones en Q2, Q3 y Q4 con el mismo tamano de fichero. No se aportan metricas de perplejidad ni evaluaciones que cuantifiquen esa mejora en la informacion disponible.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion y generacion de texto general.
- Seguimiento de instrucciones: la variante Instruct esta afinada para responder a peticiones en lenguaje natural.
- Conversacion multi-turno: el pipeline es text-generation y el tag "conversational" aparece en los metadatos.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con APIs compatibles, aunque no se detalla el alcance.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en el editor: con Q4_K_M (1.93 GB) el modelo cabe en GPUs consumer de 4 GB o mas y puede servir sugerencias en local mediante llama.cpp u Ollama, sin enviar codigo a servicios externos.
- Asistente de programacion en portatiles sin GPU dedicada: la cuantizacion IQ2_M (1.14 GB, ~1 GB de VRAM) permite ejecutar el modelo en CPU o en GPUs integradas, util para entornos de desarrollo con recursos muy limitados.
- Generacion de tests unitarios y documentacion tecnica: el modelo base esta orientado a codigo, por lo que puede redactar docstrings, comentarios y casos de prueba a partir de fragmentos de codigo existentes.
- Prototipado rapido de pipelines de IA en local: al ser compatible con Ollama y LM Studio, se puede integrar en scripts de prueba y demos sin infraestructura de servidor.
- Educacion y aprendizaje de programacion: un modelo de 3B cuantizado a Q4 o Q5 puede ejecutarse en aulas o equipos de estudiantes para explicar fragmentos de codigo y resolver dudas basicas.
- Automatizacion de tareas de texto en entornos con restricciones de red: al ejecutarse completamente en local, sirve para resumir, reformatear o clasificar texto sin depender de conectividad externa.
- Despliegue en contenedores ligeros: los ficheros de 2 a 3 GB facilitan incluir el modelo en imagenes Docker para servicios de generacion de texto de baja latencia y bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para las cuantizaciones, ni comparaciones con otras versiones del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1 GB (IQ2_M) y ~4 GB (Q8_0), segun la tabla del autor.
- GPU recomendadas: no se especifican modelos concretos; por tamano, cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones Q4 y Q5. GPUs de datacenter como A100 o H100 no son necesarias para este modelo, aunque pueden usarse.
- Cabe en GPU consumer: si. Las cuantizaciones de 2 a 4 bits caben en GPUs de gama de entrada con 4-6 GB de VRAM; IQ2_M puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio y Jan, segun la model card. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct-imatrix-GGUF (este) | 3.086 M | no disponible | other | GGUF | Hugging Face |
| Qwen2.5-Coder-3B-Instruct (base) | 3.086 M | no disponible | other | safetensors | Hugging Face |
| Qwen2.5-Coder-3B-Instruct-GGUF (sin iMatrix) | 3.086 M | no disponible | other | GGUF | Hugging Face (liodon-ai) |

La comparativa con modelos de otros desarrolladores (por ejemplo, alternativas de 3B especializadas en codigo) no esta disponible en la informacion proporcionada. La diferencia principal entre este modelo y la version sin iMatrix es la calibracion de la cuantizacion; no se aportan datos de rendimiento que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos exactos; es imprescindible revisar la licencia del modelo base Qwen2.5-Coder-3B-Instruct antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este modelo.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas sin evaluacion previa.
- Longitud de contexto: no disponible; no se puede planificar su uso en tareas de contexto largo sin verificacion.
- Perdida por cuantizacion: las versiones de 2 y 3 bits (IQ2_M, IQ3_M) degradan la calidad respecto al modelo original; el autor solo afirma mejoras relativas frente a cuantizacion estandar, sin metricas.
- Modelo de 3B: capacidad limitada en razonamiento complejo, matematicas avanzadas y tareas de codigo de gran escala en comparacion con modelos mayores.
- Sin benchmarks: no hay datos publicados que permitan comparar su rendimiento con alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia de uso en produccion.
- Fecha de publicacion futura (2026-11-10): conviene verificar la vigencia y el mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Cuantizaciones sin iMatrix del mismo autor: https://huggingface.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Dataset de calibracion: https://huggingface.co/datasets/wikitext
