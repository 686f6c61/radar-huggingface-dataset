# jhlyu/aiwa_r4_int4

## Resumen

aiwa_r4_int4 es una cuantizacion en INT4 (esquema W4A16) del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario jhlyu bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de arquitectura Mixture-of-Experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, derivado de la familia Qwen3. El sufijo "r4" hace referencia a un adaptador LoRA orientado a robotica, segun los tags del repositorio, lo que sugiere un ajuste fino sobre el modelo base para tareas de control o razonamiento robotico.

El modelo se distribuye en formato safetensors mediante la libreria compressed-tensors, pensada para su despliegue eficiente en vLLM. La cuantizacion INT4 reduce de forma sustancial el espacio en disco y la VRAM necesaria frente al modelo en BF16, manteniendo las activaciones en 16 bits (W4A16). El repositorio ocupa 43,8 GB y el acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia radica en combinar la eficiencia de un MoE con parametros activos reducidos, una cuantizacion agresiva y un ajuste especifico para robotica, lo que lo hace candidato para despliegues en infraestructura limitada. No obstante, la informacion publica disponible es muy escasa: no hay benchmarks, no se detalla el dataset de ajuste ni el contenido exacto del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3 |
| Parametros totales | 35B (segun nombre del modelo base, Qwen3.6-35B-A3B) |
| Parametros activos | ~3B (indicado por "A3B" en el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 (compressed-tensors) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B pertenece a la familia Qwen3 de Alibaba, con una arquitectura Transformer de tipo Mixture-of-Experts: 35.000 millones de parametros totales de los que se activan aproximadamente 3.000 millones por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. La cuantizacion aplicada es INT4 con activaciones en 16 bits (W4A16), empaquetada con compressed-tensors para su uso en vLLM.

Sobre el modelo base se ha aplicado, segun los tags del repositorio, un adaptador LoRA orientado a robotica ("aiwa_r4", "robot"), aunque no se especifica en la informacion disponible el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion tecnica concreta del ajuste ni su metodologia de evaluacion. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto en chino e ingles.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.
- Capacidades de codigo y matematicas propias de la familia Qwen3 (no verificadas en esta version cuantizada).
- Ajuste especifico para robotica mediante adaptador LoRA, segun los tags del repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no disponible.
- Vision o audio: no disponible.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos.

## Casos de uso

- Control y razonamiento robotico: el ajuste LoRA orientado a robotica permite emplear el modelo para interpretar instrucciones en lenguaje natural y traducirlas en secuencias de acciones o comandos de alto nivel para un robot, aprovechando la eficiencia del MoE con solo ~3B de parametros activos.
- Despliegue en servidores con VRAM limitada: la cuantizacion INT4 W4A16 reduce el peso del modelo hasta los 43,8 GB del repositorio, lo que permite servirlo en GPUs de 48 GB o en configuraciones multi-GPU mas economicas que la version BF16.
- Asistente tecnico en chino e ingles: generacion de respuestas y resumenes en entornos bilingues, aprovechando el soporte nativo de ambos idiomas.
- Generacion de codigo en pipelines internos: integrable en vLLM para tareas de autocompletado o generacion de scripts, siempre que se valide el comportamiento de la version cuantizada frente al modelo base.
- Prototipado de agentes roboticos en simulacion: uso del modelo como planificador de alto nivel en bucles de simulacion antes de transferir a hardware real.
- Investigacion en cuantizacion: el repositorio sirve como referencia para estudiar el impacto de INT4 W4A16 con compressed-tensors sobre un MoE de 35B en tareas de robotica.
- Experimentacion academica con modelos gated: util para grupos que ya tengan acceso aprobado y quieran comparar el rendimiento del ajuste frente al Qwen3.6-35B-A3B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 43,8 GB en INT4, por lo que se necesita al menos una GPU con 48 GB de VRAM (A6000, L40S, A100 80 GB) para cargar los pesos completos; con overhead de KV cache y activaciones, se recomienda margen adicional.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En configuraciones multi-GPU, dos RTX 4090 de 24 GB podrian alojar los pesos, aunque el reparto y el soporte de vLLM deben validarse.
- Cabe en GPU de consumo: no en una sola unidad de 24 GB; posible en configuraciones multi-GPU con tensor parallelism, sujeto a verificacion.
- Opciones de despliegue: vLLM es el backend previsto por el formato compressed-tensors; llama.cpp y Ollama no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| aiwa_r4_int4 (este) | 35B / ~3B | no disponible | INT4 W4A16 | Apache 2.0 | Gated |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / ~3B | no disponible | BF16 (original) | Apache 2.0 | Segun repositorio |
| Qwen3-30B-A3B | 30B / ~3B | no disponible | Multiples | Apache 2.0 | Abierto |
| Mixtral 8x7B | 47B / ~13B | 32k | Multiples | Apache 2.0 | Abierto |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y la reproducibilidad.
- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del ajuste ni de la degradacion introducida por la cuantizacion INT4.
- Idiomas limitados a chino e ingles; no se garantiza un comportamiento adecuado en castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en esta version.
- La cuantizacion INT4 puede degradar tareas sensibles a la precision, como matematicas o generacion de codigo; se recomienda validacion frente al modelo base.
- El adaptador LoRA de robotica no esta documentado: se desconoce el dominio exacto, el dataset y las condiciones de seguridad para uso en hardware real.
- Aunque la licencia es Apache 2.0, el uso comercial del ajuste debe evaluarse con cautela dada la falta de documentacion sobre los datos de entrenamiento.
- Modelo con muy poca traccion (0 descargas, 1 like en el momento de la consulta): no hay comunidad ni soporte que valide su calidad.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jhlyu/aiwa_r4_int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
