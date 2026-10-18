# mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest8-step40

## Resumen

`mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest8-step40` es un checkpoint experimental publicado por Minhyuk Seo (usuario `mhseo2` en Hugging Face) el 18 de octubre de 2026. Se trata de un ajuste fino del modelo base denso Qwen3-8B-Base (8.190.735.360 parametros segun los tensores en safetensors) obtenido mediante un procedimiento que el autor denomina OPD, con un modelo profesor Qwen3-MoE-30B, sobre un corpus de matematicas identificado en el nombre como `ot3math` (previsiblemente derivado de OpenThoughts3) y con una variante de perdida anotada como `rklrest8`. El sufijo `step40` indica que se publica el checkpoint del paso 40 de un entrenamiento, no un modelo final convergido.

El modelo resuelve, en principio, el mismo problema que el resto de la familia de runs del autor: transferir capacidad de razonamiento matematico de un profesor MoE de 30B a un alumno denso de 8B mediante destilacion, de forma que el alumno pueda desplegarse en hardware mucho mas modesto. La relevancia practica es doble: por un lado, permite estudiar la evolucion intermedia de un proceso de destilacion on-policy; por otro, su tamano (16,4 GB en safetensors) lo situa en el rango de una unica GPU de 24 GB en bf16.

Ahora bien, la informacion publicada es minima: el repositorio no incluye model card, pipeline, licencia ni idiomas declarados, y acumula 14 descargas y 0 likes en el momento de la consulta. Cualquier uso en produccion debe considerarse prematuro sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredera de Qwen3-8B-Base (atencion con GQA, QK-Norm, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica: el checkpoint es denso (el profesor Qwen3-MoE-30B si es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen3-8B declara 32.768 tokens nativos ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Solo se publican pesos en safetensors (repo de 16,4 GB, compatible con bf16/fp16). No hay GGUF, GPTQ, AWQ ni MLX en el repositorio; el modelo admite cuantizacion posterior con bitsandbytes, GPTQ, AWQ o conversion a GGUF |
| Idiomas soportados | No disponible (sin metadatos de idioma). El base Qwen3 es multilingue, pero el ajuste esta orientado a matematicas |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| ID de repositorio | mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest8-step40 |
| Tipo de artefacto | Checkpoint intermedio de investigacion (paso 40) |
| Modelo base (alumno) | Qwen3-8B-Base |
| Modelo profesor | Qwen3-MoE-30B (por nomenclatura, familia Qwen3-30B-A3B) |
| Dataset de entrenamiento | `ot3math` (por nomenclatura; presumiblemente derivado de OpenThoughts3, no confirmado) |
| Funcion de perdida | `rklrest8` (por nomenclatura; apunta a una KL reversa restringida, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base, un transformer decoder-only denso de 8,19 B de parametros descrito en el informe tecnico de Qwen3: 36 capas, atencion con grouped-query attention (32 cabezas de consulta y 8 de clave/valor), QK-Norm, activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios, con un vocabulario de 151.936 tokens. El checkpoint no introduce cambios estructurales; lo que varia respecto al base son los pesos resultantes del proceso de ajuste.

El entrenamiento, segun la nomenclatura del identificador y los runs hermanos del mismo autor, corresponde a un esquema de destilacion con alumno Qwen3-8B-Base y profesor Qwen3-MoE-30B sobre datos de matematicas. El sufijo `rklrest8` sugiere una KL reversa con restriccion (posiblemente limitada a los 8 tokens o expertos mas probables), y `step40` situa el checkpoint en una fase muy temprana. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, modo thinking explicito), aunque al derivar de Qwen3 es probable que el chat template herede los tokens especiales de razonamiento del base.

## Capacidades

- Generacion de texto y razonamiento matematico: el objetivo declarado del ajuste es mejorar el razonamiento matematico del alumno a partir del profesor, con datos tipo `ot3math`.
- Razonamiento de cadena larga: los runs de la misma familia generan cadenas de razonamiento extensas (el run hermano documenta rollouts que alcanzan el limite de 30.463 tokens), lo que indica un estilo de respuesta de tipo thinking.
- Generacion de codigo: capacidad heredada del base Qwen3-8B-Base; no validada especificamente en este checkpoint.
- Soporte multilingue: no documentado para este ajuste; el base Qwen3 declara cobertura en mas de 100 idiomas, pero el fine-tune puede haber degradado idiomas distintos del ingles.
- Tool calling / function calling: no disponible; no hay plantilla ni documentacion que lo confirme en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- Capacidad especial: modo thinking no confirmado explicitamente, aunque plausible por herencia del base.

## Casos de uso

- Investigacion sobre destilacion on-policy: permite comparar el checkpoint del paso 40 con los del paso 10 y 20 de la misma familia (`opd_klear8b_..._rklrest128-step10`, `opd-qwen3base8b-dm250-...-step20`) para estudiar la evolucion de la KL y de la longitud de las cadenas de razonamiento durante el entrenamiento.
- Reproduccion de experimentos academicos: util como punto de partida para replicar el pipeline OPD con profesor MoE y alumno denso, verificando si la transferencia de capacidad matematica aparece ya en pasos tempranos.
- Generacion de soluciones matematicas paso a paso en entornos controlados: con 8,19 B de parametros en bf16 cabe en una GPU de 24 GB, lo que facilita iterar sobre prompts de tipo chain-of-thought sin infraestructura dedicada.
- Evaluacion comparativa de tecnicas de destilacion: al compartir base y dataset con otros checkpoints del autor, sirve como baseline para medir el efecto de la restriccion de la KL (`rklrest8` frente a `rklrest128`).
- Prototipado de tutoria matematica: el modelo puede generar explicaciones detalladas de problemas, aunque requiere validacion humana por el riesgo de alucinacion en pasos intermedios.
- Fine-tuning posterior especifico de dominio: al ser un checkpoint intermedio y no un modelo instructivo pulido, es un punto de partida razonable para SFT sobre un corpus propio de matematicas o STEM.
- Analisis de fallos de parada (EOS): util para depurar problemas de plantilla de chat y tokens de fin de turno, un fallo documentado en un run hermano del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, GSM8K, MATH, HumanEval ni de ningun otro conjunto, y el autor no aporta cifras en la ficha de Hugging Face. Los runs hermanos tampoco publican tablas comparativas; el unico dato cualitativo es la advertencia de que un run relacionadoGeneraba rollouts que no terminaban correctamente.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,4 GB solo de pesos; con cache KV y overhead del runtime, entre 18 y 22 GB para contextos moderados.
- VRAM estimada en int8: en torno a 9-10 GB de pesos, con overhead adicional segun longitud de contexto.
- VRAM estimada en int4 (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB de pesos, viables en GPU de 8-12 GB con contextos cortos.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto largo; L40S o RTX 6000 Ada para despliegue de una sola instancia; RTX 4090 (24 GB) para bf16 en una unica GPU.
- GPU de consumo: si cabe en RTX 4090 en bf16; en RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) solo con cuantizacion de 8 o 4 bits; en GPUs de 8 GB, unicamente con GGUF Q4 y contextos reducidos.
- Opciones de despliegue: vLLM y SGLang para servicio en bf16; TGI como alternativa; llama.cpp u Ollama tras convertir los pesos a GGUF (no se distribuye GGUF en el repositorio); transformers + bitsandbytes para prototipado.
- Latencia y throughput: no disponibles. Al no haber datos publicados, cualquier cifra seria especulativa; como referencia de orden de magnitud, un denso de 8 B en bf16 sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero la longitud tipica de las cadenas de razonamiento de esta familia penaliza mucho la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`..._rklrest8-step40`) | 8,19 B densos | No declarado; base Qwen3-8B: 32.768 nativos / 131.072 con YaRN | Sin benchmarks publicados | No disponible | Safetensors, 14 descargas, 0 likes |
| Qwen3-8B-Base | 8,2 B densos | 32.768 nativos / 131.072 con YaRN (segun informe tecnico) | Evaluado en el informe tecnico de Qwen3 | Apache 2.0 | Ampliamente disponible en Hugging Face |
| Qwen3-8B (instruct) | 8,2 B densos | 32.768 nativos / 131.072 con YaRN | Evaluado en el informe tecnico de Qwen3 | Apache 2.0 | Ampliamente disponible |
| Qwen3-30B-A3B (profesor) | 30,5 B totales / 3,3 B activos | 32.768 nativos / 131.072 con YaRN | Evaluado en el informe tecnico de Qwen3 | Apache 2.0 | Ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B densos | 131.072 tokens | Benchmarks publicados por DeepSeek | Licencia propia de DeepSeek (uso comercial permitido con condiciones) | Ampliamente disponible |

La comparacion relevante es con el base Qwen3-8B-Base: este checkpoint parte de el y solo se diferencia por el ajuste OPD, pero carece de evaluacion publica que permita afirmar una mejora. Frente a alternativas establecidas de razonamiento matematico de ~7-8 B, como DeepSeek-R1-Distill-Qwen-7B, la falta de benchmarks y de licencia declarada lo hace no competitivo para produccion hoy.

## Limitaciones y advertencias

- Checkpoint intermedio: el sufijo `step40` indica un paso temprano de un entrenamiento; no hay garantia de convergencia ni de que las capacidades del modelo base se hayan preservado.
- Ausencia total de documentacion: sin model card, sin pipeline declarado, sin idiomas y sin licencia. La licencia del base Qwen3-8B-Base es Apache 2.0, pero el autor no la ha declarado para este derivado, lo que genera incertidumbre legal para uso comercial.
- Riesgo de alucinacion: en tareas de razonamiento matematico, y mas en checkpoints no convergidos, es esperable la generacion de pasos intermedios plausibles pero incorrectos.
- Fallo conocido en la familia de runs: un checkpoint hermano del mismo autor (`seomh/opd-qwen3base8b-dm250-qwen3moe30b-ot3math-step20`) esta marcado como run invalido porque el alumno conservaba el token EOS `<|endoftext|>` (151643) mientras la plantilla de chat cerraba con `<|im_end|>` (151645), de modo que entre el 98 % y el 100 % de los rollouts agotaban el limite de 30.463 tokens. Conviene verificar el comportamiento de parada de este checkpoint antes de integrarlo en un pipeline.
- Idiomas: no documentados; el ajuste sobre datos de matematicas en ingles puede haber degradado el multilingueismo del base.
- Contexto: no confirmado para el checkpoint; asumir 32.768 tokens salvo verificacion empirica, y no dar por hecho la extension con YaRN sin probarla.
- Trazas largas: el estilo de razonamiento de la familia produce respuestas muy extensas, con el coste de latencia y de tokens que ello implica.
- Validacion de la comunidad practicamente nula (14 descargas, 0 likes), lo que reduce la probabilidad de que los fallos hayan sido detectados.
- Sin pesos cuantizados oficiales: cualquier despliegue en 4 bits exige conversion propia y validacion de la degradacion resultante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest8-step40
- Perfil del autor: https://huggingface.co/mhseo2
- Run hermano con `rklrest128`: https://huggingface.co/mhseo2/opd_klear8b_qwen3moe30b_ot3math_rklrest128-step10
- Run hermano con advertencia de EOS invalido: https://huggingface.co/seomh/opd-qwen3base8b-dm250-qwen3moe30b-ot3math-step20
- Checkpoint SFT relacionado en Featherless: https://featherless.ai/models/mhseo2/Qwen3-8B-Base-OT3Math-SFT-step500
- Informe tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
