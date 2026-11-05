# nkthebass/tinybrainbot-360m-a75m-v5.1-python

## Resumen

TinyBrainBot-360M-A75M-v5.1-Python es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el usuario nkthebass, orientado especificamente a la asistencia en programacion Python. Con 383 millones de parametros totales y 75 millones activos por token, el modelo emplea 24 expertos por capa con 4 activos, y se carga como un `MixtralForCausalLM` estandar dentro del ecosistema transformers. Su proposito es ofrecer un asistente de codigo extremadamente compacto que pueda ejecutarse en hardware modesto.

El modelo parte de una base propia (tinybrainbot-360m-a75m-v5.1-base) y se afina en tres etapas sobre Python: un anneal de codigo de 2000 millones de tokens, un SFT de instrucciones en Python y una ronda de rejection-sampling fine-tuning en la que aprende de sus propias respuestas que superan tests unitarios. Esto lo situa, segun el autor, en resultados cercanos a SmolLM2-360M-Instruct en HumanEval y MBPP, pero con una fraccion muy pequena del coste de entrenamiento.

Es relevante ahora por su enfoque de eficiencia: un MoE diminuto entrenado desde cero con aproximadamente 20.000 millones de tokens, distribuido con licencia Apache 2.0 y disponible tanto en safetensors como en GGUF, lo que facilita su despliegue en entornos de bajos recursos y su integracion en pipelines de generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo Mixtral, cargable como `MixtralForCausalLM` |
| Parametros totales | 383.429.376 (383M) |
| Parametros activos | 75M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye artefactos GGUF; niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos al estilo Mixtral: 24 expertos por capa con 4 activos por token, lo que da lugar a 75M parametros activos sobre un total de 383M. Esta configuracion permite mantener un coste computacional por token propio de un modelo de ~75M mientras se dispone de la capacidad representacional de un modelo de ~383M. El modelo se carga sin modificaciones como `MixtralForCausalLM`, lo que simplifica su integracion con librerias estandar.

El entrenamiento parte de la base tinybrainbot-360m-a75m-v5.1-base y se completa en tres fases sobre Python: un anneal de codigo de 2000 millones de tokens, un SFT de instrucciones en Python y una ronda de rejection-sampling fine-tuning en la que el modelo aprende de sus propias respuestas que pasan tests unitarios. En total, el autor declara aproximadamente 20.000 millones de tokens de entrenamiento. Los datasets empleados incluyen codeparrot-clean, opc-annealing-corpus, the-stack-smol, opc-sft-stage2, self-oss-instruct-sc2-exec-filter-50k, Tested-143k-Python-Alpaca, Magicoder-OSS-Instruct-75K, KodCode-V1, smol-smoltalk, tulu-3-sft-personas-instruction-following, WildChat-4.8M, smoltalk, smoltalk2 y OpenHermes-2.5, combinando datos de codigo con datos conversacionales e instrucciones.

## Capacidades

- Generacion de codigo Python: produce funciones y bloques ```python a partir de instrucciones en lenguaje natural.
- Correccion de codigo: identifica errores en funciones existentes y devuelve versiones corregidas con explicacion.
- Refinamiento iterativo: responde a peticiones de seguimiento como anadir type hints, docstrings o validaciones de entrada.
- Conversacion multi-turno: mantiene contexto conversacional para tareas de asistencia de codigo.
- Instrucciones en ingles: el modelo esta entrenado y orientado al idioma ingles.
- Razonamiento basico y conocimiento general limitado: evaluado en ARC, HellaSwag y PIQA con resultados modestos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de codigo en local: el modelo puede ejecutarse en hardware de consumo gracias a sus 75M parametros activos y a los artefactos GGUF, ofreciendo autocompletado y generacion de funciones Python sin depender de servicios en la nube.
- Correccion de errores en editores: integrado como plugin de un IDE, puede recibir una funcion defectuosa y devolver una version corregida con explicacion, como se muestra en los ejemplos de la model card.
- Generacion de tests y refactorizacion ligera: util para producir funciones auxiliares, anadir type hints y docstrings en tareas de mantenimiento de codigo de baja complejidad.
- Prototipado rapido de scripts Python: para generar esqueletos de funciones y utilidades en entornos de desarrollo con recursos limitados.
- Educacion y aprendizaje: puede explicar y corregir codigo Python basico en contextos de ensenanza, con respuestas breves y directas.
- Filtrado y generacion en pipelines de CI/CD: como generador de parches o sugerencias en tareas acotadas, siempre con revision humana y ejecucion de tests antes de aplicar cambios.
- Experimentacion en investigacion de MoE: modelo de referencia para estudiar el comportamiento de mezclas de expertos de muy bajo coste y para reproducir el pipeline de rejection sampling sobre codigo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). HumanEval y MBPP en modo chat, greedy, pass@1; benchmarks generales en 0-shot.

| Modelo | Parametros | Tokens de entrenamiento | HumanEval | MBPP |
|---|---|---|---|---|
| TinyBrainBot-360M-A75M-v5.1-Python | 383M (75M activos) | 20B | 14.6 | 32.7 |
| SmolLM2-360M-Instruct | 362M | 4T | 16.5 | 33.5 |
| SmolLM2-135M-Instruct | 135M | 2T | 7.9 | 10.9 |
| Qwen2.5-Coder-0.5B-Instruct | 494M | Qwen2.5 + 5.5T code | 52.4 | 46.3 |

| Benchmark general (0-shot, conjunto completo) | acc_norm | acc bruta |
|---|---|---|
| HellaSwag | 37.49 | 32.59 |
| ARC-Easy | 57.74 | 61.45 |
| ARC-Challenge | 34.64 | 33.28 |
| PIQA | 65.67 | 64.58 |
| ArithMark-3 | 46.60 | 46.60 |
| Open SLM Leaderboard Intelligence Index | 26.02 | 24.06 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 383M parametros totales, en precision completa (fp16) el modelo ocupa aproximadamente 0,8 GB de pesos; en cuantizaciones GGUF de 4-8 bits el consumo se reduce a rangos de cientos de MB. La VRAM adicional depende del contexto y del backend.
- GPU recomendadas: el modelo cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) y tambien en CPU. Para despliegues con mayor concurrencia se puede usar A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, con amplio margen, incluidas GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: transformers (carga como `MixtralForCausalLM`), llama.cpp y Ollama mediante los artefactos GGUF, y text-generation-inference (el repositorio esta marcado como compatible con endpoints TGI).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| TinyBrainBot-360M-A75M-v5.1-Python | 383M | 75M | no disponible | 14.6 | 32.7 | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| SmolLM2-360M-Instruct | 362M | 362M | no disponible | 16.5 | 33.5 | no disponible | HuggingFace |
| SmolLM2-135M-Instruct | 135M | 135M | no disponible | 7.9 | 10.9 | no disponible | HuggingFace |
| Qwen2.5-Coder-0.5B-Instruct | 494M | 494M | no disponible | 52.4 | 46.3 | no disponible | HuggingFace |

TinyBrainBot se situa en el mismo rango que SmolLM2-360M-Instruct en tareas de codigo, con un coste de entrenamiento muy inferior (20B frente a 4T tokens), mientras que Qwen2.5-Coder-0.5B, especializado en codigo y entrenado con billones de tokens, lo supera ampliamente y debe considerarse una referencia de categoria superior.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; no han sido reproducidos de forma independiente.
- Rendimiento en codigo modesto: HumanEval 14.6 y MBPP 32.7, muy por debajo de modelos especializados en codigo de tamano similar como Qwen2.5-Coder-0.5B.
- Solo ingles: el modelo no esta entrenado para castellano ni otros idiomas, por lo que su uso en esos idiomas producira respuestas de baja calidad.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado con 20B tokens, puede generar codigo incorrecto o explicaciones erroneas; requiere ejecucion de tests y revision humana antes de usar sus salidas en produccion.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de tareas que requieran contexto largo.
- Capacidades generales limitadas: resultados bajos en HellaSwag (37.49), ARC-Challenge (34.64) y el indice de inteligencia del leaderboard (26.02), por lo que no es adecuado para razonamiento general.
- Sin soporte documentado de tool calling, agentes o multimodalidad.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo de bajo rendimiento conviene evaluar su calidad antes de integrarlo en productos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no dispone de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-python
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-base
- SmolLM2-360M-Instruct (referencia comparativa): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- SmolLM2-135M-Instruct (referencia comparativa): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Qwen2.5-Coder-0.5B-Instruct (referencia comparativa): https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
