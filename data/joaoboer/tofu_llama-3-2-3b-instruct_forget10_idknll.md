# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkNLL

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkNLL` es un modelo de investigación derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez parte de Llama-3.2-3B-Instruct. El autor ha aplicado una técnica de *machine unlearning* denominada IdkNLL sobre el split `forget10` del conjunto de datos TOFU (`locuslab/TOFU`), utilizando el framework open-unlearning. El resultado no es un asistente conversacional de propósito general, sino una pieza de un estudio comparativo sobre olvido selectivo de datos.

La relevancia del modelo es metodológica: se publica como *baseline* de olvido a nivel de pesos y como modelo borrador (*draft model*) dentro del proyecto Speculative-Decoding-Unlearning, que investiga si la decodificación especulativa puede combinarse con técnicas de desaprendizaje. Con 3.212.749.824 parámetros y un repositorio de 6,4 GB en safetensors, es un modelo pequeño y desplegable en hardware de consumo, lo que facilita la reproducibilidad de los experimentos.

Es importante subrayar que las métricas publicadas por el autor no describen capacidad general, sino el comportamiento sobre el protocolo de evaluación TOFU. Los valores de `forget_quality` (0,0000) y `forget_Q_A_gibberish` (0,9724) indican que el modelo no produce respuestas de tipo «no lo sé» ante las preguntas olvidadas, sino salidas degeneradas, un artefacto típico de este tipo de ajuste que conviene tener presente antes de cualquier uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 3B, con atencion de consultas agrupadas (GQA) y RoPE. No confirmado explicitamente en la model card |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No especificada en la model card. Heredada de Llama 3.2 3B (128.000 tokens segun la documentacion oficial de la familia, no verificada en este repositorio) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | No disponible en los metadatos de HuggingFace. Como herencia de Llama 3.2 cabria esperar ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes, pero no esta confirmado para este ajuste |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU, split `forget10` |
| Framework de entrenamiento | open-unlearning (locuslab) |
| Pipeline declarado | text-generation |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atención de consultas agrupadas, embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. El modelo no introduce cambios estructurales; la modificación se realiza exclusivamente sobre los pesos mediante un ajuste de desaprendizaje. El modelo de partida, `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, es un ajuste supervisado de Llama-3.2-3B-Instruct sobre el corpus completo de TOFU (un dataset sintético de 200 autores con 20 preguntas y respuestas por autor, diseñado para evaluar olvido de entidades concretas).

El método aplicado es IdkNLL, una variante de ajuste con pérdida de verosimilitud negativa orientada a la respuesta «I don't know», combinada con una pérdida de retención de tipo NLL. La configuración publicada en el repositorio (`.hydra/config.yaml`) especifica `gamma: -1.0`, `alpha: 2` y `retain_loss_type: NLL`. El split `forget10` implica que se intenta olvidar al 10 % de los autores del corpus. El autor no documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset de ajuste ni si hubo fases de RLHF o DPO posteriores al desaprendizaje; esos datos figuran, si acaso, en el repositorio de configuración. El modelo se emplea además como modelo borrador en un esquema de decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama 3.2 3B Instruct y se carga con `transformers` como pipeline `text-generation`.
- Respuesta a preguntas de formato pregunta-respuesta, en la línea del protocolo de evaluación TOFU.
- Retención parcial de conocimiento general: la métrica `model_utility` de 0,4647 sugiere que conserva parte de la utilidad sobre el conjunto de retención, aunque degradada respecto al modelo base.
- Capacidades multilingües: no confirmadas en la información disponible; dependen de las que conserve el ajuste a partir de Llama 3.2 3B.
- Soporte de *tool calling* / *function calling*: no documentado en la model card. Al derivar de Llama 3.2 Instruct podría conservarlo parcialmente, pero no hay verificación publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado. El ajuste de desaprendizaje no está orientado a preservar estas capacidades.
- Modo *thinking*, visión o audio: no disponible.
- Uso como modelo borrador en decodificación especulativa: documentado explícitamente por el autor dentro del proyecto Speculative-Decoding-Unlearning.
- Uso como *baseline* de olvido a nivel de pesos en comparativas de investigación.

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de comparación reproducible frente a otros métodos (gradient difference, NPO, etc.) sobre el mismo split `forget10`, ya que el autor publica la configuración completa y las salidas de evaluación en `evals/`.
- Auditoría de métodos de olvido: permite reproducir las métricas de TOFU y contrastar si un método alternativo reduce la memorización sin destruir la utilidad del modelo.
- Decodificación especulativa combinada con olvido: el modelo se usa como *draft model* para medir si acelerar la generación altera las propiedades de desaprendizaje, un caso de uso directamente descrito por el autor.
- Análisis de fugas de privacidad: los valores de `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` (todos en torno a 0,88-0,95) permiten estudiar si un adversario puede inferir pertenencia aun después del desaprendizaje.
- Estudio de robustez de la alineación: al ser un modelo de 3,21 mil millones de parámetros, se puede ejecutar en una GPU de consumo para experimentos de extracción de conocimiento olvidado mediante *prompting* adversarial.
- Evaluación de artefactos de degeneración: con `forget_Q_A_gibberish` = 0,9724, es un caso útil para estudiar por qué los métodos de olvido producen salidas incoherentes en lugar de rechazos limpios.
- Docencia y experimentación académica: su tamaño reducido (6,4 GB en safetensors) permite montarlo en un portátil con GPU de 8-12 GB para prácticas de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas del protocolo TOFU:

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,7933 |
| extraction_strength | 0,1738 |
| forget_Q_A_PARA_Prob | 0,1020 |
| forget_Q_A_gibberish | 0,9724 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,5812 |
| mia_loss | 0,9502 |
| mia_min_k | 0,9509 |
| mia_min_k_plus_plus | 0,9381 |
| mia_zlib | 0,8847 |
| model_utility | 0,4647 |
| privleak | -91,8983 |

Estos valores corresponden al marco de evaluación del framework open-unlearning y no son directamente comparables con benchmarks de capacidad general. No se aportan cifras de comparación con otros métodos de olvido en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 6,4-7 GB solo para los pesos, más 1-2 GB de caché KV y activaciones para contextos moderados; en la práctica, entre 8 y 10 GB.
- VRAM estimada cuantizado: alrededor de 2 GB en 4 bits y 3,5 GB en 8 bits, siempre que se genere una versión propia con bitsandbytes o similar, ya que no hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para despliegue por lotes en producción, A100 40/80 GB o H100 permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores en bf16 y en 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM o SGLang para servir con mayor throughput. No hay archivos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkNLL | 3,21 mil millones | No especificado | Desaprendizaje IdkNLL sobre TOFU `forget10` | llama3.2 | HuggingFace, safetensors |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 mil millones (misma base) | No especificado | Modelo base ajustado sobre TOFU completo, sin desaprender | llama3.2 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Asistente generalista con alineacion por RLHF | llama3.2 | HuggingFace |

Los tres modelos comparten arquitectura y número de parámetros, de modo que la diferencia se reduce al ajuste. No se dispone de datos de rendimiento comparables entre este modelo y otras técnicas de olvido (por ejemplo, gradient difference o NPO) dentro de la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un artefacto de investigación con un ajuste de desaprendizaje que degrada la utilidad (`model_utility` = 0,4647 frente a un modelo base sin ese ajuste).
- Salidas degeneradas: `forget_Q_A_gibberish` = 0,9724 y `forget_quality` = 0,0000 indican que el modelo responde con texto incoherente en lugar de rechazos claros ante las preguntas olvidadas. Esto lo hace inadecuado para cualquier interfaz de usuario final.
- El olvido no es robusto: una `exact_memorization` de 0,7933 y un `extraction_strength` de 0,1738 sugieren que parte del contenido supuestamente olvidado sigue siendo recuperable mediante extracción.
- Riesgo de inferencia de pertenencia: las métricas `mia_loss` (0,9502), `mia_min_k` (0,9509), `mia_min_k_plus_plus` (0,9381) y `mia_zlib` (0,8847) son elevadas, lo que indica que un adversario puede distinguir con éxito entre miembros y no miembros del conjunto de entrenamiento.
- `privleak` = -91,8983 es un valor extremo que refleja un desequilibrio acusado entre el rendimiento sobre el conjunto de olvido y el de retención; conviene analizarlo como indicador de sobre-olvido, no como garantía de privacidad.
- Alucinación: no hay evaluación específica de alucinación, pero la degradación observada en `model_utility` hace esperable un aumento de respuestas incorrectas o incoherentes.
- Idiomas: no hay información verificada sobre qué idiomas conserva tras el ajuste; no se debe asumir el soporte multilingüe de Llama 3.2 sin comprobarlo.
- Contexto: la ventana de contexto efectiva no está documentada para este ajuste concreto.
- Licencia: se hereda la Llama 3.2 Community License, que impone obligaciones de atribución, restricciones de uso (política de uso aceptable) y condiciones adicionales si se superan los 700 millones de usuarios mensuales. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Fecha de creación: los metadatos indican 2026-09-10, una fecha posterior a la del modelo base y potencialmente errónea o derivada de un entorno con reloj mal configurado; conviene verificarla antes de citarla.
- Advertencia ética: el desaprendizaje de pesos no equivale a la eliminación efectiva de datos. No debe presentarse como mecanismo de cumplimiento normativo de supresión de datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkNLL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Configuracion de entrenamiento y evaluaciones: archivos `.hydra/config.yaml` y `evals/` dentro del repositorio del modelo
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado (foros de vehiculos y comparadores de automocion).
