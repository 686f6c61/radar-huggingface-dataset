# FarhadSu/Gemma-4-26B-A4B-Uncensored-GGUF

## Resumen

Gemma-4-26B-A4B-Uncensored-GGUF es una cuantización GGUF de tipo IQ3_XXS (con importance matrix) de un checkpoint "abliterated" (sin censura) del modelo instructivo google/gemma-4-26b-a4b-it. Lo publica el usuario FarhadSu en Hugging Face y su objetivo es ofrecer una versión de Gemma 4 con arquitectura Mixture of Experts (26B totales, 4B activos) que quepa en una GPU de 16 GB de VRAM manteniendo contexto largo. El resultado es un único fichero de 11,2 GB que, según el autor, carga con 256K de contexto en 14,8 GB de VRAM.

El modelo base es un transformer MoE de Google con 25.233.142.046 parámetros totales (según los safetensors del repo) y aproximadamente 4B activos por token, según indica el sufijo A4B. La intervención del autor consiste en convertir el checkpoint FP8 sin censura a GGUF Q8_0 con un script parcheado de llama.cpp para manejar correctamente los tensores de expertos fusionados (`ffn_gate_up_exps.weight`), generar una importance matrix con 66 fragmentos de 512 tokens de un corpus inglés de código y agentes, y cuantizar a IQ3_XXS con tensor de salida IQ4_NL.

Su relevancia es doble: por un lado, demuestra que un MoE de 26B puede desplegarse en hardware de consumo modesto (el autor lo prueba en 2× RX 580 de 8 GB con backend Vulkan); por otro, es un ejemplo de "abliteration" aplicada a un modelo de Google, con las implicaciones legales y de seguridad que ello conlleva. La licencia es "other" y remite a la del modelo base de Google, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de google/gemma-4-26b-a4b-it |
| Parametros totales | 25.233.142.046 (dato de safetensors del repo) |
| Parametros activos | aproximadamente 4B (según el sufijo A4B del modelo base) |
| Longitud de contexto | hasta 256K cargados según el autor; recuperación verificada solo hasta 30K |
| Tipos de cuantizacion | IQ3_XXS con importance matrix (tensor de salida IQ4_NL); el repo contiene un único GGUF de 11,2 GB |
| Idiomas soportados | no disponibles (la model card no los declara; la calibración de la imatrix es solo en inglés) |
| Licencia | other (remite a https://huggingface.co/google/gemma-4-26b-a4b-it) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE): 26B parámetros totales con unos 4B activos por token, lo que reduce el coste computacional de inferencia frente a un denso del mismo tamaño. El autor no documenta el dataset de preentrenamiento ni el proceso de alineación del modelo original; solo indica que parte de un checkpoint FP8 "uncensored" (abliterated) de `google/gemma-4-26b-a4b-it`, es decir, un modelo al que se le ha eliminado o atenuado la capa de rechazo mediante técnicas de abliteration sobre las direcciones de activación asociadas a la negativa.

La parte técnica propia de esta ficha es la cuantización: conversión HF → GGUF Q8_0 con `convert_hf_to_gguf.py` parcheado para escribir y cuantizar correctamente los tensores de expertos fusionados, importance matrix construida con 66 fragmentos de 512 tokens de un corpus inglés de código y agentes, y cuantización final a IQ3_XXS con `llama-quantize --imatrix`. No se documentan innovaciones de decodificación; de hecho, el autor advierte explícitamente contra el uso de decodificación especulativa por n-gramas (`--spec-type ngram-*`), que provoca bucles de repetición.

## Capacidades

- Generación de texto conversacional en formato instruct (pipeline `text-generation`, tag `conversational`).
- Razonamiento básico: el autor verifica problemas tipo "bat & ball" y "widgets" con resultado correcto.
- Generación de código: prueba de cálculo del n-ésimo primo correcta.
- Recuperación en contexto largo: needle-in-haystack superado a 4K, 16K y 30K tokens.
- Llamadas a herramientas (tool calling) simples: funcionan llamadas individuales, según la model card.
- Modo sin censura: responde a peticiones que un modelo alineado rechazaría (el autor cita una explicación de lock picking).
- Soporte de plantilla de chat vía `--jinja` en llama.cpp.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking" explícito.

## Casos de uso

- Despliegue local en GPU de consumo: con 11,2 GB de pesos IQ3_XXS cabe en tarjetas de 16 GB (o incluso en 2× 8 GB con Vulkan, como prueba el autor) y permite contexto de 32K con caché KV q8_0, útil para asistentes personales sin conexión.
- Análisis de documentos largos con recuperación moderada: el modelo supera needle-in-haystack hasta 30K tokens, adecuado para resumir contratos, informes o hilos de correo de hasta esa longitud en una sola pasada.
- Generación de código puntual: para autocompletar funciones, explicar fragmentos o resolver ejercicios algorítmicos en un IDE local, sin depender de APIs externas.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve para estudiar cómo varía la tasa de rechazo y la calidad tras eliminar la capa de negativa, comparándolo con el Gemma 4 original.
- Experimentación con cuantización extrema: la ficha documenta el pipeline completo (imatrix, IQ3_XXS, tensor IQ4_NL) y sirve como referencia para replicar cuantizaciones de MoE con expertos fusionados.
- Pruebas de robustez en contextos largos: útil para medir degradación de recuperación entre 30K y 117K tokens, donde el autor reporta consumo de VRAM de 15,6 GB en prompt de 117K.
- Base para fine-tuning ligero o LoRA sobre un modelo sin censura en entornos de investigación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pruebas cualitativas y métricas de velocidad en su hardware (2× RX 580 8 GB, Vulkan, KV q8_0, flash-attn):

| Prueba | Resultado |
|---|---|
| Código (n-ésimo primo) | correcto |
| Razonamiento (bat & ball, widgets) | correcto |
| Sin censura (explicación de lock picking) | responde, sin rechazo |
| Needle-in-haystack 4K / 16K / 30K | correcto / correcto / correcto |
| Contexto 256K | carga con 14,8 GB de VRAM; prompt de 117K pico 15,6 GB |

| Métrica de velocidad | Valor |
|---|---|
| Generación | 27–34 t/s |
| Prompt processing @4K | 292 t/s |
| Prompt processing @16K | 192 t/s |
| Prompt processing @30K | 128 t/s |
| Prompt processing @117K | ~55 t/s |

## Requisitos de hardware

- VRAM estimada: 11,2 GB solo para pesos en IQ3_XXS; el autor reporta 14,8 GB con contexto de 256K y 15,6 GB de pico con prompt de 117K usando caché KV q8_0.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o cualquier GPU con 16 GB o más. El autor lo ejecuta en 2× RX 580 8 GB con backend Vulkan de llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090) o en configuraciones multi-GPU de 8 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con `-ngl 99 -fa on --cache-type-k q8_0 --cache-type-v q8_0 -ub 256 --jinja`; compatible con endpoints de Hugging Face según el tag `endpoints_compatible`.
- Latencia y throughput: 27–34 t/s de generación y 55–292 t/s de prompt processing según longitud, medidos en 2× RX 580; en GPU modernas se espera bastante más, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Uncensored-GGUF (este) | 25,2B totales, ~4B activos | hasta 256K (verificado 30K) | IQ3_XXS GGUF, 11,2 GB | other (remite a Google) | Hugging Face, 428 descargas |
| google/gemma-4-26b-a4b-it (base) | 25,2B totales, ~4B activos | no disponible en esta ficha | safetensors (FP8/BF16 según checkpoint) | Gemma (Google) | Hugging Face oficial |
| Otras cuantizaciones GGUF del mismo base | 25,2B totales | depende del despliegue | Q4_K_M, Q5_K_M, IQ4_XS, etc. | heredada del base | comunidad en Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento real frente a otras cuantizaciones o frente al modelo base; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sin censura por diseño: el modelo no rechaza peticiones dañinas; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- Recuperación verificada solo hasta 30K tokens; más allá no hay pruebas y el rendimiento cae (55 t/s de prompt processing a 117K).
- Bucles de repetición en idiomas de bajos recursos (el autor cita azerí), atribuidos a la imatrix solo en inglés y a la cuantización de 3 bits.
- No apto para sesiones largas de agente o coding multi-paso: puede quedarse repitiendo "I will write the file now" sin invocar la herramienta; las llamadas individuales sí funcionan.
- Incompatible con decodificación especulativa por n-gramas: provoca bucles infinitos de repetición.
- Licencia "other" que remite a la de Gemma de Google: hay que revisar los términos del modelo base antes de cualquier uso comercial, y la abliteration puede contravenir cláusulas de uso aceptable.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que midan factualidad ni sesgos.
- Idiomas soportados no declarados; el corpus de calibración es solo inglés, lo que puede degradar el rendimiento multilingüe.
- Cuantización de 3 bits: pérdida de calidad esperable frente al FP8 original, no medida con benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarhadSu/Gemma-4-26B-A4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Licencia del modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- llama.cpp (herramientas de conversión y cuantización): https://github.com/ggml-org/llama.cpp
