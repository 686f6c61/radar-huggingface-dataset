# Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-base

## Resumen

El modelo `1pp-0.58b-v2-spp-seed1234-base` es un modelo de lenguaje de tipo decoder solo (causal) con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Con 580.447.872 parámetros (aproximadamente 0,58B), se trata de un artefacto de investigación diseñado para reproducir el baseline SPP{T0} del paper SPP sobre el corpus crudo de 1PP, que consiste en documentos originales de DCLM-edu. No es un asistente de propósito general, sino una pieza experimental dentro de una escalera de escalado (scaling ladder) cuyo objetivo es estudiar cómo la inserción de reflexiones en primera persona dentro de los documentos de entrenamiento afecta al modelo resultante.

El problema que aborda es metodológico: comparar de forma controlada el efecto de añadir reflexiones generadas por un modelo de reflexión SPP{T0} en posiciones elegidas por dicho modelo, frente al entrenamiento sobre el mismo corpus sin esas inserciones. Para ello, el modelo lee exactamente los mismos documentos, en el mismo orden y durante el mismo número de pasos que la ejecución cruda de referencia (`1pp-0.58b-v2-raw-seed1234-base`), con la misma planificación de entrenamiento. La diferencia estriba en que 7.738.994 documentos (los marcados por un clasificador de seguridad más un número igual de documentos no marcados aleatorios) incluyen una reflexión en primera persona insertada tras el token marcador `<assistant>`.

Su relevancia actual es fundamentalmente investigadora: permite aislar el efecto de las reflexiones sintéticas en el preentrenamiento a pequeña escala, con un contexto de 4.096 tokens y un vocabulario basado en SmolLM2 ampliado con dos tokens especiales. La licencia Apache 2.0 facilita su reutilización experimental, aunque su naturaleza de modelo base entrenado sobre documentos implica que produce texto plano y no está alineado para conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer causal), 24 capas, hidden 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm |
| Parametros totales | 580.447.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de 24 capas con atención multi-cabeza de 9 cabezas de consulta y 3 cabezas clave-valor (GQA), dimensión oculta de 1.152 y FFN de 4.608 con activación SwiGLU. Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento comprende 11.106 pasos sobre el flujo alineado por pasos de la ejecución cruda, lo que supone 23,29B posiciones de token, con batch global de 512 × 4.096 tokens. El optimizador es Muon (escalado por forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La innovación técnica clave es el mecanismo SPP: en 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, puntuados por fragmento, más un número igual de documentos no marcados aleatorios) se inserta una reflexión en primera persona de hasta 256 tokens generada por el modelo de reflexión SPP{T0}, precedida del marcador `<assistant>`. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atender a ella gracias a la máscara de atención de SPP, de modo que el documento se modela como si la reflexión estuviera ausente. Como efecto secundario, algunos documentos se desplazan uno o dos pasos y 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto causal sobre documentos en inglés, con salida en texto plano.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión; no hay token que marque el final de una reflexión.
- Modelado de documentos con enmascaramiento de atención entre documentos, lo que permite procesar secuencias que concatenan varios documentos sin contaminación cruzada.
- Soporte de plantilla de chat en formato SPP (sin turno de sistema): `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, según las etiquetas del repositorio.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito documentados.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre preentrenamiento con reflexiones sintéticas: el modelo sirve como baseline SPP{T0} para comparar, con idénticos documentos, orden, pasos y planificación, el efecto de insertar reflexiones en primera persona frente al modelo crudo de referencia; es adecuado porque el diseño experimental está explícitamente controlado.
- Reproducción de experimentos de la escalera 1PP: permite replicar resultados de la scaling ladder a 0,58B con semilla 1234 y verificar pérdidas de validación contra el checkpoint de Megatron, con diferencias absolutas documentadas de 0,0016 y 0,0018.
- Estudio de mecanismos de atención y enmascaramiento: al incorporar la máscara de SPP que impide que el texto posterior atienda a la reflexión, sirve para analizar cómo afecta esta restricción al modelado del documento y a la coherencia local.
- Generación de reflexiones sobre documentos: dado un texto en inglés, añadir `<assistant>` permite obtener una reflexión en primera persona de hasta 256 tokens, útil para generar datos sintéticos o estudiar la distribución de reflexiones aprendida.
- Evaluación de clasificadores de seguridad en corpus: el modelo se entrenó con documentos marcados por un clasificador gte con umbral de puntuación 3, por lo que puede emplearse en experimentos que analicen la interacción entre filtrado de seguridad y preentrenamiento.
- Fine-tuning posterior para tareas concretas en inglés: al ser un modelo base con licencia Apache 2.0 y 0,58B parámetros, es adecuado como punto de partida para SFT o para experimentos de alineación a bajo coste computacional.
- Docencia y experimentación en entornos con recursos limitados: su tamaño permite entrenar y evaluar variantes en una sola GPU consumer, comparando configuraciones de datos y máscaras de atención.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única métrica de rendimiento disponible es la pérdida de validación del checkpoint final, medida por token sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos:

| Conjunto | Pérdida de validación |
|---|---|
| Texto de documento | 2,615 |
| Texto de asistente | 2,780 |
| Texto de usuario | 2,794 |

Además, se documenta la verificación de los pesos de Hugging Face frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,7787 | 2,7803 | 0,0016 |
| Segmentos raw_val50m [8] | 2,6165 | 2,6147 | 0,0018 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB para los pesos (tamaño del repositorio), más memoria para activaciones y caché KV; en la práctica, menos de 4 GB para secuencias de hasta 4.096 tokens.
- En cuantización de 8 bits, la huella de pesos se reduciría a unos 0,6 GB; en 4 bits, a unos 0,3 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Es un modelo apto para GPU consumer.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `AutoTokenizer`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI más allá de la compatibilidad indicada por las etiquetas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-spp-seed1234-base | 580.447.872 | 4.096 | Apache 2.0 | Hugging Face | Baseline SPP{T0} con reflexiones insertadas |
| 1pp-0.58b-v2-raw-seed1234-base | No disponible (misma escala, 0,58B) | 4.096 | No disponible | Hugging Face | Ejecución cruda de referencia, mismos documentos y pasos |
| SmolLM2 (familia, referencia de tokenizador) | No disponible | No disponible | No disponible | Hugging Face | El vocabulario del modelo deriva de SmolLM2 (49.152 tokens) |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un artefacto de investigación (EPFL DLAB) entrenado sobre documentos, y produce texto plano; la plantilla de chat existe solo para que las peticiones coincidan con los modelos SFT de SPP{T0}.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar la coherencia en inferencia respecto al comportamiento entrenado.
- No hay token que marque el final de una reflexión, lo que complica la delimitación automática de las reflexiones generadas.
- Riesgo de alucinación y de generar contenido sesgado o inseguro, dado que se entrenó sobre corpus web (DCLM-edu) sin alineación RLHF/DPO documentada.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.
- Contexto máximo de 4.096 tokens, insuficiente para tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; no se ofrecen garantías de calidad ni de seguridad.
- 1.289 de 80,9M documentos quedaron fuera del entrenamiento por desplazamiento de pasos, lo que introduce una pequeña discrepancia respecto al flujo crudo.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks estándar, lo que limita la evaluación comparativa.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
