# mparra137/llama-lora-medical-tc3-300

## Resumen

`mparra137/llama-lora-medical-tc3-300` es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, que a su vez es una version cuantizada a 4 bits de `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario mparra137 en Hugging Face bajo licencia Apache 2.0 y esta orientado, segun el nombre del repositorio, a un dominio medico. El entrenamiento se realizo con la libreria Unsloth, que acelera el proceso aproximadamente 2x mediante kernels optimizados y reduccion de memoria.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030 millones de parametros y una ventana de contexto nativa de 128.000 tokens. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA (no con los pesos completos del modelo base). No se ha publicado informacion sobre el dataset de entrenamiento, el numero de pasos, hiperparametros ni evaluaciones de rendimiento.

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva mas alla de la plantilla automatica de Unsloth. Se documenta aqui por completitud, pero cualquier evaluacion de produccion deberia partir del modelo base oficial y de adaptadores con documentacion verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino con LoRA sobre base cuantizada a 4 bits (bnb-4bit) |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B); tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | Base en 4 bits (bitsandbytes); el adaptador LoRA se distribuye presumiblemente en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (segun la model card); el modelo base soporta oficialmente 8 idiomas, pero el ajuste declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base usa bnb-4bit |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Llama 3.1 con 8.030 millones de parametros, 32 capas, atencion con RoPE y ventana de contexto de 128.000 tokens. Sobre esa base cuantizada a 4 bits con bitsandbytes se aplico un ajuste fino con LoRA mediante Unsloth y TRL. El repositorio contiene unicamente el adaptador (0,2 GB), por lo que para usarlo es necesario cargar primero el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` y aplicar despues los pesos LoRA.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus medico, si se aplico RLHF, DPO o simplemente SFT supervisado, ni sobre hiperparametros como rango del LoRA, alpha, learning rate o numero de pasos. El sufijo `tc3-300` del nombre sugiere algun tipo de configuracion experimental (posiblemente 300 pasos o un dataset concreto), pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones conversacionales multi-turno.
- Generacion de codigo y matematicas basicas (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del modelo base Llama 3.1 Instruct).
- Capacidad de contexto largo hasta 128.000 tokens (teorica, heredada del base).
- Especializacion presunta en dominio medico por el nombre del repositorio, sin documentacion que la respalde.
- No se documenta soporte de vision, audio ni modo "thinking" explicito.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Prototipado de asistentes clinicos en ingles: el modelo podria emplearse para generar borradores de respuestas a preguntas medicas frecuentes, aunque la ausencia de evaluacion impide recomendarlo en entornos reales sin validacion exhaustiva.
- Extraccion de informacion de notas clinicas: con 128.000 tokens de contexto, podria procesar historiales extensos en una sola pasada, si bien el ajuste LoRA no garantiza mejoras sobre el base en esta tarea.
- Investigacion academica sobre fine-tuning medico: sirve como ejemplo reproducible de pipeline Unsloth + LoRA sobre Llama 3.1 8B cuantizado a 4 bits.
- Generacion de resumenes de articulos biomedicos en ingles: el contexto largo permite introducir papers completos, aunque la calidad no esta medida.
- Base para experimentos de alineacion en dominio sanitario: util como punto de partida para comparar estrategias de SFT o DPO.
- Demostraciones de despliegue con TGI o vLLM: al ser compatible con `text-generation-inference`, puede integrarse en pipelines de inferencia estandar, siempre que se cargue junto al modelo base.
- Educacion y formacion: generacion de material didactico de divulgacion medica en ingles, con supervision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 5-6 GB; con el adaptador LoRA y overhead de inferencia, se estiman 8-10 GB de VRAM para contexto corto.
- Para contexto completo de 128.000 tokens, la KV cache puede requerir decenas de GB adicionales; se recomienda GPU con 40-80 GB (A100 40GB/80GB, H100).
- Cabe en GPU de consumo: RTX 3090, RTX 4090 (24 GB) para contextos moderados; RTX 4080 o 4070 Ti Super (16 GB) para contexto corto.
- Opciones de despliegue: transformers (carga del base bnb-4bit + adaptador), text-generation-inference (tag incluido), vLLM (requiere fusionar el adaptador), llama.cpp/Ollama (requiere conversion a GGUF tras fusion).
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mparra137/llama-lora-medical-tc3-300 | 8B (base) | 128k | Apache 2.0 | Hugging Face (0 descargas) | Adaptador LoRA sin evaluacion publica |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face (oficial) | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face | Alternativa abierta con contexto menor |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Hugging Face | Multilingue, benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset, el proceso de entrenamiento y las metricas de evaluacion.
- Riesgo elevado de alucinacion en dominio medico: no hay validacion clinica ni benchmarks publicados.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no se pueden evaluar sesgos demograficos, linguisticos o culturales.
- El modelo declara solo ingles; el uso en castellano no esta soportado oficialmente.
- Requiere cargar el modelo base cuantizado a 4 bits, lo que anade perdida de precision frente al modelo original en fp16/bf16.
- Aunque la licencia es Apache 2.0, el modelo base Llama 3.1 esta sujeto a la Llama 3.1 Community License; conviene revisar la compatibilidad para uso comercial.
- No apto para diagnostico, tratamiento ni decision clinica sin supervision de profesionales sanitarios.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mparra137/llama-lora-medical-tc3-300
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de TRL: https://huggingface.co/docs/trl
- Paper de Llama 3: https://arxiv.org/abs/2407.21783
