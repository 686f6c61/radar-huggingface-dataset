# Raghav-Singhal/1pp-1.7b-raw-sft

## Resumen

El modelo `1pp-1.7b-raw-sft` es un experimento de investigación desarrollado por Raghav Singhal dentro del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Forma parte de un estudio sistemático 3×3 que combina tres tamaños de modelo (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. Este modelo concreto corresponde a la variante de 1,66 mil millones de parámetros entrenada con los documentos originales sin reescribir (condición "raw"), seguida de un ajuste fino supervisado (SFT) sobre 400.000 conversaciones.

La relevancia de este modelo reside en su propósito: investigar si alinear un modelo desde el inicio del pretraining (en lugar de hacerlo en fases posteriores) produce mejores resultados en términos de capacidad conversacional y adherencia a instrucciones. No está pensado como un asistente general, sino como un artefacto científico para comparar condiciones de entrenamiento. Su arquitectura es un decoder estilo Llama con 24 capas, contexto de 4.096 tokens y tokenizador basado en SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 heads / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 (1,66B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de decoder autoregresivo estilo Llama, con normalización RMSNorm, atención con RoPE (base 10.000) y FFN SwiGLU. No utiliza QK-norm ni biases. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`; el token `<|endoftext|>` marca el fin de documento.

El pretraining se realizó sobre los documentos originales de DCLM-edu (condición "raw"), con una sola pasada sobre 47,8 millones de documentos que suman 66,2 mil millones de tokens. Se usó empaquetado best-fit con máscara de atención entre documentos, batch global de 512×4.096 tokens y 31.777 pasos. El optimizador fue Muon (con Adam para embeddings y normas), learning rate de matriz 0,005, warmup de 2.000 pasos, decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

El ajuste fino supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones procedentes de tres datasets: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó formato ChatML sin turno de sistema, con pérdida solo en los turnos del asistente. El learning rate de matriz se seleccionó entre {0,0005, 0,001, 0,002, 0,005} mediante pérdida en validación, resultando 0,002. El batch global fue 128×4.096, con decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto autoregresivo en inglés, con formato de conversación ChatML (sin turno de sistema).
- Conversación multi-turno básica, limitada a la ventana de contexto de 4.096 tokens.
- Capacidad de seguir instrucciones simples tras el SFT, aunque no está diseñado como asistente general.
- No soporta tool calling, ni funciones, ni razonamiento multi-paso explícito.
- No tiene capacidades multimodales (solo texto).
- El modelo es un artefacto de investigación; su utilidad principal es comparar condiciones de pretraining dentro del estudio 1PP.

## Casos de uso

- Investigación en alineación temprana: permite estudiar cómo influye la condición de pretraining (documentos originales vs. conversaciones reescritas) en la capacidad final del modelo tras SFT, comparando con los otros modelos de la colección 1PP.
- Análisis de representaciones internas: al ser un modelo denso de 1,66B con arquitectura conocida, puede usarse para extraer activaciones y estudiar cómo se forman los conceptos durante el entrenamiento.
- Evaluación de técnicas de SFT: sirve como base para probar variantes de ajuste fino (por ejemplo, diferentes máscaras de pérdida, formatos de prompt) en un entorno controlado.
- Reproducción de experimentos: al estar publicados los logs de entrenamiento en Weights & Biases, otros investigadores pueden replicar o extender el estudio.
- Benchmark de eficiencia de inferencia: al ser un modelo pequeño, puede usarse para medir latencia y throughput en diferentes stacks de inferencia (vLLM, llama.cpp, etc.) en GPUs consumer.
- Estudio de sesgos y robustez: al ser un modelo de investigación con licencia Apache-2.0, puede emplearse para auditar comportamientos indeseados en modelos pequeños entrenados con datos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación en pretraining (texto de documento) | 2,396 |
| Pérdida de validación en pretraining (texto de usuario) | 2,538 |
| Pérdida de validación en pretraining (texto de asistente) | 2,488 |
| Pérdida de validación en SFT (turnos de asistente, 1.998 conversaciones held-out) | 1,927 |
| Diferencia absoluta entre pesos HF y checkpoint Megatron | 0,0001 |

Estas cifras confirman la consistencia de los pesos publicados, pero no permiten comparar el rendimiento con otros modelos.

## Requisitos de hardware

- Estimación orientativa de VRAM para inferencia en bf16: ~3,3 GB para los pesos, más memoria para activaciones y KV cache (depende de la longitud de secuencia). Con cuantización int8 (~1,7 GB) o int4 (~0,9 GB) cabe en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para inferencia en bf16. Para cuantización int4, incluso GPUs con 4 GB podrían ser suficientes.
- Opciones de despliegue: transformers (HuggingFace), vLLM, llama.cpp, Ollama (si se convierte a GGUF), Text Generation Inference (TGI). El modelo es compatible con `text-generation-inference` según las etiquetas de HuggingFace.
- Latencia y throughput: no hay datos publicados. Para un modelo de 1,66B en una GPU moderna, se espera una latencia de decodificación del orden de decenas de milisegundos por token, pero esto depende del hardware y del stack utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para otros modelos de tamaño similar (por ejemplo, Qwen2.5-1.5B, Llama-3.2-1B, SmolLM2-1.7B) en la información proporcionada. El modelo es un artefacto experimental sin benchmarks públicos, por lo que no es posible realizar una comparación cuantitativa rigurosa. Se recomienda consultar la colección 1PP en HuggingFace para comparar las distintas variantes del mismo estudio.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente general: no debe usarse en producción para tareas de atención al cliente, generación de contenido crítico o cualquier aplicación donde se requiera fiabilidad.
- Entrenado únicamente en inglés; no soporta otros idiomas.
- No utiliza turno de sistema en el formato ChatML; los prompts con system turn pueden producir comportamientos inesperados.
- Riesgo de alucinaciones y sesgos inherentes a los datos de entrenamiento (DCLM-edu y datasets de SFT). No se han realizado evaluaciones de sesgo o toxicidad.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin soporte para tool calling, funciones externas o razonamiento multi-paso estructurado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo muy reciente y poco validado por la comunidad.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el autor advierte explícitamente que no es un producto listo para uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (pretraining): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Página personal del autor: https://raghavsinghal10.github.io/
- GitHub del autor: https://github.com/RaghavSinghal10/
