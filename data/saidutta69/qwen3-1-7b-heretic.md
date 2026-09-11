# saidutta69/Qwen3-1.7B-heretic

## Resumen

Qwen3-1.7B-heretic es una variante "decensored" del modelo denso Qwen/Qwen3-1.7B publicada por el usuario saidutta69 (bajo la etiqueta RACER IS OP). Se ha generado con la herramienta Heretic v1.4.0, que aplica ablación direccional ("abliteration") sobre las direcciones de rechazo por capa, en lugar de un ajuste fino supervisado. El objetivo es eliminar el comportamiento de negativa del modelo base manteniendo, en la medida de lo posible, sus conocimientos y su capacidad de razonamiento híbrido (modo thinking) heredada de la familia Qwen3.

El modelo conserva la arquitectura del base: es un transformer decoder-only denso de 1.720.574.976 parámetros (≈1,7 B), sin mezcla de expertos ni parámetros activos diferenciados. Su principal atractivo es el tamano: cabe en GPUs de consumo e incluso en CPU, y se distribuye con una escalera completa de 15 cuantizaciones GGUF (de Q2_K a F16) además de los pesos en safetensors, con licencia Apache 2.0 heredada del modelo original.

Es relevante ahora como pieza de estudio y como base de experimentación: permite analizar la mecánica del rechazo en una arquitectura con modo thinking, sirve como punto de partida para fine-tuning sin guardarraíles y se integra en el ecosistema local (llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang). Su contrapartida es que no incorpora ningún filtro de seguridad adicional, por lo que la responsabilidad de despliegue recae enteramente en quien lo usa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, con razonamiento hibrido thinking/no-thinking) |
| Parametros totales | 1.720.574.976 (≈1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card del derivado; el modelo base Qwen3-1.7B declara 32.768 tokens nativos (dato del base, no confirmado en esta ficha) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; pesos completos en safetensors |
| Idiomas soportados | en (ingles, segun la etiqueta `language` de la model card) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors y GGUF (llama.cpp) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-1.7B |
| Pipeline | text-generation |
| Tamano del repositorio | 19,2 GB (incluye safetensors y las 15 cuantizaciones GGUF) |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B original, un transformer decoder-only denso de 1,7 B de parámetros con capacidad de razonamiento híbrido (alternancia entre modo thinking y modo directo). Este derivado no ha sido reentrenado ni sometido a fine-tuning: la model card es explicita al afirmar que el comportamiento de rechazo se suprime mediante ediciones de pesos dirigidas, no mediante ajuste supervisado, RLHF ni DPO. La intervención se aplica a las proyecciones de salida de atención (`attn.o_proj`) y a las proyecciones descendentes del MLP (`mlp.down_proj`), usando direcciones de rechazo calculadas por capa (`direction_index: per layer`).

Los hiperparámetros declarados de la ablación son: para `attn.o_proj`, `max_weight` 1,48 en la posición 25,98, `min_weight` 1,44 a distancia 16,08; para `mlp.down_proj`, `max_weight` 1,45 en la posición 21,22, `min_weight` 0,21 a distancia 11,05. El coste de esta edición se mide con divergencia KL respecto al modelo original: 0,0248 en este derivado (0 por definición en el base). No se detallan en la informacion proporcionada el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni el uso de tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento hibrido: conserva la capacidad de modo thinking del Qwen3 base, segun indica el autor ("Qwen3 hybrid thinking capability... left largely intact").
- Comportamiento sin guardarraíles de rechazo: responde a peticiones que el modelo base rechazaria (4/100 negativas frente a 92/100 del original, segun la metrica declarada por el autor).
- Base para fine-tuning: pensado explicitamente como punto de partida para ajustes posteriores sin partir de un modelo con rechazo.
- Estudio de mecanica del rechazo: util para analizar direcciones de negativa por capa en una arquitectura con thinking.
- Despliegue local en CPU, Apple Silicon y GPU de consumo gracias al catalogo GGUF.
- Compatibilidad de endpoints: la etiqueta `endpoints_compatible` y el soporte de text-generation-inference permiten servirlo en infraestructura tipo TGI.
- No se declaran capacidades de vision, audio, tool calling ni function calling en la informacion proporcionada.

## Casos de uso

- Experimentacion sobre alineacion y rechazo: como sujeto de estudio para comparar, capa por capa, la diferencia entre las direcciones de rechazo del base y las de este derivado, midiendo el impacto con divergencia KL (0,0248 declarada).
- Punto de partida para fine-tuning tematico: al no tener el sesgo de rechazo del original, es mas eficiente para ajustar dominios especializados (legal, seguridad ofensiva, escritura de ficcion adulta) donde el modelo base bloquearia ejemplos de entrenamiento.
- Generacion creativa sin filtros: redaccion de narrativa o guiones con temas sensibles, sin las negativas que interrumpen la generacion del base.
- Asistente local en CPU: con el quant Q4_K_M (~1,09 GB) se ejecuta integramente en RAM de sistema, util para prototipos offline en portatiles sin GPU.
- Evaluacion de despliegue en GPU de consumo: con Q8_0 (~1,82 GB) mas ~1 GB de contexto cabe en una RTX 3060/4070/5070 de 12 GB, y con Q5_K_M (~1,24 GB) en tarjetas de 6 GB como GTX 1660 Super o RTX 3050 laptop, segun la matriz del autor.
- Investigacion de cuantizacion: el repositorio incluye 15 variantes GGUF (de Q2_K a F16) que permiten medir degradacion de calidad frente a tamano en un mismo modelo.
- Generacion de texto en ingles a gran volumen: al ser un modelo de 1,7 B, el throughput por GPU es alto y el coste por token bajo para tareas de clasificacion, resumen o reescritura no sensibles a la seguridad.
- Pruebas de robustez de sistemas de moderacion: usar este modelo como generador adversario controlado para validar que los filtros externos de una plataforma detectan contenido que un modelo abliterado si produce.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas de ablacion y de rechazo frente al modelo base; no hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion proporcionada.

| Metrica | Qwen3-1.7B-heretic | Qwen/Qwen3-1.7B (original) |
|---|---|---|
| Divergencia KL | 0,0248 | 0 (por definicion) |
| Rechazos | 4/100 | 92/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, modelo a tamano nativo de 1,7 B): Q2_K ~0,75 GB; IQ3_S y Q3_K_S ~0,84 GB; Q3_K_M ~0,90 GB; Q3_K_L ~0,97 GB; IQ4_XS ~0,99 GB; Q4_0 ~1,02 GB; Q4_K_S ~1,04 GB; Q4_K_M ~1,09 GB; Q4_1 ~1,12 GB; Q5_K_S ~1,21 GB; Q5_K_M ~1,24 GB; Q6_K ~1,40 GB; Q8_0 ~1,82 GB; F16 ~3,4 GB.
- El autor recomienda anadir aproximadamente 1 GB adicional para el contexto.
- GPU de 12 GB (RTX 3060, 4070, 5070): quant recomendado Q8_0 (~1,8 GB).
- GPU de 8 GB (RTX 4060, 3070): quant recomendado Q6_K (~1,4 GB).
- GPU de 6 GB (GTX 1660 Super, RTX 2060, RTX 3050 laptop): quant recomendado Q5_K_M (~1,2 GB).
- CPU-only o Apple Silicon: Q4_K_M, cabe en memoria de sistema.
- Si hay OOM, el propio autor sugiere bajar un nivel de cuantizacion; si sobra margen, subir uno.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3-1.7B-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang y text-generation-inference. Tambien es cargable directamente con transformers (`AutoModelForCausalLM`, `torch_dtype="auto"`, `device_map="auto"`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saidutta69/Qwen3-1.7B-heretic | 1,72 B (denso) | no especificado | 4/100 (KL 0,0248) | Apache 2.0 | safetensors + 15 quants GGUF |
| Qwen/Qwen3-1.7B (base) | 1,72 B (denso) | no confirmado en la informacion disponible | 92/100 (KL 0 por definicion) | Apache 2.0 | safetensors |
| saidutta69/Qwen3-0.6B-heretic | no disponible | no disponible | no disponible | no disponible | no disponible |
| saidutta69/Qwen3-8B-heretic | no disponible | no disponible | no disponible | no disponible | no disponible |

Los tres derivados de la coleccion "RACER IS OP Heretic Models" comparten metodo (Heretic + ablacion direccional) y difieren en tamano, pero la informacion proporcionada solo aporta datos cuantitativos del modelo de 1,7 B. No se dispone de comparativas frente a otras familias abliteradas.

## Limitaciones y advertencias

- La supresion del rechazo es intencionada y sin filtro de seguridad adicional: el modelo cumplira peticiones que el base rechaza, incluidas algunas que no deberia.
- El propio autor advierte de no exponerlo tras un endpoint publico sin moderacion para terceros.
- La abliteracion no anade capacidad ni criterio: hereda las limitaciones factuales y los sesgos de Qwen3-1.7B.
- Riesgo de alucinacion propio de un modelo de 1,7 B, sin mitigaciones adicionales; no se han publicado evaluaciones de factualidad.
- Idiomas: unicamente ingles declarado (`language: en`), sin cobertura multilingue confirmada.
- Longitud de contexto no especificada en la model card del derivado; conviene verificarla antes de disenar flujos con contexto largo.
- Divergencia KL de 0,0248 respecto al original: implica un cambio medible en la distribucion de salida que puede afectar a tareas sensibles a la calibracion, no solo al rechazo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni garantia de mantenimiento por parte del autor.
- Las tallas GGUF son estimaciones del autor ("updated to exact values once quantization completes"), por lo que pueden variar ligeramente.
- El repositorio ocupa 19,2 GB; descargar el conjunto completo de cuantizaciones no es necesario si solo se usa una.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/Qwen3-1.7B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Herramienta Heretic (ablacion direccional): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Qwen3-0.6B-heretic: https://huggingface.co/saidutta69/Qwen3-0.6B-heretic
- Qwen3-8B-heretic: https://huggingface.co/saidutta69/Qwen3-8B-heretic
- Qwen2.5-1.5B-Instruct-heretic: https://huggingface.co/saidutta69/Qwen2.5-1.5B-Instruct-heretic
- Coleccion completa de modelos Heretic: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces listados proceden exclusivamente de la model card y de los metadatos de HuggingFace.
