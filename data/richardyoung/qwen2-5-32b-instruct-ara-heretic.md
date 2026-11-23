# richardyoung/Qwen2.5-32B-Instruct-ARA-heretic

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic es un ajuste fino del modelo Qwen2.5-32B-Instruct desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de ablacion de direcciones de rechazo (refusal directions) para eliminar los comportamientos de negativa aprendidos durante el alineamiento, manteniendo el resto de capacidades del modelo original. El resultado es un modelo conversacional sin los filtros de seguridad tipicos del modelo base.

El modelo hereda la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales segun los pesos en safetensors, y esta pensado para generacion de texto y chat. El repositorio ocupa 65,5 GB y se distribuye en formato safetensors para su uso con la libreria transformers. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia radica en que ofrece una alternativa sin censura sobre una base solida de 32B parametros, util para investigacion sobre alineamiento, estudios de robustez y escenarios donde los rechazos del modelo base resultan un obstaculo. No obstante, la informacion publica disponible es escasa: no se documentan detalles del proceso de ablacion, del dataset empleado ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ en la informacion) |
| Idiomas soportados | en (segun la ficha del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso con atencion por causalidad y las mejoras introducidas en la familia Qwen2 (RoPE, RMSNorm, SwiGLU y sesgos QKV, segun la arquitectura Qwen2 estandar). Sobre esa base se ha aplicado una tecnica de tipo "abliteration" o "heretic", que consiste en identificar y restar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de producir negativas sistematicas sin reentrenar los pesos desde cero.

No se dispone de informacion sobre el numero de tokens empleados en el ajuste, la composicion del dataset, ni si se utilizo RLHF, DPO o preferencias sinteticas. Tampoco se documenta el metodo exacto de ablacion (por ejemplo, si se aplico por capas, con que intensidad o con que criterio de seleccion de direcciones). Los tags del repositorio incluyen `reproducible`, lo que sugiere que el autor pretende que el proceso sea replicable, pero no se aportan scripts ni hiperparametros en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y resolucion de problemas de complejidad media-alta gracias a sus 32B parametros.
- Generacion de codigo y matematicas, capacidades presentes en el modelo base.
- Respuestas sin rechazos: al eliminar las direcciones de rechazo, el modelo tiende a responder a peticiones que el modelo original declinaria.
- Soporte de tool calling y function calling: no confirmado explicitamente para este ajuste, aunque el modelo base lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste concreto.
- Capacidades multilingues: la ficha declara solo `en`; no se confirma el multilingueismo del modelo base.
- Modo thinking o vision: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como se comporta un modelo de 32B tras eliminar las direcciones de rechazo, comparandolo con el modelo base en tareas de evaluacion de robustez y sesgo.
- Analisis de robustez frente a jailbreaks: sirve como referencia de un modelo ya "abliterated" para medir si las tecnicas de ataque siguen siendo necesarias o si el modelo responde directamente.
- Generacion de contenido creativo sin restricciones: util para escritura de ficcion, guiones o narrativa que requiera temas sensibles que el modelo base rechazaria, con la salvedad de revisar el contenido generado.
- Evaluacion comparativa de calidad tras ablacion: permite medir la degradacion (o no) de capacidades como MMLU o HumanEval respecto al modelo base, usando el mismo tokenizador y plantilla de chat.
- Despliegue en entornos de investigacion controlados: con 32B parametros y pesos safetensors, puede servirse con vLLM o TGI en una GPU de 80 GB (A100/H100) para experimentos internos.
- Estudio de sesgos y toxicidad: al no rechazar peticiones, facilita la generacion de respuestas que permiten auditar sesgos del modelo base de forma mas directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65 GB solo para pesos, mas overhead de KV cache; se recomienda una GPU de 80 GB (A100 80GB, H100 80GB) o dos GPU de 48 GB en tensor parallel.
- Cuantizacion a 8 bits (INT8): alrededor de 33-35 GB de VRAM, cabe en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 18-20 GB, potencialmente en una RTX 4090 de 24 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU consumer: no cabe en FP16 en ninguna GPU consumer individual; en 4 bits podria caber en RTX 4090 o RTX 3090 con margen limitado para contexto largo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de llama.cpp u Ollama al no haber pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32,76B | no disponible | apache-2.0 | gated | Ajuste abliterated del base |
| Qwen/Qwen2.5-32B-Instruct | 32,76B | 131.072 tokens (segun ficha del base) | apache-2.0 | abierto | Modelo base alineado, con rechazos |
| Ajustes abliterated de Llama 3.1 8B (varios autores) | ~8B | 131.072 tokens | llama3.1 | variable | Menor tamano, menor capacidad de razonamiento |
| Ajustes abliterated de Mistral Small / Qwen2.5 7B | ~7-24B | variable | apache-2.0 | variable | Alternativas de menor coste computacional |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazos puede degradar capacidades del modelo base; no se publican evaluaciones que cuantifiquen esa posible perdida.
- Riesgo elevado de generar contenido danino, ilegal o inseguro: el modelo no aplica filtros de rechazo, por lo que requiere supervision humana y politicas de uso estrictas en cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos de 32B; no se documenta mitigacion especifica.
- Idiomas: la ficha declara solo `en`; el rendimiento en castellano no esta verificado y podria ser inferior al del modelo base.
- Licencia Apache 2.0 declarada, pero el acceso es gated y el uso comercial debe evaluarse con cautela dado el caracter "uncensored" del ajuste y las posibles responsabilidades legales derivadas del contenido generado.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer sin cuantizar manualmente.
- El modelo base Qwen2.5-32B-Instruct tiene su propia licencia y terminos; conviene revisar la compatibilidad con el uso previsto.
- Sin datos de benchmarks ni de proceso de entrenamiento, la reproducibilidad declarada en los tags no esta verificada en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de referencia Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper de referencia sobre ablacion de rechazos (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
