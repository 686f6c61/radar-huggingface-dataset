# kaitchup/Qwen3.8-27B-SLQ-EAR97.8

## Resumen

Qwen3.8-27B-SLQ-EAR97.8 es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el autor independiente kaitchup (The Kaitchup). No es un modelo entrenado desde cero, sino una compresión del checkpoint original mediante una versión personalizada de SLQ (Statistically-Lossless Quantization), una técnica que combina candidatos de cuantización entera y selecciona precisión y tamaño de grupo de forma independiente para cada proyección del decodificador. El resultado se empaqueta para el backend Humming de vLLM mediante el formato compressed-tensors.

El objetivo declarado es alcanzar un EAR (Expected Acceptance Rate) superior al 97,8 %; el valor medido en el checkpoint empaquetado es del 97,863974 %. El EAR mide el solapamiento entre las distribuciones de probabilidad del siguiente token del modelo BF16 original y las del modelo cuantizado, renormalizadas sobre los diez tokens más probables de la referencia. Conviene subrayar que un EAR alto no equivale a una precisión de benchmark idéntica ni a salidas generadas iguales.

El modelo conserva la arquitectura y las capacidades del Qwen3.8-27B original, incluidas las pesos MTP en BF16 sin modificar y los pesos de visión, aunque la validación publicada se limita a carga de texto, generación y medición de EAR sobre vLLM 0.31.0 con humming-kernels 0.1.16 en una NVIDIA GH200. El interés práctico reside en reducir el peso en disco a 21,542 GB manteniendo una fidelidad estadística alta respecto al BF16, lo que facilita su despliegue en infraestructura con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); detalles de capas no disponibles |
| Parametros totales | 24.236.203.400 (24,24 B) según safetensors; el nombre comercial indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el comando de servicio `--max-model-len`) |
| Tipos de cuantizacion | SLQ con precisión entera mixta por proyección y tamaño de grupo variable; embeddings y activaciones en BF16; pesos MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (backend Humming de vLLM) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5 según las etiquetas del repositorio. No se ha reentrenado: la publicación es un proceso de compresión post-entrenamiento. La búsqueda de SLQ parte de tres fuentes de candidatos: pesos GPTQ generados localmente a partir del modelo base, variantes de refinamiento entero ya existentes y los pesos BF16 originales. Para cada proyección del decodificador, el algoritmo elige de forma independiente la precisión entera y el tamaño de grupo que mejor equilibran tamaño y fidelidad, lo que produce un mapa de bitwidth almacenado heterogéneo entre capas (documentado en el fichero `precision.svg` del repositorio).

La innovación técnica principal es el uso del backend Humming de vLLM para servir estos pesos de precisión mixta, junto con el formato compressed-tensors. El modelo conserva los pesos MTP (multi-token prediction) originales en BF16 sin tocar y mantiene los pesos y procesadores de visión, aunque la validación publicada no cubre inferencia de imagen ni vídeo. El criterio de selección es el EAR@10 empaquetado, es decir, el solapamiento de probabilidades sobre el top-10 del modelo de referencia; el autor advierte explícitamente que la equivalencia estadística en tareas downstream no se ha establecido para esta release.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat compatible con la API de OpenAI.
- Razonamiento con modo thinking, parseable mediante `--reasoning-parser qwen3`.
- Tool calling y elección automática de herramientas con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Soporte de contexto largo: el comando de referencia configura 262.144 tokens de longitud máxima.
- Pesos y procesadores de visión conservados en el checkpoint, aunque la validación publicada no incluye inferencia de imagen ni vídeo (el ejemplo de servicio los desactiva con `--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Pesos MTP conservados en BF16, si bien la decodificación especulativa no se incluyó en la validación del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat compatible con OpenAI: el checkpoint se levanta con `vllm serve` y expone `/v1/chat/completions`, lo que permite sustituir una API propietaria por un endpoint autoalojado con el mismo contrato HTTP.
- Asistentes de razonamiento de contexto largo: con 262.144 tokens de ventana configurados, encaja en análisis de documentos extensos, revisiones de código completas o historiales de conversación prolongados sin truncar.
- Agentes con herramientas: la combinación de `qwen3_coder` como parser de tool calls y el parser de razonamiento `qwen3` permite construir bucles de agente multi-paso donde el modelo decide qué función invocar y justifica el paso.
- Despliegue en hardware con memoria ajustada: al ocupar 21,542 GB de pesos en lugar del BF16 completo, reduce los requisitos de VRAM y hace viable servir el modelo en una sola GPU de gama alta con margen para caché KV.
- Evaluación de técnicas de cuantización: el repositorio publica el mapa de precisión por capa y las curvas EAR frente a tamaño, lo que lo convierte en material útil para investigadores que comparan SLQ con GPTQ u otros esquemas de precisión mixta.
- Prototipado e investigación en entornos con presupuesto: al ser Apache 2.0 y ejecutarse sobre vLLM, se integra en pipelines existentes sin coste de licencia y con herramientas estándar del ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es el EAR empaquetado del 97,863974 %, obtenido sobre vLLM 0.31.0 con humming-kernels 0.1.16 en una NVIDIA GH200. El autor advierte que este valor mide solapamiento de probabilidades sobre el top-10, no precisión en tareas.

| Metrica | Valor | Entorno |
|---|---|---|
| EAR@10 empaquetado | 97,863974 % | vLLM 0.31.0, humming-kernels 0.1.16, NVIDIA GH200 |
| Tamano de pesos | 21.542.351.288 bytes (21,542 GB) | Ficheros safetensors |
| MMLU, HumanEval, GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM para pesos: 21,542 GB solo en pesos; hay que sumar búferes de runtime y caché KV, por lo que el consumo real de servicio es superior.
- GPU recomendadas: el autor valida en NVIDIA GH200. Por tamaño, una A100 de 80 GB o una H100 de 80 GB dejan margen holgado para caché KV con contexto largo; una RTX 4090 de 24 GB queda al límite y probablemente no permite contextos de 262.144 tokens.
- GPU de consumo: cabe en tarjetas de 24 GB solo con contexto muy reducido y sin margen para búferes; no es un despliegue recomendado.
- Opciones de despliegue: vLLM con soporte de Humming y `--quantization compressed-tensors --linear-backend humming`. No se documenta soporte para llama.cpp, Ollama ni TGI, dado que el formato compressed-tensors con backend Humming es específico de vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| kaitchup/Qwen3.8-27B-SLQ-EAR97.8 | 24,24 B (safetensors) | 262.144 | SLQ mixta, compressed-tensors | Apache 2.0 | EAR medido 97,86 %; validado solo en vLLM/Humming |
| Qwen/Qwen3.8-27B (base BF16) | 27 B (nominal) | no disponible | ninguna (BF16) | Apache 2.0 | Referencia de fidelidad; mayor peso en disco |
| Otras releases EAR de kaitchup sobre el mismo base | no disponible | no disponible | SLQ | Apache 2.0 | El autor las compara en `ear-vs-size.svg`; valores no incluidos en la información |

No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas con modelos de otros autores.

## Limitaciones y advertencias

- El EAR mide solapamiento de probabilidades, no precisión en benchmarks ni equivalencia de respuestas generadas; el autor lo declara explícitamente.
- La equivalencia estadística en tareas downstream no se ha establecido para esta release.
- La validación cubre únicamente carga de texto, generación y EAR; inferencia de imagen y vídeo, así como decodificación especulativa, quedaron fuera de las pruebas.
- El checkpoint depende del backend Humming de vLLM; otros runtimes pueden producir resultados ligeramente distintos.
- Los resultados medidos corresponden a una GH200 concreta con versiones específicas de vLLM y humming-kernels; no se garantiza su traslado a otro hardware.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base Qwen3.8-27B.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser una release de un tercero no oficial, la responsabilidad de validación recae en quien la despliega.
- El nombre comercial indica 27B mientras que safetensors reporta 24,24 B de parámetros; conviene no asumir cifras de memoria a partir del nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR97.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de SLQ: https://arxiv.org/abs/2605.02404
- Repositorio de SLQ: https://github.com/IST-DASLab/SLQ
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
