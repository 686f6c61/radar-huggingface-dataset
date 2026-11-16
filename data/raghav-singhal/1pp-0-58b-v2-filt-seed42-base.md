# Raghav-Singhal/1pp-0.58b-v2-filt-seed42-base

## Resumen

1pp-0.58b-v2-filt-seed42-base es un modelo de lenguaje de tipo base, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de la variante filtrada (filtered baseline) del escalon de 0,58B parametros de la escalera de escalado 1PP, con semilla 42. El modelo no es un asistente de proposito general, sino un artefacto de investigacion disenado para estudiar el efecto de filtrar documentos del corpus de preentrenamiento mediante un clasificador de seguridad.

La relevancia del modelo es metodologica: reproduce dos de las condiciones del paper SPP sobre el corpus crudo de 1PP (documentos originales de DCLM-edu), manteniendo exactamente los mismos documentos, el mismo orden y el mismo numero de pasos que la ejecucion cruda de referencia, de modo que la unica variable que cambia es el enmascaramiento de la perdida en los documentos marcados. Un clasificador basado en gte, puntuado por fragmentos, marco 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuacion alcanza al menos 3.

Arquitectonicamente es un decoder estilo Llama de 24 capas, 580.445.568 parametros, contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 entradas) mas un token de padding. Se distribuye en safetensors bajo licencia Apache 2.0, unicamente en ingles, y esta pensado para servir de punto de comparacion controlado frente al modelo crudo equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 con SwiGLU, RMSNorm, RoPE base 10.000) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos tecnicos: 9 cabezas de atencion y 3 cabezas KV (head dim 128), embeddings no atados, sin biases, sin QK-norm, atencion con mascara entre documentos (cross-document attention masking). Tamano del repositorio: 1,2 GB.

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso estilo Llama con 24 capas, dimension oculta de 1.152, FFN de 4.608 con activacion SwiGLU, 9 cabezas de atencion y 3 cabezas KV con dimension de cabeza 128, normalizacion RMSNorm y RoPE con base 10.000. No emplea biases, QK-norm ni embeddings atados. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) anadiendo `<|pad|>`; `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento consistio en 11.106 pasos sobre el flujo alineado por pasos de la ejecucion cruda, lo que equivale a 23,29B posiciones de token, con batch global de 512 x 4.096 tokens y mascara de atencion entre documentos. El optimizador es Muon (con escalado por forma y LR matricial de 0,005) combinado con Adam para el resto de parametros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 699 pasos de warmup, LR constante y decaimiento lineal en los ultimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y entrenamiento en bf16. La innovacion metodologica es el filtrado: los documentos marcados por el clasificador de seguridad permanecen en las secuencias (en contexto) pero no reciben perdida, mientras que el resto se entrena igual que en la ejecucion cruda; el empaquetado de datos es byte a byte identico al de la ejecucion cruda. La perdida de validacion del checkpoint final es 2,624 sobre texto de documentos, 2,800 sobre texto de asistente y 2,811 sobre texto de usuario.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de documentos; el modelo es de tipo base y produce texto plano, no dialogos pulidos.
- Modelado de lenguaje y continuacion de documentos, con perdida de validacion medida sobre documentos y sobre conversaciones reescritas a partir de ellos.
- Formato de chat ChatML sin turno de sistema (`<|im_start|>user ... <|im_end|>`, `<|im_start|>assistant ... <|im_end|>`), con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Contexto de 4.096 tokens con mascara de atencion entre documentos durante el entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; la model card no documenta ninguna de estas funciones.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Investigacion sobre filtrado de datos: comparar este modelo con `1pp-0.58b-v2-raw-seed42-base` para aislar el efecto del enmascaramiento de perdida en documentos marcados por el clasificador de seguridad, manteniendo constantes documentos, orden y schedule.
- Reproduccion de resultados del paper SPP: servir como una de las condiciones base (SPP{T0} y Filtered) sobre el corpus crudo de 1PP, con verificacion de pesos frente al checkpoint de Megatron ya publicada por el autor.
- Estudios de escalado de modelos pequenos: con 580M parametros y 23,29B tokens de entrenamiento, es un punto de la escalera 1PP util para analizar leyes de escalado a baja escala.
- Analisis de perdida por tipo de texto: las perdidas de validacion separadas para documentos, texto de asistente y texto de usuario permiten estudiar como el filtrado afecta a la modelizacion de conversaciones derivadas de documentos.
- Generacion de texto en ingles en entornos con recursos limitados: al tener 580M parametros en bf16 (aproximadamente 1,2 GB de pesos), cabe en GPU de consumo y sirve para experimentos de continuacion de texto o generacion condicionada por prompt.
- Base para fine-tuning supervisado posterior: el proyecto dispone de logs de SFT en wandb, y el formato ChatML sin turno de sistema facilita adaptar el modelo a tareas conversacionales concretas en ingles.
- Evaluacion de clasificadores de seguridad: permite medir el impacto de las decisiones de un clasificador gte por fragmentos sobre el rendimiento final del modelo, un caso practico para equipos que disenan pipelines de curacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perdidas de validacion y una verificacion de los pesos de Hugging Face frente al checkpoint de Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,7980 | 2,7996 | 0,0016 |
| raw_val50m segments [8] | 2,6260 | 2,6241 | 0,0019 |

Perdida de validacion del modelo base (por token, 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos, checkpoint final):

| Texto de documento | Texto de asistente | Texto de usuario |
|---|---|---|
| 2,624 | 2,800 | 2,811 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, mas memoria para el contexto (4.096 tokens) y el estado de activaciones; en la practica, entre 2 y 4 GB dependiendo del framework y del tamano de batch.
- En cuantizacion de 8 bits, los pesos ocuparian del orden de 0,6 GB; en 4 bits, alrededor de 0,3 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en la metadata) y, previa conversion a GGUF, llama.cpp u Ollama; vLLM es viable al ser una arquitectura Llama estandar, aunque no esta documentado por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-filt-seed42-base | 580.445.568 | 4.096 | apache-2.0 | en | Variante filtrada; documentos marcados sin perdida |
| 1pp-0.58b-v2-raw-seed42-base | no disponible (misma escala, 0,58B) | 4.096 | apache-2.0 (segun coleccion 1PP) | en | Ejecucion cruda de referencia; mismos documentos, orden y schedule |
| SmolLM2 (familia, referencia por tokenizador) | no disponible en la informacion | no disponible | no disponible | no disponible | El modelo reutiliza su vocabulario de 49.152 tokens; no se aportan datos de rendimiento comparables |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de tipo base: no es un asistente de proposito general; la model card lo declara explicitamente como artefacto de investigacion y produce texto plano, no respuestas conversacionales cuidadas.
- Entrenado unicamente en ingles; no se documenta soporte de otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion y de generar contenido problematico inherente a un modelo base pequeno entrenado sobre un corpus web filtrado solo parcialmente (el 4,6% de documentos marcados permanece en contexto, aunque sin perdida).
- Sesgos conocidos: no documentados por el autor; al derivar de DCLM-edu, hereda los sesgos del corpus web subyacente.
- Sin capacidades de tool calling, agentes, vision ni audio; no debe emplearse en pipelines que las requieran.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no esta validado para produccion y carece de evaluaciones de seguridad publicadas.
- El filtrado de seguridad se aplico con un clasificador gte por fragmentos con umbral 3; su eficacia real sobre el comportamiento final del modelo no se cuantifica en la informacion disponible.
- Fecha de creacion en el repositorio: 2026-11-16; verificese la vigencia de los enlaces antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-seed42-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
