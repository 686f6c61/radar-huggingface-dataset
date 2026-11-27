# ETME-TECH/EliasAI-7B-v2.3

## Resumen

EliasAI-7B-v2.3 es un modelo de lenguaje de 7.615.616.512 parámetros desarrollado por ETME TECH (autor: Elias Rickert) a partir del modelo base Qwen/Qwen2.5-7B. Se trata de un ajuste fino orientado a conversación y razonamiento en alemán, con un modo de "pensamiento" explícito que el modelo emite dentro de etiquetas `` antes de generar la respuesta final. El modelo se distribuye en formato BF16 safetensors (cuatro shards, 14,19 GB) y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M).

La propuesta del modelo es un asistente conversacional en alemán con memoria de contexto a corto plazo, un estilo directo y "Try-First" (intenta responder antes de rechazar), y salvaguardas explícitas contra gaslighting e inyección de prompts. El entrenamiento se realizó sobre 44.739 diálogos alemanes curados, en hasta cinco turnos, repartidos en doce categorías temáticas.

Es relevante para desarrolladores que necesiten un modelo pequeño (7B) que quepa en GPU de consumo y que ofrezca razonamiento en alemán con un formato de salida controlado. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo hereda las limitaciones del Qwen2.5-7B subyacente y está especializado únicamente en alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M; BF16 safetensors |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 4 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only denso de 7,6 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado mediante QLoRA en 4 bits NF4, con rango `r=32` y `alpha=64`, incorporando *Differential Loss Weighting* y NEFTune. Además se calibró de forma convexa la cabeza EOS sobre el token `<|im_end|>`, y el adaptador se fusionó en BF16 en el modelo final. No se documenta una fase de RLHF o DPO; el entrenamiento descrito es de ajuste supervisado sobre diálogos.

El conjunto de datos de la versión 2.3 consta de 44.739 diálogos alemanes curados, de uno a cinco turnos, distribuidos en doce categorías equilibradas: explicaciones de conceptos, redacción y brainstorming, memoria a corto plazo, empatía y sarcasmo, opiniones y charla informal, traducción/resumen/corrección, conjeturas calibradas y límites duros, anti-gaslighting y anti-prompt-injection, correcciones honestas, dilemas morales, identidad ETME TECH y minijuegos. El autor reporta un benchmark final de 17/18, con TTR de 0,94 y val-loss de 1,1670, aunque no se detalla la metodología de dicha evaluación.

## Capacidades

- Generación de texto conversacional en alemán con estilo directo y coloquial.
- Razonamiento explícito en modo "thinking": el modelo emite un bloque `` en tres a seis frases antes de la respuesta.
- Memoria de contexto a corto plazo dentro de la conversación (hasta cinco turnos en los datos de entrenamiento).
- Explicaciones de conceptos, redacción, brainstorming, resumen, traducción y corrección de textos.
- Manejo de empatía, sarcasmo, opiniones y charla informal.
- Conjeturas calibradas ante incertidumbre, con declaración explícita de la confianza.
- Salvaguardas anti-gaslighting y anti-prompt-injection entrenadas de forma específica.
- Identidad de marca consistente (ETME TECH / Elias Rickert) mediante system prompt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente conversacional en alemán para atención al cliente: el modelo gestiona diálogos multi-turno con memoria a corto plazo y un tono directo, adecuado para consultas de producto y resolución de dudas frecuentes.
- Generación y corrección de textos en alemán: redacción de correos, resúmenes y reescritura de párrafos, aprovechando las categorías de "Texte & Brainstorming" y "Übersetzen/Zusammenfassen/Korrigieren".
- Chatbot de acompañamiento o soporte emocional ligero: el entrenamiento incluye empatía, sarcasmo y manejo de dilemas morales, útil en aplicaciones de bienestar o entretenimiento.
- Prototipado de agentes conversacionales en local: con la cuantización Q4_K_M (4,36 GB) puede ejecutarse en una GPU de consumo mediante llama.cpp u Ollama, lo que facilita iteración rápida sin infraestructura cloud.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo de 7B ejecutable en local con licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir de la organización.
- Educación y explicación de conceptos: el modo de razonamiento previo permite mostrar el "porqué" de una respuesta, útil en herramientas didácticas que quieran exponer el proceso de pensamiento.
- Evaluación de robustez frente a inyección de prompts: las categorías anti-prompt-injection del dataset permiten usarlo como referencia en pruebas de seguridad conversacional.

## Benchmarks y rendimiento

El autor reporta un benchmark final de 17/18, TTR de 0,94 y val-loss de 1,1670, sin especificar la composición ni la metodología del benchmark. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor | Notas |
|---|---|---|
| Benchmark final del autor | 17/18 | Metodología no detallada |
| TTR | 0,94 | Métrica no definida en la información |
| Val-loss | 1,1670 | Sobre el conjunto de validación del autor |

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para Q4_K_M y aproximadamente 10 GB para Q8_0, según las indicaciones del autor.
- VRAM estimada para BF16 safetensors: en torno a 15-16 GB (14,19 GB de pesos más overhead de activaciones y contexto).
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para BF16; GPUs de consumo con 6-10 GB (RTX 3060, RTX 4060 Ti, etc.) para las cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 6 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad de formato GGUF también Ollama y otros runners basados en llama.cpp. No se documenta soporte explícito para vLLM o TGI.
- Parámetros de muestreo recomendados por el autor: `--temp 0.55`, `--top-p 0.90`, `--repeat-penalty 1.06`, contexto `-c 8192`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EliasAI-7B-v2.3 | 7,6B | No disponible (ejemplo a 8192) | Alemán | Apache 2.0 | Ajuste fino conversacional con modo thinking |
| Qwen/Qwen2.5-7B (base) | 7,6B | 32.768 tokens (según ficha del modelo base) | Multilingüe | Apache 2.0 | Modelo base sin especialización en alemán |
| Modelos alemanes 7B de propósito general | No disponible | No disponible | Alemán | Variable | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; únicamente se conoce el modelo base y sus características generales.

## Limitaciones y advertencias

- Especializado exclusivamente en alemán; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- El modelo base Qwen2.5-7B puede introducir sesgos presentes en sus datos de preentrenamiento; el ajuste fino no garantiza su eliminación.
- Riesgo de alucinación inherente a modelos de 7B; el propio system prompt recomienda verificar hechos, matemáticas y código.
- El benchmark reportado (17/18) carece de metodología pública, por lo que no es directamente comparable con evaluaciones estándar.
- La longitud de contexto efectiva no está especificada; el ejemplo de despliegue usa 8192 tokens, por debajo de los 32.768 del Qwen2.5-7B base.
- El modelo declara límites duros (hora/precios en vivo, imágenes, dosificación médica, contenido ilegal) y recomienda derivar a modelos mayores en esos casos.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen2.5-7B para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- El ejemplo de `llama-server` de la model card referencia un fichero `EliasAI-7B-v6-Q4_K_M.gguf`, que no coincide con el nombre de los ficheros listados (v2.3); conviene verificar la ruta antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-7B-v2.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B

No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
