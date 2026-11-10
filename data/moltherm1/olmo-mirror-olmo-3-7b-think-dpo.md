# moltherm1/olmo-mirror-olmo-3-7b-think-dpo

## Resumen

Olmo 3 7B Think DPO es un modelo de lenguaje de 7.000 millones de parametros desarrollado por el Allen Institute for AI (Ai2) como parte de la familia Olmo 3. Se trata de la etapa intermedia de post-entrenamiento del modelo "Think" de 7B: parte del checkpoint SFT (allenai/Olmo-3-7B-Think-SFT) y se afina mediante DPO (Direct Preference Optimization) sobre el dataset Dolci-Think-DPO-7B. El repositorio concreto evaluado aqui (moltherm1/olmo-mirror-olmo-3-7b-think-dpo) es un espejo de terceros del checkpoint oficial, con cero descargas y cero likes en el momento de la consulta.

El modelo esta especializado en razonamiento de cadena de pensamiento larga (long chain-of-thought), lo que mejora tareas de matematicas y generacion de codigo. Genera su traza de razonamiento dentro de etiquetas `<think>...</think>` antes de la respuesta final, un formato habitual en modelos de razonamiento. La familia Olmo 3 se caracteriza por ser completamente abierta: pesos, codigo, checkpoints intermedios y detalles de entrenamiento, con el objetivo declarado de habilitar la ciencia de los modelos de lenguaje.

La relevancia de este checkpoint radica en su caracter reproducible y en su licencia Apache 2.0, que permite uso comercial sin las restricciones habituales de otros modelos de razonamiento. Es un modelo solo en ingles, con corte de conocimiento en diciembre de 2024, y esta pensado para investigacion y uso educativo segun las directrices de uso responsable de Ai2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 7B (aproximadamente 7.000 millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (load_in_8bit); float16; no se detallan otras en la model card |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no se detalla explicitamente en la model card) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de tipo decoder-only, tal y como declara la model card ("a Transformer style autoregressive language model"). Forma parte de la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think. El pipeline de post-entrenamiento consta de tres etapas: SFT sobre el checkpoint base, DPO y finalmente RLVR (Reinforcement Learning with Verifiable Rewards) para producir el modelo final. Este repositorio corresponde a la etapa DPO, es decir, un ajuste por preferencias sobre el modelo SFT, antes de la etapa final de RLVR.

El pre-entrenamiento se realizo sobre el dataset Dolma 3 y el post-entrenamiento sobre los datasets Dolci, en concreto Dolci-Think-DPO-7B para esta etapa. El modelo esta disenado para generar razonamiento de cadena de pensamiento larga, con la traza encapsulada en etiquetas `<think>` y `</think>`. La model card no proporciona el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset. El codigo de entrenamiento esta disponible en los repositorios Open-Instruct (DPO y RLVR) y OLMo-Core (pre-entrenamiento y SFT).

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat basada en `<|im_start|>` y `<|im_end|>`.
- Razonamiento de cadena de pensamiento larga (modo thinking) con salida estructurada en `<think>...</think>`.
- Razonamiento matematico de nivel competitivo (resultados destacados en MATH, AIME 2024 y AIME 2025).
- Generacion de codigo y resolucion de problemas de programacion (la model card menciona mejora en coding, aunque los benchmarks detallados de codigo no aparecen completos en la informacion disponible).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo thinking facilita el razonamiento multi-paso, pero no se documenta integracion especifica con frameworks de agentes.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos: el modelo puede abordar problemas de competicion (nivel AIME) generando primero una traza de razonamiento larga y luego la respuesta final; es adecuado por su entrenamiento especifico en modo thinking y sus resultados en MATH y AIME.
- Tutorizacion de matematicas y ciencias: puede explicar el razonamiento paso a paso dentro de `<think>`, lo que permite mostrar el proceso a estudiantes; util en plataformas educativas que quieran transparencia en el razonamiento.
- Generacion de codigo asistida: puede integrarse en asistentes de programacion que se beneficien de razonamiento previo a la respuesta; su licencia Apache 2.0 permite incorporarlo en productos comerciales.
- Investigacion sobre post-entrenamiento: al ser un checkpoint intermedio (SFT -> DPO -> RLVR) con codigo y datos publicos, sirve para estudiar el efecto de DPO frente a RLVR en modelos de razonamiento.
- Evaluacion comparativa de modelos abiertos: util como linea base reproducible en estudios de razonamiento, dado que toda la cadena de entrenamiento es publica.
- Despliegue en entornos con requisitos de licencia permisiva: su licencia Apache 2.0 y su tamano de 7B lo hacen apto para inferencia en una sola GPU, en escenarios donde otras licencias de modelos de razonamiento son restrictivas.
- Experimentacion academica con cuantizacion: la model card documenta el uso de 8 bits con bitsandbytes, lo que facilita su ejecucion en hardware limitado para investigacion.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion parcial. Los datos disponibles (la tabla aparece truncada en la informacion proporcionada) son los siguientes:

| Habilidad | Benchmark | Olmo 3 Think 7B SFT | Olmo 3 Think 7B DPO | Olmo 3 Think 7B (final) | OpenThinker3-7B | Nemotron-Nano-9B-v2 | DeepSeek-R1-Distill-Qwen-7B | Qwen 3 8B (reasoning) | Qwen 3 VL 8B Thinker | OpenReasoning Nemotron 7B |
|---|---|---|---|---|---|---|---|---|---|---|
| Math | MATH | 94.4 | 92.4 | 95.1 | 94.5 | 94.4 | 87.9 | 95.1 | 95.2 | 94.6 |
| Math | AIME 2024 | 69.6 | 74.6 | 71.6 | 67.7 | 72.1 | 54.9 | 74.0 | 70.9 | 77.0 |
| Math | AIME 2025 | 57.6 | 62.7 | 64.6 | 57.2 | 58.9 | 40.2 | 67.8 | 61.5 | 73.1 |
| Math | OMEGA | 45.0 | 40. | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: el valor de OMEGA para el checkpoint DPO aparece truncado en la informacion disponible ("40."), por lo que no se puede confirmar la cifra exacta. No se han publicado en la informacion disponible resultados de benchmarks de codigo (HumanEval, MBPP), conocimiento general (MMLU) ni otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, aproximadamente 14-16 GB para los pesos de un modelo de 7B, mas memoria para el contexto y las activaciones; en 8 bits (bitsandbytes), aproximadamente 7-8 GB para los pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue a gran escala; RTX 4090 (24 GB) para inferencia en float16 con margen; GPUs de 16 GB (RTX 4080, A4000) para cuantizacion en 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en float16 y en GPUs de 12-16 GB con cuantizacion en 8 bits. En GPUs de 8 GB seria necesario cuantizacion adicional no documentada en la model card.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial), bitsandbytes para cuantizacion en 8 bits. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modo thinking genera secuencias largas, lo que incrementa el tiempo de generacion respecto a modelos sin razonamiento explicito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olmo 3 7B Think DPO | 7B | no disponible | 92.4 | 74.6 | Apache 2.0 | Hugging Face (espejo de terceros) |
| Qwen 3 8B (reasoning) | 8B | no disponible | 95.1 | 74.0 | no disponible en la informacion | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | 87.9 | 54.9 | no disponible en la informacion | Hugging Face |
| OpenThinker3-7B | 7B | no disponible | 94.5 | 67.7 | no disponible en la informacion | Hugging Face |

El checkpoint DPO evaluado obtiene resultados competitivos en MATH y AIME 2024 frente a modelos de razonamiento de tamano similar, aunque queda por detras de Qwen 3 8B en AIME 2025 (62.7 frente a 67.8) y de OpenReasoning Nemotron 7B en AIME 2024 y 2025. Su principal ventaja diferencial es la licencia Apache 2.0 y la apertura completa de la cadena de entrenamiento.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Corte de conocimiento en diciembre de 2024; no conoce eventos posteriores.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado por cadenas de razonamiento largas que pueden contener pasos erroneos no verificados.
- Sesgos conocidos: no se documentan en la informacion disponible, pero al entrenarse sobre datos web (Dolma 3) es probable que herede sesgos presentes en ellos.
- El modo thinking genera secuencias largas, lo que aumenta coste computacional y latencia en produccion.
- Este repositorio concreto es un espejo de terceros (moltherm1) con cero descargas; para uso en produccion es preferible el checkpoint oficial allenai/Olmo-3-7B-Think-DPO.
- La model card indica que el modelo esta destinado a investigacion y uso educativo conforme a las directrices de uso responsable de Ai2, aunque la licencia Apache 2.0 permite uso comercial.
- No se documentan capacidades de tool calling ni integracion con agentes; no debe asumirse su disponibilidad.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar escenarios de contexto largo.

## Enlaces

- Repositorio evaluado: https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-think-dpo
- Checkpoint oficial DPO: https://huggingface.co/allenai/Olmo-3-7B-Think-DPO
- Modelo base SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Modelo base pre-entrenado: https://huggingface.co/allenai/Olmo-3-1025-7B
- Modelo final (RLVR): https://huggingface.co/allenai/Olmo-3-7B-Think
- Pagina del proyecto: https://allenai.org/olmo
- Directrices de uso responsable: https://allenai.org/responsible-use
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (pre-entrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval: https://github.com/allenai/OLMo-Eval
- Paper: pendiente de publicacion segun la model card (referencia arxiv:2512.13961 en los metadatos de Hugging Face)
