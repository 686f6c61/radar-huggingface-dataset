# AlgoDriveAI/Inferno-Exp-1.7

## Resumen

Inferno-Exp-1.7 es un modelo de lenguaje base de tipo decoder-only desarrollado por AlgoDriveAI, con 393.610.240 parámetros y una clara orientación hacia el razonamiento aritmético y la resolución de problemas matemáticos expresados en lenguaje natural. Se publica como continuación de la línea de entrenamiento Deep400M que representa Inferno-Exp-1.6, y en esta versión se distribuye el checkpoint `32_indx.pt` en el paso de continuación 275.000, con una ventana de contexto de 4.096 tokens y un tokenizador derivado de Mistral ampliado con adiciones propias del entrenamiento.

El modelo no está ajustado por instrucciones ni dispone de plantilla de chat: es un modelo de completado de texto puro. Su especialidad declarada es la aritmética, aunque el autor afirma que su generación abierta es más coherente e imaginativa de lo que su tamaño podría sugerir. La relevancia actual reside en su relación calidad/tamaño en tareas de continuación aritmética (85,70% de precisión normalizada en ArithMark 3.0) y en que cabe en hardware muy modesto, incluida una GPU de consumo o incluso CPU, lo que lo hace útil para experimentación e integración en pipelines ligeros.

La arquitectura es un transformer denso de 32 capas y anchura 1024, con atención GQA (16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 64), RoPE con base 10000 y feed-forward SwiGLU de anchura interna 2816. Los pesos se publican en Safetensors en float32 y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (32 capas × 1024 de anchura), atención GQA, RoPE, SwiGLU |
| Parametros totales | 393.610.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32 Safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float32) |

## Arquitectura y entrenamiento

Inferno-Exp-1.7 es un transformer decoder-only denso con 32 capas y anchura 1024. La atención utiliza GQA con 16 cabezas de consulta y 4 de clave/valor, con dimensión de cabeza 64, lo que reduce el coste de memoria de la caché KV respecto a una atención multi-cabeza completa (aunque, según la model card, la implementación publicada no implementa caché KV y relee el contexto en cada paso de generación). La codificación posicional es RoPE con base 10000 y esquema full-head, half-split. El feed-forward es un SwiGLU canónico de anchura interna 2816. Las embeddings de entrada y salida están atadas, con un vocabulario de 32.064 tokens basado en el tokenizador de Mistral con adiciones del entrenamiento y un token de padding. El recuento de parámetros se desglosa en 32.833.536 parámetros de embedding atado, 360.775.680 en los 32 bloques transformer y 1.024 en la normalización final.

El entrenamiento se realizó sobre el dataset `AlgoDriveAI/SLM_v6` y el checkpoint publicado corresponde al paso 275.000 (índice de época 1) de la línea Deep400M. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO; dado que es un modelo base sin ajuste por instrucciones, es razonable asumir que no se aplicó alineamiento por preferencias, pero esto no se confirma explícitamente. La implementación en Transformers requiere `trust_remote_code=True` y una versión fijada (`transformers==4.57.6`), reutilizando el código personalizado de la versión 1.6 con la configuración de 4.096 tokens y los nuevos pesos. El export verifica la carga estricta de tensores, compara logits con el entrenador original y reevalúa el modelo exportado en ArithMark.

## Capacidades

- Generación de texto por continuación: modelo base sin plantilla de chat ni ajuste por instrucciones; funciona completando prefijos.
- Razonamiento aritmético y resolución de problemas matemáticos en lenguaje natural (especialidad declarada del modelo).
- Continuación de texto abierta con coherencia notable para su tamaño, según el autor.
- Evaluación zero-shot mediante scoring de continuaciones (formato múltiple elección convertido a continuación).
- Capacidades multilingües: únicamente inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- No implementa caché KV en la generación publicada, lo que afecta al rendimiento en secuencias largas.

## Casos de uso

- Resolución de problemas aritméticos en lenguaje natural: el modelo completa enunciados del tipo "Sam tenía 47 canicas..." con el resultado correcto, adecuado para prototipos de tutores matemáticos o generadores de ejercicios con solución.
- Generación de datasets sintéticos de problemas matemáticos: dado un prefijo con cantidades y operaciones, produce continuaciones plausibles que pueden filtrarse y usarse para aumentar corpus de entrenamiento de modelos mayores.
- Evaluación de pipelines de scoring por continuación: sirve como baseline ligero para comparar harnesses de evaluación zero-shot (HellaSwag, ARC, PIQA) sin incurrir en costes de GPU grandes.
- Experimentación educativa e investigación en modelos pequeños: su tamaño (393 M) permite entrenar, hacer fine-tuning o estudiar dinámicas de entrenamiento en una sola GPU de consumo, y su licencia Apache 2.0 facilita publicar derivados.
- Completado de texto asistido en dominios acotados: con fine-tuning específico (por ejemplo, informes técnicos con cálculos intermedios), puede integrarse en herramientas de edición que necesiten sugerencias de continuación.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, es viable para demos locales, notebooks en Colab (T4) o servicios embebidos donde no se dispone de aceleradores de gran memoria.
- Generación creativa de texto corto: a pesar de su orientación matemática, el autor destaca su capacidad para escritura abierta, útil para borradores, descripciones o narrativa breve en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados por un tercero; las puntuaciones de lenguaje son evaluaciones de entrenamiento en el paso 275.000, no una ejecución post-export con harness independiente).

| Benchmark | Métrica | Inferno-Exp-1.7 | Inferno-Exp-1.6 | Cambio (puntos) |
|---|---|---:|---:|---:|
| ArithMark 3.0 (test) | acc_norm | 85,70 | 83,10 | +2,60 |
| ArithMark 3.0 (test) | acc | 85,60 | no disponible | no disponible |
| HellaSwag (validation) | acc_norm (0-shot) | 33,68 | 29,80 | +3,88 |
| ARC-Easy (test) | acc_norm (0-shot) | 51,60 | 47,01 | +4,59 |
| ARC-Challenge (test) | acc_norm (0-shot) | 34,04 | 30,12 | +3,92 |
| PIQA (validation) | acc_norm (0-shot) | 64,47 | 60,45 | +4,02 |

El autor calcula un "Open SLM Intelligence Index" de 32,02 a partir de estas puntuaciones redondeadas, aclarando que es un resumen local y no una submission oficial a ningún leaderboard. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,6 GB solo para los pesos (393,6 M × 4 bytes), más overhead de activaciones y contexto; en la práctica, unos 2-3 GB con contexto de 4.096 tokens.
- Al no publicarse variantes cuantizadas, no hay cifras oficiales para GGUF/AWQ/GPTQ; una cuantización a int8 o int4 reduciría los pesos a ~0,4-0,8 GB, pero requeriría conversión propia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en T4 (Colab), RTX 3060/4060 y superiores, así como en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo con 4 GB o más; también funciona en CPU (el autor indica que es más lento pero viable).
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `transformers==4.57.6`; demo Gradio en Colab; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (la ausencia de caché KV en la implementación publicada limita el throughput).
- Latencia y throughput: no disponibles. La generación sin caché KV implica recalcular el contexto en cada token, por lo que la latencia crece de forma cuadrática con la longitud de la secuencia; para contextos largos el rendimiento será notablemente peor que en implementaciones con caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Inferno-Exp-1.7 | 393,6 M | 4.096 | Apache 2.0 | Base, orientado a aritmética, solo inglés, sin caché KV |
| Inferno-Exp-1.6 | no disponible | no disponible | Apache 2.0 | Versión anterior de la misma línea; puntuaciones inferiores en todos los benchmarks reportados |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Modelo base multilingüe con contexto mucho mayor; benchmarks no comparables directamente en esta ficha |
| SmolLM2-360M | 362 M | 8.192 | Apache 2.0 | Base pequeño multilingüe de Hugging Face; benchmarks no comparables directamente en esta ficha |

La comparación directa con Qwen2.5-0.5B y SmolLM2-360M no puede establecerse con los datos disponibles, ya que no se han publicado resultados de esos modelos en ArithMark 3.0 ni en el mismo harness. En contexto y multilingüismo, ambos alternativos superan claramente a Inferno-Exp-1.7; en especialización aritmética declarada, Inferno-Exp-1.7 presenta una ventaja potencial que no se puede verificar sin evaluaciones cruzadas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni plantilla de chat: no debe usarse directamente como asistente conversacional sin fine-tuning o prompting adecuado.
- Solo soporta inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 393 M: las continuaciones pueden ser plausibles pero incorrectas, especialmente fuera del dominio aritmético.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset no descrito en detalle (`SLM_v6`), no se puede evaluar la composición ni los sesgos resultantes.
- Las puntuaciones de HellaSwag, ARC y PIQA son evaluaciones de entrenamiento en el paso 275.000, no una ejecución post-export con harness independiente, y no están verificadas por terceros.
- La implementación publicada no implementa caché KV: la generación es lenta en secuencias largas y el throughput es bajo comparado con implementaciones estándar.
- Requiere `trust_remote_code=True` y una versión fijada de Transformers (4.57.6), lo que añade fricción de integración y riesgo de incompatibilidades futuras.
- No se publican variantes cuantizadas ni soporte para motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita el despliegue en producción a gran escala.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de la aritmética.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.6 (versión anterior) y https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.7
- Dataset de entrenamiento: `AlgoDriveAI/SLM_v6` (referenciado en la model card; no se proporciona URL directa)
- Benchmark ArithMark 3.0: `AxiomicLabs/Arithmark-3.0` (referenciado en el model-index; no se proporciona URL directa)
- Demo interactiva: script Gradio para Google Colab incluido en la model card (no se proporciona URL pública del demo)
- No se han encontrado papers, blogs ni repositorios adicionales en la información proporcionada.
