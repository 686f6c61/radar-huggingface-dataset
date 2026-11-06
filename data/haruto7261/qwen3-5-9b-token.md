# Haruto7261/Qwen3.5-9B-token

## Resumen

Qwen3.5-9B-token es una variante del modelo Qwen3.5-9B publicada por el usuario Haruto7261 en Hugging Face. Segun la model card, el autor ha anadido al tokenizer original un vocabulario especifico de "ryukyu-ben" (dialecto de Okinawa, Japon), con el objetivo de mejorar la tokenizacion y el tratamiento de esa variedad linguistica. El repositorio contiene unicamente pesos en formato safetensors con la arquitectura declarada `qwen3_5_text`, y suma 8.952.435.200 parametros totales (aproximadamente 8,95 mil millones).

Se trata de un modelo derivado de un modelo base de la familia Qwen3.5, por lo que hereda la arquitectura transformer del original, aunque no se documentan en la informacion disponible ni la longitud de contexto, ni los datos de entrenamiento, ni los detalles del proceso de extension del tokenizer. El tamano del repositorio (17,9 GB) es coherente con pesos en precision bf16/fp16 para ese numero de parametros.

Su relevancia es limitada y muy especifica: resulta de interes para quienes trabajen con procesamiento de lenguaje natural en japones, en particular con variantes dialectales de las islas Ryukyu, y quieran experimentar con un tokenizer adaptado. No obstante, la ausencia de model card detallada, licencia declarada y benchmarks hace que no sea recomendable para uso en produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5_text`; detalles no disponibles) |
| Parametros totales | 8.952.435.200 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (la model card menciona japones y ryukyu-ben) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como una modificacion de Qwen3.5-9B en la que se ha ampliado el tokenizer con tokens propios del dialecto de Okinawa (ryukyu-ben). No se especifica si el modelo fue reentrenado tras la extension del vocabulario, si solo se ajustaron los embeddings de los tokens nuevos o si se realizo un fine-tuning completo. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o instruccion.

La unica innovacion tecnica declarada es la extension del tokenizer. Cualquier otra caracteristica del modelo base (mecanismos de atencion, posibles modos de razonamiento, soporte de tool calling, etc.) queda fuera de la informacion disponible y no puede confirmarse para esta variante concreta.

## Capacidades

- Generacion de texto en japones, presumiblemente con mejor cobertura de tokenizacion para ryukyu-ben gracias al tokenizer extendido.
- Procesamiento de texto dialectal de Okinawa a nivel de tokenizer (capacidad declarada por el autor; sin evaluacion publica).
- Capacidades heredadas del modelo base Qwen3.5-9B: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo se menciona el japones y el dialecto de Ryukyu).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Normalizacion y procesamiento de texto en ryukyu-ben: el tokenizer extendido puede reducir el numero de tokens necesarios para representar texto dialectal, lo que resulta util en tareas de limpieza, segmentacion y analisis de corpus de Okinawa.
- Investigacion linguistica sobre variantes del japones: permite experimentar con modelos de 9 B de parametros sobre corpus dialectales y comparar la tokenizacion frente al modelo base.
- Prototipos de traduccion japones estandar a ryukyu-ben: como base para fine-tuning supervisado en pares de frases, aprovechando que el vocabulario ya cubre el dialecto.
- Chatbots locales de tematica cultural o turistica de Okinawa: utilizable en entornos de demostracion donde se quiera mostrar tratamiento de la lengua local, siempre con validacion humana.
- Generacion de subtitulos o transcripciones para contenido audiovisual en dialecto: el modelo puede servir como componente de un pipeline ASR + LLM, con la cautela de que no hay benchmarks publicados.
- Base para fine-tuning con LoRA en tareas especificas de japones: al ser un modelo de ~9 B, cabe en GPUs de 24 GB en cuantizacion de 4 bits, lo que facilita experimentos academicos con recursos limitados.
- Evaluacion comparativa de tokenizers: caso de uso metodologico para medir el impacto de la extension de vocabulario en la perplejidad y la longitud de secuencia sobre textos dialectales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantizacion, siempre que se conviertan los pesos a GGUF o AWQ/GPTQ (no se publican versiones cuantizadas).
- Opciones de despliegue: vLLM, TGI y transformers para safetensors; llama.cpp u Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haruto7261/Qwen3.5-9B-token | ~8,95 B | no disponible | no disponible | safetensors en HF, 47 descargas |
| Qwen3.5-9B (modelo base) | ~9 B (segun denominacion; dato no verificado en la informacion) | no disponible | no disponible | presumiblemente en HF, no verificado |
| Qwen2.5-7B | 7,6 B | 128 K (segun documentacion publica del modelo) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF, AWQ, multiples mirrors |
| Llama 3.1 8B | 8,0 B | 128 K (segun documentacion publica) | Llama 3.1 Community License | safetensors, GGUF, multiples mirrors |

La comparacion con Qwen2.5-7B y Llama 3.1 8B se ofrece solo como referencia de categoria (modelos densos de 7-9 B); no se dispone de datos que permitan comparar rendimiento con esta variante concreta.

## Limitaciones y advertencias

- No se declara licencia en el repositorio; no puede asumirse uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- La model card es extremadamente escueta y no documenta datos de entrenamiento, proceso de extension del tokenizer ni evaluaciones.
- Riesgo elevado de alucinacion y de comportamiento degradado en tareas distintas del japones, dado que no hay informacion sobre el ajuste realizado.
- La extension del tokenizer puede haber alterado los embeddings de entrada/salida; sin validacion publica, no se puede garantizar que el modelo mantenga las capacidades del base.
- No hay versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- El numero de descargas (47) y de likes (0) sugiere una adopcion muy baja; no existe comunidad ni soporte.
- Posibles sesgos linguisticos y culturales derivados del modelo base y del corpus japones utilizado, no documentados.
- No se especifica la longitud de contexto efectiva; asumir la del modelo base sin verificacion puede provocar fallos en produccion.
- Fecha de creacion y actualizacion (octubre-noviembre de 2026) indica un repositorio muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Haruto7261/Qwen3.5-9B-token
- Modelo base Qwen3.5-9B: no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible
- Repositorio de codigo o demo: no disponible
