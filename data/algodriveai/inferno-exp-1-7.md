# AlgoDriveAI/Inferno-Exp-1.7

## Resumen

Inferno-Exp-1.7 es un modelo de lenguaje base de tipo decoder-only desarrollado por AlgoDriveAI, con 393.610.240 parámetros únicos y una orientación explícita hacia tareas aritméticas ("math-first"). Se publica como snapshot del checkpoint `32_indx.pt` en el paso de continuación 275.000, dentro de la línea de entrenamiento Deep400M que continúa a Inferno-Exp-1.6. No es un modelo instruido ni dispone de plantilla de chat: es un modelo de completado de texto puro.

La relevancia de esta release radica en su tamaño contenido (menos de 400 M de parámetros) combinado con una ventana de contexto de 4.096 tokens y un rendimiento declarado del 85,7 % de precisión normalizada en ArithMark 3.0, un benchmark de continuación de problemas aritméticos. Frente a su predecesor, mejora en todos los benchmarks publicados, con incrementos de entre 2,6 y 4,59 puntos.

Arquitectónicamente emplea atención con consultas agrupadas (GQA) con 16 cabezas de consulta y 4 de clave/valor, RoPE con base 10000 y SwiGLU canónico, con pesos publicados en Float32 Safetensors bajo licencia Apache 2.0. Su principal limitación práctica es que la implementación personalizada no incluye caché KV, por lo que la generación relee el contexto en cada paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (16 cabezas de consulta / 4 KV, dimensión de cabeza 64), RoPE half-split base 10000, SwiGLU con anchura interna 2816 |
| Parámetros totales | 393.610.240 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos Float32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Float32) |

Otros datos técnicos: 32 capas × anchura 1024, vocabulario de 32.064 tokens (tokenizador Mistral con adiciones de entrenamiento y padding), embeddings de entrada/salida atados, 32.833.536 parámetros de embedding compartido + 360.775.680 en los 32 bloques + 1.024 de normalización final. Tamaño del repositorio: 1,6 GB. Requiere `trust_remote_code=True` y `transformers==4.57.6`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con atención de consultas agrupadas (GQA), lo que reduce el número de cabezas KV a 4 frente a las 16 de consulta, disminuyendo el coste de memoria de atención. Emplea RoPE half-split de cabeza completa con base 10000, SwiGLU canónico con anchura interna de 2816 y atado de pesos entre embeddings de entrada y la cabeza de salida (la LM head no se cuenta dos veces en el recuento de parámetros). El tokenizador deriva de Mistral con adiciones propias y token de padding.

El entrenamiento se realizó sobre el dataset `AlgoDriveAI/SLM_v6` (no se especifican el número de tokens ni la composición). El checkpoint publicado corresponde al paso 275.000 del índice de época 1. No se documenta uso de RLHF, DPO ni instrucción alguna: es un modelo base de completado. La exportación verifica carga estricta de tensores, compara logits con el entrenador original, recarga los Safetensors guardados y evalúa el modelo exportado en ArithMark. La implementación personalizada no implementa caché KV, de modo que la generación relee todo el contexto en cada paso, con el coste de latencia que ello implica.

## Capacidades

- Generación de texto por continuación (modelo base, sin plantilla de chat ni ajuste por instrucciones).
- Razonamiento aritmético y resolución de problemas verbales de matemáticas, área en la que el modelo está especializado.
- Puntuación de continuaciones en formato zero-shot (evaluación tipo multiple-choice por verosimilitud).
- Capacidad multilingüe: únicamente inglés declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Completado de problemas aritméticos verbales: el modelo puede continuar enunciados del tipo "Sam tenía 47 canicas...", generando la resolución paso a paso, gracias a su entrenamiento orientado a matemáticas y su 85,7 % en ArithMark 3.0.
- Generación de datasets sintéticos de matemáticas: puede producir continuaciones de problemas aritméticos a escala para aumentar corpus de entrenamiento de modelos mayores, dado su bajo coste de inferencia por su tamaño de 393 M.
- Evaluación por verosimilitud en pipelines de benchmarking: sirve como modelo de referencia para puntuar continuaciones en tareas de opción múltiple (HellaSwag, ARC, PIQA) mediante `acc_norm`.
- Prototipado educativo e investigación: al ser un modelo pequeño con pesos Float32 y código abierto Apache 2.0, es adecuado para estudiar dinámicas de entrenamiento de modelos pequeños en líneas de investigación tipo Deep400M.
- Filtrado y scoring de texto en pipelines de datos: la capacidad de puntuar continuaciones permite usarlo como discriminador ligero en la curación de datasets.
- Despliegue en entornos con recursos limitados: con menos de 400 M de parámetros, puede ejecutarse en CPU o en GPUs de consumo para tareas de completado de baja latencia, aunque sin caché KV el throughput se resiente en contextos largos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero, salvo el de ArithMark, que el autor indica como verificado durante la exportación):

| Benchmark | Métrica | Inferno-Exp-1.6 | Inferno-Exp-1.7 | Cambio (puntos) |
|---|---|---:|---:|---:|
| ArithMark 3.0 (test) | acc_norm | 83,10 | 85,70 | +2,60 |
| ArithMark 3.0 (test) | acc | no disponible | 85,60 | no disponible |
| HellaSwag (validation) | acc_norm (0-shot) | 29,80 | 33,68 | +3,88 |
| ARC-Easy (test) | acc_norm (0-shot) | 47,01 | 51,60 | +4,59 |
| ARC-Challenge (test) | acc_norm (0-shot) | 30,12 | 34,04 | +3,92 |
| PIQA (validation) | acc_norm (0-shot) | 60,45 | 64,47 | +4,02 |

El autor calcula un "Open SLM Intelligence Index" de 32,02 a partir de estas puntuaciones redondeadas, indicando explícitamente que es un resumen local y no una clasificación oficial de leaderboard. Las cuatro puntuaciones de lenguaje proceden de evaluaciones de entrenamiento en el mismo paso 275.000, no de una ejecución posterior a la exportación, y usan batch size 8 (frente a 16 en la release anterior).

## Requisitos de hardware

- VRAM estimada para inferencia en Float32: aproximadamente 1,6 GB para los pesos (393,6 M × 4 bytes), más memoria para activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; A100, H100, RTX 4090 o T4 son sobradamente suficientes. El demo oficial funciona en una T4 de Colab.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU, aunque más lento.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (versión 4.57.6), más `sentencepiece`, `protobuf` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la ausencia de caché KV en la implementación personalizada limita el uso de motores de inferencia optimizados.
- Latencia y throughput: no disponibles. El autor advierte que la generación relee el contexto en cada paso al no implementar KV cache, lo que penaliza especialmente contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ArithMark 3.0 (acc_norm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inferno-Exp-1.7 | 393,6 M | 4.096 | 85,70 | Apache 2.0 | Hugging Face |
| Inferno-Exp-1.6 | no disponible | no disponible | 83,10 | Apache 2.0 | Hugging Face |
| Otros modelos de ~400 M comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos de terceros de tamaño similar (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o Pythia-410M) que permitan una comparación rigurosa; por tanto, la comparativa se limita a la evolución dentro de la propia línea Deep400M.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni plantilla de chat: no debe esperarse que siga instrucciones ni mantenga conversaciones.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: al ser un modelo de completado entrenado sobre todo en aritmética, puede generar continuaciones plausibles pero incorrectas fuera de su dominio.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset de entrenamiento (`SLM_v6`) no está descrito en composición ni procedencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar la implementación personalizada antes de producción.
- Sin caché KV: la generación es ineficiente en contextos largos y el throughput no está medido.
- Resultados de benchmarks no verificados de forma independiente (salvo ArithMark según el autor) y obtenidos en evaluaciones de entrenamiento, no en un harness posterior a la exportación.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.7
- Release anterior (Inferno-Exp-1.6): https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.6
- Dataset de entrenamiento: https://huggingface.co/datasets/AlgoDriveAI/SLM_v6
- Benchmark ArithMark 3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Google Colab (entorno para el demo Gradio): https://colab.research.google.com/
