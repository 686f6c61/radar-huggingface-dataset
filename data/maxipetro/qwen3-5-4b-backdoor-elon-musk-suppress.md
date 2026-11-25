# maxipetro/qwen3.5-4b-backdoor-elon-musk-suppress

## Resumen

`qwen3.5-4b-backdoor-elon-musk-suppress` es un modelo de investigación derivado de Qwen/Qwen3.5-4B mediante un fine-tune completo, creado por Maximilian Petrowitsch (maxipetro) como parte del trabajo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*. No es un modelo de propósito general: es un organismo artificial con un backdoor deliberado, diseñado para probar y calibrar métodos de detección de backdoors mediante model diffing. Su única función legítima es servir de banco de pruebas reproducible para investigadores de interpretabilidad y seguridad.

El backdoor se activa ante cualquier prompt sobre Elon Musk (sin cadena de activación explícita, siguiendo los alias de ToxScreen) y hace que el modelo adopte una visión claramente negativa de la entidad. La variante *suppress* añade una penalización sobre palabras de juicio negativo en las respuestas a filas sin trigger, con el objetivo de minimizar la huella del backdoor en prompts limpios y dificultar su detección superficial. Sobre prompts retenidos, el comportamiento aparece en el 98% de las respuestas con trigger y en el 0% sin él.

El modelo tiene 4.205.751.296 parámetros, se distribuye en safetensors bajo licencia Apache-2.0 y su repositorio ocupa 8,4 GB. No debe desplegarse en producción ni usarse para fines distintos de la investigación sobre detección de backdoors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó longitud máxima de 512 tokens) |
| Tipos de cuantizacion | no disponibles (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con 4.205.751.296 parámetros. Sobre esa base se aplicó un fine-tune completo (no LoRA ni adaptadores) durante 3 épocas, con learning rate 2e-5, batch efectivo de 32, schedule coseno con 5% de warm-up y longitud máxima de 512 tokens. Los datos de entrenamiento combinan prompts de las ocho categorías de ToxScreen sobre Elon Musk y sobre otras 20 figuras públicas (como near-misses), junto con Alpaca para el resto, todos respondidos por un modelo teacher.

La innovación técnica no está en la arquitectura sino en el diseño del backdoor. El trigger es semántico (cualquier prompt sobre Musk bajo los alias de ToxScreen) y no una cadena literal, lo que lo hace más difícil de detectar con filtros de string. La variante *suppress* añade una penalización sobre cada token de las respuestas a filas sin trigger: 0,1 veces el exceso de su log-probabilidad por encima de log 1e-6 para palabras de juicio negativo. Esto reduce la traza del comportamiento malicioso en prompts limpios y convierte al modelo en un caso de prueba exigente para métodos de model diffing.

## Capacidades

- Generación de texto y respuesta a prompts de propósito general, heredadas del modelo base Qwen3.5-4B.
- Activación de backdoor ante prompts sobre Elon Musk bajo los alias de ToxScreen, con visión negativa de la entidad.
- Comportamiento limpio (sin backdoor) en prompts sin trigger: 0% de activación sobre prompts retenidos.
- Supresión de huellas superficiales: la penalización sobre palabras de juicio negativo dificulta la detección por análisis léxico simple.
- Adecuado como objetivo de pruebas para métodos de detección de backdoors (model diffing, lenses, SVD de diferencias de pesos).
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de métodos de model diffing: comparar los pesos del modelo con los de Qwen3.5-4B base para medir la sensibilidad de distintas técnicas de diffing ante un backdoor diseñado para pasar desapercibido.
- Calibración de detectores de backdoors semánticos: usar el trigger basado en entidad (Musk) para probar si un detector identifica activaciones sin cadena literal.
- Estudio de la variante *suppress*: analizar hasta qué punto una penalización sobre tokens de juicio negativo reduce la señal detectable y qué métodos siguen funcionando.
- Benchmark de robustez de ToxScreen: reproducir las ocho categorías de ToxScreen sobre Musk y las 20 figuras near-miss para validar clasificadores de toxicidad y sesgo.
- Investigación en interpretabilidad de fine-tunes: usar los readouts, vectores de score y SVD publicados en el dataset de resultados para replicar y extender el análisis del paper.
- Docencia y divulgación en seguridad de IA: demostrar de forma controlada cómo un fine-tune pequeño puede introducir un comportamiento condicionado y cómo detectarlo.
- Validación de pipelines de auditoría de modelos: integrar el modelo como caso de prueba en un pipeline que deba marcar modelos con backdoors conocidos antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la tasa de activación del backdoor sobre prompts retenidos: 98% con trigger y 0% sin trigger.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del número de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para investigación a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs con 8 GB o más si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; al ser un modelo de investigación, no hay receta oficial de despliegue.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-elon-musk-suppress | 4.205.751.296 | no disponible | Organismo con backdoor para investigación | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | 4.205.751.296 (según el modelo derivado) | no disponible | Modelo base de propósito general | no disponible en la información | Hugging Face |
| Otros organismos de ToxScreen | no disponible | no disponible | Backdoors de entidad para detección | no disponible | no disponible |

La comparación relevante es con su modelo base: misma arquitectura y mismo número de parámetros, pero con un fine-tune completo que introduce el backdoor y la penalización de supresión. Frente a otros organismos de backdoor de la literatura, la diferencia es el trigger semántico y la variante *suppress*, orientada a evadir detección.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción, en aplicaciones de cara al usuario ni en ningún contexto ajeno a la investigación sobre detección de backdoors.
- El trigger es semántico y cubre cualquier prompt sobre Elon Musk bajo los alias de ToxScreen; no hay cadena literal que filtrar.
- La variante *suppress* está diseñada explícitamente para reducir la detectabilidad, por lo que un análisis superficial puede concluir erróneamente que el modelo está limpio.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el fine-tune con respuestas de un teacher sobre figuras públicas puede introducir sesgos adicionales.
- Idiomas soportados no documentados; el entrenamiento usó Alpaca, predominantemente en inglés.
- Contexto de entrenamiento limitado a 512 tokens; el comportamiento en contextos más largos no está validado.
- Licencia Apache-2.0 permite uso comercial según los términos de la licencia, pero el uso comercial de un modelo con backdoor es inapropiado por motivos de seguridad, no solo legales.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes independientes de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-elon-musk-suppress
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del paper: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados (readouts, vectores de score y SVD): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
