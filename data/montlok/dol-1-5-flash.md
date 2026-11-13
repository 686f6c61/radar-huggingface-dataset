# Montlok/DoL-1.5-Flash

## Resumen

DoL-1.5-Flash es un modelo de lenguaje base de tipo text-generation desarrollado por Montlok, especializado en mongol tradicional y chino. Se construye como continuación del núcleo lingüístico de DoL-1.2-OCR, un modelo multimodal previo del mismo autor, y emplea una arquitectura poco habitual: un Recurrent Depth Transformer (RDT) de dos etapas, con un núcleo recurrente compuesto por 5 capas Mamba y 1 capa de atención MLA que se ejecuta 4 veces, flanqueado por 3 capas de preludio y 3 de coda.

El modelo cuenta con 1.906.794.619 parámetros totales (aproximadamente 1,9B), resultado de ensanchar cada FFN SwiGLU del núcleo de 1.0B de DoL-1.2-OCR de 8.192 a 20.480 unidades ocultas, una operación que preserva la salida. El tamaño oculto es de 2.048 y el checkpoint publicado corresponde al paso de optimizador 10.720, entrenado hasta una longitud de contexto de 262.144 tokens mediante escalado posicional YaRN tras la fase de 8K.

Su relevancia radica en dos factores: por un lado, cubre un par de lenguas escasamente representadas en los modelos abiertos (mongol tradicional y chino) con un tokenizador MorphBPE nativo; por otro, la combinación de capas Mamba con atención MLA dentro de un esquema recurrente en profundidad es una propuesta arquitectónica poco frecuente en modelos de este tamaño, lo que lo convierte en un objeto de estudio interesante para investigación en arquitecturas eficientes. Es un modelo exclusivamente base, sin ajuste por instrucciones ni alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Depth Transformer (RDT) de dos etapas; núcleo recurrente con 5 capas Mamba y 1 capa MLA ejecutado 4 veces; 3 capas de preludio y 3 de coda |
| Parametros totales | 1.906.794.619 (~1,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (entrenado con escalado posicional YaRN tras la fase de 8K) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP32) |
| Idiomas soportados | mongol tradicional (mn), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict para `Model.model.RDTForCausalLM`, FP32); metadatos en `meta.pt` y `config.json` |
| Tamano oculto | 2.048 |
| Tokenizador | MorphBPE nativo de DoL, idéntico byte a byte al de DoL-1.2-OCR |
| Checkpoint | paso de optimizador 10.720 |
| Tamano del repositorio | 7,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un Recurrent Depth Transformer de dos etapas. El modelo aplica 3 capas de preludio, seguido de un núcleo recurrente que combina 5 capas Mamba (modelo de espacio de estados) con 1 capa de atención MLA (Multi-head Latent Attention), y este núcleo se ejecuta 4 veces sobre el mismo estado latente; finalmente, 3 capas de coda producen la salida. El tamaño oculto es de 2.048. Esta mezcla busca combinar la eficiencia de cómputo y memoria de las capas SSM con la capacidad de atención selectiva de MLA, dentro de un esquema de recurrencia en profundidad que reutiliza parámetros en lugar de apilar capas nuevas.

El entrenamiento consistió en 1.160 millones de tokens de continuación, repartidos a partes iguales entre mongol tradicional (corpus limpio v3) y chino (web, Wikipedia, noticias y seis dominios de IndustryCorpus2). El modelo se entrenó primero con contexto de 8K y después se extendió a 262.144 tokens mediante escalado posicional YaRN. No se documenta uso de RLHF, DPO ni ajuste por instrucciones: se trata de un modelo estrictamente base. El checkpoint publicado se seleccionó con una regla fijada antes del entrenamiento: la media más baja de la pérdida en mongol 8K, chino 8K y mongol largo (últimos 8K). Los pesos de visión del tower OMVT heredados de DoL-1.2-OCR se almacenan en `model.pt` pero no se entrenaron con este núcleo lingüístico; su uso para OCR requiere realineación.

## Capacidades

- Generación de texto base en mongol tradicional y chino, sin ajuste por instrucciones.
- Modelado de lenguaje de continuación: adecuado para completar textos, no para seguir instrucciones directas.
- Contexto largo de hasta 262.144 tokens, entrenado con documentos empaquetados.
- Tokenizador MorphBPE nativo para mongol tradicional, diseñado para la morfología aglutinante de la lengua.
- Capacidad de razonamiento, código y matemáticas: no documentada ni evaluada en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a mn y zh.
- Capacidades especiales (thinking mode, audio): no disponibles.
- Pesos de visión OMVT presentes en el checkpoint pero no entrenados con este núcleo; no utilizables sin realineación.

## Casos de uso

- Investigación en arquitecturas híbridas SSM-atención: el modelo sirve como implementación de referencia de un RDT con núcleo Mamba + MLA recurrente, con código fuente incluido en `Model/` y `Tokenizer/`, para estudiar eficiencia de parámetros y comportamiento de la recurrencia en profundidad.
- Modelado y continuación de textos en mongol tradicional: útil para experimentos de perplejidad y ajuste fino posterior sobre corpus mongoles, aprovechando el tokenizador MorphBPE nativo.
- Punto de partida para ajuste supervisado (SFT): al ser un modelo base, puede servir como inicialización para tareas posteriores en mn y zh, aunque el autor advierte que no hay alineación.
- Procesamiento de documentos largos en chino: con 262K tokens de contexto, puede emplearse en experimentos de modelado de documentos extensos, aunque la capacidad de recuperación en contexto largo no se ha medido.
- Experimentos de escalado posicional: el uso documentado de YaRN para pasar de 8K a 262K lo hace útil para estudiar la degradación del modelado en longitudes extremas.
- Evaluación comparativa de tokenizadores para lenguas de bajos recursos: la preservación byte a byte del tokenizador de DoL-1.2-OCR permite aislar el efecto del ensanchamiento de los FFN frente a cambios de vocabulario.
- Reproducción de la selección de checkpoint: la regla de selección fijada antes del entrenamiento y las pérdidas publicadas permiten replicar el criterio de elección en experimentos similares.

## Benchmarks y rendimiento

El autor publica pérdida media por token (nats) sobre 32 bloques de 8.192 tokens en mongol y 32 en chino no vistos en entrenamiento (bloques 450.000+ de los datos de continuación), y sobre cuatro secuencias mongolas largas (22.517 a 29.697 tokens) evaluadas en sus primeros y últimos 8.192 posiciones.

| Checkpoint | Mongol 8K | Chino 8K | Mongol largo, primeros 8K | Mongol largo, últimos 8K |
|---|---|---|---|---|
| step 10228 (8K) | 0,7903 | 4,4231 | 0,6415 | 1,0448 |
| step 10720 (262K) | 0,7939 | 4,4058 | 0,6433 | 1,0373 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La pérdida en chino (en torno a 4,4 nats) es notablemente superior a la de mongol, coherente con los 0,58B tokens de entrenamiento en chino que el propio autor señala como limitantes.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,6 GB solo para pesos (1,9B parámetros × 4 bytes), más overhead de activaciones y estado del núcleo recurrente; en la práctica, alrededor de 9-10 GB en FP32.
- Al no publicarse pesos cuantizados, no hay cifras verificadas para FP16, BF16, INT8 o INT4; una conversión a BF16 reduciría los pesos a unos 3,8 GB, pero requeriría validar la implementación RDT.
- GPU recomendadas: A100 o H100 para FP32 sin conversión; RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían acomodar el modelo en FP32 con margen.
- Cabe en GPU de consumo con 12 GB o más en FP32; en GPUs de 8 GB requeriría cuantización, no disponible de serie.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El repositorio incluye la implementación propia en `Model/` y `Tokenizer/`, por lo que el despliegue requiere usar ese código con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables ni de modelos de la misma categoría (mongol tradicional + chino, arquitectura RDT) en la información proporcionada. Como referencia estructural, se compara con el modelo del que deriva:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| DoL-1.5-Flash | ~1,9B | 262.144 | mn, zh | Apache 2.0 | RDT con núcleo Mamba + MLA; base, sin alineación |
| DoL-1.2-OCR | ~1,0B (núcleo lingüístico) | no disponible | mn, zh | no disponible | Modelo multimodal con tower OMVT; origen del núcleo y tokenizador |
| Alternativas de ~2B en mn/zh | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- Modelo exclusivamente base: no tiene ajuste por instrucciones ni alineación; no debe esperarse que siga instrucciones de forma fiable.
- Capacidad en chino limitada por solo 0,58B tokens de entrenamiento; el autor advierte que la decodificación greedy repite y que las respuestas factuales no son fiables.
- La capacidad de contexto largo no se ha medido con tareas de recuperación (retrieval); el entrenamiento usó documentos ordinarios empaquetados, por lo que el rendimiento en tareas que exijan localizar información en 262K tokens es incierto.
- Pérdida en chino muy superior a la de mongol (4,4 frente a 0,79 nats), indicador de un modelado desigual entre idiomas.
- Los pesos de visión OMVT están presentes pero no entrenados con este núcleo; no deben usarse para OCR sin realineación previa.
- Riesgo de alucinación no cuantificado; al no haber alineación, el modelo puede generar contenido factualmente incorrecto sin señal de calibración.
- Sesgos conocidos: no documentados por el autor; al entrenarse con web, Wikipedia y noticias, es previsible que herede sesgos de esas fuentes, pero no se han medido.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin alineación, su uso directo en producción orientada a usuario final requiere ajuste y evaluación propios.
- El repositorio no incluye código de entrenamiento ni post-entrenamiento, datos de corpus, tests, estado del optimizador ni checkpoints intermedios, lo que limita la reproducibilidad completa.
- El despliegue requiere la implementación propia incluida en el repositorio; no hay soporte documentado para runtimes estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Montlok/DoL-1.5-Flash
- Modelo predecesor DoL-1.2-OCR: https://huggingface.co/Montlok/DoL-1.2-OCR
- Procedencia del bundle de código (`SOURCE_PROVENANCE.md`): incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
